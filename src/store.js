import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        server_url: "http://120.55.48.190:8000",
        batch_list: []
    },
    mutations: {
        setBatchList(value) {
            this.batch_list = []
            this.batch_list = value
        }
    },
    actions: {}
})
