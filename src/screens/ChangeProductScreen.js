import React, {Component, useState, useMemo, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import {
  FlatList,
  ScrollView,
  TextInput,
  TouchableHighlight,
} from 'react-native-gesture-handler';
import {observer, Observer, useObserver} from 'mobx-react-lite';
import Colors from '../constants/Colors';
import {getBottomSpace, getStatusBarHeight} from 'react-native-iphone-x-helper';
import FastImage from 'react-native-fast-image';
import common from '../../Utilites/Common';
import {GreyBtn} from '../components/GreyBtn';
import network, {getAnalogues} from '../../Utilites/Network';
import {AboutIngrModal} from '../components/BasketScreen/AboutIngrModal';
import {strings} from '../../assets/localization/localization';

const AnalogueProduct = observer(({product, onPress, currentProduct}) => {
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      disabled={network.isLoadingProduct}>
      <View
        style={{
          flexDirection: 'row',
          paddingVertical: 10,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          flex: 1,
        }}
        collapsable={false}>
        <View style={{flexDirection: 'row', flexGrow: 0.9}}>
          <FastImage source={{uri: product?.images}} style={styles.image} />
          <View style={{flex: 0.8, justifyContent: 'space-between'}}>
            <Text
              collapsable={false}
              allowFontScaling={false}
              style={styles.text}
              numberOfLines={1}>
              {product?.name}
            </Text>
            <Text
              allowFontScaling={false}
              style={[styles.subText, {marginBottom: 5}]}>
              {product?.description}
            </Text>
            <Text allowFontScaling={false} style={styles.priceText}>
              {product?.total_price + network.strings?.Currency}
            </Text>
          </View>
        </View>
        <View style={{flexGrow: 0.1}}>
          {product?.id === network.isLoadingProduct ? (
            <ActivityIndicator color={Colors.textColor} />
          ) : (
            <View
              style={{
                width: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
                backgroundColor:
                  product?.id == currentProduct?.id
                    ? '#FFE600'
                    : Colors.grayColor,
              }}>
              {product?.id == currentProduct?.id ? (
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: Colors.textColor,
                  }}
                />
              ) : null}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const ChangeProductScreen = observer(({navigation, route}) => {
  const product = route?.params.product;
  const [currentProd, setCurrentProd] = useState(product);
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(false);
  const productRecipes = useMemo(() => {
    if (product?.recipe_id && product.recipe_id.length) {
      const data = [];
      for (let i = 0; i < product.recipe_id.length; i++) {
        const recId = product.recipe_id[i];
        const prodRec = network.basketRecipes.find(
          basketRec => basketRec.id == recId,
        );
        prodRec ? data.push(prodRec) : null;
      }
      return data;
    } else {
      return [];
    }
  }, [product]);
  const onFetch = async () => {
    const data = await getAnalogues(
      product?.ingredient_id,
      product?.ingredient_count,
    );
    setProducts(data);
  };
  const changeProduct = async newProduct => {
    await network.addProduct(
      newProduct,
      product?.ingredient_count,
      product?.ingredient_id,
      'changeProduct',
    );
    navigation.goBack();
  };
  useEffect(() => {
    if (product) {
      onFetch();
    }
  }, [product]);
  const header = [
    <View style={styles.header} key={'ChangeProductScreenHeader'}>
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
          source={require('../../assets/icons/close.png')}
          style={{width: 20, height: 20, tintColor: Colors.textColor}}
        />
      </TouchableOpacity>
      <View style={{alignItems: 'center', alignSelf: 'center'}}>
        <Text style={styles.headerTitle}>{network.strings?.Swap}</Text>
      </View>
    </View>,
  ];
  return (
    <View style={{flex: 1, backgroundColor: '#FFF'}}>
      {Platform.OS == 'ios' ? (
        <SafeAreaView
          style={{backgroundColor: '#FFF', height: getStatusBarHeight()}}
        />
      ) : (
        <SafeAreaView style={{backgroundColor: '#FFF'}} />
      )}
      {header}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
          paddingTop: 16,
          paddingHorizontal: 16,
        }}>
        <FastImage
          source={{uri: currentProd?.images}}
          style={styles.mainImage}
        />
        <Text allowFontScaling={false} style={styles.prodTitle}>
          {currentProd?.name}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginVertical: 8,
          }}>
          <Text allowFontScaling={false} style={styles.subText}>
            {currentProd?.description}
          </Text>
        </View>
        <Text
          allowFontScaling={false}
          style={[styles.priceText, {textAlign: 'center'}]}>
          {currentProd?.total_price
            ? currentProd?.total_price + network.strings?.Currency
            : ''}
        </Text>
        <View
          style={{flexWrap: 'wrap', alignSelf: 'center', marginVertical: 25}}>
          <GreyBtn
            title={network.strings?.ShowRecipes}
            containerStyle={{paddingHorizontal: 30, paddingVertical: 11}}
            onPress={() => setModal(true)}
            titleStyle={{marginVertical: 0, fontSize: 16, lineHeight: 19}}>
            {/*<ActivityIndicator />*/}
          </GreyBtn>
        </View>
        <Text allowFontScaling={false} style={styles.analogText}>
          {network.strings?.AvaliableAlternatives}
        </Text>
        {products.map(prod => (
          <AnalogueProduct
            product={prod}
            key={prod?.id}
            currentProduct={currentProd}
            onPress={() => {
              setCurrentProd(prod);
              changeProduct(prod);
            }}
          />
        ))}
      </ScrollView>
      <AboutIngrModal
        modal={modal}
        closeModal={() => setModal(false)}
        dishes={productRecipes}
        ingredient={currentProd}
        onPress={dish => {
          setModal(false);
          setTimeout(() => {
            navigation.navigate('ReceptScreen', {rec: dish});
          }, 500);
        }}
      />
    </View>
  );
});

export default ChangeProductScreen;

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
  mainImage: {
    width: common.getLengthByIPhone7(170),
    height: common.getLengthByIPhone7(170),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    alignSelf: 'center',
    marginBottom: 18,
  },
  prodTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontWeight: '500',
    fontSize: 18,
    lineHeight: 21,
    color: Colors.textColor,
    textAlign: 'center',
  },
  subText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 12,
    lineHeight: 14,
    color: Colors.grayColor,
  },
  priceText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 19,
    color: Colors.textColor,
  },
  analogText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 18,
    lineHeight: 21,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
  },
  text: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '500',
    color: Colors.textColor,
  },
  image: {
    width: 69,
    height: 69,
    borderRadius: 12,
    marginRight: 12,
    zIndex: 100,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
});
