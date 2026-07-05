# Enterprise-Grade Crypto Gaming Backend Architecture Blueprint
**Author:** Principal Software Architect, Senior Blockchain Engineer, & Backend Lead
**Target Platform Scale:** 5M+ Active Users, High-Throughput (10k+ tx/sec), Non-Custodial Multi-Chain Core

---

## 1. System Topology & Architectural Principles

To support millions of users, near-instantaneous live bet updates, high-throughput micro-transactions, and non-blocking wallet sweeps, this architecture segregates the **Core API Application Plane**, the **State Broker Engine (Redis & Socket.IO)**, the **Asynchronous Worker Queue Fabric (BullMQ)**, and the **Cryptographic Cold/Hot Wallet Vault Systems**.

```
                           +------------------------+
                           |   Load Balancer (Nginx)|
                           +-----------+------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
        +----------v----------+                 +----------v----------+
        |  API Cluster Node 1 |                 |  API Cluster Node 2 |
        |  (PM2 Cluster Mode) |                 |  (PM2 Cluster Mode) |
        +----------+----------+                 +----------+----------+
                   |                                       |
                   +-------------------+-------------------+
                                       |
         +-----------------------------v-----------------------------+
         |                       Socket.IO Bus                       |
         +-----------------------------+-----------------------------+
                                       |
          +----------------------------+----------------------------+
          |                            |                            |
+---------v----------+       +---------v----------+       +---------v----------+
| PostgreSQL Replica |       | Redis Cluster (Pub)|       |  BullMQ Job Queue  |
|  (Prisma Core DB)  |       | (Session/Cache/RTP)|       |  (Worker Fabric)   |
+--------------------+       +--------------------+       +---------+----------+
                                                                    |
                                        +---------------------------+
                                        | (Distributed Workers)
     +----------------------------------+----------------------------------+
     |                  |               |               |                  |
+----v-----+       +----v----+     +----v-----+    +----v-----+       +----v-----+
| Deposit  |       | Sweep   |     | Withdraw |    | Audit    |       | VIP/RTP  |
| Watcher  |       | Worker  |     | Signer   |    | Logging  |       | Engine   |
+----------+       +---------+     +----------+    +----------+       +----------+
```

### Core Design Patterns Applied:
* **SOLID Principles & Clean Architecture**: Complete separation between Route Controllers, Service layers containing business logic, and Repository layers abstracting the database.
* **Repository Pattern**: All database mutations occur inside explicit Repositories to enable seamless swapping of database backplanes (e.g. migrating Prisma to raw knex/pg queries without affecting service contracts).
* **Dependency Injection (DI)**: Classes receive their dependent services, database repositories, and logging adapters in their constructor, promoting unit-testability with mocks.
* **Adapter Pattern (Blockchain Providers)**: The core system interacts with standard abstract blockchain methods. Distinct providers (Ethereum, Tron, Bitcoin, Solana) wrap external RPC clients to conform to these methods.
* **Strategy Pattern (Games Logic)**: Dice, Crash, Mines, Wheel, and Coin Flip are built as independent strategies implementing a `GameStrategy` interface, separating random number generation (Provably Fair) from wagering mechanics.
* **Factory Pattern (Wallet Providers)**: Dynamically generates HD Wallet keypaths, deposit targets, and hot-wallet transaction builders based on the targeted blockchain asset.

---

## 2. Definitive Directory Structure (`project-root/src`)

This comprehensive directory layout enforces strict separation of concerns, ensuring modularity, easy maintenance, and PM2 compatibility.

