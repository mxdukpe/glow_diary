import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native'
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../theme/useTheme';

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground.
AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active') {
        supabase.auth.startAutoRefresh()
    } else {
        supabase.auth.stopAutoRefresh()
    }
})

export default function Auth() {
    const { colors, isDark } = useTheme();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)

    async function signInWithEmail() {
        setLoading(true)
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) Alert.alert("Erreur", error.message)
        setLoading(false)
    }

    async function signUpWithEmail() {
        setLoading(true)
        const {
            data: { session, user },
            error,
        } = await supabase.auth.signUp({
            email: email,
            password: password,
        })

        if (error) {
            Alert.alert("Erreur", error.message)
        } else if (session) {
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert([
                    {
                        id: user.id,
                        username: email.split('@')[0],
                        skin_type: 'Mixte'
                    }
                ])

            if (profileError) console.error("Erreur profil:", profileError.message)
            Alert.alert("Succès", "Ton compte GlowDiary a été créé ! ✨")
        } else {
            Alert.alert('Vérifie tes emails !', 'Un lien de confirmation t-a été envoyé.')
        }
        setLoading(false)
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <View style={styles.header}>
                <Text style={styles.emoji}>✨</Text>
                <Text style={[styles.title, { color: colors.text }]}>GlowDiary</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {isSignUp ? 'Crée ton compte pour sauver ta peau' : 'Bon retour, prête à briller ?'}
                </Text>
            </View>

            <View style={styles.form}>
                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="mail-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                        label="Email"
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                        placeholder="email@adresse.com"
                        placeholderTextColor={colors.textTertiary}
                        autoCapitalize={'none'}
                        style={[styles.input, { color: colors.text }]}
                    />
                </View>

                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
                    <TextInput
                        label="Mot de passe"
                        onChangeText={(text) => setPassword(text)}
                        value={password}
                        secureTextEntry={true}
                        placeholder="Ton mot de passe secret"
                        placeholderTextColor={colors.textTertiary}
                        autoCapitalize={'none'}
                        style={[styles.input, { color: colors.text }]}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    disabled={loading}
                    onPress={() => isSignUp ? signUpWithEmail() : signInWithEmail()}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Chargement...' : (isSignUp ? "S'inscrire" : "Se connecter")}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() => setIsSignUp(!isSignUp)}
                >
                    <Text style={[styles.switchText, { color: isDark ? '#FFDE59' : '#000' }]}>
                        {isSignUp ? "Déjà un compte ? Se connecter" : "Pas encore de compte ? S'inscrire"}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    emoji: {
        fontSize: 50,
        marginBottom: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 8,
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    form: {
        gap: 15,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 60,
        borderWidth: 1,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#FFDE59',
        height: 60,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#000',
        fontSize: 18,
        fontWeight: 'bold',
    },
    switchButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    switchText: {
        fontSize: 14,
        fontWeight: '600',
    },
})
