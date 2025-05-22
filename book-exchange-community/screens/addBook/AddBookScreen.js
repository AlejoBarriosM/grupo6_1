import React from 'react';
import {View} from 'react-native';
import CompButton from "../../components/CompButton";
import MyBooks from "../../components/MyBooks";
import Screens from "../../components/Screens";

export default function AddBookScreen({navigation}) {


    return (
        <Screens>
            <View style={{flex: 7}}>
                <MyBooks/>
            </View>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', alignContent: 'center'}}>
                <CompButton text=" + Agregar Libro" onPress={() => navigation.navigate('SearchBookScreen')}/>
            </View>
        </Screens>
    );
}
