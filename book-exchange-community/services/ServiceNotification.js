import {updateRecord} from "./ServiceFireStore";
import {AppContext} from "../context/AppContext";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';


export default async function GetToken() {
    const user = React.useContext(AppContext);
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;
    console.log('Token Expo:', token);
    return token;
    // await updateRecord({
    //     collectionName: 'users',
    //     docId: user.user.iiud, // Reemplaza con el ID del usuario actual
    //     data: {expoPushToken: token}
    // });
}