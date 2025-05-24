import { collection, query, where, getDocs, addDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from "../lib/Firebase";
import { Alert } from 'react-native';


async function getUserDetails(userId) {
    if (!userId) return { displayName: 'Usuario Desconocido', photoURL: null };
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            return {
                displayName: userData.displayName || 'Usuario',
                photoURL: userData.photoURL || null,
            };
        }
        return { displayName: 'Usuario Desconocido', photoURL: null };
    } catch (error) {
        console.error("Error fetching user details:", error);
        return { displayName: 'Usuario Desconocido', photoURL: null };
    }
}

export async function getOrCreateRoom(otherUid) {
    const currentUserUid = auth.currentUser?.uid;
    if (!currentUserUid) {
        Alert.alert("Error", "Usuario no autenticado.");
        return null;
    }
    if (currentUserUid === otherUid) {
        Alert.alert("Info", "No puedes chatear contigo mismo.");
        return null;
    }

    const roomsRef = collection(db, 'rooms');

    const participantsArray = [currentUserUid, otherUid].sort();
    const roomId = participantsArray.join('_');

    const roomDocRef = doc(db, 'rooms', roomId);
    const roomSnap = await getDoc(roomDocRef);

    if (roomSnap.exists()) {
        console.log("Sala existente encontrada:", roomId);
        return roomId;
    } else {
        console.log("Creando nueva sala:", roomId);
        try {
            const currentUserDetails = await getUserDetails(currentUserUid);
            const otherUserDetails = await getUserDetails(otherUid);

            await setDoc(roomDocRef, {
                participants: participantsArray,
                participantDetails: {
                    [currentUserUid]: currentUserDetails,
                    [otherUid]: otherUserDetails,
                },
                lastMessage: '',
                lastTimestamp: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            console.log("Nueva sala creada con ID:", roomId);
            return roomId;
        } catch (error) {
            console.error("Error creando la sala:", error);
            Alert.alert("Error", "No se pudo crear la sala de chat.");
            return null;
        }
    }
}
