<script>
import { Modal } from 'bootstrap'

export default {
    data() {
        return {
            devices: [],
            chosenDevice: {}
        }
    },

    computed: {
        loadedDevices() {
            return this.$store.getters.getUserDevices
        }
    },

    mounted() {
        this.$store.dispatch("userDevices"
        ).then(() => {
            this.devices = this.loadedDevices
        }).catch(err => {
            console.log(err)
        })
    },

    methods: {
        addDevice(device) {
            this.$store.dispatch("addUserDevice", device
            ).then(() => {
                this.$store.dispatch("userDevices"
                ).then(() => {
                    this.devices = this.loadedDevices
                }).catch(err => {
                    console.log(err)
                })
            }).catch(err => {
                console.log(err)
            })
            
            this.hideModal("addDevice")
        },

        removeDevice(device) {
            this.$store.dispatch("removeUserDevice", device
            ).then(() => {
                this.$store.dispatch("userDevices"
                ).then(() => {
                    this.devices = this.loadedDevices
                }).catch(err => {
                    console.log(err)
                })
            }).catch(err => {
                console.log(err)
            })
            this.hideModal("removeDevice")
        },

        hideModal(modalId) {
            const myModalEl = document.getElementById(modalId)
            const modal = Modal.getInstance(myModalEl)
            modal.hide()
        }
    },
}
</script>

<template>
    <div class="container">
        <div class="row">
            <div class="col ">
                <div class="card">
                    <h5 class="card-header"> List of devices yuo're receiving notifications on</h5>
                    <div class="card-body">
                        <div class="text-center">
                            <button type="button" class="btn btn-primary" data-bs-toggle="modal"
                                data-bs-target="#addDevice"> Receive push notifications for this device </button>
                        </div>
                        <div class="table-responsive">
                            <table class="table table-striped table-responsive text-center ">
                                <thead>
                                    <tr>
                                        <th scope="col">#</th>
                                        <th scope="col">Name</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(device, i) in this.devices" :key="i">
                                        <th scope="row">{{ i + 1 }}</th>
                                        <td>{{ device.name }}</td>
                                        <td>
                                            <div class="text-end">
                                                <button type="button" class="btn btn-primary me-2"
                                                    data-bs-toggle="modal" data-bs-target="#removeDevice"
                                                    @click="chosenDevice = device">
                                                    Stop receiving notifications
                                                </button>
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


    <div class="modal fade" id="addDevice" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">
                        <h1 class="h3 mb-3 fw-normal">Insert a name for the device</h1>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form class="p-4 p-md-5 border rounded-3 bg-light">
                        <div class="form-floating mb-3">
                            <input v-model="chosenDevice.name" type="text" class="form-control" placeholder="name">
                            <label for="floatingInput">Name</label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary" @click="addDevice(this.chosenDevice)">Confirm</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="removeDevice" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Delete profile</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    Are you sure you want to delete this device? This action will be permanent.
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary"
                        @click="removeDevice(this.chosenDevice)">Confirm</button>
                </div>
            </div>
        </div>
    </div>

</template>

<style>
</style>