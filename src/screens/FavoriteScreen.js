import React, { Component,useState, useRef, useEffect } from 'react'
import { StyleSheet, Text, View,SafeAreaView, Image, Platform, TouchableOpacity, ImageBackground, Animated, Dimensions, Alert } from 'react-native'
import {FlatList, ScrollView, TextInput, TouchableHighlight } from 'react-native-gesture-handler'
import network, { getList } from '../../Utilites/Network'
import { observer,Observer, useObserver } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import {Btn} from '../components/Btn'
import common from '../../Utilites/Common'
import Colors from '../constants/Colors'
import LinearGradient from 'react-native-linear-gradient'
import { getBottomSpace } from 'react-native-iphone-x-helper'
import FavorItem from '../components/FavoriteScreen/FavorItem'
import { FilterModal } from '../components/MenuScreen/FilterModal'

const FavoriteScreen = observer(({navigation}) => {

    const [filteredFavors, setFilteredFavors] = useState(network.favorDishes)
    const [filterModal, setFilterModal] = useState(false)
    const filterNames = ['Завтраки','Обеды','Ужины','Салаты','Десерты']
    const [currentFilters, setCurrentFilters] = useState([])

    const openRec = (rec) => {
        navigation.navigate('ReceptScreen',{rec:rec})
    }
 
    const listHandler = (isInList,recept) => {
        isInList ? network.deleteFromList(recept) : network.addToList(recept)
    }

    const filterHandler = (what) => {
        setCurrentFilters(what)
        if(what.length){
        const newFavor = network.favorDishes.filter((dish) => {
            for (let i = 0; i < what.length; i++) {
                if(dish?.eating == what[i]){
                    return true
                }
            } 
        })
            setFilteredFavors(newFavor)
        } else {
            setFilteredFavors(network.favorDishes)
        }
    }

    const header = [
        <View style={styles.header}>
            <TouchableOpacity activeOpacity={1} style={{position:'absolute',left:0,paddingVertical:12,paddingHorizontal:16,zIndex:100}} 
            onPress={() => navigation.goBack()}>
                <Image source={require('../../assets/icons/goBack.png')} style={{width:11,height:18,tintColor:Colors.textColor}} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Любимое</Text>
            <View style={{flexDirection:'row',alignItems:'center',position:'absolute',right:0}}>
                <TouchableOpacity activeOpacity={1} style={{paddingVertical:12,paddingHorizontal:16}} onPress={() => setFilterModal(true)}>
                    <Image source={require('../../assets/icons/filter.png')} style={{width:20,height:19}} />
                </TouchableOpacity>
            </View>
        </View>
    ]

    useEffect(() => {
        const onBlur = navigation.addListener('blur', () => {
            const newArr = []
            for (let i = 0; i < network.favorDishes.length; i++) {
                let dish = network.favorDishes[i]
                dish.new = false
                newArr.push(dish)
            }
            runInAction(() => network.favorDishes = newArr)
        });
        return onBlur;
    }, [navigation]);

    return (
        <View style={{flex:1,backgroundColor:'#FFF'}}>
            <SafeAreaView backgroundColor={'#FFF'} />
            {header}
            {network.favorDishes.length ? 
            <FlatList
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{padding:16}}
                data={filteredFavors}
                extraData={network.favorDishes}
                keyExtractor={(item, index) => item.id} 
                renderItem={({item,index}) => <FavorItem recept = {item} onPress={() => openRec(item)} listHandler={(isInList,recept) => listHandler(isInList,recept)} key={item?.id} />}
            /> : 
            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                    <Image source={require('../../assets/img/emptyFavors.png')} style={{width:112,height:96,marginBottom:19}} />
                <Text style={styles.title}>Нет любимых рецептов</Text>
                <Text style={styles.subtitle}>Каждый понравившийся рецепт, ты можешь добавить в этот список</Text>
            </View>
            }
            {network.listDishes.length ? 
            <View style={{padding:8,backgroundColor:"#FFF",paddingBottom:getBottomSpace() + 8}}>
                <TouchableHighlight onPress={() => navigation.navigate('ListScreen')}
                    style={{width:'100%',padding:16,backgroundColor:Colors.yellow,borderRadius:16}} 
                    underlayColor={Colors.underLayYellow}>
                    <View style={{width:'100%',borderRadius:16,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}} >
                    <View style={{flexDirection:'row',alignItems:'center'}}>
                    <View style={{padding:3,borderRadius:10,backgroundColor:Colors.textColor,marginRight:7}}>
                        <Text style={{...styles.headerSubitle,fontWeight:'bold',color:'#FFF'}}>{network.listDishes.length}</Text>
                    </View>
                    <Text style={{...styles.headerSubitle,fontWeight:'500'}}>Рецепт в списке</Text>
                    </View>
                    <View style={{flexDirection:'row',alignItems:'center'}}>
                        <Image source={require('../../assets/icons/listMenu.png')} style={{width:23,height:21,marginRight:5}} />
                        <Text style={styles.timeText}>от 2 ч.</Text>
                    </View>
                    </View>
                </TouchableHighlight>
            </View> : null}
            <FilterModal modal={filterModal} closeModal={() => setFilterModal(false)} allFilters={filterNames} currentFilters={currentFilters}
            applyFilters={(filtersArr) => {
                filterHandler(filtersArr)
                setFilterModal(false)
            }}/>
        </View>
    )
})

export default FavoriteScreen

const styles = StyleSheet.create({
    header:{
        height:44,
        width:'100%',justifyContent:'center',alignItems:'center',
        backgroundColor:'#FFF',
    },
    headerTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:16,
        lineHeight:19,fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        color:Colors.textColor,
    },
    headerSubitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:12,
        lineHeight:14,
        color:Colors.textColor
    },
    title:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:22,
        fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        lineHeight:25,
        color:Colors.textColor,marginBottom:8
    },
    subtitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:12,
        lineHeight:14,
        color:Colors.textColor,
        maxWidth:common.getLengthByIPhone7(260),textAlign:'center'
    }
})