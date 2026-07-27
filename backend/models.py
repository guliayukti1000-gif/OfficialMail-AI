from pydantic import BaseModel
from typing import Optional, List


class GenerateEmailRequest(BaseModel):
    purpose: str
    recipient_name: str
    recipient_designation: Optional[str] = ""
    organization: Optional[str] = ""
    key_points: str
    tone: str = "Formal"
    language: str = "English"
    length: str = "Medium"
    user_id: Optional[str] = "guest"


class GeneratedEmail(BaseModel):
    subject: str
    greeting: str
    body: str
    closing: str
    signature: str


class AIEditRequest(BaseModel):
    action: str  # make_formal | make_friendly | expand | shorten | improve_grammar | rewrite | suggest_subject | translate
    text: str
    target_language: Optional[str] = None  # for translate: "Hindi" or "English"


class AIEditResponse(BaseModel):
    result: str


class InboxSummaryRequest(BaseModel):
    email_text: str


class InboxSummaryResponse(BaseModel):
    summary: str
    important_dates: List[str] = []
    important_people: List[str] = []
    deadlines: List[str] = []
    action_items: List[str] = []
    priority: str = "Medium"

class SpamScoreRequest(BaseModel):
    email_text: str


class SpamScoreResponse(BaseModel):
    spam_score: int
    risk_level: str
    reasons: List[str] = []
    suggestions: List[str] = []

class GenerateRepliesRequest(BaseModel):
    email_text: str


class ReplyDraft(BaseModel):
    tone: str
    reply: str


class GenerateRepliesResponse(BaseModel):
    replies: List[ReplyDraft]


class TemplateModel(BaseModel):
    id: Optional[str] = None
    title: str
    category: str
    content: str


class HistoryItem(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = "guest"
    subject: str
    body: str
    purpose: Optional[str] = ""
    created_at: Optional[str] = None


class ExportRequest(BaseModel):
    subject: str
    body: str
    format: str = "pdf"  # pdf | docx

class BulkGenerateEmailRequest(BaseModel):
    requests: list[GenerateEmailRequest]