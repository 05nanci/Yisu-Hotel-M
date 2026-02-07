// API服务层

// API基础配置
const API_BASE_URL = 'http://localhost:3000/api'; // 后端服务地址

// 通用请求函数
async function request(url, options = {}) {
  try {
    // 直接返回模拟数据，确保页面能够正常加载
    return getMockData(url, options);
  } catch (error) {
    console.error('API request error:', error);
    // 模拟数据返回，当后端API未实现时使用
    return getMockData(url, options);
  }
}

// 模拟数据
function getMockData(url, options) {
  // 酒店搜索模拟数据
  if (url.includes('/hotels/search')) {
    // 解析请求体，获取排序信息
    let sortType = 'default';
    if (options && options.body) {
      try {
        const params = JSON.parse(options.body);
        sortType = params.sort || 'default';
      } catch (error) {
        console.error('解析请求体失败:', error);
      }
    }
    
    // 模拟酒店数据
    const hotels = [
      {
        id: 1,
        name: '北京王府井希尔顿酒店',
        address: '北京市东城区王府井东街8号',
        price: 1280,
        rating: 4.8,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20exterior%20modern%20building&image_size=landscape_4_3',
        amenities: ['免费WiFi', '停车场', '健身房', '游泳池', '餐厅'],
        distance: '0.5km',
        available: true,
        freeCancellation: true,
        collectionCount: 128
      },
      {
        id: 2,
        name: '北京国贸大酒店',
        address: '北京市朝阳区建国门外大街1号',
        price: 1680,
        rating: 4.9,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=5%20star%20hotel%20with%20city%20view&image_size=landscape_4_3',
        amenities: ['免费WiFi', '停车场', '健身房', '游泳池', ' spa'],
        distance: '1.2km',
        available: true,
        freeCancellation: true,
        collectionCount: 256
      },
      {
        id: 3,
        name: '北京三里屯通盈中心洲际酒店',
        address: '北京市朝阳区南三里屯路1号',
        price: 1480,
        rating: 4.7,
        image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20near%20shopping%20district&image_size=landscape_4_3',
        amenities: ['免费WiFi', '停车场', '健身房', '餐厅', '酒吧'],
        distance: '1.8km',
        available: true,
        freeCancellation: false,
        collectionCount: 89
      }
    ];
    
    // 根据排序类型对酒店数据进行排序
    let sortedHotels = [...hotels];
    if (sortType === 'price_asc') {
      // 价格升序
      sortedHotels.sort((a, b) => a.price - b.price);
    } else if (sortType === 'price_desc') {
      // 价格降序
      sortedHotels.sort((a, b) => b.price - a.price);
    } else if (sortType === 'distance') {
      // 距离由近及远
      sortedHotels.sort((a, b) => {
        const distanceA = parseFloat(a.distance.replace('km', ''));
        const distanceB = parseFloat(b.distance.replace('km', ''));
        return distanceA - distanceB;
      });
    }
    
    return {
      success: true,
      data: {
        hotels: sortedHotels,
        total: sortedHotels.length,
        page: 1,
        pageSize: 10
      }
    };
  }

  // 城市列表模拟数据
  if (url.includes('/cities')) {
    return {
      success: true,
      data: {
        cities: [
          { id: 1, name: '北京' },
          { id: 2, name: '上海' },
          { id: 3, name: '广州' },
          { id: 4, name: '深圳' },
          { id: 5, name: '杭州' },
          { id: 6, name: '成都' },
          { id: 7, name: '重庆' },
          { id: 8, name: '西安' }
        ]
      }
    };
  }

  // 位置信息模拟数据
  if (url.includes('/location')) {
    return {
      success: true,
      data: {
        city: '北京',
        district: '东城区',
        address: '北京市东城区王府井附近'
      }
    };
  }

  // 默认返回
  return {
    success: false,
    message: 'API not implemented yet'
  };
}

// 酒店相关API
export const hotelApi = {
  // 搜索酒店
  searchHotels: async (params) => {
    console.log('搜索酒店参数:', params);
    try {
      return await request('/hotels/search', {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch (error) {
      console.error('搜索酒店API错误:', error);
      // 直接返回模拟数据，确保即使API调用失败也能正常工作
      
      // 模拟酒店数据
      const hotels = [
        {
          id: 1,
          name: '北京王府井希尔顿酒店',
          address: '北京市东城区王府井东街8号',
          price: 1280,
          rating: 4.8,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20hotel%20exterior%20modern%20building&image_size=landscape_4_3',
          amenities: ['免费WiFi', '停车场', '健身房', '游泳池', '餐厅'],
          distance: '0.5km',
          available: true,
          freeCancellation: true,
          collectionCount: 128
        },
        {
          id: 2,
          name: '北京国贸大酒店',
          address: '北京市朝阳区建国门外大街1号',
          price: 1680,
          rating: 4.9,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=5%20star%20hotel%20with%20city%20view&image_size=landscape_4_3',
          amenities: ['免费WiFi', '停车场', '健身房', '游泳池', ' spa'],
          distance: '1.2km',
          available: true,
          freeCancellation: true,
          collectionCount: 256
        },
        {
          id: 3,
          name: '北京三里屯通盈中心洲际酒店',
          address: '北京市朝阳区南三里屯路1号',
          price: 1480,
          rating: 4.7,
          image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20near%20shopping%20district&image_size=landscape_4_3',
          amenities: ['免费WiFi', '停车场', '健身房', '餐厅', '酒吧'],
          distance: '1.8km',
          available: true,
          freeCancellation: false,
          collectionCount: 89
        }
      ];
      
      // 根据排序类型对酒店数据进行排序
      let sortedHotels = [...hotels];
      if (params.sort === 'price_asc') {
        // 价格升序
        sortedHotels.sort((a, b) => a.price - b.price);
      } else if (params.sort === 'price_desc') {
        // 价格降序
        sortedHotels.sort((a, b) => b.price - a.price);
      } else if (params.sort === 'distance') {
        // 距离由近及远
        sortedHotels.sort((a, b) => {
          const distanceA = parseFloat(a.distance.replace('km', ''));
          const distanceB = parseFloat(b.distance.replace('km', ''));
          return distanceA - distanceB;
        });
      }
      
      return {
        success: true,
        data: {
          hotels: sortedHotels,
          total: sortedHotels.length,
          page: 1,
          pageSize: 10
        }
      };
    }
  },

  // 获取酒店详情
  getHotelDetail: async (hotelId) => {
    return request(`/hotels/${hotelId}`);
  },

  // 获取酒店评论
  getHotelReviews: async (hotelId, params) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/hotels/${hotelId}/reviews?${queryString}`);
  }
};

// 位置相关API
export const locationApi = {
  // 获取城市列表
  getCities: async () => {
    return request('/cities');
  },

  // 根据坐标获取位置信息
  getLocationByCoords: async (latitude, longitude) => {
    return request(`/location?lat=${latitude}&lng=${longitude}`);
  }
};

// 用户相关API
export const userApi = {
  // 登录
  login: async (credentials) => {
    return request('/user/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // 注册
  register: async (userData) => {
    return request('/user/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }
};
