import React, {Component, useRef, useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  AsyncStorage,
  Dimensions,
  Image,
  Animated as ReactAnimated,
  StatusBar,
  Platform,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import {observer, Observer, useObserver} from 'mobx-react-lite';
import network, {getRecipe} from '../../Utilites/Network';
import RecipeOfTheDay from '../components/ReceptDayScreen/RecipeOfTheDay';
import common from '../../Utilites/Common';
import {getStatusBarHeight} from 'react-native-iphone-x-helper';
import LinearGradient from 'react-native-linear-gradient';
import Animated from 'react-native-reanimated';
import FlashMessage, {
  showMessage,
  hideMessage,
} from 'react-native-flash-message';
import GestureRecognizer from 'react-native-swipe-gestures';
import OneSignal from 'react-native-onesignal';
import dynamicLinks from '@react-native-firebase/dynamic-links';
import Config from '../constants/Config';
import {useFocusEffect} from '@react-navigation/native';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

export const CheckDymanicLink = async navigation => {
  const handleDynamicLink = link => {
    if (link && link.indexOf(Config.url) != -1) {
      console.log('handleDynamicLink', link);
      const linkArr = link.split('/');
      const isRecp = linkArr.indexOf('recipes') != -1;
      const isHoliday = linkArr.indexOf('additional-menu') != -1;
      const isProfile = linkArr.indexOf('profile') != -1;
      if (isRecp) {
        getRecipe(link).then(recipe => {
          navigation.navigate('ReceptScreen', {rec: recipe});
        });
      } else if (isHoliday) {
        let banner =
          network.banner1.type == 'menu_holiday'
            ? network.banner1
            : network.banner2.type == 'menu_holiday'
            ? network.banner2
            : null;
        banner
          ? navigation.navigate('HolidayMenuScreen', {
              data: banner.recipes,
              bgImg: banner?.image_inner?.big_webp,
              description: banner?.description,
              title: banner?.title,
            })
          : null;
      } else if (isProfile) {
        const profile = linkArr[linkArr.length - 1];
        return profile;
      }
    }
  };

  OneSignal.setNotificationOpenedHandler(openResult => {
    let data = openResult?.notification?.additionalData;
    if (Object.keys(data).length) {
      console.log('OneSignal: notification opened:', data);
      if (data.type == 'paywall') {
        navigation.navigate('PayWallScreen', {
          data: network.paywalls[data.name],
        });
      } else if (data.type == 'banner') {
        let banner =
          network.banner1.type == data.name
            ? network.banner1
            : network.banner2.type == data.name
            ? network.banner2
            : null;
        banner
          ? navigation.navigate('HolidayMenuScreen', {
              data: banner.recipes,
              bgImg: banner?.image_inner?.big_webp,
              description: banner?.description,
              title: banner?.title,
            })
          : null;
      } else if (data.type == 'recipe') {
        getRecipe(data.recipe_url).then(recipe => {
          navigation.navigate('ReceptScreen', {rec: recipe});
        });
      } else if (data.type == 'list') {
        navigation.navigate('BasketScreen');
      } else if (data.type == 'favorite') {
        navigation.navigate('FavoriteScreen');
      }
    }
  });
  dynamicLinks().onLink(link => {
    // console.warn('linklinklinklink',link)
    handleDynamicLink(link?.url);
  });
  const linkResult = await dynamicLinks()
    .getInitialLink()
    .then(link => {
      const result = handleDynamicLink(link?.url);
      return result;
    });
  return linkResult;
};

const ReceptDayScreen = observer(({navigation, route}) => {
  const screenHeight =
    Dimensions.get('window').height +
    Platform.select({ios: 0, android: getStatusBarHeight()});
  const [page, setPage] = useState(0);
  const [stop, setstop] = useState(false);
  const screens = [];
  const scroll = useRef(null);

  for (let i = 0; i < network.dayDishes.length; i++) {
    screens.push(i * screenHeight);
  }

  const openRec = rec => {
    if (isFocused) {
      const recept = network.allDishes.find(item => item.id == rec.id);
      navigation.navigate('ReceptScreen', {rec: recept, fromDays: true});
    }
  };

  const titles = [];
  for (let i = 0; i < network.dayDishes.length; i++) {
    titles.push(
      // <View style={{flexDirection:'row',alignItems:'center',marginTop:12,opacity:i == page ? 1 : 0.5}} key={network.dayDishes[i].id}>
      //     <Image source={require('../../assets/icons/star.png')} style={{width:18,height:18,marginRight:8}} />
      //     <Text style={{fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:16,color:'#FFF',fontWeight:'500'}}>
      //         {network.dayDishes[i]?.eating} дня
      //     </Text>
      // </View>
      <View
        style={{
          width: 4,
          borderRadius: 4,
          backgroundColor: '#FFF',
          height: i == page ? 12 : 4,
          opacity: i == page ? 1 : 0.5,
          marginTop: 4,
        }}
        key={network.dayDishes[i].id}
      />,
    );
  }

  const [isFocused, setIsFocused] = useState(false);
  useEffect(() => {
    const onFocus = navigation.addListener('focus', () => {
      setIsFocused(true);
      // const from = route?.params?.from
      // scroll?.current && from ? scroll.current.scrollToOffset({ animated: false, offset: 0 }) : null
      if (Platform.OS == 'ios') {
        StatusBar.setBarStyle('light-content', true);
      } else {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('light-content', true);
        StatusBar.setTranslucent(true);
      }
    });
    return onFocus;
  }, [navigation]);

  useEffect(() => {
    const onBlur = navigation.addListener('blur', () => {
      setIsFocused(false);
      if (Platform.OS == 'ios') {
        StatusBar.setBarStyle('dark-content', true);
      } else {
        StatusBar.setBackgroundColor('#FFF', true);
        StatusBar.setBarStyle('dark-content', true);
        StatusBar.setTranslucent(false);
      }
    });
    return onBlur;
  }, [navigation]);

  useEffect(() => {
    AsyncStorage.setItem('receptDayDate', String(new Date()));
    CheckDymanicLink(navigation);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        return route.name != 'SecondReceptDayScreen';
      };
      changeNavigationBarColor('#000000', true);
      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          position: 'absolute',
          right: 0,
          zIndex: 10,
          top: getStatusBarHeight(),
        }}>
        <TouchableOpacity
          style={{padding: 16}}
          onPress={() => navigation.navigate('MenuScreen')}
          activeOpacity={1}>
          <Image
            style={{width: 18, height: 18}}
            source={require('../../assets/icons/close.png')}
          />
        </TouchableOpacity>
      </View>
      <View
        style={{
          position: 'absolute',
          zIndex: 10,
          top: getStatusBarHeight(),
          alignSelf: 'center',
          paddingTop: 16,
          alignItems: 'center',
        }}>
        <Text style={styles.title}>{network.strings?.ChoiceOfTheDayText}</Text>
        <Text style={styles.subtitle}>
          {page + 1} {network.strings?.OfFull} {network.dayDishes.length}
        </Text>
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        ref={scroll}
        data={network.dayDishes}
        scrollEventThrottle={16}
        pagingEnabled={true}
        decelerationRate={Platform.select({ios: 'fast', android: 0.8})}
        snapToInterval={
          common.getLengthByIPhone7(0) - common.getLengthByIPhone7(100)
        }
        disableIntervalMomentum={true}
        snapToAlignment={'center'}
        // initialNumToRender={3}
        snapToOffsets={screens}
        extraData={network.dayDishes}
        onScroll={event => {
          let newPage = Math.round(
            (event.nativeEvent.contentOffset.y / screenHeight).toFixed(1),
          );
          setTimeout(() => {
            if (page != newPage) {
              setPage(newPage);
            }
          }, 100);
        }}
        keyExtractor={(item, index) => index}
        renderItem={({item, index}) => (
          <RecipeOfTheDay
            recept={item}
            onPress={() => openRec(item)}
            blur={Platform.OS == 'ios' && !isFocused}
            onSwipeUp={() =>
              index + 1 == network.dayDishes.length
                ? navigation.navigate('MenuScreen')
                : null
            }
            isLast={index + 1 === network.dayDishes.length}
          />
        )}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 167,
          paddingLeft: 16,
        }}>
        {titles}
      </View>
      {/* <ReactAnimated.View style={{width:'100%',height:screenHeight,position:'absolute',backgroundColor:'#000',opacity:fadeAnim,
            display:isOpenSheet ? 'flex' : 'none',}} /> */}
    </>
  );
});

export default ReceptDayScreen;

const styles = StyleSheet.create({
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 16,
    lineHeight: 18,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: '#FFF',
  },
  subtitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 12,
    lineHeight: 14,
    color: '#FFF',
    marginTop: 2,
  },
});
