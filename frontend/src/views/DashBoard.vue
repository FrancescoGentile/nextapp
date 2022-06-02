<script>
/*
* Shows calendar to see reservations for specific day
* Shows list of user clus with option to unsubscirbe and a show news/events button
* toggle news/events (in events possibility to subscribe/unsubscribe from the event)
*/
import { defineComponent } from "vue";
import { Modal } from "bootstrap"
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

export default defineComponent({
  data(){
    return {
      rooms: [],
      reservations: [],
      chosenReservation: [],
      printableReservations: [],
      showReservations: false,
      minDate: "",
      maxDate: "",
      date: new Date(),

      userChannels: []
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

    this.$store.dispatch("userChannels"
      ).then(()=>{
        this.userChannels = this.loadedUserChannels
      }).catch(err=>{
        console.log(err)
      })
  },
  computed: {
    loadedRooms() {
      return this.$store.getters.getRooms
    },
     loadedUserChannels(){
        return this.$store.getters.getUserChannels
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
          date: ("0"+start.getDate()).slice(-2) + "/" + ("0"+(start.getMonth() + 1)).slice(-2) + "/" + start.getFullYear(),
          start: ("0"+start.getHours()).slice(-2) + ":" + ("0"+start.getMinutes()).slice(-2),
          end: ("0"+end.getHours()).slice(-2) + ":" + ("0"+end.getMinutes()).slice(-2)
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

    unsubscribeFromChannel(channel){
        console.log(channel)
        this.$store.dispatch("unsubscribeUserFromChannel", channel.self
        ).then(()=>{
          this.userChannels.filter(item => item.self !== channel.self)
          this.loadedUserChannels = this.userChannels
        }).catch(err=>{
          console.log(err)
        })
    },
    
    getAvatar(name){
        let avatarText = ""
        name.split(" ").forEach(word => {
          avatarText = avatarText + word[0]
        });
        return avatarText
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
        <h3 class="text-center">My reservations</h3>
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
                  this.$data.chosenReservation = reservation}">
                  Delete reservation 
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
    <div class="container">
    <div class="text-center mb-2 mt-5">
      <h3>Clubs</h3>
    </div>
    <div v-for="channel in this.userChannels" :key="channel.self" class="card mb-3">
      <div class="card-body">
        <div class="d-flex flex-column flex-lg-row align-items-center">
          <span class="avatar avatar-text error rounded-3 me-3 mb-2">{{getAvatar(channel.name)}}</span>
            <div class="col-sm-3">
              <h4 class="h5"> {{channel.name}} </h4>
              <span v-for="(admin, i) in channel.array" :key="i" class="badge bg-secondary me-1 mb-1">{{admin}}</span>
            </div>
            <div class="col-sm-5 py-2 ms-2"> {{channel.description}} </div>
            <div class="col-sm-3 text-lg-end">
              <div class="btn-group-vertical">
                <button @click="unsubscribeFromChannel(channel)" class="btn btn-primary mb-1"> Unsubscribe </button>
                <button @click="this.$router.push({name:'clubDetails', params:{id: 1, subscribed: true}})" class="btn btn-primary stretched-link">See details</button>
              </div>
              
            </div>
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

.card {
    box-shadow: 0 20px 27px 0 rgb(0 0 0 / 5%);
}

.card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    word-wrap: break-word;
    background-color: #eee;
    background-clip: border-box;
    border: 0 solid rgba(0,0,0,.125);
    border-radius: 1rem;
}

.card-body {
    -webkit-box-flex: 1;
    -ms-flex: 1 1 auto;
    flex: 1 1 auto;
    padding: 1.5rem 1.5rem;
}

.card-header{
    background-color: white;
}
.avatar-text {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    background: red;
    color: #fff;
    font-weight: 700;
}

.avatar {
    width: 3rem;
    height: 3rem;
}
.rounded-3 {
    border-radius: 0.5rem!important;
}
.mb-2 {
    margin-bottom: 0.5rem!important;
}
.me-4 {
    margin-right: 1.5rem!important;
}

</style>
