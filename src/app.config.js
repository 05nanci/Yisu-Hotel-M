export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/hotel-list/hotel-list',
    'pages/city-select/city-select',
    'pages/test-page/test-page',
    'pages/mine/mine'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '酒店查询',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#666',
    selectedColor: '#1890ff',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '主页'
      },
      {
        pagePath: 'pages/mine/mine',
        text: '我的'
      }
    ]
  }
})
