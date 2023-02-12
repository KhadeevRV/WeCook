import React, {useState, useEffect, useRef} from 'react';
import {
  Platform,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Pressable,
  AsyncStorage,
} from 'react-native';
import Colors from '../../constants/Colors';
import common from '../../../Utilites/Common';
import FastImage from 'react-native-fast-image';
import {runInAction} from 'mobx';
import network from '../../../Utilites/Network';
import {useInterval} from '../../screens/ReceptScreen';
import {observer} from 'mobx-react-lite';
import {strings} from '../../../assets/localization/localization';

export const ProductItem = observer(
  ({item, onPress = () => null, display = 'flex', openModal = () => null}) => {
    const [currentItem, setcurrentItem] = useState(item);
    const [count, setCount] = useState(item?.quantity);
    const [time, setTime] = useState(0);
    const notInShop = item?.count_in_stock == 0;
    const opacity = notInShop || count === 0 ? 0.25 : 1;
    useEffect(() => {
      let inBasketProduct = network.products_count.find(
        prod => prod.id == item.id,
      );
      if (inBasketProduct) {
        setCount(inBasketProduct?.quantity);
      } else {
        setCount(item?.quantity);
      }
    }, [item, network.isLoadingBasketInfo, network.basketProducts]);
    const delay = 500;
    useInterval(() => {
      if (time != 0) {
        const date = new Date();
        if (date - time > 500 && time != 0) {
          runInAction(() => network.changeProdCount(currentItem?.id, count));
          setTime(0);
        }
      }
    }, delay);
    const renderCounterWithPrice = () => {
      return (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {count === 0 && !notInShop ? (
              <TouchableOpacity
                onPress={() => {
                  setTime(new Date());
                  setCount(item?.quantum);
                }}>
                <View style={[styles.countView, {paddingHorizontal: 6}]}>
                  <Image
                    source={require('../../../assets/icons/refresh.png')}
                    style={{width: 17, height: 16, marginRight: 4}}
                  />
                  <Text style={styles.text}>
                    {network.strings?.ReturnProduct}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.countView}>
                <TouchableOpacity
                  style={[styles.absoluteBtn, {left: 0}]}
                  onPress={() => {
                    setTime(new Date());
                    setCount(prev =>
                      prev - item?.quantum <= 0
                        ? 0
                        : parseFloat((prev - item?.quantum).toFixed(1)),
                    );
                  }}>
                  <Image
                    source={require('../../../assets/icons/plus.png')}
                    style={{width: 12, height: 2, opacity: notInShop ? 0.5 : 1}}
                  />
                </TouchableOpacity>
                <Text style={styles.countText}>{count}</Text>
                <TouchableOpacity
                  style={[styles.absoluteBtn, {right: 0}]}
                  onPress={() => {
                    if (count + item?.quantum <= item?.count_in_stock) {
                      setTime(new Date());
                      setCount(prev =>
                        parseFloat((prev + item?.quantum).toFixed(1)),
                      );
                    }
                  }}>
                  <Image
                    source={require('../../../assets/icons/plus.png')}
                    style={{
                      width: 12,
                      height: 12,
                      opacity: notInShop ? 0.5 : 1,
                    }}
                  />
                </TouchableOpacity>
              </View>
            )}
            {notInShop || count === 0 ? null : (
              <Image
                source={require('../../../assets/icons/return.png')}
                style={{width: 18, height: 16, marginLeft: 16}}
              />
            )}
          </View>
          {notInShop ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Image
                style={{
                  width: 11,
                  height: 11,
                  marginRight: 4,
                }}
                source={require('../../../assets/icons/unavailable.png')}
              />
              <Text style={[styles.subText, {color: Colors.redColor}]}>
                {network.strings?.OutOfStock}
              </Text>
            </View>
          ) : (
            <Text style={[styles.countText, {opacity}]}>
              {Math.round(
                (count * item?.price + Number.EPSILON) *
                  parseInt('1' + '0'.repeat(network.priceDigits), 10),
              ) / parseInt('1' + '0'.repeat(network.priceDigits), 10)}
              {network.strings?.Currency}
            </Text>
          )}
        </View>
      );
    };
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => (notInShop ? openModal() : onPress())}
        style={{display: display}}>
        <View style={styles.rowFront} collapsable={false}>
          <FastImage
            source={{uri: item?.images}}
            style={[styles.image, {opacity}]}
          />
          <View style={{justifyContent: 'space-between', flexGrow: 1}}>
            <Text
              collapsable={false}
              allowFontScaling={false}
              style={[styles.text, {opacity}]}
              numberOfLines={1}>
              {item?.name}
            </Text>
            {count && !notInShop ? (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  width: 24,
                  height: 40,
                  paddingTop: 6,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setTime(new Date());
                  setCount(0);
                }}>
                <Image
                  source={require('../../../assets/icons/closeProduct.png')}
                  style={{width: 12, height: 12, tintColor: '#9A9A9A'}}
                />
              </TouchableOpacity>
            ) : null}
            <Text
              allowFontScaling={false}
              style={{
                ...styles.subText,
                opacity,
              }}>
              {item?.description}
            </Text>
            {renderCounterWithPrice()}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  text: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '500',
    maxWidth: common.getLengthByIPhone7(250),
    color: Colors.textColor,
  },
  subText: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    color: Colors.grayColor,
  },
  buyText: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '500',
    color: '#FFF',
  },
  rowFront: {
    height: 88,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 12,
    zIndex: 100,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  countView: {
    backgroundColor: '#EEEEEE',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 38,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    fontFamily: Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Medium',
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '500',
    color: Colors.textColor,
  },
  absoluteBtn: {
    position: 'absolute',
    padding: 12,
  },
});
