import React from 'react';
import {observable} from 'mobx';
import * as mobx from 'mobx';
import {AsyncStorage, Platform,Alert} from 'react-native';
import Config from '../src/constants/Config';
import Rate, { AndroidMarket } from 'react-native-rate';
import { getUniqueId } from 'react-native-device-info';
import InAppReview from 'react-native-in-app-review';

class Network {

    ingredients = [];
    allDishes = [];
    dayDishes = [];
    fromSplash = false;
    onboarding = {};
    deviceId = null;
    pushId = null;
    tokenType = '';
    access_token = null;
    user = {};
    sectionNames = []
    dayNames = []
    listDishes = []
    favorDishes = []
    oldMenu = []
    stories = []
    banner1 = {}
    banner2 = {}
    Allstories = []
    additionMenu = []
    history = []
    paywalls = {}
    receptCount = 0
    screenDate = new Date()
    
    getSectionsAndDayDishes(arr) {
        const newDays = []
        const allSections = []
        const newDayNames = []
        for (let i = 0; i < arr.length; i++) {
            if(new Date(arr[i]?.recipe_of_day).toLocaleDateString() == new Date().toLocaleDateString()){
            // if(arr[i]?.recipe_of_day == 1626998400000){
                newDays.push(arr[i])
            }
            newDayNames.push(arr[i].day_name)
            allSections.push(arr[i].section_name)
        }
        this.dayDishes = newDays
        this.sectionNames = allSections.filter((value, index, self) => self.indexOf(value) === index)
        this.dayNames = newDayNames.filter((value, index, self) => self.indexOf(value) === index)
    }

    setUniqueId(){
        let uniqueId = getUniqueId()
        this.deviceId = uniqueId
    }

    addToList(dish){
        const newArr = [dish,...this.listDishes]
        this.listDishes = newArr
        listAdd(dish?.id)
        // добавляем блюдо в историю
        let historyDish = dish
        historyDish.history_date = Date.now()
        const histIndex = this.history.findIndex(item => item.id == dish.id)
        // Проверяем, не добавлено ли оно уже сегодня и есть ли оно вообще
        if(histIndex == -1 || new Date(this.history[histIndex]?.history_date).toLocaleDateString() != new Date().toLocaleDateString()){
            this.history.unshift(historyDish)
        }
    }

    deleteFromList(dish){
        const newArr = this.listDishes.filter((item) => item.id != dish.id)
        this.listDishes = newArr
        listRemove(dish?.id)
    }

    addToFavor(dish,navigation){
        if(!this.user.access && this.favorDishes.length > 6){
            return Alert.alert(Config.appName,'Вы достигли ограничения в 7 рецептов в разделе избранное. Вы можете открыть полный доступ или удалить другие рецепты из любимого.',[{
                text:'Открыть полный доступ',
                onPress:() => navigation.navigate('PayWallScreen',{data:this.paywalls[this.user?.banner?.type]})
            },{
                text:'Отменить',
                style:'cancel'
            }])
        }
        let newDish = dish
        const newArr = [newDish,...this.favorDishes]
        newDish['new'] = true
        this.favorDishes = newArr
        newArr.length == 2 ? this.user['favorTrigger'] = true : null
        favorHandler(dish.id,'add')
    }

    deleteFromFavor(dish){
        const newArr = this.favorDishes.filter((item) => item.id != dish.id)
        this.favorDishes = newArr
        favorHandler(dish.id,'remove')
    }

    canOpenRec(id) {
        if(this.dayDishes.filter(dish => dish.id == id).length || this.user?.access || this.listDishes.filter(dish => dish.id == id).length || this.favorDishes.filter(dish => dish.id == id).length){
            return true
        } else {
            return false
        }
    }

