import { db } from './index.ts';
import { platformSettings, games, users, wallets, referrals, notifications } from './schema.ts';
import { count } from 'drizzle-orm';

export async function seedIfNeeded() {
  try {
    const settingsCountResult = await db.select({ value: count() }).from(platformSettings);
    const settingsCount = settingsCountResult[0]?.value ?? 0;
    if (settingsCount === 0) {
      console.log('Seeding PostgreSQL database...');
      
      // 1. Seed Settings
      await db.insert(platformSettings).values({
        id: 1,
        signupBonus: 100,
        referralCommissionPercent: 5,
        winningFeePercent: 2,
        minDeposit: 100,
        minWithdraw: 200,
        isMaintenanceMode: false,
        maintenanceMessage: 'Platform is undergoing routine maintenance. We will be back shortly.',
        announcements: [
          'Welcome to our Modular Gaming Platform! Enjoy WinGo Color Trading with multiple modes.',
          'Refer friends using your referral code and earn 5% of their total bets instantly in your wallet!'
        ],
        wageringMultiplier: 1
      });

      // 2. Seed Games
      await db.insert(games).values([
        {
          id: 'color-trading',
          name: 'Color Trading (WinGo)',
          description: 'Predict colors (Red, Green, Violet) or numbers (0-9) in fast-paced interval draws.',
          isEnabled: true,
          minBet: 10,
          maxBet: 50000
        },
        {
          id: 'mine',
          name: 'Mines',
          description: 'Avoid hidden mines on a 5x5 grid and cash out when your multiplier increases!',
          isEnabled: true,
          minBet: 10,
          maxBet: 50000
        },
        {
          id: 'crash',
          name: 'Crash',
          description: 'Watch the rocket rise and multiplier grow. Cash out before it crashes!',
          isEnabled: true,
          minBet: 10,
          maxBet: 50000
        },
        {
          id: 'flip',
          name: 'Coin Flip',
          description: 'Flip a coin (Heads or Tails) with a transparent, direct payout!',
          isEnabled: true,
          minBet: 10,
          maxBet: 50000
        }
      ]);

      // 3. Seed Users
      await db.insert(users).values([
        {
          id: 'admin-1',
          mobile: '9999999999',
          passwordHash: '25e8158b90108aaf2bd1f0634da4a50adb335f36dafe8aa896cfa3df22efeb9f', // 'admin123'
          referralCode: 'ADMINREF',
          status: 'active',
          isAgent: true
        },
        {
          id: 'user-1',
          mobile: '8888888888',
          passwordHash: '25e8158b90108aaf2bd1f0634da4a50adb335f36dafe8aa896cfa3df22efeb9f', // 'admin123'
          referralCode: 'USERONE',
          referredByCode: 'ADMINREF',
          status: 'active',
          isAgent: false
        }
      ]);

      // 4. Seed Wallets
      await db.insert(wallets).values([
        { userId: 'admin-1', balance: 10000, promoBalance: 0 },
        { userId: 'user-1', balance: 1000, promoBalance: 100 }
      ]);

      // 5. Seed Referrals
      await db.insert(referrals).values({
        id: 'ref-seed-1',
        referrerId: 'admin-1',
        refereeId: 'user-1'
      });

      // 6. Seed Notifications
      await db.insert(notifications).values({
        id: 'notif-seed-1',
        userId: 'user-1',
        title: 'Welcome to the Platform!',
        content: 'Your account is verified. You have received a ₹100 sign-up bonus!',
        isRead: false
      });

      console.log('PostgreSQL database seeded successfully!');
    }
  } catch (error) {
    console.error('Failed to seed database:', error);
  }
}
