import smtplib
import ssl
from email.message import EmailMessage

from flask import current_app


def branded_html(title, greeting, body, action_label=None, action_url=None):
    action = f'<a href="{action_url}" style="display:inline-block;background:#C89432;color:#071C3A;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:8px;margin-top:18px">{action_label}</a>' if action_label and action_url else ""
    return f'''<!doctype html><html><body style="margin:0;background:#f4f6f8;font-family:Arial,sans-serif;color:#071C3A"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px"><table width="600" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden"><tr><td style="background:#071C3A;padding:24px 32px;color:#fff"><strong style="font-size:19px">ALIANZA<span style="color:#D9AE55">CONTIGO</span></strong><div style="font-size:11px;color:#aeb8c8;margin-top:4px">EDUCACIÓN CONTINUA</div></td></tr><tr><td style="padding:32px"><h1 style="font-size:24px;margin:0 0 20px">{title}</h1><p style="font-size:15px;line-height:1.6">{greeting}</p><div style="font-size:15px;line-height:1.65;color:#344054">{body}</div>{action}</td></tr><tr><td style="background:#f7f8fa;padding:18px 32px;font-size:12px;color:#667085">Aprende · Crece · Trasciende</td></tr></table></td></tr></table></body></html>'''


def send_html(to, subject, html):
    if not current_app.config["EMAIL_ADDRESS"] or not current_app.config["EMAIL_PASSWORD"] or not to:
        current_app.logger.warning("Correo omitido: SMTP o destinatario no configurado")
        return False
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = current_app.config["MAIL_SENDER"]
    message["To"] = to
    message.set_content("Este correo requiere un cliente compatible con HTML.")
    message.add_alternative(html, subtype="html")
    with smtplib.SMTP(current_app.config["SMTP_SERVER"], current_app.config["SMTP_PORT"], timeout=15) as smtp:
        smtp.starttls(context=ssl.create_default_context())
        smtp.login(current_app.config["EMAIL_ADDRESS"], current_app.config["EMAIL_PASSWORD"])
        smtp.send_message(message)
    return True
