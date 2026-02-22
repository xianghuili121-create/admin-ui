<template>
    <div class="chat">
        <!-- 消息窗体 -->
        <div class="chat-content">
            <div class="chat-content-header">
                <div>左</div>
                <div class="chat-content-header-center">
                    <div class="chat-content-header-center-name">{{ chatStore.userSelected.username }}</div>
                    <div class="chat-content-header-center-status">在线</div>
                </div>
                <div>右</div>
            </div>
            <div ref="msgRef" class="chat-content-msg-box" scrollTop="scrollHeight">
                <ChatMessageBox v-for="(item, index) in chatStore.messageList" :key="index"
                    avatar="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" :content="item.content"
                    :time="item.time" :isSelf="item.isSelf"></ChatMessageBox>
            </div>
            <div class="chat-content-input-box">
                <div>更多</div>
                <el-input v-model="text" :rows="8" type="textarea" placeholder="请输入消息" resize="none" maxlength="800"
                    show-word-limit @keyup.enter="handleSendMessage" />

                <div style="text-align: right;"><el-button type="success" @click="handleSendMessage">发送</el-button>
                </div>
            </div>
        </div>
        <!-- 联系人列表 -->
        <div class="chat-contact-box">
            <div class="chat-contact-box-header">
                <el-select filterable remote reserve-keyword placeholder="请输入关键词" :remote-method="getUserOpts"
                    :loading="userSelectLoading" style="width: 240px">
                    <el-option @click="handleUserSelected(item)" v-for="item in userOpts" :key="item.userId"
                        :label="item.username" :value="item.userId" />
                </el-select>
            </div>
            <div class="chat-contact-box-rows">
                <ChatContactRow @click="handleUserSelected(item)" v-for="item in chatStore.userList" :key="item.userId"
                    :avatar="item.avatarUrl" :name="item.username" :content="item.contentNew" :time="item.time"
                    :selected="item.selected" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import ChatMessageBox from './components/ChatMessageBox.vue'
import ChatContactRow from './components/ChatContactRow.vue'
import { getToken } from '@/utils/myCookie';
import { useChatStore } from '@/stores/chat'
import { usePermissionStore } from '@/stores/permission'
import { getUserList } from '@/api/system/user'
import { getCurrentTime } from '@/utils/dateUtil'

const chatStore = useChatStore()
const permissionStore = usePermissionStore()

const userOpts = ref([])
const userSelectLoading = ref(false)
const msgRef = ref(null)

const text = ref('')
let ws = new WebSocket(`ws://ithui.cloud:3000/ws/chat?token=${getToken()}`);

// 选择用户
function handleUserSelected(item) {
    console.log(item)
    chatStore.upUserSelected(item, scrollToBottom)
}
// 发送消息
function handleSendMessage() {
    const message = {
        userId: permissionStore.userInfo.userId,
        targetId: chatStore.userSelected.userId,
        content: text.value,
        time: getCurrentTime(),
        isSelf: true
    }
    ws.send(JSON.stringify(message));
    chatStore.upSendMsgList(
        message, scrollToBottom
    )
    text.value = ''
}
// 滚动到底部
function scrollToBottom() {
    nextTick(() => {
        if (!msgRef.value) return
        msgRef.value.scrollTop = msgRef.value.scrollHeight
    });
}

// 获取用户选项列表
const getUserOpts = (query) => {
    if (query) {
        userSelectLoading.value = true

        userSelectLoading.value = false
        getUserList({ username: query }).then(res => {
            if (res.code === 200) {
                userOpts.value = res.rows
            }
        })
    } else {
        userOpts.value = []
    }
}
onMounted(() => {
    scrollToBottom()
    // 连接打开时触发
    ws.onopen = function () {
        console.log('连接已打开');
    };

    // 接收到服务器消息时触发
    ws.onmessage = function (event) {
        console.log('收到消息：', event.data);
        const message = JSON.parse(event.data);
        chatStore.upReceiveMsgList(
            message, scrollToBottom
        )

    };

    // 连接关闭时触发
    ws.onclose = function (event) {
        console.log('连接已关闭', event.reason);
    };

    // 连接出错时触发
    ws.onerror = function (error) {
        console.log('连接出错', error);
    };

})

</script>

<style lang="scss" scoped>
.chat {
    height: 100%;
    border-radius: 7px;
    // padding: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    display: flex;

    &-content {
        height: 100%;
        width: 100%;
        display: flex;
        flex-direction: column;

        &-header {
            padding: 10px;
            display: flex;
            align-items: center;

            &-center {
                height: 50px;
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;

                &-name {
                    font-size: 16px;
                    font-weight: bold;
                }

                &-status {
                    font-size: 12px;
                    color: green;
                }
            }
        }

        &-msg-box {
            height: 100%;
            padding: 10px;
            flex: 1;
            overflow-y: auto;
        }

        &-msg-box::-webkit-scrollbar {
            display: none;
            /* 隐藏滚动条 */
        }

        &-input-box {
            height: 260px;
            padding: 10px;
            border-top: 1px solid #f2f2f2;
            display: flex;
            flex-direction: column;
            gap: 10px
        }
    }

    &-contact-box {
        min-width: 300px;
        height: 100%;
        border-left: 1px solid #f2f2f2;
        overflow: hidden;
        display: flex;
        flex-direction: column;

        &-header {
            height: 50px;
            padding: 10px;
            border-bottom: 1px solid #f2f2f2;
        }

        &-rows {
            flex: 1;
            overflow-y: auto;
        }
    }


}
</style>
<style scoped>
:deep(.el-textarea__inner) {
    box-shadow: none;
}

:deep(.el-textarea__inner:focus) {
    box-shadow: none;
}

:deep(.el-textarea__inner:hover) {
    box-shadow: none;
}
</style>