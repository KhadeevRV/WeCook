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
import Colors from '../constants/Colors';
import network, {selectUserAddress} from '../../Utilites/Network';
import {observer} from 'mobx-react-lite';
import Modal from 'react-native-modal';
import {getBottomSpace} from 'react-native-iphone-x-helper';
import {runInAction} from 'mobx';
import {strings} from '../../assets/localization/localization';

export const CardsModal = observer(({modal, closeModal, navigation}) => {
  const body = useMemo(() => {
    const cards = [];
    for (let i = 0; i < network?.userCards.length; i++) {
      const card = network?.userCards[i];
      const isCurrent = card?.id == network.currentCard?.id;
      cards.push(
        <TouchableOpacity
          onPress={() => {
            // selectUserAddress(address.id);
            runInAction(() => (network.currentCard = card));
            closeModal();
          }}
          style={[styles.row, {justifyContent: 'space-between'}]}
          key={card?.id}>
          <View style={{flex: 0.9, flexDirection: 'row', alignItems: 'center'}}>
            <Image
              style={{width: 40, height: 26, marginRight: 9}}
              source={{uri: card?.system_logo}}
            />
            <Text style={[styles.subText]}>
              {card?.system + ' ' + card?.last_four}
            </Text>
          </View>
          <View style={{flex: 0.1, alignItems: 'flex-end'}}>
            <View
              style={{
                width: 20,
                height: 20,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
                backgroundColor: isCurrent ? '#FFE600' : Colors.grayColor,
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
    return cards;
  }, [network?.userCards, network.currentCard]);

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
        <Text style={styles.title}>{network.strings?.Payment}</Text>
        <ScrollView bounces={false} style={{maxHeight: 300}}>
          {body}
        </ScrollView>
        <TouchableOpacity
          style={[styles.row]}
          onPress={() => {
            closeModal();
            navigation.navigate('AddCardScreen');
          }}>
          <Image
            source={require('../../assets/icons/addCard.png')}
            style={{width: 22, height: 22, marginRight: 10}}
          />
          <Text style={styles.subText}>{network.strings?.AddCreditCard}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{alignItems: 'center', paddingVertical: 17}}
          onPress={closeModal}>
          <Text style={styles.subText}>
            {network.strings?.CloseCreditCardPopover}
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
