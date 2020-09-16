module.exports = {
  // 站点名称
  siteName: '诺赛科技',
  // token名称
  tokenName: 'SSO_TOKEN',
  // 特殊权限token
  specialName: 'DEV_OPS_TOKEN',
  // 是否开启视频点播
  videoOnDemand: true,
  // 过期时间
  expires: 7,
  // http请求超时时间
  httpTimeOut: 60000,
  // 权限白名单
  whitelist: [
    'loginLink',
    'forgetPasswordLink',
    'settingsLink',
    'settingsParameterLink'
  ],
  // 运维界面name (需加入权限白名单)
  om: ['settingsLink', 'settingsParameterLink'],
  // api code配置
  apiCode: {
    success: [0], // 请求成功正常code
    error: [], // 不参与全局抛错的异常code
    illegal: [1, 5, 7, 9, 10], // 非法登录code
    httpState: [200, 204, 302] //合法的http状态码
  },
  // 启用keep-alive的页面
  keepAlive: [],
  // 是否开启 动态配置菜单路由
  dynamicRouting: false,
  // http请求参数时，当对象属性为空时，是否删除
  httpNullParams: false
}
