import React, { useState, useEffect } from "react";
import "../styles/BuyTickets.css";

function BuyTickets({
  lotteryContract,
  seiContract,
  lotteryData,
  refreshData,
  parseSei,
}) {
  const [numTickets, setNumTickets] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [allowance, setAllowance] = useState(0);

  // Calculate total cost
  const ticketCost = 1; // 1 SEI per ticket
  const totalCost = numTickets * ticketCost;

  // Check if user has already approved SEI for the lottery contract
  useEffect(() => {
    const checkAllowance = async () => {
      if (lotteryContract && seiContract) {
        try {
          const userAllowance = await seiContract.allowance(
            await seiContract.signer.getAddress(),
            lotteryContract.address
          );

          // Convert from wei to SEI
          setAllowance(parseFloat(userAllowance) / 10 ** 18);
        } catch (error) {
          console.error("Error checking allowance:", error);
        }
      }
    };

    checkAllowance();
  }, [lotteryContract, seiContract]);

  const handleNumTicketsChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 10) {
      setNumTickets(value);
    }
  };

  const handleApproveTokens = async () => {
    if (!lotteryContract || !seiContract) return;

    setLoading(true);
    setMessage({ text: "Approving SEI...", type: "info" });

    try {
      // Approve SEI for all future transactions
      const amountToApprove = parseSei(1000); // Approve 1000 SEI
      const tx = await seiContract.approve(
        lotteryContract.address,
        amountToApprove
      );
      await tx.wait();

      setMessage({ text: "SEI approved successfully!", type: "success" });
      setAllowance(1000);
    } catch (error) {
      console.error("Error approving SEI:", error);
      setMessage({
        text: "Failed to approve SEI. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTickets = async () => {
    if (!lotteryContract) return;

    setLoading(true);
    setMessage({ text: "Buying tickets...", type: "info" });

    try {
      // Check if allowance is enough
      if (allowance < totalCost) {
        throw new Error("Please approve SEI for the lottery contract first.");
      }

      const tx = await lotteryContract.buyTickets(numTickets);
      await tx.wait();

      setMessage({
        text: `Successfully purchased ${numTickets} ticket(s)!`,
        type: "success",
      });
      refreshData();
    } catch (error) {
      console.error("Error buying tickets:", error);
      setMessage({
        text: "Failed to buy tickets: " + (error.message || "Unknown error"),
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderButtonSection = () => {
    if (lotteryData.drawCompleted) {
      return (
        <div className="info-message warning">
          The lottery draw has been completed. Please wait for the next round.
        </div>
      );
    }

    if (parseFloat(lotteryData.seiBalance) < totalCost) {
      return (
        <div className="info-message warning">
          You don't have enough SEI tokens to buy {numTickets} ticket(s). Please
          get some SEI tokens first.
        </div>
      );
    }

    if (lotteryData.userTickets + numTickets > lotteryData.maxTicketsPerUser) {
      return (
        <div className="info-message warning">
          You can buy at most {lotteryData.maxTicketsPerUser} tickets in total.
          You already have {lotteryData.userTickets} ticket(s).
        </div>
      );
    }

    return (
      <div className="button-container">
        {allowance < totalCost ? (
          <button
            className="approve-button"
            onClick={handleApproveTokens}
            disabled={loading}
          >
            {loading ? "Processing..." : "Approve SEI"}
          </button>
        ) : (
          <button
            className="buy-button"
            onClick={handleBuyTickets}
            disabled={loading}
          >
            {loading ? "Processing..." : "Buy Tickets"}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="buy-tickets-container">
      <h1>Buy Lottery Tickets</h1>

      <div className="status-summary">
        <div className="status-item">
          <h3>Your Tickets</h3>
          <p>{lotteryData.userTickets}</p>
        </div>

        <div className="status-item">
          <h3>Your SEI Balance</h3>
          <p>{parseFloat(lotteryData.seiBalance).toFixed(2)} SEI</p>
        </div>

        <div className="status-item">
          <h3>Total Tickets</h3>
          <p>{lotteryData.totalTickets}</p>
        </div>
      </div>

      <div className="ticket-purchase-card">
        <h2>Purchase Tickets</h2>
        <p className="ticket-info">
          Each ticket costs 1 SEI. You can buy up to 10 tickets in total.
        </p>

        {message.text && (
          <div className={`status-message ${message.type}`}>{message.text}</div>
        )}

        <div className="input-group">
          <label htmlFor="num-tickets">Number of Tickets</label>
          <div className="ticket-selector">
            <button
              className="ticket-button decrease"
              onClick={() =>
                setNumTickets((prev) => (prev > 1 ? prev - 1 : prev))
              }
              disabled={loading || numTickets <= 1}
            >
              -
            </button>
            <input
              type="number"
              id="num-tickets"
              value={numTickets}
              onChange={handleNumTicketsChange}
              min="1"
              max="10"
              disabled={loading}
            />
            <button
              className="ticket-button increase"
              onClick={() =>
                setNumTickets((prev) => (prev < 10 ? prev + 1 : prev))
              }
              disabled={loading || numTickets >= 10}
            >
              +
            </button>
          </div>
        </div>

        <div className="cost-summary">
          <p>
            Total Cost: <span className="cost-amount">{totalCost} SEI</span>
          </p>
        </div>

        {renderButtonSection()}

        <div className="how-it-works">
          <h3>How It Works</h3>
          <ul>
            <li>Buy tickets with SEI tokens</li>
            <li>All ticket funds are fully refundable after the draw</li>
            <li>Winners share the interest earned on the ticket pool</li>
            <li>First place receives 50% of interest</li>
            <li>Second place receives 30% of interest</li>
            <li>Everyone gets their initial ticket cost back</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default BuyTickets;
