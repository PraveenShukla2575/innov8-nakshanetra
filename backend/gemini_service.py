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

PROMPT = """
You are an expert GovTech architectural compliance AI evaluating a building plan ("Naksha").
Examine the building plan image or document carefully.
Locate and extract the following architectural metrics:
1. "rear_setback_meters": The rear setback distance in meters (e.g. 4.0). If specified in another unit, convert to meters.
2. "ground_coverage_percent": The ground coverage percentage (e.g. 45.0 for 45%). If specified as a ratio, convert to percentage.

If additional architectural parameters like building height are present, you may also note them, but you MUST extract:
- rear_setback_meters (float or null)
- ground_coverage_percent (float or null)

CRITICAL REQUIREMENT:
You must respond with ONLY valid JSON and no conversational text.
Example JSON:
{
  "rear_setback_meters": 4.0,
  "ground_coverage_percent": 45.0
}
If any metric cannot be determined from the plan, set its value to null.
"""

def clean_json_text(text: str) -> str:
    """Strip markdown code fence blocks if present."""
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()
    return text

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
            
            # Ensure required keys exist
            result = {
                "rear_setback_meters": parsed_data.get("rear_setback_meters"),
                "ground_coverage_percent": parsed_data.get("ground_coverage_percent"),
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
        "rear_setback_meters": None,
        "ground_coverage_percent": None,
        "error": error_message
    }
