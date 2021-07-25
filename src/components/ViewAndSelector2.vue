<template>
	<div>
		<div>
			<a-row type="flex" align="middle" justyfy="space-between">
				<!--   图片列表   -->
				<a-col :sm="5" :md="5" :lg="5" :xl="5" :xxl="5" style="display: flex;flex-flow: column;justify-content: center;align-items: center">
					<p align="end" style="margin: 0 0 0.5rem 0">当前已标记 {{ current_count }}/{{ received_data.video.length }}</p>
					<vue-scroll>
						<div style="height: 550px;display:flex;align-items: center;flex-flow: column">
							<div v-for="(item,index) in this.received_data.video" :key="item.video_id" style="width: 80%">
								<div :class="currentVideoIdx === index ? 'left-col-items-selected':'left-col-items'" @click="changeVideoIdx(index)">
									{{ item.video_id }}
									<div>
										<!-- 控制√的颜色 -->
										<a-icon v-if="!received_data.is_classified[index]" type="check-circle" theme="filled" />
										<a-icon v-else type="check-circle" theme="twoTone" two-tone-color="#52c41a" />
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
							<h3 align="center" style="margin: 0">当前选择视频: <span style="color: #006E00;">{{ received_data.video[currentVideoIdx].video_id }}</span>
							</h3>
						</a-col>
						<a-col :span="5"></a-col>
					</a-row>
					<a-row type="flex" justify="space-around" align="middle" v-viewer="{}">
						<a-col style="width: 768px;height: 432px;display:flex;justify-content:center;align-content: center">
							<div class="my_video">
								<video-player 
									class="video-player vjs-custom-skin" 
									ref="videoPlayer" 
									:playsinline="true" 
									:options="options"
									@play="onPlayerPlay($event)" 
									@pause="onPlayerPause($event)" 
									@ended="onPlayerEnded($event)" 
									@waiting="onPlayerWaiting($event)"
									@playing="onPlayerPlaying($event)" 
									@loadeddata="onPlayerLoadeddata($event)" 
									@timeupdate="onPlayerTimeupdate($event)"
									@canplay="onPlayerCanplay($event)" 
									@canplaythrough="onPlayerCanplaythrough($event)" 
									@statechanged="playerStateChanged($event)"
									@ready="playerReadied">
								</video-player>
								<video style="height: 60%; weight: 100%;" controls muted="muted">
									<source src="https://39.100.80.45/api/video/ZXlKaGJHY2lPaUpJVXpVeE1pSXNJbWxoZENJNk1UWXlOekl4TURnek9Dd2laWGh3SWpveE5qSTNNalUwTURNNGZRLmV5SjFjMlZ5YVdRaU9pSjBNREF4SWl3aWRtbGtaVzlmYVdRaU9pSTFOekkwTmpVeE5TNXRjRFFpZlEudkJsbUctV013aDdKT0NseEt4bmx2Ym43NC0xZkpwNlhpUy1SdWJpTVdZZldVWmQybFI5VEYzYV8yWndqbUlJbUM5aFlxQ3E4LVhzQ20yTmRlYklmT0E=" 
									type="video/mp4" />
								</video>
							</div>
						</a-col>
					</a-row>
					<a-button-group style="display:flex;justify-content:space-around;margin-top:30px;">
						<a-button type="primary" @click="prevVideoIdx">
							<a-icon type="left" />
							上一个
						</a-button>
						<a-button type="primary" @click="nextVideoIdx">
							下一个
							<a-icon type="right" />
						</a-button>
					</a-button-group>
					<div style="display:flex;justify-content:space-around;margin-top:30px;">
						<a-button type="primary" size="large" @click="() => (this.modalVisible = true)" :disabled="current_count !== received_data.video.length">
							提交上传
							<a-icon type="upload" />
						</a-button>
					</div>
				</a-col>
				<!--   类别判断   -->
				<a-col :sm="5" :md="5" :lg="5" :xl="5" :xxl="5">
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
		<a-modal v-model="modalVisible" title="确定要上传吗" centered @ok="generatePostData" :okText="upload_status===2 ?'重试':'确认'"
		 cancelText="取消" :destroyOnClose=true :okButtonProps="upload_status===1?{props:{disabled:true}}:{}">
			<p v-if="upload_status===0">请检查是否有标记错误</p>
			<p v-if="uploading">正在上传。。。</p>
			<a-spin v-if="uploading" size="large" />
			<a-result v-if="upload_status===1" status="success" title="上传成功" sub-title="即将刷新界面开始新的标记"></a-result>
			<a-result v-else-if="upload_status===2" status="error" title="上传失败" sub-title="请检查网络连接或者联系你的管理员"></a-result>
		</a-modal>
	</div>
