export default async (request) => {
  try {
    const payload = await request.json();
    const data = payload.data ?? {};

    if (!process.env.RESEND_API_KEY || !process.env.NOTIFY_EMAIL) {
      console.error('[form-notify] Missing RESEND_API_KEY or NOTIFY_EMAIL');
      return Response.json({ error: 'Missing env vars' }, { status: 500 });
    }

    const { nom, prenom, email, tel, societe, sujet_label, sujet, message, cv, cv_base64, cv_type } = data;

    const subjectType = sujet_label || sujet || 'Contact';
    const subjectName = [nom, prenom].filter(Boolean).join(' ');
    const subject     = `Site internet - ${subjectType} - ${subjectName}`;

    const contactLines = [
      `Nom : ${subjectName}`,
      `Email : ${email}`,
      tel     ? `Tél : ${tel}`             : null,
      societe ? `Entreprise : ${societe}`   : null,
      cv      ? `Pièce jointe : ${cv}`      : null,
    ].filter(Boolean);

    const textParts = [message, '---', ...contactLines].filter(Boolean);
    const text = textParts.join('\n');

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:     'ESTER Site Web <onboarding@resend.dev>',
        to:       [process.env.NOTIFY_EMAIL],
        ...(email ? { reply_to: email } : {}),
        subject,
        text,
        ...(cv_base64 && cv ? {
          attachments: [{
            filename: cv,
            content:  cv_base64,
            ...(cv_type ? { content_type: cv_type } : {}),
          }],
        } : {}),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[form-notify] Resend error:', err);
      return Response.json({ error: err }, { status: 502 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error('[form-notify] Error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
};
