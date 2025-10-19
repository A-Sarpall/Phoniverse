import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function Game() {
    const navigation = useNavigation();
    const route = useRoute();
    const planetNumber = route.params?.planetNumber || 1;
    const [missionCompleted, setMissionCompleted] = useState(false);

    const getPlanetContent = (number: number) => {
        switch (number) {
            case 1:
                return {
                    title: "🌍 Planet Alpha",
                    description: "Welcome to your first destination! This is where your space journey begins.",
                    challenge: "Complete your first mission: Navigate through the asteroid field!",
                    reward: "🏆 Unlock: Basic Navigation Skills"
                };
            case 2:
                return {
                    title: "🪐 Planet Beta",
                    description: "A mysterious world with ancient alien ruins. What secrets lie hidden here?",
                    challenge: "Mission: Decode the alien hieroglyphs!",
                    reward: "🏆 Unlock: Ancient Knowledge"
                };
            case 3:
                return {
                    title: "🌙 Planet Gamma",
                    description: "A moon-like world with low gravity. Perfect for testing your piloting skills!",
                    challenge: "Mission: Master zero-gravity flight!",
                    reward: "🏆 Unlock: Advanced Piloting"
                };
            case 4:
                return {
                    title: "🔥 Planet Delta",
                    description: "A volcanic world filled with energy crystals. Dangerous but rewarding!",
                    challenge: "Mission: Harvest energy crystals!",
                    reward: "🏆 Unlock: Energy Manipulation"
                };
            case 5:
                return {
                    title: "⭐ Planet Omega",
                    description: "The final frontier! A beautiful world where your journey reaches its climax.",
                    challenge: "Final Mission: Establish first contact with the Omega civilization!",
                    reward: "🏆 Unlock: Master Explorer Status"
                };
            default:
                return {
                    title: "🌌 Unknown Planet",
                    description: "An uncharted world waiting to be explored!",
                    challenge: "Mission: Explore the unknown!",
                    reward: "🏆 Unlock: Mystery Rewards"
                };
        }
    };

    const content = getPlanetContent(planetNumber);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.description}>{content.description}</Text>

            <View style={styles.missionCard}>
                <Text style={styles.missionTitle}>🎯 Mission</Text>
                <Text style={styles.missionText}>{content.challenge}</Text>
            </View>

            <View style={styles.rewardCard}>
                <Text style={styles.rewardTitle}>🎁 Reward</Text>
                <Text style={styles.rewardText}>{content.reward}</Text>
            </View>

            {!missionCompleted ? (
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => {
                        // Here you could start the actual game/mission
                        console.log(`Starting mission for Planet ${planetNumber}`);
                        setMissionCompleted(true);
                    }}
                >
                    <Text style={styles.startButtonText}>🚀 Start Mission</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={styles.finishButton}
                    onPress={() => {
                        // Mark mission as completed and update spaceship position
                        console.log(`Mission completed for Planet ${planetNumber}`);
                        navigation.navigate('Home', { completedPlanet: planetNumber });
                    }}
                >
                    <Text style={styles.finishButtonText}>✅ Finish Mission</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>← Back to Map</Text>
            </TouchableOpacity>
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
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 24,
    },
    missionCard: {
        backgroundColor: 'rgba(96, 53, 156, 0.2)',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#60359c',
    },
    missionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#60359c',
        marginBottom: 10,
    },
    missionText: {
        fontSize: 16,
        color: '#fff',
        lineHeight: 22,
    },
    rewardCard: {
        backgroundColor: 'rgba(96, 53, 156, 0.2)',
        borderRadius: 15,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#60359c',
    },
    rewardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#60359c',
        marginBottom: 10,
    },
    rewardText: {
        fontSize: 16,
        color: '#fff',
        lineHeight: 22,
    },
    startButton: {
        backgroundColor: '#60359c',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#60359c',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    startButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    finishButton: {
        backgroundColor: '#28a745',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#28a745',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    finishButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    backButton: {
        backgroundColor: 'transparent',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#60359c',
    },
    backButtonText: {
        color: '#60359c',
        fontSize: 16,
        fontWeight: '500',
    },
});
