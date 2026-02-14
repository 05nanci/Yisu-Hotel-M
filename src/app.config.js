// src/app.config.js
export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/order/order',
    'pages/my/my',
    'pages/favorites/favorites', // 收藏页面
    'pages/coupons/coupons', // 优惠券页面
    'pages/settings/settings', // 设置页面
    'pages/history/history', // 历史页面
    'pages/hotel-list/hotel-list',
    'pages/city-select/city-select',
    'pages/test-page/test-page',
    'pages/hotel-detail/index', // 酒店详情页
    'pages/booking-confirm/index', // 酒店预订确认页
    'pages/payment/index', // 支付页
    'pages/login/login', // 登录页
    'pages/register/register', // 注册页
    'pages/register-success/register-success' // 注册成功页
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '酒店查询',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999',
    selectedColor: '#1890ff',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页'
      },
      {
        pagePath: 'pages/order/order',
        text: '订单'
      },
      {
        pagePath: 'pages/my/my',
        text: '我的'
      }
    ]
  }
});