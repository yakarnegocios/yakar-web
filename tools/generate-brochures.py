"""Build YAKAR's commercial PDFs. Run with --output DIRECTORY."""
import argparse
from io import BytesIO
from pathlib import Path
from xml.sax.saxutils import escape

from PIL import Image
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[1]
FONTS = Path("/usr/share/fonts/truetype/noto")
NAVY, INK, MUTED, PALE, RULE = map(HexColor, ["#1B3A6B", "#152942", "#405672", "#F0F5FA", "#CAD8E6"])
WEB = "https://yakarnegocios.github.io/yakar-web/"
EMAIL = "negocios.yakar@gmail.com"
PHONE = "+51 973 669 004"
MAIL = "mailto:" + EMAIL + "?subject=YAKAR%20%7C%20Solicitud%20de%20cotizaci%C3%B3n"
WA = "https://wa.me/51973669004"
FAMILIES = [
    ("Señalización y visibilidad", "senalizacion-visibilidad", [
        ("Señales y placas con braille", "Indica mensaje, dimensiones, material, ambiente de uso y quién revisará el diseño."),
        ("Cintas y láminas retrorreflectivas", "Indica tipo de superficie, ancho, color, referencia y unidad de compra."),
        ("Delineadores, tachas y tachones", "Indica medidas, cantidades, superficie y si necesitas base, adhesivo o lastre."),
    ], "Compara medidas, material, accesorios incluidos y concordancia con el plano o la muestra."),
    ("Uniformes y textil industrial", "textil-industrial", [
        ("Prendas de trabajo y uniformes", "Indica prenda, cantidades por talla, tela y color."),
        ("Prendas personalizadas", "Adjunta diseño, técnica y ubicación del logo. Indica si se requiere muestra."),
        ("Artículos textiles a medida", "Comparte uso, medidas, material, diseño y cantidad."),
    ], "Acuerda quién aprueba la muestra y desde cuándo corre el plazo. Revisa las cantidades por talla."),
    ("Herramientas y suministros", "ferreteria-industrial", [
        ("Herramientas manuales y eléctricas", "Comparte código, modelo y qué debe incluir el kit: batería, cargador o accesorios."),
        ("Repuestos, fijaciones y componentes", "Indica código, dimensiones, material, unidad de compra y equipo compatible."),
        ("Consumibles", "Indica presentación, uso, cantidad y referencia o ficha."),
    ], "Compara código, unidad de venta y alcance del kit. Valida los equivalentes con el área usuaria."),
    ("Equipamiento industrial", "equipamiento-industrial", [
        ("Grupos electrógenos", "Indica aplicación, potencia y tensión requeridas, ubicación y altitud."),
        ("Hidrolavadoras", "Indica uso, frecuencia, alimentación y presión o caudal si ya fueron definidos."),
        ("Otros equipos industriales", "Comparte modelo o función requerida, condiciones del lugar, cantidad y destino."),
    ], "Compara capacidad declarada, accesorios, garantía y condiciones de acceso y descarga."),
    ("Seguridad y protección", "seguridad-industrial", [
        ("Equipos de protección personal", "Indica modelo, tallas, cantidades y documentación que exige tu operación."),
        ("Protección contra caídas", "Comparte la especificación aprobada por el responsable de seguridad."),
        ("Protección para operación y vehículos", "Identifica la referencia de linternas, cuñas, pértigas o bloqueador solar y cantidades."),
    ], "Confirma que la documentación corresponda al modelo y que Seguridad valide las alternativas."),
    ("Izaje y sujeción", "izaje-sujecion", [
        ("Eslingas y grilletes", "Comparte tipo, dimensiones, referencia, capacidad requerida y cantidades."),
        ("Tecles", "Indica tipo, capacidad y altura de elevación definidas por tu equipo."),
        ("Accesorios", "Identifica especificación y documentación que se cotejará al recibir."),
    ], "Asegura que la referencia y la documentación coincidan. Tu responsable técnico valida equivalentes."),
]
SHORT = [
    "Señales, cintas, tachas, delineadores y placas con braille.",
    "Prendas de trabajo y artículos textiles personalizados.",
    "Herramientas, repuestos, fijaciones y consumibles.",
    "Grupos electrógenos, hidrolavadoras y otros equipos bajo evaluación.",
    "EPP y productos para protección de personas y vehículos.",
    "Eslingas, grilletes, tecles y accesorios para cargas.",
]
METHOD = [
    ("Entendemos", "Precisamos el producto, el uso y los datos pendientes."),
    ("Proponemos", "Identificamos la referencia ofrecida, el precio, el plazo y las diferencias."),
    ("Acordamos", "Dejamos por escrito las condiciones y cómo se verificará la entrega."),
    ("Coordinamos", "Damos seguimiento al pedido según las condiciones acordadas."),
    ("Respondemos", "Revisamos la conformidad y atendemos observaciones."),
]


