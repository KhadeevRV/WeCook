import React, {Component, useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import {
  FlatList,
  ScrollView,
  TextInput,
  TouchableHighlight,
} from 'react-native-gesture-handler';
import {observer, Observer, useObserver} from 'mobx-react-lite';
import {runInAction} from 'mobx';
import {Btn} from '../components/Btn';
import common from '../../Utilites/Common';
import Colors from '../constants/Colors';
import network, {
  getBasket,
  getList,
  getStoresByCoords,
  getUnavailableProducts,
  getUserInfo,
  setUserAddress,
  updateInfo,
} from '../../Utilites/Network';
import {ShadowView} from '../components/ShadowView';
import {ampInstance} from '../../App';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const StoreView = ({
  store,
  onPress = () => null,
  isSelect = false,
  isCurrent = false,
}) => {
  const isAvailable = store?.hasOwnProperty('is_available')
    ? store.is_available
    : true;
  return (
    <ShadowView firstContStyle={{marginHorizontal: 16, marginTop: 16}}>
      <TouchableOpacity
        onPress={onPress}
        disabled={!isAvailable}
        style={styles.storeContainer}>
        <View style={{flexDirection: 'row', flex: 0.9}}>
          <Image
            source={{uri: store?.logo}}
            resizeMode={'contain'}
            style={{
              width: 96,
              height: 32,
              marginRight: 16,
              opacity: isAvailable ? 1 : 0.5,
            }}
          />
          {isAvailable ? (
            <View>
              <Text
                style={[
                  styles.storeText,
                  {fontWeight: 'bold', marginBottom: 2},
                ]}>
                {network.strings?.DeliveryInfo}:
              </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={require('../../assets/icons/clock.png')}
                  style={{
                    width: 17,
                    height: 17,
                    marginRight: 7,
                    tintColor: Colors.textColor,
                  }}
                />
                <Text style={[styles.storeText, {fontWeight: 'bold'}]}>
                  {store?.delivery_time}
                </Text>
              </View>
            </View>
          ) : (
            <View />
          )}
        </View>
        {isAvailable ? (
          <View style={{flex: 0.1, alignItems: 'flex-end'}}>
            {isSelect ? (
              <View
                style={[
                  styles.dotContainer,
                  {backgroundColor: isCurrent ? '#7CB518' : Colors.grayColor},
                ]}>
                {isCurrent ? (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: '#FFF',
                    }}
                  />
                ) : null}
              </View>
            ) : (
              <Image
                source={require('../../assets/icons/goBack.png')}
                style={{
                  width: 8,
                  height: 12,
                  transform: [{rotate: '180deg'}],
                }}
              />
            )}
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View style={styles.laterView}>
              <Text style={styles.laterText}>
                {network.strings?.ComingSoon}
              </Text>
            </View>
            <View
              style={{
                width: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
                backgroundColor: Colors.grayColor,
                marginLeft: 16,
              }}
            />
          </View>
        )}
      </TouchableOpacity>
    </ShadowView>
  );
};

