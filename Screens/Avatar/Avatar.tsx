import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Avatar() {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>👤 Avatar</Text>
            <Text style={styles.subtitle}>Customize your space explorer!</Text>

            <View style={styles.avatarContainer}>
                <View style={styles.avatarDisplay}>
                    <Image
                        source={require('../../assets/spaceship.png')}
                        style={styles.avatarImage}
                    />
                    <Text style={styles.avatarName}>Space Explorer</Text>
                </View>

                <View style={styles.customizationContainer}>
                    <TouchableOpacity style={styles.customButton}>
                        <Text style={styles.customIcon}>🎨</Text>
                        <Text style={styles.customLabel}>Customize</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.customButton}>
                        <Text style={styles.customIcon}>👕</Text>
                        <Text style={styles.customLabel}>Outfit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.customButton}>
                        <Text style={styles.customIcon}>🎭</Text>
                        <Text style={styles.customLabel}>Accessories</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#60359c',
        textAlign: 'center',
        marginBottom: 30,
    },
    avatarContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarDisplay: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarImage: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
        marginBottom: 15,
    },
    avatarName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    customizationContainer: {
        flexDirection: 'row',
        gap: 20,
    },
    customButton: {
        backgroundColor: 'rgba(96, 53, 156, 0.2)',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#60359c',
        minWidth: 80,
    },
    customIcon: {
        fontSize: 24,
        marginBottom: 5,
    },
    customLabel: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '500',
    },
    navbar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: 'rgba(22, 11, 32, 0.95)',
        borderTopWidth: 1,
        borderTopColor: '#60359c',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 20,
        paddingTop: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 8,
    },
    navItem: {
        alignItems: 'center',
        flex: 1,
        paddingVertical: 5,
    },
    activeNavItem: {
        backgroundColor: 'rgba(96, 53, 156, 0.3)',
        borderRadius: 10,
    },
    navIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    navLabel: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
});
