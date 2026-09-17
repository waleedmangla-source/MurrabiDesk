#!/usr/bin/env python3
import sys
import json
import os
import zipfile
import xml.etree.ElementTree as ET

def fill_report(data, template_path, output_path):
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template not found at {template_path}")

    with zipfile.ZipFile(template_path, 'r') as zin:
        xml_content = zin.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        def set_cell_text(cell, text):
            paragraphs = cell.findall('w:p', ns)
            if not paragraphs:
                p = ET.SubElement(cell, f"{{{ns['w']}}}p")
                paragraphs = [p]
            p = paragraphs[0]
            
            # Find run properties to preserve font, size, weight, color
            existing_run = p.find('w:r', ns)
            rPr = existing_run.find('w:rPr', ns) if existing_run is not None else None
            rPr_copy = ET.fromstring(ET.tostring(rPr)) if rPr is not None else None
            
            # Clear existing content from p except paragraph properties (w:pPr)
            for child in list(p):
                if child.tag != f"{{{ns['w']}}}pPr":
                    p.remove(child)
                    
            # Remove any extra paragraphs inside the cell to avoid leftover placeholder text
            for extra_p in paragraphs[1:]:
                cell.remove(extra_p)
                
            lines = str(text if text is not None else '').split('\n')
            for idx, line in enumerate(lines):
                r = ET.SubElement(p, f"{{{ns['w']}}}r")
                if rPr_copy is not None:
                    r.append(ET.fromstring(ET.tostring(rPr_copy)))
                t = ET.SubElement(r, f"{{{ns['w']}}}t")
                t.set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
                t.text = line
                if idx < len(lines) - 1:
                    br_r = ET.SubElement(p, f"{{{ns['w']}}}r")
                    ET.SubElement(br_r, f"{{{ns['w']}}}br")

        tables = tree.findall('.//w:tbl', ns)
        if len(tables) < 3:
            raise ValueError("Template does not contain expected 3 tables")
        
        # Table 1: Header Metadata (Name, Office, Month)
        t1_cells = tables[0].findall('w:tr', ns)[0].findall('w:tc', ns)
        set_cell_text(t1_cells[1], data.get('name', ''))
        set_cell_text(t1_cells[3], data.get('office', ''))
        set_cell_text(t1_cells[5], data.get('month', ''))
        
        # Table 2: Office Activities
        t2_rows = tables[1].findall('w:tr', ns)
        if len(t2_rows) >= 2:
            set_cell_text(t2_rows[0].findall('w:tc', ns)[2], data.get('q1', ''))
            set_cell_text(t2_rows[1].findall('w:tc', ns)[2], data.get('q2', ''))
        
        # Table 3: Personal Activities (Q3 to Q17)
        t3_rows = tables[2].findall('w:tr', ns)
        for i in range(15):
            q_key = f"q{i+3}"
            if i < len(t3_rows):
                val = data.get(q_key, '')
                set_cell_text(t3_rows[i].findall('w:tc', ns)[2], val)
            
        new_xml = ET.tostring(tree, encoding='utf-8', xml_declaration=True)
        
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
        with zipfile.ZipFile(output_path, 'w', compression=zipfile.ZIP_DEFLATED) as zout:
            for item in zin.infolist():
                if item.filename == 'word/document.xml':
                    zout.writestr(item, new_xml)
                else:
                    zout.writestr(item, zin.read(item.filename))

if __name__ == '__main__':
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            sys.exit(1)
        payload = json.loads(raw_input)
        
        template_file = payload.get('template_path')
        output_file = payload.get('output_path')
        report_data = payload.get('data', {})
        
        if not template_file or not output_file:
            print(json.dumps({"error": "Missing template_path or output_path"}), file=sys.stderr)
            sys.exit(1)
            
        fill_report(report_data, template_file, output_file)
        print(json.dumps({"success": True, "output_path": output_file}))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
