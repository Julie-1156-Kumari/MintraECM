import { getClientUrl } from "../config/clientUrl.js";

/**
 * Escape user-controlled strings for safe HTML email interpolation.
 * @param {*} value
 * @returns {string}
 */
const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/**
 * Build HTML for order confirmation email.
 * @param {Object} order
 * @returns {string}
 */

export const buildOrderConfirmationEmail = (order) => {
  const clientUrl = getClientUrl();
  const customerName = escapeHtml(order.customerDetails?.name || "Customer");
  const trackingNumber = escapeHtml(order.trackingNumber || "");
  const totalAmount = Number(order.totalAmount || 0).toLocaleString("en-IN");

  const itemsHtml = (order.items || [])
    .map((item) => {
      const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
      return `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eee;">
          <strong style="color:#282c3f;">${escapeHtml(item.brand)}</strong><br/>
          <span style="color:#535766;">${escapeHtml(item.name)}</span><br/>
          <span style="color:#94969f;font-size:13px;">Size: ${escapeHtml(item.size)} · Qty: ${escapeHtml(item.quantity)}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #eee;text-align:right;color:#282c3f;">
          ₹${lineTotal.toLocaleString("en-IN")}
        </td>
      </tr>`;
    })
    .join("");

  const addr = order.shippingAddress || {};
  const trackUrl = `${clientUrl}/tracking/${encodeURIComponent(order.trackingNumber || "")}`;

  return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmed</title>
      </head>
      <body style="margin:0;padding:0;background:#f5f5f6;font-family:Arial,Helvetica,sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f6;padding:32px 16px;">
          <tr><td align="center">
            <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:4px;overflow:hidden;">
              <tr>
                <td style="background:#ff3f6c;padding:24px 32px;">
                  <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:1px;">MINTRAECM</h1>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  <h2 style="margin:0 0 8px;color:#282c3f;font-size:20px;">Order Confirmed</h2>
                  <p style="margin:0 0 24px;color:#535766;line-height:1.5;">
                    Hi ${customerName}, thanks for shopping with MintraECM.
                    Your payment was successful and your order is being prepared.
                  </p>
                  <div style="background:#f5f5f6;border-radius:4px;padding:16px;margin-bottom:24px;">
                    <p style="margin:0 0 4px;color:#94969f;font-size:12px;text-transform:uppercase;">Tracking Number</p>
                    <p style="margin:0;color:#282c3f;font-size:18px;font-weight:bold;letter-spacing:1px;">${trackingNumber}</p>
                  </div>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${itemsHtml}</table>
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;">
                    <tr>
                      <td style="padding:8px 0;color:#535766;">Total Paid</td>
                      <td style="padding:8px 0;text-align:right;color:#03a685;font-weight:bold;font-size:18px;">
                        ₹${totalAmount}
                      </td>
                    </tr>
                  </table>
                  <p style="margin:24px 0 8px;color:#282c3f;font-weight:bold;">Shipping To</p>
                  <p style="margin:0;color:#535766;line-height:1.5;font-size:14px;">
                    ${escapeHtml(addr.flatNo)}, ${escapeHtml(addr.area)}, ${escapeHtml(addr.town)}<br/>
                    ${escapeHtml(addr.city)}, ${escapeHtml(addr.state)} — ${escapeHtml(addr.pinCode)}
                  </p>
                  <a href="${trackUrl}"
                    style="display:inline-block;margin-top:28px;background:#ff3f6c;color:#fff;text-decoration:none;padding:12px 24px;border-radius:4px;font-weight:bold;">
                    Track Your Order
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding:16px 32px;background:#fafafa;color:#94969f;font-size:12px;text-align:center;">
                  © ${new Date().getFullYear()} MintraECM · Guest checkout order
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
    </html>`;
};
