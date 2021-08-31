import React, { useState, useEffect,useRef } from 'react'
import {AsyncStorage, Text, Animated,Image, Platform,SafeAreaView, ImageBackground, StatusBar } from 'react-native'
import Colors from '../constants/Colors'
import Common from '../../Utilites/Common'
import { View } from 'react-native-animatable'
import common from '../../Utilites/Common'
import deviceInfoModule, { getUniqueId } from 'react-native-device-info'
import network, { getMenu, getScreens, authUser, registerUser, getFavors } from '../../Utilites/Network'
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

  const [token, setToken] = useState(null)
  const goToMain = async () => {
    try {
      newToken = await AsyncStorage.getItem('token')
      setToken(newToken)
      network.setUniqueId()
      await getScreens().then(async (items) => {
        await initSubs(items)
      })
      await authUser()
      await getMenu().then(async () => {
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
        setFuncDone(true)
      }) 
    } catch (e) {
      console.warn('object',e)
      setErr(true)
      setFuncDone(true)
    }
  }

//   const checkATT = async () => {
//     const trackingStatus = await requestTrackingPermission()
//   }

  useEffect(() => {
    goToMain()
  }, [])
  const [err, setErr] = useState(false)
  const [stop, setStop] = useState(false)
  const [progress, setProgress] = useState(0);
  const [animDone, setAnimDone] = useState(false)
  const [funcDone, setFuncDone] = useState(false)
  let animation = useRef(new Animated.Value(0));

  const delay = Platform.OS == 'ios' ? 45 : 100

  useInterval(() => {
    if(!stop){
      setProgress(progress + 2)
      if (progress > Platform.select({ ios: 120, android: 60 })) {
        setStop(true)
        setAnimDone(true)
      }
    } 
  }, delay);

  let btnAnim = useRef(new Animated.Value(90)).current;
  let textAnim = useRef(new Animated.Value(0)).current;
  const [stopBtnAnim, setStopBtnAnim] = useState(false)
  const [stopTextAnim, setStopTextAnim] = useState(false)

  useEffect(() => {
    if(progress > Platform.select({ ios: 80, android: 40 }) && !stopTextAnim){
      setStopTextAnim(true)
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start(); 
    }
    if (progress > Platform.select({ ios: 50, android: 25 }) && !stopBtnAnim){
      setStopBtnAnim(true)
      Animated.timing(btnAnim, {
        toValue: -12,
        duration: 500,
        useNativeDriver: true
      }).start(); 
    }
  },[progress])

  useEffect(() => {
    allDone()
  }, [animDone, funcDone])

  const initSubs = async (items) => {
  //   // if(Object.keys(network.subscriptions).length){
    try {
      await RNIap.initConnection()
      await RNIap.getProducts(items).then((products) => console.warn('products: '+JSON.stringify(products)))
      await RNIap.getSubscriptions(items).then((products) => console.warn('getSubscriptions: '+JSON.stringify(products)))
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

  // useEffect(() => {
  //   const onFocus = navigation.addListener('focus', () => {
  //     if(Platform.OS == 'android'){
  //       StatusBar.setBackgroundColor('#FFFDC7', true);
  //     }
  //   });
  //   return onFocus;
  // }, [navigation]);
  // useEffect(() => {
  //   const onBlur = navigation.addListener('blur', () => {
  //     if(Platform.OS == 'android'){
  //       StatusBar.setBackgroundColor('#FFF', true);
  //     }
  //   });
  //   return onBlur;
  // }, [navigation]);

  return (
    <>
      <View style={{flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#FFF'}}>
        <View style={{width:'100%',alignItems:'center',flexDirection:'row',justifyContent:'center'}}>
          <Animated.Image style={{width:70,height:70,transform: [{ translateX: btnAnim}]}} 
            source={require('../../assets/img/splashIcon.png')} />
          <Animated.Image style={{width:168,height:24, opacity:textAnim}}
            source={require('../../assets/img/name.png')} />
        </View>
        <Text allowFontScaling={false} style={{
        //   fontFamily:Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
          fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:11,
          lineHeight:15,
          letterSpacing:3,
          color:'#A7A7A7',
          fontWeight:'bold',
          position:'absolute',bottom:33,
        }}>ГОТОВИТЬ ДОМА ПРОСТО</Text>
        {/* <Image style={{width:common.getLengthByIPhone7(231),height:common.getLengthByIPhone7(127),}}
            source={require('../../assets/img/splashLogo.png')} /> */}
      </View>
      <SafeAreaView backgroundColor={"#FFF"}/>
    </>
  )
})