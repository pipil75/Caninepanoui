"use client";

export const Setting = "force-dynamic"; // Renommez la variable

import DynamicComponent from "next/dynamic";

const SendMessageClient = DynamicComponent(() => import("./messagutil"), {
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
