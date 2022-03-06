import React, { useState,useEffect } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Platform, Dimensions,ScrollView} from 'react-native'
import Colors from '../../constants/Colors'
import common from '../../../Utilites/Common'
import network from '../../../Utilites/Network'
import { observer } from 'mobx-react-lite'
import Modal from 'react-native-modal'
import Config from '../../constants/Config'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'
import { agreementText, privacyText,userAgreementText } from '../../constants/Texts'


export const PrivacyModal = observer(({modal, closeModal,mode}) => {

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
        style={{margin: 0,justifyContent: 'flex-end',marginTop:getStatusBarHeight()}}
        >   
            <TouchableOpacity style={styles.btnView} activeOpacity={1}
                    onPress={() => closeModal()}>
                <Image style={{width:10,height:10}} source={require('../../../assets/icons/closeModal.png')} />
            </TouchableOpacity>
            <ScrollView style={styles.mainBlock} contentContainerStyle={{paddingHorizontal:16,paddingBottom:120}}
            showsVerticalScrollIndicator={false}>
                <TouchableOpacity activeOpacity={1}>
                <Text style={styles.title}>
                    {mode == 'privacy' ? 'Политика конфиденциальности' :
                     mode == 'agreement' ? 'Пользовательское соглашение':
                     'LICENSED APPLICATION END USER LICENSE AGREEMENT'}</Text>
                <Text style={styles.commonText}>
                    {mode == 'privacy' ? privacyText : 
                     mode == 'agreement' ? agreementText:
                     userAgreementText
                     }
                </Text>
</TouchableOpacity>
            </ScrollView>
    </Modal>
  )
})

const styles = StyleSheet.create({
    title:{
        fontFamily:Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',fontSize:22,
        fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        lineHeight:26,
        marginBottom:10,
        color:Colors.textColor,
        fontWeight:'bold'
    },
    mainBlock:{
        backgroundColor:'#FFF',
        paddingTop:common.getLengthByIPhone7(41),
        borderTopStartRadius:common.getLengthByIPhone7(24),
        borderTopEndRadius:common.getLengthByIPhone7(24),
    },
    commonText:{
        fontFamily:Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Medium',fontSize:14,
        fontWeight:'500',
        lineHeight:17,
        color:Colors.textColor,
    },
    btnView:{
        width:36,height:36,
        backgroundColor:'#FFF',
        borderRadius:18,
        position:'absolute',right:10,top:12,zIndex:100,
        justifyContent:'center',alignItems:'center'
    }
})