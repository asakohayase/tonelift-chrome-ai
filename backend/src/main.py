import os
from .middleware import setup_middlewares
from fastapi import FastAPI, HTTPException, UploadFile, Form, File
from fastapi.middleware.cors import CORSMiddleware
from .models import InputRequest, ProcessedResponse
from .processor import ToneProcessor
import json
from dotenv import load_dotenv

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)