<template>
    <div>
        <div>
            <a-row type="flex" align="middle" justyfy="space-between">
                <!--   图片列表   -->
                <a-col :sm="5" :md="5" :lg="5" :xl="5" :xxl="5" style="display: flex;flex-flow: column;justify-content: center;align-items: center">
                    <p align="end" style="margin: 0 0 0.5rem 0">当前已标记 {{ this.$store.state.current_count }}/{{ received_data.video_id.length }}</p>
                    <vue-scroll>
                        <div style="height: 550px;display:flex;align-items: center;flex-flow: column">
                            <div v-for="(item,index) in this.received_data.video_id" :key="item" style="width: 80%">
                                <div :class="currentVideoIdx === index ? 'left-col-items-selected':'left-col-items'" @click="changeVideoIdx(index)">
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
                <!--   视频展示   -->
                <a-col :sm="14" :md="14" :lg="14" :xl="14" :xxl="14">
                    <a-row type="flex" justify="space-around" align="middle" style="margin-bottom: 0.625rem">
                        <a-col :span="5">
                            <div style="display:flex;justify-content: center;align-items: center">
                                <p style="margin: 0">当前计时</p>
                                <Timer></Timer>
                            </div>
                        </a-col>
                        <a-col :span="14">
                            <h3 align="center" style="margin: 0">当前选择视频: <span style="color: #006E00;">{{ received_data.video_id[currentVideoIdx] }}</span>
                            </h3>
                        </a-col>
                        <a-col :span="5"></a-col>
                    </a-row>
                    <a-row type="flex" justify="space-around" align="middle" v-viewer="{}">
                        <a-col style="width: 768px;height: 432px;display:flex;justify-content:center;align-content: center">
													<video id="videoPlayer" class="my_video" controls @play="playVideo" @pause="pauseVideo">
														<source :src="videoUrl" type="video/mp4" />
													</video>
                        </a-col>
                    </a-row>
                    <a-button-group style="display:flex;justify-content:space-around;margin-top:30px;">
                        <a-button type="primary" @click="prevVideoIdx">
                            <a-icon type="left"/>
                            上一个
                        </a-button>
                        <a-button type="primary" @click="nextVideoIdx">
                            下一个
                            <a-icon type="right"/>
                        </a-button>
                    </a-button-group>
                    <div style="display:flex;justify-content:space-around;margin-top:30px;">
                        <a-button type="primary" size="large" @click="() => (this.modalVisible = true)"
                                  :disabled="!this.received_data.is_classified[this.currentVideoIdx]">
                            提交上传
                            <a-icon type="upload"/>
                        </a-button>
                    </div>
                </a-col>
                <!--   类别判断   -->
                <a-col :sm="5" :md="5" :lg="5" :xl="5" :xxl="5">
                    <div style="display: flex;justify-content: center;align-items: center;margin-top: 10px;">
                        <a-space direction="vertical">
                            <div v-for="(subClass) in classes" :key="subClass">
                                <div class="right-col-items-selected" v-if="current_class.includes(subClass)" @click="updateClassInfo(subClass)">
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
        <a-modal v-model="modalVisible" title="确定要上传吗" centered @ok="generatePostData" :okText="upload_status===2 ?'重试':'确认'"
                 cancelText="取消" :destroyOnClose=true :okButtonProps="upload_status===1?{props:{disabled:true}}:{}">
            <p v-if="upload_status===0">上传后不可修改</p>
            <p v-else-if="uploading">正在上传。。。</p>
            <a-spin v-if="uploading" size="large"/>
        </a-modal>
    </div>
</template>

<script>
import 'viewerjs/dist/viewer.css'
import {directive as viewer} from "v-viewer"
import axios from "axios";
import Timer from "@/components/Timer"
import Xgplayer from 'xgplayer-vue';

