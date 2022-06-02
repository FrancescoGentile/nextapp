<script>
/* 
* Shows list of clubs showing which ones the user is already subscribed to
* Button "" show channel details (description, news, events, admins)
*/
import { defineComponent } from "vue"

export default defineComponent({
    data(){
      return{
        channels: [],
        userChannels: []
      }
    },
    
    computed:{
      loadedChannels(){
        return this.$store.getters.getChannels
      },
      loadedUserChannels(){
        return this.$store.getters.getUserChannels
      }
    },
    
    mounted(){
      this.$store.dispatch("channels"
      ).then(()=>{
        this.channels = this.loadedChannels
      }).catch(err=>{
        console.log(err)
      })

      this.$store.dispatch("userChannels"
      ).then(()=>{
        this.userChannels = this.loadedUserChannels
      }).catch(err=>{
        console.log(err)
      })
    },

    methods:{
      getAvatar(name){
        let avatarText = ""
        name.split(" ").forEach(word => {
          avatarText = avatarText + word[0]
        });
        return avatarText
      },
      
      isSubscribed(channel){
        this.userChannels.forEach(item =>{
          if(item.self === channel.self){
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
    <div class="text-center mb-5">
      <h3>Clubs</h3>
    </div>
    <div class="card mb-3">
      <div class="card-body">
        <div class="d-flex flex-column flex-lg-row align-items-center">
          <span class="avatar avatar-text error rounded-3 me-4 mb-2">FD</span>
            <div class="col-sm-3">
              <h4 class="h5">Name</h4>
              <span class="badge bg-secondary">Administrators</span>
            </div>
            <div class="col-sm-5 py-2">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo quidem eum, suscipit nobis cupiditate excepturi laboriosam. Aperiam iusto facere soluta porro animi aliquid, ipsam deserunt. Tempora alias quisquam adipisci sunt!
            </div>
            <div class="col-sm-3 text-lg-end">
              <div class="btn-group-vertical">
                <button v-if="isSubscribed()" class="btn btn-primary mb-1"> Unsubscribe </button>
                <button v-else class="btn btn-primary mb-1"> Subscribe </button>
                <button @click="this.$router.push({name:'clubDetails', params:{id: 1, subscribed: isSubscribed()}})" class="btn btn-primary stretched-link">See details</button>
              </div>
              
            </div>
        </div>
      </div>
    </div>
    
  </div>
</template>


<style scoped>

.card {
    box-shadow: 0 20px 27px 0 rgb(0 0 0 / 5%);
}

.card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    word-wrap: break-word;
    background-color: #eee;
    background-clip: border-box;
    border: 0 solid rgba(0,0,0,.125);
    border-radius: 1rem;
}

.card-body {
    -webkit-box-flex: 1;
    -ms-flex: 1 1 auto;
    flex: 1 1 auto;
    padding: 1.5rem 1.5rem;
}
.avatar-text {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    background: red;
    color: #fff;
    font-weight: 700;
}

.avatar {
    width: 3rem;
    height: 3rem;
}
.rounded-3 {
    border-radius: 0.5rem!important;
}
.mb-2 {
    margin-bottom: 0.5rem!important;
}
.me-4 {
    margin-right: 1.5rem!important;
}

</style>