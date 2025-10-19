import React, { useContext, useLayoutEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Modal,
    ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from "expo-av";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../../../App";
import { levelSentences } from "../../../sentences/levelSentences";
import useGame from "./useGame";
import { stitchMissionAudio, analyzeRecordingWithSSound } from "./Game.service";

const SERVER_URL = "https://134260ef2747.ngrok-free.app";

const Game = ({ navigation }: any) => {
    const route = useRoute();
    const planetNumber = (route.params as any)?.planetNumber || 1;
    const [modalVisible, setModalVisible] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [missionStarted, setMissionStarted] = useState(false);
    const [missionCompleted, setMissionCompleted] = useState(false);
    const theme = useContext(ThemeContext);

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

            const audioBlob = await stitchMissionAudio(planetNumber);

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
            // Stop recording and immediately start analysis
            const uri = await stopRecording();
            console.log("Finished recording, saved URI:", uri);

            if (!uri) {
                console.warn("No recording URI returned!");
                return;
            }

            try {
                setIsLoading(true);
                console.log("Analyzing recording...");

                // Play "I am analyzing" audio from trainer
                const analyzingFormData = new FormData();
                analyzingFormData.append(
                    "text",
                    "I am analyzing your pronunciation..."
                );

                const analyzingResponse = await fetch(
                    SERVER_URL + "/tts/generate",
                    {
                        method: "POST",
                        body: analyzingFormData,
                    }
                );

                if (analyzingResponse.ok) {
                    const analyzingBlob = await analyzingResponse.blob();
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64Audio = reader.result as string;
                        const sound = new Audio.Sound();
                        await sound.loadAsync({ uri: base64Audio });
                        await sound.playAsync();
                    };
                    reader.readAsDataURL(analyzingBlob);
                }

                // Analyze the recording
                const result = await analyzeRecordingWithSSound(uri);
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

    const handleGoHome = () => {
        setModalVisible(false);
        navigation.navigate("Home", { completedPlanet: planetNumber });
    };

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <View style={styles.characterContainer}>
                <Image
                    source={require("../../../assets/trainer.png")}
                    style={styles.alienImage}
                />

                <View style={styles.chatboxContainer}>
                    <Image
                        source={require("../../../assets/HackTX Drawings/chatbox.png")}
                        style={styles.chatboxImage}
                    />
                    <Text style={styles.chatText}>{levelSentences[0]}</Text>
                </View>
            </View>

            <View style={styles.bottomContainer}>
                {!missionStarted ? (
                    <TouchableOpacity
                        style={[
                            styles.button,
                            {
                                backgroundColor: isLoading
                                    ? "#999"
                                    : theme.button,
                            },
                        ]}
                        onPress={handleStartMission}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>
                                🚀 Start Mission
                            </Text>
                        )}
                    </TouchableOpacity>
                ) : !missionCompleted ? (
                    <View style={styles.missionContent}>
                        <Text style={styles.instructionText}>
                            {isLoading
                                ? "Analyzing your pronunciation..."
                                : 'Now it\'s your turn! Say "Ssssss"'}
                        </Text>

                        {/* Microphone Button */}
                        <TouchableOpacity
                            style={[
                                styles.micButton,
                                isRecording && styles.micButtonRecording,
                                isLoading && styles.micButtonDisabled,
                            ]}
                            activeOpacity={0.8}
                            onPress={handleRecordButtonPress}
                            disabled={isLoading || analysisResult !== null}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="large" />
                            ) : (
                                <FontAwesomeIcon
                                    icon={faMicrophone}
                                    size={60}
                                    color="white"
                                />
                            )}
                        </TouchableOpacity>

                        {/* Record Button - Only show if no analysis result yet */}
                        {!analysisResult && (
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
                                        : "Start Recording"}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Retake Button - Only show after analysis */}
                        {analysisResult && (
                            <TouchableOpacity
                                style={styles.retakeButton}
                                onPress={() => {
                                    setAnalysisResult(null);
                                    resetRecording();
                                }}
                                disabled={isLoading}
                            >
                                <Text style={styles.retakeButtonText}>
                                    Try Again
                                </Text>
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
                    <Text style={styles.completedText}>
                        Mission Completed! 🎉
                    </Text>
                )}
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Mission Complete!</Text>
                        <Text style={styles.modalScoreText}>
                            Your Score:{" "}
                            <Text style={styles.modalScore}>
                                {score !== null ? `${score}%` : "--"}
                            </Text>
                        </Text>

                        <TouchableOpacity
                            style={[
                                styles.button,
                                { backgroundColor: "#60359c", width: "80%" },
                            ]}
                            onPress={handleGoHome}
                        >
                            <Text style={styles.buttonText}>Go Back Home</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default Game;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 20,
    },
    bottomContainer: {
        width: "100%",
        alignItems: "center",
    },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: "90%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    characterContainer: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        width: "100%",
        height: "55%",
    },
    alienImage: {
        width: "80%",
        height: "100%",
        resizeMode: "contain",
    },
    chatboxContainer: {
        position: "absolute",
        top: -60,
        right: -20,
        width: "90%",
        aspectRatio: 2,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    chatboxImage: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
        position: "absolute",
    },
    chatText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
        paddingHorizontal: 16,
        lineHeight: 22,
        marginBottom: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "85%",
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 30,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 26,
        fontWeight: "700",
        color: "#60359c",
        marginBottom: 16,
    },
    modalScoreText: {
        fontSize: 20,
        marginBottom: 24,
        color: "#333",
    },
    modalScore: {
        fontWeight: "bold",
        color: "#60359c",
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
    micButtonDisabled: {
        backgroundColor: "#999",
        shadowColor: "#999",
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
        width: "90%",
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
    finishButton: {
        backgroundColor: "#28a745",
        borderRadius: 15,
        padding: 15,
        alignItems: "center",
        marginTop: 15,
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
    completedText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#28a745",
        textAlign: "center",
        marginBottom: 20,
    },
});
