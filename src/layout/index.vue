<template>
    <div class="layout">
        <el-container>
            <el-aside width="auto">
                <MyMenu style="height: 100vh;" v-model="permissionStore.userMenu" />
            </el-aside>
            <el-container>
                <el-header>
                    <MyHeader />
                </el-header>
                <el-main class="main-content">
                    <RouterView></RouterView>
                </el-main>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import MyMenu from "./MyMenu/index.vue"
import MyHeader from "./MyHeader/index.vue"
import { ref } from 'vue'
import { getUserMenu } from "@/api/system/user"
import { usePermissionStore } from "@/stores/permission"
const permissionStore = usePermissionStore()
</script>
<style lang="scss" scoped>
.layout {
    // height: 100vh;
}

.el-header {
    padding: 0;
}

.main-content {
    max-height: calc(100vh - 60px);
    padding: 20px;
}
</style>