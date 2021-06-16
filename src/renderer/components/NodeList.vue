<template>
    <div style="height: 100%">
        <div class="padding-top-10 padding-bottom-10">
            <a-button type="primary" @click="showAddModal"><span class="mif-plus padding-right-10"></span> Add Node
            </a-button>
        </div>
        <a-table :dataSource="nodes" :columns="columns" row-key="_id" :pagination="false">
            <template #params="{ text }">
                <div  style="font-weight: 700;">
                    <span v-if="text.connect_mode == '1'">
                        <span class="text-muted">Host:</span> {{text.host}}
                        <span class="text-muted">Port:</span> {{text.port}}
                        <span class="text-muted">Username:</span> {{text.username}}
                        <span class="text-muted">Password:</span> {{text.password}}
                    </span>
                    <span v-else>
                        <span class="text-muted">Url:</span>{{text.url}}
                        <span class="text-muted">Token:</span> {{text.token}}
                    </span>
                </div>
            </template>
            <template #mode="{text}">
                <a-tag color="blue" v-if="text === '1'">
                    <template #icon>
                        <aim-outlined />
                    </template>
                    Direct
                </a-tag>
                <a-tag color="orange" v-else>
                    <template #icon>
                        <ApiOutlined />
                    </template>
                    DB Compare Agent
                </a-tag>
            </template>
            <template #action="{text}">
                <a-space>
                    <a-button type="primary" @click="showEditModal(text)">Edit</a-button>
                    <a-button type="danger" @click="deleteNode(text)">Delete</a-button>
                </a-space>
            </template>
        </a-table>

        <a-modal width="50%" v-model:visible="visible" title="Add/Edit Node" @ok="doAddEditNode" @cancel="hideAddModal">
            <a-form :model="formState" :label-col="labelCol" :wrapper-col="wrapperCol">
                <a-form-item label="Node name">
                    <a-input v-model:value="formState.name"/>
                </a-form-item>
                <a-form-item label="Connect Mode">
                    <a-radio-group v-model:value="formState.connectMode">
                        <a-radio value="1">Direct</a-radio>
                        <a-radio value="2">DB-Compare Agent</a-radio>
                    </a-radio-group>
                </a-form-item>
                <a-form-item label="Host" v-if="formState.connectMode==1">
                    <a-input v-model:value="formState.host"/>
                </a-form-item>
                <a-form-item label="Port" v-if="formState.connectMode==1">
                    <a-input v-model:value="formState.port"/>
                </a-form-item>
                <a-form-item label="Username" v-if="formState.connectMode==1">
                    <a-input v-model:value="formState.username"/>
                </a-form-item>
                <a-form-item label="Password" v-if="formState.connectMode==1">
                    <a-input v-model:value="formState.password"/>
                </a-form-item>
                <a-form-item label="URL" v-if="formState.connectMode==2" extra="URL of DBCompare Node, source code for installation is here">
                    <a-input v-model:value="formState.url"/>
                </a-form-item>
                <a-form-item label="Token" v-if="formState.connectMode==2" extra="Auth token of DBCompare Node, which is set in conf/app.ini">
                    <a-input v-model:value="formState.token"/>
                </a-form-item>
            </a-form>

            <template #footer>
                <a-button key="back" @click="hideAddModal">Cancel</a-button>
                <a-button @click="test">Test Connection</a-button>
                <a-button key="submit" type="primary" @click="doAddEditNode">Submit</a-button>
            </template>
        </a-modal>
    </div>
</template>

