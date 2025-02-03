"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { TronLinkAdapterName } from "@tronweb3/tronwallet-adapters";

const TronWallet = () => {
  const { wallet, connected, address, select, disconnect } = useWallet();
  const [balance, setBalance] = useState<string>("0");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const fetchBalance = useCallback(async () => {
    try {
      const tronWeb = window.tronLink?.tronWeb;
      if (!tronWeb || !address) return;

      const balanceInSun = await tronWeb.trx.getBalance(address);
      setBalance((Number(balanceInSun) / 1e6).toString());
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }, [address]);

  useEffect(() => {
    if (connected && address) {
      fetchBalance();
    }
  }, [connected, address, fetchBalance]);

  const sendTransaction = async () => {
    try {
      if (!connected || !wallet || !address) {
        throw new Error("Tron wallet is not connected");
      }
      if (!recipient || !amount) {
        console.error("Invalid Input: Enter a valid address and amount.");
        return;
      }
  
      const tronWeb = window.tronLink?.tronWeb;
      if (!tronWeb) throw new Error("TronLink not detected");
  
      const amountInSun = Math.floor(Number(amount) * 1e6);
      if (isNaN(amountInSun)) throw new Error("Invalid amount");
  
      // Utilisation de la signature correcte avec 3 arguments
      const transaction = await tronWeb.trx.sendTransaction(
        recipient,     // Argument 1: adresse destination (string)
        amountInSun,   // Argument 2: montant en SUN (number)
      );
  
      if (transaction.result) {
        console.log("Transaction Successful", `TX ID: ${transaction.txid}`);
        await fetchBalance();
      } else {
        throw new Error("Transaction failed");
      }
    } catch (error) {
      console.error("Transaction Error:", error);
      if (error instanceof Error) {
        console.error("Transaction Failed:", error.message);
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold">Tron Wallet</h1>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        onClick={() => (connected ? disconnect() : select(TronLinkAdapterName))}
      >
        {connected ? "Disconnect" : "Connect Tron Wallet"}
      </button>
      {connected && (
        <>
          <p className="mt-4">Address: {address}</p>
          <p className="mt-2">Balance: {balance} TRX</p>
          <input
            type="text"
            placeholder="Recipient Address"
            className="mt-4 p-2 border rounded w-full"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount"
            className="mt-2 p-2 border rounded w-full"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            step="0.000001"
            min="0"
          />
          <button
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
            onClick={sendTransaction}
          >
            Send TRX
          </button>
        </>
      )}
    </div>
  );
};

export default TronWallet;