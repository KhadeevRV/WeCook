import React from 'react'
import {Image,View,Text, AsyncStorage, Platform, Dimensions} from 'react-native'
import { createStackNavigator, TransitionSpecs, TransitionPresets } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import WelcomeScreen from '../screens/WelcomeScreen';
import ReceptScreen from '../screens/ReceptScreen';
import { SplashScreen } from '../screens/SplashScreen';
import ReceptDayScreen from '../screens/ReceptDayScreen';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import common from '../../Utilites/Common';
import { observer } from 'mobx-react-lite';
import network from '../../Utilites/Network';
import FirstQuizScreen from '../screens/QuizScreens/FirstQuizScreen';
import SecondQuizScreen from '../screens/QuizScreens/SecondQuizScreen';
import ThirdQuizScreen from '../screens/QuizScreens/ThirdQuizScreen';
import PersonsQuizScreen from '../screens/QuizScreens/PersonsQuizScreen';
import LoginScreen from '../screens/LoginScreen';
import SendSmsScreen from '../screens/SendSmsScreen';
import PayWallScreen from '../screens/PayWallScreen';
import MenuScreen from '../screens/MenuScreen';
import ListScreen from '../screens/ListScreen';
import FavoriteScreen from '../screens/FavoriteScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DetailsScreen from '../screens/DetailsScreen';
import ChangeNameEmailScreen from '../screens/ChangeNameEmailScreen';
import ChangeWishesScreen from '../screens/ChangePersonWishesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EarlyListScreen from '../screens/EarlyListScreen';
import HolidayMenuScreen from '../screens/HolidayMenuScreen';


const SlideFromBottom = {...TransitionPresets.ModalSlideFromBottomIOS}
const SlideFromRight = {...TransitionPresets.SlideFromRightIOS}
// const SlideFromRight = Platform.select({ ios: {...TransitionPresets.SlideFromRightIOS}, android: {...TransitionPresets.ScaleFromCenterAndroid}});
// const SlideFromBottom = Platform.select({ ios: {...TransitionPresets.ModalSlideFromBottomIOS}, android: {...TransitionPresets.RevealFromBottomAndroid}});

const Stack = createStackNavigator();

const SplashStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SplashScreen" options={{gestureEnabled:false, header:() => null}} component={SplashScreen} />
    </Stack.Navigator>
  );
}

const OnboardingStack = () => {
  return (
    <Stack.Navigator screenOptions={(route) => {
      return(
        {
          ...SlideFromRight,
          // ...TransitionPresets.SlideFromRightIOS,
          cardStyle:{backgroundColor:'#FFF'}
        }
      )
    }}>
      <Stack.Screen name="WelcomeScreen" options={{gestureEnabled:false, header:() => null}} component={WelcomeScreen} />
      <Stack.Screen name="FirstQuizScreen" options={{gestureEnabled:true, header:() => null}} component={FirstQuizScreen} />
      <Stack.Screen name="SecondQuizScreen" options={{gestureEnabled:true, header:() => null}} component={SecondQuizScreen} />
      <Stack.Screen name="ThirdQuizScreen" options={{gestureEnabled:true, header:() => null}} component={ThirdQuizScreen} />
      <Stack.Screen name="PersonsQuizScreen" options={{gestureEnabled:true, header:() => null}} component={PersonsQuizScreen} />
      <Stack.Screen name="LoginScreen" options={{gestureEnabled:true, header:() => null}} component={LoginScreen} />
      <Stack.Screen name="SendSmsScreen" options={{gestureEnabled:true, header:() => null}} component={SendSmsScreen} />
      <Stack.Screen name="PayWallScreen" options={{gestureEnabled:true, header:() => null}} initialParams={{fromOnboarding:true}} component={PayWallScreen} />
    </Stack.Navigator>
  );
}

