'use client';

import authService from './authService';

/**
 * OAuth service for handling social login flows
 */
const oauthService = {
  // Temporary storage for user data during role selection
  _tempUserData: null,
  isFirstTimeLogin: false,
  _initialized: {
    google: false,
    facebook: false,
    linkedin: false
  },
  
  /**
   * Initialize Google OAuth
   * @returns {Promise<void>}
   */
  initGoogleAuth: async () => {
    console.log('Initializing Google Auth');
    
    try {
      // Force re-initialization if we're coming from a logout
      if (window.google && window.google.accounts && !oauthService._initialized.google) {
        console.log('Google SDK already loaded, but needs re-initialization');
        oauthService._initialized.google = true;
        return;
      } else if (window.google && window.google.accounts) {
        console.log('Google SDK already loaded and initialized');
        return;
      }

      return new Promise((resolve, reject) => {
        console.log('Loading Google SDK...');
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log('Google SDK loaded successfully');
          // Initialize Google Identity Services
          if (window.google && window.google.accounts) {
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
            console.log('Google Client ID:', clientId); // Debug log
            
            if (!clientId) {
              console.error('Google Client ID is missing');
              reject(new Error('Google Client ID is missing'));
              return;
            }
            
            try {
              window.google.accounts.id.initialize({
                client_id: clientId,
                auto_select: false,
                callback: (response) => {
                  console.log('Google auto callback triggered');
                }
              });
              console.log('Google Identity Services initialized');
              oauthService._initialized.google = true;
              resolve();
            } catch (error) {
              console.error('Error initializing Google Identity Services:', error);
              oauthService._initialized.google = false;
              reject(error);
            }
          } else {
            reject(new Error('Google accounts not available after script load'));
          }
        };
        script.onerror = (error) => {
          console.error('Error loading Google SDK:', error);
          reject(new Error('Failed to load Google SDK'));
        };
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
      throw error;
    }
  },

  /**
   * Sign in with Google
   * @param {string} role - User role (candidat or employeur), null for first check
   * @returns {Promise<Object>} - Auth response
   */
  signInWithGoogle: async (role = null) => {
    console.log('Starting Google sign in process');
    
    // Reset state if needed to ensure clean login attempt
    if (!oauthService._initialized.google) {
      console.log('Google auth not initialized, resetting state first');
      oauthService.resetOAuthState();
    }
    try {
      await oauthService.initGoogleAuth();
      console.log('Google Auth initialized, attempting sign in');
      
      if (!window.google || !window.google.accounts) {
        console.error('Google Identity Services not available');
        throw new Error('Google authentication is not available');
      }
      
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      // Use Google Identity Services for authentication with ID token
      const googleResponse = await new Promise((resolve, reject) => {
        try {
          // Create a button container that we'll use for the sign-in
          const buttonContainer = document.createElement('div');
          buttonContainer.style.display = 'none';
          document.body.appendChild(buttonContainer);
          
          // Configure the callback that will be called when the user signs in
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              if (response && response.credential) {
                // Clean up the temporary button container
                if (buttonContainer.parentNode) {
                  buttonContainer.parentNode.removeChild(buttonContainer);
                }
                resolve(response);
              } else {
                reject(new Error('Failed to get Google ID token'));
              }
            },
            error_callback: (error) => {
              console.error('Google Sign-In error:', error);
              reject(error);
            }
          });
          
          // Render the sign-in button and click it programmatically
          window.google.accounts.id.renderButton(
            buttonContainer,
            { theme: 'outline', size: 'large', type: 'standard' }
          );
          
          // Trigger the sign-in flow
          window.google.accounts.id.prompt((notification) => {
            console.log('Google prompt notification:', notification);
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              console.log('Google One Tap is not displayed or was skipped, using button');
              // Find the button in our container and click it
              const button = buttonContainer.querySelector('div[role="button"]');
              if (button) {
                button.click();
              } else {
                reject(new Error('Could not find Google sign-in button'));
              }
            }
          });
        } catch (error) {
          console.error('Error during Google Sign-In:', error);
          reject(error);
        }
      });
      
      console.log('Google sign in successful, got credential:', googleResponse.credential ? 'yes' : 'no');
      
      // The ID token contains all the user information we need
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(googleResponse.credential.split('.')[1]));
      console.log('Decoded Google ID token payload:', payload);
      
      // Extract profile information from the ID token
      const profile = {
        getId: () => payload.sub,
        getName: () => payload.name,
        getGivenName: () => payload.given_name,
        getFamilyName: () => payload.family_name,
        getEmail: () => payload.email,
        getImageUrl: () => payload.picture
      };
      
      // Use the ID token for backend verification
      const id_token = googleResponse.credential;
      
      // Prepare user data for backend
      const userData = {
        googleId: profile.getId(),
        email: profile.getEmail(),
        firstName: profile.getGivenName(),
        lastName: profile.getFamilyName(),
        profileImage: profile.getImageUrl(),
        token: id_token,
        provider: 'google',
        role
      };
      
      // If no role is provided, check if user exists first
      if (!role) {
        try {
          // First, check if user exists without specifying role
          const checkResponse = await authService.googleAuth({
            ...userData,
            checkOnly: true
          });
          
          // If user exists, proceed with normal login
          if (checkResponse.userExists) {
            return await authService.googleAuth(userData);
          } else {
            // Store data temporarily and indicate first-time login
            oauthService._tempUserData = userData;
            oauthService.isFirstTimeLogin = true;
            return {
              success: false,
              needsRoleSelection: true,
              email: userData.email,
              provider: 'google'
            };
          }
        } catch (error) {
          console.error('Error checking user existence:', error);
          throw error;
        }
      }
      
      // Call our backend auth service with specified role
      return await authService.googleAuth(userData);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },

  /**
   * Initialize Facebook OAuth
   * @returns {Promise<void>}
   */
  initFacebookAuth: async () => {
    console.log('Initializing Facebook Auth');
    // Load Facebook SDK if not already loaded
    if (!window.FB) {
      console.log('Loading Facebook SDK');
      try {
        await new Promise((resolve, reject) => {
          window.fbAsyncInit = function() {
            console.log('Facebook SDK loaded, initializing');
            try {
              const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
              console.log('Facebook App ID:', facebookAppId);
              
              if (!facebookAppId) {
                console.error('Facebook App ID is missing');
                reject(new Error('Facebook App ID is missing'));
                return;
              }
              
              window.FB.init({
                appId: facebookAppId,
                cookie: true,
                xfbml: true,
                version: 'v12.0'
              });
              console.log('Facebook SDK initialized successfully');
              resolve();
            } catch (error) {
              console.error('Error initializing Facebook SDK:', error);
              reject(error);
            }
          };
          
          const script = document.createElement('script');
          script.src = 'https://connect.facebook.net/en_US/sdk.js';
          script.async = true;
          script.defer = true;
          script.onload = () => console.log('Facebook script loaded');
          script.onerror = (error) => {
            console.error('Error loading Facebook script:', error);
            reject(error);
          };
          document.head.appendChild(script);
        });
      } catch (error) {
        console.error('Error in Facebook initialization:', error);
        throw error;
      }
    } else {
      console.log('Facebook SDK already loaded');
    }
  },

  /**
   * Sign in with Facebook
   * @param {string} role - User role (candidat or employeur), null for first check
   * @returns {Promise<Object>} - Auth response
   */
  signInWithFacebook: async (role = null) => {
    console.log('Starting Facebook sign in process');
    try {
      await oauthService.initFacebookAuth();
      console.log('Facebook Auth initialized, attempting login');
      
      if (!window.FB) {
        console.error('Facebook SDK not available');
        throw new Error('Facebook authentication is not available');
      }
      
      // Ensure FB is fully initialized before proceeding
      await new Promise((resolve) => {
        const checkFBInit = () => {
          if (window.FB && window.FB.login) {
            console.log('Facebook SDK fully initialized');
            resolve();
          } else {
            console.log('Waiting for Facebook SDK to fully initialize...');
            setTimeout(checkFBInit, 100);
          }
        };
        checkFBInit();
      });
      
      const fbResponse = await new Promise((resolve, reject) => {
        console.log('Calling FB.login...');
        window.FB.login((response) => {
          if (response.authResponse) {
            console.log('Facebook login successful', response);
            console.log('Auth response token:', response.authResponse.accessToken);
            resolve(response);
          } else {
            console.error('Facebook login cancelled or failed');
            reject(new Error('Facebook login cancelled or failed'));
          }
        }, { scope: 'email,public_profile' });
      });
      
      // Get user profile data
      const userProfile = await new Promise((resolve, reject) => {
        window.FB.api('/me', { fields: 'id,email,first_name,last_name,picture' }, (response) => {
          if (response && !response.error) {
            resolve(response);
          } else {
            reject(response?.error || new Error('Failed to get Facebook profile'));
          }
        });
      });
      
      // Prepare user data for backend
      const userData = {
        facebookId: userProfile.id,
        email: userProfile.email,
        firstName: userProfile.first_name,
        lastName: userProfile.last_name,
        profileImage: userProfile.picture?.data?.url || '',
        role,
        token: fbResponse.authResponse.accessToken, // Send token for verification
        provider: 'facebook'
      };
      
      console.log('Facebook user data prepared:', {
        ...userData,
        token: userData.token ? `${userData.token.substring(0, 20)}...` : 'no token'
      });
      
      // If no role is provided, check if user exists first
      if (!role) {
        try {
          console.log('No role provided, checking if user exists');
          // First, check if user exists without specifying role
          const checkResponse = await authService.facebookAuth({
            ...userData,
            checkOnly: true
          });
          
          console.log('User existence check response:', checkResponse);
          
          // If user exists, proceed with normal login
          if (checkResponse.userExists) {
            console.log('User exists, proceeding with normal login');
            return await authService.facebookAuth(userData);
          } else {
            console.log('New user, storing data and showing role selection');
            // Store data temporarily and indicate first-time login
            oauthService._tempUserData = userData;
            oauthService.isFirstTimeLogin = true;
            return {
              success: false,
              needsRoleSelection: true,
              email: userData.email,
              provider: 'facebook'
            };
          }
        } catch (error) {
          console.error('Error checking user existence:', error);
          throw error;
        }
      }
      
      // Call our backend auth service with specified role
      return await authService.facebookAuth(userData);
    } catch (error) {
      console.error('Facebook sign in error:', error);
      throw error;
    }
  },

  /**
   * Initialize LinkedIn OAuth
   * @returns {Promise<void>}
   */
  initLinkedInAuth: async () => {
    console.log('Initializing LinkedIn Auth');
    // LinkedIn OAuth requires a server-side implementation
    // This is a simplified client-side approach
    if (!window.IN) {
      console.log('Loading LinkedIn SDK');
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://platform.linkedin.com/in.js';
          const linkedinClientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
          console.log('LinkedIn Client ID:', linkedinClientId);
          
          if (!linkedinClientId) {
            console.error('LinkedIn Client ID is missing');
            reject(new Error('LinkedIn Client ID is missing'));
            return;
          }
          
          script.innerHTML = `
            api_key: ${linkedinClientId}
            authorize: true
          `;
          script.async = true;
          script.defer = true;
          script.onload = () => {
            console.log('LinkedIn SDK loaded successfully');
            resolve();
          };
          script.onerror = (error) => {
            console.error('Error loading LinkedIn SDK:', error);
            reject(error);
          };
          document.head.appendChild(script);
        });
      } catch (error) {
        console.error('Error in LinkedIn initialization:', error);
        throw error;
      }
    } else {
      console.log('LinkedIn SDK already loaded');
    }
  },

  /**
   * Sign in with LinkedIn
   * @param {string} role - User role (candidat or employeur), null for first check
   * @returns {Promise<Object>} - Auth response
   */
  signInWithLinkedIn: async (role = null) => {
    console.log('Starting LinkedIn sign in process');
    try {
      await oauthService.initLinkedInAuth();
      console.log('LinkedIn Auth initialized, attempting authorization');
      
      if (!window.IN) {
        console.error('LinkedIn SDK not available');
        throw new Error('LinkedIn authentication is not available');
      }
      
      // Request authorization
      const authResponse = await new Promise((resolve, reject) => {
        console.log('Calling IN.User.authorize...');
        window.IN.User.authorize(() => {
          console.log('LinkedIn authorization successful');
          try {
            const auth = window.IN.User.getAuthorization();
            resolve(auth);
          } catch (error) {
            console.error('Error getting LinkedIn authorization:', error);
            reject(error);
          }
        });
      });
      
      // Get basic profile
      const profile = await new Promise((resolve, reject) => {
        window.IN.API.Profile('me').fields([
          'id', 'firstName', 'lastName', 'email-address', 'picture-url'
        ]).result((data) => {
          resolve(data.values[0]);
        }).error(reject);
      });
      
      // Prepare user data for backend
      const userData = {
        linkedinId: profile.id,
        email: profile['email-address'],
        firstName: profile.firstName,
        lastName: profile.lastName,
        profileImage: profile['picture-url'] || '',
        role,
        token: authResponse.access_token, // Send token for verification
        provider: 'linkedin'
      };
      
      // If no role is provided, check if user exists first
      if (!role) {
        try {
          // First, check if user exists without specifying role
          const checkResponse = await authService.linkedinAuth({
            ...userData,
            checkOnly: true
          });
          
          // If user exists, proceed with normal login
          if (checkResponse.userExists) {
            return await authService.linkedinAuth(userData);
          } else {
            // Store data temporarily and indicate first-time login
            oauthService._tempUserData = userData;
            oauthService.isFirstTimeLogin = true;
            return {
              success: false,
              needsRoleSelection: true,
              email: userData.email,
              provider: 'linkedin'
            };
          }
        } catch (error) {
          console.error('Error checking user existence:', error);
          throw error;
        }
      }
      
      // Call our backend auth service with specified role
      return await authService.linkedinAuth(userData);
    } catch (error) {
      console.error('LinkedIn sign in error:', error);
      throw error;
    }
  },
  
  /**
   * Complete social login after role selection
   * @param {string} role - Selected role (candidat or employeur)
   * @returns {Promise<Object>} - Auth response
   */
  completeSocialLogin: async (role) => {
    console.log('Completing social login with role:', role);
    try {
      if (!oauthService._tempUserData) {
        console.error('No temporary user data found');
        throw new Error('No temporary user data found');
      }
      
      // Add the selected role to the stored user data
      const userData = {
        ...oauthService._tempUserData,
        role
      };
      
      console.log('Completing login for provider:', userData.provider);
      
      // Call the appropriate auth service based on the provider
      let response;
      switch (userData.provider) {
        case 'google':
          console.log('Calling googleAuth with role');
          response = await authService.googleAuth(userData);
          break;
        case 'facebook':
          console.log('Calling facebookAuth with role');
          response = await authService.facebookAuth(userData);
          break;
        case 'linkedin':
          console.log('Calling linkedinAuth with role');
          response = await authService.linkedinAuth(userData);
          break;
        default:
          console.error('Unknown provider:', userData.provider);
          throw new Error('Unknown provider');
      }
      
      console.log('Social login completed successfully');
      
      // Clear temporary data
      oauthService.resetTempUserData();
      
      return response;
    } catch (error) {
      console.error('Error completing social login:', error);
      throw error;
    }
  },
  
  /**
   * Reset temporary user data
   */
  resetTempUserData: () => {
    console.log('Resetting temporary user data');
    oauthService._tempUserData = null;
    oauthService.isFirstTimeLogin = false;
  },
  
  /**
   * Reset all OAuth services state
   * Call this after logout to ensure clean state for next login
   */
  resetOAuthState: () => {
    console.log('Resetting all OAuth state');
    oauthService._tempUserData = null;
    oauthService.isFirstTimeLogin = false;
    oauthService._initialized = {
      google: false,
      facebook: false,
      linkedin: false
    };
    
    // Force re-initialization on next login attempt
    if (typeof window !== 'undefined') {
      if (window.google && window.google.accounts) {
        try {
          // Reset Google sign-in state
          window.google.accounts.id.cancel();
          console.log('Cancelled Google sign-in state');
        } catch (e) {
          console.log('Error cancelling Google sign-in:', e);
        }
      }
    }
  }
};

export default oauthService;
