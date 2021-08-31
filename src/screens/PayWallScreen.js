import React, { Component, useState } from 'react'
import { StyleSheet, Text, View,SafeAreaView, Image, Platform, Alert, DevSettings } from 'react-native'
import { TouchableOpacity, FlatList, ScrollView, TextInput } from 'react-native-gesture-handler'
import { observer,Observer, useObserver } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import common from '../../Utilites/Common'
import SkipHeader from '../components/SkipHeader'
import Colors from '../constants/Colors'
import network, { payAppleOrAndroid, getMenu } from '../../Utilites/Network'
import PayWallItem from '../components/PayWallScreen/PayWallItem'
import { Btn } from '../components/Btn'
import * as RNIap from 'react-native-iap'
import Config from '../constants/Config'
import Spinner from 'react-native-loading-spinner-overlay'

const PayWallScreen = observer(({navigation,route}) => {

    const screen = network.onboarding['PayWallScreen']
    const [currentPlan, setCurrentPlan] = useState(0)
    const [loading, setLoading] = useState(false)
    const fromOnboarding = route?.params?.fromOnboarding

    const plansView = []
    for (let i = 0; i < screen?.plans.length; i++) {
        const plan = screen?.plans[i];
        plansView.push(
            <PayWallItem plan={plan} pressed={currentPlan == i} onPress={() => setCurrentPlan(i)} key={plan.id}/>
        )
    }  



    const checksView = []
    for (let i = 0; i < screen?.list.length; i++) {
        const item = screen?.list[i];
        checksView.push(
            <View style={{flexDirection:'row',alignItems:'center',marginBottom:common.getLengthByIPhone7(23)}} key={item?.text}>
                <Image style={{width:20,height:20,marginRight:9}} source={{uri:item?.icon}} />
                <Text style={{...styles.subtitle,maxWidth:'92%'}}>{item?.text}</Text>
            </View>
        )
    }

    const payHandler = () => {
        RNIap.requestPurchase(screen?.plans[currentPlan].id, false)
        .then((receipt) => {
            setLoading(true)
            payAppleOrAndroid(receipt).then(async () => {
                console.warn('receipt',receipt)
                try {
                    setLoading(false)
                    navigation.navigate(screen?.next_board)
                } catch (error) {
                    setLoading(false)
                    Alert.alert('Ошибка','Ошибка при обновлении данных, пожалуйста, попробуйте перезайти в приложение',[{text:'Перезайти',onPress:() => DevSettings.reload()}])
                }
            }).catch(() => {
                setLoading(false)
                setTimeout(() => {
                    Alert.alert(Config.appName, 'Произошла ошибка! Попробуйте перезайти в приложение.');
                }, 300);
            })
        })
        .catch(err => {
            setLoading(false)
            console.warn('err requestPurchase: ' + err);
        });
    }


    return (
        <>
        <SafeAreaView backgroundColor={"#FFF"} />
        <Spinner visible={loading} />
        <SkipHeader skip={() => fromOnboarding ? navigation.navigate(screen?.next_board) : navigation.goBack()} withBack={false} />
        <ScrollView style={{flex:1,backgroundColor:'#FFF'}} contentContainerStyle={{paddingHorizontal:16,paddingTop:7}} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{screen?.title}</Text>
                {plansView}
            <View style={{marginTop:16}}>
                {checksView}
            </View>
        </ScrollView>
        <View style={{alignItems:'center',padding:8,backgroundColor:'#FFF'}}>
            <Text style={styles.decr}>{screen?.description_bottom}</Text>
            <Btn underlayColor={Colors.underLayYellow} title={screen?.plans?.[currentPlan]?.button} backgroundColor={Colors.yellow} customStyle={{width:common.getLengthByIPhone7(0) - 16}} 
                onPress={() => payHandler()} />
        </View>
        <SafeAreaView backgroundColor={"#FFF"} />
        </>
    )
})

export default PayWallScreen

const styles = StyleSheet.create({
    title:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:22,
        lineHeight:26,
        fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        marginBottom:20,
    },
    subtitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:14,
        lineHeight:17,
        fontWeight:'500',
    },
    decr:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:12,
        lineHeight:14,
        fontWeight:'500',
        color:Colors.grayColor,textAlign:'center',marginBottom:24
    }
})
