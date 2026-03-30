"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { adminApi } from "@/lib/api";
import { Spinner } from "@heroui/react";
import { Printer } from "lucide-react";

export default function AdminInvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.getOrder(Number(id))
      .then((r) => setOrder(r.data))
      .catch(() => setError("Order not found or access denied"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center items-center min-h-screen bg-white"><Spinner /></div>;
  if (error) return <div className="flex justify-center items-center min-h-screen bg-white text-red-500">{error}</div>;

  const isPaid = ["paid", "processing", "shipped", "delivered"].includes(order.status);
  const invoiceNo = `INV-${String(order.id).padStart(6, "0")}`;
  const paidAt = order.payment?.paid_at ? new Date(order.payment.paid_at).toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" }) : null;
  const createdAt = order.created_at ? new Date(order.created_at).toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" }) : "";

  return (
    <div className="bg-white min-h-screen">
      {/* Print button - hidden when printing */}
      <div className="print:hidden flex justify-end p-4 gap-2 bg-gray-100 border-b">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-[#D400A8] text-white rounded-lg font-semibold hover:bg-[#b30090] transition-colors"
        >
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      {/* Invoice body */}
      <div className="max-w-3xl mx-auto p-10 font-sans text-gray-800">
        {/* Header */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="text-3xl font-black tracking-tight text-[#D400A8]">MUFFLUX</div>
            <div className="text-xs text-gray-500 mt-1">Malaysian Performance Exhaust Brand</div>
            <div className="text-xs text-gray-500">KL, Selangor, Negeri Sembilan</div>
            <div className="text-xs text-gray-500">011-70099733 · info@mufflux.com</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-gray-800">{isPaid ? "RECEIPT" : "INVOICE"}</div>
            <div className="text-sm text-gray-500 mt-1">{invoiceNo}</div>
            <div className="text-sm text-gray-500">Date: {createdAt}</div>
            {isPaid && paidAt && (
              <div className="text-sm text-green-600 font-semibold mt-1">Paid: {paidAt}</div>
            )}
            <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
              isPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {order.status}
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <div className="text-xs font-bold uppercase text-gray-400 mb-2 tracking-widest">Bill To</div>
            {order.user && (
              <>
                <div className="font-semibold">{order.user.name}</div>
                <div className="text-sm text-gray-500">{order.user.email}</div>
                {order.user.phone && <div className="text-sm text-gray-500">{order.user.phone}</div>}
              </>
            )}
            {order.address && (
              <div className="text-sm text-gray-500 mt-1">
                {order.address.address_line1}{order.address.address_line2 ? `, ${order.address.address_line2}` : ""}<br />
                {order.address.city}, {order.address.state} {order.address.postcode}
              </div>
            )}
          </div>
          <div>
            <div className="text-xs font-bold uppercase text-gray-400 mb-2 tracking-widest">Order Details</div>
            <div className="text-sm text-gray-600">Order ID: <span className="font-mono font-bold">#{order.id}</span></div>
            <div className="text-sm text-gray-600">Shipping: <span className="capitalize">{order.shipping_type}</span></div>
            {order.courier && <div className="text-sm text-gray-600">Courier: <span className="uppercase">{order.courier}</span></div>}
            {order.tracking_number && <div className="text-sm text-gray-600">Tracking: <span className="font-mono">{order.tracking_number}</span></div>}
            {order.payment_ref && <div className="text-sm text-gray-600">Payment Ref: <span className="font-mono text-xs">{order.payment_ref}</span></div>}
          </div>
        </div>

        {/* Items table */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-2 font-bold text-gray-600 uppercase text-xs tracking-wide">Item</th>
              <th className="text-center py-2 font-bold text-gray-600 uppercase text-xs tracking-wide w-16">Qty</th>
              <th className="text-right py-2 font-bold text-gray-600 uppercase text-xs tracking-wide w-28">Unit Price</th>
              <th className="text-right py-2 font-bold text-gray-600 uppercase text-xs tracking-wide w-28">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item: any, i: number) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="py-3 text-gray-800">{item.product_name}</td>
                <td className="py-3 text-center text-gray-600">{item.qty}</td>
                <td className="py-3 text-right text-gray-600">RM {Number(item.unit_price).toFixed(2)}</td>
                <td className="py-3 text-right font-medium">RM {Number(item.subtotal).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>RM {Number(order.subtotal).toFixed(2)}</span>
            </div>
            {Number(order.discount_amount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- RM {Number(order.discount_amount).toFixed(2)}</span>
              </div>
            )}
            {Number(order.loyalty_discount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Loyalty Points</span>
                <span>- RM {Number(order.loyalty_discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>RM {Number(order.shipping_fee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-black text-base border-t-2 border-gray-800 pt-2">
              <span>TOTAL</span>
              <span>RM {Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment status banner */}
        {isPaid ? (
          <div className="border-2 border-green-400 rounded-xl p-4 text-center bg-green-50">
            <div className="text-green-700 font-black text-lg">✓ PAYMENT CONFIRMED</div>
            {paidAt && <div className="text-green-600 text-sm">Paid on {paidAt} via {order.payment?.gateway?.toUpperCase()}</div>}
          </div>
        ) : (
          <div className="border-2 border-yellow-400 rounded-xl p-4 text-center bg-yellow-50">
            <div className="text-yellow-700 font-bold">PAYMENT PENDING</div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          Thank you for choosing Mufflux — Malaysian Performance Exhaust Brand<br />
          For queries: 011-70099733 · info@mufflux.com · mufflux.lightningcloud.my
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
