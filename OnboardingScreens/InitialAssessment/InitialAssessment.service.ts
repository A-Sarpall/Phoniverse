import { Platform } from "react-native";

const SERVER_URL = "https://9923a0a8175d.ngrok-free.app/";

const createFileObject = (uri: string, name: string, type: string) => {
    const fileUri = Platform.OS === "ios" ? uri.replace("file://", "") : uri;
    return { uri: fileUri, name, type } as any;
};

export const analyzeRecording = async (recordedUri: string, truthUri: string) => {
    const formData = new FormData();
    formData.append("truth_audio", createFileObject(truthUri, "truth_audio.wav", "audio/wav"));
    formData.append("recorded_audio", createFileObject(recordedUri, "recorded_audio.wav", "audio/wav"));

    const response = await fetch(`${SERVER_URL}/analyze`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
    }

    return response.json();
};

export const createVoiceClone = async (
    recordedUri: string,
    name: string = "userClone",
    description: string = "User's custom voice clone"
) => {
    const formData = new FormData();
    formData.append("audio_file", createFileObject(recordedUri, "recorded_audio.wav", "audio/wav"));
    formData.append("name", name);
    formData.append("description", description);

    const response = await fetch(`${SERVER_URL}/tts/clone`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText}`);
    }

    return response.json(); // contains voice_id
};
