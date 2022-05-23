<script>
import { defineComponent } from "vue";
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import "vue3-circle-progress/dist/circle-progress.css";
import CircleProgress from "vue3-circle-progress";
import axios from "axios";
import {notify} from "@kyvg/vue3-notification";

export default defineComponent({
    components: {
        Datepicker,
        CircleProgress
    },
    data() {
        return {
            rooms: [],
            userReservations: [],
            slotsEmptySeats: [],
            "slots": [{"start": 0, "end": 2},
                    {"start": 2, "end": 4},
                    {"start": 4, "end": 6},
                    {"start": 6, "end": 8},
                    {"start": 8, "end": 10},
                    {"start": 10, "end": 12},
                    {"start": 12, "end": 14},
                    {"start": 14, "end": 16},
                    {"start": 16, "end": 18},
                    {"start": 18, "end": 20},
                    {"start": 20, "end": 22},
                    {"start": 22, "end": 24}
                  ],
            floors: [],
            filteredRooms: [],
            reservationRoom: [],
            date: new Date(),
            showRooms: false,
            showSlots: false,
            minDate: "",
            maxDate: "",
        }
    },
    computed: {
      user(){
        return this.$store.getters.getUser
      },
      loadedRooms() {
        return this.$store.getters.getRooms
      },
      loadedFloors(){
        return this.$store.getters.getFloors
      },
      loadedDateReservations(){
        return this.$store.getters.getDateReservations
      }

    },
    mounted() {

        this.$store.dispatch("rooms"
        ).then(() => {
            this.rooms = this.loadedRooms
            this.filteredRooms = this.loadedRooms
        }).catch(err => {
            console.log(err)
        })

      this.$store.dispatch("floors",
      ).then(()=>{
        this.floors = this.loadedFloors
      }).catch(err=>{
        console.log(err)
      })


    },


    methods: {
        handleDate(modelData) {
            this.date.value = modelData
            this.date.value = "" + this.date.getDate() + "/" + (this.date.getMonth() + 1) + "/" + this.date.getFullYear()

            this.showRooms = true
        },

        chooseRoom(room) {
          //I get the room I'm trying to see the slots
          let roomId = this.getId(room)
            this.rooms.forEach(room=>{
              if(this.getId(room) === roomId){
                this.reservationRoom = room
              }
            })
            //console.log(this.reservationRoom)

          let daySlots = []
            let day = this.date.getDate()
            let startDate = new Date()
            startDate.setDate(day)
            let start = startDate.toISOString()
            start = start.substring(0, 11)+"00:00:00.000Z"

            let endDate = new Date()
            endDate.setDate(day+1)
            let end = endDate.toISOString()
            end = end.substring(0, 11)+"00:00:00.000Z"
          let filter={
            start: start,
            end: end
          }
          //console.log(filter)
          this.$store.dispatch("roomSlots", { roomId, filter}
          ).then(()=>{
                daySlots = this.loadedDateReservations
                daySlots.forEach(interval=>{
                    let i = 0
                    const array = interval.interval.split("/")
                    const start = new Date (array[0])
                    const end = new Date(array[1])
                    this.slots.forEach(slot=>{
                        if(slot.start >= start.getHours() && end.getHours() <= slot.end ){
                            this.slotsEmptySeats[i] = interval.seats
                            i += 1
                        }
                    })
                    //console.log(this.slotsEmptySeats)
            })
          }).catch(err=>{
              console.log(err)
          })

          this.showSlots = true
        },

        handleBooking(room, slot) {
            console.log(slot.start, slot.end)
            let start = new Date()
            start.setFullYear(this.date.getFullYear())
            start.setMonth(this.date.getMonth())
            start.setDate(this.date.getDate())
            start.setHours(slot.start+2)
            start.setMinutes(0)
            start.setSeconds(0)
            start.setMilliseconds(0)
            let end = new Date()
            end.setFullYear(this.date.getFullYear())
            end.setMonth(this.date.getMonth())
            end.setDate(this.date.getDate())
            end.setHours(slot.end+2)
            end.setMinutes(0)
            end.setSeconds(0)
            end.setMilliseconds(0)
            console.log(start.toISOString(), end.toISOString())
            console.log(this.date.value)
            let reservation = {
                room: room,
                start: start.toISOString() ,
                end: end.toISOString()
            }
            console.log(reservation)
            this.$store.dispatch("bookRoom", reservation
            ).then(() => {

              this.slotsEmptySeats[slot.start/2] -= 1
                this.$store.commit("setDateReservations", this.slotsEmptySeats)
            }).catch(err => {
                console.log(err)
            })
        },

      computePercentage(slot){
        let emptySeats = this.slotsEmptySeats[slot.start/2]
          //console.log(emptySeats)
        return ((this.reservationRoom.seats - emptySeats)*100)/this.reservationRoom.seats
      },

      filterByFloor(floor){
        this.$store.dispatch("filterRoomsByFloor", floor
        ).then(()=>{
            this.filteredRooms = this.loadedRooms
        }).catch(err=>{
            console.log(err)
        })

      },

      filterByAvailableSlots(slot){
        let start = this.date.setHours(slot.start*2)
        let end = this.date.setHours(slot.end*2)
        let filter= {
          start: start.toISOString(),
          end: end.toISOString()
        }
        return new Promise((resolve, reject) => {
          axios.get("rooms?start="+filter.start+"&end="+filter.end,
          ).then(response => {
            this.rooms = response.data
            resolve(response)
          }).catch(err => {
            notify({
              title: "Error",
              text: err.response.title
            })
            this.$store.commit('setError')
            reject(err)
          })
        })
      },
      getId(room){
        //console.log(room)
        let id = room.self.replace("/api/v1/rooms/", "")
        //console.log(id)
        return id
      }

    },
    created() {
        this.minDate = new Date()
        this.maxDate = new Date(new Date().setDate(this.minDate.getDate() + 30));
    }

})
</script>

