import {addDoc, collection, getDocs, deleteDoc, doc, updateDoc, query, where, setDoc} from 'firebase/firestore';
import {db} from '../lib/Firebase'
import {Alert} from "react-native";


export const createRecord = async ({collectionName, data}) => {
    try {
        const colRef = collection(db, collectionName);
        const docRef = await addDoc(colRef, data);
        return docRef.id;
    } catch (e) {
        Alert.alert('Error', e.message);
    }
}

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

export const getCollection = async ({collectionName}) => {
    try {
        const colRef = collection(db, collectionName);
        const querySnapshot = await getDocs(colRef);
        return querySnapshot.docs.map(doc => doc.data());
    } catch (e) {
        Alert.alert('Error', e.message);
    }
}

export const getCollectionByUser = async ({userId}) => {
    try {
        const colRef = collection(db, 'books');
        const q = query(colRef, where('ownerUserId', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    } catch (e) {
        Alert.alert('Error', e.message);
    }
}

export const updateRecord = async ({collectionName, docId, data}) => {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, data);
    } catch (e) {
        Alert.alert('Error', e.message);
    }
}

export const deleteRecord = async ({collectionName, docId}) => {
    try {
        const colRef = collection(db, collectionName);
        await deleteDoc(doc(colRef, docId));
    } catch (e) {
        Alert.alert('Error', e.message);
    }
}

