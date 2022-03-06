import React, {useState} from 'react'
import { StyleSheet, Text, View,SafeAreaView, ImageBackground, Dimensions, Image, Platform,TouchableOpacity,TouchableHighlight } from 'react-native'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import common from '../../../Utilites/Common'
import { getStatusBarHeight, getBottomSpace } from 'react-native-iphone-x-helper'
import Colors from '../../constants/Colors'
import { BlurView } from '@react-native-community/blur'
import LinearGradient from 'react-native-linear-gradient'
import FastImage from 'react-native-fast-image'
import { observer } from 'mobx-react-lite'
import network from '../../../Utilites/Network'

const ImageView = ({uri,onPress,vertical}) => {
    return (
    <TouchableOpacity onPress={() => onPress()} activeOpacity={1}>
        <LinearGradient 
            colors={['rgba(0, 0, 0, 0)', `rgba(0, 0, 0,.4)`]} 
            style={{width:'100%',height:100,position:'absolute',zIndex:100,bottom:0}}
        />
        <FastImage source={{uri}}
                style={{width:vertical ? common.getLengthByIPhone7() - 32 : common.getLengthByIPhone7(304),
                height:vertical ? 192 : 176
            }}
        />
        {/* {Platform.OS == 'ios' ? 
        <FastImage source={{uri}}
                style={{width:vertical ? common.getLengthByIPhone7() - 32 : common.getLengthByIPhone7(304),
                height:vertical ? 192 : 176
            }}
        />
        : <Image source={{uri}} resizeMethod={'resize'}
        style={{width:vertical ? common.getLengthByIPhone7() - 32 : common.getLengthByIPhone7(304),
                height:vertical ? 192 : 176
            }}/>} */}
    </TouchableOpacity>
    )
}

// recept - сам рецепт, onPress - нажатие на рецепт, listHandler - хендлер нажатия на иконку списка,если vertical false - рецепты дня

