<script>
import {defineComponent} from "vue";
export default defineComponent({
  name: "RoomDetails",
  props:["id"],
  computed:{
    roomDetails(){
      return this.$store.getters.rooms[this.id]
    }
  },
  mounted:{

  }
})
</script>

<template>
  <h1> {{roomDetails.desciption}}</h1>
  <p>vtubi</p>
</template>

<style scoped>

</style>