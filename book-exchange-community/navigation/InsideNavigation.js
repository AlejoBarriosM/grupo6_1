import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import VectorIcons from 'react-native-vector-icons/FontAwesome';

// import Home from '../screens/HomeScreen';
// import Messages from '../screens/MessagesScreen';
import ChatNavigation from "./ChatNavigation";
import Search from '../screens/SearchScreen';
import ProfileNavigation from '../navigation/ProfileNavigation';
import AddBookNavigation from "./AddBookNavigation";
import {AppContext} from "../context/AppContext";

const Tab = createBottomTabNavigator();

export default function InsideNavigation({navigation}) {
    const {user} = React.useContext(AppContext);
    // const initialRoute = user.displayName === null ? 'Profile' : 'AddBook';
    // const menu = user.displayName !== null;
    return (
        <Tab.Navigator
            key={user.displayName ? 'logged-in' : 'logged-out'}
            id="inside-tab"
            initialRouteName={user.displayName === null ? 'Profile' : 'AddBook'}
            screenOptions={{
                tabBarStyle: {
                    marginHorizontal: 10,
                    marginVertical: 15,
                    borderRadius: 30,
                    backgroundColor: '#025E73',
                },
                tabBarActiveTintColor: '#F2A71B',
                tabBarInactiveTintColor: '#BFB78F',
                headerShown: false,
                tabBarHideOnKeyboard: true,
                style: {borderRadius: 30, backgroundColor: '#025E73'},

            }}
        >
            {/*<Tab.Screen name="Seleccionar Ubicación" component={LocationScreen}*/}
            {/*            options={{*/}
            {/*                headerShown: false,*/}
            {/*                tabBarShowLabel: false,*/}
            {/*                tabBarStyle: {display: "none"}*/}
            {/*            }}*/}
            {/*/>*/}

            <Tab.Screen name="Search" component={Search}
                        options={{
                            title: 'Buscar',
                            tabBarIcon: ({color, size}) => (
                                <VectorIcons name="search" color={color} size={size}/>
                            ),
                        }}
            />
            <Tab.Screen name="AddBook" component={AddBookNavigation}
                        options={{
                            title: 'Agregar Libro',
                            tabBarIcon: ({color, size}) => (
                                <VectorIcons name="plus" color={color} size={size}/>
                            ),
                        }}
            />
            <Tab.Screen name="ChatNavigation" component={ChatNavigation}
                        options={{
                            title: 'Chat',
                            tabBarIcon: ({color, size}) => (
                                <VectorIcons name="wechat" color={color} size={size}/>
                            ),
                        }}
            />
            <Tab.Screen name="Profile" component={ProfileNavigation}
                        options={{
                            title: 'Perfil',
                            tabBarIcon: ({color, size}) => (
                                <VectorIcons name="user" color={color} size={size}/>
                            ),
                        }}
            />
        </Tab.Navigator>
    );
}




