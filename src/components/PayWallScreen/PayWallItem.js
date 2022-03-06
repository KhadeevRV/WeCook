import React,{useState} from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform,} from 'react-native'
import Colors from '../../constants/Colors'
import { TouchableHighlight } from 'react-native-gesture-handler'
import common from '../../../Utilites/Common'
import DropShadow from 'react-native-drop-shadow'
import LinearGradient from 'react-native-linear-gradient'

const PayWallItem = ({plan,onPress=() => null,pressed}) => {

    const [linewidth, setlinewidth] = useState(0)

  return (
    <View style={{
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 20,marginBottom:16,
    }}>
    <View style={styles.card}>
        <TouchableHighlight style={{...styles.container,backgroundColor:pressed ? Colors.underLayYellow : "#FFF"}} 
            underlayColor={Colors.underLayYellow} onPress={() => onPress()}
            >
            <>
            <Text style={styles.title}>{plan?.name}</Text>
            <View style={{flexDirection:'row'}}>
            {plan?.sale ? 
            <>
                <View
                style={{
                    position: 'absolute',
                    transform: [ {rotate: '-15deg'} ],
                    top: 7,
                    left:-3,
                    width:linewidth,
                    height: 1,
                    borderBottomColor: '#A157FF',
                    borderBottomWidth: 1,
                    borderRadius:Platform.OS == 'android' ? 0 : 1
                }}/>
                <Text style={styles.desc} onLayout={(e) => setlinewidth(5 + e.nativeEvent.layout.width)}>{plan?.old_price}</Text>
                </> : null}
                <Text style={styles.desc}> {plan?.desc}</Text>
            </View>
            {plan?.hit ? 
                <LinearGradient style={styles.hitView} colors={['rgba(65,198,255, 1)', `rgba(41,255,165,1)`]} 
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 1 }}>
                    <Text style={styles.hitText}>Популярно</Text>
                </LinearGradient> 
            : null}
            {plan?.sale ? 
                <View style={styles.saleView}>
                    <Text style={styles.hitText}>{plan?.sale}</Text>
                </View> 
            : null}
            </>
        </TouchableHighlight>
    </View>
    </View>
    )
}

const styles = StyleSheet.create({
    container:{
        borderRadius:16,borderWidth:4,borderColor:Colors.underLayYellow,
        padding:8,alignItems:'center'
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
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay' }),
        fontSize:16,lineHeight:19,
        color:Colors.textColor,
        fontWeight:Platform.select({ ios: '800', android: 'bold' }),
    },
    desc:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Medium' }),
        fontSize:12,lineHeight:14,
        fontWeight:'500',
        color:Colors.textColor,
    },
    hitView:{
        position:'absolute',top:8,right:8,paddingHorizontal:7,paddingVertical:2,
        borderRadius:8,alignItems:'center',justifyContent:'center'
    },
    hitText:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay' }),
        fontSize:10,lineHeight:12,
        color:'#FFF',
    },
    saleView:{
        paddingVertical:4,paddingHorizontal:2,position:'absolute',top:8,left:8,
        borderRadius:10,backgroundColor:'#A157FF'
    }
})

export default PayWallItem