import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Image,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  ScrollView,
  Platform,
  Alert,
  BackHandler,
} from 'react-native';
import common from '../../Utilites/Common';
import Colors from '../constants/Colors';
import network, {
  getRegisterScreens,
  sendDataToUrl,
} from '../../Utilites/Network';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import Config from '../constants/Config';
import Spinner from 'react-native-loading-spinner-overlay';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {runInAction} from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {updateAllData} from './SplashScreen';

const ChooseLoginScreen = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const screen = network.onboarding?.ChooseLoginScreen;

  const onAppleButtonPress = async () => {
    console.warn('Beginning Apple Authentication');
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      console.log(
        'appleAuthRequestResponse',
        JSON.stringify(appleAuthRequestResponse),
      );
      return appleAuthRequestResponse;
    } catch (error) {
      if (error.code === appleAuth.Error.CANCELED) {
        console.warn('User canceled Apple Sign in.');
      } else {
        Alert.alert(
          Config.appName,
          'К сожалению, ваше устройтво не поддерживает вход через Apple ID',
        );
        console.error(error);
      }
    }
  };

  const facebookLogin = async () => {
    try {
      const loginResult = await LoginManager.logInWithPermissions([
        'public_profile',
      ]);
      console.log(loginResult);
      if (!loginResult.isCancelled) {
        const data = await AccessToken.getCurrentAccessToken();
        return data;
      }
      return null;
    } catch (e) {
      Alert.alert('Ошибка', 'Ошибка при входе через Facebook', [
        {
          text: 'OK',
          onPress: () => setLoading(false),
        },
      ]);
    }
  };

  const gmailSignIn = async () => {
    try {
      const isSignedIn = await GoogleSignin.isSignedIn();
      if (isSignedIn) {
        await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }
      await GoogleSignin.hasPlayServices();
      let data = await GoogleSignin.signIn();
      return data;
    } catch (error) {
      // some other error happened
      console.log(error);
    }
  };

  const onNavigateNext = () => {
    Object.keys(network?.registerOnboarding).length
      ? navigation.navigate(Object.keys(network?.registerOnboarding)[0])
      : navigation.navigate('MainStack');
  };

  const signIn = async (btn, socData) => {
    try {
      if (socData) {
        console.log('network.deviceId', network.deviceId);
        const data = {...socData, device_id: network.deviceId};
        const user = await sendDataToUrl({url: btn?.route, data});
        AsyncStorage.setItem('token', user.token);
        runInAction(() => {
          network.user = user;
          network.access_token = user.token;
        });
        await Promise.all([updateAllData(), getRegisterScreens()]);
        onNavigateNext();
      } else if (btn?.type == 'registration') {
        await getRegisterScreens();
        onNavigateNext();
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log(e);
      Alert.alert('Ошибка', e);
    }
  };

  const onBtnPress = async btn => {
    let socData = null;
    setLoading(true);
    try {
      switch (btn?.type) {
        case 'registration':
          break;
        case 'facebook':
          socData = await facebookLogin();
          break;
        case 'google':
          socData = await gmailSignIn();
          break;
        case 'apple':
          socData = await onAppleButtonPress();
          break;
        case 'enter':
          setLoading(false);
          navigation.navigate('EmailLoginScreen');
          return;
      }
      signIn(btn, socData);
    } catch (e) {
      setLoading(false);
      console.log(e);
    }
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '741267126814-l6rotkvtgq33ig8hlr9k4b6oc8lpo7fq.apps.googleusercontent.com',
    });
    if (Platform.OS !== 'ios') {
      const backAction = () => {
        if (navigation.isFocused()) {
          Alert.alert(
            'Подтверждение',
            'Вы действительно хотите выйти из приложения?',
            [
              {
                text: 'Отмена',
                onPress: () => null,
                style: 'cancel',
              },
              {text: 'Выйти', onPress: () => BackHandler.exitApp()},
            ],
          );
          return true;
        }
      };
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );
      return () => {
        backHandler.remove();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollView
      style={{paddingBottom: common.getLengthByIPhone7(42)}}
      showsVerticalScrollIndicator={false}>
      <Spinner
        visible={loading}
        textContent={'Загрузка...'}
        overlayColor={'rgba(255, 255, 255, 0.9)'}
        textStyle={{color: '#FFF'}}
      />
      <SafeAreaView />
      <Text allowFontScaling={false} style={styles.title}>
        {screen?.title}
      </Text>
      <Image
        style={{width: '100%', height: 168, marginVertical: 33}}
        source={{uri: screen?.image}}
      />
      <View
        style={{
          paddingHorizontal: common.getLengthByIPhone7(55),
          alignItems: 'center',
          marginTop: 6,
        }}>
        {screen?.buttons?.map((btn, index) => (
          <TouchableOpacity
            style={[
              styles.btn,
              {
                backgroundColor: btn?.background,
                borderColor: btn?.border_color,
              },
            ]}
            onPress={() => onBtnPress(btn)}
            key={index}>
            {btn?.icon ? (
              <Image source={{uri: btn?.icon}} style={styles.btnIcon} />
            ) : null}
            <Text style={[styles.btnText, {color: btn?.text_color}]}>
              {btn?.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: common.getLengthByIPhone7(24),
    lineHeight: common.getLengthByIPhone7(29),
    color: Colors.textColor,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    maxWidth: common.getLengthByIPhone7(277),
    marginTop: common.getLengthByIPhone7(61),
  },
  btnView: {
    width: common.getLengthByIPhone7(140),
    height: common.getLengthByIPhone7(47),
    marginTop: common.getLengthByIPhone7(56),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.greenColor,
  },
  btn: {
    paddingVertical: 18,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#5E5F5F',
    width: common.getLengthByIPhone7(264),
    marginBottom: 10,
  },
  btnIcon: {
    width: 18,
    height: 18,
    position: 'absolute',
    left: 16,
  },
  btnText: {
    fontFamily: Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Medium',
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '500',
    color: '#FFF',
  },
});

export default ChooseLoginScreen;
