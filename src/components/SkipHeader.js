import React,{useState, useEffect, useRef} from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform,Animated} from 'react-native'
import Colors from '../constants/Colors'
import { TouchableHighlight } from 'react-native-gesture-handler'
import common from '../../Utilites/Common'
import { Btn } from './Btn'

const SkipHeader = ({title='',withBack=true,goBack=() => null,skip=() => null,withSkip=true,closeDisable=false}) => {

  const fadeAnim = useRef(new Animated.Value(0)).current
  useEffect(() => {
    Animated.timing(
      fadeAnim,
      {
        toValue: 1,
        duration: 1000,
        useNativeDriver:true
      }
    ).start();
  }, [fadeAnim])
  
  return (
    <View style={{alignItems:'center',flexDirection:'row',justifyContent:'space-between',paddingBottom:13,paddingRight:16,paddingTop:7,backgroundColor:"#FFF"}}>
        {withBack && !closeDisable ? 
        <TouchableOpacity activeOpacity={1} onPress={() => goBack()} style={{paddingLeft:16,width:16 + common.getLengthByIPhone7(98)}}>
            <Image style={{width:11,height:18}} source={require('../../assets/icons/goBack.png')} />
        </TouchableOpacity> : <View style={{width:16 + common.getLengthByIPhone7(98)}} />}
        {title.length ? <Text style={styles.title}>{title}</Text> : null}
        <Animated.View style={{opacity:fadeAnim}}>
        <Btn title={'Пропустить'} backgroundColor={'#F5F5F5'} underlayColor={'#EEEEEE'} 
            onPress={() => skip()}
            customTextStyle={{fontSize:14,lineHeight:17,fontWeight:'500'}}
            customStyle={{width:common.getLengthByIPhone7(98),borderRadius:14,
              height:common.getLengthByIPhone7(28),opacity:withSkip && !closeDisable ? 1 : 0
            }} />
        </Animated.View>
    </View>
    )
}

const styles = StyleSheet.create({
  title:{
    color:Colors.textColor,
    fontSize:16,
    lineHeight:19,
    fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }),
    fontWeight:Platform.select({ ios: '800', android: 'bold' }),
  }
})

export default SkipHeader