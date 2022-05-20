import { createStore } from 'vuex'
import axios from "axios"

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
        axios.post("http://localhost:3000/login",{
          email: user.email,
          password: user.password
        }).then(response=>{
          const token = response.data.accessToken
          const user  = response.data.user
          //console.log(user)
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))

          commit('setLogin', {token, user})
          resolve(response)
        }).catch(err => {
          console.log(err.response.data)
          localStorage.removeItem('token')
          reject(err)

        })
      })
    },

    logout({commit}){
      return new Promise((resolve)=>{
        commit("setLogout")
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        //delete axios.defaults.headers.common['Authorization']
        resolve()
      })
    }
  },
  modules: {
  },
  plugins:[

  ]
})

