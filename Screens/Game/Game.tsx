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
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { stitchMissionAudio, analyzeRecordingWithSSound } from "./Game.service";
import useGame from "./useGame";

const Game = ({ navigation }: any) => {
    const route = useRoute();
    const planetNumber = (route.params as any)?.planetNumber || 1;
    const [missionCompleted, setMissionCompleted] = useState(false);
    const [missionStarted, setMissionStarted] = useState(false);

    const {
        isRecording,
        isDoneRecording,
        record,
        stopRecording,
        resetRecording,
        recordingUri,
        isLoading,
        setIsLoading,
        analysisResult,
        setAnalysisResult,
    } = useGame();

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

    const handleRecordButtonPress = async () => {
        if (isRecording) {
            // Stop recording
            const uri = await stopRecording();
            console.log("Finished recording, saved URI:", uri);
        } else if (isDoneRecording) {
            // Analyze the recording
            if (!recordingUri) {
                console.warn("No recording found!");
                return;
            }

            try {
                setIsLoading(true);
                console.log("Analyzing recording...");

                const result = await analyzeRecordingWithSSound(recordingUri);
                setAnalysisResult(result);

                console.log("Analysis complete:", result);
            } catch (err) {
                console.error("Error analyzing recording:", err);
                alert("Failed to analyze recording. Please try again.");
            } finally {
                setIsLoading(false);
            }
        } else {
            // Start recording
            await record();
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
                <View style={styles.missionContent}>
                    <Text style={styles.instructionText}>
                        Now it's your turn! Say "Ssssss"
                    </Text>

                    {/* Microphone Button */}
                    <TouchableOpacity
                        style={[
                            styles.micButton,
                            isRecording && styles.micButtonRecording,
                        ]}
                        activeOpacity={0.8}
                        onPress={handleRecordButtonPress}
                        disabled={isLoading}
                    >
                        <FontAwesomeIcon
                            icon={faMicrophone}
                            size={60}
                            color="white"
                        />
                    </TouchableOpacity>

                    {/* Record/Analyze Button */}
                    <TouchableOpacity
                        style={[
                            styles.actionButton,
                            isLoading && styles.actionButtonDisabled,
                        ]}
                        onPress={handleRecordButtonPress}
                        disabled={isLoading}
                    >
                        <Text style={styles.actionButtonText}>
                            {isLoading
                                ? "Analyzing..."
                                : isRecording
                                ? "Stop Recording"
                                : isDoneRecording
                                ? "Analyze Recording"
                                : "Start Recording"}
                        </Text>
                    </TouchableOpacity>

                    {/* Retake Button */}
                    {isDoneRecording && !analysisResult && (
                        <TouchableOpacity
                            style={styles.retakeButton}
                            onPress={() => {
                                resetRecording();
                                void record();
                            }}
                            disabled={isLoading}
                        >
                            <Text style={styles.retakeButtonText}>Retake</Text>
                        </TouchableOpacity>
                    )}

                    {/* Analysis Results */}
                    {analysisResult && (
                        <View style={styles.resultsCard}>
                            <Text style={styles.resultsTitle}>
                                Analysis Results
                            </Text>
                            <Text style={styles.resultsText}>
                                Truth: {analysisResult.truth_transcription}
                            </Text>
                            <Text style={styles.resultsText}>
                                You said:{" "}
                                {analysisResult.recorded_transcription}
                            </Text>
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
                        </View>
                    )}
                </View>
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
    missionContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
    },
    instructionText: {
        fontSize: 20,
        fontWeight: "600",
        color: "#fff",
        textAlign: "center",
        marginBottom: 30,
    },
    micButton: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: "#2c1743",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 30,
        shadowColor: "#60359c",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 8,
    },
    micButtonRecording: {
        backgroundColor: "#dc3545",
        shadowColor: "#dc3545",
    },
    actionButton: {
        backgroundColor: "#60359c",
        borderRadius: 15,
        paddingVertical: 15,
        paddingHorizontal: 30,
        alignItems: "center",
        marginBottom: 15,
        minWidth: 200,
        shadowColor: "#60359c",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    actionButtonDisabled: {
        backgroundColor: "#999",
    },
    actionButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    retakeButton: {
        backgroundColor: "transparent",
        borderRadius: 15,
        paddingVertical: 12,
        paddingHorizontal: 25,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#60359c",
    },
    retakeButtonText: {
        color: "#60359c",
        fontSize: 14,
        fontWeight: "600",
    },
    resultsCard: {
        backgroundColor: "rgba(96, 53, 156, 0.2)",
        borderRadius: 15,
        padding: 20,
        marginTop: 20,
        width: "100%",
        borderWidth: 1,
        borderColor: "#60359c",
    },
    resultsTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#60359c",
        marginBottom: 15,
        textAlign: "center",
    },
    resultsText: {
        fontSize: 16,
        color: "#fff",
        marginBottom: 10,
        lineHeight: 22,
    },
});
