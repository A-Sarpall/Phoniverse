import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
    faHome,
    faGamepad,
    faUser,
    faStore,
} from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "./App";
import HomePage from "./Screens/Home/Home";
import Minigames from "./Screens/Minigames/Minigames";
import Avatar from "./Screens/Avatar/Avatar";
import Shop from "./Screens/Shop/Shop";

const Tab = createBottomTabNavigator();

const MainTabs = () => {
    const theme = useContext(ThemeContext);

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: { backgroundColor: "#392059" },
                tabBarActiveTintColor: theme.button,
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
            <Tab.Screen
                name="Minigames"
                component={Minigames}
                options={{
                    tabBarIcon: ({ color }) => (
                        <FontAwesomeIcon icon={faGamepad} size={20} color={color} />
                    ),
                }}
            />
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
        </Tab.Navigator>
    );
};

export default MainTabs;
