<template>
  <m-button class="m-button-delete" :icon="icon" :text="text || $t('mkh.delete.text')" :code="code" @click.stop="handleClick"> </m-button>
</template>
<script>
import { getCurrentInstance } from 'vue'
import { useLoading, useMessage } from '../../composables'
export default {
  name: 'ButtonDelete',
  props: {
    /** 图标 */
    icon: {
      type: String,
      default: 'delete',
    },
    /** 文本 */
    text: {
      type: String,
      default: '',
    },
    /** 请求参数 */
    data: {
      type: [String, Number, Object],
      default: '',
    },
    /** 二次确认的消息 */
    msg: {
      type: String,
      default: '',
    },
    /** 删除方法，需返回Promise */
    action: {
      type: Function,
      required: true,
    },
  },
  emits: ['success', 'error'],
  setup(props, { emit }) {
    const cit = getCurrentInstance().proxy
    const message = useMessage()

    const loading = useLoading()

    const handleClick = () => {
      const { $t } = cit
      message
        .confirm(props.msg || $t('mkh.delete.msg'), $t('mkh.delete.title'), {
          confirmButtonText: $t('mkh.delete.ok'),
          cancelButtonText: $t('mkh.delete.cancel'),
        })
        .then(() => {
          loading.open($t('mkh.delete.loading'))
          props
            .action(props.data)
            .then(() => {
              message.success($t('mkh.delete.success'))
              emit('success')
            })
            .catch(() => {
              emit('error')
            })
            .finally(() => {
              loading.close()
            })
        })
        .catch(() => {})
    }

    return {
      handleClick,
    }
  },
}
</script>
