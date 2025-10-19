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

        if (level === 1) {
            // Generate TTS for the mission phrase with the tongue twister
            console.log("Generating mission audio...");
            const formData = new FormData();
            formData.append(
                "text",
                "Repeat after me cadet!: Sally sells sea shells by the sea shore"
            );

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

        // Get file info for both files
        // const truthInfo = await FileSystem.getInfoAsync(truthLocalUri);
        // const recordedInfo = await FileSystem.getInfoAsync(recordedUri);

        // console.log("=== FILE INFO CHECK ===");
        // console.log("Truth file exists:", truthInfo.exists);
        // console.log("Truth file size:", truthInfo.size, "bytes");
        // console.log("Truth file URI:", truthLocalUri);
        // console.log("Recorded file exists:", recordedInfo.exists);
        // console.log("Recorded file size:", recordedInfo.size, "bytes");
        // console.log("Recorded file URI:", recordedUri);

        // if (!truthInfo.exists || truthInfo.size === 0) {
        //     throw new Error(
        //         `Ground truth file is empty or doesn't exist! exists=${truthInfo.exists}, size=${truthInfo.size}`
        //     );
        // }

        // if (!recordedInfo.exists || recordedInfo.size === 0) {
        //     throw new Error(
        //         `Recorded file is empty or doesn't exist! exists=${recordedInfo.exists}, size=${recordedInfo.size}`
        //     );
        // }

        // // Create FormData for analysis
        // const analysisFormData = new FormData();

        // console.log("=== READING FILES AS BASE64 FOR UPLOAD ===");

        // // Read truth audio as base64 (we already have it from earlier)
        // console.log(
        //     "Truth audio already in base64, length:",
        //     base64Audio.length
        // );

        // // Read recorded audio as base64
        // console.log("Reading recorded audio as base64...");
        // const recordedBase64 = await FileSystem.readAsStringAsync(recordedUri, {
        //     encoding: FileSystem.EncodingType.Base64,
        // });
        // console.log("Recorded audio base64 length:", recordedBase64.length);

        // console.log("=== FORMDATA PREPARATION ===");

        // // Send base64 strings directly - server will decode them
        // analysisFormData.append("truth_audio_base64", base64Audio);
        // analysisFormData.append("truth_audio_filename", "truth_audio.mp3");
        // console.log("✓ Added truth_audio base64 to FormData");

        // analysisFormData.append("recorded_audio_base64", recordedBase64);
        // analysisFormData.append(
        //     "recorded_audio_filename",
        //     "recorded_audio.m4a"
        // );
        // console.log("✓ Added recorded_audio base64 to FormData");

        // console.log("=== SENDING REQUEST TO SERVER ===");

        // // Call the analyze endpoint
        // const analyzeResponse = await fetch(`${SERVER_URL}/analyze`, {
        //     method: "POST",
        //     body: analysisFormData,
        // });

        // console.log("Analysis response status:", analyzeResponse.status);

        // if (!analyzeResponse.ok) {
        //     const errorText = await analyzeResponse.text();
        //     console.error("=== ANALYSIS FAILED ===");
        //     console.error("Status:", analyzeResponse.status);
        //     console.error("Error response:", errorText);
        //     throw new Error(`Analysis failed: ${errorText}`);
        // }

        // const result = await analyzeResponse.json();
        // console.log("=== ANALYSIS SUCCESS ===");
        // console.log("Analysis result:", JSON.stringify(result, null, 2));

        // // Clean up temporary files
        // await FileSystem.deleteAsync(truthLocalUri, { idempotent: true });
        // console.log("Cleaned up temporary ground truth file");

        return "You did it!";
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
