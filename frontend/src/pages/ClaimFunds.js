import React, { useState } from "react";
import "../styles/ClaimFunds.css";

function ClaimFunds({ lotteryContract, lotteryData, refreshData }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleClaimFunds = async () => {
    if (!lotteryContract) return;

    setLoading(true);
    setMessage({ text: "Claiming funds...", type: "info" });

    try {
      const tx = await lotteryContract.claimFunds();
      await tx.wait();

      setMessage({ text: "Funds claimed successfully!", type: "success" });
      refreshData();
    } catch (error) {
      console.error("Error claiming funds:", error);
      setMessage({
        text: "Failed to claim funds. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePrize = () => {
    if (lotteryData.isWinner === 1) {
      // First place gets 50% of interest
      return (parseFloat(lotteryData.interestPool) * 0.5).toFixed(2);
    } else if (lotteryData.isWinner === 2) {
      // Second place gets 30% of interest
      return (parseFloat(lotteryData.interestPool) * 0.3).toFixed(2);
    }
    return "0.00";
  };

  const calculateRefund = () => {
    return lotteryData.userTickets.toString();
  };

  const renderClaimSection = () => {
    if (!lotteryData.drawCompleted) {
      return (
        <div className="message-card">
          <h2>Draw Not Completed</h2>
          <p>
            The lottery draw has not been completed yet. Please check back
            later.
          </p>
        </div>
      );
    }

    if (lotteryData.userTickets === 0) {
      return (
        <div className="message-card">
          <h2>No Tickets Purchased</h2>
          <p>You didn't purchase any tickets for this lottery round.</p>
        </div>
      );
    }

    if (lotteryData.hasClaimed) {
      return (
        <div className="message-card success">
          <h2>Funds Already Claimed</h2>
          <p>You have already claimed your funds for this lottery round.</p>
        </div>
      );
    }

    const refundAmount = calculateRefund();
    const prizeAmount = calculatePrize();
    const totalAmount = (
      parseFloat(refundAmount) + parseFloat(prizeAmount)
    ).toFixed(2);

    return (
      <div className="claim-card">
        <h2>Claim Your Funds</h2>

        {message.text && (
          <div className={`claim-message ${message.type}`}>{message.text}</div>
        )}

        <div className="claim-details">
          <div className="claim-item">
            <h3>Ticket Refund</h3>
            <p className="amount">{refundAmount} SEI</p>
          </div>

          <div className="claim-item">
            <h3>Prize Amount</h3>
            <p className="amount">{prizeAmount} SEI</p>
            {lotteryData.isWinner > 0 && (
              <p className="winner-tag">
                {lotteryData.isWinner === 1
                  ? "🏆 First Place"
                  : "🥈 Second Place"}
              </p>
            )}
          </div>

          <div className="claim-item total">
            <h3>Total to Claim</h3>
            <p className="amount">{totalAmount} SEI</p>
          </div>
        </div>

        <button
          className="claim-button"
          onClick={handleClaimFunds}
          disabled={loading}
        >
          {loading ? "Processing..." : "Claim Funds"}
        </button>
      </div>
    );
  };

  return (
    <div className="claim-funds-container">
      <h1>Claim Your Lottery Funds</h1>
      {renderClaimSection()}
    </div>
  );
}

export default ClaimFunds;
