import React, {useContext, useLayoutEffect, useState} from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Modal,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import useInitialAssessment from "../../OnboardingScreens/InitialAssessment/useInitialAssessment";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "../../App";
import { levelSentences } from "../../sentences/levelSentences";

const Game = ({ navigation }: any) => {
    const route = useRoute();
    const planetNumber = route.params?.planetNumber || 1;
    const [prompt] = useState("Say this phrase clearly to complete your mission:");
    const [modalVisible, setModalVisible] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const theme = useContext(ThemeContext);

    const {
        isRecording,
        isDoneRecording,
        record,
        stopRecording,
        resetRecording,
        isLoading,
    } = useInitialAssessment();

    useLayoutEffect(() => {
        navigation.setOptions({ title: `Planet ${planetNumber}` });
    }, [navigation, planetNumber]);

    const handleRecordPress = async () => {
        if (isRecording) {
            const uri = await stopRecording();
            console.log("Recording saved:", uri);

            // For demo — generate random score
            const randomScore = Math.floor(Math.random() * 100);
            setScore(randomScore);
            setModalVisible(true);
        } else if (isDoneRecording) {
            console.log("Mission complete for Planet", planetNumber);
            navigation.navigate("Home", { completedPlanet: planetNumber });
        } else {
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
                {/* Alien image */}
                <Image
                    source={require("../../HackTX Drawings/TrainingAlien.png")}
                    style={styles.alienImage}
                />

                {/* Chatbox overlay */}
                <View style={styles.chatboxContainer}>
                    <Image
                        source={require("../../HackTX Drawings/Chatbox Background Removed.png")}
                        style={styles.chatboxImage}
                    />
                    <Text style={styles.chatText}>{levelSentences[0]}</Text>
                </View>
            </View>

            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        { backgroundColor: isLoading ? "#999" : theme.button },
                    ]}
                    disabled={isLoading}
                    onPress={handleRecordPress}
                >
                    <Text style={styles.buttonText}>
                        {isLoading
                            ? "Loading..."
                            : isRecording
                                ? "Finish Recording"
                                : isDoneRecording
                                    ? "Done"
                                    : "Record"}
                    </Text>
                </TouchableOpacity>

                {isDoneRecording && (
                    <TouchableOpacity
                        style={[
                            styles.button,
                            { backgroundColor: "transparent", marginTop: 12 },
                        ]}
                        onPress={() => {
                            resetRecording();
                            void record();
                        }}
                        disabled={isLoading}
                    >
                        <Text style={styles.buttonText}>Retake</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* ✅ Score Modal */}
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
                            style={[styles.button, { backgroundColor: "#60359c", width: "80%" }]}
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
});
