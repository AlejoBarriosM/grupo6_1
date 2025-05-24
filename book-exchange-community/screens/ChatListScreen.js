import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, Avatar } from 'react-native-paper';
import { db, auth } from '../lib/Firebase';
import { collection, query, where, onSnapshot, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { getOrCreateRoom } from '../services/ServiceChat';
import Screens from "../components/Screens";
import { AppContext } from '../context/AppContext';
import { useFocusEffect } from '@react-navigation/native';

export default function ChatListScreen({ navigation }) {
    const { user } = useContext(AppContext);
    const [rooms, setRooms] = useState([]);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [searchUserQuery, setSearchUserQuery] = useState('');
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [searchingUsers, setSearchingUsers] = useState(false);

    const fetchChatRooms = () => {
        if (!auth.currentUser) return;
        setLoadingRooms(true);
        const roomsRef = collection(db, 'rooms');
        const q = query(
            roomsRef,
            where('participants', 'array-contains', auth.currentUser.uid),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, snap => {
            const fetchedRooms = snap.docs.map(doc => {
                const roomData = doc.data();
                const otherParticipantUid = roomData.participants.find(p => p !== auth.currentUser.uid);
                const otherUserDetails = roomData.participantDetails?.[otherParticipantUid] || { displayName: 'Usuario', photoURL: null };

                return {
                    id: doc.id,
                    ...roomData,
                    otherUserName: otherUserDetails.displayName,
                    otherUserPhoto: otherUserDetails.photoURL,
                    otherUserId: otherParticipantUid,
                };
            });
            setRooms(fetchedRooms);
            setLoadingRooms(false);
        }, error => {
            console.error("Error escuchando salas de chat:", error);
            Alert.alert("Error", "No se pudieron cargar las salas de chat.");
            setLoadingRooms(false);
        });
        return unsubscribe;
    };

    useFocusEffect(
        React.useCallback(() => {
            const unsubscribe = fetchChatRooms();
            return () => unsubscribe && unsubscribe();
        }, [])
    );

    const handleSearchUsers = async () => {
        if (!searchUserQuery.trim()) {
            setSearchedUsers([]);
            return;
        }
        setSearchingUsers(true);
        try {
            const usersRef = collection(db, 'users');
            const q = query(
                usersRef,
                where('email', '>=', searchUserQuery),
                where('email', '<=', searchUserQuery + '\uf8ff'),
                orderBy('email')
            );
            const snap = await getDocs(q);
            const usersList = snap.docs
                .map(doc => ({ uid: doc.id, ...doc.data() }))
                .filter(u => u.uid !== auth.currentUser?.uid);
            setSearchedUsers(usersList);
        } catch (error) {
            console.error("Error buscando usuarios:", error);
            Alert.alert("Error", "No se pudieron buscar usuarios.");
        }
        setSearchingUsers(false);
    };

    const handleUserOrRoomPress = async (item, isRoom = true) => {
        let roomIdToNavigate;
        let otherUserIdToNavigate;
        let chatTitleToNavigate;

        if (isRoom) {
            roomIdToNavigate = item.id;
            otherUserIdToNavigate = item.otherUserId;
            chatTitleToNavigate = item.otherUserName || 'Chat';
        } else {
            setSearchingUsers(true);
            const newRoomId = await getOrCreateRoom(item.uid);
            setSearchingUsers(false);
            if (newRoomId) {
                roomIdToNavigate = newRoomId;
                otherUserIdToNavigate = item.uid;
                chatTitleToNavigate = item.displayName || item.email || 'Chat';
            } else {
                return;
            }
        }

        setSearchUserQuery('');
        setSearchedUsers([]);

        navigation.navigate('ChatScreen', {
            roomId: roomIdToNavigate,
            otherUserId: otherUserIdToNavigate,
            chatTitle: chatTitleToNavigate
        });
    };

    const renderRoomItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleUserOrRoomPress(item, true)}>
            <Card style={styles.roomCard}>
                <Card.Title
                    title={item.otherUserName || "Usuario"}
                    subtitle={item.lastMessage || "Inicia una conversación"}
                    subtitleNumberOfLines={1}
                    left={(props) => <Avatar.Image {...props} size={40} source={item.otherUserPhoto ? { uri: item.otherUserPhoto } : require('../assets/icon.png')} />}
                    right={(props) => <Text style={styles.timestamp}>{item.lastTimestamp ? new Date(item.lastTimestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</Text>}
                />
            </Card>
        </TouchableOpacity>
    );

    const renderUserSearchItem = ({ item }) => (
        <TouchableOpacity onPress={() => handleUserOrRoomPress(item, false)}>
            <Card style={styles.userSearchCard}>
                <Card.Title
                    title={item.displayName || item.email}
                    subtitle={item.email}
                    left={(props) => <Avatar.Image {...props} size={40} source={item.photoURL ? { uri: item.photoURL } : require('../assets/icon.png')} />}
                />
            </Card>
        </TouchableOpacity>
    );


    return (
        <Screens>
            <View style={styles.container}>
                <View style={styles.searchUserContainer}>
                    <TextInput
                        label="Buscar usuario por email para chatear"
                        value={searchUserQuery}
                        onChangeText={setSearchUserQuery}
                        mode="outlined"
                        style={styles.searchInput}
                        onSubmitEditing={handleSearchUsers}
                        left={<TextInput.Icon icon="account-search" />}
                    />
                    <Button
                        mode="contained"
                        onPress={handleSearchUsers}
                        loading={searchingUsers}
                        disabled={searchingUsers}
                        style={styles.searchButton}
                        icon="magnify"
                    >
                        Buscar
                    </Button>
                </View>

                {searchingUsers && searchedUsers.length === 0 && <ActivityIndicator style={{marginTop: 10}}/>}

                {searchedUsers.length > 0 ? (
                    <FlatList
                        data={searchedUsers}
                        renderItem={renderUserSearchItem}
                        keyExtractor={item => item.uid}
                        ListEmptyComponent={<Text style={styles.emptyText}>No se encontraron usuarios.</Text>}
                    />
                ) : loadingRooms ? (
                    <ActivityIndicator size="large" color="#025E73" style={{ flex: 1 }} />
                ) : rooms.length === 0 ? (
                    <View style={styles.centeredMessage}>
                        <Text style={styles.emptyText}>No tienes chats activos.</Text>
                        <Text style={styles.emptySubText}>Busca un libro o un usuario para comenzar.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={rooms}
                        renderItem={renderRoomItem}
                        keyExtractor={item => item.id}
                    />
                )}
            </View>
        </Screens>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f7f7f7' },
    searchUserContainer: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    searchInput: {
        flex: 1,
        marginRight: 8,
    },
    searchButton: {
        backgroundColor: '#025E73',
        height: 56,
        justifyContent: 'center'
    },
    roomCard: {
        marginHorizontal: 10,
        marginVertical: 5,
        elevation: 1,
    },
    userSearchCard: {
        marginHorizontal: 10,
        marginVertical: 5,
        backgroundColor: '#e8f4f8'
    },
    timestamp: {
        fontSize: 12,
        color: 'gray',
        marginRight: 10,
        alignSelf: 'center'
    },
    centeredMessage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: 'gray',
        marginTop: 20,
    },
    emptySubText: {
        textAlign: 'center',
        fontSize: 14,
        color: 'darkgray',
        marginTop: 5,
    }
});
