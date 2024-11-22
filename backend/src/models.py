from pydantic import BaseModel
from typing import Optional, Dict, List
from enum import Enum

class ResponseType(Enum):
    TEXT = "text"
    VOICE = "voice"

class InputRequest(BaseModel):
    text: Optional[str] = None
    context: Dict[str, str]
    response_type: ResponseType = ResponseType.TEXT

class AnalysisResult(BaseModel):
    tone: str
    confidence: float
    improvements: List[str]

class ProcessedResponse(BaseModel):
    original_text: str
    transformed_text: str
    analysis: AnalysisResult