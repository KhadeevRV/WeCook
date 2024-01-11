import React, {
  Component,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Animated,
  Platform,
  InteractionManager,
  Dimensions,
  Image,
  UIManager,
  LayoutAnimation,
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
import network, {sendAnswer, sendDataToUrl} from '../../../Utilites/Network';
import QuizAnimation from '../../animations/QuizAnimation';
import {useInterval} from '../ReceptScreen';
import ReAnimated, {FadeIn, Layout} from 'react-native-reanimated';
import {getBottomSpace} from 'react-native-iphone-x-helper';

const ChooseEatScreen = observer(({navigation}) => {
  const screen = network.registerOnboarding.ChooseEatScreen;
  const {startAnim, fadeAnim, marginAnim, contentMargin} = QuizAnimation();
  const data = screen?.values;
  const [selected, setSelected] = useState(0);
  const withBack =
    Object.keys(network.registerOnboarding)[0] !== 'ChooseEatScreen';

  const header = () => {
    return (
      <View style={{alignItems: 'center'}} key={'ChooseEatScreenHeader'}>
        <Text style={styles.title}>{screen?.title}</Text>
        <Text style={[styles.subtitle, {color: screen?.description_color}]}>
          {screen?.description}
        </Text>
      </View>
    );
  };

  const answerHandler = () => {
    const answer = data[selected];
    sendDataToUrl({url: screen.route, data: {[screen?.key]: answer.value}});
    navigation.navigate(screen?.next_board);
  };

  const skipQuest = () => {
    if (screen?.next_board == 'LoginScreen' && !!network.user?.phone) {
      navigation.navigate('MainStack');
    } else {
      navigation.navigate(screen?.next_board);
    }
  };

  useEffect(() => {
    startAnim();
  }, []);

  const [scrollValue, setScrollValue] = useState(0);
  const [time, setTime] = useState(0);
  const delay = 50;
  useInterval(() => {
    if (time != 0) {
      const date = new Date();
      if (date - time > 50 && time != 0) {
        setSelected(scrollValue);
        setTime(0);
      }
    }
  }, delay);

  const screens = [];

  for (let i = 0; i < data?.length; i++) {
    screens.push(common.getLengthByIPhone7(260) * i);
  }

  const renderTitle = useCallback(() => {
    const titles = [];
    data?.forEach((item, index) =>
      titles.push(
        index === selected && (
          <ReAnimated.Text
            style={{...styles.imgTitle}}
            key={index}
            entering={FadeIn.duration(500)}>
            {item?.text}
          </ReAnimated.Text>
        ),
      ),
    );
    return <View style={{justifyContent: 'center'}}>{titles}</View>;
  }, [selected]);

  return (
    <>
      <SafeAreaView backgroundColor={'#FFF'} />
      <SkipHeader
        skip={() => skipQuest()}
        goBack={() => navigation.goBack()}
        withSkip={screen?.continue_step}
        withBack={withBack}
      />
      <Animated.View
        style={{
          opacity: fadeAnim,
          backgroundColor: '#FFF',
          transform: [{translateY: marginAnim}],
        }}>
        {header()}
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            alignItems: 'center',
            paddingHorizontal: common.getLengthByIPhone7(50),
            paddingTop: common.getLengthByIPhone7(73),
          }}
          scrollEventThrottle={8}
          pagingEnabled={true}
          disableIntervalMomentum={true}
          decelerationRate={0}
          snapToInterval={common.getLengthByIPhone7(260)}
          snapToAlignment={'center'}
          snapToOffsets={screens}
          onScroll={event => {
            let page = Math.round(
              (
                event.nativeEvent.contentOffset.x /
                common.getLengthByIPhone7(280)
              ).toFixed(1),
            );
            setTime(new Date());
            setScrollValue(page);
          }}>
          {data?.map((item, index) => (
            <View
              style={{marginLeft: common.getLengthByIPhone7(10)}}
              key={index}>
              <Image
                source={{
                  uri: item?.icon,
                }}
                style={{
                  width: common.getLengthByIPhone7(250),
                  height: common.getLengthByIPhone7(250),
                }}
              />
            </View>
          ))}
        </ScrollView>
        {renderTitle()}
      </Animated.View>
      <Btn
        title={'Далее'}
        customTextStyle={{color: '#FFF'}}
        customStyle={styles.btn}
        onPress={() => answerHandler()}
      />
      <SafeAreaView />
    </>
  );
});

export default ChooseEatScreen;

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
  imgTitle: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 22,
    lineHeight: 26,
    color: Colors.textColor,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
  },
  btn: {
    width: common.getLengthByIPhone7(140),
    alignSelf: 'center',
    position: 'absolute',
    bottom: common.getLengthByIPhone7(67) + getBottomSpace(),
  },
});
