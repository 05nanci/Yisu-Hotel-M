// API服务层
import Taro from '@tarojs/taro';

// API基础配置
const API_BASE_URL = 'http://localhost:5050'; // 后端服务地址

// 通用请求函数
async function request(url, options = {}) {
  try {
    // 构建完整的请求URL
    const fullUrl = `${API_BASE_URL}${url}`;
    
    // 设置默认请求头
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // 添加认证token（如果有）
    const token = Taro.getStorageSync('token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    // 准备请求数据
    const requestData = options.body ? JSON.parse(options.body) : undefined;
    
    // 发送请求
    console.log('API请求开始:', {
      url: fullUrl,
      method: options.method || 'GET',
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      data: requestData,
    });
    
    const response = await Taro.request({
      url: fullUrl,
      method: options.method || 'GET',
      header: {
        ...defaultHeaders,
        ...options.headers,
      },
      data: requestData,
    });
    
    console.log('API请求响应:', {
      statusCode: response.statusCode,
      data: response.data,
      header: response.header,
    });
    
    // 检查响应状态
    if (response.statusCode === 200) {
      // 检查response.data是否存在
      if (response.data) {
        // 检查后端返回的错误码
        if (response.data.code === 0) {
          return response.data;
        } else if (response.data.code === 4008) {
          // Token 无效或已过期，跳转到登录页
          Taro.showToast({
            title: response.data.msg || '登录已过期，请重新登录',
            icon: 'none'
          });
          setTimeout(() => {
            Taro.navigateTo({ url: '/pages/login/login' });
          }, 1500);
          throw new Error(`认证失败: ${response.data.msg || '登录已过期'}`);
        } else {
          // 其他后端错误
          throw new Error(`请求失败: ${response.data.msg || '未知错误'}`);
        }
      } else {
        throw new Error('响应数据格式错误');
      }
    } else {
      // 检查response.data是否存在
      const errorMessage = response.data && response.data.msg ? response.data.msg : '未知错误';
      throw new Error(`请求失败 (${response.statusCode}): ${errorMessage}`);
    }
  } catch (error) {
    console.error('API请求错误:', error);
    // 直接抛出错误，不使用模拟数据
    throw error;
  }
}

// 城市相关API
export const cityApi = {
  // 获取所有城市列表
  getCities: async () => {
    return request('/mobile/city/list');
  }
};

// 认证相关API
export const authApi = {
  // 发送验证码
  sendCode: async (phone, type = 'register') => {
    return request('/mobile/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ phone, type }),
    });
  },

  // 用户注册
  register: async (userData) => {
    return request('/mobile/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // 用户登录
  login: async (credentials) => {
    return request('/mobile/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // 重置密码
  resetPassword: async (resetData) => {
    return request('/mobile/auth/reset-password', {
      method: 'PUT',
      body: JSON.stringify(resetData),
    });
  }
};

// 用户相关API
export const userApi = {
  // 获取个人信息
  getProfile: async () => {
    return request('/mobile/user/profile');
  },

  // 更新个人信息
  updateProfile: async (userData) => {
    return request('/mobile/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }
};

// 广告相关API
export const bannerApi = {
  // 获取广告列表
  getBanners: async () => {
    return request('/mobile/banner/list');
  }
};

// 酒店相关API
export const hotelApi = {
  // 获取酒店列表
  getHotelList: async (params) => {
    // 处理数组类型的参数
    const processedParams = { ...params };
    if (Array.isArray(processedParams.starLevels)) {
      processedParams.starLevels = processedParams.starLevels.join(',');
    }
    if (Array.isArray(processedParams.amenities)) {
      processedParams.amenities = processedParams.amenities.join(',');
    }
    // 处理价格范围
    if (Array.isArray(processedParams.priceRange)) {
      processedParams.minPrice = processedParams.priceRange[0];
      processedParams.maxPrice = processedParams.priceRange[1];
      delete processedParams.priceRange;
    }
    // 移除空参数
    const filteredParams = {};
    for (const [key, value] of Object.entries(processedParams)) {
      if (value !== undefined && value !== null && value !== '') {
        filteredParams[key] = value;
      }
    }
    const queryString = new URLSearchParams(filteredParams).toString();
    return request(`/mobile/hotel/list?${queryString}`);
  },

  // 获取酒店详情
  getHotelDetail: async (hotelId) => {
    return request(`/mobile/hotel/${hotelId}`);
  },

  // 获取酒店评论
  getHotelReviews: async (hotelId, params) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/mobile/hotel/${hotelId}/reviews?${queryString}`);
  },

  // 获取城市热门标签与周边信息
  getHotelPopularTags: async (location) => {
    return request(`/mobile/hotel/popular-tags?location=${encodeURIComponent(location)}`);
  }
};

// 订单相关API
export const orderApi = {
  // 获取订单列表
  getOrders: async (params) => {
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      return request(`/mobile/booking/list?${queryString}`);
    } else {
      return request('/mobile/booking/list');
    }
  },

  // 获取订单详情
  getOrderDetail: async (orderId) => {
    return request(`/mobile/booking/detail/${orderId}`);
  },

  // 创建订单
  createOrder: async (orderData) => {
    return request('/mobile/booking', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // 取消订单
  cancelOrder: async (orderId) => {
    return request(`/mobile/booking/${orderId}/cancel`, {
      method: 'POST',
    });
  },

  // 支付订单
  payOrder: async (orderId, paymentData) => {
    return request(`/mobile/booking/${orderId}/pay`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }
};

// 收藏相关API
export const favoriteApi = {
  // 获取收藏列表
  getFavorites: async (params) => {
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      return request(`/mobile/favorite/list?${queryString}`);
    } else {
      return request('/mobile/favorite/list');
    }
  },

  // 添加收藏
  addFavorite: async (hotelId) => {
    return request('/mobile/favorite/add', {
      method: 'POST',
      body: JSON.stringify({ hotel_id: hotelId }),
    });
  },

  // 取消收藏
  removeFavorite: async (hotelId) => {
    return request('/mobile/favorite/remove', {
      method: 'DELETE',
      body: JSON.stringify({ hotel_id: hotelId }),
    });
  }
};

// 优惠券相关API
export const couponApi = {
  // 获取优惠券列表
  getCoupons: async (params) => {
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      return request(`/mobile/coupon/list?${queryString}`);
    } else {
      return request('/mobile/coupon/list');
    }
  },

  // 获取优惠券详情
  getCouponDetail: async (couponId) => {
    return request(`/mobile/coupon/detail?id=${couponId}`);
  },

  // 领取优惠券
  claimCoupon: async (couponId) => {
    return request('/mobile/coupon/claim', {
      method: 'POST',
      body: JSON.stringify({ coupon_id: couponId }),
    });
  },

  // 使用优惠券
  useCoupon: async (couponId, bookingId) => {
    return request('/mobile/coupon/use', {
      method: 'POST',
      body: JSON.stringify({ coupon_id: couponId, booking_id: bookingId }),
    });
  }
};

// 历史记录相关API
export const historyApi = {
  // 获取浏览历史
  getHistory: async () => {
    return request('/mobile/history/list');
  },

  // 删除单条历史记录
  removeHistory: async (historyId) => {
    return request(`/mobile/history/${historyId}`, {
      method: 'DELETE',
    });
  },

  // 清空所有历史记录
  clearHistory: async () => {
    return request('/mobile/history/clear', {
      method: 'DELETE',
    });
  }
};