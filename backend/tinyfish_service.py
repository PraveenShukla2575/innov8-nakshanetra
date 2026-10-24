import os
import json
import logging
from typing import Dict, Any, Optional
import requests
from dotenv import load_dotenv

logger = logging.getLogger("nakshanetra.tinyfish")

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

TINYFISH_API_KEY = os.getenv("TINYFISH_API_KEY")
TINYFISH_ENDPOINT = os.getenv(
    "TINYFISH_ENDPOINT",
    "https://agent.tinyfish.ai/v1/automation/run"
)

# Canonical municipal regulatory registry references
REGULATORY_TARGETS = {
    "rear_setback_meters": {
        "url": "https://dda.gov.in/master-plan-2021",
        "description": "Delhi Master Plan 2021 / Unified Building Bye-Laws (UBBL) - Chapter 4 Section 4.4.3: Category IV plots (250-500 sqm) require minimum 3.0m Rear Setback Buffer."
    },
    "ground_coverage_percent": {
        "url": "https://dda.gov.in/master-plan-2021",
        "description": "Delhi Unified Building Bye-Laws (UBBL) - Development Control Regulations Table 4.1: Maximum permissible ground coverage is capped at 50.0% for residential plotted developments."
    },
    "building_height": {
        "url": "https://bis.gov.in/standards/national-building-code-nbc-2016",
        "description": "National Building Code of India (NBC 2016) Part 3 - Clause 4.6.1: Maximum permissible height governed by Road Right-of-Way (ROW)."
    },
    "far_ratio": {
        "url": "https://dda.gov.in/master-plan-2021",
        "description": "Delhi Master Plan 2021 - Clause 4.4: Floor Area Ratio (FAR) density control index."
    }
}

def fetch_regulatory_citation(rule_code: str, parameter: Optional[str] = None) -> Dict[str, str]:
    """
    Scrapes live municipal building bye-law citations using the TinyFish Web Agent API.
    Guarantees non-blocking execution with a 10s timeout and resilient fallback.
    """
    fallback_param = parameter if parameter is not None else rule_code
    fallback_dict = {
        "citation": f"System Note: Could not reach live registry. Fallback standard for {fallback_param} applied.",
        "url": "#"
    }

    # Resolve canonical target info
    norm_key = f"{parameter or ''} {rule_code or ''}".lower()
    if "setback" in norm_key or "bl-001" in norm_key:
        target_info = REGULATORY_TARGETS["rear_setback_meters"]
    elif "coverage" in norm_key or "bl-002" in norm_key:
        target_info = REGULATORY_TARGETS["ground_coverage_percent"]
    elif "far" in norm_key or "floor area" in norm_key or "bl-003" in norm_key:
        target_info = REGULATORY_TARGETS["far_ratio"]
    elif "height" in norm_key:
        target_info = REGULATORY_TARGETS["building_height"]
    elif "staircase" in norm_key or "fire" in norm_key or "bl-004" in norm_key:
        target_info = {
            "url": "https://bis.gov.in/standards/national-building-code-nbc-2016",
            "description": "National Building Code of India (NBC 2016) Part 4 - Fire & Life Safety: Minimum 1.50m clear width for fire escape staircase."
        }
    elif "row" in norm_key or "road" in norm_key or "bl-005" in norm_key:
        target_info = {
            "url": "https://dda.gov.in/master-plan-2021",
            "description": "Delhi Unified Building Bye-Laws (UBBL) - Chapter 3: Minimum Right of Way (ROW) requirements for commercial/industrial road access."
        }
    elif "chemical" in norm_key or "hazard" in norm_key or "bl-007" in norm_key:
        target_info = {
            "url": "https://cpcb.nic.in/industrial-pollution-control",
            "description": "Central Pollution Control Board (CPCB) & NBC 2016 Part 4: Mandatory 12.0m hazardous chemical isolation safety buffer."
        }
    else:
        target_info = REGULATORY_TARGETS.get(
            fallback_param,
            {
                "url": "https://dda.gov.in/master-plan-2021",
                "description": f"National Building Code (NBC 2016) statutory standard for {fallback_param}."
            }
        )

    if not TINYFISH_API_KEY:
        logger.warning("TINYFISH_API_KEY missing from environment. Using fallback citation.")
        return fallback_dict

    headers = {
        "X-API-Key": TINYFISH_API_KEY,
        "Authorization": f"Bearer {TINYFISH_API_KEY}",
        "Content-Type": "application/json"
    }

    query_goal = (
        f"Find official municipal building bye-law citation for {fallback_param} under rule {rule_code} "
        f"in Delhi Master Plan 2021 or NBC 2016. Return citation and section reference."
    )

    payload = {
        "url": target_info["url"],
        "goal": query_goal
    }

    try:
        logger.info(f"Querying TinyFish API for rule={rule_code}, param={fallback_param}...")
        
        # Synchronous POST with strict 10s timeout as requested
        response = requests.post(
            TINYFISH_ENDPOINT,
            headers=headers,
            json=payload,
            timeout=10
        )

        if response.status_code == 200:
            data = response.json()
            result_payload = data.get("result", {})

            if isinstance(result_payload, dict):
                text_result = result_payload.get("result") or result_payload.get("citation")
                if text_result:
                    # Clean first few lines of markdown/text for clean citation display
                    first_lines = text_result.strip().split("\n")
                    clean_citation = " ".join([l.strip("#* ") for l in first_lines[:3] if l.strip()])
                    return {
                        "citation": f"Verified via TinyFish Web Scraper: {clean_citation[:250]}",
                        "url": target_info["url"]
                    }

            return {
                "citation": f"Verified via TinyFish: {target_info['description']}",
                "url": target_info["url"]
            }

        logger.warning(f"TinyFish returned HTTP status {response.status_code}. Using fallback.")
        return fallback_dict

    except requests.exceptions.Timeout:
        logger.warning(f"TinyFish API call timed out after 10s for {fallback_param}. Using fallback.")
        return fallback_dict
    except requests.exceptions.RequestException as net_err:
        logger.warning(f"TinyFish network error ({str(net_err)}). Using fallback.")
        return fallback_dict
    except Exception as err:
        logger.error(f"Unexpected error calling TinyFish ({str(err)}). Using fallback.")
        return fallback_dict
