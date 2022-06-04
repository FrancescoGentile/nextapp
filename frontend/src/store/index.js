import { createStore } from 'vuex'
import axios from "axios"
import { notify } from "@kyvg/vue3-notification"

//axios.defaults.baseURL = "http://localhost:8080/api/v1/"
//axios.defaults.headers ['Access-Control-Allow-Origin'] ='http://localhost:8080';
//axios.defaults.withCredentials = true

const instance = axios.create({
  baseURL: "http://localhost:8080/api/v1/",
  withCredentials: true
})

export default createStore({
  state: {
    logStatus: JSON.parse(localStorage.getItem("logStatus")) || "",
    user: {},
    userEmails: [],
    users: [],
    rooms: [],
    roomDetails: [],
    error: "",
    dateReservations: [],
    userReservations: [],
    slots: [],
    floors: [],
    channels: [],
    userChannels: [],
    channelDetails: [],
    channelNews: [],
    channelEvents: [],
    userEvents: [],
    administratedChannels: [],
    channelSubscribers: []
  },
  getters: {
    isLoggedIn(state) {
      return !!state.logStatus
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
    getRoomDetails(state) {
      return state.roomDetails
    },
    getDateReservations(state) {
      return state.dateReservations
    },
    getUserReservations(state) {
      return state.userReservations
    },
    getSlots(state) {
      return state.slots
    },
    getFloors(state) {
      return state.floors
    },
    getUserEmails(state) {
      return state.userEmails
    },
    getChannels(state) {
      return state.channels
    },
    getUserChannels(state) {
      return state.userChannels
    },
    getChannelDetails(state) {
      return state.channelDetails
    },
    getChannelEvents(state) {
      return state.channelEvents
    },
    getChannelNews(state) {
      return state.channelNews
    },
    getUserEvents(state) {
      return state.userEvents
    },
    getAdministratedChannels(state) {
      return state.administratedChannels
    },
    getChannelSubscribers(state) {
      return state.channelSubscribers
    }
  },
  mutations: {
    setLogin(state) {
      state.logStatus = "logged"
    },
    setLogout(state) {
      state.logStatus = ""
    },
    setUsers(state, users) {
      state.users = users
    },
    setUser(state, user) {
      state.user = user
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
    setUserReservations(state, reservations) {
      state.userReservations = reservations
    },
    setDateReservations(state, reservations) {
      state.dateReservations = reservations
    },
    setSlots(state, slots) {
      state.slots = slots
    },
    setFloors(state, floors) {
      state.floors = floors
    },
    setUserEmails(state, emails) {
      state.userEmails = emails
    },
    setChannels(state, channels) {
      state.channels = channels
    },
    setUserChannels(state, channels) {
      state.userChannels = channels
    },
    setChannelDetails(state, channel) {
      state.channelDetails = channel
    },
    setChannelEvents(state, events) {
      state.channelEvents = events
    },
    setChannelNews(state, news) {
      state.channelNews = news
    },
    setUserEvents(state, events) {
      state.userEvents = events
    },
    setAdministratedChannels(state, channels) {
      state.administratedChannels = channels
    },
    setChannelSubscribers(state, subscribers) {
      state.channelSubscribers = subscribers
    }
  },
  actions: {
    login({ commit }, user) {
      return new Promise((resolve, reject) => {
        instance.post("login", {
          username: user.username,
          password: user.password
        }, { withCredentials: true }
        ).then(response => {
          localStorage.setItem("logStatus", JSON.stringify("logged"))
          commit('setLogin')
          notify({
            title: "Success",
            text: "User correctly logged in"
          })
          resolve(response)
        }).catch(err => {
          localStorage.removeItem('logStatus')
          notify({
            title: "Error",
            text: err.response.data.details
          })
          reject(err)

        })
      })
    },

    logout({ commit }) {
      return new Promise((resolve, reject) => {
        instance.post("logout", {}, { withCredentials: true }
        ).then(response => {
          localStorage.removeItem('logStatus')
          commit('setLogout')
          notify({
            title: "Logout",
            text: "User successfully logged out"
          })
          resolve(response)
        }).catch(err => {
          localStorage.removeItem('logStatus')
          notify({
            title: "Error",
            text: err.response.data.details
          })

          reject(err)

        })
      })
    },


    addUser({ commit }, user) {
      //console.log(user)
      return new Promise((resolve, reject) => {
        //console.log(user)
        instance.post("users", {
          username: user.username,
          password: user.password,
          first_name: user.first_name,
          middle_name: user.middle_name || "-",
          surname: user.surname,
          is_admin: user.is_admin,
          email: user.email
        }).then(response => {
          notify({
            title: "Success",
            text: "User successfully added"
          })

          resolve(response)
        }).catch(err => {
          commit('setError')
          //localStorage.removeItem('token')

          notify({
            title: "Error",
            text: err.response.data.details
          })

          reject(err)
        })
      })
    },
    //TODO: ask for offset and limit
    users({ commit }) {
      return new Promise((resolve, reject) => {
        instance.get("users", { withCredentials: true }
        ).then(response => {
          let users = response.data
          commit('setUsers', users)
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          reject(err)
        })
      })
    },

    deleteUser({ commit }, id) {
      return new Promise((resolve, reject) => {
        instance.delete("users/" + id, { withCredentials: true }
        ).then(response => {
          notify({
            title: "Success",
            text: response.data
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    publicUser({ commit }, userId) {
      return new Promise((resolve, reject) => {
        instance.get("users/" + userId, { withCredentials: true }
        ).then(response => {
          commit("setUser", response.data)
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    privateUser({ commit }) {
      return new Promise((resolve, reject) => {
        instance.get("users/me", { withCredentials: true }
        ).then(response => {
          commit("setUser", response.data)
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    deletePersonalProfile({ commit }) {
      return new Promise((resolve, reject) => {
        instance.delete("users/me", { withCredentials: true }
        ).then(response => {
          notify({
            title: "Success",
            text: "User deleted"
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit("setError")
          reject(err)
        })
      })
    },
    rooms({ commit }) {
      return new Promise((resolve, reject) => {
        instance.get("rooms", {
          method: "get",
          withCredentials: true
        }
        ).then(response => {
          const rooms = response.data
          commit('setRooms', rooms)

          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit('setError')
          reject(err)
        })
      })
    },

    addRoom({ commit }, room) {
      return new Promise((resolve, reject) => {
        instance.post("rooms", room, { withCredentials: true }
        ).then(response => {
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    roomDetails({ commit }, roomId) {
      return new Promise((resolve, reject) => {
        instance.get("rooms/" + roomId, { withCredentials: true }
        ).then(response => {
          const room = response.data
          commit("setRoomDetails", room)
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    deleteRoom({ commit }, id) {
      return new Promise((resolve, reject) => {
        instance.delete("rooms/" + id, { withCredentials: true }
        ).then(response => {
          notify({
            title: "Success",
            text: response.data
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    modifyRoom({ commit }, { room, roomId }) {
      //console.log(room)
      return new Promise((resolve, reject) => {
        instance.patch("rooms/" + roomId, {
          name: room.name,
          details: room.details,
          floor: room.floor
        }, { withCredentials: true }
        ).then(response => {
          notify({
            title: "Success",
            text: "Room updated"
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit("setError")
          reject(err)
        })
      })
    },


    roomSlots({ commit }, { roomId, filter }) {
      return new Promise((resolve, reject) => {
        instance.get("rooms/" + roomId + "/slots?start=" + filter.start + "&end=" + filter.end, { withCredentials: true }
        ).then(response => {
          const intervals = response.data
          //console.log(intervals)
          commit("setDateReservations", intervals)
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    bookRoom({ commit }, reservation) {
      return new Promise((resolve, reject) => {
        instance.post("users/me/bookings", {
          room: { self: reservation.room.self },
          start: reservation.start,
          end: reservation.end
        }, { withCredentials: true }).then(response => {
          notify({
            title: "Success",
            text: "Reservation added"
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit('setError')
          reject(err)
        })
      })
    },

    deleteUserReservation({ commit }, id) {
      return new Promise((resolve, reject) => {
        instance.delete("users/me/bookings/" + id, { withCredentials: true }
        ).then(response => {
          notify({
            title: "Success",
            text: "Reservation deleted"
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    userReservations({ commit }, filter) {
      //console.log(filter)
      return new Promise((resolve, reject) => {
        instance.get("users/me/bookings?start=" + filter.start + "&end=" + filter.end, { withCredentials: true }
        ).then(response => {
          commit("setUserReservations", response.data)
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    bookingDetails({ commit }, bookingId) {
      return new Promise((resolve, reject) => {
        instance.get("users/me/bookings/" + bookingId, { withCredentials: true }
        ).then(response => {
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    floors({ commit }) {
      return new Promise((resolve, reject) => {
        instance.get("floors", { withCredentials: true }
        ).then(response => {
          commit("setFloors", response.data)
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    changePassword({ commit }, { old_password, new_password }) {
      return new Promise((resolve, reject) => {
        //console.log(old_password, new_password)
        instance.patch("users/me/password",
          {
            old_password: old_password,
            new_password: new_password
          }, { withCredentials: true }
        ).then(response => {
          notify({
            title: "Success",
            text: response.data
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    recoverPassword({commit}, username) {
      return new Promise((resolve, reject) => {
        instance.post("recovery",
          {username}, { withCredentials: true }
        ).then(response => {
          notify({
            title: "Success",
            text: response.data
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    filterRoomsByFloor({ commit }, floor) {
      return new Promise((resolve, reject) => {
        instance.get("rooms?floor=" + floor,
          { withCredentials: true }
        ).then(response => {
          commit("setRooms", response.data)
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.details
          })
          commit('setError')
          reject(err)
        })
      })
    },

    changeRole({ commit }, user) {
      return new Promise((resolve, reject) => {
        let userId = user.self.replace("/api/v1/users/", "")
        instance.patch("users/" + userId,
          {
            is_admin: !user.is_admin
          }, { withCredentials: true }
        ).then(response => {
          notify({
            title: "Success",
            text: "Role changed"
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    userEmails({ commit }) {
      return new Promise((resolve, reject) => {
        instance.get("users/me/emails", { withCredentials: "true" }
        ).then(response => {
          commit("setUserEmails", response.data)
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    channels({ commit }) {
      return new Promise((resolve, reject) => {
        instance.get("channels", { withCredentials: true }
        ).then(response => {
          commit("setChannels", response)
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    addEmail({ commit }, email) {
      return new Promise((resolve, reject) => {
        instance.post("users/me/emails",
          { email: email }, { withCredentials: true }
        ).then(response => {
          notify({
            title: "Success",
            text: "Email added"
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.details
          })
          commit("setError")
          reject(err)
        })
      })
    },
    //TODO: fix method
    userChannels({ commit }) {
      return new Promise((resolve, reject) => {
        instance.get("users/me/subscriptions", { withCredentials: true }
        ).then(response => {
          let channelsId = response.data
          let userChannels = []
          this.dispatch("channels"
          ).then(() => {
            this.state.channels.forEach(channel => {
              channelsId.forEach(ch => {
                if (channel.self === ch.self) {
                  userChannels.push(channel)
                }
              })
            })
          }).catch(err => {
            console.log(err)
          })
          commit("setUserChannels", response)
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    addChannel({ commit }, channel) {
      return new Promise((resolve, reject) => {
        instance.post("channels",
          {
            name: channel.name,
            description: channel.description,
            array: channel.array
          }, { withCredentials: true }
        ).then(response => {
          notify({
            title: "Success",
            text: response.data
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    deleteChannel({ commit }, channelId) {
      return new Promise((resolve, reject) => {
        instance.delete("channels/" + channelId,
          { withCredentials: true }
        ).then(response => {
          notify({
            title: "Success",
            text: response.data
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    subscribeUserToChannel({ commit }, channel) {
      return new Promise((resolve, reject) => {
        instance.post("users/me/channels",
          {
            name: channel.name,
            description: channel.description,
            array: channel.array
          }, { withCredentials: true }
        ).then(response => {
          notify({
            title: "Success",
            text: response.data
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    unsubscribeUserFromChannel({ commit }, channelId) {
      return new Promise((resolve, reject) => {
        instance.delete("users/me/channels/" + channelId,
          { withCredentials: true }
        ).then(response => {
          notify({
            title: "Success",
            text: response.data
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    channelDetails({ commit }, channelId) {
      return new Promise((resolve, reject) => {
        instance.get("channels/" + channelId, { withCredentials: true }
        ).then(response => {
          const channel = response.data
          commit("setChannelDetails", channel)
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    channelEvents({ commit }, channelId) {
      return new Promise((resolve, reject) => {
        instance.get("channels/" + channelId + "/events", { withCredentials: true }
        ).then(response => {
          commit("setChannelDetails", response.data)
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    channelNews({ commit }, channelId) {
      return new Promise((resolve, reject) => {
        instance.get("channels/" + channelId + "/news", { withCredentials: true }
        ).then(response => {
          commit("setChannelDetails", response.data)
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    userEvents({ commit }) {
      return new Promise((resolve, reject) => {
        instance.get("users/me/events", { withCredentials: true }
        ).then((response) => {
          commit("setUserEvents", response.data)
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    attendEvent({ commit }, event) {
      return new Promise((resolve, reject) => {
        instance.post("users/me/events", event, { withCredentials: true }
        ).then(response => {
          notify({
            title: "Success",
            text: response.data
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    desertEvent({ commit }, eventId) {
      return new Promise((resolve, reject) => {
        instance.delete("users/me/events/" + eventId, { withCredentials: true }
        ).then(response => {
          notify({
            title: "Success",
            text: response.data
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    administratedChannels({ commit }) {
      return new Promise((resolve, reject) => {
        instance.get("users/me/president", { withCredentials: true }
        ).then(response => {
          commit("setAdministratedChannels", response.data)
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.details
          })
          commit("setError")
          reject(err)
        })
      })
    },

    deleteEmail({ commit }, id) {
      return new Promise((resolve, reject) => {
        instance.delete("user/me/emails/" + id, { withCredentials: true }
        ).then(response => {
          notify({
            title: "Success",
            text: response.data
          })
          resolve(response)
        }).catch(err => {
          notify({
            title: "Error",
            text: err.response.data.details
          })
          commit("setError")
          reject(err)
        })
      })
    }
  },

  modifyChannel({ commit }, { channel, channelId }) {
    //console.log(room)
    return new Promise((resolve, reject) => {
      instance.patch("channels/" + channelId, {
        name: channel.name,
        description: channel.description,
      }, { withCredentials: true }
      ).then(response => {
        notify({
          title: "Success",
          text: response.data
        })
        resolve(response)
      }).catch(err => {
        notify({
          title: "Error",
          text: err.response.data.details
        })
        commit("setError")
        reject(err)
      })
    })
  },

  //TODO: subscribers are only ids -> return entire user object instead
  channelSubscribers({ commit }, channelId) {
    return new Promise((resolve, reject) => {
      instance.get("channels/" + channelId + "/subscribers", { withCredentials: true }
      ).then(response => {
        let subscribersId = response.data
        let subscribers = []
        this.dispatch("users"
        ).then(() => {
          this.state.users.forEach(user => {
            subscribersId.forEach(sub => {
              if (sub.self === user.self) {
                subscribers.push(user)
              }
            })
          })
        }).catch(err => {
          console.log(err)
        })
        commit("setChannelSubscribers", subscribers)
        resolve(response)
      }).catch(err => {
        notify({
          title: "Error",
          text: err.response.data.details
        })
        commit("setError")
        reject(err)
      })
    })
  },


  addNews({ commit }, { news, channelId }) {
    return new Promise((resolve, reject) => {
      instance.post("channels/" + channelId + "/news/", news, { withCredentials: true }
      ).then(response => {
        notify({
          title: "Success",
          text: response.data
        })
        resolve(response)
      }).catch(err => {
        notify({
          title: "Error",
          text: err.response.data.details
        })
        commit("setError")
        reject(err)
      })
    })
  },

  deleteNews({ commit }, { newsId, channelId }) {
    return new Promise((resolve, reject) => {
      instance.delete("channels/" + channelId + "/news/" + newsId, { withCredentials: true }
      ).then(response => {
        notify({
          title: "Success",
          text: response.data
        })
        resolve(response)
      }).catch(err => {
        notify({
          title: "Error",
          text: err.response.data.details
        })
        commit("setError")
        reject(err)
      })
    })
  },

  modifyNews({ commit }, { news, newsId, channelId }) {
    //console.log(room)
    return new Promise((resolve, reject) => {
      instance.patch("channels/" + channelId + "/news/" + newsId, {
        title: news.title,
        date: news.date,
        body: news.body
      }, { withCredentials: true }
      ).then(response => {
        notify({
          title: "Success",
          text: response.data
        })
        resolve(response)
      }).catch(err => {
        notify({
          title: "Error",
          text: err.response.data.details
        })
        commit("setError")
        reject(err)
      })
    })
  },

  addEvent({ commit }, { event, channelId }) {
    return new Promise((resolve, reject) => {
      instance.post("channels/" + channelId + "/events/", event, { withCredentials: true }
      ).then(response => {
        notify({
          title: "Success",
          text: response.data
        })
        resolve(response)
      }).catch(err => {
        notify({
          title: "Error",
          text: err.response.data.details
        })
        commit("setError")
        reject(err)
      })
    })
  },

  deleteEvent({ commit }, { eventId, channelId }) {
    return new Promise((resolve, reject) => {
      instance.delete("channels/" + channelId + "/events/" + eventId, { withCredentials: true }
      ).then(response => {
        notify({
          title: "Success",
          text: response.data
        })
        resolve(response)
      }).catch(err => {
        notify({
          title: "Error",
          text: err.response.data.details
        })
        commit("setError")
        reject(err)
      })
    })
  },

  modifyEvent({ commit }, { event, eventId, channelId }) {
    return new Promise((resolve, reject) => {
      instance.patch("channels/" + channelId + "/events/" + eventId, {
        name: event.name,
        description: event.description,
        start: event.start,
        end: event.end,
        room: event.room
      }, { withCredentials: true }
      ).then(response => {
        notify({
          title: "Success",
          text: response.data
        })
        resolve(response)
      }).catch(err => {
        notify({
          title: "Error",
          text: err.response.data.details
        })
        commit("setError")
        reject(err)
      })
    })
  },
  modules: {}
})