export default {
    name: "VideoSelector",
    components: {
        Timer,
				Xgplayer
    },
    directives: {
        viewer: viewer({
            debug: true,
            loading: true
        }),
    },
    mounted() {
			let _this = this
			this.$root.$on('changeDataOfVideo', data => {
				console.log("on: changeDataOfVideo");
					if (_this.$store.state.current_count !== 0)
							_this.$confirm({
									content: '检测到您有未上传的数据，现在切换页面会导致数据丢失。确定要切换吗？',
									okText: '确认',
									centered: true,
									onOk() {
											_this.clearData()
											_this.fetchVideoList()
											_this.$root.$emit('changeSelectedKeys', data.keyPath)
											_this.$destroyAll()
									},
									cancelText: '取消',
									onCancel() {
											_this.$destroyAll()
									}
							})
					else {
							_this.clearData()
							_this.fetchVideoList()
							// 将数据再发回给side menu
							_this.$root.$emit('changeSelectedKeys', data.keyPath)
					}
			})
			this.url = this.$store.state.server_url;
			this.fetchClasses();
			this.fetchVideoList();
			//设置起始时间
			this.$root.$on("setTime", (time) => {
				this.post_data.start_time = this.post_data.end_time - time;
			})
    },
    data() {
        return {
            modalVisible: false,
            uploading: false,
            upload_status: 0,
            currentVideoIdx: 0,
            is_classified: [],
            // 接收数据
            received_data: {
                video_id: [],
                video_url: [],
                s_class: [],
                is_classified: []
            },
            // 上传数据
            post_data: {
                video_name: "",
                start_time: "",
                end_time: "",
                results: []
            },
            current_class: [],
            // 分类类别
            classes: [],
            url: "",
						videoUrl: "",
        };
    },
    methods: {
        async fetchClasses() {
            await axios.get("/api/class_list").then((res) => {
                this.classes = res.data["classes"]
            }).catch((e) => {
                this.$message.error(e);
            });
        },
        async fetchVideoList() {
            await axios.get("/api/video_list").then((res) => {
                if (res.data["unlabled"] == "") {
                    this.$message.info("所有视频已经被标记完毕！");
                } else {
                    for (let i = 0; i < res.data["unlabled"].length; i++) {
                        this.received_data.video_id.push(res.data["unlabled"][i].video_id);
                        this.received_data.video_url.push(res.data["unlabled"][i].video_url);
                    }
                    this.generateVideoClass();
                    this.updateVideoUrl();
                }
            }).catch((e) => {
                this.$message.error(e);
            });
        },
        // 上传数据
        async postData() {
            // 填入完成时间戳
            this.post_data.end_time = new Date().getTime();
						this.$root.$emit("getTime");
						console.log("start", this.post_data.start_time);
						console.log("end", this.post_data.end_time);
            await axios.post("/api/post_video_result", this.post_data).then((res) => {
								this.upload_status = 1;
                this.uploading = true;
                let _this = this;
                setTimeout(() => {
                    // _this.$router.go(0);//注释掉
                    // window.location.reload()
										this.clearData();
										this.fetchVideoList();
										this.$message.success("上传成功")
                }, 500)
            }).catch((e) => {
								this.upload_status = 2;
                this.$message.error(e);
            });
						this.uploading = false;
						this.upload_status = 0;
        },
        clearData() {
            this.currentVideoIdx = 0
            this.is_classified = []
            // 接收数据
            this.received_data = {
                video_id: [],
                video_url: [],
                s_class: [],
                is_classified: []
            }
						this.$store.commit('$_setCurrentCount', 0);
            this.current_class = [];
						this.videoUrl = "";
						let video = document.getElementById("videoPlayer");
						video.src = "";
						this.$root.$emit("resetTimer");
						this.$root.$emit("destroyTimer");
        },
        generatePostData() {
            this.$set(this.post_data, "video_name", this.received_data.video_id[this.currentVideoIdx]);
            this.$set(this.post_data, "results", this.received_data.s_class[this.currentVideoIdx]);
            this.postData();
						this.modalVisible = false;
						this.$root.$emit('resetTimer');
						this.$root.$emit('pauseTimer');
        },
        // 将视频的isClassified置为false
        generateVideoClass() {
            for (let i = 0; i < this.received_data.video_id.length; i++) {
                this.received_data.is_classified.push(false)
                this.received_data.s_class.push([])
            }
            //默认初始图像下标为0
            this.currentVideoIdx = 0;
        },
        updateClassInfo(value) {
            let id = this.received_data.s_class[this.currentVideoIdx].indexOf(value);
            // 如果之前已经选了，则删除；未选，则加入
            if (id !== -1) {
                this.received_data.s_class[this.currentVideoIdx].splice(id, 1);
            } else {
                this.received_data.s_class[this.currentVideoIdx].push(value);
            }

            if (!this.received_data.is_classified[this.currentVideoIdx]) {
                //this.current_count = 1;
								this.$store.commit('$_setCurrentCount', 1)
                this.$set(this.received_data.is_classified, this.currentVideoIdx, true)
            } else if (this.received_data.s_class[this.currentVideoIdx].length === 0) {
                // 如果多选全都取消了，要重置状态
                //this.current_count = 0;
								this.$store.commit('$_setCurrentCount', 0)
                this.$set(this.received_data.is_classified, this.currentVideoIdx, false)
            }
            this.refreshSelection()
        },
        changeVideoIdx(idx) {
            if (idx === this.currentVideoIdx) {
                return
            }
            // 如果当前有对该视频的标注
            if (this.received_data.is_classified[this.currentVideoIdx]) {
								let _this = this;
                this.$confirm({
                    title: '确定要切换吗',
                    content: '视频标注每次提交一个，如果切换视频，会导致当前视频的标注清空',
                    onOk() {
                        //_this.current_count = 0;
												_this.$store.commit('$_setCurrentCount', 0);
                        _this.received_data.is_classified[_this.currentVideoIdx] = false;
                        _this.received_data.s_class[_this.currentVideoIdx].splice(0, _this.received_data.s_class[_this.currentVideoIdx].length)
                        _this.currentVideoIdx = idx;
                        _this.image_status = 1; // 切换为拉取模式
                        _this.refreshSelection();
												_this.$root.$emit('resetTimer');
												_this.$root.$emit('destroyTimer');
                    }
                });
            } else {
                this.currentVideoIdx = idx;
                this.image_status = 1; // 切换为拉取模式
                this.refreshSelection();
								this.$root.$emit('resetTimer');
								this.$root.$emit('destroyTimer');
            }
        },
        refreshSelection() {
            this.current_class = this.received_data.s_class[this.currentVideoIdx]
            let temp = this.classes
            this.classes = undefined
            this.classes = temp
        },
        prevVideoIdx() {
            if (this.currentVideoIdx === 0) {
                this.$message.warning("这已经是第一个视频!")
            } else {
                this.changeVideoIdx(this.currentVideoIdx - 1);
            }
        },
        nextVideoIdx() {
            if (this.currentVideoIdx === this.received_data.video_id.length - 1) {
                this.$message.warning("这已经是最后一个视频!")
            } else {
                this.changeVideoIdx(this.currentVideoIdx + 1);
            }
        },
        updateVideoUrl(id = 0) {
					let video = document.getElementById("videoPlayer");
					video.src = this.received_data.video_url[id];
					this.videoUrl = this.received_data.video_url[id];
        },
				playVideo() {
					console.log("playVideo");
					this.$root.$emit("startTimer");
				},
				pauseVideo() {
					console.log("pauseVideo");
					this.$root.$emit("destroyTimer");
				}
    },
    watch: {
        currentVideoIdx() {
          this.updateVideoUrl(this.currentVideoIdx);
        }
    }
}
</script>

<style scoped>
.ban-mouse {
    pointer-events: none;
}

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
    background-color: lightseagreen;
    color: white;
    cursor: pointer;
}

.right-col-items:hover {
    background-color: gray;
    color: white;
    cursor: pointer;
}

.my_video {
    max-height: 100%;
    max-width: 100%;
    width: 90%;
    height: 100%;
    margin: 0 auto;
    text-align: center;
}
</style>
