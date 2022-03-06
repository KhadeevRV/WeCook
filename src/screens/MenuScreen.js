import React, { Component,useState, useRef, useEffect } from 'react'
import { StyleSheet, Text, View, Image, Platform, KeyboardAvoidingView, ImageBackground, Dimensions, SafeAreaView, BackHandler, StatusBar, Animated, InteractionManager, Alert } from 'react-native'
import { TouchableOpacity, FlatList, ScrollView, TextInput, TouchableHighlight } from 'react-native-gesture-handler'
import network, { getList, getUserInfo } from '../../Utilites/Network'
import { observer,Observer, useObserver } from 'mobx-react-lite'
import { runInAction } from 'mobx'
import {Btn} from '../components/Btn'
import common from '../../Utilites/Common'
import Colors from '../constants/Colors'
import DayRecipeCard from '../components/MenuScreen/DayRecipeCard'
import LinearGradient from 'react-native-linear-gradient'
import { getBottomSpace, getStatusBarHeight } from 'react-native-iphone-x-helper'
import { FilterModal } from '../components/MenuScreen/FilterModal'
import { ChangeWeeksModal } from '../components/MenuScreen/ChangeWeeksModal'
import { StoriesModal } from '../components/MenuScreen/StoriesModal'
import Spinner from 'react-native-loading-spinner-overlay'
import FastImage from 'react-native-fast-image'
import BottomListBtn from '../components/BottomListBtn'
import Config from '../constants/Config'
import { useFocusEffect } from '@react-navigation/native'
import changeNavigationBarColor from 'react-native-navigation-bar-color'
// import Animated from 'react-native-reanimated'
// import { SafeAreaView } from 'react-native-safe-area-context'

const ChangeMenuBtn = ({visible,onPress,title}) => {
    if(!visible){
        return null
    }

    return(
        <View style={{flexDirection:'row',alignSelf:'center',marginTop:30}}>
            <TouchableHighlight 
                onPress={() => onPress()}
                underlayColor={'#EEEEEE'} 
                style={{paddingVertical:10.5,paddingHorizontal:24,backgroundColor:'#F5F5F5',borderRadius:18,flexWrap:'wrap'}}>
                <Text style={styles.addsTitle}>{title}</Text>
            </TouchableHighlight>
        </View>
    )
}

