<script>
import { defineComponent } from "vue"
import UsersManagement from "@/components/UsersManagement.vue"

export default defineComponent({
    data(){
        return{
            showUsers: false,
            showRooms: false
        }
    },
    methods:{
        toggleUsers(){
            this.showUsers = !this.showUsers
            this.showRooms = false
            this.showClubs = false
            this.showGeneral = false
        },
        toggleRooms(){
            this.showRooms = !this.showRooms
            this.showUsers = false
            this.showClubs = false
            this.showGeneral = false
        }
    },
    components:{
        UsersManagement
    }
})
</script>

<template>
<div class="container">
    <div class="row my-4">
        <div class="col"></div>
        <div class="col">
            <div class="card h-100">
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
            <div class="card h-100">
                <h5 class="card-header text-center">Rooms</h5>
                <div class="card-body">
                    <h5 class="card-text">From here you'll be able to add, delete and modify rooms</h5>
                    <div class="text-center">
                       <button class="btn btn-primary" @click="toggleRooms()"> Manage rooms </button> 
                    </div>
                </div>
            </div>
        </div>
      <div class="col"></div>
    </div>
</div>
<UsersManagement v-if="showUsers"></UsersManagement>
</template>

<style>
</style>