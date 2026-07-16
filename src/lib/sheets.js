import { google } from "googleapis";

// Compte de service Google (acces serveur-a-serveur, pas d'OAuth utilisateur).
// Le Sheet doit etre partage en "Editeur" avec l'email du compte de service.

function getSheetsClient() {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    (process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets"]
  );
  return google.sheets({ version: "v4", auth });
}

export async function appendOrderToSheet(order) {
  const sheets = getSheetsClient();

  const row = [
    order.orderNumber,
    order.createdAt.toISOString(),
    order.guestFullName || order.user?.fullName || "",
    order.guestPhone || "",
    order.status,
    order.total.toString(),
    order.items.map((i) => `${i.quantity}x ${i.product.name}`).join(", "),
  ];

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "Commandes!A:G",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}
