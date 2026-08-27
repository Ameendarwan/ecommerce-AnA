import { formatCurrency } from '@/utils/formatCurrency';

export interface OrderItemEmailDetail {
  product_id: string;
  title: string;
  quantity: number;
  price: number;
  image?: string | null;
}

export interface OrderConfirmationEmailData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingStreet: string;
  shippingCity: string;
  shippingNotes?: string | null;
  items: OrderItemEmailDetail[];
  subtotal: number;
  shippingFee: number;
  total: number;
  orderDate?: string;
  storeName?: string;
  storeEmail?: string;
  storePhone?: string;
  storeAddress?: string;
  storeUrl?: string;
  logoCid?: string;
  logoUrl?: string;
}

export function generateOrderConfirmationEmailHtml(
  data: OrderConfirmationEmailData
): string {
  const {
    orderId,
    customerName,
    customerPhone,
    shippingStreet,
    shippingCity,
    shippingNotes,
    items,
    subtotal,
    shippingFee,
    total,
    orderDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    storeName = 'Thriftonia',
    storeEmail = 'admin@thriftonia.pk',
    storePhone = '0310-0021434',
    storeUrl = 'https://www.thriftonia.pk',
    logoCid = 'brand-logo',
  } = data;

  const formattedRequestId = `REQ-${orderId}`;
  const cleanPhone = storePhone.replace(/[\s-]/g, '');
  const whatsAppPhone = cleanPhone.startsWith('0')
    ? `92${cleanPhone.slice(1)}`
    : cleanPhone.startsWith('+')
    ? cleanPhone.replace('+', '')
    : cleanPhone;

  const whatsAppUrl = `https://wa.me/${whatsAppPhone}?text=${encodeURIComponent(
    `Hi ${storeName}, I have placed order #${orderId} (REQ-${orderId}). Please find my details.`
  )}`;

  const itemsHtml = items
    .map((item) => {
      const itemImg = item.image
        ? `<img src="${item.image}" alt="${item.title}" width="56" height="56" style="width: 56px; height: 56px; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; display: block;" />`
        : `<div style="width: 56px; height: 56px; border-radius: 8px; background-color: #f1f5f9; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center; text-align: center; color: #94a3b8; font-size: 11px; font-weight: 500; line-height: 56px;">No Image</div>`;

      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: middle; width: 68px;">
            ${itemImg}
          </td>
          <td style="padding: 12px 10px; border-bottom: 1px solid #f1f5f9; vertical-align: middle;">
            <div style="font-weight: 600; color: #1e293b; font-size: 14px; line-height: 1.4;">${item.title}</div>
            <div style="color: #64748b; font-size: 13px; margin-top: 2px;">Qty: <strong>${item.quantity}</strong> × ${formatCurrency(item.price)}</div>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: middle; text-align: right; font-weight: 600; color: #0f172a; font-size: 14px;">
            ${formatCurrency(item.price * item.quantity)}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Thank you for your order - ${storeName}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      color: #334155;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    @media only screen and (max-width: 620px) {
      .email-container {
        width: 100% !important;
        padding: 10px !important;
      }
      .content-padding {
        padding: 20px 16px !important;
      }
      .header-banner {
        padding: 22px 18px !important;
      }
      .header-title {
        font-size: 20px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 0; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <center>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;" class="email-container">
      <tr>
        <td style="padding: 0;">
          
          <!-- MAIN CARD CONTAINER -->
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
            
            <!-- TOP PORTION (Image 2 style): Header banner with brand color -->
            <tr>
              <td style="background-color: #486581; padding: 28px 32px;" class="header-banner">
                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.02em;" class="header-title">
                  Thank you for your order
                </h1>
              </td>
            </tr>

            <!-- GREETING & INTRO MESSAGE -->
            <tr>
              <td style="padding: 28px 32px 16px 32px;" class="content-padding">
                <p style="margin: 0 0 14px 0; font-size: 16px; font-weight: 600; color: #1e293b;">
                  Hi ${customerName},
                </p>
                <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                  Thanks for your order. It's on-hold until we confirm that payment has been received or verified for delivery.
                </p>
                <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                  If you want to transfer via Bank / EasyPaisa / JazzCash, please first WhatsApp us your order ID (<strong>${formattedRequestId}</strong>) and ask for account details. Once your payment is transferred, send us the screenshot.
                </p>

                <!-- ORDER DETAILS KEY-VALUE CARD (Image 1 style) -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 24px; background-color: #ffffff;">
                  <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 500;">
                      Request ID
                    </td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-size: 14px; font-weight: 700;">
                      ${formattedRequestId}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 500;">
                      Brand:
                    </td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-size: 14px; font-weight: 600;">
                      ${storeName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 500;">
                      Category:
                    </td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-size: 14px; font-weight: 500;">
                      E-Commerce
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 500;">
                      Country:
                    </td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-size: 14px; font-weight: 500;">
                      Pakistan
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 500;">
                      Payment Method:
                    </td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-size: 14px; font-weight: 600;">
                      Cash on Delivery (COD)
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; color: #64748b; font-size: 13px; font-weight: 500;">
                      Order Date:
                    </td>
                    <td style="padding: 12px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #0f172a; font-size: 13px; font-weight: 500;">
                      ${orderDate}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 16px; color: #64748b; font-size: 13px; font-weight: 500;">
                      Status:
                    </td>
                    <td style="padding: 12px 16px; text-align: right;">
                      <span style="display: inline-block; background-color: #fef3c7; color: #b45309; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; text-transform: capitalize;">
                        Pending Confirmation
                      </span>
                    </td>
                  </tr>
                </table>

                <!-- ORDERED ITEMS SECTION -->
                <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #1e293b;">
                  Ordered Items (${items.reduce((s, i) => s + i.quantity, 0)})
                </h3>
                
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                  ${itemsHtml}
                </table>

                <!-- PRICING SUMMARY -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Subtotal</td>
                    <td style="padding: 4px 0; text-align: right; color: #0f172a; font-size: 13px; font-weight: 500;">${formatCurrency(subtotal)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Shipping</td>
                    <td style="padding: 4px 0; text-align: right; color: #0f172a; font-size: 13px; font-weight: 500;">${formatCurrency(shippingFee)}</td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top: 8px; border-top: 1px solid #e2e8f0;"></td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #0f172a; font-size: 16px; font-weight: 700;">Total</td>
                    <td style="padding: 4px 0; text-align: right; color: #0f172a; font-size: 18px; font-weight: 800;">${formatCurrency(total)}</td>
                  </tr>
                </table>

                <!-- SHIPPING ADDRESS (Image 1 Callout Box Style) -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; padding: 16px; margin-bottom: 20px;">
                  <tr>
                    <td>
                      <div style="font-size: 13px; font-weight: 700; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.04em;">
                        Delivery Address
                      </div>
                      <div style="font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 4px;">
                        ${customerName} (${customerPhone})
                      </div>
                      <div style="font-size: 14px; color: #475569; line-height: 1.5;">
                        ${shippingStreet}, ${shippingCity}, Pakistan
                      </div>
                      ${
                        shippingNotes
                          ? `<div style="font-size: 13px; color: #64748b; margin-top: 6px; font-style: italic;">Note: ${shippingNotes}</div>`
                          : ''
                      }
                    </td>
                  </tr>
                </table>

                <!-- SUPPORT & CONTACT INSTRUCTIONS -->
                <p style="margin: 0 0 20px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                  If you have questions, reach out to our WhatsApp support at <strong>${storePhone}</strong> or email <strong>${storeEmail}</strong>.
                </p>

                <!-- CALL TO ACTION BUTTON (Image 1 style) -->
                <div style="margin: 20px 0 28px 0; text-align: left;">
                  <a href="${whatsAppUrl}" target="_blank" style="background-color: #243b53; background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 9999px; display: inline-block; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);">
                    WhatsApp Support (${storePhone})
                  </a>
                </div>

                <!-- SIGN-OFF -->
                <p style="margin: 0 0 4px 0; font-size: 14px; color: #475569;">
                  Thank you,
                </p>
                <p style="margin: 0 0 24px 0; font-size: 14px; font-weight: 600; color: #0f172a;">
                  The ${storeName} Team
                </p>

                <!-- BOTTOM BANNER / BRAND LOGO CARD (Image 1 style) -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background: linear-gradient(135deg, #090e1a 0%, #172554 100%); border-radius: 12px; margin-top: 10px; padding: 24px 16px; text-align: center;">
                  <tr>
                    <td align="center">
                      <a href="${storeUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
                        <img src="cid:${logoCid}" alt="${storeName}" width="160" style="width: 160px; max-width: 100%; height: auto; display: block; margin: 0 auto;" />
                      </a>
                      <div style="color: #94a3b8; font-size: 12px; margin-top: 10px; letter-spacing: 0.02em;">
                        Style for less, quality for more
                      </div>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding: 16px 32px 24px 32px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                  © ${new Date().getFullYear()} ${storeName}. All rights reserved. • <a href="${storeUrl}" target="_blank" style="color: #64748b; text-decoration: underline;">Visit Store</a>
                </p>
              </td>
            </tr>

          </table>
          
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
  `.trim();
}

