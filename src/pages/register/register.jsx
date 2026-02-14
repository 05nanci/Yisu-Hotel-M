import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Input, Button, Image, Checkbox } from '@tarojs/components';
import { authApi } from '../../services/api';
import './register.less';

export default function Register() {
  // 状态管理
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // 倒计时逻辑
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 表单校验
  const validateForm = () => {
    const newErrors = {};
    
    console.log('validateForm called, agreeTerms:', agreeTerms);
    
    if (!phone) {
      newErrors.phone = '请输入手机号';
    } else if (!/^1[3-9]\d{9}$/.test(phone)) {
      newErrors.phone = '请输入正确的手机号';
    }
    
    if (!verificationCode) {
      newErrors.verificationCode = '请输入验证码';
    }
    
    if (!password) {
      newErrors.password = '请设置密码';
    } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/.test(password)) {
      newErrors.password = '密码需6-16位，包含数字和字母';
    }
    
    if (!agreeTerms) {
      newErrors.agreeTerms = '请阅读并同意用户协议和隐私政策';
    }
    
    console.log('validateForm errors:', newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 获取验证码
  const handleGetVerificationCode = async () => {
    if (!phone) {
      setErrors(prev => ({ ...prev, phone: '请输入手机号' }));
      return;
    }
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setErrors(prev => ({ ...prev, phone: '请输入正确的手机号' }));
      return;
    }
    
    try {
      // 使用真实的API调用发送验证码
      const response = await authApi.sendCode(phone, 'register');
      
      if (response.code === 0) {
        // 验证码发送成功，开始倒计时
        setCountdown(60);
        Taro.showToast({
          title: '验证码已发送，请查收',
          icon: 'none'
        });
      } else {
        // 验证码发送失败
        Taro.showToast({
          title: response.msg || '验证码发送失败',
          icon: 'none'
        });
      }
    } catch (error) {
      // 处理网络错误等异常
      Taro.showToast({
        title: error.message || '验证码发送失败，请检查网络连接',
        icon: 'none'
      });
    }
  };

  // 注册
  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('开始注册，参数:', {
        phone: phone,
        code: verificationCode,
        password: password,
        agreed: agreeTerms
      });
      
      // 使用真实的API调用进行注册
      const response = await authApi.register({

        phone: phone,
        code: verificationCode,
        password: password,
        agreed: agreeTerms
      });
      
      console.log('注册响应:', response);
      
      if (response.code === 0 && response.data) {
        // 注册成功，保存token和用户信息
        Taro.setStorageSync('token', response.data.token);
        Taro.setStorageSync('isLoggedIn', true);
        Taro.setStorageSync('userInfo', response.data.user);
        
        // 跳转到首页
        console.log('注册成功，跳转到首页');
        Taro.switchTab({
          url: '/pages/index/index'
        });
      } else {
        // 注册失败，显示错误信息
        console.log('注册失败:', response.msg);
        Taro.showToast({
          title: response.msg || '注册失败',
          icon: 'none'
        });
      }
    } catch (error) {
      // 处理网络错误等异常
      console.error('注册异常:', error);
      Taro.showToast({
        title: error.message || '注册失败，请检查网络连接',
        icon: 'none'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 跳转到登录页
  const handleGoToLogin = () => {
    console.log('handleGoToLogin函数被调用');
    try {
      Taro.navigateTo({
        url: '/pages/login/login'
      });
    } catch (error) {
      console.error('跳转失败:', error);
    }
  };

  return (
    <View className="register-page">
      {/* 顶部标题 */}
      <View className="register-header">
        <Text className="register-title">注册账号</Text>
      </View>

      {/* 手机号注册表单 */}
      <View className="register-form">
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

        {/* 验证码输入 */}
        <View className="form-item">
          <View style={{ display: 'flex', flexDirection: 'column', marginBottom: '16rpx' }}>
            <Input 
              className="verification-code-input" 
              placeholder="请输入验证码"
              value={verificationCode}
              onInput={(e) => setVerificationCode(e.detail.value)}
              style={{ height: '60rpx', fontSize: '28rpx', borderBottom: '1rpx solid #e5e5e5', paddingBottom: '16rpx' }}
            />
          </View>
          <Button 
            className={`get-code-btn ${countdown > 0 ? 'disabled' : ''}`}
            disabled={countdown > 0}
            onClick={handleGetVerificationCode}
            style={{ width: '100%', height: '60rpx', fontSize: '24rpx' }}
          >
            {countdown > 0 ? `${countdown}秒后重发` : '获取验证码'}
          </Button>
          {errors.verificationCode && <Text className="error-message">{errors.verificationCode}</Text>}
        </View>

        {/* 密码输入 */}
        <View className="form-item">
          <View className="password-input-container">
            <Input 
              className="password-input" 
              placeholder="请设置密码（6-16位，含数字和字母）"
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
              type={showPassword ? 'text' : 'password'}
              onBlur={() => {
                if (password && !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,16}$/.test(password)) {
                  setErrors(prev => ({ ...prev, password: '密码需6-16位，包含数字和字母' }));
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
          {errors.password && <Text className="error-message">{errors.password}</Text>}
        </View>

        {/* 协议勾选 */}
        <View className="form-item">
          <View 
            className="terms-container" 
            onClick={() => {
              const newValue = !agreeTerms;
              console.log('Terms container clicked, new value:', newValue);
              setAgreeTerms(newValue);
              // 勾选时清除协议错误信息
              if (newValue) {
                setErrors(prev => ({ ...prev, agreeTerms: '' }));
              }
            }}
          >
            <View className={`checkbox ${agreeTerms ? 'checked' : ''}`}>
              {agreeTerms && <Text className="checkbox-check">✓</Text>}
            </View>
            <Text className="terms-text">
              我已阅读并同意
              <Text className="terms-link">《用户协议》</Text>
              和
              <Text className="terms-link">《隐私政策》</Text>
            </Text>
          </View>
          {errors.agreeTerms && <Text className="error-message">{errors.agreeTerms}</Text>}
        </View>

        {/* 注册按钮 */}
        <Button 
          className={`register-btn ${agreeTerms ? 'enabled' : ''}`}
          disabled={!agreeTerms || isLoading}
          loading={isLoading}
          onClick={handleRegister}
          style={{ 
            width: '100%', 
            height: '80rpx', 
            borderRadius: '8rpx', 
            fontSize: '28rpx',
            backgroundColor: agreeTerms ? '#0088ff' : '#ccc',
            color: '#fff'
          }}
        >
          注册
        </Button>
      </View>

      {/* 底部快捷入口 */}
      <View className="register-footer">
        <Text className="login-text">
          已有账号？
          <Text 
            className="login-link" 
            onClick={handleGoToLogin}
          >
            立即登录
          </Text>
        </Text>
      </View>
    </View>
  );
}