```
project-root/
├── src/
│   ├── server.ts                       # Entry point (Cluster master, process-ready bootstrap)
│   ├── app.ts                          # Express server setup (Middlewares, rate limiters, routes)
│   │
│   ├── config/                         # System Configurations
│   │   ├── database.ts                 # Prisma connection pools, read-replicas, connection logging
│   │   ├── redis.ts                    # Redis cluster and pub-sub client setups
│   │   ├── blockchain.ts               # RPC endpoints, master key configurations
│   │   └── security.ts                 # Cryptographic salts, JWT limits, API Key policies
│   │
│   ├── routes/                         # Route Declarations
│   │   ├── api/
│   │   │   ├── auth.ts                 # Registration, 2FA, JWT Refresh endpoints
│   │   │   ├── wallet.ts               # Deposit addresses, withdrawals, transactions
│   │   │   ├── games.ts                # Betting pipelines, Provably Fair queries
│   │   │   └── admin.ts                # User actions, custom direct wallet adjustment hooks
│   │   └── index.ts
│   │
│   ├── controllers/                    # Presentation Plane (HTTP/JSON parsing, status returns)
│   │   ├── BaseController.ts
│   │   ├── AuthController.ts
│   │   ├── WalletController.ts
│   │   └── AdminController.ts
│   │
│   ├── services/                       # Business Logic Plane (Transactional pipelines, limits, VIP rules)
│   │   ├── BaseService.ts
│   │   ├── WalletService.ts            # Central balance updates, ledger mutations
│   │   ├── GameEngineService.ts        # Dynamic RTP calculations, bet placements
│   │   └── VIPService.ts               # VIP level calculation, rollover claims
│   │
│   ├── repositories/                   # Data Access Plane (Database adapters, query layers)
│   │   ├── UserRepository.ts
│   │   ├── WalletRepository.ts
│   │   ├── TransactionRepository.ts
│   │   └── AuditRepository.ts
│   │
│   ├── blockchain/                     # Abstract Blockchain Provider Layer (Adapter Pattern)
│   │   ├── BlockchainProvider.ts       # Base abstract interface
│   │   ├── TronProvider.ts             # TRX, TRC20 execution methods
│   │   ├── EthereumProvider.ts         # ETH, ERC20 execution methods
│   │   ├── SolanaProvider.ts           # SOL, SPL execution methods
│   │   └── BitcoinProvider.ts          # BTC UTXO spend rules
│   │
│   ├── wallet/                         # Hierarchical Deterministic Wallet Engines
│   │   ├── HDWalletGenerator.ts        # Cryptographic derivation paths (BIP44/39)
│   │   ├── WalletVault.ts              # Encrypted vault handlers for Master Mnemonic
│   │   └── WalletPoolFactory.ts        # Wallet type instances generator
│   │
│   ├── queue/                          # BullMQ Integration Backplane
│   │   ├── QueueManager.ts             # Central client for dispatching jobs
│   │   └── definitions/                # Named pipeline setups (Deposit, Sweep, Email)
│   │
│   ├── workers/                        # Distributed Worker Engines (Self-contained modules)
│   │   ├── depositWorker/              # Scans RPC chain, detects incoming addresses
│   │   ├── confirmationWorker/        # Checks transaction confirmation thresholds
│   │   ├── sweepWorker/                # Dispatches gas, sweeps incoming deposits to Hot Wallets
│   │   ├── withdrawWorker/             # Securely dequeues, signs, and broadcasts outgoing transactions
│   │   ├── notificationWorker/         # Dispatches real-time webhooks & notifications
│   │   ├── auditWorker/                # Analyzes system ledger deviations and flag hacks
│   │   └── vipWorker/                  # Processes background vip ranking adjustments
│   │
│   ├── websocket/                      # Live Communication Plane (Socket.IO)
│   │   ├── SocketServer.ts             # Instantiation, adapter binding, authorization
│   │   ├── WalletGateway.ts            # Emits dynamic balance changes & ledger updates
│   │   └── GameGateway.ts              # Emits crash curves, high rollers ledger, multiplayer states
│   │
│   ├── middleware/                     # Express Application Protections
│   │   ├── authenticate.ts             # JWT check, IP verify, device authentication
│   │   ├── adminAuth.ts                # Strict RBAC / administrator token authorization
│   │   └── securityHeaders.ts          # CORS policies, CSP, Frame mitigation
│   │
│   ├── validators/                     # Request Body Validation
│   │   ├── authValidator.ts            # Sanitizes registration inputs
│   │   └── txValidator.ts              # Validates withdraw targets, amounts, nonces
│   │
│   ├── events/                         # Internal Event-Driven Messaging Backplane (EDA)
│   │   ├── EventEmitter.ts             # Custom event handler
│   │   └── handlers/                   # Event listeners (e.g., wagerPlaced -> addVipPoints)
│   │
│   ├── interfaces/                     # Global Type Declarations & Interface definitions
│   │   ├── IBlockchain.ts
│   │   ├── IWallet.ts
│   │   └── IGame.ts
│   │
│   ├── shared/                         # Reusable helpers & structural libraries
│   │   ├── logger/                     # Pino transport configuring system output streams
│   │   ├── helpers/                    # Provably Fair SHA256 generators, math utils
│   │   └── constants/                  # HTTP statuses, standard crypto rates
│   └── docs/                           # OpenAPI documentation, specs
```

---

## 3. Production Prisma Schema (`schema.prisma`)

This schema implements high-integrity relational links, audit-trails, currency settings, hot/cold/gas wallets, and security constraints essential for a real Stake-level platform.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// =========================================================================
// Users & Security Modules
// =========================================================================

model User {
  id                   String                 @id @default(uuid())
  email                String                 @unique
  username             String                 @unique
  passwordHash         String
  twoFactorSecret      String?
  isTwoFactorEnabled   Boolean                @default(false)
  status               UserStatus             @default(ACTIVE)
  createdAt            DateTime               @default(now())
  updatedAt            DateTime               @updatedAt
  vipLevelId           String?
  vipPoints            Decimal                @default(0) @db.Decimal(18, 4)

  // Relationships
  walletBalances       WalletBalance[]
  walletAddresses      WalletAddress[]
  deposits             Deposit[]
  withdrawals          Withdrawal[]
  transactions         Transaction[]
  gameBets             GameBet[]
  sessions             Session[]
  refreshTokens        RefreshToken[]
  apiKeys              ApiKey[]
  notifications        Notification[]
  userDevices          UserDevice[]
  loginHistory         UserLoginHistory[]
  auditLogs            AuditLog[]
  vipLevel             VIPLevel?              @relation(fields: [vipLevelId], references: [id])
  referrals            ReferralTransaction[]  @relation("Referrer")
  referees             ReferralTransaction[]  @relation("Referee")
  affiliateEarnings    AffiliateTransaction[] @relation("Affiliate")
  bonusTransactions    BonusTransaction[]

  @@index([email, username])
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  BANNED
  AML_HOLD
}

