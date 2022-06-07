<script>
/* 
* Shows informations: description, admins informations, ...
* Shows a subscribe buttons (when first subscribed )
* Shows a list of events (can decide to partecipate if subscribed) and news 
*/
import { defineComponent } from "vue"
import CustomEvents from "@/components/CustomEvents.vue"
import CustomNews from "@/components/CustomNews.vue"

export default defineComponent({
    props: ["id", "isSubscribed"],
    data() {
        return {
            channel: {},
            showNews: false,
            showEvents: false,
            users: [],
            ready: 0
        }
    },

    components: {
        CustomEvents, CustomNews
    },

    computed: {
        loadedChannel() {
            return this.$store.getters.getChannelDetails
        },
        loadedEvents() {
            return this.$store.getters.getChannelEvents
        },
        loadedNews() {
            return this.$store.getters.getChannelNews
        },
        loadedUser() {
            return this.$store.getters.getUsers
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

        this.$store.dispatch("channelDetails", this.id
        ).then(() => {
            this.channel = this.loadedChannel;
            this.ready += 1
            //console.log(this.channel)
        }).catch(err => {
            console.log(err)
        })


    },

    methods: {
        getAvatar(name) {
            let avatarText = ""
            name.split(" ").forEach(word => {
                avatarText = avatarText + word[0]
            });
            return avatarText
        },

        toggleEvents() {
            this.showEvents = !this.showEvents
            this.showNews = false
        },

        toggleNews() {
            this.showNews = !this.showNews
            this.showEvents = false
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
                        admins.push({ name: user.first_name + " " + user.middle_name + " " + user.surname })
                    }
                })
            })
            //console.log(admins)
            return admins
        }
    }

})

</script>

<template>

    <div v-if="ready === 2" class="container mb-3">
        <div class="row">
            <div class="col">
                <div class="card">
                    <div class="card-body">
                        <h2 class="card-header mb-5">
                            <div class="row">
                                <div class="col">{{ channel.name }}</div>
                                <div class="col text-end">
                                    <button v-if="isSubscribed" class="btn btn-primary"> Unsubscribe</button>
                                    <button v-else class="btn btn-primary"> Subscribe</button>
                                </div>
                            </div>
                        </h2>
                        <div class="container">
                            <div class="row align-items-center">
                                <div class="col ">
                                    <span class="avatar avatar-text error rounded-3 me-3 mb-2">{{
                                            getAvatar("ChannelName")
                                    }}</span>
                                </div>
                                <div class="col-10 text-center">
                                    <h5>{{ channel.description }}</h5>
                                </div>
                                <div class="col"></div>
                            </div>
                            <div class="row mt-3">
                                <div class="col">
                                    <span v-for="(admin, i) in this.getAdmins(channel)" :key="i"
                                        class="badge bg-secondary me-1 mb-1"> {{ admin.name }}</span>
                                </div>
                                <div class="col"></div>
                                <div class="col text-end">
                                    <button class="btn btn-primary me-2" @click="toggleEvents()"> Show Events </button>
                                    <button class="btn btn-primary me-2" @click="toggleNews()"> Show News </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <CustomEvents v-if="showEvents" :channelId="this.id" :isSubscribed="this.isSubscribed"
        :channelName="this.channel.name"></CustomEvents>
    <CustomNews v-if="showNews" :channelId="this.id" :channelName="this.channel.name"></CustomNews>
    <div class="text-center mt-2">
        <button class="btn btn-primary" @click="this.$router.push({ path: '/clubs' })"> Go back to clubs list</button>
    </div>
</template>

<style>
</style>