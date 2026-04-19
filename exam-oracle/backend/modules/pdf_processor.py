import os
import pdfplumber
import PyPDF2

# OCR imports — only used if PDF has no text
try:
    from pdf2image import convert_from_path
    import pytesseract
    # Tesseract path for Windows
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False


def extract_text_from_pdf(file_path: str) -> dict:
    """
    Extract text from any PDF:
    1. Try pdfplumber (best quality for text PDFs)
    2. Try PyPDF2 (fallback for text PDFs)
    3. Try OCR via Tesseract (for scanned/image PDFs)
    """
    if not os.path.exists(file_path):
        return {"success": False, "error": "File not found."}

    text       = ""
    page_count = 0

    # ── Method 1: pdfplumber ──────────────────────────────────────────────────
    try:
        with pdfplumber.open(file_path) as pdf:
            page_count = len(pdf.pages)
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        if text.strip() and len(text.strip()) > 50:
            return _build_result(text, page_count, method="pdfplumber")
    except Exception:
        pass

    # ── Method 2: PyPDF2 ─────────────────────────────────────────────────────
    try:
        with open(file_path, "rb") as f:
            reader     = PyPDF2.PdfReader(f)
            page_count = len(reader.pages)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        if text.strip() and len(text.strip()) > 50:
            return _build_result(text, page_count, method="pypdf2")
    except Exception:
        pass

    # ── Method 3: OCR (for scanned/image PDFs) ────────────────────────────────
    if OCR_AVAILABLE:
        try:
            ocr_text = _extract_with_ocr(file_path)
            if ocr_text and len(ocr_text.strip()) > 50:
                return _build_result(ocr_text, page_count or 1, method="ocr")
        except Exception as e:
            return {
                "success":    False,
                "error":      f"OCR failed: {str(e)}",
                "page_count": page_count,
                "word_count": 0,
                "text":       "",
                "preview":    ""
            }

    return {
        "success":    False,
        "error":      "Could not extract text. Install Tesseract OCR for scanned PDFs.",
        "page_count": page_count,
        "word_count": 0,
        "text":       "",
        "preview":    ""
    }


def _extract_with_ocr(file_path: str) -> str:
    """Convert PDF pages to images and run OCR on each page."""
    from pdf2image import convert_from_path

    # poppler_path needed on Windows
    poppler_path = None
    possible_paths = [
        r"C:\Program Files\poppler\Library\bin",
        r"C:\Program Files\poppler-xx\Library\bin",
        r"C:\poppler\bin",
        r"C:\tools\poppler\bin",
    ]
    for p in possible_paths:
        if os.path.exists(p):
            poppler_path = p
            break

    if poppler_path:
        images = convert_from_path(file_path, dpi=200, poppler_path=poppler_path)
    else:
        images = convert_from_path(file_path, dpi=200)

    text = ""
    for img in images:
        page_text = pytesseract.image_to_string(img, lang="eng")
        text += page_text + "\n"

    return text


def _build_result(text: str, page_count: int, method: str = "") -> dict:
    words      = text.split()
    word_count = len(words)
    preview    = text[:300].strip()
    return {
        "success":    True,
        "text":       text,
        "page_count": page_count,
        "word_count": word_count,
        "preview":    preview,
        "method":     method,
    }
