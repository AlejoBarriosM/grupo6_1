import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { auth, db } from '../lib/Firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

export default function ChatScreen() {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, snapshot => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, []);

    const handleSend = async () => {
        if (text.trim().length === 0) return;
        await addDoc(collection(db, 'messages'), {
            text,
            createdAt: serverTimestamp(),
            user: {
                uid: auth.currentUser.uid,
                email: auth.currentUser.email
            }
        });
        setText('');
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <FlatList
                inverted
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.messageContainer}>
                        <Text style={styles.user}>{item.user.email}:</Text>
                        <Text style={styles.text}>{item.text}</Text>
                    </View>
                )}
            />
            <View style={styles.inputContainer}>
                <TextInput
                    value={text}
                    onChangeText={setText}
                    style={styles.input}
                    placeholder="Escribe un mensaje..."
                />
                <Button title="Enviar" onPress={handleSend} />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    messageContainer: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc'
    },
    user: {
        fontWeight: 'bold'
    },
    text: {
        fontSize: 16
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#ccc'
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingHorizontal: 10,
        marginRight: 10,
        borderRadius: 4
    }
});