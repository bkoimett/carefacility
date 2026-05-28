const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateTokens');
const bcrypt = require('bcryptjs');
const { logManually } = require('../middleware/audit');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered',
        error: { code: 'EMAIL_EXISTS' }
      });
    }

    // Create user
    const user = new User({ name, email, password, role });
    await user.save();
    
    // Log user creation
    await logManually(req, 'CREATE', 'User', user._id, user.name, null, { 
      name: user.name, 
      email: user.email, 
      role: user.role 
    });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || 'Registration failed',
      error: { code: 'REGISTRATION_ERROR' }
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: { code: 'INVALID_CREDENTIALS' }
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        error: { code: 'INVALID_CREDENTIALS' }
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Log login
    await logManually(req, 'LOGIN', 'User', user._id, user.name);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        accessToken,
        refreshToken
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Login failed',
      error: { code: 'LOGIN_ERROR' }
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch user',
      error: { code: 'FETCH_ERROR' }
    });
  }
};

// Change password for authenticated user
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user.id).select('+password')
    
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }
    
    user.password = newPassword
    await user.save()
    
    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update current user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, preferences } = req.body
    const user = await User.findById(req.user.id)
    
    if (name) user.name = name
    if (email) user.email = email
    if (preferences) user.preferences = { ...user.preferences, ...preferences }
    
    await user.save()
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, preferences: user.preferences } })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Get all users (superadmin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('createdBy', 'name email')
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Create user (superadmin only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body
    
    // Role hierarchy validation: superadmin > admin > staff
    const requestingUser = await User.findById(req.user.id)
    if (requestingUser.role === 'admin' && role === 'superadmin') {
      return res.status(403).json({ message: 'Admins cannot create superadmins' })
    }
    if (requestingUser.role === 'staff') {
      return res.status(403).json({ message: 'Staff cannot create users' })
    }
    
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'staff',
      createdBy: req.user.id
    })
    
    res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Update user (superadmin/admin)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, role, isActive } = req.body
    const requestingUser = await User.findById(req.user.id)
    const targetUser = await User.findById(id)
    
    if (!targetUser) return res.status(404).json({ message: 'User not found' })
    
    // Prevent demoting self
    if (id === req.user.id && targetUser.role === 'superadmin' && role !== 'superadmin') {
      return res.status(403).json({ message: 'Cannot demote yourself from superadmin' })
    }
    
    // Role hierarchy checks
    if (requestingUser.role === 'admin' && targetUser.role === 'superadmin') {
      return res.status(403).json({ message: 'Admins cannot modify superadmins' })
    }
    if (requestingUser.role === 'staff') {
      return res.status(403).json({ message: 'Staff cannot modify users' })
    }
    
    if (name) targetUser.name = name
    if (email) targetUser.email = email
    if (role && requestingUser.role === 'superadmin') targetUser.role = role
    if (typeof isActive === 'boolean') targetUser.isActive = isActive
    
    await targetUser.save()
    res.json({ user: { id: targetUser._id, name: targetUser.name, email: targetUser.email, role: targetUser.role, isActive: targetUser.isActive } })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// Delete/deactivate user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const requestingUser = await User.findById(req.user.id)
    const targetUser = await User.findById(id)
    
    if (!targetUser) return res.status(404).json({ message: 'User not found' })
    if (id === req.user.id) return res.status(403).json({ message: 'Cannot delete yourself' })
    
    // Role hierarchy checks
    if (requestingUser.role !== 'superadmin') {
      return res.status(403).json({ message: 'Only superadmins can delete users' })
    }
    if (targetUser.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete another superadmin' })
    }
    
    targetUser.isActive = false
    await targetUser.save()
    res.json({ message: 'User deactivated successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
};
