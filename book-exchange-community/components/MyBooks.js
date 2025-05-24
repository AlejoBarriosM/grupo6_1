import React, {useCallback, useContext, useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Carousel from 'react-native-reanimated-carousel';
import {AppContext} from "../context/AppContext";
import {getOwnBooks} from "../services/ServiceBooks";


export default function MyBooks() {
    const [books, setBooks] = useState([]);
    const {user, setLoading} = useContext(AppContext);


    const fetchBooks = async () => {
        setLoading(true);
        const fetched = await getOwnBooks(user.uid);
        setBooks(fetched);
        setLoading(false);
    };

    useEffect(() => {
        if (!user?.uid) return;
        const fetchOnce = async () => {
            const fetched = await getOwnBooks(user.uid);
            setBooks(fetched);
        };
        fetchBooks();
    }, [user?.uid]);

    useFocusEffect(
        useCallback(() => {
            if (!user?.uid) return;
            const fetchOnFocus = async () => {
                const fetched = await getOwnBooks(user.uid);
                setBooks(fetched);
            };
            fetchBooks();
        }, [user.uid])
    );



    const {widthApp, heightApp} = useContext(AppContext);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'flex-start',
        },
        itemContainer: {
            width: widthApp,
            height: 580,
            borderRadius: 10,
            overflow: 'hidden',
            backgroundColor: '#d1d1d1',
            elevation: 3,
            shadowColor: '#000',
            shadowOffset: {width: 1, height: 2},
            shadowOpacity: 0.3,
            shadowRadius: 4,
        },
        coverImage: {
            width: '100%',
            height: '80%',
            resizeMode: 'cover',
        },
        textContainer: {
            padding: 10,
        },
        title: {
            fontSize: 26,
            fontWeight: '800',
            marginBottom: 5,
            color: '#F2A71B',
        },
        text: {
            fontSize: 24,
            fontWeight: '800',
            color: '#025E73',
        },
        author: {
            fontSize: 18,
            color: '#025E73',
        },
    });


    if (!books) {
        return (<Text style={styles.text}>No tienes libros</Text>);
    } else {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>{"Tus libros " + user.displayName}</Text>
                <Carousel
                    loop={false}
                    autoPlay={false}
                    width={widthApp}
                    height={600}
                    data={books}
                    mode="parallax"
                    style={{
                        alignItems: 'center',
                    }}
                    modeConfig={{
                        parallaxScrollingScale: 0.9,
                        parallaxAdjacentItemScale: 0.7,
                        parallaxScrollingOffset: 110,
                    }}
                    renderItem={({index, item}) => (
                        <View style={styles.itemContainer}>
                            <Image source={{uri: item.thumbnail}} style={styles.coverImage}/>
                            <View style={styles.textContainer}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.author}>{item.author}</Text>
                            </View>
                        </View>
                    )}
                />
            </View>
        );
    }

}


