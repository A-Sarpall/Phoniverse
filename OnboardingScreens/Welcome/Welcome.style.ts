import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 40,
        backgroundColor: '#0a0a0a', // Dark background for galaxy effect
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1, // Ensure content appears above background
    },
    title: {
        fontSize: 26,
        fontWeight: "700",
        textAlign: "center",
        marginBottom: 16,
        color: "#fff", // light text
        // fontFamily: "SpaceMono_700Bold", // Using system font instead
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        color: "#ccc", // softer contrast for subtitle
        lineHeight: 22,
        // fontFamily: "SpaceMono_400Regular", // Using system font instead
    },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: "100%",
        alignItems: "center",
        marginBottom: 40,
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 4,
        elevation: 5,
        zIndex: 1, // Ensure button appears above background
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        // fontFamily: "SpaceMono_700Bold", // Using system font instead
    },
});
