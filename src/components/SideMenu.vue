<template>
    <div>
        <a-menu theme="dark" mode="inline" :open-keys="openKeys" @openChange="onOpenChange"
                :selectedKeys="selected_key" @click="changeImageData">
            <a-sub-menu key="sub1">
                <span slot="title">
                    <a-icon type="file-search"/>
                    <span style="width: 80%!important;text-align: center;margin-left: 25px">图像标注</span>
                </span>
                <a-menu-item v-for="(item,index) in this.batch_list" :key="item">
                    {{ item }}
                </a-menu-item>
            </a-sub-menu>
            <!--     后期开发       -->
            <!--            <a-sub-menu key="sub4">
                            <span slot="title"><a-icon type="setting"/><span>Navigation Three</span></span>
                            <a-menu-item key="9">
                                Option 9
                            </a-menu-item>
                            <a-menu-item key="10">
                                Option 10
                            </a-menu-item>
                            <a-menu-item key="11">
                                Option 11
                            </a-menu-item>
                            <a-menu-item key="12">
                                Option 12
                            </a-menu-item>
                        </a-sub-menu>-->
        </a-menu>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "SideMenu",
    data() {
        return {
            selected_key: undefined,
            batch_list: [],
            rootSubmenuKeys: ['sub1', 'sub2', 'sub4'],
            openKeys: ['sub1'],
            keyPath: [],
        };
    },
    mounted() {
        this.fetchBatchList()
        this.$root.$on('changeSelectedKeys', () => {
            this.selected_key = this.keyPath
            this.$root.$emit('current_selection_branch', this.selected_key)
            this.$root.$emit('resetTimer')
        })
    },
    methods: {
        onOpenChange(openKeys) {
            const latestOpenKey = openKeys.find(key => this.openKeys.indexOf(key) === -1);
            if (this.rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
                this.openKeys = openKeys;
            } else {
                this.openKeys = latestOpenKey ? [latestOpenKey] : [];
            }
        },
        changeImageData(data) {
            if (JSON.stringify(this.keyPath) != JSON.stringify(data.keyPath)) {
                this.keyPath = data.keyPath
                this.$root.$emit('changeData', data.item.index)
            }
        },
        async fetchBatchList() {
            await axios.get("/api/batch_list").then((res) => {
                if (res.data["unlabled"] == "") {
                    this.$message.info("所有图像已经被标记完毕！");
                } else {
                    this.batch_list = res.data["unlabled"]
                    this.keyPath = [this.batch_list[0], 'sub1']
                    this.$root.$emit('current_selection_branch', this.keyPath)
                }
            }).catch((e) => {
                this.$message.error(e);
            });
        },
    },
}
</script>

<style scoped>

</style>