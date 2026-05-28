# Lip Sync AI in React Native — Build Guide

**Stack:** Azure Speech (free tier) for TTS + visemes → 3D character with blend shapes via `react-three-fiber` → audio playback synced to viseme timeline.

**Result:** You pass an English string. A 3D half-human head speaks it with lip movements that match the audio.

---

## 1. Architecture overview

```
[English text]
     │
     ▼
[Your backend / Azure SDK]  ──► returns:  audio.mp3  +  visemes[]
     │
     ▼
[React Native app]
     ├── plays audio (react-native-sound or expo-av)
     └── runs 3D scene (@react-three/fiber/native + three.js)
              └── on each frame, picks current viseme from timeline
                  and sets morphTargetInfluences on the head mesh
```

Two reasons to do TTS+viseme generation on a **backend** (Node.js or serverless) rather than directly in the RN app:

1. The Azure Speech JS SDK is built for browsers/Node, not React Native. Running it on a server is the path of least resistance.
2. You don't want to ship your Azure key inside the app bundle.

---

## 2. Azure free tier — what you get

- **F0 (free) tier**: 0.5 million characters/month of Neural TTS, free forever.
- Sign up: https://azure.microsoft.com/free/ — credit card required but F0 itself is free.
- Create resource: portal.azure.com → "Speech service" → pricing tier **Free F0**.
- You get: a **key** and a **region** (e.g. `eastus`). Both are needed by the SDK.

Viseme events are returned for free as part of the synthesis stream — no extra cost.

---

## 3. Backend: text → audio + visemes

Minimal Node.js endpoint. Deploy anywhere (Vercel function, Render, Fly, a Raspberry Pi — anywhere your RN app can hit over HTTPS).

```bash
npm install microsoft-cognitiveservices-speech-sdk express
```

```js
// server/tts.js
const express = require('express');
const sdk = require('microsoft-cognitiveservices-speech-sdk');

const app = express();
app.use(express.json());

app.post('/speak', async (req, res) => {
  const { text } = req.body;

  const speechConfig = sdk.SpeechConfig.fromSubscription(
    process.env.AZURE_SPEECH_KEY,
    process.env.AZURE_SPEECH_REGION,
  );
  speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';
  speechConfig.speechSynthesisOutputFormat =
    sdk.SpeechSynthesisOutputFormat.Audio24Khz48KBitRateMonoMp3;

  const visemes = [];
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

  synthesizer.visemeReceived = (_s, e) => {
    // audioOffset is in 100-nanosecond ticks → convert to ms
    visemes.push({ visemeId: e.visemeId, offsetMs: e.audioOffset / 10000 });
  };

  synthesizer.speakTextAsync(
    text,
    result => {
      synthesizer.close();
      if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
        res.json({
          audioBase64: Buffer.from(result.audioData).toString('base64'),
          visemes,
        });
      } else {
        res.status(500).json({ error: result.errorDetails });
      }
    },
    err => {
      synthesizer.close();
      res.status(500).json({ error: err.toString() });
    },
  );
});

app.listen(3000);
```

**Azure viseme IDs:** 0–21. Mapping to mouth shapes is documented at:
https://learn.microsoft.com/azure/ai-services/speech-service/how-to-speech-synthesis-viseme

A practical mapping to common ARKit blend shapes is in §6 below.

---

## 4. React Native: install 3D dependencies

This is the tricky part. `react-three-fiber` runs in React Native via `@react-three/fiber/native` + `expo-gl` + `expo-three`. It works on bare RN (no Expo SDK required) but you must wire up the GL bindings.

```bash
yarn add three @react-three/fiber expo-gl expo-asset
yarn add react-native-sound  # or expo-av if you prefer
```

For bare React Native 0.85 you also need:

```bash
yarn add expo expo-modules-core
npx install-expo-modules@latest
```

Then run pod install:

```bash
cd ios && pod install && cd ..
```

> **Heads-up:** GLB loading on RN does not use the standard `GLTFLoader` from three — you need to load via `expo-asset` and feed the parsed buffer to three's loader. See §5.

---

## 5. The character model

You need a 3D head with **blend shapes** (a.k.a. morph targets, a.k.a. shape keys) for visemes. Two practical sources:

