<template>
    <div>
        <div>
            <a-row>
                <h3 align="center">当前选择图片: {{ received_data.pic_name[currentPictureIdx] }}</h3>
                <p align="end" style="margin: 0">当前已标记 {{ current_count }}/{{ received_data.pic_name.length }}</p>
            </a-row>
            <a-row type="flex" align="middle" justyfy="space-between">
                <!--   图片列表   -->
                <a-col span="5">
                    <vue-scroll>
                        <div style="height: 550px">
                            <div v-for="(item,index) in this.received_data.pic_name" :key="item">
                                <div :class="currentPictureIdx === index ? 'left-col-items-selected':'left-col-items'" @click="changeImageIdx(index)">
                                    {{ item }}
                                    <div>
                                        <!-- 控制√的颜色 -->
                                        <a-icon v-if="!received_data.is_classified[index]" type="check-circle" theme="filled"/>
                                        <a-icon v-else type="check-circle" theme="twoTone" two-tone-color="#52c41a"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </vue-scroll>
                </a-col>
                <!--   图片展示   -->
                <a-col span="14">
                    <a-row type="flex" justify="space-around" align="middle" v-viewer="{}">
                        <a-col>
                            <img :src="this.received_data.pic_url[this.currentPictureIdx]" alt="" width="640" height="360">
                        </a-col>
                    </a-row>
                    <a-button-group style="display:flex;justify-content:space-around;margin-top:30px;">
                        <a-button type="primary" @click="prevImageIdx">
                            <a-icon type="left"/>
                            上一张
                        </a-button>
                        <a-button type="primary" @click="nextImageIdx">
                            下一张
                            <a-icon type="right"/>
                        </a-button>
                    </a-button-group>
                    <div style="display:flex;justify-content:space-around;margin-top:30px;">
                        <a-button type="primary" size="large" @click="generatePostData" :disabled="current_count !== received_data.pic_name.length">
                            提交上传
                            <a-icon type="upload"/>
                        </a-button>
                    </div>

                </a-col>
                <!--   类别判断   -->
                <a-col span="5">
                    <div style="display: flex;justify-content: center;align-items: center;margin-top: 10px;">
                        <a-space direction="vertical">
                            <div v-for="(subClass) in classes" :key="subClass">
                                <div class="right-col-items-selected" v-if="current_class===subClass" @click="updateClassInfo(subClass)">
                                    {{ subClass }}
                                </div>
                                <div class="right-col-items" v-else @click="updateClassInfo(subClass)">
                                    {{ subClass }}
                                </div>
                            </div>
                        </a-space>
                    </div>
                </a-col>
            </a-row>
        </div>
    </div>
</template>

<script>
import 'viewerjs/dist/viewer.css'
import {directive as viewer} from "v-viewer"
import axios from "axios";

