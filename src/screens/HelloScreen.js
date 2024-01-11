import React, {useState, useEffect, useMemo} from 'react';
import {
  StyleSheet,
  Image,
  ImageBackground,
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import {getBottomSpace} from 'react-native-iphone-x-helper';
import common from '../../Utilites/Common';
import network from '../../Utilites/Network';
import Colors from '../constants/Colors';

const HelloScreen = ({navigation}) => {
  const SCREEN_WIDTH = Dimensions.get('window').width;
  const screen = network.onboarding?.HelloScreen;
  // const screens = [];
  const dots = [];
  // const [activeDot, setActiveDot] = useState(0);

  // const data = useMemo(
  //   () => [
  //     {
  //       text: 'Вдохновляйся\nвкусными рецептами',
  //       image: require('../../assets/img/hellopic1.png'),
  //     },
  //     {
  //       text: 'Заказывай доставку\nпродуктов по списку\nв 1 клик',
  //       image: require('../../assets/img/hellopic1.png'),
  //     },
  //   ],
  //   [],
  // );

  // const body = useMemo(() => {
  //   const bodyView = [];
  //   data.forEach((item, i) => {
  //     bodyView.push(
  //       <View
  //         key={i.toString()}
  //         style={{
  //           width: Dimensions.get('window').width,
  //           alignItems: 'center',
  //         }}>
  //         <Image source={item.image} style={{width: 270, height: 270}} />
  //         <Text allowFontScaling={false} style={styles.title}>
  //           {item.text}
  //         </Text>
  //       </View>,
  //     );
  //   });
  //   return bodyView;
  // }, [data]);

  // for (let i = 0; i < data.length; i++) {
  //   screens.push(SCREEN_WIDTH * i);
  //   dots.push(
  //     <View
  //       key={i + data[i].text}
  //       style={{
  //         width: 8,
  //         height: 8,
  //         backgroundColor: activeDot === i ? '#FFF' : '#D1D1D1',
  //         borderRadius: 4,
  //         marginRight: 8,
  //         borderWidth: activeDot === i ? 1 : 0,
  //         borderColor: '#D1D1D1',
  //       }}
  //     />,
  //   );
  // }

  return (
    <>
      {/* <SafeAreaView /> */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Image
          source={{uri: screen?.image}}
          style={{width: 270, height: 270}}
        />
        <Text allowFontScaling={false} style={styles.title}>
          {screen?.title}
        </Text>
        <TouchableOpacity
          style={[
            styles.btnView,
            {
              backgroundColor: screen?.button_background,
              borderColor:
                screen?.button_border_color ?? screen?.button_background,
            },
          ]}
          onPress={() => navigation.navigate(screen?.next_board)}>
          <Text
            allowFontScaling={false}
            style={[styles.btnText, {color: screen?.button_text_color}]}>
            {screen?.button_text}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: 22,
    lineHeight: 26,
    color: Colors.textColor,
    fontWeight: 'bold',
    textAlign: 'center',
    // maxWidth:230,
    marginTop: 21,
  },
  btnView: {
    width: common.getLengthByIPhone7(140),
    height: common.getLengthByIPhone7(47),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: Colors.yellow,
    borderWidth: 1,
    position: 'absolute',
    bottom: getBottomSpace() + 50,
  },
  btnText: {
    fontFamily:
      Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
    fontSize: common.getLengthByIPhone7(15),
    fontWeight: '500',
    lineHeight: common.getLengthByIPhone7(18),
    color: '#FFF',
  },
});

export default HelloScreen;
