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

FAMILIES=[
('Señalización y visibilidad','Cintas y láminas retrorreflectivas, señales, tachas, tachones, adhesivos y placas con braille.','linea-senalizacion'),
('Uniformes y textil industrial','Prendas de trabajo, uniformes personalizados y artículos textiles. Tallas, materiales y muestra cuando corresponda.','linea-uniformes'),
('Herramientas y suministros','Herramientas, fijaciones, repuestos, componentes y consumibles según modelo o especificación.','linea-herramientas'),
('Equipamiento industrial','Grupos electrógenos y otros equipos según aplicación, potencia, condiciones de operación y destino.','linea-equipamiento'),
('Seguridad y protección','EPP, protección contra caídas, bloqueador solar, linternas, pértigas y cuñas para vehículos y maquinaria.','linea-seguridad'),
('Izaje y sujeción','Eslingas y accesorios para cargas según capacidad, aplicación y dimensiones requeridas.','linea-izaje')]
class Layout:
 def __init__(self,path,size):
  self.w,self.h=size;self.c=canvas.Canvas(str(path),pagesize=size,pageCompression=1)
  self.c.setTitle('YAKAR | Productos, equipos y suministros para minería e industria');self.c.setAuthor('Yakar Negocios E.I.R.L.')
  self.c.setSubject('Seis líneas de productos y consultas según requerimiento')
 def txt(self,s,x,y,w,size=11,color=INK,bold=False):
  p=Paragraph(s,ParagraphStyle('p',fontName='Bold' if bold else 'Regular',fontSize=size,leading=size*1.35,textColor=color))
  _,h=p.wrap(w,self.h);assert y+h<self.h-18,(s,y,h);p.drawOn(self.c,x,self.h-y-h);return h
 def box(self,x,y,w,h,color=PALE):self.c.setFillColor(color);self.c.rect(x,self.h-y-h,w,h,stroke=0,fill=1)
 def logo(self,x,y,w=170):
  image=PDF_LOGO;iw,ih=image.getSize();self.c.drawImage(image,x,self.h-y-w*ih/iw,w,w*ih/iw,mask='auto')
 def link(self,title,x,y,w=210,url=CONTACT):
  self.box(x,y,w,38,NAVY);self.txt(title,x+12,y+10,w-24,11,white,True);self.c.linkURL(url,(x,self.h-y-38,x+w,self.h-y),relative=0)
 def footer(self,page):
  self.txt('Yakar Negocios E.I.R.L. · RUC 20612733261 · Perú',32,self.h-35,self.w-100,8,MUTED);self.txt(page,self.w-65,self.h-35,40,8,MUTED)
 def card(self,i,x,y,w,h):
  title,body,anchor=FAMILIES[i];self.box(x,y,w,h);self.txt(f'{i+1:02}',x+14,y+11,w-28,10,NAVY,True)
  th=self.txt(title,x+14,y+30,w-28,13,NAVY,True);self.txt(body,x+14,y+38+th,w-28,10.4)
  self.c.linkURL(SITE+'#'+anchor,(x,self.h-y-h,x+w,self.h-y),relative=0)
 def qr(self,x,y,size=62):
  q=QrCodeWidget(SITE);a,b,c,d=q.getBounds();dr=Drawing(size,size,transform=[size/(c-a),0,0,size/(d-b),0,0]);dr.add(q);renderPDF.draw(dr,self.c,x,self.h-y-size)

