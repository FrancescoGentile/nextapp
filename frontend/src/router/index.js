import { createRouter, createWebHistory } from 'vue-router'
import store from "@/store";
import HomePage from '../views/HomePage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/DashBoard.vue')
  },
  {
    path: "/noAuth",
    name: "noAuth",
    component: () => import('../views/noAuthentication.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = store.getters.isLoggedIn
  if (isLoggedIn) {
    if(to.name === "home"){
      next({name: "dashboard"})
    }else{
      next()
    }

  } else {
    if(to.name === "home" || to.name === "login" || to.name === "noAuth"){
      next();
    }else{
      next({name: "noAuth"})
    }

  }
})
export default router
