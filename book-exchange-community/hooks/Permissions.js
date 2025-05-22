import {useEffect, useState} from "react";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Notifications from 'expo-notifications';
import {Alert} from "react-native";

const usePermissions = () => {
    const [cameraPermission, setCameraPermission] = useState(null);
    const [galleryPermission, setGalleryPermission] = useState(null);
    const [locationPermission, setLocationPermission] = useState(null);
    const [notificationPermission, setNotificationPermission] = useState(null);

    useEffect(() => {
        (async () => {
            const {status: cameraStatus} = await ImagePicker.requestCameraPermissionsAsync();
            const {status: galleryStatus} = await ImagePicker.requestMediaLibraryPermissionsAsync();
            const {status: locationStatus} = await Location.requestForegroundPermissionsAsync();
            const {status: notificationStatus} = await Notifications.requestPermissionsAsync();

            setCameraPermission(cameraStatus === "granted");
            setGalleryPermission(galleryStatus === "granted");
            setLocationPermission(locationStatus === "granted");
            setNotificationPermission(notificationStatus === "granted");

            if (cameraStatus !== "granted" || galleryStatus !== "granted") {
                Alert.alert("Permiso denegado", "Es necesario permitir acceso a la cámara y galería.");
            }
            if (locationStatus !== "granted") {
                Alert.alert("Permiso de ubicación denegado", "Es necesario permitir acceso a la ubicación.");
            }
            if (notificationStatus !== "granted") {
                Alert.alert("Permiso de notificaciones denegado", "Es necesario permitir las notificaciones.");
            }
        })();
    }, []);

    return {cameraPermission, galleryPermission, locationPermission, notificationPermission};
};

export default usePermissions;

