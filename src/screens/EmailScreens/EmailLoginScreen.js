import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Alert,
  Image,
} from 'react-native';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import network, {authUser, getScreens, loginEmail} from '../../../Utilites/Network';
import {observer, Observer, useObserver} from 'mobx-react-lite';
import {runInAction} from 'mobx';
import {Btn} from '../../components/Btn';
import SkipHeader from '../../components/SkipHeader';
import Colors from '../../constants/Colors';
import Spinner from 'react-native-loading-spinner-overlay';
import common from '../../../Utilites/Common';
import {strings} from '../../../assets/localization/localization';
import {TouchableOpacity} from '@gorhom/bottom-sheet';

const EmailLoginScreen = observer(({navigation, route}) => {
  const [email, setEmail] = useState('');
  const [loading, setloading] = useState(false);
  const [inputColor, setinputColor] = useState('#F5F5F5');
  const fromOnboarding = route?.params?.fromOnboarding;

  const onNavigateNext = () => {
    const onboardingKeys = Object.keys(network.onboarding);
    if (fromOnboarding && onboardingKeys.length) {
      navigation.navigate(onboardingKeys[0]);
      return;
    }
    navigation.goBack();
  };

  const login = async () => {
    try {
      setloading(true);
      // await authUser(email, password);
      await loginEmail({email});
      navigation.navigate('SendEmailCodeScreen', {email});
      // await getScreens();
      setloading(false);
      // onNavigateNext();
    } catch (e) {
      setloading(false);
      Alert.alert(strings.Error, e);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}
      style={{flex: 1, backgroundColor: '#FFF'}}
      contentContainerStyle={{backgroundColor: '#FFF'}}>
      <SafeAreaView />
      <SkipHeader
        title={network.strings?.EmailScreen}
        withSkip={false}
        goBack={() => navigation.goBack()}
        isLoading={loading}
      />
      <ScrollView
        style={{backgroundColor: '#FFF'}}
        contentContainerStyle={{paddingTop: 8}}>
        <View style={{paddingHorizontal: 16}}>
          <Text style={styles.title}>{network.strings?.EmailScreenTitle}</Text>
          <TextInput
            style={[
              styles.input,
              {backgroundColor: inputColor, marginBottom: 32},
            ]}
            onFocus={() => setinputColor('#EEEEEE')}
            onBlur={() => setinputColor('#F5F5F5')}
            placeholder={network.strings?.EmailPlaceholder}
            autoFocus
            placeholderTextColor={Colors.grayColor}
            selectionColor={Colors.textColor}
            value={email}
            keyboardType={'email-address'}
            onChangeText={setEmail}
          />
        </View>
      </ScrollView>
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 13,
          paddingBottom: 8,
          justifyContent: 'flex-end',
          backgroundColor: '#FFF',
        }}>
        <Btn
          title={network.strings?.SignIn}
          onPress={login}
          customStyle={{borderRadius: 16}}
          customTextStyle={{fontWeight: '600', fontSize: 16, lineHeight: 19}}
          backgroundColor={Colors.yellow}
          underlayColor={Colors.underLayYellow}
          disabled={!common.validMail(email)}
          isLoading={loading}
        />
        {/* <Text
          style={styles.descr}
          disabled={loading}
          onPress={() => navigation.navigate('RecoverPassScreen')}>
          {network.strings?.RemindPassword}
        </Text> */}
      </View>
      <SafeAreaView backgroundColor={'#FFF'} />
    </KeyboardAvoidingView>
  );
});

export default EmailLoginScreen;

const styles = StyleSheet.create({
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 22,
    lineHeight: 26,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    marginBottom: 25,
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
  icon: {
    width: 26,
    height: 16,
  },
  iconContainer: {
    position: 'absolute',
    paddingHorizontal: 16,
    right: 0,
  },
});
