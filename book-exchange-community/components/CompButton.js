import React from "react";
import {TouchableOpacity, Text, StyleSheet} from "react-native";

export default function CompButton({ text, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.button}>
            <Text style={styles.text} >{text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 10,
        margin: 10,
        backgroundColor: '#025E73',
        borderRadius: 50,
        shadowColor: '#000',
        shadowOffset: { width: 10, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 8,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#F2A71B',
        fontWeight: '800',
        fontSize: 20,
    }
});