from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from utils.database import Base


class UserExamStatistics(Base):
    __tablename__ = "user_exam_statistics"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[str] = mapped_column(
        String(36),
        unique=True,
        index=True,
        nullable=False,
    )

    total_exams: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    passed_exams: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    pass_rate: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    average_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    best_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    current_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_time_minutes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
