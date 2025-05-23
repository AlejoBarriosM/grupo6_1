import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import { updateRecord } from './ServiceFireStore';
import Constants from 'expo-constants';

export async function registerForPushNotificationsAsync(userId) {
    if (!userId) {
        Alert.alert('Error', 'Se requiere un ID de usuario para registrar las notificaciones.');
        return null;
    }

    let token;
    try {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            Alert.alert('Permiso denegado', 'No se pudo obtener el permiso para las notificaciones push.');
            console.log('Failed to get push token permission!');
            return null;
        }

        const projectId = Constants.expoConfig?.extra?.eas?.projectId;

        if (!projectId) {
            console.error('Error: projectId no encontrado en la configuración de Expo. Asegúrate de que extra.eas.projectId esté definido en app.json.');
            Alert.alert('Error de Configuración', 'No se pudo obtener el projectId para las notificaciones. Contacta al soporte.');
            return null;
        }

        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Expo Push Token:', token);

        if (token) {
            await updateRecord({
                collectionName: 'users',
                docId: userId,
                data: { expoPushToken: token, updatedAt: new Date().toISOString() },
            });
            console.log('Token guardado en Firestore para el usuario:', userId);
            return token;
        }
    } catch (error) {
        console.error('Error al registrar para notificaciones push:', error);
        Alert.alert('Error de Notificación', `No se pudo obtener o guardar el token de notificación: ${error.message}`);
        return null;
    }
    return null;
}

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});
