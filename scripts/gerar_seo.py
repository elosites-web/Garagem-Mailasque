#!/usr/bin/env python3
"""Gera sitemap.xml e robots.txt para sites institucionais de profissionais liberais.

Uso:
    python3 scripts/gerar_seo.py --dominio https://www.garagemmailasque.com.br --saida ./public \
        --paginas / /sobre /servicos /galeria /contato --sitemap-url /sitemap.xml

Argumentos:
    --dominio     URL base do site (obrigatório, com https:// e sem barra final).
    --saida       Diretório onde gravar os arquivos (padrão: diretório atual).
    --paginas     Lista de rotas do site (padrão: /, /sobre, /servicos, /contato).
    --sitemap-url Caminho do sitemap informado no robots.txt (padrão: /sitemap.xml).
    --modificado  Data de última modificação em YYYY-MM-DD (padrão: data de hoje).

O script é determinístico: mesma entrada, mesma saída. XML gerado sem dependências externas.
"""

import argparse
import datetime
import os
import sys
import xml.etree.ElementTree as ET
from urllib.parse import urlparse
from xml.dom import minidom


def validar_dominio(dominio: str) -> str:
    """Garante https:// e ausência de barra final; rejeita URLs malformadas."""
    if not dominio.startswith(("http://", "https://")):
        dominio = "https://" + dominio
    dominio = dominio.rstrip("/")
    parsed = urlparse(dominio)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError(f"Domínio inválido: {dominio}")
    return dominio


def normalizar_rota(rota: str) -> str:
    """Garante que cada rota comece com '/' e não termine com '/'."""
    rota = rota.strip()
    if not rota.startswith("/"):
        rota = "/" + rota
    if len(rota) > 1:
        rota = rota.rstrip("/")
    return rota


def gerar_sitemap(dominio: str, paginas: list[str], modificado: str) -> bytes:
    urlset = ET.Element("urlset", xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    for rota in paginas:
        url = ET.SubElement(urlset, "url")
        ET.SubElement(url, "loc").text = f"{dominio}{rota}"
        ET.SubElement(url, "lastmod").text = modificado
        ET.SubElement(url, "changefreq").text = "monthly"
        prioridade = "1.0" if rota == "/" else "0.8"
        ET.SubElement(url, "priority").text = prioridade
    raw = ET.tostring(urlset, encoding="utf-8")
    return minidom.parseString(raw).toprettyxml(indent="  ", encoding="utf-8")


def gerar_robots(sitemap_url: str) -> str:
    return (
        "User-agent: *\n"
        "Allow: /\n"
        "\n"
        f"Sitemap: {{DOMINIO}}{sitemap_url}\n"
    )


def main() -> int:
    hoje = datetime.date.today().isoformat()
    parser = argparse.ArgumentParser(description="Gera sitemap.xml e robots.txt.")
    parser.add_argument("--dominio", required=True, help="Ex.: https://www.garagemmailasque.com.br")
    parser.add_argument("--saida", default=".", help="Diretório de saída (padrão: atual)")
    parser.add_argument("--paginas", nargs="+",
                        default=["/", "/#sobre", "/#servicos", "/#galeria", "/#contato"],
                        help="Rotas do site")
    parser.add_argument("--sitemap-url", default="/sitemap.xml")
    parser.add_argument("--modificado", default=hoje, help="YYYY-MM-DD")
    args = parser.parse_args()

    try:
        dominio = validar_dominio(args.dominio)
    except ValueError as exc:
        print(f"Erro: {exc}", file=sys.stderr)
        return 1

    try:
        datetime.date.fromisoformat(args.modificado)
    except ValueError:
        print("Erro: --modificado deve estar em YYYY-MM-DD", file=sys.stderr)
        return 1

    paginas = sorted({normalizar_rota(p) for p in args.paginas},
                     key=lambda r: (r != "/", r))
    os.makedirs(args.saida, exist_ok=True)

    sitemap = gerar_sitemap(dominio, paginas, args.modificado)
    robots = gerar_robots(args.sitemap_url).replace("{DOMINIO}", dominio)

    caminho_sitemap = os.path.join(args.saida, "sitemap.xml")
    caminho_robots = os.path.join(args.saida, "robots.txt")
    with open(caminho_sitemap, "wb") as f:
        f.write(sitemap)
    with open(caminho_robots, "w", encoding="utf-8") as f:
        f.write(robots)

    print(f"OK: {caminho_sitemap} ({len(paginas)} URLs)")
    print(f"OK: {caminho_robots}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