const MainStack = () => {
  return (
    <Stack.Navigator mode={'modal'} headerMode={'none'}
    screenOptions={(route) => {
      const routeName = route.route.name
      const slideFromRightScreens = 
        ['FavoriteScreen','ProfileScreen','DetailsScreen',
        'LoginScreen','SendSmsScreen','ChangeNameEmailScreen',
        'ChangeWishesScreen','SettingsScreen','EarlyListScreen',
        'HolidayMenuScreen']
      return(
      {headerShown: false,
        gestureEnabled:true,
        ...slideFromRightScreens.find(screen => screen == routeName)? SlideFromRight: SlideFromBottom
      })

    }}>
      <Stack.Screen name="ReceptDayScreen" options={{gestureEnabled:false, header:() => null}} component={ReceptDayScreen} />
      <Stack.Screen name="SecondReceptDayScreen" options={{gestureEnabled:false, header:() => null}} component={ReceptDayScreen} />
      <Stack.Screen name="MenuScreen" options={{gestureEnabled:false, header:() => null}} component={MenuScreen} />
      <Stack.Screen name="ListScreen" options={{gestureEnabled:false, header:() => null}} component={ListScreen} />
      <Stack.Screen name="FavoriteScreen" options={{gestureEnabled:true, header:() => null}} component={FavoriteScreen} />
      <Stack.Screen name="ProfileScreen" options={{gestureEnabled:true, header:() => null}} component={ProfileScreen} />
      <Stack.Screen name="PayWallScreen" options={{gestureEnabled:true, header:() => null}} initialParams={{fromOnboarding:false}} component={PayWallScreen} />
      <Stack.Screen name="DetailsScreen" options={{gestureEnabled:true, header:() => null}} initialParams={{fromOnboarding:false}} component={DetailsScreen} />
      <Stack.Screen name="LoginScreen" options={{gestureEnabled:true, header:() => null}} initialParams={{fromOnboarding:false}} component={LoginScreen} />
      <Stack.Screen name="SendSmsScreen" options={{gestureEnabled:true, header:() => null}} initialParams={{fromOnboarding:false}} component={SendSmsScreen} />
      <Stack.Screen name="ChangeNameEmailScreen" options={{gestureEnabled:true, header:() => null}} initialParams={{fromOnboarding:false}} component={ChangeNameEmailScreen} />
      <Stack.Screen name="ChangeWishesScreen" options={{gestureEnabled:true, header:() => null}} initialParams={{fromOnboarding:false}} component={ChangeWishesScreen} />
      <Stack.Screen name="SettingsScreen" options={{gestureEnabled:true, header:() => null}} initialParams={{fromOnboarding:false}} component={SettingsScreen} />
      <Stack.Screen name="EarlyListScreen" options={{gestureEnabled:true, header:() => null}} initialParams={{fromOnboarding:false}} component={EarlyListScreen} />
      <Stack.Screen name="HolidayMenuScreen" options={{gestureEnabled:true, header:() => null}} initialParams={{fromOnboarding:false}} component={HolidayMenuScreen} />
      <Stack.Screen name="ReceptScreen" component={ReceptScreen} 
      options={(route) => {
      return({cardOverlayEnabled: true,
        cardStyle: {backgroundColor: 'transparent',opacity:1,},
        gestureEnabled:route?.route?.params?.gestureEnable ?? true,
        cardOverlay:() => <View style={{backgroundColor:'#000',height:'100%',opacity:0.4}}/>,
        gestureResponseDistance:{vertical:Dimensions.get('window').height},
      })
      }}/>
    </Stack.Navigator>
  );
}

const AppStack = observer(() => {
    return (
      <Stack.Navigator screenOptions={(route) => {
        return(
          {
            ...route.route.name == 'MainStack' ? SlideFromBottom : SlideFromRight,
            animationEnabled:route.route.name == 'MainStack' && network.fromSplash ? false : true
          }
        )
      }}>
        <Stack.Screen name="SplashStack" options={{gestureEnabled:false, header:() => null}} component={SplashStack} />
        <Stack.Screen name="OnboardingStack" options={{gestureEnabled:false, header:() => null}} component={OnboardingStack} />
        <Stack.Screen name="MainStack" options={{gestureEnabled:false, header:() => null}} component={MainStack} />
      </Stack.Navigator>
    );
})



export const createRootNavigator = () => {

    const AllScreens = () => { 
        return (
        <NavigationContainer>
            <AppStack />
        </NavigationContainer>
        )
    }

    return AllScreens; 
};