class Page:
    def __init__(self, target, size, title, logo):
        self.c = canvas.Canvas(str(target), pagesize=size, pageCompression=1, invariant=1)
        self.c.setTitle(f"YAKAR | {title}")
        self.c.setAuthor("Yakar Negocios E.I.R.L.")
        self.w, self.h = size
        self.m = 26 if self.w < 400 else 48
        self.body = self.w - 2 * self.m
        self.logo_image = logo

    def block(self, text, x, y, width, size=11, bold=False, color=INK):
        style = ParagraphStyle("Text", fontName="YBold" if bold else "YRegular",
                               fontSize=size, leading=size * 1.34, textColor=color)
        line = Paragraph(escape(text), style)
        _, height = line.wrap(width, self.h)
        assert y + height < self.h - 13, (text, y, height)
        line.drawOn(self.c, x, self.h - y - height)
        return y + height

    def box(self, x, y, w, h, color=PALE):
        self.c.setFillColor(color)
        self.c.roundRect(x, self.h-y-h, w, h, 9, fill=1, stroke=0)

    def link(self, label, url, x, y, width, button=False):
        if button:
            self.box(x, y, width, 34, NAVY)
            self.block(label, x+10, y+9, width-20, 10, True, white)
            h = 34
        else:
            h = self.block(label, x, y, width, 9.5, True, NAVY) - y
        self.c.linkURL(url, (x, self.h-y-h, x+width, self.h-y), relative=0)

    def header(self, label):
        img_w, img_h = self.logo_image.getSize()
        width = 137
        self.c.drawImage(self.logo_image, self.m, self.h-24-width*img_h/img_w,
                         width, width*img_h/img_w)
        self.block(label, self.m, 84, self.body, 9, True, NAVY)

    def rule(self, y):
        self.c.setStrokeColor(RULE)
        self.c.line(self.m, self.h-y, self.w-self.m, self.h-y)

    def footer(self, version, number):
        self.rule(self.h-58)
        self.block("Yakar Negocios E.I.R.L. · RUC 20612733261 · Perú", self.m, self.h-46, self.body, 8, False, MUTED)
        self.block(f"{version}  /  {number}", self.m, self.h-30, self.body, 8, False, MUTED)

    def contact(self, y):
        self.link("Enviar lista o ficha por correo", MAIL, self.m, y, min(228, self.body), True)
        self.link(f"WhatsApp {PHONE}", WA, self.m, y+44, self.body)
        self.link(EMAIL, MAIL, self.m, y+62, self.body)


def heading(p, text, y=109, size=30):
    return p.block(text, p.m, y, p.body, size, True, NAVY)


