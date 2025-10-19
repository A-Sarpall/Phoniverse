import {useContext} from "react";
import {ThemeContext} from "../../App";
import {Audio} from "expo-av";
import {Alert} from "react-native";

const useWelcome = (navigation: any) => {
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

    return {
        handleGetStarted,
        theme,
    }
}

export default useWelcome;
