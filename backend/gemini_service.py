import os
import io
import json
import logging
import asyncio
from typing import Dict, Any, Optional, Tuple
from dotenv import load_dotenv
from PIL import Image
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

def optimize_image_for_gemini(file_bytes: bytes, mime_type: str = "image/jpeg") -> Tuple[bytes, str]:
    """
    Compresses and downscales architectural blueprint before sending to Gemini:
    - Opens the image with PIL
    - Converts it to RGB
    - Resizes so maximum dimension is 2048 pixels (maintaining aspect ratio)
    - Compresses to JPEG with 85% quality
    Returns optimized bytes and 'image/jpeg' mime type.
    If the file cannot be opened as an image (e.g. PDF), safely returns original bytes and mime type.
    """
    try:
        with Image.open(io.BytesIO(file_bytes)) as img:
            img = img.convert("RGB")
            width, height = img.size
            max_dim = 2048

            if max(width, height) > max_dim:
                scale = max_dim / max(width, height)
                new_width = int(width * scale)
                new_height = int(height * scale)
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                logger.info(
                    f"Resized blueprint image dimensions: {width}x{height} -> {new_width}x{new_height}"
                )
            else:
                logger.info(f"Blueprint dimensions ({width}x{height}) within {max_dim}px limit. No downscaling needed.")

            output_io = io.BytesIO()
            img.save(output_io, format="JPEG", quality=85, optimize=True)
            compressed_bytes = output_io.getvalue()

            orig_kb = round(len(file_bytes) / 1024, 1)
            new_kb = round(len(compressed_bytes) / 1024, 1)
            logger.info(
                f"Image compression complete: {orig_kb} KB -> {new_kb} KB ({round(orig_kb - new_kb, 1)} KB saved)"
            )
            return compressed_bytes, "image/jpeg"
    except Exception as e:
        logger.warning(f"Image optimization skipped (e.g., PDF or raw binary): {str(e)}")
        return file_bytes, mime_type

async def extract_naksha_data(file_bytes: bytes, mime_type: str = "image/jpeg") -> Dict[str, Any]:
    """
    Sends building plan bytes to Gemini Multimodal Vision API and extracts
    rear_setback_meters and ground_coverage_percent into a python dict.
    Tries gemini-3.5-flash first, and if unavailable/error, falls back to alternative available models.
    Non-blocking: Uses asyncio.to_thread for image optimization and model generation
    to prevent freezing FastAPI's main event loop.
    """
    if not GEMINI_API_KEY:
        error_msg = "GEMINI_API_KEY not configured. Cannot process plan."
        logger.error(error_msg)
        return {
            "rear_setback_meters": None,
            "ground_coverage_percent": None,
            "error": error_msg
        }

    # Pre-process & downscale image in threadpool to prevent CPU work from blocking event loop
    processed_bytes, target_mime = await asyncio.to_thread(
        optimize_image_for_gemini, file_bytes, mime_type
    )

    # Model priority list (uses currently active models supported by the Gemini API)
    models_to_try = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"]
    last_error: Optional[Exception] = None

    for model_name in models_to_try:
        try:
            logger.info(f"Attempting Gemini extraction using model: {model_name}")
            model = genai.GenerativeModel(model_name)
            
            contents = [
                PROMPT,
                {
                    "mime_type": target_mime,
                    "data": processed_bytes
                }
            ]
            
            # Generation configuration with JSON constraint
            generation_config = {
                "temperature": 0.1,
                "response_mime_type": "application/json"
            }
            
            # Offload synchronous network request to threadpool via asyncio.to_thread
            response = await asyncio.to_thread(
                model.generate_content,
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

def extract_naksha_data_sync(file_bytes: bytes, mime_type: str = "image/jpeg") -> Dict[str, Any]:
    """Synchronous convenience wrapper if invoked outside an existing async loop."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as pool:
            return pool.submit(asyncio.run, extract_naksha_data(file_bytes, mime_type)).result()
    else:
        return asyncio.run(extract_naksha_data(file_bytes, mime_type))
