import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, ScrollView, Image, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Svg, { Line, Circle } from 'react-native-svg';

export default function HomePage({ route }) {
    const navigation = useNavigation();
    const [completedPlanets, setCompletedPlanets] = useState(new Set());
    const [currentSpaceshipPosition, setCurrentSpaceshipPosition] = useState(1); // Start at planet 1
    const [isSpaceshipTravelling, setIsSpaceshipTravelling] = useState(false); // Track spaceship animation state

    // Animation values for smooth spaceship movement
    const spaceshipX = useRef(new Animated.Value(0)).current;
    const spaceshipY = useRef(new Animated.Value(0)).current;
    const spaceshipOpacity = useRef(new Animated.Value(1)).current;

    // Ref for ScrollView to enable auto-scrolling
    const scrollViewRef = useRef(null);

    // Update completed planets when returning from Game screen

    // Update completed planets when returning from Game screen
    useFocusEffect(
        React.useCallback(() => {
            if (route?.params?.completedPlanet) {
                setCompletedPlanets(prevCompletedPlanets => {
                    const newCompletedPlanets = new Set(prevCompletedPlanets);
                    newCompletedPlanets.add(route.params.completedPlanet);
                    return newCompletedPlanets;
                });

                // Update spaceship position to next planet with gliding animation
                const nextPosition = route.params.completedPlanet + 1;
                if (nextPosition <= 5) {
                    // Get current and next planet positions
                    const currentPlanetIndex = images.findIndex(img => img.number === route.params.completedPlanet);
                    const nextPlanetIndex = images.findIndex(img => img.number === nextPosition);

                    if (currentPlanetIndex !== -1 && nextPlanetIndex !== -1) {
                        // Calculate positions
                        const screenWidth = 300;
                        const imageSize = 150;
                        const offset = 50;

                        const currentX = currentPlanetIndex % 2 === 0 ? 20 + offset : screenWidth - imageSize - 20 + offset;
                        const currentY = (images.length - 1 - currentPlanetIndex) * 200 + 50;

                        const nextX = nextPlanetIndex % 2 === 0 ? 20 + offset : screenWidth - imageSize - 20 + offset;
                        const nextY = (images.length - 1 - nextPlanetIndex) * 200 + 50;

                        // Start travelling animation
                        setIsSpaceshipTravelling(true);

                        // Set initial position
                        spaceshipX.setValue(currentX + 140); // Add spaceship offset (adjusted for smaller spaceship)
                        spaceshipY.setValue(currentY + 45);

                        // Add listener to spaceshipY to follow spaceship during animation
                        const animationListener = spaceshipY.addListener(({ value }) => {
                            if (scrollViewRef.current) {
                                // Calculate scroll position to keep spaceship centered in view
                                const scrollY = value - 200; // Center spaceship in viewport
                                scrollViewRef.current.scrollTo({
                                    y: Math.max(0, scrollY),
                                    animated: false // No animation here, we want real-time following
                                });
                            }
                        });

                        // Animate to next position
                        Animated.parallel([
                            Animated.timing(spaceshipX, {
                                toValue: nextX + 140,
                                duration: 1500, // 1.5 second glide
                                useNativeDriver: true,
                            }),
                            Animated.timing(spaceshipY, {
                                toValue: nextY + 45,
                                duration: 1500,
                                useNativeDriver: true,
                            }),
                        ]).start(() => {
                            // Remove the animation listener
                            spaceshipY.removeListener(animationListener);

                            // Fade out travelling spaceship smoothly
                            Animated.timing(spaceshipOpacity, {
                                toValue: 0,
                                duration: 200,
                                useNativeDriver: true,
                            }).start(() => {
                                // Update position and switch to normal spaceship
                                setCurrentSpaceshipPosition(nextPosition);
                                setIsSpaceshipTravelling(false);

                                // Reset position for normal display
                                spaceshipX.setValue(0);
                                spaceshipY.setValue(0);

                                // Fade back in at new position
                                Animated.timing(spaceshipOpacity, {
                                    toValue: 1,
                                    duration: 200,
                                    useNativeDriver: true,
                                }).start();
                            });
                        });
                    }
                }
            }
        }, [route?.params?.completedPlanet])
    );

    const images = [
        { source: require('../../assets/planet1.png'), number: 1 },
        { source: require('../../assets/asteroid1.png'), number: 2 },
        { source: require('../../assets/planet2.png'), number: 3 },
        { source: require('../../assets/asteroid2.png'), number: 4 },
        { source: require('../../assets/planet3.png'), number: 5 },
    ];

    // Generate random star positions for the starfield background (memoized to keep stars consistent)
    const stars = useMemo(() => {
        const starArray = [];
        const starCount = 80; // Number of stars
        const containerWidth = 400;
        const containerHeight = 1200;

        for (let i = 0; i < starCount; i++) {
            starArray.push({
                id: i,
                x: Math.random() * containerWidth,
                y: Math.random() * containerHeight,
                size: Math.random() * 2 + 0.5, // Random size between 0.5 and 2.5
                opacity: Math.random() * 0.8 + 0.2, // Random opacity between 0.2 and 1
            });
        }
        return starArray;
    }, []); // Empty dependency array means this only runs once

    // Calculate positions for zigzag layout (reversed - start from bottom)
    const imagePositions = images.map((item, index) => {
        const screenWidth = 300; // Approximate screen width
        const imageSize = 150; // Increased image size
        const offset = 50; // Shift the entire diagram to the right
        const x = index % 2 === 0 ? 20 + offset : screenWidth - imageSize - 20 + offset; // Alternate left and right with margins + offset
        // Reverse the y positions so higher numbers are at the bottom
        const y = (images.length - 1 - index) * 200 + 50; // Start from bottom, go up
        return { ...item, x, y, index };
    });

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                ref={scrollViewRef}
                onLayout={() => {
                    // Scroll to bottom on mount to start from image 5
                    setTimeout(() => {
                        if (scrollViewRef.current) {
                            scrollViewRef.current.scrollToEnd({ animated: false });
                        }
                    }, 100);
                }}
            >
                <Svg style={styles.svgOverlay}>
                    {/* Starfield background */}
                    {stars.map((star) => (
                        <Circle
                            key={`star-${star.id}`}
                            cx={star.x}
                            cy={star.y}
                            r={star.size}
                            fill="white"
                            opacity={star.opacity}
                        />
                    ))}

                    {/* Connecting lines between images */}
                    {imagePositions.map((item, index) => {
                        if (index < imagePositions.length - 1) {
                            const current = imagePositions[index];
                            const next = imagePositions[index + 1];
                            return (
                                <Line
                                    key={`line-${index}`}
                                    x1={current.x + 75} // Center of current image (150px image / 2)
                                    y1={current.y + 75} // Center of current image
                                    x2={next.x + 75} // Center of next image
                                    y2={next.y + 75} // Center of next image
                                    stroke="#60359c"
                                    strokeWidth="3"
                                    strokeDasharray="5,5"
                                />
                            );
                        }
                        return null;
                    })}
                </Svg>

                {imagePositions.map((item, index) => (
                    <View
                        key={index}
                        style={[
                            styles.imageContainer,
                            {
                                position: 'absolute',
                                left: item.x,
                                top: item.y,
                            }
                        ]}
                    >
                        <Image source={item.source} style={styles.image} />
                        <TouchableOpacity
                            style={[
                                styles.numberLabel,
                                item.number < currentSpaceshipPosition && styles.completedLabel
                            ]}
                            onPress={() => navigation.navigate('Game', { planetNumber: item.number })}
                        >
                            <Text style={[
                                styles.numberText,
                                item.number < currentSpaceshipPosition && styles.completedText
                            ]}>
                                {item.number < currentSpaceshipPosition ? '✓' : item.number}
                            </Text>
                        </TouchableOpacity>

                        {/* Add spaceship next to current position planet (static) */}
                        {item.number === currentSpaceshipPosition && !isSpaceshipTravelling && (
                            <View style={styles.spaceshipContainer}>
                                <Image
                                    source={require('../../assets/spaceship.png')}
                                    style={styles.spaceship}
                                />
                            </View>
                        )}
                    </View>
                ))}

                {/* Animated travelling spaceship */}
                {isSpaceshipTravelling && (
                    <Animated.View
                        style={[
                            styles.travellingSpaceshipContainer,
                            {
                                transform: [
                                    { translateX: spaceshipX },
                                    { translateY: spaceshipY }
                                ],
                                opacity: spaceshipOpacity,
                            }
                        ]}
                    >
                        <Image
                            source={require('../../assets/travellingSpaceship.png')}
                            style={styles.spaceship}
                        />
                    </Animated.View>
                )}
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
        marginBottom: 80, // Add margin to account for navbar height
    },
    scrollContent: {
        height: 1200, // Increased height to accommodate larger images and spacing
        width: '100%',
        position: 'relative',
        alignItems: 'flex-start',
        paddingLeft: 20, // Add left padding to accommodate the right shift
    },
    svgOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 1200,
        zIndex: 1,
    },
    imageContainer: {
        position: 'relative',
        zIndex: 2,
    },
    image: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
    spaceshipContainer: {
        position: 'absolute',
        left: 140, // Position to the right of the planet (adjusted for smaller spaceship)
        top: 45, // Center vertically with the planet (adjusted for smaller spaceship)
        zIndex: 3,
    },
    travellingSpaceshipContainer: {
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 4, // Above everything else
    },
    spaceship: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
    },
    numberLabel: {
        position: 'absolute',
        top: 60,
        left: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 15,
        minWidth: 30,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 3.84,
        elevation: 5,
    },
    numberText: {
        color: '#000',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    completedLabel: {
        backgroundColor: '#28a745',
    },
    completedText: {
        color: '#fff',
        fontSize: 24,
    },
    navbar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: 'rgba(22, 11, 32, 0.95)', // Semi-transparent dark background
        borderTopWidth: 1,
        borderTopColor: '#60359c',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 20, // Account for safe area
        paddingTop: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
    navItem: {
        alignItems: 'center',
        flex: 1,
        paddingVertical: 5,
    },
    navIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    navLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
});
