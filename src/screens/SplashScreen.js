import React, {useState, useEffect, useRef} from 'react';
import {
  AsyncStorage,
  Text,
  Animated,
  Image,
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
  getScreens,
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
    let purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: InAppPurchase | SubscriptionPurchase) => {
        const receipt = purchase.transactionReceipt;
        console.warn('purchase', purchase);
        if (receipt) {
          RNIap.finishTransaction(receipt);
        }
      },
    );
    let purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.log('purchaseErrorListener', error);
        error?.responseCode == Platform.select({ios: 2, android: 1})
          ? null
          : Alert.alert(network?.strings?.Error, error?.message);
      },
    );
  };

  const allDone = async () => {
    if (funcDone) {
      runInAction(() => (network.fromSplash = true));
      if (err) {
        Alert.alert(
          Config.appName,
          network.strings?.NoConnectionAlert ??
            network.strings?.NoConnectionAlert,
        );
        // navigation.navigate('OnboardingStack');
      } else {
        // navigation.navigate('OnboardingStack');
        Object.keys(network?.onboarding).length
          ? navigation.navigate('OnboardingStack')
          : navigation.navigate('MainStack');
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
  const [token, setToken] = useState(null);
  const [locale, setLocale] = useState('');
  const goToMain = async () => {
    let newLocale = strings?.getInterfaceLanguage()?.split('-')[1];
    setLocale(newLocale);
    OneSignal.setLogLevel(6, 0);
    OneSignal.setAppId('50273246-c3e6-4670-b829-3e51d4b24b51');
    await YaMap.init('31460ec9-f312-465d-a25a-e3017559ad4f');
    getStatus();
    try {
      let newToken = await AsyncStorage.getItem('token');
      console.warn('object123123', newToken);
      setToken(newToken);
      network.setUniqueId();
      await authUser();
      const localeValue = strings.getInterfaceLanguage();
      if (network?.user?.lang_app !== localeValue) {
        await updateInfo('lang_app', localeValue);
        // await getUserInfo();
      }
      await Promise.all([
        getTranslate(),
        getScreens(),
        getMenu(),
        getStores(),
        getUserCards(),
        getFavors(),
        getModals(),
      ]);
      ampInstance.logEvent('app opened');
      const subItems = await getTariffs();
      await Promise.all([initSubs(subItems), getList(), getBasket()]);
      const fromDeepLink = await CheckDymanicLink();
      console.log('fromDeepLink', fromDeepLink);
      if (fromDeepLink) {
        try {
          await getUserFromLink(fromDeepLink);
          await getScreens();
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
  }, [funcDone]);

  useEffect(() => {
    const onFocus = navigation.addListener('focus', () => {
      if (Platform.OS == 'android') {
        StatusBar.setBackgroundColor('rgba(255, 230, 100, 1)', true);
      }
    });
    return onFocus;
  }, [navigation]);
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
          backgroundColor: '#FFE500',
        }}>
        <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
          <Image
            style={{
              width: 71,
              height: 71,
              tintColor: Colors.textColor,
              marginRight: 16,
            }}
            source={require('../../assets/img/splashLogo.png')}
          />
          <View>
            <Image
              style={{width: 132, height: 25}}
              source={require('../../assets/img/splashText.png')}
            />
            <Image
              style={{
                width: 82,
                height: 14,
                marginTop: 8,
                alignSelf: 'flex-end',
                opacity: locale == 'RU' ? 1 : 0,
              }}
              source={require('../../assets/img/byFoodplan.png')}
            />
          </View>
        </View>
      </View>
    </>
  );
});
