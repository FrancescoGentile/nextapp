<script>
import { defineComponent } from "vue"
import UsersManagement from "@/components/UsersManagement.vue"
import RoomsManagement from "@/components/RoomsManagement"
import ClubsManagement from "@/components/ClubsManagement.vue"

export default defineComponent({
    data(){
        return{
            showUsers: false,
            showRooms: false,
            showGeneral: false,
            showChannels: false
        }
    },
    methods:{
        toggleUsers(){
            this.showUsers = !this.showUsers
            this.showRooms = false
            this.showChannels = false
            this.showGeneral = false
        },
        toggleRooms(){
            this.showRooms = !this.showRooms
            this.showUsers = false
            this.showChannels = false
            this.showGeneral = false
        },
        toggleGeneral(){
            this.showGeneral = !this.showGeneral
            this.showUsers = false
            this.showChannels = false
            this.showRooms = false
        },
        toggleChannels(){
            this.showChannels = !this.showChannels
            this.showUsers = false
            this.showRooms = false
            this.showGeneral = false
        }
    },
    components:{
        UsersManagement, RoomsManagement, ClubsManagement
    }
})
</script>

<template>
<div class="container">
    <div class="row my-4">
        <div class="col">
            <div class="card h-100 border">
                <h5 class="card-header text-center">Users</h5>
                <div class="card-body h-100">
                    <h5 class="card-text">From here you'll be able to add, delete and modify users and their information</h5>
                    <div class="text-center">
                       <button class="btn btn-primary" @click="toggleUsers()"> Manage users </button> 
                    </div>
                </div>
            </div>
        </div>

        <div class="col">
            <div class="card h-100 border">
                <h5 class="card-header text-center">Rooms</h5>
                <div class="card-body">
                    <h5 class="card-text">From here you'll be able to add, delete and modify rooms</h5>
                    <div class="text-center">
                       <button class="btn btn-primary" @click="toggleRooms()"> Manage rooms </button> 
                    </div>
                </div>
            </div>
        </div>
      <div class="col">
          <div class="card h-100 border">
                <h5 class="card-header text-center">General channel </h5>
                <div class="card-body h-100">
                    <h5 class="card-text">From here you'll be able to add, delete and modify news and events from the general channel</h5>
                    <div class="text-center">
                       <button class="btn btn-primary" @click="toggleGeneral()"> Manage general channel </button> 
                    </div>
                </div>
            </div>
      </div>
      <div class="col">
          <div class="card h-100 border">
                <h5 class="card-header text-center">Clubs </h5>
                <div class="card-body h-100">
                    <h5 class="card-text">From here you'll be able to add and delete clubs and add users as their administrators</h5>
                    <div class="text-center">
                       <button class="btn btn-primary" @click="toggleChannels()"> Manage clubs </button> 
                    </div>
                </div>
            </div>
      </div>
    </div>
</div>
  <UsersManagement v-if="showUsers"></UsersManagement>
  <RoomsManagement v-if="showRooms"></RoomsManagement>
  <ClubsManagement v-if="showChannels"></ClubsManagement>
  
</template>

<style scoped>
</style>