import { getClientUrl } from '../config/clientUrl.js';

/**
 * Escape user-controlled strings for safe HTML email interpolation.
 * @param {*} value
 * @returns {string}
 */
const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Build HTML for payment failure email with retry CTA.
 * @param {Object} order
 * @param {string} [failureReason]
 * @returns {string}
 */

export const buildPaymentFailedEmail = (
  order,
  failureReason = 'Your payment could not be processed.'
) => {
  const clientUrl = getClientUrl();
  const customerName = escapeHtml(order.customerDetails?.name || 'Customer');
  const trackingNumber = escapeHtml(order.trackingNumber || '');
  const reason = escapeHtml(failureReason);
  const totalAmount = Number(order.totalAmount || 0).toLocaleString('en-IN');
  const retryUrl = `${clientUrl}/failure?orderId=${encodeURIComponent(String(order._id || ''))}&tracking=${encodeURIComponent(order.trackingNumber || '')}`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Payment Failed</title></head>
<body style="margin:0;padding:0;background:#f5f5f6;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f6;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:4px;overflow:hidden;">
        <tr>
          <td style="background:#ff3f6c;padding:24px 32px;">
            <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:1px;">MintraECM</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 8px;color:#282c3f;font-size:20px;">Payment Failed</h2>
            <p style="margin:0 0 16px;color:#535766;line-height:1.5;">
              Hi ${customerName}, we could not complete payment for your order.
            </p>
            <div style="background:#fff4f4;border-left:4px solid #ff5722;padding:12px 16px;margin-bottom:24px;">
              <p style="margin:0;color:#d32f2f;font-size:14px;">${reason}</p>
            </div>
            <div style="background:#f5f5f6;border-radius:4px;padding:16px;margin-bottom:24px;">
              <p style="margin:0 0 4px;color:#94969f;font-size:12px;text-transform:uppercase;">Order Reference</p>
              <p style="margin:0;color:#282c3f;font-size:16px;font-weight:bold;">${trackingNumber}</p>
              <p style="margin:8px 0 0;color:#535766;font-size:14px;">
                Amount: ₹${totalAmount}
              </p>
            </div>
            <p style="margin:0 0 24px;color:#535766;line-height:1.5;font-size:14px;">
              Your items are still reserved. Retry payment to confirm your order — no need to re-enter shipping details.
            </p>
            <a href="${retryUrl}"
               style="display:inline-block;background:#ff3f6c;color:#fff;text-decoration:none;padding:12px 24px;border-radius:4px;font-weight:bold;">
              Retry Payment
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#fafafa;color:#94969f;font-size:12px;text-align:center;">
            © ${new Date().getFullYear()} MintraECM · Need help? Reply to this email.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

export default buildPaymentFailedEmail;
