const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  try {
    require('dotenv').config({ path: path.join(__dirname, '../../.env') });
    require('dotenv').config();
  } catch (e) {}

  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const user = process.env.EMAIL_USER;
  const rawPass = process.env.EMAIL_PASS || '';
  const pass = rawPass.replace(/\s+/g, '');

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587
      auth: {
        user,
        pass
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  return null;
};

/**
 * Send Booking Confirmation Email to Customer and Admin Alert
 * @param {Object} booking - Mongoose Booking document or object
 */
const sendBookingNotification = async (booking) => {
  const customerEmail = booking.email ? booking.email.trim() : null;

  if (!customerEmail) {
    console.log(`ℹ️ [EmailService] No email provided for booking #${booking._id}. Skipping email.`);
    return { success: false, reason: 'no_email' };
  }

  const transporter = createTransporter();

  if (!transporter) {
    console.warn(`⚠️ [EmailService] EMAIL_USER or EMAIL_PASS is not configured in backend/.env. Cannot send real email to ${customerEmail}.`);
    console.warn(`👉 To send real emails: add EMAIL_USER (your Gmail) and EMAIL_PASS (16-char Google App Password) in backend/.env`);
    return { success: false, reason: 'smtp_not_configured' };
  }

  const formattedDate = booking.date ? new Date(booking.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'To be confirmed';

  const bookingRef = booking._id ? String(booking._id).slice(-6).toUpperCase() : 'PENDING';
  const fromAddress = process.env.EMAIL_FROM || `"Jai Sai Travels" <${process.env.EMAIL_USER}>`;

  // HTML Template for Customer
  const customerHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Inquiry Confirmation - Jai Sai Travels</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 30px 10px;">
      <tr>
        <td align="center">
          <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background: #1e293b; border-radius: 16px; border: 1px solid rgba(251, 191, 36, 0.3); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            
            <!-- Header Banner -->
            <tr>
              <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 35px 30px; text-align: center; border-bottom: 2px solid #f59e0b;">
                <div style="font-size: 28px; font-weight: 900; letter-spacing: 1px; color: #f59e0b; margin-bottom: 6px;">
                  🚕 JAI SAI TRAVELS
                </div>
                <div style="font-size: 13px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 2px;">
                  Premier Luxury Car Rental & Tours • Since 2005
                </div>
              </td>
            </tr>

            <!-- Booking Status Badge -->
            <tr>
              <td style="padding: 30px 30px 15px 30px; text-align: center;">
                <div style="display: inline-block; background-color: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: #34d399; font-size: 14px; font-weight: bold; padding: 8px 18px; rounded: 50px; border-radius: 50px; margin-bottom: 15px;">
                  ✓ Trip Inquiry Received
                </div>
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 10px 0;">
                  Namaste, ${booking.name}!
                </h1>
                <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0;">
                  Thank you for choosing <strong>Jai Sai Travels</strong>. We have received your booking inquiry for our luxury fleet. Our team is reviewing the itinerary and will call you within <strong style="color: #f59e0b;">15 minutes</strong> to confirm dispatch details.
                </p>
              </td>
            </tr>

            <!-- Booking Summary Card -->
            <tr>
              <td style="padding: 15px 30px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px;">
                  <tr>
                    <td colspan="2" style="padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 14px; font-weight: bold; color: #f59e0b;">
                      TRIP INQUIRY DETAILS (REF: #JST-${bookingRef})
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #94a3b8; font-size: 14px; width: 40%;">Travel Service:</td>
                    <td style="padding: 10px 0; color: #f8fafc; font-size: 14px; font-weight: 600;">${booking.service}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #94a3b8; font-size: 14px;">Travel Date:</td>
                    <td style="padding: 10px 0; color: #f8fafc; font-size: 14px; font-weight: 600;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #94a3b8; font-size: 14px;">Contact Number:</td>
                    <td style="padding: 10px 0; color: #f8fafc; font-size: 14px; font-weight: 600;">${booking.phone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #94a3b8; font-size: 14px;">Email Address:</td>
                    <td style="padding: 10px 0; color: #f8fafc; font-size: 14px; font-weight: 600;">${booking.email}</td>
                  </tr>
                  ${booking.message ? `
                  <tr>
                    <td style="padding: 10px 0; color: #94a3b8; font-size: 14px; vertical-align: top;">Notes / Message:</td>
                    <td style="padding: 10px 0; color: #cbd5e1; font-size: 13px;">${booking.message}</td>
                  </tr>` : ''}
                </table>
              </td>
            </tr>

            <!-- Call to Actions -->
            <tr>
              <td style="padding: 20px 30px; text-align: center;">
                <p style="color: #cbd5e1; font-size: 14px; margin-bottom: 20px;">
                  Need urgent confirmation or want to talk to us directly right now?
                </p>
                <div>
                  <a href="tel:+919224395804" style="display: inline-block; background-color: #f59e0b; color: #0f172a; font-size: 14px; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 5px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                    📞 Call Dispatch (+91 9224395804)
                  </a>
                  <a href="https://wa.me/919224395804?text=Hello%20Jai%20Sai%20Travels,%20I%20just%20submitted%20booking%20#JST-${bookingRef}" style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 5px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                    💬 WhatsApp Us
                  </a>
                </div>
              </td>
            </tr>

            <!-- Footer Section -->
            <tr>
              <td style="background-color: #0f172a; padding: 25px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: #64748b;">
                <p style="margin: 0 0 6px 0; color: #94a3b8; font-weight: 600;">
                  Jai Sai Travels • 21+ Years of Travel Excellence
                </p>
                <p style="margin: 0 0 6px 0;">
                  Goregaon West, Mumbai 400104, Maharashtra, India
                </p>
                <p style="margin: 0;">
                  Helplines: +91 9224395804 / +91 9702295804 • Email: jaisaitravels@rocketmail.com
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  // Admin Notification Email HTML
  const adminHtml = `
  <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f1f5f9; color: #1e293b;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 25px; border-radius: 10px; border-left: 6px solid #f59e0b;">
      <h2 style="color: #0f172a; margin-top: 0;">🚨 New Booking Inquiry Received!</h2>
      <p style="font-size: 15px;">A new customer has submitted an inquiry on the Jai Sai Travels website:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
        <tr><td style="padding: 8px 0; font-weight: bold; width: 35%;">Customer Name:</td><td style="padding: 8px 0;">${booking.name}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Mobile Number:</td><td style="padding: 8px 0;"><a href="tel:${booking.phone}" style="color: #0284c7; font-weight: bold;">${booking.phone}</a></td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${booking.email}">${booking.email}</a></td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Selected Service:</td><td style="padding: 8px 0; font-weight: bold; color: #d97706;">${booking.service}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Travel Date:</td><td style="padding: 8px 0;">${formattedDate}</td></tr>
        ${booking.message ? `<tr><td style="padding: 8px 0; font-weight: bold;">Notes:</td><td style="padding: 8px 0;">${booking.message}</td></tr>` : ''}
      </table>

      <div style="margin-top: 20px;">
        <a href="https://wa.me/${booking.phone.replace(/[^0-9]/g, '')}" style="background-color: #22c55e; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; margin-right: 10px;">
          💬 Chat on WhatsApp
        </a>
        <a href="tel:${booking.phone}" style="background-color: #0284c7; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          📞 Call Customer Now
        </a>
      </div>
    </div>
  </div>
  `;

  try {
    console.log(`📤 [EmailService] Sending confirmation to customer: ${customerEmail}...`);
    const customerInfo = await transporter.sendMail({
      from: fromAddress,
      replyTo: process.env.EMAIL_USER,
      to: customerEmail,
      subject: `Booking Inquiry Confirmed (#JST-${bookingRef}) - Jai Sai Travels`,
      html: customerHtml
    });
    console.log(`✅ [EmailService] Customer email sent successfully! MessageId: ${customerInfo.messageId}`);

    // Send Admin notification
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_USER;
    if (adminEmail) {
      console.log(`📤 [EmailService] Sending admin alert to ${adminEmail}...`);
      await transporter.sendMail({
        from: fromAddress,
        replyTo: customerEmail,
        to: adminEmail,
        subject: `🚨 New Booking: ${booking.name} (${booking.service}) - Jai Sai Travels`,
        html: adminHtml
      });
      console.log(`✅ [EmailService] Admin alert sent successfully!`);
    }

    return { success: true, messageId: customerInfo.messageId };
  } catch (err) {
    console.error(`❌ [EmailService] Failed to send email: ${err.message}`);
    return { success: false, error: err.message };
  }
};

/**
 * Send Booking Status Update Email to Customer (Confirmed, Completed with Greet, or Pending)
 * @param {Object} booking - Mongoose Booking document or object
 * @param {String} status - 'confirmed' | 'completed' | 'pending'
 */
const sendBookingStatusEmail = async (booking, status) => {
  const customerEmail = booking.email ? booking.email.trim() : null;

  if (!customerEmail) {
    console.log(`ℹ️ [EmailService] No email for booking #${booking._id}. Skipping status email.`);
    return { success: false, reason: 'no_email' };
  }

  const transporter = createTransporter();
  if (!transporter) {
    console.warn(`⚠️ [EmailService] SMTP not configured. Cannot send status email to ${customerEmail}.`);
    return { success: false, reason: 'smtp_not_configured' };
  }

  const bookingRef = booking._id ? String(booking._id).slice(-6).toUpperCase() : 'BOOKING';
  const fromAddress = process.env.EMAIL_FROM || `"Jai Sai Travels" <${process.env.EMAIL_USER}>`;
  const formattedDate = booking.date ? new Date(booking.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'Scheduled Date';

  let subject = '';
  let badgeBg = '';
  let badgeBorder = '';
  let badgeColor = '';
  let badgeText = '';
  let headline = '';
  let mainMessage = '';
  let extraNotice = '';
  let actionButtons = '';

  if (status === 'confirmed') {
    subject = `🎉 Booking Confirmed! - Jai Sai Travels | #JST-${bookingRef}`;
    badgeBg = 'rgba(16, 185, 129, 0.15)';
    badgeBorder = '#10b981';
    badgeColor = '#34d399';
    badgeText = '✓ TRIP OFFICIALLY CONFIRMED';
    headline = 'Your Trip is Confirmed!';
    mainMessage = `
      <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">
        Dear <strong>${booking.name}</strong>,
      </p>
      <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">
        Great news! Your booking with <strong style="color: #f59e0b;">Jai Sai Travels</strong> has been <strong style="color: #34d399;">OFFICIALLY CONFIRMED</strong> by our operations desk.
      </p>
      <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0;">
        Your premium <strong style="color: #ffffff;">Toyota Innova Crysta</strong> is reserved for your journey. We are committed to making your road trip safe, punctual, and remarkably comfortable.
      </p>
    `;
    extraNotice = `
      <div style="background-color: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 6px; margin: 20px 0; color: #a7f3d0; font-size: 14px; line-height: 1.5;">
        <strong>Chauffeur Allotment Notice:</strong> Your assigned chauffeur's name, direct contact number, and vehicle registration number will be dispatched to your phone via WhatsApp 2 to 3 hours prior to pickup.
      </div>
    `;
    actionButtons = `
      <a href="tel:+919224395804" style="display: inline-block; background-color: #f59e0b; color: #0f172a; font-size: 14px; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 5px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
        📞 Call Dispatch: +91 9224395804
      </a>
      <a href="https://wa.me/919224395804?text=Hello%20Jai%20Sai%20Travels,%20regarding%20my%20confirmed%20booking%20#JST-${bookingRef}" style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 5px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
        💬 WhatsApp Support
      </a>
    `;
  } else if (status === 'completed') {
    subject = `🙏 Trip Completed - How was your ride? Review Jai Sai Travels on Google`;
    badgeBg = 'rgba(245, 158, 11, 0.15)';
    badgeBorder = '#f59e0b';
    badgeColor = '#f59e0b';
    badgeText = '✨ TRIP COMPLETED WITH PLEASURE';
    headline = 'Thank You for Traveling With Us!';
    mainMessage = `
      <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">
        Namaste <strong>${booking.name}</strong>,
      </p>
      <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">
        Warm greetings and heartfelt thanks from the entire family at <strong style="color: #f59e0b;">Jai Sai Travels</strong>! 🙏
      </p>
      <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">
        We would like to express our deepest gratitude for choosing us for your trip (<strong>${booking.service}</strong>). It was our absolute privilege to serve you.
      </p>
      <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0;">
        We sincerely hope you experienced a relaxing, clean, safe, and luxurious journey with our Toyota Innova Crysta and chauffeur. Your satisfaction is our highest reward.
      </p>
    `;
    const googleReviewUrl = process.env.GOOGLE_REVIEW_URL || 'https://www.google.com/search?q=JAI+SAI+TRAVELS+%7B+Rent-A-Car%7D+Harmony+Mall+Goregaon+West+Mumbai#lrd=0x0:0x0,3';

    extraNotice = `
      <!-- Google Review & Rating Box -->
      <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%); border: 2px solid #f59e0b; border-radius: 14px; padding: 24px 20px; margin: 24px 0; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.45);">
        <p style="color: #f8fafc; font-size: 15px; font-weight: 600; margin: 0 0 16px 0; line-height: 1.6;">
          Did you enjoy our car & chauffeur service? Your valuable feedback and rating on Google motivates our team and helps fellow travelers find trusted rides!
        </p>
        <div>
          <a href="${googleReviewUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #0f172a; font-size: 14px; font-weight: 900; text-decoration: none; padding: 14px 30px; border-radius: 50px; box-shadow: 0 4px 18px rgba(245, 158, 11, 0.45); text-transform: uppercase; letter-spacing: 0.5px;">
            ⭐⭐⭐⭐⭐ Write a Review on Google
          </a>
        </div>
        <div style="margin-top: 14px;">
          <a href="${googleReviewUrl}" target="_blank" style="color: #fbbf24; font-size: 12px; text-decoration: underline; word-break: break-all;">
            ${googleReviewUrl}
          </a>
        </div>
      </div>

      <div style="background-color: rgba(245, 158, 11, 0.08); border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 6px; margin: 20px 0; color: #fde68a; font-size: 13px; line-height: 1.5;">
        <strong>Plan Your Next Journey With Us:</strong> Save our helplines <strong>+91 9224395804 / +91 9702295804</strong> for your upcoming holiday tours, outstation trips, airport pickups, or family events!
      </div>
    `;
    actionButtons = `
      <a href="${googleReviewUrl}" target="_blank" style="display: inline-block; background-color: #f59e0b; color: #0f172a; font-size: 14px; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 5px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
        ⭐ Rate Us on Google
      </a>
      <a href="https://wa.me/919224395804?text=Hello%20Jai%20Sai%20Travels,%20I%20would%20like%20to%20share%20my%20feedback%20for%20trip%20#JST-${bookingRef}" style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 5px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
        💬 Share on WhatsApp
      </a>
    `;
  } else {
    // pending
    subject = `⏳ Booking Status: Under Review (#JST-${bookingRef}) - Jai Sai Travels`;
    badgeBg = 'rgba(59, 130, 246, 0.15)';
    badgeBorder = '#3b82f6';
    badgeColor = '#60a5fa';
    badgeText = '⏳ STATUS: UNDER REVIEW';
    headline = 'Booking Under Review';
    mainMessage = `
      <p style="color: #94a3b8; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">
        Dear <strong>${booking.name}</strong>,
      </p>
      <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">
        Your booking request (#JST-${bookingRef}) for <strong style="color: #f59e0b;">${booking.service}</strong> is currently marked as <strong style="color: #60a5fa;">Pending / Under Review</strong>.
      </p>
      <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin: 0;">
        Our dispatch desk is reviewing vehicle fleet availability and driver schedules. We will contact you or update the status shortly.
      </p>
    `;
    extraNotice = `
      <div style="background-color: rgba(59, 130, 246, 0.1); border-left: 4px solid #3b82f6; padding: 14px 18px; border-radius: 6px; margin: 20px 0; color: #bfdbfe; font-size: 14px; line-height: 1.5;">
        If you have urgent travel plans, please connect with us directly on call or WhatsApp for immediate confirmation.
      </div>
    `;
    actionButtons = `
      <a href="tel:+919224395804" style="display: inline-block; background-color: #f59e0b; color: #0f172a; font-size: 14px; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 5px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
        📞 Call Now: +91 9224395804
      </a>
      <a href="https://wa.me/919224395804?text=Hello%20Jai%20Sai%20Travels,%20checking%20status%20for%20booking%20#JST-${bookingRef}" style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 8px; margin: 5px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
        💬 Chat on WhatsApp
      </a>
    `;
  }

  const statusHtml = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; padding: 30px 10px;">
      <tr>
        <td align="center">
          <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background: #1e293b; border-radius: 16px; border: 1px solid rgba(251, 191, 36, 0.3); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
            
            <!-- Header Banner -->
            <tr>
              <td style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 35px 30px; text-align: center; border-bottom: 2px solid #f59e0b;">
                <div style="font-size: 28px; font-weight: 900; letter-spacing: 1px; color: #f59e0b; margin-bottom: 6px;">
                  🚕 JAI SAI TRAVELS
                </div>
                <div style="font-size: 13px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 2px;">
                  Premier Luxury Car Rental & Tours • Since 2005
                </div>
              </td>
            </tr>

            <!-- Status Badge & Headline -->
            <tr>
              <td style="padding: 30px 30px 15px 30px; text-align: center;">
                <div style="display: inline-block; background-color: ${badgeBg}; border: 1px solid ${badgeBorder}; color: ${badgeColor}; font-size: 13px; font-weight: 800; padding: 7px 18px; border-radius: 50px; margin-bottom: 15px; letter-spacing: 1px;">
                  ${badgeText}
                </div>
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 15px 0;">
                  ${headline}
                </h1>
                ${mainMessage}
              </td>
            </tr>

            <!-- Trip Summary Card -->
            <tr>
              <td style="padding: 15px 30px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px;">
                  <tr>
                    <td colspan="2" style="padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 14px; font-weight: bold; color: #f59e0b;">
                      TRIP SUMMARY (BOOKING REF: #JST-${bookingRef})
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #94a3b8; font-size: 14px; width: 40%;">Passenger Name:</td>
                    <td style="padding: 10px 0; color: #f8fafc; font-size: 14px; font-weight: 600;">${booking.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #94a3b8; font-size: 14px;">Travel Service:</td>
                    <td style="padding: 10px 0; color: #f8fafc; font-size: 14px; font-weight: 600;">${booking.service}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #94a3b8; font-size: 14px;">Travel Date:</td>
                    <td style="padding: 10px 0; color: #f8fafc; font-size: 14px; font-weight: 600;">${formattedDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #94a3b8; font-size: 14px;">Registered Mobile:</td>
                    <td style="padding: 10px 0; color: #f8fafc; font-size: 14px; font-weight: 600;">${booking.phone}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #94a3b8; font-size: 14px;">Current Status:</td>
                    <td style="padding: 10px 0; color: ${badgeColor}; font-size: 14px; font-weight: 800; text-transform: uppercase;">${status}</td>
                  </tr>
                </table>

                ${extraNotice}
              </td>
            </tr>

            <!-- Call to Actions -->
            <tr>
              <td style="padding: 10px 30px 25px 30px; text-align: center;">
                <div>
                  ${actionButtons}
                </div>
              </td>
            </tr>

            <!-- Footer Section -->
            <tr>
              <td style="background-color: #0f172a; padding: 25px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); font-size: 12px; color: #64748b;">
                <p style="margin: 0 0 6px 0; color: #94a3b8; font-weight: 600;">
                  Jai Sai Travels • 21+ Years of Travel Excellence
                </p>
                <p style="margin: 0 0 6px 0;">
                  Goregaon West, Mumbai 400104, Maharashtra, India
                </p>
                <p style="margin: 0;">
                  Helplines: +91 9224395804 / +91 9702295804 • Email: jaisaitravels@rocketmail.com
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  try {
    console.log(`📤 [EmailService] Sending [${status.toUpperCase()}] status update to customer: ${customerEmail}...`);
    
    const mailOptions = {
      from: fromAddress,
      replyTo: process.env.EMAIL_USER,
      to: customerEmail,
      subject,
      html: statusHtml
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EmailService] Status email (${status}) sent successfully! MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ [EmailService] Failed to send status update email: ${err.message}`);
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendBookingNotification,
  sendBookingStatusEmail
};
