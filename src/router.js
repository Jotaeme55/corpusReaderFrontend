import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './components/Dashboard.vue';
import register from './components/Register.vue';
import usuarios from './components/Usuarios.vue';
const Login = () => import("./components/Login.vue");
import error404 from './components/error404.vue'
import store from "./store"; 
import corpus from "./components/Corpus.vue"


const routes = [
    {
        path: '/',
        name: 'dashboard',
        component: Dashboard,
    },
    {
        path: '/login',
        name: 'login',
        component: Login,
    },{
        path: '/register',
        name: 'register',
        component: register,
    },{
        path: '/usuarios',
        name: 'usuarios',
        component: usuarios,
    },{
        path: '/corpus',
        name: 'corpus',
        component: corpus
    },{
        path: '/error404',
        name: 'error404',
        component: error404,
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
  })

router.beforeEach(async (to, from, next) => {
    let routesList = ['/logout','/register','/login','/error404',"/",'/usuarios',"/corpus"]
    if (!routesList.includes(to.path)){
        next('/error404')
    }
    const publicPages = ['/login',"/register"];
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = store.state.loggedIn;
    // next()
    if (!authRequired) {
        next()
    } else if (authRequired && !loggedIn) {
        next('/login');
    }else{
        next()
    }

});


export default router;
