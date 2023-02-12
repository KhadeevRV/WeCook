import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  TouchableHighlight,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Colors from '../constants/Colors';
import network, {selectUserAddress} from '../../Utilites/Network';
import {observer} from 'mobx-react-lite';
import Modal from 'react-native-modal';
import {getBottomSpace} from 'react-native-iphone-x-helper';
import {runInAction} from 'mobx';
import FastImage from 'react-native-fast-image';
import common from '../../Utilites/Common';
import {strings} from '../../assets/localization/localization';

export const UnavailableProductsModal = observer(
  ({modal, closeModal, unavailableRecipe}) => {
    const body = useMemo(() => {
      let view = [];
      if (unavailableRecipe?.id) {
        const products = network.unavailableRecipes.find(
          rec => rec.id == unavailableRecipe.id,
        )?.products;
        if (products) {
          for (let i = 0; i < products.length; i++) {
            let product = products[i];
            view.push(
              <View
                style={styles.rowFront}
                collapsable={false}
                key={product.id}>
                <FastImage
                  source={{uri: product?.images}}
                  style={[styles.image, {opacity: 0.5}]}
                />
                <View style={{flex: 1}}>
                  <Text
                    collapsable={false}
                    allowFontScaling={false}
                    style={[styles.text, {opacity: 0.5, marginTop: 8}]}
                    numberOfLines={1}>
                    {product?.name}
                  </Text>
                  {product?.description && (
                    <Text
                      allowFontScaling={false}
                      style={{
                        ...styles.descrText,
                        opacity: 0.5,
                        marginTop: 4,
                      }}>
                      {product?.description}
                    </Text>
                  )}
                  <View
                    style={{
                      flexGrow: 1,
                      width: '100%',
                      marginTop: 4,
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        flexGrow: 1,
                      }}>
                      <Image
                        source={require('../../assets/icons/unavailable.png')}
                        style={{
                          width: 11,
                          height: 11,
                          marginRight: 4,
                        }}
                      />
                      <Text
                        style={[
                          styles.descrText,
                          {color: '#FF0000', flexGrow: 1},
                        ]}>
                        {network.strings?.OutOfStock}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>,
            );
          }
        }
      }
      return view;
    }, [unavailableRecipe, modal]);

    return (
      <Modal
        animationIn="slideInUp"
        animationOut="slideOutDown"
        isVisible={modal}
        onRequestClose={() => closeModal()}
        onBackdropPress={() => closeModal()}
        swipeDirection={['down']}
        onSwipeComplete={() => closeModal()}
        propagateSwipe={true}
        backdropOpacity={0.4}
        style={{margin: 0, justifyContent: 'flex-end'}}>
        <View style={styles.mainBlock}>
          <Text style={styles.title}>{network?.strings?.NowUnavailable}</Text>
          <ScrollView bounces={false} style={{maxHeight: 300}}>
            {body}
          </ScrollView>
          <TouchableHighlight
            onPress={closeModal}
            style={styles.touchContainer}
            disabled={network.isLoadingBasket}
            underlayColor={Colors.underLayYellow}>
            <Text style={styles.subText}>{network?.strings?.NotAdd}</Text>
          </TouchableHighlight>
          <TouchableOpacity
            style={{alignItems: 'center', paddingVertical: 17}}
            disabled={network.isLoadingBasket}
            onPress={() => {
              network.basketHandle(
                false,
                unavailableRecipe.id,
                unavailableRecipe.persons,
              );
              closeModal();
            }}>
            <Text style={styles.subText}>{network?.strings?.StillAdd}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  title: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 16,
    alignSelf: 'center',
    lineHeight: 19,
    marginBottom: 21,
    color: Colors.textColor,
    fontWeight: 'bold',
  },
  mainBlock: {
    backgroundColor: '#FFF',
    paddingBottom: 8 + getBottomSpace(),
    paddingTop: 22,
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
  },
  rowFront: {
    flexDirection: 'row',
    // flexWrap: 'wrap',
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  image: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 12,
    zIndex: 100,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  subText: {
    fontFamily: Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Medium',
    fontSize: 16,
    lineHeight: 19,
    color: Colors.textColor,
    fontWeight: '500',
  },
  text: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 14,
    lineHeight: 17,
    fontWeight: '500',
    maxWidth: common.getLengthByIPhone7(250),
    color: Colors.textColor,
  },
  descrText: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    color: Colors.grayColor,
  },
  touchContainer: {
    backgroundColor: Colors.yellow,
    marginHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
  },
});
