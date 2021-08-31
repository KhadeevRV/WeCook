import React, { Component } from 'react'
import { StyleSheet, Text, View,SafeAreaView, ImageBackground, Dimensions, Image, Platform,TouchableOpacity } from 'react-native'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import common from '../../../Utilites/Common'
import { getStatusBarHeight, getBottomSpace } from 'react-native-iphone-x-helper'
import Colors from '../../constants/Colors'
import { BlurView } from '@react-native-community/blur'
import LinearGradient from 'react-native-linear-gradient'
import FastImage from 'react-native-fast-image'
import GestureRecognizer from 'react-native-swipe-gestures'

const RecipeOfTheDay = ({recept,onPress,blur=false,onSwipeUp= () => null}) => {

    const screenHeight = Dimensions.get('window').height + Platform.select({ ios: 0, android: getStatusBarHeight()})
    const config = {
        velocityThreshold: 0.3,
        directionalOffsetThreshold: 80
    };
    return (
        <GestureRecognizer config={config} onSwipeUp={() => onSwipeUp()}>
        <TouchableOpacity onPress={() => onPress()} activeOpacity={1}>
        <FastImage style={{width:'100%',height:screenHeight,paddingBottom:common.getLengthByIPhone7(28) + getBottomSpace(),justifyContent:'flex-end'}} 
            source={{uri:recept?.images?.big_webp,}} key={recept?.images?.big_webp}
        >
            {blur ? 
            <BlurView 
                style={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                // borderRadius:17
                }}
                blurType="light"
                blurAmount={24}
                blurRadius={24}
                reducedTransparencyFallbackColor={'#FFF'}
            /> : null}
            <LinearGradient colors={['rgba(0, 0, 0, 0.4)', `rgba(0, 0, 0,0)`]} 
            style={{position:'absolute',width:'100%',top:0,height:common.getLengthByIPhone7(104)}} />
            <LinearGradient colors={['rgba(0, 0, 0, 0)', `rgba(0, 0, 0, .4)`]} 
            style={{position:'absolute',bottom:0,height:common.getLengthByIPhone7(208),width:'100%'}} />
            <View style={{flexDirection:'row',alignItems:'center',marginBottom:13,paddingHorizontal:16,}}>
                <Image style={{width:17,height:17}} source={require('../../../assets/icons/clock.png')} />
                <Text style={styles.timeText}>{recept?.cook_time} м.</Text>
                {recept?.labels?.keto ? 
                <>
                <Image style={{width:16,height:18,marginLeft:12}} source={require('../../../assets/icons/keto.png')} />
                <Text style={{...styles.timeText,color:'#D7FF95'}}>Кето</Text>
                </>
                :
                recept?.labels?.vegan ?
                <>
                <Image style={{width:17,height:17,marginLeft:12}} source={require('../../../assets/icons/vegan.png')} />
                <Text style={{...styles.timeText,color:Colors.greenColor}}>Вегетарианское</Text>
                </>
                :
                recept?.labels?.lowcarb ?
                <>
                <Image style={{width:16,height:16,marginLeft:12}} source={require('../../../assets/icons/lowcal.png')} />
                <Text style={{...styles.timeText,color:'#FFF495'}}>Безуглеводное</Text>
                </> : null}
            </View>
            <Text style={styles.title}>{recept?.name}</Text>
        </FastImage>
        </TouchableOpacity>
        </GestureRecognizer>
    )
}

export default RecipeOfTheDay

const styles = StyleSheet.create({
    title:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:22,
        lineHeight:26,paddingHorizontal:16,
        color:'#FFF',
        fontWeight:Platform.select({ ios:'800', android: 'bold' }),
    },
    timeText:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:13,
        lineHeight:15,
        fontWeight:'500',
        color:'#FFF',marginLeft:4
    }
})
