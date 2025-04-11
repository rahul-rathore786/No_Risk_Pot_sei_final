import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./App.css";
import contractAddresses from "./contracts/addresses.json";

// Components
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import BuyTickets from "./pages/BuyTickets";
import AdminPanel from "./pages/AdminPanel";
import ClaimFunds from "./pages/ClaimFunds";

// Contract ABIs
import ZeroLossLotteryABI from "./artifacts/contracts/ZeroLossLottery.sol/ZeroLossLottery.json";
import SeiTokenABI from "./contracts/SeiTokenABI.json";

// SEI token has 18 decimals
const SEI_DECIMALS = 18;

function App() {
  // State variables
  const [account, setAccount] = useState("");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [lotteryContract, setLotteryContract] = useState(null);
  const [seiContract, setSeiContract] = useState(null);
  const [lotteryAddress, setLotteryAddress] = useState("");
  const [seiAddress, setSeiAddress] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [page, setPage] = useState("home");
  const [lotteryData, setLotteryData] = useState({
    totalTickets: 0,
    interestPool: 0,
    drawCompleted: false,
    userTickets: 0,
    seiBalance: 0,
    isWinner: 0,
    hasClaimed: false,
  });

  // Initialize web3 provider
  const initProvider = async () => {
    if (window.ethereum) {
      try {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await web3Provider.send("eth_requestAccounts", []);
        const networkId = await web3Provider.getNetwork();

        if (networkId.chainId !== 1328) {
          alert("Please connect to SEI Testnet");
          return;
        }

        const web3Signer = web3Provider.getSigner();
        const address = await web3Signer.getAddress();

        setProvider(web3Provider);
        setSigner(web3Signer);
        setAccount(address);

        const lotteryAddr = contractAddresses.ZeroLossLottery;
        const seiAddr = contractAddresses.SEI;
        setLotteryAddress(lotteryAddr);
        setSeiAddress(seiAddr);

        const lottery = new ethers.Contract(
          lotteryAddr,
          ZeroLossLotteryABI.abi,
          web3Signer
        );
        setLotteryContract(lottery);

        const sei = new ethers.Contract(seiAddr, SeiTokenABI, web3Signer);
        setSeiContract(sei);

        // Check if user is owner
        const owner = await lottery.owner();
        setIsOwner(owner.toLowerCase() === address.toLowerCase());

        // Load lottery data
        await refreshLotteryData(lottery, sei, address);
      } catch (error) {
        console.error("Error initializing provider:", error);
        alert("Failed to connect wallet. Please try again.");
      }
    } else {
      alert("Please install MetaMask to use this dApp");
    }
  };

  // Helper function to format SEI amounts (18 decimals)
  const formatSei = (amount) => {
    return ethers.utils.formatUnits(amount, SEI_DECIMALS);
  };

  // Helper function to parse SEI amounts (18 decimals)
  const parseSei = (amount) => {
    return ethers.utils.parseUnits(amount.toString(), SEI_DECIMALS);
  };

  // Refresh lottery data
  const refreshLotteryData = async (lottery, sei, address) => {
    if (!lottery || !sei) return;

    try {
      const totalTickets = await lottery.totalTickets();
      const interestPool = await lottery.interestPool();
      const drawCompleted = await lottery.drawCompleted();
      const userTickets = await lottery.tickets(address);
      const seiBalance = await sei.balanceOf(address);
      const isWinner = await lottery.isWinner(address);
      const hasClaimed = await lottery.hasClaimed(address);

      setLotteryData({
        totalTickets: totalTickets.toNumber(),
        interestPool: formatSei(interestPool),
        drawCompleted,
        userTickets: userTickets.toNumber(),
        seiBalance: formatSei(seiBalance),
        isWinner: isWinner,
        hasClaimed,
      });
    } catch (error) {
      console.error("Error refreshing lottery data:", error);
    }
  };

  useEffect(() => {
    if (account && lotteryContract && seiContract) {
      refreshLotteryData(lotteryContract, seiContract, account);

      // Set up event listeners
      const ticketsPurchasedFilter = lotteryContract.filters.TicketsPurchased();
      const interestAddedFilter = lotteryContract.filters.InterestAdded();
      const drawCompletedFilter = lotteryContract.filters.DrawCompleted();
      const fundsClaimedFilter = lotteryContract.filters.FundsClaimed();

      lotteryContract.on(ticketsPurchasedFilter, () =>
        refreshLotteryData(lotteryContract, seiContract, account)
      );
      lotteryContract.on(interestAddedFilter, () =>
        refreshLotteryData(lotteryContract, seiContract, account)
      );
      lotteryContract.on(drawCompletedFilter, () =>
        refreshLotteryData(lotteryContract, seiContract, account)
      );
      lotteryContract.on(fundsClaimedFilter, () =>
        refreshLotteryData(lotteryContract, seiContract, account)
      );

      return () => {
        lotteryContract.removeAllListeners(ticketsPurchasedFilter);
        lotteryContract.removeAllListeners(interestAddedFilter);
        lotteryContract.removeAllListeners(drawCompletedFilter);
        lotteryContract.removeAllListeners(fundsClaimedFilter);
      };
    }
  }, [account, lotteryContract, seiContract]);

  // Render different pages based on state
  const renderPage = () => {
    switch (page) {
      case "buy":
        return (
          <BuyTickets
            lotteryContract={lotteryContract}
            seiContract={seiContract}
            lotteryData={lotteryData}
            refreshData={() =>
              refreshLotteryData(lotteryContract, seiContract, account)
            }
            parseSei={parseSei}
          />
        );
      case "admin":
        return isOwner ? (
          <AdminPanel
            lotteryContract={lotteryContract}
            seiContract={seiContract}
            lotteryData={lotteryData}
            refreshData={() =>
              refreshLotteryData(lotteryContract, seiContract, account)
            }
            parseSei={parseSei}
          />
        ) : (
          <div className="error-message">
            You are not authorized to access this page.
          </div>
        );
      case "claim":
        return (
          <ClaimFunds
            lotteryContract={lotteryContract}
            lotteryData={lotteryData}
            refreshData={() =>
              refreshLotteryData(lotteryContract, seiContract, account)
            }
          />
        );
      default:
        return (
          <Home lotteryData={lotteryData} setPage={setPage} isOwner={isOwner} />
        );
    }
  };

  return (
    <div className="app">
      <Navbar
        account={account}
        connectWallet={initProvider}
        setPage={setPage}
        isOwner={isOwner}
        seiBalance={lotteryData.seiBalance}
      />
      <div className="container">{renderPage()}</div>
    </div>
  );
}

export default App;
