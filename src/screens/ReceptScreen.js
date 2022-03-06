import React, { Component, useRef, useState, useCallback, useEffect } from 'react'
import { StyleSheet, Text, View,TouchableOpacity, Dimensions,Image, TouchableHighlight, Platform,SafeAreaView, BackHandler, StatusBar, ImageBackground, Alert} from 'react-native'
import { observer,Observer, useObserver } from 'mobx-react-lite'
import BottomSheet from 'reanimated-bottom-sheet'
import { getStatusBarHeight, isIphoneX, getBottomSpace } from 'react-native-iphone-x-helper'
import common from '../../Utilites/Common'
import BottomSheetBehavior from 'reanimated-bottom-sheet'
import Colors from '../constants/Colors'
import DropShadow from 'react-native-drop-shadow'
import Animated from 'react-native-reanimated'
import LinearGradient from 'react-native-linear-gradient'
import Share from 'react-native-share';
import { BlurView } from '@react-native-community/blur'
import { Notification } from '../components/Notification'
import { showMessage } from 'react-native-flash-message'
import { TouchableWithoutFeedback, ScrollView } from 'react-native-gesture-handler'
import { GestureHandlerRefContext } from '@react-navigation/stack';
import { useScrollToTop } from '@react-navigation/native'
import FastImage from 'react-native-fast-image'
import KeepAwake from 'react-native-keep-awake';
import network, { getShortLink } from '../../Utilites/Network'
import { runInAction } from 'mobx'
import { AppEventsLogger } from "react-native-fbsdk-next";
import Modal from 'react-native-modal'
import { Modalize } from 'react-native-modalize';

const Step = ({step,count}) => {
    const subtitleView = []
    for (let i = 0; i < step?.ingredients_used.length; i++) {
        const ingr = step?.ingredients_used[i]
        subtitleView.push(
        <Text style={styles.stepSubtitle}>
            {ingr?.name + ' '}
            {count * parseFloat(ingr.count) == 0 ? ingr.unit : ingr?.piece ? Math.ceil(count * ingr?.count) + ' ' + ingr?.unit + `(~${Math.ceil(count * ingr?.count/ingr?.piece)} ${ingr?.piece_unit})`:
            Math.ceil(count * parseFloat(ingr.count))+' ' + ingr.unit}
            {i + 1 == step?.ingredients_used.length ? null : ', '}
        </Text>)
    }
    return(
    <View>
        {step?.images?.big_webp ? 
        <>
        {Platform.OS == 'ios' ? 
        <FastImage style={{width:'100%',height:common.getLengthByIPhone7(232),borderRadius:16}}
        source={{uri:step?.images?.big_webp}} borderRadius={16}
        /> :
        <Image style={{width:'100%',height:common.getLengthByIPhone7(232),borderRadius:16}}
            source={{uri:step?.images?.big_webp}} borderRadius={16} resizeMethod='resize'
        />}
        </> : null}
        <View style={{padding:16,backgroundColor:'#F5F5F5',borderRadius:16,
            top:step?.images?.big_webp ? -33 : 0,
            marginTop:step?.images?.big_webp ? 0 : 48
        }}>
            <View style={{width:30,height:30,backgroundColor:'#EEEEEE',position:'absolute',borderRadius:15,zIndex:100,left:common.getLengthByIPhone7(0)/2 - 30,
                alignItems:'center',justifyContent:'center',top:-15}}>
                <Text style={styles.subtitle}>{step?.step}</Text>
            </View>
            <Text style={styles.stepTitle}>{step?.text}</Text>
            <View style={{flexDirection:'row'}}>
                {subtitleView}
            </View>
        </View>
    </View>
    )
}

const Ingredient = ({ingredient,count}) => {

    return(
    <View style={{marginTop:8,maxWidth:common.getLengthByIPhone7(80)}}>
        <Image style={{width:common.getLengthByIPhone7(80),height:80,marginBottom:5}}
            source={{uri:ingredient?.images?.small_webp}} borderRadius={16} resizeMethod='resize'
        />
        <Text style={styles.ingredientTitle}>{ingredient?.name}</Text>
        {(count * parseFloat(ingredient.count)) == 0 ? 
            <Text style={{...styles.infoText,marginTop:3,textAlign:'center'}}>
              {ingredient.unit}
            </Text>:
            <>
            {ingredient?.piece ? 
            <Text style={{...styles.infoText,marginTop:3,textAlign:'center'}}>
              {Math.ceil(count * ingredient?.count)} {ingredient?.unit} (~{Math.ceil(count * ingredient?.count/ingredient?.piece)} {ingredient?.piece_unit})
            </Text> :
            <Text style={{...styles.infoText,marginTop:3,textAlign:'center'}}>
                {Math.ceil(count * parseFloat(ingredient.count))+' '}{ingredient.unit}
            </Text>}
        </>}
    </View>
    )
}

