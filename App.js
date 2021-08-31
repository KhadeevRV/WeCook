
import React, {Component} from 'react';
import {Platform, StatusBar, AsyncStorage, LogBox} from 'react-native';
import { createRootNavigator } from "./src/navigation/AppNavigation";
import CommonActions from './Utilites/NavigationService'
import Colors from './src/constants/Colors';
import changeNavigationBarColor, {
  hideNavigationBar,
  showNavigationBar,
} from 'react-native-navigation-bar-color';

// "react-native-firebase": "^5.6.0",

type Props = {};
export default class App extends Component<Props> {

  UNSAFE_componentWillMount() {
    LogBox.ignoreAllLogs()
    changeNavigationBarColor('#000000',true);
    if(Platform.OS === "android") {
      StatusBar.setBackgroundColor('#FFF', true);
      StatusBar.setBarStyle('dark-content', true);
    } else {
      StatusBar.setBarStyle('dark-content', true);
    }
  }
  
  render() {
    const Layout = createRootNavigator();
    return <Layout ref={navigatorRef => {
          CommonActions.setTopLevelNavigator(navigatorRef);
        }}/>;
  }
}