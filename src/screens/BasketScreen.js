import React, {Component, useState, useRef, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  ImageBackground,
  SafeAreaView,
  Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  FlatList,
  ScrollView,
  TouchableHighlight,
} from 'react-native-gesture-handler';
import network, {
  basketClear,
  getBasket,
  getList,
  listClear,
} from '../../Utilites/Network';
import {observer, Observer, useObserver} from 'mobx-react-lite';
import common from '../../Utilites/Common';
import Colors from '../constants/Colors';
import DayRecipeCard from '../components/MenuScreen/DayRecipeCard';
import {getBottomSpace, getStatusBarHeight} from 'react-native-iphone-x-helper';
import BasketItem from '../components/BasketScreen/BasketItem';
import {ProductItem} from '../components/BasketScreen/ProductItem';
import BottomListBtn from '../components/BottomListBtn';
import {GreyBtn} from '../components/GreyBtn';
import Product from '../components/AddProductScreen/Product';
import {DeliveryModal} from '../components/BasketScreen/DeliveryModal';
import {ampInstance} from '../../App';
import {AboutIngrModal} from '../components/BasketScreen/AboutIngrModal';
import SearchBar from '../components/SearchBar';
import {strings} from '../../assets/localization/localization';

const BasketScreen = observer(({navigation, route}) => {
  const [deliveryModal, setDeliveryModal] = useState(false);
  const [isService, setIsService] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ingrModal, setIngrModal] = useState(false);
  const [currentProd, setCurrentProd] = useState(false);

  const productRecipes = useMemo(() => {
    if (currentProd?.recipe_id && currentProd.recipe_id.length) {
      const data = [];
      for (let i = 0; i < currentProd.recipe_id.length; i++) {
        const recId = currentProd.recipe_id[i];
        const prodRec = network.basketRecipes.find(
          basketRec => basketRec.id == recId,
        );
        prodRec ? data.push(prodRec) : null;
      }
      return data;
    } else {
      return [];
    }
  }, [currentProd]);
  const store = network.stores?.find(
    store => store.id == network.user?.store_id,
  );

  const onFetch = async () => {
    setIsLoading(true);
    try {
      await getBasket();
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  const addRecipe = async (isInBasket, recept) => {
    setIsLoading(true);
    try {
      await network.basketHandle(
        isInBasket,
        recept.id,
        recept.persons,
        'BasketScreen',
      );
      await getBasket();
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  const clearList = () => {
    Alert.alert(
      network.strings?.DeleteCartHeadline,
      network.strings?.DeleteCartText,
      [
        {text: network.strings?.DeleteButtonCancel},
        {
          text: network.strings?.DeleteButtonDelete,
          onPress: async () => {
            navigation.goBack();
            await basketClear();
            await getBasket();
          },
        },
      ],
    );
  };

  const openRec = rec => {
    if (network.canOpenRec(rec)) {
      navigation.navigate('ReceptScreen', {rec: rec});
    } else {
      navigation.navigate('PayWallScreen', {
        data: network.paywalls[network.user?.banner?.type],
      });
    }
  };
  const openProduct = product => {
    navigation.navigate('ChangeProductScreen', {product: product});
  };

  const renderAdds = (title, text, onPress, color, customStyle) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.addsView,
          {flexDirection: 'row', justifyContent: 'space-between'},
          customStyle,
        ]}>
        <Text style={styles.addsTitle}>{title}</Text>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text
            style={[
              styles.addsTitle,
              {marginRight: 8, color: color ? color : Colors.textColor},
            ]}>
            {text}
          </Text>
          <Image
            source={require('../../assets/icons/goBack.png')}
            style={{width: 8, height: 12, transform: [{rotate: '180deg'}]}}
          />
        </View>
      </TouchableOpacity>
    );
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
        <Text style={styles.headerTitle}>{network.strings?.ShoppingCart}</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          position: 'absolute',
          right: 0,
        }}>
        {/*<TouchableOpacity*/}
        {/*  activeOpacity={1}*/}
        {/*  style={{paddingLeft: 16, paddingVertical: 9, paddingRight: 10}}*/}
        {/*  onPress={() => navigation.navigate('AddProductScreen')}>*/}
        {/*  <Image*/}
        {/*    source={require('../../assets/icons/add.png')}*/}
        {/*    style={{width: 24, height: 24}}*/}
        {/*  />*/}
        {/*</TouchableOpacity>*/}
        <TouchableOpacity
          activeOpacity={1}
          style={{paddingHorizontal: 16, paddingVertical: 9}}
          onPress={() => clearList()}>
          <Image
            source={require('../../assets/icons/trash.png')}
            style={{width: 20, height: 24}}
          />
        </TouchableOpacity>
      </View>
    </View>,
  ];
  const mainScroll = useRef(null);
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      onFetch();
    });
    return unsubscribe;
  }, [navigation]);
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
        contentContainerStyle={{paddingBottom: 120}}
        ref={mainScroll}
        stickyHeaderIndices={[0]}>
        <View style={{backgroundColor: '#FFF', paddingBottom: 16}}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddProductScreen')}
            activeOpacity={0.9}
            style={{
              position: 'absolute',
              width: '100%',
              height: 35,
              zIndex: 100,
              top: 8,
            }}
          />
          <View style={{marginHorizontal: 16, marginTop: 8}}>
            <SearchBar
              placeholder={network.strings?.SearchProductPlaceholder}
              disabled
            />
          </View>
        </View>
        <FlatList
          showsHorizontalScrollIndicator={false}
          horizontal
          contentContainerStyle={{
            paddingLeft: 16,
            paddingBottom: 15,
            paddingRight: 6,
          }}
          data={network.basketRecipes}
          extraData={network.basketRecipes}
          keyExtractor={(item, index) => item.id}
          renderItem={({item, index}) => (
            <BasketItem recept={item} onPress={() => openRec(item)} />
          )}
        />
        {network.basketProducts.map((item, i) => {
          return (
            <>
              <Text
                style={{
                  ...styles.sectionTitle,
                  marginTop:
                    i > 0
                      ? common.getLengthByIPhone7(34)
                      : common.getLengthByIPhone7(12),
                }}
                key={item.id}>
                {item?.section_name}
              </Text>
              {item?.products
                ? item?.products.map(product => (
                    <ProductItem
                      item={product}
                      onPress={() => openProduct(product)}
                      openModal={() => {
                        setCurrentProd(product);
                        setIngrModal(true);
                      }}
                      key={product.id}
                    />
                  ))
                : null}
            </>
          );
        })}
        {renderAdds(
          `${network.strings?.WillBeDeliveredBy} ${store?.name}`,
          `${network?.basketInfo?.delivery_price}`,
          () => {
            setIsService(false);
            setDeliveryModal(true);
          },
          network.basketInfo?.delivery_price_color,
          {marginTop: 37},
        )}
        {renderAdds(
          network.strings?.ServiceFee,
          `${network?.basketInfo?.service_fee}`,
          () => {
            setIsService(true);
            setDeliveryModal(true);
          },
        )}
        {/*<Text style={[styles.sectionTitle, {marginTop: 22}]}>Что-то ещё ?</Text>*/}
        {/*<FlatList*/}
        {/*  showsHorizontalScrollIndicator={false}*/}
        {/*  horizontal*/}
        {/*  contentContainerStyle={{*/}
        {/*    paddingLeft: 16,*/}
        {/*    paddingBottom: 22,*/}
        {/*    paddingTop: 12,*/}
        {/*    paddingRight: 6,*/}
        {/*  }}*/}
        {/*  data={network.basketAddRecipes}*/}
        {/*  extraData={network.basketAddRecipes}*/}
        {/*  keyExtractor={(item, index) => item.id}*/}
        {/*  scrollEventThrottle={16}*/}
        {/*  pagingEnabled={true}*/}
        {/*  decelerationRate={Platform.select({ios: 'fast', android: 0.8})}*/}
        {/*  snapToInterval={*/}
        {/*    common.getLengthByIPhone7(0) - common.getLengthByIPhone7(32)*/}
        {/*  }*/}
        {/*  disableIntervalMomentum={true}*/}
        {/*  snapToAlignment={'center'}*/}
        {/*  snapToOffsets={network.basketAddRecipes.map(*/}
        {/*    (item, index) => index * 170,*/}
        {/*  )}*/}
        {/*  renderItem={({item, index}) => (*/}
        {/*    <DayRecipeCard*/}
        {/*      recept={item}*/}
        {/*      onPress={() => openRec(item)}*/}
        {/*      listHandler={async (isInBasket, recept) => {*/}
        {/*        await addRecipe(isInBasket, recept);*/}
        {/*        mainScroll?.current?.scrollTo({y: 0, animated: true});*/}
        {/*      }}*/}
        {/*      key={item.id}*/}
        {/*    />*/}
        {/*  )}*/}
        {/*/>*/}
        {!!network.basketAddProducts.length && (
          <>
            <Text style={[styles.sectionTitle, {marginTop: 22}]}>
              {network.strings?.AnythingElse}
            </Text>
            <FlatList
              showsHorizontalScrollIndicator={false}
              horizontal
              contentContainerStyle={{
                paddingLeft: 16,
                paddingBottom: 22,
                paddingTop: 12,
                paddingRight: 6,
              }}
              data={network.basketAddProducts}
              extraData={network.basketAddProducts}
              keyExtractor={(item, index) => item.id}
              scrollEventThrottle={16}
              pagingEnabled={true}
              decelerationRate={Platform.select({ios: 'fast', android: 0.8})}
              snapToInterval={
                common.getLengthByIPhone7(0) - common.getLengthByIPhone7(32)
              }
              disableIntervalMomentum={true}
              snapToAlignment={'center'}
              snapToOffsets={network.basketAddProducts.map(
                (item, index) => index * 170,
              )}
              renderItem={({item, index}) => (
                <View style={{width: 136, marginRight: 8}}>
                  <Product product={item} imageHeight={120} route={route} />
                </View>
              )}
            />
          </>
        )}
        <View style={styles.addsView}>
          <GreyBtn
            containerStyle={{flexDirection: 'row', padding: 10}}
            onPress={() => navigation.navigate('AddProductScreen')}>
            <Image
              source={require('../../assets/icons/add.png')}
              style={{width: 22, height: 22, marginRight: 4}}
            />
            <Text style={styles.addsTitle}>
              {network.strings?.AddProductButton}
            </Text>
          </GreyBtn>
        </View>
      </ScrollView>
      <BottomListBtn
        navigation={navigation}
        fromBasket
        isLoading={network.isLoadingBasketInfo || isLoading}
        onPress={() => {
          if (network.user?.phone) {
            navigation.navigate('LoginScreen', {
              from: 'PayScreen',
            });
          } else {
            navigation.navigate('PayScreen');
          }
          ampInstance.logEvent('checkout');
        }}
      />
      <DeliveryModal
        modal={deliveryModal}
        closeModal={() => setDeliveryModal(false)}
        store={store}
        isService={isService}
      />
      <AboutIngrModal
        modal={ingrModal}
        closeModal={() => setIngrModal(false)}
        dishes={productRecipes}
        ingredient={currentProd}
        onPress={dish => {
          setIngrModal(false);
          setTimeout(() => {
            navigation.navigate('ReceptScreen', {rec: dish});
          }, 500);
        }}
      />
    </View>
  );
});

export default BasketScreen;

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
  headerSubitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 12,
    lineHeight: 14,
    color: Colors.textColor,
  },
  addsView: {
    width: common.getLengthByIPhone7() - 32,
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: '#D3D3D3',
  },
  addsTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 19,
  },
  subtitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 22,
    lineHeight: 26,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
  },
  sectionTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 18,
    lineHeight: 21,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
});
