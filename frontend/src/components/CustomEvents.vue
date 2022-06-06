<script>
import { defineComponent } from "vue"
export default defineComponent({
    props: ["channelId", "isSubscribed", "channelName"],

    data() {
        return {
            events: [],
            printableEvents: [],
            userEvents: [],
            rooms: []
        }
    },

    computed: {
        loadedEvents() {
            return this.$store.getters.getChannelEvents
        },
        loadedRooms() {
            return this.$store.getters.getRooms
        },
        loadedUserEvents() {
            return this.$store.getters.getUserEvents
        }
    },

    mounted() {
        this.$store.dispatch("channelEvents", this.channelId
        ).then(() => {
            this.events = this.loadedEvents;
            this.getPrintableEvents()
        }).catch(err => {
            console.log(err)
        })

        this.$store.dispatch("rooms"
        ).then(() => {
            this.rooms = this.loadedRooms
        }).catch(err => {
            console.log(err)
        })

        this.$store.dispatch("userEvents"
        ).then(() => {
            this.userEvents = this.loadedUserEvents
        }).catch(err => {
            console.log(err)
        })
    },

    methods: {
        getPrintableEvents() {
            this.printableEvents = []
            this.events.forEach(event => {
                let startTime = new Date(event.start)
                let endTime = new Date(event.end)
                let interval = ("0" + startTime.getHours()).slice(-2) + ":" + ("0" + startTime.getMinutes()).slice(-2) + " - " + ("0" + endTime.getHours()).slice(-2) + ":" + ("0" + endTime.getMinutes()).slice(-2)
                let date = ("0" + startTime.getDate()).slice(-2)
                let month = startTime.toLocaleString("default", { month: "long" })
                let room = ""
                this.rooms.forEach(room => {
                    if (room.self === event.room.self) {
                        room = room.name
                    }
                })
                let res = {
                    self: event.self,
                    name: event.name,
                    channel: this.channelName,
                    description: event.description,
                    date: date,
                    month: month,
                    time: interval,
                    room: room
                }
                this.printableEvents.push(res)
            })
        },

        isAttending(event) {
            this.userEvents.forEach(userEvent => {
                if (userEvent.self === event.self) {
                    return true
                }
                return false
            })
        },

        addUserEvent(printableEvent) {
            console.log("here")
            let event = this.events.filter(event => {
                event.self === printableEvent.self
            })
            this.$store.dispatch("attendEvent", event
            ).then(() => {
                this.userEvents.push(event)
                this.loadedUserEvents = this.userEvents
                this.getPrintableEvents()
            }).catch(err => {
                console.log(err)
            })
        },

        deleteUserEvent(event) {
            this.$store.dispatch("desertEvent", event
            ).then(() => {
                this.userEvents.filter(item => item.self !== event.self)
                this.loadedUserEvents = this.userEvents
                this.getPrintableEvents()
            }).catch(err => {
                console.log(err)
            })
        }
    }

})
</script>

<template>
    <div class="event-schedule-area-two bg-color pad100 mt-5">
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <div class="tab-content" id="myTabContent">
                        <div class="tab-pane fade active show" id="home" role="tabpanel">
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th class="text-center" scope="col">Date</th>
                                            <th scope="col">Session</th>
                                            <th scope="col">Description</th>
                                            <th scope="col">Room</th>
                                            <th scope="col"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th scope="row">
                                                <div class="event-date">
                                                    <span>16</span>
                                                    <p>November</p>
                                                </div>
                                            </th>
                                            <td>
                                                <div>
                                                    <h3>Name event</h3>
                                                    <div>
                                                        <div> club </div>
                                                        <div> <span>Time</span> </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <span> Description</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <span> Room</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div class="text-center">
                                                    <button class="btn btn-primary" href="#">Attend</button>
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
    </div>
    <div class="event-schedule-area-two bg-color pad100 mt-5">
        <div class="container">
            <div class="row">
                <div class="col-lg-12">
                    <div class="tab-content" id="myTabContent">
                        <div class="tab-pane fade active show" id="home" role="tabpanel">
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th class="text-center" scope="col">Date</th>
                                            <th scope="col">Session</th>
                                            <th scope="col">Description</th>
                                            <th scope="col">Room</th>
                                            <th scope="col"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="event in this.printableEvents" :key="event.self">
                                            <th scope="row">
                                                <div class="event-date">
                                                    <span>{{ event.date }}</span>
                                                    <p>{{ event.month }}</p>
                                                </div>
                                            </th>
                                            <td>
                                                <div>
                                                    <h3>{{ event.name }}</h3>
                                                    <div>
                                                        <div>{{ event.channel }} </div>
                                                        <div> <span>{{ event.interval }}</span> </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <span>{{ event.description }}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div>
                                                    <span> {{ event.room }}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div class="text-center">
                                                    <button v-if="isAttending(event)" class="btn btn-primary"
                                                        @click="deleteUserEvent(event)">Unsubscribe</button>
                                                    <button v-else @click="addUserEvent(event)"> Attend </button>
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
    </div>
</template>

<style>
.event-schedule-area-two .tab-content .table thead {
    background-color: #6c757d;
    color: #fff;
    font-size: 20px;

}

.event-schedule-area-two .tab-content .table thead tr th {
    padding: 20px;
    border: 0;
}

.event-schedule-area-two .tab-content .table tbody tr th {
    border: 0;
    padding: 30px 20px;
    vertical-align: middle;
    border-bottom: 1px solid #dee2e6;
}

.event-schedule-area-two .tab-content .table tbody tr th .event-date {
    color: #252525;
    text-align: center;
}

.event-schedule-area-two .tab-content .table tbody tr th .event-date span {
    font-size: 50px;
    line-height: 50px;
    font-weight: normal;
}

.event-schedule-area-two .tab-content .table tbody tr td {
    padding: 30px 20px;
    vertical-align: middle;
}
</style>