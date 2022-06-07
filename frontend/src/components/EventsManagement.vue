<script>
import { Modal } from "bootstrap"
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

export default {
    components: {
        Datepicker
    },
    props: ["channelId"],
    data() {
        return {
            events: [],
            printableEvents: [],
            chosenEvent: {},

            rooms: [],
            roomsList: "",

            minDate: "",
            maxDate: "",
            startDate: "",
            endDate: ""
        }
    },
    created() {
        this.minDate = new Date()
        this.maxDate = new Date(new Date().setDate(this.minDate.getDate() + 30));
        this.startDate = new Date()
        this.startDate.setMinutes(0);
        this.endDate = new Date()
        this.endDate.setMinutes(0);
    },
    computed: {
        loadedEvents() {
            return this.$store.getters.getChannelEvents
        },
        loadedRooms() {
            return this.$store.getters.getRooms
        }
    },
    mounted() {
        this.$store.dispatch("channelEvents", this.channelId
        ).then(() => {
            this.events = this.loadedEvents
            this.getprintableEvents()
        }).catch(err => {
            console.log(err)
        })

        this.$store.dispatch("rooms"
        ).then(() => {
            this.rooms = this.loadedRooms
        }).catch(err => {
            console.log(err)
        })
    },

    methods: {
        addEvent() {
            let name = this.chosenEvent.name
            let start = this.startDate.toISOString()
            let end = this.endDate.toISOString()
            let description = this.chosenEvent.description
            let channel = {self: this.channelId}
            let roomId = {self: ""}
            this.rooms.forEach(room=>{
                if(room.name === this.chosenEvent.room){
                    roomId.self = room.self
                }
            })
            const event = {
                name, channel, description, start, end, roomId
            }
            let id = this.channelId
            this.$store.dispatch("addEvent", { event, id }
            ).then(() => {
                this.$store.dispatch("channelEvents", this.channelId
                ).then(() => {
                    this.events = this.loadedEvents
                }).catch(err => {
                    console.log(err)
                })
            }).catch(err => {
                console.log(err)
            })
            this.chosenEvent = {}
            this.hideModal('addEvent')
        },

        deleteEvent(event) {
            this.$store.dispatch("deleteEvent", event
            ).then(() => {
                this.$store.dispatch("channelEvent", this.channelId
                ).then(response => {
                    this.$store.commit("setChannelEvent", response.data)
                    this.events = this.loadedEvents
                    //console.log(this.users)
                }).catch(err => {
                    console.log(err)
                })
            }).catch(err => {
                console.log(err);
            });
            this.hideModal('deleteEvents')
        },

        modifyEvent(printableEvent) {
            let event = this.events.filter(el => el.self === printableEvent.self)
            event.start = event.start.toISOString()
            event.end = event.end.toISOString()
            console.log(event)
            this.$store.dispatch("modifyEvent", event
            ).then(() => {
                this.$store.dispatch("channelEvent", this.channelId
                ).then(response => {
                    this.$store.commit("setChannelEvent", response.data)
                    this.events = this.loadedEvents
                }).catch(err => {
                    console.log(err)
                })
            }).catch(err => {
                console.log(err)
            })
            this.hideModal("modifyEvent")
        },
        handleStartDate(modelData) {
            this.startDate = modelData
            this.startDate.value = "" + this.startDate.getDate() + "/" + (this.startDate.getMonth() + 1) + "/" + this.startDate.getFullYear()
            this.endDate = this.startDate
        },
        handleEndDate(modelData) {
            this.endDate = modelData
            this.endDate.value = "" + this.endDate.getDate() + "/" + (this.endDate.getMonth() + 1) + "/" + this.endDate.getFullYear()
        },
        getPrintableEvents() {
            this.printableEvents = []
            this.events.forEach(event => {
                let startTime = new Date(event.start)
                let endTime = new Date(event.end)
                let interval = ("0" + startTime.getHours()).slice(-2) + ":" + ("0" + startTime.getMinutes()).slice(-2) + " - " + ("0" + endTime.getHours()).slice(-2) + ":" + ("0" + endTime.getMinutes()).slice(-2)
                let date = ("0" + startTime.getDate()).slice(-2) + "/" + ("0" + (startTime.getMonth() + 1)).slice(-2) + "/" + startTime.getFullYear()
                let room = ""
                this.rooms.forEach(room => {
                    if (room.self === event.room.self) {
                        room = room.name
                    }
                })
                let res = {
                    self: event.self,
                    name: event.name,
                    channel: this.channelId,
                    description: event.description,
                    date: date,
                    time: interval,
                    room: room
                }
                this.printableEvents.push(res)
            })
        },

        revertChanges() {
            this.$store.dispatch("channelEvents", this.channelId
            ).then(response => {
                this.$store.commit("setChannelEvents", response.data)
                this.events = this.loadedEvents
            }).catch(err => {
                console.log(err)
            })
            this.hideModal("modifyEvents")
        },

        hideModal(modalId) {
            const myModalEl = document.getElementById(modalId)
            const modal = Modal.getInstance(myModalEl)
            modal.hide()
        }
    }
}
</script>

