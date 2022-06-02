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
      userChannels: []
    }
  },

  computed: {
    loadedChannels() {
      return this.$store.getters.getChannels
    },
    loadedUserChannels() {
      return this.$store.getters.getUserChannels
    }
  },

  mounted() {
    this.$store.dispatch("channels"
    ).then(() => {
      this.channels = this.loadedChannels
    }).catch(err => {
      console.log(err)
    })

    this.$store.dispatch("userChannels"
    ).then(() => {
      this.userChannels = this.loadedUserChannels
    }).catch(err => {
      console.log(err)
    })
  },

  methods: {
    unsubscribeFromChannel(channel) {
      this.$store.dispatch("unsubscribeUserFromChannel", channel.self
      ).then(() => {
        this.userChannels.filter(item => item.self !== channel.self)
        this.loadedUserChannels = this.userChannels
      }).catch(err => {
        console.log(err)
      })
    },

    subscribeToChannel(channel) {
      this.$store.dispatch("subscribeUserToChannel", channel
      ).then(() => {
        this.userChannels.push(channel)
        this.loadedUserChannels = this.userChannels
      }).catch(err => {
        console.log(err)
      })
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
    }
  }

})
</script>

<template >
  <div class="container">
    <div class="text-center mb-2">
      <h3>Clubs</h3>
    </div>
    <div class="card mb-3">
      <div class="card-body">
        <div class="d-flex flex-column flex-lg-row align-items-center">
          <span class="avatar avatar-text error rounded-3 me-3 mb-2">{{ getAvatar("Channel Name") }}</span>
          <div class="col-sm-3">
            <h4 class="h5">Name</h4>
            <span class="badge bg-secondary me-1 mb-1">Administrators</span>
            <span class="badge bg-secondary me-1 mb-1">Administrators</span>
            <span class="badge bg-secondary me-1 mb-1">Administrators</span>
            <span class="badge bg-secondary me-1 mb-1">Administrators</span>
          </div>
          <div class="col-sm-5 py-2 ms-2">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo quidem eum, suscipit nobis cupiditate
            excepturi laboriosam. Aperiam iusto facere soluta porro animi aliquid, ipsam deserunt. Tempora alias
            quisquam adipisci sunt!
          </div>
          <div class="col-sm-3 text-lg-end">
            <div class="btn-group-vertical">
              <button v-if="isSubscribed(channel)" @click="unsubscribeFromChannel(channel)"
                class="btn btn-primary mb-1"> Unsubscribe </button>
              <button v-else @click="subscribeToChannel(channel)" class="btn btn-primary mb-1"> Subscribe </button>
              <button @click="this.$router.push({ name: 'clubDetails', params: { id: 1, isSubscribed: true } })"
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