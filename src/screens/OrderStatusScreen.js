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
  Share,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import {
  FlatList,
  ScrollView,
  TextInput,
  TouchableHighlight,
} from 'react-native-gesture-handler';
import network, {
  cancelUserOrder,
  createOrder,
  getUserInfo,
} from '../../Utilites/Network';
import {observer, Observer, useObserver} from 'mobx-react-lite';
import Colors from '../constants/Colors';
import {getBottomSpace, getStatusBarHeight} from 'react-native-iphone-x-helper';
import Spinner from 'react-native-loading-spinner-overlay';
import * as Progress from 'react-native-progress';
import {ShadowView} from '../components/ShadowView';
import BottomListBtn from '../components/BottomListBtn';
import {ampInstance} from '../../App';
import {GreyBtn} from '../components/GreyBtn';
import common from '../../Utilites/Common';
import {strings} from '../../assets/localization/localization';

export const statuses = [
  {
    id: 1,
    text: 'Confirmed',
    icon: require('../../assets/icons/ordersIcons/accept.png'),
    width: 20,
    height: 24,
    statusName: 'new',
  },
  {
    id: 2,
    text: 'Collected',
    icon: require('../../assets/icons/ordersIcons/assembled.png'),
    width: 22,
    height: 22,
    statusName: 'completed',
  },
  {
    id: 3,
    text: 'InDelivery',
    icon: require('../../assets/icons/ordersIcons/onWay.png'),
    width: 23,
    height: 21,
    statusName: 'onway',
  },
  {
    id: 4,
    text: 'Delivered',
    icon: require('../../assets/icons/ordersIcons/delivered.png'),
    width: 22,
    height: 19,
    statusName: 'delivered',
  },
];

