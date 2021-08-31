import React,{useState} from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform,} from 'react-native'
import Colors from '../../constants/Colors'
import { TouchableHighlight } from 'react-native-gesture-handler'
import common from '../../../Utilites/Common'
import DropShadow from 'react-native-drop-shadow'
import LinearGradient from 'react-native-linear-gradient'

const ProfileItem = ({title='',subtitle='',icon=null,onPress=() => null,height=50}) => {

  return (
      <TouchableHighlight onPress={() => onPress()} underlayColor={null} style={{paddingHorizontal:16}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',height}}>
                <View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    {icon ? <Image source={icon.source} style={{marginRight:13,...icon.style}} /> : null}
                    <Text style={styles.title}>{title}</Text>
                </View>
                {subtitle.length ? 
                    <Text style={styles.subtitle}>{subtitle}</Text> : null
                }
                </View>
                <Image style={{width:8,height:13,transform:[{rotate:'180deg'}]}} source={require('../../../assets/icons/goBack.png')} />
          </View>   
      </TouchableHighlight>
    )
}

const styles = StyleSheet.create({
    container:{
        borderRadius:16,borderWidth:4,borderColor:Colors.underLayYellow,
        padding:16,alignItems:'center'
    },
    title:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay' }),
        fontSize:16,lineHeight:19,
        color:Colors.textColor,
        fontWeight:'500',
    },
    subtitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Medium' }),
        fontSize:14,lineHeight:17,
        fontWeight:'500',
        color:Colors.grayColor,
    },
})

export default ProfileItem