from features.exams.exam_service import ExamService
from features.exams.models.enums.topics import Topics
from features.exams.models.exam import ExamFinishedPayload
from utils.decorators import KafkaConsumer, TopicHandler, ValidatePayload


@KafkaConsumer
class ExamConsumer:
    def __init__(self, exam_service: ExamService):
        self.exam_service = exam_service

    @TopicHandler(Topics.EXAM_FINISHED.value)
    @ValidatePayload(ExamFinishedPayload)
    def handle_exam_finished(self, data: ExamFinishedPayload):
        self.exam_service.process_exam_finished(data)
