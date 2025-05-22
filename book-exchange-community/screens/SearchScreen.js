import * as React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export default function SearchScreen() {
    const [mapRegion, setMapRegion] = useState({
        latitude: 0,
        longitude: 0,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const handleGetLocation = async () => {
        try {

            let currentLocation = await Location.getCurrentPositionAsync({});
            setMapRegion({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
        } catch (error) {
            console.error("Error al obtener la ubicación:", error);
            Alert.alert('Error', 'No se pudo obtener la ubicación. Asegúrate de tener los permisos activados y la ubicación habilitada en tu dispositivo.');
        }
    };

    useEffect(() => {
        handleGetLocation();
    }, []);

    useFocusEffect(
        useCallback(() => {
            handleGetLocation();
            return () => {};
        }, [])
    );

    return (
        <View style={styles.container}>
            {mapRegion.latitude !== 0 && mapRegion.longitude !== 0 ? (
                <MapView
                    style={styles.map}
                    showsUserLocation={true}
                    showsCompass={false}
                    showsPointsOfInterest={false}
                    showsMyLocationButton={true}
                    showsTraffic={false}
                    showsIndoors={false}
                    showsBuildings={false}
                    region={mapRegion}
                    // onRegionChangeComplete={(region) => setMapRegion(region)}
                >
                </MapView>
            ) : (
                <Text>Cargando ubicación...</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    map: {
        flex: 1,
        borderRadius: 5,
        width: '100%',
        height: '100%',
    },
});