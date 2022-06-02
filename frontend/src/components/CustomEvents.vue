<script>
import { defineComponent } from "vue"
export default defineComponent({
    props: ["channelId", "isSubscribed"],
    
    data() {
        return {
            events: []
        }
    },

    computed:{
        loadedEvents() {
            return this.$store.getters.getChannelEvents
        }
    },
    
    mounted() {
        this.$store.dispatch("channelEvents", this.channelId
        ).then(() => {
            this.events = this.loadedEvents;
        }).catch(err => {
            console.log(err)
        })
    }

})
</script>

<template>
    <div>
        Events {{channelId}}, {{isSubscribed}}
    </div>
</template>

<style>
</style>