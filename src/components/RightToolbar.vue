<template>
    <div style="margin: 0 10px 0 auto;">
        <el-button @click="handleShowSearch" icon="Search" circle />
        <el-button @click="handleRefresh" icon="Refresh" circle />
    </div>
</template>
<script setup>
const emit = defineEmits(['refresh', "showSearch"])

const handleShowSearch = () => {
    // 触发 showSearch 事件，可按需传递参数（比如传搜索关键词，可选）
    emit('showSearch')
}

const handleRefresh = () => {
    // 触发 refresh 事件，示例：传递当前时间戳作为参数（可选）
    emit('refresh', new Date().getTime())
}
</script>