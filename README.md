# NoRiskPot - Zero-Loss Lottery on SEI Network

NoRiskPot is a zero-loss lottery built on the SEI Testnet blockchain. Players can participate by purchasing tickets with SEI tokens and are guaranteed to get their initial investment back. The lottery operates by generating interest from the ticket pool, which is then distributed as prizes to the winners.

## Key Features

- **Zero-Loss Guarantee**: All participants get their ticket cost refunded after the draw.
- **Prize Pool**: Interest earned on the ticket pool funds the prizes.
- **Secure & Transparent**: Fully on-chain lottery with transparent drawing mechanism.
- **SEI Token Integration**: Built on SEI Testnet with native SEI token support.
- **Admin Controls**: Token management features for SEI token.

## Technical Stack

- **Blockchain**: SEI Testnet EVM
- **Smart Contracts**: Solidity
- **Development Framework**: Hardhat
- **Frontend**: React.js
- **Web3 Integration**: ethers.js

## Setup & Installation

### Prerequisites

- Node.js (>= 14.x)
- npm or yarn
- MetaMask wallet

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/rahul-rathore786/No_Risk_Pot_sei_final
   cd No_Risk_Pot_sei_final
   ```

2. Install dependencies:

   ```
   npm install
   cd frontend
   npm install
   cd ..
   ```

3. Create a `.env` file in the root directory based on `.env.example`:
   ```
   PRIVATE_KEY=your_wallet_private_key_here
   SEI_TESTNET_RPC_URL=https://evm-rpc-testnet.sei-apis.com
   ```

### Deploying the Contracts

1. Deploy the contracts to SEI Testnet:
   ```
   npm run deploy
   ```

### Running the Application

1. Start the frontend development server:

   ```
   npm start
   ```

2. Open your browser and navigate to http://localhost:3000

## Network Configuration

To interact with the NoRiskPot dApp, you'll need to configure your MetaMask wallet for SEI Testnet:

- **Network Name**: SEI Testnet
- **RPC URL**: https://evm-rpc-testnet.sei-apis.com
- **Chain ID**: 1328
- **Currency Symbol**: SEI
- **Block Explorer URL**: https://seitrace.com

## Smart Contracts

- **SeiToken.sol**: ERC20 token implementation for SEI
- **ZeroLossLottery.sol**: Zero-loss lottery implementation

## Usage

1. **Connect Wallet**: Connect your MetaMask wallet to the application.
2. **Buy Tickets**: Purchase lottery tickets using SEI tokens.
3. **Wait for Draw**: Admin will add interest to the pool and draw winners.
4. **Claim Funds**: After the draw, claim your refund and any prizes you've won.

## Admin Functions

1. **Mint Tokens**: Admin can mint SEI tokens to any address.
2. **Transfer Tokens**: Admin can transfer SEI tokens to participants.
3. **Add Interest**: Add interest to the lottery pool.
4. **Draw Winners**: Select winners based on a random seed.
5. **Claim Platform Fee**: Claim platform fee and reset the lottery.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
