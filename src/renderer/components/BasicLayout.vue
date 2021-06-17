<template>
    <div style="padding:10px; text-align: left">
        <a-tabs v-model:activeKey="currentTab" type="card" @change="tabChanged">
            <a-tab-pane key="1">
                <template #tab>
                    <span><RetweetOutlined/>Compare</span>
                </template>
                <Home ref="homeRef"/>
            </a-tab-pane>
            <a-tab-pane key="2">
                <template #tab>
                    <span><DatabaseOutlined/>Node List</span>
                </template>
                <NodeList></NodeList>
            </a-tab-pane>
            <a-tab-pane key="3">
                <template #tab>
                    <span><DatabaseOutlined/>How to</span>
                </template>
                <HowTo></HowTo>
            </a-tab-pane>
            <template #tabBarExtraContent v-if="currentTab==='1'">
                <a-switch checked-children="Hide Same" un-checked-children="Show Same" @change="switchChanged" />
            </template>
        </a-tabs>
    </div>
</template>
<script>
    import {defineComponent, reactive, toRefs, ref} from "vue";
    import {DatabaseOutlined, RetweetOutlined} from '@ant-design/icons-vue';
    import NodeList from'./NodeList.vue';
    import Home from'./Home.vue';
    import HowTo from'./HowTo.vue';

    export default defineComponent({
        setup() {
            const homeRef = ref(null);

            function tabChanged(key) {
                if(key === '1') {
                    homeRef.value.loadDB()
                }
            }

            function switchChanged(val) {
                homeRef.value.setHideSame(val)
            }

            return {
                homeRef,
                tabChanged,
                switchChanged,
                currentTab: ref('1'),
                hideSame: ref(false),
            }
        },
        components: {
            RetweetOutlined,
            DatabaseOutlined,
            NodeList,
            Home,
            HowTo
        },
    })
</script>
<style>
    .icon {
        color: #fb6401;
    }
</style>
