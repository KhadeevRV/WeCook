import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {observer} from 'mobx-react-lite';
import common from '../../../Utilites/Common';
import Colors from '../../constants/Colors';
import network, {sendAnswer, sendDataToUrl} from '../../../Utilites/Network';

const ChooseListOrDeliveryScreen = observer(({navigation}) => {
  const screen = network.registerOnboarding?.ChooseListOrDeliveryScreen;

  const onPress = btn => {
    sendDataToUrl({
      url: btn.route,
      data: {[btn?.key]: btn?.value},
    });
    navigation.navigate(btn?.next_board);
  };

  const renderButton = (btn, i) => (
    <TouchableOpacity
      style={[
        styles.btn,
        {backgroundColor: btn?.background, borderColor: btn?.border_color},
      ]}
      key={i}
      onPress={() => onPress(btn)}>
      <Text style={[styles.btnText, {color: btn?.text_color}]}>
        {btn?.text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <SafeAreaView backgroundColor={'#FFF'} />
      <View style={{flex: 1, justifyContent: 'center'}}>
        <Image source={{uri: screen?.image}} style={styles.image} />
        <Text allowFontScaling={false} style={styles.title}>
          {screen?.title}
        </Text>
        <Text
          allowFontScaling={false}
          style={[styles.subtitle, {color: screen?.description_color}]}>
          {screen?.description}
        </Text>
        <View style={styles.btnContainer}>
          {screen?.buttons.map((btn, index) => renderButton(btn, index))}
        </View>
      </View>
      <SafeAreaView />
    </>
  );
});

export default ChooseListOrDeliveryScreen;

const styles = StyleSheet.create({
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 22,
    lineHeight: 26,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '400',
    alignSelf: 'center',
    textAlign: 'center',
    color: Colors.grayColor,
    maxWidth: common.getLengthByIPhone7(290),
    marginBottom: 24,
  },
  image: {
    width: Dimensions.get('window').width - common.getLengthByIPhone7(104),
    height: Dimensions.get('window').width - common.getLengthByIPhone7(104),
    alignSelf: 'center',
    marginBottom: 22,
  },
  btn: {
    width: common.getLengthByIPhone7(167),
    paddingVertical: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
  },
  btnText: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '500',
    color: Colors.textColor,
  },
  btnContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
});