const OrderStatusScreen = observer(({navigation, route}) => {
  const comment = route.params?.comment;
  const fromMenu = route.params?.fromMenu;
  const addressData = route.params?.addressData;
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(!fromMenu);
  const [isLoadingCancel, setIsLoadingCancel] = useState(false);
  const [data, setData] = useState({});
  const canCancel = fromMenu
    ? network?.user?.orders_active?.find(
        order => order?.id_in_table == data?.id_in_table,
      )?.can_cancel
    : data?.can_cancel;
  const currentStatusId = fromMenu
    ? statuses.find(status => status.statusName == data?.status)?.id
    : 1;
  const onFetch = async () => {
    try {
      const basketInfo = network.basketInfo;
      const products = network.basketProducts.filter(
        prod => prod.count && prod?.count_in_stock != 0,
      );
      const orderData = await createOrder(
        addressData?.id,
        network.currentCard.id,
        comment,
      );
      setData(orderData);
      await getUserInfo();
      setIsLoading(false);
      ampInstance.logEvent('order confirmed', {
        amount: orderData?.price,
        recipe_id: JSON.stringify(basketInfo.recipes),
        products: JSON.stringify(products),
        status: orderData?.status,
      });
    } catch (e) {
      setIsLoading(false);
      setError(e);
    }
  };

  const cancelOrder = async () => {
    setIsLoadingCancel(true);
    try {
      const message = await cancelUserOrder(data?.id_in_table);
      await getUserInfo();
      setIsLoadingCancel(false);
      Alert.alert(network.strings?.CancelAlert, message, [
        {
          text: network.strings?.CancelledOK,
          onPress: () => navigation.navigate('MenuScreen'),
        },
      ]);
    } catch (e) {
      setIsLoadingCancel(false);
      Alert.alert('Ошибка', e);
    }
  };

  useEffect(() => {
    if (fromMenu) {
      setData(route?.params?.data);
    } else {
      onFetch();
    }
  }, []);

  return (
    <View style={{flex: 1, backgroundColor: '#FFF', paddingHorizontal: 16}}>
      {Platform.OS == 'ios' ? (
        <SafeAreaView
          style={{backgroundColor: '#FFF', height: getStatusBarHeight()}}
        />
      ) : (
        <SafeAreaView style={{backgroundColor: '#FFF'}} />
      )}
      {isLoading ? (
        <>
          <Text style={styles.headerTitle}>
            {network.strings?.PaymentProcess}
          </Text>
          <View
            style={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ShadowView
              firstContStyle={{
                width: 56,
                height: 56,
                borderRadius: 50,
                marginBottom: 24,
              }}
              secondContStyle={{
                width: 56,
                height: 56,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 50,
              }}>
              <Progress.CircleSnail
                size={28}
                color={Colors.yellow}
                style={{alignSelf: 'center'}}
                thickness={2}
              />
            </ShadowView>
            <Text style={styles.commonText}>
              {network.strings?.PaymentProcessMessage}
            </Text>
          </View>
        </>
      ) : error ? (
        <View
          style={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text style={[styles.title, {marginBottom: 20}]}>
            {network?.strings?.Error}
          </Text>
          <Text style={styles.commonText}>{error.toString()}</Text>
        </View>
      ) : (
        <>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 9,
            }}>
            <Text style={[styles.headerTitle]}>
              {network.strings?.YourOrder}
            </Text>
            <TouchableOpacity
              disabled={isLoadingCancel}
              style={{
                position: 'absolute',
                paddingHorizontal: 17,
                top: 0,
                left: 0,
              }}
              onPress={() => navigation.navigate('MenuScreen')}>
              <Image
                style={{width: 18, height: 18, tintColor: Colors.textColor}}
                source={require('../../assets/icons/close.png')}
              />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexGrow: 1,
              justifyContent: 'space-between',
            }}>
            <Text style={[styles.title, {marginTop: 30}]}>
              {data?.message_top}
            </Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginHorizontal: 34,
              }}>
              {statuses.map(status => (
                <View key={status.id} style={{alignItems: 'center'}}>
                  <View
                    style={[
                      styles.statusContainer,
                      {
                        backgroundColor:
                          status.id <= currentStatusId ? '#7CB518' : '#F5F5F5',
                      },
                    ]}>
                    <Image
                      style={{width: status.width, height: status.height}}
                      source={status.icon}
                    />
                  </View>
                  <Text style={styles.statusText}>
                    {network.strings.hasOwnProperty(status.text)
                      ? network.strings[status.text]
                      : ''}
                  </Text>
                </View>
              ))}
            </View>
            {canCancel ? (
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <GreyBtn
                  title={
                    isLoadingCancel
                      ? network.strings?.Loading + '   '
                      : network.strings?.CancelOrder
                  }
                  titleStyle={{marginVertical: 0, fontSize: 16, lineHeight: 19}}
                  onPress={() =>
                    Alert.alert(
                      network.strings?.CancelOrder,
                      network.strings?.CancelAlertQuest,
                      [
                        {
                          text: network.strings?.CancelAlertCancel,
                          style: 'cancel',
                        },
                        {
                          text: network.strings?.Yes,
                          onPress: () => cancelOrder(),
                        },
                      ],
                    )
                  }
                  containerStyle={{
                    paddingVertical: 11,
                    paddingHorizontal: 50,
                    alignItems: 'center',
                  }}
                />
              </View>
            ) : null}
            <Text style={[styles.commonText, {marginBottom: 32}]}>
              {data?.message_bottom}
            </Text>
          </View>
        </>
      )}
      {!isLoading ? (
        <View style={{paddingBottom: getBottomSpace() + 8}}>
          <TouchableHighlight
            onPress={() => navigation.navigate('MenuScreen')}
            style={styles.touchContainer}
            disabled={isLoading}
            underlayColor={Colors.underLayYellow}>
            <Text style={styles.touchText}>{network.strings?.OkButton}</Text>
          </TouchableHighlight>
        </View>
      ) : null}
    </View>
  );
});

export default OrderStatusScreen;

const styles = StyleSheet.create({
  headerTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
    alignSelf: 'center',
  },
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 22,
    lineHeight: 26,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
    alignSelf: 'center',
    textAlign: 'center',
  },
  commonText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '500',
    color: Colors.textColor,
    textAlign: 'center',
  },
  statusText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    color: Colors.textColor,
  },
  touchContainer: {
    backgroundColor: Colors.yellow,
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
  },
  touchText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '500',
    color: '#FFF',
    textAlign: 'center',
  },
  statusContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
});
