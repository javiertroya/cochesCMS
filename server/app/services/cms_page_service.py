import re
from typing import Any

from app.models.CmsPage import CmsPage, CmsPageUpdate
from app.repositories.cms_page_repository import CmsPageRepository


COMPONENT_TYPES: list[dict[str, Any]] = [
    {
        "type": "hero",
        "name": "Hero",
        "description": "Bloque principal con titulo, texto y llamada a la accion.",
        "default_props": {
            "title": "Nueva pagina",
            "subtitle": "Texto introductorio",
            "buttonText": "",
            "buttonUrl": "",
        },
    },
    {
        "type": "rich_text",
        "name": "Texto enriquecido",
        "description": "Contenido textual con titulo y parrafos.",
        "default_props": {
            "anchor": "",
            "title": "Titulo de seccion",
            "body": "Escribe el contenido de esta seccion.",
        },
    },
    {
        "type": "info_card",
        "name": "InfoCard",
        "description": "Recuadro informativo con icono y texto.",
        "default_props": {
            "anchor": "",
            "title": "Informacion",
            "body": "Escribe aqui el texto informativo.",
        },
    },
    {
        "type": "content_index",
        "name": "Indice de contenidos",
        "description": "Indice con enlaces internos a secciones de la pagina.",
        "default_props": {
            "items": [
                {"text": "Seccion", "href": "#seccion"},
            ],
        },
    },
    {
        "type": "accordion",
        "name": "Acordeon",
        "description": "Lista desplegable de preguntas, principios o responsabilidades.",
        "default_props": {
            "anchor": "",
            "title": "Acordeon",
            "subtitle": "",
            "source": "",
            "items": [
                {"title": "Elemento", "content": "Contenido"},
            ],
        },
    },
    {
        "type": "cards",
        "name": "Cards",
        "description": "Listado de tarjetas con titulo, texto y enlace opcional.",
        "default_props": {
            "title": "Destacados",
            "items": [
                {"title": "Elemento", "text": "Descripcion", "url": ""},
            ],
        },
    },
    {
        "type": "profile_cards",
        "name": "Profile cards",
        "description": "Tarjetas grandes con imagen, icono o enlace interno.",
        "default_props": {
            "items": [
                {"title": "Tarjeta", "subtitle": "", "source": "", "to": "/", "icon": "card"},
            ],
        },
    },
    {
        "type": "link_cards",
        "name": "Link cards",
        "description": "Tarjetas para enlaces externos con descripcion y boton.",
        "default_props": {
            "items": [
                {
                    "id": "enlace",
                    "title": "Enlace externo",
                    "description": "Descripcion del recurso.",
                    "href": "https://example.com",
                    "linkText": "Visitar",
                },
            ],
        },
    },
    {
        "type": "carousel",
        "name": "Carousel",
        "description": "Galeria de imagenes con titulo y descripcion.",
        "default_props": {
            "items": [
                {"title": "Imagen", "text": "Descripcion", "image": ""},
            ],
        },
    },
    {
        "type": "service_stack",
        "name": "Servicios destacados",
        "description": "Servicios numerados con panel visual que cambia al hacer scroll.",
        "default_props": {
            "title": "Nuestros Servicios",
            "subtitle": "Servicios disponibles.",
            "items": [
                {
                    "title": "Servicio",
                    "description": "Descripcion del servicio.",
                    "to": "/",
                    "linkText": "Explorar",
                    "icon": "wrench",
                    "gradient": "blue",
                },
            ],
        },
    },
    {
        "type": "latest_news",
        "name": "Ultimas noticias",
        "description": "Grid dinamico con las ultimas noticias publicadas.",
        "default_props": {
            "collection": "noticias",
            "title": "Ultimas Noticias",
            "subtitle": "Mantente al dia.",
            "limit": "3",
            "linkText": "Ver todas",
            "linkUrl": "/noticias",
        },
    },
    {
        "type": "collection_links",
        "name": "Coleccion con enlaces",
        "description": "Grid de tarjetas de coleccion dinamica. Cada tarjeta enlaza a la URL del elemento.",
        "default_props": {
            "collection": "",
            "displayFields": [],
        },
    },
    {
        "type": "info_items",
        "name": "Items de informacion",
        "description": "Grid de tarjetas de coleccion dinamica con panel de detalle al hacer clic.",
        "default_props": {
            "collection": "",
            "displayFields": [],
        },
    },
    {
        "type": "form",
        "name": "Formulario",
        "description": "Formulario existente del proyecto.",
        "default_props": {
            "form": "contacto",
        },
    },
    {
        "type": "full_form",
        "name": "Formulario completo",
        "description": "Formulario con nombre, teléfono, email y mensaje. Los envíos llegan a Solicitudes.",
        "default_props": {
            "anchor": "",
            "title": "Cuéntanos qué necesitas",
            "subtitle": "Déjanos tus datos y te contactaremos lo antes posible.",
            "messageLabel": "Cuéntanos o detalla lo que necesitas",
            "messagePlaceholder": "Marca, modelo, presupuesto, plazos… cualquier detalle nos ayuda.",
            "buttonText": "Enviar solicitud",
            "successMessage": "¡Gracias! Hemos recibido tu solicitud y te contactaremos pronto.",
        },
    },
    {
        "type": "import_request",
        "name": "Importación a la carta",
        "description": "Dos opciones (búsqueda de coche / coche ya encontrado), cada una con su formulario. Los envíos llegan a Solicitudes y por correo.",
        "default_props": {
            "anchor": "",
            "title": "¿Cómo quieres importar tu coche?",
            "subtitle": "Elige la opción que mejor encaje contigo y rellena el formulario. Te responderemos con un presupuesto sin compromiso.",
            "searchCardTitle": "Búscame un coche",
            "searchCardText": "Dinos qué coche quieres y tu presupuesto. Lo buscamos en Europa, lo revisamos y te lo traemos.",
            "searchCardButton": "Quiero que me lo busquéis",
            "foundCardTitle": "Ya lo he encontrado",
            "foundCardText": "¿Has visto un coche en el extranjero? Pásanos el anuncio y nos encargamos de todo: revisión, transporte y matriculación.",
            "foundCardButton": "Tengo el anuncio",
            "searchFormTitle": "Cuéntanos qué coche buscas",
            "searchFormIntro": "Cuanto más detalle nos des, más ajustada será la búsqueda.",
            "foundFormTitle": "Datos del coche que has encontrado",
            "foundFormIntro": "Pega el enlace del anuncio y, si quieres, añade capturas por si el anuncio desaparece.",
            "successMessage": "¡Gracias! Hemos recibido tu solicitud. Te contactaremos en menos de 24-48 h laborables.",
        },
    },
    {
        "type": "cta",
        "name": "CTA",
        "description": "Bloque compacto con boton.",
        "default_props": {
            "title": "Llamada a la accion",
            "text": "Descripcion breve",
            "buttonText": "Ver mas",
            "buttonUrl": "/",
        },
    },
    {
        "type": "placeholder",
        "name": "Placeholder",
        "description": "Bloque temporal para paginas todavia sin contenido.",
        "default_props": {
            "text": "Pagina pendiente de contenido.",
        },
    },
    {
        "type": "youtube_embed",
        "name": "Video de YouTube",
        "description": "Incrusta un video de YouTube a partir de su URL.",
        "default_props": {
            "url": "",
            "title": "",
        },
    },
    # ── Nuevos componentes ──────────────────────────────────────────
    {
        "type": "banner",
        "name": "Banner / Aviso",
        "description": "Mensaje destacado con variante visual: info, exito, advertencia o error.",
        "default_props": {
            "variant": "info",
            "title": "Aviso importante",
            "text": "Texto del aviso.",
        },
    },
    {
        "type": "stats_row",
        "name": "Estadisticas",
        "description": "Fila de numeros grandes con etiqueta. Ideal para destacar cifras clave.",
        "default_props": {
            "title": "",
            "items": [
                {"value": "200+", "unit": "", "label": "Usuarios"},
                {"value": "50",   "unit": "",  "label": "Maquinas"},
                {"value": "10",   "unit": " anos", "label": "De experiencia"},
            ],
        },
    },
    {
        "type": "image_text",
        "name": "Imagen + Texto",
        "description": "Seccion con imagen a un lado y texto con titulo y boton al otro.",
        "default_props": {
            "imageUrl": "",
            "imageAlt": "",
            "imagePosition": "left",
            "title": "Titulo de la seccion",
            "text": "Describe aqui el contenido de esta seccion.",
            "buttonText": "",
            "buttonUrl": "",
        },
    },
    {
        "type": "gallery",
        "name": "Galeria de imagenes",
        "description": "Grid de imagenes con pie de foto opcional.",
        "default_props": {
            "title": "",
            "columns": 3,
            "items": [
                {"src": "", "alt": "", "caption": ""},
            ],
        },
    },
    {
        "type": "steps",
        "name": "Pasos / Proceso",
        "description": "Lista numerada de pasos para explicar un proceso o tutorial.",
        "default_props": {
            "title": "Como funciona",
            "subtitle": "",
            "items": [
                {"title": "Paso 1", "text": "Descripcion del primer paso."},
                {"title": "Paso 2", "text": "Descripcion del segundo paso."},
                {"title": "Paso 3", "text": "Descripcion del tercer paso."},
            ],
        },
    },
    {
        "type": "feature_list",
        "name": "Lista de caracteristicas",
        "description": "Lista de ventajas o caracteristicas con icono de check.",
        "default_props": {
            "title": "Por que elegirnos",
            "columns": 2,
            "items": [
                {"title": "Caracteristica 1", "text": "Descripcion breve."},
                {"title": "Caracteristica 2", "text": "Descripcion breve."},
            ],
        },
    },
    {
        "type": "divider",
        "name": "Separador",
        "description": "Linea horizontal de separacion entre secciones, con etiqueta opcional.",
        "default_props": {
            "label": "",
        },
    },
    {
        "type": "map_embed",
        "name": "Mapa embebido",
        "description": "Incrusta un mapa de Google Maps u otro servicio mediante iframe.",
        "default_props": {
            "src": "",
            "title": "Ubicacion",
            "height": 400,
        },
    },
    {
        "type": "tabs_section",
        "name": "Pestanas de contenido",
        "description": "Organiza contenido en pestanas seleccionables.",
        "default_props": {
            "title": "",
            "tabs": [
                {"label": "Pestana 1", "content": "Contenido de la primera pestana."},
                {"label": "Pestana 2", "content": "Contenido de la segunda pestana."},
            ],
        },
    },
]

