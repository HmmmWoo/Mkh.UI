<template>
  <el-dialog
    ref="elDialogRef"
    v-model="visible"
    :top="top_ || top"
    :custom-class="class_"
    :show-close="false"
    :width="width"
    :modal="modal"
    :close-on-click-modal="closeOnClickModal"
    :before-close="beforeClose"
    :destroy-on-close="destroyOnClose"
    :lock-scroll="lockScroll"
    :append-to-body="appendToBody"
    @open="handleOpen"
    @opened="handleOpened"
    @close="handleClose"
    @closed="handleClosed"
  >
    <!--头部-->
    <template v-if="header" #title>
      <m-head class="m-dialog_header" :icon="icon" :icon-color="iconColor" :size="size">
        <slot name="title">{{ title }}</slot>
        <template #toolbar>
          <!--工具栏插槽-->
          <slot name="toolbar" />
          <!--全屏按钮-->
          <m-button v-if="showFullscreen" :icon="isFullscreen ? 'full-screen-exit' : 'full-screen'" @click="toggleFullscreen" />
          <!--关闭按钮-->
          <m-button v-if="showClose" icon="close" @click="close" />
        </template>
      </m-head>
    </template>

    <!--内容-->
    <div v-loading="loading" class="m-dialog_content" :element-loading-text="loadingText" :element-loading-background="loadingBackground" :element-loading-spinner="loadingSpinner">
      <div class="m-dialog_body">
        <slot v-if="noScrollbar && height"></slot>
        <div v-else-if="noScrollbar && !height" class="m-dialog_wrapper">
          <slot />
        </div>
        <m-scrollbar v-else>
          <slot />
        </m-scrollbar>
      </div>
    </div>
    <!--尾部-->
    <footer v-if="$slots.footer" class="m-dialog_footer">
      <slot name="footer"></slot>
    </footer>
  </el-dialog>
</template>
<script>
import { computed, nextTick, ref } from 'vue'
import { useVisible, useFullscreen } from '../../composables'
import { addResizeListener, removeResizeListener } from 'element-plus/packages/utils/resize-event'
import dom from '../../utils/dom'
import props from './props'
export default {
  name: 'Dialog',
  props,
  emits: ['update:modelValue', 'open', 'opened', 'close', 'closed'],
  setup(props, { emit }) {
    //默认情况下，未手动设置高度时距离顶部的距离
    const top_ = ref('')

    //全屏操作
    const { isFullscreen, openFullscreen, closeFullscreen, toggleFullscreen } = useFullscreen(emit)

    //使用当前时间戳创建唯一ID
    const class_ = computed(() => {
      const { customClass, noPadding, noScrollbar, draggable } = props

      let classList = ['m-dialog', `m-dialog-${new Date().getTime()}`]
      if (props.size) classList.push(props.size)
      if (noPadding) classList.push('no-padding')
      if (noScrollbar) classList.push('no-scrollbar')
      if (draggable) classList.push('draggable')
      if (isFullscreen.value) classList.push('is-fullscreen')
      if (customClass) classList.push(props.customClass)

      return classList.join(' ')
    })

    const elDialogRef = ref(null)
    let dialogEl = null
    let headerEl = null
    let footerEl = null
    let scrollbarEl = null
    let wrapperEl = null
    let dragDownState = null
    let headerHeight = 0
    let footerHeight = 0

    //重置窗口大小
    const resize = () => {
      nextTick(() => {
        headerHeight = headerEl.offsetHeight
        footerHeight = footerEl != null ? footerEl.offsetHeight : 0
        if (props.height) {
          dialogEl.style.height = props.height
        } else {
          let viewHeight = props.noScrollbar ? wrapperEl.offsetHeight : scrollbarEl.offsetHeight
          let height = viewHeight + headerHeight + footerHeight
          //默认高度不能超出body
          if (height > document.body.clientHeight - 100) {
            height = document.body.clientHeight - 100
            top_.value = '50px'
          }

          dialogEl.style.height = height + 'px'
        }
      })
    }

    const handleOpen = () => {
      nextTick(() => {
        dialogEl = elDialogRef.value.dialogRef
        headerEl = dialogEl.querySelector('.el-dialog__header')
        footerEl = dialogEl.querySelector('.m-dialog_footer')
        scrollbarEl = dialogEl.querySelector('.el-scrollbar__view')
        wrapperEl = dialogEl.querySelector('.m-dialog_wrapper')

        const { draggable, height, top } = props

        //开启拖拽功能，先计算初始坐标再计算大小
        if (draggable) {
          //拖拽模式对话框的定位会设置为fixed模式，所以需要重新计算对话框的left属性

          dialogEl.style.left = (document.body.offsetWidth - dialogEl.offsetWidth) / 2 + 'px'
          dialogEl.style.top = top

          dom.on(headerEl, 'mousedown', handleDragDown)
        }

        //监听window窗口大小改变事件
        if (!height) {
          dom.on(window, 'resize', resize)
        }

        addResizeListener(props.noScrollbar ? wrapperEl : scrollbarEl, resize)
      })

      resize()

      emit('open')
    }

    const handleOpened = () => {
      emit('opened')
    }

    const handleClose = () => {
      emit('close')

      //关闭window窗口大小改变事件
      if (!props.height) dom.off(window, 'resize', resize)

      removeResizeListener(props.noScrollbar ? wrapperEl : scrollbarEl, resize)
    }

    const handleClosed = () => {
      emit('closed')
    }

    const handleDragDown = e => {
      //开启拖拽并且不是全屏模式的情况才可以拖拽
      if (props.draggable && !isFullscreen.value) {
        dragDownState = e

        dom.on(document, 'mousemove', handleDragMove)
        dom.on(document, 'mouseup', handleDragUp)
      }
    }

    const handleDragMove = e => {
      const { dragOutPage, dragMinWidth } = props
      let left = dialogEl.offsetLeft + (e.clientX - dragDownState.clientX)
      let top = dialogEl.offsetTop + (e.clientY - dragDownState.clientY)
      let leftMax = document.body.offsetWidth - dialogEl.offsetWidth
      let leftMin = 0
      let topMax = document.body.offsetHeight - dialogEl.offsetHeight
      let topMin = 0

      if (dragOutPage) {
        leftMax = document.body.offsetWidth - dragMinWidth
        leftMin = -dialogEl.offsetWidth + dragMinWidth
        topMax = document.body.offsetHeight - headerHeight
      }

      dialogEl.style.left = Math.max(leftMin, Math.min(left, leftMax)) + 'px'
      dialogEl.style.top = Math.max(topMin, Math.min(top, topMax)) + 'px'

      dragDownState = e
    }

    const handleDragUp = e => {
      dom.off(document, 'mousemove', handleDragMove)
      dom.off(document, 'mouseup', handleDragUp)
    }

    return {
      ...useVisible(props, emit),
      elDialogRef,
      top_,
      class_,
      isFullscreen,
      openFullscreen,
      closeFullscreen,
      toggleFullscreen,
      handleOpen,
      handleOpened,
      handleClose,
      handleClosed,
      resize,
    }
  },
}
</script>
