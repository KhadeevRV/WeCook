import React, { useState,useEffect } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Platform, Dimensions,TouchableHighlight} from 'react-native'
import Colors from '../../constants/Colors'
import common from '../../../Utilites/Common'
import network from '../../../Utilites/Network'
import { observer } from 'mobx-react-lite'
import Modal from 'react-native-modal'
import Config from '../../constants/Config'
import { getBottomSpace } from 'react-native-iphone-x-helper'
// import { TouchableHighlight } from 'react-native-gesture-handler'


export const FilterModal = observer(({modal, closeModal,allFilters,currentFilters=[],applyFilters}) => {

    const [modalFilters, setModalFilters] = useState(currentFilters)

    const body = []

    for (let i = 0; i < allFilters.length; i++) {
        const str = allFilters[i].substring(0, allFilters[i].length - 1)
        const activeOrNot = modalFilters.findIndex((item) => item == str) != -1 ? true : false
        body.push(
            <TouchableHighlight activeOpacity={1} underlayColor={'#EAEAEA'} onPress={() => {
                if(activeOrNot){
                    const ind = modalFilters.findIndex(item => item == str)
                    const newArr = [...modalFilters.slice(0,ind),...modalFilters.slice(ind + 1)]
                    setModalFilters(newArr)
                }else{
                    const newArr = [...modalFilters,str]
                    setModalFilters(newArr)
                }}}>
                <View style={styles.item}>
                    <Text style={styles.itemTitle}>{allFilters[i]}</Text>
                    {activeOrNot ? 
                    <View style={{width:20,height:20,justifyContent:'center',alignItems:'center',backgroundColor:Colors.yellow,borderRadius:10}}>
                        <Image source={require('../../../assets/icons/complete.png')} style={{width:12,height:10}} />
                    </View> :
                    <View style={{width:20,height:20,borderRadius:10,borderWidth:1,borderColor:'#9A9A9A'}} /> }
                </View>
            </TouchableHighlight>
        ) 
    }

    useEffect(() => {
        if(currentFilters.length){
            setModalFilters(currentFilters)
        }else {
            let newArr = []
            for (let i = 0; i < allFilters.length; i++) {
                const str = allFilters[i].substring(0, allFilters[i].length - 1)
                newArr.push(str)
            }
            setModalFilters(newArr)
        }
    }, [modal])
 
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
                <Text style={styles.title}>Фильтр</Text>
                {body}
            <TouchableHighlight underlayColor={Colors.underLayYellow} activeOpacity={1} style={{...styles.btn}} 
                onPress={() => applyFilters(modalFilters)}>
                <Text style={styles.btnText}>Применить</Text> 
            </TouchableHighlight>
            {/* <SafeAreaView style={{backgroundColor:'#FFF'}} /> */}
            </View>
    </Modal>
  )
})

const styles = StyleSheet.create({
    title:{
        fontFamily:Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',
        fontSize:16,
        alignSelf:'center',
        lineHeight:19,
        marginBottom:21,
        color:Colors.textColor,
        fontWeight:'bold'
    },
    mainBlock:{
        backgroundColor:'#FFF',
        paddingBottom:8 + getBottomSpace(),
        paddingTop:22,
        borderTopStartRadius:24,
        borderTopEndRadius:24,
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
        height:50,width:Dimensions.get('window').width - 20,
        borderRadius:16,
        marginTop:25,
        justifyContent:'center',alignItems:'center',
        alignSelf:'center',backgroundColor:Colors.yellow
    },
    btnText:{
        fontFamily:Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Medium',fontSize:16,
        alignSelf:'center',
        lineHeight:19,
        color:Colors.textColor,
        fontWeight:'500'
    }
})