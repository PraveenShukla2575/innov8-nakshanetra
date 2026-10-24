import json
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("nakshanetra.rule_engine")

OPERATORS = {
    ">=": lambda val, threshold: val >= threshold,
    "<=": lambda val, threshold: val <= threshold,
    ">": lambda val, threshold: val > threshold,
    "<": lambda val, threshold: val < threshold,
    "==": lambda val, threshold: val == threshold,
    "!=": lambda val, threshold: val != threshold,
}

PARAMETER_DESCRIPTIONS = {
    "rear_setback_meters": "Rear Setback Buffer",
    "ground_coverage_percent": "Maximum Ground Coverage",
    "building_height": "Maximum Permissible Height",
    "front_setback_meters": "Front Setback Buffer",
}

def evaluate_single_rule(rule_obj: Any, extracted_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates an architectural bye-law rule against extracted Naksha metrics.
    Works directly with SQLAlchemy Rule models:
      - rule_code: str (e.g. 'BL-001')
      - parameter: str (e.g. 'rear_setback_meters')
      - operator: str (e.g. '>=')
      - required_value: float (e.g. 3.0)
    """
    rule_id = getattr(rule_obj, "id", None) or (rule_obj.get("id") if isinstance(rule_obj, dict) else None)
    rule_code = getattr(rule_obj, "rule_code", None) or (rule_obj.get("rule_code") if isinstance(rule_obj, dict) else "BL-RULE")
    parameter = getattr(rule_obj, "parameter", None) or (rule_obj.get("parameter") if isinstance(rule_obj, dict) else None)
    operator_str = getattr(rule_obj, "operator", ">=") or (rule_obj.get("operator", ">=") if isinstance(rule_obj, dict) else ">=")
    required_value = getattr(rule_obj, "required_value", None)
    if required_value is None and isinstance(rule_obj, dict):
        required_value = rule_obj.get("required_value")

    # If parameter wasn't directly found, check if parameters dict was passed
    if not parameter:
        params_dict = getattr(rule_obj, "parameters", {}) or (rule_obj.get("parameters", {}) if isinstance(rule_obj, dict) else {})
        if isinstance(params_dict, str):
            try:
                params_dict = json.loads(params_dict)
            except Exception:
                params_dict = {}
        operator_str = params_dict.get("operator", operator_str)
        metric_keys = [k for k in params_dict.keys() if k != "operator"]
        if metric_keys:
            parameter = metric_keys[0]
            required_value = params_dict[parameter]

    param_name = parameter or "unknown_metric"
    friendly_name = PARAMETER_DESCRIPTIONS.get(param_name, param_name.replace("_", " ").title())
    unit = "%" if "percent" in param_name else ("m" if "meters" in param_name else "")

    if parameter is None or required_value is None:
        return {
            "rule_id": rule_id,
            "rule_code": rule_code,
            "parameter": param_name,
            "title": friendly_name,
            "expected": "N/A",
            "actual": "N/A",
            "passed": True,
            "status": "PASSED",
            "details": "General advisory bye-law with no numeric constraint."
        }

    actual_value = extracted_data.get(parameter)

    if actual_value is None:
        return {
            "rule_id": rule_id,
            "rule_code": rule_code,
            "parameter": parameter,
            "title": friendly_name,
            "expected": f"{operator_str} {required_value}{unit}",
            "actual": "Not Found",
            "passed": False,
            "status": "MISSING_DATA",
            "penalty_score": 15.0,
            "details": f"Parameter '{friendly_name}' could not be identified or extracted from the plan drawing."
        }

    try:
        val_float = float(actual_value)
        thresh_float = float(required_value)
        comp_func = OPERATORS.get(operator_str, lambda v, t: False)
        is_compliant = comp_func(val_float, thresh_float)

        actual_formatted = f"{val_float}{unit}"
        expected_formatted = f"{operator_str} {thresh_float}{unit}"

        if is_compliant:
            return {
                "rule_id": rule_id,
                "rule_code": rule_code,
                "parameter": parameter,
                "title": friendly_name,
                "expected": expected_formatted,
                "actual": actual_formatted,
                "passed": True,
                "status": "PASSED",
                "penalty_score": 0.0,
                "details": f"Compliant: Actual {actual_formatted} satisfies municipal requirement ({expected_formatted})."
            }
        else:
            return {
                "rule_id": rule_id,
                "rule_code": rule_code,
                "parameter": parameter,
                "title": friendly_name,
                "expected": expected_formatted,
                "actual": actual_formatted,
                "passed": False,
                "status": "VIOLATION",
                "penalty_score": 25.0,
                "details": f"Violation: Actual {actual_formatted} breaches permissible limit ({expected_formatted})."
            }
    except Exception as e:
        logger.error(f"Error evaluating rule {rule_code}: {e}")
        return {
            "rule_id": rule_id,
            "rule_code": rule_code,
            "parameter": parameter,
            "title": friendly_name,
            "expected": str(required_value),
            "actual": str(actual_value),
            "passed": False,
            "status": "ERROR",
            "penalty_score": 20.0,
            "details": f"Evaluation error: {str(e)}"
        }

def evaluate_compliance(extracted_data: Dict[str, Any], db_rules: List[Any]) -> Dict[str, Any]:
    """
    Evaluates all building bye-laws against the extracted plan metrics.
    Returns:
    - overall_status: 'APPROVED', 'REJECTED', or 'PENDING_REVIEW'
    - risk_score: total penalty points (0 - 100)
    - evaluations: list of rule evaluation items
    - violations: list of specific violations (for ScrutinyReport.rule_violations)
    - summary: high-level compliance outcome
    """
    evaluations = []
    violations = []
    total_penalty = 0.0
    has_violations = False
    has_missing_data = False

    for rule in db_rules:
        eval_result = evaluate_single_rule(rule, extracted_data)
        evaluations.append(eval_result)
        
        if eval_result["status"] in ("VIOLATION", "ERROR"):
            has_violations = True
            total_penalty += eval_result.get("penalty_score", 0.0)
            violations.append(eval_result)
        elif eval_result["status"] == "MISSING_DATA":
            has_missing_data = True

    # Determine overall status
    if has_violations:
        overall_status = "REJECTED"
        summary = f"Plan rejected: {len(violations)} bye-law violation(s) detected."
    elif has_missing_data:
        overall_status = "PENDING_REVIEW"
        summary = "Plan flagged for manual review: some architectural dimensions could not be detected."
    else:
        overall_status = "APPROVED"
        summary = "All architectural dimensions strictly comply with Municipal Bye-Laws."

    return {
        "overall_status": overall_status,
        "risk_score": min(100.0, total_penalty),
        "evaluations": evaluations,
        "violations": violations,
        "extracted_data": extracted_data,
        "summary": summary
    }
