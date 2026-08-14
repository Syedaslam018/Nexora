import PDFDocument from "pdfkit";
import type { Response } from "express";
import type { orderRepository } from "../repositories/order.repository.js";

type OrderForInvoice = NonNullable<Awaited<ReturnType<typeof orderRepository.findByIdForUser>>>;

function money(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export const invoiceService = {
  /** Streams a PDF invoice straight into the response — no temp file, no
   * disk write, just `doc.pipe(res)`. The caller sets the response headers
   * (see order.controller.ts's `invoice` handler) before calling this. */
  streamInvoice(order: OrderForInvoice, res: Response): void {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res);

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .text("NEXORA", { continued: false })
      .fontSize(9)
      .font("Helvetica")
      .fillColor("#64748B")
      .text("Invoice")
      .moveDown(1.5);

    doc.fillColor("#0B1120");
    doc.fontSize(10);
    doc.text(`Invoice / Order: ${order.orderNumber}`);
    doc.text(`Date: ${order.createdAt.toLocaleDateString()}`);
    doc.text(`Status: ${order.status}`);
    doc.moveDown();

    const addr = order.shippingAddress;
    doc.font("Helvetica-Bold").text("Ship to:");
    doc.font("Helvetica");
    doc.text(addr.fullName);
    doc.text(addr.line1 + (addr.line2 ? `, ${addr.line2}` : ""));
    doc.text(`${addr.city}, ${addr.state} ${addr.postalCode}`);
    doc.text(addr.country);
    doc.moveDown(1.5);

    const tableTop = doc.y;
    const col = { name: 50, qty: 330, price: 390, total: 470 };
    doc.font("Helvetica-Bold").fontSize(9);
    doc.text("Item", col.name, tableTop);
    doc.text("Qty", col.qty, tableTop);
    doc.text("Price", col.price, tableTop);
    doc.text("Total", col.total, tableTop);
    doc.moveTo(50, tableTop + 14).lineTo(545, tableTop + 14).strokeColor("#E5E7EB").stroke();

    let y = tableTop + 20;
    doc.font("Helvetica").fontSize(9);
    for (const item of order.items) {
      doc.text(`${item.productNameSnapshot} (${item.variantNameSnapshot})`, col.name, y, { width: 270 });
      doc.text(String(item.quantity), col.qty, y);
      doc.text(money(item.unitPriceCents), col.price, y);
      doc.text(money(item.totalCents), col.total, y);
      y += 20;
    }

    doc.moveTo(50, y + 4).lineTo(545, y + 4).strokeColor("#E5E7EB").stroke();
    y += 14;

    const totals: [string, number][] = [
      ["Subtotal", order.subtotalCents],
      ...(order.discountCents > 0 ? ([["Discount", -order.discountCents]] as [string, number][]) : []),
      ["Shipping", order.shippingCents],
      ["Tax", order.taxCents],
    ];
    for (const [label, cents] of totals) {
      doc.text(label, col.price - 60, y);
      doc.text((cents < 0 ? "-" : "") + money(Math.abs(cents)), col.total, y);
      y += 16;
    }
    doc.font("Helvetica-Bold");
    doc.text("Total", col.price - 60, y);
    doc.text(money(order.totalCents), col.total, y);

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("#64748B")
      .text("NEXORA — this invoice was generated automatically.", 50, 770, { align: "center" });

    doc.end();
  },
};