const MenuScreen = observer(({navigation}) => {

    const [filteredMenu, setFilteredMenu] = useState(network.allDishes)
    const [filterModal, setFilterModal] = useState(false)
    const [currentWeek, setCurrentWeek] = useState('Текущая')
    const [weeksModal, setWeeksModal] = useState(false)
    const filterNames = ['Завтраки','Обеды','Ужины','Салаты','Десерты']
    const [currentFilters, setCurrentFilters] = useState([])
    const [secsWidth, setSecsWidth] = useState({})
    const screenWidth = Dimensions.get('window').width
    const [page, setPage] = useState(0)
    const [tabsY, setTabsY] = useState(0)
    const horScroll = useRef(null)
    const mainScroll = useRef(null)
    const sections = []
    const sectionNames = []
    const menuBody = []
    const screens = []

    const goToProfile = () => {
        if(network.user?.access && !network.user?.phone){
            navigation.navigate('LoginScreen',{closeDisable:true,from:'MenuScreen'})
        } else {
            navigation.navigate('ProfileScreen')            
        }
    }

    const backAction = () => {
        Alert.alert(Config.appName, 'Вы действительно хотите выйти?', [
            {
              text: 'Нет',
              onPress: () => null,
              style: 'cancel',
            },
            {text: 'Да', onPress: () => BackHandler.exitApp()},
        ]);
    }



    const header = [
        <View style={styles.header} key={'menuHeader'}>
            <TouchableOpacity activeOpacity={1} style={{paddingHorizontal:16,paddingVertical:11}}
                onPress={() => goToProfile()}
            >
                {network.user?.access ? null : 
                <View style={{width:10,height:10,borderRadius:10,backgroundColor:'#FFF',position:'absolute',top:11,right:14,justifyContent:'center',alignItems:'center',zIndex:100}}>
                    <View style={{width:6,height:6,borderRadius:3,backgroundColor:Colors.yellow}} />
                </View>}
                <Image source={require('../../assets/icons/profile.png')} style={{width:20,height:22}} />
            </TouchableOpacity>
            <View style={{alignItems:'center'}}>
                <TouchableOpacity activeOpacity={1} onPress={() => setWeeksModal(true)} style={{flexDirection:'row',alignItems:'center',paddingVertical:5,}}>
                    <Text style={styles.headerTitle}>{currentWeek} неделя</Text>
                    <Image source={require('../../assets/icons/goDown.png')} style={{width:13,height:8,marginLeft:6}} />
                </TouchableOpacity>
                {/* <Text style={styles.headerSubitle}>{network.user?.persons} персоны</Text> */}
            </View>
            <TouchableOpacity activeOpacity={1} style={{paddingHorizontal:16,paddingVertical:11}} 
                onPress={() => navigation.navigate('FavoriteScreen')}
            >
                <Image source={require('../../assets/icons/heart.png')} style={{width:20.5,height:19}} />
                {network.favorDishes.findIndex((dish) => dish.new) != -1 ?
                <View style={{width:10,height:10,borderRadius:10,backgroundColor:'#FFF',position:'absolute',top:8,right:12,justifyContent:'center',alignItems:'center'}}>
                    <View style={{width:6,height:6,borderRadius:3,backgroundColor:Colors.yellow}} />
                </View> : null}
            </TouchableOpacity>
        </View>
    ]

    const openRec = (rec) => {
        if(network.canOpenRec(rec.id)){
            const recept = currentWeek == 'Текущая' ? network.allDishes.find((item) => item.id == rec.id) : network.oldMenu.find((item) => item.id == rec.id)
            navigation.navigate('ReceptScreen',{rec:recept})
        } else {
            navigation.navigate('PayWallScreen',{data:network.paywalls[network.user?.banner?.type]})
        }
    }

    const listHandler = (isInList,recept) => {
        // Если блюдо в списке, то удаляем. Если нет, то проверяем, можно ли его добавить(открыть)
        if(isInList){
            network.deleteFromList(recept)   
        } else if (network.canOpenRec(recept.id)) {
            network.addToList(recept)
        } else {
            navigation.navigate('PayWallScreen',{data:network.paywalls[network.user?.banner?.type]})
        }
    }

    const filterHandler = (what,weekName = 'Текущая') => {
        setCurrentFilters(what)
        const initArr = weekName == 'Текущая' ? network.allDishes : network.oldMenu
        if(what.length){
        const newMenu = initArr.filter((dish) => {
            for (let i = 0; i < what.length; i++) {
                if(dish?.eating == what[i]){
                    return true
                }
            } 
        })
            setFilteredMenu(newMenu)
        } else {
            setFilteredMenu(initArr)
        }
    }

    //! Баннеры

    const getStickyHeader = () => {
        const canShowFirstBanner = Object.keys(network.banner1).length && network.user?.banner_hide.findIndex(item => item == network.banner1?.type) == -1
        const canShowSecondBanner = Object.keys(network.banner2).length && network.user?.banner_hide.findIndex(item => item == network.banner2?.type) == -1
        if(canShowFirstBanner && canShowSecondBanner){
            return 6
        } else if (canShowFirstBanner || canShowSecondBanner){
            return 5
        } else {
            return 4
        }
    }
    
    const bannerHandler = (banner) => {
        if(banner.type == 'list_history'){
            navigation.navigate('EarlyListScreen')
        } else if(banner.type == 'menu_holiday') {
            navigation.navigate('HolidayMenuScreen',{data:banner.recipes,bgImg:banner?.image_inner?.big_webp,description:banner?.description,title:banner?.title})
        } else {
            navigation.navigate('PayWallScreen',{data:network.paywalls[banner.type]})
        }
    }

    //! Меню на неделю
    const dayRecipeScreens = []
    for (let i = 0; i < network.dayDishes.length; i++) {
        dayRecipeScreens.push(i * (common.getLengthByIPhone7(304) + 7))
    }
    // Проходим по массиву секции
    for (let i = 0; i < network.sectionNames.length; i++) {
        screens.push(i * common.getLengthByIPhone7())
        // Если секция - предпочтение пользователя, то ставим её на первое место
        if(network.sectionNames[i] == network.user?.preference){
            sectionNames.unshift(network.sectionNames[i])
            sections.unshift(
                <View style={{marginVertical:15}} 
                    key={network.sectionNames[i]} 
                    onLayout={(e) => addCoords(network.sectionNames[i],e.nativeEvent.layout.width,e.nativeEvent.layout.x)}
                >
                <TouchableOpacity onPress={() => {
                    const ind = sectionNames.findIndex(item => item == network.sectionNames[i])
                    horScroll.current.scrollTo({x: ind * common.getLengthByIPhone7()})
                }} >
                    <Text style={[styles.addsTitle]}>
                        {network.sectionNames[i]}
                    </Text>
                </TouchableOpacity>
                </View>
            )
        } else {
            sectionNames.push(network.sectionNames[i])
            sections.push(
                <View style={{marginVertical:15}} 
                    key={network.sectionNames[i]} 
                    onLayout={(e) => addCoords(network.sectionNames[i],e.nativeEvent.layout.width,e.nativeEvent.layout.x)}
                >
                <TouchableOpacity onPress={() => {
                    const ind = sectionNames.findIndex(item => item == network.sectionNames[i])
                    horScroll.current.scrollTo({x: ind * common.getLengthByIPhone7()})
                }} >
                    <Text style={[styles.addsTitle]}>
                        {network.sectionNames[i]}
                    </Text>
                </TouchableOpacity>
                </View>
            )
        }
        
        let sectionBlock = []
        // Проходим по всем дням меню
        for (let index = 0; index < network.dayNames.length; index++) {
            // Собираем блюда, которые есть в этой секции, в этом дне
            const newDay = filteredMenu.filter((dish) => dish.day_name == network.dayNames[index] && dish.section_name == network.sectionNames[i])
            if(newDay.length){
            // Тайтл
            sectionBlock.push(<Text style={styles.dayTitle}>{network.dayNames[index]}</Text>)
            // Проходим по массиву дня и выводим карточки рецептов
            for (let ii = 0; ii < newDay.length; ii++) {
                const element = newDay[ii];
                sectionBlock.push(
                <View style={{paddingHorizontal:16}}>
                    <DayRecipeCard vertical={true} recept={element} onPress={() => openRec(element)} key={element.id} 
                        listHandler={(isInList,element) => listHandler(isInList,element)}/>
                </View>)
            }
            }
            if(index == network.dayNames.length - 1){
                // В конце всех дней секции выводим итоговую верстку с кнопками переключения на другие секции
                if(network.sectionNames[i] == network.user?.preference){
                    menuBody.unshift(
                    <View style={{width:common.getLengthByIPhone7()}}
                        key={network.sectionNames[i]}>
                            {sectionBlock}
                        <ChangeMenuBtn title={network.sectionNames[0]} visible={network.sectionNames[0] != network.sectionNames[i]}
                            onPress={() => {
                                const ind = sectionNames.findIndex(item => item == network.sectionNames[0])
                                horScroll.current.scrollTo({x: ind * common.getLengthByIPhone7()})
                                mainScroll.current.scrollTo({y: tabsY})
                            }} />
                        <ChangeMenuBtn title={network.sectionNames[1]} visible={network.sectionNames[1] != network.sectionNames[i]}
                            onPress={() => {
                                const ind = sectionNames.findIndex(item => item == network.sectionNames[1])
                                horScroll.current.scrollTo({x: ind * common.getLengthByIPhone7()})
                                mainScroll.current.scrollTo({y: tabsY})
                            }} />
                        <ChangeMenuBtn title={network.sectionNames[2]} visible={network.sectionNames[2] != network.sectionNames[i]}
                            onPress={() => {
                                const ind = sectionNames.findIndex(item => item == network.sectionNames[2])
                                horScroll.current.scrollTo({x: ind * common.getLengthByIPhone7()})
                                mainScroll.current.scrollTo({y: tabsY})
                            }} />
                    </View>
                )
                } else {
                    menuBody.push(
                        <View style={{width:common.getLengthByIPhone7()}}
                            key={network.sectionNames[i]}>
                            {sectionBlock}
                            <ChangeMenuBtn title={network.sectionNames[0]} visible={network.sectionNames[0] != network.sectionNames[i]}
                                onPress={() => {
                                    const ind = sectionNames.findIndex(item => item == network.sectionNames[0])
                                    horScroll.current.scrollTo({x: ind * common.getLengthByIPhone7()})
                                    mainScroll.current.scrollTo({y: tabsY})
                                }} />
                            <ChangeMenuBtn title={network.sectionNames[1]} visible={network.sectionNames[1] != network.sectionNames[i]}
                                onPress={() => {
                                    const ind = sectionNames.findIndex(item => item == network.sectionNames[1])
                                    horScroll.current.scrollTo({x: ind * common.getLengthByIPhone7()})
                                    mainScroll.current.scrollTo({y: tabsY})
                                }} />
                            <ChangeMenuBtn title={network.sectionNames[2]} visible={network.sectionNames[2] != network.sectionNames[i]}
                                onPress={() => {
                                    const ind = sectionNames.findIndex(item => item == network.sectionNames[2])
                                    horScroll.current.scrollTo({x: ind * common.getLengthByIPhone7()})
                                    mainScroll.current.scrollTo({y: tabsY})
                                }} />
                        </View>)
                }
            }
        }
    }

    //! Анимация индикатора скролла
    const scrollX = useRef(new Animated.Value(0)).current
    const [translateX, setTranslateX] = useState(0)
    const [scaleX, setScaleX] = useState(0)
    const addCoords = (name,width,x) => {
        let newObj = secsWidth
        if(width){
            newObj[name] = {width,x}
            setTimeout(() => {
                setSecsWidth(newObj)
            }, 100);
        }
        if(Object.keys(newObj).length == 3){
            setTranslateX(scrollX.interpolate({
                inputRange:[
                    screenWidth*0,screenWidth*1,screenWidth*2
                ],
                outputRange:[
                    newObj[sectionNames[0]]?.x,
                    newObj[sectionNames[1]]?.x,
                    newObj[sectionNames[2]]?.x
                ],
                extrapolate:'extend',
            }))
            setScaleX(scrollX.interpolate({
                inputRange:[
                    screenWidth*0,screenWidth*1,screenWidth*2
                ],
                outputRange:[
                    newObj[sectionNames[0]]?.width,
                    newObj[sectionNames[1]]?.width,
                    newObj[sectionNames[2]]?.width
                ],
                extrapolate:'extend',
            }))
        }
    }

    //! Сторисы
    const [stop, setStop] = useState(true)
    const [currentStory, setCurrentStory] = useState(0)
    const [storiesModal, setStoriesModal] = useState(false)

    const openStory = async (i) => {
        await setStop(false)
        setCurrentStory(i)
        setStoriesModal(true)
    }

    const storiesBody = []
    for (let i = 0; i < network.stories.length; i++) {
        storiesBody.push(
          // <View style={{opacity:network.stories[i].viewed ? 0.5 : 1}}>
          <TouchableOpacity
            onPress={() => openStory(i)} key={network.stories[i].id}
          >
          <FastImage source={{uri: network.stories[i].image}} style={{
              width:common.getLengthByIPhone7(108),
              height:common.getLengthByIPhone7(108),
             backgroundColor:'#FFF',marginRight:9,justifyContent:'flex-end',borderRadius:16,
             paddingHorizontal:6,paddingBottom:9}} borderRadius={16}>
               {network.stories[i].viewed ? null :
               <View style={{width:14,height:14,backgroundColor:'#FFF',borderRadius:7,position:'absolute',right:1,top:1,
                    justifyContent:'center',alignItems:'center'}}>
                   <View style={{width:8,height:8,borderRadius:4,backgroundColor:Colors.yellow}} />
                </View> 
               }
          </FastImage>
          </TouchableOpacity>
          // </View>
        )
      }

    useEffect(() => {
        const onFocus = navigation.addListener('focus', () => {
            if(Platform.OS == 'ios'){
                StatusBar.setBarStyle('dark-content', true);
            } else {
                StatusBar.setBackgroundColor('#FFF', true);
                StatusBar.setBarStyle('dark-content', true);
                StatusBar.setTranslucent(false)
            }
        });
        return onFocus;
    }, [navigation]);

    useFocusEffect(
        React.useCallback(() => {
          const onBackPress = () => {
            backAction()
            return true;
          };
    
          BackHandler.addEventListener('hardwareBackPress', onBackPress);
          changeNavigationBarColor('#F5F5F5',true);
          return () =>
            BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, []),
    );
      
    return (
        <>
        <View style={{backgroundColor:'#FFF',flex:1}}>
            {Platform.OS == 'ios' ?
            <SafeAreaView style={{backgroundColor:'#FFF',height:getStatusBarHeight()}} /> : 
            <SafeAreaView style={{backgroundColor:'#FFF'}} />}
            {header}
            <ScrollView 
                showsVerticalScrollIndicator={false} style={{flex:1}} 
                scrollEventThrottle={16}
                contentContainerStyle={{paddingBottom:30}} 
                stickyHeaderIndices={[getStickyHeader()]}
                ref={mainScroll}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{paddingLeft:16,
                    marginTop:16,paddingRight:7}}>
                    {storiesBody}
                </ScrollView>
                {Object.keys(network.banner1).length && network.user?.banner_hide.findIndex(item => item == network.banner1?.type) == -1 ? 
                <TouchableOpacity style={{marginTop:20}} activeOpacity={1} 
                    onPress={() => bannerHandler(network.banner1)}>
                <ImageBackground 
                    style={{paddingHorizontal:16,marginHorizontal:16,paddingVertical:19,borderRadius:16,minHeight:80,paddingTop:22}} 
                    borderRadius={16}
                    source={{uri:network.banner1?.image_btn?.big_webp}}
                >
                    <Text style={styles.addsTitle}>{network.banner1?.title_on_btn}</Text>
                </ImageBackground>
                </TouchableOpacity> : null}
                <View style={{marginTop:38,flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:16}}>
                    <Text style={styles.subtitle}>Рецепты дня</Text>
                    <TouchableHighlight underlayColor={'#EEEEEE'} style={{borderRadius:16,backgroundColor:'#F5F5F5'}}
                        onPress={() => navigation.navigate('SecondReceptDayScreen',{from:'menu'})}>
                        <View style={styles.receptDaysBtn}>
                        <Text style={[styles.timeText,{marginBottom:0,marginRight:4}]} allowFontScaling={false}>Открыть</Text>
                        <Image source={require('../../assets/icons/goDown.png')} style={{width:13,height:8,marginTop:5,transform:[{rotate:'-90deg'}]}} />
                        </View>
                    </TouchableHighlight>
                </View>
                <FlatList
                    showsHorizontalScrollIndicator={false} horizontal
                    contentContainerStyle={{paddingLeft:16,paddingBottom:32,paddingTop:16,paddingRight:6}}
                    data={network.dayDishes}
                    extraData={network.dayDishes}
                    keyExtractor={(item, index) => index} 
                    scrollEventThrottle={16}
                    pagingEnabled={true}
                    decelerationRate={Platform.select({ ios: 'fast', android: 0.8})}
                    snapToInterval={common.getLengthByIPhone7(0)-common.getLengthByIPhone7(32)}
                    disableIntervalMomentum={true}
                    snapToAlignment={"center"}
                    snapToOffsets={dayRecipeScreens}
                    renderItem={({item,index}) => <DayRecipeCard recept={item} onPress={() => openRec(item)} 
                        listHandler={(isInList,recept) => listHandler(isInList,recept)} key={item.id}/> }
                />
                {Object.keys(network.banner2).length && network.user?.banner_hide.findIndex(item => item == network.banner2?.type) == -1  ? 
                <TouchableOpacity activeOpacity={1} onPress={() => bannerHandler(network.banner2)}>
                <ImageBackground 
                        source={{uri:network.banner2?.image_btn?.big_webp}}
                        style={{paddingHorizontal:16,marginHorizontal:16,paddingVertical:19,minHeight:80,paddingTop:22}}
                        borderRadius={16}
                >
                    <Text style={styles.addsTitle}>{network.banner2?.title_on_btn}</Text>
                </ImageBackground>
                </TouchableOpacity> : null}
                <View style={{marginTop:38,flexDirection:'row',alignItems:'center',paddingLeft:16,marginBottom:8}}>
                    <Text style={styles.subtitle}>Меню на неделю</Text>
                    <TouchableOpacity style={{paddingHorizontal:16,height:26,justifyContent:'center'}} 
                        activeOpacity={1}
                        onPress={() => setFilterModal(true)}>
                        {currentFilters.length == 0 || currentFilters.length == 5 ? null :
                        <View style={{width:10,height:10,borderRadius:10,backgroundColor:'#FFF',position:'absolute',top:3,right:11,justifyContent:'center',alignItems:'center',zIndex:10}}>
                            <View style={{width:6,height:6,borderRadius:3,backgroundColor:Colors.yellow,position:'absolute',}} />
                        </View>
                        }
                        <Image source={require('../../assets/icons/filter.png')} style={{width:20,height:19,top:1}} />
                    </TouchableOpacity>
                </View>
                <View style={{marginBottom:20}} onLayout={(e) => setTabsY(e.nativeEvent.layout.y)}>
                <View style={{flexDirection:'row',justifyContent:'space-around',backgroundColor:'#FFF'}}>
                    {sections}
                </View>
                <View>
                <Animated.View style={{
                    width:scaleX, height:4,
                    backgroundColor:Colors.yellow,
                    position:'absolute',bottom:0,
                    // borderRadius:20,
                    borderTopRightRadius:2,
                    borderTopLeftRadius:2,
                    transform:[{translateX}]}}
                />
                </View>
                </View>
                <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} ref={horScroll}
                    bounces={false}
                    scrollEventThrottle={16}
                    pagingEnabled={true}
                    decelerationRate={Platform.select({ ios: 'fast', android: 0.8})}
                    snapToInterval={common.getLengthByIPhone7(0)-common.getLengthByIPhone7(32)}
                    disableIntervalMomentum={true}
                    snapToAlignment={"center"}
                    // style={{flex:1,}}
                    contentContainerStyle={{flexGrow:1}}
                    snapToOffsets={screens}
                    onScroll={Animated.event(
                        [{nativeEvent: {contentOffset: {x: scrollX}}}],
                        {listener:(event) => {
                            // let newPage = Math.round((event.nativeEvent.contentOffset.x/screenWidth).toFixed(1))
                            // if(page != newPage){
                            //     setTimeout(() => {
                            //         setPage(newPage)
                            //     }, 100);
                            // }
                        },useNativeDriver:false},
                    )}
                >
                    {menuBody}
                </Animated.ScrollView>
            </ScrollView>
            {network.listDishes.length ? 
            <BottomListBtn navigation={navigation} /> : null}
            <FilterModal modal={filterModal} closeModal={() => setFilterModal(false)} allFilters={filterNames} currentFilters={currentFilters}
                applyFilters={(filtersArr) => {
                    filterHandler(filtersArr,currentWeek)
                    setFilterModal(false)
                }}
            />
            <ChangeWeeksModal modal={weeksModal} closeModal={() => setWeeksModal(false)} currentWeek={currentWeek}
                onPress={(name) => {
                    setCurrentWeek(name)
                    setWeeksModal(false)
                    if(name == 'Текущая'){
                        setFilteredMenu(network.allDishes)
                    } else {
                        setFilteredMenu(network.oldMenu)
                    }
                    filterHandler(currentFilters,name)
                }} />
            <StoriesModal modal={storiesModal} closeModal={() => setStoriesModal(false)} navigation={navigation}
                currentPage={currentStory} setCurrentPage={setCurrentStory} stop={stop} setStop={setStop} />
        </View>
        </>
    )
})

export default MenuScreen

const styles = StyleSheet.create({
    header:{
        height:Platform.select({ios:44, android:80 - StatusBar.currentHeight}),
        alignItems:'center',
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:'#FFF',
    },
    headerTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:16,
        lineHeight:19,fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        color:Colors.textColor,
        // bottom:4,
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
    dayTitle:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Regular' }), fontSize:18,
        lineHeight:21,fontWeight:Platform.select({ ios: '800', android: 'bold' }),
        color:Colors.textColor,marginBottom:10,marginTop:21,marginLeft:16
    },
    timeText:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Medium' }), fontSize:14,
        fontWeight:'500',
        lineHeight:17,
        color:Colors.textColor
    },
    normalDots:{
        height:8,
        borderRadius:4
    },
    receptDaysBtn:{
        paddingHorizontal:11,
        paddingVertical:6,
        justifyContent:'center',
        flexDirection:'row',
        // alignItems:"center",
        flexWrap:'wrap',
        
        borderRadius:16,
    },
})
