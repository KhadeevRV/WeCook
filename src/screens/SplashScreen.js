import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  Text,
  Animated,
  StyleSheet,
  Platform,
  SafeAreaView,
  Alert,
  StatusBar,
} from 'react-native';
import Colors from '../constants/Colors';
import Common from '../../Utilites/Common';
import {View} from 'react-native-animatable';
import network, {
  getMenu,
  authUser,
  registerUser,
  getFavors,
  getTariffs,
  getBasket,
  getStores,
  getUserCards,
  basketClear,
  updateInfo,
  getTranslate,
  getList,
  getUserInfo,
  getUserFromLink,
  getModals,
  getInitialScreens,
  getRegisterScreens,
} from '../../Utilites/Network';
import {observer} from 'mobx-react-lite';
import FastImage from 'react-native-fast-image';
import {runInAction} from 'mobx';
import OneSignal from 'react-native-onesignal';
import {
  getTrackingStatus,
  requestTrackingPermission,
} from 'react-native-tracking-transparency';
import {Settings} from 'react-native-fbsdk-next';
import YaMap from 'react-native-yamap';
import SplashScreenLib from 'react-native-splash-screen';
import Config from '../constants/Config';
import {ampInstance} from '../../App';
import {strings} from '../../assets/localization/localization';
import * as RNIap from 'react-native-iap';
import {
  InAppPurchase,
  PurchaseError,
  SubscriptionPurchase,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';
import {CheckDymanicLink} from './ReceptDayScreen';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import {useInterval} from './ReceptScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const updateAllData = async () => {
  await Promise.all([
    getTranslate(),
    getInitialScreens(),
    getMenu(),
    getStores(),
    getUserCards(),
    getFavors(),
    getModals(),
    getList(),
    getBasket(),
  ]);
};

