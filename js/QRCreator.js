;(() => {
  "use strict"
  const t = {
    MODE_TERMINATOR: 0,
    MODE_NUMERIC: 1,
    MODE_ALPHANUMERIC: 2,
    MODE_OCTET: 4,
    isMode: (t) => "124".includes(t + ""),
    ECCLEVEL_L: 1,
    ECCLEVEL_M: 0,
    ECCLEVEL_Q: 3,
    ECCLEVEL_H: 2,
    isEccl: (t) => t > -1 && t < 4,
    bitsFieldDataQuantity: (e, s) => {
      switch (s) {
        case t.MODE_NUMERIC:
          return e < 10 ? 10 : e < 27 ? 12 : 14
        case t.MODE_ALPHANUMERIC:
          return e < 10 ? 9 : e < 27 ? 11 : 13
        case t.MODE_OCTET:
          return e < 10 ? 8 : 16
      }
      return 0
    },
    ALPHANUMERIC_MAP: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:"
      .split("")
      .reduce((t, e, s) => ((t[e] = s), t), {}),
    GF256: [],
    GF256_INV: [-1],
    GF256_GENPOLY: {},
    encodeBCH: (t, e, s, r) => {
      let i = t << r
      for (let t = e - 1; t >= 0; --t) (i >> (r + t)) & 1 && (i ^= s << t)
      return (t << r) | i
    },
    MASKFUNCS: [
      (t, e) => (t + e) % 2 == 0,
      (t, e) => t % 2 == 0,
      (t, e) => e % 3 == 0,
      (t, e) => (t + e) % 3 == 0,
      (t, e) => (((t / 2) | 0) + ((e / 3) | 0)) % 2 == 0,
      (t, e) => ((t * e) % 2) + ((t * e) % 3) == 0,
      (t, e) => (((t * e) % 2) + ((t * e) % 3)) % 2 == 0,
      (t, e) => (((t + e) % 2) + ((t * e) % 3)) % 2 == 0,
    ],
    PENALTY: { CONSECUTIVE: 3, TWOBYTWO: 3, FINDERLIKE: 40, DENSITY: 10 },
    IMAGE: ["PNG", "SVG", "HTML", "NONE"],
    modsize: 4,
    margin: 4,
  }
  for (let e = 0, s = 1; e < 255; ++e)
    t.GF256.push(s), (t.GF256_INV[s] = e), (s = (2 * s) ^ (s >= 128 ? 285 : 0))
  for (let e = 0, s = []; e < 30; ++e) {
    const r = []
    for (let i = 0; i <= e; ++i) {
      const o = i < e ? t.GF256[s[i]] : 0,
        n = t.GF256[(e + (s[i - 1] || 0)) % 255]
      r.push(t.GF256_INV[o ^ n])
    }
    ;(s = r),
      [7, 10, 13, 15, 16, 17, 18, 20, 22, 24, 26, 28, 30].includes(e + 1) &&
        (t.GF256_GENPOLY[e + 1] = r)
  }
  const e = [
    null,
    [[10, 7, 17, 13], [1, 1, 1, 1], []],
    [
      [16, 10, 28, 22],
      [1, 1, 1, 1],
      [4, 16],
    ],
    [
      [26, 15, 22, 18],
      [1, 1, 2, 2],
      [4, 20],
    ],
    [
      [18, 20, 16, 26],
      [2, 1, 4, 2],
      [4, 24],
    ],
    [
      [24, 26, 22, 18],
      [2, 1, 4, 4],
      [4, 28],
    ],
    [
      [16, 18, 28, 24],
      [4, 2, 4, 4],
      [4, 32],
    ],
    [
      [18, 20, 26, 18],
      [4, 2, 5, 6],
      [4, 20, 36],
    ],
    [
      [22, 24, 26, 22],
      [4, 2, 6, 6],
      [4, 22, 40],
    ],
    [
      [22, 30, 24, 20],
      [5, 2, 8, 8],
      [4, 24, 44],
    ],
    [
      [26, 18, 28, 24],
      [5, 4, 8, 8],
      [4, 26, 48],
    ],
    [
      [30, 20, 24, 28],
      [5, 4, 11, 8],
      [4, 28, 52],
    ],
    [
      [22, 24, 28, 26],
      [8, 4, 11, 10],
      [4, 30, 56],
    ],
    [
      [22, 26, 22, 24],
      [9, 4, 16, 12],
      [4, 32, 60],
    ],
    [
      [24, 30, 24, 20],
      [9, 4, 16, 16],
      [4, 24, 44, 64],
    ],
    [
      [24, 22, 24, 30],
      [10, 6, 18, 12],
      [4, 24, 46, 68],
    ],
    [
      [28, 24, 30, 24],
      [10, 6, 16, 17],
      [4, 24, 48, 72],
    ],
    [
      [28, 28, 28, 28],
      [11, 6, 19, 16],
      [4, 28, 52, 76],
    ],
    [
      [26, 30, 28, 28],
      [13, 6, 21, 18],
      [4, 28, 54, 80],
    ],
    [
      [26, 28, 26, 26],
      [14, 7, 25, 21],
      [4, 28, 56, 84],
    ],
    [
      [26, 28, 28, 30],
      [16, 8, 25, 20],
      [4, 32, 60, 88],
    ],
    [
      [26, 28, 30, 28],
      [17, 8, 25, 23],
      [4, 26, 48, 70, 92],
    ],
    [
      [28, 28, 24, 30],
      [17, 9, 34, 23],
      [4, 24, 48, 72, 96],
    ],
    [
      [28, 30, 30, 30],
      [18, 9, 30, 25],
      [4, 28, 52, 76, 100],
    ],
    [
      [28, 30, 30, 30],
      [20, 10, 32, 27],
      [4, 26, 52, 78, 104],
    ],
    [
      [28, 26, 30, 30],
      [21, 12, 35, 29],
      [4, 30, 56, 82, 108],
    ],
    [
      [28, 28, 30, 28],
      [23, 12, 37, 34],
      [4, 28, 56, 84, 112],
    ],
    [
      [28, 30, 30, 30],
      [25, 12, 40, 34],
      [4, 32, 60, 88, 116],
    ],
    [
      [28, 30, 30, 30],
      [26, 13, 42, 35],
      [4, 24, 48, 72, 96, 120],
    ],
    [
      [28, 30, 30, 30],
      [28, 14, 45, 38],
      [4, 28, 52, 76, 100, 124],
    ],
    [
      [28, 30, 30, 30],
      [29, 15, 48, 40],
      [4, 24, 50, 76, 102, 128],
    ],
    [
      [28, 30, 30, 30],
      [31, 16, 51, 43],
      [4, 28, 54, 80, 106, 132],
    ],
    [
      [28, 30, 30, 30],
      [33, 17, 54, 45],
      [4, 32, 58, 84, 110, 136],
    ],
    [
      [28, 30, 30, 30],
      [35, 18, 57, 48],
      [4, 28, 56, 84, 112, 140],
    ],
    [
      [28, 30, 30, 30],
      [37, 19, 60, 51],
      [4, 32, 60, 88, 116, 144],
    ],
    [
      [28, 30, 30, 30],
      [38, 19, 63, 53],
      [4, 28, 52, 76, 100, 124, 148],
    ],
    [
      [28, 30, 30, 30],
      [40, 20, 66, 56],
      [4, 22, 48, 74, 100, 126, 152],
    ],
    [
      [28, 30, 30, 30],
      [43, 21, 70, 59],
      [4, 26, 52, 78, 104, 130, 156],
    ],
    [
      [28, 30, 30, 30],
      [45, 22, 74, 62],
      [4, 30, 56, 82, 108, 134, 160],
    ],
    [
      [28, 30, 30, 30],
      [47, 24, 77, 65],
      [4, 24, 52, 80, 108, 136, 164],
    ],
    [
      [28, 30, 30, 30],
      [49, 25, 81, 68],
      [4, 28, 56, 84, 112, 140, 168],
    ],
  ]
  class s {
    constructor(t, e, s) {
      for (const t in e)
        Object.defineProperty(this, t, { enumerable: !0, value: e[t] })
      for (const t in s)
        Object.defineProperty(this, t, { writable: !0, value: s[t] })
      Object.defineProperty(this, "_image", { writable: !0, value: "" }),
        Object.defineProperty(this, "result", { writable: !0, value: "" }),
        (this.image = t)
    }
    set image(e) {
      ;(e = e.trim().toUpperCase()),
        (this._image = e),
        (this.result = ""),
        "image" === this.error && this.clearError(),
        t.IMAGE.includes(e) ||
          ((this.error = "image"), (this.errorSubcode = "3")),
        this.error ||
          (() => {
            ;({
              NONE: () => {
                this.result = ""
              },
              PNG: () => {
                const t = this.matrix,
                  e = this.matrix.length,
                  s = this.modsize,
                  r = this.margin,
                  i = s * (e + 2 * r),
                  o = document.createElement("canvas")
                let n
                if (((o.width = o.height = i), (n = o.getContext("2d")), !n))
                  return (this.error = "image"), void (this.errorSubcode = "2")
                ;(n.fillStyle = "#fff"),
                  n.fillRect(0, 0, i, i),
                  (n.fillStyle = "#000")
                for (let i = 0; i < e; ++i)
                  for (let o = 0; o < e; ++o)
                    t[i][o] && n.fillRect(s * (r + o), s * (r + i), s, s)
                this.result = o
              },
              SVG: () => {
                const t = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "svg"
                  ),
                  e = this.matrix,
                  s = this.matrix.length,
                  r = this.modsize,
                  i = this.margin,
                  o = r * (s + 2 * i),
                  n = [
                    "<style scoped>.bg{fill:#FFF}.fg{fill:#000}</style>",
                    '<rect class="bg" x="0" y="0"',
                    'width="' + o + '" height="' + o + '"/>',
                  ],
                  l = ' class= "fg" width="' + r + '" height="' + r + '"/>'
                t.setAttribute("viewBox", "0 0 " + o + " " + o),
                  t.setAttribute("style", "shape-rendering:crispEdges")
                let a = i * r
                for (let t = 0; t < s; ++t) {
                  let o = i * r
                  for (let i = 0; i < s; ++i)
                    e[t][i] && n.push('<rect x="' + o + '" y="' + a + '"', l),
                      (o += r)
                  a += r
                }
                ;(t.innerHTML = n.join("")), (this.result = t)
              },
              HTML: () => {
                const t = document.createElement("div"),
                  e = this.matrix,
                  s = this.matrix.length,
                  r = this.modsize,
                  i = [
                    '<table border="0" cellspacing="0" cellpadding="0" style="display:block; border:' +
                      r * this.margin +
                      'px solid #fff;background:#fff">',
                  ]
                for (let t = 0; t < s; ++t) {
                  i.push("<tr>")
                  for (let o = 0; o < s; ++o)
                    i.push(
                      '<td style="width:' +
                        r +
                        "px; height:" +
                        r +
                        "px" +
                        (e[t][o] ? ";background:#000" : "") +
                        '"></td>'
                    )
                  i.push("</tr>")
                }
                ;(t.className = "qrcode"),
                  (t.innerHTML = i.join("") + "</table>"),
                  (this.result = t)
              },
            })[this.image]()
          })()
    }
    get image() {
      return this._image
    }
    download(t = "", e = this.image) {
      let s = "",
        r = ""
      if (((this.image = e), this.result)) {
        switch (this.image) {
          case "PNG":
            t || (t = "qrcode.png"), (s = this.result.toDataURL())
            break
          case "SVG":
            t || (t = "qrcode.svg"),
              (s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${this.result.getAttribute(
                "viewBox"
              )} ">${this.result.innerHTML}</svg>`),
              (s = encodeURIComponent(s)),
              (r = "data:image/svg+xml;charset=utf-8")
            break
          case "HTML":
            t || (t = "qrcode.html"),
              (s = encodeURIComponent(this.result.innerHTML)),
              (r = "data:text/html;charset=utf-8")
        }
        ;((t, e, s) => {
          const r = document.createElement("a")
          e && (e += ","),
            r.setAttribute("href", `${e}${t}`),
            r.setAttribute("download", s),
            r.click()
        })(s, r, t)
      }
    }
    clearError() {
      ;(this.error = ""), (this.errorSubcode = "")
    }
  }
  class r {
    constructor(t = "", e = {}) {
      let {
        mode: s,
        eccl: r,
        version: i,
        mask: o,
        image: n,
        modsize: l,
        margin: a,
      } = {
        mode: -1,
        eccl: -1,
        version: -1,
        mask: -1,
        image: "PNG",
        modsize: -1,
        margin: -1,
        ...e,
      }
      ;(this.text = t),
        (this.mode = s),
        (this.eccl = r),
        (this._version = i),
        (this.mask = o),
        (this.image = n.trim().toUpperCase()),
        (this.modsize = l),
        (this.margin = a),
        (this.error = ""),
        (this.errorSubcode = ""),
        (this.bitsData = 0),
        (this.qtyBlocks = 0),
        (this.bytesCorrectionPerBlock = 0),
        (this.genpoly = []),
        (this.bitsFieldDataQty = 0),
        (this.positionAlignmentPatterns = []),
        (this.data = []),
        (this.codewordsData = []),
        (this.codewordsQR = []),
        (this.matrix = [])
    }
    set version(e) {
      const s = this.mode,
        r = this.eccl
      ;(this._version = e),
        t.isMode(s) &&
          t.isEccl(r) &&
          e > 0 &&
          e < 41 &&
          this.fixedInfoVersion(e, s, r)
    }
    get version() {
      return this._version
    }
    get needsVerInfo() {
      return this.version > 6
    }
    fixedInfoVersion(s, r, i) {
      ;(this.qtyBlocks = e[s][1][i]),
        (this.bytesCorrectionPerBlock = e[s][0][i]),
        (this.genpoly = t.GF256_GENPOLY[this.bytesCorrectionPerBlock]),
        (this.bitsFieldDataQty = t.bitsFieldDataQuantity(s, r)),
        (this.positionAlignmentPatterns = e[s][2]),
        (this.bitsData =
          (-8 &
            (() => {
              let t = 16 * s * s + 128 * s + 64
              const e = this.positionAlignmentPatterns.length
              return (
                e && (t -= 25 * e * e - 10 * e - 55),
                this.needsVerInfo && (t -= 36),
                t
              )
            })()) -
          8 * this.bytesCorrectionPerBlock * this.qtyBlocks)
    }
    textToData() {
      const e = this.text,
        s = this.data
      if (this.mode !== t.MODE_NUMERIC && this.mode !== t.MODE_ALPHANUMERIC)
        for (const t of e) {
          const e = t.codePointAt(0)
          if (e < 128) s.push(e)
          else {
            if (e > 2097151) {
              s.length = 0
              break
            }
            {
              const t = e < 2048 ? 1 : e < 65536 ? 2 : 3
              s.push([192, 224, 240][t - 1] | (e >> (6 * t)))
              for (let r = t; r > 0; ) s.push(128 | ((e >> (6 * --r)) & 63))
            }
          }
        }
      else this.data = e.split("")
    }
    dataToCodewords() {
      const e = this.data,
        s = e.length,
        r = this.mode,
        i = this.bitsData >> 3,
        o = this.codewordsData
      let n = 0,
        l = 8
      const a = (t, e) => {
        for (; e > 0; )
          (t &= (1 << e) - 1),
            e < l
              ? ((n |= t << (l -= e)), (e = 0))
              : ((n |= t >>> (e -= l)), o.push(n), (n = 0), (l = 8))
      }
      switch ((a(r, 4), a(s, this.bitsFieldDataQty), r)) {
        case t.MODE_NUMERIC:
          for (let t = 2; t < s; t += 3) a(+(e[t - 2] + e[t - 1] + e[t]), 10)
          const r = [0, 4, 7][s % 3]
          r && a(+((7 === r ? e[s - 2] : "") + e[s - 1]), r)
          break
        case t.MODE_ALPHANUMERIC:
          const i = t.ALPHANUMERIC_MAP
          for (let t = 1; t < s; t += 2) a(45 * i[e[t - 1]] + i[e[t]], 11)
          s % 2 && a(i[e[s - 1]], 6)
          break
        case t.MODE_OCTET:
          e.forEach((t) => a(t, 8))
      }
      for (
        (o.length < i - 1 || 8 === l) && a(t.MODE_TERMINATOR, 4),
          l < 8 && o.push(n);
        o.length + 1 < i;

      )
        o.push(236, 17)
      o.length < i && o.push(236)
    }
    makeCodewordsQR() {
      const e = this.qtyBlocks,
        s = this.codewordsData,
        r = this.genpoly,
        i = this.codewordsQR,
        o = (e, s) => {
          const r = [...e].concat(Array(s.length).fill(0))
          for (let i = 0; i < e.length; ) {
            const e = t.GF256_INV[r[i++]]
            if (e >= 0)
              for (let o = 0; o < s.length; ++o)
                r[i + o] ^= t.GF256[(s[o] + e) % 255]
          }
          return r.slice(e.length)
        },
        n = ((t, e) => {
          const s = [],
            r = (t / e) | 0,
            i = e - (t % e)
          for (let t = 0, o = 0; t < e + 1; t++)
            s.push(o), (o += r + (t < i ? 0 : 1))
          return { pos: s, qtyElementsInBlock: r, qtyBlocksWithoutAdd: i }
        })(s.length, e),
        l = []
      for (let t = 0; t < e; ++t) l.push(o(s.slice(n.pos[t], n.pos[t + 1]), r))
      for (let t = 0; t < n.qtyElementsInBlock; ++t)
        for (let r = 0; r < e; ++r) i.push(s[n.pos[r] + t])
      for (let t = n.qtyBlocksWithoutAdd; t < e; ++t)
        i.push(s[n.pos[t + 1] - 1])
      for (let t = 0; t < r.length; ++t)
        for (let s = 0; s < e; ++s) i.push(l[s][t])
    }
    makeCodewordVersion() {
      return this.needsVerInfo ? t.encodeBCH(this.version, 6, 7973, 12) : 0
    }
    makeCodewordFormat(e) {
      return 21522 ^ t.encodeBCH((this.eccl << 3) | e, 5, 1335, 10)
    }
    makeMatrix() {
      const e = this.version,
        s = this.mask < 0
      let r = s ? 0 : this.mask,
        i = t.MASKFUNCS[r]
      const o = this.positionAlignmentPatterns,
        n = this.makeCodewordVersion()
      let l = this.makeCodewordFormat(r)
      const a = this.codewordsQR,
        h = 21 + 4 * (e - 1),
        c = new Array(h),
        d = s ? new Array(h) : [],
        m = (t, e, s, r) => {
          for (let i = 0; i < r.length; ++i)
            for (let o = 0; o < s; ++o) c[e + i][t + o] = (r[i] >> o) & 1
        },
        f = (t) => {
          const e = [
              0,
              1,
              2,
              3,
              4,
              5,
              7,
              8,
              h - 7,
              h - 6,
              h - 5,
              h - 4,
              h - 3,
              h - 2,
              h - 1,
            ],
            s = [
              h - 1,
              h - 2,
              h - 3,
              h - 4,
              h - 5,
              h - 6,
              h - 7,
              h - 8,
              7,
              5,
              4,
              3,
              2,
              1,
              0,
            ]
          for (let r = 0; r < 15; ++r) c[8][s[r]] = c[e[r]][8] = (t >> r) & 1
        }
      for (let t = 0; t < h; ++t)
        (c[t] = new Array(h).fill(null)), s && (d[t] = new Array(h).fill(null))
      m(0, 0, 8, [127, 65, 93, 93, 93, 65, 127, 0]),
        m(h - 8, 0, 8, [254, 130, 186, 186, 186, 130, 254, 0]),
        m(0, h - 8, 8, [0, 127, 65, 93, 93, 93, 65, 127]),
        m(8, h - 8, 1, [1])
      for (let t = 8; t < h - 8; ++t) c[t][6] = c[6][t] = 1 & ~t
      const u = o.length
      for (let t = 0; t < u; ++t) {
        const e = 0 === t ? u - 1 : u
        for (let s = 0 === t || t === u - 1 ? 1 : 0; s < e; ++s)
          m(o[t], o[s], 5, [31, 17, 21, 17, 31])
      }
      if ((f(l), n))
        for (let t = 0, e = 0; t < 6; ++t)
          for (let s = 0; s < 3; ++s)
            c[t][h - 11 + s] = c[h - 11 + s][t] = (n >> e++) & 1
      for (let t = h - 1, e = 0, r = -1; t > -1; t -= 2) {
        6 === t && --t
        for (let o = 0; o < h; o++) {
          let n = r < 0 ? h - o - 1 : o
          for (let r = t; r > t - 2; r--)
            if (null === c[n][r]) {
              const t = (a[e >> 3] >> (7 & ~e)) & 1
              ;(c[n][r] = t ^ i(n, r)), s && (d[n][r] = t), ++e
            }
        }
        r = -r
      }
      if (s) {
        const e = (e) => {
            const s = t.MASKFUNCS[e]
            let r = this.makeCodewordFormat(e)
            f(r),
              d.forEach((t, e) => {
                t.forEach((t, r) => {
                  null !== t && (c[e][r] = t ^ s(e, r))
                })
              })
          },
          s = Array(t.MASKFUNCS.length)
            .fill(0)
            .map((t, s) => (s && e(s), this.maskTest(c)))
        ;(r = s.reduce(
          (t, e, s) => (e < t.score && ((t.mask = s), (t.score = e)), t),
          { mask: 0, score: s[0] }
        ).mask),
          e(r),
          (this.mask = r)
      }
      this.matrix = c
    }
    maskTest(e) {
      const s = e.length
      let r,
        i = 0,
        o = 0
      const n = (e) => {
        let s = 0
        for (let r = 0; r < e.length; ++r)
          e[r] >= 5 && (s += t.PENALTY.CONSECUTIVE + (e[r] - 5))
        for (let r = 5; r < e.length; r += 2)
          1 === e[r] &&
            1 === e[r - 1] &&
            3 === e[r - 2] &&
            1 === e[r - 3] &&
            1 === e[r - 4] &&
            (e[r - 5] >= 4 || e[r + 1] >= 4) &&
            (s += t.PENALTY.FINDERLIKE)
        return s
      }
      for (let l = 0; l < s; ++l) {
        const a = e[l],
          h = e[l + 1] || []
        r = []
        for (let t = 0; t < s; ) {
          let e
          for (e = 0; t < s && !a[t]; ++e) ++t
          for (r.push(e), e = 0; t < s && a[t]; ++e) ++t
          r.push(e)
        }
        ;(o += n(r)), (r = [])
        for (let t = 0; t < s; ) {
          let i
          for (i = 0; t < s && !e[t][l]; ++i) ++t
          for (r.push(i), i = 0; t < s && e[t][l]; ++i) ++t
          r.push(i)
        }
        ;(o += n(r)), (i += a[0])
        for (let e = 1; e < s; ++e)
          (i += a[e]),
            a[e] === a[e - 1] &&
              a[e] === h[e] &&
              a[e] === h[e - 1] &&
              (o += t.PENALTY.TWOBYTWO)
      }
      return (
        (o +=
          t.PENALTY.DENSITY *
          (((Math.abs((100 * i) / s / s - 50) - 1) / 5) | 0)),
        o
      )
    }
    report() {
      return new s(
        this.image,
        {
          text: this.text,
          mode: this.mode,
          eccl: this.eccl,
          version: this.version,
          mask: this.mask,
          matrix: this.matrix,
          modsize: this.modsize,
          margin: this.margin,
        },
        { error: this.error, errorSubcode: this.errorSubcode }
      )
    }
  }
  const i = (e) => {
    const s = (t, e) => ({ name: "QRoptionsError", setting: t, subcode: e }),
      r = (t) => t !== (-1 & t)
    try {
      if (
        (((t) => {
          try {
            if ("string" != typeof t) throw s("text", "1")
            if (0 === t.length) throw s("text", "2")
          } catch (t) {
            if ("QRoptionsError" === t.name) throw t
          }
        })(e.text),
        ((r, i) => {
          try {
            const o = /^\d*$/,
              n = /^[A-Z0-9 $%*+\-./:]*$/
            if ((r !== t.MODE_NUMERIC && -1 !== r) || i.replace(o, ""))
              if ((r !== t.MODE_ALPHANUMERIC && -1 !== r) || i.replace(n, "")) {
                if (r !== t.MODE_OCTET && -1 !== r) throw s("mode", "1")
                r = t.MODE_OCTET
              } else r = t.MODE_ALPHANUMERIC
            else r = t.MODE_NUMERIC
          } catch (t) {
            if ("QRoptionsError" === t.name) throw t
          } finally {
            e.mode = r
          }
        })(e.mode, e.text),
        e.textToData(),
        !e.data.length)
      )
        throw s("text", "3")
      if (e.eccl < -1 || e.eccl > 3 || r(e.eccl)) throw s("eccl", "1")
      if (
        (((i, o) => {
          const n = e.mode,
            l = (s) => (
              (e.version = s),
              e.data.length <=
                (() => {
                  const s = e.bitsData - 4 - e.bitsFieldDataQty
                  switch (n) {
                    case t.MODE_NUMERIC:
                      return (
                        3 * ((s / 10) | 0) +
                        (s % 10 < 4 ? 0 : s % 10 < 7 ? 1 : 2)
                      )
                    case t.MODE_ALPHANUMERIC:
                      return 2 * ((s / 11) | 0) + (s % 11 < 6 ? 0 : 1)
                    case t.MODE_OCTET:
                      return (s / 8) | 0
                  }
                })()
            ),
            a = (t, s, r = 0) => {
              const i = [2, 3, 0, 1]
              if (!s) return l(t)
              for (let s = r; s < 4; ++s) if (((e.eccl = i[s]), l(t))) return !0
              return !1
            }
          try {
            if (-1 === i) {
              for (o && (e.eccl = 2), i = 1; i < 41 && !l(i); ++i);
              if (i > 40 && (!o || !a(40, o, 1))) throw s("version", "1")
            } else {
              if (i < 1 || i > 40 || r(i)) throw s("version", "2")
              if (!a(i, o)) throw s("version", "3")
            }
          } catch (t) {
            if ("QRoptionsError" === t.name) throw t
          }
        })(e.version, e.eccl < 0),
        -1 !== e.mask && (e.mask < 0 || e.mask > 8 || r(e.mask)))
      )
        throw s("mask", "1")
      if (!t.IMAGE.includes(e.image)) throw s("image", "1")
      if (-1 === e.modsize) e.modsize = t.modsize
      else if (e.modsize < 1 || r(e.modsize)) throw s("modsize", "1")
      if (-1 === e.margin) e.margin = t.margin
      else if (e.margin < 0 || r(e.margin)) throw s("margin", "1")
    } catch (t) {
      ;(e.error = t.setting), (e.errorSubcode = t.subcode)
    }
  }
  window.QRCreator = (t = "", e = {}) => {
    const s = new r(t, e)
    return (
      i(s),
      s.error || (s.dataToCodewords(), s.makeCodewordsQR(), s.makeMatrix()),
      s.report()
    )
  }
})()
