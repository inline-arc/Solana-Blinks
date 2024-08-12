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
    
    icon: "https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,background=white,quality=75,width=280,height=280/event-covers/v7/3063cc25-6efa-4389-8441-3d03f528b26d",
    title: "Solana Hacker Houses", 
    description: "Hosted by Solana Foundation Friday, July 26 Join the Solana Foundation's Solana Hacker House on July 26 for a 2-day event featuring industry leaders, panels, & workshops. Connect with the Solana ecosystem and network in person!", 
    label: "Donate", 
    links: {
      actions: [
        {
          label: "1.0 SOL", 
          href: `${url.href}?amount=0.1`,
          parameters: [
            {
              name: "mail", 
              label: "Enter your mail to book a spot",
            }
          ]
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