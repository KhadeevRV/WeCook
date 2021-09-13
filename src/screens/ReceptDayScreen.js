import React, { Component, useRef,useState,useEffect } from 'react'
import { StyleSheet, Text, View,SafeAreaView, Dimensions, Image,Animated as ReactAnimated, StatusBar, Platform, BackHandler,TouchableOpacity } from 'react-native'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { observer,Observer, useObserver } from 'mobx-react-lite'
import network from '../../Utilites/Network'
import RecipeOfTheDay from '../components/ReceptDayScreen/RecipeOfTheDay'
import common from '../../Utilites/Common'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import LinearGradient from 'react-native-linear-gradient'
import Animated from 'react-native-reanimated';
import FlashMessage,{ showMessage, hideMessage } from "react-native-flash-message"
import GestureRecognizer from 'react-native-swipe-gestures'

const ReceptDayScreen = observer(({navigation}) => {

    const screenHeight = Dimensions.get('window').height + Platform.select({ ios: 0, android: getStatusBarHeight() })
    const [page, setPage] = useState(0)
    const [stop, setstop] = useState(false)
    const screens = []

    for (let i = 0; i < network.dayDishes.length; i++) {
        screens.push(i * screenHeight)
    }
    
    const openRec = (rec) => {
        if(isFocused){
            const recept = network.allDishes.find((item) => item.id == rec.id)
            navigation.navigate('ReceptScreen',{rec:recept})
        }
    }

    const titles = []
    for (let i = 0; i < network.dayDishes.length; i++) {
        titles.push(
            // <View style={{flexDirection:'row',alignItems:'center',marginTop:12,opacity:i == page ? 1 : 0.5}} key={network.dayDishes[i].id}>
            //     <Image source={require('../../assets/icons/star.png')} style={{width:18,height:18,marginRight:8}} />
            //     <Text style={{fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:16,color:'#FFF',fontWeight:'500'}}>
            //         {network.dayDishes[i]?.eating} дня
            //     </Text>
            // </View>
            <View style={{width:4,borderRadius:4,backgroundColor:'#FFF',height: i == page ? 12 : 4,marginTop:4}} key={network.dayDishes[i].id} />
        )
    }


    const [isFocused, setIsFocused] = useState(false)
    useEffect(() => {
        const onFocus = navigation.addListener('focus', () => {
            setIsFocused(true)
            BackHandler.addEventListener('hardwareBackPress', () => true);
            if(Platform.OS == 'ios'){
                StatusBar.setBarStyle('light-content', true);
            } else {
                StatusBar.setBackgroundColor('transparent', true);
                StatusBar.setBarStyle('light-content', true);
                StatusBar.setTranslucent(true)
            }
        });
        return onFocus;
    }, [navigation]);

    useEffect(() => {
        const onBlur = navigation.addListener('blur', () => {
            setIsFocused(false)
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
        <>
        <View style={{flexDirection:'row',position:'absolute',right:0,zIndex:10,top:getStatusBarHeight()}}>
            <TouchableOpacity style={{padding:16}} onPress={() => navigation.navigate('MenuScreen')} activeOpacity={1}>
                <Image style={{width:16,height:16}} source={require('../../assets/icons/close.png')} />
            </TouchableOpacity>
        </View>
        <FlatList
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                bounces={false}
                data={network.dayDishes}
                scrollEventThrottle={8}
                pagingEnabled={true}
                decelerationRate={Platform.select({ ios: 'fast', android: 0.8})}
                snapToInterval={common.getLengthByIPhone7(0)-common.getLengthByIPhone7(32)}
                disableIntervalMomentum={true}
                snapToAlignment={"center"}
                // initialNumToRender={3}
                snapToOffsets={screens}
                extraData={network.dayDishes}
                onScroll={event => {
                    let newPage = Math.round((event.nativeEvent.contentOffset.y/screenHeight).toFixed(1))
                    setTimeout(() => {
                        if(page != newPage){
                            setPage(newPage)
                        }
                    }, 100);
                }}
                keyExtractor={(item, index) => index} 
                renderItem={({item,index}) => <RecipeOfTheDay recept={item} onPress={() => openRec(item)} blur={Platform.OS == 'ios' && !isFocused}
                onSwipeUp={() => index + 1 == network.dayDishes.length ? navigation.navigate('MenuScreen') : null}/>}
        />
        <View style={{position:'absolute',bottom:common.getLengthByIPhone7(195),paddingLeft:16,}}>
            {titles}
        </View>
        {/* <ReactAnimated.View style={{width:'100%',height:screenHeight,position:'absolute',backgroundColor:'#000',opacity:fadeAnim,
            display:isOpenSheet ? 'flex' : 'none',}} /> */}
        </>
    )
})

export default ReceptDayScreen

const styles = StyleSheet.create({})
