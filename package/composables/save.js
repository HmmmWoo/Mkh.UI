import { reactive, toRef } from 'vue'

//mode: add、添加 edit、编辑 view、预览
export default function ({ props, title, api, model, rules, emit, afterEdit }) {
  const { add, edit, update } = api
  const id = toRef(props, 'id')
  const mode = toRef(props, 'mode')

  const model_ = reactive({})
  //绑定属性
  const bind = reactive({
    title: '',
    icon: '',
    model,
    rules,
    action: null,
    disabled: false,
    footer: true,
    destroyOnClose: true,
  })

  const handleOpen = () => {
    switch (mode.value) {
      case 'add':
        bind.title = '添加' + title
        bind.icon = 'plus'
        bind.action = add
        bind.disabled = false
        bind.footer = true
        break
      case 'edit':
        bind.title = '编辑' + title
        bind.icon = 'edit'
        bind.action = update
        bind.disabled = false
        bind.footer = true

        edit(id.value).then(data => {
          Object.assign(model_, data)
          Object.assign(model, model_)

          afterEdit && afterEdit()
        })
        break
      default:
        bind.title = '预览' + title
        bind.icon = 'preview'
        bind.disabled = true
        bind.footer = false
        break
    }
  }

  const handleReset = () => {
    //如果编辑模式，重置会将表单数据重置为修改前，而不是清空
    if (mode.value === 'edit') {
      Object.assign(model, model_)
    }

    emit('reset')
  }

  return {
    bind,
    on: { open: handleOpen, reset: handleReset },
  }
}

//通用属性
export const withSaveProps = {
  //主键
  id: {
    type: [String, Number],
    default: 0,
  },
  //预览
  mode: {
    type: String,
    default: 'add',
  },
}
