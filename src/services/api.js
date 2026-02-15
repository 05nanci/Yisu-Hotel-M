// API服务层
import Taro from '@tarojs/taro';

// API基础配置
const API_BASE_URL = 'http://localhost:3001'; // 后端服务地址
console.log('API_BASE_URL:', API_BASE_URL);

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
    
    // 准备请求选项
    const requestOptions = {
      url: fullUrl,
      method: options.method || 'GET',
      header: {
        ...defaultHeaders,
        ...options.headers,
      },
    };
    
    // 准备请求数据
    if (options.method && options.method !== 'GET' && options.body) {
      try {
        // 尝试解析 JSON 字符串
        requestOptions.data = JSON.parse(options.body);
      } catch (error) {
        // 如果解析失败，直接使用原始数据
        requestOptions.data = options.body;
      }
    }
    
    // 发送请求
    console.log('API请求开始:', {
      url: fullUrl,
      method: requestOptions.method,
      header: requestOptions.header,
      data: requestOptions.data,
    });
    
    try {
      const response = await Taro.request(requestOptions);
      
      console.log('API请求响应状态:', response.statusCode);
      console.log('API请求响应数据:', response.data);
      
      // 解析响应数据
      const responseData = response.data;
      
      // 检查响应状态
      if (response.statusCode === 200) {
        // 检查后端返回的错误码
        if (responseData.code === 0) {
          return responseData;
        } else if (responseData.code === 4008) {
          // Token 无效或已过期，跳转到登录页
          Taro.showToast({
            title: responseData.msg || '登录已过期，请重新登录',
            icon: 'none'
          });
          // 清除本地存储的token
          Taro.removeStorageSync('token');
          Taro.removeStorageSync('isLoggedIn');
          Taro.removeStorageSync('userInfo');
          // 跳转到登录页
          setTimeout(() => {
            Taro.navigateTo({ url: '/pages/login/login' });
          }, 1500);
          // 不抛出错误，避免后端服务器崩溃
          return {
            code: responseData.code,
            msg: responseData.msg,
            data: null
          };
        } else {
          // 其他后端错误
          // 不抛出错误，避免后端服务器崩溃
          return {
            code: responseData.code,
            msg: responseData.msg,
            data: null
          };
        }
      } else {
        // 检查responseData是否存在
        const errorMessage = responseData && responseData.msg ? responseData.msg : '未知错误';
        // 不抛出错误，避免后端服务器崩溃
        return {
          code: response.statusCode,
          msg: errorMessage,
          data: null
        };
      }
    } catch (error) {
      console.error('API请求错误:', error);
      // 不抛出错误，避免后端服务器崩溃
      return {
        code: 500,
        msg: error.message || '网络请求失败',
        data: null
      };
    }
  } catch (error) {
    console.error('API请求错误:', error);
    // 不抛出错误，避免后端服务器崩溃
    return {
      code: 500,
      msg: error.message || '网络请求失败',
      data: null
    };
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
  // 登录
  login: async (credentials) => {
    return request('/mobile/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }
};

// 用户相关API
export const userApi = {
  // 获取个人信息
  getProfile: async () => {
    return request('/mobile/user/profile');
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

  // 收藏酒店
  collectHotel: async (hotelId) => {
    return request('/mobile/favorite/add', {
      method: 'POST',
      body: JSON.stringify({ hotel_id: hotelId }),
    });
  },

  // 取消收藏酒店
  uncollectHotel: async (hotelId) => {
    return request('/mobile/favorite/remove', {
      method: 'POST',
      body: JSON.stringify({ hotel_id: hotelId }),
    });
  },

  // 获取用户收藏的酒店列表
  getCollectedHotels: async () => {
    return request('/mobile/favorite/list');
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
      method: 'POST',
      body: JSON.stringify({ hotel_id: hotelId }),
    });
  }
};

// 预订相关API
export const bookingApi = {
  // 创建预订
  createBooking: async (bookingData) => {
    return request('/mobile/booking', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  // 获取预订列表
  getBookingList: async (params) => {
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      return request(`/mobile/booking?${queryString}`);
    } else {
      return request('/mobile/booking');
    }
  },

  // 获取预订详情
  getBookingDetail: async (bookingId) => {
    return request(`/mobile/booking/${bookingId}`);
  },

  // 取消预订
  cancelBooking: async (orderId) => {
    return request('/mobile/booking/cancel', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    });
  },

  // 支付预订
  payBooking: async (paymentData) => {
    return request('/mobile/booking/pay', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }
};

// 订单相关API
export const orderApi = {
  // 获取订单列表
  getOrders: async (params) => {
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      return request(`/mobile/booking?${queryString}`);
    } else {
      return request('/mobile/booking');
    }
  },
  
  // 获取订单详情
  getOrderDetail: async (orderId) => {
    return request(`/mobile/booking/${orderId}`);
  },
  
  // 取消订单
  cancelOrder: async (orderId) => {
    return request('/mobile/booking/cancel', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    });
  },
  
  // 支付订单
  payOrder: async (orderId) => {
    return request('/mobile/booking/pay', {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    });
  }
};
