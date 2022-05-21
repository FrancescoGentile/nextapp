<script>
import { Modal } from "bootstrap"

export default {
    data() {
        return {
            users: [],
            registeredUser: {},
            selectedUser: {}
        }
    },
    computed: {
        loadedUsers() {
            return this.$store.getters.getUsers
        },
        user() {
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
    },
    methods: {
        registerUser() {
            let id = Math.floor(Math.random() * 100)
            let username = this.registeredUser.username
            let email = this.registeredUser.email
            let password = this.registeredUser.password
            let firstName = this.registeredUser.firstName
            let lastName = this.registeredUser.lastName
            let role = "user"
            const user = {
                id, username, email, password, firstName, lastName, role
            }
            this.$store.dispatch("addUser", user
            ).then(() => {
                this.users.push(user)
                this.$store.commit("setUsers", this.users)
            }).catch(err => {
                console.log(err)
            })
            this.registeredUser = {}
            this.hideModal('addUser')
        },

      deleteUser(userId) {
        this.$store.dispatch("deleteUser", userId
        ).then(() => {
          this.users = this.users.filter(user => user.id !== userId)
          this.$store.commit("setUsers", this.users)
        }).catch(err => {
          console.log(err);
        });
        this.hideModal('deleteUser')
      },

      modifyUser(user) {
        this.$store.dispatch("modifyUser", user
        ).then((response) => {
          const data = response.data
          this.users.forEach(element => {
            if (element.id === data.id) {
              element = data
            }
          });
          this.$store.commit("setUsers", this.users)
        }).catch(err => {
          console.log(err)
        })
        this.hideModal("modifyUser")
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

      changeRole(user, index){
        if(user.role === "admin"){
          user.role = "user"
        }else{
          user.role = "admin"
        }
        this.$store.dispatch("modifyUser", user
        ).then(response =>{
          let data = response.data;
          delete data.password;
          this.users[index] = data
          this.$store.commit("setUsers", this.users)
        }).catch(err=>{
          console.log(err)
        })

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
                                data-bs-target="#addUser"> Add user </button>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-striped table-responsive text-center ">
                                <thead>
                                    <tr>
                                        <th scope="col">Id</th>
                                        <th scope="col">Username</th>
                                        <th scope="col">Email</th>
                                        <th scope="col">Fulllname</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(user, i) in this.users" :key="user.id">
                                        <th scope="row">{{ i+1 }}</th>
                                        <td>{{ user.username }}</td>
                                        <td>{{ user.email }}</td>
                                        <td>{{ user.firstName }} {{ user.lastName }}</td>
                                      <td>
                                        <div class="text-right">
                                          <div class="btn-group" role="toolbar">

                                            <button v-if="user.role === 'user'" type="button" class="btn btn-primary me-2"

                                                    @click="this.changeRole(user, i)"> Upgrade to admin
                                            </button>


                                            <button v-else-if="this.user.id !== user.id" type="button" class="btn btn-primary me-2"
                                                    @click="this.changeRole(user, i)"> Downgrade to user
                                            </button>


                                            <button v-else type="button" class="btn btn-secondary me-2"
                                                    @click="this.changeRole(user, i)" disabled> Downgrade to user
                                            </button>


                                            <button type="button" class="btn btn-primary me-2"
                                                    data-bs-toggle="modal" data-bs-target="#modifyUser"
                                                    @click="selectedUser = user"> Modify
                                            </button>

                                            <button v-if="this.user.id !== user.id" type="button" class="btn btn-primary me-2"
                                                    data-bs-toggle="modal" data-bs-target="#deleteUser"
                                                    @click="selectedUser = user"> Delete
                                            </button>


                                            <button v-else type="button" class="btn btn-secondary me-2"
                                                    data-bs-toggle="modal" data-bs-target="#deleteUser"
                                                    @click="selectedUser = user" disabled> Delete
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
                            <input v-model="registeredUser.username" type="text" class="form-control"
                                placeholder="username">
                            <label for="floatingInput">Username</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input v-model="registeredUser.firstName" type="text" class="form-control"
                                placeholder="firstname">
                            <label for="floatingInput">First Name</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input v-model="registeredUser.lastName" type="text" class="form-control"
                                placeholder="lastname">
                            <label for="floatingInput">Last Name</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input v-model="registeredUser.password" type="password" class="form-control"
                                placeholder="Password">
                            <label for="floatingPassword">Default password</label>
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
          <button type="button" class="btn btn-primary" @click="deleteUser(selectedUser.id)">Confirm</button>
        </div>
      </div>
    </div>
  </div>

  <div class="modal fade" id="modifyUser" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Change user's information</h5>
          <button type="button" class="btn-close"  @click="revertChanges(this.selectedUser.id)" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form>
            <div class="mb-3">
              <label class="col-form-label">Email</label>
              <input type="text" class="form-control" v-model="selectedUser.email">
            </div>
            <div class="mb-3">
              <label class="col-form-label">Username</label>
              <input type="text" class="form-control" v-model="selectedUser.username">
            </div>
            <div class="mb-3">
              <label class="col-form-label">First Name</label>
              <input type="text" class="form-control" v-model="selectedUser.firstName">
            </div>
            <div class="mb-3">
              <label class="col-form-label">Last Name</label>
              <input type="text" class="form-control" v-model="selectedUser.lastName">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="revertChanges(this.selectedUser.id)">Close</button>
          <button type="submit" class="btn btn-primary" @click="modifyUser(this.selectedUser)">Confirm
            changes</button>
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