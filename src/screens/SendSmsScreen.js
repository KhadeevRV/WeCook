import React, { Component,useState } from 'react'
import { StyleSheet, Text, View,SafeAreaView, Image, Platform, KeyboardAvoidingView, Alert, AsyncStorage } from 'react-native'
import { TouchableOpacity, FlatList, ScrollView, TextInput } from 'react-native-gesture-handler'
import network, { getFavors, getList, getMenu, getUserInfo, sendCode, updateInfo } from '../../Utilites/Network'
import { observer,Observer, useObserver } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import {Btn} from '../components/Btn'
import common from '../../Utilites/Common'
import SkipHeader from '../components/SkipHeader'
import Colors from '../constants/Colors'
import Spinner from 'react-native-loading-spinner-overlay'


const SendSmsScreen = observer(({navigation,route}) => {

    const [code, setCode] = useState('')
    const {from,phone,exit} = route?.params
    const [loading, setloading] = useState(false)
    const [inputColor, setinputColor] = useState('#F5F5F5')

    const codeHandler = async (finalCode) => {
        setloading(true)
        try {
            await sendCode(phone,finalCode)
            const token = await updateInfo('phone',phone)
            if(token){
                runInAction(async () => {
                    AsyncStorage.setItem('token',token)
                    network.access_token = token
                    await getUserInfo(token)
                    await getMenu()
                    await getFavors()
                    setloading(false)
                    navigation.navigate(from ? from : exit ? 'ReceptDayScreen' : 'MainStack')
                })
            } else {
                runInAction(async () => {
                    network.user.phone = phone.replace(/[^\d.-]/g, '')
                    await getUserInfo()
                    setloading(false)
                    navigation.navigate(from ? from : exit ? 'ReceptDayScreen' : 'MainStack')
                })
            }
        } catch (err) {
            setloading(false)
            Alert.alert('Ошибка',err)
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            style={{flex:1,backgroundColor:'#FFF'}}
            contentContainerStyle={{backgroundColor:'#FFF'}}
        >
        <Spinner visible={loading} />
        <SafeAreaView />
        <SkipHeader skip={() => navigation.navigate('MainStack')} title={'Вход'} 
            goBack={() => navigation.goBack()}
            withSkip={!!from}
        />
        <ScrollView style={{backgroundColor:'#FFF'}} contentContainerStyle={{paddingTop:8}}>
            <View style={{paddingHorizontal:16}}>
                <Text style={styles.title}>Введи код из смс</Text>
                <Text style={styles.subtitle}>Отправили на номер +{phone}</Text>
                <TextInput 
                    style={[styles.input,{backgroundColor:inputColor}]}
                    onFocus={() => setinputColor('#EEEEEE')}
                    onBlur={() => setinputColor('#F5F5F5')}
                    selectionColor={Colors.textColor} textContentType={'oneTimeCode'}
                    value={code} keyboardType={'numeric'} placeholder={'000000'} maxLength={6}
                    placeholderTextColor={'#9A9A9A'}
                    onChangeText={(text) => {
                        setCode(text)
                        if(text.length === 6){
                            codeHandler(text)
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
        borderRadius:16,fontWeight:'500',
        fontSize:16,lineHeight:19,color:Colors.textColor,
    },
    descr:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:14,
        lineHeight:17,alignSelf:'center',color:'#D5D8DC',
        fontWeight:'500',
    },
})
