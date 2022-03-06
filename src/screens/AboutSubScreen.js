import React, { Component,useState, useRef, useEffect } from 'react'
import { StyleSheet, Text, View, Image, Platform, TouchableOpacity, SafeAreaView, Animated, Dimensions, Alert,Share, Linking } from 'react-native'
import {FlatList, ScrollView, TextInput, TouchableHighlight } from 'react-native-gesture-handler'
import network, { getList, getUserInfo, listClear, payAppleOrAndroid } from '../../Utilites/Network'
import { observer } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import {Btn} from '../components/Btn'
import common from '../../Utilites/Common'
import Colors from '../constants/Colors'
import ProfileItem from '../components/ProfileScreen/ProfileItem'
import Config from '../constants/Config'
import * as RNIap from 'react-native-iap'


const AboutSubScreen = observer(({navigation}) => {

    const [loading, setLoading] = useState(false)
 
    const header = [
        <View style={styles.header} key={'subHeader'}>
            <TouchableOpacity activeOpacity={1} style={{position:'absolute',left:0,paddingVertical:11,paddingHorizontal:16,zIndex:100}} 
            onPress={() => navigation.goBack()}>
                <Image source={require('../../assets/icons/goBack.png')} style={{width:11,height:18,tintColor:Colors.textColor}} />
            </TouchableOpacity>
            <View style={{alignItems:'center',alignSelf:'center'}}>
                <Text style={styles.headerTitle}>Подписка</Text>
            </View>
        </View>
    ]

    const payHandler = (receptId) => {
        // Покупка подписки
        RNIap.requestPurchase(receptId, false)
        .then((receipt) => {
            setLoading(true)
            // Отправляем id на сервер
            payAppleOrAndroid(receipt).then(async () => {
                console.warn('receipt',receipt)
                // Обновление инфы о пользователе
                try {
                    await getUserInfo()
                    setLoading(false)
                } catch (error) {
                    console.warn(error)
                    setLoading(false)
                    Alert.alert('Ошибка','Ошибка при обновлении данных, пожалуйста, попробуйте перезайти в приложение',[{text:'Перезайти',onPress:() => DevSettings.reload()}])
                }
            }).catch(() => {
                setLoading(false)
                setTimeout(() => {
                    Alert.alert(Config.appName, 'Произошла ошибка! Попробуйте перезайти в приложение.');
                }, 300);
            })
        })
        .catch(err => {
            setLoading(false)
            console.warn('err requestPurchase: ' + err);
        });
    }

    const cancelSub = () => {
        Alert.alert(
            'Внимание', 
            `Вы действительно хотите отменить подписку? Ваша подписка будет активна до ${new Date(network.user?.subscription?.info?.expired)?.toLocaleDateString()}`,[{
            text:'Отменить',
            onPress:() => {
                if(network.user?.subscription?.unscribe_link == 'appstore'){
                    Linking.openURL('https://apps.apple.com/account/subscriptions')
                } else if (network.user?.subscription?.unscribe_link == 'googleplay'){
                    Linking.openURL('https://play.google.com/store/account/subscriptions?package=ru.foodstar.app')
                } else {
                    Linking.openURL(network.user?.unscribe_link)
                }
            }
        },{
            text:'Не отменять',
            style:'cancel',
            onPress:() => null
        }])
    }

    return (
        <View style={{flex:1,backgroundColor:'#FFF'}}>
            <SafeAreaView backgroundColor={'#FFF'} />
            {header}
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom:120}}
            >
                <View style={styles.container}>
                    <Text style={[styles.title,{marginTop:25}]}>Текущая подписка</Text>
                    <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',height:50}}>
                        <View>
                            <Text style={styles.itemTitle}>{network.user?.subscription?.plan?.name}</Text>
                            <Text style={styles.itemSubtitle}>
                                {'Активна до ' + new Date(network.user?.subscription?.info?.expired)?.toLocaleDateString()}
                            </Text>
                        </View>
                        <TouchableHighlight 
                            style={{flexWrap:'wrap',backgroundColor:'#F5F5F5',
                                justifyContent:'center',alignItems:'center',
                                paddingVertical:5,paddingHorizontal:11,borderRadius:16
                            }} 
                            underlayColor={'#EEEE'} onPress={() => cancelSub()}
                        >
                            <Text style={[styles.itemSubtitle,{color:Colors.textColor}]}>Отменить</Text>
                        </TouchableHighlight>
                    </View>
                    <Text style={styles.title}>Попробуйте</Text>
                </View>
                {network.user?.subscription?.plan_recommend ? 
                <ProfileItem 
                    title={network.user?.subscription?.plan_recommend?.name} 
                    subtitle={network.user?.subscription?.plan_recommend?.desc} 
                    onPress={() => payHandler(network.user?.subscription?.plan_recommend?.id)} 
                    key={network.user?.subscription?.plan_recommend?.id} 
                /> : null}
            </ScrollView>
        </View>
    )
})

export default AboutSubScreen

const styles = StyleSheet.create({
    header:{
        height:44,
        width:'100%',
        backgroundColor:'#FFF',justifyContent:'center'
    },
    headerTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:16,
        lineHeight:19,fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        color:Colors.textColor,
    },
    container:{
        paddingHorizontal:16
    },
    title:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:18,
        lineHeight:21,fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        color:Colors.textColor,marginTop:41,marginBottom:10
    },
    itemTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay' }),
        fontSize:16,lineHeight:19,
        color:Colors.textColor,
        fontWeight:'500',
    },
    itemSubtitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Medium' }),
        fontSize:14,lineHeight:17,
        fontWeight:'500',
        color:Colors.grayColor,
    },
})
