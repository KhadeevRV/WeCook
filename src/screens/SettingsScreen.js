import React, {Component, useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert,
  Share,
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
import {Switch} from 'react-native-switch';
import network, {updateInfo} from '../../Utilites/Network';
import {strings} from '../../assets/localization/localization';

const SettingsScreen = observer(({navigation}) => {
  const [isEnabled, setIsEnabled] = useState(network.user?.show_push ?? false);

  const header = [
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={1}
        style={{
          position: 'absolute',
          left: 0,
          paddingVertical: 11,
          paddingHorizontal: 16,
          zIndex: 100,
        }}
        onPress={() => navigation.goBack()}>
        <Image
          source={require('../../assets/icons/goBack.png')}
          style={{width: 11, height: 18, tintColor: Colors.textColor}}
        />
      </TouchableOpacity>
      <View style={{alignItems: 'center', alignSelf: 'center'}}>
        <Text style={styles.headerTitle}>{network.strings?.Settings}</Text>
      </View>
    </View>,
  ];

  const toggleSwitch = val => {
    console.warn(val);
    updateInfo('push_active', !isEnabled);
    runInAction(() => (network.user.show_push = val));
    setIsEnabled(val);
  };

  return (
    <View style={{flex: 1, backgroundColor: '#FFF'}}>
      <SafeAreaView backgroundColor={'#FFF'} />
      {header}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 120}}>
        <View style={styles.container}>
          <Text style={styles.title}>{network.strings?.Notifications}</Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 13,
            }}>
            <Text style={styles.subtitle}>{network.strings?.SendNotifications}</Text>
            <Switch
              value={isEnabled}
              onValueChange={val => toggleSwitch(val)}
              circleSize={20}
              barHeight={28}
              circleBorderWidth={2}
              backgroundActive={'#FFF'}
              containerStyle={{borderWidth: 2}}
              // outerCircleStyle={{backgroundColor:'red'}}
              backgroundInactive={'#FFF'}
              inActiveText={false}
              activeText={false}
              circleActiveColor={'#000'}
              circleInActiveColor={'#FFF'}
              switchLeftPx={3} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
              // switchRightPx={1} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
              switchWidthMultiplier={2.5} // multiplied by the `circleSize` prop to calculate total width of the Switch
              switchBorderRadius={20} // Sets the border Radius of the switch slider. If unset, it remains the circleSize.
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

export default SettingsScreen;

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
  container: {
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 18,
    lineHeight: 21,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
    marginTop: 25,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '500',
    color: Colors.textColor,
  },
});
