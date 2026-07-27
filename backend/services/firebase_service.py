import os
import datetime
import firebase_admin
from firebase_admin import credentials, firestore

_db = None


def get_db():
    """Lazily initialize Firebase so the backend still runs (with a clear
    error only when Firestore routes are actually hit) even if the service
    account file hasn't been added yet."""
    global _db
    if _db is not None:
        return _db

    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "firebase-service-account.json")
    if not os.path.exists(cred_path):
        raise RuntimeError(
            f"Firebase service account file not found at '{cred_path}'. "
            "Download it from Firebase Console > Project Settings > Service Accounts, "
            "and set FIREBASE_CREDENTIALS_PATH in backend/.env"
        )

    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)

    _db = firestore.client()
    return _db


# ---------- History ----------

def save_history_item(item: dict) -> dict:
    db = get_db()
    item["created_at"] = datetime.datetime.utcnow().isoformat()
    doc_ref = db.collection("history").document()
    doc_ref.set(item)
    item["id"] = doc_ref.id
    return item


def get_history(user_id: str = "guest", limit: int = 50) -> list:
    db = get_db()
    docs = (
        db.collection("history")
        .where("user_id", "==", user_id)
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .limit(limit)
        .stream()
    )
    results = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        results.append(d)
    return results


def delete_history_item(item_id: str):
    db = get_db()
    db.collection("history").document(item_id).delete()


# ---------- Templates ----------

def get_templates(user_id: str = "guest") -> list:
    db = get_db()
    docs = db.collection("templates").stream()
    results = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        # Show default templates (no user_id / is_default) to everyone,
        # plus this user's own custom templates
        if d.get("is_default") or not d.get("user_id") or d.get("user_id") == user_id:
            results.append(d)
    return results


def add_template(template: dict) -> dict:
    db = get_db()
    doc_ref = db.collection("templates").document()
    doc_ref.set(template)
    template["id"] = doc_ref.id
    return template


def seed_default_templates_if_empty():
    db = get_db()
    existing = list(db.collection("templates").limit(1).stream())
    if existing:
        return
    defaults = [
        ("Leave Application", "Leave", "Dear [Recipient Name],\n\nI am writing to formally request leave from [start date] to [end date] due to [reason]. I will ensure all pending work is handed over before my leave begins.\n\nThank you for your consideration.\n\nSincerely,\n[Your Name]"),
        ("Internship Application", "Career", "Dear [Recipient Name],\n\nI am writing to express my interest in the [Role] internship at [Organization]. I am currently pursuing [Degree] and believe my skills in [Skills] make me a strong fit for this role.\n\nI have attached my resume for your review and would welcome the opportunity to discuss further.\n\nBest regards,\n[Your Name]"),
        ("Job Application", "Career", "Dear [Recipient Name],\n\nI am excited to apply for the [Position] role at [Organization]. With experience in [Experience], I am confident I can contribute meaningfully to your team.\n\nPlease find my resume attached for your consideration.\n\nSincerely,\n[Your Name]"),
        ("Complaint", "Support", "Dear [Recipient Name],\n\nI am writing to bring to your attention an issue regarding [issue]. This has caused [impact], and I would appreciate a prompt resolution.\n\nThank you for looking into this matter.\n\nRegards,\n[Your Name]"),
        ("Follow-up", "General", "Dear [Recipient Name],\n\nI hope this email finds you well. I wanted to follow up regarding [topic] discussed on [date]. Please let me know if there are any updates.\n\nThank you for your time.\n\nBest regards,\n[Your Name]"),
        ("Scholarship Application", "Academic", "Dear [Recipient Name],\n\nI am writing to apply for the [Scholarship Name]. I believe my academic record and [achievements] align well with the scholarship's criteria.\n\nThank you for considering my application.\n\nSincerely,\n[Your Name]"),
        ("Recommendation Letter Request", "Academic", "Dear [Recipient Name],\n\nI hope you are doing well. I am applying to [Program/Organization] and would be grateful if you could write a recommendation letter on my behalf.\n\nPlease let me know if you need any information from me to assist.\n\nThank you very much,\n[Your Name]"),
        ("Meeting Request", "General", "Dear [Recipient Name],\n\nI would like to schedule a meeting to discuss [topic]. Please let me know your availability during [timeframe] so we can find a suitable time.\n\nLooking forward to your response.\n\nBest regards,\n[Your Name]"),
    ]
    for title, category, content in defaults:
        db.collection("templates").document().set(
            {"title": title, "category": category, "content": content, "is_default": True}
        )
# ---------- Inbox Summary History ----------

def save_summary_item(item: dict) -> dict:
    db = get_db()
    item["created_at"] = datetime.datetime.utcnow().isoformat()
    doc_ref = db.collection("summaries").document()
    doc_ref.set(item)
    item["id"] = doc_ref.id
    return item


def get_summaries(user_id: str = "guest", limit: int = 50) -> list:
    db = get_db()
    docs = (
        db.collection("summaries")
        .where("user_id", "==", user_id)
        .order_by("created_at", direction=firestore.Query.DESCENDING)
        .limit(limit)
        .stream()
    )
    results = []
    for doc in docs:
        d = doc.to_dict()
        d["id"] = doc.id
        results.append(d)
    return results


def delete_summary_item(item_id: str):
    db = get_db()
    db.collection("summaries").document(item_id).delete()

# ---------- Account Deletion ----------

def delete_user_data(user_id: str):
    db = get_db()
    for collection_name in ["history", "summaries", "templates"]:
        docs = db.collection(collection_name).where("user_id", "==", user_id).stream()
        for doc in docs:
            doc.reference.delete()
