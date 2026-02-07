import { View, Text } from '@tarojs/components'
import './test-page.less'

export default function TestPage () {
  return (
    <View className='test-page'>
      <Text className='test-title'>测试页面</Text>
      <Text className='test-content'>这是一个测试页面，用于测试路由跳转功能</Text>
    </View>
  )
}
