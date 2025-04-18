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

  const maxTicketsAvailable = 10 - lotteryData.userTickets;
  const totalCost = numTickets;
  const hasSufficientSei = parseFloat(lotteryData.seiBalance) >= totalCost;

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
    if (value >= 1 && value <= maxTicketsAvailable) {
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

  // Display SEI Faucet info if balance is zero
  if (parseFloat(lotteryData.seiBalance) === 0) {
    return (
      <div className="buy-tickets-container">
        <h1>Get SEI Tokens</h1>
        <div className="faucet-info">
          <h2>You need SEI tokens to participate in the lottery</h2>
          <p>
            To get SEI tokens for the testnet, visit the official SEI Faucet:
          </p>
          <a
            href="https://www.docs.sei.io/learn/faucet"
            target="_blank"
            rel="noopener noreferrer"
            className="faucet-button"
          >
            Visit SEI Faucet
          </a>
          <p className="faucet-note">
            After receiving tokens, refresh this page to see your updated
            balance.
          </p>
          <button
            className="refresh-button"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="buy-tickets-container">
      <h1>Buy Lottery Tickets</h1>

      {lotteryData.drawCompleted ? (
        <div className="draw-completed-message">
          <h2>Draw Completed</h2>
          <p>
            This lottery round has already completed. Please wait for the next
            round.
          </p>
        </div>
      ) : lotteryData.userTickets >= 10 ? (
        <div className="max-tickets-message">
          <h2>Maximum Tickets Reached</h2>
          <p>
            You have already purchased the maximum allowed tickets (10) for this
            lottery round.
          </p>
        </div>
      ) : (
        <div className="ticket-purchase-form">
          <div className="ticket-purchase-summary">
            <div className="summary-item">
              <h3>Your SEI Balance</h3>
              <p>{parseFloat(lotteryData.seiBalance).toFixed(2)} SEI</p>
            </div>

            <div className="summary-item">
              <h3>Tickets Owned</h3>
              <p>{lotteryData.userTickets}/10</p>
            </div>

            <div className="summary-item">
              <h3>Tickets Available</h3>
              <p>{maxTicketsAvailable}</p>
            </div>
          </div>

          <div className="ticket-selection">
            <h3>Select Number of Tickets</h3>
            <div className="ticket-input-wrapper">
              <button
                className="ticket-adjust-btn"
                onClick={() => numTickets > 1 && setNumTickets(numTickets - 1)}
                disabled={numTickets <= 1}
              >
                -
              </button>
              <input
                type="number"
                value={numTickets}
                onChange={handleNumTicketsChange}
                min="1"
                max={maxTicketsAvailable}
                className="ticket-input"
              />
              <button
                className="ticket-adjust-btn"
                onClick={() =>
                  numTickets < maxTicketsAvailable &&
                  setNumTickets(numTickets + 1)
                }
                disabled={numTickets >= maxTicketsAvailable}
              >
                +
              </button>
            </div>
          </div>

          <div className="ticket-cost">
            <h3>Total Cost</h3>
            <p className="cost-value">{totalCost} SEI</p>
            {!hasSufficientSei && (
              <p className="insufficient-funds">
                Insufficient SEI balance. Visit the SEI faucet to get more
                tokens.
              </p>
            )}
          </div>

          {message.text && (
            <div className={`purchase-message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="ticket-actions">
            {allowance < totalCost ? (
              <button
                className="approve-button"
                onClick={handleApproveTokens}
                disabled={loading || !hasSufficientSei}
              >
                {loading ? "Processing..." : "Approve SEI"}
              </button>
            ) : (
              <button
                className="buy-button"
                onClick={handleBuyTickets}
                disabled={loading || !hasSufficientSei || allowance < totalCost}
              >
                {loading ? "Processing..." : "Buy Tickets"}
              </button>
            )}
          </div>

          <div className="faucet-reminder">
            <p>
              Need more SEI tokens?{" "}
              <a
                href="https://www.docs.sei.io/learn/faucet"
                target="_blank"
                rel="noopener noreferrer"
                className="faucet-link"
              >
                Access the SEI Faucet
              </a>
            </p>
          </div>

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
      )}
    </div>
  );
}

export default BuyTickets;
