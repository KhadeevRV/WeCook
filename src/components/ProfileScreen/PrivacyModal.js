import React, { useState,useEffect } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Platform, Dimensions,ScrollView} from 'react-native'
import Colors from '../../constants/Colors'
import common from '../../../Utilites/Common'
import network from '../../../Utilites/Network'
import { observer } from 'mobx-react-lite'
import Modal from 'react-native-modal'
import Config from '../../constants/Config'
import { getStatusBarHeight } from 'react-native-iphone-x-helper'


export const PrivacyModal = observer(({modal, closeModal}) => {

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
                <Text style={styles.title}>Политика конфиденциальности</Text>
                <Text style={styles.commonText}>1. ОБЩИЕ ПОЛОЖЕНИЯ

1.1. Регистрация Пользователя на сайте означает согласие Пользователя на обработку персональных данных, а также согласие с настоящей Политикой конфиденциальности и условиями обработки персональных данных Пользователя. Оформление отдельного согласия на обработку персональных данных Пользователя не требуется.
1.2. В случае несогласия с условиями Политики конфиденциальности Пользователь должен прекратить использование сайта.
1.3. Настоящая Политика конфиденциальности применяется только к сайту - www.guam.ru. Администрация сайта не контролирует и не несет ответственность за сайты третьих лиц, на которые Пользователь может перейти по ссылкам, доступным на сайте.
1.4. Администрация сайта не проверяет достоверность персональных данных, предоставляемых Пользователем сайта.

2. ПРЕДМЕТ ПОЛИТИКИ КОНФИДЕНЦИАЛЬНОСТИ

2.1. Настоящая Политика конфиденциальности устанавливает обязательства Администрации сайта по неразглашению и обеспечению режима защиты конфиденциальности персональных данных, которые Пользователь предоставляет по запросу Администрации сайта при регистрации.
2.2. Персональные данные, разрешённые к обработке в рамках настоящей Политики конфиденциальности, предоставляются Пользователем путём заполнения формы на сайте в соответствующем разделе и включают в себя следующую информацию:
2.2.1. ФИО;
2.2.2. почтовый адрес;
2.2.3. номер телефона;
2.2.4. электронный адрес;
2.2.5. любые другие персональные данные, которые Вы нам сообщаете;
2.3. Администрация сайта осуществляет сбор статистики об IP-адресах и cookie своих посетителей. Данная информация используется с целью выявления и решения технических проблем. Указанные в настоящем пункте данные не передаются третьим лицам и используются только в целях указанных в настоящем пункте.
2.4. Любая иная персональная информация не оговоренная выше подлежит надежному хранению и нераспространению, за исключением случаев, предусмотренных в п.п. 5.2. и 5.3. настоящей Политики конфиденциальности.
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