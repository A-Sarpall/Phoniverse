import React, { useContext, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../../App";
import { stringsToPronounce } from "../../sentences/onboardingSentences";
import { styles } from "./InitialAssessment.style";
import useInitialAssessment from "./useInitialAssessment";
import {
    createVoiceClone,
    createTrainerVoice,
} from "./InitialAssessment.service";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system/legacy";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const InitialAssessment = ({ navigation }: any) => {
    const theme = useContext(ThemeContext);

    // Generate stars for background
    const stars = useMemo(() => {
        const arr = [];
        for (let i = 0; i < 100; i++) {
            arr.push({
                id: i,
                x: Math.random() * screenWidth,
                y: Math.random() * screenHeight,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.6 + 0.4,
                color: Math.random() > 0.7 ? "#cce6ff" : "#ffffff",
            });
        }
        return arr;
    }, []);

    const {
        isRecording,
        isDoneRecording,
        record,
        stopRecording,
        resetRecording,
        recordingUri,
        setIsLoading,
        isLoading,
    } = useInitialAssessment();

    const circleColor = "#4A2D63";

    // Generate and play trainer voice on component mount
    useEffect(() => {
        const generateAndPlayTrainerVoice = async () => {
            try {
                console.log(
                    "Generating trainer voice for:",
                    stringsToPronounce[0]
                );

                const audioBlob = await createTrainerVoice(
                    "Repeat this phrase loud and clear:" +
                        stringsToPronounce[0]
                );

                // Convert blob to base64 and save to file
                const reader = new FileReader();
                reader.onloadend = async () => {
                    try {
                        const result = reader.result as string;
                        
                        // Extract base64 data (after the comma in data URI)
                        const base64Audio = result.includes(",")
                            ? result.split(",")[1]
                            : result;

                        // Save to a local file
                        const audioFileUri = `${FileSystem.cacheDirectory}trainer_voice_temp.mp3`;
                        await FileSystem.writeAsStringAsync(audioFileUri, base64Audio, {
                            encoding: "base64" as any,
                        });

                        // Load and play the audio file
                        const sound = new Audio.Sound();
                        await sound.loadAsync({ uri: audioFileUri });

                        // Set volume to 100% (1.0 = 100%)
                        await sound.setVolumeAsync(1.0);

                        await sound.playAsync();

                        // Clean up after playback completes
                        sound.setOnPlaybackStatusUpdate((status) => {
                            if (status.isLoaded && status.didJustFinish) {
                                sound.unloadAsync();
                                // Optionally delete the temp file
                                FileSystem.deleteAsync(audioFileUri, { idempotent: true });
                            }
                        });

                        console.log(
                            "Trainer voice played successfully at max volume"
                        );
                    } catch (error) {
                        console.error("Error playing trainer voice:", error);
                    }
                };
                reader.onerror = (error) => {
                    console.error("FileReader error:", error);
                };
                reader.onerror = (error) => {
                    console.error("FileReader error in trainer voice:", error);
                };
                reader.readAsDataURL(audioBlob);
            } catch (error) {
                console.error("Failed to generate/play trainer voice:", error);
                // Don't block the UI if trainer voice fails
            }
        };

        generateAndPlayTrainerVoice();
    }, []);

    const handleBottomButtonPress = async () => {
        if (isRecording) {
            // 🟥 Stop recording
            const uri = await stopRecording();
            console.log("Finished recording, saved URI:", uri);
        } else if (isDoneRecording) {
            // 🟩 Done recording → Upload to clone
            if (!recordingUri) {
                console.warn("No recording found!");
                return;
            }

            try {
                setIsLoading(true);
                console.log("Uploading to create voice clone...");

                const cloneResult = await createVoiceClone(
                    recordingUri,
                    "userClone",
                    "User's custom voice clone"
                );

                console.log("Voice clone created:", cloneResult);

                // ✅ Extract and persist the voice ID
                const voiceId = cloneResult?.id || cloneResult?.voice_id;
                if (voiceId) {
                    await AsyncStorage.setItem("userVoiceId", voiceId);
                    console.log("Stored voice ID:", voiceId);
                } else {
                    console.warn("No voice ID returned from server");
                }

                // ✅ Mark onboarding complete
                await AsyncStorage.setItem("hasCompletedOnboarding", "true");

                setIsLoading(false);
                navigation.replace("MainTabs");
            } catch (err) {
                console.error("Error creating voice clone:", err);
                setIsLoading(false);
            }
        } else {
            // 🟦 Start recording
            await record();
        }
    };

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: "#000" }]}
        >
            {/* Stars Background */}
            {stars.map((star) => (
                <View
                    key={star.id}
                    style={{
                        position: "absolute",
                        left: star.x,
                        top: star.y,
                        width: star.size,
                        height: star.size,
                        borderRadius: star.size / 2,
                        backgroundColor: star.color,
                        opacity: star.opacity,
                        shadowColor: star.color,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.8,
                        shadowRadius: 2,
                        elevation: 3,
                    }}
                />
            ))}
            <View style={styles.topContainer}>
                <Text style={styles.instructionText}>
                    Repeat this phrase loud and clear:
                </Text>
                <Text style={styles.sentenceText}>
                    "{stringsToPronounce[0]}"
                </Text>
            </View>

            <View style={styles.middleContainer}>
                <TouchableOpacity
                    style={[
                        styles.micButton,
                        {
                            backgroundColor: isRecording ? "#dc3545" : circleColor,
                            borderColor: isRecording ? "#dc3545" : "#8B5FBF",
                        },
                    ]}
                    activeOpacity={0.8}
                    onPress={handleBottomButtonPress}
                    disabled={isLoading}
                >
                    <FontAwesomeIcon
                        icon={faMicrophone}
                        size={80}
                        color="white"
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[
                        styles.button,
                        { backgroundColor: isLoading ? "#999" : theme.button },
                    ]}
                    onPress={handleBottomButtonPress}
                    disabled={isLoading}
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
        </SafeAreaView>
    );
};

export default InitialAssessment;
