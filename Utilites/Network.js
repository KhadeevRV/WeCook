import React from 'react';
import {observable, runInAction} from 'mobx';
import * as mobx from 'mobx';
import {AsyncStorage, Platform, Alert} from 'react-native';
import Config from '../src/constants/Config';
import Rate, {AndroidMarket} from 'react-native-rate';
import {getUniqueId} from 'react-native-device-info';
import InAppReview from 'react-native-in-app-review';
import base64 from 'react-native-base64';
import {ampInstance} from '../App';
import LocalizedStrings from 'react-native-localization';

class Network {
  ingredients = [];
  allDishes = [];
  dayDishes = [];
  fromSplash = false;
  onboarding = {};
  registerOnboarding = {};
  deviceId = null;
  pushId = null;
  tokenType = '';
  access_token = null;
  user = {};
  sectionNames = [];
  dayNames = [];
  listDishes = [];
  favorDishes = [];
  oldMenu = [];
  stories = [];
  banner1 = {};
  banner2 = {};
  Allstories = [];
  additionMenu = [];
  history = [];
  paywalls = {};
  receptCount = 0;
  screenDate = new Date();
  isLoadingBasket = false;
  basketProducts = [];
  basketInfo = {};
  basketRecipes = [];
  basketAddRecipes = [];
  basketAddProducts = [];
  stores = [];
  isLoadingProduct = null;
  isLoadingBasketInfo = false;
  enableReceptDayScreen = false;
  userCards = [];
  currentCard = null;
  currentScreen = null;
  modals = [];
  products_count = [];
  unavailableRecipes = [];
  strings = {};
  userMap = '';
  priceDigits = 1;

  getSectionsAndDayDishes(arr) {
    const newDays = [];
    const allSections = [];
    const newDayNames = [];
    for (let i = 0; i < arr.length; i++) {
      if (
        new Date(arr[i]?.recipe_of_day).toLocaleDateString() ==
        new Date().toLocaleDateString()
      ) {
        // if(arr[i]?.recipe_of_day == 1626998400000){
        newDays.push(arr[i]);
      }
      newDayNames.push(arr[i].day_name);
      allSections.push(arr[i].section_name);
    }
    this.dayDishes = newDays;
    this.sectionNames = allSections.filter(
      (value, index, self) => self.indexOf(value) === index,
    );
    this.dayNames = newDayNames.filter(
      (value, index, self) => self.indexOf(value) === index,
    );
  }

  setUniqueId() {
    let uniqueId = getUniqueId();
    this.deviceId = uniqueId;
  }

  isBasketUser() {
    return network?.user?.work_type !== 'list';
  }

  addToList(dish) {
    const newArr = [dish, ...this.listDishes];
    this.listDishes = newArr;
    listAdd(dish?.id);
    // добавляем блюдо в историю
    let historyDish = dish;
    historyDish.history_date = Date.now();
    const histIndex = this.history.findIndex(item => item.id == dish.id);
    // Проверяем, не добавлено ли оно уже сегодня и есть ли оно вообще
    if (
      histIndex == -1 ||
      new Date(this.history[histIndex]?.history_date).toLocaleDateString() !=
        new Date().toLocaleDateString()
    ) {
      this.history.unshift(historyDish);
    }
  }

  deleteFromList(dish) {
    const newArr = this.listDishes.filter(item => item.id != dish.id);
    this.listDishes = newArr;
    listRemove(dish?.id);
  }

  async addToFavor(dish, navigation) {
    // if (!this.user.access && this.favorDishes.length > 6) {
    //   return Alert.alert(
    //     Config.appName,
    //     'Вы достигли ограничения в 7 рецептов в разделе избранное. Вы можете открыть полный доступ или удалить другие рецепты из любимого.',
    //     [
    //       {
    //         text: 'Открыть полный доступ',
    //         onPress: () =>
    //           navigation.navigate('PayWallScreen', {
    //             data: this.paywalls[this.user?.banner?.type],
    //           }),
    //       },
    //       {
    //         text: 'Отменить',
    //         style: 'cancel',
    //       },
    //     ],
    //   );
    // }
    try {
      let newDish = dish;
      const newArr = [newDish, ...this.favorDishes];
      newArr.length == 2 ? (this.user.favorTrigger = true) : null;
      favorHandler(dish.id, 'add');
      newDish.new = true;
      runInAction(() => (this.favorDishes = newArr));
      ampInstance.logEvent('added to favorites', {recipe_id: dish?.id});
    } catch (e) {
      this.sendAnalyticError(JSON.stringify(e));
    }
  }

