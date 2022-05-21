<script>
import {defineComponent} from "vue";
import {Modal} from "bootstrap";
export default defineComponent({
  name: "RoomDetails",
  props:["id"],
  data(){
    return {
      room: {},
      selectedRoom: {}
    }
  },
  computed:{
    loadedRoom(){
      return this.$store.getters.getRoomDetails
    }
  },
  mounted(){
    this.$store.dispatch("roomDetails", this.id
    ).then(()=>{
      this.room = this.loadedRoom;
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
      this.$store.dispatch("modifyRoom", room
      ).then((response) => {
        this.room = response.data
      }).catch(err => {
        console.log(err)
      })
      this.hideModal("modifyRoom")
    },

    revertChanges(roomId){
      this.$store.dispatch("roomDetails", roomId
      ).then(response=>{
        this.room = response.data
      }).catch(err=>{
        console.log(err)
      })
      this.hideModal("modifyRoom")
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
                  <td>{{ room.totalSeats }} </td>
                </tr>
                <tr>
                  <td> Additional Information:</td>
                  <td>{{ room.description }} </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="container">
    <div class="row">
      <div class="col ">
        <div class="card">
          <h5 class="card-header">Room Reservations</h5>
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
                  <td>{{ room.totalSeats }} </td>
                </tr>
                <tr>
                  <td> Additional Information:</td>
                  <td>{{ room.description }} </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
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
          <button type="button" class="btn-close"  @click="revertChanges(this.id)" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form>
            <div class="mb-3">
              <label class="col-form-label">Name</label>
              <input type="text" class="form-control" v-model="selectedRoom.name">
            </div>
            <div class="mb-3">
              <div class="form-check form-check-inline">
                <input v-model="selectedRoom.floor" class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" value="1">
                <label class="form-check-label" for="inlineRadio1">1</label>
              </div>
              <div class="form-check form-check-inline">
                <input v-model="selectedRoom.floor" class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio2" value="2">
                <label class="form-check-label" for="inlineRadio2">2</label>
              </div>
            </div>
            <div class="mb-3">
              <label class="col-form-label">Total Seats</label>
              <input type="text" class="form-control" v-model="selectedRoom.totalSeats" disabled>
            </div>
            <div class="mb-3">
              <label class="col-form-label">Description</label>
              <textarea type="text" class="form-control" v-model="selectedRoom.description" rows="5"></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="revertChanges(this.selectedRoom.id)">Close</button>
          <button type="submit" class="btn btn-primary" @click="modifyRoom(this.selectedRoom)">Confirm
            changes</button>
        </div>

      </div>
    </div>
  </div>

</template>

<style scoped>
.gradient-custom {
  /* Chrome 10-25, Safari 5.1-6 */
  background: -webkit-linear-gradient(to right bottom, red, rgba(246, 211, 101, 1));

  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  background: linear-gradient(to right bottom, red, rgba(246, 211, 101, 1))
}
</style>