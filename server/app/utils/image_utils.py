"""Procesado de imágenes al subir.

- Corrige la orientación según EXIF y elimina todos los metadatos (incluido GPS).
- Convierte a WebP.
- Genera la versión principal (máx. 1920 px) y variantes sm (480 px) y md (960 px).
- Acepta HEIC/HEIF (fotos de iPhone) si pillow-heif está instalado.
"""

from dataclasses import dataclass, field
from io import BytesIO

from PIL import Image, ImageOps, UnidentifiedImageError

try:
    from pillow_heif import register_heif_opener

    register_heif_opener()
except ImportError:  # pragma: no cover - sin pillow-heif no se aceptan fotos HEIC
    pass

# Protección frente a imágenes "bomba" (≈ 80 megapíxeles)
Image.MAX_IMAGE_PIXELS = 80_000_000

MAIN_MAX_SIZE = 1920
VARIANT_SIZES = {"sm": 480, "md": 960}
WEBP_QUALITY = 82


class InvalidImageError(ValueError):
    pass


@dataclass
class ImageVersion:
    data: bytes
    width: int
    height: int


@dataclass
class ProcessedImage:
    main: ImageVersion
    variants: dict[str, ImageVersion] = field(default_factory=dict)
    content_type: str = "image/webp"
    extension: str = ".webp"


def _encode_webp(image: Image.Image) -> bytes:
    buffer = BytesIO()
    image.save(buffer, format="WEBP", quality=WEBP_QUALITY, method=4)
    return buffer.getvalue()


def _resized(image: Image.Image, max_size: int) -> Image.Image:
    if max(image.size) <= max_size:
        return image
    copy = image.copy()
    copy.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
    return copy


def process_image(data: bytes) -> ProcessedImage:
    try:
        with Image.open(BytesIO(data)) as source:
            source.load()
            image = ImageOps.exif_transpose(source)
    except (UnidentifiedImageError, Image.DecompressionBombError, OSError) as exc:
        raise InvalidImageError("El archivo no es una imagen válida o es demasiado grande") from exc

    # WebP admite transparencia; el resto se pasa a RGB. Al re-codificar
    # sin pasar `exif=` se descartan todos los metadatos.
    has_alpha = image.mode in ("RGBA", "LA") or (image.mode == "P" and "transparency" in image.info)
    image = image.convert("RGBA" if has_alpha else "RGB")

    main_image = _resized(image, MAIN_MAX_SIZE)
    result = ProcessedImage(
        main=ImageVersion(_encode_webp(main_image), *main_image.size),
    )

    for name, size in VARIANT_SIZES.items():
        # Solo se generan variantes si la imagen es mayor que ese tamaño
        if max(image.size) > size:
            variant = _resized(image, size)
            result.variants[name] = ImageVersion(_encode_webp(variant), *variant.size)

    return result
