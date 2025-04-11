import React from "react";
import "../styles/SeiFaucetInfo.css";

function SeiFaucetInfo() {
  return (
    <div className="sei-faucet-container">
      <div className="sei-faucet-card">
        <h1>Welcome to NoRiskPot!</h1>
        <h2>Get SEI Tokens to Start Playing</h2>

        <div className="sei-intro-section">
          <p>
            To participate in our Zero-Loss Lottery, you'll need SEI tokens on
            the SEI Testnet.
          </p>
          <p>
            SEI tokens are used to buy lottery tickets, but don't worry - our
            lottery is zero-loss, so you'll always get your initial investment
            back!
          </p>
        </div>

        <div className="get-tokens-section">
          <h3>How to Get SEI Tokens:</h3>
          <ol className="steps-list">
            <li>
              <strong>Set up MetaMask for SEI Testnet</strong>
              <p>
                First, ensure your MetaMask wallet is connected to the SEI
                Testnet with these network settings:
              </p>
              <ul className="network-details">
                <li>
                  <span className="detail-label">Network Name:</span> SEI
                  Testnet
                </li>
                <li>
                  <span className="detail-label">RPC URL:</span>{" "}
                  https://evm-rpc-testnet.sei-apis.com
                </li>
                <li>
                  <span className="detail-label">Chain ID:</span> 1328
                </li>
                <li>
                  <span className="detail-label">Currency Symbol:</span> SEI
                </li>
                <li>
                  <span className="detail-label">Block Explorer:</span>{" "}
                  https://seitrace.com
                </li>
              </ul>
            </li>
            <li>
              <strong>Request Tokens from the Admin</strong>
              <p>
                Contact our admin to request SEI tokens for the testnet. The
                admin can mint and transfer tokens to your wallet address.
              </p>
            </li>
            <li>
              <strong>Verify Your Balance</strong>
              <p>
                Once you've received tokens, you'll see your SEI balance update
                in the top-right corner of the screen.
              </p>
            </li>
          </ol>
        </div>

        <div className="button-section">
          <button
            className="back-button"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>

          <a
            href="https://seitrace.com"
            target="_blank"
            rel="noopener noreferrer"
            className="explorer-button"
          >
            SEI Testnet Explorer
          </a>
        </div>

        <div className="info-footer">
          <p>
            Remember: This is a testnet application running on SEI Testnet. The
            tokens have no real-world value and are for testing only.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SeiFaucetInfo;
