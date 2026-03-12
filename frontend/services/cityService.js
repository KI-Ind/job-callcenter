import api from './api';

/**
 * Service for handling city-related API calls
 */
const cityService = {
  /**
   * Get all cities
   * @returns {Promise} Promise object with cities data
   */
  getAllCities: async () => {
    try {
      const response = await api.get('/cities');
      return response.data;
    } catch (error) {
      console.error('Error fetching cities:', error);
      throw error;
    }
  },

  /**
   * Get city by postal code
   * @param {string} postalCode - The postal code to search for
   * @returns {Promise} Promise object with city data
   */
  getCityByPostalCode: async (postalCode) => {
    try {
      const response = await api.get(`/cities/${postalCode}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching city with postal code ${postalCode}:`, error);
      throw error;
    }
  }
};

export default cityService;
