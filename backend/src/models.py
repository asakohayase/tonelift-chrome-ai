from pydantic import BaseModel
from typing import Optional, List

class Context(BaseModel):
    situation: str
    importance: str
    additionalContext: Optional[str] = None

class InputRequest(BaseModel):
    text: str
    context: Context

class AnalysisResult(BaseModel):
    tone: str
    confidence: float
    improvements: List[str]

class ProcessedResponse(BaseModel):
    original_text: str
    transformed_text: str
    analysis: AnalysisResult