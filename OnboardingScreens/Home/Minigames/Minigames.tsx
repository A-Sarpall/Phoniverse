import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Minigames() {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 Minigames</Text>
      <Text style={styles.subtitle}>Choose your space adventure!</Text>
      
      <View style={styles.gamesContainer}>
        <TouchableOpacity style={styles.gameCard}>
          <Text style={styles.gameIcon}>🚀</Text>
          <Text style={styles.gameTitle}>Space Race</Text>
          <Text style={styles.gameDescription}>Navigate through asteroid fields</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.gameCard}>
          <Text style={styles.gameIcon}>⭐</Text>
          <Text style={styles.gameTitle}>Star Collector</Text>
          <Text style={styles.gameDescription}>Gather cosmic energy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.gameCard}>
          <Text style={styles.gameIcon}>🛸</Text>
          <Text style={styles.gameTitle}>Alien Encounter</Text>
          <Text style={styles.gameDescription}>Meet friendly aliens</Text>
        </TouchableOpacity>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#60359c',
    textAlign: 'center',
    marginBottom: 30,
  },
  gamesContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  gameCard: {
    backgroundColor: 'rgba(96, 53, 156, 0.2)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#60359c',
  },
  gameIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  gameDescription: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
});
