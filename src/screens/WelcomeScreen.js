import React, { Component,useState,useEffect } from 'react'
import { StyleSheet, Text, View,SafeAreaView, Animated, Platform, KeyboardAvoidingView, BackHandler } from 'react-native'
import { TouchableOpacity, FlatList, ScrollView, TextInput } from 'react-native-gesture-handler'
import network, { getList, sendAnswer } from '../../Utilites/Network'
import { observer,Observer, useObserver } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import {Btn} from '../components/Btn'
import common from '../../Utilites/Common'
import SkipHeader from '../components/SkipHeader'
import Colors from '../constants/Colors'
import Spinner from 'react-native-loading-spinner-overlay'
import Config from '../constants/Config'
import QuizAnimation from '../animations/QuizAnimation'
import { useFocusEffect } from '@react-navigation/native'
import changeNavigationBarColor from 'react-native-navigation-bar-color'


const WelcomeScreen = observer(({navigation}) => {

    const [name, setname] = useState('')
    const screen = network.onboarding['WelcomeScreen']
    const {startAnim,fadeAnim,marginAnim,contentMargin} = QuizAnimation()
    const [inputColor, setinputColor] = useState('#F5F5F5')

    const nextScreen = () => {
        runInAction(() => network.user.name = name)
        sendAnswer(screen?.request_to,undefined,undefined,name)
        navigation.navigate(screen?.next_board,{name})
    }

    useEffect(() => {
        startAnim()
    }, [])

    useFocusEffect(
        React.useCallback(() => {
          const onBackPress = () => {
            return true;
          };
          changeNavigationBarColor('#F5F5F5',true);
          BackHandler.addEventListener('hardwareBackPress', onBackPress);
    
          return () =>
            BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, []),
    );


    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 30}
            style={{flex:1,backgroundColor:'#FFF'}}
            contentContainerStyle={{backgroundColor:'#FFF'}}
        >
        <SafeAreaView />
        <SkipHeader skip={() => navigation.navigate(screen?.next_board)} withBack={false} withSkip={screen?.continue_step} />
        <ScrollView style={{backgroundColor:'#FFF',paddingTop:8}}>
            <View style={{paddingHorizontal:16}}>
                <Animated.View style={{opacity:fadeAnim,transform:[{translateY:marginAnim}]}}>
                <Text style={styles.title}>Добро пожаловать в WeCook</Text>
                <Text style={styles.subtitle}>Как мы можем к тебе обращаться?</Text>
                </Animated.View>
                <Animated.View style={{transform:[{translateY:contentMargin}]}}>
                <TextInput 
                    style={[styles.input,{backgroundColor:inputColor}]}
                    onFocus={() => setinputColor('#EEEEEE')}
                    onBlur={() => setinputColor('#F5F5F5')}
                    selectionColor={Colors.textColor}
                    value={name}
                    onChangeText={(text) => setname(text)}
                    autoFocus={true}
                />
                </Animated.View>
            </View>
        </ScrollView>
        <View style={{paddingHorizontal:8,paddingTop:13,paddingBottom:24,justifyContent:'flex-end',backgroundColor:'#FFF'}}>
                <Btn title={'Далее'} onPress={() => nextScreen()}
                    customTextStyle={{fontSize:16,lineHeight:16,fontWeight:'500'}}
                    backgroundColor={Colors.yellow} underlayColor={Colors.underLayYellow} disabled={!name.length} />
                {/* <View style={{flexDirection:'row',alignSelf:'center'}}>
                    <Text style={styles.descr}>Уже есть аккаунт? </Text>
                    <Text style={{...styles.descr,fontWeight:Platform.select({ ios: '800', android: 'bold' }),marginLeft:8}} 
                        onPress={() => navigation.navigate('LoginScreen')}
                    >
                        Войти
                    </Text>
                </View> */}
        </View>
        <SafeAreaView />
        </KeyboardAvoidingView>
    )
})

export default WelcomeScreen

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
        fontWeight:'500',marginTop:23
    },
})
