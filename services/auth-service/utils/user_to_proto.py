from domain.user_dto import UserDTO
from generated import auth_pb2


def user_to_proto(user: UserDTO) -> auth_pb2.UserProfile:
    return auth_pb2.UserProfile(
        user_id=str(user.user_id),
        email=user.email,
        display_name=user.display_name,
        avatar_url=user.avatar_url or "",
        is_active=user.is_active,
        created_at=user.created_at.isoformat(),
        last_login_at=user.last_login_at.isoformat() if user.last_login_at else "",
    )
