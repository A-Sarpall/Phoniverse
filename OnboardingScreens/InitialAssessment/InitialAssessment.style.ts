import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 20,
    },
    topContainer: {
        width: "100%",
        alignItems: "center",
    },
    instructionText: {
        color: "white",
        fontSize: 24,
    },
    sentenceText: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 10,
    },
    middleContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    bottomContainer: {
        width: "100%",
        alignItems: "center",
    },
    micButton: {
        width: 160,
        height: 160,
        borderRadius: 80,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
        borderWidth: 10,
        borderColor: "#60359c",
    },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: "90%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 4,
        elevation: 5,
        marginBottom: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
});
