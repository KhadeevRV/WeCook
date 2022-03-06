import { observer } from 'mobx-react-lite'
import React from 'react'
import { Image, Platform, StyleSheet, Text, View } from 'react-native'
import { TouchableHighlight } from 'react-native-gesture-handler'
import { getBottomSpace } from 'react-native-iphone-x-helper'
import common from '../../Utilites/Common'
import network from '../../Utilites/Network'
import Colors from '../constants/Colors'

const BottomListBtn = observer(({navigation}) => {
    return (
        <View style={{padding:8,backgroundColor:"#FFF",paddingBottom:getBottomSpace() + 8}}>
            <TouchableHighlight onPress={() => navigation.navigate('ListScreen')}
                style={{width:'100%',padding:17,backgroundColor:Colors.yellow,borderRadius:16}} 
                underlayColor={Colors.underLayYellow}>
                {/* <View style={{width:'100%',borderRadius:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}} > */}
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                <View style={{
                    paddingHorizontal: 4,
                    paddingTop:2,paddingBottom:3,
                    borderRadius:20,
                    backgroundColor:Colors.textColor,marginRight:7,
                    minWidth:24,
                    alignItems:'center',
                }}>
                    <Text style={{...styles.headerSubitle,}}>{network.listDishes.length}</Text>
                </View>
                <Text style={styles.addsTitle}>
                    {common.declOfNum(network.listDishes.length,['Рецепт','Рецепта','Рецептов'])} в Списке продуктов
                </Text>
                </View>
                {/* <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Image source={require('../../assets/icons/listMenu.png')} style={{width:23,height:21,marginRight:5}} />
                    <Text style={styles.timeText}>от 2 ч.</Text>
                </View> */}
                {/* </View> */}
            </TouchableHighlight>
        </View>
    )
})

export default BottomListBtn

const styles = StyleSheet.create({
    addsTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Medium' }), fontSize:16,
        lineHeight:19,
        color:Colors.textColor
    },
    timeText:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Medium' }), fontSize:14,
        fontWeight:'500',
        lineHeight:17,
        color:Colors.textColor
    },
    headerSubitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:12,
        fontWeight:'bold',
        color:'#FFF',
        lineHeight:16,
    },
})
