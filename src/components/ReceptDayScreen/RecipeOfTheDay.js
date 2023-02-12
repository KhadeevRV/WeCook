import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  Image,
  Platform,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {FlatList, ScrollView} from 'react-native-gesture-handler';
import common from '../../../Utilites/Common';
import {getStatusBarHeight, getBottomSpace} from 'react-native-iphone-x-helper';
import Colors from '../../constants/Colors';
import {BlurView} from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import GestureRecognizer from 'react-native-swipe-gestures';
import {strings} from '../../../assets/localization/localization';
import network from "../../../Utilites/Network";

const RecipeOfTheDay = ({
  recept,
  onPress,
  blur = false,
  onSwipeUp = () => null,
  isLast = false,
}) => {
  const screenHeight =
    Dimensions.get('window').height +
    Platform.select({ios: 0, android: getStatusBarHeight()});
  const config = {
    velocityThreshold: 0.3,
    directionalOffsetThreshold: 80,
  };
  const Box = ({children}) => {
    if (isLast) {
      return (
        <GestureRecognizer config={config} onSwipeUp={() => onSwipeUp()}>
          {children}
        </GestureRecognizer>
      );
    } else {
      return <View>{children}</View>;
    }
  };
  const navbarHeight = Dimensions.get('screen').height - screenHeight;

  return (
    <Box>
      <TouchableOpacity onPress={() => onPress()} activeOpacity={1}>
        <FastImage
          style={{
            width: '100%',
            height: screenHeight,
            paddingBottom:
              common.getLengthByIPhone7(33) +
              Platform.select({ios: getBottomSpace(), android: navbarHeight}),
            justifyContent: 'flex-end',
          }}
          source={{uri: recept?.images?.big_webp}}
          key={recept?.images?.big_webp}>
          {blur ? (
            <BlurView
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                // borderRadius:17
              }}
              blurType="light"
              blurAmount={24}
              blurRadius={24}
              reducedTransparencyFallbackColor={'#FFF'}
            />
          ) : null}
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0,0)']}
            style={{
              position: 'absolute',
              width: '100%',
              top: 0,
              height: common.getLengthByIPhone7(104),
            }}
          />
          <LinearGradient
            colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, .4)']}
            style={{
              position: 'absolute',
              bottom: 0,
              height: common.getLengthByIPhone7(208),
              width: '100%',
            }}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 13,
              paddingHorizontal: 16,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image
                style={{width: 17, height: 17}}
                source={require('../../../assets/icons/clock.png')}
              />
              <Text style={styles.timeText}>
                {recept?.cook_time} {network.strings?.MinutesFull}
              </Text>
              {recept?.labels?.keto ? (
                <>
                  <Image
                    style={{width: 16, height: 18, marginLeft: 12}}
                    source={require('../../../assets/icons/keto.png')}
                  />
                  <Text style={{...styles.timeText, color: '#D7FF95'}}>
                    {network.strings?.Keto}
                  </Text>
                </>
              ) : recept?.labels?.vegan ? (
                <>
                  <Image
                    style={{width: 17, height: 17, marginLeft: 12}}
                    source={require('../../../assets/icons/vegan.png')}
                  />
                  <Text style={{...styles.timeText, color: Colors.greenColor}}>
                    {network.strings?.Vegeterian}
                  </Text>
                </>
              ) : recept?.labels?.lowcarb ? (
                <>
                  <Image
                    style={{width: 16, height: 16, marginLeft: 12}}
                    source={require('../../../assets/icons/lowcal.png')}
                  />
                  <Text style={{...styles.timeText, color: '#FFF495'}}>
                    {network.strings?.LowCarb}
                  </Text>
                </>
              ) : null}
            </View>
            <View
              style={{
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderWidth: 1,
                borderColor: '#FFF',
                borderRadius: 18,
              }}>
              <Text style={styles.priceText}>{recept?.price_text}</Text>
            </View>
          </View>
          <Text style={styles.title}>{recept?.name}</Text>
        </FastImage>
      </TouchableOpacity>
    </Box>
  );
};

export default RecipeOfTheDay;

const styles = StyleSheet.create({
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 22,
    lineHeight: 26,
    paddingHorizontal: 16,
    color: '#FFF',
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
  },
  timeText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 13,
    lineHeight: 15,
    fontWeight: '500',
    color: '#FFF',
    marginLeft: 4,
  },
  priceText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Bold',
    }),
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '700',
    color: '#FFF',
  },
});
