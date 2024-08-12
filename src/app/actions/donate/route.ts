import {
  ACTIONS_CORS_HEADERS, 
  ActionGetResponse, 
  ActionPostRequest, 
  ActionPostResponse, 
  createPostResponse,
  serializeTransaction, 
} from "@solana/actions";

import {
  Connection, 
  LAMPORTS_PER_SOL, 
  PublicKey, 
  SystemProgram, 
  Transaction, 
  clusterApiUrl, 
} from "@solana/web3.js";

export async function GET(request: Request) {
  const url = new URL(request.url); 
  const payload: ActionGetResponse = {
    
    icon: "https://i.pinimg.com/564x/9d/9c/d4/9d9cd4fa1d875e4c22851eb55b2e43f7.jpg",
    title: "Solona Radar Hackathon", 
    description: "Book your Spot Now limited spots.", 
    label: "Donate", 
    links: {
      actions: [
        {
          label: "Donate 0.1 SOL", 
          href: `${url.href}?amount=0.1`, 
        },
      ],
    },
  };
  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS, 
  });
}

export const OPTIONS = GET; 

export async function POST(request: Request) {
  const body: ActionPostRequest = await request.json(); 
  const url = new URL(request.url); 
  const amount = Number(url.searchParams.get("amount")) || 0.1; 
  let sender;

  try {
    sender = new PublicKey(body.account); 
  } catch (error) {
    return Response.json(
      {
        error: {
          message: "Invalid account", 
        },
      },
      {
        status: 400, 
        headers: ACTIONS_CORS_HEADERS, 
      }
    );
  }

  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed"); 

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: sender, 
      toPubkey: new PublicKey("DBEn8Ke3rhdm3ZSVL8MQdouyGQdsFY3LeN9ygr8USMA"), 
      lamports: amount * LAMPORTS_PER_SOL, 
    })
  );
  transaction.feePayer = sender; 
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash()
  ).blockhash; 
  transaction.lastValidBlockHeight = (
    await connection.getLatestBlockhash()
  ).lastValidBlockHeight; 

  const payload: ActionPostResponse = await createPostResponse({
    fields: {
      transaction,
      message: "Transaction created", 
    },
  });
  return new Response(JSON.stringify(payload), {
    headers: ACTIONS_CORS_HEADERS, 
  });
}