<script>
import {defineComponent} from "vue";
import {Modal} from "bootstrap";

export default defineComponent({
  name: "RoomDetails",
  props:["id"],
  data(){
    return {
      room: {},
      selectedRoom: {},
      reservations: [],
      selectedReservation: {},
      floors: []
    }
  },
  computed:{
    loadedRoom(){
      return this.$store.getters.getRoomDetails
    },
    loadedFloors(){
      return this.$store.getters.getFloors
    }

  },
  mounted(){
    this.$store.dispatch("roomDetails", this.id
    ).then(()=>{
      this.room = this.loadedRoom;
      console.log(this.room)
    }).catch(err=>{
      console.log(err)
    })

    this.$store.dispatch("floors",
    ).then(()=>{
      this.floors = this.loadedFloors
    }).catch(err=>{
      console.log(err)
    })

  },
  methods:{
    deleteRoom(roomId) {
      this.$store.dispatch("deleteRoom", roomId
      ).then(() => {
        this.$router.push("/dashboardAdmin")
      }).catch(err => {
        console.log(err);
      });
      this.hideModal('deleteRoom')
    },

    modifyRoom(room) {
      let roomId = this.getId(room)
      this.$store.dispatch("modifyRoom", {room, roomId}
      ).then(() => {
        this.room = room
        this.$store.commit("setRoomDetails", this.room)
      }).catch(err => {
        console.log(err)
      })
      this.hideModal("modifyRoom")
    },

    revertChanges(room){
      let roomId = this.getId(room)
      this.$store.dispatch("roomDetails", roomId
      ).then(response=>{
        this.room = response.data
        this.$store.commit("setRoomDetails", this.room)
      }).catch(err=>{
        console.log(err)
      })
      this.hideModal("modifyRoom")
    },

    deleteReservation(reservationId) {
      this.$store.dispatch("deleteUserReservation", reservationId
      ).then(() => {
        this.reservations= this.reservations.filter(reservation=>reservation.id !== reservationId)
        this.$store.commit("setRoomReservations", this.reservations)
      }).catch(err => {
        console.log(err);
      });
      const myModalEl = document.getElementById('deleteReservation')
      const modal = Modal.getInstance(myModalEl)
      modal.hide()
    },

    getId(room){
      //console.log(room)
      let id = room.self.replace("/api/v1/rooms/", "")
      //console.log(id)
      return id
    },

    hideModal(modalId) {
      const myModalEl = document.getElementById(modalId)
      const modal = Modal.getInstance(myModalEl)
      modal.hide()
    }
  }
})
</script>

<template>
  <h1 class="text-center"> {{room.name}}</h1>

  <div class="container">
    <div class="row">
      <div class="col ">
        <div class="card">
          <h5 class="card-header">Room Details</h5>
          <div class="card-body">
            <div class="text-end mb-2">
              <button type="button" class="btn btn-primary me-2" data-bs-toggle="modal" data-bs-target="#modifyRoom"
                      @click="this.selectedRoom = this.room"> Modify information </button>
              <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#deleteRoom"> Delete Room </button>
            </div>
            <div class="table-responsive">
              <table class="table table-striped table-responsive text-center ">
                <tbody>
                <tr>
                  <td> Name: </td>
                  <td>{{ room.name }}</td>
                </tr>
                <tr>
                  <td> Floor:</td>
                  <td>{{ room.floor }}</td>
                  </tr>
                <tr>
                  <td>Total Seats:</td>
                  <td>{{ room.seats }} </td>
                </tr>
                <tr>
                  <td> Additional Information:</td>
                  <td>{{ room.details }} </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row mt-3">
      <div class="col text-center">
        <button class="btn btn-primary" @click="this.$router.push('/dashboardAdmin')"> Go back to rooms list</button>
      </div>
    </div>
  </div>

  <div class="modal fade" id="deleteRoom" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Delete profile</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          Are you sure you want to delete this room? This action will be permanent.
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" @click="deleteRoom(this.id)">Confirm</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="modifyRoom" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Change user's information</h5>

        </div>
        <div class="modal-body">
          <form>
            <div class="mb-3">
              <label class="col-form-label">Name</label>
              <input type="text" class="form-control" v-model="selectedRoom.name">
            </div>
            <div class="mb-3">
              <div class="form-floating mb-3">
                <div class="form-check form-check-inline">
                  Floor:
                  <div v-for="(floor,i) in floors" :key="i">
                    <input v-model="selectedRoom.floor" class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" :value=floor>
                    <label class="form-check-label" for="inlineRadio1">{{floor}}</label>
                  </div>
                </div>

              </div>
            </div>
            <div class="mb-3">
              <label class="col-form-label">Total Seats</label>
              <input type="text" class="form-control" v-model="selectedRoom.seats" disabled>
            </div>
            <div class="mb-3">
              <label class="col-form-label">Details</label>
              <textarea type="text" class="form-control" v-model="selectedRoom.details" rows="5"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="revertChanges(this.selectedRoom)">Close</button>
          <button type="submit" class="btn btn-primary" @click="modifyRoom(this.selectedRoom)">Confirm
            changes</button>
        </div>

      </div>
    </div>
  </div>

  <div class="modal fade" id="deleteReservation" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Delete profile</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          Are you sure you want to delete this reservation? This action will be permanent.
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" @click="deleteReservation(this.selectedReservation.id)">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>