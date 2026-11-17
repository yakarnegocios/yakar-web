"""Generate the two public YAKAR brochures from the same six-family content."""
from pathlib import Path
from io import BytesIO
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.pagesizes import A4
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF
ROOT=Path(__file__).resolve().parents[1]
FONT=Path('/usr/share/fonts/truetype/noto')
for name,file in [('Regular','NotoSans-Regular.ttf'),('Bold','NotoSans-Bold.ttf')]:pdfmetrics.registerFont(TTFont(name,str(FONT/file)))
NAVY=HexColor('#1B3A6B');INK=HexColor('#20354F');MUTED=HexColor('#536783');PALE=HexColor('#F1F5FA');RULE=HexColor('#CBD7E5')
SITE='https://yakarnegocios.github.io/yakar-web/'
CONTACT='https://wa.me/51973669004'
with Image.open(ROOT / 'assets/yakar-logo-web-540.webp') as original:
    white_background = Image.new('RGB', original.size, 'white')
    logo_rgba = original.convert('RGBA')
    white_background.paste(logo_rgba, mask=logo_rgba.getchannel('A'))
    logo_stream = BytesIO()
    white_background.save(logo_stream, format='JPEG', quality=93, optimize=True)
    logo_stream.seek(0)
    PDF_LOGO = ImageReader(logo_stream)

REQUEST = SITE + '#request-start'
EMAIL = 'mailto:negocios.yakar@gmail.com'
FAMILIES = [
    ('Señalización y visibilidad', 'Señales, cintas, láminas, tachas y placas. Indica uso, medidas y referencia o plano.', 'senalizacion-visibilidad.html'),
    ('Uniformes y textil industrial', 'Ropa de trabajo y prendas personalizadas. Indica tallas, tela y si requiere muestra.', 'textil-industrial.html'),
    ('Herramientas y suministros', 'Herramientas, repuestos y consumibles. Indica modelo, presentación o compatibilidad.', 'ferreteria-industrial.html'),
    ('Equipamiento industrial', 'Grupos electrógenos y otros equipos bajo evaluación. Indica aplicación y condiciones de operación.', 'equipamiento-industrial.html'),
    ('Seguridad y protección', 'EPP y protección para personas y vehículos. Comparte la referencia y documentación que exige tu operación.', 'seguridad-industrial.html'),
    ('Izaje y sujeción', 'Eslingas, grilletes y accesorios. Comparte la especificación validada, cantidades y documentación requerida.', 'izaje-sujecion.html'),
]
CHECKS = [
    ('Área usuaria', 'Especificación', 'Compara lo solicitado con lo ofrecido. Identifica diferencias y quién debe aprobarlas.'),
    ('Compras', 'Costo y plazo', 'Compara el costo total, lo incluido y el punto que activa el plazo. Confirma qué queda fuera.'),
    ('Logística o Almacén', 'Recepción', 'Confirma el punto de entrega y qué documentación, cantidad y estado se revisarán al recibir.'),
]


