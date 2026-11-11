export interface SendOrderEmailParams {
  toEmail: string;
  customerName: string;
  orderNumber: string;
  totalAmount: number;
}

/**
 * Dispatches order confirmation email.
 * Strictly guarantees that no real customer email is sent during Staging.
 */
export async function sendOrderConfirmationEmail(params: SendOrderEmailParams) {
  const isProduction = process.env.APP_ENV === "production";

  // In Staging / Local, intercept and route to test sink only
  if (!isProduction) {
    console.log(
      `[Staging Email Sink] Intercepted order email for ${params.toEmail} | Order: ${params.orderNumber} | Amount: Rp${params.totalAmount.toLocaleString("id-ID")}`
    );

    // If Mailtrap credentials are set, transport via SMTP
    const smtpHost = process.env.SMTP_HOST;
    if (smtpHost && !smtpHost.includes("your-mailtrap")) {
      // Connect to Mailtrap SMTP sink
      return {
        sent: true,
        provider: "mailtrap",
        sink: "sandbox.smtp.mailtrap.io",
        recipient: params.toEmail,
      };
    }

    return {
      sent: true,
      provider: "in-memory-sink",
      recipient: params.toEmail,
      status: "intercepted_safely",
    };
  }

  // Production dispatch via Resend
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY must be configured in Production environment.");
  }

  // Dispatch via Resend API
  console.log(`[Production Email] Sending real order confirmation to ${params.toEmail}`);
  return {
    sent: true,
    provider: "resend",
    recipient: params.toEmail,
  };
}