  async deleteFromFavor(dish) {
    try {
      favorHandler(dish.id, 'remove');
      const newArr = this.favorDishes.filter(item => item.id != dish.id);
      runInAction(() => (this.favorDishes = newArr));
    } catch (e) {
      this.sendAnalyticError(JSON.stringify(e));
    }
  }

  canOpenRec(rec) {
    // return true;
    const recAccess = rec?.access;
    const userAccess = this.user?.access;
    // const dayAccess = this.dayDishes.filter(dish => dish.id == rec.id).length;
    if (userAccess || recAccess) {
      return true;
    } else {
      return false;
    }
  }

  changePersons(id, persons) {
    const menuIndex = this.allDishes.findIndex(item => item.id == id);
    // const oldMenuIndex = this.oldMenu.findIndex(item => item.id == id);
    const favorIndex = this.favorDishes.findIndex(item => item.id == id);
    const listIndex = this.listDishes.findIndex(item => item.id == id);
    menuIndex != -1 ? (this.allDishes[menuIndex].persons = persons) : null;
    // oldMenuIndex != -1 ? (this.oldMenu[oldMenuIndex].persons = persons) : null;
    favorIndex != -1 ? (this.favorDishes[favorIndex].persons = persons) : null;
    setRecipePersons(id, persons);
    if (listIndex != -1) {
      const newDish = this.listDishes[listIndex];
      newDish.persons = persons;
      this.listDishes.splice(listIndex, 1, newDish);
    }
  }

  changeProfilePersons(persons) {
    this.user.persons = persons;
    for (let i = 0; i < this.allDishes.length; i++) {
      this.allDishes[i].persons = persons;
    }
    // for (let i = 0; i < this.oldMenu.length; i++) {
    //   this.oldMenu[i].persons = persons;
    // }
    for (let i = 0; i < this.favorDishes.length; i++) {
      this.favorDishes[i].persons = persons;
    }
    // for (let i = 0; i < this.listDishes.length; i++) {
    //   this.listDishes[i].persons = persons;
    // }
  }

