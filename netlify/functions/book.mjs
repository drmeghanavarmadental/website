// Smera booking delivery — sends consultation requests to BOTH:
//  1. Email (via Formspree)  -> set env var FORMSPREE_ENDPOINT (e.g. https://formspree.io/f/abcd1234)
//  2. Dr. Meghana's WhatsApp (via CallMeBot) -> set env vars CALLMEBOT_PHONE (e.g. +9185559xxxxx)
//     and CALLMEBOT_APIKEY (the key CallMeBot sends after the one-time opt-in)

export default async (req) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response("", { status: 204, headers });
  if (req.method !== "POST")
    return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers });

  let d;
  try { d = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "bad json" }), { status: 400, headers });
  }

  // Keep only expected fields, basic length caps
  const fields = ["name","phone","email","concern","treatment","location","preferred","language","message","date","time"];
  const data = {};
  for (const f of fields) if (d[f]) data[f] = String(d[f]).slice(0, 300);
  if (!Object.keys(data).length)
    return new Response(JSON.stringify({ error: "empty" }), { status: 400, headers });

  const results = { email: false, whatsapp: false };

  // 0) If a smile photo was shared in chat, host it so email + WhatsApp can include it
  //    (free imgbb account -> env var IMGBB_API_KEY)
  let photoUrl = "";
  const imgbbKey = process.env.IMGBB_API_KEY;
  if (d.photo && imgbbKey) {
    try {
      const fd = new URLSearchParams();
      fd.append("image", String(d.photo));
      const r = await fetch("https://api.imgbb.com/1/upload?key=" + encodeURIComponent(imgbbKey) + "&expiration=2592000", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: fd.toString(),
      });
      const j = await r.json();
      if (j && j.data && j.data.url) photoUrl = j.data.url;
    } catch (e) { /* photo hosting failed, continue without it */ }
  }
  if (photoUrl) data.photo_link = photoUrl;

  // 1) Email via Formspree
  const fs = process.env.FORMSPREE_ENDPOINT;
  if (fs) {
    try {
      const r = await fetch(fs, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ _subject: "New consultation request — Smera website", ...data }),
      });
      results.email = r.ok;
    } catch (e) { /* keep false */ }
  }

  // 2) WhatsApp notification
  const waPhone = process.env.WHATSAPP_PHONE || "+919989257325"; // default — override with env var if needed
  const tmbKey = process.env.TEXTMEBOT_APIKEY;   // TextMeBot (paid, recommended)
  const cbKey  = process.env.CALLMEBOT_APIKEY;   // CallMeBot (free, when slots available)
  let waText = "*New consultation request* (Smera website)";
  for (const [k, v] of Object.entries(data)) {
    waText += "\n" + k.charAt(0).toUpperCase() + k.slice(1) + ": " + v;
  }
  if (tmbKey) {
    try {
      let url = "https://api.textmebot.com/send.php?recipient=" + encodeURIComponent(waPhone) +
                  "&apikey=" + encodeURIComponent(tmbKey) +
                  "&text=" + encodeURIComponent(waText) + "&json=yes";
      if (photoUrl) url += "&file=" + encodeURIComponent(photoUrl);
      const r = await fetch(url);
      const bodyText = await r.text();
      console.log("TextMeBot response:", r.status, bodyText.slice(0, 300));
      results.whatsapp = r.ok && !/error|invalid|expired|not allowed/i.test(bodyText);
    } catch (e) { console.log("TextMeBot error:", e.message); }
  } else if (cbKey) {
    try {
      const url = "https://api.callmebot.com/whatsapp.php?phone=" + encodeURIComponent(waPhone) +
                  "&apikey=" + encodeURIComponent(cbKey) +
                  "&text=" + encodeURIComponent(waText);
      const r = await fetch(url);
      results.whatsapp = r.ok;
    } catch (e) { /* keep false */ }
  }

  const configured = Boolean(fs || (cbPhone && cbKey) || tmbKey);
  const delivered = results.email || results.whatsapp;
  return new Response(JSON.stringify({ ok: delivered, configured, results }), { status: 200, headers });
};

export const config = { path: "/api/book" };
