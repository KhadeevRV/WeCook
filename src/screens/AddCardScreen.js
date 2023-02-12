import React, {Component, useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  TouchableOpacity,
  ImageBackground,
  SafeAreaView,
  Dimensions,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import {
  FlatList,
  ScrollView,
  TextInput,
  TouchableHighlight,
} from 'react-native-gesture-handler';
import network, {
  addUserCard,
  getUserCards,
  getUserIP,
  sendCheck,
} from '../../Utilites/Network';
import {observer, Observer, useObserver} from 'mobx-react-lite';
import Colors from '../constants/Colors';
import {getBottomSpace, getStatusBarHeight} from 'react-native-iphone-x-helper';
import BottomListBtn from '../components/BottomListBtn';
import {Card} from 'react-native-cloudpayments-sdk';
import {
  CreditCardForm,
  Currency,
  CloudPaymentsApi,
} from 'react-native-cloudpayments-sdk';
import {GreyBtn} from '../components/GreyBtn';
import {FloatingLabelInput} from 'react-native-floating-label-input/index';
import {Btn} from '../components/Btn';
import {add} from 'react-native-reanimated';
import {useInterval} from './ReceptScreen';
import {runInAction} from 'mobx';
import {ampInstance} from '../../App';
import {strings} from '../../assets/localization/localization';

const AddCardScreen = observer(({navigation}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardDate, setCardDate] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const cardDateRef = useRef(null);
  const cardCVVRef = useRef(null);
  const [time, setTime] = useState(0);
  const [cardType, setCardType] = useState('');
  const delay = 500;

  const getCardImage = type => {
    switch (type) {
      case 'MasterCard':
        return (
          <Image
            style={{width: 40, height: 26}}
            source={require('../../assets/icons/MasterCard.png')}
          />
        );
      case 'Visa':
        return (
          <Image
            style={{width: 40, height: 26}}
            source={require('../../assets/icons/Visa.png')}
          />
        );
      case 'MIR':
        return (
          <Image
            style={{width: 40, height: 26}}
            source={require('../../assets/icons/Mir.png')}
          />
        );
      default:
        return null;
    }
  };

  useInterval(async () => {
    if (time != 0) {
      const date = new Date();
      if (date - time > 500 && time != 0) {
        const newCardType = await Card.cardType(cardNumber.replace(/\s+/g, ''));
        setCardType(newCardType);
        setTime(0);
      }
    }
  }, delay);
  const PAYMENT_JSON_DATA_CARD = {
    age: '24',
    name: network.user?.name ? network.user.name : 'Без Имени',
    phone: network.user?.phone ?? '',
  };

  const changeCardNumber = async text => {
    setCardNumber(text);
    setTime(new Date());
  };
  const header = [
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={1}
        style={{
          position: 'absolute',
          left: 0,
          paddingVertical: 9,
          paddingHorizontal: 16,
          zIndex: 100,
        }}
        onPress={() => navigation.goBack()}>
        <Image
          source={require('../../assets/icons/back.png')}
          style={{width: 20, height: 20, tintColor: Colors.textColor}}
        />
      </TouchableOpacity>
      <View style={{alignItems: 'center', alignSelf: 'center'}}>
        <Text style={styles.headerTitle}>
          {network.strings?.AddCardHeadline}
        </Text>
      </View>
    </View>,
  ];
  const mainScroll = useRef(null);

  const checkCard = async () => {
    const isCardNumber = await Card.isCardNumberValid(
      cardNumber.replace(/\s+/g, ''),
    );
    const isExpDate = await Card.isExpDateValid(cardDate); // expDate в формате MM/yy
    return isExpDate && isCardNumber;
  };

  const sendError = text => {
    Alert.alert('Ошибка', text);
  };

  const addCard = async () => {
    setIsLoading(true);
    let PAYMENT_DATA_CARD = {
      publicId: 'pk_bcfec0a71bc8227680280ae03ecec',
      accountId: '9874994696',
      description: 'Test',
      applePayMerchantId: 'merchant',
      ipAddress: '0.0.0.0',
      invoiceId: '123',
      cardHolderName: 'test testov',
    };
    try {
      const ip = await getUserIP();
      ip ? (PAYMENT_DATA_CARD.ipAddress = ip) : null;
      const cloudPaymentsApi = await CloudPaymentsApi.initialApi(
        PAYMENT_DATA_CARD,
        PAYMENT_JSON_DATA_CARD,
      );
      cloudPaymentsApi.setDetailsOfPayment({
        currency: Currency.ruble,
        totalAmount: '1',
      });
      const cryptogramPacket = await Card.makeCardCryptogramPacket({
        cardNumber: cardNumber.replace(/\s+/g, ''),
        expDate: cardDate,
        cvv: cardCVV,
        merchantId: 'pk_bcfec0a71bc8227680280ae03ecec',
      });
      const isValid = await checkCard();
      if (isValid) {
        const results = await cloudPaymentsApi.charge(cryptogramPacket, '');
        const resultModel = Platform.select({
          ios: results.model,
          android: results.transaction,
        });
        console.log(resultModel);
        const {TransactionId, PaRes} = await Card.requestThreeDSecure({
          transactionId: resultModel.transactionId,
          paReq: resultModel.paReq,
          acsUrl: resultModel.acsUrl,
        });
        const {Token, CardFirstSix, CardLastFour, CardExpDate, CardType} =
          await sendCheck(TransactionId, PaRes);
        await addUserCard(
          Token,
          CardFirstSix,
          CardLastFour,
          CardExpDate,
          CardType,
        );
        await getUserCards();
        ampInstance.logEvent('credit card added');
        navigation.goBack();
      } else {
        sendError(network.strings?.AddCardError);
      }
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
      console.log(e);
      sendError(e);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          flex: 1,
          backgroundColor: '#FFF',
        }}>
        {Platform.OS == 'ios' ? (
          <SafeAreaView
            style={{backgroundColor: '#FFF', height: getStatusBarHeight()}}
          />
        ) : (
          <SafeAreaView style={{backgroundColor: '#FFF'}} />
        )}
        {header}
        <View style={{paddingBottom: 120, paddingHorizontal: 16, flex: 1}}>
          <View style={{position: 'absolute', top: 16, right: 16}}>
            {getCardImage(cardType)}
          </View>
          <FloatingLabelInput
            label={network.strings?.CardNumber}
            value={cardNumber}
            mask="9999 9999 9999 9999"
            onChangeText={value => {
              if (value.length === 19) {
                cardDateRef.current?.focus();
              }
              changeCardNumber(value);
            }}
            containerStyles={styles.input}
            keyboardType="numeric"
            customLabelStyles={{
              colorBlurred: '#9A9A9A',
              colorFocused: '#9A9A9A',
              fontSizeFocused: 10,
              fontSizeBlurred: 16,
            }}
            labelStyles={styles.inputText}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}>
            <View style={{flex: 0.47}}>
              <FloatingLabelInput
                label={network.strings?.Expired}
                ref={cardDateRef}
                value={cardDate}
                mask="99/99"
                keyboardType="numeric"
                onChangeText={value => {
                  if (value.length === 5) {
                    cardCVVRef.current?.focus();
                  }
                  setCardDate(value);
                }}
                containerStyles={styles.input}
                customLabelStyles={{
                  colorBlurred: '#9A9A9A',
                  colorFocused: '#9A9A9A',
                  fontSizeFocused: 10,
                  fontSizeBlurred: 16,
                }}
                labelStyles={styles.inputText}
              />
            </View>
            <View style={{flex: 0.47}}>
              <FloatingLabelInput
                label={network.strings?.CVV}
                value={cardCVV}
                ref={cardCVVRef}
                keyboardType="numeric"
                onChangeText={value => setCardCVV(value)}
                containerStyles={styles.input}
                customLabelStyles={{
                  colorBlurred: '#9A9A9A',
                  colorFocused: '#9A9A9A',
                  fontSizeFocused: 10,
                  fontSizeBlurred: 16,
                }}
                labelStyles={styles.inputText}
              />
            </View>
          </View>
          <View
            style={{
              paddingVertical: 20,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Image
              style={{width: 14, height: 18, marginRight: 9}}
              source={require('../../assets/icons/longLock.png')}
            />
            <Text style={styles.saveText}>{network.strings?.SecurityText}</Text>
          </View>
        </View>
        <View
          style={{
            paddingBottom: 9,
            paddingHorizontal: 16,
          }}>
          <Btn
            backgroundColor={Colors.yellow}
            title={network.strings?.AddCardButton}
            onPress={addCard}
            disabled={
              isLoading || !cardNumber || !cardDate || cardCVV.length !== 3
            }
            underlayColor={Colors.underLayYellow}
          />
        </View>
      </KeyboardAvoidingView>
      <View style={{height: getBottomSpace(), backgroundColor: '#FFF'}} />
    </>
  );
});

export default AddCardScreen;

const styles = StyleSheet.create({
  header: {
    height: 44,
    width: '100%',
    backgroundColor: '#FFF',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
  },
  input: {
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderColor: '#D3D3D3',
  },
  inputText: {
    fontWeight: '500',
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
  },
  saveText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    color: Colors.grayColor,
  },
});
