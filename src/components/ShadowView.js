import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';

export const ShadowView = ({
  children,
  firstContStyle = {},
  secondContStyle = {},
}) => {
  return (
    <View style={[styles.firstShadowView, firstContStyle]}>
      <View style={[styles.secondShadowView, secondContStyle]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  firstShadowView: {
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 12,
  },
  secondShadowView: {
    borderRadius: 16,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
});
