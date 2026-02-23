import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/useTheme';

export default function RoutineScreen({ navigation }) {
    const { colors, isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [routine, setRoutine] = useState([]);
    const [selectedDate, setSelectedDate] = useState(5);

    const dates = [
        { day: 'Sat', date: 5 },
        { day: 'Sun', date: 6 },
        { day: 'Mon', date: 7 },
        { day: 'Tue', date: 8 },
        { day: 'Wed', date: 9 },
    ];

    const fetchRoutines = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('routines')
                .select(`id, time_of_day, products (id, name, brand, image_url) `)
                .eq('user_id', user.id);

            if (error) throw error;
            setRoutine(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchRoutines();
        });
        return unsubscribe;
    }, [navigation]);

    const deleteFromRoutine = async (routineId) => {
        try {
            const { error } = await supabase
                .from('routines')
                .delete()
                .eq('id', routineId);

            if (error) throw error;
            fetchRoutines();
        } catch (error) {
            console.error(error);
        }
    };

    const renderStep = ({ item, index }) => (
        <View style={[styles.stepCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
            <Image
                source={{ uri: item.products.image_url || 'https://via.placeholder.com/100' }}
                style={styles.stepImage}
            />
            <View style={styles.stepInfo}>
                <Text style={[styles.productName, { color: colors.text }]}>{item.products.name}</Text>
                <View style={styles.stepMeta}>
                    <View style={[styles.stepBadge, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.stepBadgeText, { color: colors.textTertiary }]}>Step {index + 1}</Text>
                    </View>
                    <View style={styles.timeInfo}>
                        <Ionicons name="time-outline" size={14} color={colors.textTertiary} />
                        <Text style={[styles.timeText, { color: colors.textTertiary }]}>{item.time_of_day === 'Morning' ? '07:00 AM' : '08:30 PM'}</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteFromRoutine(item.id)}>
                <Ionicons name="trash-outline" size={20} color="#FF5A5F" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.yellowHeader}>
                <View style={styles.topRow}>
                    <View>
                        <Text style={styles.headerTitle}>Daily Routine</Text>
                        <Text style={[styles.headerSubtitle, { color: 'rgba(0,0,0,0.6)' }]}>Your Skincare</Text>
                    </View>
                    <TouchableOpacity style={styles.addStepBtn} onPress={() => navigation.navigate('Ma Liste')}>
                        <Ionicons name="add" size={18} color="#000" />
                        <Text style={styles.addStepText}>Add Step</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={[styles.dateSelectorCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                <View style={styles.dateHeader}>
                    <Text style={[styles.dateTitle, { color: colors.text }]}>Date</Text>
                    <TouchableOpacity style={[styles.monthDropdown, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.monthText, { color: colors.textSecondary }]}>August 2023</Text>
                        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
                    {dates.map((d) => (
                        <TouchableOpacity
                            key={d.date}
                            onPress={() => setSelectedDate(d.date)}
                            style={[styles.dateBtn, { backgroundColor: colors.surface }, selectedDate === d.date && styles.dateBtnActive]}
                        >
                            <Text style={[styles.dateNumber, { color: colors.textSecondary }, selectedDate === d.date && styles.dateTextActive]}>{d.date}</Text>
                            <Text style={[styles.dayText, { color: colors.textTertiary }, selectedDate === d.date && styles.dateTextActive]}>{d.day}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#FFDE59" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={routine}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderStep}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No steps added yet ✨</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    yellowHeader: { backgroundColor: '#FFDE59', paddingTop: 60, paddingHorizontal: 25, height: 180 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#000' },
    headerSubtitle: { fontSize: 24 },
    addStepBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, shadowOpacity: 0.1, elevation: 2 },
    addStepText: { fontWeight: 'bold', marginLeft: 4, fontSize: 13, color: '#000' },

    dateSelectorCard: { marginHorizontal: 20, marginTop: -40, padding: 20, borderRadius: 30, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
    dateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    dateTitle: { fontSize: 20, fontWeight: 'bold' },
    monthDropdown: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
    monthText: { marginRight: 5, fontSize: 12, fontWeight: '500' },
    dateRow: { gap: 15 },
    dateBtn: { width: 60, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    dateBtnActive: { backgroundColor: '#FFDE59' },
    dateNumber: { fontSize: 20, fontWeight: 'bold' },
    dayText: { fontSize: 12, marginTop: 4 },
    dateTextActive: { color: '#000' },

    listContent: { padding: 20, paddingBottom: 120 },
    stepCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 25, padding: 15, marginBottom: 15, shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 },
    stepImage: { width: 50, height: 50, borderRadius: 15, marginRight: 15 },
    stepInfo: { flex: 1 },
    productName: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    stepMeta: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    stepBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    stepBadgeText: { fontSize: 10, fontWeight: 'bold' },
    timeInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    timeText: { fontSize: 11 },

    deleteBtn: { padding: 10, marginLeft: 10 },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 14 }
});
