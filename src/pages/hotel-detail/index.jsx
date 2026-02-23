import React, { useState, useEffect, useMemo, useRef } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Image, ScrollView, Swiper, SwiperItem } from '@tarojs/components';
import AMapLoader from '@amap/amap-jsapi-loader';
import { hotelApi, favoriteApi } from '../../services/api';
import DateSelector from '../../components/DateSelector';
import './index.less';

const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};
const AMAP_KEY = metaEnv.VITE_AMAP_KEY || metaEnv.TARO_APP_AMAP_KEY || process.env.VITE_AMAP_KEY || process.env.TARO_APP_AMAP_KEY || '';
const AMAP_SECURITY_CODE = metaEnv.VITE_AMAP_SECURITY_CODE || metaEnv.TARO_APP_AMAP_SECURITY_KEY || process.env.VITE_AMAP_SECURITY_CODE || process.env.TARO_APP_AMAP_SECURITY_KEY || '';

if (typeof window !== 'undefined' && AMAP_SECURITY_CODE) {
  window._AMapSecurityConfig = {
    securityJsCode: AMAP_SECURITY_CODE
  };
}

export default function HotelDetail() {
  const [loading, setLoading] = useState(true);
  const [hotelId, setHotelId] = useState('');
  const [hotelInfo, setHotelInfo] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [collected, setCollected] = useState(false);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [expandedRooms, setExpandedRooms] = useState({});
  const [showMapModal, setShowMapModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const mapContainerId = 'hotel-detail-map-container';
  const mapWrapperRef = useRef(null);
  const mapDomRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);
        const { id, hotelId } = Taro.getCurrentInstance().router?.params || {};
        const hotel_id = id || hotelId;
        setHotelId(hotel_id);

        const {
          check_in,
          check_out,
          checkIn,
          checkOut,
          check_in_date,
          check_out_date,
          start_date,
          end_date
        } = Taro.getCurrentInstance().router?.params || {};
        const initialCheckIn = check_in || checkIn || check_in_date || start_date;
        const initialCheckOut = check_out || checkOut || check_out_date || end_date;
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        const formattedToday = formatDate(today);
        const formattedTomorrow = formatDate(tomorrow);
        setCheckInDate(initialCheckIn || formattedToday);
        setCheckOutDate(initialCheckOut || formattedTomorrow);

        if (!hotel_id) {
          Taro.showToast({
            title: '酒店ID不能为空',
            icon: 'none'
          });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1000);
          return;
        }

        await fetchHotelDetail(hotel_id);
        await checkFavoriteStatus(hotel_id);
      } catch (error) {
        console.error('初始化页面失败:', error);
        Taro.showToast({
          title: '加载失败，请重试',
          icon: 'none'
        });
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, []);

  useEffect(() => {
    if (!showMapModal) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
      return;
    }

    const initMap = async () => {
      if (Taro.getEnv() !== Taro.ENV_TYPE.WEB) {
        return;
      }
      const ensureMapContainer = () => {
        if (!mapWrapperRef.current || typeof document === 'undefined') {
          return null;
        }
        if (mapDomRef.current && mapDomRef.current.parentNode === mapWrapperRef.current) {
          return mapDomRef.current;
        }
        const existing = document.getElementById(mapContainerId);
        if (existing && existing.parentNode === mapWrapperRef.current) {
          mapDomRef.current = existing;
          return existing;
        }
        const div = document.createElement('div');
        div.id = mapContainerId;
        div.style.width = '100%';
        div.style.height = '100%';
        mapWrapperRef.current.innerHTML = '';
        mapWrapperRef.current.appendChild(div);
        mapDomRef.current = div;
        return div;
      };
      const container = ensureMapContainer();
      if (!container || !AMAP_KEY) {
        return;
      }
      try {
        const AMap = await AMapLoader.load({
          key: AMAP_KEY,
          version: '2.0',
          plugins: ['AMap.Geocoder', 'AMap.Marker']
        });
        const location = hotelInfo?.location_info?.location || '';
        const parsed = parseLocation(location);
        let center = parsed || [116.397428, 39.90923];

        const map = new AMap.Map(container, {
          zoom: 15,
          center
        });

        mapInstanceRef.current = map;
        const marker = new AMap.Marker({
          position: center,
          map
        });
        markerRef.current = marker;

        if (!parsed && hotelInfo?.location_info?.formatted_address) {
          const geocoder = new AMap.Geocoder();
          geocoder.getLocation(hotelInfo.location_info.formatted_address, (status, result) => {
            if (status === 'complete' && result.geocodes && result.geocodes.length) {
              const pos = result.geocodes[0].location;
              map.setCenter(pos);
              marker.setPosition(pos);
            }
          });
        }
      } catch (error) {
        console.error('地图加载失败:', error);
      }
    };

    Taro.nextTick(() => {
      initMap();
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
      markerRef.current = null;
    };
  }, [showMapModal, hotelInfo]);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseLocation = (location) => {
    if (!location || !location.includes(',')) return null;
    const [lng, lat] = location.split(',').map(Number);
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
    return [lng, lat];
  };

  const calculateNights = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const checkFavoriteStatus = async (hotelId) => {
    try {
      const token = Taro.getStorageSync('token');
      if (!token) {
        return;
      }
      const response = await favoriteApi.getFavorites();
      if (response.code === 0 && response.data) {
        const favoritesData = response.data.favorites || response.data.list || response.data || [];
        const isCollected = favoritesData.some(item => {
          const itemHotelId = item.hotel_id || item.id || item.hotel?.id || item.hotel?.hotel_id;
          return itemHotelId === hotelId;
        });
        setCollected(isCollected);
      }
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  };

  const fetchHotelDetail = async (id) => {
    try {
      const response = await hotelApi.getHotelDetail(id);
      if (response.code === 0 && response.data) {
        const hotelData = response.data;
        const normalizedHotelInfo = {
          id: hotelData.hotel_id || hotelData.id,
          hotel_name_cn: hotelData.hotel_name_cn || hotelData.name || '',
          hotel_name_en: hotelData.hotel_name_en || '',
          star_rating: hotelData.star_rating || 0,
          rating: hotelData.rating || 0,
          review_count: hotelData.review_count || 0,
          description: hotelData.description || '',
          location_info: hotelData.location_info || {},
          nearby_info: hotelData.nearby_info || '',
          main_image_url: Array.isArray(hotelData.main_image_url)
            ? hotelData.main_image_url
            : hotelData.main_image_url ? [hotelData.main_image_url] : [],
          services: hotelData.services || [],
          facilities: hotelData.facilities || [],
          policies: hotelData.policies || hotelData.policy || {},
          tags: hotelData.tags || []
        };
        const roomList = hotelData.room_types || [];
        const formattedRooms = roomList.map(room => ({
          id: room.id || room.room_id || room.room_type_id,
          name: room.name || room.room_name || room.room_type_name || '',
          bed_type: room.bed_type || '',
          area: room.area || '',
          description: room.description || '',
          room_image_url: room.room_image_url || '',
          tags: Array.isArray(room.tags) ? room.tags : [],
          facilities: Array.isArray(room.facilities) ? room.facilities : [],
          services: Array.isArray(room.services) ? room.services : [],
          policies: room.policies || {},
          prices: Array.isArray(room.prices) ? room.prices : []
        }));
        setHotelInfo(normalizedHotelInfo);
        setRooms(formattedRooms);
      } else {
        Taro.showToast({
          title: response.msg || '获取酒店详情失败',
          icon: 'none'
        });
        setHotelInfo(null);
        setRooms([]);
      }
    } catch (error) {
      console.error('获取酒店详情失败:', error);
      Taro.showToast({
        title: '获取酒店详情失败，请重试',
        icon: 'none'
      });
      setHotelInfo(null);
      setRooms([]);
    }
  };

  const handleBackClick = () => {
    try {
      Taro.navigateBack({
        delta: 1,
        success: () => {
        },
        fail: (error) => {
          console.error('返回失败:', error);
          Taro.navigateTo({
            url: '/pages/index/index'
          });
        }
      });
    } catch (error) {
      console.error('返回操作异常:', error);
    }
  };

  const handleCollectClick = async () => {
    try {
      const token = Taro.getStorageSync('token');
      if (!token) {
        Taro.showToast({
          title: '请先登录',
          icon: 'none'
        });
        Taro.navigateTo({
          url: '/pages/login/login'
        });
        return;
      }

      const response = await favoriteApi[collected ? 'removeFavorite' : 'addFavorite'](hotelId);
      if (response.code === 0) {
        setCollected(!collected);
        Taro.showToast({
          title: collected ? '取消收藏成功' : '收藏成功',
          icon: 'success'
        });
        // 触发收藏状态变化事件，通知其他页面更新收藏状态
        Taro.eventCenter.trigger('favoritesChanged', { hotelId, collected: !collected });
      } else {
        Taro.showToast({
          title: response.msg || (collected ? '取消收藏失败' : '收藏失败'),
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      Taro.showToast({
        title: '操作失败，请重试',
        icon: 'none'
      });
    }
  };

  const handleBookClick = (room) => {
    const averagePrice = getAveragePrice(room);
    const totalPrice = getTotalPrice(room);
    const roomName = room.name || room.room_name || room.room_type_name || '房型';
    const hotelName = hotelInfo?.hotel_name_cn || hotelInfo?.name || '';
    Taro.setStorageSync('bookingConfirmPayload', {
      hotelId,
      roomId: room.id,
      roomName,
      hotelName,
      price: averagePrice,
      totalPrice,
      check_in_date: checkInDate,
      check_out_date: checkOutDate
    });
    Taro.navigateTo({
      url: `/pages/booking-confirm/index`
    });
  };

  const handleDateConfirm = (checkIn, checkOut) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
    setShowDateSelector(false);
  };

  const toggleRoomExpand = (roomId) => {
    setExpandedRooms(prev => ({
      ...prev,
      [roomId]: !prev[roomId]
    }));
  };

  const getAveragePrice = (room) => {
    const priceList = Array.isArray(room.prices) ? room.prices : [];
    const priceMap = new Map(
      priceList.map(item => [item.date, Number(item.price)])
    );
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const rangePrices = [];
    if (checkInDate && checkOutDate && end > start) {
      const cursor = new Date(start);
      while (cursor < end) {
        const key = formatDate(cursor);
        if (priceMap.has(key)) {
          const value = priceMap.get(key);
          if (Number.isFinite(value)) {
            rangePrices.push(value);
          }
        }
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    const pricesToUse = rangePrices.length ? rangePrices : priceList.map(p => Number(p.price)).filter(v => Number.isFinite(v));
    if (!pricesToUse.length) return 0;
    const sum = pricesToUse.reduce((acc, value) => acc + value, 0);
    return Math.round(sum / pricesToUse.length);
  };

  const getTotalPrice = (room) => {
    const priceList = Array.isArray(room.prices) ? room.prices : [];
    const priceMap = new Map(
      priceList.map(item => [item.date, Number(item.price)])
    );
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    let total = 0;
    if (checkInDate && checkOutDate && end > start) {
      const cursor = new Date(start);
      while (cursor < end) {
        const key = formatDate(cursor);
        if (priceMap.has(key)) {
          const value = priceMap.get(key);
          if (Number.isFinite(value)) {
            total += value;
          }
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      if (total > 0) return Math.round(total);
    }
    const averagePrice = getAveragePrice(room);
    const nights = calculateNights(checkInDate, checkOutDate);
    if (!averagePrice || !nights) return 0;
    return Math.round(averagePrice * nights);
  };

  const nightCount = useMemo(() => calculateNights(checkInDate, checkOutDate), [checkInDate, checkOutDate]);
  const heroImages = useMemo(() => {
    const list = hotelInfo?.main_image_url;
    const normalized = Array.isArray(list) ? list.filter(Boolean) : [];
    if (normalized.length) {
      return normalized;
    }
    return ['https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20hotel%20exterior%20building%20architecture&image_size=landscape_4_3'];
  }, [hotelInfo]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [hotelInfo]);

  return (
    <View className="hotel-detail-page">
      <View className="back-btn" style={{ cursor: 'pointer' }} onClick={handleBackClick}>
        <Text className="back-icon">←</Text>
        <Text className="back-text">返回</Text>
      </View>

      {loading && (
        <View className="loading-container">
          <Text className="loading-text">加载中...</Text>
        </View>
      )}

      {!loading && hotelInfo && (
        <ScrollView className="detail-scroll" scrollY>
          <View className="hero-section">
            <Swiper
              className="hero-swiper"
              circular
              indicatorDots={false}
              autoplay={false}
              onChange={(e) => setCurrentImageIndex(e.detail.current)}
            >
              {heroImages.map((url, index) => (
                <SwiperItem key={`${url}-${index}`} className="hero-swiper-item">
                  <Image className="hero-image" src={url} mode="aspectFill" />
                </SwiperItem>
              ))}
            </Swiper>
            <View className="hero-indicators">
              <Text className="hero-indicator-text">{Math.min(currentImageIndex + 1, heroImages.length)}/{heroImages.length}</Text>
            </View>
            <View className="favorite-button" onClick={handleCollectClick}>
              <Text className={`favorite-icon ${collected ? 'active' : ''}`}>★</Text>
            </View>
          </View>

          <View className="hotel-title-section">
            <View className="hotel-title-row">
              <View className="hotel-title-texts">
                <Text className="hotel-title-cn">{hotelInfo.hotel_name_cn}</Text>
                <Text className="hotel-title-en">{hotelInfo.hotel_name_en}</Text>
              </View>
              <View className="hotel-star">
                <Text className="hotel-star-text">{hotelInfo.star_rating}星</Text>
              </View>
            </View>
            {hotelInfo.description && (
              <View className="hotel-description-container">
                <Text className="hotel-description-text">{hotelInfo.description}</Text>
              </View>
            )}
          </View>

          <View className="rating-location-card">
            <View className="rating-block">
              <Text className="rating-score">{hotelInfo.rating}</Text>
              <Text className="rating-count">{hotelInfo.review_count}条评价</Text>
            </View>
            <View className="location-block">
              <Text className="location-address">{hotelInfo.location_info?.formatted_address || ''}</Text>
              <Text className="location-nearby">{hotelInfo.nearby_info || ''}</Text>
              <View className="map-button" onClick={() => setShowMapModal(true)}>
                <Text className="map-button-text">查看地图</Text>
              </View>
            </View>
          </View>

          <View className="info-card">
            <Text className="info-title">服务与设施</Text>
            <View className="facilities-services-group">
              <View className="fs-row">
                <Text className="fs-label">服务</Text>
                <ScrollView scrollX className="h-scroll" enhanced>
                  <View className="h-scroll-inner">
                    {(hotelInfo.services || []).map((service, index) => (
                      <View key={`${service.id || service.name || index}`} className="chip">
                        <Text className="chip-text">{service.name || service.id || service}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
              <View className="fs-divider" />
              <View className="fs-row">
                <Text className="fs-label">设施</Text>
                <ScrollView scrollX className="h-scroll" enhanced>
                  <View className="h-scroll-inner">
                    {(hotelInfo.facilities || []).map((facility, index) => (
                      <View key={`${facility.id || facility.name || index}`} className="chip">
                        <Text className="chip-text">{facility.name || facility.id || facility}</Text>
                      </View>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>

          <View className="info-card">
            <Text className="info-title">政策</Text>
            <View className="policy-table">
              <View className="policy-row">
                <Text className="policy-label">取消</Text>
                <Text className="policy-value">{hotelInfo.policies?.cancellation || '-'}</Text>
              </View>
              <View className="policy-row">
                <Text className="policy-label">支付</Text>
                <Text className="policy-value">{hotelInfo.policies?.payment || '-'}</Text>
              </View>
              <View className="policy-row">
                <Text className="policy-label">儿童</Text>
                <Text className="policy-value">{hotelInfo.policies?.children || '-'}</Text>
              </View>
              <View className="policy-row">
                <Text className="policy-label">宠物</Text>
                <Text className="policy-value">{hotelInfo.policies?.pets || '-'}</Text>
              </View>
            </View>
          </View>

          <View className="date-card">
            <View className="date-item" onClick={() => setShowDateSelector(true)}>
              <Text className="date-label">入住</Text>
              <Text className="date-value">{checkInDate}</Text>
            </View>
            <View className="date-separator">
              <Text className="date-night">{nightCount}晚</Text>
            </View>
            <View className="date-item" onClick={() => setShowDateSelector(true)}>
              <Text className="date-label">离店</Text>
              <Text className="date-value">{checkOutDate}</Text>
            </View>
          </View>

          <View className="room-list-section">
            {rooms.map(room => {
              const averagePrice = getAveragePrice(room);
              const isExpanded = !!expandedRooms[room.id];
              return (
                <View key={room.id} className={`room-card ${isExpanded ? 'expanded' : ''}`}>
                  <Image className="room-card-image" src={room.room_image_url || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hotel%20room%20interior%20default%20placeholder&image_size=landscape_4_3'} mode="aspectFill" />
                  <View className="room-card-body">
                    <View className="room-card-header">
                      <Text className="room-card-name">{room.name}</Text>
                      <Text className="room-card-price">¥{averagePrice}/晚</Text>
                    </View>
                    <Text className="room-card-meta">{room.bed_type} | {room.area}㎡</Text>
                    <Text className="room-card-desc">{room.description}</Text>
                    <View className="room-chip-row">
                      {(room.tags || []).map((tag, index) => (
                        <View key={`${tag}-${index}`} className="tag-chip">
                          <Text className="tag-chip-text">{tag}</Text>
                        </View>
                      ))}
                    </View>
                    <View className="room-info-row">
                      <Text className="room-info-label">设施</Text>
                      <View className="room-info-chips">
                        {(room.facilities || []).map((item, index) => (
                          <View key={`${item.name || item.id || item}-${index}`} className="info-chip">
                            <Text className="info-chip-text">{item.name || item.id || item}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    <View className="room-info-row">
                      <Text className="room-info-label">服务</Text>
                      <View className="room-info-chips">
                        {(room.services || []).map((item, index) => (
                          <View key={`${item.name || item.id || item}-${index}`} className="info-chip">
                            <Text className="info-chip-text">{item.name || item.id || item}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    <View className="room-card-footer">
                      <View className="price-tag">
                        <Text className="price-tag-value">¥{averagePrice}</Text>
                        <Text className="price-tag-unit">均价/晚</Text>
                      </View>
                      <View
                        className="book-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookClick({ ...room, price: averagePrice });
                        }}
                      >
                        立即预订
                      </View>
                    </View>
                    
                    <View className="room-expand-button" onClick={() => toggleRoomExpand(room.id)}>
                      <Text className="room-expand-text">{isExpanded ? '收起政策' : '查看政策'}</Text>
                      <Text className={`room-expand-icon ${isExpanded ? 'expanded' : ''}`}>⌄</Text>
                    </View>

                    {isExpanded && (
                      <View className="policy-table">
                        <View className="policy-row">
                          <Text className="policy-label">取消</Text>
                          <Text className="policy-value">{room.policies?.cancellation || '-'}</Text>
                        </View>
                        <View className="policy-row">
                          <Text className="policy-label">支付</Text>
                          <Text className="policy-value">{room.policies?.payment || '-'}</Text>
                        </View>
                        <View className="policy-row">
                          <Text className="policy-label">儿童</Text>
                          <Text className="policy-value">{room.policies?.children || '-'}</Text>
                        </View>
                        <View className="policy-row">
                          <Text className="policy-label">宠物</Text>
                          <Text className="policy-value">{room.policies?.pets || '-'}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {!loading && !hotelId && (
        <View className="content-container">
          <Text className="hotel-id">酒店ID: 未获取到</Text>
          <Text className="page-title">酒店详情页</Text>
          <Text className="page-desc">请从正确的入口进入酒店详情页</Text>
        </View>
      )}

      <DateSelector
        visible={showDateSelector}
        onCancel={() => setShowDateSelector(false)}
        onConfirm={handleDateConfirm}
        initialCheckIn={checkInDate}
        initialCheckOut={checkOutDate}
      />

      {showMapModal && (
        <View className="map-modal" onClick={() => setShowMapModal(false)}>
          <View className="map-modal-content" onClick={(e) => e.stopPropagation()}>
            <View className="map-modal-header">
              <Text className="map-modal-title">地图位置</Text>
              <View className="map-modal-close" onClick={() => setShowMapModal(false)}>
                <Text className="map-modal-close-text">✕</Text>
              </View>
            </View>
            <View className="map-container" ref={mapWrapperRef} />
          </View>
        </View>
      )}
    </View>
  );
}