const DayRecipeCard = observer(({recept,onPress,listHandler,vertical=false}) => {

    const [page, setPage] = useState(0)
    const isInList = !!network.listDishes.filter((item) => item.id == recept.id).length

    const addToListBtn = [
        <View style={{position:'absolute',zIndex:2000,top:10,right:10}}>
        <TouchableOpacity style={{width:36,height:36,borderRadius:18,
            justifyContent:'center',alignItems:'center',
            backgroundColor:Platform.select({ ios: null, android: '#E5E5E5' }),
            overflow:'hidden'}} onPress={() => listHandler(isInList,recept)} activeOpacity={1}>
            <>
            {Platform.OS == 'ios' ?
            <BlurView 
                style={{
                position: "absolute",
                top: 0,left: 0,bottom: 0,right: 0,
                borderRadius:17,
                }}
                blurType="xlight"
                blurAmount={24}
                blurRadius={24}
                reducedTransparencyFallbackColor={'#FFF'}
            /> : null}
            {network.canOpenRec(recept.id) ? 
            <Image source={require('../../../assets/icons/list.png')} style={{width:18,height:22}} />
            :
            <Image source={require('../../../assets/icons/lock.png')} style={{width:22,height:22}} />}
            </>
        </TouchableOpacity>
        </View>
    ]

    const deleteFomListBtn = [
        <View style={{position:'absolute',zIndex:2000,top:10,right:10}}>
        <TouchableHighlight style={{width:36,height:36,borderRadius:18,
            justifyContent:'center',alignItems:'center',
            backgroundColor:Colors.yellow}} onPress={() => listHandler(isInList,recept)} underlayColor={Colors.underLayYellow}>
            <Image source={require('../../../assets/icons/complete.png')} style={{width:16,height:12}} />
        </TouchableHighlight>
        </View>
    ]
    const [refresh, setRefresh] = useState(false)
    const images = [<ImageView key={recept?.images?.id} uri={recept?.images?.middle_webp} vertical={vertical} onPress={() => onPress()} />]

    const dots = [<View style={{width:0 == page ? 12 : 4,height:4,borderRadius:4,backgroundColor:'#FFF',opacity:0 == page ? 1 : 0.5,marginRight:4}} key={123} />]
    const screens = []
    const stepsWithImage = recept?.steps.filter((step) => step?.images?.middle_webp)
    for (let i = 0; i < stepsWithImage.length; i++) {
        const step = stepsWithImage[i]
        i != 0 ? screens.push(i * (common.getLengthByIPhone7() - 32)) : null
        images.push(
            <ImageView key={step?.id} uri={step?.images?.big_webp} vertical={vertical} onPress={() => onPress()} />
        )
        dots.push(
            <View style={{width:i + 1 == page ? 12 : 4,height:4,borderRadius:4,backgroundColor:'#FFF',
                opacity:i + 1 == page ? 1 : 0.5,marginRight:4}} key={i} />
        )
    }
    return (
        <>
        <View style={{
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.06,
            shadowRadius: 4,
        }}>
        <TouchableOpacity onPress={() => onPress()} activeOpacity={1}
        style={{...styles.card,width:vertical ? '100%' : common.getLengthByIPhone7(304),
            marginBottom:vertical ? 20 : 0}}
            // onLayout={(e) => console.warn(e.nativeEvent.layout.height)}
        >
        <View 
            style={{
                width:'100%',
                height: vertical ? 192 : 176,
                justifyContent:'space-between'}} 
        >
            <View style={{borderTopRightRadius:16,borderTopLeftRadius:16,overflow:'hidden'}}>
            <FlatList 
                horizontal
                style={{width:'100%',borderTopRightRadius:16,borderTopLeftRadius:16,}}
                showsHorizontalScrollIndicator={false} scrollEnabled={vertical}
                bounces={false}
                scrollEventThrottle={16} removeClippedSubviews={Platform.OS === 'android'}
                pagingEnabled={true}
                decelerationRate={Platform.select({ ios: 'fast', android: 0.8})}
                snapToInterval={common.getLengthByIPhone7(0)-common.getLengthByIPhone7(32)}
                disableIntervalMomentum={true}
                snapToAlignment={"center"}
                snapToOffsets={screens}
                onScroll = {(e) => {
                    let newPage = Math.round((e.nativeEvent.contentOffset.x/(common.getLengthByIPhone7() - 32)).toFixed(1))
                    setTimeout(() => {
                        if(page != newPage){
                            setPage(newPage)
                        }
                    }, 100);
                }}
                data={images}
                initialNumToRender={2}
                renderItem={({item}) => item}
            />
                {/* {images}
            </FlatList> */}
            </View>
            {vertical ? 
            <View style={{position:'absolute',flexDirection:'row',zIndex:100,top:10,justifyContent:'center',width:'100%'}}>
                {dots.length > 1 ? dots : null}
            </View> : null}
            {isInList ? deleteFomListBtn : addToListBtn}
            <View 
                style={{
                    flexDirection:'row',alignItems:'center',left:16,
                    position:'absolute',bottom:12,zIndex:1,flexWrap:'wrap',
                }}
            >
                <Image style={{width:vertical ? 20 : 18,height:vertical ? 17 : 18}} source={vertical ? require('../../../assets/icons/hat.png') : require('../../../assets/icons/star.png')} />
                <Text style={styles.timeText}>{recept?.eating}{vertical ? '' : ' дня'}</Text>
                <Image style={{width:17,height:17,marginLeft:12}} source={require('../../../assets/icons/clock.png')} />
                <Text style={styles.timeText}>{recept?.cook_time} м.</Text>
                {recept?.labels?.keto ? 
                <>
                <Image style={{width:16,height:18,marginLeft:12}} source={require('../../../assets/icons/keto.png')} />
                <Text style={{...styles.timeText,color:'#D7FF95'}}>Кето</Text>
                </>
                :
                recept?.labels?.vegan ?
                <>
                <Image style={{width:17,height:17,marginLeft:12}} source={require('../../../assets/icons/vegan.png')} />
                <Text style={{...styles.timeText,color:Colors.greenColor}}>Вегетарианское</Text>
                </>
                :
                recept?.labels?.lowcarb ?
                <>
                <Image style={{width:16,height:16,marginLeft:12}} source={require('../../../assets/icons/lowcal.png')} />
                <Text style={{...styles.timeText,color:'#FFF495'}}>Безуглеводное</Text>
                </> : null}
            </View>
        </View>
        <View style={{height:vertical ? 64 : 56,justifyContent:'center'}}>
            <Text style={styles.title} numberOfLines={2}>
                {recept?.name}
            </Text>
        </View>
        </TouchableOpacity>
        </View>
        </>
    )
})

export default DayRecipeCard

const styles = StyleSheet.create({
    card:{
        backgroundColor:'#FFF',
        marginRight:10,borderRadius:16,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.04,
        shadowRadius: 8,elevation:10
    },
    title:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Medium' }), fontSize:14,
        fontWeight:'500',
        lineHeight:17,paddingHorizontal:16,
        color:Colors.textColor
    },
    timeText:{
        fontFamily:Platform.select({ ios: 'SF Pro Display', android: 'SFProDisplay-Medium' }), fontSize:13,
        lineHeight:18,
        fontWeight:'500',
        color:'#FFF',marginLeft:4
    }
})
