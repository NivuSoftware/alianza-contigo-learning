from io import BytesIO
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from PIL import Image, ImageChops


NAVY = HexColor("#071D3D")
GOLD = HexColor("#C7973E")
MUTED = HexColor("#687386")


def _fit_font(text, font_name, preferred_size, max_width, minimum=15):
    size = preferred_size
    while size > minimum and stringWidth(text, font_name, size) > max_width:
        size -= 1
    return size


def _draw_logo(pdf, page_width, page_height):
    logo_path = Path(__file__).resolve().parents[1] / "assets" / "logo_cert.png"
    if not logo_path.exists() or logo_path.stat().st_size == 0:
        logo_path = Path(__file__).resolve().parents[3] / "frontend" / "src" / "assets" / "logo_cert.png"
    if logo_path.exists():
        image = Image.open(logo_path).convert("RGB")
        background = Image.new("RGB", image.size, "white")
        bounds = ImageChops.difference(image, background).getbbox()
        if bounds:
            left, top, right, bottom = bounds
            padding = 20
            image = image.crop(
                (
                    max(0, left - padding),
                    max(0, top - padding),
                    min(image.width, right + padding),
                    min(image.height, bottom + padding),
                )
            )
        logo_buffer = BytesIO()
        image.save(logo_buffer, format="PNG", optimize=True)
        logo_buffer.seek(0)
        pdf.drawImage(
            ImageReader(logo_buffer),
            page_width / 2 - 70,
            page_height - 112,
            width=140,
            height=82,
            preserveAspectRatio=True,
            mask="auto",
        )
        return
    pdf.setFillColor(NAVY)
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawCentredString(page_width / 2, page_height - 57, "ALIANZA")
    pdf.setFillColor(GOLD)
    pdf.drawCentredString(page_width / 2 + 58, page_height - 57, "CONTIGO")


def build_certificate_pdf(certificate):
    """Return a complete, static, one-page landscape certificate PDF."""
    output = BytesIO()
    page_width, page_height = landscape(A4)
    pdf = canvas.Canvas(output, pagesize=(page_width, page_height), pageCompression=1)
    pdf.setTitle(f"Certificado - {certificate['courseName']}")
    pdf.setAuthor("Alianza Contigo - Educación Continua")

    pdf.setFillColor(white)
    pdf.rect(0, 0, page_width, page_height, fill=1, stroke=0)
    pdf.setStrokeColor(GOLD)
    pdf.setLineWidth(2)
    pdf.rect(14, 14, page_width - 28, page_height - 28, fill=0, stroke=1)
    pdf.setStrokeColor(HexColor("#DCE1E8"))
    pdf.setLineWidth(0.7)
    pdf.rect(20, 20, page_width - 40, page_height - 40, fill=0, stroke=1)

    # Formal corner ornaments, kept behind all certificate content.
    pdf.setFillColor(NAVY)
    top_left = pdf.beginPath()
    top_left.moveTo(20, page_height - 20)
    top_left.lineTo(190, page_height - 20)
    top_left.lineTo(20, page_height - 145)
    top_left.close()
    pdf.drawPath(top_left, fill=1, stroke=0)
    bottom_right = pdf.beginPath()
    bottom_right.moveTo(page_width - 20, 20)
    bottom_right.lineTo(page_width - 190, 20)
    bottom_right.lineTo(page_width - 20, 145)
    bottom_right.close()
    pdf.drawPath(bottom_right, fill=1, stroke=0)
    pdf.setStrokeColor(GOLD)
    pdf.setLineWidth(5)
    pdf.line(22, page_height - 25, 180, page_height - 25)
    pdf.line(page_width - 22, 25, page_width - 180, 25)

    _draw_logo(pdf, page_width, page_height)

    # The visual center of the certificate sits below the geometric midpoint
    # because the footer data occupies the lower-left corner. Move the complete
    # text group down together while keeping the logo and footer anchored.
    content_offset_y = -90

    pdf.setFillColor(NAVY)
    pdf.setFont("Times-Roman", 39)
    pdf.drawCentredString(page_width / 2, page_height - 137 + content_offset_y, "C E R T I F I C A D O")
    pdf.setFillColor(GOLD)
    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawCentredString(page_width / 2, page_height - 161 + content_offset_y, "D E   C U L M I N A C I Ó N")
    pdf.setLineWidth(1.2)
    pdf.line(page_width / 2 - 80, page_height - 173 + content_offset_y, page_width / 2 - 12, page_height - 173 + content_offset_y)
    pdf.line(page_width / 2 + 12, page_height - 173 + content_offset_y, page_width / 2 + 80, page_height - 173 + content_offset_y)

    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 11)
    pdf.drawCentredString(page_width / 2, page_height - 211 + content_offset_y, "Se otorga el presente certificado a")

    student_name = certificate["studentName"]
    name_size = _fit_font(student_name, "Times-Italic", 33, page_width - 180, 19)
    pdf.setFillColor(NAVY)
    pdf.setFont("Times-Italic", name_size)
    pdf.drawCentredString(page_width / 2, page_height - 257 + content_offset_y, student_name)
    pdf.setStrokeColor(HexColor("#D7B774"))
    pdf.setLineWidth(0.8)
    pdf.line(180, page_height - 268 + content_offset_y, page_width - 180, page_height - 268 + content_offset_y)

    pdf.setFillColor(MUTED)
    pdf.setFont("Helvetica", 10.5)
    pdf.drawCentredString(
        page_width / 2,
        page_height - 297 + content_offset_y,
        "por haber culminado y aprobado satisfactoriamente el curso de",
    )
    course_name = certificate["courseName"].upper()
    course_size = _fit_font(course_name, "Helvetica-Bold", 18, page_width - 220, 11)
    pdf.setFillColor(NAVY)
    pdf.setFont("Helvetica-Bold", course_size)
    pdf.drawCentredString(page_width / 2, page_height - 326 + content_offset_y, course_name)

    endorsement = certificate.get("endorsement")
    if endorsement:
        pdf.setFillColor(MUTED)
        pdf.setFont("Helvetica", 9)
        pdf.drawCentredString(page_width / 2, page_height - 347 + content_offset_y, f"Con el aval de {endorsement}")

    pdf.setFillColor(HexColor("#98A3B3"))
    pdf.setFont("Helvetica", 7.5)
    pdf.drawString(62, 84, "FECHA DE CULMINACIÓN")
    pdf.setFillColor(NAVY)
    pdf.setFont("Helvetica", 10)
    pdf.drawString(62, 68, certificate["issuedAt"])
    pdf.setFillColor(HexColor("#98A3B3"))
    pdf.setFont("Helvetica", 7.5)
    pdf.drawString(62, 48, "CÓDIGO DE VERIFICACIÓN")
    pdf.setFillColor(NAVY)
    pdf.setFont("Courier", 9)
    pdf.drawString(62, 34, certificate["code"])

    pdf.showPage()
    pdf.save()
    output.seek(0)
    return output
