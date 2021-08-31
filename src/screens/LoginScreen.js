import React, { Component,useState } from 'react'
import { StyleSheet, Text, View,SafeAreaView, Image, Platform, KeyboardAvoidingView } from 'react-native'
import { TouchableOpacity, FlatList, ScrollView, TextInput } from 'react-native-gesture-handler'
import network, { getList, sendAnswer } from '../../Utilites/Network'
import { observer,Observer, useObserver } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import {Btn} from '../components/Btn'
import common from '../../Utilites/Common'
import SkipHeader from '../components/SkipHeader'
import Colors from '../constants/Colors'


const LoginScreen = observer(({navigation,route}) => {

    const [phone, setPhone] = useState('+')

    const changePhone = (phone) => {
        let newPhone = phone
        if (newPhone.charAt(0) != '+') {
            newPhone = '+' + newPhone;
        }
        setPhone(newPhone)
    }
    const screen = network.onboarding['LoginScreen']

    const sendPhone = () => {
        // console.warn(phone.replace(/[^\d.-]/g, ''))
        sendAnswer(screen?.request_to,undefined,undefined,undefined,undefined,undefined,phone.replace(/[^\d.-]/g, ''))
        runInAction(() => network.user.phone = phone.replace(/[^\d.-]/g, ''))
        // navigation.navigate('MainStack')
        navigation.navigate('SendSmsScreen',{fromProfile:!!fromProfile})
    }

    const fromProfile = route?.params?.fromProfile

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 30}
            style={{flex:1,backgroundColor:'#FFF'}}
            contentContainerStyle={{backgroundColor:'#FFF'}}
        >
        <SafeAreaView />
        <SkipHeader skip={() => navigation.navigate('MainStack')} withBack={!!fromProfile} title={'Вход'} withSkip={!!!fromProfile} goBack={() => navigation.goBack()} />
        <ScrollView style={{backgroundColor:'#FFF'}}>
            <View style={{paddingHorizontal:16}}>
                <Text style={styles.title}>Укажи свой номер телефона</Text>
                <Text style={styles.subtitle}>Что бы запомнили твои персональные настройки</Text>
                <TextInput 
                    style={styles.input}
                    selectionColor={Colors.textColor}
                    value={phone} keyboardType={'numeric'}
                    onChangeText={(text) => changePhone(text)}
                    autoFocus={true}
                />
            </View>
        </ScrollView>
        <View style={{paddingHorizontal:8,paddingTop:13,paddingBottom:8,justifyContent:'flex-end',backgroundColor:'#FFF'}}>
                <Btn 
                    title={'Продолжить'} 
                    // title={'Получить код'} 
                    onPress={() => sendPhone()}
                    // onPress={() => navigation.navigate('SendSmsScreen'),{fromProfile}}
                    backgroundColor={Colors.yellow} underlayColor={Colors.underLayYellow} disabled={phone.length < 2} />
        </View>
        <SafeAreaView backgroundColor={"#FFF"} />
        </KeyboardAvoidingView>
    )
})

export default LoginScreen

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
        lineHeight:17,alignSelf:'center',
        fontWeight:'500',marginTop:24
    },
})
