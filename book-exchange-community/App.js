import React from 'react';
import {NavigationContainer} from "@react-navigation/native";

import {AppProvider} from "./context/AppContext";
import AppNavigation from './navigation/AppNavigation';
import {SafeAreaProvider} from "react-native-safe-area-context";

export default function App() {
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


