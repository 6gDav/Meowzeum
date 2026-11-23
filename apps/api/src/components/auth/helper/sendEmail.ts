type SendEmailInput = {
    to: string;
    name: string;
    title: string;
    message: string;
    templateId?: string;
};

export async function sendEmail({
    to,
    name,
    title,
    message,
    templateId = process.env.EMAILJS_TEMPLATE_ID,
}: SendEmailInput) {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            service_id: process.env.EMAILJS_SERVICE_ID,
            template_id: templateId,
            user_id: process.env.EMAILJS_PUBLIC_KEY,
            accessToken: process.env.EMAILJS_PRIVATE_KEY,
            template_params: {
                to_email: to,
                from_name: name,
                title,
                message,
            },
        }),
    });

    if (!res.ok) {
        throw new Error(`EmailJS error ${res.status}: ${await res.text()}`);
    }
}