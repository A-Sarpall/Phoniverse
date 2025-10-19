import React, { createContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InitialAssessment from "./OnboardingScreens/InitialAssessment/InitialAssessment";
import {StatusBar} from "react-native";
import Welcome from "./OnboardingScreens/Welcome/Welcome";

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
                <StatusBar barStyle='light-content' />
                <Stack.Navigator initialRouteName="Welcome">
                    <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
                    <Stack.Screen name="Initial Assessment" component={InitialAssessment} options={{ headerShown: true }} />
                </Stack.Navigator>
            </NavigationContainer>
        </ThemeContext.Provider>
    );
}
