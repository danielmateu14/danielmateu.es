"""Genera el monograma DM del favicon.

Se dibuja con poligonos en un lienzo de 512 y se supermuestrea x8 para que los
bordes queden limpios: PIL no antialiasa los poligonos al rellenarlos.

Las mismas coordenadas alimentan el SVG, asi que el vectorial y los PNG son el
mismo dibujo, no dos aproximaciones distintas.
"""
from PIL import Image, ImageDraw
import pathlib

LADO = 512
SS = 8                      # factor de supermuestreo
FONDO = (15, 15, 16)
ROJO = (239, 68, 68)
# El gris original (90,90,94 -> 42,42,45) se fundia con el fondo a 16px: la M
# desaparecia y solo se leia la D. Subido para que exista en tamano pequeno.
GRIS_CLARO = (154, 154, 160)
GRIS_OSCURO = (92, 92, 98)

# --- Geometria, en coordenadas de 512 -------------------------------------
# "M" angular a la derecha
M = [(232, 396), (232, 128), (286, 128), (346, 252), (406, 128), (458, 128),
     (458, 396), (414, 396), (414, 202), (364, 306), (328, 306), (278, 202),
     (278, 396)]

# "D" a la izquierda: contorno exterior y hueco interior (regla par-impar)
D_FUERA = [(58, 128), (168, 128), (254, 214), (254, 310), (168, 396), (58, 396)]
D_DENTRO = [(112, 182), (146, 182), (200, 236), (200, 288), (146, 342), (112, 342)]

# Sin diagonal: la primera version la puso cruzando el pie de la D y el
# monograma se leia "QM" en vez de "DM".
DIAGONAL = []

RADIO = 112                 # esquinas del cuadrado de fondo
MARGEN = 0.86               # el monograma llegaba al borde derecho: se encoge


def degradado_vertical(tam, arriba, abajo):
    g = Image.new("RGB", (1, tam))
    px = g.load()
    for y in range(tam):
        t = y / (tam - 1)
        px[0, y] = tuple(round(a + (b - a) * t) for a, b in zip(arriba, abajo))
    return g.resize((tam, tam))


def encoger(pts, f=MARGEN, c=LADO / 2):
    """Acerca los puntos al centro, para dejar aire alrededor del monograma."""
    return [(c + (x - c) * f, c + (y - c) * f) for x, y in pts]


def escalar(pts, k):
    return [(x * k, y * k) for x, y in encoger(pts)]


def dibujar(lado_final):
    W = LADO * SS
    lienzo = Image.new("RGB", (W, W), FONDO)
    d = ImageDraw.Draw(lienzo)

    # fondo redondeado: se recorta al final con una mascara
    # M con degradado: se pinta el degradado y se enmascara con el poligono
    mascara_m = Image.new("L", (W, W), 0)
    ImageDraw.Draw(mascara_m).polygon(escalar(M, SS), fill=255)
    lienzo.paste(degradado_vertical(W, GRIS_CLARO, GRIS_OSCURO), (0, 0), mascara_m)

    # D roja, con hueco (se dibuja el hueco del color del fondo)
    d.polygon(escalar(D_FUERA, SS), fill=ROJO)
    d.polygon(escalar(D_DENTRO, SS), fill=FONDO)

    if DIAGONAL:
        d.polygon(escalar(DIAGONAL, SS), fill=ROJO)

    lienzo = lienzo.resize((lado_final, lado_final), Image.LANCZOS)

    # esquinas redondeadas con alfa
    m = Image.new("L", (lado_final * SS, lado_final * SS), 0)
    ImageDraw.Draw(m).rounded_rectangle(
        [0, 0, lado_final * SS - 1, lado_final * SS - 1],
        radius=int(RADIO * lado_final * SS / LADO), fill=255)
    m = m.resize((lado_final, lado_final), Image.LANCZOS)

    salida = Image.new("RGBA", (lado_final, lado_final), (0, 0, 0, 0))
    salida.paste(lienzo, (0, 0), m)
    return salida


def svg():
    def poli(p):
        return " ".join(f"{x:.1f},{y:.1f}" for x, y in p)

    def camino(p):
        """Subcamino cerrado explicito: M x y L x y ... Z"""
        (x0, y0), resto = p[0], p[1:]
        return f"M{x0:.1f} {y0:.1f} " + " ".join(f"L{x:.1f} {y:.1f}" for x, y in resto) + " Z"

    d_roja = camino(encoger(D_FUERA)) + " " + camino(encoger(D_DENTRO))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="gris" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgb{GRIS_CLARO}"/>
      <stop offset="1" stop-color="rgb{GRIS_OSCURO}"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="512" height="512" rx="{RADIO}" ry="{RADIO}" fill="rgb{FONDO}"/>
  <polygon points="{poli(encoger(M))}" fill="url(#gris)"/>
  <!-- fill-rule evenodd: el segundo subcamino abre el hueco de la D -->
  <path d="{d_roja}" fill="rgb{ROJO}" fill-rule="evenodd"/>
</svg>
'''


if __name__ == "__main__":
    out = pathlib.Path("/tmp/claude-0/-var-www/c86dd00c-eaa3-4608-9965-d7bd3b2ff746/scratchpad/fav")
    out.mkdir(exist_ok=True)
    for n in (512, 192, 180, 32, 16):
        dibujar(n).save(out / f"prueba-{n}.png")
    (out / "favicon.svg").write_text(svg())
    # vista ampliada del de 32 para juzgar la legibilidad real
    Image.open(out / "prueba-32.png").resize((320, 320), Image.NEAREST).save(out / "zoom-32.png")
    Image.open(out / "prueba-16.png").resize((320, 320), Image.NEAREST).save(out / "zoom-16.png")
    print("generado en", out)
