import React, {Component, useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  Alert,
  Share,
  ImageBackground,
} from 'react-native';
import {
  FlatList,
  ScrollView,
  TextInput,
  TouchableHighlight,
} from 'react-native-gesture-handler';
import network, {getList, listClear} from '../../Utilites/Network';
import {observer, Observer, useObserver} from 'mobx-react-lite';
import {runInAction} from 'mobx';
import Colors from '../constants/Colors';
import LinearGradient from 'react-native-linear-gradient';
import ProfileItem from '../components/ProfileScreen/ProfileItem';
import {strings} from '../../assets/localization/localization';

const DetailsScreen = observer(({navigation}) => {
  const [socialModal, setSocialModal] = useState(false);

  const header = [
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={1}
        style={{
          position: 'absolute',
          left: 0,
          paddingVertical: 11,
          paddingHorizontal: 16,
          zIndex: 100,
        }}
        onPress={() => navigation.goBack()}>
        <Image
          source={require('../../assets/icons/goBack.png')}
          style={{width: 11, height: 18, tintColor: Colors.textColor}}
        />
      </TouchableOpacity>
      <View style={{alignItems: 'center', alignSelf: 'center'}}>
        <Text style={styles.headerTitle}>
          {network.strings?.AccountDetails}
        </Text>
      </View>
    </View>,
  ];

  const bodyArr = [
    {
      id: 1,
      title: network.strings?.PhoneNumber,
      subtitle: network.user?.phone
        ? '+' + network.user?.phone
        : network.strings?.NoData,
      onPress: () =>
        navigation.navigate('LoginScreen', {from: 'DetailsScreen'}),
    },
    {
      id: 2,
      title: network.strings?.UserName,
      subtitle: network.user?.name ?? network.strings?.NoData,
      onPress: () =>
        navigation.navigate('ChangeNameEmailScreen', {what: 'name'}),
    },
    {
      id: 3,
      title: 'Email',
      subtitle: network.user?.email ?? network.strings?.NoData,
      onPress: () =>
        navigation.navigate('ChangeNameEmailScreen', {what: 'email'}),
    },
    // {
    //   id: 4,
    //   title: 'Предпочтения',
    //   subtitle: network.user?.preference ?? 'Нет данных',
    //   onPress: () =>
    //     navigation.navigate('ChangeWishesScreen', {what: 'preference'}),
    // },
    {
      id: 5,
      title: network.strings?.PersonsCount,
      subtitle: network.user?.persons
        ? network.user?.persons.toString()
        : network.strings?.NoData,
      onPress: () =>
        navigation.navigate('ChangeWishesScreen', {what: 'persons'}),
    },
  ];

  const body = [];
  for (let i = 0; i < bodyArr.length; i++) {
    let item = bodyArr[i];
    body.push(
      <ProfileItem
        title={item.title}
        subtitle={item.subtitle}
        onPress={item.onPress}
        key={item.id}
      />,
    );
  }

  return (
    <View style={{flex: 1, backgroundColor: '#FFF'}}>
      <SafeAreaView backgroundColor={'#FFF'} />
      {header}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 120}}>
        <View style={styles.container}>
          <Text style={[styles.title, {marginTop: 25}]}>
            {network.strings?.Personal}
          </Text>
        </View>
        {body}
        {network.isBasketUser() ? null : (
          <>
            <View style={styles.container}>
              <Text style={styles.title}>{network?.strings?.Subscription}</Text>
            </View>
            {network.user.access ? (
              <ProfileItem
                title={network.user?.subscription?.plan?.name}
                subtitle={
                  network?.strings?.ActiveTill +
                  new Date(
                    network.user?.subscription?.info?.expired,
                  )?.toLocaleDateString()
                }
                onPress={() => navigation.navigate('AboutSubScreen')}
                key={network.user?.subscription?.plan?.id}
              />
            ) : (
              <View style={styles.container}>
                <TouchableOpacity
                  style={{marginBottom: 16}}
                  activeOpacity={1}
                  onPress={() =>
                    navigation.navigate('PayWallScreen', {
                      data: network.paywalls[
                        network?.user?.banner_in_user?.type
                      ],
                    })
                  }>
                  <ImageBackground
                    source={{uri: network?.user?.banner_in_user?.image_btn}}
                    borderRadius={16}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 21,
                      borderRadius: 16,
                    }}>
                    <Text style={styles.payTitle}>
                      {network?.user?.banner_in_user?.text}
                    </Text>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
});

export default DetailsScreen;

const styles = StyleSheet.create({
  header: {
    height: 44,
    width: '100%',
    backgroundColor: '#FFF',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
  },
  container: {
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 18,
    lineHeight: 21,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
    marginTop: 41,
    marginBottom: 10,
  },
  payTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '500',
    color: Colors.textColor,
  },
});
