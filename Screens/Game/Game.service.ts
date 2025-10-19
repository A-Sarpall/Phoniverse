import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SERVER_URL = "https://fcf604385834.ngrok-free.app";

/**
 * Generate TTS audio and store it persistently
 */
const generateAndStoreSSound = async (): Promise<Blob> => {
    try {
        // Check if we already have it cached
        // const cached = await AsyncStorage.getItem("s_sound_audio");
        // if (cached) {
        //     console.log("Using cached S sound audio");
        //     // Convert base64 back to blob
        //     const response = await fetch(cached);
        //     return response.blob();
        // }

        console.log("Generating new S sound audio...");

        // Generate "Sssss" audio using TTS
        const formData = new FormData();
        formData.append("text", "Sssss");

        const response = await fetch(`${SERVER_URL}/tts/generate`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`TTS generation failed: ${errorText}`);
        }

        const audioBlob = await response.blob();

        // Store as base64 for persistence
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(audioBlob);
        });

        const base64Audio = await base64Promise;
        await AsyncStorage.setItem("s_sound_audio", base64Audio);
        console.log("Cached S sound audio");

        return audioBlob;
    } catch (error) {
        console.error("Failed to generate/store S sound:", error);
        throw error;
    }
};

export const stitchMissionAudio = async (level: number) => {
    try {
        console.log(`Generating mission audio for level ${level}...`);

        if (level === 1) {
            // Generate TTS for the mission phrase
            console.log("Generating mission audio...");
            const formData = new FormData();
            formData.append("text", "Repeat after me cadet!: Ssssss");

            const response = await fetch(`${SERVER_URL}/tts/generate`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`TTS generation failed: ${errorText}`);
            }

            // Return audio blob
            return response.blob();
        }

        // Add more levels here
        throw new Error(`Level ${level} not implemented yet`);
    } catch (error) {
        console.error("Failed to generate mission audio:", error);
        throw error;
    }
};

/**
 * Clear cached audio (useful for testing/debugging)
 */
export const clearAudioCache = async () => {
    try {
        await AsyncStorage.removeItem("s_sound_audio");
        console.log("Audio cache cleared");
    } catch (error) {
        console.error("Failed to clear audio cache:", error);
    }
};

/**
 * Analyze recorded audio against "Ssssss" sound
 */
export const analyzeRecordingWithSSound = async (recordedUri: string) => {
    try {
        console.log("Analyzing recording against S sound...");

        // First, generate the "Ssssss" audio file
        const formData = new FormData();
        formData.append("text", "Ssssss");

        const ttsResponse = await fetch(`${SERVER_URL}/tts/generate`, {
            method: "POST",
            body: formData,
        });

        if (!ttsResponse.ok) {
            const errorText = await ttsResponse.text();
            throw new Error(`TTS generation failed: ${errorText}`);
        }

        // Get the TTS audio blob
        const ttsBlob = await ttsResponse.blob();

        // Create FormData for analysis
        const analysisFormData = new FormData();

        // Add the TTS audio as truth_audio
        analysisFormData.append("truth_audio", {
            uri: ttsBlob,
            name: "truth_audio.mp3",
            type: "audio/mpeg",
        } as any);

        // Add the recorded audio
        analysisFormData.append("recorded_audio", {
            uri:
                Platform.OS === "ios"
                    ? recordedUri.replace("file://", "")
                    : recordedUri,
            name: "recorded_audio.wav",
            type: "audio/wav",
        } as any);

        // Call the analyze endpoint
        const analyzeResponse = await fetch(`${SERVER_URL}/analyze`, {
            method: "POST",
            body: analysisFormData,
        });

        if (!analyzeResponse.ok) {
            const errorText = await analyzeResponse.text();
            throw new Error(`Analysis failed: ${errorText}`);
        }

        const result = await analyzeResponse.json();
        console.log("Analysis result:", result);

        return result;
    } catch (error) {
        console.error("Failed to analyze recording:", error);
        throw error;
    }
};
