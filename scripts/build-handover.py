"""Render the source-controlled owner handover. Requires reportlab, pypdf."""
from pathlib import Path
from html import escape
import re
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Preformatted, Flowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'output/pdf/capistor-owner-handover.pdf'
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
styles = getSampleStyleSheet()
navy = colors.HexColor('#13243b')
blue = colors.HexColor('#285fc2')
styles.add(ParagraphStyle(name='TitleCustom', fontName='Helvetica-Bold', fontSize=28, leading=33, textColor=navy, spaceAfter=14))
styles.add(ParagraphStyle(name='SubCustom', fontName='Helvetica', fontSize=14, leading=19, textColor=blue, spaceAfter=19))
styles.add(ParagraphStyle(name='BodyCustom', fontName='Helvetica', fontSize=11, leading=16.5, textColor=navy, spaceAfter=12, splitLongWords=True))
styles.add(ParagraphStyle(name='CodeCustom', fontName='Courier', fontSize=8, leading=12, backColor=colors.HexColor('#f0f3f8'), borderPadding=8, spaceAfter=14))

def markup(text):
    text = escape(text)
    return re.sub(r'https://[^\s<]+', lambda m: '<link href="'+m.group(0)+'" color="#285fc2">'+m.group(0)+'</link>', text)

class Architecture(Flowable):
    def __init__(self):
        Flowable.__init__(self); self.width=479; self.height=228
    def draw(self):
        c=self.canv
        boxes=[(160,181,159,36,'Customer browser'),(160,117,159,42,'Cloudflare Worker + React'),(0,44,147,42,'Supabase: auth + database'),(166,44,147,42,'Stripe: payments'),(332,44,147,42,'R2: private files')]
        c.setStrokeColor(blue); c.setLineWidth(1)
        for x,y,w,h,label in boxes:
            c.setFillColor(colors.HexColor('#eef3fc')); c.roundRect(x,y,w,h,6,fill=1,stroke=0)
            c.setFillColor(navy); c.setFont('Helvetica-Bold',9); c.drawCentredString(x+w/2,y+h/2-3,label)
        c.line(239,181,239,159)
        for x in (73,239,405):
            c.line(239,117,x,86)
        c.setFillColor(navy); c.setFont('Helvetica',9)
        c.drawCentredString(239,19,'Resend sends email  |  Zoho receives replies  |  GitHub keeps source')

def footer(c, doc):
    w,h=A4
    c.setStrokeColor(colors.HexColor('#dbe3ef')); c.line(56,48,w-56,48)
    c.setFont('Helvetica',8); c.setFillColor(colors.HexColor('#627086'))
    c.drawString(56,34,'CAPISTOR TECHNOLOGIES  /  OWNER HANDOVER  /  28 NOV 2026')
    c.drawRightString(w-56,34,str(doc.page))
    if doc.page>1:
        c.setFont('Helvetica',8); c.drawString(56,h-32,'OPERATIONS + ENGINEERING')

def main():
    sections=(ROOT/'docs/owner-handover.md').read_text().split('---PAGE---')
    story=[]
    for index,section in enumerate(sections):
        if index: story.append(PageBreak())
        paragraph=[]
        code=None
        def flush():
            if paragraph:
                story.append(Paragraph(markup('\n'.join(paragraph)).replace('\n','<br/>'),styles['BodyCustom']))
                paragraph.clear()
        for line in section.strip().splitlines():
            if line.startswith('```'):
                flush()
                if code is None: code=[]
                else:
                    story.append(Preformatted('\n'.join(code),styles['CodeCustom']))
                    code=None
            elif code is not None: code.append(line)
            elif not line.strip(): flush()
            elif line.startswith('# '):
                flush(); story.append(Paragraph(markup(line[2:]),styles['TitleCustom']))
            elif line.startswith('## '):
                flush(); story.append(Paragraph(markup(line[3:]),styles['SubCustom']))
            elif line == '[ARCHITECTURE]':
                flush(); story.append(Architecture())
            else: paragraph.append(line)
        flush()
    doc=SimpleDocTemplate(str(OUTPUT),pagesize=A4,rightMargin=56,leftMargin=56,topMargin=57,bottomMargin=66,title='Capistor Technologies - Owner and Engineering Handover',author='Capistor Technologies')
    doc.build(story,onFirstPage=footer,onLaterPages=footer)
    from pypdf import PdfReader
    pdf=PdfReader(OUTPUT)
    assert len(pdf.pages)==len(sections),f'Expected {len(sections)} pages, got {len(pdf.pages)}; inspect overflow'
    print(f'{OUTPUT}: {len(pdf.pages)} pages')
if __name__ == '__main__':main()
