import json

from features.exams.models.entities.user_exam_statistics import UserExamStatistics
from redis.asyncio import Redis


class StatsCache:
    def __init__(self, redis: Redis):
        self.redis = redis
        self.prefix = "statistics-service"

    async def set(self, stats: UserExamStatistics) -> None:
        key = self.build_key(stats.user_id)

        payload = {
            "id": stats.id,
            "user_id": stats.user_id,
            "total_exams": stats.total_exams,
            "passed_exams": stats.passed_exams,
            "pass_rate": stats.pass_rate,
            "average_score": stats.average_score,
            "best_score": stats.best_score,
            "current_streak": stats.current_streak,
            "longest_streak": stats.longest_streak,
            "total_time_minutes": stats.total_time_minutes,
        }

        await self.redis.set(key, json.dumps(payload))

    async def get(self, user_id: str) -> UserExamStatistics | None:
        key = self.build_key(user_id)

        data = await self.redis.get(key)
        if data is None:
            return None

        payload = json.loads(data)
        return UserExamStatistics(**payload)

    async def delete(self, user_id: str) -> None:
        key = self.build_key(user_id)
        await self.redis.delete(key)

    def build_key(self, user_id: str) -> str:
        key = f"{self.prefix}:stats:{user_id}"
        return key
