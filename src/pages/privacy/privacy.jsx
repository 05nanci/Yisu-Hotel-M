import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './privacy.less'

export default function PrivacyPage () {
  // 处理返回按钮点击
  const handleBackPress = () => {
    Taro.navigateBack()
  }

  return (
    <View className='privacy-page'>
      {/* 返回按钮 */}
      <View className='back-button' onClick={handleBackPress}>
        <Text className='back-icon'>←</Text>
        <Text className='back-text'>返回</Text>
      </View>
      
      {/* 页面标题 */}
      <View className='page-header'>
        <Text className='page-title'>隐私政策</Text>
      </View>
      
      {/* 隐私政策内容 */}
      <ScrollView className='privacy-content'>
        <Text className='privacy-text'>易宿酒店预订平台隐私政策</Text>
        <Text className='privacy-subtitle'>我们致力于保护您的隐私和个人信息。本隐私政策解释了我们如何收集、使用、存储和保护您的个人信息。</Text>
        
        <Text className='privacy-section'>1. 信息收集</Text>
        <Text className='privacy-paragraph'>我们可能收集您的姓名、手机号码、邮箱地址、位置信息等个人信息，以便为您提供更好的服务。</Text>
        
        <Text className='privacy-section'>2. 信息使用</Text>
        <Text className='privacy-paragraph'>我们使用您的个人信息来处理预订、提供客户服务、发送促销信息等。</Text>
        
        <Text className='privacy-section'>3. 信息保护</Text>
        <Text className='privacy-paragraph'>我们采取各种安全措施来保护您的个人信息，防止未经授权的访问、使用或披露。</Text>
        
        <Text className='privacy-section'>4. 信息共享</Text>
        <Text className='privacy-paragraph'>我们不会向第三方共享您的个人信息，除非法律要求或为了提供服务所必需。</Text>
        
        <Text className='privacy-section'>5. 您的权利</Text>
        <Text className='privacy-paragraph'>您有权访问、修改或删除您的个人信息，也可以选择不接收我们的促销信息。</Text>
        
        <Text className='privacy-section'>6. 政策更新</Text>
        <Text className='privacy-paragraph'>我们可能会不时更新本隐私政策，更新后的政策将在我们的平台上公布。</Text>
      </ScrollView>
    </View>
  )
}