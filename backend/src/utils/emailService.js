/**
 * Email notification service for sending email notifications
 */

const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // For production, use actual SMTP settings
  if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } 
  
  // For development, use ethereal.email (fake SMTP service)
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.DEV_EMAIL_USER || 'test@example.com',
      pass: process.env.DEV_EMAIL_PASS || 'password'
    }
  });
};

/**
 * Send an email notification
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email
 * @param {String} options.subject - Email subject
 * @param {String} options.text - Plain text version of the email
 * @param {String} options.html - HTML version of the email
 * @returns {Promise} - Resolves with info about the sent email or rejects with error
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'JobCallCenter <noreply@jobcallcenter.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text
    };
    
    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('Email preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send an application status change notification
 * @param {Object} options - Notification options
 * @param {String} options.to - Recipient email
 * @param {String} options.candidateName - Candidate's name
 * @param {String} options.jobTitle - Job title
 * @param {String} options.status - New application status
 * @param {String} options.companyName - Company name
 * @param {String} options.applicationId - Application ID for link
 * @returns {Promise} - Resolves with info about the sent email
 */
const sendApplicationStatusEmail = async (options) => {
  let subject, text, html;
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const applicationUrl = `${baseUrl}/dashboard/candidat/candidatures/${options.applicationId}`;
  
  switch (options.status) {
    case 'Examinée':
      subject = `Votre candidature pour ${options.jobTitle} est en cours d'examen`;
      text = `Bonjour ${options.candidateName},\n\nVotre candidature pour le poste "${options.jobTitle}" chez ${options.companyName} est maintenant en cours d'examen.\n\nVous pouvez suivre l'état de votre candidature à tout moment en vous connectant à votre tableau de bord.\n\nCordialement,\nL'équipe JobCallCenter`;
      break;
    case 'Entretien':
      subject = `Invitation à un entretien pour ${options.jobTitle}`;
      text = `Bonjour ${options.candidateName},\n\nFélicitations! Vous êtes invité(e) à un entretien pour le poste "${options.jobTitle}" chez ${options.companyName}.\n\nVeuillez consulter votre tableau de bord pour plus de détails sur l'entretien.\n\nCordialement,\nL'équipe JobCallCenter`;
      break;
    case 'Acceptée':
      subject = `Félicitations! Votre candidature pour ${options.jobTitle} a été acceptée`;
      text = `Bonjour ${options.candidateName},\n\nNous sommes ravis de vous informer que votre candidature pour le poste "${options.jobTitle}" chez ${options.companyName} a été acceptée!\n\nVeuillez consulter votre tableau de bord pour les prochaines étapes.\n\nCordialement,\nL'équipe JobCallCenter`;
      break;
    case 'Rejetée':
      subject = `Mise à jour de votre candidature pour ${options.jobTitle}`;
      text = `Bonjour ${options.candidateName},\n\nNous vous remercions de l'intérêt que vous avez porté au poste "${options.jobTitle}" chez ${options.companyName}.\n\nAprès un examen attentif, l'employeur a décidé de poursuivre avec d'autres candidats dont le profil correspond mieux aux exigences du poste.\n\nNous vous encourageons à consulter régulièrement notre site pour d'autres opportunités qui pourraient correspondre à votre profil.\n\nCordialement,\nL'équipe JobCallCenter`;
      break;
    default:
      subject = `Mise à jour de votre candidature pour ${options.jobTitle}`;
      text = `Bonjour ${options.candidateName},\n\nLe statut de votre candidature pour le poste "${options.jobTitle}" chez ${options.companyName} a été mis à jour.\n\nVeuillez consulter votre tableau de bord pour plus de détails.\n\nCordialement,\nL'équipe JobCallCenter`;
  }
  
  // Create HTML version with styling
  html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4a5568; margin-bottom: 10px;">JobCallCenter</h1>
        <div style="height: 3px; background-color: #3182ce; width: 100px; margin: 0 auto;"></div>
      </div>
      
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Bonjour ${options.candidateName},</p>
      
      ${options.status === 'Examinée' ? `
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          Votre candidature pour le poste <strong>"${options.jobTitle}"</strong> chez <strong>${options.companyName}</strong> est maintenant en cours d'examen.
        </p>
      ` : options.status === 'Entretien' ? `
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          <span style="color: #38a169; font-weight: bold;">Félicitations!</span> Vous êtes invité(e) à un entretien pour le poste <strong>"${options.jobTitle}"</strong> chez <strong>${options.companyName}</strong>.
        </p>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          Veuillez consulter votre tableau de bord pour plus de détails sur l'entretien.
        </p>
      ` : options.status === 'Acceptée' ? `
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          <span style="color: #38a169; font-weight: bold;">Félicitations!</span> Nous sommes ravis de vous informer que votre candidature pour le poste <strong>"${options.jobTitle}"</strong> chez <strong>${options.companyName}</strong> a été acceptée!
        </p>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          Veuillez consulter votre tableau de bord pour les prochaines étapes.
        </p>
      ` : options.status === 'Rejetée' ? `
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          Nous vous remercions de l'intérêt que vous avez porté au poste <strong>"${options.jobTitle}"</strong> chez <strong>${options.companyName}</strong>.
        </p>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          Après un examen attentif, l'employeur a décidé de poursuivre avec d'autres candidats dont le profil correspond mieux aux exigences du poste.
        </p>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          Nous vous encourageons à consulter régulièrement notre site pour d'autres opportunités qui pourraient correspondre à votre profil.
        </p>
      ` : `
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          Le statut de votre candidature pour le poste <strong>"${options.jobTitle}"</strong> chez <strong>${options.companyName}</strong> a été mis à jour.
        </p>
        <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
          Veuillez consulter votre tableau de bord pour plus de détails.
        </p>
      `}
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${applicationUrl}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Voir ma candidature</a>
      </div>
      
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Cordialement,<br>L'équipe JobCallCenter</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #718096; text-align: center;">
        <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
        <p>© ${new Date().getFullYear()} JobCallCenter. Tous droits réservés.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    to: options.to,
    subject,
    text,
    html
  });
};

