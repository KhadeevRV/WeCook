import React, {useMemo, useState} from 'react';
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

const PayWallItem = ({plan, onPress = () => null, pressed}) => {
  const [linewidth, setlinewidth] = useState(0);

  const checksView = useMemo(() => {
    const body = [];
    for (let i = 0; i < plan?.items?.length; i++) {
      const item = plan?.items[i];
      body.push(
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingVertical: 5,
            maxWidth: common.getLengthByIPhone7(290),
          }}
          key={item + i.toString()}>
          <Image
            source={require('../../../assets/icons/complete.png')}
            style={{
              width: 10,
              height: 8,
              marginRight: 9,
              tintColor: '#00C108',
              top: 6,
            }}
          />
          <Text style={{...styles.checkText}}>{item}</Text>
        </View>,
      );
    }
    return body;
  }, [plan?.items]);

  return (
    <TouchableHighlight
      style={{
        ...styles.card,
        backgroundColor: pressed ? '#FFF9D8' : '#F5F5F5',
        borderColor: pressed ? Colors.yellow : '#F5F5F5',
      }}
      underlayColor={'#FFF9D8'}
      onPress={() => onPress()}>
      <>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text style={styles.title}>{plan?.name}</Text>
          <Text style={styles.priceText}>{plan?.price}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 4,
          }}>
          {plan?.sale ? (
            <View style={styles.saleView}>
              <Text style={styles.hitText}>{plan?.sale}</Text>
            </View>
          ) : (
            <View />
          )}
          <Text style={[styles.desc]}>{plan?.desc}</Text>
        </View>
        {checksView}
        <View
          style={[
            styles.point,
            {backgroundColor: pressed ? Colors.underLayYellow : '#E9E6E6'},
          ]}>
          {pressed && (
            <Image
              source={require('../../../assets/icons/complete.png')}
              style={{width: 10, height: 8}}
            />
          )}
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
    borderWidth: 4,
    padding: 12,
    marginBottom: 8,
    minHeight: 98,
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
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    color: Colors.textColor,
  },
  hitText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay',
    }),
    fontSize: 12,
    lineHeight: 14,
    fontWeight: Platform.select({ios: '700', android: 'bold'}),
    color: '#FFF',
  },
  saleView: {
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: '#00C108',
  },
  priceText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
  },
  checkText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '500',
  },
  point: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    position: 'absolute',
    right: 12,
    bottom: 8,
  },
});

export default PayWallItem;
