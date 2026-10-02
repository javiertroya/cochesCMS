from app.repositories.audit_log_repository import AuditLogRepository


def _diff(before: dict, after: dict, keys: set) -> dict:
    return {
        k: {"before": before.get(k), "after": after.get(k)}
        for k in keys
        if before.get(k) != after.get(k)
    }


class AuditLogService:

    @staticmethod
    def log(
        *,
        user: dict,
        action: str,
        resource_type: str,
        resource_id: int | None,
        resource_label: str,
        changes: dict | None = None,
    ) -> None:
        try:
            AuditLogRepository.create(
                user_id=user.get("id"),
                user_email=user.get("email"),
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                resource_label=resource_label,
                changes=changes,
            )
        except Exception:
            pass

    @staticmethod
    def find_all(
        *,
        action: str | None = None,
        resource_type: str | None = None,
        search: str | None = None,
        limit: int = 100,
    ):
        return AuditLogRepository.find_all(
            action=action,
            resource_type=resource_type,
            search=search,
            limit=limit,
        )
