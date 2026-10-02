import hashlib
import hmac
import logging
import os
from pathlib import Path
from uuid import uuid4

from app.models.Request import (
    FullFormRequestCreate,
    ImportFoundRequestCreate,
    ImportSearchRequestCreate,
)
from app.repositories.request_repository import RequestRepository
from app.repositories.site_settings_repository import SiteSettingsRepository
from app.services.notification_service import NotificationService
from app.services.storage_service import get_storage
from app.utils.image_utils import InvalidImageError, process_image


logger = logging.getLogger(__name__)

# Máximo de envíos por IP en la ventana indicada (antispam básico; Turnstile llegará después)
RATE_LIMIT_MAX = 5
RATE_LIMIT_MINUTES = 10

# Capturas del anuncio (opción "ya lo he encontrado"): privadas, convertidas a WebP y sin EXIF
MAX_ATTACHMENTS = 5
MAX_ATTACHMENT_MB = 10
ATTACHMENT_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"}

_IP_HASH_KEY = (os.getenv("JWT_SECRET_KEY") or "").encode()


# ............................................................................
# Etiquetas legibles (correo y panel). El orden define cómo se muestran.
TYPE_LABELS = {
    "contacto": "Contacto",
    "importacion_busqueda": "Importación · búscame un coche",
    "importacion_encontrado": "Importación · ya lo he encontrado",
}

_FIELDS_BY_TYPE = {
    "contacto": [
        ("message", "Mensaje"),
    ],
    "importacion_busqueda": [
        ("brand", "Marca"),
        ("model", "Modelo"),
        ("version", "Versión / acabado"),
        ("year_from", "Año mínimo"),
        ("max_km", "Kilómetros máximos"),
        ("fuel", "Combustible"),
        ("transmission", "Cambio"),
        ("max_budget", "Presupuesto máximo"),
        ("timeframe", "Plazo"),
        ("must_have", "Imprescindible (equipamiento, color…)"),
        ("comments", "Comentarios"),
    ],
    "importacion_encontrado": [
        ("listing_url", "Enlace del anuncio"),
        ("brand", "Marca"),
        ("model", "Modelo"),
        ("year", "Año"),
        ("km", "Kilómetros"),
        ("listing_price", "Precio del anuncio"),
        ("country", "País"),
        ("seller_type", "Vendedor"),
        ("comments", "Comentarios"),
    ],
}

_CHOICE_LABELS = {
    "fuel": {
        "indiferente": "Indiferente", "gasolina": "Gasolina", "diesel": "Diésel",
        "hibrido": "Híbrido", "hibrido_enchufable": "Híbrido enchufable", "electrico": "Eléctrico",
    },
    "transmission": {"indiferente": "Indiferente", "manual": "Manual", "automatico": "Automático"},
    "timeframe": {"lo_antes_posible": "Lo antes posible", "1_2_meses": "En 1-2 meses", "sin_prisa": "Sin prisa"},
    "country": {
        "alemania": "Alemania", "belgica": "Bélgica", "paises_bajos": "Países Bajos",
        "francia": "Francia", "italia": "Italia", "otro": "Otro",
    },
    "seller_type": {"concesionario": "Concesionario", "particular": "Particular", "no_lo_se": "No lo sé"},
}

_EURO_FIELDS = {"max_budget", "listing_price"}
_KM_FIELDS = {"max_km", "km"}


def _format_value(key: str, value) -> str:
    if key in _CHOICE_LABELS:
        return _CHOICE_LABELS[key].get(value, str(value))
    if key in _EURO_FIELDS:
        return f"{int(value):,} €".replace(",", ".")
    if key in _KM_FIELDS:
        return f"{int(value):,} km".replace(",", ".")
    return str(value)


