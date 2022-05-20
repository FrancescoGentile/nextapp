<script>
import { defineComponent } from "vue";

export default defineComponent({
  computed:{
    user() {
      return this.$store.getters.getUser;
    }
  }
})


</script>

<template>
    <p> {{user.username}} dashboard</p>
</template>

<style scoped>

</style>