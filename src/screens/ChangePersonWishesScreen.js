import React, { Component, useRef, useEffect } from 'react'
import { StyleSheet, Text, View,SafeAreaView, Image, Platform,Animated, ImageBackground,Easing } from 'react-native'
import { TouchableOpacity, FlatList, ScrollView, TextInput, TouchableHighlight } from 'react-native-gesture-handler'
import { observer,Observer, useObserver } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import {Btn} from '../components/Btn'
import common from '../../Utilites/Common'
import SkipHeader from '../components/SkipHeader'
import Colors from '../constants/Colors'
import network, { sendAnswer, updateInfo } from '../../Utilites/Network'


const ChangeWishesScreen = observer(({navigation,route}) => {

    const what = route?.params?.what
    const personItems = [
        {
            title:'1 персона',
            id:1,
        },
        {
            title:'2 персоны',
            id:2,
        },
        {
            title:'3 персоны',
            id:3,
        },
        {
            title:'4 персоны',
            id:4,
        },
        {
            title:'5 персон',
            id:5,
        },
        {
            title:'6 персон',
            id:6,
        },
        {
            title:'7 персон',
            id:7,
        },
        {
            title:'8 персон',
            id:8,
        },
    ]

    const updateHandler = (value) => {
        runInAction(() => {
            network.user[what] = value
            what == 'persons' ? network.changeProfilePersons(value) : null
        })
        updateInfo(what,value)
        setTimeout(() => {
            navigation.goBack()            
        }, 600);
    }

    const wishesBody = []
    for (let i = 0; i < network.sectionNames.length; i++) {
        wishesBody.push(
            <TouchableHighlight key={network.sectionNames[i]} underlayColor={'#EEEEEE'} onPress={() => updateHandler(network.sectionNames[i])}>
                <View style={{flexDirection:'row',justifyContent:'space-between',padding:16,paddingVertical:15}}
                    onLayout={e => console.warn(e.nativeEvent.layout.height)}   >
                    <Text style={styles.title}>{network.sectionNames[i]}</Text>
                    {network.user?.preference == network.sectionNames[i] ? 
                    <Image source={require('../../assets/icons/bigComplete.png')} style={{width:14,height:14}} /> : null}
                </View>
            </TouchableHighlight>
        )
    }

    const personsBody = []
    for (let i = 0; i < personItems.length; i++) {
        personsBody.push(
            <TouchableHighlight key={personItems[i].id} underlayColor={'#EEEEEE'} onPress={() => updateHandler(personItems[i].id)}>
                <View style={{flexDirection:'row',justifyContent:'space-between',padding:16,paddingVertical:15}}>
                    <Text style={styles.title}>{personItems[i].title}</Text>
                    {network.user?.persons == personItems[i].id ? 
                    <Image source={require('../../assets/icons/bigComplete.png')} style={{width:14,height:14}} /> : null}
                </View>
            </TouchableHighlight>
        )
    }

    return (
        <>
        <SafeAreaView backgroundColor={'#FFF'} />
        <SkipHeader goBack={() => navigation.goBack()} withSkip={false} title={what == 'persons' ? 'Количество персон' : 'Предпочтения'} />
        <ScrollView style={{flex:1,backgroundColor:'#FFF'}} showsVerticalScrollIndicator={false}>
        {what == 'persons' ? personsBody : wishesBody}
        <SafeAreaView />
        </ScrollView>
        </>
    )
})

export default ChangeWishesScreen

const styles = StyleSheet.create({
    title:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Medium' }), fontSize:16,
        lineHeight:19,
        fontWeight:'500',
    },
})
