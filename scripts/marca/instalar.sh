#!/bin/bash
# Instala los iconos que genera iconos.py en una app Android (res) y/o iOS (appiconset).
# uso: instalar.sh <dir_generado> <fondo hex> <android res dir|-> <ios appiconset dir|->
# Necesita Pillow (python3 -m pip install pillow) y Playwright con Chromium (CHROMIUM=ruta opcional).
# Colores usados (oct 2026): cliente Tangerine #F9B41E sobre Jade #176545; Business sobre Country Squire #124939.
set -e
G=$1; FONDO=$2; RES=$3; IOS=$4
R="node $(dirname "$0")/render.mjs"
$R $G/cuadrado.svg $G/cuadrado-1024.png 1024
$R $G/redondeado.svg $G/redondeado-1024.png 1024 1
$R $G/circulo.svg $G/circulo-1024.png 1024 1
if [ "$RES" != "-" ]; then
  cp $G/ic_launcher_foreground.xml $RES/drawable-v24/ic_launcher_foreground.xml 2>/dev/null || { mkdir -p $RES/drawable; cp $G/ic_launcher_foreground.xml $RES/drawable/ic_launcher_foreground.xml; }
  cat > $RES/drawable/ic_launcher_background.xml <<X
<?xml version="1.0" encoding="utf-8"?>
<!-- Fondo del icono: color del manual de identidad de Llegó -->
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="$FONDO"
        android:pathData="M0,0h108v108h-108z" />
</vector>
X
  python - "$G" "$RES" <<'P'
import sys, glob, os
from PIL import Image
g, res = sys.argv[1:3]
tam = {'mdpi':48,'hdpi':72,'xhdpi':96,'xxhdpi':144,'xxxhdpi':192}
for d,n in tam.items():
    carpeta=f'{res}/mipmap-{d}'
    if not os.path.isdir(carpeta): continue
    for nombre, src in [('ic_launcher','redondeado'),('ic_launcher_round','circulo')]:
        for ext in ('png','webp'):
            f=f'{carpeta}/{nombre}.{ext}'
            if os.path.exists(f):
                im=Image.open(f'{g}/{src}-1024.png').resize((n,n),Image.LANCZOS)
                im.save(f) if ext=='png' else im.save(f,'WEBP',lossless=True)
P
fi
if [ "$IOS" != "-" ]; then
  python - "$G" "$IOS" <<'P'
import sys, glob
from PIL import Image
g, d = sys.argv[1:3]
base=Image.open(f'{g}/cuadrado-1024.png').convert('RGB')
for f in glob.glob(f'{d}/*.png'):
    w=Image.open(f).size[0]
    base.resize((w,w),Image.LANCZOS).save(f)
P
fi
echo instalado
