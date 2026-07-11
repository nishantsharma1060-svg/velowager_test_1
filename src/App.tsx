import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Coins, 
  Gamepad2, 
  Wallet, 
  Users, 
  User as UserIcon, 
  ShieldAlert, 
  TrendingUp, 
  LogOut, 
  Award,
  ArrowUpRight, 
  ArrowDownLeft, 
  Clipboard, 
  Bell, 
  BellRing, 
  Settings, 
  Check, 
  X, 
  Lock, 
  RefreshCw, 
  AlertTriangle,
  Play,
  Clock,
  Flame,
  Volume2,
  VolumeX,
  HelpCircle,
  Copy,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  UserCheck,
  UserX,
  Sparkles,
  Menu,
  ChevronRight,
  ChevronLeft,
  LifeBuoy,
  History,
  Gift,
  Ticket
} from 'lucide-react';

import { MinesGameComponent } from './components/MinesGameComponent.tsx';
import { CoinFlipGameComponent } from './components/CoinFlipGameComponent.tsx';
import { CrashGameComponent } from './components/CrashGameComponent.tsx';
import { LuckyWheelComponent } from './components/LuckyWheelComponent.tsx';
import { SportsbookComponent } from './components/SportsbookComponent.tsx';
import { SportsBetLogComponent } from './components/SportsBetLogComponent.tsx';
import JazPayCheckout from './components/JazPayCheckout.tsx';
import { CustodyDashboard } from './components/CustodyDashboard.tsx';
import LandingPage from './components/LandingPage.tsx';

import { motion, AnimatePresence, type Variants } from 'motion/react';

// Color themes based on drawn numbers
const CRYPTO_RATES: Record<'USDT' | 'BTC' | 'ETH' | 'TRX', number> = {
  USDT: 90,
  BTC: 5500000,
  ETH: 3200000,
  TRX: 12
};

const CRYPTO_ADDRESSES: Record<'USDT' | 'BTC' | 'ETH' | 'TRX', string> = {
  USDT: 'TXr1yK4Z9S6v8mF7B3pX9N2L5q7W8K9S3A',
  BTC: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
  ETH: '0x71C541D8C1340085a611684c8a24858bba9b517f',
  TRX: 'TY1fU2u3Z6s8vMF3qN5R8L2p9A4K8W7S9Q'
};

const COLOR_CLASSES: Record<string, string> = {
  red: 'bg-red-500 shadow-red-500/50',
  green: 'bg-emerald-500 shadow-emerald-500/50',
  violet: 'bg-indigo-500 shadow-indigo-500/50',
  'red-violet': 'bg-gradient-to-r from-red-500 to-indigo-500',
  'green-violet': 'bg-gradient-to-r from-emerald-500 to-indigo-500'
};

const CHIP_VALUES = [10, 100, 1000, 10000];

// VIP levels helper function based on wager amount (completedWagering)
export const getVipLevel = (wager: number) => {
  const numericWager = Number(wager) || 0;
  if (numericWager >= 50000) {
    return {
      level: 'Gold',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20',
      bannerBg: 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20',
      textGradient: 'from-amber-400 via-yellow-300 to-amber-500',
      icon: '🏆',
      threshold: 50000,
      nextLevel: null,
      nextThreshold: null,
      progress: 100,
      perks: [
        '✨ 0.5% Extra Affiliate Referral Commission boost',
        '🚀 Instant, high-priority VIP bank settlement with zero wait',
        '💬 Dedicated 24/7 personal VIP manager support hotline',
        '🎁 Weekly mystery VIP loyalty bonus credits'
      ]
    };
  } else if (numericWager >= 10000) {
    return {
      level: 'Silver',
      color: 'text-zinc-300',
      bgColor: 'bg-zinc-100/10',
      borderColor: 'border-zinc-100/20',
      bannerBg: 'bg-gradient-to-r from-zinc-500/10 via-zinc-400/10 to-zinc-600/10',
      textGradient: 'from-zinc-100 via-zinc-300 to-zinc-400',
      icon: '🥈',
      threshold: 10000,
      nextLevel: 'Gold',
      nextThreshold: 50000,
      progress: Math.min(100, Math.max(0, ((numericWager - 10000) / (50000 - 10000)) * 100)),
      perks: [
        '✨ 0.25% Extra Affiliate Referral Commission boost',
        '⚡ Priority withdrawal queue clearance within 2 hours',
        '🔔 Access to exclusive premium announcements and updates'
      ]
    };
  } else {
    return {
      level: 'Bronze',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      bannerBg: 'bg-gradient-to-r from-orange-500/10 via-orange-400/5 to-orange-600/10',
      textGradient: 'from-orange-400 via-orange-300 to-orange-500',
      icon: '🥉',
      threshold: 0,
      nextLevel: 'Silver',
      nextThreshold: 10000,
      progress: Math.min(100, Math.max(0, (numericWager / 10000) * 100)),
      perks: [
        '✨ Standard 0.1% Affiliate Referral Commission earnings',
        '⏱️ Standard bank withdrawal processing (usually 12-24 hours)',
        '🎮 Access to all 4 instant multiplier game modules'
      ]
    };
  }
};

// ==========================================
// SKELETON LOADING COMPONENTS FOR TABLE/LISTS
// ==========================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.02
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 160,
      damping: 18,
      mass: 0.8
    } 
  }
};

const TransactionTableSkeleton = () => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-xs border-collapse">
      <thead>
        <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
          <th className="pb-2.5">Ref ID</th>
          <th className="pb-2.5">Date</th>
          <th className="pb-2.5">Action Type</th>
          <th className="pb-2.5 text-right">Amount</th>
          <th className="pb-2.5 text-center">Status</th>
          <th className="pb-2.5 max-w-[200px]">Remarks</th>
        </tr>
      </thead>
      <motion.tbody
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.tr key={i} variants={itemVariants} className="border-b border-zinc-850">
            <td className="py-4 pr-2">
              <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse"></div>
            </td>
            <td className="py-4 pr-2">
              <div className="h-3 w-28 bg-zinc-800/60 rounded animate-pulse"></div>
            </td>
            <td className="py-4 pr-2">
              <div className="h-5 w-14 bg-zinc-800/75 rounded-full animate-pulse"></div>
            </td>
            <td className="py-4 pr-2 text-right">
              <div className="h-3 w-16 bg-zinc-800 rounded ml-auto animate-pulse"></div>
            </td>
            <td className="py-4 pr-2 text-center">
              <div className="h-5 w-16 bg-zinc-800 rounded ml-auto mr-auto animate-pulse"></div>
            </td>
            <td className="py-4">
              <div className="h-3 w-32 bg-zinc-800/60 rounded animate-pulse"></div>
            </td>
          </motion.tr>
        ))}
      </motion.tbody>
    </table>
  </div>
);

