#!/usr/bin/env python3
"""Genera tutti gli 8 PDF A4 dalle dispense HTML usando Google Chrome headless."""

import os
import subprocess
import sys

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PDF_DIR = os.path.join(BASE, "pdf")
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

PAIRS = [
    ("dispense/formulario-unico.html", "pdf/00-Formulario-Unico.pdf"),
    ("dispense/giorno-01-metodi-cinematica.html", "pdf/01-Giorno1-Metodi-e-Cinematica.pdf"),
    ("dispense/giorno-02-dinamica-energia-statica.html", "pdf/02-Giorno2-Dinamica-Energia-Statica.pdf"),
    ("dispense/giorno-03-meccanica-fluidi.html", "pdf/03-Giorno3-Meccanica-dei-Fluidi.pdf"),
    ("dispense/giorno-04-termodinamica.html", "pdf/04-Giorno4-Termodinamica.pdf"),
    ("dispense/giorno-05-elettricita-magnetismo.html", "pdf/05-Giorno5-Elettricita-e-Magnetismo.pdf"),
    ("dispense/giorno-06-onde-radiazioni.html", "pdf/06-Giorno6-Onde-e-Radiazioni.pdf"),
    ("dispense/giorno-07-simulazione-esame.html", "pdf/07-Giorno7-Simulazione-31-Quesiti.pdf"),
]


def main():
    os.makedirs(PDF_DIR, exist_ok=True)
    if not os.path.exists(CHROME):
        print("Google Chrome non trovato in:", CHROME)
        sys.exit(1)

    ok_count = 0
    for src, dst in PAIRS:
        url = f"file://{os.path.join(BASE, src)}"
        out = os.path.join(BASE, dst)
        res = subprocess.run(
            [
                CHROME,
                "--headless=new",
                "--disable-gpu",
                "--no-pdf-header-footer",
                f"--print-to-pdf={out}",
                url,
            ],
            capture_output=True,
            text=True,
        )
        size = os.path.getsize(out) if os.path.exists(out) else 0
        if size > 1000:
            ok_count += 1
            print(f"[OK] {dst} ({size // 1024} KB)")
        else:
            print(f"[FAIL] {dst} (rc={res.returncode})")
            if res.stderr:
                print(res.stderr[:300])

    print(f"\nCompletato: {ok_count}/{len(PAIRS)} PDF generati.")
    if ok_count != len(PAIRS):
        sys.exit(1)


if __name__ == "__main__":
    main()
