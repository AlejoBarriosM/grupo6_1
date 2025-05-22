import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Alert, StyleSheet, Text, View} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import * as Location from 'expo-location';
import CompButton from "../../components/CompButton";

export default function LocationPickerScreen({ navigation }) {
    const [hasPermission, setHasPermission] = useState(null);
    const [initialRegion, setInitialRegion] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Se requiere permiso de ubicación para usar esta función');
                setHasPermission(false);
                setLoading(false);
                return;
            }
            setHasPermission(true);
            let location = await Location.getCurrentPositionAsync({});
            setInitialRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
            setLoading(false);
        })();
    }, []);

    const handleMapPress = (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setSelectedLocation({ latitude, longitude });
    };

    const saveLocation = () => {
        if (!selectedLocation) {
            Alert.alert('Ubicación no seleccionada', 'Por favor toca el mapa para seleccionar una ubicación.');
            return;
        }
        const coords = selectedLocation;
        navigation.navigate('ProfileScreen', { pickedCoords: coords });
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.centered}>
                <Text>Permiso de ubicación denegado.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                onPress={handleMapPress}
            >
                {selectedLocation && (
                    <Marker
                        title="Ubicación seleccionada"
                        coordinate={selectedLocation}
                    />
                )}
            </MapView>
            <View style={styles.buttonContainer}>
                <CompButton text={"Guardar ubicación"} onPress={saveLocation} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