</template>

<script>
	import 'viewerjs/dist/viewer.css'
	import {
		directive as viewer
	} from "v-viewer"
	import axios from "axios";
	import Timer from "@/components/Timer"

	export default {
		name: "ViewAndSelector",
		components: {
			Timer
		},
		directives: {
			viewer: viewer({
				debug: true,
				loading: true
			}),
		},
		mounted() {
			let _this = this
			this.$root.$on('changeData', data => {
				if (_this.current_count !== 0)
					_this.$confirm({
						content: '检测到您有未上传的数据，现在切换页面会导致数据丢失。确定要切换吗？',
						okText: '确认',
						centered: true,
						onOk() {
							_this.clearData()
							_this.fetchVideoList()
							_this.$root.$emit('changeSelectedKeys')
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
					_this.$root.$emit('changeSelectedKeys')
				}
			})
			this.url = this.$store.state.server_url;
			this.fetchClasses();
			this.fetchVideoList();
			//设置起始时间
			this.post_data.start_time = new Date().getTime();
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
					video: [],
					s_class: [],
					is_classified: []
				},
				// 上传数据
				post_data: {
					video_id: "",
					start_time: "",
					end_time: "",
					results: []
				},
				current_count: 0,
				current_class: "",
				// 分类类别
				classes: [],
				url: "",
				options: {
					playbackRates: [0.5, 1.0, 1.5, 2.0, 3.0], // 可选的播放速度
					autoplay: false, // 是否自动播放
					muted: false, // 是否静音
					loop: true, // 是否开启循环播放
					preload: "auto", // 自动预加载
					language: "zh-CN", // 语言，'en', 'zh-cn', 'zh-tw'
					aspectRatio: "16:9", // 播放器高宽占比（例如"16:9"或"4:3"）
					fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
					sources: [{
						type: "video/mp4", // 类型
						src: "" // url地址
					}],
					poster: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1606462956126&di=2d87964d4faf656af55d09d938640d97&imgtype=0&src=http%3A%2F%2Fattachments.gfan.com%2Fforum%2Fattachments2%2F201310%2F10%2F150326y7dzdd8d4kpjjdsd.jpg", // 封面地址
					notSupportedMessage: "此视频暂无法播放，请稍后再试", // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
					controlBar: {
						timeDivider: true, // 是否显示当前时间和持续时间的分隔符，"/"
						durationDisplay: true, // 是否显示持续时间
						remainingTimeDisplay: false, // 是否显示剩余时间
						fullscreenToggle: true, // 是否显示全屏按钮
					}
				}
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
					} 
					else {
						//this.received_data.video = res.data["unlabled"];
						for (let i = 0; i < res.data["unlabled"].length; i++) {
							this.received_data.video.push(res.data["unlabled"][i])
						}
						this.generateVideoUrl();
					}
				}).catch((e) => {
					this.$message.error(e);
				});
			},
			// 上传数据
			async postData() {
				// 填入完成时间戳
				this.post_data.end_time = new Date().getTime()
				await axios.post("/api/post_video_result", this.post_data).then((res) => {
					this.uploading = false
					this.upload_status = 1
					let _this = this
					setTimeout(() => {
						// _this.$router.go(0);//注释掉
						window.location.reload()
					}, 1000)
				}).catch((e) => {
					this.uploading = false
					this.upload_status = 2
					this.$message.error(e);
				});
			},
			clearData() {
				this.currentVideoIdx = 0
				this.is_classified = []
				// 接收数据
				this.received_data = {
					video: [],
					s_class: [],
					is_classified: []
				}
				this.current_count = 0
				this.current_class = ""
				this.options.sources.src = [{
					type: "video/mp4", // 类型
					src: "", // url地址
				}]
			},
			generatePostData() {
				for (let i = 0; i < this.received_data.video.length; i++) {
					let obj = {
						video_id: this.received_data.video[i].video_id,
						video_class: this.received_data.s_class[i]
					}
					this.post_data.results.push(obj)
				}
				this.postData();
			},
			// 生成视频对应链接以及将isClassified置为false
			generateVideoUrl() {
				for (let i = 0; i < this.received_data.video.length; i++) {
					this.received_data.is_classified.push(false)
					this.received_data.s_class.push("")
				}
				//默认初始图像下标为0
				this.currentVideoIdx = 0;
			},
			updateClassInfo(value) {
				// this.received_data.s_class[this.currentVideoIdx] = e.target.value
				this.$set(this.received_data.s_class, this.currentVideoIdx, value)
				if (!this.received_data.is_classified[this.currentVideoIdx])
					this.current_count++
				this.$set(this.received_data.is_classified, this.currentVideoIdx, true)
				this.refreshSelection()
			},
			changeVideoIdx(idx) {
				if (idx === this.currentVideoIdx)
					return
				this.currentVideoIdx = idx
				this.image_status = 1 // 切换为拉取模式
				this.refreshSelection()
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
					this.currentVideoIdx--;
					this.image_status = 1 // 切换为拉取模式
					this.refreshSelection()
				}
			},
			nextVideoIdx() {
				if (this.currentVideoIdx === this.received_data.video.length - 1) {
					this.$message.warning("这已经是最后一个视频!")
				} else {
					this.currentVideoIdx++;
					this.image_status = 1 // 切换为拉取模式
					this.refreshSelection()
				}
			},
			// 播放回调
			onPlayerPlay($event) {
				//console.log("player play!", $event);
			},
			// 暂停回调
			onPlayerPause($event) {
				//console.log("player pause!", $event);
			},
			// 视频播完回调
			onPlayerEnded($event) {
				//console.log($event);
			},
			// DOM元素上的readyState更改导致播放停止
			onPlayerWaiting($event) {
				//console.log($event);
			},
			// 已开始播放回调
			onPlayerPlaying($event) {
				//console.log($event);
			},
			// 当播放器在当前播放位置下载数据时触发
			onPlayerLoadeddata($event) {
				//console.log($event);
			},
			// 当前播放位置发生变化时触发。
			onPlayerTimeupdate($event) {
				//console.log($event);
			},
			//媒体的readyState为HAVE_FUTURE_DATA或更高
			onPlayerCanplay($event) {
				// console.log('player Canplay!', player)
			},
			//媒体的readyState为HAVE_ENOUGH_DATA或更高。这意味着可以在不缓冲的情况下播放整个媒体文件。
			onPlayerCanplaythrough($event) {
				// console.log('player Canplaythrough!', player)
			},
			//播放状态改变回调
			playerStateChanged($event) {
				//console.log("player current update state", $event);
			},
			//将侦听器绑定到组件的就绪状态。与事件监听器的不同之处在于，如果ready事件已经发生，它将立即触发该函数。。
			playerReadied() {
				//console.log("example player 1 readied");
			},
		},
		watch: {
			currentVideoIdx() {
				this.options.sources[0].src = this.received_data.video[this.currentVideoIdx].video_url;
				//this.$refs.video.src = this.options.sources[0].src;
				console.log(this.options.sources[0].src)
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
		background-color: gray;
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