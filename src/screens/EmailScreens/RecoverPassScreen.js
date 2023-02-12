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
} from 'react-native';
import {FlatList, ScrollView, TextInput} from 'react-native-gesture-handler';
import network, {
  authUser,
  getScreens,
  getUserInfo,
  sendAnswer,
  sendNewPass,
  updateInfo,
} from '../../../Utilites/Network';
import {observer} from 'mobx-react-lite';
import {Btn} from '../../components/Btn';
import SkipHeader from '../../components/SkipHeader';
import Colors from '../../constants/Colors';
import Spinner from 'react-native-loading-spinner-overlay';
import common from '../../../Utilites/Common';
import {strings} from '../../../assets/localization/localization';

const RecoverPassScreen = observer(({navigation, route}) => {
  const [input1, setInput1] = useState('');
  const [email, setEmail] = useState('');
  const [input2, setInput2] = useState('');
  const [errorText, setErrorText] = useState('');
  const [loading, setloading] = useState(false);
  const [inputColor, setinputColor] = useState('#F5F5F5');
  const [input2Color, setInput2Color] = useState('#F5F5F5');
  const [hideInput1, setHideInput1] = useState(true);
  const [hideInput2, setHideInput2] = useState(true);
  const [status, setStatus] = useState(0);
  const fromOnboarding = route?.params?.fromOnboarding;

  const onNavigateNext = () => {
    const onboardingKeys = Object.keys(network.onboarding);
    if (fromOnboarding && onboardingKeys.length) {
      navigation.navigate(onboardingKeys[0]);
      return;
    }
    navigation.navigate('ProfileScreen');
  };

  const login = async () => {
    try {
      setloading(true);
      await authUser(email, input2);
      await getScreens();
      onNavigateNext();
      setloading(false);
      return true;
    } catch (e) {
      setErrorText(e);
      setloading(false);
    }
  };

  const nextStep = async () => {
    setErrorText('');
    if (status === 0) {
      try {
        setloading(true);
        await sendNewPass(input1);
        setEmail(input1);
        setInput1('');
        setStatus(prev => prev + 1);
        setloading(false);
        return;
      } catch (e) {
        setErrorText(e);
        setloading(false);
        return;
      }
    } else if (status === 2) {
      const isLogin = await login();
      isLogin ? setStatus(0) : null;
      return;
    }
    setStatus(prev => prev + 1);
  };

  const disabledBtn = useMemo(() => {
    if (status === 0) {
      return !common.validMail(input1);
    }
    if (status === 2) {
      return input1 !== input2 || !input1;
    }
    return false;
  }, [status, input1, input2]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}
      style={{flex: 1, backgroundColor: '#FFF'}}
      contentContainerStyle={{backgroundColor: '#FFF'}}>
      <Spinner visible={loading} />
      <SafeAreaView />
      <SkipHeader
        title={network.strings?.RecoverPassScreen}
        withSkip={false}
        goBack={() => navigation.goBack()}
      />
      <ScrollView
        style={{backgroundColor: '#FFF'}}
        contentContainerStyle={{paddingTop: 8}}>
        <View style={{paddingHorizontal: 16}}>
          <Text style={[styles.title, {marginBottom: status === 1 ? 14 : 25}]}>
            {status === 0
              ? network.strings?.TypeEmailTitle
              : status === 1
              ? network.strings?.CheckEmailTitle
              : network.strings?.TypeNewPassTitle}
          </Text>
          <View>
            {status === 1 ? (
              <Text style={styles.subtitle}>
                {network.strings?.WeSendNewPass} {email}
              </Text>
            ) : (
              <View
                style={{
                  alignItems: 'center',
                  marginBottom: 32,
                  flexDirection: 'row',
                }}>
                <TextInput
                  style={[styles.input, {backgroundColor: inputColor}]}
                  onFocus={() => setinputColor('#EEEEEE')}
                  onBlur={() => setinputColor('#F5F5F5')}
                  placeholder={
                    status
                      ? network.strings?.NewPassPlaceholder
                      : network.strings?.EmailPlaceholder
                  }
                  placeholderTextColor={Colors.grayColor}
                  selectionColor={Colors.textColor}
                  value={input1}
                  keyboardType={status ? 'default' : 'email-address'}
                  secureTextEntry={hideInput1 && !!status}
                  onChangeText={setInput1}
                />
                {!!status && (
                  <TouchableOpacity
                    onPress={() => setHideInput1(prev => !prev)}
                    style={styles.iconContainer}>
                    <Image
                      source={
                        hideInput1
                          ? require('../../../assets/icons/closedEye.png')
                          : require('../../../assets/icons/openedEye.png')
                      }
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
            {status == 2 && (
              <View
                style={{
                  alignItems: 'center',
                  marginBottom: 30,
                  flexDirection: 'row',
                }}>
                <TextInput
                  style={[styles.input, {backgroundColor: input2Color}]}
                  onFocus={() => setInput2Color('#EEEEEE')}
                  onBlur={() => setInput2Color('#F5F5F5')}
                  selectionColor={Colors.textColor}
                  placeholder={network.strings?.RepeatNewPassPlaceholder}
                  placeholderTextColor={Colors.grayColor}
                  secureTextEntry={hideInput2}
                  value={input2}
                  onChangeText={setInput2}
                />
                <TouchableOpacity
                  onPress={() => setHideInput2(prev => !prev)}
                  style={styles.iconContainer}>
                  <Image
                    source={
                      hideInput2
                        ? require('../../../assets/icons/closedEye.png')
                        : require('../../../assets/icons/openedEye.png')
                    }
                    style={styles.icon}
                  />
                </TouchableOpacity>
              </View>
            )}
            {errorText && status !== 1 ? (
              <Text style={styles.errorText}>{errorText}</Text>
            ) : null}
          </View>
          <Btn
            title={
              status == 0
                ? network.strings?.GetMyNewPass
                : status == 1
                ? network.strings?.TypeMyNewPass
                : network.strings?.InstallMyNewPass
            }
            onPress={nextStep}
            customStyle={{borderRadius: 16, marginTop: status === 1 ? 0 : 18}}
            customTextStyle={{fontWeight: '600', fontSize: 16, lineHeight: 19}}
            backgroundColor={Colors.yellow}
            underlayColor={Colors.underLayYellow}
            disabled={disabledBtn}
          />
          {status === 0 && (
            <Text style={styles.descr} onPress={() => navigation.goBack()}>
              {network.strings?.RememberedPass}
            </Text>
          )}
        </View>
      </ScrollView>
      <SafeAreaView backgroundColor={'#FFF'} />
    </KeyboardAvoidingView>
  );
});

export default RecoverPassScreen;

const styles = StyleSheet.create({
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 22,
    lineHeight: 26,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
  },
  subtitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '500',
    marginBottom: 24,
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
      android: 'SFProDisplay-Bold',
    }),
    fontSize: 16,
    lineHeight: 19,
    alignSelf: 'center',
    fontWeight: '700',
    color: Colors.textColor,
    marginTop: 20,
  },
  errorText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 12,
    lineHeight: 14,
    alignSelf: 'center',
    fontWeight: '500',
    color: '#FF0000',
    position: 'absolute',
    bottom: 12,
  },
  icon: {
    width: 26,
    height: 16,
  },
  iconContainer: {
    position: 'absolute',
    padding: 16,
    right: 0,
  },
});
