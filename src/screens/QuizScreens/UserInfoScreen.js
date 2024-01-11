import React, {useMemo, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import network, {sendDataToUrl} from '../../../Utilites/Network';
import {observer} from 'mobx-react-lite';
import {Btn} from '../../components/Btn';
import SkipHeader from '../../components/SkipHeader';
import Colors from '../../constants/Colors';
import common from '../../../Utilites/Common';

const UserInfoScreen = observer(({navigation, route}) => {
  const [input, setInput] = useState('');
  const [step, setStep] = useState(0);
  const [loading, setloading] = useState(false);
  const [inputColor, setinputColor] = useState('#F5F5F5');

  const screen = network.registerOnboarding?.UserInfoScreen;
  const withBack =
    Object.keys(network.registerOnboarding)[0] !== 'UserInfoScreen';
  const fields = screen?.fields;

  const currentField = useMemo(() => {
    if (fields && fields[step]) {
      return fields[step];
    }
    return null;
  }, [fields, step]);

  const onNext = async () => {
    try {
      setloading(true);
      await sendDataToUrl({
        url: fields[step].route,
        data: {[fields[step].key]: input},
      });
      setInput('');
      setloading(false);
      if (step + 1 === fields?.length) {
        navigation.navigate(screen?.next_board);
        setStep(0);
        return;
      }
      setStep(prev => prev + 1);
    } catch (e) {
      console.log(e);
      setloading(false);
      Alert.alert(network.strings?.Error, e);
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
        withBack={!!withBack}
        title={currentField ? currentField?.title : ''}
        goBack={() => navigation.goBack()}
        withSkip={false}
      />
      <View style={{padding: 16}}>
        <Text style={styles.title}>
          {currentField ? currentField?.label : ''}
        </Text>
        <TextInput
          style={[styles.input, {backgroundColor: inputColor}]}
          onFocus={() => setinputColor('#EEEEEE')}
          onBlur={() => setinputColor('#F5F5F5')}
          placeholder={currentField ? currentField?.placeholder : ''}
          selectionColor={Colors.textColor}
          value={input}
          onChangeText={setInput}
          autoFocus={true}
          keyboardType={
            currentField?.key == 'email' ? 'email-address' : 'default'
          }
        />
      </View>
      <Btn
        title={currentField ? currentField?.button_text : null}
        onPress={() => onNext()}
        isLoading={loading}
        customStyle={{
          borderRadius: 16,
          width: common.getLengthByIPhone7(140),
          alignSelf: 'center',
          backgroundColor: currentField
            ? currentField?.button_background
            : '#FFF',
          marginTop: 26,
        }}
        customTextStyle={{
          fontSize: 16,
          lineHeight: 19,
          color: currentField ? currentField?.button_text_color : '#FFF',
        }}
        backgroundColor={Colors.yellow}
        underlayColor={Colors.underLayYellow}
        disabled={!input.length}
      />
      <SafeAreaView backgroundColor={'#FFF'} />
    </KeyboardAvoidingView>
  );
});

export default UserInfoScreen;

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
