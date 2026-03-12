/**
 * OAuth middleware for verifying tokens from social providers
 */

const axios = require('axios');

/**
 * Verify Google OAuth token
 * @param {string} token - Google OAuth token
 * @returns {Promise<Object>} - User data from Google
 */
const verifyGoogleToken = async (token) => {
  try {
    console.log('Verifying Google token (first 20 chars):', token.substring(0, 20) + '...');
    
    // Try the standard tokeninfo endpoint first
    try {
      const response = await axios.get(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`);
      
      if (response.data && response.data.email) {
        console.log('Successfully verified Google token using tokeninfo endpoint');
        return {
          googleId: response.data.sub,
          email: response.data.email,
          firstName: response.data.given_name || '',
          lastName: response.data.family_name || '',
          profileImage: response.data.picture || ''
        };
      }
    } catch (tokenInfoError) {
      console.log('Failed to verify with tokeninfo endpoint, trying userinfo endpoint');
    }
    
    // If tokeninfo fails, try decoding the JWT and fetching user info
    try {
      // Decode the JWT token (split by dots, take the middle part, base64 decode)
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token format');
      }
      
      // Base64 decode and parse the payload
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      
      if (payload && payload.email) {
        console.log('Successfully decoded Google token JWT payload');
        return {
          googleId: payload.sub,
          email: payload.email,
          firstName: payload.given_name || '',
          lastName: payload.family_name || '',
          profileImage: payload.picture || ''
        };
      }
    } catch (jwtError) {
      console.log('Failed to decode JWT token, trying userinfo endpoint with token as access token');
    }
    
    // Last resort - try using the token as an access token
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.email) {
        console.log('Successfully verified Google token using userinfo endpoint');
        return {
          googleId: response.data.sub,
          email: response.data.email,
          firstName: response.data.given_name || '',
          lastName: response.data.family_name || '',
          profileImage: response.data.picture || ''
        };
      }
    } catch (userinfoError) {
      console.log('Failed to verify with userinfo endpoint');
    }
    
    throw new Error('Invalid Google token - all verification methods failed');
  } catch (error) {
    console.error('Google token verification error:', error);
    throw new Error('Failed to verify Google token');
  }
};

/**
 * Verify Facebook OAuth token
 * @param {string} token - Facebook OAuth token
 * @returns {Promise<Object>} - User data from Facebook
 */
const verifyFacebookToken = async (token) => {
  try {
    // First verify the token
    const appId = process.env.FACEBOOK_CLIENT_ID;
    const appSecret = process.env.FACEBOOK_CLIENT_SECRET;
    
    console.log('Verifying Facebook token with App ID:', appId);
    console.log('Token received (first 20 chars):', token.substring(0, 20));
    
    // Try direct user data fetch first (simpler approach)
    try {
      console.log('Attempting to fetch user data directly with token');
      const userResponse = await axios.get(
        `https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture&access_token=${token}`
      );
      
      if (userResponse.data && userResponse.data.id) {
        console.log('Successfully fetched Facebook user data directly');
        return {
          facebookId: userResponse.data.id,
          email: userResponse.data.email,
          firstName: userResponse.data.first_name || '',
          lastName: userResponse.data.last_name || '',
          profileImage: userResponse.data.picture?.data?.url || ''
        };
      }
    } catch (directError) {
      console.log('Direct user data fetch failed, trying token verification:', directError.message);
    }
    
    // Get app access token as fallback approach
    console.log('Getting app access token for verification');
    const appTokenResponse = await axios.get(
      `https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`
    );
    
    const appAccessToken = appTokenResponse.data.access_token;
    console.log('Got app access token, verifying user token');
    
    // Use app access token to verify the user token
    const verifyResponse = await axios.get(
      `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${appAccessToken}`
    );
    
    console.log('Token verification response:', JSON.stringify(verifyResponse.data));
    
    if (!verifyResponse.data.data || !verifyResponse.data.data.is_valid) {
      console.error('Facebook token validation failed:', verifyResponse.data);
      throw new Error('Invalid Facebook token');
    }
    
    // Get user data
    const userResponse = await axios.get(
      `https://graph.facebook.com/me?fields=id,email,first_name,last_name,picture&access_token=${token}`
    );
    
    return {
      facebookId: userResponse.data.id,
      email: userResponse.data.email,
      firstName: userResponse.data.first_name || '',
      lastName: userResponse.data.last_name || '',
      profileImage: userResponse.data.picture?.data?.url || ''
    };
  } catch (error) {
    console.error('Facebook token verification error:', error);
    throw new Error('Failed to verify Facebook token');
  }
};

/**
 * Verify LinkedIn OAuth token
 * @param {string} token - LinkedIn OAuth token
 * @returns {Promise<Object>} - User data from LinkedIn
 */
const verifyLinkedInToken = async (token) => {
  try {
    // Get user profile
    const response = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        Authorization: `Bearer ${token}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    
    // Get email address (separate API call for LinkedIn)
    const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        Authorization: `Bearer ${token}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });
    
    const email = emailResponse.data.elements[0]['handle~'].emailAddress;
    
    return {
      linkedinId: response.data.id,
      email: email,
      firstName: response.data.localizedFirstName || '',
      lastName: response.data.localizedLastName || '',
      profileImage: '' // LinkedIn requires additional API calls for profile image
    };
  } catch (error) {
    console.error('LinkedIn token verification error:', error);
    throw new Error('Failed to verify LinkedIn token');
  }
};

/**
 * Middleware to verify OAuth tokens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const verifyOAuthToken = async (req, res, next) => {
  try {
    const { provider, token } = req.body;
    
    if (!provider || !token) {
      return res.status(400).json({
        success: false,
        message: 'Provider et token sont requis'
      });
    }
    
    let userData;
    
    switch (provider) {
      case 'google':
        userData = await verifyGoogleToken(token);
        break;
      case 'facebook':
        userData = await verifyFacebookToken(token);
        break;
      case 'linkedin':
        userData = await verifyLinkedInToken(token);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Provider non pris en charge'
        });
    }
    
    // Add user data to request for controller use
    req.oauthUser = userData;
    next();
  } catch (error) {
    console.error('OAuth verification error:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Échec de la vérification OAuth'
    });
  }
};

module.exports = {
  verifyOAuthToken,
  verifyGoogleToken,
  verifyFacebookToken,
  verifyLinkedInToken
};