<template>

    <div class="container">
        <div class="row">
            <div class="col ">
                <div class="card">
                    <h5 class="card-header">Club events</h5>
                    <div class="card-body">
                        <div class="text-end">
                            <button type="button" class="btn btn-primary" data-bs-toggle="modal"
                                data-bs-target="#addEvent"> Add event </button>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-striped table-responsive text-center ">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Name</th>
                                        <th scope="col">Date</th>
                                        <th scope="col">Time</th>
                                        <th scope="col">Room</th>
                                        <th scope="col">Description</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(event, i) in this.printableEvents" :key="i">
                                        <th scope="row">{{ i + 1 }}</th>
                                        <td>{{ event.name }}</td>
                                        <td>{{ event.date }}</td>
                                        <td>{{ event.time }}</td>
                                        <td>{{ event.room }}</td>
                                        <td>{{ event.description }}</td>
                                        <td>
                                            <button @click="chosenEvent = event" class="btn btn-primary"
                                                data-bs-toggle="modal" data-bs-target="#modifyEvent"> Modify</button>
                                            <button @click="chosenEvent = event" class="btn btn-primary"
                                                data-bs-toggle="modal" data-bs-target="#deleteEvent">Delete </button>
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

    <!--modals-->
    <div class="modal fade" id="addEvent" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">
                        <h1 class="h3 mb-3 fw-normal">Insert event information</h1>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"
                        @click="this.revertChanges()"></button>
                </div>
                <div class="modal-body">
                    <form class="p-4 p-md-5 border rounded-3 bg-light">
                        <div class="form-floating mb-3">
                            <input v-model="chosenEvent.name" type="text" class="form-control" placeholder="Title">
                            <label for="floatingInput">Name</label>
                        </div>
                        <div class="form-floating mb-3">
                            <div class="container">
                                <div class="row">
                                    <div class="col">
                                        <Datepicker v-model="startDate" placeholder="Select start date"
                                            :cleareble="true" @update:modelValue="handleStartDate" :minDate="minDate"
                                            :maxDate="maxDate" minutesIncrement="15" />
                                    </div>
                                    <div class="col">
                                        <Datepicker v-model="endDate" placeholder="Select end date" :cleareble="true"
                                            @update:modelValue="handleEndDate" :minDate="minDate" :maxDate="maxDate"
                                            minutesIncrement="15" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="form-floating mb-3">
                            <div class="input-group mb-3">
                                <button class="btn btn-outline-primary dropdown-toggle" type="button"
                                    data-bs-toggle="dropdown" aria-expanded="false"> </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li v-for="room in this.rooms" :key="room.slef">
                                        <a class="dropdown-item"
                                            @click="roomsList = roomsList + room.name + ' '">{{ room.name }} </a>
                                    </li>
                                </ul>
                                <input v-model="roomsList" type="text" id="rooms" class="form-control"
                                    placeholder="Room">

                            </div>
                        </div>

                        <div class="form-floating mb-3">
                            <textarea v-model="chosenEvent.description" class="form-control" placeholder="details"
                                rows="10"></textarea>
                            <label for="floatingInput">Description</label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"
                        @click="this.revertForm()">Close</button>
                    <button type="button" class="btn btn-primary" @click="addEvent()">Confirm</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="deleteEvent" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Delete profile</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Are you sure you want to delete this event? This action will be permanent.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary"
                        @click="deleteEvent(this.chosenEvent)">Confirm</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="modifyEvent" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Change event informations</h5>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="mb-3">
                            <label class="col-form-label">Name</label>
                            <input type="text" class="form-control" v-model="chosenEvent.name">
                        </div>
                        <div class="mb-3">
                            <div class="form-floating mb-3">
                                <div class="container">
                                    <div class="row">
                                        <div class="col">
                                            <Datepicker v-model="startDate" placeholder="Select start date"
                                                :cleareble="true" @update:modelValue="handleStartDate"
                                                :minDate="minDate" :maxDate="maxDate" minutesIncrement="15" />
                                        </div>
                                        <div class="col">
                                            <Datepicker v-model="endDate" placeholder="Select end date"
                                                :cleareble="true" @update:modelValue="handleEndDate" :minDate="minDate"
                                                :maxDate="maxDate" minutesIncrement="15" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="form-floating mb-3">
                                <div class="input-group mb-3">
                                    <button class="btn btn-outline-primary dropdown-toggle" type="button"
                                        data-bs-toggle="dropdown" aria-expanded="false"> </button>
                                    <ul class="dropdown-menu dropdown-menu-end">
                                        <li v-for="room in this.rooms" :key="room.slef">
                                            <a class="dropdown-item"
                                                @click="roomsList = roomsList + room.name + ' '">{{ room.name }} </a>
                                        </li>
                                    </ul>
                                    <input v-model="roomsList" type="text" id="rooms" class="form-control"
                                        placeholder="Room">

                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="col-form-label">Description</label>
                            <textarea type="text" class="form-control" v-model="chosenEvent.description"
                                rows="5"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary"
                        @click="revertChanges(this.chosenEvent)">Close</button>
                    <button type="submit" class="btn btn-primary" @click="modifyEvent(this.chosenEvent)">Confirm
                        changes</button>
                </div>

            </div>
        </div>
    </div>

</template>

<style>
</style>