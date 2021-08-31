import React, { Component,useState, useRef, useEffect } from 'react'
import { StyleSheet, Text, View,SafeAreaView, Image, Platform, TouchableOpacity, ImageBackground, Animated, Dimensions, Alert, StatusBar } from 'react-native'
import {FlatList, ScrollView, TextInput, TouchableHighlight } from 'react-native-gesture-handler'
import { observer,Observer, useObserver } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import {Btn} from '../components/Btn'
import common from '../../Utilites/Common'
import Colors from '../constants/Colors'
import LinearGradient from 'react-native-linear-gradient'
import { getBottomSpace, getStatusBarHeight } from 'react-native-iphone-x-helper'
import FavorItem from '../components/FavoriteScreen/FavorItem'
import network from '../../Utilites/Network'
import {captureScroll, getSpoingyTransform} from "../animations/SpoingyHelpers"


const HolidayMenuScreen = observer(({navigation}) => {
    const headerHeight = 300
    const scrollY = useRef(new Animated.Value(0)).current
    const body = []
    const header = [
        <View style={styles.header}>
            <TouchableOpacity activeOpacity={1} style={{position:'absolute',left:0,paddingVertical:12,paddingHorizontal:16,zIndex:100}} 
            onPress={() => navigation.goBack()}>
                <Image source={require('../../assets/icons/goBack.png')} style={{width:11,height:18,tintColor:Colors.textColor}} />
            </TouchableOpacity>
            <Animated.Text style={{...styles.headerTitle,
                opacity:scrollY.interpolate({inputRange:[0,209,225],outputRange:[0,0,1],extrapolate:'extend'})}}
            >
                Летнее праздничное меню
            </Animated.Text>
        </View>
    ]

    const openRec = (rec) => {
        navigation.navigate('ReceptScreen',{rec:rec})
    }
 
    const listHandler = (isInList,recept) => {
        isInList ? network.deleteFromList(recept) : network.addToList(recept)
    }

    for (let i = 0; i < network.additionMenu.menu.length; i++) {
        const rec = network.additionMenu.menu[i]
        body.push(
            <View key={rec?.id}>
                <FavorItem recept={rec} onPress={() => openRec(rec)} listHandler={(isInList,recept) => listHandler(isInList,recept)} />
                <Text style={styles.subtitle}>Лето - прекрасная жаркая пора и в эту самую пору хочется баловать себя вкусной и полезной едой. Мы разработали меню, </Text>
            </View>
        )
    }

    useEffect(() => {
        const onFocus = navigation.addListener('focus', () => {
        if(Platform.OS == 'android'){
                StatusBar.setBackgroundColor('transparent', true);
                StatusBar.setBarStyle('dark-content', true);
                StatusBar.setTranslucent(true)
            }
        });
        return onFocus;
    }, [navigation]);

    useEffect(() => {
        const onBlur = navigation.addListener('blur', () => {
            if(Platform.OS == 'ios'){
                StatusBar.setBarStyle('dark-content', true);
            } else {
                StatusBar.setBackgroundColor('#FFF', true);
                StatusBar.setBarStyle('dark-content', true);
                StatusBar.setTranslucent(false)
            }
        });
        return onBlur;
    }, [navigation]);
    return (
        <View style={{flex:1,backgroundColor:'#FFF'}}>
            {header}
            <Animated.View style={{height:44 + getStatusBarHeight(),backgroundColor:'#FFF',width:'100%',
                position:'absolute',zIndex:5,opacity:scrollY.interpolate({inputRange:[0,200,210],outputRange:[0,0,1],extrapolate:'extend'})}} />
            <Animated.ScrollView {...captureScroll(scrollY)} showsVerticalScrollIndicator={false}>
                <Animated.Image
                source={require('../../assets/img/holidayImage.png')}
                style={{
                    width: '100%',
                    height: headerHeight,
                    transform: getSpoingyTransform(scrollY, headerHeight),
                }}
                />
                <View style={styles.container}>
                    <Text style={styles.title}>Летнее праздничное меню</Text>
                    <Text style={styles.subtitle}>Лето - прекрасная жаркая пора и в эту самую пору хочется баловать себя вкусной и полезной едой. Мы разработали меню, которое подходит не только для лета, но и для любых праздников. Дни рождения, выезд на природу с друзьми или просто на пикник в парк. Попробуйте и убедитесь сами.</Text>
                    {body}
                </View>
            </Animated.ScrollView>
            {network.listDishes.length ? 
            <View style={{padding:8,backgroundColor:"#FFF",paddingBottom:getBottomSpace() + 8}}>
                <TouchableHighlight onPress={() => navigation.navigate('ListScreen')}
                    style={{width:'100%',padding:16,backgroundColor:Colors.yellow,borderRadius:16}} 
                    underlayColor={Colors.underLayYellow}>
                    <View style={{width:'100%',borderRadius:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}} >
                    <View style={{flexDirection:'row',alignItems:'center'}}>
                    <View style={{padding:3,borderRadius:10,backgroundColor:Colors.textColor,marginRight:7}}>
                        <Text style={{...styles.headerSubitle,fontWeight:'bold',color:'#FFF'}}>{network.listDishes.length}</Text>
                    </View>
                    <Text style={{...styles.headerSubitle,fontWeight:'500'}}>Рецепт в списке</Text>
                    </View>
                    <View style={{flexDirection:'row',alignItems:'center'}}>
                        <Image source={require('../../assets/icons/listMenu.png')} style={{width:23,height:21,marginRight:5}} />
                        <Text style={styles.timeText}>от 2 ч.</Text>
                    </View>
                    </View>
                </TouchableHighlight>
            </View> : null}
        </View>
    )
})

export default HolidayMenuScreen

const styles = StyleSheet.create({
    header:{
        height:44,position:'absolute',zIndex:10,top:getStatusBarHeight(),
        width:'100%',justifyContent:'center',alignItems:'center',
        backgroundColor:'transparent',
    },
    headerTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:16,
        lineHeight:19,fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        color:Colors.textColor,
    },
    container:{
        height:'100%',
        backgroundColor:'#FFF',
        borderTopLeftRadius:24,borderTopRightRadius:24,top:-72,
        paddingTop:40,paddingHorizontal:16,
    },
    title:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:22,
        lineHeight:26,fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        color:Colors.textColor,marginBottom:8
    },
    subtitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:14,
        lineHeight:17,
        color:Colors.textColor,marginBottom:common.getLengthByIPhone7(40)
    }
})