    changePersons(id,persons){
        const menuIndex = this.allDishes.findIndex((item) => item.id == id)
        const oldMenuIndex = this.oldMenu.findIndex((item) => item.id == id)
        const favorIndex = this.favorDishes.findIndex((item) => item.id == id)
        const listIndex = this.listDishes.findIndex((item) => item.id == id)
        menuIndex != -1 ? this.allDishes[menuIndex].persons = persons : null
        oldMenuIndex != -1 ? this.oldMenu[oldMenuIndex].persons = persons : null
        favorIndex != -1 ? this.favorDishes[favorIndex].persons = persons : null
        setRecipePersons(id,persons)
        if(listIndex != -1){
            const newDish = this.listDishes[listIndex]
            newDish.persons = persons
            this.listDishes.splice(listIndex,1,newDish)
        }
    }

    changeProfilePersons(persons){
        this.user.persons = persons
        for (let i = 0; i < this.allDishes.length; i++) {
            this.allDishes[i].persons = persons
        }
        for (let i = 0; i < this.oldMenu.length; i++) {
            this.oldMenu[i].persons = persons
        }
        for (let i = 0; i < this.favorDishes.length; i++) {
            this.favorDishes[i].persons = persons
        }
        for (let i = 0; i < this.listDishes.length; i++) {
            this.listDishes[i].persons = persons
        }
    }

    rateApp(what){
        let trigger = false
        if(what == 'recept'){
            this.receptCount = this.receptCount + 1
            this.receptCount == 5 || this.user?.favorTrigger ? trigger = true : null
        }
        let registerDate = new Date(this.user?.created_at)
        let t2 = registerDate.getTime()
        let t1 = new Date().getTime()
        const days = parseInt((t1-t2)/(24*3600*1000))
        if(days > 3 && trigger && this.user?.show_feedback_alert){
            setTimeout(() => {                
                Alert.alert(Config.appName,'Нравится приложение?',[{
                    text:'Да',
                    onPress: () => {
                        let options = {
                            AppleAppID:"1577136146",
                            GooglePackageName:"app.wecook",
                            OtherAndroidURL:"http://www.randomappstore.com/app/47172391",
                            preferredAndroidMarket: AndroidMarket.Google,
                            preferInApp:false,
                            openAppStoreIfInAppFails:true,
                            fallbackPlatformURL:"http://www.mywebsite.com/myapp.html",
                        }
                    Rate.rate(options, (success)=>{
                        if (success) {
                            fetch(Config.apiDomain + `user/alerts/feedback/off`,{
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization':'Bearer ' + network.access_token,
                                },
                            })
                            console.warn('disableAlert()')
                            this.user.show_feedback_alert = false
                        }
                    })
                    }},{
                    text:'Нет',
                    style:'cancel'
                }])
            }, 1500);
        }
    }
   
  constructor(props) {
    // super(props)
    mobx.makeAutoObservable(this)
    this.props = props
    mobx.autorun(() => {});
  }
}

const network = new Network();
export default network;