function useInterval(callback, delay) {
    const savedCallback = useRef();
  
    // Remember the latest callback.
    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);
  
    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        let id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
}


const ReceptScreen = observer(({navigation,route}) => {

    const currentRec = route.params.rec
    const fromHistory = route.params?.fromHistory
    const fromDays = route.params?.fromDays
    const screenHeight = Dimensions.get('window').height
    const steps = []
    const ingredients = []
    const [persons, setPersons] = useState(currentRec?.persons ?? network.user?.persons)
    const notif = useRef(null)
    const isInList = network.listDishes.length ? !!network.listDishes.filter((item) => item.id == currentRec.id).length : false
    const isInFavor = network.favorDishes.length ? !!network.favorDishes.filter((item) => item.id == currentRec.id).length : false
    const [time, setTime] = useState(0)

    const [modal, setmodal] = useState(true)
    const modalizeRef = useRef(null);
    
    for (let i = 0; i < currentRec?.steps?.length; i++) {
        steps.push(<Step step={currentRec?.steps[i]} key={currentRec?.steps[i].id} count={persons} />)
    }

    for (let i = 0; i < currentRec?.ingredients?.length; i++) {
        ingredients.push(<Ingredient ingredient={currentRec?.ingredients[i]} count={persons} key={currentRec?.ingredients[i].id} />)
        if(i + 1 == currentRec?.ingredients?.length && (i + 1) % 4 != 0){
            const remains = 4 - ((i + 1) % 4)
            for (let i = 0; i < remains; i++) {
                ingredients.push(<View style={{width:common.getLengthByIPhone7(75)}} key={`remains${i}`} />)
            }
        }
    }

    const onShare = async () => {
        try {
            const shortUrl = await getShortLink(currentRec.share_link)
            Share.open({
                message:`Посмотри, какой удачный рецепт я нашла в приложении WeCook${'\n'}${shortUrl}`
              },{
                tintColor:Colors.greenColor
            });
        } catch (err) {
            Alert.alert('Ошибка',err)
        }
    };

    const changeRecPersons = (newPersons) => {
        setPersons(newPersons)
        if(!fromHistory || network.listDishes.find(dish => dish.id == currentRec.id)){
            console.warn('object')
            setTime(new Date())
        }
    }

    const delay = 500
    useInterval(() => {
        if(time != 0){
            const date = new Date() 
            if(date - time > 1000){
                runInAction(() => network.changePersons(currentRec.id,persons))
                setTime(0)
            }
        }
    }, delay);

    const content = [
            <>
            <View 
                style={{
                    width:'100%', height:common.getLengthByIPhone7(520),
                    justifyContent:'flex-end',borderTopRightRadius:24,borderTopLeftRadius:24,
                    zIndex:100,
                }}
                borderTopLeftRadius={24} borderTopRightRadius={24}>
                    <LinearGradient colors={['rgba(0, 0, 0, 0)', `rgba(0, 0, 0, .3)`]} >
                    <View style={{paddingTop:common.getLengthByIPhone7(101),paddingBottom:10,paddingHorizontal:16}}>
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            <Image style={{width:18,height:18,marginRight:6}} source={require('../../assets/icons/star.png')}/>
                            <Text style={{...styles.imageSubtitle,marginRight:16}}>{currentRec?.eating}</Text>
                            <Image style={{width:17,height:17,marginRight:4}} source={require('../../assets/icons/clock.png')}/>
                            <Text style={{...styles.imageSubtitle,marginRight:14}}>{currentRec?.cook_time} м.</Text>
                            {currentRec?.labels?.keto ? 
                            <>
                            <Image style={{width:16,height:18,marginRight:5}} source={require('../../assets/icons/keto.png')} />
                            <Text style={{...styles.imageSubtitle,color:'#D7FF95'}}>Кето</Text>
                            </>
                            :
                            currentRec?.labels?.vegan ?
                            <>
                            <Image style={{width:17,height:17,marginRight:5}} source={require('../../assets/icons/vegan.png')} />
                            <Text style={{...styles.imageSubtitle,color:Colors.greenColor}}>Вегетарианское</Text>
                            </>
                            :
                            currentRec?.labels?.lowcarb ?
                            <>
                            <Image style={{width:16,height:16,marginRight:5}} source={require('../../assets/icons/lowcal.png')} />
                            <Text style={{...styles.imageSubtitle,color:'#FFF495'}}>Безуглеводное</Text>
                            </> : null}
                        </View>
                    </View>
                    </LinearGradient>
                    {/* {Platform.OS == 'ios' ?  */}
                    <FastImage style={{width:'100%', height:common.getLengthByIPhone7(520),justifyContent:'flex-end',borderTopRightRadius:24,borderTopLeftRadius:24,
                        position:'absolute',zIndex:-1}} 
                        source={{uri:currentRec?.images?.big_webp,}} key={currentRec?.images?.big_webp} 
                        borderTopLeftRadius={24} borderTopRightRadius={24}
                    /> 
                    {/* :
                    <Image style={{width:'100%', height:common.getLengthByIPhone7(520),justifyContent:'flex-end',borderTopRightRadius:24,borderTopLeftRadius:24,
                        position:'absolute',zIndex:-1}} 
                        source={{uri:currentRec?.images?.big_webp,}} key={currentRec?.images?.big_webp} 
                        borderTopLeftRadius={24} borderTopRightRadius={24}
                    />
                    } */}
                </View>
                
            {/* <TouchableOpacity style={{height:60,backgroundColor:'pink'}} 
            onPress={() => {
                notif.current.showMessage({
                    message: "Simple message",
                    icon:'info'
                });
            }}>
            </TouchableOpacity> */}
            <View style={{paddingHorizontal:16,backgroundColor:'#FFF',paddingTop:28.5}}>
                <Text style={styles.title}>{currentRec?.name}</Text>
                <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-around',marginBottom:common.getLengthByIPhone7(28)}}>
                    <TouchableOpacity style={{flexDirection:'row',alignItems:'center'}} activeOpacity={1}
                        onPress={() => isInFavor ? network.deleteFromFavor(currentRec) : network.addToFavor(currentRec,navigation)}
                    >
                        <Image style={{width:20,height:19,marginRight:15}} source={isInFavor ? require('../../assets/icons/redHeart.png') : require('../../assets/icons/heart.png')} />
                        <Text style={styles.subText}>{isInFavor ? 'В любимом' : 'В любимое'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onShare()} style={{flexDirection:'row',alignItems:'center'}} activeOpacity={1}>
                        <Image style={{width:18,height:20,marginRight:12}} source={require('../../assets/icons/share.png')} />
                        <Text style={styles.subText}>Поделиться</Text>
                    </TouchableOpacity>
                </View>
                <View style={{backgroundColor:'#F5F5F5',borderRadius:16,flexDirection:'row',marginBottom:19,paddingTop:12,paddingBottom:13,
                    width:'100%',}}>
                    <View style={{alignItems:'center',width:(common.getLengthByIPhone7() - 32)/4,borderRightWidth:0.5,borderColor:'#EAEAEA'}}>
                        <Text style={styles.bjuTitle}>ККАЛ</Text>
                        <Text style={styles.bjuValue}>{currentRec?.calories}</Text>
                    </View>
                    {/* <View style={{width:0.5,height:'100%',backgroundColor:'#EAEAEA'}} /> */}
                    <View style={{alignItems:'center',width:(common.getLengthByIPhone7() - 32)/4,borderRightWidth:0.5,borderColor:'#EAEAEA'}}>
                        <Text style={styles.bjuTitle}>БЕЛКИ</Text>
                        <Text style={styles.bjuValue}>{currentRec?.protein} г</Text>
                    </View>
                    {/* <View style={{width:0.5,height:'100%',backgroundColor:'#EAEAEA'}} /> */}
                    <View style={{alignItems:'center',width:(common.getLengthByIPhone7() - 32)/4,borderRightWidth:0.5,borderColor:'#EAEAEA'}}>
                        <Text style={styles.bjuTitle}>ЖИРЫ</Text>
                        <Text style={styles.bjuValue}>{currentRec?.fats} г</Text>
                    </View>
                    {/* <View style={{width:0.5,height:'100%',backgroundColor:'#EAEAEA'}} /> */}
                    <View style={{alignItems:'center',width:(common.getLengthByIPhone7() - 32)/4}}>
                        <Text style={styles.bjuTitle}>УГЛЕВОДЫ</Text>
                        <Text style={styles.bjuValue}>{currentRec?.carbohydrates} г</Text>
                    </View>
                </View>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Image style={{width:11,height:11,marginRight:5}} source={require('../../assets/icons/info.png')} />
                    <Text style={styles.infoText}>Ценность на 100 г. </Text>
                </View>
                <Text style={{...styles.subtitle,marginTop:35,marginBottom:17}}>
                    Количество персон
                </Text>
                <View style={{
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 4,
                    },
                    shadowOpacity: 0.06,
                    shadowRadius: 4,
                }}>
                <View style={styles.personsBar}>
                    <TouchableHighlight onPress={() => persons > 1 ? changeRecPersons(persons - 1) : null}
                    style={{padding:common.getLengthByIPhone7(16),borderRadius:17,
                            backgroundColor:'#F5F5F5',alignItems:'center',justifyContent:'center'}} underlayColor={'#EEEEEE'}>
                        <View style={{width:16,height:2,backgroundColor:Colors.textColor,borderRadius:1}} />
                    </TouchableHighlight>
                    <Text style={styles.personText}>{persons}</Text>
                    <TouchableHighlight onPress={() => persons < 9 ? changeRecPersons(persons + 1) : null}
                        style={{padding:common.getLengthByIPhone7(16),borderRadius:17,
                            backgroundColor:'#F5F5F5',alignItems:'center',justifyContent:'center'}} underlayColor={'#EEEEEE'}>
                        <>
                        <View style={{width:16,height:2,backgroundColor:Colors.textColor,borderRadius:1}} />
                        <View style={{width:16,height:2,backgroundColor:Colors.textColor,borderRadius:1,transform:[{rotate:'90deg'}],position:'absolute'}} />
                        </>
                    </TouchableHighlight>
                </View>
                </View>
                <Text style={{...styles.subtitle,marginTop:35,marginBottom:4}}>
                    Ингредиенты
                </Text>
                <View style={{backgroundColor:'#FFF',flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'}}>
                {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingHorizontal:16}}> */}
                    {ingredients}

                {/* </ScrollView> */}
                </View>
                    <Text style={{...styles.subtitle,marginTop:35,marginBottom:12}}>
                        Этапы
                    </Text>
                    {steps}
                    <Text style={{...styles.title,marginTop:49,alignSelf:'center',marginBottom:200}}>
                        Приятного аппетита!
                    </Text>
                </View>
            </>
    ]

    const onScroll = ({ nativeEvent }) => {
        if(nativeEvent.contentOffset.y < 40 && !route.params.gestureEnable){
            navigation.setParams({gestureEnable:true})
        } else {
            navigation.setParams({gestureEnable:false})
        }
    }

    useEffect(() => {
        const onFocus = navigation.addListener('focus', () => {
        modalizeRef.current?.open();
        if(Platform.OS == 'android'){
                fromDays ? StatusBar.setBackgroundColor('transparent', true) : StatusBar.setBackgroundColor('rgba(0,0,0,.4)', true)
                StatusBar.setBarStyle('light-content', true)
                fromDays ? StatusBar.setTranslucent(true) : null
            }
        });
        return onFocus;
    }, [navigation]);

    useEffect(() => {
        const onBlur = navigation.addListener('blur', () => {
            runInAction(() => network.rateApp('recept'))
            if(Platform.OS == 'ios'){
                StatusBar.setBarStyle('dark-content', true);
            } else {
                StatusBar.setBackgroundColor('#FFF', true);
                StatusBar.setBarStyle('dark-content', true);
                StatusBar.setTranslucent(false)
            }
        });
        return onBlur;
    }, [navigation]);

    const renderClose = () => {
        return (
            <TouchableHighlight style={{width:36,height:36,borderRadius:18,position:'absolute',
                top: 10 ,
                padding:11,right:10,zIndex:10000,
                justifyContent:'center',alignItems:'center',backgroundColor:Platform.select({ ios: null, android: '#E5E5E5' }),
                overflow:'hidden',}} onPress={() => modalizeRef.current.close()} underlayColor={null}>
                <>
                {Platform.OS == 'ios' ?
                <BlurView 
                    style={{
                    position: "absolute",
                    top: 0,left: 0,bottom: 0,right: 0,
                    borderRadius:17
                    }}
                    blurType="xlight"
                    blurAmount={24}
                    blurRadius={24}
                    reducedTransparencyFallbackColor={'#FFF'}
                /> : null}
                <Image source={require('../../assets/icons/closeModal.png')} style={{width:10,height:10,tintColor:Colors.textColor}} />
                </>
            </TouchableHighlight>
        )
    }

    const renderList = () => {
        if(isInList){
            return(
                <TouchableHighlight style={{width:56,height:56,borderRadius:28,position:'absolute',
                    bottom: getBottomSpace() +  37,right:10,zIndex:10000,overflow:'hidden',
                    justifyContent:'center',alignItems:'center',
                    backgroundColor:Colors.yellow}} onPress={() => network.deleteFromList(currentRec)} underlayColor={Colors.underLayYellow}>
                    <Image source={require('../../assets/icons/complete.png')} style={{width:18,height:14}} />
                </TouchableHighlight>
            )
        }
        return(
            <TouchableHighlight style={{height:56,borderRadius:28,position:'absolute',paddingHorizontal:22,
                bottom: getBottomSpace() +  37,right:10,zIndex:10000,overflow:'hidden',
                justifyContent:'center',alignItems:'center',
                backgroundColor:Colors.yellow}} onPress={() => network.addToList(currentRec)} underlayColor={Colors.underLayYellow}>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <Image source={require('../../assets/icons/list.png')} style={{width:18,height:23,marginRight:12}} />
                    <Text style={styles.subText}>В список</Text>
                </View>
            </TouchableHighlight>
        )
    }

    return (
        <>
        <Modalize ref={modalizeRef}
            handleStyle={{display:'none'}}
            overlayStyle={{}}
            onClosed={() => navigation.goBack()}
            modalHeight={Dimensions.get('window').height - Platform.select({ios:20 + getStatusBarHeight(), android: 0})}
            withOverlay={false}
            modalStyle={{borderTopLeftRadius:24,borderTopRightRadius:24,}}
            scrollViewProps={{showsVerticalScrollIndicator:false,bounces:false}}
            HeaderComponent={() => renderClose()}
            FooterComponent={() => renderList()}
        >
        <KeepAwake />
            {content}
        </Modalize>
        <Notification notif={notif} />
        </>
    )
})

