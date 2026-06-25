from models.user import User
from repositories.user_repository import UserRepository
from services.token_service import TokenService


class UserService:
    def __init__(self, user_repository: UserRepository, token_service: TokenService):
        self.user_repository = user_repository
        self.token_service = token_service

    async def get_or_create_user(
        self,
        google_id: str,
        email: str,
        display_name: str,
        avatar_url: str | None,
    ) -> tuple[User, bool]:
        """Returns (user, is_new_user)."""
        user = await self.user_repository.get_user_by_google_id(google_id)

        if user:
            await self.user_repository.update_last_login(user.id)
            return user, False

        user = await self.user_repository.create_user(
            google_id=google_id,
            email=email,
            display_name=display_name,
            avatar_url=avatar_url,
        )
        return user, True

    async def get_user_by_id(self, user_id: str) -> User | None:
        return await self.user_repository.get_user_by_id(user_id)
