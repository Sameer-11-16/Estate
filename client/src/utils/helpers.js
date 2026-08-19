export const formatPrice = (price) => {
  if (!price && price !== 0) return '—';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString('en-IN')}`;
};

export const formatArea = (area, unit) => {
  if (!area) return '—';
  return `${area.toLocaleString('en-IN')} ${unit || 'sqft'}`;
};

export const getImageUrl = (path) => {
  if (!path) return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const backendBase = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
  return backendBase ? `${backendBase}${path}` : path;
};

export const getStatusColor = (status) => {
  const map = {
    Available: 'success',
    Sold: 'error',
    Pending: 'warning',
    Rejected: 'error',
  };
  return map[status] || 'info';
};

export const getLandTypeColor = (type) => {
  const map = {
    Residential: 'primary',
    Commercial: 'accent',
    Agricultural: 'success',
    Industrial: 'info',
    'Mixed Use': 'warning',
  };
  return map[type] || 'info';
};

export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = [
    [31536000, 'year'], [2592000, 'month'], [86400, 'day'],
    [3600, 'hour'], [60, 'minute'],
  ];
  for (const [secs, label] of intervals) {
    const n = Math.floor(seconds / secs);
    if (n >= 1) return `${n} ${label}${n > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
};
