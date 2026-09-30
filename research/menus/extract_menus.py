from pypdf import PdfReader
from pathlib import Path
import json
sources = {
'drinks': Path(r'C:\Users\sayoa\Downloads\53108378-6552-4bb3-97d5-e3b6c5b258d3_Tamberma-Ibd-Drinks-Menu.pdf'),
'food': Path(r'C:\Users\sayoa\Downloads\1ecd8a82-67fd-4c98-8f87-054992f046a1_Tamberma-Ibd-Food-Menu---1-Aug-2026.pdf')
}
for label,path in sources.items():
    reader=PdfReader(path)
    pages=[]
    for i,page in enumerate(reader.pages,1):
        pages.append(f'\n\n=== PDF PAGE {i} ===\n\n'+page.extract_text(extraction_mode='layout'))
    Path(f'research/menus/{label}-extracted.txt').write_text(''.join(pages),encoding='utf-8')
    print(label, 'pages',len(reader.pages),'metadata',reader.metadata)
