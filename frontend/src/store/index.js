import { createStore } from 'vuex'
import axios from "axios"
import {notify} from "@kyvg/vue3-notification"

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem("user") || "{}"),
    token: localStorage.getItem("token") || "",
    rooms:[],
    error: ""
  },
  getters: {
    isLoggedIn(state){
      return !!state.token
    },
    getUser(state){
      return state.user
    },
    getUsers(state) {
      return state.users
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
    },
    setUsers(state, users) {
      state.users = users
    },
    setError(state, error){
      state.error = error;
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
    },

    addUser({ commit }, user) {
      return new Promise((resolve, reject) => {
        axios.post("http://localhost:3000/users", {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          password: user.password
        }).then(response => {
          notify({
            title: "Success",
            text: "User successfully added"
          })

          resolve(response)
        }).catch(err => {
          commit('setError') //TODO look up how commit works
          localStorage.removeItem('token')

          notify({
            title: "Error",
            text: err.response.data
          })

          reject(err)
        })
      })
    },

    users({ commit }) {
      return new Promise((resolve, reject) => {
        axios.get("http://localhost:3000/users"
        ).then(response => {
          let users = response.data
          //remove hashed passwords both for security and because axios doesn't like them with patch requsts
          users.forEach(user =>{
            delete user.password
          })
          commit('setUsers', users)
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data
          })
          reject(err)
        })
      })
    },

    deleteUser({ commit }, id) {
      return new Promise((resolve, reject) => {
        axios.delete("http://localhost:3000/users/" + id
        ).then(response => {
          notify({
            title: "Success",
            text: "User deleted"
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data
          })
          commit("setError")
          reject(err)
        })
      })
    },

    modifyUser({ commit }, user) {
      return new Promise((resolve, reject) => {
        axios.patch("http://localhost:3000/users/" + user.id, user
        ).then(response => {
          notify({
            title: "Success",
            text: "User updated"
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data
          })
          commit("setError")
          reject(err)
        })
      })
    },
  },
  modules: {
  }
})