export function authUser() {

    return new Promise(function(resolve,reject){
        fetch(Config.apiDomain + `auth/login`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({"device_id" : network.deviceId,"push_id":network.pushId}) 
        })
        .then(response =>{
        response.json().then(data => {
            console.warn('authUser: ' + network.deviceId + JSON.stringify(data));
            if (data.token) {
                AsyncStorage.setItem('token',data.token)
                mobx.runInAction(() => {
                    network.user = data
                    network.access_token = data.token
                })
                AsyncStorage.setItem('token',data.token)
                resolve()
            }else {
                reject()
            }
        })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function getMenu() {
    return new Promise(function(resolve,reject){
        // fetch(Config.apiDomain + 'menu/week',{
        fetch(Config.apiDomain + 'screens/main',{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':'Bearer ' + network.access_token,
            'Accept': 'application/json',
        },
        })
        .then(response =>{
            response.json().then(data => {
            console.warn('getMenu: ' + JSON.stringify(data));
            if (data.status == 'ok') {
                mobx.runInAction(() => {
                    // network.access_token = data.user.token
                    // network.user = data.user
                    network.allDishes = data.menu
                    network.listDishes = data?.list
                    network.oldMenu = data?.menu_old
                    network.stories = data?.stories
                    network.banner1 = data?.banner_1
                    network.banner2 = data?.banner_2
                    network.paywalls = data?.paywalls
                    const storiesArr = []
                    for (let i = 0; i < data.stories.length; i++) {
                        storiesArr.push(data.stories[i].stories)
                    }
                    network.Allstories = storiesArr
                })
                network.getSectionsAndDayDishes(data.menu)
                resolve() 
            }
            else {     
                reject(data.error)
            }
        })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function getScreens() {
    return new Promise(function(resolve,reject){
        fetch(Config.apiDomain + 'screens/onbording',{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization':'Bearer ' + network.access_token
        },
        })
        .then(response =>{
            response.json().then(data => {
            console.warn('getScreens: ' + JSON.stringify(data));
            if (data) {
                mobx.runInAction(() => {
                    network.onboarding = data
                })
                resolve() 
            }
            else {     
                reject(data.error)
            }
        })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function getTariffs() {
    return new Promise(function(resolve,reject){
        fetch(Config.apiDomain + 'plans',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization':'Bearer ' + network.access_token
        },
        })
        .then(response =>{
            response.json().then(data => {
            console.warn('getTariffs: ' + JSON.stringify(data));
            if (data.length) {
                resolve(data) 
            }
            else {     
                reject(data.error)
            }
        })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function sendAnswer(url,form,answer,name,preference,persons,phone) {
    console.warn(JSON.stringify({"device_id" : network.deviceId,form,answer,name,phone,preference,persons}) )
    return new Promise(function(resolve,reject){
        fetch(url,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':'Bearer ' + network.access_token
        },
        body: JSON.stringify({"device_id" : network.deviceId,form,answer,name,phone,preference,persons}) 
        })
        .then(response =>{
            response.json().then(data => {
            console.warn('sendAnswer: ' + JSON.stringify(data));
            if (data) {
                resolve() 
            }
            else {     
                reject(data.error)
            }
        }).catch(err =>{
            console.warn(err);
            reject();
            })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function payAppleOrAndroid(receipt) {
    const body = Platform.OS == 'ios' ? 
        JSON.stringify({"token":network.access_token,"receipt":receipt.transactionReceipt}) : 
        JSON.stringify({"token":network.access_token,"receipt":receipt})  
    return new Promise(function(resolve,reject){
        fetch(Config.apiDomain + `purchase/order/${Platform.OS}`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Accept":'application/json'
        },
        body: body
        })
        .then(response =>{
            response.json().then(data => {
            console.warn('payApple: ' + JSON.stringify(data));
            if (data.status == 'ok') {
                resolve()
            }
            else {     
                reject()
            }
        }).catch(err => console.warn(err, response))
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function listAdd(id) {
    console.warn('listAdd',id)
    return new Promise(function(resolve,reject){
        fetch(Config.apiDomain + `list/add`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':'Bearer ' + network.access_token
        },
        body: JSON.stringify({"recipe" : id}) 
        })
        .then(response =>{
            response.json().then(data => {
            console.warn('listAdd: ' + JSON.stringify(data));
            if (data.status == 'ok') {
                resolve() 
            }
            else {     
                reject(data.error)
            }
        }).catch(err =>{
            console.warn(err);
            reject();
            })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function listRemove(id) {
    console.warn('listRemove',id)
    return new Promise(function(resolve,reject){
        fetch(Config.apiDomain + `list/remove`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':'Bearer ' + network.access_token
        },
        body: JSON.stringify({"recipe" : id}) 
        })
        .then(response =>{
            response.json().then(data => {
            console.warn('listRemove: ' + JSON.stringify(data));
            if (data.status == 'ok') {
                resolve() 
            }
            else {     
                reject(data.error)
            }
        }).catch(err =>{
            console.warn(err);
            reject();
            })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function listClear() {
    return new Promise(function(resolve,reject){
        fetch(Config.apiDomain + `list/clear`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':'Bearer ' + network.access_token
        },
        })
        .then(response =>{
            response.json().then(data => {
            console.warn('listClear: ' + JSON.stringify(data));
            if (data.status == 'ok') {
                resolve() 
            }
            else {     
                reject(data.error)
            }
        }).catch(err =>{
            console.warn(err);
            reject();
            })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function getHistory(page=1) {
    console.warn('page',page)
    return new Promise(function(resolve,reject){
        fetch(Config.apiDomain + `list/history?page=${page}`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization':'Bearer ' + network.access_token
        },
        })
        .then(response =>{
            response.json().then(data => {
            console.warn('getHistory: ' + JSON.stringify(data));
            if (data.data) {
                mobx.runInAction(() => {
                    if(page == 1){
                        network.history = data.data
                    } else if(data.data.length) {
                        // Производим сортировку чтобы проверить, есть ли повторяющиеся блюда с одной и той же датой
                        for (let i = 0; i < data.data.length; i++) {
                            const newDish = data.data[i]
                            const alreadyHave = network.history.filter(item => item.id == newDish.id)
                            let needToAdd = true
                            for (let i = 0; i < alreadyHave.length; i++) {
                                new Date(newDish.history_date).toLocaleDateString() == new Date(alreadyHave[i]?.history_date).toLocaleDateString() ? needToAdd = false : null
                            }
                            needToAdd ? network.history.push(newDish) : null
                        }
                    }
                })
                data.links.next ? resolve(true) : resolve(null)
            }
            else {     
                reject(data.error)
            }
        }).catch(err =>{
            console.warn(err);
            reject();
            })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function updateInfo(what,value) {
    let formdata = new FormData();
        formdata.append(what, value)
    console.warn('object',formdata)
    return new Promise(function(resolve,reject){
        fetch(Config.apiDomain + `user/update`,{
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization':'Bearer ' + network.access_token,
            'Accept': "application/json"
        },
        body:formdata
        })
        .then(response =>{
            response.json().then(data => {
            console.warn('updateInfo: ' + JSON.stringify(data));
            if (data?.status != 'error') {
                resolve() 
            }
            // else if(data?.token && what == 'phone'){
            //     resolve(data.token)
            // } 
            else {     
                reject(data.message)
            }
        }).catch(err =>{
            console.warn(err);
            reject();
            })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function ingredientHandler(id,action) {
    console.warn(id,action)
    let formdata = new FormData();
        formdata.append('ingredient', id)
        formdata.append('action', action)
    return new Promise(function(resolve,reject){
        fetch(Config.apiDomain + `list/buy`,{
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization':'Bearer ' + network.access_token,
            'Accept': "application/json"
        },
        body:formdata
        })
        .then(response =>{
            response.json().then(data => {
            console.warn('ingredientHandler: ' + JSON.stringify(data));
            if (data) {
                resolve() 
            }
            else {     
                reject(data.error)
            }
        }).catch(err =>{
            console.warn(err);
            reject();
            })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function getFavors() {
    return new Promise(function(resolve,reject){
        fetch(Config.apiDomain + `favorites`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':'Bearer ' + network.access_token
        },
        })
        .then(response =>{
            response.json().then(data => {
            console.warn('getFavors: ' + JSON.stringify(data));
            if (data) {
                mobx.runInAction(() => {
                    network.favorDishes = data
                })
                resolve() 
            }
            else {     
                reject(data.error)
            }
        }).catch(err =>{
            console.warn(err);
            reject();
            })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function favorHandler(id,action) {
    const url = Config.apiDomain + `favorites/${action}`
    let formdata = new FormData();
        formdata.append('recipe', id)
    return new Promise(function(resolve,reject){
        fetch(url,{
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization':'Bearer ' + network.access_token,
            'Accept': "application/json"
        },
        body:formdata
        })
        .then(response =>{
            response.json().then(data => {
            console.warn('favorHandler: ',action,JSON.stringify(data));
            if (data) {
                resolve() 
            }
            else {     
                reject(data.error)
            }
        }).catch(err =>{
            console.warn(err);
            reject();
            })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function getUserInfo() {

    return new Promise(function(resolve,reject){
        fetch(Config.apiDomain + `user/info`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':'Bearer ' + network.access_token,
            'Accept': "application/json"
        },
        })
        .then(response =>{
        response.json().then(data => {
            console.warn('getUserInfo: ' + JSON.stringify(data));
            if (data.token) {
                mobx.runInAction(() => {
                    network.user = data
                    network.access_token = data.token
                })
                AsyncStorage.setItem('token',data.token)
                resolve()
            }else {
                reject()
            }
        })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function getCode(phone) {

    return new Promise(function(resolve,reject){
        fetch(Config.apiDomain + `user/sendcode`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':'Bearer ' + network.access_token,
            'Accept': "application/json"
        },
        body:JSON.stringify(phone)
        })
        .then(response =>{
        response.json().then(data => {
            console.warn('getCode: ' + JSON.stringify(data));
            if (data.status == 'Ok') {
                resolve()
            }else {
                reject(data.message)
            }
        })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function sendCode(phone,code) {
    console.warn(JSON.stringify({code,phone}))
    return new Promise(function(resolve,reject){
        fetch(Config.apiDomain + `user/verifycode`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization':'Bearer ' + network.access_token,
            'Accept': "application/json"
        },
        body:JSON.stringify({code,phone})
        })
        .then(response =>{
        response.json().then(data => {
            console.warn('sendCode: ' + JSON.stringify(data));
            if (data.status == 'ok') {
                resolve()
            } else {
                reject(data.message)
            }
        })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function getRecipe(url) {
    return new Promise(function(resolve,reject){
        fetch(url,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization':'Bearer ' + network.access_token
        },
        })
        .then(response =>{
            response.json().then(data => {
            console.warn('getRecipe: ' + JSON.stringify(data));
            if (data.status == 'ok') {
                resolve(data.data) 
            }
            else {     
                reject(data.error)
            }
        })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function getSocials() {
    return new Promise(function(resolve,reject){
        fetch(Config.apiDomain + `for-contacts`,{
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization':'Bearer ' + network.access_token
        },
        })
        .then(response =>{
            response.json().then(data => {
            console.warn('getSocials: ' + JSON.stringify(data));
            if (data.status == 'ok') {
                resolve(data.data) 
            }
            else {     
                reject(data.message)
            }
        })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function setRecipePersons(recipe_id,perons) {
    return new Promise(function(resolve,reject){
        fetch(Config.apiDomain + `recipes/${recipe_id}/set-person`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization':'Bearer ' + network.access_token
        },
        body:JSON.stringify({perons})
        })
        .then(response =>{
            response.json().then(data => {
            console.warn('getSocials: ' + JSON.stringify(data));
            if (data.status == 'ok') {
                resolve(data.data) 
            }
            else {     
                reject(data.message)
            }
        })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}

export function iSeeYourDaddy(id) {
    return new Promise(function(resolve,reject){
        fetch(Config.apiDomain + `stories/viewed/${id}`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        })
        .then(response =>{
            response.json().then(data => {
            console.warn('iSeeYourDaddy: ' + JSON.stringify(data));
            if (data.status == 'ok') {
                resolve()
            }
            else {     
                reject()
            }
        })
        })
        .catch(err =>{
        console.warn(err); 
        reject('Unknown error.Try again later.');
        })
    })
}

export function getShortLink(link) {
    console.warn('oldLink',link)
    return new Promise(function(resolve,reject){
        fetch(Config.apiDomain + `generate-short-link`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization':'Bearer ' + network.access_token
        },
        body:JSON.stringify({link})
        })
        .then(response =>{
            response.json().then(data => {
            console.warn('getShortLink: ' + JSON.stringify(data));
            if (data.status == 'ok') {
                resolve(data.link) 
            }
            else {     
                reject(data.message)
            }
        })
        })
        .catch(err =>{
        console.warn(err);
        reject('Unknown error.Try again later.');
        })
    })
}