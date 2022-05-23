<script>
import { defineComponent} from "vue"

export default defineComponent({
  data(){
    return{
      username: "",
      password: ""
    }
  },
  methods:{
    handleSubmit(){
      // login based on email instead of username to use fake json backend
      let username = this.username
      let password = this.password

      this.$store.dispatch("login",{
        username: username,
        password: password
      }).then(()=>{
        this.$router.push("/dashboard")
      }).catch(err=>{
        console.log(err)

      })
    }
  }

});
</script>

<template>
  <div class="container col-xxl-8 px-4 py-5">
    <div class="row flex-lg align-items-center g-5 py-5">
      <div class="col-10 col-sm-8 col-lg-6">
        <img src="../../assets/logo.jpg" class="d-block mx-lg-auto img-fluid" alt="NextApp" width="700" height="500" loading="lazy">
      </div>
      <div class="col-md-10 mx-auto col-lg-5">
        <form @submit.prevent="handleSubmit()" class="p-4 p-md-5 border rounded-3 bg-light">
          <h1 class="h3 mb-3 fw-normal">Please sign up</h1>
          <div class="form-floating mb-3">
            <input v-model="username" type="text" class="form-control" id="floatingInput" placeholder="name@example.com">
            <label for="floatingInput">Username</label>
          </div>
          <div class="form-floating mb-3">
            <input v-model="password" type="password" class="form-control" id="floatingPassword" placeholder="Password">
            <label for="floatingPassword">Password</label>
          </div>
          <button class="w-100 btn btn-lg btn-primary" type="submit">Sign in</button>
        </form>
      </div>
    </div>
  </div>

</template>