  rateApp(what) {
    let trigger = false;
    if (what == 'recept') {
      this.receptCount = this.receptCount + 1;
      this.receptCount == 5 || this.user?.favorTrigger
        ? (trigger = true)
        : null;
    }
    let registerDate = new Date(this.user?.created_at);
    let t2 = registerDate.getTime();
    let t1 = new Date().getTime();
    const days = parseInt((t1 - t2) / (24 * 3600 * 1000));
    if (days > 3 && trigger && this.user?.show_feedback_alert) {
      setTimeout(() => {
        Alert.alert(Config.appName, 'Нравится приложение?', [
          {
            text: 'Да',
            onPress: () => {
              let options = {
                AppleAppID: '1577136146',
                GooglePackageName: 'app.wecook',
                OtherAndroidURL: 'http://www.randomappstore.com/app/47172391',
                preferredAndroidMarket: AndroidMarket.Google,
                preferInApp: false,
                openAppStoreIfInAppFails: true,
                fallbackPlatformURL: 'http://www.mywebsite.com/myapp.html',
              };
              Rate.rate(options, success => {
                if (success) {
                  fetch(Config.apiDomain + 'user/alerts/feedback/off', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: 'Bearer ' + network.access_token,
                    },
                  });
                  console.warn('disableAlert()');
                  this.user.show_feedback_alert = false;
                }
              });
            },
          },
          {
            text: 'Нет',
            style: 'cancel',
          },
        ]);
      }, 1500);
    }
  }

  async basketHandle(isInBasket, id, persons, screen_name) {
    runInAction(() => (this.isLoadingBasket = true));
    console.log(isInBasket, id, persons, screen_name);
    try {
      runInAction(() => (this.isLoadingBasket = id));
      isInBasket ? await basketRemove(id) : await basketAdd(id, persons);
      runInAction(() => {
        this.isLoadingBasket = null;
      });
      !isInBasket
        ? ampInstance.logEvent('recipe added to cart', {
            recipe_id: id,
            screen_name,
          })
        : null;
    } catch (e) {
      console.log(e);
      runInAction(() => (this.isLoadingBasket = null));
      Alert.alert(Config.appName, e);
    }
  }

  async addProduct(product, ingCount, ingId, screen_name) {
    const productsBody = {
      id: product?.id,
      quantity: product?.quantity,
      price: product?.price,
    };
    try {
      runInAction(() => (this.isLoadingProduct = product?.id));
      console.log('eee', 1);
      await productAdd(
        productsBody,
        ingCount ? ingCount : null,
        ingId ? ingId : null,
      );
      console.log('eee', 2);
      runInAction(() => {
        this.products_count.push({
          id: product?.id,
          quantity: product?.quantity,
        });
      });
      console.log('eee', 3);
      setTimeout(() => runInAction(() => (this.isLoadingProduct = null)), 150);
      ampInstance.logEvent('extra product added to cart', {
        product_id: product.id,
        screen_name,
      });
    } catch (e) {
      console.log('eee', e);
      runInAction(() => (this.isLoadingProduct = null));
      Alert.alert(Config.appName, e);
    }
  }

  async changeProdCount(product_id, quantity) {
    try {
      runInAction(() => (this.isLoadingBasketInfo = true));
      let index = this.products_count.findIndex(prod => prod.id === product_id);
      if (index !== -1) {
        this.products_count[index] = {id: product_id, quantity};
      }
      await changeProductCount(product_id, quantity);
      runInAction(() => (this.isLoadingBasketInfo = false));
    } catch (e) {
      console.log(e);
      runInAction(() => (this.isLoadingBasketInfo = false));
      Alert.alert(Config.appName, e);
    }
  }

  enableBasket() {
    return !!network.user?.store_id && network.isBasketUser();
    // return false;
  }

  sendAnalyticError(message) {
    ampInstance.logEvent('error', {error: message});
  }

  constructor(props) {
    // super(props)
    mobx.makeAutoObservable(this);
    this.props = props;
    mobx.autorun(() => {});
  }
}

const network = new Network();
export default network;

