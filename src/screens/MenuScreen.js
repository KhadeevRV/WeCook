import React, {useMemo, useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  KeyboardAvoidingView,
  ImageBackground,
  Dimensions,
  SafeAreaView,
  BackHandler,
  StatusBar,
  Animated,
  InteractionManager,
  Alert,
  AsyncStorage,
} from 'react-native';
import {
  TouchableOpacity,
  FlatList,
  ScrollView,
  TextInput,
  TouchableHighlight,
} from 'react-native-gesture-handler';
import network, {
  authUser,
  getList,
  getRecipe,
  getUnavailableProducts,
  getUserInfo,
} from '../../Utilites/Network';
import {observer, Observer, useObserver} from 'mobx-react-lite';
import {runInAction} from 'mobx';
import {Btn} from '../components/Btn';
import common from '../../Utilites/Common';
import Colors from '../constants/Colors';
import DayRecipeCard from '../components/MenuScreen/DayRecipeCard';
import LinearGradient from 'react-native-linear-gradient';
import {getBottomSpace, getStatusBarHeight} from 'react-native-iphone-x-helper';
import {FilterModal} from '../components/MenuScreen/FilterModal';
import {ChangeWeeksModal} from '../components/MenuScreen/ChangeWeeksModal';
import {StoriesModal} from '../components/MenuScreen/StoriesModal';
import Spinner from 'react-native-loading-spinner-overlay';
import FastImage from 'react-native-fast-image';
import BottomListBtn from '../components/BottomListBtn';
import Config from '../constants/Config';
import {useFocusEffect} from '@react-navigation/native';
import changeNavigationBarColor from 'react-native-navigation-bar-color';
import {GreyBtn} from '../components/GreyBtn';
import {ShadowView} from '../components/ShadowView';
import {AddressesModal} from '../components/MenuScreen/AddressesModal';
import {StoreView} from './StoresScreen';
import {statuses} from './OrderStatusScreen';
import OneSignal from 'react-native-onesignal';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import {CheckDymanicLink} from './ReceptDayScreen';
// import Animated from 'react-native-reanimated'
// import { SafeAreaView } from 'react-native-safe-area-context'
import {Amplitude} from '@amplitude/react-native';
import {ampInstance} from '../../App';
import {UnavailableProductsModal} from '../components/UnavailableProductsModal';
import {strings} from '../../assets/localization/localization';
import {SaleModal} from '../components/PayWallScreen/SaleModal';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import Smartlook from 'smartlook-react-native-wrapper';

const ChangeMenuBtn = ({visible, onPress, title}) => {
  if (!visible) {
    return null;
  }

  return (
    <View style={{flexDirection: 'row', alignSelf: 'center', marginTop: 30}}>
      <TouchableHighlight
        onPress={() => onPress()}
        underlayColor={'#EEEEEE'}
        style={{
          paddingVertical: 10.5,
          paddingHorizontal: 24,
          backgroundColor: '#F5F5F5',
          borderRadius: 18,
          flexWrap: 'wrap',
        }}>
        <Text style={styles.addsTitle}>{title}</Text>
      </TouchableHighlight>
    </View>
  );
};

