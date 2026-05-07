import React from 'react';
import { StatusBar } from 'expo-status-bar';
import CadastroItemScreen from './src/screens/CadastroItemScreen';

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <CadastroItemScreen />
    </>
  );
}