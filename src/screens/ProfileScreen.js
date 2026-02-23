import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch, Alert, TextInput, ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as NotificationService from '../services/NotificationService';
import { useTheme } from '../theme/useTheme';

export default function ProfileScreen() {
    const { colors, isDark, toggleTheme, themeMode, setThemeMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({ username: '', skin_type: 'Mixte' });
    const [userEmail, setUserEmail] = useState('');
    const [notifications, setNotifications] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [tempUsername, setTempUsername] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const toggleNotifications = async (value) => {
        try {
            if (value) {
                const hasPermission = await NotificationService.requestPermissions();
                if (hasPermission) {
                    await NotificationService.scheduleDailyReminders();
                    setNotifications(true);
                    Alert.alert("Activé", "Tes rappels quotidiens sont programmés (08:30 & 20:30) 🔔");
                } else {
                    setNotifications(false);
                    Alert.alert("Désolé", "Les notifications ne sont pas autorisées ou ne fonctionnent pas sur simulateur.");
                }
            } else {
                await NotificationService.cancelAllReminders();
                setNotifications(false);
            }
        } catch (error) {
            console.error("Erreur notifications:", error);
            setNotifications(!value); // Rollback
            Alert.alert("Erreur", "Un problème est survenu lors de la configuration des rappels.");
        }
    };

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email);
                const { data, error } = await supabase
                    .from('profiles')
                    .select('username, skin_type')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setProfile(data);
                    setTempUsername(data.username);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updates) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    ...updates
                });

            if (error) throw error;
            setProfile(prev => ({ ...prev, ...updates }));
            return true;
        } catch (error) {
            Alert.alert("Erreur", error.message);
            return false;
        }
    };

    const handleSaveUsername = async () => {
        if (tempUsername.trim().length < 3) {
            Alert.alert("Oups", "Le pseudo doit faire au moins 3 caractères.");
            return;
        }
        const success = await updateProfile({ username: tempUsername });
        if (success) setIsEditing(false);
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) Alert.alert("Erreur", error.message);
    };

    const skinTypes = ['Sèche', 'Mixte', 'Grasse', 'Sensible'];

    if (loading && !profile.username) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color="#FFDE59" />
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <View style={[styles.profilePicContainer, { backgroundColor: colors.surface }]}>
                    <Image
                        source={{ uri: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}` }}
                        style={styles.profilePic}
                    />
                    <TouchableOpacity style={[styles.editIcon, { borderColor: colors.background }]}>
                        <Ionicons name="camera" size={20} color="#000" />
                    </TouchableOpacity>
                </View>

                {isEditing ? (
                    <View style={styles.editRow}>
                        <TextInput
                            style={[styles.usernameInput, { color: colors.text, borderBottomColor: '#FFDE59' }]}
                            value={tempUsername}
                            onChangeText={setTempUsername}
                            autoFocus
                        />
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUsername}>
                            <Ionicons name="checkmark-done" size={28} color="#FFDE59" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.nameRow}>
                        <Text style={[styles.name, { color: colors.text }]}>{profile.username || 'Utilisateur'}</Text>
                        <TouchableOpacity onPress={() => setIsEditing(true)}>
                            <Ionicons name="create-outline" size={22} color="#FFDE59" />
                        </TouchableOpacity>
                    </View>
                )}

                <Text style={[styles.email, { color: colors.textTertiary }]}>{userEmail || 'anais.asse.akakpo@gmail.com'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Type de peau</Text>
                <View style={styles.chipRow}>
                    {skinTypes.map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.chip,
                                { backgroundColor: colors.surface, borderColor: colors.border },
                                profile.skin_type === type && { backgroundColor: isDark ? colors.card : '#fff', borderColor: '#FFDE59', borderWidth: 2 }
                            ]}
                            onPress={() => updateProfile({ skin_type: type })}
                        >
                            <Text style={[
                                styles.chipText,
                                { color: colors.textSecondary },
                                profile.skin_type === type && { color: colors.text }
                            ]}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Paramètres</Text>

                <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
                    <View style={styles.settingText}>
                        <Ionicons name={isDark ? "moon" : "sunny"} size={22} color={colors.text} />
                        <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>Mode Sombre</Text>
                    </View>
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{ false: colors.border, true: "#FFDE59" }}
                        thumbColor={isDark ? "#fff" : "#f4f3f4"}
                    />
                </View>

                <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
                    <View style={styles.settingText}>
                        <Ionicons name="notifications-outline" size={22} color={colors.text} />
                        <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>Rappels Quotidiens</Text>
                    </View>
                    <Switch
                        value={notifications}
                        onValueChange={toggleNotifications}
                        trackColor={{ false: colors.border, true: "#FFDE59" }}
                        thumbColor={notifications ? "#fff" : "#f4f3f4"}
                    />
                </View>

                <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]}>
                    <View style={styles.settingText}>
                        <Ionicons name="shield-checkmark-outline" size={22} color={colors.text} />
                        <Text style={[styles.itemLabel, { color: colors.textSecondary }]}>Confidentialité</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.settingItem, { borderBottomWidth: 0 }]}
                    onPress={handleSignOut}
                >
                    <View style={styles.settingText}>
                        <Ionicons name="log-out-outline" size={22} color="#FF5A5F" />
                        <Text style={[styles.itemLabel, { color: '#FF5A5F' }]}>Déconnexion</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Text style={[styles.version, { color: colors.textTertiary }]}>GlowDiary v1.0.0</Text>
                <Text style={styles.vibe}>Stay Glowing ✨</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', marginTop: 80, marginBottom: 40 },
    profilePicContainer: { width: 120, height: 120, borderRadius: 60, position: 'relative', marginBottom: 20 },
    profilePic: { width: '100%', height: '100%', borderRadius: 60 },
    editIcon: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#FFDE59', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 4 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    name: { fontSize: 28, fontWeight: 'bold' },
    editRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 40 },
    usernameInput: { flex: 1, fontSize: 18, borderBottomWidth: 2, paddingVertical: 5 },
    saveBtn: { marginLeft: 5 },
    email: { fontSize: 14, marginTop: 6 },
    section: { paddingHorizontal: 25, marginBottom: 35 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, borderWidth: 1 },
    chipText: { fontWeight: '600', fontSize: 15 },
    settingItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1 },
    settingText: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    itemLabel: { fontSize: 17, fontWeight: '500' },
    footer: { alignItems: 'center', paddingVertical: 50, paddingBottom: 120 },
    version: { fontSize: 12 },
    vibe: { fontSize: 15, color: '#FFDE59', fontWeight: 'bold', marginTop: 8 }
});
