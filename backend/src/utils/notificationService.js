/**
 * Unified notification service that handles both in-app and email notifications
 */

const User = require('../models/user.model');
const Notification = require('../models/Notification');
const { sendNotificationToUser } = require('./socket');
const { sendApplicationStatusEmail, sendNewJobEmail } = require('./emailService');

/**
 * Create an in-app notification and send real-time update if possible
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} - Created notification
 */
const createNotification = async (notificationData) => {
  try {
    // Create notification in database
    const notification = await Notification.create(notificationData);
    
    // Send real-time notification via WebSocket
    sendNotificationToUser(notificationData.user.toString(), notification);
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Send application status change notification (in-app + email)
 * @param {Object} options - Notification options
 * @param {String} options.userId - User ID (candidate)
 * @param {String} options.jobTitle - Job title
 * @param {String} options.jobId - Job ID
 * @param {String} options.applicationId - Application ID
 * @param {String} options.companyName - Company name
 * @param {String} options.status - New application status
 * @returns {Promise<Object>} - Created notification
 */
const sendApplicationStatusNotification = async (options) => {
  try {
    // Get user details for email
    const user = await User.findById(options.userId);
    if (!user) {
      throw new Error(`User not found with ID: ${options.userId}`);
    }
    
    // Create notification title and content based on status
    let title = '';
    let content = '';
    
    switch(options.status) {
      case 'Examinée':
        title = 'Candidature en cours d\'examen';
        content = `Votre candidature pour le poste "${options.jobTitle}" est en cours d'examen.`;
        break;
      case 'Entretien':
        title = 'Invitation à un entretien';
        content = `Félicitations! Vous êtes invité(e) à un entretien pour le poste "${options.jobTitle}".`;
        break;
      case 'Acceptée':
        title = 'Candidature acceptée';
        content = `Félicitations! Votre candidature pour le poste "${options.jobTitle}" a été acceptée.`;
        break;
      case 'Rejetée':
        title = 'Candidature non retenue';
        content = `Nous sommes désolés, votre candidature pour le poste "${options.jobTitle}" n'a pas été retenue.`;
        break;
      default:
        title = 'Mise à jour de candidature';
        content = `Le statut de votre candidature pour le poste "${options.jobTitle}" a été mis à jour.`;
    }
    
    // Create in-app notification
    const notification = await createNotification({
      user: options.userId,
      title,
      content,
      type: 'application',
      link: `/dashboard/candidat/candidatures/${options.applicationId}`,
      read: false
    });
    
    // Send email notification if user has email notifications enabled
    if (user.notificationSettings?.emailNotifications && 
        user.notificationSettings?.applicationUpdates !== false) {
      try {
        await sendApplicationStatusEmail({
          to: user.email,
          candidateName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          jobTitle: options.jobTitle,
          status: options.status,
          companyName: options.companyName,
          applicationId: options.applicationId
        });
      } catch (emailError) {
        console.error('Error sending application status email:', emailError);
        // Don't fail if email sending fails
      }
    }
    
    return notification;
  } catch (error) {
    console.error('Error sending application status notification:', error);
    throw error;
  }
};

/**
 * Send new job notification (in-app + email)
 * @param {Object} options - Notification options
 * @param {String} options.userId - User ID (candidate)
 * @param {String} options.jobTitle - Job title
 * @param {String} options.jobId - Job ID
 * @param {String} options.companyName - Company name
 * @param {String} options.location - Job location
 * @returns {Promise<Object>} - Created notification
 */
const sendNewJobNotification = async (options) => {
  try {
    // Get user details for email
    const user = await User.findById(options.userId);
    if (!user) {
      throw new Error(`User not found with ID: ${options.userId}`);
    }
    
    // Create in-app notification
    const notification = await createNotification({
      user: options.userId,
      title: 'Nouvelle offre d\'emploi disponible',
      content: `${options.companyName} a publié une nouvelle offre : ${options.jobTitle} à ${options.location}`,
      type: 'job',
      link: `/jobs/${options.jobId}`,
      read: false
    });
    
    // Send email notification if user has email notifications enabled
    if (user.notificationSettings?.emailNotifications && 
        user.notificationSettings?.jobRecommendations !== false) {
      try {
        await sendNewJobEmail({
          to: user.email,
          candidateName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          jobTitle: options.jobTitle,
          companyName: options.companyName,
          location: options.location,
          jobId: options.jobId
        });
      } catch (emailError) {
        console.error('Error sending new job email:', emailError);
        // Don't fail if email sending fails
      }
    }
    
    return notification;
  } catch (error) {
    console.error('Error sending new job notification:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  sendApplicationStatusNotification,
  sendNewJobNotification
};
