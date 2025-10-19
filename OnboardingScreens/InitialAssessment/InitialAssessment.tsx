import React, { useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../../App";
import { stringsToPronounce } from "../../sentences/onboardingSentences";
import { styles } from "./InitialAssessment.style";
import useInitialAssessment from "./useInitialAssessment";
import { analyzeRecording, createVoiceClone } from "./InitialAssessment.service";
import { SafeAreaView } from "react-native-safe-area-context";
import {ElevenLabsClient} from "@elevenlabs/elevenlabs-js";

const InitialAssessment = ({ navigation }: any) => {
    const theme = useContext(ThemeContext);

    const {
        isRecording,
        isDoneRecording,
        record,
        stopRecording,
        resetRecording,
    } = useInitialAssessment();

    const circleColor = "#2c1743";

    const handleBottomButtonPress = async () => {
        if (isRecording) {
            const uri = await stopRecording();
            console.log("Recorded audio URI:", uri);

            try {
                const cloneResult = await createVoiceClone(uri!, "userClone", "User's custom voice clone");
                console.log("Voice ID:", cloneResult);
            } catch (err) {
                console.error(err);
            }

        } else if (isDoneRecording) {
            navigation.replace("DoneRecording");
        } else {
            await record();
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.topContainer}>
                <Text style={styles.instructionText}>Repeat this phrase loud and clear!: </Text>
                <Text style={styles.sentenceText}>"{stringsToPronounce[0]}"</Text>
            </View>

            <View style={styles.middleContainer}>
                <TouchableOpacity
                    style={[styles.micButton, { backgroundColor: circleColor }]}
                    activeOpacity={0.8}
                    onPress={() => navigation.replace("MainTabs")}
                >
                    <FontAwesomeIcon icon={faMicrophone} size={80} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.button }]}
                    onPress={handleBottomButtonPress}
                >
                    <Text style={styles.buttonText}>
                        {isRecording ? "Recording" : isDoneRecording ? "Done" : "Record"}
                    </Text>
                </TouchableOpacity>

                {isDoneRecording && (
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: "none", marginTop: 12 }]}
                        onPress={() => {
                            resetRecording();
                            void record();
                        }}
                    >
                        <Text style={styles.buttonText}>Retake</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
};

export default InitialAssessment;
