import * as Sentry from '@sentry/react-native';
import MainApp from './src/App';

if (__DEV__) {
  Sentry.init({
    dsn: process.env.PUBLIC_SENTRY_DSN,
    sendDefaultPii: true,
    enableLogs: true,
    attachScreenshot: true,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    integrations: [
      Sentry.mobileReplayIntegration(),
      Sentry.feedbackIntegration(),
    ],
  });
}

if (__DEV__) {
  require('./ReactotronConfig');
}

export default (() => {
  if (!__DEV__) {
    return Sentry.wrap(MainApp);
  }

  return MainApp;
})();
