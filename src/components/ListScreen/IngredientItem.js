import React, {useState, useEffect, useRef} from 'react';
import {
  Platform,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  Pressable,
  AsyncStorage,
} from 'react-native';
import Colors from '../../constants/Colors';
import common from '../../../Utilites/Common';
// import { setBuyed } from '../../../Utilites/Network';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {TouchableHighlight} from 'react-native-gesture-handler';
import {Easing} from 'react-native-reanimated';
import FastImage from 'react-native-fast-image';
import {runInAction} from 'mobx';
import network, {ingredientHandler} from '../../../Utilites/Network';

export const IngredientItem = ({
  item,
  onPress = () => null,
  display = 'flex',
}) => {
  const [direction, setDirection] = useState(!item.is_buyed);
  // const [currentColor, setCurrentColor] = useState(Colors.greenColor)
  const [currentItem, setcurrentItem] = useState(item);
  const options = {
    enableVibrateFallback: false,
    ignoreAndroidSystemSettings: true,
  };

  const onSwipeValueChange = swipeData => {
    const {key, isBuyed} = swipeData;
    let newItem = currentItem;
    if (isBuyed == true) {
      if (!currentItem.is_buyed) {
        ReactNativeHapticFeedback.trigger(
          Platform.OS == 'ios' ? 'impactHeavy' : 'impactMedium',
          options,
        );
        // setBuyed(true,key)
      }
      newItem.is_buyed = true;
    } else if (isBuyed == false) {
      if (currentItem.is_buyed) {
        ReactNativeHapticFeedback.trigger(
          Platform.OS == 'ios' ? 'impactHeavy' : 'impactMedium',
          options,
        );
        // setBuyed(false,key)
      }
      newItem.is_buyed = false;
    }
    // // Проверка комбинированного продукта. Если продукт находится в нескольких блюдах, то необходимо внести изменения в общий массив для его ререндера
    // if(newItem.combined){
    const dishs = network.listDishes.filter(dish => {
      return dish.ingredients.findIndex(ing => ing.id == newItem.id) != -1;
    });
    for (let i = 0; i < dishs.length; i++) {
      let dish = dishs[i];
      // network.listDishes[network.listDishes.findIndex((item) => item.id == dish)]
      for (let j = 0; j < dish.ingredients.length; j++) {
        const element = dish.ingredients[j];
        if (element.id == newItem.id) {
          element.is_buyed = isBuyed;
          break;
        }
      }
    }
    // }
    setcurrentItem(newItem);
  };

  useEffect(() => {
    // setcurrentItem(item)
    // setDirection(!item.is_buyed)
    item.is_buyed ? onPressedIn(50) : null;
  }, [item]);

  const [textWidth, setTextWidth] = useState(0);
  const [viewWidth, setViewWidth] = useState(0);
  const [textCoords, setTextCoords] = useState(0);
  const [viewCoords, setViewCoords] = useState(0);
  const [animStart, setAnimStart] = useState(false);
  const textRef = React.useRef(View.prototype);
  const viewRef = React.useRef(View.prototype);
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  const animateStrike = (value, duration, what) => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration: duration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(() => {
      if (what === 'viewAnim') {
        setTimeout(() => {
          setAnimStart(false);
        }, 200);
      }
    });
  };

  const strikeWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, textWidth],
    extrapolate: 'clamp',
  });

  const animViewWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, viewWidth],
    extrapolate: 'clamp',
  });

  const onPressedIn = async (duration = 200) => {
    // console.warn('textRef.current',textRef.current)
    if (Platform.OS == 'ios') {
      setTimeout(() => {
        textRef.current.measure((x, y, w, h) => {
          setTextWidth(w);
          animateStrike(1, duration);
        });
        viewRef.current.measure((x, y, w, h) => {
          if (w != 0) {
            setViewWidth(w);
            animateStrike(1, duration, 'viewAnim');
          }
        });
      }, 100);
    } else {
      setTextWidth(textCoords);
      animateStrike(1, duration);
      setViewWidth(viewCoords);
      animateStrike(1, duration, 'viewAnim');
    }
  };
  const onPressedOut = async () => {
    // Animated.timing(animatedValue, {
    //     toValue: 0,
    //     duration: 200,
    //     easing: Easing.linear,
    //     useNativeDriver: false,
    // }).start();
    // console.warn(animStart)
    setTimeout(() => {
      animateStrike(0, 200);
    }, Platform.select({ios: 200, android: 100}));
  };
  return (
    <TouchableOpacity
      activeOpacity={1}
      underlayColor={'#000'}
      onPress={() => onPress()}
      style={{display: display}}>
      <View
        ref={viewRef}
        style={{
          ...styles.rowFront,
          backgroundColor: '#FFF',
        }}
        collapsable={false}
        onLayout={e => {
          Platform.OS == 'android'
            ? setViewCoords(e.nativeEvent.layout.width)
            : null;
        }}>
        <Animated.View
          collapsable={false}
          renderToHardwareTextureAndroid={true}
          style={{
            width: strikeWidth,
            top: 18,
            left: 68,
            position: 'absolute',
            zIndex: 100,
            height: 1,
            backgroundColor: animStart ? Colors.textColor : '#BCBCBC',
          }}
        />
        <Animated.View
          collapsable={false}
          style={{
            width: animViewWidth,
            opacity: animStart ? 1 : 0,
            position: 'absolute',
            height: common.getLengthByIPhone7(50),
            zIndex: 0,
            backgroundColor: '#EEEEEE',
          }}
        />
        <FastImage
          source={{uri: item?.images?.small_webp}}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            marginRight: 12,
            opacity: currentItem.is_buyed ? 0.5 : 1,
            zIndex: 100,
            // marginLeft: currentItem.is_buyed ? 16 : 0
          }}
        />
        <View>
          <Text
            ref={textRef}
            collapsable={false}
            allowFontScaling={false}
            style={{...styles.text, opacity: currentItem.is_buyed ? 0.5 : 1}}
            numberOfLines={1}
            onLayout={e => {
              Platform.OS == 'android'
                ? setTextCoords(e.nativeEvent.layout.width)
                : null;
            }}>
            {item?.name}
          </Text>
          <View style={{flexDirection: 'row', top: 1.5}}>
            <Text
              allowFontScaling={false}
              style={{
                ...styles.subText,
                opacity: currentItem.is_buyed ? 0.5 : 1,
              }}>
              {item?.count == 0 ? '' : item?.count + ' '}
            </Text>
            <Text
              allowFontScaling={false}
              style={{
                ...styles.subText,
                opacity: currentItem.is_buyed ? 0.5 : 1,
              }}>
              {item?.unit}
            </Text>
            {item?.piece ? (
              <Text
                allowFontScaling={false}
                style={{
                  ...styles.subText,
                  opacity: currentItem.is_buyed ? 0.5 : 1,
                }}>
                {' '}
                (~{Math.ceil(item?.count / item?.piece)} {item?.piece_unit})
              </Text>
            ) : null}
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            height: '100%',
            justifyContent: 'center',
            right: 0,
            paddingHorizontal: 16,
            position: 'absolute',
          }}
          onPress={() => {
            setAnimStart(true);
            currentItem.is_buyed ? onPressedOut() : onPressedIn();
            setTimeout(() => {
              ingredientHandler(
                currentItem.id,
                currentItem.is_buyed ? 'notbuy' : 'buy',
              );
              runInAction(() =>
                onSwipeValueChange({
                  key: currentItem.id.toString(),
                  isBuyed: !currentItem.is_buyed,
                }),
              );
            }, Platform.select({ios: 450, android: 300}));
          }}>
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: animStart
                ? Colors.yellow
                : currentItem.is_buyed
                ? '#FFF'
                : '#EEEEEE',
              justifyContent: 'center',
              alignItems: 'center',
              // borderWidth:currentItem.is_buyed ? 0 : 1,
              // borderColor:'#B3B3B3',
            }}>
            {animStart ? (
              <Image
                style={{width: 8, height: 8}}
                source={require('../../../assets/icons/closeModal.png')}
              />
            ) : currentItem.is_buyed ? (
              <Image
                style={{width: 19, height: 18}}
                source={require('../../../assets/icons/refresh.png')}
              />
            ) : null}
          </View>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  title: {
    marginLeft: 16,
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 17,
    lineHeight: 20,
    marginBottom: 9,
    fontWeight: 'bold',
    color: Colors.textColor,
  },
  text: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '500',
    maxWidth: common.getLengthByIPhone7(250),
    color: Colors.textColor,
  },
  subText: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    color: Colors.grayColor,
  },
  buyText: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '500',
    color: '#FFF',
  },
  rowFront: {
    height: 50,
    // borderBottomWidth:0.5,
    // borderColor:'#F2F2F2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  rowBack: {
    alignItems: 'center',
    // backgroundColor: Colors.greenColor,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backRightBtn: {
    alignItems: 'flex-end',
    paddingRight: 24,
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: '50%',
  },
  backRightBtnRight: {
    backgroundColor: '#FE9700',
    right: 0,
  },
});
