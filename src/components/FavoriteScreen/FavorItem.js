import React, {useState, useEffect} from 'react'
import { StyleSheet, Text, View,SafeAreaView, ImageBackground, Dimensions, Image, Platform,TouchableHighlight,TouchableOpacity } from 'react-native'
import { FlatList, ScrollView,  } from 'react-native-gesture-handler'
import common from '../../../Utilites/Common'
import { getStatusBarHeight, getBottomSpace } from 'react-native-iphone-x-helper'
import Colors from '../../constants/Colors'
import { BlurView } from '@react-native-community/blur'
import LinearGradient from 'react-native-linear-gradient'
import FastImage from 'react-native-fast-image'
import { observer } from 'mobx-react-lite'
import DropShadow from 'react-native-drop-shadow'
import network from '../../../Utilites/Network'

const FavorItem = observer(({recept,onPress,listHandler}) => {

    const isInList = !!network.listDishes.filter((item) => item.id == recept.id).length
    
    const addToListBtn = [
        <View style={{position:'absolute',zIndex:2000,top:10,right:10}}>
        <TouchableOpacity style={{width:36,height:36,borderRadius:18,
            justifyContent:'center',alignItems:'center',
            backgroundColor:Platform.select({ ios: null, android: '#E5E5E5' }),
            overflow:'hidden'}} onPress={() => listHandler(isInList,recept)} activeOpacity={1}>
            <>
            {Platform.OS == 'ios' ?
            <BlurView 
                style={{
                position: "absolute",
                top: 0,left: 0,bottom: 0,right: 0,
                borderRadius:17
                }}
                blurType="light"
                blurAmount={24}
                blurRadius={24}
                reducedTransparencyFallbackColor={'#FFF'}
            /> : null}
            <Image source={require('../../../assets/icons/list.png')} style={{width:18,height:22}} />
            </>
        </TouchableOpacity>
        </View>
    ]

    const deleteFomListBtn = [
        <View style={{position:'absolute',zIndex:2000,top:10,right:10}}>
        <TouchableHighlight style={{width:36,height:36,borderRadius:18,
            justifyContent:'center',alignItems:'center',
            backgroundColor:Colors.yellow}} onPress={() => listHandler(isInList,recept)} underlayColor={Colors.underLayYellow}>
            <Image source={require('../../../assets/icons/complete.png')} style={{width:16,height:12}} />
        </TouchableHighlight>
        </View>
    ]

    const isNewView = [
        <View style={{position:'absolute',zIndex:2000,top:10,left:10,paddingHorizontal:6,paddingVertical:1,borderRadius:20,
                backgroundColor:Colors.textColor,justifyContent:'center',alignItems:'center'}}>
            <Text style={styles.newText}>NEW</Text>
        </View>
    ]


    const isNew = !!recept?.new


    return (
        <>
        <View style={{
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.06,
            shadowRadius: 14,
        }}>
        <TouchableOpacity onPress={() => onPress()} activeOpacity={1}
        style={{...styles.card}}>
            <FastImage source={{uri:recept?.images?.big_webp,}} key={recept?.images?.big_webp} 
                style={{width:common.getLengthByIPhone7() - 32,borderTopLeftRadius:16,borderTopRightRadius:16,justifyContent:'flex-end',
                height:common.getLengthByIPhone7(192)}}
            >
            {isNew ? isNewView : null}
            {isInList ? deleteFomListBtn : addToListBtn}
            <LinearGradient colors={['rgba(0, 0, 0, 0)', `rgba(0, 0, 0,.4)`]} 
                style={{flexDirection:'row',alignItems:'center',paddingBottom:13,paddingHorizontal:16,paddingTop:27}}>
                <Image style={{width:20,height:17}} source={require('../../../assets/icons/hat.png')} />
                <Text style={styles.timeText}>{recept?.eating}</Text>
                <Image style={{width:17,height:17,marginLeft:12}} source={require('../../../assets/icons/clock.png')} />
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
            </LinearGradient>
            </FastImage>
        <View style={{height:64,justifyContent:'center'}}>
            <Text style={styles.title} numberOfLines={2}>{recept?.name}</Text>
        </View>
        </TouchableOpacity>
        </View>
        </>
    )
})

export default FavorItem

const styles = StyleSheet.create({
    card:{
        backgroundColor:'#FFF',
        borderRadius:16,marginBottom:20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,elevation:10
    },
    title:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:14,
        lineHeight:17,paddingHorizontal:16,
        color:Colors.textColor,maxWidth:common.getLengthByIPhone7() - 64
    },
    timeText:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:12,
        lineHeight:14,
        fontWeight:'500',
        color:'#FFF',marginLeft:4
    },
    newText:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:10,
        lineHeight:12,
        fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        color:'#FFF',
    }
})
