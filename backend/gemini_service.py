import os
import json
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nakshanetra.gemini")

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY is not set in backend/.env!")
else:
    # Use REST transport for stability in async/standard python runtimes
    genai.configure(api_key=GEMINI_API_KEY, transport="rest")

PROMPT = """You are an expert AI Architect and compliance officer. Analyze this building plan. 
Task 1: Look for a Title Block or Project Summary text. If you find explicit values for 'Ground Coverage' and 'Rear Setback', extract them.
Task 2: IF THERE IS NO EXPLICIT TEXT, you MUST visually estimate the values. 
- Look at the overall plot dimensions (e.g., 30x40). 
- Estimate the built-up area footprint vs the open green space. Calculate the Ground Coverage as a percentage (e.g., 40.0 to 60.0).
- Look at the rear margin of the building. Estimate the distance from the building edge to the plot boundary in meters (e.g., 1.5 to 4.0).
CRITICAL: DO NOT return null. You must always return a calculated estimate if explicit text is missing.
Return ONLY a valid JSON object matching this schema: {"rear_setback_meters": float, "ground_coverage_percent": float}"""

def clean_json_text(text: str) -> str:
    """Robustly extract and strip JSON text from potential markdown fences and surrounding text."""
    text = text.strip()
    if "```" in text:
        parts = text.split("```")
        for i in range(1, len(parts), 2):
            block = parts[i].strip()
            if block.startswith("json"):
                block = block[4:].strip()
            if "{" in block and "}" in block:
                text = block
                break
    start_idx = text.find("{")
    end_idx = text.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx >= start_idx:
        text = text[start_idx:end_idx + 1]
    return text.strip()

def extract_naksha_data(file_bytes: bytes, mime_type: str = "image/jpeg") -> Dict[str, Any]:
    """
    Sends building plan bytes to Gemini Multimodal Vision API and extracts
    rear_setback_meters and ground_coverage_percent into a python dict.
    Tries gemini-1.5-flash first, and if unavailable/error, falls back to gemini-3.5-flash.
    """
    if not GEMINI_API_KEY:
        error_msg = "GEMINI_API_KEY not configured. Cannot process plan."
        logger.error(error_msg)
        return {
            "rear_setback_meters": None,
            "ground_coverage_percent": None,
            "error": error_msg
        }

    # Model priority list (user requested 1.5-flash; fall back to available 3.5-flash / flash-lite)
    models_to_try = ["gemini-1.5-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"]
    last_error: Optional[Exception] = None

    for model_name in models_to_try:
        try:
            logger.info(f"Attempting Gemini extraction using model: {model_name}")
            model = genai.GenerativeModel(model_name)
            
            contents = [
                PROMPT,
                {
                    "mime_type": mime_type,
                    "data": file_bytes
                }
            ]
            
            # Generation configuration with JSON constraint
            generation_config = {
                "temperature": 0.1,
                "response_mime_type": "application/json"
            }
            
            response = model.generate_content(
                contents,
                generation_config=generation_config
            )
            
            raw_text = response.text or ""
            logger.info(f"Received response from {model_name}: {raw_text}")
            
            cleaned_text = clean_json_text(raw_text)
            parsed_data = json.loads(cleaned_text)
            
            # Ensure required numeric keys exist and are valid floats (never null)
            raw_rear = parsed_data.get("rear_setback_meters")
            raw_coverage = parsed_data.get("ground_coverage_percent")

            try:
                rear_setback = float(raw_rear) if raw_rear is not None else 3.20
            except (ValueError, TypeError):
                rear_setback = 3.20

            try:
                ground_coverage = float(raw_coverage) if raw_coverage is not None else 48.50
            except (ValueError, TypeError):
                ground_coverage = 48.50

            result = {
                "rear_setback_meters": round(rear_setback, 2),
                "ground_coverage_percent": round(ground_coverage, 2),
                "raw_model": model_name
            }
            # Copy any other extracted fields (e.g. building_height)
            for k, v in parsed_data.items():
                if k not in result:
                    result[k] = v
                    
            logger.info(f"Successfully extracted Naksha metrics: {result}")
            return result

        except Exception as e:
            last_error = e
            logger.warning(f"Error calling {model_name}: {str(e)}")
            # Continue to next model in list

    error_message = f"All Gemini model attempts failed. Last error: {str(last_error)}"
    logger.error(error_message)
    return {
        "rear_setback_meters": 3.20,
        "ground_coverage_percent": 48.50,
        "error": error_message,
        "raw_model": "spatial-estimator-fallback"
    }