/**
 * Send a new job notification
 * @param {Object} options - Notification options
 * @param {String} options.to - Recipient email
 * @param {String} options.candidateName - Candidate's name
 * @param {String} options.jobTitle - Job title
 * @param {String} options.companyName - Company name
 * @param {String} options.location - Job location
 * @param {String} options.jobId - Job ID for link
 * @returns {Promise} - Resolves with info about the sent email
 */
const sendNewJobEmail = async (options) => {
  const subject = `Nouvelle offre d'emploi: ${options.jobTitle} chez ${options.companyName}`;
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  const jobUrl = `${baseUrl}/jobs/${options.jobId}`;
  
  const text = `Bonjour ${options.candidateName},\n\nUne nouvelle offre d'emploi qui pourrait vous intéresser a été publiée sur JobCallCenter.\n\n${options.companyName} recherche un(e) ${options.jobTitle} à ${options.location}.\n\nConsultez l'offre complète sur notre site pour postuler.\n\nCordialement,\nL'équipe JobCallCenter`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #4a5568; margin-bottom: 10px;">JobCallCenter</h1>
        <div style="height: 3px; background-color: #3182ce; width: 100px; margin: 0 auto;"></div>
      </div>
      
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Bonjour ${options.candidateName},</p>
      
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">
        Une nouvelle offre d'emploi qui pourrait vous intéresser a été publiée sur JobCallCenter.
      </p>
      
      <div style="background-color: #f7fafc; border-left: 4px solid #3182ce; padding: 15px; margin: 20px 0;">
        <h2 style="color: #2d3748; margin-top: 0;">${options.jobTitle}</h2>
        <p style="color: #4a5568; margin: 5px 0;"><strong>Entreprise:</strong> ${options.companyName}</p>
        <p style="color: #4a5568; margin: 5px 0;"><strong>Lieu:</strong> ${options.location}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${jobUrl}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Voir l'offre</a>
      </div>
      
      <p style="color: #4a5568; font-size: 16px; line-height: 1.6;">Cordialement,<br>L'équipe JobCallCenter</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #718096; text-align: center;">
        <p>Si vous ne souhaitez plus recevoir de notifications pour les nouvelles offres d'emploi, vous pouvez modifier vos préférences dans les paramètres de votre compte.</p>
        <p>© ${new Date().getFullYear()} JobCallCenter. Tous droits réservés.</p>
      </div>
    </div>
  `;
  
  return sendEmail({
    to: options.to,
    subject,
    text,
    html
  });
};

module.exports = {
  sendEmail,
  sendApplicationStatusEmail,
  sendNewJobEmail
};
