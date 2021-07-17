import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import axios from "axios";
// import vuescroll from 'vuescroll';

Vue.config.productionTip = false

Vue.use(Antd)

// Vue.prototype.$vuescrollConfig = {
//   bar: {
//     background: '#8c8686'
//   }
// };

axios.defaults.baseURL = "/api"

new Vue({
    router,
    store,
    render: function (h) {
        return h(App)
    }
}).$mount('#app')
