import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  Alert,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {observer} from 'mobx-react-lite';
import common from '../../Utilites/Common';
import Colors from '../constants/Colors';
import network, {payAppleOrAndroid, getUserInfo} from '../../Utilites/Network';
import PayWallItem from '../components/PayWallScreen/PayWallItem';
import {Btn} from '../components/Btn';
import * as RNIap from 'react-native-iap';
import Config from '../constants/Config';
import Spinner from 'react-native-loading-spinner-overlay';
import {AppEventsLogger} from 'react-native-fbsdk-next';
import {PrivacyModal} from '../components/ProfileScreen/PrivacyModal';
import {FooterItem} from './ProfileScreen';
import DayRecipeCard from '../components/MenuScreen/DayRecipeCard';
import {TrialModal} from '../components/PayWallScreen/TrialModal';
import RNRestart from 'react-native-restart';
import {getBottomSpace, getStatusBarHeight} from 'react-native-iphone-x-helper';
import {updateAllData} from './SplashScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const sendAnalytics = plan => {
  let today = new Date();
  let inWeek = new Date();
  inWeek.setDate(today.getDate() + 7);
  plan.trial
    ? AppEventsLogger.logEvent('TrialBuy', {
        TrialStart: today.toLocaleDateString('ru'),
        TrialEnd: inWeek.toLocaleDateString('ru'),
      })
    : AppEventsLogger.logEvent('fb_mobile_purchase', {
        fb_currency: 'USD',
        receipt_id: plan.id,
      });
};

const onUpdateData = async (receipt, plan) => {
  try {
    await payAppleOrAndroid(receipt);
    sendAnalytics(plan);
    await getUserInfo();
  } catch (e) {
    Alert.alert(network?.strings?.Error, e?.message ?? e);
  }
};

export const payHandle = async (
  plan,
  onLoading = () => null,
  navigation,
  fromOnboarding = false,
  screen = {},
  fromModal = false,
) => {
  const newPlan = plan;
  onLoading(true);
  try {
    const receipt = await RNIap.requestPurchase(newPlan.id);
    await onUpdateData(receipt, plan);
    onLoading(false);
    // Если есть телефон, то все впорядке, возвращаем назад. Если нет, то обязательно ввести closeDisable - не позволяет пропустить экран
    // from - экран, на который перейдет пользователь после подтверждения телефона
    if (fromModal) {
      return true;
    }
    if (network.user?.phone) {
      fromOnboarding
        ? navigation.navigate(screen?.next_board)
        : navigation.goBack();
    } else {
      navigation.navigate('LoginScreen', {
        closeDisable: true,
        from: 'MenuScreen',
      });
    }
  } catch (e) {
    console.log('e', e);
    onLoading(false);
  }
};

