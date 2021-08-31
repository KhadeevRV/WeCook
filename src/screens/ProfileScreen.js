import React, { Component,useState, useRef, useEffect } from 'react'
import { StyleSheet, Text, View, Image, Platform, TouchableOpacity, ImageBackground, Animated, SafeAreaView, Alert,Share } from 'react-native'
import {FlatList, ScrollView, TextInput, TouchableHighlight } from 'react-native-gesture-handler'
import network, { getList, listClear } from '../../Utilites/Network'
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

const FooterItem = ({title,onPress}) => {
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
 
    const header = [
        <View style={styles.header}>
            <TouchableOpacity activeOpacity={1} style={{position:'absolute',left:0,paddingVertical:11,paddingHorizontal:16,zIndex:100}} 
            onPress={() => navigation.goBack()}>
                <Image source={require('../../assets/icons/goBack.png')} style={{width:11,height:18,tintColor:Colors.textColor}} />
            </TouchableOpacity>
            <View style={{alignItems:'center',alignSelf:'center'}}>
                <Animated.Text style={{...styles.headerTitle,opacity:scrollY.interpolate({inputRange:[0,25],outputRange:[0,1],extrapolate:'extend'})}}>
                    {network?.user?.name ?? ''}
                </Animated.Text>
            </View>
        </View>
    ]

    const bodyArr = [
        {
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
        }
    ]

    const body = []
    for (let i = 0; i < bodyArr.length; i++) {
        item = bodyArr[i]
        body.push(
            <ProfileItem title={item.title} icon={item.icon} height={item.height} onPress={item.onPress} key={item.id} />
        )
    }

    const footerArr = [
        {
            id:1,
            title:'Оценить приложение',
            onPress: () => {
                let options = {
                    AppleAppID:"1540264589",
                    GooglePackageName:"com.foodplan",
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
            },
        },
        {
            id:2,
            title:'Поделиться приложением',
            onPress: () => console.warn('Поделиться приложением'),
        },
        {
            id:3,
            title:'Политика конфиденциальности',
            onPress: () => setprivacyModal(true),
        }
    ]

    const footer = []
    for (let i = 0; i < footerArr.length; i++) {
        item = footerArr[i]
        footer.push(
            <FooterItem title={item.title} onPress={item.onPress} key={item.id} />
        )
    }

    return (
        <View style={{flex:1,backgroundColor:'#FFF'}}>
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
                    <Animated.Text style={{...styles.title}}>
                        {network?.user?.name ?? 'Как тебя зовут?'}
                    </Animated.Text>
                    <Text style={styles.subtitle}>{network?.user?.phone ? '+' + network?.user?.phone : ''}</Text>
                    <TouchableOpacity style={{marginTop:24,marginBottom:16}} activeOpacity={1}
                        onPress={() => navigation.navigate('PayWallScreen')}>
                    <LinearGradient colors={['rgba(235,255,222, 1)', `rgba(167,239,255,1)`]} 
                            start={{x:0,y:1}}
                            end={{x:1,y:1}}
                            locations={[0.4,0.88]}
                            style={{paddingHorizontal:16,paddingVertical:19,borderRadius:16}}
                    >
                        <Text style={styles.payTitle}>Открой для себя полный{'\n'}доступ!</Text>
                    </LinearGradient>
                    </TouchableOpacity>
                </View>
                {body}
                <View style={{
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 4,
                        },
                        shadowOpacity: 0.08,
                        shadowRadius: 20,marginTop:16
                    }}>
                <TouchableOpacity activeOpacity={1} style={styles.feedbackView}
                    onPress={() => setSocialModal(true)}
                >
                    <View style={{paddingHorizontal:24,paddingVertical:7,backgroundColor:'#F5F5F5',borderRadius:18,flexWrap:'wrap'}}>
                        <Text style={styles.payTitle}>Связаться с нами</Text>
                    </View>
                </TouchableOpacity>
                </View>
                {footer}
                <TouchableOpacity style={{height:50,justifyContent:'center',alignItems:'center'}} activeOpacity={1} onPress={() => console.warn('exit')}>
                        <Text style={{...styles.footerText,color:'#FF0000'}} >Выйти</Text>
                </TouchableOpacity>
                <Text style={styles.versionText}>Версия приложения {Config.version}</Text>
            </ScrollView>
            <FeedBackModal modal={socialModal} closeModal={() => setSocialModal(false)} />
            <PrivacyModal modal={privacyModal} closeModal={() => setprivacyModal(false)}  />
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
        paddingHorizontal:16
    },
    title:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:22,
        lineHeight:25,fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        color:Colors.textColor,
    },
    subtitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:12,
        lineHeight:14,
        color:Colors.grayColor,
    },
    payTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:16,
        lineHeight:19,fontWeight:'500',
        color:Colors.textColor,
    },
    footerText:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:14,
        lineHeight:17,fontWeight: 'bold',
        color:Colors.textColor,
    },
    versionText:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:10,
        lineHeight:12,
        color:Colors.grayColor,marginTop:10,textAlign:'center'
    },
    feedbackView:{
        padding:16,backgroundColor:'#FFF',marginHorizontal:16,borderRadius:16,alignItems:'center',marginBottom:22,
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
