from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Request, UploadFile
from pydantic import ValidationError

from app.models.Request import (
    FullFormRequestCreate,
    ImportFoundRequestCreate,
    ImportSearchRequestCreate,
    RequestStatus,
    RequestUpdate,
)
from app.repositories.request_repository import RequestRepository
from app.services.audit_log_service import AuditLogService, _diff
from app.services.request_service import (
    AttachmentError,
    RateLimitError,
    RequestService,
    request_label,
    send_request_notification,
)
from app.utils.auth_utils import require_staff

router = APIRouter()

_SENT = {"message": "Solicitud enviada correctamente"}


def _client_ip(request: Request) -> str | None:
    return request.client.host if request.client else None


def _saved(created: dict | None, background_tasks: BackgroundTasks) -> dict:
    # created es None cuando el campo trampa venía relleno: no se guarda ni se avisa
    if created:
        background_tasks.add_task(send_request_notification, created)
    return _SENT


# ..............................
# Público: envío del componente "Formulario completo"
@router.post("/api/requests", status_code=201)
def create_request(payload: FullFormRequestCreate, request: Request, background_tasks: BackgroundTasks):
    try:
        created = RequestService.create_from_full_form(payload, _client_ip(request))
    except RateLimitError as exc:
        raise HTTPException(status_code=429, detail=str(exc))
    return _saved(created, background_tasks)


# ..............................
# Público: importación a la carta · opción 1 (búscame un coche)
@router.post("/api/requests/import-search", status_code=201)
def create_import_search(payload: ImportSearchRequestCreate, request: Request, background_tasks: BackgroundTasks):
    try:
        created = RequestService.create_import_search(payload, _client_ip(request))
    except RateLimitError as exc:
        raise HTTPException(status_code=429, detail=str(exc))
    return _saved(created, background_tasks)


# ..............................
# Público: importación a la carta · opción 2 (ya lo he encontrado), con capturas opcionales.
# multipart: campo "data" (JSON con los datos) + "files" (imágenes)
@router.post("/api/requests/import-found", status_code=201)
def create_import_found(
    request: Request,
    background_tasks: BackgroundTasks,
    data: str = Form(...),
    files: list[UploadFile] = File(default=[]),
):
    try:
        payload = ImportFoundRequestCreate.model_validate_json(data)
    except ValidationError as exc:
        # Mismo formato que los errores de validación de FastAPI (loc → nombre del campo)
        raise HTTPException(
            status_code=422,
            detail=[{"loc": ["body", *error["loc"]], "msg": error["msg"], "type": error["type"]} for error in exc.errors()],
        )

    uploads = [(upload.filename or "", upload.file.read()) for upload in files if upload.filename]
    try:
        created = RequestService.create_import_found(payload, uploads, _client_ip(request))
    except RateLimitError as exc:
        raise HTTPException(status_code=429, detail=str(exc))
    except AttachmentError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return _saved(created, background_tasks)


# ..............................
# Panel (admin y editor)
@router.get("/api/admin/requests")
def list_requests(
    status: RequestStatus | None = None,
    type: str | None = None,
    search: str | None = None,
    _current_user: dict = Depends(require_staff),
):
    return RequestService.find_all(status=status, request_type=type, search=search)


@router.patch("/api/admin/requests/{request_id}")
def update_request(request_id: int, data: RequestUpdate, current_user: dict = Depends(require_staff)):
    before = RequestRepository.find_by_id(request_id)
    if not before:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    updated = RequestService.update_status(request_id, data.status)
    AuditLogService.log(
        user=current_user,
        action="update",
        resource_type="request",
        resource_id=request_id,
        resource_label=request_label(updated),
        changes=_diff(before, updated, {"status"}),
    )
    return updated


@router.delete("/api/admin/requests/{request_id}")
def delete_request(request_id: int, current_user: dict = Depends(require_staff)):
    before = RequestRepository.find_by_id(request_id)
    try:
        result = RequestService.delete(request_id)
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc))

    AuditLogService.log(
        user=current_user,
        action="delete",
        resource_type="request",
        resource_id=request_id,
        resource_label=request_label(before) if before else f"Solicitud #{request_id}",
    )
    return result
