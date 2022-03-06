import React, { useState, useEffect,useRef } from 'react'
import {AsyncStorage, Text, Animated,Image, Platform,SafeAreaView, ImageBackground, StatusBar } from 'react-native'
import Colors from '../constants/Colors'
import Common from '../../Utilites/Common'
import { View } from 'react-native-animatable'
import common from '../../Utilites/Common'
import deviceInfoModule, { getUniqueId } from 'react-native-device-info'
import network, { getMenu, getScreens, authUser, registerUser, getFavors, getTariffs, getHistory, payAppleOrAndroid } from '../../Utilites/Network'
import { observer } from 'mobx-react-lite'
import FastImage from 'react-native-fast-image'
import * as RNIap from 'react-native-iap'
import {
  InAppPurchase,
  PurchaseError, 
  SubscriptionPurchase,
  finishTransaction,
  processNewPurchase,
  finishTransactionIOS,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';
import { runInAction } from 'mobx'
import LinearGradient from 'react-native-linear-gradient'
import { getBottomSpace, getStatusBarHeight } from 'react-native-iphone-x-helper'
import OneSignal from 'react-native-onesignal'
import { getTrackingStatus, requestTrackingPermission } from 'react-native-tracking-transparency';
import { Settings } from 'react-native-fbsdk-next'
import changeNavigationBarColor from 'react-native-navigation-bar-color'

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export const SplashScreen = observer(({navigation}) => {

  const allDone = async () => {
    if (animDone && funcDone){
      runInAction(() => network.fromSplash = true)
      if(err) {
        navigation.navigate('OnboardingStack')
      } else {
        // navigation.navigate('OnboardingStack')
        token ? navigation.navigate('MainStack') : navigation.navigate('OnboardingStack')
        // navigation.navigate('MainStack')
      }
    }
  }

  const getStatus = async () => {
    const tracking = await requestTrackingPermission();
    if(tracking == 'authorized' || tracking === 'unavailable'){
      Settings.setAdvertiserTrackingEnabled(true)
    }
    console.warn('tracking',tracking)
  }

  const [token, setToken] = useState(null)
  const goToMain = async () => {
    OneSignal.setLogLevel(6, 0);
    OneSignal.setAppId("50273246-c3e6-4670-b829-3e51d4b24b51");
    OneSignal.promptForPushNotificationsWithUserResponse(response => {
      console.log("Prompt response:", response);
    });
    getStatus()
    const deviceInfo = await OneSignal.getDeviceState()
    console.warn('deviceInfooo',deviceInfo)
    runInAction(() => network.pushId = deviceInfo.userId)
    try {
      newToken = await AsyncStorage.getItem('token')
      console.warn('object',newToken)
      setToken(newToken)
      network.setUniqueId()
      await authUser()
      await getScreens()
      await getTariffs().then(async (items) => {
        await initSubs(items)
      })
      await getMenu()
      const urls = []
      for (let i = 0; i < network.dayDishes.length; i++) {
        urls.push({uri:network.dayDishes[i].images?.big_webp})
      }
      try {
        await FastImage.preload(urls)
      } catch (error) {
        setFuncDone(true)
        // continue
      }
      await getFavors()
      await getHistory()
      setFuncDone(true)
    } catch (e) {
      console.warn('object',e)
      setErr(true)
      setFuncDone(true)
    }
  }

  useEffect(() => {
    goToMain()
  }, [])

  const imgs = [
    {
      id:1,url:require('../../assets/img/splashScreen/plate1.png')
    },{
      id:2,url:require('../../assets/img/splashScreen/plate2.png')
    },{
      id:3,url:require('../../assets/img/splashScreen/plate3.png')
    },{
      id:4,url:require('../../assets/img/splashScreen/plate4.png')
    },
  ]

  //! Анимация

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const changeImage = (prevPlate) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,useNativeDriver:false
    }).start(() => {
      prevPlate + 1 == imgs.length ? setCurrentPlate(0) : setCurrentPlate(prev => prev + 1)
      prevPlate + 3 == imgs.length ? setAnimDone(true) : null
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,useNativeDriver:false
      }).start()
    });
  }

  const [err, setErr] = useState(false)
  const [stop, setStop] = useState(false)
  const [animDone, setAnimDone] = useState(false)
  const [funcDone, setFuncDone] = useState(false)
  const [currentPlate, setCurrentPlate] = useState(0)
  const delay =  800

  useInterval(() => {
    if(!stop){
      if(funcDone && animDone){
        setStop(true)
      } else {
        currentPlate + 1 == imgs.length ? setCurrentPlate(0) : setCurrentPlate(prev => prev + 1)
        currentPlate + 3 == imgs.length ? setAnimDone(true) : null
      }
    }
  }, delay);

  useEffect(() => {
    allDone()
  }, [animDone, funcDone])

  const checkSub = () => {
    RNIap.getAvailablePurchases().then(async (value) => {
      const purchaseDate = new Date(network.user?.subscription?.info?.purchase_date)
      for (let i = 0; i < value.length; i++) {
        const transcation = value[i];
        console.warn('checkSubcheckSub',purchaseDate.toLocaleDateString(),new Date(transcation.transactionDate).toLocaleDateString())
        if(purchaseDate <= new Date(transcation.transactionDate) || !purchaseDate){
          console.warn('ЗАПРООООООС',new Date(transcation.transactionDate),transcation.productId)
          await payAppleOrAndroid(transcation)
          await authUser()
          break
        }
      }
    })
  }

  const initSubs = async (items) => {
    try {
      await RNIap.initConnection()
      await RNIap.getProducts(items).then((products) => console.warn('productsss: '+JSON.stringify(products)))
      await RNIap.getSubscriptions(items).then((products) => console.warn('getSubscriptionssss: '+JSON.stringify(products)))
      network.user?.access ? null : checkSub()
    } catch (error) {
      console.warn('err: ' + error); 
    }
    purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: InAppPurchase | SubscriptionPurchase) => {
        const receipt = purchase.transactionReceipt;
        console.warn('purchase',purchase)
        if (receipt) {
            RNIap.finishTransaction(receipt);
          }
      },
    );
    purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.log('purchaseErrorListener', error);
      },
    );
  }

  useEffect(() => {
    const onFocus = navigation.addListener('focus', () => {
      if(Platform.OS == 'android'){
        StatusBar.setBackgroundColor('rgba(255, 230, 100, 1)', true);
      }
    });
    return onFocus;
  }, [navigation]);
  useEffect(() => {
    const onBlur = navigation.addListener('blur', () => {
      if(Platform.OS == 'android'){
        StatusBar.setBackgroundColor('#FFF', true);
      }
    });
    return onBlur;
  }, [navigation]);

  return (
    <>
      <LinearGradient 
        colors={['rgba(255, 230, 100, 1)', `rgba(238, 195, 45, 1)`]} 
        style={{flex:1,alignItems:'center'}}
      >
        <Image style={{width:84,height:84,marginTop:94 + getStatusBarHeight(),marginBottom:17}} 
          source={require('../../assets/img/splashLogo.png')}
        />
        <Image style={{width:144,height:27}} 
          source={require('../../assets/img/splashText.png')}
        />
        <Image source={imgs[currentPlate].url} 
          style={{
            width:common.getLengthByIPhone7(),height:common.getLengthByIPhone7(),
            position:'absolute',bottom:34 + getBottomSpace(),
          }}
        />
        <Text style={{
          fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Medium' }), fontSize:16,
          fontWeight:'500',
          lineHeight:19,color:'#FFF',
          position:'absolute',bottom:34 + getBottomSpace(),
        }}>
          Всегда знаешь, что приготовить
        </Text>
      </LinearGradient>
    </>
  )
})