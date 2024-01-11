import React, {Component, useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  TouchableOpacity,
  Keyboard,
  SafeAreaView,
  TouchableWithoutFeedback,
  Alert,
  Share,
} from 'react-native';
import {
  FlatList,
  ScrollView,
  TextInput,
  TouchableHighlight,
} from 'react-native-gesture-handler';
import network, {updateAddress} from '../../Utilites/Network';
import {observer, Observer, useObserver} from 'mobx-react-lite';
import Colors from '../constants/Colors';
import {getBottomSpace, getStatusBarHeight} from 'react-native-iphone-x-helper';
import BottomListBtn from '../components/BottomListBtn';
import {AddressesModal} from '../components/MenuScreen/AddressesModal';
import {FloatingLabelInput} from 'react-native-floating-label-input';
import {CardsModal} from '../components/CardsModal';
import {strings} from '../../assets/localization/localization';

const PayScreen = observer(({navigation}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [addressesModal, setAddressesModal] = useState(false);
  const [entrance, setEntrance] = useState('');
  const [flat, setFlat] = useState('');
  const [floor, setFloor] = useState('');
  const [intercom, setIntercom] = useState('');
  const [comment, setComment] = useState('');
  const [isSave, setIsSave] = useState(true);
  const [isFullAddress, setIsFullAddress] = useState(false);
  const [cardsModal, setCardsModal] = useState(false);
  const accessData = async () => {
    if (!network.currentCard) {
      Alert.alert('Ошибка', 'Пожалуйста, добавьте карту');
      return true;
    }
    setIsLoading(true);
    try {
      const addressData = network.user?.addresses.find(
        item => item?.id == network.user?.address_active,
      );
      if (addressData) {
        if (
          addressData.flat != flat ||
          addressData.entrance != entrance ||
          addressData.floor != floor ||
          addressData.intercom != intercom
        ) {
          await updateAddress(addressData.id, entrance, floor, flat, intercom);
        }
        setIsLoading(false);
        navigation.navigate('OrderStatusScreen', {comment, addressData});
      } else {
        setIsLoading(false);
        Alert.alert('Ошибка', 'Пожалуйста, введите адрес доставки');
      }
    } catch (e) {
      setIsLoading(false);
      Alert.alert('Ошибка', e);
    }
  };

  useEffect(() => {
    if (network.user?.address_active) {
      const newAddress = network.user?.addresses.find(
        item => item?.id == network.user?.address_active,
      );
      if (newAddress) {
        setFlat(newAddress?.flat ?? '');
        setEntrance(newAddress?.entrance ?? '');
        setFloor(newAddress?.floor ?? '');
        setIntercom(newAddress?.intercom ?? '');
        newAddress?.has_full_address
          ? setIsFullAddress(true)
          : setIsFullAddress(false);
      }
    }
  }, [network.user?.address_active]);
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
        onPress={() => navigation.navigate('BasketScreen')}>
        <Image
          source={require('../../assets/icons/back.png')}
          style={{width: 20, height: 20, tintColor: Colors.textColor}}
        />
      </TouchableOpacity>
      <View style={{alignItems: 'center', alignSelf: 'center'}}>
        <Text style={styles.headerTitle}>{network.strings?.PaymentTitle}</Text>
      </View>
    </View>,
  ];

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={{flex: 1, backgroundColor: '#FFF'}}>
        <SafeAreaView style={{backgroundColor: '#FFF'}} />
        {header}
        <View style={{paddingBottom: 120, paddingHorizontal: 16, flex: 1}}>
          <TouchableOpacity
            style={styles.addressView}
            disabled={network.user?.address_active}
            onPress={() => setAddressesModal(true)}>
            <View style={{maxWidth: 18, marginRight: 16}}>
              <Image
                source={require('../../assets/icons/location.png')}
                style={{
                  width: 18,
                  height: 22,
                }}
              />
            </View>
            {network.user?.address_active ? (
              <Text style={[styles.addsTitle, {flex: 1}]} numberOfLines={1}>
                {network.user?.addresses.map(item =>
                  item?.id == network.user?.address_active
                    ? item?.full_address
                    : null,
                )}
              </Text>
            ) : (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  flex: 1,
                  alignItems: 'center',
                }}>
                <Text style={[styles.addsTitle]}>Выберите адрес</Text>
                <Image
                  source={require('../../assets/icons/goDown.png')}
                  style={{
                    width: 15,
                    height: 10,
                    transform: [{rotate: '-90deg'}],
                  }}
                />
              </View>
            )}
          </TouchableOpacity>
          {isFullAddress ? null : (
            <View style={{paddingLeft: 34}}>
              <View style={styles.line} />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                }}>
                <View style={{flex: 0.47}}>
                  <FloatingLabelInput
                    label={network.strings?.Entrance}
                    value={entrance}
                    onChangeText={value => setEntrance(value)}
                    keyboardType="numeric"
                    containerStyles={styles.input}
                    customLabelStyles={{
                      colorBlurred: '#9A9A9A',
                      colorFocused: '#9A9A9A',
                      fontSizeFocused: 10,
                      fontSizeBlurred: 16,
                    }}
                    labelStyles={[styles.inputText]}
                  />
                </View>
                <View style={{flex: 0.47}}>
                  <FloatingLabelInput
                    label={network.strings?.Floor}
                    value={floor}
                    keyboardType="numeric"
                    onChangeText={value => setFloor(value)}
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
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                }}>
                <View style={{flex: 0.47}}>
                  <FloatingLabelInput
                    label={network.strings?.Appartment}
                    value={flat}
                    keyboardType="numeric"
                    onChangeText={value => setFlat(value)}
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
                    label={network.strings?.Intercom}
                    maxLength={10}
                    value={intercom}
                    keyboardType="numbers-and-punctuation"
                    onChangeText={value => setIntercom(value)}
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
            </View>
          )}
          {/*<TouchableOpacity*/}
          {/*  activeOpacity={0.9}*/}
          {/*  style={{*/}
          {/*    paddingVertical: 16,*/}
          {/*    flexDirection: 'row',*/}
          {/*    alignItems: 'center',*/}
          {/*  }}*/}
          {/*  onPress={() => setIsSave(prev => !prev)}>*/}
          {/*  <View*/}
          {/*    style={{*/}
          {/*      width: 20,*/}
          {/*      height: 20,*/}
          {/*      borderRadius: 6,*/}
          {/*      backgroundColor: isSave ? '#7CB518' : '#D3D3D3',*/}
          {/*      alignItems: 'center',*/}
          {/*      justifyContent: 'center',*/}
          {/*    }}>*/}
          {/*    {isSave ? (*/}
          {/*      <Image*/}
          {/*        source={require('../../assets/icons/complete.png')}*/}
          {/*        style={{*/}
          {/*          width: 10,*/}
          {/*          height: 8,*/}
          {/*        }}*/}
          {/*      />*/}
          {/*    ) : null}*/}
          {/*  </View>*/}
          {/*  <Text style={[styles.saveText, {marginLeft: 16}]}>*/}
          {/*    Сохранить адрес для следующих заказов*/}
          {/*  </Text>*/}
          {/*</TouchableOpacity>*/}
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={require('../../assets/icons/comment.png')}
              style={{
                width: 22,
                height: 21,
                marginRight: 14,
              }}
            />
            <FloatingLabelInput
              label={network.strings?.Comment}
              value={comment}
              onChangeText={value => setComment(value)}
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
          <View style={{paddingTop: 20}}>
            <Text style={styles.payTitle}>{network.strings?.Payment}</Text>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                paddingVertical: 14,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
              onPress={() => {
                if (network.userCards.length) {
                  setCardsModal(true);
                } else {
                  navigation.navigate('AddCardScreen');
                }
              }}>
              {network.currentCard ? (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Image
                    source={{uri: network.currentCard?.system_logo}}
                    style={{
                      width: 40,
                      height: 26,
                      marginRight: 9,
                    }}
                  />
                  <Text style={styles.addressTitle}>
                    {network.currentCard.system +
                      ' ' +
                      network.currentCard.last_four}
                  </Text>
                </View>
              ) : (
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Image
                    source={require('../../assets/icons/addCard.png')}
                    style={{
                      width: 22,
                      height: 22,
                      marginRight: 9,
                    }}
                  />
                  <Text style={styles.addressTitle}>
                    {network.strings?.AddCreditCard}
                  </Text>
                </View>
              )}
              <Image
                source={require('../../assets/icons/goDown.png')}
                style={{
                  width: 15,
                  height: 10,
                  transform: [{rotate: '-90deg'}],
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
        <BottomListBtn
          navigation={navigation}
          title={network.strings?.Pay}
          fromBasket
          isLoading={network.isLoadingBasketInfo || isLoading}
          onPress={() => accessData()}
        />
        <AddressesModal
          modal={addressesModal}
          closeModal={() => setAddressesModal(false)}
          navigation={navigation}
        />
        <CardsModal
          modal={cardsModal}
          closeModal={() => setCardsModal(false)}
          navigation={navigation}
        />
      </View>
    </TouchableWithoutFeedback>
  );
});

export default PayScreen;

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
  addressTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 19,
    color: Colors.textColor,
  },
  addressView: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingVertical: 16,
  },
  line: {
    height: 0.5,
    backgroundColor: '#D3D3D3',
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
    fontWeight: '500',
    lineHeight: 14,
    color: Colors.textColor,
  },
  payTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Bold',
    }),
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 21,
    color: Colors.textColor,
  },
});
