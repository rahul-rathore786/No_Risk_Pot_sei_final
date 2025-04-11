import React, { useState } from "react";
import { ethers } from "ethers";
import "../styles/AdminPanel.css";

function AdminPanel({
  lotteryContract,
  seiContract,
  lotteryData,
  refreshData,
  parseSei,
}) {
  const [interestPercentage, setInterestPercentage] = useState(10);
  const [randomSeed, setRandomSeed] = useState(
    Math.floor(Math.random() * 1000000)
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Token management state
  const [mintAmount, setMintAmount] = useState(100);
  const [mintAddress, setMintAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState(10);
  const [transferAddress, setTransferAddress] = useState("");

  const handleInterestChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 100) {
      setInterestPercentage(value);
    }
  };

  const handleRandomSeedChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setRandomSeed(value);
    }
  };

  const handleAddInterest = async () => {
    if (!lotteryContract || !seiContract) return;

    setLoading(true);
    setMessage({ text: "Adding interest...", type: "info" });

    try {
      const totalInterestAmount =
        (lotteryData.totalTickets * interestPercentage) / 100;
      const amountToApprove = parseSei(totalInterestAmount);

      // First approve SEI
      const approveTx = await seiContract.approve(
        lotteryContract.address,
        amountToApprove
      );
      await approveTx.wait();

      // Then add interest
      const tx = await lotteryContract.addInterest(interestPercentage);
      await tx.wait();

      setMessage({ text: "Interest added successfully!", type: "success" });
      refreshData();
    } catch (error) {
      console.error("Error adding interest:", error);
      setMessage({
        text: "Failed to add interest. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDrawWinners = async () => {
    if (!lotteryContract) return;

    setLoading(true);
    setMessage({ text: "Drawing winners...", type: "info" });

    try {
      const tx = await lotteryContract.drawWinners(randomSeed);
      await tx.wait();

      setMessage({ text: "Winners drawn successfully!", type: "success" });
      refreshData();
    } catch (error) {
      console.error("Error drawing winners:", error);
      setMessage({
        text: "Failed to draw winners. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimPlatformFee = async () => {
    if (!lotteryContract) return;

    setLoading(true);
    setMessage({ text: "Claiming platform fee...", type: "info" });

    try {
      const tx = await lotteryContract.claimPlatformFee();
      await tx.wait();

      setMessage({
        text: "Platform fee claimed successfully!",
        type: "success",
      });
      refreshData();
    } catch (error) {
      console.error("Error claiming platform fee:", error);
      setMessage({
        text: "Failed to claim platform fee. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler for minting SEI tokens
  const handleMintTokens = async () => {
    if (!seiContract || !mintAddress || mintAmount <= 0) return;

    setLoading(true);
    setMessage({ text: "Minting SEI tokens...", type: "info" });

    try {
      // Check if address is valid
      if (!ethers.utils.isAddress(mintAddress)) {
        throw new Error("Invalid address format");
      }

      const amountToMint = parseSei(mintAmount);
      const tx = await seiContract.mint(mintAddress, amountToMint);
      await tx.wait();

      setMessage({
        text: `Successfully minted ${mintAmount} SEI to ${mintAddress}`,
        type: "success",
      });
      refreshData();
    } catch (error) {
      console.error("Error minting tokens:", error);
      setMessage({
        text: "Failed to mint tokens: " + (error.message || "Unknown error"),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler for transferring SEI tokens
  const handleTransferTokens = async () => {
    if (!seiContract || !transferAddress || transferAmount <= 0) return;

    setLoading(true);
    setMessage({ text: "Transferring SEI tokens...", type: "info" });

    try {
      // Check if address is valid
      if (!ethers.utils.isAddress(transferAddress)) {
        throw new Error("Invalid address format");
      }

      const amountToTransfer = parseSei(transferAmount);
      const tx = await seiContract.transfer(transferAddress, amountToTransfer);
      await tx.wait();

      setMessage({
        text: `Successfully transferred ${transferAmount} SEI to ${transferAddress}`,
        type: "success",
      });
      refreshData();
    } catch (error) {
      console.error("Error transferring tokens:", error);
      setMessage({
        text:
          "Failed to transfer tokens: " + (error.message || "Unknown error"),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel-container">
      <h1>Admin Panel</h1>

      <div className="admin-section">
        <h2>Lottery Status</h2>
        <div className="status-summary">
          <div className="status-item">
            <h3>Total Tickets</h3>
            <p>{lotteryData.totalTickets}</p>
          </div>

          <div className="status-item">
            <h3>Interest Pool</h3>
            <p>{parseFloat(lotteryData.interestPool).toFixed(2)} SEI</p>
          </div>

          <div className="status-item">
            <h3>Draw Status</h3>
            <p className={lotteryData.drawCompleted ? "completed" : "pending"}>
              {lotteryData.drawCompleted ? "Completed" : "Pending"}
            </p>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`admin-message ${message.type}`}>{message.text}</div>
      )}

      {/* Token Management Section */}
      <div className="admin-section">
        <h2>Token Management</h2>

        <div className="action-card">
          <h3>Mint SEI Tokens</h3>
          <p>Mint new SEI tokens to any address</p>

          <div className="input-group">
            <label htmlFor="mint-address">Recipient Address</label>
            <input
              type="text"
              id="mint-address"
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              placeholder="0x..."
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="mint-amount">Amount (SEI)</label>
            <input
              type="number"
              id="mint-amount"
              value={mintAmount}
              onChange={(e) => setMintAmount(parseFloat(e.target.value))}
              min="0.1"
              step="0.1"
              disabled={loading}
            />
          </div>

          <button
            className="admin-button mint-button"
            onClick={handleMintTokens}
            disabled={loading || !mintAddress || mintAmount <= 0}
          >
            {loading ? "Processing..." : "Mint Tokens"}
          </button>
        </div>

        <div className="action-card">
          <h3>Transfer SEI Tokens</h3>
          <p>Transfer SEI tokens from your account to any address</p>

          <div className="input-group">
            <label htmlFor="transfer-address">Recipient Address</label>
            <input
              type="text"
              id="transfer-address"
              value={transferAddress}
              onChange={(e) => setTransferAddress(e.target.value)}
              placeholder="0x..."
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="transfer-amount">Amount (SEI)</label>
            <input
              type="number"
              id="transfer-amount"
              value={transferAmount}
              onChange={(e) => setTransferAmount(parseFloat(e.target.value))}
              min="0.1"
              step="0.1"
              disabled={loading}
            />
          </div>

          <button
            className="admin-button transfer-button"
            onClick={handleTransferTokens}
            disabled={loading || !transferAddress || transferAmount <= 0}
          >
            {loading ? "Processing..." : "Transfer Tokens"}
          </button>
        </div>
      </div>

      <div className="admin-section">
        <h2>Lottery Actions</h2>

        {!lotteryData.drawCompleted ? (
          <>
            <div className="action-card">
              <h3>Add Interest</h3>
              <p>
                Add interest to the lottery pool as a percentage of the total
                ticket value.
              </p>

              <div className="input-group">
                <label htmlFor="interest-percentage">
                  Interest Percentage (%)
                </label>
                <input
                  type="number"
                  id="interest-percentage"
                  value={interestPercentage}
                  onChange={handleInterestChange}
                  min="1"
                  max="100"
                  disabled={loading || lotteryData.totalTickets === 0}
                />
              </div>

              <div className="action-info">
                <p>
                  Total Interest Amount:{" "}
                  {(
                    (lotteryData.totalTickets * interestPercentage) /
                    100
                  ).toFixed(2)}{" "}
                  SEI
                </p>
              </div>

              <button
                className="admin-button add-interest-button"
                onClick={handleAddInterest}
                disabled={loading || lotteryData.totalTickets === 0}
              >
                {loading ? "Processing..." : "Add Interest"}
              </button>

              {lotteryData.totalTickets === 0 && (
                <p className="warning-text">
                  Cannot add interest until tickets are sold.
                </p>
              )}
            </div>

            <div className="action-card">
              <h3>Draw Winners</h3>
              <p>Select lottery winners based on a random seed.</p>

              <div className="input-group">
                <label htmlFor="random-seed">Random Seed</label>
                <input
                  type="number"
                  id="random-seed"
                  value={randomSeed}
                  onChange={handleRandomSeedChange}
                  min="1"
                  disabled={
                    loading ||
                    lotteryData.interestPool <= 0 ||
                    lotteryData.totalTickets < 2
                  }
                />
              </div>

              <button
                className="admin-button draw-winners-button"
                onClick={handleDrawWinners}
                disabled={
                  loading ||
                  lotteryData.interestPool <= 0 ||
                  lotteryData.totalTickets < 2
                }
              >
                {loading ? "Processing..." : "Draw Winners"}
              </button>

              {lotteryData.interestPool <= 0 && (
                <p className="warning-text">
                  Cannot draw winners until interest is added.
                </p>
              )}

              {lotteryData.totalTickets < 2 && (
                <p className="warning-text">
                  Need at least 2 participants to draw winners.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="action-card">
            <h3>Claim Platform Fee</h3>
            <p>
              Claim the platform fee (20% of interest) and reset the lottery for
              the next round.
            </p>

            <div className="action-info">
              <p>
                Platform Fee Amount:{" "}
                {(parseFloat(lotteryData.interestPool) * 0.2).toFixed(2)} SEI
              </p>
            </div>

            <button
              className="admin-button claim-fee-button"
              onClick={handleClaimPlatformFee}
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : `Claim ${(parseFloat(lotteryData.interestPool) * 0.2).toFixed(
                    2
                  )} SEI & Reset`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;
