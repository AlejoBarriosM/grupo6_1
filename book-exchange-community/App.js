import React from 'react';
import {NavigationContainer} from "@react-navigation/native";

import {AppProvider} from "./context/AppContext";
import AppNavigation from './navigation/AppNavigation';
import {SafeAreaProvider} from "react-native-safe-area-context";
import  registerNNPushToken from 'native-notify';

export default function App() {
    registerNNPushToken(30211, 'rIzkqdNXWj98lDjg3m9feF');
    return (
        <AppProvider>
            <SafeAreaProvider>
                <NavigationContainer>
                    <AppNavigation/>
                </NavigationContainer>
            </SafeAreaProvider>
        </AppProvider>
    );
}