**(a) Ready Player Me** — free avatar generator. Their `.glb` files include ARKit blend shapes (`viseme_aa`, `viseme_E`, `viseme_I`, `viseme_O`, `viseme_U`, `viseme_PP`, `viseme_FF`, `viseme_TH`, `viseme_DD`, `viseme_kk`, `viseme_CH`, `viseme_SS`, `viseme_nn`, `viseme_RR`, `viseme_sil`). This is the easiest path. Generate at https://readyplayer.me/ → download GLB → drop in `assets/`.

**(b) Custom model** — Blender or Maya. Author 15 ARKit-compatible viseme shape keys. Export GLB with morph targets enabled.

Drop the file at `assets/avatar.glb`. Then load it:

```tsx
// src/screens/lipsync/Avatar.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber/native';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Asset } from 'expo-asset';
import * as THREE from 'three';

type VisemeFrame = { visemeId: number; offsetMs: number };

export function Avatar({
  visemes,
  startedAtMs,
}: {
  visemes: VisemeFrame[];
  startedAtMs: number | null;
}) {
  const [gltf, setGltf] = useState<any>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    (async () => {
      const asset = Asset.fromModule(require('../../../assets/avatar.glb'));
      await asset.downloadAsync();
      const loader = new GLTFLoader();
      loader.load(asset.localUri || asset.uri, scene => {
        setGltf(scene);
        scene.scene.traverse((o: any) => {
          if (o.isMesh && o.morphTargetDictionary) {
            meshRef.current = o;
          }
        });
      });
    })();
  }, []);

  useFrame(() => {
    if (!meshRef.current || !startedAtMs) return;
    const now = Date.now() - startedAtMs;
    const current = pickVisemeAt(visemes, now);
    applyViseme(meshRef.current, current);
  });

  if (!gltf) return null;
  return <primitive object={gltf.scene} />;
}
```

`pickVisemeAt` and `applyViseme` are in §6.

---

## 6. Viseme timeline → blend shape influences

The core idea: every frame, find which viseme is "active" given elapsed time, and smoothly drive that morph target to 1.0 while easing all others back to 0.

```ts
// src/screens/lipsync/visemes.ts
import * as THREE from 'three';

// Azure viseme ID → Ready Player Me / ARKit blend shape name
export const AZURE_TO_RPM: Record<number, string> = {
  0: 'viseme_sil',
  1: 'viseme_aa',   // æ, ə, ʌ
  2: 'viseme_aa',   // ɑ
  3: 'viseme_O',    // ɔ
  4: 'viseme_E',    // ɛ, ʊ
  5: 'viseme_RR',   // ɝ
  6: 'viseme_I',    // j, i, ɪ
  7: 'viseme_U',    // w, u
  8: 'viseme_O',    // o
  9: 'viseme_aa',   // aʊ
  10: 'viseme_O',   // ɔɪ
  11: 'viseme_I',   // aɪ
  12: 'viseme_kk',  // h
  13: 'viseme_RR',  // r
  14: 'viseme_nn',  // l
  15: 'viseme_SS',  // s, z
  16: 'viseme_CH',  // ʃ, tʃ, dʒ, ʒ
  17: 'viseme_TH',  // ð
  18: 'viseme_FF',  // f, v
  19: 'viseme_DD',  // d, t, n, θ
  20: 'viseme_kk',  // k, g, ŋ
  21: 'viseme_PP',  // p, b, m
};

const ALL_SHAPES = Array.from(new Set(Object.values(AZURE_TO_RPM)));

export function pickVisemeAt(
  visemes: { visemeId: number; offsetMs: number }[],
  elapsedMs: number,
) {
  // Binary search would be faster; linear is fine for short utterances.
  let active = visemes[0];
  for (let i = 0; i < visemes.length; i++) {
    if (visemes[i].offsetMs <= elapsedMs) active = visemes[i];
    else break;
  }
  return active;
}

const SMOOTHING = 0.25; // 0 = instant, 1 = never moves

export function applyViseme(mesh: THREE.Mesh, current: { visemeId: number }) {
  const dict = (mesh as any).morphTargetDictionary as Record<string, number>;
  const influences = (mesh as any).morphTargetInfluences as number[];
  if (!dict || !influences) return;

  const targetName = AZURE_TO_RPM[current.visemeId] ?? 'viseme_sil';

  for (const name of ALL_SHAPES) {
    const idx = dict[name];
    if (idx == null) continue;
    const target = name === targetName ? 1 : 0;
    influences[idx] = influences[idx] + (target - influences[idx]) * (1 - SMOOTHING);
  }
}
```

