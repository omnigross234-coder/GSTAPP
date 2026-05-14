const nodemailer = require("nodemailer");
const fs         = require("fs");
const path       = require("path");

const smtpPort = Number(process.env.SMTP_PORT) || 465;

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST || "smtp.hostinger.com",
  port:   smtpPort,
  secure: process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE === "true"
    : smtpPort === 465,
  connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT) || 30000,
  greetingTimeout:   Number(process.env.SMTP_GREETING_TIMEOUT) || 30000,
  socketTimeout:     Number(process.env.SMTP_SOCKET_TIMEOUT) || 60000,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✅ Logo path — already in your backend/assests folder
const LOGO_PATH = path.join(__dirname, "..", "assests", "OmniGrosslogo2.png");

const sendInvoiceEmail = async ({ to, customerName, invoiceNumber, pdfBuffer }) => {
  const mailOptions = {
    from:    `"OmniGross" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Invoice ${invoiceNumber} from OmniGross`,
    html: `
<div style="
  font-family: 'Segoe UI', Arial, sans-serif;
  background:#eef3f4;
  padding:40px 20px;
">
  <div style="
    max-width:600px;
    margin:0 auto;
    background:#ffffff;
    border-radius:18px;
    overflow:hidden;
    box-shadow:0 12px 35px rgba(0,0,0,0.12);
  ">

 <!-- Header -->
<div style="
  background:linear-gradient(135deg,#0a1a1f,#12343b);
  padding:36px 24px;
  text-align:center;
">
  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
    <tr>
      <td style="vertical-align:middle; padding-right:14px;">
        <img
          src="cid:omnigross_logo"
          alt="OmniGross"
          style="height:54px; width:54px; object-fit:contain; display:block;"
        />
      </td>
      <td style="vertical-align:middle; text-align:left;">
        <div style="
          color:#ffffff;
          font-size:30px;
          font-weight:700;
          letter-spacing:0.5px;
          line-height:1.1;
          font-family:'Segoe UI',Arial,sans-serif;
        ">
          OmniGross
        </div>
        <div style="
          color:#b8d4d8;
          font-size:13px;
          letter-spacing:1.2px;
          margin-top:4px;
          font-family:'Segoe UI',Arial,sans-serif;
        ">
          GST Invoice Management System
        </div>
      </td>
    </tr>
  </table>
</div>

    <!-- Body -->
    <div style="padding:36px 30px; background:#ffffff;">

      <p style="font-size:16px; color:#1f2937; margin-bottom:18px;">
        Dear <strong>${customerName}</strong>,
      </p>

      <p style="font-size:15px; color:#4b5563; line-height:1.7;">
        Please find your invoice 
        <strong style="color:#0f766e;">${invoiceNumber}</strong>
        attached to this email.
      </p>

      <!-- Invoice Card -->
      <div style="
        background:#f5fbfa;
        border:1px solid #d7ece8;
        border-left:5px solid #0f766e;
        border-radius:14px;
        padding:22px;
        margin:28px 0;
      ">
        <p style="margin:0; font-size:13px; color:#6b7280; text-transform:uppercase; letter-spacing:1px;">
          Invoice Number
        </p>
        <p style="margin:8px 0 0; font-size:24px; font-weight:700; color:#0a1a1f;">
          ${invoiceNumber}
        </p>
      </div>

      <p style="font-size:14px; color:#555; line-height:1.7;">
        If you have any questions regarding this invoice,
        feel free to contact our support team.
      </p>

      <p style="font-size:14px; color:#555; line-height:1.7;">
        Thank you for choosing OmniGross.
      </p>

      <div style="margin-top:28px;">
        <p style="font-size:14px; color:#1f2937; margin:0;">Best regards,</p>
        <p style="font-size:16px; font-weight:700; color:#0f766e; margin:6px 0 0;">OmniGross Team</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#0a1a1f; padding:20px; text-align:center;">
      <p style="color:#9fb6bb; font-size:12px; margin:0; line-height:1.7;">
        This is an auto-generated email. Please do not reply directly.
      </p>
      <p style="color:#7fa0a6; font-size:12px; margin:8px 0 0;">
        © 2026 OmniGross. All Rights Reserved.
      </p>
      <p style="color:#5f7c82; font-size:11px; margin:4px 0 0;">
        Designed & Developed by OmniGross
      </p>
    </div>

  </div>
</div>
`,
    attachments: [
      {
        filename:    `${invoiceNumber}.pdf`,
        content:     pdfBuffer,
        contentType: "application/pdf"
      },
      {
        // ✅ Inline logo — cid must match src="cid:omnigross_logo" above
        filename: "OmniGrosslogo2.png",
        path:     LOGO_PATH,
        cid:      "omnigross_logo"
      }
    ]
  };

  return transporter.sendMail(mailOptions);
};

