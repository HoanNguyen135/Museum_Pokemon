module.exports = {
  presets: ['module:@react-native/babel-preset','nativewind/babel'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@services': './src/services',
          '@utils': './src/utils',
          '@store': './src/store',
          '@i18n': './src/i18n',
          '@types': './src/types',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
