import React, {useRef} from 'react';
import {
  Image,
  View,
  Text,
  AsyncStorage,
  Platform,
  Dimensions,
} from 'react-native';
import {
  createStackNavigator,
  TransitionSpecs,
  TransitionPresets,
} from '@react-navigation/stack';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import analytics from '@react-native-firebase/analytics';

import WelcomeScreen from '../screens/WelcomeScreen';
import ReceptScreen from '../screens/ReceptScreen';
import {SplashScreen} from '../screens/SplashScreen';
import ReceptDayScreen from '../screens/ReceptDayScreen';
import {getStatusBarHeight} from 'react-native-iphone-x-helper';
import common from '../../Utilites/Common';
import {observer} from 'mobx-react-lite';
import network from '../../Utilites/Network';
import PersonsQuizScreen from '../screens/QuizScreens/PersonsQuizScreen';
import LoginScreen from '../screens/LoginScreen';
import SendSmsScreen from '../screens/SendSmsScreen';
import PayWallScreen from '../screens/PayWallScreen';
import MenuScreen from '../screens/MenuScreen';
import ListScreen from '../screens/ListScreen';
import BasketScreen from '../screens/BasketScreen';
import FavoriteScreen from '../screens/FavoriteScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DetailsScreen from '../screens/DetailsScreen';
import ChangeNameEmailScreen from '../screens/ChangeNameEmailScreen';
import ChangeWishesScreen from '../screens/ChangePersonWishesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EarlyListScreen from '../screens/EarlyListScreen';
import HolidayMenuScreen from '../screens/HolidayMenuScreen';
import AboutSubScreen from '../screens/AboutSubScreen';
import {runInAction} from 'mobx';
import AddProductScreen from '../screens/AddProductScreen';
import ChangeProductScreen from '../screens/ChangeProductScreen';
import MapScreen from '../screens/MapScreen';
import StoresScreen from '../screens/StoresScreen';
import PayScreen from '../screens/PayScreen';
import AddCardScreen from '../screens/AddCardScreen';
import OrderStatusScreen from '../screens/OrderStatusScreen';
import GoogleMapScreen from '../screens/GoogleMapScreen';
import FirstQuizScreen from '../screens/QuizScreens/FirstQuizScreen';
import SecondQuizScreen from '../screens/QuizScreens/SecondQuizScreen';
import ThirdQuizScreen from '../screens/QuizScreens/ThirdQuizScreen';
import PersonalizingScreen from '../screens/PersonalizingScreen';
import EmailLoginScreen from '../screens/EmailScreens/EmailLoginScreen';
import SendEmailCodeScreen from '../screens/EmailScreens/SendEmailCodeScreen';
import {ModalManager} from '../services/ModalManager';

const SlideFromBottom = {...TransitionPresets.ModalSlideFromBottomIOS};
const SlideFromRight = {...TransitionPresets.SlideFromRightIOS};
// const SlideFromRight = Platform.select({ ios: {...TransitionPresets.SlideFromRightIOS}, android: {...TransitionPresets.ScaleFromCenterAndroid}});
// const SlideFromBottom = Platform.select({ ios: {...TransitionPresets.ModalSlideFromBottomIOS}, android: {...TransitionPresets.RevealFromBottomAndroid}});

const Stack = createStackNavigator();

const SplashStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SplashScreen"
        options={{gestureEnabled: false, header: () => null}}
        component={SplashScreen}
      />
    </Stack.Navigator>
  );
};

const OnboardingStack = observer(() => {
  return (
    <Stack.Navigator
      screenOptions={route => {
        return {
          ...SlideFromRight,
          // ...TransitionPresets.SlideFromRightIOS,
          cardStyle: {backgroundColor: '#FFF'},
        };
      }}
      // initialRouteName={'PersonalizingScreen'}
      initialRouteName={
        Object.keys(network?.onboarding).length
          ? Object.keys(network?.onboarding)[0]
          : 'WelcomeScreen'
      }>
      <Stack.Screen
        name="WelcomeScreen"
        options={{gestureEnabled: false, header: () => null}}
        component={WelcomeScreen}
      />
      <Stack.Screen
        name="EmailLoginScreen"
        options={{gestureEnabled: true, header: () => null}}
        initialParams={{fromOnboarding: true}}
        component={EmailLoginScreen}
      />
      <Stack.Screen
        name="SendEmailCodeScreen"
        options={{gestureEnabled: true, header: () => null}}
        initialParams={{fromOnboarding: true}}
        component={SendEmailCodeScreen}
      />
      <Stack.Screen
        name="FirstQuizScreen"
        options={{gestureEnabled: true, header: () => null}}
        component={FirstQuizScreen}
      />
      <Stack.Screen
        name="SecondQuizScreen"
        options={{gestureEnabled: true, header: () => null}}
        component={SecondQuizScreen}
      />
      <Stack.Screen
        name="ThirdQuizScreen"
        options={{gestureEnabled: true, header: () => null}}
        component={ThirdQuizScreen}
      />
      <Stack.Screen
        name="PersonsQuizScreen"
        options={{gestureEnabled: true, header: () => null}}
        component={PersonsQuizScreen}
      />
      <Stack.Screen
        name="PersonalizingScreen"
        options={{gestureEnabled: true, header: () => null}}
        component={PersonalizingScreen}
      />
      <Stack.Screen
        name="LoginScreen"
        options={{gestureEnabled: false, header: () => null}}
        component={LoginScreen}
      />
      <Stack.Screen
        name="SendSmsScreen"
        options={{gestureEnabled: true, header: () => null}}
        component={SendSmsScreen}
      />
      <Stack.Screen
        name="PayWallScreen"
        options={{gestureEnabled: false, header: () => null}}
        initialParams={{fromOnboarding: true}}
        component={PayWallScreen}
      />
      <Stack.Screen
        name="MapScreen"
        options={{gestureEnabled: false, header: () => null}}
        initialParams={{fromOnboarding: true}}
        component={MapScreen}
      />
      <Stack.Screen
        name="GoogleMapScreen"
        options={{gestureEnabled: false, header: () => null}}
        initialParams={{fromOnboarding: true}}
        component={GoogleMapScreen}
      />
      <Stack.Screen
        name="StoresScreen"
        options={{gestureEnabled: true, header: () => null}}
        initialParams={{fromOnboarding: true}}
        component={StoresScreen}
      />
    </Stack.Navigator>
  );
});

