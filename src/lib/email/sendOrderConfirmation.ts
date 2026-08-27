import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { sendEmail } from '@/lib/email/nodemailer';
import {
  generateOrderConfirmationEmailHtml,
  generateOrderConfirmationEmailText,
  OrderConfirmationEmailData,
} from '@/lib/email/templates/orderConfirmationTemplate';
import { getStoreSettingsServer } from '@/services/settings/getStoreSettingsServer';
import { SITE } from '@/lib/seo';

export type SendOrderConfirmationPayload = Omit<
  OrderConfirmationEmailData,
  'storeName' | 'storeEmail' | 'storePhone' | 'storeAddress' | 'storeUrl'
> & {
  storeName?: string;
  storeEmail?: string;
  storePhone?: string;
  storeAddress?: string;
  storeUrl?: string;
};

export async function sendOrderConfirmationEmail(
  payload: SendOrderConfirmationPayload
) {
  try {
    if (!payload.customerEmail || !payload.customerEmail.includes('@')) {
      console.log(
        `[Nodemailer] No customer email provided for order #${payload.orderId}. Skipping email dispatch.`
      );
      return { ok: false, error: 'No recipient email provided' };
    }

    const settings = await getStoreSettingsServer();
    const storeName = payload.storeName || SITE.name || 'Thriftonia';
    const storeEmail = payload.storeEmail || settings.email || 'admin@thriftonia.pk';
    const storePhone = payload.storePhone || settings.phone || '0310-0021434';
    const storeAddress = payload.storeAddress || settings.address || 'Karachi, Pakistan';
    const storeUrl = payload.storeUrl || SITE.url || 'https://www.thriftonia.pk';

    const fullData: OrderConfirmationEmailData = {
      ...payload,
      storeName,
      storeEmail,
      storePhone,
      storeAddress,
      storeUrl,
      logoCid: 'brand-logo',
    };

    const html = generateOrderConfirmationEmailHtml(fullData);
    const text = generateOrderConfirmationEmailText(fullData);

    const attachments: Array<{
      filename: string;
      content?: Buffer;
      path?: string;
      cid?: string;
      contentType?: string;
    }> = [];

    // Attach brand logo with CID for crisp, unblocked rendering in email clients
    const logoPaths = [
      join(process.cwd(), 'public', 'brand-logo-2.png'),
      join(process.cwd(), 'public', 'brand-logo.png'),
    ];

    for (const logoPath of logoPaths) {
      if (existsSync(logoPath)) {
        try {
          const logoBuffer = await readFile(logoPath);
          attachments.push({
            filename: 'brand-logo.png',
            content: logoBuffer,
            cid: 'brand-logo',
            contentType: 'image/png',
          });
          break;
        } catch (err) {
          console.warn('[Nodemailer] Could not read logo file for attachment:', err);
        }
      }
    }

    const subject = `Order Confirmation #${payload.orderId} - ${storeName}`;

    return await sendEmail({
      to: payload.customerEmail,
      subject,
      html,
      text,
      attachments,
    });
  } catch (err) {
    console.error(`[Nodemailer] Error preparing order confirmation email for #${payload.orderId}:`, err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Failed to send confirmation email',
    };
  }
}