const MenuScreen = observer(({navigation}) => {
  // const [filteredMenu, setFilteredMenu] = useState(network.allDishes);
  // const [filterModal, setFilterModal] = useState(false);
  const [addressesModal, setAddressesModal] = useState(false);
  const [unavailableModal, setUnavailableModal] = useState(false);
  const [unavailableRecipe, setUnavailableRecipe] = useState({});
  const [saleModal, setSaleModal] = useState(false);
  // const [currentWeek, setCurrentWeek] = useState('Текущая');
  // const [weeksModal, setWeeksModal] = useState(false);
  // const filterNames = ['Завтраки', 'Обеды', 'Ужины', 'Салаты', 'Десерты'];
  // const [currentFilters, setCurrentFilters] = useState([]);
  // const [secsWidth, setSecsWidth] = useState({});
  // const screenWidth = Dimensions.get('window').width;
  // const [page, setPage] = useState(0);
  // const [tabsY, setTabsY] = useState(0);
  // const horScroll = useRef(null);
  const mainScroll = useRef(null);

  const goToProfile = () => {
    if (network.user?.access && !network.user?.phone) {
      navigation.navigate('LoginScreen', {
        closeDisable: true,
        from: 'MenuScreen',
      });
    } else {
      navigation.navigate('ProfileScreen');
    }
  };

  const backAction = () => {
    Alert.alert(Config.appName, network?.strings?.LogoutAlertTitle, [
      {
        text: network?.strings?.No,
        onPress: () => null,
        style: 'cancel',
      },
      {text: network?.strings?.Yes, onPress: () => BackHandler.exitApp()},
    ]);
  };

  const header = [
    <View style={styles.header} key={'menuHeader'}>
      <Text style={styles.headerTitle}>{network.strings?.MenuScreenTitle}</Text>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TouchableOpacity
          activeOpacity={1}
          style={{paddingHorizontal: 13, paddingVertical: 11}}
          onPress={() => navigation.navigate('EarlyListScreen')}>
          <Image
            source={require('../../assets/icons/history.png')}
            style={{width: 22, height: 22}}
          />
          {network.user?.any_notify?.cart_history_icon ? (
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 10,
                backgroundColor: '#FFF',
                position: 'absolute',
                top: 8,
                right: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#FF0000',
                }}
              />
            </View>
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          style={{paddingHorizontal: 13, paddingVertical: 11}}
          onPress={() => navigation.navigate('FavoriteScreen')}>
          <Image
            source={require('../../assets/icons/heart.png')}
            style={{width: 22, height: 21}}
          />
          {network.favorDishes.findIndex(dish => dish.new) != -1 ? (
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 10,
                backgroundColor: '#FFF',
                position: 'absolute',
                top: 8,
                right: 12,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: '#F90201',
                }}
              />
            </View>
          ) : null}
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          style={{paddingHorizontal: 13, paddingVertical: 11}}
          onPress={() => goToProfile()}>
          {/*{network.user?.access ? null : (*/}
          {/*  <View*/}
          {/*    style={{*/}
          {/*      width: 10,*/}
          {/*      height: 10,*/}
          {/*      borderRadius: 10,*/}
          {/*      backgroundColor: '#FFF',*/}
          {/*      position: 'absolute',*/}
          {/*      top: 11,*/}
          {/*      right: 14,*/}
          {/*      justifyContent: 'center',*/}
          {/*      alignItems: 'center',*/}
          {/*      zIndex: 100,*/}
          {/*    }}>*/}
          {/*    <View*/}
          {/*      style={{*/}
          {/*        width: 6,*/}
          {/*        height: 6,*/}
          {/*        borderRadius: 3,*/}
          {/*        backgroundColor: Colors.yellow,*/}
          {/*      }}*/}
          {/*    />*/}
          {/*  </View>*/}
          {/*)}*/}
          <Image
            source={require('../../assets/icons/profile.png')}
            style={{width: 20, height: 22}}
          />
        </TouchableOpacity>
      </View>
    </View>,
  ];
  const openRec = rec => {
    if (network.canOpenRec(rec)) {
      const recept = network.allDishes.find(item => item.id == rec.id);
      navigation.navigate('ReceptScreen', {rec: recept});
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
          'MenuScreen',
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
  // const filterHandler = (what, weekName = 'Текущая') => {
  //   setCurrentFilters(what);
  //   const initArr = weekName == 'Текущая' ? network.allDishes : network.oldMenu;
  //   if (what.length) {
  //     const newMenu = initArr.filter(dish => {
  //       for (let i = 0; i < what.length; i++) {
  //         if (dish?.eating == what[i]) {
  //           return true;
  //         }
  //       }
  //     });
  //     setFilteredMenu(newMenu);
  //   } else {
  //     setFilteredMenu(initArr);
  //   }
  // };

  //! Баннеры

  const bannerHandler = banner => {
    console.log(banner)
    if (banner.type == 'list_history') {
      navigation.navigate('EarlyListScreen');
    } else if (banner.type == 'menu_holiday') {
      navigation.navigate('HolidayMenuScreen', {
        data: banner.recipes,
        bgImg: banner?.image_inner?.big_webp,
        description: banner?.description,
        title: banner?.title,
      });
    } else {
      navigation.navigate('PayWallScreen', {
        data: network.paywalls[banner.type],
      });
    }
  };

  const renderOrder = order => {
    const statusIndex = statuses.findIndex(
      status => status.statusName == order?.status,
    );
    return (
      <ShadowView
        key={order.id}
        firstContStyle={{margin: 16, marginBottom: 0}}
        secondContStyle={{
          paddingTop: 11,
          paddingBottom: 13,
          paddingHorizontal: 16,
        }}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() =>
            navigation.navigate('OrderStatusScreen', {
              data: order,
              fromMenu: true,
            })
          }>
          <Text style={styles.timeText}>
            {network.strings?.OrderBlockText} {order?.id}
          </Text>
          <Image
            source={require('../../assets/icons/goDown.png')}
            style={{
              width: 13,
              height: 8,
              transform: [{rotate: '-90deg'}],
              position: 'absolute',
              right: 0,
              top: 5,
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginHorizontal: 16,
              marginTop: 20,
            }}>
            {statuses.map((status, index) => (
              <View key={status.id} style={{alignItems: 'center'}}>
                <View
                  style={[
                    styles.statusContainer,
                    {
                      backgroundColor:
                        index <= statusIndex ? '#FFE600' : '#F5F5F5',
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
        </TouchableOpacity>
      </ShadowView>
    );
  };

  //! Меню на неделю
  const renderMenu = () => {
    const menu = [];
    for (let i = 0; i < network.sectionNames.length; i++) {
      const section = network.sectionNames[i];
      const sectionDishes = network.allDishes.filter(
        dish => dish.section_name == section,
      );
      let sectionsInterval = sectionDishes.map(
        (item, index) => index * (item?.is_big ? 280 : 164) + 15,
      );
      menu.push(
        <View key={section}>
          <Text style={[styles.subtitle, {marginLeft: 16}]}>{section}</Text>
          <FlatList
            showsHorizontalScrollIndicator={false}
            horizontal
            contentContainerStyle={{
              paddingLeft: 16,
              paddingBottom: 22,
              paddingTop: 12,
              paddingRight: 6,
            }}
            data={sectionDishes}
            keyExtractor={(item, index) =>
              section + item.id.toString() + '_' + index
            }
            scrollEventThrottle={16}
            pagingEnabled={true}
            decelerationRate={Platform.select({ios: 'fast', android: 0.8})}
            snapToInterval={
              common.getLengthByIPhone7(0) - common.getLengthByIPhone7(32)
            }
            disableIntervalMomentum={true}
            snapToAlignment={'center'}
            snapToOffsets={sectionsInterval}
            renderItem={({item, index}) => (
              <DayRecipeCard
                recept={item}
                onPress={() => openRec(item)}
                listHandler={listHandler}
                key={item.id}
              />
            )}
          />
        </View>,
      );
    }
    return menu;
  };

  //! Сторисы
  // const [stop, setStop] = useState(true);
  // const [currentStory, setCurrentStory] = useState(0);
  // const [storiesModal, setStoriesModal] = useState(false);

  // const openStory = async i => {
  //   await setStop(false);
  //   setCurrentStory(i);
  //   setStoriesModal(true);
  // };

  // const storiesBody = [];
  // for (let i = 0; i < network.stories.length; i++) {
  //   storiesBody.push(
  //     // <View style={{opacity:network.stories[i].viewed ? 0.5 : 1}}>
  //     <TouchableOpacity
  //       onPress={() => openStory(i)}
  //       key={network.stories[i].id}>
  //       <FastImage
  //         source={{uri: network.stories[i].image}}
  //         style={{
  //           width: common.getLengthByIPhone7(108),
  //           height: common.getLengthByIPhone7(108),
  //           backgroundColor: '#FFF',
  //           marginRight: 9,
  //           justifyContent: 'flex-end',
  //           borderRadius: 16,
  //           paddingHorizontal: 6,
  //           paddingBottom: 9,
  //         }}
  //         borderRadius={16}>
  //         {network.stories[i].viewed ? null : (
  //           <View
  //             style={{
  //               width: 14,
  //               height: 14,
  //               backgroundColor: '#FFF',
  //               borderRadius: 7,
  //               position: 'absolute',
  //               right: 1,
  //               top: 1,
  //               justifyContent: 'center',
  //               alignItems: 'center',
  //             }}>
  //             <View
  //               style={{
  //                 width: 8,
  //                 height: 8,
  //                 borderRadius: 4,
  //                 backgroundColor: Colors.yellow,
  //               }}
  //             />
  //           </View>
  //         )}
  //       </FastImage>
  //     </TouchableOpacity>,
  //     // </View>
  //   );
  // }
  useEffect(() => {
    const onFocus = navigation.addListener('focus', () => {
      if (Platform.OS == 'ios') {
        StatusBar.setBarStyle('dark-content', true);
      } else {
        StatusBar.setBackgroundColor('#FFF', true);
        StatusBar.setBarStyle('dark-content', true);
        StatusBar.setTranslucent(false);
      }
    });
    return onFocus;
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        backAction();
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      changeNavigationBarColor('#F5F5F5', true);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  useEffect(() => {
    let interval = setInterval(() => {
      if (network.user?.orders_active && network.user?.orders_active.length) {
        getUserInfo(true);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const checkUnavailableProducts = async () => {
    await getUnavailableProducts();
    ampInstance.logEvent('recipes not avaliable', {
      recipes: network.allDishes.length,
      unavailableRecipes: network.unavailableRecipes.length,
    });
  };

  const checkDeviceInfo = async () => {
    OneSignal.promptForPushNotificationsWithUserResponse(response => {
      console.log('Prompt response:', response);
    });
    const deviceInfo = await OneSignal.getDeviceState();
    console.warn('deviceInfooo', deviceInfo);
    runInAction(() => (network.pushId = deviceInfo.userId));
    authUser();
  };

  useEffect(() => {
    network.enableReceptDayScreen ? null : CheckDymanicLink(navigation);
    checkDeviceInfo();
    network.isBasketUser() ? checkUnavailableProducts() : null;
  }, []);

  const userStore = useMemo(() => {
    if (
      network.user?.store_id &&
      network.stores.length &&
      network.stores.filter(store => store?.id == network.user?.store_id).length
    ) {
      return network.stores.find(store => store?.id == network.user?.store_id);
    } else {
      return null;
    }
  }, [network.user?.store_id, network.stores.length]);

  return (
    <>
      <View style={{backgroundColor: '#FFF', flex: 1}}>
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
          style={{flex: 1}}
          scrollEventThrottle={16}
          contentContainerStyle={{paddingBottom: 30}}
          ref={mainScroll}>
          {/*<ScrollView*/}
          {/*  horizontal*/}
          {/*  showsHorizontalScrollIndicator={false}*/}
          {/*  contentContainerStyle={{*/}
          {/*    paddingLeft: 16,*/}
          {/*    marginTop: 16,*/}
          {/*    paddingRight: 7,*/}
          {/*  }}>*/}
          {/*  {storiesBody}*/}
          {/*</ScrollView>*/}
          {userStore && network.isBasketUser() ? (
            <StoreView
              key={userStore.id}
              store={userStore}
              onPress={() =>
                navigation.navigate('StoresScreen', {
                  title: network.user?.addresses.map(item =>
                    item?.id == network.user?.address_active
                      ? item?.full_address
                      : null,
                  ),
                  coords: network.user.addresses.find(
                    adr => adr.id == network.user.address_active,
                  ),
                  currentStore: network?.user?.store_id,
                })
              }
            />
          ) : null}
          {network.isBasketUser() ? (
            network?.user?.address_active ? (
              <ShadowView
                firstContStyle={{marginHorizontal: 16, marginTop: 8}}
                key={'ActiveAddress'}>
                <TouchableOpacity
                  onPress={() => setAddressesModal(true)}
                  style={{
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      flex: 0.9,
                      alignItems: 'center',
                    }}>
                    <Image
                      source={require('../../assets/icons/location.png')}
                      style={{
                        width: 20,
                        height: 24,
                        marginRight: 7,
                      }}
                    />
                    <Text style={[styles.addsTitle, {fontWeight: 'bold'}]}>
                      {network.user?.addresses.map(item =>
                        item?.id == network.user?.address_active
                          ? item?.full_address
                          : null,
                      )}
                    </Text>
                  </View>
                  <Image
                    source={require('../../assets/icons/goBack.png')}
                    style={{
                      width: 8,
                      height: 12,
                      transform: [{rotate: '180deg'}],
                    }}
                  />
                </TouchableOpacity>
              </ShadowView>
            ) : (
              <ShadowView
                key={'emptyAddress'}
                firstContStyle={{marginHorizontal: 16, marginTop: 16}}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate(
                      network.userMap == 'google'
                        ? 'GoogleMapScreen'
                        : 'MapScreen',
                    )
                  }
                  style={{
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={require('../../assets/icons/location.png')}
                    style={{
                      width: 20,
                      height: 24,
                      marginRight: 7,
                      tintColor: Colors.grayColor,
                    }}
                  />
                  <Text
                    style={[
                      styles.addsTitle,
                      {fontWeight: 'bold', color: Colors.grayColor},
                    ]}>
                    {network.strings?.Address}
                  </Text>
                </TouchableOpacity>
              </ShadowView>
            )
          ) : null}
          {Object.keys(network.banner1).length &&
          network.user?.banner_hide &&
          network.user?.banner_hide.findIndex(
            item => item == network.banner1?.type,
          ) == -1 ? (
            <TouchableOpacity
              style={{marginTop: 16}}
              activeOpacity={1}
              key={'banner1'}
              onPress={() => bannerHandler(network.banner1)}>
              <ImageBackground
                style={{
                  paddingHorizontal: 16,
                  marginHorizontal: 16,
                  paddingVertical: 19,
                  borderRadius: 16,
                  minHeight: 104,
                  paddingTop: 22,
                }}
                borderRadius={16}
                source={{uri: network.banner1?.image_btn?.big_webp}}>
                <Text style={styles.addsTitle}>
                  {network.banner1?.title_on_btn}
                </Text>
              </ImageBackground>
            </TouchableOpacity>
          ) : null}
          {network?.user?.orders_active
            ? network?.user?.orders_active.map(order => renderOrder(order))
            : null}
          <View
            style={{
              marginVertical: 22,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
            }}>
            <Text style={styles.subtitle}>
              {network.strings?.RecipesOfTheDay}
            </Text>
            <TouchableHighlight
              underlayColor={'#EEEEEE'}
              style={{
                borderRadius: 16,
                backgroundColor: '#F5F5F5',
              }}
              onPress={() =>
                navigation.navigate('SecondReceptDayScreen', {from: 'menu'})
              }>
              <View style={styles.receptDaysBtn}>
                <Text
                  style={[styles.timeText, {marginBottom: 0, marginRight: 4}]}
                  allowFontScaling={false}>
                  {network.strings?.Open}
                </Text>
                <Image
                  source={require('../../assets/icons/goDown.png')}
                  style={{
                    width: 13,
                    height: 8,
                    marginTop: 5,
                    transform: [{rotate: '-90deg'}],
                  }}
                />
              </View>
            </TouchableHighlight>
          </View>
          {/* <FlatList
            showsHorizontalScrollIndicator={false}
            horizontal
            contentContainerStyle={{
              paddingLeft: 16,
              paddingBottom: 22,
              paddingTop: 12,
              paddingRight: 6,
            }}
            data={network.dayDishes}
            extraData={network.dayDishes}
            keyExtractor={(item, index) => 'dayDish_' + item.id + index}
            scrollEventThrottle={16}
            pagingEnabled={true}
            decelerationRate={Platform.select({ios: 'fast', android: 0.8})}
            snapToInterval={
              common.getLengthByIPhone7(0) - common.getLengthByIPhone7(32)
            }
            disableIntervalMomentum={true}
            snapToAlignment={'center'}
            snapToOffsets={dayRecipeScreens}
            renderItem={({item, index}) => (
              <DayRecipeCard
                recept={item}
                onPress={() => openRec(item)}
                listHandler={(isInList, recept) =>
                  listHandler(isInList, recept)
                }
                key={item.id}
              />
            )}
          /> */}
          {Object.keys(network.banner2).length &&
          network.user?.banner_hide.findIndex(
            item => item == network.banner2?.type,
          ) == -1 ? (
            <TouchableOpacity
              activeOpacity={1}
              key={'bannner_2'}
              onPress={() => bannerHandler(network.banner2)}>
              <ImageBackground
                source={{uri: network.banner2?.image_btn?.big_webp}}
                style={{
                  paddingHorizontal: 16,
                  marginHorizontal: 16,
                  marginBottom: 22,
                  paddingVertical: 19,
                  minHeight: 80,
                  paddingTop: 22,
                }}
                borderRadius={16}>
                <Text style={styles.addsTitle}>
                  {network.banner2?.title_on_btn}
                </Text>
              </ImageBackground>
            </TouchableOpacity>
          ) : null}
          {renderMenu()}
          <ChangeMenuBtn
            title={network.strings?.MenuUp}
            visible={true}
            onPress={() =>
              mainScroll?.current?.scrollTo({x: 0, animated: true})
            }
          />
        </ScrollView>
        {network.isBasketUser() &&
        network?.basketInfo?.items_in_cart &&
        network.enableBasket() ? (
          <BottomListBtn key={'BottomListMenu'} navigation={navigation} />
        ) : !network.isBasketUser() && network.listDishes.length ? (
          <BottomListBtn key={'BottomListMenu'} navigation={navigation} />
        ) : null}
        <AddressesModal
          modal={addressesModal}
          closeModal={() => setAddressesModal(false)}
          navigation={navigation}
        />
        {/* <StoriesModal
          modal={storiesModal}
          closeModal={() => setStoriesModal(false)}
          navigation={navigation}
          currentPage={currentStory}
          setCurrentPage={setCurrentStory}
          stop={stop}
          setStop={setStop}
        /> */}
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
    </>
  );
});

export default MenuScreen;

const styles = StyleSheet.create({
  header: {
    height: Platform.select({ios: 44, android: 80 - StatusBar.currentHeight}),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    paddingLeft: 16,
    paddingRight: 3,
  },
  headerTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 22,
    lineHeight: 26,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
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
  addsTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 19,
    color: Colors.textColor,
  },
  subtitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 18,
    lineHeight: 21,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
  },
  dayTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 18,
    lineHeight: 21,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
    marginBottom: 10,
    marginTop: 21,
    marginLeft: 16,
  },
  timeText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 17,
    color: Colors.textColor,
  },
  normalDots: {
    height: 8,
    borderRadius: 4,
  },
  receptDaysBtn: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    justifyContent: 'center',
    flexDirection: 'row',
    // alignItems:"center",
    flexWrap: 'wrap',

    borderRadius: 16,
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