export default ReceptScreen

const styles = StyleSheet.create({
    title:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:22,
        lineHeight:26,
        fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        color:Colors.textColor,marginBottom:35
    },
    subtitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:18,
        lineHeight:21,
        fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        color:Colors.textColor,
    },
    imageSubtitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:12,
        lineHeight:14,
        fontWeight:'500',
        color:'#FFF',
    },
    subText:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:16,
        lineHeight:19,fontWeight:'500',
        color:Colors.textColor
    },
    bjuTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:10,
        lineHeight:12,
        color:Colors.grayColor
    },
    bjuValue:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:14,
        lineHeight:17,fontWeight:'500',
        color:Colors.textColor,marginTop:6,
    },
    infoText:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:10,
        lineHeight:12,
        fontWeight:'500',
        color:Colors.grayColor,
    },
    personsBar:{
        flexDirection:'row',width:'100%',alignItems:'center',borderRadius:16,
        paddingVertical:16,justifyContent:'center',backgroundColor:'#FFF',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,elevation:10
    },
    personText:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:18,
        lineHeight:21,
        color:Colors.textColor,
        fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        marginHorizontal:common.getLengthByIPhone7(30)
    },
    ingredientTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:12,
        lineHeight:14,marginBottom:1,
        color:Colors.textColor,
        maxWidth:common.getLengthByIPhone7(80),textAlign:'center'
    },
    stepTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:14,
        fontWeight:'500',
        lineHeight:17,
        color:Colors.textColor,
    },
    stepSubtitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:12,
        lineHeight:14,
        color:Colors.grayColor,marginTop:11,
    },
})
