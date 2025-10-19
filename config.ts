import Constants from "expo-constants";

// Get the server URL from app.json's extra field
// Fallback to localhost if not configured
export const SERVER_URL =
    Constants.expoConfig?.extra?.serverUrl || "http://localhost:8000";

export const config = {
    serverUrl: SERVER_URL,
};

// Log the current server URL for debugging
console.log("🌐 Using SERVER_URL:", SERVER_URL);
