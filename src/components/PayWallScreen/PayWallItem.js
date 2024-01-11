import React, {useCallback, useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Colors from '../../constants/Colors';
import {TouchableHighlight} from 'react-native-gesture-handler';
import common from '../../../Utilites/Common';
import DropShadow from 'react-native-drop-shadow';
import LinearGradient from 'react-native-linear-gradient';
import network from '../../../Utilites/Network';

const PayWallItem = ({plan, onPress = () => null, pressed}) => {
  const color = useMemo(() => {
    if (pressed) {
      return '#FFF';
    }
    return Colors.textColor;
  }, [pressed]);

  const renderItems = useCallback(() => {
    if (plan?.items && plan?.items?.length) {
      return plan.items.map((item, i) => (
        <View
          key={i.toString()}
          style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
          <Text
            style={[styles.desc, {color: pressed ? '#FFF' : Colors.grayColor}]}>
            {item?.text}
          </Text>
          <Image
            style={{width: 24, height: 24, marginLeft: 8}}
            source={{uri: item?.icon}}
          />
        </View>
      ));
    }
    return null;
  }, [plan.items, pressed]);

  const isHit = plan?.hit;

  const renderHitView = useCallback(() => {
    if (isHit) {
      return (
        <LinearGradient
          colors={['rgba(255, 91, 1, 1)', 'rgba(255, 224, 1, 1)']}
          start={{x: 0, y: 1}}
          end={{x: 1, y: 1}}
          style={styles.hitView}>
          <Text style={styles.hitText} allowFontScaling={false}>
            {network?.strings?.Popular}
          </Text>
        </LinearGradient>
      );
    }
    return null;
  }, []);

  return (
    <TouchableHighlight
      style={{
        ...styles.card,
        backgroundColor: pressed ? Colors.yellow : '#EAEAEA',
        paddingTop: isHit ? 0 : 12,
      }}
      underlayColor={'rgba(234, 234, 234, 0.5)'}
      onPress={() => onPress()}>
      <>
        {renderHitView()}
        <View style={{paddingHorizontal: 16}}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Text style={[styles.title, {color}]}>{plan?.name}</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              {plan?.old_price ? (
                <Text
                  style={[
                    styles.priceText,
                    {
                      marginRight: 8,
                      textDecorationLine: 'line-through',
                      color,
                    },
                  ]}>
                  {plan?.old_price}
                </Text>
              ) : null}
              <Text style={[styles.priceText, {color}]}>{plan?.price}</Text>
            </View>
          </View>
          {plan?.desc || plan?.items?.length ? (
            <View
              style={{
                marginTop: 8,
              }}>
              <Text
                style={[
                  styles.desc,
                  {color: pressed ? '#FFF' : Colors.grayColor},
                ]}>
                {plan?.desc}
              </Text>
              {renderItems()}
            </View>
          ) : null}
        </View>
      </>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay',
    }),
    fontSize: 16,
    lineHeight: 19,
    color: Colors.textColor,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
  },
  desc: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 13,
    lineHeight: 14,
    letterSpacing: -0.24,
    fontWeight: '500',
    color: Colors.textColor,
  },
  hitView: {
    paddingVertical: 4,
    alignItems: 'center',
    marginBottom: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  hitText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Bold',
    }),
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: -0.24,
    color: '#FFF',
  },
  saleView: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    marginLeft: 6,
    borderRadius: 10,
    backgroundColor: '#FE9700',
  },
  priceText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '500',
    color: Colors.textColor,
  },
});

export default PayWallItem;
