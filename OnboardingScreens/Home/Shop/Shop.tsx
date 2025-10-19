import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PointsContext, AvatarContext } from '../../../App';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const itemSize = (screenWidth - 80) / 2; // 2 columns with padding

// Array of shop items with categories and positioning
const shopItems = [
    { 
        id: '1', 
        name: 'Beanie', 
        image: require('../../../assets/singleitems/beanie.png'), 
        price: 50,
        category: 'head' as const,
        position: { x: 50, y: 10, width: 100, height: 80 }
    },
    { 
        id: '2', 
        name: 'Chain', 
        image: require('../../../assets/singleitems/chain.png'), 
        price: 75,
        category: 'neck' as const,
        position: { x: 60, y: 80, width: 80, height: 40 }
    },
    { 
        id: '3', 
        name: 'Cowboy Hat', 
        image: require('../../../assets/singleitems/cowboyhat.png'), 
        price: 100,
        category: 'head' as const,
        position: { x: 40, y: 5, width: 120, height: 90 }
    },
    { 
        id: '4', 
        name: 'Headphones', 
        image: require('../../../assets/singleitems/headphones.png'), 
        price: 80,
        category: 'head' as const,
        position: { x: 30, y: 20, width: 140, height: 70 }
    },
    { 
        id: '5', 
        name: 'Purse', 
        image: require('../../../assets/singleitems/purse.png'), 
        price: 60,
        category: 'hands' as const,
        position: { x: 120, y: 140, width: 60, height: 50 }
    },
    { 
        id: '6', 
        name: 'Scarf', 
        image: require('../../../assets/singleitems/scarf.png'), 
        price: 40,
        category: 'neck' as const,
        position: { x: 50, y: 70, width: 100, height: 60 }
    },
    { 
        id: '7', 
        name: 'Spin Hat', 
        image: require('../../../assets/singleitems/spinhat.png'), 
        price: 90,
        category: 'head' as const,
        position: { x: 45, y: 8, width: 110, height: 85 }
    },
    { 
        id: '8', 
        name: 'Sunglasses', 
        image: require('../../../assets/singleitems/sunglasses.png'), 
        price: 70,
        category: 'head' as const,
        position: { x: 60, y: 50, width: 80, height: 30 }
    },
    { 
        id: '9', 
        name: 'Tie', 
        image: require('../../../assets/singleitems/tie.png'), 
        price: 55,
        category: 'neck' as const,
        position: { x: 70, y: 85, width: 60, height: 50 }
    },
    { 
        id: '10', 
        name: 'Top Hat', 
        image: require('../../../assets/singleitems/tophat.png'), 
        price: 120,
        category: 'head' as const,
        position: { x: 55, y: 0, width: 90, height: 100 }
    },
];

export default function Shop() {
    // Generate stars for background
    const stars = useMemo(() => {
        const arr = [];
        for (let i = 0; i < 100; i++) {
            arr.push({
                id: i,
                x: Math.random() * screenWidth,
                y: Math.random() * screenHeight,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.6 + 0.4,
                color: Math.random() > 0.7 ? '#cce6ff' : '#ffffff',
            });
        }
        return arr;
    }, []);
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
            {/* Stars Background */}
            {stars.map((star) => (
                <View
                    key={star.id}
                    style={{
                        position: 'absolute',
                        left: star.x,
                        top: star.y,
                        width: star.size,
                        height: star.size,
                        borderRadius: star.size / 2,
                        backgroundColor: star.color,
                        opacity: star.opacity,
                        shadowColor: star.color,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.8,
                        shadowRadius: 2,
                        elevation: 3,
                    }}
                />
            ))}
            <Text style={styles.title}>🛒 Shop</Text>
            <Text style={styles.subtitle}>Customize your avatar with these items!</Text>
            
            <View style={styles.currencyContainer}>
                <Text style={styles.currency}>💰 Points: {totalPoints}</Text>
            </View>

            <FlatList
                data={shopItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                numColumns={2}
                contentContainerStyle={styles.gridContainer}
                columnWrapperStyle={styles.row}
            />

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
        color: '#8B5FBF',
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
        color: '#8B5FBF',
        backgroundColor: 'rgba(96, 53, 156, 0.2)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#8B5FBF',
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
        borderColor: '#8B5FBF',
        shadowColor: '#8B5FBF',
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
        color: '#8B5FBF',
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
});
