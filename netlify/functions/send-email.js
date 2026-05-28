// netlify/functions/send-email.js
// Verstuurt een content-mail via Resend, inclusief bijlages (afbeeldingen als base64).
// Gebruikt de Resend REST API direct (geen extra npm-package nodig).

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

exports.handler = async (event) => {
  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "RESEND_API_KEY ontbreekt op de server" }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Ongeldige JSON" }) };
  }

  const { to, subject, html, attachments, from, replyTo } = payload;

  // Basisvalidatie
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Ongeldig of ontbrekend ontvanger-e-mailadres" }) };
  }
  if (!subject || !html) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Onderwerp of inhoud ontbreekt" }) };
  }

  // Bouw de Resend-payload
  const body = {
    from: from || "Matchly <noreply@matchlyapp.nl>",
    to: [to],
    subject,
    html,
  };
  if (replyTo) body.reply_to = replyTo;

  // Bijlages: verwacht [{ filename, content }] waar content base64 is (zonder data:-prefix)
  if (Array.isArray(attachments) && attachments.length > 0) {
    body.attachments = attachments
      .filter((a) => a && a.filename && a.content)
      .map((a) => ({ filename: a.filename, content: a.content }));
  }

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      return {
        statusCode: resp.status,
        headers: CORS,
        body: JSON.stringify({ error: data && data.message ? data.message : "Versturen mislukt", details: data }),
      };
    }

    return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, id: data.id }) };
  } catch (err) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: String(err && err.message ? err.message : err) }) };
  }
};
