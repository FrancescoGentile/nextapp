import { createStore } from 'vuex'
import axios from "axios"
import {notify} from "@kyvg/vue3-notification"

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem("user") || "{}"),
    token: localStorage.getItem("token") || "",
    rooms:[],
  },
  getters: {
    isLoggedIn(state){
      return !!state.token
    },
    getUser(state){
      return state.user
    }
  },
  mutations: {
    setLogin(state, {token, user}){
      state.token = token
      state.user = user
    },

    setLogout(state) {
      state.token = ''
      state.user = {}
    }

  },
  actions: {
    login({commit},user){
      return new Promise((resolve, reject)=>{
        axios.defaults.headers.common["Authorization"]
        axios.post("http://localhost:3000/login",{
          email: user.email,
          password: user.password
        }).then(response=>{
          const token = response.data.accessToken
          const user  = response.data.user

          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))
          commit('setLogin', {token, user})
          notify({
            title: "Login",
            text: "User correctly signed in"
          })
          resolve(response)
        }).catch(err => {
          localStorage.removeItem('token')
          notify({
            title: "Error",
            text: err.response.data
          })
          console.log(err.response.data)


          reject(err)

        })
      })
    },

    logout({commit}){
      return new Promise((resolve)=>{
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        commit("setLogout")
        //delete axios.defaults.headers.common['Authorization']
        notify({
          title: "Logout",
          text: "User successfully logged out"
        })

        resolve()
      }).catch(err =>{
        notify({
          title: "Error",
          text: err.response.data
        })
      })
    }
  },
  modules: {
  }
})

