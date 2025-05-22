import React, {useContext} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useLogout} from "../services/ServiceAuth";
import CompButton from "../components/CompButton";
import {AppContext} from "../context/AppContext";

import {Title, Paragraph, Button, Avatar, Divider} from 'react-native-paper';

export default function ProfileScreen() {
    const logout = useLogout();
    const user = useContext(AppContext);
    const { displayName, email, photoURL } = user;
    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <View style={styles.header}>
                {photoURL
                    ? <Avatar.Image size={100} source={{uri: photoURL}}/>
                    : <Avatar.Icon size={100} icon="account"/>}
                <Title style={styles.name}>{displayName || 'Nombre de Usuario'}</Title>
                <Paragraph style={styles.email}>{email}</Paragraph>
            </View>

            <Divider style={styles.divider}/>

            <View style={styles.actions}>
                <Button
                    icon="pencil"
                    mode="outlined"
                    onPress={() => navigation.navigate('EditProfileScreen')}
                    style={styles.button}
                >
                    Editar Perfil
                </Button>
                <Button
                    icon="logout"
                    mode="outlined"
                    onPress={() => {
                        logout/* función de logout */
                    }}
                    style={styles.button}
                    color="#d32f2f"
                >
                    Cerrar Sesión
                </Button>
            </View>
            <Text>Profile Screen</Text>
            <Text>Usuario: {user.user.uid}</Text>
            <CompButton text={'logout'} onPress={logout}/>
        </View>
    );
}


// screens/ProfileScreen.js
// import React, { useContext } from 'react';
// import { View, StyleSheet, Image } from 'react-native';
// import { Title, Paragraph, Button, Avatar, Divider } from 'react-native-paper';
// import { AppContext } from '../context/AppContext';
//
// export default function ProfileScreen({ navigation }) {
//     const { user } = useContext(AppContext);
//     const logout = useLogout();
//
//     // Si no hay usuario, puedes redirigir al login
//     if (!user) {
//         navigation.replace('LoginScreen');
//         return null;
//     }
//
//     const { displayName, email, photoURL } = user;
//
//     return (
//         <View style={styles.container}>
//             <View style={styles.header}>
//                 {photoURL
//                     ? <Avatar.Image size={100} source={{ uri: photoURL }} />
//                     : <Avatar.Icon size={100} icon="account" />}
//                 <Title style={styles.name}>{displayName || 'Nombre de Usuario'}</Title>
//                 <Paragraph style={styles.email}>{email}</Paragraph>
//             </View>
//
//             <Divider style={styles.divider} />
//
//             <View style={styles.actions}>
//                 <Button
//                     icon="pencil"
//                     mode="outlined"
//                     onPress={() => navigation.navigate('EditProfileScreen')}
//                     style={styles.button}
//                 >
//                     Editar Perfil
//                 </Button>
//                 <Button
//                     icon="logout"
//                     mode="outlined"
//                     onPress={() => {logout/* función de logout */}}
//                     style={styles.button}
//                     color="#d32f2f"
//                 >
//                     Cerrar Sesión
//                 </Button>
//             </View>
//         </View>
//     );
// }

const styles = StyleSheet.create({
    container: {flex: 1, padding: 20, backgroundColor: '#fff'},
    header: {alignItems: 'center', marginBottom: 30},
    name: {marginTop: 10, fontSize: 24},
    email: {color: 'gray'},
    divider: {marginVertical: 20},
    actions: {flexDirection: 'row', justifyContent: 'space-around'},
    button: {flex: 1, marginHorizontal: 5},
});
