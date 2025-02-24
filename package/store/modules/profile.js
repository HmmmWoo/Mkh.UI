//解析节点路由并保存
const resolveRouteMenu = (menus, routeMenus, buttons) => {
  menus.forEach(m => {
    //保存节点路由
    if (m.type === 1) {
      routeMenus.push(m)
      m.buttons.forEach(b => {
        buttons.push(`${m.id}_${b}`)
      })
    } else if (m.children) {
      resolveRouteMenu(m.children, routeMenus, buttons)
    }
  })
}

//账户信息
const state = {
  /** 账户编号 */
  accountId: '',
  /** 用户名 */
  username: '',
  /** 昵称 */
  nickname: '',
  /** 头像 */
  avatar: '',
  /** 菜单列表 */
  menus: [],
  /** 权限列表 */
  permissions: [],
  /** 皮肤 */
  skin: {
    /** 名称 */
    name: '简约',
    /**编码 */
    code: 'brief',
    /** 主题 */
    theme: '',
    /** 尺寸  */
    size: 'small',
  },
  /**账户详细信息，用于开发者自定义扩展 */
  details: null,
  /** 路由菜单列表 */
  routeMenus: null,
  /** 按钮编码列表，说明：此处的按钮编码由菜单编号_按钮唯一编码组成 */
  buttons: [],
}

const actions = {
  async init({ commit }) {
    try {
      //获取账户信息
      const profile = await mkh.config.actions.getProfile()

      //解析路由菜单
      const routeMenus = []
      const buttons = []
      resolveRouteMenu(profile.menus, routeMenus, buttons)

      if (profile.skin) {
        //初始化皮肤
        commit('app/skin/init', profile.skin, { root: true })
      }

      commit('init', { profile, routeMenus, buttons })
    } catch (error) {
      console.log(error)
    }
  },
}

const mutations = {
  init(state, { profile, routeMenus, buttons }) {
    Object.assign(state, profile)
    state.routeMenus = routeMenus
    state.buttons = buttons
  },
  clear(state) {
    state.accountId = ''
    state.username = ''
    state.nickname = ''
  },
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
}
