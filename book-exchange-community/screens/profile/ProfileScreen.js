import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { Avatar, TextInput, Button, RadioButton, Text, Title, Card, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { AppContext } from "../../context/AppContext";
import { useLogout, useUpdateProfile, useRecoverPassword } from "../../services/ServiceAuth";
import { uploadImage } from "../../services/ServiceStorage";
import { updateRecord, getDocumentById } from "../../services/ServiceFireStore";
import Screens from "../../components/Screens";
import LoadingOverlay from '../../components/LoadingOverlay';


export default function EditProfileScreen({ navigation, route }) {
    const { user, setUser: setAppContextUser } = useContext(AppContext);
    const { pickedCoords } = route.params || {};

    const [profileImage, setProfileImage] = useState(user?.photoURL || null);
    const [name, setName] = useState(user?.displayName || '');
    const [email, setEmail] = useState(user?.email || '');

    const [gender, setGender] = useState('');
    const [birthDate, setBirthDate] = useState(null);
    const [country, setCountry] = useState('');
    const [city, setCity] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState(null);

    const [loading, setLoading] = useState(false);
    const [profileDataLoading, setProfileDataLoading] = useState(true);


    const logout = useLogout();
    const updateProfileAuth = useUpdateProfile();
    const recoverPassword = useRecoverPassword();

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user?.uid) {
                setProfileDataLoading(true);
                try {
                    const userDocSnap = await getDocumentById({ collectionName: 'users', docId: user.uid });

                    if (userDocSnap && userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        setName(userData.displayName || user?.displayName || '');
                        setProfileImage(userData.photoURL || user?.photoURL || null);
                        setGender(userData.gender || '');
                        setBirthDate(userData.birthDate || null);
                        setCountry(userData.country || '');
                        setCity(userData.city || '');
                        setBio(userData.bio || '');
                        setLocation(userData.location || null);
                    } else {
                        setName(user?.displayName || '');
                        setProfileImage(user?.photoURL || null);
                        console.log("Documento de usuario no encontrado en Firestore, usando datos de Auth.");
                    }
                } catch (error) {
                    console.error("Error fetching user profile from Firestore:", error);
                } finally {
                    setProfileDataLoading(false);
                }
            } else {
                setProfileDataLoading(false);
            }
        };

        fetchUserProfile();
        setEmail(user?.email || '');
    }, [user?.uid]);

    useEffect(() => {
        if (pickedCoords) {
            setLocation(pickedCoords);
            Alert.alert("Ubicación Seleccionada", `Lat: ${pickedCoords.latitude.toFixed(4)}, Lng: ${pickedCoords.longitude.toFixed(4)}`);
        }
    }, [pickedCoords]);

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled) {
                setProfileImage(result.assets[0].uri);
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo seleccionar la imagen.');
        }
    };

    const handleUpdateLocation = async () => {
        setLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Se necesita permiso de ubicación.');
                setLoading(false);
                return;
            }
            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation({
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude
            });
            Alert.alert("Ubicación Actualizada", "Se obtuvo tu ubicación actual. Puedes ajustarla en el mapa.");
        } catch (error) {
            Alert.alert('Error', 'No se pudo obtener la ubicación actual.');
        }
        setLoading(false);
    };

    const navigateToLocationPicker = () => {
        navigation.navigate('LocationScreen', { currentCoords: location });
    }

    const handleSaveChanges = async () => {
        if (!user?.uid) {
            Alert.alert("Error", "Usuario no autenticado.");
            return;
        }
        setLoading(true);
        let uploadedImageUrl = profileImage;

        try {
            if (profileImage && profileImage !== user?.photoURL && !profileImage.startsWith('https://firebasestorage.googleapis.com')) {
                const basePath = `${user.uid}/profileImages`;
                uploadedImageUrl = await uploadImage(profileImage, basePath);
                if (!uploadedImageUrl) {
                    Alert.alert("Error", "No se pudo subir la nueva imagen de perfil.");
                    setLoading(false);
                    return;
                }
            }

            const authDataToUpdate = {};
            if (name !== (user?.displayName || '')) authDataToUpdate.displayName = name;
            if (uploadedImageUrl && uploadedImageUrl !== user?.photoURL) authDataToUpdate.photoURL = uploadedImageUrl;

            if (Object.keys(authDataToUpdate).length > 0) {
                const authUpdateSuccess = await updateProfileAuth({ user: authDataToUpdate });
                if (!authUpdateSuccess) {
                    setLoading(false);
                    return;
                }
            }

            const firestoreData = {
                displayName: name,
                photoURL: uploadedImageUrl || user?.photoURL,
                email: email,
                gender,
                birthDate,
                country,
                city,
                bio,
                location,
                updatedAt: new Date().toISOString(),
            };

            await updateRecord({
                collectionName: 'users',
                docId: user.uid,
                data: firestoreData,
            });

            const updatedUserForContext = {
                ...user,
                displayName: name,
                photoURL: uploadedImageUrl || user?.photoURL,
            };
            setAppContextUser(updatedUserForContext);

            Alert.alert("Éxito", "Perfil actualizado correctamente.");
        } catch (error) {
            console.error("Error al guardar el perfil:", error);
            Alert.alert("Error", `No se pudo guardar el perfil: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = () => {
        if (email) {
            recoverPassword(email);
        } else {
            Alert.alert("Error", "No se pudo obtener el correo electrónico del usuario.");
        }
    };

    if (profileDataLoading) {
        return <LoadingOverlay visible={true} text="Cargando perfil..." />;
    }

    const locationSubtitle = (loc) => {
        if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
            return `Lat: ${loc.latitude.toFixed(4)}, Lng: ${loc.longitude.toFixed(4)}`;
        }
        return "No establecida";
    };

    return (
        <Screens>
            <LoadingOverlay visible={loading && !profileDataLoading} text="Guardando cambios..." />
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <Card style={styles.card}>
                    <Card.Content>
                        <Title style={styles.headerTitle}>Editar Perfil</Title>

                        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
                            <Avatar.Image
                                size={120}
                                source={profileImage ? { uri: profileImage } : require('../../assets/Logo.png')}
                                style={styles.avatar}
                            />
                            <View style={styles.cameraIconOverlay}>
                                <IconButton icon="camera" size={24} color="#FFFFFF" onPress={pickImage} />
                            </View>
                        </TouchableOpacity>

                        <TextInput
                            label="Nombre Completo"
                            value={name}
                            onChangeText={setName}
                            mode="outlined"
                            style={styles.input}
                            left={<TextInput.Icon icon="account" />}
                        />
                        <TextInput
                            label="Correo Electrónico"
                            value={email}
                            editable={false}
                            mode="outlined"
                            style={[styles.input, styles.disabledInput]}
                            left={<TextInput.Icon icon="email" />}
                        />

                        <Text style={styles.label}>Género</Text>
                        <RadioButton.Group onValueChange={newValue => setGender(newValue)} value={gender}>
                            <View style={styles.radioGroup}>
                                <View style={styles.radioButtonItem}>
                                    <RadioButton value="masculino" color="#025E73"/>
                                    <Text>Masculino</Text>
                                </View>
                                <View style={styles.radioButtonItem}>
                                    <RadioButton value="femenino" color="#025E73"/>
                                    <Text>Femenino</Text>
                                </View>
                                <View style={styles.radioButtonItem}>
                                    <RadioButton value="otro" color="#025E73"/>
                                    <Text>Otro</Text>
                                </View>
                            </View>
                        </RadioButton.Group>

                        <TextInput
                            label="Fecha de Nacimiento (YYYY-MM-DD)"
                            value={birthDate ? (typeof birthDate === 'string' ? birthDate : birthDate.toISOString().split('T')[0]) : ''}
                            onChangeText={setBirthDate}
                            mode="outlined"
                            style={styles.input}
                            left={<TextInput.Icon icon="calendar" />}
                            keyboardType="numeric"
                        />

                        <TextInput
                            label="País"
                            value={country}
                            onChangeText={setCountry}
                            mode="outlined"
                            style={styles.input}
                            left={<TextInput.Icon icon="earth" />}
                        />
                        <TextInput
                            label="Ciudad"
                            value={city}
                            onChangeText={setCity}
                            mode="outlined"
                            style={styles.input}
                            left={<TextInput.Icon icon="city-variant" />}
                        />
                        <TextInput
                            label="Biografía Corta"
                            value={bio}
                            onChangeText={setBio}
                            mode="outlined"
                            style={styles.input}
                            multiline
                            numberOfLines={3}
                            left={<TextInput.Icon icon="information-outline" />}
                        />

                        <Card style={styles.locationCard}>
                            <Card.Title
                                title="Ubicación para Intercambios"
                                subtitle={locationSubtitle(location)}
                            />
                            <Card.Actions>
                                <Button icon="map-marker-plus" mode="outlined" onPress={navigateToLocationPicker} style={styles.locationButton}>
                                    Seleccionar en Mapa
                                </Button>
                                <Button icon="crosshairs-gps" mode="outlined" onPress={handleUpdateLocation} style={styles.locationButton}>
                                    Usar Actual
                                </Button>
                            </Card.Actions>
                        </Card>

                        <Button
                            mode="contained"
                            onPress={handleSaveChanges}
                            style={styles.button}
                            labelStyle={styles.buttonLabel}
                            icon="content-save"
                            loading={loading && !profileDataLoading}
                            disabled={loading || profileDataLoading}
                        >
                            Guardar Cambios
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={handleChangePassword}
                            style={styles.buttonOutline}
                            labelStyle={styles.buttonOutlineLabel}
                            icon="lock-reset"
                        >
                            Cambiar Contraseña
                        </Button>
                        <Button
                            mode="outlined"
                            onPress={logout}
                            style={[styles.buttonOutline, styles.logoutButton]}
                            labelStyle={[styles.buttonOutlineLabel, styles.logoutButtonLabel]}
                            icon="logout"
                        >
                            Cerrar Sesión
                        </Button>
                    </Card.Content>
                </Card>
            </ScrollView>
        </Screens>
    );
}

const styles = StyleSheet.create({
    scrollContainer: {
        padding: 10,
        paddingBottom: 20,
    },
    card: {
        marginHorizontal: 5,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#025E73',
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    avatar: {
        backgroundColor: '#e0e0e0',
    },
    cameraIconOverlay: {
        position: 'absolute',
        bottom: 0,
        right: '30%',
        backgroundColor: '#025E73',
        borderRadius: 20,
        padding: 0,
    },
    input: {
        marginBottom: 15,
        backgroundColor: '#FFFFFF',
    },
    disabledInput: {
        backgroundColor: '#f0f0f0',
    },
    label: {
        fontSize: 16,
        color: '#424242',
        marginBottom: 8,
        marginLeft: 5,
        fontWeight: '500',
    },
    radioGroup: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 15,
    },
    radioButtonItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationCard: {
        marginVertical: 15,
        backgroundColor: '#f9f9f9',
    },
    locationButton: {
        marginHorizontal: 4,
        flexShrink: 1,
    },
    button: {
        marginTop: 20,
        paddingVertical: 8,
        backgroundColor: '#025E73',
    },
    buttonLabel: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonOutline: {
        marginTop: 15,
        paddingVertical: 8,
        borderColor: '#025E73',
    },
    buttonOutlineLabel: {
        color: '#025E73',
        fontSize: 16,
    },
    logoutButton: {
        borderColor: '#D32F2F',
        marginTop: 20,
    },
    logoutButtonLabel: {
        color: '#D32F2F',
    }
});
