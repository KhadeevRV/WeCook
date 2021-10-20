import React, { useState,useEffect } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Platform, Dimensions,TouchableHighlight,} from 'react-native'
import Colors from '../../constants/Colors'
import common from '../../../Utilites/Common'
import network from '../../../Utilites/Network'
import { observer } from 'mobx-react-lite'
import Modal from 'react-native-modal'
import Config from '../../constants/Config'
import FastImage from 'react-native-fast-image'
import { BlurView } from '@react-native-community/blur'


export const EarlyItem = observer(({dish,onPress}) => {

    return(
        <View style={{
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.06,
            shadowRadius: 4,
        }}>
        <TouchableOpacity activeOpacity={1} onPress={() => onPress()} style={styles.cardView}>
            <View style={{flexDirection:'row',alignItems:'center'}}>
                <FastImage 
                    style={{width:common.getLengthByIPhone7(80),
                    height:common.getLengthByIPhone7(48),marginRight:common.getLengthByIPhone7(16),borderRadius:10}} 
                    source={{uri:dish?.images?.middle_webp}} borderRadius={10} />
                <View>
                    <Text style={styles.itemTitle} numberOfLines={1}>{dish?.name}</Text>
                    <Text style={styles.itemSubtitle} numberOfLines={1}>{dish?.persons} {common.declOfNum(dish?.persons,['персона','персоны','персон'])}</Text>
                </View>                
            </View>
            <Image source={require('../../../assets/icons/goDown.png')} style={{width:13,height:8,transform:[{rotate:'-90deg'}]}} />
        </TouchableOpacity>
        </View>
    )
})


const styles = StyleSheet.create({
cardView:{
    flexDirection:'row',width:'100%',alignItems:'center',justifyContent:'space-between',
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8, elevation:10,
    backgroundColor:'#FFF',
    padding:8,paddingRight:16,
    borderRadius:16
},
item:{
    flexDirection:'row',
    justifyContent:'space-between',
    paddingHorizontal:16,
    height:49,
    alignItems:'center'
},
itemTitle:{
    fontFamily:Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',fontSize:16,
    lineHeight:19,
    maxWidth:common.getLengthByIPhone7(184),
    color:Colors.textColor,marginBottom:3,
    fontWeight:'500'
},
itemSubtitle:{
    fontFamily:Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',fontSize:12,
    lineHeight:14,
    fontWeight:'500',
    color:Colors.grayColor
},
})