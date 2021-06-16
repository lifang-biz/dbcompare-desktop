<template>
    <a-typography>
        <a-typography-title>介绍 Introduction</a-typography-title>
        <a-typography-paragraph>
            这是一款数据库比较工具，用于比较两个数据库的表、字段、索引是否一致。This is a desktop tool for database structure comparison.
        </a-typography-paragraph>
        <a-typography-title>使用 Get Start</a-typography-title>
        <a-typography-paragraph>
            <ul>
                <li>1. 在Node List中，添加节点，支持直接连接数据库，同时支持通过安装Agent节点做中转，用于访问一些本地不能访问的数据库</li>
                <li>2. Compare 标签页用于比较，分别选择节点和数据库名称后，就会出比较结果，有区别的地方，会用红色标出来</li>
            </ul>
        </a-typography-paragraph>
        <a-typography-title>运行截图 Screenshot</a-typography-title>
        <a-typography-paragraph>
            <img src="/assets/screenshot.jpg" style="width: 80%">
        </a-typography-paragraph>
    </a-typography>
</template>
<script lang="ts">
    import { defineComponent } from 'vue';
    export default defineComponent({
        setup() {
        },
    });
</script>