const TransactionListSkeleton = () => (
  <motion.div 
    className="space-y-3"
    variants={containerVariants}
    initial="hidden"
    animate="show"
  >
    {Array.from({ length: 4 }).map((_, i) => (
      <motion.div 
        key={i} 
        variants={itemVariants}
        className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl space-y-3"
      >
        <div className="flex justify-between items-center">
          <div className="h-3.5 w-16 bg-zinc-800 rounded animate-pulse"></div>
          <div className="h-2.5 w-24 bg-zinc-800/60 rounded animate-pulse"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse"></div>
          <div className="h-4 w-12 bg-zinc-800 rounded animate-pulse"></div>
        </div>
        <div className="flex justify-between items-center border-t border-zinc-900 pt-2 mt-1">
          <div className="h-2.5 w-36 bg-zinc-850 rounded animate-pulse"></div>
          <div className="h-3 w-10 bg-zinc-800 rounded animate-pulse"></div>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

const RoundHistorySkeleton = () => (
  <motion.div 
    className="space-y-3"
    variants={containerVariants}
    initial="hidden"
    animate="show"
  >
    {Array.from({ length: 6 }).map((_, i) => (
      <motion.div 
        key={i} 
        variants={itemVariants}
        className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800/60"
      >
        <div className="space-y-2">
          <div className="h-3.5 w-24 bg-zinc-800 rounded animate-pulse"></div>
          <div className="h-2 w-16 bg-zinc-800/60 rounded animate-pulse"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-zinc-800 animate-pulse"></div>
          <div className="h-5 w-12 bg-zinc-800 rounded animate-pulse"></div>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

const MyBetsSkeleton = () => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-xs border-collapse">
      <thead>
        <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
          <th className="pb-2.5">Period</th>
          <th className="pb-2.5">Bet Details</th>
          <th className="pb-2.5 text-right">Wager</th>
          <th className="pb-2.5 text-center">Status</th>
          <th className="pb-2.5 text-right">Win/Lose Amount</th>
        </tr>
      </thead>
      <motion.tbody
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.tr key={i} variants={itemVariants} className="border-b border-zinc-850">
            <td className="py-3.5 pr-2">
              <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse"></div>
            </td>
            <td className="py-3.5 pr-2">
              <div className="h-5 w-24 bg-zinc-800/70 rounded animate-pulse"></div>
            </td>
            <td className="py-3.5 pr-2 text-right">
              <div className="h-3 w-12 bg-zinc-800 rounded ml-auto animate-pulse"></div>
            </td>
            <td className="py-3.5 pr-2 text-center">
              <div className="h-5 w-14 bg-zinc-800 rounded ml-auto mr-auto animate-pulse"></div>
            </td>
            <td className="py-3.5 text-right">
              <div className="h-3 w-14 bg-zinc-800 rounded ml-auto animate-pulse"></div>
            </td>
          </motion.tr>
        ))}
      </motion.tbody>
    </table>
  </div>
);

export default function App() {
  // Authentication & Session States
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'game' | 'sports' | 'sports-bets' | 'wallet' | 'referrals' | 'admin' | 'profile' | 'tickets' | 'my-bets'>('game');
  const [myBetsStatusFilter, setMyBetsStatusFilter] = useState<'all' | 'won' | 'lost' | 'pending'>('all');
  const [myBetsSearch, setMyBetsSearch] = useState('');
  
  // Payment tracking states
  const [activePaymentOrder, setActivePaymentOrder] = useState<{
    id: string;
    amount: number;
    paymentUrl: string;
    status: 'pending' | 'success' | 'failed';
    initiatedAt?: number;
  } | null>(null);
  const [checkingPaymentStatus, setCheckingPaymentStatus] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [paymentResult, setPaymentResult] = useState<'success' | 'failed' | 'pending' | null>(null);
  const [hasOpenedPaymentWindow, setHasOpenedPaymentWindow] = useState(false);
  
  // Auth Form States
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [mobile, setMobile] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [referredByCode, setReferredByCode] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [show2FAInput, setShow2FAInput] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isNotificationsDropdownOpen, setIsNotificationsDropdownOpen] = useState(false);

  // Welcome & Coupon Offer States
  const [welcomeReferralInput, setWelcomeReferralInput] = useState('');
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponCurrencyInput, setCouponCurrencyInput] = useState<'INR' | 'USDT' | 'BTC' | 'ETH' | 'TRX'>('INR');
  const [welcomeOfferError, setWelcomeOfferError] = useState<string | null>(null);
  const [welcomeOfferSuccess, setWelcomeOfferSuccess] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [applyingWelcome, setApplyingWelcome] = useState(false);

  // 2FA Admin Panel Setup States
  const [tfSetupSecret, setTfSetupSecret] = useState<string | null>(null);
  const [tfSetupQrUrl, setTfSetupQrUrl] = useState<string | null>(null);
  const [tfSetupCode, setTfSetupCode] = useState('');
  const [tfDisableCode, setTfDisableCode] = useState('');
  const [tfLoading, setTfLoading] = useState(false);
  const [tfSuccess, setTfSuccess] = useState<string | null>(null);
  const [tfError, setTfError] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [welcomeTimeRemaining, setWelcomeTimeRemaining] = useState<string>('');
  const [isWelcomeExpired, setIsWelcomeExpired] = useState<boolean>(false);

  // Platform configs
  const [platformConfig, setPlatformConfig] = useState<any>(null);
  
  // Game States (WinGo Color Trading)
  const [selectedMode, setSelectedMode] = useState<'30s' | '1m' | '3m' | '5m'>('1m');
  const [gameState, setGameState] = useState<any>(null); // current countdown information
  const [roundsHistory, setRoundsHistory] = useState<any[]>([]);
  const [userBets, setUserBets] = useState<any[]>([]);
  const [bettingError, setBettingError] = useState<string | null>(null);
  const [bettingSuccess, setBettingSuccess] = useState<string | null>(null);

  // Betting Form States
  const [betType, setBetType] = useState<'color' | 'number' | null>(null);
  const [betValue, setBetValue] = useState<string>('');
  const [betAmount, setBetAmount] = useState<number>(10);
  const [betMultiplier, setBetMultiplier] = useState<number>(1);
  const totalBetDeduction = betAmount * betMultiplier;

  // Wallet Actions State
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedDepositGateway, setSelectedDepositGateway] = useState('');
  const [depositRemark, setDepositRemark] = useState('');
  const [depositMode, setDepositMode] = useState<'gateway' | 'manual' | 'crypto'>('gateway');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMode, setWithdrawMode] = useState<'bank' | 'crypto'>('bank');
  
  // Stake Crypto States
  const [cryptoCurrency, setCryptoCurrency] = useState<'USDT' | 'BTC' | 'ETH' | 'TRX'>('USDT');
  const [cryptoDepositAmount, setCryptoDepositAmount] = useState('');
  const [cryptoTxHash, setCryptoTxHash] = useState('');
  const [cryptoWithdrawAmount, setCryptoWithdrawAmount] = useState('');
  const [cryptoWithdrawAddress, setCryptoWithdrawAddress] = useState('');
  const [cryptoAutoApprove, setCryptoAutoApprove] = useState(true);
  const [isSubmittingCrypto, setIsSubmittingCrypto] = useState(false);

  const [walletActionMessage, setWalletActionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [toasts, setToasts] = useState<{ id: string; type: 'success' | 'info' | 'error'; title: string; message: string }[]>([]);

  const showToast = useCallback((title: string, message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(false);
  const [loadingRoundsHistory, setLoadingRoundsHistory] = useState<boolean>(false);
  const [loadingUserBets, setLoadingUserBets] = useState<boolean>(false);
  const [showWagerAlertPopup, setShowWagerAlertPopup] = useState(false);

  // Stake.com Session Stats States
  const [sessionResetTime, setSessionResetTime] = useState<number>(Date.now());
  const [sessionDuration, setSessionDuration] = useState<string>('00h 00m 00s');

  // Stake.com Balance and Wallet Modal states
  const [activeCurrency, setActiveCurrency] = useState<'INR' | 'USDT' | 'BTC' | 'ETH' | 'TRX'>('INR');
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletModalTab, setWalletModalTab] = useState<'deposit' | 'withdraw' | 'transactions'>('deposit');
  const [isBalanceDropdownOpen, setIsBalanceDropdownOpen] = useState(false);

  // Stake.com Sidebar & VIP Details States
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);

  useEffect(() => {
    const onLandingAuth = (event: Event) => setAuthMode((event as CustomEvent<'login' | 'register'>).detail);
    window.addEventListener('landing-auth-mode', onLandingAuth);
    return () => window.removeEventListener('landing-auth-mode', onLandingAuth);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedMs = Date.now() - sessionResetTime;
      const hrs = Math.floor(elapsedMs / (1000 * 60 * 60));
      const mins = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((elapsedMs % (1000 * 60)) / 1000);
      setSessionDuration(
        `${String(hrs).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionResetTime]);

  // VIP Claim States
  const [claimingVipReward, setClaimingVipReward] = useState(false);
  const [vipClaimCurrency, setVipClaimCurrency] = useState<'INR' | 'USDT' | 'BTC' | 'ETH' | 'TRX'>('INR');
  const [vipClaimError, setVipClaimError] = useState<string | null>(null);
  const [vipClaimSuccess, setVipClaimSuccess] = useState<string | null>(null);

  // Bank Details States
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankHolderName, setBankHolderName] = useState('');
  const [isSavingBank, setIsSavingBank] = useState(false);
  const [showEditBankForm, setShowEditBankForm] = useState(false);

  const handleBankDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalletActionMessage(null);
    if (!bankName || !bankAccount || !bankIfsc || !bankHolderName) {
      setWalletActionMessage({ type: 'error', text: 'All bank details fields are required.' });
      return;
    }
    setIsSavingBank(true);
    try {
      const r = await fetch('/api/user/bank-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bankName,
          bankAccount,
          bankIfsc,
          bankHolderName
        })
      });
      const d = await r.json();
      if (d.error) {
        setWalletActionMessage({ type: 'error', text: d.error });
      } else {
        setWalletActionMessage({ type: 'success', text: 'Bank details saved successfully!' });
        setUser(d.user);
        setShowEditBankForm(false);
      }
    } catch (err: any) {
      setWalletActionMessage({ type: 'error', text: err.message || 'Failed to submit bank details' });
    } finally {
      setIsSavingBank(false);
    }
  };

  const handleClaimVipReward = async () => {
    if (!token) return;
    setClaimingVipReward(true);
    setVipClaimError(null);
    setVipClaimSuccess(null);
    try {
      const r = await fetch('/api/user/claim-vip-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currency: vipClaimCurrency })
      });
      const d = await r.json();
      if (d.error) {
        setVipClaimError(d.error);
      } else {
        setVipClaimSuccess(d.message);
        playSettleSound();
        // Refresh wallet balance, transaction ledger, and notifications
        fetchWallet();
        fetchTransactions();
        fetchNotifications();
        
        // Auto-clear message
        setTimeout(() => {
          setVipClaimSuccess(null);
        }, 5000);
      }
    } catch (err: any) {
      setVipClaimError(err.message || 'An error occurred while claiming your VIP reward');
    } finally {
      setClaimingVipReward(false);
    }
  };

  // Referrals State
  const [referralsData, setReferralsData] = useState<any>(null);
  const [expandedRefereeId, setExpandedRefereeId] = useState<string | null>(null);

  // Admin Subordinates State
  const [inspectedUserSubordinates, setInspectedUserSubordinates] = useState<any[] | null>(null);
  const [inspectedUserMobile, setInspectedUserMobile] = useState<string>('');
  const [loadingSubordinates, setLoadingSubordinates] = useState<boolean>(false);

  // Admin User Details State
  const [inspectedUserDetails, setInspectedUserDetails] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Notifications State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Admin Console State
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminTxs, setAdminTxs] = useState<any[]>([]);
  const [adminRounds, setAdminRounds] = useState<any[]>([]);
  const [adminSettings, setAdminSettings] = useState<any>(null);
  const [adminCoupons, setAdminCoupons] = useState<any[]>([]);
  const [adminCouponCode, setAdminCouponCode] = useState('');
  const [adminCouponAmount, setAdminCouponAmount] = useState('');
  const [adminCouponCurrency, setAdminCouponCurrency] = useState<'INR' | 'USDT' | 'BTC' | 'ETH' | 'TRX'>('INR');
  const [adminCouponError, setAdminCouponError] = useState<string | null>(null);
  const [adminCouponSuccess, setAdminCouponSuccess] = useState<string | null>(null);
  const [creatingCoupon, setCreatingCoupon] = useState(false);
  // Dynamic Payment Gateway editor states
  const [showAddGatewayForm, setShowAddGatewayForm] = useState(false);
  const [gwName, setGwName] = useState('');
  const [gwId, setGwId] = useState('');
  const [gwApiUrl, setGwApiUrl] = useState('');
  const [gwMerchantId, setGwMerchantId] = useState('');
  const [gwApiKey, setGwApiKey] = useState('');
  const [gwMinAmount, setGwMinAmount] = useState('100');
  const [gwMaxAmount, setGwMaxAmount] = useState('50000');
  const [gwDescription, setGwDescription] = useState('');
  const [adminAuditLogs, setAdminAuditLogs] = useState<any[]>([]);
  const [adminGatewayOrders, setAdminGatewayOrders] = useState<any[]>([]);
  const [adminSearchUser, setAdminSearchUser] = useState('');
  const [adminUserStatusFilter, setAdminUserStatusFilter] = useState<'all' | 'active' | 'frozen' | 'banned'>('all');
  const [adminFilterTx, setAdminFilterTx] = useState<'all' | 'deposit' | 'withdraw'>('all');
  
  // Admin Action Modals / Input Values
  const [adminDirectUser, setAdminDirectUser] = useState<string>('');
  const [adminDirectAmount, setAdminDirectAmount] = useState<string>('');
  const [adminDirectCurrency, setAdminDirectCurrency] = useState<'INR' | 'USDT' | 'BTC' | 'ETH' | 'TRX'>('INR');
  const [adminDirectType, setAdminDirectType] = useState<'credit' | 'debit'>('credit');
  const [adminDirectRemark, setAdminDirectRemark] = useState('');
  const [adminDirectMessage, setAdminDirectMessage] = useState<string | null>(null);

  // Admin Manual Wagering Override State
  const [adminWagerUser, setAdminWagerUser] = useState<string>('');
  const [adminWagerRequired, setAdminWagerRequired] = useState<string>('');
  const [adminWagerCompleted, setAdminWagerCompleted] = useState<string>('');
  const [adminWagerMessage, setAdminWagerMessage] = useState<string | null>(null);

  // Admin Manual Result Override State
  const [overrideRoundId, setOverrideRoundId] = useState('');
  const [overrideNumber, setOverrideNumber] = useState<string>('');
  const [overrideColor, setOverrideColor] = useState<string>('');
  const [overrideMessage, setOverrideMessage] = useState<string | null>(null);

  // Support Tickets State
  const [userTickets, setUserTickets] = useState<any[]>([]);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  const [ticketSuccess, setTicketSuccess] = useState<string | null>(null);

  // Admin Tickets State
  const [adminTickets, setAdminTickets] = useState<any[]>([]);
  const [adminActiveSubTab, setAdminActiveSubTab] = useState<'overview' | 'users' | 'financial' | 'games' | 'tickets' | 'settings' | 'coupons' | 'custody' | 'security'>('overview');
  const [adminFinancialSubTab, setAdminFinancialSubTab] = useState<'queues' | 'payouts' | 'vault_transfer' | 'gateway'>('queues');
  const [agentPayoutsList, setAgentPayoutsList] = useState<any[]>([]);
  const [recentPayoutsList, setRecentPayoutsList] = useState<any[]>([]);
  const [autoSettleCommissions, setAutoSettleCommissions] = useState<boolean>(true);
  const [loadingPayoutStats, setLoadingPayoutStats] = useState<boolean>(false);
  const [payoutMessage, setPayoutMessage] = useState<string | null>(null);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  const [replyTicketId, setReplyTicketId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminReplyStatus, setAdminReplyStatus] = useState<'open' | 'resolved'>('resolved');
  const [subAdmins, setSubAdmins] = useState<any[]>([]);
  const [subAdminForm, setSubAdminForm] = useState({ username: '', email: '', password: '', role: 'operations' });
  const [subAdminMessage, setSubAdminMessage] = useState<string | null>(null);

  // Vault Transfer States
  const [adminVaultTransfers, setAdminVaultTransfers] = useState<any[]>([]);
  const [vaultCurrency, setVaultCurrency] = useState<'USDT' | 'BTC' | 'ETH' | 'TRX'>('USDT');
  const [vaultAmount, setVaultAmount] = useState('');
  const [vaultDestination, setVaultDestination] = useState('');
  const [vaultLoading, setVaultLoading] = useState(false);
  const [vaultSuccess, setVaultSuccess] = useState<string | null>(null);
  const [vaultError, setVaultError] = useState<string | null>(null);

  // Instant games states
  const [gamesList, setGamesList] = useState<any[]>([]);
  const [selectedGameTab, setSelectedGameTab] = useState<'wingo' | 'mines' | 'crash' | 'flip' | 'wheel'>('wingo');
  const [showGameLobby, setShowGameLobby] = useState(true);

  // Auto-shift to the first enabled game if current tab is disabled
  useEffect(() => {
    if (gamesList && gamesList.length > 0) {
      const currentMapping = [
        { id: 'wingo', gameId: 'color-trading' },
        { id: 'mines', gameId: 'mine' },
        { id: 'crash', gameId: 'crash' },
        { id: 'flip', gameId: 'flip' },
        { id: 'wheel', gameId: 'wheel' }
      ].find(m => m.id === selectedGameTab);

      if (currentMapping) {
        const currentDbGame = gamesList.find(g => g.id === currentMapping.gameId);
        if (currentDbGame && !currentDbGame.isEnabled) {
          const firstEnabledMapping = [
            { id: 'wingo', gameId: 'color-trading' },
            { id: 'mines', gameId: 'mine' },
            { id: 'crash', gameId: 'crash' },
            { id: 'flip', gameId: 'flip' },
            { id: 'wheel', gameId: 'wheel' }
          ].find(m => {
            const dbGame = gamesList.find(g => g.id === m.gameId);
            return dbGame ? dbGame.isEnabled : true;
          });
          if (firstEnabledMapping) {
            setSelectedGameTab(firstEnabledMapping.id as any);
          }
        }
      }
    }
  }, [gamesList, selectedGameTab]);

  const fetchGamesList = useCallback(async () => {
    try {
      const r = await fetch('/api/games');
      if (r.ok) {
        const d = await r.json();
        setGamesList(d.games || []);
      }
    } catch (e) {
      console.error('Error loading games:', e);
    }
  }, []);

  // Sound Control
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  // Marquee Scroll State
  const [activeMarqueeIndex, setActiveMarqueeIndex] = useState(0);

  // Audio elements helper
  const playSettleSound = useCallback(() => {
    if (!isSoundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.15); // C6
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.warn(e);
    }
  }, [isSoundEnabled]);

  const playClickSound = useCallback(() => {
    if (!isSoundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(261.63, audioCtx.currentTime); // C4
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      console.warn(e);
    }
  }, [isSoundEnabled]);

  // Fetch Global Configuration details
  const fetchConfig = useCallback(async () => {
    try {
      const r = await fetch('/api/config');
      const d = await r.json();
      setPlatformConfig(d);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch Current active profiles
  const fetchProfile = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (r.status === 401) {
        handleLogout();
        return;
      }
      const d = await r.json();
      if (d.user) {
        setUser(d.user);
        if (d.user.bankName) setBankName(d.user.bankName);
        if (d.user.bankAccount) setBankAccount(d.user.bankAccount);
        if (d.user.bankIfsc) setBankIfsc(d.user.bankIfsc);
        if (d.user.bankHolderName) setBankHolderName(d.user.bankHolderName);
      }
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  // Fetch wallet state
  const fetchWallet = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch('/api/user/wallet', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const d = await r.json();
      if (d.wallet) {
        setWallet(d.wallet);
      }
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  // Fetch User transactions ledger
  const fetchTransactions = useCallback(async () => {
    if (!token) return;
    setLoadingTransactions(true);
    try {
      const r = await fetch('/api/user/transactions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const d = await r.json();
      if (d.transactions) {
        setTransactions(d.transactions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTransactions(false);
    }
  }, [token]);

  // Verify active gateway payment status from callback or polling
  const checkPaymentStatusDirectly = useCallback(async (orderId: string, silent = false) => {
    if (!token) return;
    if (!silent) setCheckingPaymentStatus(true);
    try {
      const r = await fetch(`/api/payments/order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const d = await r.json();
      if (d.order) {
        const currentStatus = d.order.status; // 'pending' | 'success' | 'failed'
        if (currentStatus === 'success') {
          setActivePaymentOrder(prev => prev ? { ...prev, status: 'success' } : null);
          setPaymentResult('success');
          // Refresh user wallet state
          fetchProfile();
          fetchWallet();
          fetchTransactions();
          playSettleSound();
          localStorage.removeItem('active_payment_order_id');
        } else if (currentStatus === 'failed') {
          setActivePaymentOrder(prev => prev ? { ...prev, status: 'failed' } : null);
          setPaymentResult('failed');
          localStorage.removeItem('active_payment_order_id');
        } else {
          if (!silent) {
            setPaymentResult('pending');
          }
        }
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
    } finally {
      if (!silent) setCheckingPaymentStatus(false);
    }
  }, [token, fetchProfile, fetchWallet, fetchTransactions, playSettleSound]);

  // Execute manual mock payment simulation for testing
  const handleSimulatePaymentSuccess = async (orderId: string) => {
    if (!token) return;
    setSimulatingPayment(true);
    try {
      const r = await fetch('/api/payments/simulate-success', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      });
      const d = await r.json();
      if (d.success) {
        showToast('Success Simulated', d.message);
        // Instantly force-check to update state and trigger UI transition
        checkPaymentStatusDirectly(orderId);
      } else {
        showToast('Simulation Failed', d.error || 'Server rejected simulation request');
      }
    } catch (err: any) {
      console.error('Failed to simulate success:', err);
      showToast('Simulation Error', err.message || 'Network request failed');
    } finally {
      setSimulatingPayment(false);
    }
  };

  // Restore active payment order tracking on mount
  useEffect(() => {
    if (!token) return;
    const savedOrderId = localStorage.getItem('active_payment_order_id');
    if (savedOrderId) {
      const restoreOrder = async () => {
        try {
          const r = await fetch(`/api/payments/order/${savedOrderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const d = await r.json();
          if (d.order && d.order.status === 'pending') {
            setActivePaymentOrder({
              id: d.order.id,
              amount: Number(d.order.amount),
              paymentUrl: d.order.paymentUrl || '',
              status: 'pending',
              initiatedAt: d.order.createdAt ? new Date(d.order.createdAt).getTime() : Date.now()
            });
            setHasOpenedPaymentWindow(true);
          } else {
            localStorage.removeItem('active_payment_order_id');
          }
        } catch (e) {
          console.error('Failed to restore active payment order:', e);
        }
      };
      restoreOrder();
    }
  }, [token]);

  // Active poller when a payment order is pending with exponential backoff triggering after 30 seconds
  useEffect(() => {
    if (!activePaymentOrder || activePaymentOrder.status !== 'pending' || !token) return;

    const orderId = activePaymentOrder.id;
    const initiatedAt = activePaymentOrder.initiatedAt || Date.now();
    let timeoutId: NodeJS.Timeout;
    let isMounted = true;
    let currentDelay = 3000; // start with 3 seconds

    const poll = async () => {
      if (!isMounted) return;

      await checkPaymentStatusDirectly(orderId, true);

      // Check elapsed time since order initiation
      const elapsedMs = Date.now() - initiatedAt;
      if (elapsedMs >= 30000) {
        // Trigger exponential backoff after 30 seconds
        // Starting at 3 seconds, doubling the delay each step, up to a maximum of 60 seconds (60000ms)
        currentDelay = Math.min(currentDelay * 2, 60000);
      } else {
        // Flat 3 seconds interval during the initial 30 seconds
        currentDelay = 3000;
      }

      if (isMounted) {
        timeoutId = setTimeout(poll, currentDelay);
      }
    };

    // Check instantly on mount/trigger
    checkPaymentStatusDirectly(orderId, true);

    // Schedule the next check
    timeoutId = setTimeout(poll, currentDelay);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [activePaymentOrder, token, checkPaymentStatusDirectly]);

  // Fetch Referrals Tree & Team details
  const fetchReferrals = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch('/api/user/referrals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const d = await r.json();
      setReferralsData(d);
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  // Fetch unread notifications
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch('/api/user/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const d = await r.json();
      if (d.notifications) {
        setNotifications(d.notifications);
        setUnreadCount(d.notifications.filter((n: any) => !n.isRead).length);
      }
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  // Fetch user support tickets
  const fetchUserTickets = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch('/api/tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const d = await r.json();
      if (d.tickets) {
        setUserTickets(d.tickets);
      }
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  // Fetch bets played
  const fetchBets = useCallback(async () => {
    if (!token) return;
    setLoadingUserBets(true);
    try {
      const r = await fetch('/api/user/bets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const d = await r.json();
      if (d.bets) {
        setUserBets(d.bets);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUserBets(false);
    }
  }, [token]);

  // Fetch WinGo History Trends
  const fetchGameHistory = useCallback(async () => {
    setLoadingRoundsHistory(true);
    try {
      const r = await fetch(`/api/game/color-trading/rounds?mode=${selectedMode}`);
      const d = await r.json();
      if (d.rounds) {
        setRoundsHistory(d.rounds);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRoundsHistory(false);
    }
  }, [selectedMode]);

  // Admin Stats loader
  const fetchAdminData = useCallback(async () => {
    const isAdmin = user && (user.id.startsWith('admin-') || user.mobile === '9999999999');
    if (!token || !isAdmin) return;

    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Stats overview
      const rStats = await fetch('/api/admin/stats', { headers });
      const dStats = await rStats.json();
      setAdminStats(dStats);

      // 2. Load Users list
      const rUsers = await fetch('/api/admin/users', { headers });
      const dUsers = await rUsers.json();
      if (dUsers.users) setAdminUsers(dUsers.users);

      // 3. Transactions queue
      const rTxs = await fetch('/api/admin/transactions', { headers });
      const dTxs = await rTxs.json();
      if (dTxs.transactions) setAdminTxs(dTxs.transactions);

      // 4. Rounds log
      const rRounds = await fetch('/api/admin/rounds', { headers });
      const dRounds = await rRounds.json();
      if (dRounds.rounds) setAdminRounds(dRounds.rounds);

      // 5. Config Settings
      const rSet = await fetch('/api/admin/settings', { headers });
      const dSet = await rSet.json();
      if (dSet.settings) setAdminSettings(dSet.settings);

      // 6. Audit Logging logs
      const rAudit = await fetch('/api/admin/audit-logs', { headers });
      const dAudit = await rAudit.json();
      if (dAudit.auditLogs) setAdminAuditLogs(dAudit.auditLogs);

      // 7. Payment Gateway Order Logs
      const rGateway = await fetch('/api/admin/gateway-orders', { headers });
      const dGateway = await rGateway.json();
      if (dGateway.orders) setAdminGatewayOrders(dGateway.orders);

      // 8. Support Tickets list
      const rTickets = await fetch('/api/admin/tickets', { headers });
      const dTickets = await rTickets.json();
      if (dTickets.tickets) setAdminTickets(dTickets.tickets);

      // 9. Fetch Agent Payouts stats
      const rPayouts = await fetch('/api/admin/agent-payouts/stats', { headers });
      const dPayouts = await rPayouts.json();
      if (dPayouts.agents) setAgentPayoutsList(dPayouts.agents);
      if (dPayouts.recentPayouts) setRecentPayoutsList(dPayouts.recentPayouts);
      if (dPayouts.autoSettleCommissions !== undefined) setAutoSettleCommissions(dPayouts.autoSettleCommissions);
      
      // 10. Fetch Admin Coupons
      const rCoupons = await fetch('/api/admin/coupons', { headers });
      const dCoupons = await rCoupons.json();
      if (dCoupons.coupons) setAdminCoupons(dCoupons.coupons);

      // 11. Fetch Admin Vault Transfers
      const rVault = await fetch('/api/admin/vault-transfers', { headers });
      const dVault = await rVault.json();
      if (dVault.transfers) setAdminVaultTransfers(dVault.transfers);

    } catch (e) {
      console.error('Error loading administrative views:', e);
    }
  }, [token, user]);

  const handleSettleAgent = async (agentId: string) => {
    if (!token) return;
    setLoadingPayoutStats(true);
    setPayoutMessage(null);
    setPayoutError(null);
    try {
      const res = await fetch(`/api/admin/agent-payouts/settle/${agentId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPayoutMessage(data.message);
        await fetchAdminData();
      } else {
        setPayoutError(data.error || 'Failed to settle agent commission.');
      }
    } catch (err: any) {
      setPayoutError(err.message || 'Error executing settlement.');
    } finally {
      setLoadingPayoutStats(false);
    }
  };

  const handleSettleAllAgents = async () => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to trigger manual settlements for ALL agents with outstanding commissions?')) return;
    setLoadingPayoutStats(true);
    setPayoutMessage(null);
    setPayoutError(null);
    try {
      const res = await fetch('/api/admin/agent-payouts/settle-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setPayoutMessage(data.message);
        await fetchAdminData();
      } else {
        setPayoutError(data.error || 'Failed to settle all commissions.');
      }
    } catch (err: any) {
      setPayoutError(err.message || 'Error executing settlements.');
    } finally {
      setLoadingPayoutStats(false);
    }
  };

  const handleToggleAutoSettle = async (enabled: boolean) => {
    if (!token) return;
    setLoadingPayoutStats(true);
    setPayoutMessage(null);
    setPayoutError(null);
    try {
      const res = await fetch('/api/admin/agent-payouts/toggle-auto', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled })
      });
      const data = await res.json();
      if (res.ok) {
        setAutoSettleCommissions(data.autoSettleCommissions);
        setPayoutMessage(data.message);
        await fetchAdminData();
      } else {
        setPayoutError(data.error || 'Failed to update settlement strategy.');
      }
    } catch (err: any) {
      setPayoutError(err.message || 'Error updating strategy.');
    } finally {
      setLoadingPayoutStats(false);
    }
  };

  // Handle Log Out
  const handleLogout = async () => {
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setWallet(null);
    setTransactions([]);
    setNotifications([]);
    setAdminStats(null);
  };

  // Setup clock listener
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Handle URL referral code parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const refParam = params.get('ref');
    if (refParam) {
      setReferredByCode(refParam);
      setAuthMode('register');
    }
  }, []);

  // Welcome Offer 24-Hour Countdown Timer Hook
  useEffect(() => {
    if (!user || user.referredByCode) {
      setWelcomeTimeRemaining('');
      setIsWelcomeExpired(false);
      return;
    }

    const updateTimer = () => {
      const regTime = new Date(user.createdAt).getTime();
      const elapsedMs = Date.now() - regTime;
      const limitMs = 24 * 60 * 60 * 1000;
      const remainingMs = limitMs - elapsedMs;

      if (remainingMs <= 0) {
        setWelcomeTimeRemaining('Expired');
        setIsWelcomeExpired(true);
      } else {
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
        setWelcomeTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
        setIsWelcomeExpired(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Handler to apply welcome referral code
  const handleApplyWelcomeReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!welcomeReferralInput.trim()) return;
    setWelcomeOfferError(null);
    setWelcomeOfferSuccess(null);
    setApplyingWelcome(true);
    try {
      const response = await fetch('/api/user/apply-welcome-referral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: welcomeReferralInput.trim() })
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to apply referral code');
      }
      playClickSound();
      setWelcomeOfferSuccess(data.message);
      setWelcomeReferralInput('');
      fetchProfile(); // refresh user object to include referredByCode
      showToast('Success', 'Welcome referral code applied successfully!');
    } catch (err: any) {
      setWelcomeOfferError(err.message || 'An error occurred');
    } finally {
      setApplyingWelcome(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCouponCode.trim() || !adminCouponAmount) return;
    setAdminCouponError(null);
    setAdminCouponSuccess(null);
    setCreatingCoupon(true);
    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: adminCouponCode.trim().toUpperCase(),
          amount: parseFloat(adminCouponAmount),
          currency: adminCouponCurrency
        })
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to create coupon code');
      }
      playClickSound();
      setAdminCouponSuccess(data.message);
      setAdminCouponCode('');
      setAdminCouponAmount('');
      fetchAdminData();
      showToast('Coupon Created', 'A new dynamic voucher code was created successfully.');
    } catch (err: any) {
      setAdminCouponError(err.message || 'An error occurred');
    } finally {
      setCreatingCoupon(false);
    }
  };

  // Handler to broadcast a secure crypto vault sweep transfer
  const handleVaultTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaultAmount || !vaultDestination.trim()) return;
    setVaultError(null);
    setVaultSuccess(null);
    setVaultLoading(true);
    try {
      const response = await fetch('/api/admin/vault-transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currency: vaultCurrency,
          amount: parseFloat(vaultAmount),
          destinationAddress: vaultDestination.trim()
        })
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to dispatch vault sweep transaction.');
      }
      playClickSound();
      setVaultSuccess(data.message);
      setVaultAmount('');
      setVaultDestination('');
      fetchAdminData();
      showToast('Vault Transfer Dispatched', `Blockchain transaction successfully submitted.`);
    } catch (err: any) {
      setVaultError(err.message || 'An unexpected error occurred during dispatch.');
    } finally {
      setVaultLoading(false);
    }
  };

  // Handler to redeem promo coupon codes
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setCouponError(null);
    setCouponSuccess(null);
    setApplyingCoupon(true);
    try {
      const response = await fetch('/api/user/apply-coupon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          code: couponCodeInput.trim(),
          currency: couponCurrencyInput
        })
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to redeem coupon code');
      }
      playClickSound();
      setCouponSuccess(data.message);
      setCouponCodeInput('');
      fetchWallet(); // refresh wallet balance
      fetchTransactions(); // refresh ledger
      showToast('Bonus Credited', 'Promo coupon code redeemed successfully!');
    } catch (err: any) {
      setCouponError(err.message || 'An error occurred');
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Handle URL payment status parameter on mount/auth load
  useEffect(() => {
    if (!token) return;
    
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('paymentStatus');
    const orderId = params.get('orderId');

    if (paymentStatus) {
      if (paymentStatus === 'success') {
        const fetchAndNotify = async () => {
          let depositAmountText = '';
          try {
            // Fetch exact order details to customize the success notification amount
            const r = await fetch(`/api/payments/order/${orderId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const d = await r.json();
            if (d.order && d.order.amount) {
              depositAmountText = ` of ₹${Number(d.order.amount).toFixed(2)}`;
            }
          } catch (err) {
            console.error('[Payment Status Notification] Failed to query order details:', err);
          }

          setWalletActionMessage({
            type: 'success',
            text: `Deposit successful! Your payment${depositAmountText} (Ref: ${orderId || 'N/A'}) has been processed and credited to your cash wallet.`
          });

          // Play success sound if function is declared
          if (typeof playClickSound === 'function') {
            playClickSound();
          }

          // Instantly refresh user's profile, balance, and transaction history
          fetchProfile();
          fetchWallet();
          fetchTransactions();

          // Route user to the wallet view
          setActiveTab('wallet');

          // Clean URL parameters to prevent duplicate popups on reload
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        };
        fetchAndNotify();
      } else if (paymentStatus === 'failed') {
        setWalletActionMessage({
          type: 'error',
          text: `Payment gateway transaction failed. No funds were added. Reference order ID: ${orderId || 'N/A'}`
        });
        setActiveTab('wallet');
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [token, fetchProfile, fetchWallet, fetchTransactions]);

  // Fetch profile when token exists
  useEffect(() => {
    if (token) {
      fetchProfile();
      fetchWallet();
      fetchTransactions();
      fetchReferrals();
      fetchNotifications();
      fetchBets();
    }
  }, [token, fetchProfile, fetchWallet, fetchTransactions, fetchReferrals, fetchNotifications, fetchBets]);

  // Game Engine Realtime ticking sync
  useEffect(() => {
    const clockInterval = setInterval(async () => {
      try {
        const r = await fetch('/api/game/color-trading/state');
        if (!r.ok) return;
        const contentType = r.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) return;
        const d = await r.json();
        
        if (d && d.state) {
          const matchingModeState = d.state.find((s: any) => s.gameMode === selectedMode);
          if (matchingModeState) {
            // Detect rollover by the canonical period ID. Polling can legitimately
            // skip the single timeLeft=1 frame on slow/free instances.
            const wasSettle = !!gameState && gameState.periodNumber !== matchingModeState.periodNumber;
            
            setGameState(matchingModeState);
            
            if (wasSettle) {
              playSettleSound();
              // Trigger instant refreshes on results
              fetchGameHistory();
              fetchWallet();
              fetchBets();
              fetchTransactions();
              fetchNotifications();
              if (activeTab === 'admin') {
                fetchAdminData();
              }
            }
          }
        }
      } catch (e) {
        console.error('Failed to sync Game Clock ticking:', e);
      }
    }, 1000);

    return () => clearInterval(clockInterval);
  }, [selectedMode, gameState, playSettleSound, fetchGameHistory, fetchWallet, fetchBets, fetchTransactions, fetchNotifications, activeTab, fetchAdminData]);

  // Keep result history fresh even if a browser tab is throttled or misses a rollover poll.
  useEffect(() => {
    const historyInterval = window.setInterval(() => fetchGameHistory(), 10000);
    return () => window.clearInterval(historyInterval);
  }, [selectedMode, fetchGameHistory]);

  // Initial Game History fetch & Tab shifts
  useEffect(() => {
    fetchGameHistory();
    fetchGamesList();
  }, [selectedMode, fetchGameHistory, fetchGamesList]);

  // Admin state loading
  useEffect(() => {
    if (activeTab === 'admin') {
      fetchAdminData();
      fetchGamesList();
    }
  }, [activeTab, fetchAdminData, fetchGamesList]);

  // Auto-fetch bets when 'my-bets' tab is selected
  useEffect(() => {
    if (activeTab === 'my-bets') {
      fetchBets();
    }
  }, [activeTab, fetchBets]);

  // Rotating Announcements slide-show
  useEffect(() => {
    if (!platformConfig || !platformConfig.announcements || platformConfig.announcements.length === 0) return;
    const scrollMarquee = setInterval(() => {
      setActiveMarqueeIndex(prev => (prev + 1) % platformConfig.announcements.length);
    }, 6000);
    return () => clearInterval(scrollMarquee);
  }, [platformConfig]);

  // Request Registration OTP
  const handleRequestOtp = async () => {
    setAuthError(null);
    setSimulatedOtp(null);
    
    const emailToUse = email;
    if (!emailToUse || !emailToUse.includes('@')) {
      setAuthError('Please enter a valid email address first');
      return;
    }

    try {
      const r = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToUse })
      });
      const d = await r.json();
      if (d.error) {
        setAuthError(d.error);
      } else {
        setSimulatedOtp(null);
        setAuthSuccess(d.message || 'Verification email dispatched! Please check your email inbox and spam folders for your 6-digit OTP code.');
      }
    } catch (e: any) {
      setAuthError(e.message || 'OTP dispatch failed');
    }
  };

  // Google OAuth Popup Authentication flow
  const handleGoogleAuth = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setGoogleLoading(true);
    try {
      const res = await fetch('/api/auth/google/url');
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to retrieve Google Sign-In URL');
      }

      // Open popup perfectly centered on the screen (Real OAuth)
      const width = 500;
      const height = 650;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;
      const popup = window.open(
        data.url,
        'Google SSO',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        throw new Error('SSO popup window was blocked by your browser. Please enable popups in your browser settings.');
      }

      // Secure cross-window communication listener
      const handleMessage = (event: MessageEvent) => {
        if (event.origin === window.location.origin && event.source === popup && event.data && event.data.type === 'OAUTH_AUTH_SUCCESS') {
          const { token: googleToken, user: googleUser } = event.data;
          localStorage.setItem('token', googleToken);
          setToken(googleToken);
          setUser(googleUser);
          setAuthSuccess('Welcome! Authenticated with Google successfully.');
          setGoogleLoading(false);
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      // Auto-cleaner if popup closed by user
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setGoogleLoading(false);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);

    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setAuthError(err.message || 'Google SSO failed.');
      setGoogleLoading(false);
    }
  };

  // Submit Authentication Form (Login/Register/Forgot)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    const payload: any = { password };

    if (authMode === 'login') {
      if (!mobile || !password) {
        setAuthError('Please enter your Username or Email Address and Password');
        return;
      }
      payload.identifier = mobile;
      if (show2FAInput) {
        if (!twoFactorCode) {
          setAuthError('Please enter your 6-digit Google Authenticator 2FA code');
          return;
        }
        payload.code = twoFactorCode;
      }
    }

    if (authMode === 'register') {
      if (!username || !email || !password || !otp) {
        setAuthError('All fields (Username, Email, Password, and OTP) are required');
        return;
      }
      payload.username = username;
      payload.email = email;
      payload.otp = otp;
      if (referredByCode) payload.referredByCode = referredByCode;
    }

    if (authMode === 'forgot') {
      if (!email || !otp) {
        setAuthError('Email address and OTP code are required to reset password');
        return;
      }
      payload.email = email;
      payload.newPassword = password;
      payload.otp = otp;
    }

    try {
      const url = authMode === 'login' 
        ? '/api/auth/login' 
        : authMode === 'register' 
          ? '/api/auth/register' 
          : '/api/auth/reset-password';

      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const d = await r.json();

      if (d.error) {
        setAuthError(d.error);
      } else if (d.status === 'requires_2fa') {
        setShow2FAInput(true);
        setAuthSuccess(d.message);
      } else {
        if (authMode === 'login') {
          localStorage.setItem('token', d.token);
          setToken(d.token);
          setUser(d.user);
          setAuthSuccess('Welcome back! Logged in successfully.');
          setMobile('');
          setUsername('');
          setEmail('');
          setPassword('');
          setShow2FAInput(false);
          setTwoFactorCode('');
        } else if (authMode === 'register') {
          setAuthSuccess('Registration completed! You can login now.');
          setAuthMode('login');
          setShow2FAInput(false);
          setTwoFactorCode('');
          setOtp('');
        } else {
          setAuthSuccess('Your password was updated successfully. Please login.');
          setAuthMode('login');
          setShow2FAInput(false);
          setTwoFactorCode('');
          setOtp('');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication operation failed');
    }
  };

  // Fetch Google Authenticator Setup Secret and QR code
  const handleGetTfSetup = async () => {
    setTfError(null);
    setTfSuccess(null);
    setTfLoading(true);
    try {
      const r = await fetch('/api/admin/2fa/setup', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const d = await r.json();
      if (d.error) {
        setTfError(d.error);
      } else {
        setTfSetupSecret(d.secret);
        setTfSetupQrUrl(d.qrCodeUrl);
      }
    } catch (err: any) {
      setTfError(err.message || 'Failed to initiate 2FA setup');
    } finally {
      setTfLoading(false);
    }
  };

  // Enable Google Authenticator
  const handleEnableTf = async (e: React.FormEvent) => {
    e.preventDefault();
    setTfError(null);
    setTfSuccess(null);
    if (!tfSetupSecret || !tfSetupCode) {
      setTfError('Both setup secret and verification code are required.');
      return;
    }
    setTfLoading(true);
    try {
      const r = await fetch('/api/admin/2fa/enable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ secret: tfSetupSecret, code: tfSetupCode })
      });
      const d = await r.json();
      if (d.error) {
        setTfError(d.error);
      } else {
        setTfSuccess(d.message);
        // Update user state so 2FA status is immediately reflected in the frontend
        if (user) {
          setUser({ ...user, twoFactorEnabled: true } as any);
        }
        setTfSetupSecret(null);
        setTfSetupQrUrl(null);
        setTfSetupCode('');
      }
    } catch (err: any) {
      setTfError(err.message || 'Failed to enable Google Authenticator');
    } finally {
      setTfLoading(false);
    }
  };

  // Disable Google Authenticator
  const handleDisableTf = async (e: React.FormEvent) => {
    e.preventDefault();
    setTfError(null);
    setTfSuccess(null);
    if (!tfDisableCode) {
      setTfError('Verification code is required to deactivate 2FA.');
      return;
    }
    setTfLoading(true);
    try {
      const r = await fetch('/api/admin/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: tfDisableCode })
      });
      const d = await r.json();
      if (d.error) {
        setTfError(d.error);
      } else {
        setTfSuccess(d.message);
        if (user) {
          setUser({ ...user, twoFactorEnabled: false } as any);
        }
        setTfDisableCode('');
      }
    } catch (err: any) {
      setTfError(err.message || 'Failed to disable Google Authenticator');
    } finally {
      setTfLoading(false);
    }
  };

  const loadSubAdmins = async () => {
    if (user?.adminRole !== 'master') return;
    const r = await fetch('/api/admin/sub-admins', { headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    if (r.ok) setSubAdmins(d.admins || []);
  };

  const handleCreateSubAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubAdminMessage(null);
    const r = await fetch('/api/admin/sub-admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(subAdminForm)
    });
    const d = await r.json();
    if (!r.ok) return setSubAdminMessage(d.error || 'Unable to create sub-admin');
    setSubAdminMessage('Sub-admin created. Ask them to enable Google Authenticator after signing in.');
    setSubAdminForm({ username: '', email: '', password: '', role: 'operations' });
    loadSubAdmins();
  };

  // Place bet on active game round
  const handlePlaceBet = async () => {
    setBettingError(null);
    setBettingSuccess(null);

    if (!token) {
      setBettingError('Please login to place your bet');
      return;
    }

    if (!gameState || !gameState.id) {
      setBettingError('Game state is syncing. Please wait for the current round information.');
      return;
    }

    if (gameState.status !== 'betting') {
      setBettingError('Betting is closed or period already settled');
      return;
    }

    if (!betType || !betValue) {
      setBettingError('Please make a prediction (color or number)');
      return;
    }

    const totalAmount = betAmount * betMultiplier;
    if (wallet && (wallet.balance + wallet.promoBalance < totalAmount)) {
      setBettingError('Insufficient balance to execute bet');
      return;
    }

    try {
      const r = await fetch('/api/game/color-trading/bet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roundId: gameState.id,
          betType,
          betValue,
          amount: totalAmount
        })
      });

      const d = await r.json();

      if (d.error) {
        setBettingError(d.error);
      } else {
        playClickSound();
        setBettingSuccess(`Bet of ₹${totalAmount} placed on "${betValue}" successfully!`);
        fetchWallet();
        fetchBets();
        
        // Reset selections
        setBetType(null);
        setBetValue('');
      }
    } catch (e: any) {
      setBettingError(e.message || 'Server error occurred placing bet');
    }
  };

  // Deposit funds manual request
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalletActionMessage(null);

    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      setWalletActionMessage({ type: 'error', text: 'Enter a valid positive deposit amount' });
      return;
    }

    try {
      const r = await fetch('/api/user/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(depositAmount),
          remark: depositRemark || 'User Direct Manual Deposit slip'
        })
      });

      const d = await r.json();
      if (d.error) {
        setWalletActionMessage({ type: 'error', text: d.error });
      } else {
        setWalletActionMessage({
          type: 'success',
          text: `Deposit request of ₹${depositAmount} submitted successfully. Pending admin verification.`
        });
        setDepositAmount('');
        setDepositRemark('');
        fetchTransactions();
      }
    } catch (err: any) {
      setWalletActionMessage({ type: 'error', text: err.message || 'Deposit submission failed' });
    }
  };

  // Deposit funds gateway request (Instant Auto-Credits)
  const handleGatewayDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalletActionMessage(null);

    if (!depositAmount || isNaN(Number(depositAmount)) || Number(depositAmount) <= 0) {
      setWalletActionMessage({ type: 'error', text: 'Enter a valid positive deposit amount' });
      return;
    }

    try {
      const r = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(depositAmount),
          gatewayId: selectedDepositGateway || undefined
        })
      });

      const d = await r.json();
      if (d.error) {
        setWalletActionMessage({ type: 'error', text: d.error });
      } else {
        // Play interactive checkout sound
        playClickSound();
        
        // Initialize active tracking state
        const orderId = d.orderId;
        const amountNum = Number(depositAmount);
        
        setActivePaymentOrder({
          id: orderId,
          amount: amountNum,
          paymentUrl: d.paymentUrl,
          status: 'pending',
          initiatedAt: Date.now()
        });
        setPaymentResult('pending');
        setHasOpenedPaymentWindow(false);
        localStorage.setItem('active_payment_order_id', orderId);
        
        // Try to open the payment page in a new window/tab, otherwise user can click the modal button
        try {
          const payWin = window.open(d.paymentUrl, '_blank');
          if (payWin) {
            setHasOpenedPaymentWindow(true);
          }
        } catch (popupErr) {
        }

        // Close the wallet modal if it is currently open, to make room for our tracking modal
        setIsWalletModalOpen(false);
        setDepositAmount('');
      }
    } catch (err: any) {
      setWalletActionMessage({ type: 'error', text: err.message || 'Payment Gateway session initialization failed' });
    }
  };

  // Withdraw request submission
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalletActionMessage(null);

    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      setWalletActionMessage({ type: 'error', text: 'Enter a valid withdrawal amount' });
      return;
    }

    if (wallet && (wallet.completedWagering ?? 0) < (wallet.requiredWagering ?? 0)) {
      setShowWagerAlertPopup(true);
      return;
    }

    try {
      const r = await fetch('/api/user/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(withdrawAmount)
        })
      });

      const d = await r.json();
      if (d.error) {
        setWalletActionMessage({ type: 'error', text: d.error });
      } else {
        setWalletActionMessage({
          type: 'success',
          text: `Withdrawal request for ₹${withdrawAmount} submitted successfully.`
        });
        setWithdrawAmount('');
        fetchWallet();
        fetchTransactions();
      }
    } catch (err: any) {
      setWalletActionMessage({ type: 'error', text: err.message || 'Withdrawal submission failed' });
    }
  };

  // Stake.com Crypto Deposit Submit
  const handleCryptoDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalletActionMessage(null);

    if (!cryptoDepositAmount || isNaN(Number(cryptoDepositAmount)) || Number(cryptoDepositAmount) <= 0) {
      setWalletActionMessage({ type: 'error', text: 'Enter a valid positive crypto deposit amount' });
      return;
    }

    if (!cryptoTxHash || cryptoTxHash.trim().length < 6) {
      setWalletActionMessage({ type: 'error', text: 'Please enter a valid Transaction Hash (TxHash / TxID) for confirmation verification.' });
      return;
    }

    setIsSubmittingCrypto(true);
    try {
      const inrEquivalent = Number(cryptoDepositAmount) * CRYPTO_RATES[cryptoCurrency];
      const r = await fetch('/api/user/crypto-deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: inrEquivalent,
          cryptoAmount: Number(cryptoDepositAmount),
          currency: cryptoCurrency,
          txHash: cryptoTxHash.trim(),
          autoApprove: cryptoAutoApprove
        })
      });

      const d = await r.json();
      if (d.error) {
        setWalletActionMessage({ type: 'error', text: d.error });
      } else {
        setWalletActionMessage({
          type: 'success',
          text: d.message
        });
        setCryptoDepositAmount('');
        setCryptoTxHash('');
        playSettleSound();
        fetchWallet();
        fetchTransactions();
        fetchNotifications();
      }
    } catch (err: any) {
      setWalletActionMessage({ type: 'error', text: err.message || 'Crypto deposit submission failed' });
    } finally {
      setIsSubmittingCrypto(false);
    }
  };

  // Stake.com Crypto Withdraw Submit
  const handleCryptoWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWalletActionMessage(null);

    if (!cryptoWithdrawAmount || isNaN(Number(cryptoWithdrawAmount)) || Number(cryptoWithdrawAmount) <= 0) {
      setWalletActionMessage({ type: 'error', text: 'Enter a valid crypto withdrawal amount' });
      return;
    }

    if (!cryptoWithdrawAddress || cryptoWithdrawAddress.trim().length < 8) {
      setWalletActionMessage({ type: 'error', text: 'Please specify a valid crypto wallet address for payout.' });
      return;
    }

    const inrEquivalent = Number(cryptoWithdrawAmount) * CRYPTO_RATES[cryptoCurrency];

    if (wallet && wallet.balance < inrEquivalent) {
      setWalletActionMessage({ 
        type: 'error', 
        text: `Insufficient funds! Your withdrawal translates to ₹${inrEquivalent.toFixed(2)}, but you only have ₹${wallet.balance.toFixed(2)} in your main balance.` 
      });
      return;
    }

    if (wallet && (wallet.completedWagering ?? 0) < (wallet.requiredWagering ?? 0)) {
      setShowWagerAlertPopup(true);
      return;
    }

    setIsSubmittingCrypto(true);
    try {
      const r = await fetch('/api/user/crypto-withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: inrEquivalent,
          cryptoAmount: Number(cryptoWithdrawAmount),
          currency: cryptoCurrency,
          walletAddress: cryptoWithdrawAddress.trim()
        })
      });

      const d = await r.json();
      if (d.error) {
        setWalletActionMessage({ type: 'error', text: d.error });
      } else {
        setWalletActionMessage({
          type: 'success',
          text: d.message
        });
        setCryptoWithdrawAmount('');
        setCryptoWithdrawAddress('');
        playSettleSound();
        fetchWallet();
        fetchTransactions();
        fetchNotifications();
      }
    } catch (err: any) {
      setWalletActionMessage({ type: 'error', text: err.message || 'Crypto withdrawal submission failed' });
    } finally {
      setIsSubmittingCrypto(false);
    }
  };

  // Mark all notifications read
  const handleNotificationsRead = async () => {
    try {
      await fetch('/api/user/notifications/read-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  // Copy referral code to clipboard
  const handleCopyReferral = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Referral Code copied successfully!');
  };

  // Copy referral promotion link to clipboard
  const handleCopyLink = (code: string) => {
    const link = `${window.location.origin}?ref=${code}`;
    navigator.clipboard.writeText(link);
    alert('Referral Promotion Link copied successfully! Share it with friends to register.');
  };

  const getReferralLink = (code: string) => `${window.location.origin}/?ref=${encodeURIComponent(code)}`;

  const shareReferralOnTelegram = (code: string) => {
    const referralLink = getReferralLink(code);
    const text = 'Join me on VeloWager and earn rewards.';
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  // ==========================================
  // ADMINISTRATIVE CONTROL PANEL OPERATIONS
  // ==========================================

  // Approve/Reject Deposits
  const handleAdminDepositAction = async (txId: string, approve: boolean) => {
    try {
      const r = await fetch(`/api/admin/transactions/${txId}/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approve })
      });
      const d = await r.json();
      if (d.error) {
        alert(`Error: ${d.error}`);
      } else {
        fetchAdminData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Approve/Reject Withdrawals
  const handleAdminWithdrawAction = async (txId: string, approve: boolean) => {
    let rejectReason = '';
    if (!approve) {
      rejectReason = prompt('Please enter the reason for rejecting this withdrawal:') || 'Declined during review';
    }

    try {
      const r = await fetch(`/api/admin/transactions/${txId}/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approve, rejectReason })
      });
      const d = await r.json();
      if (d.error) {
        alert(`Error: ${d.error}`);
      } else {
        fetchAdminData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Freeze/Ban User status
  const handleAdminUserStatus = async (userId: string, newStatus: string) => {
    try {
      const r = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const d = await r.json();
      if (d.error) {
        alert(d.error);
      } else {
        alert(`User account access updated to: ${newStatus}`);
        fetchAdminData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filteredAdminUsers = adminUsers.filter((u) => {
    const query = adminSearchUser.trim().toLowerCase();
    const matchesQuery = !query || [u.id, u.username, u.email, u.mobile, u.signupIp].some(value => String(value || '').toLowerCase().includes(query));
    return matchesQuery && (adminUserStatusFilter === 'all' || u.status === adminUserStatusFilter);
  });

  const exportAdminUsersCsv = () => {
    const escape = (value: any) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [['ID', 'Username', 'Email', 'Mobile', 'Signup IP', 'Same IP Accounts', 'Status', 'Type', 'Balance'], ...filteredAdminUsers.map(u => [u.id, u.username, u.email, u.mobile, u.signupIp || 'Unknown', u.sameIpAccountCount || 0, u.status, u.isAgent ? 'Agent' : 'Player', ((u.wallet?.balance ?? 0) + (u.wallet?.promoBalance ?? 0)).toFixed(2)])];
    const blob = new Blob([rows.map(row => row.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = `velowager-users-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(url);
  };

  const revokeUserSessions = async (userId: string) => {
    const r = await fetch(`/api/admin/users/${userId}/revoke-sessions`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    const d = await r.json();
    alert(d.error || d.message);
  };

  // Toggle agent status of a user
  const handleAdminUserAgent = async (userId: string, isAgent: boolean) => {
    try {
      const r = await fetch(`/api/admin/users/${userId}/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isAgent })
      });
      const d = await r.json();
      if (d.error) {
        alert(d.error);
      } else {
        alert(`User agent status successfully updated to: ${isAgent ? 'Agent' : 'Normal User'}`);
        fetchAdminData();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Fetch subordinates list for admin console
  const handleFetchUserSubordinates = async (userId: string, mobile: string) => {
    setLoadingSubordinates(true);
    setInspectedUserMobile(mobile);
    try {
      const r = await fetch(`/api/admin/users/${userId}/subordinates`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const d = await r.json();
      if (d.error) {
        alert(d.error);
        setInspectedUserSubordinates(null);
      } else {
        setInspectedUserSubordinates(d.referees || []);
      }
    } catch (e: any) {
      alert(e.message);
      setInspectedUserSubordinates(null);
    } finally {
      setLoadingSubordinates(false);
    }
  };

  // Fetch single user detailed history & bank details for admin console
  const handleInspectUserDetails = async (userId: string) => {
    setLoadingDetails(true);
    try {
      const r = await fetch(`/api/admin/users/${userId}/details`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const d = await r.json();
      if (d.error) {
        alert(d.error);
        setInspectedUserDetails(null);
      } else {
        setInspectedUserDetails(d);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to fetch user details');
      setInspectedUserDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Submit new support ticket (Player)
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setTicketError(null);
    setTicketSuccess(null);
    
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      setTicketError('Please provide both a subject and detailed description');
      return;
    }

    setTicketSubmitting(true);
    try {
      const r = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: ticketSubject,
          message: ticketMessage
        })
      });
      const d = await r.json();
      if (r.ok) {
        setTicketSuccess('Support ticket created successfully! Our team will review and reply shortly.');
        setTicketSubject('');
        setTicketMessage('');
        playClickSound?.();
        fetchUserTickets(); // Refresh user tickets
      } else {
        setTicketError(d.error || 'Failed to submit ticket');
      }
    } catch (err: any) {
      setTicketError(err.message || 'An unexpected error occurred');
    } finally {
      setTicketSubmitting(false);
    }
  };

  // Reply to support ticket (Admin)
  const handleAdminReplyTicket = async (e: React.FormEvent, ticketId: string) => {
    e.preventDefault();
    if (!adminReplyText.trim()) {
      alert('Please enter a reply message');
      return;
    }

    try {
      const r = await fetch(`/api/admin/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adminReply: adminReplyText,
          status: adminReplyStatus
        })
      });
      const d = await r.json();
      if (r.ok) {
        setAdminReplyText('');
        setReplyTicketId(null);
        alert('Ticket updated and player notified successfully!');
        fetchAdminData(); // Reload admin data
      } else {
        alert(d.error || 'Failed to update ticket');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit reply');
    }
  };

  // Admin direct credit/debit adjustment
  const handleAdminDirectWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminDirectMessage(null);

    if (!adminDirectUser || !adminDirectAmount || isNaN(Number(adminDirectAmount))) {
      setAdminDirectMessage('Select user ID and provide a valid positive currency amount');
      return;
    }

    try {
      const r = await fetch(`/api/admin/users/${adminDirectUser}/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(adminDirectAmount),
          action: adminDirectType,
          currency: adminDirectCurrency,
          remark: adminDirectRemark || 'Admin Direct Balancing Correction'
        })
      });
      const d = await r.json();
      if (d.error) {
        setAdminDirectMessage(`Error: ${d.error}`);
      } else {
        const formattedAmt = adminDirectCurrency === 'INR' ? `₹${adminDirectAmount}` : `${adminDirectAmount} ${adminDirectCurrency}`;
        setAdminDirectMessage(`Successfully executed ${formattedAmt} ${adminDirectType} for user!`);
        setAdminDirectAmount('');
        setAdminDirectRemark('');
        fetchAdminData();
      }
    } catch (err: any) {
      setAdminDirectMessage(err.message);
    }
  };

  // Populate wagering override form on user select change
  const handleWagerUserChange = (userId: string) => {
    setAdminWagerUser(userId);
    const selectedUser = adminUsers.find(u => u.id === userId);
    if (selectedUser) {
      setAdminWagerRequired(String(selectedUser.wallet?.requiredWagering ?? 0));
      setAdminWagerCompleted(String(selectedUser.wallet?.completedWagering ?? 0));
    } else {
      setAdminWagerRequired('');
      setAdminWagerCompleted('');
    }
  };

  // Admin manual wagering override
  const handleAdminWagerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminWagerMessage(null);

    if (!adminWagerUser || adminWagerRequired === '' || adminWagerCompleted === '' || isNaN(Number(adminWagerRequired)) || isNaN(Number(adminWagerCompleted))) {
      setAdminWagerMessage('Select a user and specify valid required and completed wagering numbers');
      return;
    }

    try {
      const r = await fetch(`/api/admin/users/${adminWagerUser}/wagering`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          requiredWagering: Number(adminWagerRequired),
          completedWagering: Number(adminWagerCompleted)
        })
      });
      const d = await r.json();
      if (d.error) {
        setAdminWagerMessage(`Error: ${d.error}`);
      } else {
        setAdminWagerMessage(`Successfully updated wagering for user to Req: ₹${adminWagerRequired}, Comp: ₹${adminWagerCompleted}!`);
        fetchAdminData();
      }
    } catch (err: any) {
      setAdminWagerMessage(err.message);
    }
  };

  // Admin result override configuration
  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOverrideMessage(null);

    if (!overrideRoundId) {
      setOverrideMessage('Please select an active/upcoming round');
      return;
    }

    if (overrideNumber === '' && !overrideColor) {
      setOverrideMessage('Specify either the winning number (0-9) or color to force');
      return;
    }

    try {
      const r = await fetch(`/api/admin/rounds/${overrideRoundId}/override`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          number: overrideNumber !== '' ? Number(overrideNumber) : undefined,
          color: overrideColor || undefined
        })
      });
      const d = await r.json();
      if (d.error) {
        setOverrideMessage(`Error: ${d.error}`);
      } else {
        setOverrideMessage(d.message);
        setOverrideNumber('');
        setOverrideColor('');
        fetchAdminData();
      }
    } catch (err: any) {
      setOverrideMessage(err.message);
    }
  };

  // Admin configuration updating
  const handleAdminSettingsSubmit = async (updatedFields: any) => {
    try {
      const r = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });
      const d = await r.json();
      if (d.error) {
        alert(d.error);
      } else {
        alert('Platform settings updated successfully!');
        fetchAdminData();
        fetchConfig();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleToggleGame = async (gameId: string, isEnabled: boolean) => {
    try {
      const r = await fetch(`/api/admin/games/${gameId}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isEnabled })
      });
      if (r.ok) {
        await fetchGamesList();
      } else {
        const data = await r.json();
        alert(data.error || 'Failed to toggle game status');
      }
    } catch (e: any) {
      alert(e.message || 'Error toggling game');
    }
  };

  // Helper quick fills for credentials
  const fillQuickCredentials = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setMobile('9999999999');
      setPassword('admin123');
    } else {
      setMobile('8888888888');
      setPassword('admin123');
    }
  };

  // Color mappings for text
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'withdraw': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'winning_credit': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'bet_deduct': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20';
    }
  };

  const isUserAdmin = user && (user.id.startsWith('admin-') || user.mobile === '9999999999');

  const glowClass = !gameState 
    ? 'glow-betting-loading' 
    : gameState.status === 'betting' 
      ? 'glow-betting-open' 
      : 'glow-betting-closed';

  if (window.location.pathname === '/payments/checkout') {
    return <JazPayCheckout onBackToApp={() => { window.location.href = '/'; }} />;
  }

  return (
    <div className={`min-h-screen bg-[#0d0f12] text-zinc-100 flex flex-col font-sans selection:bg-rose-500/30 antialiased overflow-hidden ${glowClass}`} id="main_wrapper">
      
      {/* 1. TOP HEADER BRAND BAR */}
      <header className="bg-[#12161b] border-b border-zinc-800 sticky top-0 z-40" id="top_header">
        <div className="max-w-7xl mx-auto px-4 h-16 grid grid-cols-3 items-center" id="header_grid">
          
          {/* LEFT: Menu Drawer & Brand Name */}
          <div className="flex items-center gap-2.5 justify-self-start">
            {token && (
              <button
                onClick={() => { playClickSound(); setIsMobileSidebarOpen(true); }}
                className="lg:hidden p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 transition"
                title="Open Navigation Drawer"
                aria-label="Open navigation menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}
            <div>
              <span className="font-extrabold text-sm sm:text-base md:text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                VeloWager Pro
              </span>
            </div>
          </div>

          {/* CENTER: Wallet Option */}
          <div className="justify-self-center">
            {token && (
              /* STAKE-STYLE HEADER BALANCE CONTROL */
              <div className="relative flex items-center bg-[#0d0f12] border border-zinc-850 rounded-xl p-0.5 shadow-inner scale-90 sm:scale-100">
                {/* Currency Dropdown Selector */}
                <button
                  onClick={() => {
                    playClickSound();
                    setIsBalanceDropdownOpen(!isBalanceDropdownOpen);
                  }}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 hover:bg-zinc-800/50 rounded-lg transition text-left"
                  title="Switch active currency view"
                  aria-label="Switch active currency view"
                >
                  <span className="text-xs">
                    {activeCurrency === 'INR' && <span className="text-emerald-400 font-extrabold font-sans">₹</span>}
                    {activeCurrency === 'USDT' && <span className="text-emerald-500 font-extrabold font-mono">₮</span>}
                    {activeCurrency === 'BTC' && <span className="text-amber-500 font-extrabold font-mono">₿</span>}
                    {activeCurrency === 'ETH' && <span className="text-purple-400 font-extrabold font-mono">Ξ</span>}
                    {activeCurrency === 'TRX' && <span className="text-rose-500 font-extrabold font-mono">₮</span>}
                  </span>
                  <span className="text-[11px] sm:text-xs font-black font-mono text-white">
                    {(() => {
                      const totalInr = wallet ? (wallet.balance + wallet.promoBalance) : 0;
                      if (activeCurrency === 'INR') return `₹${totalInr.toFixed(2)}`;
                      const rate = CRYPTO_RATES[activeCurrency];
                      const converted = totalInr / rate;
                      return `${converted.toLocaleString(undefined, { 
                        minimumFractionDigits: activeCurrency === 'TRX' ? 2 : 4, 
                        maximumFractionDigits: activeCurrency === 'BTC' ? 8 : activeCurrency === 'ETH' ? 6 : 4 
                      })} ${activeCurrency}`;
                    })()}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${isBalanceDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* WALLET TRIGGER BUTTON */}
                <button
                  onClick={() => {
                    playClickSound();
                    setWalletModalTab('deposit');
                    setIsWalletModalOpen(true);
                  }}
                  className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-zinc-950 font-black text-[10px] sm:text-[11px] uppercase tracking-wider px-2.5 sm:px-3.5 py-1.5 rounded-lg shadow-lg shadow-emerald-500/10 transition flex items-center gap-1"
                  title="Open VeloWager Wallet"
                  aria-label="Open VeloWager Wallet"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Wallet</span>
                </button>

                {/* Dropdown Menu Overlay */}
                <AnimatePresence>
                  {isBalanceDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsBalanceDropdownOpen(false)}></div>
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.12 }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 bg-[#12161b] border border-zinc-850 rounded-2xl shadow-2xl p-2 z-50 overflow-hidden"
                      >
                        <div className="px-3 py-2 border-b border-zinc-900 mb-1">
                          <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Display Wallet Currencies</span>
                        </div>
                        
                        {/* Currencies options */}
                        <div className="space-y-1">
                          {[
                            { code: 'INR', name: 'Indian Rupee', symbol: '₹', color: 'text-emerald-400' },
                            { code: 'USDT', name: 'Tether TRC20', symbol: '₮', color: 'text-emerald-500' },
                            { code: 'BTC', name: 'Bitcoin Network', symbol: '₿', color: 'text-amber-500' },
                            { code: 'ETH', name: 'Ethereum Network', symbol: 'Ξ', color: 'text-purple-400' },
                            { code: 'TRX', name: 'TRON Chain', symbol: '₮', color: 'text-rose-500' }
                          ].map((coin) => {
                            const totalInr = wallet ? (wallet.balance + wallet.promoBalance) : 0;
                            const converted = coin.code === 'INR' ? totalInr : (totalInr / CRYPTO_RATES[coin.code as any]);
                            return (
                              <button
                                key={coin.code}
                                onClick={() => {
                                  playClickSound();
                                  setActiveCurrency(coin.code as any);
                                  setIsBalanceDropdownOpen(false);
                                }}
                                className={`w-full flex items-center justify-between p-2 rounded-xl transition ${activeCurrency === coin.code ? 'bg-zinc-800/80 border border-zinc-700/50' : 'hover:bg-zinc-900/50'}`}
                                aria-label={`Select ${coin.name} (${coin.code}) currency`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={`w-6 h-6 rounded-lg bg-zinc-950 flex items-center justify-center font-bold text-sm ${coin.color}`}>
                                    {coin.symbol}
                                  </span>
                                  <div className="text-left">
                                    <span className="text-xs font-black text-white block leading-tight">{coin.code}</span>
                                    <span className="text-[9px] text-zinc-500 block leading-tight">{coin.name}</span>
                                  </div>
                                </div>
                                <span className="text-xs font-bold text-zinc-300 font-mono">
                                  {converted.toLocaleString(undefined, { 
                                    minimumFractionDigits: coin.code === 'TRX' ? 2 : 4, 
                                    maximumFractionDigits: coin.code === 'BTC' ? 8 : coin.code === 'ETH' ? 6 : 4 
                                  })}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* RIGHT: Profile Icon / SignIn CTA */}
          <div className="justify-self-end flex items-center gap-3">
            {token ? (
              <>
                {/* NOTIFICATION BELL WITH PREMIUM INTERACTIVE DROPDOWN */}
                <div className="relative" id="notif_bell_container">
                  <button
                    onClick={() => {
                      playClickSound();
                      setIsNotificationsDropdownOpen(!isNotificationsDropdownOpen);
                      fetchNotifications();
                    }}
                    className={`relative p-2 rounded-xl border transition ${
                      isNotificationsDropdownOpen
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-805'
                    }`}
                    title="System Notifications"
                    aria-label="View system notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-[#0c0d10] animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNotificationsDropdownOpen && (
                      <>
                        {/* Invisible click handler backdrop */}
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsNotificationsDropdownOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 12, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2.5 w-80 bg-[#12161b] border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                          <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                              <h4 className="text-[11px] font-black text-white tracking-wider uppercase">Notifications</h4>
                            </div>
                            {unreadCount > 0 && (
                              <button
                                onClick={async () => {
                                  playClickSound();
                                  await handleNotificationsRead();
                                }}
                                className="text-[10px] font-bold text-rose-400 hover:text-rose-300 transition"
                              >
                                Mark all as read
                              </button>
                            )}
                          </div>

                          <div className="max-h-72 overflow-y-auto divide-y divide-zinc-850 custom-scrollbar">
                            {notifications.length === 0 ? (
                              <div className="p-8 text-center text-zinc-500 text-xs">
                                <Bell className="w-8 h-8 text-zinc-700 mx-auto mb-2 opacity-50" />
                                <p className="font-semibold text-zinc-400">All caught up!</p>
                                <p className="text-[10px] text-zinc-600 mt-1">No system alerts found.</p>
                              </div>
                            ) : (
                              notifications.map((notif) => (
                                <div
                                  key={notif.id}
                                  className={`p-3.5 transition text-left relative ${
                                    notif.isRead ? 'bg-transparent' : 'bg-rose-500/[0.02]'
                                  }`}
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <div className="flex items-start gap-1.5">
                                      {!notif.isRead && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5"></span>
                                      )}
                                      <span className={`text-xs font-bold leading-snug ${
                                        notif.isRead ? 'text-zinc-300' : 'text-rose-400'
                                      }`}>
                                        {notif.title}
                                      </span>
                                    </div>
                                    <span className="text-[9px] text-zinc-500 shrink-0 font-mono">
                                      {new Date(notif.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-zinc-400 mt-1 leading-normal pl-3">
                                    {notif.content}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* PROFILE ICON ON RIGHT SIDE UPPER CORNER */}
                <button
                  onClick={() => {
                    playClickSound();
                    setActiveTab('profile');
                    fetchNotifications();
                  }}
                  className={`flex items-center gap-2 p-1.5 rounded-xl border transition ${
                    activeTab === 'profile'
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-805'
                  }`}
                  title="My Account Settings & Profile"
                  aria-label="My Account Settings and Profile"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/20 text-rose-400 flex items-center justify-center relative shadow-sm shrink-0">
                    <UserIcon className="w-4 h-4" />
                    {/* Tiny VIP badge icon */}
                    {wallet && (
                      <span className="absolute -top-1 -right-1 text-[8px] bg-zinc-950 px-1 border border-zinc-800 rounded-full font-black scale-90 leading-none">
                        {getVipLevel(wallet.completedWagering ?? 0).icon}
                      </span>
                    )}
                  </div>
                  <div className="hidden sm:block text-left text-xs leading-none">
                    <span className="font-extrabold text-zinc-300 block">Profile</span>
                    <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">
                      {user?.username || 'Guest'}
                    </span>
                  </div>
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Global Announcement Marquee Bar */}
        {platformConfig && platformConfig.announcements && platformConfig.announcements.length > 0 && (
          <div className="bg-[#181d24] border-t border-zinc-800/80 px-4 py-1.5 text-xs text-rose-300/95 flex items-center overflow-hidden gap-3" id="marquee_bar">
            <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0 font-mono">
              <Flame className="w-3 h-3 text-rose-500 animate-pulse" />
              <span>NOTICE</span>
            </span>
            <div className="w-full relative h-4 overflow-hidden">
              <div className="absolute inset-0 flex items-center transition-transform duration-500 ease-in-out">
                <span className="truncate font-medium">{platformConfig.announcements[activeMarqueeIndex]}</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 2. MAIN HUB CONTENT CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 flex flex-col gap-6" id="main_grid_container">
        
        {/* IF MAINTENANCE MODE ACTIVE Banner */}
        {platformConfig?.isMaintenanceMode && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3 text-amber-300 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 animate-pulse" />
            <div>
              <span className="font-bold">System Maintenance In Progress: </span>
              {platformConfig.maintenanceMessage}
            </div>
          </div>
        )}

        {/* IF NOT LOGGED IN SHOW AUTH PORTAL */}
        {!token ? (
          <>
          <LandingPage />
          <div className="max-w-md w-full mx-auto my-20 bg-[#12161b] border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 scroll-mt-24" id="auth_portal">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-white tracking-tight">Onboarding Gateway</h2>
              <p className="text-xs text-zinc-400 mt-1">Access the premium VeloWager online Color Trading & Bet platform</p>
            </div>

            {/* Auth mode selector tabs */}
            <div className="grid grid-cols-2 bg-zinc-900 p-1 rounded-lg mb-6 border border-zinc-800">
              <button 
                onClick={() => { setAuthMode('login'); setAuthError(null); setAuthSuccess(null); setShow2FAInput(false); setTwoFactorCode(''); }}
                className={`py-2 text-xs font-bold rounded-md transition ${authMode === 'login' ? 'bg-[#1c222b] text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setAuthMode('register'); setAuthError(null); setAuthSuccess(null); setShow2FAInput(false); setTwoFactorCode(''); }}
                className={`py-2 text-xs font-bold rounded-md transition ${authMode === 'register' ? 'bg-[#1c222b] text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Register
              </button>
            </div>

            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg mb-4 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-lg mb-4 flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{authSuccess}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4" id="frm_auth">
              {authMode === 'login' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Username or Email Address
                  </label>
                  <input 
                    type="text" 
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="Username or Email" 
                    maxLength={50}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition font-sans"
                    id="inp_auth_mobile"
                  />
                </div>
              )}

              {authMode === 'forgot' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com" 
                    maxLength={50}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition font-sans"
                    id="inp_auth_forgot_email"
                  />
                </div>
              )}

              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Username</label>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username" 
                      maxLength={30}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition font-sans"
                      id="inp_auth_username"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com" 
                      maxLength={50}
                      className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition font-sans"
                      id="inp_auth_email"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1">
                  {authMode === 'forgot' ? 'New Secure Password' : 'Password'}
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition font-mono"
                  id="inp_auth_password"
                />
              </div>

              {authMode === 'login' && show2FAInput && (
                <div className="animate-fadeIn p-3 bg-zinc-950 rounded-lg border border-emerald-500/20 space-y-1">
                  <label className="block text-xs font-black text-emerald-400 uppercase tracking-wider">
                    Google Authenticator Code
                  </label>
                  <input 
                    type="text" 
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000" 
                    maxLength={6}
                    className="w-full bg-zinc-900 border border-emerald-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 rounded-lg py-2.5 px-3.5 text-sm text-white placeholder-zinc-700 focus:outline-none transition font-mono tracking-widest text-center text-base"
                    id="inp_auth_2fa_code"
                    autoFocus
                  />
                  <p className="text-[9px] text-zinc-500">
                    Your account is shielded with 2FA. Enter the active 6-digit MFA token from your Google Authenticator app.
                  </p>
                </div>
              )}

              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">Referral Code (Optional)</label>
                  <input 
                    type="text" 
                    value={referredByCode}
                    onChange={(e) => setReferredByCode(e.target.value)}
                    placeholder="e.g. ADMINREF" 
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none uppercase transition font-mono"
                    id="inp_auth_ref"
                  />
                </div>
              )}

              {(authMode === 'register' || authMode === 'forgot') && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">OTP Verification Code</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456" 
                      maxLength={6}
                      className="bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none transition font-mono grow"
                      id="inp_auth_otp"
                    />
                    <button 
                      type="button"
                      onClick={handleRequestOtp}
                      className="bg-[#1c222b] hover:bg-[#252e3b] text-zinc-200 border border-zinc-800 px-4 rounded-lg text-xs font-bold transition shrink-0"
                    >
                      Send OTP
                    </button>
                  </div>
                </div>
              )}

              {authMode === 'login' && (
                <div className="text-right">
                  <button 
                    type="button" 
                    onClick={() => { setAuthMode('forgot'); setAuthError(null); setAuthSuccess(null); }}
                    className="text-xs text-rose-400 hover:text-rose-300 transition"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-lg py-3 font-bold transition text-sm tracking-wide shadow-lg shadow-rose-500/10 mt-2"
                id="btn_auth_submit"
              >
                {authMode === 'login' ? 'Proceed Secure Sign-In' : authMode === 'register' ? 'Submit Registration' : 'Update Password'}
              </button>

              {platformConfig?.googleOAuthEnabled && <><div className="relative my-6 py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-850"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#12161b] px-3 text-zinc-500 font-bold">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={googleLoading}
                className="w-full bg-[#181d24] hover:bg-[#202731] border border-zinc-800 text-zinc-200 hover:text-white rounded-lg py-2.5 px-4 font-bold transition text-xs flex items-center justify-center gap-2.5 shadow-sm"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>{googleLoading ? 'Connecting Google Account...' : authMode === 'login' ? 'Sign In with Google' : 'Sign Up with Google'}</span>
              </button></>}

            </form>
          </div>
          </>
        ) : (
          /* OTHERWISE FULLY LOGGED IN APPLICATION FLOW */
          <div className="flex w-full gap-6 items-start" id="logged_in_container">
            {/* 1. LEFT PERSISTENT SIDEBAR FOR DESKTOP */}
            <aside 
              className={`hidden lg:flex flex-col bg-[#12161b] border border-zinc-800 rounded-2xl p-4 transition-all duration-300 shrink-0 sticky top-20 self-start ${
                isSidebarExpanded ? 'w-64' : 'w-20'
              }`}
            >
              {/* Expand / Collapse Control */}
              <div className="flex justify-between items-center mb-6 pb-2 border-b border-zinc-800/60">
                {isSidebarExpanded && (
                  <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">VeloWager Navigation</span>
                )}
                <button
                  onClick={() => { playClickSound(); setIsSidebarExpanded(!isSidebarExpanded); }}
                  className={`p-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-850 transition ${!isSidebarExpanded ? 'mx-auto' : ''}`}
                  title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                  {isSidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>

              {/* Sidebar Menu Links */}
              <div className="space-y-1.5 flex-grow">
                {[
                  {
                    id: 'game',
                    name: 'Arcade Games',
                    icon: <Gamepad2 className="w-4 h-4" />,
                    onClick: () => { playClickSound(); setActiveTab('game'); setShowGameLobby(true); }
                  },
                  {
                    id: 'sports',
                    name: 'Sports Betting',
                    icon: <Award className="w-4 h-4 text-purple-300" />,
                    onClick: () => { playClickSound(); setActiveTab('sports'); }
                  },
                  {
                    id: 'sports-bets',
                    name: 'My Sports Bets',
                    icon: <History className="w-4 h-4 text-cyan-400" />,
                    onClick: () => { playClickSound(); setActiveTab('sports-bets'); }
                  },
                  {
                    id: 'my-bets',
                    name: 'My Bets Log',
                    icon: <History className="w-4 h-4 text-emerald-400" />,
                    onClick: () => { playClickSound(); setActiveTab('my-bets'); fetchBets(); }
                  },
                  {
                    id: 'transactions',
                    name: 'Transactions Log',
                    icon: <Wallet className="w-4 h-4" />,
                    onClick: () => {
                      playClickSound();
                      setActiveTab('wallet');
                      fetchWallet();
                      fetchTransactions();
                      setWalletModalTab('transactions');
                      setIsWalletModalOpen(true);
                    }
                  },
                  {
                    id: 'referrals',
                    name: 'Referral Team',
                    icon: <Users className="w-4 h-4" />,
                    onClick: () => { playClickSound(); setActiveTab('referrals'); fetchReferrals(); }
                  },
                  {
                    id: 'vip',
                    name: 'VIP Loyalty Levels',
                    icon: <Award className="w-4 h-4" />,
                    onClick: () => { playClickSound(); setIsVipModalOpen(true); }
                  },
                  {
                    id: 'settings',
                    name: 'Settings',
                    icon: <Settings className="w-4 h-4" />,
                    onClick: () => { playClickSound(); setActiveTab('profile'); fetchNotifications(); }
                  },
                  {
                    id: 'tickets',
                    name: 'Support & Tickets',
                    icon: <LifeBuoy className="w-4 h-4 text-rose-400" />,
                    onClick: () => { playClickSound(); setActiveTab('tickets'); fetchUserTickets(); }
                  },
                  ...(isUserAdmin ? [{
                    id: 'admin',
                    name: 'Admin Console',
                    icon: <Lock className="w-4 h-4 text-amber-400" />,
                    onClick: () => { playClickSound(); setActiveTab('admin'); fetchAdminData(); }
                  }] : [])
                ].map((item) => {
                  const isActive = activeTab === item.id || (item.id === 'settings' && activeTab === 'profile');
                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className={`w-full flex items-center rounded-xl p-3 text-xs font-bold transition duration-200 ${
                        isSidebarExpanded ? 'justify-start gap-3 px-4' : 'justify-center px-1'
                      } ${
                        isActive
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/10'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                      }`}
                      title={item.name}
                    >
                      <div className="shrink-0">{item.icon}</div>
                      {isSidebarExpanded && <span className="truncate">{item.name}</span>}
                    </button>
                  );
                })}
              </div>

              {/* Sidebar Logout Button at bottom */}
              <div className="pt-6 mt-6 border-t border-zinc-800/60">
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center rounded-xl p-3 text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-500/15 border border-rose-500/10 transition duration-200 ${
                    isSidebarExpanded ? 'justify-start gap-3 px-4' : 'justify-center px-1'
                  }`}
                  title="Logout Session"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  {isSidebarExpanded && <span>Logout Session</span>}
                </button>
              </div>
            </aside>

            {/* MOBILE SIDEBAR DRAWER OVERLAY */}
            <AnimatePresence>
              {isMobileSidebarOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                  />
                  {/* Slide-out Sidebar Drawer */}
                  <motion.aside
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed inset-y-0 left-0 z-50 w-72 bg-[#12161b] border-r border-zinc-800 p-5 flex flex-col shadow-2xl lg:hidden"
                  >
                    {/* Drawer Header */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-rose-500 text-white rounded-xl p-1.5 font-black text-xs flex items-center gap-1 shadow-md">
                          <Gamepad2 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-sm block leading-none text-white">WinGo Portal</span>
                          <span className="text-[9px] text-zinc-500 uppercase font-black tracking-wider block mt-1">Mobile Navigation</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsMobileSidebarOpen(false)}
                        className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Drawer Links */}
                    <div className="space-y-1.5 flex-grow overflow-y-auto">
                      {[
                        {
                          id: 'game',
                          name: 'Arcade Games',
                          icon: <Gamepad2 className="w-4 h-4" />,
                          onClick: () => { playClickSound(); setActiveTab('game'); setShowGameLobby(true); setIsMobileSidebarOpen(false); }
                        },
                        {
                          id: 'sports',
                          name: 'Sports Betting',
                          icon: <Award className="w-4 h-4 text-purple-300" />,
                          onClick: () => { playClickSound(); setActiveTab('sports'); setIsMobileSidebarOpen(false); }
                        },
                        {
                          id: 'sports-bets',
                          name: 'My Sports Bets',
                          icon: <History className="w-4 h-4 text-cyan-400" />,
                          onClick: () => { playClickSound(); setActiveTab('sports-bets'); setIsMobileSidebarOpen(false); }
                        },
                        {
                          id: 'my-bets',
                          name: 'My Bets Log',
                          icon: <History className="w-4 h-4 text-emerald-400" />,
                          onClick: () => { playClickSound(); setActiveTab('my-bets'); fetchBets(); setIsMobileSidebarOpen(false); }
                        },
                        {
                          id: 'transactions',
                          name: 'Transactions Log',
                          icon: <Wallet className="w-4 h-4" />,
                          onClick: () => {
                            playClickSound();
                            setActiveTab('wallet');
                            fetchWallet();
                            fetchTransactions();
                            setWalletModalTab('transactions');
                            setIsWalletModalOpen(true);
                            setIsMobileSidebarOpen(false);
                          }
                        },
                        {
                          id: 'referrals',
                          name: 'Referral Team',
                          icon: <Users className="w-4 h-4" />,
                          onClick: () => { playClickSound(); setActiveTab('referrals'); fetchReferrals(); setIsMobileSidebarOpen(false); }
                        },
                        {
                          id: 'vip',
                          name: 'VIP Loyalty Levels',
                          icon: <Award className="w-4 h-4" />,
                          onClick: () => { playClickSound(); setIsVipModalOpen(true); setIsMobileSidebarOpen(false); }
                        },
                        {
                          id: 'settings',
                          name: 'Settings',
                          icon: <Settings className="w-4 h-4" />,
                          onClick: () => { playClickSound(); setActiveTab('profile'); fetchNotifications(); setIsMobileSidebarOpen(false); }
                        },
                        {
                          id: 'tickets',
                          name: 'Support & Tickets',
                          icon: <LifeBuoy className="w-4 h-4 text-rose-400" />,
                          onClick: () => { playClickSound(); setActiveTab('tickets'); fetchUserTickets(); setIsMobileSidebarOpen(false); }
                        },
                        ...(isUserAdmin ? [{
                          id: 'admin',
                          name: 'Admin Console',
                          icon: <Lock className="w-4 h-4 text-amber-400" />,
                          onClick: () => { playClickSound(); setActiveTab('admin'); fetchAdminData(); setIsMobileSidebarOpen(false); }
                        }] : [])
                      ].map((item) => {
                        const isActive = activeTab === item.id || (item.id === 'settings' && activeTab === 'profile');
                        return (
                          <button
                            key={item.id}
                            onClick={item.onClick}
                            className={`w-full flex items-center gap-3 rounded-xl p-3.5 text-xs font-bold transition duration-200 ${
                              isActive
                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/10'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }`}
                          >
                            <div className="shrink-0">{item.icon}</div>
                            <span className="truncate">{item.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Drawer Footer / Logout */}
                    <div className="pt-4 border-t border-zinc-800">
                      {/* Tiny VIP badge details */}
                      {wallet && (
                        (() => {
                          const vip = getVipLevel(wallet.completedWagering ?? 0);
                          return (
                            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 mb-4 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{vip.icon}</span>
                                <div className="text-left">
                                  <span className="text-[10px] text-zinc-500 uppercase font-bold block leading-none">VIP Class</span>
                                  <span className="text-xs font-black text-white block mt-0.5">{vip.level}</span>
                                </div>
                              </div>
                              <span className="text-[9px] font-mono text-zinc-400">₹{(wallet.completedWagering ?? 0).toFixed(0)} Wager</span>
                            </div>
                          );
                        })()
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2.5 rounded-xl p-3 text-xs font-black uppercase tracking-wider text-rose-400 hover:text-white hover:bg-rose-500/10 border border-rose-500/10 transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout Session</span>
                      </button>
                    </div>
                  </motion.aside>
                </>
              )}
            </AnimatePresence>

            {/* 2. MAIN WORKSPACE */}
            <div className="flex-1 flex flex-col gap-6 w-full min-w-0" id="main_workspace">
              {/* TAB VIEW PANELS */}
              <div id="tab_view_panel">
              
              {/* ========================================================
                  TAB 1: COLOR TRADING GAME SCREEN
                 ======================================================== */}
              {activeTab === 'game' && (
                <div className="space-y-6 w-full" id="panel_game_wrapper">
                  {showGameLobby && (
                    <div className="space-y-6">
                      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-[#1b1324] via-[#12161b] to-[#101317] p-6 sm:p-8 shadow-2xl">
                        <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
                        <div className="relative">
                          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-400">VeloWager Pro Arcade</span>
                          <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white">Choose your game</h2>
                          <p className="mt-2 max-w-xl text-xs sm:text-sm text-zinc-400">Select a game to start playing and join thousands of active players.</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {[
                          { id: 'wingo', gameId: 'color-trading', name: 'WinGo Color', icon: '🎨', players: 1284, description: 'Predict colors and numbers in rapid timed draws.', accent: 'from-purple-500/25 to-fuchsia-500/5' },
                          { id: 'mines', gameId: 'mine', name: 'Mines Arcade', icon: '💣', players: 876, description: 'Reveal safe tiles and cash out before finding a mine.', accent: 'from-emerald-500/20 to-cyan-500/5' },
                          { id: 'crash', gameId: 'crash', name: 'Crash Multiplier', icon: '🚀', players: 1542, description: 'Cash out while the live multiplier keeps climbing.', accent: 'from-orange-500/20 to-rose-500/5' },
                          { id: 'flip', gameId: 'flip', name: 'Coin Flip', icon: '🪙', players: 643, description: 'Choose heads or tails for a fast instant result.', accent: 'from-amber-500/20 to-yellow-500/5' },
                          { id: 'wheel', gameId: 'wheel', name: 'Lucky Spin', icon: '🎡', players: 391, description: 'Spin the daily reward wheel and reveal your prize.', accent: 'from-blue-500/20 to-purple-500/5' }
                        ].filter(game => {
                          const status = gamesList.find(item => item.id === game.gameId);
                          return status ? status.isEnabled : true;
                        }).map(game => (
                          <button key={game.id} onClick={() => { playClickSound(); setSelectedGameTab(game.id as any); setShowGameLobby(false); }} className="group overflow-hidden rounded-2xl border border-zinc-800 bg-[#12161b] text-left shadow-xl transition hover:-translate-y-1 hover:border-purple-500/40 hover:shadow-purple-500/10">
                            <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${game.accent}`}>
                              <span className="text-6xl drop-shadow-2xl transition-transform duration-300 group-hover:scale-110">{game.icon}</span>
                              <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-zinc-950/80 px-2.5 py-1 text-[9px] font-black text-emerald-400"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE</span>
                            </div>
                            <div className="p-4">
                              <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-black text-white">{game.name}</h3><p className="mt-1.5 text-[11px] leading-relaxed text-zinc-500">{game.description}</p></div><ChevronRight className="mt-1 h-4 w-4 shrink-0 text-zinc-600 transition group-hover:translate-x-1 group-hover:text-purple-400" /></div>
                              <div className="mt-4 flex items-center gap-2 border-t border-zinc-900 pt-3 text-[10px] font-bold text-zinc-400"><Users className="h-3.5 w-3.5 text-purple-400" /><span className="font-mono text-white">{game.players.toLocaleString()}</span><span>people playing</span></div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className={showGameLobby ? 'hidden' : 'contents'}>
                  {/* Arcade Game Selector Sub-tabs */}
                  <div className="flex items-center [&>span]:hidden [&>div]:hidden">
                    <button onClick={() => { playClickSound(); setShowGameLobby(true); }} className="self-start sm:self-auto flex shrink-0 items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-black text-zinc-300 transition hover:border-purple-500/40 hover:text-white">
                      <ChevronLeft className="w-4 h-4 text-purple-400" /> Back to Games
                    </button>
                    <span className="text-xs font-black uppercase text-zinc-400 font-sans tracking-widest pl-2">🎮 Choose Arcade Game:</span>
                    <div className="flex gap-2 overflow-x-auto scrollbar-none w-full sm:w-auto">
                      {[
                        { id: 'wingo', name: '🎨 WinGo Color', gameId: 'color-trading' },
                        { id: 'mines', name: '💣 Mines Arcade', gameId: 'mine' },
                        { id: 'crash', name: '🚀 Crash Multiplier', gameId: 'crash' },
                        { id: 'flip', name: '🪙 Coin Flip', gameId: 'flip' },
                        { id: 'wheel', name: '🎡 Lucky Spin', gameId: 'wheel' }
                      ].filter((tg) => {
                        const gState = gamesList.find(x => x.id === tg.gameId);
                        return gState ? gState.isEnabled : true;
                      }).map((tg) => {
                        return (
                          <button
                            key={tg.id}
                            onClick={() => { playClickSound(); setSelectedGameTab(tg.id as any); }}
                            className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-extrabold rounded-xl border transition flex items-center justify-center gap-1.5 shrink-0 ${
                              selectedGameTab === tg.id
                                ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20 font-black'
                                : 'bg-zinc-900 border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                            }`}
                          >
                            <span>{tg.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedGameTab === 'wingo' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="panel_game">
                  
                  {/* Left Column (Betting Form & Clock) */}
                  <div className="lg:col-span-2 flex flex-col gap-6">
                    
                    {/* Time mode selector header */}
                    <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-4 flex justify-between items-center overflow-x-auto gap-2">
                      <div className="flex items-center gap-2 font-black text-sm uppercase text-zinc-300">
                        <Clock className="w-4 h-4 text-rose-500" />
                        <span>Draw Timer:</span>
                      </div>
                      <div className="flex gap-1.5">
                        {(['30s', '1m', '3m', '5m'] as const).map((m) => (
                          <button 
                            key={m}
                            onClick={() => { playClickSound(); setSelectedMode(m); }}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition ${selectedMode === m ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400'}`}
                          >
                            {m === '30s' ? '30 Sec' : m === '1m' ? '1 Min' : m === '3m' ? '3 Min' : '5 Min'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clock & active period */}
                    <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl"></div>
                      <div>
                        <span className="text-zinc-500 text-xs font-semibold block uppercase tracking-wider">Active Period Number</span>
                        <span className="text-xl sm:text-2xl font-black text-white font-mono mt-1 block">
                          {gameState ? gameState.periodNumber : 'Loading...'}
                        </span>
                        <div className="flex items-center gap-1.5 mt-2 text-xs">
                          <AnimatePresence mode="wait">
                            {gameState && gameState.status === 'betting' ? (
                              <motion.span
                                key="betting-open"
                                initial={{ opacity: 0, scale: 0.9, y: -2 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 2 }}
                                transition={{ duration: 0.2 }}
                                className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold inline-flex items-center"
                              >
                                Betting Open
                              </motion.span>
                            ) : (
                              <motion.span
                                key="betting-closed"
                                initial={{ opacity: 0, scale: 0.9, y: -2 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 2 }}
                                transition={{ duration: 0.2 }}
                                className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-bold flex items-center gap-1"
                              >
                                <Lock className="w-3 h-3" /> Betting Closed
                              </motion.span>
                            )}
                          </AnimatePresence>
                          <span className="text-zinc-400 font-mono">Min Bet: ₹{platformConfig?.minDeposit ? '10' : '10'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-zinc-500 text-xs font-semibold block uppercase tracking-wider">Countdown</span>
                          <span className="text-xs text-rose-300 font-semibold">Remaining seconds</span>
                        </div>
                        <div className="bg-zinc-900/90 border border-zinc-800 px-6 py-4 rounded-2xl flex items-center justify-center min-w-[120px] shadow-inner">
                          <span className={`text-4xl font-black font-mono tracking-tight ${gameState && gameState.timeLeft <= (gameState.closeTime || 5) ? 'text-rose-500 animate-pulse' : 'text-rose-400'}`}>
                            {gameState ? (
                              `${Math.floor(gameState.timeLeft / 60)}:${String(gameState.timeLeft % 60).padStart(2, '0')}`
                            ) : (
                              '--:--'
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Prediction Placement Pad */}
                    <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl relative">
                      <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4.5 h-4.5 text-rose-500" />
                        <span>Place Predictions</span>
                      </h3>

                      {gameState && gameState.status !== 'betting' && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2 rounded-2xl">
                          <Lock className="w-10 h-10 text-rose-500 animate-pulse" />
                          <span className="text-lg font-black text-white">Betting is Locked!</span>
                          <span className="text-xs text-zinc-400 font-semibold">Please wait for next period start</span>
                        </div>
                      )}

                      {bettingError && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg mb-4">
                          {bettingError}
                        </div>
                      )}

                      {bettingSuccess && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-lg mb-4">
                          {bettingSuccess}
                        </div>
                      )}

                      {/* 1. Quick Color Selector buttons */}
                      <div className="grid grid-cols-3 gap-3 mb-6">
                        <button 
                          onClick={() => { playClickSound(); setBetType('color'); setBetValue('green'); }}
                          className={`py-3.5 px-2 text-xs uppercase font-black tracking-wider rounded-xl transition-all duration-200 border ${betType === 'color' && betValue === 'green' ? 'bg-emerald-600 border-white text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'}`}
                        >
                          🟢 Green
                        </button>
                        <button 
                          onClick={() => { playClickSound(); setBetType('color'); setBetValue('violet'); }}
                          className={`py-3.5 px-2 text-xs uppercase font-black tracking-wider rounded-xl transition-all duration-200 border ${betType === 'color' && betValue === 'violet' ? 'bg-indigo-600 border-white text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-500' : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/20'}`}
                        >
                          🟣 Violet
                        </button>
                        <button 
                          onClick={() => { playClickSound(); setBetType('color'); setBetValue('red'); }}
                          className={`py-3.5 px-2 text-xs uppercase font-black tracking-wider rounded-xl transition-all duration-200 border ${betType === 'color' && betValue === 'red' ? 'bg-red-600 border-white text-white shadow-lg shadow-red-600/30 ring-2 ring-red-500' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'}`}
                        >
                          🔴 Red
                        </button>
                      </div>

                      {/* 2. Number Prediction Grid */}
                      <div className="mb-6">
                        <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Guess Correct Number (Pays 9x)</span>
                        <div className="grid grid-cols-5 gap-2.5">
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                            // Map number color mapping
                            const isVioletSecondary = num === 0 || num === 5;
                            const isGreen = [1, 3, 7, 9, 5].includes(num);
                            let borderCol = isGreen ? 'border-emerald-500/20 hover:border-emerald-500/50 text-emerald-400 bg-emerald-500/5' : 'border-red-500/20 hover:border-red-500/50 text-red-400 bg-red-500/5';
                            if (isVioletSecondary) {
                              borderCol = 'border-indigo-500/20 hover:border-indigo-500/50 text-indigo-400 bg-indigo-500/5';
                            }

                            const isActive = betType === 'number' && betValue === String(num);
                            const activeClass = isActive ? 'bg-rose-500 border-white text-white shadow-lg scale-105 ring-2 ring-rose-400' : borderCol;

                            return (
                              <button 
                                key={num}
                                onClick={() => { playClickSound(); setBetType('number'); setBetValue(String(num)); }}
                                className={`h-12 text-sm font-black rounded-lg border transition duration-200 flex items-center justify-center ${activeClass}`}
                              >
                                {num}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. Betting Sheet Calculator Drawer */}
                      {betType && (
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-fade-in">
                          <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-800">
                            <span className="text-xs text-zinc-400 font-semibold">
                              Betting on: <strong className="text-rose-400 font-black uppercase font-mono">{betType} ({betValue})</strong>
                            </span>
                            <button onClick={() => setBetType(null)} className="text-zinc-500 hover:text-zinc-300">
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Base Chips Selectors */}
                          <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                            {CHIP_VALUES.map((val) => (
                              <button 
                                key={val}
                                type="button"
                                onClick={() => { playClickSound(); setBetAmount(val); }}
                                className={`px-3 py-1.5 text-xs font-mono font-bold rounded border transition shrink-0 ${betAmount === val ? 'bg-rose-500/20 border-rose-500 text-rose-400 font-extrabold' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 text-zinc-400'}`}
                              >
                                ₹{val}
                              </button>
                            ))}
                          </div>

                          {/* Multiplier Adjustment */}
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-zinc-500 font-semibold">Multiplier Factor</span>
                            <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-lg p-1">
                              <button 
                                type="button"
                                onClick={() => { playClickSound(); setBetMultiplier(Math.max(1, betMultiplier - 1)); }}
                                className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 font-extrabold"
                              >
                                -
                              </button>
                              <input 
                                type="number" 
                                value={betMultiplier}
                                onChange={(e) => setBetMultiplier(Math.max(1, parseInt(e.target.value, 10) || 1))}
                                className="w-12 bg-transparent text-center font-mono font-bold focus:outline-none"
                              />
                              <button 
                                type="button"
                                onClick={() => { playClickSound(); setBetMultiplier(betMultiplier + 1); }}
                                className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 font-extrabold"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="bg-[#1c222b] rounded-lg p-3.5 mb-4 flex justify-between items-center border border-zinc-800">
                            <div>
                              <span className="text-[10px] text-zinc-500 block uppercase tracking-wider">Total Contract Money</span>
                              <span className="text-lg font-black text-rose-400 font-mono">₹{totalBetDeduction}</span>
                            </div>
                            <button 
                              onClick={handlePlaceBet}
                              className="bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-6 py-2 rounded-lg text-xs transition"
                            >
                              Confirm Contract Play
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* User's past local game bets played */}
                    <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                      <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider mb-4 flex items-center gap-2">
                        <Coins className="w-4.5 h-4.5 text-rose-500" />
                        <span>My Bets (Past 50 Rounds)</span>
                      </h3>
                      {loadingUserBets ? (
                        <MyBetsSkeleton />
                      ) : userBets.length === 0 ? (
                        <div className="text-center text-zinc-600 py-8 text-xs font-semibold">
                          No bets placed on your history yet. Submit a bet to start!
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
                                <th className="pb-2.5">Period No</th>
                                <th className="pb-2.5">Prediction</th>
                                <th className="pb-2.5 text-right">Deducted</th>
                                <th className="pb-2.5 text-center">Status</th>
                                <th className="pb-2.5 text-right">Win/Lose Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userBets.map((bet) => (
                                <tr key={bet.id} className="border-b border-zinc-850 hover:bg-zinc-900/50">
                                  <td className="py-3 font-mono font-bold text-zinc-300">{bet.periodNumber}</td>
                                  <td className="py-3 font-medium">
                                    <span className={`px-2 py-0.5 rounded uppercase text-[10px] ${bet.betType === 'color' ? 'bg-zinc-800 text-rose-400' : 'bg-zinc-800 text-amber-400'}`}>
                                      {bet.betType}: {bet.betValue}
                                    </span>
                                  </td>
                                  <td className="py-3 text-right font-mono font-semibold text-zinc-400">₹{bet.amount}</td>
                                  <td className="py-3 text-center">
                                    {bet.status === 'pending' ? (
                                      <span className="text-[10px] text-zinc-400 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded">Pending</span>
                                    ) : bet.status === 'won' ? (
                                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold">WON</span>
                                    ) : (
                                      <span className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded font-bold">LOST</span>
                                    )}
                                  </td>
                                  <td className={`py-3 text-right font-mono font-bold ${bet.status === 'won' ? 'text-emerald-400' : bet.status === 'lost' ? 'text-zinc-500' : 'text-zinc-300'}`}>
                                    {bet.status === 'won' ? `+₹${Number(bet.winningAmount ?? 0).toFixed(2)}` : bet.status === 'lost' ? `-₹${bet.amount}` : '--'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column (Live Trends & Draws Record) */}
                  <div className="flex flex-col gap-6">
                    
                    {/* Game information card */}
                    <div className="bg-gradient-to-br from-[#181d24] to-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl"></div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-2.5 shadow-md">
                          <Gamepad2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-white">WinGo Rule Chart</h4>
                          <p className="text-[10px] text-zinc-400">Color predictions & settlement multipliers</p>
                        </div>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                          <span className="text-zinc-400 font-medium">Guess Number (0 - 9)</span>
                          <span className="text-rose-400 font-bold font-mono">9.0x Payout</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                          <span className="text-zinc-400 font-medium">Green (1, 3, 7, 9)</span>
                          <span className="text-emerald-400 font-bold font-mono">2.0x Payout</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                          <span className="text-zinc-400 font-medium">Red (2, 4, 6, 8)</span>
                          <span className="text-red-400 font-bold font-mono">2.0x Payout</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                          <span className="text-zinc-400 font-medium">Violet (0, 5)</span>
                          <span className="text-indigo-400 font-bold font-mono">4.5x Payout</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-zinc-400 font-medium">Shared Draw (0 or 5)</span>
                          <span className="text-zinc-300 font-bold font-mono">1.5x Payout</span>
                        </div>
                      </div>
                    </div>

                    {/* Result history trends logs */}
                    <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl flex-grow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider flex items-center gap-2">
                          <TrendingUp className="w-4.5 h-4.5 text-rose-500" />
                          <span>History Records</span>
                        </h3>
                        <button 
                          onClick={() => { playClickSound(); fetchGameHistory(); }}
                          className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {loadingRoundsHistory ? (
                        <RoundHistorySkeleton />
                      ) : roundsHistory.length === 0 ? (
                        <div className="text-center text-zinc-600 py-12 text-xs font-semibold">
                          Waiting for game engine to settle initial periods...
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-thin">
                          {roundsHistory.map((round) => {
                            // Check size: 0-4 Small, 5-9 Big
                            const isBig = round.resultNumber >= 5;
                            const sizeBadge = isBig 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';

                            // Map actual drawing colors to CSS tags
                            let colorTag = 'bg-zinc-600';
                            if (round.resultColor) {
                              colorTag = COLOR_CLASSES[round.resultColor] || 'bg-zinc-600';
                            }

                            return (
                              <div key={round.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800/60 hover:border-zinc-700/60 transition">
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-zinc-300 font-mono">{round.periodNumber}</span>
                                  <span className="text-[10px] text-zinc-500 mt-0.5">Settled {new Date(round.settledAt || round.createdAt).toLocaleTimeString()}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                  {/* Result Number colored Circle */}
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white shadow-md ${colorTag}`}>
                                    {round.resultNumber}
                                  </div>

                                  {/* Size metric */}
                                  <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${sizeBadge}`}>
                                    {isBig ? 'Big' : 'Small'}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedGameTab === 'mines' && (
                <MinesGameComponent token={token} refreshWallet={fetchWallet} />
              )}

              {selectedGameTab === 'crash' && (
                <CrashGameComponent token={token} refreshWallet={fetchWallet} />
              )}

              {selectedGameTab === 'flip' && (
                <CoinFlipGameComponent token={token} refreshWallet={fetchWallet} />
              )}

              {selectedGameTab === 'wheel' && (
                <LuckyWheelComponent token={token} refreshWallet={fetchWallet} />
              )}

              {/* STAKE.COM LIVE SESSION STATS TRACKER */}
              {(() => {
                const sessionBets = userBets.filter(bet => {
                  const betTime = new Date(bet.createdAt).getTime();
                  return betTime >= sessionResetTime;
                });

                const totalSessionWagered = sessionBets.reduce((acc, b) => acc + Number(b.amount), 0);
                const sessionWins = sessionBets.filter(b => b.status === 'won');
                const sessionLosses = sessionBets.filter(b => b.status === 'lost');
                const sessionWinsCount = sessionWins.length;
                const sessionLossesCount = sessionLosses.length;

                const totalSessionProfitLoss = sessionBets.reduce((acc, b) => {
                  if (b.status === 'won') {
                    return acc + (Number(b.winningAmount) - Number(b.amount));
                  } else if (b.status === 'lost') {
                    return acc - Number(b.amount);
                  }
                  return acc;
                }, 0);

                const profitIsPositive = totalSessionProfitLoss >= 0;

                return (
                  <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden mt-6">
                    {/* Stake background accent lines */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/[0.02] rounded-full blur-3xl"></div>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-900 pb-4 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0"></div>
                        <div>
                          <h3 className="text-xs font-black uppercase text-zinc-300 tracking-wider flex items-center gap-1.5">
                            <span>🎯</span>
                            <span>VeloWager Live Session Stats Tracker</span>
                          </h3>
                          <p className="text-[10px] text-zinc-500">Track your current active session plays, wager volumes, and profit output in real-time</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          playClickSound();
                          setSessionResetTime(Date.now());
                        }}
                        className="text-[10px] font-extrabold uppercase text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 shrink-0"
                        title="Reset all active session values to zero"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reset Statistics</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* 1. Session Duration */}
                      <div className="bg-zinc-950/50 border border-zinc-900/80 rounded-xl p-3.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                          <Clock className="w-4.5 h-4.5 text-zinc-400" />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase text-zinc-500 block">Session Time</span>
                          <span className="text-xs font-bold text-white font-mono mt-0.5 block">{sessionDuration}</span>
                        </div>
                      </div>

                      {/* 2. Total Wagered Volume */}
                      <div className="bg-zinc-950/50 border border-zinc-900/80 rounded-xl p-3.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-500 shrink-0">
                          <span>🪙</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase text-zinc-500 block">Wager Volume</span>
                          <span className="text-xs font-black text-amber-400 font-mono mt-0.5 block">₹{totalSessionWagered.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* 3. Bets count, wins vs losses */}
                      <div className="bg-zinc-950/50 border border-zinc-900/80 rounded-xl p-3.5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-rose-500 shrink-0">
                          <span>🎮</span>
                        </div>
                        <div className="grow">
                          <span className="text-[9px] font-bold uppercase text-zinc-500 block">Wins / Losses</span>
                          <div className="flex items-center justify-between text-xs font-black text-white font-mono mt-0.5">
                            <span>{sessionBets.length} Bets</span>
                            <span className="text-[10px] font-normal text-zinc-400">
                              <span className="text-emerald-400 font-bold">{sessionWinsCount}W</span> - <span className="text-rose-400 font-bold">{sessionLossesCount}L</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 4. Session Net Profit/Loss */}
                      <div className="bg-zinc-950/50 border border-zinc-900/80 rounded-xl p-3.5 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center text-sm shrink-0 ${profitIsPositive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                          {profitIsPositive ? '▲' : '▼'}
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase text-zinc-500 block">Net Profit / Loss</span>
                          <span className={`text-xs font-black font-mono mt-0.5 block ${profitIsPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {profitIsPositive ? '+' : ''}₹{totalSessionProfitLoss.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
                  </div>
            </div>
          )}

              {activeTab === 'sports' && (
                <div className="w-full" id="panel_sports_betting">
                  <SportsbookComponent token={token} refreshWallet={fetchWallet} refreshBets={fetchBets} />
                </div>
              )}

              {activeTab === 'sports-bets' && (
                <div className="w-full" id="panel_sports_bets_log">
                  <SportsBetLogComponent token={token} />
                </div>
              )}

              {/* ========================================================
                  TAB 2: WALLET DEPOSIT & WITHDRAW MANAGEMENT
                 ======================================================== */}
              {activeTab === 'wallet' && (
                <div className="max-w-4xl mx-auto flex flex-col gap-6" id="panel_wallet">
                  
                  {/* Ledger summary overview card */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Total Main Balance</span>
                        <span className="text-2xl font-black text-white font-mono block mt-1">
                          ₹{wallet ? wallet.balance.toFixed(2) : '0.00'}
                        </span>
                        <span className="text-[10px] text-zinc-400 mt-0.5 block">Withdrawable any time</span>
                      </div>
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 shadow-md">
                        <Coins className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">SignUp Bonus Balance</span>
                        <span className="text-2xl font-black text-rose-400 font-mono block mt-1">
                          ₹{wallet ? wallet.promoBalance.toFixed(2) : '0.00'}
                        </span>
                        <span className="text-[10px] text-zinc-400 mt-0.5 block">Used for contract bets first</span>
                      </div>
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 shadow-md">
                        <Flame className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Wagering Status</span>
                        <span className="text-xl font-black text-amber-400 font-mono block mt-1">
                          ₹{wallet ? (wallet.completedWagering ?? 0).toFixed(1) : '0.0'} <span className="text-xs text-zinc-500 font-normal">/ ₹{wallet ? (wallet.requiredWagering ?? 0).toFixed(1) : '0.0'}</span>
                        </span>
                        <span className="text-[10px] mt-0.5 block">
                          {wallet && (wallet.completedWagering ?? 0) >= (wallet.requiredWagering ?? 0) ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Fully Wagered
                            </span>
                          ) : (
                            <span className="text-amber-500 font-bold">
                              Need ₹{(wallet ? Math.max(0, (wallet.requiredWagering ?? 0) - (wallet.completedWagering ?? 0)) : 0).toFixed(1)} more bet
                            </span>
                          )}
                        </span>
                      </div>
                      <div className={`rounded-xl p-3 shadow-md ${wallet && (wallet.completedWagering ?? 0) >= (wallet.requiredWagering ?? 0) ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'}`}>
                        <Sparkles className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Minimum Limits</span>
                        <div className="mt-1 font-mono text-zinc-300 font-bold space-y-0.5 text-xs">
                          <div>Deposit: ₹{platformConfig?.minDeposit || 100}</div>
                          <div>Withdraw: ₹{platformConfig?.minWithdraw || 200}</div>
                        </div>
                      </div>
                      <div className="bg-zinc-800 border border-zinc-700 text-zinc-400 rounded-xl p-3">
                        <Lock className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {walletActionMessage && (
                    <div className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${walletActionMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                      {walletActionMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                      <span>{walletActionMessage.text}</span>
                    </div>
                  )}

                  {/* Actions column */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Fund Wallet (Deposit) with multi-mode */}
                    <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                      <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider mb-4 flex items-center gap-2">
                        <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                        <span>Fund Wallet (Deposit)</span>
                      </h3>
                      
                      {/* Deposit Mode Selector */}
                      <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-900 mb-5">
                        <button
                          type="button"
                          onClick={() => { playClickSound(); setDepositMode('gateway'); }}
                          className={`py-2.5 px-1.5 text-[9px] font-extrabold uppercase tracking-wider rounded-lg text-center transition flex flex-col sm:flex-row items-center justify-center gap-1 ${
                            depositMode === 'gateway'
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Gateway</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { playClickSound(); setDepositMode('manual'); }}
                          className={`py-2.5 px-1.5 text-[9px] font-extrabold uppercase tracking-wider rounded-lg text-center transition flex flex-col sm:flex-row items-center justify-center gap-1 ${
                            depositMode === 'manual'
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>Manual</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { playClickSound(); setDepositMode('crypto'); }}
                          className={`py-2.5 px-1.5 text-[9px] font-extrabold uppercase tracking-wider rounded-lg text-center transition flex flex-col sm:flex-row items-center justify-center gap-1 ${
                            depositMode === 'crypto'
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <span className="text-sm">🪙</span>
                          <span>Crypto</span>
                        </button>
                      </div>

                      {depositMode === 'gateway' && (
                        <form onSubmit={handleGatewayDepositSubmit} className="space-y-4">
                          <p className="text-[11px] text-zinc-500 leading-relaxed">
                            Secured instant gateway deposit. Balance will be auto-credited to your account instantly on successful payment via our callback webhooks.
                          </p>

                          {platformConfig?.paymentGateways && platformConfig.paymentGateways.length > 0 && (
                            <div>
                              <label className="block text-xs font-semibold text-zinc-400 mb-1">Select Payment Gateway</label>
                              <select
                                value={selectedDepositGateway || (platformConfig.paymentGateways.find((g: any) => g.isDefault)?.id || platformConfig.paymentGateways[0]?.id)}
                                onChange={(e) => setSelectedDepositGateway(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                              >
                                {platformConfig.paymentGateways.map((g: any) => (
                                  <option key={g.id} value={g.id}>
                                    {g.name} {g.description ? `— ${g.description}` : ''} (₹{g.minAmount}+)
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-1">Deposit Amount (₹)</label>
                            <input 
                              type="number" 
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                              placeholder={`Min: ₹${platformConfig?.minDeposit || 100}`}
                              className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none font-mono"
                            />
                          </div>

                          <button 
                            type="submit"
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 rounded-lg py-3 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>PROCEED TO INSTANT SECURE PAY</span>
                          </button>
                        </form>
                      )}

                      {depositMode === 'manual' && (
                        <form onSubmit={handleDepositSubmit} className="space-y-4">
                          <p className="text-[11px] text-zinc-500 leading-relaxed">
                            Traditional bank/UPI transfer. Your deposit slip reference is sent to administrators for manual authentication and validation.
                          </p>

                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-1">Deposit Amount (₹)</label>
                            <input 
                              type="number" 
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                              placeholder={`Min: ₹${platformConfig?.minDeposit || 100}`}
                              className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-1">Receipt Reference Remark</label>
                            <input 
                              type="text" 
                              value={depositRemark}
                              onChange={(e) => setDepositRemark(e.target.value)}
                              placeholder="e.g. UPI Ref ID: 6290123545"
                              className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none"
                            />
                          </div>

                          <button 
                            type="submit"
                            className="w-full bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 hover:border-zinc-600 rounded-lg py-3 font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
                          >
                            <Coins className="w-4 h-4" />
                            <span>REQUEST MANUAL DEPOSIT</span>
                          </button>
                        </form>
                      )}

                      {depositMode === 'crypto' && (
                        <form onSubmit={handleCryptoDepositSubmit} className="space-y-4">
                          <p className="text-[11px] text-zinc-500 leading-relaxed">
                            VeloWager Pro premium cryptocurrency gateway. Funds are deposited securely and automatically converted to local currency at live rates.
                          </p>

                          {/* Currency selection */}
                          <div className="grid grid-cols-4 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-900">
                            {(['USDT', 'BTC', 'ETH', 'TRX'] as const).map((curr) => (
                              <button
                                key={curr}
                                type="button"
                                onClick={() => { playClickSound(); setCryptoCurrency(curr); }}
                                className={`py-1.5 px-1 text-[10px] font-black tracking-wide rounded-lg text-center transition ${
                                  cryptoCurrency === curr
                                    ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                              >
                                {curr}
                              </button>
                            ))}
                          </div>

                          {/* Crypto Address Banner */}
                          <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase text-zinc-500">
                              <span>Our Destination {cryptoCurrency} Wallet</span>
                              <span className="text-[9px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md font-mono">
                                {cryptoCurrency === 'USDT' ? 'TRC20 Network' : cryptoCurrency === 'ETH' ? 'ERC20 Network' : 'Native Chain'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                readOnly
                                value={CRYPTO_ADDRESSES[cryptoCurrency]}
                                className="w-full bg-zinc-900 border border-zinc-850/80 rounded-lg py-2 px-3 text-[10px] font-mono text-zinc-300 focus:outline-none select-all"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  playClickSound();
                                  navigator.clipboard.writeText(CRYPTO_ADDRESSES[cryptoCurrency]);
                                  setCopiedAddress(cryptoCurrency);
                                  showToast(
                                    `${cryptoCurrency} Address Copied`,
                                    `Vibrant ${cryptoCurrency} deposit address successfully duplicated to clipboard! Ready to fund wallet.`,
                                    'success'
                                  );
                                  setTimeout(() => setCopiedAddress(null), 2000);
                                }}
                                className="relative overflow-hidden bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white p-2.5 rounded-lg border border-zinc-850 transition-all duration-300 active:scale-95 flex items-center justify-center min-w-[36px] h-[36px]"
                                title="Copy Wallet Address"
                              >
                                <AnimatePresence mode="wait">
                                  {copiedAddress === cryptoCurrency ? (
                                    <motion.span
                                      key="check"
                                      initial={{ scale: 0.5, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0.5, opacity: 0 }}
                                      transition={{ duration: 0.15 }}
                                      className="flex items-center text-emerald-400"
                                    >
                                      <Check className="w-4 h-4" />
                                    </motion.span>
                                  ) : (
                                    <motion.span
                                      key="copy"
                                      initial={{ scale: 0.5, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0.5, opacity: 0 }}
                                      transition={{ duration: 0.15 }}
                                      className="flex items-center"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </button>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400">
                              <span>Exchange rate:</span>
                              <span className="font-mono text-rose-400 font-bold">1 {cryptoCurrency} ≈ ₹{CRYPTO_RATES[cryptoCurrency].toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Amount Crypto */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-xs font-semibold text-zinc-400">Deposit Quantity ({cryptoCurrency})</label>
                              {cryptoDepositAmount && (
                                <span className="text-[10px] font-black text-emerald-400 font-mono">
                                  ≈ ₹{(Number(cryptoDepositAmount) * CRYPTO_RATES[cryptoCurrency]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              )}
                            </div>
                            <input 
                              type="number" 
                              step="any"
                              value={cryptoDepositAmount}
                              onChange={(e) => setCryptoDepositAmount(e.target.value)}
                              placeholder={`Amount of ${cryptoCurrency} to send...`}
                              className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none font-mono"
                            />
                          </div>

                          {/* Tx Hash */}
                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-1">Blockchain Transaction ID / Hash</label>
                            <input 
                              type="text" 
                              value={cryptoTxHash}
                              onChange={(e) => setCryptoTxHash(e.target.value)}
                              placeholder="Paste 64-character transaction TxHash or unique TxID"
                              className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none font-mono"
                            />
                          </div>

                          {/* Simulation Switch */}
                          <div className="bg-rose-500/[0.02] border border-rose-500/10 p-3 rounded-xl flex items-center justify-between">
                            <div>
                              <span className="text-[11px] font-bold text-zinc-300 block">⚡ Sim Blockchain Confirmation</span>
                              <span className="text-[9px] text-zinc-500 block">Instantly process node approvals without admin reviews</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => { playClickSound(); setCryptoAutoApprove(!cryptoAutoApprove); }}
                              className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                                cryptoAutoApprove ? 'bg-emerald-500' : 'bg-zinc-800'
                              }`}
                            >
                              <div
                                className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                                  cryptoAutoApprove ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>

                          <button 
                            type="submit"
                            disabled={isSubmittingCrypto}
                            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/50 text-white rounded-lg py-3 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-rose-500/10 flex items-center justify-center gap-2"
                          >
                            <span>🪙</span>
                            <span>{isSubmittingCrypto ? 'PROCESSING BLOCKCHAIN TRANSACTIONS...' : 'SUBMIT CRYPTO DEPOSIT'}</span>
                          </button>
                        </form>
                      )}
                    </div>

                    {/* Withdrawal Request */}
                    <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                      <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider mb-4 flex items-center gap-2">
                        <ArrowUpRight className="w-5 h-5 text-rose-400" />
                        <span>Payout Wallet (Withdrawal)</span>
                      </h3>

                      {/* Withdraw Mode Selector */}
                      <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-900 mb-5">
                        <button
                          type="button"
                          onClick={() => { playClickSound(); setWithdrawMode('bank'); }}
                          className={`py-2 px-3 text-[10px] font-extrabold uppercase tracking-wider rounded-lg text-center transition flex items-center justify-center gap-1.5 ${
                            withdrawMode === 'bank'
                              ? 'bg-rose-500/15 border border-rose-500/25 text-rose-400 font-black'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>Bank Account</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { playClickSound(); setWithdrawMode('crypto'); }}
                          className={`py-2 px-3 text-[10px] font-extrabold uppercase tracking-wider rounded-lg text-center transition flex items-center justify-center gap-1.5 ${
                            withdrawMode === 'crypto'
                              ? 'bg-rose-500/15 border border-rose-500/25 text-rose-400 font-black'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <span>🪙</span>
                          <span>Crypto Payout</span>
                        </button>
                      </div>

                      {withdrawMode === 'bank' ? (
                        // BANK ACCOUNT PAYOUT MODE
                        !user?.bankName || !user?.bankAccount || !user?.bankIfsc || !user?.bankHolderName || showEditBankForm ? (
                          // BANK DETAILS SUBMISSION FORM
                          <form onSubmit={handleBankDetailsSubmit} className="space-y-4">
                            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3.5 rounded-xl text-xs">
                              <span className="font-extrabold block uppercase tracking-wider mb-0.5">Submit Bank Details</span>
                              Please submit your banking credentials. Payouts are exclusively wired to this bank account to comply with security guidelines.
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Account Holder Name</label>
                                <input 
                                  type="text" 
                                  value={bankHolderName}
                                  onChange={(e) => setBankHolderName(e.target.value)}
                                  placeholder="e.g. John Doe"
                                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2 px-3 text-sm text-white focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Bank Name</label>
                                <input 
                                  type="text" 
                                  value={bankName}
                                  onChange={(e) => setBankName(e.target.value)}
                                  placeholder="e.g. State Bank of India"
                                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2 px-3 text-sm text-white focus:outline-none"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Account Number</label>
                                <input 
                                  type="text" 
                                  value={bankAccount}
                                  onChange={(e) => setBankAccount(e.target.value)}
                                  placeholder="e.g. 30012345678"
                                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2 px-3 text-sm text-white focus:outline-none font-mono"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Bank IFSC Code</label>
                                <input 
                                  type="text" 
                                  value={bankIfsc}
                                  onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                                  placeholder="e.g. SBIN0001234"
                                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2 px-3 text-sm text-white focus:outline-none font-mono"
                                />
                              </div>
                            </div>

                            <div className="flex gap-2.5 pt-1">
                              <button 
                                type="submit"
                                disabled={isSavingBank}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-zinc-950 rounded-lg py-2.5 font-extrabold text-xs uppercase tracking-wider transition"
                              >
                                {isSavingBank ? 'Saving...' : 'Save Bank Details'}
                              </button>
                              {user?.bankName && (
                                <button 
                                  type="button"
                                  onClick={() => { playClickSound(); setShowEditBankForm(false); }}
                                  className="bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg px-4 py-2.5 font-extrabold text-xs uppercase tracking-wider transition border border-zinc-700"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </form>
                        ) : (
                          // WITHDRAWAL Payout FORM WITH LINKED BANK INFO
                          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                            <div className="bg-zinc-950/60 border border-zinc-850 p-3.5 rounded-xl text-xs space-y-1.5 relative group">
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="font-extrabold text-zinc-400 uppercase tracking-wider text-[10px]">Linked Payout Bank</span>
                                <button 
                                  type="button"
                                  onClick={() => { playClickSound(); setShowEditBankForm(true); }}
                                  className="text-rose-400 hover:text-rose-300 font-extrabold uppercase text-[9px] tracking-widest transition"
                                >
                                  Edit Bank details
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-zinc-300">
                                <div>
                                  <span className="text-[10px] text-zinc-500 block uppercase font-bold">Holder</span>
                                  <span className="font-semibold truncate block">{user.bankHolderName}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-zinc-500 block uppercase font-bold">Bank Name</span>
                                  <span className="font-semibold truncate block">{user.bankName}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-zinc-500 block uppercase font-bold">Account Number</span>
                                  <span className="font-semibold font-mono truncate block">{user.bankAccount}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] text-zinc-500 block uppercase font-bold">IFSC Code</span>
                                  <span className="font-semibold font-mono truncate block">{user.bankIfsc}</span>
                                </div>
                              </div>
                            </div>

                            {wallet && (wallet.completedWagering ?? 0) < (wallet.requiredWagering ?? 0) && (
                              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-xl text-xs flex gap-2">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-extrabold block uppercase tracking-wider">Wagering Lock Active</span>
                                  You have not met the wagering requirement. Place bets of <span className="font-mono font-bold text-white">₹{((wallet.requiredWagering ?? 0) - (wallet.completedWagering ?? 0)).toFixed(1)}</span> more to unlock.
                                </div>
                              </div>
                            )}

                            <div>
                              <label className="block text-xs font-semibold text-zinc-400 mb-1">Withdrawal Amount (₹)</label>
                              <input 
                                type="number" 
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                placeholder={`Min: ₹${platformConfig?.minWithdraw || 200}`}
                                className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none font-mono"
                              />
                            </div>

                            <button 
                              type="submit"
                              className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-lg py-3 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-rose-500/10"
                            >
                              Request Withdrawal payout
                            </button>
                          </form>
                        )
                      ) : (
                        // CRYPTOCURRENCY PAYOUT MODE
                        <form onSubmit={handleCryptoWithdrawSubmit} className="space-y-4">
                          <p className="text-[11px] text-zinc-500 leading-relaxed">
                            Withdraw your earnings directly to your personal cryptocurrency wallet. Withdrawals are processed safely and calculated based on real-time conversions.
                          </p>

                          {/* Currency selection */}
                          <div className="grid grid-cols-4 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-900">
                            {(['USDT', 'BTC', 'ETH', 'TRX'] as const).map((curr) => (
                              <button
                                key={curr}
                                type="button"
                                onClick={() => { playClickSound(); setCryptoCurrency(curr); }}
                                className={`py-1.5 px-1 text-[10px] font-black tracking-wide rounded-lg text-center transition ${
                                  cryptoCurrency === curr
                                    ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                              >
                                {curr}
                              </button>
                            ))}
                          </div>

                          {/* Rate Warning and information */}
                          <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl flex justify-between items-center text-[10px]">
                            <span className="text-zinc-500 font-bold uppercase">Rate Conversion:</span>
                            <span className="font-mono text-rose-400 font-black">1 {cryptoCurrency} ≈ ₹{CRYPTO_RATES[cryptoCurrency].toLocaleString()}</span>
                          </div>

                          {/* Destination wallet address */}
                          <div>
                            <label className="block text-xs font-semibold text-zinc-400 mb-1">Your Destination Wallet Address ({cryptoCurrency})</label>
                            <input 
                              type="text" 
                              value={cryptoWithdrawAddress}
                              onChange={(e) => setCryptoWithdrawAddress(e.target.value)}
                              placeholder={`Paste your ${cryptoCurrency} wallet deposit address`}
                              className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none font-mono"
                            />
                          </div>

                          {/* Wagering constraint indicator */}
                          {wallet && (wallet.completedWagering ?? 0) < (wallet.requiredWagering ?? 0) && (
                            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-xl text-xs flex gap-2">
                              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-extrabold block uppercase tracking-wider">Wagering Lock Active</span>
                                You must meet wagering requirement before withdrawing. Need <span className="font-mono font-bold text-white">₹{((wallet.requiredWagering ?? 0) - (wallet.completedWagering ?? 0)).toFixed(1)}</span> more volume.
                              </div>
                            </div>
                          )}

                          {/* Crypto Withdraw Amount */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-xs font-semibold text-zinc-400">Withdraw Quantity ({cryptoCurrency})</label>
                              {cryptoWithdrawAmount && (
                                <span className="text-[10px] font-black text-rose-400 font-mono">
                                  ≈ ₹{(Number(cryptoWithdrawAmount) * CRYPTO_RATES[cryptoCurrency]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              )}
                            </div>
                            <input 
                              type="number" 
                              step="any"
                              value={cryptoWithdrawAmount}
                              onChange={(e) => setCryptoWithdrawAmount(e.target.value)}
                              placeholder={`Quantity of ${cryptoCurrency} to withdraw...`}
                              className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none font-mono"
                            />
                          </div>

                          <button 
                            type="submit"
                            disabled={isSubmittingCrypto}
                            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/50 text-white rounded-lg py-3 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-rose-500/10"
                          >
                            {isSubmittingCrypto ? 'PROCESSING PAYOUTS...' : 'REQUEST CRYPTO WITHDRAWAL'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* Transactions Ledger list */}
                  <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider flex items-center gap-2">
                        <Coins className="w-4.5 h-4.5 text-rose-500" />
                        <span>My Transaction Ledgers</span>
                      </h3>
                      <button 
                        onClick={() => { playClickSound(); fetchTransactions(); }}
                        className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {loadingTransactions ? (
                      <TransactionTableSkeleton />
                    ) : transactions.length === 0 ? (
                      <div className="text-center text-zinc-600 py-12 text-xs font-semibold">
                        No transactions found. Request deposits to update balance.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
                              <th className="pb-2.5">Ref ID</th>
                              <th className="pb-2.5">Date</th>
                              <th className="pb-2.5">Action Type</th>
                              <th className="pb-2.5 text-right">Amount</th>
                              <th className="pb-2.5 text-center">Status</th>
                              <th className="pb-2.5 max-w-[200px]">Remarks</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((tx) => (
                              <tr key={tx.id} className="border-b border-zinc-850 hover:bg-zinc-900/40">
                                <td className="py-3 font-mono font-bold text-zinc-400">{tx.utr || tx.id}</td>
                                <td className="py-3 text-zinc-500">{new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString()}</td>
                                <td className="py-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getBadgeColor(tx.type)}`}>
                                    {tx.type}
                                  </span>
                                </td>
                                <td className={`py-3 text-right font-mono font-bold ${['deposit', 'winning_credit', 'admin_credit', 'referral_commission'].includes(tx.type) ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {['deposit', 'winning_credit', 'admin_credit', 'referral_commission'].includes(tx.type) ? '+' : '-'}₹{tx.amount}
                                </td>
                                <td className="py-3 text-center">
                                  {tx.status === 'pending' ? (
                                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Pending</span>
                                  ) : (tx.status === 'approved' || tx.status === 'success') ? (
                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Approved</span>
                                  ) : (
                                    <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">Rejected</span>
                                  )}
                                </td>
                                <td className="py-3 text-zinc-400 truncate max-w-[200px]" title={tx.remark}>{tx.remark}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 3: REFERRAL MARKETING SYSTEM & DOWNLINE TEAMS
                 ======================================================== */}
              {activeTab === 'referrals' && (
                <div className="max-w-4xl mx-auto flex flex-col gap-6" id="panel_referrals">
                  
                  {/* Custom Affiliate Banner (Admin Configurable) */}
                  {(platformConfig?.affiliateBannerText || platformConfig?.affiliateBannerImageUrl) && (
                    <div className="bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4 shadow-lg">
                      {platformConfig.affiliateBannerImageUrl && (
                        <img 
                          src={platformConfig.affiliateBannerImageUrl} 
                          alt="Promotional Program" 
                          referrerPolicy="no-referrer"
                          className="w-20 h-20 rounded-xl object-cover bg-zinc-800 border border-zinc-700 shrink-0" 
                        />
                      )}
                      <div className="grow text-center md:text-left">
                        <span className="text-[9px] bg-amber-500/15 text-amber-400 font-extrabold uppercase px-2 py-0.5 rounded tracking-wider border border-amber-500/20">
                          📢 Exclusive Promotion Announcement
                        </span>
                        <p className="text-xs sm:text-sm text-zinc-200 font-bold mt-1.5 leading-relaxed">
                          {platformConfig.affiliateBannerText}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Shareable Code Card */}
                  <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 rounded-full blur-3xl"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                      <div>
                        <span className="bg-rose-500/10 border border-rose-500/20 text-rose-400 font-extrabold uppercase text-[10px] tracking-widest px-2.5 py-1 rounded-full">
                          Affiliate Commission Program
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-white mt-3 leading-tight">Refer Friends & Earn 10% on Deposits of Rs.500+!</h2>
                        <p className="text-xs text-zinc-400 mt-2">Get direct earnings into your cash wallet immediately when friends register using your referral code and play contract bets on WinGo.</p>
                      </div>

                      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center">
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider mb-2">My Unique Referral Code</span>
                        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded-xl mb-4 w-full justify-between">
                          <span className="font-mono font-black text-lg text-rose-400 tracking-wider">
                            {referralsData ? referralsData.referralCode : 'Loading...'}
                          </span>
                          <button 
                            onClick={() => handleCopyReferral(referralsData?.referralCode || '')}
                            className="text-zinc-400 hover:text-white p-1 rounded transition"
                          >
                            <Copy className="w-4.5 h-4.5" />
                          </button>
                        </div>
                        <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider mb-2 self-start">My Referral Link</span>
                        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-xl mb-4 w-full">
                          <input readOnly value={referralsData ? getReferralLink(referralsData.referralCode) : ''} className="grow min-w-0 bg-transparent text-[10px] text-zinc-400 font-mono outline-none" />
                          <button onClick={() => handleCopyLink(referralsData?.referralCode || '')} className="text-zinc-400 hover:text-white"><Copy className="w-4 h-4" /></button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                          <button 
                            onClick={() => handleCopyReferral(referralsData?.referralCode || '')}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg py-2 text-xs font-bold transition border border-zinc-700"
                          >
                            Copy Code
                          </button>
                          <button 
                            onClick={() => handleCopyLink(referralsData?.referralCode || '')}
                            className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-lg py-2 text-xs font-bold transition shadow-lg shadow-rose-500/10 flex items-center justify-center gap-1.5"
                          >
                            <Clipboard className="w-3.5 h-3.5" />
                            <span>Copy Promotion Link</span>
                          </button>
                        </div>
                        <button onClick={() => shareReferralOnTelegram(referralsData?.referralCode || '')} disabled={!referralsData?.referralCode} className="mt-2 w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white rounded-lg py-2 text-xs font-bold transition">
                          Share Referral on Telegram
                        </button>
                        {platformConfig?.telegramUrl && (
                          <a href={platformConfig.telegramUrl} target="_blank" rel="noopener noreferrer" className="mt-2 w-full bg-sky-500/15 hover:bg-sky-500 text-sky-400 hover:text-white border border-sky-500/20 rounded-lg py-2 text-xs font-bold transition flex items-center justify-center gap-1.5">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Join Telegram Community
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Team analytics tracker */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Total Referred Team Size</span>
                        <span className="text-3xl font-black text-white font-mono block mt-1">
                          {referralsData ? referralsData.totalReferrals : 0} Members
                        </span>
                      </div>
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 shadow-md">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block">Total Affiliate Commission Cash Earned</span>
                        <span className="text-3xl font-black text-emerald-400 font-mono block mt-1">
                          ₹{referralsData ? referralsData.totalEarned.toFixed(2) : '0.00'}
                        </span>
                      </div>
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl p-3 shadow-md">
                        <Coins className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Referral breakdown lists */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* referred users downline */}
                    <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl md:col-span-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-zinc-850 pb-3">
                        <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider flex items-center gap-2">
                          <Users className="w-4.5 h-4.5 text-rose-500" />
                          <span>Detailed Subordinate Directory ({referralsData ? referralsData.totalReferrals : 0} Members)</span>
                        </h3>
                        {referralsData?.isAgent && (
                          <span className="bg-purple-500/20 border border-purple-500/35 text-purple-300 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full self-start sm:self-auto">
                            Authorized Platform Agent
                          </span>
                        )}
                      </div>
                      
                      {!referralsData || referralsData.referees.length === 0 ? (
                        <div className="text-center text-zinc-600 py-12 text-xs font-semibold">
                          You have not referred any users yet. Share code to recruit members!
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {referralsData.referees.map((ref: any) => {
                            const isExpanded = expandedRefereeId === ref.id;
                            return (
                              <div key={ref.id} className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden transition-all duration-200">
                                {/* Header / Summary row */}
                                <div 
                                  onClick={() => setExpandedRefereeId(isExpanded ? null : ref.id)}
                                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-850/50 transition"
                                >
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                    <span className="font-mono font-black text-sm text-zinc-200">{ref.mobile}</span>
                                    <span className="text-[10px] text-zinc-500 font-mono">Joined: {new Date(ref.createdAt).toLocaleDateString()}</span>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                      ref.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                      ref.status === 'frozen' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    }`}>
                                      {ref.status}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <span className="text-[9px] text-zinc-500 uppercase font-black block tracking-wider">Deposits</span>
                                        <span className="font-mono text-xs font-black text-emerald-400">₹{(ref.totalDeposits ?? 0).toFixed(2)}</span>
                                      </div>
                                      <div className="text-right border-l border-zinc-800 pl-3">
                                        <span className="text-[9px] text-zinc-500 uppercase font-black block tracking-wider">Withdrawals</span>
                                        <span className="font-mono text-xs font-black text-rose-400">₹{(ref.totalWithdrawals ?? 0).toFixed(2)}</span>
                                      </div>
                                    </div>
                                    <div className="text-zinc-500 hover:text-white transition p-1">
                                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </div>
                                  </div>
                                </div>

                                {/* Expanded details, deposits & withdrawals */}
                                {isExpanded && (
                                  <div className="border-t border-zinc-850 bg-zinc-950/40 p-4 space-y-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                      {/* Deposits column */}
                                      <div>
                                        <h4 className="text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-2 flex items-center gap-1.5">
                                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                                          <span>Deposits ({ref.deposits?.length || 0} Tx)</span>
                                        </h4>
                                        
                                        {!ref.deposits || ref.deposits.length === 0 ? (
                                          <p className="text-zinc-600 text-xs py-2 italic pl-1">No deposit transactions recorded yet.</p>
                                        ) : (
                                          <div className="overflow-x-auto border border-zinc-850 rounded-lg max-h-60 overflow-y-auto">
                                            <table className="w-full text-left text-[11px] border-collapse bg-zinc-900/10">
                                              <thead>
                                                <tr className="bg-zinc-900 border-b border-zinc-850 text-zinc-500 uppercase tracking-wider font-extrabold text-[9px]">
                                                  <th className="p-2">Tx ID</th>
                                                  <th className="p-2">Amount</th>
                                                  <th className="p-2">Status</th>
                                                  <th className="p-2 text-right">Requested At</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {ref.deposits.map((tx: any) => (
                                                  <tr key={tx.id} className="border-b border-zinc-850 hover:bg-zinc-900/30">
                                                    <td className="p-2 font-mono text-zinc-400 font-semibold">{tx.id}</td>
                                                    <td className="p-2 font-mono text-zinc-200 font-bold">₹{tx.amount.toFixed(2)}</td>
                                                    <td className="p-2">
                                                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                                        tx.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                                                        tx.status === 'pending' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                                                        'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                                                      }`}>
                                                        {tx.status}
                                                      </span>
                                                    </td>
                                                    <td className="p-2 text-right text-zinc-500 font-mono">
                                                      {new Date(tx.createdAt).toLocaleDateString()}
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                      </div>

                                      {/* Withdrawals column */}
                                      <div>
                                        <h4 className="text-[10px] uppercase font-black text-zinc-400 tracking-wider mb-2 flex items-center gap-1.5">
                                          <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                                          <span>Withdrawals ({ref.withdrawals?.length || 0} Tx)</span>
                                        </h4>
                                        
                                        {!ref.withdrawals || ref.withdrawals.length === 0 ? (
                                          <p className="text-zinc-600 text-xs py-2 italic pl-1">No withdrawal transactions recorded yet.</p>
                                        ) : (
                                          <div className="overflow-x-auto border border-zinc-850 rounded-lg max-h-60 overflow-y-auto">
                                            <table className="w-full text-left text-[11px] border-collapse bg-zinc-900/10">
                                              <thead>
                                                <tr className="bg-zinc-900 border-b border-zinc-850 text-zinc-500 uppercase tracking-wider font-extrabold text-[9px]">
                                                  <th className="p-2">Tx ID</th>
                                                  <th className="p-2">Amount</th>
                                                  <th className="p-2">Status</th>
                                                  <th className="p-2 text-right">Requested At</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {ref.withdrawals.map((tx: any) => (
                                                  <tr key={tx.id} className="border-b border-zinc-850 hover:bg-zinc-900/30">
                                                    <td className="p-2 font-mono text-zinc-400 font-semibold">{tx.id}</td>
                                                    <td className="p-2 font-mono text-zinc-200 font-bold">₹{tx.amount.toFixed(2)}</td>
                                                    <td className="p-2">
                                                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                                        tx.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                                                        tx.status === 'pending' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                                                        'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                                                      }`}>
                                                        {tx.status}
                                                      </span>
                                                    </td>
                                                    <td className="p-2 text-right text-zinc-500 font-mono">
                                                      {new Date(tx.createdAt).toLocaleDateString()}
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-850 text-[11px]">
                                      <div>
                                        <span className="text-[9px] text-zinc-500 uppercase font-black block tracking-wider mb-0.5">Subordinate User ID</span>
                                        <span className="font-mono font-semibold text-zinc-400">{ref.id}</span>
                                      </div>
                                      <div>
                                        <span className="text-[9px] text-zinc-500 uppercase font-black block tracking-wider mb-0.5">Account Status Details</span>
                                        <span className="font-sans font-bold text-zinc-300 capitalize">{ref.status}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Commissions Earned Ledger */}
                    <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl md:col-span-2">
                      <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider mb-4 flex items-center gap-2">
                        <Coins className="w-4.5 h-4.5 text-rose-500" />
                        <span>Commission Payout Logs</span>
                      </h3>
                      {!referralsData || referralsData.commissions.length === 0 ? (
                        <div className="text-center text-zinc-600 py-8 text-xs font-semibold">
                          No commission pay logs available yet. Earnings credit instantly on play.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
                                <th className="pb-2">Details</th>
                                <th className="pb-2 text-right">Date</th>
                                <th className="pb-2 text-right">Payout Credit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {referralsData.commissions.map((comm: any) => (
                                <tr key={comm.id} className="border-b border-zinc-850 hover:bg-zinc-900/40">
                                  <td className="py-2.5 text-zinc-300 font-medium">Ref Comm payout</td>
                                  <td className="py-2.5 text-right text-zinc-500">{new Date(comm.createdAt).toLocaleDateString()}</td>
                                  <td className="py-2.5 text-right font-mono font-black text-emerald-400">+₹{comm.amount}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 4: ADMINISTRATIVE CONTROL SYSTEM
                 ======================================================== */}
              {activeTab === 'admin' && isUserAdmin && (
                <div className="space-y-6" id="panel_admin">
                  
                  {/* ADMIN PANEL SUB-NAVIGATION HEADER */}
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 flex-wrap gap-4">
                    <div>
                      <h2 className="text-base font-black uppercase text-zinc-100 tracking-wider">Control Panel Console</h2>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5 font-mono">Platform Operations & Policy Control</p>
                    </div>
                    
                    {/* Horizontal Sub-tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
                      {[
                        { id: 'overview', name: 'Overview', icon: <TrendingUp className="w-3.5 h-3.5" /> },
                        { id: 'users', name: 'Users Control', icon: <Users className="w-3.5 h-3.5" /> },
                        { id: 'financial', name: 'Financials', icon: <Wallet className="w-3.5 h-3.5" /> },
                        { id: 'custody', name: 'Enterprise Custody', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
                        { id: 'games', name: 'Games & Overrides', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
                        { id: 'tickets', name: 'Tickets', icon: <LifeBuoy className="w-3.5 h-3.5" />, badge: adminTickets.filter(t => t.status === 'open').length },
                        { id: 'coupons', name: 'Coupons', icon: <Ticket className="w-3.5 h-3.5" /> },
                        { id: 'settings', name: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
                        { id: 'security', name: 'Security & 2FA', icon: <Lock className="w-3.5 h-3.5" /> },
                      ].map((tab) => {
                        const isActive = adminActiveSubTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => { playClickSound(); setAdminActiveSubTab(tab.id as any); }}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border transition duration-200 whitespace-nowrap ${
                              isActive 
                                ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/10' 
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:bg-zinc-850'
                            }`}
                          >
                            {tab.icon}
                            <span>{tab.name}</span>
                            {tab.badge !== undefined && tab.badge > 0 && (
                              <span className={`px-1.5 py-0.2 text-[9px] rounded-full font-black ${isActive ? 'bg-white text-rose-600' : 'bg-rose-500 text-white'}`}>
                                {tab.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* TAB: OVERVIEW */}
                  {adminActiveSubTab === 'overview' && (
                    <div className="space-y-6 animate-fadeIn">
                      {/* Stats highlights banner */}
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                          <span className="text-[10px] text-zinc-500 uppercase font-black block">Total Users</span>
                          <span className="text-xl font-bold font-mono text-white block mt-1">{adminStats?.totalUsers || 0}</span>
                          <span className="text-[9px] text-emerald-400 font-mono mt-0.5 block">Active: {adminStats?.activeUsers || 0}</span>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                          <span className="text-[10px] text-zinc-500 uppercase font-black block">Betting Volume</span>
                          <span className="text-xl font-bold font-mono text-white block mt-1">₹{adminStats?.totalBetVolume || 0}</span>
                          <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">Total contractual plays</span>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                          <span className="text-[10px] text-zinc-500 uppercase font-black block">Winning Payouts</span>
                          <span className="text-xl font-bold font-mono text-rose-400 block mt-1">₹{adminStats?.totalWinPayout || 0}</span>
                          <span className="text-[9px] text-rose-500/80 font-mono mt-0.5 block">Credited to user balances</span>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                          <span className="text-[10px] text-zinc-500 uppercase font-black block">Trading Fees (2%)</span>
                          <span className="text-xl font-bold font-mono text-emerald-400 block mt-1">₹{adminStats?.totalFeesCollected?.toFixed(2) || '0.00'}</span>
                          <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">Collected house fees</span>
                        </div>

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                          <span className="text-[10px] text-zinc-500 uppercase font-black block">House Revenue</span>
                          <span className="text-xl font-bold font-mono text-amber-400 block mt-1">₹{adminStats ? adminStats.houseRevenue : 0}</span>
                          <span className="text-[9px] text-zinc-500 font-mono mt-0.5 block">Gross profit margin</span>
                        </div>
                      </div>

                      {/* Chronological Audit logs */}
                      <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                        <span className="block text-xs font-black uppercase text-zinc-300 tracking-wider mb-2">Chronological Administrative Audit Logs</span>
                        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 h-[350px] overflow-y-auto font-mono text-[10px] text-zinc-400 space-y-1.5 scrollbar-thin">
                          {adminAuditLogs.map((log) => (
                            <div key={log.id} className="hover:text-white transition">
                              <span className="text-zinc-600">[{new Date(log.createdAt).toLocaleTimeString()}]</span>{' '}
                              <span className="text-rose-400/90">{log.userId ? `[Admin: ${log.userId}]` : '[System]'}</span>{' '}
                              <span>{log.action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: USERS CONTROL */}
                  {adminActiveSubTab === 'users' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* USER ACCOUNTS CONFIG ADAPTATION PANEL */}
                    <div className="lg:col-span-2 bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
                      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                        <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider">User Platform Access Controls</h3>
                        <div className="flex flex-wrap gap-2">
                        <input 
                          type="text" 
                          placeholder="Search name, email, mobile, ID or IP..."
                          value={adminSearchUser}
                          onChange={(e) => setAdminSearchUser(e.target.value)}
                          className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none"
                        />
                        <select value={adminUserStatusFilter} onChange={e => setAdminUserStatusFilter(e.target.value as any)} className="bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-xs text-white">
                          <option value="all">All statuses</option><option value="active">Active</option><option value="frozen">Frozen</option><option value="banned">Banned</option>
                        </select>
                        <button onClick={exportAdminUsersCsv} className="bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded px-2.5 py-1 text-xs font-bold">Export CSV</button>
                        </div>
                      </div>

                      <div className="overflow-x-auto flex-grow max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
                              <th className="pb-2">User ID</th>
                              <th className="pb-2">User</th>
                               <th className="pb-2">Type</th>
                               <th className="pb-2">Signup IP</th>
                               <th className="pb-2">Wallet Bal</th>
                              <th className="pb-2">Wagering Status</th>
                              <th className="pb-2">VIP Tier</th>
                              <th className="pb-2">Access Status</th>
                              <th className="pb-2 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredAdminUsers
                              .map((u) => (
                                <tr key={u.id} className="border-b border-zinc-850 hover:bg-zinc-900/40">
                                  <td className="py-2.5 font-mono font-bold text-zinc-300">{u.id}</td>
                                  <td className="py-2.5 font-mono font-bold">
                                    <button
                                      onClick={() => handleInspectUserDetails(u.id)}
                                      className="text-rose-400 hover:text-rose-300 hover:underline cursor-pointer font-bold focus:outline-none text-left"
                                      title="Click to inspect bank, transaction, and game play history"
                                    >
                                      <span className="block">{u.username || u.mobile}</span>
                                      <span className="block text-[9px] text-zinc-500">{u.email || u.mobile}</span>
                                    </button>
                                  </td>
                                  <td className="py-2.5">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                      u.isAgent 
                                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                    }`}>
                                      {u.isAgent ? 'Agent' : 'Player'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 font-mono text-[10px] text-zinc-400 whitespace-nowrap">
                                    <span className="block">{u.signupIp || 'Unknown'}</span>
                                    <span className={`mt-0.5 inline-flex rounded border px-1.5 py-0.5 text-[9px] font-black ${u.sameIpAccountCount > 1 ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' : 'border-zinc-700 bg-zinc-800 text-zinc-500'}`}>
                                      {u.sameIpAccountCount || 0} {u.sameIpAccountCount === 1 ? 'ID' : 'IDs'} on IP
                                    </span>
                                  </td>
                                  <td className="py-2.5 font-mono text-zinc-300">₹{((u.wallet?.balance ?? 0) + (u.wallet?.promoBalance ?? 0)).toFixed(2)}</td>
                                  <td className="py-2.5 font-mono text-zinc-300">
                                    <span className="text-amber-400">₹{(u.wallet?.completedWagering ?? 0).toFixed(1)}</span>
                                    <span className="text-zinc-600">/</span>
                                    <span className="text-zinc-400">₹{(u.wallet?.requiredWagering ?? 0).toFixed(1)}</span>
                                  </td>
                                  <td className="py-2.5">
                                    {(() => {
                                      const vip = getVipLevel(u.wallet?.completedWagering ?? 0);
                                      return (
                                        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${vip.bgColor} ${vip.color} border ${vip.borderColor}`}>
                                          <span>{vip.icon}</span>
                                          <span>{vip.level}</span>
                                        </span>
                                      );
                                    })()}
                                  </td>
                                  <td className="py-2.5">
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : u.status === 'frozen' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                      {u.status}
                                    </span>
                                  </td>
                                  <td className="py-2.5 text-right space-x-1 whitespace-nowrap">
                                    <button 
                                      onClick={() => handleFetchUserSubordinates(u.id, u.mobile)}
                                      className="bg-blue-500/15 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 font-bold px-2 py-0.5 rounded text-[10px] transition"
                                      title="Inspect Subordinates"
                                    >
                                      Subordinates
                                    </button>
                                    <button 
                                      onClick={() => handleAdminUserAgent(u.id, !u.isAgent)}
                                      className={`font-bold px-2 py-0.5 rounded text-[10px] transition ${
                                        u.isAgent 
                                          ? 'bg-purple-500/15 hover:bg-purple-500 text-purple-400 hover:text-white border border-purple-500/20' 
                                          : 'bg-zinc-700/30 hover:bg-zinc-600 text-zinc-300 hover:text-white border border-zinc-700/50'
                                      }`}
                                    >
                                      {u.isAgent ? 'Demote' : 'Make Agent'}
                                    </button>
                                    {u.status === 'active' ? (
                                      <>
                                        <button 
                                          onClick={() => handleAdminUserStatus(u.id, 'frozen')}
                                          className="bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-zinc-950 border border-amber-500/20 font-bold px-2 py-0.5 rounded text-[10px] transition"
                                        >
                                          Freeze
                                        </button>
                                        <button 
                                          onClick={() => handleAdminUserStatus(u.id, 'banned')}
                                          className="bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 font-bold px-2 py-0.5 rounded text-[10px] transition"
                                        >
                                          Ban
                                        </button>
                                      </>
                                    ) : (
                                      <button 
                                        onClick={() => handleAdminUserStatus(u.id, 'active')}
                                        className="bg-emerald-500/15 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-950 border border-emerald-500/20 font-bold px-2 py-0.5 rounded text-[10px] transition"
                                      >
                                        Activate
                                      </button>
                                    )}
                                    {user?.adminRole === 'master' && <button onClick={() => revokeUserSessions(u.id)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-bold px-2 py-0.5 rounded text-[10px] transition">Logout</button>}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* DIRECT BALANCING TOOL */}
                    <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                      <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider mb-4 flex items-center gap-2">
                        <Coins className="w-4.5 h-4.5 text-amber-400" />
                        <span>Direct Balances Direct Adjustment</span>
                      </h3>
                      {adminDirectMessage && (
                        <div className="bg-zinc-900 border border-zinc-800 text-rose-400 text-xs p-3 rounded-lg mb-3">
                          {adminDirectMessage}
                        </div>
                      )}
                      <form onSubmit={handleAdminDirectWallet} className="space-y-4">
                        <div>
                          <label className="block text-[10px] uppercase font-black text-zinc-400 mb-1">Target User ID</label>
                          <select 
                            value={adminDirectUser}
                            onChange={(e) => setAdminDirectUser(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                          >
                            <option value="">-- Choose User mobile --</option>
                            {adminUsers.map(u => (
                              <option key={u.id} value={u.id}>{u.mobile} ({u.id})</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[10px] uppercase font-black text-zinc-400 mb-1">Deduction Action</label>
                            <select 
                              value={adminDirectType}
                              onChange={(e) => setAdminDirectType(e.target.value as any)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-2 text-xs text-white focus:outline-none font-bold"
                            >
                              <option value="credit">Credit Balance</option>
                              <option value="debit">Debit Balance</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-black text-zinc-400 mb-1">Select Currency</label>
                            <select 
                              value={adminDirectCurrency}
                              onChange={(e) => setAdminDirectCurrency(e.target.value as any)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-2 text-xs text-white focus:outline-none font-bold"
                            >
                              <option value="INR">INR (₹)</option>
                              <option value="USDT">USDT</option>
                              <option value="BTC">BTC</option>
                              <option value="ETH">ETH</option>
                              <option value="TRX">TRX</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-black text-zinc-400 mb-1">
                              Amount ({adminDirectCurrency})
                            </label>
                            <input 
                              type="number" 
                              value={adminDirectAmount}
                              onChange={(e) => setAdminDirectAmount(e.target.value)}
                              placeholder={adminDirectCurrency === 'INR' ? '500' : '10'}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-2 text-xs text-white focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-black text-zinc-400 mb-1">Adjustment Reason Remark</label>
                          <input 
                            type="text" 
                            value={adminDirectRemark}
                            onChange={(e) => setAdminDirectRemark(e.target.value)}
                            placeholder="Reason for adjustment"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                          />
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black rounded-lg py-2.5 text-xs uppercase tracking-wider transition"
                        >
                          Execute Balance Adjustment
                        </button>
                      </form>
                    </div>

                    {/* MANUAL WAGERING OVERRIDE TOOL */}
                    <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl mt-6">
                      <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider mb-4 flex items-center gap-2">
                        <Sparkles className="w-4.5 h-4.5 text-amber-400" />
                        <span>Direct Wagering Override</span>
                      </h3>
                      {adminWagerMessage && (
                        <div className="bg-zinc-900 border border-zinc-800 text-rose-400 text-xs p-3 rounded-lg mb-3">
                          {adminWagerMessage}
                        </div>
                      )}
                      <form onSubmit={handleAdminWagerSubmit} className="space-y-4">
                        <div>
                          <label className="block text-[10px] uppercase font-black text-zinc-400 mb-1">Target User ID</label>
                          <select 
                            value={adminWagerUser}
                            onChange={(e) => handleWagerUserChange(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                          >
                            <option value="">-- Choose User mobile --</option>
                            {adminUsers.map(u => (
                              <option key={u.id} value={u.id}>{u.mobile} ({u.id})</option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] uppercase font-black text-zinc-400 mb-1">Required Wagering (₹)</label>
                            <input 
                              type="number" 
                              value={adminWagerRequired}
                              onChange={(e) => setAdminWagerRequired(e.target.value)}
                              placeholder="e.g. 100"
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-black text-zinc-400 mb-1">Completed Wagering (₹)</label>
                            <input 
                              type="number" 
                              value={adminWagerCompleted}
                              onChange={(e) => setAdminWagerCompleted(e.target.value)}
                              placeholder="e.g. 50"
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black rounded-lg py-2.5 text-xs uppercase tracking-wider transition"
                        >
                          Save Wagering Override
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* SUBORDINATES EXPLORER PANEL FOR ADMIN */}
                  {inspectedUserSubordinates !== null && (
                    <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl"></div>
                      <div className="flex justify-between items-center mb-6 pb-3 border-b border-zinc-850">
                        <div>
                          <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider">
                            Downline Inspector Engine
                          </span>
                          <h3 className="text-sm font-black uppercase text-zinc-200 mt-1">
                            Subordinates of User <span className="text-purple-400 font-mono font-black">{inspectedUserMobile}</span>
                          </h3>
                        </div>
                        <button 
                          onClick={() => setInspectedUserSubordinates(null)}
                          className="text-zinc-500 hover:text-white bg-zinc-900 hover:bg-zinc-800 p-1.5 rounded-lg border border-zinc-800 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {loadingSubordinates ? (
                        <div className="text-center text-zinc-500 py-12 text-xs font-semibold flex items-center justify-center gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin text-purple-500" />
                          <span>Loading downline team database...</span>
                        </div>
                      ) : inspectedUserSubordinates.length === 0 ? (
                        <div className="text-center text-zinc-600 py-12 text-xs font-semibold">
                          This user does not have any direct subordinates/referrals registered yet.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-2">
                            <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4">
                              <span className="text-[9px] text-zinc-500 uppercase font-black block tracking-wider">Total Subordinates</span>
                              <span className="text-lg font-bold font-mono text-white mt-1 block">{inspectedUserSubordinates.length} Members</span>
                            </div>
                            <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4">
                              <span className="text-[9px] text-zinc-500 uppercase font-black block tracking-wider">Total Downline Deposits</span>
                              <span className="text-lg font-bold font-mono text-emerald-400 mt-1 block">
                                ₹{inspectedUserSubordinates.reduce((sum, item) => sum + (item.totalDeposits ?? 0), 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4">
                              <span className="text-[9px] text-zinc-500 uppercase font-black block tracking-wider">Total Downline Withdrawals</span>
                              <span className="text-lg font-bold font-mono text-rose-400 mt-1 block">
                                ₹{inspectedUserSubordinates.reduce((sum, item) => sum + (item.totalWithdrawals ?? 0), 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="bg-zinc-950 border border-zinc-850 rounded-xl p-4">
                              <span className="text-[9px] text-zinc-500 uppercase font-black block tracking-wider">Active Members</span>
                              <span className="text-lg font-bold font-mono text-zinc-300 mt-1 block">
                                {inspectedUserSubordinates.filter(item => item.status === 'active').length} Active
                              </span>
                            </div>
                          </div>

                          <div className="overflow-x-auto border border-zinc-850 rounded-xl">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px] font-extrabold">
                                  <th className="p-3">User ID / Mobile</th>
                                  <th className="p-3">Registration Date</th>
                                  <th className="p-3">Account Status</th>
                                  <th className="p-3">Approved Deposits</th>
                                  <th className="p-3">Approved Withdrawals</th>
                                  <th className="p-3">Deposits Log</th>
                                  <th className="p-3">Withdrawals Log</th>
                                </tr>
                              </thead>
                              <tbody>
                                {inspectedUserSubordinates.map((sub: any) => (
                                  <tr key={sub.id} className="border-b border-zinc-850 hover:bg-zinc-900/30">
                                    <td className="p-3">
                                      <div className="font-mono text-white font-bold">{sub.mobile}</div>
                                      <div className="font-mono text-[9px] text-zinc-600">ID: {sub.id}</div>
                                    </td>
                                    <td className="p-3 text-zinc-400 font-mono text-[11px]">{new Date(sub.createdAt).toLocaleDateString()}</td>
                                    <td className="p-3">
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                        sub.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                        sub.status === 'frozen' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                      }`}>
                                        {sub.status}
                                      </span>
                                    </td>
                                    <td className="p-3">
                                      <span className="font-mono font-bold text-emerald-400 text-xs">₹{Number(sub.totalDeposits ?? 0).toFixed(2)}</span>
                                    </td>
                                    <td className="p-3">
                                      <span className="font-mono font-bold text-rose-400 text-xs">₹{Number(sub.totalWithdrawals ?? 0).toFixed(2)}</span>
                                    </td>
                                    <td className="p-3">
                                      {sub.deposits.length === 0 ? (
                                        <span className="text-[10px] text-zinc-600 italic">No deposit requests</span>
                                      ) : (
                                        <div className="space-y-1 max-h-24 overflow-y-auto">
                                          {sub.deposits.map((tx: any) => (
                                            <div key={tx.id} className="text-[10px] font-mono flex items-center gap-1.5">
                                              <span className="text-zinc-300 font-bold">₹{tx.amount}</span>
                                              <span className={`text-[8px] px-1 font-semibold rounded uppercase ${
                                                tx.status === 'approved' ? 'text-emerald-400 bg-emerald-500/5' :
                                                tx.status === 'pending' ? 'text-amber-400 bg-amber-500/5' :
                                                'text-rose-400 bg-rose-500/5'
                                              }`}>{tx.status}</span>
                                              <span className="text-[9px] text-zinc-600">({new Date(tx.createdAt).toLocaleDateString()})</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </td>
                                    <td className="p-3">
                                      {!sub.withdrawals || sub.withdrawals.length === 0 ? (
                                        <span className="text-[10px] text-zinc-600 italic">No withdraw requests</span>
                                      ) : (
                                        <div className="space-y-1 max-h-24 overflow-y-auto">
                                          {sub.withdrawals.map((tx: any) => (
                                            <div key={tx.id} className="text-[10px] font-mono flex items-center gap-1.5">
                                              <span className="text-zinc-300 font-bold">₹{tx.amount}</span>
                                              <span className={`text-[8px] px-1 font-semibold rounded uppercase ${
                                                tx.status === 'approved' ? 'text-emerald-400 bg-emerald-500/5' :
                                                tx.status === 'pending' ? 'text-amber-400 bg-amber-500/5' :
                                                'text-rose-400 bg-rose-500/5'
                                              }`}>{tx.status}</span>
                                              <span className="text-[9px] text-zinc-600">({new Date(tx.createdAt).toLocaleDateString()})</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* DETAILED USER HISTORY & BANK DETAILS INSPECTOR PANEL */}
                  {inspectedUserDetails !== null && (
                    <div className="bg-[#12161b] border border-rose-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl"></div>
                      <div className="flex justify-between items-center mb-6 pb-3 border-b border-zinc-850">
                        <div>
                          <span className="text-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-400 font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider">
                            Comprehensive User Profile Auditor
                          </span>
                          <h3 className="text-sm font-black uppercase text-zinc-200 mt-1.5 flex items-center gap-2">
                            <span>Details of Mobile:</span>
                            <span className="text-rose-400 font-mono font-black">{inspectedUserDetails.user.mobile}</span>
                            <span className="text-xs text-zinc-500">({inspectedUserDetails.user.id})</span>
                          </h3>
                        </div>
                        <button 
                          onClick={() => setInspectedUserDetails(null)}
                          className="text-zinc-500 hover:text-white bg-zinc-900 hover:bg-zinc-800 p-1.5 rounded-lg border border-zinc-800 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* 1. Account & Wallet Overview */}
                        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4">
                          <h4 className="text-[10px] text-zinc-400 uppercase font-black tracking-wider mb-2.5 flex items-center gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-rose-500" />
                            <span>Account & Wallet Overview</span>
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                              <span className="text-zinc-500">Registered Date:</span>
                              <span className="text-zinc-300 font-semibold font-mono">
                                {new Date(inspectedUserDetails.user.createdAt).toLocaleDateString()} {new Date(inspectedUserDetails.user.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                              <span className="text-zinc-500">Available Balance:</span>
                              <span className="text-emerald-400 font-bold font-mono">₹{(inspectedUserDetails.wallet.balance ?? 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                              <span className="text-zinc-500">Promo Balance:</span>
                              <span className="text-rose-400 font-bold font-mono">₹{(inspectedUserDetails.wallet.promoBalance ?? 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between border-b border-zinc-900 pb-1.5">
                              <span className="text-zinc-500">Wagering Needed:</span>
                              <span className="text-amber-400 font-bold font-mono">₹{(inspectedUserDetails.wallet.completedWagering ?? 0).toFixed(1)} / ₹{(inspectedUserDetails.wallet.requiredWagering ?? 0).toFixed(1)}</span>
                            </div>
                            <div className="flex justify-between pb-0.5">
                              <span className="text-zinc-500">VIP Tier Rank:</span>
                              {(() => {
                                const vip = getVipLevel(inspectedUserDetails.wallet.completedWagering ?? 0);
                                return (
                                  <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.2 text-[9px] font-black uppercase rounded ${vip.bgColor} ${vip.color} border ${vip.borderColor}`}>
                                    <span>{vip.icon}</span>
                                    <span>{vip.level}</span>
                                  </span>
                                );
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* 2. Registered Bank Details */}
                        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 md:col-span-2">
                          <h4 className="text-[10px] text-zinc-400 uppercase font-black tracking-wider mb-2.5 flex items-center gap-1.5">
                            <Wallet className="w-3.5 h-3.5 text-rose-500" />
                            <span>Verified Withdrawal Bank Details</span>
                          </h4>
                          {!inspectedUserDetails.user.bankAccount ? (
                            <div className="h-20 flex items-center justify-center text-zinc-600 text-xs italic">
                              No bank details have been filled by this user yet.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-850">
                                <span className="text-[9px] uppercase font-black text-zinc-500 block">Bank Name</span>
                                <span className="text-white font-bold mt-0.5 block">{inspectedUserDetails.user.bankName}</span>
                              </div>
                              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-850">
                                <span className="text-[9px] uppercase font-black text-zinc-500 block">Account Number</span>
                                <span className="text-white font-mono font-bold mt-0.5 block tracking-wider">{inspectedUserDetails.user.bankAccount}</span>
                              </div>
                              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-850">
                                <span className="text-[9px] uppercase font-black text-zinc-500 block">IFSC Code</span>
                                <span className="text-amber-400 font-mono font-bold mt-0.5 block">{inspectedUserDetails.user.bankIfsc}</span>
                              </div>
                              <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-850">
                                <span className="text-[9px] uppercase font-black text-zinc-500 block">Account Holder Name</span>
                                <span className="text-white font-bold mt-0.5 block">{inspectedUserDetails.user.bankHolderName}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 3. Bottom Tables: Transactions and Game History */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Transaction history ledger */}
                        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col max-h-[350px]">
                          <h4 className="text-[10px] text-zinc-400 uppercase font-black tracking-wider mb-3 pb-2 border-b border-zinc-900 flex justify-between items-center">
                            <span>Transaction History Ledger</span>
                            <span className="text-[9px] text-zinc-600">Total: {inspectedUserDetails.transactions.length}</span>
                          </h4>
                          <div className="overflow-y-auto grow scrollbar-thin text-xs space-y-2 pr-1">
                            {inspectedUserDetails.transactions.length === 0 ? (
                              <div className="text-zinc-600 text-center py-10 italic">No transactions recorded.</div>
                            ) : (
                              inspectedUserDetails.transactions.map((tx: any) => (
                                <div key={tx.id} className="bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-850 p-2.5 rounded-lg flex justify-between items-start">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={`text-[9px] font-black uppercase px-1 py-0.5 rounded ${
                                        tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' :
                                        tx.type === 'withdraw' ? 'bg-rose-500/10 text-rose-400' :
                                        'bg-zinc-800 text-zinc-400'
                                      }`}>{tx.type}</span>
                                      <span className={`text-[9px] font-semibold uppercase px-1 rounded ${
                                        tx.status === 'approved' || tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                                        tx.status === 'pending' ? 'bg-amber-500/10 text-amber-400 animate-pulse' :
                                        'bg-rose-500/10 text-rose-400'
                                      }`}>{tx.status}</span>
                                    </div>
                                    <div className="text-[10px] font-mono text-zinc-500 mt-1.5 flex flex-col gap-0.5">
                                      <div>ID: {tx.id}</div>
                                      {tx.utr && <div className="text-zinc-400">Transaction/UTR ID: <span className="font-bold text-amber-500">{tx.utr}</span></div>}
                                      {tx.remark && <div className="italic text-zinc-400">"{tx.remark}"</div>}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className={`font-mono font-bold text-[13px] ${
                                      tx.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'
                                    }`}>
                                      {tx.type === 'deposit' ? '+' : '-'}₹{tx.amount.toFixed(1)}
                                    </span>
                                    <div className="text-[9px] text-zinc-600 font-mono mt-1">
                                      {new Date(tx.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Game play history */}
                        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col max-h-[350px]">
                          <h4 className="text-[10px] text-zinc-400 uppercase font-black tracking-wider mb-3 pb-2 border-b border-zinc-900 flex justify-between items-center">
                            <span>Game Play History (WinGo)</span>
                            <span className="text-[9px] text-zinc-600">Last 100 bets</span>
                          </h4>
                          <div className="overflow-y-auto grow scrollbar-thin text-xs space-y-2 pr-1">
                            {inspectedUserDetails.bets.length === 0 ? (
                              <div className="text-zinc-600 text-center py-10 italic">No games played yet.</div>
                            ) : (
                              inspectedUserDetails.bets.map((b: any) => (
                                <div key={b.id} className="bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-850 p-2.5 rounded-lg flex justify-between items-center">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-zinc-500 text-[10px]">Round: <span className="font-mono font-bold text-zinc-300">{b.roundId}</span></span>
                                      <span className={`text-[9px] font-black uppercase px-1 rounded ${
                                        b.status === 'won' ? 'bg-emerald-500/10 text-emerald-400' :
                                        b.status === 'lost' ? 'bg-rose-500/10 text-rose-400' :
                                        'bg-zinc-800 text-zinc-500'
                                      }`}>{b.status}</span>
                                    </div>
                                    <div className="text-[10px] text-zinc-400 mt-1 flex gap-2">
                                      <span className="text-[9px] bg-zinc-850 px-1.5 py-0.5 rounded text-zinc-300 font-mono">
                                        {b.betType}: {b.betValue}
                                      </span>
                                    </div>
                                    <div className="text-[9px] text-zinc-600 font-mono mt-1">
                                      {new Date(b.createdAt).toLocaleDateString()} {new Date(b.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-[10px] text-zinc-500">Bet: <span className="font-mono text-zinc-300">₹{b.amount.toFixed(1)}</span></div>
                                    <div className={`font-mono font-bold text-xs mt-1 ${
                                      b.status === 'won' ? 'text-emerald-400' : 'text-zinc-500'
                                    }`}>
                                      {b.status === 'won' ? `+₹${b.winningAmount.toFixed(1)}` : '₹0.0'}
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                    </div>
                  )}

                  {adminActiveSubTab === 'financial' && (
                    <div className="space-y-6 animate-fadeIn">
                      
                      {/* Sub-tabs for Financial Administration */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none border-b border-zinc-800">
                        {[
                          { id: 'queues', name: 'Transaction Queues', icon: <Wallet className="w-3.5 h-3.5" /> },
                          { id: 'payouts', name: 'Agent Payouts', icon: <Sparkles className="w-3.5 h-3.5" /> },
                          { id: 'vault_transfer', name: 'Vault Sweeps', icon: <ArrowUpRight className="w-3.5 h-3.5" /> },
                          { id: 'gateway', name: 'Gateway Logs', icon: <TrendingUp className="w-3.5 h-3.5" /> },
                        ].map((subTab) => {
                          const isSubActive = adminFinancialSubTab === subTab.id;
                          return (
                            <button
                              key={subTab.id}
                              onClick={() => {
                                setAdminFinancialSubTab(subTab.id as any);
                                setPayoutMessage(null);
                                setPayoutError(null);
                              }}
                              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase rounded-lg border transition shrink-0 ${
                                isSubActive
                                  ? 'bg-amber-500 border-amber-500 text-zinc-950 shadow-lg shadow-amber-500/10'
                                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                              }`}
                            >
                              {subTab.icon}
                              <span>{subTab.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      {adminFinancialSubTab === 'queues' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* MANUAL TRANS APPROVAL QUEUES */}
                          <div className="lg:col-span-2 bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider">Manual Ledger Approval Queues</h3>
                              <div className="flex gap-1">
                                {(['all', 'deposit', 'withdraw'] as const).map(f => (
                                  <button 
                                    key={f}
                                    onClick={() => setAdminFilterTx(f)}
                                    className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded border transition ${adminFilterTx === f ? 'bg-amber-500 border-amber-500 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                                  >
                                    {f}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="overflow-x-auto max-h-[350px] overflow-y-auto">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
                                    <th className="pb-2">User Mobile</th>
                                    <th className="pb-2">Type</th>
                                    <th className="pb-2 text-right">Amount</th>
                                    <th className="pb-2">Remarks</th>
                                    <th className="pb-2 text-center">Status</th>
                                    <th className="pb-2 text-right">Approve/Reject Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {adminTxs.filter(t => adminFilterTx === 'all' || t.type === adminFilterTx).length === 0 ? (
                                    <tr>
                                      <td colSpan={6} className="py-6 text-center text-zinc-600 font-semibold">No transactions found</td>
                                    </tr>
                                  ) : (
                                    adminTxs
                                      .filter(t => adminFilterTx === 'all' || t.type === adminFilterTx)
                                      .map((tx) => (
                                        <tr key={tx.id} className="border-b border-zinc-850 hover:bg-zinc-900/40">
                                          <td className="py-2.5 font-mono font-bold text-zinc-300">{tx.userMobile}</td>
                                          <td className="py-2.5">
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${getBadgeColor(tx.type)}`}>
                                              {tx.type}
                                            </span>
                                          </td>
                                          <td className="py-2.5 text-right font-mono font-semibold text-zinc-300">₹{tx.amount}</td>
                                          <td className="py-2.5 text-zinc-500 truncate max-w-[120px]" title={tx.remark}>{tx.remark}</td>
                                          <td className="py-2.5 text-center">
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${tx.status === 'approved' ? 'text-emerald-400' : tx.status === 'pending' ? 'text-amber-400' : 'text-rose-400'}`}>
                                              {tx.status}
                                            </span>
                                          </td>
                                          <td className="py-2.5 text-right">
                                            {tx.status === 'pending' ? (
                                              <div className="flex justify-end gap-1">
                                                <button 
                                                  onClick={() => {
                                                    if (tx.type === 'deposit') handleAdminDepositAction(tx.id, true);
                                                    else handleAdminWithdrawAction(tx.id, true);
                                                  }}
                                                  className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold px-2 py-1 rounded text-[10px] transition"
                                                >
                                                  Approve
                                                </button>
                                                <button 
                                                  onClick={() => {
                                                    if (tx.type === 'deposit') handleAdminDepositAction(tx.id, false);
                                                    else handleAdminWithdrawAction(tx.id, false);
                                                  }}
                                                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-2 py-1 rounded text-[10px] transition"
                                                >
                                                  Reject
                                                </button>
                                              </div>
                                            ) : (
                                              <span className="text-zinc-600 text-[10px]">Processed</span>
                                            )}
                                          </td>
                                        </tr>
                                      ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* LEDGER STATS SUMMARY PANEL */}
                          <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col h-fit">
                            <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider mb-4 border-b border-zinc-850 pb-2">Ledger Overview</h3>
                            <div className="space-y-4">
                              <div className="bg-zinc-900/60 p-3.5 border border-zinc-850 rounded-xl">
                                <span className="text-[10px] uppercase font-black text-zinc-500">Gross Deposits (Pending)</span>
                                <div className="text-xl font-mono font-black text-amber-400 mt-1">
                                  ₹{adminTxs.filter(t => t.type === 'deposit' && t.status === 'pending').reduce((s, c) => s + c.amount, 0).toFixed(1)}
                                </div>
                              </div>
                              <div className="bg-zinc-900/60 p-3.5 border border-zinc-850 rounded-xl">
                                <span className="text-[10px] uppercase font-black text-zinc-500">Gross Withdrawals (Pending)</span>
                                <div className="text-xl font-mono font-black text-rose-500 mt-1">
                                  ₹{adminTxs.filter(t => t.type === 'withdraw' && t.status === 'pending').reduce((s, c) => s + c.amount, 0).toFixed(1)}
                                </div>
                              </div>
                              <div className="bg-zinc-900/60 p-3.5 border border-zinc-850 rounded-xl">
                                <span className="text-[10px] uppercase font-black text-zinc-500">Net Platform Liquidity</span>
                                <div className="text-xl font-mono font-black text-emerald-400 mt-1">
                                  ₹{adminTxs.filter(t => t.status === 'approved').reduce((s, c) => s + (c.type === 'deposit' ? c.amount : -c.amount), 0).toFixed(1)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUBTAB: AGENT PAYOUTS */}
                      {adminFinancialSubTab === 'payouts' && (
                        <div className="space-y-6">
                          
                          {/* PANEL CONTROL HEADER */}
                          <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider flex items-center gap-2">
                                  <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                                  <span>Agent Commission Settlement Panel</span>
                                </h3>
                                <p className="text-xs text-zinc-500 mt-1">
                                  Monitor subordinate generated revenues, compute commissions, and trigger settlements.
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center gap-3">
                                {/* AUTO SETTLE TOGGLE */}
                                <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-850 rounded-xl px-4 py-2">
                                  <span className="text-[10px] uppercase font-black text-zinc-400">Auto-Settle Commissions</span>
                                  <button
                                    onClick={() => handleToggleAutoSettle(!autoSettleCommissions)}
                                    disabled={loadingPayoutStats}
                                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoSettleCommissions ? 'bg-emerald-500' : 'bg-zinc-800'}`}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-zinc-950 shadow ring-0 transition duration-200 ease-in-out ${autoSettleCommissions ? 'translate-x-5' : 'translate-x-0'}`}
                                    />
                                  </button>
                                </div>

                                {/* SETTLE ALL ACTIONS */}
                                <button
                                  onClick={handleSettleAllAgents}
                                  disabled={loadingPayoutStats || agentPayoutsList.reduce((s, a) => s + a.outstandingCommission, 0) <= 0}
                                  className="bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/10 flex items-center gap-1.5"
                                >
                                  <Coins className="w-4 h-4" />
                                  <span>Settle All Agents</span>
                                </button>
                              </div>
                            </div>

                            {payoutMessage && (
                              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl mt-4 flex items-center gap-2 animate-fadeIn">
                                <Check className="w-4 h-4 shrink-0" />
                                <span>{payoutMessage}</span>
                              </div>
                            )}

                            {payoutError && (
                              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3.5 rounded-xl mt-4 flex items-center gap-2 animate-fadeIn">
                                <ShieldAlert className="w-4 h-4 shrink-0" />
                                <span>{payoutError}</span>
                              </div>
                            )}
                          </div>

                          {/* QUICK SUMMARY METRICS */}
                          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            {[
                              { label: 'Registered Agents', val: agentPayoutsList.length, color: 'text-zinc-300' },
                              { label: 'Subordinate Revenue', val: `₹${agentPayoutsList.reduce((s, a) => s + a.subordinateRevenue, 0).toFixed(1)}`, color: 'text-amber-500' },
                              { label: 'Commissions Earned', val: `₹${agentPayoutsList.reduce((s, a) => s + a.totalCommission, 0).toFixed(1)}`, color: 'text-zinc-300' },
                              { label: 'Total Settled', val: `₹${agentPayoutsList.reduce((s, a) => s + a.totalSettled, 0).toFixed(1)}`, color: 'text-emerald-400' },
                              { label: 'Outstanding Balance', val: `₹${agentPayoutsList.reduce((s, a) => s + a.outstandingCommission, 0).toFixed(1)}`, color: 'text-amber-400', border: 'border-amber-500/20 bg-amber-500/5' },
                            ].map((card, idx) => (
                              <div key={idx} className={`bg-[#12161b] border ${card.border || 'border-zinc-800'} rounded-2xl p-4 shadow-md`}>
                                <span className="text-[9px] uppercase font-black text-zinc-500 block leading-none">{card.label}</span>
                                <div className={`text-base font-mono font-black mt-1.5 ${card.color}`}>{card.val}</div>
                              </div>
                            ))}
                          </div>

                          {/* CORE AGENTS LEDGER TABLE */}
                          <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
                            <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider mb-4">Agent Commission Ledger</h3>

                            <div className="overflow-x-auto max-h-[400px] overflow-y-auto border border-zinc-850 rounded-xl">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px] font-extrabold">
                                    <th className="p-3">Agent Mobile</th>
                                    <th className="p-3 text-center">Subordinates</th>
                                    <th className="p-3 text-right">Subordinate Revenue</th>
                                    <th className="p-3 text-right">Total Commission</th>
                                    <th className="p-3 text-right">Total Settled</th>
                                    <th className="p-3 text-right text-amber-400">Outstanding Commission</th>
                                    <th className="p-3 text-right">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {agentPayoutsList.length === 0 ? (
                                    <tr>
                                      <td colSpan={7} className="p-10 text-center text-zinc-500 font-semibold">No referrals or commissions found</td>
                                    </tr>
                                  ) : (
                                    agentPayoutsList.map((a: any) => (
                                      <tr key={a.id} className="border-b border-zinc-850 hover:bg-zinc-900/30">
                                        <td className="p-3 font-mono font-bold text-zinc-300">{a.mobile}</td>
                                        <td className="p-3 text-center font-bold text-zinc-400">{a.subordinatesCount} users</td>
                                        <td className="p-3 text-right font-mono text-zinc-300">₹{a.subordinateRevenue.toFixed(1)}</td>
                                        <td className="p-3 text-right font-mono text-zinc-400">₹{a.totalCommission.toFixed(1)}</td>
                                        <td className="p-3 text-right font-mono text-emerald-400">₹{a.totalSettled.toFixed(1)}</td>
                                        <td className="p-3 text-right font-mono font-bold text-amber-400">₹{a.outstandingCommission.toFixed(1)}</td>
                                        <td className="p-3 text-right">
                                          <button
                                            onClick={() => handleSettleAgent(a.id)}
                                            disabled={loadingPayoutStats || a.outstandingCommission <= 0}
                                            className="bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800/50 disabled:text-zinc-600 text-zinc-950 font-extrabold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition"
                                          >
                                            Settle
                                          </button>
                                        </td>
                                      </tr>
                                    ))
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* RECENT SETTLEMENT HISTORICAL RECORDS */}
                          <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
                            <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider mb-4 flex items-center gap-2">
                              <History className="w-4 h-4 text-zinc-400" />
                              <span>Settlement Payouts History Logs</span>
                            </h3>

                            {recentPayoutsList.length === 0 ? (
                              <div className="text-center text-zinc-600 py-8 text-xs font-semibold border border-zinc-850 rounded-xl">
                                No historical settlement records have been registered yet.
                              </div>
                            ) : (
                              <div className="overflow-x-auto max-h-[300px] overflow-y-auto border border-zinc-850 rounded-xl">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px] font-extrabold">
                                      <th className="p-3">Payout Ref ID</th>
                                      <th className="p-3">Agent Mobile</th>
                                      <th className="p-3 text-right">Settled Payout</th>
                                      <th className="p-3 text-right">Subordinate Revenue Base</th>
                                      <th className="p-3 text-center">Settlement Type</th>
                                      <th className="p-3">Processed Date</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {recentPayoutsList.map((p: any) => (
                                      <tr key={p.id} className="border-b border-zinc-850 hover:bg-zinc-900/30">
                                        <td className="p-3 font-mono font-bold text-zinc-400">{p.id}</td>
                                        <td className="p-3 font-mono font-bold text-zinc-300">{p.agentMobile}</td>
                                        <td className="p-3 text-right font-mono font-extrabold text-emerald-400">₹{p.amount.toFixed(2)}</td>
                                        <td className="p-3 text-right font-mono text-zinc-400">₹{p.subordinateRevenue.toFixed(1)}</td>
                                        <td className="p-3 text-center">
                                          <span className={`px-2.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide ${p.type === 'automatic' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                            {p.type}
                                          </span>
                                        </td>
                                        <td className="p-3 text-zinc-400 font-mono text-[11px]">
                                          {new Date(p.createdAt).toLocaleDateString()} {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* SUBTAB: VAULT SWEEP & CRYPTO TRANSFER */}
                      {adminFinancialSubTab === 'vault_transfer' && (
                        <div className="space-y-6 animate-fadeIn">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* VAULT CONTROLLER & EXPLANATION */}
                            <div className="lg:col-span-2 space-y-6">
                              {/* EDUCATIONAL INFOGRAPHIC */}
                              <div className="bg-gradient-to-br from-zinc-950 to-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                                <h3 className="text-sm font-black uppercase text-amber-500 tracking-wider flex items-center gap-2 mb-3">
                                  <Coins className="w-5 h-5 text-amber-400 animate-pulse" />
                                  <span>Platform Crypto Flow & Cold Storage Architecture</span>
                                </h3>
                                <p className="text-xs text-zinc-300 leading-relaxed mb-4">
                                  On a production-grade crypto platform (such as Stake or Roobet), users deposit cryptocurrency directly into unique 
                                  receiving blockchain addresses generated by the server. To keep funds safe from hackers and maintain operational liquidity:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                  <div className="bg-zinc-900/40 p-3.5 border border-zinc-850 rounded-xl">
                                    <div className="font-extrabold text-zinc-200 uppercase tracking-wider mb-1 text-[10px] text-amber-400">1. User Deposit</div>
                                    <p className="text-[11px] text-zinc-400">Funds arrive at the user's specific receiving wallet. The system listens and instantly credits their account balance.</p>
                                  </div>
                                  <div className="bg-zinc-900/40 p-3.5 border border-zinc-850 rounded-xl">
                                    <div className="font-extrabold text-zinc-200 uppercase tracking-wider mb-1 text-[10px] text-emerald-400">2. Automated Sweeps</div>
                                    <p className="text-[11px] text-zinc-400">Accumulated deposits are periodically swept from individual receiving wallets to the central hot/cold wallets.</p>
                                  </div>
                                  <div className="bg-zinc-900/40 p-3.5 border border-zinc-850 rounded-xl">
                                    <div className="font-extrabold text-zinc-200 uppercase tracking-wider mb-1 text-[10px] text-indigo-400">3. Admin Control</div>
                                    <p className="text-[11px] text-zinc-400">Admins use this dashboard to sign and broadcast blockchain transactions, moving crypto anywhere instantly.</p>
                                  </div>
                                </div>
                              </div>

                              {/* SWEEP INITIATOR FORM */}
                              <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                                <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider mb-1 flex items-center gap-2">
                                  <ArrowUpRight className="w-4.5 h-4.5 text-amber-500" />
                                  <span>Initiate On-Chain Crypto Transfer / Vault Sweep</span>
                                </h3>
                                <p className="text-xs text-zinc-500 mb-4">
                                  Sign and broadcast an outward secure sweep transaction of accumulated funds to any external destination wallet.
                                </p>

                                {vaultError && (
                                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3.5 rounded-xl mb-4 font-semibold">
                                    {vaultError}
                                  </div>
                                )}

                                {vaultSuccess && (
                                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl mb-4 font-semibold">
                                    {vaultSuccess}
                                  </div>
                                )}

                                <form onSubmit={handleVaultTransfer} className="space-y-4">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-1">
                                      <label className="block text-[10px] uppercase font-black text-zinc-400 mb-1">Cryptocurrency Asset</label>
                                      <select
                                        value={vaultCurrency}
                                        onChange={(e) => setVaultCurrency(e.target.value as any)}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none font-bold font-mono"
                                      >
                                        <option value="USDT">USDT (TRC-20)</option>
                                        <option value="BTC">BTC (Bitcoin Mainnet)</option>
                                        <option value="ETH">ETH (ERC-20)</option>
                                        <option value="TRX">TRX (TRON Network)</option>
                                      </select>
                                    </div>

                                    <div className="md:col-span-2">
                                      <label className="block text-[10px] uppercase font-black text-zinc-400 mb-1">Transfer Amount</label>
                                      <div className="relative">
                                        <input
                                          type="number"
                                          step="any"
                                          required
                                          value={vaultAmount}
                                          onChange={(e) => setVaultAmount(e.target.value)}
                                          placeholder="0.00"
                                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none font-bold font-mono"
                                        />
                                        <span className="absolute right-3.5 top-2.5 text-xs text-zinc-500 font-bold font-mono">{vaultCurrency}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] uppercase font-black text-zinc-400 mb-1">Target Destination Wallet Address</label>
                                    <input
                                      type="text"
                                      required
                                      value={vaultDestination}
                                      onChange={(e) => setVaultDestination(e.target.value)}
                                      placeholder={`Enter recipient ${vaultCurrency} address (e.g., ${vaultCurrency === 'BTC' ? 'bc1q...' : vaultCurrency === 'TRX' || vaultCurrency === 'USDT' ? 'T...' : '0x...'})`}
                                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none font-mono"
                                    />
                                  </div>

                                  <button
                                    type="submit"
                                    disabled={vaultLoading}
                                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black rounded-xl py-3 text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5"
                                  >
                                    {vaultLoading ? (
                                      <>
                                        <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                                        <span>Broadcasting Secure Transaction...</span>
                                      </>
                                    ) : (
                                      <>
                                        <ArrowUpRight className="w-4.5 h-4.5" />
                                        <span>Broadcast Sweep & Transfer Outward</span>
                                      </>
                                    )}
                                  </button>
                                </form>
                              </div>
                            </div>

                            {/* SYSTEM ASSETS SUMMARY */}
                            <div className="space-y-6">
                              {/* CRYPTO BALANCES IN COLD STORAGE */}
                              <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                                <h4 className="text-xs font-black uppercase text-zinc-300 tracking-wider mb-4 pb-2 border-b border-zinc-850">Platform Liquid Hot Wallet Balance</h4>
                                <div className="space-y-3.5">
                                  {[
                                    { coin: 'USDT', balance: adminTxs.filter(t => t.type === 'deposit' && t.status === 'approved' && t.remark.includes('USDT')).reduce((s, c) => s + c.amount, 15000) - adminVaultTransfers.filter(v => v.currency === 'USDT').reduce((s, c) => s + c.amount, 0), rate: 90, desc: 'TRC-20 Tether' },
                                    { coin: 'BTC', balance: adminTxs.filter(t => t.type === 'deposit' && t.status === 'approved' && t.remark.includes('BTC')).reduce((s, c) => s + c.amount, 1.45) - adminVaultTransfers.filter(v => v.currency === 'BTC').reduce((s, c) => s + c.amount, 0), rate: 5800000, desc: 'Bitcoin network' },
                                    { coin: 'ETH', balance: adminTxs.filter(t => t.type === 'deposit' && t.status === 'approved' && t.remark.includes('ETH')).reduce((s, c) => s + c.amount, 12.8) - adminVaultTransfers.filter(v => v.currency === 'ETH').reduce((s, c) => s + c.amount, 0), rate: 310000, desc: 'ERC-20 Ethereum' },
                                    { coin: 'TRX', balance: adminTxs.filter(t => t.type === 'deposit' && t.status === 'approved' && t.remark.includes('TRX')).reduce((s, c) => s + c.amount, 85000) - adminVaultTransfers.filter(v => v.currency === 'TRX').reduce((s, c) => s + c.amount, 0), rate: 12, desc: 'TRON native' },
                                  ].map((c) => (
                                    <div key={c.coin} className="flex items-center justify-between p-2.5 bg-zinc-900/50 border border-zinc-850 rounded-xl">
                                      <div>
                                        <div className="text-xs font-black text-zinc-200">{c.coin}</div>
                                        <div className="text-[9px] text-zinc-500 font-medium uppercase tracking-wider">{c.desc}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-xs font-bold font-mono text-zinc-100">{c.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })} {c.coin}</div>
                                        <div className="text-[10px] text-emerald-400 font-mono font-medium">≈ ₹{(c.balance * c.rate).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* HISTORICAL SWEPT TRANSACTIONS */}
                            <div className="lg:col-span-3 bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
                              <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider mb-4 flex items-center gap-2">
                                <History className="w-4 h-4 text-zinc-400" />
                                <span>Vault Sweep & Transfer History Logs</span>
                              </h3>

                              {adminVaultTransfers.length === 0 ? (
                                <div className="text-center text-zinc-600 py-12 text-xs font-semibold border border-zinc-850 rounded-xl">
                                  No secure sweep transactions have been dispatched from this controller yet.
                                </div>
                              ) : (
                                <div className="overflow-x-auto border border-zinc-850 rounded-xl">
                                  <table className="w-full text-left text-xs border-collapse">
                                    <thead>
                                      <tr className="bg-zinc-900/60 border-b border-zinc-800 text-zinc-500 uppercase tracking-wider text-[10px] font-extrabold">
                                        <th className="p-3">Reference ID</th>
                                        <th className="p-3">Asset</th>
                                        <th className="p-3 text-right">Amount</th>
                                        <th className="p-3">Destination Wallet</th>
                                        <th className="p-3 text-right">Gas Fee</th>
                                        <th className="p-3">TxHash (Explorer)</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Timestamp</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {adminVaultTransfers.map((tx: any) => (
                                        <tr key={tx.id} className="border-b border-zinc-850 hover:bg-zinc-900/30">
                                          <td className="p-3 font-mono font-bold text-zinc-500">{tx.id}</td>
                                          <td className="p-3"><span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-bold font-mono">{tx.currency}</span></td>
                                          <td className="p-3 text-right font-mono font-black text-amber-400">{tx.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {tx.currency}</td>
                                          <td className="p-3 font-mono text-zinc-400 max-w-[150px] truncate" title={tx.destinationAddress}>{tx.destinationAddress}</td>
                                          <td className="p-3 text-right font-mono text-zinc-500">{tx.networkFee} {tx.currency}</td>
                                          <td className="p-3 font-mono">
                                            <a 
                                              href={tx.explorerUrl} 
                                              target="_blank" 
                                              referrerPolicy="no-referrer" 
                                              rel="noopener noreferrer"
                                              className="text-amber-500 hover:text-amber-400 hover:underline flex items-center gap-1 shrink-0"
                                            >
                                              <span>{tx.txHash.substring(0, 8)}...{tx.txHash.substring(tx.txHash.length - 8)}</span>
                                              <ArrowUpRight className="w-3 h-3" />
                                            </a>
                                          </td>
                                          <td className="p-3">
                                            <span className="px-2.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                              {tx.status}
                                            </span>
                                          </td>
                                          <td className="p-3 text-zinc-400 font-mono text-[11px]">
                                            {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: GAMES & OVERRIDES */}
                  {adminActiveSubTab === 'games' && (
                    <div className="space-y-6 animate-fadeIn">
                      
                      {/* MANUAL OUTCOME OVERRIDE SELECTOR */}
                      <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                      <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider mb-3 flex items-center gap-2">
                        <ShieldAlert className="w-4.5 h-4.5 text-rose-500" />
                        <span>Game Round Result Override</span>
                      </h3>
                      <p className="text-xs text-zinc-500 mb-4">Dictate the outcome algorithm directly for active/upcoming periods before they close. Forces specified numbers.</p>
                      
                      {overrideMessage && (
                        <div className="bg-zinc-900 border border-zinc-800 text-rose-400 text-xs p-3 rounded-lg mb-3">
                          {overrideMessage}
                        </div>
                      )}

                      <form onSubmit={handleOverrideSubmit} className="space-y-4">
                        <div>
                          <label className="block text-[10px] uppercase font-black text-zinc-400 mb-1">Select Target Draw Period</label>
                          <select 
                            value={overrideRoundId}
                            onChange={(e) => setOverrideRoundId(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                          >
                            <option value="">-- Active periods --</option>
                            {adminRounds
                              .filter(r => r.status !== 'settled')
                              .map(r => (
                                <option key={r.id} value={r.id}>WinGo {r.gameMode} - Period {r.periodNumber} ({r.status})</option>
                              ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] uppercase font-black text-zinc-400 mb-1">Force Number (0 - 9)</label>
                            <input 
                              type="number" 
                              min={0}
                              max={9}
                              value={overrideNumber}
                              onChange={(e) => setOverrideNumber(e.target.value)}
                              placeholder="e.g. 7"
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-black text-zinc-400 mb-1">Force Color (Optional)</label>
                            <select 
                              value={overrideColor}
                              onChange={(e) => setOverrideColor(e.target.value)}
                              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                            >
                              <option value="">Default (Derived)</option>
                              <option value="red">Red</option>
                              <option value="green">Green</option>
                              <option value="violet">Violet</option>
                            </select>
                          </div>
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black rounded-lg py-2.5 text-xs uppercase tracking-wider transition shadow-lg shadow-rose-500/10"
                        >
                          Apply Override Result
                        </button>
                      </form>
                    </div>
                  </div>
                  )}



                  {/* TAB: PARAMETERS & SETTINGS */}
                  {adminActiveSubTab === 'settings' && (
                    <div className="space-y-6 animate-fadeIn">
                      
                      {/* PLATFORM CONFIG MODIFICATION TOOL */}
                      <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider mb-4 flex items-center gap-2">
                      <Settings className="w-4.5 h-4.5 text-rose-500" />
                      <span>System Global Configuration Modifier</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <label className="block text-[10px] uppercase font-black text-zinc-500 mb-1">SignUp Bonus Credits (₹)</label>
                        <input 
                          type="number" 
                          defaultValue={adminSettings?.signupBonus}
                          onBlur={(e) => handleAdminSettingsSubmit({ signupBonus: Number(e.target.value) })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-black text-zinc-500 mb-1">Referral Deposit Bonus (%)</label>
                        <input 
                          type="number" 
                          value={10}
                          disabled
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-black text-zinc-500 mb-1">Winning Trading Fee (%)</label>
                        <input 
                          type="number" 
                          defaultValue={adminSettings?.winningFeePercent}
                          onBlur={(e) => handleAdminSettingsSubmit({ winningFeePercent: Number(e.target.value) })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-black text-zinc-500 mb-1">Withdrawal Minimum (₹)</label>
                        <input 
                          type="number" 
                          defaultValue={adminSettings?.minWithdraw}
                          onBlur={(e) => handleAdminSettingsSubmit({ minWithdraw: Number(e.target.value) })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-black text-zinc-500 mb-1">Wagering Multiplier (x)</label>
                        <input 
                          type="number" 
                          defaultValue={adminSettings?.wageringMultiplier ?? 1}
                          onBlur={(e) => handleAdminSettingsSubmit({ wageringMultiplier: Number(e.target.value) })}
                          placeholder="e.g. 1"
                          min="0"
                          step="0.5"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Affiliate Banner Customizer Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 mb-4 border-b border-zinc-800">
                      <div>
                        <label className="block text-[10px] uppercase font-black text-zinc-500 mb-1">Affiliate Banner Promo Text (Editable by Admin)</label>
                        <input 
                          type="text" 
                          defaultValue={adminSettings?.affiliateBannerText || ''}
                          placeholder="e.g. Earn massive cash commission instantly when friends play contract bets!"
                          onBlur={(e) => handleAdminSettingsSubmit({ affiliateBannerText: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-black text-zinc-500 mb-1">Affiliate Banner Image URL</label>
                        <input 
                          type="text" 
                          defaultValue={adminSettings?.affiliateBannerImageUrl || ''}
                          placeholder="e.g. https://images.unsplash.com/photo-1542751371-adc38448a05e"
                          onBlur={(e) => handleAdminSettingsSubmit({ affiliateBannerImageUrl: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono text-[11px]"
                        />
                      </div>
                    </div>

                    <div className="pb-4 mb-4 border-b border-zinc-800">
                      <label className="block text-[10px] uppercase font-black text-zinc-500 mb-1">Telegram Community Link</label>
                      <input type="url" defaultValue={adminSettings?.telegramUrl || ''} placeholder="https://t.me/your_channel" onBlur={(e) => handleAdminSettingsSubmit({ telegramUrl: e.target.value.trim() })} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-xs text-white focus:outline-none font-mono" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 py-3 border-t border-b border-zinc-800">
                      <div className="flex items-center gap-2 sm:border-r sm:border-zinc-800 sm:pr-4">
                        <input
                          type="checkbox"
                          id="google_oauth_enabled_cb"
                          checked={adminSettings?.googleOAuthEnabled ?? true}
                          onChange={(e) => handleAdminSettingsSubmit({ googleOAuthEnabled: e.target.checked })}
                          className="w-4 h-4 bg-zinc-900 border border-zinc-800 rounded text-blue-500 focus:ring-0"
                        />
                        <label htmlFor="google_oauth_enabled_cb" className="text-xs font-bold text-blue-400">Enable Google OAuth</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="maintenance_mode_cb"
                          checked={adminSettings?.isMaintenanceMode || false}
                          onChange={(e) => handleAdminSettingsSubmit({ isMaintenanceMode: e.target.checked })}
                          className="w-4 h-4 bg-zinc-900 border border-zinc-800 rounded text-rose-500 focus:ring-0"
                        />
                        <label htmlFor="maintenance_mode_cb" className="text-xs font-bold text-zinc-300">Enable Maintenance Lock Mode</label>
                      </div>

                      <div className="grow">
                        <input 
                          type="text" 
                          placeholder="Maintenance banner text message..."
                          defaultValue={adminSettings?.maintenanceMessage}
                          onBlur={(e) => handleAdminSettingsSubmit({ maintenanceMessage: e.target.value })}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 sm:border-l sm:border-zinc-800 sm:pl-4">
                        <input 
                          type="checkbox" 
                          id="high_bet_always_loss_cb"
                          checked={adminSettings?.highBetAlwaysLoss || false}
                          onChange={(e) => handleAdminSettingsSubmit({ highBetAlwaysLoss: e.target.checked })}
                          className="w-4 h-4 bg-zinc-900 border border-zinc-800 rounded text-amber-500 focus:ring-0"
                        />
                        <label htmlFor="high_bet_always_loss_cb" className="text-xs font-bold text-amber-400 select-none flex items-center gap-1.5">
                          <span>🚨 High Bet Always Loss</span>
                        </label>
                      </div>
                    </div>

                    {/* Arcade Games Status management */}
                    <div className="mt-6 pt-5 border-t border-zinc-850/60">
                      <span className="block text-xs font-black uppercase text-zinc-400 mb-3 tracking-wider">Arcade Games Status Management</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: 'color-trading', label: '🎨 Color Trading (WinGo)' },
                          { id: 'mine', label: '💣 Mines Arcade' },
                          { id: 'crash', label: '🚀 Crash Multiplier' },
                          { id: 'flip', label: '🪙 Lucky Coin Flip' }
                          ,{ id: 'sports', label: '🏆 Live Sportsbook' }
                        ].map((g) => {
                          const dbGame = gamesList.find(x => x.id === g.id);
                          const isEnabled = dbGame ? dbGame.isEnabled : true;
                          return (
                            <div key={g.id} className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 flex flex-col justify-between gap-2">
                              <span className="text-[11px] font-bold text-zinc-300">{g.label}</span>
                              <div className="flex items-center justify-between mt-1">
                                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                                  isEnabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                                }`}>
                                  {isEnabled ? 'Enabled' : 'Disabled'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleGame(g.id, !isEnabled)}
                                  className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded border transition ${
                                    isEnabled 
                                      ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400' 
                                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
                                  }`}
                                >
                                  {isEnabled ? 'Disable' : 'Enable'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dynamic Payment Gateways Configuration Panel */}
                    <div className="mt-8 pt-6 border-t border-zinc-800">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">💳</span>
                          <span className="block text-xs font-black uppercase text-zinc-400 tracking-wider">Dynamic Payment Gateways Manager</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { playClickSound(); setShowAddGatewayForm(!showAddGatewayForm); }}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition flex items-center gap-1"
                        >
                          {showAddGatewayForm ? 'Cancel Add' : 'Add New Gateway'}
                        </button>
                      </div>

                      {showAddGatewayForm && (
                        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 mb-6 animate-fadeIn space-y-4">
                          <span className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider border-b border-zinc-900 pb-2">Create New Custom Gateway Interface</span>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-1">Gateway ID (unique Slug)</label>
                              <input
                                type="text"
                                placeholder="e.g. razorpay, starpay, etc"
                                value={gwId}
                                onChange={(e) => setGwId(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-1">Gateway Display Name</label>
                              <input
                                type="text"
                                placeholder="e.g. StarPay UPI"
                                value={gwName}
                                onChange={(e) => setGwName(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-1">Brief Description</label>
                              <input
                                type="text"
                                placeholder="e.g. UPI QR and Instant Approvals"
                                value={gwDescription}
                                onChange={(e) => setGwDescription(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-1">API Endpoint URL</label>
                              <input
                                type="text"
                                placeholder="https://api.gateway.com/v1/pay"
                                value={gwApiUrl}
                                onChange={(e) => setGwApiUrl(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-1">Merchant ID</label>
                              <input
                                type="text"
                                placeholder="Merchant ID or UID"
                                value={gwMerchantId}
                                onChange={(e) => setGwMerchantId(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-1">API Secret Key</label>
                              <input
                                type="text"
                                placeholder="API Secret Key / Signature Key"
                                value={gwApiKey}
                                onChange={(e) => setGwApiKey(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-1">Minimum Deposit Limit (₹)</label>
                              <input
                                type="number"
                                value={gwMinAmount}
                                onChange={(e) => setGwMinAmount(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-1">Maximum Deposit Limit (₹)</label>
                              <input
                                type="number"
                                value={gwMaxAmount}
                                onChange={(e) => setGwMaxAmount(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-1.5 px-3 text-xs text-white focus:outline-none font-mono"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              playClickSound();
                              if (!gwId || !gwName || !gwApiUrl || !gwMerchantId || !gwApiKey) {
                                alert('Please fill in all required fields (ID, Name, URL, Merchant ID, API Key)');
                                return;
                              }
                              const existingGateways = adminSettings?.paymentGateways || [];
                              if (existingGateways.some((g: any) => g.id === gwId)) {
                                alert('A gateway with this ID already exists. Please use a unique slug.');
                                return;
                              }
                              const updated = [...existingGateways, {
                                id: gwId,
                                name: gwName,
                                apiUrl: gwApiUrl,
                                merchantId: gwMerchantId,
                                apiKey: gwApiKey,
                                minAmount: Number(gwMinAmount) || 100,
                                maxAmount: Number(gwMaxAmount) || 50000,
                                isEnabled: true,
                                isDefault: existingGateways.length === 0,
                                description: gwDescription
                              }];
                              handleAdminSettingsSubmit({ paymentGateways: updated });
                              // Reset form fields
                              setGwId('');
                              setGwName('');
                              setGwApiUrl('');
                              setGwMerchantId('');
                              setGwApiKey('');
                              setGwMinAmount('100');
                              setGwMaxAmount('50000');
                              setGwDescription('');
                              setShowAddGatewayForm(false);
                            }}
                            className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 rounded-lg px-4 py-2 text-xs font-black uppercase tracking-wider transition font-mono"
                          >
                            Save Gateway
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-4">
                        {(!adminSettings?.paymentGateways || adminSettings.paymentGateways.length === 0) ? (
                          <div className="bg-zinc-950 border border-zinc-900 border-dashed rounded-xl p-6 text-center text-zinc-500 text-xs">
                            No payment gateways configured. Fill "Add New Gateway" above to build your dynamic payment routing system.
                          </div>
                        ) : (
                          adminSettings.paymentGateways.map((g: any) => (
                            <div key={g.id} className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-zinc-800 transition">
                              <div className="space-y-1 grow">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-white uppercase">{g.name}</span>
                                  <span className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[9px] font-mono text-zinc-400">ID: {g.id}</span>
                                  {g.isDefault && (
                                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded px-1.5 py-0.5 text-[8px] font-black uppercase">DEFAULT GATEWAY</span>
                                  )}
                                  {g.isEnabled ? (
                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded px-1.5 py-0.5 text-[8px] font-black uppercase">Active</span>
                                  ) : (
                                    <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded px-1.5 py-0.5 text-[8px] font-black uppercase">Disabled</span>
                                  )}
                                </div>
                                <p className="text-[10px] text-zinc-400 font-sans">{g.description || 'No description provided'}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 pt-1 text-[10px] text-zinc-500 font-mono">
                                  <div className="truncate">URL: <span className="text-zinc-400">{g.apiUrl}</span></div>
                                  <div>MID: <span className="text-zinc-400">{g.merchantId}</span></div>
                                  <div>Secret API Key: <span className="text-zinc-400 font-bold">••••••••{g.apiKey ? g.apiKey.slice(-4) : ''}</span></div>
                                  <div>Limits: <span className="text-zinc-400 font-sans">₹{g.minAmount} — ₹{g.maxAmount}</span></div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap md:flex-nowrap border-t border-zinc-900 md:border-t-0 pt-3 md:pt-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    playClickSound();
                                    const updated = (adminSettings.paymentGateways || []).map((item: any) => ({
                                      ...item,
                                      isDefault: item.id === g.id ? true : false
                                    }));
                                    handleAdminSettingsSubmit({ paymentGateways: updated });
                                  }}
                                  disabled={g.isDefault}
                                  className={`px-2.5 py-1 text-[9px] font-black uppercase rounded border transition ${
                                    g.isDefault
                                      ? 'bg-zinc-900 border-zinc-850 text-zinc-600 cursor-not-allowed'
                                      : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-400'
                                  }`}
                                >
                                  Make Default
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    playClickSound();
                                    const updated = (adminSettings.paymentGateways || []).map((item: any) => {
                                      if (item.id === g.id) {
                                        return { ...item, isEnabled: !item.isEnabled };
                                      }
                                      return item;
                                    });
                                    handleAdminSettingsSubmit({ paymentGateways: updated });
                                  }}
                                  className={`px-2.5 py-1 text-[9px] font-black uppercase rounded border transition ${
                                    g.isEnabled
                                      ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400'
                                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
                                  }`}
                                >
                                  {g.isEnabled ? 'Disable' : 'Enable'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    playClickSound();
                                    if (confirm(`Are you sure you want to delete payment gateway ${g.name}?`)) {
                                      const updated = (adminSettings.paymentGateways || []).filter((item: any) => item.id !== g.id);
                                      handleAdminSettingsSubmit({ paymentGateways: updated });
                                    }
                                  }}
                                  className="bg-zinc-900 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 text-zinc-400 border border-zinc-800 rounded px-2 py-1 transition"
                                  title="Delete Gateway"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Chronological Audit logs */}
                    <div className="mt-6">
                      <span className="block text-xs font-black uppercase text-zinc-400 mb-2">Chronological Audit Logs</span>
                      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 h-40 overflow-y-auto font-mono text-[10px] text-zinc-400 space-y-1.5 scrollbar-thin">
                        {adminAuditLogs.map((log) => (
                          <div key={log.id} className="hover:text-white transition">
                            <span className="text-zinc-600">[{new Date(log.createdAt).toLocaleTimeString()}]</span>{' '}
                            <span className="text-rose-400/90">{log.userId ? `[Admin: ${log.userId}]` : '[System]'}</span>{' '}
                            <span>{log.action}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    </div>
                    </div>
                  )}

                  {/* TAB: COUPON MANAGEMENT PANEL FOR ADMIN */}
                  {adminActiveSubTab === 'coupons' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                      {/* Left Column: Create Coupon Form */}
                      <div className="lg:col-span-1 bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-850">
                            <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider flex items-center gap-2">
                              <Ticket className="w-4 h-4 text-rose-500" />
                              <span>Create Coupon</span>
                            </h3>
                          </div>
                          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                            Generate unique, single-use voucher coupons. Users who redeem these codes will receive the specified amount instantly credited to their wallet balance.
                          </p>

                          <form onSubmit={handleCreateCoupon} className="space-y-4">
                            <div>
                              <label className="block text-[10px] uppercase font-black text-zinc-500 mb-1 tracking-wider">Coupon Code</label>
                              <input
                                type="text"
                                required
                                value={adminCouponCode}
                                onChange={(e) => {
                                  setAdminCouponCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                                  setAdminCouponError(null);
                                  setAdminCouponSuccess(null);
                                }}
                                placeholder="E.G. FESTIVE500, NEWYEAR250"
                                className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-700 uppercase font-mono focus:outline-none transition"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-black text-zinc-500 mb-1 tracking-wider">Coupon Currency</label>
                              <select
                                value={adminCouponCurrency}
                                onChange={(e) => setAdminCouponCurrency(e.target.value as any)}
                                className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-lg py-2 px-3 text-xs text-zinc-300 outline-none focus:outline-none transition"
                              >
                                <option value="INR">INR (₹)</option>
                                <option value="USDT">USDT</option>
                                <option value="BTC">BTC</option>
                                <option value="ETH">ETH</option>
                                <option value="TRX">TRX</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-[10px] uppercase font-black text-zinc-500 mb-1 tracking-wider">
                                Credit Amount {adminCouponCurrency !== 'INR' ? `in ${adminCouponCurrency}` : '(₹)'}
                              </label>
                              <input
                                type="number"
                                required
                                min="0.000001"
                                step="any"
                                value={adminCouponAmount}
                                onChange={(e) => {
                                  setAdminCouponAmount(e.target.value);
                                  setAdminCouponError(null);
                                  setAdminCouponSuccess(null);
                                }}
                                placeholder={adminCouponCurrency === 'INR' ? 'E.G. 500' : 'E.G. 10'}
                                className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-700 font-mono focus:outline-none transition"
                              />
                            </div>

                            {adminCouponError && (
                              <p className="text-xs text-rose-400 font-semibold">{adminCouponError}</p>
                            )}
                            {adminCouponSuccess && (
                              <p className="text-xs text-emerald-400 font-semibold">{adminCouponSuccess}</p>
                            )}

                            <button
                              type="submit"
                              disabled={creatingCoupon || !adminCouponCode.trim() || !adminCouponAmount}
                              className="w-full bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:hover:bg-rose-600 font-black text-xs uppercase text-white py-2.5 rounded-lg transition tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
                            >
                              {creatingCoupon ? 'Creating...' : 'Generate Coupon'}
                            </button>
                          </form>
                        </div>
                      </div>

                      {/* Right Column: Existing Coupons List */}
                      <div className="lg:col-span-2 bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-850">
                          <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider">Active & Redeemed Coupons</h3>
                          <span className="text-[10px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-mono uppercase">
                            {adminCoupons.length} Total Coupons
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          {adminCoupons.length === 0 ? (
                            <div className="py-12 text-center">
                              <Ticket className="w-10 h-10 text-zinc-700 mx-auto mb-2 opacity-50" />
                              <p className="text-zinc-500 text-xs italic font-sans">No coupon codes have been created yet.</p>
                            </div>
                          ) : (
                            <table className="w-full text-left text-xs text-zinc-400">
                              <thead>
                                <tr className="border-b border-zinc-850 text-zinc-500 uppercase tracking-wider text-[10px] font-black">
                                  <th className="py-2.5">Code</th>
                                  <th className="py-2.5">Amount</th>
                                  <th className="py-2.5">Redemption Status</th>
                                  <th className="py-2.5">User</th>
                                  <th className="py-2.5 text-right">Date Created</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-850 font-mono">
                                {adminCoupons.map((coupon, idx) => (
                                  <tr key={coupon.code ? `${coupon.code}-${idx}` : idx} className="hover:bg-zinc-900/40 transition">
                                    <td className="py-3 text-white font-black text-xs tracking-wider">{coupon.code}</td>
                                    <td className="py-3 text-zinc-300 font-bold">
                                      {coupon.currency && coupon.currency !== 'INR'
                                        ? `${parseFloat(coupon.amount).toFixed(4)} ${coupon.currency}`
                                        : `₹${parseFloat(coupon.amount).toFixed(2)}`
                                      }
                                    </td>
                                    <td className="py-3">
                                      {coupon.isRedeemed ? (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-zinc-500 border border-zinc-800 uppercase">
                                          Redeemed
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                                          Active
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 text-[11px] text-zinc-400 max-w-[120px] truncate">
                                      {coupon.isRedeemed ? (
                                        <div className="flex flex-col">
                                          <span className="text-rose-400 font-bold truncate">User: {coupon.redeemedBy}</span>
                                          {coupon.redeemedAt && (
                                            <span className="text-[9px] text-zinc-600">{new Date(coupon.redeemedAt).toLocaleDateString()}</span>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-zinc-600 italic">-</span>
                                      )}
                                    </td>
                                    <td className="py-3 text-right text-[10px] text-zinc-500">
                                      {new Date(coupon.createdAt).toLocaleDateString()}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ENTERPRISE CUSTODY DASHBOARD SUB-TAB */}
                  {adminActiveSubTab === 'custody' && (
                    <div className="animate-fadeIn">
                      <CustodyDashboard />
                    </div>
                  )}

                  {/* NEW SUPPORT TICKETS RESOLUTION PANEL FOR ADMIN */}
                  {adminActiveSubTab === 'tickets' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
                      {/* Left Column: Tickets Queue list */}
                      <div className="lg:col-span-1 bg-[#12161b] border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col h-[550px]">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-850">
                          <h3 className="text-xs font-black uppercase text-zinc-300 tracking-wider">Tickets Queue</h3>
                          <span className="text-[9px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded font-black">
                            {adminTickets.filter(t => t.status === 'open').length} Open
                          </span>
                        </div>

                        <div className="space-y-2.5 overflow-y-auto flex-grow pr-1 scrollbar-thin font-sans">
                          {adminTickets.length === 0 ? (
                            <p className="text-zinc-600 text-xs py-8 text-center italic">No support tickets generated yet.</p>
                          ) : (
                            adminTickets.map((t) => {
                              const isSelected = replyTicketId === t.id;
                              return (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => {
                                    setReplyTicketId(t.id);
                                    setAdminReplyText(t.adminReply || '');
                                    setAdminReplyStatus(t.status);
                                  }}
                                  className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-1.5 ${
                                    isSelected 
                                      ? 'bg-rose-500/10 border-rose-500/40 text-white' 
                                      : 'bg-zinc-950/40 border-zinc-900 hover:border-zinc-800 text-zinc-400'
                                  }`}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span className="text-[9px] font-mono font-bold text-zinc-500">ID: {t.id}</span>
                                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider ${
                                      t.status === 'resolved' 
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    }`}>
                                      {t.status}
                                    </span>
                                  </div>
                                  <div className="text-xs font-black text-zinc-200 truncate w-full">{t.subject}</div>
                                  <div className="text-[10px] text-zinc-500 truncate w-full">{t.message}</div>
                                  <div className="text-[8px] text-zinc-600 font-mono text-right w-full mt-1">
                                    Mobile: {t.userMobile || '—'}
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Right Column: Ticket Inspection & Response */}
                      <div className="lg:col-span-2 bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl min-h-[500px]">
                        {replyTicketId ? (() => {
                          const ticket = adminTickets.find(t => t.id === replyTicketId);
                          if (!ticket) return null;
                          return (
                            <div className="space-y-6 animate-fadeIn">
                              <div className="flex items-start justify-between pb-3 border-b border-zinc-850">
                                <div>
                                  <span className="text-[10px] text-zinc-500 font-mono block font-bold">INSPECTING TICKET: {ticket.id}</span>
                                  <h3 className="text-sm font-black uppercase text-zinc-200 mt-1">{ticket.subject}</h3>
                                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-500 font-mono mt-1">
                                    <span>User: <strong className="text-zinc-300">{ticket.userMobile}</strong> (ID: {ticket.userId})</span>
                                    <span>•</span>
                                    <span>Opened: {new Date(ticket.createdAt).toLocaleString()}</span>
                                  </div>
                                </div>
                                <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                                  ticket.status === 'resolved' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                }`}>
                                  {ticket.status}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <label className="block text-[10px] uppercase font-black text-zinc-400">User's Message Statement</label>
                                <p className="text-xs text-zinc-300 bg-zinc-950 p-4 rounded-xl border border-zinc-900 leading-relaxed whitespace-pre-wrap font-sans select-all">
                                  {ticket.message}
                                </p>
                              </div>

                              {/* Response Form */}
                              <form onSubmit={(e) => handleAdminReplyTicket(e, ticket.id)} className="space-y-4 pt-2 border-t border-zinc-850/60">
                                <div>
                                  <label className="block text-[10px] uppercase font-black text-zinc-400 mb-1.5">Official Support Reply</label>
                                  <textarea
                                    rows={5}
                                    value={adminReplyText}
                                    onChange={(e) => setAdminReplyText(e.target.value)}
                                    placeholder="Type official system response here... e.g. We have reviewed your deposit transaction, verified UTR, and successfully manually credited ₹500 to your wallet."
                                    className="w-full bg-zinc-950 border border-zinc-900 rounded-xl py-2.5 px-4 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-rose-500/40 transition resize-none font-sans"
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] uppercase font-black text-zinc-400 mb-1.5">Ticket Status Update</label>
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setAdminReplyStatus('open')}
                                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                                          adminReplyStatus === 'open' 
                                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                                            : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-400'
                                        }`}
                                      >
                                        Keep Open
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setAdminReplyStatus('resolved')}
                                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition ${
                                          adminReplyStatus === 'resolved' 
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                            : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-400'
                                        }`}
                                      >
                                        Mark Resolved
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex items-end">
                                    <button
                                      type="submit"
                                      className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl py-3 text-xs uppercase tracking-wider transition shadow-lg shadow-rose-500/10 flex items-center justify-center gap-2"
                                    >
                                      <span>Dispatch Response</span>
                                    </button>
                                  </div>
                                </div>
                              </form>
                            </div>
                          );
                        })() : (
                          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 py-20">
                            <LifeBuoy className="w-12 h-12 text-zinc-800 mb-3 animate-bounce" />
                            <h4 className="text-xs font-black uppercase text-zinc-400 tracking-wider">No Ticket Selected</h4>
                            <p className="text-xs text-zinc-500 max-w-sm mt-1 leading-relaxed">Select any ticket from the queue on the left to inspect its messages, view user metadata, and reply or resolve.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* GOOGLE AUTHENTICATOR 2FA SUB-TAB */}
                  {adminActiveSubTab === 'security' && (
                    <>
                    {user?.adminRole === 'master' && (
                      <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl mb-6">
                        <div className="flex items-center justify-between mb-5">
                          <div><h3 className="text-sm font-black uppercase text-zinc-200">Sub-admin Management</h3><p className="text-[10px] text-zinc-500 mt-1">Create role-limited administrative accounts</p></div>
                          <button onClick={loadSubAdmins} className="text-xs text-purple-400">Refresh list</button>
                        </div>
                        <form onSubmit={handleCreateSubAdmin} className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          <input value={subAdminForm.username} onChange={e => setSubAdminForm({...subAdminForm, username:e.target.value})} placeholder="Username" className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs" required />
                          <input type="email" value={subAdminForm.email} onChange={e => setSubAdminForm({...subAdminForm, email:e.target.value})} placeholder="Email" className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs" required />
                          <input type="password" minLength={12} value={subAdminForm.password} onChange={e => setSubAdminForm({...subAdminForm, password:e.target.value})} placeholder="Password (12+ chars)" className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs" required />
                          <select value={subAdminForm.role} onChange={e => setSubAdminForm({...subAdminForm, role:e.target.value})} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs">
                            <option value="operations">Operations</option><option value="finance">Finance</option><option value="support">Support</option><option value="games">Game Manager</option><option value="viewer">Read only</option>
                          </select>
                          <button className="bg-purple-600 hover:bg-purple-500 rounded-lg p-3 text-xs font-bold">Create sub-admin</button>
                        </form>
                        {subAdminMessage && <p className="text-xs text-amber-300 mt-3">{subAdminMessage}</p>}
                        {subAdmins.length > 0 && <div className="mt-4 space-y-2">{subAdmins.map(a => <div key={a.id} className="flex justify-between bg-zinc-950 rounded-lg p-3 text-xs"><span>{a.username} · {a.email}</span><span className="uppercase text-purple-400">{a.adminRole} {a.twoFactorEnabled ? '· 2FA ON' : '· 2FA OFF'}</span></div>)}</div>}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                      
                      {/* Left Box: Setup/Activation */}
                      <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-zinc-850">
                          <div className="p-2.5 bg-rose-500/15 rounded-xl text-rose-500">
                            <Lock className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black uppercase text-zinc-200 tracking-wider">Configure 2FA Protection</h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5 font-mono">Setup Multi-Factor Verification</p>
                          </div>
                        </div>

                        {tfError && (
                          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3.5 rounded-xl font-bold flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 shrink-0" />
                            <span>{tfError}</span>
                          </div>
                        )}

                        {tfSuccess && (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl font-bold flex items-center gap-2">
                            <Check className="w-4 h-4 shrink-0" />
                            <span>{tfSuccess}</span>
                          </div>
                        )}

                        {user?.twoFactorEnabled ? (
                          <div className="p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/20 text-center space-y-4">
                            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                              <ShieldCheck className="w-7 h-7" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wider">MFA Security Active</h4>
                              <p className="text-xs text-zinc-400 mt-2 max-w-sm mx-auto leading-relaxed">
                                Google Authenticator protection is successfully bound to your account. Future sign-ins will require dynamic OTP passcode validation.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              Add an extra layer of defense. In addition to your password, you will be prompted for a 6-digit dynamic code generated in real-time by your Google Authenticator app on your smartphone.
                            </p>

                            {!tfSetupSecret ? (
                              <button
                                type="button"
                                onClick={handleGetTfSetup}
                                disabled={tfLoading}
                                className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/40 text-white font-black rounded-xl py-3 text-xs uppercase tracking-wider transition shadow-lg shadow-rose-500/10"
                              >
                                {tfLoading ? 'Generating Safe Key...' : 'Initiate 2FA Setup'}
                              </button>
                            ) : (
                              <form onSubmit={handleEnableTf} className="space-y-6 animate-fadeIn">
                                <div className="space-y-4 bg-zinc-950 p-5 rounded-xl border border-zinc-900">
                                  <div className="text-center space-y-2">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono font-bold">Step 1: Scan QR Code</span>
                                    {tfSetupQrUrl && (
                                      <div className="bg-white p-3 rounded-lg inline-block shadow-lg mx-auto border border-zinc-200">
                                        <img src={tfSetupQrUrl} alt="2FA QR Code" className="w-40 h-40" referrerPolicy="no-referrer" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-1">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono font-bold block">Or Enter Secret Code Manually</span>
                                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center justify-between font-mono text-sm text-zinc-300">
                                      <span className="select-all tracking-widest">{tfSetupSecret}</span>
                                      <button 
                                        type="button" 
                                        onClick={() => { navigator.clipboard.writeText(tfSetupSecret || ''); alert('Copied secret code!'); }}
                                        className="text-[10px] uppercase font-bold text-rose-400 hover:text-rose-300 transition"
                                      >
                                        Copy
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <label className="text-[10px] uppercase font-black text-zinc-400">Step 2: Verify Authenticator Code</label>
                                    <span className="text-[9px] text-zinc-500 font-bold font-mono">6-Digit Passcode</span>
                                  </div>
                                  <input
                                    type="text"
                                    value={tfSetupCode}
                                    onChange={(e) => setTfSetupCode(e.target.value.replace(/\D/g, ''))}
                                    placeholder="e.g. 123456"
                                    maxLength={6}
                                    className="w-full bg-zinc-950 border border-zinc-850 focus:border-rose-500/50 rounded-xl py-3 px-4 text-xs text-white placeholder-zinc-700 focus:outline-none transition font-mono tracking-widest text-center text-lg"
                                    required
                                  />
                                </div>

                                <div className="flex gap-3">
                                  <button
                                    type="button"
                                    onClick={() => { setTfSetupSecret(null); setTfSetupQrUrl(null); setTfSetupCode(''); }}
                                    className="flex-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 font-bold border border-zinc-800 rounded-xl py-3 text-xs uppercase tracking-wider transition"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={tfLoading}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/40 text-white font-black rounded-xl py-3 text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/10"
                                  >
                                    {tfLoading ? 'Activating...' : 'Verify & Enable'}
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right Box: Status & Deactivation */}
                      <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-zinc-850">
                          <div className="p-2.5 bg-rose-500/15 rounded-xl text-rose-500">
                            <ShieldAlert className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black uppercase text-zinc-200 tracking-wider">Device Status & Policy</h3>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5 font-mono">Enforcement Rules & Control</p>
                          </div>
                        </div>

                        <div className="space-y-5">
                          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 flex items-center justify-between">
                            <div>
                              <div className="text-[10px] text-zinc-500 uppercase font-black">Admin Protection Shield</div>
                              <div className="text-xs text-zinc-400 font-bold mt-1">Status Policy</div>
                            </div>
                            <div>
                              {user?.twoFactorEnabled ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                  SECURE
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                                  UNPROTECTED
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-xs text-zinc-500 space-y-3 leading-relaxed">
                            <p className="font-bold text-zinc-400">Strict Enforcement Note:</p>
                            <p>Once Google Authenticator 2FA is successfully enabled on an administrative account, it is bound tightly to your login process.</p>
                            <p>To deactivate, you must supply a valid 6-digit TOTP token below. If you lose access to your authenticator application, please contact the lead DevOps administrator directly to manually reset your security parameters.</p>
                          </div>

                          {user?.twoFactorEnabled && (
                            <form onSubmit={handleDisableTf} className="space-y-4 pt-4 border-t border-zinc-850/60 animate-fadeIn">
                              <div className="space-y-2">
                                <label className="block text-[10px] uppercase font-black text-zinc-400">Deactivate Google Authenticator 2FA</label>
                                <input
                                  type="text"
                                  value={tfDisableCode}
                                  onChange={(e) => setTfDisableCode(e.target.value.replace(/\D/g, ''))}
                                  placeholder="Enter current 6-digit code"
                                  maxLength={6}
                                  className="w-full bg-zinc-950 border border-zinc-850 focus:border-rose-500/50 rounded-xl py-2.5 px-4 text-xs text-white placeholder-zinc-700 focus:outline-none transition font-mono tracking-widest text-center"
                                  required
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={tfLoading}
                                className="w-full bg-zinc-900 border border-rose-500/30 hover:border-rose-500/60 text-rose-400 hover:text-rose-300 font-bold rounded-xl py-2.5 text-xs uppercase tracking-wider transition"
                              >
                                {tfLoading ? 'Deactivating...' : 'Deactivate 2FA'}
                              </button>
                            </form>
                          )}
                        </div>
                      </div>
                    </div>
                    </>
                  )}

                </div>
              )}

              {/* ========================================================
                  TAB 4.5: SUPPORT TICKETS CONSOLE (USER SESSIONS)
                 ======================================================== */}
              {activeTab === 'tickets' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn" id="panel_tickets">
                  {/* Left Column: Raise Ticket */}
                  <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl h-fit">
                    <div className="flex items-center gap-2 mb-4">
                      <LifeBuoy className="w-5 h-5 text-rose-500" />
                      <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider">Raise a Support Ticket</h3>
                    </div>
                    <p className="text-xs text-zinc-500 mb-4">Need help with deposits, withdrawals, or gameplay? Submit a detailed ticket and our support team will assist you.</p>

                    {ticketError && (
                      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3.5 rounded-xl mb-4 font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{ticketError}</span>
                      </div>
                    )}
                    {ticketSuccess && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl mb-4 font-bold flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0" />
                        <span>{ticketSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleCreateTicket} className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase font-black text-zinc-400 mb-1.5">Ticket Subject</label>
                        <input
                          type="text"
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          placeholder="e.g. Deposit not credited, Withdrawal pending"
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-xl py-2.5 px-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500/40 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-black text-zinc-400 mb-1.5">Detailed Message</label>
                        <textarea
                          rows={5}
                          value={ticketMessage}
                          onChange={(e) => setTicketMessage(e.target.value)}
                          placeholder="Please provide complete details including transaction UTR number, date, and description..."
                          className="w-full bg-zinc-900 border border-zinc-850 rounded-xl py-2.5 px-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500/40 transition resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={ticketSubmitting}
                        className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/50 text-white font-black rounded-xl py-3 text-xs uppercase tracking-wider transition shadow-lg shadow-rose-500/10 flex items-center justify-center gap-2"
                      >
                        {ticketSubmitting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Submitting Request...</span>
                          </>
                        ) : (
                          <span>Submit Ticket</span>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Active Tickets History */}
                  <div className="lg:col-span-2 bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-850">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-amber-500" />
                        <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider">Your Support Logs</h3>
                      </div>
                      <button
                        onClick={fetchUserTickets}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border border-zinc-800 transition"
                        title="Reload tickets"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {userTickets.length === 0 ? (
                      <div className="text-center py-16 flex flex-col items-center justify-center">
                        <LifeBuoy className="w-12 h-12 text-zinc-700 mb-3 animate-pulse" />
                        <p className="text-sm text-zinc-400 font-bold">No active support tickets found</p>
                        <p className="text-xs text-zinc-600 mt-1">Raise a new ticket on the left if you need assistance.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                        {userTickets.map((t) => (
                          <div key={t.id} className="bg-zinc-900/60 border border-zinc-850 rounded-xl p-4 space-y-3 hover:border-zinc-800 transition animate-fadeIn">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-[10px] text-zinc-500 font-mono block font-bold">Ticket ID: {t.id}</span>
                                <h4 className="text-xs font-black text-white mt-1">{t.subject}</h4>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                t.status === 'resolved' 
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}>
                                {t.status}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 whitespace-pre-wrap bg-zinc-950/40 p-3 rounded-lg border border-zinc-850/60 leading-relaxed font-sans">{t.message}</p>
                            
                            {t.adminReply ? (
                              <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3.5 space-y-1 mt-2">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                  <span className="text-[10px] uppercase font-black text-rose-400">Response from Support</span>
                                </div>
                                <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans">{t.adminReply}</p>
                                {t.updatedAt && (
                                  <span className="text-[8px] text-zinc-600 block text-right mt-1 font-mono">Replied: {new Date(t.updatedAt).toLocaleDateString()} {new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                )}
                              </div>
                            ) : (
                              <div className="text-[10px] text-zinc-600 italic flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-zinc-600 animate-ping"></div>
                                <span>Awaiting support representative response...</span>
                              </div>
                            )}

                            <div className="text-[9px] text-zinc-600 font-mono pt-1 text-right border-t border-zinc-850/30">
                              Opened: {new Date(t.createdAt).toLocaleDateString()} {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 4.8: MY BETS LOG (BETTING HISTORY)
                 ======================================================== */}
              {activeTab === 'my-bets' && (
                <div className="flex flex-col gap-6 animate-fadeIn" id="panel_my_bets">
                  {/* Stats Cards Section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(() => {
                      const totalBetsCount = userBets.length;
                      const totalWagered = userBets.reduce((acc, b) => acc + Number(b.amount), 0);
                      const totalWinnings = userBets.reduce((acc, b) => b.status === 'won' ? acc + Number(b.winningAmount) : acc, 0);
                      const netProfitLoss = totalWinnings - totalWagered;
                      const wonBetsCount = userBets.filter(b => b.status === 'won').length;
                      const winRate = totalBetsCount > 0 ? (wonBetsCount / totalBetsCount) * 100 : 0;

                      return (
                        <>
                          <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-full blur-2xl"></div>
                            <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-wider">Total Bets Placed</span>
                            <div className="mt-2 flex items-baseline gap-2">
                              <span className="text-2xl font-black text-white font-mono">{totalBetsCount}</span>
                              <span className="text-xs text-zinc-400">Rounds</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-1">Win Rate: {winRate.toFixed(1)}%</div>
                          </div>

                          <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl"></div>
                            <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-wider">Total Wagered Volume</span>
                            <div className="mt-2 flex items-baseline gap-1">
                              <span className="text-2xl font-black text-amber-500 font-mono">₹{totalWagered.toFixed(2)}</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-1">Avg Bet: ₹{totalBetsCount > 0 ? (totalWagered / totalBetsCount).toFixed(2) : '0.00'}</div>
                          </div>

                          <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl"></div>
                            <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-wider">Total Winnings Paid</span>
                            <div className="mt-2 flex items-baseline gap-1">
                              <span className="text-2xl font-black text-emerald-400 font-mono">₹{totalWinnings.toFixed(2)}</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-1">Total Wins: {wonBetsCount} Rounds</div>
                          </div>

                          <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500/5 rounded-full blur-2xl"></div>
                            <span className="text-zinc-500 font-bold text-[10px] uppercase tracking-wider">Net Profit / Loss</span>
                            <div className="mt-2 flex items-baseline gap-1">
                              <span className={`text-2xl font-black font-mono ${netProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {netProfitLoss >= 0 ? '+' : ''}₹{netProfitLoss.toFixed(2)}
                              </span>
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-1">
                              Status: {netProfitLoss >= 0 ? 'In Profit' : 'In Deficit'}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Filter and Table Card */}
                  <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-zinc-800/60">
                      <div>
                        <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider flex items-center gap-2">
                          <History className="w-4.5 h-4.5 text-rose-500" />
                          <span>My Complete Betting Log</span>
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">Browse, search, and audit your historical arcade bets</p>
                      </div>

                      {/* Filter/Search Bar */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        {/* Search Input */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search Period No..."
                            value={myBetsSearch}
                            onChange={(e) => setMyBetsSearch(e.target.value)}
                            className="bg-zinc-950 text-xs text-white border border-zinc-800 focus:border-rose-500/50 rounded-xl pl-3.5 pr-8 py-2 w-48 transition outline-none"
                          />
                          {myBetsSearch && (
                            <button
                              onClick={() => setMyBetsSearch('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Status Quick Filter Buttons */}
                        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-1 flex items-center gap-1">
                          {(['all', 'won', 'lost', 'pending'] as const).map((st) => (
                            <button
                              key={st}
                              onClick={() => { playClickSound(); setMyBetsStatusFilter(st); }}
                              className={`px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider transition ${
                                myBetsStatusFilter === st
                                  ? 'bg-rose-500 text-white shadow'
                                  : 'text-zinc-500 hover:text-zinc-300'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                        
                        {/* Refresh Button */}
                        <button
                          onClick={() => { playClickSound(); fetchBets(); }}
                          className={`p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition ${loadingUserBets ? 'animate-spin' : ''}`}
                          title="Refresh Bets History"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Table Render */}
                    {loadingUserBets ? (
                      <div className="space-y-3 py-8">
                        <div className="h-6 bg-zinc-900/50 rounded-lg animate-pulse w-full"></div>
                        <div className="h-10 bg-zinc-900/50 rounded-lg animate-pulse w-full"></div>
                        <div className="h-10 bg-zinc-900/50 rounded-lg animate-pulse w-full"></div>
                        <div className="h-10 bg-zinc-900/50 rounded-lg animate-pulse w-full"></div>
                      </div>
                    ) : (() => {
                      // Filter on Client Side
                      const filteredBets = userBets.filter((bet) => {
                        // Status check
                        if (myBetsStatusFilter !== 'all' && bet.status !== myBetsStatusFilter) {
                          return false;
                        }
                        // Search query on Period
                        if (myBetsSearch.trim()) {
                          const query = myBetsSearch.toLowerCase().trim();
                          if (!bet.periodNumber?.toLowerCase().includes(query)) {
                            return false;
                          }
                        }
                        return true;
                      });

                      if (filteredBets.length === 0) {
                        return (
                          <div className="text-center text-zinc-500 py-12 text-xs font-semibold flex flex-col items-center justify-center gap-2">
                            <Coins className="w-8 h-8 text-zinc-700 animate-bounce" />
                            <span>No matching historical bets found in your logging history.</span>
                          </div>
                        );
                      }

                      return (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
                                <th className="pb-3.5 font-bold">Bet/Transaction ID</th>
                                <th className="pb-3.5 font-bold">Period No</th>
                                <th className="pb-3.5 font-bold">Prediction Type</th>
                                <th className="pb-3.5 font-bold">Predicted Value</th>
                                <th className="pb-3.5 font-bold text-right">Deducted Wager</th>
                                <th className="pb-3.5 font-bold text-center">Outcome Status</th>
                                <th className="pb-3.5 font-bold text-right">Winning Payout</th>
                                <th className="pb-3.5 font-bold">Timestamp</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredBets.map((bet) => (
                                <tr key={bet.id} className="border-b border-zinc-850 hover:bg-zinc-900/40 transition">
                                  <td className="py-3.5 font-mono font-bold text-zinc-400">{bet.id}</td>
                                  <td className="py-3.5 font-mono font-bold text-white">{bet.periodNumber}</td>
                                  <td className="py-3.5">
                                    <span className="px-2 py-0.5 rounded-md font-bold uppercase tracking-wider text-[9px] bg-zinc-950 text-zinc-400 border border-zinc-800">
                                      {bet.betType}
                                    </span>
                                  </td>
                                  <td className="py-3.5 font-semibold">
                                    {bet.betType === 'color' ? (
                                      <div className="flex items-center gap-1.5">
                                        <span className={`w-2.5 h-2.5 rounded-full ${
                                          bet.betValue === 'green' ? 'bg-emerald-500 shadow-emerald-500/20' :
                                          bet.betValue === 'red' ? 'bg-rose-500 shadow-rose-500/20' : 'bg-purple-500 shadow-purple-500/20'
                                        } shadow-sm`}></span>
                                        <span className="capitalize text-zinc-200">{bet.betValue}</span>
                                      </div>
                                    ) : (
                                      <span className="font-bold text-amber-400 font-mono text-sm bg-amber-400/5 border border-amber-400/20 px-2 py-0.5 rounded">
                                        {bet.betValue}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3.5 text-right font-mono font-semibold text-zinc-300">₹{Number(bet.amount).toFixed(2)}</td>
                                  <td className="py-3.5 text-center">
                                    {bet.status === 'pending' ? (
                                      <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Pending</span>
                                    ) : bet.status === 'won' ? (
                                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Won</span>
                                    ) : (
                                      <span className="text-[10px] text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Lost</span>
                                    )}
                                  </td>
                                  <td className={`py-3.5 text-right font-mono font-extrabold ${bet.status === 'won' ? 'text-emerald-400' : bet.status === 'lost' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                    {bet.status === 'won' ? `+₹${Number(bet.winningAmount).toFixed(2)}` : bet.status === 'lost' ? `-₹${Number(bet.amount).toFixed(2)}` : '--'}
                                  </td>
                                  <td className="py-3.5 text-zinc-500 text-[10px] font-mono">
                                    {new Date(bet.createdAt).toLocaleDateString()} {new Date(bet.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* ========================================================
                  TAB 5: PROFILE SETTINGS & NOTIFICATIONS FEED
                 ======================================================== */}
              {activeTab === 'profile' && (
                <div className="max-w-2xl mx-auto flex flex-col gap-6" id="panel_profile">
                  
                  {/* user profile meta detail card */}
                  <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl"></div>
                    
                    <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-md">
                      <UserIcon className="w-8 h-8" />
                    </div>

                    <div className="grow text-center sm:text-left">
                      <h3 className="text-lg font-black text-white tracking-tight">{user?.username || 'VeloWager User'}</h3>
                      {user?.email && <p className="text-xs text-zinc-500 mt-1">{user.email}</p>}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1.5 text-xs text-zinc-400">
                        <span className="font-mono bg-zinc-800/85 border border-zinc-750 px-2 py-0.5 rounded text-[10px]">
                          ID: {user?.id}
                        </span>
                        <span className="font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] uppercase">
                          {user?.status} account
                        </span>
                        {isUserAdmin && (
                          <span className="font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] uppercase">
                            Administrator
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 font-mono mt-2">Member since: {new Date(user?.createdAt).toLocaleDateString()}</p>
                    </div>

                    <button 
                      onClick={handleLogout}
                      className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold px-4 py-2 rounded-xl text-xs border border-rose-500/20 transition self-center shrink-0"
                    >
                      Logout Session
                    </button>
                  </div>

                  {/* VIP LEVEL & PROGRESS TRACKER */}
                  {wallet && (
                    (() => {
                      const vip = getVipLevel(wallet.completedWagering ?? 0);
                      return (
                        <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                          {/* Ambient glow */}
                          <div className={`absolute top-0 right-0 w-40 h-40 ${vip.level === 'Gold' ? 'bg-amber-500/5' : vip.level === 'Silver' ? 'bg-zinc-400/5' : 'bg-orange-500/5'} rounded-full blur-3xl`}></div>
                          
                          <div className="flex items-center gap-2.5 mb-6">
                            <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-rose-500">
                              <Award className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider">VIP Loyalty Club Status</h3>
                              <p className="text-[10px] text-zinc-500">Earn tier level progression automatically by playing any games on the platform</p>
                            </div>
                          </div>

                          <div className={`rounded-xl p-4 sm:p-5 border ${vip.borderColor} ${vip.bannerBg} flex flex-col sm:flex-row items-center gap-5 justify-between`}>
                            <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
                              <div className="w-16 h-16 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center text-3xl shadow-inner animate-pulse">
                                {vip.icon}
                              </div>
                              <div>
                                <div className="text-xs font-black uppercase text-zinc-400 tracking-widest">Current VIP Tier</div>
                                <h4 className={`text-xl font-black bg-gradient-to-r ${vip.textGradient} bg-clip-text text-transparent flex items-center justify-center sm:justify-start gap-1.5`}>
                                  {vip.level} Class
                                </h4>
                                <p className="text-[10px] text-zinc-400 mt-0.5">Total Wage Volume: <span className="font-mono text-emerald-400 font-bold">₹{(wallet.completedWagering ?? 0).toFixed(2)}</span></p>
                              </div>
                            </div>

                            <div className="text-center sm:text-right">
                              {vip.nextLevel ? (
                                <>
                                  <div className="text-[10px] font-bold uppercase text-zinc-500">Next VIP Level</div>
                                  <div className="text-sm font-black text-white flex items-center justify-center sm:justify-end gap-1 mt-0.5">
                                    <span>{vip.nextLevel === 'Gold' ? '🏆' : '🥈'}</span>
                                    <span>{vip.nextLevel}</span>
                                  </div>
                                  <div className="text-[10px] text-zinc-400 mt-1">
                                    Need <span className="font-mono font-bold text-rose-400">₹{(vip.nextThreshold! - (wallet.completedWagering ?? 0)).toFixed(2)}</span> more play volume
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="text-[10px] font-bold uppercase text-amber-500 flex items-center gap-1 justify-center sm:justify-end">
                                    <span>🔥 Elite Gold VIP</span>
                                  </div>
                                  <div className="text-xs font-black text-white mt-1">Maximum Rank Reached</div>
                                  <p className="text-[9px] text-zinc-500 mt-1">You are enjoying maximum platform commission rates</p>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Progress Visualizer bar */}
                          <div className="mt-6 space-y-2">
                            <div className="flex justify-between text-[10px] text-zinc-500 font-bold uppercase">
                              <span>Tier Progress</span>
                              <span>{vip.progress.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-zinc-950 rounded-full h-3 p-0.5 border border-zinc-900 overflow-hidden">
                              <div 
                                className={`h-full rounded-full bg-gradient-to-r ${vip.level === 'Gold' ? 'from-amber-500 via-yellow-400 to-amber-600' : vip.level === 'Silver' ? 'from-zinc-400 via-slate-300 to-zinc-500' : 'from-orange-500 via-amber-400 to-orange-600'} transition-all duration-1000 shadow-[0_0_8px_rgba(244,63,94,0.1)]`}
                                style={{ width: `${vip.progress}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                              <span>₹{vip.threshold.toLocaleString()} Waged</span>
                              <span>{vip.nextThreshold ? `₹${vip.nextThreshold.toLocaleString()} Target` : 'Completed 🎖️'}</span>
                            </div>
                          </div>

                          {/* Stake.com VIP CLAIM CARD */}
                          {(() => {
                            const wager = wallet.completedWagering ?? 0;
                            let baseReward = 15;
                            let percentage = 0.001; // 0.1% Rakeback
                            let levelName = 'Bronze';

                            if (wager >= 50000) {
                              baseReward = 500;
                              percentage = 0.003; // 0.3% Rakeback
                              levelName = 'Gold';
                            } else if (wager >= 10000) {
                              baseReward = 100;
                              percentage = 0.002; // 0.2% Rakeback
                              levelName = 'Silver';
                            }
                            const rakebackAmt = wager * percentage;
                            const totalAmt = baseReward + rakebackAmt;

                            const vipClaims = transactions.filter(tx => tx.remark && tx.remark.includes('[VIP Claim]'));
                            const lastVipClaim = vipClaims.length > 0 ? vipClaims[0] : null;

                            // Calculate remaining hours
                            let isClaimAvailable = true;
                            let countdownStr = '';
                            if (lastVipClaim) {
                              const elapsedMs = Date.now() - new Date(lastVipClaim.createdAt).getTime();
                              const hoursLeft = 24 - (elapsedMs / (1000 * 60 * 60));
                              if (hoursLeft > 0) {
                                isClaimAvailable = false;
                                const hrs = Math.floor(hoursLeft);
                                const mins = Math.floor((hoursLeft % 1) * 60);
                                const secs = Math.floor(((hoursLeft * 60) % 1) * 60);
                                countdownStr = `${hrs}h ${mins}m ${secs}s`;
                              }
                            }

                            return (
                              <div className="mt-6 border-t border-zinc-900 pt-5">
                                <div className="bg-zinc-950/60 border border-zinc-900 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                                  <div className="text-center md:text-left grow">
                                    <div className="text-xs font-black uppercase text-amber-500 tracking-wider flex items-center justify-center md:justify-start gap-1">
                                      <span>💎</span>
                                      <span>VeloWager Daily Reload & Rakeback</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 mt-1 max-w-sm">
                                      Claim your daily VIP loyalty reload based on your VIP class and dynamic rolling wager volume.
                                    </p>
                                    <div className="flex gap-4 mt-2.5 justify-center md:justify-start">
                                      <div>
                                        <span className="text-[9px] text-zinc-500 block uppercase font-bold">Base Reload</span>
                                        <span className="text-xs font-black text-white font-mono">₹{baseReward.toFixed(0)}</span>
                                      </div>
                                      <div className="border-l border-zinc-800 pl-4">
                                        <span className="text-[9px] text-zinc-500 block uppercase font-bold">Dynamic Rakeback</span>
                                        <span className="text-xs font-black text-emerald-400 font-mono">₹{rakebackAmt.toFixed(2)}</span>
                                      </div>
                                      <div className="border-l border-zinc-800 pl-4">
                                        <span className="text-[9px] text-zinc-500 block uppercase font-bold">Total Claimable</span>
                                        <span className="text-xs font-black text-rose-400 font-mono">
                                          ₹{totalAmt.toFixed(2)}
                                          {vipClaimCurrency !== 'INR' && (
                                            <span className="text-[10px] text-zinc-400 font-normal block mt-0.5">
                                              ≈ {(totalAmt / (CRYPTO_RATES[vipClaimCurrency as keyof typeof CRYPTO_RATES] || 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {vipClaimCurrency}
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="w-full md:w-auto shrink-0 flex flex-col items-center gap-2">
                                    <div className="flex flex-col gap-1 w-full md:w-auto">
                                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Claim Currency</label>
                                      <select
                                        value={vipClaimCurrency}
                                        onChange={(e) => setVipClaimCurrency(e.target.value as any)}
                                        className="bg-zinc-900 border border-zinc-850 text-zinc-300 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:border-zinc-700 w-full min-w-[120px]"
                                      >
                                        <option value="INR">INR (₹)</option>
                                        <option value="USDT">USDT</option>
                                        <option value="BTC">BTC</option>
                                        <option value="ETH">ETH</option>
                                        <option value="TRX">TRX</option>
                                      </select>
                                    </div>

                                    {vipClaimSuccess && (
                                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg text-center w-full">
                                        ✓ {vipClaimSuccess}
                                      </span>
                                    )}
                                    {vipClaimError && (
                                      <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-lg text-center w-full max-w-[200px]">
                                        ⚠️ {vipClaimError}
                                      </span>
                                    )}

                                    {isClaimAvailable ? (
                                      <button
                                        disabled={claimingVipReward}
                                        onClick={() => { playClickSound(); handleClaimVipReward(); }}
                                        className={`w-full md:w-auto px-5 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer ${
                                          claimingVipReward 
                                            ? 'bg-zinc-850 text-zinc-600 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 animate-pulse'
                                        }`}
                                      >
                                        {claimingVipReward ? 'Claiming...' : 'Claim VIP Reload'}
                                      </button>
                                    ) : (
                                      <button
                                        disabled
                                        className="w-full md:w-auto px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider bg-zinc-900 border border-zinc-850 text-zinc-500 cursor-not-allowed flex flex-col items-center gap-0.5 min-w-[140px]"
                                      >
                                        <span className="font-bold">Claim Locked</span>
                                        <span className="font-mono text-[8px] font-normal lowercase text-zinc-600">Reset in: {countdownStr}</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Perks of Current Tier */}
                          <div className="mt-6 border-t border-zinc-900 pt-5">
                            <span className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-3">Active Tier Benefits & Perks:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {vip.perks.map((p, i) => (
                                <div key={i} className="flex items-start gap-2 bg-zinc-950/40 border border-zinc-900/60 rounded-xl p-2.5 text-zinc-300">
                                  <span className="text-emerald-500 font-bold shrink-0">✓</span>
                                  <span>{p}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  )}

                  {/* Future games portfolio preview */}
                  <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider mb-2 flex items-center gap-2">
                      <Gamepad2 className="w-4.5 h-4.5 text-rose-500" />
                      <span>Future Platform Gaming Pipeline</span>
                    </h3>
                    <p className="text-xs text-zinc-500 mb-4">The modular repository-service design supports plug-and-play game scaling. Preview slated modules:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center font-bold font-mono">
                      {['Crash', 'Tower', 'Dice', 'Mines', 'Aviator', 'Slots', 'Lottery', 'Sports Book'].map((g, idx) => (
                        <div key={idx} className="bg-zinc-900 border border-zinc-850 p-3 rounded-xl text-zinc-500 hover:text-zinc-400 transition cursor-not-allowed">
                          <div>{g}</div>
                          <span className="text-[8px] uppercase tracking-wider text-rose-400/80 bg-rose-500/5 px-1 py-0.5 rounded block mt-1.5 font-sans">Coming Soon</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 🎁 PROMOTIONAL OFFERS & COUPONS */}
                  <div className="bg-[#12161b] border border-zinc-800 rounded-2xl p-6 shadow-xl" id="panel_promotional_offers">
                    <h3 className="text-sm font-black uppercase text-zinc-300 tracking-wider mb-2 flex items-center gap-2">
                      <Gift className="w-4.5 h-4.5 text-rose-500" />
                      <span>Promotional Offers & Rewards</span>
                    </h3>
                    <p className="text-xs text-zinc-500 mb-6">Boost your balance and activate special bonuses by redeeming referral connections and promotional codes.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Block: Welcome Offer */}
                      <div className="bg-zinc-900/60 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-black uppercase text-zinc-300 tracking-wider flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-rose-400" />
                              <span>Welcome Offer</span>
                            </h4>
                            {user?.referredByCode ? (
                              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 uppercase">
                                Active
                              </span>
                            ) : isWelcomeExpired ? (
                              <span className="text-[10px] font-black text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded uppercase">
                                Expired
                              </span>
                            ) : (
                              <span className="text-[10px] font-black text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 animate-pulse uppercase">
                                Live
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                            If you were referred by another member but haven't linked them yet, enter their code here within 24 hours of registration!
                          </p>

                          {user?.referredByCode ? (
                            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3.5 text-xs text-emerald-400 font-bold flex items-center gap-2.5">
                              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>Referred by: {user.referredByCode}</span>
                            </div>
                          ) : isWelcomeExpired ? (
                            <div className="bg-zinc-950/40 border border-zinc-900 rounded-xl p-3.5 text-xs text-zinc-500 font-semibold flex items-start gap-2">
                              <X className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />
                              <span>The 24-hour Welcome Offer window has expired. You can no longer link a referrer.</span>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-3 flex justify-between items-center text-xs">
                                <span className="text-zinc-400 font-medium">Time remaining:</span>
                                <span className="text-amber-400 font-bold font-mono tracking-wide bg-amber-500/10 px-2.5 py-1 rounded">
                                  {welcomeTimeRemaining || '24h 00m 00s'}
                                </span>
                              </div>

                              <form onSubmit={handleApplyWelcomeReferral} className="space-y-2.5">
                                <input
                                  type="text"
                                  value={welcomeReferralInput}
                                  onChange={(e) => setWelcomeReferralInput(e.target.value.toUpperCase())}
                                  placeholder="ENTER REFERRAL CODE (e.g., ADMINREF)"
                                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-600 uppercase font-mono focus:outline-none transition"
                                  disabled={applyingWelcome}
                                />
                                {welcomeOfferError && (
                                  <p className="text-[11px] text-rose-400 font-bold">{welcomeOfferError}</p>
                                )}
                                {welcomeOfferSuccess && (
                                  <p className="text-[11px] text-emerald-400 font-bold">{welcomeOfferSuccess}</p>
                                )}
                                <button
                                  type="submit"
                                  disabled={applyingWelcome || !welcomeReferralInput.trim()}
                                  className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white rounded-lg py-2 font-black transition text-xs tracking-wider"
                                >
                                  {applyingWelcome ? 'Applying Code...' : 'Claim Welcome Offer'}
                                </button>
                              </form>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Block: Coupon Code */}
                      <div className="bg-zinc-900/60 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-black uppercase text-zinc-300 tracking-wider flex items-center gap-2">
                              <Ticket className="w-4 h-4 text-rose-400" />
                              <span>Promo Coupons</span>
                            </h4>
                            <span className="text-[10px] font-black text-rose-400 bg-rose-500/5 px-2 py-0.5 rounded border border-rose-500/10 uppercase">
                              Active
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                            Have an admin-provided voucher coupon code? Redeem it below to instantly credit your wallet balance and start trading!
                          </p>

                          <div className="space-y-4">
                            <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-3 text-xs text-zinc-400">
                              <span className="font-bold text-rose-300 block mb-1">Voucher Redemption:</span>
                              <p className="text-[11px] font-semibold text-zinc-500 leading-relaxed">
                                Enter your official voucher code below. The coupon's specific monetary value will be dynamically credited to your main wallet balance.
                              </p>
                            </div>

                            <form onSubmit={handleApplyCoupon} className="space-y-3">
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Coupon Code</label>
                                <input
                                  type="text"
                                  value={couponCodeInput}
                                  onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                                  placeholder="ENTER COUPON CODE"
                                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3 text-xs text-white placeholder-zinc-600 uppercase font-mono focus:outline-none transition"
                                  disabled={applyingCoupon}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Redeem in Currency</label>
                                <select
                                  value={couponCurrencyInput}
                                  onChange={(e) => setCouponCurrencyInput(e.target.value as any)}
                                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2 px-3 text-xs text-zinc-300 outline-none focus:outline-none transition"
                                  disabled={applyingCoupon}
                                >
                                  <option value="INR">INR (₹)</option>
                                  <option value="USDT">USDT</option>
                                  <option value="BTC">BTC</option>
                                  <option value="ETH">ETH</option>
                                  <option value="TRX">TRX</option>
                                </select>
                              </div>
                              {couponError && (
                                <p className="text-[11px] text-rose-400 font-bold">{couponError}</p>
                              )}
                              {couponSuccess && (
                                <p className="text-[11px] text-emerald-400 font-bold">{couponSuccess}</p>
                              )}
                              <button
                                type="submit"
                                disabled={applyingCoupon || !couponCodeInput.trim()}
                                className="w-full bg-rose-500 hover:bg-rose-600 disabled:opacity-40 text-white rounded-lg py-2 font-black transition text-xs tracking-wider"
                              >
                                {applyingCoupon ? 'Redeeming Coupon...' : 'Redeem Coupon'}
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>

      {/* FOOTER METADATA INFO */}
      <footer className="bg-[#0b0c0e] border-t border-zinc-900 py-5 mt-8 text-[10px] text-zinc-600" id="bottom_footer">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p>© {new Date().getFullYear()} VeloWager. All rights reserved.</p>
          <div className="flex items-center gap-3"><span>18+ · Play responsibly</span>{platformConfig?.telegramUrl && <a href={platformConfig.telegramUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300">Telegram Support</a>}</div>
        </div>
      </footer>

      {/* LOYALTY VIP CLUB DETAILS MODAL */}
      <AnimatePresence>
        {isVipModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#12161b] border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-zinc-800 bg-[#161b22] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl text-rose-400">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wider text-white">VIP Loyalty Club Details</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Earn status automatically by wagering</p>
                  </div>
                </div>
                <button
                  onClick={() => { playClickSound(); setIsVipModalOpen(false); }}
                  className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
                {wallet && (
                  (() => {
                    const currentVip = getVipLevel(wallet.completedWagering ?? 0);
                    return (
                      <div className="space-y-6">
                        {/* Current Tier Summary Card */}
                        <div className={`p-5 rounded-2xl border ${currentVip.borderColor} ${currentVip.bannerBg} relative overflow-hidden`}>
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-3xl shadow-inner shrink-0">
                              {currentVip.icon}
                            </div>
                            <div className="grow">
                              <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Your Active Class</span>
                              <h4 className={`text-lg font-black bg-gradient-to-r ${currentVip.textGradient} bg-clip-text text-transparent`}>
                                {currentVip.level} Tier
                              </h4>
                              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Wagered Volume: ₹{(wallet.completedWagering ?? 0).toFixed(2)}</p>
                            </div>
                          </div>

                          {/* Progress bar to next level */}
                          {currentVip.nextLevel && (
                            <div className="mt-4 pt-4 border-t border-zinc-800/40">
                              <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1.5 font-bold">
                                <span>PROGRESS TO {currentVip.nextLevel.toUpperCase()}</span>
                                <span className="font-mono text-rose-400">{currentVip.progress.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-900">
                                <div 
                                  className="bg-gradient-to-r from-rose-500 to-amber-500 h-full rounded-full transition-all duration-500" 
                                  style={{ width: `${currentVip.progress}%` }}
                                />
                              </div>
                              <p className="text-[9px] text-zinc-500 mt-1.5 text-right">
                                Need <span className="font-mono font-bold text-rose-300">₹{(currentVip.nextThreshold! - (wallet.completedWagering ?? 0)).toFixed(2)}</span> more to unlock {currentVip.nextLevel}!
                              </p>
                            </div>
                          )}
                        </div>

                        {/* VIP Perks list */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block">Active VIP Perks ({currentVip.level})</span>
                          <div className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-4 space-y-3">
                            {currentVip.perks.map((perk, idx) => (
                              <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <p className="leading-relaxed">{perk}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* VIP Levels Grid overview */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block">Loyalty Tiers Grid</span>
                          <div className="grid grid-cols-3 gap-2.5">
                            {[
                              { name: 'Bronze', threshold: '₹0', icon: '🥉', color: 'border-orange-500/20' },
                              { name: 'Silver', threshold: '₹10,000', icon: '🥈', color: 'border-zinc-300/20' },
                              { name: 'Gold', threshold: '₹50,000', icon: '🏆', color: 'border-amber-500/20' }
                            ].map((t) => {
                              const isThisTier = currentVip.level === t.name;
                              return (
                                <div 
                                  key={t.name}
                                  className={`p-3 rounded-xl border text-center relative ${
                                    isThisTier 
                                      ? 'bg-rose-500/10 border-rose-500/30' 
                                      : 'bg-zinc-900/40 border-zinc-850'
                                  }`}
                                >
                                  {isThisTier && (
                                    <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider scale-90">
                                      Current
                                    </span>
                                  )}
                                  <span className="text-xl block mt-1">{t.icon}</span>
                                  <span className="text-[11px] font-black block mt-1 text-white">{t.name}</span>
                                  <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">{t.threshold} wager</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-[#161b22] border-t border-zinc-800 text-center text-[9px] text-zinc-500 font-mono">
                Volume is updated instantly after every play. Perks are applied automatically.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WAGERING LOCK POPUP MODAL */}
      {showWagerAlertPopup && wallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#12161b] border border-amber-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header / Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500" />
            
            <button 
              onClick={() => { playClickSound(); setShowWagerAlertPopup(false); }}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 animate-bounce">
                <AlertTriangle className="w-6 h-6" />
              </div>
              
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Wagering Requirement Pending</h3>
              <p className="text-xs text-zinc-400 mt-2 max-w-sm">
                To comply with the platform's anti-abuse and payout rules, you must wager your deposited funds before requesting a withdrawal payout.
              </p>

              {/* Progress visualizer */}
              <div className="w-full bg-zinc-950 border border-zinc-900 rounded-xl p-4 my-5 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500 font-bold uppercase">Required Wagering</span>
                  <span className="text-white font-mono font-bold">₹{(wallet.requiredWagering ?? 0).toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500 font-bold uppercase">Completed Wagering</span>
                  <span className="text-emerald-400 font-mono font-bold">₹{(wallet.completedWagering ?? 0).toFixed(2)}</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
                  <div 
                    className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(100, ((wallet.completedWagering ?? 0) / Math.max(1, (wallet.requiredWagering ?? 1))) * 100)}%` 
                    }}
                  />
                </div>

                <div className="border-t border-zinc-900 pt-2.5 flex justify-between text-xs">
                  <span className="text-zinc-400 font-black uppercase">Remaining Wager</span>
                  <span className="text-rose-400 font-mono font-black text-sm">
                    ₹{Math.max(0, (wallet.requiredWagering ?? 0) - (wallet.completedWagering ?? 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-2 mt-2">
                <button
                  onClick={() => {
                    playClickSound();
                    setShowWagerAlertPopup(false);
                    setActiveTab('game');
                  }}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black rounded-xl py-3 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-1.5 font-sans"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  Go Wager in WinGo Game
                </button>

                <button
                  onClick={() => { playClickSound(); setShowWagerAlertPopup(false); }}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl py-2.5 font-bold text-xs transition border border-zinc-800"
                >
                  Close & Keep Playing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAKE.COM PREMIUM UNIFIED WALLET MODAL */}
      {isWalletModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm"
          onClick={() => { playClickSound(); setIsWalletModalOpen(false); }}
        >
          <motion.div
            initial={{ x: "100%", opacity: 0.9 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.9 }}
            transition={{ type: "spring", damping: 26, stiffness: 210 }}
            className="w-full max-w-md sm:max-w-[480px] h-full bg-[#12161b] border-l border-zinc-800 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-800/80 bg-[#161b22] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-emerald-400">
                  <Wallet className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider text-white">VeloWager Pro Premium Wallet</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Secure UPI & Crypto Banking</p>
                </div>
              </div>
              <button
                onClick={() => { playClickSound(); setIsWalletModalOpen(false); }}
                className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="grid grid-cols-3 bg-[#0d0f12] p-1 border-b border-zinc-850">
              {[
                { id: 'deposit', name: '📥 DEPOSIT funds' },
                { id: 'withdraw', name: '📤 WITHDRAW payout' },
                { id: 'transactions', name: '📜 LEDGER LOGS' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => { playClickSound(); setWalletModalTab(tab.id as any); }}
                  className={`py-3 text-[10px] font-black uppercase tracking-wider text-center transition-all ${
                    walletModalTab === tab.id
                      ? 'bg-[#12161b] text-emerald-400 border-b-2 border-emerald-500'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin scrollbar-thumb-zinc-800">
              
              {/* Wallet Active Balance Card */}
              <div className="bg-zinc-950/80 border border-zinc-900 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase text-zinc-500 block leading-none tracking-widest">Active Wallet Balance</span>
                  <span className="text-xl font-black text-white font-mono block mt-2">
                    {activeCurrency === 'INR' ? `₹${wallet ? (wallet.balance + wallet.promoBalance).toFixed(2) : '0.00'}` : `${wallet ? ((wallet.balance + wallet.promoBalance) / CRYPTO_RATES[activeCurrency]).toLocaleString(undefined, { 
                      minimumFractionDigits: activeCurrency === 'TRX' ? 2 : 4, 
                      maximumFractionDigits: activeCurrency === 'BTC' ? 8 : activeCurrency === 'ETH' ? 6 : 4 
                    }) : '0.0000'} ${activeCurrency}`}
                  </span>
                  {activeCurrency !== 'INR' && (
                    <span className="text-[9px] text-zinc-500 font-mono block mt-1">
                      ≈ ₹{wallet ? (wallet.balance + wallet.promoBalance).toFixed(2) : '0.00'}
                    </span>
                  )}
                </div>
                <div className="bg-[#2f4553]/20 border border-[#2f4553]/30 text-zinc-300 text-[10px] px-2.5 py-1.5 rounded-xl font-black uppercase tracking-wider font-sans">
                  {activeCurrency} Wallet
                </div>
              </div>

              {/* Status Action Banner inside modal */}
              {walletActionMessage && (
                <div className={`p-4 rounded-xl border text-xs flex items-start gap-2.5 ${walletActionMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                  {walletActionMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                  <span>{walletActionMessage.text}</span>
                </div>
              )}

              {/* TAB CONTENT: DEPOSIT */}
              {walletModalTab === 'deposit' && (
                <div className="space-y-4">
                  {/* Deposit Mode Selector */}
                  <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-900">
                    <button
                      type="button"
                      onClick={() => { playClickSound(); setDepositMode('gateway'); }}
                      className={`py-2 px-1 text-[9px] font-extrabold uppercase tracking-wider rounded-lg text-center transition flex items-center justify-center gap-1 ${
                        depositMode === 'gateway'
                          ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-black'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gateway</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { playClickSound(); setDepositMode('manual'); }}
                      className={`py-2 px-1 text-[9px] font-extrabold uppercase tracking-wider rounded-lg text-center transition flex items-center justify-center gap-1 ${
                        depositMode === 'manual'
                          ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-black'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Manual</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { playClickSound(); setDepositMode('crypto'); }}
                      className={`py-2 px-1 text-[9px] font-extrabold uppercase tracking-wider rounded-lg text-center transition flex items-center justify-center gap-1 ${
                        depositMode === 'crypto'
                          ? 'bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 font-black'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <span className="text-xs">🪙</span>
                      <span>Crypto</span>
                    </button>
                  </div>

                  {depositMode === 'gateway' && (
                    <form onSubmit={handleGatewayDepositSubmit} className="space-y-4">
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        Secured instant gateway deposit. Balance will be auto-credited to your account instantly on successful payment via our callback webhooks.
                      </p>

                      {platformConfig?.paymentGateways && platformConfig.paymentGateways.length > 0 && (
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Select Payment Gateway</label>
                          <select
                            value={selectedDepositGateway || (platformConfig.paymentGateways.find((g: any) => g.isDefault)?.id || platformConfig.paymentGateways[0]?.id)}
                            onChange={(e) => setSelectedDepositGateway(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2 px-3 text-xs text-white focus:outline-none"
                          >
                            {platformConfig.paymentGateways.map((g: any) => (
                              <option key={g.id} value={g.id}>
                                {g.name} {g.description ? `— ${g.description}` : ''} (₹{g.minAmount}+)
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Deposit Amount (₹)</label>
                        <input 
                          type="number" 
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder={`Min: ₹${platformConfig?.minDeposit || 100}`}
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none font-mono"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-[#10b981] hover:bg-emerald-600 text-zinc-950 rounded-lg py-3 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>PROCEED TO INSTANT SECURE PAY</span>
                      </button>
                    </form>
                  )}

                  {depositMode === 'manual' && (
                    <form onSubmit={handleDepositSubmit} className="space-y-4">
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        Traditional bank/UPI transfer. Your deposit slip reference is sent to administrators for manual authentication and validation.
                      </p>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Deposit Amount (₹)</label>
                        <input 
                          type="number" 
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder={`Min: ₹${platformConfig?.minDeposit || 100}`}
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Receipt Reference Remark</label>
                        <input 
                          type="text" 
                          value={depositRemark}
                          onChange={(e) => setDepositRemark(e.target.value)}
                          placeholder="e.g. UPI Ref ID: 6290123545"
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none"
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 hover:border-zinc-600 rounded-lg py-3 font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
                      >
                        <Coins className="w-4 h-4" />
                        <span>REQUEST MANUAL DEPOSIT</span>
                      </button>
                    </form>
                  )}

                  {depositMode === 'crypto' && (
                    <form onSubmit={handleCryptoDepositSubmit} className="space-y-4">
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        VeloWager Pro premium cryptocurrency gateway. Funds are deposited securely and automatically converted to local currency at live rates.
                      </p>

                      {/* Currency selection */}
                      <div className="grid grid-cols-4 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-900">
                        {(['USDT', 'BTC', 'ETH', 'TRX'] as const).map((curr) => (
                          <button
                            key={curr}
                            type="button"
                            onClick={() => { playClickSound(); setCryptoCurrency(curr); }}
                            className={`py-1.5 px-1 text-[10px] font-black tracking-wide rounded-lg text-center transition ${
                              cryptoCurrency === curr
                                ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {curr}
                          </button>
                        ))}
                      </div>

                      {/* Crypto Address Banner */}
                      <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase text-zinc-500">
                          <span>Our Destination {cryptoCurrency} Wallet</span>
                          <span className="text-[9px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md font-mono">
                            {cryptoCurrency === 'USDT' ? 'TRC20 Network' : cryptoCurrency === 'ETH' ? 'ERC20 Network' : 'Native Chain'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={CRYPTO_ADDRESSES[cryptoCurrency]}
                            className="w-full bg-zinc-900 border border-zinc-850/80 rounded-lg py-2 px-3 text-[10px] font-mono text-zinc-300 focus:outline-none select-all"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              playClickSound();
                              navigator.clipboard.writeText(CRYPTO_ADDRESSES[cryptoCurrency]);
                              setCopiedAddress(cryptoCurrency);
                              showToast(
                                `${cryptoCurrency} Address Copied`,
                                `Vibrant ${cryptoCurrency} deposit address successfully duplicated to clipboard! Ready to fund wallet.`,
                                'success'
                              );
                              setTimeout(() => setCopiedAddress(null), 2000);
                            }}
                            className="relative overflow-hidden bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white p-2.5 rounded-lg border border-zinc-850 transition-all duration-300 active:scale-95 flex items-center justify-center min-w-[36px] h-[36px]"
                            title="Copy Wallet Address"
                          >
                            <AnimatePresence mode="wait">
                              {copiedAddress === cryptoCurrency ? (
                                <motion.span
                                  key="check"
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.5, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="flex items-center text-emerald-400"
                                >
                                  <Check className="w-4 h-4" />
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="copy"
                                  initial={{ scale: 0.5, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0.5, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="flex items-center"
                                >
                                  <Copy className="w-4 h-4" />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </button>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-semibold text-zinc-400">
                          <span>Exchange rate:</span>
                          <span className="font-mono text-rose-400 font-bold">1 {cryptoCurrency} ≈ ₹{CRYPTO_RATES[cryptoCurrency].toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Amount Crypto */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-zinc-400">Deposit Quantity ({cryptoCurrency})</label>
                          {cryptoDepositAmount && (
                            <span className="text-[10px] font-black text-emerald-400 font-mono">
                              ≈ ₹{(Number(cryptoDepositAmount) * CRYPTO_RATES[cryptoCurrency]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                        <input 
                          type="number" 
                          step="any"
                          value={cryptoDepositAmount}
                          onChange={(e) => setCryptoDepositAmount(e.target.value)}
                          placeholder={`Amount of ${cryptoCurrency} to send...`}
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none font-mono"
                        />
                      </div>

                      {/* Tx Hash */}
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 mb-1">Blockchain Transaction ID / Hash</label>
                        <input 
                          type="text" 
                          value={cryptoTxHash}
                          onChange={(e) => setCryptoTxHash(e.target.value)}
                          placeholder="Paste 64-character transaction TxHash or unique TxID"
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none font-mono"
                        />
                      </div>

                      {/* Simulation Switch */}
                      <div className="bg-rose-500/[0.02] border border-rose-500/10 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-zinc-300 block">⚡ Sim Blockchain Confirmation</span>
                          <span className="text-[9px] text-zinc-500 block">Instantly process node approvals without admin reviews</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { playClickSound(); setCryptoAutoApprove(!cryptoAutoApprove); }}
                          className={`w-10 h-6 flex items-center rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                            cryptoAutoApprove ? 'bg-emerald-500' : 'bg-zinc-800'
                          }`}
                        >
                          <div
                            className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                              cryptoAutoApprove ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <button 
                        type="submit"
                        disabled={isSubmittingCrypto}
                        className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/50 text-white rounded-lg py-3 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-rose-500/10 flex items-center justify-center gap-2"
                      >
                        <span>🪙</span>
                        <span>{isSubmittingCrypto ? 'PROCESSING BLOCKCHAIN TRANSACTIONS...' : 'SUBMIT CRYPTO DEPOSIT'}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB CONTENT: WITHDRAW */}
              {walletModalTab === 'withdraw' && (
                <div className="space-y-4">
                  {/* Withdraw Mode Selector */}
                  <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-900">
                    <button
                      type="button"
                      onClick={() => { playClickSound(); setWithdrawMode('bank'); }}
                      className={`py-2 px-3 text-[10px] font-extrabold uppercase tracking-wider rounded-lg text-center transition flex items-center justify-center gap-1.5 ${
                        withdrawMode === 'bank'
                          ? 'bg-rose-500/15 border border-rose-500/25 text-rose-400 font-black'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>Bank Account</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { playClickSound(); setWithdrawMode('crypto'); }}
                      className={`py-2 px-3 text-[10px] font-extrabold uppercase tracking-wider rounded-lg text-center transition flex items-center justify-center gap-1.5 ${
                        withdrawMode === 'crypto'
                          ? 'bg-rose-500/15 border border-rose-500/25 text-rose-400 font-black'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <span>🪙</span>
                      <span>Crypto Payout</span>
                    </button>
                  </div>

                  {withdrawMode === 'bank' ? (
                    // BANK ACCOUNT PAYOUT MODE
                    !user?.bankName || !user?.bankAccount || !user?.bankIfsc || !user?.bankHolderName || showEditBankForm ? (
                      // BANK DETAILS SUBMISSION FORM
                      <form onSubmit={handleBankDetailsSubmit} className="space-y-4">
                        <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3.5 rounded-xl text-xs">
                          <span className="font-extrabold block uppercase tracking-wider mb-0.5">Submit Bank Details</span>
                          Please submit your banking credentials. Payouts are exclusively wired to this bank account to comply with security guidelines.
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Account Holder Name</label>
                            <input 
                              type="text" 
                              value={bankHolderName}
                              onChange={(e) => setBankHolderName(e.target.value)}
                              placeholder="e.g. John Doe"
                              className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2 px-3 text-sm text-white focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Bank Name</label>
                            <input 
                              type="text" 
                              value={bankName}
                              onChange={(e) => setBankName(e.target.value)}
                              placeholder="e.g. State Bank of India"
                              className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2 px-3 text-sm text-white focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Account Number</label>
                            <input 
                              type="text" 
                              value={bankAccount}
                              onChange={(e) => setBankAccount(e.target.value)}
                              placeholder="e.g. 30012345678"
                              className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2 px-3 text-sm text-white focus:outline-none font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold uppercase text-zinc-400 mb-1">Bank IFSC Code</label>
                            <input 
                              type="text" 
                              value={bankIfsc}
                              onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                              placeholder="e.g. SBIN0001234"
                              className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2 px-3 text-sm text-white focus:outline-none font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2.5 pt-1">
                          <button 
                            type="submit"
                            disabled={isSavingBank}
                            className="flex-1 bg-[#21c25e] hover:bg-emerald-600 disabled:bg-emerald-500/50 text-zinc-950 rounded-lg py-2.5 font-extrabold text-xs uppercase tracking-wider transition"
                          >
                            {isSavingBank ? 'Saving...' : 'Save Bank Details'}
                          </button>
                          {user?.bankName && (
                            <button 
                              type="button"
                              onClick={() => { playClickSound(); setShowEditBankForm(false); }}
                              className="bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-lg px-4 py-2.5 font-extrabold text-xs uppercase tracking-wider transition border border-zinc-700"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>
                    ) : (
                      // WITHDRAWAL Payout FORM WITH LINKED BANK INFO
                      <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                        <div className="bg-zinc-950/60 border border-zinc-850 p-3.5 rounded-xl text-xs space-y-1.5 relative group">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="font-extrabold text-zinc-400 uppercase tracking-wider text-[10px]">Linked Payout Bank</span>
                            <button 
                              type="button"
                              onClick={() => { playClickSound(); setShowEditBankForm(true); }}
                              className="text-rose-400 hover:text-rose-300 font-extrabold uppercase text-[9px] tracking-widest transition"
                            >
                              Edit Bank details
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-zinc-300">
                            <div>
                              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Holder</span>
                              <span className="font-semibold truncate block">{user.bankHolderName}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Bank Name</span>
                              <span className="font-semibold truncate block">{user.bankName}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-500 block uppercase font-bold">Account Number</span>
                              <span className="font-semibold font-mono truncate block">{user.bankAccount}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-zinc-500 block uppercase font-bold">IFSC Code</span>
                              <span className="font-semibold font-mono truncate block">{user.bankIfsc}</span>
                            </div>
                          </div>
                        </div>

                        {wallet && (wallet.completedWagering ?? 0) < (wallet.requiredWagering ?? 0) && (
                          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-xl text-xs flex gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-extrabold block uppercase tracking-wider">Wagering Lock Active</span>
                              You have not met the wagering requirement. Place bets of <span className="font-mono font-bold text-white">₹{((wallet.requiredWagering ?? 0) - (wallet.completedWagering ?? 0)).toFixed(1)}</span> more to unlock.
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-semibold text-zinc-400 mb-1">Withdrawal Amount (₹)</label>
                          <input 
                            type="number" 
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder={`Min: ₹${platformConfig?.minWithdraw || 200}`}
                            className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none font-mono"
                          />
                        </div>

                        <button 
                          type="submit"
                          className="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-lg py-3 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-rose-500/10"
                        >
                          Request Withdrawal payout
                        </button>
                      </form>
                    )
                  ) : (
                    // CRYPTOCURRENCY PAYOUT MODE
                    <form onSubmit={handleCryptoWithdrawSubmit} className="space-y-4">
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        Withdraw your earnings directly to your personal cryptocurrency wallet. Withdrawals are processed safely and calculated based on real-time conversions.
                      </p>

                      {/* Currency selection */}
                      <div className="grid grid-cols-4 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-900">
                        {(['USDT', 'BTC', 'ETH', 'TRX'] as const).map((curr) => (
                          <button
                            key={curr}
                            type="button"
                            onClick={() => { playClickSound(); setCryptoCurrency(curr); }}
                            className={`py-1.5 px-1 text-[10px] font-black tracking-wide rounded-lg text-center transition ${
                              cryptoCurrency === curr
                                ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                          >
                            {curr}
                          </button>
                        ))}
                      </div>

                      {/* Rate Warning and information */}
                      <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-xl flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500 font-bold uppercase">Rate Conversion:</span>
                        <span className="font-mono text-rose-400 font-black">1 {cryptoCurrency} ≈ ₹{CRYPTO_RATES[cryptoCurrency].toLocaleString()}</span>
                      </div>

                      {/* Destination wallet address */}
                      <div>
                        <label className="block text-xs font-semibold text-zinc-400 mb-1">Your Destination Wallet Address ({cryptoCurrency})</label>
                        <input 
                          type="text" 
                          value={cryptoWithdrawAddress}
                          onChange={(e) => setCryptoWithdrawAddress(e.target.value)}
                          placeholder={`Paste your ${cryptoCurrency} wallet deposit address`}
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none font-mono"
                        />
                      </div>

                      {/* Wagering constraint indicator */}
                      {wallet && (wallet.completedWagering ?? 0) < (wallet.requiredWagering ?? 0) && (
                        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-xl text-xs flex gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-extrabold block uppercase tracking-wider">Wagering Lock Active</span>
                            You must meet wagering requirement before withdrawing. Need <span className="font-mono font-bold text-white">₹{((wallet.requiredWagering ?? 0) - (wallet.completedWagering ?? 0)).toFixed(1)}</span> more volume.
                          </div>
                        </div>
                      )}

                      {/* Crypto Withdraw Amount */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-zinc-400">Withdraw Quantity ({cryptoCurrency})</label>
                          {cryptoWithdrawAmount && (
                            <span className="text-[10px] font-black text-rose-400 font-mono">
                              ≈ ₹{(Number(cryptoWithdrawAmount) * CRYPTO_RATES[cryptoCurrency]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          )}
                        </div>
                        <input 
                          type="number" 
                          step="any"
                          value={cryptoWithdrawAmount}
                          onChange={(e) => setCryptoWithdrawAmount(e.target.value)}
                          placeholder={`Quantity of ${cryptoCurrency} to withdraw...`}
                          className="w-full bg-zinc-900 border border-zinc-800 focus:border-rose-500/50 rounded-lg py-2.5 px-3.5 text-sm text-white focus:outline-none font-mono"
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={isSubmittingCrypto}
                        className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/50 text-white rounded-lg py-3 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-rose-500/10"
                      >
                        {isSubmittingCrypto ? 'PROCESSING PAYOUTS...' : 'REQUEST CRYPTO WITHDRAWAL'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* TAB CONTENT: TRANSACTIONS / LEDGER */}
              {walletModalTab === 'transactions' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Recent Ledger Operations</span>
                    <button 
                      onClick={() => { playClickSound(); fetchTransactions(); }}
                      className="text-[9px] text-emerald-400 hover:text-emerald-300 font-bold uppercase flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Sync Ledger
                    </button>
                  </div>

                  {loadingTransactions ? (
                    <TransactionListSkeleton />
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 text-xs">No recent transaction history found in your ledger.</div>
                  ) : (
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                      {transactions.slice(0, 15).map((tx) => (
                        <div key={tx.id} className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl space-y-2 hover:border-zinc-800 transition">
                          <div className="flex justify-between items-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${getBadgeColor(tx.type)}`}>
                              {tx.type}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-mono">
                              {new Date(tx.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-zinc-300 truncate max-w-[240px]">
                              {tx.type === 'deposit' ? 'Ref: ' + (tx.utr || tx.id) : tx.type === 'withdraw' ? (tx.utr ? 'Payout Ref: ' + tx.utr : 'Payout to Destination') : 'Trade wager'}
                            </span>
                            <span className="text-sm font-black text-white font-mono">
                              ₹{tx.amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] border-t border-zinc-900 pt-2 mt-1">
                            <span className="text-zinc-500 truncate max-w-[260px]">
                              {tx.remark || tx.cryptoTxHash || tx.cryptoAddress || 'Transaction logged successfully'}
                            </span>
                            <span className={`font-black uppercase text-[9px] ${
                              tx.status === 'approved' || tx.status === 'success' ? 'text-emerald-400 bg-emerald-500/5 px-1 py-0.2 rounded' : tx.status === 'pending' ? 'text-amber-400 bg-amber-500/5 px-1 py-0.2 rounded' : 'text-rose-400 bg-rose-500/5 px-1 py-0.2 rounded'
                            }`}>
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Modal Footer Info */}
            <div className="p-4 bg-[#161b22] border-t border-zinc-850/80 text-center text-[9px] text-zinc-500 font-mono">
              Secured under end-to-end multi-sig protocols. All operations irreversible.
            </div>
          </motion.div>
        </div>
      )}

      {/* Real-time Payment Gateway Callback tracking overlay */}
      {activePaymentOrder && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-fadeIn" id="payment_callback_modal">
          <div className="bg-[#0d1117] border border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col items-center text-center animate-scaleIn">
            {/* Background glowing ambient light */}
            <div className={`absolute top-0 inset-x-0 h-1 transition-all duration-500 ${
              activePaymentOrder.status === 'success' ? 'bg-emerald-500 shadow-[0_4px_20px_rgba(16,185,129,0.6)]' :
              activePaymentOrder.status === 'failed' ? 'bg-rose-500 shadow-[0_4px_20px_rgba(239,68,68,0.6)]' :
              'bg-amber-500 shadow-[0_4px_20px_rgba(245,158,11,0.6)]'
            }`} />

            {/* Icon representation */}
            <div className="mt-4 mb-5">
              {activePaymentOrder.status === 'success' ? (
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
              ) : activePaymentOrder.status === 'failed' ? (
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-8 h-8" />
                </div>
              ) : (
                <div className="relative flex items-center justify-center animate-pulse">
                  <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full p-1.5 shadow-md">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                </div>
              )}
            </div>

            {/* Status Headings */}
            <h3 className="text-lg font-black uppercase text-white tracking-wider">
              {activePaymentOrder.status === 'success' ? 'Deposit Confirmed' :
               activePaymentOrder.status === 'failed' ? 'Deposit Failed' :
               'Awaiting Callback'}
            </h3>
            
            <p className="text-xs text-zinc-400 mt-2 max-w-sm">
              {activePaymentOrder.status === 'success' ? 'Our server successfully verified the webhook callback from the payment gateway. Your cash wallet balance has been credited!' :
               activePaymentOrder.status === 'failed' ? 'The payment gateway returned a failed callback, or the session has expired. No cash funds were credited.' :
               'Please complete your payment in the payment window. This page will auto-refresh the moment we receive the instant secure gateway callback.'}
            </p>

            {/* Summary Details */}
            <div className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl p-4 my-5 space-y-3 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Deposit Amount:</span>
                <span className="font-mono text-emerald-400 font-black text-sm">₹{activePaymentOrder.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Reference ID:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-zinc-300 font-bold">{activePaymentOrder.id}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(activePaymentOrder.id);
                      showToast('Reference Copied', 'Payment order reference ID copied to clipboard!');
                    }}
                    className="text-zinc-500 hover:text-white transition"
                    title="Copy Reference ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-bold uppercase tracking-wider text-[10px]">Verifying Status:</span>
                <span className={`font-mono font-black uppercase text-[10px] px-2 py-0.5 rounded ${
                  activePaymentOrder.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                  activePaymentOrder.status === 'failed' ? 'bg-rose-500/10 text-rose-400' :
                  'bg-amber-500/10 text-amber-400 animate-pulse'
                }`}>
                  {activePaymentOrder.status}
                </span>
              </div>
            </div>

            {/* Core Action Buttons */}
            <div className="w-full space-y-2.5">
              {activePaymentOrder.status === 'pending' && (
                <>
                  {!hasOpenedPaymentWindow ? (
                    <button
                      onClick={() => {
                        playClickSound();
                        window.open(activePaymentOrder.paymentUrl, '_blank');
                        setHasOpenedPaymentWindow(true);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-500 hover:opacity-90 active:scale-[0.98] text-black font-black uppercase tracking-wider rounded-xl text-xs shadow-lg transition flex items-center justify-center gap-1.5"
                    >
                      <span>Proceed to Pay (New Tab)</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          playClickSound();
                          window.open(activePaymentOrder.paymentUrl, '_blank');
                        }}
                        className="py-2.5 bg-zinc-900 border border-zinc-800 hover:text-white text-zinc-300 font-bold rounded-xl text-xs transition"
                      >
                        Reopen Link
                      </button>
                      <button
                        onClick={() => {
                          playClickSound();
                          checkPaymentStatusDirectly(activePaymentOrder.id);
                        }}
                        disabled={checkingPaymentStatus}
                        className="py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                      >
                        {checkingPaymentStatus ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          'Check Status'
                        )}
                      </button>
                    </div>
                  )}
                  
                  {/* Convenient Sandbox Payment simulator for testing */}
                  <button
                    onClick={() => {
                      playClickSound();
                      handleSimulatePaymentSuccess(activePaymentOrder.id);
                    }}
                    disabled={simulatingPayment}
                    className="w-full mt-3 py-3 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-50 text-emerald-400 font-extrabold rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {simulatingPayment ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Simulate Payment Success (Demo)</span>
                      </>
                    )}
                  </button>
                </>
              )}

              {activePaymentOrder.status !== 'pending' && (
                <button
                  onClick={() => {
                    playClickSound();
                    setActivePaymentOrder(null);
                    setPaymentResult(null);
                  }}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 active:scale-[0.98] text-white font-black uppercase tracking-wider rounded-xl text-xs transition border border-zinc-850"
                >
                  Great, Close
                </button>
              )}

              {activePaymentOrder.status === 'pending' && (
                <button
                  onClick={() => {
                    playClickSound();
                    setActivePaymentOrder(null);
                    setPaymentResult(null);
                    localStorage.removeItem('active_payment_order_id');
                  }}
                  className="w-full text-[10px] text-zinc-500 hover:text-rose-400 transition font-bold uppercase tracking-wider pt-2"
                >
                  Cancel Tracking & Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Elegant Success Toast Overlay */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: 100, transition: { duration: 0.2 } }}
              layout
              className="pointer-events-auto w-full bg-zinc-950/95 backdrop-blur-md border border-emerald-500/30 shadow-2xl shadow-emerald-950/20 rounded-xl p-4 flex gap-3 relative overflow-hidden"
            >
              {/* Success colored decorative sidebar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
              
              <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg shrink-0 h-9 w-9 flex items-center justify-center">
                <Check className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    {toast.title}
                  </h4>
                  <button
                    onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                    className="text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{toast.message}</p>
                <div className="text-[10px] text-zinc-500 flex items-center gap-1.5 pt-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Ready for transaction verification</span>
                </div>
              </div>

              {/* Active countdown visual timer bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 4, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-0.5 bg-emerald-500/50"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
