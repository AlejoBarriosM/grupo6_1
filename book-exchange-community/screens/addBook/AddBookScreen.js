import React, {useContext, useEffect} from 'react';
import {Alert, View} from 'react-native';
import CompButton from "../../components/CompButton";
import MyBooks from "../../components/MyBooks";
import Screens from "../../components/Screens";
import {registerForPushNotificationsAsync} from "../../services/ServiceExpoNotification";
import {AppContext} from "../../context/AppContext";
import LoadingOverlay from "../../components/LoadingOverlay";

export default function AddBookScreen({navigation}) {
    const { user, notificationPermission, loading } = useContext(AppContext);

    useEffect(() => {
        const registerToken = async () => {
            if (user?.uid && notificationPermission) {
                try {
                    const token = await registerForPushNotificationsAsync(user.uid);
                } catch (error) {
                    Alert.alert("Error de Notificación", "Hubo un problema al configurar las notificaciones.");
                }
            } else if (user?.uid && !notificationPermission) {
                Alert.alert("Permiso de notificaciones denegado", "Es necesario permitir las notificaciones.");
            }
        };

        registerToken();
    }, [user?.uid, notificationPermission]);


    return (
        <Screens>
            <View style={{flex: 7}}>
                <MyBooks/>
            </View>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', alignContent: 'center'}}>
                <CompButton text=" + Agregar Libro" onPress={() => navigation.navigate('SearchBookScreen')}/>
            </View>
            <LoadingOverlay visible={loading} text="Cargando tus libros..." />
        </Screens>
    );
}
