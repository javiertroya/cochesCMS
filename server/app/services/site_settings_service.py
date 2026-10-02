from app.models.SiteSettings import SiteSettingsUpdate
from app.repositories.site_settings_repository import SiteSettingsRepository


class SiteSettingsService:

    @staticmethod
    def get():
        return SiteSettingsRepository.get()

    @staticmethod
    def update(data: SiteSettingsUpdate):
        return SiteSettingsRepository.update(data)
