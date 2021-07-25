import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        server_url: "https://39.100.80.45:443",
        token: localStorage.getItem('token') ? localStorage.getItem('token') : '',   // token,
        username: localStorage.getItem('username') ? localStorage.getItem('username') : '', // username
    },
    getters: {    // 监听数据变化的
        getStorage(state) {   // 获取本地存储的登录信息
            if (!state.token) {
                state.token = JSON.parse(localStorage.getItem(key))
            }
            return state.token
        }
    },
    mutations: {
        $_setToken(state, value) { // 设置存储token
            state.token = value;
            localStorage.setItem('token', value);
        },
        $_removeStorage(state) {  // 删除token
						state.token = '';
            localStorage.removeItem('token');
        },
        $_setUsername(state, value) { // 设置保存用户姓名
            state.username = value
            localStorage.setItem('username', value);
        }
    }

})
