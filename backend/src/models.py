from pydantic import BaseModel
from typing import Optional, List


class Context(BaseModel):
    situation: str
    formality: str
    additionalContext: Optional[str] = None


class InputRequest(BaseModel):
    text: str
    context: Context


class ProcessedResponse(BaseModel):
    original_text: str
    transformed_text: str
    improvements: List[str]
