import Cookies from 'js-cookie';

const tokenName = "admin-token"

export function setToken(token){
    Cookies.set(tokenName,token)
}

export function getToken(){
   return Cookies.get(tokenName)
}

export function removeToken(){
    Cookies.remove(tokenName);
}