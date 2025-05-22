import React, {useContext, useState} from "react";
import {useRoute} from "@react-navigation/native";
import {View, Image, Alert, ScrollView} from "react-native";
import {Button} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import {uploadImage} from "../../services/ServiceStorage";
import {AppContext} from "../../context/AppContext";
import {updateBook} from "../../services/ServiceBooks";

export default function UploadPhotoScreen({navigation}) {
    const route = useRoute();
    const {idBook} = route.params;
    const [images, setImages] = useState([]);
    const [uploading, setUploading] = useState(false);
    const {user} = useContext(AppContext);

    const pickImage = async (fromCamera) => {
        let result;
        if (fromCamera) {
            result = await ImagePicker.launchCameraAsync({allowsEditing: false, aspect: [3, 4], quality: 1});
        } else {
            result = await ImagePicker.launchImageLibraryAsync({allowsEditing: false, aspect: [3, 4], quality: 1});
        }

        if (!result.canceled) {
            const uri = result.assets[0].uri;
            setImages((prev) => [...prev, uri].slice(0, 3));
        }
    };

    const handleUpload = async () => {
        if (images.length === 0) {
            Alert.alert("Error", "Selecciona al menos una imagen.");
            return;
        }

        setUploading(true);

        try {
            const basePath = `${user.uid}/${idBook}`;
            const uploadPromises = images.map((uri) => uploadImage(uri, basePath));

            const downloadURLs = await Promise.all(uploadPromises);
            const successful = downloadURLs.filter((url) => url != null);

            if (successful.length !== images.length) {
                Alert.alert("Error", "Algunas imágenes no se subieron correctamente.");
            } else {
                Alert.alert("Éxito", "Todas las imágenes han sido subidas correctamente.");

                const updateBookData = {photos: successful, status: 'completed', available: true};
                const success = await updateBook(idBook, updateBookData);
                if (success) {
                    Alert.alert("Éxito", "Libro subido correctamente");
                    navigation.navigate('AddBookScreen');
                }
            }
        } catch (err) {
            console.error("Error en handleUpload:", err);
            Alert.alert("Error", "Ocurrió un problema subiendo las imágenes.");
        } finally {
            setUploading(false);
            setImages([]);
        }
    };

    return (
        <View style={{flex: 1, padding: 20, justifyContent: "center", alignItems: "center"}}>
            <ScrollView>
                {images.map((img, idx) => (
                    <Image key={idx} source={{uri: img}} style={{width: 200, height: 250, margin: 5}}/>
                ))}
            </ScrollView>

            <View style={{width: '100%', flexDirection: 'row', justifyContent: 'center', marginVertical: 10}}>
                <Button
                    mode="contained"
                    onPress={() => pickImage(true)}
                    disabled={images.length >= 3 || uploading}
                    buttonColor="#025E73"
                    textColor="#F2A71B"
                    style={{flex: 1, margin: 5}}
                >
                    Tomar Foto
                </Button>
                <Button
                    mode="contained"
                    onPress={() => pickImage(false)}
                    disabled={images.length >= 3 || uploading}
                    buttonColor="#025E73"
                    textColor="#F2A71B"
                    style={{flex: 1, margin: 5}}
                >
                    Galería
                </Button>
            </View>

            <Button
                mode="contained"
                onPress={handleUpload}
                loading={uploading}
                disabled={uploading || images.length === 0}
                buttonColor="#025E73"
                textColor="#F2A71B"
                style={{width: '100%', marginTop: 10}}
            >
                Subir Imágenes
            </Button>
        </View>
    );
}