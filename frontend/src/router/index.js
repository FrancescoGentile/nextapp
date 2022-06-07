import { createRouter, createWebHistory} from 'vue-router'
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
    path: "/clubs",
    name: "clubs",
    component: () => import("../views/ClubsPage.vue")
  },
  {
    path: "/clubs/:id",
    name: "clubDetails",
    component: () => import("../views/ClubDetails.vue"),
    props: true
  },
  {
    path: "/clubsAdministration",
    name: "clubsAdministration",
    component: () => import("../views/ClubsAdministration.vue")
  },
  {
    path: "/recovery",
    name: "passwordRecovery",
    component: () => import("../views/PasswordRecoveryPage.vue")
  },
  {
    path:"/notifications",
    name: "notificationsPage",
    component: () => import("../views/NotificationsPage.vue")
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  base: "/",
  routes
})

router.beforeEach((to, from, next) => {
  const isLoggedIn = store.getters.isLoggedIn
  const role = store.getters.getUserRole
  if (isLoggedIn) {
    if(to.name === "home"){
      next({name: "dashboard"})
    }else{
      if((to.name === "dashboardAdmin" || to.name === "roomDetails") && role !== "admin") {
        next({name: "dashboard"})
      }else{
        next()
      }
      next()
    }
  } else {
    if(to.name === "home" || to.name === "login" || to.name === "noAuth" || to.name === "register" || to.name === "passwordRecovery"){
      next();
    }else{
      next({name: "noAuth"})
    }

  }
})
export default router
