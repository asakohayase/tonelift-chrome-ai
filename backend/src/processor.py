import json
import os
from openai import OpenAI
from typing import Dict
from src.models import Context, InputRequest, ProcessedResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class ToneProcessor:
    def __init__(self):
        api_key = os.getenv("NGC_API_KEY")
        org_id = os.getenv("NGC_ORG_ID")
        if not api_key or not org_id:
            raise ValueError("NGC_API_KEY and NGC_ORG_ID are required")

        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=api_key,
            default_headers={"Organization-Id": org_id},
        )
        self.MODEL_ID = os.getenv("NGC_MODEL_ID", "meta/llama-3.1-405b-instruct")

    def _create_context_prompt(self, context: Context) -> str:
        """Create a context prompt from the Context object"""
        # Get tone guideline based on formality
        tone_guideline = (
            "professional yet empathetic"
            if context.formality == "formal"
            else "friendly and understanding"
        )

        context_parts = [
            f"Situation: {context.situation}",
            f"Tone: {tone_guideline}",
        ]
        if context.additionalContext:
            context_parts.append(f"Additional Context: {context.additionalContext}")
        return "\n".join(context_parts)

    def process_input(self, request: InputRequest) -> ProcessedResponse:
        """Process the input text"""
        if not request.text:
            raise ValueError("Input text is required")

        transformed = self._transform_text(request)

        return ProcessedResponse(
            original_text=request.text,
            transformed_text=transformed.get("text", request.text),
            improvements=transformed.get("improvements", []),
        )

    def _transform_text(self, request: InputRequest) -> Dict:
        """Transform text using NVIDIA model"""
        context_prompt = self._create_context_prompt(request.context)

        try:
            completion = self.client.chat.completions.create(
                model=self.MODEL_ID,
                messages=[
                    {
                        "role": "system",
                        "content": """You are an expert at transforming text to be more positive, empathetic, and appropriate.
                        Show understanding of emotions and perspectives while being constructive.
                        Respond with ONLY a JSON object containing 'text' and 'improvements' fields.
                        Do not add any explanatory text before or after the JSON.""",
                    },
                    {
                        "role": "user",
                        "content": f"""
                        Context Information:
                        {context_prompt}

                        Original text: {request.text}
                        
                        Transform this text to:
                        1. Show understanding and empathy
                        2. Maintain a constructive approach
                        3. Be positive while acknowledging concerns
                        4. Keep the core message clear
                        5. Match the specified tone
                        """,
                    },
                ],
                temperature=0.3,
                max_tokens=1024,
            )

            response_text = completion.choices[0].message.content.strip()

            try:
                # Try to parse JSON, removing any non-JSON text
                json_start = response_text.find("{")
                json_end = response_text.rfind("}") + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = response_text[json_start:json_end]
                    return json.loads(json_str)
                else:
                    return {
                        "text": response_text,
                        "improvements": ["Text transformed with empathy"],
                    }
            except json.JSONDecodeError:
                return {
                    "text": response_text,
                    "improvements": ["Text transformed with empathy"],
                }

        except Exception as e:
            print(f"Error in text transformation: {str(e)}")
            return {
                "text": request.text,
                "improvements": ["Error occurred during transformation"],
            }
