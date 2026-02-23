import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../theme/useTheme';

const { width } = Dimensions.get('window');

export default function ProductDetails({ route, navigation }) {
    const { colors, isDark } = useTheme();
    const { product } = route.params;

    const addToRoutine = async (timeOfDay) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                Alert.alert("Erreur", "Tu dois être connecté.");
                return;
            }

            // Vérifier/Créer le profil si manquant (sécurité)
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single();

            if (!profile) {
                await supabase
                    .from('profiles')
                    .insert([{ id: user.id, username: user.email.split('@')[0], skin_type: 'Mixte' }]);
            }

            const { error } = await supabase
                .from('routines')
                .insert([
                    {
                        user_id: user.id,
                        product_id: product.id,
                        time_of_day: timeOfDay
                    }
                ]);

            if (error) throw error;

            Alert.alert("Succès ✨", `${product.name} ajouté à ta routine du ${timeOfDay === 'Morning' ? 'matin' : 'soir'} !`);
            navigation.navigate('Home');
        } catch (error) {
            console.error(error);
            Alert.alert("Erreur", "Impossible d'ajouter à la routine.");
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: product.image_url || 'https://via.placeholder.com/300' }} style={styles.image} />
                    <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.card }]} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <View style={[styles.content, { backgroundColor: colors.background }]}>
                    <View style={styles.headerInfo}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.brand, { color: colors.textTertiary }]}>{product.brand}</Text>
                            <Text style={[styles.name, { color: colors.text }]}>{product.name}</Text>
                        </View>
                        <TouchableOpacity style={[styles.favBtn, { backgroundColor: isDark ? colors.surface : '#fff5f5' }]}>
                            <Ionicons name="heart-outline" size={28} color="#FF5A5F" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Analyse des Ingrédients 🧪</Text>
                        <View style={[styles.ingredientsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Text style={[styles.ingredients, { color: colors.textSecondary }]}>
                                {product.ingredients || "L'analyse complète n'est pas encore disponible pour ce produit. Nous travaillons pour l'ajouter bientôt !"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.routineSection}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Programmer dans ma Routine</Text>
                        <Text style={[styles.routineSub, { color: colors.textTertiary }]}>Sélectionne le moment idéal pour utiliser ce produit.</Text>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.routineButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => addToRoutine('Morning')}>
                                <View style={[styles.iconBox, { backgroundColor: '#FFDE59' }]}>
                                    <Ionicons name="sunny" size={24} color="#000" />
                                </View>
                                <Text style={[styles.routineButtonText, { color: colors.text }]}>Matin</Text>
                                <Text style={[styles.routineTime, { color: colors.textTertiary }]}>Préférable</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.routineButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => addToRoutine('Night')}>
                                <View style={[styles.iconBox, { backgroundColor: isDark ? '#2e2e4a' : '#f0f0ff' }]}>
                                    <Ionicons name="moon" size={24} color={isDark ? '#818cf8' : '#6366f1'} />
                                </View>
                                <Text style={[styles.routineButtonText, { color: colors.text }]}>Soir</Text>
                                <Text style={[styles.routineTime, { color: colors.textTertiary }]}>Optionnel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    imageContainer: { width: width, height: 400, position: 'relative' },
    image: { width: '100%', height: '100%', resizeMode: 'cover' },
    backButton: { position: 'absolute', top: 60, left: 20, width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.1, elevation: 5 },
    content: { padding: 25, borderTopLeftRadius: 40, borderTopRightRadius: 40, marginTop: -40 },
    headerInfo: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    brand: { fontSize: 16, textTransform: 'uppercase', letterSpacing: 2, fontWeight: '600' },
    name: { fontSize: 30, fontWeight: 'bold', marginTop: 5 },
    favBtn: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    section: { marginTop: 35 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    ingredientsCard: { padding: 20, borderRadius: 25, borderWidth: 1 },
    ingredients: { lineHeight: 24, fontSize: 15 },
    routineSection: { marginTop: 40 },
    routineSub: { marginBottom: 20, fontSize: 14 },
    buttonRow: { flexDirection: 'row', gap: 15 },
    routineButton: { flex: 1, padding: 20, borderRadius: 30, borderWidth: 1, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    iconBox: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    routineButtonText: { fontWeight: 'bold', fontSize: 16 },
    routineTime: { fontSize: 12, marginTop: 4 }
});