class Layout:
    def __init__(self, path, size):
        self.w, self.h = size
        self.c = canvas.Canvas(str(path), pagesize=size, pageCompression=1, invariant=1)
        self.c.setTitle('YAKAR | Portafolio y guía de compra industrial')
        self.c.setAuthor('Yakar Negocios E.I.R.L.')
        self.c.setSubject('Líneas de abastecimiento y criterios para preparar y comparar una compra B2B')

    def txt(self, text, x, y, width, size=11, color=INK, bold=False):
        style = ParagraphStyle('p', fontName='Bold' if bold else 'Regular',
                               fontSize=size, leading=size * 1.35, textColor=color)
        paragraph = Paragraph(text, style)
        _, height = paragraph.wrap(width, self.h)
        assert y + height < self.h - 18, (text, y, height)
        paragraph.drawOn(self.c, x, self.h - y - height)
        return height

    def box(self, x, y, width, height, color=PALE):
        self.c.setFillColor(color)
        self.c.rect(x, self.h - y - height, width, height, stroke=0, fill=1)

    def logo(self, x, y, width=170):
        iw, ih = PDF_LOGO.getSize()
        self.c.drawImage(PDF_LOGO, x, self.h - y - width * ih / iw, width, width * ih / iw, mask='auto')

    def annotation(self, url, x, y, width, height):
        self.c.linkURL(url, (x, self.h - y - height, x + width, self.h - y), relative=0)

    def link(self, title, x, y, w=210, url=CONTACT):
        self.box(x, y, w, 38, NAVY)
        height = self.txt(title, x + 12, y + 10, w - 24, 11, white, True)
        assert height <= 18, title
        self.annotation(url, x, y, w, 38)

    def footer(self, page, code=None):
        self.box(32, self.h - 46, self.w - 64, 0.6, RULE)
        self.txt('Yakar Negocios E.I.R.L. · RUC 20612733261 · Perú', 32, self.h - 35, self.w - (145 if code else 100), 8, MUTED)
        if code:
            self.txt(f'{code} · {page}', self.w - 117, self.h - 35, 89, 8, MUTED)
        else:
            self.txt(page, self.w - 67, self.h - 35, 40, 8, MUTED)

    def card(self, i, x, y, w, h):
        title, body, page = FAMILIES[i]
        self.box(x, y, w, h)
        self.box(x, y, 3, h, NAVY)
        title_height = self.txt(title, x + 14, y + 12, w - 28, 12, NAVY, True)
        body_y = y + 17 + title_height
        body_height = self.txt(body, x + 14, body_y, w - 28, 10)
        assert body_y + body_height < y + h - 24, (title, body_y, body_height, y, h)
        self.txt('Ver guía de compra', x + 14, y + h - 22, w - 28, 8.5, NAVY, True)
        self.annotation(SITE + page, x, y, w, h)

    def qr(self, x, y, size=62, url=REQUEST):
        code = QrCodeWidget(url)
        left, bottom, right, top = code.getBounds()
        drawing = Drawing(size, size, transform=[size / (right - left), 0, 0, size / (top - bottom), 0, 0])
        drawing.add(code)
        renderPDF.draw(drawing, self.c, x, self.h - y - size)


