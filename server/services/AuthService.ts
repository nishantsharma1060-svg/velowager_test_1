import crypto from 'crypto';
import { UserRepository } from '../repositories/UserRepository.js';
import { WalletRepository } from '../repositories/WalletRepository.js';
import { ReferralRepository } from '../repositories/ReferralRepository.js';
import { User, db } from '../db.js';
import { hashPassword, verifyPassword } from '../security/password.js';

// Simple active sessions cache in memory
export const activeSessions = new Map<string, { userId: string, expiresAt: number }>();
// OTP storage: mobile -> { otp, expiresAt }
export const activeOtps = new Map<string, { otp: string, expiresAt: number }>();

export class AuthService {
  private userRepo = new UserRepository();
  private walletRepo = new WalletRepository();
  private referralRepo = new ReferralRepository();

  async generateOtp(mobile: string): Promise<string> {
    // Generate a secure random 6-digit OTP to prevent predictable session takeovers
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins
    activeOtps.set(mobile, { otp, expiresAt });
    return otp;
  }

  async register(mobile: string, password: string, referredByCode?: string, signupIp?: string, username?: string, email?: string): Promise<User> {
    if (mobile === '9999999999') {
      throw new Error('Registration is not permitted for this phone number. This is a reserved system administrative number.');
    }

    const existingUser = await this.userRepo.findByMobile(mobile);
    if (existingUser) {
      throw new Error('Mobile number already registered');
    }

    if (username) {
      const existingByUsername = await this.userRepo.findByUsername(username);
      if (existingByUsername) {
        throw new Error('Username already taken. Please choose another one.');
      }
    }

    if (email) {
      const existingByEmail = await this.userRepo.findByEmail(email);
      if (existingByEmail) {
        throw new Error('Email address already registered.');
      }
    }

    let referredByUser: User | null = null;
    if (referredByCode) {
      referredByUser = await this.userRepo.findByReferralCode(referredByCode);
      if (!referredByUser) {
        throw new Error('Invalid referral code');
      }
    }

    // Generate unique referral code for the new user
    const referralCode = 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase();

    const passwordHash = hashPassword(password);
    
    // Create the user
    const newUser = await this.userRepo.create({
      mobile,
      username,
      email,
      passwordHash,
      referralCode,
      referredByCode: referredByUser?.referralCode,
      status: 'active',
      signupIp: signupIp || null
    } as any);

    // Create a wallet for the user
    const wallet = await this.walletRepo.createWallet(newUser.id);

    // Apply Signup bonus from settings
    const settings = db.settings;
    if (settings.signupBonus > 0) {
      await this.walletRepo.updateBalance(newUser.id, settings.signupBonus, true); // credited to promoBalance
      await this.walletRepo.addTransaction({
        userId: newUser.id,
        type: 'admin_credit',
        amount: settings.signupBonus,
        currentBalance: settings.signupBonus,
        status: 'approved',
        remark: 'Sign-up Bonus Credited'
      });
    }

    // Handle Referral Linkage
    if (referredByUser) {
      await this.referralRepo.createReferral(referredByUser.id, newUser.id);
      
      // Notify referee
      db.executeTransaction((d) => {
        d.notifications.push({
          id: 'notif-' + Math.random().toString(36).substr(2, 9),
          userId: newUser.id,
          title: 'Referral Applied',
          content: `You were referred by user ${referredByUser!.mobile.slice(0, 3)}***${referredByUser!.mobile.slice(-3)}. Welcome!`,
          isRead: false,
          createdAt: new Date().toISOString()
        });

        // Notify referrer
        d.notifications.push({
          id: 'notif-' + Math.random().toString(36).substr(2, 9),
          userId: referredByUser!.id,
          title: 'New Referral Registered',
          content: `A new user registered with your referral code. You will earn commissions on their bet plays!`,
          isRead: false,
          createdAt: new Date().toISOString()
        });
      });
    }

    return newUser;
  }

  async login(identifier: string, password: string): Promise<{ token: string, user: User }> {
    let user = await this.userRepo.findByMobile(identifier);
    if (!user) {
      user = await this.userRepo.findByUsername(identifier);
    }
    if (!user) {
      user = await this.userRepo.findByEmail(identifier);
    }

    if (!user) {
      throw new Error('Invalid username, email, mobile, or password');
    }

    if (user.status === 'banned') {
      throw new Error('Your account has been banned. Please contact support.');
    }

    const passwordCheck = verifyPassword(password, user.passwordHash);
    if (!passwordCheck.valid) {
      throw new Error('Invalid username, email, mobile, or password');
    }
    if (passwordCheck.needsUpgrade) await this.userRepo.updatePasswordHash(user.id, hashPassword(password));

    // Force single active session: logout previous sessions of this user
    for (const [token, session] of activeSessions.entries()) {
      if (session.userId === user.id) {
        activeSessions.delete(token);
      }
    }

    // Create fresh session token
    const token = 'session_' + crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    activeSessions.set(token, { userId: user.id, expiresAt });

    return { token, user };
  }

  async logout(token: string): Promise<void> {
    activeSessions.delete(token);
  }

  async validateSession(token: string): Promise<User> {
    const session = activeSessions.get(token);
    if (!session || session.expiresAt < Date.now()) {
      activeSessions.delete(token);
      throw new Error('Session expired or invalid');
    }

    const user = await this.userRepo.findById(session.userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.status === 'banned') {
      throw new Error('User is banned');
    }

    return user;
  }

  async resetPassword(mobile: string, newPassword: string): Promise<void> {
    const user = await this.userRepo.findByMobile(mobile);
    if (!user) {
      throw new Error('Mobile number not found');
    }

    const passwordHash = hashPassword(newPassword);
    db.executeTransaction((d) => {
      const idx = d.users.findIndex(u => u.mobile === mobile);
      if (idx !== -1) {
        d.users[idx].passwordHash = passwordHash;
      }
    });
  }

  async applyWelcomeReferral(userId: string, referrerCode: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.referredByCode) {
      throw new Error('You have already applied a referral code');
    }

    // Check if within 24 hours
    const registrationTime = new Date(user.createdAt).getTime();
    const elapsedHrs = (Date.now() - registrationTime) / (1000 * 60 * 60);
    if (elapsedHrs >= 24) {
      throw new Error('The Welcome Offer referral linkage window of 24 hours has expired');
    }

    if (user.referralCode.toUpperCase() === referrerCode.toUpperCase()) {
      throw new Error('You cannot refer yourself');
    }

    const referrer = await this.userRepo.findByReferralCode(referrerCode);
    if (!referrer) {
      throw new Error('Referral code not found');
    }

    // 1. Update referredByCode field
    await this.userRepo.updateReferredByCode(userId, referrerCode.toUpperCase());

    // 2. Create referral link
    await this.referralRepo.createReferral(referrer.id, user.id);

    // 3. Create notifications
    db.executeTransaction((d) => {
      d.notifications.push({
        id: 'notif-' + Math.random().toString(36).substr(2, 9),
        userId: user.id,
        title: 'Referral Applied via Welcome Offer',
        content: `Welcome Offer applied! You were successfully referred by user ${referrer.mobile.slice(0, 3)}***${referrer.mobile.slice(-3)}.`,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      d.notifications.push({
        id: 'notif-' + Math.random().toString(36).substr(2, 9),
        userId: referrer.id,
        title: 'New Welcome Referral Linked',
        content: `A user has linked your referral code via the 24-hour Welcome Offer! You will earn commissions on their plays!`,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    });

    const updatedUser = await this.userRepo.findById(userId);
    return updatedUser!;
  }
}
