import React, { Component, useEffect } from 'react'
import { StyleSheet, Text, View,SafeAreaView, Animated, Platform, InteractionManager } from 'react-native'
import { TouchableOpacity, FlatList, ScrollView, TextInput } from 'react-native-gesture-handler'
import { observer,Observer, useObserver } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import {Btn} from '../../components/Btn'
import common from '../../../Utilites/Common'
import SkipHeader from '../../components/SkipHeader'
import Colors from '../../constants/Colors'
import QuizItem from '../../components/QuizScreens/QuizItem'
import network, { sendAnswer } from '../../../Utilites/Network'
import QuizAnimation from '../../animations/QuizAnimation'


const ThirdQuizScreen = observer(({navigation}) => {

    const screen = network.onboarding['ThirdQuizScreen']
    const {startAnim,fadeAnim,marginAnim,contentMargin} = QuizAnimation()

    const header = () => {
        return(
        <View>
            <Text style={styles.title}>{screen?.title}</Text>
            <Text style={styles.subtitle}>{screen?.description}</Text>
        </View>
        )
    }

    const answerHandler = (item) => {
        sendAnswer(screen?.request_to,'ThirdQuizScreen',item?.text)
        navigation.navigate(screen?.next_board)
    }

    useEffect(() => {
        startAnim()
    }, [])
    return (
        <>
        <SafeAreaView backgroundColor={"#FFF"} />
        <SkipHeader skip={() => navigation.navigate(screen?.next_board)} goBack={() => navigation.goBack()} />
        <Animated.View style={{opacity:fadeAnim,flex:1,backgroundColor:'#FFF',transform:[{translateY:marginAnim}]}}>
        <FlatList
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={header}
            data={screen?.answers}
            style={{backgroundColor:'#FFF'}}
            contentContainerStyle={{paddingHorizontal:16,paddingBottom:50,paddingTop:7}}
            keyExtractor={(item, index) => item.id} 
            renderItem={({item,index}) => 
            <Animated.View style={{transform:[{translateY:contentMargin}]}}>
            <QuizItem title={item?.text} onPress={() => answerHandler(item)} icons={Array.isArray(screen?.answers[index].icon) ? item.icon : [item.icon]}/> 
            </Animated.View>
            }
        />
        </Animated.View>
        <SafeAreaView backgroundColor={"#FFF"} />
        </>
    )
})

export default ThirdQuizScreen

const styles = StyleSheet.create({
    title:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:22,
        lineHeight:26,
        fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        marginBottom:20,
    },
    subtitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:14,
        lineHeight:17,
        fontWeight:'500',
        marginBottom:20
    }
})
