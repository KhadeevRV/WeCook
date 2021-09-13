import React from 'react';
import {observable} from 'mobx';
import * as mobx from 'mobx';
import {AsyncStorage, Platform,Alert} from 'react-native';
import Config from '../src/constants/Config';
import Rate, { AndroidMarket } from 'react-native-rate';
import { getUniqueId } from 'react-native-device-info';

class Network {

    ingredients = [];
    allDishes = [];
    dayDishes = [];
    fromSplash = false;
    onboarding = {};
    deviceId = null;
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
    paywalls = {}
    
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
        let uniqueId = getUniqueId();
        this.deviceId = uniqueId
    }

    addToList(dish){
        const newArr = [dish,...this.listDishes]
        this.listDishes = newArr
        listAdd(dish?.id)
    }
    deleteFromList(dish){
        const newArr = this.listDishes.filter((item) => item.id != dish.id)
        this.listDishes = newArr
        listRemove(dish?.id)
    }
    addToFavor(dish){
        let newDish = dish
        newDish['new'] = true
        const newArr = [newDish,...this.favorDishes]
        this.favorDishes = newArr
        favorHandler(dish.id,'add')
    }
    deleteFromFavor(dish){
        const newArr = this.favorDishes.filter((item) => item.id != dish.id)
        this.favorDishes = newArr
        favorHandler(dish.id,'remove')
    }

    canOpenRec(id) {
        if(this.dayDishes.filter(dish => dish.id == id).length || this.user?.access){
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
        if(listIndex != -1){
            const newDish = this.listDishes[listIndex]
            newDish.persons = persons
            this.listDishes.splice(listIndex,1,newDish)
        }
    }

    changeProfilePersons(persons){
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
        },
        body: JSON.stringify({"device_id" : network.deviceId}) 
        })
        .then(response =>{
        response.json().then(data => {
            console.warn('authUser: ' + JSON.stringify(data));
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
                    network.access_token = data.user.token
                    network.user = data.user
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
                const newItems = []
                for (let i = 0; i < data['PayWallScreen']?.plans.length; i++) {
                    const id = data['PayWallScreen']?.plans[i].id
                    newItems.push(id)
                }
                mobx.runInAction(() => {
                    network.onboarding = data
                })
                resolve(newItems) 
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
            if (data.id) {
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
            }else if(data?.token && what == 'phone'){
                resolve(data.token)
            } else {     
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