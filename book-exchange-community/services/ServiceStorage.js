import {storage} from "../lib/Firebase";
import {getDownloadURL, ref, uploadBytes} from "firebase/storage";
import {Alert} from "react-native";

export const uploadImage = async (imageUri, path) => {
    if (!imageUri) {
        Alert.alert("Error", "Selecciona una imagen primero.");
        return null;
    }
    // console.log(imageUri)
    // console.log(path)
    try {
        const normalizedUri = imageUri.startsWith("file://") ? imageUri : `file://${imageUri}`;

        const response = await fetch(normalizedUri);
        const blob = await response.blob();
        const filename = `images/${path}/${Date.now()}.jpg`;
        const storageRef = ref(storage, filename);

        await uploadBytes(storageRef, blob);

        return await getDownloadURL(storageRef);
    } catch (error) {
        Alert.alert("Error", "No se pudo subir la imagen.");
        return null;
    }
};