export function authUser(email, password, token) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        device_id: network.deviceId,
        // device_id: '99ACDCAF-F1B7-4F46-981C-50D66E7A9F21',
        push_id: network.pushId,
        email,
        password,
        token,
      }),
    })
      .then(response => {
        response.json().then(data => {
          console.warn('authUser: ' + network.deviceId + JSON.stringify(data));
          if (data.token) {
            AsyncStorage.setItem('token', data.token);
            mobx.runInAction(() => {
              network.user = data;
              network.access_token = data.token;
            });
            resolve();
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getMenu() {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'screens/main', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
        Accept: 'application/json',
      },
    })
      .then(response => {
        response.json().then(data => {
          // console.log('getMenu: ' + JSON.stringify(data));
          if (data.status == 'ok') {
            mobx.runInAction(() => {
              network.allDishes = data.menu;
              network.banner1 = data?.banner_1;
              network.banner2 = data?.banner_2;
              network.paywalls = data?.paywalls || {};
            });
            network.getSectionsAndDayDishes(data.menu);
            resolve();
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getBasket() {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'cart', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
        Accept: 'application/json',
      },
    })
      .then(response => {
        response.json().then(data => {
          console.log('getBasket: ' + JSON.stringify(data));
          if (data.status == 'ok') {
            mobx.runInAction(() => {
              data.products ? (network.basketProducts = data.products) : null;
              data.recipes ? (network.basketRecipes = data.recipes) : null;
              data.additional_recipes
                ? (network.basketAddRecipes = data.additional_recipes)
                : null;
              data.additional_products
                ? (network.basketAddProducts = data.additional_products)
                : null;
              data.basket_info
                ? (network.basketInfo = data.basket_info)
                : (network.basketInfo = {});
              data.products_count
                ? (network.products_count = data.products_count)
                : (network.products_count = []);
            });
            resolve();
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getInitialScreens() {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'screens/onbording/auth', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
    })
      .then(response => {
        response.json().then(data => {
          console.log('getInitialScreens: ' + JSON.stringify(data));
          if (data.status === 'ok') {
            mobx.runInAction(() => {
              network.onboarding = data.data ?? {};
            });
            resolve();
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getRegisterScreens() {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'screens/onbording/register', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
    })
      .then(response => {
        response.json().then(data => {
          console.log('getRegisterScreens: ' + JSON.stringify(data));
          if (data.status === 'ok') {
            mobx.runInAction(() => {
              network.registerOnboarding = data.data ?? {};
            });
            resolve();
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getTariffs() {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'plans', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
    })
      .then(response => {
        response.json().then(data => {
          console.warn('getTariffs: ' + JSON.stringify(data));
          if (data.length) {
            resolve(data);
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function sendAnswer(
  url,
  form,
  answer,
  name,
  preference,
  persons,
  phone,
) {
  console.warn(
    JSON.stringify({
      device_id: network.deviceId,
      form,
      answer,
      name,
      phone,
      preference,
      persons,
    }),
  );
  return new Promise(function (resolve, reject) {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({
        device_id: network.deviceId,
        form,
        answer,
        name,
        phone,
        preference,
        persons,
      }),
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.warn('sendAnswer: ' + JSON.stringify(data));
            if (data) {
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function payAppleOrAndroid(receipt) {
  const body =
    Platform.OS == 'ios'
      ? JSON.stringify({
          token: network.access_token,
          receipt: receipt.transactionReceipt,
        })
      : JSON.stringify({token: network.access_token, receipt: receipt});
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + `purchase/order/${Platform.OS}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body,
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.warn('payApple: ' + JSON.stringify(data));
            if (data.status == 'ok') {
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject();
            }
          })
          .catch(err => console.warn(err, response));
      })
      .catch(err => {
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getList() {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'list', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.warn('getList: ' + JSON.stringify(data));
            if (data) {
              runInAction(() => (network.listDishes = data));
              resolve();
            } else {
              // network.sendAnalyticError(JSON.stringify(data.message));
              reject();
            }
          })
          .catch(err => {
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function listAdd(id) {
  console.warn('listAdd', id);
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'list/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({recipe: id}),
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.warn('listAdd: ' + JSON.stringify(data));
            if (data.status == 'ok') {
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function listRemove(id) {
  console.warn('listRemove', id);
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'list/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({recipe: id}),
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.warn('listRemove: ' + JSON.stringify(data));
            if (data.status == 'ok') {
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            network.sendAnalyticError(JSON.stringify(err));
            console.warn(err);
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function listClear() {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'list/clear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.warn('listClear: ' + JSON.stringify(data));
            if (data.status == 'ok') {
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            console.warn(err);
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function basketAdd(id, persons = network.user?.persons) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({
        store_id: network.user?.store_id,
        recipe_id: id,
        shop_id: network?.user?.shop_id,
        persons: persons,
      }),
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('basketAdd: ' + JSON.stringify(data));
            if (data.status == 'ok') {
              mobx.runInAction(() => {
                data.basket_info
                  ? (network.basketInfo = data.basket_info)
                  : null;
              });
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.error);
            }
          })
          .catch(err => {
            console.warn(err);
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function basketRemove(id) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'cart/remove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({
        recipe_id: id,
      }),
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('basketRemove: ' + JSON.stringify(data));
            if (data.status == 'ok') {
              mobx.runInAction(() => {
                data.basket_info
                  ? (network.basketInfo = data.basket_info)
                  : null;
              });
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            console.warn(err);
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getHistory(page = 1) {
  console.warn('page', page);
  const url = network.isBasketUser()
    ? Config.apiDomain + `cart/history?page=${page}`
    : Config.apiDomain + `list/history?page=${page}`;
  return new Promise(function (resolve, reject) {
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.warn('getHistory: ' + JSON.stringify(data));
            if (data.data) {
              mobx.runInAction(() => {
                if (page == 1) {
                  network.history = data.data;
                } else if (data.data.length) {
                  // Производим сортировку чтобы проверить, есть ли повторяющиеся блюда с одной и той же датой
                  for (let i = 0; i < data.data.length; i++) {
                    const newDish = data.data[i];
                    const alreadyHave = network.history.filter(
                      item => item.id == newDish.id,
                    );
                    let needToAdd = true;
                    for (let i = 0; i < alreadyHave.length; i++) {
                      new Date(newDish.history_date).toLocaleDateString() ==
                      new Date(
                        alreadyHave[i]?.history_date,
                      ).toLocaleDateString()
                        ? (needToAdd = false)
                        : null;
                    }
                    needToAdd ? network.history.push(newDish) : null;
                  }
                }
              });
              data.links.next ? resolve(true) : resolve(null);
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            console.warn(err);
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function updateInfo(what, value) {
  let formdata = new FormData();
  formdata.append(what, value);
  console.warn('object', formdata);
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'user/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + network.access_token,
        Accept: 'application/json',
      },
      body: formdata,
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.warn('updateInfo: ' + JSON.stringify(data));
            if (data?.status != 'error') {
              resolve();
            }
            // else if(data?.token && what == 'phone'){
            //     resolve(data.token)
            // }
            else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            console.warn(err);
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function ingredientHandler(id, action) {
  console.warn(id, action);
  let formdata = new FormData();
  formdata.append('ingredient', id);
  formdata.append('action', action);
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'list/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + network.access_token,
        Accept: 'application/json',
      },
      body: formdata,
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.warn('ingredientHandler: ' + JSON.stringify(data));
            if (data) {
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            console.warn(err);
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getFavors() {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'favorites', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.warn('getFavors: ' + JSON.stringify(data));
            if (data) {
              mobx.runInAction(() => {
                network.favorDishes = data;
              });
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            console.warn(err);
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function favorHandler(id, action) {
  const url = Config.apiDomain + `favorites/${action}`;
  let formdata = new FormData();
  formdata.append('recipe', id);
  return new Promise(function (resolve, reject) {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + network.access_token,
        Accept: 'application/json',
      },
      body: formdata,
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.warn('favorHandler: ', action, JSON.stringify(data));
            if (data) {
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            console.warn(err);
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getUserInfo(get_order_status) {
  let url = Config.apiDomain + 'user/info';
  get_order_status ? url + '?get_order_status=1' : null;
  return new Promise(function (resolve, reject) {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
        Accept: 'application/json',
      },
    })
      .then(response => {
        response.json().then(data => {
          console.log('getUserInfo: ' + JSON.stringify(data));
          if (data.token) {
            mobx.runInAction(() => {
              network.user = data;
              network.access_token = data.token;
              data.basket_info ? (network.basketInfo = data.basket_info) : null;
            });
            AsyncStorage.setItem('token', data.token);
            resolve();
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject();
          }
        });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getCode(phone) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'user/sendcode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
        Accept: 'application/json',
      },
      body: JSON.stringify(phone),
    })
      .then(response => {
        response.json().then(data => {
          console.warn('getCode: ' + JSON.stringify(data));
          if (data.status == 'Ok') {
            resolve();
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function sendCode(phone, code) {
  console.warn(JSON.stringify({code, phone}));
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'user/verifycode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
        Accept: 'application/json',
      },
      body: JSON.stringify({code, phone}),
    })
      .then(response => {
        response.json().then(data => {
          console.warn('sendCode: ' + JSON.stringify(data));
          if (data.status == 'ok') {
            resolve();
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getRecipe(url) {
  return new Promise(function (resolve, reject) {
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
    })
      .then(response => {
        response.json().then(data => {
          console.warn('getRecipe: ' + JSON.stringify(data));
          if (data.status == 'ok') {
            resolve(data.data);
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getSocials() {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'for-contacts', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
    })
      .then(response => {
        response.json().then(data => {
          console.warn('getSocials: ' + JSON.stringify(data));
          if (data.status == 'ok') {
            resolve(data.data);
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function setRecipePersons(recipe_id, perons) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + `recipes/${recipe_id}/set-person`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({perons}),
    })
      .then(response => {
        response.json().then(data => {
          console.warn('setRecipePersons: ' + JSON.stringify(data));
          if (data.status == 'ok') {
            resolve(data.data);
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function iSeeYourDaddy(id) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + `stories/viewed/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        response.json().then(data => {
          console.warn('iSeeYourDaddy: ' + JSON.stringify(data));
          if (data.status == 'ok') {
            resolve();
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject();
          }
        });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getShortLink(link) {
  console.warn('oldLink', link);
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'generate-short-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({link}),
    })
      .then(response => {
        response.json().then(data => {
          console.warn('getShortLink: ' + JSON.stringify(data));
          if (data.status == 'ok') {
            resolve(data.link);
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function searchProduct(search_query) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'products/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({search_query}),
    })
      .then(response => {
        response.json().then(data => {
          // console.log('searchProduct: ' + JSON.stringify(data));
          if (data.status == 'ok') {
            const respData = data.data;
            resolve({products: respData.products, tips: respData.hints});
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getAnalogues(ingredient_id, ingredient_count) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'cart/recipes/analogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({ingredient_id, ingredient_count}),
    })
      .then(response => {
        response.json().then(data => {
          if (data.status == 'ok') {
            resolve(data.data);
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function setUserAddress(lat, lon, address, yandex_data) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'user/set-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({lat, lon, address, yandex_data}),
    })
      .then(response => {
        response.json().then(data => {
          console.log('setUserAddress', data);
          if (data.status == 'ok') {
            resolve(data);
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getStores() {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'stores', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
        Accept: 'application/json',
      },
    })
      .then(response => {
        response.json().then(data => {
          console.log('getStores: ' + JSON.stringify(data));
          if (data.status == 'ok') {
            mobx.runInAction(() => (network.stores = data.data));
            resolve();
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function selectUserAddress(id) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'user/select-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
        Accept: 'application/json',
      },
      body: JSON.stringify({id}),
    })
      .then(response => {
        response.json().then(data => {
          console.log('selectUserAddress: ' + JSON.stringify(data));
          if (data.status == 'ok') {
            resolve();
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function productAdd(product, ingredient_count, ingredient_id) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'cart/add-product', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({
        product,
        ingredient_count,
        ingredient_id,
      }),
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('productAdd: ' + JSON.stringify(data));
            if (data.status == 'ok') {
              mobx.runInAction(() => {
                data.basket_info
                  ? (network.basketInfo = data.basket_info)
                  : null;
                data.products ? (network.basketProducts = data.products) : null;
              });
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            console.warn(err);
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function toggleRec(recipe_id) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'cart/toggle-recipe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({
        recipe_id,
      }),
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('hideRec: ' + JSON.stringify(data));
            if (data.status == 'ok') {
              mobx.runInAction(() => {
                data.basket_info
                  ? (network.basketInfo = data.basket_info)
                  : null;
                data.products ? (network.basketProducts = data.products) : null;
                data.products_count
                  ? (network.products_count = data.products_count)
                  : (network.products_count = []);
              });
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            console.warn(err);
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function basketClear() {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'cart/clear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('basketClear: ' + JSON.stringify(data));
            if (data.status == 'ok') {
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            console.warn(err);
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getStoresByCoords(latitude, longitude) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'stores/find-actual', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({
        coordinates: {
          latitude: latitude,
          longitude: longitude,
        },
      }),
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('getStoresByCoords: ' + JSON.stringify(data));
            if (data.status == 'ok') {
              resolve(data.data);
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            network.sendAnalyticError(JSON.stringify(err));
            console.warn(err);
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function changeProductCount(product_id, quantity) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'cart/change-count', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({product_id, quantity}),
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('changeProductCount: ' + JSON.stringify(data));
            if (data.status == 'ok') {
              mobx.runInAction(() => {
                data.basket_info
                  ? (network.basketInfo = data.basket_info)
                  : null;
              });
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            console.warn(err);
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function sendCheck(TransactionId, PaRes) {
  const login = 'pk_bcfec0a71bc8227680280ae03ecec';
  const password = 'c9aed097cec641438e882b6eb1e82c97';
  return new Promise(function (resolve, reject) {
    fetch('https://api.cloudpayments.ru/payments/cards/post3ds', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + base64.encode(`${login}:${password}`),
      },
      body: JSON.stringify({TransactionId, PaRes}),
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('sendCheck: ' + JSON.stringify(data));
            if (data?.Success) {
              resolve(data?.Model);
            } else {
              network.sendAnalyticError(JSON.stringify(data.Message));
              reject(data?.Message);
            }
          })
          .catch(err => {
            console.warn(err);
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getUserCards() {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'user/cards', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('getUserCards: ' + JSON.stringify(data));
            if (data.status == 'ok') {
              mobx.runInAction(() => {
                if (data.data && data.data.length) {
                  network.userCards = data.data;
                  const lastCard = data.data.find(card => card?.is_active);
                  network.currentCard = lastCard ? lastCard : data.data[0];
                }
              });
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            console.warn(err);
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function addUserCard(
  card_token,
  first_six,
  last_four,
  exp_date,
  system,
) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'user/cards/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({
        card_token,
        first_six,
        last_four,
        exp_date,
        system,
      }),
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('addCard: ' + JSON.stringify(data));
            if (data.status == 'ok') {
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            console.warn(err);
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function updateAddress(id, entrance, floor, flat, intercom) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'user/update-address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({
        id,
        entrance,
        floor,
        flat,
        intercom,
      }),
    })
      .then(response => {
        console.log('response', response);
        response
          .json()
          .then(data => {
            console.log('updateAddress: ' + JSON.stringify(data));
            if (data.status == 'ok') {
              mobx.runInAction(() => {
                if (data.addresses) {
                  network.user.addresses = data.addresses;
                }
              });
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            network.sendAnalyticError(JSON.stringify(err));
            console.warn(err);
            reject();
          });
      })
      .catch(err => {
        network.sendAnalyticError(JSON.stringify(err));
        console.warn(err);
        reject('Unknown error.Try again later.');
      });
  });
}

export function createOrder(delivery_address, card_id, comment) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'stores/order/new', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({
        delivery_address,
        card_id,
        comment,
      }),
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('createOrder: ' + JSON.stringify(data));
            if (data.status == 'ok') {
              resolve(data.data);
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            console.warn(err);
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function cancelUserOrder(id_in_table) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'stores/order/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({id_in_table}),
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('cancelUserOrder: ' + JSON.stringify(data));
            if (data.status == 'ok') {
              resolve(data.message);
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            console.warn(err);
            network.sendAnalyticError(JSON.stringify(err));
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getUserIP() {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'get-my-ip', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('getUserIP: ' + JSON.stringify(data));
            if (data.status == 'ok') {
              resolve(data.data);
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            network.sendAnalyticError(JSON.stringify(err));
            console.warn(err);
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getUnavailableProducts() {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'recipes/check-available', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
    })
      .then(response => {
        console.log(response);
        response
          .json()
          .then(data => {
            console.log('getUnavailableProducts', data);
            if (data.status == 'ok') {
              runInAction(() => (network.unavailableRecipes = data.recipes));
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            network.sendAnalyticError(JSON.stringify(err));
            console.warn(err);
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getTranslate() {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'user/get-translate', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('getTranslate', data);
            if (data.status == 'ok') {
              runInAction(() => {
                network.strings = new LocalizedStrings(data.translates);
                network.strings.setLanguage(data?.userLanguage);
                network.userMap = data.map;
                network.priceDigits = data.price_digits;
              });
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            network.sendAnalyticError(JSON.stringify(err));
            console.warn(err);
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function deleteUser() {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'user/clear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('deleteUser', data);
            if (data.status == 'ok') {
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            network.sendAnalyticError(JSON.stringify(err));
            console.warn(err);
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getPrivacyAndAgreement() {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'privacy-and-agreement', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('getPrivacyAndAgreement', data);
            if (data.status == 'ok') {
              resolve(data.data);
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            network.sendAnalyticError(JSON.stringify(err));
            console.warn(err);
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getGeoData(body) {
  console.log(body);
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'geocoding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify(body),
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('getGeoData', data);
            if (data.status == 'ok') {
              resolve(data.data);
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            network.sendAnalyticError(JSON.stringify(err));
            console.warn(err);
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function yandexGeoToCoords(text) {
  const url = `https://geocode-maps.yandex.ru/1.x?apikey=e95c2f91-cd98-4e7c-be76-c7ec244d0ef1&format=json&results=10&geocode=${text}`;
  return new Promise(function (resolve, reject) {
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('yandexGeoToCoords', data.response);
            if (data.response?.GeoObjectCollection?.featureMember) {
              const resolveData =
                data.response?.GeoObjectCollection?.featureMember.map(item => {
                  const pos = item?.GeoObject?.Point?.pos ?? '0 0';
                  return {
                    lat: pos.split(' ')[0],
                    lon: pos.split(' ')[1],
                    title: item?.GeoObject?.name,
                    subtitle: item?.GeoObject?.description,
                  };
                });
              resolve(resolveData);
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            network.sendAnalyticError(JSON.stringify(err));
            console.warn(err);
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function sendNewPass(email) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'user/password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({email}),
    })
      .then(response => {
        console.log('sendNewPass', response);
        response
          .json()
          .then(data => {
            console.log('sendNewPass', data);
            if (data.status == 'ok') {
              resolve(data.data);
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject(data.message);
            }
          })
          .catch(err => {
            network.sendAnalyticError(JSON.stringify(err));
            console.warn(err);
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getUserFromLink(user_token) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'auth/login/user-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({
        device_id: network.deviceId,
        push_id: network.pushId,
        user_token,
      }),
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('getUserFromLink', data);
            if (data.token) {
              AsyncStorage.setItem('token', data.token);
              mobx.runInAction(() => {
                network.user = data;
                network.access_token = data.token;
              });
              AsyncStorage.setItem('token', data.token);
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject();
            }
          })
          .catch(err => {
            network.sendAnalyticError(JSON.stringify(err));
            console.warn(err);
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function sendModalId(id) {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'modal/close', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
      },
      body: JSON.stringify({
        id,
      }),
    })
      .then(response => {
        response
          .json()
          .then(data => {
            console.log('sendModalId', data);
            if (data.status == 'ok') {
              resolve();
            } else {
              network.sendAnalyticError(JSON.stringify(data.message));
              reject();
            }
          })
          .catch(err => {
            network.sendAnalyticError(JSON.stringify(err));
            console.warn(err);
            reject();
          });
      })
      .catch(err => {
        console.warn(err);
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function getModals() {
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'modals/get', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
        Accept: 'application/json',
      },
    })
      .then(response => {
        response.json().then(data => {
          console.log('getModals: ' + JSON.stringify(data));
          if (data.status == 'ok') {
            mobx.runInAction(() => {
              network.modals = data?.data;
            });
            resolve();
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function loginEmail({email, code}) {
  const body = {email, device_id: network.deviceId};
  code ? (body.code = code) : null;
  return new Promise(function (resolve, reject) {
    fetch(Config.apiDomain + 'auth/login/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
        Accept: 'application/json',
      },
      body: JSON.stringify(body),
    })
      .then(response => {
        response.json().then(data => {
          console.log('loginEmail: ' + email + JSON.stringify(data));
          if (data.status == 'ok') {
            resolve(data?.data);
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(data.message);
          }
        });
      })
      .catch(err => {
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}

export function sendDataToUrl({url, data}) {
  return new Promise(function (resolve, reject) {
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + network.access_token,
        Accept: 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        response.json().then(jsonData => {
          console.log('sendDataToUrl: ' + JSON.stringify(jsonData));
          if (jsonData?.status == 'ok') {
            resolve(jsonData?.data);
          } else {
            network.sendAnalyticError(JSON.stringify(data.message));
            reject(jsonData.message);
          }
        });
      })
      .catch(err => {
        network.sendAnalyticError(JSON.stringify(err));
        reject('Unknown error.Try again later.');
      });
  });
}
