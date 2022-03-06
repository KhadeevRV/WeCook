import React, { useCallback,useState, useRef, useEffect } from 'react'
import { StyleSheet, Text, View,SafeAreaView, Image, Platform, TouchableOpacity, ImageBackground, Animated, Dimensions, Alert, ActivityIndicator } from 'react-native'
import {FlatList, ScrollView, TextInput, TouchableHighlight } from 'react-native-gesture-handler'
import { observer,Observer, useObserver } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import {Btn} from '../components/Btn'
import common from '../../Utilites/Common'
import Colors from '../constants/Colors'
import LinearGradient from 'react-native-linear-gradient'
import { getBottomSpace } from 'react-native-iphone-x-helper'
import network, { getHistory } from '../../Utilites/Network'
import { EarlyItem } from '../components/EarlyListScreen/EarlyItem'
import Spinner from 'react-native-loading-spinner-overlay'
import BottomListBtn from '../components/BottomListBtn'

const EarlyListScreen = observer(({navigation}) => {

    const [loading, setLoading] = useState(false)
    const [stop, setstop] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const daysArr = ['вск','пн','вт','ср','чт','пт','сб']
    const monthsArr = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
    const header = [
        <View style={styles.header} key={'header'}>
            <TouchableOpacity activeOpacity={1} style={{position:'absolute',left:0,paddingVertical:12,paddingHorizontal:16,zIndex:100}} 
            onPress={() => navigation.goBack()}>
                <Image source={require('../../assets/icons/goBack.png')} style={{width:11,height:18,bottom:1,tintColor:Colors.textColor}} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ранее добавленные</Text>
        </View>
    ]

    const getNewPage = async () => {
        setLoading(true)
        try {
            await getHistory(currentPage + 1).then(value => {
                value ? null : setstop(true)
            })
            setCurrentPage(prev => prev + 1)
            setLoading(false)
        } catch (err) {
            setLoading(false)   
        }
    }

    const openRec = (rec) => {
        if(network.canOpenRec(rec.id)){
            navigation.navigate('ReceptScreen',{rec:rec,fromHistory:true})
        } else {
            navigation.navigate('PayWallScreen')
        }
    }

    function sortObject(o) {
        var sorted = {},
        key, a = [];
    
        for (key in o) {
            if (o.hasOwnProperty(key)) {
                a.push(key);
            }
        }

        a.sort((a,b) => o[a][0].history_date < o[b][0].history_date)

        for (key = 0; key < a.length; key++) {
            sorted[a[key]] = o[a[key]];
        }
        return sorted;
    }

    const filter = (arr) => {
        let hash = {}
        // Проходим по массиву и преобразовываем дату по ключу history_date
        for (let i = 0; i < arr.length; i++) {
            const item = arr[i];
            let dateName = ''
            const recDate = new Date(item.history_date)
            if(recDate.toLocaleDateString() == new Date().toLocaleDateString()){
                dateName = 'Сегодня'
            } else if(recDate.getMonth() == new Date().getMonth() && recDate.getFullYear() == new Date().getFullYear() && new Date().getDate() - recDate.getDate() == 1){
                dateName = 'Вчера'
            } 
            else {
                dateName = daysArr[recDate.getDay()] + ', ' + recDate.getDate() + ' ' + monthsArr[recDate.getMonth()] + ' ' + recDate.getFullYear()
            }
            let isNotUndefined = hash[dateName]
            hash[dateName] = isNotUndefined ? [...hash[dateName],item] : [item]
        }
        // Сортируем по убыванию
        hash = sortObject(hash)
        return hash
    }
    const body = []
    const filteredArr = filter(network.history)
    for (let i = 0; i < Object.keys(filteredArr).length; i++) {
        // В функции filter преобразовали массив в нужный объект, где keys - дни, а в этих ключах лежат массив блюд
        const key = Object.keys(filteredArr)[i]
        body.push(
            <Text style={{...styles.dayTitle,marginTop:i == 0 ? 25 : 41}} key={key}>
                {key}
            </Text>
        )
        for (let j = 0; j < filteredArr[key].length; j++) {
            const item = filteredArr[key][j];
            body.push(
                <View key={item?.history_date} style={{marginTop: j == 0 ? 0 : 16}}>
                    <EarlyItem dish = {item} onPress={() => openRec(item)} />
                </View>
            )
        }
    }

    return (
        <View style={{flex:1,backgroundColor:'#FFF'}}>
            <SafeAreaView backgroundColor={'#FFF'} />
            {header}
            {/* <Text style={{fontSize:18,color:'red',textAlign:'center'}}>
                В РАЗРАБОТКЕ (ЛОГИКУ НЕ СМОТРЕТЬ, БЛЮДА ВЗЯТЫ С МЕНЮ ДЛЯ ПРОВЕРКИ ВЕРСТКИ)
            </Text> */}
            <FlatList 
                data={body}
                extraData={network.history} contentContainerStyle={{paddingHorizontal:16}}
                showsVerticalScrollIndicator={false}
                keyExtractor={({index}) => index}
                onEndReached={() => stop ? null : getNewPage()}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => 
                <View style={{marginTop:20}}>
                    <ActivityIndicator animating={loading} color={Colors.yellow} />
                </View>}
                renderItem={({item}) => item}
            />
            {network.listDishes.length ? <BottomListBtn navigation={navigation} />  : null}
        </View>
    )
})

export default EarlyListScreen

const styles = StyleSheet.create({
    header:{
        height:44,
        width:'100%',justifyContent:'center',alignItems:'center',
        backgroundColor:'#FFF',
    },
    headerTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:16,
        lineHeight:19,fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        color:Colors.textColor,top:1
    },
    dayTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:18,
        lineHeight:22,fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        color:Colors.textColor,marginBottom:10
    }
})
