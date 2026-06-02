import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import LottieView from 'lottie-react-native'
import SafeViewMain from './SafeViewMain'
import { animations } from '@/assets/animations'


type AnimationName = keyof typeof animations;

const LoadingScreen = () => {


    const getRandomAnimation = () :AnimationName =>{
        const values = Object.values(animations);
        const index = Math.floor(Math.random() * values.length);
        return values[index]
    }


    

  return (
   <SafeViewMain>
        <View className='flex-1 justify-center items-center'>
          <LottieView
           source={getRandomAnimation()}
           style={{ width: "100%", height: "100%" }}
           autoPlay
           loop
         />
        </View>
       </SafeViewMain>
  )
}

export default LoadingScreen