The smoothing is what turns sharp frame-to-frame jumps into a believable mouth. Tune `SMOOTHING` between 0.15–0.35 — lower = snappier, higher = mushier.

---

## 7. Wiring it all together

```tsx
// src/screens/lipsync/LipSyncScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs'; // yarn add react-native-fs
import { Avatar } from './Avatar';

const API = 'https://your-backend.example.com/speak';

export default function LipSyncScreen() {
  const [text, setText] = useState('Hello, I can move my lips.');
  const [visemes, setVisemes] = useState<any[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const speak = async () => {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const { audioBase64, visemes } = await res.json();

    const path = `${RNFS.CachesDirectoryPath}/speech.mp3`;
    await RNFS.writeFile(path, audioBase64, 'base64');

    setVisemes(visemes);

    const sound = new Sound(path, '', err => {
      if (err) return console.error(err);
      setStartedAt(Date.now());
      sound.play(() => sound.release());
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Canvas camera={{ position: [0, 1.6, 0.6], fov: 30 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[1, 2, 1]} intensity={1} />
        <Avatar visemes={visemes} startedAtMs={startedAt} />
      </Canvas>
      <TextInput
        value={text}
        onChangeText={setText}
        style={{ borderWidth: 1, padding: 8, margin: 8 }}
      />
      <Button title="Speak" onPress={speak} />
    </View>
  );
}
```

Register it in [src/navigation/index.tsx](src/navigation/index.tsx) the same way your existing screens are registered.

---

## 8. Common pitfalls

- **Black canvas, no model:** GLB loaded but no mesh found. Verify the model actually has morph targets — open it in https://gltf-viewer.donmccurdy.com/ and check "Morph Targets" in the inspector.
- **Mouth doesn't move:** Log `mesh.morphTargetDictionary` after load. If the names don't match the keys in `AZURE_TO_RPM`, your model uses a different naming convention — adjust the map.
- **Audio plays before mouth moves (or vice versa):** Latency between `sound.play()` callback firing and the first audio sample is real. Calibrate by adding a constant offset (try +60ms to `elapsedMs`) and ear-tune.
- **Janky animation:** `useFrame` runs on the JS thread on RN. Keep `applyViseme` cheap. If still janky, throttle to 30Hz instead of 60Hz.
- **iOS build fails after adding expo-modules:** Make sure `use_expo_modules!` is in your Podfile. The `install-expo-modules` script should handle this.
- **Azure key exposed:** Never put `AZURE_SPEECH_KEY` in the RN bundle. Always proxy through your backend.

---

## 9. Optional upgrades

- **Eye blinks & idle motion:** add a small sine-driven offset to `eyeBlinkLeft`/`eyeBlinkRight` and gentle head rotation so the character isn't a corpse between words.
- **Co-articulation:** instead of snapping to one viseme at a time, blend the current and next viseme weighted by where you are in the interval. Looks noticeably more natural.
- **Streaming:** swap `speakTextAsync` for the streaming API and forward viseme events over WebSocket so playback can start before synthesis finishes.
- **Caching:** hash the input text → cache the `{audioBase64, visemes}` response. Same line spoken twice should cost zero Azure characters.

---

## 10. Build order (suggested)

1. Stand up the Node `/speak` endpoint locally. Hit it with curl. Confirm you get audio + visemes JSON back.
2. In RN, get a static GLB rendering inside `<Canvas>` — no lip sync yet. Just prove the 3D pipeline works on device.
3. Log `morphTargetDictionary` from the loaded mesh. Confirm viseme blend shape names exist.
4. Hardcode `mesh.morphTargetInfluences[idx] = 1` for one viseme — confirm the mouth visibly moves.
5. Wire up the timeline + audio. Iterate on `SMOOTHING` and the audio offset until it feels right.

Each step is independently testable, which matters when something breaks — and on the RN + three.js path, something will.
