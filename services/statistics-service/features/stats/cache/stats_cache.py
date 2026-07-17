from features.stats.models.user_exam_statistics_dto import UserExamStatisticsDTO
from redis.asyncio import Redis


class StatsCache:
    def __init__(self, redis: Redis, ttl_seconds: int = 300):
        self.redis = redis
        self.prefix = "statistics-service"
        self.ttl_seconds = ttl_seconds

    async def set(
        self,
        stats: UserExamStatisticsDTO,
    ) -> None:
        key = self.build_key(stats.user_id)

        await self.redis.set(
            key,
            stats.model_dump_json(),
            ex=self.ttl_seconds,
        )

    async def get(
        self,
        user_id: str,
    ) -> UserExamStatisticsDTO | None:
        key = self.build_key(user_id)

        data = await self.redis.get(key)

        if data is None:
            return None

        return UserExamStatisticsDTO.model_validate_json(data)

    async def update(
        self,
        stats: UserExamStatisticsDTO,
    ) -> None:
        await self.set(stats)

    async def delete(
        self,
        user_id: str,
    ) -> None:
        key = self.build_key(user_id)
        await self.redis.delete(key)

    def build_key(
        self,
        user_id: str,
    ) -> str:
        return f"{self.prefix}:stats:{user_id}"
