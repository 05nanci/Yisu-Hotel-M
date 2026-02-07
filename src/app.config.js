export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/order/order',
    'pages/my/my',
    'pages/hotel-list/hotel-list',
    'pages/city-select/city-select',
    'pages/test-page/test-page'
  ],

  'pages/hotel-detail/index',// 酒店详情页（注意路径和你的详情页一致）
  'pages/index/index'        // 首页（可选）
     // 酒店列表页
      
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
})
