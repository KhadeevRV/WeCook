import React, { useState,useEffect } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Platform, Dimensions,TouchableHighlight} from 'react-native'
import Colors from '../../constants/Colors'
import common from '../../../Utilites/Common'
import network from '../../../Utilites/Network'
import { observer } from 'mobx-react-lite'
import Modal from 'react-native-modal'
import Config from '../../constants/Config'
// import { TouchableHighlight } from 'react-native-gesture-handler'


export const ChangeWeeksModal = observer(({modal, closeModal,onPress,currentWeek = ''}) => {

    const body = []
    const weeks = [{name:'Текущая',id:1},{name:'Предыдущая',id:2}]

    for (let i = 0; i < weeks.length; i++) {
        body.push(
            <TouchableHighlight activeOpacity={1} underlayColor={'#EAEAEA'} onPress={() => onPress(weeks[i]?.name)} key={weeks[i].id}>
                <View style={styles.item}>
                    <Text style={styles.itemTitle}>{weeks[i]?.name}</Text>
                    {weeks[i]?.name == currentWeek ? 
                        <Image source={require('../../../assets/icons/bigComplete.png')} style={{width:14,height:14}} /> : null}
                </View>
            </TouchableHighlight>
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
                <Text style={styles.title}>Неделя</Text>
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
        flexDirection:'row',
        justifyContent:'space-between',
        paddingHorizontal:16,
        height:49,
        alignItems:'center'
    },
    itemTitle:{
        fontFamily:Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',fontSize:17,
        alignSelf:'center',
        lineHeight:20,
        color:Colors.textColor,
        fontWeight:'500'
    },
    btn:{
        height:47,width:Dimensions.get('window').width - 20,
        borderRadius:10,
        marginTop:common.getLengthByIPhone7(39),
        justifyContent:'center',alignItems:'center',
        alignSelf:'center',backgroundColor:Colors.yellow
    },
    btnText:{
        fontFamily:Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',fontSize:16,
        alignSelf:'center',
        lineHeight:19,
        color:Colors.textColor,
        fontWeight:'500'
    }
})