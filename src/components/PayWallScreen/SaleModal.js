import React, {useRef, useState} from 'react';
import {View, Text, StyleSheet, Image, Platform, Alert} from 'react-native';
import Colors from '../../constants/Colors';
import common from '../../../Utilites/Common';
import network from '../../../Utilites/Network';
import {observer} from 'mobx-react-lite';
import Modal from 'react-native-modal';
import {getBottomSpace} from 'react-native-iphone-x-helper';
import {Btn} from '../Btn';
import {payHandle} from '../../screens/PayWallScreen';

export const SaleModal = observer(({modal, closeModal, navigation}) => {
  const data = network?.paywalls?.paywall_sale_modal;
  const modalRef = useRef(null);
  const [textLayout, setTextLayout] = useState({});
  const [loading, setLoading] = useState(false);

  const onPay = async () => {
    const isPayed = await payHandle(
      data,
      value => setLoading(value),
      navigation,
      false,
      {},
      true,
    );
    if (!isPayed) {
      return;
    }
    if (network.user?.phone) {
      closeModal();
    } else {
      closeModal();
      navigation.navigate('LoginScreen', {
        closeDisable: true,
        from: 'MenuScreen',
      });
    }
  };

  const onAlert = () => {
    Alert.alert(
      network?.strings?.SaleAlertTitle,
      network?.strings?.SaleAlertSubtitle,
      [
        {text: network?.strings?.SaleAlertAccept, onPress: closeModal},
        {
          text: network?.strings?.SaleAlertCancel,
          onPress: () => (modalRef?.current ? modalRef?.current?.open() : null),
        },
      ],
    );
  };
  return (
    <Modal
      animationIn="slideInUp"
      animationOut="slideOutDown"
      isVisible={modal}
      onRequestClose={() => (loading ? null : onAlert())}
      onBackdropPress={() => (loading ? null : onAlert())}
      swipeDirection={loading ? [] : ['down']}
      onSwipeComplete={() => (loading ? null : onAlert())}
      propagateSwipe={true}
      ref={modalRef}
      backdropOpacity={0.4}
      style={{margin: 0, justifyContent: 'flex-end'}}>
      <View style={styles.mainBlock}>
        <Text
          allowFontScaling={false}
          style={[styles.planTitle, {marginBottom: 4}]}>
          {data?.title}
        </Text>
        <Text
          allowFontScaling={false}
          style={[styles.subtitle, {marginBottom: 42}]}>
          {data?.subtitle}
        </Text>
        <View style={styles.planView}>
          {data?.desc ? (
            <View style={styles.circleView}>
              <Text
                style={[
                  styles.planPriceTitle,
                  {color: '#FFF', textAlign: 'center'},
                ]}>
                {data?.desc}
              </Text>
            </View>
          ) : null}
          <View style={{alignItems: 'center'}}>
            <Text allowFontScaling={false} style={styles.planPriceTitle}>
              {network?.strings?.SaleModalLeftTitle}
            </Text>
            <Text
              allowFontScaling={false}
              onLayout={e => setTextLayout(e.nativeEvent.layout)}
              style={[styles.planPriceValue, {marginVertical: 8}]}>
              {data?.old_price}
            </Text>
            <Image
              source={require('../../../assets/img/line.png')}
              style={{
                position: 'absolute',
                height: 7,
                width: textLayout?.width ? textLayout?.width + 5 : 0,
                top: 10 + (textLayout?.y ?? 0),
                tintColor: '#00C108',
              }}
            />
            <Text allowFontScaling={false} style={styles.planPriceDesc}>
              {network?.strings?.SaleModalPer}
            </Text>
          </View>
          <Image
            style={{
              width: 10,
              height: 18,
              transform: [{rotate: '180deg'}],
              tintColor: '#00C108',
            }}
            source={require('../../../assets/icons/goBack.png')}
          />
          <View style={{alignItems: 'center'}}>
            <Text allowFontScaling={false} style={styles.planPriceTitle}>
              {network?.strings?.SaleModalRightTitle}
            </Text>
            <Text
              allowFontScaling={false}
              style={[
                styles.planPriceValue,
                {marginVertical: 8, color: '#00C108',},
              ]}>
              {data?.price}
            </Text>
            <Text allowFontScaling={false} style={styles.planPriceDesc}>
              {network?.strings?.SaleModalPer}
            </Text>
          </View>
        </View>
        <Btn
          underlayColor={Colors.underLayYellow}
          title={loading ? network.strings?.Loading : network.strings?.Continue}
          backgroundColor={Colors.yellow}
          disabled={loading}
          customStyle={{
            width: common.getLengthByIPhone7(0) - common.getLengthByIPhone7(96),
            marginTop: 24,
            marginBottom: 16,
            height: 54,
            borderRadius: 16,
          }}
          customTextStyle={{fontWeight: '600', fontSize: 16, lineHeight: 19}}
          onPress={() => onPay()}
        />
        <Text
          onPress={() => (loading ? null : onAlert())}
          allowFontScaling={false}
          style={[styles.declineText, {marginBottom: 19}]}>
          {network?.strings?.SaleModalCancel}
        </Text>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  mainBlock: {
    backgroundColor: '#FFF',
    paddingBottom: getBottomSpace(),
    paddingTop: 44,
    paddingHorizontal: 16,
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    alignItems: 'center',
  },
  planView: {
    flexDirection: 'row',
    backgroundColor: '#FFF9D8',
    borderRadius: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: common.getLengthByIPhone7(31),
    width: common.getLengthByIPhone7(0) - common.getLengthByIPhone7(96),
    paddingVertical: 8,
  },
  planPriceTitle: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 12,
    lineHeight: 14,
    color: Colors.grayColor,
    fontWeight: Platform.select({ios: '700', android: 'bold'}),
  },
  planPriceValue: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 22,
    lineHeight: 26,
    color: Colors.grayColor,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
  },
  planPriceDesc: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 12,
    lineHeight: 14,
    color: Colors.grayColor,
    fontWeight: Platform.select({ios: '700', android: 'bold'}),
  },
  planTitle: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 32,
    lineHeight: 38,
    color: '#00C108',
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
  },
  subtitle: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 18,
    lineHeight: 21,
    color: Colors.textColor,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
  },
  declineText: {
    fontFamily: Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Medium',
    fontSize: 16,
    lineHeight: 19,
    color: Colors.textColor,
    fontWeight: '500',
  },
  circleView: {
    position: 'absolute',
    backgroundColor: '#FFB800',
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 26,
    zIndex: 10,
    top: -26,
    right: -26,
  },
});
