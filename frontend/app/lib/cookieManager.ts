// Cookie management utility functions

type CookieOptions = {
  expires?: Date | number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

type CookiePreferences = {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  targeting: boolean;
}

/**
 * Set a cookie with the given name, value and options
 */
export const setCookie = (name: string, value: string, options: CookieOptions = {}) => {
  if (typeof window === 'undefined') return;

  const cookieOptions = {
    ...options,
    path: options.path || '/',
  };

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (cookieOptions.expires) {
    if (typeof cookieOptions.expires === 'number') {
      const days = cookieOptions.expires;
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      cookieOptions.expires = date;
    }
    cookieString += `;expires=${cookieOptions.expires.toUTCString()}`;
  }

  if (cookieOptions.path) {
    cookieString += `;path=${cookieOptions.path}`;
  }

  if (cookieOptions.domain) {
    cookieString += `;domain=${cookieOptions.domain}`;
  }

  if (cookieOptions.secure) {
    cookieString += ';secure';
  }

  if (cookieOptions.sameSite) {
    cookieString += `;samesite=${cookieOptions.sameSite}`;
  }

  document.cookie = cookieString;
};

/**
 * Get a cookie value by name
 */
export const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  
  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }
  
  return null;
};

/**
 * Delete a cookie by name
 */
export const deleteCookie = (name: string, options: CookieOptions = {}) => {
  setCookie(name, '', {
    ...options,
    expires: -1,
  });
};

/**
 * Get the current cookie preferences
 */
export const getCookiePreferences = (): CookiePreferences => {
  if (typeof window === 'undefined') {
    return {
      essential: true,
      functional: false,
      analytics: false,
      targeting: false
    };
  }

  try {
    const savedPreferences = localStorage.getItem('cookiePreferences');
    if (savedPreferences) {
      return JSON.parse(savedPreferences);
    }
  } catch (error) {
    console.error('Error reading cookie preferences:', error);
  }

  return {
    essential: true,
    functional: false,
    analytics: false,
    targeting: false
  };
};

/**
 * Check if a specific cookie category is allowed
 */
export const isCookieCategoryAllowed = (category: keyof CookiePreferences): boolean => {
  if (category === 'essential') return true; // Essential cookies are always allowed
  
  const preferences = getCookiePreferences();
  return preferences[category];
};

/**
 * Initialize cookies based on user preferences
 * This should be called when the app loads or when preferences change
 */
export const initializeCookies = () => {
  const preferences = getCookiePreferences();
  
  // Always set essential cookies
  // Example: setCookie('session_id', 'xyz', { expires: 7 });
  
  if (preferences.functional) {
    // Set functional cookies
    // Example: setCookie('language', 'fr', { expires: 30 });
  }
  
  if (preferences.analytics) {
    // Initialize analytics (e.g., Google Analytics)
    // This would typically be done by loading the analytics script
  }
  
  if (preferences.targeting) {
    // Initialize targeting/advertising cookies
    // This would typically be done by loading the relevant scripts
  }
};
