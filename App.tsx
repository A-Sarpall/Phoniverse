import React, { createContext, useState, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InitialAssessment from "./OnboardingScreens/InitialAssessment/InitialAssessment";
import {StatusBar} from "react-native";
import Welcome from "./OnboardingScreens/Welcome/Welcome";
import HomePage from "./OnboardingScreens/Home/home";
import Minigames from "./OnboardingScreens/Home/Minigames/Minigames";
import Avatar from "./OnboardingScreens/Home/Avatar/Avatar";
import Shop from "./OnboardingScreens/Home/Shop/Shop";
import Game from "./OnboardingScreens/Home/Game/Game";

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
    button: "#60359c",
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
    const [totalPoints, setTotalPoints] = useState(100); // Start with 100 points
    const [purchasedItems, setPurchasedItems] = useState<any[]>([]);
    const [equippedItems, setEquippedItems] = useState<any[]>([]);

    const addPoints = useCallback((points: number) => {
        setTotalPoints(prev => prev + points);
    }, []);

    const spendPoints = useCallback((points: number) => {
        setTotalPoints(prev => Math.max(0, prev - points));
    }, []);

    const addPurchasedItem = useCallback((item: any) => {
        setPurchasedItems(prev => [...prev, item]);
    }, []);

    const removePurchasedItem = useCallback((itemId: string) => {
        setPurchasedItems(prev => prev.filter(item => item.id !== itemId));
    }, []);

    const equipItem = useCallback((item: any) => {
        setEquippedItems(prev => {
            // Remove any existing item of the same category
            const filtered = prev.filter(equipped => equipped.category !== item.category);
            return [...filtered, item];
        });
    }, []);

    const unequipItem = useCallback((itemId: string) => {
        setEquippedItems(prev => prev.filter(item => item.id !== itemId));
    }, []);

    const theme = {
        background: "#160b20",
        text: "#fff",
        button: "#60359c",
    };

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
                        <StatusBar barStyle='light-content' />
                        <Stack.Navigator initialRouteName="Welcome">
                            <Stack.Screen name="Welcome" component={Welcome} options={{ headerShown: false }} />
                            <Stack.Screen name="Initial Assessment" component={InitialAssessment} options={{ headerShown: true }} />
                            <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
                            <Stack.Screen name="Minigames" component={Minigames} options={{ headerShown: false }} />
                            <Stack.Screen name="Avatar" component={Avatar} options={{ headerShown: false }} />
                            <Stack.Screen name="Shop" component={Shop} options={{ headerShown: false }} />
                            <Stack.Screen name="Game" component={Game} options={{ headerShown: false }} />
                        </Stack.Navigator>
                    </NavigationContainer>
                </AvatarContext.Provider>
            </PointsContext.Provider>
        </ThemeContext.Provider>
    );
}
