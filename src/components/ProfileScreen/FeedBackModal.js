import React, { useState,useEffect } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Platform, Dimensions,TouchableHighlight} from 'react-native'
import Colors from '../../constants/Colors'
import common from '../../../Utilites/Common'
import network from '../../../Utilites/Network'
import { observer } from 'mobx-react-lite'
import Modal from 'react-native-modal'
import Config from '../../constants/Config'
import { keys } from 'mobx'
import DropShadow from 'react-native-drop-shadow'

const FeedBackItem = ({icon,title,subtitle,onPress,}) => {
    return (
        <View style={{
                shadowColor: "#000",
                shadowOffset: {
                    width: 0,
                    height: 4,
                },
                shadowOpacity: 0.08,
                shadowRadius: 20,marginTop:16
            }}
        >
        <TouchableOpacity activeOpacity={1} onPress={onPress}
            style={styles.item}
        >
            <View style={{flexDirection:'row',alignItems:'center'}}>
                <View style={{marginRight:16,width:48,height:48,justifyContent:'center',alignItems:'center',borderRadius:16,backgroundColor:'#F5F5F5'}}>
                    <Image source={icon.source} style={icon.style} />
                </View>
                <View>
                    <Text style={styles.itemTitle}>{title}</Text>
                    <Text style={styles.itemSubtitle}>{subtitle}</Text>
                </View>
            </View>
            <Image style={{width:8,height:13,transform:[{rotate:'180deg'}]}} source={require('../../../assets/icons/goBack.png')} />
        </TouchableOpacity>
        </View>
    )
}

export const FeedBackModal = observer(({modal, closeModal}) => {

    const body = []
    const socials = [
        {title:'Telegram',
            subtitle:"10 894 участников",
            id:1,
            onPress: () => console.warn('Telegram'),
            icon:{
            source:require('../../../assets/icons/telegram.png'),
            style:{width:36,height:36,}
            }
        },
        {title:'WhatsApp',
            subtitle:"Персональная консультация",
            id:2,
            onPress: () => console.warn('WhatsApp'),
            icon:{
                source:require('../../../assets/icons/whatsApp.png'),
                style:{width:39,height:39,}
            }
        }]

    for (let i = 0; i < socials.length; i++) {
        item = socials[i]
        body.push(
            <FeedBackItem icon={item.icon} title={item.title} subtitle={item.subtitle} onPress={item.onPress} key={item.id} />
        ) 
    }
 
  return (
    <Modal
        animationIn='slideInUp'
        animationOut='slideOutDown'
        isVisible={modal}
        onRequestClose={() => closeModal()}
        onBackdropPress={() => closeModal()}
        swipeDirection={['down']}
        onSwipeComplete={() => closeModal()} propagateSwipe={true}
        backdropOpacity={0.4}
        style={{margin: 0,justifyContent: 'flex-end'}}
        >   
            <View style={styles.mainBlock}>
                <Text style={styles.title}>Связаться с нами</Text>
                {body}
            </View>
    </Modal>
  )
})

const styles = StyleSheet.create({
    title:{
        fontFamily:Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',fontSize:16,
        alignSelf:'center',
        lineHeight:19,
        marginBottom:common.getLengthByIPhone7(22),
        color:Colors.textColor,
        fontWeight:'bold'
    },
    mainBlock:{
        backgroundColor:'#FFF',
        paddingBottom:common.getLengthByIPhone7(64),
        paddingTop:common.getLengthByIPhone7(22),
        borderTopStartRadius:common.getLengthByIPhone7(24),
        borderTopEndRadius:common.getLengthByIPhone7(24),
    },
    item:{
        paddingHorizontal:16,
        backgroundColor:'#FFF',
        marginHorizontal:16,borderRadius:24,paddingVertical:7,flexDirection:'row',justifyContent:'space-between',alignItems:'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,elevation:10
    },
    itemTitle:{
        fontFamily:Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',fontSize:16,
        lineHeight:19,
        color:Colors.textColor,
        fontWeight:'500'
    },
    itemSubtitle:{
        fontFamily:Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',fontSize:12,
        lineHeight:14,
        color:Colors.grayColor,
        fontWeight:'500'
    },
})