export const SplashScreen = observer(({navigation}) => {
  const initSubs = async items => {
    try {
      await RNIap.initConnection();
      await RNIap.getProducts(items).then(products =>
        console.warn('productsss: ' + JSON.stringify(products)),
      );
      await RNIap.getSubscriptions(items).then(products =>
        console.warn('getSubscriptionssss: ' + JSON.stringify(products)),
      );
    } catch (error) {
      console.warn('err: ' + error);
    }
    let purchaseUpdated = purchaseUpdatedListener(async purchase => {
      const receipt = purchase.transactionReceipt;
      console.warn('purchase', purchase);
      if (receipt) {
        RNIap.finishTransaction(receipt);
      }
    });
    let purchaseError = purchaseErrorListener(error => {
      console.log('purchaseErrorListener', error);
      error?.responseCode == Platform.select({ios: 2, android: 1})
        ? null
        : Alert.alert(network?.strings?.Error, error?.message);
    });
  };

  const allDone = () => {
    if (funcDone && animDone) {
      runInAction(() => (network.fromSplash = true));
      if (err) {
        Alert.alert(
          Config.appName,
          network.strings?.NoConnectionAlert ??
            network.strings?.NoConnectionAlert,
        );
      } else {
        // navigation.navigate('OnboardingStack');
        //!
        Object.keys(network?.onboarding).length ||
        Object.keys(network?.registerOnboarding).length
          ? navigation.navigate('OnboardingStack')
          : navigation.navigate('MainStack');
        //!
        // navigation.navigate('MainStack');
      }
    }
  };

  const getStatus = async (initial = '') => {
    const tracking = initial ? initial : await getTrackingStatus();
    if (tracking === 'authorized' || tracking === 'unavailable') {
      Settings.setAdvertiserTrackingEnabled(true);
    } else if (tracking === 'not-determined') {
      const trackingStatus = await requestTrackingPermission();
      await getStatus(trackingStatus);
    }
    console.warn('tracking', tracking);
  };
  const delay = 45;
  const [stop, setStop] = useState(false);
  const [progress, setProgress] = useState(0);
  const [animDone, setAnimDone] = useState(false);
  let btnAnim = useRef(new Animated.Value(90)).current;
  let textAnim = useRef(new Animated.Value(0)).current;
  const [stopBtnAnim, setStopBtnAnim] = useState(false);
  const [stopTextAnim, setStopTextAnim] = useState(false);

  useInterval(() => {
    if (!stop) {
      setProgress(progress + 2);
      if (progress > 130) {
        setStop(true);
        setAnimDone(true);
      }
    }
  }, delay);

  useEffect(() => {
    if (progress > 80 && !stopTextAnim) {
      setStopTextAnim(true);
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    if (progress > 50 && !stopBtnAnim) {
      setStopBtnAnim(true);
      Animated.timing(btnAnim, {
        toValue: -12,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [progress]);

  const goToMain = async () => {
    OneSignal.setLogLevel(6, 0);
    OneSignal.setAppId('50273246-c3e6-4670-b829-3e51d4b24b51');
    await YaMap.init('31460ec9-f312-465d-a25a-e3017559ad4f');
    getStatus();
    try {
      let newToken = await AsyncStorage.getItem('token');
      newToken ? runInAction(() => (network.access_token = newToken)) : null;
      console.warn('object123123', newToken);
      network.setUniqueId();
      await authUser(undefined, undefined, newToken);
      const localeValue = strings.getInterfaceLanguage();
      if (network?.user?.lang_app !== localeValue) {
        await updateInfo('lang_app', localeValue);
        // await getUserInfo();
      }
      await Promise.all([updateAllData(), getRegisterScreens()]);
      ampInstance.logEvent('app opened');
      const subItems = await getTariffs();
      await initSubs(subItems);
      const fromDeepLink = await CheckDymanicLink();
      console.log('fromDeepLink', fromDeepLink);
      if (fromDeepLink) {
        try {
          await getUserFromLink(fromDeepLink);
          await getInitialScreens();
        } catch (e) {
          await authUser();
        }
      }
      const urls = [];
      for (let i = 0; i < network.dayDishes.length; i++) {
        urls.push({uri: network.dayDishes[i].images?.big_webp});
      }
      try {
        FastImage.preload(urls);
      } catch (error) {
        setFuncDone(true);
        // continue
      }
      setFuncDone(true);
    } catch (e) {
      console.warn('object', e);
      setErr(true);
      setFuncDone(true);
    }
  };

  const screenDelay = 24 * 60 * 60 * 1000;
  const checkReceptScreenDate = async () => {
    const receptDayDate = await AsyncStorage.getItem('receptDayDate');
    const alreadySignIn = await AsyncStorage.getItem('alreadySignIn');
    if (!alreadySignIn) {
      AsyncStorage.setItem('alreadySignIn', 'Yes');
      return;
    }
    if (receptDayDate) {
      const date = new Date(receptDayDate);
      if (
        new Date() - date > screenDelay ||
        new Date().getDate() !== date.getDate()
      ) {
        runInAction(() => (network.enableReceptDayScreen = true));
      }
    } else {
      runInAction(() => (network.enableReceptDayScreen = true));
    }
    // await AsyncStorage.setItem('signInCount', signInCount + 1);
  };

  useEffect(() => {
    SplashScreenLib.hide();
    goToMain();
    checkReceptScreenDate();
  }, []);

  const [err, setErr] = useState(false);
  const [funcDone, setFuncDone] = useState(false);

  useEffect(() => {
    allDone();
  }, [funcDone, animDone]);

  // useEffect(() => {
  //   const onFocus = navigation.addListener('focus', () => {
  //     if (Platform.OS == 'android') {
  //       StatusBar.setBackgroundColor('rgba(255, 230, 100, 1)', true);
  //     }
  //   });
  //   return onFocus;
  // }, [navigation]);
  useEffect(() => {
    const onBlur = navigation.addListener('blur', () => {
      if (Platform.OS == 'android') {
        StatusBar.setBackgroundColor('#FFF', true);
      }
    });
    return onBlur;
  }, [navigation]);

  return (
    <>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFF',
        }}>
        <View
          style={{
            width: '100%',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          <Animated.Image
            style={{
              width: 70,
              height: 70,
              tintColor: Colors.yellow,
              transform: [{translateX: btnAnim}],
            }}
            source={require('../../assets/img/splashIcon.png')}
          />
          <Animated.Image
            style={{width: 168, height: 24, opacity: textAnim}}
            source={require('../../assets/img/name.png')}
          />
        </View>
        <Text allowFontScaling={false} style={styles.title}>
          ГОТОВИТЬ ДОМА ПРОСТО
        </Text>
      </View>
      <SafeAreaView />
    </>
  );
});

const styles = StyleSheet.create({
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Bold',
    }),
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 3,
    color: '#A7A7A7',
    fontWeight: 'bold',
    position: 'absolute',
    bottom: 33,
  },
});
