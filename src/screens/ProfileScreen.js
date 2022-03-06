import React, { Component,useState, useRef, useEffect } from 'react'
import { StyleSheet, Text, View, Image, Platform, TouchableOpacity, ImageBackground, Animated, SafeAreaView, Alert,Share, AsyncStorage, Linking } from 'react-native'
import {FlatList, ScrollView, TextInput, TouchableHighlight } from 'react-native-gesture-handler'
import network, { authUser, getFavors, getList, getMenu, listClear, updateInfo } from '../../Utilites/Network'
import { observer,Observer, useObserver } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import {Btn} from '../components/Btn'
import common from '../../Utilites/Common'
import Colors from '../constants/Colors'
import DayRecipeCard from '../components/MenuScreen/DayRecipeCard'
import LinearGradient from 'react-native-linear-gradient'
import ProfileItem from '../components/ProfileScreen/ProfileItem'
import DropShadow from 'react-native-drop-shadow'
import Config from '../constants/Config'
import { FeedBackModal } from '../components/ProfileScreen/FeedBackModal'
import Rate, { AndroidMarket } from 'react-native-rate'
import { PrivacyModal } from '../components/ProfileScreen/PrivacyModal'
import Spinner from 'react-native-loading-spinner-overlay'

export const FooterItem = ({title,onPress}) => {
    return(
        <TouchableOpacity style={{height:50,justifyContent:'center',alignItems:'center'}} activeOpacity={1} onPress={() => onPress()}>
            <Text style={styles.footerText}>{title}</Text>
        </TouchableOpacity>
    )
}


