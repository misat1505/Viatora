import logging

from dependency_injector import containers, providers
from grpc_server.auth_servicer import AuthServicer
from repositories.refresh_token_repository import RefreshTokenRepository
from repositories.user_repository import UserRepository
from services.auth_service import AuthService
from services.google_oauth_service import GoogleOAuthService
from services.token_service import TokenService
from services.user_service import UserService
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s: %(message)s",
)


class Container(containers.DeclarativeContainer):
    settings = providers.Configuration()

    logger = providers.Object(logging.getLogger())

    engine = providers.Singleton(
        create_async_engine,
        settings.database_url,
    )

    session_factory = providers.Singleton(
        async_sessionmaker,
        bind=engine,
        expire_on_commit=False,
    )

    refresh_token_repository = providers.Factory(
        RefreshTokenRepository,
        session_factory=session_factory,
    )

    user_repository = providers.Factory(
        UserRepository,
        session_factory=session_factory,
    )

    google_oauth_service = providers.Factory(
        GoogleOAuthService,
        settings=settings,
    )

    token_service = providers.Factory(
        TokenService,
        refresh_token_repository=refresh_token_repository,
        settings=settings,
    )

    user_service = providers.Factory(
        UserService, user_repository=user_repository, token_service=token_service
    )

    auth_service = providers.Factory(
        AuthService,
        user_service=user_service,
        token_service=token_service,
        google_oauth_service=google_oauth_service,
        logger=logger,
    )

    auth_servicer = providers.Factory(
        AuthServicer,
        auth_service=auth_service,
    )
