import React from 'react';
import {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet, Alert} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import VectorIcons from 'react-native-vector-icons/FontAwesome';
import Screens from "../../components/Screens";
import CompInput from "../../components/CompInput";
import CompButton from "../../components/CompButton";
import {useLogout, useUpdateProfile} from "../../services/ServiceAuth";
import {uploadImage} from "../../services/ServiceStorage";
import {useContext} from "react";
import {AppContext} from "../../context/AppContext";
import * as Location from 'expo-location';


export default function EditProfileScreen({navigation, route}) {
    const {pickedCoords} = route.params || {};
    const {user} = useContext(AppContext);
    const [profileImage, setProfileImage] = useState(user.photoURL || null);
    const [name, setName] = useState(user.displayName || '');
    const [location, setLocation] = useState(user.location || null);
    const logout = useLogout();
    const updateProfile = useUpdateProfile();

    const handleGetLocation = async () => {
        setLocation(null);
        try {
            let currentLocation = await Location.getCurrentPositionAsync();
            setLocation({lat: currentLocation.coords.latitude, lng: currentLocation.coords.longitude});
        } catch (error) {
            Alert.alert('Error', 'No se pudo obtener la ubicación.');
        }
    };
    //
    // useEffect(() => {
    //     setName(user.displayName);
    //     (async () => {
    //         try {
    //             let currentLocation = await Location.getCurrentPositionAsync();
    //             setLocation({lat: currentLocation.coords.latitude, lng: currentLocation.coords.longitude});
    //         } catch (error) {
    //             console.error(error);
    //         }
    //     })();
    //
    //
    // }, []);


    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                // mediaTypes: ImagePicker.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled) {
                setProfileImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo seleccionar la imagen.');
        }
    };

    const handleLocation = async () => {
        try {
            await navigation.navigate('LocationScreen');
            setLocation(pickedCoords);

        } catch (error) {
            Alert.alert('Error', 'No se pudo abrir la configuración de ubicación.');
        }
    }

    const handleUpload = async () => {
        if (profileImage.length === 0) {
            Alert.alert("Error", "Selecciona al menos una imagen.");
            return;
        }

        try {
            const basePath = `${user.uid}/profile`;
            const uploadPromises = await uploadImage(profileImage, basePath);
            await handleGetLocation();

            const updateUserData = {
                user: {
                    location: location,
                    photoURL: uploadPromises,
                    displayName: name,
                }
            };
            const success = await updateProfile(updateUserData);
            if (success) {
                Alert.alert("Éxito", "Perfil actualizado correctamente");
                // navigation.navigate('AddBook');
            }
        } catch
            (err) {
            Alert.alert("Error", "Ocurrió un problema subiendo las imágenes.");
        }
    };

    return (
        <Screens>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Editar Perfil</Text>
            </View>

            <View style={styles.profileImageContainer}>
                <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                    {profileImage ? (
                        <Image source={{uri: profileImage}} style={styles.profileImage}/>
                    ) : (
                        <View style={styles.profileImagePlaceholder}>
                            <VectorIcons name="camera" size={48} color="#757575"/>
                            <Text style={styles.profileImagePlaceholderText}>Añadir foto</Text>
                        </View>
                    )}
                    <View style={styles.cameraIconOverlay}>
                        <VectorIcons name="camera" size={24} color="#FFFFFF"/>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre</Text>
                <CompInput placeholder="Ingresa Nombre" onChangeText={setName} value={name}/>
            </View>

            {/*<View style={styles.inputGroup}>*/}
            {/*    <Text style={styles.label}>Ubicación</Text>*/}
            {/*    <CompInput placeholder="Ingresa el título o autor" onChangeText={setLocation} value={location}/>*/}
            {/*</View>*/}

            <View style={styles.inputGroup}>
                <CompButton text="Seleccionar Ubicación" onPress={handleGetLocation}/>
                <CompButton text="Guardar Cambios" onPress={handleUpload}/>
                {/*<Text style={styles.label}>{JSON.stringify(location)}</Text>*/}
                <CompButton text="Cerrar Sesión" onPress={logout}/>
            </View>

        </Screens>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#011F26',
    },
    profileImageContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    imagePicker: {
        position: 'relative',
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 3,
        borderColor: '#6200EE',
    },
    profileImagePlaceholder: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#BDBDBD',
    },
    profileImagePlaceholderText: {
        marginTop: 8,
        color: '#757575',
        fontSize: 14,
    },
    cameraIconOverlay: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 8,
        borderRadius: 20, // Círculo para el ícono
    },
    inputGroup: {
        marginHorizontal: 20,
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#424242',
        marginBottom: 8,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10, // Bordes redondeados
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingHorizontal: 15, // Padding interno
    },
});