import { useContext, useEffect } from "react";
import { ThemeContext } from "../../App";
import { Audio } from "expo-av";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useWelcome = (navigation: any) => {
    const theme = useContext(ThemeContext);

    useEffect(() => {
        void handleDone();
    }, []);

    const handleGetStarted = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();

            if (status === "granted") {
                navigation.replace("Initial Assessment");
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

    const handleDone = async () => {
        try {
            await AsyncStorage.getItem("hasCompletedOnboarding").then(
                (result) => {
                    if (result) {
                        navigation.replace("MainTabs");
                    }
                }
            );
        } catch (error) {
            console.error("Error saving onboarding status:", error);
        }
    };

    return {
        handleGetStarted,
        // handleDone,
        theme,
    };
};

export default useWelcome;
