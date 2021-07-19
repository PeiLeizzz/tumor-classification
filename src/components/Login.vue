<template>
    <div class="login-container">
        <h2 class="login-title">标注平台</h2>
        <a-form-model :model="form" @submit="login" @submit.native.prevent class="login-form">
            <h2 class="title">登录 LOGIN</h2>
            <a-form-model-item>
                <a-input v-model="form.username" placeholder="Username">
                    <a-icon slot="prefix" type="user" style="color:rgba(0,0,0,.25)"/>
                </a-input>
            </a-form-model-item>
            <a-form-model-item>
                <a-input v-model="form.password" type="password" placeholder="Password">
                    <a-icon slot="prefix" type="lock" style="color:rgba(0,0,0,.25)"/>
                </a-input>
            </a-form-model-item>
            <a-form-model-item>
                <a-button type="primary" html-type="submit"
                          :disabled="form.username === '' || form.password === ''" class="submit">
                    登录
                </a-button>
            </a-form-model-item>
        </a-form-model>
    </div>
</template>

<script>
import axios from "axios";

export default {
    data() {
        return {
            form: {
                username: "",
                password: "",
            }
        };
    },
    methods: {
        async login() {
            console.log(this.form)
            await axios.post('/api/auth/token', this.form).then((res) => {
                if (res.status == 200) {
                    let token = res.data["access_token"];
                    this.$store.commit('$_setToken', token);
                    this.$store.commit('setUsername', this.form.username)
                    this.$router.push({path: '/main'});
                } else {
                    alert('登陆失败');
                    this.$router.push({path: '/'});
                }
            }).catch((e) => {
                alert('登陆失败');
                console.log(e);
            })
        }
    },
};
</script>

<style scoped>
.login-form {
    width: 565px;
    height: 372px;
    margin: 0 auto;
    background: rgba(138, 138, 138, 0.5);
    padding: 40px 110px;
    border-radius: 10px;
}

/* 背景 */
.login-container {
    position: absolute;
    width: 100%;
    height: 100%;
    background: url('../assets/login-background.jpg');
    background-size: 100% 100%;
}

/* Log */
.login-title {
    color: #fff;
    text-align: center;
    margin: 100px 0 60px 0;
    font-size: 36px;
    font-family: Microsoft Yahei;
}

/* 登陆按钮 */
.submit {
    width: 100%;
    height: 45px;
    font-size: 16px;
}

/* 用户登陆标题 */
.title {
    margin-bottom: 50px;
    color: #fff;
    font-weight: 700;
    font-size: 24px;
    font-family: Microsoft Yahei;
}

/* 输入框内左边距50px */
.ant-input-affix-wrapper .ant-input:not(:first-child) {
    padding-left: 50px;
}
</style>
