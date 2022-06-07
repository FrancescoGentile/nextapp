<script>
/*
* Similar to the users management part: button to add new channel (add channel administrators at creation), list of channels with remove button
* After being created, a channel can only be modified by a member of that channel directive 
*/
import { defineComponent } from "vue"
import { Modal } from "bootstrap"

export default defineComponent({
    data() {
        return {
            channels: [],
            registeredChannel: {},
            selectedChannel: {},
            users: [],
            adminList: "",
            ready : 0
        }
    },

    computed: {
        loadedChannels() {
            return this.$store.getters.getChannels
        },
        loadedUsers() {
            return this.$store.getters.getUsers
        }
    },

    mounted() {
        this.$store.dispatch("users"
        ).then(() => {
            this.users = this.loadedUsers
            this.ready += 1
        }).catch(err => {
            console.log(err)
        })

        this.$store.dispatch("channels"
        ).then(() => {
            this.channels = this.loadedChannels
            this.ready += 1
        }).catch(err => {
            console.log(err)
        })


    },

    methods: {
        addChannel() {
            let admins = this.adminList.split(" ").filter(admin => admin.length > 1)
            this.registeredChannel.presID_array = []
            this.users.forEach(user => {
                admins.forEach(admin => {
                    if (admin === user.username) {
                        this.registeredChannel.presID_array.push(user.self.replace("/users/", ""))
                    }
                })
            })
            this.adminList = []
            console.log(this.registeredChannel)
            this.$store.dispatch("addChannel", this.registeredChannel
            ).then(() => {
                this.$store.dispatch("channels"
                ).then(() => {
                    this.channels = this.loadedChannels
                }).catch(err => {
                    console.log(err)
                })
            }).catch(err => {
                console.log(err)
            })
            this.hideModal("addChannel")
        },

        deleteChannel(channel) {
            this.$store.dispatch("deleteChannel", channel
            ).then(() => {
                this.$store.dispatch("channels"
                ).then(() => {
                    this.channels = this.loadedChannels
                }).catch(err => {
                    console.log(err)
                })
            }).catch(err => {
                console.log(err)
            })
            this.hideModal("deleteChannel")
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
        },

        hideModal(modalId) {
            const myModalEl = document.getElementById(modalId)
            const modal = Modal.getInstance(myModalEl)
            modal.hide()
        },
    }
})
</script>

<template>
    <div v-if="ready === 2" class="container">
        <div class="row">
            <div class="col ">
                <div class="card">
                    <h5 class="card-header">Clubs</h5>
                    <div class="card-body">
                        <div class="text-end">
                            <button type="button" class="btn btn-primary" data-bs-toggle="modal"
                                data-bs-target="#addChannel"> Add club </button>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-striped table-responsive text-center ">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Description</th>
                                        <th scope="col">Administrators</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(channel, i) in this.channels" :key="channel.self">
                                        <th scope="row">{{ i + 1 }}</th>
                                        <td>{{ channel.name }}</td>
                                        <td>{{ channel.description }}</td>
                                        <td>
                                            <p v-for="(admin, j) in getAdmins(channel)" :key="j"> {{ admin.name }}
                                            </p>
                                        </td>
                                        <td>
                                            <div class="text-right">
                                                <button type="button" class="btn btn-primary me-2"
                                                    data-bs-toggle="modal" data-bs-target="#deleteChannel"
                                                    @click="selectedChannel = channel"> Delete
                                                </button>

                                            </div>

                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div class="modal fade" id="addChannel" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">
                        <h1 class="h3 mb-3 fw-normal">Insert channel information</h1>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form class="p-4 p-md-5 border rounded-3 bg-light">
                        <div class="form-floating mb-3">
                            <input v-model="registeredChannel.name" type="text" class="form-control"
                                placeholder="channel name">
                            <label for="floatingInput">Name</label>
                        </div>
                        <div class="form-floating mb-3">
                            <textarea rows="5" v-model="registeredChannel.description" type="text" class="form-control"
                                placeholder="description"></textarea>
                            <label for="floatingInput">Description</label>
                        </div>

                        <div class="input-group mb-3">
                            <button class="btn btn-outline-primary dropdown-toggle" type="button"
                                data-bs-toggle="dropdown" aria-expanded="false"> </button>
                            <ul class="dropdown-menu dropdown-menu-end">
                                <li v-for="user in this.users" :key="user.self">
                                    <a class="dropdown-item" @click="adminList = adminList + user.username + ' '">{{
                                            user.username
                                    }} </a>
                                </li>
                            </ul>
                            <input v-model="adminList" type="text" id="administrators" class="form-control"
                                placeholder="Administrators">

                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" @click="addChannel()">Confirm</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="deleteChannel" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Delete channel</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Are you sure you want to delete this channel? This action will be permanent.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary"
                        @click="deleteChannel(selectedChannel)">Confirm</button>
                </div>
            </div>
        </div>
    </div>

</template>



<style>
</style>