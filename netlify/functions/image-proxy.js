// netlify/functions/image-proxy.js
// Haalt logo-afbeeldingen op van hollandsevelden.nl server-side,
// zodat de browser geen CORS-fout krijgt.

exports.handler = async (event) => {
  const url = event.queryStringParameters?.url;

  if (!url) {
    return { statusCode: 400, body: "Geen URL opgegeven" };
  }

  // Alleen hollandsevelden.nl toestaan (veiligheid)
  if (!url.startsWith("https://www.hollandsevelden.nl/") &&
      !url.startsWith("https://cms.hollandsevelden.nl/")) {
    return { statusCode: 403, body: "Domein niet toegestaan" };
  }

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    if (!res.ok) {
      return { statusCode: res.status, body: "Afbeelding niet gevonden" };
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/png";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
      },
      body: Buffer.from(buffer).toString("base64"),
      isBase64Encoded: true,
    };
  } catch (e) {
    return { statusCode: 502, body: "Proxy-fout: " + e.message };
  }
};
