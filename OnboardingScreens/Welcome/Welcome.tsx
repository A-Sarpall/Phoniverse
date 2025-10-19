import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "./Welcome.style";
import useWelcome from "./useWelcome";

const Welcome = ({ navigation }: any) => {
    const {theme, handleGetStarted}  = useWelcome(navigation);

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
