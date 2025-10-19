import React, { useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../../App";
import { stringsToPronounce } from "../../sentences/onboardingSentences";
import { styles } from "./InitialAssessment.style";
import useInitialAssessment from "./useInitialAssessment";
import { createVoiceClone } from "./InitialAssessment.service";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const InitialAssessment = ({ navigation }: any) => {
    const theme = useContext(ThemeContext);

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

    const circleColor = "#2c1743";

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
            style={[styles.container, { backgroundColor: theme.background }]}
        >
            <View style={styles.topContainer}>
                <Text style={styles.instructionText}>
                    Repeat this phrase loud and clear!:
                </Text>
                <Text style={styles.sentenceText}>
                    "{stringsToPronounce[0]}"
                </Text>
            </View>

            <View style={styles.middleContainer}>
                <TouchableOpacity
                    style={[styles.micButton, { backgroundColor: circleColor }]}
                    activeOpacity={0.8}
                    onPress={handleBottomButtonPress}
                    disabled={isLoading}
                >
                    <FontAwesomeIcon icon={faMicrophone} size={80} color="white" />
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
