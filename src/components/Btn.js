import React,{useState} from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform,} from 'react-native'
import Colors from '../constants/Colors'
import Common from '../../Utilites/Common'
import { TouchableHighlight } from 'react-native-gesture-handler'

export const Btn = ({customStyle={}, onPress= () => null, title,disabled = false,customTextStyle,backgroundColor='',underlayColor='#FFF'}) => {

  
  return (
    <TouchableHighlight style={{...styles.btnView,
      ...{
          backgroundColor: backgroundColor,
          opacity:disabled ? 0.5 : 1,
          ...customStyle,
      }}}
        onPress={() => onPress()} underlayColor={underlayColor} disabled={disabled}
        >
    <Text allowFontScaling={false} style={{...styles.title,...customTextStyle}}>{title}</Text>
  </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  btnView:{
      height:50,
      width:'100%',
      justifyContent:'center',
      borderRadius:16,
      alignItems:'center',
  },
  title:{
    color:Colors.textColor,
    fontSize:14,
    lineHeight:17,
    fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }),
  }
})