const sendPaymentReminder = async ({ to, customerName, invoiceNumber, totalAmount, dueDate }) => {
  const mailOptions = {
    from:    `"OmniGross" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Payment Reminder: Invoice ${invoiceNumber}`,
    html: `
<div style="
  font-family:'Segoe UI',Arial,sans-serif;
  background:#eef3f4;
  padding:40px 20px;
">
  <div style="
    max-width:600px;
    margin:0 auto;
    background:#ffffff;
    border-radius:18px;
    overflow:hidden;
    box-shadow:0 12px 35px rgba(0,0,0,0.12);
  ">

    <!-- Header -->
<div style="
  background:linear-gradient(135deg,#0a1a1f,#12343b);
  padding:36px 24px;
  text-align:center;
">
  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
    <tr>
      <td style="vertical-align:middle; padding-right:14px;">
        <img
          src="cid:omnigross_logo"
          alt="OmniGross"
          style="height:54px; width:54px; object-fit:contain; display:block;"
        />
      </td>
      <td style="vertical-align:middle; text-align:left;">
        <div style="
          color:#ffffff;
          font-size:30px;
          font-weight:700;
          letter-spacing:0.5px;
          line-height:1.1;
          font-family:'Segoe UI',Arial,sans-serif;
        ">
          OmniGross
        </div>
        <div style="
          color:#b8d4d8;
          font-size:13px;
          letter-spacing:1.2px;
          margin-top:4px;
          font-family:'Segoe UI',Arial,sans-serif;
        ">
          GST Invoice Management System
        </div>
      </td>
    </tr>
  </table>
</div>
    <!-- Body -->
    <div style="padding:36px 30px; background:#ffffff;">

      <p style="font-size:16px; color:#1f2937; margin-bottom:18px;">
        Dear <strong>${customerName}</strong>,
      </p>

      <p style="font-size:15px; color:#4b5563; line-height:1.7;">
        This is a friendly reminder that payment for invoice
        <strong style="color:#0f766e;"> ${invoiceNumber}</strong>
        is currently pending.
      </p>

      <!-- Reminder Card -->
      <div style="
        background:#f5fbfa;
        border:1px solid #d7ece8;
        border-left:5px solid #f59e0b;
        border-radius:14px;
        padding:24px;
        margin:28px 0;
      ">
        <div style="display:flex; justify-content:space-between; margin-bottom:14px; font-size:14px;">
          <span style="color:#6b7280;">Invoice Number</span>
          <strong style="color:#0a1a1f;">${invoiceNumber}</strong>
        </div>

        <div style="display:flex; justify-content:space-between; margin-bottom:14px; font-size:14px;">
          <span style="color:#6b7280;">Amount Due</span>
          <strong style="color:#dc2626; font-size:18px;">
            ₹ ${Number(totalAmount).toLocaleString("en-IN")}
          </strong>
        </div>

        <div style="display:flex; justify-content:space-between; font-size:14px;">
          <span style="color:#6b7280;">Due Date</span>
          <strong style="color:#0a1a1f;">
            ${dueDate ? new Date(dueDate).toLocaleDateString("en-IN") : "Immediate"}
          </strong>
        </div>
      </div>

      <p style="font-size:14px; color:#555; line-height:1.7;">
        Kindly process the payment at your earliest convenience
        to avoid any interruption in services.
      </p>

      <p style="font-size:14px; color:#555; line-height:1.7;">
        If the payment has already been completed, please ignore this reminder.
      </p>

      <div style="margin-top:28px;">
        <p style="font-size:14px; color:#1f2937; margin:0;">Best regards,</p>
        <p style="font-size:16px; font-weight:700; color:#0f766e; margin:6px 0 0;">OmniGross Team</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#0a1a1f; padding:20px; text-align:center;">
      <p style="color:#9fb6bb; font-size:12px; margin:0; line-height:1.7;">
        This is an auto-generated reminder email.
      </p>
      <p style="color:#7fa0a6; font-size:12px; margin:8px 0 0;">
        © 2026 OmniGross. All Rights Reserved.
      </p>
      <p style="color:#5f7c82; font-size:11px; margin:4px 0 0;">
        Designed & Developed by OmniGross
      </p>
    </div>

  </div>
</div>
`,
    attachments: [
      {
        // ✅ Inline logo for reminder email too
        filename: "OmniGrosslogo2.png",
        path:     LOGO_PATH,
        cid:      "omnigross_logo"
      }
    ]
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendInvoiceEmail, sendPaymentReminder };
