import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, Button, Checkbox } from '@tarojs/components';
import { authApi } from '../../services/api';
import './login.less';

export default function Login() {
  // 状态管理
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 表单校验
  const validateForm = () => {
    const newErrors = {};
    
    if (!phone) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(phone)) {
      newErrors.phone = '请输入正确的手机号';
    }
    
    if (!password) {
      newErrors.password = '请输入密码';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 登录
  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // 调用真实API登录
      const response = await authApi.login({
        phone,
        password
      });
      
      if (response.code === 0 && response.data) {
        // 登录成功，保存token和用户信息
        Taro.setStorageSync('token', response.data.token);
        Taro.setStorageSync('isLoggedIn', true);
        Taro.setStorageSync('userInfo', response.data.user);
        
        // 跳转到首页
        Taro.switchTab({
          url: '/pages/index/index'
        });
      } else {
        // 登录失败
        Taro.showToast({
          title: response.msg || '登录失败',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('登录失败:', error);
      Taro.showToast({
        title: error.message || '登录失败，请检查网络连接',
        icon: 'none'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 跳转到注册页
  const handleGoToRegister = () => {
    Taro.navigateTo({
      url: '/pages/register/register'
    });
  };

  // 跳转到忘记密码页
  const handleForgotPassword = () => {
    // 这里可以跳转到忘记密码页
    Taro.showToast({
      title: '忘记密码功能开发中',
      icon: 'none'
    });
  };

  return (
    <View className="login-page">
      {/* 顶部标题 */}
      <View className="login-header">
        <Text className="login-title">登录账号</Text>
      </View>

      {/* 手机号登录表单 */}
      <View className="login-form">
          {/* 手机号输入 */}
          <View className="form-item">
            <View className="phone-input-container">
              <Text className="country-code">+86</Text>
              <Input 
                className="phone-input" 
                placeholder="请输入手机号"
                value={phone}
                onInput={(e) => setPhone(e.detail.value)}
                onBlur={() => {
                  if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
                    setErrors(prev => ({ ...prev, phone: '请输入正确的手机号' }));
                  } else {
                    setErrors(prev => ({ ...prev, phone: '' }));
                  }
                }}
              />
            </View>
            {errors.phone && <Text className="error-message">{errors.phone}</Text>}
          </View>

          {/* 密码输入 */}
          <View className="form-item">
            <View className="password-input-container">
              <Input 
                className="password-input" 
                placeholder="请输入密码"
                value={password}
                onInput={(e) => setPassword(e.detail.value)}
                type={showPassword ? 'text' : 'password'}
                onBlur={() => {
                  if (password && password.length < 6) {
                    setErrors(prev => ({ ...prev, password: '密码长度不能少于6位' }));
                  } else {
                    setErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
              />
              <Text 
                className="password-toggle" 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '隐藏' : '显示'}
              </Text>
            </View>
            <View className="forgot-password">
              <Text className="forgot-password-text" onClick={handleForgotPassword}>忘记密码？</Text>
            </View>
            {errors.password && <Text className="error-message">{errors.password}</Text>}
          </View>

          {/* 记住密码 */}
          <View className="form-item">
            <View className="remember-password-container">
              <Checkbox 
                checked={rememberPassword} 
                onChange={(e) => setRememberPassword(e.detail.value)}
              />
              <Text className="remember-password-text">记住密码</Text>
            </View>
          </View>

          {/* 登录按钮 */}
          <Button 
            className="login-btn"
            loading={isLoading}
            onClick={handleLogin}
          >
            登录
          </Button>
        </View>

      {/* 底部快捷入口 */}
      <View className="login-footer">
        <Text className="register-text">
          还没有账号？
          <Text className="register-link" onClick={handleGoToRegister}>立即注册</Text>
        </Text>
      </View>

      {/* 安全提示 */}
      <View className="safety-tip">
        <Text className="safety-tip-text">登录即表示同意《用户协议》和《隐私政策》</Text>
      </View>
    </View>
  );
}