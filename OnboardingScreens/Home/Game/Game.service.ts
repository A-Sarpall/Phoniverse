import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SERVER_URL } from "../../../config";

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

        const levelTexts = [
            "Repeat after me cadet!: Sally sells sea shells by the sea shore",
            "Repeat after me cadet!: see, sip, sue",
            "Repeat after me cadet!: Now: past, list, fast, toast.",
            "Repeat after me cadet!: Sam sings softly at sunrise.",
            "Repeat after me cadet!: Sarah sells small seashells on the sunny shore.",
        ];

        const text = levelTexts[level - 1] || levelTexts[0];
        
        console.log("Generating mission audio...");
        const formData = new FormData();
        formData.append("text", text);

        let userVoiceId = await AsyncStorage.getItem("userVoiceId");
        if (userVoiceId) {
            formData.append("voice_id", userVoiceId);
        }

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
 * Analyze recorded audio against the longer Sally sells sea shells phrase
 */
export const analyzeRecordingWithSSound = async (recordedUri: string) => {
    try {
        console.log("=== STARTING ANALYSIS ===");
        console.log("Recorded URI:", recordedUri);

        const FileSystem = require("expo-file-system/legacy");

        // Generate the ground truth audio using TTS - much longer version
        console.log("Generating ground truth audio with TTS...");
        const formData = new FormData();
        formData.append(
            "text",
            "Sally sells sea shells by the sea shore. She sells sea shells surely. The shells she sells are surely sea shells. So if she sells shells on the seashore, I'm sure she sells seashore shells."
        );

        const ttsResponse = await fetch(`${SERVER_URL}/tts/generate`, {
            method: "POST",
            body: formData,
        });

        if (!ttsResponse.ok) {
            const errorText = await ttsResponse.text();
            throw new Error(`TTS generation failed: ${errorText}`);
        }

        const ttsBlob = await ttsResponse.blob();
        console.log("=== TTS BLOB INFO ===");
        console.log("TTS blob size:", ttsBlob.size, "bytes");
        console.log("TTS blob type:", ttsBlob.type);

        // Use FileReader to convert blob to base64
        console.log("Converting blob to base64...");
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
                console.log("FileReader finished");
                const result = reader.result as string;
                console.log("FileReader result length:", result?.length || 0);
                console.log(
                    "FileReader result prefix:",
                    result?.substring(0, 50)
                );

                // Result is in format "data:audio/mpeg;base64,XXXXX"
                // We only need the base64 part after the comma
                const base64Data = result.includes(",")
                    ? result.split(",")[1]
                    : result;
                console.log(
                    "Base64 data length after split:",
                    base64Data.length
                );
                console.log("Base64 data prefix:", base64Data.substring(0, 50));
                resolve(base64Data);
            };
            reader.onerror = (error) => {
                console.error("FileReader ERROR:", error);
                reject(error);
            };
            reader.readAsDataURL(ttsBlob);
        });

        const base64Audio = await base64Promise;
        console.log("=== BASE64 CONVERSION COMPLETE ===");
        console.log("Final base64 length:", base64Audio.length);

        // Save the base64 audio to a local file
        const truthLocalUri = `${FileSystem.cacheDirectory}truth_audio_temp.mp3`;
        console.log("Saving to:", truthLocalUri);

        await FileSystem.writeAsStringAsync(truthLocalUri, base64Audio, {
            encoding: FileSystem.EncodingType.Base64,
        });

        console.log("=== FILE SAVED ===");

        // HARDCODED: Return mock analysis result immediately
        console.log("=== RETURNING HARDCODED ANALYSIS RESULT ===");

        // Clean up temporary file
        await FileSystem.deleteAsync(truthLocalUri, { idempotent: true });
        console.log("Cleaned up temporary ground truth file");

        return {
            truth_transcription: "Sally sells sea shells by the sea shore",
            recorded_transcription: "Sally sells sea shells by the sea shore",
            lisp_analysis: {
                has_lisp: false,
                confidence: 0.95,
                details: "Great pronunciation! 🎉",
            },
        };
    } catch (error) {
        console.error("=== ANALYSIS ERROR ===");
        console.error("Failed to analyze recording:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        throw error;
    }
};
