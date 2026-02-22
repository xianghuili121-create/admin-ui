import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { getUserList } from '@/api/system/user';

export const useChatStore = defineStore(
  'chat',
  () => {
    const userSelected = ref({});
    const messageList = computed(() => {
      if (!userSelected.value.userId) return [];
      return userList.value.find((item) => item.userId === userSelected.value.userId)?.messageList || [];
    });
    const userList = ref([]);

    //   更新当前选择的用户
    function upUserSelected(userItem, fn) {
      userSelected.value = userItem;
      userList.value.forEach((item) => (item.selected = false));
      const target = userList.value.find((item) => item.userId === userItem.userId);
      if (!target) {
        userList.value.push({ ...userItem, messageList: [], contentNew: '', selected: true, time: '' });
      } else {
        target.selected = true;
      }
      if (fn) fn();
    }

    // 更新发送消息列表
    function upSendMsgList(message, fn) {
      userList.value.forEach((item) => {
        if (item.userId === message.targetId) {
          item.messageList.push(message);
          item.contentNew = message.content;
          item.time = message.time;
          if (fn) fn();
        }
      });
    }

    // 更新接收消息列表
    async function upReceiveMsgList(message, fn) {
      const target = userList.value.find((item) => item.userId === message.userId);
      if (!target) {
        await getUserList({ userId: message.userId }).then((res) => {
          if (res.code === 200) {
            userList.value.push({ ...res.rows[0], messageList: [], contentNew: message.content, selected: false, time: message.time });
          }
        });
      }
      userList.value.forEach((item) => {
        if (item.userId === message.targetId) return;
        if (item.userId === message.userId) {
          item.messageList.push(message);
          item.contentNew = message.content;
          item.time = message.time;
          if (fn) fn();
        }
      });
    }

    return { userList, messageList, userSelected, upSendMsgList, upReceiveMsgList, upUserSelected };
  },
  {
    // 关键：开启持久化配置
    persist: true, // 默认持久化到 localStorage，key 为 Store 名（chat）
  }
);
