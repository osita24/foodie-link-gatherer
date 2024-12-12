export const getShareableUrl = (placeId: string | undefined) => {
  if (!placeId) return window.location.href;
  
  // Construct the full URL using window.location.origin to ensure we get the correct base URL
  return `${window.location.origin}/restaurant/${placeId}`;
};