import React, {Component, useEffect} from 'react';
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
import network, {getMenu, sendAnswer} from '../../../Utilites/Network';
import QuizAnimation from '../../animations/QuizAnimation';
import {ampInstance} from '../../../App';
import {strings} from '../../../assets/localization/localization';

const PersonsQuizScreen = observer(({navigation}) => {
  const items = [
    {
      title: '1 ' + network.strings?.Person,
      id: 1,
      icons: [1],
    },
    {
      title: '2 ' + network.strings?.Persons,
      id: 2,
      icons: [1, 2],
    },
    {
      title: '3 ' + network.strings?.Persons,
      id: 3,
      icons: [1, 2, 3],
    },
    {
      title: '4 ' + network.strings?.Persons,
      id: 4,
      icons: [1, 2, 3, 4],
    },
    {
      title: '5 ' + network.strings?.Persons2,
      id: 5,
      icons: [1, 2, 3, 4, 5],
    },
    {
      title: '6 ' + network.strings?.Persons2,
      id: 6,
      icons: [1, 2, 3, 4, 5, 6],
    },
    {
      title: '7 ' + network.strings?.Persons2,
      id: 7,
      icons: [1, 2, 3, 4, 5, 6, 7],
    },
    {
      title: '8 ' + network.strings?.Persons2,
      id: 8,
      icons: [1, 2, 3, 4, 5, 6, 7, 8],
    },
  ];

  const header = () => {
    return (
      <View>
        <Text style={styles.title}>{network.strings?.ServeQuantity}</Text>
        <Text style={styles.subtitle}>
          {network.strings?.IngredientsAdjustment}
        </Text>
      </View>
    );
  };

  const screen = network.onboarding.PersonsQuizScreen;
  const {startAnim, fadeAnim, marginAnim, contentMargin} = QuizAnimation();

  useEffect(() => {
    if (Platform.OS == 'android') {
      InteractionManager.runAfterInteractions(() => {
        startAnim();
      });
    } else {
      startAnim();
    }
  }, []);

  const answerHandler = item => {
    sendAnswer(
      screen?.request_to,
      'SecondQuizScreen',
      item?.text,
      undefined,
      undefined,
      item.id,
    );
    network.changeProfilePersons(item.id);
    ampInstance.logEvent('persons confirmed', {count: item.id});
    // navigation.navigate('MainStack');
    if (screen?.next_board == 'LoginScreen' && !!network.user?.phone) {
      navigation.navigate('MainStack');
    } else {
      navigation.navigate(screen?.next_board);
    }
  };

  const skip = () => {
    network.changeProfilePersons(screen?.default);
    sendAnswer(
      screen?.request_to,
      'SecondQuizScreen',
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
      />
      <Animated.View
        style={{
          opacity: fadeAnim,
          flex: 1,
          backgroundColor: '#FFF',
          transform: [{translateY: marginAnim}],
        }}>
        <FlatList
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={header}
          data={items}
          style={{backgroundColor: '#FFF'}}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 50,
            paddingTop: 7,
          }}
          numColumns={2}
          keyExtractor={(item, index) => item.id}
          renderItem={({item, index}) => (
            <Animated.View
              style={{
                flex: 0.5,
                marginRight: index % 2 == 0 ? 15 : 0,
                transform: [{translateY: contentMargin}],
              }}>
              <QuizItem
                title={item.title}
                onPress={() => answerHandler(item)}
                icons={item.icons}
                persons={true}
              />
            </Animated.View>
          )}
        />
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
    marginBottom: 20,
  },
  subtitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '500',
    marginBottom: 20,
  },
});
