# Aasha Setup Guide — Smera Dental Clinic AI Concierge

The site works WITHOUT any of this (Aasha falls back to WhatsApp links),
but these three setups unlock her full power. Each takes a few minutes.

## 1 — AI brain (already done if Aasha chats)
- console.anthropic.com -> API key
- Netlify -> Site configuration -> Environment variables -> ANTHROPIC_API_KEY

## 2 — Email delivery of consultation requests (Formspree, free)
1. Go to https://formspree.io -> sign up free
2. Create a new form. Set the email to where requests should arrive
   (e.g. care@smeradentalcare.com or Dr. Meghana's email)
3. Copy the endpoint URL — looks like: https://formspree.io/f/abcd1234
4. Netlify -> Site configuration -> Environment variables -> Add:
   Key:   FORMSPREE_ENDPOINT
   Value: https://formspree.io/f/abcd1234
Free tier: 50 submissions/month. Paid (~$10/mo) if volume grows.

## 3 — WhatsApp delivery to Dr. Meghana's phone (CallMeBot, free)
This makes every consultation request also arrive as a WhatsApp message
on Dr. Meghana's phone, instantly.

ON DR. MEGHANA'S PHONE (one-time, 2 minutes):
1. Open https://www.callmebot.com/blog/free-api-whatsapp-messages/
   and note the CURRENT bot phone number shown in the Setup section
   (it changes occasionally — always use the number on that page)
2. Save that number in her phone contacts
3. From her WhatsApp, send to it exactly: I allow callmebot to send me messages
4. Within ~2 minutes the bot replies: "API Activated... Your APIKEY is 123456"

THEN IN NETLIFY -> Environment variables, add two:
   Key: CALLMEBOT_PHONE    Value: her full number with country code, e.g. +9185559xxxxx
   Key: CALLMEBOT_APIKEY   Value: the number from the bot's reply

## After adding any variable
Deploys -> Trigger deploy -> Deploy site (variables only apply on new deploys)

## How requests flow now
Aasha chat  ─┐
             ├─> /api/book ──> Email (Formspree) + WhatsApp to Dr. Meghana (CallMeBot)
Booking forms┘                  └─ patient sees "the team will reach out to you on <their number>"

Notes:
- CallMeBot free tier is for personal use and is hobby-grade; if volume grows,
  upgrade path is textmebot.com (low cost) or the official WhatsApp Business API.
- If neither service is configured, patients are offered the WhatsApp chat
  button instead, so no lead is ever lost.
