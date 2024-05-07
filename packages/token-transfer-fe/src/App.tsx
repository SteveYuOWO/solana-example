import "./App.css";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { useState } from "react";
import { enqueueSnackbar, SnackbarProvider } from "notistack";
import "./App.css";
import { isInputDigit } from "./regex";
import {
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";

function App() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = useState<number>();
  const [toPublicKey, setToPublicKey] = useState("");
  const [toCount, setToCount] = useState("");

  const onBalance = () => {
    if(!publicKey) {
      enqueueSnackbar(
        `Please login`,
        {
          variant: "error",
        },
      );
      return;
    }
    connection.getBalance(publicKey).then((balance: number) => {
      enqueueSnackbar(
        `${publicKey} has a balance of ${balance / LAMPORTS_PER_SOL}`,
        {
          variant: "success",
        },
      );
      setBalance(balance);
    });
  };

  const onTransfer = async () => {
    if (!publicKey) {
      enqueueSnackbar(
        `Please login`,
        {
          variant: "error",
        },
      );
      return;
    }
    if (!toCount) {
      enqueueSnackbar("Please input a valid count", {
        variant: "error",
      });
      return;
    }
    enqueueSnackbar(`transfer to ${toPublicKey} ${toCount} SOL`, {
      variant: "info",
    });
    enqueueSnackbar(`pending...`, {
      variant: "info",
    });
    const txInstructions = [
      SystemProgram.transfer({
        fromPubkey: publicKey, //this.publicKey,
        toPubkey: new PublicKey(toPublicKey), //destination,
        lamports: Number(toCount) * LAMPORTS_PER_SOL, //amount,
      }),
    ];

    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();
    enqueueSnackbar(
      `   ✅ - Fetched latest blockhash. Last Valid Height: 
      ${lastValidBlockHeight}`
    );
    const messageV0 = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: txInstructions,
    }).compileToV0Message();

    try {
      const trx = new VersionedTransaction(messageV0);
      const txHash = await sendTransaction(trx, connection, {
        minContextSlot
      });
      enqueueSnackbar(`Transfer Success. Tx Hash: ${txHash}`, {
        variant: "success",
      });
    } catch (e) {
      enqueueSnackbar(`Transfer Failed`, {
        variant: "error",
      });
      throw e;
    }
  };
  return (
        <div className="App">
        <WalletMultiButton />
        <h1>Solana Token Transfer</h1>
        <div className="flex-box">
          <p>PublicKey:</p>
          <p>{publicKey?.toBase58()}</p>
        </div>
        <div className="flex-box">
          <p>Balance:</p>
          <p>{balance ? balance / LAMPORTS_PER_SOL + " sol" : ""}</p>
          <button onClick={onBalance}>QUERY</button>
        </div>
        <div className="flex-box">
          <p>Transfer</p>
          <input
            id="privateKey"
            type="text"
            placeholder="To"
            value={toPublicKey}
            onChange={(e) => {
              setToPublicKey(e.target.value);
            }}
          />
          <input
            id="privateKey"
            type="text"
            placeholder="Count"
            value={toCount}
            onChange={(e) => {
              const value = e.target.value;
              if (isInputDigit(value)) {
                setToCount(value);
              }
            }}
          />
          <button onClick={onTransfer}>TRANSFER</button>
        </div>
        <SnackbarProvider />
      </div>
  );
}

export default App;
