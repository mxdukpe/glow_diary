import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';

export default function ProductList({ navigation }) {
    const { colors, isDark } = useTheme();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*');

            if (error) throw error;
            setProducts(data);
        } catch (error) {
            console.error("Erreur lors de la récup :", error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchProducts();
        });
        return unsubscribe;
    }, [navigation]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color="#FFDE59" />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Mes Produits Scannés ✨</Text>
                <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
                    <Ionicons name="search" size={20} color={colors.textTertiary} />
                    <TextInput
                        placeholder="Rechercher un produit..."
                        placeholderTextColor={colors.textTertiary}
                        style={[styles.searchInput, { color: colors.text }]}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            <FlatList
                data={filteredProducts}
                keyExtractor={(item) => item.id?.toString() || item.barcode}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => navigation.navigate('Details', { product: item })}
                    >
                        <Image
                            source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
                            style={[styles.image, { backgroundColor: colors.surface }]}
                        />
                        <View style={styles.info}>
                            <Text style={[styles.brand, { color: colors.textTertiary }]}>{item.brand}</Text>
                            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="barcode-outline" size={60} color={colors.border} />
                        <Text style={[styles.emptyText, { color: colors.textTertiary }]}>Aucun produit trouvé.</Text>
                        <TouchableOpacity style={styles.scanBtn} onPress={() => navigation.navigate('Recherche')}>
                            <Text style={styles.scanBtnText}>Scanner mon premier produit</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingTop: 60, paddingHorizontal: 25, marginBottom: 20 },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 15 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
    list: { padding: 25, paddingBottom: 120 },
    card: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 25, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 1, borderWidth: 1 },
    image: { width: 70, height: 70, borderRadius: 20 },
    info: { flex: 1, marginLeft: 15 },
    brand: { fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
    name: { fontSize: 17, fontWeight: 'bold', marginTop: 3 },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, marginTop: 10, marginBottom: 25 },
    scanBtn: { backgroundColor: '#FFDE59', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 25 },
    scanBtnText: { fontWeight: 'bold', color: '#000' }
});