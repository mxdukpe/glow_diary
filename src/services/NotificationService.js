import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

// Configuration de la gestion des notifications (comment elles s'affichent quand l'app est ouverte)
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const requestPermissions = async () => {
    if (!Device.isDevice) {
        console.warn('Notifications: Simulateur détecté. On autorise pour le test UI.');
        return true; // On autorise pour que le bouton bouge sur simulateur
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        Alert.alert('Erreur', 'Permission de notification refusée !');
        return false;
    }
    return true;
};

export const scheduleDailyReminders = async () => {
    // On annule tout avant de recommencer pour éviter les doublons
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Rappel du Matin (08:30)
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "GlowDiary ☀️",
            body: "C'est l'heure de ta routine du matin ! Ta peau va adorer.",
            data: { screen: 'Routine' },
        },
        trigger: {
            type: 'daily',
            hour: 8,
            minute: 30,
        },
    });

    // Rappel du Soir (20:30)
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "GlowDiary 🌙",
            body: "N'oublie pas ta routine du soir avant de te coucher.",
            data: { screen: 'Routine' },
        },
        trigger: {
            type: 'daily',
            hour: 20,
            minute: 30,
        },
    });

    console.log("Rappels quotidiens programmés (08:30 & 20:30)");
};

export const cancelAllReminders = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("Tous les rappels ont été annulés.");
};
