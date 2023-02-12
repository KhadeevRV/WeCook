import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Platform,
  KeyboardAvoidingView,
  Alert,
  AsyncStorage,
} from 'react-native';
import {
  TouchableOpacity,
  FlatList,
  ScrollView,
  TextInput,
} from 'react-native-gesture-handler';
import network, {
  getBasket,
  getCode,
  getFavors,
  getList,
  getMenu,
  getUserInfo,
  sendAnswer,
  updateInfo,
} from '../../Utilites/Network';
import {observer, Observer, useObserver} from 'mobx-react-lite';
import {runInAction} from 'mobx';
import {Btn} from '../components/Btn';
import common from '../../Utilites/Common';
import SkipHeader from '../components/SkipHeader';
import Colors from '../constants/Colors';
import Spinner from 'react-native-loading-spinner-overlay';
import {strings} from '../../assets/localization/localization';

const LoginScreen = observer(({navigation, route}) => {
  const [phone, setPhone] = useState('+');
  const [loading, setloading] = useState(false);
  const [inputColor, setinputColor] = useState('#F5F5F5');

  const changePhone = phone => {
    let newPhone = phone;
    if (newPhone.charAt(0) != '+') {
      newPhone = '+' + newPhone;
    }
    setPhone(newPhone);
  };

  const sendPhone = async () => {
    const clearPhone = phone.replace(/[^\d.-]/g, '');
    setloading(true);
    try {
      await getCode(clearPhone);
      setloading(false);
      navigation.navigate('SendSmsScreen', {
        from: from,
        phone: clearPhone,
        closeDisable: !!closeDisable,
        exit: exit,
      });
    } catch (err) {
      setloading(false);
      Alert.alert('Ошибка', err);
    }
  };

  const sendPhoneWithoutCode = async () => {
    const clearPhone = phone.replace(/[^\d.-]/g, '');
    setloading(true);
    try {
      const token = await updateInfo('phone', clearPhone);
      if (token) {
        runInAction(async () => {
          AsyncStorage.setItem('token', token);
          network.access_token = token;
          await getUserInfo(token);
          await getMenu();
          await getBasket();
          await getFavors();
          setloading(false);
          navigation.navigate(
            from ? from : exit ? 'ReceptDayScreen' : 'MainStack',
          );
        });
      } else {
        runInAction(async () => {
          network.user.phone = clearPhone;
          await getUserInfo();
          setloading(false);
          navigation.navigate(
            from ? from : exit ? 'ReceptDayScreen' : 'MainStack',
          );
        });
      }
    } catch (err) {
      setloading(false);
      console.warn(err);
      Alert.alert(network.strings?.Error, err);
    }
  };

  const exit = route?.params?.exit;
  const closeDisable = route?.params?.closeDisable;
  const from = route?.params?.from;
  const screen = network.onboarding.LoginScreen;

  useEffect(() => {
    if (closeDisable) {
      navigation.setParams({gestureEnable: false});
    }
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}
      style={{flex: 1, backgroundColor: '#FFF'}}
      contentContainerStyle={{backgroundColor: '#FFF'}}>
      <Spinner visible={loading} />
      <SafeAreaView />
      <SkipHeader
        skip={() => navigation.navigate(exit ? 'ReceptDayScreen' : 'MainStack')}
        withBack={!!from}
        closeDisable={!!closeDisable}
        title={' '}
        withSkip={!from && screen?.continue_step}
        goBack={() => navigation.goBack()}
      />
      <ScrollView
        style={{backgroundColor: '#FFF'}}
        contentContainerStyle={{paddingTop: 8}}>
        <View style={{paddingHorizontal: 16}}>
          <Text style={styles.title}>{network.strings?.YourPhone}</Text>
          <Text style={styles.subtitle}>{network.strings?.ToReachYou}</Text>
          <TextInput
            style={[styles.input, {backgroundColor: inputColor}]}
            onFocus={() => setinputColor('#EEEEEE')}
            onBlur={() => setinputColor('#F5F5F5')}
            selectionColor={Colors.textColor}
            value={phone}
            keyboardType={'numeric'}
            onChangeText={text => changePhone(text)}
            autoFocus={true}
          />
        </View>
      </ScrollView>
      <View
        style={{
          paddingHorizontal: 8,
          paddingTop: 13,
          paddingBottom: 8,
          justifyContent: 'flex-end',
          backgroundColor: '#FFF',
        }}>
        <Btn
          title={network.strings?.PhoneScreenOK}
          onPress={() =>
            network.isBasketUser() ? sendPhone() : sendPhoneWithoutCode()
          }
          // onPress={() => sendPhoneWithoutCode()}
          customStyle={{borderRadius: 16}}
          customTextStyle={{fontWeight: '600', fontSize: 16, lineHeight: 19}}
          backgroundColor={Colors.yellow}
          underlayColor={Colors.underLayYellow}
          disabled={phone.length < 2}
        />
      </View>
      <SafeAreaView backgroundColor={'#FFF'} />
    </KeyboardAvoidingView>
  );
});

export default LoginScreen;

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
    marginBottom: 21,
  },
  input: {
    width: '100%',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
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
    fontWeight: '500',
    marginTop: 24,
  },
});
