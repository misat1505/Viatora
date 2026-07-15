from features.exams.exam_result_repository import ExamResultRepository
from features.exams.models.exam import ExamFinishedPayload


class ExamService:
    def __init__(self, exam_result_repository: ExamResultRepository):
        self.exam_result_repository = exam_result_repository

    def process_exam_finished(self, exam: ExamFinishedPayload):
        print("ExamService", "process_exam_finished")
        self.exam_result_repository.insert_result(exam)
