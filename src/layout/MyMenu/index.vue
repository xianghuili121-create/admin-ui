<template>
    <el-menu unique-opened class="my-menu" :collapse="systemStore.menuIsCollapse" :default-active="activeIndex"
        :default-openeds="[activeIndex]" router>
        <el-menu-item index="">
            <img style="width: 200px" src="https://element-plus.org/images/element-plus-logo.svg" alt="Element logo" />
        </el-menu-item>
        <div v-for="(menu, index) in modelValue" :key="menu.id">
            <MySubMenu v-if="menu.menuType == 0" :menu="menu" :isCollapse="systemStore.menuIsCollapse" />
            <el-menu-item v-if="menu.menuType == 1 && menu.visible == 1" :index="menu.route">
                <el-icon>
                    <component :is="menu.icon" />
                </el-icon>
                <template #title>
                    <span> {{ menu.menuName }}</span>
                </template>
            </el-menu-item>
        </div>
    </el-menu>
</template>
<script setup>
import MySubMenu from './MySubMenu/index.vue'
import { useRoute } from "vue-router"
import { ref, onMounted } from "vue"
import { useSystemStore } from '@/stores/system.js'
const route = useRoute()
const activeIndex = ref("")
const systemStore = useSystemStore()

defineProps({
    modelValue: Object || []
})
onMounted(() => {
    activeIndex.value = route.fullPath
})
</script>
<style lang="scss" scoped>
.my-menu{
    user-select: none;
}
.el-menu--collapse {
    width: calc(var(--el-menu-icon-width) + var(--el-menu-base-level-padding) * 2 + 20px);
}
</style>