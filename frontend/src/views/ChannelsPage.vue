<script>
/* 
* Shows list of clubs showing which ones the user is already subscribed to
* Button "" show channel details (description, news, events, admins)
*/
import { defineComponent } from "vue"

export default defineComponent({
    
})
</script>

<template >
    <div>
      list of all channels 
    </div>
    <button @click="this.$router.push({name:'ChannelDetails', params:{id: 1}})"> go to channel details</button>
</template>


<style>
    
</style>