import { createRouter, createWebHistory } from 'vue-router'
//import store from "@/store"
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
  },
  {
    path: "/dashboardAdmin",
    name: "dashboardAdmin",
    component: () => import("../views/DashboardAdmin.vue")
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("../views/SettingsPage.vue")
  },
  {
    path: "/roomDetails/:id",
    name: "roomDetails",
    component: () => import("../views/RoomDetails.vue"),
    props: true
  },
  {
    path: "/rooms",
    name: "reservationPage",
    component: () => import("../views/ReservationPage.vue")
  },
  {
    path: "/channels",
    name: "ChannelsPage",
    component: () => import("../views/ChannelsPage.vue")
  },
  {
    path: "/channels/:id",
    name: "ChannelDetails",
    component: () => import("../views/ChannelDetails.vue"),
    props: true
  },
  {
    path:"/channelAdministration",
    name: "ChannelAdministration",
    component: () => import("../views/ChannelAdministration.vue")
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})
/*
router.beforeEach((to, from, next) => {
  const isLoggedIn = store.getters.isLoggedIn
  //const user = store.getters.getUser
  if (isLoggedIn) {
    if(to.name === "home"){
      next({name: "dashboard"})
    }else{
      /*
      if((to.name === "dashboardAdmin" || to.name === "roomDetails") && user.role !== "admin") {
        next({name: "dashboard"})
      }else{
        next()
      }
      next()
    }
  } else {
    if(to.name === "home" || to.name === "login" || to.name === "noAuth" || to.name === "register"){
      next();
    }else{
      next({name: "noAuth"})
    }

  }
})*/
export default router
