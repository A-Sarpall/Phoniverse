import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: Animated.Value;
}

const GalaxyBackground: React.FC = () => {
  const [stars, setStars] = useState<Star[]>([]);
  const animations = useRef<Animated.CompositeAnimation[]>([]);

  // Generate blinking stars
  useEffect(() => {
    const generateStars = () => {
      const starCount = 150; // Reduced for better performance
      const newStars: Star[] = [];

      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 3 + 2, // Size between 2-5 (larger for visibility)
          opacity: new Animated.Value(Math.random() * 0.4 + 0.6), // Initial opacity between 0.6-1.0
        });
      }

      setStars(newStars);
      
      // Start blinking animations after a short delay
      setTimeout(() => {
        const createBlinkAnimation = (star: Star) => {
          const blink = Animated.loop(
            Animated.sequence([
              Animated.timing(star.opacity, {
                toValue: 0.2,
                duration: Math.random() * 2000 + 1000, // Random duration between 1-3 seconds
                useNativeDriver: true,
              }),
              Animated.timing(star.opacity, {
                toValue: 1,
                duration: Math.random() * 2000 + 1000,
                useNativeDriver: true,
              }),
            ])
          );

          return blink;
        };

        animations.current = newStars.map(star => {
          const animation = createBlinkAnimation(star);
          animation.start();
          return animation;
        });
      }, 100);
    };

    generateStars();

    // Cleanup function
    return () => {
      animations.current.forEach(animation => animation.stop());
    };
  }, []);

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Dark space background */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000011',
        }}
      />

      {/* Render blinking stars */}
      {stars.map((star) => (
        <Animated.View
          key={star.id}
          style={{
            position: 'absolute',
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: '#ffffff',
            opacity: star.opacity,
            shadowColor: '#ffffff',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 4,
            elevation: 5,
            borderWidth: 0.5,
            borderColor: '#ffffff',
          }}
        />
      ))}
    </View>
  );
};

export default GalaxyBackground;
