<script>
import { Modal } from "bootstrap"

export default {
    data() {
        return {
            user: {},
            users: [],
            registeredUser: {},
            selectedUser: {}
        }
    },
    computed: {
        loadedUsers() {
            return this.$store.getters.getUsers
        },
        loadedUser() {
            return this.$store.getters.getUser
        }
    },
    mounted() {
        this.$store.dispatch("users"
        ).then(() => {
            this.users = this.loadedUsers
        }).catch(err => {
            console.log(err)
        })

      this.$store.dispatch("publicUser"
      ).then(()=>{
        this.user = this.loadedUser
      }).catch(err=>{
        console.log(err)
      })
    },
    methods: {
        registerUser() {

            //console.log(this.registeredUser)
            const user = {
                username: this.registeredUser.username,
                password: this.registeredUser.password,
                first_name: this.registeredUser.first_name,
                middle_name: this.registeredUser.middle_name,
                surname: this.registeredUser.surname,
                is_admin: false,
                email: this.registeredUser.email
            }
            console.log(user)
            this.$store.dispatch("addUser", user
            ).then(() => {
                this.$store.dispatch("users"
                ).then(response=>{
                    this.$store.commit("setUsers", response.data)
                    this.users = this.loadedUsers
                    console.log(this.users)
                }).catch(err=>{
                    console.log(err)
                })
            }).catch(err => {
                console.log(err)
            })
            //this.registeredUser = {}
            this.hideModal('addUser')
        },

      deleteUser(user) {
          let userId = user.self.replace("/api/v1/users/", "")
        this.$store.dispatch("deleteUser", userId
        ).then(() => {
            this.$store.dispatch("users"
            ).then(response=>{
                this.$store.commit("setUsers", response.data)
                this.users = this.loadedUsers
                console.log(this.users)
            }).catch(err=>{
                console.log(err)
            })
        }).catch(err => {
          console.log(err);
        });
        this.hideModal('deleteUser')
      },

      revertChanges(){
        this.$store.dispatch("users"
        ).then(response=>{
          this.users = response.data
          this.$store.commit("setUsers", this.users)
        }).catch(err=>{
          console.log(err)
        })
        this.hideModal("modifyUser")
      },

      changeRole(user){
        this.$store.dispatch("changeRole", user
        ).then(() =>{
            this.$store.dispatch("users"
            ).then(response=>{
                this.$store.commit("setUsers", response.data)
                this.users = this.loadedUsers
            }).catch(err=>{
                console.log(err)
            })

        }).catch(err=>{
          console.log(err)
        })

      },
        hideModal(modalId) {
            const myModalEl = document.getElementById(modalId)
            const modal = Modal.getInstance(myModalEl)
            modal.hide()
        },

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
                                data-bs-target="#addUser"> Add user </button>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-striped table-responsive text-center ">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Username</th>
                                        <th scope="col">Name</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(user, i) in this.users" :key="user.id">
                                        <th scope="row">{{ i+1 }}</th>
                                        <td>{{ user.username }}</td>
                                        <td>{{ user.first_name }} {{user.middle_name}} {{ user.surname }}</td>
                                      <td>
                                        <div class="text-right">
                                          <div class="btn-group" role="toolbar">

                                            <button v-if="!user.is_admin" type="button" class="btn btn-primary me-2"

                                                    @click="this.changeRole(user)"> Upgrade to admin
                                            </button>

                                            <button v-else type="button" class="btn btn-primary me-2"
                                                    @click="this.changeRole(user)"> Downgrade to user
                                            </button>

                                            <button type="button" class="btn btn-primary me-2"
                                                    data-bs-toggle="modal" data-bs-target="#deleteUser"
                                                    @click="selectedUser = user"> Delete
                                            </button>

                                          </div>
                                        </div>

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


    <div class="modal fade" id="addUser" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">
                        <h1 class="h3 mb-3 fw-normal">Insert user information</h1>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form class="p-4 p-md-5 border rounded-3 bg-light">
                        <div class="form-floating mb-3">
                            <input v-model="registeredUser.email" type="email" class="form-control"
                                placeholder="name@example.com">
                            <label for="floatingInput">Email address</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input v-model="registeredUser.password" type="password" class="form-control"
                                   placeholder="password">
                            <label for="floatingInput">Password</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input v-model="registeredUser.username" type="text" class="form-control"
                                placeholder="username">
                            <label for="floatingInput">Username</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input v-model="registeredUser.first_name" type="text" class="form-control"
                                placeholder="firstname">
                            <label for="floatingInput">First Name</label>
                        </div>
                      <div class="form-floating mb-3">
                        <input v-model="registeredUser.middle_name" type="text" class="form-control"
                               placeholder="firstname">
                        <label for="floatingInput">Middle Name</label>
                      </div>
                        <div class="form-floating mb-3">
                            <input v-model="registeredUser.surname" type="text" class="form-control"
                                placeholder="surname">
                            <label for="floatingInput">Surname</label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" @click="registerUser()">Confirm</button>
                </div>
            </div>
        </div>
    </div>

  <div class="modal fade" id="deleteUser" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Delete profile</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          Are you sure you want to delete this user? This action will be permanent.
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" @click="deleteUser(selectedUser)">Confirm</button>
        </div>
      </div>
    </div>
  </div>

</template>

<style>
body {
    height: 100%;
}

.form-signin input[type="email"] {
    margin-bottom: -1px;
    border-bottom-right-radius: 0;
    border-bottom-left-radius: 0;
}

.form-signin input[type="password"] {
    margin-bottom: 10px;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
}
</style>