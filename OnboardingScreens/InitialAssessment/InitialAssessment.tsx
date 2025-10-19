import React, { useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../../App";
import { stringsToPronounce } from "../../sentences/onboardingSentences";
import { styles } from "./InitialAssessment.style";
import useInitialAssessment from "./useInitialAssessment";
import {SafeAreaView} from "react-native-safe-area-context";

const InitialAssessment = ({navigation}: any) => {
    const theme = useContext(ThemeContext);

    const {
        currentIndex,
        isRecording,
        isDoneRecording,
        record,
        stopRecording,
        audioRecorder,
        setIsRecording,
        setIsDoneRecording,
        resetRecording,
    } = useInitialAssessment(stringsToPronounce.length);

    const circleColor = "#2c1743";

    const handleBottomButtonPress = () => {
        if (isRecording) {
            void stopRecording().then(() => {
                console.log(audioRecorder.uri);
            });
        } else if (isDoneRecording) {
            navigation.replace("DoneRecording");
        } else {
            void record();
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.topContainer}>
                <Text style={styles.instructionText}>Can you pronounce</Text>
                <Text style={styles.sentenceText}>
                    "{stringsToPronounce[currentIndex]}"
                </Text>
            </View>

            <View style={styles.middleContainer}>
                <TouchableOpacity
                    style={[styles.micButton, { backgroundColor: circleColor }]}
                    activeOpacity={0.8}
                    onPress={() => {navigation.replace("MainTabs")}}
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
                            setIsRecording(true);
                            setIsDoneRecording(false);
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
