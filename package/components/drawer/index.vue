<template>
  <el-drawer
    v-model="visible"
    :direction="direction_"
    :custom-class="class_"
    :show-close="false"
    :modal="modal"
    :size="direction === 'left' || direction === 'right' ? width : height"
    :close-on-click-modal="closeOnClickModal"
    :before-close="beforeClose"
    :destroy-on-close="destroyOnClose"
    :append-to-body="appendToBody"
    @open="handleOpen"
    @opened="handleOpened"
    @close="handleClose"
    @closed="handleClosed"
  >
    <!--头部-->
    <template v-if="header" #title>
      <m-head class="m-drawer_header" :icon="icon" :icon-color="iconColor" :size="size_">
        <slot name="title">{{ title }}</slot>
        <template #toolbar>
          <!--工具栏插槽-->
          <slot name="toolbar" />
          <!--关闭按钮-->
          <m-button v-if="showClose" icon="close" @click="close" />
        </template>
      </m-head>
    </template>

    <!--内容区域-->
    <div
      v-loading="loading"
      class="m-drawer_content"
      :element-loading-text="loadingText || $t('mkh.dialog.loadingText')"
      :element-loading-background="loadingBackground || loadingOptions.background"
      :element-loading-spinner="loadingSpinner || loadingOptions.spinner"
    >
      <!--内容-->
      <section class="m-drawer_body">
        <slot v-if="noScrollbar" />
        <m-scrollbar v-else>
          <slot />
        </m-scrollbar>
      </section>
    </div>
    <!--尾部-->
    <footer v-if="$slots.footer" class="m-drawer_footer">
      <slot name="footer"></slot>
    </footer>
  </el-drawer>
</template>
<script>
import { computed } from 'vue'
import { useVisible, useFullscreen } from '../../composables'
import { useStore } from 'vuex'
import props from './props'
export default {
  name: 'Drawer',
  props,
  emits: ['update:modelValue', 'open', 'opened', 'close', 'closed'],
  setup(props, { emit }) {
    const store = useStore()
    const size_ = computed(() => props.size || store.state.app.profile.skin.size)
    const direction_ = computed(() => {
      switch (props.direction) {
        case 'left':
          return 'ltr'
        case 'top':
          return 'ttb'
        case 'bottom':
          return 'btt'
        default:
          return 'rtl'
      }
    })

    //加载动画配置
    const loadingOptions = mkh.config.component.loading

    //全屏操作
    const { isFullscreen, openFullscreen, closeFullscreen, toggleFullscreen } = useFullscreen(emit)

    //使用当前时间戳创建唯一ID
    const class_ = computed(() => {
      const { customClass, noPadding, draggable } = props
      let classList = ['m-drawer', `m-drawer-${new Date().getTime()}`]
      if (size_.value) classList.push(size_.value)
      if (noPadding) classList.push('no-padding')
      if (draggable) classList.push('draggable')
      if (isFullscreen.value) classList.push('is-fullscreen')
      if (customClass) classList.push(props.customClass)

      return classList.join(' ')
    })

    const handleOpen = () => {
      emit('open')
    }

    const handleOpened = () => {
      emit('opened')
    }

    const handleClose = () => {
      emit('close')
    }

    const handleClosed = () => {
      emit('closed')
    }

    return {
      ...useVisible(props, emit),
      size_,
      direction_,
      class_,
      loadingOptions,
      isFullscreen,
      openFullscreen,
      closeFullscreen,
      toggleFullscreen,
      handleOpen,
      handleOpened,
      handleClose,
      handleClosed,
    }
  },
}
</script>
