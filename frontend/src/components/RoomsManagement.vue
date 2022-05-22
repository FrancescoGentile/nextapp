<script>
import { Modal } from "bootstrap"

export default {
  data() {
    return {
      rooms: [],
      registeredRoom: {},
      floors: [1,2]
    }
  },
  computed: {
    loadedRooms() {
      return this.$store.getters.getRooms
    }
  },
  mounted() {
    this.$store.dispatch("rooms"
    ).then(() => {
      this.rooms = this.loadedRooms
      //console.log(this.rooms)
    }).catch(err => {
      console.log(err)
    })
  },
  methods: {
    addRoom() {
      //console.log(this.registeredRoom)
      let id = Math.floor(Math.random() * 100)
      let name = this.registeredRoom.name
      let floor = parseInt(this.registeredRoom.floor)
      let totalSeats = parseInt(this.registeredRoom.totalSeats)
      let description= this.registeredRoom.description

      const room = {
        id, name, floor, totalSeats, description
      }
      //console.log(room)
      this.$store.dispatch("addRoom", room
      ).then(() => {
        this.rooms.push(room)
        this.$store.commit("setRooms", this.rooms)
      }).catch(err => {
        console.log(err)
      })
      this.registeredRoom = {}
      this.hideModal('addRoom')
    },

    revertForm(){
      this.registeredRoom = {}
      this.hideModal("addRoom")
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
          <h5 class="card-header">Users</h5>
          <div class="card-body">
            <div class="text-end">
              <button type="button" class="btn btn-primary" data-bs-toggle="modal"
                      data-bs-target="#addRoom"> Add room </button>
            </div>
            <div class="table-responsive">
              <table class="table table-striped table-responsive text-center ">
                <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Floor</th>
                  <th scope="col"></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(room, i) in this.rooms" :key="room.id">
                  <th scope="row">{{ i+1}}</th>
                  <td>{{ room.name }}</td>
                  <td>{{ room.floor }}</td>
                  <td>
                    <button class="btn btn-primary" @click="this.$router.push({name:'roomDetails', params:{id: room.id}})"> Click to see room's details </button>
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


  <div class="modal fade" id="addRoom" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">
            <h1 class="h3 mb-3 fw-normal">Insert room information</h1>
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="this.revertForm()"></button>
        </div>
        <div class="modal-body">
          <form class="p-4 p-md-5 border rounded-3 bg-light">
            <div class="form-floating mb-3">
              <input v-model="registeredRoom.name" type="text" class="form-control"
                     placeholder="Room1">
              <label for="floatingInput">Name</label>
            </div>
            <div class="form-floating mb-3">
              <div class="form-check form-check-inline">
                Floor:
                <div v-for="(floor,i) in floors" :key="i">
                  <input v-model="registeredRoom.floor" class="form-check-input" type="radio" name="inlineRadioOptions" id="inlineRadio1" :value=floor>
                  <label class="form-check-label" for="inlineRadio1">{{floor}}</label>
                </div>
              </div>

            </div>
            <div class="form-floating mb-3">
              <input v-model="registeredRoom.totalSeats" type="text" class="form-control"
                     placeholder="Seats">
              <label for="floatingInput">Total Seats</label>
            </div>
            <div class="form-floating mb-3">
              <textarea v-model="registeredRoom.description" class="form-control"
                        placeholder="description" rows="5"></textarea>
              <label for="floatingInput">Description</label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="this.revertForm()">Close</button>
          <button type="button" class="btn btn-primary" @click="addRoom()">Confirm</button>
        </div>
      </div>
    </div>
  </div>

</template>