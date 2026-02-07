export default defineAppConfig({
  pages: [

  'pages/hotel-detail/index',// 酒店详情页（注意路径和你的详情页一致）
  'pages/index/index'        // 首页（可选）
     // 酒店列表页
      
],

  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '酒店查询',
    navigationBarTextStyle: 'black'
  }
})
