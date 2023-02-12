import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import Colors from '../constants/Colors';
import {TouchableHighlight} from 'react-native-gesture-handler';
import common from '../../Utilites/Common';
import {Btn} from './Btn';
import {strings} from '../../assets/localization/localization';
import network from '../../Utilites/Network';

const SkipHeader = ({
  title = '',
  withBack = true,
  goBack = () => null,
  skip = () => null,
  withSkip = true,
  closeDisable = false,
  isLoading = false,
  renderCustomTitle = () => null,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 8,
        paddingRight: 16,
        paddingTop: 4,
        backgroundColor: '#FFF',
      }}>
      {renderCustomTitle()}
      {withBack && !closeDisable ? (
        <TouchableOpacity
          activeOpacity={1}
          disabled={isLoading}
          onPress={() => goBack()}
          style={{paddingLeft: 16, width: 16 + common.getLengthByIPhone7(98)}}>
          <Image
            source={require('../../assets/icons/back.png')}
            style={{width: 20, height: 20, tintColor: Colors.textColor}}
          />
        </TouchableOpacity>
      ) : (
        <View style={{width: 16 + common.getLengthByIPhone7(98)}} />
      )}
      {title.length ? <Text style={styles.title}>{title}</Text> : null}
      <Animated.View style={{opacity: fadeAnim}}>
        {withSkip && !closeDisable ? (
          <Btn
            title={network.strings?.Skip}
            backgroundColor={'#F5F5F5'}
            underlayColor={'#EEEEEE'}
            onPress={() => skip()}
            disabled={isLoading}
            customTextStyle={{
              fontSize: 14,
              lineHeight: 17,
              fontWeight: '500',
            }}
            customStyle={{
              paddingHorizontal: 16,
              borderRadius: 14,
              height: 28,
            }}
          />
        ) : (
          <View style={{width: common.getLengthByIPhone7(98)}} />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: Colors.textColor,
    fontSize: 16,
    lineHeight: 19,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    top: 2,
  },
});

export default SkipHeader;
