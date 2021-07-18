import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import axios from "axios";
import vuescroll from 'vuescroll';
import VueLazyLoad from 'vue-lazyload'


Vue.config.productionTip = false

Vue.use(Antd)
Vue.use(vuescroll);
Vue.use(VueLazyLoad, {
    error: '../error.png',
    loading: '../loading.gif'
})

Vue.prototype.$vuescrollConfig = {
    bar: {
        background: '#8c8686'
    }
};

axios.defaults.baseURL = "/api"
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

new Vue({
    router,
    store,
    render: function (h) {
        return h(App)
    }
}).$mount('#app')
