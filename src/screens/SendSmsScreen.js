import React, { Component,useState } from 'react'
import { StyleSheet, Text, View,SafeAreaView, Image, Platform, KeyboardAvoidingView } from 'react-native'
import { TouchableOpacity, FlatList, ScrollView, TextInput } from 'react-native-gesture-handler'
import network, { getList } from '../../Utilites/Network'
import { observer,Observer, useObserver } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import {Btn} from '../components/Btn'
import common from '../../Utilites/Common'
import SkipHeader from '../components/SkipHeader'
import Colors from '../constants/Colors'


const SendSmsScreen = observer(({navigation,route}) => {

    const [code, setCode] = useState('')
    const fromProfile = route?.params?.fromProfile

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            style={{flex:1,backgroundColor:'#FFF'}}
            contentContainerStyle={{backgroundColor:'#FFF'}}
        >
        <SafeAreaView />
        <SkipHeader skip={() => navigation.navigate('MainStack')} title={'Вход'} />
        <ScrollView style={{backgroundColor:'#FFF'}}>
            <View style={{paddingHorizontal:16}}>
                <Text style={styles.title}>Введи код из смс</Text>
                <Text style={styles.subtitle}>Отправили на номер +7 909 555 28 24</Text>
                <TextInput 
                    style={styles.input}
                    selectionColor={Colors.textColor} textContentType={'oneTimeCode'}
                    value={code} keyboardType={'numeric'} placeholder={'0000'} maxLength={4}
                    onChangeText={(text) => {
                        setCode(text)
                        if(text.length === 4){
                            navigation.navigate(fromProfile ? 'ProfileScreen' : 'MainStack')
                        }
                    }}
                    autoFocus={true}
                />
            </View>
        </ScrollView>
        <View style={{paddingHorizontal:8,paddingTop:13,paddingBottom:51,justifyContent:'flex-end',backgroundColor:'#FFF'}}>
            <Text style={styles.descr}>Получить новый код можно через 0:30</Text>
        </View>
        <SafeAreaView backgroundColor={"#FFF"} />
        </KeyboardAvoidingView>
    )
})

export default SendSmsScreen

const styles = StyleSheet.create({
    title:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:22,
        lineHeight:26,
        fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        marginBottom:14,
    },
    subtitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:14,
        lineHeight:17,
        fontWeight:'500',
        marginBottom:20
    },
    input:{
        width:'100%',
        padding:16,
        backgroundColor:'#F5F5F5',
        borderRadius:16,
        fontSize:16,lineHeight:19,color:Colors.textColor,
    },
    descr:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:14,
        lineHeight:17,alignSelf:'center',color:'#D5D8DC',
        fontWeight:'500',
    },
})
