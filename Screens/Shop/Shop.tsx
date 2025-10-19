import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Shop() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>🛒 Shop</Text>
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
        marginBottom: 20,
    },
    currencyContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    currency: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#60359c',
        backgroundColor: 'rgba(96, 53, 156, 0.2)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#60359c',
    },
    shopContainer: {
        flex: 1,
        gap: 15,
    },
    shopItem: {
        backgroundColor: 'rgba(96, 53, 156, 0.2)',
        borderRadius: 15,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#60359c',
    },
    itemIcon: {
        fontSize: 30,
        marginRight: 15,
    },
    itemName: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    itemPrice: {
        fontSize: 14,
        color: '#60359c',
        fontWeight: '600',
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
