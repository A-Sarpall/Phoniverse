import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "./Welcome.style";
import useWelcome from "./useWelcome";
import GalaxyBackground from "./GalaxyBackground";

const Welcome = ({ navigation }: any) => {
    const {theme, handleGetStarted}  = useWelcome(navigation);

    return (
        <View style={styles.container}>
            <GalaxyBackground />
            <View style={styles.content}>
                <Text style={[styles.title, { color: theme.text }]}>
                    Welcome to Phoniverse!
                </Text>
                <Text style={[styles.subtitle, { color: theme.text }]}>
                    Overcome your speech impediments with <Text style={{fontWeight: 'bold', fontStyle: 'italic'}}>A</Text>L<Text style={{fontWeight: 'bold', fontStyle: 'italic'}}>I</Text>EN-powered speech therapy.
                </Text>
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.button }]}
                onPress={handleGetStarted}
            >
                <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
        </View>
    );
};

export default Welcome;
