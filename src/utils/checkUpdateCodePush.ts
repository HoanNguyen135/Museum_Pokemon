/* eslint-disable react-hooks/rules-of-hooks */
import {useCallback, useState} from 'react';
import {Alert} from 'react-native';
import codePush from '@code-push-next/react-native-code-push';

type CheckUpdateCodePushType = {
  loading: boolean;
  label: string;
  percentLoading: number;
  handleCheckUpdate: () => void;
};

export default function checkUpdateCodePush(): CheckUpdateCodePushType {
  const [loading, setLoading] = useState<boolean>(false);
  const [label, setLabel] = useState<string>('Check for update');
  const [percentLoading, setPercentLoading] = useState<number>(0);

  const handleCheckUpdate = useCallback(async () => {
    if (loading) return;

    try {
      setLoading(true);

      await codePush.sync(
        {
          installMode: codePush.InstallMode.IMMEDIATE,
        },
        status => {
          console.log('STATUS =', status);
          switch (status) {
            case codePush.SyncStatus.CHECKING_FOR_UPDATE:
              setLabel('Checking....');
              break;
            case codePush.SyncStatus.DOWNLOADING_PACKAGE:
              setLabel('Downloading....');
              break;
            case codePush.SyncStatus.INSTALLING_UPDATE:
              setLabel('Installing....');
              break;
            case codePush.SyncStatus.UPDATE_INSTALLED:
              setLabel('Restarting....');
              setTimeout(() => {
                codePush.restartApp();
              }, 1000);
              break;
            case codePush.SyncStatus.UP_TO_DATE:
              setLoading(false);
              setLabel('Check for updates');
              Alert.alert("You're up to date");
              break;
            case codePush.SyncStatus.UNKNOWN_ERROR:
              setLoading(false);
              setLabel('Check for updates');
              Alert.alert('Update failed', 'Please try again');
              break;
          }
        },
        ({receivedBytes, totalBytes}) => {
          if (totalBytes > 0) {
            const percent = Math.round((receivedBytes / totalBytes) * 100);
            setPercentLoading(percent);
            setLabel(`Downloading ${percent}%`);
          }
        },
      );
    } catch (error) {
      console.error(error);
      setLoading(false);
      setLabel('Check for updates');
      Alert.alert('Update failed', 'Please try again');
    }
  }, [loading]);

  return {
    label,
    loading,
    handleCheckUpdate,
    percentLoading,
  };
}
