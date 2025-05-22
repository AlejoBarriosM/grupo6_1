import {createRecord, getCollection, getCollectionByUser, updateRecord} from "./ServiceFireStore";
import {Alert} from "react-native";


export async function addBook(book) {
    try {
        return await createRecord({collectionName: 'books', data: book});
    } catch (error) {
        console.error("Error", error.message);
        return false;
    }
}

export async function getOwnBooks(userId) {
    try {
        return await getCollectionByUser({userId: userId});
    } catch (error) {
        console.error('Error', error.message);
        return [];
    }
}

export async function searchBooks(query) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=${query}`
        );
        const data = await response.json();
        return data.items || [];
    } catch (error) {
        Alert.alert('Error', 'Error cargando libros');
        return [];
    }
}


export async function searchBookById(id) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/books/v1/volumes/${id}`
        );
        return await response.json();
    } catch (error) {
        Alert.alert('Error', 'Error cargando libro');
        return null;
    }
}

export async function updateBook(bookId, newData) {
    try {
        await updateRecord({collectionName: 'books', docId: bookId, data: newData});
        return true;
    } catch
        (error) {
        console.error('Error', error.message);
        return false;
    }
}
