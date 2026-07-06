import { ethers } from 'ethers';
import { TronWeb } from 'tronweb';

export interface BlockchainTransferResult {
  txHash: string;
  explorerUrl: string;
  networkFee: number;
  status: 'completed' | 'pending';
}

class CryptoService {
  private getEthPrivateKey(): string {
    const key = process.env.CRYPTO_ETH_PRIVATE_KEY;
    if (!key) {
      throw new Error('CRYPTO_ETH_PRIVATE_KEY environment variable is missing. Please add it to your .env file or configuration panel.');
    }
    return key.trim();
  }

  private getEthRpcUrl(): string {
    return process.env.CRYPTO_ETH_RPC_URL || 'https://ethereum-rpc.publicnode.com';
  }

  private getTronPrivateKey(): string {
    const key = process.env.CRYPTO_TRON_PRIVATE_KEY;
    if (!key) {
      throw new Error('CRYPTO_TRON_PRIVATE_KEY environment variable is missing. Please add it to your .env file or configuration panel.');
    }
    return key.trim();
  }

  private getTronRpcUrl(): string {
    // Nile Testnet is excellent for test environments, mainnet for production
    return process.env.CRYPTO_TRON_RPC_URL || 'https://api.trongrid.io';
  }

  /**
   * Send Native Ethereum (ETH)
   */
  public async sendEth(to: string, amount: string): Promise<BlockchainTransferResult> {
    const privateKey = this.getEthPrivateKey();
    const rpcUrl = this.getEthRpcUrl();

    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    const cleanTo = to.trim();
    if (!ethers.isAddress(cleanTo)) {
      throw new Error(`Invalid Ethereum destination address: ${cleanTo}`);
    }

    try {
      
      const tx = await wallet.sendTransaction({
        to: cleanTo,
        value: ethers.parseEther(amount)
      });


      const isTestnet = rpcUrl.includes('sepolia') || rpcUrl.includes('goerli');
      const explorerUrl = isTestnet 
        ? `https://sepolia.etherscan.io/tx/${tx.hash}` 
        : `https://etherscan.io/tx/${tx.hash}`;

      return {
        txHash: tx.hash,
        explorerUrl,
        networkFee: 0.0015, // Approximate estimation, will be finalized on-chain
        status: 'pending'
      };
    } catch (err: any) {
      console.error('[Crypto] ETH Transfer Failed:', err);
      throw new Error(`Blockchain ETH transfer failed: ${err.message || err}`);
    }
  }

  /**
   * Send ERC-20 Tether (USDT) on Ethereum
   */
  public async sendErc20Usdt(to: string, amount: string): Promise<BlockchainTransferResult> {
    const privateKey = this.getEthPrivateKey();
    const rpcUrl = this.getEthRpcUrl();

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    const cleanTo = to.trim();
    if (!ethers.isAddress(cleanTo)) {
      throw new Error(`Invalid Ethereum destination address: ${cleanTo}`);
    }

    const usdtContractAddress = process.env.CRYPTO_ETH_USDT_CONTRACT || '0xdAC17F958D2ee523a2206206994597C13D831ec7';
    const usdtAbi = [
      'function transfer(address to, uint256 value) returns (bool)',
      'function decimals() view returns (uint8)'
    ];

    try {
      const contract = new ethers.Contract(usdtContractAddress, usdtAbi, wallet);
      
      // USDT decimals is normally 6
      const decimals = 6;
      const parsedAmount = ethers.parseUnits(amount, decimals);

      const tx = await contract.transfer(cleanTo, parsedAmount);

      const isTestnet = rpcUrl.includes('sepolia') || rpcUrl.includes('goerli');
      const explorerUrl = isTestnet 
        ? `https://sepolia.etherscan.io/tx/${tx.hash}` 
        : `https://etherscan.io/tx/${tx.hash}`;

      return {
        txHash: tx.hash,
        explorerUrl,
        networkFee: 1.5, // Estimated standard gas-fee for ERC-20 USDT
        status: 'pending'
      };
    } catch (err: any) {
      console.error('[Crypto] ERC-20 USDT Transfer Failed:', err);
      throw new Error(`Blockchain ERC-20 USDT transfer failed: ${err.message || err}`);
    }
  }

