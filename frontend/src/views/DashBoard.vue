<script>
import { defineComponent } from "vue";
import { Modal } from "bootstrap"
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

export default defineComponent({
  data() {
    return {
      rooms: [],
      reservations: [],
      chosenReservation: [],
      printableReservations: [],
      showReservations: false,
      minDate: "",
      maxDate: "",
      date: new Date()
    }

  },
  components: {
    Datepicker
  },

  created() {
    this.minDate = new Date()
    this.maxDate = new Date(new Date().setDate(this.minDate.getDate() + 30));
  },

  mounted() {
    this.$store.dispatch("rooms"
    ).then(() => {
      this.rooms = this.loadedRooms
    }).catch(err => {
      console.log(err)
    })
  },
  computed: {
    loadedRooms() {
      return this.$store.getters.getRooms
    }
  },
  methods: {
    getPrintableReservations(reservations) {
      this.printableReservations = []
      reservations.forEach(reservation => {
        let start = new Date(reservation.start)
        let end = new Date(reservation.end)
        let name = ""
        this.rooms.forEach(room => {
          //console.log(room.self, reservation.room.self)
          if (this.getId(room) === this.getId(reservation.room)) {
            name = room.name
          }

        })
        let res = {
          self: reservation.self,
          room: name,
          date: start.getDate() + "/" + (start.getMonth() + 1) + "/" + start.getFullYear(),
          start: start.getHours() + ":" + start.getMinutes(),
          end: end.getHours() + ":" + end.getMinutes(),
        }
        this.printableReservations.push(res)
      })
    },

    handleSubmit(modelData) {
      this.date.value = modelData
      //console.log(this.date.toISOString())
      let day = this.date.getDate()
      let startDate = new Date()
      startDate.setDate(day)
      let start = startDate.toISOString()
      start = start.substring(0, 11) + "00:00:00.000Z"

      let endDate = new Date()
      endDate.setDate(day + 1)
      let end = endDate.toISOString()
      end = end.substring(0, 11) + "00:00:00.000Z"

      let filter = {
        start: start,
        end: end
      }
      //console.log(filter)

      this.reservations = []
      this.printableReservations = []
      this.$store.dispatch("userReservations", filter
      ).then(response => {
        this.reservations = response.data
        this.getPrintableReservations(this.reservations)
        //console.log(this.reservations)
        //console.log(this.printableReservations)
        this.showReservations = true
      }).catch(err => {
        console.log(err)
      })



    },
    deleteReservation(reservation) {
      let reservationId = reservation.self.replace("/api/v1/users/me/bookings/", "")
      //console.log(reservationId)
      this.$store.dispatch("deleteUserReservation", reservationId
      ).then(() => {
        //console.log(this.reservations)
        this.reservations = this.reservations.filter(res => res.self.replace("/api/v1/users/me/bookings/", "") !== reservation.self.replace("/api/v1/users/me/bookings/", ""))
        this.$store.commit("setUserReservations", this.reservations)
        this.getPrintableReservations(this.reservations)
      }).catch(err => {
        console.log(err);
      });
      const myModalEl = document.getElementById('confirm')
      const modal = Modal.getInstance(myModalEl)
      modal.hide()
    },

    getId(room) {
      let id = room.self.replace("/api/v1/rooms/", "")
      return id
    }
  },


})


</script>

<template>
  <div class="container">
    <div class="row mb-3">
      <div class="col">
        <div class="card border-0">
          <div class="card-body">
            <h5 class="card-header text-center mb-2">Please select a date to see your reservations</h5>
            <div class="container">
              <div class="row">
                <div class="col"></div>
                <div class="col">
                  <Datepicker v-model="date" inline placeholder="Select date" :cleareble="true"
                    :enableTimePicker="false" @update:modelValue="handleSubmit" :minDate="minDate" :maxDate="maxDate" />
                </div>
                <div class="col"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-show="showReservations" class="container">
    <div class="row" v-if="reservations.length === 0">
      <div class="col text-center">
        <h3> There aren't any reservations for this date </h3>
      </div>

    </div>
    <div v-else class="row">
      <div class="col">
        <h1 class="text-center">My reservations</h1>
        <table class="table table-striped table-responsive text-center">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Date</th>
              <th scope="col">Room</th>
              <th scope="col">Interval</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(reservation, i) in printableReservations" :key="reservation.id">
              <th scope="row">{{ i + 1 }}</th>
              <td> {{ reservation.date }} </td>
              <td> {{ reservation.room }} </td>
              <td> {{ reservation.start }} - {{ reservation.end }}</td>
              <td>
                <button class="btn btn-primary align-end" data-bs-toggle="modal" data-bs-target="#confirm" @click="() => {
                  this.$data.chosenReservation = reservation
                }">
                  Delete reservation </button>
              </td>
            </tr>
          </tbody>
        </table>
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
          Are you sure you want to delete this reservation?
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
          <button type="button" class="btn btn-primary" @click="deleteReservation(chosenReservation)">Yes</button>
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
