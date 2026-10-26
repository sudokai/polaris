// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/vec.ts
var ORIGIN = [0, 0];
var UP = [0, 1];
var DOWN = [0, -1];
var LEFT = [-1, 0];
var RIGHT = [1, 0];
var UL = [-1, 1];
var UR = [1, 1];
var DL = [-1, -1];
var DR = [1, -1];
var add = (a, b) => [a[0] + b[0], a[1] + b[1]];
var sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
var mul = (a, k) => [a[0] * k, a[1] * k];
var dot = (a, b) => a[0] * b[0] + a[1] * b[1];
var norm = (a) => Math.hypot(a[0], a[1]);
var normalize = (a) => {
  const n = norm(a) || 1;
  return [a[0] / n, a[1] / n];
};
var lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
var rotate = (a, angle) => {
  const c = Math.cos(angle), s = Math.sin(angle);
  return [a[0] * c - a[1] * s, a[0] * s + a[1] * c];
};
var angleOf = (a) => Math.atan2(a[1], a[0]);

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/color.ts
var cache = /* @__PURE__ */ new Map();
function parseColor(hex) {
  if (hex == null || hex === "none") return null;
  let c = cache.get(hex);
  if (c) return c;
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((ch) => ch + ch).join("");
  c = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  cache.set(hex, c);
  return c;
}
var hex2 = (n) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, "0");
function toHex(rgb) {
  return "#" + hex2(rgb[0]) + hex2(rgb[1]) + hex2(rgb[2]);
}
function lerpColor(a, b, t) {
  if (a === b) return a;
  const ca = parseColor(a), cb = parseColor(b);
  if (!ca) return t < 0.5 ? a : b;
  if (!cb) return t < 0.5 ? a : b;
  return toHex([ca[0] + (cb[0] - ca[0]) * t, ca[1] + (cb[1] - ca[1]) * t, ca[2] + (cb[2] - ca[2]) * t]);
}
var WHITE = "#ffffff";
var BLACK = "#000000";
var GREY = "#888888";
var GREY_D = "#444444";
var BLUE = "#58c4dd";
var BLUE_D = "#29abca";
var TEAL = "#5cd0b3";
var GREEN = "#83c167";
var YELLOW = "#ffff00";
var GOLD = "#f0ac5f";
var RED = "#fc6255";
var MAROON = "#c55f73";
var PURPLE = "#9a72ac";
var ORANGE = "#ff862f";

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/perf.ts
var now = typeof performance !== "undefined" ? () => performance.now() : () => Date.now();
var Perf = class {
  on;
  stats;
  counters;
  stack;
  events;
  t0;
  timelineDepth;
  constructor() {
    this.on = false;
    this.reset();
  }
  reset() {
    this.stats = /* @__PURE__ */ new Map();
    this.counters = /* @__PURE__ */ new Map();
    this.stack = [];
    this.events = [];
    this.t0 = now();
  }
  enable({ timelineDepth = 2 } = {}) {
    this.reset();
    this.on = true;
    this.timelineDepth = timelineDepth;
    return this;
  }
  disable() {
    this.on = false;
    return this;
  }
  span(name, fn) {
    if (!this.on) return fn();
    const frame = { name, start: now(), child: 0 };
    this.stack.push(frame);
    try {
      return fn();
    } finally {
      this.close(frame);
    }
  }
  /** For async code: const end = perf.begin('x'); ...; end(). Not nested-safe across awaits for self time. */
  begin(name) {
    if (!this.on) return noop;
    const frame = { name, start: now(), child: 0 };
    this.stack.push(frame);
    return () => this.close(frame);
  }
  close(frame) {
    const end = now();
    const dur = end - frame.start;
    const i = this.stack.lastIndexOf(frame);
    if (i >= 0) this.stack.splice(i, 1);
    const parent = this.stack[this.stack.length - 1];
    if (parent) parent.child += dur;
    let s = this.stats.get(frame.name);
    if (!s) this.stats.set(frame.name, s = { calls: 0, total: 0, self: 0, max: 0 });
    s.calls++;
    s.total += dur;
    s.self += dur - frame.child;
    if (dur > s.max) s.max = dur;
    if (i < this.timelineDepth) {
      this.events.push({ name: frame.name, ph: "X", ts: (frame.start - this.t0) * 1e3, dur: dur * 1e3, pid: 1, tid: 1 });
    }
  }
  count(name, n = 1) {
    if (!this.on) return;
    this.counters.set(name, (this.counters.get(name) ?? 0) + n);
  }
  rows() {
    return [...this.stats].map(([name, s]) => ({ name, ...s })).sort((a, b) => b.self - a.self);
  }
  report({ top = 25 } = {}) {
    const rows = this.rows();
    const wall = rows.reduce((m, r) => Math.max(m, r.total), 0);
    const pad = (s, n) => String(s).padStart(n);
    const lines = [`${"span".padEnd(28)} ${pad("calls", 9)} ${pad("total ms", 10)} ${pad("self ms", 10)} ${pad("self %", 7)} ${pad("\xB5s/call", 9)}`];
    for (const r of rows.slice(0, top)) {
      lines.push(`${r.name.padEnd(28)} ${pad(r.calls, 9)} ${pad(r.total.toFixed(1), 10)} ${pad(r.self.toFixed(1), 10)} ${pad((100 * r.self / wall).toFixed(1), 7)} ${pad((1e3 * r.total / r.calls).toFixed(1), 9)}`);
    }
    if (this.counters.size) {
      lines.push("", "counters:");
      for (const [k, v] of [...this.counters].sort((a, b) => b[1] - a[1])) lines.push(`  ${k.padEnd(26)} ${pad(v.toLocaleString(), 14)}`);
    }
    return lines.join("\n");
  }
  chromeTrace() {
    return JSON.stringify({ traceEvents: this.events, displayTimeUnit: "ms" });
  }
};
var noop = () => {
};
var perf = new Perf();

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/mobject.ts
var nextId = 1;
var COLOR_KEYS = /* @__PURE__ */ new Set(["fill", "stroke"]);
var DEFAULT_STYLE = {
  fill: "none",
  fillOpacity: 1,
  stroke: "#ffffff",
  strokeWidth: 0.04,
  strokeOpacity: 1,
  opacity: 1
};
var Mobject = class _Mobject {
  id;
  /** A name for lookup (doc node ids); `id` stays the unique number. */
  key;
  children;
  parent;
  style;
  updaters;
  _bbox;
  constructor(style = {}) {
    this.id = nextId++;
    this.key = void 0;
    this.children = [];
    this.parent = null;
    this.style = { ...DEFAULT_STYLE, ...style };
    this.updaters = [];
    this._bbox = null;
  }
  // ---- data --------------------------------------------------------------
  /** The Float32Arrays (stride 2) a transform maps over. Subclasses override. */
  pointArrays() {
    return [];
  }
  hasPoints() {
    return this.pointArrays().some((a) => a.length > 0);
  }
  /** This mobject and every descendant, depth first. Pass `out` to append. */
  family(out = []) {
    perf.count("family()");
    out.push(this);
    for (const c of this.children) c.family(out);
    return out;
  }
  add(...mobs) {
    for (const m of mobs) {
      if (m.parent) m.parent.remove(m);
      m.parent = this;
      this.children.push(m);
    }
    this.invalidateBox();
    return this;
  }
  remove(...mobs) {
    this.children = this.children.filter((c) => !mobs.includes(c));
    for (const m of mobs) m.parent = null;
    this.invalidateBox();
    return this;
  }
  copy() {
    perf.count("copy()");
    const c = Object.create(Object.getPrototypeOf(this));
    Object.assign(c, this);
    c.id = nextId++;
    c.parent = null;
    c.style = { ...this.style };
    c.updaters = [];
    c._bbox = null;
    c.copyData(this);
    c.children = this.children.map((ch) => {
      const cc = ch.copy();
      cc.parent = c;
      return cc;
    });
    return c;
  }
  /** Deep-copy point data from `src`. Subclasses override. */
  copyData(_src) {
  }
  // ---- bounding box ------------------------------------------------------
  invalidateBox() {
    let m = this;
    while (m) {
      m._bbox = null;
      m = m.parent;
    }
  }
  /**
   * [minX, minY, maxX, maxY] over the family, or null if empty.
   * Reserved name: assigning `mob.box = ...` would shadow this and break every
   * layout call, so Mobject throws on that assignment (see the setter below).
   */
  box() {
    perf.count("box()");
    if (this._bbox) return this._bbox;
    perf.count("box() miss");
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const m of this.family()) {
      for (const a of m.pointArrays()) {
        for (let i = 0; i < a.length; i += 2) {
          const x = a[i], y = a[i + 1];
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (minX === Infinity) return null;
    return this._bbox = [minX, minY, maxX, maxY];
  }
  /** Point on the box in `direction`: ORIGIN = center, UR = upper right. */
  boxPoint(direction = ORIGIN) {
    const b = this.box();
    if (!b) return [0, 0];
    const cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2;
    const hw = (b[2] - b[0]) / 2, hh = (b[3] - b[1]) / 2;
    return [cx + direction[0] * hw, cy + direction[1] * hh];
  }
  center() {
    return this.boxPoint(ORIGIN);
  }
  width() {
    const b = this.box();
    return b ? b[2] - b[0] : 0;
  }
  height() {
    const b = this.box();
    return b ? b[3] - b[1] : 0;
  }
  top() {
    return this.boxPoint(UP);
  }
  bottom() {
    return this.boxPoint(DOWN);
  }
  left() {
    return this.boxPoint(LEFT);
  }
  right() {
    return this.boxPoint(RIGHT);
  }
  // ---- transforms --------------------------------------------------------
  /** Map `fn([x,y]) -> [x,y]` over every point, about `aboutPoint` (default: box center). */
  applyPointsFunction(fn, { aboutPoint = null, aboutEdge = ORIGIN } = {}) {
    perf.count("applyPointsFunction()");
    const about = aboutPoint ?? this.boxPoint(aboutEdge);
    for (const m of this.family()) {
      for (const a of m.pointArrays()) {
        for (let i = 0; i < a.length; i += 2) {
          const p = fn([a[i] - about[0], a[i + 1] - about[1]]);
          a[i] = p[0] + about[0];
          a[i + 1] = p[1] + about[1];
        }
      }
      m.touchPoints();
    }
    this.invalidateBox();
    for (const m of this.family()) m._bbox = null;
    return this;
  }
  /** Hook for subclasses whose derived data depends on points (e.g. Text font size). */
  afterPointsChanged() {
  }
  /**
   * Every in-place write to point arrays must end here. It bumps the points
   * version that render caches key on (array replacement is caught by array
   * identity instead). VMobject.validateCaches = true re-checks every cache
   * hit against the actual points; the test suite runs all scenes that way.
   */
  touchPoints() {
    this._pv = (this._pv ?? 0) + 1;
    this.afterPointsChanged();
  }
  /**
   * In-place affine map p -> [a c; b d](p - about) + about + [e f], with no
   * allocation per point (applyPointsFunction allocates two arrays per point).
   */
  applyAffine(a, b, c, d, e, f, { aboutPoint = null, aboutEdge = ORIGIN } = {}) {
    perf.count("applyAffine()");
    const translation = a === 1 && b === 0 && c === 0 && d === 1;
    const about = translation ? ORIGIN : aboutPoint ?? this.boxPoint(aboutEdge);
    const ox = about[0], oy = about[1];
    const family = this.family();
    for (const m of family) {
      for (const arr of m.pointArrays()) {
        if (translation) {
          for (let i = 0; i < arr.length; i += 2) {
            arr[i] += e;
            arr[i + 1] += f;
          }
        } else {
          for (let i = 0; i < arr.length; i += 2) {
            const x = arr[i] - ox, y = arr[i + 1] - oy;
            arr[i] = a * x + c * y + ox + e;
            arr[i + 1] = b * x + d * y + oy + f;
          }
        }
      }
      m.touchPoints();
    }
    let p = this.parent;
    while (p) {
      p._bbox = null;
      p = p.parent;
    }
    for (const m of family) m._bbox = null;
    return this;
  }
  shift(v) {
    return this.applyAffine(1, 0, 0, 1, v[0], v[1]);
  }
  scale(k, opts = {}) {
    return this.applyAffine(k, 0, 0, k, 0, 0, opts);
  }
  rotate(angle, opts = {}) {
    const c = Math.cos(angle), s = Math.sin(angle);
    return this.applyAffine(c, s, -s, c, 0, 0, opts);
  }
  moveTo(target, alignedEdge = ORIGIN) {
    const dest = target instanceof _Mobject ? target.boxPoint(alignedEdge) : target;
    return this.shift(sub(dest, this.boxPoint(alignedEdge)));
  }
  /** Place beside `target` in `direction` with a gap of `buff`. */
  nextTo(target, direction = RIGHT, buff = 0.25, alignedEdge = ORIGIN) {
    const anchor2 = target instanceof _Mobject ? target.boxPoint(direction) : target;
    const mine = this.boxPoint(mul(direction, -1));
    const perp = [direction[0] === 0 ? alignedEdge[0] : 0, direction[1] === 0 ? alignedEdge[1] : 0];
    const tp = target instanceof _Mobject ? target.boxPoint(perp) : anchor2;
    const mp = this.boxPoint(perp);
    const shift = add(sub(anchor2, mine), mul(direction, buff));
    if (direction[0] === 0) shift[0] = tp[0] - mp[0];
    if (direction[1] === 0) shift[1] = tp[1] - mp[1];
    return this.shift(shift);
  }
  /** Line up with `target`'s edge in `direction` (LEFT: same left edge), leaving the other axis alone. */
  alignTo(target, direction) {
    const tp = target instanceof _Mobject ? target.boxPoint(direction) : target, mp = this.boxPoint(direction);
    return this.shift([direction[0] ? tp[0] - mp[0] : 0, direction[1] ? tp[1] - mp[1] : 0]);
  }
  toEdge(direction, buff = 0.5, frame = { w: 16, h: 9 }) {
    const edge = [direction[0] * frame.w / 2, direction[1] * frame.h / 2];
    const mine = this.boxPoint(direction);
    const s = sub(edge, mine);
    if (direction[0] === 0) s[0] = 0;
    else s[0] -= direction[0] * buff;
    if (direction[1] === 0) s[1] = 0;
    else s[1] -= direction[1] * buff;
    return this.shift(s);
  }
  /**
   * Lay the children out in a row (RIGHT) or column (DOWN), `buff` apart,
   * aligned on `alignedEdge` across the row (e.g. UP for top-aligned), keeping
   * the group's center where it was.
   */
  arrange(direction = RIGHT, buff = 0.25, alignedEdge = ORIGIN) {
    const c = this.center(), kids = this.children;
    for (let i = 1; i < kids.length; i++) kids[i].nextTo(kids[i - 1], direction, buff, alignedEdge);
    return this.moveTo(c);
  }
  /**
   * Lay the children out in a grid, row-major, `cols` per row. Cells are as wide
   * as the widest child and as tall as the tallest; children sit centered in them.
   */
  arrangeInGrid(cols, { buff = 0.25, buffX = buff, buffY = buff } = {}) {
    const c = this.center(), kids = this.children;
    const cw = Math.max(...kids.map((k) => k.width())), ch = Math.max(...kids.map((k) => k.height()));
    kids.forEach((k, i) => k.moveTo([i % cols * (cw + buffX), -Math.floor(i / cols) * (ch + buffY)]));
    return this.moveTo(c);
  }
  setWidth(w, stretch = false) {
    const cur = this.width() || 1;
    return stretch ? this.stretch(w / cur, 0) : this.scale(w / cur);
  }
  setHeight(h, stretch = false) {
    const cur = this.height() || 1;
    return stretch ? this.stretch(h / cur, 1) : this.scale(h / cur);
  }
  stretch(k, axis, opts = {}) {
    return axis === 0 ? this.applyAffine(k, 0, 0, 1, 0, 0, opts) : this.applyAffine(1, 0, 0, k, 0, 0, opts);
  }
  // ---- style -------------------------------------------------------------
  setStyle(style, recurse = true) {
    const targets = recurse ? this.family() : [this];
    for (const m of targets) Object.assign(m.style, style);
    return this;
  }
  setFill(fill, fillOpacity) {
    return this.setStyle(fillOpacity == null ? { fill } : { fill, fillOpacity });
  }
  setStroke(stroke, strokeWidth, strokeOpacity) {
    const s = { stroke };
    if (strokeWidth != null) s.strokeWidth = strokeWidth;
    if (strokeOpacity != null) s.strokeOpacity = strokeOpacity;
    return this.setStyle(s);
  }
  setColor(c) {
    return this.setStyle({ fill: c, stroke: c });
  }
  setOpacity(o) {
    return this.setStyle({ opacity: o });
  }
  // ---- interpolation -----------------------------------------------------
  /**
   * Blend this mobject's data between `a` and `b` (same structure) at `alpha`.
   * `a` and `b` are the family members at this one's index, which alignment
   * may have paired with another class (a Rectangle morphing into a Text).
   */
  interpolate(a, b, alpha, pathFunc = null) {
    this.interpolateData(a, b, alpha, pathFunc);
    const mine = this.style;
    const sa = a.style, sb = b.style;
    for (const k in mine) {
      const va = sa[k], vb = sb[k];
      if (va === vb) {
        mine[k] = va;
        continue;
      }
      mine[k] = alpha <= 0 ? va : alpha >= 1 ? vb : COLOR_KEYS.has(k) ? lerpColor(va, vb, alpha) : va + (vb - va) * alpha;
    }
    this._bbox = null;
    return this;
  }
  /**
   * Blend point arrays, index by index. An array with no counterpart in `b`
   * (a path morphing into a group, which has no points of its own, or into a
   * Text, whose own array is its advance box) collapses toward b's center,
   * as in manim: the shape shrinks away while b's children grow out of the
   * null copies alignment gave this side.
   */
  interpolateData(a, b, alpha, pathFunc) {
    const mine = this.pointArrays(), pa = a.pointArrays(), pb = b.pointArrays();
    let center = null;
    for (let i = 0; i < mine.length; i++) {
      const m = mine[i], x = pa[i], y = pb[i];
      if (!y || y.length !== m.length) {
        center ??= b.box() ? b.center() : a.box() ? a.center() : [0, 0];
        for (let j = 0; j < m.length; j += 2) {
          m[j] = x[j] + (center[0] - x[j]) * alpha;
          m[j + 1] = x[j + 1] + (center[1] - x[j + 1]) * alpha;
        }
        continue;
      }
      if (pathFunc) {
        for (let j = 0; j < m.length; j += 2) {
          const p = pathFunc([x[j], x[j + 1]], [y[j], y[j + 1]], alpha);
          m[j] = p[0];
          m[j + 1] = p[1];
        }
      } else if (alpha >= 1) {
        m.set(y);
      } else if (alpha <= 0) {
        m.set(x);
      } else {
        for (let j = 0; j < m.length; j++) m[j] = x[j] + (y[j] - x[j]) * alpha;
      }
    }
    this.touchPoints();
  }
  /**
   * Make this and `other` structurally identical (same family shape, same
   * point counts) so interpolate() is well-defined. Mutates both.
   */
  alignWith(other) {
    perf.count("alignWith()");
    this.alignFamily(other);
    const fa = this.family(), fb = other.family();
    for (let i = 0; i < fa.length; i++) fa[i].alignData(fb[i]);
    return this;
  }
  alignFamily(other) {
    const n = Math.max(this.children.length, other.children.length);
    for (const [m, o] of [[this, other], [other, this]]) {
      while (m.children.length < n) {
        const src = o.children[m.children.length] ?? m;
        const nul = src.nullCopy(m.center());
        m.children.push(nul);
        nul.parent = m;
      }
    }
    for (let i = 0; i < n; i++) this.children[i].alignFamily(other.children[i]);
  }
  /** Align own point data with `other`. Subclasses override. */
  alignData(_other) {
  }
  /** A copy with all points collapsed onto `point`, and invisible. */
  nullCopy(point) {
    const c = this.copy();
    for (const m of c.family()) {
      for (const a of m.pointArrays()) for (let i = 0; i < a.length; i += 2) {
        a[i] = point[0];
        a[i + 1] = point[1];
      }
      m.style.opacity = 0;
      m.touchPoints();
    }
    return c;
  }
  // ---- updaters ----------------------------------------------------------
  addUpdater(fn) {
    this.updaters.push(fn);
    return this;
  }
  clearUpdaters() {
    this.updaters = [];
    return this;
  }
  update(dt) {
    for (const m of this.family()) for (const u of m.updaters) u(m, dt);
    return this;
  }
  // ---- animate builder ---------------------------------------------------
  /**
   * A builder that records method calls (shift, setFill, moveTo, ...) and plays
   * as a Transform to the result of applying them to a copy:
   * `this.play(box.animate.shift(RIGHT))`.
   */
  get animate() {
    const calls = [];
    const mob = this;
    const builder = {
      _isAnimateBuilder: true,
      mobject: mob,
      buildTarget() {
        const t = mob.copy();
        for (const [name, args] of calls) t[name](...args);
        return t;
      }
    };
    const proxy = new Proxy(builder, {
      get(target, prop) {
        if (prop in target) return target[prop];
        if (typeof mob[prop] === "function") {
          return (...args) => {
            calls.push([prop, args]);
            return proxy;
          };
        }
        return void 0;
      }
    });
    return proxy;
  }
};
for (const name of ["box", "center", "width", "height", "left", "right", "top", "bottom"]) {
  const method = Mobject.prototype[name];
  Object.defineProperty(Mobject.prototype, name, {
    get() {
      return method;
    },
    set() {
      throw new TypeError(`Mobject.${name} is a method; store your reference under another name (e.g. .rect, .label)`);
    }
  });
}
var Group = class extends Mobject {
  constructor(...mobs) {
    super();
    this.add(...mobs);
  }
};

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/vmobject.ts
var VMobject = class _VMobject extends Mobject {
  /** Debug: verify every path-cache hit against the real points (tests turn this on). */
  static validateCaches = false;
  subpaths;
  closed;
  /** Render record cache, owned by svg.ts. */
  _rec;
  constructor(style = {}) {
    super(style);
    this.subpaths = [];
    this.closed = [];
    this._rec = null;
    this.initPoints();
  }
  /** Subclasses build their geometry here. */
  initPoints() {
  }
  pointArrays() {
    return this.subpaths;
  }
  /** `src` is the mobject this one was copied from: same class. */
  copyData(src) {
    const s = src;
    this.subpaths = s.subpaths.map((a) => new Float32Array(a));
    this.closed = [...s.closed];
  }
  /** Points blend; a subpath's closed flag switches to the target's halfway through. */
  interpolate(a, b, alpha, pathFunc = null) {
    super.interpolate(a, b, alpha, pathFunc);
    const ac = a.closed, bc = b.closed;
    if (ac && bc && bc.length === this.closed.length) {
      const from = alpha < 0.5 ? ac : bc;
      for (let i = 0; i < this.closed.length; i++) this.closed[i] = from[i];
    }
    return this;
  }
  // ---- building ----------------------------------------------------------
  startNewPath(p) {
    this.subpaths.push(new Float32Array([p[0], p[1]]));
    this.closed.push(false);
    this.invalidateBox();
    return this;
  }
  addCubic(h1, h2, anchor2) {
    const i = this.subpaths.length - 1;
    const a = this.subpaths[i];
    const n = new Float32Array(a.length + 6);
    n.set(a);
    n.set([h1[0], h1[1], h2[0], h2[1], anchor2[0], anchor2[1]], a.length);
    this.subpaths[i] = n;
    this.invalidateBox();
    return this;
  }
  addLineTo(p) {
    const a = this.subpaths[this.subpaths.length - 1];
    const last = [a[a.length - 2], a[a.length - 1]];
    return this.addCubic(lerp(last, p, 1 / 3), lerp(last, p, 2 / 3), p);
  }
  closePath() {
    const i = this.subpaths.length - 1;
    const a = this.subpaths[i];
    const first = [a[0], a[1]], last = [a[a.length - 2], a[a.length - 1]];
    if (Math.hypot(first[0] - last[0], first[1] - last[1]) > 1e-6) this.addLineTo(first);
    this.closed[i] = true;
    return this;
  }
  /** Build a closed polygon from corner points. */
  setPolygon(points) {
    this.subpaths = [];
    this.closed = [];
    this.startNewPath(points[0]);
    for (let i = 1; i < points.length; i++) this.addLineTo(points[i]);
    return this.closePath();
  }
  // ---- geometry helpers --------------------------------------------------
  /** Curves in subpath `i`, or in the whole path. */
  numCurves(i = null) {
    if (i != null) return (this.subpaths[i].length / 2 - 1) / 3;
    return this.subpaths.reduce((s, _, j) => s + this.numCurves(j), 0);
  }
  /** Point at parameter t in [0,1] along curve `c` of subpath `i`. */
  pointOnCurve(i, c, t) {
    const a = this.subpaths[i], o = 6 * c;
    const u = 1 - t;
    const b0 = u * u * u, b1 = 3 * u * u * t, b2 = 3 * u * t * t, b3 = t * t * t;
    return [
      b0 * a[o] + b1 * a[o + 2] + b2 * a[o + 4] + b3 * a[o + 6],
      b0 * a[o + 1] + b1 * a[o + 3] + b2 * a[o + 5] + b3 * a[o + 7]
    ];
  }
  /** Approximate arc length of the whole path (polyline, 8 samples per curve). */
  arcLength() {
    let total = 0;
    for (let i = 0; i < this.subpaths.length; i++) {
      const n = this.numCurves(i);
      for (let c = 0; c < n; c++) {
        let prev2 = this.pointOnCurve(i, c, 0);
        for (let s = 1; s <= 8; s++) {
          const p = this.pointOnCurve(i, c, s / 8);
          total += Math.hypot(p[0] - prev2[0], p[1] - prev2[1]);
          prev2 = p;
        }
      }
    }
    return total;
  }
  /** Point at fraction `t` of the whole path, walking curves evenly. */
  pointFromProportion(t) {
    const n = this.numCurves();
    if (n === 0) return [0, 0];
    const f = Math.min(Math.max(t, 0), 1) * n;
    let c = Math.min(Math.floor(f), n - 1);
    const local = f - c;
    for (let i = 0; i < this.subpaths.length; i++) {
      const k = this.numCurves(i);
      if (c < k) return this.pointOnCurve(i, c, local);
      c -= k;
    }
    return [0, 0];
  }
  // ---- alignment (the core of Transform) ---------------------------------
  /**
   * Split curve `c` of `subpath` into `parts` curves of equal parameter
   * span, using de Casteljau. Returns the new Float32Array for the subpath.
   */
  static splitCurve(a, c, parts) {
    const o = 6 * c;
    const P = [[a[o], a[o + 1]], [a[o + 2], a[o + 3]], [a[o + 4], a[o + 5]], [a[o + 6], a[o + 7]]];
    const out = [];
    let cur = P;
    for (let k = 0; k < parts - 1; k++) {
      const t = 1 / (parts - k);
      const [l, r] = deCasteljau(cur, t);
      out.push(l[1], l[2], l[3]);
      cur = r;
    }
    out.push(cur[1], cur[2], cur[3]);
    const n = new Float32Array(a.length + 6 * (parts - 1));
    n.set(a.subarray(0, o + 2));
    let w = o + 2;
    for (const p of out) {
      n[w++] = p[0];
      n[w++] = p[1];
    }
    n.set(a.subarray(o + 8), w);
    return n;
  }
  /**
   * Insert `n` extra curves into subpath `i`, the same path traced by more
   * curves. Which curves get cut decides what morphs into what, so this follows
   * manim's rule (VMobject.insert_n_curves_to_point_list): cut by length, see
   * distributeCurves. test/manim.test.ts holds it to manim's own function.
   */
  insertNCurves(i, n) {
    if (n <= 0) return this;
    let a = this.subpaths[i];
    const k = this.numCurves(i);
    if (k === 0) {
      const p = [a[0], a[1]];
      const out = new Float32Array(2 * (3 * n + 1));
      for (let j = 0; j < out.length; j += 2) {
        out[j] = p[0];
        out[j + 1] = p[1];
      }
      this.subpaths[i] = out;
      return this;
    }
    const lengths = new Array(k);
    for (let c = 0; c < k; c++) lengths[c] = Math.hypot(a[6 * c + 6] - a[6 * c], a[6 * c + 7] - a[6 * c + 1]);
    const counts = distributeCurves(lengths, n);
    for (let c = k - 1; c >= 0; c--) if (counts[c] > 1) a = _VMobject.splitCurve(a, c, counts[c]);
    this.subpaths[i] = a;
    this.invalidateBox();
    return this;
  }
  /** Make this and `other` have equal subpath counts and equal curves per subpath. */
  alignData(other) {
    if (!(other instanceof _VMobject)) return;
    for (const [m, o] of [[this, other], [other, this]]) {
      while (m.subpaths.length < o.subpaths.length) {
        const src = o.subpaths[m.subpaths.length];
        const c = m.hasPoints() ? m.center() : [src[0], src[1]];
        m.subpaths.push(new Float32Array([c[0], c[1]]));
        m.closed.push(o.closed[m.subpaths.length - 1]);
      }
    }
    for (let i = 0; i < this.subpaths.length; i++) {
      const na = this.numCurves(i), nb = other.numCurves(i);
      if (na < nb) this.insertNCurves(i, nb - na);
      else if (nb < na) other.insertNCurves(i, na - nb);
    }
    this.invalidateBox();
    other.invalidateBox();
  }
  // ---- serialization -----------------------------------------------------
  /**
   * SVG path data as { d, tx, ty }: integer coordinates (units of 10^-3, the
   * viewBox matches, see svg.ts) relative to the path's first point, plus that
   * point as a translation. With relative = false, absolute coordinates and a
   * zero translation: measured faster for live DOM patching in Chromium
   * (97 vs 129 ms/s main thread), while relative is faster for string output
   * (1.1 vs 1.55 ms/frame), so each sink picks. `d` depends only on the shape, so a path that moves
   * rigidly keeps its string and only `transform` changes (two thirds of all
   * point changes in the example scenes). Still a pure function of the points:
   * output is deterministic and independent of cache history.
   *
   * Two levels of memo:
   *  - points unchanged (version + array identity): return the cached object
   *  - points changed: re-round and compare integers to the cached shape; only
   *    a real shape change formats a new string
   */
  pathData(relative = true) {
    const c = this._dCache;
    if (c && c.owner === this && c.relative === relative && c.v === this._pv && sameRefs(c.arrays, this.subpaths) && sameFlags(c.closed, this.closed)) {
      if (_VMobject.validateCaches && !samePoints(c.snapshot, this.subpaths)) {
        throw new Error(`stale path cache on ${this.constructor.name}#${this.id}: points were written in place without touchPoints()`);
      }
      perf.count("path hit");
      return c.pd;
    }
    if (!relative) {
      perf.count("path reshaped");
      const pd2 = { d: this.toPathD(), tx: 0, ty: 0 };
      this._dCache = {
        owner: this,
        relative,
        v: this._pv,
        arrays: this.subpaths.slice(),
        closed: this.closed.slice(),
        pd: pd2,
        snapshot: _VMobject.validateCaches ? this.subpaths.map((a) => a.slice()) : null
      };
      return pd2;
    }
    const { ints, lens, tx, ty } = this.roundedRelative();
    let d;
    if (c && c.owner === this && c.relative && sameInts(c.ints, ints) && sameInts(c.lens, lens) && sameFlags(c.closedAtFormat, this.closed)) {
      perf.count("path moved");
      d = c.pd.d;
    } else {
      perf.count("path reshaped");
      d = formatInts(ints, lens, this.closed);
    }
    const pd = c && c.pd.d === d && c.pd.tx === tx && c.pd.ty === ty ? c.pd : { d, tx, ty };
    this._dCache = {
      owner: this,
      relative,
      v: this._pv,
      arrays: this.subpaths.slice(),
      closed: this.closed.slice(),
      closedAtFormat: this.closed.slice(),
      ints,
      lens,
      pd,
      snapshot: _VMobject.validateCaches ? this.subpaths.map((a) => a.slice()) : null
    };
    return pd;
  }
  /** Absolute path data string (for tools and tests; rendering uses pathData). */
  toPathD() {
    const { ints, lens, tx, ty } = this.roundedRelative();
    for (let i = 0; i < ints.length; i += 2) {
      ints[i] += tx;
      ints[i + 1] += ty;
    }
    return formatInts(ints, lens, this.closed);
  }
  /**
   * Integer path coordinates for SVG. This is the one place the model's y-up
   * becomes SVG's y-down: y is negated here and nowhere else.
   */
  roundedRelative() {
    const k = 1e3;
    const first = this.subpaths.find((a) => a.length >= 2);
    const x0 = first ? first[0] : 0, y0 = first ? first[1] : 0;
    const tx = Math.round(x0 * k), ty = Math.round(-y0 * k);
    let n = 0;
    for (const a of this.subpaths) n += a.length;
    const ints = new Int32Array(n), lens = new Int32Array(this.subpaths.length);
    let w = 0;
    for (let i = 0; i < this.subpaths.length; i++) {
      const a = this.subpaths[i];
      lens[i] = a.length;
      for (let j = 0; j < a.length; j += 2) {
        ints[w++] = Math.round((a[j] - x0) * k);
        ints[w++] = Math.round((y0 - a[j + 1]) * k);
      }
    }
    return { ints, lens, tx, ty };
  }
};
function distributeCurves(lengths, n) {
  const k = lengths.length, counts = new Array(k).fill(1);
  if (n <= 0) return counts;
  let total = 0;
  for (const l of lengths) total += l;
  if (total === 0) {
    for (let j = 0; j < n; j++) counts[j % k]++;
    return counts;
  }
  const eps = 1e-6 * total;
  for (let j = 0; j < n; j++) {
    let best = 0, bestLen = -1;
    for (let c = 0; c < k; c++) {
      const l = lengths[c] / counts[c];
      if (l > bestLen + eps) {
        bestLen = l;
        best = c;
      }
    }
    counts[best]++;
  }
  return counts;
}
function formatInts(ints, lens, closed) {
  let d = "", r = 0;
  for (let i = 0; i < lens.length; i++) {
    const n = lens[i];
    if (n < 2) {
      r += n;
      continue;
    }
    d += "M" + ints[r] + " " + ints[r + 1];
    for (let j = 2; j + 5 < n; j += 6) {
      const o = r + j;
      d += "C" + ints[o] + " " + ints[o + 1] + " " + ints[o + 2] + " " + ints[o + 3] + " " + ints[o + 4] + " " + ints[o + 5];
    }
    if (closed[i]) d += "Z";
    r += n;
  }
  return d;
}
function sameInts(a, b) {
  if (!a || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
function sameRefs(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
function samePoints(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const x = a[i], y = b[i];
    if (x.length !== y.length) return false;
    for (let j = 0; j < x.length; j++) if (x[j] !== y[j]) return false;
  }
  return true;
}
function sameFlags(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}
function deCasteljau(P, t) {
  const l = (a, b) => lerp(a, b, t);
  const p01 = l(P[0], P[1]), p12 = l(P[1], P[2]), p23 = l(P[2], P[3]);
  const p012 = l(p01, p12), p123 = l(p12, p23);
  const mid = l(p012, p123);
  return [[P[0], p01, p012, mid], [mid, p123, p23, P[3]]];
}

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/shapes.ts
var Polygon = class extends VMobject {
  constructor(points, style = {}) {
    super(style);
    this.setPolygon(points);
  }
};
var Rectangle = class extends VMobject {
  constructor({ width = 4, height = 2, cornerRadius = 0, ...style } = {}) {
    super(style);
    const w = width / 2, h = height / 2, r = Math.min(cornerRadius, w, h);
    if (r <= 0) {
      this.setPolygon([[-w, h], [w, h], [w, -h], [-w, -h]]);
      return;
    }
    const k = 0.5523 * r;
    this.startNewPath([-w + r, h]);
    this.addLineTo([w - r, h]);
    this.addCubic([w - r + k, h], [w, h - r + k], [w, h - r]);
    this.addLineTo([w, -h + r]);
    this.addCubic([w, -h + r - k], [w - r + k, -h], [w - r, -h]);
    this.addLineTo([-w + r, -h]);
    this.addCubic([-w + r - k, -h], [-w, -h + r - k], [-w, -h + r]);
    this.addLineTo([-w, h - r]);
    this.addCubic([-w, h - r + k], [-w + r - k, h], [-w + r, h]);
    this.closed[0] = true;
  }
};
var Square = class extends Rectangle {
  constructor({ side = 2, ...rest } = {}) {
    super({ width: side, height: side, ...rest });
  }
};
var Circle = class extends VMobject {
  constructor({ radius = 1, ...style } = {}) {
    super(style);
    const r = radius, k = 0.5523 * r;
    this.startNewPath([r, 0]);
    this.addCubic([r, -k], [k, -r], [0, -r]);
    this.addCubic([-k, -r], [-r, -k], [-r, 0]);
    this.addCubic([-r, k], [-k, r], [0, r]);
    this.addCubic([k, r], [r, k], [r, 0]);
    this.closed[0] = true;
  }
};
var Dot = class extends Circle {
  constructor({ radius = 0.08, color: color2 = "#ffffff", ...rest } = {}) {
    super({ radius, fill: color2, stroke: "none", ...rest });
  }
};
var Line = class extends VMobject {
  constructor(start = [-1, 0], end = [1, 0], style = {}) {
    super(style);
    this.startNewPath(start);
    this.addLineTo(end);
  }
  start() {
    const a = this.subpaths[0];
    return [a[0], a[1]];
  }
  end() {
    const a = this.subpaths[0];
    return [a[a.length - 2], a[a.length - 1]];
  }
  putStartAndEndOn(start, end) {
    this.subpaths = [];
    this.closed = [];
    this.startNewPath(start);
    this.addLineTo(end);
    return this;
  }
};
var Labeled = class extends Group {
  shapeIdx;
  labelIdx;
  /** center: put the label on the shape's center */
  constructor(shape2, label2, { center = true } = {}) {
    super(...[shape2, label2].filter((m) => Boolean(m)));
    this.shapeIdx = shape2 ? 0 : -1;
    this.labelIdx = label2 ? this.children.length - 1 : -1;
    if (shape2 && label2 && center) label2.moveTo(shape2);
  }
  /** The shape, or the label when there is no shape: what arrows attach to. */
  get shape() {
    return this.children[this.shapeIdx] ?? this.label;
  }
  get label() {
    return this.children[this.labelIdx] ?? null;
  }
};
var Arrow = class extends Group {
  opts;
  constructor(start, end, { tipLength = 0.3, tipWidth = 0.22, stroke = "#ffffff", strokeWidth = 0.04, buff = 0 } = {}) {
    super();
    this.opts = { tipLength, tipWidth };
    this.add(new Line(start, end, { stroke, strokeWidth }), new Polygon([[0, 0], [0, 0], [0, 0]], { fill: stroke, stroke: "none" }));
    this.putStartAndEndOn(start, end, buff);
  }
  get line() {
    return this.children[0];
  }
  get tip() {
    return this.children[1];
  }
  putStartAndEndOn(start, end, buff = 0) {
    const dir = normalize(sub(end, start));
    const s = add(start, mul(dir, buff));
    const e = sub(end, mul(dir, buff));
    const { tipLength, tipWidth } = this.opts;
    const base = sub(e, mul(dir, tipLength));
    const perp = [dir[1], -dir[0]];
    this.line.putStartAndEndOn(s, base);
    this.tip.setPolygon([e, add(base, mul(perp, tipWidth / 2)), sub(base, mul(perp, tipWidth / 2))]);
    this.invalidateBox();
    return this;
  }
};
var Arc = class extends VMobject {
  constructor({ center = [0, 0], radius = 1, startAngle = 0, angle = Math.PI / 2, ...style } = {}) {
    super(style);
    const n = Math.max(1, Math.ceil(Math.abs(angle) / (Math.PI / 2)));
    const step = angle / n;
    const k = 4 / 3 * Math.tan(step / 4);
    const pt = (a) => [center[0] + radius * Math.cos(a), center[1] + radius * Math.sin(a)];
    this.startNewPath(pt(startAngle));
    for (let i = 0; i < n; i++) {
      const a0 = startAngle + i * step, a1 = a0 + step;
      const p0 = pt(a0), p3 = pt(a1);
      const t0 = [-Math.sin(a0), Math.cos(a0)], t1 = [-Math.sin(a1), Math.cos(a1)];
      this.addCubic(
        [p0[0] + k * radius * t0[0], p0[1] + k * radius * t0[1]],
        [p3[0] - k * radius * t1[0], p3[1] - k * radius * t1[1]],
        p3
      );
    }
  }
};
var ArcBetweenPoints = class extends Arc {
  constructor(start, end, { angle = Math.PI / 4, ...style } = {}) {
    const chord = sub(end, start), d = norm(chord);
    const radius = d / (2 * Math.sin(Math.abs(angle) / 2));
    const mid = lerp(start, end, 0.5);
    const perp = normalize([-chord[1], chord[0]]);
    const h = radius * Math.cos(Math.abs(angle) / 2) * Math.sign(angle);
    const center = add(mid, mul(perp, h));
    const startAngle = angleOf(sub(start, center));
    super({ center, radius, startAngle, angle, ...style });
  }
};
var CurvedArrow = class extends Group {
  constructor(start, end, { angle = Math.PI / 4, tipLength = 0.28, tipWidth = 0.2, stroke = "#ffffff", strokeWidth = 0.04 } = {}) {
    super();
    const arc = new ArcBetweenPoints(start, end, { angle, stroke, strokeWidth });
    const n = arc.numCurves(0);
    const pEnd = arc.pointOnCurve(0, n - 1, 1), pNear = arc.pointOnCurve(0, n - 1, 0.97);
    const dir = normalize(sub(pEnd, pNear));
    const base = sub(pEnd, mul(dir, tipLength));
    const perp = [dir[1], -dir[0]];
    const a = arc.subpaths[0];
    a[a.length - 2] = base[0];
    a[a.length - 1] = base[1];
    arc.touchPoints();
    this.add(arc, new Polygon([pEnd, add(base, mul(perp, tipWidth / 2)), sub(base, mul(perp, tipWidth / 2))], { fill: stroke, stroke: "none" }));
  }
  get arc() {
    return this.children[0];
  }
  get tip() {
    return this.children[1];
  }
};

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/vendor/glyph.js
function variants(name, spec) {
  const tags = Object.freeze(Object.keys(spec));
  for (const t of tags) {
    if (t === "match" || t === "is" || t === "tags" || t === "name") {
      throw new TypeError(`${name}: variant name "${t}" is reserved`);
    }
  }
  const ctors = {};
  for (const tag3 of tags) {
    const fields = spec[tag3];
    if (fields.includes("tag")) throw new TypeError(`${name}.${tag3}: field name "tag" is reserved`);
    if (new Set(fields).size !== fields.length) throw new TypeError(`${name}.${tag3}: duplicate field names`);
    if (fields.length === 0) {
      ctors[tag3] = Object.freeze({ tag: tag3 });
      continue;
    }
    ctors[tag3] = (...args) => {
      if (args.length !== fields.length) {
        throw new TypeError(`${name}.${tag3}: expected ${fields.length} args (${fields.join(", ")}), got ${args.length}`);
      }
      const o = { tag: tag3 };
      for (let i = 0; i < fields.length; i++) o[fields[i]] = args[i];
      return Object.freeze(o);
    };
  }
  const match = (v, cases) => {
    if (!("_" in cases)) {
      for (const t of tags) {
        if (!(t in cases)) throw new TypeError(`${name}.match: missing case ${t}`);
      }
    }
    for (const k in cases) {
      if (k !== "_" && !tags.includes(k)) throw new TypeError(`${name}.match: unknown case ${k}`);
    }
    const f = v !== null && typeof v === "object" && cases[v.tag] || cases._;
    if (!f) throw new TypeError(`${name}.match: not a ${name}: ${JSON.stringify(v)}`);
    return f(v);
  };
  const is = (v) => typeof v === "object" && v !== null && tags.includes(
    /** @type {any} */
    v.tag
  );
  return Object.freeze({ ...ctors, match, is, tags, name });
}
var ok = (value) => Object.freeze({ tag: "Ok", value });
var err = (error) => Object.freeze({ tag: "Err", error });
var some = (value) => Object.freeze({ tag: "Some", value });
var NONE = Object.freeze({ tag: "None" });
var option = (v) => v === void 0 || v === null ? NONE : some(v);
var okOr = (o, error) => o.tag === "Some" ? ok(o.value) : err(error);
var NO_EVENTS = Object.freeze(
  /** @type {never[]} */
  []
);
var VARINT = 0;
var I64 = 1;
var LEN = 2;
var tag = (field, wire) => field << 3 | wire;
var vlen32 = (v) => v < 128 ? 1 : v < 16384 ? 2 : v < 2097152 ? 3 : v < 268435456 ? 4 : 5;
var enc = new TextEncoder();
var utf8Cache = /* @__PURE__ */ new Map();
var utf8 = (s) => {
  let b = utf8Cache.get(s);
  if (!b) {
    b = enc.encode(s);
    if (utf8Cache.size > 4096) utf8Cache.clear();
    utf8Cache.set(s, b);
  }
  return b;
};
var putNanos = (b, p, us) => {
  const whole = Math.floor(us);
  const frac = Math.round((us - whole) * 1e3);
  const hiU = Math.floor(whole / 4294967296), loU = whole - hiU * 4294967296;
  const low = loU * 1e3 + frac;
  const carry = Math.floor(low / 4294967296);
  const lo = low - carry * 4294967296, hi = hiU * 1e3 + carry;
  b[p] = lo;
  b[p + 1] = lo >>> 8;
  b[p + 2] = lo >>> 16;
  b[p + 3] = lo >>> 24;
  b[p + 4] = hi;
  b[p + 5] = hi >>> 8;
  b[p + 6] = hi >>> 16;
  b[p + 7] = hi >>> 24;
};
var f64 = new Float64Array(1);
var f64b = new Uint8Array(f64.buffer);
function anySize(v) {
  if (typeof v === "string") {
    const b = utf8(v).length;
    return 1 + vlen32(b) + b;
  }
  if (typeof v === "boolean") return 2;
  if (typeof v === "number") return Number.isInteger(v) ? 1 + int64Len(v) : 9;
  let inner = 0;
  for (
    const x of
    /** @type {any[]} */
    v
  ) {
    const s = anySize(x);
    inner += 1 + vlen32(s) + s;
  }
  return 1 + vlen32(inner) + inner;
}
var int64Len = (v) => {
  if (v < 0) return 10;
  let n = 1;
  while (v >= 128) {
    v = Math.floor(v / 128);
    n++;
  }
  return n;
};
var kvSize2 = (kb, v) => {
  const a = anySize(v);
  return 1 + vlen32(kb.length) + kb.length + 1 + vlen32(a) + a;
};
var Fwd = class {
  /** @param {number} size */
  constructor(size) {
    this.b = new Uint8Array(size);
    this.p = 0;
  }
  /** @param {number} v */
  v32(v) {
    const b = this.b;
    while (v >= 128) {
      b[this.p++] = v & 127 | 128;
      v >>>= 7;
    }
    b[this.p++] = v;
  }
  /** @param {number} v */
  i64(v) {
    if (v >= 0 && v < 2147483648) {
      this.v32(v);
      return;
    }
    if (v >= 0) {
      while (v >= 128) {
        this.b[this.p++] = v % 128 | 128;
        v = Math.floor(v / 128);
      }
      this.b[this.p++] = v;
      return;
    }
    let lo = v >>> 0, hi = Math.floor(v / 4294967296) >>> 0;
    for (let i = 0; i < 9; i++) {
      this.b[this.p++] = lo & 127 | 128;
      lo = (lo >>> 7 | hi << 25) >>> 0;
      hi >>>= 7;
    }
    this.b[this.p++] = lo & 1;
  }
  /** @param {Uint8Array} x */
  raw(x) {
    const n = x.length, b = this.b;
    if (n < 32) {
      let p = this.p;
      for (let i = 0; i < n; i++) b[p++] = x[i];
      this.p = p;
    } else {
      b.set(x, this.p);
      this.p += n;
    }
  }
  /** Length-delimited bytes copied from src[off..off+n). @param {number} field @param {Uint8Array} src @param {number} off @param {number} n */
  bytesAt(field, src, off, n) {
    const b = this.b;
    let p = this.p;
    b[p++] = tag(field, LEN);
    b[p++] = n;
    for (let i = 0; i < n; i++) b[p++] = src[off + i];
    this.p = p;
  }
  /** @param {number} field @param {number} us */
  nanos(field, us) {
    this.b[this.p++] = tag(field, I64);
    putNanos(this.b, this.p, us);
    this.p += 8;
  }
  /** @param {number} lo @param {number} hi */
  fixed64(lo, hi) {
    const b = this.b, p = this.p;
    b[p] = lo;
    b[p + 1] = lo >>> 8;
    b[p + 2] = lo >>> 16;
    b[p + 3] = lo >>> 24;
    b[p + 4] = hi;
    b[p + 5] = hi >>> 8;
    b[p + 6] = hi >>> 16;
    b[p + 7] = hi >>> 24;
    this.p += 8;
  }
  /** @param {number} field @param {Uint8Array} x */
  bytes(field, x) {
    this.v32(tag(field, LEN));
    this.v32(x.length);
    this.raw(x);
  }
  /** @param {AttrValue} v */
  any(v) {
    if (typeof v === "string") return this.bytes(1, utf8(v));
    if (typeof v === "boolean") {
      this.v32(tag(2, VARINT));
      this.v32(v ? 1 : 0);
      return;
    }
    if (typeof v === "number") {
      if (Number.isInteger(v)) {
        this.v32(tag(3, VARINT));
        this.i64(v);
        return;
      }
      this.v32(tag(4, I64));
      f64[0] = v;
      this.raw(f64b);
      return;
    }
    let inner = 0;
    for (
      const x of
      /** @type {any[]} */
      v
    ) {
      const s = anySize(x);
      inner += 1 + vlen32(s) + s;
    }
    this.v32(tag(5, LEN));
    this.v32(inner);
    for (
      const x of
      /** @type {any[]} */
      v
    ) {
      this.v32(tag(1, LEN));
      this.v32(anySize(x));
      this.any(x);
    }
  }
  /** @param {number} field @param {Attr} kv */
  kv(field, kv) {
    this.kv2(field, utf8(kv[0]), kv[1]);
  }
  /** @param {number} field @param {Uint8Array} kb @param {AttrValue} v */
  kv2(field, kb, v) {
    this.v32(tag(field, LEN));
    this.v32(kvSize2(kb, v));
    this.bytes(1, kb);
    this.v32(tag(2, LEN));
    this.v32(anySize(v));
    this.any(v);
  }
};
var scratch = new Fwd(10);
var Config = variants("Config", { Noop: [], Record: ["sink", "opts"] });
var Status = variants("Status", { Unset: [], Error: ["message"] });
var noop2 = () => {
};
var NOOP_SPAN = Object.freeze({
  recording: false,
  span: (_name, a, f) => (
    /** @type {any} */
    (typeof a === "function" ? a : f)(NOOP_SPAN)
  ),
  set: noop2,
  event: noop2,
  fail: noop2
});
var NOOP_TRACER = Object.freeze({
  recording: false,
  span: NOOP_SPAN.span,
  flush: noop2,
  record: noop2,
  clock: null
});
var HEX = Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
function pooledRandomIds(words = 4096) {
  const pool = new Int32Array(words);
  let p = words;
  const next2 = () => {
    if (p === words) {
      globalThis.crypto.getRandomValues(pool);
      p = 0;
    }
    return pool[p++];
  };
  return { next: next2, trace: () => [next2(), next2(), next2(), next2()] };
}
var randomIds = Object.freeze(pooledRandomIds());
var LIMITS = Object.freeze({
  /** Font file as given (also fetchFont's download cap). */
  fileBytes: 16 << 20,
  /** Bytes produced by Brotli (WOFF2 stream) or zlib (WOFF tables): decompression bombs. */
  decompressedBytes: 64 << 20,
  /** A laid-out canvas, width × height. 2²⁵ ≈ 8192 × 4096. */
  canvasPixels: 1 << 25,
  /** Pieces one curve may be flattened into (accuracy beyond this is invisible at the canvas cap). */
  curvePieces: 256,
  /** Flattened points for one glyph instance; over it, the glyph is skipped, not the render. */
  glyphFlatPoints: 1 << 20
});
var Woff2Error = variants("Woff2Error", {
  BadSignature: ["got"],
  Truncated: ["at", "need", "have"],
  LengthMismatch: ["header", "actual"],
  BadBase128: ["at", "reason"],
  BadTransform: ["table", "reason"],
  BadLayout: ["block", "at", "expected"],
  DuplicateTable: ["table"],
  UnsupportedCollection: [],
  DecompressFailed: ["message"],
  DecompressedSize: ["expected", "actual"],
  TooLarge: ["what", "size", "limit"],
  Invariant: ["table", "reason"]
});
var Transform = variants("Transform", {
  Identity: [],
  // stored as-is
  GlyfV0: [],
  // WOFF2 glyf transform (triplet streams)
  LocaV0: [],
  // derived from glyf; zero bytes stored
  HmtxV1: []
  // lsb arrays elided
});
var KNOWN_TAGS = Object.freeze([
  "cmap",
  "head",
  "hhea",
  "hmtx",
  "maxp",
  "name",
  "OS/2",
  "post",
  "cvt ",
  "fpgm",
  "glyf",
  "loca",
  "prep",
  "CFF ",
  "VORG",
  "EBDT",
  "EBLC",
  "gasp",
  "hdmx",
  "kern",
  "LTSH",
  "PCLT",
  "VDMX",
  "vhea",
  "vmtx",
  "BASE",
  "GDEF",
  "GPOS",
  "GSUB",
  "EBSC",
  "JSTF",
  "MATH",
  "CBDT",
  "CBLC",
  "COLR",
  "CPAL",
  "SVG ",
  "sbix",
  "acnt",
  "avar",
  "bdat",
  "bloc",
  "bsln",
  "cvar",
  "fdsc",
  "feat",
  "fmtx",
  "fvar",
  "gvar",
  "hsty",
  "just",
  "lcar",
  "mort",
  "morx",
  "opbd",
  "prop",
  "trak",
  "Zapf",
  "Silf",
  "Glat",
  "Gloc",
  "Feat",
  "Sill"
]);
var SIGNATURE = 2001684018;
var tagString = (u322) => String.fromCharCode(u322 >>> 24, u322 >>> 16 & 255, u322 >>> 8 & 255, u322 & 255);
var printableTag = (t) => /^[\x20-\x7e]{4}$/.test(t) ? t : "0x" + [...t].map((ch) => ch.charCodeAt(0).toString(16).padStart(2, "0")).join("");
function cursor(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let pos = 0;
  let error = NONE;
  const fail = (e) => {
    if (error.tag === "None") error = some(e);
    return 0;
  };
  const has = (n) => {
    if (error.tag === "Some") return false;
    if (pos + n <= bytes.length) return true;
    fail(Woff2Error.Truncated(pos, n, bytes.length - pos));
    return false;
  };
  return {
    get pos() {
      return pos;
    },
    get failed() {
      return error.tag === "Some";
    },
    get error() {
      return error.tag === "Some" ? error.value : null;
    },
    fail,
    u8: () => has(1) ? bytes[pos++] : 0,
    u16: () => has(2) ? (pos += 2, dv.getUint16(pos - 2)) : 0,
    u32: () => has(4) ? (pos += 4, dv.getUint32(pos - 4)) : 0,
    /** UIntBase128 per variable_length.cc: ≤5 bytes, no leading zero, no u32 overflow. */
    base128: () => {
      const at = pos;
      let result = 0;
      for (let i = 0; i < 5; i++) {
        if (!has(1)) return 0;
        const code = bytes[pos++];
        if (i === 0 && code === 128) return fail(Woff2Error.BadBase128(at, "leading zero"));
        if (result & 4261412864) return fail(Woff2Error.BadBase128(at, "overflow"));
        result = (result << 7 | code & 127) >>> 0;
        if ((code & 128) === 0) return result;
      }
      return fail(Woff2Error.BadBase128(at, "longer than 5 bytes"));
    }
  };
}
function readContainer(bytes, span = NOOP_SPAN) {
  const c = cursor(bytes);
  const hdr = span.span("woff2.header", () => {
    const sig = c.u32();
    if (!c.failed && sig !== SIGNATURE) c.fail(Woff2Error.BadSignature(tagString(sig)));
    const flavor2 = tagString(c.u32());
    const length = c.u32();
    if (!c.failed && length !== bytes.length) c.fail(Woff2Error.LengthMismatch(length, bytes.length));
    const numTables2 = c.u16();
    c.u16();
    const totalSfntSize2 = c.u32();
    const totalCompressedSize2 = c.u32();
    c.u16();
    c.u16();
    const metaOffset2 = c.u32(), metaLength2 = c.u32();
    c.u32();
    const privOffset2 = c.u32(), privLength2 = c.u32();
    return { flavor: flavor2, numTables: numTables2, totalSfntSize: totalSfntSize2, totalCompressedSize: totalCompressedSize2, metaOffset: metaOffset2, metaLength: metaLength2, privOffset: privOffset2, privLength: privLength2 };
  });
  if (c.failed) return err(c.error);
  const { flavor, numTables, totalSfntSize, totalCompressedSize, metaOffset, metaLength, privOffset, privLength } = hdr;
  if (flavor === "ttcf") return err(Woff2Error.UnsupportedCollection);
  const { directory, expectedStream } = span.span("woff2.directory", { tables: numTables }, () => {
    const directory2 = [];
    const seen = /* @__PURE__ */ new Set();
    let expectedStream2 = 0;
    for (let i = 0; i < numTables && !c.failed; i++) {
      const flags = c.u8();
      const idx = flags & 63;
      const version = flags >>> 6;
      const tag3 = idx === 63 ? tagString(c.u32()) : KNOWN_TAGS[idx];
      if (seen.has(tag3)) {
        c.fail(Woff2Error.DuplicateTable(tag3));
        break;
      }
      seen.add(tag3);
      const origLength = c.base128();
      const isGlyfLoca = tag3 === "glyf" || tag3 === "loca";
      const transformed = isGlyfLoca ? version === 0 : version !== 0;
      let storedLength = origLength;
      let transform2 = Transform.Identity;
      if (transformed) {
        storedLength = c.base128();
        if (tag3 === "glyf") transform2 = Transform.GlyfV0;
        else if (tag3 === "loca") {
          if (storedLength !== 0) {
            c.fail(Woff2Error.BadTransform(tag3, "transformed loca must store 0 bytes"));
            break;
          }
          transform2 = Transform.LocaV0;
        } else if (tag3 === "hmtx" && version === 1) transform2 = Transform.HmtxV1;
        else {
          c.fail(Woff2Error.BadTransform(tag3, `unknown transform version ${version}`));
          break;
        }
      } else if (isGlyfLoca && version !== 3) {
        c.fail(Woff2Error.BadTransform(tag3, `reserved transform version ${version}`));
        break;
      }
      expectedStream2 += storedLength;
      directory2.push({ tag: tag3, transform: transform2, origLength, storedLength });
    }
    return { directory: directory2, expectedStream: expectedStream2 };
  });
  if (c.failed) return err(c.error);
  const glyf = option(directory.find((d) => d.tag === "glyf"));
  const loca = option(directory.find((d) => d.tag === "loca"));
  if (glyf.tag === "Some" && loca.tag === "Some" && glyf.value.transform.tag === "GlyfV0" !== (loca.value.transform.tag === "LocaV0")) {
    return err(Woff2Error.BadTransform("glyf", "glyf and loca must be transformed together"));
  }
  const start = c.pos;
  if (start + totalCompressedSize > bytes.length) {
    return err(Woff2Error.Truncated(start, totalCompressedSize, bytes.length - start));
  }
  const round4 = (n) => n + 3 & ~3;
  let end = round4(start + totalCompressedSize);
  if (metaOffset) {
    if (metaOffset !== end || metaOffset + metaLength > bytes.length) return err(Woff2Error.BadLayout("metadata", metaOffset, end));
    end = round4(metaOffset + metaLength);
  }
  if (privOffset) {
    if (privOffset !== end || privOffset + privLength > bytes.length) return err(Woff2Error.BadLayout("private data", privOffset, end));
    end = round4(privOffset + privLength);
  }
  if (end !== round4(bytes.length)) return err(Woff2Error.BadLayout("end of file", bytes.length, end));
  return ok(
    /** @type {Container} */
    {
      flavor,
      totalSfntSize,
      directory,
      compressed: bytes.subarray(start, start + totalCompressedSize),
      expectedStream
    }
  );
}
function splitTables(container, raw) {
  if (raw.length !== container.expectedStream) {
    return err(Woff2Error.DecompressedSize(container.expectedStream, raw.length));
  }
  let off = 0;
  const tables = container.directory.map((d) => {
    const data = raw.subarray(off, off + d.storedLength);
    off += d.storedLength;
    return { ...d, data };
  });
  return ok({ flavor: container.flavor, tables });
}
var u16at = (b, o) => b[o] << 8 | b[o + 1];
var u32at = (b, o) => (b[o] << 24 | b[o + 1] << 16 | b[o + 2] << 8 | b[o + 3]) >>> 0;
function checkInvariants(font) {
  const t = Object.fromEntries(font.tables.map((x) => [x.tag, x]));
  const fail = (tag3, reason) => err(Woff2Error.Invariant(tag3, reason));
  const head = t.head;
  if (!head || head.data.length < 54) return fail("head", "missing or short");
  if (u32at(head.data, 12) !== 1594834165) return fail("head", "bad magicNumber");
  const maxp = t.maxp;
  if (!maxp || maxp.data.length < 6) return fail("maxp", "missing or short");
  const numGlyphs = u16at(maxp.data, 4);
  const outlines = t.glyf ? "glyf" : t["CFF "] ? "CFF" : t.CFF2 ? "CFF2" : "none";
  const facts = { numGlyphs, outlines, unitsPerEm: u16at(head.data, 18) };
  if (t.glyf && t.glyf.transform.tag === "GlyfV0") {
    const g = t.glyf.data;
    if (g.length < 36) return fail("glyf", "transformed header truncated");
    const optionFlags = u16at(g, 2);
    const gNum = u16at(g, 4);
    if (gNum !== numGlyphs) return fail("glyf", `numGlyphs ${gNum} != maxp ${numGlyphs}`);
    let sum = 36;
    for (let i = 0; i < 7; i++) sum += u32at(g, 8 + i * 4);
    if (optionFlags & 1) sum += numGlyphs + 7 >> 3;
    if (sum > g.length) return fail("glyf", `streams need ${sum} bytes, have ${g.length}`);
    facts.glyfStreamsExact = sum === g.length;
    facts.indexFormat = u16at(g, 6);
    const loca = t.loca;
    const want = (numGlyphs + 1) * (facts.indexFormat ? 4 : 2);
    if (loca && loca.origLength !== want) return fail("loca", `origLength ${loca.origLength}, reconstructs to ${want}`);
  }
  if (t["CFF "]) {
    const c = t["CFF "].data;
    if (c.length < 4 || c[0] !== 1) return fail("CFF ", `expected CFF major version 1, got ${c[0]}`);
  }
  if (font.flavor === "OTTO" && outlines !== "CFF" && outlines !== "CFF2") return fail("flavor", "OTTO without CFF");
  if (font.flavor === "\0\0\0" && outlines !== "glyf") return fail("flavor", "TrueType flavor without glyf");
  return ok(facts);
}
async function decodeWoff2(bytes, { decompress, span = NOOP_SPAN }) {
  return span.span("woff2.decode", { bytes: bytes.length }, async (s) => {
    const c = s.span("woff2.container", (cs) => {
      const r = readContainer(bytes, cs);
      if (r.tag === "Ok") {
        cs.set("tables", r.value.directory.length);
        cs.set("flavor", printableTag(r.value.flavor));
        cs.set("compressed", r.value.compressed.length);
      } else cs.fail(r.error.tag);
      return r;
    });
    if (c.tag === "Err") return c;
    const container = c.value;
    if (container.expectedStream > LIMITS.decompressedBytes) return err(Woff2Error.TooLarge("stream", container.expectedStream, LIMITS.decompressedBytes));
    const raw = await s.span("woff2.brotli", { in: container.compressed.length }, async (bs) => {
      const out = await decompress(container.compressed, bs, container.expectedStream);
      if (out.tag === "Err") {
        bs.fail(out.error);
        return err(Woff2Error.DecompressFailed(out.error));
      }
      bs.set("out", out.value.length);
      return out;
    });
    if (raw.tag === "Err") return raw;
    const font = s.span("woff2.split", () => splitTables(container, raw.value));
    if (font.tag === "Err") {
      s.fail(font.error.tag);
      return font;
    }
    const facts = s.span("woff2.invariants", (is) => {
      const r = checkInvariants(font.value);
      if (r.tag === "Ok") for (const k in r.value) is.set(k, r.value[k]);
      else is.fail(`${r.error.tag}: ${r.error.tag === "Invariant" ? r.error.reason : ""}`);
      return r;
    });
    if (facts.tag === "Err") return facts;
    return ok({ ...font.value, facts: facts.value });
  });
}
var freshFault = () => ({ at: -1, need: 0, len: 0, count: 0, reads: 0, why: "" });
var READ_BUDGET = 1 << 24;
var ROOT = freshFault();
var scope = ROOT;
var view = (bytes) => ({ bytes, dv: new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength) });
var EMPTY = view(new Uint8Array(0));
var inRange = (v, o, n) => {
  if (++scope.reads > READ_BUDGET && scope !== ROOT) {
    if (scope.at < 0) {
      scope.at = o;
      scope.need = n;
      scope.len = v.bytes.length;
      scope.why = "read budget";
    }
    scope.count++;
    return false;
  }
  if (o >= 0 && o + n <= v.bytes.length && Number.isInteger(o)) return true;
  if (scope.at < 0) {
    scope.at = o;
    scope.need = n;
    scope.len = v.bytes.length;
    scope.why = "out of range";
  }
  scope.count++;
  return false;
};
var u8 = (v, o) => inRange(v, o, 1) ? v.bytes[o] : 0;
var i8 = (v, o) => inRange(v, o, 1) ? v.dv.getInt8(o) : 0;
var u16 = (v, o) => inRange(v, o, 2) ? v.dv.getUint16(o) : 0;
var i16 = (v, o) => inRange(v, o, 2) ? v.dv.getInt16(o) : 0;
var u32 = (v, o) => inRange(v, o, 4) ? v.dv.getUint32(o) : 0;
var i32 = (v, o) => inRange(v, o, 4) ? v.dv.getInt32(o) : 0;
var f2dot14 = (v, o) => i16(v, o) / 16384;
var tag2 = (v, o) => inRange(v, o, 4) ? String.fromCharCode(v.bytes[o], v.bytes[o + 1], v.bytes[o + 2], v.bytes[o + 3]) : "\0\0\0\0";
var slice = (v, o, n) => inRange(v, o, n) ? view(v.bytes.subarray(o, o + n)) : EMPTY;
var fits = (v, o, n) => inRange(v, o, n);
var times = (n, f) => {
  const out = [];
  for (let i = 0; i < n && scope.at < 0; i++) out.push(f(i));
  return out;
};
var guard = (f, onFault) => {
  const outer = scope, mine = freshFault();
  scope = mine;
  let value;
  try {
    value = f();
  } finally {
    scope = outer;
  }
  return mine.at >= 0 ? { tag: "Err", error: onFault(mine) } : { tag: "Ok", value };
};
var Glyph = variants("Glyph", {
  Empty: [],
  // endPts: last point index of each contour. on: 1 = on-curve.
  Simple: ["endPts", "xs", "ys", "on", "bbox", "instructions"],
  Composite: ["components", "bbox", "instructions"]
});
var Offset = variants("Offset", { XY: ["dx", "dy"], Anchor: ["parent", "child"] });
var GlyfError = variants("GlyfError", {
  Truncated: ["glyph", "at"],
  BadLoca: ["glyph", "start", "end"],
  Cycle: ["glyph"],
  TooDeep: ["glyph"],
  BadAnchor: ["glyph", "point"],
  TooComplex: ["glyph", "what", "limit"],
  BadContours: ["glyph", "contour"]
});
var COMPOSITE = Object.freeze({
  ARG_1_AND_2_ARE_WORDS: 1,
  ARGS_ARE_XY_VALUES: 2,
  ROUND_XY_TO_GRID: 4,
  WE_HAVE_A_SCALE: 8,
  MORE_COMPONENTS: 32,
  WE_HAVE_AN_X_AND_Y_SCALE: 64,
  WE_HAVE_A_TWO_BY_TWO: 128,
  WE_HAVE_INSTRUCTIONS: 256,
  USE_MY_METRICS: 512,
  SCALED_COMPONENT_OFFSET: 2048
});
function parseComponents(v, o) {
  const C = COMPOSITE;
  const components = [];
  let flags = C.MORE_COMPONENTS;
  let hasInstructions = false;
  while (flags & C.MORE_COMPONENTS) {
    flags = u16(v, o);
    const glyph = u16(v, o + 2);
    o += 4;
    hasInstructions ||= (flags & C.WE_HAVE_INSTRUCTIONS) !== 0;
    const words = (flags & C.ARG_1_AND_2_ARE_WORDS) !== 0;
    const xy = (flags & C.ARGS_ARE_XY_VALUES) !== 0;
    let a1, a2;
    if (words) {
      a1 = xy ? i16(v, o) : u16(v, o);
      a2 = xy ? i16(v, o + 2) : u16(v, o + 2);
      o += 4;
    } else {
      a1 = xy ? i8(v, o) : u8(v, o);
      a2 = xy ? i8(v, o + 1) : u8(v, o + 1);
      o += 2;
    }
    let matrix = [1, 0, 0, 1];
    if (flags & C.WE_HAVE_A_SCALE) {
      const s = f2dot14(v, o);
      matrix = [s, 0, 0, s];
      o += 2;
    } else if (flags & C.WE_HAVE_AN_X_AND_Y_SCALE) {
      matrix = [f2dot14(v, o), 0, 0, f2dot14(v, o + 2)];
      o += 4;
    } else if (flags & C.WE_HAVE_A_TWO_BY_TWO) {
      matrix = [f2dot14(v, o), f2dot14(v, o + 2), f2dot14(v, o + 4), f2dot14(v, o + 6)];
      o += 8;
    }
    components.push({ glyph, flags, offset: xy ? Offset.XY(a1, a2) : Offset.Anchor(a1, a2), matrix });
  }
  return { components, end: o, hasInstructions };
}
function skipComponents(v, o) {
  const C = COMPOSITE;
  let flags = C.MORE_COMPONENTS;
  let hasInstructions = false;
  while (flags & C.MORE_COMPONENTS) {
    flags = u16(v, o);
    hasInstructions ||= (flags & C.WE_HAVE_INSTRUCTIONS) !== 0;
    o += 4 + (flags & C.ARG_1_AND_2_ARE_WORDS ? 4 : 2) + (flags & C.WE_HAVE_A_SCALE ? 2 : flags & C.WE_HAVE_AN_X_AND_Y_SCALE ? 4 : flags & C.WE_HAVE_A_TWO_BY_TWO ? 8 : 0);
    u8(v, o - 1);
  }
  return { end: o, hasInstructions };
}
function parseSimplePoints(v, o, nPoints) {
  const flags = new Uint8Array(nPoints);
  for (let i = 0; i < nPoints; ) {
    const f = u8(v, o++);
    flags[i++] = f;
    if (f & 8) {
      const r = u8(v, o++);
      for (let k = 0; k < r && i < nPoints; k++) flags[i++] = f;
    }
  }
  const coords = (short, same) => {
    const out = new Int32Array(nPoints);
    let c = 0;
    for (let i = 0; i < nPoints; i++) {
      const f = flags[i];
      if (f & short) c += (f & same ? 1 : -1) * u8(v, o++);
      else if (!(f & same)) {
        c += i16(v, o);
        o += 2;
      }
      out[i] = c;
    }
    return out;
  };
  const xs = coords(2, 16);
  const ys = coords(4, 32);
  const on = flags.map((f) => f & 1);
  return { xs, ys, on, end: o };
}
function parseGlyfTable(glyf, loca, numGlyphs, indexToLocFormat) {
  const gv = view(glyf);
  const lv = view(loca);
  const locaAt = (i) => indexToLocFormat === 0 ? u16(lv, i * 2) * 2 : u32(lv, i * 4);
  const glyphs = [];
  for (let g = 0; g < numGlyphs; g++) {
    const r = guard(() => {
      const start = locaAt(g), end = locaAt(g + 1);
      if (end < start || end > glyf.length) return (
        /** @type {const} */
        { bad: [start, end] }
      );
      if (end === start) return Glyph.Empty;
      const n = i16(gv, start);
      const bbox = [i16(gv, start + 2), i16(gv, start + 4), i16(gv, start + 6), i16(gv, start + 8)];
      if (n >= 0) {
        const endPts = times(n, (k) => u16(gv, start + 10 + k * 2));
        for (let k = 1; k < n; k++) if (endPts[k] <= endPts[k - 1]) return (
          /** @type {const} */
          { contours: k }
        );
        const il = u16(gv, start + 10 + n * 2);
        const nPoints = n === 0 ? 0 : endPts[n - 1] + 1;
        const { xs, ys, on } = parseSimplePoints(gv, start + 12 + n * 2 + il, nPoints);
        return Glyph.Simple(endPts, xs, ys, on, bbox, il);
      }
      const { components, end: cEnd, hasInstructions } = parseComponents(gv, start + 10);
      return Glyph.Composite(components, bbox, hasInstructions ? u16(gv, cEnd) : 0);
    }, (e) => GlyfError.Truncated(g, e.at));
    if (r.tag === "Err") return r;
    if ("bad" in r.value && r.value.bad) return err(GlyfError.BadLoca(g, r.value.bad[0], r.value.bad[1]));
    if ("contours" in r.value) return err(GlyfError.BadContours(g, r.value.contours));
    glyphs.push(r.value);
  }
  return ok(glyphs);
}
var MAX_DEPTH = 16;
var MAX_POINTS = 65535;
var MAX_VISITS = 4096;
function resolvePoints(glyphs, gid) {
  const get = typeof glyphs === "function" ? glyphs : (g) => g >= 0 && g < glyphs.length ? ok(glyphs[g]) : err(GlyfError.Truncated(g, -1));
  let visits = 0;
  const go = (g, depth, path) => {
    if (depth > MAX_DEPTH) return err(GlyfError.TooDeep(gid));
    if (++visits > MAX_VISITS) return err(GlyfError.TooComplex(gid, "component visits", MAX_VISITS));
    if (path.has(g)) return err(GlyfError.Cycle(g));
    const got = get(g);
    if (got.tag === "Err") return got;
    return Glyph.match(got.value, {
      Empty: () => ok({ xs: new Float64Array(0), ys: new Float64Array(0), on: new Uint8Array(0), endPts: [] }),
      Simple: (sg) => ok({ xs: Float64Array.from(sg.xs), ys: Float64Array.from(sg.ys), on: sg.on, endPts: sg.endPts }),
      Composite: (c) => {
        const next2 = new Set(path).add(g);
        let acc = { xs: new Float64Array(0), ys: new Float64Array(0), on: new Uint8Array(0), endPts: [] };
        for (
          const comp of
          /** @type {Component[]} */
          c.components
        ) {
          const sub2 = go(comp.glyph, depth + 1, next2);
          if (sub2.tag === "Err") return sub2;
          const child = sub2.value;
          const [a, b, cc, d] = comp.matrix;
          const n = child.xs.length;
          if (acc.xs.length + n > MAX_POINTS) return err(GlyfError.TooComplex(gid, "points", MAX_POINTS));
          const xs = new Float64Array(n), ys = new Float64Array(n);
          for (let i = 0; i < n; i++) {
            xs[i] = a * child.xs[i] + cc * child.ys[i];
            ys[i] = b * child.xs[i] + d * child.ys[i];
          }
          let delta;
          if (comp.offset.tag === "Anchor") {
            const o = comp.offset;
            if (o.parent >= acc.xs.length || o.child >= n) return err(GlyfError.BadAnchor(g, o.parent));
            delta = [acc.xs[o.parent] - xs[o.child], acc.ys[o.parent] - ys[o.child]];
          } else {
            const o = comp.offset;
            delta = comp.flags & COMPOSITE.SCALED_COMPONENT_OFFSET ? [a * o.dx + cc * o.dy, b * o.dx + d * o.dy] : [o.dx, o.dy];
          }
          for (let i = 0; i < n; i++) {
            xs[i] += delta[0];
            ys[i] += delta[1];
          }
          acc = concatPoints(acc, { xs, ys, on: child.on, endPts: child.endPts });
        }
        return ok(acc);
      }
    });
  };
  return go(gid, 0, /* @__PURE__ */ new Set());
}
function concatPoints(a, b) {
  const n = a.xs.length;
  const xs = new Float64Array(n + b.xs.length);
  xs.set(a.xs);
  xs.set(b.xs, n);
  const ys = new Float64Array(n + b.ys.length);
  ys.set(a.ys);
  ys.set(b.ys, n);
  const on = new Uint8Array(n + b.on.length);
  on.set(a.on);
  on.set(b.on, n);
  return { xs, ys, on, endPts: [...a.endPts, ...b.endPts.map((e) => e + n)] };
}
var GlyfTransformError = variants("GlyfTransformError", {
  Truncated: ["stream", "at"],
  StreamsOverflow: ["need", "have"],
  CompositeWithoutBbox: ["glyph"],
  EmptyWithBbox: ["glyph"],
  NumGlyphs: ["header", "expected"]
});
var STREAMS = (
  /** @type {const} */
  ["nContour", "nPoints", "flag", "glyph", "composite", "bbox", "instruction"]
);
var noOverrun = () => (
  /** @type {Overrun} */
  { stream: "", at: -1 }
);
function stream(bytes, name, rec) {
  const v = view(bytes);
  let pos = 0;
  const take = (n) => {
    if (pos + n > bytes.length && rec.at < 0) {
      rec.stream = name;
      rec.at = pos;
    }
    const at = pos;
    pos += n;
    return at;
  };
  return {
    get pos() {
      return pos;
    },
    u8: () => u8(v, take(1)),
    u16: () => u16(v, take(2)),
    i16: () => i16(v, take(2)),
    bytes: (n) => bytes.subarray(take(n), pos),
    seek: (p) => {
      pos = p;
    },
    /** 255UInt16 (MicroType Express §6.1.1; variable_length.cc Read255UShort). */
    u255: () => {
      const code = u8(v, take(1));
      if (code === 253) return u16(v, take(2));
      if (code === 255) return u8(v, take(1)) + 253;
      if (code === 254) return u8(v, take(1)) + 253 * 2;
      return code;
    },
    view: v,
    skip: (n) => {
      take(n);
    }
  };
}
var withSign = (flag, base) => flag & 1 ? base : -base;
function decodeTriplets(flags, glyph) {
  const n = flags.length;
  const xs = new Int32Array(n), ys = new Int32Array(n), on = new Uint8Array(n);
  let x = 0, y = 0;
  for (let i = 0; i < n; i++) {
    const f = flags[i] & 127;
    on[i] = flags[i] >> 7 ? 0 : 1;
    let dx, dy;
    if (f < 10) {
      dx = 0;
      dy = withSign(f, ((f & 14) << 7) + glyph.u8());
    } else if (f < 20) {
      dx = withSign(f, ((f - 10 & 14) << 7) + glyph.u8());
      dy = 0;
    } else if (f < 84) {
      const b0 = f - 20, b1 = glyph.u8();
      dx = withSign(f, 1 + (b0 & 48) + (b1 >> 4));
      dy = withSign(f >> 1, 1 + ((b0 & 12) << 2) + (b1 & 15));
    } else if (f < 120) {
      const b0 = f - 84, b1 = glyph.u8(), b2 = glyph.u8();
      dx = withSign(f, 1 + (Math.floor(b0 / 12) << 8) + b1);
      dy = withSign(f >> 1, 1 + (b0 % 12 >> 2 << 8) + b2);
    } else if (f < 124) {
      const b1 = glyph.u8(), b2 = glyph.u8(), b3 = glyph.u8();
      dx = withSign(f, (b1 << 4) + (b2 >> 4));
      dy = withSign(f >> 1, ((b2 & 15) << 8) + b3);
    } else {
      const b1 = glyph.u8(), b2 = glyph.u8(), b3 = glyph.u8(), b4 = glyph.u8();
      dx = withSign(f, (b1 << 8) + b2);
      dy = withSign(f >> 1, (b3 << 8) + b4);
    }
    x += dx;
    y += dy;
    xs[i] = x;
    ys[i] = y;
  }
  return { xs, ys, on };
}
var computeBbox = (xs, ys) => {
  if (xs.length === 0) return [0, 0, 0, 0];
  let x0 = xs[0], y0 = ys[0], x1 = xs[0], y1 = ys[0];
  for (let i = 1; i < xs.length; i++) {
    if (xs[i] < x0) x0 = xs[i];
    if (xs[i] > x1) x1 = xs[i];
    if (ys[i] < y0) y0 = ys[i];
    if (ys[i] > y1) y1 = ys[i];
  }
  return [x0, y0, x1, y1];
};
function decodeOne(s, g, nContours, hasBbox) {
  if (nContours === -1) {
    if (!hasBbox) return err(GlyfTransformError.CompositeWithoutBbox(g));
    const bbox = [s.bbox.i16(), s.bbox.i16(), s.bbox.i16(), s.bbox.i16()];
    const start = s.composite.pos;
    const { components, end, hasInstructions } = parseComponents(s.composite.view, start);
    s.composite.skip(end - start);
    let instructions = 0;
    if (hasInstructions) {
      instructions = s.glyph.u255();
      s.instruction.skip(instructions);
    }
    return ok(Glyph.Composite(components, bbox, instructions));
  }
  if (nContours > 0) {
    const endPts = [];
    let total = 0;
    for (let c = 0; c < nContours; c++) {
      total += s.nPoints.u255();
      endPts.push(total - 1);
    }
    const flags = s.flag.bytes(total);
    const { xs, ys, on } = decodeTriplets(flags, s.glyph);
    const instructions = s.glyph.u255();
    s.instruction.skip(instructions);
    const bbox = hasBbox ? [s.bbox.i16(), s.bbox.i16(), s.bbox.i16(), s.bbox.i16()] : computeBbox(xs, ys);
    return ok(Glyph.Simple(endPts, xs, ys, on, bbox, instructions));
  }
  if (nContours === 0) return hasBbox ? err(GlyfTransformError.EmptyWithBbox(g)) : ok(Glyph.Empty);
  return err(GlyfTransformError.Truncated("nContour", g));
}
var TRIPLET_BYTES = Uint8Array.from({ length: 128 }, (_, f) => f < 84 ? 1 : f < 120 ? 2 : f < 124 ? 3 : 4);
function splitStreams(data, numGlyphsMaxp, span) {
  const header = span.span("glyf.header", () => guard(() => {
    const v = view(data);
    const optionFlags2 = u16(v, 2);
    const numGlyphs2 = u16(v, 4);
    const indexFormat2 = u16(v, 6);
    const sizes2 = STREAMS.map((_, i) => u32(v, 8 + i * 4));
    return { optionFlags: optionFlags2, numGlyphs: numGlyphs2, indexFormat: indexFormat2, sizes: sizes2 };
  }, (e) => GlyfTransformError.Truncated("header", e.at)));
  if (header.tag === "Err") return header;
  const { optionFlags, numGlyphs, indexFormat, sizes } = header.value;
  if (numGlyphs !== numGlyphsMaxp) return err(GlyfTransformError.NumGlyphs(numGlyphs, numGlyphsMaxp));
  let off = 8 + STREAMS.length * 4;
  const raw = {};
  for (let i = 0; i < STREAMS.length; i++) {
    if (off + sizes[i] > data.length) return err(GlyfTransformError.StreamsOverflow(off + sizes[i], data.length));
    raw[STREAMS[i]] = data.subarray(off, off + sizes[i]);
    off += sizes[i];
  }
  let overlap = NONE;
  if (optionFlags & 1) {
    const len2 = numGlyphs + 7 >> 3;
    if (off + len2 > data.length) return err(GlyfTransformError.StreamsOverflow(off + len2, data.length));
    overlap = some(data.subarray(off, off + len2));
  }
  return ok({ numGlyphs, indexFormat, raw, overlap });
}
var settle = (rec, r) => {
  if (rec.at >= 0) return err(GlyfTransformError.Truncated(rec.stream, rec.at));
  if (r.tag === "Err") return err(GlyfTransformError.Truncated("composite", r.error.at));
  return r;
};
function indexGlyfV0(data, numGlyphsMaxp, span = NOOP_SPAN) {
  const split = splitStreams(data, numGlyphsMaxp, span);
  if (split.tag === "Err") return split;
  const { numGlyphs, indexFormat, raw, overlap } = split.value;
  const rec = noOverrun();
  const indexed = settle(rec, guard(() => span.span("glyf.index", { atomic: true, items: numGlyphs }, () => {
    const nc2 = view(raw.nContour), cv = view(raw.composite);
    const np255 = stream(raw.nPoints, "nPoints", rec), gl = stream(raw.glyph, "glyph", rec);
    const bboxLen = numGlyphs + 31 >> 5 << 2;
    if (bboxLen > raw.bbox.length) return err(GlyfTransformError.Truncated("bbox", 0));
    const bitmap2 = raw.bbox.subarray(0, bboxLen);
    const flags = raw.flag;
    const pos2 = new Int32Array(numGlyphs * 6);
    let fc = 0, cc = 0, bc = bboxLen, ic = 0;
    for (let g = 0; g < numGlyphs; g++) {
      const hasBbox = (bitmap2[g >> 3] & 128 >> (g & 7)) !== 0;
      const n = i16(nc2, g * 2);
      const o = g * 6;
      pos2[o] = np255.pos;
      pos2[o + 1] = fc;
      pos2[o + 2] = gl.pos;
      pos2[o + 3] = cc;
      pos2[o + 4] = bc;
      pos2[o + 5] = ic;
      if (n === -1) {
        if (!hasBbox) return err(GlyfTransformError.CompositeWithoutBbox(g));
        const { end, hasInstructions } = skipComponents(cv, cc);
        cc = end;
        if (hasInstructions) ic += gl.u255();
      } else if (n > 0) {
        let total = 0;
        for (let c = 0; c < n; c++) total += np255.u255();
        if (fc + total > flags.length) return err(GlyfTransformError.Truncated("flag", fc));
        let tb = 0;
        for (let i = fc; i < fc + total; i++) tb += TRIPLET_BYTES[flags[i] & 127];
        fc += total;
        gl.skip(tb);
        ic += gl.u255();
      } else if (n === 0) {
        if (hasBbox) return err(GlyfTransformError.EmptyWithBbox(g));
      } else return err(GlyfTransformError.Truncated("nContour", g));
      if (hasBbox) bc += 8;
      if (rec.at >= 0) break;
    }
    if (bc > raw.bbox.length) return err(GlyfTransformError.Truncated("bbox", bc));
    if (ic > raw.instruction.length) return err(GlyfTransformError.Truncated("instruction", ic));
    return ok({ pos: pos2, nc: nc2, bitmap: bitmap2 });
  }), (f) => f));
  if (indexed.tag === "Err") return indexed;
  if (indexed.value.tag === "Err") return indexed.value;
  const { pos, nc, bitmap } = indexed.value.value;
  const memo2 = /* @__PURE__ */ new Map();
  const glyph = (g) => {
    const hit = memo2.get(g);
    if (hit) return hit;
    if (!(g >= 0 && g < numGlyphs)) return err(GlyfTransformError.Truncated("nContour", g));
    const grec = noOverrun();
    const s = Object.fromEntries(STREAMS.map((k) => [k, stream(raw[k], k, grec)]));
    const o = g * 6;
    s.nPoints.seek(pos[o]);
    s.flag.seek(pos[o + 1]);
    s.glyph.seek(pos[o + 2]);
    s.composite.seek(pos[o + 3]);
    s.bbox.seek(pos[o + 4]);
    s.instruction.seek(pos[o + 5]);
    const r = settle(grec, guard(() => decodeOne(s, g, i16(nc, g * 2), (bitmap[g >> 3] & 128 >> (g & 7)) !== 0), (f) => f));
    const out = r.tag === "Err" ? r : r.value;
    memo2.set(g, out);
    return out;
  };
  return ok({ glyph, numGlyphs, indexFormat, overlap });
}
function reconstructHmtx(data, numGlyphs, numHMetrics, xMin) {
  const bad = (why) => err(Woff2Error.BadTransform("hmtx", why));
  if (data.length < 1) return bad("empty");
  const flags = data[0];
  if (flags & 252) return bad(`reserved flag bits 0x${flags.toString(16)}`);
  const hasProportional = (flags & 1) === 0, hasMonospace = (flags & 2) === 0;
  if (hasProportional && hasMonospace) return bad("flags omit nothing");
  if (numHMetrics < 1 || numHMetrics > numGlyphs) return bad(`numberOfHMetrics ${numHMetrics} with ${numGlyphs} glyphs`);
  const need = 1 + 2 * numHMetrics + (hasProportional ? 2 * numHMetrics : 0) + (hasMonospace ? 2 * (numGlyphs - numHMetrics) : 0);
  if (data.length < need) return bad(`needs ${need} bytes, has ${data.length}`);
  const src = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const out = new Uint8Array(4 * numHMetrics + 2 * (numGlyphs - numHMetrics));
  const dst = new DataView(out.buffer);
  let o = 1;
  for (let i = 0; i < numHMetrics; i++, o += 2) dst.setUint16(4 * i, src.getUint16(o));
  for (let i = 0; i < numHMetrics; i++) {
    const lsb = hasProportional ? src.getInt16(o) : xMin(i);
    if (hasProportional) o += 2;
    dst.setInt16(4 * i + 2, lsb);
  }
  for (let i = numHMetrics; i < numGlyphs; i++) {
    const lsb = hasMonospace ? src.getInt16(o) : xMin(i);
    if (hasMonospace) o += 2;
    dst.setInt16(4 * numHMetrics + 2 * (i - numHMetrics), lsb);
  }
  return ok(out);
}
var DICTIONARY_BASE64 = "dGltZWRvd25saWZlbGVmdGJhY2tjb2RlZGF0YXNob3dvbmx5c2l0ZWNpdHlvcGVuanVzdGxpa2VmcmVld29ya3RleHR5ZWFyb3ZlcmJvZHlsb3ZlZm9ybWJvb2twbGF5bGl2ZWxpbmVoZWxwaG9tZXNpZGVtb3Jld29yZGxvbmd0aGVtdmlld2ZpbmRwYWdlZGF5c2Z1bGxoZWFkdGVybWVhY2hhcmVhZnJvbXRydWVtYXJrYWJsZXVwb25oaWdoZGF0ZWxhbmRuZXdzZXZlbm5leHRjYXNlYm90aHBvc3R1c2VkbWFkZWhhbmRoZXJld2hhdG5hbWVMaW5rYmxvZ3NpemViYXNlaGVsZG1ha2VtYWludXNlcicpICtob2xkZW5kc3dpdGhOZXdzcmVhZHdlcmVzaWdudGFrZWhhdmVnYW1lc2VlbmNhbGxwYXRod2VsbHBsdXNtZW51ZmlsbXBhcnRqb2ludGhpc2xpc3Rnb29kbmVlZHdheXN3ZXN0am9ic21pbmRhbHNvbG9nb3JpY2h1c2VzbGFzdHRlYW1hcm15Zm9vZGtpbmd3aWxsZWFzdHdhcmRiZXN0ZmlyZVBhZ2Vrbm93YXdheS5wbmdtb3ZldGhhbmxvYWRnaXZlc2VsZm5vdGVtdWNoZmVlZG1hbnlyb2NraWNvbm9uY2Vsb29raGlkZWRpZWRIb21lcnVsZWhvc3RhamF4aW5mb2NsdWJsYXdzbGVzc2hhbGZzb21lc3VjaHpvbmUxMDAlb25lc2NhcmVUaW1lcmFjZWJsdWVmb3Vyd2Vla2ZhY2Vob3BlZ2F2ZWhhcmRsb3N0d2hlbnBhcmtrZXB0cGFzc3NoaXByb29tSFRNTHBsYW5UeXBlZG9uZXNhdmVrZWVwZmxhZ2xpbmtzb2xkZml2ZXRvb2tyYXRldG93bmp1bXB0aHVzZGFya2NhcmRmaWxlZmVhcnN0YXlraWxsdGhhdGZhbGxhdXRvZXZlci5jb210YWxrc2hvcHZvdGVkZWVwbW9kZXJlc3R0dXJuYm9ybmJhbmRmZWxscm9zZXVybChza2lucm9sZWNvbWVhY3RzYWdlc21lZXRnb2xkLmpwZ2l0ZW12YXJ5ZmVsdHRoZW5zZW5kZHJvcFZpZXdjb3B5MS4wIjwvYT5zdG9wZWxzZWxpZXN0b3VycGFjay5naWZwYXN0Y3NzP2dyYXltZWFuJmd0O3JpZGVzaG90bGF0ZXNhaWRyb2FkdmFyIGZlZWxqb2hucmlja3BvcnRmYXN0J1VBLWRlYWQ8L2I+cG9vcmJpbGx0eXBlVS5TLndvb2RtdXN0MnB4O0luZm9yYW5rd2lkZXdhbnR3YWxsbGVhZFswXTtwYXVsd2F2ZXN1cmUkKCcjd2FpdG1hc3Nhcm1zZ29lc2dhaW5sYW5ncGFpZCEtLSBsb2NrdW5pdHJvb3R3YWxrZmlybXdpZmV4bWwic29uZ3Rlc3QyMHB4a2luZHJvd3N0b29sZm9udG1haWxzYWZlc3Rhcm1hcHNjb3JlcmFpbmZsb3diYWJ5c3BhbnNheXM0cHg7NnB4O2FydHNmb290cmVhbHdpa2loZWF0c3RlcHRyaXBvcmcvbGFrZXdlYWt0b2xkRm9ybWNhc3RmYW5zYmFua3ZlcnlydW5zanVseXRhc2sxcHg7Z29hbGdyZXdzbG93ZWRnZWlkPSJzZXRzNXB4Oy5qcz80MHB4aWYgKHNvb25zZWF0bm9uZXR1YmV6ZXJvc2VudHJlZWRmYWN0aW50b2dpZnRoYXJtMThweGNhbWVoaWxsYm9sZHpvb212b2lkZWFzeXJpbmdmaWxscGVha2luaXRjb3N0M3B4O2phY2t0YWdzYml0c3JvbGxlZGl0a25ld25lYXI8IS0tZ3Jvd0pTT05kdXR5TmFtZXNhbGV5b3UgbG90c3BhaW5qYXp6Y29sZGV5ZXNmaXNod3d3LnJpc2t0YWJzcHJldjEwcHhyaXNlMjVweEJsdWVkaW5nMzAwLGJhbGxmb3JkZWFybndpbGRib3guZmFpcmxhY2t2ZXJzcGFpcmp1bmV0ZWNoaWYoIXBpY2tldmlsJCgiI3dhcm1sb3JkZG9lc3B1bGwsMDAwaWRlYWRyYXdodWdlc3BvdGZ1bmRidXJuaHJlZmNlbGxrZXlzdGlja2hvdXJsb3NzZnVlbDEycHhzdWl0ZGVhbFJTUyJhZ2VkZ3JleUdFVCJlYXNlYWltc2dpcmxhaWRzOHB4O25hdnlncmlkdGlwcyM5OTl3YXJzbGFkeWNhcnMpOyB9cGhwP2hlbGx0YWxsd2hvbXpoOuUqLw0KIDEwMGhhbGwuCgpBN3B4O3B1c2hjaGF0MHB4O2NyZXcqLzwvaGFzaDc1cHhmbGF0cmFyZSAmJiB0ZWxsY2FtcG9udG9sYWlkbWlzc3NraXB0ZW50ZmluZW1hbGVnZXRzcGxvdDQwMCwNCg0KY29vbGZlZXQucGhwPGJyPmVyaWNtb3N0Z3VpZGJlbGxkZXNjaGFpcm1hdGhhdG9tL2ltZyYjODJsdWNrY2VudDAwMDt0aW55Z29uZWh0bWxzZWxsZHJ1Z0ZSRUVub2Rlbmljaz9pZD1sb3NlbnVsbHZhc3R3aW5kUlNTIHdlYXJyZWx5YmVlbnNhbWVkdWtlbmFzYWNhcGV3aXNoZ3VsZlQyMzpoaXRzc2xvdGdhdGVraWNrYmx1cnRoZXkxNXB4JycpOyk7Ij5tc2lld2luc2JpcmRzb3J0YmV0YXNlZWtUMTg6b3Jkc3RyZWVtYWxsNjBweGZhcm3igJlzYm95c1swXS4nKTsiUE9TVGJlYXJraWRzKTt9fW1hcnl0ZW5kKFVLKXF1YWR6aDrmLXNpei0tLS1wcm9wJyk7DWxpZnRUMTk6dmljZWFuZHlkZWJ0PlJTU3Bvb2xuZWNrYmxvd1QxNjpkb29yZXZhbFQxNzpsZXRzZmFpbG9yYWxwb2xsbm92YWNvbHNnZW5lIOKAlHNvZnRyb21ldGlsbHJvc3M8aDM+cG91cmZhZGVwaW5rPHRyPm1pbmkpfCEobWluZXpoOuhiYXJzaGVhcjAwKTttaWxrIC0tPmlyb25mcmVkZGlza3dlbnRzb2lscHV0cy9qcy9ob2x5VDIyOklTQk5UMjA6YWRhbXNlZXM8aDI+anNvbicsICdjb250VDIxOiBSU1Nsb29wYXNpYW1vb248L3A+c291bExJTkVmb3J0Y2FydFQxNDo8aDE+ODBweCEtLTw5cHg7VDA0Om1pa2U6NDZabmljZWluY2hZb3JrcmljZXpoOuQnKSk7cHVyZW1hZ2VwYXJhdG9uZWJvbmQ6MzdaX29mXyddKTswMDAsemg653Rhbmt5YXJkYm93bGJ1c2g6NTZaSmF2YTMwcHgKfH0KJUMzJTozNFpqZWZmRVhQSWNhc2h2aXNhZ29sZnNub3d6aDrpcXVlci5jc3NzaWNrbWVhdG1pbi5iaW5kZGVsbGhpcmVwaWNzcmVudDozNlpIVFRQLTIwMWZvdG93b2xmRU5EIHhib3g6NTRaQk9EWWRpY2s7Cn0KZXhpdDozNVp2YXJzYmVhdCd9KTtkaWV0OTk5O2FubmV9fTwvW2ldLkxhbmdrbcKyd2lyZXRveXNhZGRzc2VhbGFsZXg7Cgl9ZWNob25pbmUub3JnMDA1KXRvbnlqZXdzc2FuZGxlZ3Nyb29mMDAwKSAyMDB3aW5lZ2VhcmRvZ3Nib290Z2FyeWN1dHN0eWxldGVtcHRpb24ueG1sY29ja2dhbmckKCcuNTBweFBoLkRtaXNjYWxhbmxvYW5kZXNrbWlsZXJ5YW51bml4ZGlzYyk7fQpkdXN0Y2xpcCkuCgo3MHB4LTIwMERWRHM3XT48dGFwZWRlbW9pKyspd2FnZWV1cm9waGlsb3B0c2hvbGVGQVFzYXNpbi0yNlRsYWJzcGV0c1VSTCBidWxrY29vazt9DQpIRUFEWzBdKWFiYnJqdWFuKDE5OGxlc2h0d2luPC9pPnNvbnlndXlzZnVja3BpcGV8LQohMDAyKW5kb3dbMV07W107CkxvZyBzYWx0DQoJCWJhbmd0cmltYmF0aCl7DQowMHB4Cn0pO2tvOuxmZWVzYWQ+DXM6Ly8gW107dG9sbHBsdWcoKXsKew0KIC5qcycyMDBwZHVhbGJvYXQuSlBHKTsKfXF1b3QpOwoKJyk7Cg0KfQ0yMDE0MjAxNTIwMTYyMDE3MjAxODIwMTkyMDIwMjAyMTIwMjIyMDIzMjAyNDIwMjUyMDI2MjAyNzIwMjgyMDI5MjAzMDIwMzEyMDMyMjAzMzIwMzQyMDM1MjAzNjIwMzcyMDEzMjAxMjIwMTEyMDEwMjAwOTIwMDgyMDA3MjAwNjIwMDUyMDA0MjAwMzIwMDIyMDAxMjAwMDE5OTkxOTk4MTk5NzE5OTYxOTk1MTk5NDE5OTMxOTkyMTk5MTE5OTAxOTg5MTk4ODE5ODcxOTg2MTk4NTE5ODQxOTgzMTk4MjE5ODExOTgwMTk3OTE5NzgxOTc3MTk3NjE5NzUxOTc0MTk3MzE5NzIxOTcxMTk3MDE5NjkxOTY4MTk2NzE5NjYxOTY1MTk2NDE5NjMxOTYyMTk2MTE5NjAxOTU5MTk1ODE5NTcxOTU2MTk1NTE5NTQxOTUzMTk1MjE5NTExOTUwMTAwMDEwMjQxMzk0MDAwMDk5OTljb21vbcOhc2VzdGVlc3RhcGVyb3RvZG9oYWNlY2FkYWHDsW9iaWVuZMOtYWFzw612aWRhY2Fzb290cm9mb3Jvc29sb290cmFjdWFsZGlqb3NpZG9ncmFudGlwb3RlbWFkZWJlYWxnb3F1w6llc3RvbmFkYXRyZXNwb2NvY2FzYWJham90b2Rhc2lub2FndWFwdWVzdW5vc2FudGVkaWNlbHVpc2VsbGFtYXlvem9uYWFtb3JwaXNvb2JyYWNsaWNlbGxvZGlvc2hvcmFjYXNp0LfQsNC90LDQvtC80YDQsNGA0YPRgtCw0L3QtdC/0L7QvtGC0LjQt9C90L7QtNC+0YLQvtC20LXQvtC90LjRhdCd0LDQtdC10LHRi9C80YvQktGL0YHQvtCy0YvQstC+0J3QvtC+0LHQn9C+0LvQuNC90LjQoNCk0J3QtdCc0YvRgtGL0J7QvdC40LzQtNCw0JfQsNCU0LDQndGD0J7QsdGC0LXQmNC30LXQudC90YPQvNC80KLRi9GD0LbZgdmK2KPZhtmF2KfZhdi52YPZhNij2YjYsdiv2YrYp9mB2YnZh9mI2YTZhdmE2YPYp9mI2YTZh9io2LPYp9mE2KXZhtmH2YrYo9mK2YLYr9mH2YTYq9mF2KjZh9mE2YjZhNmK2KjZhNin2YrYqNmD2LTZitin2YXYo9mF2YbYqtio2YrZhNmG2K3YqNmH2YXZhdi02YjYtGZpcnN0dmlkZW9saWdodHdvcmxkbWVkaWF3aGl0ZWNsb3NlYmxhY2tyaWdodHNtYWxsYm9va3NwbGFjZW11c2ljZmllbGRvcmRlcnBvaW50dmFsdWVsZXZlbHRhYmxlYm9hcmRob3VzZWdyb3Vwd29ya3N5ZWFyc3N0YXRldG9kYXl3YXRlcnN0YXJ0c3R5bGVkZWF0aHBvd2VycGhvbmVuaWdodGVycm9yaW5wdXRhYm91dHRlcm1zdGl0bGV0b29sc2V2ZW50bG9jYWx0aW1lc2xhcmdld29yZHNnYW1lc3Nob3J0c3BhY2Vmb2N1c2NsZWFybW9kZWxibG9ja2d1aWRlcmFkaW9zaGFyZXdvbWVuYWdhaW5tb25leWltYWdlbmFtZXN5b3VuZ2xpbmVzbGF0ZXJjb2xvcmdyZWVuZnJvbnQmYW1wO3dhdGNoZm9yY2VwcmljZXJ1bGVzYmVnaW5hZnRlcnZpc2l0aXNzdWVhcmVhc2JlbG93aW5kZXh0b3RhbGhvdXJzbGFiZWxwcmludHByZXNzYnVpbHRsaW5rc3NwZWVkc3R1ZHl0cmFkZWZvdW5kc2Vuc2V1bmRlcnNob3duZm9ybXNyYW5nZWFkZGVkc3RpbGxtb3ZlZHRha2VuYWJvdmVmbGFzaGZpeGVkb2Z0ZW5vdGhlcnZpZXdzY2hlY2tsZWdhbHJpdmVyaXRlbXNxdWlja3NoYXBlaHVtYW5leGlzdGdvaW5nbW92aWV0aGlyZGJhc2ljcGVhY2VzdGFnZXdpZHRobG9naW5pZGVhc3dyb3RlcGFnZXN1c2Vyc2RyaXZlc3RvcmVicmVha3NvdXRodm9pY2VzaXRlc21vbnRod2hlcmVidWlsZHdoaWNoZWFydGhmb3J1bXRocmVlc3BvcnRwYXJ0eUNsaWNrbG93ZXJsaXZlc2NsYXNzbGF5ZXJlbnRyeXN0b3J5dXNhZ2Vzb3VuZGNvdXJ0eW91ciBiaXJ0aHBvcHVwdHlwZXNhcHBseUltYWdlYmVpbmd1cHBlcm5vdGVzZXZlcnlzaG93c21lYW5zZXh0cmFtYXRjaHRyYWNra25vd25lYXJseWJlZ2Fuc3VwZXJwYXBlcm5vcnRobGVhcm5naXZlbm5hbWVkZW5kZWRUZXJtc3BhcnRzR3JvdXBicmFuZHVzaW5nd29tYW5mYWxzZXJlYWR5YXVkaW90YWtlc3doaWxlLmNvbS9saXZlZGNhc2VzZGFpbHljaGlsZGdyZWF0anVkZ2V0aG9zZXVuaXRzbmV2ZXJicm9hZGNvYXN0Y292ZXJhcHBsZWZpbGVzY3ljbGVzY2VuZXBsYW5zY2xpY2t3cml0ZXF1ZWVucGllY2VlbWFpbGZyYW1lb2xkZXJwaG90b2xpbWl0Y2FjaGVjaXZpbHNjYWxlZW50ZXJ0aGVtZXRoZXJldG91Y2hib3VuZHJveWFsYXNrZWR3aG9sZXNpbmNlc3RvY2sgbmFtZWZhaXRoaGVhcnRlbXB0eW9mZmVyc2NvcGVvd25lZG1pZ2h0YWxidW10aGlua2Jsb29kYXJyYXltYWpvcnRydXN0Y2Fub251bmlvbmNvdW50dmFsaWRzdG9uZVN0eWxlTG9naW5oYXBweW9jY3VybGVmdDpmcmVzaHF1aXRlZmlsbXNncmFkZW5lZWRzdXJiYW5maWdodGJhc2lzaG92ZXJhdXRvO3JvdXRlLmh0bWxtaXhlZGZpbmFsWW91ciBzbGlkZXRvcGljYnJvd25hbG9uZWRyYXduc3BsaXRyZWFjaFJpZ2h0ZGF0ZXNtYXJjaHF1b3RlZ29vZHNMaW5rc2RvdWJ0YXN5bmN0aHVtYmFsbG93Y2hpZWZ5b3V0aG5vdmVsMTBweDtzZXJ2ZXVudGlsaGFuZHNDaGVja1NwYWNlcXVlcnlqYW1lc2VxdWFsdHdpY2UwLDAwMFN0YXJ0cGFuZWxzb25nc3JvdW5kZWlnaHRzaGlmdHdvcnRocG9zdHNsZWFkc3dlZWtzYXZvaWR0aGVzZW1pbGVzcGxhbmVzbWFydGFscGhhcGxhbnRtYXJrc3JhdGVzcGxheXNjbGFpbXNhbGVzdGV4dHNzdGFyc3dyb25nPC9oMz50aGluZy5vcmcvbXVsdGloZWFyZFBvd2Vyc3RhbmR0b2tlbnNvbGlkKHRoaXNicmluZ3NoaXBzc3RhZmZ0cmllZGNhbGxzZnVsbHlmYWN0c2FnZW50VGhpcyAvLy0tPmFkbWluZWd5cHRFdmVudDE1cHg7RW1haWx0cnVlImNyb3Nzc3BlbnRibG9nc2JveCI+bm90ZWRsZWF2ZWNoaW5hc2l6ZXNndWVzdDwvaDQ+cm9ib3RoZWF2eXRydWUsc2V2ZW5ncmFuZGNyaW1lc2lnbnNhd2FyZWRhbmNlcGhhc2U+PCEtLWVuX1VTJiMzOTsyMDBweF9uYW1lbGF0aW5lbmpveWFqYXguYXRpb25zbWl0aFUuUy4gaG9sZHNwZXRlcmluZGlhbmF2Ij5jaGFpbnNjb3JlY29tZXNkb2luZ3ByaW9yU2hhcmUxOTkwc3JvbWFubGlzdHNqYXBhbmZhbGxzdHJpYWxvd25lcmFncmVlPC9oMj5hYnVzZWFsZXJ0b3BlcmEiLS8vV2NhcmRzaGlsbHN0ZWFtc1Bob3RvdHJ1dGhjbGVhbi5waHA/c2FpbnRtZXRhbGxvdWlzbWVhbnRwcm9vZmJyaWVmcm93Ij5nZW5yZXRydWNrbG9va3NWYWx1ZUZyYW1lLm5ldC8tLT4KPHRyeSB7CnZhciBtYWtlc2Nvc3RzcGxhaW5hZHVsdHF1ZXN0dHJhaW5sYWJvcmhlbHBzY2F1c2VtYWdpY21vdG9ydGhlaXIyNTBweGxlYXN0c3RlcHNDb3VudGNvdWxkZ2xhc3NzaWRlc2Z1bmRzaG90ZWxhd2FyZG1vdXRobW92ZXNwYXJpc2dpdmVzZHV0Y2h0ZXhhc2ZydWl0bnVsbCx8fFtdO3RvcCI+CjwhLS1QT1NUIm9jZWFuPGJyLz5mbG9vcnNwZWFrZGVwdGggc2l6ZWJhbmtzY2F0Y2hjaGFydDIwcHg7YWxpZ25kZWFsc3dvdWxkNTBweDt1cmw9InBhcmtzbW91c2VNb3N0IC4uLjwvYW1vbmdicmFpbmJvZHkgbm9uZTtiYXNlZGNhcnJ5ZHJhZnRyZWZlcnBhZ2VfaG9tZS5tZXRlcmRlbGF5ZHJlYW1wcm92ZWpvaW50PC90cj5kcnVnczwhLS0gYXByaWxpZGVhbGFsbGVuZXhhY3Rmb3J0aGNvZGVzbG9naWNWaWV3IHNlZW1zYmxhbmtwb3J0cyAoMjAwc2F2ZWRfbGlua2dvYWxzZ3JhbnRncmVla2hvbWVzcmluZ3NyYXRlZDMwcHg7d2hvc2VwYXJzZSgpOyIgQmxvY2tsaW51eGpvbmVzcGl4ZWwnKTsiPik7aWYoLWxlZnRkYXZpZGhvcnNlRm9jdXNyYWlzZWJveGVzVHJhY2tlbWVudDwvZW0+YmFyIj4uc3JjPXRvd2VyYWx0PSJjYWJsZWhlbnJ5MjRweDtzZXR1cGl0YWx5c2hhcnBtaW5vcnRhc3Rld2FudHN0aGlzLnJlc2V0d2hlZWxnaXJscy9jc3MvMTAwJTtjbHVic3N0dWZmYmlibGV2b3RlcyAxMDAwa29yZWF9KTsNCmJhbmRzcXVldWU9IHt9OzgwcHg7Y2tpbmd7DQoJCWFoZWFkY2xvY2tpcmlzaGxpa2UgcmF0aW9zdGF0c0Zvcm0ieWFob28pWzBdO0Fib3V0ZmluZHM8L2gxPmRlYnVndGFza3NVUkwgPWNlbGxzfSkoKTsxMnB4O3ByaW1ldGVsbHN0dXJuczB4NjAwLmpwZyJzcGFpbmJlYWNodGF4ZXNtaWNyb2FuZ2VsLS0+PC9naWZ0c3N0ZXZlLWxpbmtib2R5Ln0pOwoJbW91bnQgKDE5OUZBUTwvcm9nZXJmcmFua0NsYXNzMjhweDtmZWVkczxoMT48c2NvdHR0ZXN0czIycHg7ZHJpbmspIHx8IGxld2lzc2hhbGwjMDM5OyBmb3IgbG92ZWR3YXN0ZTAwcHg7amE644JzaW1vbjxmb250cmVwbHltZWV0c3VudGVyY2hlYXB0aWdodEJyYW5kKSAhPSBkcmVzc2NsaXBzcm9vbXNvbmtleW1vYmlsbWFpbi5OYW1lIHBsYXRlZnVubnl0cmVlc2NvbS8iMS5qcGd3bW9kZXBhcmFtU1RBUlRsZWZ0IGlkZGVuLCAyMDEpOwp9CmZvcm0udmlydXNjaGFpcnRyYW5zd29yc3RQYWdlc2l0aW9ucGF0Y2g8IS0tCm8tY2FjZmlybXN0b3VycywwMDAgYXNpYW5pKyspe2Fkb2JlJylbMF1pZD0xMGJvdGg7bWVudSAuMi5taS5wbmcia2V2aW5jb2FjaENoaWxkYnJ1Y2UyLmpwZ1VSTCkrLmpwZ3xzdWl0ZXNsaWNlaGFycnkxMjAiIHN3ZWV0dHI+DQpuYW1lPWRpZWdvcGFnZSBzd2lzcy0tPgoKI2ZmZjsiPkxvZy5jb20idHJlYXRzaGVldCkgJiYgMTRweDtzbGVlcG50ZW50ZmlsZWRqYTrjg2lkPSJjTmFtZSJ3b3JzZXNob3RzLWJveC1kZWx0YQombHQ7YmVhcnM6NDhaPGRhdGEtcnVyYWw8L2E+IHNwZW5kYmFrZXJzaG9wcz0gIiI7cGhwIj5jdGlvbjEzcHg7YnJpYW5oZWxsb3NpemU9bz0lMkYgam9pbm1heWJlPGltZyBpbWciPiwgZmpzaW1nIiAiKVswXU1Ub3BCVHlwZSJuZXdseURhbnNrY3plY2h0cmFpbGtub3dzPC9oNT5mYXEiPnpoLWNuMTApOwotMSIpO3R5cGU9Ymx1ZXN0cnVseWRhdmlzLmpzJzs+DQo8IXN0ZWVsIHlvdSBoMj4NCmZvcm0gamVzdXMxMDAlIG1lbnUuDQoJDQp3YWxlc3Jpc2tzdW1lbnRkZGluZ2ItbGlrdGVhY2hnaWYiIHZlZ2FzZGFuc2tlZXN0aXNocWlwc3VvbWlzb2JyZWRlc2RlZW50cmV0b2Rvc3B1ZWRlYcOxb3Nlc3TDoXRpZW5laGFzdGFvdHJvc3BhcnRlZG9uZGVudWV2b2hhY2VyZm9ybWFtaXNtb21lam9ybXVuZG9hcXXDrWTDrWFzc8OzbG9heXVkYWZlY2hhdG9kYXN0YW50b21lbm9zZGF0b3NvdHJhc3NpdGlvbXVjaG9haG9yYWx1Z2FybWF5b3Jlc3Rvc2hvcmFzdGVuZXJhbnRlc2ZvdG9zZXN0YXNwYcOtc251ZXZhc2FsdWRmb3Jvc21lZGlvcXVpZW5tZXNlc3BvZGVyY2hpbGVzZXLDoXZlY2VzZGVjaXJqb3PDqWVzdGFydmVudGFncnVwb2hlY2hvZWxsb3N0ZW5nb2FtaWdvY29zYXNuaXZlbGdlbnRlbWlzbWFhaXJlc2p1bGlvdGVtYXNoYWNpYWZhdm9yanVuaW9saWJyZXB1bnRvYnVlbm9hdXRvcmFicmlsYnVlbmF0ZXh0b21hcnpvc2FiZXJsaXN0YWx1ZWdvY8OzbW9lbmVyb2p1ZWdvcGVyw7poYWJlcmVzdG95bnVuY2FtdWplcnZhbG9yZnVlcmFsaWJyb2d1c3RhaWd1YWx2b3Rvc2Nhc29zZ3XDrWFwdWVkb3NvbW9zYXZpc291c3RlZGRlYmVubm9jaGVidXNjYWZhbHRhZXVyb3NzZXJpZWRpY2hvY3Vyc29jbGF2ZWNhc2FzbGXDs25wbGF6b2xhcmdvb2JyYXN2aXN0YWFwb3lvanVudG90cmF0YXZpc3RvY3JlYXJjYW1wb2hlbW9zY2luY29jYXJnb3Bpc29zb3JkZW5oYWNlbsOhcmVhZGlzY29wZWRyb2NlcmNhcHVlZGFwYXBlbG1lbm9yw7p0aWxjbGFyb2pvcmdlY2FsbGVwb25lcnRhcmRlbmFkaWVtYXJjYXNpZ3VlZWxsYXNzaWdsb2NvY2hlbW90b3NtYWRyZWNsYXNlcmVzdG9uacOxb3F1ZWRhcGFzYXJiYW5jb2hpam9zdmlhamVwYWJsb8Opc3RldmllbmVyZWlub2RlamFyZm9uZG9jYW5hbG5vcnRlbGV0cmFjYXVzYXRvbWFybWFub3NsdW5lc2F1dG9zdmlsbGF2ZW5kb3Blc2FydGlwb3N0ZW5nYW1hcmNvbGxldmFwYWRyZXVuaWRvdmFtb3N6b25hc2FtYm9zYmFuZGFtYXJpYWFidXNvbXVjaGFzdWJpcnJpb2phdml2aXJncmFkb2NoaWNhYWxsw61qb3ZlbmRpY2hhZXN0YW50YWxlc3NhbGlyc3VlbG9wZXNvc2ZpbmVzbGxhbWFidXNjb8Opc3RhbGxlZ2FuZWdyb3BsYXphaHVtb3JwYWdhcmp1bnRhZG9ibGVpc2xhc2JvbHNhYmHDsW9oYWJsYWx1Y2hhw4FyZWFkaWNlbmp1Z2Fybm90YXN2YWxsZWFsbMOhY2FyZ2Fkb2xvcmFiYWpvZXN0w6lndXN0b21lbnRlbWFyaW9maXJtYWNvc3RvZmljaGFwbGF0YWhvZ2FyYXJ0ZXNsZXllc2FxdWVsbXVzZW9iYXNlc3BvY29zbWl0YWRjaWVsb2NoaWNvbWllZG9nYW5hcnNhbnRvZXRhcGFkZWJlc3BsYXlhcmVkZXNzaWV0ZWNvcnRlY29yZWFkdWRhc2Rlc2Vvdmllam9kZXNlYWFndWFzJnF1b3Q7ZG9tYWluY29tbW9uc3RhdHVzZXZlbnRzbWFzdGVyc3lzdGVtYWN0aW9uYmFubmVycmVtb3Zlc2Nyb2xsdXBkYXRlZ2xvYmFsbWVkaXVtZmlsdGVybnVtYmVyY2hhbmdlcmVzdWx0cHVibGljc2NyZWVuY2hvb3Nlbm9ybWFsdHJhdmVsaXNzdWVzc291cmNldGFyZ2V0c3ByaW5nbW9kdWxlbW9iaWxlc3dpdGNocGhvdG9zYm9yZGVycmVnaW9uaXRzZWxmc29jaWFsYWN0aXZlY29sdW1ucmVjb3JkZm9sbG93dGl0bGU+ZWl0aGVybGVuZ3RoZmFtaWx5ZnJpZW5kbGF5b3V0YXV0aG9yY3JlYXRlcmV2aWV3c3VtbWVyc2VydmVycGxheWVkcGxheWVyZXhwYW5kcG9saWN5Zm9ybWF0ZG91YmxlcG9pbnRzc2VyaWVzcGVyc29ubGl2aW5nZGVzaWdubW9udGhzZm9yY2VzdW5pcXVld2VpZ2h0cGVvcGxlZW5lcmd5bmF0dXJlc2VhcmNoZmlndXJlaGF2aW5nY3VzdG9tb2Zmc2V0bGV0dGVyd2luZG93c3VibWl0cmVuZGVyZ3JvdXBzdXBsb2FkaGVhbHRobWV0aG9kdmlkZW9zc2Nob29sZnV0dXJlc2hhZG93ZGViYXRldmFsdWVzT2JqZWN0b3RoZXJzcmlnaHRzbGVhZ3VlY2hyb21lc2ltcGxlbm90aWNlc2hhcmVkZW5kaW5nc2Vhc29ucmVwb3J0b25saW5lc3F1YXJlYnV0dG9uaW1hZ2VzZW5hYmxlbW92aW5nbGF0ZXN0d2ludGVyRnJhbmNlcGVyaW9kc3Ryb25ncmVwZWF0TG9uZG9uZGV0YWlsZm9ybWVkZGVtYW5kc2VjdXJlcGFzc2VkdG9nZ2xlcGxhY2VzZGV2aWNlc3RhdGljY2l0aWVzc3RyZWFteWVsbG93YXR0YWNrc3RyZWV0ZmxpZ2h0aGlkZGVuaW5mbyI+b3BlbmVkdXNlZnVsdmFsbGV5Y2F1c2VzbGVhZGVyc2VjcmV0c2Vjb25kZGFtYWdlc3BvcnRzZXhjZXB0cmF0aW5nc2lnbmVkdGhpbmdzZWZmZWN0ZmllbGRzc3RhdGVzb2ZmaWNldmlzdWFsZWRpdG9ydm9sdW1lUmVwb3J0bXVzZXVtbW92aWVzcGFyZW50YWNjZXNzbW9zdGx5bW90aGVyIiBpZD0ibWFya2V0Z3JvdW5kY2hhbmNlc3VydmV5YmVmb3Jlc3ltYm9sbW9tZW50c3BlZWNobW90aW9uaW5zaWRlbWF0dGVyQ2VudGVyb2JqZWN0ZXhpc3RzbWlkZGxlRXVyb3BlZ3Jvd3RobGVnYWN5bWFubmVyZW5vdWdoY2FyZWVyYW5zd2Vyb3JpZ2lucG9ydGFsY2xpZW50c2VsZWN0cmFuZG9tY2xvc2VkdG9waWNzY29taW5nZmF0aGVyb3B0aW9uc2ltcGx5cmFpc2VkZXNjYXBlY2hvc2VuY2h1cmNoZGVmaW5lcmVhc29uY29ybmVyb3V0cHV0bWVtb3J5aWZyYW1lcG9saWNlbW9kZWxzTnVtYmVyZHVyaW5nb2ZmZXJzc3R5bGVza2lsbGVkbGlzdGVkY2FsbGVkc2lsdmVybWFyZ2luZGVsZXRlYmV0dGVyYnJvd3NlbGltaXRzR2xvYmFsc2luZ2xld2lkZ2V0Y2VudGVyYnVkZ2V0bm93cmFwY3JlZGl0Y2xhaW1zZW5naW5lc2FmZXR5Y2hvaWNlc3Bpcml0LXN0eWxlc3ByZWFkbWFraW5nbmVlZGVkcnVzc2lhcGxlYXNlZXh0ZW50U2NyaXB0YnJva2VuYWxsb3dzY2hhcmdlZGl2aWRlZmFjdG9ybWVtYmVyLWJhc2VkdGhlb3J5Y29uZmlnYXJvdW5kd29ya2VkaGVscGVkQ2h1cmNoaW1wYWN0c2hvdWxkYWx3YXlzbG9nbyIgYm90dG9tbGlzdCI+KXt2YXIgcHJlZml4b3JhbmdlSGVhZGVyLnB1c2goY291cGxlZ2FyZGVuYnJpZGdlbGF1bmNoUmV2aWV3dGFraW5ndmlzaW9ubGl0dGxlZGF0aW5nQnV0dG9uYmVhdXR5dGhlbWVzZm9yZ290U2VhcmNoYW5jaG9yYWxtb3N0bG9hZGVkQ2hhbmdlcmV0dXJuc3RyaW5ncmVsb2FkTW9iaWxlaW5jb21lc3VwcGx5U291cmNlb3JkZXJzdmlld2VkJm5ic3A7Y291cnNlQWJvdXQgaXNsYW5kPGh0bWwgY29va2llbmFtZT0iYW1hem9ubW9kZXJuYWR2aWNlaW48L2E+OiBUaGUgZGlhbG9naG91c2VzQkVHSU4gTWV4aWNvc3RhcnRzY2VudHJlaGVpZ2h0YWRkaW5nSXNsYW5kYXNzZXRzRW1waXJlU2Nob29sZWZmb3J0ZGlyZWN0bmVhcmx5bWFudWFsU2VsZWN0LgoKT25lam9pbmVkbWVudSI+UGhpbGlwYXdhcmRzaGFuZGxlaW1wb3J0T2ZmaWNlcmVnYXJkc2tpbGxzbmF0aW9uU3BvcnRzZGVncmVld2Vla2x5IChlLmcuYmVoaW5kZG9jdG9ybG9nZ2VkdW5pdGVkPC9iPjwvYmVnaW5zcGxhbnRzYXNzaXN0YXJ0aXN0aXNzdWVkMzAwcHh8Y2FuYWRhYWdlbmN5c2NoZW1lcmVtYWluQnJhemlsc2FtcGxlbG9nbyI+YmV5b25kLXNjYWxlYWNjZXB0c2VydmVkbWFyaW5lRm9vdGVyY2FtZXJhPC9oMT4KX2Zvcm0ibGVhdmVzc3RyZXNzIiAvPg0KLmdpZiIgb25sb2FkbG9hZGVyT3hmb3Jkc2lzdGVyc3Vydml2bGlzdGVuZmVtYWxlRGVzaWduc2l6ZT0iYXBwZWFsdGV4dCI+bGV2ZWxzdGhhbmtzaGlnaGVyZm9yY2VkYW5pbWFsYW55b25lQWZyaWNhYWdyZWVkcmVjZW50UGVvcGxlPGJyIC8+d29uZGVycHJpY2VzdHVybmVkfHwge307bWFpbiI+aW5saW5lc3VuZGF5d3JhcCI+ZmFpbGVkY2Vuc3VzbWludXRlYmVhY29ucXVvdGVzMTUwcHh8ZXN0YXRlcmVtb3RlZW1haWwibGlua2VkcmlnaHQ7c2lnbmFsZm9ybWFsMS5odG1sc2lnbnVwcHJpbmNlZmxvYXQ6LnBuZyIgZm9ydW0uQWNjZXNzcGFwZXJzc291bmRzZXh0ZW5kSGVpZ2h0c2xpZGVyVVRGLTgiJmFtcDsgQmVmb3JlLiBXaXRoc3R1ZGlvb3duZXJzbWFuYWdlcHJvZml0alF1ZXJ5YW5udWFscGFyYW1zYm91Z2h0ZmFtb3VzZ29vZ2xlbG9uZ2VyaSsrKSB7aXNyYWVsc2F5aW5nZGVjaWRlaG9tZSI+aGVhZGVyZW5zdXJlYnJhbmNocGllY2VzYmxvY2s7c3RhdGVkdG9wIj48cmFjaW5ncmVzaXplLS0mZ3Q7cGFjaXR5c2V4dWFsYnVyZWF1LmpwZyIgMTAsMDAwb2J0YWludGl0bGVzYW1vdW50LCBJbmMuY29tZWR5bWVudSIgbHlyaWNzdG9kYXkuaW5kZWVkY291bnR5X2xvZ28uRmFtaWx5bG9va2VkTWFya2V0bHNlIGlmUGxheWVydHVya2V5KTt2YXIgZm9yZXN0Z2l2aW5nZXJyb3JzRG9tYWlufWVsc2V7aW5zZXJ0QmxvZzwvZm9vdGVybG9naW4uZmFzdGVyYWdlbnRzPGJvZHkgMTBweCAwcHJhZ21hZnJpZGF5anVuaW9yZG9sbGFycGxhY2VkY292ZXJzcGx1Z2luNSwwMDAgcGFnZSI+Ym9zdG9uLnRlc3QoYXZhdGFydGVzdGVkX2NvdW50Zm9ydW1zc2NoZW1haW5kZXgsZmlsbGVkc2hhcmVzcmVhZGVyYWxlcnQoYXBwZWFyU3VibWl0bGluZSI+Ym9keSI+CiogVGhlVGhvdWdoc2VlaW5namVyc2V5TmV3czwvdmVyaWZ5ZXhwZXJ0aW5qdXJ5d2lkdGg9Q29va2llU1RBUlQgYWNyb3NzX2ltYWdldGhyZWFkbmF0aXZlcG9ja2V0Ym94Ij4KU3lzdGVtIERhdmlkY2FuY2VydGFibGVzcHJvdmVkQXByaWwgcmVhbGx5ZHJpdmVyaXRlbSI+bW9yZSI+Ym9hcmRzY29sb3JzY2FtcHVzZmlyc3QgfHwgW107bWVkaWEuZ3VpdGFyZmluaXNod2lkdGg6c2hvd2VkT3RoZXIgLnBocCIgYXNzdW1lbGF5ZXJzd2lsc29uc3RvcmVzcmVsaWVmc3dlZGVuQ3VzdG9tZWFzaWx5IHlvdXIgU3RyaW5nCgpXaGlsdGF5bG9yY2xlYXI6cmVzb3J0ZnJlbmNodGhvdWdoIikgKyAiPGJvZHk+YnV5aW5nYnJhbmRzTWVtYmVybmFtZSI+b3BwaW5nc2VjdG9yNXB4OyI+dnNwYWNlcG9zdGVybWFqb3IgY29mZmVlbWFydGlubWF0dXJlaGFwcGVuPC9uYXY+a2Fuc2FzbGluayI+SW1hZ2VzPWZhbHNld2hpbGUgaHNwYWNlMCZhbXA7IAoKSW4gIHBvd2VyUG9sc2tpLWNvbG9yam9yZGFuQm90dG9tU3RhcnQgLWNvdW50Mi5odG1sbmV3cyI+MDEuanBnT25saW5lLXJpZ2h0bWlsbGVyc2VuaW9ySVNCTiAwMCwwMDAgZ3VpZGVzdmFsdWUpZWN0aW9ucmVwYWlyLnhtbCIgIHJpZ2h0cy5odG1sLWJsb2NrcmVnRXhwOmhvdmVyd2l0aGludmlyZ2lucGhvbmVzPC90cj4NdXNpbmcgCgl2YXIgPicpOwoJPC90ZD4KPC90cj4KYmFoYXNhYnJhc2lsZ2FsZWdvbWFneWFycG9sc2tpc3Jwc2tp2LHYr9mI5Lit5paH566A5L2T57mB6auU5L+h5oGv5Lit5Zu95oiR5Lus5LiA5Liq5YWs5Y+4566h55CG6K665Z2b5Y+v5Lul5pyN5Yqh5pe26Ze05Liq5Lq65Lqn5ZOB6Ieq5bex5LyB5Lia5p+l55yL5bel5L2c6IGU57O75rKh5pyJ572R56uZ5omA5pyJ6K+E6K665Lit5b+D5paH56ug55So5oi36aaW6aG15L2c6ICF5oqA5pyv6Zeu6aKY55u45YWz5LiL6L295pCc57Si5L2/55So6L2v5Lu25Zyo57q/5Li76aKY6LWE5paZ6KeG6aKR5Zue5aSN5rOo5YaM572R57uc5pS26JeP5YaF5a655o6o6I2Q5biC5Zy65raI5oGv56m66Ze05Y+R5biD5LuA5LmI5aW95Y+L55Sf5rS75Zu+54mH5Y+R5bGV5aaC5p6c5omL5py65paw6Ze75pyA5paw5pa55byP5YyX5Lqs5o+Q5L6b5YWz5LqO5pu05aSa6L+Z5Liq57O757uf55+l6YGT5ri45oiP5bm/5ZGK5YW25LuW5Y+R6KGo5a6J5YWo56ys5LiA5Lya5ZGY6L+b6KGM54K55Ye754mI5p2D55S15a2Q5LiW55WM6K6+6K6h5YWN6LS55pWZ6IKy5Yqg5YWl5rS75Yqo5LuW5Lus5ZWG5ZOB5Y2a5a6i546w5Zyo5LiK5rW35aaC5L2V5bey57uP55WZ6KiA6K+m57uG56S+5Yy655m75b2V5pys56uZ6ZyA6KaB5Lu35qC85pSv5oyB5Zu96ZmF6ZO+5o6l5Zu95a625bu66K6+5pyL5Y+L6ZiF6K+75rOV5b6L5L2N572u57uP5rWO6YCJ5oup6L+Z5qC35b2T5YmN5YiG57G75o6S6KGM5Zug5Li65Lqk5piT5pyA5ZCO6Z+z5LmQ5LiN6IO96YCa6L+H6KGM5Lia56eR5oqA5Y+v6IO96K6+5aSH5ZCI5L2c5aSn5a6256S+5Lya56CU56m25LiT5Lia5YWo6YOo6aG555uu6L+Z6YeM6L+Y5piv5byA5aeL5oOF5Ya155S16ISR5paH5Lu25ZOB54mM5biu5Yqp5paH5YyW6LWE5rqQ5aSn5a2m5a2m5Lmg5Zyw5Z2A5rWP6KeI5oqV6LWE5bel56iL6KaB5rGC5oCO5LmI5pe25YCZ5Yqf6IO95Li76KaB55uu5YmN6LWE6K6v5Z+O5biC5pa55rOV55S15b2x5oub6IGY5aOw5piO5Lu75L2V5YGl5bq35pWw5o2u576O5Zu95rG96L2m5LuL57uN5L2G5piv5Lqk5rWB55Sf5Lqn5omA5Lul55S16K+d5pi+56S65LiA5Lqb5Y2V5L2N5Lq65ZGY5YiG5p6Q5Zyw5Zu+5peF5ri45bel5YW35a2m55Sf57O75YiX572R5Y+L5biW5a2Q5a+G56CB6aKR6YGT5o6n5Yi25Zyw5Yy65Z+65pys5YWo5Zu9572R5LiK6YeN6KaB56ys5LqM5Zac5qyi6L+b5YWl5Y+L5oOF6L+Z5Lqb6ICD6K+V5Y+R546w5Z+56K6t5Lul5LiK5pS/5bqc5oiQ5Li6546v5aKD6aaZ5riv5ZCM5pe25aix5LmQ5Y+R6YCB5LiA5a6a5byA5Y+R5L2c5ZOB5qCH5YeG5qyi6L+O6Kej5Yaz5Zyw5pa55LiA5LiL5Lul5Y+K6LSj5Lu75oiW6ICF5a6i5oi35Luj6KGo56ev5YiG5aWz5Lq65pWw56CB6ZSA5ZSu5Ye6546w56a757q/5bqU55So5YiX6KGo5LiN5ZCM57yW6L6R57uf6K6h5p+l6K+i5LiN6KaB5pyJ5YWz5py65p6E5b6I5aSa5pKt5pS+57uE57uH5pS/562W55u05o6l6IO95Yqb5p2l5rqQ5pmC6ZaT55yL5Yiw54Ot6Zeo5YWz6ZSu5LiT5Yy66Z2e5bi46Iux6K+t55m+5bqm5biM5pyb576O5aWz5q+U6L6D55+l6K+G6KeE5a6a5bu66K6u6YOo6Zeo5oSP6KeB57K+5b2p5pel5pys5o+Q6auY5Y+R6KiA5pa56Z2i5Z+66YeR5aSE55CG5p2D6ZmQ5b2x54mH6ZO26KGM6L+Y5pyJ5YiG5Lqr54mp5ZOB57uP6JCl5re75Yqg5LiT5a626L+Z56eN6K+d6aKY6LW35p2l5Lia5Yqh5YWs5ZGK6K6w5b2V566A5LuL6LSo6YeP55S35Lq65b2x5ZON5byV55So5oql5ZGK6YOo5YiG5b+r6YCf5ZKo6K+i5pe25bCa5rOo5oSP55Sz6K+35a2m5qCh5bqU6K+l5Y6G5Y+y5Y+q5piv6L+U5Zue6LSt5Lmw5ZCN56ew5Li65LqG5oiQ5Yqf6K+05piO5L6b5bqU5a2p5a2Q5LiT6aKY56iL5bqP5LiA6Iis5pyD5ZOh5Y+q5pyJ5YW25a6D5L+d5oqk6ICM5LiU5LuK5aSp56qX5Y+j5Yqo5oCB54q25oCB54m55Yir6K6k5Li65b+F6aG75pu05paw5bCP6K+05oiR5YCR5L2c5Li65aqS5L2T5YyF5ous6YKj5LmI5LiA5qC35Zu95YaF5piv5ZCm5qC55o2u55S16KeG5a2m6Zmi5YW35pyJ6L+H56iL55Sx5LqO5Lq65omN5Ye65p2l5LiN6L+H5q2j5Zyo5piO5pif5pWF5LqL5YWz57O75qCH6aKY5ZWG5Yqh6L6T5YWl5LiA55u05Z+656GA5pWZ5a2m5LqG6Kej5bu6562R57uT5p6c5YWo55CD6YCa55+l6K6h5YiS5a+55LqO6Im65pyv55u45YaM5Y+R55Sf55yf55qE5bu656uL562J57qn57G75Z6L57uP6aqM5a6e546w5Yi25L2c5p2l6Ieq5qCH562+5Lul5LiL5Y6f5Yib5peg5rOV5YW25Lit5YCL5Lq65LiA5YiH5oyH5Y2X5YWz6Zet6ZuG5Zui56ys5LiJ5YWz5rOo5Zug5q2k54Wn54mH5rex5Zyz5ZWG5Lia5bm/5bee5pel5pyf6auY57qn5pyA6L+R57u85ZCI6KGo56S65LiT6L6R6KGM5Li65Lqk6YCa6K+E5Lu36KeJ5b6X57K+5Y2O5a625bqt5a6M5oiQ5oSf6KeJ5a6J6KOF5b6X5Yiw6YKu5Lu25Yi25bqm6aOf5ZOB6Jm954S26L2s6L295oql5Lu36K6w6ICF5pa55qGI6KGM5pS/5Lq65rCR55So5ZOB5Lic6KW/5o+Q5Ye66YWS5bqX54S25ZCO5LuY5qy+54Ot54K55Lul5YmN5a6M5YWo5Y+R5biW6K6+572u6aKG5a+85bel5Lia5Yy76Zmi55yL55yL57uP5YW45Y6f5Zug5bmz5Y+w5ZCE56eN5aKe5Yqg5p2Q5paZ5paw5aKe5LmL5ZCO6IGM5Lia5pWI5p6c5LuK5bm06K665paH5oiR5Zu95ZGK6K+J54mI5Li75L+u5pS55Y+C5LiO5omT5Y2w5b+r5LmQ5py65qKw6KeC54K55a2Y5Zyo57K+56We6I635b6X5Yip55So57un57ut5L2g5Lus6L+Z5LmI5qih5byP6K+t6KiA6IO95aSf6ZuF6JmO5pON5L2c6aOO5qC85LiA6LW356eR5a2m5L2T6IKy55+t5L+h5p2h5Lu25rK755aX6L+Q5Yqo5Lqn5Lia5Lya6K6u5a+86Iiq5YWI55Sf6IGU55uf5Y+v5piv5ZWP6aGM57uT5p6E5L2c55So6LCD5p+l6LOH5paZ6Ieq5Yqo6LSf6LSj5Yac5Lia6K6/6Zeu5a6e5pa95o6l5Y+X6K6o6K666YKj5Liq5Y+N6aaI5Yqg5by65aWz5oCn6IyD5Zu05pyN5YuZ5LyR6Zey5LuK5pel5a6i5pyN6KeA55yL5Y+C5Yqg55qE6K+d5LiA54K55L+d6K+B5Zu+5Lmm5pyJ5pWI5rWL6K+V56e75Yqo5omN6IO95Yaz5a6a6IKh56Wo5LiN5pat6ZyA5rGC5LiN5b6X5Yqe5rOV5LmL6Ze06YeH55So6JCl6ZSA5oqV6K+J55uu5qCH54ix5oOF5pGE5b2x5pyJ5Lqb6KSH6KO95paH5a2m5py65Lya5pWw5a2X6KOF5L+u6LSt54mp5Yac5p2R5YWo6Z2i57K+5ZOB5YW25a6e5LqL5oOF5rC05bmz5o+Q56S65LiK5biC6LCi6LCi5pmu6YCa5pWZ5biI5LiK5Lyg57G75Yir5q2M5puy5oul5pyJ5Yib5paw6YWN5Lu25Y+q6KaB5pe25Luj6LOH6KiK6L6+5Yiw5Lq655Sf6K6i6ZiF6ICB5biI5bGV56S65b+D55CG6LS05a2Q57ay56uZ5Li76aGM6Ieq54S257qn5Yir566A5Y2V5pS56Z2p6YKj5Lqb5p2l6K+05omT5byA5Luj56CB5Yig6Zmk6K+B5Yi46IqC55uu6YeN54K55qyh5pW45aSa5bCR6KeE5YiS6LWE6YeR5om+5Yiw5Lul5ZCO5aSn5YWo5Li76aG15pyA5L2z5Zue562U5aSp5LiL5L+d6Zqc546w5Luj5qOA5p+l5oqV56Wo5bCP5pe25rKS5pyJ5q2j5bi455Sa6Iez5Luj55CG55uu5b2V5YWs5byA5aSN5Yi26YeR6J6N5bm456aP54mI5pys5b2i5oiQ5YeG5aSH6KGM5oOF5Zue5Yiw5oCd5oOz5oCO5qC35Y2P6K6u6K6k6K+B5pyA5aW95Lqn55Sf5oyJ54Wn5pyN6KOF5bm/5Lic5Yqo5ryr6YeH6LSt5paw5omL57uE5Zu+6Z2i5p2/5Y+C6ICD5pS/5rK75a655piT5aSp5Zyw5Yqq5Yqb5Lq65Lus5Y2H57qn6YCf5bqm5Lq654mp6LCD5pW05rWB6KGM6YCg5oiQ5paH5a2X6Z+p5Zu96LS45piT5byA5bGV55u46Zec6KGo546w5b2x6KeG5aaC5q2k576O5a655aSn5bCP5oql6YGT5p2h5qy+5b+D5oOF6K645aSa5rOV6KeE5a625bGF5Lmm5bqX6L+e5o6l56uL5Y2z5Li+5oql5oqA5ben5aWl6L+Q55m75YWl5Lul5p2l55CG6K665LqL5Lu26Ieq55Sx5Lit5Y2O5Yqe5YWs5aaI5aaI55yf5q2j5LiN6ZSZ5YWo5paH5ZCI5ZCM5Lu35YC85Yir5Lq655uR552j5YW35L2T5LiW57qq5Zui6Zif5Yib5Lia5om/5ouF5aKe6ZW/5pyJ5Lq65L+d5oyB5ZWG5a6257u05L+u5Y+w5rm+5bem5Y+z6IKh5Lu9562U5qGI5a6e6ZmF55S15L+h57uP55CG55Sf5ZG95a6j5Lyg5Lu75Yqh5q2j5byP54m56Imy5LiL5p2l5Y2P5Lya5Y+q6IO95b2T54S26YeN5paw5YWn5a655oyH5a+86L+Q6KGM5pel5b+X6LOj5a626LaF6L+H5Zyf5Zyw5rWZ5rGf5pSv5LuY5o6o5Ye656uZ6ZW/5p2t5bee5omn6KGM5Yi26YCg5LmL5LiA5o6o5bm/546w5Zy65o+P6L+w5Y+Y5YyW5Lyg57uf5q2M5omL5L+d6Zmp6K++56iL5Yy755aX57uP6L+H6L+H5Y675LmL5YmN5pS25YWl5bm05bqm5p2C5b+X576O5Li95pyA6auY55m76ZmG5pyq5p2l5Yqg5bel5YWN6LSj5pWZ56iL54mI5Z2X6Lqr5L2T6YeN5bqG5Ye65ZSu5oiQ5pys5b2i5byP5Zyf6LGG5Ye65YO55Lic5pa56YKu566x5Y2X5Lqs5rGC6IGM5Y+W5b6X6IGM5L2N55u45L+h6aG16Z2i5YiG6ZKf572R6aG156Gu5a6a5Zu+5L6L572R5Z2A56ev5p6B6ZSZ6K+v55uu55qE5a6d6LSd5py65YWz6aOO6Zmp5o6I5p2D55eF5q+S5a6g54mp6Zmk5LqG6KmV6KuW55a+55eF5Y+K5pe25rGC6LSt56uZ54K55YS/56ul5q+P5aSp5Lit5aSu6K6k6K+G5q+P5Liq5aSp5rSl5a2X5L2T5Y+w54Gj57u05oqk5pys6aG15Liq5oCn5a6Y5pa55bi46KeB55u45py65oiY55Wl5bqU5b2T5b6L5biI5pa55L6/5qCh5Zut6IKh5biC5oi/5bGL5qCP55uu5ZGY5bel5a+86Ie056qB54S26YGT5YW35pys572R57uT5ZCI5qGj5qGI5Yqz5Yqo5Y+m5aSW576O5YWD5byV6LW35pS55Y+Y56ys5Zub5Lya6K6h6Kqq5piO6ZqQ56eB5a6d5a6d6KeE6IyD5raI6LS55YWx5ZCM5b+Y6K6w5L2T57O75bim5p2l5ZCN5a2X55m86KGo5byA5pS+5Yqg55uf5Y+X5Yiw5LqM5omL5aSn6YeP5oiQ5Lq65pWw6YeP5YWx5Lqr5Yy65Z+f5aWz5a2p5Y6f5YiZ5omA5Zyo57uT5p2f6YCa5L+h6LaF57qn6YWN572u5b2T5pe25LyY56eA5oCn5oSf5oi/5Lqn6YGK5oiy5Ye65Y+j5o+Q5Lqk5bCx5Lia5L+d5YGl56iL5bqm5Y+C5pWw5LqL5Lia5pW05Liq5bGx5Lic5oOF5oSf54m55q6K5YiG6aGe5pCc5bCL5bGe5LqO6Zeo5oi36LSi5Yqh5aOw6Z+z5Y+K5YW26LSi57uP5Z2a5oyB5bmy6YOo5oiQ56uL5Yip55uK6ICD6JmR5oiQ6YO95YyF6KOF55So5oi25q+U6LWb5paH5piO5oub5ZWG5a6M5pW055yf5piv55y8552b5LyZ5Ly05aiB5pyb6aKG5Z+f5Y2r55Sf5LyY5oOg6KuW5aOH5YWs5YWx6Imv5aW95YWF5YiG56ym5ZCI6ZmE5Lu254m554K55LiN5Y+v6Iux5paH6LWE5Lqn5qC55pys5piO5pi+5a+G56K85YWs5LyX5rCR5peP5pu05Yqg5Lqr5Y+X5ZCM5a2m5ZCv5Yqo6YCC5ZCI5Y6f5p2l6Zeu562U5pys5paH576O6aOf57u/6Imy56iz5a6a57uI5LqO55Sf54mp5L6b5rGC5pCc54uQ5Yqb6YeP5Lil6YeN5rC46L+c5YaZ55yf5pyJ6ZmQ56ue5LqJ5a+56LGh6LS555So5LiN5aW957ud5a+55Y2B5YiG5L+D6L+b54K56K+E5b2x6Z+z5LyY5Yq/5LiN5bCR5qyj6LWP5bm25LiU5pyJ54K55pa55ZCR5YWo5paw5L+h55So6K6+5pa95b2i6LGh6LWE5qC856qB56C06ZqP552A6YeN5aSn5LqO5piv5q+V5Lia5pm66IO95YyW5bel5a6M576O5ZWG5Z+O57uf5LiA5Ye654mI5omT6YCg55Si5ZOB5qaC5Ya155So5LqO5L+d55WZ5Zug57Sg5Lit5ZyL5a2Y5YKo6LS05Zu+5pyA5oSb6ZW/5pyf5Y+j5Lu355CG6LSi5Z+65Zyw5a6J5o6S5q2m5rGJ6YeM6Z2i5Yib5bu65aSp56m66aaW5YWI5a6M5ZaE6amx5Yqo5LiL6Z2i5LiN5YaN6K+a5L+h5oSP5LmJ6Ziz5YWJ6Iux5Zu95ryC5Lqu5Yab5LqL546p5a62576k5LyX5Yac5rCR5Y2z5Y+v5ZCN56ix5a625YW35Yqo55S75oOz5Yiw5rOo5piO5bCP5a2m5oCn6IO96ICD56CU56Gs5Lu26KeC55yL5riF5qWa5pCe56yR6aaW6aCB6buE6YeR6YCC55So5rGf6IuP55yf5a6e5Li7566h6Zi25q616Ki75YaK57+76K+R5p2D5Yip5YGa5aW95Ly85LmO6YCa6K6v5pa95bel54uA5oWL5Lmf6K64546v5L+d5Z+55YW75qaC5b+15aSn5Z6L5py656Wo55CG6Kej5Yy/5ZCNY3VhbmRvZW52aWFybWFkcmlkYnVzY2FyaW5pY2lvdGllbXBvcG9ycXVlY3VlbnRhZXN0YWRvcHVlZGVuanVlZ29zY29udHJhZXN0w6Fubm9tYnJldGllbmVucGVyZmlsbWFuZXJhYW1pZ29zY2l1ZGFkY2VudHJvYXVucXVlcHVlZGVzZGVudHJvcHJpbWVycHJlY2lvc2Vnw7puYnVlbm9zdm9sdmVycHVudG9zc2VtYW5haGFiw61hYWdvc3RvbnVldm9zdW5pZG9zY2FybG9zZXF1aXBvbmnDsW9zbXVjaG9zYWxndW5hY29ycmVvaW1hZ2VucGFydGlyYXJyaWJhbWFyw61haG9tYnJlZW1wbGVvdmVyZGFkY2FtYmlvbXVjaGFzZnVlcm9ucGFzYWRvbMOtbmVhcGFyZWNlbnVldmFzY3Vyc29zZXN0YWJhcXVpZXJvbGlicm9zY3VhbnRvYWNjZXNvbWlndWVsdmFyaW9zY3VhdHJvdGllbmVzZ3J1cG9zc2Vyw6FuZXVyb3BhbWVkaW9zZnJlbnRlYWNlcmNhZGVtw6Fzb2ZlcnRhY29jaGVzbW9kZWxvaXRhbGlhbGV0cmFzYWxnw7puY29tcHJhY3VhbGVzZXhpc3RlY3VlcnBvc2llbmRvcHJlbnNhbGxlZ2FydmlhamVzZGluZXJvbXVyY2lhcG9kcsOhcHVlc3RvZGlhcmlvcHVlYmxvcXVpZXJlbWFudWVscHJvcGlvY3Jpc2lzY2llcnRvc2VndXJvbXVlcnRlZnVlbnRlY2VycmFyZ3JhbmRlZWZlY3RvcGFydGVzbWVkaWRhcHJvcGlhb2ZyZWNldGllcnJhZS1tYWlsdmFyaWFzZm9ybWFzZnV0dXJvb2JqZXRvc2VndWlycmllc2dvbm9ybWFzbWlzbW9zw7puaWNvY2FtaW5vc2l0aW9zcmF6w7NuZGViaWRvcHJ1ZWJhdG9sZWRvdGVuw61hamVzw7pzZXNwZXJvY29jaW5hb3JpZ2VudGllbmRhY2llbnRvY8OhZGl6aGFibGFyc2Vyw61hbGF0aW5hZnVlcnphZXN0aWxvZ3VlcnJhZW50cmFyw6l4aXRvbMOzcGV6YWdlbmRhdsOtZGVvZXZpdGFycGFnaW5hbWV0cm9zamF2aWVycGFkcmVzZsOhY2lsY2FiZXphw6FyZWFzc2FsaWRhZW52w61vamFww7NuYWJ1c29zYmllbmVzdGV4dG9zbGxldmFycHVlZGFuZnVlcnRlY29tw7puY2xhc2VzaHVtYW5vdGVuaWRvYmlsYmFvdW5pZGFkZXN0w6FzZWRpdGFyY3JlYWRv0LTQu9GP0YfRgtC+0LrQsNC60LjQu9C40Y3RgtC+0LLRgdC10LXQs9C+0L/RgNC40YLQsNC60LXRidC10YPQttC10JrQsNC60LHQtdC30LHRi9C70L7QvdC40JLRgdC10L/QvtC00K3RgtC+0YLQvtC80YfQtdC80L3QtdGC0LvQtdGC0YDQsNC30L7QvdCw0LPQtNC10LzQvdC10JTQu9GP0J/RgNC40L3QsNGB0L3QuNGF0YLQtdC80LrRgtC+0LPQvtC00LLQvtGC0YLQsNC80KHQqNCQ0LzQsNGP0KfRgtC+0LLQsNGB0LLQsNC80LXQvNGD0KLQsNC60LTQstCw0L3QsNC80Y3RgtC40Y3RgtGD0JLQsNC80YLQtdGF0L/RgNC+0YLRg9GC0L3QsNC00LTQvdGP0JLQvtGC0YLRgNC40L3QtdC50JLQsNGB0L3QuNC80YHQsNC80YLQvtGC0YDRg9Cx0J7QvdC40LzQuNGA0L3QtdC10J7QntCe0LvQuNGG0Y3RgtCw0J7QvdCw0L3QtdC80LTQvtC80LzQvtC50LTQstC10L7QvdC+0YHRg9C04KSV4KWH4KS54KWI4KSV4KWA4KS44KWH4KSV4KS+4KSV4KWL4KSU4KSw4KSq4KSw4KSo4KWH4KSP4KSV4KSV4KS/4KSt4KWA4KSH4KS44KSV4KSw4KSk4KWL4KS54KWL4KSG4KSq4KS54KWA4KSv4KS54KSv4KS+4KSk4KSV4KSl4KS+amFncmFu4KSG4KSc4KSc4KWL4KSF4KSs4KSm4KWL4KSX4KSI4KSc4KS+4KSX4KSP4KS54KSu4KSH4KSo4KS14KS54KSv4KWH4KSl4KWH4KSl4KWA4KSY4KSw4KSc4KSs4KSm4KWA4KSV4KSI4KSc4KWA4KS14KWH4KSo4KSI4KSo4KSP4KS54KSw4KSJ4KS44KSu4KWH4KSV4KSu4KS14KWL4KSy4KWH4KS44KSs4KSu4KSI4KSm4KWH4KST4KSw4KSG4KSu4KSs4KS44KSt4KSw4KSs4KSo4KSa4KSy4KSu4KSo4KSG4KSX4KS44KWA4KSy4KWA2LnZhNmJ2KXZhNmJ2YfYsNin2KLYrtix2LnYr9iv2KfZhNmJ2YfYsNmH2LXZiNix2LrZitix2YPYp9mG2YjZhNin2KjZitmG2LnYsdi22LDZhNmD2YfZhtin2YrZiNmF2YLYp9mE2LnZhNmK2KfZhtin2YTZg9mG2K3YqtmJ2YLYqNmE2YjYrdip2KfYrtix2YHZgti32LnYqNiv2LHZg9mG2KXYsNin2YPZhdin2KfYrdiv2KXZhNin2YHZitmH2KjYudi22YPZitmB2KjYrdir2YjZhdmG2YjZh9mI2KPZhtin2KzYr9in2YTZh9in2LPZhNmF2LnZhtiv2YTZitiz2LnYqNix2LXZhNmJ2YXZhtiw2KjZh9in2KPZhtmH2YXYq9mE2YPZhtiq2KfZhNin2K3Zitir2YXYtdix2LTYsdit2K3ZiNmE2YjZgdmK2KfYsNin2YTZg9mE2YXYsdip2KfZhtiq2KfZhNmB2KPYqNmI2K7Yp9i12KPZhtiq2KfZhtmH2KfZhNmK2LnYttmI2YjZgtiv2KfYqNmG2K7Zitix2KjZhtiq2YTZg9mF2LTYp9ih2YjZh9mK2KfYqNmI2YLYtdi12YjZhdin2LHZgtmF2KPYrdiv2YbYrdmG2LnYr9mF2LHYo9mK2KfYrdip2YPYqtio2K/ZiNmG2YrYrNio2YXZhtmH2KrYrdiq2KzZh9ip2LPZhtip2YrYqtmF2YPYsdip2LrYstip2YbZgdiz2KjZitiq2YTZhNmH2YTZhtin2KrZhNmD2YLZhNio2YTZhdin2LnZhtmH2KPZiNmE2LTZitih2YbZiNix2KPZhdin2YHZitmD2KjZg9mE2LDYp9iq2LHYqtio2KjYo9mG2YfZhdiz2KfZhtmD2KjZiti52YHZgtiv2K3Ys9mG2YTZh9mF2LTYudix2KPZh9mE2LTZh9ix2YLYt9ix2LfZhNiocHJvZmlsZXNlcnZpY2VkZWZhdWx0aGltc2VsZmRldGFpbHNjb250ZW50c3VwcG9ydHN0YXJ0ZWRtZXNzYWdlc3VjY2Vzc2Zhc2hpb248dGl0bGU+Y291bnRyeWFjY291bnRjcmVhdGVkc3Rvcmllc3Jlc3VsdHNydW5uaW5ncHJvY2Vzc3dyaXRpbmdvYmplY3RzdmlzaWJsZXdlbGNvbWVhcnRpY2xldW5rbm93bm5ldHdvcmtjb21wYW55ZHluYW1pY2Jyb3dzZXJwcml2YWN5cHJvYmxlbVNlcnZpY2VyZXNwZWN0ZGlzcGxheXJlcXVlc3RyZXNlcnZld2Vic2l0ZWhpc3RvcnlmcmllbmRzb3B0aW9uc3dvcmtpbmd2ZXJzaW9ubWlsbGlvbmNoYW5uZWx3aW5kb3cuYWRkcmVzc3Zpc2l0ZWR3ZWF0aGVyY29ycmVjdHByb2R1Y3RlZGlyZWN0Zm9yd2FyZHlvdSBjYW5yZW1vdmVkc3ViamVjdGNvbnRyb2xhcmNoaXZlY3VycmVudHJlYWRpbmdsaWJyYXJ5bGltaXRlZG1hbmFnZXJmdXJ0aGVyc3VtbWFyeW1hY2hpbmVtaW51dGVzcHJpdmF0ZWNvbnRleHRwcm9ncmFtc29jaWV0eW51bWJlcnN3cml0dGVuZW5hYmxlZHRyaWdnZXJzb3VyY2VzbG9hZGluZ2VsZW1lbnRwYXJ0bmVyZmluYWxseXBlcmZlY3RtZWFuaW5nc3lzdGVtc2tlZXBpbmdjdWx0dXJlJnF1b3Q7LGpvdXJuYWxwcm9qZWN0c3VyZmFjZXMmcXVvdDtleHBpcmVzcmV2aWV3c2JhbGFuY2VFbmdsaXNoQ29udGVudHRocm91Z2hQbGVhc2Ugb3BpbmlvbmNvbnRhY3RhdmVyYWdlcHJpbWFyeXZpbGxhZ2VTcGFuaXNoZ2FsbGVyeWRlY2xpbmVtZWV0aW5nbWlzc2lvbnBvcHVsYXJxdWFsaXR5bWVhc3VyZWdlbmVyYWxzcGVjaWVzc2Vzc2lvbnNlY3Rpb253cml0ZXJzY291bnRlcmluaXRpYWxyZXBvcnRzZmlndXJlc21lbWJlcnNob2xkaW5nZGlzcHV0ZWVhcmxpZXJleHByZXNzZGlnaXRhbHBpY3R1cmVBbm90aGVybWFycmllZHRyYWZmaWNsZWFkaW5nY2hhbmdlZGNlbnRyYWx2aWN0b3J5aW1hZ2VzL3JlYXNvbnNzdHVkaWVzZmVhdHVyZWxpc3RpbmdtdXN0IGJlc2Nob29sc1ZlcnNpb251c3VhbGx5ZXBpc29kZXBsYXlpbmdncm93aW5nb2J2aW91c292ZXJsYXlwcmVzZW50YWN0aW9uczwvdWw+DQp3cmFwcGVyYWxyZWFkeWNlcnRhaW5yZWFsaXR5c3RvcmFnZWFub3RoZXJkZXNrdG9wb2ZmZXJlZHBhdHRlcm51bnVzdWFsRGlnaXRhbGNhcGl0YWxXZWJzaXRlZmFpbHVyZWNvbm5lY3RyZWR1Y2VkQW5kcm9pZGRlY2FkZXNyZWd1bGFyICZhbXA7IGFuaW1hbHNyZWxlYXNlQXV0b21hdGdldHRpbmdtZXRob2Rzbm90aGluZ1BvcHVsYXJjYXB0aW9ubGV0dGVyc2NhcHR1cmVzY2llbmNlbGljZW5zZWNoYW5nZXNFbmdsYW5kPTEmYW1wO0hpc3RvcnkgPSBuZXcgQ2VudHJhbHVwZGF0ZWRTcGVjaWFsTmV0d29ya3JlcXVpcmVjb21tZW50d2FybmluZ0NvbGxlZ2V0b29sYmFycmVtYWluc2JlY2F1c2VlbGVjdGVkRGV1dHNjaGZpbmFuY2V3b3JrZXJzcXVpY2tseWJldHdlZW5leGFjdGx5c2V0dGluZ2Rpc2Vhc2VTb2NpZXR5d2VhcG9uc2V4aGliaXQmbHQ7IS0tQ29udHJvbGNsYXNzZXNjb3ZlcmVkb3V0bGluZWF0dGFja3NkZXZpY2VzKHdpbmRvd3B1cnBvc2V0aXRsZT0iTW9iaWxlIGtpbGxpbmdzaG93aW5nSXRhbGlhbmRyb3BwZWRoZWF2aWx5ZWZmZWN0cy0xJ10pOwpjb25maXJtQ3VycmVudGFkdmFuY2VzaGFyaW5nb3BlbmluZ2RyYXdpbmdiaWxsaW9ub3JkZXJlZEdlcm1hbnlyZWxhdGVkPC9mb3JtPmluY2x1ZGV3aGV0aGVyZGVmaW5lZFNjaWVuY2VjYXRhbG9nQXJ0aWNsZWJ1dHRvbnNsYXJnZXN0dW5pZm9ybWpvdXJuZXlzaWRlYmFyQ2hpY2Fnb2hvbGlkYXlHZW5lcmFscGFzc2FnZSwmcXVvdDthbmltYXRlZmVlbGluZ2Fycml2ZWRwYXNzaW5nbmF0dXJhbHJvdWdobHkuCgpUaGUgYnV0IG5vdGRlbnNpdHlCcml0YWluQ2hpbmVzZWxhY2sgb2Z0cmlidXRlSXJlbGFuZCIgZGF0YS1mYWN0b3JzcmVjZWl2ZXRoYXQgaXNMaWJyYXJ5aHVzYmFuZGluIGZhY3RhZmZhaXJzQ2hhcmxlc3JhZGljYWxicm91Z2h0ZmluZGluZ2xhbmRpbmc6bGFuZz0icmV0dXJuIGxlYWRlcnNwbGFubmVkcHJlbWl1bXBhY2thZ2VBbWVyaWNhRWRpdGlvbl0mcXVvdDtNZXNzYWdlbmVlZCB0b3ZhbHVlPSJjb21wbGV4bG9va2luZ3N0YXRpb25iZWxpZXZlc21hbGxlci1tb2JpbGVyZWNvcmRzd2FudCB0b2tpbmQgb2ZGaXJlZm94eW91IGFyZXNpbWlsYXJzdHVkaWVkbWF4aW11bWhlYWRpbmdyYXBpZGx5Y2xpbWF0ZWtpbmdkb21lbWVyZ2VkYW1vdW50c2ZvdW5kZWRwaW9uZWVyZm9ybXVsYWR5bmFzdHlob3cgdG8gU3VwcG9ydHJldmVudWVlY29ub215UmVzdWx0c2Jyb3RoZXJzb2xkaWVybGFyZ2VseWNhbGxpbmcuJnF1b3Q7QWNjb3VudEVkd2FyZCBzZWdtZW50Um9iZXJ0IGVmZm9ydHNQYWNpZmljbGVhcm5lZHVwIHdpdGhoZWlnaHQ6d2UgaGF2ZUFuZ2VsZXNuYXRpb25zX3NlYXJjaGFwcGxpZWRhY3F1aXJlbWFzc2l2ZWdyYW50ZWQ6IGZhbHNldHJlYXRlZGJpZ2dlc3RiZW5lZml0ZHJpdmluZ1N0dWRpZXNtaW5pbXVtcGVyaGFwc21vcm5pbmdzZWxsaW5naXMgdXNlZHJldmVyc2V2YXJpYW50IHJvbGU9Im1pc3NpbmdhY2hpZXZlcHJvbW90ZXN0dWRlbnRzb21lb25lZXh0cmVtZXJlc3RvcmVib3R0b206ZXZvbHZlZGFsbCB0aGVzaXRlbWFwZW5nbGlzaHdheSB0byAgQXVndXN0c3ltYm9sc0NvbXBhbnltYXR0ZXJzbXVzaWNhbGFnYWluc3RzZXJ2aW5nfSkoKTsNCnBheW1lbnR0cm91YmxlY29uY2VwdGNvbXBhcmVwYXJlbnRzcGxheWVyc3JlZ2lvbnNtb25pdG9yICcnVGhlIHdpbm5pbmdleHBsb3JlYWRhcHRlZEdhbGxlcnlwcm9kdWNlYWJpbGl0eWVuaGFuY2VjYXJlZXJzKS4gVGhlIGNvbGxlY3RTZWFyY2ggYW5jaWVudGV4aXN0ZWRmb290ZXIgaGFuZGxlcnByaW50ZWRjb25zb2xlRWFzdGVybmV4cG9ydHN3aW5kb3dzQ2hhbm5lbGlsbGVnYWxuZXV0cmFsc3VnZ2VzdF9oZWFkZXJzaWduaW5nLmh0bWwiPnNldHRsZWR3ZXN0ZXJuY2F1c2luZy13ZWJraXRjbGFpbWVkSnVzdGljZWNoYXB0ZXJ2aWN0aW1zVGhvbWFzIG1vemlsbGFwcm9taXNlcGFydGllc2VkaXRpb25vdXRzaWRlOmZhbHNlLGh1bmRyZWRPbHltcGljX2J1dHRvbmF1dGhvcnNyZWFjaGVkY2hyb25pY2RlbWFuZHNzZWNvbmRzcHJvdGVjdGFkb3B0ZWRwcmVwYXJlbmVpdGhlcmdyZWF0bHlncmVhdGVyb3ZlcmFsbGltcHJvdmVjb21tYW5kc3BlY2lhbHNlYXJjaC53b3JzaGlwZnVuZGluZ3Rob3VnaHRoaWdoZXN0aW5zdGVhZHV0aWxpdHlxdWFydGVyQ3VsdHVyZXRlc3RpbmdjbGVhcmx5ZXhwb3NlZEJyb3dzZXJsaWJlcmFsfSBjYXRjaFByb2plY3RleGFtcGxlaGlkZSgpO0Zsb3JpZGFhbnN3ZXJzYWxsb3dlZEVtcGVyb3JkZWZlbnNlc2VyaW91c2ZyZWVkb21TZXZlcmFsLWJ1dHRvbkZ1cnRoZXJvdXQgb2YgIT0gbnVsbHRyYWluZWREZW5tYXJrdm9pZCgwKS9hbGwuanNwcmV2ZW50UmVxdWVzdFN0ZXBoZW4KCldoZW4gb2JzZXJ2ZTwvaDI+DQpNb2Rlcm4gcHJvdmlkZSIgYWx0PSJib3JkZXJzLgoKRm9yIAoKTWFueSBhcnRpc3RzcG93ZXJlZHBlcmZvcm1maWN0aW9udHlwZSBvZm1lZGljYWx0aWNrZXRzb3Bwb3NlZENvdW5jaWx3aXRuZXNzanVzdGljZUdlb3JnZSBCZWxnaXVtLi4uPC9hPnR3aXR0ZXJub3RhYmx5d2FpdGluZ3dhcmZhcmUgT3RoZXIgcmFua2luZ3BocmFzZXNtZW50aW9uc3Vydml2ZXNjaG9sYXI8L3A+DQogQ291bnRyeWlnbm9yZWRsb3NzIG9manVzdCBhc0dlb3JnaWFzdHJhbmdlPGhlYWQ+PHN0b3BwZWQxJ10pOw0KaXNsYW5kc25vdGFibGVib3JkZXI6bGlzdCBvZmNhcnJpZWQxMDAsMDAwPC9oMz4KIHNldmVyYWxiZWNvbWVzc2VsZWN0IHdlZGRpbmcwMC5odG1sbW9uYXJjaG9mZiB0aGV0ZWFjaGVyaGlnaGx5IGJpb2xvZ3lsaWZlIG9mb3IgZXZlbnJpc2Ugb2YmcmFxdW87cGx1c29uZWh1bnRpbmcodGhvdWdoRG91Z2xhc2pvaW5pbmdjaXJjbGVzRm9yIHRoZUFuY2llbnRWaWV0bmFtdmVoaWNsZXN1Y2ggYXNjcnlzdGFsdmFsdWUgPVdpbmRvd3NlbmpveWVkYSBzbWFsbGFzc3VtZWQ8YSBpZD0iZm9yZWlnbiBBbGwgcmlob3cgdGhlRGlzcGxheXJldGlyZWRob3dldmVyaGlkZGVuO2JhdHRsZXNzZWVraW5nY2FiaW5ldHdhcyBub3Rsb29rIGF0Y29uZHVjdGdldCB0aGVKYW51YXJ5aGFwcGVuc3R1cm5pbmdhOmhvdmVyT25saW5lIEZyZW5jaCBsYWNraW5ndHlwaWNhbGV4dHJhY3RlbmVtaWVzZXZlbiBpZmdlbmVyYXRkZWNpZGVkYXJlIG5vdC9zZWFyY2hiZWxpZWZzLWltYWdlOmxvY2F0ZWRzdGF0aWMubG9naW4iPmNvbnZlcnR2aW9sZW50ZW50ZXJlZGZpcnN0Ij5jaXJjdWl0RmlubGFuZGNoZW1pc3RzaGUgd2FzMTBweDsiPmFzIHN1Y2hkaXZpZGVkPC9zcGFuPndpbGwgYmVsaW5lIG9mYSBncmVhdG15c3RlcnkvaW5kZXguZmFsbGluZ2R1ZSB0byByYWlsd2F5Y29sbGVnZW1vbnN0ZXJkZXNjZW50aXQgd2l0aG51Y2xlYXJKZXdpc2ggcHJvdGVzdEJyaXRpc2hmbG93ZXJzcHJlZGljdHJlZm9ybXNidXR0b24gd2hvIHdhc2xlY3R1cmVpbnN0YW50c3VpY2lkZWdlbmVyaWNwZXJpb2RzbWFya2V0c1NvY2lhbCBmaXNoaW5nY29tYmluZWdyYXBoaWN3aW5uZXJzPGJyIC8+PGJ5IHRoZSBOYXR1cmFsUHJpdmFjeWNvb2tpZXNvdXRjb21lcmVzb2x2ZVN3ZWRpc2hicmllZmx5UGVyc2lhbnNvIG11Y2hDZW50dXJ5ZGVwaWN0c2NvbHVtbnNob3VzaW5nc2NyaXB0c25leHQgdG9iZWFyaW5nbWFwcGluZ3JldmlzZWRqUXVlcnkoLXdpZHRoOnRpdGxlIj50b29sdGlwU2VjdGlvbmRlc2lnbnNUdXJraXNoeW91bmdlci5tYXRjaCh9KSgpOwoKYnVybmluZ29wZXJhdGVkZWdyZWVzc291cmNlPVJpY2hhcmRjbG9zZWx5cGxhc3RpY2VudHJpZXM8L3RyPg0KY29sb3I6I3VsIGlkPSJwb3NzZXNzcm9sbGluZ3BoeXNpY3NmYWlsaW5nZXhlY3V0ZWNvbnRlc3RsaW5rIHRvRGVmYXVsdDxiciAvPgo6IHRydWUsY2hhcnRlcnRvdXJpc21jbGFzc2ljcHJvY2VlZGV4cGxhaW48L2gxPg0Kb25saW5lLj94bWwgdmVoZWxwaW5nZGlhbW9uZHVzZSB0aGVhaXJsaW5lZW5kIC0tPikuYXR0cihyZWFkZXJzaG9zdGluZyNmZmZmZmZyZWFsaXplVmluY2VudHNpZ25hbHMgc3JjPSIvUHJvZHVjdGRlc3BpdGVkaXZlcnNldGVsbGluZ1B1YmxpYyBoZWxkIGluSm9zZXBoIHRoZWF0cmVhZmZlY3RzPHN0eWxlPmEgbGFyZ2Vkb2Vzbid0bGF0ZXIsIEVsZW1lbnRmYXZpY29uY3JlYXRvckh1bmdhcnlBaXJwb3J0c2VlIHRoZXNvIHRoYXRNaWNoYWVsU3lzdGVtc1Byb2dyYW1zLCBhbmQgIHdpZHRoPWUmcXVvdDt0cmFkaW5nbGVmdCI+CnBlcnNvbnNHb2xkZW4gQWZmYWlyc2dyYW1tYXJmb3JtaW5nZGVzdHJveWlkZWEgb2ZjYXNlIG9mb2xkZXN0IHRoaXMgaXMuc3JjID0gY2FydG9vbnJlZ2lzdHJDb21tb25zTXVzbGltc1doYXQgaXNpbiBtYW55bWFya2luZ3JldmVhbHNJbmRlZWQsZXF1YWxseS9zaG93X2FvdXRkb29yZXNjYXBlKEF1c3RyaWFnZW5ldGljc3lzdGVtLEluIHRoZSBzaXR0aW5nSGUgYWxzb0lzbGFuZHNBY2FkZW15CgkJPCEtLURhbmllbCBiaW5kaW5nYmxvY2siPmltcG9zZWR1dGlsaXplQWJyYWhhbShleGNlcHR7d2lkdGg6cHV0dGluZykuaHRtbCh8fCBbXTsKREFUQVsgKmtpdGNoZW5tb3VudGVkYWN0dWFsIGRpYWxlY3RtYWlubHkgX2JsYW5rJ2luc3RhbGxleHBlcnRzaWYodHlwZUl0IGFsc28mY29weTsgIj5UZXJtc2Jvcm4gaW5PcHRpb25zZWFzdGVybnRhbGtpbmdjb25jZXJuZ2FpbmVkIG9uZ29pbmdqdXN0aWZ5Y3JpdGljc2ZhY3RvcnlpdHMgb3duYXNzYXVsdGludml0ZWRsYXN0aW5naGlzIG93bmhyZWY9Ii8iIHJlbD0iZGV2ZWxvcGNvbmNlcnRkaWFncmFtZG9sbGFyc2NsdXN0ZXJwaHA/aWQ9YWxjb2hvbCk7fSkoKTt1c2luZyBhPjxzcGFuPnZlc3NlbHNyZXZpdmFsQWRkcmVzc2FtYXRldXJhbmRyb2lkYWxsZWdlZGlsbG5lc3N3YWxraW5nY2VudGVyc3F1YWxpZnltYXRjaGVzdW5pZmllZGV4dGluY3REZWZlbnNlZGllZCBpbgoJPCEtLSBjdXN0b21zbGlua2luZ0xpdHRsZSBCb29rIG9mZXZlbmluZ21pbi5qcz9hcmUgdGhla29udGFrdHRvZGF5J3MuaHRtbCIgdGFyZ2V0PXdlYXJpbmdBbGwgUmlnOwp9KSgpO3JhaXNpbmcgQWxzbywgY3J1Y2lhbGFib3V0Ij5kZWNsYXJlLS0+CjxzY2ZpcmVmb3hhcyBtdWNoYXBwbGllc2luZGV4LCBzLCBidXQgdHlwZSA9IAoNCjwhLS10b3dhcmRzUmVjb3Jkc1ByaXZhdGVGb3JlaWduUHJlbWllcmNob2ljZXNWaXJ0dWFscmV0dXJuc0NvbW1lbnRQb3dlcmVkaW5saW5lO3BvdmVydHljaGFtYmVyTGl2aW5nIHZvbHVtZXNBbnRob255bG9naW4iIFJlbGF0ZWRFY29ub215cmVhY2hlc2N1dHRpbmdncmF2aXR5bGlmZSBpbkNoYXB0ZXItc2hhZG93Tm90YWJsZTwvdGQ+DQogcmV0dXJuc3RhZGl1bXdpZGdldHN2YXJ5aW5ndHJhdmVsc2hlbGQgYnl3aG8gYXJld29yayBpbmZhY3VsdHlhbmd1bGFyd2hvIGhhZGFpcnBvcnR0b3duIG9mCgpTb21lICdjbGljaydjaGFyZ2Vza2V5d29yZGl0IHdpbGxjaXR5IG9mKHRoaXMpO0FuZHJldyB1bmlxdWUgY2hlY2tlZG9yIG1vcmUzMDBweDsgcmV0dXJuO3JzaW9uPSJwbHVnaW5zd2l0aGluIGhlcnNlbGZTdGF0aW9uRmVkZXJhbHZlbnR1cmVwdWJsaXNoc2VudCB0b3RlbnNpb25hY3RyZXNzY29tZSB0b2ZpbmdlcnNEdWtlIG9mcGVvcGxlLGV4cGxvaXR3aGF0IGlzaGFybW9ueWEgbWFqb3IiOiJodHRwaW4gaGlzIG1lbnUiPgptb250aGx5b2ZmaWNlcmNvdW5jaWxnYWluaW5nZXZlbiBpblN1bW1hcnlkYXRlIG9mbG95YWx0eWZpdG5lc3NhbmQgd2FzZW1wZXJvcnN1cHJlbWVTZWNvbmQgaGVhcmluZ1J1c3NpYW5sb25nZXN0QWxiZXJ0YWxhdGVyYWxzZXQgb2Ygc21hbGwiPi5hcHBlbmRkbyB3aXRoZmVkZXJhbGJhbmsgb2ZiZW5lYXRoRGVzcGl0ZUNhcGl0YWxncm91bmRzKSwgYW5kIHBlcmNlbnRpdCBmcm9tY2xvc2luZ2NvbnRhaW5JbnN0ZWFkZmlmdGVlbmFzIHdlbGwueWFob28ucmVzcG9uZGZpZ2h0ZXJvYnNjdXJlcmVmbGVjdG9yZ2FuaWM9IE1hdGguZWRpdGluZ29ubGluZSBwYWRkaW5nYSB3aG9sZW9uZXJyb3J5ZWFyIG9mZW5kIG9mIGJhcnJpZXJ3aGVuIGl0aGVhZGVyIGhvbWUgb2ZyZXN1bWVkcmVuYW1lZHN0cm9uZz5oZWF0aW5ncmV0YWluc2Nsb3VkZnJ3YXkgb2YgTWFyY2ggMWtub3dpbmdpbiBwYXJ0QmV0d2Vlbmxlc3NvbnNjbG9zZXN0dmlydHVhbGxpbmtzIj5jcm9zc2VkRU5EIC0tPmZhbW91cyBhd2FyZGVkTGljZW5zZUhlYWx0aCBmYWlybHkgd2VhbHRoeW1pbmltYWxBZnJpY2FuY29tcGV0ZWxhYmVsIj5zaW5naW5nZmFybWVyc0JyYXNpbClkaXNjdXNzcmVwbGFjZUdyZWdvcnlmb250IGNvcHVyc3VlZGFwcGVhcnNtYWtlIHVwcm91bmRlZGJvdGggb2ZibG9ja2Vkc2F3IHRoZW9mZmljZXNjb2xvdXJzaWYoZG9jdXdoZW4gaGVlbmZvcmNlcHVzaChmdUF1Z3VzdCBVVEYtOCI+RmFudGFzeWluIG1vc3Rpbmp1cmVkVXN1YWxseWZhcm1pbmdjbG9zdXJlb2JqZWN0IGRlZmVuY2V1c2Ugb2YgTWVkaWNhbDxib2R5PgpldmlkZW50YmUgdXNlZGtleUNvZGVzaXh0ZWVuSXNsYW1pYyMwMDAwMDBlbnRpcmUgd2lkZWx5IGFjdGl2ZSAodHlwZW9mb25lIGNhbmNvbG9yID1zcGVha2VyZXh0ZW5kc1BoeXNpY3N0ZXJyYWluPHRib2R5PmZ1bmVyYWx2aWV3aW5nbWlkZGxlIGNyaWNrZXRwcm9waGV0c2hpZnRlZGRvY3RvcnNSdXNzZWxsIHRhcmdldGNvbXBhY3RhbGdlYnJhc29jaWFsLWJ1bGsgb2ZtYW4gYW5kPC90ZD4KIGhlIGxlZnQpLnZhbCgpZmFsc2UpO2xvZ2ljYWxiYW5raW5naG9tZSB0b25hbWluZyBBcml6b25hY3JlZGl0cyk7Cn0pOwpmb3VuZGVyaW4gdHVybkNvbGxpbnNiZWZvcmUgQnV0IHRoZWNoYXJnZWRUaXRsZSI+Q2FwdGFpbnNwZWxsZWRnb2RkZXNzVGFnIC0tPkFkZGluZzpidXQgd2FzUmVjZW50IHBhdGllbnRiYWNrIGluPWZhbHNlJkxpbmNvbG53ZSBrbm93Q291bnRlckp1ZGFpc21zY3JpcHQgYWx0ZXJlZCddKTsKICBoYXMgdGhldW5jbGVhckV2ZW50Jyxib3RoIGlubm90IGFsbAoKPCEtLSBwbGFjaW5naGFyZCB0byBjZW50ZXJzb3J0IG9mY2xpZW50c3N0cmVldHNCZXJuYXJkYXNzZXJ0c3RlbmQgdG9mYW50YXN5ZG93biBpbmhhcmJvdXJGcmVlZG9tamV3ZWxyeS9hYm91dC4uc2VhcmNobGVnZW5kc2lzIG1hZGVtb2Rlcm4gb25seSBvbm9ubHkgdG9pbWFnZSIgbGluZWFyIHBhaW50ZXJhbmQgbm90cmFyZWx5IGFjcm9ueW1kZWxpdmVyc2hvcnRlcjAwJmFtcDthcyBtYW55d2lkdGg9Ii8qIDwhW0N0aXRsZSA9b2YgdGhlIGxvd2VzdCBwaWNrZWQgZXNjYXBlZHVzZXMgb2ZwZW9wbGVzIFB1YmxpY01hdHRoZXd0YWN0aWNzZGFtYWdlZHdheSBmb3JsYXdzIG9mZWFzeSB0byB3aW5kb3dzdHJvbmcgIHNpbXBsZX1jYXRjaChzZXZlbnRoaW5mb2JveHdlbnQgdG9wYWludGVkY2l0aXplbkkgZG9uJ3RyZXRyZWF0LiBTb21lIHd3LiIpOwpib21iaW5nbWFpbHRvOm1hZGUgaW4uIE1hbnkgY2Fycmllc3x8e307d2l3b3JrIG9mc3lub255bWRlZmVhdHNmYXZvcmVkb3B0aWNhbHBhZ2VUcmF1bmxlc3Mgc2VuZGluZ2xlZnQiPjxjb21TY29yQWxsIHRoZWpRdWVyeS50b3VyaXN0Q2xhc3NpY2ZhbHNlIiBXaWxoZWxtc3VidXJic2dlbnVpbmViaXNob3BzLnNwbGl0KGdsb2JhbCBmb2xsb3dzYm9keSBvZm5vbWluYWxDb250YWN0c2VjdWxhcmxlZnQgdG9jaGllZmx5LWhpZGRlbi1iYW5uZXI8L2xpPgoKLiBXaGVuIGluIGJvdGhkaXNtaXNzRXhwbG9yZWFsd2F5cyB2aWEgdGhlc3Bhw7FvbHdlbGZhcmVydWxpbmcgYXJyYW5nZWNhcHRhaW5oaXMgc29ucnVsZSBvZmhlIHRvb2tpdHNlbGYsPTAmYW1wOyhjYWxsZWRzYW1wbGVzdG8gbWFrZWNvbS9wYWdNYXJ0aW4gS2VubmVkeWFjY2VwdHNmdWxsIG9maGFuZGxlZEJlc2lkZXMvLy0tPjwvYWJsZSB0b3RhcmdldHNlc3NlbmNlaGltIHRvIGl0cyBieSBjb21tb24ubWluZXJhbHRvIHRha2V3YXlzIHRvcy5vcmcvbGFkdmlzZWRwZW5hbHR5c2ltcGxlOmlmIHRoZXlMZXR0ZXJzYSBzaG9ydEhlcmJlcnRzdHJpa2VzIGdyb3Vwcy5sZW5ndGhmbGlnaHRzb3ZlcmxhcHNsb3dseSBsZXNzZXIgc29jaWFsIDwvcD4KCQlpdCBpbnRvcmFua2VkIHJhdGUgb2Z1bD4NCiAgYXR0ZW1wdHBhaXIgb2ZtYWtlIGl0S29udGFrdEFudG9uaW9oYXZpbmcgcmF0aW5ncyBhY3RpdmVzdHJlYW1zdHJhcHBlZCIpLmNzcyhob3N0aWxlbGVhZCB0b2xpdHRsZSBncm91cHMsUGljdHVyZS0tPg0KDQogcm93cz0iIG9iamVjdGludmVyc2U8Zm9vdGVyQ3VzdG9tVj48XC9zY3Jzb2x2aW5nQ2hhbWJlcnNsYXZlcnl3b3VuZGVkd2hlcmVhcyE9ICd1bmRmb3IgYWxscGFydGx5IC1yaWdodDpBcmFiaWFuYmFja2VkIGNlbnR1cnl1bml0IG9mbW9iaWxlLUV1cm9wZSxpcyBob21lcmlzayBvZmRlc2lyZWRDbGludG9uY29zdCBvZmFnZSBvZiBiZWNvbWUgbm9uZSBvZnAmcXVvdDtNaWRkbGUgZWFkJylbMENyaXRpY3NzdHVkaW9zPiZjb3B5O2dyb3VwIj5hc3NlbWJsbWFraW5nIHByZXNzZWR3aWRnZXQucHM6IiA/IHJlYnVpbHRieSBzb21lRm9ybWVyIGVkaXRvcnNkZWxheWVkQ2Fub25pY2hhZCB0aGVwdXNoaW5nY2xhc3M9ImJ1dCBhcmVwYXJ0aWFsQmFieWxvbmJvdHRvbSBjYXJyaWVyQ29tbWFuZGl0cyB1c2VBcyB3aXRoY291cnNlc2EgdGhpcmRkZW5vdGVzYWxzbyBpbkhvdXN0b24yMHB4OyI+YWNjdXNlZGRvdWJsZSBnb2FsIG9mRmFtb3VzICkuYmluZChwcmllc3RzIE9ubGluZWluIEp1bHlzdCArICJnY29uc3VsdGRlY2ltYWxoZWxwZnVscmV2aXZlZGlzIHZlcnlyJysnaXB0bG9zaW5nIGZlbWFsZXNpcyBhbHNvc3RyaW5nc2RheXMgb2ZhcnJpdmFsZnV0dXJlIDxvYmplY3Rmb3JjaW5nU3RyaW5nKCIgLz4KCQloZXJlIGlzZW5jb2RlZC4gIFRoZSBiYWxsb29uZG9uZSBieS9jb21tb25iZ2NvbG9ybGF3IG9mIEluZGlhbmFhdm9pZGVkYnV0IHRoZTJweCAzcHhqcXVlcnkuYWZ0ZXIgYXBvbGljeS5tZW4gYW5kZm9vdGVyLT0gdHJ1ZTtmb3IgdXNlc2NyZWVuLkluZGlhbiBpbWFnZSA9ZmFtaWx5LGh0dHA6Ly8gJm5ic3A7ZHJpdmVyc2V0ZXJuYWxzYW1lIGFzbm90aWNlZHZpZXdlcnN9KSgpOwogaXMgbW9yZXNlYXNvbnNmb3JtZXIgdGhlIG5ld2lzIGp1c3Rjb25zZW50IFNlYXJjaHdhcyB0aGV3aHkgdGhlc2hpcHBlZGJyPjxicj53aWR0aDogaGVpZ2h0PW1hZGUgb2ZjdWlzaW5laXMgdGhhdGEgdmVyeSBBZG1pcmFsIGZpeGVkO25vcm1hbCBNaXNzaW9uUHJlc3MsIG9udGFyaW9jaGFyc2V0dHJ5IHRvIGludmFkZWQ9InRydWUic3BhY2luZ2lzIG1vc3RhIG1vcmUgdG90YWxseWZhbGwgb2Z9KTsNCiAgaW1tZW5zZXRpbWUgaW5zZXQgb3V0c2F0aXNmeXRvIGZpbmRkb3duIHRvbG90IG9mIFBsYXllcnNpbiBKdW5lcXVhbnR1bW5vdCB0aGV0aW1lIHRvZGlzdGFudEZpbm5pc2hzcmMgPSAoc2luZ2xlIGhlbHAgb2ZHZXJtYW4gbGF3IGFuZGxhYmVsZWRmb3Jlc3RzY29va2luZ3NwYWNlIj5oZWFkZXItd2VsbCBhc1N0YW5sZXlicmlkZ2VzL2dsb2JhbENyb2F0aWEgQWJvdXQgWzBdOwogIGl0LCBhbmRncm91cGVkYmVpbmcgYSl7dGhyb3doZSBtYWRlbGlnaHRlcmV0aGljYWxGRkZGRkYiYm90dG9tImxpa2UgYSBlbXBsb3lzbGl2ZSBpbmFzIHNlZW5wcmludGVybW9zdCBvZnViLWxpbmtyZWplY3RzYW5kIHVzZWltYWdlIj5zdWNjZWVkZmVlZGluZ051Y2xlYXJpbmZvcm1hdG8gaGVscFdvbWVuJ3NOZWl0aGVyTWV4aWNhbnByb3RlaW48dGFibGUgYnkgbWFueWhlYWx0aHlsYXdzdWl0ZGV2aXNlZC5wdXNoKHtzZWxsZXJzc2ltcGx5IFRocm91Z2guY29va2llIEltYWdlKG9sZGVyIj51cy5qcyI+IFNpbmNlIHVuaXZlcnNsYXJnZXIgb3BlbiB0byEtLSBlbmRsaWVzIGluJ10pOw0KICBtYXJrZXR3aG8gaXMgKCJET01Db21hbmFnZWRvbmUgZm9ydHlwZW9mIEtpbmdkb21wcm9maXRzcHJvcG9zZXRvIHNob3djZW50ZXI7bWFkZSBpdGRyZXNzZWR3ZXJlIGlubWl4dHVyZXByZWNpc2VhcmlzaW5nc3JjID0gJ21ha2UgYSBzZWN1cmVkQmFwdGlzdHZvdGluZyAKCQl2YXIgTWFyY2ggMmdyZXcgdXBDbGltYXRlLnJlbW92ZXNraWxsZWR3YXkgdGhlPC9oZWFkPmZhY2Ugb2ZhY3RpbmcgcmlnaHQiPnRvIHdvcmtyZWR1Y2VzaGFzIGhhZGVyZWN0ZWRzaG93KCk7YWN0aW9uPWJvb2sgb2ZhbiBhcmVhPT0gImh0dDxoZWFkZXIKPGh0bWw+Y29uZm9ybWZhY2luZyBjb29raWUucmVseSBvbmhvc3RlZCAuY3VzdG9taGUgd2VudGJ1dCBmb3JzcHJlYWQgRmFtaWx5IGEgbWVhbnNvdXQgdGhlZm9ydW1zLmZvb3RhZ2UiPk1vYmlsQ2xlbWVudHMiIGlkPSJhcyBoaWdoaW50ZW5zZS0tPjwhLS1mZW1hbGUgaXMgc2VlbmltcGxpZWRzZXQgdGhlYSBzdGF0ZWFuZCBoaXNmYXN0ZXN0YmVzaWRlc2J1dHRvbl9ib3VuZGVkIj48aW1nIEluZm9ib3hldmVudHMsYSB5b3VuZ2FuZCBhcmVOYXRpdmUgY2hlYXBlclRpbWVvdXRhbmQgaGFzZW5naW5lc3dvbiB0aGUobW9zdGx5cmlnaHQ6IGZpbmQgYSAtYm90dG9tUHJpbmNlIGFyZWEgb2Ztb3JlIG9mc2VhcmNoX25hdHVyZSxsZWdhbGx5cGVyaW9kLGxhbmQgb2ZvciB3aXRoaW5kdWNlZHByb3ZpbmdtaXNzaWxlbG9jYWxseUFnYWluc3R0aGUgd2F5ayZxdW90O3B4OyI+DQpwdXNoZWQgYWJhbmRvbm51bWVyYWxDZXJ0YWluSW4gdGhpc21vcmUgaW5vciBzb21lbmFtZSBpc2FuZCwgaW5jcm93bmVkSVNCTiAwLWNyZWF0ZXNPY3RvYmVybWF5IG5vdGNlbnRlciBsYXRlIGluRGVmZW5jZWVuYWN0ZWR3aXNoIHRvYnJvYWRseWNvb2xpbmdvbmxvYWQ9aXQuIFRoZXJlY292ZXJNZW1iZXJzaGVpZ2h0IGFzc3VtZXM8aHRtbD4KcGVvcGxlLmluIG9uZSA9d2luZG93Zm9vdGVyX2EgZ29vZCByZWtsYW1hb3RoZXJzLHRvIHRoaXNfY29va2llcGFuZWwiPkxvbmRvbixkZWZpbmVzY3J1c2hlZGJhcHRpc21jb2FzdGFsc3RhdHVzIHRpdGxlIiBtb3ZlIHRvbG9zdCBpbmJldHRlciBpbXBsaWVzcml2YWxyeXNlcnZlcnMgU3lzdGVtUGVyaGFwc2VzIGFuZCBjb250ZW5kZmxvd2luZ2xhc3RlZCByaXNlIGluR2VuZXNpc3ZpZXcgb2ZyaXNpbmcgc2VlbSB0b2J1dCBpbiBiYWNraW5naGUgd2lsbGdpdmVuIGFnaXZpbmcgY2l0aWVzLmZsb3cgb2YgTGF0ZXIgYWxsIGJ1dEhpZ2h3YXlvbmx5IGJ5c2lnbiBvZmhlIGRvZXNkaWZmZXJzYmF0dGVyeSZhbXA7bGFzaW5nbGVzdGhyZWF0c2ludGVnZXJ0YWtlIG9ucmVmdXNlZGNhbGxlZCA9VVMmYW1wU2VlIHRoZW5hdGl2ZXNieSB0aGlzc3lzdGVtLmhlYWQgb2Y6aG92ZXIsbGVzYmlhbnN1cm5hbWVhbmQgYWxsY29tbW9uL2hlYWRlcl9fcGFyYW1zSGFydmFyZC9waXhlbC5yZW1vdmFsc28gbG9uZ3JvbGUgb2Zqb2ludGx5c2t5c2NyYVVuaWNvZGViciAvPg0KQXRsYW50YW51Y2xldXNDb3VudHkscHVyZWx5IGNvdW50Ij5lYXNpbHkgYnVpbGQgYW9uY2xpY2thIGdpdmVucG9pbnRlcmgmcXVvdDtldmVudHMgZWxzZSB7CmRpdGlvbnNub3cgdGhlLCB3aXRoIG1hbiB3aG9vcmcvV2Vib25lIGFuZGNhdmFscnlIZSBkaWVkc2VhdHRsZTAwLDAwMCB7d2luZG93aGF2ZSB0b2lmKHdpbmRhbmQgaXRzc29sZWx5IG0mcXVvdDtyZW5ld2VkRGV0cm9pdGFtb25nc3RlaXRoZXIgdGhlbSBpblNlbmF0b3JVczwvYT48S2luZyBvZkZyYW5jaXMtcHJvZHVjaGUgdXNlZGFydCBhbmRoaW0gYW5kdXNlZCBieXNjb3JpbmdhdCBob21ldG8gaGF2ZXJlbGF0ZXNpYmlsaXR5ZmFjdGlvbkJ1ZmZhbG9saW5rIj48d2hhdCBoZWZyZWUgdG9DaXR5IG9mY29tZSBpbnNlY3RvcnNjb3VudGVkb25lIGRheW5lcnZvdXNzcXVhcmUgfTtpZihnb2luIHdoYXRpbWciIGFsaXMgb25seXNlYXJjaC90dWVzZGF5bG9vc2VseVNvbG9tb25zZXh1YWwgLSA8YSBocm1lZGl1bSJETyBOT1QgRnJhbmNlLHdpdGggYSB3YXIgYW5kc2Vjb25kIHRha2UgYSA+DQoNCg0KbWFya2V0LmhpZ2h3YXlkb25lIGluY3Rpdml0eSJsYXN0Ij5vYmxpZ2VkcmlzZSB0byJ1bmRlZmltYWRlIHRvIEVhcmx5IHByYWlzZWRpbiBpdHMgZm9yIGhpc2F0aGxldGVKdXBpdGVyWWFob28hIHRlcm1lZCBzbyBtYW55cmVhbGx5IHMuIFRoZSBhIHdvbWFuP3ZhbHVlPWRpcmVjdCByaWdodCIgYmljeWNsZWFjaW5nPSJkYXkgYW5kc3RhdGluZ1JhdGhlcixoaWdoZXIgT2ZmaWNlIGFyZSBub3d0aW1lcywgd2hlbiBhIHBheSBmb3JvbiB0aGlzLWxpbmsiPjtib3JkZXJhcm91bmQgYW5udWFsIHRoZSBOZXdwdXQgdGhlLmNvbSIgdGFraW4gdG9hIGJyaWVmKGluIHRoZWdyb3Vwcy47IHdpZHRoZW56eW1lc3NpbXBsZSBpbiBsYXRle3JldHVybnRoZXJhcHlhIHBvaW50YmFubmluZ2lua3MiPgooKTsiIHJlYSBwbGFjZVx1MDAzQ2FhYm91dCBhdHI+DQoJCWNjb3VudCBnaXZlcyBhPFNDUklQVFJhaWx3YXl0aGVtZXMvdG9vbGJveEJ5SWQoInhodW1hbnMsd2F0Y2hlc2luIHNvbWUgaWYgKHdpY29taW5nIGZvcm1hdHMgVW5kZXIgYnV0IGhhc2hhbmRlZCBtYWRlIGJ5dGhhbiBpbmZlYXIgb2ZkZW5vdGVkL2lmcmFtZWxlZnQgaW52b2x0YWdlaW4gZWFjaGEmcXVvdDtiYXNlIG9mSW4gbWFueXVuZGVyZ29yZWdpbWVzYWN0aW9uIDwvcD4NCjx1c3RvbVZhOyZndDs8L2ltcG9ydHNvciB0aGF0bW9zdGx5ICZhbXA7cmUgc2l6ZT0iPC9hPjwvaGEgY2xhc3NwYXNzaXZlSG9zdCA9IFdoZXRoZXJmZXJ0aWxlVmFyaW91cz1bXTsoZnVjYW1lcmFzLz48L3RkPmFjdHMgYXNJbiBzb21lPg0KDQo8IW9yZ2FuaXMgPGJyIC8+QmVpamluZ2NhdGFsw6BkZXV0c2NoZXVyb3BldWV1c2thcmFnYWVpbGdlc3ZlbnNrYWVzcGHDsWFtZW5zYWpldXN1YXJpb3RyYWJham9tw6l4aWNvcMOhZ2luYXNpZW1wcmVzaXN0ZW1hb2N0dWJyZWR1cmFudGVhw7FhZGlyZW1wcmVzYW1vbWVudG9udWVzdHJvcHJpbWVyYXRyYXbDqXNncmFjaWFzbnVlc3RyYXByb2Nlc29lc3RhZG9zY2FsaWRhZHBlcnNvbmFuw7ptZXJvYWN1ZXJkb23DunNpY2FtaWVtYnJvb2ZlcnRhc2FsZ3Vub3NwYcOtc2VzZWplbXBsb2RlcmVjaG9hZGVtw6FzcHJpdmFkb2FncmVnYXJlbmxhY2VzcG9zaWJsZWhvdGVsZXNzZXZpbGxhcHJpbWVyb8O6bHRpbW9ldmVudG9zYXJjaGl2b2N1bHR1cmFtdWplcmVzZW50cmFkYWFudW5jaW9lbWJhcmdvbWVyY2Fkb2dyYW5kZXNlc3R1ZGlvbWVqb3Jlc2ZlYnJlcm9kaXNlw7FvdHVyaXNtb2PDs2RpZ29wb3J0YWRhZXNwYWNpb2ZhbWlsaWFhbnRvbmlvcGVybWl0ZWd1YXJkYXJhbGd1bmFzcHJlY2lvc2FsZ3VpZW5zZW50aWRvdmlzaXRhc3TDrXR1bG9jb25vY2Vyc2VndW5kb2NvbnNlam9mcmFuY2lhbWludXRvc3NlZ3VuZGF0ZW5lbW9zZWZlY3Rvc23DoWxhZ2FzZXNpw7NucmV2aXN0YWdyYW5hZGFjb21wcmFyaW5ncmVzb2dhcmPDrWFhY2Npw7NuZWN1YWRvcnF1aWVuZXNpbmNsdXNvZGViZXLDoW1hdGVyaWFob21icmVzbXVlc3RyYXBvZHLDrWFtYcOxYW5hw7psdGltYWVzdGFtb3NvZmljaWFsdGFtYmllbm5pbmfDum5zYWx1ZG9zcG9kZW1vc21lam9yYXJwb3NpdGlvbmJ1c2luZXNzaG9tZXBhZ2VzZWN1cml0eWxhbmd1YWdlc3RhbmRhcmRjYW1wYWlnbmZlYXR1cmVzY2F0ZWdvcnlleHRlcm5hbGNoaWxkcmVucmVzZXJ2ZWRyZXNlYXJjaGV4Y2hhbmdlZmF2b3JpdGV0ZW1wbGF0ZW1pbGl0YXJ5aW5kdXN0cnlzZXJ2aWNlc21hdGVyaWFscHJvZHVjdHN6LWluZGV4OmNvbW1lbnRzc29mdHdhcmVjb21wbGV0ZWNhbGVuZGFycGxhdGZvcm1hcnRpY2xlc3JlcXVpcmVkbW92ZW1lbnRxdWVzdGlvbmJ1aWxkaW5ncG9saXRpY3Nwb3NzaWJsZXJlbGlnaW9ucGh5c2ljYWxmZWVkYmFja3JlZ2lzdGVycGljdHVyZXNkaXNhYmxlZHByb3RvY29sYXVkaWVuY2VzZXR0aW5nc2FjdGl2aXR5ZWxlbWVudHNsZWFybmluZ2FueXRoaW5nYWJzdHJhY3Rwcm9ncmVzc292ZXJ2aWV3bWFnYXppbmVlY29ub21pY3RyYWluaW5ncHJlc3N1cmV2YXJpb3VzIDxzdHJvbmc+cHJvcGVydHlzaG9wcGluZ3RvZ2V0aGVyYWR2YW5jZWRiZWhhdmlvcmRvd25sb2FkZmVhdHVyZWRmb290YmFsbHNlbGVjdGVkTGFuZ3VhZ2VkaXN0YW5jZXJlbWVtYmVydHJhY2tpbmdwYXNzd29yZG1vZGlmaWVkc3R1ZGVudHNkaXJlY3RseWZpZ2h0aW5nbm9ydGhlcm5kYXRhYmFzZWZlc3RpdmFsYnJlYWtpbmdsb2NhdGlvbmludGVybmV0ZHJvcGRvd25wcmFjdGljZWV2aWRlbmNlZnVuY3Rpb25tYXJyaWFnZXJlc3BvbnNlcHJvYmxlbXNuZWdhdGl2ZXByb2dyYW1zYW5hbHlzaXNyZWxlYXNlZGJhbm5lciI+cHVyY2hhc2Vwb2xpY2llc3JlZ2lvbmFsY3JlYXRpdmVhcmd1bWVudGJvb2ttYXJrcmVmZXJyZXJjaGVtaWNhbGRpdmlzaW9uY2FsbGJhY2tzZXBhcmF0ZXByb2plY3RzY29uZmxpY3RoYXJkd2FyZWludGVyZXN0ZGVsaXZlcnltb3VudGFpbm9idGFpbmVkPSBmYWxzZTtmb3IodmFyIGFjY2VwdGVkY2FwYWNpdHljb21wdXRlcmlkZW50aXR5YWlyY3JhZnRlbXBsb3llZHByb3Bvc2VkZG9tZXN0aWNpbmNsdWRlc3Byb3ZpZGVkaG9zcGl0YWx2ZXJ0aWNhbGNvbGxhcHNlYXBwcm9hY2hwYXJ0bmVyc2xvZ28iPjxhZGF1Z2h0ZXJhdXRob3IiIGN1bHR1cmFsZmFtaWxpZXMvaW1hZ2VzL2Fzc2VtYmx5cG93ZXJmdWx0ZWFjaGluZ2ZpbmlzaGVkZGlzdHJpY3Rjcml0aWNhbGNnaS1iaW4vcHVycG9zZXNyZXF1aXJlc2VsZWN0aW9uYmVjb21pbmdwcm92aWRlc2FjYWRlbWljZXhlcmNpc2VhY3R1YWxseW1lZGljaW5lY29uc3RhbnRhY2NpZGVudE1hZ2F6aW5lZG9jdW1lbnRzdGFydGluZ2JvdHRvbSI+b2JzZXJ2ZWQ6ICZxdW90O2V4dGVuZGVkcHJldmlvdXNTb2Z0d2FyZWN1c3RvbWVyZGVjaXNpb25zdHJlbmd0aGRldGFpbGVkc2xpZ2h0bHlwbGFubmluZ3RleHRhcmVhY3VycmVuY3lldmVyeW9uZXN0cmFpZ2h0dHJhbnNmZXJwb3NpdGl2ZXByb2R1Y2VkaGVyaXRhZ2VzaGlwcGluZ2Fic29sdXRlcmVjZWl2ZWRyZWxldmFudGJ1dHRvbiIgdmlvbGVuY2Vhbnl3aGVyZWJlbmVmaXRzbGF1bmNoZWRyZWNlbnRseWFsbGlhbmNlZm9sbG93ZWRtdWx0aXBsZWJ1bGxldGluaW5jbHVkZWRvY2N1cnJlZGludGVybmFsJCh0aGlzKS5yZXB1YmxpYz48dHI+PHRkY29uZ3Jlc3NyZWNvcmRlZHVsdGltYXRlc29sdXRpb248dWwgaWQ9ImRpc2NvdmVySG9tZTwvYT53ZWJzaXRlc25ldHdvcmtzYWx0aG91Z2hlbnRpcmVseW1lbW9yaWFsbWVzc2FnZXNjb250aW51ZWFjdGl2ZSI+c29tZXdoYXR2aWN0b3JpYVdlc3Rlcm4gIHRpdGxlPSJMb2NhdGlvbmNvbnRyYWN0dmlzaXRvcnNEb3dubG9hZHdpdGhvdXQgcmlnaHQiPgptZWFzdXJlc3dpZHRoID0gdmFyaWFibGVpbnZvbHZlZHZpcmdpbmlhbm9ybWFsbHloYXBwZW5lZGFjY291bnRzc3RhbmRpbmduYXRpb25hbFJlZ2lzdGVycHJlcGFyZWRjb250cm9sc2FjY3VyYXRlYmlydGhkYXlzdHJhdGVneW9mZmljaWFsZ3JhcGhpY3NjcmltaW5hbHBvc3NpYmx5Y29uc3VtZXJQZXJzb25hbHNwZWFraW5ndmFsaWRhdGVhY2hpZXZlZC5qcGciIC8+bWFjaGluZXM8L2gyPgogIGtleXdvcmRzZnJpZW5kbHlicm90aGVyc2NvbWJpbmVkb3JpZ2luYWxjb21wb3NlZGV4cGVjdGVkYWRlcXVhdGVwYWtpc3RhbmZvbGxvdyIgdmFsdWFibGU8L2xhYmVsPnJlbGF0aXZlYnJpbmdpbmdpbmNyZWFzZWdvdmVybm9ycGx1Z2lucy9MaXN0IG9mIEhlYWRlciI+IiBuYW1lPSIgKCZxdW90O2dyYWR1YXRlPC9oZWFkPgpjb21tZXJjZW1hbGF5c2lhZGlyZWN0b3JtYWludGFpbjtoZWlnaHQ6c2NoZWR1bGVjaGFuZ2luZ2JhY2sgdG8gY2F0aG9saWNwYXR0ZXJuc2NvbG9yOiAjZ3JlYXRlc3RzdXBwbGllc3JlbGlhYmxlPC91bD4KCQk8c2VsZWN0IGNpdGl6ZW5zY2xvdGhpbmd3YXRjaGluZzxsaSBpZD0ic3BlY2lmaWNjYXJyeWluZ3NlbnRlbmNlPGNlbnRlcj5jb250cmFzdHRoaW5raW5nY2F0Y2goZSlzb3V0aGVybk1pY2hhZWwgbWVyY2hhbnRjYXJvdXNlbHBhZGRpbmc6aW50ZXJpb3Iuc3BsaXQoImxpemF0aW9uT2N0b2JlciApe3JldHVybmltcHJvdmVkLS0mZ3Q7Cgpjb3ZlcmFnZWNoYWlybWFuLnBuZyIgLz5zdWJqZWN0c1JpY2hhcmQgd2hhdGV2ZXJwcm9iYWJseXJlY292ZXJ5YmFzZWJhbGxqdWRnbWVudGNvbm5lY3QuLmNzcyIgLz4gd2Vic2l0ZXJlcG9ydGVkZGVmYXVsdCIvPjwvYT4NCmVsZWN0cmljc2NvdGxhbmRjcmVhdGlvbnF1YW50aXR5LiBJU0JOIDBkaWQgbm90IGluc3RhbmNlLXNlYXJjaC0iIGxhbmc9InNwZWFrZXJzQ29tcHV0ZXJjb250YWluc2FyY2hpdmVzbWluaXN0ZXJyZWFjdGlvbmRpc2NvdW50SXRhbGlhbm9jcml0ZXJpYXN0cm9uZ2x5OiAnaHR0cDonc2NyaXB0J2NvdmVyaW5nb2ZmZXJpbmdhcHBlYXJlZEJyaXRpc2ggaWRlbnRpZnlGYWNlYm9va251bWVyb3VzdmVoaWNsZXNjb25jZXJuc0FtZXJpY2FuaGFuZGxpbmdkaXYgaWQ9IldpbGxpYW0gcHJvdmlkZXJfY29udGVudGFjY3VyYWN5c2VjdGlvbiBhbmRlcnNvbmZsZXhpYmxlQ2F0ZWdvcnlsYXdyZW5jZTxzY3JpcHQ+bGF5b3V0PSJhcHByb3ZlZCBtYXhpbXVtaGVhZGVyIj48L3RhYmxlPlNlcnZpY2VzaGFtaWx0b25jdXJyZW50IGNhbmFkaWFuY2hhbm5lbHMvdGhlbWVzLy9hcnRpY2xlb3B0aW9uYWxwb3J0dWdhbHZhbHVlPSIiaW50ZXJ2YWx3aXJlbGVzc2VudGl0bGVkYWdlbmNpZXNTZWFyY2giIG1lYXN1cmVkdGhvdXNhbmRzcGVuZGluZyZoZWxsaXA7bmV3IERhdGUiIHNpemU9InBhZ2VOYW1lbWlkZGxlIiAiIC8+PC9hPmhpZGRlbiI+c2VxdWVuY2VwZXJzb25hbG92ZXJmbG93b3BpbmlvbnNpbGxpbm9pc2xpbmtzIj4KCTx0aXRsZT52ZXJzaW9uc3NhdHVyZGF5dGVybWluYWxpdGVtcHJvcGVuZ2luZWVyc2VjdGlvbnNkZXNpZ25lcnByb3Bvc2FsPSJmYWxzZSJFc3Bhw7FvbHJlbGVhc2Vzc3VibWl0IiBlciZxdW90O2FkZGl0aW9uc3ltcHRvbXNvcmllbnRlZHJlc291cmNlcmlnaHQiPjxwbGVhc3VyZXN0YXRpb25zaGlzdG9yeS5sZWF2aW5nICBib3JkZXI9Y29udGVudHNjZW50ZXIiPi4KClNvbWUgZGlyZWN0ZWRzdWl0YWJsZWJ1bGdhcmlhLnNob3coKTtkZXNpZ25lZEdlbmVyYWwgY29uY2VwdHNFeGFtcGxlc3dpbGxpYW1zT3JpZ2luYWwiPjxzcGFuPnNlYXJjaCI+b3BlcmF0b3JyZXF1ZXN0c2EgJnF1b3Q7YWxsb3dpbmdEb2N1bWVudHJldmlzaW9uLiAKClRoZSB5b3Vyc2VsZkNvbnRhY3QgbWljaGlnYW5FbmdsaXNoIGNvbHVtYmlhcHJpb3JpdHlwcmludGluZ2RyaW5raW5nZmFjaWxpdHlyZXR1cm5lZENvbnRlbnQgb2ZmaWNlcnNSdXNzaWFuIGdlbmVyYXRlLTg4NTktMSJpbmRpY2F0ZWZhbWlsaWFyIHF1YWxpdHltYXJnaW46MCBjb250ZW50dmlld3BvcnRjb250YWN0cy10aXRsZSI+cG9ydGFibGUubGVuZ3RoIGVsaWdpYmxlaW52b2x2ZXNhdGxhbnRpY29ubG9hZD0iZGVmYXVsdC5zdXBwbGllZHBheW1lbnRzZ2xvc3NhcnkKCkFmdGVyIGd1aWRhbmNlPC90ZD48dGRlbmNvZGluZ21pZGRsZSI+Y2FtZSB0byBkaXNwbGF5c3Njb3R0aXNoam9uYXRoYW5tYWpvcml0eXdpZGdldHMuY2xpbmljYWx0aGFpbGFuZHRlYWNoZXJzPGhlYWQ+CglhZmZlY3RlZHN1cHBvcnRzcG9pbnRlcjt0b1N0cmluZzwvc21hbGw+b2tsYWhvbWF3aWxsIGJlIGludmVzdG9yMCIgYWx0PSJob2xpZGF5c1Jlc291cmNlbGljZW5zZWQgKHdoaWNoIC4gQWZ0ZXIgY29uc2lkZXJ2aXNpdGluZ2V4cGxvcmVycHJpbWFyeSBzZWFyY2giIGFuZHJvaWQicXVpY2tseSBtZWV0aW5nc2VzdGltYXRlO3JldHVybiA7Y29sb3I6IyBoZWlnaHQ9YXBwcm92YWwsICZxdW90OyBjaGVja2VkLm1pbi5qcyJtYWduZXRpYz48L2E+PC9oZm9yZWNhc3QuIFdoaWxlIHRodXJzZGF5ZHZlcnRpc2UmZWFjdXRlO2hhc0NsYXNzZXZhbHVhdGVvcmRlcmluZ2V4aXN0aW5ncGF0aWVudHMgT25saW5lIGNvbG9yYWRvT3B0aW9ucyJjYW1wYmVsbDwhLS0gZW5kPC9zcGFuPjw8YnIgLz4NCl9wb3B1cHN8c2NpZW5jZXMsJnF1b3Q7IHF1YWxpdHkgV2luZG93cyBhc3NpZ25lZGhlaWdodDogPGIgY2xhc3NsZSZxdW90OyB2YWx1ZT0iIENvbXBhbnlleGFtcGxlczxpZnJhbWUgYmVsaWV2ZXNwcmVzZW50c21hcnNoYWxscGFydCBvZiBwcm9wZXJseSkuCgpUaGUgdGF4b25vbXltdWNoIG9mIDwvc3Bhbj4KIiBkYXRhLXNydHVndcOqc3Njcm9sbFRvIHByb2plY3Q8aGVhZD4NCmF0dG9ybmV5ZW1waGFzaXNzcG9uc29yc2ZhbmN5Ym94d29ybGQncyB3aWxkbGlmZWNoZWNrZWQ9c2Vzc2lvbnNwcm9ncmFtbXB4O2ZvbnQtIFByb2plY3Rqb3VybmFsc2JlbGlldmVkdmFjYXRpb250aG9tcHNvbmxpZ2h0aW5nYW5kIHRoZSBzcGVjaWFsIGJvcmRlcj0wY2hlY2tpbmc8L3Rib2R5PjxidXR0b24gQ29tcGxldGVjbGVhcmZpeAo8aGVhZD4KYXJ0aWNsZSA8c2VjdGlvbmZpbmRpbmdzcm9sZSBpbiBwb3B1bGFyICBPY3RvYmVyd2Vic2l0ZSBleHBvc3VyZXVzZWQgdG8gIGNoYW5nZXNvcGVyYXRlZGNsaWNraW5nZW50ZXJpbmdjb21tYW5kc2luZm9ybWVkIG51bWJlcnMgIDwvZGl2PmNyZWF0aW5nb25TdWJtaXRtYXJ5bGFuZGNvbGxlZ2VzYW5hbHl0aWNsaXN0aW5nc2NvbnRhY3QubG9nZ2VkSW5hZHZpc29yeXNpYmxpbmdzY29udGVudCJzJnF1b3Q7KXMuIFRoaXMgcGFja2FnZXNjaGVja2JveHN1Z2dlc3RzcHJlZ25hbnR0b21vcnJvd3NwYWNpbmc9aWNvbi5wbmdqYXBhbmVzZWNvZGViYXNlYnV0dG9uIj5nYW1ibGluZ3N1Y2ggYXMgLCB3aGlsZSA8L3NwYW4+IG1pc3NvdXJpc3BvcnRpbmd0b3A6MXB4IC48L3NwYW4+dGVuc2lvbnN3aWR0aD0iMmxhenlsb2Fkbm92ZW1iZXJ1c2VkIGluIGhlaWdodD0iY3JpcHQiPgombmJzcDs8Lzx0cj48dGQgaGVpZ2h0OjIvcHJvZHVjdGNvdW50cnkgaW5jbHVkZSBmb290ZXIiICZsdDshLS0gdGl0bGUiPjwvanF1ZXJ5LjwvZm9ybT4KKOeugOS9kyko57mB6auUKWhydmF0c2tpaXRhbGlhbm9yb23Dom7Eg3TDvHJrw6dl2KfYsdiv2Yh0YW1iacOpbm5vdGljaWFzbWVuc2FqZXNwZXJzb25hc2RlcmVjaG9zbmFjaW9uYWxzZXJ2aWNpb2NvbnRhY3RvdXN1YXJpb3Nwcm9ncmFtYWdvYmllcm5vZW1wcmVzYXNhbnVuY2lvc3ZhbGVuY2lhY29sb21iaWFkZXNwdcOpc2RlcG9ydGVzcHJveWVjdG9wcm9kdWN0b3DDumJsaWNvbm9zb3Ryb3NoaXN0b3JpYXByZXNlbnRlbWlsbG9uZXNtZWRpYW50ZXByZWd1bnRhYW50ZXJpb3JyZWN1cnNvc3Byb2JsZW1hc2FudGlhZ29udWVzdHJvc29waW5pw7NuaW1wcmltaXJtaWVudHJhc2Ftw6lyaWNhdmVuZGVkb3Jzb2NpZWRhZHJlc3BlY3RvcmVhbGl6YXJyZWdpc3Ryb3BhbGFicmFzaW50ZXLDqXNlbnRvbmNlc2VzcGVjaWFsbWllbWJyb3NyZWFsaWRhZGPDs3Jkb2JhemFyYWdvemFww6FnaW5hc3NvY2lhbGVzYmxvcXVlYXJnZXN0acOzbmFscXVpbGVyc2lzdGVtYXNjaWVuY2lhc2NvbXBsZXRvdmVyc2nDs25jb21wbGV0YWVzdHVkaW9zcMO6YmxpY2FvYmpldGl2b2FsaWNhbnRlYnVzY2Fkb3JjYW50aWRhZGVudHJhZGFzYWNjaW9uZXNhcmNoaXZvc3N1cGVyaW9ybWF5b3LDrWFhbGVtYW5pYWZ1bmNpw7Nuw7psdGltb3NoYWNpZW5kb2FxdWVsbG9zZWRpY2nDs25mZXJuYW5kb2FtYmllbnRlZmFjZWJvb2tudWVzdHJhc2NsaWVudGVzcHJvY2Vzb3NiYXN0YW50ZXByZXNlbnRhcmVwb3J0YXJjb25ncmVzb3B1YmxpY2FyY29tZXJjaW9jb250cmF0b2rDs3ZlbmVzZGlzdHJpdG90w6ljbmljYWNvbmp1bnRvZW5lcmfDrWF0cmFiYWphcmFzdHVyaWFzcmVjaWVudGV1dGlsaXphcmJvbGV0w61uc2FsdmFkb3Jjb3JyZWN0YXRyYWJham9zcHJpbWVyb3NuZWdvY2lvc2xpYmVydGFkZGV0YWxsZXNwYW50YWxsYXByw7N4aW1vYWxtZXLDrWFhbmltYWxlc3F1acOpbmVzY29yYXrDs25zZWNjacOzbmJ1c2NhbmRvb3BjaW9uZXNleHRlcmlvcmNvbmNlcHRvdG9kYXbDrWFnYWxlcsOtYWVzY3JpYmlybWVkaWNpbmFsaWNlbmNpYWNvbnN1bHRhYXNwZWN0b3NjcsOtdGljYWTDs2xhcmVzanVzdGljaWFkZWJlcsOhbnBlcsOtb2RvbmVjZXNpdGFtYW50ZW5lcnBlcXVlw7FvcmVjaWJpZGF0cmlidW5hbHRlbmVyaWZlY2FuY2nDs25jYW5hcmlhc2Rlc2NhcmdhZGl2ZXJzb3NtYWxsb3JjYXJlcXVpZXJldMOpY25pY29kZWJlcsOtYXZpdmllbmRhZmluYW56YXNhZGVsYW50ZWZ1bmNpb25hY29uc2Vqb3NkaWbDrWNpbGNpdWRhZGVzYW50aWd1YXNhdmFuemFkYXTDqXJtaW5vdW5pZGFkZXNzw6FuY2hlemNhbXBhw7Fhc29mdG9uaWNyZXZpc3Rhc2NvbnRpZW5lc2VjdG9yZXNtb21lbnRvc2ZhY3VsdGFkY3LDqWRpdG9kaXZlcnNhc3N1cHVlc3RvZmFjdG9yZXNzZWd1bmRvc3BlcXVlw7Fh0LPQvtC00LDQtdGB0LvQuNC10YHRgtGM0LHRi9C70L7QsdGL0YLRjNGN0YLQvtC80JXRgdC70LjRgtC+0LPQvtC80LXQvdGP0LLRgdC10YXRjdGC0L7QudC00LDQttC10LHRi9C70LjQs9C+0LTRg9C00LXQvdGM0Y3RgtC+0YLQsdGL0LvQsNGB0LXQsdGP0L7QtNC40L3RgdC10LHQtdC90LDQtNC+0YHQsNC50YLRhNC+0YLQvtC90LXQs9C+0YHQstC+0LjRgdCy0L7QudC40LPRgNGL0YLQvtC20LXQstGB0LXQvNGB0LLQvtGO0LvQuNGI0YzRjdGC0LjRhdC/0L7QutCw0LTQvdC10LnQtNC+0LzQsNC80LjRgNCw0LvQuNCx0L7RgtC10LzRg9GF0L7RgtGP0LTQstGD0YXRgdC10YLQuNC70Y7QtNC40LTQtdC70L7QvNC40YDQtdGC0LXQsdGP0YHQstC+0LXQstC40LTQtdGH0LXQs9C+0Y3RgtC40LzRgdGH0LXRgtGC0LXQvNGL0YbQtdC90YvRgdGC0LDQu9Cy0LXQtNGM0YLQtdC80LXQstC+0LTRi9GC0LXQsdC10LLRi9GI0LXQvdCw0LzQuNGC0LjQv9Cw0YLQvtC80YPQv9GA0LDQstC70LjRhtCw0L7QtNC90LDQs9C+0LTRi9C30L3QsNGO0LzQvtCz0YPQtNGA0YPQs9Cy0YHQtdC50LjQtNC10YLQutC40L3QvtC+0LTQvdC+0LTQtdC70LDQtNC10LvQtdGB0YDQvtC60LjRjtC90Y/QstC10YHRjNCV0YHRgtGM0YDQsNC30LDQvdCw0YjQuNin2YTZhNmH2KfZhNiq2YrYrNmF2YrYudiu2KfYtdip2KfZhNiw2YrYudmE2YrZh9is2K/Zitiv2KfZhNii2YbYp9mE2LHYr9iq2K3Zg9mF2LXZgdit2KnZg9in2YbYqtin2YTZhNmK2YrZg9mI2YbYtNio2YPYqdmB2YrZh9in2KjZhtin2KrYrdmI2KfYodij2YPYq9ix2K7ZhNin2YTYp9mE2K3YqNiv2YTZitmE2K/YsdmI2LPYp9i22LrYt9iq2YPZiNmG2YfZhtin2YPYs9in2K3YqdmG2KfYr9mK2KfZhNi32KjYudmE2YrZg9i02YPYsdin2YrZhdmD2YbZhdmG2YfYp9i02LHZg9ip2LHYptmK2LPZhti02YrYt9mF2KfYsNin2KfZhNmB2YbYtNio2KfYqNiq2LnYqNix2LHYrdmF2KnZg9in2YHYqdmK2YLZiNmE2YXYsdmD2LLZg9mE2YXYqdij2K3Zhdiv2YLZhNio2YrZiti52YbZiti12YjYsdip2LfYsdmK2YLYtNin2LHZg9is2YjYp9mE2KPYrtix2YnZhdi52YbYp9in2KjYrdir2LnYsdmI2LbYqNi02YPZhNmF2LPYrNmE2KjZhtin2YbYrtin2YTYr9mD2KrYp9io2YPZhNmK2KnYqNiv2YjZhtij2YrYttin2YrZiNis2K/Zgdix2YrZgtmD2KrYqNiq2KPZgdi22YTZhdi32KjYrtin2YPYq9ix2KjYp9ix2YPYp9mB2LbZhNin2K3ZhNmJ2YbZgdiz2YfYo9mK2KfZhdix2K/ZiNiv2KPZhtmH2KfYr9mK2YbYp9in2YTYp9mG2YXYudix2LbYqti52YTZhdiv2KfYrtmE2YXZhdmD2YYAAAAAAAAAAAEAAQABAAEAAgACAAIAAgAEAAQABAAEAAABAgMEBQYHBwYFBAMCAQAICQoLDA0ODw8ODQwLCgkIEBESExQVFhcXFhUUExIREBgZGhscHR4fHx4dHBsaGRj/////AAAAAAAAAAD/////AQAAAAIAAAACAAAAAQAAAAEAAAADAAAA//8AAQAAAAEAAP//AAEAAAAIAAgACAAIAAAAAQACAAMABAAFAAYAB3Jlc291cmNlc2NvdW50cmllc3F1ZXN0aW9uc2VxdWlwbWVudGNvbW11bml0eWF2YWlsYWJsZWhpZ2hsaWdodERURC94aHRtbG1hcmtldGluZ2tub3dsZWRnZXNvbWV0aGluZ2NvbnRhaW5lcmRpcmVjdGlvbnN1YnNjcmliZWFkdmVydGlzZWNoYXJhY3RlciIgdmFsdWU9Ijwvc2VsZWN0PkF1c3RyYWxpYSIgY2xhc3M9InNpdHVhdGlvbmF1dGhvcml0eWZvbGxvd2luZ3ByaW1hcmlseW9wZXJhdGlvbmNoYWxsZW5nZWRldmVsb3BlZGFub255bW91c2Z1bmN0aW9uIGZ1bmN0aW9uc2NvbXBhbmllc3N0cnVjdHVyZWFncmVlbWVudCIgdGl0bGU9InBvdGVudGlhbGVkdWNhdGlvbmFyZ3VtZW50c3NlY29uZGFyeWNvcHlyaWdodGxhbmd1YWdlc2V4Y2x1c2l2ZWNvbmRpdGlvbjwvZm9ybT4NCnN0YXRlbWVudGF0dGVudGlvbkJpb2dyYXBoeX0gZWxzZSB7CnNvbHV0aW9uc3doZW4gdGhlIEFuYWx5dGljc3RlbXBsYXRlc2Rhbmdlcm91c3NhdGVsbGl0ZWRvY3VtZW50c3B1Ymxpc2hlcmltcG9ydGFudHByb3RvdHlwZWluZmx1ZW5jZSZyYXF1bzs8L2VmZmVjdGl2ZWdlbmVyYWxseXRyYW5zZm9ybWJlYXV0aWZ1bHRyYW5zcG9ydG9yZ2FuaXplZHB1Ymxpc2hlZHByb21pbmVudHVudGlsIHRoZXRodW1ibmFpbE5hdGlvbmFsIC5mb2N1cygpO292ZXIgdGhlIG1pZ3JhdGlvbmFubm91bmNlZGZvb3RlciI+CmV4Y2VwdGlvbmxlc3MgdGhhbmV4cGVuc2l2ZWZvcm1hdGlvbmZyYW1ld29ya3RlcnJpdG9yeW5kaWNhdGlvbmN1cnJlbnRseWNsYXNzTmFtZWNyaXRpY2lzbXRyYWRpdGlvbmVsc2V3aGVyZUFsZXhhbmRlcmFwcG9pbnRlZG1hdGVyaWFsc2Jyb2FkY2FzdG1lbnRpb25lZGFmZmlsaWF0ZTwvb3B0aW9uPnRyZWF0bWVudGRpZmZlcmVudC9kZWZhdWx0LlByZXNpZGVudG9uY2xpY2s9ImJpb2dyYXBoeW90aGVyd2lzZXBlcm1hbmVudEZyYW7Dp2Fpc0hvbGx5d29vZGV4cGFuc2lvbnN0YW5kYXJkczwvc3R5bGU+CnJlZHVjdGlvbkRlY2VtYmVyIHByZWZlcnJlZENhbWJyaWRnZW9wcG9uZW50c0J1c2luZXNzIGNvbmZ1c2lvbj4KPHRpdGxlPnByZXNlbnRlZGV4cGxhaW5lZGRvZXMgbm90IHdvcmxkd2lkZWludGVyZmFjZXBvc2l0aW9uc25ld3NwYXBlcjwvdGFibGU+Cm1vdW50YWluc2xpa2UgdGhlIGVzc2VudGlhbGZpbmFuY2lhbHNlbGVjdGlvbmFjdGlvbj0iL2FiYW5kb25lZEVkdWNhdGlvbnBhcnNlSW50KHN0YWJpbGl0eXVuYWJsZSB0bzwvdGl0bGU+CnJlbGF0aW9uc05vdGUgdGhhdGVmZmljaWVudHBlcmZvcm1lZHR3byB5ZWFyc1NpbmNlIHRoZXRoZXJlZm9yZXdyYXBwZXIiPmFsdGVybmF0ZWluY3JlYXNlZEJhdHRsZSBvZnBlcmNlaXZlZHRyeWluZyB0b25lY2Vzc2FyeXBvcnRyYXllZGVsZWN0aW9uc0VsaXphYmV0aDwvaWZyYW1lPmRpc2NvdmVyeWluc3VyYW5jZXMubGVuZ3RoO2xlZ2VuZGFyeUdlb2dyYXBoeWNhbmRpZGF0ZWNvcnBvcmF0ZXNvbWV0aW1lc3NlcnZpY2VzLmluaGVyaXRlZDwvc3Ryb25nPkNvbW11bml0eXJlbGlnaW91c2xvY2F0aW9uc0NvbW1pdHRlZWJ1aWxkaW5nc3RoZSB3b3JsZG5vIGxvbmdlcmJlZ2lubmluZ3JlZmVyZW5jZWNhbm5vdCBiZWZyZXF1ZW5jeXR5cGljYWxseWludG8gdGhlIHJlbGF0aXZlO3JlY29yZGluZ3ByZXNpZGVudGluaXRpYWxseXRlY2huaXF1ZXRoZSBvdGhlcml0IGNhbiBiZWV4aXN0ZW5jZXVuZGVybGluZXRoaXMgdGltZXRlbGVwaG9uZWl0ZW1zY29wZXByYWN0aWNlc2FkdmFudGFnZSk7cmV0dXJuIEZvciBvdGhlcnByb3ZpZGluZ2RlbW9jcmFjeWJvdGggdGhlIGV4dGVuc2l2ZXN1ZmZlcmluZ3N1cHBvcnRlZGNvbXB1dGVycyBmdW5jdGlvbnByYWN0aWNhbHNhaWQgdGhhdGl0IG1heSBiZUVuZ2xpc2g8L2Zyb20gdGhlIHNjaGVkdWxlZGRvd25sb2FkczwvbGFiZWw+CnN1c3BlY3RlZG1hcmdpbjogMHNwaXJpdHVhbDwvaGVhZD4KCm1pY3Jvc29mdGdyYWR1YWxseWRpc2N1c3NlZGhlIGJlY2FtZWV4ZWN1dGl2ZWpxdWVyeS5qc2hvdXNlaG9sZGNvbmZpcm1lZHB1cmNoYXNlZGxpdGVyYWxseWRlc3Ryb3llZHVwIHRvIHRoZXZhcmlhdGlvbnJlbWFpbmluZ2l0IGlzIG5vdGNlbnR1cmllc0phcGFuZXNlIGFtb25nIHRoZWNvbXBsZXRlZGFsZ29yaXRobWludGVyZXN0c3JlYmVsbGlvbnVuZGVmaW5lZGVuY291cmFnZXJlc2l6YWJsZWludm9sdmluZ3NlbnNpdGl2ZXVuaXZlcnNhbHByb3Zpc2lvbihhbHRob3VnaGZlYXR1cmluZ2NvbmR1Y3RlZCksIHdoaWNoIGNvbnRpbnVlZC1oZWFkZXIiPkZlYnJ1YXJ5IG51bWVyb3VzIG92ZXJmbG93OmNvbXBvbmVudGZyYWdtZW50c2V4Y2VsbGVudGNvbHNwYW49InRlY2huaWNhbG5lYXIgdGhlIEFkdmFuY2VkIHNvdXJjZSBvZmV4cHJlc3NlZEhvbmcgS29uZyBGYWNlYm9va211bHRpcGxlIG1lY2hhbmlzbWVsZXZhdGlvbm9mZmVuc2l2ZTwvZm9ybT4KCXNwb25zb3JlZGRvY3VtZW50Lm9yICZxdW90O3RoZXJlIGFyZXRob3NlIHdob21vdmVtZW50c3Byb2Nlc3Nlc2RpZmZpY3VsdHN1Ym1pdHRlZHJlY29tbWVuZGNvbnZpbmNlZHByb21vdGluZyIgd2lkdGg9Ii5yZXBsYWNlKGNsYXNzaWNhbGNvYWxpdGlvbmhpcyBmaXJzdGRlY2lzaW9uc2Fzc2lzdGFudGluZGljYXRlZGV2b2x1dGlvbi13cmFwcGVyImVub3VnaCB0b2Fsb25nIHRoZWRlbGl2ZXJlZC0tPg0KPCEtLUFtZXJpY2FuIHByb3RlY3RlZE5vdmVtYmVyIDwvc3R5bGU+PGZ1cm5pdHVyZUludGVybmV0ICBvbmJsdXI9InN1c3BlbmRlZHJlY2lwaWVudGJhc2VkIG9uIE1vcmVvdmVyLGFib2xpc2hlZGNvbGxlY3RlZHdlcmUgbWFkZWVtb3Rpb25hbGVtZXJnZW5jeW5hcnJhdGl2ZWFkdm9jYXRlc3B4O2JvcmRlcmNvbW1pdHRlZGRpcj0ibHRyImVtcGxveWVlc3Jlc2VhcmNoLiBzZWxlY3RlZHN1Y2Nlc3NvcmN1c3RvbWVyc2Rpc3BsYXllZFNlcHRlbWJlcmFkZENsYXNzKEZhY2Vib29rIHN1Z2dlc3RlZGFuZCBsYXRlcm9wZXJhdGluZ2VsYWJvcmF0ZVNvbWV0aW1lc0luc3RpdHV0ZWNlcnRhaW5seWluc3RhbGxlZGZvbGxvd2Vyc0plcnVzYWxlbXRoZXkgaGF2ZWNvbXB1dGluZ2dlbmVyYXRlZHByb3ZpbmNlc2d1YXJhbnRlZWFyYml0cmFyeXJlY29nbml6ZXdhbnRlZCB0b3B4O3dpZHRoOnRoZW9yeSBvZmJlaGF2aW91cldoaWxlIHRoZWVzdGltYXRlZGJlZ2FuIHRvIGl0IGJlY2FtZW1hZ25pdHVkZW11c3QgaGF2ZW1vcmUgdGhhbkRpcmVjdG9yeWV4dGVuc2lvbnNlY3JldGFyeW5hdHVyYWxseW9jY3VycmluZ3ZhcmlhYmxlc2dpdmVuIHRoZXBsYXRmb3JtLjwvbGFiZWw+PGZhaWxlZCB0b2NvbXBvdW5kc2tpbmRzIG9mIHNvY2lldGllc2Fsb25nc2lkZSAtLSZndDsKCnNvdXRod2VzdHRoZSByaWdodHJhZGlhdGlvbm1heSBoYXZlIHVuZXNjYXBlKHNwb2tlbiBpbiIgaHJlZj0iL3Byb2dyYW1tZW9ubHkgdGhlIGNvbWUgZnJvbWRpcmVjdG9yeWJ1cmllZCBpbmEgc2ltaWxhcnRoZXkgd2VyZTwvZm9udD48L05vcndlZ2lhbnNwZWNpZmllZHByb2R1Y2luZ3Bhc3NlbmdlcihuZXcgRGF0ZXRlbXBvcmFyeWZpY3Rpb25hbEFmdGVyIHRoZWVxdWF0aW9uc2Rvd25sb2FkLnJlZ3VsYXJseWRldmVsb3BlcmFib3ZlIHRoZWxpbmtlZCB0b3BoZW5vbWVuYXBlcmlvZCBvZnRvb2x0aXAiPnN1YnN0YW5jZWF1dG9tYXRpY2FzcGVjdCBvZkFtb25nIHRoZWNvbm5lY3RlZGVzdGltYXRlc0FpciBGb3JjZXN5c3RlbSBvZm9iamVjdGl2ZWltbWVkaWF0ZW1ha2luZyBpdHBhaW50aW5nc2NvbnF1ZXJlZGFyZSBzdGlsbHByb2NlZHVyZWdyb3d0aCBvZmhlYWRlZCBieUV1cm9wZWFuIGRpdmlzaW9uc21vbGVjdWxlc2ZyYW5jaGlzZWludGVudGlvbmF0dHJhY3RlZGNoaWxkaG9vZGFsc28gdXNlZGRlZGljYXRlZHNpbmdhcG9yZWRlZ3JlZSBvZmZhdGhlciBvZmNvbmZsaWN0czwvYT48L3A+CmNhbWUgZnJvbXdlcmUgdXNlZG5vdGUgdGhhdHJlY2VpdmluZ0V4ZWN1dGl2ZWV2ZW4gbW9yZWFjY2VzcyB0b2NvbW1hbmRlclBvbGl0aWNhbG11c2ljaWFuc2RlbGljaW91c3ByaXNvbmVyc2FkdmVudCBvZlVURi04IiAvPjwhW0NEQVRBWyI+Q29udGFjdFNvdXRoZXJuIGJnY29sb3I9InNlcmllcyBvZi4gSXQgd2FzIGluIEV1cm9wZXBlcm1pdHRlZHZhbGlkYXRlLmFwcGVhcmluZ29mZmljaWFsc3NlcmlvdXNseS1sYW5ndWFnZWluaXRpYXRlZGV4dGVuZGluZ2xvbmctdGVybWluZmxhdGlvbnN1Y2ggdGhhdGdldENvb2tpZW1hcmtlZCBieTwvYnV0dG9uPmltcGxlbWVudGJ1dCBpdCBpc2luY3JlYXNlc2Rvd24gdGhlIHJlcXVpcmluZ2RlcGVuZGVudC0tPgo8IS0tIGludGVydmlld1dpdGggdGhlIGNvcGllcyBvZmNvbnNlbnN1c3dhcyBidWlsdFZlbmV6dWVsYShmb3JtZXJseXRoZSBzdGF0ZXBlcnNvbm5lbHN0cmF0ZWdpY2Zhdm91ciBvZmludmVudGlvbldpa2lwZWRpYWNvbnRpbmVudHZpcnR1YWxseXdoaWNoIHdhc3ByaW5jaXBsZUNvbXBsZXRlIGlkZW50aWNhbHNob3cgdGhhdHByaW1pdGl2ZWF3YXkgZnJvbW1vbGVjdWxhcnByZWNpc2VseWRpc3NvbHZlZFVuZGVyIHRoZXZlcnNpb249Ij4mbmJzcDs8L0l0IGlzIHRoZSBUaGlzIGlzIHdpbGwgaGF2ZW9yZ2FuaXNtc3NvbWUgdGltZUZyaWVkcmljaHdhcyBmaXJzdHRoZSBvbmx5IGZhY3QgdGhhdGZvcm0gaWQ9InByZWNlZGluZ1RlY2huaWNhbHBoeXNpY2lzdG9jY3VycyBpbm5hdmlnYXRvcnNlY3Rpb24iPnNwYW4gaWQ9InNvdWdodCB0b2JlbG93IHRoZXN1cnZpdmluZ308L3N0eWxlPmhpcyBkZWF0aGFzIGluIHRoZWNhdXNlZCBieXBhcnRpYWxseWV4aXN0aW5nIHVzaW5nIHRoZXdhcyBnaXZlbmEgbGlzdCBvZmxldmVscyBvZm5vdGlvbiBvZk9mZmljaWFsIGRpc21pc3NlZHNjaWVudGlzdHJlc2VtYmxlc2R1cGxpY2F0ZWV4cGxvc2l2ZXJlY292ZXJlZGFsbCBvdGhlcmdhbGxlcmllc3twYWRkaW5nOnBlb3BsZSBvZnJlZ2lvbiBvZmFkZHJlc3Nlc2Fzc29jaWF0ZWltZyBhbHQ9ImluIG1vZGVybnNob3VsZCBiZW1ldGhvZCBvZnJlcG9ydGluZ3RpbWVzdGFtcG5lZWRlZCB0b3RoZSBHcmVhdHJlZ2FyZGluZ3NlZW1lZCB0b3ZpZXdlZCBhc2ltcGFjdCBvbmlkZWEgdGhhdHRoZSBXb3JsZGhlaWdodCBvZmV4cGFuZGluZ1RoZXNlIGFyZWN1cnJlbnQiPmNhcmVmdWxseW1haW50YWluc2NoYXJnZSBvZkNsYXNzaWNhbGFkZHJlc3NlZHByZWRpY3RlZG93bmVyc2hpcDxkaXYgaWQ9InJpZ2h0Ij4NCnJlc2lkZW5jZWxlYXZlIHRoZWNvbnRlbnQiPmFyZSBvZnRlbiAgfSkoKTsNCnByb2JhYmx5IFByb2Zlc3Nvci1idXR0b24iIHJlc3BvbmRlZHNheXMgdGhhdGhhZCB0byBiZXBsYWNlZCBpbkh1bmdhcmlhbnN0YXR1cyBvZnNlcnZlcyBhc1VuaXZlcnNhbGV4ZWN1dGlvbmFnZ3JlZ2F0ZWZvciB3aGljaGluZmVjdGlvbmFncmVlZCB0b2hvd2V2ZXIsIHBvcHVsYXIiPnBsYWNlZCBvbmNvbnN0cnVjdGVsZWN0b3JhbHN5bWJvbCBvZmluY2x1ZGluZ3JldHVybiB0b2FyY2hpdGVjdENocmlzdGlhbnByZXZpb3VzIGxpdmluZyBpbmVhc2llciB0b3Byb2Zlc3NvcgombHQ7IS0tIGVmZmVjdCBvZmFuYWx5dGljc3dhcyB0YWtlbndoZXJlIHRoZXRvb2sgb3ZlcmJlbGllZiBpbkFmcmlrYWFuc2FzIGZhciBhc3ByZXZlbnRlZHdvcmsgd2l0aGEgc3BlY2lhbDxmaWVsZHNldENocmlzdG1hc1JldHJpZXZlZAoKSW4gdGhlIGJhY2sgaW50b25vcnRoZWFzdG1hZ2F6aW5lcz48c3Ryb25nPmNvbW1pdHRlZWdvdmVybmluZ2dyb3VwcyBvZnN0b3JlZCBpbmVzdGFibGlzaGEgZ2VuZXJhbGl0cyBmaXJzdHRoZWlyIG93bnBvcHVsYXRlZGFuIG9iamVjdENhcmliYmVhbmFsbG93IHRoZWRpc3RyaWN0c3dpc2NvbnNpbmxvY2F0aW9uLjsgd2lkdGg6IGluaGFiaXRlZFNvY2lhbGlzdEphbnVhcnkgMTwvZm9vdGVyPnNpbWlsYXJseWNob2ljZSBvZnRoZSBzYW1lIHNwZWNpZmljIGJ1c2luZXNzIFRoZSBmaXJzdC5sZW5ndGg7IGRlc2lyZSB0b2RlYWwgd2l0aHNpbmNlIHRoZXVzZXJBZ2VudGNvbmNlaXZlZGluZGV4LnBocGFzICZxdW90O2VuZ2FnZSBpbnJlY2VudGx5LGZldyB5ZWFyc3dlcmUgYWxzbwo8aGVhZD4KPGVkaXRlZCBieWFyZSBrbm93bmNpdGllcyBpbmFjY2Vzc2tleWNvbmRlbW5lZGFsc28gaGF2ZXNlcnZpY2VzLGZhbWlseSBvZlNjaG9vbCBvZmNvbnZlcnRlZG5hdHVyZSBvZiBsYW5ndWFnZW1pbmlzdGVyczwvb2JqZWN0PnRoZXJlIGlzIGEgcG9wdWxhcnNlcXVlbmNlc2Fkdm9jYXRlZFRoZXkgd2VyZWFueSBvdGhlcmxvY2F0aW9uPWVudGVyIHRoZW11Y2ggbW9yZXJlZmxlY3RlZHdhcyBuYW1lZG9yaWdpbmFsIGEgdHlwaWNhbHdoZW4gdGhleWVuZ2luZWVyc2NvdWxkIG5vdHJlc2lkZW50c3dlZG5lc2RheXRoZSB0aGlyZCBwcm9kdWN0c0phbnVhcnkgMndoYXQgdGhleWEgY2VydGFpbnJlYWN0aW9uc3Byb2Nlc3NvcmFmdGVyIGhpc3RoZSBsYXN0IGNvbnRhaW5lZCI+PC9kaXY+CjwvYT48L3RkPmRlcGVuZCBvbnNlYXJjaCI+CnBpZWNlcyBvZmNvbXBldGluZ1JlZmVyZW5jZXRlbm5lc3NlZXdoaWNoIGhhcyB2ZXJzaW9uPTwvc3Bhbj4gPDwvaGVhZGVyPmdpdmVzIHRoZWhpc3RvcmlhbnZhbHVlPSIiPnBhZGRpbmc6MHZpZXcgdGhhdHRvZ2V0aGVyLHRoZSBtb3N0IHdhcyBmb3VuZHN1YnNldCBvZmF0dGFjayBvbmNoaWxkcmVuLHBvaW50cyBvZnBlcnNvbmFsIHBvc2l0aW9uOmFsbGVnZWRseUNsZXZlbGFuZHdhcyBsYXRlcmFuZCBhZnRlcmFyZSBnaXZlbndhcyBzdGlsbHNjcm9sbGluZ2Rlc2lnbiBvZm1ha2VzIHRoZW11Y2ggbGVzc0FtZXJpY2Fucy4KCkFmdGVyICwgYnV0IHRoZU11c2V1bSBvZmxvdWlzaWFuYShmcm9tIHRoZW1pbm5lc290YXBhcnRpY2xlc2EgcHJvY2Vzc0RvbWluaWNhbnZvbHVtZSBvZnJldHVybmluZ2RlZmVuc2l2ZTAwcHh8cmlnaG1hZGUgZnJvbW1vdXNlb3ZlciIgc3R5bGU9InN0YXRlcyBvZih3aGljaCBpc2NvbnRpbnVlc0ZyYW5jaXNjb2J1aWxkaW5nIHdpdGhvdXQgYXdpdGggc29tZXdobyB3b3VsZGEgZm9ybSBvZmEgcGFydCBvZmJlZm9yZSBpdGtub3duIGFzICBTZXJ2aWNlc2xvY2F0aW9uIGFuZCBvZnRlbm1lYXN1cmluZ2FuZCBpdCBpc3BhcGVyYmFja3ZhbHVlcyBvZg0KPHRpdGxlPj0gd2luZG93LmRldGVybWluZWVyJnF1b3Q7IHBsYXllZCBieWFuZCBlYXJseTwvY2VudGVyPmZyb20gdGhpc3RoZSB0aHJlZXBvd2VyIGFuZG9mICZxdW90O2lubmVySFRNTDxhIGhyZWY9Ink6aW5saW5lO0NodXJjaCBvZnRoZSBldmVudHZlcnkgaGlnaG9mZmljaWFsIC1oZWlnaHQ6IGNvbnRlbnQ9Ii9jZ2ktYmluL3RvIGNyZWF0ZWFmcmlrYWFuc2VzcGVyYW50b2ZyYW7Dp2Fpc2xhdHZpZcWhdWxpZXR1dmnFs8SMZcWhdGluYcSNZcWhdGluYeC5hOC4l+C4ouaXpeacrOiqnueugOS9k+Wtl+e5gemrlOWtl+2VnOq1reyWtOS4uuS7gOS5iOiuoeeul+acuueslOiusOacrOiojuirluWNgOacjeWKoeWZqOS6kuiBlOe9keaIv+WcsOS6p+S/seS5kOmDqOWHuueJiOekvuaOkuihjOamnOmDqOiQveagvOi/m+S4gOatpeaUr+S7mOWunemqjOivgeeggeWnlOWRmOS8muaVsOaNruW6k+a2iOi0ueiAheWKnuWFrOWupOiuqOiuuuWMuua3seWcs+W4guaSreaUvuWZqOWMl+S6rOW4guWkp+WtpueUn+i2iuadpei2iueuoeeQhuWRmOS/oeaBr+e9kXNlcnZpY2lvc2FydMOtY3Vsb2FyZ2VudGluYWJhcmNlbG9uYWN1YWxxdWllcnB1YmxpY2Fkb3Byb2R1Y3Rvc3BvbMOtdGljYXJlc3B1ZXN0YXdpa2lwZWRpYXNpZ3VpZW50ZWLDunNxdWVkYWNvbXVuaWRhZHNlZ3VyaWRhZHByaW5jaXBhbHByZWd1bnRhc2NvbnRlbmlkb3Jlc3BvbmRlcnZlbmV6dWVsYXByb2JsZW1hc2RpY2llbWJyZXJlbGFjacOzbm5vdmllbWJyZXNpbWlsYXJlc3Byb3llY3Rvc3Byb2dyYW1hc2luc3RpdHV0b2FjdGl2aWRhZGVuY3VlbnRyYWVjb25vbcOtYWltw6FnZW5lc2NvbnRhY3RhcmRlc2Nhcmdhcm5lY2VzYXJpb2F0ZW5jacOzbnRlbMOpZm9ub2NvbWlzacOzbmNhbmNpb25lc2NhcGFjaWRhZGVuY29udHJhcmFuw6FsaXNpc2Zhdm9yaXRvc3TDqXJtaW5vc3Byb3ZpbmNpYWV0aXF1ZXRhc2VsZW1lbnRvc2Z1bmNpb25lc3Jlc3VsdGFkb2NhcsOhY3RlcnByb3BpZWRhZHByaW5jaXBpb25lY2VzaWRhZG11bmljaXBhbGNyZWFjacOzbmRlc2Nhcmdhc3ByZXNlbmNpYWNvbWVyY2lhbG9waW5pb25lc2VqZXJjaWNpb2VkaXRvcmlhbHNhbGFtYW5jYWdvbnrDoWxlemRvY3VtZW50b3BlbMOtY3VsYXJlY2llbnRlc2dlbmVyYWxlc3RhcnJhZ29uYXByw6FjdGljYW5vdmVkYWRlc3Byb3B1ZXN0YXBhY2llbnRlc3TDqWNuaWNhc29iamV0aXZvc2NvbnRhY3Rvc+CkruClh+CkguCksuCkv+Ckj+CkueCliOCkguCkl+Ckr+CkvuCkuOCkvuCkpeCkj+CkteCkguCksOCkueClh+CkleCli+CkiOCkleClgeCkm+CksOCkueCkvuCkrOCkvuCkpuCkleCkueCkvuCkuOCkreClgOCkueClgeCkj+CksOCkueClgOCkruCliOCkguCkpuCkv+CkqOCkrOCkvuCkpGRpcGxvZG9jc+CkuOCkruCkr+CksOClguCkquCkqOCkvuCkruCkquCkpOCkvuCkq+Ckv+CksOCklOCkuOCkpOCkpOCksOCkueCksuCli+Ckl+CkueClgeCkhuCkrOCkvuCksOCkpuClh+CktuCkueClgeCkiOCkluClh+CksuCkr+CkpuCkv+CkleCkvuCkruCkteClh+CkrOCkpOClgOCkqOCkrOClgOCkmuCkruCljOCkpOCkuOCkvuCksuCksuClh+CkluCknOClieCkrOCkruCkpuCkpuCkpOCkpeCkvuCkqOCkueClgOCktuCkueCksOCkheCksuCkl+CkleCkreClgOCkqOCkl+CksOCkquCkvuCkuOCksOCkvuCkpOCkleCkv+Ckj+CkieCkuOClh+Ckl+Ckr+ClgOCkueClguCkgeCkhuCkl+Clh+Ckn+ClgOCkruCkluCli+CknOCkleCkvuCksOCkheCkreClgOCkl+Ckr+Clh+CkpOClgeCkruCkteCli+Ckn+CkpuClh+CkguCkheCkl+CksOCkkOCkuOClh+CkruClh+CksuCksuCkl+CkvuCkueCkvuCksuCkiuCkquCksOCkmuCkvuCksOCkkOCkuOCkvuCkpuClh+CksOCknOCkv+CkuOCkpuCkv+CksuCkrOCkguCkpuCkrOCkqOCkvuCkueClguCkguCksuCkvuCkluCknOClgOCkpOCkrOCkn+CkqOCkruCkv+CksuCkh+CkuOClh+CkhuCkqOClh+CkqOCkr+CkvuCkleClgeCksuCksuClieCkl+CkreCkvuCkl+CksOClh+CksuCknOCkl+CkueCksOCkvuCkruCksuCkl+Clh+CkquClh+CknOCkueCkvuCkpeCkh+CkuOClgOCkuOCkueClgOCkleCksuCkvuCkoOClgOCkleCkueCkvuCkgeCkpuClguCksOCkpOCkueCkpOCkuOCkvuCkpOCkr+CkvuCkpuCkhuCkr+CkvuCkquCkvuCkleCkleCljOCkqOCktuCkvuCkruCkpuClh+CkluCkr+CkueClgOCksOCkvuCkr+CkluClgeCkpuCksuCkl+ClgGNhdGVnb3JpZXNleHBlcmllbmNlPC90aXRsZT4NCkNvcHlyaWdodCBqYXZhc2NyaXB0Y29uZGl0aW9uc2V2ZXJ5dGhpbmc8cCBjbGFzcz0idGVjaG5vbG9neWJhY2tncm91bmQ8YSBjbGFzcz0ibWFuYWdlbWVudCZjb3B5OyAyMDFqYXZhU2NyaXB0Y2hhcmFjdGVyc2JyZWFkY3J1bWJ0aGVtc2VsdmVzaG9yaXpvbnRhbGdvdmVybm1lbnRDYWxpZm9ybmlhYWN0aXZpdGllc2Rpc2NvdmVyZWROYXZpZ2F0aW9udHJhbnNpdGlvbmNvbm5lY3Rpb25uYXZpZ2F0aW9uYXBwZWFyYW5jZTwvdGl0bGU+PG1jaGVja2JveCIgdGVjaG5pcXVlc3Byb3RlY3Rpb25hcHBhcmVudGx5YXMgd2VsbCBhc3VudCcsICdVQS1yZXNvbHV0aW9ub3BlcmF0aW9uc3RlbGV2aXNpb250cmFuc2xhdGVkV2FzaGluZ3Rvbm5hdmlnYXRvci4gPSB3aW5kb3cuaW1wcmVzc2lvbiZsdDticiZndDtsaXRlcmF0dXJlcG9wdWxhdGlvbmJnY29sb3I9IiNlc3BlY2lhbGx5IGNvbnRlbnQ9InByb2R1Y3Rpb25uZXdzbGV0dGVycHJvcGVydGllc2RlZmluaXRpb25sZWFkZXJzaGlwVGVjaG5vbG9neVBhcmxpYW1lbnRjb21wYXJpc29udWwgY2xhc3M9Ii5pbmRleE9mKCJjb25jbHVzaW9uZGlzY3Vzc2lvbmNvbXBvbmVudHNiaW9sb2dpY2FsUmV2b2x1dGlvbl9jb250YWluZXJ1bmRlcnN0b29kbm9zY3JpcHQ+PHBlcm1pc3Npb25lYWNoIG90aGVyYXRtb3NwaGVyZSBvbmZvY3VzPSI8Zm9ybSBpZD0icHJvY2Vzc2luZ3RoaXMudmFsdWVnZW5lcmF0aW9uQ29uZmVyZW5jZXN1YnNlcXVlbnR3ZWxsLWtub3dudmFyaWF0aW9uc3JlcHV0YXRpb25waGVub21lbm9uZGlzY2lwbGluZWxvZ28ucG5nIiAoZG9jdW1lbnQsYm91bmRhcmllc2V4cHJlc3Npb25zZXR0bGVtZW50QmFja2dyb3VuZG91dCBvZiB0aGVlbnRlcnByaXNlKCJodHRwczoiIHVuZXNjYXBlKCJwYXNzd29yZCIgZGVtb2NyYXRpYzxhIGhyZWY9Ii93cmFwcGVyIj4KbWVtYmVyc2hpcGxpbmd1aXN0aWNweDtwYWRkaW5ncGhpbG9zb3BoeWFzc2lzdGFuY2V1bml2ZXJzaXR5ZmFjaWxpdGllc3JlY29nbml6ZWRwcmVmZXJlbmNlaWYgKHR5cGVvZm1haW50YWluZWR2b2NhYnVsYXJ5aHlwb3RoZXNpcy5zdWJtaXQoKTsmYW1wO25ic3A7YW5ub3RhdGlvbmJlaGluZCB0aGVGb3VuZGF0aW9ucHVibGlzaGVyImFzc3VtcHRpb25pbnRyb2R1Y2VkY29ycnVwdGlvbnNjaWVudGlzdHNleHBsaWNpdGx5aW5zdGVhZCBvZmRpbWVuc2lvbnMgb25DbGljaz0iY29uc2lkZXJlZGRlcGFydG1lbnRvY2N1cGF0aW9uc29vbiBhZnRlcmludmVzdG1lbnRwcm9ub3VuY2VkaWRlbnRpZmllZGV4cGVyaW1lbnRNYW5hZ2VtZW50Z2VvZ3JhcGhpYyIgaGVpZ2h0PSJsaW5rIHJlbD0iLnJlcGxhY2UoL2RlcHJlc3Npb25jb25mZXJlbmNlcHVuaXNobWVudGVsaW1pbmF0ZWRyZXNpc3RhbmNlYWRhcHRhdGlvbm9wcG9zaXRpb253ZWxsIGtub3duc3VwcGxlbWVudGRldGVybWluZWRoMSBjbGFzcz0iMHB4O21hcmdpbm1lY2hhbmljYWxzdGF0aXN0aWNzY2VsZWJyYXRlZEdvdmVybm1lbnQKCkR1cmluZyB0ZGV2ZWxvcGVyc2FydGlmaWNpYWxlcXVpdmFsZW50b3JpZ2luYXRlZENvbW1pc3Npb25hdHRhY2htZW50PHNwYW4gaWQ9InRoZXJlIHdlcmVOZWRlcmxhbmRzYmV5b25kIHRoZXJlZ2lzdGVyZWRqb3VybmFsaXN0ZnJlcXVlbnRseWFsbCBvZiB0aGVsYW5nPSJlbiIgPC9zdHlsZT4NCmFic29sdXRlOyBzdXBwb3J0aW5nZXh0cmVtZWx5IG1haW5zdHJlYW08L3N0cm9uZz4gcG9wdWxhcml0eWVtcGxveW1lbnQ8L3RhYmxlPg0KIGNvbHNwYW49IjwvZm9ybT4KICBjb252ZXJzaW9uYWJvdXQgdGhlIDwvcD48L2Rpdj5pbnRlZ3JhdGVkIiBsYW5nPSJlblBvcnR1Z3Vlc2VzdWJzdGl0dXRlaW5kaXZpZHVhbGltcG9zc2libGVtdWx0aW1lZGlhYWxtb3N0IGFsbHB4IHNvbGlkICNhcGFydCBmcm9tc3ViamVjdCB0b2luIEVuZ2xpc2hjcml0aWNpemVkZXhjZXB0IGZvcmd1aWRlbGluZXNvcmlnaW5hbGx5cmVtYXJrYWJsZXRoZSBzZWNvbmRoMiBjbGFzcz0iPGEgdGl0bGU9IihpbmNsdWRpbmdwYXJhbWV0ZXJzcHJvaGliaXRlZD0gImh0dHA6Ly9kaWN0aW9uYXJ5cGVyY2VwdGlvbnJldm9sdXRpb25mb3VuZGF0aW9ucHg7aGVpZ2h0OnN1Y2Nlc3NmdWxzdXBwb3J0ZXJzbWlsbGVubml1bWhpcyBmYXRoZXJ0aGUgJnF1b3Q7bm8tcmVwZWF0O2NvbW1lcmNpYWxpbmR1c3RyaWFsZW5jb3VyYWdlZGFtb3VudCBvZiB1bm9mZmljaWFsZWZmaWNpZW5jeVJlZmVyZW5jZXNjb29yZGluYXRlZGlzY2xhaW1lcmV4cGVkaXRpb25kZXZlbG9waW5nY2FsY3VsYXRlZHNpbXBsaWZpZWRsZWdpdGltYXRlc3Vic3RyaW5nKDAiIGNsYXNzPSJjb21wbGV0ZWx5aWxsdXN0cmF0ZWZpdmUgeWVhcnNpbnN0cnVtZW50UHVibGlzaGluZzEiIGNsYXNzPSJwc3ljaG9sb2d5Y29uZmlkZW5jZW51bWJlciBvZiBhYnNlbmNlIG9mZm9jdXNlZCBvbmpvaW5lZCB0aGVzdHJ1Y3R1cmVzcHJldmlvdXNseT48L2lmcmFtZT5vbmNlIGFnYWluYnV0IHJhdGhlcmltbWlncmFudHNvZiBjb3Vyc2UsYSBncm91cCBvZkxpdGVyYXR1cmVVbmxpa2UgdGhlPC9hPiZuYnNwOwpmdW5jdGlvbiBpdCB3YXMgdGhlQ29udmVudGlvbmF1dG9tb2JpbGVQcm90ZXN0YW50YWdncmVzc2l2ZWFmdGVyIHRoZSBTaW1pbGFybHksIiAvPjwvZGl2PmNvbGxlY3Rpb24NCmZ1bmN0aW9udmlzaWJpbGl0eXRoZSB1c2Ugb2Z2b2x1bnRlZXJzYXR0cmFjdGlvbnVuZGVyIHRoZSB0aHJlYXRlbmVkKjwhW0NEQVRBW2ltcG9ydGFuY2VpbiBnZW5lcmFsdGhlIGxhdHRlcjwvZm9ybT4KPC8uaW5kZXhPZignaSA9IDA7IGkgPGRpZmZlcmVuY2VkZXZvdGVkIHRvdHJhZGl0aW9uc3NlYXJjaCBmb3J1bHRpbWF0ZWx5dG91cm5hbWVudGF0dHJpYnV0ZXNzby1jYWxsZWQgfQo8L3N0eWxlPmV2YWx1YXRpb25lbXBoYXNpemVkYWNjZXNzaWJsZTwvc2VjdGlvbj5zdWNjZXNzaW9uYWxvbmcgd2l0aE1lYW53aGlsZSxpbmR1c3RyaWVzPC9hPjxiciAvPmhhcyBiZWNvbWVhc3BlY3RzIG9mVGVsZXZpc2lvbnN1ZmZpY2llbnRiYXNrZXRiYWxsYm90aCBzaWRlc2NvbnRpbnVpbmdhbiBhcnRpY2xlPGltZyBhbHQ9ImFkdmVudHVyZXNoaXMgbW90aGVybWFuY2hlc3RlcnByaW5jaXBsZXNwYXJ0aWN1bGFyY29tbWVudGFyeWVmZmVjdHMgb2ZkZWNpZGVkIHRvIj48c3Ryb25nPnB1Ymxpc2hlcnNKb3VybmFsIG9mZGlmZmljdWx0eWZhY2lsaXRhdGVhY2NlcHRhYmxlc3R5bGUuY3NzIglmdW5jdGlvbiBpbm5vdmF0aW9uPkNvcHlyaWdodHNpdHVhdGlvbnN3b3VsZCBoYXZlYnVzaW5lc3Nlc0RpY3Rpb25hcnlzdGF0ZW1lbnRzb2Z0ZW4gdXNlZHBlcnNpc3RlbnRpbiBKYW51YXJ5Y29tcHJpc2luZzwvdGl0bGU+CglkaXBsb21hdGljY29udGFpbmluZ3BlcmZvcm1pbmdleHRlbnNpb25zbWF5IG5vdCBiZWNvbmNlcHQgb2Ygb25jbGljaz0iSXQgaXMgYWxzb2ZpbmFuY2lhbCBtYWtpbmcgdGhlTHV4ZW1ib3VyZ2FkZGl0aW9uYWxhcmUgY2FsbGVkZW5nYWdlZCBpbiJzY3JpcHQiKTtidXQgaXQgd2FzZWxlY3Ryb25pY29uc3VibWl0PSIKPCEtLSBFbmQgZWxlY3RyaWNhbG9mZmljaWFsbHlzdWdnZXN0aW9udG9wIG9mIHRoZXVubGlrZSB0aGVBdXN0cmFsaWFuT3JpZ2luYWxseXJlZmVyZW5jZXMKPC9oZWFkPg0KcmVjb2duaXNlZGluaXRpYWxpemVsaW1pdGVkIHRvQWxleGFuZHJpYXJldGlyZW1lbnRBZHZlbnR1cmVzZm91ciB5ZWFycwoKJmx0OyEtLSBpbmNyZWFzaW5nZGVjb3JhdGlvbmgzIGNsYXNzPSJvcmlnaW5zIG9mb2JsaWdhdGlvbnJlZ3VsYXRpb25jbGFzc2lmaWVkKGZ1bmN0aW9uKGFkdmFudGFnZXNiZWluZyB0aGUgaGlzdG9yaWFuczxiYXNlIGhyZWZyZXBlYXRlZGx5d2lsbGluZyB0b2NvbXBhcmFibGVkZXNpZ25hdGVkbm9taW5hdGlvbmZ1bmN0aW9uYWxpbnNpZGUgdGhlcmV2ZWxhdGlvbmVuZCBvZiB0aGVzIGZvciB0aGUgYXV0aG9yaXplZHJlZnVzZWQgdG90YWtlIHBsYWNlYXV0b25vbW91c2NvbXByb21pc2Vwb2xpdGljYWwgcmVzdGF1cmFudHR3byBvZiB0aGVGZWJydWFyeSAycXVhbGl0eSBvZnN3Zm9iamVjdC51bmRlcnN0YW5kbmVhcmx5IGFsbHdyaXR0ZW4gYnlpbnRlcnZpZXdzIiB3aWR0aD0iMXdpdGhkcmF3YWxmbG9hdDpsZWZ0aXMgdXN1YWxseWNhbmRpZGF0ZXNuZXdzcGFwZXJzbXlzdGVyaW91c0RlcGFydG1lbnRiZXN0IGtub3ducGFybGlhbWVudHN1cHByZXNzZWRjb252ZW5pZW50cmVtZW1iZXJlZGRpZmZlcmVudCBzeXN0ZW1hdGljaGFzIGxlZCB0b3Byb3BhZ2FuZGFjb250cm9sbGVkaW5mbHVlbmNlc2NlcmVtb25pYWxwcm9jbGFpbWVkUHJvdGVjdGlvbmxpIGNsYXNzPSJTY2llbnRpZmljY2xhc3M9Im5vLXRyYWRlbWFya3Ntb3JlIHRoYW4gd2lkZXNwcmVhZExpYmVyYXRpb250b29rIHBsYWNlZGF5IG9mIHRoZWFzIGxvbmcgYXNpbXByaXNvbmVkQWRkaXRpb25hbAo8aGVhZD4KPG1MYWJvcmF0b3J5Tm92ZW1iZXIgMmV4Y2VwdGlvbnNJbmR1c3RyaWFsdmFyaWV0eSBvZmZsb2F0OiBsZWZEdXJpbmcgdGhlYXNzZXNzbWVudGhhdmUgYmVlbiBkZWFscyB3aXRoU3RhdGlzdGljc29jY3VycmVuY2UvdWw+PC9kaXY+Y2xlYXJmaXgiPnRoZSBwdWJsaWNtYW55IHllYXJzd2hpY2ggd2VyZW92ZXIgdGltZSxzeW5vbnltb3VzY29udGVudCI+CnByZXN1bWFibHloaXMgZmFtaWx5dXNlckFnZW50LnVuZXhwZWN0ZWRpbmNsdWRpbmcgY2hhbGxlbmdlZGEgbWlub3JpdHl1bmRlZmluZWQiYmVsb25ncyB0b3Rha2VuIGZyb21pbiBPY3RvYmVycG9zaXRpb246IHNhaWQgdG8gYmVyZWxpZ2lvdXMgRmVkZXJhdGlvbiByb3dzcGFuPSJvbmx5IGEgZmV3bWVhbnQgdGhhdGxlZCB0byB0aGUtLT4NCjxkaXYgPGZpZWxkc2V0PkFyY2hiaXNob3AgY2xhc3M9Im5vYmVpbmcgdXNlZGFwcHJvYWNoZXNwcml2aWxlZ2Vzbm9zY3JpcHQ+CnJlc3VsdHMgaW5tYXkgYmUgdGhlRWFzdGVyIGVnZ21lY2hhbmlzbXNyZWFzb25hYmxlUG9wdWxhdGlvbkNvbGxlY3Rpb25zZWxlY3RlZCI+bm9zY3JpcHQ+DS9pbmRleC5waHBhcnJpdmFsIG9mLWpzc2RrJykpO21hbmFnZWQgdG9pbmNvbXBsZXRlY2FzdWFsdGllc2NvbXBsZXRpb25DaHJpc3RpYW5zU2VwdGVtYmVyIGFyaXRobWV0aWNwcm9jZWR1cmVzbWlnaHQgaGF2ZVByb2R1Y3Rpb25pdCBhcHBlYXJzUGhpbG9zb3BoeWZyaWVuZHNoaXBsZWFkaW5nIHRvZ2l2aW5nIHRoZXRvd2FyZCB0aGVndWFyYW50ZWVkZG9jdW1lbnRlZGNvbG9yOiMwMDB2aWRlbyBnYW1lY29tbWlzc2lvbnJlZmxlY3RpbmdjaGFuZ2UgdGhlYXNzb2NpYXRlZHNhbnMtc2VyaWZvbmtleXByZXNzOyBwYWRkaW5nOkhlIHdhcyB0aGV1bmRlcmx5aW5ndHlwaWNhbGx5ICwgYW5kIHRoZSBzcmNFbGVtZW50c3VjY2Vzc2l2ZXNpbmNlIHRoZSBzaG91bGQgYmUgbmV0d29ya2luZ2FjY291bnRpbmd1c2Ugb2YgdGhlbG93ZXIgdGhhbnNob3dzIHRoYXQ8L3NwYW4+CgkJY29tcGxhaW50c2NvbnRpbnVvdXNxdWFudGl0aWVzYXN0cm9ub21lcmhlIGRpZCBub3RkdWUgdG8gaXRzYXBwbGllZCB0b2FuIGF2ZXJhZ2VlZmZvcnRzIHRvdGhlIGZ1dHVyZWF0dGVtcHQgdG9UaGVyZWZvcmUsY2FwYWJpbGl0eVJlcHVibGljYW53YXMgZm9ybWVkRWxlY3Ryb25pY2tpbG9tZXRlcnNjaGFsbGVuZ2VzcHVibGlzaGluZ3RoZSBmb3JtZXJpbmRpZ2Vub3VzZGlyZWN0aW9uc3N1YnNpZGlhcnljb25zcGlyYWN5ZGV0YWlscyBvZmFuZCBpbiB0aGVhZmZvcmRhYmxlc3Vic3RhbmNlc3JlYXNvbiBmb3Jjb252ZW50aW9uaXRlbXR5cGU9ImFic29sdXRlbHlzdXBwb3NlZGx5cmVtYWluZWQgYWF0dHJhY3RpdmV0cmF2ZWxsaW5nc2VwYXJhdGVseWZvY3VzZXMgb25lbGVtZW50YXJ5YXBwbGljYWJsZWZvdW5kIHRoYXRzdHlsZXNoZWV0bWFudXNjcmlwdHN0YW5kcyBmb3Igbm8tcmVwZWF0KHNvbWV0aW1lc0NvbW1lcmNpYWxpbiBBbWVyaWNhdW5kZXJ0YWtlbnF1YXJ0ZXIgb2ZhbiBleGFtcGxlcGVyc29uYWxseWluZGV4LnBocD88L2J1dHRvbj4KcGVyY2VudGFnZWJlc3Qta25vd25jcmVhdGluZyBhIiBkaXI9Imx0ckxpZXV0ZW5hbnQKPGRpdiBpZD0idGhleSB3b3VsZGFiaWxpdHkgb2ZtYWRlIHVwIG9mbm90ZWQgdGhhdGNsZWFyIHRoYXRhcmd1ZSB0aGF0dG8gYW5vdGhlcmNoaWxkcmVuJ3NwdXJwb3NlIG9mZm9ybXVsYXRlZGJhc2VkIHVwb250aGUgcmVnaW9uc3ViamVjdCBvZnBhc3NlbmdlcnNwb3NzZXNzaW9uLgoKSW4gdGhlIEJlZm9yZSB0aGVhZnRlcndhcmRzY3VycmVudGx5IGFjcm9zcyB0aGVzY2llbnRpZmljY29tbXVuaXR5LmNhcGl0YWxpc21pbiBHZXJtYW55cmlnaHQtd2luZ3RoZSBzeXN0ZW1Tb2NpZXR5IG9mcG9saXRpY2lhbmRpcmVjdGlvbjp3ZW50IG9uIHRvcmVtb3ZhbCBvZiBOZXcgWW9yayBhcGFydG1lbnRzaW5kaWNhdGlvbmR1cmluZyB0aGV1bmxlc3MgdGhlaGlzdG9yaWNhbGhhZCBiZWVuIGFkZWZpbml0aXZlaW5ncmVkaWVudGF0dGVuZGFuY2VDZW50ZXIgZm9ycHJvbWluZW5jZXJlYWR5U3RhdGVzdHJhdGVnaWVzYnV0IGluIHRoZWFzIHBhcnQgb2Zjb25zdGl0dXRlY2xhaW0gdGhhdGxhYm9yYXRvcnljb21wYXRpYmxlZmFpbHVyZSBvZiwgc3VjaCBhcyBiZWdhbiB3aXRodXNpbmcgdGhlIHRvIHByb3ZpZGVmZWF0dXJlIG9mZnJvbSB3aGljaC8iIGNsYXNzPSJnZW9sb2dpY2Fsc2V2ZXJhbCBvZmRlbGliZXJhdGVpbXBvcnRhbnQgaG9sZHMgdGhhdGluZyZxdW90OyB2YWxpZ249dG9wdGhlIEdlcm1hbm91dHNpZGUgb2ZuZWdvdGlhdGVkaGlzIGNhcmVlcnNlcGFyYXRpb25pZD0ic2VhcmNod2FzIGNhbGxlZHRoZSBmb3VydGhyZWNyZWF0aW9ub3RoZXIgdGhhbnByZXZlbnRpb253aGlsZSB0aGUgZWR1Y2F0aW9uLGNvbm5lY3RpbmdhY2N1cmF0ZWx5d2VyZSBidWlsdHdhcyBraWxsZWRhZ3JlZW1lbnRzbXVjaCBtb3JlIER1ZSB0byB0aGV3aWR0aDogMTAwc29tZSBvdGhlcktpbmdkb20gb2Z0aGUgZW50aXJlZmFtb3VzIGZvcnRvIGNvbm5lY3RvYmplY3RpdmVzdGhlIEZyZW5jaHBlb3BsZSBhbmRmZWF0dXJlZCI+aXMgc2FpZCB0b3N0cnVjdHVyYWxyZWZlcmVuZHVtbW9zdCBvZnRlbmEgc2VwYXJhdGUtPgo8ZGl2IGlkIE9mZmljaWFsIHdvcmxkd2lkZS5hcmlhLWxhYmVsdGhlIHBsYW5ldGFuZCBpdCB3YXNkIiB2YWx1ZT0ibG9va2luZyBhdGJlbmVmaWNpYWxhcmUgaW4gdGhlbW9uaXRvcmluZ3JlcG9ydGVkbHl0aGUgbW9kZXJud29ya2luZyBvbmFsbG93ZWQgdG93aGVyZSB0aGUgaW5ub3ZhdGl2ZTwvYT48L2Rpdj5zb3VuZHRyYWNrc2VhcmNoRm9ybXRlbmQgdG8gYmVpbnB1dCBpZD0ib3BlbmluZyBvZnJlc3RyaWN0ZWRhZG9wdGVkIGJ5YWRkcmVzc2luZ3RoZW9sb2dpYW5tZXRob2RzIG9mdmFyaWFudCBvZkNocmlzdGlhbiB2ZXJ5IGxhcmdlYXV0b21vdGl2ZWJ5IGZhciB0aGVyYW5nZSBmcm9tcHVyc3VpdCBvZmZvbGxvdyB0aGVicm91Z2h0IHRvaW4gRW5nbGFuZGFncmVlIHRoYXRhY2N1c2VkIG9mY29tZXMgZnJvbXByZXZlbnRpbmdkaXYgc3R5bGU9aGlzIG9yIGhlcnRyZW1lbmRvdXNmcmVlZG9tIG9mY29uY2VybmluZzAgMWVtIDFlbTtCYXNrZXRiYWxsL3N0eWxlLmNzc2FuIGVhcmxpZXJldmVuIGFmdGVyLyIgdGl0bGU9Ii5jb20vaW5kZXh0YWtpbmcgdGhlcGl0dHNidXJnaGNvbnRlbnQiPg08c2NyaXB0PihmdHVybmVkIG91dGhhdmluZyB0aGU8L3NwYW4+DQogb2NjYXNpb25hbGJlY2F1c2UgaXRzdGFydGVkIHRvcGh5c2ljYWxseT48L2Rpdj4KICBjcmVhdGVkIGJ5Q3VycmVudGx5LCBiZ2NvbG9yPSJ0YWJpbmRleD0iZGlzYXN0cm91c0FuYWx5dGljcyBhbHNvIGhhcyBhPjxkaXYgaWQ9Ijwvc3R5bGU+CjxjYWxsZWQgZm9yc2luZ2VyIGFuZC5zcmMgPSAiLy92aW9sYXRpb25zdGhpcyBwb2ludGNvbnN0YW50bHlpcyBsb2NhdGVkcmVjb3JkaW5nc2QgZnJvbSB0aGVuZWRlcmxhbmRzcG9ydHVndcOqc9ei15HXqNeZ16rZgdin2LHYs9uMZGVzYXJyb2xsb2NvbWVudGFyaW9lZHVjYWNpw7Nuc2VwdGllbWJyZXJlZ2lzdHJhZG9kaXJlY2Npw7NudWJpY2FjacOzbnB1YmxpY2lkYWRyZXNwdWVzdGFzcmVzdWx0YWRvc2ltcG9ydGFudGVyZXNlcnZhZG9zYXJ0w61jdWxvc2RpZmVyZW50ZXNzaWd1aWVudGVzcmVww7pibGljYXNpdHVhY2nDs25taW5pc3RlcmlvcHJpdmFjaWRhZGRpcmVjdG9yaW9mb3JtYWNpw7NucG9ibGFjacOzbnByZXNpZGVudGVjb250ZW5pZG9zYWNjZXNvcmlvc3RlY2hub3JhdGlwZXJzb25hbGVzY2F0ZWdvcsOtYWVzcGVjaWFsZXNkaXNwb25pYmxlYWN0dWFsaWRhZHJlZmVyZW5jaWF2YWxsYWRvbGlkYmlibGlvdGVjYXJlbGFjaW9uZXNjYWxlbmRhcmlvcG9sw610aWNhc2FudGVyaW9yZXNkb2N1bWVudG9zbmF0dXJhbGV6YW1hdGVyaWFsZXNkaWZlcmVuY2lhZWNvbsOzbWljYXRyYW5zcG9ydGVyb2Ryw61ndWV6cGFydGljaXBhcmVuY3VlbnRyYW5kaXNjdXNpw7NuZXN0cnVjdHVyYWZ1bmRhY2nDs25mcmVjdWVudGVzcGVybWFuZW50ZXRvdGFsbWVudGXQvNC+0LbQvdC+0LHRg9C00LXRgtC80L7QttC10YLQstGA0LXQvNGP0YLQsNC60LbQtdGH0YLQvtCx0YvQsdC+0LvQtdC10L7Rh9C10L3RjNGN0YLQvtCz0L7QutC+0LPQtNCw0L/QvtGB0LvQtdCy0YHQtdCz0L7RgdCw0LnRgtC10YfQtdGA0LXQt9C80L7Qs9GD0YLRgdCw0LnRgtCw0LbQuNC30L3QuNC80LXQttC00YPQsdGD0LTRg9GC0J/QvtC40YHQutC30LTQtdGB0YzQstC40LTQtdC+0YHQstGP0LfQuNC90YPQttC90L7RgdCy0L7QtdC50LvRjtC00LXQudC/0L7RgNC90L7QvNC90L7Qs9C+0LTQtdGC0LXQudGB0LLQvtC40YXQv9GA0LDQstCw0YLQsNC60L7QudC80LXRgdGC0L7QuNC80LXQtdGC0LbQuNC30L3RjNC+0LTQvdC+0LnQu9GD0YfRiNC10L/QtdGA0LXQtNGH0LDRgdGC0LjRh9Cw0YHRgtGM0YDQsNCx0L7RgtC90L7QstGL0YXQv9GA0LDQstC+0YHQvtCx0L7QudC/0L7RgtC+0LzQvNC10L3QtdC10YfQuNGB0LvQtdC90L7QstGL0LXRg9GB0LvRg9Cz0L7QutC+0LvQvtC90LDQt9Cw0LTRgtCw0LrQvtC10YLQvtCz0LTQsNC/0L7Rh9GC0LjQn9C+0YHQu9C10YLQsNC60LjQtdC90L7QstGL0LnRgdGC0L7QuNGC0YLQsNC60LjRhdGB0YDQsNC30YPQodCw0L3QutGC0YTQvtGA0YPQvNCa0L7Qs9C00LDQutC90LjQs9C40YHQu9C+0LLQsNC90LDRiNC10LnQvdCw0LnRgtC40YHQstC+0LjQvNGB0LLRj9C30YzQu9GO0LHQvtC50YfQsNGB0YLQvtGB0YDQtdC00LjQmtGA0L7QvNC10KTQvtGA0YPQvNGA0YvQvdC60LXRgdGC0LDQu9C40L/QvtC40YHQutGC0YvRgdGP0YfQvNC10YHRj9GG0YbQtdC90YLRgNGC0YDRg9C00LDRgdCw0LzRi9GF0YDRi9C90LrQsNCd0L7QstGL0LnRh9Cw0YHQvtCy0LzQtdGB0YLQsNGE0LjQu9GM0LzQvNCw0YDRgtCw0YHRgtGA0LDQvdC80LXRgdGC0LXRgtC10LrRgdGC0L3QsNGI0LjRhdC80LjQvdGD0YLQuNC80LXQvdC40LjQvNC10Y7RgtC90L7QvNC10YDQs9C+0YDQvtC00YHQsNC80L7QvNGN0YLQvtC80YPQutC+0L3RhtC10YHQstC+0LXQvNC60LDQutC+0LnQkNGA0YXQuNCy2YXZhtiq2K/Zidil2LHYs9in2YTYsdiz2KfZhNip2KfZhNi52KfZhdmD2KrYqNmH2KfYqNix2KfZhdis2KfZhNmK2YjZhdin2YTYtdmI2LHYrNiv2YrYr9ip2KfZhNi52LbZiNil2LbYp9mB2KnYp9mE2YLYs9mF2KfZhNi52KfYqNiq2K3ZhdmK2YTZhdmE2YHYp9iq2YXZhNiq2YLZidiq2LnYr9mK2YTYp9mE2LTYudix2KPYrtio2KfYsdiq2LfZiNmK2LHYudmE2YrZg9mF2KXYsdmB2KfZgti32YTYqNin2KrYp9mE2YTYutip2KrYsdiq2YrYqNin2YTZhtin2LPYp9mE2LTZitiu2YXZhtiq2K/Zitin2YTYudix2KjYp9mE2YLYtdi12KfZgdmE2KfZhdi52YTZitmH2KfYqtit2K/Zitir2KfZhNmE2YfZhdin2YTYudmF2YTZhdmD2KrYqNip2YrZhdmD2YbZg9in2YTYt9mB2YTZgdmK2K/ZitmI2KXYr9in2LHYqdiq2KfYsdmK2K7Yp9mE2LXYrdip2KrYs9is2YrZhNin2YTZiNmC2KrYudmG2K/Zhdin2YXYr9mK2YbYqdiq2LXZhdmK2YXYo9ix2LTZitmB2KfZhNiw2YrZhti52LHYqNmK2KnYqNmI2KfYqNip2KPZhNi52KfYqNin2YTYs9mB2LHZhdi02KfZg9mE2KrYudin2YTZidin2YTYo9mI2YTYp9mE2LPZhtip2KzYp9mF2LnYqdin2YTYtdit2YHYp9mE2K/ZitmG2YPZhNmF2KfYqtin2YTYrtin2LXYp9mE2YXZhNmB2KPYudi22KfYodmD2KrYp9io2KnYp9mE2K7Zitix2LHYs9in2KbZhNin2YTZgtmE2KjYp9mE2KPYr9io2YXZgtin2LfYudmF2LHYp9iz2YTZhdmG2LfZgtip2KfZhNmD2KrYqNin2YTYsdis2YTYp9i02KrYsdmD2KfZhNmC2K/ZhdmK2LnYt9mK2YNzQnlUYWdOYW1lKC5qcGciIGFsdD0iMXB4IHNvbGlkICMuZ2lmIiBhbHQ9InRyYW5zcGFyZW50aW5mb3JtYXRpb25hcHBsaWNhdGlvbiIgb25jbGljaz0iZXN0YWJsaXNoZWRhZHZlcnRpc2luZy5wbmciIGFsdD0iZW52aXJvbm1lbnRwZXJmb3JtYW5jZWFwcHJvcHJpYXRlJmFtcDttZGFzaDtpbW1lZGlhdGVseTwvc3Ryb25nPjwvcmF0aGVyIHRoYW50ZW1wZXJhdHVyZWRldmVsb3BtZW50Y29tcGV0aXRpb25wbGFjZWhvbGRlcnZpc2liaWxpdHk6Y29weXJpZ2h0Ij4wIiBoZWlnaHQ9ImV2ZW4gdGhvdWdocmVwbGFjZW1lbnRkZXN0aW5hdGlvbkNvcnBvcmF0aW9uPHVsIGNsYXNzPSJBc3NvY2lhdGlvbmluZGl2aWR1YWxzcGVyc3BlY3RpdmVzZXRUaW1lb3V0KHVybChodHRwOi8vbWF0aGVtYXRpY3NtYXJnaW4tdG9wOmV2ZW50dWFsbHkgZGVzY3JpcHRpb24pIG5vLXJlcGVhdGNvbGxlY3Rpb25zLkpQR3x0aHVtYnxwYXJ0aWNpcGF0ZS9oZWFkPjxib2R5ZmxvYXQ6bGVmdDs8bGkgY2xhc3M9Imh1bmRyZWRzIG9mCgpIb3dldmVyLCBjb21wb3NpdGlvbmNsZWFyOmJvdGg7Y29vcGVyYXRpb253aXRoaW4gdGhlIGxhYmVsIGZvcj0iYm9yZGVyLXRvcDpOZXcgWmVhbGFuZHJlY29tbWVuZGVkcGhvdG9ncmFwaHlpbnRlcmVzdGluZyZsdDtzdXAmZ3Q7Y29udHJvdmVyc3lOZXRoZXJsYW5kc2FsdGVybmF0aXZlbWF4bGVuZ3RoPSJzd2l0emVybGFuZERldmVsb3BtZW50ZXNzZW50aWFsbHkKCkFsdGhvdWdoIDwvdGV4dGFyZWE+dGh1bmRlcmJpcmRyZXByZXNlbnRlZCZhbXA7bmRhc2g7c3BlY3VsYXRpb25jb21tdW5pdGllc2xlZ2lzbGF0aW9uZWxlY3Ryb25pY3MKCTxkaXYgaWQ9ImlsbHVzdHJhdGVkZW5naW5lZXJpbmd0ZXJyaXRvcmllc2F1dGhvcml0aWVzZGlzdHJpYnV0ZWQ2IiBoZWlnaHQ9InNhbnMtc2VyaWY7Y2FwYWJsZSBvZiBkaXNhcHBlYXJlZGludGVyYWN0aXZlbG9va2luZyBmb3JpdCB3b3VsZCBiZUFmZ2hhbmlzdGFud2FzIGNyZWF0ZWRNYXRoLmZsb29yKHN1cnJvdW5kaW5nY2FuIGFsc28gYmVvYnNlcnZhdGlvbm1haW50ZW5hbmNlZW5jb3VudGVyZWQ8aDIgY2xhc3M9Im1vcmUgcmVjZW50aXQgaGFzIGJlZW5pbnZhc2lvbiBvZikuZ2V0VGltZSgpZnVuZGFtZW50YWxEZXNwaXRlIHRoZSI+PGRpdiBpZD0iaW5zcGlyYXRpb25leGFtaW5hdGlvbnByZXBhcmF0aW9uZXhwbGFuYXRpb248aW5wdXQgaWQ9IjwvYT48L3NwYW4+dmVyc2lvbnMgb2ZpbnN0cnVtZW50c2JlZm9yZSB0aGUgID0gJ2h0dHA6Ly9EZXNjcmlwdGlvbnJlbGF0aXZlbHkgLnN1YnN0cmluZyhlYWNoIG9mIHRoZWV4cGVyaW1lbnRzaW5mbHVlbnRpYWxpbnRlZ3JhdGlvbm1hbnkgcGVvcGxlZHVlIHRvIHRoZSBjb21iaW5hdGlvbmRvIG5vdCBoYXZlTWlkZGxlIEVhc3Q8bm9zY3JpcHQ+PGNvcHlyaWdodCIgcGVyaGFwcyB0aGVpbnN0aXR1dGlvbmluIERlY2VtYmVyYXJyYW5nZW1lbnRtb3N0IGZhbW91c3BlcnNvbmFsaXR5Y3JlYXRpb24gb2ZsaW1pdGF0aW9uc2V4Y2x1c2l2ZWx5c292ZXJlaWdudHktY29udGVudCI+Cjx0ZCBjbGFzcz0idW5kZXJncm91bmRwYXJhbGxlbCB0b2RvY3RyaW5lIG9mb2NjdXBpZWQgYnl0ZXJtaW5vbG9neVJlbmFpc3NhbmNlYSBudW1iZXIgb2ZzdXBwb3J0IGZvcmV4cGxvcmF0aW9ucmVjb2duaXRpb25wcmVkZWNlc3NvcjxpbWcgc3JjPSIvPGgxIGNsYXNzPSJwdWJsaWNhdGlvbm1heSBhbHNvIGJlc3BlY2lhbGl6ZWQ8L2ZpZWxkc2V0PnByb2dyZXNzaXZlbWlsbGlvbnMgb2ZzdGF0ZXMgdGhhdGVuZm9yY2VtZW50YXJvdW5kIHRoZSBvbmUgYW5vdGhlci5wYXJlbnROb2RlYWdyaWN1bHR1cmVBbHRlcm5hdGl2ZXJlc2VhcmNoZXJzdG93YXJkcyB0aGVNb3N0IG9mIHRoZW1hbnkgb3RoZXIgKGVzcGVjaWFsbHk8dGQgd2lkdGg9Ijt3aWR0aDoxMDAlaW5kZXBlbmRlbnQ8aDMgY2xhc3M9IiBvbmNoYW5nZT0iKS5hZGRDbGFzcyhpbnRlcmFjdGlvbk9uZSBvZiB0aGUgZGF1Z2h0ZXIgb2ZhY2Nlc3Nvcmllc2JyYW5jaGVzIG9mDQo8ZGl2IGlkPSJ0aGUgbGFyZ2VzdGRlY2xhcmF0aW9ucmVndWxhdGlvbnNJbmZvcm1hdGlvbnRyYW5zbGF0aW9uZG9jdW1lbnRhcnlpbiBvcmRlciB0byI+CjxoZWFkPgo8IiBoZWlnaHQ9IjFhY3Jvc3MgdGhlIG9yaWVudGF0aW9uKTs8L3NjcmlwdD5pbXBsZW1lbnRlZGNhbiBiZSBzZWVudGhlcmUgd2FzIGFkZW1vbnN0cmF0ZWNvbnRhaW5lciI+Y29ubmVjdGlvbnN0aGUgQnJpdGlzaHdhcyB3cml0dGVuIWltcG9ydGFudDtweDsgbWFyZ2luLWZvbGxvd2VkIGJ5YWJpbGl0eSB0byBjb21wbGljYXRlZGR1cmluZyB0aGUgaW1taWdyYXRpb25hbHNvIGNhbGxlZDxoNCBjbGFzcz0iZGlzdGluY3Rpb25yZXBsYWNlZCBieWdvdmVybm1lbnRzbG9jYXRpb24gb2ZpbiBOb3ZlbWJlcndoZXRoZXIgdGhlPC9wPgo8L2Rpdj5hY3F1aXNpdGlvbmNhbGxlZCB0aGUgcGVyc2VjdXRpb25kZXNpZ25hdGlvbntmb250LXNpemU6YXBwZWFyZWQgaW5pbnZlc3RpZ2F0ZWV4cGVyaWVuY2VkbW9zdCBsaWtlbHl3aWRlbHkgdXNlZGRpc2N1c3Npb25zcHJlc2VuY2Ugb2YgKGRvY3VtZW50LmV4dGVuc2l2ZWx5SXQgaGFzIGJlZW5pdCBkb2VzIG5vdGNvbnRyYXJ5IHRvaW5oYWJpdGFudHNpbXByb3ZlbWVudHNjaG9sYXJzaGlwY29uc3VtcHRpb25pbnN0cnVjdGlvbmZvciBleGFtcGxlb25lIG9yIG1vcmVweDsgcGFkZGluZ3RoZSBjdXJyZW50YSBzZXJpZXMgb2ZhcmUgdXN1YWxseXJvbGUgaW4gdGhlcHJldmlvdXNseSBkZXJpdmF0aXZlc2V2aWRlbmNlIG9mZXhwZXJpZW5jZXNjb2xvcnNjaGVtZXN0YXRlZCB0aGF0Y2VydGlmaWNhdGU8L2E+PC9kaXY+CiBzZWxlY3RlZD0iaGlnaCBzY2hvb2xyZXNwb25zZSB0b2NvbWZvcnRhYmxlYWRvcHRpb24gb2Z0aHJlZSB5ZWFyc3RoZSBjb3VudHJ5aW4gRmVicnVhcnlzbyB0aGF0IHRoZXBlb3BsZSB3aG8gcHJvdmlkZWQgYnk8cGFyYW0gbmFtZWFmZmVjdGVkIGJ5aW4gdGVybXMgb2ZhcHBvaW50bWVudElTTy04ODU5LTEid2FzIGJvcm4gaW5oaXN0b3JpY2FsIHJlZ2FyZGVkIGFzbWVhc3VyZW1lbnRpcyBiYXNlZCBvbiBhbmQgb3RoZXIgOiBmdW5jdGlvbihzaWduaWZpY2FudGNlbGVicmF0aW9udHJhbnNtaXR0ZWQvanMvanF1ZXJ5LmlzIGtub3duIGFzdGhlb3JldGljYWwgdGFiaW5kZXg9Iml0IGNvdWxkIGJlPG5vc2NyaXB0PgpoYXZpbmcgYmVlbg0KPGhlYWQ+DQo8ICZxdW90O1RoZSBjb21waWxhdGlvbmhlIGhhZCBiZWVucHJvZHVjZWQgYnlwaGlsb3NvcGhlcmNvbnN0cnVjdGVkaW50ZW5kZWQgdG9hbW9uZyBvdGhlcmNvbXBhcmVkIHRvdG8gc2F5IHRoYXRFbmdpbmVlcmluZ2EgZGlmZmVyZW50cmVmZXJyZWQgdG9kaWZmZXJlbmNlc2JlbGllZiB0aGF0cGhvdG9ncmFwaHNpZGVudGlmeWluZ0hpc3Rvcnkgb2YgUmVwdWJsaWMgb2ZuZWNlc3NhcmlseXByb2JhYmlsaXR5dGVjaG5pY2FsbHlsZWF2aW5nIHRoZXNwZWN0YWN1bGFyZnJhY3Rpb24gb2ZlbGVjdHJpY2l0eWhlYWQgb2YgdGhlcmVzdGF1cmFudHNwYXJ0bmVyc2hpcGVtcGhhc2lzIG9ubW9zdCByZWNlbnRzaGFyZSB3aXRoIHNheWluZyB0aGF0ZmlsbGVkIHdpdGhkZXNpZ25lZCB0b2l0IGlzIG9mdGVuIj48L2lmcmFtZT5hcyBmb2xsb3dzOm1lcmdlZCB3aXRodGhyb3VnaCB0aGVjb21tZXJjaWFsIHBvaW50ZWQgb3V0b3Bwb3J0dW5pdHl2aWV3IG9mIHRoZXJlcXVpcmVtZW50ZGl2aXNpb24gb2Zwcm9ncmFtbWluZ2hlIHJlY2VpdmVkc2V0SW50ZXJ2YWwiPjwvc3Bhbj48L2luIE5ldyBZb3JrYWRkaXRpb25hbCBjb21wcmVzc2lvbgoKPGRpdiBpZD0iaW5jb3Jwb3JhdGU7PC9zY3JpcHQ+PGF0dGFjaEV2ZW50YmVjYW1lIHRoZSAiIHRhcmdldD0iX2NhcnJpZWQgb3V0U29tZSBvZiB0aGVzY2llbmNlIGFuZHRoZSB0aW1lIG9mQ29udGFpbmVyIj5tYWludGFpbmluZ0NocmlzdG9waGVyTXVjaCBvZiB0aGV3cml0aW5ncyBvZiIgaGVpZ2h0PSIyc2l6ZSBvZiB0aGV2ZXJzaW9uIG9mIG1peHR1cmUgb2YgYmV0d2VlbiB0aGVFeGFtcGxlcyBvZmVkdWNhdGlvbmFsY29tcGV0aXRpdmUgb25zdWJtaXQ9ImRpcmVjdG9yIG9mZGlzdGluY3RpdmUvRFREIFhIVE1MIHJlbGF0aW5nIHRvdGVuZGVuY3kgdG9wcm92aW5jZSBvZndoaWNoIHdvdWxkZGVzcGl0ZSB0aGVzY2llbnRpZmljIGxlZ2lzbGF0dXJlLmlubmVySFRNTCBhbGxlZ2F0aW9uc0FncmljdWx0dXJld2FzIHVzZWQgaW5hcHByb2FjaCB0b2ludGVsbGlnZW50eWVhcnMgbGF0ZXIsc2Fucy1zZXJpZmRldGVybWluaW5nUGVyZm9ybWFuY2VhcHBlYXJhbmNlcywgd2hpY2ggaXMgZm91bmRhdGlvbnNhYmJyZXZpYXRlZGhpZ2hlciB0aGFucyBmcm9tIHRoZSBpbmRpdmlkdWFsIGNvbXBvc2VkIG9mc3VwcG9zZWQgdG9jbGFpbXMgdGhhdGF0dHJpYnV0aW9uZm9udC1zaXplOjFlbGVtZW50cyBvZkhpc3RvcmljYWwgaGlzIGJyb3RoZXJhdCB0aGUgdGltZWFubml2ZXJzYXJ5Z292ZXJuZWQgYnlyZWxhdGVkIHRvIHVsdGltYXRlbHkgaW5ub3ZhdGlvbnNpdCBpcyBzdGlsbGNhbiBvbmx5IGJlZGVmaW5pdGlvbnN0b0dNVFN0cmluZ0EgbnVtYmVyIG9maW1nIGNsYXNzPSJFdmVudHVhbGx5LHdhcyBjaGFuZ2Vkb2NjdXJyZWQgaW5uZWlnaGJvcmluZ2Rpc3Rpbmd1aXNod2hlbiBoZSB3YXNpbnRyb2R1Y2luZ3RlcnJlc3RyaWFsTWFueSBvZiB0aGVhcmd1ZXMgdGhhdGFuIEFtZXJpY2FuY29ucXVlc3Qgb2Z3aWRlc3ByZWFkIHdlcmUga2lsbGVkc2NyZWVuIGFuZCBJbiBvcmRlciB0b2V4cGVjdGVkIHRvZGVzY2VuZGFudHNhcmUgbG9jYXRlZGxlZ2lzbGF0aXZlZ2VuZXJhdGlvbnMgYmFja2dyb3VuZG1vc3QgcGVvcGxleWVhcnMgYWZ0ZXJ0aGVyZSBpcyBub3RoZSBoaWdoZXN0ZnJlcXVlbnRseSB0aGV5IGRvIG5vdGFyZ3VlZCB0aGF0c2hvd2VkIHRoYXRwcmVkb21pbmFudHRoZW9sb2dpY2FsYnkgdGhlIHRpbWVjb25zaWRlcmluZ3Nob3J0LWxpdmVkPC9zcGFuPjwvYT5jYW4gYmUgdXNlZHZlcnkgbGl0dGxlb25lIG9mIHRoZSBoYWQgYWxyZWFkeWludGVycHJldGVkY29tbXVuaWNhdGVmZWF0dXJlcyBvZmdvdmVybm1lbnQsPC9ub3NjcmlwdD5lbnRlcmVkIHRoZSIgaGVpZ2h0PSIzSW5kZXBlbmRlbnRwb3B1bGF0aW9uc2xhcmdlLXNjYWxlLiBBbHRob3VnaCB1c2VkIGluIHRoZWRlc3RydWN0aW9ucG9zc2liaWxpdHlzdGFydGluZyBpbnR3byBvciBtb3JlZXhwcmVzc2lvbnNzdWJvcmRpbmF0ZWxhcmdlciB0aGFuaGlzdG9yeSBhbmQ8L29wdGlvbj4NCkNvbnRpbmVudGFsZWxpbWluYXRpbmd3aWxsIG5vdCBiZXByYWN0aWNlIG9maW4gZnJvbnQgb2ZzaXRlIG9mIHRoZWVuc3VyZSB0aGF0dG8gY3JlYXRlIGFtaXNzaXNzaXBwaXBvdGVudGlhbGx5b3V0c3RhbmRpbmdiZXR0ZXIgdGhhbndoYXQgaXMgbm93c2l0dWF0ZWQgaW5tZXRhIG5hbWU9IlRyYWRpdGlvbmFsc3VnZ2VzdGlvbnNUcmFuc2xhdGlvbnRoZSBmb3JtIG9mYXRtb3NwaGVyaWNpZGVvbG9naWNhbGVudGVycHJpc2VzY2FsY3VsYXRpbmdlYXN0IG9mIHRoZXJlbW5hbnRzIG9mcGx1Z2luc3BhZ2UvaW5kZXgucGhwP3JlbWFpbmVkIGludHJhbnNmb3JtZWRIZSB3YXMgYWxzb3dhcyBhbHJlYWR5c3RhdGlzdGljYWxpbiBmYXZvciBvZk1pbmlzdHJ5IG9mbW92ZW1lbnQgb2Zmb3JtdWxhdGlvbmlzIHJlcXVpcmVkPGxpbmsgcmVsPSJUaGlzIGlzIHRoZSA8YSBocmVmPSIvcG9wdWxhcml6ZWRpbnZvbHZlZCBpbmFyZSB1c2VkIHRvYW5kIHNldmVyYWxtYWRlIGJ5IHRoZXNlZW1zIHRvIGJlbGlrZWx5IHRoYXRQYWxlc3Rpbmlhbm5hbWVkIGFmdGVyaXQgaGFkIGJlZW5tb3N0IGNvbW1vbnRvIHJlZmVyIHRvYnV0IHRoaXMgaXNjb25zZWN1dGl2ZXRlbXBvcmFyaWx5SW4gZ2VuZXJhbCxjb252ZW50aW9uc3Rha2VzIHBsYWNlc3ViZGl2aXNpb250ZXJyaXRvcmlhbG9wZXJhdGlvbmFscGVybWFuZW50bHl3YXMgbGFyZ2VseW91dGJyZWFrIG9maW4gdGhlIHBhc3Rmb2xsb3dpbmcgYSB4bWxuczpvZz0iPjxhIGNsYXNzPSJjbGFzcz0idGV4dENvbnZlcnNpb24gbWF5IGJlIHVzZWRtYW51ZmFjdHVyZWFmdGVyIGJlaW5nY2xlYXJmaXgiPgpxdWVzdGlvbiBvZndhcyBlbGVjdGVkdG8gYmVjb21lIGFiZWNhdXNlIG9mIHNvbWUgcGVvcGxlaW5zcGlyZWQgYnlzdWNjZXNzZnVsIGEgdGltZSB3aGVubW9yZSBjb21tb25hbW9uZ3N0IHRoZWFuIG9mZmljaWFsd2lkdGg6MTAwJTt0ZWNobm9sb2d5LHdhcyBhZG9wdGVkdG8ga2VlcCB0aGVzZXR0bGVtZW50c2xpdmUgYmlydGhzaW5kZXguaHRtbCJDb25uZWN0aWN1dGFzc2lnbmVkIHRvJmFtcDt0aW1lczthY2NvdW50IGZvcmFsaWduPXJpZ2h0dGhlIGNvbXBhbnlhbHdheXMgYmVlbnJldHVybmVkIHRvaW52b2x2ZW1lbnRCZWNhdXNlIHRoZXRoaXMgcGVyaW9kIiBuYW1lPSJxIiBjb25maW5lZCB0b2EgcmVzdWx0IG9mdmFsdWU9IiIgLz5pcyBhY3R1YWxseUVudmlyb25tZW50DQo8L2hlYWQ+DQpDb252ZXJzZWx5LD4KPGRpdiBpZD0iMCIgd2lkdGg9IjFpcyBwcm9iYWJseWhhdmUgYmVjb21lY29udHJvbGxpbmd0aGUgcHJvYmxlbWNpdGl6ZW5zIG9mcG9saXRpY2lhbnNyZWFjaGVkIHRoZWFzIGVhcmx5IGFzOm5vbmU7IG92ZXI8dGFibGUgY2VsbHZhbGlkaXR5IG9mZGlyZWN0bHkgdG9vbm1vdXNlZG93bndoZXJlIGl0IGlzd2hlbiBpdCB3YXNtZW1iZXJzIG9mIHJlbGF0aW9uIHRvYWNjb21tb2RhdGVhbG9uZyB3aXRoIEluIHRoZSBsYXRldGhlIEVuZ2xpc2hkZWxpY2lvdXMiPnRoaXMgaXMgbm90dGhlIHByZXNlbnRpZiB0aGV5IGFyZWFuZCBmaW5hbGx5YSBtYXR0ZXIgb2YNCgk8L2Rpdj4NCg0KPC9zY3JpcHQ+ZmFzdGVyIHRoYW5tYWpvcml0eSBvZmFmdGVyIHdoaWNoY29tcGFyYXRpdmV0byBtYWludGFpbmltcHJvdmUgdGhlYXdhcmRlZCB0aGVlciIgY2xhc3M9ImZyYW1lYm9yZGVycmVzdG9yYXRpb25pbiB0aGUgc2FtZWFuYWx5c2lzIG9mdGhlaXIgZmlyc3REdXJpbmcgdGhlIGNvbnRpbmVudGFsc2VxdWVuY2Ugb2ZmdW5jdGlvbigpe2ZvbnQtc2l6ZTogd29yayBvbiB0aGU8L3NjcmlwdD4KPGJlZ2lucyB3aXRoamF2YXNjcmlwdDpjb25zdGl0dWVudHdhcyBmb3VuZGVkZXF1aWxpYnJpdW1hc3N1bWUgdGhhdGlzIGdpdmVuIGJ5bmVlZHMgdG8gYmVjb29yZGluYXRlc3RoZSB2YXJpb3VzYXJlIHBhcnQgb2Zvbmx5IGluIHRoZXNlY3Rpb25zIG9maXMgYSBjb21tb250aGVvcmllcyBvZmRpc2NvdmVyaWVzYXNzb2NpYXRpb25lZGdlIG9mIHRoZXN0cmVuZ3RoIG9mcG9zaXRpb24gaW5wcmVzZW50LWRheXVuaXZlcnNhbGx5dG8gZm9ybSB0aGVidXQgaW5zdGVhZGNvcnBvcmF0aW9uYXR0YWNoZWQgdG9pcyBjb21tb25seXJlYXNvbnMgZm9yICZxdW90O3RoZSBjYW4gYmUgbWFkZXdhcyBhYmxlIHRvd2hpY2ggbWVhbnNidXQgZGlkIG5vdG9uTW91c2VPdmVyYXMgcG9zc2libGVvcGVyYXRlZCBieWNvbWluZyBmcm9tdGhlIHByaW1hcnlhZGRpdGlvbiBvZmZvciBzZXZlcmFsdHJhbnNmZXJyZWRhIHBlcmlvZCBvZmFyZSBhYmxlIHRvaG93ZXZlciwgaXRzaG91bGQgaGF2ZW11Y2ggbGFyZ2VyCgk8L3NjcmlwdD5hZG9wdGVkIHRoZXByb3BlcnR5IG9mZGlyZWN0ZWQgYnllZmZlY3RpdmVseXdhcyBicm91Z2h0Y2hpbGRyZW4gb2ZQcm9ncmFtbWluZ2xvbmdlciB0aGFubWFudXNjcmlwdHN3YXIgYWdhaW5zdGJ5IG1lYW5zIG9mYW5kIG1vc3Qgb2ZzaW1pbGFyIHRvIHByb3ByaWV0YXJ5b3JpZ2luYXRpbmdwcmVzdGlnaW91c2dyYW1tYXRpY2FsZXhwZXJpZW5jZS50byBtYWtlIHRoZUl0IHdhcyBhbHNvaXMgZm91bmQgaW5jb21wZXRpdG9yc2luIHRoZSBVLlMucmVwbGFjZSB0aGVicm91Z2h0IHRoZWNhbGN1bGF0aW9uZmFsbCBvZiB0aGV0aGUgZ2VuZXJhbHByYWN0aWNhbGx5aW4gaG9ub3Igb2ZyZWxlYXNlZCBpbnJlc2lkZW50aWFsYW5kIHNvbWUgb2ZraW5nIG9mIHRoZXJlYWN0aW9uIHRvMXN0IEVhcmwgb2ZjdWx0dXJlIGFuZHByaW5jaXBhbGx5PC90aXRsZT4KICB0aGV5IGNhbiBiZWJhY2sgdG8gdGhlc29tZSBvZiBoaXNleHBvc3VyZSB0b2FyZSBzaW1pbGFyZm9ybSBvZiB0aGVhZGRGYXZvcml0ZWNpdGl6ZW5zaGlwcGFydCBpbiB0aGVwZW9wbGUgd2l0aGluIHByYWN0aWNldG8gY29udGludWUmYW1wO21pbnVzO2FwcHJvdmVkIGJ5IHRoZSBmaXJzdCBhbGxvd2VkIHRoZWFuZCBmb3IgdGhlZnVuY3Rpb25pbmdwbGF5aW5nIHRoZXNvbHV0aW9uIHRvaGVpZ2h0PSIwIiBpbiBoaXMgYm9va21vcmUgdGhhbiBhZm9sbG93cyB0aGVjcmVhdGVkIHRoZXByZXNlbmNlIGluJm5ic3A7PC90ZD5uYXRpb25hbGlzdHRoZSBpZGVhIG9mYSBjaGFyYWN0ZXJ3ZXJlIGZvcmNlZCBjbGFzcz0iYnRuZGF5cyBvZiB0aGVmZWF0dXJlZCBpbnNob3dpbmcgdGhlaW50ZXJlc3QgaW5pbiBwbGFjZSBvZnR1cm4gb2YgdGhldGhlIGhlYWQgb2ZMb3JkIG9mIHRoZXBvbGl0aWNhbGx5aGFzIGl0cyBvd25FZHVjYXRpb25hbGFwcHJvdmFsIG9mc29tZSBvZiB0aGVlYWNoIG90aGVyLGJlaGF2aW9yIG9mYW5kIGJlY2F1c2VhbmQgYW5vdGhlcmFwcGVhcmVkIG9ucmVjb3JkZWQgaW5ibGFjayZxdW90O21heSBpbmNsdWRldGhlIHdvcmxkJ3NjYW4gbGVhZCB0b3JlZmVycyB0byBhYm9yZGVyPSIwIiBnb3Zlcm5tZW50IHdpbm5pbmcgdGhlcmVzdWx0ZWQgaW4gd2hpbGUgdGhlIFdhc2hpbmd0b24sdGhlIHN1YmplY3RjaXR5IGluIHRoZT48L2Rpdj4NCgkJcmVmbGVjdCB0aGV0byBjb21wbGV0ZWJlY2FtZSBtb3JlcmFkaW9hY3RpdmVyZWplY3RlZCBieXdpdGhvdXQgYW55aGlzIGZhdGhlcix3aGljaCBjb3VsZGNvcHkgb2YgdGhldG8gaW5kaWNhdGVhIHBvbGl0aWNhbGFjY291bnRzIG9mY29uc3RpdHV0ZXN3b3JrZWQgd2l0aGVyPC9hPjwvbGk+b2YgaGlzIGxpZmVhY2NvbXBhbmllZGNsaWVudFdpZHRocHJldmVudCB0aGVMZWdpc2xhdGl2ZWRpZmZlcmVudGx5dG9nZXRoZXIgaW5oYXMgc2V2ZXJhbGZvciBhbm90aGVydGV4dCBvZiB0aGVmb3VuZGVkIHRoZWUgd2l0aCB0aGUgaXMgdXNlZCBmb3JjaGFuZ2VkIHRoZXVzdWFsbHkgdGhlcGxhY2Ugd2hlcmV3aGVyZWFzIHRoZT4gPGEgaHJlZj0iIj48YSBocmVmPSJ0aGVtc2VsdmVzLGFsdGhvdWdoIGhldGhhdCBjYW4gYmV0cmFkaXRpb25hbHJvbGUgb2YgdGhlYXMgYSByZXN1bHRyZW1vdmVDaGlsZGRlc2lnbmVkIGJ5d2VzdCBvZiB0aGVTb21lIHBlb3BsZXByb2R1Y3Rpb24sc2lkZSBvZiB0aGVuZXdzbGV0dGVyc3VzZWQgYnkgdGhlZG93biB0byB0aGVhY2NlcHRlZCBieWxpdmUgaW4gdGhlYXR0ZW1wdHMgdG9vdXRzaWRlIHRoZWZyZXF1ZW5jaWVzSG93ZXZlciwgaW5wcm9ncmFtbWVyc2F0IGxlYXN0IGluYXBwcm94aW1hdGVhbHRob3VnaCBpdHdhcyBwYXJ0IG9mYW5kIHZhcmlvdXNHb3Zlcm5vciBvZnRoZSBhcnRpY2xldHVybmVkIGludG8+PGEgaHJlZj0iL3RoZSBlY29ub215aXMgdGhlIG1vc3Rtb3N0IHdpZGVseXdvdWxkIGxhdGVyYW5kIHBlcmhhcHNyaXNlIHRvIHRoZW9jY3VycyB3aGVudW5kZXIgd2hpY2hjb25kaXRpb25zLnRoZSB3ZXN0ZXJudGhlb3J5IHRoYXRpcyBwcm9kdWNlZHRoZSBjaXR5IG9maW4gd2hpY2ggaGVzZWVuIGluIHRoZXRoZSBjZW50cmFsYnVpbGRpbmcgb2ZtYW55IG9mIGhpc2FyZWEgb2YgdGhlaXMgdGhlIG9ubHltb3N0IG9mIHRoZW1hbnkgb2YgdGhldGhlIFdlc3Rlcm5UaGVyZSBpcyBub2V4dGVuZGVkIHRvU3RhdGlzdGljYWxjb2xzcGFuPTIgfHNob3J0IHN0b3J5cG9zc2libGUgdG90b3BvbG9naWNhbGNyaXRpY2FsIG9mcmVwb3J0ZWQgdG9hIENocmlzdGlhbmRlY2lzaW9uIHRvaXMgZXF1YWwgdG9wcm9ibGVtcyBvZlRoaXMgY2FuIGJlbWVyY2hhbmRpc2Vmb3IgbW9zdCBvZm5vIGV2aWRlbmNlZWRpdGlvbnMgb2ZlbGVtZW50cyBpbiZxdW90Oy4gVGhlY29tL2ltYWdlcy93aGljaCBtYWtlc3RoZSBwcm9jZXNzcmVtYWlucyB0aGVsaXRlcmF0dXJlLGlzIGEgbWVtYmVydGhlIHBvcHVsYXJ0aGUgYW5jaWVudHByb2JsZW1zIGludGltZSBvZiB0aGVkZWZlYXRlZCBieWJvZHkgb2YgdGhlYSBmZXcgeWVhcnNtdWNoIG9mIHRoZXRoZSB3b3JrIG9mQ2FsaWZvcm5pYSxzZXJ2ZWQgYXMgYWdvdmVybm1lbnQuY29uY2VwdHMgb2Ztb3ZlbWVudCBpbgkJPGRpdiBpZD0iaXQiIHZhbHVlPSJsYW5ndWFnZSBvZmFzIHRoZXkgYXJlcHJvZHVjZWQgaW5pcyB0aGF0IHRoZWV4cGxhaW4gdGhlZGl2PjwvZGl2PgpIb3dldmVyIHRoZWxlYWQgdG8gdGhlCTxhIGhyZWY9Ii93YXMgZ3JhbnRlZHBlb3BsZSBoYXZlY29udGludWFsbHl3YXMgc2VlbiBhc2FuZCByZWxhdGVkdGhlIHJvbGUgb2Zwcm9wb3NlZCBieW9mIHRoZSBiZXN0ZWFjaCBvdGhlci5Db25zdGFudGluZXBlb3BsZSBmcm9tZGlhbGVjdHMgb2Z0byByZXZpc2lvbndhcyByZW5hbWVkYSBzb3VyY2Ugb2Z0aGUgaW5pdGlhbGxhdW5jaGVkIGlucHJvdmlkZSB0aGV0byB0aGUgd2VzdHdoZXJlIHRoZXJlYW5kIHNpbWlsYXJiZXR3ZWVuIHR3b2lzIGFsc28gdGhlRW5nbGlzaCBhbmRjb25kaXRpb25zLHRoYXQgaXQgd2FzZW50aXRsZWQgdG90aGVtc2VsdmVzLnF1YW50aXR5IG9mcmFuc3BhcmVuY3l0aGUgc2FtZSBhc3RvIGpvaW4gdGhlY291bnRyeSBhbmR0aGlzIGlzIHRoZVRoaXMgbGVkIHRvYSBzdGF0ZW1lbnRjb250cmFzdCB0b2xhc3RJbmRleE9mdGhyb3VnaCBoaXNpcyBkZXNpZ25lZHRoZSB0ZXJtIGlzaXMgcHJvdmlkZWRwcm90ZWN0IHRoZW5nPC9hPjwvbGk+VGhlIGN1cnJlbnR0aGUgc2l0ZSBvZnN1YnN0YW50aWFsZXhwZXJpZW5jZSxpbiB0aGUgV2VzdHRoZXkgc2hvdWxkc2xvdmVuxI1pbmFjb21lbnRhcmlvc3VuaXZlcnNpZGFkY29uZGljaW9uZXNhY3RpdmlkYWRlc2V4cGVyaWVuY2lhdGVjbm9sb2fDrWFwcm9kdWNjacOzbnB1bnR1YWNpw7NuYXBsaWNhY2nDs25jb250cmFzZcOxYWNhdGVnb3LDrWFzcmVnaXN0cmFyc2Vwcm9mZXNpb25hbHRyYXRhbWllbnRvcmVnw61zdHJhdGVzZWNyZXRhcsOtYXByaW5jaXBhbGVzcHJvdGVjY2nDs25pbXBvcnRhbnRlc2ltcG9ydGFuY2lhcG9zaWJpbGlkYWRpbnRlcmVzYW50ZWNyZWNpbWllbnRvbmVjZXNpZGFkZXNzdXNjcmliaXJzZWFzb2NpYWNpw7NuZGlzcG9uaWJsZXNldmFsdWFjacOzbmVzdHVkaWFudGVzcmVzcG9uc2FibGVyZXNvbHVjacOzbmd1YWRhbGFqYXJhcmVnaXN0cmFkb3NvcG9ydHVuaWRhZGNvbWVyY2lhbGVzZm90b2dyYWbDrWFhdXRvcmlkYWRlc2luZ2VuaWVyw61hdGVsZXZpc2nDs25jb21wZXRlbmNpYW9wZXJhY2lvbmVzZXN0YWJsZWNpZG9zaW1wbGVtZW50ZWFjdHVhbG1lbnRlbmF2ZWdhY2nDs25jb25mb3JtaWRhZGxpbmUtaGVpZ2h0OmZvbnQtZmFtaWx5OiIgOiAiaHR0cDovL2FwcGxpY2F0aW9uc2xpbmsiIGhyZWY9InNwZWNpZmljYWxseS8vPCFbQ0RBVEFbCk9yZ2FuaXphdGlvbmRpc3RyaWJ1dGlvbjBweDsgaGVpZ2h0OnJlbGF0aW9uc2hpcGRldmljZS13aWR0aDxkaXYgY2xhc3M9IjxsYWJlbCBmb3I9InJlZ2lzdHJhdGlvbjwvbm9zY3JpcHQ+Ci9pbmRleC5odG1sIndpbmRvdy5vcGVuKCAhaW1wb3J0YW50O2FwcGxpY2F0aW9uL2luZGVwZW5kZW5jZS8vd3d3Lmdvb2dsZW9yZ2FuaXphdGlvbmF1dG9jb21wbGV0ZXJlcXVpcmVtZW50c2NvbnNlcnZhdGl2ZTxmb3JtIG5hbWU9ImludGVsbGVjdHVhbG1hcmdpbi1sZWZ0OjE4dGggY2VudHVyeWFuIGltcG9ydGFudGluc3RpdHV0aW9uc2FiYnJldmlhdGlvbjxpbWcgY2xhc3M9Im9yZ2FuaXNhdGlvbmNpdmlsaXphdGlvbjE5dGggY2VudHVyeWFyY2hpdGVjdHVyZWluY29ycG9yYXRlZDIwdGggY2VudHVyeS1jb250YWluZXIiPm1vc3Qgbm90YWJseS8+PC9hPjwvZGl2Pm5vdGlmaWNhdGlvbid1bmRlZmluZWQnKUZ1cnRoZXJtb3JlLGJlbGlldmUgdGhhdGlubmVySFRNTCA9IHByaW9yIHRvIHRoZWRyYW1hdGljYWxseXJlZmVycmluZyB0b25lZ290aWF0aW9uc2hlYWRxdWFydGVyc1NvdXRoIEFmcmljYXVuc3VjY2Vzc2Z1bFBlbm5zeWx2YW5pYUFzIGEgcmVzdWx0LDxodG1sIGxhbmc9IiZsdDsvc3VwJmd0O2RlYWxpbmcgd2l0aHBoaWxhZGVscGhpYWhpc3RvcmljYWxseSk7PC9zY3JpcHQ+CnBhZGRpbmctdG9wOmV4cGVyaW1lbnRhbGdldEF0dHJpYnV0ZWluc3RydWN0aW9uc3RlY2hub2xvZ2llc3BhcnQgb2YgdGhlID1mdW5jdGlvbigpe3N1YnNjcmlwdGlvbmwuZHRkIj4NCjxodGdlb2dyYXBoaWNhbENvbnN0aXR1dGlvbicsIGZ1bmN0aW9uKHN1cHBvcnRlZCBieWFncmljdWx0dXJhbGNvbnN0cnVjdGlvbnB1YmxpY2F0aW9uc2ZvbnQtc2l6ZTogMWEgdmFyaWV0eSBvZjxkaXYgc3R5bGU9IkVuY3ljbG9wZWRpYWlmcmFtZSBzcmM9ImRlbW9uc3RyYXRlZGFjY29tcGxpc2hlZHVuaXZlcnNpdGllc0RlbW9ncmFwaGljcyk7PC9zY3JpcHQ+PGRlZGljYXRlZCB0b2tub3dsZWRnZSBvZnNhdGlzZmFjdGlvbnBhcnRpY3VsYXJseTwvZGl2PjwvZGl2PkVuZ2xpc2ggKFVTKWFwcGVuZENoaWxkKHRyYW5zbWlzc2lvbnMuIEhvd2V2ZXIsIGludGVsbGlnZW5jZSIgdGFiaW5kZXg9ImZsb2F0OnJpZ2h0O0NvbW1vbndlYWx0aHJhbmdpbmcgZnJvbWluIHdoaWNoIHRoZWF0IGxlYXN0IG9uZXJlcHJvZHVjdGlvbmVuY3ljbG9wZWRpYTtmb250LXNpemU6MWp1cmlzZGljdGlvbmF0IHRoYXQgdGltZSI+PGEgY2xhc3M9IkluIGFkZGl0aW9uLGRlc2NyaXB0aW9uK2NvbnZlcnNhdGlvbmNvbnRhY3Qgd2l0aGlzIGdlbmVyYWxseXIiIGNvbnRlbnQ9InJlcHJlc2VudGluZyZsdDttYXRoJmd0O3ByZXNlbnRhdGlvbm9jY2FzaW9uYWxseTxpbWcgd2lkdGg9Im5hdmlnYXRpb24iPmNvbXBlbnNhdGlvbmNoYW1waW9uc2hpcG1lZGlhPSJhbGwiIHZpb2xhdGlvbiBvZnJlZmVyZW5jZSB0b3JldHVybiB0cnVlO1N0cmljdC8vRU4iIHRyYW5zYWN0aW9uc2ludGVydmVudGlvbnZlcmlmaWNhdGlvbkluZm9ybWF0aW9uIGRpZmZpY3VsdGllc0NoYW1waW9uc2hpcGNhcGFiaWxpdGllczwhW2VuZGlmXS0tPn0KPC9zY3JpcHQ+CkNocmlzdGlhbml0eWZvciBleGFtcGxlLFByb2Zlc3Npb25hbHJlc3RyaWN0aW9uc3N1Z2dlc3QgdGhhdHdhcyByZWxlYXNlZChzdWNoIGFzIHRoZXJlbW92ZUNsYXNzKHVuZW1wbG95bWVudHRoZSBBbWVyaWNhbnN0cnVjdHVyZSBvZi9pbmRleC5odG1sIHB1Ymxpc2hlZCBpbnNwYW4gY2xhc3M9IiI+PGEgaHJlZj0iL2ludHJvZHVjdGlvbmJlbG9uZ2luZyB0b2NsYWltZWQgdGhhdGNvbnNlcXVlbmNlczxtZXRhIG5hbWU9Ikd1aWRlIHRvIHRoZW92ZXJ3aGVsbWluZ2FnYWluc3QgdGhlIGNvbmNlbnRyYXRlZCwKLm5vbnRvdWNoIG9ic2VydmF0aW9uczwvYT4KPC9kaXY+CmYgKGRvY3VtZW50LmJvcmRlcjogMXB4IHtmb250LXNpemU6MXRyZWF0bWVudCBvZjAiIGhlaWdodD0iMW1vZGlmaWNhdGlvbkluZGVwZW5kZW5jZWRpdmlkZWQgaW50b2dyZWF0ZXIgdGhhbmFjaGlldmVtZW50c2VzdGFibGlzaGluZ0phdmFTY3JpcHQiIG5ldmVydGhlbGVzc3NpZ25pZmljYW5jZUJyb2FkY2FzdGluZz4mbmJzcDs8L3RkPmNvbnRhaW5lciI+CnN1Y2ggYXMgdGhlIGluZmx1ZW5jZSBvZmEgcGFydGljdWxhcnNyYz0naHR0cDovL25hdmlnYXRpb24iIGhhbGYgb2YgdGhlIHN1YnN0YW50aWFsICZuYnNwOzwvZGl2PmFkdmFudGFnZSBvZmRpc2NvdmVyeSBvZmZ1bmRhbWVudGFsIG1ldHJvcG9saXRhbnRoZSBvcHBvc2l0ZSIgeG1sOmxhbmc9ImRlbGliZXJhdGVseWFsaWduPWNlbnRlcmV2b2x1dGlvbiBvZnByZXNlcnZhdGlvbmltcHJvdmVtZW50c2JlZ2lubmluZyBpbkplc3VzIENocmlzdFB1YmxpY2F0aW9uc2Rpc2FncmVlbWVudHRleHQtYWxpZ246ciwgZnVuY3Rpb24oKXNpbWlsYXJpdGllc2JvZHk+PC9odG1sPmlzIGN1cnJlbnRseWFscGhhYmV0aWNhbGlzIHNvbWV0aW1lc3R5cGU9ImltYWdlL21hbnkgb2YgdGhlIGZsb3c6aGlkZGVuO2F2YWlsYWJsZSBpbmRlc2NyaWJlIHRoZWV4aXN0ZW5jZSBvZmFsbCBvdmVyIHRoZXRoZSBJbnRlcm5ldAk8dWwgY2xhc3M9Imluc3RhbGxhdGlvbm5laWdoYm9yaG9vZGFybWVkIGZvcmNlc3JlZHVjaW5nIHRoZWNvbnRpbnVlcyB0b05vbmV0aGVsZXNzLHRlbXBlcmF0dXJlcwoJCTxhIGhyZWY9ImNsb3NlIHRvIHRoZWV4YW1wbGVzIG9mIGlzIGFib3V0IHRoZShzZWUgYmVsb3cpLiIgaWQ9InNlYXJjaHByb2Zlc3Npb25hbGlzIGF2YWlsYWJsZXRoZSBvZmZpY2lhbAkJPC9zY3JpcHQ+CgoJCTxkaXYgaWQ9ImFjY2VsZXJhdGlvbnRocm91Z2ggdGhlIEhhbGwgb2YgRmFtZWRlc2NyaXB0aW9uc3RyYW5zbGF0aW9uc2ludGVyZmVyZW5jZSB0eXBlPSd0ZXh0L3JlY2VudCB5ZWFyc2luIHRoZSB3b3JsZHZlcnkgcG9wdWxhcntiYWNrZ3JvdW5kOnRyYWRpdGlvbmFsIHNvbWUgb2YgdGhlIGNvbm5lY3RlZCB0b2V4cGxvaXRhdGlvbmVtZXJnZW5jZSBvZmNvbnN0aXR1dGlvbkEgSGlzdG9yeSBvZnNpZ25pZmljYW50IG1hbnVmYWN0dXJlZGV4cGVjdGF0aW9ucz48bm9zY3JpcHQ+PGNhbiBiZSBmb3VuZGJlY2F1c2UgdGhlIGhhcyBub3QgYmVlbm5laWdoYm91cmluZ3dpdGhvdXQgdGhlIGFkZGVkIHRvIHRoZQk8bGkgY2xhc3M9Imluc3RydW1lbnRhbFNvdmlldCBVbmlvbmFja25vd2xlZGdlZHdoaWNoIGNhbiBiZW5hbWUgZm9yIHRoZWF0dGVudGlvbiB0b2F0dGVtcHRzIHRvIGRldmVsb3BtZW50c0luIGZhY3QsIHRoZTxsaSBjbGFzcz0iYWltcGxpY2F0aW9uc3N1aXRhYmxlIGZvcm11Y2ggb2YgdGhlIGNvbG9uaXphdGlvbnByZXNpZGVudGlhbGNhbmNlbEJ1YmJsZSBJbmZvcm1hdGlvbm1vc3Qgb2YgdGhlIGlzIGRlc2NyaWJlZHJlc3Qgb2YgdGhlIG1vcmUgb3IgbGVzc2luIFNlcHRlbWJlckludGVsbGlnZW5jZXNyYz0iaHR0cDovL3B4OyBoZWlnaHQ6IGF2YWlsYWJsZSB0b21hbnVmYWN0dXJlcmh1bWFuIHJpZ2h0c2xpbmsgaHJlZj0iL2F2YWlsYWJpbGl0eXByb3BvcnRpb25hbG91dHNpZGUgdGhlIGFzdHJvbm9taWNhbGh1bWFuIGJlaW5nc25hbWUgb2YgdGhlIGFyZSBmb3VuZCBpbmFyZSBiYXNlZCBvbnNtYWxsZXIgdGhhbmEgcGVyc29uIHdob2V4cGFuc2lvbiBvZmFyZ3VpbmcgdGhhdG5vdyBrbm93biBhc0luIHRoZSBlYXJseWludGVybWVkaWF0ZWRlcml2ZWQgZnJvbVNjYW5kaW5hdmlhbjwvYT48L2Rpdj4NCmNvbnNpZGVyIHRoZWFuIGVzdGltYXRlZHRoZSBOYXRpb25hbDxkaXYgaWQ9InBhZ3Jlc3VsdGluZyBpbmNvbW1pc3Npb25lZGFuYWxvZ291cyB0b2FyZSByZXF1aXJlZC91bD4KPC9kaXY+CndhcyBiYXNlZCBvbmFuZCBiZWNhbWUgYSZuYnNwOyZuYnNwO3QiIHZhbHVlPSIiIHdhcyBjYXB0dXJlZG5vIG1vcmUgdGhhbnJlc3BlY3RpdmVseWNvbnRpbnVlIHRvID4NCjxoZWFkPg0KPHdlcmUgY3JlYXRlZG1vcmUgZ2VuZXJhbGluZm9ybWF0aW9uIHVzZWQgZm9yIHRoZWluZGVwZW5kZW50IHRoZSBJbXBlcmlhbGNvbXBvbmVudCBvZnRvIHRoZSBub3J0aGluY2x1ZGUgdGhlIENvbnN0cnVjdGlvbnNpZGUgb2YgdGhlIHdvdWxkIG5vdCBiZWZvciBpbnN0YW5jZWludmVudGlvbiBvZm1vcmUgY29tcGxleGNvbGxlY3RpdmVseWJhY2tncm91bmQ6IHRleHQtYWxpZ246IGl0cyBvcmlnaW5hbGludG8gYWNjb3VudHRoaXMgcHJvY2Vzc2FuIGV4dGVuc2l2ZWhvd2V2ZXIsIHRoZXRoZXkgYXJlIG5vdHJlamVjdGVkIHRoZWNyaXRpY2lzbSBvZmR1cmluZyB3aGljaHByb2JhYmx5IHRoZXRoaXMgYXJ0aWNsZShmdW5jdGlvbigpe0l0IHNob3VsZCBiZWFuIGFncmVlbWVudGFjY2lkZW50YWxseWRpZmZlcnMgZnJvbUFyY2hpdGVjdHVyZWJldHRlciBrbm93bmFycmFuZ2VtZW50c2luZmx1ZW5jZSBvbmF0dGVuZGVkIHRoZWlkZW50aWNhbCB0b3NvdXRoIG9mIHRoZXBhc3MgdGhyb3VnaHhtbCIgdGl0bGU9IndlaWdodDpib2xkO2NyZWF0aW5nIHRoZWRpc3BsYXk6bm9uZXJlcGxhY2VkIHRoZTxpbWcgc3JjPSIvaWh0dHBzOi8vd3d3LldvcmxkIFdhciBJSXRlc3RpbW9uaWFsc2ZvdW5kIGluIHRoZXJlcXVpcmVkIHRvIGFuZCB0aGF0IHRoZWJldHdlZW4gdGhlIHdhcyBkZXNpZ25lZGNvbnNpc3RzIG9mIGNvbnNpZGVyYWJseXB1Ymxpc2hlZCBieXRoZSBsYW5ndWFnZUNvbnNlcnZhdGlvbmNvbnNpc3RlZCBvZnJlZmVyIHRvIHRoZWJhY2sgdG8gdGhlIGNzcyIgbWVkaWE9IlBlb3BsZSBmcm9tIGF2YWlsYWJsZSBvbnByb3ZlZCB0byBiZXN1Z2dlc3Rpb25zIndhcyBrbm93biBhc3ZhcmlldGllcyBvZmxpa2VseSB0byBiZWNvbXByaXNlZCBvZnN1cHBvcnQgdGhlIGhhbmRzIG9mIHRoZWNvdXBsZWQgd2l0aGNvbm5lY3QgYW5kIGJvcmRlcjpub25lO3BlcmZvcm1hbmNlc2JlZm9yZSBiZWluZ2xhdGVyIGJlY2FtZWNhbGN1bGF0aW9uc29mdGVuIGNhbGxlZHJlc2lkZW50cyBvZm1lYW5pbmcgdGhhdD48bGkgY2xhc3M9ImV2aWRlbmNlIGZvcmV4cGxhbmF0aW9uc2Vudmlyb25tZW50cyI+PC9hPjwvZGl2PndoaWNoIGFsbG93c0ludHJvZHVjdGlvbmRldmVsb3BlZCBieWEgd2lkZSByYW5nZW9uIGJlaGFsZiBvZnZhbGlnbj0idG9wInByaW5jaXBsZSBvZmF0IHRoZSB0aW1lLDwvbm9zY3JpcHQ+DXNhaWQgdG8gaGF2ZWluIHRoZSBmaXJzdHdoaWxlIG90aGVyc2h5cG90aGV0aWNhbHBoaWxvc29waGVyc3Bvd2VyIG9mIHRoZWNvbnRhaW5lZCBpbnBlcmZvcm1lZCBieWluYWJpbGl0eSB0b3dlcmUgd3JpdHRlbnNwYW4gc3R5bGU9ImlucHV0IG5hbWU9InRoZSBxdWVzdGlvbmludGVuZGVkIGZvcnJlamVjdGlvbiBvZmltcGxpZXMgdGhhdGludmVudGVkIHRoZXRoZSBzdGFuZGFyZHdhcyBwcm9iYWJseWxpbmsgYmV0d2VlbnByb2Zlc3NvciBvZmludGVyYWN0aW9uc2NoYW5naW5nIHRoZUluZGlhbiBPY2VhbiBjbGFzcz0ibGFzdHdvcmtpbmcgd2l0aCdodHRwOi8vd3d3LnllYXJzIGJlZm9yZVRoaXMgd2FzIHRoZXJlY3JlYXRpb25hbGVudGVyaW5nIHRoZW1lYXN1cmVtZW50c2FuIGV4dHJlbWVseXZhbHVlIG9mIHRoZXN0YXJ0IG9mIHRoZQo8L3NjcmlwdD4KCmFuIGVmZm9ydCB0b2luY3JlYXNlIHRoZXRvIHRoZSBzb3V0aHNwYWNpbmc9IjAiPnN1ZmZpY2llbnRseXRoZSBFdXJvcGVhbmNvbnZlcnRlZCB0b2NsZWFyVGltZW91dGRpZCBub3QgaGF2ZWNvbnNlcXVlbnRseWZvciB0aGUgbmV4dGV4dGVuc2lvbiBvZmVjb25vbWljIGFuZGFsdGhvdWdoIHRoZWFyZSBwcm9kdWNlZGFuZCB3aXRoIHRoZWluc3VmZmljaWVudGdpdmVuIGJ5IHRoZXN0YXRpbmcgdGhhdGV4cGVuZGl0dXJlczwvc3Bhbj48L2E+CnRob3VnaHQgdGhhdG9uIHRoZSBiYXNpc2NlbGxwYWRkaW5nPWltYWdlIG9mIHRoZXJldHVybmluZyB0b2luZm9ybWF0aW9uLHNlcGFyYXRlZCBieWFzc2Fzc2luYXRlZHMiIGNvbnRlbnQ9ImF1dGhvcml0eSBvZm5vcnRod2VzdGVybjwvZGl2Pgo8ZGl2ICI+PC9kaXY+DQogIGNvbnN1bHRhdGlvbmNvbW11bml0eSBvZnRoZSBuYXRpb25hbGl0IHNob3VsZCBiZXBhcnRpY2lwYW50cyBhbGlnbj0ibGVmdHRoZSBncmVhdGVzdHNlbGVjdGlvbiBvZnN1cGVybmF0dXJhbGRlcGVuZGVudCBvbmlzIG1lbnRpb25lZGFsbG93aW5nIHRoZXdhcyBpbnZlbnRlZGFjY29tcGFueWluZ2hpcyBwZXJzb25hbGF2YWlsYWJsZSBhdHN0dWR5IG9mIHRoZW9uIHRoZSBvdGhlcmV4ZWN1dGlvbiBvZkh1bWFuIFJpZ2h0c3Rlcm1zIG9mIHRoZWFzc29jaWF0aW9uc3Jlc2VhcmNoIGFuZHN1Y2NlZWRlZCBieWRlZmVhdGVkIHRoZWFuZCBmcm9tIHRoZWJ1dCB0aGV5IGFyZWNvbW1hbmRlciBvZnN0YXRlIG9mIHRoZXllYXJzIG9mIGFnZXRoZSBzdHVkeSBvZjx1bCBjbGFzcz0ic3BsYWNlIGluIHRoZXdoZXJlIGhlIHdhczxsaSBjbGFzcz0iZnRoZXJlIGFyZSBub3doaWNoIGJlY2FtZWhlIHB1Ymxpc2hlZGV4cHJlc3NlZCBpbnRvIHdoaWNoIHRoZWNvbW1pc3Npb25lcmZvbnQtd2VpZ2h0OnRlcnJpdG9yeSBvZmV4dGVuc2lvbnMiPlJvbWFuIEVtcGlyZWVxdWFsIHRvIHRoZUluIGNvbnRyYXN0LGhvd2V2ZXIsIGFuZGlzIHR5cGljYWxseWFuZCBoaXMgd2lmZShhbHNvIGNhbGxlZD48dWwgY2xhc3M9ImVmZmVjdGl2ZWx5IGV2b2x2ZWQgaW50b3NlZW0gdG8gaGF2ZXdoaWNoIGlzIHRoZXRoZXJlIHdhcyBub2FuIGV4Y2VsbGVudGFsbCBvZiB0aGVzZWRlc2NyaWJlZCBieUluIHByYWN0aWNlLGJyb2FkY2FzdGluZ2NoYXJnZWQgd2l0aHJlZmxlY3RlZCBpbnN1YmplY3RlZCB0b21pbGl0YXJ5IGFuZHRvIHRoZSBwb2ludGVjb25vbWljYWxseXNldFRhcmdldGluZ2FyZSBhY3R1YWxseXZpY3Rvcnkgb3ZlcigpOzwvc2NyaXB0PmNvbnRpbnVvdXNseXJlcXVpcmVkIGZvcmV2b2x1dGlvbmFyeWFuIGVmZmVjdGl2ZW5vcnRoIG9mIHRoZSwgd2hpY2ggd2FzIGZyb250IG9mIHRoZW9yIG90aGVyd2lzZXNvbWUgZm9ybSBvZmhhZCBub3QgYmVlbmdlbmVyYXRlZCBieWluZm9ybWF0aW9uLnBlcm1pdHRlZCB0b2luY2x1ZGVzIHRoZWRldmVsb3BtZW50LGVudGVyZWQgaW50b3RoZSBwcmV2aW91c2NvbnNpc3RlbnRseWFyZSBrbm93biBhc3RoZSBmaWVsZCBvZnRoaXMgdHlwZSBvZmdpdmVuIHRvIHRoZXRoZSB0aXRsZSBvZmNvbnRhaW5zIHRoZWluc3RhbmNlcyBvZmluIHRoZSBub3J0aGR1ZSB0byB0aGVpcmFyZSBkZXNpZ25lZGNvcnBvcmF0aW9uc3dhcyB0aGF0IHRoZW9uZSBvZiB0aGVzZW1vcmUgcG9wdWxhcnN1Y2NlZWRlZCBpbnN1cHBvcnQgZnJvbWluIGRpZmZlcmVudGRvbWluYXRlZCBieWRlc2lnbmVkIGZvcm93bmVyc2hpcCBvZmFuZCBwb3NzaWJseXN0YW5kYXJkaXplZHJlc3BvbnNlVGV4dHdhcyBpbnRlbmRlZHJlY2VpdmVkIHRoZWFzc3VtZWQgdGhhdGFyZWFzIG9mIHRoZXByaW1hcmlseSBpbnRoZSBiYXNpcyBvZmluIHRoZSBzZW5zZWFjY291bnRzIGZvcmRlc3Ryb3llZCBieWF0IGxlYXN0IHR3b3dhcyBkZWNsYXJlZGNvdWxkIG5vdCBiZVNlY3JldGFyeSBvZmFwcGVhciB0byBiZW1hcmdpbi10b3A6MS9eXHMrfFxzKyQvZ2Upe3Rocm93IGV9O3RoZSBzdGFydCBvZnR3byBzZXBhcmF0ZWxhbmd1YWdlIGFuZHdobyBoYWQgYmVlbm9wZXJhdGlvbiBvZmRlYXRoIG9mIHRoZXJlYWwgbnVtYmVycwk8bGluayByZWw9InByb3ZpZGVkIHRoZXRoZSBzdG9yeSBvZmNvbXBldGl0aW9uc2VuZ2xpc2ggKFVLKWVuZ2xpc2ggKFVTKdCc0L7QvdCz0L7Qu9Ch0YDQv9GB0LrQuNGB0YDQv9GB0LrQuNGB0YDQv9GB0LrQvtmE2LnYsdio2YrYqeato+mrlOS4reaWh+eugOS9k+S4reaWh+e5geS9k+S4reaWh+aciemZkOWFrOWPuOS6uuawkeaUv+W6nOmYv+mHjOW3tOW3tOekvuS8muS4u+S5ieaTjeS9nOezu+e7n+aUv+etluazleinhGluZm9ybWFjacOzbmhlcnJhbWllbnRhc2VsZWN0csOzbmljb2Rlc2NyaXBjacOzbmNsYXNpZmljYWRvc2Nvbm9jaW1pZW50b3B1YmxpY2FjacOzbnJlbGFjaW9uYWRhc2luZm9ybcOhdGljYXJlbGFjaW9uYWRvc2RlcGFydGFtZW50b3RyYWJhamFkb3Jlc2RpcmVjdGFtZW50ZWF5dW50YW1pZW50b21lcmNhZG9MaWJyZWNvbnTDoWN0ZW5vc2hhYml0YWNpb25lc2N1bXBsaW1pZW50b3Jlc3RhdXJhbnRlc2Rpc3Bvc2ljacOzbmNvbnNlY3VlbmNpYWVsZWN0csOzbmljYWFwbGljYWNpb25lc2Rlc2NvbmVjdGFkb2luc3RhbGFjacOzbnJlYWxpemFjacOzbnV0aWxpemFjacOzbmVuY2ljbG9wZWRpYWVuZmVybWVkYWRlc2luc3RydW1lbnRvc2V4cGVyaWVuY2lhc2luc3RpdHVjacOzbnBhcnRpY3VsYXJlc3N1YmNhdGVnb3JpYdGC0L7Qu9GM0LrQvtCg0L7RgdGB0LjQuNGA0LDQsdC+0YLRi9Cx0L7Qu9GM0YjQtdC/0YDQvtGB0YLQvtC80L7QttC10YLQtdC00YDRg9Cz0LjRhdGB0LvRg9GH0LDQtdGB0LXQudGH0LDRgdCy0YHQtdCz0LTQsNCg0L7RgdGB0LjRj9Cc0L7RgdC60LLQtdC00YDRg9Cz0LjQtdCz0L7RgNC+0LTQsNCy0L7Qv9GA0L7RgdC00LDQvdC90YvRhdC00L7Qu9C20L3Ri9C40LzQtdC90L3QvtCc0L7RgdC60LLRi9GA0YPQsdC70LXQudCc0L7RgdC60LLQsNGB0YLRgNCw0L3Ri9C90LjRh9C10LPQvtGA0LDQsdC+0YLQtdC00L7Qu9C20LXQvdGD0YHQu9GD0LPQuNGC0LXQv9C10YDRjNCe0LTQvdCw0LrQvtC/0L7RgtC+0LzRg9GA0LDQsdC+0YLRg9Cw0L/RgNC10LvRj9Cy0L7QvtCx0YnQtdC+0LTQvdC+0LPQvtGB0LLQvtC10LPQvtGB0YLQsNGC0YzQuNC00YDRg9Cz0L7QudGE0L7RgNGD0LzQtdGF0L7RgNC+0YjQvtC/0YDQvtGC0LjQstGB0YHRi9C70LrQsNC60LDQttC00YvQudCy0LvQsNGB0YLQuNCz0YDRg9C/0L/Ri9Cy0LzQtdGB0YLQtdGA0LDQsdC+0YLQsNGB0LrQsNC30LDQu9C/0LXRgNCy0YvQudC00LXQu9Cw0YLRjNC00LXQvdGM0LPQuNC/0LXRgNC40L7QtNCx0LjQt9C90LXRgdC+0YHQvdC+0LLQtdC80L7QvNC10L3RgtC60YPQv9C40YLRjNC00L7Qu9C20L3QsNGA0LDQvNC60LDRhdC90LDRh9Cw0LvQvtCg0LDQsdC+0YLQsNCi0L7Qu9GM0LrQvtGB0L7QstGB0LXQvNCy0YLQvtGA0L7QudC90LDRh9Cw0LvQsNGB0L/QuNGB0L7QutGB0LvRg9C20LHRi9GB0LjRgdGC0LXQvNC/0LXRh9Cw0YLQuNC90L7QstC+0LPQvtC/0L7QvNC+0YnQuNGB0LDQudGC0L7QstC/0L7Rh9C10LzRg9C/0L7QvNC+0YnRjNC00L7Qu9C20L3QvtGB0YHRi9C70LrQuNCx0YvRgdGC0YDQvtC00LDQvdC90YvQtdC80L3QvtCz0LjQtdC/0YDQvtC10LrRgtCh0LXQudGH0LDRgdC80L7QtNC10LvQuNGC0LDQutC+0LPQvtC+0L3Qu9Cw0LnQvdCz0L7RgNC+0LTQtdCy0LXRgNGB0LjRj9GB0YLRgNCw0L3QtdGE0LjQu9GM0LzRi9GD0YDQvtCy0L3Rj9GA0LDQt9C90YvRhdC40YHQutCw0YLRjNC90LXQtNC10LvRjtGP0L3QstCw0YDRj9C80LXQvdGM0YjQtdC80L3QvtCz0LjRhdC00LDQvdC90L7QudC30L3QsNGH0LjRgtC90LXQu9GM0LfRj9GE0L7RgNGD0LzQsNCi0LXQv9C10YDRjNC80LXRgdGP0YbQsNC30LDRidC40YLRi9Cb0YPRh9GI0LjQteCkqOCkueClgOCkguCkleCksOCkqOClh+CkheCkquCkqOClh+CkleCkv+Ckr+CkvuCkleCksOClh+CkguCkheCkqOCljeCkr+CkleCljeCkr+CkvuCkl+CkvuCkh+CkoeCkrOCkvuCksOClh+CkleCkv+CkuOClgOCkpuCkv+Ckr+CkvuCkquCkueCksuClh+CkuOCkv+CkguCkueCkreCkvuCksOCkpOCkheCkquCkqOClgOCkteCkvuCksuClh+CkuOClh+CkteCkvuCkleCksOCkpOClh+CkruClh+CksOClh+CkueCli+CkqOClh+CkuOCkleCkpOClh+CkrOCkueClgeCkpOCkuOCkvuCkh+Ckn+CkueCli+Ckl+CkvuCknOCkvuCkqOClh+CkruCkv+CkqOCkn+CkleCksOCkpOCkvuCkleCksOCkqOCkvuCkieCkqOCkleClh+Ckr+CkueCkvuCkgeCkuOCkrOCkuOClh+CkreCkvuCkt+CkvuCkhuCkquCkleClh+CksuCkv+Ckr+Clh+CktuClgeCksOClguCkh+CkuOCkleClh+CkmOCkguCkn+Clh+CkruClh+CksOClgOCkuOCkleCkpOCkvuCkruClh+CksOCkvuCksuClh+CkleCksOCkheCkp+Ckv+CkleCkheCkquCkqOCkvuCkuOCkruCkvuCknOCkruClgeCkneClh+CkleCkvuCksOCko+CkueCli+CkpOCkvuCkleCkoeCkvOClgOCkr+CkueCkvuCkguCkueCli+Ckn+CksuCktuCkrOCljeCkpuCksuCkv+Ckr+CkvuCknOClgOCkteCkqOCknOCkvuCkpOCkvuCkleCliOCkuOClh+CkhuCkquCkleCkvuCkteCkvuCksuClgOCkpuClh+CkqOClh+CkquClguCksOClgOCkquCkvuCkqOClgOCkieCkuOCkleClh+CkueCli+Ckl+ClgOCkrOCliOCkoOCkleCkhuCkquCkleClgOCkteCksOCljeCkt+Ckl+CkvuCkguCkteCkhuCkquCkleCli+CknOCkv+CksuCkvuCknOCkvuCkqOCkvuCkuOCkueCkruCkpOCkueCkruClh+CkguCkieCkqOCkleClgOCkr+CkvuCkueClguCkpuCksOCljeCknOCkuOClguCkmuClgOCkquCkuOCkguCkpuCkuOCkteCkvuCksuCkueCli+CkqOCkvuCkueCli+CkpOClgOCknOCliOCkuOClh+CkteCkvuCkquCkuOCknOCkqOCkpOCkvuCkqOClh+CkpOCkvuCknOCkvuCksOClgOCkmOCkvuCkr+CksuCknOCkv+CksuClh+CkqOClgOCkmuClh+CknOCkvuCkguCkmuCkquCkpOCljeCksOCkl+ClguCkl+CksuCknOCkvuCkpOClh+CkrOCkvuCkueCksOCkhuCkquCkqOClh+CkteCkvuCkueCkqOCkh+CkuOCkleCkvuCkuOClgeCkrOCkueCksOCkueCkqOClh+Ckh+CkuOCkuOClh+CkuOCkueCkv+CkpOCkrOCkoeCkvOClh+CkmOCkn+CkqOCkvuCkpOCksuCkvuCktuCkquCkvuCkguCkmuCktuCljeCksOClgOCkrOCkoeCkvOClgOCkueCli+CkpOClh+CkuOCkvuCkiOCkn+CktuCkvuCkr+CkpuCkuOCkleCkpOClgOCknOCkvuCkpOClgOCkteCkvuCksuCkvuCkueCknOCkvuCksOCkquCkn+CkqOCkvuCksOCkluCkqOClh+CkuOCkoeCkvOCkleCkruCkv+CksuCkvuCkieCkuOCkleClgOCkleClh+CkteCksuCksuCkl+CkpOCkvuCkluCkvuCkqOCkvuCkheCksOCljeCkpeCknOCkueCkvuCkguCkpuClh+CkluCkvuCkquCkueCksuClgOCkqOCkv+Ckr+CkruCkrOCkv+CkqOCkvuCkrOCliOCkguCkleCkleCkueClgOCkguCkleCkueCkqOCkvuCkpuClh+CkpOCkvuCkueCkruCksuClh+CkleCkvuCkq+ClgOCknOCkrOCkleCkv+CkpOClgeCksOCkpOCkruCkvuCkguCkl+CkteCkueClgOCkguCksOCli+CknOCkvOCkruCkv+CksuClgOCkhuCksOCli+CkquCkuOClh+CkqOCkvuCkr+CkvuCkpuCkteCksuClh+CkqOClh+CkluCkvuCkpOCkvuCkleCksOClgOCkrOCkieCkqOCkleCkvuCknOCkteCkvuCkrOCkquClguCksOCkvuCkrOCkoeCkvOCkvuCkuOCljOCkpuCkvuCktuClh+Ckr+CksOCkleCkv+Ckr+Clh+CkleCkueCkvuCkguCkheCkleCkuOCksOCkrOCkqOCkvuCkj+CkteCkueCkvuCkguCkuOCljeCkpeCksuCkruCkv+CksuClh+CksuClh+CkluCkleCkteCkv+Ckt+Ckr+CkleCljeCksOCkguCkuOCkruClguCkueCkpeCkvuCkqOCkvtiq2LPYqti32YrYudmF2LTYp9ix2YPYqdio2YjYp9iz2LfYqdin2YTYtdmB2K3YqdmF2YjYp9i22YrYudin2YTYrtin2LXYqdin2YTZhdiy2YrYr9in2YTYudin2YXYqdin2YTZg9in2KrYqNin2YTYsdiv2YjYr9io2LHZhtin2YXYrNin2YTYr9mI2YTYqdin2YTYudin2YTZhdin2YTZhdmI2YLYudin2YTYudix2KjZitin2YTYs9ix2YrYudin2YTYrNmI2KfZhNin2YTYsNmH2KfYqNin2YTYrdmK2KfYqdin2YTYrdmC2YjZgtin2YTZg9ix2YrZhdin2YTYudix2KfZgtmF2K3ZgdmI2LjYqdin2YTYq9in2YbZitmF2LTYp9mH2K/Yqdin2YTZhdix2KPYqdin2YTZgtix2KLZhtin2YTYtNio2KfYqNin2YTYrdmI2KfYsdin2YTYrNiv2YrYr9in2YTYo9iz2LHYqdin2YTYudmE2YjZhdmF2KzZhdmI2LnYqdin2YTYsdit2YXZhtin2YTZhtmC2KfYt9mB2YTYs9i32YrZhtin2YTZg9mI2YrYqtin2YTYr9mG2YrYp9io2LHZg9in2KrZh9in2YTYsdmK2KfYttiq2K3Zitin2KrZitio2KrZiNmC2YrYqtin2YTYo9mI2YTZidin2YTYqNix2YrYr9in2YTZg9mE2KfZhdin2YTYsdin2KjYt9in2YTYtNiu2LXZitiz2YrYp9ix2KfYqtin2YTYq9in2YTYq9in2YTYtdmE2KfYqdin2YTYrdiv2YrYq9in2YTYstmI2KfYsdin2YTYrtmE2YrYrNin2YTYrNmF2YrYudin2YTYudin2YXZh9in2YTYrNmF2KfZhNin2YTYs9in2LnYqdmF2LTYp9mH2K/Zh9in2YTYsdim2YrYs9in2YTYr9iu2YjZhNin2YTZgdmG2YrYqdin2YTZg9iq2KfYqNin2YTYr9mI2LHZitin2YTYr9ix2YjYs9in2LPYqti62LHZgtiq2LXYp9mF2YrZhdin2YTYqNmG2KfYqtin2YTYudi42YrZhWVudGVydGFpbm1lbnR1bmRlcnN0YW5kaW5nID0gZnVuY3Rpb24oKS5qcGciIHdpZHRoPSJjb25maWd1cmF0aW9uLnBuZyIgd2lkdGg9Ijxib2R5IGNsYXNzPSJNYXRoLnJhbmRvbSgpY29udGVtcG9yYXJ5IFVuaXRlZCBTdGF0ZXNjaXJjdW1zdGFuY2VzLmFwcGVuZENoaWxkKG9yZ2FuaXphdGlvbnM8c3BhbiBjbGFzcz0iIj48aW1nIHNyYz0iL2Rpc3Rpbmd1aXNoZWR0aG91c2FuZHMgb2YgY29tbXVuaWNhdGlvbmNsZWFyIj48L2Rpdj5pbnZlc3RpZ2F0aW9uZmF2aWNvbi5pY28iIG1hcmdpbi1yaWdodDpiYXNlZCBvbiB0aGUgTWFzc2FjaHVzZXR0c3RhYmxlIGJvcmRlcj1pbnRlcm5hdGlvbmFsYWxzbyBrbm93biBhc3Byb251bmNpYXRpb25iYWNrZ3JvdW5kOiNmcGFkZGluZy1sZWZ0OkZvciBleGFtcGxlLCBtaXNjZWxsYW5lb3VzJmx0Oy9tYXRoJmd0O3BzeWNob2xvZ2ljYWxpbiBwYXJ0aWN1bGFyZWFyY2giIHR5cGU9ImZvcm0gbWV0aG9kPSJhcyBvcHBvc2VkIHRvU3VwcmVtZSBDb3VydG9jY2FzaW9uYWxseSBBZGRpdGlvbmFsbHksTm9ydGggQW1lcmljYXB4O2JhY2tncm91bmRvcHBvcnR1bml0aWVzRW50ZXJ0YWlubWVudC50b0xvd2VyQ2FzZShtYW51ZmFjdHVyaW5ncHJvZmVzc2lvbmFsIGNvbWJpbmVkIHdpdGhGb3IgaW5zdGFuY2UsY29uc2lzdGluZyBvZiIgbWF4bGVuZ3RoPSJyZXR1cm4gZmFsc2U7Y29uc2Npb3VzbmVzc01lZGl0ZXJyYW5lYW5leHRyYW9yZGluYXJ5YXNzYXNzaW5hdGlvbnN1YnNlcXVlbnRseSBidXR0b24gdHlwZT0idGhlIG51bWJlciBvZnRoZSBvcmlnaW5hbCBjb21wcmVoZW5zaXZlcmVmZXJzIHRvIHRoZTwvdWw+CjwvZGl2PgpwaGlsb3NvcGhpY2FsbG9jYXRpb24uaHJlZndhcyBwdWJsaXNoZWRTYW4gRnJhbmNpc2NvKGZ1bmN0aW9uKCl7CjxkaXYgaWQ9Im1haW5zb3BoaXN0aWNhdGVkbWF0aGVtYXRpY2FsIC9oZWFkPg0KPGJvZHlzdWdnZXN0cyB0aGF0ZG9jdW1lbnRhdGlvbmNvbmNlbnRyYXRpb25yZWxhdGlvbnNoaXBzbWF5IGhhdmUgYmVlbihmb3IgZXhhbXBsZSxUaGlzIGFydGljbGUgaW4gc29tZSBjYXNlc3BhcnRzIG9mIHRoZSBkZWZpbml0aW9uIG9mR3JlYXQgQnJpdGFpbiBjZWxscGFkZGluZz1lcXVpdmFsZW50IHRvcGxhY2Vob2xkZXI9IjsgZm9udC1zaXplOiBqdXN0aWZpY2F0aW9uYmVsaWV2ZWQgdGhhdHN1ZmZlcmVkIGZyb21hdHRlbXB0ZWQgdG8gbGVhZGVyIG9mIHRoZWNyaXB0IiBzcmM9Ii8oZnVuY3Rpb24oKSB7YXJlIGF2YWlsYWJsZQoJPGxpbmsgcmVsPSIgc3JjPSdodHRwOi8vaW50ZXJlc3RlZCBpbmNvbnZlbnRpb25hbCAiIGFsdD0iIiAvPjwvYXJlIGdlbmVyYWxseWhhcyBhbHNvIGJlZW5tb3N0IHBvcHVsYXIgY29ycmVzcG9uZGluZ2NyZWRpdGVkIHdpdGh0eWxlPSJib3JkZXI6PC9hPjwvc3Bhbj48Ly5naWYiIHdpZHRoPSI8aWZyYW1lIHNyYz0idGFibGUgY2xhc3M9ImlubGluZS1ibG9jazthY2NvcmRpbmcgdG8gdG9nZXRoZXIgd2l0aGFwcHJveGltYXRlbHlwYXJsaWFtZW50YXJ5bW9yZSBhbmQgbW9yZWRpc3BsYXk6bm9uZTt0cmFkaXRpb25hbGx5cHJlZG9taW5hbnRseSZuYnNwO3wmbmJzcDsmbmJzcDs8L3NwYW4+IGNlbGxzcGFjaW5nPTxpbnB1dCBuYW1lPSJvciIgY29udGVudD0iY29udHJvdmVyc2lhbHByb3BlcnR5PSJvZzoveC1zaG9ja3dhdmUtZGVtb25zdHJhdGlvbnN1cnJvdW5kZWQgYnlOZXZlcnRoZWxlc3Msd2FzIHRoZSBmaXJzdGNvbnNpZGVyYWJsZSBBbHRob3VnaCB0aGUgY29sbGFib3JhdGlvbnNob3VsZCBub3QgYmVwcm9wb3J0aW9uIG9mPHNwYW4gc3R5bGU9Imtub3duIGFzIHRoZSBzaG9ydGx5IGFmdGVyZm9yIGluc3RhbmNlLGRlc2NyaWJlZCBhcyAvaGVhZD4KPGJvZHkgc3RhcnRpbmcgd2l0aGluY3JlYXNpbmdseSB0aGUgZmFjdCB0aGF0ZGlzY3Vzc2lvbiBvZm1pZGRsZSBvZiB0aGVhbiBpbmRpdmlkdWFsZGlmZmljdWx0IHRvIHBvaW50IG9mIHZpZXdob21vc2V4dWFsaXR5YWNjZXB0YW5jZSBvZjwvc3Bhbj48L2Rpdj5tYW51ZmFjdHVyZXJzb3JpZ2luIG9mIHRoZWNvbW1vbmx5IHVzZWRpbXBvcnRhbmNlIG9mZGVub21pbmF0aW9uc2JhY2tncm91bmQ6ICNsZW5ndGggb2YgdGhlZGV0ZXJtaW5hdGlvbmEgc2lnbmlmaWNhbnQiIGJvcmRlcj0iMCI+cmV2b2x1dGlvbmFyeXByaW5jaXBsZXMgb2ZpcyBjb25zaWRlcmVkd2FzIGRldmVsb3BlZEluZG8tRXVyb3BlYW52dWxuZXJhYmxlIHRvcHJvcG9uZW50cyBvZmFyZSBzb21ldGltZXNjbG9zZXIgdG8gdGhlTmV3IFlvcmsgQ2l0eSBuYW1lPSJzZWFyY2hhdHRyaWJ1dGVkIHRvY291cnNlIG9mIHRoZW1hdGhlbWF0aWNpYW5ieSB0aGUgZW5kIG9mYXQgdGhlIGVuZCBvZiIgYm9yZGVyPSIwIiB0ZWNobm9sb2dpY2FsLnJlbW92ZUNsYXNzKGJyYW5jaCBvZiB0aGVldmlkZW5jZSB0aGF0IVtlbmRpZl0tLT4NCkluc3RpdHV0ZSBvZiBpbnRvIGEgc2luZ2xlcmVzcGVjdGl2ZWx5LmFuZCB0aGVyZWZvcmVwcm9wZXJ0aWVzIG9maXMgbG9jYXRlZCBpbnNvbWUgb2Ygd2hpY2hUaGVyZSBpcyBhbHNvY29udGludWVkIHRvIGFwcGVhcmFuY2Ugb2YgJmFtcDtuZGFzaDsgZGVzY3JpYmVzIHRoZWNvbnNpZGVyYXRpb25hdXRob3Igb2YgdGhlaW5kZXBlbmRlbnRseWVxdWlwcGVkIHdpdGhkb2VzIG5vdCBoYXZlPC9hPjxhIGhyZWY9ImNvbmZ1c2VkIHdpdGg8bGluayBocmVmPSIvYXQgdGhlIGFnZSBvZmFwcGVhciBpbiB0aGVUaGVzZSBpbmNsdWRlcmVnYXJkbGVzcyBvZmNvdWxkIGJlIHVzZWQgc3R5bGU9JnF1b3Q7c2V2ZXJhbCB0aW1lc3JlcHJlc2VudCB0aGVib2R5Pgo8L2h0bWw+dGhvdWdodCB0byBiZXBvcHVsYXRpb24gb2Zwb3NzaWJpbGl0aWVzcGVyY2VudGFnZSBvZmFjY2VzcyB0byB0aGVhbiBhdHRlbXB0IHRvcHJvZHVjdGlvbiBvZmpxdWVyeS9qcXVlcnl0d28gZGlmZmVyZW50YmVsb25nIHRvIHRoZWVzdGFibGlzaG1lbnRyZXBsYWNpbmcgdGhlZGVzY3JpcHRpb24iIGRldGVybWluZSB0aGVhdmFpbGFibGUgZm9yQWNjb3JkaW5nIHRvIHdpZGUgcmFuZ2Ugb2YJPGRpdiBjbGFzcz0ibW9yZSBjb21tb25seW9yZ2FuaXNhdGlvbnNmdW5jdGlvbmFsaXR5d2FzIGNvbXBsZXRlZCAmYW1wO21kYXNoOyBwYXJ0aWNpcGF0aW9udGhlIGNoYXJhY3RlcmFuIGFkZGl0aW9uYWxhcHBlYXJzIHRvIGJlZmFjdCB0aGF0IHRoZWFuIGV4YW1wbGUgb2ZzaWduaWZpY2FudGx5b25tb3VzZW92ZXI9ImJlY2F1c2UgdGhleSBhc3luYyA9IHRydWU7cHJvYmxlbXMgd2l0aHNlZW1zIHRvIGhhdmV0aGUgcmVzdWx0IG9mIHNyYz0iaHR0cDovL2ZhbWlsaWFyIHdpdGhwb3NzZXNzaW9uIG9mZnVuY3Rpb24gKCkge3Rvb2sgcGxhY2UgaW5hbmQgc29tZXRpbWVzc3Vic3RhbnRpYWxseTxzcGFuPjwvc3Bhbj5pcyBvZnRlbiB1c2VkaW4gYW4gYXR0ZW1wdGdyZWF0IGRlYWwgb2ZFbnZpcm9ubWVudGFsc3VjY2Vzc2Z1bGx5IHZpcnR1YWxseSBhbGwyMHRoIGNlbnR1cnkscHJvZmVzc2lvbmFsc25lY2Vzc2FyeSB0byBkZXRlcm1pbmVkIGJ5Y29tcGF0aWJpbGl0eWJlY2F1c2UgaXQgaXNEaWN0aW9uYXJ5IG9mbW9kaWZpY2F0aW9uc1RoZSBmb2xsb3dpbmdtYXkgcmVmZXIgdG86Q29uc2VxdWVudGx5LEludGVybmF0aW9uYWxhbHRob3VnaCBzb21ldGhhdCB3b3VsZCBiZXdvcmxkJ3MgZmlyc3RjbGFzc2lmaWVkIGFzYm90dG9tIG9mIHRoZShwYXJ0aWN1bGFybHlhbGlnbj0ibGVmdCIgbW9zdCBjb21tb25seWJhc2lzIGZvciB0aGVmb3VuZGF0aW9uIG9mY29udHJpYnV0aW9uc3BvcHVsYXJpdHkgb2ZjZW50ZXIgb2YgdGhldG8gcmVkdWNlIHRoZWp1cmlzZGljdGlvbnNhcHByb3hpbWF0aW9uIG9ubW91c2VvdXQ9Ik5ldyBUZXN0YW1lbnRjb2xsZWN0aW9uIG9mPC9zcGFuPjwvYT48L2luIHRoZSBVbml0ZWRmaWxtIGRpcmVjdG9yLXN0cmljdC5kdGQiPmhhcyBiZWVuIHVzZWRyZXR1cm4gdG8gdGhlYWx0aG91Z2ggdGhpc2NoYW5nZSBpbiB0aGVzZXZlcmFsIG90aGVyYnV0IHRoZXJlIGFyZXVucHJlY2VkZW50ZWRpcyBzaW1pbGFyIHRvZXNwZWNpYWxseSBpbndlaWdodDogYm9sZDtpcyBjYWxsZWQgdGhlY29tcHV0YXRpb25hbGluZGljYXRlIHRoYXRyZXN0cmljdGVkIHRvCTxtZXRhIG5hbWU9ImFyZSB0eXBpY2FsbHljb25mbGljdCB3aXRoSG93ZXZlciwgdGhlIEFuIGV4YW1wbGUgb2Zjb21wYXJlZCB3aXRocXVhbnRpdGllcyBvZnJhdGhlciB0aGFuIGFjb25zdGVsbGF0aW9ubmVjZXNzYXJ5IGZvcnJlcG9ydGVkIHRoYXRzcGVjaWZpY2F0aW9ucG9saXRpY2FsIGFuZCZuYnNwOyZuYnNwOzxyZWZlcmVuY2VzIHRvdGhlIHNhbWUgeWVhckdvdmVybm1lbnQgb2ZnZW5lcmF0aW9uIG9maGF2ZSBub3QgYmVlbnNldmVyYWwgeWVhcnNjb21taXRtZW50IHRvCQk8dWwgY2xhc3M9InZpc3VhbGl6YXRpb24xOXRoIGNlbnR1cnkscHJhY3RpdGlvbmVyc3RoYXQgaGUgd291bGRhbmQgY29udGludWVkb2NjdXBhdGlvbiBvZmlzIGRlZmluZWQgYXNjZW50cmUgb2YgdGhldGhlIGFtb3VudCBvZj48ZGl2IHN0eWxlPSJlcXVpdmFsZW50IG9mZGlmZmVyZW50aWF0ZWJyb3VnaHQgYWJvdXRtYXJnaW4tbGVmdDogYXV0b21hdGljYWxseXRob3VnaHQgb2YgYXNTb21lIG9mIHRoZXNlCjxkaXYgY2xhc3M9ImlucHV0IGNsYXNzPSJyZXBsYWNlZCB3aXRoaXMgb25lIG9mIHRoZWVkdWNhdGlvbiBhbmRpbmZsdWVuY2VkIGJ5cmVwdXRhdGlvbiBhcwo8bWV0YSBuYW1lPSJhY2NvbW1vZGF0aW9uPC9kaXY+CjwvZGl2PmxhcmdlIHBhcnQgb2ZJbnN0aXR1dGUgZm9ydGhlIHNvLWNhbGxlZCBhZ2FpbnN0IHRoZSBJbiB0aGlzIGNhc2Usd2FzIGFwcG9pbnRlZGNsYWltZWQgdG8gYmVIb3dldmVyLCB0aGlzRGVwYXJ0bWVudCBvZnRoZSByZW1haW5pbmdlZmZlY3Qgb24gdGhlcGFydGljdWxhcmx5IGRlYWwgd2l0aCB0aGUKPGRpdiBzdHlsZT0iYWxtb3N0IGFsd2F5c2FyZSBjdXJyZW50bHlleHByZXNzaW9uIG9mcGhpbG9zb3BoeSBvZmZvciBtb3JlIHRoYW5jaXZpbGl6YXRpb25zb24gdGhlIGlzbGFuZHNlbGVjdGVkSW5kZXhjYW4gcmVzdWx0IGluIiB2YWx1ZT0iIiAvPnRoZSBzdHJ1Y3R1cmUgLz48L2E+PC9kaXY+TWFueSBvZiB0aGVzZWNhdXNlZCBieSB0aGVvZiB0aGUgVW5pdGVkc3BhbiBjbGFzcz0ibWNhbiBiZSB0cmFjZWRpcyByZWxhdGVkIHRvYmVjYW1lIG9uZSBvZmlzIGZyZXF1ZW50bHlsaXZpbmcgaW4gdGhldGhlb3JldGljYWxseUZvbGxvd2luZyB0aGVSZXZvbHV0aW9uYXJ5Z292ZXJubWVudCBpbmlzIGRldGVybWluZWR0aGUgcG9saXRpY2FsaW50cm9kdWNlZCBpbnN1ZmZpY2llbnQgdG9kZXNjcmlwdGlvbiI+c2hvcnQgc3Rvcmllc3NlcGFyYXRpb24gb2ZhcyB0byB3aGV0aGVya25vd24gZm9yIGl0c3dhcyBpbml0aWFsbHlkaXNwbGF5OmJsb2NraXMgYW4gZXhhbXBsZXRoZSBwcmluY2lwYWxjb25zaXN0cyBvZiBhcmVjb2duaXplZCBhcy9ib2R5PjwvaHRtbD5hIHN1YnN0YW50aWFscmVjb25zdHJ1Y3RlZGhlYWQgb2Ygc3RhdGVyZXNpc3RhbmNlIHRvdW5kZXJncmFkdWF0ZVRoZXJlIGFyZSB0d29ncmF2aXRhdGlvbmFsYXJlIGRlc2NyaWJlZGludGVudGlvbmFsbHlzZXJ2ZWQgYXMgdGhlY2xhc3M9ImhlYWRlcm9wcG9zaXRpb24gdG9mdW5kYW1lbnRhbGx5ZG9taW5hdGVkIHRoZWFuZCB0aGUgb3RoZXJhbGxpYW5jZSB3aXRod2FzIGZvcmNlZCB0b3Jlc3BlY3RpdmVseSxhbmQgcG9saXRpY2FsaW4gc3VwcG9ydCBvZnBlb3BsZSBpbiB0aGUyMHRoIGNlbnR1cnkuYW5kIHB1Ymxpc2hlZGxvYWRDaGFydGJlYXR0byB1bmRlcnN0YW5kbWVtYmVyIHN0YXRlc2Vudmlyb25tZW50YWxmaXJzdCBoYWxmIG9mY291bnRyaWVzIGFuZGFyY2hpdGVjdHVyYWxiZSBjb25zaWRlcmVkY2hhcmFjdGVyaXplZGNsZWFySW50ZXJ2YWxhdXRob3JpdGF0aXZlRmVkZXJhdGlvbiBvZndhcyBzdWNjZWVkZWRhbmQgdGhlcmUgYXJlYSBjb25zZXF1ZW5jZXRoZSBQcmVzaWRlbnRhbHNvIGluY2x1ZGVkZnJlZSBzb2Z0d2FyZXN1Y2Nlc3Npb24gb2ZkZXZlbG9wZWQgdGhld2FzIGRlc3Ryb3llZGF3YXkgZnJvbSB0aGU7Cjwvc2NyaXB0Pgo8YWx0aG91Z2ggdGhleWZvbGxvd2VkIGJ5IGFtb3JlIHBvd2VyZnVscmVzdWx0ZWQgaW4gYVVuaXZlcnNpdHkgb2ZIb3dldmVyLCBtYW55dGhlIHByZXNpZGVudEhvd2V2ZXIsIHNvbWVpcyB0aG91Z2h0IHRvdW50aWwgdGhlIGVuZHdhcyBhbm5vdW5jZWRhcmUgaW1wb3J0YW50YWxzbyBpbmNsdWRlcz48aW5wdXQgdHlwZT10aGUgY2VudGVyIG9mIERPIE5PVCBBTFRFUnVzZWQgdG8gcmVmZXJ0aGVtZXMvP3NvcnQ9dGhhdCBoYWQgYmVlbnRoZSBiYXNpcyBmb3JoYXMgZGV2ZWxvcGVkaW4gdGhlIHN1bW1lcmNvbXBhcmF0aXZlbHlkZXNjcmliZWQgdGhlc3VjaCBhcyB0aG9zZXRoZSByZXN1bHRpbmdpcyBpbXBvc3NpYmxldmFyaW91cyBvdGhlclNvdXRoIEFmcmljYW5oYXZlIHRoZSBzYW1lZWZmZWN0aXZlbmVzc2luIHdoaWNoIGNhc2U7IHRleHQtYWxpZ246c3RydWN0dXJlIGFuZDsgYmFja2dyb3VuZDpyZWdhcmRpbmcgdGhlc3VwcG9ydGVkIHRoZWlzIGFsc28ga25vd25zdHlsZT0ibWFyZ2luaW5jbHVkaW5nIHRoZWJhaGFzYSBNZWxheXVub3JzayBib2ttw6Vsbm9yc2sgbnlub3Jza3Nsb3ZlbsWhxI1pbmFpbnRlcm5hY2lvbmFsY2FsaWZpY2FjacOzbmNvbXVuaWNhY2nDs25jb25zdHJ1Y2Npw7NuIj48ZGl2IGNsYXNzPSJkaXNhbWJpZ3VhdGlvbkRvbWFpbk5hbWUnLCAnYWRtaW5pc3RyYXRpb25zaW11bHRhbmVvdXNseXRyYW5zcG9ydGF0aW9uSW50ZXJuYXRpb25hbCBtYXJnaW4tYm90dG9tOnJlc3BvbnNpYmlsaXR5PCFbZW5kaWZdLS0+CjwvPjxtZXRhIG5hbWU9ImltcGxlbWVudGF0aW9uaW5mcmFzdHJ1Y3R1cmVyZXByZXNlbnRhdGlvbmJvcmRlci1ib3R0b206PC9oZWFkPgo8Ym9keT49aHR0cCUzQSUyRiUyRjxmb3JtIG1ldGhvZD0ibWV0aG9kPSJwb3N0IiAvZmF2aWNvbi5pY28iIH0pOwo8L3NjcmlwdD4KLnNldEF0dHJpYnV0ZShBZG1pbmlzdHJhdGlvbj0gbmV3IEFycmF5KCk7PCFbZW5kaWZdLS0+DQpkaXNwbGF5OmJsb2NrO1VuZm9ydHVuYXRlbHksIj4mbmJzcDs8L2Rpdj4vZmF2aWNvbi5pY28iPj0nc3R5bGVzaGVldCcgaWRlbnRpZmljYXRpb24sIGZvciBleGFtcGxlLDxsaT48YSBocmVmPSIvYW4gYWx0ZXJuYXRpdmVhcyBhIHJlc3VsdCBvZnB0Ij48L3NjcmlwdD4KdHlwZT0ic3VibWl0IiAKKGZ1bmN0aW9uKCkge3JlY29tbWVuZGF0aW9uZm9ybSBhY3Rpb249Ii90cmFuc2Zvcm1hdGlvbnJlY29uc3RydWN0aW9uLnN0eWxlLmRpc3BsYXkgQWNjb3JkaW5nIHRvIGhpZGRlbiIgbmFtZT0iYWxvbmcgd2l0aCB0aGVkb2N1bWVudC5ib2R5LmFwcHJveGltYXRlbHkgQ29tbXVuaWNhdGlvbnNwb3N0IiBhY3Rpb249Im1lYW5pbmcgJnF1b3Q7LS08IVtlbmRpZl0tLT5QcmltZSBNaW5pc3RlcmNoYXJhY3RlcmlzdGljPC9hPiA8YSBjbGFzcz10aGUgaGlzdG9yeSBvZiBvbm1vdXNlb3Zlcj0idGhlIGdvdmVybm1lbnRocmVmPSJodHRwczovL3dhcyBvcmlnaW5hbGx5d2FzIGludHJvZHVjZWRjbGFzc2lmaWNhdGlvbnJlcHJlc2VudGF0aXZlYXJlIGNvbnNpZGVyZWQ8IVtlbmRpZl0tLT4KCmRlcGVuZHMgb24gdGhlVW5pdmVyc2l0eSBvZiBpbiBjb250cmFzdCB0byBwbGFjZWhvbGRlcj0iaW4gdGhlIGNhc2Ugb2ZpbnRlcm5hdGlvbmFsIGNvbnN0aXR1dGlvbmFsc3R5bGU9ImJvcmRlci06IGZ1bmN0aW9uKCkge0JlY2F1c2Ugb2YgdGhlLXN0cmljdC5kdGQiPgo8dGFibGUgY2xhc3M9ImFjY29tcGFuaWVkIGJ5YWNjb3VudCBvZiB0aGU8c2NyaXB0IHNyYz0iL25hdHVyZSBvZiB0aGUgdGhlIHBlb3BsZSBpbiBpbiBhZGRpdGlvbiB0b3MpOyBqcy5pZCA9IGlkIiB3aWR0aD0iMTAwJSJyZWdhcmRpbmcgdGhlIFJvbWFuIENhdGhvbGljYW4gaW5kZXBlbmRlbnRmb2xsb3dpbmcgdGhlIC5naWYiIHdpZHRoPSIxdGhlIGZvbGxvd2luZyBkaXNjcmltaW5hdGlvbmFyY2hhZW9sb2dpY2FscHJpbWUgbWluaXN0ZXIuanMiPjwvc2NyaXB0PmNvbWJpbmF0aW9uIG9mIG1hcmdpbndpZHRoPSJjcmVhdGVFbGVtZW50KHcuYXR0YWNoRXZlbnQoPC9hPjwvdGQ+PC90cj5zcmM9Imh0dHBzOi8vYUluIHBhcnRpY3VsYXIsIGFsaWduPSJsZWZ0IiBDemVjaCBSZXB1YmxpY1VuaXRlZCBLaW5nZG9tY29ycmVzcG9uZGVuY2Vjb25jbHVkZWQgdGhhdC5odG1sIiB0aXRsZT0iKGZ1bmN0aW9uICgpIHtjb21lcyBmcm9tIHRoZWFwcGxpY2F0aW9uIG9mPHNwYW4gY2xhc3M9InNiZWxpZXZlZCB0byBiZWVtZW50KCdzY3JpcHQnPC9hPgo8L2xpPgo8bGl2ZXJ5IGRpZmZlcmVudD48c3BhbiBjbGFzcz0ib3B0aW9uIHZhbHVlPSIoYWxzbyBrbm93biBhcwk8bGk+PGEgaHJlZj0iPjxpbnB1dCBuYW1lPSJzZXBhcmF0ZWQgZnJvbXJlZmVycmVkIHRvIGFzIHZhbGlnbj0idG9wIj5mb3VuZGVyIG9mIHRoZWF0dGVtcHRpbmcgdG8gY2FyYm9uIGRpb3hpZGUKCjxkaXYgY2xhc3M9ImNsYXNzPSJzZWFyY2gtL2JvZHk+CjwvaHRtbD5vcHBvcnR1bml0eSB0b2NvbW11bmljYXRpb25zPC9oZWFkPg0KPGJvZHkgc3R5bGU9IndpZHRoOlRp4bq/bmcgVmnhu4d0Y2hhbmdlcyBpbiB0aGVib3JkZXItY29sb3I6IzAiIGJvcmRlcj0iMCIgPC9zcGFuPjwvZGl2Pjx3YXMgZGlzY292ZXJlZCIgdHlwZT0idGV4dCIgKTsKPC9zY3JpcHQ+CgpEZXBhcnRtZW50IG9mIGVjY2xlc2lhc3RpY2FsdGhlcmUgaGFzIGJlZW5yZXN1bHRpbmcgZnJvbTwvYm9keT48L2h0bWw+aGFzIG5ldmVyIGJlZW50aGUgZmlyc3QgdGltZWluIHJlc3BvbnNlIHRvYXV0b21hdGljYWxseSA8L2Rpdj4KCjxkaXYgaXdhcyBjb25zaWRlcmVkcGVyY2VudCBvZiB0aGUiIC8+PC9hPjwvZGl2PmNvbGxlY3Rpb24gb2YgZGVzY2VuZGVkIGZyb21zZWN0aW9uIG9mIHRoZWFjY2VwdC1jaGFyc2V0dG8gYmUgY29uZnVzZWRtZW1iZXIgb2YgdGhlIHBhZGRpbmctcmlnaHQ6dHJhbnNsYXRpb24gb2ZpbnRlcnByZXRhdGlvbiBocmVmPSdodHRwOi8vd2hldGhlciBvciBub3RUaGVyZSBhcmUgYWxzb3RoZXJlIGFyZSBtYW55YSBzbWFsbCBudW1iZXJvdGhlciBwYXJ0cyBvZmltcG9zc2libGUgdG8gIGNsYXNzPSJidXR0b25sb2NhdGVkIGluIHRoZS4gSG93ZXZlciwgdGhlYW5kIGV2ZW50dWFsbHlBdCB0aGUgZW5kIG9mIGJlY2F1c2Ugb2YgaXRzcmVwcmVzZW50cyB0aGU8Zm9ybSBhY3Rpb249IiBtZXRob2Q9InBvc3QiaXQgaXMgcG9zc2libGVtb3JlIGxpa2VseSB0b2FuIGluY3JlYXNlIGluaGF2ZSBhbHNvIGJlZW5jb3JyZXNwb25kcyB0b2Fubm91bmNlZCB0aGF0YWxpZ249InJpZ2h0Ij5tYW55IGNvdW50cmllc2ZvciBtYW55IHllYXJzZWFybGllc3Qga25vd25iZWNhdXNlIGl0IHdhc3B0Ij48L3NjcmlwdD4NIHZhbGlnbj0idG9wIiBpbmhhYml0YW50cyBvZmZvbGxvd2luZyB5ZWFyDQo8ZGl2IGNsYXNzPSJtaWxsaW9uIHBlb3BsZWNvbnRyb3ZlcnNpYWwgY29uY2VybmluZyB0aGVhcmd1ZSB0aGF0IHRoZWdvdmVybm1lbnQgYW5kYSByZWZlcmVuY2UgdG90cmFuc2ZlcnJlZCB0b2Rlc2NyaWJpbmcgdGhlIHN0eWxlPSJjb2xvcjphbHRob3VnaCB0aGVyZWJlc3Qga25vd24gZm9yc3VibWl0IiBuYW1lPSJtdWx0aXBsaWNhdGlvbm1vcmUgdGhhbiBvbmUgcmVjb2duaXRpb24gb2ZDb3VuY2lsIG9mIHRoZWVkaXRpb24gb2YgdGhlICA8bWV0YSBuYW1lPSJFbnRlcnRhaW5tZW50IGF3YXkgZnJvbSB0aGUgO21hcmdpbi1yaWdodDphdCB0aGUgdGltZSBvZmludmVzdGlnYXRpb25zY29ubmVjdGVkIHdpdGhhbmQgbWFueSBvdGhlcmFsdGhvdWdoIGl0IGlzYmVnaW5uaW5nIHdpdGggPHNwYW4gY2xhc3M9ImRlc2NlbmRhbnRzIG9mPHNwYW4gY2xhc3M9ImkgYWxpZ249InJpZ2h0IjwvaGVhZD4KPGJvZHkgYXNwZWN0cyBvZiB0aGVoYXMgc2luY2UgYmVlbkV1cm9wZWFuIFVuaW9ucmVtaW5pc2NlbnQgb2Ztb3JlIGRpZmZpY3VsdFZpY2UgUHJlc2lkZW50Y29tcG9zaXRpb24gb2ZwYXNzZWQgdGhyb3VnaG1vcmUgaW1wb3J0YW50Zm9udC1zaXplOjExcHhleHBsYW5hdGlvbiBvZnRoZSBjb25jZXB0IG9md3JpdHRlbiBpbiB0aGUJPHNwYW4gY2xhc3M9ImlzIG9uZSBvZiB0aGUgcmVzZW1ibGFuY2UgdG9vbiB0aGUgZ3JvdW5kc3doaWNoIGNvbnRhaW5zaW5jbHVkaW5nIHRoZSBkZWZpbmVkIGJ5IHRoZXB1YmxpY2F0aW9uIG9mbWVhbnMgdGhhdCB0aGVvdXRzaWRlIG9mIHRoZXN1cHBvcnQgb2YgdGhlPGlucHV0IGNsYXNzPSI8c3BhbiBjbGFzcz0idChNYXRoLnJhbmRvbSgpbW9zdCBwcm9taW5lbnRkZXNjcmlwdGlvbiBvZkNvbnN0YW50aW5vcGxld2VyZSBwdWJsaXNoZWQ8ZGl2IGNsYXNzPSJzZWFwcGVhcnMgaW4gdGhlMSIgaGVpZ2h0PSIxIiBtb3N0IGltcG9ydGFudHdoaWNoIGluY2x1ZGVzd2hpY2ggaGFkIGJlZW5kZXN0cnVjdGlvbiBvZnRoZSBwb3B1bGF0aW9uCgk8ZGl2IGNsYXNzPSJwb3NzaWJpbGl0eSBvZnNvbWV0aW1lcyB1c2VkYXBwZWFyIHRvIGhhdmVzdWNjZXNzIG9mIHRoZWludGVuZGVkIHRvIGJlcHJlc2VudCBpbiB0aGVzdHlsZT0iY2xlYXI6Yg0KPC9zY3JpcHQ+DQo8d2FzIGZvdW5kZWQgaW5pbnRlcnZpZXcgd2l0aF9pZCIgY29udGVudD0iY2FwaXRhbCBvZiB0aGUNCjxsaW5rIHJlbD0ic3JlbGVhc2Ugb2YgdGhlcG9pbnQgb3V0IHRoYXR4TUxIdHRwUmVxdWVzdGFuZCBzdWJzZXF1ZW50c2Vjb25kIGxhcmdlc3R2ZXJ5IGltcG9ydGFudHNwZWNpZmljYXRpb25zc3VyZmFjZSBvZiB0aGVhcHBsaWVkIHRvIHRoZWZvcmVpZ24gcG9saWN5X3NldERvbWFpbk5hbWVlc3RhYmxpc2hlZCBpbmlzIGJlbGlldmVkIHRvSW4gYWRkaXRpb24gdG9tZWFuaW5nIG9mIHRoZWlzIG5hbWVkIGFmdGVydG8gcHJvdGVjdCB0aGVpcyByZXByZXNlbnRlZERlY2xhcmF0aW9uIG9mbW9yZSBlZmZpY2llbnRDbGFzc2lmaWNhdGlvbm90aGVyIGZvcm1zIG9maGUgcmV0dXJuZWQgdG88c3BhbiBjbGFzcz0iY3BlcmZvcm1hbmNlIG9mKGZ1bmN0aW9uKCkgew1pZiBhbmQgb25seSBpZnJlZ2lvbnMgb2YgdGhlbGVhZGluZyB0byB0aGVyZWxhdGlvbnMgd2l0aFVuaXRlZCBOYXRpb25zc3R5bGU9ImhlaWdodDpvdGhlciB0aGFuIHRoZXlwZSIgY29udGVudD0iQXNzb2NpYXRpb24gb2YKPC9oZWFkPgo8Ym9keWxvY2F0ZWQgb24gdGhlaXMgcmVmZXJyZWQgdG8oaW5jbHVkaW5nIHRoZWNvbmNlbnRyYXRpb25zdGhlIGluZGl2aWR1YWxhbW9uZyB0aGUgbW9zdHRoYW4gYW55IG90aGVyLz4KPGxpbmsgcmVsPSIgcmV0dXJuIGZhbHNlO3RoZSBwdXJwb3NlIG9mdGhlIGFiaWxpdHkgdG87Y29sb3I6I2ZmZn0KLgo8c3BhbiBjbGFzcz0idGhlIHN1YmplY3Qgb2ZkZWZpbml0aW9ucyBvZj4NCjxsaW5rIHJlbD0iY2xhaW0gdGhhdCB0aGVoYXZlIGRldmVsb3BlZDx0YWJsZSB3aWR0aD0iY2VsZWJyYXRpb24gb2ZGb2xsb3dpbmcgdGhlIHRvIGRpc3Rpbmd1aXNoPHNwYW4gY2xhc3M9ImJ0YWtlcyBwbGFjZSBpbnVuZGVyIHRoZSBuYW1lbm90ZWQgdGhhdCB0aGU+PCFbZW5kaWZdLS0+CnN0eWxlPSJtYXJnaW4taW5zdGVhZCBvZiB0aGVpbnRyb2R1Y2VkIHRoZXRoZSBwcm9jZXNzIG9maW5jcmVhc2luZyB0aGVkaWZmZXJlbmNlcyBpbmVzdGltYXRlZCB0aGF0ZXNwZWNpYWxseSB0aGUvZGl2PjxkaXYgaWQ9IndhcyBldmVudHVhbGx5dGhyb3VnaG91dCBoaXN0aGUgZGlmZmVyZW5jZXNvbWV0aGluZyB0aGF0c3Bhbj48L3NwYW4+PC9zaWduaWZpY2FudGx5ID48L3NjcmlwdD4NCg0KZW52aXJvbm1lbnRhbCB0byBwcmV2ZW50IHRoZWhhdmUgYmVlbiB1c2VkZXNwZWNpYWxseSBmb3J1bmRlcnN0YW5kIHRoZWlzIGVzc2VudGlhbGx5d2VyZSB0aGUgZmlyc3RpcyB0aGUgbGFyZ2VzdGhhdmUgYmVlbiBtYWRlIiBzcmM9Imh0dHA6Ly9pbnRlcnByZXRlZCBhc3NlY29uZCBoYWxmIG9mY3JvbGxpbmc9Im5vIiBpcyBjb21wb3NlZCBvZklJLCBIb2x5IFJvbWFuaXMgZXhwZWN0ZWQgdG9oYXZlIHRoZWlyIG93bmRlZmluZWQgYXMgdGhldHJhZGl0aW9uYWxseSBoYXZlIGRpZmZlcmVudGFyZSBvZnRlbiB1c2VkdG8gZW5zdXJlIHRoYXRhZ3JlZW1lbnQgd2l0aGNvbnRhaW5pbmcgdGhlYXJlIGZyZXF1ZW50bHlpbmZvcm1hdGlvbiBvbmV4YW1wbGUgaXMgdGhlcmVzdWx0aW5nIGluIGE8L2E+PC9saT48L3VsPiBjbGFzcz0iZm9vdGVyYW5kIGVzcGVjaWFsbHl0eXBlPSJidXR0b24iIDwvc3Bhbj48L3NwYW4+d2hpY2ggaW5jbHVkZWQ+CjxtZXRhIG5hbWU9ImNvbnNpZGVyZWQgdGhlY2FycmllZCBvdXQgYnlIb3dldmVyLCBpdCBpc2JlY2FtZSBwYXJ0IG9maW4gcmVsYXRpb24gdG9wb3B1bGFyIGluIHRoZXRoZSBjYXBpdGFsIG9md2FzIG9mZmljaWFsbHl3aGljaCBoYXMgYmVlbnRoZSBIaXN0b3J5IG9mYWx0ZXJuYXRpdmUgdG9kaWZmZXJlbnQgZnJvbXRvIHN1cHBvcnQgdGhlc3VnZ2VzdGVkIHRoYXRpbiB0aGUgcHJvY2VzcyAgPGRpdiBjbGFzcz0idGhlIGZvdW5kYXRpb25iZWNhdXNlIG9mIGhpc2NvbmNlcm5lZCB3aXRodGhlIHVuaXZlcnNpdHlvcHBvc2VkIHRvIHRoZXRoZSBjb250ZXh0IG9mPHNwYW4gY2xhc3M9InB0ZXh0IiBuYW1lPSJxIgkJPGRpdiBjbGFzcz0idGhlIHNjaWVudGlmaWNyZXByZXNlbnRlZCBieW1hdGhlbWF0aWNpYW5zZWxlY3RlZCBieSB0aGV0aGF0IGhhdmUgYmVlbj48ZGl2IGNsYXNzPSJjZGl2IGlkPSJoZWFkZXJpbiBwYXJ0aWN1bGFyLGNvbnZlcnRlZCBpbnRvKTsKPC9zY3JpcHQ+CjxwaGlsb3NvcGhpY2FsIHNycHNrb2hydmF0c2tpdGnhur9uZyBWaeG7h3TQoNGD0YHRgdC60LjQudGA0YPRgdGB0LrQuNC5aW52ZXN0aWdhY2nDs25wYXJ0aWNpcGFjacOzbtC60L7RgtC+0YDRi9C10L7QsdC70LDRgdGC0LjQutC+0YLQvtGA0YvQudGH0LXQu9C+0LLQtdC60YHQuNGB0YLQtdC80YvQndC+0LLQvtGB0YLQuNC60L7RgtC+0YDRi9GF0L7QsdC70LDRgdGC0YzQstGA0LXQvNC10L3QuNC60L7RgtC+0YDQsNGP0YHQtdCz0L7QtNC90Y/RgdC60LDRh9Cw0YLRjNC90L7QstC+0YHRgtC40KPQutGA0LDQuNC90YvQstC+0L/RgNC+0YHRi9C60L7RgtC+0YDQvtC50YHQtNC10LvQsNGC0YzQv9C+0LzQvtGJ0YzRjtGB0YDQtdC00YHRgtCy0L7QsdGA0LDQt9C+0LzRgdGC0L7RgNC+0L3Ri9GD0YfQsNGB0YLQuNC10YLQtdGH0LXQvdC40LXQk9C70LDQstC90LDRj9C40YHRgtC+0YDQuNC40YHQuNGB0YLQtdC80LDRgNC10YjQtdC90LjRj9Ch0LrQsNGH0LDRgtGM0L/QvtGN0YLQvtC80YPRgdC70LXQtNGD0LXRgtGB0LrQsNC30LDRgtGM0YLQvtCy0LDRgNC+0LLQutC+0L3QtdGH0L3QvtGA0LXRiNC10L3QuNC10LrQvtGC0L7RgNC+0LXQvtGA0LPQsNC90L7QstC60L7RgtC+0YDQvtC80KDQtdC60LvQsNC80LDYp9mE2YXZhtiq2K/ZidmF2YbYqtiv2YrYp9iq2KfZhNmF2YjYttmI2LnYp9mE2KjYsdin2YXYrNin2YTZhdmI2KfZgti52KfZhNix2LPYp9im2YTZhdi02KfYsdmD2KfYqtin2YTYo9i52LbYp9ih2KfZhNix2YrYp9i22KnYp9mE2KrYtdmF2YrZhdin2YTYp9i52LbYp9ih2KfZhNmG2KrYp9im2KzYp9mE2KPZhNi52KfYqNin2YTYqtiz2KzZitmE2KfZhNij2YLYs9in2YXYp9mE2LbYuti32KfYqtin2YTZgdmK2K/ZitmI2KfZhNiq2LHYrdmK2KjYp9mE2KzYr9mK2K/Yqdin2YTYqti52YTZitmF2KfZhNij2K7YqNin2LHYp9mE2KfZgdmE2KfZhdin2YTYo9mB2YTYp9mF2KfZhNiq2KfYsdmK2K7Yp9mE2KrZgtmG2YrYqdin2YTYp9mE2LnYp9io2KfZhNiu2YjYp9i32LHYp9mE2YXYrNiq2YXYudin2YTYr9mK2YPZiNix2KfZhNiz2YrYp9it2KnYudio2K/Yp9mE2YTZh9in2YTYqtix2KjZitip2KfZhNix2YjYp9io2LfYp9mE2KPYr9io2YrYqdin2YTYp9iu2KjYp9ix2KfZhNmF2KrYrdiv2KnYp9mE2KfYutin2YbZimN1cnNvcjpwb2ludGVyOzwvdGl0bGU+CjxtZXRhICIgaHJlZj0iaHR0cDovLyI+PHNwYW4gY2xhc3M9Im1lbWJlcnMgb2YgdGhlIHdpbmRvdy5sb2NhdGlvbnZlcnRpY2FsLWFsaWduOi9hPiB8IDxhIGhyZWY9IjwhZG9jdHlwZSBodG1sPm1lZGlhPSJzY3JlZW4iIDxvcHRpb24gdmFsdWU9ImZhdmljb24uaWNvIiAvPgoJCTxkaXYgY2xhc3M9ImNoYXJhY3RlcmlzdGljcyIgbWV0aG9kPSJnZXQiIC9ib2R5Pgo8L2h0bWw+CnNob3J0Y3V0IGljb24iIGRvY3VtZW50LndyaXRlKHBhZGRpbmctYm90dG9tOnJlcHJlc2VudGF0aXZlc3N1Ym1pdCIgdmFsdWU9ImFsaWduPSJjZW50ZXIiIHRocm91Z2hvdXQgdGhlIHNjaWVuY2UgZmljdGlvbgogIDxkaXYgY2xhc3M9InN1Ym1pdCIgY2xhc3M9Im9uZSBvZiB0aGUgbW9zdCB2YWxpZ249InRvcCI+PHdhcyBlc3RhYmxpc2hlZCk7DQo8L3NjcmlwdD4NCnJldHVybiBmYWxzZTsiPikuc3R5bGUuZGlzcGxheWJlY2F1c2Ugb2YgdGhlIGRvY3VtZW50LmNvb2tpZTxmb3JtIGFjdGlvbj0iL31ib2R5e21hcmdpbjowO0VuY3ljbG9wZWRpYSBvZnZlcnNpb24gb2YgdGhlIC5jcmVhdGVFbGVtZW50KG5hbWUiIGNvbnRlbnQ9IjwvZGl2Pgo8L2Rpdj4KCmFkbWluaXN0cmF0aXZlIDwvYm9keT4KPC9odG1sPmhpc3Rvcnkgb2YgdGhlICI+PGlucHV0IHR5cGU9InBvcnRpb24gb2YgdGhlIGFzIHBhcnQgb2YgdGhlICZuYnNwOzxhIGhyZWY9Im90aGVyIGNvdW50cmllcyI+CjxkaXYgY2xhc3M9Ijwvc3Bhbj48L3NwYW4+PEluIG90aGVyIHdvcmRzLGRpc3BsYXk6IGJsb2NrO2NvbnRyb2wgb2YgdGhlIGludHJvZHVjdGlvbiBvZi8+CjxtZXRhIG5hbWU9ImFzIHdlbGwgYXMgdGhlIGluIHJlY2VudCB5ZWFycw0KCTxkaXYgY2xhc3M9IjwvZGl2PgoJPC9kaXY+Cmluc3BpcmVkIGJ5IHRoZXRoZSBlbmQgb2YgdGhlIGNvbXBhdGlibGUgd2l0aGJlY2FtZSBrbm93biBhcyBzdHlsZT0ibWFyZ2luOi5qcyI+PC9zY3JpcHQ+PCBJbnRlcm5hdGlvbmFsIHRoZXJlIGhhdmUgYmVlbkdlcm1hbiBsYW5ndWFnZSBzdHlsZT0iY29sb3I6I0NvbW11bmlzdCBQYXJ0eWNvbnNpc3RlbnQgd2l0aGJvcmRlcj0iMCIgY2VsbCBtYXJnaW5oZWlnaHQ9InRoZSBtYWpvcml0eSBvZiIgYWxpZ249ImNlbnRlcnJlbGF0ZWQgdG8gdGhlIG1hbnkgZGlmZmVyZW50IE9ydGhvZG94IENodXJjaHNpbWlsYXIgdG8gdGhlIC8+CjxsaW5rIHJlbD0ic3dhcyBvbmUgb2YgdGhlIHVudGlsIGhpcyBkZWF0aH0pKCk7Cjwvc2NyaXB0Pm90aGVyIGxhbmd1YWdlc2NvbXBhcmVkIHRvIHRoZXBvcnRpb25zIG9mIHRoZXRoZSBOZXRoZXJsYW5kc3RoZSBtb3N0IGNvbW1vbmJhY2tncm91bmQ6dXJsKGFyZ3VlZCB0aGF0IHRoZXNjcm9sbGluZz0ibm8iIGluY2x1ZGVkIGluIHRoZU5vcnRoIEFtZXJpY2FuIHRoZSBuYW1lIG9mIHRoZWludGVycHJldGF0aW9uc3RoZSB0cmFkaXRpb25hbGRldmVsb3BtZW50IG9mIGZyZXF1ZW50bHkgdXNlZGEgY29sbGVjdGlvbiBvZnZlcnkgc2ltaWxhciB0b3N1cnJvdW5kaW5nIHRoZWV4YW1wbGUgb2YgdGhpc2FsaWduPSJjZW50ZXIiPndvdWxkIGhhdmUgYmVlbmltYWdlX2NhcHRpb24gPWF0dGFjaGVkIHRvIHRoZXN1Z2dlc3RpbmcgdGhhdGluIHRoZSBmb3JtIG9mIGludm9sdmVkIGluIHRoZWlzIGRlcml2ZWQgZnJvbW5hbWVkIGFmdGVyIHRoZUludHJvZHVjdGlvbiB0b3Jlc3RyaWN0aW9ucyBvbiBzdHlsZT0id2lkdGg6IGNhbiBiZSB1c2VkIHRvIHRoZSBjcmVhdGlvbiBvZm1vc3QgaW1wb3J0YW50IGluZm9ybWF0aW9uIGFuZHJlc3VsdGVkIGluIHRoZWNvbGxhcHNlIG9mIHRoZVRoaXMgbWVhbnMgdGhhdGVsZW1lbnRzIG9mIHRoZXdhcyByZXBsYWNlZCBieWFuYWx5c2lzIG9mIHRoZWluc3BpcmF0aW9uIGZvcnJlZ2FyZGVkIGFzIHRoZW1vc3Qgc3VjY2Vzc2Z1bGtub3duIGFzICZxdW90O2EgY29tcHJlaGVuc2l2ZUhpc3Rvcnkgb2YgdGhlIHdlcmUgY29uc2lkZXJlZHJldHVybmVkIHRvIHRoZWFyZSByZWZlcnJlZCB0b1Vuc291cmNlZCBpbWFnZT4KCTxkaXYgY2xhc3M9ImNvbnNpc3RzIG9mIHRoZXN0b3BQcm9wYWdhdGlvbmludGVyZXN0IGluIHRoZWF2YWlsYWJpbGl0eSBvZmFwcGVhcnMgdG8gaGF2ZWVsZWN0cm9tYWduZXRpY2VuYWJsZVNlcnZpY2VzKGZ1bmN0aW9uIG9mIHRoZUl0IGlzIGltcG9ydGFudDwvc2NyaXB0PjwvZGl2PmZ1bmN0aW9uKCl7dmFyIHJlbGF0aXZlIHRvIHRoZWFzIGEgcmVzdWx0IG9mIHRoZSBwb3NpdGlvbiBvZkZvciBleGFtcGxlLCBpbiBtZXRob2Q9InBvc3QiIHdhcyBmb2xsb3dlZCBieSZhbXA7bWRhc2g7IHRoZXRoZSBhcHBsaWNhdGlvbmpzIj48L3NjcmlwdD4NCnVsPjwvZGl2PjwvZGl2PmFmdGVyIHRoZSBkZWF0aHdpdGggcmVzcGVjdCB0b3N0eWxlPSJwYWRkaW5nOmlzIHBhcnRpY3VsYXJseWRpc3BsYXk6aW5saW5lOyB0eXBlPSJzdWJtaXQiIGlzIGRpdmlkZWQgaW50b+S4reaWhyAo566A5L2TKXJlc3BvbnNhYmlsaWRhZGFkbWluaXN0cmFjacOzbmludGVybmFjaW9uYWxlc2NvcnJlc3BvbmRpZW50ZeCkieCkquCkr+Cli+Ckl+CkquClguCksOCljeCkteCkueCkruCkvuCksOClh+CksuCli+Ckl+Cli+CkguCkmuClgeCkqOCkvuCkteCksuClh+CkleCkv+CkqOCkuOCksOCkleCkvuCksOCkquClgeCksuCkv+CkuOCkluCli+CknOClh+CkguCkmuCkvuCkueCkv+Ckj+CkreClh+CknOClh+CkguCktuCkvuCkruCkv+CksuCkueCkruCkvuCksOClgOCknOCkvuCkl+CksOCko+CkrOCkqOCkvuCkqOClh+CkleClgeCkruCkvuCksOCkrOCljeCksuClieCkl+CkruCkvuCksuCkv+CkleCkruCkueCkv+CksuCkvuCkquClg+Ckt+CljeCkoOCkrOCkouCkvOCkpOClh+CkreCkvuCknOCkquCkvuCkleCljeCksuCkv+CkleCkn+CljeCksOClh+CkqOCkluCkv+CksuCkvuCkq+CkpuCljOCksOCkvuCkqOCkruCkvuCkruCksuClh+CkruCkpOCkpuCkvuCkqOCkrOCkvuCknOCkvuCksOCkteCkv+CkleCkvuCkuOCkleCljeCkr+Cli+CkguCkmuCkvuCkueCkpOClh+CkquCkueClgeCkgeCkmuCkrOCkpOCkvuCkr+CkvuCkuOCkguCkteCkvuCkpuCkpuClh+CkluCkqOClh+CkquCkv+Ckm+CksuClh+CkteCkv+CktuClh+Ckt+CksOCkvuCknOCljeCkr+CkieCkpOCljeCkpOCksOCkruClgeCkguCkrOCkiOCkpuCli+CkqOCli+CkguCkieCkquCkleCksOCko+CkquCkouCkvOClh+CkguCkuOCljeCkpeCkv+CkpOCkq+Ckv+CksuCljeCkruCkruClgeCkluCljeCkr+CkheCkmuCljeCkm+CkvuCkm+ClguCkn+CkpOClgOCkuOCkguCkl+ClgOCkpOCknOCkvuCkj+Ckl+CkvuCkteCkv+CkreCkvuCkl+CkmOCko+CljeCkn+Clh+CkpuClguCkuOCksOClh+CkpuCkv+CkqOCli+CkguCkueCkpOCljeCkr+CkvuCkuOClh+CkleCljeCkuOCkl+CkvuCkguCkp+ClgOCkteCkv+CktuCljeCkteCksOCkvuCkpOClh+CkguCkpuCliOCkn+CljeCkuOCkqOCkleCljeCktuCkvuCkuOCkvuCkruCkqOClh+CkheCkpuCkvuCksuCkpOCkrOCkv+CknOCksuClgOCkquClgeCksOClguCkt+CkueCkv+CkguCkpuClgOCkruCkv+CkpOCljeCksOCkleCkteCkv+CkpOCkvuCksOClgeCkquCkr+Clh+CkuOCljeCkpeCkvuCkqOCkleCksOCli+CkoeCkvOCkruClgeCkleCljeCkpOCkr+Cli+CknOCkqOCkvuCkleClg+CkquCkr+CkvuCkquCli+CkuOCljeCkn+CkmOCksOClh+CksuClguCkleCkvuCksOCljeCkr+CkteCkv+CkmuCkvuCksOCkuOClguCkmuCkqOCkvuCkruClguCksuCljeCkr+CkpuClh+CkluClh+CkguCkueCkruClh+CktuCkvuCkuOCljeCkleClguCksuCkruCliOCkguCkqOClh+CkpOCliOCkr+CkvuCksOCknOCkv+CkuOCkleClh3Jzcyt4bWwiIHRpdGxlPSItdHlwZSIgY29udGVudD0idGl0bGUiIGNvbnRlbnQ9ImF0IHRoZSBzYW1lIHRpbWUuanMiPjwvc2NyaXB0Pgo8IiBtZXRob2Q9InBvc3QiIDwvc3Bhbj48L2E+PC9saT52ZXJ0aWNhbC1hbGlnbjp0L2pxdWVyeS5taW4uanMiPi5jbGljayhmdW5jdGlvbiggc3R5bGU9InBhZGRpbmctfSkoKTsKPC9zY3JpcHQ+Cjwvc3Bhbj48YSBocmVmPSI8YSBocmVmPSJodHRwOi8vKTsgcmV0dXJuIGZhbHNlO3RleHQtZGVjb3JhdGlvbjogc2Nyb2xsaW5nPSJubyIgYm9yZGVyLWNvbGxhcHNlOmFzc29jaWF0ZWQgd2l0aCBCYWhhc2EgSW5kb25lc2lhRW5nbGlzaCBsYW5ndWFnZTx0ZXh0IHhtbDpzcGFjZT0uZ2lmIiBib3JkZXI9IjAiPC9ib2R5Pgo8L2h0bWw+Cm92ZXJmbG93OmhpZGRlbjtpbWcgc3JjPSJodHRwOi8vYWRkRXZlbnRMaXN0ZW5lcnJlc3BvbnNpYmxlIGZvciBzLmpzIj48L3NjcmlwdD4KL2Zhdmljb24uaWNvIiAvPm9wZXJhdGluZyBzeXN0ZW0iIHN0eWxlPSJ3aWR0aDoxdGFyZ2V0PSJfYmxhbmsiPlN0YXRlIFVuaXZlcnNpdHl0ZXh0LWFsaWduOmxlZnQ7CmRvY3VtZW50LndyaXRlKCwgaW5jbHVkaW5nIHRoZSBhcm91bmQgdGhlIHdvcmxkKTsNCjwvc2NyaXB0Pg0KPCIgc3R5bGU9ImhlaWdodDo7b3ZlcmZsb3c6aGlkZGVubW9yZSBpbmZvcm1hdGlvbmFuIGludGVybmF0aW9uYWxhIG1lbWJlciBvZiB0aGUgb25lIG9mIHRoZSBmaXJzdGNhbiBiZSBmb3VuZCBpbiA8L2Rpdj4KCQk8L2Rpdj4KZGlzcGxheTogbm9uZTsiPiIgLz4KPGxpbmsgcmVsPSIKICAoZnVuY3Rpb24oKSB7dGhlIDE1dGggY2VudHVyeS5wcmV2ZW50RGVmYXVsdChsYXJnZSBudW1iZXIgb2YgQnl6YW50aW5lIEVtcGlyZS5qcGd8dGh1bWJ8bGVmdHx2YXN0IG1ham9yaXR5IG9mbWFqb3JpdHkgb2YgdGhlICBhbGlnbj0iY2VudGVyIj5Vbml2ZXJzaXR5IFByZXNzZG9taW5hdGVkIGJ5IHRoZVNlY29uZCBXb3JsZCBXYXJkaXN0cmlidXRpb24gb2Ygc3R5bGU9InBvc2l0aW9uOnRoZSByZXN0IG9mIHRoZSBjaGFyYWN0ZXJpemVkIGJ5IHJlbD0ibm9mb2xsb3ciPmRlcml2ZXMgZnJvbSB0aGVyYXRoZXIgdGhhbiB0aGUgYSBjb21iaW5hdGlvbiBvZnN0eWxlPSJ3aWR0aDoxMDBFbmdsaXNoLXNwZWFraW5nY29tcHV0ZXIgc2NpZW5jZWJvcmRlcj0iMCIgYWx0PSJ0aGUgZXhpc3RlbmNlIG9mRGVtb2NyYXRpYyBQYXJ0eSIgc3R5bGU9Im1hcmdpbi1Gb3IgdGhpcyByZWFzb24sLmpzIj48L3NjcmlwdD4KCXNCeVRhZ05hbWUocylbMF1qcyI+PC9zY3JpcHQ+DQo8LmpzIj48L3NjcmlwdD4NCmxpbmsgcmVsPSJpY29uIiAnIGFsdD0nJyBjbGFzcz0nZm9ybWF0aW9uIG9mIHRoZXZlcnNpb25zIG9mIHRoZSA8L2E+PC9kaXY+PC9kaXY+L3BhZ2U+CiAgPHBhZ2U+CjxkaXYgY2xhc3M9ImNvbnRiZWNhbWUgdGhlIGZpcnN0YmFoYXNhIEluZG9uZXNpYWVuZ2xpc2ggKHNpbXBsZSnOlc67zrvOt869zrnOus6s0YXRgNCy0LDRgtGB0LrQuNC60L7QvNC/0LDQvdC40LjRj9Cy0LvRj9C10YLRgdGP0JTQvtCx0LDQstC40YLRjNGH0LXQu9C+0LLQtdC60LDRgNCw0LfQstC40YLQuNGP0JjQvdGC0LXRgNC90LXRgtCe0YLQstC10YLQuNGC0YzQvdCw0L/RgNC40LzQtdGA0LjQvdGC0LXRgNC90LXRgtC60L7RgtC+0YDQvtCz0L7RgdGC0YDQsNC90LjRhtGL0LrQsNGH0LXRgdGC0LLQtdGD0YHQu9C+0LLQuNGP0YXQv9GA0L7QsdC70LXQvNGL0L/QvtC70YPRh9C40YLRjNGP0LLQu9GP0Y7RgtGB0Y/QvdCw0LjQsdC+0LvQtdC10LrQvtC80L/QsNC90LjRj9Cy0L3QuNC80LDQvdC40LXRgdGA0LXQtNGB0YLQstCw2KfZhNmF2YjYp9i22YrYudin2YTYsdim2YrYs9mK2KnYp9mE2KfZhtiq2YLYp9mE2YXYtNin2LHZg9in2KrZg9in2YTYs9mK2KfYsdin2KrYp9mE2YXZg9iq2YjYqNip2KfZhNiz2LnZiNiv2YrYqdin2K3Ytdin2KbZitin2KrYp9mE2LnYp9mE2YXZitip2KfZhNi12YjYqtmK2KfYqtin2YTYp9mG2KrYsdmG2KrYp9mE2KrYtdin2YXZitmF2KfZhNil2LPZhNin2YXZitin2YTZhdi02KfYsdmD2KnYp9mE2YXYsdim2YrYp9iqcm9ib3RzIiBjb250ZW50PSI8ZGl2IGlkPSJmb290ZXIiPnRoZSBVbml0ZWQgU3RhdGVzPGltZyBzcmM9Imh0dHA6Ly8uanBnfHJpZ2h0fHRodW1ifC5qcyI+PC9zY3JpcHQ+DQo8bG9jYXRpb24ucHJvdG9jb2xmcmFtZWJvcmRlcj0iMCIgcyIgLz4KPG1ldGEgbmFtZT0iPC9hPjwvZGl2PjwvZGl2Pjxmb250LXdlaWdodDpib2xkOyZxdW90OyBhbmQgJnF1b3Q7ZGVwZW5kaW5nIG9uIHRoZSBtYXJnaW46MDtwYWRkaW5nOiIgcmVsPSJub2ZvbGxvdyIgUHJlc2lkZW50IG9mIHRoZSB0d2VudGlldGggY2VudHVyeWV2aXNpb24+CiAgPC9wYWdlSW50ZXJuZXQgRXhwbG9yZXJhLmFzeW5jID0gdHJ1ZTsNCmluZm9ybWF0aW9uIGFib3V0PGRpdiBpZD0iaGVhZGVyIj4iIGFjdGlvbj0iaHR0cDovLzxhIGhyZWY9Imh0dHBzOi8vPGRpdiBpZD0iY29udGVudCI8L2Rpdj4NCjwvZGl2Pg0KPGRlcml2ZWQgZnJvbSB0aGUgPGltZyBzcmM9J2h0dHA6Ly9hY2NvcmRpbmcgdG8gdGhlIAo8L2JvZHk+CjwvaHRtbD4Kc3R5bGU9ImZvbnQtc2l6ZTpzY3JpcHQgbGFuZ3VhZ2U9IkFyaWFsLCBIZWx2ZXRpY2EsPC9hPjxzcGFuIGNsYXNzPSI8L3NjcmlwdD48c2NyaXB0IHBvbGl0aWNhbCBwYXJ0aWVzdGQ+PC90cj48L3RhYmxlPjxocmVmPSJodHRwOi8vd3d3LmludGVycHJldGF0aW9uIG9mcmVsPSJzdHlsZXNoZWV0IiBkb2N1bWVudC53cml0ZSgnPGNoYXJzZXQ9InV0Zi04Ij4KYmVnaW5uaW5nIG9mIHRoZSByZXZlYWxlZCB0aGF0IHRoZXRlbGV2aXNpb24gc2VyaWVzIiByZWw9Im5vZm9sbG93Ij4gdGFyZ2V0PSJfYmxhbmsiPmNsYWltaW5nIHRoYXQgdGhlaHR0cCUzQSUyRiUyRnd3dy5tYW5pZmVzdGF0aW9ucyBvZlByaW1lIE1pbmlzdGVyIG9maW5mbHVlbmNlZCBieSB0aGVjbGFzcz0iY2xlYXJmaXgiPi9kaXY+DQo8L2Rpdj4NCg0KdGhyZWUtZGltZW5zaW9uYWxDaHVyY2ggb2YgRW5nbGFuZG9mIE5vcnRoIENhcm9saW5hc3F1YXJlIGtpbG9tZXRyZXMuYWRkRXZlbnRMaXN0ZW5lcmRpc3RpbmN0IGZyb20gdGhlY29tbW9ubHkga25vd24gYXNQaG9uZXRpYyBBbHBoYWJldGRlY2xhcmVkIHRoYXQgdGhlY29udHJvbGxlZCBieSB0aGVCZW5qYW1pbiBGcmFua2xpbnJvbGUtcGxheWluZyBnYW1ldGhlIFVuaXZlcnNpdHkgb2ZpbiBXZXN0ZXJuIEV1cm9wZXBlcnNvbmFsIGNvbXB1dGVyUHJvamVjdCBHdXRlbmJlcmdyZWdhcmRsZXNzIG9mIHRoZWhhcyBiZWVuIHByb3Bvc2VkdG9nZXRoZXIgd2l0aCB0aGU+PC9saT48bGkgY2xhc3M9ImluIHNvbWUgY291bnRyaWVzbWluLmpzIj48L3NjcmlwdD5vZiB0aGUgcG9wdWxhdGlvbm9mZmljaWFsIGxhbmd1YWdlPGltZyBzcmM9ImltYWdlcy9pZGVudGlmaWVkIGJ5IHRoZW5hdHVyYWwgcmVzb3VyY2VzY2xhc3NpZmljYXRpb24gb2ZjYW4gYmUgY29uc2lkZXJlZHF1YW50dW0gbWVjaGFuaWNzTmV2ZXJ0aGVsZXNzLCB0aGVtaWxsaW9uIHllYXJzIGFnbzwvYm9keT4NCjwvaHRtbD4NzpXOu867zrfOvc65zrrOrAp0YWtlIGFkdmFudGFnZSBvZmFuZCwgYWNjb3JkaW5nIHRvYXR0cmlidXRlZCB0byB0aGVNaWNyb3NvZnQgV2luZG93c3RoZSBmaXJzdCBjZW50dXJ5dW5kZXIgdGhlIGNvbnRyb2xkaXYgY2xhc3M9ImhlYWRlcnNob3J0bHkgYWZ0ZXIgdGhlbm90YWJsZSBleGNlcHRpb250ZW5zIG9mIHRob3VzYW5kc3NldmVyYWwgZGlmZmVyZW50YXJvdW5kIHRoZSB3b3JsZC5yZWFjaGluZyBtaWxpdGFyeWlzb2xhdGVkIGZyb20gdGhlb3Bwb3NpdGlvbiB0byB0aGV0aGUgT2xkIFRlc3RhbWVudEFmcmljYW4gQW1lcmljYW5zaW5zZXJ0ZWQgaW50byB0aGVzZXBhcmF0ZSBmcm9tIHRoZW1ldHJvcG9saXRhbiBhcmVhbWFrZXMgaXQgcG9zc2libGVhY2tub3dsZWRnZWQgdGhhdGFyZ3VhYmx5IHRoZSBtb3N0dHlwZT0idGV4dC9jc3MiPgp0aGUgSW50ZXJuYXRpb25hbEFjY29yZGluZyB0byB0aGUgcGU9InRleHQvY3NzIiAvPgpjb2luY2lkZSB3aXRoIHRoZXR3by10aGlyZHMgb2YgdGhlRHVyaW5nIHRoaXMgdGltZSxkdXJpbmcgdGhlIHBlcmlvZGFubm91bmNlZCB0aGF0IGhldGhlIGludGVybmF0aW9uYWxhbmQgbW9yZSByZWNlbnRseWJlbGlldmVkIHRoYXQgdGhlY29uc2Npb3VzbmVzcyBhbmRmb3JtZXJseSBrbm93biBhc3N1cnJvdW5kZWQgYnkgdGhlZmlyc3QgYXBwZWFyZWQgaW5vY2Nhc2lvbmFsbHkgdXNlZHBvc2l0aW9uOmFic29sdXRlOyIgdGFyZ2V0PSJfYmxhbmsiIHBvc2l0aW9uOnJlbGF0aXZlO3RleHQtYWxpZ246Y2VudGVyO2pheC9saWJzL2pxdWVyeS8xLmJhY2tncm91bmQtY29sb3I6I3R5cGU9ImFwcGxpY2F0aW9uL2FuZ3VhZ2UiIGNvbnRlbnQ9IjxtZXRhIGh0dHAtZXF1aXY9IlByaXZhY3kgUG9saWN5PC9hPmUoIiUzQ3NjcmlwdCBzcmM9JyIgdGFyZ2V0PSJfYmxhbmsiPk9uIHRoZSBvdGhlciBoYW5kLC5qcGd8dGh1bWJ8cmlnaHR8MjwvZGl2PjxkaXYgY2xhc3M9IjxkaXYgc3R5bGU9ImZsb2F0Om5pbmV0ZWVudGggY2VudHVyeTwvYm9keT4NCjwvaHRtbD4NCjxpbWcgc3JjPSJodHRwOi8vczt0ZXh0LWFsaWduOmNlbnRlcmZvbnQtd2VpZ2h0OiBib2xkOyBBY2NvcmRpbmcgdG8gdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiIgZnJhbWVib3JkZXI9IjAiICIgc3R5bGU9InBvc2l0aW9uOmxpbmsgaHJlZj0iaHR0cDovL2h0bWw0L2xvb3NlLmR0ZCI+CmR1cmluZyB0aGlzIHBlcmlvZDwvdGQ+PC90cj48L3RhYmxlPmNsb3NlbHkgcmVsYXRlZCB0b2ZvciB0aGUgZmlyc3QgdGltZTtmb250LXdlaWdodDpib2xkO2lucHV0IHR5cGU9InRleHQiIDxzcGFuIHN0eWxlPSJmb250LW9ucmVhZHlzdGF0ZWNoYW5nZQk8ZGl2IGNsYXNzPSJjbGVhcmRvY3VtZW50LmxvY2F0aW9uLiBGb3IgZXhhbXBsZSwgdGhlIGEgd2lkZSB2YXJpZXR5IG9mIDwhRE9DVFlQRSBodG1sPg0KPCZuYnNwOyZuYnNwOyZuYnNwOyI+PGEgaHJlZj0iaHR0cDovL3N0eWxlPSJmbG9hdDpsZWZ0O2NvbmNlcm5lZCB3aXRoIHRoZT1odHRwJTNBJTJGJTJGd3d3LmluIHBvcHVsYXIgY3VsdHVyZXR5cGU9InRleHQvY3NzIiAvPml0IGlzIHBvc3NpYmxlIHRvIEhhcnZhcmQgVW5pdmVyc2l0eXR5bGVzaGVldCIgaHJlZj0iL3RoZSBtYWluIGNoYXJhY3Rlck94Zm9yZCBVbml2ZXJzaXR5ICBuYW1lPSJrZXl3b3JkcyIgY3N0eWxlPSJ0ZXh0LWFsaWduOnRoZSBVbml0ZWQgS2luZ2RvbWZlZGVyYWwgZ292ZXJubWVudDxkaXYgc3R5bGU9Im1hcmdpbiBkZXBlbmRpbmcgb24gdGhlIGRlc2NyaXB0aW9uIG9mIHRoZTxkaXYgY2xhc3M9ImhlYWRlci5taW4uanMiPjwvc2NyaXB0PmRlc3RydWN0aW9uIG9mIHRoZXNsaWdodGx5IGRpZmZlcmVudGluIGFjY29yZGFuY2Ugd2l0aHRlbGVjb21tdW5pY2F0aW9uc2luZGljYXRlcyB0aGF0IHRoZXNob3J0bHkgdGhlcmVhZnRlcmVzcGVjaWFsbHkgaW4gdGhlIEV1cm9wZWFuIGNvdW50cmllc0hvd2V2ZXIsIHRoZXJlIGFyZXNyYz0iaHR0cDovL3N0YXRpY3N1Z2dlc3RlZCB0aGF0IHRoZSIgc3JjPSJodHRwOi8vd3d3LmEgbGFyZ2UgbnVtYmVyIG9mIFRlbGVjb21tdW5pY2F0aW9ucyIgcmVsPSJub2ZvbGxvdyIgdEhvbHkgUm9tYW4gRW1wZXJvcmFsbW9zdCBleGNsdXNpdmVseSIgYm9yZGVyPSIwIiBhbHQ9IlNlY3JldGFyeSBvZiBTdGF0ZWN1bG1pbmF0aW5nIGluIHRoZUNJQSBXb3JsZCBGYWN0Ym9va3RoZSBtb3N0IGltcG9ydGFudGFubml2ZXJzYXJ5IG9mIHRoZXN0eWxlPSJiYWNrZ3JvdW5kLTxsaT48ZW0+PGEgaHJlZj0iL3RoZSBBdGxhbnRpYyBPY2VhbnN0cmljdGx5IHNwZWFraW5nLHNob3J0bHkgYmVmb3JlIHRoZWRpZmZlcmVudCB0eXBlcyBvZnRoZSBPdHRvbWFuIEVtcGlyZT48aW1nIHNyYz0iaHR0cDovL0FuIEludHJvZHVjdGlvbiB0b2NvbnNlcXVlbmNlIG9mIHRoZWRlcGFydHVyZSBmcm9tIHRoZUNvbmZlZGVyYXRlIFN0YXRlc2luZGlnZW5vdXMgcGVvcGxlc1Byb2NlZWRpbmdzIG9mIHRoZWluZm9ybWF0aW9uIG9uIHRoZXRoZW9yaWVzIGhhdmUgYmVlbmludm9sdmVtZW50IGluIHRoZWRpdmlkZWQgaW50byB0aHJlZWFkamFjZW50IGNvdW50cmllc2lzIHJlc3BvbnNpYmxlIGZvcmRpc3NvbHV0aW9uIG9mIHRoZWNvbGxhYm9yYXRpb24gd2l0aHdpZGVseSByZWdhcmRlZCBhc2hpcyBjb250ZW1wb3Jhcmllc2ZvdW5kaW5nIG1lbWJlciBvZkRvbWluaWNhbiBSZXB1YmxpY2dlbmVyYWxseSBhY2NlcHRlZHRoZSBwb3NzaWJpbGl0eSBvZmFyZSBhbHNvIGF2YWlsYWJsZXVuZGVyIGNvbnN0cnVjdGlvbnJlc3RvcmF0aW9uIG9mIHRoZXRoZSBnZW5lcmFsIHB1YmxpY2lzIGFsbW9zdCBlbnRpcmVseXBhc3NlcyB0aHJvdWdoIHRoZWhhcyBiZWVuIHN1Z2dlc3RlZGNvbXB1dGVyIGFuZCB2aWRlb0dlcm1hbmljIGxhbmd1YWdlcyBhY2NvcmRpbmcgdG8gdGhlIGRpZmZlcmVudCBmcm9tIHRoZXNob3J0bHkgYWZ0ZXJ3YXJkc2hyZWY9Imh0dHBzOi8vd3d3LnJlY2VudCBkZXZlbG9wbWVudEJvYXJkIG9mIERpcmVjdG9yczxkaXYgY2xhc3M9InNlYXJjaHwgPGEgaHJlZj0iaHR0cDovL0luIHBhcnRpY3VsYXIsIHRoZU11bHRpcGxlIGZvb3Rub3Rlc29yIG90aGVyIHN1YnN0YW5jZXRob3VzYW5kcyBvZiB5ZWFyc3RyYW5zbGF0aW9uIG9mIHRoZTwvZGl2Pg0KPC9kaXY+DQoNCjxhIGhyZWY9ImluZGV4LnBocHdhcyBlc3RhYmxpc2hlZCBpbm1pbi5qcyI+PC9zY3JpcHQ+CnBhcnRpY2lwYXRlIGluIHRoZWEgc3Ryb25nIGluZmx1ZW5jZXN0eWxlPSJtYXJnaW4tdG9wOnJlcHJlc2VudGVkIGJ5IHRoZWdyYWR1YXRlZCBmcm9tIHRoZVRyYWRpdGlvbmFsbHksIHRoZUVsZW1lbnQoInNjcmlwdCIpO0hvd2V2ZXIsIHNpbmNlIHRoZS9kaXY+CjwvZGl2Pgo8ZGl2IGxlZnQ7IG1hcmdpbi1sZWZ0OnByb3RlY3Rpb24gYWdhaW5zdDA7IHZlcnRpY2FsLWFsaWduOlVuZm9ydHVuYXRlbHksIHRoZXR5cGU9ImltYWdlL3gtaWNvbi9kaXY+CjxkaXYgY2xhc3M9IiBjbGFzcz0iY2xlYXJmaXgiPjxkaXYgY2xhc3M9ImZvb3RlcgkJPC9kaXY+CgkJPC9kaXY+CnRoZSBtb3Rpb24gcGljdHVyZdCR0YrQu9Cz0LDRgNGB0LrQuNCx0YrQu9Cz0LDRgNGB0LrQuNCk0LXQtNC10YDQsNGG0LjQuNC90LXRgdC60L7Qu9GM0LrQvtGB0L7QvtCx0YnQtdC90LjQtdGB0L7QvtCx0YnQtdC90LjRj9C/0YDQvtCz0YDQsNC80LzRi9Ce0YLQv9GA0LDQstC40YLRjNCx0LXRgdC/0LvQsNGC0L3QvtC80LDRgtC10YDQuNCw0LvRi9C/0L7Qt9Cy0L7Qu9GP0LXRgtC/0L7RgdC70LXQtNC90LjQtdGA0LDQt9C70LjRh9C90YvRhdC/0YDQvtC00YPQutGG0LjQuNC/0YDQvtCz0YDQsNC80LzQsNC/0L7Qu9C90L7RgdGC0YzRjtC90LDRhdC+0LTQuNGC0YHRj9C40LfQsdGA0LDQvdC90L7QtdC90LDRgdC10LvQtdC90LjRj9C40LfQvNC10L3QtdC90LjRj9C60LDRgtC10LPQvtGA0LjQuNCQ0LvQtdC60YHQsNC90LTRgOCkpuCljeCkteCkvuCksOCkvuCkruCliOCkqOClgeCkheCksuCkquCljeCksOCkpuCkvuCkqOCkreCkvuCksOCkpOClgOCkr+CkheCkqOClgeCkpuClh+CktuCkueCkv+CkqOCljeCkpuClgOCkh+CkguCkoeCkv+Ckr+CkvuCkpuCkv+CksuCljeCksuClgOCkheCkp+Ckv+CkleCkvuCksOCkteClgOCkoeCkv+Ckr+Cli+CkmuCkv+Ckn+CljeCkoOClh+CkuOCkruCkvuCkmuCkvuCksOCknOCkguCkleCljeCktuCkqOCkpuClgeCkqOCkv+Ckr+CkvuCkquCljeCksOCkr+Cli+Ckl+CkheCkqOClgeCkuOCkvuCksOCkkeCkqOCksuCkvuCkh+CkqOCkquCkvuCksOCljeCkn+ClgOCktuCksOCljeCkpOCli+CkguCksuCli+CkleCkuOCkreCkvuCkq+CkvOCljeCksuCliOCktuCktuCksOCljeCkpOClh+CkguCkquCljeCksOCkpuClh+CktuCkquCljeCksuClh+Ckr+CksOCkleClh+CkguCkpuCljeCksOCkuOCljeCkpeCkv+CkpOCkv+CkieCkpOCljeCkquCkvuCkpuCkieCkqOCljeCkueClh+CkguCkmuCkv+Ckn+CljeCkoOCkvuCkr+CkvuCkpOCljeCksOCkvuCknOCljeCkr+CkvuCkpuCkvuCkquClgeCksOCkvuCkqOClh+CknOCli+CkoeCkvOClh+CkguCkheCkqOClgeCkteCkvuCkpuCktuCljeCksOClh+Cko+ClgOCktuCkv+CkleCljeCkt+CkvuCkuOCksOCkleCkvuCksOClgOCkuOCkguCkl+CljeCksOCkueCkquCksOCkv+Cko+CkvuCkruCkrOCljeCksOCkvuCkguCkoeCkrOCkmuCljeCkmuCli+CkguCkieCkquCksuCkrOCljeCkp+CkruCkguCkpOCljeCksOClgOCkuOCkguCkquCksOCljeCkleCkieCkruCljeCkruClgOCkpuCkruCkvuCkp+CljeCkr+CkruCkuOCkueCkvuCkr+CkpOCkvuCktuCkrOCljeCkpuCli+CkguCkruClgOCkoeCkv+Ckr+CkvuCkhuCkiOCkquClgOCkj+CksuCkruCli+CkrOCkvuCkh+CksuCkuOCkguCkluCljeCkr+CkvuCkhuCkquCksOClh+CktuCkqOCkheCkqOClgeCkrOCkguCkp+CkrOCkvuCknOCkvOCkvuCksOCkqOCkteClgOCkqOCkpOCkruCkquCljeCksOCkruClgeCkluCkquCljeCksOCktuCljeCkqOCkquCksOCkv+CkteCkvuCksOCkqOClgeCkleCkuOCkvuCkqOCkuOCkruCksOCljeCkpeCkqOCkhuCkr+Cli+CknOCkv+CkpOCkuOCli+CkruCkteCkvuCksNin2YTZhdi02KfYsdmD2KfYqtin2YTZhdmG2KrYr9mK2KfYqtin2YTZg9mF2KjZitmI2KrYsdin2YTZhdi02KfZh9iv2KfYqti52K/Yr9in2YTYstmI2KfYsdi52K/Yr9in2YTYsdiv2YjYr9in2YTYpdiz2YTYp9mF2YrYqdin2YTZgdmI2KrZiNi02YjYqNin2YTZhdiz2KfYqNmC2KfYqtin2YTZhdi52YTZiNmF2KfYqtin2YTZhdiz2YTYs9mE2KfYqtin2YTYrNix2KfZgdmK2YPYs9in2YTYp9iz2YTYp9mF2YrYqdin2YTYp9iq2LXYp9mE2KfYqmtleXdvcmRzIiBjb250ZW50PSJ3My5vcmcvMTk5OS94aHRtbCI+PGEgdGFyZ2V0PSJfYmxhbmsiIHRleHQvaHRtbDsgY2hhcnNldD0iIHRhcmdldD0iX2JsYW5rIj48dGFibGUgY2VsbHBhZGRpbmc9ImF1dG9jb21wbGV0ZT0ib2ZmIiB0ZXh0LWFsaWduOiBjZW50ZXI7dG8gbGFzdCB2ZXJzaW9uIGJ5IGJhY2tncm91bmQtY29sb3I6ICMiIGhyZWY9Imh0dHA6Ly93d3cuL2Rpdj48L2Rpdj48ZGl2IGlkPTxhIGhyZWY9IiMiIGNsYXNzPSIiPjxpbWcgc3JjPSJodHRwOi8vY3JpcHQiIHNyYz0iaHR0cDovLwo8c2NyaXB0IGxhbmd1YWdlPSIvL0VOIiAiaHR0cDovL3d3dy53ZW5jb2RlVVJJQ29tcG9uZW50KCIgaHJlZj0iamF2YXNjcmlwdDo8ZGl2IGNsYXNzPSJjb250ZW50ZG9jdW1lbnQud3JpdGUoJzxzY3Bvc2l0aW9uOiBhYnNvbHV0ZTtzY3JpcHQgc3JjPSJodHRwOi8vIHN0eWxlPSJtYXJnaW4tdG9wOi5taW4uanMiPjwvc2NyaXB0Pgo8L2Rpdj4KPGRpdiBjbGFzcz0idzMub3JnLzE5OTkveGh0bWwiIAoNCjwvYm9keT4NCjwvaHRtbD5kaXN0aW5jdGlvbiBiZXR3ZWVuLyIgdGFyZ2V0PSJfYmxhbmsiPjxsaW5rIGhyZWY9Imh0dHA6Ly9lbmNvZGluZz0idXRmLTgiPz4Kdy5hZGRFdmVudExpc3RlbmVyP2FjdGlvbj0iaHR0cDovL3d3dy5pY29uIiBocmVmPSJodHRwOi8vIHN0eWxlPSJiYWNrZ3JvdW5kOnR5cGU9InRleHQvY3NzIiAvPgptZXRhIHByb3BlcnR5PSJvZzp0PGlucHV0IHR5cGU9InRleHQiICBzdHlsZT0idGV4dC1hbGlnbjp0aGUgZGV2ZWxvcG1lbnQgb2YgdHlsZXNoZWV0IiB0eXBlPSJ0ZWh0bWw7IGNoYXJzZXQ9dXRmLThpcyBjb25zaWRlcmVkIHRvIGJldGFibGUgd2lkdGg9IjEwMCUiIEluIGFkZGl0aW9uIHRvIHRoZSBjb250cmlidXRlZCB0byB0aGUgZGlmZmVyZW5jZXMgYmV0d2VlbmRldmVsb3BtZW50IG9mIHRoZSBJdCBpcyBpbXBvcnRhbnQgdG8gPC9zY3JpcHQ+Cgo8c2NyaXB0ICBzdHlsZT0iZm9udC1zaXplOjE+PC9zcGFuPjxzcGFuIGlkPWdiTGlicmFyeSBvZiBDb25ncmVzczxpbWcgc3JjPSJodHRwOi8vaW1FbmdsaXNoIHRyYW5zbGF0aW9uQWNhZGVteSBvZiBTY2llbmNlc2RpdiBzdHlsZT0iZGlzcGxheTpjb25zdHJ1Y3Rpb24gb2YgdGhlLmdldEVsZW1lbnRCeUlkKGlkKWluIGNvbmp1bmN0aW9uIHdpdGhFbGVtZW50KCdzY3JpcHQnKTsgPG1ldGEgcHJvcGVydHk9Im9nOtCR0YrQu9Cz0LDRgNGB0LrQuAogdHlwZT0idGV4dCIgbmFtZT0iPlByaXZhY3kgUG9saWN5PC9hPmFkbWluaXN0ZXJlZCBieSB0aGVlbmFibGVTaW5nbGVSZXF1ZXN0c3R5bGU9JnF1b3Q7bWFyZ2luOjwvZGl2PjwvZGl2PjwvZGl2Pjw+PGltZyBzcmM9Imh0dHA6Ly9pIHN0eWxlPSZxdW90O2Zsb2F0OnJlZmVycmVkIHRvIGFzIHRoZSB0b3RhbCBwb3B1bGF0aW9uIG9maW4gV2FzaGluZ3RvbiwgRC5DLiBzdHlsZT0iYmFja2dyb3VuZC1hbW9uZyBvdGhlciB0aGluZ3Msb3JnYW5pemF0aW9uIG9mIHRoZXBhcnRpY2lwYXRlZCBpbiB0aGV0aGUgaW50cm9kdWN0aW9uIG9maWRlbnRpZmllZCB3aXRoIHRoZWZpY3Rpb25hbCBjaGFyYWN0ZXIgT3hmb3JkIFVuaXZlcnNpdHkgbWlzdW5kZXJzdGFuZGluZyBvZlRoZXJlIGFyZSwgaG93ZXZlcixzdHlsZXNoZWV0IiBocmVmPSIvQ29sdW1iaWEgVW5pdmVyc2l0eWV4cGFuZGVkIHRvIGluY2x1ZGV1c3VhbGx5IHJlZmVycmVkIHRvaW5kaWNhdGluZyB0aGF0IHRoZWhhdmUgc3VnZ2VzdGVkIHRoYXRhZmZpbGlhdGVkIHdpdGggdGhlY29ycmVsYXRpb24gYmV0d2Vlbm51bWJlciBvZiBkaWZmZXJlbnQ+PC90ZD48L3RyPjwvdGFibGU+UmVwdWJsaWMgb2YgSXJlbGFuZAo8L3NjcmlwdD4KPHNjcmlwdCB1bmRlciB0aGUgaW5mbHVlbmNlY29udHJpYnV0aW9uIHRvIHRoZU9mZmljaWFsIHdlYnNpdGUgb2ZoZWFkcXVhcnRlcnMgb2YgdGhlY2VudGVyZWQgYXJvdW5kIHRoZWltcGxpY2F0aW9ucyBvZiB0aGVoYXZlIGJlZW4gZGV2ZWxvcGVkRmVkZXJhbCBSZXB1YmxpYyBvZmJlY2FtZSBpbmNyZWFzaW5nbHljb250aW51YXRpb24gb2YgdGhlTm90ZSwgaG93ZXZlciwgdGhhdHNpbWlsYXIgdG8gdGhhdCBvZiBjYXBhYmlsaXRpZXMgb2YgdGhlYWNjb3JkYW5jZSB3aXRoIHRoZXBhcnRpY2lwYW50cyBpbiB0aGVmdXJ0aGVyIGRldmVsb3BtZW50dW5kZXIgdGhlIGRpcmVjdGlvbmlzIG9mdGVuIGNvbnNpZGVyZWRoaXMgeW91bmdlciBicm90aGVyPC90ZD48L3RyPjwvdGFibGU+PGEgaHR0cC1lcXVpdj0iWC1VQS1waHlzaWNhbCBwcm9wZXJ0aWVzb2YgQnJpdGlzaCBDb2x1bWJpYWhhcyBiZWVuIGNyaXRpY2l6ZWQod2l0aCB0aGUgZXhjZXB0aW9ucXVlc3Rpb25zIGFib3V0IHRoZXBhc3NpbmcgdGhyb3VnaCB0aGUwIiBjZWxscGFkZGluZz0iMCIgdGhvdXNhbmRzIG9mIHBlb3BsZXJlZGlyZWN0cyBoZXJlLiBGb3JoYXZlIGNoaWxkcmVuIHVuZGVyJTNFJTNDL3NjcmlwdCUzRSIpKTs8YSBocmVmPSJodHRwOi8vd3d3LjxsaT48YSBocmVmPSJodHRwOi8vc2l0ZV9uYW1lIiBjb250ZW50PSJ0ZXh0LWRlY29yYXRpb246bm9uZXN0eWxlPSJkaXNwbGF5OiBub25lPG1ldGEgaHR0cC1lcXVpdj0iWC1uZXcgRGF0ZSgpLmdldFRpbWUoKSB0eXBlPSJpbWFnZS94LWljb24iPC9zcGFuPjxzcGFuIGNsYXNzPSJsYW5ndWFnZT0iamF2YXNjcmlwdHdpbmRvdy5sb2NhdGlvbi5ocmVmPGEgaHJlZj0iamF2YXNjcmlwdDotLT4NCjxzY3JpcHQgdHlwZT0idDxhIGhyZWY9J2h0dHA6Ly93d3cuaG9ydGN1dCBpY29uIiBocmVmPSI8L2Rpdj4NCjxkaXYgY2xhc3M9IjxzY3JpcHQgc3JjPSJodHRwOi8vIiByZWw9InN0eWxlc2hlZXQiIHQ8L2Rpdj4KPHNjcmlwdCB0eXBlPS9hPiA8YSBocmVmPSJodHRwOi8vIGFsbG93VHJhbnNwYXJlbmN5PSJYLVVBLUNvbXBhdGlibGUiIGNvbnJlbGF0aW9uc2hpcCBiZXR3ZWVuCjwvc2NyaXB0Pg0KPHNjcmlwdCA8L2E+PC9saT48L3VsPjwvZGl2PmFzc29jaWF0ZWQgd2l0aCB0aGUgcHJvZ3JhbW1pbmcgbGFuZ3VhZ2U8L2E+PGEgaHJlZj0iaHR0cDovLzwvYT48L2xpPjxsaSBjbGFzcz0iZm9ybSBhY3Rpb249Imh0dHA6Ly88ZGl2IHN0eWxlPSJkaXNwbGF5OnR5cGU9InRleHQiIG5hbWU9InEiPHRhYmxlIHdpZHRoPSIxMDAlIiBiYWNrZ3JvdW5kLXBvc2l0aW9uOiIgYm9yZGVyPSIwIiB3aWR0aD0icmVsPSJzaG9ydGN1dCBpY29uIiBoNj48dWw+PGxpPjxhIGhyZWY9IiAgPG1ldGEgaHR0cC1lcXVpdj0iY3NzIiBtZWRpYT0ic2NyZWVuIiByZXNwb25zaWJsZSBmb3IgdGhlICIgdHlwZT0iYXBwbGljYXRpb24vIiBzdHlsZT0iYmFja2dyb3VuZC1odG1sOyBjaGFyc2V0PXV0Zi04IiBhbGxvd3RyYW5zcGFyZW5jeT0ic3R5bGVzaGVldCIgdHlwZT0idGUNCjxtZXRhIGh0dHAtZXF1aXY9Ij48L3NwYW4+PHNwYW4gY2xhc3M9IjAiIGNlbGxzcGFjaW5nPSIwIj47Cjwvc2NyaXB0Pgo8c2NyaXB0IHNvbWV0aW1lcyBjYWxsZWQgdGhlZG9lcyBub3QgbmVjZXNzYXJpbHlGb3IgbW9yZSBpbmZvcm1hdGlvbmF0IHRoZSBiZWdpbm5pbmcgb2YgPCFET0NUWVBFIGh0bWw+PGh0bWxwYXJ0aWN1bGFybHkgaW4gdGhlIHR5cGU9ImhpZGRlbiIgbmFtZT0iamF2YXNjcmlwdDp2b2lkKDApOyJlZmZlY3RpdmVuZXNzIG9mIHRoZSBhdXRvY29tcGxldGU9Im9mZiIgZ2VuZXJhbGx5IGNvbnNpZGVyZWQ+PGlucHV0IHR5cGU9InRleHQiICI+PC9zY3JpcHQ+DQo8c2NyaXB0dGhyb3VnaG91dCB0aGUgd29ybGRjb21tb24gbWlzY29uY2VwdGlvbmFzc29jaWF0aW9uIHdpdGggdGhlPC9kaXY+CjwvZGl2Pgo8ZGl2IGNkdXJpbmcgaGlzIGxpZmV0aW1lLGNvcnJlc3BvbmRpbmcgdG8gdGhldHlwZT0iaW1hZ2UveC1pY29uIiBhbiBpbmNyZWFzaW5nIG51bWJlcmRpcGxvbWF0aWMgcmVsYXRpb25zYXJlIG9mdGVuIGNvbnNpZGVyZWRtZXRhIGNoYXJzZXQ9InV0Zi04IiA8aW5wdXQgdHlwZT0idGV4dCIgZXhhbXBsZXMgaW5jbHVkZSB0aGUiPjxpbWcgc3JjPSJodHRwOi8vaXBhcnRpY2lwYXRpb24gaW4gdGhldGhlIGVzdGFibGlzaG1lbnQgb2YKPC9kaXY+CjxkaXYgY2xhc3M9IiZhbXA7bmJzcDsmYW1wO25ic3A7dG8gZGV0ZXJtaW5lIHdoZXRoZXJxdWl0ZSBkaWZmZXJlbnQgZnJvbW1hcmtlZCB0aGUgYmVnaW5uaW5nZGlzdGFuY2UgYmV0d2VlbiB0aGVjb250cmlidXRpb25zIHRvIHRoZWNvbmZsaWN0IGJldHdlZW4gdGhld2lkZWx5IGNvbnNpZGVyZWQgdG93YXMgb25lIG9mIHRoZSBmaXJzdHdpdGggdmFyeWluZyBkZWdyZWVzaGF2ZSBzcGVjdWxhdGVkIHRoYXQoZG9jdW1lbnQuZ2V0RWxlbWVudHBhcnRpY2lwYXRpbmcgaW4gdGhlb3JpZ2luYWxseSBkZXZlbG9wZWRldGEgY2hhcnNldD0idXRmLTgiPiB0eXBlPSJ0ZXh0L2NzcyIgLz4KaW50ZXJjaGFuZ2VhYmx5IHdpdGhtb3JlIGNsb3NlbHkgcmVsYXRlZHNvY2lhbCBhbmQgcG9saXRpY2FsdGhhdCB3b3VsZCBvdGhlcndpc2VwZXJwZW5kaWN1bGFyIHRvIHRoZXN0eWxlIHR5cGU9InRleHQvY3NzdHlwZT0ic3VibWl0IiBuYW1lPSJmYW1pbGllcyByZXNpZGluZyBpbmRldmVsb3BpbmcgY291bnRyaWVzY29tcHV0ZXIgcHJvZ3JhbW1pbmdlY29ub21pYyBkZXZlbG9wbWVudGRldGVybWluYXRpb24gb2YgdGhlZm9yIG1vcmUgaW5mb3JtYXRpb25vbiBzZXZlcmFsIG9jY2FzaW9uc3BvcnR1Z3XDqnMgKEV1cm9wZXUp0KPQutGA0LDRl9C90YHRjNC60LDRg9C60YDQsNGX0L3RgdGM0LrQsNCg0L7RgdGB0LjQudGB0LrQvtC50LzQsNGC0LXRgNC40LDQu9C+0LLQuNC90YTQvtGA0LzQsNGG0LjQuNGD0L/RgNCw0LLQu9C10L3QuNGP0L3QtdC+0LHRhdC+0LTQuNC80L7QuNC90YTQvtGA0LzQsNGG0LjRj9CY0L3RhNC+0YDQvNCw0YbQuNGP0KDQtdGB0L/Rg9Cx0LvQuNC60LjQutC+0LvQuNGH0LXRgdGC0LLQvtC40L3RhNC+0YDQvNCw0YbQuNGO0YLQtdGA0YDQuNGC0L7RgNC40LjQtNC+0YHRgtCw0YLQvtGH0L3Qvtin2YTZhdiq2YjYp9is2K/ZiNmG2KfZhNin2LTYqtix2KfZg9in2KrYp9mE2KfZgtiq2LHYp9it2KfYqmh0bWw7IGNoYXJzZXQ9VVRGLTgiIHNldFRpbWVvdXQoZnVuY3Rpb24oKWRpc3BsYXk6aW5saW5lLWJsb2NrOzxpbnB1dCB0eXBlPSJzdWJtaXQiIHR5cGUgPSAndGV4dC9qYXZhc2NyaTxpbWcgc3JjPSJodHRwOi8vd3d3LiIgImh0dHA6Ly93d3cudzMub3JnL3Nob3J0Y3V0IGljb24iIGhyZWY9IiIgYXV0b2NvbXBsZXRlPSJvZmYiIDwvYT48L2Rpdj48ZGl2IGNsYXNzPTwvYT48L2xpPgo8bGkgY2xhc3M9ImNzcyIgdHlwZT0idGV4dC9jc3MiIDxmb3JtIGFjdGlvbj0iaHR0cDovL3h0L2NzcyIgaHJlZj0iaHR0cDovL2xpbmsgcmVsPSJhbHRlcm5hdGUiIA0KPHNjcmlwdCB0eXBlPSJ0ZXh0LyBvbmNsaWNrPSJqYXZhc2NyaXB0OihuZXcgRGF0ZSkuZ2V0VGltZSgpfWhlaWdodD0iMSIgd2lkdGg9IjEiIFBlb3BsZSdzIFJlcHVibGljIG9mICA8YSBocmVmPSJodHRwOi8vd3d3LnRleHQtZGVjb3JhdGlvbjp1bmRlcnRoZSBiZWdpbm5pbmcgb2YgdGhlIDwvZGl2Pgo8L2Rpdj4KPC9kaXY+CmVzdGFibGlzaG1lbnQgb2YgdGhlIDwvZGl2PjwvZGl2PjwvZGl2PjwvZCN2aWV3cG9ydHttaW4taGVpZ2h0Ogo8c2NyaXB0IHNyYz0iaHR0cDovL29wdGlvbj48b3B0aW9uIHZhbHVlPW9mdGVuIHJlZmVycmVkIHRvIGFzIC9vcHRpb24+CjxvcHRpb24gdmFsdTwhRE9DVFlQRSBodG1sPgo8IS0tW0ludGVybmF0aW9uYWwgQWlycG9ydD4KPGEgaHJlZj0iaHR0cDovL3d3dzwvYT48YSBocmVmPSJodHRwOi8vd+C4oOC4suC4qeC4suC5hOC4l+C4ouGDpeGDkOGDoOGDl+GDo+GDmuGDmOato+mrlOS4reaWhyAo57mB6auUKeCkqOCkv+CksOCljeCkpuClh+CktuCkoeCkvuCkieCkqOCksuCli+CkoeCkleCljeCkt+Clh+CkpOCljeCksOCknOCkvuCkqOCkleCkvuCksOClgOCkuOCkguCkrOCkguCkp+Ckv+CkpOCkuOCljeCkpeCkvuCkquCkqOCkvuCkuOCljeCkteClgOCkleCkvuCksOCkuOCkguCkuOCljeCkleCksOCko+CkuOCkvuCkruCkl+CljeCksOClgOCkmuCkv+Ckn+CljeCkoOCli+CkguCkteCkv+CknOCljeCknuCkvuCkqOCkheCkruClh+CksOCkv+CkleCkvuCkteCkv+CkreCkv+CkqOCljeCkqOCkl+CkvuCkoeCkv+Ckr+CkvuCkgeCkleCljeCkr+Cli+CkguCkleCkv+CkuOClgeCksOCkleCljeCkt+CkvuCkquCkueClgeCkgeCkmuCkpOClgOCkquCljeCksOCkrOCkguCkp+CkqOCkn+Ckv+CkquCljeCkquCko+ClgOCkleCljeCksOCkv+CkleClh+Ckn+CkquCljeCksOCkvuCksOCkguCkreCkquCljeCksOCkvuCkquCljeCkpOCkruCkvuCksuCkv+CkleCli+CkguCksOCkq+CkvOCljeCkpOCkvuCksOCkqOCkv+CksOCljeCkruCkvuCko+CksuCkv+CkruCkv+Ckn+Clh+CkoWRlc2NyaXB0aW9uIiBjb250ZW50PSJkb2N1bWVudC5sb2NhdGlvbi5wcm90LmdldEVsZW1lbnRzQnlUYWdOYW1lKDwhRE9DVFlQRSBodG1sPgo8aHRtbCA8bWV0YSBjaGFyc2V0PSJ1dGYtOCI+OnVybCIgY29udGVudD0iaHR0cDovLy5jc3MiIHJlbD0ic3R5bGVzaGVldCJzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+dHlwZT0idGV4dC9jc3MiIGhyZWY9InczLm9yZy8xOTk5L3hodG1sIiB4bWx0eXBlPSJ0ZXh0L2phdmFzY3JpcHQiIG1ldGhvZD0iZ2V0IiBhY3Rpb249ImxpbmsgcmVsPSJzdHlsZXNoZWV0IiAgPSBkb2N1bWVudC5nZXRFbGVtZW50dHlwZT0iaW1hZ2UveC1pY29uIiAvPmNlbGxwYWRkaW5nPSIwIiBjZWxsc3AuY3NzIiB0eXBlPSJ0ZXh0L2NzcyIgPC9hPjwvbGk+PGxpPjxhIGhyZWY9IiIgd2lkdGg9IjEiIGhlaWdodD0iMSIiPjxhIGhyZWY9Imh0dHA6Ly93d3cuc3R5bGU9ImRpc3BsYXk6bm9uZTsiPmFsdGVybmF0ZSIgdHlwZT0iYXBwbGktLy9XM0MvL0RURCBYSFRNTCAxLjAgZWxsc3BhY2luZz0iMCIgY2VsbHBhZCB0eXBlPSJoaWRkZW4iIHZhbHVlPSIvYT4mbmJzcDs8c3BhbiByb2xlPSJzCjxpbnB1dCB0eXBlPSJoaWRkZW4iIGxhbmd1YWdlPSJKYXZhU2NyaXB0IiAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCZz0iMCIgY2VsbHNwYWNpbmc9IjAiIHlwZT0idGV4dC9jc3MiIG1lZGlhPSJ0eXBlPSd0ZXh0L2phdmFzY3JpcHQnd2l0aCB0aGUgZXhjZXB0aW9uIG9mIHlwZT0idGV4dC9jc3MiIHJlbD0ic3QgaGVpZ2h0PSIxIiB3aWR0aD0iMSIgPScrZW5jb2RlVVJJQ29tcG9uZW50KDxsaW5rIHJlbD0iYWx0ZXJuYXRlIiAKYm9keSwgdHIsIGlucHV0LCB0ZXh0bWV0YSBuYW1lPSJyb2JvdHMiIGNvbm1ldGhvZD0icG9zdCIgYWN0aW9uPSI+CjxhIGhyZWY9Imh0dHA6Ly93d3cuY3NzIiByZWw9InN0eWxlc2hlZXQiIDwvZGl2PjwvZGl2PjxkaXYgY2xhc3NsYW5ndWFnZT0iamF2YXNjcmlwdCI+YXJpYS1oaWRkZW49InRydWUiPsK3PHJpcHQiIHR5cGU9InRleHQvamF2YXNsPTA7fSkoKTsKKGZ1bmN0aW9uKCl7YmFja2dyb3VuZC1pbWFnZTogdXJsKC9hPjwvbGk+PGxpPjxhIGhyZWY9ImgJCTxsaT48YSBocmVmPSJodHRwOi8vYXRvciIgYXJpYS1oaWRkZW49InRydT4gPGEgaHJlZj0iaHR0cDovL3d3dy5sYW5ndWFnZT0iamF2YXNjcmlwdCIgL29wdGlvbj4KPG9wdGlvbiB2YWx1ZS9kaXY+PC9kaXY+PGRpdiBjbGFzcz1yYXRvciIgYXJpYS1oaWRkZW49InRyZT0obmV3IERhdGUpLmdldFRpbWUoKXBvcnR1Z3XDqnMgKGRvIEJyYXNpbCnQvtGA0LPQsNC90LjQt9Cw0YbQuNC40LLQvtC30LzQvtC20L3QvtGB0YLRjNC+0LHRgNCw0LfQvtCy0LDQvdC40Y/RgNC10LPQuNGB0YLRgNCw0YbQuNC40LLQvtC30LzQvtC20L3QvtGB0YLQuNC+0LHRj9C30LDRgtC10LvRjNC90LA8IURPQ1RZUEUgaHRtbCBQVUJMSUMgIm50LVR5cGUiIGNvbnRlbnQ9InRleHQvPG1ldGEgaHR0cC1lcXVpdj0iQ29udGVyYW5zaXRpb25hbC8vRU4iICJodHRwOjxodG1sIHhtbG5zPSJodHRwOi8vd3d3LS8vVzNDLy9EVEQgWEhUTUwgMS4wIFREVEQveGh0bWwxLXRyYW5zaXRpb25hbC8vd3d3LnczLm9yZy9UUi94aHRtbDEvcGUgPSAndGV4dC9qYXZhc2NyaXB0Jzs8bWV0YSBuYW1lPSJkZXNjcmlwdGlvbnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlPGlucHV0IHR5cGU9ImhpZGRlbiIgbmFqcyIgdHlwZT0idGV4dC9qYXZhc2NyaShkb2N1bWVudCkucmVhZHkoZnVuY3Rpc2NyaXB0IHR5cGU9InRleHQvamF2YXNpbWFnZSIgY29udGVudD0iaHR0cDovL1VBLUNvbXBhdGlibGUiIGNvbnRlbnQ9dG1sOyBjaGFyc2V0PXV0Zi04IiAvPgpsaW5rIHJlbD0ic2hvcnRjdXQgaWNvbjxsaW5rIHJlbD0ic3R5bGVzaGVldCIgPC9zY3JpcHQ+CjxzY3JpcHQgdHlwZT09IGRvY3VtZW50LmNyZWF0ZUVsZW1lbjxhIHRhcmdldD0iX2JsYW5rIiBocmVmPSBkb2N1bWVudC5nZXRFbGVtZW50c0JpbnB1dCB0eXBlPSJ0ZXh0IiBuYW1lPWEudHlwZSA9ICd0ZXh0L2phdmFzY3JpbnB1dCB0eXBlPSJoaWRkZW4iIG5hbWVodG1sOyBjaGFyc2V0PXV0Zi04IiAvPmR0ZCI+CjxodG1sIHhtbG5zPSJodHRwLS8vVzNDLy9EVEQgSFRNTCA0LjAxIFRlbnRzQnlUYWdOYW1lKCdzY3JpcHQnKWlucHV0IHR5cGU9ImhpZGRlbiIgbmFtPHNjcmlwdCB0eXBlPSJ0ZXh0L2phdmFzIiBzdHlsZT0iZGlzcGxheTpub25lOyI+ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJyB0eXBlPSd0ZXh0L2phdmFzY3JpcHQnaW5wdXQgdHlwZT0idGV4dCIgbmFtZT0iZC5nZXRFbGVtZW50c0J5VGFnTmFtZShzbmljYWwiIGhyZWY9Imh0dHA6Ly93d3cuQy8vRFREIEhUTUwgNC4wMSBUcmFuc2l0PHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+aW9uYWwuZHRkIj4KPGh0bWwgeG1sbnM9aHR0cC1lcXVpdj0iQ29udGVudC1UeXBlZGluZz0iMCIgY2VsbHNwYWNpbmc9IjAiaHRtbDsgY2hhcnNldD11dGYtOCIgLz4KIHN0eWxlPSJkaXNwbGF5Om5vbmU7Ij48PGxpPjxhIGhyZWY9Imh0dHA6Ly93d3cuIHR5cGU9J3RleHQvamF2YXNjcmlwdCc+0LTQtdGP0YLQtdC70YzQvdC+0YHRgtC40YHQvtC+0YLQstC10YLRgdGC0LLQuNC40L/RgNC+0LjQt9Cy0L7QtNGB0YLQstCw0LHQtdC30L7Qv9Cw0YHQvdC+0YHRgtC44KSq4KWB4KS44KWN4KSk4KS/4KSV4KS+4KSV4KS+4KSC4KSX4KWN4KSw4KWH4KS44KSJ4KSo4KWN4KS54KWL4KSC4KSo4KWH4KS14KS/4KSn4KS+4KSo4KS44KSt4KS+4KSr4KS/4KSV4KWN4KS44KS/4KSC4KSX4KS44KWB4KSw4KSV4KWN4KS34KS/4KSk4KSV4KWJ4KSq4KWA4KSw4KS+4KSH4KSf4KS14KS/4KSc4KWN4KSe4KS+4KSq4KSo4KSV4KS+4KSw4KWN4KSw4KS14KS+4KSI4KS44KSV4KWN4KSw4KS/4KSv4KSk4KS+";
var NDBITS = Object.freeze([0, 0, 0, 0, 10, 10, 11, 11, 10, 10, 10, 10, 10, 9, 9, 8, 7, 7, 8, 7, 7, 6, 6, 5, 5, 0, 0, 0, 0, 0, 0, 0]);
var DICT_OFFSETS = Object.freeze([0, 0, 0, 0, 0, 4096, 9216, 21504, 35840, 44032, 53248, 63488, 74752, 87040, 93696, 100864, 104704, 106752, 108928, 113536, 115968, 118528, 119872, 121280, 122016, 122784, 122784, 122784, 122784, 122784, 122784, 122784]);
var TRANSFORMS = Object.freeze([[[], 0, []], [[], 0, [32]], [[32], 0, [32]], [[], 12, []], [[], 10, [32]], [[], 0, [32, 116, 104, 101, 32]], [[32], 0, []], [[115, 32], 0, [32]], [[], 0, [32, 111, 102, 32]], [[], 10, []], [[], 0, [32, 97, 110, 100, 32]], [[], 13, []], [[], 1, []], [[44, 32], 0, [32]], [[], 0, [44, 32]], [[32], 10, [32]], [[], 0, [32, 105, 110, 32]], [[], 0, [32, 116, 111, 32]], [[101, 32], 0, [32]], [[], 0, [34]], [[], 0, [46]], [[], 0, [34, 62]], [[], 0, [10]], [[], 3, []], [[], 0, [93]], [[], 0, [32, 102, 111, 114, 32]], [[], 14, []], [[], 2, []], [[], 0, [32, 97, 32]], [[], 0, [32, 116, 104, 97, 116, 32]], [[32], 10, []], [[], 0, [46, 32]], [[46], 0, []], [[32], 0, [44, 32]], [[], 15, []], [[], 0, [32, 119, 105, 116, 104, 32]], [[], 0, [39]], [[], 0, [32, 102, 114, 111, 109, 32]], [[], 0, [32, 98, 121, 32]], [[], 16, []], [[], 17, []], [[32, 116, 104, 101, 32], 0, []], [[], 4, []], [[], 0, [46, 32, 84, 104, 101, 32]], [[], 11, []], [[], 0, [32, 111, 110, 32]], [[], 0, [32, 97, 115, 32]], [[], 0, [32, 105, 115, 32]], [[], 7, []], [[], 1, [105, 110, 103, 32]], [[], 0, [10, 9]], [[], 0, [58]], [[32], 0, [46, 32]], [[], 0, [101, 100, 32]], [[], 20, []], [[], 18, []], [[], 6, []], [[], 0, [40]], [[], 10, [44, 32]], [[], 8, []], [[], 0, [32, 97, 116, 32]], [[], 0, [108, 121, 32]], [[32, 116, 104, 101, 32], 0, [32, 111, 102, 32]], [[], 5, []], [[], 9, []], [[32], 10, [44, 32]], [[], 10, [34]], [[46], 0, [40]], [[], 11, [32]], [[], 10, [34, 62]], [[], 0, [61, 34]], [[32], 0, [46]], [[46, 99, 111, 109, 47], 0, []], [[32, 116, 104, 101, 32], 0, [32, 111, 102, 32, 116, 104, 101, 32]], [[], 10, [39]], [[], 0, [46, 32, 84, 104, 105, 115, 32]], [[], 0, [44]], [[46], 0, [32]], [[], 10, [40]], [[], 10, [46]], [[], 0, [32, 110, 111, 116, 32]], [[32], 0, [61, 34]], [[], 0, [101, 114, 32]], [[32], 11, [32]], [[], 0, [97, 108, 32]], [[32], 11, []], [[], 0, [61, 39]], [[], 11, [34]], [[], 10, [46, 32]], [[32], 0, [40]], [[], 0, [102, 117, 108, 32]], [[32], 10, [46, 32]], [[], 0, [105, 118, 101, 32]], [[], 0, [108, 101, 115, 115, 32]], [[], 11, [39]], [[], 0, [101, 115, 116, 32]], [[32], 10, [46]], [[], 11, [34, 62]], [[32], 0, [61, 39]], [[], 10, [44]], [[], 0, [105, 122, 101, 32]], [[], 11, [46]], [[194, 160], 0, []], [[32], 0, [44]], [[], 10, [61, 34]], [[], 11, [61, 34]], [[], 0, [111, 117, 115, 32]], [[], 11, [44, 32]], [[], 10, [61, 39]], [[32], 10, [44]], [[32], 11, [61, 34]], [[32], 11, [44, 32]], [[], 11, [44]], [[], 11, [40]], [[], 11, [46, 32]], [[32], 11, [46]], [[], 11, [61, 39]], [[32], 11, [46, 32]], [[32], 10, [61, 34]], [[32], 11, [61, 39]], [[32], 10, [61, 39]]]);
var CONTEXT_LOOKUP = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6, 7, 7, 7, 7, 8, 8, 8, 8, 9, 9, 9, 9, 10, 10, 10, 10, 11, 11, 11, 11, 12, 12, 12, 12, 13, 13, 13, 13, 14, 14, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 22, 22, 22, 22, 23, 23, 23, 23, 24, 24, 24, 24, 25, 25, 25, 25, 26, 26, 26, 26, 27, 27, 27, 27, 28, 28, 28, 28, 29, 29, 29, 29, 30, 30, 30, 30, 31, 31, 31, 31, 32, 32, 32, 32, 33, 33, 33, 33, 34, 34, 34, 34, 35, 35, 35, 35, 36, 36, 36, 36, 37, 37, 37, 37, 38, 38, 38, 38, 39, 39, 39, 39, 40, 40, 40, 40, 41, 41, 41, 41, 42, 42, 42, 42, 43, 43, 43, 43, 44, 44, 44, 44, 45, 45, 45, 45, 46, 46, 46, 46, 47, 47, 47, 47, 48, 48, 48, 48, 49, 49, 49, 49, 50, 50, 50, 50, 51, 51, 51, 51, 52, 52, 52, 52, 53, 53, 53, 53, 54, 54, 54, 54, 55, 55, 55, 55, 56, 56, 56, 56, 57, 57, 57, 57, 58, 58, 58, 58, 59, 59, 59, 59, 60, 60, 60, 60, 61, 61, 61, 61, 62, 62, 62, 62, 63, 63, 63, 63, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 12, 16, 12, 12, 20, 12, 16, 24, 28, 12, 12, 32, 12, 36, 12, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 32, 32, 24, 40, 28, 12, 12, 48, 52, 52, 52, 48, 52, 52, 52, 48, 52, 52, 52, 52, 52, 48, 52, 52, 52, 52, 52, 48, 52, 52, 52, 52, 52, 24, 12, 28, 12, 12, 12, 56, 60, 60, 60, 56, 60, 60, 60, 56, 60, 60, 60, 60, 60, 56, 60, 60, 60, 60, 60, 56, 60, 60, 60, 60, 60, 24, 12, 28, 12, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 32, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 56, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 7]);
var BrotliError = variants("BrotliError", {
  Truncated: ["at"],
  Invalid: ["what", "at"],
  TrailingBits: []
});
var dictionary = null;
var dict = () => {
  if (dictionary) return dictionary;
  const bin = atob(DICTIONARY_BASE64);
  const d = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) d[i] = bin.charCodeAt(i);
  return dictionary = d;
};
var CODE_LENGTH_ORDER = [1, 2, 3, 4, 0, 5, 17, 6, 16, 7, 8, 9, 10, 11, 12, 13, 14, 15];
var CL_LEN = [2, 2, 2, 3, 2, 2, 2, 4, 2, 2, 2, 3, 2, 2, 2, 4];
var CL_VAL = [0, 4, 3, 2, 0, 4, 3, 1, 0, 4, 3, 2, 0, 4, 3, 5];
var BLEN_BASE = [1, 5, 9, 13, 17, 25, 33, 41, 49, 65, 81, 97, 113, 145, 177, 209, 241, 305, 369, 497, 753, 1265, 2289, 4337, 8433, 16625];
var BLEN_EXTRA = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 7, 8, 9, 10, 11, 12, 13, 24];
var INS_BASE = [0, 1, 2, 3, 4, 5, 6, 8, 10, 14, 18, 26, 34, 50, 66, 98, 130, 194, 322, 578, 1090, 2114, 6210, 22594];
var INS_EXTRA = [0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8, 9, 10, 12, 14, 24];
var COPY_BASE = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 18, 22, 30, 38, 54, 70, 102, 134, 198, 326, 582, 1094, 2118];
var COPY_EXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 7, 8, 9, 10, 24];
var CMD_INS_OFF = [0, 0, 0, 0, 8, 8, 0, 16, 8, 16, 16];
var CMD_COPY_OFF = [0, 8, 0, 8, 0, 8, 16, 0, 16, 8, 16];
var DIST_RING = [0, 1, 2, 3, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1];
var DIST_DELTA = [0, 0, 0, 0, -1, 1, -2, 2, -3, 3, -1, 1, -2, 2, -3, 3];
function bitReader(src) {
  let pos = 0, buf = 0, n = 0;
  let fault = NONE;
  let bad = false;
  const fail = (e) => {
    if (!bad) {
      fault = some(e);
      bad = true;
    }
    return 0;
  };
  const top = (k) => {
    while (n < k && pos < src.length) {
      buf = (buf | src[pos++] << n) >>> 0;
      n += 8;
    }
  };
  return {
    fail,
    get bad() {
      return bad;
    },
    get fault() {
      return fault.tag === "Some" ? fault.value : null;
    },
    /** Read k ≤ 24 bits, LSB first; Truncated (and 0) if the input ends. */
    bits(k) {
      if (k === 0) return 0;
      top(k);
      if (n < k) return fail(BrotliError.Truncated(pos));
      const v = buf & (1 << k) - 1;
      buf >>>= k;
      n -= k;
      return v;
    },
    bit() {
      if (n === 0) {
        top(1);
        if (n === 0) return fail(BrotliError.Truncated(pos));
      }
      const v = buf & 1;
      buf >>>= 1;
      n--;
      return v;
    },
    /** Next k bits without consuming; zero-padded past the end of input. */
    peek(k) {
      top(k);
      return buf & (1 << k) - 1;
    },
    /** Bits actually available (≤ 31) after a peek. */
    get avail() {
      return n;
    },
    drop(k) {
      if (k > n) {
        fail(BrotliError.Truncated(pos));
        return;
      }
      buf >>>= k;
      n -= k;
    },
    /** Skip to the byte boundary; skipped bits must be zero (§9.2). */
    align() {
      const k = n & 7;
      if (k && buf & (1 << k) - 1) {
        fail(BrotliError.Invalid("nonzero padding", pos));
        return;
      }
      buf >>>= k;
      n -= k;
    },
    /** Byte-aligned raw copy (call after align). */
    bytes(len2) {
      if (bad || pos + len2 - Math.min(n >> 3, len2) > src.length) {
        fail(BrotliError.Truncated(pos));
        return EMPTY2;
      }
      const out = new Uint8Array(len2);
      let i = 0;
      while (n >= 8 && i < len2) {
        out[i++] = buf & 255;
        buf >>>= 8;
        n -= 8;
      }
      out.set(src.subarray(pos, pos + len2 - i), i);
      pos += len2 - i;
      return out;
    },
    get pos() {
      return pos;
    },
    /** Unconsumed bits of the final byte must be zero; no bytes may follow. */
    cleanEnd() {
      return (n < 8 ? (buf & (1 << n) - 1) === 0 : false) && pos === src.length;
    }
  };
}
var FAST = 8;
var EMPTY2 = new Uint8Array(0);
var DEAD = Object.freeze({ single: 0, count: new Uint16Array(16), symbols: new Uint16Array(0), fast: new Int32Array(0) });
function buildHuffman(br, lengths, at) {
  if (br.bad) return DEAD;
  const count = new Uint16Array(16);
  let used = 0, last = 0;
  for (let s = 0; s < lengths.length; s++) if (lengths[s]) {
    count[lengths[s]]++;
    used++;
    last = s;
  }
  if (used === 0) {
    br.fail(BrotliError.Invalid("empty prefix code", at));
    return DEAD;
  }
  if (used === 1) return { single: last, count, symbols: new Uint16Array(0), fast: new Int32Array(0) };
  const offs = new Uint16Array(16);
  for (let l = 1; l < 16; l++) offs[l] = offs[l - 1] + count[l - 1];
  const symbols = new Uint16Array(used);
  for (let s = 0; s < lengths.length; s++) if (lengths[s]) symbols[offs[lengths[s]]++] = s;
  const fast = new Int32Array(1 << FAST).fill(-1);
  let code = 0, idx = 0;
  for (let l = 1; l <= FAST; l++) {
    for (let k = 0; k < count[l]; k++, code++, idx++) {
      let rev3 = 0;
      for (let b = 0; b < l; b++) rev3 |= (code >> l - 1 - b & 1) << b;
      for (let fill = rev3; fill < 1 << FAST; fill += 1 << l) fast[fill] = symbols[idx] << 4 | l;
    }
    code <<= 1;
  }
  return { single: -1, count, symbols, fast };
}
function decodeSym(br, h) {
  if (h.single >= 0) return h.single;
  const e = h.fast[br.peek(FAST)];
  if (e >= 0 && (e & 15) <= br.avail) {
    br.drop(e & 15);
    return e >> 4;
  }
  let code = 0, first = 0, index = 0;
  for (let len2 = 1; len2 < 16; len2++) {
    code |= br.bit();
    const c = h.count[len2];
    if (code - first < c) return h.symbols[index + code - first];
    index += c;
    first += c;
    first <<= 1;
    code <<= 1;
  }
  return br.fail(BrotliError.Invalid("prefix code overrun", br.pos));
}
function readHuffman(br, size) {
  const at = br.pos;
  const lengths = new Uint8Array(size);
  const hskip = br.bits(2);
  if (hskip === 1) {
    let bits = 0;
    while (1 << bits < size) bits++;
    const nsym = br.bits(2) + 1;
    const syms = [];
    for (let i = 0; i < nsym; i++) {
      const s = br.bits(bits);
      if (br.bad) return DEAD;
      if (s >= size || syms.includes(s)) {
        br.fail(BrotliError.Invalid("simple code symbol", at));
        return DEAD;
      }
      syms.push(s);
    }
    if (nsym === 1) lengths[syms[0]] = 1;
    else if (nsym === 2) {
      lengths[syms[0]] = 1;
      lengths[syms[1]] = 1;
    } else if (nsym === 3) {
      lengths[syms[0]] = 1;
      lengths[syms[1]] = 2;
      lengths[syms[2]] = 2;
    } else if (br.bit() === 0) syms.forEach((s) => {
      lengths[s] = 2;
    });
    else {
      lengths[syms[0]] = 1;
      lengths[syms[1]] = 2;
      lengths[syms[2]] = 3;
      lengths[syms[3]] = 3;
    }
    return buildHuffman(br, lengths, at);
  }
  const clLengths = new Uint8Array(18);
  let space = 32, numCodes = 0;
  for (let i = hskip; i < 18; i++) {
    const ix = br.peek(4);
    br.drop(CL_LEN[ix]);
    const v = CL_VAL[ix];
    clLengths[CODE_LENGTH_ORDER[i]] = v;
    if (v !== 0) {
      space -= 32 >> v;
      numCodes++;
      if (space <= 0) break;
    }
  }
  if (br.bad) return DEAD;
  if (!(numCodes === 1 || space === 0)) {
    br.fail(BrotliError.Invalid("code length code", at));
    return DEAD;
  }
  const clHuff = buildHuffman(br, clLengths, at);
  let sym = 0, prev2 = 8, repeat = 0, repeatLen = 0;
  space = 32768;
  while (sym < size && space > 0 && !br.bad) {
    const p = decodeSym(br, clHuff);
    if (p < 16) {
      repeat = 0;
      lengths[sym++] = p;
      if (p !== 0) {
        prev2 = p;
        space -= 32768 >> p;
      }
    } else {
      const extra = p === 16 ? 2 : 3;
      const newLen = p === 16 ? prev2 : 0;
      if (repeatLen !== newLen) {
        repeat = 0;
        repeatLen = newLen;
      }
      const old = repeat;
      if (repeat > 0) repeat = repeat - 2 << extra;
      repeat += br.bits(extra) + 3;
      const delta = repeat - old;
      if (sym + delta > size) {
        br.fail(BrotliError.Invalid("code length repeat overflow", at));
        return DEAD;
      }
      for (let k = 0; k < delta; k++) lengths[sym++] = repeatLen;
      if (repeatLen !== 0) space -= delta * (32768 >> repeatLen);
    }
  }
  if (br.bad) return DEAD;
  if (space !== 0) {
    br.fail(BrotliError.Invalid("incomplete prefix code", at));
    return DEAD;
  }
  return buildHuffman(br, lengths, at);
}
var varLen8 = (br) => {
  if (!br.bit()) return 0;
  const n = br.bits(3);
  return n === 0 ? 1 : (1 << n) + br.bits(n);
};
var blockLength = (br, h) => {
  const c = decodeSym(br, h);
  return BLEN_BASE[c] + br.bits(BLEN_EXTRA[c]);
};
function contextMap(br, size, ntrees) {
  const map = new Uint8Array(size);
  if (ntrees < 2) return map;
  const rleMax = br.bit() ? br.bits(4) + 1 : 0;
  const h = readHuffman(br, ntrees + rleMax);
  for (let i = 0; i < size && !br.bad; ) {
    const s = decodeSym(br, h);
    if (s === 0) map[i++] = 0;
    else if (s <= rleMax) {
      let reps = (1 << s) + br.bits(s);
      if (i + reps > size) {
        br.fail(BrotliError.Invalid("context map RLE overflow", br.pos));
        break;
      }
      while (reps--) map[i++] = 0;
    } else map[i++] = s - rleMax;
  }
  if (br.bit()) {
    const mtf = Array.from({ length: 256 }, (_, k) => k);
    for (let i = 0; i < size; i++) {
      const idx = map[i], v = mtf[idx];
      map[i] = v;
      mtf.splice(idx, 1);
      mtf.unshift(v);
    }
  }
  return map;
}
var upper = (w, i) => {
  if (w[i] < 192) {
    if (w[i] >= 97 && w[i] <= 122) w[i] ^= 32;
    return 1;
  }
  if (w[i] < 224) {
    if (i + 1 < w.length) w[i + 1] ^= 32;
    return 2;
  }
  if (i + 2 < w.length) w[i + 2] ^= 5;
  return 3;
};
function dictionaryWord(br, len2, wordId, at) {
  if (len2 < 4 || len2 > 24 || NDBITS[len2] === 0) {
    br.fail(BrotliError.Invalid("dictionary word length", at));
    return EMPTY2;
  }
  const nbits = NDBITS[len2];
  const idx = wordId & (1 << nbits) - 1;
  const t = wordId >>> nbits;
  if (t >= TRANSFORMS.length) {
    br.fail(BrotliError.Invalid("transform id", at));
    return EMPTY2;
  }
  const start = DICT_OFFSETS[len2] + idx * len2;
  const [prefix, type, suffix] = TRANSFORMS[t];
  let word = dict().slice(start, start + len2);
  if (type >= 1 && type <= 9) word = word.subarray(0, Math.max(0, len2 - type));
  else if (type >= 12 && type <= 20) word = word.subarray(Math.min(len2, type - 11));
  else if (type === 10) {
    if (word.length) upper(word, 0);
  } else if (type === 11) {
    for (let i = 0; i < word.length; ) i += upper(word, i);
  }
  const out = new Uint8Array(prefix.length + word.length + suffix.length);
  out.set(prefix);
  out.set(word, prefix.length);
  out.set(suffix, prefix.length + word.length);
  return out;
}
function brotliDecode(input, { sizeHint = 0, maxOutput = 1 << 30, span = NOOP_SPAN } = {}) {
  const br = bitReader(input);
  let out = new Uint8Array(Math.max(1024, sizeHint));
  let pos = 0;
  const ensure2 = (extra) => {
    if (pos + extra > maxOutput) {
      br.fail(BrotliError.Invalid("output exceeds maxOutput", br.pos));
      return false;
    }
    if (pos + extra <= out.length) return true;
    let n = out.length * 2;
    while (n < pos + extra) n *= 2;
    const o = new Uint8Array(n);
    o.set(out.subarray(0, pos));
    out = o;
    return true;
  };
  {
    let wbits;
    if (!br.bit()) wbits = 16;
    else {
      const n = br.bits(3);
      if (n) wbits = 17 + n;
      else {
        const m = br.bits(3);
        if (m === 1) return err(BrotliError.Invalid("large-window brotli", 0));
        wbits = m ? 8 + m : 17;
      }
    }
    const window = (1 << wbits) - 16;
    const ring = [16, 15, 11, 4];
    let rp = 3;
    for (let last = 0; !last && !br.bad; ) {
      last = br.bit();
      if (last && br.bit()) break;
      const nibbles = br.bits(2);
      if (nibbles === 3) {
        if (br.bit()) {
          br.fail(BrotliError.Invalid("reserved bit", br.pos));
          break;
        }
        const skipBytes = br.bits(2);
        let skip2 = 0;
        for (let i = 0; i < skipBytes; i++) {
          const b = br.bits(8);
          if (i === skipBytes - 1 && skipBytes > 1 && b === 0) br.fail(BrotliError.Invalid("MSKIPLEN", br.pos));
          skip2 |= b << 8 * i;
        }
        if (skipBytes) skip2 += 1;
        br.align();
        br.bytes(skip2);
        continue;
      }
      const nn = nibbles + 4;
      let mlen = 0;
      for (let i = 0; i < nn; i++) {
        const nib = br.bits(4);
        if (i === nn - 1 && nn > 4 && nib === 0) br.fail(BrotliError.Invalid("MLEN nibble", br.pos));
        mlen |= nib << 4 * i;
      }
      mlen += 1;
      if (br.bad) break;
      if (!last && br.bit()) {
        br.align();
        const raw = br.bytes(mlen);
        if (br.bad || !ensure2(mlen)) break;
        out.set(raw, pos);
        pos += mlen;
        continue;
      }
      const { nbl, btHuff, blHuff, blen, btype, prevType, npostfix, ndirect, postfixMask, cmode, cmapL, cmapD, hL, hI, hD } = span.span("brotli.codes", { mlen }, (cs) => {
        const nbl2 = [0, 0, 0], btHuff2 = (
          /** @type {Huff[]} */
          []
        ), blHuff2 = (
          /** @type {Huff[]} */
          []
        );
        const blen2 = [1 << 24, 1 << 24, 1 << 24], btype2 = [0, 0, 0], prevType2 = [1, 1, 1];
        for (let c = 0; c < 3; c++) {
          nbl2[c] = varLen8(br) + 1;
          if (nbl2[c] >= 2) {
            btHuff2[c] = readHuffman(br, nbl2[c] + 2);
            blHuff2[c] = readHuffman(br, 26);
            blen2[c] = blockLength(br, blHuff2[c]);
          }
        }
        const npostfix2 = br.bits(2);
        const ndirect2 = br.bits(4) << npostfix2;
        const postfixMask2 = (1 << npostfix2) - 1;
        const cmode2 = new Uint8Array(nbl2[0]);
        for (let i = 0; i < nbl2[0]; i++) cmode2[i] = br.bits(2);
        const ntreesL = varLen8(br) + 1;
        const cmapL2 = contextMap(br, 64 * nbl2[0], ntreesL);
        const ntreesD = varLen8(br) + 1;
        const cmapD2 = contextMap(br, 4 * nbl2[2], ntreesD);
        const hL2 = Array.from({ length: ntreesL }, () => readHuffman(br, 256));
        const hI2 = Array.from({ length: nbl2[1] }, () => readHuffman(br, 704));
        const hD2 = Array.from({ length: ntreesD }, () => readHuffman(br, 16 + ndirect2 + (48 << npostfix2)));
        cs.set("trees", ntreesL + nbl2[1] + ntreesD);
        return { nbl: nbl2, btHuff: btHuff2, blHuff: blHuff2, blen: blen2, btype: btype2, prevType: prevType2, npostfix: npostfix2, ndirect: ndirect2, postfixMask: postfixMask2, cmode: cmode2, cmapL: cmapL2, cmapD: cmapD2, hL: hL2, hI: hI2, hD: hD2 };
      });
      if (br.bad) break;
      const switchBlock = (c) => {
        const s = decodeSym(br, btHuff[c]);
        let t = s === 0 ? prevType[c] : s === 1 ? btype[c] + 1 : s - 2;
        if (t >= nbl[c]) t -= nbl[c];
        prevType[c] = btype[c];
        btype[c] = t;
        blen[c] = blockLength(br, blHuff[c]);
      };
      const end = pos + mlen;
      if (!ensure2(mlen)) break;
      span.span("brotli.commands", { atomic: true, items: mlen }, () => {
        while (pos < end && !br.bad) {
          if (blen[1] === 0) switchBlock(1);
          blen[1]--;
          const cmd = decodeSym(br, hI[btype[1]]);
          const r = cmd >> 6;
          const insCode = CMD_INS_OFF[r] + (cmd >> 3 & 7);
          const copyCode = CMD_COPY_OFF[r] + (cmd & 7);
          const insLen = INS_BASE[insCode] + br.bits(INS_EXTRA[insCode]);
          const copyLen = COPY_BASE[copyCode] + br.bits(COPY_EXTRA[copyCode]);
          if (pos + insLen > end) {
            br.fail(BrotliError.Invalid("insert past meta-block", br.pos));
            return;
          }
          for (let k = 0; k < insLen; k++) {
            if (blen[0] === 0) switchBlock(0);
            blen[0]--;
            const p1 = pos > 0 ? out[pos - 1] : 0, p2 = pos > 1 ? out[pos - 2] : 0;
            const m = cmode[btype[0]] * 512;
            const ctx = CONTEXT_LOOKUP[m + p1] | CONTEXT_LOOKUP[m + 256 + p2];
            out[pos++] = decodeSym(br, hL[cmapL[btype[0] * 64 + ctx]]);
          }
          if (pos >= end) break;
          let distance, dcode = 0;
          if (r < 2) distance = ring[rp];
          else {
            if (blen[2] === 0) switchBlock(2);
            blen[2]--;
            const dctx = copyLen > 4 ? 3 : copyLen - 2;
            dcode = decodeSym(br, hD[cmapD[btype[2] * 4 + dctx]]);
            if (dcode < 16) {
              distance = ring[rp - DIST_RING[dcode] + 4 & 3] + DIST_DELTA[dcode];
              if (distance <= 0) {
                br.fail(BrotliError.Invalid("distance \u2264 0", br.pos));
                return;
              }
            } else if (dcode < 16 + ndirect) distance = dcode - 15;
            else {
              const d = dcode - ndirect - 16;
              const nbits = 1 + (d >> npostfix + 1);
              const offset = (2 + (d >> npostfix & 1) << nbits) - 4;
              distance = (offset + br.bits(nbits) << npostfix) + (d & postfixMask) + ndirect + 1;
            }
          }
          const maxDist = Math.min(window, pos);
          if (distance > maxDist) {
            const word = dictionaryWord(br, copyLen, distance - maxDist - 1, br.pos);
            if (br.bad) return;
            if (pos + word.length > end) {
              br.fail(BrotliError.Invalid("dictionary word past meta-block", br.pos));
              return;
            }
            out.set(word, pos);
            pos += word.length;
          } else {
            if (dcode !== 0) {
              rp = rp + 1 & 3;
              ring[rp] = distance;
            }
            if (pos + copyLen > end) {
              br.fail(BrotliError.Invalid("copy past meta-block", br.pos));
              return;
            }
            for (let k = 0; k < copyLen; k++, pos++) out[pos] = out[pos - distance];
          }
        }
      });
    }
    if (br.bad) return err(br.fault);
    if (!br.cleanEnd()) return err(BrotliError.TrailingBits);
    return ok(out.slice(0, pos));
  }
}
function hasNativeBrotli() {
  try {
    new DecompressionStream(
      /** @type {any} */
      "brotli"
    );
    return true;
  } catch {
    return false;
  }
}
async function drainCapped(stream2, max, what) {
  const r = stream2.getReader();
  const parts = [];
  let n = 0;
  try {
    for (; ; ) {
      const { done, value } = await r.read();
      if (done) break;
      n += value.length;
      if (n > max) {
        await r.cancel();
        return err(`${what}: output exceeds ${max} bytes`);
      }
      parts.push(value);
    }
  } catch (e) {
    return err(`${what}: ${e instanceof Error ? e.message : String(e)}`);
  }
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return ok(out);
}
async function nativeBrotli(input, span = NOOP_SPAN, maxOutput = LIMITS.decompressedBytes) {
  const stream2 = span.span("brotli.native.pipe", { atomic: true }, () => new Blob([
    /** @type {BlobPart} */
    input
  ]).stream().pipeThrough(new DecompressionStream(
    /** @type {any} */
    "brotli"
  )));
  return span.span("brotli.native.drain", { atomic: true }, () => drainCapped(stream2, maxOutput, "brotli"));
}
async function jsBrotli(input, span = NOOP_SPAN, maxOutput = LIMITS.decompressedBytes) {
  const r = brotliDecode(input, { span, maxOutput, sizeHint: Math.min(maxOutput, 16 << 20) });
  return r.tag === "Ok" ? r : err(`brotli: ${JSON.stringify(r.error)}`);
}
var autoBrotli = hasNativeBrotli() ? nativeBrotli : jsBrotli;
var Container = variants("Container", { Sfnt: [], Woff: [], Woff2: [] });
var ContainerError = variants("ContainerError", {
  UnknownSignature: ["got"],
  Truncated: ["at"],
  TableOutOfRange: ["table"],
  Inflate: ["table", "message"],
  InflatedSize: ["table", "expected", "actual"],
  Woff2: ["cause"],
  TooLarge: ["what", "size", "limit"]
});
function sniff(b) {
  if (b.length < 4) return err(ContainerError.Truncated(0));
  const sig = String.fromCharCode(b[0], b[1], b[2], b[3]);
  if (sig === "wOF2") return ok(Container.Woff2);
  if (sig === "wOFF") return ok(Container.Woff);
  if (sig === "OTTO" || sig === "true" || b[0] === 0 && b[1] === 1 && b[2] === 0 && b[3] === 0) return ok(Container.Sfnt);
  return err(ContainerError.UnknownSignature(sig));
}
function readSfnt(bytes) {
  const v = view(bytes);
  const dir = guard(() => {
    const n = u16(v, 4);
    return {
      flavor: tag2(v, 0),
      entries: times(n, (i) => ({ tag: tag2(v, 12 + i * 16), off: u32(v, 20 + i * 16), len: u32(v, 24 + i * 16) }))
    };
  }, (e) => ContainerError.Truncated(e.at));
  if (dir.tag === "Err") return dir;
  const bad = dir.value.entries.find((e) => e.off + e.len > bytes.length);
  if (bad) return err(ContainerError.TableOutOfRange(bad.tag));
  const file = {
    container: Container.Sfnt,
    flavor: dir.value.flavor,
    tables: dir.value.entries.map((e) => ({ tag: e.tag, transform: Transform.Identity, data: bytes.subarray(e.off, e.off + e.len) }))
  };
  return ok(file);
}
async function readWoff(bytes, inflate) {
  const v = view(bytes);
  const dir = guard(() => {
    const flavor = tag2(v, 4);
    const n = u16(v, 12);
    const entries = [];
    for (let i = 0; i < n; i++) {
      const r = 44 + i * 20;
      entries.push({ tag: tag2(v, r), off: u32(v, r + 4), comp: u32(v, r + 8), orig: u32(v, r + 12) });
    }
    return { flavor, entries };
  }, (e) => ContainerError.Truncated(e.at));
  if (dir.tag === "Err") return dir;
  const tables = [];
  let inflated = 0;
  for (const e of dir.value.entries) {
    if (e.off + e.comp > bytes.length) return err(ContainerError.TableOutOfRange(e.tag));
    inflated += e.orig;
    if (inflated > LIMITS.decompressedBytes) return err(ContainerError.TooLarge("tables", inflated, LIMITS.decompressedBytes));
    const stored = bytes.subarray(e.off, e.off + e.comp);
    let data = stored;
    if (e.comp < e.orig) {
      const r = await inflate(stored, e.orig);
      if (r.tag === "Err") return err(ContainerError.Inflate(e.tag, r.error));
      data = r.value;
    }
    if (data.length !== e.orig) return err(ContainerError.InflatedSize(e.tag, e.orig, data.length));
    tables.push({ tag: e.tag, transform: Transform.Identity, data });
  }
  return ok({ container: Container.Woff, flavor: dir.value.flavor, tables });
}
async function nativeInflate(b, maxOutput = LIMITS.decompressedBytes) {
  const s = new Blob([
    /** @type {BlobPart} */
    b
  ]).stream().pipeThrough(new DecompressionStream("deflate"));
  return drainCapped(s, maxOutput, "inflate");
}
async function openFontFile(bytes, { brotli, inflate = nativeInflate, span = NOOP_SPAN }) {
  return span.span("font.container", { bytes: bytes.length }, async (s) => {
    if (bytes.length > LIMITS.fileBytes) return err(ContainerError.TooLarge("file", bytes.length, LIMITS.fileBytes));
    const kind = sniff(bytes);
    if (kind.tag === "Err") {
      s.fail(kind.error.tag);
      return kind;
    }
    s.set("container", kind.value.tag);
    const r = await Container.match(kind.value, {
      Sfnt: async () => readSfnt(bytes),
      Woff: () => readWoff(bytes, inflate),
      Woff2: async () => {
        const d = await decodeWoff2(bytes, { decompress: brotli, span: s });
        if (d.tag === "Err") return err(ContainerError.Woff2(d.error));
        return ok({ container: Container.Woff2, flavor: d.value.flavor, tables: d.value.tables.map((t) => ({ tag: t.tag, transform: t.transform, data: t.data })) });
      }
    });
    if (r.tag === "Ok") s.set("tables", r.value.tables.length);
    else s.fail(r.error.tag);
    return r;
  });
}
var TableError = variants("TableError", {
  Missing: ["table"],
  Truncated: ["table", "at"],
  Invalid: ["table", "reason"],
  NoUnicodeCmap: []
});
var bounds = (t) => (f) => TableError.Truncated(t, f.at);
var parseHead = (b) => {
  const v = view(b);
  const r = guard(() => ({
    magic: u32(v, 12),
    unitsPerEm: u16(v, 18),
    bbox: [i16(v, 36), i16(v, 38), i16(v, 40), i16(v, 42)],
    indexToLocFormat: (
      /** @type {0 | 1} */
      i16(v, 50)
    )
  }), bounds("head"));
  if (r.tag === "Ok" && r.value.magic !== 1594834165) return err(TableError.Invalid("head", "magicNumber"));
  if (r.tag === "Ok" && (r.value.unitsPerEm < 16 || r.value.unitsPerEm > 16384)) return err(TableError.Invalid("head", "unitsPerEm"));
  return r;
};
var parseHhea = (b) => {
  const v = view(b);
  return guard(() => ({ ascender: i16(v, 4), descender: i16(v, 6), lineGap: i16(v, 8), numberOfHMetrics: u16(v, 34) }), bounds("hhea"));
};
var parseMaxp = (b) => guard(() => ({ numGlyphs: u16(view(b), 4) }), bounds("maxp"));
var parseHmtx = (b, numberOfHMetrics, numGlyphs) => {
  if (numberOfHMetrics === 0 || numberOfHMetrics > numGlyphs) return err(TableError.Invalid("hhea", `numberOfHMetrics ${numberOfHMetrics}`));
  const v = view(b);
  return guard(() => {
    const adv = new Uint16Array(numGlyphs);
    for (let g = 0; g < numGlyphs; g++) adv[g] = g < numberOfHMetrics ? u16(v, g * 4) : adv[numberOfHMetrics - 1];
    return adv;
  }, bounds("hmtx"));
};
var parseLsb = (b, numberOfHMetrics, numGlyphs) => {
  const v = view(b);
  return guard(() => {
    const lsb = new Int16Array(numGlyphs);
    for (let g = 0; g < numGlyphs; g++) lsb[g] = g < numberOfHMetrics ? i16(v, g * 4 + 2) : i16(v, numberOfHMetrics * 4 + (g - numberOfHMetrics) * 2);
    return lsb;
  }, bounds("hmtx"));
};
var CmapFormat = variants("CmapFormat", { F4: ["offset"], F12: ["offset"] });
function cmapCandidates(b) {
  const v = view(b);
  return guard(() => {
    const n = u16(v, 2);
    const recs = times(n, (i) => ({
      platform: u16(v, 4 + i * 8),
      encoding: u16(v, 6 + i * 8),
      offset: u32(v, 8 + i * 8)
    }));
    const rank = (r) => r.platform === 3 && r.encoding === 10 ? 0 : r.platform === 0 && (r.encoding === 4 || r.encoding === 6) ? 1 : r.platform === 3 && r.encoding === 1 ? 2 : r.platform === 0 ? 3 : 99;
    return recs.filter((r) => rank(r) < 99).map((r) => ({ ...r, format: u16(v, r.offset) })).filter((r) => r.format === 4 || r.format === 12).sort((a, b2) => rank(a) - rank(b2) || b2.format - a.format).map((r) => r.format === 4 ? CmapFormat.F4(r.offset) : CmapFormat.F12(r.offset));
  }, bounds("cmap"));
}
function cmapLookup(b, which) {
  const v = view(b);
  return guard(() => CmapFormat.match(which, {
    F4: ({ offset: o }) => {
      const segX2 = u16(v, o + 6);
      const n = segX2 >>> 1;
      const ends = o + 14, starts = ends + segX2 + 2, deltas = starts + segX2, ranges = deltas + segX2;
      const end = Uint16Array.from({ length: n }, (_, i) => u16(v, ends + i * 2));
      const start = Uint16Array.from({ length: n }, (_, i) => u16(v, starts + i * 2));
      const delta = Int16Array.from({ length: n }, (_, i) => i16(v, deltas + i * 2));
      const range = Uint16Array.from({ length: n }, (_, i) => u16(v, ranges + i * 2));
      return (cp) => {
        if (cp > 65535) return 0;
        let lo = 0, hi = n - 1;
        while (lo < hi) {
          const m = lo + hi >> 1;
          if (end[m] < cp) lo = m + 1;
          else hi = m;
        }
        if (n === 0 || cp < start[lo] || cp > end[lo]) return 0;
        if (range[lo] === 0) return cp + delta[lo] & 65535;
        const at = ranges + lo * 2 + range[lo] + (cp - start[lo]) * 2;
        if (at + 2 > b.length) return 0;
        const g = u16(v, at);
        return g === 0 ? 0 : g + delta[lo] & 65535;
      };
    },
    F12: ({ offset: o }) => {
      const n = u32(v, o + 12);
      if (!fits(v, o + 16, n * 12)) return () => 0;
      const s = new Uint32Array(n), e = new Uint32Array(n), g0 = new Uint32Array(n);
      for (let i = 0; i < n; i++) {
        s[i] = u32(v, o + 16 + i * 12);
        e[i] = u32(v, o + 20 + i * 12);
        g0[i] = u32(v, o + 24 + i * 12);
      }
      return (cp) => {
        let lo = 0, hi = n - 1;
        while (lo < hi) {
          const m = lo + hi >> 1;
          if (e[m] < cp) lo = m + 1;
          else hi = m;
        }
        return n > 0 && cp >= s[lo] && cp <= e[lo] ? g0[lo] + (cp - s[lo]) : 0;
      };
    }
  }), bounds("cmap"));
}
var Seg = variants("Seg", {
  MoveTo: ["x", "y"],
  LineTo: ["x", "y"],
  QuadTo: ["x1", "y1", "x", "y"],
  CubicTo: ["x1", "y1", "x2", "y2", "x", "y"],
  Close: []
});
var IDENTITY = Object.freeze([1, 0, 0, 1, 0, 0]);
function transform(path, [a, b, c, d, e, f]) {
  const X = (x, y) => a * x + c * y + e;
  const Y = (x, y) => b * x + d * y + f;
  return path.map((s) => Seg.match(s, {
    MoveTo: ({ x, y }) => Seg.MoveTo(X(x, y), Y(x, y)),
    LineTo: ({ x, y }) => Seg.LineTo(X(x, y), Y(x, y)),
    QuadTo: ({ x1, y1, x, y }) => Seg.QuadTo(X(x1, y1), Y(x1, y1), X(x, y), Y(x, y)),
    CubicTo: ({ x1, y1, x2, y2, x, y }) => Seg.CubicTo(X(x1, y1), Y(x1, y1), X(x2, y2), Y(x2, y2), X(x, y), Y(x, y)),
    Close: () => Seg.Close
  }));
}
var CffError = variants("CffError", {
  Truncated: ["at"],
  Version: ["major"],
  Unsupported: ["feature"],
  NoCharStrings: [],
  BadGlyph: ["glyph"],
  Charstring: ["glyph", "reason"]
});
function readIndex(v, o) {
  const count = u16(v, o);
  if (count === 0) return { items: [], end: o + 2 };
  const offSize = u8(v, o + 2);
  const off = (i) => {
    let x = 0;
    for (let k = 0; k < offSize; k++) x = x * 256 + u8(v, o + 3 + i * offSize + k);
    return x;
  };
  const base = o + 2 + (count + 1) * offSize;
  const items = times(count, (i) => {
    const a = base + off(i), b = base + off(i + 1);
    u8(v, b - 1);
    return v.bytes.subarray(a, b);
  });
  return { items, end: base + off(count) };
}
function readDict(b) {
  const v = view(b);
  const out = /* @__PURE__ */ new Map();
  let args = [];
  let o = 0;
  while (o < b.length) {
    const b0 = u8(v, o);
    if (b0 <= 21) {
      let op = b0;
      o++;
      if (b0 === 12) op = 1200 + u8(v, o++);
      out.set(op, args);
      args = [];
    } else if (b0 === 28) {
      args.push(i16(v, o + 1));
      o += 3;
    } else if (b0 === 29) {
      args.push(i32(v, o + 1));
      o += 5;
    } else if (b0 === 30) {
      let s = "";
      o++;
      for (let done = false; !done && o < b.length; o++) {
        const byte = u8(v, o);
        for (const nib of [byte >> 4, byte & 15]) {
          if (nib === 15) {
            done = true;
            break;
          }
          s += nib <= 9 ? String(nib) : [".", "E", "E-", "", "-"][nib - 10];
        }
      }
      args.push(Number(s));
    } else if (b0 >= 32 && b0 <= 246) {
      args.push(b0 - 139);
      o++;
    } else if (b0 >= 247 && b0 <= 250) {
      args.push((b0 - 247) * 256 + u8(v, o + 1) + 108);
      o += 2;
    } else if (b0 >= 251 && b0 <= 254) {
      args.push(-(b0 - 251) * 256 - u8(v, o + 1) - 108);
      o += 2;
    } else return err(b0);
  }
  return ok(out);
}
var subrBias = (n) => n < 1240 ? 107 : n < 33900 ? 1131 : 32768;
function parseCff(bytes) {
  const v = view(bytes);
  const parsed = guard(() => {
    const major = u8(v, 0);
    if (major !== 1) return { error: CffError.Version(major) };
    const hdrSize = u8(v, 2);
    const names = readIndex(v, hdrSize);
    const tops = readIndex(v, names.end);
    const strings = readIndex(v, tops.end);
    const gsubrs2 = readIndex(v, strings.end);
    if (tops.items.length === 0) return { error: CffError.NoCharStrings };
    const topR = readDict(tops.items[0]);
    if (topR.tag === "Err") return { error: CffError.Unsupported(`DICT: reserved byte ${topR.error}`) };
    const top = topR.value;
    const num = (op, dflt) => {
      const a = top.get(op);
      return a && a.length ? a[0] : dflt;
    };
    if (top.has(1230)) return { error: CffError.Unsupported("CID-keyed CFF") };
    if (num(1206, 2) !== 2) return { error: CffError.Unsupported("charstring type 1") };
    if (!top.has(17)) return { error: CffError.NoCharStrings };
    const charStrings2 = readIndex(v, num(17, 0)).items;
    const privArgs = top.get(18);
    const [privSize, privOff] = privArgs && privArgs.length >= 2 ? privArgs : [0, 0];
    const privR = readDict(bytes.subarray(privOff, privOff + privSize));
    if (privR.tag === "Err") return { error: CffError.Unsupported(`DICT: reserved byte ${privR.error}`) };
    const priv = privR.value;
    const subrs = priv.get(19);
    const lsubrs2 = subrs && subrs.length ? readIndex(v, privOff + subrs[0]).items : [];
    return { charStrings: charStrings2, gsubrs: gsubrs2.items, lsubrs: lsubrs2 };
  }, (f) => CffError.Truncated(f.at));
  if (parsed.tag === "Err") return parsed;
  if ("error" in parsed.value) return err(parsed.value.error);
  const { charStrings, gsubrs, lsubrs } = parsed.value;
  return ok({
    numGlyphs: charStrings.length,
    path: (gid) => gid < 0 || gid >= charStrings.length ? err(CffError.BadGlyph(gid)) : runCharstring(charStrings[gid], gsubrs, lsubrs, gid)
  });
}
function runCharstring(cs, gsubrs, lsubrs, gid) {
  const path = [];
  const st = [];
  let x = 0, y = 0, nStems = 0, open = false, widthDone = false, depth = 0;
  let fail = "";
  const stop = (why) => {
    if (!fail) fail = why;
    return true;
  };
  const finite = (...n) => {
    if (n.every(Number.isFinite)) return true;
    stop("stack underflow");
    return false;
  };
  const moveTo = (dx, dy) => {
    if (!finite(x + dx, y + dy)) return;
    if (open) path.push(Seg.Close);
    x += dx;
    y += dy;
    path.push(Seg.MoveTo(x, y));
    open = true;
  };
  const lineTo = (dx, dy) => {
    if (!finite(x + dx, y + dy)) return;
    x += dx;
    y += dy;
    path.push(Seg.LineTo(x, y));
  };
  const curveTo = (a, b, c, d, e, f) => {
    const x1 = x + a, y1 = y + b, x2 = x1 + c, y2 = y1 + d;
    if (!finite(x1, y1, x2, y2, x2 + e, y2 + f)) return;
    x = x2 + e;
    y = y2 + f;
    path.push(Seg.CubicTo(x1, y1, x2, y2, x, y));
  };
  const width = (hasExtra) => {
    if (!widthDone && hasExtra) st.shift();
    widthDone = true;
  };
  const stems = () => {
    width(st.length % 2 === 1);
    nStems += st.length >> 1;
    st.length = 0;
  };
  const exec = (code) => {
    if (++depth > 10) return stop("subroutine nesting > 10");
    const v = view(code);
    let i = 0;
    while (i < code.length) {
      const b0 = code[i];
      if (b0 >= 32 || b0 === 28) {
        if (b0 === 28) {
          st.push(i16(v, i + 1));
          i += 3;
        } else if (b0 <= 246) {
          st.push(b0 - 139);
          i++;
        } else if (b0 <= 250) {
          st.push((b0 - 247) * 256 + u8(v, i + 1) + 108);
          i += 2;
        } else if (b0 <= 254) {
          st.push(-(b0 - 251) * 256 - u8(v, i + 1) - 108);
          i += 2;
        } else {
          st.push(i32(v, i + 1) / 65536);
          i += 5;
        }
        if (st.length > 48) return stop("argument stack overflow");
        continue;
      }
      i++;
      switch (b0) {
        case 1:
        case 3:
        case 18:
        case 23:
          stems();
          break;
        // hstem vstem hstemhm vstemhm
        case 19:
        case 20:
          if (st.length) stems();
          width(false);
          i += nStems + 7 >> 3;
          break;
        case 21:
          width(st.length > 2);
          moveTo(st[0], st[1]);
          st.length = 0;
          break;
        // rmoveto
        case 22:
          width(st.length > 1);
          moveTo(st[0], 0);
          st.length = 0;
          break;
        // hmoveto
        case 4:
          width(st.length > 1);
          moveTo(0, st[0]);
          st.length = 0;
          break;
        // vmoveto
        case 5:
          for (let k = 0; k + 1 < st.length; k += 2) lineTo(st[k], st[k + 1]);
          st.length = 0;
          break;
        // rlineto
        case 6:
        case 7: {
          let horiz = b0 === 6;
          for (const d of st) {
            horiz ? lineTo(d, 0) : lineTo(0, d);
            horiz = !horiz;
          }
          st.length = 0;
          break;
        }
        case 8:
          for (let k = 0; k + 5 < st.length; k += 6) curveTo(st[k], st[k + 1], st[k + 2], st[k + 3], st[k + 4], st[k + 5]);
          st.length = 0;
          break;
        // rrcurveto
        case 24: {
          let k = 0;
          for (; k + 5 < st.length - 2; k += 6) curveTo(st[k], st[k + 1], st[k + 2], st[k + 3], st[k + 4], st[k + 5]);
          lineTo(st[k], st[k + 1]);
          st.length = 0;
          break;
        }
        case 25: {
          let k = 0;
          for (; k + 1 < st.length - 6; k += 2) lineTo(st[k], st[k + 1]);
          curveTo(st[k], st[k + 1], st[k + 2], st[k + 3], st[k + 4], st[k + 5]);
          st.length = 0;
          break;
        }
        case 26: {
          let k = 0, dx1 = 0;
          if (st.length % 2) dx1 = st[k++];
          for (; k + 3 < st.length; k += 4) {
            curveTo(dx1, st[k], st[k + 1], st[k + 2], 0, st[k + 3]);
            dx1 = 0;
          }
          st.length = 0;
          break;
        }
        case 27: {
          let k = 0, dy1 = 0;
          if (st.length % 2) dy1 = st[k++];
          for (; k + 3 < st.length; k += 4) {
            curveTo(st[k], dy1, st[k + 1], st[k + 2], st[k + 3], 0);
            dy1 = 0;
          }
          st.length = 0;
          break;
        }
        case 30:
        case 31: {
          let horiz = b0 === 31;
          for (let k = 0; k + 3 < st.length; k += 4) {
            const last = k + 4 >= st.length - 1;
            const f = last && st.length - k === 5 ? st[k + 4] : 0;
            if (horiz) curveTo(st[k], 0, st[k + 1], st[k + 2], f, st[k + 3]);
            else curveTo(0, st[k], st[k + 1], st[k + 2], st[k + 3], f);
            horiz = !horiz;
          }
          st.length = 0;
          break;
        }
        case 10:
        case 29: {
          const subrs = b0 === 10 ? lsubrs : gsubrs;
          if (st.length === 0) return stop("stack underflow");
          const idx = st[st.length - 1] + subrBias(subrs.length);
          st.length--;
          if (!(Number.isInteger(idx) && idx >= 0 && idx < subrs.length)) return stop(`subr ${idx} out of range`);
          if (exec(subrs[idx])) return true;
          break;
        }
        case 11:
          depth--;
          return false;
        // return
        case 14:
          if (st.length === 4 || st.length === 5) return stop("seac (endchar accent) unsupported");
          width(st.length > 0);
          if (open) path.push(Seg.Close);
          open = false;
          return true;
        case 12: {
          const op = code[i++];
          const a = st;
          if (op === 35) {
            curveTo(a[0], a[1], a[2], a[3], a[4], a[5]);
            curveTo(a[6], a[7], a[8], a[9], a[10], a[11]);
          } else if (op === 34) {
            curveTo(a[0], 0, a[1], a[2], a[3], 0);
            curveTo(a[4], 0, a[5], -a[2], a[6], 0);
          } else if (op === 36) {
            curveTo(a[0], a[1], a[2], a[3], a[4], 0);
            curveTo(a[5], 0, a[6], a[7], a[8], -(a[1] + a[3] + a[7]));
          } else if (op === 37) {
            const dx = a[0] + a[2] + a[4] + a[6] + a[8], dy = a[1] + a[3] + a[5] + a[7] + a[9];
            curveTo(a[0], a[1], a[2], a[3], a[4], a[5]);
            if (Math.abs(dx) > Math.abs(dy)) curveTo(a[6], a[7], a[8], a[9], a[10], -dy);
            else curveTo(a[6], a[7], a[8], a[9], -dx, a[10]);
          } else return stop(`escape operator 12 ${op} unsupported`);
          st.length = 0;
          break;
        }
        default:
          return stop(`reserved operator ${b0}`);
      }
    }
    depth--;
    return false;
  };
  const run2 = guard(() => exec(cs), () => "truncated");
  if (run2.tag === "Err") return err(CffError.Charstring(gid, run2.error));
  if (fail) return err(CffError.Charstring(gid, fail));
  if (open) path.push(Seg.Close);
  return ok(
    /** @type {import('../../outline/src/path.js').Path} */
    path
  );
}
function contoursToPath({ xs, ys, on, endPts }) {
  const out = [];
  let first = 0;
  for (const last of endPts) {
    const n = last - first + 1;
    if (n > 0) emitContour(out, xs, ys, on, first, n);
    first = last + 1;
  }
  return out;
}
function emitContour(out, xs, ys, on, first, n) {
  const X = (i) => xs[first + (i % n + n) % n];
  const Y = (i) => ys[first + (i % n + n) % n];
  const ON = (i) => on[first + (i % n + n) % n] === 1;
  let k = 0;
  while (k < n && !ON(k)) k++;
  let sx, sy, i0;
  if (k < n) {
    sx = X(k);
    sy = Y(k);
    i0 = k + 1;
  } else {
    sx = (X(n - 1) + X(0)) / 2;
    sy = (Y(n - 1) + Y(0)) / 2;
    i0 = 0;
    k = -1;
  }
  out.push(Seg.MoveTo(sx, sy));
  let ctrl = null;
  const stop = k < 0 ? n : k + n;
  for (let i = i0; i <= stop; i++) {
    const atEnd = i === stop;
    const x = atEnd ? sx : X(i), y = atEnd ? sy : Y(i);
    const isOn = atEnd || ON(i);
    if (isOn) {
      out.push(ctrl ? Seg.QuadTo(ctrl[0], ctrl[1], x, y) : Seg.LineTo(x, y));
      ctrl = null;
    } else {
      if (ctrl) out.push(Seg.QuadTo(ctrl[0], ctrl[1], (ctrl[0] + x) / 2, (ctrl[1] + y) / 2));
      ctrl = [x, y];
    }
  }
  out.push(Seg.Close);
}
var OutlineSource = variants("OutlineSource", {
  Glyf: ["glyph"],
  // (gid) => Result<Glyph> (quadratic); WOFF2 decodes on first use
  Cff: ["cff"]
  // { path(gid) } (cubic)
});
function buildFont(file, span = NOOP_SPAN) {
  const byTag = new Map(file.tables.map((t) => [t.tag, t]));
  const table = (t) => okOr(option(byTag.get(t)), TableError.Missing(t));
  const metrics = span.span("font.metrics", () => {
    const h = table("head");
    if (h.tag === "Err") return h;
    const head2 = parseHead(h.value.data);
    if (head2.tag === "Err") return head2;
    const hh = table("hhea");
    if (hh.tag === "Err") return hh;
    const hhea2 = parseHhea(hh.value.data);
    if (hhea2.tag === "Err") return hhea2;
    const mx = table("maxp");
    if (mx.tag === "Err") return mx;
    const maxp = parseMaxp(mx.value.data);
    if (maxp.tag === "Err") return maxp;
    return ok({ head: head2.value, hhea: hhea2.value, numGlyphs: maxp.value.numGlyphs });
  });
  if (metrics.tag === "Err") return metrics;
  const { head, hhea, numGlyphs } = metrics.value;
  const glyphOf = span.span("font.cmap", (cs) => {
    const c = table("cmap");
    if (c.tag === "Err") return c;
    const cands = cmapCandidates(c.value.data);
    if (cands.tag === "Err") return cands;
    if (cands.value.length === 0) return err(TableError.NoUnicodeCmap);
    cs.set("format", cands.value[0].tag);
    return cmapLookup(c.value.data, cands.value[0]);
  });
  if (glyphOf.tag === "Err") return glyphOf;
  const outlines = span.span("font.outlines", (s) => {
    if (byTag.has("glyf")) {
      const g = table("glyf");
      if (g.tag === "Err") return g;
      const accessor = Transform.match(g.value.transform, {
        GlyfV0: () => s.span("glyf.woff2-transform", (gs) => {
          const ix = indexGlyfV0(g.value.data, numGlyphs, gs);
          return ix.tag === "Err" ? ix : ok(ix.value.glyph);
        }),
        Identity: () => s.span("glyf.raw", () => {
          const l = table("loca");
          if (l.tag === "Err") return l;
          const arr = parseGlyfTable(g.value.data, l.value.data, numGlyphs, head.indexToLocFormat);
          if (arr.tag === "Err") return arr;
          const glyphs = arr.value;
          return ok((gid) => gid >= 0 && gid < glyphs.length ? ok(glyphs[gid]) : err(TableError.Invalid("glyf", `glyph ${gid}`)));
        }),
        _: (t) => err(TableError.Invalid("glyf", `transform ${t.tag}`))
      });
      if (accessor.tag === "Err") return accessor;
      s.set("format", "glyf");
      return ok(OutlineSource.Glyf(accessor.value));
    }
    const c = table("CFF ");
    if (c.tag === "Err") return c;
    const cff = parseCff(c.value.data);
    if (cff.tag === "Err") return cff;
    if (cff.value.numGlyphs !== numGlyphs) return err(TableError.Invalid("CFF ", `${cff.value.numGlyphs} charstrings, maxp says ${numGlyphs}`));
    s.set("format", "cff");
    return ok(OutlineSource.Cff(cff.value));
  });
  if (outlines.tag === "Err") return outlines;
  const source = outlines.value;
  const hm = table("hmtx");
  if (hm.tag === "Err") return hm;
  const hmtxData = hm.value.transform.tag !== "HmtxV1" ? ok(hm.value.data) : span.span("hmtx.woff2-transform", () => {
    if (source.tag !== "Glyf") return err(TableError.Invalid("hmtx", "transformed hmtx needs glyf for its side bearings"));
    const glyphAt = source.glyph;
    const xMin = (gid) => {
      const g = glyphAt(gid);
      return g.tag === "Ok" && g.value.tag !== "Empty" ? (
        /** @type {any} */
        g.value.bbox[0]
      ) : 0;
    };
    return reconstructHmtx(hm.value.data, numGlyphs, hhea.numberOfHMetrics, xMin);
  });
  if (hmtxData.tag === "Err") return hmtxData;
  const advances = span.span("font.hmtx", () => parseHmtx(hmtxData.value, hhea.numberOfHMetrics, numGlyphs));
  if (advances.tag === "Err") return advances;
  const adv = advances.value;
  const lsbs = parseLsb(hmtxData.value, hhea.numberOfHMetrics, numGlyphs);
  if (lsbs.tag === "Err") return lsbs;
  const lsb = lsbs.value;
  const memo2 = /* @__PURE__ */ new Map();
  const path = (gid, ps = NOOP_SPAN) => {
    const hit = memo2.get(gid);
    if (hit) return hit;
    const r = ps.span("glyph.path", { gid }, () => OutlineSource.match(source, {
      Glyf: ({ glyph }) => {
        const p = resolvePoints(glyph, gid);
        if (p.tag === "Err") return p;
        const path2 = contoursToPath(p.value);
        const g = glyph(gid);
        const shift = g.tag === "Ok" && g.value.tag !== "Empty" ? lsb[gid] - /** @type {any} */
        g.value.bbox[0] : 0;
        return ok(shift ? transform(path2, [1, 0, 0, 1, shift, 0]) : path2);
      },
      Cff: ({ cff }) => cff.path(gid)
    }));
    memo2.set(gid, r);
    return r;
  };
  return ok({
    container: file.container.tag,
    unitsPerEm: head.unitsPerEm,
    ascender: hhea.ascender,
    descender: hhea.descender,
    numGlyphs,
    glyphOf: glyphOf.value,
    advance: (gid) => gid >= 0 && gid < adv.length ? adv[gid] : 0,
    outlines: source,
    path,
    tables: new Map(file.tables.map((t) => [t.tag, t.tag === "hmtx" ? hmtxData.value : t.data]))
  });
}
async function loadFont(bytes, ports = {}) {
  const span = ports.span || NOOP_SPAN;
  return span.span("font.load", async (s) => {
    const file = await openFontFile(bytes, { brotli: jsBrotli, ...ports, span: s });
    if (file.tag === "Err") return file;
    return s.span("font.build", (bs) => buildFont(file.value, bs));
  });
}
function parseKern(b) {
  const v = view(b);
  const r = guard(() => {
    if (u16(v, 0) !== 0) return (
      /** @type {Kerner[]} */
      []
    );
    const n = u16(v, 2);
    const out = [];
    let o = 4;
    for (let t = 0; t < n && o + 6 <= b.length; t++) {
      const length = u16(v, o + 2), coverage2 = u16(v, o + 4);
      const format = coverage2 >> 8, horizontal = (coverage2 & 1) !== 0, cross = (coverage2 & 4) !== 0;
      if (format === 0 && horizontal && !cross) {
        const nPairs = u16(v, o + 6), base = o + 14;
        if (fits(v, base, nPairs * 6)) out.push(pairs(v, base, nPairs));
      }
      if (length < 6) break;
      o += length;
    }
    return out;
  }, () => "truncated");
  return r.tag === "Ok" ? r : ok([]);
}
function pairs(v, base, n) {
  return (left, right) => {
    const key = left * 65536 + right;
    let lo = 0, hi = n - 1;
    while (lo <= hi) {
      const m = lo + hi >> 1, at = base + m * 6;
      const k = u16(v, at) * 65536 + u16(v, at + 2);
      if (k === key) return i16(v, at + 4);
      if (k < key) lo = m + 1;
      else hi = m - 1;
    }
    return 0;
  };
}
function applyKern(subtables, buf, isMark) {
  for (const kern of subtables) {
    for (let i = 0; i < buf.length; ) {
      if (isMark(i)) {
        i++;
        continue;
      }
      let j = i + 1;
      while (j < buf.length && isMark(j)) j++;
      if (j >= buf.length) break;
      const k = kern(buf[i].gid, buf[j].gid);
      if (k) {
        const k1 = k >> 1, k2 = k - k1;
        buf[i].ax += k1;
        buf[j].ax += k2;
        buf[j].dx += k2;
      }
      i = j;
    }
  }
}
var CCC_RANGES = Object.freeze([768, 788, 230, 789, 789, 232, 790, 793, 220, 794, 794, 232, 795, 795, 216, 796, 800, 220, 801, 802, 202, 803, 806, 220, 807, 808, 202, 809, 819, 220, 820, 824, 1, 825, 828, 220, 829, 836, 230, 837, 837, 240, 838, 838, 230, 839, 841, 220, 842, 844, 230, 845, 846, 220, 848, 850, 230, 851, 854, 220, 855, 855, 230, 856, 856, 232, 857, 858, 220, 859, 859, 230, 860, 860, 233, 861, 862, 234, 863, 863, 233, 864, 865, 234, 866, 866, 233, 867, 879, 230, 1155, 1159, 230, 1425, 1425, 220, 1426, 1429, 230, 1430, 1430, 220, 1431, 1433, 230, 1434, 1434, 222, 1435, 1435, 220, 1436, 1441, 230, 1442, 1447, 220, 1448, 1449, 230, 1450, 1450, 220, 1451, 1452, 230, 1453, 1453, 222, 1454, 1454, 228, 1455, 1455, 230, 1456, 1456, 22, 1457, 1457, 15, 1458, 1458, 16, 1459, 1459, 17, 1460, 1460, 23, 1461, 1461, 18, 1462, 1462, 19, 1463, 1463, 20, 1464, 1464, 21, 1465, 1466, 14, 1467, 1467, 24, 1468, 1468, 12, 1469, 1469, 25, 1471, 1471, 13, 1473, 1473, 10, 1474, 1474, 11, 1476, 1476, 230, 1477, 1477, 220, 1479, 1479, 21, 1552, 1559, 230, 1560, 1560, 31, 1561, 1561, 32, 1562, 1562, 33, 1611, 1611, 28, 1612, 1612, 29, 1613, 1613, 30, 1614, 1614, 31, 1615, 1615, 32, 1616, 1616, 33, 1617, 1617, 27, 1618, 1618, 34, 1619, 1620, 230, 1621, 1622, 220, 1623, 1627, 230, 1628, 1628, 220, 1629, 1630, 230, 1631, 1631, 220, 1648, 1648, 35, 1750, 1756, 230, 1759, 1762, 230, 1763, 1763, 220, 1764, 1764, 230, 1767, 1768, 230, 1770, 1770, 220, 1771, 1772, 230, 1773, 1773, 220, 1809, 1809, 36, 1840, 1840, 230, 1841, 1841, 220, 1842, 1843, 230, 1844, 1844, 220, 1845, 1846, 230, 1847, 1849, 220, 1850, 1850, 230, 1851, 1852, 220, 1853, 1853, 230, 1854, 1854, 220, 1855, 1857, 230, 1858, 1858, 220, 1859, 1859, 230, 1860, 1860, 220, 1861, 1861, 230, 1862, 1862, 220, 1863, 1863, 230, 1864, 1864, 220, 1865, 1866, 230, 2027, 2033, 230, 2034, 2034, 220, 2035, 2035, 230, 2045, 2045, 220, 2070, 2073, 230, 2075, 2083, 230, 2085, 2087, 230, 2089, 2093, 230, 2137, 2139, 220, 2200, 2200, 230, 2201, 2203, 220, 2204, 2207, 230, 2250, 2254, 230, 2255, 2259, 220, 2260, 2273, 230, 2275, 2275, 220, 2276, 2277, 230, 2278, 2278, 220, 2279, 2280, 230, 2281, 2281, 220, 2282, 2284, 230, 2285, 2287, 220, 2288, 2288, 28, 2289, 2289, 29, 2290, 2290, 30, 2291, 2293, 230, 2294, 2294, 220, 2295, 2296, 230, 2297, 2298, 220, 2299, 2303, 230, 2364, 2364, 7, 2381, 2381, 9, 2385, 2385, 230, 2386, 2386, 220, 2387, 2388, 230, 2492, 2492, 7, 2509, 2509, 9, 2558, 2558, 230, 2620, 2620, 7, 2637, 2637, 9, 2748, 2748, 7, 2765, 2765, 9, 2876, 2876, 7, 2893, 2893, 9, 3021, 3021, 9, 3132, 3132, 7, 3149, 3149, 9, 3157, 3157, 4, 3158, 3158, 5, 3260, 3260, 7, 3277, 3277, 9, 3387, 3388, 9, 3405, 3405, 9, 3530, 3530, 9, 3640, 3641, 3, 3642, 3642, 9, 3656, 3659, 107, 3768, 3769, 118, 3770, 3770, 9, 3784, 3787, 122, 3864, 3865, 220, 3893, 3893, 220, 3895, 3895, 220, 3897, 3897, 127, 3953, 3953, 129, 3954, 3954, 132, 3956, 3956, 131, 3962, 3965, 132, 3968, 3968, 132, 3970, 3971, 230, 3972, 3972, 9, 3974, 3975, 230, 4038, 4038, 254, 4151, 4151, 7, 4153, 4154, 9, 4237, 4237, 220, 4957, 4959, 230, 5908, 5909, 9, 5940, 5940, 9, 6098, 6098, 9, 6109, 6109, 230, 6313, 6313, 228, 6457, 6457, 222, 6458, 6458, 230, 6459, 6459, 220, 6679, 6679, 230, 6680, 6680, 220, 6752, 6752, 254, 6773, 6780, 230, 6783, 6783, 220, 6832, 6836, 230, 6837, 6842, 220, 6843, 6844, 230, 6845, 6845, 220, 6847, 6848, 220, 6849, 6850, 230, 6851, 6852, 220, 6853, 6857, 230, 6858, 6858, 220, 6859, 6862, 230, 6964, 6964, 7, 6980, 6980, 9, 7019, 7019, 230, 7020, 7020, 220, 7021, 7027, 230, 7082, 7083, 9, 7142, 7142, 7, 7154, 7155, 9, 7223, 7223, 7, 7376, 7378, 230, 7380, 7380, 1, 7381, 7385, 220, 7386, 7387, 230, 7388, 7391, 220, 7392, 7392, 230, 7394, 7400, 1, 7405, 7405, 220, 7412, 7412, 230, 7416, 7417, 230, 7616, 7617, 230, 7618, 7618, 220, 7619, 7625, 230, 7626, 7626, 220, 7627, 7628, 230, 7629, 7629, 234, 7630, 7630, 214, 7631, 7631, 220, 7632, 7632, 202, 7633, 7669, 230, 7670, 7670, 232, 7671, 7672, 228, 7673, 7673, 220, 7674, 7674, 218, 7675, 7675, 230, 7676, 7676, 233, 7677, 7677, 220, 7678, 7678, 230, 7679, 7679, 220, 8400, 8401, 230, 8402, 8403, 1, 8404, 8407, 230, 8408, 8410, 1, 8411, 8412, 230, 8417, 8417, 230, 8421, 8422, 1, 8423, 8423, 230, 8424, 8424, 220, 8425, 8425, 230, 8426, 8427, 1, 8428, 8431, 220, 8432, 8432, 230, 11503, 11505, 230, 11647, 11647, 9, 11744, 11775, 230, 12330, 12330, 218, 12331, 12331, 228, 12332, 12332, 232, 12333, 12333, 222, 12334, 12335, 224, 12441, 12442, 8, 42607, 42607, 230, 42612, 42621, 230, 42654, 42655, 230, 42736, 42737, 230, 43014, 43014, 9, 43052, 43052, 9, 43204, 43204, 9, 43232, 43249, 230, 43307, 43309, 220, 43347, 43347, 9, 43443, 43443, 7, 43456, 43456, 9, 43696, 43696, 230, 43698, 43699, 230, 43700, 43700, 220, 43703, 43704, 230, 43710, 43711, 230, 43713, 43713, 230, 43766, 43766, 9, 44013, 44013, 9, 64286, 64286, 26, 65056, 65062, 230, 65063, 65069, 220, 65070, 65071, 230, 66045, 66045, 220, 66272, 66272, 220, 66422, 66426, 230, 68109, 68109, 220, 68111, 68111, 230, 68152, 68152, 230, 68153, 68153, 1, 68154, 68154, 220, 68159, 68159, 9, 68325, 68325, 230, 68326, 68326, 220, 68900, 68903, 230, 69291, 69292, 230, 69373, 69375, 220, 69446, 69447, 220, 69448, 69450, 230, 69451, 69451, 220, 69452, 69452, 230, 69453, 69456, 220, 69506, 69506, 230, 69507, 69507, 220, 69508, 69508, 230, 69509, 69509, 220, 69702, 69702, 9, 69744, 69744, 9, 69759, 69759, 9, 69817, 69817, 9, 69818, 69818, 7, 69888, 69890, 230, 69939, 69940, 9, 70003, 70003, 7, 70080, 70080, 9, 70090, 70090, 7, 70197, 70197, 9, 70198, 70198, 7, 70377, 70377, 7, 70378, 70378, 9, 70459, 70460, 7, 70477, 70477, 9, 70502, 70508, 230, 70512, 70516, 230, 70722, 70722, 9, 70726, 70726, 7, 70750, 70750, 230, 70850, 70850, 9, 70851, 70851, 7, 71103, 71103, 9, 71104, 71104, 7, 71231, 71231, 9, 71350, 71350, 9, 71351, 71351, 7, 71467, 71467, 9, 71737, 71737, 9, 71738, 71738, 7, 71997, 71998, 9, 72003, 72003, 7, 72160, 72160, 9, 72244, 72244, 9, 72263, 72263, 9, 72345, 72345, 9, 72767, 72767, 9, 73026, 73026, 7, 73028, 73029, 9, 73111, 73111, 9, 73537, 73538, 9, 92912, 92916, 1, 92976, 92982, 230, 94192, 94193, 6, 113822, 113822, 1, 119141, 119142, 216, 119143, 119145, 1, 119149, 119149, 226, 119150, 119154, 216, 119163, 119170, 220, 119173, 119177, 230, 119178, 119179, 220, 119210, 119213, 230, 119362, 119364, 230, 122880, 122886, 230, 122888, 122904, 230, 122907, 122913, 230, 122915, 122916, 230, 122918, 122922, 230, 123023, 123023, 230, 123184, 123190, 230, 123566, 123566, 230, 123628, 123631, 230, 124140, 124141, 232, 124142, 124142, 220, 124143, 124143, 230, 125136, 125142, 220, 125252, 125257, 230, 125258, 125258, 7]);
var LayoutError = variants("LayoutError", { Truncated: ["table", "at"] });
function coverage(v, o) {
  const m = /* @__PURE__ */ new Map();
  const fmt2 = u16(v, o);
  if (fmt2 === 1) {
    const n = u16(v, o + 2);
    for (let i = 0; i < n; i++) m.set(u16(v, o + 4 + i * 2), i);
  } else if (fmt2 === 2) {
    const n = u16(v, o + 2);
    for (let i = 0; i < n; i++) {
      const r = o + 4 + i * 6;
      const start = u16(v, r), end = u16(v, r + 2), idx = u16(v, r + 4);
      for (let g = start; g <= end; g++) m.set(g, idx + g - start);
    }
  }
  return m;
}
function coverageView(v, o) {
  const fmt2 = u16(v, o), n = u16(v, o + 2);
  const s = slice(v, o + 4, n * (fmt2 === 1 ? 2 : 6));
  const dv = s.dv, len2 = s.bytes.length === 0 ? 0 : n;
  const get = fmt2 === 1 ? (g) => {
    let lo = 0, hi = len2 - 1;
    while (lo <= hi) {
      const m = lo + hi >> 1, x = dv.getUint16(m * 2);
      if (x === g) return m;
      if (x < g) lo = m + 1;
      else hi = m - 1;
    }
    return -1;
  } : fmt2 === 2 ? (g) => {
    let lo = 0, hi = len2 - 1;
    while (lo <= hi) {
      const m = lo + hi >> 1, r = m * 6;
      const start = dv.getUint16(r), end = dv.getUint16(r + 2);
      if (g < start) hi = m - 1;
      else if (g > end) lo = m + 1;
      else return dv.getUint16(r + 4) + g - start;
    }
    return -1;
  } : () => -1;
  return { get, has: (g) => get(g) >= 0 };
}
function classView(v, o) {
  const fmt2 = u16(v, o);
  if (fmt2 === 1) {
    const start = u16(v, o + 2), n = u16(v, o + 4);
    const s = slice(v, o + 6, n * 2), dv = s.dv, len2 = s.bytes.length === 0 ? 0 : n;
    return (g) => g >= start && g < start + len2 ? dv.getUint16((g - start) * 2) : 0;
  }
  if (fmt2 === 2) {
    const n = u16(v, o + 2);
    const s = slice(v, o + 4, n * 6), dv = s.dv, len2 = s.bytes.length === 0 ? 0 : n;
    return (g) => {
      let lo = 0, hi = len2 - 1;
      while (lo <= hi) {
        const m = lo + hi >> 1, r = m * 6;
        const start = dv.getUint16(r), end = dv.getUint16(r + 2);
        if (g < start) hi = m - 1;
        else if (g > end) lo = m + 1;
        else return dv.getUint16(r + 4);
      }
      return 0;
    };
  }
  return () => 0;
}
function classDef(v, o) {
  const m = /* @__PURE__ */ new Map();
  const fmt2 = u16(v, o);
  if (fmt2 === 1) {
    const start = u16(v, o + 2), n = u16(v, o + 4);
    for (let i = 0; i < n; i++) m.set(start + i, u16(v, o + 6 + i * 2));
  } else if (fmt2 === 2) {
    const n = u16(v, o + 2);
    for (let i = 0; i < n; i++) {
      const r = o + 4 + i * 6;
      const start = u16(v, r), end = u16(v, r + 2), cls = u16(v, r + 4);
      for (let g = start; g <= end; g++) m.set(g, cls);
    }
  }
  return (g) => m.get(g) ?? 0;
}
var EMPTY_GDEF = Object.freeze({ glyphClass: () => 0, markAttachClass: () => 0, markSets: [], hasClasses: false });
function parseGdef(b) {
  const v = view(b);
  return guard(() => {
    const minor = u16(v, 2);
    const gc = u16(v, 4), mac = u16(v, 10);
    const ms = minor >= 2 ? u16(v, 12) : 0;
    const markSets = ms ? times(u16(v, ms + 2), (i) => coverage(v, ms + u32(v, ms + 4 + i * 4))) : [];
    return {
      glyphClass: gc ? classDef(v, gc) : () => 0,
      hasClasses: gc !== 0,
      markAttachClass: mac ? classDef(v, mac) : () => 0,
      markSets
    };
  }, (e) => LayoutError.Truncated("GDEF", e.at));
}
function applyFeatureVariations(v, features) {
  if (u16(v, 0) !== 1 || u16(v, 2) < 1) return;
  const fvo = u32(v, 10);
  if (!fvo) return;
  const n = u32(v, fvo + 4);
  if (!fits(v, fvo + 8, n * 8)) return;
  for (let r = 0; r < n; r++) {
    const cs = u32(v, fvo + 8 + r * 8), fts = u32(v, fvo + 12 + r * 8);
    let match = true;
    if (cs) {
      const nc = u16(v, fvo + cs);
      for (let c = 0; c < nc && match; c++) {
        const co = fvo + cs + u32(v, fvo + cs + 2 + c * 4);
        match = u16(v, co) === 1 && i16(v, co + 4) <= 0 && 0 <= i16(v, co + 6);
      }
    }
    if (!match) continue;
    if (fts) {
      const base = fvo + fts, count = u16(v, base + 4);
      for (let k = 0; k < count; k++) {
        const fi = u16(v, base + 6 + k * 6), alt = base + u32(v, base + 8 + k * 6);
        if (fi < features.length) features[fi] = { tag: features[fi].tag, lookups: times(u16(v, alt + 2), (j) => u16(v, alt + 4 + j * 2)) };
      }
    }
    return;
  }
}
function parseLayout(b, which, span = NOOP_SPAN) {
  const v = view(b);
  const extType = which === "GSUB" ? 7 : 9;
  return guard(() => {
    const sl = u16(v, 4), fl = u16(v, 6), ll = u16(v, 8);
    const scripts = /* @__PURE__ */ new Map();
    span.span("layout.scripts", { atomic: true, items: u16(v, sl) }, () => {
      const langSys = /* @__PURE__ */ new Map();
      const parseLangSys = (at) => {
        const known = langSys.get(at);
        if (known) return known;
        const req = u16(v, at + 2);
        const list = times(u16(v, at + 4), (k) => u16(v, at + 6 + k * 2));
        const parsed = req === 65535 ? list : [req, ...list];
        langSys.set(at, parsed);
        return parsed;
      };
      times(u16(v, sl), (i) => {
        const s = sl + u16(v, sl + 6 + i * 6);
        const dl = u16(v, s);
        scripts.set(tag2(v, sl + 2 + i * 6), { defaultLang: dl ? parseLangSys(s + dl) : [] });
      });
    });
    const features = span.span("layout.features", { atomic: true, items: u16(v, fl) }, () => times(u16(v, fl), (i) => {
      const f = fl + u16(v, fl + 6 + i * 6);
      return { tag: tag2(v, fl + 2 + i * 6), lookups: times(u16(v, f + 2), (k) => u16(v, f + 4 + k * 2)) };
    }));
    span.span("layout.featureVariations", () => applyFeatureVariations(v, features));
    const lookups = span.span("layout.lookups", { atomic: true, items: u16(v, ll) }, () => times(u16(v, ll), (index) => {
      const l = ll + u16(v, ll + 2 + index * 2);
      let type = u16(v, l);
      const flag = u16(v, l + 2);
      const n = u16(v, l + 4);
      let subtables = times(n, (k) => l + u16(v, l + 6 + k * 2));
      if (type === extType && n > 0) {
        type = u16(v, subtables[0] + 2);
        subtables = subtables.map((s) => s + u32(v, s + 4));
      }
      const markSet = flag & 16 ? u16(v, l + 6 + n * 2) : -1;
      return { index, type, flag, markSet, subtables };
    }));
    return { v, scripts, features, lookups };
  }, (e) => LayoutError.Truncated(which, e.at));
}
function selectLookups(t, scriptPrefs, enabled) {
  const script = scriptPrefs.map((s) => t.scripts.get(s)).find(Boolean);
  if (!script) return { lookups: (
    /** @type {Lookup[]} */
    []
  ), features: (
    /** @type {string[]} */
    []
  ) };
  const feats = script.defaultLang.map((i) => t.features[i]).filter((f) => f && enabled.has(f.tag));
  const idx = [...new Set(feats.flatMap((f) => f.lookups))].sort((a, b) => a - b);
  return { lookups: idx.map((i) => t.lookups[i]).filter(Boolean), features: [...new Set(feats.map((f) => f.tag))] };
}
var SYNTH_MARK = /^\p{Mn}$/u;
var DEFAULT_IGNORABLE = /^\p{Default_Ignorable_Code_Point}$/u;
var UNICODE_MARK = /^\p{M}$/u;
var PICTOGRAPHIC = /^\p{Extended_Pictographic}$/u;
var isRI = (cp) => cp >= 127462 && cp <= 127487;
function combiningClass(cp) {
  let lo = 0, hi = CCC_RANGES.length / 3 - 1;
  while (lo <= hi) {
    const m = lo + hi >> 1, a = CCC_RANGES[3 * m], b = CCC_RANGES[3 * m + 1];
    if (cp < a) hi = m - 1;
    else if (cp > b) lo = m + 1;
    else return CCC_RANGES[3 * m + 2];
  }
  return 0;
}
function reorderMarks(buf, ccc) {
  for (let i = 0; i < buf.length; i++) {
    if (!ccc[i]) continue;
    let end = i + 1;
    while (end < buf.length && ccc[end]) end++;
    if (end - i <= 32) {
      for (let a = i + 1; a < end; a++) {
        let j = a;
        while (j > i && ccc[j - 1] > ccc[a]) j--;
        if (j === a) continue;
        const cl = Math.min(...buf.slice(j, a + 1).map((g) => g.cluster));
        for (let k = j; k <= a; k++) buf[k].cluster = cl;
        buf.splice(j, 0, ...buf.splice(a, 1));
        ccc.splice(j, 0, ...ccc.splice(a, 1));
      }
    }
    i = end - 1;
  }
}
function graphemeClusters(chars) {
  const cont = new Array(chars.length).fill(false);
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i], cp = (
      /** @type {number} */
      ch.codePointAt(0)
    );
    if (cp < 128) continue;
    if (UNICODE_MARK.test(ch) || cp >= 127995 && cp <= 127999 || cp >= 65438 && cp <= 65439 || cp >= 917536 && cp <= 917631) cont[i] = true;
    else if (i && isRI(cp)) {
      if (isRI(
        /** @type {number} */
        chars[i - 1].codePointAt(0)
      ) && !cont[i - 1]) cont[i] = true;
    } else if (cp === 8205) {
      cont[i] = true;
      if (i + 1 < chars.length && PICTOGRAPHIC.test(chars[i + 1])) cont[++i] = true;
    }
  }
  const out = new Array(chars.length);
  for (let i = 0, start = 0; i < chars.length; i++) {
    if (!cont[i]) start = i;
    out[i] = start;
  }
  return out;
}
var DEFAULT_GSUB = Object.freeze(/* @__PURE__ */ new Set(["rvrn", "ccmp", "locl", "rlig", "calt", "clig", "liga", "rclt"]));
var DEFAULT_GPOS = Object.freeze(/* @__PURE__ */ new Set(["kern", "mark", "mkmk", "curs", "dist", "abvm", "blwm"]));
var Skipped = variants("Skipped", { Lookup: ["table", "index", "type", "format"] });
function prepare(font, span = NOOP_SPAN) {
  const hit = prepared.get(font);
  if (hit) return hit;
  const gsubB = font.tables.get("GSUB"), gposB = font.tables.get("GPOS"), gdefB = font.tables.get("GDEF");
  const gsub = gsubB ? span.span("layout.parse.gsub", { bytes: gsubB.length }, (ps) => parseLayout(gsubB, "GSUB", ps)) : ok(null);
  const gpos = gposB ? span.span("layout.parse.gpos", { bytes: gposB.length }, (ps) => parseLayout(gposB, "GPOS", ps)) : ok(null);
  const gdef = gdefB ? span.span("layout.parse.gdef", { bytes: gdefB.length }, () => parseGdef(gdefB)) : ok(EMPTY_GDEF);
  const kernB = font.tables.get("kern");
  const kern = kernB ? span.span("layout.parse.kern", { bytes: kernB.length }, () => parseKern(kernB)) : ok(
    /** @type {import('./kern.js').Kerner[]} */
    []
  );
  const r = gsub.tag === "Err" ? gsub : gpos.tag === "Err" ? gpos : gdef.tag === "Err" ? gdef : kern.tag === "Err" ? kern : ok({ gsub: gsub.value, gpos: gpos.value, gdef: gdef.value, kern: kern.value });
  prepared.set(font, r);
  return r;
}
var prepared = /* @__PURE__ */ new WeakMap();
function shape(font, text, { gsubFeatures = DEFAULT_GSUB, gposFeatures = DEFAULT_GPOS, span = NOOP_SPAN } = {}) {
  return span.span("shape", { chars: text.length }, (s) => {
    const p = s.span("shape.prepare", (ps) => prepare(font, ps));
    if (p.tag === "Err") {
      s.fail(JSON.stringify(p.error));
      return err(p.error);
    }
    const { gsub, gpos, gdef, kern } = p.value;
    const buf = s.span("shape.cmap", { atomic: true, items: text.length }, () => ((chars) => {
      const cl = graphemeClusters(chars);
      return chars.map((ch, i) => ({
        gid: font.glyphOf(
          /** @type {number} */
          ch.codePointAt(0)
        ),
        cluster: cl[i],
        ax: 0,
        ay: 0,
        dx: 0,
        dy: 0,
        // Internal: synthesised glyph class (HarfBuzz hb_synthesize_glyph_classes: a mark iff the
        // character is general category Mn and not default-ignorable), used when GDEF has no
        // GlyphClassDef; and the GPOS attachment chain (relative index) and type, 1 mark, 2 cursive.
        k: SYNTH_MARK.test(ch) && !DEFAULT_IGNORABLE.test(ch) ? 3 : 1,
        chain: 0,
        atype: 0
      }));
    })([...text]));
    s.span("shape.reorder", { atomic: true, items: buf.length }, () => reorderMarks(buf, [...text].map((ch) => combiningClass(
      /** @type {number} */
      ch.codePointAt(0)
    ))));
    const skipped = [];
    const scripts = ["latn", "DFLT", "dflt"];
    if (gsub) s.span("shape.gsub", (gs) => {
      const { sel, ctx } = gs.span("gsub.select", () => ({ sel: selectLookups(gsub, scripts, gsubFeatures), ctx: context(gsub, gdef, buf, "GSUB", skipped) }));
      gs.set("features", sel.features);
      gs.set("lookups", sel.lookups.length);
      for (const l of sel.lookups) traceLookup(gs, ctx, l);
    });
    s.span("shape.advances", { atomic: true, items: buf.length }, () => {
      for (const g of buf) g.ax = font.advance(g.gid);
    });
    for (const g of buf) {
      g.chain = 0;
      g.atype = 0;
    }
    const klassAt = (i) => gdef.hasClasses ? gdef.glyphClass(buf[i].gid) : buf[i].k;
    if (gpos) s.span("shape.gpos", (gs) => {
      const { sel, ctx } = gs.span("gpos.select", () => ({ sel: selectLookups(gpos, scripts, gposFeatures), ctx: context(gpos, gdef, buf, "GPOS", skipped) }));
      gs.set("features", sel.features);
      gs.set("lookups", sel.lookups.length);
      for (const l of sel.lookups) traceLookup(gs, ctx, l);
    });
    if (kern.length && gposFeatures.has("kern") && !(gpos && gpos.features.some((f) => f.tag === "kern"))) {
      s.span("shape.kern", { atomic: true, items: buf.length }, () => applyKern(kern, buf, (i) => klassAt(i) === 3));
    }
    s.span("shape.finish", { atomic: true, items: buf.length }, () => finishPositions(buf, klassAt, !!(gpos && gpos.lookups.length)));
    if (skipped.length) s.set("skippedSubtables", skipped.length);
    s.set("glyphs", buf.length);
    return ok(buf.map((g) => ({ gid: g.gid, cluster: g.cluster, ax: g.ax, ay: g.ay, dx: g.dx, dy: g.dy })));
  });
}
var SHAPE_LIMITS = Object.freeze({ opsPerGlyph: 64, minOps: 16384, growth: 32, minLen: 8192, nesting: 8 });
function context(t, gdef, buf, table, skipped) {
  const covCache = /* @__PURE__ */ new Map();
  const clsCache = /* @__PURE__ */ new Map();
  const L = SHAPE_LIMITS;
  return {
    v: t.v,
    lookups: t.lookups,
    gdef,
    buf,
    table,
    skipped,
    ops: Math.max(L.minOps, L.opsPerGlyph * buf.length),
    maxLen: Math.max(L.minLen, L.growth * buf.length),
    depth: 0,
    /** Why shaping stopped early ('' = it did not): a budget, as a value. */
    stopped: "",
    /** Glyph class at buffer position i: GDEF's when it has classes, else the synthesised one. */
    klass: (i) => gdef.hasClasses ? gdef.glyphClass(buf[i].gid) : buf[i].k,
    cov: (o) => {
      let c = covCache.get(o);
      if (!c) covCache.set(o, c = coverageView(t.v, o));
      return c;
    },
    cls: (o) => {
      let c = clsCache.get(o);
      if (!c) clsCache.set(o, c = classView(t.v, o));
      return c;
    }
  };
}
function ignored(c, l, i) {
  const gid = c.buf[i].gid, k = c.klass(i);
  if (l.flag & 2 && k === 1) return true;
  if (l.flag & 4 && k === 2) return true;
  if (l.flag & 8 && k === 3) return true;
  if (k === 3) {
    if (l.flag & 16) {
      const ms = c.gdef.markSets;
      return !(l.markSet < ms.length && ms[l.markSet].has(gid));
    }
    const t = l.flag >> 8;
    if (t && c.gdef.markAttachClass(gid) !== t) return true;
  }
  return false;
}
var next = (c, l, i) => {
  for (let j = i + 1; j < c.buf.length; j++) if (!ignored(c, l, j)) return j;
  return -1;
};
var prev = (c, l, i) => {
  for (let j = i - 1; j >= 0; j--) if (!ignored(c, l, j)) return j;
  return -1;
};
function traceLookup(span, c, l) {
  if (c.stopped) return;
  span.span(`${c.table.toLowerCase()}.lookup`, { atomic: true, index: l.index, type: l.type, subtables: l.subtables.length, items: c.buf.length }, (ls) => {
    const before = c.buf.map((g) => ({ ...g }));
    const r = guard(() => runLookup(c, l), (f) => f);
    if (r.tag === "Err") {
      c.buf.length = 0;
      for (const g of before) c.buf.push(g);
      c.skipped.push(Skipped.Lookup(c.table, l.index, l.type, "malformed"));
      ls.set("malformed", true);
      return;
    }
    if (c.stopped) {
      c.skipped.push(Skipped.Lookup(c.table, l.index, l.type, `budget: ${c.stopped}`));
      ls.set("budget", c.stopped);
    }
    if (ls.recording) ls.set("applied", r.value);
  });
}
function runLookup(c, l) {
  let applied = 0;
  if (c.table === "GSUB" && l.type === 8) {
    for (let i2 = c.buf.length - 1; i2 >= 0 && !c.stopped; i2--) if (!ignored(c, l, i2) && applyAt(c, l, i2) !== -1) applied++;
    return applied;
  }
  let i = 0;
  while (i < c.buf.length && !c.stopped) {
    if (ignored(c, l, i)) {
      i++;
      continue;
    }
    const r = applyAt(c, l, i);
    if (r >= 0) applied++;
    i = r < 0 ? i + 1 : r;
  }
  return applied;
}
function applyAt(c, l, i) {
  if (--c.ops < 0) {
    c.stopped = "operations";
    return -1;
  }
  if (c.buf.length > c.maxLen) {
    c.stopped = "buffer length";
    return -1;
  }
  for (const off of l.subtables) {
    const r = c.table === "GSUB" ? gsubSubtable(c, l, off, i) : gposSubtable(c, l, off, i);
    if (r >= 0) return r;
  }
  return -1;
}
var skip = (c, l, off) => {
  c.skipped.push(Skipped.Lookup(c.table, l.index, l.type, u16(c.v, off)));
  return -1;
};
function gsubSubtable(c, l, off, i) {
  const { v, buf } = c;
  const fmt2 = u16(v, off);
  const g = buf[i].gid;
  switch (l.type) {
    case 1: {
      const ci = c.cov(off + u16(v, off + 2)).get(g);
      if (ci < 0) return -1;
      buf[i].gid = fmt2 === 1 ? g + i16(v, off + 4) & 65535 : u16(v, off + 6 + ci * 2);
      return i + 1;
    }
    case 2:
    case 3: {
      const ci = c.cov(off + u16(v, off + 2)).get(g);
      if (ci < 0) return -1;
      const seq = off + u16(v, off + 6 + ci * 2);
      const n = u16(v, seq);
      const gids = times(n, (k) => u16(v, seq + 2 + k * 2));
      if (l.type === 3) {
        if (n) buf[i].gid = gids[0];
        return i + 1;
      }
      buf.splice(i, 1, ...gids.map((gid) => ({ ...buf[i], gid })));
      return i + n;
    }
    case 4: {
      const ci = c.cov(off + u16(v, off + 2)).get(g);
      if (ci < 0) return -1;
      const set = off + u16(v, off + 6 + ci * 2);
      for (let k = 0, n = u16(v, set); k < n; k++) {
        const lig = set + u16(v, set + 2 + k * 2);
        const ligGlyph = u16(v, lig), comps = u16(v, lig + 2);
        const pos = [i];
        for (let m = 1; m < comps; m++) {
          const j = next(c, l, pos[pos.length - 1]);
          if (j < 0 || buf[j].gid !== u16(v, lig + 4 + (m - 1) * 2)) break;
          pos.push(j);
        }
        if (pos.length !== comps) continue;
        const cluster = Math.min(...buf.slice(i, pos[pos.length - 1] + 1).map((x) => x.cluster));
        for (let k2 = i; k2 <= pos[pos.length - 1]; k2++) buf[k2].cluster = cluster;
        buf[i].gid = ligGlyph;
        buf[i].k = 2;
        for (const j of pos.slice(1).reverse()) buf.splice(j, 1);
        return i + 1;
      }
      return -1;
    }
    case 5:
    case 6:
      return contextual(c, l, off, i, l.type === 6);
    case 8: {
      const ci = c.cov(off + u16(v, off + 2)).get(g);
      if (ci < 0) return -1;
      const nb = u16(v, off + 4);
      const back = times(nb, (k) => off + u16(v, off + 6 + k * 2));
      const la = off + 6 + nb * 2;
      const nl = u16(v, la);
      const ahead = times(nl, (k) => off + u16(v, la + 2 + k * 2));
      if (!matchCoverages(c, l, i, back, -1) || !matchCoverages(c, l, i, ahead, 1)) return -1;
      buf[i].gid = u16(v, la + 2 + nl * 2 + 2 + ci * 2);
      return i - 1;
    }
    default:
      return skip(c, l, off);
  }
}
function valueRecord(c, o, fmt2) {
  const r = { dx: 0, dy: 0, ax: 0, ay: 0 };
  let p = o;
  if (fmt2 & 1) {
    r.dx = i16(c.v, p);
    p += 2;
  }
  if (fmt2 & 2) {
    r.dy = i16(c.v, p);
    p += 2;
  }
  if (fmt2 & 4) {
    r.ax = i16(c.v, p);
    p += 2;
  }
  if (fmt2 & 8) {
    r.ay = i16(c.v, p);
    p += 2;
  }
  for (const bit of [16, 32, 64, 128]) if (fmt2 & bit) p += 2;
  return (
    /** @type {const} */
    [r, p - o]
  );
}
var vrSize = (fmt2) => {
  let n = 0;
  for (let b = fmt2 & 255; b; b >>= 1) n += b & 1;
  return n * 2;
};
var addValue = (g, r) => {
  g.dx += r.dx;
  g.dy += r.dy;
  g.ax += r.ax;
  g.ay += r.ay;
};
function gposSubtable(c, l, off, i) {
  const { v, buf } = c;
  const fmt2 = u16(v, off);
  const g = buf[i].gid;
  switch (l.type) {
    case 1: {
      const ci = c.cov(off + u16(v, off + 2)).get(g);
      if (ci < 0) return -1;
      const vf = u16(v, off + 4);
      const at = fmt2 === 1 ? off + 6 : off + 8 + ci * vrSize(vf);
      addValue(buf[i], valueRecord(c, at, vf)[0]);
      return i + 1;
    }
    case 2: {
      const ci = c.cov(off + u16(v, off + 2)).get(g);
      if (ci < 0) return -1;
      const j = next(c, l, i);
      if (j < 0) return -1;
      const vf1 = u16(v, off + 4), vf2 = u16(v, off + 6);
      const s1 = vrSize(vf1), s2 = vrSize(vf2);
      let rec = -1;
      if (fmt2 === 1) {
        const set = off + u16(v, off + 10 + ci * 2);
        const n = u16(v, set), stride = 2 + s1 + s2;
        let lo = 0, hi = n - 1;
        while (lo <= hi) {
          const m = lo + hi >> 1, second = u16(v, set + 2 + m * stride);
          if (second === buf[j].gid) {
            rec = set + 2 + m * stride + 2;
            break;
          }
          if (second < buf[j].gid) lo = m + 1;
          else hi = m - 1;
        }
      } else if (fmt2 === 2) {
        const k1 = c.cls(off + u16(v, off + 8))(g), k2 = c.cls(off + u16(v, off + 10))(buf[j].gid);
        const n1 = u16(v, off + 12), n2 = u16(v, off + 14);
        if (k1 < n1 && k2 < n2) rec = off + 16 + (k1 * n2 + k2) * (s1 + s2);
      } else return skip(c, l, off);
      if (rec < 0) return -1;
      addValue(buf[i], valueRecord(c, rec, vf1)[0]);
      addValue(buf[j], valueRecord(c, rec + s1, vf2)[0]);
      return vf2 ? j + 1 : j;
    }
    case 3:
      return cursive(c, l, off, i);
    case 4:
    case 5:
    case 6:
      return markAttach(c, l, off, i);
    case 7:
    case 8:
      return contextual(c, l, off, i, l.type === 8);
    default:
      return skip(c, l, off);
  }
}
var anchor = (c, at) => at ? [i16(c.v, at + 2), i16(c.v, at + 4)] : null;
var prevNonMark = (c, i) => {
  for (let j = i - 1; j >= 0; j--) if (c.klass(j) !== 3) return j;
  return -1;
};
function markAttach(c, l, off, i) {
  const { v, buf } = c;
  if (u16(v, off) !== 1) return skip(c, l, off);
  const mi = c.cov(off + u16(v, off + 2)).get(buf[i].gid);
  if (mi < 0) return -1;
  const classCount = u16(v, off + 6), markArray = off + u16(v, off + 8), baseArrayOff = off + u16(v, off + 10);
  let j = -1, row = 0;
  if (l.type === 4 || l.type === 5) {
    j = prevNonMark(c, i);
    if (j < 0) return -1;
    const bi = c.cov(off + u16(v, off + 4)).get(buf[j].gid);
    if (bi < 0) return -1;
    if (l.type === 4) row = baseArrayOff + 2 + bi * classCount * 2;
    else {
      const attach = baseArrayOff + u16(v, baseArrayOff + 2 + bi * 2), comps = u16(v, attach);
      if (!comps) return -1;
      row = attach + 2 + (comps - 1) * classCount * 2;
      return attachMark(c, markArray, mi, attach, row, classCount, i, j);
    }
    return attachMark(c, markArray, mi, baseArrayOff, row, classCount, i, j);
  }
  const flags = { ...l, flag: l.flag & ~14 };
  j = prev(c, flags, i);
  if (j < 0 || c.klass(j) !== 3) return -1;
  const m2 = c.cov(off + u16(v, off + 4)).get(buf[j].gid);
  if (m2 < 0) return -1;
  return attachMark(c, markArray, mi, baseArrayOff, baseArrayOff + 2 + m2 * classCount * 2, classCount, i, j);
}
function attachMark(c, markArray, mi, base, row, classCount, i, j) {
  const { v, buf } = c;
  const rec = markArray + 2 + mi * 4, klass = u16(v, rec);
  if (klass >= classCount) return -1;
  const markOff = u16(v, rec + 2);
  const markA = anchor(c, markOff ? markArray + markOff : 0);
  const baseOff = u16(v, row + klass * 2);
  const baseA = anchor(c, baseOff ? base + baseOff : 0);
  if (!markA || !baseA) return -1;
  let cross = buf[j].dy;
  for (let k = j, n = 0; buf[k].atype === 2 && buf[k].chain && n < 64; n++) {
    k += buf[k].chain;
    if (k < 0 || k >= buf.length) break;
    cross += buf[k].dy;
  }
  const g = buf[i];
  g.chain = j - i;
  g.atype = 1;
  g.dx = Math.round(baseA[0] - markA[0]);
  g.dy = Math.round(baseA[1] - markA[1]) + cross;
  return i + 1;
}
function cursive(c, l, off, i) {
  const { v, buf } = c;
  if (u16(v, off) !== 1) return skip(c, l, off);
  const cov = c.cov(off + u16(v, off + 2));
  const ci = cov.get(buf[i].gid);
  if (ci < 0) return -1;
  const entryOff = u16(v, off + 6 + ci * 4);
  if (!entryOff) return -1;
  const p = prev(c, l, i);
  if (p < 0) return -1;
  const pi = cov.get(buf[p].gid);
  if (pi < 0) return -1;
  const exitOff = u16(v, off + 6 + pi * 4 + 2);
  if (!exitOff) return -1;
  const exit = (
    /** @type {number[]} */
    anchor(c, off + exitOff)
  ), entry = (
    /** @type {number[]} */
    anchor(c, off + entryOff)
  );
  buf[p].ax = Math.round(exit[0]) + buf[p].dx;
  const d = Math.round(entry[0]) + buf[i].dx;
  buf[i].ax -= d;
  buf[i].dx -= d;
  let child = p, parent = i, y = Math.round(entry[1] - exit[1]);
  if (!(l.flag & 1)) {
    child = i;
    parent = p;
    y = -y;
  }
  reverseCursive(buf, child, parent, 0);
  buf[child].chain = parent - child;
  buf[child].atype = 2;
  buf[child].dy = y;
  if (buf[parent].chain === -buf[child].chain) {
    buf[parent].chain = 0;
    buf[parent].dy = 0;
  }
  return i + 1;
}
function reverseCursive(buf, i, newParent, depth) {
  if (depth > 64) return;
  const chain = buf[i].chain, type = buf[i].atype;
  if (!chain || type !== 2) return;
  buf[i].chain = 0;
  const j = i + chain;
  if (j < 0 || j >= buf.length || j === newParent) return;
  reverseCursive(buf, j, newParent, depth + 1);
  buf[j].dy = -buf[i].dy;
  buf[j].chain = -chain;
  buf[j].atype = type;
}
function finishPositions(buf, klass, hadGpos) {
  for (let i = 0; i < buf.length; i++) if (klass(i) === 3) {
    if (!hadGpos) {
      buf[i].dx -= buf[i].ax;
      buf[i].dy -= buf[i].ay;
    }
    buf[i].ax = 0;
    buf[i].ay = 0;
  }
  for (let i = 0; i < buf.length; i++) if (buf[i].chain) propagate(buf, i, 64);
}
function propagate(buf, i, nesting) {
  const chain = buf[i].chain, type = buf[i].atype;
  buf[i].chain = 0;
  const j = i + chain;
  if (j < 0 || j >= buf.length || !nesting) return;
  if (buf[j].chain) propagate(buf, j, nesting - 1);
  if (type === 2) {
    buf[i].dy += buf[j].dy;
    return;
  }
  buf[i].dx += buf[j].dx;
  if (j < i) for (let k = j; k < i; k++) {
    buf[i].dx -= buf[k].ax;
    buf[i].dy -= buf[k].ay;
  }
  else for (let k = i; k < j; k++) {
    buf[i].dx += buf[k].ax;
    buf[i].dy += buf[k].ay;
  }
}
function matchCoverages(c, l, i, covs, dir) {
  let j = i;
  for (const o of covs) {
    j = dir > 0 ? next(c, l, j) : prev(c, l, j);
    if (j < 0 || !c.cov(o).has(c.buf[j].gid)) return null;
  }
  return j;
}
function matchSeq(c, l, i, n, test, dir) {
  const pos = [];
  let j = i;
  for (let k = 0; k < n; k++) {
    j = dir > 0 ? next(c, l, j) : prev(c, l, j);
    if (j < 0 || !test(k, c.buf[j].gid)) return null;
    pos.push(j);
  }
  return pos;
}
function contextual(c, l, off, i, chained) {
  const { v, buf } = c;
  const fmt2 = u16(v, off);
  const g = buf[i].gid;
  if (fmt2 === 1 || fmt2 === 2) {
    if (c.cov(off + u16(v, off + 2)).get(g) < 0) return -1;
    const id = (x) => x;
    const [setsAt, bk, inp, la] = fmt2 === 1 ? [off + 6, id, id, id] : chained ? [off + 12, c.cls(off + u16(v, off + 4)), c.cls(off + u16(v, off + 6)), c.cls(off + u16(v, off + 8))] : [off + 8, id, c.cls(off + u16(v, off + 4)), id];
    const key = fmt2 === 1 ? c.cov(off + u16(v, off + 2)).get(g) : inp(g);
    if (key >= u16(v, setsAt - 2)) return -1;
    const setOff = u16(v, setsAt + key * 2);
    if (!setOff) return -1;
    const set = off + setOff;
    const arr = (at, n) => times(n, (k) => u16(v, at + k * 2));
    const eq = (f, want) => (k, gid) => f(gid) === want[k];
    for (let r = 0, nr = u16(v, set); r < nr; r++) {
      let p = set + u16(v, set + 2 + r * 2);
      let back = (
        /** @type {number[]} */
        []
      ), ahead = (
        /** @type {number[]} */
        []
      ), nRec = 0;
      if (chained) {
        const nb = u16(v, p);
        back = arr(p + 2, nb);
        p += 2 + nb * 2;
      }
      const ni = u16(v, p);
      p += 2;
      if (!chained) {
        nRec = u16(v, p);
        p += 2;
      }
      const input = arr(p, ni - 1);
      p += (ni - 1) * 2;
      if (chained) {
        const na = u16(v, p);
        ahead = arr(p + 2, na);
        p += 2 + na * 2;
        nRec = u16(v, p);
        p += 2;
      }
      const inPos = matchSeq(c, l, i, input.length, eq(inp, input), 1);
      if (!inPos) continue;
      if (!matchSeq(c, l, i, back.length, eq(bk, back), -1)) continue;
      if (!matchSeq(c, l, inPos.length ? inPos[inPos.length - 1] : i, ahead.length, eq(la, ahead), 1)) continue;
      return applyRecords(c, l, [i, ...inPos], p, nRec);
    }
    return -1;
  }
  if (fmt2 === 3) {
    let p = off + 2;
    const nb = chained ? u16(v, p) : 0;
    if (chained) p += 2 + nb * 2;
    const ni = u16(v, p);
    const covAt = chained ? p + 2 : p + 4;
    if (ni === 0 || !c.cov(off + u16(v, covAt)).has(g)) return -1;
    const nLookPlain = chained ? 0 : u16(v, p + 2);
    const back = times(nb, (k) => off + u16(v, off + 4 + k * 2));
    const input = times(ni, (k) => off + u16(v, covAt + k * 2));
    p = covAt + ni * 2;
    let ahead = [];
    if (chained) {
      const na = u16(v, p);
      ahead = times(na, (k) => off + u16(v, p + 2 + k * 2));
      p += 2 + na * 2;
    }
    const inPos = matchSeq(c, l, i, ni - 1, (k, gid) => c.cov(input[k + 1]).has(gid), 1);
    if (!inPos) return -1;
    if (chained && matchCoverages(c, l, i, back, -1) === null) return -1;
    const last = inPos.length ? inPos[inPos.length - 1] : i;
    if (chained && matchCoverages(c, l, last, ahead, 1) === null) return -1;
    return chained ? applyRecords(c, l, [i, ...inPos], p + 2, u16(v, p)) : applyRecords(c, l, [i, ...inPos], p, nLookPlain);
  }
  return skip(c, l, off);
}
function applyRecords(c, l, pos, at, n) {
  pos = [...pos];
  let end = pos[pos.length - 1] + 1;
  for (let r = 0; r < n; r++) {
    const seq = u16(c.v, at + r * 4), li = u16(c.v, at + r * 4 + 2);
    const nested = c.lookups[li];
    if (!nested || seq >= pos.length) continue;
    if (c.depth >= SHAPE_LIMITS.nesting) continue;
    const before = c.buf.length;
    c.depth++;
    applyAt(c, nested, pos[seq]);
    c.depth--;
    const delta = c.buf.length - before;
    if (delta) {
      for (let k = seq + 1; k < pos.length; k++) pos[k] += delta;
      end += delta;
    }
  }
  void l;
  return end;
}
var BLACK2 = (
  /** @type {RGBA} */
  Object.freeze([0, 0, 0, 255])
);
var WHITE2 = (
  /** @type {RGBA} */
  Object.freeze([255, 255, 255, 255])
);
var TRANSPARENT = (
  /** @type {RGBA} */
  Object.freeze([0, 0, 0, 0])
);
var Policy = variants("Policy", { Fifo: [], Lru: [], Sieve: [], S3Fifo: ["small"] });
function accumulateFill(polys, w, h, span = NOOP_SPAN) {
  const stride = w + 2;
  const acc = span.span("acc.alloc", { atomic: true, items: stride * h }, () => new Float32Array(stride * h));
  let edges = 0;
  span.span("acc.edges", { atomic: true }, (es) => {
    for (const p of polys) {
      const n = p.length / 2;
      edges += n;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        line(acc, stride, w, h, p[2 * i], p[2 * i + 1], p[2 * j], p[2 * j + 1]);
      }
    }
    es.set("items", edges);
  });
  return span.span("acc.prefix", { atomic: true, items: h }, () => {
    const out = new Float32Array(w * h);
    for (let y = 0; y < h; y++) {
      let s = 0;
      for (let x = 0; x < w; x++) {
        s += acc[y * stride + x];
        out[y * w + x] = Math.min(1, Math.abs(s));
      }
    }
    return out;
  });
}
var accumulate = Object.freeze({ name: "accumulate", fill: accumulateFill, bands: bandsFromFill(accumulateFill) });
function line(a, stride, w, h, x0, y0, x1, y1) {
  if (y0 === y1) return;
  const dir = y0 < y1 ? 1 : -1;
  if (dir < 0) {
    [x0, y0, x1, y1] = [x1, y1, x0, y0];
  }
  const dxdy = (x1 - x0) / (y1 - y0);
  let x = x0;
  if (y0 < 0) {
    x -= y0 * dxdy;
  }
  const yStart = Math.max(0, Math.floor(y0)), yEnd = Math.min(h, Math.ceil(y1));
  for (let y = yStart; y < yEnd; y++) {
    const row = y * stride;
    const dy = Math.min(y + 1, y1) - Math.max(y, y0);
    const xnext = x + dxdy * dy;
    const d = dy * dir;
    const xa = Math.min(Math.max(Math.min(x, xnext), 0), w);
    const xb = Math.min(Math.max(Math.max(x, xnext), 0), w);
    const x0f = Math.floor(xa), x0i = x0f;
    const x1c = Math.ceil(xb), x1i = x1c;
    if (x1i <= x0i + 1) {
      const xm = 0.5 * (xa + xb) - x0f;
      a[row + x0i] += d - d * xm;
      a[row + x0i + 1] += d * xm;
    } else {
      const s = 1 / (xb - xa);
      const fx0 = xa - x0f;
      const a0 = 0.5 * s * (1 - fx0) * (1 - fx0);
      const fx1 = xb - x1c + 1;
      const am = 0.5 * s * fx1 * fx1;
      a[row + x0i] += d * a0;
      if (x1i === x0i + 2) {
        a[row + x0i + 1] += d * (1 - a0 - am);
      } else {
        const a1 = s * (1.5 - fx0);
        a[row + x0i + 1] += d * (a1 - a0);
        for (let xi = x0i + 2; xi < x1i - 1; xi++) a[row + xi] += d * s;
        const a2 = a1 + (x1i - x0i - 3) * s;
        a[row + x1i - 1] += d * (1 - a2 - am);
      }
      a[row + x1i] += d * am;
    }
    x = xnext;
  }
}
var SUB = 16;
var ROWS = 8;
function scanner(polys, w, h, span = NOOP_SPAN, evenOdd = false) {
  const E = span.span("scan.edges", { atomic: true }, (es) => {
    let n = 0;
    for (const p of polys) n += p.length / 2;
    const X02 = new Float64Array(n), Y02 = new Float64Array(n), X12 = new Float64Array(n), Y12 = new Float64Array(n), W2 = new Int8Array(n);
    let m2 = 0;
    for (const p of polys) {
      const k = p.length / 2;
      for (let i = 0; i < k; i++) {
        const j = i + 1 === k ? 0 : i + 1;
        const ax = p[2 * i], ay = p[2 * i + 1], bx = p[2 * j], by = p[2 * j + 1];
        if (ay === by) continue;
        if (ay < by) {
          X02[m2] = ax;
          Y02[m2] = ay;
          X12[m2] = bx;
          Y12[m2] = by;
          W2[m2] = 1;
        } else {
          X02[m2] = bx;
          Y02[m2] = by;
          X12[m2] = ax;
          Y12[m2] = ay;
          W2[m2] = -1;
        }
        m2++;
      }
    }
    es.set("items", m2);
    return { X0: X02, Y0: Y02, X1: X12, Y1: Y12, W: W2, m: m2 };
  });
  const { X0, Y0, X1, Y1, W, m } = E;
  const order = span.span("scan.sort", { atomic: true, items: m }, () => stableOrder(Y0, m));
  const active = new Int32Array(m), xs = new Float64Array(m);
  const { fresh, fx, mA, mX, cnt } = scratch2(m, w);
  let nActive = 0, next2 = 0;
  const weight = 1 / SUB;
  const rows = (yb, yEnd, out, base) => {
    let lo = w, hi = 0;
    for (let y = yb; y < yEnd; y++) {
      const row = (y - base) * w;
      let c0 = w, c1 = 0;
      for (let k = 0; k < SUB; k++) {
        const sy = y + (k + 0.5) / SUB;
        let live = 0;
        for (let a = 0; a < nActive; a++) {
          const e = active[a];
          if (Y1[e] <= sy) continue;
          active[live] = e;
          xs[live++] = X0[e] + (sy - Y0[e]) * (X1[e] - X0[e]) / (Y1[e] - Y0[e]);
        }
        nActive = live;
        for (let i = 1; i < nActive; i++) {
          const x = xs[i];
          if (xs[i - 1] <= x) continue;
          const e = active[i];
          let j = i;
          while (j > 0 && xs[j - 1] > x) {
            xs[j] = xs[j - 1];
            active[j] = active[j - 1];
            j--;
          }
          xs[j] = x;
          active[j] = e;
        }
        let nf = 0;
        while (next2 < m && Y0[order[next2]] <= sy) {
          const e = order[next2++];
          if (Y1[e] <= sy) continue;
          const x = X0[e] + (sy - Y0[e]) * (X1[e] - X0[e]) / (Y1[e] - Y0[e]);
          let j = nf++;
          while (j > 0 && fx[j - 1] > x) {
            fx[j] = fx[j - 1];
            fresh[j] = fresh[j - 1];
            j--;
          }
          fx[j] = x;
          fresh[j] = e;
        }
        if (nf) {
          let i = 0, j = 0, o = 0;
          while (i < nActive && j < nf) {
            if (fx[j] < xs[i]) {
              mA[o] = fresh[j];
              mX[o++] = fx[j++];
            } else {
              mA[o] = active[i];
              mX[o++] = xs[i++];
            }
          }
          while (i < nActive) {
            mA[o] = active[i];
            mX[o++] = xs[i++];
          }
          while (j < nf) {
            mA[o] = fresh[j];
            mX[o++] = fx[j++];
          }
          active.set(mA.subarray(0, o));
          xs.set(mX.subarray(0, o));
          nActive = o;
        }
        const mask = evenOdd ? 1 : -1;
        let wind = 0;
        for (let i = 0; i < nActive; i++) {
          const before = wind;
          wind += W[active[i]];
          if ((before & mask) === 0 && (wind & mask) !== 0) {
            let j = i + 1, ww = wind;
            for (; j < nActive; j++) {
              ww += W[active[j]];
              if ((ww & mask) === 0) break;
            }
            let xa = xs[i], xb = j < nActive ? xs[j] : w;
            i = j;
            wind = 0;
            xa = Math.max(0, xa);
            xb = Math.min(w, xb);
            if (xb <= xa) continue;
            const ia = Math.floor(xa), ib = Math.floor(xb);
            if (ia === ib) {
              out[row + ia] += (xb - xa) * weight;
            } else {
              out[row + ia] += (ia + 1 - xa) * weight;
              if (ib > ia + 1) {
                cnt[ia + 1]++;
                cnt[ib]--;
                if (ia + 1 < c0) c0 = ia + 1;
                if (ib > c1) c1 = ib;
              }
              if (ib < w) out[row + ib] += (xb - ib) * weight;
            }
            if (ia < lo) lo = ia;
            const e = Math.min(w, Math.ceil(xb));
            if (e > hi) hi = e;
          }
        }
      }
      if (c1 > c0) {
        let run2 = 0;
        for (let x = c0; x < c1; x++) {
          run2 += cnt[x];
          cnt[x] = 0;
          if (run2) out[row + x] += run2 * weight;
        }
        cnt[c1] = 0;
      }
    }
    return lo * 65536 + hi;
  };
  let yMax = -Infinity;
  for (let i = 0; i < m; i++) if (Y1[i] > yMax) yMax = Y1[i];
  const yMin = m ? Y0[order[0]] : Infinity;
  return { rows, yMin, yMax };
}
var SCRATCH = { fresh: new Int32Array(0), fx: new Float64Array(0), mA: new Int32Array(0), mX: new Float64Array(0), cnt: new Int32Array(0) };
function scratch2(m, w) {
  if (SCRATCH.fresh.length < m) {
    const k = Math.max(m, SCRATCH.fresh.length * 2);
    SCRATCH.fresh = new Int32Array(k);
    SCRATCH.fx = new Float64Array(k);
    SCRATCH.mA = new Int32Array(k);
    SCRATCH.mX = new Float64Array(k);
  }
  if (SCRATCH.cnt.length < w + 1) SCRATCH.cnt = new Int32Array(w + 1);
  return SCRATCH;
}
function stableOrder(key, m) {
  let a = new Int32Array(m), b = new Int32Array(m);
  for (let i = 0; i < m; i++) a[i] = i;
  const RUN = 16;
  for (let lo = 0; lo < m; lo += RUN) {
    const hi = Math.min(m, lo + RUN);
    for (let i = lo + 1; i < hi; i++) {
      const v = a[i], kv = key[v];
      let j = i;
      while (j > lo && key[a[j - 1]] > kv) {
        a[j] = a[j - 1];
        j--;
      }
      a[j] = v;
    }
  }
  for (let width = RUN; width < m; width *= 2) {
    for (let lo = 0; lo < m; lo += 2 * width) {
      const mid = Math.min(m, lo + width), hi = Math.min(m, lo + 2 * width);
      let i = lo, j = mid, o = lo;
      while (i < mid && j < hi) b[o++] = key[a[j]] < key[a[i]] ? a[j++] : a[i++];
      while (i < mid) b[o++] = a[i++];
      while (j < hi) b[o++] = a[j++];
    }
    const t = a;
    a = b;
    b = t;
  }
  return a;
}
function bandsFromFill(fill) {
  return function* (polys, w, h, rows, span = NOOP_SPAN, shared, evenOdd = false, from = 0) {
    const all = fill(polys, w, h, span, evenOdd);
    for (let yb = from; yb < h; yb += rows) yield { cov: all.subarray(yb * w, Math.min(h, yb + rows) * w), x0: 0, x1: w };
  };
}
var scanline = Object.freeze({
  name: "scanline",
  fill(polys, w, h, span = NOOP_SPAN, evenOdd = false) {
    const sc = scanner(polys, w, h, span, evenOdd);
    const out = span.span("scan.alloc", { atomic: true, items: w * h }, () => new Float32Array(w * h));
    for (let yb = 0; yb < h; yb += ROWS) span.span("scan.rows", { atomic: true, items: Math.min(ROWS, h - yb), y: yb }, () => sc.rows(yb, Math.min(h, yb + ROWS), out, 0));
    return out;
  },
  /**
   * Native bands: one `rows`-row coverage buffer, refilled per band. Only the columns the
   * previous band touched are re-zeroed, and the dirty columns are reported, so callers
   * touch O(ink) pixels per colour rather than O(band).
   */
  *bands(polys, w, h, rows, span = NOOP_SPAN, shared, evenOdd = false, from = 0) {
    const sc = scanner(polys, w, h, span, evenOdd);
    const buf = shared ?? new Float32Array(w * Math.min(rows, h));
    let px0 = 0, px1 = 0, prows = 0;
    for (let yb = from; yb < h; yb += rows) {
      const yEnd = Math.min(h, yb + rows), band = buf.subarray(0, (yEnd - yb) * w);
      if (!shared && px1 > px0) for (let r = 0; r < prows; r++) buf.fill(0, r * w + px0, r * w + px1);
      const d = yEnd <= sc.yMin || yb >= sc.yMax ? 0 : span.span("scan.rows", { atomic: true, items: yEnd - yb, y: yb }, () => sc.rows(yb, yEnd, band, yb));
      px0 = Math.floor(d / 65536);
      px1 = d % 65536;
      prows = yEnd - yb;
      yield { cov: band, x0: px0, x1: Math.max(px0, px1) };
    }
  }
});
var EMPTY_HULL = Object.freeze(
  /** @type {const} */
  [Infinity, Infinity, -Infinity, -Infinity]
);
var IDX = { buf: new Int32Array(0) };
var Lz = variants("Lz", {
  Greedy: [],
  Chain: ["chain", "lazy", "nice", "good", "insert"]
});
var Entropy = variants("Entropy", { Fixed: [], Dynamic: [] });
var rev = (c, n) => {
  let r = 0;
  for (let i = 0; i < n; i++) {
    r = r << 1 | c & 1;
    c >>= 1;
  }
  return r;
};
var LEN_BASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
var LEN_EXTRA = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
var DIST_BASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
var DIST_EXTRA = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
var LEN_IDX = new Uint8Array(259);
for (let i = 0; i < 29; i++) for (let l = LEN_BASE[i]; l < (i < 28 ? LEN_BASE[i + 1] : 259); l++) LEN_IDX[l] = i;
var DIST_LO = new Uint8Array(257);
var DIST_HI = new Uint8Array(256);
for (let i = 0; i < 30; i++) {
  const end = i < 29 ? DIST_BASE[i + 1] : 32769;
  for (let d = DIST_BASE[i]; d < end; d++) {
    if (d <= 256) DIST_LO[d] = i;
    else DIST_HI[d - 1 >> 7] = i;
  }
}
var distIdx = (d) => d <= 256 ? DIST_LO[d] : DIST_HI[d - 1 >> 7];
var FIX_LIT = new Uint16Array(288);
var FIX_LEN = new Uint8Array(288);
for (let s = 0; s < 288; s++) {
  const [base, len2, first] = s < 144 ? [48, 8, 0] : s < 256 ? [400, 9, 144] : s < 280 ? [0, 7, 256] : [192, 8, 280];
  FIX_LIT[s] = rev(base + s - first, len2);
  FIX_LEN[s] = len2;
}
var FIX_DIST = Uint16Array.from({ length: 30 }, (_, i) => rev(i, 5));
var FIX_DLEN = new Uint8Array(30).fill(5);
var CL_ORDER = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
function huffLengths(freq, limit) {
  const n = freq.length, lens = new Uint8Array(n);
  const syms = [];
  for (let i = 0; i < n; i++) if (freq[i]) syms.push(i);
  if (syms.length === 0) {
    lens[0] = 1;
    lens[1] = 1;
    return lens;
  }
  if (syms.length === 1) {
    lens[syms[0]] = 1;
    lens[syms[0] === 0 ? 1 : 0] = 1;
    return lens;
  }
  const m = syms.length;
  const f = Float64Array.from(syms, (x) => freq[x]);
  const w = new Float64Array(2 * m), parent = new Int32Array(2 * m), depth = new Uint8Array(2 * m);
  for (; ; ) {
    const order = Array.from({ length: m }, (_, i) => i).sort((a, b) => f[a] - f[b] || syms[a] - syms[b]);
    for (let i = 0; i < m; i++) w[i] = f[order[i]];
    let leaf = 0, inner = m, next2 = m;
    const pick = () => leaf < m && (inner >= next2 || w[leaf] <= w[inner]) ? leaf++ : inner++;
    while (next2 < 2 * m - 1) {
      const a = pick(), b = pick();
      w[next2] = w[a] + w[b];
      parent[a] = parent[b] = next2;
      next2++;
    }
    depth[2 * m - 2] = 0;
    let max = 0;
    for (let i = 2 * m - 3; i >= 0; i--) {
      depth[i] = depth[parent[i]] + 1;
      if (i < m && depth[i] > max) max = depth[i];
    }
    if (max <= limit) {
      for (let i = 0; i < m; i++) lens[syms[order[i]]] = depth[i];
      return lens;
    }
    for (let i = 0; i < m; i++) f[i] = Math.max(1, Math.floor(f[i] / 2));
  }
}
function canonical(lens) {
  const max = Math.max(...lens), blc = new Uint16Array(max + 2), nextCode = new Uint16Array(max + 2);
  for (const l of lens) if (l) blc[l]++;
  for (let code = 0, b = 1; b <= max; b++) {
    code = code + blc[b - 1] << 1;
    nextCode[b] = code;
  }
  const codes = new Uint16Array(lens.length);
  for (let i = 0; i < lens.length; i++) if (lens[i]) codes[i] = rev(nextCode[lens[i]]++, lens[i]);
  return codes;
}
var WIN = 32768;
var WMASK = WIN - 1;
var HB = 15;
var BLOCK = 1 << 14;
function deflater({ lz, entropy, blockBytes = Infinity }, adler322) {
  const greedy = lz.tag === "Greedy";
  const LOOK = greedy ? 258 : 262;
  const chainMax = lz.tag === "Chain" ? lz.chain : 0, lazyMax = lz.tag === "Chain" ? lz.lazy : 0;
  const nice = lz.tag === "Chain" ? lz.nice : 258, good = lz.tag === "Chain" ? lz.good : 0, insertMax = lz.tag === "Chain" ? lz.insert : 0;
  let buf = new Uint8Array(1 << 16), base = 0, len2 = 0, p = 0, ad = 1;
  const head = new Int32Array(1 << HB).fill(-1), prev2 = new Int32Array(WIN).fill(-1);
  const L = new Uint16Array(BLOCK), D = new Uint16Array(BLOCK);
  let ns = 0;
  let covered = 0;
  let prevLen = 0, prevDist = 0, pending = false;
  let out = new Uint8Array(1 << 12), o = 0, bits = 0, nb = 0;
  const put = (v, k) => {
    bits |= v << nb;
    nb += k;
    while (nb >= 8) {
      if (o >= out.length) {
        const g = new Uint8Array(out.length * 2);
        g.set(out);
        out = g;
      }
      out[o++] = bits & 255;
      bits >>>= 8;
      nb -= 8;
    }
  };
  out[0] = 120;
  out[1] = 1;
  o = 2;
  if (entropy.tag === "Fixed") {
    put(1, 1);
    put(1, 2);
  }
  const symbols = (lc, ll, dc, dl) => {
    for (let i = 0; i < ns; i++) {
      const s = L[i];
      if (s < 256) {
        put(lc[s], ll[s]);
        continue;
      }
      const len22 = s - 256, li = LEN_IDX[len22];
      put(lc[257 + li], ll[257 + li]);
      if (LEN_EXTRA[li]) put(len22 - LEN_BASE[li], LEN_EXTRA[li]);
      const d = D[i], di = distIdx(d);
      put(dc[di], dl[di]);
      if (DIST_EXTRA[di]) put(d - DIST_BASE[di], DIST_EXTRA[di]);
    }
  };
  const flush = (final) => {
    if (entropy.tag === "Fixed") {
      symbols(FIX_LIT, FIX_LEN, FIX_DIST, FIX_DLEN);
      if (final) put(FIX_LIT[256], FIX_LEN[256]);
      ns = 0;
      covered = 0;
      return;
    }
    const lf = new Uint32Array(286), df = new Uint32Array(30);
    for (let i = 0; i < ns; i++) {
      const s = L[i];
      if (s < 256) {
        lf[s]++;
        continue;
      }
      const li = LEN_IDX[s - 256], di = distIdx(D[i]);
      lf[257 + li]++;
      df[di]++;
    }
    lf[256] = 1;
    const ll = huffLengths(lf, 15), dl = huffLengths(df, 15);
    let hlit = 286;
    while (hlit > 257 && ll[hlit - 1] === 0) hlit--;
    let hdist = 30;
    while (hdist > 1 && dl[hdist - 1] === 0) hdist--;
    const seq = [...ll.subarray(0, hlit), ...dl.subarray(0, hdist)];
    const rle = [];
    for (let i = 0; i < seq.length; ) {
      const v = seq[i];
      let r = 1;
      while (i + r < seq.length && seq[i + r] === v) r++;
      let k = r;
      if (v === 0) {
        while (k >= 11) {
          const t = Math.min(138, k);
          rle.push([18, t - 11]);
          k -= t;
        }
        if (k >= 3) {
          rle.push([17, k - 3]);
          k = 0;
        }
      } else {
        rle.push([v, 0]);
        k--;
        while (k >= 3) {
          const t = Math.min(6, k);
          rle.push([16, t - 3]);
          k -= t;
        }
      }
      for (; k > 0; k--) rle.push([v, 0]);
      i += r;
    }
    const cf = new Uint32Array(19);
    for (const [c] of rle) cf[c]++;
    const cl = huffLengths(cf, 7), cc = canonical(cl);
    let hclen = 19;
    while (hclen > 4 && cl[CL_ORDER[hclen - 1]] === 0) hclen--;
    let dyn = 3 + 5 + 5 + 4 + 3 * hclen, fix = 3;
    for (const [c] of rle) dyn += cl[c] + (c === 16 ? 2 : c === 17 ? 3 : c === 18 ? 7 : 0);
    for (let s = 0; s < 286; s++) if (lf[s]) {
      dyn += lf[s] * ll[s];
      fix += lf[s] * FIX_LEN[s];
    }
    for (let d = 0; d < 30; d++) if (df[d]) {
      dyn += df[d] * dl[d];
      fix += df[d] * 5;
    }
    put(final ? 1 : 0, 1);
    if (fix <= dyn) {
      put(1, 2);
      symbols(FIX_LIT, FIX_LEN, FIX_DIST, FIX_DLEN);
      put(FIX_LIT[256], FIX_LEN[256]);
    } else {
      put(2, 2);
      put(hlit - 257, 5);
      put(hdist - 1, 5);
      put(hclen - 4, 4);
      for (let i = 0; i < hclen; i++) put(cl[CL_ORDER[i]], 3);
      for (const [c, x] of rle) {
        put(cc[c], cl[c]);
        if (c === 16) put(x, 2);
        else if (c === 17) put(x, 3);
        else if (c === 18) put(x, 7);
      }
      const lc = canonical(ll), dc = canonical(dl);
      symbols(lc, ll, dc, dl);
      put(lc[256], ll[256]);
    }
    ns = 0;
    covered = 0;
  };
  const encode = (final) => {
    const src = buf, b = base, n = len2, stop = final ? n : n - LOOK;
    const hash = (q) => Math.imul(src[q - b] << 16 | src[q - b + 1] << 8 | src[q - b + 2], 2654435761) >>> 32 - HB;
    const insert = (q) => {
      if (q + 3 <= n) {
        const h = hash(q);
        prev2[q & WMASK] = head[h];
        head[h] = q;
      }
    };
    const longest = (q, min, chain) => {
      const max = Math.min(258, n - q), i = q - b;
      if (max < 3) return 0;
      let bestLen = min, bestDist = 0;
      if (q > 0 && src[i - 1] === src[i] && src[i] === src[i + 1] && src[i] === src[i + 2]) {
        let l = 3;
        const c = src[i];
        while (l < max && src[i + l] === c) l++;
        if (l > bestLen) {
          bestLen = l;
          bestDist = 1;
        }
      }
      if (bestLen >= nice) return bestLen * 65536 + bestDist;
      let cand = head[hash(q)];
      for (let k = chain; k > 0 && cand >= 0 && q - cand <= WIN && cand < q; k--) {
        const j = cand - b;
        if (src[j + bestLen] === src[i + bestLen] && src[j] === src[i] && src[j + 1] === src[i + 1]) {
          let l = 2;
          while (l < max && src[j + l] === src[i + l]) l++;
          if (l > bestLen) {
            bestLen = l;
            bestDist = q - cand;
            if (l >= nice) break;
          }
        }
        const nx = prev2[cand & WMASK];
        if (nx >= cand) break;
        cand = nx;
      }
      return bestDist ? bestLen * 65536 + bestDist : 0;
    };
    const lit = (c) => {
      L[ns] = c;
      D[ns] = 0;
      covered++;
      if (++ns === BLOCK || covered >= blockBytes) flush(false);
    };
    const match = (l, d) => {
      L[ns] = 256 + l;
      D[ns] = d;
      covered += l;
      if (++ns === BLOCK || covered >= blockBytes) flush(false);
    };
    if (greedy) {
      while (p < stop) {
        let bestLen = 0, bestDist = 0;
        const i = p - b;
        if (p + 3 <= n) {
          const max = Math.min(258, n - p);
          if (p > 0 && src[i - 1] === src[i] && src[i] === src[i + 1] && src[i] === src[i + 2]) {
            let l = 3;
            const c = src[i];
            while (l < max && src[i + l] === c) l++;
            bestLen = l;
            bestDist = 1;
          }
          const h = hash(p), cand = head[h];
          head[h] = p;
          if (bestLen < max && cand >= 0 && p - cand <= 32768 && p - cand > 1) {
            const j = cand - b;
            let l = 0;
            while (l < max && src[j + l] === src[i + l]) l++;
            if (l >= 3 && l > bestLen) {
              bestLen = l;
              bestDist = p - cand;
            }
          }
        }
        if (bestLen >= 3) {
          match(bestLen, bestDist);
          p += bestLen;
        } else {
          lit(src[i]);
          p++;
        }
      }
      return;
    }
    while (p < stop) {
      let curLen = 0, curDist = 0;
      if (!pending || prevLen < lazyMax) {
        const r = longest(p, pending ? Math.max(2, prevLen) : 2, pending && prevLen >= good ? chainMax >> 2 : chainMax);
        curLen = Math.floor(r / 65536);
        curDist = r % 65536;
      }
      insert(p);
      if (pending && prevLen >= 3 && curLen <= prevLen) {
        match(prevLen, prevDist);
        const end = p - 1 + prevLen;
        if (prevDist === 1) for (let q = Math.max(p + 1, end - 2); q < end; q++) insert(q);
        else if (prevLen <= insertMax) for (let q = p + 1; q < end; q++) insert(q);
        else {
          for (let q = p + 1; q < end; q += 4) insert(q);
          if (end - 1 > p) insert(end - 1);
        }
        p = end;
        pending = false;
        prevLen = 0;
        continue;
      }
      if (pending) lit(src[p - 1 - b]);
      pending = true;
      prevLen = curLen;
      prevDist = curDist;
      p++;
    }
    if (final && pending) {
      lit(src[p - 1 - b]);
      pending = false;
    }
  };
  const drain = () => {
    const r = out.slice(0, o);
    o = 0;
    return r;
  };
  return {
    push(raw) {
      ad = adler322(raw, ad);
      const keep = Math.max(base, p - WIN - 2);
      if (len2 + raw.length - keep > buf.length) {
        const g = new Uint8Array(Math.max(buf.length, 2 * (len2 + raw.length - keep)));
        g.set(buf.subarray(keep - base, len2 - base));
        buf = g;
        base = keep;
      } else if (len2 + raw.length - base > buf.length) {
        buf.copyWithin(0, keep - base, len2 - base);
        base = keep;
      }
      buf.set(raw, len2 - base);
      len2 += raw.length;
      encode(false);
      return drain();
    },
    finish() {
      encode(true);
      flush(true);
      if (nb > 0) put(0, 8 - nb);
      const t = drain(), r = new Uint8Array(t.length + 4);
      r.set(t);
      r.set([ad >>> 24, ad >>> 16 & 255, ad >>> 8 & 255, ad & 255], t.length);
      return r;
    }
  };
}
var CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function adler32(b, prev2 = 1) {
  let a = prev2 & 65535, s = prev2 >>> 16;
  for (let i = 0; i < b.length; ) {
    const end = Math.min(b.length, i + 5552);
    for (; i < end; i++) {
      a += b[i];
      s += a;
    }
    a %= 65521;
    s %= 65521;
  }
  return (s << 16 | a) >>> 0;
}
var storedZlib = Object.freeze({
  name: "stored",
  async deflate(raw, span = NOOP_SPAN) {
    return span.span("deflate.stored", { atomic: true, items: raw.length }, () => storedSync(raw));
  },
  stream: () => storedStream()
});
function storedStream() {
  let pend = [];
  let pendLen = 0, ad = 1, started = false;
  const take = (n) => {
    const out = new Uint8Array(n);
    let o = 0;
    while (o < n) {
      const head = pend[0], k = Math.min(head.length, n - o);
      out.set(head.subarray(0, k), o);
      o += k;
      if (k === head.length) pend.shift();
      else pend[0] = head.subarray(k);
    }
    pendLen -= n;
    return out;
  };
  const block = (body, final) => {
    const out = new Uint8Array(5 + body.length), len2 = body.length;
    out[0] = final;
    out[1] = len2 & 255;
    out[2] = len2 >> 8;
    out[3] = ~len2 & 255;
    out[4] = ~len2 >> 8 & 255;
    out.set(body, 5);
    return out;
  };
  const header = () => started ? [] : (started = true, [new Uint8Array([120, 1])]);
  return {
    async push(raw) {
      ad = adler32(raw, ad);
      if (raw.length) {
        pend.push(raw.slice());
        pendLen += raw.length;
      }
      const parts = header();
      while (pendLen > 65535) parts.push(block(take(65535), 0));
      return concat(parts);
    },
    async finish() {
      const parts = header();
      do
        parts.push(block(take(Math.min(65535, pendLen)), pendLen <= 65535 ? 1 : 0));
      while (pendLen > 0);
      parts.push(new Uint8Array([ad >>> 24, ad >>> 16 & 255, ad >>> 8 & 255, ad & 255]));
      return concat(parts);
    }
  };
}
function concat(parts) {
  if (parts.length === 1) return parts[0];
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}
function storedSync(raw) {
  {
    const blocks = Math.max(1, Math.ceil(raw.length / 65535));
    const out = new Uint8Array(2 + raw.length + blocks * 5 + 4);
    out[0] = 120;
    out[1] = 1;
    let o = 2;
    for (let b = 0; b < blocks; b++) {
      const start = b * 65535, len2 = Math.min(65535, raw.length - start);
      out[o++] = b === blocks - 1 ? 1 : 0;
      out[o++] = len2 & 255;
      out[o++] = len2 >> 8;
      out[o++] = ~len2 & 255;
      out[o++] = ~len2 >> 8 & 255;
      out.set(raw.subarray(start, start + len2), o);
      o += len2;
    }
    const ad = adler32(raw);
    out[o++] = ad >>> 24;
    out[o++] = ad >>> 16 & 255;
    out[o++] = ad >>> 8 & 255;
    out[o++] = ad & 255;
    return out;
  }
}
var nativeZlib = Object.freeze({
  name: "native",
  async deflate(raw, span = NOOP_SPAN) {
    const s = span.span("deflate.native.pipe", { atomic: true }, () => new Blob([
      /** @type {BlobPart} */
      raw
    ]).stream().pipeThrough(new CompressionStream("deflate")));
    return span.span("deflate.native.drain", { atomic: true, items: raw.length }, async () => new Uint8Array(await new Response(s).arrayBuffer()));
  },
  stream() {
    const cs = new CompressionStream("deflate");
    const w = cs.writable.getWriter(), r = cs.readable.getReader();
    let got = [];
    const drained = (async () => {
      for (; ; ) {
        const { done, value } = await r.read();
        if (done) return;
        got.push(value);
      }
    })();
    const take = () => {
      const out = concat(got.length ? got : [new Uint8Array(0)]);
      got = [];
      return out;
    };
    return {
      async push(raw) {
        await w.write(raw.slice());
        return take();
      },
      async finish() {
        await w.close();
        await drained;
        return take();
      }
    };
  }
});
var COST = Uint8Array.from({ length: 256 }, (_, v) => v < 128 ? v : 256 - v);
var rev2 = (c, n) => {
  let r = 0;
  for (let i = 0; i < n; i++) {
    r = r << 1 | c & 1;
    c >>= 1;
  }
  return r;
};
var LIT_CODE = new Uint16Array(288);
var LIT_LEN = new Uint8Array(288);
for (let s = 0; s < 288; s++) {
  const [base, len2, first] = s < 144 ? [48, 8, 0] : s < 256 ? [400, 9, 144] : s < 280 ? [0, 7, 256] : [192, 8, 280];
  LIT_CODE[s] = rev2(base + s - first, len2);
  LIT_LEN[s] = len2;
}
var LEN_BASE2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258];
var LEN_EXTRA2 = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];
var DIST_BASE2 = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577];
var DIST_EXTRA2 = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];
var LEN_IDX2 = new Uint8Array(259);
for (let i = 0; i < 29; i++) for (let l = LEN_BASE2[i]; l < (i < 28 ? LEN_BASE2[i + 1] : 259); l++) LEN_IDX2[l] = i;
var DIST_LO2 = new Uint8Array(257);
var DIST_HI2 = new Uint8Array(256);
for (let i = 0; i < 30; i++) {
  const end = i < 29 ? DIST_BASE2[i + 1] : 32769;
  for (let d = DIST_BASE2[i]; d < end; d++) {
    if (d <= 256) DIST_LO2[d] = i;
    else DIST_HI2[d - 1 >> 7] = i;
  }
}
var DIST_CODE = Uint8Array.from({ length: 30 }, (_, i) => rev2(i, 5));
function fastDeflateSync(src) {
  const n = src.length;
  let out = new Uint8Array(Math.max(64, (n >> 3) + 64));
  let o = 2, bits = 0, nb = 0;
  out[0] = 120;
  out[1] = 1;
  const put = (v, k) => {
    bits |= v << nb;
    nb += k;
    while (nb >= 8) {
      if (o >= out.length) {
        const g = new Uint8Array(out.length * 2);
        g.set(out);
        out = g;
      }
      out[o++] = bits & 255;
      bits >>>= 8;
      nb -= 8;
    }
  };
  put(1, 1);
  put(1, 2);
  const HB2 = 15, head = new Int32Array(1 << HB2).fill(-1);
  const hash = (p2) => Math.imul(src[p2] << 16 | src[p2 + 1] << 8 | src[p2 + 2], 2654435761) >>> 32 - HB2;
  let p = 0;
  while (p < n) {
    let bestLen = 0, bestDist = 0;
    if (p + 3 <= n) {
      const max = Math.min(258, n - p);
      if (p > 0 && src[p - 1] === src[p] && src[p] === src[p + 1] && src[p] === src[p + 2]) {
        let l = 3;
        const b = src[p];
        while (l < max && src[p + l] === b) l++;
        bestLen = l;
        bestDist = 1;
      }
      const h = hash(p), cand = head[h];
      head[h] = p;
      if (bestLen < max && cand >= 0 && p - cand <= 32768 && p - cand > 1) {
        let l = 0;
        while (l < max && src[cand + l] === src[p + l]) l++;
        if (l >= 3 && l > bestLen) {
          bestLen = l;
          bestDist = p - cand;
        }
      }
    }
    if (bestLen >= 3) {
      const li = LEN_IDX2[bestLen];
      put(LIT_CODE[257 + li], LIT_LEN[257 + li]);
      if (LEN_EXTRA2[li]) put(bestLen - LEN_BASE2[li], LEN_EXTRA2[li]);
      const di = bestDist <= 256 ? DIST_LO2[bestDist] : DIST_HI2[bestDist - 1 >> 7];
      put(DIST_CODE[di], 5);
      if (DIST_EXTRA2[di]) put(bestDist - DIST_BASE2[di], DIST_EXTRA2[di]);
      p += bestLen;
    } else {
      put(LIT_CODE[src[p]], LIT_LEN[src[p]]);
      p++;
    }
  }
  put(LIT_CODE[256], LIT_LEN[256]);
  if (nb > 0) put(0, 8 - nb);
  const ad = adler32(src);
  if (o + 4 > out.length) {
    const g = new Uint8Array(o + 4);
    g.set(out);
    out = g;
  }
  out[o++] = ad >>> 24;
  out[o++] = ad >>> 16 & 255;
  out[o++] = ad >>> 8 & 255;
  out[o++] = ad & 255;
  return out.subarray(0, o);
}
function fastStream() {
  const WIN2 = 32768, LOOK = 258;
  let buf = new Uint8Array(1 << 16), base = 0, len2 = 0, p = 0;
  let out = new Uint8Array(1 << 12), o = 0, bits = 0, nb = 0, ad = 1;
  const put = (v, k) => {
    bits |= v << nb;
    nb += k;
    while (nb >= 8) {
      if (o >= out.length) {
        const g = new Uint8Array(out.length * 2);
        g.set(out);
        out = g;
      }
      out[o++] = bits & 255;
      bits >>>= 8;
      nb -= 8;
    }
  };
  out[0] = 120;
  out[1] = 1;
  o = 2;
  put(1, 1);
  put(1, 2);
  const HB2 = 15, head = new Int32Array(1 << HB2).fill(-1);
  const encode = (final) => {
    const src = buf, b = base, n = len2, stop = final ? n : n - LOOK;
    const hash = (q) => Math.imul(src[q - b] << 16 | src[q - b + 1] << 8 | src[q - b + 2], 2654435761) >>> 32 - HB2;
    while (p < stop) {
      let bestLen = 0, bestDist = 0;
      const i = p - b;
      if (p + 3 <= n) {
        const max = Math.min(258, n - p);
        if (p > 0 && src[i - 1] === src[i] && src[i] === src[i + 1] && src[i] === src[i + 2]) {
          let l = 3;
          const c = src[i];
          while (l < max && src[i + l] === c) l++;
          bestLen = l;
          bestDist = 1;
        }
        const h = hash(p), cand = head[h];
        head[h] = p;
        if (bestLen < max && cand >= 0 && p - cand <= 32768 && p - cand > 1) {
          const j = cand - b;
          let l = 0;
          while (l < max && src[j + l] === src[i + l]) l++;
          if (l >= 3 && l > bestLen) {
            bestLen = l;
            bestDist = p - cand;
          }
        }
      }
      if (bestLen >= 3) {
        const li = LEN_IDX2[bestLen];
        put(LIT_CODE[257 + li], LIT_LEN[257 + li]);
        if (LEN_EXTRA2[li]) put(bestLen - LEN_BASE2[li], LEN_EXTRA2[li]);
        const di = bestDist <= 256 ? DIST_LO2[bestDist] : DIST_HI2[bestDist - 1 >> 7];
        put(DIST_CODE[di], 5);
        if (DIST_EXTRA2[di]) put(bestDist - DIST_BASE2[di], DIST_EXTRA2[di]);
        p += bestLen;
      } else {
        put(LIT_CODE[src[i]], LIT_LEN[src[i]]);
        p++;
      }
    }
  };
  const drain = () => {
    const r = out.slice(0, o);
    o = 0;
    return r;
  };
  return {
    async push(raw) {
      ad = adler32(raw, ad);
      const keep = Math.max(base, p - WIN2 - 1);
      if (len2 + raw.length - keep > buf.length) {
        const g = new Uint8Array(Math.max(buf.length, 2 * (len2 + raw.length - keep)));
        g.set(buf.subarray(keep - base, len2 - base));
        buf = g;
        base = keep;
      } else if (len2 + raw.length - base > buf.length) {
        buf.copyWithin(0, keep - base, len2 - base);
        base = keep;
      }
      buf.set(raw, len2 - base);
      len2 += raw.length;
      encode(false);
      return drain();
    },
    async finish() {
      encode(true);
      put(LIT_CODE[256], LIT_LEN[256]);
      if (nb > 0) put(0, 8 - nb);
      const t = drain(), r = new Uint8Array(t.length + 4);
      r.set(t);
      r.set([ad >>> 24, ad >>> 16 & 255, ad >>> 8 & 255, ad & 255], t.length);
      return r;
    }
  };
}
var fastZlib = Object.freeze({
  name: "fast",
  async deflate(raw, span = NOOP_SPAN) {
    return span.span("deflate.fast", { atomic: true, items: raw.length }, () => fastDeflateSync(raw));
  },
  stream: () => fastStream()
});
function zlibOf({ name, lz, entropy, blockBytes }) {
  return Object.freeze({
    name,
    async deflate(raw, span = NOOP_SPAN) {
      return span.span(`deflate.${name}`, { atomic: true, items: raw.length }, () => {
        const d = deflater({ lz, entropy, blockBytes }, adler32);
        const a = d.push(raw), b = d.finish();
        return concat([a, b]);
      });
    },
    stream() {
      const d = deflater({ lz, entropy, blockBytes }, adler32);
      return { push: async (raw) => d.push(raw), finish: async () => d.finish() };
    }
  });
}
var greedyFixedZlib = zlibOf({ name: "greedy-fixed", lz: Lz.Greedy, entropy: Entropy.Fixed });
var balancedZlib = zlibOf({ name: "balanced", lz: Lz.Chain(16, 16, 64, 8, 8), entropy: Entropy.Dynamic, blockBytes: 1 << 16 });
var maxZlib = zlibOf({ name: "max", lz: Lz.Chain(16, 16, 64, 8, 258), entropy: Entropy.Dynamic, blockBytes: 1 << 16 });
var Target = variants("Target", {
  Svg: [],
  Png: ["rasterizer", "zlib"]
});
var TARGETS = Object.freeze([Target.Svg, Target.Png(scanline, fastZlib)]);
var RASTERIZERS = Object.freeze([accumulate, scanline]);
var ZLIBS = Object.freeze([nativeZlib, storedZlib, fastZlib, balancedZlib, maxZlib]);
var SIGNATURE2 = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
function run(font, fontKey, text, size, { tracking = 0, gsubFeatures, gposFeatures } = {}) {
  const r = shape(font, text, { ...gsubFeatures ? { gsubFeatures } : {}, ...gposFeatures ? { gposFeatures } : {} });
  if (r.tag === "Err") return r;
  const s = size / font.unitsPerEm;
  const glyphs = [];
  let pen = 0;
  for (const g of r.value) {
    const p = font.path(g.gid);
    if (p.tag === "Err") return err(p.error);
    glyphs.push({ gid: g.gid, cluster: g.cluster, x: pen, dx: g.dx * s, dy: g.dy * s, ax: g.ax * s + tracking, path: p.value });
    pen += g.ax * s + tracking;
  }
  const missing = r.value.filter((g) => g.gid === 0).length;
  return ok({ fontKey, size, s, width: pen, ascent: font.ascender * s, descent: -font.descender * s, glyphs, missing });
}
var K = new Uint32Array([
  1116352408,
  1899447441,
  3049323471,
  3921009573,
  961987163,
  1508970993,
  2453635748,
  2870763221,
  3624381080,
  310598401,
  607225278,
  1426881987,
  1925078388,
  2162078206,
  2614888103,
  3248222580,
  3835390401,
  4022224774,
  264347078,
  604807628,
  770255983,
  1249150122,
  1555081692,
  1996064986,
  2554220882,
  2821834349,
  2952996808,
  3210313671,
  3336571891,
  3584528711,
  113926993,
  338241895,
  666307205,
  773529912,
  1294757372,
  1396182291,
  1695183700,
  1986661051,
  2177026350,
  2456956037,
  2730485921,
  2820302411,
  3259730800,
  3345764771,
  3516065817,
  3600352804,
  4094571909,
  275423344,
  430227734,
  506948616,
  659060556,
  883997877,
  958139571,
  1322822218,
  1537002063,
  1747873779,
  1955562222,
  2024104815,
  2227730452,
  2361852424,
  2428436474,
  2756734187,
  3204031479,
  3329325298
]);
var FetchError = variants("FetchError", {
  BadUrl: ["input"],
  Disallowed: ["url", "why"],
  Network: ["url", "message"],
  Status: ["url", "status"],
  TooLarge: ["url", "limit", "seen"],
  Timeout: ["url", "ms"],
  TooManyRedirects: ["url", "limit"]
});
var FontFetchError = variants("FontFetchError", { Fetch: ["error"], Load: ["error"] });
var loadFont2 = (bytes, ports = {}) => loadFont(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), { brotli: autoBrotli, ...ports });

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/font-data.ts
var SANS = "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";
var MONO = "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";

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/fonts.ts
var FONTS = { sans: SANS, mono: MONO };
function bytesOf(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
var loading = null;
var shapers = null;
function loadFonts() {
  loading ??= buildShapers().then((s) => shapers = s);
  return loading;
}
function shaperFor(font) {
  if (!shapers) throw new Error("Fonts are not loaded: await loadFonts() first (Scene.run() does this for scenes)");
  const s = shapers[font];
  if (!s) throw new Error(`Unknown font "${font}": use 'sans' or 'mono'`);
  return s;
}
async function buildShapers() {
  const end = perf.begin("fonts.decode");
  const out = {};
  for (const [key, b64] of Object.entries(FONTS)) {
    const r = await loadFont2(bytesOf(b64));
    if (r.tag !== "Ok") throw new Error(key + ": " + JSON.stringify(r.error));
    const font = r.value;
    const memo = /* @__PURE__ */ new Map();
    out[key] = (text, size) => {
      const k = size + "\0" + text;
      let r2 = memo.get(k);
      if (r2) return r2;
      const ru = run(font, key, text, size);
      if (ru.tag !== "Ok") throw new Error("shape: " + JSON.stringify(ru.error));
      memo.set(k, r2 = ru.value);
      return r2;
    };
  }
  end();
  return out;
}

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/text.ts
var unitOutlines = /* @__PURE__ */ new WeakMap();
function unitOutline(segments) {
  let o = unitOutlines.get(segments);
  if (o) return o;
  const subpaths = [], closed = [];
  let cur = [], cx = 0, cy = 0;
  for (const s of segments) {
    switch (s.tag) {
      case "MoveTo":
        cur = [s.x, s.y];
        subpaths.push(cur);
        closed.push(false);
        cx = s.x;
        cy = s.y;
        break;
      case "LineTo":
        cur.push(cx + (s.x - cx) / 3, cy + (s.y - cy) / 3, cx + 2 * (s.x - cx) / 3, cy + 2 * (s.y - cy) / 3, s.x, s.y);
        cx = s.x;
        cy = s.y;
        break;
      case "QuadTo":
        cur.push(cx + 2 * (s.x1 - cx) / 3, cy + 2 * (s.y1 - cy) / 3, s.x + 2 * (s.x1 - s.x) / 3, s.y + 2 * (s.y1 - s.y) / 3, s.x, s.y);
        cx = s.x;
        cy = s.y;
        break;
      case "CubicTo":
        cur.push(s.x1, s.y1, s.x2, s.y2, s.x, s.y);
        cx = s.x;
        cy = s.y;
        break;
      case "Close":
        if (closed.length) closed[closed.length - 1] = true;
        break;
    }
  }
  o = { subpaths, closed };
  unitOutlines.set(segments, o);
  return o;
}
var Glyph2 = class extends VMobject {
  /** Source string index this glyph came from. */
  cluster;
  constructor(segments, scale, ox, oy, style) {
    super(style);
    const { subpaths, closed } = unitOutline(segments);
    this.subpaths = subpaths.map((u) => {
      const a = new Float32Array(u.length);
      for (let i = 0; i < u.length; i += 2) {
        a[i] = ox + u[i] * scale;
        a[i + 1] = oy + u[i + 1] * scale;
      }
      return a;
    });
    this.closed = closed.slice();
  }
};
var BOLD_STROKE = 0.045;
var Text = class _Text extends Group {
  text;
  font;
  fontSize;
  weight;
  anchor;
  // Set by build(), which the constructor calls
  run;
  /** The advance box as a point array [x0, y0, x1, y1]: see build(). */
  frameBox;
  constructor(text, { fontSize = 0.4, font = "sans", color: color2 = WHITE, weight = "normal", anchor: anchor2 = "middle", fillOpacity = 1 } = {}) {
    super();
    this.text = text;
    this.font = font;
    this.fontSize = fontSize;
    this.weight = weight;
    this.anchor = anchor2;
    this.mergeLeaves = true;
    const bold = weight === "bold";
    this.build(text, fontSize, {
      fill: color2,
      fillOpacity,
      stroke: bold ? color2 : "none",
      strokeWidth: bold ? BOLD_STROKE * fontSize : 0
    });
    this.shift([-this.run.width / 2, this.run.ascent - (this.run.ascent - this.run.descent) / 2]);
  }
  /** Lay out glyphs with the pen at the origin and the baseline at y = 0. */
  build(text, fontSize, style) {
    const run2 = shaperFor(this.font)(text, fontSize);
    this.run = { width: run2.width, ascent: run2.ascent, descent: run2.descent, fontSize };
    const scale = run2.s ?? fontSize / 1e3;
    for (const c of this.children) c.parent = null;
    this.children = [];
    for (const g of run2.glyphs) {
      if (!g.path?.length) continue;
      const gl = new Glyph2(g.path, g.s ?? scale, g.x + g.dx, g.dy, { ...style });
      gl.cluster = g.cluster;
      gl.parent = this;
      this.children.push(gl);
    }
    this.frameBox = new Float32Array([0, -run2.descent, run2.width, run2.ascent]);
    this.invalidateBox();
  }
  pointArrays() {
    return [this.frameBox];
  }
  copyData(src) {
    this.frameBox = new Float32Array(src.frameBox);
  }
  /** Exact advance width, in scene units. */
  advance() {
    return this.frameBox[2] - this.frameBox[0];
  }
  /** The point setText keeps fixed: left, center or right of the advance box, at its vertical middle. */
  anchorPoint() {
    const f = this.frameBox, cy = (f[1] + f[3]) / 2;
    return [this.anchor === "start" ? f[0] : this.anchor === "end" ? f[2] : (f[0] + f[2]) / 2, cy];
  }
  /** Replace the text, keeping the anchor point, current size (after any scaling) and current style. */
  setText(text) {
    const at = this.anchorPoint();
    const size = this.run.fontSize * (this.frameBox[3] - this.frameBox[1]) / (this.run.ascent + this.run.descent);
    const style = this.children[0] ? { ...this.children[0].style } : { fill: WHITE, stroke: "none" };
    this.text = text;
    this.build(text, size, style);
    const now2 = this.anchorPoint();
    this.shift([at[0] - now2[0], at[1] - now2[1]]);
    return this;
  }
  setFill(fill, fillOpacity) {
    super.setFill(fill, fillOpacity);
    if (this.weight === "bold") this.setStyle({ stroke: fill });
    return this;
  }
  /** Glyphs morph pairwise (Transform aligns them); the string itself switches when the morph lands. */
  interpolate(a, b, alpha, pathFunc) {
    super.interpolate(a, b, alpha, pathFunc);
    if (alpha >= 1 && b instanceof _Text) {
      this.text = b.text;
      this.run = b.run;
    }
    return this;
  }
};
var DecimalNumber = class _DecimalNumber extends Text {
  value;
  decimals;
  prefix;
  suffix;
  constructor(value, { decimals = 0, prefix = "", suffix = "", ...opts } = {}) {
    super(_DecimalNumber.format(value, decimals, prefix, suffix), opts);
    this.value = value;
    this.decimals = decimals;
    this.prefix = prefix;
    this.suffix = suffix;
  }
  static format(v, d, pre, suf) {
    return pre + v.toFixed(d) + suf;
  }
  setValue(v) {
    this.value = v;
    return this.setText(_DecimalNumber.format(v, this.decimals, this.prefix, this.suffix));
  }
  interpolate(a, b, alpha, pathFunc) {
    const va = a.value, vb = b.value;
    if (va === vb) return super.interpolate(a, b, alpha, pathFunc);
    Mobject.prototype.interpolate.call(this, a, b, alpha, pathFunc);
    return this.setValue(va + (vb - va) * alpha);
  }
};
var Code = class extends Group {
  lines;
  constructor(lines, { fontSize = 0.26, color: color2 = "#dddddd", lineHeight = 1.5 } = {}) {
    super();
    this.lines = lines.map((l, i) => {
      const t = new Text(l, { fontSize, font: "mono", color: color2, anchor: "start" });
      t.shift([-t.frameBox[0], -i * fontSize * lineHeight - t.anchorPoint()[1]]);
      return t;
    });
    this.add(...this.lines);
    this.moveTo([0, 0]);
  }
  /** A translucent bar behind line `i`, as wide as the block. */
  highlight(i, color2 = "#ffff00") {
    const r = new Rectangle({ width: this.width() + 0.3, height: this.lines[i].height() * 1.45, cornerRadius: 0.06, fill: color2, fillOpacity: 0.18, stroke: "none" });
    return r.moveTo(this.lineCenter(i));
  }
  /** Where a highlight bar for line `i` sits. */
  lineCenter(i) {
    return [this.center()[0], this.lines[i].center()[1]];
  }
};

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/panels.ts
function title(text) {
  return new Text(text, { fontSize: 0.4, weight: "bold", color: WHITE }).toEdge(UP, 0.45);
}
var CodePanel = class extends Group {
  code;
  bar;
  constructor(lines, { fontSize = 0.26, at = [0, 0] } = {}) {
    super();
    this.code = new Code(lines, { fontSize });
    this.code.moveTo(at);
    this.bar = this.code.highlight(0, YELLOW);
    this.bar.setOpacity(0);
    this.add(this.bar, this.code);
  }
  /** Animation builder: move the bar to line i (and reveal it). */
  focus(i, color2 = YELLOW) {
    return this.bar.animate.moveTo(this.code.lineCenter(i)).setStyle({ opacity: 1, fill: color2 });
  }
  unfocus() {
    return this.bar.animate.setOpacity(0);
  }
};
var StateReadout = class extends Group {
  values;
  constructor(entries, { fontSize = 0.3, at = [0, 0], gap = 0.5 } = {}) {
    super();
    this.values = {};
    entries.forEach(([k, v], i) => {
      const key = new Text(k, { fontSize, font: "mono", color: GREY, anchor: "end" });
      const val = new Text(String(v), { fontSize, font: "mono", color: WHITE, anchor: "start" });
      key.moveTo([at[0] - 0.15, at[1] - i * gap], [1, 0]);
      val.moveTo([at[0] + 0.15, at[1] - i * gap], [-1, 0]);
      this.values[k] = val;
      this.add(key, val);
    });
  }
};

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/rate.ts
var linear = (t) => t;
var smooth = (t) => {
  const s = Math.min(Math.max(t, 0), 1);
  return s * s * s * (s * (6 * s - 15) + 10);
};
var rushInto = (t) => 2 * smooth(t / 2);
var rushFrom = (t) => 2 * smooth(t / 2 + 0.5) - 1;
var thereAndBack = (t) => t < 0.5 ? smooth(2 * t) : smooth(2 * (1 - t));
var easeInQuad = (t) => t * t;
var easeOutQuad = (t) => 1 - (1 - t) * (1 - t);
var easeOutBack = (t) => {
  const c = 1.70158;
  const u = t - 1;
  return 1 + (c + 1) * u * u * u + c * u * u;
};
var wiggle = (t) => thereAndBack(t) * Math.sin(4 * Math.PI * t);
var clip = (x, lo, hi) => Math.min(Math.max(x, lo), hi);

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/animation.ts
var Animation = class {
  mobject;
  runTime;
  rateFunc;
  lagRatio;
  remover;
  // Set by begin()
  starting;
  families;
  constructor(mobject, { runTime = 1, rateFunc = smooth, lagRatio = 0, remover = false } = {}) {
    this.mobject = mobject;
    this.runTime = runTime;
    this.rateFunc = rateFunc;
    this.lagRatio = lagRatio;
    this.remover = remover;
  }
  setOptions({ runTime, rateFunc, lagRatio } = {}) {
    if (runTime != null) this.runTime = runTime;
    if (rateFunc != null) this.rateFunc = rateFunc;
    if (lagRatio != null) this.lagRatio = lagRatio;
    return this;
  }
  /** Called when play starts. Copies live here, never in the constructor. */
  begin() {
    this.starting = this.createStartingMobject();
    this.families = this.zipFamilies();
    this.interpolate(0);
  }
  createStartingMobject() {
    return this.mobject.copy();
  }
  /** The mobjects whose families are zipped as arguments to interpolateSubmobject. */
  allMobjects() {
    return [this.mobject, this.starting];
  }
  zipFamilies() {
    const fams = this.allMobjects().map((m) => m.family());
    return fams[0].map((_, i) => fams.map((f) => f[i]));
  }
  /** Lands on rateFunc(1): for a there-and-back rate function that is the start. */
  finish() {
    this.interpolate(this.rateFunc(1));
  }
  cleanUpFromScene(scene) {
    if (this.remover) scene.remove(this.mobject);
  }
  /** alpha already passed through rateFunc by the scene. */
  interpolate(alpha) {
    const n = this.families.length;
    for (let i = 0; i < n; i++) {
      this.interpolateSubmobject(...this.families[i], this.subAlpha(alpha, i, n));
    }
    this.mobject.invalidateBox();
  }
  /** Stagger alpha across submobjects by lagRatio (manim's get_sub_alpha). */
  subAlpha(alpha, index, count) {
    const lag = this.lagRatio;
    if (lag === 0) return alpha;
    const fullLength = (count - 1) * lag + 1;
    const value = alpha * fullLength;
    const lower = index * lag;
    return clip(value - lower, 0, 1);
  }
  /**
   * One family row at `alpha`: called as (sub, start, alpha), or
   * (sub, start, target, alpha) for a Transform; see allMobjects().
   */
  interpolateSubmobject(..._row) {
  }
};
var Transform2 = class extends Animation {
  target;
  pathFunc;
  replace;
  /** The target was built for this animation alone, so begin() may use it without copying. */
  ownsTarget;
  /** The target is a copy of the mobject: same structure, no alignment needed. */
  sameStructure;
  /** Set by begin(). */
  targetCopy;
  constructor(mobject, target, { pathFunc = null, replace = false, ...opts } = {}) {
    super(mobject, opts);
    this.target = target;
    this.pathFunc = pathFunc;
    this.replace = replace;
    this.ownsTarget = false;
    this.sameStructure = false;
  }
  begin() {
    this.targetCopy = this.ownsTarget ? this.target : this.target.copy();
    if (!this.sameStructure) this.mobject.alignWith(this.targetCopy);
    super.begin();
  }
  allMobjects() {
    return [this.mobject, this.starting, this.targetCopy];
  }
  interpolateSubmobject(sub2, start, target, alpha) {
    sub2.interpolate(start, target, alpha, this.pathFunc);
  }
  cleanUpFromScene(scene) {
    super.cleanUpFromScene(scene);
    if (this.replace) scene.replace(this.mobject, this.target);
  }
};
function fromAnimateBuilder(builder, opts = {}) {
  const t = new Transform2(builder.mobject, builder.buildTarget(), opts);
  t.ownsTarget = true;
  return t;
}
var FadeIn = class extends Transform2 {
  shiftVec;
  scaleFrom;
  mobjectStart;
  constructor(mobject, { shift = null, scale = 1, ...opts } = {}) {
    super(mobject, mobject, opts);
    this.shiftVec = shift;
    this.scaleFrom = scale;
  }
  begin() {
    this.target = this.mobject.copy();
    this.ownsTarget = true;
    this.sameStructure = true;
    const start = this.mobject.copy();
    for (const m of start.family()) m.style.opacity = 0;
    if (this.shiftVec) start.shift(mul(this.shiftVec, -1));
    if (this.scaleFrom !== 1) start.scale(this.scaleFrom);
    this.mobjectStart = start;
    super.begin();
  }
  createStartingMobject() {
    return this.mobjectStart;
  }
};
var FadeOut = class extends Transform2 {
  shiftVec;
  scaleTo;
  constructor(mobject, { shift = null, scale = 1, ...opts } = {}) {
    super(mobject, mobject, { remover: true, ...opts });
    this.shiftVec = shift;
    this.scaleTo = scale;
  }
  begin() {
    const end = this.mobject.copy();
    for (const m of end.family()) m.style.opacity = 0;
    if (this.shiftVec) end.shift(this.shiftVec);
    if (this.scaleTo !== 1) end.scale(this.scaleTo);
    this.target = end;
    this.ownsTarget = true;
    this.sameStructure = true;
    super.begin();
  }
  finish() {
    super.finish();
    for (const m of this.mobject.family()) m.style.opacity = 1;
  }
};
var Create = class extends Animation {
  borderWidth;
  constructor(mobject, { borderWidth = 0.012, ...opts } = {}) {
    super(mobject, { lagRatio: 0.2, ...opts });
    this.borderWidth = borderWidth;
  }
  interpolateSubmobject(sub2, start, alpha) {
    const s0 = start.style, s = sub2.style;
    const fill = clip((alpha - 0.66) / 0.34, 0, 1);
    s.drawFraction = alpha;
    s.fillOpacity = s0.fillOpacity * fill;
    s.opacity = s0.opacity * (alpha > 0 ? 1 : 0);
    if (s0.stroke === "none" && s0.fill !== "none") {
      s.stroke = s0.fill;
      s.strokeWidth = this.borderWidth;
      s.strokeOpacity = s0.fillOpacity;
    }
  }
  finish() {
    super.finish();
    for (const [sub2, start] of this.families) {
      delete sub2.style.drawFraction;
      sub2.style.stroke = start.style.stroke;
      sub2.style.strokeWidth = start.style.strokeWidth;
      sub2.style.strokeOpacity = start.style.strokeOpacity;
    }
  }
};
var Write = class extends Create {
  constructor(mobject, opts = {}) {
    super(mobject, { lagRatio: 0.3, ...opts });
  }
};
var Indicate = class extends Transform2 {
  scaleFactor;
  color;
  constructor(mobject, { scaleFactor = 1.2, color: color2 = "#ffff00", ...opts } = {}) {
    super(mobject, mobject, { rateFunc: thereAndBack, ...opts });
    this.scaleFactor = scaleFactor;
    this.color = color2;
  }
  begin() {
    const t = this.mobject.copy().scale(this.scaleFactor);
    for (const m of t.family()) {
      if (m.style.stroke !== "none") m.style.stroke = this.color;
      if (m.style.fill !== "none") m.style.fill = this.color;
    }
    this.target = t;
    this.ownsTarget = true;
    this.sameStructure = true;
    super.begin();
  }
};
var AnimationGroup = class extends Animation {
  animations;
  timings;
  maxEnd;
  constructor(animations, { lagRatio = 0, ...opts } = {}) {
    super(null, { lagRatio, ...opts });
    this.animations = animations;
    let start = 0, end = 0;
    this.timings = animations.map((a, i) => {
      if (i > 0) start += lagRatio * animations[i - 1].runTime;
      end = Math.max(end, start + a.runTime);
      return [start, start + a.runTime];
    });
    if (opts.runTime == null) this.runTime = end;
    this.maxEnd = end;
  }
  begin() {
    for (const a of this.animations) a.begin();
  }
  finish() {
    for (const a of this.animations) a.finish();
  }
  cleanUpFromScene(scene) {
    for (const a of this.animations) a.cleanUpFromScene(scene);
  }
  /** Receives raw time fraction (scene applies this.rateFunc first). */
  interpolate(alpha) {
    const t = alpha * this.maxEnd;
    this.animations.forEach((a, i) => {
      const [s, e] = this.timings[i];
      const sub2 = clip((t - s) / (e - s || 1), 0, 1);
      a.interpolate(a.rateFunc(sub2));
    });
  }
  /** The members' mobjects (a nested group contributes none of its own). */
  get mobjects() {
    return this.animations.map((a) => a.mobject).filter(Boolean);
  }
};
var LaggedStart = class extends AnimationGroup {
  constructor(animations, opts = {}) {
    super(animations, { lagRatio: 0.2, ...opts });
  }
};
function isAnimateBuilder(x) {
  return !!x && !!x._isAnimateBuilder;
}
function prepareAnimation(x) {
  if (isAnimateBuilder(x)) return fromAnimateBuilder(x);
  if (x instanceof Animation) return x;
  throw new Error("play() expects Animations or mobject.animate builders");
}
var MoveAlongPath = class extends Animation {
  path;
  fromCurrent;
  /** Set by begin(). */
  offset;
  constructor(mobject, path, { fromCurrent = true, ...opts } = {}) {
    super(mobject, opts);
    this.path = path;
    this.fromCurrent = fromCurrent;
  }
  begin() {
    const c = this.mobject.center(), p0 = this.path.pointFromProportion(0);
    this.offset = this.fromCurrent ? [c[0] - p0[0], c[1] - p0[1]] : [0, 0];
    super.begin();
  }
  interpolate(alpha) {
    const p = this.path.pointFromProportion(alpha);
    const k = 1 - alpha;
    const c = this.starting.center();
    const dx = p[0] + k * this.offset[0] - c[0], dy = p[1] + k * this.offset[1] - c[1];
    const fams = this.families;
    for (let i = 0; i < fams.length; i++) {
      const [sub2, start] = fams[i];
      const mine = sub2.pointArrays(), from = start.pointArrays();
      for (let j = 0; j < mine.length; j++) {
        const m = mine[j], x = from[j];
        for (let q = 0; q < m.length; q += 2) {
          m[q] = x[q] + dx;
          m[q + 1] = x[q + 1] + dy;
        }
      }
      sub2.touchPoints();
      sub2._bbox = null;
    }
    this.mobject.invalidateBox();
  }
};
var Flash = class extends Animation {
  constructor(mobject, opts = {}) {
    super(mobject, { rateFunc: linear, ...opts });
  }
  interpolateSubmobject(sub2, start, alpha) {
    sub2.style.opacity = start.style.opacity * Math.sin(Math.PI * alpha);
  }
};

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/mermaid.ts
var SHAPES = [
  ["(((", ")))", "doublecircle"],
  ["((", "))", "circle"],
  ["([", "])", "stadium"],
  ["[[", "]]", "subroutine"],
  ["[(", ")]", "cylinder"],
  ["{{", "}}", "hexagon"],
  ["[/", "/]", "lean_right"],
  ["[\\", "\\]", "lean_left"],
  ["[/", "\\]", "trapezoid"],
  ["[\\", "/]", "inv_trapezoid"],
  ["[", "]", "square"],
  ["(", ")", "round"],
  ["{", "}", "diamond"],
  [">", "]", "odd"]
];
var ID = /^[\p{L}\p{N}_$][\p{L}\p{N}_$]*(?:-(?![-.>xo])[\p{L}\p{N}_$]+)*/u;
var LINK = /^(<|x|o)?(-{2,}|={2,}|-\.+-)(>|x|o)?/;
var LABELED = /^(<|x|o)?(--|==|-\.)\s+([^]*?)\s*(-{2,}|={2,}|\.+-+)(>|x|o)?/;
var decode = (s) => s.replace(/<br\s*\/?>/gi, "\n").replace(/#quot;/g, '"').replace(/#amp;/g, "&").replace(/#lt;/g, "<").replace(/#gt;/g, ">");
function parseMermaid(src) {
  const g = { direction: "TB", nodes: /* @__PURE__ */ new Map(), edges: [], subgraphs: [], classDefs: /* @__PURE__ */ new Map() };
  const stack = [];
  const claimed = /* @__PURE__ */ new Set();
  const linkStyles = [];
  const lines = splitStatements(src);
  let headerSeen = false;
  for (const raw of lines) {
    const line2 = raw.trim();
    if (!line2) continue;
    let m;
    if (!headerSeen) {
      if (m = /^(?:flowchart|graph)(?:\s+(TB|TD|BT|LR|RL))?\s*$/i.exec(line2)) {
        g.direction = (m[1] ?? "TB").toUpperCase().replace("TD", "TB");
        headerSeen = true;
        continue;
      }
      throw new SyntaxError(`expected "flowchart <dir>" or "graph <dir>", got: ${line2}`);
    }
    if (m = /^classDef\s+([\w,-]+)\s+(.+)$/.exec(line2)) {
      for (const name of m[1].split(",")) g.classDefs.set(name, splitStyle(m[2]));
      continue;
    }
    if (m = /^class\s+([\w,\s-]+?)\s+([\w-]+)$/.exec(line2)) {
      for (const id of m[1].split(",").map((x) => x.trim())) g.nodes.get(id)?.classes.push(m[2]);
      continue;
    }
    if (m = /^style\s+([\w-]+)\s+(.+)$/.exec(line2)) {
      ensure(g, m[1]).style.push(...splitStyle(m[2]));
      continue;
    }
    if (m = /^linkStyle\s+(default|[\d,\s]+?)\s+(.+)$/.exec(line2)) {
      linkStyles.push([m[1], splitStyle(m[2])]);
      continue;
    }
    if (m = /^direction\s+(TB|TD|BT|LR|RL)$/i.exec(line2)) {
      if (stack.length) stack.at(-1).dir = m[1].toUpperCase().replace("TD", "TB");
      continue;
    }
    if (m = /^subgraph\s+(.+)$/.exec(line2)) {
      const rest = m[1].trim();
      let id, title2;
      const withTitle = /^([\w-]+)\s*\[\s*"?([^"\]]*)"?\s*\]$/.exec(rest);
      if (withTitle) {
        id = withTitle[1];
        title2 = withTitle[2];
      } else if (/^"[^"]*"$/.test(rest)) {
        title2 = rest.slice(1, -1);
        id = title2;
      } else if (/^[\w-]+$/.test(rest)) {
        id = rest;
        title2 = rest;
      } else {
        title2 = rest;
        id = rest;
      }
      const sg = { id, title: decode(title2), nodes: [], parent: stack.at(-1)?.id ?? null };
      g.subgraphs.push(sg);
      if (stack.length) stack.at(-1).nodes.push(id);
      stack.push(Object.assign(sg, { refs: /* @__PURE__ */ new Set() }));
      continue;
    }
    if (/^end$/.test(line2)) {
      const sg = stack.pop();
      if (!sg) throw new SyntaxError('"end" without a subgraph');
      for (const id of sg.refs) if (!claimed.has(id)) {
        sg.nodes.push(id);
        claimed.add(id);
      }
      delete sg.refs;
      continue;
    }
    parseChain(line2, g, stack);
  }
  if (stack.length) throw new SyntaxError(`subgraph "${stack.at(-1).id}" is not closed with "end"`);
  for (const [which, st] of linkStyles) {
    const idx = which === "default" ? g.edges.map((_, i) => i) : which.split(",").map((s) => Number(s.trim()));
    for (const i of idx) if (g.edges[i]) g.edges[i].style = [...st, "fill:none"];
  }
  return g;
}
function splitStatements(src) {
  const out = [];
  for (const rawLine of src.split("\n")) {
    const line2 = rawLine.replace(/%%.*$/, "");
    let cur = "", q = false, depth = 0;
    for (const ch of line2) {
      if (ch === '"') q = !q;
      if (!q && "[({".includes(ch)) depth++;
      if (!q && "])}".includes(ch)) depth = Math.max(0, depth - 1);
      if (ch === ";" && !q && depth === 0) {
        out.push(cur);
        cur = "";
        continue;
      }
      cur += ch;
    }
    out.push(cur);
  }
  return out;
}
var splitStyle = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);
function ensure(g, id) {
  let n = g.nodes.get(id);
  if (!n) {
    n = { id, text: id, shape: void 0, classes: [], style: [] };
    g.nodes.set(id, n);
  }
  return n;
}
function parseChain(line2, g, open) {
  let s = line2;
  const ws = () => {
    s = s.replace(/^\s+/, "");
  };
  const nodeList = () => {
    const ids = [];
    for (; ; ) {
      ws();
      const id = node();
      ids.push(id);
      ws();
      if (s.startsWith("&")) {
        s = s.slice(1);
        continue;
      }
      return ids;
    }
  };
  const node = () => {
    const m = ID.exec(s);
    if (!m) throw new SyntaxError(`expected a node id at: ${s.slice(0, 30)}`);
    const id = m[0];
    s = s.slice(id.length);
    const n = ensure(g, id);
    if (!g.subgraphs.some((x) => x.id === id)) for (const sg of open) sg.refs.add(id);
    for (const [open2, close, type] of SHAPES) {
      if (!s.startsWith(open2)) continue;
      const body = s.slice(open2.length);
      let text, rest;
      const quoted = /^\s*"([^"]*)"\s*/.exec(body);
      if (quoted && body.slice(quoted[0].length).startsWith(close)) {
        text = quoted[1];
        rest = body.slice(quoted[0].length + close.length);
      } else {
        const end = body.indexOf(close);
        if (end < 0) continue;
        text = body.slice(0, end).trim();
        rest = body.slice(end + close.length);
      }
      n.text = decode(text);
      n.shape = type;
      s = rest;
      break;
    }
    const cls = /^:::([\w-]+)/.exec(s);
    if (cls) {
      n.classes.push(cls[1]);
      s = s.slice(cls[0].length);
    }
    return id;
  };
  const link = () => {
    ws();
    let m = LABELED.exec(s), text = "";
    let start, body, end;
    let closer;
    if (m) {
      start = m[1];
      body = m[2] + m[4];
      closer = m[4];
      text = m[3];
      end = m[5];
    } else if (m = LINK.exec(s)) {
      start = m[1];
      body = m[2];
      end = m[3];
      closer = body;
    } else return null;
    s = s.slice(m[0].length);
    const pipe = /^\s*\|([^|]*)\|/.exec(s);
    if (pipe) {
      text = pipe[1];
      s = s.slice(pipe[0].length);
    }
    const stroke = body.includes("=") ? "thick" : body.includes(".") ? "dotted" : "normal";
    const type = start === "<" && end === ">" ? "double_arrow_point" : end === ">" ? "arrow_point" : end === "x" ? "arrow_cross" : end === "o" ? "arrow_circle" : "arrow_open";
    text = text.trim();
    if (/^"[^"]*"$/.test(text)) text = text.slice(1, -1);
    return { text: decode(text), stroke, type, length: lengthOf(closer, stroke, end) };
  };
  let left = nodeList();
  for (; ; ) {
    const l = link();
    if (!l) {
      ws();
      if (s.length) throw new SyntaxError(`unexpected: ${s.slice(0, 30)}`);
      return;
    }
    const right = nodeList();
    for (const a of left) for (const b of right) g.edges.push({ from: a, to: b, ...l });
    left = right;
  }
}
function lengthOf(closer, stroke, end) {
  if (stroke === "dotted") return Math.max(1, (closer.match(/\./g) || []).length);
  const n = (closer.match(/[-=]/g) || []).length;
  return Math.max(1, end ? n - 1 : n - 2);
}

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/graphlayout.ts
var DEFAULTS = { nodeSep: 0.45, rankSep: 0.9, clusterPad: 0.22, dummySep: 0.14, iterations: 24 };
function layoutGraph(graph, options = {}) {
  const o = { ...DEFAULTS, ...options };
  const dir = (graph.direction ?? "TB").replace("TD", "TB");
  const horizontal = dir === "LR" || dir === "RL";
  const flip = dir === "BT" || dir === "RL";
  const clusters = new Map((graph.clusters ?? []).map((c) => [c.id, { ...c, title: c.title ?? { w: 0, h: 0 } }]));
  const pathCache = /* @__PURE__ */ new Map();
  const clusterPath = (cid) => {
    if (cid == null) return [];
    let p = pathCache.get(cid);
    if (p) return p;
    const c = clusters.get(cid);
    p = c ? [...clusterPath(c.parent), cid] : [];
    pathCache.set(cid, p);
    return p;
  };
  const V = [];
  const byId = /* @__PURE__ */ new Map();
  graph.nodes.forEach((n, i) => {
    const v = { id: n.id, real: true, index: i, thick: horizontal ? n.w : n.h, breadth: horizontal ? n.h : n.w, w: n.w, h: n.h, cluster: n.cluster ?? null, rank: 0, order: 0, pos: 0 };
    V.push(v);
    byId.set(n.id, v);
  });
  const lca = (a, b) => {
    const pa = clusterPath(a), pb = clusterPath(b);
    let k = 0;
    while (k < pa.length && k < pb.length && pa[k] === pb[k]) k++;
    return k ? pa[k - 1] : null;
  };
  const E = [];
  graph.edges.forEach((e, i) => {
    if (e.from === e.to || !byId.has(e.from) || !byId.has(e.to)) return;
    E.push({ index: i, u: byId.get(e.from), v: byId.get(e.to), minlen: 2 * Math.max(1, e.minlen ?? 1), label: e.label ?? null, reversed: false });
  });
  {
    const out = new Map(V.map((v) => [v, []]));
    for (const e of E) out.get(e.u).push(e);
    const state = /* @__PURE__ */ new Map();
    const visit = (v) => {
      state.set(v, 1);
      for (const e of out.get(v)) {
        const s = state.get(e.v);
        if (s === 1) e.reversed = true;
        else if (!s) visit(e.v);
      }
      state.set(v, 2);
    };
    for (const v of V) if (!state.get(v)) visit(v);
    for (const e of E) if (e.reversed) [e.u, e.v] = [e.v, e.u];
  }
  const preds = new Map(V.map((v) => [v, []])), succs = new Map(V.map((v) => [v, []]));
  for (const e of E) {
    succs.get(e.u).push(e);
    preds.get(e.v).push(e);
  }
  const topo = [];
  {
    const indeg = new Map(V.map((v) => [v, preds.get(v).length]));
    const queue = V.filter((v) => indeg.get(v) === 0);
    while (queue.length) {
      const v = queue.shift();
      topo.push(v);
      for (const e of succs.get(v)) {
        indeg.set(e.v, indeg.get(e.v) - 1);
        if (indeg.get(e.v) === 0) queue.push(e.v);
      }
    }
  }
  const relax = () => {
    for (const v of topo) for (const e of succs.get(v)) e.v.rank = Math.max(e.v.rank, v.rank + e.minlen);
  };
  relax();
  for (const v of [...topo].reverse()) {
    if (preds.get(v).length === 0 && succs.get(v).length) v.rank = Math.min(...succs.get(v).map((e) => e.v.rank - e.minlen));
  }
  for (const c of clusters.values()) {
    const members = V.filter((v) => clusterPath(v.cluster).includes(c.id));
    if (members.length < 2) continue;
    const inside = new Set(members);
    if (E.some((e) => inside.has(e.u) && inside.has(e.v))) continue;
    const r = Math.max(...members.map((v) => v.rank));
    for (const v of members) v.rank = r;
  }
  relax();
  const minRank = Math.min(0, ...V.map((v) => v.rank));
  for (const v of V) v.rank -= minRank;
  const chains = [];
  const links = [];
  for (const e of E) {
    const chain = [e.u];
    const mid = e.u.rank + Math.floor((e.v.rank - e.u.rank) / 2);
    const cl = lca(e.u.cluster, e.v.cluster);
    for (let r = e.u.rank + 1; r < e.v.rank; r++) {
      const isLabel = e.label && r === mid;
      const d = {
        id: `~${e.index}:${r}`,
        real: false,
        isLabel,
        edge: e,
        rank: r,
        order: 0,
        pos: 0,
        cluster: cl,
        thick: isLabel ? horizontal ? e.label.w : e.label.h : 0,
        breadth: isLabel ? horizontal ? e.label.h : e.label.w : 0
      };
      V.push(d);
      chain.push(d);
    }
    chain.push(e.v);
    chains.push({ e, chain });
    for (let i = 1; i < chain.length; i++) links.push([chain[i - 1], chain[i]]);
  }
  const maxRank = Math.max(0, ...V.map((v) => v.rank));
  const layers = Array.from({ length: maxRank + 1 }, () => []);
  for (const v of V) layers[v.rank].push(v);
  const up = new Map(V.map((v) => [v, []])), down = new Map(V.map((v) => [v, []]));
  for (const [a, b] of links) {
    down.get(a).push(b);
    up.get(b).push(a);
  }
  layers.forEach((L) => L.forEach((v, i) => {
    v.order = i;
  }));
  const sortLayer = (L, nbrs) => {
    const bary = /* @__PURE__ */ new Map();
    for (const v of L) {
      const ns = nbrs.get(v);
      bary.set(v, ns.length ? ns.reduce((s, n) => s + n.order, 0) / ns.length : v.order);
    }
    const arrange = (items, depth) => {
      const groups = /* @__PURE__ */ new Map();
      for (const v of items) {
        const p = clusterPath(v.cluster);
        const key = depth < p.length ? p[depth] : v;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(v);
      }
      const gs = [...groups.entries()].map(([key, vs]) => ({
        key,
        vs,
        b: vs.reduce((s, v) => s + bary.get(v), 0) / vs.length,
        first: Math.min(...vs.map((v) => v.order))
      }));
      gs.sort((a, b) => a.b - b.b || a.first - b.first);
      return gs.flatMap((g) => typeof g.key === "string" ? arrange(g.vs, depth + 1) : g.vs);
    };
    arrange(L, 0).forEach((v, i) => {
      v.order = i;
    });
    L.sort((a, b) => a.order - b.order);
  };
  const crossings = () => {
    let n = 0;
    for (let r = 0; r < maxRank; r++) {
      const ls = links.filter(([a]) => a.rank === r);
      for (let i = 0; i < ls.length; i++) for (let j = i + 1; j < ls.length; j++) {
        const [a1, b1] = ls[i], [a2, b2] = ls[j];
        if ((a1.order - a2.order) * (b1.order - b2.order) < 0) n++;
      }
    }
    return n;
  };
  let best = crossings(), bestOrder = V.map((v) => v.order);
  for (let it = 0; it < o.iterations && best > 0; it++) {
    if (it % 2 === 0) for (let r = 1; r <= maxRank; r++) sortLayer(layers[r], up);
    else for (let r = maxRank - 1; r >= 0; r--) sortLayer(layers[r], down);
    const c = crossings();
    if (c < best) {
      best = c;
      bestOrder = V.map((v) => v.order);
    }
  }
  V.forEach((v, i) => {
    v.order = bestOrder[i];
  });
  for (const L of layers) L.sort((a, b) => a.order - b.order);
  const titleBand = (c) => clusters.get(c).title.h + 0.1;
  const sep = (a, b) => {
    let s = (a.breadth + b.breadth) / 2 + (a.real || b.real || a.isLabel || b.isLabel ? o.nodeSep : o.dummySep);
    const pa = clusterPath(a.cluster), pb = clusterPath(b.cluster);
    let k = 0;
    while (k < pa.length && k < pb.length && pa[k] === pb[k]) k++;
    s += (pa.length - k) * o.clusterPad + (pb.length - k) * o.clusterPad;
    if (horizontal) for (let i = k; i < pb.length; i++) s += titleBand(pb[i]);
    return s;
  };
  for (const L of layers) {
    let x = 0;
    L.forEach((v, i) => {
      if (i) x += sep(L[i - 1], v);
      v.pos = x;
    });
    const mid = x / 2;
    for (const v of L) v.pos -= mid;
  }
  const weight = (a, b) => !a.real && !b.real ? 8 : !a.real || !b.real ? 2 : 1;
  const place = (L, nbrs) => {
    const n = L.length;
    if (!n) return;
    const off = new Array(n).fill(0);
    for (let i = 1; i < n; i++) off[i] = off[i - 1] + sep(L[i - 1], L[i]);
    const target = [], wts = [];
    for (let i = 0; i < n; i++) {
      const v = L[i], ns = nbrs.get(v);
      let sw = 0, sx = 0;
      for (const u of ns) {
        const w = weight(u, v);
        sw += w;
        sx += w * u.pos;
      }
      target.push((sw ? sx / sw : v.pos) - off[i]);
      wts.push(sw || 0.5);
    }
    const y = isotonic(target, wts);
    for (let i = 0; i < n; i++) L[i].pos = y[i] + off[i];
  };
  const both = new Map(V.map((v) => [v, [...up.get(v), ...down.get(v)]]));
  for (let it = 0; it < 16; it++) {
    if (it % 2 === 0) for (let r = 1; r <= maxRank; r++) place(layers[r], up);
    else for (let r = maxRank - 1; r >= 0; r--) place(layers[r], down);
  }
  for (let it = 0; it < 4; it++) for (const L of layers) place(L, both);
  const thick = layers.map((L) => Math.max(0, ...L.map((v) => v.thick)));
  const span = /* @__PURE__ */ new Map();
  for (const v of V) for (const c of clusterPath(v.cluster)) {
    const s = span.get(c) ?? [Infinity, -Infinity];
    span.set(c, [Math.min(s[0], v.rank), Math.max(s[1], v.rank)]);
  }
  const chainLen = (ids) => {
    let m = 0;
    for (const c of ids) {
      let k = 0, p = c;
      while (p != null && ids.includes(p)) {
        k++;
        p = clusters.get(p).parent;
      }
      m = Math.max(m, k);
    }
    return m;
  };
  const major = [0];
  for (let r = 1; r <= maxRank; r++) {
    const opening = [...span].filter(([, s]) => s[0] === r).map(([c]) => c);
    const closing = [...span].filter(([, s]) => s[1] === r - 1).map(([c]) => c);
    const openPad = horizontal ? o.clusterPad : o.clusterPad + Math.max(0, ...opening.map(titleBand));
    const gap = o.rankSep / 2 + chainLen(opening) * openPad + chainLen(closing) * o.clusterPad;
    major.push(major[r - 1] + thick[r - 1] / 2 + gap + thick[r] / 2);
  }
  const toXY = (pos, mj) => {
    const m = flip ? -mj : mj;
    return horizontal ? [m, pos] : [pos, m];
  };
  const centerOf = (v) => toXY(v.pos, major[v.rank]);
  const boxes = () => {
    const out = /* @__PURE__ */ new Map();
    const order = [...clusters.keys()].sort((a, b) => clusterPath(b).length - clusterPath(a).length);
    for (const c of order) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      const grow = (a, b, cx, cy) => {
        x0 = Math.min(x0, a);
        y0 = Math.min(y0, b);
        x1 = Math.max(x1, cx);
        y1 = Math.max(y1, cy);
      };
      for (const v of V) {
        if (!clusterPath(v.cluster).includes(c) || !v.real && !v.isLabel) continue;
        const [x, y] = centerOf(v), w = v.real ? v.w : horizontal ? v.thick : v.breadth, h = v.real ? v.h : horizontal ? v.breadth : v.thick;
        grow(x - w / 2, y - h / 2, x + w / 2, y + h / 2);
      }
      for (const [k, b] of out) if (clusters.get(k).parent === c) grow(b.x0, b.y0, b.x1, b.y1);
      if (x0 === Infinity) continue;
      const t = clusters.get(c).title;
      x0 -= o.clusterPad;
      x1 += o.clusterPad;
      y1 += o.clusterPad;
      y0 -= o.clusterPad + (t.h ? t.h + 0.1 : 0);
      const need = t.w + 2 * o.clusterPad - (x1 - x0);
      if (need > 0) {
        x0 -= need / 2;
        x1 += need / 2;
      }
      out.set(c, { x0, y0, x1, y1 });
    }
    return out;
  };
  const ivBox = (b) => horizontal ? [b.y0, b.y1] : [b.x0, b.x1];
  const ivMajorBox = (b) => horizontal ? [b.x0, b.x1] : [b.y0, b.y1];
  const ivV = (v) => [v.pos - v.breadth / 2, v.pos + v.breadth / 2];
  const overlaps = (a, b) => a[0] < b[1] - 1e-9 && b[0] < a[1] - 1e-9;
  const cascade = (L, moved, dir2) => {
    const idx = L.map((v, i) => moved.has(v) ? i : -1).filter((i) => i >= 0);
    if (!idx.length) return;
    if (dir2 > 0) for (let j = Math.max(...idx) + 1; j < L.length; j++) L[j].pos = Math.max(L[j].pos, L[j - 1].pos + sep(L[j - 1], L[j]));
    else for (let j = Math.min(...idx) - 1; j >= 0; j--) L[j].pos = Math.min(L[j].pos, L[j + 1].pos - sep(L[j], L[j + 1]));
  };
  for (let pass = 0; pass < 400; pass++) {
    const B = boxes();
    let moved = null;
    for (const [c, b] of B) {
      const [bmin, bmax] = ivMajorBox(b);
      const [lo0, hi0] = ivBox(b), cx = (lo0 + hi0) / 2;
      const anc = new Set(clusterPath(c));
      for (const v of V) {
        if (!v.real && !v.isLabel || clusterPath(v.cluster).includes(c)) continue;
        const [vx, vy] = centerOf(v);
        const vmaj = horizontal ? vx : vy, vth = v.thick / 2 + 0.01;
        if (!(vmaj + vth > bmin && vmaj - vth < bmax)) continue;
        if (!overlaps(ivV(v), [lo0, hi0])) continue;
        const outer = clusterPath(v.cluster).find((x) => !anc.has(x));
        const block = outer ? V.filter((u) => clusterPath(u.cluster).includes(outer)) : [v];
        const lo = Math.min(...block.map((u) => u.pos - u.breadth / 2)), hi = Math.max(...block.map((u) => u.pos + u.breadth / 2));
        const right = (lo + hi) / 2 >= cx;
        const delta = right ? hi0 + o.nodeSep * 0.6 - lo : lo0 - o.nodeSep * 0.6 - hi;
        for (const u of block) u.pos += delta;
        moved = { set: new Set(block), dir: Math.sign(delta) };
        break;
      }
      if (moved) break;
    }
    if (!moved) {
      const ids = [...B.keys()];
      outer: for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
        const pa = clusterPath(ids[i]), pb = clusterPath(ids[j]);
        if (pa.includes(ids[j]) || pb.includes(ids[i])) continue;
        const a = B.get(ids[i]), bb = B.get(ids[j]);
        if (!(overlaps(ivBox(a), ivBox(bb)) && overlaps(ivMajorBox(a), ivMajorBox(bb)))) continue;
        const top = pb.find((x) => !pa.includes(x));
        const block = V.filter((u) => clusterPath(u.cluster).includes(top));
        const [alo, ahi] = ivBox(a), [blo, bhi] = ivBox(bb);
        const right = (blo + bhi) / 2 >= (alo + ahi) / 2;
        const delta = right ? ahi + o.nodeSep * 0.4 - blo : alo - o.nodeSep * 0.4 - bhi;
        for (const u of block) u.pos += delta;
        moved = { set: new Set(block), dir: Math.sign(delta) };
        break outer;
      }
    }
    if (!moved) break;
    for (const L of layers) cascade(L, moved.set, moved.dir);
  }
  const nodes = /* @__PURE__ */ new Map();
  for (const v of V) if (v.real) {
    const [x, y] = centerOf(v);
    nodes.set(v.id, { x, y, w: v.w, h: v.h, rank: v.rank });
  }
  const edges = /* @__PURE__ */ new Map();
  for (const { e, chain } of chains) {
    let pts = chain.map(centerOf);
    if (e.reversed) pts = pts.reverse();
    const lab = chain.find((d) => d.isLabel);
    edges.set(e.index, { points: pts, label: lab ? centerOf(lab) : null, reversed: e.reversed });
  }
  graph.edges.forEach((e, i) => {
    if (e.from !== e.to || !nodes.has(e.from)) return;
    const n = nodes.get(e.from), r = Math.min(n.h, 0.6) / 2;
    edges.set(i, { points: [[n.x + n.w / 2, n.y - r * 0.6], [n.x + n.w / 2 + r * 1.6, n.y - r], [n.x + n.w / 2 + r * 1.6, n.y + r], [n.x + n.w / 2, n.y + r * 0.6]], label: e.label ? [n.x + n.w / 2 + r * 1.6 + e.label.w / 2 + 0.05, n.y] : null, loop: true });
  });
  return { nodes, edges, clusters: boxes(), crossings: best, ranks: maxRank + 1 };
}
function isotonic(t, w) {
  const blocks = [];
  for (let i = 0; i < t.length; i++) {
    blocks.push({ v: t[i], w: w[i], n: 1 });
    while (blocks.length > 1 && blocks[blocks.length - 2].v > blocks[blocks.length - 1].v) {
      const b = blocks.pop(), a = blocks.pop();
      const ww = a.w + b.w;
      blocks.push({ v: (a.v * a.w + b.v * b.w) / ww, w: ww, n: a.n + b.n });
    }
  }
  const out = [];
  for (const b of blocks) for (let k = 0; k < b.n; k++) out.push(b.v);
  return out;
}

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/flowchart.ts
var FLOWCHART_THEME = {
  node: { stroke: "#58c4dd", fill: "#58c4dd", fillOpacity: 0.12, color: "#ffffff", strokeWidth: 0.03 },
  cluster: { stroke: "#4a4a4a", fill: "#ffffff", fillOpacity: 0.035, color: "#9a9a9a", strokeWidth: 0.022 },
  edge: { stroke: "#8a8a8a", color: "#bbbbbb", strokeWidth: 0.024 },
  labelBg: "#1a1a1a"
};
var PAD_X = 0.26;
var PAD_Y = 0.17;
function styleOf(list) {
  const s = {};
  for (const item of list) {
    const [k, v] = item.split(":").map((x) => x.trim());
    if (!v) continue;
    if (k === "fill") {
      s.fill = v;
      s.fillOpacity = v === "none" ? 0 : 1;
    } else if (k === "stroke") s.stroke = v;
    else if (k === "color") s.color = v;
    else if (k === "stroke-width") s.strokeWidth = parseFloat(v) * 0.014;
    else if (k === "stroke-dasharray") s.dashed = true;
    else if (k === "opacity") s.opacity = parseFloat(v);
  }
  return s;
}
function label(text, { fontSize, color: color2, font = "sans" }) {
  const lines = String(text).split("\n").map((l) => new Text(l || " ", { fontSize, color: color2, font }));
  return lines.length === 1 ? lines[0] : new Group(...lines).arrange([0, -1], fontSize * 0.28);
}
function shapeFor(type, w, h, style) {
  const st = { stroke: style.stroke, strokeWidth: style.strokeWidth, fill: style.fill, fillOpacity: style.fillOpacity };
  const W = w + 2 * PAD_X, H = h + 2 * PAD_Y;
  switch (type) {
    case "round":
      return new Rectangle({ width: W, height: H, cornerRadius: Math.min(0.2, H * 0.3), ...st });
    case "stadium":
      return new Rectangle({ width: W + H * 0.3, height: H, cornerRadius: H / 2, ...st });
    case "circle":
    case "doublecircle": {
      const d = Math.hypot(w, h) + 2 * PAD_Y;
      return new Circle({ radius: d / 2, ...st });
    }
    case "diamond": {
      const A = w * 1.45 + h + 0.25, B = h * 1.45 + w * 0.3 + 0.25;
      return new Polygon([[0, B / 2], [A / 2, 0], [0, -B / 2], [-A / 2, 0]], st);
    }
    case "hexagon": {
      const k = H / 2;
      return new Polygon([[-W / 2 - k / 2, 0], [-W / 2 + k / 2, H / 2], [W / 2 - k / 2, H / 2], [W / 2 + k / 2, 0], [W / 2 - k / 2, -H / 2], [-W / 2 + k / 2, -H / 2]], st);
    }
    case "odd":
      return new Polygon([[-W / 2 - H * 0.3, H / 2], [W / 2, H / 2], [W / 2, -H / 2], [-W / 2 - H * 0.3, -H / 2], [-W / 2, 0]], st);
    case "lean_right":
      return new Polygon([[-W / 2 + H * 0.2, H / 2], [W / 2 + H * 0.2, H / 2], [W / 2 - H * 0.2, -H / 2], [-W / 2 - H * 0.2, -H / 2]], st);
    case "lean_left":
      return new Polygon([[-W / 2 - H * 0.2, H / 2], [W / 2 - H * 0.2, H / 2], [W / 2 + H * 0.2, -H / 2], [-W / 2 + H * 0.2, -H / 2]], st);
    case "trapezoid":
      return new Polygon([[-W / 2 + H * 0.2, H / 2], [W / 2 - H * 0.2, H / 2], [W / 2 + H * 0.2, -H / 2], [-W / 2 - H * 0.2, -H / 2]], st);
    case "inv_trapezoid":
      return new Polygon([[-W / 2 - H * 0.2, H / 2], [W / 2 + H * 0.2, H / 2], [W / 2 - H * 0.2, -H / 2], [-W / 2 + H * 0.2, -H / 2]], st);
    case "cylinder":
      return cylinder(W, H + 0.2, st);
    case "subroutine": {
      const r = new Rectangle({ width: W + 0.2, height: H, ...st });
      const k = W / 2 + 0.02;
      r.startNewPath([-k, H / 2]);
      r.addLineTo([-k, -H / 2]);
      r.startNewPath([k, H / 2]);
      r.addLineTo([k, -H / 2]);
      return r;
    }
    default:
      return new Rectangle({ width: W, height: H, cornerRadius: 0.05, ...st });
  }
}
function cylinder(W, H, st) {
  const c = new VMobject(st);
  const rx = W / 2, ry = Math.min(0.12, H * 0.12), top = H / 2 - ry, bot = -H / 2 + ry, k = 0.5523;
  c.startNewPath([-rx, top]);
  c.addLineTo([-rx, bot]);
  c.addCubic([-rx, bot - k * ry], [-k * rx, bot - ry], [0, bot - ry]);
  c.addCubic([k * rx, bot - ry], [rx, bot - k * ry], [rx, bot]);
  c.addLineTo([rx, top]);
  c.addCubic([rx, top - k * ry], [k * rx, top - ry], [0, top - ry]);
  c.addCubic([-k * rx, top - ry], [-rx, top - k * ry], [-rx, top]);
  c.closed[0] = true;
  c.startNewPath([-rx, top]);
  c.addCubic([-rx, top + k * ry], [-k * rx, top + ry], [0, top + ry]);
  c.addCubic([k * rx, top + ry], [rx, top + k * ry], [rx, top]);
  c.addCubic([rx, top - k * ry], [k * rx, top - ry], [0, top - ry]);
  c.addCubic([-k * rx, top - ry], [-rx, top - k * ry], [-rx, top]);
  c.closed[1] = true;
  return c;
}
function clip2(n, p) {
  const dx = p[0] - n.x, dy = p[1] - n.y;
  if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) return [n.x, n.y];
  let t;
  if (n.kind === "circle") t = n.w / 2 / Math.hypot(dx, dy);
  else if (n.kind === "diamond") t = 1 / (Math.abs(dx) / (n.w / 2) + Math.abs(dy) / (n.h / 2));
  else t = Math.min(Math.abs(dx) > 1e-9 ? n.w / 2 / Math.abs(dx) : Infinity, Math.abs(dy) > 1e-9 ? n.h / 2 / Math.abs(dy) : Infinity);
  t = Math.min(t, 1);
  return [n.x + dx * t, n.y + dy * t];
}
function basisPath(pts, style) {
  const m = new VMobject(style);
  if (pts.length === 2) {
    m.startNewPath(pts[0]);
    m.addLineTo(pts[1]);
    return m;
  }
  const P = [pts[0], ...pts, pts.at(-1)];
  m.startNewPath(pts[0]);
  m.addLineTo([(5 * P[0][0] + P[1][0]) / 6, (5 * P[0][1] + P[1][1]) / 6]);
  for (let i = 2; i < P.length; i++) {
    const [x0, y0] = P[i - 2], [x1, y1] = P[i - 1], [x, y] = P[i];
    m.addCubic([(2 * x0 + x1) / 3, (2 * y0 + y1) / 3], [(x0 + 2 * x1) / 3, (y0 + 2 * y1) / 3], [(x0 + 4 * x1 + x) / 6, (y0 + 4 * y1 + y) / 6]);
  }
  m.addLineTo(pts.at(-1));
  return m;
}
function dashed(path, style, dash = 0.09, gap = 0.07) {
  const out = new VMobject({ ...style, fill: "none" });
  const n = path.numCurves(0), samples = [];
  for (let c = 0; c < n; c++) for (let k = 0; k < 16; k++) samples.push(path.pointOnCurve(0, c, k / 16));
  samples.push(path.pointOnCurve(0, n - 1, 1));
  let acc = 0, on = true, cur = null;
  for (let i = 1; i < samples.length; i++) {
    let [ax, ay] = samples[i - 1];
    const [bx, by] = samples[i];
    let seg = Math.hypot(bx - ax, by - ay);
    while (seg > 1e-9) {
      const left = (on ? dash : gap) - acc, step = Math.min(left, seg), t = step / seg;
      const nx = ax + (bx - ax) * t, ny = ay + (by - ay) * t;
      if (on) {
        if (!cur) {
          out.startNewPath([ax, ay]);
          cur = true;
        }
        out.addLineTo([nx, ny]);
      }
      acc += step;
      seg -= step;
      ax = nx;
      ay = ny;
      if (acc >= (on ? dash : gap) - 1e-9) {
        acc = 0;
        on = !on;
        cur = null;
      }
    }
  }
  return out;
}
function arrowHead(tip, dir, size, color2) {
  const [ux, uy] = dir, px = -uy, py = ux, L = size, W = size * 0.62;
  const bx = tip[0] - ux * L, by = tip[1] - uy * L;
  return new Polygon([tip, [bx + px * W / 2, by + py * W / 2], [bx - px * W / 2, by - py * W / 2]], { fill: color2, stroke: "none" });
}
var Flowchart = class extends Group {
  graph;
  layout;
  _cluster;
  _node;
  _edge;
  /** `src`: mermaid flowchart source, or a parsed graph. */
  constructor(src, { width = 15, height = 7.6, fontSize = 0.24, theme = FLOWCHART_THEME, layout = {} } = {}) {
    super();
    const g = typeof src === "string" ? parseMermaid(src) : src;
    this.graph = g;
    const classStyle = (n) => Object.assign({}, ...n.classes.map((c) => styleOf(g.classDefs.get(c) ?? [])), styleOf(n.style));
    const sgIds = new Set(g.subgraphs.map((s2) => s2.id));
    const nodeIds = [...g.nodes.keys()].filter((id) => !sgIds.has(id));
    const built = /* @__PURE__ */ new Map();
    for (const id of nodeIds) {
      const n = g.nodes.get(id);
      const st = { ...theme.node, ...classStyle(n) };
      const lab = label(n.text, { fontSize, color: st.color });
      const shape2 = shapeFor(n.shape ?? "square", lab.width(), lab.height(), st);
      const kind = n.shape === "circle" || n.shape === "doublecircle" ? "circle" : n.shape === "diamond" ? "diamond" : "rect";
      built.set(id, { shape: shape2, lab, kind, w: shape2.width(), h: shape2.height() });
    }
    const memberOf = /* @__PURE__ */ new Map();
    for (const s2 of g.subgraphs) for (const id of s2.nodes) if (!sgIds.has(id)) memberOf.set(id, s2.id);
    const anchor2 = (id) => {
      if (!sgIds.has(id)) return id;
      const s2 = g.subgraphs.find((x) => x.id === id);
      for (const m of s2.nodes) {
        const a = anchor2(m);
        if (a) return a;
      }
      return null;
    };
    const edgeLabels = g.edges.map((e) => e.text ? label(e.text, { fontSize: fontSize * 0.85, color: theme.edge.color }) : null);
    const titles = new Map(g.subgraphs.map((s2) => [s2.id, label(s2.title, { fontSize: fontSize * 0.85, color: theme.cluster.color })]));
    const L = layoutGraph({
      direction: g.direction,
      nodes: nodeIds.map((id) => ({ id, w: built.get(id).w, h: built.get(id).h, cluster: memberOf.get(id) ?? null })),
      edges: g.edges.map((e, i) => {
        const l = edgeLabels[i];
        return { from: anchor2(e.from), to: anchor2(e.to), minlen: e.length, label: l ? { w: l.width() + 0.16, h: l.height() + 0.1 } : null };
      }).map((e) => e.from && e.to ? e : { ...e, from: "", to: "" }),
      clusters: g.subgraphs.map((s2) => {
        const t = titles.get(s2.id);
        return { id: s2.id, parent: s2.parent, title: t ? { w: t.width(), h: t.height() } : null };
      })
    }, layout);
    this.layout = L;
    const P = ([x, y]) => [x, -y];
    const depth = (id) => {
      let d = 0, s2 = g.subgraphs.find((x) => x.id === id);
      while (s2?.parent) {
        const p = s2.parent;
        d++;
        s2 = g.subgraphs.find((x) => x.id === p);
      }
      return d;
    };
    this._cluster = /* @__PURE__ */ new Map();
    this._node = /* @__PURE__ */ new Map();
    this._edge = [];
    for (const s2 of [...g.subgraphs].sort((a, b) => depth(a.id) - depth(b.id))) {
      const b = L.clusters.get(s2.id);
      if (!b) continue;
      const st = { ...theme.cluster, ...styleOf(g.nodes.get(s2.id)?.style ?? []) };
      const box = new Rectangle({ width: b.x1 - b.x0, height: b.y1 - b.y0, cornerRadius: 0.1, stroke: st.stroke, strokeWidth: st.strokeWidth, fill: st.fill, fillOpacity: st.fillOpacity });
      box.moveTo(P([(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2]));
      const t = titles.get(s2.id);
      t.moveTo(P([(b.x0 + b.x1) / 2, b.y0 + 0.12 + t.height() / 2]));
      const c = new Labeled(box, t, { center: false });
      this._cluster.set(s2.id, this.children.length);
      this.add(c);
    }
    g.edges.forEach((e, i) => {
      const r = L.edges.get(i);
      if (!r) return;
      const st = { ...theme.edge, ...styleOf(e.style ?? []) };
      const from = anchor2(e.from), to = anchor2(e.to);
      const a = L.nodes.get(from), z = L.nodes.get(to);
      const na = { ...a, kind: built.get(from).kind }, nz = { ...z, kind: built.get(to).kind };
      const pts = r.points.map((p) => [...p]);
      if (!r.loop) {
        pts[0] = clip2(na, pts[1]);
        pts[pts.length - 1] = clip2(nz, pts[pts.length - 2]);
      }
      const width2 = e.stroke === "thick" ? st.strokeWidth * 2.2 : st.strokeWidth;
      const head = 0.17 + width2;
      const endsArrow = e.type === "arrow_point" || e.type === "double_arrow_point";
      const unit = (p, q) => {
        const dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1;
        return [dx / d, dy / d];
      };
      const sp = pts.map(P);
      const tipEnd = sp.at(-1), dirEnd = unit(sp.at(-2), sp.at(-1));
      const tipStart = sp[0], dirStart = unit(sp[1], sp[0]);
      if (endsArrow) sp[sp.length - 1] = [tipEnd[0] - dirEnd[0] * head * 0.8, tipEnd[1] - dirEnd[1] * head * 0.8];
      if (e.type === "double_arrow_point") sp[0] = [tipStart[0] - dirStart[0] * head * 0.8, tipStart[1] - dirStart[1] * head * 0.8];
      const pathStyle = { stroke: st.stroke, strokeWidth: width2, fill: "none" };
      let path = basisPath(sp, pathStyle);
      if (e.stroke === "dotted" || st.dashed) path = dashed(path, pathStyle);
      const parts = [path];
      if (endsArrow) parts.push(arrowHead(tipEnd, dirEnd, head, st.stroke));
      if (e.type === "double_arrow_point") parts.push(arrowHead(tipStart, dirStart, head, st.stroke));
      if (e.type === "arrow_circle") parts.push(new Circle({ radius: 0.06, fill: st.stroke, fillOpacity: 1, stroke: "none" }).moveTo([tipEnd[0] - dirEnd[0] * 0.06, tipEnd[1] - dirEnd[1] * 0.06]));
      if (e.type === "arrow_cross") {
        const c = [tipEnd[0] - dirEnd[0] * 0.08, tipEnd[1] - dirEnd[1] * 0.08], k = 0.07;
        const x = new VMobject({ stroke: st.stroke, strokeWidth: width2 * 1.3, fill: "none" });
        x.startNewPath([c[0] - k, c[1] - k]);
        x.addLineTo([c[0] + k, c[1] + k]);
        x.startNewPath([c[0] - k, c[1] + k]);
        x.addLineTo([c[0] + k, c[1] - k]);
        parts.push(x);
      }
      const lab = edgeLabels[i];
      if (lab && r.label) {
        const bg = new Rectangle({ width: lab.width() + 0.16, height: lab.height() + 0.1, cornerRadius: 0.04, fill: theme.labelBg, fillOpacity: 0.92, stroke: "none" });
        parts.push(new Labeled(bg.moveTo(P(r.label)), lab));
      }
      const grp = new Group(...parts);
      this._edge.push({ from: e.from, to: e.to, index: this.children.length });
      this.add(grp);
    });
    for (const id of nodeIds) {
      const { shape: shape2, lab } = built.get(id), n = L.nodes.get(id);
      const node = new Labeled(shape2, lab).moveTo(P([n.x, n.y]));
      this._node.set(id, this.children.length);
      this.add(node);
    }
    const s = Math.min(1, width / Math.max(this.width(), 1e-9), height / Math.max(this.height(), 1e-9));
    if (s < 1) this.scale(s);
    this.moveTo([0, 0]);
  }
  /** The node `id`: a Labeled (`.shape`, `.label`), or undefined. */
  node(id) {
    return this.children[this._node.get(id)];
  }
  /** The k-th edge from `from` to `to`: a Group [path, arrowheads..., label?]. */
  edge(from, to, k = 0) {
    const e = this._edge.filter((x) => x.from === from && x.to === to)[k];
    return e ? this.children[e.index] : void 0;
  }
  /** The subgraph `id`: a Labeled (`.shape` is the box, `.label` the title), or undefined. */
  cluster(id) {
    return this.children[this._cluster.get(id)];
  }
  get nodeIds() {
    return [...this._node.keys()];
  }
  /**
   * Draw one edge in: the line traces from its source and the arrowhead with
   * it, all parts at once (no stagger: a label's glyphs would otherwise pop in
   * one frame apart); its label fades in on top.
   */
  drawEdge(from, to, k = 0) {
    const grp = this.edge(from, to, k);
    if (!grp) return [];
    const out = [];
    for (const part of grp.children) out.push(part instanceof Labeled ? new FadeIn(part, { scale: 0.9 }) : new Create(part, { lagRatio: 0 }));
    return out;
  }
  /**
   * Animations that draw the chart in layout order: per rank, the clusters that
   * begin there, the nodes on it, and the edges arriving at it. Play the stages
   * in sequence (each is a list of animations that can run together).
   */
  reveal() {
    const g = this.graph, L = this.layout;
    const ranks = [...new Set([...L.nodes.values()].map((n) => n.rank))].sort((a, b) => a - b);
    const shownClusters = /* @__PURE__ */ new Set();
    const clusterRank = (sid) => {
      const s = g.subgraphs.find((x) => x.id === sid);
      const rs = s.nodes.flatMap((m) => L.nodes.has(m) ? [L.nodes.get(m).rank] : g.subgraphs.some((x) => x.id === m) ? [clusterRank(m)] : []);
      return rs.length ? Math.min(...rs) : Infinity;
    };
    const rankOf = (id) => L.nodes.get(id)?.rank;
    return ranks.map((r) => {
      const anims = [];
      for (const s of g.subgraphs) if (!shownClusters.has(s.id) && clusterRank(s.id) <= r && this._cluster.has(s.id)) {
        shownClusters.add(s.id);
        anims.push(new FadeIn(this.cluster(s.id)));
      }
      for (const e of this._edge) if (Math.max(rankOf(e.from) ?? -1, rankOf(e.to) ?? -1) === r) anims.push(...this.drawEdge(e.from, e.to, this._edge.filter((x) => x.from === e.from && x.to === e.to).indexOf(e)));
      for (const [id] of this._node) if (rankOf(id) === r) anims.push(new FadeIn(this.node(id), { shift: [0, -0.15] }));
      return anims;
    }).filter((a) => a.length);
  }
};
function flowchart(src, opts) {
  return new Flowchart(src, opts);
}

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/scene.ts
var StopScene = class extends Error {
};
function assertDisjoint(anims) {
  const seen = /* @__PURE__ */ new Map();
  const leaves = (a) => a instanceof AnimationGroup ? a.animations.flatMap(leaves) : [a];
  for (const a of anims.flatMap(leaves)) {
    for (const m of a.mobject.family()) {
      const other = seen.get(m);
      if (other && other !== a) {
        const name = (x) => `${x.constructor.name}(${x.mobject.constructor.name}#${x.mobject.id})`;
        throw new Error(`play(): ${name(other)} and ${name(a)} both animate ${m.constructor.name}#${m.id}; one play() can drive a mobject only once (sequence them, or combine into one Transform)`);
      }
      seen.set(m, a);
    }
  }
}
var Scene = class _Scene {
  sink;
  fps;
  skipUntil;
  mobjects;
  time;
  frameCount;
  steps;
  current;
  state;
  /**
   * skipUntil: frames that end before this time are not rendered or
   * interpolated, only counted (manim's skip_animations). Interpolation is a
   * pure function of alpha over endpoints fixed at begin(), so the state after
   * a skipped stretch is exactly the state a full run reaches. Plays with
   * active updaters are never skipped: updaters integrate over frames.
   */
  constructor(sink, { fps = 30, skipUntil = 0 } = {}) {
    this.sink = sink;
    this.fps = fps;
    this.skipUntil = skipUntil;
    this.mobjects = [];
    this.time = 0;
    this.frameCount = 0;
    this.steps = [];
    this.current = null;
    this.state = {};
  }
  /** Subclasses define the animation here. */
  async construct() {
  }
  async run() {
    try {
      await loadFonts();
      await this.sink.frame(this, 0);
      await this.construct();
      await this.endCurrentStep();
    } catch (e) {
      if (!(e instanceof StopScene)) throw e;
    }
    return this;
  }
  /**
   * Begin a named step; it lasts until the next step begins or the scene ends.
   *
   *   await this.step('push-a', { op: 'push' });
   *   await this.play(...);
   *
   * Names are stable tokens ("push-wrap"): they are what ?step= deep links,
   * traces and tests address. `meta` is free-form and travels with the trace.
   */
  async step(name, meta = {}) {
    if (typeof meta === "function") throw new TypeError("step(name, fn) is gone: call `await this.step(name)` where the step begins");
    await this.endCurrentStep();
    const s = { name, path: name, t0: this.time, frame0: this.frameCount, t1: null, frame1: null, meta };
    this.steps.push(s);
    this.current = s;
    await this.sink.stepBegin?.(this, s);
    return s;
  }
  /** Words per minute a caption is read at; a step lasts at least that long. */
  static captionWpm = 160;
  async endCurrentStep() {
    const s = this.current;
    if (!s) return;
    const caption = s.meta?.caption;
    if (typeof caption === "string") {
      const need = caption.trim().split(/\s+/).length / _Scene.captionWpm * 60;
      const left = need - (this.time - s.t0);
      if (left > 1e-9) await this.wait(left);
    }
    this.current = null;
    s.t1 = this.time;
    s.frame1 = this.frameCount;
    await this.sink.stepEnd?.(this, s);
  }
  hasUpdaters() {
    for (const top of this.mobjects) for (const m of top.family()) if (m.updaters.length) return true;
    return false;
  }
  /** The step running now, or null. */
  get currentStep() {
    return this.current;
  }
  /**
   * What the explanation is about, for traces: a snapshot of `this.state`.
   * Scenes keep their explicit state there (head, tail, tokens...) and
   * mutate it as the animation makes the same change on screen.
   * State is JSON: that is what traces serve and tests hash.
   */
  describe() {
    return JSON.parse(JSON.stringify(this.state));
  }
  // ---- mobject list ------------------------------------------------------
  familyMembers() {
    return this.mobjects.flatMap((m) => m.family());
  }
  add(...mobs) {
    this.mobjects = this.mobjects.filter((m) => !mobs.includes(m));
    this.mobjects.push(...mobs);
    return this;
  }
  /**
   * Remove mobjects from the scene. Removing a group also removes any of its
   * descendants that are on screen in their own right, so
   * `new FadeOut(new Group(a, b))` clears a and b even though the group
   * itself was never added.
   */
  remove(...mobs) {
    const gone = new Set(mobs.flatMap((m) => m.family()));
    this.mobjects = this.mobjects.filter((m) => !gone.has(m));
    for (const m of mobs) if (m.parent) m.parent.remove(m);
    return this;
  }
  replace(old, ...replacements) {
    const i = this.mobjects.indexOf(old);
    if (i < 0) {
      this.add(...replacements);
      return this;
    }
    this.mobjects.splice(i, 1, ...replacements);
    return this;
  }
  bringToFront(...mobs) {
    return this.add(...mobs);
  }
  bringToBack(...mobs) {
    this.mobjects = [...mobs, ...this.mobjects.filter((m) => !mobs.includes(m))];
    return this;
  }
  clear() {
    this.mobjects = [];
    return this;
  }
  // ---- frame loop --------------------------------------------------------
  async emitFrame(dt) {
    this.time += dt;
    perf.span("updaters", () => {
      for (const m of this.mobjects) m.update(dt);
    });
    this.frameCount++;
    const end = perf.begin("sink");
    await this.sink.frame(this, dt);
    end();
  }
  /** Play animations together; a trailing plain object is options: { runTime, rateFunc, lagRatio }. */
  async play(...args) {
    const list = [...args];
    const last = list[list.length - 1];
    const opts = last && Object.getPrototypeOf(last) === Object.prototype ? list.pop() : {};
    const anims = list.map(prepareAnimation);
    for (const a of anims) a.setOptions(opts);
    assertDisjoint(anims);
    perf.span("anim.begin", () => this.beginAnimations(anims));
    const runTime = Math.max(...anims.map((a) => a.runTime));
    const dt = 1 / this.fps;
    const n = Math.max(1, Math.round(runTime * this.fps));
    const canSkip = this.skipUntil > this.time && !this.hasUpdaters();
    let skipped = 0;
    for (let f = 1; f <= n; f++) {
      if (canSkip && this.time + dt + 1e-9 < this.skipUntil) {
        this.time += dt;
        this.frameCount++;
        skipped++;
        continue;
      }
      const t = Math.min(f * dt, runTime);
      perf.span("interpolate", () => {
        for (const a of anims) {
          const alpha = Math.min(t / a.runTime, 1);
          a.interpolate(a.rateFunc(alpha));
        }
      });
      await this.emitFrame(dt);
    }
    perf.count("frames skipped", skipped);
    perf.span("anim.finish", () => {
      for (const a of anims) {
        a.finish();
        a.cleanUpFromScene(this);
      }
    });
  }
  beginAnimations(anims) {
    const present = new Set(this.familyMembers());
    for (const a of anims) {
      a.begin();
      const mobs = a instanceof AnimationGroup ? a.mobjects : [a.mobject];
      for (const m of mobs) {
        if (m && !present.has(m)) {
          this.add(m);
          for (const f of m.family()) present.add(f);
        }
      }
    }
  }
  async wait(seconds = 1) {
    const dt = 1 / this.fps;
    const n = Math.round(seconds * this.fps);
    const canSkip = this.skipUntil > this.time && !this.hasUpdaters();
    for (let f = 0; f < n; f++) {
      if (canSkip && this.time + dt + 1e-9 < this.skipUntil) {
        this.time += dt;
        this.frameCount++;
        continue;
      }
      await this.emitFrame(dt);
    }
  }
};

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/doc.ts
var COLORS = { blue: BLUE, teal: TEAL, green: GREEN, gold: GOLD, red: RED, grey: GREY, yellow: YELLOW, white: WHITE, purple: PURPLE, orange: ORANGE };
var color = (c, d = GREY) => c == null ? d : COLORS[c] ?? c;
var DocNode = class extends Labeled {
  kind = "box";
};
function makeNode(spec) {
  const col = color(spec.color);
  let shape2, label2;
  switch (spec.kind ?? "box") {
    case "box": {
      label2 = new Text(spec.label ?? "", { fontSize: spec.fontSize ?? 0.36, color: WHITE });
      shape2 = new Rectangle({ width: spec.width ?? Math.max(2, label2.width() + 0.7), height: spec.height ?? 1, cornerRadius: 0.16, stroke: col, strokeWidth: 0.05, fill: col, fillOpacity: 0.12 });
      break;
    }
    case "state": {
      const r = spec.radius ?? 0.55;
      const fontSize = Math.min(0.26, 2 * r * 0.8 / ((spec.label ?? "").length * 0.6));
      label2 = new Text(spec.label ?? "", { fontSize, font: "mono", color: WHITE });
      shape2 = new Circle({ radius: r, stroke: col, strokeWidth: 0.05, fill: col, fillOpacity: 0.12 });
      break;
    }
    case "slot": {
      const side = spec.side ?? 0.9;
      shape2 = new Square({ side, stroke: col, strokeWidth: 0.04, fill: col, fillOpacity: 0.08 });
      label2 = new Text(spec.label ?? "", { fontSize: 0.22, font: "mono", color: GREY });
      label2.nextTo(shape2, DOWN, 0.1);
      break;
    }
    case "pointer": {
      shape2 = new Arrow([0, 0.75], [0, 0.08], { stroke: col, strokeWidth: 0.04, tipLength: 0.22 });
      label2 = new Text(spec.label ?? "", { fontSize: 0.22, font: "mono", color: col }).nextTo(shape2, UP, 0.06);
      break;
    }
    case "value": {
      label2 = new Text(spec.label ?? "", { fontSize: spec.fontSize ?? 0.32, font: "mono", color: color(spec.color, WHITE) });
      break;
    }
    case "text":
    default: {
      label2 = new Text(spec.label ?? "", { fontSize: spec.fontSize ?? 0.28, color: color(spec.color, WHITE), weight: spec.weight ?? "normal" });
    }
  }
  if (shape2 && label2 && ["box", "state"].includes(spec.kind ?? "box")) label2.moveTo(shape2);
  const g = new DocNode(shape2 ?? null, label2 ?? null, { center: false });
  g.kind = spec.kind ?? "box";
  return g;
}
var DocScene = class extends Scene {
  doc;
  nodes;
  edges;
  note;
  // Present when the doc has a title, a code block, a readout
  title;
  code;
  readout;
  constructor(sink, opts = {}) {
    super(sink, opts);
    const doc = opts.doc ?? this.constructor.doc;
    if (!doc) throw new Error("DocScene needs a doc (opts.doc or static doc)");
    this.doc = doc;
    this.nodes = {};
    this.edges = {};
    this.state = { ...this.doc.state ?? {} };
    this.note = null;
  }
  /** A node by id; ids come from the doc, so a missing one is an authoring error. */
  node(id) {
    const g = this.nodes[id];
    if (!g) throw new TypeError(`doc: no node "${id}"`);
    return g;
  }
  /** Resolve an `at` spec to a point, given a mobject to place (for nextTo). */
  resolveAt(at, mob) {
    if (Array.isArray(at)) return at;
    if (typeof at === "string") return this.node(at).shape.center();
    const target = this.node(at.of).shape;
    const dir = at.dir ?? UP, buff = at.buff ?? 0.2;
    if (mob) {
      mob.nextTo(target, dir, buff);
      return mob.center();
    }
    return add(target.boxPoint(dir), mul(dir, buff));
  }
  placeNode(g, at) {
    if (Array.isArray(at)) g.moveTo(at);
    else if (typeof at === "string") g.moveTo(this.node(at).shape);
    else {
      const target = this.node(at.of).shape;
      const anchor2 = g.kind === "pointer" ? g.shape : g;
      anchor2.nextTo(target, at.dir ?? UP, at.buff ?? 0.2);
      if (g.kind === "pointer") g.label.nextTo(g.shape, UP, 0.06);
    }
    return g;
  }
  makeEdge(spec) {
    const a = this.node(spec.from).shape, b = this.node(spec.to).shape;
    const d = normalize(sub(b.center(), a.center()));
    const buff = 0.1;
    const pa = a instanceof Circle ? add(a.center(), mul(d, a.width() / 2 + buff)) : add(a.boxPoint(snap(d)), mul(d, buff));
    const pb = b instanceof Circle ? sub(b.center(), mul(d, b.width() / 2 + buff)) : add(b.boxPoint(snap(mul(d, -1))), mul(d, -buff));
    const col = color(spec.color);
    const e = spec.curve ? new CurvedArrow(pa, pb, { angle: spec.curve, stroke: col }) : new Arrow(pa, pb, { stroke: col });
    let l = null;
    if (spec.label) {
      l = new Text(spec.label, { fontSize: 0.2, font: "mono", color: col });
      if (spec.labelAt) l.moveTo(spec.labelAt);
      else l.nextTo(e, spec.labelDir ?? UP, 0.08);
    }
    return new Labeled(e, l, { center: false });
  }
  async construct() {
    const doc = this.doc;
    await this.step("intro");
    if (doc.title) {
      this.title = new Text(doc.title, { fontSize: 0.4, weight: "bold", color: WHITE }).toEdge(UP, 0.45);
      await this.play(new Write(this.title), { runTime: 0.8 });
    }
    for (const [id, spec] of Object.entries(doc.nodes ?? {})) {
      const g = makeNode(spec);
      g.key = id;
      this.nodes[id] = g;
      this.placeNode(g, spec.at ?? [0, 0]);
    }
    const nodeAnims = Object.values(this.nodes).map((g) => new FadeIn(g, { scale: 0.8 }));
    if (nodeAnims.length) await this.play(new LaggedStart(nodeAnims, { lagRatio: 0.15 }), { runTime: 1 });
    for (const [id, spec] of Object.entries(doc.edges ?? {})) {
      const g = this.makeEdge(spec);
      g.key = id;
      this.edges[id] = g;
    }
    const edgeAnims = Object.values(this.edges).map((g) => new Create(g));
    if (edgeAnims.length) await this.play(new LaggedStart(edgeAnims, { lagRatio: 0.25 }), { runTime: 1 });
    const extras = [];
    if (doc.code) {
      this.code = new CodePanel(doc.code.lines, { fontSize: doc.code.fontSize ?? 0.24, at: doc.code.at ?? [3.5, 0] });
      extras.push(new FadeIn(this.code, { shift: [0.3, 0] }));
    }
    if (doc.readout) {
      this.readout = new StateReadout(doc.readout.keys.map((k) => [k, this.state[k]]), { fontSize: doc.readout.fontSize ?? 0.3, at: doc.readout.at ?? [-6, 0], gap: doc.readout.gap ?? 0.5 });
      extras.push(new FadeIn(this.readout, { shift: [-0.3, 0] }));
    }
    if (extras.length) await this.play(...extras, { runTime: 0.6 });
    for (const step of doc.steps ?? []) {
      await this.step(step.name, step.meta ?? {});
      for (const op of step.ops ?? []) await this.runOps(Array.isArray(op) ? op : [op], step);
    }
    await this.wait(doc.outro ?? 1.5);
  }
  /** Each op in the list is played together, then any removals are applied. */
  async runOps(ops, _step) {
    const anims = [];
    let runTime = 0.45;
    const after = [];
    for (const op of ops) {
      if ("wait" in op) {
        await this.wait(op.wait);
        continue;
      }
      if ("runTime" in op) runTime = op.runTime;
      if ("focus" in op) anims.push(op.focus == null ? this.code.unfocus() : this.code.focus(op.focus, color(op.color, YELLOW)));
      if (op.add) {
        const g = makeNode(op.add);
        g.key = op.add.id;
        this.nodes[op.add.id] = g;
        this.placeNode(g, op.add.at ?? [0, 0]);
        anims.push(new FadeIn(g, { shift: op.add.shift ?? [0, -0.2] }));
      }
      if (op.remove) {
        const id = op.remove;
        const g = this.node(id);
        anims.push(new FadeOut(g, { shift: op.shift ?? [0, 0.4] }));
        after.push(() => delete this.nodes[id]);
      }
      if (op.move) {
        const g = this.node(op.move.id);
        const target = this.placeNode(g.copy(), op.move.at);
        anims.push(new Transform2(g, target));
      }
      if (op.style) {
        const g = this.node(op.style.id), col = color(op.style.color);
        const t = g.copy();
        t.shape.setStyle({ stroke: col, fill: col });
        if (t.kind === "slot") t.shape.setStyle({ fillOpacity: op.style.fillOpacity ?? 0.3 });
        if (t.kind === "pointer") t.label.setFill(col);
        anims.push(new Transform2(g, t));
      }
      if (op.indicate) {
        const g = this.nodes[op.indicate] ?? this.edges[op.indicate];
        if (!g) throw new TypeError(`doc: no node or edge "${op.indicate}"`);
        anims.push(new Indicate(g.shape, { color: color(op.color, YELLOW), scaleFactor: op.scale ?? 1.12 }));
      }
      if (op.set) {
        for (const [k, v] of Object.entries(op.set)) {
          this.state[k] = v;
          const cur = this.readout?.values[k];
          if (cur) {
            const next2 = new Text(String(v), { fontSize: cur.fontSize, font: "mono", color: color(op.color, WHITE), anchor: "start" }).moveTo(cur, [-1, 0]);
            anims.push(new Transform2(cur, next2));
          }
        }
      }
      if (op.note != null) {
        if (this.note) anims.push(new FadeOut(this.note));
        if (op.note) {
          const n = new Text(op.note, { fontSize: 0.28, color: color(op.color, GREY) }).moveTo(op.at ?? this.doc.noteAt ?? [0, -3.4]);
          this.note = n;
          anims.push(new FadeIn(n, { shift: [0, -0.2] }));
        } else this.note = null;
      }
    }
    if (anims.length) await this.play(...anims, { runTime });
    for (const f of after) f();
  }
};
function snap(d) {
  return Math.abs(d[0]) >= Math.abs(d[1]) ? [Math.sign(d[0]), 0] : [0, Math.sign(d[1])];
}
function sceneFromDoc(doc) {
  return class extends DocScene {
    static doc = doc;
  };
}

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/svg.ts
var FRAME = { w: 16, h: 9 };
var UNITS = 1e3;
var VIEWBOX = `${-FRAME.w / 2 * UNITS} ${-FRAME.h / 2 * UNITS} ${FRAME.w * UNITS} ${FRAME.h * UNITS}`;
var len = (x) => "" + Math.round(x * UNITS);
var fmt = (x) => (Math.round(x * 1e3) / 1e3).toString();
function renderElements(scene, { relative = true } = {}) {
  return perf.span("render.elements", () => renderElementsImpl(scene, relative));
}
function renderElementsImpl(scene, relative) {
  const out = [];
  const walk = (m) => {
    if (!relative && m.mergeLeaves) {
      const merged = mergedRecord(m);
      if (merged !== void 0) {
        if (merged) out.push(merged);
        return;
      }
    }
    const rec = elementFor(m, relative);
    if (rec) out.push(rec);
    for (const c of m.children) walk(c);
  };
  for (const top of scene.mobjects) walk(top);
  return out;
}
function elementFor(m, relative) {
  const s = m.style;
  if (s.opacity <= 0) return null;
  if (m instanceof VMobject) {
    if (!m.hasPoints()) return null;
    const pd = m.pathData(relative);
    let k = m._rec;
    if (!(k && k.id === m.id && k.d === pd.d && k.fill === s.fill && k.fillOpacity === s.fillOpacity && k.stroke === s.stroke && k.strokeWidth === s.strokeWidth && k.strokeOpacity === s.strokeOpacity && k.opacity === s.opacity && k.drawFraction === s.drawFraction)) {
      perf.count("attrs miss");
      k = m._rec = { id: m.id, d: pd.d, fill: s.fill, fillOpacity: s.fillOpacity, stroke: s.stroke, strokeWidth: s.strokeWidth, strokeOpacity: s.strokeOpacity, opacity: s.opacity, drawFraction: s.drawFraction, attrs: vmobjectAttrs(m, s, pd), rec: null };
    }
    if (k.rec && k.rec.tx === pd.tx && k.rec.ty === pd.ty) {
      perf.count("element hit");
      return k.rec;
    }
    perf.count("element moved");
    return k.rec = { id: m.id, tag: "path", attrs: k.attrs, transform: pd.tx || pd.ty ? "translate(" + pd.tx + " " + pd.ty + ")" : null, tx: pd.tx, ty: pd.ty, text: null };
  }
  return null;
}
function mergedRecord(g) {
  const kids = g.children;
  let s0 = null;
  for (const c of kids) {
    if (!(c instanceof VMobject) || c.children.length) return void 0;
    const s = c.style;
    if (s.drawFraction != null) return void 0;
    if (!s0) {
      s0 = s;
      continue;
    }
    if (s.fill !== s0.fill || s.fillOpacity !== s0.fillOpacity || s.stroke !== s0.stroke || s.strokeWidth !== s0.strokeWidth || s.strokeOpacity !== s0.strokeOpacity || s.opacity !== s0.opacity) return void 0;
  }
  if (!s0 || s0.opacity <= 0) return null;
  const pds = kids.map((c) => c.hasPoints() ? c.pathData(false) : null);
  const k = g._mrec;
  if (k && k.id === g.id && k.pds.length === pds.length && k.pds.every((p, i) => p === pds[i]) && k.fill === s0.fill && k.fillOpacity === s0.fillOpacity && k.stroke === s0.stroke && k.strokeWidth === s0.strokeWidth && k.strokeOpacity === s0.strokeOpacity && k.opacity === s0.opacity) {
    perf.count("merged hit");
    return k.rec;
  }
  perf.count("merged miss");
  const d = pds.map((p) => p ? p.d : "").join("");
  const rec = { id: g.id, tag: "path", attrs: vmobjectAttrs(kids[0], s0, { d }), transform: null, text: null };
  g._mrec = { id: g.id, pds, fill: s0.fill, fillOpacity: s0.fillOpacity, stroke: s0.stroke, strokeWidth: s0.strokeWidth, strokeOpacity: s0.strokeOpacity, opacity: s0.opacity, rec };
  return rec;
}
function vmobjectAttrs(m, s, pd) {
  {
    const attrs = {
      d: pd.d,
      fill: s.fill,
      "fill-opacity": fmt(s.fillOpacity),
      stroke: s.stroke,
      "stroke-width": len(s.strokeWidth),
      "stroke-opacity": fmt(s.strokeOpacity),
      "stroke-linejoin": "round",
      "stroke-linecap": "round"
    };
    if (s.opacity < 1) attrs.opacity = fmt(s.opacity);
    if (s.drawFraction != null && s.drawFraction < 1) {
      const L = perf.span("arcLength", () => m.arcLength()) + 1e-3;
      attrs["stroke-dasharray"] = len(L);
      attrs["stroke-dashoffset"] = len(L * (1 - s.drawFraction));
    }
    return attrs;
  }
}
var ESC = /[&<>"]/;
var esc = (v) => {
  const str = String(v);
  return ESC.test(str) ? str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") : str;
};
var attrStrings = /* @__PURE__ */ new WeakMap();
function serializeAttrs(attrs) {
  let s = attrStrings.get(attrs);
  if (s === void 0) {
    s = "";
    for (const k in attrs) s += ` ${k}="${esc(attrs[k])}"`;
    attrStrings.set(attrs, s);
  }
  return s;
}
function serializeElement(el) {
  const t = el.transform ? ` transform="${el.transform}"` : "";
  return `<${el.tag}${t}${serializeAttrs(el.attrs)}` + (el.text == null ? "/>" : `>${esc(el.text)}</${el.tag}>`);
}
function toSvgString(scene, { width = 1280, background = "#1a1a1a" } = {}) {
  const height = Math.round(width * FRAME.h / FRAME.w);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${VIEWBOX}">`;
  s += `<rect x="${-FRAME.w / 2 * UNITS}" y="${-FRAME.h / 2 * UNITS}" width="${FRAME.w * UNITS}" height="${FRAME.h * UNITS}" fill="${background}"/>`;
  const els = renderElements(scene);
  const end = perf.begin("render.serialize");
  const parts = [s];
  for (const el of els) parts.push(el.svg ??= serializeElement(el));
  parts.push("</svg>");
  end();
  return parts.join("");
}
var StringSink = class {
  opts;
  frames;
  constructor(opts = {}) {
    this.opts = opts;
    this.frames = [];
  }
  async frame(scene) {
    this.frames.push(toSvgString(scene, this.opts));
  }
  last() {
    return this.frames[this.frames.length - 1];
  }
};
var SnapshotSink = class {
  opts;
  svg;
  constructor(opts = {}) {
    this.opts = opts;
    this.svg = "";
  }
  async frame(scene) {
    this.svg = toSvgString(scene, this.opts);
  }
};
var logs = globalThis;
var DomSink = class {
  doc;
  svg;
  NS;
  nodes;
  realtime;
  anchor;
  lastPatch;
  dropped;
  maxFreezeMs;
  constructor(container, { background = "#1a1a1a", realtime = true } = {}) {
    const NS = "http://www.w3.org/2000/svg";
    this.doc = container.ownerDocument;
    this.svg = this.doc.createElementNS(NS, "svg");
    this.svg.setAttribute("viewBox", VIEWBOX);
    this.svg.style.background = background;
    this.svg.style.width = "100%";
    this.svg.style.display = "block";
    container.appendChild(this.svg);
    this.NS = NS;
    this.nodes = /* @__PURE__ */ new Map();
    this.realtime = realtime;
    this.anchor = null;
    this.lastPatch = 0;
    this.dropped = 0;
    this.maxFreezeMs = 100;
  }
  /**
   * Real-time pacing, driven by requestAnimationFrame against a wall-clock
   * schedule (scene time t is due at anchor + t). Each frame is patched in the
   * animation frame it's due in, so frames land on vsync; when the scene falls
   * more than a frame behind, that frame's DOM patch is dropped instead of
   * slowing playback, but never for longer than maxFreezeMs. A stall longer
   * than 250ms (a pause, a hidden tab) re-anchors the schedule.
   */
  async frame(scene, dt = 0) {
    if (!this.realtime || dt === 0) {
      this.anchor = null;
      this.patch(scene, performance.now());
      return;
    }
    const now2 = performance.now();
    if (this.anchor != null && now2 - (this.anchor + scene.time * 1e3) > 250) this.anchor = null;
    if (this.anchor != null && now2 > this.anchor + scene.time * 1e3 + dt * 1e3 && now2 - this.lastPatch < this.maxFreezeMs) {
      this.dropped++;
      perf.count("frames dropped");
      return;
    }
    for (; ; ) {
      const vsync = await nextAnimationFrame();
      if (this.anchor == null) this.anchor = vsync - scene.time * 1e3;
      if (vsync >= this.anchor + scene.time * 1e3 - 8) {
        this.patch(scene, vsync);
        return;
      }
    }
  }
  patch(scene, presentAt) {
    this.apply(renderElements(scene, { relative: false }), presentAt, scene.time);
  }
  /** Bring the DOM to exactly these records (one frame). */
  apply(els, presentAt, t) {
    this.lastPatch = performance.now();
    let muts = 0, dMuts = 0;
    const end = perf.begin("dom.patch");
    const seen = /* @__PURE__ */ new Set();
    let cursor2 = this.svg.firstChild;
    for (const rec of els) {
      seen.add(rec.id);
      let node = this.nodes.get(rec.id);
      if (!node || node.el.tagName !== rec.tag) {
        if (node) node.el.remove();
        const el = this.doc.createElementNS(this.NS, rec.tag);
        node = { el, attrs: {}, text: null, rec: null };
        this.nodes.set(rec.id, node);
      }
      if (node.rec === rec) {
        if (node.el !== cursor2) this.svg.insertBefore(node.el, cursor2);
        else cursor2 = cursor2.nextSibling;
        continue;
      }
      node.rec = rec;
      if (rec.transform !== node.transform) {
        if (rec.transform) node.el.setAttribute("transform", rec.transform);
        else node.el.removeAttribute("transform");
        muts++;
        node.transform = rec.transform;
      }
      if (node.attrsRef === rec.attrs) {
        if (node.el !== cursor2) this.svg.insertBefore(node.el, cursor2);
        else cursor2 = cursor2.nextSibling;
        continue;
      }
      node.attrsRef = rec.attrs;
      for (const k in rec.attrs) {
        const v = rec.attrs[k];
        if (node.attrs[k] !== v) {
          node.el.setAttribute(k, v);
          node.attrs[k] = v;
          muts++;
          if (k === "d") dMuts++;
        }
      }
      for (const k in node.attrs) {
        if (!(k in rec.attrs)) {
          node.el.removeAttribute(k);
          delete node.attrs[k];
        }
      }
      if (rec.text !== node.text) {
        node.el.textContent = rec.text ?? "";
        node.text = rec.text;
      }
      if (node.el !== cursor2) this.svg.insertBefore(node.el, cursor2);
      else cursor2 = cursor2.nextSibling;
    }
    for (const [id, node] of this.nodes) {
      if (!seen.has(id)) {
        node.el.remove();
        this.nodes.delete(id);
      }
    }
    end();
    logs.__frameLog?.push(presentAt, t);
    logs.__mutLog?.push(muts, dMuts, -1);
  }
};
var nextAnimationFrame = () => new Promise((res) => requestAnimationFrame(res));

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/ascii.ts
function renderText(scene, { cols = 96, rows = 27 } = {}) {
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(" "));
  const sx = cols / FRAME.w, sy = rows / FRAME.h;
  const X = (x) => Math.round((x + FRAME.w / 2) * sx);
  const Y = (y) => Math.round((FRAME.h / 2 - y) * sy);
  const put = (c, r, ch) => {
    if (r >= 0 && r < rows && c >= 0 && c < cols) grid[r][c] = ch;
  };
  const visible = (m) => m.style.opacity > 0.05;
  const box = (m, round2) => {
    const [x0, y0, x1, y1] = m.box();
    const c0 = X(x0), c1 = Math.max(X(x1), c0 + 1), r0 = Y(y1), r1 = Math.max(Y(y0), r0 + 1);
    if (r1 - r0 < 2) {
      for (let c = c0; c <= c1; c++) put(c, r0, "\u2500");
      return;
    }
    const [tl, tr, bl, br] = round2 ? ["\u256D", "\u256E", "\u2570", "\u256F"] : ["\u250C", "\u2510", "\u2514", "\u2518"];
    for (let c = c0 + 1; c < c1; c++) {
      put(c, r0, "\u2500");
      put(c, r1, "\u2500");
    }
    for (let r = r0 + 1; r < r1; r++) {
      put(c0, r, "\u2502");
      put(c1, r, "\u2502");
    }
    put(c0, r0, tl);
    put(c1, r0, tr);
    put(c0, r1, bl);
    put(c1, r1, br);
  };
  const line2 = (a, b, head) => {
    const c0 = X(a[0]), r0 = Y(a[1]), c1 = X(b[0]), r1 = Y(b[1]);
    const n = Math.max(Math.abs(c1 - c0), Math.abs(r1 - r0), 1);
    const dc = c1 - c0, dr = r1 - r0;
    const ch = Math.abs(dc) > 2 * Math.abs(dr) ? "\u2500" : Math.abs(dr) > 2 * Math.abs(dc) ? "\u2502" : dc > 0 === dr > 0 ? "\u2572" : "\u2571";
    for (let i = 0; i <= n; i++) put(Math.round(c0 + dc * i / n), Math.round(r0 + dr * i / n), ch);
    if (head) put(c1, r1, Math.abs(dc) >= Math.abs(dr) ? dc > 0 ? "\u25B6" : "\u25C0" : dr > 0 ? "\u25BC" : "\u25B2");
  };
  const later = [];
  const draw = (m, pass = 0) => {
    if (!visible(m)) return;
    if (pass === 0 && (m instanceof Arrow || m instanceof CurvedArrow || m instanceof Text || m instanceof Dot)) {
      later.push(m);
      return;
    }
    if (m instanceof Arrow) {
      line2(m.line.start(), m.tip.subpaths[0].slice(0, 2), true);
      return;
    }
    if (m instanceof CurvedArrow) {
      const a = m.arc, n = a.numCurves(0);
      let prev2 = a.pointOnCurve(0, 0, 0);
      for (let c = 0; c < n; c++) for (let s = 1; s <= 4; s++) {
        const p = a.pointOnCurve(0, c, s / 4);
        line2(prev2, p, false);
        prev2 = p;
      }
      line2(prev2, m.tip.subpaths[0].slice(0, 2), true);
      return;
    }
    if (m instanceof Text) {
      if (!m.text) return;
      const c = m.anchor === "start" ? X(m.left()[0]) : m.anchor === "end" ? X(m.right()[0]) - m.text.length : X(m.center()[0]) - Math.floor(m.text.length / 2);
      const r = Y(m.center()[1]);
      for (let i = 0; i < m.text.length; i++) put(c + i, r, m.text[i]);
      return;
    }
    if (m instanceof VMobject && m.hasPoints()) {
      const s = m.style;
      if (m instanceof Dot) {
        put(X(m.center()[0]), Y(m.center()[1]), "\u25CF");
        return;
      }
      if (s.stroke === "none" && s.fill !== "none") {
        const [x0, y0, x1, y1] = m.box();
        if (x1 - x0 > 2 * (y1 - y0)) {
          for (let r = Y(y1); r <= Y(y0); r++) put(X(x0), r, "\u258C");
          return;
        }
      }
      box(m, m instanceof Circle);
      return;
    }
    for (const ch of m.children) draw(ch);
  };
  for (const top of scene.mobjects) draw(top, 0);
  const order = (m) => m instanceof Text ? 2 : m instanceof Dot ? 3 : 1;
  for (const m of later.sort((a, b) => order(a) - order(b))) draw(m, 1);
  return grid.map((r) => r.join("").replace(/\s+$/, "")).join("\n");
}

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/timeline.ts
var NullSink = class {
  async frame() {
  }
};
var SeekSink = class {
  target;
  t;
  stopAfterFirst;
  forwarded;
  constructor(target, t, { stopAfterFirst = false } = {}) {
    this.target = target;
    this.t = t;
    this.stopAfterFirst = stopAfterFirst;
    this.forwarded = 0;
  }
  async frame(scene, dt) {
    if (scene.time + 1e-9 < this.t) return;
    await this.target.frame(scene, this.forwarded === 0 ? 0 : dt);
    this.forwarded++;
    if (this.stopAfterFirst) throw new StopScene();
  }
  async stepBegin(scene, s) {
    if (scene.time + 1e-9 >= this.t) await this.target.stepBegin?.(scene, s);
  }
  async stepEnd(scene, s) {
    if (scene.time + 1e-9 >= this.t) await this.target.stepEnd?.(scene, s);
  }
};
async function indexScene(SceneClass, opts = {}) {
  const scene = new SceneClass(new NullSink(), { skipUntil: Infinity, ...opts });
  await scene.run();
  return {
    fps: scene.fps,
    duration: scene.time,
    frames: scene.frameCount,
    steps: scene.steps.map(({ name, path, t0, t1, frame0, frame1, meta }) => ({ name, path, t0, t1, frame0, frame1, meta }))
  };
}
function stepTime(index, name) {
  const s = index.steps.find((x) => x.name === name || x.path === name);
  return s ? s.t0 : null;
}
async function renderAt(SceneClass, t, sink, opts = {}) {
  const seek = new SeekSink(sink, t, { stopAfterFirst: true });
  const scene = new SceneClass(seek, { skipUntil: t, ...opts });
  await scene.run();
  if (seek.forwarded === 0) await sink.frame(scene, 0);
  return scene;
}

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/trace.ts
var TraceSink = class {
  events;
  constructor() {
    this.events = [];
  }
  async frame() {
  }
  async stepBegin(scene, s) {
    this.events.push({ step: s.path, phase: "begin", t: round(scene.time), frame: scene.frameCount, meta: s.meta, state: scene.describe() });
  }
  async stepEnd(scene, s) {
    this.events.push({ step: s.path, phase: "end", t: round(scene.time), frame: scene.frameCount, state: scene.describe() });
  }
  /** Compact form: one entry per step with begin/end state. */
  steps() {
    const out = [];
    for (const e of this.events) {
      if (e.phase === "begin") out.push({ step: e.step, t0: e.t, frame0: e.frame, meta: e.meta, before: e.state });
      else {
        const s = out.findLast((x) => x.step === e.step && x.t1 == null);
        if (s) {
          s.t1 = e.t;
          s.frame1 = e.frame;
          s.after = e.state;
        }
      }
    }
    return out;
  }
};
var round = (x) => Math.round(x * 1e3) / 1e3;
async function traceScene(SceneClass, opts = {}) {
  const sink = new TraceSink();
  const scene = new SceneClass(sink, { skipUntil: Infinity, ...opts });
  await scene.run();
  return { fps: scene.fps, duration: round(scene.time), frames: scene.frameCount, steps: sink.steps() };
}

// ../../../../private/var/folders/jt/w8qbfc210g10mftw_9p0xbj40000gn/T/tmp.EXmsAvzwVy/src/verify.ts
var DEFAULTS2 = {
  minJump: 0.2,
  // scene units (frame is 16 wide, so ~1.25% of width, ~16px at 1280)
  spikeRatio: 3,
  // displacement must exceed this multiple of both neighbors' displacement
  minResize: 0.25,
  // relative size change in one frame
  popAlpha: 0.5,
  // alpha change in one frame
  cutAlpha: 0.5,
  // appearing/vanishing above this alpha is a cut
  flickerFrames: 3,
  handoffIoU: 0.6
};
function alphaOf(m) {
  const s = m.style;
  const f = s.fill !== "none" ? s.fillOpacity : 0;
  const k = s.stroke !== "none" ? s.strokeOpacity : 0;
  return (s.opacity ?? 1) * Math.max(f, k) * (s.drawFraction ?? 1);
}
var textOf = (m) => m.text;
function describeLeaf(m) {
  let p = m;
  while (p && textOf(p) == null && p.parent) {
    p = p.parent;
  }
  const text = textOf(p);
  const label2 = text != null ? `"${text.length > 28 ? text.slice(0, 27) + "\u2026" : text}"` : "";
  return `${m.constructor.name}#${m.id}${label2 ? " in " + p.constructor.name + " " + label2 : ""}`;
}
var MotionSink = class {
  frames;
  labels;
  constructor() {
    this.frames = [];
    this.labels = /* @__PURE__ */ new Map();
  }
  async frame(scene) {
    const f = /* @__PURE__ */ new Map();
    const walk = (m) => {
      const unit = m.mergeLeaves && m.children.length > 0;
      const drawn = unit || m instanceof VMobject && m.hasPoints();
      if (drawn) {
        const a = unit ? Math.max(...m.children.map(alphaOf)) : alphaOf(m);
        if (a > 0.02) {
          const b = m.box();
          if (b) {
            f.set(m.id, { cx: (b[0] + b[2]) / 2, cy: (b[1] + b[3]) / 2, w: b[2] - b[0], h: b[3] - b[1], a, box: b });
            if (!this.labels.has(m.id)) this.labels.set(m.id, describeLeaf(m));
          }
        }
      }
      if (!unit) for (const c of m.children) walk(c);
    };
    for (const top of scene.mobjects) walk(top);
    this.frames.push({ t: scene.time, step: scene.currentStep?.path ?? null, leaves: f });
  }
};
var PAD = 0.05;
var iou = (a0, b0) => {
  const a = [a0[0] - PAD, a0[1] - PAD, a0[2] + PAD, a0[3] + PAD], b = [b0[0] - PAD, b0[1] - PAD, b0[2] + PAD, b0[3] + PAD];
  const ix = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0]));
  const iy = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
  const inter = ix * iy, area = (r) => Math.max(1e-9, (r[2] - r[0]) * (r[3] - r[1]));
  return inter / (area(a) + area(b) - inter);
};
function analyzeMotion(sink, opts = {}) {
  const o = { ...DEFAULTS2, ...opts };
  const F = sink.frames;
  const events = [];
  const ev = (kind, f, id, magnitude, detail = "") => events.push({ kind, frame: f, t: +F[f].t.toFixed(3), step: F[f].step, what: sink.labels.get(id) ?? `#${id}`, magnitude: +magnitude.toFixed(3), detail });
  const disp = (f, id) => {
    const a = F[f - 1]?.leaves.get(id), b = F[f]?.leaves.get(id);
    return a && b ? Math.hypot(b.cx - a.cx, b.cy - a.cy) : 0;
  };
  const dsize = (f, id) => {
    const a = F[f - 1]?.leaves.get(id), b = F[f]?.leaves.get(id);
    if (!a || !b) return 0;
    const rel = (x, y) => Math.max(x, y) < 0.05 ? 0 : Math.abs(y - x) / Math.max(x, y);
    return Math.max(rel(a.w, b.w), rel(a.h, b.h));
  };
  const dalpha = (f, id) => {
    const a = F[f - 1]?.leaves.get(id), b = F[f]?.leaves.get(id);
    return a && b ? Math.abs(b.a - a.a) : 0;
  };
  for (let f = 1; f < F.length; f++) {
    const prev2 = F[f - 1].leaves, cur = F[f].leaves;
    const cutIns = [], cutOuts = [];
    for (const [id, s] of cur) {
      const p = prev2.get(id);
      if (!p) {
        if (s.a >= o.cutAlpha) cutIns.push([id, s]);
        continue;
      }
      const d = disp(f, id);
      if (d > o.minJump && d > o.spikeRatio * Math.max(disp(f - 1, id), disp(f + 1, id))) ev("teleport", f, id, d, `moved ${d.toFixed(2)} in one frame`);
      const z = dsize(f, id);
      if (z > o.minResize && z > o.spikeRatio * Math.max(dsize(f - 1, id), dsize(f + 1, id))) ev("resize", f, id, z, `size changed ${(100 * z).toFixed(0)}% in one frame`);
      const da = dalpha(f, id);
      if (da >= o.popAlpha) ev("pop", f, id, da, `alpha ${p.a.toFixed(2)} \u2192 ${s.a.toFixed(2)}`);
    }
    for (const [id, p] of prev2) if (!cur.has(id) && p.a >= o.cutAlpha) cutOuts.push([id, p]);
    const usedIn = /* @__PURE__ */ new Set();
    for (const [oid, op] of cutOuts) {
      let best = null, bestScore = 0;
      for (const [iid, ip] of cutIns) {
        if (usedIn.has(iid)) continue;
        const score = iou(op.box, ip.box);
        if (score > bestScore) {
          best = [iid, ip];
          bestScore = score;
        }
      }
      if (best && bestScore >= o.handoffIoU) {
        usedIn.add(best[0]);
        continue;
      }
      if (best && bestScore > 0) {
        usedIn.add(best[0]);
        const d = Math.hypot(best[1].cx - op.cx, best[1].cy - op.cy);
        ev("handoff", f, best[0], d, `replaced ${sink.labels.get(oid)} with box overlap ${(100 * bestScore).toFixed(0)}%`);
        continue;
      }
      let back = 0;
      for (let k = f + 1; k < Math.min(F.length, f + 1 + o.flickerFrames); k++) if (F[k].leaves.has(oid)) {
        back = k;
        break;
      }
      if (back) ev("flicker", f, oid, back - f, `hidden for ${back - f} frame(s)`);
      else ev("cut-out", f, oid, op.a, `vanished at alpha ${op.a.toFixed(2)}`);
    }
    for (const [iid, ip] of cutIns) if (!usedIn.has(iid)) {
      if (f > 1) ev("cut-in", f, iid, ip.a, `appeared at alpha ${ip.a.toFixed(2)}`);
    }
  }
  return events;
}
function summarizeMotion(events) {
  const groups = /* @__PURE__ */ new Map();
  for (const e of events) {
    const k = `${e.kind}|${e.step}|${e.frame}`;
    const g = groups.get(k) ?? { kind: e.kind, step: e.step, frame: e.frame, t: e.t, count: 0, max: 0, examples: [] };
    g.count++;
    g.max = Math.max(g.max, e.magnitude);
    if (g.examples.length < 2) g.examples.push(`${e.what}: ${e.detail}`);
    groups.set(k, g);
  }
  return [...groups.values()].sort((a, b) => a.frame - b.frame);
}
export {
  Animation,
  AnimationGroup,
  Arc,
  ArcBetweenPoints,
  Arrow,
  BLACK,
  BLUE,
  BLUE_D,
  Circle,
  Code,
  CodePanel,
  Create,
  CurvedArrow,
  DL,
  DOWN,
  DR,
  DecimalNumber,
  DocScene,
  DomSink,
  Dot,
  FLOWCHART_THEME,
  FadeIn,
  FadeOut,
  Flash,
  Flowchart,
  GOLD,
  GREEN,
  GREY,
  GREY_D,
  Group,
  Indicate,
  LEFT,
  Labeled,
  LaggedStart,
  Line,
  MAROON,
  Mobject,
  MotionSink,
  MoveAlongPath,
  NullSink,
  ORANGE,
  ORIGIN,
  PURPLE,
  Polygon,
  RED,
  RIGHT,
  Rectangle,
  Scene,
  SeekSink,
  SnapshotSink,
  Square,
  StateReadout,
  StringSink,
  TEAL,
  Text,
  TraceSink,
  Transform2 as Transform,
  UL,
  UP,
  UR,
  VMobject,
  WHITE,
  Write,
  YELLOW,
  add,
  analyzeMotion,
  angleOf,
  dot,
  easeInQuad,
  easeOutBack,
  easeOutQuad,
  flowchart,
  indexScene,
  layoutGraph,
  lerp,
  linear,
  loadFonts,
  mul,
  norm,
  normalize,
  parseMermaid,
  perf,
  renderAt,
  renderElements,
  renderText,
  rotate,
  rushFrom,
  rushInto,
  sceneFromDoc,
  smooth,
  stepTime,
  sub,
  summarizeMotion,
  thereAndBack,
  title,
  toSvgString,
  traceScene,
  wiggle
};
