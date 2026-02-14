import React from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Button } from '@tarojs/components';
import './register-success.less';

export default function RegisterSuccess() {
  // 进入首页
  const handleGoToHome = () => {
    // 保存登录状态到本地存储
    Taro.setStorageSync('isLoggedIn', true);
    Taro.setStorageSync('userInfo', {
      name: '用户',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20portrait%20placeholder&image_size=square'
    });
    Taro.switchTab({
      url: '/pages/index/index'
    });
  };

  // 进入个人中心
  const handleGoToProfile = () => {
    // 保存登录状态到本地存储
    Taro.setStorageSync('isLoggedIn', true);
    Taro.setStorageSync('userInfo', {
      name: '用户',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20portrait%20placeholder&image_size=square'
    });
    Taro.switchTab({
      url: '/pages/my/my'
    });
  };

  // 完善个人信息
  const handleCompleteProfile = () => {
    // 保存登录状态到本地存储
    Taro.setStorageSync('isLoggedIn', true);
    Taro.setStorageSync('userInfo', {
      name: '用户',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20portrait%20placeholder&image_size=square'
    });
    // 跳转到个人资料编辑页
    Taro.navigateTo({
      url: '/pages/profile-edit/profile-edit'
    });
  };

  // 查看我的收藏
  const handleViewFavorites = () => {
    // 保存登录状态到本地存储
    Taro.setStorageSync('isLoggedIn', true);
    Taro.setStorageSync('userInfo', {
      name: '用户',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20portrait%20placeholder&image_size=square'
    });
    // 跳转到收藏列表页
    Taro.navigateTo({
      url: '/pages/favorites/favorites'
    });
  };

  // 开始预订酒店
  const handleStartBooking = () => {
    // 保存登录状态到本地存储
    Taro.setStorageSync('isLoggedIn', true);
    Taro.setStorageSync('userInfo', {
      name: '用户',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20portrait%20placeholder&image_size=square'
    });
    Taro.switchTab({
      url: '/pages/index/index'
    });
  };

  return (
    <View className="register-success-page">
      {/* 成功提示区 */}
      <View className="success-section">
        <View className="success-icon">
          <Text className="icon-text">✓</Text>
        </View>
        <Text className="success-title">注册成功！</Text>
        <Text className="success-subtitle">欢迎加入伊素酒店</Text>
      </View>

      {/* 优惠提示 */}
      <View className="discount-section">
        <Text className="discount-text">首次预订可享新人立减 10 元</Text>
      </View>

      {/* 功能引导区 */}
      <View className="guide-section">
        <View className="guide-title">推荐功能</View>
        <View className="guide-options">
          <View 
            className="guide-option"
            onClick={handleCompleteProfile}
          >
            <View className="guide-icon profile">
              <Text className="icon-text">个人</Text>
            </View>
            <Text className="guide-text">完善个人信息</Text>
          </View>
          <View 
            className="guide-option"
            onClick={handleViewFavorites}
          >
            <View className="guide-icon favorites">
              <Text className="icon-text">收藏</Text>
            </View>
            <Text className="guide-text">查看我的收藏</Text>
          </View>
          <View 
            className="guide-option"
            onClick={handleStartBooking}
          >
            <View className="guide-icon booking">
              <Text className="icon-text">预订</Text>
            </View>
            <Text className="guide-text">开始预订酒店</Text>
          </View>
        </View>
      </View>

      {/* 跳转按钮 */}
      <View className="action-buttons">
        <Button 
          className="action-btn home-btn"
          onClick={handleGoToHome}
        >
          进入首页
        </Button>
        <Button 
          className="action-btn profile-btn"
          onClick={handleGoToProfile}
        >
          进入个人中心
        </Button>
      </View>
    </View>
  );
}
