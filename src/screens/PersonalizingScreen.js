import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableHighlight,
  Platform,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import {observer} from 'mobx-react-lite';
import SkipHeader from '../components/SkipHeader';
import Colors from '../constants/Colors';
import Loader from '../components/PersonalizingScreen/Loader';
import network, {getMenu, getUserInfo} from '../../Utilites/Network';
import common from '../../Utilites/Common';
import {ShadowView} from '../components/ShadowView';
import {useInterval} from './ReceptScreen';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const ReviewView = ({review}) => {
  const stars = useMemo(() => {
    let starsView = [];
    for (let i = 1; i <= 5; i++) {
      starsView.push(
        <Image
          key={i}
          source={require('../../assets/icons/reviewStar.png')}
          style={{
            width: 24,
            height: 23,
            tintColor: i <= review?.rang ? '#FFB800' : Colors.grayColor,
          }}
        />,
      );
    }
    return starsView;
  }, [review?.rang]);

  return (
    <ShadowView
      key={review?.author}
      secondContStyle={{alignItems: 'center', padding: 16}}>
      <View style={{flexDirection: 'row'}}>{stars}</View>
      <Text style={[styles.reviewText, {marginVertical: 16}]}>
        {review?.text}
      </Text>
      <Text style={styles.authorText}>{review?.author}</Text>
    </ShadowView>
  );
};

const PersonalizingScreen = observer(({navigation, route}) => {
  const [firstLoader, setFirstLoader] = useState(true);
  const [secondLoader, setSecondLoader] = useState(false);
  const [thirdLoader, setThirdLoader] = useState(false);
  const [canFinish, setCanFinish] = useState(false);
  const [enableBtn, setEnableBtn] = useState(false);
  const [activeRev, setActiveRev] = useState(0);
  const flatListRef = useRef(null);
  const screen = network.onboarding?.PersonalizingScreen;

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const animatedText = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{translateY: translateY.value}],
    };
  });
  const delay = 4000;
  useInterval(() => {
    if (activeRev + 1 >= screen?.reviews?.length) {
      setActiveRev(0);
    } else {
      setActiveRev(prev => prev + 1);
    }
    // setActiveRev(prev => (prev + 1 > screen?.reviews?.length ? prev + 1 : 0));
  }, delay);

  useEffect(() => {
    screen?.reviews
      ? flatListRef?.current?.scrollToOffset({
          offset: activeRev * (common.getLengthByIPhone7() - 16),
          animated: true,
        })
      : null;
  }, [activeRev]);

  const onFetch = async () => {
    try {
      await getMenu();
      await getUserInfo();
      setCanFinish(true);
    } catch (e) {
      Alert.alert(network?.strings?.Error, e);
    }
  };

  const onEndAnimated = () => {
    opacity.value = withTiming(1, {duration: 1000});
    translateY.value = withSpring(0, {duration: 200});
    setEnableBtn(true);
  };

  useEffect(() => {
    onFetch();
  }, []);
  return (
    <>
      <SafeAreaView backgroundColor={'#FFF'} />
      <SkipHeader withBack={false} withSkip={false} title=" " />
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFF',
          paddingVertical: 6,
          justifyContent: 'space-between',
        }}>
        <View style={{paddingHorizontal: 16}}>
          <View style={{marginBottom: 34}}>
            {enableBtn ? (
              <Animated.Text style={[styles.title, animatedText]}>
                {network?.strings?.PersonalizingTitleDone}
              </Animated.Text>
            ) : (
              <Text style={[styles.title]}>
                {network?.strings?.PersonalizingTitle}
              </Text>
            )}
          </View>
          <View style={{marginBottom: 24}}>
            <Loader
              title={network?.strings?.PersonalizingLoadingText1}
              isLoading={firstLoader}
              onEnd={() => setSecondLoader(true)}
            />
          </View>
          <View style={{marginBottom: 24}}>
            <Loader
              title={network?.strings?.PersonalizingLoadingText2}
              isLoading={secondLoader}
              onEnd={() => setThirdLoader(true)}
            />
          </View>
          <Loader
            title={network?.strings?.PersonalizingLoadingText3}
            isLoading={thirdLoader}
            onEnd={() => onEndAnimated()}
            canFinish={canFinish}
          />
          <Text
            style={[
              styles.trustedText,
              {marginTop: common.getLengthByIPhone7(64)},
            ]}>
            {network?.strings?.PersonalizingTrusted}
          </Text>
        </View>
        <FlatList
          data={screen?.reviews}
          extraData={screen?.reviews}
          pagingEnabled
          scrollEnabled={false}
          ref={flatListRef}
          initialScrollIndex={0}
          initialNumToRender={100}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => item.text + index}
          renderItem={({item, index}) => (
            <View
              style={{
                width: common.getLengthByIPhone7() - 32,
                margin: 16,
                marginLeft: index ? 0 : 16,
              }}>
              <ReviewView review={item} />
            </View>
          )}
          horizontal
        />
        <View style={{paddingHorizontal: 16}}>
          <TouchableHighlight
            style={[styles.touchContainer, {opacity: enableBtn ? 1 : 0.5}]}
            onPress={() =>
              navigation.navigate(screen?.next_board ?? 'MainStack')
            }
            underlayColor={Colors.underLayYellow}
            disabled={!enableBtn}>
            <Text style={styles.btnText}>
              {network?.strings?.PersonalizingProceed}
            </Text>
          </TouchableHighlight>
          <SafeAreaView style={{backgroundColor: '#FFF'}} />
        </View>
      </View>
    </>
  );
});

export default PersonalizingScreen;

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
  },
  trustedText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
    textAlign: 'center',
  },
  btnText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '500',
    color: '#FFF',
  },
  touchContainer: {
    backgroundColor: '#7CB518',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  reviewText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '500',
    color: Colors.textColor,
  },
  authorText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 12,
    lineHeight: 14,
    color: '#9A9A9A',
  },
});
