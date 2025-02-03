"use client";

import { useEffect, useState, useCallback } from "react";
import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";
import { TronLinkAdapterName } from "@tronweb3/tronwallet-adapters";

// Interface pour typer tronWeb.trx
type TronWebTRX = {
  getBalance: (address: string) => Promise<number>;
  sendRawTransaction: (transaction: {
    to: string;
    value: number;
  }) => Promise<{ result: boolean; txid: string }>;
};

const TronWallet = () => {
  const { wallet, connected, address, select, disconnect } = useWallet();
  const [balance, setBalance] = useState<string>("0");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  // Utilisation de useCallback pour mémoriser la fonction
  const fetchBalance = useCallback(async () => {
    try {
      const tronWeb = window?.tronLink?.tronWeb;
      if (!tronWeb || !address) return;

      const balanceInSun = await (tronWeb.trx as TronWebTRX).getBalance(address);
      setBalance((balanceInSun / 1e6).toString());
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }, [address]); // Dépendance sur address

  useEffect(() => {
    if (connected && address) {
      fetchBalance();
    }
  }, [connected, address, fetchBalance]); // Ajout de fetchBalance aux dépendances

  const sendTransaction = async () => {
    try {
      if (!connected || !wallet || !address) {
        throw new Error("Tron wallet is not connected");
      }
      if (!recipient || !amount) {
        console.error("Invalid Input: Enter a valid address and amount.");
        return;
      }

      const tronWeb = window?.tronLink?.tronWeb;
      if (!tronWeb) return;

      const transaction = await (tronWeb.trx as TronWebTRX).sendRawTransaction({
        to: recipient,
        value: Number(amount) * 1e6, // Convert TRX to Sun
      });

      if (transaction.result) {
        console.log("Transaction Successful", `TX ID: ${transaction.txid}`);
        fetchBalance();
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