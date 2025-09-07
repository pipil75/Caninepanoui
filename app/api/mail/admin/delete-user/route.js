// app/api/mail/admin/delete-user/route.js
// /app/api/admin/delete-user/route.js
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { admin } from "../../../../../lib/firebaseadmin";

export async function POST(req) {
  try {
    // 1) Vérif du token admin
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    if (!idToken)
      return NextResponse.json({ error: "Missing token" }, { status: 401 });

    const decoded = await admin.auth().verifyIdToken(idToken);
    if (decoded.email?.toLowerCase() !== "aprilraphaella75@gmail.com") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2) UID à supprimer (reçu du client)
    const { uid } = await req.json();
    if (!uid)
      return NextResponse.json({ error: "Missing uid" }, { status: 400 });

    // 3) Auth
    await admin.auth().deleteUser(uid);

    // 4) Realtime DB (multi-path)
    await admin
      .database()
      .ref()
      .update({
        [`users/${uid}`]: null,
        [`users/user/${uid}`]: null,
        [`users/pro/${uid}`]: null,
      });

    // 5) Storage (optionnel)
    try {
      await admin
        .storage()
        .bucket()
        .deleteFiles({ prefix: `images/${uid}/` });
    } catch {
      // ok si rien à supprimer
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}
