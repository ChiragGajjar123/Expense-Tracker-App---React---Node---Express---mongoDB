import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { Resend } from 'resend';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.userId) return null;
      return context.user;
    },
    transactions: async (_, __, context) => {
      if (!context.userId) {
        throw new Error('Authentication required.');
      }
      return await Transaction.find({ userId: context.userId }).sort({ date: -1 });
    },
    budgets: async (_, __, context) => {
      if (!context.userId) {
        throw new Error('Authentication required.');
      }
      return await Budget.find({ userId: context.userId });
    }
  },

  Mutation: {
    register: async (_, { name, email, password }, { res }) => {
      try {
        if (!name || !email || !password) {
          return { success: false, message: 'All fields are required.' };
        }
        if (password.length < 8) {
          return { success: false, message: 'Password must be at least 8 characters.' };
        }
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          return { success: false, message: 'An account with this email already exists.' };
        }

        const user = new User({ name, email, password });
        await user.save();

        const token = generateToken(user._id);
        setAuthCookie(res, token);

        return {
          success: true,
          user
        };
      } catch (err) {
        console.error('Register error:', err);
        if (err.name === 'ValidationError') {
          const messages = Object.values(err.errors).map(e => e.message);
          return { success: false, message: messages.join(' ') };
        }
        return { success: false, message: 'Internal Server Error' };
      }
    },

    login: async (_, { email, password }, { res }) => {
      try {
        if (!email || !password) {
          return { success: false, message: 'Email and password are required.' };
        }
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
          return { success: false, message: 'Invalid email or password.' };
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return { success: false, message: 'Invalid email or password.' };
        }

        const token = generateToken(user._id);
        setAuthCookie(res, token);

        return {
          success: true,
          user
        };
      } catch (err) {
        console.error('Login error:', err);
        return { success: false, message: 'Internal Server Error' };
      }
    },

    logout: async (_, __, { res }) => {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      return { success: true, message: 'Logged out successfully.' };
    },

    updateProfile: async (_, { name, currency }, context) => {
      if (!context.userId) {
        throw new Error('Authentication required.');
      }
      const updates = {};
      if (name !== undefined) {
        if (name.trim().length < 2) {
          throw new Error('Name must be at least 2 characters.');
        }
        updates.name = name.trim();
      }
      if (currency !== undefined) updates.currency = currency;

      try {
        const user = await User.findByIdAndUpdate(context.userId, updates, { new: true, runValidators: true });
        return user;
      } catch (err) {
        if (err.name === 'ValidationError') {
          const messages = Object.values(err.errors).map(e => e.message);
          throw new Error(messages.join(' '));
        }
        throw err;
      }
    },

    changePassword: async (_, { currentPassword, newPassword }, context) => {
      if (!context.userId) {
        throw new Error('Authentication required.');
      }
      if (!currentPassword || !newPassword) {
        return { success: false, message: 'Current and new passwords are required.' };
      }
      if (newPassword.length < 8) {
        return { success: false, message: 'New password must be at least 8 characters.' };
      }

      const user = await User.findById(context.userId).select('+password');
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return { success: false, message: 'Current password is incorrect.' };
      }

      user.password = newPassword;
      await user.save();

      const token = generateToken(user._id);
      setAuthCookie(context.res, token);
      return { success: true, message: 'Password changed successfully.' };
    },

    deleteAccount: async (_, { password }, context) => {
      if (!context.userId) {
        throw new Error('Authentication required.');
      }
      if (!password) {
        return { success: false, message: 'Password is required to delete account.' };
      }

      const user = await User.findById(context.userId).select('+password');
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return { success: false, message: 'Incorrect password.' };
      }

      // Delete all user data
      await Promise.all([
        Transaction.deleteMany({ userId: context.userId }),
        Budget.deleteMany({ userId: context.userId }),
        User.findByIdAndDelete(context.userId)
      ]);

      context.res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });

      return { success: true, message: 'Account deleted successfully.' };
    },

    forgotPassword: async (_, { email }, { req }) => {
      try {
        if (!email) {
          return { success: false, message: 'Email is required.' };
        }
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          return { success: false, message: 'Account with this email address does not exist.' };
        }

        const cooldown = 60 * 1000;
        if (user.lastResetRequest && Date.now() - user.lastResetRequest.getTime() < cooldown) {
          const remainingSeconds = Math.ceil((cooldown - (Date.now() - user.lastResetRequest.getTime())) / 1000);
          return {
            success: false,
            message: `Please wait ${remainingSeconds} seconds before requesting another password reset link.`
          };
        }

        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.lastResetRequest = new Date();
        await user.save();

        const resendApiKey = process.env.RESEND_API_KEY;
        const clientUrl = process.env.CLIENT_URL || req.headers.origin || 'http://localhost:5173';
        const resetLink = `${clientUrl}/?resetToken=${token}`;

        if (!resendApiKey || resendApiKey === 're_your_api_key_here') {
          console.warn('RESEND_API_KEY is not configured. Falling back to console logging the reset token.');
          console.log(`[PASSWORD RESET TOKEN FOR ${email}]: ${resetLink}`);
        } else {
          const resend = new Resend(resendApiKey);
          await resend.emails.send({
            from: 'Expensy <onboarding@resend.dev>',
            to: [email],
            subject: 'Reset Password - Expensy',
            html: `
              <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #2563eb; margin-bottom: 20px;">Reset Your Password</h2>
                <p>You requested to reset your password for your Expensy account. Click the button below to complete the request:</p>
                <div style="margin: 30px 0; text-align: center;">
                  <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
                <p style="font-size: 12px; color: #64748b;">This link will expire in 1 hour. If you did not make this request, please ignore this email.</p>
              </div>
            `
          });
        }
        return { success: true, message: 'If an account is associated with this email, a reset link has been sent.' };
      } catch (err) {
        console.error('Forgot password error:', err);
        return { success: false, message: 'Internal Server Error' };
      }
    },

    resetPassword: async (_, { token, newPassword }, { res }) => {
      try {
        if (!token || !newPassword) {
          return { success: false, message: 'Token and new password are required.' };
        }
        if (newPassword.length < 8) {
          return { success: false, message: 'Password must be at least 8 characters.' };
        }

        const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
          return { success: false, message: 'Password reset token is invalid or has expired.' };
        }

        user.password = newPassword;
        user.resetPasswordToken = '';
        user.resetPasswordExpires = undefined;
        await user.save();

        const authToken = generateToken(user._id);
        setAuthCookie(res, authToken);

        return {
          success: true,
          message: 'Password has been reset successfully.',
          user
        };
      } catch (err) {
        console.error('Reset password error:', err);
        return { success: false, message: 'Internal Server Error' };
      }
    },

    addTransaction: async (_, args, context) => {
      if (!context.userId) {
        throw new Error('Authentication required.');
      }
      try {
        const transaction = new Transaction({ ...args, userId: context.userId });
        return await transaction.save();
      } catch (err) {
        throw new Error(err.message);
      }
    },

    updateTransaction: async (_, { id, ...updateData }, context) => {
      if (!context.userId) {
        throw new Error('Authentication required.');
      }
      try {
        const updatedTransaction = await Transaction.findOneAndUpdate(
          { _id: id, userId: context.userId },
          updateData,
          { new: true }
        );
        if (!updatedTransaction) {
          throw new Error('Transaction not found');
        }
        return updatedTransaction;
      } catch (err) {
        throw new Error(err.message);
      }
    },

    deleteTransaction: async (_, { id }, context) => {
      if (!context.userId) {
        throw new Error('Authentication required.');
      }
      try {
        const result = await Transaction.findOneAndDelete({ _id: id, userId: context.userId });
        if (!result) {
          return { success: false, message: 'Transaction not found' };
        }
        return { success: true, message: 'Transaction deleted' };
      } catch (err) {
        return { success: false, message: err.message };
      }
    },

    updateBudget: async (_, { categoryId, amount }, context) => {
      if (!context.userId) {
        throw new Error('Authentication required.');
      }
      try {
        const budget = await Budget.findOneAndUpdate(
          { categoryId, userId: context.userId },
          { $set: { amount } },
          { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, runValidators: true }
        );
        return budget;
      } catch (err) {
        console.error("Budget update error:", err);
        throw new Error(err.message);
      }
    }
  }
};
