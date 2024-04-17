import "./App.css";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { useState } from "react";
import { enqueueSnackbar, SnackbarProvider } from "notistack";
import "./App.css";
import { connection } from "./constants";
import { isInputDigit } from "./regex";

function App() {
  const [privateKey, setPrivateKey] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [balance, setBalance] = useState<number>();
  const [toPublicKey, setToPublicKey] = useState("");
  const [toCount, setToCount] = useState("");

  const [keyPair, setKeyPair] = useState<Keypair>();

  const onImport = () => {
    try {
      const secretKey = Uint8Array.from(JSON.parse(privateKey));
      const _keyPair = Keypair.fromSecretKey(secretKey);
      setKeyPair(_keyPair);
      enqueueSnackbar(`import account: ${_keyPair.publicKey.toString()}`, {
        variant: "success",
      });
      setPublicKey(_keyPair.publicKey.toString());
    } catch (e) {
      enqueueSnackbar("Invalid private key", {
        variant: "error",
      });
    }
  };

  const onBalance = () => {
    if (!keyPair) {
      enqueueSnackbar("Please import private key", {
        variant: "error",
      });
      return;
    }
    connection.getBalance(keyPair.publicKey).then((balance: number) => {
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
    if (!keyPair) {
      enqueueSnackbar("Please import private key", {
        variant: "error",
      });
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
        fromPubkey: keyPair.publicKey, //this.publicKey,
        toPubkey: new PublicKey(toPublicKey), //destination,
        lamports: Number(toCount) * LAMPORTS_PER_SOL, //amount,
      }),
    ];

    const latestBlockhash = await connection.getLatestBlockhash("finalized");
    enqueueSnackbar(
      `   ✅ - Fetched latest blockhash. Last Valid Height: 
      ${latestBlockhash.lastValidBlockHeight}`,
      {
        variant: "info",
      },
    );

    const messageV0 = new TransactionMessage({
      payerKey: keyPair.publicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: txInstructions,
    }).compileToV0Message();

    try {
      const trx = new VersionedTransaction(messageV0);
      trx.sign([keyPair]);
      const txHash = await connection.sendTransaction(trx);
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
      <h1>Solana Token Transfer</h1>
      <label htmlFor="privateKey">Private Key</label>
      <div className="flex-box">
        <input
          id="privateKey"
          type="text"
          value={privateKey}
          onChange={(e) => {
            setPrivateKey(e.target.value);
          }}
        />
        <button onClick={onImport}>IMPORT</button>
      </div>
      <div className="flex-box">
        <p>PublicKey:</p>
        <p>{publicKey}</p>
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
