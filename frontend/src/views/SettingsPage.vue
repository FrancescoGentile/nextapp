<script>
import { Modal } from "bootstrap";
import { defineComponent } from "vue"

export default defineComponent({
  data() {
    return {
      user: {},
      oldPassword: "",
      newPassword: "",
      emails: [],
      newEmail: ""
    }
  },
  computed: {
    privateUser() {
      return this.$store.getters.getUser
    },
    userEmails() {
      return this.$store.getters.getUserEmails
    }
  },
  mounted() {
    this.$store.dispatch("privateUser"
    ).then(() => {
      this.user = this.privateUser
    }).catch(err => {
      console.log(err)
    })

    this.$store.dispatch("userEmails"
    ).then(() => {
      this.emails = this.userEmails
    }).catch(err => {
      console.log(err)
    })
  },
  methods: {
    changePassword(old_password, new_password) {
      //console.log(oldPassword, newPassword)
      this.$store.dispatch("changePassword", { old_password, new_password }
      ).then(() => {
        console.log("Password changed")
        this.oldPassword = ""
        this.newPassword = ""
        this.$store.dispatch("logout"
        ).then(() => {
          this.$router.push("/")
        }).catch(err => {
          console.log(err)
        }).catch(err => {
          this.oldPassword = ""
          this.newPassword = ""
          console.log(err)
        })
      })
      this.hideModal("changePassword")
    },

    deleteProfile() {
      this.$store.dispatch("deletePersonalProfile"
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

    addEmail() {
      this.$store.dispatch("addEmail", this.newEmail
      ).then(() => {
        this.$store.dispatch("userEmails"
        ).then(() => {
          this.emails = this.userEmails
        }).catch(err => {
          console.log(err)
        })
      }).catch(err => {
        console.log(err)
      })
    },

    deleteEmail(email) {
      this.$store.dispatch("deleteEmail", email.self
      ).then(() => {
        this.$store.dispatch("userEmails"
        ).then(() => {
          this.emails = this.userEmails
        }).catch(err => {
          console.log(err)
        })
      }).catch(err => {
        console.log(err)
      })
    },

    setPrimary(email) {
      this.$store.dispatch("primaryEmail", email
      ).then(() => {
        this.$store.dispatch("userEmails"
        ).then(() => {
          this.emails = this.userEmails
        }).catch(err => {
          console.log(err)
        })
      }).catch(err => {
        console.log(err)
      })
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
  <section class="vh-50">
    <div class="container py-5 h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col col-lg-8 mb-4 mb-lg-0">
          <div class="card mb-3" style="border-radius: .5rem;">
            <div class="row g-0">
              <div class="col-md-4 gradient-custom text-center text-white"
                style="border-top-left-radius: .5rem; border-bottom-left-radius: .5rem;">
                <img src="../../assets/defaultProfile.jpg" alt="Avatar" class="img-fluid my-5" style="width: 80px;" />
                <h5>{{ user.username }}</h5>
                <p v-if="user.is_admin"> Admin </p>
                <p v-else> User </p>
                <i class="far fa-edit mb-5"></i>
              </div>
              <div class="col-md-8">
                <div class="card-body p-4">
                  <h6>Information</h6>
                  <hr class="mt-0 mb-4">
                  <div class="row pt-1">
                    <div class="col mb-3">
                      <h6>Emails</h6>
                      <p v-for="(email, i) in emails" :key="i" class="text-muted">{{ email.email }}</p>
                    </div>
                  </div>
                  <div class="row pt-1">
                    <div class="col mb-3">
                      <h6>Name</h6>
                      <p class="text-muted">{{ user.first_name }} {{ user.middle_name }} {{ user.surname }}</p>
                    </div>
                  </div>
                  <h6>Options</h6>
                  <hr class="mt-0 mb-4">

                  <div class="row pt-1">
                    <div class="col mb-3">
                      <button type="button" class="btn btn-primary h-100"
                        @click="this.$router.push({ path: '/notifications' })">
                        Receive push notifications </button>
                    </div>
                    <div class="col mb-3">
                      <button type="button" class="btn btn-primary h-100 w-100" data-bs-toggle="modal"
                        data-bs-target="#manageEmails"> Manage your emails </button>
                    </div>
                  </div>
                  <div class="row pt-1">
                    <div class="col mb-3">
                      <button type="button" class="btn btn-primary h-100 w-100" data-bs-toggle="modal"
                        data-bs-target="#changePassword"> Change your password</button>
                    </div>
                    <div class="col mb-3">
                      <button type="button" class="btn btn-primary h-100 w-100" data-bs-toggle="modal"
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
          <button type="button" class="btn btn-primary" @click="deleteProfile()">Confirm</button>
        </div>
      </div>
    </div>
  </div>


  <div class="modal fade" id="changePassword" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Change password</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form>
            <div class="mb-3">
              <label class="col-form-label">Old password:</label>
              <input v-model="oldPassword" type="password" class="form-control" id="password">
            </div>
            <div class="mb-3">
              <label for="message-text" class="col-form-label">New Password:</label>
              <input v-model="newPassword" type="password" class="form-control" id="message-text">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary"
            @click="changePassword(oldPassword, newPassword)">Confirm</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="manageEmails" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Manage your emails</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form>
            <div class="mb-3">
              <label class="col-form-label">Add new Email:</label>
              <input v-model="newEmail" type="email" class="form-control" id="recipient-name">
            </div>
            <div class="text-end">
              <button type="button" class="btn btn-primary" @click="addEmail()">Confirm</button>
            </div>
          </form>
        </div>
        <div class="container">
          <div class="row">
            <div class="col">
              <table class="table table-striped table-responsive text-center">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Email</th>
                    <th> </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(email, i) in emails" :key="i">
                    <th scope="row">{{ i + 1 }}</th>
                    <td> {{ email.email }} </td>
                    <td>
                      <div class="text-end">
                        <button v-if="!email.main" class="btn btn-primary align-end" @click="setPrimary(email)"> Set as
                          primary</button>
                        <button v-else class="btn btn-secondary align-end" @click="setPrimary(email)" disabled> Primary email</button>
                        <button class="btn btn-primary align-end ms-1" @click="deleteEmail(email)"> Delete
                          email</button>
                      </div>

                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
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