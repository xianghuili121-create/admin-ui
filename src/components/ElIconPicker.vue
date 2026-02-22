<script setup lang="ts">
import { ClickOutside as vClickOutside } from 'element-plus'
import type { PopoverInstance } from 'element-plus'
import { ref, ComponentInternalInstance, defineEmits, defineProps, getCurrentInstance } from 'vue'

const { appContext: { app: { config: { globalProperties } } } } = getCurrentInstance() as ComponentInternalInstance

interface Props {
    modelValue: string | null
}
const props = defineProps<Props>()

const emits = defineEmits(['update:modelValue'])

const buttonRef = ref()
const popoverRef = ref<PopoverInstance>()
const onClickOutside = () => {
    popoverRef.value?.hide()
}
</script>

<template>
    <div style="width:100%">
        <el-button-group style="width:100%;display: flex;">
            <el-button v-if="!modelValue" ref="buttonRef" v-click-outside="onClickOutside"
                style="flex: 1;">请选择图标</el-button>
            <el-button v-if="modelValue" :icon="modelValue" ref="buttonRef" v-click-outside="onClickOutside"
                style="flex: 1;"></el-button>
            <el-button type="danger" plain @click="emits('update:modelValue', '')">
                <span>清空</span>
                <el-icon class="el-icon--right">
                    <Delete />
                </el-icon>
            </el-button>
        </el-button-group>
        <el-popover ref="popoverRef" :virtual-ref="buttonRef" trigger="click" :width="256" virtual-triggering>
            <div class="el-icon-picker">
                <component v-for="icon in globalProperties.$icons" :key="icon"
                    :class="[icon, 'icon', { 'icon-active': icon == modelValue }]" :is="icon"
                    @click="emits('update:modelValue', icon)">
                </component>
            </div>
        </el-popover>
    </div>
</template>

<style scoped>
.el-icon-picker {
    height: 256px;
    overflow-y: scroll;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
}

.icon {
    display: inline-block;
    width: 24px;
    height: 24px;
    color: var(--el-text-color-regular);
    font-size: 20px;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
    line-height: 45px;
    margin: 5px;
}

.icon:hover {
    color: var(--el-color-primary);
}

.icon-active {
    color: var(--el-color-primary);
}
</style>
