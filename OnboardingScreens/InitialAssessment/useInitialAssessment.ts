import {useState, useRef, useEffect} from "react";
import { Audio } from "expo-av";
import {AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder, useAudioRecorderState} from "expo-audio";
import {Alert} from "react-native";

const useInitialAssessment = (totalSentences: number) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [isDoneRecording, setIsDoneRecording] = useState(false);
    const [recordings, setRecordings] = useState<string[]>([]);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(audioRecorder);

    useEffect(() => {
        (async () => {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                Alert.alert('Permission to access microphone was denied');
            }

            await setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
            });
        })();
    }, []);

    const record = async () => {
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
        setIsRecording(true);
    };

    const stopRecording = async () => {
        await audioRecorder.stop();
        setIsDoneRecording(true);
        setIsRecording(false);
    };

    const nextSentence = () => {
        if (currentIndex < totalSentences - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsDoneRecording(false);
            recordingRef.current = null;
        } else {
            console.log("All recordings:", recordings);
            alert("All sentences recorded!");
        }
    };

    const resetRecording = () => {
        recordingRef.current = null;
        setIsRecording(false);
        setIsDoneRecording(false);
    };

    return {
        currentIndex,
        isRecording,
        isDoneRecording,
        recordings,
        record,
        recorderState,
        stopRecording,
        audioRecorder,
        nextSentence,
        resetRecording,
        setIsRecording,
        setIsDoneRecording,
    };
};

export default useInitialAssessment;
