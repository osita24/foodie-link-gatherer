type EventName = 
  | 'view_restaurant'
  | 'save_restaurant'
  | 'share_restaurant'
  | 'view_menu'
  | 'get_directions'
  | 'view_photos'
  | 'view_reviews';

interface EventProperties {
  restaurantId?: string;
  restaurantName?: string;
  userId?: string;
  [key: string]: any;
}

export const trackEvent = (eventName: EventName, properties: EventProperties = {}) => {
  // For now, just log to console. In production, this would send to an analytics service
  console.log(`📊 Analytics Event:`, {
    event: eventName,
    properties: {
      timestamp: new Date().toISOString(),
      ...properties
    }
  });
};

export const initializeAnalytics = () => {
  // This would initialize your analytics service in production
  console.log('🔄 Analytics initialized');
};