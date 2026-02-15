// 注意：导入 React 原生的 useState/useEffect，而非 Taro 的
import React, { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Image, ScrollView, Swiper, SwiperItem } from '@tarojs/components';
import { hotelApi } from '../../services/api';
import './index.less';

// 移除模拟数据，只使用从后端API获取的数据

export default function HotelDetail() {
  // 修复：使用 React 原生 useState
  const [hotelData, setHotelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    roomTypes: [],
    facilities: [],
    services: []
  });

  useEffect(() => {
    const fetchHotelDetail = async () => {
      try {
        setLoading(true);
        // 从路由参数获取酒店ID
        const { id } = Taro.getCurrentInstance().router?.params || {};
        if (!id) {
          Taro.showToast({
            title: '酒店ID不能为空',
            icon: 'none'
          });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1000);
          return;
        }

        // 调用API获取酒店详情
        console.log('开始获取酒店详情，ID:', id);
        const response = await hotelApi.getHotelDetail(id);
        console.log('获取酒店详情响应:', response);
        
        if (response.code === 0 && response.data) {
          // 处理后端返回的数据结构，确保与前端期望的数据结构匹配
          // 处理图片数组，确保它是一个数组
          let imagesArray = [];
          if (response.data.bannerList) {
            imagesArray = Array.isArray(response.data.bannerList) ? response.data.bannerList : response.data.bannerList.split(',');
          } else if (response.data.images) {
            imagesArray = Array.isArray(response.data.images) ? response.data.images : response.data.images.split(',');
          } else if (response.data.main_image_url || response.data.image) {
            imagesArray = [response.data.main_image_url || response.data.image];
          }
          
          // 过滤掉空字符串和example.com的图片
          imagesArray = imagesArray.filter(img => img && !img.includes('example.com'));
          
          const processedData = {
            id: response.data.id || response.data.hotel_id || id,
            name: response.data.name || response.data.hotel_name_cn || '酒店名称',
            star_rating: response.data.star_rating || response.data.starLevel || 0,
            rating: response.data.rating || response.data.score || 0,
            review_count: response.data.review_count || response.data.commentCount || 0,
            address: response.data.address || response.data.location || '酒店地址',
            facilities: response.data.facilities || response.data.amenities || [],
            tags: response.data.tags || [],
            main_image_url: response.data.main_image_url || response.data.image || imagesArray[0] || '',
            bannerList: imagesArray,
            room_types: response.data.room_types || response.data.rooms || []
          };
          console.log('处理后的酒店数据:', processedData);
          setHotelData(processedData);
        } else {
          console.error('获取酒店详情失败，响应码:', response.code);
          Taro.showToast({
            title: response.message || '获取酒店详情失败',
            icon: 'none',
            duration: 2000
          });
          // 跳转到酒店列表页
          setTimeout(() => {
            Taro.navigateBack();
          }, 1000);
        }
      } catch (error) {
        console.error('获取酒店详情失败:', error);
        Taro.showToast({
          title: error.message || '获取酒店详情失败，请检查网络连接',
          icon: 'none',
          duration: 2000
        });
        // 跳转到酒店列表页
        setTimeout(() => {
          Taro.navigateBack();
        }, 1000);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelDetail();
  }, []);

  // 处理筛选标签点击
  const handleFilterTagClick = (tag) => {
    setSelectedFilters(prev => {
      if (prev.includes(tag)) {
        return prev.filter(item => item !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  // 处理筛选按钮点击
  const handleFilterClick = () => {
    console.log('筛选按钮点击');
    // 切换筛选面板的显示状态
    setShowFilterPanel(!showFilterPanel);
  };

  // 处理筛选选项点击
  const handleFilterOptionClick = (category, option) => {
    setFilterOptions(prev => {
      const currentOptions = prev[category];
      if (currentOptions.includes(option)) {
        // 取消选择
        return {
          ...prev,
          [category]: currentOptions.filter(item => item !== option)
        };
      } else {
        // 选择
        return {
          ...prev,
          [category]: [...currentOptions, option]
        };
      }
    });
  };

  // 处理重置筛选
  const handleResetFilter = () => {
    setFilterOptions({
      roomTypes: [],
      facilities: [],
      services: []
    });
  };

  // 处理确定筛选
  const handleConfirmFilter = () => {
    console.log('确定筛选', filterOptions);
    // 这里可以根据筛选选项过滤房间列表
    // 暂时只关闭筛选面板
    setShowFilterPanel(false);
    // 显示筛选成功提示
    Taro.showToast({
      title: '筛选已应用',
      icon: 'none'
    });
  };

  // 加载中状态
  if (loading) {
    return (
      <View className="loading-container">
        <Text className="loading-text">加载中...</Text>
      </View>
    );
  }

  // 无数据兜底
  if (!hotelData) {
    return (
      <View className="loading-container">
        <Text className="loading-text">暂无酒店信息</Text>
      </View>
    );
  }

  // 主渲染
  return (
    <ScrollView className="hotel-detail-page">
      {/* 返回按钮 */}
      <View className="back-btn" onClick={() => Taro.navigateBack()}>
        <Text className="back-icon">←</Text>
        <Text className="back-text">返回</Text>
      </View>

      {/* 顶部轮播图 */}
      <Swiper className="banner-swiper">
        {(hotelData.main_image_url || hotelData.bannerList || []).map((img, idx) => (
          <SwiperItem key={idx}>
            <Image className="banner-img" src={img && !img.includes('example.com') ? img : 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20exterior%20building%20architecture&image_size=landscape_16_9'} mode="widthFix" />
          </SwiperItem>
        ))}
      </Swiper>

      {/* 酒店名称+标签 */}
      <View className="hotel-header">
        <Text className="hotel-name">{hotelData.name || hotelData.hotelInfo?.name || '酒店名称'}</Text>
        <Text className="hotel-tag">{hotelData.star_rating ? `${hotelData.star_rating}星级` : hotelData.hotelInfo?.tag || '酒店标签'}</Text>
      </View>

      {/* 设施图标栏 */}
      <View className="facilities-row">
        {hotelData.facilities && hotelData.facilities.slice(0, 4).map((facility, idx) => {
          // 确保facility是字符串
          const facilityText = typeof facility === 'object' ? (facility.name || facility.label || JSON.stringify(facility)) : facility;
          return (
            <Text key={idx} className="facility-item">
              <Text className="facility-icon">📋</Text>
              <Text className="facility-text">{facilityText}</Text>
            </Text>
          );
        })}
        {(!hotelData.facilities || hotelData.facilities.length === 0) && (
          <>
            <Text className="facility-item">
              <Text className="facility-icon">📶</Text>
              <Text className="facility-text">WiFi</Text>
            </Text>
            <Text className="facility-item">
              <Text className="facility-icon">🚗</Text>
              <Text className="facility-text">停车场</Text>
            </Text>
            <Text className="facility-item">
              <Text className="facility-icon">🧹</Text>
              <Text className="facility-text">清洁</Text>
            </Text>
            <Text className="facility-item">
              <Text className="facility-icon">👨‍💼</Text>
              <Text className="facility-text">服务</Text>
            </Text>
          </>
        )}
        <Text className="facility-more">更多 ▾</Text>
      </View>

      {/* 评分+位置栏 */}
      <View className="score-address-row">
        <View className="score-block">
          <Text className="score">{hotelData.rating || hotelData.hotelInfo?.score || '0.0'}</Text>
          <Text className="score-level">{hotelData.rating >= 4.5 ? '超棒' : hotelData.rating >= 4 ? '很好' : '不错'}</Text>
          <Text className="comment-count">{hotelData.review_count || hotelData.hotelInfo?.commentCount || 0}条 &gt;</Text>
          {hotelData.hotelInfo?.scoreDesc && <Text className="score-desc">{hotelData.hotelInfo.scoreDesc}</Text>}
        </View>
        <View className="address-block">
          {hotelData.hotelInfo?.distance && <Text className="distance">{hotelData.hotelInfo.distance}</Text>}
          <Text className="address">{hotelData.address || hotelData.hotelInfo?.address || '酒店地址'}</Text>
          <Text className="map-btn">查看地图</Text>
        </View>
      </View>

      {/* 优惠标签栏 */}
      <View className="discount-row">
        {(hotelData.tags || hotelData.discountTags || []).slice(0, 3).map((tag, idx) => {
          // 确保tag是字符串
          const tagText = typeof tag === 'object' ? (tag.name || tag.label || JSON.stringify(tag)) : tag;
          return (
            <Text key={idx} className="discount-tag">{tagText}</Text>
          );
        })}
        <Text className="coupon-btn">领券</Text>
      </View>

      {/* 日期+房间人数栏 */}
      <View className="date-guest-row">
        <View className="date-part">
          <Text className="date">{hotelData.dateRange || `${new Date().toISOString().split('T')[0]} - ${new Date(Date.now() + 86400000).toISOString().split('T')[0]}`}</Text>
          <Text className="night">{hotelData.stayNight || '1晚'}</Text>
        </View>
        <Text className="guest">{hotelData.roomGuest || '1间 1人'}</Text>
      </View>

      {/* 房型筛选栏 */}
      <View className="room-filter-row">
        <Text 
          className={`filter-tag ${selectedFilters.includes('双床房') ? 'selected' : ''}`} 
          onClick={() => handleFilterTagClick('双床房')}
        >
          双床房
        </Text>
        <Text 
          className={`filter-tag ${selectedFilters.includes('家庭房') ? 'selected' : ''}`} 
          onClick={() => handleFilterTagClick('家庭房')}
        >
          家庭房
        </Text>
        <Text 
          className={`filter-tag ${selectedFilters.includes('大床房') ? 'selected' : ''}`} 
          onClick={() => handleFilterTagClick('大床房')}
        >
          大床房
        </Text>
        <Text 
          className={`filter-tag ${selectedFilters.includes('免费取消') ? 'selected' : ''}`} 
          onClick={() => handleFilterTagClick('免费取消')}
        >
          免费取消
        </Text>
        <Text 
          className={`filter-tag ${selectedFilters.includes('≥35㎡') ? 'selected' : ''}`} 
          onClick={() => handleFilterTagClick('≥35㎡')}
        >
          ≥35㎡
        </Text>
        <View className="filter-more" onClick={handleFilterClick}>
          筛选 ▾
        </View>
      </View>

      {/* 房型列表 */}
      <View className="room-list">
        <View className="recommend-tag">
          <Text className="tag-icon">♦</Text>
          <Text className="tag-text">猜您喜欢 本店大床房销量No.1</Text>
        </View>
        {((hotelData.room_types || hotelData.roomList) || []).map((room) => (
          <View key={room.id} className="room-item">
            <Image className="room-img" src={room.image_url && !room.image_url.includes('example.com') ? room.image_url : (room.img && !room.img.includes('example.com') ? room.img : (hotelData.main_image_url && Array.isArray(hotelData.main_image_url) && hotelData.main_image_url[0] && !hotelData.main_image_url[0].includes('example.com') ? hotelData.main_image_url[0] : 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20room%20interior%20default%20placeholder&image_size=landscape_4_3'))} mode="widthFix" />
            <View className="room-info">
              <View className="room-header">
                <Text className="room-name">{room.name}</Text>
                <Text className="room-code">{room.id}</Text>
              </View>
              <Text className="room-desc">{room.description || room.desc || '房间描述'}</Text>
              <Text className="room-note">{room.note || '入住时间14:00后 | 退房时间12:00前'}</Text>
              {room.service && <Text className="room-service">{room.service}</Text>}
              <View className="room-tags">
                {(room.amenities || room.tags || []).slice(0, 3).map((item, idx) => {
                  // 确保item是字符串
                  const itemText = typeof item === 'object' ? (item.name || item.label || JSON.stringify(item)) : item;
                  return (
                    <Text key={idx} className="tag">{itemText}</Text>
                  );
                })}
              </View>
              <View className="price-book-row">
                <View className="price-part">
                  <Text className="original-price">¥{(room.prices && room.prices[0] && room.prices[0].original_price) || (room.original_price || room.originalPrice || 0)}</Text>
                  <Text className="current-price">¥{(room.prices && room.prices[0] && room.prices[0].price) || (room.price || room.currentPrice || 0)}</Text>
                  <Text className="discount-info">新客体验钻石 会员出行 4项优惠</Text>
                </View>
                {/* 核心修改：跳转路径改为 /pages/booking-confirm/index */}
                <View 
                  className="book-btn" 
                  onClick={() => Taro.navigateTo({
                    url: `/pages/booking-confirm/index?hotelId=${hotelData.id}&roomId=${room.id}`
                  })}
                >
                  预订
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* 筛选面板 */}
      {showFilterPanel && (
        <View className="filter-panel">
          <View className="filter-panel-header">
            <Text className="filter-panel-title">筛选</Text>
            <Text className="filter-panel-close" onClick={handleFilterClick}>×</Text>
          </View>
          <ScrollView className="filter-panel-content">
            {/* 房型 */}
            <View className="filter-section">
              <Text className="filter-section-title">房型</Text>
              <View className="filter-options">
                <Text 
                  className={`filter-option ${filterOptions.roomTypes.includes('大床房') ? 'selected' : ''}`}
                  onClick={() => handleFilterOptionClick('roomTypes', '大床房')}
                >
                  大床房
                </Text>
                <Text 
                  className={`filter-option ${filterOptions.roomTypes.includes('双床房') ? 'selected' : ''}`}
                  onClick={() => handleFilterOptionClick('roomTypes', '双床房')}
                >
                  双床房
                </Text>
                <Text 
                  className={`filter-option ${filterOptions.roomTypes.includes('三床房') ? 'selected' : ''}`}
                  onClick={() => handleFilterOptionClick('roomTypes', '三床房')}
                >
                  三床房
                </Text>
                <Text 
                  className={`filter-option ${filterOptions.roomTypes.includes('电竞房') ? 'selected' : ''}`}
                  onClick={() => handleFilterOptionClick('roomTypes', '电竞房')}
                >
                  电竞房
                </Text>
                <Text 
                  className={`filter-option ${filterOptions.roomTypes.includes('多床房') ? 'selected' : ''}`}
                  onClick={() => handleFilterOptionClick('roomTypes', '多床房')}
                >
                  多床房
                </Text>
              </View>
            </View>
            
            {/* 设施 */}
            <View className="filter-section">
              <Text className="filter-section-title">设施</Text>
              <View className="filter-options">
                <Text 
                  className={`filter-option ${filterOptions.facilities.includes('空调') ? 'selected' : ''}`}
                  onClick={() => handleFilterOptionClick('facilities', '空调')}
                >
                  空调
                </Text>
                <Text 
                  className={`filter-option ${filterOptions.facilities.includes('电脑') ? 'selected' : ''}`}
                  onClick={() => handleFilterOptionClick('facilities', '电脑')}
                >
                  电脑
                </Text>
                <Text 
                  className={`filter-option ${filterOptions.facilities.includes('客房宽带') ? 'selected' : ''}`}
                  onClick={() => handleFilterOptionClick('facilities', '客房宽带')}
                >
                  客房宽带
                </Text>
                <Text 
                  className={`filter-option ${filterOptions.facilities.includes('吹风机') ? 'selected' : ''}`}
                  onClick={() => handleFilterOptionClick('facilities', '吹风机')}
                >
                  吹风机
                </Text>
              </View>
            </View>
            
            {/* 服务优选 */}
            <View className="filter-section">
              <Text className="filter-section-title">服务优选</Text>
              <View className="filter-options">
                <Text 
                  className={`filter-option ${filterOptions.services.includes('可取消') ? 'selected' : ''}`}
                  onClick={() => handleFilterOptionClick('services', '可取消')}
                >
                  可取消
                </Text>
                <Text 
                  className={`filter-option ${filterOptions.services.includes('不满意退') ? 'selected' : ''}`}
                  onClick={() => handleFilterOptionClick('services', '不满意退')}
                >
                  不满意退
                </Text>
                <Text 
                  className={`filter-option ${filterOptions.services.includes('可订') ? 'selected' : ''}`}
                  onClick={() => handleFilterOptionClick('services', '可订')}
                >
                  可订
                </Text>
              </View>
            </View>
          </ScrollView>
          <View className="filter-panel-footer">
            <Text className="filter-reset-btn" onClick={handleResetFilter}>重置</Text>
            <View className="filter-confirm-btn" onClick={handleConfirmFilter}>
              <Text className="filter-confirm-text">确定</Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
