// src/lib/receipts.js
import { renderToBuffer } from "@react-pdf/renderer";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { cloudinary } from "./cloudinary";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: "Helvetica" },
  header: { fontSize: 18, marginBottom: 4, color: "#1A2332" },
  subheader: { fontSize: 9, marginBottom: 16, color: "#666" },
  section: { marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  divider: { borderBottomWidth: 1, borderBottomColor: "#e5e5e0", marginVertical: 8 },
  total: { fontSize: 14, marginTop: 8, color: "#EA580C" },
});

function formatGNF(value) {
  return `${Number(value).toLocaleString("fr-FR")} GNF`;
}

function ReceiptDocument({ order }) {
  const address = order.address;

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <Text style={styles.header}>Recu de commande {order.orderNumber}</Text>
        <Text style={styles.subheader}>MotoShop - Kankan</Text>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Client</Text>
            <Text>{order.guestFullName || order.user?.fullName}</Text>
          </View>
          <View style={styles.row}>
            <Text>Telephone</Text>
            <Text>{order.guestPhone || order.user?.phone || "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text>Date</Text>
            <Text>{new Date(order.createdAt).toLocaleDateString("fr-FR")}</Text>
          </View>
          {address && (
            <View style={styles.row}>
              <Text>Livraison</Text>
              <Text>
                {address.quartier}, {address.ville}
                {address.reperes ? ` (${address.reperes})` : ""}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {order.items.map((item) => (
          <View style={styles.row} key={item.id}>
            <Text>
              {item.quantity} x {item.product.name}
            </Text>
            <Text>{formatGNF(Number(item.unitPrice) * item.quantity)}</Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text>Sous-total</Text>
          <Text>{formatGNF(order.subtotal)}</Text>
        </View>
        {Number(order.deliveryFee) > 0 && (
          <View style={styles.row}>
            <Text>Frais de livraison</Text>
            <Text>{formatGNF(order.deliveryFee)}</Text>
          </View>
        )}

        <Text style={styles.total}>Total : {formatGNF(order.total)}</Text>
      </Page>
    </Document>
  );
}

export async function generateAndUploadReceipt(order) {
  const buffer = await renderToBuffer(<ReceiptDocument order={order} />);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: "raw", folder: "receipts", public_id: order.orderNumber },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}