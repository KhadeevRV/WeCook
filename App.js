import 'react-native-gesture-handler';
import React, {Component} from 'react';
import {Platform, StatusBar, AsyncStorage, LogBox} from 'react-native';
import {createRootNavigator} from './src/navigation/AppNavigation';
import CommonActions from './Utilites/NavigationService';
import Colors from './src/constants/Colors';
import changeNavigationBarColor, {
  hideNavigationBar,
  showNavigationBar,
} from 'react-native-navigation-bar-color';
import {Settings} from 'react-native-fbsdk-next';
import {Amplitude} from '@amplitude/react-native';
import SplashScreen from 'react-native-splash-screen';
import Smartlook from 'smartlook-react-native-wrapper';
import Config from './src/constants/Config';

export const ampInstance = Amplitude.getInstance();

export default class App extends Component {
  UNSAFE_componentWillMount() {
    Settings.initializeSDK();
    if (!Config.isDev) {
      ampInstance.init('fd162a4bc9884945e5ddfdbbb4630b9b');
      Smartlook.setupAndStartRecording(
        '7fc5543df82d8bcc6f3868477f4262246e0d6cde',
      );
    }
    // LogBox.ignoreAllLogs()
    changeNavigationBarColor('#000000');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#FFF', true);
      StatusBar.setBarStyle('dark-content', true);
    } else {
      StatusBar.setBarStyle('dark-content', true);
    }
  }

  render() {
    const Layout = createRootNavigator();
    return (
      <Layout
        ref={navigatorRef => {
          CommonActions.setTopLevelNavigator(navigatorRef);
        }}
      />
    );
  }
}
