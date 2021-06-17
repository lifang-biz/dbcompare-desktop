<template>
    <a-row>
        <a-col :span="12">
            <a-row>
                <a-col :span="12" style="display: flex">
                    <label class="padding-right-10" style="line-height: 36px;">Node </label>
                    <a-select
                            style="width:100%;margin:0 20px 0 10px;"
                            placeholder="Please select node"
                            @change="handleLeftNodeChange"
                    >
                        <a-select-option v-for="node in nodes" :key="node._id">
                            {{ node.name }}
                        </a-select-option>
                    </a-select>
                </a-col>
                <a-col :span="8" style="display: flex">
                    <label class="padding-right-10" style="line-height: 36px;">Database</label>
                    <a-select
                            style="width:100%;margin:0 20px 0 10px;"
                            placeholder="Select database"
                            @change="handleLeftDatabaseChange"
                    >
                        <a-select-option v-for="database in leftDatabaseList" :key="database.SCHEMA_NAME">
                            {{ database.SCHEMA_NAME }}
                        </a-select-option>
                    </a-select>
                </a-col>
                <a-col :span="3">
                    <a-button @click="refreshLeft">Refresh</a-button>
                </a-col>
            </a-row>
            <a-row>
                <compare-list :tableList="leftTableArray" :tableCompareResult="tableCompareResult"
                              :columnCompareResult="columnCompareResult"
                              :indexCompareResult="indexCompareResult" :hideSame="hideSame"></compare-list>
            </a-row>
        </a-col>
        <a-col :span="12">
            <a-row>
                <a-col :span="12" style="display: flex">
                    <label class="padding-right-10" style="line-height: 36px;">Node:</label>
                    <a-select
                            style="width:100%;margin:0 20px 0 10px;"
                            placeholder="Please select node"
                            @change="handleRightNodeChange"
                    >
                        <a-select-option v-for="node in nodes" :key="node._id">
                            {{ node.name }}
                        </a-select-option>
                    </a-select>
                </a-col>
                <a-col :span="8" style="display: flex">
                    <label class="padding-right-10" style="line-height: 36px;">Database:</label>
                    <a-select
                            style="width:100%;margin:0 20px 0 10px;"
                            placeholder="Select database"
                            @change="handleRightDatabaseChange"
                    >
                        <a-select-option v-for="database in rightDatabaseList" :key="database.SCHEMA_NAME">
                            {{ database.SCHEMA_NAME}}
                        </a-select-option>
                    </a-select>
                </a-col>
                <a-col :span="3">
                    <a-button @click="refreshRight">Refresh</a-button>
                </a-col>
            </a-row>
            <a-row>
                <compare-list :tableList="rightTableArray" :tableCompareResult="tableCompareResult"
                              :columnCompareResult="columnCompareResult"
                              :indexCompareResult="indexCompareResult" :hideSame="hideSame"></compare-list>
            </a-row>
        </a-col>
    </a-row>
</template>

