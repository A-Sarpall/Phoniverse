import React, { useState, useRef, useMemo } from 'react';
import { View, ScrollView, Image, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Line, Circle } from 'react-native-svg';

export default function HomePage({ route, navigation }) {
    const [completedPlanets, setCompletedPlanets] = useState(new Set());
    const [currentSpaceshipPosition, setCurrentSpaceshipPosition] = useState(1);
    const [isSpaceshipTravelling, setIsSpaceshipTravelling] = useState(false);

    const spaceshipX = useRef(new Animated.Value(0)).current;
    const spaceshipY = useRef(new Animated.Value(0)).current;
    const spaceshipOpacity = useRef(new Animated.Value(1)).current;
    const starIntensity = useRef(new Animated.Value(0)).current; // 0 = calm, 1 = bright

    const starBrightness = useRef(new Animated.Value(0.5)).current; // ⭐ base brightness (0.5 = normal)

    const scrollViewRef = useRef(null);

    const images = [
        { source: require('../../assets/planet1.png'), number: 1 },
        { source: require('../../assets/asteroid1.png'), number: 2 },
        { source: require('../../assets/planet2.png'), number: 3 },
        { source: require('../../assets/asteroid2.png'), number: 4 },
        { source: require('../../assets/planet3.png'), number: 5 },
    ];

    const stars = useMemo(() => {
        const arr = [];
        for (let i = 0; i < 100; i++) {
            arr.push({
                id: i,
                x: Math.random() * 400,
                y: Math.random() * 1200,
                size: Math.random() * 2 + 1, // larger stars (1–4 px)
                opacity: Math.random() * 0.6 + 0.4, // generally brighter (0.4–1)
                color: Math.random() > 0.7 ? '#cce6ff' : '#ffffff', // some bluish sparkle
            });
        }
        return arr;
    }, []);


    // Planet positions (zig-zag)
    const imagePositions = images.map((item, index) => {
        const screenWidth = 300;
        const imageSize = 150;
        const offset = 50;
        const x = index % 2 === 0 ? 20 + offset : screenWidth - imageSize - 20 + offset;
        const y = (images.length - 1 - index) * 200 + 50;
        return { ...item, x, y };
    });

    useFocusEffect(
        React.useCallback(() => {
            if (route?.params?.completedPlanet) {
                setCompletedPlanets(prev => {
                    const updated = new Set(prev);
                    updated.add(route.params.completedPlanet);
                    return updated;
                });

                const nextPosition = route.params.completedPlanet + 1;
                if (nextPosition <= 5) {
                    const currentPlanetIndex = images.findIndex(img => img.number === route.params.completedPlanet);
                    const nextPlanetIndex = images.findIndex(img => img.number === nextPosition);

                    if (currentPlanetIndex !== -1 && nextPlanetIndex !== -1) {
                        const screenWidth = 300;
                        const planetSize = 150;
                        const spaceshipSize = 60;
                        const offset = 50;

                        const currentX = currentPlanetIndex % 2 === 0 ? 20 + offset : screenWidth - planetSize - 20 + offset;
                        const currentY = (images.length - 1 - currentPlanetIndex) * 200 + 50;
                        const nextX = nextPlanetIndex % 2 === 0 ? 20 + offset : screenWidth - planetSize - 20 + offset;
                        const nextY = (images.length - 1 - nextPlanetIndex) * 200 + 50;

                        const currentCenterX = currentX + planetSize / 2 - spaceshipSize / 2;
                        const currentCenterY = currentY - 30;
                        const nextCenterX = nextX + planetSize / 2 - spaceshipSize / 2;
                        const nextCenterY = nextY - 30;

                        setIsSpaceshipTravelling(true);
                        Animated.timing(starIntensity, {
                            toValue: 1,
                            duration: 800,
                            useNativeDriver: false,
                        }).start();

                        spaceshipX.setValue(currentCenterX);
                        spaceshipY.setValue(currentCenterY);

                        // 🌟 brighten stars as flight begins
                        Animated.timing(starBrightness, {
                            toValue: 1.0, // full brightness
                            duration: 500,
                            useNativeDriver: false,
                        }).start();

                        const progress = new Animated.Value(0);
                        const shouldDisappearMidway = Math.random() > 0.5;

                        const curveAnimation = progress.addListener(({ value }) => {
                            const t = value;
                            const x = currentCenterX + (nextCenterX - currentCenterX) * t;
                            const y = currentCenterY + (nextCenterY - currentCenterY) * t - 100 * Math.sin(t * Math.PI);

                            spaceshipX.setValue(x);
                            spaceshipY.setValue(y);

                            if (shouldDisappearMidway && t > 0.4 && t < 0.6) {
                                spaceshipOpacity.setValue(0.2);
                            } else {
                                spaceshipOpacity.setValue(1);
                            }

                            if (scrollViewRef.current) {
                                scrollViewRef.current.scrollTo({
                                    y: Math.max(0, y - 200),
                                    animated: false,
                                });
                            }
                        });

                        Animated.sequence([
                            Animated.parallel([
                                Animated.timing(spaceshipOpacity, {
                                    toValue: 1,
                                    duration: 300,
                                    useNativeDriver: true,
                                }),
                                Animated.timing(spaceshipY, {
                                    toValue: currentCenterY - 20,
                                    duration: 300,
                                    useNativeDriver: true,
                                }),
                            ]),
                            Animated.timing(progress, {
                                toValue: 1,
                                duration: 2000,
                                useNativeDriver: false,
                            }),
                            Animated.sequence([
                                Animated.timing(spaceshipY, {
                                    toValue: nextCenterY - 15,
                                    duration: 200,
                                    useNativeDriver: true,
                                }),
                                Animated.spring(spaceshipY, {
                                    toValue: nextCenterY,
                                    friction: 3,
                                    tension: 100,
                                    useNativeDriver: true,
                                }),
                            ]),
                        ]).start(() => {
                            progress.removeAllListeners();
                            setCurrentSpaceshipPosition(nextPosition);
                            setIsSpaceshipTravelling(false);
                            Animated.timing(starIntensity, {
                                toValue: 0,
                                duration: 1200,
                                useNativeDriver: false,
                            }).start();

                            spaceshipOpacity.setValue(1);

                            // 🌠 dim stars back down
                            Animated.timing(starBrightness, {
                                toValue: 0.5, // back to normal glow
                                duration: 800,
                                useNativeDriver: false,
                            }).start();
                        });
                    }
                }
            }
        }, [route?.params?.completedPlanet])
    );

    const starScale = starIntensity.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 2], // stars grow 2x when travelling
    });

    const starOpacity = starIntensity.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1], // dim → bright
    });

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                ref={scrollViewRef}
                onLayout={() => setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 100)}
            >
                <Svg style={styles.svgOverlay}>
                    {/* Animated starfield */}
                    {stars.map(star => (
                        <AnimatedCircle
                            key={star.id}
                            cx={star.x}
                            cy={star.y}
                            r={Animated.multiply(star.size, starScale)}
                            fill="#ffffff"
                            opacity={Animated.multiply(star.opacity, starOpacity)}
                        />
                    ))}



                    {/* Connecting lines */}
                    {imagePositions.map((item, i) => {
                        if (i < imagePositions.length - 1) {
                            const next = imagePositions[i + 1];
                            return (
                                <Line
                                    key={`line-${i}`}
                                    x1={item.x + 75}
                                    y1={item.y + 75}
                                    x2={next.x + 75}
                                    y2={next.y + 75}
                                    stroke="#60359c"
                                    strokeWidth="3"
                                    strokeDasharray="5,5"
                                />
                            );
                        }
                        return null;
                    })}
                </Svg>

                {/* Planets */}
                {imagePositions.map(item => (
                    <View key={item.number} style={[styles.imageContainer, { left: item.x, top: item.y }]}>
                        <Image source={item.source} style={styles.image} />
                        <TouchableOpacity
                            disabled={item.number > currentSpaceshipPosition} // 🚫 lock all planets ahead
                            style={[
                                styles.numberLabel,
                                item.number < currentSpaceshipPosition && styles.completedLabel,
                                item.number > currentSpaceshipPosition && styles.lockedLabel,
                            ]}
                            onPress={() => {
                                if (item.number <= currentSpaceshipPosition) {
                                    navigation.navigate('Game', { planetNumber: item.number });
                                }
                            }}
                        >
                            <Text
                                style={[
                                    styles.numberText,
                                    item.number < currentSpaceshipPosition && styles.completedText,
                                    item.number > currentSpaceshipPosition && styles.lockedText,
                                ]}
                            >
                                {item.number < currentSpaceshipPosition
                                    ? '✓'
                                    : item.number > currentSpaceshipPosition
                                        ? '🔒'
                                        : item.number}
                            </Text>
                        </TouchableOpacity>


                        {item.number === currentSpaceshipPosition && !isSpaceshipTravelling && (
                            <View style={[styles.spaceshipContainer, { top: -30, left: 45 }]}>
                                <Image
                                    source={require('../../assets/spaceship.png')}
                                    style={styles.spaceship}
                                />
                            </View>
                        )}
                    </View>
                ))}

                {/* Animated spaceship */}
                {isSpaceshipTravelling && (
                    <Animated.View
                        style={[
                            styles.travellingSpaceshipContainer,
                            {
                                transform: [
                                    { translateX: spaceshipX },
                                    { translateY: spaceshipY },
                                ],
                                opacity: spaceshipOpacity,
                            },
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

// Create animated circle component for stars
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    scrollView: { flex: 1 },
    scrollContent: {
        height: 1200,
        width: '100%',
        position: 'relative',
        alignItems: 'flex-start',
        paddingLeft: 20,
    },
    svgOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: 1200,
        zIndex: 1,
    },
    imageContainer: { position: 'absolute', zIndex: 2 },
    image: { width: 150, height: 150, resizeMode: 'contain' },
    spaceshipContainer: { position: 'absolute', zIndex: 3 },
    travellingSpaceshipContainer: { position: 'absolute', left: 0, top: 0, zIndex: 4 },
    spaceship: { width: 60, height: 60, resizeMode: 'contain' },
    numberLabel: {
        position: 'absolute',
        top: 60,
        left: 60,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 15,
        minWidth: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 3.84,
        elevation: 5,
    },
    numberText: { color: '#000', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
    completedLabel: { backgroundColor: '#28a745' },
    completedText: { color: '#fff', fontSize: 24 },
    lockedLabel: {
        backgroundColor: 'rgba(100, 100, 100, 0.6)',
    },

    lockedText: {
        color: '#aaa',
        fontSize: 20,
    },

});
