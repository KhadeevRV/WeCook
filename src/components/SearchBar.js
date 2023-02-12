import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import Colors from '../constants/Colors';
import {TextInput, TouchableHighlight} from 'react-native-gesture-handler';

const SearchBar = ({
  placeholder,
  value,
  onChange,
  autoFocus = false,
  disabled = false,
}) => {
  const [isFocus, setIsFocus] = useState(false);
  return (
    <View
      style={{
        flexGrow: 1,
      }}>
      <TextInput
        selectionColor={Colors.textColor}
        style={styles.input}
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        editable={!disabled}
        onChangeText={onChange}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        placeholderTextColor={'#C5C5C5'}
      />
      <Image
        source={require('../../assets/icons/search.png')}
        style={{width: 20, height: 20, position: 'absolute', left: 8, top: 5}}
      />
      {value ? (
        <TouchableOpacity
          style={{position: 'absolute', right: 8, top: 7}}
          onPress={() => onChange('')}>
          <Image
            source={require('../../assets/icons/clear.png')}
            style={{
              width: 16,
              height: 16,
            }}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 32,
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 0,
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Medium',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '500',
    color: Colors.textColor,
  },
});

export default SearchBar;
