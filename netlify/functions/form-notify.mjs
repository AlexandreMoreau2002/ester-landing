export default async (request) => {
  try {
    const payload = await request.json();
    const data = payload.data ?? {};
    const { nom, prenom, email, tel, societe, sujet_label, sujet, message } = data;

    const subjectType = sujet_label || sujet || 'Contact';
    const subjectName = [nom, prenom].filter(Boolean).join(' ');
    const subject     = `Site internet - ${subjectType} - ${subjectName}`;

    const contactLines = [
      `Nom : ${subjectName}`,
      `Email : ${email}`,
      tel     ? `Tél : ${tel}`           : null,
      societe ? `Entreprise : ${societe}` : null,
    ].filter(Boolean);

    const text = `${message || ''}\n\n---\n${contactLines.join('\n')}`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from:     'ESTER Site Web <onboarding@resend.dev>',
        to:       [process.env.NOTIFY_EMAIL],
        reply_to: email,
        subject,
        text,
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
