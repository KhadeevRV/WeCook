import React, { Component,useState } from 'react'
import { StyleSheet, Text, View,SafeAreaView, Image, Platform, KeyboardAvoidingView } from 'react-native'
import { TouchableOpacity, FlatList, ScrollView, TextInput } from 'react-native-gesture-handler'
import network, { getList, sendAnswer, updateInfo } from '../../Utilites/Network'
import { observer,Observer, useObserver } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import {Btn} from '../components/Btn'
import common from '../../Utilites/Common'
import SkipHeader from '../components/SkipHeader'
import Colors from '../constants/Colors'


const ChangeNameEmailScreen = observer(({navigation,route}) => {

    const what = route?.params?.what

    const [inputValue, setInputValue] = useState('')

    const save = () => {
        runInAction(() => network.user[what] = inputValue)
        // console.warn(what,inputValue)
        updateInfo(what,inputValue)
        navigation.goBack()
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 30}
            style={{flex:1,backgroundColor:'#FFF'}}
            contentContainerStyle={{backgroundColor:'#FFF'}}
        >
        <SafeAreaView />
        <SkipHeader title={what == 'name' ? 'Имя' : 'Email'} withSkip={false} goBack={() => navigation.goBack()} />
        <ScrollView style={{backgroundColor:'#FFF'}}>
            <View style={{paddingHorizontal:16}}>
                <TextInput 
                    style={styles.input}
                    selectionColor={Colors.textColor}
                    value={inputValue} keyboardType={what == 'email' ? 'email-address' : 'default'}
                    onChangeText={(text) => what == 'email' ? setInputValue(text.replace(/\s/g, '')) : setInputValue(text)}
                    autoFocus={true}
                />
            </View>
        </ScrollView>
        <View style={{paddingHorizontal:8,paddingTop:13,paddingBottom:8,justifyContent:'flex-end',backgroundColor:'#FFF'}}>
                <Btn 
                    title={'Продолжить'} 
                    // title={'Получить код'} 
                    onPress={() => save()}
                    // onPress={() => navigation.navigate('SendSmsScreen'),{fromProfile}}
                    backgroundColor={Colors.yellow} underlayColor={Colors.underLayYellow} 
                    disabled={what == 'email' ? !common.validMail(inputValue) : inputValue.length < 2} 
                />
        </View>
        <SafeAreaView backgroundColor={"#FFF"} />
        </KeyboardAvoidingView>
    )
})

export default ChangeNameEmailScreen

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