<script lang="ts">
    import {defineComponent, onMounted, reactive, ref, UnwrapRef,toRefs} from "vue";
    import {useService} from "../hooks";
    import {message} from 'ant-design-vue';
    import axios from "axios";
    import {ApiOutlined, AimOutlined} from '@ant-design/icons-vue';
    import { Modal } from 'ant-design-vue';

    interface FormState {
        id: string,
        name: string;
        connectMode: string;
        host: string;
        port: Number;
        username: string;
        password: string;
        url: string;
        token: string;
    }

    export default defineComponent({
        components: {
            ApiOutlined,
            AimOutlined,
        },
        setup() {
            const formState: UnwrapRef<FormState> = reactive({
                id: "",
                name: '',
                connectMode: '1',
                host: '127.0.0.1',
                port: 3306,
                username: 'root',
                password: '',
                url: 'http://',
                token: '',
            });

            const {find, update, insert, remove} = useService('NedbService')
            const {testConnection} = useService('MySQLService')
            const columns =  [
                {title: 'Name', dataIndex: 'name'},
                {title: 'Connect Params', slots: {customRender: 'params'}},
                {title: 'Connect Mode', dataIndex: 'connect_mode', slots: {customRender: 'mode'}},
                {title: 'Action', slots: {customRender: 'action'}}
            ]
            const visible = ref<boolean>(false);
            const nodes = ref<any>([]);

            function loadDB() {
                find(null, null).then(res => {
                    nodes.value = res
                }).catch(err => {
                    message.error(err.message)
                })
            }

            function doAddEditNode() {
                if (!formState.name) {
                    message.info('Node name required');
                    return
                }
                if (formState.connectMode === "1") {
                    if (!formState.host) {
                        message.info('Host required')
                        return
                    }
                    if (!formState.port) {
                        message.info('Port required')
                        return
                    }
                    if (!formState.username) {
                        message.info('Username required')
                        return
                    }
                } else {
                    if (!formState.url) {
                        message.info('URL required')
                        return
                    }
                }

                let values = {
                    name:formState.name,
                    connect_mode:formState.connectMode,
                    username:formState.username,
                    password:formState.password,
                    host:formState.host,
                    port:formState.port,
                    url:formState.url,
                    token:formState.token,
                }

                if (formState.id) { // edit
                    update({_id: formState.id}, values, null).then(() => {
                        loadDB()
                        visible.value = false
                    }).catch(err => {
                        message.error(err.message)
                    })
                } else { // add
                    insert(values).then(() => {
                        message.info("Add ok")
                        loadDB()
                        visible.value = false
                    }).catch(err => {
                        message.error(err.message)
                    })
                }
            }

            function deleteNode(record: any) {
                Modal.confirm({
                    content: 'Are you sure to delete?',
                    okText : 'Yes',
                    onOk() {
                        remove({_id: record._id}, null).then(() => {
                            loadDB()
                        }).catch(err => {
                            message.error(err.message)
                        })
                    },
                    cancelText: 'No',
                    onCancel() {
                        Modal.destroyAll();
                    },
                });
            }

            // 显示添加弹窗
            function showAddModal() {
                visible.value = true
                formState.id = ''
            }

            function showEditModal(node: any) {
                visible.value = true
                formState.id = node._id
                formState.name = node.name
                formState.connectMode = node.connect_mode
                if (formState.connectMode === "1") {
                    formState.username = node.username
                    formState.password = node.password
                    formState.host = node.host
                    formState.port = node.port
                } else {
                    formState.url = node.url
                    formState.token = node.token
                }
            }

            function test() {
                // 直连
                if (formState.connectMode === "1") {
                    testConnection({
                        host: formState.host,
                        port: formState.port,
                        username: formState.username,
                        password: formState.password
                    }).then(() => {
                        message.success('Connect OK')
                    }).catch(err => {
                        message.error(err.message)
                    })
                } else {
                    axios.get(formState.url + '/ping', {
                        headers: {Authorization: 'Bearer ' + formState.token}
                    }).then(function (response) {
                        if (response.data.data === 'pong') {
                            message.success('Connect OK')
                        } else {
                            message.error(response.data.msg)
                        }
                    }).catch(err => {
                        message.error('ERROR, Please make sure that DB Compare Node is running and port is opened and token is equal to which in app.ini of DB Compare Node Server ", ' + err)
                    })
                }
            }

            function hideAddModal() {
                visible.value = false
            }

            onMounted(() => {
                loadDB()
            });

            return {
                showAddModal,
                deleteNode,
                showEditModal,
                hideAddModal,
                test,
                doAddEditNode,
                nodes,
                visible,
                columns,
                labelCol: {span: 6},
                wrapperCol: {span: 14},
                formState
            }
        }
    })
</script>

<style>
    .text-muted {
        color: #888888;
    }
</style>
