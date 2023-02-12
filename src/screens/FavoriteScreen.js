import React, {Component, useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Platform,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import network, {getList} from '../../Utilites/Network';
import {observer, Observer, useObserver} from 'mobx-react-lite';
import {runInAction} from 'mobx';
import {Btn} from '../components/Btn';
import common from '../../Utilites/Common';
import Colors from '../constants/Colors';
import LinearGradient from 'react-native-linear-gradient';
import {getBottomSpace} from 'react-native-iphone-x-helper';
import FavorItem from '../components/FavoriteScreen/FavorItem';
import {FilterModal} from '../components/MenuScreen/FilterModal';
import BottomListBtn from '../components/BottomListBtn';
import {UnavailableProductsModal} from '../components/UnavailableProductsModal';
import {strings} from '../../assets/localization/localization';
import {SaleModal} from '../components/PayWallScreen/SaleModal';

const FavoriteScreen = observer(({navigation}) => {
  const [unavailableModal, setUnavailableModal] = useState(false);
  const [unavailableRecipe, setUnavailableRecipe] = useState({});
  const [saleModal, setSaleModal] = useState(false);

  const openRec = rec => {
    if (network.canOpenRec(rec)) {
      navigation.navigate('ReceptScreen', {rec: rec});
    } else if (network.paywalls?.paywall_sale_modal) {
      setSaleModal(true);
    } else {
      navigation.navigate('PayWallScreen', {
        data: network.paywalls[network.user?.banner?.type],
      });
    }
  };

  const listHandler = (isInBasket, recept) => {
    if (network.isBasketUser()) {
      const isUnavailable = network.unavailableRecipes.find(
        rec => rec.id == recept.id,
      );
      if (isInBasket || !isUnavailable) {
        network.basketHandle(
          isInBasket,
          recept.id,
          recept.persons,
          'FavoriteScreen',
        );
      } else {
        setUnavailableRecipe(recept);
        setUnavailableModal(true);
      }
    } else {
      // Если блюдо в списке, то удаляем. Если нет, то проверяем, можно ли его добавить(открыть)
      if (isInBasket) {
        network.deleteFromList(recept);
      } else if (network.canOpenRec(recept)) {
        network.addToList(recept);
      } else if (network.paywalls?.paywall_sale_modal) {
        setSaleModal(true);
      } else {
        navigation.navigate('PayWallScreen', {
          data: network.paywalls[network.user?.banner?.type],
        });
      }
    }
  };

  const header = [
    <View style={styles.header} key={'favorHeader'}>
      <TouchableOpacity
        activeOpacity={1}
        style={{
          position: 'absolute',
          left: 0,
          paddingVertical: 12,
          paddingHorizontal: 16,
          zIndex: 100,
        }}
        onPress={() => navigation.goBack()}>
        <Image
          source={require('../../assets/icons/goBack.png')}
          style={{width: 11, height: 18, tintColor: Colors.textColor}}
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {network.strings?.FavouritesHeadline}
      </Text>
    </View>,
  ];

  useEffect(() => {
    const onBlur = navigation.addListener('blur', () => {
      const newArr = [];
      for (let i = 0; i < network.favorDishes.length; i++) {
        let dish = network.favorDishes[i];
        runInAction(() => (dish.new = false));
        newArr.push(dish);
      }
      runInAction(() => (network.favorDishes = newArr));
    });
    return onBlur;
  }, [navigation]);

  return (
    <View style={{flex: 1, backgroundColor: '#FFF'}}>
      <SafeAreaView backgroundColor={'#FFF'} />
      {header}
      {network.favorDishes.length ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{padding: 16}}
          data={network.favorDishes}
          extraData={network.favorDishes}
          initialNumToRender={3}
          keyExtractor={(item, index) => item.id}
          renderItem={({item, index}) => (
            <FavorItem
              recept={item}
              onPress={() => openRec(item)}
              listHandler={listHandler}
              key={item?.id}
            />
          )}
        />
      ) : (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Image
            source={require('../../assets/img/emptyFavors.png')}
            style={{width: 112, height: 96, marginBottom: 19}}
          />
          <Text style={styles.title}>{network.strings?.FavoritesEmpty}</Text>
          <Text style={styles.subtitle}>
            {network.strings?.FavoritesEmptyDescr}
          </Text>
        </View>
      )}
      {network.isBasketUser() &&
      network?.basketInfo?.items_in_cart &&
      network.enableBasket() ? (
        <BottomListBtn key={'BottomListMenu'} navigation={navigation} />
      ) : !network.isBasketUser() && network.listDishes.length ? (
        <BottomListBtn key={'BottomListMenu'} navigation={navigation} />
      ) : null}
      <UnavailableProductsModal
        modal={unavailableModal}
        closeModal={() => setUnavailableModal(false)}
        unavailableRecipe={unavailableRecipe}
      />
      <SaleModal
        modal={saleModal}
        closeModal={() => setSaleModal(false)}
        navigation={navigation}
      />
    </View>
  );
});

export default FavoriteScreen;

const styles = StyleSheet.create({
  header: {
    height: 44,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
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
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 22,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    lineHeight: 25,
    color: Colors.textColor,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 12,
    lineHeight: 14,
    color: Colors.textColor,
    maxWidth: common.getLengthByIPhone7(260),
    textAlign: 'center',
  },
});
