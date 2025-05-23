import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import CompButton from "../../components/CompButton";


const FALLBACK_COORDS = {
    latitude: 6.2442,
    longitude: -75.5812,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

export default function LocationPickerScreen({ navigation, route }) {
    const { currentCoords } = route.params || {}; // Recibir currentCoords

    const [hasPermission, setHasPermission] = useState(null);
    const [initialRegion, setInitialRegion] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mapReady, setMapReady] = useState(false);


    useEffect(() => {
        (async () => {
            setLoading(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Se requiere permiso de ubicación para usar esta función.');
                setHasPermission(false);
                setInitialRegion(FALLBACK_COORDS);
                setSelectedLocation(null);
                setLoading(false);
                return;
            }
            setHasPermission(true);

            if (currentCoords && typeof currentCoords.latitude === 'number' && typeof currentCoords.longitude === 'number') {
                const region = {
                    latitude: currentCoords.latitude,
                    longitude: currentCoords.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                };
                setInitialRegion(region);
                setSelectedLocation({ latitude: currentCoords.latitude, longitude: currentCoords.longitude });
                console.log("LocationScreen: Usando currentCoords para la región inicial y marcador:", region);
            } else {
                try {
                    console.log("LocationScreen: currentCoords no válidas o no proporcionadas, obteniendo ubicación actual...");
                    let location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.High,
                        timeout: 10000,
                    });
                    const region = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                    };
                    setInitialRegion(region);
                    console.log("LocationScreen: Ubicación actual obtenida:", region);
                } catch (error) {
                    console.error("LocationScreen: Error obteniendo ubicación actual:", error);
                    Alert.alert('Error de Ubicación', 'No se pudo obtener tu ubicación actual. Mostrando ubicación por defecto.');
                    setInitialRegion(FALLBACK_COORDS); // Usar fallback si falla la geolocalización
                    setSelectedLocation(null);
                }
            }
            setLoading(false);
        })();
    }, [currentCoords]);

    const handleMapPress = (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setSelectedLocation({ latitude, longitude });
        console.log("LocationScreen: Ubicación seleccionada por el usuario:", { latitude, longitude });
    };

    const saveLocation = () => {
        if (!selectedLocation) {
            Alert.alert('Ubicación no seleccionada', 'Por favor toca el mapa para seleccionar una ubicación.');
            return;
        }
        navigation.navigate('ProfileScreen', { pickedCoords: selectedLocation });
        console.log("LocationScreen: Guardando ubicación y navegando de vuelta:", selectedLocation);
    };

    if (loading || !initialRegion) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#025E73" />
                <Text style={styles.loadingText}>Cargando mapa...</Text>
            </View>
        );
    }

    if (hasPermission === false && initialRegion === FALLBACK_COORDS) {
        return (
            <View style={styles.centered}>
                <Text style={{ color: 'red' }}>No se pudo obtener la ubicación. Por favor, verifica los permisos de ubicación en tu dispositivo.</Text>
            </View>
        );
    }


    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                onPress={handleMapPress}
                showsUserLocation={hasPermission}
                showsMyLocationButton={hasPermission}
                onMapReady={() => setMapReady(true)}
            >
                {selectedLocation && mapReady && (
                    <Marker
                        title="Ubicación seleccionada"
                        coordinate={selectedLocation}
                        pinColor="#025E73"
                    />
                )}
            </MapView>
            <View style={styles.buttonContainer}>
                <CompButton
                    text={"Guardar Ubicación"}
                    onPress={saveLocation}
                    disabled={!selectedLocation}
                />
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
        backgroundColor: 'rgba(255,255,255,0.8)',
        paddingVertical: 10,
        borderRadius: 10,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    }
});