const MainStack = observer(() => {
  return (
    <Stack.Navigator
      mode={'modal'}
      headerMode={'none'}
      screenOptions={route => {
        const routeName = route.route.name;
        const slideFromRightScreens = [
          'FavoriteScreen',
          'ProfileScreen',
          'DetailsScreen',
          'LoginScreen',
          'SendSmsScreen',
          'ChangeNameEmailScreen',
          'ChangeWishesScreen',
          'SettingsScreen',
          'EarlyListScreen',
          'AboutSubScreen',
          'HolidayMenuScreen',
          'AddProductScreen',
          'StoresScreen',
          'AddCardScreen',
          'PayScreen',
          'BasketScreen',
          'EmailLoginScreen',
          'SendEmailCodeScreen',
        ];
        return {
          headerShown: false,
          gestureEnabled: true,
          animationEnabled: route.route.name == 'ReceptScreen' ? false : true,
          ...(slideFromRightScreens.find(screen => screen == routeName)
            ? SlideFromRight
            : SlideFromBottom),
        };
      }}>
      {network.enableReceptDayScreen && network.dayDishes.length ? (
        <Stack.Screen
          name="ReceptDayScreen"
          options={{gestureEnabled: false, header: () => null}}
          component={ReceptDayScreen}
        />
      ) : null}
      <Stack.Screen
        name="MenuScreen"
        options={{gestureEnabled: false, header: () => null}}
        component={MenuScreen}
      />
      <Stack.Screen
        name="SecondReceptDayScreen"
        options={{gestureEnabled: false, header: () => null}}
        component={ReceptDayScreen}
      />
      <Stack.Screen
        name="ListScreen"
        options={{gestureEnabled: false, header: () => null}}
        component={ListScreen}
      />
      <Stack.Screen
        name="BasketScreen"
        options={{gestureEnabled: true, header: () => null}}
        component={BasketScreen}
      />
      <Stack.Screen
        name="FavoriteScreen"
        options={{gestureEnabled: true, header: () => null}}
        component={FavoriteScreen}
      />
      <Stack.Screen
        name="ProfileScreen"
        options={{gestureEnabled: true, header: () => null}}
        component={ProfileScreen}
      />
      <Stack.Screen
        name="AboutSubScreen"
        options={{gestureEnabled: true, header: () => null}}
        initialParams={{fromOnboarding: false}}
        component={AboutSubScreen}
      />
      <Stack.Screen
        name="PayWallScreen"
        options={{gestureEnabled: false, header: () => null}}
        initialParams={{fromOnboarding: false}}
        component={PayWallScreen}
      />
      <Stack.Screen
        name="DetailsScreen"
        options={{gestureEnabled: true, header: () => null}}
        initialParams={{fromOnboarding: false}}
        component={DetailsScreen}
      />
      <Stack.Screen
        name="LoginScreen"
        options={{gestureEnabled: false, header: () => null}}
        initialParams={{fromOnboarding: false}}
        component={LoginScreen}
      />
      <Stack.Screen
        name="SendSmsScreen"
        options={{gestureEnabled: true, header: () => null}}
        initialParams={{fromOnboarding: false}}
        component={SendSmsScreen}
      />
      <Stack.Screen
        name="ChangeNameEmailScreen"
        options={{gestureEnabled: true, header: () => null}}
        initialParams={{fromOnboarding: false}}
        component={ChangeNameEmailScreen}
      />
      <Stack.Screen
        name="ChangeWishesScreen"
        options={{gestureEnabled: true, header: () => null}}
        initialParams={{fromOnboarding: false}}
        component={ChangeWishesScreen}
      />
      <Stack.Screen
        name="SettingsScreen"
        options={{gestureEnabled: true, header: () => null}}
        initialParams={{fromOnboarding: false}}
        component={SettingsScreen}
      />
      <Stack.Screen
        name="EarlyListScreen"
        options={{gestureEnabled: true, header: () => null}}
        initialParams={{fromOnboarding: false}}
        component={EarlyListScreen}
      />
      <Stack.Screen
        name="HolidayMenuScreen"
        options={{gestureEnabled: true, header: () => null}}
        initialParams={{fromOnboarding: false}}
        component={HolidayMenuScreen}
      />
      <Stack.Screen
        name="AddProductScreen"
        options={{gestureEnabled: true, header: () => null}}
        initialParams={{fromOnboarding: false}}
        component={AddProductScreen}
      />
      <Stack.Screen
        name="ChangeProductScreen"
        options={{gestureEnabled: true, header: () => null}}
        initialParams={{fromOnboarding: false}}
        component={ChangeProductScreen}
      />
      <Stack.Screen
        name="StoresScreen"
        options={{gestureEnabled: true, header: () => null}}
        initialParams={{fromOnboarding: false}}
        component={StoresScreen}
      />
      <Stack.Screen
        name="MapScreen"
        options={{gestureEnabled: false, header: () => null}}
        component={MapScreen}
      />
      <Stack.Screen
        name="GoogleMapScreen"
        options={{gestureEnabled: false, header: () => null}}
        initialParams={{fromOnboarding: true}}
        component={GoogleMapScreen}
      />
      <Stack.Screen
        name="PayScreen"
        options={{gestureEnabled: false, header: () => null}}
        component={PayScreen}
      />
      <Stack.Screen
        name="AddCardScreen"
        options={{gestureEnabled: true, header: () => null}}
        component={AddCardScreen}
      />
      <Stack.Screen
        name="OrderStatusScreen"
        options={{gestureEnabled: false, header: () => null}}
        component={OrderStatusScreen}
      />
      <Stack.Screen
        name="EmailLoginScreen"
        options={{gestureEnabled: true, header: () => null}}
        component={EmailLoginScreen}
      />
      <Stack.Screen
        name="SendEmailCodeScreen"
        options={{gestureEnabled: true, header: () => null}}
        component={SendEmailCodeScreen}
      />
      <Stack.Screen
        name="ReceptScreen"
        component={ReceptScreen}
        options={route => {
          return {
            cardOverlayEnabled: true,
            cardStyle: {backgroundColor: 'transparent', opacity: 1},
            // gestureEnabled:route?.route?.params?.gestureEnable ?? true,
            cardOverlay: () => (
              <View
                style={{backgroundColor: '#000', height: '100%', opacity: 0.4}}
              />
            ),
            // gestureResponseDistance:{vertical:Dimensions.get('window').height},
          };
        }}
      />
    </Stack.Navigator>
  );
});

