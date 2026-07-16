from features.exams.models.enums.topics import Topics
from features.exams.models.exam import ExamFinishedPayload
from features.stats.stats_service import StatsService
from utils.decorators import KafkaConsumer, TopicConsumer, ValidatePayload


@KafkaConsumer
class ExamConsumer:
    def __init__(self, stats_service: StatsService):
        self.stats_service = stats_service

    @TopicConsumer(Topics.EXAM_FINISHED)
    @ValidatePayload(ExamFinishedPayload)
    async def handle_exam_finished(self, data: ExamFinishedPayload):
        await self.stats_service.add_exam_result(data)
