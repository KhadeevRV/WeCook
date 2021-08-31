import React, { Component,useState, useRef, useEffect } from 'react'
import { StyleSheet, Text, View, Image, Platform, TouchableOpacity, SafeAreaView, Animated, Dimensions, Alert,Share } from 'react-native'
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


const DetailsScreen = observer(({navigation}) => {

    const [socialModal, setSocialModal] = useState(false)
 
    const header = [
        <View style={styles.header}>
            <TouchableOpacity activeOpacity={1} style={{position:'absolute',left:0,paddingVertical:11,paddingHorizontal:16,zIndex:100}} 
            onPress={() => navigation.goBack()}>
                <Image source={require('../../assets/icons/goBack.png')} style={{width:11,height:18,tintColor:Colors.textColor}} />
            </TouchableOpacity>
            <View style={{alignItems:'center',alignSelf:'center'}}>
                <Text style={styles.headerTitle}>Детали аккаунта</Text>
            </View>
        </View>
    ]

    const bodyArr = [
        {
            id:1,
            title:'Номер телефона',
            subtitle:network.user?.phone ? '+' + network.user?.phone : 'Нет данных',
            onPress: () => navigation.navigate('LoginScreen',{fromProfile:true}),
        },
        {
            id:2,
            title:'Имя пользователя',
            subtitle:network.user?.name ?? 'Нет данных',
            onPress: () => navigation.navigate('ChangeNameEmailScreen',{what:'name'}),
        },
        {
            id:3,
            title:'Email',
            subtitle:network.user?.email ?? 'Нет данных',
            onPress: () => navigation.navigate('ChangeNameEmailScreen',{what:'email'}),
        },
        {
            id:4,
            title:'Предпочтения',
            subtitle:network.user?.preference ?? 'Нет данных',
            onPress: () => navigation.navigate('ChangeWishesScreen',{what:'preference'}),
        },
        {
            id:5,
            title:'Количество персон',
            subtitle:network.user?.persons ? network.user?.persons.toString() : 'Нет данных',
            onPress: () => navigation.navigate('ChangeWishesScreen',{what:'persons'}),
        },
    ]

    const body = []
    for (let i = 0; i < bodyArr.length; i++) {
        item = bodyArr[i]
        body.push(
            <ProfileItem title={item.title} subtitle={item.subtitle} onPress={item.onPress} key={item.id} />
        )
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
                    <Text style={styles.title}>Личное</Text>
                </View>
                {body}
                <View style={styles.container}>
                <Text style={styles.title}>Подписка</Text>
                <TouchableOpacity style={{marginBottom:16}} activeOpacity={1}
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
            </ScrollView>
        </View>
    )
})

export default DetailsScreen

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
    payTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:16,
        lineHeight:19,fontWeight:'500',
        color:Colors.textColor,
    },
})
