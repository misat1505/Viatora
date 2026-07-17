from confluent_kafka import Consumer
from features.exams.models.enums.topics import Topics
from features.exams.models.exam import ExamFinishedPayload
from features.stats.stats_service import StatsService
from utils.async_kafka_consumer import AsyncKafkaConsumer
from utils.decorators import KafkaTopic, ValidatePayload


class ExamConsumer(AsyncKafkaConsumer):
    def __init__(self, consumer: Consumer, stats_service: StatsService):
        super().__init__(consumer)
        self.stats_service = stats_service

    @KafkaTopic(Topics.EXAM_FINISHED)
    @ValidatePayload(ExamFinishedPayload)
    async def handle_exam_finished(self, payload: ExamFinishedPayload):
        await self.stats_service.add_exam_result(payload)
