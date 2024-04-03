import { createStore } from 'vuex'
import createPersistedState from "vuex-persistedstate";


export default createStore({
  plugins: [createPersistedState()],
  state: {
    username: '',
    token: '',
    password: '',
    userId: '',
    loggedIn: false,
    isAdmin:false,

  },
  mutations: {
    saveUsername(state, username){
      state.username = username;
    },
    saveToken(state, token){
      state.token = token;
    },
    savePassword(state, password){
      state.password = password;
    },
    saveUserId(state, userId){
      state.userId = userId;
    },
    logIn(state){
      state.loggedIn = true;
    },
    logOut(state){
      state.loggedIn = false;
    },
    adminIn(state){
      state.isAdmin = true;
    },
    adminOut(state){
      state.isAdmin = false;
    }
  },
  actions: {
    saveUsername({commit}, token){
      commit("saveUsername", token)
    },
    saveToken({commit}, token){
      commit("saveToken", token);
    },
    saveEmail({commit}, email){
      commit("saveEmail", email);
    },
    savePassword({commit}, password){
      commit("savePassword", password);
    },
    removeCredentialsUser({commit}){
      commit("removeCredentialsUser");
    },
    saveUserId({commit}, userId) {
      commit("saveUserId", userId);
    },
    logIn({commit}){
      commit("logIn");
    },
    logOut({commit}){
      commit("logOut");
    },
    adminIn({commit}){
      commit("adminIn");
    },
    adminOut({commit}){
      commit("adminOut");
    }
  },
  modules: {
  }
})
