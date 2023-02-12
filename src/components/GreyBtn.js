import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Colors from '../constants/Colors';
import Common from '../../Utilites/Common';
import {TouchableHighlight} from 'react-native-gesture-handler';

export const GreyBtn = ({
  containerStyle = {},
  onPress = () => null,
  disabled = false,
  backgroundColor = '#EEEEEE',
  underlayColor = '#F5F5F5',
  children,
  title,
  titleStyle = {},
}) => {
  return (
    <TouchableHighlight
      style={{
        ...styles.btnView,
        ...{
          backgroundColor: backgroundColor,
          opacity: disabled ? 0.5 : 1,
          ...containerStyle,
        },
      }}
      onPress={() => onPress()}
      underlayColor={underlayColor}
      disabled={disabled}>
      <>
        {title ? <Text style={[styles.title, titleStyle]}>{title}</Text> : null}
        {children}
      </>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  btnView: {
    borderRadius: 16,
  },
  title: {
    color: Colors.textColor,
    fontSize: 14,
    lineHeight: 17,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontWeight: '500',
    marginVertical: 5,
  },
});
