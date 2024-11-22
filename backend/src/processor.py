import requests
import json
from typing import Dict, Optional
from .models import InputRequest, ProcessedResponse, AnalysisResult
import os

class ToneProcessor:
    def __init__(self):
        self.NGC_API_KEY = os.getenv("NGC_API_KEY")
        # NVIDIA NeMo API endpoint
        self.API_URL = "https://api.nvcf.nvidia.com/v2/nemo/services"
        self.headers = {
            "Authorization": f"Bearer {self.NGC_API_KEY}",
            "Content-Type": "application/json"
        }
        
    def process_input(self, request: InputRequest) -> ProcessedResponse:
        """Process input using NVIDIA AI Foundation Models"""
        try:
            # Analyze tone using NVIDIA model
            tone_analysis = self._analyze_tone(request.text)
            
            # Transform text using NVIDIA model
            transformed = self._transform_text(request)
            
            return ProcessedResponse(
                original_text=request.text,
                transformed_text=transformed['text'],
                analysis=AnalysisResult(
                    tone=tone_analysis['tone'],
                    confidence=tone_analysis['confidence'],
                    improvements=transformed.get('improvements', [])
                )
            )
            
        except Exception as e:
            print(f"Error processing request: {e}")
            raise
    
    def _analyze_tone(self, text: str) -> Dict:
        """Analyze tone using NVIDIA model"""
        payload = {
            "messages": [
                {
                    "content": f"Analyze the tone of this text: {text}",
                    "role": "user"
                }
            ],
            "temperature": 0.2,
            "top_p": 0.7,
            "max_tokens": 1024,
            "seed": 42
        }
        
        response = requests.post(
            f"{self.API_URL}/llm/v1/completions",
            headers=self.headers,
            json=payload
        )
        
        if response.status_code != 200:
            raise Exception(f"NVIDIA API error: {response.text}")
            
        analysis = response.json()
        return self._parse_tone_analysis(analysis)
    
    def _transform_text(self, request: InputRequest) -> Dict:
        """Transform text using NVIDIA model"""
        context_prompt = self._create_context_prompt(request.context)
        
        payload = {
            "messages": [
                {
                    "content": f"""
                    Context: {context_prompt}
                    Original text: {request.text}
                    
                    Task: Rewrite this text to be more professional and positive while maintaining the core message.
                    Provide the transformed text and a list of improvements made.
                    Format: {{
                        "text": "transformed text here",
                        "improvements": ["improvement 1", "improvement 2"]
                    }}
                    """,
                    "role": "user"
                }
            ],
            "temperature": 0.3,
            "top_p": 0.8,
            "max_tokens": 1024
        }
        
        response = requests.post(
            f"{self.API_URL}/llm/v1/completions",
            headers=self.headers,
            json=payload
        )
        
        if response.status_code != 200:
            raise Exception(f"NVIDIA API error: {response.text}")
            
        result = response.json()
        return json.loads(result['choices'][0]['message']['content'])
    
    def _create_context_prompt(self, context: Dict) -> str:
        """Create context-specific prompt"""
        relationship = context.get('type', 'business')
        importance = context.get('importance', 'normal')
        return f"Professional {relationship} communication with {importance} priority"
    
    def _parse_tone_analysis(self, analysis: Dict) -> Dict:
        """Parse tone analysis response"""
        content = analysis['choices'][0]['message']['content']
        # Parse the structured content from NVIDIA's response
        # This is a simplified version - adjust based on actual response format
        return {
            'tone': content.split('tone:')[-1].strip().split('\n')[0],
            'confidence': 0.85  # Example confidence score
        }