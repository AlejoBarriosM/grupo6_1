import React, { createContext, useState } from "react";
import {useWindowDimensions} from "react-native";
import usePermissions from "../hooks/Permissions";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false)
    const [widthApp, setWidthApp] = useState(useWindowDimensions().width);
    const [heightApp, setHeightApp] = useState(useWindowDimensions().height);
    const {cameraPermission, galleryPermission, locationPermission, notificationPermission} = usePermissions();

    const contextValue = {
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        loading,
        setLoading,
        widthApp,
        heightApp,
        cameraPermission,
        galleryPermission,
        locationPermission,
        notificationPermission,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
}