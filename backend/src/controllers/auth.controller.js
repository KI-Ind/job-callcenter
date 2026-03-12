const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/user.model');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'candidat'
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir un email et un mot de passe'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe invalide'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe invalide'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Aucun utilisateur avec cet email'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    // Send email with reset token using SendGrid
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reinitialiser-mot-de-passe/${resetToken}`;
    
    // Email content
    const message = {
      to: user.email,
      from: process.env.FROM_EMAIL || 'noreply@jobcallcenter.ma',
      subject: 'Réinitialisation de votre mot de passe - JobCallCenter.ma',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #3b82f6; padding: 20px; text-align: center;">
            <img src="${process.env.FRONTEND_URL || 'http://localhost:3000'}/images/logo-white.png" alt="JobCallCenter.ma" style="max-width: 200px;">
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937;">Réinitialisation de votre mot de passe</h2>
            <p>Bonjour ${user.firstName},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour définir un nouveau mot de passe :</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Réinitialiser mon mot de passe</a>
            </p>
            <p>Ce lien est valable pendant 10 minutes. Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
            <p>Cordialement,<br>L'équipe JobCallCenter.ma</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
            &copy; ${new Date().getFullYear()} JobCallCenter.ma - Tous droits réservés
          </div>
        </div>
      `
    };

    try {
      await sgMail.send(message);
      
      res.status(200).json({
        success: true,
        message: 'Email envoyé avec succès'
      });
    } catch (emailError) {
      console.error('SendGrid Error:', emailError);
      
      // Even if email fails, we return success to user for security reasons
      // but log the error on server side
      res.status(200).json({
        success: true,
        message: 'Si votre email existe dans notre base de données, vous recevrez un lien de réinitialisation.'
      });
    }
  } catch (error) {
    console.error('Password Reset Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation du mot de passe',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    // Find user with matching token and valid expiration
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Send confirmation email
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const message = {
      to: user.email,
      from: process.env.FROM_EMAIL || 'noreply@jobcallcenter.ma',
      subject: 'Confirmation de réinitialisation de mot de passe - JobCallCenter.ma',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #3b82f6; padding: 20px; text-align: center;">
            <img src="${process.env.FRONTEND_URL || 'http://localhost:3000'}/images/logo-white.png" alt="JobCallCenter.ma" style="max-width: 200px;">
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #1f2937;">Mot de passe réinitialisé avec succès</h2>
            <p>Bonjour ${user.firstName},</p>
            <p>Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/connexion" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Se connecter</a>
            </p>
            <p>Si vous n'avez pas effectué cette action, veuillez contacter notre support immédiatement.</p>
            <p>Cordialement,<br>L'équipe JobCallCenter.ma</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
            &copy; ${new Date().getFullYear()} JobCallCenter.ma - Tous droits réservés
          </div>
        </div>
      `
    };

    try {
      await sgMail.send(message);
    } catch (emailError) {
      console.error('SendGrid Error:', emailError);
      // Continue even if email fails
    }

    // Generate token for auto login
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation du mot de passe',
      error: error.message
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
  try {
    const fieldsToUpdate = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du profil',
      error: error.message
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(req.body.currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du mot de passe',
      error: error.message
    });
  }
};

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { googleId, email, firstName, lastName, profileImage } = req.oauthUser;
    const { role, checkOnly } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ success: false, message: 'GoogleId et email sont requis' });
    }

    let user = await User.findOne({ email });

    if (checkOnly) {
      return res.status(200).json({
        success: true,
        userExists: !!user,
        role: user ? user.role : null
      });
    }

    if (user) {
      if (!user.socialAuth?.googleId) {
        user.socialAuth = { ...user.socialAuth, googleId, provider: 'google' };
        await user.save();
      }
    } else {
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Role selection required for new user',
          needsRoleSelection: true
        });
      }
      
      // Generate a random secure password for social login users
      const randomPassword = Math.random().toString(36).slice(-10) + 
                            Math.random().toString(36).toUpperCase().slice(-2) + 
                            Math.floor(Math.random() * 10) + 
                            '!';
      
      user = await User.create({
        firstName: firstName || 'Google',
        lastName: lastName || 'User',
        email,
        password: randomPassword, // Add random password for social login users
        profileImage: profileImage || '',
        role: role,
        isVerified: true,
        socialAuth: { googleId, provider: 'google' }
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Google Auth error:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'authentification Google', error: error.message });
  }
};

// @desc    Facebook OAuth login/register
// @route   POST /api/auth/facebook
// @access  Public
exports.facebookAuth = async (req, res) => {
  try {
    const { facebookId, email, firstName, lastName, profileImage } = req.oauthUser;
    const { role, checkOnly } = req.body;

    if (!facebookId || !email) {
      return res.status(400).json({ success: false, message: 'FacebookId et email sont requis' });
    }

    let user = await User.findOne({ email });

    if (checkOnly) {
      return res.status(200).json({
        success: true,
        userExists: !!user,
        role: user ? user.role : null
      });
    }

    if (user) {
      if (!user.socialAuth?.facebookId) {
        user.socialAuth = { ...user.socialAuth, facebookId, provider: 'facebook' };
        await user.save();
      }
    } else {
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Role selection required for new user',
          needsRoleSelection: true
        });
      }
      
      // Generate a random secure password for social login users
      const randomPassword = Math.random().toString(36).slice(-10) + 
                            Math.random().toString(36).toUpperCase().slice(-2) + 
                            Math.floor(Math.random() * 10) + 
                            '!';
      
      user = await User.create({
        firstName: firstName || 'Facebook',
        lastName: lastName || 'User',
        email,
        password: randomPassword, // Add random password for social login users
        profileImage: profileImage || '',
        role: role,
        isVerified: true,
        socialAuth: { facebookId, provider: 'facebook' }
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'authentification Facebook', error: error.message });
  }
};

// @desc    LinkedIn OAuth login/register
// @route   POST /api/auth/linkedin
// @access  Public
exports.linkedinAuth = async (req, res) => {
  try {
    const { linkedinId, email, firstName, lastName, profileImage } = req.oauthUser;
    const { role, checkOnly } = req.body;

    if (!linkedinId || !email) {
      return res.status(400).json({ success: false, message: 'LinkedinId et email sont requis' });
    }

    let user = await User.findOne({ email });

    if (checkOnly) {
      return res.status(200).json({
        success: true,
        userExists: !!user,
        role: user ? user.role : null
      });
    }

    if (user) {
      if (!user.socialAuth?.linkedinId) {
        user.socialAuth = { ...user.socialAuth, linkedinId, provider: 'linkedin' };
        await user.save();
      }
    } else {
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Role selection required for new user',
          needsRoleSelection: true
        });
      }
      
      // Generate a random secure password for social login users
      const randomPassword = Math.random().toString(36).slice(-10) + 
                            Math.random().toString(36).toUpperCase().slice(-2) + 
                            Math.floor(Math.random() * 10) + 
                            '!';
      
      user = await User.create({
        firstName: firstName || 'LinkedIn',
        lastName: lastName || 'User',
        email,
        password: randomPassword, // Add random password for social login users
        profileImage: profileImage || '',
        role: role,
        isVerified: true,
        socialAuth: { linkedinId, provider: 'linkedin' }
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur lors de l\'authentification LinkedIn', error: error.message });
  }
};