const StoresScreen = observer(({navigation, route}) => {
  const title = route?.params?.title;
  const insets = useSafeAreaInsets();
  const [stores, setStores] = useState(route?.params?.stores);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStores, setIsLoadingStores] = useState(false);
  const [currentStore, setCurrentStore] = useState(() => {
    if (network.isBasketUser()) {
      return route?.params?.currentStore ?? route?.params?.stores[0].id;
    }
    return null;
  });
  const [isList, setIsList] = useState(!network.isBasketUser());
  const coords = route?.params?.coords;
  const fullAddress = route?.params?.fullAddress;
  const fromOnboarding = route.params?.fromOnboarding;
  const screen = network.registerOnboarding?.MapScreen;

  const onFetch = async () => {
    try {
      setIsLoadingStores(true);
      const newStores = await getStoresByCoords(coords.lat, coords.lon);
      setIsLoadingStores(false);
      setStores(newStores);
    } catch (e) {
      setIsLoadingStores(false);
      Alert.alert('Ошибка', e);
    }
  };

  const onNavigate = (adrResp = null, fromList) => {
    if (fromOnboarding) {
      navigation.navigate(screen?.next_board ?? 'MainStack');
      return;
    }
    if (adrResp || fromList) {
      adrResp ? Alert.alert(network?.strings?.Success, adrResp?.message) : null;
      navigation.navigate('MenuScreen');
    } else {
      navigation.goBack();
    }
  };

  const confirmStore = async () => {
    setIsLoading(true);
    try {
      let adrResp = null;
      if (currentStore) {
        if (!network.isBasketUser()) {
          await updateInfo('work_type', 'delivery');
          await getBasket();
        }
        await updateInfo('store_id', currentStore);
        if (route?.params?.stores) {
          adrResp = await setUserAddress(
            coords.lat,
            coords.lon,
            title,
            fullAddress,
          );
        }
        await getUnavailableProducts();
      } else {
        await updateInfo('work_type', 'list');
        await getList();
      }
      await getUserInfo();
      setIsLoading(false);
      onNavigate(adrResp, !currentStore);
      ampInstance.logEvent('retailer confirmed', {
        retailer: isList
          ? 'List'
          : stores.find(store => store.id == currentStore)?.name,
      });
    } catch (e) {
      setIsLoading(false);
      Alert.alert('Ошибка', e);
    }
  };

  const header = [
    <View style={styles.header} key={'StoreScreenHeader'}>
      <TouchableOpacity
        activeOpacity={1}
        disabled={isLoading}
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
      <View style={{alignItems: 'center', alignSelf: 'center', width: '100%'}}>
        <View style={{maxWidth: '75%'}}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      </View>
    </View>,
  ];

  useEffect(() => {
    if (!stores) {
      onFetch();
    }
  }, [stores]);

  return (
    <View style={{flex: 1, backgroundColor: '#FFF'}}>
      {Platform.OS == 'ios' ? (
        <SafeAreaView style={{backgroundColor: '#FFF', height: insets.top}} />
      ) : (
        <SafeAreaView style={{backgroundColor: '#FFF'}} />
      )}
      {header}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 120}}>
        {isLoadingStores ? (
          <ActivityIndicator
            size={'large'}
            color={Colors.textColor}
            style={{marginTop: 32}}
          />
        ) : (
          <>
            {stores?.map(store => (
              <StoreView
                store={store}
                key={store?.id}
                isSelect
                isCurrent={currentStore === store.id}
                onPress={() => {
                  setCurrentStore(store?.id);
                  setIsList(false);
                }}
              />
            ))}
            <ShadowView firstContStyle={{marginHorizontal: 16, marginTop: 16}}>
              <TouchableOpacity
                onPress={() => {
                  setCurrentStore(null);
                  setIsList(true);
                }}
                style={[styles.storeContainer, {paddingVertical: 23}]}>
                <Text style={styles.listText}>Поход в магазин со списком</Text>
                <View
                  style={[
                    styles.dotContainer,
                    {backgroundColor: isList ? '#7CB518' : Colors.grayColor},
                  ]}>
                  {isList ? (
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#FFF',
                      }}
                    />
                  ) : null}
                </View>
              </TouchableOpacity>
            </ShadowView>
          </>
        )}
      </ScrollView>
      <View style={{paddingBottom: insets.bottom + 8}}>
        <TouchableHighlight
          onPress={() => confirmStore()}
          style={styles.touchContainer}
          disabled={isLoading}
          underlayColor={Colors.underLayYellow}>
          {isLoading ? (
            <ActivityIndicator color={'#FFF'} />
          ) : (
            <Text style={styles.touchText}>
              {network.strings?.RetailerOkButton}
            </Text>
          )}
        </TouchableHighlight>
      </View>
    </View>
  );
});

export default StoresScreen;

const styles = StyleSheet.create({
  header: {
    height: 44,
    width: '100%',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    flexWrap: 'wrap',
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
    textAlign: 'center',
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
  storeText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 12,
    lineHeight: 14,
    color: Colors.textColor,
  },
  storeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  touchContainer: {
    backgroundColor: Colors.yellow,
    marginHorizontal: 16,
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
  laterView: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: Colors.textColor,
    borderRadius: 20,
  },
  laterText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Bold',
    }),
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  listText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Bold',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '800',
    color: Colors.textColor,
  },
  dotContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});
