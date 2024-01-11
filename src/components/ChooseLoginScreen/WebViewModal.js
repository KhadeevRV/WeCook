import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Image,
  ImageBackground,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Modal,
  Alert,
  AsyncStorage,
  DevSettings,
} from 'react-native';
import Colors from '../../constants/Colors';
import common from '../../../Utilites/Common';
import Spinner from 'react-native-loading-spinner-overlay';
import WebView from 'react-native-webview';
import network, {
  getSubscriptions,
  updateToken,
  updateInfo,
  getList,
  getFavor,
} from '../../../Utilites/Network';
import {SafeAreaView} from 'react-native-safe-area-context';

export const WebViewModal = ({
  closeModal,
  modal,
  url,
  navigation,
  trial = false,
  closePaywall = () => null,
}) => {
  const LoadingIndicatorView = () => {
    return (
      <View
        style={{
          height: '100%',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFF',
        }}>
        <ActivityIndicator color={Colors.greenColor} size="large" />
      </View>
    );
  };
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState([]);

  const login = () => {
    getSubscriptions().then(
      value => {
        // выполнение
        closeModal();
        AsyncStorage.setItem('token', network.access_token);
        updateInfo();
        network.user.love_type_dinner == null
          ? navigation.navigate('ChooseEatScreen')
          : navigation.navigate('BottomNavigator');
      },
      reason => {
        // отклонение
        if (reason === 'refreshToken') {
          updateToken().then(
            value => {
              // выполнение
              login();
            },
            reason => {
              // отклонение
            },
          );
        }
      },
    );
  };

  const checkUrl = async event => {
    console.warn('faceface', event.nativeEvent.url);
    const succsStr = 'fb-access.php';
    const denyStr = 'fb-error.php';
    const succsPay = 'success';
    const denyPay = 'fail';
    const url = event.nativeEvent.url.toString();
    if (!trial) {
      if (url.toString().indexOf(succsStr) != -1) {
        if (url.indexOf('token=') != -1) {
          setLoading(true);
          const token = url.slice(url.indexOf('=') + 1, -4);
          network.access_token = token;
          login();
          setLoading(false);
        }
      } else if (url.toString().indexOf(denyStr) != -1) {
        Alert.alert(
          'Ошибка',
          'Ошибка при входе через Facebook,пожалуйста, повторите попытку',
          [{text: 'OK', onPress: () => closeModal()}],
        );
      }
    } else {
      if (url.toString().indexOf(succsPay) != -1) {
        Alert.alert('WeCook', 'Успешно! Оплата прошла, наслаждайтесь!', [
          {
            text: 'OK',
            onPress: () => {
              setLoading(true);
              setTimeout(() => {
                updateToken().then(() => {
                  getSubscriptions().then(
                    async value => {
                      // выполнение
                      await getList();
                      await getFavor();
                      setLoading(false);
                      setTimeout(() => {
                        closeModal();
                      }, 300);
                      closePaywall();
                    },
                    reason => {
                      // отклонение
                      setLoading(false);
                      setTimeout(() => {
                        DevSettings.reload();
                        // Alert.alert("Ошибка", "Ошибка при получении данных, пожалуйста, перезайдите в приложение", [
                        //     {text: "OK",onPress: () => closeModal()}
                        //   ])
                      }, 300);
                    },
                  );
                });
              }, 5000);
            },
          },
        ]);
      } else if (url.toString().indexOf(denyPay) != -1) {
        Alert.alert(
          'Ошибка',
          'Ошибка при оплате,пожалуйста,проверьте все данные и повторите попытку позднее',
          [{text: 'OK', onPress: () => closeModal()}],
        );
      }
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modal}
      onRequestClose={() => closeModal()}>
      {/* <ScrollView style={{flex:1, backgroundColor:'#FFF'}}> */}
      <SafeAreaView style={{backgroundColor: '#FFF'}} />
      <Spinner
        visible={loading}
        textContent={'Загрузка...'}
        overlayColor={'rgba(255, 255, 255, 1)'}
        textStyle={{color: Colors.textColor}}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={{width: 24, height: 24, position: 'absolute', left: 24}}
          onPress={() => closeModal()}>
          <Image
            source={require('../../../assets/icons/back.png')}
            style={{width: 12, height: 21, tintColor: '#FFF'}}
          />
        </TouchableOpacity>
        <Text allowFontScaling={false} style={styles.headerTitle}>
          {trial ? 'Оплата' : 'Вход'}
        </Text>
      </View>
      <WebView
        javaScriptEnabled={true}
        originWhitelist={['*']}
        scalesPageToFit={true}
        onLoadStart={event => checkUrl(event)}
        renderLoading={LoadingIndicatorView}
        startInLoadingState={true}
        source={{uri: url}}
      />
      {/* </ScrollView> */}
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 49,
    backgroundColor: Colors.yellow,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFF',
    fontSize: common.getLengthByIPhone7(20),
    lineHeight: common.getLengthByIPhone7(28),
    fontWeight: '500',
  },
});
