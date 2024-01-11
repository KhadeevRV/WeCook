import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
  TouchableHighlight,
  ActivityIndicator,
} from 'react-native';
import Colors from '../../constants/Colors';
import common from '../../../Utilites/Common';
import network from '../../../Utilites/Network';
import {observer} from 'mobx-react-lite';
import Modal from 'react-native-modal';
import Config from '../../constants/Config';
import FastImage from 'react-native-fast-image';
import {BlurView} from '@react-native-community/blur';
import {getBottomSpace} from 'react-native-iphone-x-helper';
import {strings} from '../../../assets/localization/localization';

export const DeliveryModal = observer(
  ({modal, closeModal, store = {}, isService}) => {
    const content = isService
      ? network.basketInfo?.service_info
      : network.basketInfo?.delivery_info;
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
          <Text style={styles.title}>{content?.title}</Text>
          <View style={styles.line} />
          <Text style={[styles.subtitle, {marginTop: 9, marginBottom: 3}]}>
            {content?.content_1}
          </Text>
          {content?.content_2 ? (
            <Text style={[styles.description, {marginBottom: 9}]}>
              {content.content_2}
            </Text>
          ) : null}
          {isService ? null : (
            <>
              <View style={[styles.line, {marginBottom: 20}]} />
              <Text style={[styles.description, {marginBottom: 12}]}>
                {network.strings?.DeliveryTerms}
              </Text>
              <View style={[styles.row, {justifyContent: 'space-between'}]}>
                <View style={styles.row}>
                  <Image
                    source={require('../../../assets/icons/listMenu.png')}
                    style={{width: 22, height: 22, marginRight: 9}}
                  />
                  <Text style={styles.subtitle}>{network.strings?.DeliveryText}</Text>
                </View>
                <Text style={styles.subtitle}>
                  {network.basketInfo?.delivery_time}
                </Text>
              </View>
              <View
                style={[
                  styles.row,
                  {
                    justifyContent: 'space-between',
                    marginTop: 15,
                    marginBottom: 37,
                  },
                ]}>
                <View style={styles.row}>
                  <Image
                    source={require('../../../assets/icons/basket.png')}
                    style={{width: 22, height: 22, marginRight: 9}}
                  />
                  <Text style={styles.subtitle}>{network.strings?.MinOrderAmount}</Text>
                </View>
                <Text style={styles.subtitle}>
                  {network.basketInfo?.order_min_text_2}
                </Text>
              </View>
            </>
          )}
          <TouchableHighlight
            onPress={() => closeModal()}
            style={styles.touchContainer}
            underlayColor={Colors.underLayYellow}>
            <Text style={styles.touchText}>{network.strings?.PopOverOK}</Text>
          </TouchableHighlight>
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
    marginBottom: common.getLengthByIPhone7(22),
    color: Colors.textColor,
    fontWeight: 'bold',
  },
  mainBlock: {
    backgroundColor: '#FFF',
    paddingBottom: getBottomSpace() + 6,
    paddingHorizontal: 16,
    paddingTop: common.getLengthByIPhone7(22),
    borderTopStartRadius: common.getLengthByIPhone7(24),
    borderTopEndRadius: common.getLengthByIPhone7(24),
  },
  line: {
    width: '100%',
    height: 0.5,
    backgroundColor: '#D3D3D3',
  },
  subtitle: {
    fontFamily: Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Medium',
    fontSize: 16,
    lineHeight: 19,
    color: Colors.textColor,
    fontWeight: '500',
  },
  description: {
    fontFamily: Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Medium',
    fontSize: 12,
    lineHeight: 14,
    color: Colors.grayColor,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  touchContainer: {
    backgroundColor: Colors.yellow,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 16,
  },
  touchText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '500',
    color: '#FFF',
    textAlign: 'center',
  },
});