def a4():
    layout = Layout(ROOT / 'documentos/yakar-brochure-a4.pdf', A4)
    width = layout.w - 64
    layout.logo(32, 27)
    layout.txt('PORTAFOLIO Y GUÍA DE COMPRA', 32, 93, width, 9.5, NAVY, True)
    layout.txt('Abastecimiento para<br/>minería e industria', 32, 112, width, 29, NAVY, True)
    layout.txt('Productos, equipos y suministros bajo pedido para empresas mineras, contratistas y operaciones industriales en Perú.', 32, 206, width, 12)
    layout.box(32, 260, width, 86, NAVY)
    layout.txt('Qué compartir para empezar', 48, 273, width - 32, 13, white, True)
    layout.txt('Envía tu lista o ficha, cantidades, lugar y fecha requerida. Si falta algún dato, indica qué debe resolver la compra y qué falta validar.', 48, 302, width - 32, 11, white)
    layout.txt('Elige la línea que corresponde a tu requerimiento', 32, 370, width, 14, NAVY, True)
    column = (width - 14) / 2
    for i in range(len(FAMILIES)):
        layout.card(i, 32 + (i % 2) * (column + 14), 395 + (i // 2) * 108, column, 101)
    layout.link('Preparar mi requerimiento', 32, 730, 224, REQUEST)
    layout.txt('Puedes reunir varias líneas en un solo pedido.', 271, 739, width - 239, 10, MUTED)
    layout.footer('1 / 2', 'BC-01 · v2.0')
    layout.c.showPage()

    layout.logo(32, 27)
    layout.txt('GUÍA PARA TU EQUIPO', 32, 93, width, 9.5, NAVY, True)
    layout.txt('Cómo comparar propuestas<br/>antes de decidir', 32, 112, width, 26, NAVY, True)
    layout.txt('Reúne a quien define la necesidad, a quien compra y a quien recibe. Cada persona puede revisar un aspecto distinto de la misma propuesta.', 32, 196, width, 11.5)
    for index, (role, criterion, detail) in enumerate(CHECKS):
        y = 253 + index * 72
        layout.box(32, y, width, 62)
        layout.txt(role, 46, y + 11, 150, 9, MUTED, True)
        layout.txt(criterion, 46, y + 29, 150, 12, NAVY, True)
        layout.txt(detail, 205, y + 12, width - 187, 10.5)
    layout.box(32, 483, width, 134, NAVY)
    layout.txt('Ejemplo ilustrativo · 40 señales para un almacén', 48, 497, width - 32, 12, white, True)
    layout.txt('Una propuesta incluye el despacho al almacén de ciudad. Otra indica entrega en unidad. Para compararlas, confirma quién cubre el traslado final, cuándo empieza el plazo y qué se revisará contra la ficha o el diseño aprobado.', 48, 526, width - 32, 10.5, white)
    layout.txt('Pide que el costo y el punto de entrega se indiquen por escrito.', 48, 586, width - 32, 10, white, True)
    layout.txt('Comparte lo que ya tienes', 32, 642, width - 102, 15, NAVY, True)
    layout.link('Abrir formulario de consulta', 32, 674, 242, REQUEST)
    layout.txt('WhatsApp +51 973 669 004', 32, 724, width - 105, 10, NAVY, True)
    layout.annotation(CONTACT, 32, 723, 198, 16)
    layout.txt('negocios.yakar@gmail.com', 32, 746, width - 105, 10)
    layout.annotation(EMAIL, 32, 745, 198, 16)
    layout.qr(layout.w - 113, 671, 74)
    layout.footer('2 / 2', 'BC-01 · v2.0')
    layout.c.save()


def mobile():
    layout = Layout(ROOT / 'documentos/yakar-brochure-movil.pdf', (400, 1600))
    width = 344
    layout.logo(28, 24, 170)
    layout.txt('PORTAFOLIO Y GUÍA DE COMPRA', 28, 87, width, 9.5, NAVY, True)
    layout.txt('Abastecimiento para<br/>minería e industria', 28, 112, width, 26, NAVY, True)
    layout.txt('Productos, equipos y suministros para empresas en Perú. Evaluamos cada solicitud bajo pedido.', 28, 195, width, 12)
    layout.link('Preparar mi requerimiento', 28, 253, 242, REQUEST)
    layout.txt('Qué compartir para cotizar', 28, 318, width, 16, NAVY, True)
    layout.txt('Tu lista o ficha, cantidades, lugar y fecha requerida. Si algo falta, indícanos qué necesita resolver tu equipo.', 28, 353, width, 11)
    layout.txt('Explora las seis líneas', 28, 412, width, 16, NAVY, True)
    for i in range(len(FAMILIES)):
        layout.card(i, 28, 448 + i * 104, width, 94)
    layout.txt('Tres revisiones antes de decidir', 28, 1096, width, 17, NAVY, True)
    for index, (_, criterion, detail) in enumerate(CHECKS):
        y = 1133 + index * 83
        layout.box(28, y, width, 72)
        layout.txt(criterion, 40, y + 8, width - 24, 11.5, NAVY, True)
        layout.txt(detail, 40, y + 29, width - 24, 10)
    layout.link('Consultar por WhatsApp', 28, 1390, 225)
    layout.txt('+51 973 669 004', 28, 1444, width, 11, NAVY, True)
    layout.annotation(CONTACT, 28, 1443, 200, 17)
    layout.txt('negocios.yakar@gmail.com', 28, 1466, width, 11)
    layout.annotation(EMAIL, 28, 1465, 210, 17)
    layout.txt('Cumplir es parte del producto.', 28, 1504, width, 13, NAVY, True)
    layout.footer('1 / 1', 'BC-01 · v2.0')
    layout.c.save()


def proposal_example():
    layout = Layout(ROOT / 'documentos/yakar-ejemplo-propuesta.pdf', A4)
    layout.c.setTitle('YAKAR | Ejemplo ilustrativo de propuesta')
    width = layout.w - 64
    layout.logo(32, 30)
    layout.txt('EJEMPLO ILUSTRATIVO · SIN VALIDEZ COMERCIAL', 32, 102, width, 10, NAVY, True)
    layout.txt('Cómo revisar una propuesta', 32, 124, width, 24, NAVY, True)
    layout.txt('Caso simulado de señalización industrial. Los datos y precios solo muestran el formato.', 32, 169, width, 11)
    rows = [
        ('Solicitado', '40 señales de 30 × 45 cm para un almacén. Diseño y material sujetos a aprobación del área usuaria.'),
        ('Ofrecido y por validar', '40 señales de 30 × 45 cm. La propuesta identifica el material, el arte y la ficha para revisión. Si cambia algún atributo, se registra y se solicita conformidad antes de preparar el pedido.'),
        ('Precio de ejemplo', '40 × S/ 25,00 = S/ 1 000,00. IGV (18 %) S/ 180,00. Total S/ 1 180,00. Incluye despacho hasta el almacén indicado.'),
        ('Plazo y destino', 'Ejemplo: 10 días hábiles desde aprobación del arte y confirmación del pedido. Recepción en almacén de ciudad con cita. Traslado a unidad e instalación quedan fuera del alcance.'),
        ('Garantía y recepción', 'La propuesta indica vigencia y alcance de la garantía. Almacén verifica cantidad y estado, y el área usuaria confirma medidas y diseño contra lo aprobado.'),
    ]
    for index, (title, body) in enumerate(rows):
        y = 222 + index * 101
        layout.box(32, y, width, 90)
        layout.txt(title, 48, y + 10, width - 32, 12, NAVY, True)
        layout.txt(body, 48, y + 34, width - 32, 10.5)
    layout.txt('Contacto comercial · negocios.yakar@gmail.com', 32, 748, width, 10, NAVY)
    layout.footer('1 / 1')
    layout.c.save()


def supplier_sheet():
    layout = Layout(ROOT / 'documentos/yakar-ficha-proveedor.pdf', A4)
    layout.c.setTitle('YAKAR | Ficha de proveedor')
    width = layout.w - 64
    layout.logo(32, 30)
    layout.txt('Ficha de proveedor', 32, 104, width, 26, NAVY, True)
    layout.txt('Yakar Negocios E.I.R.L. · RUC 20612733261 · Lima, Perú', 32, 155, width, 12, NAVY, True)
    layout.txt('Productos, equipos y suministros para minería e industria, bajo pedido.', 32, 193, width, 12)
    layout.box(32, 243, width, 145)
    layout.txt('Líneas de abastecimiento', 48, 258, width - 32, 14, NAVY, True)
    for index, (title, _, _) in enumerate(FAMILIES):
        layout.txt(title, 48, 288 + index * 14, width - 32, 10)
    layout.txt('Documentos para evaluación', 32, 424, width, 15, NAVY, True)
    layout.txt('Indícanos qué documentos solicita tu empresa y por qué canal debe recibirlos. Revisaremos cuáles podemos proporcionar para tu evaluación.', 32, 455, width, 11)
    layout.txt('Contacto comercial', 32, 532, width, 15, NAVY, True)
    layout.txt('negocios.yakar@gmail.com · +51 973 669 004', 32, 563, width, 11)
    layout.link('Consultar ficha en la web', 32, 604, 250, SITE + '#ficha-proveedor')
    layout.footer('1 / 1')
    layout.c.save()


if __name__ == '__main__':
    a4()
    mobile()
    proposal_example()
    supplier_sheet()
