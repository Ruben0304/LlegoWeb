"""Genera iconos de app a partir del isotipo del manual.
uso: iconos.py <isotipo.svg> <fondo hex> <tinta hex> <salida_dir>
Escribe: svg cuadrado (full bleed y redondeado), vector Android y la lista de paths."""
import re, sys, json, pathlib
src, fondo, tinta, out = sys.argv[1:5]
s = open(src).read()
vb = [float(x) for x in re.search(r'viewBox="([^"]+)"', s).group(1).split()]
paths = re.findall(r'<path[^>]* d="([^"]+)"', s)
x0, y0, w, h = vb
out = pathlib.Path(out); out.mkdir(parents=True, exist_ok=True)
def svg(size_frac, rx):
    # isotipo centrado ocupando size_frac del ancho
    W = 1024; iw = W * size_frac; ih = iw * h / w
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {W}"><rect width="{W}" height="{W}" rx="{rx}" fill="{fondo}"/>'
            f'<svg x="{(W-iw)/2:.1f}" y="{(W-ih)/2:.1f}" width="{iw:.1f}" height="{ih:.1f}" viewBox="{x0} {y0} {w} {h}">'
            + ''.join(f'<path fill="{tinta}" d="{d}"/>' for d in paths) + '</svg></svg>')
(out/'cuadrado.svg').write_text(svg(0.70, 0))
(out/'redondeado.svg').write_text(svg(0.66, 225))
(out/'circulo.svg').write_text(svg(0.62, 512))
# Vector adaptativo: 108x108, isotipo de 62 dp de ancho (dentro de la zona segura de 66)
sc = 62 / w; tx = 54 - 31 - x0 * sc; ty = 54 - h * sc / 2 - y0 * sc
vec = ('<?xml version="1.0" encoding="utf-8"?>\n<!-- Isotipo del manual de identidad de Llegó (la mano con la caja). Generado, no editar a mano. -->\n'
       '<vector xmlns:android="http://schemas.android.com/apk/res/android"\n    android:width="108dp"\n    android:height="108dp"\n'
       '    android:viewportWidth="108"\n    android:viewportHeight="108">\n'
       f'    <group\n        android:scaleX="{sc:.6f}"\n        android:scaleY="{sc:.6f}"\n        android:translateX="{tx:.4f}"\n        android:translateY="{ty:.4f}">\n'
       + ''.join(f'        <path\n            android:fillColor="{tinta}"\n            android:pathData="{d}" />\n' for d in paths)
       + '    </group>\n</vector>\n')
(out/'ic_launcher_foreground.xml').write_text(vec)
print('ok', len(paths))
