import React, {useState, useMemo, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import {
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
} from 'react-native-gesture-handler';
import common from '../../../Utilites/Common';
import {getStatusBarHeight, getBottomSpace} from 'react-native-iphone-x-helper';
import Colors from '../../constants/Colors';
import {BlurView} from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import {observer} from 'mobx-react-lite';
import network from '../../../Utilites/Network';
import {ShadowView} from '../ShadowView';
import {strings} from '../../../assets/localization/localization';
import {GreyBtn} from '../GreyBtn';

const ImageView = ({uri, onPress, horizontal, isLoading}) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={isLoading} activeOpacity={1}>
      <LinearGradient
        colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0,.3)']}
        style={{
          width: '100%',
          height: 100,
          position: 'absolute',
          zIndex: 100,
          bottom: 0,
        }}
      />
      <FastImage
        source={{uri}}
        style={{
          width: horizontal ? 272 : 160,
          height: 176,
        }}
      />
    </TouchableOpacity>
  );
};

export const getLabelImage = label => {
  if (label?.lowcarb) {
    return (
      <Image
        source={require('../../../assets/icons/lowcal.png')}
        style={{width: 16, height: 16}}
      />
    );
  } else if (label?.vegan) {
    return (
      <Image
        source={require('../../../assets/icons/vegan.png')}
        style={{width: 16, height: 16}}
      />
    );
  } else if (label?.keto) {
    return (
      <Image
        source={require('../../../assets/icons/keto.png')}
        style={{width: 16, height: 16}}
      />
    );
  } else {
    return null;
  }
};

// recept - сам рецепт, onPress - нажатие на рецепт, listHandler - хендлер нажатия на иконку списка

const DayRecipeCard = observer(({recept, onPress, listHandler}) => {
  const [page, setPage] = useState(0);
  const isBig = !!recept?.is_big;
  const isInList = !!network.listDishes.filter(item => item.id == recept.id)
    .length;
  const isInFavor = !!network.favorDishes.filter(item => item.id == recept.id)
    .length;
  const isLoading = network.isLoadingBasket == recept.id;
  const isUnavailable = !!network.unavailableRecipes.filter(
    item => item.id == recept.id,
  ).length;
  const isAccess = network.canOpenRec(recept);
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

  const handleFavor = useCallback(async () => {
    if (isInFavor) {
      network.deleteFromFavor(recept);
    } else {
      network.addToFavor(recept);
    }
  }, [isInFavor, recept]);

  const addFavorBtn = () => {
    const imgUri = isInFavor
      ? require('../../../assets/icons/heartRed.png')
      : require('../../../assets/icons/heart.png');
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
          onPress={handleFavor}
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

  const renderBtnTitle = () => {
    if (isLoading) {
      return (
        <ActivityIndicator
          color={Colors.textColor}
          style={{width: 14, height: 14}}
          size={14}
        />
      );
    }
    if (isAdded) {
      return (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={[styles.btnTitle, {marginRight: 2}]}>
            {network?.strings?.Added}
          </Text>
          <Image
            source={require('../../../assets/icons/complete.png')}
            style={{width: 10, height: 8}}
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
          <Text style={styles.btnTitle}>{network?.strings?.UnlockRecept}</Text>
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

  return (
    <>
      <ShadowView firstContStyle={{marginRight: 8}}>
        <TouchableOpacity
          onPress={onPress}
          disabled={isLoading}
          activeOpacity={1}
          style={{
            ...styles.card,
            width: isBig ? 272 : 160,
          }}>
          <View
            style={{
              width: '100%',
              height: 176,
              justifyContent: 'space-between',
            }}>
            <View
              style={{
                borderTopRightRadius: 16,
                borderTopLeftRadius: 16,
                overflow: 'hidden',
              }}>
              {!isAccess ? (
                <LinearGradient
                  colors={['rgba(0, 0, 0, 0.35)', 'rgba(0, 0, 0, .35)']}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    height: 176,
                    zIndex: 100,
                    width: '100%',
                  }}
                />
              ) : null}
              <ImageView
                key={recept?.images?.id}
                uri={recept?.images?.middle_webp}
                horizontal={isBig}
                onPress={() => onPress()}
                isLoading={isLoading}
              />
            </View>
            {addFavorBtn()}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                left: 12,
                position: 'absolute',
                bottom: 12,
                zIndex: 1,
                flexWrap: 'wrap',
                opacity: isAccess ? 1 : 0.75,
              }}>
              <Image
                style={{width: 16, height: 16}}
                source={require('../../../assets/icons/clock.png')}
              />
              <Text style={[styles.timeText, {marginRight: 9}]}>
                {recept?.cook_time} {network.strings?.minutes}
              </Text>
              {getLabelImage(recept?.labels)}
            </View>
          </View>
          <View
            style={{
              flexDirection: isBig ? 'row' : 'column',
              alignItems: isBig ? 'center' : 'stretch',
              paddingRight: isBig ? 12 : 8,
              paddingLeft: isBig ? 4 : 8,
              paddingVertical: isBig ? 10 : 8,
            }}>
            <View
              style={{
                paddingHorizontal: 8,
                justifyContent: isBig ? 'center' : 'flex-start',
                height: isBig ? 36 : 32,
                width: isBig ? 148 : '100%',
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
            <GreyBtn
              containerStyle={{
                alignItems: 'center',
                marginTop: isBig ? 0 : 8,
                paddingVertical: 7,
                width: isBig ? 108 : '100%',
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
        </TouchableOpacity>
      </ShadowView>
    </>
  );
});

export default DayRecipeCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
  },
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16,
    color: Colors.textColor,
  },
  timeText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Bold',
    }),
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 5,
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
