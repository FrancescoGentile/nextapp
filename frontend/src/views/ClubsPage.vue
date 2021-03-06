<script>
/* 
* Shows list of clubs showing which ones the user is already subscribed to
* Button to show channel details (description, news, events, admins)
*/
import { defineComponent } from "vue"

export default defineComponent({
  data() {
    return {
      channels: [],
      userChannels: [],
      users: [],
      user: [],
      searchedChannel: "",
      filteredChannel: "",
      showSearch: false,
      ready: 0
    }
  },

  computed: {
    loadedChannels() {
      return this.$store.getters.getChannels
    },
    loadedUserChannels() {
      return this.$store.getters.getUserChannels
    },
    loadedUsers() {
      return this.$store.getters.getUsers
    },
    loadedFilteredChannel() {
      return this.$store.getters.getSearchedChannel
    },
    loadedUser(){
      return this.$store.getters.getUser
    }
  },

  created() {
    this.$store.dispatch("users"
    ).then(() => {
      this.users = this.loadedUsers
      this.ready += 1
    }).catch(err => {
      console.log(err)
    })

    this.$store.dispatch("channels"
    ).then(() => {
      this.channels = this.loadedChannels
      this.ready += 1
    }).catch(err => {
      console.log(err)
    })

    this.$store.dispatch("userChannels"
    ).then(() => {
      this.userChannels = this.loadedUserChannels
      this.ready += 1
    }).catch(err => {
      console.log(err)
    })

  this.$store.dispatch("privateUser"
  ).then(() => {
      this.user = this.loadedUser
    }).catch(err => {
      console.log(err)
    })
    
  },

  methods: {
    unsubscribeFromChannel(channel) {
      let user = this.user
      this.$store.dispatch("unsubscribeUserFromChannel", {channel, user}
      ).then(() => {
        this.$store.dispatch("userChannels"
        ).then(() => {
          this.userChannels = this.loadedUserChannels
        }).catch(err => {
          console.log(err)
        })
      }).catch(err => {
        console.log(err)
      })
    },

    subscribeToChannel(channel) {
      let user = this.user
      this.$store.dispatch("subscribeUserToChannel", {channel, user}
      ).then(() => {
        this.$store.dispatch("userChannels"
        ).then(() => {
          this.userChannels = this.loadedUserChannels
        }).catch(err => {
          console.log(err)
        })
      }).catch(err => {
        console.log(err)
      })
    },

    searchChannel(name) {
      if (name === "") {
        this.showSearch = false
      } else {
        this.$store.dispatch("searchChannel", name
        ).then(() => {
          this.filteredChannel = this.loadedFilteredChannel
        }).catch(err => {
          console.log(err)
        })
      }
    },

    getAvatar(name) {
      let avatarText = ""
      name.split(" ").forEach(word => {
        avatarText = avatarText + word[0]
      });
      return avatarText
    },

    isSubscribed(channel) {
      this.userChannels.forEach(item => {
        if (item.self === channel.self) {
          return true
        }
      })
      return false
    },

    getAdmins(channel) {
      this.users = this.loadedUsers
      let admins = []
      //console.log(channel)
      this.users.forEach(user => {
        channel.presidents.forEach(admin => {
          //console.log(user.self)
          //console.log(admin[0].self)
          if (admin[0].self === user.self) {
            admins.push({name: user.first_name + " " + user.middle_name + " " + user.surname})
          }
        })
      })
      //console.log(admins)
      return admins
    }
  }



})
</script>

<template >
  <div v-if="ready===3" class="container">
    <div class="row">
      <div class="col">
        <h3>Clubs</h3>
      </div>
      <div class="col">
        <div class="input-group">
          <input v-model="this.searchedChannel" type="search" class="form-control rounded" placeholder="Search"
            aria-label="Search" aria-describedby="search-addon" />
          <button @click="searchChannel(this.searchedChannel)" type="button" class="btn btn-primary">Search</button>
        </div>
      </div>
    </div>
    <!-- search results-->
    <div v-if="showSearch" class="card mb-3">
      <div class="card-body">
        <div class="d-flex flex-column flex-lg-row align-items-center">
          <span class="avatar avatar-text error rounded-3 me-3 mb-2">{{ getAvatar(filteredChannel.name) }}</span>
          <div class="col-sm-3">
            <h4 class="h5">{{ filteredChannel.name }}</h4>
            <span v-for="(admin, i) in this.getAdmins(filteredChannel)" :key="i" class="badge bg-secondary me-1 mb-1">
              {{ admin.name }}</span>
          </div>
          <div class="col-sm-5 py-2 ms-2"> {{ filteredChannel.description }} </div>
          <div class="col-sm-3 text-lg-end">
            <div class="btn-group-vertical">
              <button v-if="isSubscribed(filteredChannel)" @click="unsubscribeFromChannel(filteredChannel)"
                class="btn btn-primary mb-1"> Unsubscribe </button>
              <button v-else @click="subscribeToChannel(filteredChannel)" class="btn btn-primary mb-1"> Subscribe
              </button>
              <button
                @click="this.$router.push({ name: 'clubDetails', params: { id: filteredChannel.self, isSubscribed: isSubscribed(filteredChannel) } })"
                class="btn btn-primary stretched-link">See details</button>
            </div>

          </div>
        </div>
      </div>
    </div>
    <div  v-for="channel in this.channels" :key="channel.self" class="card mb-3">
      <div class="card-body">
        <div class="d-flex flex-column flex-lg-row align-items-center">
          <span class="avatar avatar-text error rounded-3 me-3 mb-2">{{ getAvatar(channel.name) }}</span>
          <div class="col-sm-3">
            <h4 class="h5">{{ channel.name }}</h4>
            <span v-for="(admin, i) in this.getAdmins(channel)" :key="i" class="badge bg-secondary me-1 mb-1">
              {{ admin.name }}</span>
          </div>
          <div class="col-sm-5 py-2 ms-2"> {{ channel.description }} </div>
          <div class="col-sm-3 text-lg-end">
            <div class="btn-group-vertical">
              <button v-if="isSubscribed(channel)" @click="unsubscribeFromChannel(channel)"
                class="btn btn-primary mb-1"> Unsubscribe </button>
              <button v-else @click="subscribeToChannel(channel)" class="btn btn-primary mb-1"> Subscribe </button>
              <button
                @click="this.$router.push({ name: 'clubDetails', params: { id: channel.self, isSubscribed: isSubscribed(channel) } })"
                class="btn btn-primary stretched-link">See details</button>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>


<style>
</style>