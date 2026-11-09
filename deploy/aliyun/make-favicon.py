"""生成新大物流 favicon：品牌色圆角方块 + 白色「新」字"""
import os
from PIL import Image, ImageDraw, ImageFont

BRAND = (9, 107, 222, 255)   # #096BDE
SIZE = 512
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "public", "favicon.ico")
OUT = os.path.abspath(OUT)

img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
d = ImageDraw.Draw(img)
d.rounded_rectangle([0, 0, SIZE - 1, SIZE - 1], radius=int(SIZE * 0.2), fill=BRAND)

font = None
for cand in ["C:/Windows/Fonts/msyhbd.ttc", "C:/Windows/Fonts/msyh.ttc", "C:/Windows/Fonts/simhei.ttf"]:
    if os.path.exists(cand):
        try:
            font = ImageFont.truetype(cand, int(SIZE * 0.64))
            break
        except Exception:
            continue

if font is None:
    raise SystemExit("未找到中文字体")

text = "新"
bbox = d.textbbox((0, 0), text, font=font)
w, h = bbox[2] - bbox[0], bbox[3] - bbox[1]
d.text(((SIZE - w) / 2 - bbox[0], (SIZE - h) / 2 - bbox[1]), text, font=font, fill=(255, 255, 255, 255))

os.makedirs(os.path.dirname(OUT), exist_ok=True)
img.save(OUT, format="ICO", sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
print("written:", OUT, os.path.getsize(OUT), "bytes")

# 同时导出一张 png 便于预览
png = os.path.join(os.path.dirname(OUT), "favicon-preview.png")
img.resize((256, 256), Image.LANCZOS).save(png)
print("preview:", png)
