import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';

export default function HomeScreen({ navigation }) {
    const { colors, isDark, toggleTheme } = useTheme();
    const [stats, setStats] = useState({ products: 0, routines: 0 });
    const [profile, setProfile] = useState({ username: 'Jane' });
    const [activeTab, setActiveTab] = useState('Routines');
    const [recentProducts, setRecentProducts] = useState([]);
    const [recentRoutines, setRecentRoutines] = useState([]);

    const fetchStats = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch recent products
            const { data: products } = await supabase
                .from('products')
                .select('*')
                .limit(3);
            setRecentProducts(products || []);

            // Fetch routines with product details
            const { data: routines } = await supabase
                .from('routines')
                .select(`id, time_of_day, products (id, name, brand, image_url) `)
                .eq('user_id', user.id)
                .limit(5);
            setRecentRoutines(routines || []);

            const { count: productCount } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            const { count: routineCount } = await supabase
                .from('routines')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            let { data: profileData } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', user.id)
                .single();

            if (!profileData) {
                // Créer le profil s'il n'existe pas
                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: user.id,
                            username: user.email.split('@')[0],
                            skin_type: 'Mixte'
                        }
                    ])
                    .select()
                    .single();

                if (!createError) profileData = newProfile;
            }

            if (profileData) setProfile(profileData);

            setStats({
                products: productCount || 0,
                routines: routineCount || 0
            });
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchStats();
        });
        return unsubscribe;
    }, [navigation]);

    const tabs = ['Routines', 'Liste', 'Scan'];

    const handleTabPress = (tab) => {
        setActiveTab(tab);
        if (tab === 'Scan') {
            navigation.navigate('Recherche');
        }
    };

    const renderRoutinesContent = () => (
        <View style={styles.tabContentArea}>
            {recentRoutines.length > 0 ? (
                recentRoutines.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[styles.miniCard, { backgroundColor: colors.surface }]}
                        onPress={() => navigation.navigate('Routine')}
                    >
                        <Image source={{ uri: item.products.image_url || 'https://via.placeholder.com/150' }} style={styles.miniImage} />
                        <View style={styles.miniInfo}>
                            <Text style={[styles.miniName, { color: colors.text }]}>{item.products.name}</Text>
                            <Text style={[styles.miniMeta, { color: colors.textTertiary }]}>{item.time_of_day} Routine</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                    </TouchableOpacity>
                ))
            ) : (
                <View style={styles.emptyContent}>
                    <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No routines yet. Start by scanning products!</Text>
                </View>
            )}
        </View>
    );

    const renderListeContent = () => (
        <View style={styles.tabContentArea}>
            {recentProducts.map((product) => (
                <TouchableOpacity
                    key={product.id}
                    style={[styles.miniCard, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.navigate('Ma Liste', { screen: 'Details', params: { product } })}
                >
                    <Image source={{ uri: product.image_url || 'https://via.placeholder.com/150' }} style={styles.miniImage} />
                    <View style={styles.miniInfo}>
                        <Text style={[styles.miniBrand, { color: colors.textTertiary }]}>{product.brand}</Text>
                        <Text style={[styles.miniName, { color: colors.text }]}>{product.name}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.viewAllBtn} onPress={() => navigation.navigate('Ma Liste')}>
                <Text style={styles.viewAllText}>Voir toute ma liste</Text>
            </TouchableOpacity>
        </View>
    );

    const skincareTips = [
        {
            id: '1',
            title: 'Double Cleanse for Clearer Skin',
            category: 'Cleansing',
            image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=400',
            likes: '12k'
        },
        {
            id: '2',
            title: 'Why Sunscreen is Non-Negotiable',
            category: 'Protection',
            image: 'https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=400',
            likes: '8.5k'
        },
        {
            id: '3',
            title: 'The Magic of Hyaluronic Acid',
            category: 'Hydration',
            image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=400',
            likes: '15k'
        }
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.greeting, { color: colors.text }]}>Hello, <Text style={styles.boldName}>{profile.username || 'Jane'}</Text></Text>
                    <Text style={[styles.subtitle, { color: colors.textTertiary }]}>Let's take care of your face!</Text>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity
                        style={[styles.headerIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={toggleTheme}
                    >
                        <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={22} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.headerIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Ionicons name="notifications-outline" size={22} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.headerIconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={() => navigation.navigate('Recherche')}>
                        <Ionicons name="search-outline" size={22} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.tabContainer}>
                {tabs.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => handleTabPress(tab)}
                        style={[styles.tabBtn, { backgroundColor: colors.card }, activeTab === tab && styles.tabBtnActive]}
                    >
                        <Text style={[styles.tabBtnText, { color: colors.textSecondary }, activeTab === tab && styles.tabBtnTextActive]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {activeTab === 'Routines' && renderRoutinesContent()}
                {activeTab === 'Liste' && renderListeContent()}

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Tips</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tipsScroll}>
                    {skincareTips.map((tip) => (
                        <TouchableOpacity key={tip.id} style={styles.tipCard}>
                            <Image source={{ uri: tip.image }} style={styles.tipImage} />
                            <View style={[styles.tipOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                                <View style={styles.tipCategory}>
                                    <Text style={styles.tipCategoryText}>{tip.category}</Text>
                                </View>
                                <Text style={styles.tipTitle}>{tip.title}</Text>
                                <View style={styles.tipMeta}>
                                    <Ionicons name="heart" size={14} color="#FFDE59" />
                                    <Text style={styles.tipLikes}>{tip.likes}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Always prominent: Create Your Routine */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>My Goal</Text>
                <TouchableOpacity
                    style={[styles.heroCard, { height: 220, marginBottom: 30 }]}
                    onPress={() => navigation.navigate('Routine')}
                >
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=800' }}
                        style={styles.heroImage}
                    />
                    <View style={[styles.heroOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
                        <View style={[styles.glassCard, { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.25)' }]}>
                            <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>Create Your Routine</Text>
                            <View style={styles.createBtn}>
                                <Text style={styles.createBtnText}>Build it now</Text>
                                <Ionicons name="arrow-forward" size={16} color="#000" />
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Main Action Card */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Dose</Text>
                <TouchableOpacity style={styles.heroCard} onPress={() => navigation.navigate('Recherche')}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1620331713437-0f865f3a097d?auto=format&fit=crop&q=80&w=800' }}
                        style={styles.heroImage}
                    />
                    <View style={styles.heroOverlay}>
                        <View style={styles.heroStats}>
                            <View style={styles.heroStatItem}>
                                <Ionicons name="eye-outline" size={18} color="#fff" />
                                <Text style={styles.heroStatText}>283M</Text>
                            </View>
                        </View>

                        <View style={styles.heroFooter}>
                            <View style={[styles.userPill, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                <Text style={styles.userName}>Expert Skincare</Text>
                            </View>
                            <Text style={styles.tipHeroTitle}>Unlock Your Glow: The morning routine guide</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 25, marginBottom: 25 },
    headerTitleContainer: { flex: 1 },
    greeting: { fontSize: 32 },
    boldName: { fontWeight: 'bold' },
    subtitle: { fontSize: 16, marginTop: 5 },
    headerIcons: { flexDirection: 'row', gap: 8 },
    headerIconBtn: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

    tabContainer: { flexDirection: 'row', paddingHorizontal: 25, gap: 10, marginBottom: 25 },
    tabBtn: { paddingHorizontal: 25, paddingVertical: 12, borderRadius: 25 },
    tabBtnActive: { backgroundColor: '#FFDE59' },
    tabBtnText: { fontSize: 14, fontWeight: '600' },
    tabBtnTextActive: { color: '#000' },

    scrollContent: { paddingHorizontal: 20 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 15 },

    tabContentArea: { marginBottom: 20 },
    miniCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 20, marginBottom: 10 },
    miniImage: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#eee' },
    miniInfo: { flex: 1, marginLeft: 12 },
    miniBrand: { fontSize: 10, textTransform: 'uppercase' },
    miniName: { fontSize: 14, fontWeight: 'bold' },
    miniMeta: { fontSize: 11 },

    emptyContent: { padding: 20, alignItems: 'center' },
    emptyText: { fontSize: 14, textAlign: 'center' },

    viewAllBtn: { alignItems: 'center', paddingVertical: 10 },
    viewAllText: { color: '#FFDE59', fontWeight: 'bold', fontSize: 13 },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
    seeAll: { color: '#FFDE59', fontWeight: 'bold' },
    tipsScroll: { marginBottom: 20 },
    tipCard: { width: 280, height: 180, borderRadius: 30, overflow: 'hidden', marginRight: 15 },
    tipImage: { width: '100%', height: '100%' },
    tipOverlay: { ...StyleSheet.absoluteFillObject, padding: 20, justifyContent: 'flex-end' },
    tipCategory: { position: 'absolute', top: 15, left: 15, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
    tipCategoryText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    tipTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    tipMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    tipLikes: { color: '#fff', fontSize: 12, fontWeight: '600' },
    tipHeroTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 10, lineHeight: 30 },

    heroCard: { width: '100%', height: 450, borderRadius: 40, overflow: 'hidden', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: { ...StyleSheet.absoluteFillObject, padding: 20 },

    heroStats: { position: 'absolute', right: 15, top: 40, gap: 15, alignItems: 'center' },
    heroStatItem: { alignItems: 'center' },
    heroStatText: { color: '#fff', fontSize: 12, fontWeight: '600', marginTop: 2 },

    heroFooter: { position: 'absolute', bottom: 40, left: 20, right: 20 },
    userPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', padding: 6, borderRadius: 30, paddingHorizontal: 15 },
    userName: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

    glassCard: { padding: 20, borderRadius: 25, alignItems: 'center', width: '90%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
    createBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginTop: 12, gap: 6 },
    createBtnText: { fontWeight: 'bold', color: '#000', fontSize: 12 },
});
