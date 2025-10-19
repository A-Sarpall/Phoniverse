import React, { createContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";
import Welcome from "./OnboardingScreens/Welcome/Welcome";
import InitialAssessment from "./OnboardingScreens/InitialAssessment/InitialAssessment";
import MainTabs from "./MainTabs";
import Game from "./Screens/Game/Game"; // 👈 import your Game screen

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
                <StatusBar barStyle="light-content" />
                <Stack.Navigator
                    initialRouteName="Welcome"
                    screenOptions={{
                        headerStyle: { backgroundColor: "#392059" },
                        headerTitleStyle: { color: "#fff" },
                        headerTintColor: "#fff",
                    }}
                >
                    <Stack.Screen
                        name="Welcome"
                        component={Welcome}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Initial Assessment"
                        component={InitialAssessment}
                        options={{ title: "Initial Assessment" }}
                    />

                    {/* 🧭 Main app (tab navigation) */}
                    <Stack.Screen
                        name="MainTabs"
                        component={MainTabs}
                        options={{ headerShown: false }}
                    />

                </Stack.Navigator>
            </NavigationContainer>
        </ThemeContext.Provider>
    );
}
