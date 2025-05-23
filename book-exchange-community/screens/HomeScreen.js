import React from 'react';
import {Alert, Text, View} from 'react-native';
import {AppContext} from "../context/AppContext";

export default function HomeScreen({navigation}) {

    const {
        cameraPermission,
        galleryPermission,
        locationPermission,
        notificationPermission,
        user
    } = React.useContext(AppContext);

    if (!locationPermission) {
        Alert.alert("Permiso de ubicación denegado", "Es necesario permitir acceso a la ubicación.");
        return;
    }
    if (!cameraPermission) {
        Alert.alert("Permiso denegado", "Se necesita acceso a la cámara para tomar fotos.");
        return;
    }
    if (!galleryPermission) {
        Alert.alert("Permiso denegado", "Se necesita acceso a la galería para seleccionar fotos.");
        return;
    }
    if (!notificationPermission) {
        Alert.alert("Permiso de notificaciones denegado", "Es necesario permitir las notificaciones.");
        return;
    }

    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text>Home Screen</Text>
        </View>
    );
}

