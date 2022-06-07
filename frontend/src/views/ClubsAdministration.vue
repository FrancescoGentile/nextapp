<script>
/*
* This page is only visible by channel administratos
* Used to add/remove/modify events and news from channel
* Show first list of all channels administrated by the user, cliking on a channel toggles the informations about that channel 
*/
import { defineComponent } from "vue"
import { Modal } from "bootstrap";
import EventsManagement from "@/components/EventsManagement.vue";
import NewsManagement from "@/components/NewsManagement.vue";

export default defineComponent({
    data() {
        return {
            channels: [],
            chosenChannel: {},
            insertedChannel: {},
            selectedChannel: {},
            subscribers: [],
            chosenUser: {},
            showDetails: false,
            showEvents: false,
            showNews: false
        };
    },
    computed: {
        loadedAdministratedChannels() {
            return this.$store.getters.getAdministratedChannels;
        },
        loadedChannel() {
            return this.$store.getters.getChannelDetails;
        },
        loadedSubscribers() {
            return this.$store.getters.getChanneSubscribers;
        }
    },
    mounted() {
        this.$store.dispatch("administratedChannels").then(() => {
            this.channels = this.loadedAdministratedChannels;
        }).catch(err => {
            console.log(err);
        });
    },
    methods: {
        chooseChannel(channel) {
            this.chooseChannel = channel;
            this.showDetails = true;
            this.$store.dispatch("channelSubscribers", channel).then(() => {
                this.subscribers = this.loadedSubscribers;
            }).catch(err => {
                console.log(err);
            });
        },
        modifyChannel(channel) {
            this.$store.dispatch("modifyChannel", channel).then(() => {
                this.choosenChannel = channel;
                this.$store.commit("setChanneletails", this.channel);
            }).catch(err => {
                console.log(err);
            });
            this.hideModal("modifyChannel");
        },

        //yet to be implemnted in store
        removeUser(user) {
            let ch = this.chooseChannel
            this.$store.dispatch("banUser", {ch, user}).then(() => {
                this.subscribers = this.subscribers.filter(res => res.self !== user.self);
                this.$store.commit("setChannelSubscribers", this.subscribers);
            }).catch(err => {
                console.log(err);
            });
            this.hideModal("confirm");
        },

        revertChanges(channel) {
            this.$store.dispatch("channelDetails", channel).then(() => {
                this.chosenChannel = this.loadedChannel;
            }).catch(err => {
                console.log(err);
            });
            this.hideModal("modifyChannel");
        },

        toggleNews() {
            this.showNews = !this.showNews;
            this.showEvents = false;
        },
        
        toggleEvents() {
            this.showEvents = !this.showEvents;
            this.showNews = false;
        },

        getAvatar(name) {
            let avatarText = "";
            name.split(" ").forEach(word => {
                avatarText = avatarText + word[0];
            });
            return avatarText;
        },

        hideModal(modalId) {
            const myModalEl = document.getElementById(modalId);
            const modal = Modal.getInstance(myModalEl);
            modal.hide();
        }
    },
    components: { NewsManagement, EventsManagement }
})


</script>

<template>
    <!--list of channels-->
    <div v-if="channels.length === 0">
        <h3 class="text-center"> You aren't the administrator of any channel</h3>
        <h3 class="text-center"> If you would like to contribute to the administration of any club you can found the list here
            <div class="text-center">
                <button @click="this.$router.push('/clubs')" class="btn btn-primary"> Go to clubs list</button>
            </div>
        </h3>
    </div>
    <div v-else>
        <div class="container">
            <div class="text-center mb-2 mt-5">
                <h3>Clubs</h3>
            </div>
            <div v-for="channel in this.channels" :key="channel.self" class="card mb-3">
                <div class="card-body">
                    <div class="d-flex flex-column flex-lg-row align-items-center">
                        <span class="avatar avatar-text error rounded-3 me-3 mb-2">{{ getAvatar(channel.name) }}</span>
                        <div class="col-sm-3">
                            <h4 class="h5"> {{ channel.name }} </h4>
                            <span v-for="(admin, i) in channel.array" :key="i" class="badge bg-secondary me-1 mb-1">{{
                                    admin
                            }}</span>
                        </div>
                        <div class="col-sm-5 py-2 ms-2"> {{ channel.description }} </div>
                        <div class="col-sm-3 text-lg-end">
                            <div class="btn-group-vertical">
                                <button @click="chosenChannel = channel" class="btn btn-primary" data-bs-toggle="modal"
                                    data-bs-target="#modifyChannel">
                                    Modify Info </button>
                                <button @click="chooseChannel(channel)" class="btn btn-primary stretched-link">See
                                    Details</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!--list of subscribers-->
        <div v-if="showDetails" class="container">
            <div class="row">
                <div class="col">
                    <h3 class="text-center">Subscribers</h3>
                    <table class="table table-striped table-responsive text-center">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Username</th>
                                <th scope="col">Name</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(user, i) in chosenChannel.subscribers" :key="i">
                                <th scope="row">{{ i + 1 }}</th>
                                <td> {{ user.username }} </td>
                                <td> {{ user.first_name }} {{ user.middle_name }} {{ user.surname }}</td>
                                <td>
                                    <button class="btn btn-primary align-end" data-bs-toggle="modal"
                                        data-bs-target="#confirm" @click="chosenUser = user">
                                        Remove User
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="text-center">
                <button @click="toggleEvents()" class="btn btn-primary"> Show Events</button>
                <button @click="toggleNews()" class="btn btn-primary"> Show Events</button>
            </div>
        </div>
        <NewsManagement v-if="showNews" :channelId="chosenChannel.self"></NewsManagement>
        <EventsManagement v-if="showEvents" :channelId="chosenChannel.self"></EventsManagement>

    </div>


    <!-- modals -->
    <div class="modal fade" id="modifyChannel" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Change channel's informations</h5>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="mb-3">
                            <label class="col-form-label">Name</label>
                            <input type="text" class="form-control" v-model="chosenChannel.name">
                        </div>
                        <div class="mb-3">
                            <label class="col-form-label">Details</label>
                            <textarea type="text" class="form-control" v-model="chosenChannel.description"
                                rows="10"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary"
                        @click="revertChanges(this.chooseChannel)">Close</button>
                    <button type="submit" class="btn btn-primary" @click="modifyChannel(this.chosenChannel)">Confirm
                        changes</button>
                </div>

            </div>
        </div>
    </div>

    <div class="modal fade" id="confirm" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1"
        aria-labelledby="staticBackdropLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="staticBackdropLabel">Confirm deletion</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Are you sure you want to ban this user from the club?
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
                    <button type="button" class="btn btn-primary" @click="removeUser(chosenUser)">Yes</button>
                </div>
            </div>
        </div>
    </div>


</template>


<style>
</style>