const ProfileScreen = observer(({navigation}) => {

    const [socialModal, setSocialModal] = useState(false)
    const [privacyModal, setprivacyModal] = useState(false)
    const scrollY = useRef(new Animated.Value(0)).current
    const [loading, setloading] = useState(false)
    const [textMode, setTextMode] = useState('privacy')

    const rateApp = () => {
        let options = {
            AppleAppID:"1577136146",
            GooglePackageName:"app.wecook",
            OtherAndroidURL:"http://www.randomappstore.com/app/47172391",
            preferredAndroidMarket: AndroidMarket.Google,
            preferInApp:false,
            openAppStoreIfInAppFails:true,
            fallbackPlatformURL:"http://www.mywebsite.com/myapp.html",
        }
        Rate.rate(options, (success)=>{
            if (success) {
              console.warn(success)
            }
        })
    }

    const header = [
        <View style={styles.header}>
            <TouchableOpacity activeOpacity={1} style={{position:'absolute',left:0,paddingVertical:11,paddingHorizontal:16,zIndex:100,
                bottom:3}} 
            onPress={() => navigation.goBack()}>
                <Image source={require('../../assets/icons/goBack.png')} style={{width:11,height:18,tintColor:Colors.textColor}} />
            </TouchableOpacity>
            <View style={{alignItems:'center',alignSelf:'center'}}>
                <Animated.Text style={{...styles.headerTitle,
                    opacity:scrollY.interpolate({inputRange:[0,29],outputRange:[0,1],extrapolate:'extend'})
                }}>
                    {network?.user?.name ?? ''}
                </Animated.Text>
            </View>
        </View>
    ]

    const bodyArr = [
        {
            title:'Твой профиль',
            id:1,
            body:[{
                id:1,
                title:'Детали аккаунта',
                height:56,
                onPress: () => navigation.navigate('DetailsScreen'),
                icon:{
                    source:require('../../assets/icons/profile.png'),
                    style:{width:20,height:22,}
                }
            },
            {
                id:2,
                title:'Настройки',
                height:56,
                onPress: () => navigation.navigate('SettingsScreen'),
                icon:{
                    source:require('../../assets/icons/settings.png'),
                    style:{width:22,height:24,}
                }
            }]
        },{
            title:'Поддержи нас',
            id:1,
            body:[{
                id:1,
                title:'Оценить приложение',
                height:56,
                onPress: () => rateApp(),
                icon:{
                    source:require('../../assets/icons/blackStar.png'),
                    style:{width:24,height:24}
                }
            },
            {
                id:2,
                title:'Пригласить знакомых',
                height:56,
                onPress: () => Share.share({message:`Отличное приложение WeCook. Рекомендую! https://wecookapp.page.link/getApp`}),
                icon:{
                    source:require('../../assets/icons/profilePlus.png'),
                    style:{width:20,height:20,}
                }
            }]
        }
    ]

    const renderBody = (item) => {
        const body = []
        for (let i = 0; i < item?.body.length; i++) {
            let element = item?.body[i]
            body.push(
                <ProfileItem title={element.title} icon={element.icon} height={element.height} onPress={element.onPress} key={element.id} />
            )
        }
        return(
            <View style={{marginTop:41}}>
                <Text style={styles.itemTitle} allowFontScaling={false}>{item.title}</Text>
                {body}
            </View>
        )
    }


    const footerArr = [
        // {
        //     id:1,
        //     title:'Оценить приложение',
        //     onPress: () => rateApp(),
        // },
        // {
        //     id:2,
        //     title:'Поделиться приложением',
        //     onPress: () => {
        //         Share.share({
        //             message:
        //               `Отличное приложение WeCook. Рекомендую!`,
        //           })
        //     },
        // },
        {
            id:3,
            title:'Пользовательское соглашение',
            // onPress: () => Linking.openURL('https://wecook.app/politic'),
            onPress: () => {
                setTextMode('agreement')
                setprivacyModal(true)
            },
        },{
            id:4,
            title:'Политика конфиденциальности',
            onPress: () => {
                setTextMode('privacy')
                setprivacyModal(true)
            },
        },
    ]

    const footer = []
    for (let i = 0; i < footerArr.length; i++) {
        item = footerArr[i]
        footer.push(
            <FooterItem title={item.title} onPress={item.onPress} key={item.id} />
        )
    }

    const exit = async () => {
        runInAction(async () => {
            setloading(true)
            network.access_token = null
            await AsyncStorage.removeItem('token')
            await authUser()
            await getMenu()
            await getFavors()
            setloading(false)
            navigation.navigate('LoginScreen',{exit:true})
        })
    }


    return (
        <View style={{flex:1,backgroundColor:'#FFF'}}>
            <Spinner visible={loading} />
            <SafeAreaView backgroundColor={'#FFF'} />
            {header}
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom:120}}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {y: scrollY}}}],
                    {useNativeDriver:false},
                )}
            >
                <View style={styles.container}>
                    <Animated.Text onPress={() => network?.user?.name ? null : navigation.navigate('ChangeNameEmailScreen',{what:'name'})} 
                    style={[styles.title,
                        {color:network?.user?.name ? Colors.textColor : Colors.grayColor}
                    ]}>
                        {network?.user?.name ?? 'Как тебя зовут?'}
                    </Animated.Text>
                    <Text style={styles.subtitle}>{network?.user?.phone ? '+' + network?.user?.phone : ''}</Text>
                    {network.user?.access ? null :
                    <TouchableOpacity style={{marginTop:24}} activeOpacity={1}
                        onPress={() => navigation.navigate('PayWallScreen',{data:network.paywalls[network.user?.banner?.type]})}>
                    <View style={{width:14,height:14,borderRadius:10,zIndex:100,backgroundColor:'#FFF',position:'absolute',top:0,right:0,justifyContent:'center',alignItems:'center'}}>
                    <View style={{width:8,height:8,borderRadius:4,backgroundColor:Colors.yellow}} />
                    </View>
                    <ImageBackground source={{uri:network.user?.banner?.image_btn?.big_webp}}
                    borderRadius={16}
                            style={{paddingHorizontal:16,paddingVertical:21,borderRadius:16}}
                    >
                        <Text style={styles.payTitle}>{network.user?.banner?.title_on_btn}</Text>
                    </ImageBackground>
                    </TouchableOpacity>}
                </View>
                {bodyArr.map(item => renderBody(item))}
                <View style={{
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 4,
                        },
                        shadowOpacity: 0.08,
                        shadowRadius: 20,marginVertical:16
                    }}>
                <TouchableOpacity activeOpacity={1} style={styles.feedbackView}
                    onPress={() => setSocialModal(true)}
                >
                    <View style={{paddingHorizontal:24,paddingVertical:10.5,backgroundColor:'#F5F5F5',borderRadius:18,flexWrap:'wrap'}}>
                        <Text style={styles.payTitle}>Связаться с нами</Text>
                    </View>
                </TouchableOpacity>
                </View>
                {footer}
                {/* <TouchableOpacity style={{height:50,justifyContent:'center',alignItems:'center'}} activeOpacity={1} onPress={() => exit()}>
                        <Text style={{...styles.footerText,color:'#FF0000'}} >Выйти</Text>
                </TouchableOpacity> */}
                <Text style={styles.versionText}>Версия приложения {Config.version}</Text>
            </ScrollView>
            <FeedBackModal modal={socialModal} closeModal={() => setSocialModal(false)} />
            <PrivacyModal modal={privacyModal} closeModal={() => setprivacyModal(false)} mode={textMode}  />
        </View>
    )
})

export default ProfileScreen

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
        paddingHorizontal:16,paddingTop:4
    },
    title:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:22,
        lineHeight:25,fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        color:Colors.textColor,marginBottom:4,
    },
    subtitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Medium' }), fontSize:12,
        lineHeight:14,
        color:Colors.grayColor,
    },
    itemTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Medium' }), fontSize:18,
        lineHeight:21,fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        color:Colors.textColor,marginBottom:10,marginLeft:16
    },
    payTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Medium' }), fontSize:16,
        lineHeight:19,fontWeight:'500',
        color:Colors.textColor,
    },
    footerText:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:14,
        lineHeight:17,fontWeight: 'bold',
        color:Colors.textColor,
    },
    versionText:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:12,
        lineHeight:14,
        color:Colors.grayColor,marginTop:10,textAlign:'center'
    },
    feedbackView:{
        padding:20,backgroundColor:'#FFF',marginHorizontal:16,borderRadius:16,alignItems:'center',
        elevation:10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,
    }
})
