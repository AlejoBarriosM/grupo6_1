import React, { useEffect, useState, useCallback, useContext } from 'react';
import { View, StyleSheet, Platform, Alert, ActivityIndicator, Text, KeyboardAvoidingView } from 'react-native';
import { GiftedChat, Bubble, Send, InputToolbar, SystemMessage } from 'react-native-gifted-chat';
import { IconButton } from 'react-native-paper';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/Firebase';
import { AppContext } from '../context/AppContext';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ChatScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { user: currentUserAppContext } = useContext(AppContext);

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const { roomId, otherUserId, chatTitle: initialChatTitle } = route.params || {};

    useEffect(() => {
        if (initialChatTitle) {
            navigation.setOptions({ title: initialChatTitle });
        } else if (otherUserId) {
            const userDocRef = doc(db, 'users', otherUserId);
            getDoc(userDocRef).then(docSnap => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    navigation.setOptions({ title: userData.displayName || 'Chat' });
                } else {
                    navigation.setOptions({ title: 'Chat' });
                }
            }).catch(err => {
                console.error("Error obteniendo datos del otro usuario para el título:", err);
                navigation.setOptions({ title: 'Chat' });
            });
        } else {
            navigation.setOptions({ title: 'Chat' });
        }
    }, [navigation, initialChatTitle, otherUserId]);

    useEffect(() => {
        if (!roomId) {
            Alert.alert("Error de Sala", "ID de sala no proporcionado. Volviendo atrás.");
            console.error("ChatScreen: roomId es undefined o null.");
            setLoading(false);
            if (navigation.canGoBack()) navigation.goBack();
            return;
        }
        if (!auth.currentUser) {
            Alert.alert("Error de Autenticación", "Usuario no autenticado.");
            setLoading(false);
            if (navigation.canGoBack()) navigation.goBack();
            return;
        }

        setLoading(true);
        const messagesRef = collection(db, 'rooms', roomId, 'messages');
        const q = query(messagesRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = querySnapshot.docs.map(docSnapshot => {
                const firebaseData = docSnapshot.data();
                const message = {
                    _id: docSnapshot.id,
                    text: firebaseData.text,
                    createdAt: firebaseData.createdAt ? firebaseData.createdAt.toDate() : new Date(),
                    user: {
                        _id: firebaseData.userId,
                        name: firebaseData.userName || '',
                        avatar: firebaseData.userPhotoURL || undefined,
                    }
                };
                if (firebaseData.system) {
                    message.system = true;
                }
                return message;
            });
            setMessages(msgs);
            setLoading(false);
        }, (error) => {
            console.error("Error al escuchar mensajes (onSnapshot):", error);
            Alert.alert("Error de Chat", "No se pudieron cargar los mensajes. Intenta de nuevo.");
            setLoading(false);
        });

        return () => {
            console.log("ChatScreen: Desuscribiendo de mensajes para la sala:", roomId);
            unsubscribe();
        };
    }, [roomId, navigation]);

    const onSend = useCallback(async (messagesToSend = []) => {
        if (sending || !roomId || !auth.currentUser) return;

        setSending(true);
        const text = messagesToSend[0].text;
        const currentUser = auth.currentUser;
        const userContextDetails = currentUserAppContext || {};

        try {
            const messageData = {
                text,
                createdAt: serverTimestamp(),
                userId: currentUser.uid,
                userName: userContextDetails.displayName || currentUser.displayName || 'Usuario Anónimo',
                userPhotoURL: userContextDetails.photoURL || currentUser.photoURL || null,
            };
            await addDoc(collection(db, 'rooms', roomId, 'messages'), messageData);

            const roomDocRef = doc(db, 'rooms', roomId);
            await updateDoc(roomDocRef, {
                lastMessage: text,
                lastTimestamp: serverTimestamp(),
                updatedAt: new Date().toISOString(),
            });
        } catch (error) {
            console.error("Error enviando mensaje:", error);
            Alert.alert("Error", "No se pudo enviar el mensaje.");
        } finally {
            setSending(false);
        }
    }, [roomId, currentUserAppContext, sending, otherUserId]);

    if (loading && messages.length === 0) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#025E73" />
                <Text>Cargando mensajes...</Text>
            </View>
        );
    }

    if (!roomId && !loading) {
        return (
            <View style={styles.centered}>
                <Text>Error: ID de sala no disponible.</Text>
                <Button onPress={() => navigation.goBack()}>Volver</Button>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <GiftedChat
                messages={messages}
                onSend={messagesToSend => onSend(messagesToSend)}
                user={{ _id: auth.currentUser?.uid }}
                placeholder="Escribe un mensaje..."
                alwaysShowSend
                scrollToBottom
                isLoadingEarlier={loading}
                renderBubble={props => (
                    <Bubble
                        {...props}
                        wrapperStyle={{
                            right: { backgroundColor: '#025E73' },
                            left: { backgroundColor: '#F2A71B' },
                        }}
                        textStyle={{
                            right: { color: '#FFFFFF' },
                            left: { color: '#000000' },
                        }}
                    />
                )}
                renderSend={props => (
                    <Send {...props} disabled={sending} containerStyle={styles.sendContainer}>
                        <IconButton icon="send" size={28} color="#025E73" />
                    </Send>
                )}
                renderInputToolbar={props => (
                    <InputToolbar
                        {...props}
                        containerStyle={styles.inputToolbar}
                        primaryStyle={{ alignItems: 'center' }}
                    />
                )}
                renderLoading={() => <ActivityIndicator size="small" color="#025E73" style={styles.chatLoading}/>}
                renderSystemMessage={props => (
                    <SystemMessage
                        {...props}
                        containerStyle={{ marginBottom: 15 }}
                        textStyle={{ fontSize: 14, color: 'grey' }}
                    />
                )}
            />
            {Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ECE5DD',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 44,
        width: 44,
    },
    inputToolbar: {
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#b2b2b2',
        backgroundColor: 'white',
        paddingVertical: Platform.OS === 'ios' ? 6 : 0,
    },
    chatLoading: {
        marginVertical: 20,
    }
});
