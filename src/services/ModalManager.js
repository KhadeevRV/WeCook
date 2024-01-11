import {useNavigation} from '@react-navigation/native';
import {runInAction} from 'mobx';
import {observer} from 'mobx-react-lite';
import React, {useCallback, useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text,
  Image,
  TouchableHighlight,
  Linking,
} from 'react-native';
import Modal from 'react-native-modal';
import network, {sendModalId} from '../../Utilites/Network';
import Colors from '../constants/Colors';
import {navigationRef} from '../navigation/AppNavigation';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const ModalManager = observer(() => {
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState({});
  const insets = useSafeAreaInsets();

  const closeModal = useCallback(() => {
    const newModals = network.modals.filter(modal => modal.id !== data?.id);
    runInAction(() => (network.modals = newModals));
    sendModalId(data?.id);
    setIsVisible(false);
  }, [network.modals, network.modals.length, data]);

  const checkModal = useCallback(
    screen => {
      if (network.modals.length) {
        const newData = network.modals.find(modal => modal?.place == screen);
        return newData;
      }
      return null;
    },
    [network?.modals.length],
  );

  useEffect(() => {
    const newData = checkModal(network.currentScreen);
    if (newData) {
      setData(newData);
      setTimeout(() => {
        setIsVisible(true);
      }, newData?.timeout ?? 2000);
    }
  }, [network.currentScreen]);

  const onBtnPress = () => {
    if (data?.btn_action) {
      const isLink = data.btn_action.indexOf('https://') !== -1;
      if (isLink) {
        Linking.openURL(data.btn_action);
        return;
      }
      const isPaywall = data.btn_action.indexOf('paywall') !== -1;
      if (isPaywall && navigationRef.current) {
        navigationRef.current?.navigate('PayWallScreen', {
          data: network.paywalls[data.btn_action],
        });
        return;
      }
      const isScreen = data.btn_action.indexOf('Screen') !== -1;
      if (isScreen && navigationRef.current) {
        navigationRef.current?.navigate(data.btn_action);
        return;
      }
    }
    return;
  };

  return (
    <Modal
      animationIn="slideInUp"
      animationOut="slideOutDown"
      isVisible={isVisible}
      onRequestClose={() => closeModal()}
      onBackdropPress={() => closeModal()}
      swipeDirection={['down']}
      onSwipeComplete={() => closeModal()}
      propagateSwipe={true}
      backdropOpacity={0.4}
      style={{margin: 0, justifyContent: 'flex-end'}}>
      <View style={[styles.mainBlock, {paddingBottom: 8 + insets.bottom}]}>
        <Text style={styles.header} allowFontScaling={false}>
          {data?.header}
        </Text>
        <TouchableOpacity
          style={styles.closeContainer}
          onPress={() => closeModal()}>
          <Image
            source={require('../../assets/icons/closeModal.png')}
            style={{width: 10, height: 10}}
          />
        </TouchableOpacity>
        <View style={{paddingHorizontal: 16}}>
          <Image
            source={{uri: data?.image}}
            style={{width: '100%', height: 146, marginBottom: 16}}
          />
          <Text style={styles.title} allowFontScaling={false}>
            {data?.title}
          </Text>
          <Text style={styles.content} allowFontScaling={false}>
            {data?.content}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onBtnPress()}
          style={[styles.touchContainer, {backgroundColor: data?.btn_color}]}
          underlayColor={Colors.underLayYellow}>
          <Text style={styles.touchText}>{data?.btn_text}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  header: {
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
    paddingTop: 22,
    borderTopStartRadius: 16,
    borderTopEndRadius: 16,
  },
  closeContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEEEEE',
    position: 'absolute',
    top: 13,
    right: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Bold',
    fontSize: 18,
    lineHeight: 21,
    color: Colors.textColor,
    fontWeight: '800',
    marginBottom: 8,
  },
  content: {
    fontFamily: Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Medium',
    fontSize: 16,
    lineHeight: 19,
    color: Colors.textColor,
    fontWeight: '500',
    marginBottom: 30,
  },
  touchContainer: {
    backgroundColor: Colors.yellow,
    marginHorizontal: 16,
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
