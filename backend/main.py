import os
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

_ENV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
load_dotenv(dotenv_path=_ENV_PATH)

from pydantic import BaseModel
from email_service import send_bulk_emails

from models import (
    GenerateEmailRequest, AIEditRequest, AIEditResponse,
    InboxSummaryRequest, InboxSummaryResponse,
    TemplateModel, HistoryItem, ExportRequest,
    BulkGenerateEmailRequest,
)
from services import gemini_service, firebase_service, export_service

app = FastAPI(title="OfficialMail AI API", version="1.0.0")

origins = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "ok", "service": "OfficialMail AI backend"}


@app.get("/api/health")
def health():
    return {"gemini_configured": bool(os.getenv("GEMINI_API_KEY"))}


@app.post("/api/generate-email")
def generate_email(payload: GenerateEmailRequest):
    try:
        result = gemini_service.generate_email(payload.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/generate-email-bulk")
def generate_email_bulk(payload: BulkGenerateEmailRequest):
    results = []
    for req in payload.requests:
        try:
            result = gemini_service.generate_email(req.model_dump())
            results.append({"success": True, "data": result})
        except Exception as e:
            results.append({"success": False, "error": str(e)})
    return {"results": results}
class SendBulkEmailRequest(BaseModel):
    emails: list[dict] # [{ "to": str, "subject": str, "body": str }, ...]
    
@app.post("/api/send-bulk-email")
def send_bulk_email(payload: SendBulkEmailRequest):
    results = send_bulk_emails(payload.emails)
    return {"results": results}

@app.post("/api/ai/process", response_model=AIEditResponse)
def ai_process(payload: AIEditRequest):
    try:
        result = gemini_service.ai_edit(payload.action, payload.text, payload.target_language)
        return AIEditResponse(result=result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/summarize-inbox", response_model=InboxSummaryResponse)
def summarize_inbox(payload: InboxSummaryRequest):
    try:
        result = gemini_service.summarize_inbox(payload.email_text)
        return InboxSummaryResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SpamScoreRequest(BaseModel):
    email_text: str


@app.post("/api/spam-score")
def spam_score(payload: SpamScoreRequest):
    try:
        result = gemini_service.analyze_spam_score(payload.email_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/templates")
def list_templates():
    try:
        firebase_service.seed_default_templates_if_empty()
        return firebase_service.get_templates()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/templates")
def create_template(template: TemplateModel):
    try:
        return firebase_service.add_template(template.model_dump(exclude={"id"}))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/history")
def list_history(user_id: str = "guest"):
    try:
        return firebase_service.get_history(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/history")
def create_history(item: HistoryItem):
    try:
        return firebase_service.save_history_item(item.model_dump(exclude={"id", "created_at"}))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/history/{item_id}")
def delete_history(item_id: str):
    try:
        firebase_service.delete_history_item(item_id)
        return {"deleted": item_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/export")
def export_email(payload: ExportRequest):
    try:
        if payload.format == "pdf":
            data = export_service.build_pdf(payload.subject, payload.body)
            return Response(
                content=data, media_type="application/pdf",
                headers={"Content-Disposition": f'attachment; filename="{payload.subject[:40] or "email"}.pdf"'},
            )
        elif payload.format == "docx":
            data = export_service.build_docx(payload.subject, payload.body)
            return Response(
                content=data,
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={"Content-Disposition": f'attachment; filename="{payload.subject[:40] or "email"}.docx"'},
            )
        else:
            raise HTTPException(status_code=400, detail="format must be 'pdf' or 'docx'")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))