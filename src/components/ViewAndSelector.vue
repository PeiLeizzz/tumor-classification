<template>
    <div>
        <div class="images">
            <a-row>
                <!--   图片列表   -->
                <a-col span="6">
                    <a-list bordered :data-source="pic_data">
                        <a-list-item style="display: flex" slot="renderItem" slot-scope="item, index">
                            {{ item }}
                            <div>
                                <a-icon v-if="!isClassified" type="check-circle" theme="filled"/>
                                <a-icon v-else type="check-circle" theme="twoTone" two-tone-color="#52c41a"/>
                            </div>
                        </a-list-item>
                    </a-list>
                </a-col>
                <!--   图片展示   -->
                <a-col span="12">
                    <a-row type="flex" justify="space-around" align="middle" v-viewer="{}">
                        <a-col v-for="src in images" :key="src">
                            <img :src="src" alt="">
                        </a-col>
                    </a-row>
                    <a-button-group style="display:flex;justify-content:space-around;margin-top:10px;">
                        <a-button type="primary">
                            <a-icon type="left"/>
                            上一张
                        </a-button>
                        <a-button type="primary">
                            下一张
                            <a-icon type="right"/>
                        </a-button>
                    </a-button-group>
                </a-col>
                <!--   类别判断   -->
                <a-col span="6">
                    <div style="display: flex;justify-content: center;align-items: center;margin-top: 10px;">
                        <a-radio-group default-value="a" size="large">
                            <a-space direction="vertical">
                                <a-radio-button v-for="subClass in classes" :value="subClass" :style="radioStyle">
                                    {{ subClass }}
                                </a-radio-button>
                            </a-space>
                        </a-radio-group>
                    </div>
                </a-col>
            </a-row>
        </div>
        <!--        <button type="button" @click="show">Show</button>-->
    </div>
</template>

<script>
import 'viewerjs/dist/viewer.css'
import {directive as viewer} from "v-viewer"

export default {
    name: "ViewAndSelector",
    directives: {
        viewer: viewer({
            debug: true,
        }),
    },
    data() {
        return {
            isClassified: false,
            pic_data: [
                'pic01',
                'pic02',
                'pic03',
                'pic04',
                'pic05',
                'pic06',
                'pic07',
                'pic08',
                'pic09',
                'pic10',
            ],
            images: [
                "https://picsum.photos/id/1/450",
                // "https://picsum.photos/id/2/300/300",
                // "https://picsum.photos/300/200",
                // "https://picsum.photos/250/200"
            ],
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
            radioStyle: {
                display: 'block',
                height: '30px',
                lineHeight: '30px',
            },
        };
    },
    methods: {
        show() {
            const viewer = this.$el.querySelector('.images').$viewer
            viewer.show()
        }
    }
}
</script>

<style scoped>

</style>