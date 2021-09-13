import React, { Component,useState, useRef, useEffect } from 'react'
import { StyleSheet, Text, View, Image, Platform, TouchableOpacity, ImageBackground, SafeAreaView, Dimensions, Alert,Share } from 'react-native'
import {FlatList, ScrollView, TextInput, TouchableHighlight } from 'react-native-gesture-handler'
import network, { getList, listClear } from '../../Utilites/Network'
import { observer,Observer, useObserver } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import {Btn} from '../components/Btn'
import common from '../../Utilites/Common'
import Colors from '../constants/Colors'
import DayRecipeCard from '../components/MenuScreen/DayRecipeCard'
import LinearGradient from 'react-native-linear-gradient'
import { getBottomSpace, getStatusBarHeight } from 'react-native-iphone-x-helper'
import ListItem from '../components/ListScreen/ListItem'
import { IngredientItem } from '../components/ListScreen/IngredientItem'
import { AboutIngrModal } from '../components/ListScreen/AboutIngrModal'

const ListScreen = observer(({navigation}) => {

    const [ingrModal, setIngrModal] = useState(false)
    const [dishesArr, setDishesArr] = useState([])
    const [currentIngr, setCurrentIngr] = useState({})

    let ingredientsCount = 0
    let body = []
    let buyedBody = []
    let sectionObj = {}

    for (let i = 0; i < network.listDishes.length; i++) {
        const item = network.listDishes[i]
        ingredientsCount += item.ingredients.length
        if(!item.disIngr){
            for (let ind = 0; ind < item.ingredients.length; ind++) {
            let ingredient = item.ingredients[ind]
            runInAction(() => {
                ingredient.from = item.id
                ingredient.persons = item.persons
            })
            // Проверяемя пустой ли массив
            let isNotUndefined = sectionObj[ingredient.section]
            sectionObj[ingredient.section] = isNotUndefined ? [...sectionObj[ingredient.section],ingredient] : [ingredient]
            }
        }
    }
    const keys = Object.keys(sectionObj)
    for (let i = 0; i < keys.length; i++) {
        let filteredArr = []
        // Преобразовываем массив, чтобы не было повторяющихся ингредиентов sectionObj - массив всех ингредиентов, где keys[i] - название секции
        filteredArr = sectionObj[keys[i]].reduce((reducer,item) => {
            let found = reducer.find(p => p.id === item.id)
            // Если ингредиент до этого уже занесён в массив
            if(found){
                // Пересчитываем кол-во ингредиентов
                let newIngr = {...found}
                newIngr.combined = true
                newIngr.count = Math.ceil(parseFloat(item?.count * item?.persons) + parseFloat(newIngr?.initCount * newIngr?.persons))
                newIngr.is_buyed = item?.is_buyed || newIngr?.is_buyed
                newIngr.piece ? newIngr.piece = Math.ceil((item?.piece * item?.persons) + (newIngr?.initPiece * newIngr?.persons)) : null
                return [...reducer.filter((ingr) => ingr.id != item.id),newIngr]
            } else {
                let newIngr = {...item}
                // Ключи initCount и initPiece необходимы, чтобы при "показать/скрыть" блюда корректно рассчитывалось кол-во
                newIngr.initCount = item?.count
                newIngr.initPiece= item?.piece
                newIngr.count = Math.ceil(item?.count * item?.persons)
                newIngr.piece ? newIngr.piece = Math.ceil(item?.piece * item?.persons) : null
                reducer.push(newIngr)
            }
            return reducer
        },[])
        // Заголовок секции
        body.push(
            <Text style={{...styles.sectionTitle,marginTop:i > 0 ? common.getLengthByIPhone7(34) : common.getLengthByIPhone7(25),
                display:filteredArr.findIndex(ing => !ing.is_buyed) != -1 ? 'flex' : 'none'}} 
                key={keys[i]}>
                    {keys[i]}
            </Text>
        )
        // Перебираем преобразованный массив
        for (let y = 0; y < filteredArr.length; y++) {
            let ingredient = filteredArr[y]
            if(ingredient?.is_buyed){
                buyedBody.push(<IngredientItem item={ingredient} onPress={() => openIngrModal(ingredient)} key={ingredient.id}/>)
            } else {
                body.push(<IngredientItem item={ingredient} onPress={() => openIngrModal(ingredient)} key={ingredient.id}/>)
            }
        }
    }
    

    const clearList = () => {
        Alert.alert('Очистить список','Все рецепты будут удалены из списка, продолжить?',
            [{text:'Да',onPress:() => {
                listClear()
                runInAction(() => network.listDishes = [])
            }},
            {text:'Нет'}])
    }

    const eyeHandler = (status,index) => {
        runInAction(() => network.listDishes[index].disIngr = status)
    }

    const openRec = (rec) => {
        if(network.canOpenRec(rec.id)){
            navigation.navigate('ReceptScreen',{rec:rec})
        } else {
            navigation.navigate('PayWallScreen')
        }
    }

    const openIngrModal = (ingr) => {
        const dishes = network.listDishes.filter((dish) => {
            for (let i = 0; i < dish.ingredients.length; i++) {
                if(dish.ingredients[i].id == ingr.id && !dish.disIngr){
                    return true
                }
            }
        })
        setCurrentIngr(ingr)
        setDishesArr(dishes)
        setIngrModal(true)
    }
    const onShare = async () => {
        let row = [`Список покупок (от WeCook):${'\n'}`]
        for (let i = 0; i < keys.length; i++) {
            let items = []
            // Преобразовываем массив, чтобы не было повторяющихся ингредиентов sectionObj - массив всех ингредиентов, где keys[i] - название секции
            const filteredArr = sectionObj[keys[i]].reduce((reducer,item) => {
                let found = reducer.find(p => p.id === item.id)
                // Если ингредиент до этого уже занесён в массив
                if(found){
                    // Пересчитываем кол-во ингредиентов
                    let newIngr = {...found}
                    newIngr.combined = true
                    newIngr.count = Math.ceil(parseFloat(item?.count * item?.persons) + parseFloat(newIngr?.initCount * newIngr?.persons))
                    newIngr.is_buyed = item?.is_buyed || newIngr?.is_buyed
                    newIngr.piece ? newIngr.piece = Math.ceil((item?.piece * item?.persons) + (newIngr?.initPiece * newIngr?.persons)) : null
                    return [...reducer.filter((ingr) => ingr.id != item.id),newIngr]
                } else {
                    let newIngr = {...item}
                    // Ключи initCount и initPiece необходимы, чтобы при "показать/скрыть" блюда корректно рассчитывалось кол-во
                    newIngr.initCount = item?.count
                    newIngr.initPiece= item?.piece
                    newIngr.count = Math.ceil(item?.count * item?.persons)
                    newIngr.piece ? newIngr.piece = Math.ceil(item?.piece * item?.persons) : null
                    reducer.push(newIngr)
                }
                return reducer
            },[])
            // Делаем массив текста ингредиентов
            for (let y = 0; y < filteredArr.length; y++) {
                const ingred = filteredArr[y]
                if(!ingred.is_buyed){
                  items.push(`${ingred.name} - ${ingred.count == 0 ? '' : ingred.count} ${ingred.unit}`)
                }
            }
            // Если есть такие ингредиенты, которые не куплены - создаем текст сообщения keys[i] - заголовок
            if(items.length){
                row.push(`${'\n'}< ${keys[i]} >`)
                row.push(...items)
            }
        }
        let message = row.join(`${'\n'}`)
        setTimeout(async () => {
            try {
                await Share.share({
                  message:
                    `${message}`,
                },{
                  tintColor:Colors.greenColor
                });
              } catch (error) {
                alert(error.message);
              }
        }, 200);
      };
 
    const header = [
        <View style={styles.header}>
            <TouchableOpacity activeOpacity={1} style={{position:'absolute',left:0,paddingVertical:11,paddingHorizontal:16,zIndex:100}} 
            onPress={() => navigation.goBack()}>
                <Image source={require('../../assets/icons/close.png')} style={{width:18,height:18,tintColor:Colors.textColor}} />
            </TouchableOpacity>
            <View style={{alignItems:'center',alignSelf:'center'}}>
                <Text style={styles.headerTitle}>Список</Text>
                <Text style={styles.headerSubitle}>
                    {network.listDishes.length}
                    {' ' + common.declOfNum(network.listDishes.length,['рецепт','рецепта','рецептов'])}, {ingredientsCount}
                    {' ' + common.declOfNum(ingredientsCount,['продукт','продукта','продуктов'])}.
                </Text>
            </View>
            <View style={{flexDirection:'row',alignItems:'center',position:'absolute',right:0}}>
                <TouchableOpacity activeOpacity={1} style={{paddingHorizontal:14,paddingVertical:11}}
                    onPress={() => clearList()}>
                    <Image source={require('../../assets/icons/trash.png')} style={{width:20,height:24}} />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={1} style={{paddingLeft:14,paddingVertical:11,paddingRight:16}} onPress={() => onShare()}>
                    <Image source={require('../../assets/icons/share.png')} style={{width:18,height:22}} />
                </TouchableOpacity>
            </View>
        </View>
    ]

    const mainScroll = useRef(null)

    return (
        <View style={{flex:1,backgroundColor:'#FFF'}}>
            {Platform.OS == 'ios' ?
            <SafeAreaView style={{backgroundColor:'#FFF',height:getStatusBarHeight()}} /> : 
            <SafeAreaView style={{backgroundColor:'#FFF'}} />}
            {header}
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{paddingBottom:120}}
                ref={mainScroll}>
                <FlatList
                    showsHorizontalScrollIndicator={false} horizontal
                    contentContainerStyle={{padding:16,paddingBottom:24,paddingRight:6}}
                    data={network.listDishes}
                    extraData={network.listDishes}
                    keyExtractor={(item, index) => item.id} 
                    renderItem={({item,index}) => <ListItem recept = {item} eyeHandler={(status) => eyeHandler(status,index)} onPress={() => openRec(item)} />}
                />
                {body}
                {buyedBody.length ? 
                <View style={{marginTop:38}}>
                    <View style={{paddingHorizontal:16,}}>
                        <Text style={styles.subtitle}>Купленные</Text>
                        <Text style={{...styles.headerSubitle,color:Colors.grayColor,marginTop:6,marginBottom:16}}>
                            Данные продукты не попадут в корзину при заказе в online
                        </Text>
                    </View>
                    {buyedBody}
                </View> : null}
            </ScrollView>
            <View style={{padding:8,backgroundColor:'#FFF',paddingBottom:getBottomSpace() + 8}}>
                <TouchableHighlight onPress={() => null}
                    style={{width:'100%',padding:16,backgroundColor:Colors.yellow,borderRadius:16,alignItems:'center'}} 
                    underlayColor={Colors.underLayYellow}>
                        <Text style={styles.addsTitle}>Заказать в Сбер Маркет</Text>
                </TouchableHighlight>
            </View>
            <AboutIngrModal modal={ingrModal} closeModal={() => setIngrModal(false)} dishes={dishesArr} ingredient={currentIngr}
                onPress={(dish) => {
                    setIngrModal(false)
                    setTimeout(() => {
                        openRec(dish)
                    }, 500);
                }} />
        </View>
    )
})

export default ListScreen

const styles = StyleSheet.create({
    header:{
        height:44,
        width:'100%',
        backgroundColor:'#FFF',
    },
    headerTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:16,
        lineHeight:19,fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        color:Colors.textColor,marginBottom:2
    },
    headerSubitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:12,
        lineHeight:14,
        color:Colors.textColor
    },
    addsTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Medium' }), fontSize:16,
        fontWeight:'500',
        lineHeight:19,
        color:Colors.textColor
    },
    subtitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:22,
        lineHeight:26,fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        color:Colors.textColor
    },
    sectionTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:18,
        lineHeight:21,fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        color:Colors.textColor,marginBottom:10,
        paddingHorizontal:16,
    }
})
