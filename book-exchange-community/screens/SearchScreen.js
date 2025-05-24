import React, { useState, useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, Keyboard } from 'react-native';
import { TextInput, Button, Card, Chip } from 'react-native-paper';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import Screens from '../components/Screens';
import { AppContext } from '../context/AppContext';
import { searchFirestoreBooks } from '../services/ServiceBooks';
import { getOrCreateRoom } from '../services/ServiceChat';
import { auth } from '../lib/Firebase';

const FALLBACK_USER_LOCATION = {
    latitude: 6.2442,
    longitude: -75.5812,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

export default function SearchScreen({ navigation }) {
    const { user, locationPermission } = useContext(AppContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mapRegion, setMapRegion] = useState(FALLBACK_USER_LOCATION);
    const [initialMapRegionSet, setInitialMapRegionSet] = useState(false);
    const [isMapReady, setIsMapReady] = useState(false);
    const mapRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        (async () => {
            if (locationPermission) {
                try {
                    let location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    if (isMounted) {
                        const currentUserLocation = {
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        };
                        setMapRegion(currentUserLocation);
                        setInitialMapRegionSet(true);
                    }
                } catch (error) {
                    if (isMounted) {
                        setMapRegion(FALLBACK_USER_LOCATION);
                        setInitialMapRegionSet(true);
                    }
                }
            } else {
                if (isMounted) {
                    setMapRegion(FALLBACK_USER_LOCATION);
                    setInitialMapRegionSet(true);
                }
            }
        })();
        return () => {
            isMounted = false;
        };
    }, [locationPermission]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            Alert.alert("Búsqueda Vacía", "Por favor ingresa un término para buscar.");
            return;
        }
        Keyboard.dismiss();
        setLoading(true);
        setSearchResults([]);
        try {
            const books = await searchFirestoreBooks(searchQuery);
            setSearchResults(books);
            if (books.length === 0) {
                Alert.alert("Sin Resultados", "No se encontraron libros que coincidan con tu búsqueda.");
            } else {
                const firstBookWithLocation = books.find(book => book.location && book.location.latitude && book.location.longitude);
                if (firstBookWithLocation && mapRef.current) {
                    const newRegion = {
                        latitude: firstBookWithLocation.location.latitude,
                        longitude: firstBookWithLocation.location.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.02,
                    };
                    mapRef.current.animateToRegion(newRegion, 1000);
                }
            }
        } catch (error) {
            Alert.alert("Error", "Ocurrió un problema al buscar libros.");
        }
        setLoading(false);
    };

    const handleContactOwner = async (bookOwnerId, bookTitle) => {
        if (!auth.currentUser) {
            Alert.alert("Error", "Debes estar autenticado para contactar al dueño.");
            return;
        }
        if (auth.currentUser.uid === bookOwnerId) {
            Alert.alert("Información", "Este es uno de tus libros.");
            return;
        }

        setLoading(true);
        try {
            const roomId = await getOrCreateRoom(bookOwnerId);
            if (roomId) {
                navigation.navigate('ChatNavigation', {
                    screen: 'ChatScreen',
                    params: { roomId: roomId, otherUserId: bookOwnerId, chatTitle: `Chat sobre: ${bookTitle}` }
                });
            } else {
                Alert.alert("Error de Chat", "No se pudo iniciar o encontrar la sala de chat.");
            }
        } catch (error) {
            Alert.alert("Error", "No se pudo iniciar el chat.");
        }
        setLoading(false);
    };

    const renderBookItem = ({ item }) => (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <Image
                    source={{ uri: item.thumbnail || 'https://placehold.co/100x150/E0E0E0/BDBDBD?text=Libro' }}
                    style={styles.thumbnail}
                    onError={(e) => console.log("Error cargando imagen del libro:", e.nativeEvent.error)}
                />
                <View style={styles.bookInfo}>
                    <Text variant="titleLarge" style={styles.title} numberOfLines={2}>{item.title}</Text>
                    <Text variant="bodyMedium" style={styles.author} numberOfLines={1}>{item.author?.join(', ')}</Text>
                    {item.categories && (
                        <View style={styles.categoriesContainer}>
                            {item.categories.slice(0, 2).map((cat, index) => (
                                <Chip key={index} icon="tag" style={styles.chip} textStyle={styles.chipText}>{cat}</Chip>
                            ))}
                        </View>
                    )}
                    <Button
                        mode="contained"
                        onPress={() => handleContactOwner(item.ownerUserId, item.title)}
                        style={styles.chatButton}
                        icon="chat"
                        disabled={loading}
                        labelStyle={styles.chatButtonLabel}
                    >
                        Contactar Dueño
                    </Button>
                </View>
            </Card.Content>
        </Card>
    );

    if (!initialMapRegionSet && locationPermission !== null) {
        return (
            <Screens>
                <View style={styles.centeredLoader}>
                    <ActivityIndicator size="large" color="#025E73"/>
                    <Text>Cargando mapa y ubicación...</Text>
                </View>
            </Screens>
        );
    }

    return (
        <Screens>
            <View style={styles.container}>
                <View style={styles.searchContainer}>
                    <TextInput
                        label="Buscar libros por título..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        mode="outlined"
                        style={styles.searchInput}
                        onSubmitEditing={handleSearch}
                        left={<TextInput.Icon icon="magnify" />}
                    />
                    <Button
                        mode="contained"
                        onPress={handleSearch}
                        loading={loading && searchResults.length === 0}
                        disabled={loading}
                        style={styles.searchButton}
                        icon="book-search"
                    >
                        Buscar
                    </Button>
                </View>

                <View style={styles.mapContainer}>
                    {locationPermission ? (
                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            initialRegion={mapRegion}
                            showsUserLocation={true}
                            onMapReady={() => setIsMapReady(true)}
                        >
                            {isMapReady && searchResults.map(book => {
                                if (book.location && typeof book.location.latitude === 'number' && typeof book.location.longitude === 'number') {
                                    return (
                                        <Marker
                                            key={book.id}
                                            coordinate={{
                                                latitude: book.location.latitude,
                                                longitude: book.location.longitude,
                                            }}
                                            pinColor="#025E73"
                                        >
                                            <Callout onPress={() => handleContactOwner(book.ownerUserId, book.title)}>
                                                <View style={styles.calloutView}>
                                                    <Text style={styles.calloutTitle} numberOfLines={1}>{book.title}</Text>
                                                    <Text style={styles.calloutDescription}>Toca para chatear</Text>
                                                </View>
                                            </Callout>
                                        </Marker>
                                    );
                                }
                                return null;
                            })}
                        </MapView>
                    ) : (
                        <View style={styles.mapPlaceholder}>
                            <Text>Permiso de ubicación necesario para mostrar el mapa.</Text>
                            <Text>Por favor, habilítalo en la configuración de la app.</Text>
                        </View>
                    )}
                </View>

                {loading && searchResults.length === 0 && (
                    <ActivityIndicator animating={true} size="large" style={styles.loader} />
                )}

                <FlatList
                    data={searchResults}
                    renderItem={renderBookItem}
                    keyExtractor={(item) => item.id.toString()}
                    ListEmptyComponent={() => (
                        !loading && searchQuery && searchResults.length === 0 ? (
                            <Text style={styles.emptyText}>No se encontraron libros.</Text>
                        ) : !loading && !searchQuery ? (
                            <Text style={styles.emptyText}>Ingresa un término para buscar libros.</Text>
                        ) : null
                    )}
                    contentContainerStyle={styles.listContentContainer}
                    style={styles.listStyle}
                />
            </View>
        </Screens>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centeredLoader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 5,
    },
    searchInput: {
        flex: 1,
        marginRight: 10,
        backgroundColor: 'white',
    },
    searchButton: {
        justifyContent: 'center',
        backgroundColor: '#025E73',
        height: 56,
    },
    mapContainer: {
        height: 250,
        marginVertical: 10,
        backgroundColor: '#e0e0e0',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    mapPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    loader: {
        marginVertical: 20,
    },
    listStyle: {
        flex: 1,
        paddingHorizontal: 10,
    },
    listContentContainer: {
        paddingBottom: 20,
    },
    card: {
        marginBottom: 15,
        elevation: 2,
        backgroundColor: '#fff',
    },
    cardContent: {
        flexDirection: 'row',
        padding: 10,
    },
    thumbnail: {
        width: 70,
        height: 105,
        resizeMode: 'cover',
        borderRadius: 4,
        marginRight: 12,
    },
    bookInfo: {
        flex: 1,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#025E73',
        lineHeight: 20,
    },
    author: {
        fontSize: 12,
        color: '#555',
        marginBottom: 5,
    },
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    chip: {
        marginRight: 5,
        marginBottom: 5,
        height: 28,
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
    },
    chipText: {
        fontSize: 11,
    },
    chatButton: {
        backgroundColor: '#F2A71B',
        height: 36,
        justifyContent: 'center',
    },
    chatButtonLabel: {
        fontSize: 12,
        color: '#025E73',
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        fontSize: 16,
        color: 'gray',
    },
    calloutView: {
        padding: 8,
        width: 180,
    },
    calloutTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 3,
    },
    calloutDescription: {
        fontSize: 12,
    }
});
