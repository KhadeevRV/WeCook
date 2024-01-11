import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Colors from '../../constants/Colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  useDerivedValue,
  Easing,
} from 'react-native-reanimated';
import {TextInput, TouchableHighlight} from 'react-native-gesture-handler';

const Loader = ({isLoading, title, onEnd, canFinish = true}) => {
  const offset = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [percent, setPercent] = useState(0);
  const [allFinished, setAllFinished] = useState(false);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      width: offset.value + '%',
    };
  });
  const animatedImage = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const onEndedLoad = () => {
    setAllFinished(true);
    onEnd();
  };

  const recordResult = value => {
    setPercent(Math.round(value));
    value == 100 ? onEndedLoad() : null;
  };

  useDerivedValue(() => {
    runOnJS(recordResult)(offset.value);
  });

  useEffect(() => {
    if (isLoading) {
      offset.value = withTiming(canFinish ? 100 : 98, {
        duration: 3000,
        easing: Easing.bezier(
          Math.random(),
          Math.random(),
          Math.random(),
          Math.random(),
        ),
      });
    }
  }, [isLoading, canFinish]);

  useEffect(() => {
    if (allFinished) {
      opacity.value = withTiming(1, {duration: 1000});
    }
  }, [allFinished]);

  return (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}>
        <Text
          style={[
            styles.title,
            {color: isLoading ? Colors.textColor : Colors.grayColor},
          ]}>
          {title}
        </Text>
        {allFinished ? (
          <Animated.Image
            source={require('../../../assets/icons/checkbox.png')}
            style={[{width: 19, height: 19}, animatedImage]}
          />
        ) : (
          <Text
            style={[
              styles.percentText,
              {color: isLoading ? Colors.textColor : Colors.grayColor},
            ]}>
            {percent}%
          </Text>
        )}
      </View>
      <View style={styles.loaderWrapper}>
        <Animated.View style={[styles.loaderComplete, animatedStyles]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '500',
  },
  percentText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '500',
    color: Colors.textColor,
  },
  loaderWrapper: {
    backgroundColor: '#EEEEEE',
    borderRadius: 20,
    width: '100%',
    height: 10,
  },
  loaderComplete: {
    backgroundColor: '#FFD600',
    borderRadius: 20,
    height: 10,
  },
});

export default Loader;
