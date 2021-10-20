import React,{useState, useRef, useEffect} from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal,ScrollView, Dimensions, Platform, StatusBar} from 'react-native'
import Colors from '../../constants/Colors'
import common from '../../../Utilites/Common'
import { SafeAreaView } from 'react-navigation'
import network from '../../../Utilites/Network'
import { observer } from 'mobx-react-lite'
import { Btn } from '../Btn'
import { BlurView } from '@react-native-community/blur'
// import network.Allstories from './network.Allstories'
import { StoryBlock } from './StoryBlock'

export const StoriesModal = observer(({modal, closeModal, stop, setStop,currentPage, setCurrentPage}) => {
    const SCREEN_WIDTH = Dimensions.get('window').width
    const screens = []
    const body = []

    for (let i = 0; i < network.Allstories.length; i++) {
        screens.push(SCREEN_WIDTH*i)
        body.push(<StoryBlock stories={network.Allstories[i]} currentBlock={currentPage == i ? true : false} stop={stop} setStop={setStop} closeModal={closeModal}
            blockNumber={currentPage}
            nextModal={() => {
                if (i == network.Allstories.length - 1){
                    closeModal()
                } else {
                let newCurP = currentPage + 1
                setCurrentPage(newCurP)
                scroll.current.scrollTo({x: SCREEN_WIDTH * (i + 1), y: 0, animated: true})
                }
            }} />)
    }
    const scroll = useRef()
    useEffect(() => {
        // console.warn(modal,scroll)
        setTimeout(() => {
            scroll.current != undefined && scroll.current != null ? scroll.current.scrollTo({x: SCREEN_WIDTH * currentPage, y: 0, animated: false}) : null
        }, 100);  
        // StatusBar.setHidden(modal)
        // if (modal){
        //     if(Platform.OS === "android") {
        //         StatusBar.setBackgroundColor('black', true);
        //         StatusBar.setBarStyle('light-content', true);
        //       } else {
        //         StatusBar.setBarStyle('light-content', true);
        //       }
        // } else {
        //     if(Platform.OS === "android") {
        //         StatusBar.setBackgroundColor('white', true);
        //         StatusBar.setBarStyle('dark-content', true);
        //       } else {
        //         StatusBar.setBarStyle('dark-content', true);
        //       }
        // }
    }, [modal])


  return (
    <>
    <Modal
        animationType='fade'
        transparent={true} statusBarTranslucent
        visible={modal}
        onRequestClose={() => closeModal()}
        propagateSwipe={true}
        >   
            <ScrollView contentContainerStyle={{flex:1, backgroundColor:'#000'}} 
                scrollEnabled={!network.fullStoryText}
                style={{backgroundColor:'#000'}} 
                onMomentumScrollBegin={(e) => {
                    if(e.nativeEvent.contentOffset.y < -35){
                        closeModal()
                    }}}>
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}
                style={{height:'100%'}}
                scrollEventThrottle={8}
                pagingEnabled={true}
                disableIntervalMomentum={true}
                decelerationRate={Platform.select({ ios: 'fast', android: 0.8})}
                // decelerationRate={0}
                snapToInterval={common.getLengthByIPhone7(0)-common.getLengthByIPhone7(32)}
                // snapToAlignment={"center"}
                snapToOffsets={screens}
                bounces={false}
                ref={scroll}
                onMomentumScrollBegin={event => {
                    if(event.nativeEvent.contentOffset.x/SCREEN_WIDTH > network.Allstories.length -1){
                        closeModal()
                    }
                }}
                onMomentumScrollEnd={event => {
                    let page = Math.round(event.nativeEvent.contentOffset.x/SCREEN_WIDTH);
                    setCurrentPage(page)
                    // setActiveDot(page)
                }}
            >
                {body}
            </ScrollView>
            </ScrollView>
    </Modal>
    </>
  )
})

const styles = StyleSheet.create({
})