from dependency_injector import containers, providers
from features.exams.exam_consumer import ExamConsumer
from features.exams.exam_result_repository import ExamResultRepository
from features.exams.exam_service import ExamService


class Container(containers.DeclarativeContainer):
    exam_result_repository = providers.Factory(
        ExamResultRepository,
    )

    exam_service = providers.Factory(
        ExamService,
        exam_result_repository=exam_result_repository,
    )

    exam_consumer = providers.Factory(
        ExamConsumer,
        exam_service=exam_service,
    )
