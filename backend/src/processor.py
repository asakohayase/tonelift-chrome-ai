import os
from openai import OpenAI
from typing import Dict
from src.models import InputRequest, ProcessedResponse, AnalysisResult
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class ToneProcessor:
    def __init__(self):
        api_key = os.getenv("NGC_API_KEY")
        org_id = os.getenv("NGC_ORG_ID")  # We need this too
        if not api_key:
            raise ValueError("NGC_API_KEY not found in environment variables")
        if not org_id:
            raise ValueError("NGC_ORG_ID not found in environment variables")
            
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",  # Updated endpoint
            api_key=api_key,
            default_headers={
                "Organization-Id": org_id
            }
        )
        self.MODEL_ID = os.getenv("NGC_MODEL_ID", "meta/llama-3.1-405b-instruct")

    def process_input(self, request: InputRequest) -> ProcessedResponse:
        """Process the input text by analyzing tone and transforming the text"""
        if not request.text:
            raise ValueError("Input text is required")

        # Analyze the original tone
        tone_analysis = self._analyze_tone(request.text)
        
        # Transform the text
        transformed = self._transform_text(request)
        
        # Create analysis result
        analysis = AnalysisResult(
            tone=tone_analysis['tone'],
            confidence=tone_analysis['confidence'],
            improvements=transformed.get('improvements', [])
        )
        
        # Create and return the processed response
        return ProcessedResponse(
            original_text=request.text,
            transformed_text=transformed.get('text', request.text),
            analysis=analysis
        )

    def _analyze_tone(self, text: str) -> Dict:
        """Analyze tone using NVIDIA model"""
        try:
            completion = self.client.chat.completions.create(
                model=self.MODEL_ID,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that analyzes the tone of text."
                    },
                    {
                        "role": "user",
                        "content": f"Analyze the tone of this text: {text}"
                    }
                ],
                temperature=0.2,
                top_p=0.7,
                max_tokens=1024
            )
            
            response_text = completion.choices[0].message.content
            
            if 'tone:' in response_text.lower():
                tone = response_text.split('tone:')[-1].strip().split('\n')[0]
            else:
                tone = "neutral"
                
            return {
                'tone': tone,
                'confidence': 0.85
            }
        except Exception as e:
            print(f"Error in tone analysis: {str(e)}")
            return {
                'tone': "neutral",
                'confidence': 0.5
            }
    
    def _transform_text(self, request: InputRequest) -> Dict:
        """Transform text using NVIDIA model"""
        context_prompt = self._create_context_prompt(request.context)
        
        try:
            completion = self.client.chat.completions.create(
                model=self.MODEL_ID,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that transforms text to be more professional and positive."
                    },
                    {
                        "role": "user",
                        "content": f"""
                        Context: {context_prompt}
                        Original text: {request.text}
                        
                        Task: Rewrite this text to be more professional and positive while maintaining the core message.
                        Provide the transformed text and a list of improvements made.
                        Format: {{
                            "text": "transformed text here",
                            "improvements": ["improvement 1", "improvement 2"]
                        }}
                        """
                    }
                ],
                temperature=0.3,
                top_p=0.8,
                max_tokens=1024
            )
            
            response_text = completion.choices[0].message.content
            
            try:
                # Try to parse as JSON first
                import json
                parsed_response = json.loads(response_text)
                return parsed_response
            except json.JSONDecodeError:
                return {
                    "text": response_text,
                    "improvements": ["Text transformed for more professional tone"]
                }
        except Exception as e:
            print(f"Error in text transformation: {str(e)}")
            return {
                "text": request.text,
                "improvements": ["Error occurred during transformation"]
            }

    def _create_context_prompt(self, context: Dict[str, str]) -> str:
        """Create a context prompt from the context dictionary"""
        context_items = [f"{key}: {value}" for key, value in context.items()]
        return "; ".join(context_items)