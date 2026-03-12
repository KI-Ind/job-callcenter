const Newsletter = require('../models/newsletter.model');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email'
      });
    }

    // Check if email already exists
    let subscriber = await Newsletter.findOne({ email });

    if (subscriber) {
      // If already exists but unsubscribed, resubscribe
      if (!subscriber.isSubscribed) {
        subscriber.isSubscribed = true;
        subscriber.unsubscribedAt = null;
        subscriber.subscribedAt = Date.now();
        await subscriber.save();
        
        return res.status(200).json({
          success: true,
          message: 'Vous êtes réabonné à notre newsletter',
          data: subscriber
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà abonné à notre newsletter'
      });
    }

    // Create new subscriber
    subscriber = await Newsletter.create({
      email,
      subscribedAt: Date.now()
    });

    res.status(201).json({
      success: true,
      message: 'Merci de vous être abonné à notre newsletter',
      data: subscriber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'abonnement à la newsletter',
      error: error.message
    });
  }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email'
      });
    }

    // Find subscriber
    const subscriber = await Newsletter.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Cet email n\'est pas abonné à notre newsletter'
      });
    }

    // Update subscriber
    subscriber.isSubscribed = false;
    subscriber.unsubscribedAt = Date.now();
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: 'Vous êtes désabonné de notre newsletter',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du désabonnement de la newsletter',
      error: error.message
    });
  }
};

// @desc    Get all subscribers
// @route   GET /api/newsletter/subscribers
// @access  Private (Admin only)
exports.getSubscribers = async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ isSubscribed: true }).sort('-subscribedAt');

    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des abonnés',
      error: error.message
    });
  }
};
