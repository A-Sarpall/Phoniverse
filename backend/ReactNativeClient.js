// React Native Client Example
// Example usage of Speech Analysis API from React Native

import React, { useState } from "react";
import { View, Button, Text, StyleSheet } from "react-native";

// API Configuration
const API_BASE_URL = "https://fcf604385834.ngrok-free.app"; // Updated to ngrok URL

/**
 * Analyze two audio files for speech differences
 * @param {string} truthUri - URI of truth/reference audio file
 * @param {string} recordedUri - URI of recorded audio file
 * @returns {Promise<object>} Analysis results
 */
export async function analyzeSpeech(truthUri, recordedUri) {
    try {
        // Create FormData with audio files
        const formData = new FormData();

        // Add truth audio file
        formData.append("truth", {
            uri: truthUri,
            type: "audio/wav", // or 'audio/mp3'
            name: "truth.wav",
        });

        // Add recorded audio file
        formData.append("recorded", {
            uri: recordedUri,
            type: "audio/wav", // or 'audio/mp3'
            name: "recorded.wav",
        });

        // Send request to API
        const response = await fetch(`${API_BASE_URL}/analyze`, {
            method: "POST",
            body: formData,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        // Parse results
        const results = await response.json();

        return results;
        // Returns:
        // {
        //   "Truth": {
        //     "Transcription": "HEY THERE I'M SO GLAD YOU COULD MAKE IT..."
        //   },
        //   "Recorded": {
        //     "Transcription": "HEY THERE I'M SO GLAD YOU CUN MAKE IT..."
        //   }
        // }
    } catch (error) {
        console.error("Speech analysis failed:", error);
        throw error;
    }
}

/**
 * Check if API server is healthy
 * @returns {Promise<object>} Health status
 */
export async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return await response.json();
    } catch (error) {
        console.error("Health check failed:", error);
        throw error;
    }
}

// Example Component
export default function SpeechAnalysisScreen() {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            // Replace with actual file URIs from your audio recorder/picker
            const truthUri = "file:///path/to/truth.wav";
            const recordedUri = "file:///path/to/recorded.wav";

            const analysisResults = await analyzeSpeech(truthUri, recordedUri);
            setResults(analysisResults);

            console.log("Truth:", analysisResults.Truth.Transcription);
            console.log("Recorded:", analysisResults.Recorded.Transcription);
        } catch (error) {
            alert("Analysis failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Button
                title={loading ? "Analyzing..." : "Analyze Speech"}
                onPress={handleAnalyze}
                disabled={loading}
            />

            {results && (
                <View style={styles.results}>
                    <Text style={styles.header}>Results:</Text>
                    <Text>Truth: {results.Truth.Transcription}</Text>
                    <Text>Recorded: {results.Recorded.Transcription}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
    },
    results: {
        marginTop: 20,
        padding: 10,
        backgroundColor: "#f0f0f0",
    },
    header: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
});
