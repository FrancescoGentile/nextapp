<script>
import { defineComponent } from "vue";
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import "vue3-circle-progress/dist/circle-progress.css";
import CircleProgress from "vue3-circle-progress";

export default defineComponent({
    components: {
        Datepicker,
        CircleProgress
    },
    data() {
        return {
            rooms: [],
            reservations: [],
            userReservations: [],
            roomReservations: [],
            dateReservations: [],
            slots: [],
            reservationRoom: [],
            date: new Date(),
            showRooms: false,
            showSlots: false,
            minDate: "",
            maxDate: ""
        }
    },
    computed: {
      user(){
        return this.$store.getters.getUser
      },
      loadedSlots(){
        return this.$store.getters.getSlots
      },
      loadedRooms() {
        return this.$store.getters.getRooms
      },
      loadedReservations(){
        return this.$store.getters.getReservations
      },
        loadedUserReservations(){
          return this.$store.getters.getUserReservations(this.user.id)
        },
        loadedDateReservations(){
          return this.$store.getters.getDateReservations(this.date.value)
        },
      loadedRoomReservations(){
        return this.$store.getters.getRoomReservations(this.reservationRoom.id)
      }

    },
    mounted() {

        this.$store.dispatch("rooms"
        ).then(() => {
            this.rooms = this.loadedRooms
        }).catch(err => {
            console.log(err)
        })

      this.$store.dispatch("reservations"
      ).then(()=>{
        this.reservations = this.loadedReservations
        this.userReservations = this.loadedUserReservations
        this.$store.commit("setUserReservations", this.userReservations)
      }).catch(err=>{
        console.log(err)
      })

      this.$store.dispatch("slots"
      ).then(()=>{
          this.slots = this.loadedSlots
      }).catch(err=>{
        console.log(err)
      })

    },


    methods: {
        handleDate(modelData) {
            this.date.value = modelData
            this.date.value = "" + this.date.getDate() + "/" + (this.date.getMonth() + 1) + "/" + this.date.getFullYear()
            this.showRooms = true
            this.dateReservations = this.loadedDateReservations
            //console.log(this.dateReservations)
            this.$store.commit("setDateReservations", this.dateReservations)
        },

        isFullRoom(room){
          let count = 0
          let num_slots = 12
          this.dateReservations.forEach(reservation=>{
            if(reservation.room === room.id){
              count += 1
            }
          })
          return room.totalSeats * num_slots <= count
        },

        chooseRoom(roomId) {
            this.reservationRoom = this.rooms[roomId]
            this.roomReservations = this.loadedRoomReservations
            this.$store.commit("setRoomReservations", this.roomReservations)
            this.showSlots = true
        },

      emptySeats(slot){
        let count = 0
        if(this.roomReservations != undefined){
          this.roomReservations.forEach(reservation=>{
            if(reservation.slot === slot){
              count += 1
            }
          })
        }

        return this.reservationRoom.totalSeats - count
      },
      /*
      notBooked(slot){
          this.roomReservations.forEach(roomRes =>{
            this.dateReservations.forEach(res=>{
              return !(res.user === this.user.id && res.slot === slot && res.room === roomRes.room)
            })
          })
      },*/
        // TODO: if user already has booked for that slot the they can't reserve it again
        // TODO: show reservation immediately with circle filling
        handleBooking(roomId, slot) {
            //console.log(slot)
            let reservation = {
                id: Math.floor(Math.random() * 100),
                user: this.user.id,
                room: roomId,
                slot: slot,
                date: this.date.value
            }
            this.$store.dispatch("bookRoom", reservation
            ).then((response) => {
              this.userReservations.push(response.data)
              this.$store.commit("setUserReservations", this.userReservations)
            }).catch(err => {
                console.log(err)
            })
        },


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
                    @update:modelValue="handleDate" :minDate="minDate" :maxDate="maxDate" :enableTimePicker="false" />
            </div>
            <div class="col"></div>
        </div>
        <div class="row">
            <div class="col"> <br><br></div>
        </div>

        <div v-if="this.showRooms">
            <h3> Select room for date: {{ date.value }}</h3>
            <div class="row border align-items-center" v-for="room in rooms" :key="room.id">
                <div class="col">
                    <h1>{{ room.name }}</h1>
                </div>
                <div class="col">
                    <button class="btn btn-primary" v-if="!isFullRoom(room)" @click="chooseRoom(room.id)">
                        Click here to book
                    </button>
                    <p v-else> The room is already fully booked</p>
                </div>
            </div>
        </div>
      <br>
        <div class="row" v-if="showSlots">
            <div class="col">
                <h3> Available slots for: {{ date.value }}</h3>
            </div>
        </div>
        <div class="row">
            <div class="col"> <br><br></div>
        </div>
        <div class="row" v-if="showSlots">
            <div class="col">
                <div class="container gap-3">
                    <div class="row align-items-center" v-for="slot in this.slots" :key="slot.id">
                        <div class="col-6 text-center">
                            <h3 class="text-center"> {{ slot.start }}-{{ slot.end }}</h3>
                        </div>
                        <div class="col-3 d-flex justify-content-center">
                            <div v-if="emptySeats(slot.id) > 0 ">
                                <button class="btn btn-primary" @click="handleBooking(reservationRoom.id, slot.id)">
                                    Book for this slot
                                </button>
                            </div>
                            <div v-else>
                                <p> Slots already fully booked</p>
                            </div>
                        </div>
                        <div class="col-3 d-flex justify-content-center">
                            <circle-progress :percent="((reservationRoom.totalSeats - emptySeats(slot.id)) / reservationRoom.totalSeats) * 100"
                                :size="90" :show-percent="true" :viewport="true" :is-gradient="true" :gradient="{
                                    angle: 90,
                                    startColor: '#ff0000',
                                    stopColor: '#ff0000',
                                }"></circle-progress>
                        </div>
                        <div class="row"><br></div>
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