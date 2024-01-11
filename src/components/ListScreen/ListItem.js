import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {
  FlatList,
  ScrollView,
  TouchableHighlight,
} from 'react-native-gesture-handler';
import common from '../../../Utilites/Common';
import {getStatusBarHeight, getBottomSpace} from 'react-native-iphone-x-helper';
import Colors from '../../constants/Colors';
import {BlurView} from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import {observer} from 'mobx-react-lite';
import DropShadow from 'react-native-drop-shadow';
import network from '../../../Utilites/Network';

const ListItem = observer(({recept, onPress, eyeHandler}) => {
  const [openedEye, setOpenedEye] = useState(true);

  const eyeBtn = [
    <View
      style={{position: 'absolute', zIndex: 1000, top: 8, right: 8}}
      key={'eyeBtn' + recept?.id}>
      <TouchableOpacity
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: openedEye
            ? '#FFE600'
            : Platform.select({ios: null, android: '#E5E5E5'}),
          overflow: 'hidden',
        }}
        activeOpacity={1}
        onPress={() => {
          eyeHandler(openedEye);
          setOpenedEye(prev => !prev);
        }}>
        <>
          {Platform.OS == 'ios' && !openedEye ? (
            <BlurView
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                borderRadius: 17,
              }}
              blurType="xlight"
              blurAmount={24}
              blurRadius={24}
              reducedTransparencyFallbackColor={'#FFF'}
            />
          ) : null}
          <Image
            source={
              openedEye
                ? require('../../../assets/icons/openedEye.png')
                : require('../../../assets/icons/closedEye.png')
            }
            style={{width: 26, height: 18}}
          />
        </>
      </TouchableOpacity>
    </View>,
  ];
  // const image = Platform.OS == 'ios' ?
  const image = (
    <FastImage
      source={{uri: recept?.images?.big_webp}}
      style={{
        width: '100%',
        height: common.getLengthByIPhone7(80),
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      }}
    />
  );
  // :
  // <Image source={{uri:recept?.images?.big_webp}}
  //     style={{width:'100%',height:common.getLengthByIPhone7(80),borderTopLeftRadius:16,borderTopRightRadius:16}} />

  const personsIcons = [];

  for (let i = 0; i < recept.persons; i++) {
    personsIcons.push(
      <Image
        source={require('../../../assets/icons/onePerson.png')}
        style={{width: 8, height: 15, tintColor: '#FFF'}}
        key={i}
      />,
    );
  }

  return (
    <>
      <View
        style={{
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 10,
        }}>
        <TouchableOpacity
          onPress={() => onPress()}
          activeOpacity={1}
          style={{...styles.card}}>
          {eyeBtn}
          {openedEye ? null : (
            <View
              style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                borderRadius: 16,
                opacity: 0.4,
                zIndex: 100,
                backgroundColor: '#FFF',
              }}
            />
          )}
          <View>
            <LinearGradient
              colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0,.4)']}
              style={styles.linearView}>
              <View
                style={{flexDirection: 'row', alignItems: 'center', top: 2}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: 4,
                  }}>
                  {personsIcons}
                </View>
                <Text style={styles.personsText}>
                  {recept.persons}{' '}
                  {common.declOfNum(recept.persons, [
                    network?.strings?.Person,
                    network?.strings?.Persons,
                    network?.strings?.Persons2,
                  ])}
                </Text>
              </View>
            </LinearGradient>
            {image}
          </View>
          <View style={{height: 48, justifyContent: 'center'}}>
            <Text style={styles.title} numberOfLines={2}>
              {recept?.name}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
});

export default ListItem;

const styles = StyleSheet.create({
  card: {
    width: (common.getLengthByIPhone7() - 39) / 2,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    backgroundColor: '#FFF',
    marginRight: 7,
    borderRadius: 16,
  },
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 12,
    lineHeight: 14,
    paddingHorizontal: 16,
    fontWeight: '500',
    color: Colors.textColor,
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
  linearView: {
    position: 'absolute',
    bottom: 0,
    zIndex: 100,
    width: '100%',
    paddingTop: 14,
    paddingBottom: 11,
    paddingLeft: 12,
  },
  personsText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    color: '#FFF',
  },
});
