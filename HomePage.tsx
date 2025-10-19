import React from 'react';
import { View, ScrollView, Image, Text, StyleSheet } from 'react-native';

export default function HomePage() {
  const images = [
    { source: require('./assets/planet1.png'), number: 5 },
    { source: require('./assets/asteroid1.png'), number: 4 },
    { source: require('./assets/planet2.png'), number: 3 },
    { source: require('./assets/asteroid2.png'), number: 2 },
    { source: require('./assets/planet3.png'), number: 1 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {images.map((item, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={item.source} style={styles.image} />
            <Text style={styles.numberLabel}>{item.number}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  imageContainer: {
    position: 'relative',
    marginVertical: 20,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  numberLabel: {
    position: 'absolute',
    top: 88,
    left: 88,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#000',
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    textAlign: 'center',
    minWidth: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
