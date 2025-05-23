import * as Notifications from 'expo-notifications';
import {Platform, Alert} from 'react-native';
import {updateRecord} from "../services/ServiceFireStore";


export async function registerForPushNotificationsAsync() {
    try {
// Obtener el estado actual de los permisos
        const {status: existingStatus} = await
            Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
// Si los permisos no están concedidos, solicitarlos
        if (existingStatus !== 'granted') {
            const {status} = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            Alert.alert('Error', 'No se pudieron obtener los permisos para recibir notificaciones.');
            return;
        }
// Obtener el token de notificaciones de Expo
        const tokenData = await Notifications.getExpoPushTokenAsync();
        const token = tokenData.data;
        console.log('Token Expo:', token);
        await updateRecord({
            collectionName: 'users',
            docId: '', // Reemplaza con el ID del usuario actual
            data: {expoPushToken: token}
        });
        return token;
    } catch (error) {
        console.error('Error registrando notificaciones:', error);
    }
}

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});