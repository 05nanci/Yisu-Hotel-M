import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './terms.less'

export default function TermsPage () {
  // 处理返回按钮点击
  const handleBackPress = () => {
    Taro.navigateBack()
  }

  return (
    <View className='terms-page'>
      {/* 返回按钮 */}
      <View className='back-button' onClick={handleBackPress}>
        <Text className='back-icon'>←</Text>
        <Text className='back-text'>返回</Text>
      </View>
      
      {/* 页面标题 */}
      <View className='page-header'>
        <Text className='page-title'>用户协议</Text>
      </View>
      
      {/* 用户协议内容 */}
      <ScrollView className='terms-content'>
        <Text className='terms-text'>易宿酒店预订平台用户协议</Text>
        <Text className='terms-subtitle'>欢迎使用易宿酒店预订平台！本用户协议（以下简称"协议"）是您与易宿酒店预订平台之间的法律协议，规定了您使用我们平台的权利和义务。</Text>
        
        <Text className='terms-section'>1. 账户注册</Text>
        <Text className='terms-paragraph'>您需要注册一个账户才能使用我们的平台。您必须提供真实、准确、完整的个人信息，并在信息变更时及时更新。</Text>
        
        <Text className='terms-section'>2. 预订服务</Text>
        <Text className='terms-paragraph'>您可以通过我们的平台预订酒店。预订成功后，您将收到确认信息。您需要按照预订信息准时入住，并遵守酒店的相关规定。</Text>
        
        <Text className='terms-section'>3. 支付条款</Text>
        <Text className='terms-paragraph'>您需要按照我们平台的价格支付预订费用。我们支持多种支付方式，包括信用卡、支付宝、微信支付等。</Text>
        
        <Text className='terms-section'>4. 取消政策</Text>
        <Text className='terms-paragraph'>如果您需要取消预订，请按照我们平台的取消政策操作。不同的酒店可能有不同的取消政策，具体以预订时的说明为准。</Text>
        
        <Text className='terms-section'>5. 用户行为</Text>
        <Text className='terms-paragraph'>您在使用我们平台时，必须遵守法律法规和社会公德，不得从事任何违法或损害他人权益的行为。</Text>
        
        <Text className='terms-section'>6. 知识产权</Text>
        <Text className='terms-paragraph'>我们平台的所有内容，包括但不限于文字、图片、视频、商标等，均受知识产权法律法规的保护。</Text>
        
        <Text className='terms-section'>7. 免责声明</Text>
        <Text className='terms-paragraph'>我们不对因网络故障、系统故障等原因导致的服务中断或数据丢失承担责任。</Text>
        
        <Text className='terms-section'>8. 协议修改</Text>
        <Text className='terms-paragraph'>我们可能会不时修改本协议，修改后的协议将在我们的平台上公布。</Text>
        
        <Text className='terms-section'>9. 法律适用</Text>
        <Text className='terms-paragraph'>本协议的订立、执行、解释及争议的解决均适用中华人民共和国法律。</Text>
      </ScrollView>
    </View>
  )
}