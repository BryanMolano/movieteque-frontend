export const USER_LOCALE = navigator.language || 'en-US';
export const USER_LANGUAGE= USER_LOCALE.split('-')[0]; 
export const USER_REGION = USER_LOCALE.split('-')[1] || 'US'; 