<template>

    <div class="container">
        <div class="row">
            <div class="col">
                <h3 class="text-start"> Please select a date:</h3>
            </div>
        </div>
        <div class="row">
            <div class="col"></div>
            <div class="col">
                <Datepicker v-model="date" inline placeholder="Select date" :cleareble="true"
                    @update:modelValue="handleDate" :minDate="minDate" :maxDate="maxDate"  />
            </div>
            <div class="col"></div>
        </div>
        <div class="row">
            <div class="col"> <br><br></div>
        </div>
    </div>

  <div v-if="this.showRooms" class="container">
    <div class="row">
      <div class="col ">
        <div class="card">
          <h5 class="card-header">
            <div class="container">
              <div class="row">
                <div class="col">
                  Select room for date: {{ date.value }}
                </div>
                <div class="col">
                  <div class="dropdown text-end">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
                      Filter rooms by floor:
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                      <li class="dropdown-item" @click="this.filteredRooms = this.rooms"> remove filter</li>
                      <li v-for="(floor,i) in floors" :key="i">
                        <a class="dropdown-item" @click="filterByFloor(floor)">{{floor}}</a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="col">
                  <div class="dropdown text-end">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false" disabled>
                      Filter rooms by slot:
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                      <li v-for="slot in slots" :key="slot.id">
                        <a class="dropdown-item" @click="filterByAvailableSlots(slot)">{{slot.start}}:00-{{slot.end}}:00</a>
                      </li>

                    </ul>
                  </div>
                </div>
              </div>
            </div>


          </h5>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped align-middle text-center ">
                <thead>
                  <th style="width: 5%">#</th>
                  <th style="width: 10%">Name</th>
                  <th style="width: 5%">Floor</th>
                  <th style="width: 5%">TotalSeats</th>
                  <th style="width: 55%">Details</th>
                  <th style="width: 20%"></th>
                </thead>
                <tbody>
                <tr v-for="(room, i) in filteredRooms" :key="room.id">
                  <td> {{ i+1 }} </td>
                  <td> {{room.name}} </td>
                  <td> {{room.floor}} </td>
                  <td> {{room.seats}} </td>
                  <td> {{room.details}} </td>
                  <td>
                    <button class="btn btn-primary" @click="chooseRoom(room)">
                      Click here to book
                    </button>
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

  <div v-if="this.showSlots" class="container">
    <div class="row">
      <div class="col ">
        <div class="card">
          <h5 class="card-header">Available slots for: {{ date.value }}</h5>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped align-middle text-center ">
                <thead>
                <th>#</th>
                <th>Time Period</th>
                <th> </th>
                <th> </th>
                </thead>
                <tbody>
                <tr v-for="(slot, i) in slots" :key="slot.id">
                  <td> {{ i+1 }} </td>
                  <td> {{slot.start}}:00 - {{slot.end}}:00 </td>
                  <td>
                    <div class="col-3 d-flex text-center">
                      <circle-progress :percent="this.computePercentage(slot)"
                                       :size="90" :show-percent="true" :viewport="true" :is-gradient="true" :gradient="{
                                    angle: 90,
                                    startColor: '#ff0000',
                                    stopColor: '#ff0000',
                                }"></circle-progress>
                    </div>
                  </td>

                  <td>
                    <div v-if="this.computePercentage(slot)<100">
                      <button class="btn btn-primary" @click="handleBooking(reservationRoom, slot)"> Book for this slot </button>
                    </div>
                    <div v-else>
                      <p> Slot already fully booked</p>
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


</template>

<style>
.dp__theme_light {
    --dp-background-color: #ffffff;
    --dp-text-color: #212121;
    --dp-hover-color: #ff6f60;
    --dp-hover-text-color: #212121;
    --dp-hover-icon-color: #959595;
    --dp-primary-color: red;
    --dp-primary-text-color: #f8f5f5;
    --dp-secondary-color: #c0c4cc;
    --dp-border-color: #ddd;
    --dp-menu-border-color: #ddd;
    --dp-border-color-hover: #aaaeb7;
    --dp-disabled-color: #f6f6f6;
    --dp-scroll-bar-background: #f3f3f3;
    --dp-scroll-bar-color: #959595;
    --dp-success-color: red;
    --dp-success-color-disabled: #red;
    --dp-icon-color: #959595;
    --dp-danger-color: #ff6f60;
}
</style>