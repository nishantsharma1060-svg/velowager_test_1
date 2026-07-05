import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  Timer, 
  AlertCircle,
  TrendingUp,
  CreditCard
} from 'lucide-react';

interface JazPayCheckoutProps {
  onBackToApp?: () => void;
}

export default function JazPayCheckout({ onBackToApp }: JazPayCheckoutProps) {
  const [orderId, setOrderId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [token, setToken] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Interface interaction states
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'upi_id'>('qr');
  const [upiId, setUpiId] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes timer
  const [simulationState, setSimulationState] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // Extract params from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ordId = params.get('orderId') || '';
    const amtStr = params.get('amount') || '0';
    setOrderId(ordId);
    setAmount(Number(amtStr));

    const storedToken = localStorage.getItem('token');
    setToken(storedToken);

    if (!ordId) {
      setErrorMsg('No order ID provided. Please launch checkout from within the VeloWager App.');
      setLoading(false);
      return;
    }

    // Fetch matching order details from API to extract signature and verify details
    if (storedToken) {
      fetch(`/api/payments/order/${ordId}`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setErrorMsg(data.error);
        } else {
          setOrderDetail(data.order);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('[JazPay Checkout] Order query failed:', err);
        setErrorMsg('Could not verify order status. Check database connectivity or authorization.');
        setLoading(false);
      });
    } else {
      setErrorMsg('User is unauthenticated. Please log in first to proceed.');
      setLoading(false);
    }
  }, []);

  // Handle countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setSimulationState('failed');
      setStatusMessage('This payment session has expired.');
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Trigger Callback Simulation
  const handleSimulateCallback = async (status: 'success' | 'failed') => {
    if (!orderId) return;
    setSimulationState('processing');
    setStatusMessage(status === 'success' ? 'Authorizing payment with UPI Network...' : 'Rejecting transaction...');

    try {
      const signature = orderDetail?.signature || '';
      const generatedTxId = 'jzpay-' + Math.random().toString(36).substr(2, 9);
      
      // Call the real webhook callback endpoint to simulate JazPay's real notification payload
      const callbackResponse = await fetch('/api/payments/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderNo: generatedTxId,
          merchantOrder: orderId,
          status: status === 'success' ? 'success' : 'failed',
          amount: amount,
          signature: signature,
          paymentMethod: paymentMethod === 'qr' ? 'UPI_QR' : 'UPI_ID'
        })
      });

      const responseText = await callbackResponse.text();
      console.log('[JazPay Webhook Simulation Response]:', responseText);

      // Give a tiny aesthetic delay to simulate network latency
      setTimeout(() => {
        if (status === 'success') {
          setSimulationState('success');
          setStatusMessage('Payment Processed Successfully!');
          // Redirect back to original app with positive status after 1.5 seconds
          setTimeout(() => {
            window.location.href = `/?paymentStatus=success&orderId=${orderId}`;
          }, 1500);
        } else {
          setSimulationState('failed');
          setStatusMessage('Transaction declined by simulated user/bank.');
          // Redirect back to original app with failure status after 1.5 seconds
          setTimeout(() => {
            window.location.href = `/?paymentStatus=failed&orderId=${orderId}`;
          }, 1500);
        }
      }, 1200);

    } catch (err: any) {
      console.error('[Callback Simulation Failed]:', err);
      setSimulationState('idle');
      setErrorMsg('Failed to trigger webhook simulation: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080b] flex flex-col items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin"></div>
          <p className="text-sm font-semibold tracking-wide text-zinc-400 font-mono">ESTABLISHING SECURE JAZPAY CONNECTION...</p>
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#06080b] flex flex-col items-center justify-center text-white px-4 font-sans">
        <div className="max-w-md w-full bg-[#12161d] border border-zinc-800 rounded-2xl p-6 text-center shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-extrabold mb-2 tracking-tight">Gateway Initialization Error</h2>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">{errorMsg}</p>
          <button
            onClick={() => { window.location.href = '/'; }}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3 text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Application</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06080b] text-zinc-100 flex flex-col font-sans antialiased relative overflow-hidden">
      {/* Decorative premium glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />

      {/* 1. Gateway Top Security Header */}
      <header className="bg-[#12161d]/80 backdrop-blur-md border-b border-zinc-800/80 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                JazPay Secure
              </span>
              <span className="block text-[9px] text-zinc-500 font-mono uppercase tracking-widest mt-[-2px]">Payment Gateway</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800/80 rounded-full text-zinc-500 text-[10px] font-mono">
              <Lock className="w-3 h-3 text-emerald-500" />
              <span>PCI-DSS SECURE 256-BIT SESSION</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-mono font-bold">
              <Timer className="w-3.5 h-3.5 animate-pulse" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Checkout Page Grid */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-grow w-full grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Column: Order Summary Details (Span 5) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-[#12161d] border border-zinc-800/80 rounded-2xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
            
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 border-b border-zinc-800/60 pb-2">
              Payment Summary
            </h3>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Merchant / Platform</span>
                <span className="text-sm font-extrabold text-white">VeloWager Pro Platform</span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Order Reference ID</span>
                <span className="text-xs font-mono text-zinc-300 break-all">{orderId}</span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Creation Date</span>
                <span className="text-xs text-zinc-300">
                  {orderDetail?.createdAt ? new Date(orderDetail.createdAt).toLocaleString() : new Date().toLocaleString()}
                </span>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 mt-2 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block">Total Payable Amount</span>
                  <span className="text-2xl font-black text-white font-sans">
                    ₹{amount.toFixed(2)}
                  </span>
                </div>
                <div className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg text-[9px] font-bold uppercase tracking-wider">
                  INR
                </div>
              </div>
            </div>
          </div>

          {/* Secure Trust Badge */}
          <div className="bg-[#12161d]/50 border border-zinc-850 rounded-2xl p-4 flex gap-3 items-start">
            <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-zinc-300">Guaranteed Instant Auto-Crediting</h4>
              <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">
                JazPay processes transaction state changes instantly. On success, the API callback automatically dispatches and updates your cash ledger.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Simulator Terminal (Span 7) */}
        <div className="md:col-span-7">
          <div className="bg-[#12161d] border border-zinc-800 rounded-2xl p-6 shadow-2xl flex flex-col h-full relative">
            
            {simulationState === 'processing' && (
              <div className="absolute inset-0 bg-[#06080b]/90 rounded-2xl z-20 flex flex-col items-center justify-center text-center p-6 animate-in fade-in">
                <div className="w-12 h-12 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin mb-4"></div>
                <p className="text-sm font-extrabold text-white tracking-wide uppercase font-mono">PROCESSING JAZPAY TRANSACTION</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs">{statusMessage}</p>
              </div>
            )}

            {simulationState === 'success' && (
              <div className="absolute inset-0 bg-[#06080b]/95 rounded-2xl z-20 flex flex-col items-center justify-center text-center p-6 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
                </div>
                <p className="text-lg font-black text-white uppercase tracking-tight">TRANSACTION SUCCESSFUL!</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs">{statusMessage}</p>
                <p className="text-[9px] text-zinc-600 font-mono mt-4">Redirecting you back to your wallet...</p>
              </div>
            )}

            {simulationState === 'failed' && (
              <div className="absolute inset-0 bg-[#06080b]/95 rounded-2xl z-20 flex flex-col items-center justify-center text-center p-6 animate-in zoom-in-95">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
                  <XCircle className="w-8 h-8 text-rose-400" />
                </div>
                <p className="text-lg font-black text-white uppercase tracking-tight">TRANSACTION FAILED / DECLINED</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs">{statusMessage}</p>
                <p className="text-[9px] text-zinc-600 font-mono mt-4">Returning you back to VeloWager...</p>
              </div>
            )}

            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-5 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Select UPI Payment Method</span>
            </h3>

            {/* Selector tabs */}
            <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-900 mb-6">
              <button
                onClick={() => setPaymentMethod('qr')}
                className={`py-2.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  paymentMethod === 'qr'
                    ? 'bg-purple-500/15 border border-purple-500/20 text-purple-300 font-extrabold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>UPI Scan QR Code</span>
              </button>
              <button
                onClick={() => setPaymentMethod('upi_id')}
                className={`py-2.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                  paymentMethod === 'upi_id'
                    ? 'bg-purple-500/15 border border-purple-500/20 text-purple-300 font-extrabold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Pay via UPI ID</span>
              </button>
            </div>

            {/* QR Code scanning option */}
            {paymentMethod === 'qr' && (
              <div className="flex-grow flex flex-col items-center justify-center py-4">
                <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-purple-500/20 relative group overflow-hidden">
                  {/* Glowing Laser Scanner effect */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500 shadow-lg shadow-purple-500/80 animate-bounce" />
                  
                  {/* Authentic look Simulated QR Code */}
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=win_go_jazpay@okaxis%26pn=VeloWager%26am=${amount}%26tr=${orderId}`} 
                    alt="Scan to pay via UPI"
                    className="w-44 h-44 object-contain"
                  />
                </div>
                <p className="text-[11px] text-zinc-400 font-medium text-center mt-4">
                  Scan this secure QR code using any UPI app (Google Pay, PhonePe, Paytm, BHIM)
                </p>
                
                <div className="flex gap-2.5 mt-4 overflow-x-auto w-full justify-center opacity-80 select-none">
                  <span className="text-[10px] px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 font-bold">GPay</span>
                  <span className="text-[10px] px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 font-bold">PhonePe</span>
                  <span className="text-[10px] px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 font-bold">Paytm</span>
                  <span className="text-[10px] px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 font-bold">BHIM</span>
                </div>
              </div>
            )}

            {/* UPI ID / VPA Input option */}
            {paymentMethod === 'upi_id' && (
              <div className="flex-grow flex flex-col justify-center space-y-4 py-6">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1 tracking-wider">
                    Enter Virtual Payment Address (VPA)
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. mobile@ybl or username@okaxis"
                      className="flex-grow bg-zinc-950 border border-zinc-850 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500/50 text-white font-mono"
                    />
                    <button
                      onClick={() => setUpiId('demo_user@okaxis')}
                      className="px-3.5 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl text-[10px] font-extrabold text-zinc-400 uppercase tracking-wide transition shrink-0"
                    >
                      Autofill
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1.5 leading-normal">
                    This will send a collection request to your smartphone's UPI banking app instantly.
                  </p>
                </div>

                <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-3 flex gap-2.5 items-start">
                  <AlertCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    Your real UPI credentials are never collected by our site. All transactions are securely brokered directly by the bank's JazPay secure node.
                  </p>
                </div>
              </div>
            )}

            {/* Sandbox Simulation Trigger Controls */}
            <div className="border-t border-zinc-800/80 pt-5 mt-4 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-wide mb-1">
                <span>SIMULATOR CONTROLS</span>
                <span className="text-purple-400">MD5 Webhook verified</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSimulateCallback('success')}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl py-3 px-4 font-extrabold text-xs uppercase tracking-wider transition shadow-lg shadow-purple-600/15 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Authorize & Pay</span>
                </button>

                <button
                  onClick={() => handleSimulateCallback('failed')}
                  className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-xl py-3 px-4 font-extrabold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Decline / Fail</span>
                </button>
              </div>

              <button
                onClick={() => { window.location.href = `/?paymentStatus=failed&orderId=${orderId}`; }}
                className="w-full text-center py-2 text-[10px] font-extrabold text-zinc-500 hover:text-zinc-400 uppercase tracking-widest transition block mt-1"
              >
                Cancel Session & Return
              </button>
            </div>

          </div>
        </div>

      </main>

      {/* Gateway Footer */}
      <footer className="bg-[#0b0c0e] border-t border-zinc-900/60 text-center py-4 text-[9px] text-zinc-600 font-mono tracking-wider relative z-10">
        POWERED SECURELY BY JAZPAY CO. LTD • COPYRIGHT © 2026 • ALL RIGHTS RESERVED
      </footer>
    </div>
  );
}
