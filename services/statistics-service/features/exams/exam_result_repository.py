from features.exams.models.exam import ExamFinishedPayload


class ExamResultRepository:
    def insert_result(self, result: ExamFinishedPayload):
        print(f"INSERTING result: {result.sessionId}")
