from sqlalchemy import Column, Integer, String, DateTime, Table, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


user_team = Table(
    "user_team",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("team_id", Integer, ForeignKey("teams.id"), primary_key=True),
)


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    description = Column(String(500), default="")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    members = relationship("User", secondary=user_team, backref="teams")
