from fastapi import APIRouter, Depends, HTTPException, status

from app.models.CmsPage import CmsPage, CmsPageUpdate
from app.services.audit_log_service import AuditLogService, _diff
from app.services.cms_page_service import CmsPageService
from app.utils.auth_utils import get_optional_current_user, require_staff

_PAGE_DIFF_FIELDS = {"title", "slug", "status", "requires_auth", "seo_title", "seo_description", "page_color"}

router = APIRouter()


@router.get("/api/admin/cms/component-types")
def get_component_types(_current_user: dict = Depends(require_staff)):
    return CmsPageService.component_types()


@router.get("/api/admin/cms/pages")
def get_admin_pages(_current_user: dict = Depends(require_staff)):
    return CmsPageService.find_all(include_unpublished=True)


@router.get("/api/cms/nav-pages")
def get_nav_pages():
    return CmsPageService.find_nav_pages()


@router.post("/api/admin/cms/pages")
def create_page(page: CmsPage, current_user: dict = Depends(require_staff)):
    try:
        created = CmsPageService.create(page)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="No se pudo crear la pagina") from exc

    if not created:
        raise HTTPException(status_code=400, detail="No se pudo crear la pagina")

    AuditLogService.log(
        user=current_user,
        action="create",
        resource_type="cms_page",
        resource_id=created["id"],
        resource_label=created["title"],
    )
    return created


@router.put("/api/admin/cms/pages/{page_id}")
def update_page(
    page_id: int,
    page: CmsPageUpdate,
    current_user: dict = Depends(require_staff),
):
    before = CmsPageService.find_by_id(page_id) or {}
    try:
        updated = CmsPageService.update(page_id, page)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="No se pudo actualizar la pagina") from exc

    if not updated:
        raise HTTPException(status_code=404, detail="Pagina no encontrada")

    AuditLogService.log(
        user=current_user,
        action="update",
        resource_type="cms_page",
        resource_id=page_id,
        resource_label=updated["title"],
        changes=_diff(before, dict(updated), _PAGE_DIFF_FIELDS),
    )
    return updated


@router.delete("/api/admin/cms/pages/{page_id}")
def delete_page(page_id: int, current_user: dict = Depends(require_staff)):
    before = CmsPageService.find_by_id(page_id)
    deleted = CmsPageService.delete(page_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Pagina no encontrada")

    AuditLogService.log(
        user=current_user,
        action="delete",
        resource_type="cms_page",
        resource_id=page_id,
        resource_label=before["title"] if before else f"Página #{page_id}",
    )
    return {"message": "Pagina eliminada correctamente"}


@router.get("/api/cms/pages/{slug:path}")
def get_public_page(
    slug: str,
    current_user: dict | None = Depends(get_optional_current_user),
):
    page = CmsPageService.find_by_slug(slug)
    if not page:
        raise HTTPException(status_code=404, detail="Pagina no encontrada")

    if page.get("requires_auth") and not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Debes iniciar sesion para ver esta pagina",
        )

    return page
