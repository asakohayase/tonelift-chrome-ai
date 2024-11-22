from fastapi import FastAPI, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import json
from dotenv import load_dotenv
import os
import requests
from src.models import InputRequest, ProcessedResponse
from src.processor import ToneProcessor
from src.middleware import setup_middlewares
from openai import OpenAI

# Load environment variables
load_dotenv()

# Check for NGC API key
if not os.getenv("NGC_API_KEY"):
    raise EnvironmentError("NGC_API_KEY not found in environment variables")

app = FastAPI()

# Configure middleware
setup_middlewares(app)

@app.post("/process/", response_model=ProcessedResponse)
async def process_input(
    text: str = Form(None),
    context: str = Form(...)
):
    try:
        context_dict = json.loads(context)
        
        processor = ToneProcessor()
        request = InputRequest(
            text=text,
            context=context_dict
        )
        
        response = processor.process_input(request)
        return response
        
    except Exception as e:
        error_message = f"Error processing request: {str(e)}"
        print(error_message)  # For logging
        raise HTTPException(status_code=500, detail=error_message)
    
@app.get("/health")
async def health_check():
    return {"status": "healthy", "ngc_api_configured": bool(os.getenv("NGC_API_KEY"))}

@app.get("/debug/env")
async def debug_env():
    return {
        "ngc_key_exists": bool(os.getenv("NGC_API_KEY")),
        "ngc_key_length": len(os.getenv("NGC_API_KEY", "")) if os.getenv("NGC_API_KEY") else 0
    }


@app.get("/test/nvidia")
async def test_nvidia_connection():
    try:
        api_key = os.getenv("NGC_API_KEY")
        org_id = os.getenv("NGC_ORG_ID")
        
        if not api_key or not org_id:
            return {
                "error": "Missing required environment variables (NGC_API_KEY or NGC_ORG_ID)",
                "status": "error"
            }

        client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",  # Updated endpoint
            api_key=api_key,
            default_headers={
                "Organization-Id": org_id
            }
        )
        
        # Test with a simple completion
        completion = client.chat.completions.create(
            model="meta/llama-3.1-405b-instruct",
            messages=[{"role": "user", "content": "Hello!"}],
            temperature=0.2,
            top_p=0.7,
            max_tokens=1024
        )
        
        return {
            "status": "success",
            "model": "meta/llama-3.1-405b-instruct",
            "response": completion.choices[0].message.content,
            "api_configured": True
        }
    except Exception as e:
        return {
            "error": str(e),
            "error_type": type(e).__name__,
            "status": "error"
        }




# Add a debug endpoint to check the API key format
@app.get("/debug/api-key")
async def debug_api_key():
    api_key = os.getenv("OPENAI_API_KEY", "")
    return {
        "has_api_key": bool(api_key),
        "starts_with_bearer": api_key.startswith("Bearer "),
        "key_length": len(api_key),
        "key_prefix": api_key[:10] + "..." if api_key else None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)