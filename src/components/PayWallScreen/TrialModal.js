import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ScrollView,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import Colors from '../../constants/Colors';
import common from '../../../Utilites/Common';
import network, {
  getUnavailableProducts,
  getUserInfo,
  selectUserAddress,
} from '../../../Utilites/Network';
import {observer} from 'mobx-react-lite';
import Modal from 'react-native-modal';
import Config from '../../constants/Config';
import {getBottomSpace} from 'react-native-iphone-x-helper';
import {runInAction} from 'mobx';
import {strings} from '../../../assets/localization/localization';
import {Btn} from '../Btn';

export const TrialModal = observer(
  ({modal, closeModal, plan, onPay, isLoading, checkSub}) => {
    const bodyData = [
      {
        title: network?.strings?.TrialModalTitle1,
        subtitle: network?.strings?.TrialModalSubtitle1,
        customTextStyle: {color: '#00C108', textDecorationLine: 'line-through'},
      },
      {
        title: network?.strings?.TrialModalTitle2,
        subtitle: network?.strings?.TrialModalSubtitle2,
      },
      {
        title: network?.strings?.TrialModalTitle3,
        subtitle: network?.strings?.TrialModalSubtitle3,
      },
      {
        title: network?.strings?.TrialModalTitle4,
        subtitle: network?.strings?.TrialModalSubtitle4,
      },
    ];
    const body = useMemo(() => {
      return bodyData.map((item, ind) => (
        <View key={item?.title} style={{marginBottom: 24}}>
          <Text
            allowFontScaling={false}
            style={[styles.itemTitle, item.customTextStyle ?? {}]}>
            {item?.title}
          </Text>
          <Text
            allowFontScaling={false}
            style={[styles.itemSubtitle, {marginTop: 4}]}>
            {item?.subtitle}
          </Text>
        </View>
      ));
    }, [plan]);
    return (
      <Modal
        animationIn="slideInUp"
        animationOut="slideOutDown"
        isVisible={modal}
        onRequestClose={() => (isLoading ? null : closeModal())}
        onBackdropPress={() => (isLoading ? null : closeModal())}
        swipeDirection={isLoading ? [] : ['down']}
        onSwipeComplete={() => (isLoading ? null : closeModal())}
        propagateSwipe={true}
        backdropOpacity={0.4}
        style={{margin: 0, justifyContent: 'flex-end'}}>
        <View style={styles.mainBlock}>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <TouchableOpacity activeOpacity={1}>
              <TouchableWithoutFeedback>
                <>
                  <Text allowFontScaling={false} style={styles.title}>
                    {network?.strings?.TrialModalMainTitle + ' '}
                    <Text
                      allowFontScaling={false}
                      style={[styles.title, {color: '#00C108'}]}>
                      {network?.strings?.TrialModalMainTitle2}
                    </Text>
                  </Text>
                  <View style={styles.row}>
                    <Image
                      source={require('../../../assets/img/modalChecks.png')}
                      style={{width: 36, height: 282}}
                    />
                    <View
                      style={{
                        marginLeft: 16,
                        paddingTop: 8,
                        maxWidth: common.getLengthByIPhone7(280),
                      }}>
                      {body}
                    </View>
                  </View>
                </>
              </TouchableWithoutFeedback>
            </TouchableOpacity>
          </ScrollView>
          <View>
            <Text allowFontScaling={false} style={styles.descText}>
              {plan?.desc}
            </Text>
            <Btn
              underlayColor={Colors.underLayYellow}
              title={
                isLoading
                  ? network?.strings?.Loading
                  : network?.strings?.TrialModalBtn
              }
              backgroundColor={Colors.underLayYellow}
              customStyle={{
                width: common.getLengthByIPhone7(0) - 32,
                marginTop: 24,
                borderRadius: 16,
              }}
              customTextStyle={{
                fontWeight: '600',
                fontSize: 16,
                lineHeight: 19,
              }}
              onPress={onPay}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginTop: 16,
              }}>
              <Text
                allowFontScaling={false}
                style={[styles.descText, {marginRight: 24}]}
                onPress={() => Linking.openURL('https://wecook.app/terms')}>
                {network?.strings?.Terms}
              </Text>
              <Text style={styles.descText} onPress={checkSub}>
                {network?.strings?.Restore}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  title: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 32,
    lineHeight: 38,
    marginBottom: 40,
    color: Colors.textColor,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
  },
  mainBlock: {
    backgroundColor: '#FFF',
    paddingBottom: getBottomSpace(),
    paddingTop: 32,
    paddingHorizontal: 16,
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
    // height: '78%',
    minHeight: 650,
    // height: '100%',
    // justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
  },
  itemTitle: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 16,
    lineHeight: 19,
    color: Colors.textColor,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
  },
  itemSubtitle: {
    fontFamily: Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Medium',
    fontSize: 14,
    lineHeight: 17,
    color: Colors.textColor,
    fontWeight: '500',
  },
  descText: {
    fontFamily: Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Medium',
    fontSize: 12,
    lineHeight: 14,
    color: Colors.textColor,
    fontWeight: '500',
    textAlign: 'center',
  },
});
