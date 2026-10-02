from app.models.Redirect import RedirectCreate, RedirectUpdate
from app.repositories.redirect_repository import RedirectRepository


class RedirectService:

    @staticmethod
    def find_all():
        return RedirectRepository.find_all()

    @staticmethod
    def create(data: RedirectCreate):
        return RedirectRepository.create(data)

    @staticmethod
    def update(redirect_id: int, data: RedirectUpdate):
        return RedirectRepository.update(redirect_id, data)

    @staticmethod
    def delete(redirect_id: int):
        deleted = RedirectRepository.delete(redirect_id)
        if not deleted:
            raise LookupError("Redirección no encontrada")
        return {"message": "Redirección eliminada correctamente"}
