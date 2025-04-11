import React, { useState } from "react";
import { ethers } from "ethers";
import "../styles/TokenTransfer.css";

function TokenTransfer({ seiContract, refreshData, parseSei }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleRecipientChange = (e) => {
    setRecipient(e.target.value);
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleTransfer = async () => {
    if (!seiContract || !recipient || !amount) return;

    // Validate address
    if (!ethers.utils.isAddress(recipient)) {
      setMessage({
        text: "Invalid Ethereum address. Please check and try again.",
        type: "error",
      });
      return;
    }

    setLoading(true);
    setMessage({ text: "Processing transfer...", type: "info" });

    try {
      const amountToSend = parseSei(amount);
      const tx = await seiContract.transfer(recipient, amountToSend);
      await tx.wait();

      setMessage({
        text: `Successfully transferred ${amount} SEI to ${recipient}`,
        type: "success",
      });
      setRecipient("");
      setAmount("");
      refreshData();
    } catch (error) {
      console.error("Transfer error:", error);
      setMessage({
        text: "Error transferring tokens. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="token-transfer-card">
      <h2>Transfer SEI Tokens</h2>
      <p className="description">
        Send SEI tokens to another address on the SEI Testnet.
      </p>

      {message.text && (
        <div className={`transfer-message ${message.type}`}>{message.text}</div>
      )}

      <div className="input-group">
        <label htmlFor="recipient">Recipient Address</label>
        <input
          type="text"
          id="recipient"
          placeholder="0x..."
          value={recipient}
          onChange={handleRecipientChange}
          disabled={loading}
        />
      </div>

      <div className="input-group">
        <label htmlFor="amount">Amount (SEI)</label>
        <input
          type="number"
          id="amount"
          placeholder="0.0"
          min="0.1"
          step="0.1"
          value={amount}
          onChange={handleAmountChange}
          disabled={loading}
        />
      </div>

      <button
        className="transfer-button"
        onClick={handleTransfer}
        disabled={loading || !recipient || !amount}
      >
        {loading ? "Processing..." : "Transfer"}
      </button>
    </div>
  );
}

export default TokenTransfer;
