import axios from 'axios';
const CryptoJS = require('crypto-js')
require('dotenv').config()
// import dotenv from 'dotenv';
// import path from 'path';
const palabra_secreta_aes = process.env.VUE_APP_SECRET_WORD_AES || "very_secret_this_is_AES_12345"
// dotenv.config({ path: path.resolve(__dirname, '../../.env') });
export default class UserService {

    async getUser(userId) {
        return axios.get(`/users/getUser?userID=${userId}`);
    }

    async checkUserExists(username) {
        try {
          const response = await axios.get(`/users/checkUserExists?username=${username}`);
          return response.data;
        } catch (error) {
          console.error(`Error retrieving user ${username}: ${error}`);
          return null;
        }
      }

    async guardar(user){
        return axios.post(`auth/register`,user)
        .then((response) => response.data)
        .catch((e)=>{
            console.error('error' + e);
        });
    }

    async actualizar(userId,user){
        return axios.put(`users/${userId}`,user)
        .then((response) => response.data)
        .catch((e)=>{
            console.error('error' + e);
        });
    }


    async sendIndexAndStyle(userID, token, indice, estilo) {
      const config = {
        headers: {
          authorization: 'Bearer ' +token
        }
      };
    
      try {
        const response = await axios.post(`/index/${userID}`,{"index":indice, "estilo":estilo}, config, );
        return response.data;
      } catch (error) {
        console.error('Error:', error);
      }
    }

    async generateCode(email){
        return axios.get(`/sendConfirmation/${email}`)
        .then((response) => response)
        .catch((e)=>{
            console.error('error' + e);
        });
    }

    async sendCode(email,code){
        return axios.get(`/sendConfirmation/email/${email}/code/${code}`)
        .then((response) => response)
        .catch((e)=>{
            console.error('error' + e);
        });
    }

    async getUsers(page, limit, search, userID){
      return axios.get('/users?search='+search+'&page='+page+'&limit='+limit+'&userID='+userID)
        .then(response => response)
        .catch((e)=>{
            console.log('error' + e);
        });
    }

    async getNumberOfUsers(userID){
      return axios.get('/users/numberOfUsers?userID='+userID)
        .then(response => response)
        .catch((e)=>{
            console.log('error' + e);
        });
    }

    async updateAdmin(actualUserID, userIDtoAdmin){
      return axios.put('/users/user?userID='+actualUserID+'&userIdToAdmin='+userIDtoAdmin)
        .then(response => response)
        .catch((e)=>{
            console.log('error' + e);
        });
    }

    async deleteUser(actualUserID, userIDToDelete){
      return axios.delete('/users/?userID='+actualUserID+'&userIdToDelete='+userIDToDelete)
      .then(response => response)
      .catch((e)=>{
          console.log('error' + e);
      });
    }

    descifrarUsuarioYGuardar(data){
        console.log(data)
        return CryptoJS.AES.decrypt(data, palabra_secreta_aes).toString(CryptoJS.enc.Utf8);
    }
}