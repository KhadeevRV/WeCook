import React, { useState, useEffect,useRef } from 'react'
import {StyleSheet, Image, SafeAreaView,View, TouchableOpacity,Text, ActivityIndicator, KeyboardAvoidingView,ScrollView, Dimensions, Animated, AsyncStorage, Linking, Share, Platform, Alert } from 'react-native'
import Colors from '../constants/Colors';
import common from '../../Utilites/Common';
import network from '../../Utilites/Network';
import { observer } from 'mobx-react';
import { BlurView, VibrancyView } from '@react-native-community/blur'

export const MyTabBar = observer(({ state, descriptors, navigation }) => {
    const focusedOptions = descriptors[state.routes[state.index].key].options;

    let titles = [
        'Публикации',
        'Предложения',
        'Ломбарды',
        'Сообщения',
        'Профиль',
    ];

    let images = [
      {icon: require('../../assets/icons/ic-tabbar-posts.png'), width: 30, height: 30},
      {icon: require('../../assets/icons/ic-tabbar-offers.png'), width: 30, height: 30},
      {icon: require('../../assets/icons/ic-tabbar-location.png'), width: 30, height: 30},
      {icon: require('../../assets/icons/ic-tabbar-messages.png'), width: 30, height: 30},
      {icon: require('../../assets/icons/ic-tabbar-profile.png'), width: 30, height: 30},
    ];

    const [btnPos, setbtnPos] = useState(0)


    if (focusedOptions.tabBarVisible === false) {
      return null;
    }

    return (
    <View style={{position: 'absolute',
    // flex:1,
    overflow:'hidden',backgroundColor:Platform.OS =='ios' ? null :'#FFF',
    left: 0,
    right: 0,
    bottom: 0}}>
      {Platform.OS =='android' ? null :
      <BlurView 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
        }}
        blurType="light"
        blurAmount={24}
        blurRadius={24}
        reducedTransparencyFallbackColo={'#FFF'}
        />}
      <View style={{ flexDirection: 'row', height:80,width:common.getLengthByIPhone7(),
        alignItems:'center',}}
        onLayout={(e) => {
            if(Platform.OS == 'android'){
                console.warn('COORDS',e.nativeEvent.layout.width)
                setbtnPos(e.nativeEvent.layout.width)
            } else {
                e.target.measure( 
                    (x, y,width,height) => {
                        setbtnPos(width)
                        // console.warn('COORDS',width)
                    },
                  );
            }
        }}>
        
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;
  
          const isFocused = state.index === index;
          const tintColor = isFocused ? Colors.greenColor : Colors.textColor
  
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };
  
          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };
          
          return (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{ flex: 1 }}
            >
            <View style={{alignItems:'center'}}>
              <Image style={{width:30,height:30,tintColor}} source={images[index].icon} />
              <Text style={{fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:10,lineHeight:13,fontWeight:'500',color: tintColor}}>
                {titles[index]}
              </Text>
              {route.name == 'Messages' && network.chats.filter(item => item?.chat_new_message != 0).length?
                <View style={{position:'absolute',minWidth:14,minHeight:14,padding:2,
                  backgroundColor:'#EB5757',borderRadius:7,right:24,alignItems:'center'}}>
                    <Text style={{
                      fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:10,
                      lineHeight:13,
                      color:'#FFF',
                    }}>{network.chats.filter(item => item?.chat_new_message != 0).length}</Text>
                </View>
                 : null}
            </View>
            </TouchableOpacity>
          );
        })}
        {/* {network.who == 'client' && btnPos != 0 ? 
        <TouchableOpacity onPress={() => navigation.navigate('Messages')} activeOpacity={0.8}
            style={{backgroundColor:Colors.greenColor,
                shadowColor:Colors.greenColor,
                shadowOffset: {
                    width: 0,
                    height: -4,
                },
                shadowOpacity: 0.12,
                shadowRadius: 18,
                borderRadius:24,alignItems:'center',justifyContent:'center',
                width:48,height:48,position:'absolute',top:-24,
                right:btnPos/2 - 24}}
            >
                <Image source={require('../../assets/icons/plus.png')} style={{width:30,height:30}} />
        </TouchableOpacity> : null} */}
      </View>
      <SafeAreaView />
      </View>
    );
})