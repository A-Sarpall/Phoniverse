import React, { createContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UseWelcome from "./OnboardingScreens/Welcome/useWelcome";
import InitialAssessment from "./OnboardingScreens/InitialAssessment/InitialAssessment";
import {StatusBar} from "react-native";

const Stack = createNativeStackNavigator();

interface Theme {
    background: string;
    text: string;
    button: string;
}

export const ThemeContext = createContext<Theme>({
    background: "#160b20",
    text: "#fff",
    button: "#60359c",
});

export default function App() {
    const theme = {
        background: "#160b20",
        text: "#fff",
        button: "#60359c",
    };

    return (
        <ThemeContext.Provider value={theme}>
            <NavigationContainer>
                <StatusBar barStyle='dark-content' />
                <Stack.Navigator initialRouteName="UseWelcome">
                    <Stack.Screen name="Welcome" component={UseWelcome} options={{ headerShown: false }} />
                    <Stack.Screen name="Initial Assessment" component={InitialAssessment} options={{ headerShown: true }} />
                </Stack.Navigator>
            </NavigationContainer>
        </ThemeContext.Provider>
    );
}
