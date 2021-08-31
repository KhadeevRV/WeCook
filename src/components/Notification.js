import React, { useState,useEffect, useRef } from 'react';
import {StyleSheet, Image, TextInput,View, TouchableOpacity,Text, SafeAreaView, KeyboardAvoidingView,ScrollView, Dimensions, Alert, Modal, Platform } from 'react-native'
import Colors from '../constants/Colors';
import common from '../../Utilites/Common';
import Config from '../constants/Config';
import FlashMessage,{ showMessage, hideMessage } from "react-native-flash-message"
import { getStatusBarHeight } from 'react-native-iphone-x-helper';


export const Notification = ({notif=null}) => {

    const renderFlashMessageIcon = (icon = 'success', style = {}, customProps = {}) => {
      if(icon == 'info'){
        return <Image style={{width:22,height:22,marginRight:10}} source={require('../../assets/icons/notification.png')}/>
      }
      // console.warn(icon,style,customProps)
    }

    return (
      <>
        <FlashMessage position='top' 
        style={{
          paddingTop:0,
          width:Dimensions.get('window').width - 16,borderRadius:10,alignSelf:'center',
        }}
        ref={notif}
        renderFlashMessageIcon={renderFlashMessageIcon} 
        titleStyle={{fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:15,lineHeight:24,}}/>
      </>
    )
}

const styles = StyleSheet.create({
})