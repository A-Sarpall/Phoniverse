import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import OpeningPage from './OpeningPage';
import VoiceInputPage from './VoiceInputPage';
import HomePage from './HomePage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('opening');

  const navigateToVoiceInput = () => {
    setCurrentPage('voiceInput');
  };

  const navigateBack = () => {
    setCurrentPage('opening');
  };

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  return (
    <>
      {currentPage === 'opening' && <OpeningPage onGetStarted={navigateToVoiceInput} />}
      {currentPage === 'voiceInput' && <VoiceInputPage onBack={navigateBack} onComplete={navigateToHome} />}
      {currentPage === 'home' && <HomePage />}
      <StatusBar style="auto" />
    </>
  );
}
