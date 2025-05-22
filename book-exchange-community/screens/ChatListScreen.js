import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    StyleSheet
} from 'react-native';
import {db, auth} from '../lib/Firebase';
import {
    collection,
    query,
    where,
    onSnapshot,
    orderBy,
    getDocs
} from 'firebase/firestore';
import {getOrCreateRoom} from '../services/ChatService';
import Screens from "../components/Screens";

export default function ChatListScreen({navigation}) {
    const [rooms, setRooms] = useState([]);
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState([]);

    // Cargar salas existentes
    useEffect(() => {
        const roomsRef = collection(db, 'rooms');
        const q = query(
            roomsRef,
            where('participants', 'array-contains', auth.currentUser.uid),
            orderBy('lastTimestamp', 'desc')
        );
        const unsubscribe = onSnapshot(q, snap => {
            setRooms(snap.docs.map(doc => ({id: doc.id, ...doc.data()})));
        });
        return () => unsubscribe();
    }, []);

    // Buscar usuarios en Firestore cuando cambia el texto
    useEffect(() => {
        async function fetchUsers() {
            const usersRef = collection(db, 'users');
            const q = query(
                usersRef,
                where('email', '>=', search),
                where('email', '<=', search + '')
            );
            const snap = await getDocs(q);
            setUsers(
                snap.docs
                    .map(doc => ({uid: doc.id, ...doc.data()}))
                    .filter(u => u.uid !== auth.currentUser.uid)
            );
        }

        if (search.trim().length > 0) {
            fetchUsers();
        } else {
            setUsers([]);
        }
    }, [search]);

    const handleUserPress = async (otherUser) => {
        const roomId = await getOrCreateRoom(otherUser.uid);
        navigation.navigate('Chat', {roomId});
        setSearch('');
        setUsers([]);
    };

    return (
        <Screens>
            <View style={styles.container}>
                {/* Buscador de usuarios */}
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar usuarios por email..."
                    value={search}
                    onChangeText={setSearch}
                />
                {search.trim().length > 0 ? (
                    <FlatList
                        data={users}
                        keyExtractor={item => item.uid}
                        renderItem={({item}) => (
                            <TouchableOpacity
                                style={styles.userItem}
                                onPress={() => handleUserPress(item)}
                            >
                                <Text>{item.email}</Text>
                            </TouchableOpacity>
                        )}
                    />
                ) : (
                    /* Lista de salas */
                    <FlatList
                        data={rooms}
                        keyExtractor={item => item.id}
                        renderItem={({item}) => (
                            <TouchableOpacity
                                style={styles.roomItem}
                                onPress={() => navigation.navigate('Chat', {roomId: item.id})}
                            >
                                <Text style={styles.participants}>
                                    {item.participants
                                        .filter(uid => uid !== auth.currentUser.uid)
                                        .join(', ')}
                                </Text>
                                <Text style={styles.lastMessage}>{item.lastMessage}</Text>
                            </TouchableOpacity>
                        )}
                    />
                )}
            </View>
        </Screens>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, padding: 10},
    searchInput: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 10,
        paddingHorizontal: 8
    },
    userItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#eee'
    },
    roomItem: {padding: 15, borderBottomWidth: 1, borderColor: '#ddd'},
    participants: {fontWeight: 'bold'},
    lastMessage: {color: '#666', marginTop: 4}
});