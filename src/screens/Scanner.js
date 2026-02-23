import React, { useState, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Alert, Image, Dimensions, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/useTheme';

const { width, height } = Dimensions.get('window');

export default function Scanner({ navigation }) {
    const { colors, isDark } = useTheme();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);
    const isScanning = useRef(false);

    if (!permission) return <View style={[styles.container, { backgroundColor: colors.background }]} />;
    if (!permission.granted) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
                <View style={styles.iconCircle}>
                    <Ionicons name="camera" size={40} color="#000" />
                </View>
                <Text style={[styles.permissionTitle, { color: colors.text }]}>Caméra requise</Text>
                <Text style={[styles.permissionText, { color: colors.textSecondary }]}>On a besoin de ta caméra pour analyser tes produits préférés ✨</Text>
                <TouchableOpacity style={[styles.permissionButton, { backgroundColor: colors.text }]} onPress={requestPermission}>
                    <Text style={[styles.permissionButtonText, { color: colors.background }]}>Donner l'accès</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = async ({ data }) => {
        if (isScanning.current) return;
        isScanning.current = true;
        setScanned(true);
        setLoading(true);

        try {
            const response = await fetch(`https://world.openbeautyfacts.org/api/v0/product/${data}.json`);
            const result = await response.json();

            if (result.status === 1) {
                const product = result.product;

                const { error } = await supabase.from('products').upsert({
                    barcode: data,
                    name: product.product_name || 'Inconnu',
                    brand: product.brands || 'Inconnue',
                    image_url: product.image_url,
                    ingredients: product.ingredients_text,
                }, { onConflict: 'barcode' });

                if (error) throw error;

                Alert.alert(
                    "Produit détecté ! ✨",
                    `${product.product_name} a été ajouté à ta collection.`,
                    [{
                        text: "Super !", onPress: () => {
                            resetScanner();
                            navigation.navigate('Ma Liste');
                        }
                    }]
                );
            } else {
                Alert.alert("Oups", "Désolé, ce produit n'est pas encore dans notre base.", [{ text: "Réessayer", onPress: resetScanner }]);
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Erreur", "Une erreur est survenue lors du scan.", [{ text: "OK", onPress: resetScanner }]);
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        isScanning.current = false;
        setScanned(false);
    };

    return (
        <View style={styles.container}>
            <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8"] }}
                style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.overlay}>
                <View style={styles.topSection}>
                    <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={28} color="#fff" />
                    </TouchableOpacity>
                    <BlurView intensity={20} tint="dark" style={styles.headerPill}>
                        <Text style={styles.headerText}>Analyse Produit</Text>
                    </BlurView>
                </View>

                <View style={styles.middleSection}>
                    <View style={styles.focusedContainer}>
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />

                        {!scanned && <View style={styles.scanLine} />}

                        {loading && (
                            <View style={styles.loadingOverlay}>
                                <ActivityIndicator size="large" color="#FFDE59" />
                                <Text style={styles.loadingText}>Analyse en cours...</Text>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.bottomSection}>
                    {!scanned ? (
                        <View style={styles.hintContainer}>
                            <Ionicons name="barcode-outline" size={32} color="#FFDE59" />
                            <Text style={styles.hintText}>Place le code-barres dans le cadre</Text>
                        </View>
                    ) : !loading && (
                        <TouchableOpacity style={styles.rescanButton} onPress={resetScanner}>
                            <Ionicons name="refresh" size={24} color="#000" />
                            <Text style={styles.rescanText}>Scanner un autre produit</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFDE59', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
    permissionTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    permissionText: { textAlign: 'center', fontSize: 16, marginBottom: 30, lineHeight: 24 },
    permissionButton: { paddingHorizontal: 40, paddingVertical: 18, borderRadius: 30 },
    permissionButtonText: { fontWeight: 'bold', fontSize: 16 },

    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    topSection: { paddingTop: 60, paddingHorizontal: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
    backBtn: { position: 'absolute', left: 25, top: 60, width: 45, height: 45, borderRadius: 23, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    headerPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, overflow: 'hidden' },
    headerText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    middleSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    focusedContainer: { width: width * 0.75, height: 250, position: 'relative', borderRadius: 20, overflow: 'hidden' },
    corner: { position: 'absolute', width: 30, height: 30, borderColor: '#FFDE59', borderWidth: 5 },
    topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 15 },
    topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 15 },
    bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 15 },
    bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 15 },
    scanLine: { position: 'absolute', top: '50%', left: '10%', right: '10%', height: 3, backgroundColor: '#FFDE59', shadowColor: '#FFDE59', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 10 },

    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#fff', marginTop: 15, fontWeight: 'bold' },

    bottomSection: { height: '25%', justifyContent: 'center', alignItems: 'center' },
    hintContainer: { alignItems: 'center', gap: 12 },
    hintText: { color: '#fff', fontSize: 16, fontWeight: '500', textAlign: 'center' },
    rescanButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFDE59', paddingHorizontal: 30, paddingVertical: 18, borderRadius: 30, gap: 10, shadowOpacity: 0.3, elevation: 5 },
    rescanText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
});