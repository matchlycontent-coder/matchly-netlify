// netlify/functions/claude.js
// Tussenstation tussen de app en de Anthropic-API.
// Houdt de API-sleutel veilig op de server en voegt de verplichte headers toe.
// De app stuurt hierheen exact dezelfde payload die ze anders naar Anthropic zou sturen.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: { message: "Alleen POST" } }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: "ANTHROPIC_API_KEY ontbreekt in de Netlify-omgevingsvariabelen" } }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: { message: "Ongeldige JSON in verzoek" } }) };
  }

  const headers = {
    "content-type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  };

  // De web_fetch-tool zit nog in beta en heeft een extra header nodig.
  const usesWebFetch =
    Array.isArray(payload.tools) &&
    payload.tools.some((t) => typeof t?.type === "string" && t.type.startsWith("web_fetch"));
  if (usesWebFetch) headers["anthropic-beta"] = "web-fetch-2025-09-10";

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    // Geef status én body onveranderd door, zodat de app de echte fout ziet.
    return {
      statusCode: res.status,
      headers: { "content-type": "application/json" },
      body: text,
    };
  } catch (e) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: { message: "Tussenstation-fout: " + e.message } }),
    };
  }
};
