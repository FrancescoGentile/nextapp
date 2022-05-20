<script>
import { defineComponent } from "vue"
export default defineComponent({
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    }
  },
  methods:{
    logout(){
      this.$store.dispatch("logout"
      ).then(()=>{
        this.$router.push("/")
      }).catch(err=>{
        console.log(err)
      })
    }
  }
})


</script>

<template>
  <nav v-if="isLoggedIn" class="navbar navbar-expand navbar-dark fixed-top bg-dark" aria-label="Second navbar example">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">NextApp</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarsExample02" aria-controls="navbarsExample02" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarsExample02">
        <ul class="navbar-nav me-auto">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="dropdown01" data-bs-toggle="dropdown" aria-expanded="false">Profile</a>
            <ul class="dropdown-menu" aria-labelledby="dropdown01">
              <li><a class="dropdown-item" href="#">Settings</a></li>
              <li><a class="dropdown-item" @click="logout()">Logout</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>


  <nav v-else class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
    <div class="container-fluid">
      <router-link to="/" class="navbar-brand">NextApp</router-link>
      <!--<router-link to="/login"> <button class="btn btn-primary">Sign In</button> </router-link>-->
    </div>
  </nav>
  <notifications position="top right" classes="alert alert-primary" />
  <router-view/>

</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  border-radius: 4px;
  padding: 10px;

  &.router-link-exact-active {
    color: white !important;
    background-color: red;
  }
}

body {
  min-height: 75rem;
  padding-top: 4.5rem;
}
.btn-primary,
.btn-primary:hover,
.btn-primary:active,
.btn-primary:visited,
.btn-primary:focus {
  background-color: red !important;
  border-color: red !important;
}

.btn-outline-primary,
.btn-outline-primary:hover,
.btn-outline-primary:active,
.btn-outline-primary:visited,
.btn-outline-primary:focus {
  color: red !important;
  border-color: red !important;
}

.navbar-toggler {
  border-color: red !important;
}

.alert-primary{
  border-color: red !important;
  color: red !important;
  background-color: white !important;
}

</style>