<script lang="ts">
    import {appendMap} from '../utils/util'
    import CompareList from './CompareList.vue'
    import {useService} from '../hooks'
    import {defineComponent, reactive, toRefs, onMounted, ref, onUpdated} from 'vue'
    import axios from "axios";
    import {message} from 'ant-design-vue';

    export default defineComponent({
        components: {
            CompareList
        },
        setup() {
            const nodes = ref<any>([]);
            const hideSame = ref(false);

            const data = reactive({
                leftNode: {},
                rightNode: {},
                leftDatabaseName: '',
                rightDatabaseName: '',
                nodes : <any>[],
                leftDatabaseList: <any>[],
                rightDatabaseList: <any>[],

                leftDatabaseInfo: {},
                rightDatabaseInfo: {},

                leftTableArray: <any>[], // 相比leftDatabaseInfo 去掉了 key，由 map 转成数组，并加了没有的行，表名后加了两空格
                rightTableArray: <any>[], // 同上

                tableCompareResult: {}, // {"tableName":["TABLE_COMMENT","..."]}
                columnCompareResult: {}, // {"tableName":{"columnName":["TABLE_COMMENT","..."]}}
                indexCompareResult: {} // {"tableName":{"indexName":["TABLE_COMMENT","..."]}}
            })

            const {find} = useService('NedbService')
            const {getDatabases,getDatabaseInfo} = useService('MySQLService')

            function loadDB() {
                find(null,null).then(res => {
                    data.nodes = res

                    //重新更新选中的node,防止在其它地方更新的node的信息
                    if(data.leftNode) {
                        data.leftNode = findNodeById(data.leftNode._id)
                    }
                    if(data.rightNode) {
                        data.rightNode = findNodeById(data.rightNode._id)
                    }

                }).catch(err => {
                    console.log(err)
                })
            }

            function setHideSame(val:boolean){
                hideSame.value = val
            }

            onMounted(() => {
                loadDB()
            });

            function handleLeftNodeChange(value: string) {
                if (value) {
                    let node = findNodeById(value)
                    if (node) {
                        data.leftNode = node
                        if (node.connect_mode === "1") { // direct
                            getDatabases({
                                username:data.leftNode.username,
                                password:data.leftNode.password,
                                port:data.leftNode.port,
                                host:data.leftNode.host,
                            }).then((results) => {
                                data.leftDatabaseList = results
                            }).catch((err) => {
                                message.error(err.message)
                            })
                        } else {
                            axios.get(node.url + '/databases', {
                                headers: {Authorization: 'Bearer ' + node.token}
                            }).then(function (response) {
                                if (response.data.code === 200) {
                                    data.leftDatabaseList = response.data.data
                                } else {
                                    alert(response.data.msg)
                                }
                            }).catch((err) => {
                                message.error(err.message)
                            })
                        }
                    }
                } else {
                    data.leftDatabaseList = []
                }
            }

            function handleLeftDatabaseChange(value:string) {
                const hide = message.loading('Action in progress..', 0);
                if (data.leftNode) {
                    data.leftDatabaseName = value
                    if (data.leftNode.connect_mode === '1') { // direct connect
                        getDatabaseInfo({
                            username:data.leftNode.username,
                            password:data.leftNode.password,
                            port:data.leftNode.port,
                            host:data.leftNode.host,
                        }, data.leftDatabaseName).then((res) => {
                            data.leftDatabaseInfo = res
                            compare()
                            setTimeout(hide,0)
                        }).catch((err) => {
                            message.error(err.message)
                            setTimeout(hide,0)
                        })
                    } else {
                        axios.get(data.leftNode.url + '/database-info?database=' + data.leftDatabaseName, {
                            headers: {Authorization: 'Bearer ' + data.leftNode.token}
                        }).then(function (response) {
                            if (response.data.code === 200) {
                                data.leftDatabaseInfo = response.data.data
                                compare()
                            } else {
                                message.error(response.data.msg)
                            }
                            setTimeout(hide,0)
                        }).catch((err) => {
                            message.error(err.message)
                            setTimeout(hide,0)
                        })
                    }
                }else{
                    setTimeout(hide,0)
                }
            }

            function handleRightNodeChange(value:string) {
                if (value) {
                    let node = findNodeById(value)
                    if (node) {
                        data.rightNode = node
                        if (node.connect_mode === '1') { // direct
                            getDatabases({
                                username:data.leftNode.username,
                                password:data.leftNode.password,
                                port:data.leftNode.port,
                                host:data.leftNode.host,
                            }).then((results) => {
                                data.rightDatabaseList = results
                            }).catch((err) => {
                                message.error(err.message)
                            })
                        } else {
                            axios.get(data.rightNode.url + '/databases', {
                                headers: {Authorization: 'Bearer ' + node.token}
                            }).then(function (response) {
                                if (response.data.code === 200) {
                                    data.rightDatabaseList = response.data.data
                                } else {
                                    message.error(response.data.msg)
                                }
                            }).catch((err) => {
                                message.error(err.message)
                            })
                        }
                    }
                } else {
                    data.rightDatabaseList = []
                }
            }

            function handleRightDatabaseChange(value: string) {
                const hide = message.loading('Action in progress..', 0);

                if (data.rightNode) {
                    data.rightDatabaseName = value
                    if (data.rightNode.connect_mode === '1') { // direct connect
                        getDatabaseInfo({
                            username:data.leftNode.username,
                            password:data.leftNode.password,
                            port:data.leftNode.port,
                            host:data.leftNode.host,
                        }, data.rightDatabaseName).then((res) => {
                            data.rightDatabaseInfo = res
                            compare()
                            setTimeout(hide,0)
                        }).catch((err) => {
                            message.error(err.message)
                            setTimeout(hide,0)
                        })
                    } else {
                        axios.get(data.rightNode.url + '/database-info?database=' + data.rightDatabaseName, {
                            headers: {Authorization: 'Bearer ' + data.rightNode.token}
                        }).then(function (response) {
                            if (response.data.code === 200) {
                                data.rightDatabaseInfo = response.data.data
                                compare()
                            } else {
                                alert(response.data.msg)
                            }
                            setTimeout(hide,0)
                        }).catch((err) => {
                            message.error(err.message)
                            setTimeout(hide,0)
                        })
                    }
                }else{
                    setTimeout(hide,0)
                }
            }

            function refreshLeft() {
                if(!data.leftDatabaseName) {
                    message.warn("Please select database first")
                }
                handleLeftDatabaseChange(data.leftDatabaseName)
            }

            function refreshRight() {
                if(!data.rightDatabaseName){
                    message.warn("Please select database first")
                }
                handleRightDatabaseChange(data.rightDatabaseName)
            }

            // 比较两个数据库的差异
            function compare () {
                // 将两个对象转成数据，并排序，并补了空行
                let compareKeys = ['ENGINE', 'TABLE_COLLATION', 'TABLE_COMMENT']
                let [leftTableArray, rightTableArray, unEqualKeys] = appendMap(data.leftDatabaseInfo, data.rightDatabaseInfo, 'Meta', 'TABLE_NAME',null, compareKeys)

                let columnCompareResult = {}
                let indexCompareResult = {}
                // 接下来，对字符和索引做同样的操作
                for (let i = 0; i < leftTableArray.length; i++) {
                    let tempLeftTable = leftTableArray[i]
                    let tempRightTable = rightTableArray[i]

                    // 不是占位的表
                    if (!tempLeftTable['Meta']['IS_PLACEHOLDER'] && !tempRightTable['Meta']['IS_PLACEHOLDER']) {
                        let tempLeftColumns = tempLeftTable['Columns']
                        let tempRightColumns = tempRightTable['Columns']
                        compareKeys = ['COLUMN_TYPE', 'DATETIME_PRECISION', 'IS_NULLABLE', 'NUMERIC_PRECISION', 'COLUMN_COMMENT', 'COLUMN_DEFAULT', 'COLLATION_NAME', 'CHARACTER_SET_NAME', 'EXTRA', 'NUMERIC_SCALE']
                        let [leftColumnArray, rightColumnArray, columnUnEqualKeys] = appendMap(tempLeftColumns, tempRightColumns, '', 'ORDINAL_POSITION', 'COLUMN_NAME',compareKeys)
                        leftTableArray[i]['Columns'] = leftColumnArray
                        rightTableArray[i]['Columns'] = rightColumnArray
                        columnCompareResult[tempRightTable['Meta']['TABLE_NAME']] = columnUnEqualKeys

                        let tempLeftIndexes = tempLeftTable['Indexes']
                        let tempRightIndexes = tempRightTable['Indexes']
                        compareKeys = ['INDEX_TYPE', 'INDEX_COMMENT', 'NON_UNIQUE', 'NULLABLE', 'PACKED', 'COLUMN_NAME_ALL']
                        let [leftIndexArray, rightIndexArray, indexUnEqualKeys] = appendMap(tempLeftIndexes, tempRightIndexes, '', 'INDEX_NAME',null, compareKeys)
                        leftTableArray[i]['Indexes'] = leftIndexArray
                        rightTableArray[i]['Indexes'] = rightIndexArray
                        indexCompareResult[tempRightTable['Meta']['TABLE_NAME']] = indexUnEqualKeys
                    }
                }

                // 表 字段 索引 数组
                data.leftTableArray = leftTableArray
                data.rightTableArray = rightTableArray

                // 比较结果，保存了不同的字段列表
                data.tableCompareResult = unEqualKeys
                data.columnCompareResult = columnCompareResult
                data.indexCompareResult = indexCompareResult
            }

            function findNodeById (id:string) {
                for (let index in data.nodes) {
                    if (data.nodes[index]._id === id) {
                        return data.nodes[index]
                    }
                }
                return undefined
            }

            return {
                loadDB,
                setHideSame,
                hideSame,
                handleLeftNodeChange,
                handleLeftDatabaseChange,
                handleRightNodeChange,
                handleRightDatabaseChange,
                refreshLeft,
                refreshRight,
                ...toRefs(data)
            }
        }
    })
</script>

<style>
    #wrapper {
        padding: 10px;
        background-color: #f8f8f8;
    }
</style>
