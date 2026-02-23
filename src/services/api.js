// API服务层
import Taro from '@tarojs/taro';

// API基础配置
const API_BASE_URL = 'http://localhost:3001'; // 后端服务地址
console.log('API_BASE_URL:', API_BASE_URL);

const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
// 高德地图配置
export const AMAP_CONFIG = {
  key: metaEnv.VITE_AMAP_KEY || metaEnv.TARO_APP_AMAP_KEY || process.env.VITE_AMAP_KEY || process.env.TARO_APP_AMAP_KEY || '您的高德地图API密钥',
  securityKey: metaEnv.VITE_AMAP_SECURITY_CODE || metaEnv.TARO_APP_AMAP_SECURITY_KEY || process.env.VITE_AMAP_SECURITY_CODE || process.env.TARO_APP_AMAP_SECURITY_KEY || '您的高德地图安全密钥'
};
console.log('AMAP_CONFIG:', AMAP_CONFIG);

// API缓存配置
const CACHE_CONFIG = {
  enabled: true,
  defaultExpiry: 5 * 60 * 1000, // 默认缓存5分钟
  cacheKeyPrefix: 'api_cache_'
};

// 缓存存储
const cacheStorage = {
  set: (key, value, expiry = CACHE_CONFIG.defaultExpiry) => {
    if (!CACHE_CONFIG.enabled) return;
    try {
      const item = {
        value,
        expiry: Date.now() + expiry
      };
      Taro.setStorageSync(`${CACHE_CONFIG.cacheKeyPrefix}${key}`, item);
    } catch (error) {
      console.error('缓存设置失败:', error);
    }
  },
  get: (key) => {
    if (!CACHE_CONFIG.enabled) return null;
    try {
      const item = Taro.getStorageSync(`${CACHE_CONFIG.cacheKeyPrefix}${key}`);
      if (!item) return null;
      if (Date.now() > item.expiry) {
        // 缓存过期，删除
        Taro.removeStorageSync(`${CACHE_CONFIG.cacheKeyPrefix}${key}`);
        return null;
      }
      return item.value;
    } catch (error) {
      console.error('缓存获取失败:', error);
      return null;
    }
  },
  remove: (key) => {
    if (!CACHE_CONFIG.enabled) return;
    try {
      Taro.removeStorageSync(`${CACHE_CONFIG.cacheKeyPrefix}${key}`);
    } catch (error) {
      console.error('缓存删除失败:', error);
    }
  },
  clear: () => {
    if (!CACHE_CONFIG.enabled) return;
    try {
      const keys = Taro.getStorageInfoSync().keys;
      keys.forEach(key => {
        if (key.startsWith(CACHE_CONFIG.cacheKeyPrefix)) {
          Taro.removeStorageSync(key);
        }
      });
    } catch (error) {
      console.error('缓存清空失败:', error);
    }
  }
};

// 通用请求函数
async function request(url, options = {}) {
  try {
    // 构建完整的请求URL
    const fullUrl = `${API_BASE_URL}${url}`;
    
    // 生成缓存键
    const cacheKey = `${options.method || 'GET'}_${url}_${options.body || ''}`;
    
    // 检查是否启用缓存且为GET请求
    if ((options.method || 'GET') === 'GET') {
      const cachedData = cacheStorage.get(cacheKey);
      if (cachedData) {
        console.log('使用缓存数据:', cacheKey);
        return cachedData;
      }
    }
    
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
          // 缓存成功的GET请求结果
          if ((options.method || 'GET') === 'GET') {
            cacheStorage.set(cacheKey, responseData);
          }
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
          // 清除缓存
          cacheStorage.clear();
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
  },
  
  // 注册
  register: async (data) => {
    return request('/mobile/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  // 发送验证码
  sendCode: async (phone, type) => {
    return request('/mobile/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ phone, type }),
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
    // 处理新增的筛选维度
    if (Array.isArray(processedParams.hotelTypes)) {
      processedParams.hotelTypes = processedParams.hotelTypes.join(',');
    }
    if (Array.isArray(processedParams.brands)) {
      processedParams.brands = processedParams.brands.join(',');
    }
    if (Array.isArray(processedParams.roomFacilities)) {
      processedParams.roomFacilities = processedParams.roomFacilities.join(',');
    }
    if (Array.isArray(processedParams.hotelFeatures)) {
      processedParams.hotelFeatures = processedParams.hotelFeatures.join(',');
    }
    // 处理新增的设施和服务筛选
    if (Array.isArray(processedParams.facilities)) {
      processedParams.facilities = processedParams.facilities.join(',');
    }
    if (Array.isArray(processedParams.services)) {
      processedParams.services = processedParams.services.join(',');
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
    // 为不同的筛选条件生成不同的缓存键
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
    const timestamp = new Date().getTime();
    if (params) {
      const queryString = new URLSearchParams({ ...params, _t: timestamp }).toString();
      return request(`/mobile/booking/list?${queryString}`);
    } else {
      return request(`/mobile/booking/list?_t=${timestamp}`);
    }
  },

  // 获取预订详情
  getBookingDetail: async (bookingId) => {
    const timestamp = new Date().getTime();
    return request(`/mobile/booking/detail/${bookingId}?_t=${timestamp}`);
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
    const timestamp = new Date().getTime();
    if (params) {
      const queryString = new URLSearchParams({ ...params, _t: timestamp }).toString();
      return request(`/mobile/booking/list?${queryString}`);
    } else {
      return request(`/mobile/booking/list?_t=${timestamp}`);
    }
  },
  // 获取订单详情
  getOrderDetail: async (orderId) => {
    return request(`/mobile/booking/detail/${orderId}`);
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
  }
};

// 浏览历史相关API
export const historyApi = {
  // 获取浏览历史
  getHistory: async () => {
    return request('/mobile/history/list');
  }
};

// AI助手相关API
export const aiApi = {
  // AI聊天
  chat: async (messages) => {
    // 提取历史消息（除了最后一条）
    const history = messages.slice(0, messages.length - 1);
    return request('/mobile/chat/completion', {
      method: 'POST',
      body: JSON.stringify({ messages, history }),
    });
  },
  
  // 获取AI助手信息
  getInfo: async () => {
    return request('/mobile/chat/info');
  },
  
  // 健康检查
  healthCheck: async () => {
    return request('/mobile/chat/health');
  }
};

// 帮助中心相关API
export const helpApi = {
  // 获取帮助中心常见问题
  getHelpCenter: async () => {
    return request('/mobile/help/center');
  }
};
