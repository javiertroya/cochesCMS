import re
from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


RequestStatus = Literal["nueva", "en_curso", "presupuestada", "cerrada"]

_PHONE_ALLOWED = re.compile(r"^[0-9+\s().-]+$")
_MAX_YEAR = date.today().year + 1


def _clean(value: str | None) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def _optional_text(value: str | None) -> str | None:
    value = (value or "").strip()
    return value or None


class ContactRequestBase(BaseModel):
    """Datos de contacto comunes a todos los formularios públicos."""

    name: str = Field(..., max_length=120)
    phone: str = Field(..., max_length=30)
    email: EmailStr
    source_page: Optional[str] = Field(default=None, max_length=255)
    # Campo trampa: invisible para personas, los bots suelen rellenarlo
    website: Optional[str] = Field(default=None, max_length=255)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = _clean(value)
        if len(value) < 2:
            raise ValueError("Indica tu nombre")
        return value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        value = value.strip()
        digits = re.sub(r"\D", "", value)
        if not _PHONE_ALLOWED.match(value) or not 9 <= len(digits) <= 15:
            raise ValueError("Indica un teléfono válido")
        return value


class FullFormRequestCreate(ContactRequestBase):
    """Envío del componente "Formulario completo"."""

    message: str = Field(..., max_length=5000)

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        value = (value or "").strip()
        if len(value) < 10:
            raise ValueError("Cuéntanos un poco más (mínimo 10 caracteres)")
        return value


class _VehicleBase(ContactRequestBase):
    brand: str = Field(..., max_length=80)
    model: str = Field(..., max_length=80)
    comments: Optional[str] = Field(default=None, max_length=3000)

    @field_validator("brand", "model")
    @classmethod
    def validate_required_text(cls, value: str) -> str:
        value = _clean(value)
        if not value:
            raise ValueError("Este campo es obligatorio")
        return value

    @field_validator("comments", mode="before")
    @classmethod
    def clean_comments(cls, value):
        return _optional_text(value)


class ImportSearchRequestCreate(_VehicleBase):
    """Opción 1: el cliente quiere que le busquemos un coche concreto."""

    version: Optional[str] = Field(default=None, max_length=120)
    year_from: Optional[int] = Field(default=None, ge=1990, le=_MAX_YEAR)
    max_km: Optional[int] = Field(default=None, ge=0, le=1_000_000)
    fuel: Optional[Literal["indiferente", "gasolina", "diesel", "hibrido", "hibrido_enchufable", "electrico"]] = None
    transmission: Optional[Literal["indiferente", "manual", "automatico"]] = None
    max_budget: int = Field(..., ge=1000, le=5_000_000)
    timeframe: Optional[Literal["lo_antes_posible", "1_2_meses", "sin_prisa"]] = None
    must_have: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("version", "must_have", mode="before")
    @classmethod
    def clean_optional(cls, value):
        return _optional_text(value)

    @field_validator("year_from", "max_km", "fuel", "transmission", "timeframe", mode="before")
    @classmethod
    def empty_to_none(cls, value):
        return None if value in ("", None) else value


class ImportFoundRequestCreate(_VehicleBase):
    """Opción 2: el cliente ya ha encontrado el coche y quiere que lo traigamos."""

    listing_url: str = Field(..., max_length=1000)
    year: Optional[int] = Field(default=None, ge=1990, le=_MAX_YEAR)
    km: Optional[int] = Field(default=None, ge=0, le=1_000_000)
    listing_price: Optional[int] = Field(default=None, ge=0, le=5_000_000)
    country: Optional[Literal["alemania", "belgica", "paises_bajos", "francia", "italia", "otro"]] = None
    seller_type: Optional[Literal["concesionario", "particular", "no_lo_se"]] = None

    @field_validator("listing_url")
    @classmethod
    def validate_url(cls, value: str) -> str:
        value = (value or "").strip()
        if not re.match(r"^https?://[^\s/$.?#].[^\s]*$", value, re.IGNORECASE):
            raise ValueError("Pega el enlace completo del anuncio (empieza por http)")
        return value

    @field_validator("year", "km", "listing_price", "country", "seller_type", mode="before")
    @classmethod
    def empty_to_none(cls, value):
        return None if value in ("", None) else value


class RequestUpdate(BaseModel):
    status: RequestStatus
