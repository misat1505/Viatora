from features.exams.models.exam import ExamFinishedPayload
from features.exams.user_exam_statistics_repository import UserExamStatisticsRepository


class ExamService:
    def __init__(self, user_exam_statistics_repository: UserExamStatisticsRepository):
        self.user_exam_statistics_repository = user_exam_statistics_repository

    def process_exam_finished(self, exam: ExamFinishedPayload):
        print("ExamService", "process_exam_finished")
        self.user_exam_statistics_repository.insert_result(exam)
