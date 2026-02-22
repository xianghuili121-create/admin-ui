<template>
    <el-sub-menu v-if="menu.visible == 1" :index="menu.route">
        <template #title>
            <el-icon v-if="menu.icon">
                <component :is="menu.icon" />
            </el-icon>
            <span v-show="!isCollapse"> {{ menu.menuName }}</span>
        </template>
        <div v-for="item in menu.children" :key="item.id">
            <MySubMenu v-if="item.menuType == 0" :menu="item" />
            <el-menu-item v-if="item.menuType == 1 && item.visible == 1" :index="item.route">
                <el-icon v-if="menu.icon">
                    <component :is="item.icon" />
                </el-icon>
                <template #title>
                    <span> {{ item.menuName }}</span></template>
            </el-menu-item>
        </div>
    </el-sub-menu>
    <div v-else v-for="item in menu.children" :key="item.id">
        <MySubMenu v-if="item.menuType == 0" :menu="item" />
        <el-menu-item v-if="item.menuType == 1 && item.visible == 1" :index="item.route">
            <el-icon v-if="item.icon">
                <component :is="item.icon" />
            </el-icon>
            <template #title>
                <span> {{ item.menuName }}</span></template>
        </el-menu-item>
    </div>
</template>
<script setup>
import { onMounted } from 'vue'

defineOptions({
    name: 'MySubMenu'
});

const props = defineProps({
    menu: Object || [],
    isCollapse: Boolean || false
})
</script>
<style lang="scss"></style>