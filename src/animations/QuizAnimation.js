import React, { useEffect, useRef } from 'react'
// import Animated, { Easing } from 'react-native-reanimated';
import {Animated,Easing } from 'react-native';

const QuizAnimation = () => {

    const fadeAnim = useRef(new Animated.Value(0)).current
    const marginAnim = useRef(new Animated.Value(200)).current
    const contentMargin = useRef(new Animated.Value(50)).current

    const startAnim = () => {
        Animated.timing(
            fadeAnim,
            {
              toValue: 1,
              duration: 700,
              useNativeDriver:true
            }
          ).start();
        Animated.timing(
            marginAnim,
            {
            toValue: 0,
            duration: 400,
            useNativeDriver:true,
            easing:Easing.elastic(1)
            }
        ).start(() => {});
        setTimeout(() => {
            Animated.timing(
                contentMargin,
                {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver:true,
                    easing:Easing.ease
                }
            ).start();
        }, 150);
    }

    return ({startAnim,fadeAnim,marginAnim,contentMargin})
}

export default QuizAnimation