const PayWallScreen = observer(({navigation, route}) => {
  const [currentPlan, setCurrentPlan] = useState(0);
  const [loading, setLoading] = useState(false);
  const [trialLoading, setTrialLoading] = useState(false);
  const fromOnboarding = route?.params?.fromOnboarding;
  const data = route.params?.data;
  const [userLoadingData, setUserLoadingData] = useState(!!fromOnboarding);
  const [textMode, setTextMode] = useState('privacy');
  const [privacyModal, setprivacyModal] = useState(false);
  const [trialModal, setTrialModal] = useState(false);
  const insets = useSafeAreaInsets();

  const screen = data ?? network.registerOnboarding.PayWallScreen;
  const notTrialPlans = useMemo(() => {
    if (screen?.plans.length) {
      let plans = screen?.plans.filter(plan => !plan?.trial);
      if (plans.length) {
        return plans;
      } else {
        return [];
      }
    } else {
      return [];
    }
  }, [screen?.plans.length]);

  const checkTransactions = async (availablePurchases = [], purchaseDate) => {
    for (let i = 0; i < availablePurchases.length; i++) {
      const transcation = availablePurchases[i];
      if (
        purchaseDate <= new Date(transcation.transactionDate) ||
        !purchaseDate
      ) {
        console.warn(
          'checkTransactionsDONE',
          new Date(transcation.transactionDate),
          transcation.productId,
        );
        return transcation;
      }
    }
    return null;
  };

  const checkSub = async (fromTrial = false) => {
    fromTrial ? setTrialLoading(true) : setLoading(true);
    try {
      const availablePurchases = await RNIap.getAvailablePurchases();
      const purchaseDate = new Date(
        network.user?.subscription?.info?.purchase_date,
      );
      const transcation = checkTransactions(availablePurchases, purchaseDate);
      if (transcation) {
        await payAppleOrAndroid(transcation);
        fromTrial ? setTrialLoading(false) : setLoading(false);
        Alert.alert(
          network?.strings?.Attention,
          network?.strings?.RestoreDoneLabel,
          [
            {
              text: network?.strings?.Reload,
              onPress: () => RNRestart.Restart(),
            },
          ],
        );
      } else {
        fromTrial ? setTrialLoading(false) : setLoading(false);
        Alert.alert(
          network?.strings?.Attention,
          network?.strings?.RestoreFailLabel,
          [{text: network?.strings?.Continue}],
        );
      }
    } catch (e) {
      fromTrial ? setTrialLoading(false) : setLoading(false);
      Alert.alert(
        network?.strings?.Attention,
        network?.strings?.RestoreFailLabel,
        [{text: network?.strings?.Continue}],
      );
    }
  };

  const plansView = useMemo(() => {
    if (screen?.plans.length) {
      let newPlans = [];
      for (let i = 0; i < notTrialPlans.length; i++) {
        const plan = notTrialPlans[i];
        newPlans.push(
          <PayWallItem
            plan={plan}
            pressed={currentPlan == i}
            onPress={() => {
              setCurrentPlan(i);
              // payHandle(
              //   plan,
              //   value => setLoading(value),
              //   navigation,
              //   fromOnboarding,
              //   screen,
              // );
            }}
            key={plan.id}
          />,
        );
      }
      return newPlans;
    } else {
      return [];
    }
  }, [notTrialPlans.length, currentPlan]);

  const trialPlan = useMemo(() => {
    if (screen?.plans.length) {
      let trialPlans = screen?.plans.filter(plan => plan?.trial);
      if (trialPlans.length) {
        return trialPlans[0];
      } else {
        return false;
      }
    } else {
      return false;
    }
  }, [screen?.plans.length]);

  const searchSelectedPlan = () => {
    const selectIndex = notTrialPlans.findIndex(plan => plan?.select);
    if (selectIndex != -1) {
      setCurrentPlan(selectIndex);
    }
  };

  useEffect(() => {
    searchSelectedPlan();
  }, [notTrialPlans.length]);

  const onPayTrial = async () => {
    try {
      const isPayed = await payHandle(
        trialPlan,
        value => setTrialLoading(value),
        navigation,
        fromOnboarding,
        screen,
        true,
      );
      if (!isPayed) {
        return;
      }
      setTrialModal(false);
      if (network.user?.phone) {
        fromOnboarding
          ? navigation.navigate(screen?.next_board)
          : navigation.goBack();
      } else {
        navigation.navigate('LoginScreen', {
          closeDisable: true,
          from: 'MenuScreen',
        });
      }
    } catch (e) {}
  };

  const renderTitle = () => {
    return (
      <View
        style={{position: 'absolute', zIndex: 10, left: 16, bottom: 13}}
        key={'PaywallTitle'}>
        <Text style={styles.logoTitle}>
          WeCook{' '}
          <Text style={[styles.logoTitle, {color: Colors.underLayYellow}]}>
            Prime
          </Text>
        </Text>
      </View>
    );
  };

  const onSkip = useCallback(withoutTrial => {
    if (withoutTrial) {
      fromOnboarding
        ? navigation.navigate(screen?.next_board ?? 'MainStack')
        : navigation.goBack();
    } else {
      setTrialModal(true);
    }
  }, []);

  const renderChecks = useCallback(
    () => (
      <View style={{paddingHorizontal: 16}}>
        {screen?.list.map((check, i) => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              marginBottom: 14,
            }}
            key={i.toString()}>
            <Image
              source={{uri: check?.icon}}
              style={{
                width: 18,
                height: 18,
                marginRight: 11,
              }}
            />
            <Text style={{...styles.checkText}}>{check?.text}</Text>
          </View>
        ))}
      </View>
    ),
    [screen?.list],
  );
  const onFetch = useCallback(async () => {
    if (fromOnboarding) {
      const startDate = new Date();
      setUserLoadingData(true);
      await updateAllData();
      const endDate = new Date();
      const dateDiff = Math.abs(startDate - endDate);
      console.log('dateDiff', dateDiff);
      if (screen?.timeout) {
        dateDiff > screen?.timeout
          ? setUserLoadingData(false)
          : setTimeout(() => {
              setUserLoadingData(false);
            }, screen?.timeout - dateDiff);
      } else {
        setUserLoadingData(false);
      }
    }
  }, [fromOnboarding, screen?.timeout]);

  useEffect(() => {
    onFetch();
  }, []);

  return (
    <>
      <Spinner visible={loading} />
      <ScrollView
        style={{flex: 1, backgroundColor: '#FFF'}}
        showsVerticalScrollIndicator={false}>
        {!userLoadingData && (
          <TouchableOpacity
            onPress={() => onSkip(true)}
            style={styles.closeView}>
            <Image
              style={{width: 18, height: 18}}
              source={require('../../assets/icons/close.png')}
            />
          </TouchableOpacity>
        )}
        {/*<Text style={styles.title}>{screen?.title}</Text>*/}
        <Image
          source={{uri: screen?.image}}
          style={{
            width: '100%',
            alignSelf: 'center',
            height: common.getLengthByIPhone7(264),
          }}
        />
        <View style={{marginVertical: 24, paddingHorizontal: 16}}>
          {plansView}
        </View>
        {renderChecks()}
      </ScrollView>
      <View
        style={{
          alignItems: 'center',
          padding: 8,
          backgroundColor: '#FFF',
          paddingBottom: insets.bottom + 8,
        }}>
        {/*{footerArr.map(item => (*/}
        {/*  <FooterItem title={item.title} onPress={item.onPress} key={item.id} />*/}
        {/*))}*/}
        <Text style={styles.decr}>{screen?.description_bottom}</Text>
        <Btn
          underlayColor={Colors.underLayYellow}
          title={notTrialPlans?.[currentPlan]?.button}
          backgroundColor={Colors.yellow}
          customStyle={{
            width: common.getLengthByIPhone7(0) - 32,
            borderRadius: 16,
            backgroundColor: Colors.underLayYellow,
            marginTop: 12,
            height: 54,
          }}
          customTextStyle={{
            fontWeight: '600',
            fontSize: 16,
            lineHeight: 19,
            color: '#FFF',
          }}
          onPress={() =>
            payHandle(
              notTrialPlans[currentPlan],
              value => setLoading(value),
              navigation,
              fromOnboarding,
              screen,
            )
          }
        />
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 8,
          }}>
          <Text
            style={[styles.restoreText, {marginRight: 24}]}
            onPress={() => Linking.openURL('https://wecook.app/terms')}>
            {network?.strings?.Terms}
          </Text>
          <Text style={styles.restoreText} onPress={() => checkSub()}>
            {network?.strings?.Restore}
          </Text>
        </View>
      </View>
      <TrialModal
        modal={trialModal}
        plan={trialPlan}
        closeModal={() => {
          setTrialModal(false);
          setTimeout(() => onSkip(true), 400);
        }}
        isLoading={trialLoading}
        onPay={async () => onPayTrial()}
        checkSub={() => checkSub(true)}
      />
      <PrivacyModal
        modal={privacyModal}
        closeModal={() => setprivacyModal(false)}
        mode={textMode}
      />
    </>
  );
});

export default PayWallScreen;

const styles = StyleSheet.create({
  logoTitle: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 16,
    lineHeight: 19,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    color: Colors.textColor,
  },
  closeView: {
    position: 'absolute',
    top: getStatusBarHeight(),
    left: 0,
    padding: 24,
    zIndex: 100,
  },
  title: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 22,
    lineHeight: 26,
    fontWeight: Platform.select({ios: '800', android: 'bold'}),
    marginBottom: 30,
  },
  decr: {
    fontFamily: Platform.select({
      ios: 'SF Pro Display',
      android: 'SFProDisplay-Regular',
    }),
    fontSize: 12,
    lineHeight: 14,
    fontWeight: '500',
    color: Colors.grayColor,
    textAlign: 'center',
  },
  restoreText: {
    fontFamily: Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Medium',
    fontSize: 13,
    lineHeight: 16,
    color: '#B3B3B3',
    fontWeight: '500',
    textAlign: 'center',
  },
  checkText: {
    fontFamily: Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Medium',
    fontSize: 13,
    lineHeight: 16,
    color: Colors.textColor,
    fontWeight: '500',
  },
});
