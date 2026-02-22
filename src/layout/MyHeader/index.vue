<template>
    <div class="my-header">
        <!-- 左 -->
        <div class="my-header-left">
            <el-icon :size="25">
                <MenuSwitch v-model="systemStore.menuIsCollapse" @click="systemStore.switchMenuCollapse" />
            </el-icon>
        </div>
        <!-- 中 -->
        <div class="my-header-centre">
            <div>
                {{ systemStore.buttonsIsShow }}
            </div>
        </div>
        <!-- 右 -->
        <div class="my-header-right">
            <el-text class="my-header-right-username" size="large" truncated>{{ permissionStore.userInfo.username
            }}</el-text>
            <el-avatar @click="profileVisible = true" style="cursor: pointer;"
                :src="permissionStore.userInfo.avatarUrl" />
            <ProfileDrawer v-model="profileVisible" />
        </div>
    </div>
</template>
<script setup>
import MenuSwitch from '@/components/icon/MenuSwitch.vue'
import { useSystemStore } from '@/stores/system.js'
import { usePermissionStore } from "@/stores/permission"
import ProfileDrawer from './ProfileDrawer.vue'

import { logout } from '@/api/auth.js'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { removeToken } from '@/utils/myCookie'

const router = useRouter()
const systemStore = useSystemStore()
const permissionStore = usePermissionStore()
const profileVisible = ref(false)
// 退出登录
function userLogout() {
    ElMessageBox.confirm(
        '您确定要退出登录并跳转登录页面吗?',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(() => {
            logout().then(res => {
                removeToken()
                permissionStore.reset()
                ElMessage({
                    type: 'success',
                    message: '退出成功!',
                })
                router.push("/login")
            })
        })
}
</script>
<style lang="scss" scoped>
.my-header {
    height: 60px;
    padding: 0px 50px 0px 20px;
    // background-color: aliceblue;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    &-left {
        display: flex;
    }

    &-centre {
        margin-left: auto;
    }

    &-right {
        display: flex;
        align-items: center;
        gap: 10px;

        &-username {
            width: 150px;
            text-align: right;
        }
    }
}
</style>
