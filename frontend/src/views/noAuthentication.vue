<script>
import { defineComponent } from "vue";
    export default defineComponent({
        
    })
</script>

<template>
    <p>
        You need to log in before accessing the resource
    </p>
    <button @click="this.$router.push('/')">
        Go to homepage
    </button>
</template>
