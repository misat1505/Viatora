from features.exams.exam_service import ExamService
from features.exams.models.enums.topics import Topics
from features.exams.models.exam import ExamFinishedPayload
from utils.decorators import KafkaConsumer, TopicConsumer, ValidatePayload


@KafkaConsumer
class ExamConsumer:
    def __init__(self, exam_service: ExamService):
        self.exam_service = exam_service

    @TopicConsumer(Topics.EXAM_FINISHED)
    @ValidatePayload(ExamFinishedPayload)
    def handle_exam_finished(self, data: ExamFinishedPayload):
        self.exam_service.process_exam_finished(data)
