import React, { useLayoutEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Audio } from "expo-av";
import { stitchMissionAudio } from "./Game.service";

const Game = ({ navigation }: any) => {
    const route = useRoute();
    const planetNumber = route.params?.planetNumber || 1;
    const [missionCompleted, setMissionCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [missionStarted, setMissionStarted] = useState(false);

    useLayoutEffect(() => {
        navigation.setOptions({ title: `Planet ${planetNumber}` });
    }, [navigation, planetNumber]);

    const handleStartMission = async () => {
        try {
            setIsLoading(true);
            console.log(`Starting mission for Planet ${planetNumber}`);

            // Fetch and play stitched audio based on level
            const audioBlob = await stitchMissionAudio(planetNumber);

            // Convert blob to playable format
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;
                const sound = new Audio.Sound();

                await sound.loadAsync({ uri: base64Audio });
                await sound.playAsync();

                console.log("Mission audio played successfully");
            };
            reader.readAsDataURL(audioBlob);

            setMissionStarted(true);
        } catch (error) {
            console.error("Failed to start mission:", error);
            alert("Failed to load mission audio. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            {!missionStarted ? (
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={handleStartMission}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.startButtonText}>
                            🚀 Start Mission
                        </Text>
                    )}
                </TouchableOpacity>
            ) : !missionCompleted ? (
                <TouchableOpacity
                    style={styles.finishButton}
                    onPress={() => {
                        console.log(
                            `Mission completed for Planet ${planetNumber}`
                        );
                        setMissionCompleted(true);
                        navigation.navigate("Home", {
                            completedPlanet: planetNumber,
                        });
                    }}
                >
                    <Text style={styles.finishButtonText}>
                        ✅ Complete Mission
                    </Text>
                </TouchableOpacity>
            ) : (
                <Text style={styles.completedText}>Mission Completed! 🎉</Text>
            )}

            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.backButtonText}>← Back to Map</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Game;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: "#ccc",
        textAlign: "center",
        marginBottom: 30,
        lineHeight: 24,
    },
    missionCard: {
        backgroundColor: "rgba(96, 53, 156, 0.2)",
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#60359c",
    },
    missionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#60359c",
        marginBottom: 10,
    },
    missionText: {
        fontSize: 16,
        color: "#fff",
        lineHeight: 22,
    },
    rewardCard: {
        backgroundColor: "rgba(96, 53, 156, 0.2)",
        borderRadius: 15,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: "#60359c",
    },
    rewardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#60359c",
        marginBottom: 10,
    },
    rewardText: {
        fontSize: 16,
        color: "#fff",
        lineHeight: 22,
    },
    startButton: {
        backgroundColor: "#60359c",
        borderRadius: 15,
        padding: 15,
        alignItems: "center",
        marginBottom: 15,
        shadowColor: "#60359c",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    startButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    finishButton: {
        backgroundColor: "#28a745",
        borderRadius: 15,
        padding: 15,
        alignItems: "center",
        marginBottom: 15,
        shadowColor: "#28a745",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    finishButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    backButton: {
        backgroundColor: "transparent",
        borderRadius: 15,
        padding: 15,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#60359c",
    },
    backButtonText: {
        color: "#60359c",
        fontSize: 16,
        fontWeight: "500",
    },
    completedText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#28a745",
        textAlign: "center",
        marginBottom: 20,
    },
});
