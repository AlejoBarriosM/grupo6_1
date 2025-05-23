// services/ServiceFireStore.js
import {addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where} from 'firebase/firestore';
import {db} from '../lib/Firebase';
import {Alert} from "react-native";

export const createRecord = async ({ collectionName, data }) => {
    try {
        const colRef = collection(db, collectionName);
        const docRef = await addDoc(colRef, data);
        return docRef.id;
    } catch (e) {
        Alert.alert('Error', e.message);
        throw e;
    }
};

export const createRecordWithId = async ({ collectionName, docId, data }) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, data);
        return docRef.id;
    } catch (e) {
        Alert.alert("Error al crear documento", e.message);
        throw e;
    }
};

export const getCollection = async ({ collectionName }) => {
    try {
        const colRef = collection(db, collectionName);
        const querySnapshot = await getDocs(colRef);
        return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })); // Devolver id y data
    } catch (e) {
        Alert.alert('Error', e.message);
        throw e;
    }
};

export const getCollectionByUser = async ({ userId }) => {
    try {
        const colRef = collection(db, 'books');
        const q = query(colRef, where('ownerUserId', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    } catch (e) {
        Alert.alert('Error', e.message);
        throw e;
    }
};


export const getDocumentById = async ({ collectionName, docId }) => {
    if (!db) {
        console.error("getDocumentById: Firestore db instance is not available.");
        Alert.alert("Error de Conexión", "La conexión con la base de datos no está disponible.");
        return null;
    }
    if (!collectionName || !docId) {
        console.error("getDocumentById: collectionName and docId are required.");
        Alert.alert("Error de Datos", "Faltan datos para obtener el documento.");
        return null;
    }
    try {
        const docRef = doc(db, collectionName, docId);
        return await getDoc(docRef);
    } catch (e) {
        console.error(`Error en getDocumentById para ${collectionName}/${docId}:`, e);
        Alert.alert('Error de Lectura', `No se pudo obtener el documento: ${e.message}`);
        return null;
    }
};

export const updateRecord = async ({ collectionName, docId, data }) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, data);
    } catch (e) {
        Alert.alert('Error', e.message);
        throw e;
    }
};

export const deleteRecord = async ({ collectionName, docId }) => {
    try {
        const colRef = collection(db, collectionName);
        await deleteDoc(doc(colRef, docId));
    } catch (e) {
        Alert.alert('Error', e.message);
        throw e;
    }
};