def request_summary(request: dict) -> list[dict]:
    """Campos de la solicitud con etiqueta y valor legible (sin los de contacto)."""
    data = request.get("data") or {}
    summary = []
    for key, label in _FIELDS_BY_TYPE.get(request.get("type"), []):
        value = data.get(key)
        if value in (None, ""):
            continue
        summary.append({"key": key, "label": label, "value": _format_value(key, value)})
    return summary


def request_label(request: dict) -> str:
    data = request.get("data") or {}
    return data.get("name") or data.get("email") or f"Solicitud #{request.get('id')}"


# ............................................................................
class RateLimitError(Exception):
    pass


class AttachmentError(ValueError):
    pass


def _hash_ip(ip: str | None) -> str | None:
    if not ip:
        return None
    return hmac.new(_IP_HASH_KEY, ip.encode(), hashlib.sha256).hexdigest()


def _check_rate_limit(ip: str | None) -> str | None:
    ip_hash = _hash_ip(ip)
    if ip_hash and RequestRepository.count_recent_by_ip(ip_hash, RATE_LIMIT_MINUTES) >= RATE_LIMIT_MAX:
        raise RateLimitError("Has enviado varias solicitudes seguidas. Inténtalo de nuevo en unos minutos.")
    return ip_hash


def _contact_data(payload) -> dict:
    return {"name": payload.name, "phone": payload.phone, "email": str(payload.email)}


def _validate_attachments(files: list[tuple[str, bytes]]) -> None:
    if len(files) > MAX_ATTACHMENTS:
        raise AttachmentError(f"Puedes adjuntar como máximo {MAX_ATTACHMENTS} capturas")
    for name, data in files:
        if Path(name or "").suffix.lower() not in ATTACHMENT_EXTENSIONS:
            raise AttachmentError("Las capturas deben ser imágenes JPG, PNG, WebP o HEIC")
        if len(data) > MAX_ATTACHMENT_MB * 1024 * 1024:
            raise AttachmentError(f"Cada captura debe pesar menos de {MAX_ATTACHMENT_MB} MB")


def _store_attachments(files: list[tuple[str, bytes]]) -> list[dict]:
    storage = get_storage()
    stored = []
    try:
        for index, (name, data) in enumerate(files, start=1):
            try:
                processed = process_image(data)
            except InvalidImageError as exc:
                raise AttachmentError(f"No se ha podido leer la captura «{name}»") from exc
            key = f"requests/{uuid4().hex}{processed.extension}"
            storage.put(key, processed.main.data, processed.content_type, private=True)
            stored.append({"key": key, "name": f"captura-{index}{processed.extension}", "content_type": processed.content_type})
    except Exception:
        _delete_attachments(stored)
        raise
    return stored


def _delete_attachments(attachments: list[dict] | None) -> None:
    storage = get_storage()
    for attachment in attachments or []:
        try:
            storage.delete(attachment["key"], private=True)
        except Exception:  # un archivo perdido no debe bloquear nada
            logger.warning("No se pudo borrar el adjunto %s", attachment.get("key"))


# ............................................................................
def _notification_email() -> str:
    settings = SiteSettingsRepository.get() or {}
    return (settings.get("notification_email") or "").strip() or NotificationService.MAIL_TO


