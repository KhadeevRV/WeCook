import React,{useState} from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform,} from 'react-native'
import Colors from '../../constants/Colors'
import { TouchableHighlight } from 'react-native-gesture-handler'
import common from '../../../Utilites/Common'

const QuizItem = ({title='',icons=[],onPress=() => null,persons=false}) => {

    const iconsView = [] 
    for (let i = 0; i < icons.length; i++) {
        if(persons){
            iconsView.push(
                <Image source={require('../../../assets/icons/onePerson.png')} 
                    style={{width:8,height:15,tintColor:Colors.textColor}}
                />
            )
        } else {
            iconsView.push(
                <Image source={{uri:icons[i]}} 
                    style={{width:20,height:20,tintColor:Colors.textColor,marginRight:i + 1 === icons.length ? 0 : 4}}
                />
            )
        }
    }
  
  return (
    <View style={{
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 20,marginBottom:16,
    }} >
    <View style={styles.card} onLayout={e => console.warn(e.nativeEvent.layout.height)}>
        <TouchableHighlight style={styles.container} underlayColor={Colors.underLayYellow} onPress={() => onPress()}>
            <>
            <View style={{flexDirection:'row',alignItems:'center',marginBottom:8}}>
                {iconsView}
            </View>
            <Text style={styles.title}>
                {title}
            </Text>
            </>
        </TouchableHighlight>
    </View>
    </View>
    )
}

const styles = StyleSheet.create({
    container:{
        borderRadius:16,borderWidth:4,borderColor:Colors.underLayYellow,
        padding:13,alignItems:'center',paddingBottom:12,
    },
    card:{
        padding:8,width:'100%',backgroundColor:'#FFF',borderRadius:24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,elevation:10
    },
    title:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }),
        fontSize:16,lineHeight:19,
        fontWeight:'500',
        color:Colors.textColor,

    }
})

export default QuizItem