<script>
import { defineComponent } from "vue";
import { Modal } from "bootstrap"

export default defineComponent({
  data(){
    return{
      reservations: []
    }

  },
  computed:{
    user() {
      return this.$store.getters.getUser;
    },
    userReservations(){
      return this.$store.getters.getUserReservations(this.user.id);
    }
  },

  mounted() {
    this.$store.dispatch("reservations"
    ).then(()=>{
      this.reservations = this.userReservations
      this.$store.commit("setUserReservations", this.reservations)
    }).catch(err=>{
      console.log(err)
    })
  },

  methods:{
    deleteReservation(reservationId) {
      this.$store.dispatch("deleteUserReservation", reservationId
      ).then(() => {
        this.reservations= this.reservations.filter(reservation=>reservation.id !== reservationId)
        this.$store.commit("setUserReservations", this.reservations)
      }).catch(err => {
        console.log(err);
      });
      const myModalEl = document.getElementById('confirm')
      const modal = Modal.getInstance(myModalEl)
      modal.hide()
    }
  }
})


</script>

<template>
  <div class="container">

    <div class="row">
      <div class="col">
        <h1 class="text-center">My reservations</h1>
        <table class="table table-striped table-responsive text-center">
          <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Date</th>
            <th scope="col">Room</th>
            <th scope="col">Slot</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(reservation, i) in reservations" :key="reservation.id">
            <th scope="row">{{ i + 1 }}</th>
            <td> {{ reservation.date }} </td>
            <td> {{ reservation.room }} </td>
            <td> {{ reservation.slot }} </td>
            <td>
              <button class="btn btn-primary align-end" data-bs-toggle="modal"
                      data-bs-target="#confirm" @click="() => {
                                        this.$data.chosenReservation = reservation.id
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

<style scoped>

</style>