def send_request_notification(request: dict) -> None:
    """Aviso por correo de una solicitud nueva. Se ejecuta en segundo plano; si falla solo se registra."""
    data = request.get("data") or {}
    type_label = TYPE_LABELS.get(request["type"], request["type"])
    vehicle = " ".join(filter(None, [data.get("brand"), data.get("model")]))
    subject = f"Nueva solicitud · {type_label} · {data.get('name', '')}"
    if vehicle:
        subject += f" · {vehicle}"

    lines = [
        f"Nueva solicitud recibida desde la web ({type_label}).",
        "",
        "CONTACTO",
        f"Nombre: {data.get('name', '-')}",
        f"Teléfono: {data.get('phone', '-')}",
        f"Email: {data.get('email', '-')}",
        "",
        "DETALLES",
    ]
    for item in request_summary(request):
        lines.append(f"{item['label']}: {item['value']}")
    attachments = data.get("attachments") or []
    if attachments:
        lines += ["", f"Se adjuntan {len(attachments)} captura(s) del anuncio."]
    lines += ["", f"Página: {request.get('source_page') or '-'}", "Puedes gestionarla en el panel → Solicitudes."]

    email_attachments = []
    storage = get_storage()
    for attachment in attachments:
        try:
            content = storage.get(attachment["key"], private=True)
        except Exception:
            logger.warning("No se pudo leer el adjunto %s para el correo", attachment.get("key"))
            continue
        maintype, _, subtype = attachment.get("content_type", "image/webp").partition("/")
        email_attachments.append((attachment["name"], content, maintype, subtype))

    NotificationService.safe_send(
        subject,
        "\n".join(lines),
        to_email=_notification_email(),
        reply_to=data.get("email"),
        attachments=email_attachments,
    )


# ............................................................................
class RequestService:

    @staticmethod
    def create_from_full_form(payload: FullFormRequestCreate, ip: str | None) -> dict | None:
        # Si el campo trampa viene relleno fingimos éxito sin guardar nada
        if payload.website:
            return None
        ip_hash = _check_rate_limit(ip)
        return RequestRepository.create(
            request_type="contacto",
            data={"form": "full_form", **_contact_data(payload), "message": payload.message},
            source_page=payload.source_page,
            ip_hash=ip_hash,
        )

    @staticmethod
    def create_import_search(payload: ImportSearchRequestCreate, ip: str | None) -> dict | None:
        if payload.website:
            return None
        ip_hash = _check_rate_limit(ip)
        fields = payload.model_dump(exclude={"name", "phone", "email", "source_page", "website"}, exclude_none=True)
        return RequestRepository.create(
            request_type="importacion_busqueda",
            data={**_contact_data(payload), **fields},
            source_page=payload.source_page,
            ip_hash=ip_hash,
        )

    @staticmethod
    def create_import_found(
        payload: ImportFoundRequestCreate,
        files: list[tuple[str, bytes]],
        ip: str | None,
    ) -> dict | None:
        if payload.website:
            return None
        _validate_attachments(files)
        ip_hash = _check_rate_limit(ip)
        attachments = _store_attachments(files)
        fields = payload.model_dump(exclude={"name", "phone", "email", "source_page", "website"}, exclude_none=True)
        try:
            return RequestRepository.create(
                request_type="importacion_encontrado",
                data={**_contact_data(payload), **fields, "attachments": attachments},
                source_page=payload.source_page,
                ip_hash=ip_hash,
            )
        except Exception:
            _delete_attachments(attachments)
            raise

    @staticmethod
    def serialize_for_admin(request: dict) -> dict:
        storage = get_storage()
        data = dict(request.get("data") or {})
        data["attachments"] = [
            {"name": a.get("name"), "url": storage.signed_url(a["key"], expires_in=3600)}
            for a in data.get("attachments") or []
        ]
        return {**request, "data": data, "type_label": TYPE_LABELS.get(request["type"], request["type"]), "summary": request_summary(request)}

    @staticmethod
    def find_all(*, status: str | None = None, request_type: str | None = None, search: str | None = None):
        items = RequestRepository.find_all(status=status, request_type=request_type, search=search)
        return {
            "items": [RequestService.serialize_for_admin(item) for item in items],
            "counts": RequestRepository.count_by_status(),
        }

    @staticmethod
    def update_status(request_id: int, status: str):
        updated = RequestRepository.update_status(request_id, status)
        return RequestService.serialize_for_admin(updated) if updated else None

    @staticmethod
    def delete(request_id: int):
        existing = RequestRepository.find_by_id(request_id)
        if not existing or not RequestRepository.delete(request_id):
            raise LookupError("Solicitud no encontrada")
        _delete_attachments((existing.get("data") or {}).get("attachments"))
        return {"message": "Solicitud eliminada correctamente"}
