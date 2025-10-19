import { useState, useRef, useEffect } from "react";
import { Audio } from "expo-av";
import { Alert } from "react-native";
import {
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioRecorder,
    useAudioRecorderState,
} from "expo-audio";

const MAX_RECORDING_DURATION = 15000; // 15 seconds

const useInitialAssessment = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [isDoneRecording, setIsDoneRecording] = useState(false);
    const [recordingUri, setRecordingUri] = useState<string | null>(null);

    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(audioRecorder);
    const stopTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        (async () => {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                Alert.alert("Permission to access microphone was denied");
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

        stopTimeoutRef.current = setTimeout(() => {
            void stopRecording();
        }, MAX_RECORDING_DURATION);
    };

    const stopRecording = async () => {
        if (stopTimeoutRef.current) {
            clearTimeout(stopTimeoutRef.current);
            stopTimeoutRef.current = null;
        }

        await audioRecorder.stop();
        setIsRecording(false);
        setIsDoneRecording(true);

        const uri = audioRecorder.uri;
        setRecordingUri(uri ?? null);
        return uri;
    };

    const resetRecording = () => {
        if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
        setIsRecording(false);
        setIsDoneRecording(false);
        setRecordingUri(null);
    };

    return {
        isRecording,
        isDoneRecording,
        record,
        stopRecording,
        resetRecording,
        setIsRecording,
        setIsDoneRecording,
        recordingUri,
        recorderState,
        audioRecorder,
    };
};

export default useInitialAssessment;
