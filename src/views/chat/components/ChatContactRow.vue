<template>
    <div :class="{ 'contact-row': true, 'contact-row-selected': selected }">
        <div class="contact-row-left"> <el-avatar :size="40" :src="avatar" /></div>
        <div class="contact-row-center">
            <p class="contact-row-center-name">{{ name }}</p>
            <p class="contact-row-center-msg">{{ content }}</p>
        </div>
        <div class="contact-row-right">
            <p class="contact-row-right-time">{{ time }}</p>
            <p class="contact-row-right-other">更多</p>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    avatar: {
        type: String,
        default: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    },
    name: {
        type: String,
        default: '用户',
    },
    content: {
        type: String,
        default: ""
    },
    time: {
        type: String,
        default: "00:00"
    },
    selected: { type: Boolean, default: false }
})


</script>

<style lang="scss" scoped>
.contact-row {
    height: 50px;
    padding: 10px;
    display: flex;
    align-items: center;
    gap: 10px;

    &-left {
        display: flex;
    }

    &-center {
        &-name {
            height: 20px;
            line-height: 20px;
            margin: 0px;
            font-size: 16px;
            font-weight: 600;
        }

        &-msg {
            height: 20px;
            line-height: 20px;
            margin: 0px;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.5);
        }
    }

    &-right {
        margin-left: auto;

        &-time {
            height: 20px;
            line-height: 20px;
            margin: 0px;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.5);
        }

        &-other {
            height: 20px;
            line-height: 20px;
            margin: 0px;
            font-size: 12px;
            color: rgba(0, 0, 0, 0.5);
        }
    }
}

.contact-row:hover {
    cursor: pointer;
    background-color: rgba(0, 0, 0, 0.05);
}

.contact-row-selected {
    background-color: rgba(0, 0, 0, 0.09);
}
</style>