  /**
   * Send TRON (TRX)
   */
  public async sendTrx(to: string, amount: string): Promise<BlockchainTransferResult> {
    const privateKey = this.getTronPrivateKey();
    const rpcUrl = this.getTronRpcUrl();

    const tronWeb = new TronWeb({
      fullHost: rpcUrl,
      privateKey: privateKey
    });

    const cleanTo = to.trim();
    if (!tronWeb.isAddress(cleanTo)) {
      throw new Error(`Invalid TRON destination address: ${cleanTo}`);
    }

    try {
      
      // Convert TRX to Sun (1 TRX = 1,000,000 Sun)
      const sunAmount = Number(tronWeb.toSun(parseFloat(amount)));
      const tx = await tronWeb.trx.sendTransaction(cleanTo, sunAmount);

      const txHash = (tx as any).txid || (tx as any).txID || (tx as any).hash || '';

      if (!tx || !txHash) {
        throw new Error('TRON network broadcast did not return a valid Transaction ID.');
      }


      const isTestnet = rpcUrl.includes('nile') || rpcUrl.includes('shasta');
      const explorerUrl = isTestnet 
        ? `https://nile.tronscan.org/#/transaction/${txHash}` 
        : `https://tronscan.org/#/transaction/${txHash}`;

      return {
        txHash,
        explorerUrl,
        networkFee: 1.1, // Average standard bandwidth fee
        status: 'pending'
      };
    } catch (err: any) {
      console.error('[Crypto] TRX Transfer Failed:', err);
      throw new Error(`Blockchain TRX transfer failed: ${err.message || err}`);
    }
  }

  /**
   * Send TRC-20 Tether (USDT) on TRON
   */
  public async sendTrc20Usdt(to: string, amount: string): Promise<BlockchainTransferResult> {
    const privateKey = this.getTronPrivateKey();
    const rpcUrl = this.getTronRpcUrl();

    const tronWeb = new TronWeb({
      fullHost: rpcUrl,
      privateKey: privateKey
    });

    const cleanTo = to.trim();
    if (!tronWeb.isAddress(cleanTo)) {
      throw new Error(`Invalid TRON destination address: ${cleanTo}`);
    }

    const usdtContractAddress = process.env.CRYPTO_TRON_USDT_CONTRACT || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

    try {
      
      // Get contract instance
      const contract = await tronWeb.contract().at(usdtContractAddress);
      
      // TRC-20 USDT uses 6 decimals
      const decimals = 6;
      const parsedAmount = Math.floor(parseFloat(amount) * Math.pow(10, decimals));

      const txIDResult = await contract.transfer(cleanTo, parsedAmount).send();
      const txHash = typeof txIDResult === 'string' ? txIDResult : (txIDResult as any).txid || (txIDResult as any).txID || (txIDResult as any).hash || '';

      if (!txHash) {
        throw new Error('TRC-20 contract execution did not return a valid Transaction ID.');
      }


      const isTestnet = rpcUrl.includes('nile') || rpcUrl.includes('shasta');
      const explorerUrl = isTestnet 
        ? `https://nile.tronscan.org/#/transaction/${txHash}` 
        : `https://tronscan.org/#/transaction/${txHash}`;

      return {
        txHash,
        explorerUrl,
        networkFee: 2.5, // Standard energy fee
        status: 'pending'
      };
    } catch (err: any) {
      console.error('[Crypto] TRC-20 USDT Transfer Failed:', err);
      throw new Error(`Blockchain TRC-20 USDT transfer failed: ${err.message || err}`);
    }
  }

  /**
   * Send Bitcoin (BTC)
   * Since native Bitcoin execution requires complex SegWit tx construction, we integrate with Blockcypher's API.
   * If a Blockcypher Token is available, we perform a real broadcast.
   * Otherwise, we can broadcast standard live transfers or prompt for the blockcypher credential safely.
   */
  public async sendBtc(to: string, amount: string): Promise<BlockchainTransferResult> {
    const token = process.env.CRYPTO_BTC_BLOCKCYPHER_TOKEN;
    const cleanTo = to.trim();
    
    // Simple Bitcoin Address Validation regex
    const btcRegex = /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{39,59})$/;
    if (!btcRegex.test(cleanTo)) {
      throw new Error(`Invalid Bitcoin destination address: ${cleanTo}`);
    }

    if (!token) {
      throw new Error('CRYPTO_BTC_BLOCKCYPHER_TOKEN environment variable is missing. To execute real BTC sweeps, please add your Blockcypher Token to the .env file.');
    }

    try {
      
      // Real Bitcoin transfers can be performed using Blockcypher microtx or tx-skel endpoints.
      // Here is a robust, production-grade microtransaction API integration:
      const response = await fetch(`https://api.blockcypher.com/v1/btc/main/txs/micro?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_private: process.env.CRYPTO_BTC_PRIVATE_KEY, // Private key in WIF or hex
          to_address: cleanTo,
          value_satoshis: Math.floor(parseFloat(amount) * 100000000) // Convert BTC to satoshis
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to broadcast Bitcoin transaction via Blockcypher API.');
      }


      return {
        txHash: data.hash,
        explorerUrl: `https://blockchair.com/bitcoin/transaction/${data.hash}`,
        networkFee: data.fees ? data.fees / 100000000 : 0.00015,
        status: 'pending'
      };
    } catch (err: any) {
      console.error('[Crypto] BTC Transfer Failed:', err);
      throw new Error(`Blockchain BTC transfer failed: ${err.message || err}`);
    }
  }
}

export const cryptoService = new CryptoService();
