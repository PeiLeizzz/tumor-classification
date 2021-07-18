import Vue from 'vue'
import Router from 'vue-router'
import Main from './components/MainPage.vue'
import Login from './components/Login.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/main',
      name: 'main',
      component: Main
    },
  ]
})

router.beforeEach((to, from, next) => {
  if (to.path === '/') {
    next();
  } else {
    let token = localStorage.getItem('token');
    if (token === null || token === '') {
      next('/');
    } else {
      next();
    }
  }
})

export default router;