export default {
    name: "ViewAndSelector",
    directives: {
        viewer: viewer({
            debug: true,
        }),
    },
    mounted() {
        this.url = this.$store.state.server_url
        this.fetchData()
        console.log("data", this.received_data)
        //设置起始时间
        this.post_data.start_time = new Date().getTime();
    },
    data() {
        return {
            currentPictureIdx: -1,
            is_classified: [],
            // 接收数据
            received_data: {
                pic_url: [],
                pic_name: [],
                s_class: [],
                is_classified: []
            },
            // 上传数据
            post_data: {
                batch_id: "",
                start_time: "",
                end_time: "",
                results: []
            },
            current_count: 0,
            current_class: "",
            // 分类类别
            classes: [
                "1 胰腺钩突 D2-SMA-SMV",
                "2 胰腺钩突 D3-SMA-SMV",
                "3 胰腺钩突 D4-SMA-SMV",
                "4 胰腺钩突 D5-SMA-SMV",
                "5 胰腺钩突 D2-SMA-SMV",
                "6 胰腺钩突 D3-SMA-SMV",
                "7 胰腺钩突 D4-SMA-SMV",
                "8 胰腺钩突 D5-SMA-SMV",
                "9 胰腺钩突 D2-SMA-SMV",
                "10 胰腺钩突 D3-SMA-SMV",
                "11 胰腺钩突 D4-SMA-SMV",
            ],
            url: "",
        };
    },
    methods: {
        async fetchBatchList() {
            let data = undefined
            await axios.get("/api/batch_list").then((res) => {
                // console.log(res.data)
                data = res.data["unlabled"]
            }).catch((e) => {
                this.$message.warning(e);
            });
            return data;
        },
        async fetchData() {
            let unlabeledList = await this.fetchBatchList();
            console.log(unlabeledList.length)
            //随机获得一个unlabeled的batch
            let ids = Math.floor(Math.random() * unlabeledList.length);
            //填写batch_id
            this.post_data.batch_id = unlabeledList[ids]
            await axios.get("/api/img_list/" + unlabeledList[ids]).then((res) => {
                console.log(res.data)
                //将获得的图像列表付给received_data
                // this.received_data.pic_name = res.data["img_list"].slice(0, 10) // 测试前10组样例
                this.received_data.pic_name = res.data["img_list"]
                this.generateImgUrl()
            }).catch((e) => {
                this.$message.error(e);
            });
        },
        // 上传数据
        async postData() {
            // 填入完成时间戳
            this.post_data.end_time = new Date().getTime()
            await axios.post("/post_info", this.post_data).then((res) => {
                console.log("dddddddddddddddd", res.data)
            }).catch((e) => {
                this.$message.error(e);
            });
        },
        generatePostData() {
            for (let i = 0; i < this.received_data.pic_name.length; i++) {
                let obj = {
                    img_name: this.received_data.pic_name[i],
                    img_class: this.received_data.s_class[i]
                }
                this.post_data.results.push(obj)
            }
            // console.log("objjjjjjjj", this.post_data)
            this.postData();
        },
        // 生成图像对应链接以及将isClassified置为false
        generateImgUrl() {
            let img_base_url = "http://120.55.48.190:8000/api/img/";
            for (let i = 0; i < this.received_data.pic_name.length; i++) {
                let str = img_base_url + this.received_data.pic_name[i]
                this.received_data.pic_url.push(str)
                this.received_data.is_classified.push(false)
                this.received_data.s_class.push("")
            }
            //默认初始图像下标为0
            this.currentPictureIdx = 0;
        },
        updateClassInfo(value) {
            // this.received_data.s_class[this.currentPictureIdx] = e.target.value
            this.$set(this.received_data.s_class, this.currentPictureIdx, value)
            if (!this.received_data.is_classified[this.currentPictureIdx])
                this.current_count++
            this.$set(this.received_data.is_classified, this.currentPictureIdx, true)
            this.refreshSelection()
        },
        changeImageIdx(idx) {
            this.currentPictureIdx = idx
            this.refreshSelection()
        },
        refreshSelection() {
            this.current_class = this.received_data.s_class[this.currentPictureIdx]
            let temp = this.classes
            this.classes = undefined
            this.classes = temp
        },
        prevImageIdx() {
            if (this.currentPictureIdx === 0) {
                this.$message.warning("这已经是第一张图!")
            } else {
                this.currentPictureIdx--;
                this.refreshSelection()
            }
        },
        nextImageIdx() {
            if (this.currentPictureIdx === this.received_data.pic_name.length - 1) {
                this.$message.warning("这已经是最后一张图!")
            } else {
                this.currentPictureIdx++;
                this.refreshSelection()
            }
        }
    }
}
</script>

<style scoped>
.left-col-items {
    display: flex;
    justify-content: space-between;
    align-content: center;
    line-height: 30px;
    height: 30px;
    padding: 0 10px;
    border-radius: 1rem;
}

.left-col-items-selected {
    display: flex;
    justify-content: space-between;
    align-content: center;
    line-height: 30px;
    height: 30px;
    padding: 0 10px;
    border-radius: 1rem;
    background-color: gray;
    color: white;
    cursor: pointer;
}

.left-col-items:hover {
    background-color: gray;
    color: white;
    cursor: pointer;
}

.right-col-items {
    display: flex;
    justify-content: space-between;
    align-content: center;
    line-height: 30px;
    height: 30px;
    padding: 0 10px;
    border-radius: 1rem;
    /*border-color: #40A9FF;*/
}

.right-col-items-selected {
    display: flex;
    justify-content: space-between;
    align-content: center;
    line-height: 30px;
    height: 30px;
    padding: 0 10px;
    border-radius: 1rem;
    border-color: #40A9FF;
    background-color: gray;
    color: white;
    cursor: pointer;
}

.right-col-items:hover {
    background-color: gray;
    color: white;
    cursor: pointer;
}

</style>

<style>
/*.ant-radio-button-checked:nth-child(2) {
    color: #2c3e50 !important;
}

.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
    color: #2c3e50 !important;
}

.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
    border-color: #d9d9d9 !important;
}*/
</style>