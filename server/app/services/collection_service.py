from sqlalchemy.exc import IntegrityError
from app.models.Collection import CollectionCreate, CollectionUpdate, CollectionItemCreate, CollectionItemUpdate
from app.repositories.collection_repository import CollectionRepository


class CollectionService:

    @staticmethod
    def find_all():
        return CollectionRepository.find_all()

    @staticmethod
    def find_by_id(collection_id: int):
        return CollectionRepository.find_by_id(collection_id)

    @staticmethod
    def find_by_slug(slug: str):
        return CollectionRepository.find_by_slug(slug)

    @staticmethod
    def create(data: CollectionCreate):
        return CollectionRepository.create(data)

    @staticmethod
    def update(collection_id: int, data: CollectionUpdate):
        return CollectionRepository.update(collection_id, data)

    @staticmethod
    def delete(collection_id: int):
        collection = CollectionRepository.find_by_id(collection_id)
        if not collection:
            raise LookupError("Colección no encontrada")
        if collection["is_locked"]:
            raise ValueError("Esta colección está protegida y no puede eliminarse")
        try:
            deleted = CollectionRepository.delete(collection_id)
        except IntegrityError:
            raise ValueError(
                "La colección todavía tiene elementos. Elimínalos primero antes de borrar la colección."
            )
        if not deleted:
            raise ValueError("No se pudo eliminar la colección")
        return {"message": "Colección eliminada correctamente"}

    # ── Items ──────────────────────────────────────────────────────────────────

    @staticmethod
    def find_items(collection_id: int):
        return CollectionRepository.find_items(collection_id)

    @staticmethod
    def create_item(collection_id: int, item: CollectionItemCreate):
        collection = CollectionRepository.find_by_id(collection_id)
        if not collection:
            raise LookupError("Colección no encontrada")
        return CollectionRepository.create_item(collection_id, item)

    @staticmethod
    def update_item(collection_id: int, item_id: int, item: CollectionItemUpdate):
        existing = CollectionRepository.find_item(collection_id, item_id)
        if not existing:
            raise LookupError("Item no encontrado")
        return CollectionRepository.update_item(collection_id, item_id, item)

    @staticmethod
    def delete_item(collection_id: int, item_id: int):
        existing = CollectionRepository.find_item(collection_id, item_id)
        if not existing:
            raise LookupError("Item no encontrado")
        try:
            deleted = CollectionRepository.delete_item(collection_id, item_id)
        except IntegrityError:
            raise ValueError(
                "Este elemento está referenciado por otros registros y no puede eliminarse"
            )
        if not deleted:
            raise ValueError("No se pudo eliminar el item")
        return {"message": "Item eliminado correctamente"}
