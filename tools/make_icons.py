#!/usr/bin/env python3
"""Tao icon PNG cho PWA (khong can thu vien ngoai).
Ve nen gradient tim-hong bo goc + ngoi sao vang o giua.
"""
import math
import struct
import zlib


def lerp(a, b, t):
    return a + (b - a) * t


def point_in_star(px, py, cx, cy, r_out, r_in, points=5, rot=-math.pi / 2):
    # Tao da giac ngoi sao roi kiem tra diem nam trong.
    verts = []
    for i in range(points * 2):
        ang = rot + math.pi * i / points
        r = r_out if i % 2 == 0 else r_in
        verts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    inside = False
    n = len(verts)
    j = n - 1
    for i in range(n):
        xi, yi = verts[i]
        xj, yj = verts[j]
        if ((yi > py) != (yj > py)) and (
            px < (xj - xi) * (py - yi) / (yj - yi) + xi
        ):
            inside = not inside
        j = i
    return inside


def make_icon(size, path):
    radius = size * 0.22  # bo goc
    cx = cy = size / 2
    r_out = size * 0.33
    r_in = r_out * 0.42

    raw = bytearray()
    for y in range(size):
        raw.append(0)  # filter byte moi hang
        for x in range(size):
            t = (x + y) / (2 * size)
            r = int(lerp(124, 236, t))   # tim -> hong
            g = int(lerp(92, 109, t))
            b = int(lerp(250, 191, t))
            a = 255

            # Bo goc (alpha = 0 ngoai vung bo)
            dx = dy = 0
            if x < radius and y < radius:
                dx, dy = radius - x, radius - y
            elif x > size - radius and y < radius:
                dx, dy = x - (size - radius), radius - y
            elif x < radius and y > size - radius:
                dx, dy = radius - x, y - (size - radius)
            elif x > size - radius and y > size - radius:
                dx, dy = x - (size - radius), y - (size - radius)
            if dx and dy and (dx * dx + dy * dy) > radius * radius:
                a = 0

            # Ngoi sao vang
            if a and point_in_star(x + 0.5, y + 0.5, cx, cy, r_out, r_in):
                r, g, b = 255, 214, 64

            raw += bytes((r, g, b, a))

    def chunk(typ, data):
        c = struct.pack(">I", len(data)) + typ + data
        return c + struct.pack(">I", zlib.crc32(typ + data) & 0xFFFFFFFF)

    sig = b"\x89PNG\r\n\x1a\n"
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    idat = zlib.compress(bytes(raw), 9)
    png = sig + chunk(b"IHDR", ihdr) + chunk(b"IDAT", idat) + chunk(b"IEND", b"")
    with open(path, "wb") as f:
        f.write(png)
    print("wrote", path, size)


if __name__ == "__main__":
    import os
    out = os.path.join(os.path.dirname(__file__), "..", "icons")
    os.makedirs(out, exist_ok=True)
    make_icon(192, os.path.join(out, "icon-192.png"))
    make_icon(512, os.path.join(out, "icon-512.png"))
    make_icon(180, os.path.join(out, "apple-touch-icon.png"))
