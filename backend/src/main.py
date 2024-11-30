from fastapi import FastAPI, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import json
from dotenv import load_dotenv
import os
from src.models import InputRequest, ProcessedResponse, Context
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


@app.get("/")
async def root():
    return {
        "status": "online",
        "endpoints": {
            "process": "/process/ (POST)",
        },
    }


@app.post("/process/", response_model=ProcessedResponse)
async def process_input(text: str = Form(...), context: str = Form(...)):
    try:
        context_dict = json.loads(context)
        if not text:
            raise ValueError("Text is required")

        # Ensure context has required fields with defaults
        context_dict = {
            "situation": context_dict.get("situation", "other"),
            "formality": context_dict.get("formality", "formal"),
            "additionalContext": context_dict.get("additionalContext", ""),
        }

        # Create a validated Context object
        context_obj = Context(**context_dict)

        processor = ToneProcessor()
        request = InputRequest(text=text, context=context_obj)

        response = processor.process_input(request)
        return ProcessedResponse(
            original_text=response.original_text,
            transformed_text=response.transformed_text,
            improvements=response.improvements,
        )

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid context format")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        error_message = f"Error processing request: {str(e)}"
        print(error_message)  # For logging
        raise HTTPException(status_code=500, detail=error_message)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
