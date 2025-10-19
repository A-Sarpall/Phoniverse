import React, { useContext, useMemo } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AvatarContext, PointsContext } from '../../../App';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// All available cosmetic items (same as shop)
const cosmeticItems = [
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

export default function Avatar() {
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
    const { purchasedItems, equippedItems, equipItem, unequipItem } = useContext(AvatarContext);
    const navigation = useNavigation<any>();

    // Function to get the HackTX Drawings image for avatar display
    const getAvatarImage = (item: any) => {
        const avatarImages: { [key: string]: any } = {
            '1': require('../../../assets/HackTX Drawings/Beanie.png'),
            '2': require('../../../assets/HackTX Drawings/goldchain.png'),
            '3': require('../../../assets/HackTX Drawings/cowboyhat.png'),
            '4': require('../../../assets/HackTX Drawings/headphones.png'),
            '5': require('../../../assets/HackTX Drawings/Purse.png'),
            '6': require('../../../assets/HackTX Drawings/scarf.png'),
            '7': require('../../../assets/HackTX Drawings/spinhat.png'),
            '8': require('../../../assets/HackTX Drawings/Sunglasses.png'),
            '9': require('../../../assets/HackTX Drawings/tie.png'),
            '10': require('../../../assets/HackTX Drawings/tophat.png'),
        };
        return avatarImages[item.id] || item.image;
    };

    const handleItemSelect = (item: any) => {
        // If the item is already equipped, unequip it
        if (isItemEquipped(item.id)) {
            unequipItem(item.id);
        } else {
            // Equip the new item (this will replace any currently equipped item)
            equipItem(item);
        }
    };

    const isItemEquipped = (itemId: string) => {
        return equippedItems.some(item => item.id === itemId);
    };

    const renderCosmeticItem = (item: any) => (
        <TouchableOpacity
            key={item.id}
            style={[
                styles.cosmeticItem,
                isItemEquipped(item.id) && styles.cosmeticItemEquipped
            ]}
            onPress={() => handleItemSelect(item)}
        >
            <Image source={item.image} style={styles.cosmeticImage} />
            <Text style={[
                styles.cosmeticName,
                isItemEquipped(item.id) && styles.equippedText
            ]}>
                {item.name}
            </Text>
            {isItemEquipped(item.id) && (
                <View style={styles.equippedBadge}>
                    <Text style={styles.equippedBadgeText}>✓</Text>
                </View>
            )}
        </TouchableOpacity>
    );

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
            <Text style={styles.title}>👤 Avatar</Text>
            <Text style={styles.subtitle}>Customize your space explorer!</Text>

            <View style={styles.avatarContainer}>
                <View style={styles.avatarDisplay}>
                    {/* Avatar display - show cosmetic item or trainer */}
                    <View style={styles.avatarBase}>
                        {/* Show trainer as base only when no item is equipped */}
                        {equippedItems.length === 0 && (
                            <Image
                                source={require('../../../assets/trainer.png')}
                                style={styles.baseAvatar}
                            />
                        )}
                        {/* Show equipped item when selected */}
                        {equippedItems.length > 0 && (
                            <Image
                                source={getAvatarImage(equippedItems[0])}
                                style={styles.baseAvatar}
                            />
                        )}
                    </View>
                    
                    <Text style={styles.avatarName}>Space Explorer</Text>
                    
                    {/* Show currently equipped item */}
                    {equippedItems.length > 0 && (
                        <Text style={styles.equippedItemText}>
                            Currently wearing: {equippedItems[0].name}
                        </Text>
                    )}
                </View>

                {/* Horizontal scroll view for all cosmetic items */}
                <View style={styles.cosmeticsContainer}>
                    <Text style={styles.cosmeticsTitle}>
                        🎨 {purchasedItems.length > 0 ? 'Your Cosmetic Items' : 'Available Items'}
                    </Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.cosmeticsScroll}
                    >
                        {cosmeticItems.map((item) => {
                            // Show all items, but style differently based on purchase status
                            const isPurchased = purchasedItems.some(purchased => purchased.id === item.id);
                            const canEquip = isPurchased && !isItemEquipped(item.id);
                            
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.cosmeticItem,
                                        isItemEquipped(item.id) && styles.cosmeticItemEquipped,
                                        !isPurchased && styles.cosmeticItemLocked
                                    ]}
                                    onPress={() => isPurchased ? handleItemSelect(item) : null}
                                    disabled={!isPurchased}
                                >
                                    <Image source={item.image} style={styles.cosmeticImage} />
                                    <Text style={[
                                        styles.cosmeticName,
                                        isItemEquipped(item.id) && styles.equippedText,
                                        !isPurchased && styles.lockedText
                                    ]}>
                                        {item.name}
                                    </Text>
                                    {isItemEquipped(item.id) && (
                                        <View style={styles.equippedBadge}>
                                            <Text style={styles.equippedBadgeText}>✓</Text>
                                        </View>
                                    )}
                                    {!isPurchased && (
                                        <View style={styles.lockedBadge}>
                                            <Text style={styles.lockedBadgeText}>🔒</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
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
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: 20,
    },
    avatarDisplay: {
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    avatarBase: {
        position: 'relative',
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    baseAvatar: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    equippedItemOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    itemLayer: {
        position: 'absolute',
        resizeMode: 'contain',
    },
    avatarName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 10,
    },
    equippedItemText: {
        fontSize: 14,
        color: '#60359c',
        textAlign: 'center',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    equippedItems: {
        backgroundColor: 'rgba(96, 53, 156, 0.2)',
        borderRadius: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: '#60359c',
        minWidth: 200,
    },
    equippedTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#60359c',
        marginBottom: 10,
        textAlign: 'center',
    },
    equippedItem: {
        fontSize: 14,
        color: '#fff',
        marginBottom: 5,
    },
    cosmeticsContainer: {
        marginTop: 30,
        marginBottom: 30,
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    cosmeticsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#60359c',
        textAlign: 'center',
        marginBottom: 15,
    },
    cosmeticsScroll: {
        paddingHorizontal: 10,
    },
    cosmeticItem: {
        width: 80,
        height: 100,
        backgroundColor: 'rgba(96, 53, 156, 0.2)',
        borderRadius: 15,
        padding: 8,
        alignItems: 'center',
        marginRight: 10,
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    cosmeticImage: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
        marginBottom: 5,
    },
    cosmeticName: {
        fontSize: 10,
        color: '#fff',
        textAlign: 'center',
        fontWeight: '500',
    },
    cosmeticItemEquipped: {
        borderColor: '#60359c',
        backgroundColor: 'rgba(96, 53, 156, 0.4)',
    },
    equippedText: {
        color: '#60359c',
        fontWeight: 'bold',
    },
    equippedBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: '#60359c',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    equippedBadgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    cosmeticItemLocked: {
        opacity: 0.6,
        borderColor: '#666',
    },
    lockedText: {
        color: '#999',
    },
    lockedBadge: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: '#666',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockedBadgeText: {
        color: '#fff',
        fontSize: 10,
    },
});