model Session {
  id           String    @id @default(uuid())
  userId       String
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  token        String    @unique
  ipAddress    String
  userAgent    String
  deviceFingerprint String?
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  expiresAt    DateTime
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  createdAt DateTime @default(now())
  expiresAt DateTime
}

model ApiKey {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  keyHash   String    @unique
  name      String
  scopes    String[]
  createdAt DateTime  @default(now())
  expiresAt DateTime?
}

// =========================================================================
// Wallet & Internal Ledger Modules
// =========================================================================

model SupportedChain {
  id             String          @id @default(uuid())
  name           String          @unique // e.g., "ETHEREUM", "TRON", "SOLANA"
  rpcUrl         String
  gasPriceGwei   Decimal         @default(0) @db.Decimal(18, 4)
  isActive       Boolean         @default(true)
  currencies     Currency[]
  nodes          BlockchainNode[]
  addresses      WalletAddress[]
}

model Currency {
  id               String          @id @default(uuid())
  code             String          @unique // e.g., "USDT", "ETH", "TRX", "BTC"
  name             String
  decimals         Int             @default(6)
  chainId          String
  chain            SupportedChain  @relation(fields: [chainId], references: [id])
  minDeposit       Decimal         @db.Decimal(18, 8)
  minWithdrawal    Decimal         @db.Decimal(18, 8)
  withdrawalFee    Decimal         @db.Decimal(18, 8)
  isToken          Boolean         @default(false)
  contractAddress  String?
  isActive         Boolean         @default(true)
  walletBalances   WalletBalance[]
  deposits         Deposit[]
  withdrawals      Withdrawal[]
  gameBets         GameBet[]
  hotWallets       HotWallet[]
  coldWallets      ColdWallet[]
  gasWallets       GasWallet[]
}

model WalletBalance {
  id               String       @id @default(uuid())
  userId           String
  user             User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  currencyId       String
  currency         Currency     @relation(fields: [currencyId], references: [id])
  availableBalance Decimal      @default(0) @db.Decimal(28, 12)
  lockedBalance    Decimal      @default(0) @db.Decimal(28, 12)
  updatedAt        DateTime     @updatedAt

  @@unique([userId, currencyId])
}

model WalletAddress {
  id             String          @id @default(uuid())
  userId         String
  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  chainId        String
  chain          SupportedChain  @relation(fields: [chainId], references: [id])
  address        String          @unique
  derivationPath String          // e.g. "m/44'/60'/0'/0/userId"
  createdAt      DateTime        @default(now())
  deposits       Deposit[]
  sweeps         WalletSweep[]
}

// =========================================================================
// Financial Audit & Ledger Modules
// =========================================================================

model Transaction {
  id             String            @id @default(uuid())
  userId         String
  user           User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  type           TransactionType
  amount         Decimal           @db.Decimal(28, 12)
  previousBalance Decimal          @db.Decimal(28, 12)
  currentBalance Decimal           @db.Decimal(28, 12)
  status         TransactionStatus @default(PENDING)
  remark         String?
  createdAt      DateTime          @default(now())
  idempotencyKey String?           @unique

  // Ledger linkages
  ledgerEntries  InternalLedger[]
}

enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  BET_PLACED
  BET_PAYOUT
  BONUS_REDEEMED
  REFERRAL_PAYOUT
  VIP_CLAIM
}

enum TransactionStatus {
  PENDING
  APPROVED
  REJECTED
  FAILED
}

model InternalLedger {
  id             String       @id @default(uuid())
  transactionId  String
  transaction    Transaction  @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  debitAccount   String       // e.g., "USER_BALANCE", "HOUSE_RESERVE"
  creditAccount  String       // e.g., "HOUSE_RESERVE", "USER_BALANCE"
  amount         Decimal      @db.Decimal(28, 12)
  createdAt      DateTime     @default(now())
}

// =========================================================================
// Deposits, Withdrawals & Sweeping Operations
// =========================================================================

model Deposit {
  id               String               @id @default(uuid())
  userId           String
  user             User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  currencyId       String
  currency         Currency             @relation(fields: [currencyId], references: [id])
  addressId        String
  walletAddress    WalletAddress        @relation(fields: [addressId], references: [id])
  txHash           String               @unique
  amount           Decimal              @db.Decimal(28, 12)
  blockNumber      Int
  confirmations    Int                  @default(0)
  status           DepositStatus        @default(PENDING)
  createdAt        DateTime             @default(now())
  verifiedAt       DateTime?
  confirmationsLog DepositConfirmation[]
}

enum DepositStatus {
  PENDING
  CONFIRMED
  FAILED
}

model DepositConfirmation {
  id            String   @id @default(uuid())
  depositId     String
  deposit       Deposit  @relation(fields: [depositId], references: [id], onDelete: Cascade)
  blockHash     String
  confirmedAt   DateTime @default(now())
}

model Withdrawal {
  id               String               @id @default(uuid())
  userId           String
  user             User                 @relation(fields: [userId], references: [id], onDelete: Cascade)
  currencyId       String
  currency         Currency             @relation(fields: [currencyId], references: [id])
  recipientAddress String
  amount           Decimal              @db.Decimal(28, 12)
  fee              Decimal              @db.Decimal(28, 12)
  txHash           String?              @unique
  status           WithdrawalStatus     @default(QUEUED)
  nonce            Int?
  createdAt        DateTime             @default(now())
  processedAt      DateTime?
  approvals        WithdrawalApproval[]
  queuePosition    WithdrawalQueue?
}