def brochure(out, logo, mobile=False):
    name = "yakar-brochure-movil.pdf" if mobile else "yakar-brochure-a4.pdf"
    p = Page(out/name, (366, 1050) if mobile else A4, "Brochure de abastecimiento", logo)
    p.header("PRODUCTOS BAJO PEDIDO · PERÚ")
    y = heading(p, "Abastecimiento para minería e industria", size=25 if mobile else 32)
    y = p.block("Suministramos productos industriales bajo pedido para mineras, contratistas y operaciones industriales.", p.m, y+10, p.body, 12) + 20
    y = p.block("Comparte tu lista o ficha, cantidad, destino y fecha requerida.", p.m, y, p.body, 10.5, True) + 17
    cols = 1 if mobile else 2
    w = (p.body-12*(cols-1))/cols
    row_h = 78 if mobile else 104
    for i, ((title, slug, _, _), note) in enumerate(zip(FAMILIES, SHORT)):
        x, top = p.m+(i % cols)*(w+12), y+(i//cols)*row_h
        p.box(x, top, w, row_h-8)
        h = p.block(title, x+12, top+8, w-24, 11.5, True, NAVY)
        h = p.block(note, x+12, h+3, w-24, 9.1)
        p.link("Ver guía", WEB+slug+".html", x+12, h+3, w-24)
        assert h+16 < top+row_h-7
    y += ((len(FAMILIES)+cols-1)//cols)*row_h+9
    if mobile:
        y = p.block("Qué puedes evaluar antes de comprar", p.m, y, p.body, 14, True, NAVY) + 8
        y = p.block("Referencia, precio, plazo, destino y lo incluido. La disponibilidad y las condiciones se confirman para cada pedido.", p.m, y, p.body, 10.4) + 13
        p.contact(y)
        p.footer("BC-01 · v2.4", "1 de 1")
    else:
        y = p.block("Una cotización que se puede comparar", p.m, y, p.body, 17, True, NAVY)
        p.block("Dejamos por escrito el producto ofrecido, el precio, el plazo propuesto, las condiciones de entrega y la documentación aplicable.", p.m, y+7, p.body, 10.7)
        p.contact(683)
        p.footer("BC-01 · v2.4", "1 de 2")
        p.c.showPage()
        p.header("CÓMO ATENDEMOS TU PEDIDO")
        y = heading(p, "De la consulta a la conformidad", size=29) + 14
        for title, note in METHOD:
            y = p.block(title, p.m, y, p.body, 11, True, NAVY)
            y = p.block(note, p.m, y+3, p.body, 10.2) + 13
        p.rule(y)
        y = heading(p, "Qué revisar antes de aprobar", y+18, 18) + 10
        for title, note in [
            ("Área usuaria · Especificación", "Compara lo pedido con la referencia ofrecida y valida las diferencias."),
            ("Compras · Costo y plazo", "Compara el costo total en el mismo destino y qué condición activa el plazo."),
            ("Logística · Recepción", "Confirma dónde, quién recibe y qué documentos y cantidades se cotejarán."),
        ]:
            y = p.block(title, p.m, y, p.body, 10.7, True, NAVY)
            y = p.block(note, p.m, y+3, p.body, 10.2) + 13
        p.link("Ver cómo se presenta una cotización", WEB+"metodo.html#proponemos", p.m, y+2, p.body)
        top = y+26
        p.box(p.m, top, p.body, 66)
        p.block("Ejemplo ficticio · compara el mismo destino", p.m+12, top+8, p.body-24, 10.3, True, NAVY)
        bottom = p.block("Oferta A: S/ 1 000 + S/ 180 de flete. Oferta B: S/ 1 120 con flete incluido. Al mismo destino, B cuesta S/ 60 menos. Valores ilustrativos.", p.m+12, top+27, p.body-24, 9.7)
        assert bottom < top+62 and top+66 < 674
        p.contact(681)
        p.footer("BC-01 · v2.4", "2 de 2")
    p.c.save()


def catalog(out, logo):
    p = Page(out/"yakar-catalogo-industrial.pdf", A4, "Catálogo industrial", logo)
    p.header("CATÁLOGO DE PRODUCTOS · PERÚ")
    y = heading(p, "Identifica lo que tu operación necesita", size=32)
    y = p.block("Seis líneas de productos bajo pedido para minería, contratistas e industria. Usa esta guía para precisar lo que quieres cotizar.", p.m, y+12, p.body, 12) + 26
    for i, ((title, slug, _, _), note) in enumerate(zip(FAMILIES, SHORT)):
        p.box(p.m, y, p.body, 52)
        p.link(f"{title} · Ver guía", WEB+slug+".html", p.m+12, y+8, p.body-24)
        p.block(note, p.m+12, y+25, p.body-24, 10)
        y += 60
    p.block("La referencia, disponibilidad, documentación y plazo se confirman para cada requerimiento.", p.m, 651, p.body, 10.5)
    p.contact(690)
    p.footer("CT-01 · v0.4", "1 de 4")
    for page, start in enumerate(range(0, 6, 2), 2):
        p.c.showPage()
        p.header(["OPERACIÓN Y FLOTA", "MANTENIMIENTO Y EQUIPOS", "PROTECCIÓN Y MANEJO DE CARGAS"][page-2])
        y = 109
        for title, slug, items, check in FAMILIES[start:start+2]:
            y = heading(p, title, y, 23) + 12
            for item, note in items:
                y = p.block(item, p.m, y, p.body, 10.8, True, NAVY)
                y = p.block(note, p.m, y+3, p.body, 10.4) + 11
            y = p.block("Antes de aprobar", p.m, y+3, p.body, 10.2, True, NAVY)
            y = p.block(check, p.m, y+3, p.body, 10.2) + 8
            p.link("Consultar esta línea", WEB+"?linea="+slug+"#request-start", p.m, y, p.body)
            y += 28
            p.rule(y)
            y += 15
        assert y < 684, (page, y)
        p.contact(689)
        p.footer("CT-01 · v0.4", f"{page} de 4")
    p.c.save()


def letter(out, logo):
    p = Page(out/"yakar-carta-presentacion-v1-3.pdf", A4, "Carta de presentación", logo)
    p.header("PRESENTACIÓN INSTITUCIONAL")
    y = heading(p, "Abastecimiento de productos\npara minería e industria", size=29) + 21
    y = p.block("A la atención del área de Compras y Abastecimiento:", p.m, y, p.body, 11.5, True) + 15
    paragraphs = [
        "Somos Yakar Negocios E.I.R.L. Suministramos productos industriales bajo pedido para empresas mineras, contratistas y operaciones industriales en el Perú.",
        "Atendemos requerimientos en seis líneas: señalización y visibilidad, uniformes, herramientas y suministros, equipamiento industrial, seguridad e izaje.",
        "Cuando podemos atender una compra, la cotización identifica el producto ofrecido, el precio, el plazo propuesto y las condiciones de entrega. También indica la documentación aplicable y las diferencias que su equipo deba validar.",
        "Si tienen un requerimiento en evaluación, pueden enviarnos la lista o ficha, las cantidades, el destino y la fecha requerida. Si todavía falta definir algún dato, indíquennos qué debe resolver la compra.",
    ]
    for para in paragraphs:
        y = p.block(para, p.m, y, p.body, 11.4) + 16
    y = p.block("Atentamente,", p.m, y+6, p.body, 11.4) + 13
    y = p.block("Ernesto Malásquez Arévalo", p.m, y, p.body, 12, True, NAVY)
    y = p.block("Gerente de Operaciones · YAKAR", p.m, y+3, p.body, 10.7) + 17
    p.contact(y)
    p.link("Portafolio de productos", WEB, p.m, y+80, p.body)
    p.footer("CP-INST · v1.3", "1 de 1")
    p.c.save()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--letter", action="store_true", help="Also build the letter for the private system.")
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    for name, weight in [("YRegular", "Regular"), ("YBold", "Bold")]:
        pdfmetrics.registerFont(TTFont(name, str(FONTS/f"NotoSans-{weight}.ttf")))
    with Image.open(ROOT/"assets/yakar-logo-web-540.webp") as image:
        logo = image.convert("RGBA")
        flat = Image.new("RGB", logo.size, "white")
        flat.paste(logo, mask=logo.getchannel("A"))
        content = BytesIO()
        flat.save(content, format="JPEG", quality=93, optimize=True)
    logo_ref = ImageReader(content)
    brochure(args.output, logo_ref)
    brochure(args.output, logo_ref, mobile=True)
    catalog(args.output, logo_ref)
    if args.letter:
        letter(args.output, logo_ref)


if __name__ == "__main__":
    main()
