import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {
  FlatList,
  ScrollView,
  TouchableHighlight,
} from 'react-native-gesture-handler';
import common from '../../../Utilites/Common';
import {getStatusBarHeight, getBottomSpace} from 'react-native-iphone-x-helper';
import Colors from '../../constants/Colors';
import {BlurView} from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import {observer} from 'mobx-react-lite';
import DropShadow from 'react-native-drop-shadow';
import network from '../../../Utilites/Network';
import {ShadowView} from '../ShadowView';
import {GreyBtn} from '../GreyBtn';
import {useInterval} from '../../screens/ReceptScreen';
import {runInAction} from 'mobx';
import {strings} from '../../../assets/localization/localization';

const Product = observer(
  ({product, imageWidth = '100%', imageHeight = 152, route}) => {
    const isLoading = network.isLoadingProduct == product?.id;
    const [count, setCount] = useState(product?.quantity);
    const [time, setTime] = useState(0);
    const [inBasket, setInBasket] = useState(false);
    useEffect(() => {
      let inBasketProduct = network.products_count.find(
        prod => prod.id == product.id,
      );
      if (inBasketProduct) {
        setTimeout(() => {
          setInBasket(true);
          setCount(inBasketProduct?.quantity);
        });
      }
    }, [product, network.isLoadingBasketInfo, network.basketProducts]);
    const delay = 500;
    useInterval(() => {
      if (time != 0) {
        const date = new Date();
        if (date - time > 500 && time != 0) {
          runInAction(() => network.changeProdCount(product.id, count));
          setTime(0);
        }
      }
    }, delay);
    const addProd = async () => {
      try {
        await network.addProduct(product, undefined, undefined, route?.name);
        // setInBasket(true);
      } catch (e) {
        setInBasket(false);
      }
    };
    const image = (
      <FastImage
        source={{uri: product?.images}}
        style={{
          width: imageWidth,
          height: imageHeight,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: '#EEEEEE',
          marginBottom: 8,
        }}
      />
    );
    const renderCounterWithPrice = () => {
      return (
        <View style={styles.countView}>
          <TouchableOpacity
            style={{paddingHorizontal: 12, paddingVertical: 8}}
            onPress={() => {
              setTime(new Date());
              setCount(prev =>
                prev - product?.quantum <= 0
                  ? 0
                  : parseFloat((prev - product?.quantum).toFixed(1)),
              );
            }}>
            <Image
              source={require('../../../assets/icons/plus.png')}
              style={{width: 12, height: 2}}
            />
          </TouchableOpacity>
          <Text style={styles.price}>{count}</Text>
          <TouchableOpacity
            style={{paddingHorizontal: 12, paddingVertical: 3}}
            onPress={() => {
              if (count + product?.quantum <= product?.count_in_stock) {
                setTime(new Date());
                setCount(prev =>
                  parseFloat((prev + product?.quantum).toFixed(1)),
                );
              }
            }}>
            <Image
              source={require('../../../assets/icons/plus.png')}
              style={{width: 12, height: 12}}
            />
          </TouchableOpacity>
        </View>
      );
    };
    useEffect(() => setInBasket(false), [product]);
    return (
      <>
        <ShadowView
          firstContStyle={{
            marginBottom: 8,
            flex: 1,
            backgroundColor: '#FFF',
          }}>
          <View style={{...styles.card}}>
            <View>
              {image}
              <Text style={styles.price}>
                {Math.round(
                  (count * product?.price + Number.EPSILON) *
                    parseInt('1' + '0'.repeat(network.priceDigits), 10),
                ) / parseInt('1' + '0'.repeat(network.priceDigits), 10)}
                {network.strings?.Currency}
              </Text>
              <Text style={styles.name} numberOfLines={2}>
                {product?.name}
              </Text>
            </View>
            <View>
              <Text style={styles.sub}>{product?.description}</Text>
              {inBasket && !isLoading ? (
                <View style={{marginTop: 10}}>{renderCounterWithPrice()}</View>
              ) : (
                <GreyBtn
                  title={isLoading ? '' : network.strings?.AddProductToBasket}
                  onPress={() => addProd()}
                  disabled={network.isLoadingProduct}
                  containerStyle={{
                    alignItems: 'center',
                    marginTop: 10,
                    paddingVertical: isLoading ? 8 : 4,
                  }}>
                  {isLoading ? (
                    <ActivityIndicator color={Colors.textColor} />
                  ) : null}
                </GreyBtn>
              )}
            </View>
          </View>
        </ShadowView>
      </>
    );
  },
);

export default Product;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 8,
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  price: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '500',
    color: Colors.textColor,
  },
  name: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '500',
    color: Colors.textColor,
    marginTop: 1,
    marginBottom: 4,
  },
  sub: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    color: Colors.grayColor,
  },
  countView: {
    backgroundColor: '#EEEEEE',
    borderRadius: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-between',
  },
});
