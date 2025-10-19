import React, { useContext } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Audio } from "expo-av";
import { styles } from "./Welcome.style";
import { ThemeContext } from "../../App";

const Welcome = ({ navigation }: any) => {
    const theme = useContext(ThemeContext);

    const handleGetStarted = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();

            if (status === "granted") {
                navigation.navigate("Initial Assessment");
            } else {
                Alert.alert(
                    "Permission Required",
                    "We need access to your microphone to record short audio clips."
                );
            }
        } catch (error) {
            console.error("Error requesting permission:", error);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]}>
                    hey, welcome to appName!
                </Text>
                <Text style={[styles.subtitle, { color: theme.text }]}>
                    we just need a couple of short audio clips from you to get started.
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.button }]}
                onPress={handleGetStarted}
            >
                <Text style={styles.buttonText}>get started</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Welcome;
