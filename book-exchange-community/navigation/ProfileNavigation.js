import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import ProfileScreen from '../screens/profile/ProfileScreen';
import LocationScreen from '../screens/profile/LocationScreen';

const Tab = createBottomTabNavigator();

export default function ProfileNavigation() {
    return (
        <Tab.Navigator
            id="app-tab"
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {display: "none"}
            }}
        >
            <Tab.Screen name="ProfileScreen" component={ProfileScreen}/>
            <Tab.Screen name="LocationScreen" component={LocationScreen}/>
        </Tab.Navigator>
    );
}
