import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
  ScrollView,
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

export const AddressesModal = observer(({modal, closeModal, navigation}) => {
  const body = useMemo(() => {
    if (network?.user?.addresses && network?.user?.addresses.length) {
      const addresses = [];
      for (let i = 0; i < network?.user?.addresses.length; i++) {
        const address = network?.user?.addresses[i];
        const isCurrent = address?.id == network.user?.address_active;
        addresses.push(
          <TouchableOpacity
            onPress={async () => {
              runInAction(() => (network.user.address_active = address.id));
              closeModal();
              await selectUserAddress(address.id);
              getUserInfo();
              getUnavailableProducts();
            }}
            style={[styles.row, {justifyContent: 'space-between'}]}
            key={address?.id}>
            <Text style={[styles.subText, {flex: 0.9}]}>
              {address?.full_address}
            </Text>
            <View style={{flex: 0.1, alignItems: 'flex-end'}}>
              <View
                style={{
                  width: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 10,
                  backgroundColor: isCurrent ? '#7CB518' : Colors.grayColor,
                }}>
                {isCurrent ? (
                  <View
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: Colors.textColor,
                    }}
                  />
                ) : null}
              </View>
            </View>
          </TouchableOpacity>,
        );
      }
      return addresses;
    } else {
      return [];
    }
  }, [network?.user?.addresses, network?.user?.address_active]);

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
        <Text style={styles.title}>
          {network.strings?.PopoverDeliveryAddress}
        </Text>
        <ScrollView bounces={false} style={{maxHeight: 300}}>
          {body}
        </ScrollView>
        <TouchableOpacity
          style={[styles.row]}
          onPress={() => {
            closeModal();
            navigation.navigate(
              network.userMap == 'google' ? 'GoogleMapScreen' : 'MapScreen',
            );
          }}>
          <Image
            source={require('../../../assets/icons/add.png')}
            style={{width: 24, height: 24, marginRight: 8}}
          />
          <Text style={styles.subText}>
            {network.strings?.PopoverAddNewAddress}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{alignItems: 'center', paddingVertical: 17}}
          onPress={closeModal}>
          <Text style={styles.subText}>
            {network.strings?.AddressPopoverClose}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
});

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
  row: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  itemTitle: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 17,
    alignSelf: 'center',
    lineHeight: 20,
    color: Colors.textColor,
    fontWeight: '500',
  },
  subText: {
    fontFamily: Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Medium',
    fontSize: 16,
    lineHeight: 19,
    color: Colors.textColor,
    fontWeight: '500',
  },
});
