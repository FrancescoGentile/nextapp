<script>
import { defineComponent } from "vue"
export default defineComponent({
    props: ["channelId", "isSubscribed"],
    
    data() {
        return {
            news: []
        }
    },

    computed:{
        loadedNews() {
            return this.$store.getters.getChannelNews
        }
    },
    
    mounted() {
        this.$store.dispatch("channelNews", this.channelId
        ).then(() => {
            this.news = this.loadedNews;
        }).catch(err => {
            console.log(err)
        })
    }

})
</script>

<template>
    <div>
        News {{channelId}}, {{isSubscribed}}
    </div>
</template>

<style>
</style>