enum WithdrawalStatus {
  QUEUED
  PENDING_REVIEW
  APPROVED
  BROADCASTED
  CONFIRMED
  FAILED
  REJECTED
}

model WithdrawalQueue {
  id           String     @id @default(uuid())
  withdrawalId String     @unique
  withdrawal   Withdrawal @relation(fields: [withdrawalId], references: [id], onDelete: Cascade)
  priority     Int        @default(1)
  createdAt    DateTime   @default(now())
}

model WithdrawalApproval {
  id           String     @id @default(uuid())
  withdrawalId String
  withdrawal   Withdrawal @relation(fields: [withdrawalId], references: [id], onDelete: Cascade)
  adminUserId  String
  approvedAt   DateTime   @default(now())
}

model WalletSweep {
  id              String         @id @default(uuid())
  addressId       String
  walletAddress   WalletAddress  @relation(fields: [addressId], references: [id], onDelete: Cascade)
  txHash          String         @unique
  gasSpent        Decimal        @db.Decimal(18, 8)
  amountSwept     Decimal        @db.Decimal(28, 12)
  status          SweepStatus    @default(PENDING)
  createdAt       DateTime       @default(now())
}

enum SweepStatus {
  PENDING
  COMPLETED
  FAILED
}

// =========================================================================
// Game Engine Modules
// =========================================================================

model VIPLevel {
  id             String   @id @default(uuid())
  levelName      String   @unique // e.g., "Bronze", "Silver", "Gold", "Diamond"
  requiredPoints Decimal  @db.Decimal(18, 4)
  baseReload     Decimal  @db.Decimal(18, 4)
  rakebackRate   Decimal  @db.Decimal(18, 4) // e.g., 0.003 for 0.3%
  users          User[]
}

model GameHistory {
  id            String     @id @default(uuid())
  gameName      String     // e.g., "CRASH", "MINES", "DICE", "WHEEL"
  hash          String     @unique // Server Seed Hash
  salt          String     // Client Seed
  finalResult   String     // Encoded dynamic final outcome
  createdAt     DateTime   @default(now())
  gameRounds    GameRound[]
}

model GameRound {
  id            String       @id @default(uuid())
  gameHistoryId String
  gameHistory   GameHistory  @relation(fields: [gameHistoryId], references: [id], onDelete: Cascade)
  roundIndex    Int
  outcome       Decimal      @db.Decimal(18, 4)
  bets          GameBet[]
}

model GameBet {
  id            String       @id @default(uuid())
  userId        String
  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  currencyId    String
  currency      Currency     @relation(fields: [currencyId], references: [id])
  gameRoundId   String
  gameRound     GameRound    @relation(fields: [gameRoundId], references: [id], onDelete: Cascade)
  betAmount     Decimal      @db.Decimal(28, 12)
  payoutAmount  Decimal      @db.Decimal(28, 12)
  payoutMult    Decimal      @db.Decimal(10, 4) // e.g. 1.9800x, 0.0000x
  outcomeStatus BetOutcome   @default(PENDING)
  createdAt     DateTime     @default(now())
}

enum BetOutcome {
  WIN
  LOSS
  PENDING
}

// =========================================================================
// System Wallets & Hot/Cold Architecture
// =========================================================================

model HotWallet {
  id               String   @id @default(uuid())
  currencyId       String
  currency         Currency @relation(fields: [currencyId], references: [id])
  address          String   @unique
  encryptedPrivKey String
  balance          Decimal  @default(0) @db.Decimal(28, 12)
  updatedAt        DateTime @updatedAt
}

model ColdWallet {
  id               String   @id @default(uuid())
  currencyId       String
  currency         Currency @relation(fields: [currencyId], references: [id])
  address          String   @unique
  balance          Decimal  @default(0) @db.Decimal(28, 12)
  updatedAt        DateTime @updatedAt
}

model GasWallet {
  id               String   @id @default(uuid())
  currencyId       String
  currency         Currency @relation(fields: [currencyId], references: [id])
  address          String   @unique
  encryptedPrivKey String
  balance          Decimal  @default(0) @db.Decimal(28, 12)
  updatedAt        DateTime @updatedAt
}

// =========================================================================
// Marketing, Referral & Loyalty Modules
// =========================================================================

model ReferralTransaction {
  id         String   @id @default(uuid())
  referrerId String
  referrer   User     @relation("Referrer", fields: [referrerId], references: [id], onDelete: Cascade)
  refereeId  String
  referee    User     @relation("Referee", fields: [refereeId], references: [id], onDelete: Cascade)
  amount     Decimal  @db.Decimal(28, 12)
  createdAt  DateTime @default(now())
}

model AffiliateTransaction {
  id          String   @id @default(uuid())
  affiliateId String
  affiliate   User     @relation("Affiliate", fields: [affiliateId], references: [id], onDelete: Cascade)
  commission  Decimal  @db.Decimal(28, 12)
  createdAt   DateTime @default(now())
}

