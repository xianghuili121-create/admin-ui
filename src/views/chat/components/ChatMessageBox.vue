<template>
    <div :class="{ 'chat-message-me': isSelf, 'chat-message-other': true }">
        <div class="message-box">
            <div class="message-box-left">
                <el-avatar :size="40" :src="avatar" />
            </div>
            <div class="message-box-right">
                <div class="message-box-right-content">
                    <div class="horn">
                    </div>
                    <div class="message-box-right-content-text">
                        {{ content }}
                    </div>
                </div>
                <div class="message-box-right-others">更多</div>
            </div>

        </div>
        <div class="message-time">{{ time }}</div>
    </div>
</template>

<script setup>
defineProps({
    content: {
        type: String,
        default: '',
    },
    avatar: {
        type: String,
        default: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
    },
    time: String,
    isSelf: {
        type: Boolean,
        default: true,
    },
})
</script>

<style lang="scss" scoped>
.chat-message-other {
    .message-box {
        height: auto;
        border-radius: 5px;
        padding: 10px;
        display: flex;
        align-items: flex-end;
        gap: 10px;

        &-left {
            width: 50px;
            height: 50px;
            display: flex;
            align-items: flex-end;
            justify-content: center;
        }

        &-right {
            max-width: 60%;
            display: flex;
            gap: 10px;

            &-content {
                display: flex;
                align-items: flex-end;

                &-text {
                    min-height: 24px;
                    min-width: 16px;
                    color: #fff;
                    background-color: #3c77fe;
                    padding: 10px;
                    border-radius: 5px 5px 5px 0px;

                }
            }

        }
    }
}

.chat-message-me {
    .message-box {
        flex-direction: row-reverse;

        &-right {
            flex-direction: row-reverse;

            &-content {
                flex-direction: row-reverse;

                &-text {
                    color: #000;
                    background-color: #eee;
                    border-radius: 5px 5px 0px 5px;
                }
            }

            .horn {
                border-left: 0px;
                border-right: 20px solid #00000000;
                border-bottom: 10px solid #eee;
            }
        }
    }

    .message-time {
        text-align: right;
        padding-right: 70px;
        padding-left: 0px;
    }
}

.message-time {
    padding-left: 70px;
    font-size: 12px;
    color: #999;
}

.horn {
    border-left: 20px solid #00000000;
    border-bottom: 10px solid #3c77fe;
}
</style>