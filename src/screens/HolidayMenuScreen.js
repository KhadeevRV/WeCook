import React, {Component, useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  Platform,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Dimensions,
  Alert,
  StatusBar,
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
import LinearGradient from 'react-native-linear-gradient';
import {getBottomSpace, getStatusBarHeight} from 'react-native-iphone-x-helper';
import FavorItem from '../components/FavoriteScreen/FavorItem';
import network, {getShortLink} from '../../Utilites/Network';
import {captureScroll, getSpoingyTransform} from '../animations/SpoingyHelpers';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import BottomListBtn from '../components/BottomListBtn';
import Config from '../constants/Config';
import Share from 'react-native-share';
import {UnavailableProductsModal} from '../components/UnavailableProductsModal';
import { SaleModal } from '../components/PayWallScreen/SaleModal';

const HolidayMenuScreen = observer(({navigation, route}) => {
  const headerHeight = 228 + getStatusBarHeight();
  const scrollY = useRef(new Animated.Value(0)).current;
  const body = [];
  const data = route.params?.data;
  const bgImg = route.params?.bgImg;
  const description = route.params?.description;
  const title = route.params?.title;
  const statusHeight = getStatusBarHeight();
  const [unavailableModal, setUnavailableModal] = useState(false);
  const [unavailableRecipe, setUnavailableRecipe] = useState({});
  const [saleModal, setSaleModal] = useState(false);

  const onShare = async () => {
    try {
      const link = Config.apiDomain + 'app/screen/additional-menu';
      const shortUrl = await getShortLink(link);
      Share.open(
        {
          message: `Посмотри какое классное меню на праздник у WeCook!{'\n'}${shortUrl}`,
        },
        {
          tintColor: Colors.greenColor,
        },
      );
    } catch (err) {
      Alert.alert('Ошибка', err);
    }
  };

  const header = [
    <View style={[styles.header, {top: useSafeAreaInsets().top}]}>
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
      <Animated.Text
        style={{
          ...styles.headerTitle,
          opacity: scrollY.interpolate({
            inputRange: [0, 167 - statusHeight, 183 - statusHeight],
            outputRange: [0, 0, 1],
            extrapolate: 'extend',
          }),
        }}>
        {title}
      </Animated.Text>
      <TouchableOpacity
        activeOpacity={1}
        style={{
          position: 'absolute',
          right: 0,
          paddingVertical: 12,
          paddingHorizontal: 16,
          zIndex: 100,
        }}
        onPress={() => onShare()}>
        <Image
          source={require('../../assets/icons/share.png')}
          style={{width: 18, height: 22, tintColor: Colors.textColor}}
        />
      </TouchableOpacity>
    </View>,
  ];

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
  const openPaywall = () => {
    if (network.paywalls?.paywall_sale_modal) {
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
      if (isInBasket) {
        network.basketHandle(
          isInBasket,
          recept.id,
          recept.persons,
          'MenuScreen',
        );
        return;
      }
      if (!network.canOpenRec(recept)) {
        openPaywall();
        return;
      }
      if (isUnavailable) {
        setUnavailableRecipe(recept);
        setUnavailableModal(true);
        return;
      }
      network.basketHandle(isInBasket, recept.id, recept.persons, 'MenuScreen');
    } else {
      // Если блюдо в списке, то удаляем. Если нет, то проверяем, можно ли его добавить(открыть)
      if (isInBasket) {
        network.deleteFromList(recept);
      } else if (network.canOpenRec(recept)) {
        network.addToList(recept);
      } else {
        openPaywall();
      }
    }
  };

  for (let i = 0; i < data.length; i++) {
    const rec = data[i];
    body.push(
      <View key={rec?.id}>
        <FavorItem
          recept={rec}
          onPress={() => openRec(rec)}
          listHandler={(isInList, recept) => listHandler(isInList, recept)}
          fromHoliday
        />
        {rec?.description ? (
          <Text style={styles.subtitle}>{rec.description}</Text>
        ) : null}
      </View>,
    );
  }

  useEffect(() => {
    const onFocus = navigation.addListener('focus', () => {
      if (Platform.OS == 'android') {
        StatusBar.setBackgroundColor('transparent', true);
        StatusBar.setBarStyle('dark-content', true);
        StatusBar.setTranslucent(true);
      }
    });
    return onFocus;
  }, [navigation]);

  useEffect(() => {
    const onBlur = navigation.addListener('blur', () => {
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

  return (
    <View style={{flex: 1, backgroundColor: '#FFF'}}>
      {header}
      <Animated.View
        style={{
          height: 44 + useSafeAreaInsets().top,
          backgroundColor: '#FFF',
          width: '100%',
          position: 'absolute',
          zIndex: 5,
          opacity: scrollY.interpolate({
            inputRange: [0, 128 - statusHeight, 138 - statusHeight],
            outputRange: [0, 0, 1],
            extrapolate: 'extend',
          }),
        }}
      />
      <Animated.ScrollView
        {...captureScroll(scrollY)}
        showsVerticalScrollIndicator={false}>
        <Animated.Image
          source={{uri: bgImg}}
          style={{
            width: '100%',
            height: headerHeight,
            transform: getSpoingyTransform(scrollY, headerHeight),
          }}
        />
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{description}</Text>
          {body}
        </View>
      </Animated.ScrollView>
      {network.listDishes.length ? (
        <BottomListBtn navigation={navigation} />
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

export default HolidayMenuScreen;

const styles = StyleSheet.create({
  header: {
    height: 44,
    position: 'absolute',
    zIndex: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
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
  container: {
    height: '100%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    top: -72,
    paddingTop: 40,
    paddingHorizontal: 16,
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
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 14,
    lineHeight: 17,
    color: Colors.textColor,
    marginBottom: 38,
  },
});