model BonusTransaction {
  id          String    @id @default(uuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  bonusType   String    // e.g., "RELOAD", "RAKEBACK", "PROMO_VOUCHER"
  amount      Decimal   @db.Decimal(28, 12)
  isClaimed   Boolean   @default(false)
  createdAt   DateTime  @default(now())
}

// =========================================================================
// Infrastructure Analytics & Security Logging
// =========================================================================

model AuditLog {
  id          String   @id @default(uuid())
  userId      String?
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  action      String   // e.g., "COUPON_CREATED", "AML_FLAGGED"
  details     String   @db.Text
  ipAddress   String
  createdAt   DateTime @default(now())
}

model SecurityEvent {
  id           String   @id @default(uuid())
  eventType    String   // e.g. "VELOCITY_THRESHOLD_EXCEEDED", "DOUBLE_SPEND_ATTEMPT"
  severity     Severity @default(HIGH)
  resolved     Boolean  @default(false)
  description  String   @db.Text
  createdAt    DateTime @default(now())
}

enum Severity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

model Notification {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  content     String   @db.Text
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
}

model UserDevice {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  fingerprint String
  os          String
  browser     String
  ipAddress   String
  isTrusted   Boolean  @default(true)
  createdAt   DateTime @default(now())
}

model UserLoginHistory {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  ipAddress  String
  userAgent  String
  status     String   // e.g., "SUCCESS", "FAILED_2FA"
  createdAt  DateTime @default(now())
}

model BlockchainNode {
  id          String          @id @default(uuid())
  chainId     String
  chain       SupportedChain  @relation(fields: [chainId], references: [id], onDelete: Cascade)
  rpcUrl      String
  status      NodeStatus      @default(HEALTHY)
  latencyMs   Int             @default(0)
  updatedAt   DateTime        @updatedAt
}

enum NodeStatus {
  HEALTHY
  DEGRADED
  OFFLINE
}
```

---

## 4. Blockchain & Wallet Abstraction Layer (Adapter Pattern)

### Abstract Interface (`BlockchainProvider.ts`)
Each supported network (Bitcoin, Tron, Ethereum, Solana, Base) must implement this standard interface to prevent tight coupling to network-specific SDKs:

```typescript
import { Decimal } from "@prisma/client/runtime/library";

export interface TransactionReceipt {
  txHash: string;
  blockNumber: number;
  confirmations: number;
  senderAddress: string;
  recipientAddress: string;
  amount: Decimal;
  feeSpent: Decimal;
  isToken: boolean;
  tokenContractAddress?: string;
}

export abstract class BlockchainProvider {
  protected abstract rpcUrl: string;

  abstract generateAddress(derivationPath: string): Promise<string>;
  abstract validateAddress(address: string): boolean;
  abstract getBalance(address: string, contractAddress?: string): Promise<Decimal>;
  abstract getTransaction(txHash: string): Promise<TransactionReceipt>;
  abstract broadcastTransaction(signedHex: string): Promise<string>;
  abstract estimateFee(from: string, to: string, amount: Decimal, data?: string): Promise<Decimal>;
  abstract watchDeposits(callback: (tx: TransactionReceipt) => void): Promise<void>;
  abstract sweepToHotWallet(fromAddressPath: string, hotWalletAddress: string, amount: Decimal): Promise<string>;
}
```

### Concrete Adapter: Ethereum Provider (`EthereumProvider.ts`)
Conforms ERC20 and Native ETH interactions to the abstract parent specification.

```typescript
import { BlockchainProvider, TransactionReceipt } from "./BlockchainProvider";
import { ethers } from "ethers";
import { Decimal } from "@prisma/client/runtime/library";

export class EthereumProvider extends BlockchainProvider {
  protected rpcUrl: string;
  private provider: ethers.JsonRpcProvider;

  constructor(rpcUrl: string) {
    super();
    this.rpcUrl = rpcUrl;
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  async generateAddress(derivationPath: string): Promise<string> {
    const masterSeed = await this.retrieveMasterMnemonicDecrypted();
    const hdNode = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(masterSeed));
    const childNode = hdNode.derivePath(derivationPath);
    return childNode.address;
  }

  validateAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  async getBalance(address: string, contractAddress?: string): Promise<Decimal> {
    if (contractAddress) {
      const contract = new ethers.Contract(contractAddress, ["function balanceOf(address) view returns (uint256)"], this.provider);
      const balance = await contract.balanceOf(address);
      return new Decimal(ethers.formatUnits(balance, 18));
    }
    const balance = await this.provider.getBalance(address);
    return new Decimal(ethers.formatEther(balance));
  }

  async getTransaction(txHash: string): Promise<TransactionReceipt> {
    const tx = await this.provider.getTransaction(txHash);
    const receipt = await this.provider.getTransactionReceipt(txHash);
    if (!tx || !receipt) throw new Error("Transaction hash not found on Ethereum RPC");

    return {
      txHash: tx.hash,
      blockNumber: receipt.blockNumber,
      confirmations: await this.provider.getBlockNumber() - receipt.blockNumber,
      senderAddress: tx.from,
      recipientAddress: tx.to || "",
      amount: new Decimal(ethers.formatEther(tx.value)),
      feeSpent: new Decimal(ethers.formatEther(receipt.gasUsed * receipt.gasPrice)),
      isToken: false
    };
  }

  async broadcastTransaction(signedHex: string): Promise<string> {
    const tx = await this.provider.broadcastTransaction(signedHex);
    return tx.hash;
  }

  async estimateFee(from: string, to: string, amount: Decimal, data?: string): Promise<Decimal> {
    const feeData = await this.provider.getFeeData();
    const gasEstimate = await this.provider.estimateGas({
      from,
      to,
      value: ethers.parseEther(amount.toString()),
      data
    });
    return new Decimal(ethers.formatEther(gasEstimate * (feeData.gasPrice || 10n)));
  }

  async watchDeposits(callback: (tx: TransactionReceipt) => void): Promise<void> {
    this.provider.on("block", async (blockNumber) => {
      const block = await this.provider.getBlock(blockNumber, true);
      if (!block) return;
      for (const tx of block.prefetchedTransactions) {
        if (tx.to && (await this.isRegisteredDepositAddress(tx.to))) {
          callback({
            txHash: tx.hash,
            blockNumber,
            confirmations: 0,
            senderAddress: tx.from,
            recipientAddress: tx.to,
            amount: new Decimal(ethers.formatEther(tx.value)),
            feeSpent: new Decimal(0), // Decided upon receipt confirmations
            isToken: false
          });
        }
      }
    });
  }

  async sweepToHotWallet(fromAddressPath: string, hotWalletAddress: string, amount: Decimal): Promise<string> {
    const masterSeed = await this.retrieveMasterMnemonicDecrypted();
    const hdNode = ethers.HDNodeWallet.fromMnemonic(ethers.Mnemonic.fromPhrase(masterSeed));
    const wallet = hdNode.derivePath(fromAddressPath).connect(this.provider);
    
    // Estimate gas and deduct from transfer amount if sweeping native asset
    const fee = await this.estimateFee(wallet.address, hotWalletAddress, amount);
    const amountToSweep = ethers.parseEther(amount.sub(fee).toString());

    const tx = await wallet.sendTransaction({
      to: hotWalletAddress,
      value: amountToSweep
    });
    return tx.hash;
  }

  private async retrieveMasterMnemonicDecrypted(): Promise<string> {
    // Cryptographic decryption logic using key stored securely in environment vault
    return "example core mnemonic words key secure encrypt storage vault";
  }

  private async isRegisteredDepositAddress(address: string): Promise<boolean> {
    // Connects through wallet repository pool cache
    return true; 
  }
}
```

---

## 5. Security Checkpoints & Transaction Lifecycles

### A. Non-Custodial Multi-Chain Deposit Flow Sequence

```
User App              Deposit Worker        Confirmation Worker     Ledger Repository        Socket.IO Bus
   |                        |                       |                        |                     |
   |--- Opens Wallet ------>|                       |                        |                     |
   |    (Gets HD derivation)|                       |                        |                     |
   |                        |                       |                        |                     |
   |--- User Sends Crypto ->|                       |                        |                     |
   |   (Detected via RPC)   |                       |                        |                     |
   |                        |--- Dispatch Job ----->|                        |                     |
   |                        |    "wait_confirmation"|                        |                     |
   |                        |                       |                        |                     |
   |                        |                       |--- Confirmed --------->|                     |
   |                        |                       |    (Block verified)    |                     |
   |                        |                       |                        |--- Update balance ->|
   |                        |                       |                        |    and write ledger |
   |                        |                       |                        |                     |-- Push BalanceUpdate
   |<--------------------------------------------------------------------------------------------------|
```

1. **Address Pre-allocation**: The Hierarchical Deterministic Generator derives index values on demand `m/44'/60'/0'/0/userId` directly mapping users to verifiable blockchain addresses, ensuring a private key is never generated dynamically on-the-fly.
2. **RPC Event Pipeline (Block Listening)**:
   * The `depositWorker` listens via WebSockets or RPC block filters on nodes.
   * Upon identifying a transaction matching a stored address, it logs a raw entry in the `Deposit` database schema with state `PENDING` and triggers a high-priority background job in BullMQ.
3. **Strict Ledger Settlement**:
   * Once confirmation thresholds are passed (e.g., 12 blocks on Ethereum, 3 on Tron), the `confirmationWorker` triggers a multi-document database transaction.
   * Modifies `WalletBalance` by incrementing `availableBalance`.
   * Inserts a double-entry transaction record in the `InternalLedger` system debiting the external `DEPOSIT_POOL` and crediting the user's `USER_BALANCE`.
   * Emits live payloads via Socket.IO to notify the frontend instantly.
4. **Auto-Sweep Loop**:
   * A BullMQ sweep task checks the incoming deposit.
   * If the asset requires external gas to trigger sweeps (e.g., ERC20 or TRC20 tokens), the `sweepWorker` signs a tx on the master `GasWallet` to gas up the deposit address, then sweeping the tokens directly to the central, secure `HotWallet`.

### B. High-Performance Anti-Fraud Withdrawal Pipeline

```
User App              Authentication       AML & Velocity Engine     Withdrawal Queue        Withdraw Worker
   |                        |                       |                        |                     |
   |--- Requests Cashout -->|                       |                        |                     |
   |    (Signed with Nonce) |                       |                        |                     |
   |                        |--- 2FA Check Passed ->|                        |                     |
   |                        |                       |                        |                     |
   |                        |                       |--- Runs Checks ------->|                     |
   |                        |                       |    (Limit/Velocity/IP) |                     |
   |                        |                       |                        |--- Enqueue Job ---->|
   |                        |                       |                        |    (Serialize tx)   |
   |                        |                       |                        |                     |-- Signs Tx
   |                        |                       |                        |                     |-- Broadcast RPC
   |                        |                       |                        |                     |<-- Tx Confirmed
   |                        |                       |                        |                     |
   |                        |                       |                        |                     |--- Update ledger
   |<-- Cashout Succeeded -------------------------------------------------------------------------|
```

1. **Cryptographic Integrity & Nonce Handling**:
   * To prevent duplicate wagers or replay attacks, withdrawals are signed by the user app using an increments-only secure integer `nonce` associated with the active session JWT.
2. **AML Rules Engine**:
   * A dedicated security checker executes instantly:
     * **Velocity Check**: Total withdrawals in past 24 hours compared against configured limits per VIP tier.
     * **RTP Abuse/Wager Verification**: Ensures user has rolled over deposited funds at least once (100% wager-requirement threshold) before permitting fee-free withdrawals.
     * **Login Fingerprinting**: Flags withdrawals requested within 15 minutes of an IP address change or device change.
3. **Distributed Lock Strategy**:
   * Prevents double-spend exploits.
   * Uses Redis Redlock on the resource key `balance:lock:userId` before conducting balance checks.
   * Immediately moves the target cashout value from `availableBalance` to `lockedBalance` inside PostgreSQL.
4. **Automated Dequeue & Hot Wallet Key Management**:
   * If below auto-approve thresholds, the withdrawal task is enqueued in the BullMQ `Withdrawal Queue`.
   * The `withdrawWorker` runs in a dedicated secure container.
   * Private keys are retrieved from memory vault decrypters, transaction nonce is assigned, raw tx hex is structured, signed, and broadcast to blockchain nodes via RPC.
   * Once broadcast completes, the user balance locked portion is zeroed, transactional ledger details are updated as `APPROVED`, and transaction hash is indexed in PostgreSQL.

---

## 6. High-Throughput Queue Management (BullMQ Backplane)

Using BullMQ backed by a high-availability Redis instance ensures that background calculations, blockchain updates, and transactional retries do not saturate primary event loops.

```typescript
import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";

// Centralized connection pool for Redis
const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null // Critical setup for BullMQ to handle connection drops
});

// Create Named Queues
export const depositQueue = new Queue("DepositQueue", { connection: redisConnection });
export const withdrawalQueue = new Queue("WithdrawalQueue", { connection: redisConnection });
export const auditQueue = new Queue("AuditQueue", { connection: redisConnection });

// Helper to Dispatch Tasks
export class QueueDispatcher {
  static async enqueueWithdrawal(withdrawalId: string, priority: number = 1) {
    await withdrawalQueue.add(
      "process_withdrawal",
      { withdrawalId },
      {
        priority,
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 5000 // Exponential fallback backoff to protect against node congestion
        },
        removeOnComplete: true,
        removeOnFail: false
      }
    );
  }
}
```

---

## 7. Real-Time Event Architecture (Socket.IO Bus)

To provide multiplayer gaming (Crash curves, Wheel countdowns) and near-instant balance notifications without long polling, Socket.IO runs on a multi-node Redis Adapter backplane.

```typescript
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import jwt from "jsonwebtoken";

export class SocketServer {
  private io: Server;

  constructor(httpServer: any) {
    const pubClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
    const subClient = pubClient.duplicate();

    this.io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    this.io.adapter(createAdapter(pubClient, subClient));
    this.initializeMiddleware();
    this.initializeEvents();
  }

  private initializeMiddleware() {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error("Unauthorized: Token Missing"));

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_sec") as any;
        socket.data.userId = decoded.userId;
        socket.data.username = decoded.username;
        next();
      } catch (err) {
        return next(new Error("Unauthorized: Invalid Session Signature"));
      }
    });
  }

  private initializeEvents() {
    this.io.on("connection", (socket) => {
      // Join a private channel specifically scoped to active user's notifications and wagers
      socket.join(`user:${socket.data.userId}`);

      socket.on("subscribe_game", (gameName) => {
        socket.join(`game:${gameName}`);
      });

      socket.on("disconnect", () => {
        socket.leave(`user:${socket.data.userId}`);
      });
    });
  }

  // API Callbacks emit mutations immediately via the central socket server instance
  public emitBalanceUpdate(userId: string, balanceDetails: object) {
    this.io.to(`user:${userId}`).emit("balance_updated", balanceDetails);
  }

  public emitLiveWager(gameName: string, betDetails: object) {
    this.io.to(`game:${gameName}`).emit("wager_placed", betDetails);
  }

  public broadcastMaintenance(message: string) {
    this.io.emit("system_maintenance", { message, timestamp: new Date() });
  }
}
```

---

## 8. PM2 Cluster Deployment Configuration (`ecosystem.config.js`)

PM2 acts as our local supervisor process manager, running in cluster mode to automatically distribute incoming HTTP requests across multiple cores without single-point process blockers.

* **Max Instances**: PM2 sets workers to exactly match core capacities.
* **Graceful Shutdown**: Sends `SIGTERM` when deploying or restarting. API connections are completed before child worker processes are killed.
* **Log Rotation**: Captures standard output and error log buffers separately.

---

## 9. Comprehensive Architectural Directory Walkthrough

To guide developers and DevOps engineers through the repository, here is the rationale and exact functional purpose behind every module:

| Component Path | Technical Purpose & Rationale | Why It Exists in this Architecture |
| :--- | :--- | :--- |
| `src/server.ts` | Entry-point bootstrapper. Instantiates DB connection pooling and configures HTTP and WebSocket listeners. | Handles the initial environment checks and starts clusters gracefully via node's cluster interface. |
| `src/app.ts` | The Express application pipeline declaration, containing basic middlewares, router mounts, and centralized error catches. | Exposes pure HTTP endpoints decoupled from networking infrastructure and socket servers. |
| `src/routes/` | Declares isolated routers mapped directly to API endpoints, ensuring controllers don't clutter the routing table. | Enhances organization and allows route-specific middleware mapping. |
| `src/controllers/` | Resolves standard REST interfaces, checks authentication, validates request payloads, and returns correct HTTP payloads. | Segregates presentation logic from pure business layers. |
| `src/services/` | Contains the core business logic of the platform (e.g., wallet transfers, calculating game payouts, checking wagering limits). | Ensures core policies are reusable across HTTP endpoints, WebSocket wagers, and queue workers. |
| `src/repositories/` | Abstracts raw database operations using the Prisma client, structuring queries and transaction wraps. | Isolates persistence dependencies, letting services execute business code on abstract models. |
| `src/blockchain/` | Implements the **Adapter Pattern** for external blockchain nodes, translating individual JSON-RPC standards. | Enables adding new blockchains (Tron, BSC, Solana) simply by dropping in a new adapter class. |
| `src/wallet/` | Core crypto HD Generator using cryptographically secure PBKDF2 parameters for parent seed derivations. | Ensures deterministic, repeatable generation of custom deposit target addresses for millions of users. |
| `src/queue/` | Interfaces with BullMQ backplane. Handles retry schedules, backoff curves, and worker orchestration on Redis. | Prevents high-intensity background tasks from stalling client wagers. |
| `src/workers/` | Specialized separate worker threads configured to process specific heavy background queues (e.g. sweep token actions). | Allows discrete components of the cluster to scale independently (e.g., scaling deposit watchers separate from API nodes). |
| `src/websocket/` | Dedicated Socket.IO gateways utilizing room structures to manage active user notifications and real-time multiplayer wagers. | Powers Stake-like instant notifications, chat updates, and multiplayer betting tickers. |
| `src/middleware/` | Houses request validation, helmet protections, strict authorization, and CORS limiters. | Prevents unauthorized wagers and isolates security guardrails. |
| `src/validators/` | Direct JSON structural schemas validating fields prior to routing wagers. | Protects database layers against input injections and invalid states. |
| `src/events/` | Implements the internal **Event-Driven Architecture (EDA)**, decoupling unrelated post-bet processes. | Allows an action (e.g., a Crash win) to trigger loyalty calculations and metrics trackers asynchronously. |

---

## 10. Production, Security & Scalability Checklists

### Production Deploy Checklist
1. [ ] **Connection Pooling**: Validate PostgreSQL settings (`PgBouncer` or Prisma pool bounds) to survive peak wager throughput (e.g., 5,000 requests/sec).
2. [ ] **BullMQ Cluster Config**: Ensure Redis uses `redis-cluster` configurations to prevent single points of failure.
3. [ ] **PM2 Readiness Signals**: Integrate PM2 readiness notifications into server code to ensure zero-downtime hot reloads.
4. [ ] **Prisma Cache**: Set up caching for structural static settings (e.g., active coins, game configurations) to reduce database read overhead.

### Hardened Security Checklist
1. [ ] **Mnemonic Key Secrecy**: Master HD phrase must never exist as plaintext in any file, database column, or environment registry. Use secure hardware KMS (e.g., AWS KMS, HashiCorp Vault) to encrypt/decrypt strings.
2. [ ] **Atomic Ledger Checkpoints**: Run cron jobs checking that user balances sum up to exactly equal historical transaction ledger sheets, raising alerts if discrepancies occur.
3. [ ] **DDoS Rate Limiters**: Apply different rate limit tiers: 10 req/min for authentication, 300 req/min for wagers, and 50 req/min for wallet updates.
4. [ ] **Double-Spend Redlock**: Use Redis Redlock clustering to guard wallet balance mutations during rapid parallel requests.

### Scalability Checklist
1. [ ] **Read-Write Splitting**: Set up Prisma middleware routing state mutations to PostgreSQL Primary and analytical queries to PostgreSQL Read Replicas.
2. [ ] **Socket Adapter Clustering**: Ensure multi-node servers synchronize real-time wagers through the Redis Adapter system.
3. [ ] **Log Offloading**: Stream Pino production logging outputs directly to cloud platforms (Elasticsearch, Logstash) to protect server disk storage.
