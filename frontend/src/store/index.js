import { createStore } from 'vuex'
import axios from "axios"
import {notify} from "@kyvg/vue3-notification"

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem("user") || "{}"),
    token: localStorage.getItem("token") || "",
    rooms: [],
    roomDetails: [],
    error: "",
    reservations: [],
    roomReservations: [],
    userReservations: [],
    dateReservations: [],
    slots: []
  },
  getters: {
    isLoggedIn(state) {
      return !!state.token
    },
    getUser(state) {
      return state.user
    },
    getUsers(state) {
      return state.users
    },
    getRooms(state) {
      return state.rooms
    },
    getReservations(state){
      return state.reservations
    },
    getRoomDetails(state) {
      return state.roomDetails
    },
    getRoomReservations: (state)=> (roomId)=> {
      let roomReservations = []
      state.dateReservations.forEach(res=>{
        if(res.room === roomId){
          roomReservations.push(res)
        }
      })
      //console.log(roomReservations)
      return roomReservations
    },
    getUserReservations: (state) => (userId)=>{
      let userReservations = []
      state.reservations.forEach(res=>{
        if(res.user === userId){
          userReservations.push(res)
        }
      })
      //console.log(userReservations)
      return userReservations
    },
    getDateReservations: (state) => (date)=>{
      let dateReservations = []
      state.reservations.forEach(res=>{
        if(res.date === date){
          dateReservations.push(res)
        }
      })
      //console.log(dateReservations)
      return dateReservations
    },
    getSlots(state){
      return state.slots
    }
  },
  mutations: {
    setLogin(state, {token, user}) {
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
    setError(state, error) {
      state.error = error;
    },
    setRooms(state, rooms) {
      state.rooms = rooms
    },
    setRoomDetails(state, room) {
      state.roomDetails = room
    },
    setReservations(state, reservations){
      state.reservations = reservations
    },
    setUserReservations(state, reservations){
      state.userReservations = reservations
    },
    setRoomReservations(state, reservations){
      state.roomReservations = reservations
    },
    setDateReservations(state, reservations){
      state.dateReservations = reservations
    },
    setSlots(state, slots){
      state.slots = slots
    }
  },
  actions: {
    login({commit}, user) {
      return new Promise((resolve, reject) => {
        //axios.defaults.headers.common["Authorization"] = "Bearer " + localStorage.getItem("token");
        axios.defaults.headers.common["Authorization"]
        axios.post("http://localhost:3000/login", {
          email: user.email,
          password: user.password
        }).then(response => {
          const token = response.data.accessToken
          const user = response.data.user

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

    logout({commit}) {
      return new Promise((resolve) => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        commit("setLogout")
        //delete axios.defaults.headers.common['Authorization']
        notify({
          title: "Logout",
          text: "User successfully logged out"
        })

        resolve()
      }).catch(err => {
        notify({
          title: "Error",
          text: err.response.data
        })
      })
    },

    addUser({commit}, user) {
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

    users({commit}) {
      return new Promise((resolve, reject) => {
        axios.get("http://localhost:3000/users"
        ).then(response => {
          let users = response.data
          //remove hashed passwords both for security and because axios doesn't like them with patch requsts
          users.forEach(user => {
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

    deleteUser({commit}, id) {
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

    modifyUser({commit}, user) {
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

    rooms({commit}) {
      return new Promise((resolve, reject) => {
        axios.get("http://localhost:3000/rooms"
        ).then(response => {
          const rooms = response.data
          commit('setRooms', rooms)

          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data
          })
          commit('setError')
          reject(err)
        })
      })
    },

    addRoom({commit}, room) {
      return new Promise((resolve, reject) => {
        axios.post("http://localhost:3000/rooms", room
        ).then(response => {
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

  roomDetails({commit}, roomId) {
    return new Promise((resolve, reject) => {
      axios.get("http://localhost:3000/rooms/" + roomId
      ).then(response => {
        const room = response.data
        commit("setRoomDetails", room)
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

    deleteRoom({commit}, id) {
      return new Promise((resolve, reject) => {
        axios.delete("http://localhost:3000/rooms/" + id
        ).then(response => {
          notify({
            title: "Success",
            text: "Room deleted"
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

    modifyRoom({commit}, room) {
      //console.log(room)
      return new Promise((resolve, reject) => {
        axios.patch("http://localhost:3000/rooms/" + room.id, room
        ).then(response => {
          notify({
            title: "Success",
            text: "Room updated"
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

    bookRoom({ commit }, reservation) {
      return new Promise((resolve, reject) => {
        axios.post("http://localhost:3000/reservations", {
          id: reservation.id,
          user: reservation.user,
          room: reservation.room,
          slot: reservation.slot,
          date: reservation.date
        }).then(response => {
          notify({
            title: "Success",
            text: "Reservation added"
          })
          resolve(response)
        }).catch(err => {
           notify({
            title: "Error",
            text: err.response.data
          })
          commit('setError')
          reject(err)
        })
      })
    },

    reservations({ commit }) {
      return new Promise((resolve, reject) => {
        axios.get("http://localhost:3000/reservations"
        ).then(response => {
          const reservations = response.data
          commit('setReservations', reservations)

          resolve(response)
        }).catch(err => {

          commit('setError')

          reject(err)
        })
      })
    },

    slots({commit}){
      return new Promise((resolve, reject)=>{
        axios.get("http://localhost:3000/slots"
        ).then(response=>{
          commit("setSlots", response.data)
          resolve(response)
        }).catch(err=>{
          commit("setError")
          reject(err)
        })
      })
    },

    deleteUserReservation({ commit }, id) {
      return new Promise((resolve, reject) => {
        axios.delete("http://localhost:3000/reservations/" + id
        ).then(response => {
          //commit("setReservations")
          resolve(response)
        }).catch(err => {
          commit("setError")
          reject(err)
        })
      })
    }

},
  modules: {
  }
})
