import { ActionGetRequest, ActionPostRequest, ACTIONS_CORS_HEADERS } from "@solana/actions";
import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { describe } from "node:test";
import { title } from "process";

export async function GET(request: Request) {
  interface ActionGetRequest {
    icon: string;
    title: string;
    description: string;
    label: string;
    links: {
      actions: {
        label: string;
        herf: string;
      }[];
    };
  }

  const url = new URL(request.url);
  const payload : ActionGetRequest = {
    icon: "lol",
    title: "Donate ! Support the project",
    description : "donate to support the project",
    label: "Donate Now",

    links: {
      actions: [
        {
          label: "Donate 0.1 SOL",
          herf: "${url.href}?amount=0.1",
        }
      ]
    }
  };
  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS
  });
}

//post req
export const OPTIONS = GET;

export async function POST(request: Request) {
  const body: { account: string } = await request.json();
  const url = new URL(request.url);
  const amount = Number(url.searchParams.get("amount")) || 0.1;
  let sender;

  try {
    sender = new PublicKey(body.account);
  } catch (error) {
    return Response.json({
      error:{
        message: "Invalid account",
      },
    },
    {
      status: 400,
      headers: ACTIONS_CORS_HEADERS
    }
    );
  } 

  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender,
      toPubkey: new PublicKey("317pLTpVSKwbN9DbAwogFnPggLuQuEDgFSU4vYxifTEY "),
      lamports: amount * LAMPORTS_PER_SOL,
    })
  );
    const blockheight = await connection.getLatestBlockhash();

    transaction.recentBlockhash = blockheight.blockhash;
    transaction.lastValidBlockHeight = blockheight.lastValidBlockHeight;

    transaction.feePayer = sender;

    interface ActionPostRequest {
      transaction: string;
      message: string;
      // other properties...
    }
    const payload: ActionPostRequest = {
      transaction: transaction.serialize().toString("base64"),
      message: "Transaction sent",
    };

    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS,  
    });
}