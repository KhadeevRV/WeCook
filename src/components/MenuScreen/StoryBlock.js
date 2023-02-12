import React,{useState,useRef,useEffect} from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal,ScrollView, ImageBackground,Animated, Dimensions, Share, Platform,FlatList, Alert,SafeAreaView, StatusBar} from 'react-native'
import Colors from '../../constants/Colors'
import common from '../../../Utilites/Common'
import network, { addToMenu, replaceMenu, iSeeYourDaddy } from '../../../Utilites/Network'
import { observer } from 'mobx-react-lite'
import {ShowDishesModal} from './ShowDishesModal'
import { BlurView } from '@react-native-community/blur'
// import Video from 'react-native-video'
import LinearGradient from 'react-native-linear-gradient'
// import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import Config from '../../constants/Config'
import { getStatusBarHeight, isIphoneX } from 'react-native-iphone-x-helper'
import FastImage from 'react-native-fast-image'
import { runInAction } from 'mobx'

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

export const StoryBlock = observer(({closeModal = null,stories,stop,setStop,currentBlock,nextModal,blockNumber}) => {

    let animation = useRef(new Animated.Value(0));
    const [progress, setProgress] = useState(0);
    const [fullText, setFullText] = useState(false)
    const [currentStory, setCurrentStory] = useState(0)
    const [videoLoad, setVideoLoad] = useState(stories[currentStory].video ? false : true)

    const delay = Platform.OS == 'ios' ? 100 : 200

    useEffect(() => {
        // stories.length == currentStory - 1
        if(network.stories[blockNumber].stories.length == (currentStory + 1)){
            network.stories[blockNumber]?.viewed  ? null : iSeeYourDaddy(network.stories[blockNumber].id)
            runInAction(() => network.stories[blockNumber].viewed = true)
        }
        setFullText(false)
        runInAction(() => network.fullStoryText = false)
    }, [currentBlock,currentStory])

    useInterval(() => {
        if(!stop && currentBlock && videoLoad){
            if(progress < stories.length * 100) {
                setProgress(progress + 2);
                if(progress % 100 == 0){ 
                    setCurrentStory(progress / 100)
                    videoRef.current != undefined && videoRef.current != null ? videoRef.current.seek(0) : null
                }
              }else{
                nextModal() 
              } 
        }
      }, delay);
     
      useEffect(() => { 
        Animated.timing(animation.current, { 
          toValue: progress,
          duration: 100,
          useNativeDriver:false
        }).start();
      },[progress])
    
      useEffect(() => {
        const newProg = currentStory * 100
        setProgress(newProg)
      }, [currentStory])

      useEffect(() => {
        setCurrentStory(0)
        setProgress(0)
      }, [currentBlock])
    
    const progressBar = []
    const inActiveView = []

    for (let i = 0; i < stories.length; i++) {
        const width = animation.current.interpolate({
            inputRange: [100 * i, 100 * (i + 1)],
            outputRange: [0, ((Dimensions.get('window').width - 20)/ stories.length) - 7],
            extrapolate: "clamp"
        })
        if(i + 1 == stories.length){
            progressBar.push(<Animated.View style={{height:4,backgroundColor:'#FFF',borderRadius:4,width:width}}/>)
            inActiveView.push(<View style={{width:((Dimensions.get('window').width - 20)/ stories.length) - 8,height:4,backgroundColor:'#FFF',borderRadius:4,opacity:0.5}}/>)
        } else {
        progressBar.push(<Animated.View style={{height:4,backgroundColor:'#FFF',borderRadius:4,width:width,marginRight:8}}/>)
        inActiveView.push(<View style={{width:((Dimensions.get('window').width - 20)/ stories.length) - 8,marginRight:8,height:4,backgroundColor:'#FFF',borderRadius:4,opacity:0.5}}/>)
        }
    }


    const onShare = async () => {
        setStop(true)
        try { 
          const result = await Share.share({
            message:
              `${stories[currentStory].link}`,
          },{
            tintColor:Colors.greenColor
          });
          if (result.action === Share.sharedAction) {
            if (result.activityType) {
              // shared with activity type of result.activityType
                setStop(false)
            } else {
              // shared
              setStop(false)
            }
          } else if (result.action === Share.dismissedAction) {
            // dismissed
            setStop(false)
          }
        } catch (error) {
          alert(error.message);
        }
      };

    let videoRef = useRef()

    // useEffect(() => {
    //     videoRef.current != undefined && videoRef.current != null ? videoRef.current.seek(0) : setVideoLoad(true)
    //     // stories[currentStory].video.length ? console.warn(stories[currentStory].video) : setTimeout(() => {
    //     //     setStop(false)
    //     // }, 300); 
    // }, [currentStory])
    
  return (
    <> 
        {stories[currentStory].video ? 
        <View style={{width:Dimensions.get('window').width}}>
            <View style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    backgroundColor:'#000',
                    zIndex:-1,
                }}>
            {/* <Video source={{uri: stories[currentStory].video}}   // Can be a URL or a local file.
                ref={videoRef}                                      // Store reference
                onError={(e) => Alert.alert(Config.appName, 'Ошибка при загрузке видео',[{
                    text:'OK', onPress: () => closeModal()
                }])}               // Callback when video cannot be loaded
                onLoadStart ={() => {
                    // console.warn('start')
                        setVideoLoad(false)
                }}
                onBuffer={(e) => {
                    if(stories[currentStory].video && e.isBuffering){
                        setVideoLoad(true)
                    }
                }}
                // onEnd={() => {
                //     setVideoLoad(true)
                //     videoRef.current.seek(0)
                // }}
                resizeMode={'contain'}
                style={styles.backgroundVideo}
                // repeat={stop}
                paused={stop} 
                /> */}
            </View>
            {/* <LinearGradient colors={['rgba(0, 0, 0, 0.4)', `rgba(0, 0, 0, 0)`]}> */}
                <SafeAreaView style={{marginBottom:isIphoneX() ? 0 : getStatusBarHeight()}} />
                <View style={{height:120}}>
                    <View style={{flexDirection:'row',paddingHorizontal:10,position:'absolute',width:'100%',zIndex:10,marginTop:4}}>
                        {progressBar}
                    </View>
                    <View style={{flexDirection:'row',paddingHorizontal:10,justifyContent:'space-between',marginTop:4}}>
                        {inActiveView}
                    </View>
                    <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:18,marginHorizontal:16,alignItems:'center'}}>
                        <TouchableOpacity onPress={() => closeModal()}>
                            <Image style={{width:20,height:20,tintColor:'#FFF'}} source={require('../../../assets/icons/close.png')} />
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={() => onShare()}>
                            <Image style={{width:18,height:22,tintColor:'#FFF'}} source={require('../../../assets/icons/shareIcon.png')} />
                        </TouchableOpacity> */}
                        <View />
                    </View>
                </View>
            {/* </LinearGradient> */}
            <View style={{flex:1,position:'absolute',zIndex:100,marginTop:120,height:'100%',width:'100%',flexDirection:'row',justifyContent:'space-between'}}>
                <TouchableOpacity style={{opacity:0,height:'100%',width:'30%',}} 
                activeOpacity={1} 
                delayLongPress={200}
                onLongPress={() => {
                    setStop(true)
                }} 
                onPressOut={() => {
                    setStop(false)
                }}
                onPress={() => {
                    const newCur = parseInt(Math.floor(progress / 100) - 1)
                    const newProgress = newCur * 100
                    // console.warn(network.stories[1].image)
                    if(newCur < stories.length && newCur != -1){
                        setProgress(newProgress)
                        setCurrentStory(newCur)
                    } else {
                        // closeModal()
                        setProgress(0)
                        setCurrentStory(0)
                    }
                }} />
                <TouchableOpacity style={{opacity:0,height:'100%',width:'70%',}} activeOpacity={1} 
                    delayLongPress={200}
                    onLongPress={() => {
                        setStop(true)
                    }} 
                    onPressOut={() => {
                        setStop(false)
                    }}
                    onPress={() => {
                        const newCur = parseInt(Math.floor(progress / 100) + 1)
                        const newProgress = newCur * 100
                        if(newCur < stories.length){
                            setProgress(newProgress)
                            setCurrentStory(newCur)
                        } else {
                            // closeModal()
                            nextModal()
                        }
                    }}  />
            </View>
            </View> : 
            <ImageBackground resizeMode={'cover'} source={{uri:stories[currentStory].image_big,cache:'force-cache'}}
            style={{width:Dimensions.get('window').width,height:'100%'}} 
            onLoadStart ={() => {
                setVideoLoad(false)
            }}
            onLoad={() => {
                setVideoLoad(true)
            }}>
            {fullText ? <SafeAreaView style={{marginBottom:isIphoneX() ? 0 : getStatusBarHeight()}} />  :
            <View>
            {/* <LinearGradient colors={['rgba(0, 0, 0, 0.4)', `rgba(0, 0, 0, 0)`]} style={{paddingTop:Platform.OS == 'android' ? 0 : getStatusBarHeight()}}> */}
            <SafeAreaView style={{marginBottom:isIphoneX() ? 0 : getStatusBarHeight()}} /> 
                <View style={{height:120}}>
                    <View style={{flexDirection:'row',paddingLeft:11,paddingRight:10,position:'absolute',width:'100%',zIndex:10,marginTop:4}}>
                        {progressBar}
                    </View>
                    <View style={{flexDirection:'row',paddingLeft:11,paddingRight:10,justifyContent:'space-between',marginTop:4}}>
                        {inActiveView}
                    </View>
                    <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:18,alignItems:'center'}}>
                        <TouchableOpacity onPress={() => closeModal()} style={{width:48,height:44,alignItems:'flex-start',paddingLeft:16}} activeOpacity={1}>
                            <Image style={{width:20,height:20,tintColor:'#FFF'}} source={require('../../../assets/icons/close.png')} />
                        </TouchableOpacity>
                        {/* <TouchableOpacity onPress={() => onShare()} style={{width:48,height:44,alignItems:'flex-end',paddingRight:16}} activeOpacity={1}>
                            <Image style={{width:18,height:22,tintColor:'#FFF'}} source={require('../../../assets/icons/shareIcon.png')} />
                        </TouchableOpacity> */}
                        <View/> 
                    </View>
                </View>
            {/* </LinearGradient> */}
            </View>}
            {stories[currentStory].text && stories[currentStory].text.length ? null :
            <ScrollView onMomentumScrollBegin={(e) => {
                if(e.nativeEvent.contentOffset.y < -35){
                    // closeModal()
                }}} contentContainerStyle={{flex:1,flexDirection:'row'}}>
                <TouchableOpacity activeOpacity={1} 
                delayLongPress={200}
                onLongPress={() => {
                    setStop(true)
                }} 
                onPressOut={() => {
                    setStop(false)
                }}
                onPress={() => {
                    const newCur = parseInt(Math.floor(progress / 100) - 1)
                    const newProgress = newCur * 100
                    // console.warn(network.stories[1].image)
                    if(newCur > 0){
                        setProgress(newProgress)
                        setCurrentStory(newCur)
                    } else {
                        setProgress(0)
                        setCurrentStory(0)
                    }
                }} style={{width:'33%',height:'100%'}} />
                <TouchableOpacity activeOpacity={1}
                    delayLongPress={200}
                    onLongPress={() => {
                        setStop(true)
                    }} 
                    onPressOut={() => {
                        setStop(false)
                    }}
                    onPress={() => {
                        const newCur = parseInt(Math.floor(progress / 100) + 1)
                        const newProgress = newCur * 100
                        // console.warn(network.stories[1].image)
                        if(newCur < stories.length ){
                            setProgress(newProgress)
                            setCurrentStory(newCur)
                        } else {
                            // closeModal()
                            nextModal()
                        }
                    }}
                    style={{width:'33%',height:'100%'}}/>
                <TouchableOpacity activeOpacity={1} 
                delayLongPress={200}
                onLongPress={() => {
                    setStop(true)
                }} 
                onPressOut={() => {
                    setStop(false)
                }}
                onPress={() => {
                    const newCur = parseInt(Math.floor(progress / 100) + 1)
                    const newProgress = newCur * 100
                        // console.warn(network.stories[1].image)
                    if(newCur < stories.length){
                        setProgress(newProgress)
                        setCurrentStory(newCur)
                    } else {
                        // closeModal()
                        nextModal()
                    }
                }} style={{width:'33%',height:'100%'}}/>
            </ScrollView> }
            {stories[currentStory].text && stories[currentStory].text.length ? 
                Platform.OS == 'ios' ?
                <ScrollView showsVerticalScrollIndicator={false} style={{flex:1,minHeight:fullText ? '100%' : null}}
                scrollEventThrottle={16}
                contentContainerStyle={{flexGrow:1}}
                    onScroll={(e) => {
                        if(e.nativeEvent.contentOffset.y > 50){
                            setStop(true)
                            setFullText(true)
                            network.fullStoryText = true
                        } else if (e.nativeEvent.contentOffset.y < -50){
                            setStop(false)
                            setFullText(false)
                            network.fullStoryText = false
                        }
                    }}>
                    <View style={{height:fullText ? '0%' : '70%',flexDirection:'row'}} onStartShouldSetResponder={() => true}>
                    <TouchableOpacity activeOpacity={1} 
                                delayLongPress={200}
                                onLongPress={() => {
                                    setStop(true)
                                }} 
                                onPressOut={() => {
                                    setStop(false)
                                }}
                                onPress={() => {
                                    const newCur = parseInt(Math.floor(progress / 100) - 1)
                                    const newProgress = newCur * 100
                                    // console.warn(network.stories[1].image)
                                    if(newCur > 0){
                                        setProgress(newProgress)
                                        setCurrentStory(newCur)
                                    } else {
                                        setProgress(0)
                                        setCurrentStory(0)
                                    }
                                }} style={{width:'33%',height:'100%'}} />
                                <TouchableOpacity activeOpacity={1}
                                    delayLongPress={200}
                                    onLongPress={() => {
                                        setStop(true)
                                    }} 
                                    onPressOut={() => {
                                        setStop(false)
                                    }}
                                    onPress={() => {
                                        const newCur = parseInt(Math.floor(progress / 100) + 1)
                                        const newProgress = newCur * 100
                                        // console.warn(network.stories[1].image)
                                        if(newCur < stories.length ){
                                            setProgress(newProgress)
                                            setCurrentStory(newCur)
                                        } else {
                                            // closeModal()
                                            nextModal()
                                        }
                                    }}
                                    style={{width:'33%',height:'100%'}}/>
                                <TouchableOpacity activeOpacity={1} 
                                delayLongPress={200}
                                onLongPress={() => {
                                    setStop(true)
                                }} 
                                onPressOut={() => {
                                    setStop(false)
                                }}
                                onPress={() => {
                                    const newCur = parseInt(Math.floor(progress / 100) + 1)
                                    const newProgress = newCur * 100
                                        // console.warn(network.stories[1].image)
                                    if(newCur < stories.length){
                                        setProgress(newProgress)
                                        setCurrentStory(newCur)
                                    } else {
                                        // closeModal()
                                        nextModal()
                                    }
                                }} style={{width:'33%',height:'100%'}}/>
                    </View>
                    <View style={{width:'100%', 
                        height:fullText ? '100%' : '30%',
                        // flexGrow:1,
                        marginTop:fullText ? 0 : 50, 
                        justifyContent:'flex-start'}}
                        onStartShouldSetResponder={() => true}>
                    <BlurView
                    borderRadius={16}
                    style={{
                        borderTopEndRadius:16,
                        borderTopStartRadius:16,
                        paddingBottom:fullText ? 0 : Dimensions.get('window').height > 800 ? 50 : 50, 
                        // marginBottom:fullText ? 0 : Dimensions.get('window').height > 800 ? 170 : 100,
                        height:fullText ? '150%' : '200%',
                    }}
                    blurType='ultraThinMaterialDark'
                    blurAmount={10}
                    reducedTransparencyFallbackColor="white">
                        {fullText ? 
                        <TouchableOpacity onPress={() => {
                            if (fullText){
                                setFullText(false)
                                network.fullStoryText = false
                                setStop(false)
                            } else {
                                setFullText(true)
                                network.fullStoryText = true
                                setStop(true)
                            }
                            }} style={{height:common.getLengthByIPhone7(62),justifyContent:'center',alignItems:'center',borderRadius:16}}>
                            <Image source={fullText ?require('../../../assets/icons/fullText.png') : require('../../../assets/icons/nonFullText.png')} 
                                style={{width:36,height:11,marginLeft:1}} />
                        </TouchableOpacity> : null}
                        <ScrollView contentContainerStyle={{paddingHorizontal:16,marginBottom:80}}>
                        {!fullText ? 
                        <TouchableOpacity onPress={() => {
                            if (fullText){
                                setFullText(false)
                                network.fullStoryText = false
                                setStop(false)
                            } else {
                                setFullText(true)
                                network.fullStoryText = true
                                setStop(true)
                            }
                            }} style={{height:common.getLengthByIPhone7(62),justifyContent:'center',alignItems:'center',borderRadius:16}}>
                            <Image source={fullText ?require('../../../assets/icons/fullText.png') : require('../../../assets/icons/nonFullText.png')} 
                                style={{width:36,height:11,marginLeft:1}} />
                        </TouchableOpacity> : null}
                            <Text allowFontScaling={false} style={{...styles.fullText,maxHeight:fullText ? '100%' : 93}}>
                                {stories[currentStory].text}
                            </Text>
                        </ScrollView>
                    </BlurView>
                    </View>
                </ScrollView> : 
                //  Андройд текст
                <GestureRecognizer
                    onSwipeUp={(state) => {
                        setFullText(true)
                        network.fullStoryText = true
                        setStop(true)
                    }}
                    onSwipeDown={(state) => {
                        setFullText(false)
                        network.fullStoryText = false
                        setStop(false)
                    }}
                    config={{
                        velocityThreshold: 0.3,
                        directionalOffsetThreshold: 80
                      }}
                    style={{flex: 1,}}
                >
                <ScrollView showsVerticalScrollIndicator={false} scrollEnabled={true} style={{flex:1,minHeight:fullText ? '100%' : null}}
                scrollEventThrottle={16}
                contentContainerStyle={{flexGrow:1}}
                    onScroll={(e) => {
                        if(e.nativeEvent.contentOffset.y > 50){
                            setStop(true)
                            setFullText(true)
                            network.fullStoryText = true
                        } else if (e.nativeEvent.contentOffset.y < -50){
                            setStop(false)
                            setFullText(false)
                            network.fullStoryText = false
                        }
                    }}>
                    <View style={{height:fullText ? '0%' : '70%',flexDirection:'row'}} onStartShouldSetResponder={() => true}>
                    <TouchableOpacity activeOpacity={1} 
                                delayLongPress={200}
                                onLongPress={() => {
                                    setStop(true)
                                }} 
                                onPressOut={() => {
                                    setStop(false)
                                }}
                                onPress={() => {
                                    const newCur = parseInt(Math.floor(progress / 100) - 1)
                                    const newProgress = newCur * 100
                                    // console.warn(network.stories[1].image)
                                    if(newCur > 0){
                                        setProgress(newProgress)
                                        setCurrentStory(newCur)
                                    } else {
                                        setProgress(0)
                                        setCurrentStory(0)
                                    }
                                }} style={{width:'33%',height:'100%'}} />
                                <TouchableOpacity activeOpacity={1}
                                    delayLongPress={200}
                                    onLongPress={() => {
                                        setStop(true)
                                    }} 
                                    onPressOut={() => {
                                        setStop(false)
                                    }}
                                    onPress={() => {
                                        const newCur = parseInt(Math.floor(progress / 100) + 1)
                                        const newProgress = newCur * 100
                                        // console.warn(network.stories[1].image)
                                        if(newCur < stories.length ){
                                            setProgress(newProgress)
                                            setCurrentStory(newCur)
                                        } else {
                                            // closeModal()
                                            nextModal()
                                        }
                                    }}
                                    style={{width:'33%',height:'100%'}}/>
                                <TouchableOpacity activeOpacity={1} 
                                delayLongPress={200}
                                onLongPress={() => {
                                    setStop(true)
                                }} 
                                onPressOut={() => {
                                    setStop(false)
                                }}
                                onPress={() => {
                                    const newCur = parseInt(Math.floor(progress / 100) + 1)
                                    const newProgress = newCur * 100
                                        // console.warn(network.stories[1].image)
                                    if(newCur < stories.length){
                                        setProgress(newProgress)
                                        setCurrentStory(newCur)
                                    } else {
                                        // closeModal()
                                        nextModal()
                                    }
                                }} style={{width:'33%',height:'100%'}}/>
                    </View>
                    <View style={{width:'100%', 
                        height:fullText ? '100%' : '30%',
                        // flexGrow:1,
                        marginTop:fullText ? 0 : 50, 
                        justifyContent:'flex-start'}}
                        onStartShouldSetResponder={() => true}>
                    {/* <BlurView
                    style={{
                        borderRadius:16,
                        height:fullText ? '100%' : null
                    }}
                    blurType='dark'
                    blurAmount={10}
                    reducedTransparencyFallbackColor="white"> */}
                    <View style={{
                        backgroundColor:'rgba(0,0,0,.6)',
                        borderTopEndRadius:fullText ? 0 : 16,
                        borderTopStartRadius:fullText ? 0 : 16,
                        paddingBottom:fullText ? 0 : Dimensions.get('window').height > 800 ? 50 : 50, 
                        // marginBottom:fullText ? 0 : Dimensions.get('window').height > 800 ? 170 : 100,
                        height:fullText ? '150%' : '200%',
                        }}>
                        <ScrollView contentContainerStyle={{paddingHorizontal:12}} scrollEnabled={fullText ? true : false}>
                        <TouchableOpacity onPress={() => {
                            if (fullText){
                                setFullText(false)
                                network.fullStoryText = false
                                setStop(false)
                            } else {
                                setFullText(true)
                                network.fullStoryText = true
                                setStop(true)
                            }
                            }} style={{height:common.getLengthByIPhone7(62),justifyContent:'center',alignItems:'center',borderRadius:16}}>
                            <Image source={fullText ?require('../../../assets/icons/fullText.png') : require('../../../assets/icons/nonFullText.png')} style={{width:36,height:11}} />
                        </TouchableOpacity>
                            <Text allowFontScaling={false} style={{...styles.fullText,maxHeight:fullText ? '100%' : 93}}>
                                {stories[currentStory].text}
                            </Text>
                        </ScrollView>
                    </View>
                    {/* </BlurView> */}
                    </View>
                </ScrollView>
                </GestureRecognizer>
                : null}
        </ImageBackground>}
    </>
  )
})

const styles = StyleSheet.create({
    fullText:{
      fontFamily:Platform.OS == 'ios' ? 'SF Pro Display' : 'SFProDisplay-Regular',fontSize:common.getLengthByIPhone7(15),
      lineHeight:common.getLengthByIPhone7(18),
      color:'#FFF',
      maxWidth:Dimensions.get('window').width - 12,
    },
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor:'#FFF',
        zIndex:-1,
    },
    description:{

    }
})