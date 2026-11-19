from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json
import re
import struct
import zipfile

root = Path(__file__).resolve().parent
plugin_zip = root / 'Nextrole_Figma_Generator.zip'
with zipfile.ZipFile(plugin_zip, 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in sorted((root / 'figma-plugin').glob('*')):
        if file.is_file():
            archive.write(file, file.relative_to(root).as_posix())

class LocalLinks(HTMLParser):
    def __init__(self, parent):
        super().__init__()
        self.parent = parent
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key in ('href', 'src') and value:
                link = urlsplit(value)
                if not link.scheme and not link.netloc and link.path:
                    assert (self.parent / unquote(link.path)).is_file(), value

for name in ['index.html', 'handoff.html', 'docs/showcase.html']:
    file = root / name
    LocalLinks(file.parent).feed(file.read_text(encoding='utf-8'))
for name in re.findall(r'\]\(([^)]+)\)', (root / 'README.md').read_text(encoding='utf-8')):
    if not name.startswith(('https:', 'http:', '#')):
        assert (root / name).exists(), name
images = sorted((root / 'docs/linkedin').glob('*.png'))
assert len(images) == 5
for file in images:
    assert struct.unpack('>II', file.read_bytes()[16:24]) == (1600, 1440)

files = ['index.html', 'data.js', 'app.js', 'styles.css', 'handoff.html', 'README.md',
         'START_HERE.txt', 'LINKEDIN_POST.txt', 'package.json', 'package-lock.json',
         '.gitignore', '.gitattributes', 'check-browser.cjs', 'check-figma.cjs',
         'capture-portfolio.cjs', 'browser-validation.json', 'figma-validation.json',
         'package-project.py', 'Nextrole_Figma_Generator.zip']
for folder in ['figma-plugin', 'docs']:
    files.extend(file.relative_to(root).as_posix() for file in (root / folder).rglob('*') if file.is_file())
project_zip = root / 'Nextrole_Job_Portal_UI.zip'
with zipfile.ZipFile(project_zip, 'w', zipfile.ZIP_DEFLATED) as archive:
    for name in sorted(set(files)):
        archive.write(root / name, 'Nextrole/' + name)
screenshots_zip = root / 'Nextrole_LinkedIn_Screenshots.zip'
with zipfile.ZipFile(screenshots_zip, 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in images:
        archive.write(file, file.name)
    archive.write(root / 'LINKEDIN_POST.txt', 'LINKEDIN_POST.txt')
for file in [plugin_zip, project_zip, screenshots_zip]:
    with zipfile.ZipFile(file) as archive:
        assert archive.testzip() is None
        assert not any('/node_modules/' in name or '/.git/' in name for name in archive.namelist())
print(json.dumps({'status': 'PASS', 'local_links': 'PASS', 'linkedin_images': 5,
                  'project': str(project_zip), 'figma': str(plugin_zip),
                  'screenshots': str(screenshots_zip), 'project_files': len(files),
                  'project_bytes': project_zip.stat().st_size}, indent=2))
