import React, {useEffect, useMemo, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Platform,
  KeyboardAvoidingView,
  TouchableOpacity,
  AsyncStorage,
  Alert,
} from 'react-native';
import {FlatList, ScrollView, TextInput} from 'react-native-gesture-handler';
import network, {
  getFavors,
  getMenu,
  getModals,
  getRegisterScreens,
  getStores,
  getUserCards,
  getUserInfo,
  loginEmail,
} from '../../../Utilites/Network';
import {observer} from 'mobx-react-lite';
import {Btn} from '../../components/Btn';
import SkipHeader from '../../components/SkipHeader';
import Colors from '../../constants/Colors';
import Spinner from 'react-native-loading-spinner-overlay';
import common from '../../../Utilites/Common';
import {strings} from '../../../assets/localization/localization';
import {GreyBtn} from '../../components/GreyBtn';
import {runInAction} from 'mobx';
import {ampInstance} from '../../../App';
import {useInterval} from '../ReceptScreen';
import {updateAllData} from '../SplashScreen';

const SendEmailCodeScreen = observer(({navigation, route}) => {
  const [code, setCode] = useState('');
  const email = route.params?.email;
  const fromOnboarding = route.params?.fromOnboarding;

  const [loading, setloading] = useState(false);
  const [inputColor, setinputColor] = useState('#F5F5F5');
  const [time, setTime] = useState(30);

  useInterval(() => {
    if (time > 0) {
      setTime(prev => prev - 1);
    }
  }, 1000);

  const onNavigateNext = () => {
    const onboardingKeys = Object.keys(network.registerOnboarding);
    if (fromOnboarding) {
      navigation.navigate(
        onboardingKeys.length ? onboardingKeys[0] : 'MainStack',
      );
      return;
    }
    navigation.navigate('ProfileScreen');
  };

  const sendAgain = async () => {
    setloading(true);
    try {
      await loginEmail({email});
      setTime(30);
      setloading(false);
    } catch (e) {
      setloading(false);
      Alert.alert(network.strings?.Error, e);
    }
  };

  const codeHandler = async finalCode => {
    setloading(true);
    try {
      const data = await loginEmail({email, code: finalCode});
      if (data) {
        runInAction(async () => {
          network.user = data;
          await Promise.all([getRegisterScreens(), updateAllData()]);
          ampInstance.logEvent('login email');
          setloading(false);
          onNavigateNext();
        });
      }
    } catch (err) {
      setloading(false);
      Alert.alert(network.strings?.Error, err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      style={{flex: 1, backgroundColor: '#FFF'}}
      contentContainerStyle={{backgroundColor: '#FFF'}}>
      <Spinner visible={loading} />
      <SafeAreaView />
      <SkipHeader
        skip={() => navigation.navigate('MainStack')}
        title={' '}
        goBack={() => navigation.goBack()}
        closeDisable={loading}
        withSkip={false}
      />
      <ScrollView
        style={{backgroundColor: '#FFF'}}
        contentContainerStyle={{paddingTop: 8}}>
        <View style={{paddingHorizontal: 16}}>
          <Text style={styles.title}>{network.strings?.TypeCodeEmail}</Text>
          <Text style={styles.subtitle}>
            {network.strings?.SentToEmail} {email}
          </Text>
          <TextInput
            style={[styles.input, {backgroundColor: inputColor}]}
            onFocus={() => setinputColor('#EEEEEE')}
            onBlur={() => setinputColor('#F5F5F5')}
            selectionColor={Colors.textColor}
            textContentType={'oneTimeCode'}
            value={code}
            keyboardType={'numeric'}
            placeholder={'0000'}
            maxLength={6}
            placeholderTextColor={'#9A9A9A'}
            onChangeText={text => {
              setCode(text);
              if (text.length === 4) {
                codeHandler(text);
              }
            }}
            autoFocus={true}
          />
        </View>
      </ScrollView>
      <View
        style={{
          paddingHorizontal: 8,
          paddingTop: 13,
          paddingBottom: 51,
          justifyContent: 'flex-end',
          backgroundColor: '#FFF',
        }}>
        {time ? (
          <Text style={styles.descr}>
            {network.strings?.Wait} 0:{time}
          </Text>
        ) : (
          <GreyBtn
            title={network.strings?.SendNewCode}
            disabled={loading}
            onPress={() => sendAgain()}
            containerStyle={{
              paddingVertical: 10,
              alignSelf: 'center',
              paddingHorizontal: 30,
            }}
          />
        )}
      </View>
      <SafeAreaView backgroundColor={'#FFF'} />
    </KeyboardAvoidingView>
  );
});

export default SendEmailCodeScreen;

const styles = StyleSheet.create({
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 22,
    lineHeight: 26,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    marginBottom: 14,
  },
  subtitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '500',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: Colors.textColor,
  },
  descr: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 14,
    lineHeight: 17,
    alignSelf: 'center',
    color: '#D5D8DC',
    fontWeight: '500',
  },
});
