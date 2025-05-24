import { createRecord, getCollectionByUser, updateRecord } from "./ServiceFireStore";
import { Alert } from "react-native";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../lib/Firebase';

export async function addBook(book) {
    try {
        return await createRecord({ collectionName: 'books', data: book });
    } catch (error) {
        console.error("Error en addBook:", error.message);
        return false;
    }
}

export async function getOwnBooks(userId) {
    try {
        return await getCollectionByUser({ userId: userId });
    } catch (error) {
        console.error('Error en getOwnBooks:', error.message);
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
        await updateRecord({ collectionName: 'books', docId: bookId, data: newData });
        return true;
    } catch (error) {
        console.error('Error en updateBook:', error.message);
        return false;
    }
}

export async function searchFirestoreBooks(searchText) {
    console.log(`[searchFirestoreBooks] Iniciando búsqueda con texto: "${searchText}"`);

    if (!searchText || searchText.trim() === "") {
        console.log("[searchFirestoreBooks] Texto de búsqueda vacío, retornando [].");
        return [];
    }

    const currentUserId = auth.currentUser ? auth.currentUser.uid : null;
    if (!currentUserId) {
        Alert.alert("Error de Autenticación", "Debes estar autenticado para buscar libros.");
        console.log("[searchFirestoreBooks] Usuario no autenticado, retornando [].");
        return [];
    }
    console.log(`[searchFirestoreBooks] Usuario actual ID: ${currentUserId}`);

    try {
        const booksRef = collection(db, 'books');

        const searchTextCapitalized = searchText.charAt(0).toUpperCase() + searchText.slice(1);

        const queries = [];
        queries.push(
            query(
                booksRef,
                where('title', '>=', searchText),
                where('title', '<=', searchText + '\uf8ff')
            )
        );
        if (searchText.toLowerCase() !== searchTextCapitalized.toLowerCase()) {
            queries.push(
                query(
                    booksRef,
                    where('title', '>=', searchTextCapitalized),
                    where('title', '<=', searchTextCapitalized + '\uf8ff')
                )
            );
        }

        console.log(`[searchFirestoreBooks] Ejecutando ${queries.length} consulta(s) para título...`);

        const querySnapshots = await Promise.all(queries.map(q => getDocs(q)));

        const foundBooksMap = new Map();

        querySnapshots.forEach(snapshot => {
            snapshot.forEach((doc) => {
                if (!foundBooksMap.has(doc.id)) {
                    foundBooksMap.set(doc.id, { id: doc.id, ...doc.data() });
                }
            });
        });

        const allPotentialBooks = Array.from(foundBooksMap.values());
        console.log(`[searchFirestoreBooks] Libros potenciales encontrados por título (antes de filtrar por dueño): ${allPotentialBooks.length}`);
        if (allPotentialBooks.length > 0 && allPotentialBooks[0]) { // Verificación adicional para allPotentialBooks[0]
            console.log("[searchFirestoreBooks] Primer libro potencial:", allPotentialBooks[0].title, "Disponible:", allPotentialBooks[0].available, "Estado:", allPotentialBooks[0].status, "Dueño:", allPotentialBooks[0].ownerUserId);
        }

        const books = [];
        allPotentialBooks.forEach((bookData) => {
            const isOwnBook = bookData.ownerUserId === currentUserId;


            if (!isOwnBook) {
                books.push(bookData);
            } else {
                console.log(`[searchFirestoreBooks] Libro DESCARTADO (propio del usuario): ${bookData.title?.substring(0,30)}...`);
            }
        });

        console.log(`[searchFirestoreBooks] Libros finales después de filtrar por dueño: ${books.length}`);
        if (books.length === 0 && allPotentialBooks.length > 0) {
            console.log("[searchFirestoreBooks] Se encontraron libros por título, pero todos eran del usuario actual o fueron descartados por otros motivos (si los hubiera).");
        } else if (books.length === 0 && allPotentialBooks.length === 0) {
            console.log("[searchFirestoreBooks] No se encontraron libros que coincidan con el prefijo del título (ni con variaciones de capitalización).");
        }

        return books;
    } catch (error) {
        console.error("[searchFirestoreBooks] Error durante la búsqueda en Firestore: ", error);
        Alert.alert('Error de Búsqueda', 'No se pudieron buscar los libros en la base de datos.');
        return [];
    }
}