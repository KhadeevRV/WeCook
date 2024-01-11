import React, {Component, useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
  SafeAreaView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {observer, Observer, useObserver} from 'mobx-react-lite';
import Colors from '../constants/Colors';
import {getBottomSpace, getStatusBarHeight} from 'react-native-iphone-x-helper';
import {GreyBtn} from '../components/GreyBtn';
import BottomListBtn from '../components/BottomListBtn';
import Product from '../components/AddProductScreen/Product';
import ListItem from '../components/ListScreen/ListItem';
import SearchBar from '../components/SearchBar';
import network, {searchProduct} from '../../Utilites/Network';
import {useInterval} from './ReceptScreen';
import {runInAction} from 'mobx';
import {strings} from '../../assets/localization/localization';

const AddProductScreen = observer(({navigation, route}) => {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tips, setTips] = useState([]);
  const [products, setProducts] = useState([]);
  const [time, setTime] = useState(0);
  const delay = 500;
  const scrollRef = useRef(null);

  const onFetch = async () => {
    try {
      const resp = await searchProduct(text);
      setTips(resp?.tips ?? []);
      setProducts(resp?.products ?? []);
    } catch (e) {
      // console.log(e);
      // setIsLoading(false);
    }
  };

  useInterval(() => {
    if (time != 0) {
      const date = new Date();
      if (date - time > 500 && time != 0) {
        onFetch();
        setTime(0);
      }
    }
  }, delay);

  const header = [
    <View style={styles.header} key={'AddProductScreenHeader'}>
      <TouchableOpacity
        activeOpacity={1}
        style={{
          paddingVertical: 9,
          paddingHorizontal: 16,
          zIndex: 100,
        }}
        onPress={() => navigation.goBack()}>
        <Image
          source={require('../../assets/icons/back.png')}
          style={{width: 20, height: 20, tintColor: Colors.textColor}}
        />
      </TouchableOpacity>
      <SearchBar
        placeholder={network.strings?.SearchProductPlaceholder}
        value={text}
        autoFocus
        onChange={value => {
          setText(value);
          setTime(new Date());
          scrollRef?.current?.scrollToOffset({animated: true, offset: 0});
        }}
      />
    </View>,
  ];

  const renderTips = () => {
    const tipsView = [];
    for (let i = 0; i < tips.length; i++) {
      tipsView.push(
        <GreyBtn
          key={tips[i].id}
          onPress={() => {
            setText(tips[i].name);
            setTime(new Date());
            scrollRef?.current?.scrollToOffset({animated: true, offset: 0});
          }}
          title={tips[i].name}
          containerStyle={{
            paddingHorizontal: 16,
            marginRight: 8,
            marginBottom: 8,
          }}
        />,
      );
    }
    return tipsView;
  };

  useEffect(() => {
    onFetch('');
  }, []);
  return (
    <View style={{flex: 1, backgroundColor: '#FFF'}}>
      {Platform.OS == 'ios' ? (
        <SafeAreaView
          style={{backgroundColor: '#FFF', height: getStatusBarHeight()}}
        />
      ) : (
        <SafeAreaView style={{backgroundColor: '#FFF'}} />
      )}
      {header}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        enableResetScrollToCoords={false}
        style={{flex: 1, marginBottom: getBottomSpace()}}>
        <FlatList
          contentContainerStyle={{padding: 16}}
          ref={scrollRef}
          ListHeaderComponent={() => (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  marginBottom: 14,
                }}>
                {renderTips()}
              </View>
              {!text.length ? (
                <Text style={styles.prodsTitle}>
                  {network.strings?.PopularProducts}
                </Text>
              ) : null}
            </>
          )}
          data={products}
          numColumns={2}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({item, index}) => (
            <View style={{flex: 1 / 2, marginRight: index % 2 ? 0 : 8}}>
              <Product product={item} route={route} />
            </View>
          )}
        />
        <BottomListBtn navigation={navigation} />
      </KeyboardAvoidingView>
    </View>
  );
});

export default AddProductScreen;

const styles = StyleSheet.create({
  header: {
    height: 44,
    backgroundColor: '#FFF',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    paddingRight: 16,
  },
  prodsTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 18,
    lineHeight: 21,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
    marginBottom: 8,
  },
});
