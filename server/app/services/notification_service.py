import logging
import os
import smtplib
from datetime import date, datetime, time
from email.message import EmailMessage


logger = logging.getLogger(__name__)


# ............................................................................
# Envío de correo por SMTP (Brevo, Resend, etc.). Los avisos de formularios
# (fase 3) usarán send_email con el correo destino configurado en el panel.
class NotificationService:
    SMTP_HOST = os.getenv("SMTP_HOST", "localhost")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "25"))
    SMTP_USERNAME = os.getenv("SMTP_USERNAME")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
    SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "false").lower() == "true"
    SMTP_TIMEOUT = int(os.getenv("SMTP_TIMEOUT", "10"))
    MAIL_FROM = os.getenv("MAIL_FROM", "no-reply@example.com")
    MAIL_TO = os.getenv("ADMIN_NOTIFICATION_EMAIL", "admin@example.com")

    @staticmethod
    def _stringify(value):
        if value is None:
            return "-"
        if isinstance(value, (datetime, date, time)):
            return value.isoformat()
        return str(value)

    @staticmethod
    def format_fields(fields: list[tuple[str, object]]) -> str:
        return "\n".join(
            f"{label}: {NotificationService._stringify(value)}"
            for label, value in fields
        )

    @staticmethod
    def send_email(
        subject: str,
        body: str,
        to_email: str | None = None,
        reply_to: str | None = None,
        html: str | None = None,
        attachments: list[tuple[str, bytes, str, str]] | None = None,
    ):
        message = EmailMessage()
        message["From"] = NotificationService.MAIL_FROM
        message["To"] = to_email or NotificationService.MAIL_TO
        message["Subject"] = subject
        if reply_to:
            message["Reply-To"] = reply_to
        message.set_content(body)
        if html:
            message.add_alternative(html, subtype="html")
        # Adjuntos: (nombre, contenido, maintype, subtype)
        for filename, content, maintype, subtype in attachments or []:
            message.add_attachment(content, maintype=maintype, subtype=subtype, filename=filename)

        with smtplib.SMTP(
            NotificationService.SMTP_HOST,
            NotificationService.SMTP_PORT,
            timeout=NotificationService.SMTP_TIMEOUT,
        ) as smtp:
            if NotificationService.SMTP_USE_TLS:
                smtp.starttls()
            if NotificationService.SMTP_USERNAME and NotificationService.SMTP_PASSWORD:
                smtp.login(NotificationService.SMTP_USERNAME, NotificationService.SMTP_PASSWORD)
            smtp.send_message(message)

    @staticmethod
    def safe_send(subject: str, body: str, **kwargs) -> bool:
        try:
            NotificationService.send_email(subject, body, **kwargs)
            return True
        except Exception:
            logger.exception("No se pudo enviar la notificación por correo: %s", subject)
            return False
