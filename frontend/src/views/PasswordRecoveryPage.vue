<script>
export default {
    data() {
        return {
            username: ""
        }
    },
    methods: {
        recoverPassword() {
            this.$store.dispatch("recoverPassword", this.username
            ).then(() => {
                this.$router.push("/")
            }).catch(err => {
                console.log(err)
            })
        }
    }
}
</script>


<template>
    <div class="container col-xxl-8 px-4 py-5">
        <div class="row flex-lg align-items-center g-5 py-5">
            <div class="col-md-10 mx-auto col-lg-5">
                <form @submit.prevent="recoverPassword()" class="p-4 p-md-5 border rounded-3 bg-light">
                    <h1 class="h3 mb-3 fw-normal">Please insert your username</h1>
                    <div class="form-floating mb-3">
                        <input v-model="username" type="text" class="form-control" id="floatingInput"
                            placeholder="username">
                        <label for="floatingInput">Username</label>
                    </div>
                    <button class="w-100 btn btn-lg btn-primary" type="submit">Send recovery email</button>
                </form>
            </div>
        </div>
    </div>
    <div class="text-center">
        <button @click="this.$router.push({path: '/'})" class="btn btn-primary"> Go back to the homepage</button>
    </div>
</template>

