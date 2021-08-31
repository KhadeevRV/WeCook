import React from 'react';
import { Platform, Dimensions } from 'react-native';
import Config from '../src/constants/Config';

class Common extends React.Component {

  constructor(props) {
    super(props);
  }

  isPortrait = () => {
    const dim = Dimensions.get('screen');
    return dim.height >= dim.width;
  }

  getLengthByIPhone7 = (length) => {
    if(length > 0) {
      if(this.isPortrait()) {
        return Math.round(Dimensions.get('window').width*length/375);
      } else {
        return Math.round(Dimensions.get('window').height*length/375);
      }
    } else {
      if(this.isPortrait()) {
        return Dimensions.get('window').width;
      } else {
        return Dimensions.get('window').height;
      }
    }
  }

  reformatPhone = phone => {
    phone = phone.replace(/[^\d.-]/g, '');
    if (phone.length) {
      if (phone.charAt(0) != '+') {
        phone = '+' + phone;
      }
      if (phone.charAt(1) != '7') {
        phone = phone.substring(0, 1) + '7' + phone.substring(2);
      }
      if (phone.length > 2 && phone.length < 6) {
        phone = phone.substring(0, 2) + ' (' + phone.substring(2, 5);
      } else if (phone.length >= 6 && phone.length < 9) {
        phone = phone.substring(0, 2) + " (" + phone.substring(2, 5) + ") " + phone.substring(5, 8);
      } else if (phone.length >= 9 && phone.length < 11) {
        phone = phone.substring(0, 2) + " (" + phone.substring(2, 5) + ") " + phone.substring(5, 8) + "-" + phone.substring(8, 10);
      } else if (phone.length >= 11) {
        phone = phone.substring(0, 2) + " (" + phone.substring(2, 5) +
            ') ' + phone.substring(5, 8) + "-" + phone.substring(8, 10) +
            '-' + phone.substring(10, 12);
      }
    }
    return phone;
  }

  reformatTime = time => {
    time = time.replace(/[^\d.-]/g, '');
    if (time.length) {
      if(Number(time.substring(0,2)) > 23){
        time = '00' + ':' + time.substring(2, 5);
      }else if (time.length > 2 && time.length < 5) {
        time = time.substring(0, 2) + ':' + time.substring(2, 5);
      }else if (Number(time.substring(2,5)) > 59){
        time = time.substring(0, 2) + ':' + '59';
      }
    return time;
  }
  }

  reformatCode = code => {
    code = code.replace(/[^\d.-]/g, '');
    if (code.length) {
      if (code.length > 1 && code.length < 3) {
        code = code.substring(0, 1) + ' ' + code.substring(1, 2);
      } else if (code.length >= 2 && code.length < 4) {
        code = code.substring(0, 1) + ' ' + code.substring(1, 2) + ' ' + code.substring(2, 3);
      } else {
        code = code.substring(0, 1) + ' ' + code.substring(1, 2) + ' ' + code.substring(2, 3) + ' ' + code.substring(3, 4) + ' ' + code.substring(4, 5);
      }
    }
    return code;
  }
  validMail = email => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // console.warn(re.test(String(email).toLowerCase()))
    return re.test(String(email).toLowerCase());
  }

  // validMail = mail => {
  //     return /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(mail);
  // }
  declOfNum = (number, titles) => {  
    var  cases = [2, 0, 1, 1, 1, 2];  
    return titles[ 
            (number % 100 > 4 && number % 100 < 20) 
            ? 
            2 
            : 
            cases[(number % 10 < 5) ? number % 10 : 5] 
    ];  
  } 
}



const common = new Common();
export default common;
