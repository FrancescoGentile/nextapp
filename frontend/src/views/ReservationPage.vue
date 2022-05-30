<script>
import { defineComponent } from "vue";
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import "vue3-circle-progress/dist/circle-progress.css";
import CircleProgress from "vue3-circle-progress";

export default defineComponent({
  components: {
    Datepicker, CircleProgress
  },
  data() {
    return {
      rooms: [],
      userReservations: [],
      slotsEmptySeats: [],
      floors: [],
      filteredRooms: [],
      reservationRoom: {},
      startDate: "",
      endDate: "",
      showRooms: false,
      showIntervals: false,
      minDate: "",
      maxDate: "",
      roomIntervals: []
    }
  },
  computed: {
    user() {
      return this.$store.getters.getUser
    },
    loadedRooms() {
      return this.$store.getters.getRooms
    },
    loadedFloors() {
      return this.$store.getters.getFloors
    },
    loadedDateReservations() {
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
    ).then(() => {
      this.floors = this.loadedFloors
    }).catch(err => {
      console.log(err)
    })


  },


  methods: {
    handleStartDate(modelData) {
      this.startDate = modelData
      this.startDate.value = "" + this.startDate.getDate() + "/" + (this.startDate.getMonth() + 1) + "/" + this.startDate.getFullYear()
      this.endDate = this.startDate
    },
    handleEndDate(modelData) {
      this.endDate = modelData
      this.endDate.value = "" + this.endDate.getDate() + "/" + (this.endDate.getMonth() + 1) + "/" + this.endDate.getFullYear()
    },

    chooseRoom() {
      this.showRooms = false
      this.showIntervals = false
      if (this.startDate.valueOf() >= this.endDate.valueOf() || this.endDate.valueOf() - this.startDate.valueOf() > 24*60*60*1000) {
        this.$notify({
          title: "Error",
          text: "Non valid interval"
        })
      } else {
        this.showRooms = true
      }
    },

    handleBooking(room) {
      let reservation = {
        room: room,
        start: this.startDate.toISOString(),
        end: this.endDate.toISOString()
      }
      //console.log(reservation)
      this.$store.dispatch("bookRoom", reservation
      ).then(() => {
        this.showIntervals = false
        this.roomIntervals = this.loadedDateReservations
      }).catch(err => {
        console.log(err)
      })
    },

    filterByFloor(floor) {
      this.$store.dispatch("filterRoomsByFloor", floor
      ).then(() => {
        this.filteredRooms = this.loadedRooms
      }).catch(err => {
        console.log(err)
      })

    },

    roomAvailability(room) {
      const roomId = this.getId(room)
      const filter = {
        start: this.startDate.toISOString(),
        end: this.endDate.toISOString()
      }
      this.$store.dispatch("roomSlots", { roomId, filter }
      ).then(() => {
        this.reservationRoom = room
        this.roomIntervals = this.loadedDateReservations
        this.showIntervals = true
        //console.log(this.roomIntervals)
      }).catch(err => {
        console.log(err)
      })
    },

    printableInterval(interval) {
      const start = new Date(interval.split("/")[0])
      const end = new Date(interval.split("/")[1])
      //console.log(start, end)
      return ("0"+start.getHours()).slice(-2) + ":" + ("0"+start.getMinutes()).slice(-2) + " - " + ("0"+end.getHours()).slice(-2) + ":" + ("0"+end.getMinutes()).slice(-2)
    },

    getId(room) {
      //console.log(room)
      let id = room.self.replace("/api/v1/rooms/", "")
      //console.log(id)
      return id
    }

  },
  created() {
    this.minDate = new Date()
    this.maxDate = new Date(new Date().setDate(this.minDate.getDate() + 30));
    this.startDate = new Date()
    this.startDate.setMinutes(0);
    this.endDate = new Date()
    this.endDate.setMinutes(0);
  }

})
</script>

<template>

  <div class="container mb-3">
    <div class="row">
      <div class="col">
        <div class="card">
          <div class="card-body">
            <h5 class="card-header text-center mb-2">Please select a start and end hour for your reservation</h5>
            <div class="container">
              <div class="row">
                <div class="col">
                  <Datepicker v-model="startDate" placeholder="Select start date" :cleareble="true"
                    @update:modelValue="handleStartDate" :minDate="minDate" :maxDate="maxDate" minutesIncrement="15" />
                </div>
                <div class="col">
                  <Datepicker v-model="endDate" placeholder="Select end date" :cleareble="true"
                    @update:modelValue="handleEndDate" :minDate="minDate" :maxDate="maxDate" minutesIncrement="15" />
                </div>
              </div>
              <div class="row mt-3">
                <div class="col text-center">
                  <button class="btn btn-primary" @click="chooseRoom()"> Confirm time interval </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="this.showRooms" class="container mb-3">
    <div class="row">
      <div class="col ">
        <div class="card">
          <h5 class="card-header">
            <div class="container">
              <div class="row justify-content-end">
                <div class="col-3">
                  <div class="dropdown">
                    <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1"
                      data-bs-toggle="dropdown" aria-expanded="false">
                      Filter rooms by floor:
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
                      <li class="dropdown-item" @click="this.filteredRooms = this.rooms"> - </li>
                      <li v-for="(floor, i) in floors" :key="i">
                        <a class="dropdown-item" @click="filterByFloor(floor)">{{ floor }}</a>
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
                  <th style="width: 40%">Details</th>
                  <th style="width: 35%"></th>
                </thead>
                <tbody>
                  <tr v-for="(room, i) in this.filteredRooms" :key="room.id">
                    <td> {{ i + 1 }} </td>
                    <td> {{ room.name }} </td>
                    <td> {{ room.floor }} </td>
                    <td> {{ room.seats }} </td>
                    <td> {{ room.details }} </td>
                    <td>
                      <button class="btn btn-primary mb-2" @click="roomAvailability(room)">
                        See room'a availability for selected time period
                      </button>

                      <button class="btn btn-primary" @click="handleBooking(room)">
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


  <div v-if="showIntervals" class="container mb-3">
    <div class="row">
      <div class="col">
        <table class="table table-striped align-middle text-center ">
          <thead>
            <th>{{ reservationRoom.name }}</th>
            <th>Interval</th>
            <th>Available Seats</th>
            <th></th>
          </thead>
          <tbody>
            <tr v-for="(roomInterval, i) in roomIntervals" :key="i">
              <td> {{ i + 1 }} </td>
              <td> {{ printableInterval(roomInterval.interval) }} </td>
              <td> {{ roomInterval.seats }}/{{ reservationRoom.seats }} </td>
              <td>
                <CircleProgress :percent="((reservationRoom.seats - roomInterval.seats) / reservationRoom.seats) * 100"
                  :size="90" :viewport="true" :is-gradient="true" :gradient="{
                    angle: 90,
                    startColor: '#ff0000',
                    stopColor: '#ff0000'
                  }"></CircleProgress>
              </td>
            </tr>
          </tbody>
        </table>
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