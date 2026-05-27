import { NavigationContainerRef, StackActions } from '@react-navigation/native';
import React from 'react';

export type RootStackParamList = {
  [key: string]: object | undefined;
};

// Define the navigation ref with proper typing
export const navigationRef =
  React.createRef<NavigationContainerRef<RootStackParamList>>();

export function navigate(name: string, params?: object): void {
  navigationRef.current?.navigate({ name, params });
}

export function pop(n: number) {
  navigationRef.current?.dispatch(StackActions.pop(n));
}

export function getCurrentRouteName(): string | undefined {
  return navigationRef.current?.getCurrentRoute()?.name;
}

export function replace(name: string, params?: object): void {
  navigationRef.current?.dispatch(StackActions.replace(name, params));
}
