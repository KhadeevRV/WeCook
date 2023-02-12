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
} from 'react-native';
import Colors from '../../constants/Colors';
import common from '../../../Utilites/Common';
import network from '../../../Utilites/Network';
import {observer} from 'mobx-react-lite';
import Modal from 'react-native-modal';
import Config from '../../constants/Config';
import FastImage from 'react-native-fast-image';
import {BlurView} from '@react-native-community/blur';
import {ScrollView} from 'react-native-gesture-handler';

const DishViewItem = ({dish, onPress, ingredient}) => {
  console.log(ingredient);
  return (
    <View
      style={{
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onPress()}
        style={styles.cardView}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <FastImage
            style={{
              width: common.getLengthByIPhone7(80),
              height: common.getLengthByIPhone7(48),
              marginRight: common.getLengthByIPhone7(16),
              borderRadius: 16,
            }}
            source={{uri: dish?.images?.middle_webp}}
            borderRadius={16}
          />
          <View>
            <Text style={styles.itemTitle} numberOfLines={2}>
              {dish?.name}
            </Text>
          </View>
        </View>
        <Image
          style={{width: 8, height: 13, transform: [{rotate: '180deg'}]}}
          source={require('../../../assets/icons/goBack.png')}
        />
      </TouchableOpacity>
    </View>
  );
};

export const AboutIngrModal = observer(
  ({modal, closeModal, onPress, dishes = [], ingredient}) => {
    const body = [];

    for (let i = 0; i < dishes.length; i++) {
      body.push(
        <DishViewItem
          dish={dishes[i]}
          key={dishes[i]?.id}
          ingredient={ingredient}
          onPress={() => onPress(dishes[i])}
        />,
      );
    }

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
          <Text style={styles.title}>{ingredient?.name}</Text>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            style={{maxHeight: 400}}
            contentContainerStyle={{
              paddingTop: 10,
              paddingBottom: 32,
              paddingHorizontal: 16,
            }}>
            {body}
          </ScrollView>
        </View>
        {/* <SafeAreaView style={{backgroundColor:'#FFF'}} /> */}
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
    color: Colors.textColor,
    marginBottom: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mainBlock: {
    backgroundColor: '#FFF',
    paddingBottom: 32,
    paddingTop: common.getLengthByIPhone7(22),
    borderTopStartRadius: common.getLengthByIPhone7(24),
    borderTopEndRadius: common.getLengthByIPhone7(24),
  },
  cardView: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 10,
    backgroundColor: '#FFF',
    padding: 8,
    paddingRight: 16,
    marginTop: 16,
    borderRadius: 24,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 49,
    alignItems: 'center',
  },
  itemTitle: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 16,
    alignSelf: 'center',
    lineHeight: 19,
    maxWidth: common.getLengthByIPhone7(184),
    color: Colors.textColor,
    fontWeight: '500',
  },
  itemSubtitle: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    color: Colors.grayColor,
  },
});
