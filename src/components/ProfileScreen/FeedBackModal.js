import React, { useState,useEffect } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Platform, Dimensions,TouchableHighlight, Alert, ActivityIndicator, Linking} from 'react-native'
import Colors from '../../constants/Colors'
import common from '../../../Utilites/Common'
import network, { getSocials } from '../../../Utilites/Network'
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
                shadowOpacity: 0.06,
                shadowRadius: 4,marginTop:20
            }}
        >
        <TouchableOpacity activeOpacity={1} onPress={onPress}
            style={styles.item}
        >
            <View style={{flexDirection:'row',alignItems:'center'}}>
                <View style={{marginRight:16,width:48,height:48,justifyContent:'center',alignItems:'center',borderRadius:10,backgroundColor:'#F5F5F5'}}>
                    <Image source={{uri : icon}} style={{width:36,height:36,}} />
                </View>
                <View>
                    <Text style={styles.itemTitle}>{title}</Text>
                    <Text style={styles.itemSubtitle}>{subtitle}</Text>
                </View>
            </View>
            <Image source={require('../../../assets/icons/goDown.png')} 
                style={{width:13,height:8,transform:[{rotate:'-90deg'}]}}
            />
        </TouchableOpacity>
        </View>
    )
}

export const FeedBackModal = observer(({modal, closeModal}) => {

    const body = []
    const [socials, setSocials] = useState([])
    const [loading, setLoading] = useState(false)

    for (let i = 0; i < socials.length; i++) {
        let item = socials[i]
        body.push(
            <FeedBackItem icon={item.icon} title={item.name} subtitle={item.description} onPress={() => Linking.openURL(item.link)} key={item.id} />
        ) 
    }

    const initLoad = async () => {
        setLoading(true)
        try {
            const data = await getSocials()
            setSocials(data)
            setLoading(false)
        } catch (err) {
            setLoading(false)
            Alert.alert('Ошибка',err)
        }
    }

    useEffect(() => {
        if(modal && socials.length == 0){
            initLoad()
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
                <Text style={styles.title}>Связаться с нами</Text>
                {loading ? <ActivityIndicator size={'large'} color={Colors.yellow} /> : 
                    <>
                    {body}
                    </>
                }
            </View>
    </Modal>
  )
})

const styles = StyleSheet.create({
    title:{
        fontFamily:Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',fontSize:16,
        alignSelf:'center',
        lineHeight:19,
        marginBottom:18,
        color:Colors.textColor,
        fontWeight:Platform.select({ ios: '800', android: 'bold' }),
    },
    mainBlock:{
        backgroundColor:'#FFF',
        paddingBottom:common.getLengthByIPhone7(64),
        paddingTop:22,
        borderTopStartRadius:common.getLengthByIPhone7(24),
        borderTopEndRadius:common.getLengthByIPhone7(24),
    },
    item:{
        paddingHorizontal:8,
        backgroundColor:'#FFF',
        marginHorizontal:16,borderRadius:16,
        paddingVertical:8,flexDirection:'row',justifyContent:'space-between',alignItems:'center',
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
        color:Colors.textColor,marginBottom:3,
        fontWeight:'500'
    },
    itemSubtitle:{
        fontFamily:Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Medium',fontSize:12,
        lineHeight:14,
        color:Colors.grayColor,
        fontWeight:'500'
    },
})