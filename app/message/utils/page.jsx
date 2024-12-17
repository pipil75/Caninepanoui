"use client";
export const dynamic = "force-dynamic";
import dynamic from "next/dynamic";

const SendMessageClient = dynamic(() => import("./messagutil"), {
  ssr: false, // Désactive le rendu serveur
});

export default function Page() {
  return (
    <div>
      <h1>Messages</h1>
      <SendMessageClient />
    </div>
  );
}
