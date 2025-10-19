import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
    faHome,
    faGamepad,
    faUser,
    faStore, faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "./App";
import HomePage from "./OnboardingScreens/Home/home";
import Minigames from "./OnboardingScreens/Home/Minigames/Minigames";
import Avatar from "./OnboardingScreens/Home/Avatar/Avatar";
import Shop from "./OnboardingScreens/Home/Shop/Shop";
import Game from "./OnboardingScreens/Home/Game/Game";

const Tab = createBottomTabNavigator();

const MainTabs = () => {
    const theme = useContext(ThemeContext);

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: { backgroundColor: "#392059" },
                tabBarActiveTintColor: 'white',
                tabBarInactiveTintColor: "#aaa",
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomePage}
                options={{
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faHome} size={20} color={color} />
                    ),
                }}
            />
            {/*<Tab.Screen*/}
            {/*    name="Minigames"*/}
            {/*    component={Minigames}*/}
            {/*    options={{*/}
            {/*        tabBarIcon: ({ color }) => (*/}
            {/*            <FontAwesomeIcon icon={faGamepad} size={20} color={color} />*/}
            {/*        ),*/}
            {/*    }}*/}
            {/*/>*/}
            <Tab.Screen
                name="Avatar"
                component={Avatar}
                options={{
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faUser} size={20} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Shop"
                component={Shop}
                options={{
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faStore} size={20} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name="Game"
                component={Game}
                options={{
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faPlay} size={20} color={color} />
                    ),
                    headerShown: true,
                    tabBarStyle: {
                        display: 'none'
                    },
                    headerStyle: { backgroundColor: "#392059" },
                    headerTitleStyle: { color: "#fff" },
                    headerTintColor: "#fff",
                }}
            />
        </Tab.Navigator>
    );
};

export default MainTabs;
