import React, { Component, useState } from 'react'
import { StyleSheet, Text, View,SafeAreaView, Image, Platform, Alert, DevSettings } from 'react-native'
import { TouchableOpacity, FlatList, ScrollView, TextInput } from 'react-native-gesture-handler'
import { observer,Observer, useObserver } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import common from '../../Utilites/Common'
import SkipHeader from '../components/SkipHeader'
import Colors from '../constants/Colors'
import network, { payAppleOrAndroid, getMenu, authUser, getFavors, getUserInfo } from '../../Utilites/Network'
import PayWallItem from '../components/PayWallScreen/PayWallItem'
import { Btn } from '../components/Btn'
import * as RNIap from 'react-native-iap'
import Config from '../constants/Config'
import Spinner from 'react-native-loading-spinner-overlay'
import { AppEventsLogger } from 'react-native-fbsdk-next'
import { PrivacyModal } from '../components/ProfileScreen/PrivacyModal'
import { FooterItem } from './ProfileScreen'

const PayWallScreen = observer(({navigation,route}) => {

    const [currentPlan, setCurrentPlan] = useState(0)
    const [loading, setLoading] = useState(false)
    const fromOnboarding = route?.params?.fromOnboarding
    const data = route.params?.data
    const [textMode, setTextMode] = useState('privacy')
    const [privacyModal, setprivacyModal] = useState(false)
    
    const screen = data ?? network.onboarding['PayWallScreen']
    // console.warn(screen?.plans)
    const plansView = []
    for (let i = 0; i < screen?.plans.length; i++) {
        const plan = screen?.plans[i];
        plansView.push(
            <PayWallItem plan={plan} pressed={currentPlan == i} onPress={() => {
                setCurrentPlan(i)
                payHandler(plan)
            }} key={plan.id}/>
        )
    }


    const checksView = []
    for (let i = 0; i < screen?.list.length; i++) {
        const item = screen?.list[i];
        checksView.push(
            <View style={{flexDirection:'row',alignItems:'center',marginBottom:20}} key={item?.text}>
                <Image style={{width:20,height:20,marginRight:9}} source={{uri:item?.icon}} />
                <Text style={{...styles.subtitle,maxWidth:'92%'}}>{item?.text}</Text>
            </View>
        )
    }

    const payHandler = (plan) => {
        const newPlan = plan ?? screen?.plans[currentPlan]
        // Покупка подписки
        console.warn('newPlan.i',newPlan.id)
        setLoading(true)
        RNIap.requestPurchase(newPlan.id)
        .then((receipt) => {
            // Отправляем id на сервер
            payAppleOrAndroid(receipt).then(async () => {
                console.warn('receipt',receipt)
                let today = new Date()
                let inWeek = new Date()
                inWeek.setDate(today.getDate() + 7)
                newPlan.trial ? AppEventsLogger.logEvent('TrialBuy',{ 'TrialStart': today.toLocaleDateString('ru'), 'TrialEnd' : inWeek.toLocaleDateString('ru')}) : AppEventsLogger.logEvent('fb_mobile_purchase',{fb_currency:'RUB',receipt_id:newPlan.id})
                // Обновление инфы о пользователе
                try {
                    await getUserInfo()
                    setLoading(false)
                    // Проверка - зашли ли через онбординг или с другого места. Если есть data, то не с онбординга
                    if(data){
                        // Если есть телефон, то все впорядке, возвращаем назад. Если нет, то обязательно ввести closeDisable - не позволяет пропустить экран
                        // from - экран, на который перейдет пользователь после подтверждения телефона
                        network.user?.phone ? navigation.goBack() : navigation.navigate('LoginScreen',{closeDisable:true,from:'MenuScreen'})
                    } else {
                        // Если есть телефон, то все впорядке, возвращаем назад. Если нет, то обязательно ввести closeDisable - не позволяет пропустить экран
                        // from - экран, на который перейдет пользователь после подтверждения телефона
                        network.user?.phone ? navigation.navigate(screen?.next_board) : navigation.navigate('LoginScreen',{closeDisable:true,from:screen?.next_board})
                    }
                } catch (error) {
                    console.warn(error)
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

    const footerArr = [
        {
            id:1,
            title:'Политика конфиденциальности',
            onPress: () => {
                setTextMode('privacy')
                setprivacyModal(true)
            },
        },{
            id:2,
            title:'Пользовательское соглашение',
            onPress: () => {
                setTextMode('agreement')
                setprivacyModal(true)
            },
        },{
            id:3,
            title:'User agreement',
            onPress: () => {
                setTextMode('UserAgreement')
                setprivacyModal(true)
            },
        }
    ]


    return (
        <>
        <SafeAreaView backgroundColor={"#FFF"} />
        <Spinner visible={loading} />
        <SkipHeader 
            skip={() => fromOnboarding ? navigation.navigate(screen?.next_board) : navigation.goBack()} 
            withBack={false}
            withSkip={data ? true : screen?.continue_step}    
        />
        <ScrollView style={{flex:1,backgroundColor:'#FFF'}} contentContainerStyle={{paddingHorizontal:16,paddingTop:8}} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{screen?.title}</Text>
                {plansView}
            <View style={{marginTop:16}}>
                {checksView}
            </View>
        </ScrollView>
        <View style={{alignItems:'center',padding:8,backgroundColor:'#FFF'}}>
            {footerArr.map((item) => <FooterItem title={item.title} onPress={item.onPress} key={item.id} />)}
            <Text style={styles.decr}>{screen?.description_bottom}</Text>
            <Btn underlayColor={Colors.underLayYellow} 
                title={screen?.plans?.[currentPlan]?.button} backgroundColor={Colors.yellow} 
                customStyle={{width:common.getLengthByIPhone7(0) - 16,borderRadius:16}} 
                customTextStyle={{fontWeight:'600',fontSize:16,lineHeight:19}}
                onPress={() => payHandler()} />
        </View>
        <SafeAreaView backgroundColor={"#FFF"} />
        <PrivacyModal modal={privacyModal} closeModal={() => setprivacyModal(false)} mode={textMode} />
        </>
    )
})

export default PayWallScreen

const styles = StyleSheet.create({
    title:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:22,
        lineHeight:26,
        fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        marginBottom:30,
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
        color:Colors.grayColor,textAlign:'center',marginBottom:25
    }
})
