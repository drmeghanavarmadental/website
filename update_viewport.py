import re
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = re.compile(r'<meta name="viewport".*?>', re.IGNORECASE)
matches = pattern.findall(content)
print('Current viewport tags:', matches)

content = pattern.sub('<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">', content)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated viewport tag!')