export function generateOrderConfirmationEmailText(
  data: OrderConfirmationEmailData
): string {
  const {
    orderId,
    customerName,
    shippingStreet,
    shippingCity,
    items,
    subtotal,
    shippingFee,
    total,
    storeName = 'Thriftonia',
    storePhone = '0310-0021434',
    storeEmail = 'admin@thriftonia.pk',
  } = data;

  const itemsList = items
    .map(
      (item) =>
        `- ${item.title} x ${item.quantity}: ${formatCurrency(item.price * item.quantity)}`
    )
    .join('\n');

  return `
THANK YOU FOR YOUR ORDER

Hi ${customerName},

Thanks for your order. It's on-hold until we confirm that payment has been received or verified for delivery.

If you want to transfer via Bank, please first WhatsApp us your order ID (REQ-${orderId}) and ask for account details.

ORDER SUMMARY:
Request ID: REQ-${orderId}
Brand: ${storeName}
Payment Method: Cash on Delivery (COD)

ITEMS:
${itemsList}

Subtotal: ${formatCurrency(subtotal)}
Shipping: ${formatCurrency(shippingFee)}
Total: ${formatCurrency(total)}

DELIVERY ADDRESS:
${customerName}
${shippingStreet}, ${shippingCity}, Pakistan

If you have questions, reach out to our WhatsApp support at ${storePhone} or email ${storeEmail}.

Thank you,
The ${storeName} Team
  `.trim();
}
