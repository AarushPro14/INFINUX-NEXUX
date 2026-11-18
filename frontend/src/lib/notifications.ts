type StaffAccessRequestNotice = {
  requesterName: string;
  requesterEmail: string;
  contactNumber: string;
  whatsappNumber: string;
  companyName: string;
  companyCode: string;
  message: string;
  requestId: string;
};

export function hasMailConfiguration() {
  return Boolean(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID &&
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID &&
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
  );
}

export async function sendStaffAccessRequestEmail(notice: StaffAccessRequestNotice) {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  if (!serviceId || !templateId || !publicKey) throw new Error("EmailJS is not configured.");

  const baseUrl = (process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;
  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      ...(privateKey ? { accessToken: privateKey } : {}),
      template_params: {
        requester_name: notice.requesterName,
        requester_email: notice.requesterEmail,
        contact_number: notice.contactNumber,
        whatsapp_number: notice.whatsappNumber,
        company_name: notice.companyName,
        company_code: notice.companyCode,
        message: notice.message.trim() || "No additional message provided.",
        request_id: notice.requestId,
        review_url: `${baseUrl}/admin`,
      },
    }),
  });

  if (!response.ok) throw new Error(`EmailJS returned status ${response.status}.`);
}
