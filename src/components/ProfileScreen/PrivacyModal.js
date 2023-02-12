import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import Colors from '../../constants/Colors';
import common from '../../../Utilites/Common';
import network, {getPrivacyAndAgreement} from '../../../Utilites/Network';
import {observer} from 'mobx-react-lite';
import Modal from 'react-native-modal';
import Config from '../../constants/Config';
import {getStatusBarHeight} from 'react-native-iphone-x-helper';
import {
  agreementText,
  privacyText,
  userAgreementText,
} from '../../constants/Texts';
import {ShadowView} from '../ShadowView';
import * as Progress from 'react-native-progress';

export const PrivacyModal = observer(({modal, closeModal, mode}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const getData = async () => {
    setLoading(true);
    try {
      const newData = await getPrivacyAndAgreement();
      setData(newData);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      Alert.alert(network.strings?.Error, e);
    }
  };
  useEffect(() => {
    if (modal && !data) {
      getData();
    }
  }, [modal]);
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
      style={{
        margin: 0,
        justifyContent: 'flex-end',
        marginTop: getStatusBarHeight(),
      }}>
      <TouchableOpacity
        style={styles.btnView}
        activeOpacity={1}
        onPress={() => closeModal()}>
        <Image
          style={{width: 10, height: 10}}
          source={require('../../../assets/icons/closeModal.png')}
        />
      </TouchableOpacity>
      <ScrollView
        style={styles.mainBlock}
        contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 120}}
        showsVerticalScrollIndicator={false}>
        <TouchableOpacity activeOpacity={1}>
          <Text style={styles.title}>
            {mode == 'privacy'
              ? network.strings?.PrivacyPolicy
              : mode == 'agreement'
              ? network.strings?.UserAgreement
              : 'LICENSED APPLICATION END USER LICENSE AGREEMENT'}
          </Text>
          {loading ? (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ShadowView
                firstContStyle={{
                  width: 56,
                  height: 56,
                  borderRadius: 50,
                  marginBottom: 24,
                }}
                secondContStyle={{
                  width: 56,
                  height: 56,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 50,
                }}>
                <Progress.CircleSnail
                  size={28}
                  color={Colors.yellow}
                  style={{alignSelf: 'center'}}
                  thickness={2}
                />
              </ShadowView>
            </View>
          ) : (
            <Text style={styles.commonText}>
              {mode == 'privacy'
                ? data?.PrivacyPolicyText
                : mode == 'agreement'
                ? data?.UserAgreementText
                : userAgreementText}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  title: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 22,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    lineHeight: 26,
    marginBottom: 10,
    color: Colors.textColor,
  },
  mainBlock: {
    backgroundColor: '#FFF',
    paddingTop: common.getLengthByIPhone7(41),
    borderTopStartRadius: common.getLengthByIPhone7(24),
    borderTopEndRadius: common.getLengthByIPhone7(24),
  },
  commonText: {
    fontFamily: Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Medium',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 17,
    color: Colors.textColor,
  },
  btnView: {
    width: 36,
    height: 36,
    backgroundColor: '#FFF',
    borderRadius: 18,
    position: 'absolute',
    right: 10,
    top: 12,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
