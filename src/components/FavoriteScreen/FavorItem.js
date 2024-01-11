import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Dimensions,
  Image,
  Platform,
  TouchableHighlight,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  FlatList,
  ScrollView,
  TouchableOpacity,
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
import {getLabelImage} from '../MenuScreen/DayRecipeCard';
import {GreyBtn} from '../GreyBtn';

const FavorItem = observer(
  ({recept, onPress, listHandler, fromHoliday = false}) => {
    const isInList = !!network.listDishes.filter(item => item.id == recept.id)
      .length;
    const isInFavor = !!network.favorDishes.filter(item => item.id == recept.id)
      .length;
    const isAccess = network?.canOpenRec(recept);
    const isLoading = network.isLoadingBasket == recept.id;
    const isUnavailable =
      network.isBasketUser() &&
      !!network.unavailableRecipes.filter(item => item.id == recept.id).length;
    const isInBasket = useMemo(() => {
      if (network.basketInfo?.recipes) {
        const hasRec = network.basketInfo?.recipes?.find(
          rec => rec == recept?.id,
        );
        if (hasRec) {
          return true;
        }
        return false;
      }
      return false;
    }, [network.basketInfo?.recipes]);

    const isAdded = useMemo(() => {
      if (network.isBasketUser()) {
        return isInBasket;
      } else {
        return isInList;
      }
    }, [isInBasket, isInList, network.isBasketUser()]);

    const deleteFromFavor = useCallback(async () => {
      Alert.alert(
        network?.strings?.Attention,
        network?.strings?.FavorAlertTitle,
        [
          {
            text: network?.strings?.Yes,
            onPress: () => network.deleteFromFavor(recept),
          },
          {
            text: network?.strings?.DeleteButtonCancel,
            style: 'destructive',
          },
        ],
        {cancelable: true},
      );
    }, [recept]);

    const isNewView = [
      <View
        style={{
          position: 'absolute',
          zIndex: 2000,
          top: 10,
          left: 10,
          paddingHorizontal: 6,
          paddingVertical: 1,
          borderRadius: 20,
          backgroundColor: Colors.textColor,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={styles.newText}>NEW</Text>
      </View>,
    ];

    const isNew = !!recept?.new;

    const renderBtnTitle = () => {
      if (isLoading) {
        return (
          <ActivityIndicator
            color={isAdded ? '#FFF' : Colors.textColor}
            style={{marginVertical: 8, width: 6, height: 6}}
            size={6}
          />
        );
      }
      if (isAdded) {
        return (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={[styles.btnTitle, {marginRight: 2, color: '#FFF'}]}>
              {network?.strings?.Added}
            </Text>
            <Image
              source={require('../../../assets/icons/complete.png')}
              style={{width: 10, height: 8, tintColor: '#FFF'}}
            />
          </View>
        );
      }
      if (!isAccess) {
        return (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image
              source={require('../../../assets/icons/accessRec.png')}
              style={{width: 14, height: 14, marginRight: 2}}
            />
            <Text style={styles.btnTitle}>
              {network?.strings?.UnlockRecept}
            </Text>
          </View>
        );
      }
      return (
        <Text style={styles.btnTitle}>
          {network.isBasketUser()
            ? network?.strings?.RecipeBasketAdd
            : network?.strings?.RecipeListAdd}
        </Text>
      );
    };

    const addFavorBtn = () => {
      const imgUri = require('../../../assets/icons/heartRed.png');
      return (
        <View style={{position: 'absolute', zIndex: 2000, top: 10, right: 10}}>
          <TouchableOpacity
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: Platform.select({ios: null, android: '#E5E5E5'}),
              overflow: 'hidden',
            }}
            onPress={deleteFromFavor}
            activeOpacity={1}>
            <>
              {Platform.OS == 'ios' ? (
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
              <Image source={imgUri} style={{width: 22, height: 21}} />
            </>
          </TouchableOpacity>
        </View>
      );
    };

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
            shadowRadius: 8,
          }}>
          <TouchableOpacity
            onPress={() => onPress()}
            activeOpacity={1}
            style={[styles.card, {marginBottom: fromHoliday ? 16 : 20}]}>
            <FastImage
              source={{uri: recept?.images?.big_webp}}
              key={recept?.images?.big_webp}
              style={styles.image}>
              {isNew ? isNewView : null}
              {addFavorBtn()}
              {isAccess ? null : (
                <View
                  style={[
                    styles.image,
                    {
                      position: 'absolute',
                      backgroundColor: 'rgba(0,0,0,.4)',
                      zIndex: 100,
                    },
                  ]}
                />
              )}
              <LinearGradient
                colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, .35)']}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingBottom: 13,
                  paddingHorizontal: 16,
                  paddingTop: 27,
                }}>
                <Image
                  style={{width: 20, height: 17}}
                  source={require('../../../assets/icons/hat.png')}
                />
                <Text style={styles.timeText}>{recept?.eating}</Text>
                <Image
                  style={{width: 17, height: 17, marginLeft: 12}}
                  source={require('../../../assets/icons/clock.png')}
                />
                <Text style={[styles.timeText, {marginRight: 9}]}>
                  {recept?.cook_time} {network?.strings?.MinutesFull}
                </Text>
                {getLabelImage(recept?.labels)}
              </LinearGradient>
            </FastImage>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                paddingVertical: 10,
              }}>
              <View
                style={{
                  paddingRight: 8,
                  justifyContent: 'center',
                  height: 36,
                  width: '50%',
                }}>
                <Text style={styles.title} numberOfLines={2}>
                  {isUnavailable ? (
                    <View style={{width: 11, height: 11, marginRight: 4}}>
                      <Image
                        style={{
                          width: 11,
                          height: 11,
                          top: Platform.OS == 'ios' ? 0 : 2,
                        }}
                        source={require('../../../assets/icons/unavailable.png')}
                      />
                    </View>
                  ) : null}
                  {Platform.OS == 'android' && isUnavailable ? '  ' : ''}
                  {recept?.name}
                </Text>
              </View>
              <View style={{width: '50%'}}>
                <GreyBtn
                  containerStyle={{
                    alignItems: 'center',
                    marginTop: 0,
                    paddingVertical: 7,
                    zIndex: 100,
                    // width: isBig ? 108 : '100%',
                  }}
                  backgroundColor={isAdded ? Colors.yellow : '#EEEEEE'}
                  underlayColor={isAdded ? Colors.underLayYellow : '#F5F5F5'}
                  onPress={() =>
                    listHandler(
                      network.isBasketUser() ? isInBasket : isInList,
                      recept,
                    )
                  }>
                  {renderBtnTitle()}
                </GreyBtn>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </>
    );
  },
);

export default FavorItem;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 10,
  },
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '500',
    color: Colors.textColor,
    maxWidth: common.getLengthByIPhone7() - 64,
  },
  timeText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    color: '#FFF',
    marginLeft: 4,
  },
  newText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 10,
    lineHeight: 12,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: '#FFF',
  },
  image: {
    width: common.getLengthByIPhone7() - 32,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    justifyContent: 'flex-end',
    height: common.getLengthByIPhone7(192),
  },
  btnTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Bold',
    }),
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
    color: Colors.textColor,
  },
});
