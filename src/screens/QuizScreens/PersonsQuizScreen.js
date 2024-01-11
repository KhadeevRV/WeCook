import React, {Component, useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Animated,
  Platform,
  InteractionManager,
} from 'react-native';
import {
  TouchableOpacity,
  FlatList,
  ScrollView,
  TextInput,
} from 'react-native-gesture-handler';
import {observer, Observer, useObserver} from 'mobx-react-lite';
import {runInAction} from 'mobx';
import {Btn} from '../../components/Btn';
import common from '../../../Utilites/Common';
import SkipHeader from '../../components/SkipHeader';
import Colors from '../../constants/Colors';
import QuizItem from '../../components/QuizScreens/QuizItem';
import network, {
  getMenu,
  sendAnswer,
  sendDataToUrl,
} from '../../../Utilites/Network';
import QuizAnimation from '../../animations/QuizAnimation';
import {ampInstance} from '../../../App';
import {WheelPicker} from 'react-native-wheel-picker-android';
import {Picker} from '@react-native-picker/picker';
import {GreyBtn} from '../../components/GreyBtn';

const PersonsQuizScreen = observer(({navigation}) => {
  const screen = network.registerOnboarding?.PersonsQuizScreen;

  const items = screen?.values;
  const withBack =
    Object.keys(network.registerOnboarding)[0] !== 'PersonsQuizScreen';

  const header = () => {
    return (
      <View style={{alignItems: 'center'}} key={'PersonsQuizScreenHeader'}>
        <Text style={styles.title}>{screen?.title}</Text>
        <Text style={[styles.subtitle, {color: screen?.description_color}]}>
          {screen?.description}
        </Text>
      </View>
    );
  };

  const {startAnim, fadeAnim, marginAnim, contentMargin} = QuizAnimation();

  const [selectedPers, setSelectedPers] = useState(
    screen?.default ? screen.default : 0,
  );

  useEffect(() => {
    if (Platform.OS == 'android') {
      InteractionManager.runAfterInteractions(() => {
        startAnim();
      });
    } else {
      startAnim();
    }
  }, []);

  const answerHandler = () => {
    sendDataToUrl({
      url: screen.route,
      data: {[screen?.key]: selectedPers},
    });
    navigation.navigate(screen?.next_board);
    ampInstance.logEvent('persons confirmed', {
      count: selectedPers,
    });
  };

  const skip = () => {
    network.changeProfilePersons(screen?.default);
    sendAnswer(
      screen?.request_to,
      'PersonsQuizScreen',
      undefined,
      undefined,
      undefined,
      screen?.default,
    );
    getMenu();
    if (screen?.next_board == 'LoginScreen' && !!network.user?.phone) {
      navigation.navigate('MainStack');
    } else {
      navigation.navigate(screen?.next_board);
    }
  };

  return (
    <>
      <SafeAreaView backgroundColor={'#FFF'} />
      <SkipHeader
        skip={() => skip()}
        goBack={() => navigation.goBack()}
        withSkip={screen?.continue_step}
        withBack={withBack}
      />
      <Animated.View
        style={{
          opacity: fadeAnim,
          flex: 1,
          backgroundColor: '#FFF',
          transform: [{translateY: marginAnim}],
        }}>
        {header()}
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            paddingBottom: common.getLengthByIPhone7(67),
          }}>
          <View />
          {Platform.OS == 'ios' ? (
            <Picker
              style={{
                width: common.getLengthByIPhone7(252),
                alignSelf: 'center',
                // height: 152,
              }}
              itemStyle={{
                fontSize: 22,
                fontWeight: 'bold',
                fontFamily:
                  Platform.OS == 'ios'
                    ? 'SF Pro Display'
                    : 'SFProDisplay-Regular',
                backgroundColor: 'transparent',
              }}
              selectedValue={selectedPers}
              onValueChange={itemValue => setSelectedPers(itemValue)}>
              {items?.map((item, index) => (
                <Picker.Item
                  label={item?.name}
                  value={item?.value}
                  key={index}
                />
              ))}
            </Picker>
          ) : (
            <WheelPicker
              data={items?.map(item => item.name)}
              style={{
                width: common.getLengthByIPhone7(252),
                alignSelf: 'center',
                height: 252,
              }}
              itemTextSize={22}
              selectedItemTextFontFamily={'SFProDisplay-Bold'}
              itemTextFontFamily={'SFProDisplay-Bold'}
              itemTextColor={Colors.grayColor}
              selectedItemTextSize={22}
              initPosition={2}
              hideIndicator={true}
              selectedItemTextColor={Colors.textColor}
              onItemSelected={index => setSelectedPers(items[index].value)}
              backgroundColor="white"
            />
          )}
          <Btn
            title={screen?.button_text}
            customStyle={{
              width: common.getLengthByIPhone7(140),
              alignSelf: 'center',
              backgroundColor: screen?.button_background,
            }}
            onPress={() => answerHandler()}
            underlayColor={screen?.button_background}
            customTextStyle={{color: screen?.button_text_color}}
          />
        </View>
      </Animated.View>
      <SafeAreaView backgroundColor={'#FFF'} />
    </>
  );
});

export default PersonsQuizScreen;

const styles = StyleSheet.create({
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 22,
    lineHeight: 26,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
    marginVertical: 27,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '500',
    textAlign: 'center',
    color: Colors.grayColor,
    marginBottom: 20,
  },
});