def a4():
 l=Layout(ROOT/'documentos/yakar-brochure-a4.pdf',A4);w=l.w-64;l.logo(32,28)
 l.txt('ABASTECIMIENTO ESTRATÉGICO',32,94,w,9,NAVY,True)
 l.txt('Productos, equipos y suministros<br/>para minería e industria',32,116,w,25,NAVY,True)
 l.txt('Para empresas mineras, contratas, subcontratas y operaciones industriales. Comparte qué necesitas, las cantidades y el destino de entrega.',32,198,w,11)
 cw=(w-16)/2
 for i in range(6):l.card(i,32+(i%2)*(cw+16),260+(i//2)*151,cw,139)
 l.txt('Puedes consultar productos de varias líneas o incluir otros que no aparezcan aquí.',32,728,w,10.5)
 l.link('Conversemos sobre tu requerimiento',32,766,285);l.footer('1 / 2');l.c.showPage()
 l.logo(32,28);l.txt('CUMPLIR ES PARTE DEL PRODUCTO.',32,104,w,10,NAVY,True)
 l.txt('Una propuesta que tu<br/>equipo puede revisar.',32,130,w,28,NAVY,True)
 y=226
 for title,body in [
 ('01 · Comparte tu necesidad','Una lista, ficha técnica, fotografía o referencia es suficiente para empezar. Si faltan detalles, los precisamos contigo.'),
 ('02 · Revisa las condiciones','Producto, especificaciones, cantidad, precio y plazo. Cuando corresponde, se detallan ficha técnica, muestra, garantía y criterios de conformidad.'),
 ('03 · Coordina la recepción','Indica localidad, punto de entrega y fecha requerida. Revisamos el traslado, los accesos y la documentación para recibir el pedido.')]:
  l.box(32,y,w,94);l.txt(title,48,y+14,w-32,13,NAVY,True);l.txt(body,48,y+39,w-32,11);y+=110
 l.txt('Tu operación puede estar en otra región.',32,566,w,17,NAVY,True)
 l.txt('El destino forma parte de la propuesta. La disponibilidad, el plazo y las condiciones de entrega se confirman para cada requerimiento.',32,596,w,11)
 l.link('Consultar por WhatsApp',32,654,220);l.txt('+51 973 669 004',32,703,w-100,12,NAVY,True)
 l.txt('negocios.yakar@gmail.com',32,730,w-100,11);l.c.linkURL('mailto:negocios.yakar@gmail.com',(32,l.h-750,270,l.h-730),relative=0)
 l.txt('Visita nuestro portafolio en la web',32,760,w-100,10,NAVY);l.c.linkURL(SITE,(32,l.h-780,300,l.h-755),relative=0);l.qr(l.w-112,690,74);l.footer('2 / 2');l.c.save()

def mobile():
 l=Layout(ROOT/'documentos/yakar-brochure-movil.pdf',(400,1720));w=344;l.logo(28,26,175)
 l.txt('PRODUCTOS BAJO REQUERIMIENTO · PERÚ',28,91,w,9,NAVY,True)
 l.txt('Productos, equipos<br/>y suministros para<br/>minería e industria',28,118,w,27,NAVY,True)
 l.txt('Para empresas mineras, contratas, subcontratas y operaciones industriales.',28,242,w,12)
 l.link('Consultar por WhatsApp',28,297,244)
 for i in range(6):l.card(i,28,362+i*140,w,128)
 l.txt('¿Tu compra reúne varios productos?',28,1214,w,19,NAVY,True)
 l.txt('Comparte tu lista, ficha técnica o fotografía. Puedes incluir distintas líneas y otros productos que necesite tu operación.',28,1274,w,12)
 l.txt('Indica dónde lo necesitas',28,1352,w,16,NAVY,True)
 l.txt('Localidad, punto de recepción y fecha requerida. Confirmamos disponibilidad, precio, plazo y condiciones de entrega en la propuesta.',28,1385,w,12)
 l.link('Cuéntanos qué necesitas',28,1478,244)
 l.txt('+51 973 669 004',28,1536,w,13,NAVY,True);l.txt('negocios.yakar@gmail.com',28,1566,w,11)
 l.c.linkURL('mailto:negocios.yakar@gmail.com',(28,l.h-1585,300,l.h-1566),relative=0)
 l.txt('Cumplir es parte del producto.',28,1621,w,15,NAVY,True);l.footer('1 / 1');l.c.save()
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