const AppStack = observer(() => {
  return (
    <Stack.Navigator
      screenOptions={route => {
        return {
          ...(route.route.name == 'MainStack'
            ? SlideFromBottom
            : SlideFromRight),
          animationEnabled:
            route.route.name == 'MainStack' && network.fromSplash
              ? false
              : true,
        };
      }}>
      <Stack.Screen
        name="SplashStack"
        options={{gestureEnabled: false, header: () => null}}
        component={SplashStack}
      />
      <Stack.Screen
        name="OnboardingStack"
        options={{gestureEnabled: false, header: () => null}}
        component={OnboardingStack}
      />
      <Stack.Screen
        name="MainStack"
        options={{gestureEnabled: false, header: () => null}}
        component={MainStack}
      />
    </Stack.Navigator>
  );
});

export const navigationRef = React.createRef(null);

export const createRootNavigator = () => {
  const AllScreens = () => {
    const routeNameRef = useRef();

    return (
      <NavigationContainer
        ref={navigationRef}
        onReady={() =>
          (routeNameRef.current = navigationRef.current.getCurrentRoute().name)
        }
        onStateChange={async () => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName = navigationRef.current.getCurrentRoute().name;
          if (previousRouteName !== currentRouteName) {
            runInAction(async () => {
              analytics().logScreenView({
                screen_name: currentRouteName,
                screen_class: currentRouteName,
              });
              if ((new Date() - network.screenDate) / 60000 < 60) {
                analytics().logEvent(`${previousRouteName}`, {
                  value: (new Date() - network.screenDate) / 1000,
                  screenTime: (new Date() - network.screenDate) / 1000,
                });
                // console.warn(previousRouteName,'screenTime:', (new Date() - network.screenDate)/1000)
              }
              network.screenDate = new Date();
              network.currentScreen = currentRouteName;
            });
            // console.warn(currentRouteName)
          }
          routeNameRef.current = currentRouteName;
        }}>
        <AppStack />
        <ModalManager />
      </NavigationContainer>
    );
  };
  return AllScreens;
};
