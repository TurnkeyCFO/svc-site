/* ════════════════════════════════════════════════════════════════
   POST /api/partner-apply
   Body: { name, company, email, phone, partner_type, network_volume, notes, page }
   Returns: { ok: true } or { error }

   Cloudflare Pages Function. Posts every Turnkey Partner application
   to Slack #leads so Ricky sees it within seconds.

   Env vars (Cloudflare Pages → Settings → Environment variables):
     SLACK_BOT_TOKEN        (Production, secret)
     SLACK_CHANNEL_LEADS    (Production, plain — channel id, e.g. C0AREP6F46N)
   ════════════════════════════════════════════════════════════════ */

const MAX = { name: 120, company: 160, email: 160, phone: 40, partner_type: 60, network_volume: 30, notes: 1200, page: 300 };

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); } catch (_) { return json({ error: 'invalid_json' }, 400); }

  const f = {};
  for (const k of Object.keys(MAX)) {
    f[k] = (body && typeof body[k] === 'string') ? body[k].trim().slice(0, MAX[k]) : '';
  }

  if (!f.name || !f.email || f.email.indexOf('@') < 1 || !f.partner_type) {
    return json({ error: 'missing_fields' }, 400);
  }

  if (!env.SLACK_BOT_TOKEN || !env.SLACK_CHANNEL_LEADS) {
    return json({ error: 'not_configured' }, 503);
  }

  const lines = [
    ':handshake: *New Turnkey Partner application*',
    '',
    '*Name:* ' + f.name + (f.company ? '  (' + f.company + ')' : ''),
    '*Email:* ' + f.email,
    f.phone ? '*Phone:* ' + f.phone : null,
    '*Partner type:* ' + f.partner_type,
    f.network_volume ? '*Businesses talked with monthly:* ' + f.network_volume : null,
    f.notes ? '*Notes:* ' + f.notes : null,
    '',
    '_Source: turnkey-services.org/partners — reply within one business day with the partner welcome kit._'
  ].filter((l) => l !== null);

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 9000);
  try {
    const r = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'Authorization': 'Bearer ' + env.SLACK_BOT_TOKEN,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        channel: env.SLACK_CHANNEL_LEADS,
        text: 'New Turnkey Partner application: ' + f.name + ' (' + f.partner_type + ')',
        blocks: [{ type: 'section', text: { type: 'mrkdwn', text: lines.join('\n') } }],
        unfurl_links: false
      })
    });
    clearTimeout(t);
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data.ok) {
      return json({ error: 'slack_failed', detail: (data && data.error) || r.status }, 502);
    }
    return json({ ok: true });
  } catch (e) {
    clearTimeout(t);
    return json({ error: 'fetch_failed', detail: String(e).slice(0, 160) }, 502);
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
