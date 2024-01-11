import {observer} from 'mobx-react-lite';
import React from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import {TouchableHighlight} from 'react-native-gesture-handler';
import common from '../../Utilites/Common';
import network from '../../Utilites/Network';
import Colors from '../constants/Colors';
import {strings} from '../../assets/localization/localization';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const BottomListBtn = observer(
  ({
    navigation,
    fromBasket = false,
    containerStyle = {},
    isLoading = false,
    onPress,
    title,
  }) => {
    const getPercent = (val1, val2) => {
      if (val1 && val2) {
        return (val1 / val2) * 100 > 100 ? 100 : (val1 / val2) * 100;
      }
      return 0;
    };
    const isMin =
      getPercent(
        network.basketInfo?.summa_in_cart,
        network.basketInfo?.delivery_free_min,
      ) >
      getPercent(
        network.basketInfo?.order_min,
        network.basketInfo?.delivery_free_min,
      );

    const isFree =
      getPercent(
        network.basketInfo?.summa_in_cart,
        network.basketInfo?.delivery_free_min,
      ) == 100;
    const insets = useSafeAreaInsets();

    if (!network.isBasketUser()) {
      return (
        <View style={[styles.container, {paddingBottom: 8 + insets.bottom}]}>
          <TouchableHighlight
            onPress={() => navigation.navigate('ListScreen')}
            style={{
              width: '100%',
              padding: 17,
              backgroundColor: Colors.yellow,
              borderRadius: 16,
            }}
            underlayColor={Colors.underLayYellow}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View
                style={{
                  paddingHorizontal: 4,
                  paddingTop: 2,
                  paddingBottom: 3,
                  borderRadius: 20,
                  backgroundColor: '#FFF',
                  marginRight: 7,
                  minWidth: 24,
                  alignItems: 'center',
                }}>
                <Text style={{...styles.listSubtitle}}>
                  {network.listDishes.length}
                </Text>
              </View>
              <Text style={styles.addsTitle}>
                {common.declOfNum(network.listDishes.length, [
                  network?.strings?.Recipe,
                  network?.strings?.Recipes,
                  network?.strings?.Recipes2,
                ])}{' '}
                {network?.strings?.ButtonListTitle}
              </Text>
            </View>
          </TouchableHighlight>
        </View>
      );
    }

    return (
      <View
        style={[
          styles.container,
          {paddingBottom: 8 + insets.bottom},
          containerStyle,
        ]}>
        <View
          style={[
            styles.line,
            {width: '100%', backgroundColor: '#EEEEEE', marginBottom: 5},
          ]}>
          <View
            style={[
              styles.line,
              {
                width:
                  getPercent(
                    network.basketInfo?.summa_in_cart,
                    network.basketInfo?.delivery_free_min,
                  ) + '%',
                backgroundColor: Colors.yellow,
                position: 'absolute',
                zIndex: 10,
              },
            ]}
          />
          <View
            style={[
              styles.line,
              {
                width:
                  getPercent(
                    network.basketInfo?.order_min,
                    network.basketInfo?.delivery_free_min,
                  ) + '%',
                backgroundColor: '#D3D3D3',
                position: 'absolute',
                zIndex: 5,
              },
            ]}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            paddingBottom: 8,
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={[
                styles?.orderSumText,
                {color: isMin ? Colors.textColor : Colors.grayColor},
              ]}>
              {network.basketInfo?.order_min_text +
                (isMin ? '' : network.basketInfo?.order_min_text_2)}
            </Text>
            {isMin ? (
              <Image
                source={require('../../assets/icons/complete.png')}
                style={{width: 12, height: 9}}
              />
            ) : null}
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text
              style={[
                styles?.orderSumText,
                {color: isFree ? Colors.textColor : Colors.grayColor},
              ]}>
              {network.basketInfo?.delivery_free_min_text +
                (isFree ? '' : network.basketInfo?.delivery_free_min_text_2)}
            </Text>
            {isFree ? (
              <Image
                source={require('../../assets/icons/complete.png')}
                style={{width: 12, height: 9}}
              />
            ) : null}
          </View>
        </View>
        <TouchableHighlight
          onPress={() =>
            onPress ? onPress() : navigation.navigate('BasketScreen')
          }
          style={styles.touchContainer}
          disabled={isLoading || network.isLoadingBasket}
          underlayColor={Colors.underLayYellow}>
          {isLoading || network.isLoadingBasket ? (
            <View>
              <ActivityIndicator color={'#FFF'} />
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={
                    fromBasket
                      ? require('../../assets/icons/listMenu.png')
                      : require('../../assets/icons/menu.png')
                  }
                  style={{
                    width: 22,
                    height: 20,
                    marginRight: 7,
                    tintColor: '#FFF',
                  }}
                />
                {fromBasket ? (
                  <Text style={styles.addsTitle}>
                    {network?.basketInfo?.delivery_time}
                  </Text>
                ) : network?.basketInfo?.recipes ? (
                  <Text style={styles.addsTitle}>
                    {network?.basketInfo?.recipes.length + ' '}
                    {common.declOfNum(network?.basketInfo?.recipes.length, [
                      network.strings?.Meal,
                      network.strings?.Meals,
                      network.strings?.Meals2,
                    ])}{' '}
                  </Text>
                ) : null}
              </View>
              <View style={styles.basketView}>
                <Text style={styles.basketText}>
                  {title
                    ? title
                    : fromBasket
                    ? network.strings?.CheckoutButton
                    : network.strings?.ShoppingCart}
                </Text>
              </View>
              <Text style={styles.priceText}>
                {network.basketInfo?.summa_in_cart}
                {network.strings?.Currency}
              </Text>
            </View>
          )}
        </TouchableHighlight>
      </View>
    );
  },
);

export default BottomListBtn;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#FFF',
    borderTopWidth: 0.5,
    borderColor: '#D3D3D3',
  },
  listSubtitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.textColor,
    lineHeight: 16,
  },
  touchContainer: {
    width: '100%',
    padding: 17,
    backgroundColor: Colors.yellow,
    borderRadius: 16,
  },
  addsTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 16,
    lineHeight: 19,
    color: '#FFF',
  },
  basketView: {
    position: 'absolute',
    alignItems: 'center',
    width: '100%',
  },
  basketText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 19,
    color: '#FFF',
  },
  priceText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 14,
    color: '#FFF',
    lineHeight: 18,
  },
  orderSumText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textColor,
    lineHeight: 14,
  },
  line: {
    height: 6,
    borderRadius: 3,
  },
});
