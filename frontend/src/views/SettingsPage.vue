<script>
import { Modal } from "bootstrap";
import axios from "axios"
import { defineComponent } from "vue"
import bcrypt from "bcryptjs"
import {notify} from "@kyvg/vue3-notification";

export default defineComponent({
  data() {
    return {
      oldPassword: "",
      newPassword: ""
    }
  },
  computed: {
    user() {
      return this.$store.getters.getUser
    }
  },
  methods: {
    changePassword(userId) {
      axios.get("http://localhost:3000/users/" + userId
      ).then(response => {
        const data = response.data
        if (bcrypt.compareSync(this.oldPassword, data.password)) {
          axios.patch("http://localhost:3000/users/" + userId, {
            password: this.newPassword //json-server-auth automatically hashes it
          }).then(() => {
            this.oldPassword = ""
            this.newPassword = ""
            this.$store.dispatch("logout"
            ).then(() => {
              this.$router.push("/")
              notify({
                title: "Login",
                text: "Please log in again with the new password"
              })
            }).catch(err => {
              console.log(err.response.data)
            })

          }).catch(err => {
            this.oldPassword = ""
            this.newPassword = ""
            notify({
              title: "Error",
              text: err.response.data
            })
          })
        } else {
          notify({
            title: "Error",
            text: "The password doesn't match the old one"
          })
        }

      }).catch(err => {
        console.log(err)
      })
      
      this.hideModal("changePassword")
    },

    deleteProfile(userId) {
      this.$store.dispatch("deleteUser", userId
      ).then(() => {
          this.$store.dispatch("logout"
          ).then(() => {
            this.$router.push("/")
          }).catch(err => {
            console.log(err)
          })
      }).catch(err => {
        console.log(err);
      });
      this.hideModal('deleteProfile')
    },

    revertForm(){
      this.oldPassword = ""
      this.newPassword = ""
      this.hideModal("changePassword")
    },

     hideModal(modalId){
       const myModalEl = document.getElementById(modalId)
       const modal = Modal.getInstance(myModalEl)
       modal.hide()
     }
  }
})
</script>

<template>
  <section class="vh-50">
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col col-lg-6 mb-4 mb-lg-0">
          <div class="card mb-3" style="border-radius: .5rem;">
            <div class="row g-0">
              <div class="col-md-4 gradient-custom text-center text-white"
                style="border-top-left-radius: .5rem; border-bottom-left-radius: .5rem;">
                <img src="../../assets/defaultProfile.jpg" alt="Avatar" class="img-fluid my-5" style="width: 80px;" />
                <h5>{{ user.username }}</h5>
                <p>{{ user.role }}</p>
                <i class="far fa-edit mb-5"></i>
              </div>
              <div class="col-md-8">
                <div class="card-body p-4">
                  <h6>Information</h6>
                  <hr class="mt-0 mb-4">
                  <div class="row pt-1">
                    <div class="col-6 mb-3">
                      <h6>Email</h6>
                      <p class="text-muted">{{ user.email }}</p>
                    </div>
                    <div class="col-6 mb-3">
                      <h6>Name</h6>
                      <p class="text-muted">{{ user.firstName }} {{ user.lastName }}</p>
                    </div>
                  </div>
                  <h6>Options</h6>
                  <hr class="mt-0 mb-4">
                  <div class="row pt-1">
                    <div class="col">
                      <label class="form-label" for="customFile">Change your profile picture:</label>
                      <input type="file" class="form-control" id="customFile">
                    </div>
                  </div>
                  <div class="row pt-1">
                    <br>
                  </div>
                  <div class="row pt-1">
                    <div class="col-6 mb-3">
                      <button type="button" class="btn btn-primary h-100" data-bs-toggle="modal"
                        data-bs-target="#changePassword"> Change your password</button>
                    </div>
                    <div class="col-6 mb-3">
                      <button type="button" class="btn btn-primary h-100" data-bs-toggle="modal"
                        data-bs-target="#deleteProfile"> Delete your profile</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>


  <div class="modal fade" id="changePassword" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Change password</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="revertForm()"></button>
        </div>
        <div class="modal-body">
          <form>
            <div class="mb-3">
              <label class="col-form-label">Old password:</label>
              <input v-model="oldPassword" type="password" class="form-control" id="recipient-name">
            </div>
            <div class="mb-3">
              <label for="message-text" class="col-form-label">New Password:</label>
              <input v-model="newPassword" type="password" class="form-control" id="message-text">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="revertForm()">Close</button>
          <button type="button" class="btn btn-primary" @click="changePassword(this.user.id)">Confirm</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="deleteProfile" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Delete profile</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          Are you sure you want to delete your account? This action will be permanent.
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" @click="deleteProfile(this.user.id)">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.gradient-custom {
  /* Chrome 10-25, Safari 5.1-6 */
  background: -webkit-linear-gradient(to right bottom, red, rgba(246, 211, 101, 1));

  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  background: linear-gradient(to right bottom, red, rgba(246, 211, 101, 1))
}
</style>