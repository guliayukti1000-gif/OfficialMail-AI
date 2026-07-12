import os
import json
import re
import google.generativeai as genai

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-flash-latest"


def _get_model():
    if not GEMINI_API_KEY:
        raise RuntimeError(
            "GEMINI_API_KEY is not set. Add it to backend/.env"
        )
    return genai.GenerativeModel(MODEL_NAME)


def _clean_json(text: str) -> str:
    """Strip markdown code fences Gemini sometimes wraps JSON in."""
    text = text.strip()
    text = re.sub(r"^```(json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    return text


def generate_email(data: dict) -> dict:
    model = _get_model()
    prompt = f"""You are OfficialMail AI, an expert professional email writer.

Write a {data['tone']} email in {data['language']} for the following context:

Purpose: {data['purpose']}
Recipient Name: {data['recipient_name']}
Recipient Designation: {data.get('recipient_designation') or 'N/A'}
Organization: {data.get('organization') or 'N/A'}
Key Points to include: {data['key_points']}
Desired Length: {data['length']} (Short = 3-4 sentences, Medium = 1-2 short paragraphs, Long = 3+ paragraphs)

Only formal, professional, respectful language is acceptable. Never use slang, emojis, or casual phrasing, regardless of the requested tone (tone only affects warmth, not professionalism).

Return ONLY valid JSON, no markdown fences, no extra commentary, in exactly this shape:
{{
  "subject": "...",
  "greeting": "...",
  "body": "...",
  "closing": "...",
  "signature": "..."
}}
"""
    response = model.generate_content(prompt)
    raw = _clean_json(response.text)
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        parsed = {
            "subject": "Untitled",
            "greeting": f"Dear {data['recipient_name']},",
            "body": raw,
            "closing": "Best regards,",
            "signature": "",
        }
    return parsed


AI_EDIT_INSTRUCTIONS = {
    "make_formal": "Rewrite the following email text to sound more formal and professional, keeping the same meaning and length roughly the same.",
    "make_friendly": "Rewrite the following email text to sound warmer and friendlier while remaining professional (never casual/slang).",
    "expand": "Expand the following email text with more relevant detail and professional elaboration, roughly doubling its length.",
    "shorten": "Shorten the following email text to be more concise while keeping all key information, roughly halving its length.",
    "improve_grammar": "Correct all grammar, spelling, and punctuation errors in the following email text without changing its meaning or tone.",
    "rewrite": "Rewrite the following email text with different phrasing while preserving its exact meaning and professional tone.",
    "suggest_subject": "Suggest one short, professional email subject line (under 10 words) that best fits the following email body. Return only the subject line text, nothing else.",
}


def ai_edit(action: str, text: str, target_language: str = None) -> str:
    model = _get_model()

    if action == "translate":
        target = target_language or "Hindi"
        prompt = f"Translate the following email text into {target}. Preserve professional tone and formatting. Return only the translated text, nothing else.\n\nText:\n{text}"
    else:
        instruction = AI_EDIT_INSTRUCTIONS.get(action)
        if not instruction:
            raise ValueError(f"Unknown action: {action}")
        prompt = f"{instruction}\n\nText:\n{text}\n\nReturn only the resulting text, nothing else — no preamble, no quotes."

    response = model.generate_content(prompt)
    return response.text.strip()


def summarize_inbox(email_text: str) -> dict:
    model = _get_model()
    prompt = f"""Analyze the following email and extract structured information.

Email:
{email_text}

Return ONLY valid JSON, no markdown fences, in exactly this shape:
{{
  "summary": "2-3 sentence summary",
  "important_dates": ["..."],
  "important_people": ["..."],
  "deadlines": ["..."],
  "action_items": ["..."],
  "priority": "High" | "Medium" | "Low"
}}
If a field has no items, return an empty array. Priority should reflect urgency and importance of the email.
"""
    response = model.generate_content(prompt)
    raw = _clean_json(response.text)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "summary": raw,
            "important_dates": [],
            "important_people": [],
            "deadlines": [],
            "action_items": [],
            "priority": "Medium",
        }
