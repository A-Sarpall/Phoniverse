import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {AvatarContext, PointsContext} from "../../App";

const { width: screenWidth } = Dimensions.get('window');
const itemSize = (screenWidth - 80) / 2; // 2 columns with padding

// Array of shop items with categories and positioning
const shopItems = [
    {
        id: '1',
        name: 'Beanie',
        image: require('../../HackTX Drawings/Beanie Background Removed.png'),
        price: 50,
        category: 'head' as const,
        position: { x: 50, y: 10, width: 100, height: 80 }
    },
    {
        id: '2',
        name: 'Chain',
        image: require('../../assets/HackTX Drawings/goldchain.png'),
        price: 75,
        category: 'neck' as const,
        position: { x: 60, y: 80, width: 80, height: 40 }
    },
    {
        id: '3',
        name: 'Cowboy Hat',
        image: require('../../assets/HackTX Drawings/cowboyhat.png'),
        price: 100,
        category: 'head' as const,
        position: { x: 40, y: 5, width: 120, height: 90 }
    },
    {
        id: '4',
        name: 'Headphones',
        image: require('../../assets/HackTX Drawings/headphones.png'),
        price: 80,
        category: 'head' as const,
        position: { x: 30, y: 20, width: 140, height: 70 }
    },
    {
        id: '5',
        name: 'Purse',
        image: require('../../assets/HackTX Drawings/Purse.png'),
        price: 60,
        category: 'hands' as const,
        position: { x: 120, y: 140, width: 60, height: 50 }
    },
    {
        id: '6',
        name: 'Scarf',
        image: require('../../assets/HackTX Drawings/scarf.png'),
        price: 40,
        category: 'neck' as const,
        position: { x: 50, y: 70, width: 100, height: 60 }
    },
    {
        id: '7',
        name: 'Spin Hat',
        image: require('../../assets/HackTX Drawings/spinhat.png'),
        price: 90,
        category: 'head' as const,
        position: { x: 45, y: 8, width: 110, height: 85 }
    },
    {
        id: '8',
        name: 'Sunglasses',
        image: require('../../assets/HackTX Drawings/Sunglasses.png'),
        price: 70,
        category: 'head' as const,
        position: { x: 60, y: 50, width: 80, height: 30 }
    },
    {
        id: '9',
        name: 'Tie',
        image: require('../../assets/HackTX Drawings/tie.png'),
        price: 55,
        category: 'neck' as const,
        position: { x: 70, y: 85, width: 60, height: 50 }
    },
    {
        id: '10',
        name: 'Top Hat',
        image: require('../../assets/HackTX Drawings/tophat.png'),
        price: 120,
        category: 'head' as const,
        position: { x: 55, y: 0, width: 90, height: 100 }
    },
];

export default function Shop() {
    const pointsContext = useContext(PointsContext);
    const avatarContext = useContext(AvatarContext);
    const navigation = useNavigation<any>();

    // Debug logging
    console.log('PointsContext:', pointsContext);
    console.log('spendPoints function:', pointsContext?.spendPoints);

    // Properly destructure the context
    const { totalPoints, spendPoints } = pointsContext || { totalPoints: 0, spendPoints: () => {} };
    const { addPurchasedItem, purchasedItems } = avatarContext || { addPurchasedItem: () => {}, purchasedItems: [] };

    const isItemPurchased = (itemId: string) => {
        return purchasedItems.some(item => item.id === itemId);
    };

    const handlePurchase = (item: any) => {
        if (isItemPurchased(item.id)) {
            Alert.alert('Already Purchased', 'You have already purchased this item!');
            return;
        }

        if (totalPoints >= item.price) {
            if (typeof spendPoints === 'function') {
                spendPoints(item.price);
                addPurchasedItem(item);
                Alert.alert(
                    'Purchase Successful!',
                    `You've bought ${item.name}! Check your avatar to see it equipped.`,
                    [{ text: 'OK' }]
                );
            } else {
                Alert.alert('Error', 'spendPoints function is not available');
            }
        } else {
            Alert.alert(
                'Insufficient Points',
                `You need ${item.price - totalPoints} more points to buy ${item.name}.`,
                [{ text: 'OK' }]
            );
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const isPurchased = isItemPurchased(item.id);
        const canAfford = totalPoints >= item.price;

        return (
            <TouchableOpacity
                style={[
                    styles.shopItem,
                    (!canAfford || isPurchased) && styles.disabledItem
                ]}
                onPress={() => handlePurchase(item)}
                disabled={!canAfford || isPurchased}
            >
                <Image source={item.image} style={styles.itemImage} />
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={[
                    styles.itemPrice,
                    (!canAfford || isPurchased) && styles.disabledPrice
                ]}>
                    {isPurchased ? 'Purchased' : `${item.price} pts`}
                </Text>
                <Text style={styles.itemCategory}>{item.category}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🛒 Shop</Text>
            <Text style={styles.subtitle}>Customize your avatar with these items!</Text>

            <View style={styles.currencyContainer}>
                <Text style={styles.currency}>💰 Points: {totalPoints}</Text>
                <TouchableOpacity
                    style={styles.testButton}
                    onPress={() => {
                        console.log('Testing spendPoints:', typeof spendPoints);
                        console.log('Current points before:', totalPoints);
                        if (typeof spendPoints === 'function') {
                            spendPoints(10);
                            console.log('spendPoints called successfully');
                            console.log('Points should now be:', totalPoints - 10);
                        } else {
                            console.log('spendPoints is not a function');
                        }
                    }}
                >
                    <Text style={styles.testButtonText}>Test Spend 10 Points</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={shopItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.gridContainer}
                columnWrapperStyle={styles.row}
            />

            {/* Bottom Navigation Bar */}
            <View style={styles.navbar}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.navIcon}>🏠</Text>
                    <Text style={styles.navLabel}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('Avatar')}
                >
                    <Text style={styles.navIcon}>👤</Text>
                    <Text style={styles.navLabel}>Avatar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navItem, styles.activeNavItem]}
                    onPress={() => navigation.navigate('Shop')}
                >
                    <Text style={styles.navIcon}>🛒</Text>
                    <Text style={styles.navLabel}>Shop</Text>
                </TouchableOpacity>
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
    gridContainer: {
        paddingHorizontal: 10,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    shopItem: {
        width: itemSize,
        height: itemSize + 60, // Extra height for text
        backgroundColor: 'rgba(96, 53, 156, 0.2)',
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#60359c',
        shadowColor: '#60359c',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    itemImage: {
        width: itemSize - 30,
        height: itemSize - 30,
        resizeMode: 'contain',
        marginBottom: 10,
    },
    itemName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 5,
    },
    itemPrice: {
        fontSize: 12,
        color: '#60359c',
        fontWeight: '600',
        textAlign: 'center',
    },
    disabledItem: {
        opacity: 0.5,
        borderColor: '#666',
    },
    disabledPrice: {
        color: '#999',
    },
    itemCategory: {
        fontSize: 10,
        color: '#aaa',
        textAlign: 'center',
        marginTop: 2,
        textTransform: 'capitalize',
    },
    testButton: {
        backgroundColor: '#60359c',
        borderRadius: 10,
        padding: 10,
        marginTop: 10,
    },
    testButtonText: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
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
        zIndex: 10,
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
