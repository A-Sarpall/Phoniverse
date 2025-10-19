import {Text, View, TouchableOpacity, StyleSheet} from "react-native";
import { useNavigation } from '@react-navigation/native';

const InitialAssessment = () => {
    const navigation = useNavigation();

    const navigateToHome = () => {
        navigation.navigate('Home');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Initial Assessment</Text>
            <TouchableOpacity style={styles.button} onPress={navigateToHome}>
                <Text style={styles.buttonText}>Go to Home</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#160b20',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 30,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#60359c',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default InitialAssessment;
