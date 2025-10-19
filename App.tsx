import React, { createContext, useEffect, useState, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";
import Welcome from "./OnboardingScreens/Welcome/Welcome";
import InitialAssessment from "./OnboardingScreens/InitialAssessment/InitialAssessment";
import MainTabs from "./MainTabs";
import Game from "./OnboardingScreens/Home/Game/Game";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createNativeStackNavigator();

interface Theme {
    background: string;
    text: string;
    button: string;
}

interface PointsContextType {
    totalPoints: number;
    addPoints: (points: number) => void;
    spendPoints: (points: number) => void;
}

interface AvatarContextType {
    purchasedItems: any[];
    equippedItems: any[];
    addPurchasedItem: (item: any) => void;
    removePurchasedItem: (itemId: string) => void;
    equipItem: (item: any) => void;
    unequipItem: (itemId: string) => void;
}

export const ThemeContext = createContext<Theme>({
    background: "#160b20",
    text: "#fff",
    button: "#8B5FBF",
});

export const PointsContext = createContext<PointsContextType>({
    totalPoints: 0,
    addPoints: () => {},
    spendPoints: () => {},
});

export const AvatarContext = createContext<AvatarContextType>({
    purchasedItems: [],
    equippedItems: [],
    addPurchasedItem: () => {},
    removePurchasedItem: () => {},
    equipItem: () => {},
    unequipItem: () => {},
});

export default function App() {
    const [totalPoints, setTotalPoints] = useState(100); // Start with 0 points
    const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
    const [equippedItems, setEquippedItems] = useState<any[]>([]);

    const addPoints = useCallback((points: number) => {
        setTotalPoints((prev) => prev + points);
    }, []);

    const spendPoints = useCallback((points: number) => {
        setTotalPoints((prev) => Math.max(0, prev - points));
    }, []);

    const addPurchasedItem = useCallback((item: any) => {
        setPurchasedItems((prev) => [...prev, item]);
    }, []);

    const removePurchasedItem = useCallback((itemId: string) => {
        setPurchasedItems((prev) => prev.filter((item) => item.id !== itemId));
    }, []);

    const equipItem = useCallback((item: any) => {
        setEquippedItems([item]); // Only allow one item to be equipped at a time
    }, []);

    const unequipItem = useCallback((itemId: string) => {
        setEquippedItems((prev) => prev.filter((item) => item.id !== itemId));
    }, []);

    const theme = {
        background: "#160b20",
        text: "#fff",
        button: "#8B5FBF",
    };
    const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<
        boolean | null
    >(null);

    useEffect(() => {
        (async () => {
            // Clear onboarding cache to force fresh onboarding flow
            await AsyncStorage.removeItem("hasCompletedOnboarding");
            await AsyncStorage.removeItem("userVoiceId");
            setHasCompletedOnboarding(false); // Force onboarding to show
        })();
    }, []);

    if (hasCompletedOnboarding === null) {
        return null;
    }

    const pointsContextValue = {
        totalPoints,
        addPoints,
        spendPoints,
    };

    const avatarContextValue = {
        purchasedItems,
        equippedItems,
        addPurchasedItem,
        removePurchasedItem,
        equipItem,
        unequipItem,
    };

    return (
        <ThemeContext.Provider value={theme}>
            <PointsContext.Provider value={pointsContextValue}>
                <AvatarContext.Provider value={avatarContextValue}>
                    <NavigationContainer>
                        <StatusBar barStyle="light-content" />
                        <Stack.Navigator
                            initialRouteName={"Welcome"}
                            screenOptions={{
                                headerStyle: { backgroundColor: "#5A3A7A" },
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
                                options={{ headerShown: false }}
                            />

                            {/* 🧭 Main app (tab navigation) */}
                            <Stack.Screen
                                name="MainTabs"
                                component={MainTabs}
                                options={{ headerShown: false }}
                            />

                            {/* 🎮 Game screen (accessible from planet taps) */}
                            <Stack.Screen
                                name="Game"
                                component={Game}
                                options={{ headerShown: false }}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </AvatarContext.Provider>
            </PointsContext.Provider>
        </ThemeContext.Provider>
    );
}
