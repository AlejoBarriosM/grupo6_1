import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import {auth, db} from "../lib/Firebase";

export async function getOrCreateRoom(otherUid) {
    const roomsRef = collection(db, 'rooms');
    // Buscar sala existente con ambos participantes
    const q = query(roomsRef, where('participants', 'in', [[auth.currentUser.uid, otherUid], [otherUid, auth.currentUser.uid]]));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        return snapshot.docs[0].id;
    }
    // Crear nueva sala
    const roomDoc = await addDoc(roomsRef, {
        participants: [auth.currentUser.uid, otherUid],
        lastMessage: '',
        lastTimestamp: null
    });
    return roomDoc.id;
}
