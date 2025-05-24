import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';

const Tab = createBottomTabNavigator();

export default function ChatNavigation() {
    return (
        <Tab.Navigator
            id="app-tab"
            initialRouteName="ChatListScreen"
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {display: "none"}
            }}
        >
            <Tab.Screen name="ChatListScreen" component={ChatListScreen}/>
            <Tab.Screen name="ChatScreen" component={ChatScreen} options={{ tabBarButton: () => null, title: 'Chat' }} />
        </Tab.Navigator>
    );
}