HIDDEN_COMPONENT_TYPES = {"data_collection"}


def normalize_slug(slug: str) -> str:
    cleaned = slug.strip().lower()
    cleaned = re.sub(r"[^a-z0-9\-\/]+", "-", cleaned)
    cleaned = re.sub(r"-+", "-", cleaned)
    cleaned = re.sub(r"/+", "/", cleaned)
    return cleaned.strip("-/")



class CmsPageService:

    # ..............................
    @staticmethod
    def component_types():
        from sqlalchemy import text
        from app.db import engine
        try:
            with engine.connect() as connection:
                result = connection.execute(
                    text("SELECT name, label AS name_label, description, config_schema FROM component_types ORDER BY id")
                )
                db_types = []
                for row in result.mappings().all():
                    if row["name"] in HIDDEN_COMPONENT_TYPES:
                        continue
                    # Find matching default_props from in-memory list
                    match = next((ct for ct in COMPONENT_TYPES if ct["type"] == row["name"]), None)
                    db_types.append({
                        "type": row["name"],
                        "name": row["name_label"],
                        "description": row["description"] or "",
                        "default_props": match["default_props"] if match else {},
                    })
                if db_types:
                    db_type_names = {ct["type"] for ct in db_types}
                    db_types.extend(
                        ct
                        for ct in COMPONENT_TYPES
                        if ct["type"] not in db_type_names and ct["type"] not in HIDDEN_COMPONENT_TYPES
                    )
                    return db_types
        except Exception:
            pass
        return COMPONENT_TYPES

    # ..............................
    @staticmethod
    def find_all(include_unpublished: bool = False):
        return CmsPageRepository.find_all(include_unpublished=include_unpublished)

    # ..............................
    @staticmethod
    def find_by_id(page_id: int):
        return CmsPageRepository.find_by_id(page_id)

    # ..............................
    @staticmethod
    def find_by_slug(slug: str, include_unpublished: bool = False):
        return CmsPageRepository.find_by_slug(
            normalize_slug(slug),
            include_unpublished=include_unpublished,
        )

    # ..............................
    @staticmethod
    def find_nav_pages():
        return CmsPageRepository.find_nav_pages()

    # ..............................
    @staticmethod
    def create(page: CmsPage):
        page.slug = normalize_slug(page.slug)
        return CmsPageRepository.create(page)

    # ..............................
    @staticmethod
    def update(page_id: int, page: CmsPageUpdate):
        if page.slug is not None:
            page.slug = normalize_slug(page.slug)
        return CmsPageRepository.update(page_id, page)

    # ..............................
    @staticmethod
    def delete(page_id: int):
        return CmsPageRepository.delete(page_id)
