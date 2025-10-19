import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Audio } from 'expo-av';

interface VoiceInputPageProps {
  onBack: () => void;
  onComplete: () => void;
}

export default function VoiceInputPage({ onBack, onComplete }: VoiceInputPageProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentString, setCurrentString] = useState("Hello World");
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const stringsToPronounce = [
    "See you soon.",
    "What’s this?",
    "Thanks so much.",
    "It’s so nice to see you.",
    "This is stressful.",
    "I think this sentence sounds silly."
  ];
  
  const [currentIndex, setCurrentIndex] = useState(0);

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant microphone permission to record audio.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  }

  async function stopRecording() {
    if (!recording) return;
    
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    
    // Prepare the recording for playback
    const uri = recording.getURI();
    if (uri) {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
    }
    
    setRecording(null);
  }

  async function playRecording() {
    if (!sound) return;
    
    try {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.replayAsync();
        setIsPlaying(true);
        
        // Reset playing state when playback ends
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('Error playing recording:', error);
    }
  }

  const handleDone = async () => {
    // Clean up current sound
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
    
    if (currentIndex < stringsToPronounce.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentString(stringsToPronounce[currentIndex + 1]);
    } else {
      onComplete();
    }
  };

  const handleRetry = async () => {
    // Clean up current sound
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
    
    setCurrentString(stringsToPronounce[currentIndex]);
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Can you pronounce "{currentString}"?
      </Text>
      
      <View style={styles.micContainer}>
        <TouchableOpacity 
          style={[styles.micButton, isRecording && styles.micButtonRecording]} 
          onPress={handleMicPress}
        >
          <Text style={styles.micIcon}>🎤</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleDone}>
          <Text style={styles.buttonText}>Done?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.retryButton]} onPress={handleRetry}>
          <Text style={[styles.buttonText, styles.retryButtonText]}>Retry</Text>
        </TouchableOpacity>
      </View>

      {sound && (
        <TouchableOpacity 
          style={[styles.playbackButton, isPlaying && styles.playbackButtonPlaying]} 
          onPress={playRecording}
        >
          <Text style={styles.playbackButtonText}>
            {isPlaying ? '⏸️' : '▶️'} {isPlaying ? 'Pause' : 'Play'} Recording
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 60,
    color: '#333',
  },
  micContainer: {
    marginBottom: 60,
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  micButtonRecording: {
    backgroundColor: '#FF3B30',
  },
  micIcon: {
    fontSize: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    flex: 0.45,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  retryButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButtonText: {
    color: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  playbackButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  playbackButtonPlaying: {
    backgroundColor: '#FF9500',
  },
  playbackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
