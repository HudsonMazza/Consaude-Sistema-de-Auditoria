/* @ds-bundle: {"format":4,"namespace":"ConSaude","components":[{"name":"AppShell"},{"name":"Sidebar"},{"name":"Topbar"},{"name":"BottomNav"},{"name":"PageHeader"},{"name":"Tabs"},{"name":"Button"},{"name":"IconButton"},{"name":"ActionMenu"},{"name":"FilterChips"},{"name":"SegmentedControl"},{"name":"TextField"},{"name":"SearchField"},{"name":"Select"},{"name":"HeroKpi"},{"name":"KpiCard"},{"name":"StatStrip"},{"name":"SegmentedMeter"},{"name":"ProgressBar"},{"name":"Card"},{"name":"DataTable"},{"name":"Badge"},{"name":"StatusBadge"},{"name":"DirectionTag"},{"name":"Avatar"},{"name":"RankingList"},{"name":"BarChart"},{"name":"DonutChart"},{"name":"Dropzone"},{"name":"Accordion"},{"name":"Drawer"},{"name":"BottomSheet"},{"name":"Modal"},{"name":"AiProgressModal"},{"name":"ConfirmDialog"},{"name":"Toast"},{"name":"Callout"},{"name":"EmptyState"},{"name":"Icon"}]} */
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // core.jsx
  var core_exports = {};
  __export(core_exports, {
    Avatar: () => Avatar,
    Badge: () => Badge,
    Button: () => Button,
    Count: () => Count,
    DiffValue: () => DiffValue,
    DirectionTag: () => DirectionTag,
    ICON_NAMES: () => ICON_NAMES,
    Icon: () => Icon,
    IconButton: () => IconButton,
    Kbd: () => Kbd,
    Portal: () => Portal,
    PortalProvider: () => PortalProvider,
    ProfileBadge: () => ProfileBadge,
    ResultBadge: () => ResultBadge,
    STATUS_FLOW: () => STATUS_FLOW,
    Spinner: () => Spinner,
    StatusBadge: () => StatusBadge,
    ViewportProvider: () => ViewportProvider,
    bucketFor: () => bucketFor,
    cx: () => cx,
    formatBRL: () => formatBRL,
    formatNumber: () => formatNumber,
    formatPercent: () => formatPercent,
    initials: () => initials,
    titleCase: () => titleCase,
    useCallback: () => useCallback,
    useElementWidth: () => useElementWidth,
    useIsoLayoutEffect: () => useIsoLayoutEffect,
    usePortalTarget: () => usePortalTarget,
    useViewport: () => useViewport
  });

  // icons.js
  var ICONS = {
    "layout-dashboard": '<rect width="7" height="9" x="3" y="3" rx="1"/> <rect width="7" height="5" x="14" y="3" rx="1"/> <rect width="7" height="9" x="14" y="12" rx="1"/> <rect width="7" height="5" x="3" y="16" rx="1"/>',
    "clipboard-check": '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/> <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/> <path d="m9 14 2 2 4-4"/>',
    "file-search": '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/> <path d="M14 2v5a1 1 0 0 0 1 1h5"/> <circle cx="11.5" cy="14.5" r="2.5"/> <path d="M13.3 16.3 15 18"/>',
    "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/> <path d="M16 3.128a4 4 0 0 1 0 7.744"/> <path d="M22 21v-2a4 4 0 0 0-3-3.87"/> <circle cx="9" cy="7" r="4"/>',
    "settings": '<path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/> <circle cx="12" cy="12" r="3"/>',
    "panel-left-close": '<rect width="18" height="18" x="3" y="3" rx="2"/> <path d="M9 3v18"/> <path d="m16 15-3-3 3-3"/>',
    "panel-left-open": '<rect width="18" height="18" x="3" y="3" rx="2"/> <path d="M9 3v18"/> <path d="m14 9 3 3-3 3"/>',
    "menu": '<path d="M4 5h16"/> <path d="M4 12h16"/> <path d="M4 19h16"/>',
    "sun": '<circle cx="12" cy="12" r="4"/> <path d="M12 2v2"/> <path d="M12 20v2"/> <path d="m4.93 4.93 1.41 1.41"/> <path d="m17.66 17.66 1.41 1.41"/> <path d="M2 12h2"/> <path d="M20 12h2"/> <path d="m6.34 17.66-1.41 1.41"/> <path d="m19.07 4.93-1.41 1.41"/>',
    "moon": '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>',
    "chevron-down": '<path d="m6 9 6 6 6-6"/>',
    "chevron-right": '<path d="m9 18 6-6-6-6"/>',
    "chevron-left": '<path d="m15 18-6-6 6-6"/>',
    "chevron-up": '<path d="m18 15-6-6-6 6"/>',
    "plus": '<path d="M5 12h14"/> <path d="M12 5v14"/>',
    "search": '<path d="m21 21-4.34-4.34"/> <circle cx="11" cy="11" r="8"/>',
    "x": '<path d="M18 6 6 18"/> <path d="m6 6 12 12"/>',
    "sparkles": '<path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/> <path d="M20 2v4"/> <path d="M22 4h-4"/> <circle cx="4" cy="20" r="2"/>',
    "file-spreadsheet": '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/> <path d="M14 2v5a1 1 0 0 0 1 1h5"/> <path d="M8 13h2"/> <path d="M14 13h2"/> <path d="M8 17h2"/> <path d="M14 17h2"/>',
    "file-text": '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/> <path d="M14 2v5a1 1 0 0 0 1 1h5"/> <path d="M10 9H8"/> <path d="M16 13H8"/> <path d="M16 17H8"/>',
    "download": '<path d="M12 15V3"/> <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/> <path d="m7 10 5 5 5-5"/>',
    "copy": '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/> <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    "trash-2": '<path d="M10 11v6"/> <path d="M14 11v6"/> <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/> <path d="M3 6h18"/> <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    "ellipsis": '<circle cx="12" cy="12" r="1"/> <circle cx="19" cy="12" r="1"/> <circle cx="5" cy="12" r="1"/>',
    "ellipsis-vertical": '<circle cx="12" cy="12" r="1"/> <circle cx="12" cy="5" r="1"/> <circle cx="12" cy="19" r="1"/>',
    "eye": '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/> <circle cx="12" cy="12" r="3"/>',
    "arrow-up-right": '<path d="M7 7h10v10"/> <path d="M7 17 17 7"/>',
    "arrow-down-left": '<path d="M17 7 7 17"/> <path d="M17 17H7V7"/>',
    "arrow-right": '<path d="M5 12h14"/> <path d="m12 5 7 7-7 7"/>',
    "arrow-left": '<path d="m12 19-7-7 7-7"/> <path d="M19 12H5"/>',
    "check": '<path d="M20 6 9 17l-5-5"/>',
    "circle-check": '<circle cx="12" cy="12" r="10"/> <path d="m16 9-5.5 5.5L8 12"/>',
    "clock": '<circle cx="12" cy="12" r="10"/> <path d="M12 6v6l4 2"/>',
    "triangle-alert": '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/> <path d="M12 9v4"/> <path d="M12 17h.01"/>',
    "circle-alert": '<circle cx="12" cy="12" r="10"/> <line x1="12" x2="12" y1="8" y2="12"/> <line x1="12" x2="12.01" y1="16" y2="16"/>',
    "info": '<circle cx="12" cy="12" r="10"/> <path d="M12 16v-4"/> <path d="M12 8h.01"/>',
    "cloud-upload": '<path d="M12 13v8"/> <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/> <path d="m8 17 4-4 4 4"/>',
    "file": '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/> <path d="M14 2v5a1 1 0 0 0 1 1h5"/>',
    "file-check": '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/> <path d="M14 2v5a1 1 0 0 0 1 1h5"/> <path d="m9 15 2 2 4-4"/>',
    "refresh-cw": '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/> <path d="M21 3v5h-5"/> <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/> <path d="M8 16H3v5"/>',
    "list-filter": '<path d="M2 5h20"/> <path d="M6 12h12"/> <path d="M9 19h6"/>',
    "arrow-up-down": '<path d="m21 16-4 4-4-4"/> <path d="M17 20V4"/> <path d="m3 8 4-4 4 4"/> <path d="M7 4v16"/>',
    "arrow-up": '<path d="m5 12 7-7 7 7"/> <path d="M12 19V5"/>',
    "arrow-down": '<path d="M12 5v14"/> <path d="m19 12-7 7-7-7"/>',
    "log-out": '<path d="m16 17 5-5-5-5"/> <path d="M21 12H9"/> <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>',
    "user": '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/> <circle cx="12" cy="7" r="4"/>',
    "key-round": '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/> <circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
    "user-x": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/> <circle cx="9" cy="7" r="4"/> <line x1="17" x2="22" y1="8" y2="13"/> <line x1="22" x2="17" y1="8" y2="13"/>',
    "pencil": '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/> <path d="m15 5 4 4"/>',
    "shield-check": '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/> <path d="m9 12 2 2 4-4"/>',
    "building-2": '<path d="M10 12h4"/> <path d="M10 8h4"/> <path d="M14 21v-3a2 2 0 0 0-4 0v3"/> <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/> <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>',
    "calendar": '<path d="M8 2v3"/> <path d="M16 2v3"/> <rect x="3" y="3" width="18" height="18" rx="2"/> <path d="M3 9h18"/>',
    "activity": '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
    "stethoscope": '<path d="M11 2v2"/> <path d="M5 2v2"/> <path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/> <path d="M8 15a6 6 0 0 0 12 0v-3"/> <circle cx="20" cy="10" r="2"/>',
    "banknote": '<rect width="20" height="12" x="2" y="6" rx="2"/> <circle cx="12" cy="12" r="2"/> <path d="M6 12h.01M18 12h.01"/>',
    "trending-up": '<path d="M16 7h6v6"/> <path d="m22 7-8.5 8.5-5-5L2 17"/>',
    "trending-down": '<path d="M16 17h6v-6"/> <path d="m22 17-8.5-8.5-5 5L2 7"/>',
    "scale": '<path d="M12 3v18"/> <path d="m19 8 3 8a5 5 0 0 1-6 0zV7"/> <path d="M3 7h1a17 17 0 0 0 8-2 17 17 0 0 0 8 2h1"/> <path d="m5 8 3 8a5 5 0 0 1-6 0zV7"/> <path d="M7 21h10"/>',
    "circle-help": '<circle cx="12" cy="12" r="10"/> <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/> <path d="M12 17h.01"/>',
    "list-checks": '<path d="M13 5h8"/> <path d="M13 12h8"/> <path d="M13 19h8"/> <path d="m3 17 2 2 4-4"/> <path d="m3 7 2 2 4-4"/>',
    "sliders-horizontal": '<path d="M10 5H3"/> <path d="M12 19H3"/> <path d="M14 3v4"/> <path d="M16 17v4"/> <path d="M21 12h-9"/> <path d="M21 19h-5"/> <path d="M21 5h-7"/> <path d="M8 10v4"/> <path d="M8 12H3"/>',
    "loader-circle": '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
    "user-plus": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/> <circle cx="9" cy="7" r="4"/> <line x1="19" x2="19" y1="8" y2="14"/> <line x1="22" x2="16" y1="11" y2="11"/>',
    "mail": '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/> <rect x="2" y="4" width="20" height="16" rx="2"/>',
    "house": '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/> <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    "external-link": '<path d="M15 3h6v6"/> <path d="M10 14 21 3"/> <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    "inbox": '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/> <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    "search-x": '<path d="m13.5 8.5-5 5"/> <path d="m8.5 8.5 5 5"/> <circle cx="11" cy="11" r="8"/> <path d="m21 21-4.3-4.3"/>',
    "file-x": '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/> <path d="M14 2v5a1 1 0 0 0 1 1h5"/> <path d="m14.5 12.5-5 5"/> <path d="m9.5 12.5 5 5"/>',
    "server-crash": '<path d="M6 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/> <path d="M6 14H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2"/> <path d="M6 6h.01"/> <path d="M6 18h.01"/> <path d="m13 6-4 6h6l-4 6"/>',
    "rotate-ccw": '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/> <path d="M3 3v5h5"/>',
    "circle": '<circle cx="12" cy="12" r="10"/>',
    "circle-dashed": '<path d="M10.1 2.182a10 10 0 0 1 3.8 0"/> <path d="M13.9 21.818a10 10 0 0 1-3.8 0"/> <path d="M17.609 3.721a10 10 0 0 1 2.69 2.7"/> <path d="M2.182 13.9a10 10 0 0 1 0-3.8"/> <path d="M20.279 17.609a10 10 0 0 1-2.7 2.69"/> <path d="M21.818 10.1a10 10 0 0 1 0 3.8"/> <path d="M3.721 6.391a10 10 0 0 1 2.7-2.69"/> <path d="M6.391 20.279a10 10 0 0 1-2.69-2.7"/>',
    "chart-column": '<path d="M3 3v16a2 2 0 0 0 2 2h16"/> <path d="M18 17V9"/> <path d="M13 17V5"/> <path d="M8 17v-3"/>',
    "percent": '<line x1="19" x2="5" y1="5" y2="19"/> <circle cx="6.5" cy="6.5" r="2.5"/> <circle cx="17.5" cy="17.5" r="2.5"/>',
    "user-round-check": '<path d="M2 21a8 8 0 0 1 13.292-6"/> <circle cx="10" cy="8" r="5"/> <path d="m16 19 2 2 4-4"/>',
    "user-check": '<path d="m16 11 2 2 4-4"/> <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/> <circle cx="9" cy="7" r="4"/>'
  };

  // core.jsx
  var React = window.React;
  var { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, useCallback } = React;
  var cx = (...a) => a.filter(Boolean).join(" ");
  var BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  var NUM = new Intl.NumberFormat("pt-BR");
  function formatBRL(v, { signed = false } = {}) {
    if (v == null || isNaN(v)) return "—";
    const s = BRL.format(Math.abs(v)).replace(/ /g, " ");
    if (!signed) return v < 0 ? "−" + s : s;
    return (v > 0 ? "+" : v < 0 ? "−" : "") + s;
  }
  var formatNumber = (v) => v == null ? "—" : NUM.format(v);
  var formatPercent = (v, d = 1) => v == null ? "—" : NUM.format(Number(v.toFixed(d))) + "%";
  var PARTICLES = /* @__PURE__ */ new Set(["de", "da", "do", "das", "dos", "e", "di", "du"]);
  function titleCase(name = "") {
    return name.toLowerCase().split(/\s+/).filter(Boolean).map((w, i) => i > 0 && PARTICLES.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  function initials(name = "") {
    const p = titleCase(name).split(" ").filter((w) => !PARTICLES.has(w.toLowerCase()));
    return ((p[0] || "").charAt(0) + (p.length > 1 ? p[p.length - 1].charAt(0) : "")).toUpperCase();
  }
  var useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
  function useElementWidth() {
    const ref = useRef(null);
    const [width, setWidth] = useState(0);
    useIsoLayoutEffect(() => {
      const el = ref.current;
      if (!el) return;
      setWidth(el.getBoundingClientRect().width);
      const ro = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
      ro.observe(el);
      return () => ro.disconnect();
    }, []);
    return [ref, width];
  }
  var bucketFor = (w) => w < 768 ? "sm" : w < 1280 ? "md" : w < 1536 ? "lg" : "xl";
  var ViewportContext = createContext(null);
  var ViewportProvider = ViewportContext.Provider;
  function useViewport() {
    const ctx = useContext(ViewportContext);
    const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1440);
    useEffect(() => {
      if (ctx) return;
      const on = () => setW(window.innerWidth);
      window.addEventListener("resize", on);
      return () => window.removeEventListener("resize", on);
    }, [ctx]);
    if (ctx) return ctx;
    const bucket = bucketFor(w);
    return { width: w, bucket, compact: bucket === "sm" };
  }
  var PortalContext = createContext(null);
  var PortalProvider = PortalContext.Provider;
  var usePortalTarget = () => useContext(PortalContext);
  function Portal({ children }) {
    const target = useContext(PortalContext);
    const el = target || (typeof document !== "undefined" ? document.body : null);
    if (!el) return null;
    return window.ReactDOM.createPortal(children, el);
  }
  function Icon({ name, size, label, className, strokeWidth = 1.75, style }) {
    const inner = ICONS[name] || ICONS["circle"];
    return /* @__PURE__ */ React.createElement(
      "svg",
      {
        className: cx("cs-icon", className),
        viewBox: "0 0 24 24",
        width: size || 20,
        height: size || 20,
        fill: "none",
        stroke: "currentColor",
        strokeWidth,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        role: label ? "img" : void 0,
        "aria-label": label,
        "aria-hidden": label ? void 0 : true,
        focusable: "false",
        style,
        dangerouslySetInnerHTML: { __html: inner }
      }
    );
  }
  var ICON_NAMES = Object.keys(ICONS);
  function Spinner({ size = 18, className }) {
    return /* @__PURE__ */ React.createElement(Icon, { name: "loader-circle", size, className: cx("cs-spin", className) });
  }
  var Button = React.forwardRef(function Button2({ variant = "secondary", size = "md", icon, iconEnd, loading = false, block = false, className, children, type = "button", disabled, ...rest }, ref) {
    const lead = loading ? /* @__PURE__ */ React.createElement(Spinner, { size: size === "sm" ? 16 : 18 }) : icon ? /* @__PURE__ */ React.createElement(Icon, { name: icon }) : variant === "ia" ? /* @__PURE__ */ React.createElement(Icon, { name: "sparkles" }) : null;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        ref,
        type,
        className: cx("cs-btn", `cs-btn--${variant}`, size !== "md" && `cs-btn--${size}`, block && "cs-btn--block", className),
        disabled,
        "aria-busy": loading || void 0,
        ...rest
      },
      lead,
      /* @__PURE__ */ React.createElement("span", { className: "cs-btn__label" }, children),
      iconEnd && /* @__PURE__ */ React.createElement(Icon, { name: iconEnd })
    );
  });
  var IconButton = React.forwardRef(function IconButton2({ icon, label, variant = "ghost", size = "md", round = false, className, type = "button", loading, ...rest }, ref) {
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        ref,
        type,
        "aria-label": label,
        title: label,
        className: cx("cs-iconbtn", variant !== "ghost" && `cs-iconbtn--${variant}`, size === "sm" && "cs-iconbtn--sm", round && "cs-iconbtn--round", className),
        ...rest
      },
      loading ? /* @__PURE__ */ React.createElement(Spinner, null) : /* @__PURE__ */ React.createElement(Icon, { name: icon })
    );
  });
  function Badge({ tone = "neutral", icon, size = "md", children, className, title }) {
    return /* @__PURE__ */ React.createElement("span", { className: cx("cs-badge", tone !== "neutral" && `cs-badge--${tone}`, size === "sm" && "cs-badge--sm", className), title }, icon && /* @__PURE__ */ React.createElement(Icon, { name: icon }), children);
  }
  function Count({ children, tone, label }) {
    return /* @__PURE__ */ React.createElement("span", { className: cx("cs-count", tone && `cs-count--${tone}`), "aria-label": label }, children);
  }
  var STATUS = {
    pendente: { tone: "warning", icon: "clock", label: "Pendente" },
    revisado: { tone: "info", icon: "eye", label: "Revisado" },
    corrigido: { tone: "success", icon: "circle-check", label: "Corrigido" },
    conforme: { tone: "success", icon: "circle-check", label: "Conforme" },
    divergente: { tone: "danger", icon: "triangle-alert", label: "Com divergência" },
    ativo: { tone: "success", icon: "circle-check", label: "Ativo" },
    "senha-pendente": { tone: "warning", icon: "key-round", label: "Senha pendente" },
    desativado: { tone: "muted", icon: "user-x", label: "Desativado" },
    processando: { tone: "info", icon: "loader-circle", label: "Processando" },
    erro: { tone: "danger", icon: "circle-alert", label: "Erro" }
  };
  function StatusBadge({ status, children, size }) {
    const s = STATUS[status] || STATUS.pendente;
    return /* @__PURE__ */ React.createElement(Badge, { tone: s.tone, icon: s.icon, size }, children || s.label);
  }
  var STATUS_FLOW = ["pendente", "revisado", "corrigido"];
  function ResultBadge({ divergences, size }) {
    if (!divergences) return /* @__PURE__ */ React.createElement(Badge, { tone: "success", icon: "circle-check", size }, "Conforme");
    return /* @__PURE__ */ React.createElement(Badge, { tone: "danger", icon: "triangle-alert", size }, formatNumber(divergences), " ", divergences === 1 ? "divergência" : "divergências");
  }
  function ProfileBadge({ profile }) {
    if (profile === "admin") return /* @__PURE__ */ React.createElement(Badge, { tone: "accent", icon: "shield-check" }, "Administrador");
    if (profile === "gestor") return /* @__PURE__ */ React.createElement(Badge, { tone: "outline", icon: "chart-column" }, "Gestor");
    return /* @__PURE__ */ React.createElement(Badge, { tone: "outline", icon: "user" }, "Auditor");
  }
  function DirectionTag({ direction, short = false, plain = false, children }) {
    const rep = direction === "rep";
    const label = children || (short ? rep ? "Rep" : "Prod" : rep ? "Repasse maior" : "Produção maior");
    return /* @__PURE__ */ React.createElement("span", { className: cx("cs-dir", rep ? "cs-dir--rep" : "cs-dir--prod", plain && "cs-dir--plain"), title: rep ? "Repasse maior que a produção (pago a mais)" : "Produção maior que o repasse (pago a menos)" }, /* @__PURE__ */ React.createElement("span", { className: "cs-dir__glyph", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement(Icon, { name: rep ? "arrow-up-right" : "arrow-down-left" })), label);
  }
  function DiffValue({ value, short = true }) {
    const dir = value >= 0 ? "rep" : "prod";
    return /* @__PURE__ */ React.createElement("span", { className: "cs-diffcell" }, /* @__PURE__ */ React.createElement("span", { className: "cs-diffcell__value" }, formatBRL(value, { signed: true })), /* @__PURE__ */ React.createElement(DirectionTag, { direction: dir, short, plain: true }));
  }
  function hashTone(s = "") {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = h * 31 + s.charCodeAt(i) | 0;
    return Math.abs(h) % 4 + 1;
  }
  function Avatar({ name = "", src, size = "md", off = false, className }) {
    return /* @__PURE__ */ React.createElement("span", { className: cx("cs-avatar", size !== "md" && `cs-avatar--${size}`, !src && `cs-avatar--t${hashTone(name)}`, off && "cs-avatar--off", className), title: titleCase(name), "aria-hidden": !src ? true : void 0 }, src ? /* @__PURE__ */ React.createElement("img", { src, alt: titleCase(name) }) : initials(name));
  }
  var Kbd = ({ children }) => /* @__PURE__ */ React.createElement("kbd", { className: "cs-kbd" }, children);

  // overlays.jsx
  var overlays_exports = {};
  __export(overlays_exports, {
    ActionMenu: () => ActionMenu,
    AiProgressModal: () => AiProgressModal,
    BottomSheet: () => BottomSheet,
    ConfirmDialog: () => ConfirmDialog,
    Drawer: () => Drawer,
    Modal: () => Modal,
    Toast: () => Toast,
    ToastStack: () => ToastStack
  });
  var React2 = window.React;
  var { useEffect: useEffect2, useRef: useRef2, useState: useState2, useId, useCallback: useCallback2 } = React2;
  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function useDialogFocus(open, onClose, ref, autoFocus = true) {
    useEffect2(() => {
      if (!open) return;
      const prev = document.activeElement;
      const node = ref.current;
      const first = node && (node.querySelector("[data-autofocus]") || node.querySelector(FOCUSABLE));
      if (first && autoFocus) first.focus({ preventScroll: true });
      function onKey(e) {
        if (e.key === "Escape" && onClose) {
          e.stopPropagation();
          onClose();
        }
        if (e.key === "Tab" && node) {
          const items = Array.from(node.querySelectorAll(FOCUSABLE));
          if (!items.length) return;
          const a = items[0], z = items[items.length - 1];
          if (e.shiftKey && document.activeElement === a) {
            e.preventDefault();
            z.focus();
          } else if (!e.shiftKey && document.activeElement === z) {
            e.preventDefault();
            a.focus();
          }
        }
      }
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("keydown", onKey);
        if (prev && prev.focus) prev.focus({ preventScroll: true });
      };
    }, [open]);
  }
  function Modal({ open = true, onClose, title, description, icon, tone = "default", footer, size = "md", dismissible = true, children, autoFocus = true }) {
    const { compact } = useViewport();
    const ref = useRef2(null);
    const id = useId();
    useDialogFocus(open, dismissible ? onClose : null, ref, autoFocus);
    if (!open) return null;
    return /* @__PURE__ */ React2.createElement(Portal, null, /* @__PURE__ */ React2.createElement("div", { className: "cs-overlay", "data-compact": compact || void 0 }, /* @__PURE__ */ React2.createElement("div", { className: "cs-scrim", onClick: dismissible ? onClose : void 0 }), /* @__PURE__ */ React2.createElement("div", { ref, className: cx("cs-modal", size === "wide" && "cs-modal--wide"), role: "dialog", "aria-modal": "true", "aria-labelledby": id + "t", "aria-describedby": description ? id + "d" : void 0 }, /* @__PURE__ */ React2.createElement("div", { className: "cs-modal__head" }, icon && /* @__PURE__ */ React2.createElement("span", { className: cx("cs-modal__icon", tone !== "default" && `cs-modal__icon--${tone}`) }, /* @__PURE__ */ React2.createElement(Icon, { name: icon })), /* @__PURE__ */ React2.createElement("div", { className: "cs-modal__titles" }, /* @__PURE__ */ React2.createElement("h2", { className: "cs-modal__title", id: id + "t" }, title), description && /* @__PURE__ */ React2.createElement("p", { className: "cs-modal__desc", id: id + "d" }, description)), dismissible && onClose && /* @__PURE__ */ React2.createElement(IconButton, { icon: "x", label: "Fechar", size: "sm", onClick: onClose })), children && /* @__PURE__ */ React2.createElement("div", { className: "cs-modal__body" }, children), footer && /* @__PURE__ */ React2.createElement("div", { className: "cs-modal__foot" }, footer))));
  }
  function ConfirmDialog({ open = true, onClose, onConfirm, title = "Excluir auditoria?", description, confirmLabel = "Excluir", loading, children, autoFocus }) {
    return /* @__PURE__ */ React2.createElement(
      Modal,
      {
        open,
        onClose,
        icon: "trash-2",
        tone: "danger",
        title,
        description,
        autoFocus,
        footer: /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(Button, { variant: "secondary", onClick: onClose, "data-autofocus": true }, "Cancelar"), /* @__PURE__ */ React2.createElement(Button, { variant: "danger", icon: "trash-2", loading, onClick: onConfirm }, confirmLabel))
      },
      children
    );
  }
  function AiProgressModal({ open = true, steps = [], progress, onBackground, onCancel, title = "Gerando relatório com IA", description = "Isso leva cerca de 30 segundos. Você pode continuar usando o ConSaúde.", autoFocus }) {
    const active = steps.find((s) => s.state === "active");
    return /* @__PURE__ */ React2.createElement(
      Modal,
      {
        open,
        dismissible: false,
        title,
        description,
        autoFocus,
        footer: /* @__PURE__ */ React2.createElement(React2.Fragment, null, onCancel && /* @__PURE__ */ React2.createElement(Button, { variant: "ghost", onClick: onCancel }, "Cancelar"), /* @__PURE__ */ React2.createElement(Button, { variant: "secondary", onClick: onBackground, "data-autofocus": true }, "Continuar em segundo plano"))
      },
      /* @__PURE__ */ React2.createElement("div", { style: { display: "flex", alignItems: "center", gap: 16 } }, /* @__PURE__ */ React2.createElement("span", { className: "cs-orb", "aria-hidden": "true" }), /* @__PURE__ */ React2.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ React2.createElement("div", { className: "cs-progress" }, /* @__PURE__ */ React2.createElement("div", { className: "cs-progress__head" }, /* @__PURE__ */ React2.createElement("span", null, "Progresso"), /* @__PURE__ */ React2.createElement("span", { className: "cs-progress__value" }, progress != null ? Math.round(progress) + "%" : "")), /* @__PURE__ */ React2.createElement("div", { className: "cs-progress__track", role: "progressbar", "aria-label": "Progresso da geração", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": progress != null ? Math.round(progress) : void 0 }, /* @__PURE__ */ React2.createElement("span", { className: "cs-progress__fill", style: { width: (progress || 0) + "%", background: "var(--ia)" } }))))),
      /* @__PURE__ */ React2.createElement("ol", { className: "cs-steps" }, steps.map((s, i) => /* @__PURE__ */ React2.createElement("li", { key: i, className: cx("cs-step", `cs-step--${s.state}`), "aria-current": s.state === "active" ? "step" : void 0 }, /* @__PURE__ */ React2.createElement("span", { className: "cs-step__mark" }, s.state === "done" ? /* @__PURE__ */ React2.createElement(Icon, { name: "check", strokeWidth: 2.4 }) : s.state === "active" ? /* @__PURE__ */ React2.createElement(Spinner, null) : null), /* @__PURE__ */ React2.createElement("span", null, s.label), s.end && /* @__PURE__ */ React2.createElement("span", { className: "cs-step__end" }, s.end)))),
      /* @__PURE__ */ React2.createElement("p", { className: "cs-sr", "aria-live": "polite" }, active ? active.label : "")
    );
  }
  function Drawer({ open = true, onClose, eyebrow, title, subtitle, headerExtra, footer, children, label, autoFocus = true }) {
    const { compact } = useViewport();
    const ref = useRef2(null);
    const id = useId();
    useDialogFocus(open, onClose, ref, autoFocus);
    if (!open) return null;
    return /* @__PURE__ */ React2.createElement(Portal, null, /* @__PURE__ */ React2.createElement("div", { className: "cs-overlay", "data-compact": compact || void 0 }, /* @__PURE__ */ React2.createElement("div", { className: "cs-scrim", onClick: onClose }), /* @__PURE__ */ React2.createElement("aside", { ref, className: "cs-drawer", role: "dialog", "aria-modal": "true", "aria-labelledby": id, "aria-label": label }, /* @__PURE__ */ React2.createElement("header", { className: "cs-drawer__head" }, compact && /* @__PURE__ */ React2.createElement(IconButton, { icon: "arrow-left", label: "Voltar", onClick: onClose }), /* @__PURE__ */ React2.createElement("div", { className: "cs-drawer__titles" }, eyebrow && !compact && /* @__PURE__ */ React2.createElement("span", { className: "cs-drawer__eyebrow" }, eyebrow), /* @__PURE__ */ React2.createElement("h2", { className: "cs-drawer__title", id }, title), subtitle && /* @__PURE__ */ React2.createElement("span", { className: "cs-drawer__sub" }, subtitle)), headerExtra, !compact && /* @__PURE__ */ React2.createElement(IconButton, { icon: "x", label: "Fechar painel", onClick: onClose })), /* @__PURE__ */ React2.createElement("div", { className: "cs-drawer__body" }, children), footer && /* @__PURE__ */ React2.createElement("footer", { className: "cs-drawer__foot" }, footer))));
  }
  function BottomSheet({ open = true, onClose, title, footer, children, autoFocus = true }) {
    const ref = useRef2(null);
    const id = useId();
    useDialogFocus(open, onClose, ref, autoFocus);
    if (!open) return null;
    return /* @__PURE__ */ React2.createElement(Portal, null, /* @__PURE__ */ React2.createElement("div", { className: "cs-overlay", "data-compact": "true" }, /* @__PURE__ */ React2.createElement("div", { className: "cs-scrim", onClick: onClose }), /* @__PURE__ */ React2.createElement("div", { ref, className: "cs-sheet", role: "dialog", "aria-modal": "true", "aria-labelledby": id }, /* @__PURE__ */ React2.createElement("span", { className: "cs-sheet__handle", "aria-hidden": "true" }), /* @__PURE__ */ React2.createElement("div", { className: "cs-sheet__head" }, /* @__PURE__ */ React2.createElement("h2", { className: "cs-sheet__title", id }, title), /* @__PURE__ */ React2.createElement(IconButton, { icon: "x", label: "Fechar", onClick: onClose })), /* @__PURE__ */ React2.createElement("div", { className: "cs-sheet__body" }, children), footer && /* @__PURE__ */ React2.createElement("div", { className: "cs-sheet__foot" }, footer))));
  }
  function ActionMenu({ items = [], label = "Mais ações", title, trigger, align = "right", defaultOpen = false, header, autoFocus = true }) {
    const { compact } = useViewport();
    const host = usePortalTarget();
    const [open, setOpen] = useState2(defaultOpen);
    const [pos, setPos] = useState2(null);
    const anchor = useRef2(null);
    const menu = useRef2(null);
    const id = useId();
    const close = useCallback2(() => setOpen(false), []);
    React2.useLayoutEffect(() => {
      if (!open || compact || !anchor.current) return;
      const r = anchor.current.getBoundingClientRect();
      const box = host ? host.getBoundingClientRect() : { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      const mh = menu.current ? menu.current.offsetHeight : 220;
      const below = r.bottom + 6 + mh <= box.top + box.height - 8;
      const p = { top: below ? r.bottom - box.top + 6 : r.top - box.top - mh - 6 };
      if (align === "left") p.left = r.left - box.left;
      else p.right = box.left + box.width - r.right;
      setPos(p);
    }, [open, compact]);
    useEffect2(() => {
      if (!open || compact) return;
      const onDown = (e) => {
        if (anchor.current && !anchor.current.contains(e.target) && menu.current && !menu.current.contains(e.target)) setOpen(false);
      };
      const onKey = (e) => {
        if (e.key === "Escape") {
          setOpen(false);
          const b = anchor.current && anchor.current.querySelector("button");
          b && b.focus();
        }
      };
      const onScroll = () => setOpen(false);
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onKey);
      window.addEventListener("resize", onScroll);
      const first = menu.current && menu.current.querySelector('[role="menuitem"]:not([disabled])');
      if (first && autoFocus) first.focus({ preventScroll: true });
      return () => {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", onScroll);
      };
    }, [open, compact]);
    function onMenuKey(e) {
      const list = Array.from(menu.current.querySelectorAll('[role="menuitem"]:not([disabled])'));
      const i = list.indexOf(document.activeElement);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        list[(i + 1) % list.length].focus();
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        list[(i - 1 + list.length) % list.length].focus();
      }
      if (e.key === "Home") {
        e.preventDefault();
        list[0].focus();
      }
      if (e.key === "End") {
        e.preventDefault();
        list[list.length - 1].focus();
      }
      if (e.key === "Tab") setOpen(false);
    }
    const run = (it) => {
      setOpen(false);
      it.onSelect && it.onSelect();
    };
    const trigProps = { "aria-haspopup": "menu", "aria-expanded": open, "aria-controls": open ? id : void 0, onClick: () => setOpen((o) => !o) };
    return /* @__PURE__ */ React2.createElement("span", { className: "cs-menu-anchor", ref: anchor }, trigger ? trigger(trigProps) : /* @__PURE__ */ React2.createElement(IconButton, { icon: "ellipsis", label, size: "sm", ...trigProps }), open && !compact && /* @__PURE__ */ React2.createElement(Portal, null, /* @__PURE__ */ React2.createElement(
      "div",
      {
        ref: menu,
        id,
        role: "menu",
        "aria-label": label,
        className: "cs-menu",
        onKeyDown: onMenuKey,
        style: { position: "fixed", top: pos ? pos.top : -9999, left: pos && pos.left != null ? pos.left : "auto", right: pos && pos.right != null ? pos.right : "auto", visibility: pos ? "visible" : "hidden", fontFamily: "var(--font-sans)" }
      },
      header && /* @__PURE__ */ React2.createElement("div", { className: "cs-menu__head" }, header),
      items.map((it, i) => it.separator ? /* @__PURE__ */ React2.createElement("hr", { key: i, className: "cs-menu__sep" }) : it.heading ? /* @__PURE__ */ React2.createElement("div", { key: i, className: "cs-menu__label" }, it.heading) : /* @__PURE__ */ React2.createElement("button", { key: i, role: "menuitem", type: "button", disabled: it.disabled, className: cx("cs-menu__item", it.variant && `cs-menu__item--${it.variant}`), onClick: () => run(it) }, it.icon && /* @__PURE__ */ React2.createElement(Icon, { name: it.icon }), it.label, it.hint && /* @__PURE__ */ React2.createElement("span", { className: "cs-menu__item-end" }, it.hint)))
    )), open && compact && /* @__PURE__ */ React2.createElement(BottomSheet, { open: true, title: title || label, onClose: close, autoFocus, footer: /* @__PURE__ */ React2.createElement(Button, { variant: "secondary", block: true, onClick: close }, "Cancelar") }, header, /* @__PURE__ */ React2.createElement("div", { className: "cs-sheet__list", role: "menu", "aria-label": label }, items.filter((it) => !it.separator && !it.heading).map((it, i) => /* @__PURE__ */ React2.createElement("button", { key: i, role: "menuitem", type: "button", disabled: it.disabled, className: cx("cs-sheet__item", it.variant && `cs-sheet__item--${it.variant}`), onClick: () => run(it) }, it.icon && /* @__PURE__ */ React2.createElement(Icon, { name: it.icon }), it.label)))));
  }
  var TOAST_ICON = { success: "circle-check", error: "circle-alert", warning: "triangle-alert", info: "info", ia: "sparkles" };
  function Toast({ tone = "info", title, children, action, onClose }) {
    return /* @__PURE__ */ React2.createElement("div", { className: cx("cs-toast", `cs-toast--${tone}`), role: tone === "error" ? "alert" : "status" }, /* @__PURE__ */ React2.createElement(Icon, { name: TOAST_ICON[tone], className: "cs-toast__icon" }), /* @__PURE__ */ React2.createElement("div", { className: "cs-toast__body" }, title && /* @__PURE__ */ React2.createElement("span", { className: "cs-toast__title" }, title), children && /* @__PURE__ */ React2.createElement("span", { className: "cs-toast__text" }, children)), /* @__PURE__ */ React2.createElement("div", { className: "cs-toast__actions" }, action && /* @__PURE__ */ React2.createElement(Button, { variant: "link", size: "sm", onClick: action.onClick }, action.label), onClose && /* @__PURE__ */ React2.createElement(IconButton, { icon: "x", label: "Dispensar", size: "sm", onClick: onClose })));
  }
  function ToastStack({ children, inline = false }) {
    const { compact } = useViewport();
    const stack = /* @__PURE__ */ React2.createElement("div", { className: cx("cs-toasts", inline && "cs-toasts--inline"), "data-compact": !inline && compact || void 0, "aria-live": "polite" }, children);
    return inline ? stack : /* @__PURE__ */ React2.createElement(Portal, null, stack);
  }

  // forms.jsx
  var forms_exports = {};
  __export(forms_exports, {
    Accordion: () => Accordion,
    Callout: () => Callout,
    Checkbox: () => Checkbox,
    CurrencyField: () => CurrencyField,
    Dropzone: () => Dropzone,
    EmptyState: () => EmptyState,
    ErrorState: () => ErrorState,
    Field: () => Field,
    FilterChips: () => FilterChips,
    Input: () => Input,
    MASKS: () => MASKS,
    MaskedField: () => MaskedField,
    SearchField: () => SearchField,
    SegmentedControl: () => SegmentedControl,
    Select: () => Select,
    SelectChip: () => SelectChip,
    SelectField: () => SelectField,
    Switch: () => Switch,
    Tabs: () => Tabs,
    TextField: () => TextField,
    UploadProgress: () => UploadProgress
  });
  var React3 = window.React;
  var { useState: useState3, useId: useId2, useRef: useRef3 } = React3;
  function Tabs({ tabs = [], value, defaultValue, onChange, fill = false, label = "Seções", className }) {
    const [inner, setInner] = useState3(defaultValue || tabs[0] && tabs[0].id);
    const cur = value !== void 0 ? value : inner;
    const set = (id) => {
      setInner(id);
      onChange && onChange(id);
    };
    const refs = useRef3({});
    function onKey(e, i) {
      const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      let j = i;
      do {
        j = (j + dir + tabs.length) % tabs.length;
      } while (tabs[j].disabled && j !== i);
      set(tabs[j].id);
      refs.current[tabs[j].id] && refs.current[tabs[j].id].focus();
    }
    return /* @__PURE__ */ React3.createElement("div", { className: cx("cs-tabs", fill && "cs-tabs--fill", className), role: "tablist", "aria-label": label }, tabs.map((t, i) => /* @__PURE__ */ React3.createElement(
      "button",
      {
        key: t.id,
        ref: (el) => refs.current[t.id] = el,
        role: "tab",
        type: "button",
        className: "cs-tab",
        "aria-selected": cur === t.id,
        tabIndex: cur === t.id ? 0 : -1,
        disabled: t.disabled,
        onClick: () => set(t.id),
        onKeyDown: (e) => onKey(e, i)
      },
      t.icon && /* @__PURE__ */ React3.createElement(Icon, { name: t.icon }),
      t.label,
      t.count != null && /* @__PURE__ */ React3.createElement(Count, null, t.count)
    )));
  }
  function FilterChips({ options = [], value, defaultValue, onChange, multiple = false, scroll = false, label = "Filtros", bleed }) {
    const [inner, setInner] = useState3(defaultValue !== void 0 ? defaultValue : multiple ? [] : options[0] && options[0].id);
    const cur = value !== void 0 ? value : inner;
    const isOn = (id) => multiple ? cur.includes(id) : cur === id;
    const toggle = (id) => {
      const next = multiple ? cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] : id;
      setInner(next);
      onChange && onChange(next);
    };
    return /* @__PURE__ */ React3.createElement("div", { className: cx("cs-chips", scroll && "cs-chips--scroll"), role: multiple ? "group" : "radiogroup", "aria-label": label, style: bleed ? { "--_bleed": bleed } : void 0 }, options.map((o) => /* @__PURE__ */ React3.createElement(
      "button",
      {
        key: o.id,
        type: "button",
        className: "cs-chip",
        role: multiple ? void 0 : "radio",
        "aria-checked": multiple ? void 0 : isOn(o.id),
        "aria-pressed": multiple ? isOn(o.id) : void 0,
        onClick: () => toggle(o.id),
        disabled: o.disabled
      },
      o.icon && /* @__PURE__ */ React3.createElement(Icon, { name: o.icon }),
      o.label,
      o.count != null && /* @__PURE__ */ React3.createElement("span", { className: "cs-chip__count" }, formatNumber(o.count))
    )));
  }
  function SelectChip({ label, value, icon, ...rest }) {
    return /* @__PURE__ */ React3.createElement("button", { type: "button", className: "cs-chip cs-chip--select", ...rest }, icon && /* @__PURE__ */ React3.createElement(Icon, { name: icon }), /* @__PURE__ */ React3.createElement("span", null, label ? /* @__PURE__ */ React3.createElement("span", { className: "cs-faint" }, label, ": ") : null, value), /* @__PURE__ */ React3.createElement(Icon, { name: "chevron-down" }));
  }
  function SegmentedControl({ options = [], value, defaultValue, onChange, label, block = false }) {
    const [inner, setInner] = useState3(defaultValue || options[0] && options[0].id);
    const cur = value !== void 0 ? value : inner;
    return /* @__PURE__ */ React3.createElement("div", { className: cx("cs-seg", block && "cs-seg--block"), role: "radiogroup", "aria-label": label }, options.map((o) => /* @__PURE__ */ React3.createElement("button", { key: o.id, type: "button", role: "radio", "aria-checked": cur === o.id, className: "cs-seg__opt", onClick: () => {
      setInner(o.id);
      onChange && onChange(o.id);
    } }, o.icon && /* @__PURE__ */ React3.createElement(Icon, { name: o.icon, size: 16 }), o.label)));
  }
  function Field({ label, optional, help, error, children, id: idProp, className }) {
    const auto = useId2();
    const id = idProp || auto;
    const helpId = id + "-help";
    const child = React3.Children.only(children);
    const control = React3.cloneElement(child, { id, "aria-describedby": help || error ? helpId : void 0, "aria-invalid": error ? true : void 0 });
    return /* @__PURE__ */ React3.createElement("div", { className: cx("cs-field", error && "cs-field--error", className) }, label && /* @__PURE__ */ React3.createElement("label", { className: "cs-field__label", htmlFor: id }, label, optional && /* @__PURE__ */ React3.createElement("span", { className: "cs-field__opt" }, "(opcional)")), control, (error || help) && /* @__PURE__ */ React3.createElement("span", { className: "cs-field__help", id: helpId }, error && /* @__PURE__ */ React3.createElement(Icon, { name: "circle-alert" }), error || help));
  }
  var Input = React3.forwardRef(function Input2({ prefix, prefixIcon, suffix, suffixIcon, size, pill, numeric, disabled, className, end, ...rest }, ref) {
    return /* @__PURE__ */ React3.createElement("div", { className: cx("cs-control", size === "sm" && "cs-control--sm", pill && "cs-control--pill", disabled && "cs-control--disabled", className) }, (prefix || prefixIcon) && /* @__PURE__ */ React3.createElement("span", { className: "cs-control__affix" }, prefixIcon ? /* @__PURE__ */ React3.createElement(Icon, { name: prefixIcon }) : prefix), /* @__PURE__ */ React3.createElement("input", { ref, className: cx("cs-control__input", numeric && "cs-control__input--num"), disabled, ...rest }), (suffix || suffixIcon) && /* @__PURE__ */ React3.createElement("span", { className: "cs-control__affix cs-control__affix--end" }, suffixIcon ? /* @__PURE__ */ React3.createElement(Icon, { name: suffixIcon }) : suffix), end);
  });
  function TextField({ label, optional, help, error, id, className, ...inputProps }) {
    return /* @__PURE__ */ React3.createElement(Field, { label, optional, help, error, id, className }, /* @__PURE__ */ React3.createElement(Input, { ...inputProps }));
  }
  function SearchField({ placeholder = "Buscar", value, defaultValue = "", onChange, label, size, pill, shortcut, className }) {
    const [inner, setInner] = useState3(defaultValue);
    const cur = value !== void 0 ? value : inner;
    const set = (v) => {
      setInner(v);
      onChange && onChange(v);
    };
    const ref = useRef3(null);
    return /* @__PURE__ */ React3.createElement(
      Input,
      {
        ref,
        type: "search",
        role: "searchbox",
        "aria-label": label || placeholder,
        placeholder,
        prefixIcon: "search",
        size,
        pill,
        className,
        value: cur,
        onChange: (e) => set(e.target.value),
        onKeyDown: (e) => e.key === "Escape" && set(""),
        end: cur ? /* @__PURE__ */ React3.createElement(IconButton, { icon: "x", label: "Limpar busca", size: "sm", className: "cs-control__clear", onClick: () => {
          set("");
          ref.current && ref.current.focus();
        } }) : shortcut ? /* @__PURE__ */ React3.createElement("span", { className: "cs-control__affix cs-control__affix--end" }, /* @__PURE__ */ React3.createElement("kbd", { className: "cs-kbd" }, shortcut)) : null
      }
    );
  }
  var Select = React3.forwardRef(function Select2({ options = [], size, pill, prefixIcon, className, disabled, ...rest }, ref) {
    return /* @__PURE__ */ React3.createElement("div", { className: cx("cs-control", size === "sm" && "cs-control--sm", pill && "cs-control--pill", disabled && "cs-control--disabled", className) }, prefixIcon && /* @__PURE__ */ React3.createElement("span", { className: "cs-control__affix" }, /* @__PURE__ */ React3.createElement(Icon, { name: prefixIcon })), /* @__PURE__ */ React3.createElement("select", { ref, className: "cs-control__input", disabled, ...rest }, options.map((o) => /* @__PURE__ */ React3.createElement("option", { key: o.value, value: o.value }, o.label))), /* @__PURE__ */ React3.createElement(Icon, { name: "chevron-down", className: "cs-control__chevron" }));
  });
  function SelectField({ label, optional, help, error, id, className, ...selectProps }) {
    return /* @__PURE__ */ React3.createElement(Field, { label, optional, help, error, id, className }, /* @__PURE__ */ React3.createElement(Select, { ...selectProps }));
  }
  var MASKS = {
    cnpj: (v) => {
      const d = v.replace(/\D/g, "").slice(0, 14);
      return d.replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
    },
    cpf: (v) => {
      const d = v.replace(/\D/g, "").slice(0, 11);
      return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    },
    phone: (v) => {
      const d = v.replace(/\D/g, "").slice(0, 11);
      return d.length <= 10 ? d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2") : d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
    }
  };
  function MaskedField({ mask = "cnpj", value, defaultValue = "", onChange, ...rest }) {
    const [inner, setInner] = useState3(MASKS[mask](defaultValue));
    const cur = value !== void 0 ? MASKS[mask](value) : inner;
    return /* @__PURE__ */ React3.createElement(TextField, { inputMode: "numeric", autoComplete: "off", value: cur, onChange: (e) => {
      const m = MASKS[mask](e.target.value);
      setInner(m);
      onChange && onChange(m);
    }, ...rest });
  }
  function CurrencyField({ value, defaultValue = 0, onChange, ...rest }) {
    const [inner, setInner] = useState3(defaultValue);
    const cur = value !== void 0 ? value : inner;
    const text = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cur || 0);
    return /* @__PURE__ */ React3.createElement(TextField, { prefix: "R$", numeric: true, inputMode: "numeric", value: text, onChange: (e) => {
      const n = Number(e.target.value.replace(/\D/g, "") || 0) / 100;
      setInner(n);
      onChange && onChange(n);
    }, ...rest });
  }
  function Checkbox({ label, description, ...rest }) {
    return /* @__PURE__ */ React3.createElement("label", { className: "cs-check" }, /* @__PURE__ */ React3.createElement("input", { type: "checkbox", ...rest }), /* @__PURE__ */ React3.createElement("span", null, label, description && /* @__PURE__ */ React3.createElement("span", { className: "cs-check__sub" }, description)));
  }
  function Switch({ label, description, ...rest }) {
    return /* @__PURE__ */ React3.createElement("label", { className: "cs-check", style: { alignItems: "center", justifyContent: "space-between", width: "100%" } }, /* @__PURE__ */ React3.createElement("span", null, label, description && /* @__PURE__ */ React3.createElement("span", { className: "cs-check__sub" }, description)), /* @__PURE__ */ React3.createElement("input", { type: "checkbox", role: "switch", className: "cs-switch", ...rest }));
  }
  function Accordion({ items = [], defaultOpen = [], multiple = true, className }) {
    const [open, setOpen] = useState3(defaultOpen);
    const base = useId2();
    const toggle = (id) => setOpen((o) => o.includes(id) ? o.filter((x) => x !== id) : multiple ? [...o, id] : [id]);
    return /* @__PURE__ */ React3.createElement("div", { className: cx("cs-acc", className) }, items.map((it) => {
      const isOpen = open.includes(it.id);
      return /* @__PURE__ */ React3.createElement("div", { key: it.id, className: "cs-acc__item" }, /* @__PURE__ */ React3.createElement("h3", { className: "cs-acc__head" }, /* @__PURE__ */ React3.createElement("button", { type: "button", className: "cs-acc__btn", "aria-expanded": isOpen, "aria-controls": base + it.id, id: base + it.id + "b", onClick: () => toggle(it.id) }, it.icon && /* @__PURE__ */ React3.createElement(Icon, { name: it.icon, className: "cs-acc__lead" }), /* @__PURE__ */ React3.createElement("span", { className: "cs-acc__titles" }, it.title, it.subtitle && /* @__PURE__ */ React3.createElement("span", { className: "cs-acc__sub" }, it.subtitle)), /* @__PURE__ */ React3.createElement(Icon, { name: "chevron-down", className: "cs-acc__chev" }))), /* @__PURE__ */ React3.createElement("div", { className: "cs-acc__panel", id: base + it.id, role: "region", "aria-labelledby": base + it.id + "b", hidden: !isOpen }, it.content));
    }));
  }
  var CALLOUT_ICON = { info: "info", success: "circle-check", warning: "triangle-alert", danger: "circle-alert", ia: "sparkles", neutral: "info" };
  function Callout({ tone = "info", title, children, icon, action, className }) {
    return /* @__PURE__ */ React3.createElement("div", { className: cx("cs-callout", tone !== "info" && `cs-callout--${tone}`, className), role: tone === "danger" ? "alert" : void 0 }, /* @__PURE__ */ React3.createElement(Icon, { name: icon || CALLOUT_ICON[tone], className: "cs-callout__icon" }), /* @__PURE__ */ React3.createElement("div", { className: "cs-callout__body" }, title && /* @__PURE__ */ React3.createElement("span", { className: "cs-callout__title" }, title), children && /* @__PURE__ */ React3.createElement("span", { className: "cs-callout__text" }, children)), action && /* @__PURE__ */ React3.createElement("div", { className: "cs-callout__action" }, action));
  }
  function EmptyState({ icon = "inbox", title, children, actions, tone, compact = false }) {
    return /* @__PURE__ */ React3.createElement("div", { className: cx("cs-empty", tone === "error" && "cs-empty--error", compact && "cs-empty--compact"), role: tone === "error" ? "alert" : void 0 }, /* @__PURE__ */ React3.createElement("span", { className: "cs-empty__glyph" }, /* @__PURE__ */ React3.createElement(Icon, { name: icon })), /* @__PURE__ */ React3.createElement("h3", { className: "cs-empty__title" }, title), children && /* @__PURE__ */ React3.createElement("p", { className: "cs-empty__text" }, children), actions && /* @__PURE__ */ React3.createElement("div", { className: "cs-empty__actions" }, actions));
  }
  function ErrorState({ title = "Não foi possível carregar", children = "Verifique sua conexão e tente novamente. Se persistir, fale com o suporte.", onRetry, icon = "server-crash", compact }) {
    return /* @__PURE__ */ React3.createElement(EmptyState, { tone: "error", icon, title, compact, actions: onRetry && /* @__PURE__ */ React3.createElement(Button, { variant: "secondary", icon: "refresh-cw", onClick: onRetry }, "Tentar novamente") }, children);
  }
  var fmtSize = (b) => b >= 1048576 ? (b / 1048576).toFixed(1).replace(".", ",") + " MB" : Math.round(b / 1024) + " KB";
  function Dropzone({ step, title, subtitle, state: stateProp, file, error, onFile, onRemove, accept = ".xlsx,.xls,.csv", hint = ".xlsx, .xls ou .csv · até 20 MB" }) {
    const [drag, setDrag] = useState3(false);
    const inputId = useId2();
    const state = stateProp || (file ? "loaded" : error ? "error" : drag ? "dragover" : "empty");
    const pick = (f) => {
      setDrag(false);
      f && onFile && onFile(f);
    };
    return /* @__PURE__ */ React3.createElement("section", { className: cx("cs-drop", `cs-drop--${state}`), "aria-label": title }, /* @__PURE__ */ React3.createElement("header", { className: "cs-drop__head" }, /* @__PURE__ */ React3.createElement("span", { className: "cs-drop__step", "aria-hidden": "true" }, state === "loaded" ? /* @__PURE__ */ React3.createElement(Icon, { name: "check", size: 16, strokeWidth: 2.4 }) : step), /* @__PURE__ */ React3.createElement("div", { style: { minWidth: 0, flex: 1 } }, /* @__PURE__ */ React3.createElement("h3", { className: "cs-drop__title" }, step ? /* @__PURE__ */ React3.createElement("span", { className: "cs-sr" }, "Passo ", step, ": ") : null, title), subtitle && /* @__PURE__ */ React3.createElement("p", { className: "cs-drop__sub" }, subtitle)), state === "loaded" && /* @__PURE__ */ React3.createElement("span", { className: "cs-badge cs-badge--success cs-badge--sm" }, /* @__PURE__ */ React3.createElement(Icon, { name: "circle-check" }), "Carregado")), state === "loaded" && file ? /* @__PURE__ */ React3.createElement("div", { className: "cs-file" }, /* @__PURE__ */ React3.createElement("span", { className: "cs-file__icon" }, /* @__PURE__ */ React3.createElement(Icon, { name: "file-spreadsheet" })), /* @__PURE__ */ React3.createElement("div", { className: "cs-file__body" }, /* @__PURE__ */ React3.createElement("span", { className: "cs-file__name cs-truncate", title: file.name }, file.name), /* @__PURE__ */ React3.createElement("span", { className: "cs-file__meta" }, /* @__PURE__ */ React3.createElement("span", null, file.size ? fmtSize(file.size) : ""), file.rows != null && /* @__PURE__ */ React3.createElement("span", { className: "ok" }, /* @__PURE__ */ React3.createElement(Icon, { name: "check" }), formatNumber(file.rows), " linhas lidas"))), /* @__PURE__ */ React3.createElement(IconButton, { icon: "refresh-cw", label: "Trocar arquivo", size: "sm" }), /* @__PURE__ */ React3.createElement(IconButton, { icon: "trash-2", label: "Remover arquivo", size: "sm", onClick: onRemove })) : null, state === "loaded" && file && file.columns ? /* @__PURE__ */ React3.createElement("div", { className: "cs-drop__cols" }, /* @__PURE__ */ React3.createElement("span", { className: "cs-drop__cols-label" }, "Colunas reconhecidas"), /* @__PURE__ */ React3.createElement("div", { className: "cs-chips" }, file.columns.map((c) => /* @__PURE__ */ React3.createElement("span", { key: c, className: "cs-badge cs-badge--outline" }, /* @__PURE__ */ React3.createElement(Icon, { name: "check" }), c)))) : null, state === "loaded" && file ? null : /* @__PURE__ */ React3.createElement(
      "label",
      {
        className: "cs-drop__zone",
        htmlFor: inputId,
        onDragOver: (e) => {
          e.preventDefault();
          setDrag(true);
        },
        onDragLeave: () => setDrag(false),
        onDrop: (e) => {
          e.preventDefault();
          pick(e.dataTransfer.files[0]);
        }
      },
      /* @__PURE__ */ React3.createElement("input", { id: inputId, type: "file", accept, onChange: (e) => pick(e.target.files[0]), "aria-describedby": inputId + "h", "aria-invalid": state === "error" || void 0 }),
      /* @__PURE__ */ React3.createElement("span", { className: "cs-drop__glyph" }, /* @__PURE__ */ React3.createElement(Icon, { name: state === "error" ? "file-x" : state === "uploading" ? "loader-circle" : "cloud-upload", className: state === "uploading" ? "cs-spin" : void 0 })),
      state === "dragover" ? /* @__PURE__ */ React3.createElement("span", { className: "cs-drop__cta" }, "Solte para carregar") : state === "uploading" ? /* @__PURE__ */ React3.createElement("span", { className: "cs-drop__cta" }, "Lendo planilha…") : /* @__PURE__ */ React3.createElement("span", { className: "cs-drop__cta" }, /* @__PURE__ */ React3.createElement("span", { className: "cs-drop__dragtext" }, "Arraste o arquivo aqui ou ", /* @__PURE__ */ React3.createElement("u", null, "selecione no dispositivo")), /* @__PURE__ */ React3.createElement("span", { className: "cs-drop__tap" }, /* @__PURE__ */ React3.createElement("u", null, "Toque para selecionar o arquivo"))),
      /* @__PURE__ */ React3.createElement("span", { className: "cs-drop__hint", id: inputId + "h", style: state === "error" ? { color: "var(--danger)" } : void 0 }, state === "error" ? error : hint)
    ));
  }
  function UploadProgress({ done = 0, total = 2 }) {
    return /* @__PURE__ */ React3.createElement("div", { className: "cs-upload-steps", role: "status" }, /* @__PURE__ */ React3.createElement("div", { className: "cs-meter__bars", style: { "--_n": total, "--_h": "8px", "--_gap": "4px", width: 24 * total }, "aria-hidden": "true" }, Array.from({ length: total }, (_, i) => /* @__PURE__ */ React3.createElement("span", { key: i, className: cx("cs-meter__seg", i < done && "cs-meter__seg--success") }))), /* @__PURE__ */ React3.createElement("span", null, /* @__PURE__ */ React3.createElement("b", { style: { color: "var(--ink)" } }, done, " de ", total), " arquivos carregados"));
  }

  // data.jsx
  var data_exports = {};
  __export(data_exports, {
    BarChart: () => BarChart,
    Card: () => Card,
    DataTable: () => DataTable,
    Delta: () => Delta,
    DonutChart: () => DonutChart,
    HeroChip: () => HeroChip,
    HeroKpi: () => HeroKpi,
    KpiCard: () => KpiCard,
    KpiGroup: () => KpiGroup,
    Legend: () => Legend,
    Pagination: () => Pagination,
    ProgressBar: () => ProgressBar,
    RankingList: () => RankingList,
    SegmentedMeter: () => SegmentedMeter,
    Skeleton: () => Skeleton,
    StatStrip: () => StatStrip
  });
  var React4 = window.React;
  var { useState: useState4, useMemo, useId: useId3 } = React4;
  function Card({ title, subtitle, icon, actions, footer, flush = false, inset = false, glow = false, as: Tag = "section", className, children, headingLevel = 2, ...rest }) {
    const H = "h" + headingLevel;
    return /* @__PURE__ */ React4.createElement(Tag, { className: cx("cs-card", flush && "cs-card--flush", inset && "cs-card--inset", glow && "cs-card--glow", className), ...rest }, (title || actions) && /* @__PURE__ */ React4.createElement("header", { className: "cs-card__head" }, /* @__PURE__ */ React4.createElement("div", { className: "cs-card__titles" }, title && /* @__PURE__ */ React4.createElement(H, { className: "cs-card__title" }, icon && /* @__PURE__ */ React4.createElement(Icon, { name: icon, size: 18 }), title), subtitle && /* @__PURE__ */ React4.createElement("p", { className: "cs-card__subtitle" }, subtitle)), actions && /* @__PURE__ */ React4.createElement("div", { className: "cs-card__actions" }, actions)), children, footer && /* @__PURE__ */ React4.createElement("footer", { className: "cs-card__foot" }, footer));
  }
  function Delta({ value, direction = "up", good, label }) {
    const tone = good == null ? "neutral" : good ? "good" : "bad";
    return /* @__PURE__ */ React4.createElement("span", { className: cx("cs-delta", `cs-delta--${tone}`), title: label }, /* @__PURE__ */ React4.createElement(Icon, { name: direction === "up" ? "trending-up" : "trending-down" }), value, label && /* @__PURE__ */ React4.createElement("span", { className: "cs-sr" }, " ", label));
  }
  function KpiCard({ label, value, icon, tone, delta, hint, variant = "tile" }) {
    return /* @__PURE__ */ React4.createElement("div", { className: cx("cs-kpi", variant === "card" && "cs-kpi--card") }, (icon || delta) && /* @__PURE__ */ React4.createElement("div", { className: "cs-kpi__top" }, icon ? /* @__PURE__ */ React4.createElement("span", { className: cx("cs-kpi__icon", tone && `cs-kpi__icon--${tone}`) }, /* @__PURE__ */ React4.createElement(Icon, { name: icon })) : /* @__PURE__ */ React4.createElement("span", null), delta && /* @__PURE__ */ React4.createElement(Delta, { ...delta })), /* @__PURE__ */ React4.createElement("span", { className: "cs-kpi__label", title: typeof label === "string" ? label : void 0 }, label), /* @__PURE__ */ React4.createElement("span", { className: "cs-kpi__value" }, value), hint && /* @__PURE__ */ React4.createElement("span", { className: "cs-kpi__hint" }, hint));
  }
  function KpiGroup({ children, columns }) {
    const n = columns || React4.Children.count(children);
    return /* @__PURE__ */ React4.createElement("div", { className: "cs-kpigroup", style: { "--_n": n } }, children);
  }
  function Waves() {
    return /* @__PURE__ */ React4.createElement("svg", { className: "cs-hero__waves", viewBox: "0 0 400 200", preserveAspectRatio: "none", "aria-hidden": "true" }, /* @__PURE__ */ React4.createElement("path", { d: "M180 0 C 250 40 300 20 400 60 L400 0 Z" }), /* @__PURE__ */ React4.createElement("path", { d: "M0 200 C 90 150 170 175 240 140 C 300 110 350 130 400 110 L400 200 Z" }));
  }
  function HeroKpi({ label, value, icon, meta, chip, actions, topAction }) {
    return /* @__PURE__ */ React4.createElement("section", { className: "cs-hero", "aria-label": label }, /* @__PURE__ */ React4.createElement(Waves, null), /* @__PURE__ */ React4.createElement("div", { className: "cs-hero__top" }, /* @__PURE__ */ React4.createElement("div", null, /* @__PURE__ */ React4.createElement("span", { className: "cs-hero__label" }, icon && /* @__PURE__ */ React4.createElement(Icon, { name: icon, size: 16 }), label), /* @__PURE__ */ React4.createElement("p", { className: "cs-hero__value" }, value)), topAction), (meta || chip) && /* @__PURE__ */ React4.createElement("div", { className: "cs-hero__meta" }, chip, meta), actions && /* @__PURE__ */ React4.createElement("div", { className: "cs-hero__actions" }, actions));
  }
  var HeroChip = ({ icon, children }) => /* @__PURE__ */ React4.createElement("span", { className: "cs-hero__chip" }, icon && /* @__PURE__ */ React4.createElement(Icon, { name: icon }), children);
  function StatStrip({ items = [], compact }) {
    return /* @__PURE__ */ React4.createElement("div", { className: cx("cs-stats", compact && "cs-stats--compact"), style: { "--_n": items.length }, role: "list" }, items.map((it, i) => /* @__PURE__ */ React4.createElement("div", { className: "cs-stat", key: i, role: "listitem" }, it.icon && /* @__PURE__ */ React4.createElement("span", { className: cx("cs-kpi__icon", it.tone && `cs-kpi__icon--${it.tone}`) }, /* @__PURE__ */ React4.createElement(Icon, { name: it.icon })), /* @__PURE__ */ React4.createElement("div", { className: "cs-stat__body" }, /* @__PURE__ */ React4.createElement("span", { className: "cs-stat__label" }, it.label), /* @__PURE__ */ React4.createElement("span", { className: "cs-stat__value" }, it.value, it.sub && /* @__PURE__ */ React4.createElement("small", null, it.sub))))));
  }
  function ProgressBar({ value = 0, max = 100, label, valueLabel, tone = "accent", size, indeterminate }) {
    const pct = Math.max(0, Math.min(100, value / max * 100));
    return /* @__PURE__ */ React4.createElement("div", { className: cx("cs-progress", tone !== "accent" && `cs-progress--${tone}`, size === "sm" && "cs-progress--sm", indeterminate && "cs-progress--indeterminate") }, (label || valueLabel) && /* @__PURE__ */ React4.createElement("div", { className: "cs-progress__head" }, /* @__PURE__ */ React4.createElement("span", null, label), /* @__PURE__ */ React4.createElement("span", { className: "cs-progress__value" }, valueLabel != null ? valueLabel : Math.round(pct) + "%")), /* @__PURE__ */ React4.createElement("div", { className: "cs-progress__track", role: "progressbar", "aria-label": label, "aria-valuemin": 0, "aria-valuemax": max, "aria-valuenow": indeterminate ? void 0 : value, "aria-valuetext": valueLabel }, /* @__PURE__ */ React4.createElement("span", { className: "cs-progress__fill", style: { width: pct + "%" } })));
  }
  function SegmentedMeter({ value = 0, secondary, segments = 24, title, valueLabel, legend, height, thin, label }) {
    const on = Math.round(value / 100 * segments);
    const on2 = secondary != null ? Math.round(secondary / 100 * segments) : on;
    return /* @__PURE__ */ React4.createElement("div", { className: cx("cs-meter", thin && "cs-meter--thin") }, (title || valueLabel) && /* @__PURE__ */ React4.createElement("div", { className: "cs-meter__head" }, title && /* @__PURE__ */ React4.createElement("h3", { className: "cs-meter__title" }, title), /* @__PURE__ */ React4.createElement("span", { className: "cs-meter__value" }, valueLabel != null ? valueLabel : Math.round(value) + "%")), /* @__PURE__ */ React4.createElement("div", { className: "cs-meter__bars", style: { "--_n": segments, "--_h": height ? height + "px" : void 0 }, role: "meter", "aria-label": label || title, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.round(value), "aria-valuetext": valueLabel }, Array.from({ length: segments }, (_, i) => /* @__PURE__ */ React4.createElement("span", { key: i, className: cx("cs-meter__seg", i < on ? "cs-meter__seg--on" : i < on2 && "cs-meter__seg--on2") }))), legend && /* @__PURE__ */ React4.createElement(Legend, { items: legend }));
  }
  function Legend({ items = [] }) {
    const bg = { "chart-1": "var(--chart-1)", "chart-2": "var(--chart-2)", "chart-3": "var(--chart-3)", track: "var(--chart-track)", success: "var(--success)" };
    return /* @__PURE__ */ React4.createElement("ul", { className: "cs-legend" }, items.map((it, i) => /* @__PURE__ */ React4.createElement("li", { key: i, className: "cs-legend__item" }, /* @__PURE__ */ React4.createElement("span", { className: cx("cs-legend__swatch", it.swatch === "hatch" && "cs-legend__swatch--hatch"), style: it.swatch !== "hatch" ? { background: bg[it.swatch] || it.swatch } : void 0, "aria-hidden": "true" }), it.label, it.value != null && /* @__PURE__ */ React4.createElement("span", { className: "cs-legend__value" }, it.value))));
  }
  function niceStep(v) {
    if (v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / p;
    return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
  }
  function topRoundedRect(x, y, w, h, r) {
    r = Math.min(r, h, w / 2);
    return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
  }
  function BarChart({ data = [], series = [], height = 240, view = "chart", formatValue = formatNumber, caption, partialLabel = "Mês em andamento", totalLabel = "Total", integer = true }) {
    const [ref, width] = useElementWidth();
    const [active, setActive] = useState4(null);
    const id = useId3();
    const totals = data.map((d) => d.values.reduce((a2, b) => a2 + b, 0));
    const step = Math.max(niceStep(Math.max(...totals, 1) * 1.1 / 4), integer ? 1 : 0);
    const max = step * Math.ceil(Math.max(...totals, 1) * 1.1 / step);
    const padL = 32, padB = 26, padT = 8;
    const W = Math.max(width, 200), H = height;
    const innerW = W - padL, innerH = H - padB - padT;
    const band = innerW / Math.max(data.length, 1);
    const barW = Math.min(36, band * 0.42);
    const ticks = Array.from({ length: Math.round(max / step) + 1 }, (_, i) => i * step);
    const y = (v) => padT + innerH - v / max * innerH;
    if (view === "table") {
      return /* @__PURE__ */ React4.createElement("div", { className: "cs-table-wrap" }, /* @__PURE__ */ React4.createElement("table", { className: "cs-chart-table" }, caption && /* @__PURE__ */ React4.createElement("caption", { className: "cs-sr" }, caption), /* @__PURE__ */ React4.createElement("thead", null, /* @__PURE__ */ React4.createElement("tr", null, /* @__PURE__ */ React4.createElement("th", { scope: "col" }, "Período"), series.map((s) => /* @__PURE__ */ React4.createElement("th", { scope: "col", key: s.name }, s.name)), /* @__PURE__ */ React4.createElement("th", { scope: "col" }, totalLabel))), /* @__PURE__ */ React4.createElement("tbody", null, data.map((d, i) => /* @__PURE__ */ React4.createElement("tr", { key: i }, /* @__PURE__ */ React4.createElement("th", { scope: "row", style: { fontWeight: 500, color: "var(--ink)" } }, d.label, d.partial ? " *" : ""), d.values.map((v, j) => /* @__PURE__ */ React4.createElement("td", { key: j }, formatValue(v))), /* @__PURE__ */ React4.createElement("td", { style: { fontWeight: 600, color: "var(--ink)" } }, formatValue(totals[i])))))), data.some((d) => d.partial) && /* @__PURE__ */ React4.createElement("p", { className: "cs-kpi__hint", style: { margin: "8px 0 0" } }, "* ", partialLabel));
    }
    const a = active != null ? data[active] : null;
    return /* @__PURE__ */ React4.createElement("div", { className: "cs-chart", ref, style: { height: H } }, width > 0 && /* @__PURE__ */ React4.createElement("svg", { width: W, height: H, role: "group", "aria-labelledby": caption ? id : void 0 }, caption && /* @__PURE__ */ React4.createElement("title", { id }, caption), /* @__PURE__ */ React4.createElement("defs", null, /* @__PURE__ */ React4.createElement("pattern", { id: id + "h", width: "6", height: "6", patternUnits: "userSpaceOnUse", patternTransform: "rotate(135)" }, /* @__PURE__ */ React4.createElement("rect", { className: "cs-chart__hatch-bg", width: "6", height: "6" }), /* @__PURE__ */ React4.createElement("line", { className: "cs-chart__hatch-line", x1: "0", y1: "0", x2: "0", y2: "6" }))), ticks.map((t, i) => /* @__PURE__ */ React4.createElement("g", { key: i }, /* @__PURE__ */ React4.createElement("line", { className: "cs-chart__grid", x1: padL, x2: W, y1: y(t), y2: y(t) }), /* @__PURE__ */ React4.createElement("text", { className: "cs-chart__axis", x: padL - 8, y: y(t) + 4, textAnchor: "end" }, t >= 1e3 ? formatNumber(t / 1e3) + "k" : formatNumber(Math.round(t))))), data.map((d, i) => {
      const cx0 = padL + band * i + band / 2;
      let acc = 0;
      return /* @__PURE__ */ React4.createElement("g", { key: i }, /* @__PURE__ */ React4.createElement("rect", { className: "cs-chart__col", "data-active": active === i, x: cx0 - band / 2 + 4, y: padT, width: band - 8, height: innerH, rx: "8" }), d.partial && /* @__PURE__ */ React4.createElement("rect", { x: cx0 - barW / 2, y: padT, width: barW, height: innerH, rx: "4", fill: `url(#${id}h)` }), d.values.map((v, j) => {
        if (!v) return null;
        const y0 = y(acc), y1 = y(acc + v);
        acc += v;
        const isTop = j === d.values.length - 1 || d.values.slice(j + 1).every((x) => !x);
        const hgt = Math.max(y0 - y1 - (j > 0 ? 2 : 0), 1);
        const top = y1;
        return /* @__PURE__ */ React4.createElement("path", { key: j, className: `cs-chart__bar${(series[j] && series[j].color || "chart-1").replace("chart-", "")}`, d: isTop ? topRoundedRect(cx0 - barW / 2, top, barW, hgt, 4) : `M${cx0 - barW / 2},${top}h${barW}v${hgt}h${-barW}Z` });
      }), /* @__PURE__ */ React4.createElement("text", { className: "cs-chart__axis", x: cx0, y: H - 6, textAnchor: "middle" }, d.label, d.partial ? "*" : ""), /* @__PURE__ */ React4.createElement(
        "rect",
        {
          className: "cs-chart__hit",
          x: cx0 - band / 2,
          y: padT,
          width: band,
          height: innerH + padB,
          tabIndex: 0,
          "aria-label": `${d.label}${d.partial ? " (" + partialLabel.toLowerCase() + ")" : ""}: ${series.map((s, j) => s.name + " " + formatValue(d.values[j])).join(", ")}; ${totalLabel.toLowerCase()} ${formatValue(totals[i])}`,
          onMouseEnter: () => setActive(i),
          onMouseLeave: () => setActive(null),
          onFocus: () => setActive(i),
          onBlur: () => setActive(null)
        }
      ));
    })), a && /* @__PURE__ */ React4.createElement("div", { className: "cs-tooltip", style: { left: Math.min(Math.max(padL + band * active + band / 2, 90), W - 90), top: Math.max(y(totals[active]), 60) } }, /* @__PURE__ */ React4.createElement("div", { className: "cs-tooltip__title" }, a.label, a.partial ? " · " + partialLabel.toLowerCase() : ""), series.map((s, j) => /* @__PURE__ */ React4.createElement("div", { className: "cs-tooltip__row", key: j }, /* @__PURE__ */ React4.createElement("span", { style: { display: "inline-flex", alignItems: "center", gap: 6 } }, /* @__PURE__ */ React4.createElement("span", { className: "cs-legend__swatch", style: { background: `var(--${s.color})` } }), s.name), /* @__PURE__ */ React4.createElement("b", null, formatValue(a.values[j])))), /* @__PURE__ */ React4.createElement("div", { className: "cs-tooltip__row", style: { borderTop: "1px solid var(--line)", paddingTop: 6, marginTop: 6 } }, /* @__PURE__ */ React4.createElement("span", null, totalLabel), /* @__PURE__ */ React4.createElement("b", null, formatValue(totals[active])))));
  }
  function DonutChart({ parts = [], size = 148, thickness = 16, centerLabel = "total", formatValue = formatNumber }) {
    const total = parts.reduce((a, p) => a + p.value, 0) || 1;
    const r = (size - thickness) / 2, C = 2 * Math.PI * r, gap = 3;
    let off = 0;
    return /* @__PURE__ */ React4.createElement("div", { className: "cs-donut" }, /* @__PURE__ */ React4.createElement("div", { className: "cs-donut__svg", style: { width: size, height: size } }, /* @__PURE__ */ React4.createElement("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}`, role: "img", "aria-label": parts.map((p) => `${p.label}: ${formatValue(p.value)} (${Math.round(p.value / total * 100)}%)`).join("; ") }, /* @__PURE__ */ React4.createElement("g", { transform: `rotate(-90 ${size / 2} ${size / 2})` }, /* @__PURE__ */ React4.createElement("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: "var(--chart-track)", strokeWidth: thickness }), parts.map((p, i) => {
      const len = p.value / total * C;
      const el = /* @__PURE__ */ React4.createElement("circle", { key: i, cx: size / 2, cy: size / 2, r, fill: "none", stroke: `var(--${p.color})`, strokeWidth: thickness, strokeDasharray: `${Math.max(len - gap, 0)} ${C}`, strokeDashoffset: -off });
      off += len;
      return el;
    }))), /* @__PURE__ */ React4.createElement("div", { className: "cs-donut__center" }, /* @__PURE__ */ React4.createElement("span", { className: "cs-donut__total" }, formatValue(total)), /* @__PURE__ */ React4.createElement("span", { className: "cs-donut__caption" }, centerLabel))), /* @__PURE__ */ React4.createElement("ul", { className: "cs-donut__legend" }, parts.map((p, i) => /* @__PURE__ */ React4.createElement("li", { className: "cs-donut__item", key: i }, /* @__PURE__ */ React4.createElement("span", { className: "cs-legend__swatch", style: { background: `var(--${p.color})` }, "aria-hidden": "true" }), /* @__PURE__ */ React4.createElement("span", { className: "cs-donut__item-label" }, p.icon && /* @__PURE__ */ React4.createElement(Icon, { name: p.icon, size: 14 }), p.label), /* @__PURE__ */ React4.createElement("span", { className: "cs-donut__item-count" }, formatValue(p.value)), p.sub && /* @__PURE__ */ React4.createElement("span", { className: "cs-donut__item-sub" }, p.sub)))));
  }
  function RankingList({ items = [], formatValue = formatBRL, onSelect, nameFormat = titleCase }) {
    const max = Math.max(...items.map((i) => i.value), 1);
    return /* @__PURE__ */ React4.createElement("ol", { className: "cs-rank" }, items.map((it, i) => /* @__PURE__ */ React4.createElement("li", { className: "cs-rank__item", key: it.id || i }, /* @__PURE__ */ React4.createElement("span", { className: "cs-rank__pos", "aria-hidden": "true" }, i + 1), /* @__PURE__ */ React4.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React4.createElement("div", { className: "cs-rank__name cs-truncate", title: it.name }, nameFormat(it.name)), it.meta && /* @__PURE__ */ React4.createElement("div", { className: "cs-rank__meta" }, it.meta)), /* @__PURE__ */ React4.createElement("span", { className: "cs-rank__value" }, formatValue(it.value)), /* @__PURE__ */ React4.createElement("span", { className: "cs-rank__bar", "aria-hidden": "true" }, /* @__PURE__ */ React4.createElement("span", { style: { width: it.value / max * 100 + "%" } })), onSelect && /* @__PURE__ */ React4.createElement("button", { type: "button", className: "cs-rank__hit", "aria-label": `${i + 1}º ${nameFormat(it.name)}, ${formatValue(it.value)}. Abrir`, onClick: () => onSelect(it) }))));
  }
  var Skeleton = ({ width = "100%", height = 12 }) => /* @__PURE__ */ React4.createElement("span", { className: "cs-skel", style: { width, height }, "aria-hidden": "true" });
  function DataTable({ columns = [], rows = [], rowKey = (r) => r.id, mobile, rowActions, primaryAction, onRowClick, selectedKey, loading = false, skeletonRows = 5, empty, footer, caption, forceMode, defaultSort, openActionsFor }) {
    const [ref, width] = useElementWidth();
    const { compact } = useViewport();
    const [sort, setSort] = useState4(defaultSort || null);
    const mode = forceMode || ((compact || width > 0 && width < 640) && mobile ? "cards" : "table");
    const visible = columns.filter((c) => !c.priority || c.priority === 1 || c.priority === 2 && (width === 0 || width >= 900) || c.priority === 3 && (width === 0 || width >= 1100));
    const sorted = useMemo(() => {
      if (!sort) return rows;
      const col = columns.find((c) => c.key === sort.key);
      if (!col) return rows;
      const get = col.sortValue || ((r) => r[col.key]);
      return [...rows].sort((a, b) => {
        const x = get(a), y = get(b);
        const r = x > y ? 1 : x < y ? -1 : 0;
        return sort.dir === "asc" ? r : -r;
      });
    }, [rows, sort]);
    const toggleSort = (key) => setSort((s) => !s || s.key !== key ? { key, dir: "desc" } : s.dir === "desc" ? { key, dir: "asc" } : null);
    const hasActions = rowActions || primaryAction;
    if (mode === "cards") {
      return /* @__PURE__ */ React4.createElement("div", { ref, style: { minWidth: 0 } }, loading ? /* @__PURE__ */ React4.createElement("ul", { className: "cs-list cs-list--cards", "aria-busy": "true" }, Array.from({ length: 3 }, (_, i) => /* @__PURE__ */ React4.createElement("li", { key: i, className: "cs-list__item" }, /* @__PURE__ */ React4.createElement(Skeleton, { width: "60%", height: 14 }), /* @__PURE__ */ React4.createElement(Skeleton, { width: 72, height: 14 }), /* @__PURE__ */ React4.createElement(Skeleton, { width: "40%" })))) : !rows.length ? empty || /* @__PURE__ */ React4.createElement(EmptyState, { compact: true, title: "Nada por aqui", icon: "search-x" }, "Nenhum resultado para os filtros atuais.") : /* @__PURE__ */ React4.createElement("ul", { className: "cs-list cs-list--cards", "aria-label": caption }, sorted.map((r) => {
        const acts = rowActions ? rowActions(r) : null;
        return /* @__PURE__ */ React4.createElement("li", { key: rowKey(r), className: "cs-list__item", "aria-current": selectedKey === rowKey(r) || void 0 }, onRowClick && /* @__PURE__ */ React4.createElement("button", { type: "button", className: "cs-list__hit", "aria-label": `Abrir ${typeof mobile.title(r) === "string" ? mobile.title(r) : ""}`, onClick: () => onRowClick(r) }), /* @__PURE__ */ React4.createElement("span", { className: "cs-list__title cs-truncate" }, mobile.title(r)), mobile.value && /* @__PURE__ */ React4.createElement("span", { className: "cs-list__value" }, mobile.value(r)), mobile.meta && /* @__PURE__ */ React4.createElement("span", { className: "cs-list__meta" }, mobile.meta(r)), mobile.tags && /* @__PURE__ */ React4.createElement("span", { className: "cs-list__tags" }, mobile.tags(r)), acts && acts.length > 0 && /* @__PURE__ */ React4.createElement("span", { className: "cs-list__aside" }, /* @__PURE__ */ React4.createElement(ActionMenu, { items: acts, defaultOpen: openActionsFor === rowKey(r), autoFocus: openActionsFor == null, label: `Ações de ${typeof mobile.title(r) === "string" ? mobile.title(r) : "item"}`, title: typeof mobile.title(r) === "string" ? mobile.title(r) : void 0 })));
      })), footer);
    }
    return /* @__PURE__ */ React4.createElement("div", { ref, style: { minWidth: 0 } }, /* @__PURE__ */ React4.createElement("div", { className: "cs-table-wrap" }, /* @__PURE__ */ React4.createElement("table", { className: "cs-table" }, caption && /* @__PURE__ */ React4.createElement("caption", { className: "cs-sr" }, caption), /* @__PURE__ */ React4.createElement("thead", null, /* @__PURE__ */ React4.createElement("tr", null, visible.map((c) => /* @__PURE__ */ React4.createElement("th", { key: c.key, scope: "col", "data-align": c.align, style: { width: c.width }, "aria-sort": sort && sort.key === c.key ? sort.dir === "asc" ? "ascending" : "descending" : c.sortable ? "none" : void 0 }, c.sortable ? /* @__PURE__ */ React4.createElement("button", { type: "button", className: "cs-th-sort", onClick: () => toggleSort(c.key) }, c.header, /* @__PURE__ */ React4.createElement(Icon, { name: sort && sort.key === c.key ? sort.dir === "asc" ? "arrow-up" : "arrow-down" : "arrow-up-down" })) : c.header)), hasActions && /* @__PURE__ */ React4.createElement("th", { scope: "col", "data-align": "right" }, /* @__PURE__ */ React4.createElement("span", { className: "cs-sr" }, "Ações")))), /* @__PURE__ */ React4.createElement("tbody", { "aria-busy": loading || void 0 }, loading ? Array.from({ length: skeletonRows }, (_, i) => /* @__PURE__ */ React4.createElement("tr", { key: i }, visible.map((c, j) => /* @__PURE__ */ React4.createElement("td", { key: c.key, "data-align": c.align }, /* @__PURE__ */ React4.createElement(Skeleton, { width: j === 0 ? "70%" : "50%" }))), hasActions && /* @__PURE__ */ React4.createElement("td", null))) : !rows.length ? /* @__PURE__ */ React4.createElement("tr", null, /* @__PURE__ */ React4.createElement("td", { colSpan: visible.length + (hasActions ? 1 : 0), style: { padding: 0 } }, empty || /* @__PURE__ */ React4.createElement(EmptyState, { compact: true, title: "Nada por aqui", icon: "search-x" }, "Nenhum resultado para os filtros atuais."))) : sorted.map((r) => {
      const k = rowKey(r);
      const pa = primaryAction && primaryAction(r);
      const acts = rowActions && rowActions(r);
      return /* @__PURE__ */ React4.createElement("tr", { key: k, "aria-selected": selectedKey === k || void 0, "data-clickable": onRowClick ? "true" : void 0, onClick: onRowClick ? (e) => {
        if (!e.target.closest("button,a,input,select")) onRowClick(r);
      } : void 0 }, visible.map((c) => /* @__PURE__ */ React4.createElement("td", { key: c.key, "data-align": c.align, className: c.align === "right" ? "cs-num" : void 0 }, c.render ? c.render(r) : r[c.key])), hasActions && /* @__PURE__ */ React4.createElement("td", { "data-align": "right", style: { width: 1 } }, /* @__PURE__ */ React4.createElement("div", { className: "cs-cell-actions" }, pa && /* @__PURE__ */ React4.createElement(Button, { size: "sm", variant: "ghost", icon: pa.icon, iconEnd: pa.iconEnd, onClick: pa.onClick, "aria-label": pa.ariaLabel }, pa.label), acts && acts.length > 0 && /* @__PURE__ */ React4.createElement(ActionMenu, { items: acts, defaultOpen: openActionsFor === k, autoFocus: openActionsFor == null, label: pa && pa.ariaLabel ? "Mais ações · " + pa.ariaLabel.replace(/^(Abrir|Detalhar|Editar) /, "") : "Mais ações" }))));
    })))), footer);
  }
  function Pagination({ page = 1, pageSize = 25, total = 0, onPage, onPageSize, compact }) {
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const from = total ? (page - 1) * pageSize + 1 : 0, to = Math.min(total, page * pageSize);
    const nums = pages <= 5 ? Array.from({ length: pages }, (_, i) => i + 1) : [1, Math.max(2, page - 1), page, Math.min(pages - 1, page + 1), pages].filter((v, i, a) => a.indexOf(v) === i);
    return /* @__PURE__ */ React4.createElement("nav", { className: "cs-table-foot", "aria-label": "Paginação" }, /* @__PURE__ */ React4.createElement("span", { className: "cs-num" }, formatNumber(from), "–", formatNumber(to), " de ", formatNumber(total)), /* @__PURE__ */ React4.createElement("div", { className: "cs-pager" }, !compact && onPageSize && /* @__PURE__ */ React4.createElement("label", { style: { display: "flex", alignItems: "center", gap: 8, marginRight: 8 } }, "Por página", /* @__PURE__ */ React4.createElement("span", { className: "cs-control cs-control--sm", style: { width: 76 } }, /* @__PURE__ */ React4.createElement("select", { className: "cs-control__input", value: pageSize, onChange: (e) => onPageSize(Number(e.target.value)) }, [10, 25, 50, 100].map((n) => /* @__PURE__ */ React4.createElement("option", { key: n, value: n }, n))), /* @__PURE__ */ React4.createElement(Icon, { name: "chevron-down", className: "cs-control__chevron" }))), /* @__PURE__ */ React4.createElement(IconButton, { icon: "chevron-left", label: "Página anterior", size: "sm", disabled: page <= 1, onClick: () => onPage && onPage(page - 1) }), !compact && /* @__PURE__ */ React4.createElement("div", { className: "cs-pager__pages" }, nums.map((n) => /* @__PURE__ */ React4.createElement("button", { key: n, type: "button", className: "cs-pager__page", "aria-current": n === page ? "page" : void 0, onClick: () => onPage && onPage(n) }, n))), /* @__PURE__ */ React4.createElement(IconButton, { icon: "chevron-right", label: "Próxima página", size: "sm", disabled: page >= pages, onClick: () => onPage && onPage(page + 1) })));
  }

  // layout.jsx
  var layout_exports = {};
  __export(layout_exports, {
    AccountMenu: () => AccountMenu,
    ActionBar: () => ActionBar,
    AppShell: () => AppShell,
    BottomNav: () => BottomNav,
    Brand: () => Brand,
    Breadcrumb: () => Breadcrumb,
    BrowserFrame: () => BrowserFrame,
    CURRENT_USER: () => CURRENT_USER,
    Device: () => Device,
    NAV: () => NAV,
    NavItem: () => NavItem,
    PageHeader: () => PageHeader,
    SettingsSection: () => SettingsSection,
    Sidebar: () => Sidebar,
    ThemeToggle: () => ThemeToggle,
    Topbar: () => Topbar
  });
  var React5 = window.React;
  var { useState: useState5, useEffect: useEffect3, useRef: useRef4, createContext: createContext2, useContext: useContext2 } = React5;
  var NAV = [
    { group: "Menu principal" },
    { id: "dashboard", label: "Dashboard", icon: "layout-dashboard", short: "Início" },
    { id: "auditorias", label: "Auditorias", icon: "clipboard-check", short: "Auditorias", count: 3, countLabel: "3 auditorias com revisão pendente" },
    { group: "Administração" },
    { id: "usuarios", label: "Usuários", icon: "users", short: "Usuários" },
    { id: "configuracoes", label: "Configurações", icon: "settings", short: "Ajustes" }
  ];
  var CURRENT_USER = { name: "ANA PAULA LIMA", role: "Administradora", email: "ana.lima@clinicasaolucas.com.br" };
  var ShellContext = createContext2({ collapsed: false, toggle: () => {
  } });
  function AppShell({ active = "dashboard", onNavigate, crumbs = [], title, onNewAudit, back, children, defaultCollapsed = false, nav = NAV, user = CURRENT_USER }) {
    const [ref, width] = useElementWidth();
    const [collapsed, setCollapsed] = useState5(defaultCollapsed);
    const w = width || (typeof window !== "undefined" ? window.innerWidth : 1440);
    const bucket = bucketFor(w);
    const compact = bucket === "sm";
    const rail = !compact && (bucket === "md" || collapsed);
    const vp = { width: w, bucket, compact };
    return /* @__PURE__ */ React5.createElement(ViewportProvider, { value: vp }, /* @__PURE__ */ React5.createElement(ShellContext.Provider, { value: { collapsed: rail, toggle: () => setCollapsed((c) => !c) } }, /* @__PURE__ */ React5.createElement("div", { ref, className: "cs-app", "data-layout": compact ? "compact" : "regular", "data-nav": rail ? "rail" : "full", "data-width": bucket }, /* @__PURE__ */ React5.createElement(Sidebar, { nav, active, onNavigate, onNewAudit }), /* @__PURE__ */ React5.createElement("div", { className: "cs-main" }, /* @__PURE__ */ React5.createElement(Topbar, { crumbs, title, back, user }), /* @__PURE__ */ React5.createElement("main", { className: "cs-content", id: "conteudo" }, children), /* @__PURE__ */ React5.createElement(BottomNav, { nav, active, onNavigate, onNewAudit })))));
  }
  function Brand({ compact }) {
    return /* @__PURE__ */ React5.createElement("a", { className: "cs-brand", href: "#", "aria-label": "ConSaúde — Auditoria Financeira, início" }, /* @__PURE__ */ React5.createElement("span", { className: "cs-brand__mark", "aria-hidden": "true" }, /* @__PURE__ */ React5.createElement(Icon, { name: "activity" })), !compact && /* @__PURE__ */ React5.createElement("span", { className: "cs-brand__text" }, /* @__PURE__ */ React5.createElement("span", { className: "cs-brand__name" }, "Con", /* @__PURE__ */ React5.createElement("em", null, "Saúde")), /* @__PURE__ */ React5.createElement("span", { className: "cs-brand__tag" }, "Auditoria Financeira")));
  }
  function Sidebar({ nav = NAV, active, onNavigate, onNewAudit }) {
    const { collapsed, toggle } = useContext2(ShellContext);
    const { bucket } = useViewport();
    return /* @__PURE__ */ React5.createElement("aside", { className: "cs-sidebar", "aria-label": "Navegação principal" }, /* @__PURE__ */ React5.createElement(Brand, null), /* @__PURE__ */ React5.createElement("nav", { className: "cs-nav" }, nav.map((it, i) => it.group ? /* @__PURE__ */ React5.createElement("div", { key: i, className: "cs-nav__group", role: "presentation" }, it.group) : /* @__PURE__ */ React5.createElement(NavItem, { key: it.id, item: it, active: active === it.id, onClick: () => onNavigate && onNavigate(it.id), collapsed }))), /* @__PURE__ */ React5.createElement("div", { className: "cs-sidebar__foot" }, /* @__PURE__ */ React5.createElement("div", { className: "cs-promo" }, /* @__PURE__ */ React5.createElement("span", { className: "cs-promo__glyph" }, /* @__PURE__ */ React5.createElement(Icon, { name: "file-search" })), /* @__PURE__ */ React5.createElement("p", { className: "cs-promo__title" }, "Nova auditoria"), /* @__PURE__ */ React5.createElement("p", { className: "cs-promo__text" }, "Cruze Produção × Repasse em 2 passos."), /* @__PURE__ */ React5.createElement(Button, { variant: "primary", size: "sm", icon: "plus", block: true, onClick: onNewAudit }, "Nova auditoria")), /* @__PURE__ */ React5.createElement(IconButton, { className: "cs-rail-cta", variant: "primary", icon: "plus", label: "Nova auditoria", onClick: onNewAudit }), bucket !== "md" && /* @__PURE__ */ React5.createElement("button", { type: "button", className: "cs-nav__item cs-collapse", onClick: toggle, "aria-expanded": !collapsed, title: collapsed ? "Expandir menu" : "Recolher menu" }, /* @__PURE__ */ React5.createElement(Icon, { name: collapsed ? "panel-left-open" : "panel-left-close" }), /* @__PURE__ */ React5.createElement("span", { className: "cs-nav__label cs-collapse__label" }, "Recolher"))));
  }
  function NavItem({ item, active, onClick, collapsed }) {
    return /* @__PURE__ */ React5.createElement("a", { href: "#" + item.id, className: "cs-nav__item", "aria-current": active ? "page" : void 0, onClick: (e) => {
      e.preventDefault();
      onClick && onClick();
    }, title: collapsed ? item.label : void 0 }, /* @__PURE__ */ React5.createElement(Icon, { name: item.icon }), /* @__PURE__ */ React5.createElement("span", { className: "cs-nav__label" }, item.label), item.count ? /* @__PURE__ */ React5.createElement(Count, { label: item.countLabel }, item.count) : null, item.count ? /* @__PURE__ */ React5.createElement("span", { className: "cs-dot", "aria-hidden": "true" }) : null);
  }
  function BottomNav({ nav = NAV, active, onNavigate, onNewAudit }) {
    const items = nav.filter((n) => n.id);
    const slot = (it) => /* @__PURE__ */ React5.createElement("a", { key: it.id, href: "#" + it.id, className: "cs-bnav__item", "aria-current": active === it.id ? "page" : void 0, onClick: (e) => {
      e.preventDefault();
      onNavigate && onNavigate(it.id);
    } }, /* @__PURE__ */ React5.createElement(Icon, { name: it.icon }), it.short || it.label, it.count ? /* @__PURE__ */ React5.createElement("span", { className: "cs-bnav__badge" }, /* @__PURE__ */ React5.createElement(Count, { tone: "accent", label: it.countLabel }, it.count)) : null);
    return /* @__PURE__ */ React5.createElement("nav", { className: "cs-bottomnav", "aria-label": "Navegação principal" }, slot(items[0]), slot(items[1]), /* @__PURE__ */ React5.createElement("button", { type: "button", className: "cs-bnav__fab", onClick: onNewAudit, "aria-label": "Nova auditoria" }, /* @__PURE__ */ React5.createElement("span", { className: "cs-bnav__fabcircle" }, /* @__PURE__ */ React5.createElement(Icon, { name: "plus" })), "Nova"), slot(items[2]), slot(items[3]));
  }
  function Breadcrumb({ items = [] }) {
    return /* @__PURE__ */ React5.createElement("nav", { "aria-label": "Você está em" }, /* @__PURE__ */ React5.createElement("ol", { className: "cs-crumbs" }, items.map((it, i) => /* @__PURE__ */ React5.createElement("li", { key: i }, i > 0 && /* @__PURE__ */ React5.createElement(Icon, { name: "chevron-right" }), i === items.length - 1 ? /* @__PURE__ */ React5.createElement("span", { "aria-current": "page", className: "cs-truncate" }, it.label) : /* @__PURE__ */ React5.createElement("a", { href: it.href || "#" }, it.label)))));
  }
  function ThemeToggle() {
    const get = () => typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") || "dark";
    const [theme, setTheme] = useState5(get);
    useEffect3(() => {
      setTheme(get());
    }, []);
    const next = theme === "dark" ? "light" : "dark";
    return /* @__PURE__ */ React5.createElement(
      IconButton,
      {
        className: "cs-theme-toggle",
        icon: theme === "dark" ? "sun" : "moon",
        label: theme === "dark" ? "Usar tema claro" : "Usar tema escuro",
        onClick: () => {
          document.documentElement.setAttribute("data-theme", next);
          setTheme(next);
          try {
            localStorage.setItem("cs-theme", next);
          } catch (e) {
          }
        }
      }
    );
  }
  function AccountMenu({ user = CURRENT_USER, defaultOpen, autoFocus }) {
    const flip = () => {
      const n = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", n);
    };
    return /* @__PURE__ */ React5.createElement(
      ActionMenu,
      {
        label: "Menu da conta",
        title: "Sua conta",
        defaultOpen,
        autoFocus,
        header: /* @__PURE__ */ React5.createElement(React5.Fragment, null, /* @__PURE__ */ React5.createElement(Avatar, { name: user.name, size: "lg" }), /* @__PURE__ */ React5.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React5.createElement("div", { className: "cs-account__name" }, titleCase(user.name)), /* @__PURE__ */ React5.createElement("div", { className: "cs-account__role cs-truncate" }, user.email))),
        items: [{ label: "Meu perfil", icon: "user" }, { label: "Alternar tema", icon: "moon", onSelect: flip }, { label: "Central de ajuda", icon: "circle-help" }, { separator: true }, { label: "Sair", icon: "log-out", variant: "danger" }],
        trigger: (p) => /* @__PURE__ */ React5.createElement("button", { type: "button", className: "cs-account", "aria-label": `Conta de ${titleCase(user.name)}`, ...p }, /* @__PURE__ */ React5.createElement(Avatar, { name: user.name }), /* @__PURE__ */ React5.createElement("span", { className: "cs-account__text" }, /* @__PURE__ */ React5.createElement("span", { className: "cs-account__name" }, titleCase(user.name)), /* @__PURE__ */ React5.createElement("span", { className: "cs-account__role" }, user.role)), /* @__PURE__ */ React5.createElement(Icon, { name: "chevron-down", className: "cs-account__chev" }))
      }
    );
  }
  function Topbar({ crumbs = [], title, back, user }) {
    return /* @__PURE__ */ React5.createElement("header", { className: "cs-topbar" }, /* @__PURE__ */ React5.createElement("div", { className: "cs-topbar__start" }, /* @__PURE__ */ React5.createElement("div", { className: "cs-topbar__mobile" }, back ? /* @__PURE__ */ React5.createElement(IconButton, { icon: "arrow-left", label: back.label || "Voltar", onClick: back.onClick }) : /* @__PURE__ */ React5.createElement("span", { className: "cs-brand__mark", "aria-hidden": "true" }, /* @__PURE__ */ React5.createElement(Icon, { name: "activity" })), back ? /* @__PURE__ */ React5.createElement("span", { className: "cs-topbar__title cs-truncate" }, title || (crumbs.length ? crumbs[crumbs.length - 1].label : "")) : /* @__PURE__ */ React5.createElement("span", { className: "cs-brand__name" }, "Con", /* @__PURE__ */ React5.createElement("em", null, "Saúde"))), /* @__PURE__ */ React5.createElement(Breadcrumb, { items: crumbs })), /* @__PURE__ */ React5.createElement("div", { className: "cs-topbar__end" }, /* @__PURE__ */ React5.createElement("div", { className: "cs-topbar__search" }, /* @__PURE__ */ React5.createElement(SearchField, { placeholder: "Buscar auditoria ou médico", size: "sm", pill: true, shortcut: "/" })), /* @__PURE__ */ React5.createElement(ThemeToggle, null), /* @__PURE__ */ React5.createElement("span", { className: "cs-topbar__divider", "aria-hidden": "true" }), /* @__PURE__ */ React5.createElement(AccountMenu, { user })));
  }
  function PageHeader({ eyebrow, title, subtitle, meta, badge, primary, secondary = [], extra }) {
    const { compact } = useViewport();
    return /* @__PURE__ */ React5.createElement("div", { className: "cs-pagehead" }, /* @__PURE__ */ React5.createElement("div", { className: "cs-pagehead__titles" }, eyebrow && /* @__PURE__ */ React5.createElement("span", { className: "cs-pagehead__eyebrow" }, eyebrow), /* @__PURE__ */ React5.createElement("h1", { className: "cs-pagehead__title" }, title, badge), subtitle && /* @__PURE__ */ React5.createElement("p", { className: "cs-pagehead__sub" }, subtitle), meta && /* @__PURE__ */ React5.createElement("div", { className: "cs-pagehead__meta" }, meta)), (primary || secondary.length > 0 || extra) && /* @__PURE__ */ React5.createElement("div", { className: "cs-pagehead__actions" }, extra, !compact && secondary.map((a, i) => /* @__PURE__ */ React5.createElement(Button, { key: i, variant: a.variant === "ia" ? "ia" : a.variant === "export" ? "export" : "secondary", icon: a.icon, onClick: a.onSelect }, a.label)), primary, compact && secondary.length > 0 && /* @__PURE__ */ React5.createElement(ActionMenu, { items: secondary, label: "Mais ações da página", title: "Ações", trigger: (p) => /* @__PURE__ */ React5.createElement(IconButton, { icon: "ellipsis", label: "Mais ações", variant: "secondary", round: true, ...p }) })));
  }
  function ActionBar({ message, icon = "info", children }) {
    return /* @__PURE__ */ React5.createElement("div", { className: "cs-actionbar" }, /* @__PURE__ */ React5.createElement("span", { className: "cs-actionbar__msg" }, icon && /* @__PURE__ */ React5.createElement(Icon, { name: icon }), message), /* @__PURE__ */ React5.createElement("div", { className: "cs-btngroup" }, children));
  }
  function SettingsSection({ title, description, children }) {
    return /* @__PURE__ */ React5.createElement("section", { className: "cs-settings" }, /* @__PURE__ */ React5.createElement("div", { className: "cs-settings__intro" }, /* @__PURE__ */ React5.createElement("h2", null, title), description && /* @__PURE__ */ React5.createElement("p", null, description)), /* @__PURE__ */ React5.createElement("div", { className: "cs-settings__fields" }, children));
  }
  function Device({ children, caption, scrollTo = 0, theme }) {
    const screen = useRef4(null);
    const scroller = useRef4(null);
    const [host, setHost] = useState5(null);
    useEffect3(() => {
      setHost(screen.current);
    }, []);
    useEffect3(() => {
      if (host && scroller.current) {
        const t = setTimeout(() => {
          scroller.current.scrollTop = scrollTo;
        }, 60);
        return () => clearTimeout(t);
      }
    }, [host, scrollTo]);
    return /* @__PURE__ */ React5.createElement("div", { className: "cs-device-col", "data-theme": theme }, /* @__PURE__ */ React5.createElement("div", { className: "cs-device" }, /* @__PURE__ */ React5.createElement("div", { className: "cs-device__screen", ref: screen }, /* @__PURE__ */ React5.createElement("span", { className: "cs-device__notch", "aria-hidden": "true" }), /* @__PURE__ */ React5.createElement("div", { className: "cs-device__scroll", ref: scroller }, /* @__PURE__ */ React5.createElement("div", { className: "cs-device__status", "aria-hidden": "true" }, /* @__PURE__ */ React5.createElement("span", null, "9:41"), /* @__PURE__ */ React5.createElement("span", { style: { display: "inline-flex", gap: 6, alignItems: "center" } }, /* @__PURE__ */ React5.createElement(Icon, { name: "chart-column", size: 15 }), /* @__PURE__ */ React5.createElement(Icon, { name: "activity", size: 15 }))), host && /* @__PURE__ */ React5.createElement(PortalProvider, { value: host }, children)))), caption && /* @__PURE__ */ React5.createElement("div", { className: "cs-device__caption" }, caption));
  }
  function BrowserFrame({ width = 1440, height = 900, children, scrollTo = 0 }) {
    const box = useRef4(null);
    const scroller = useRef4(null);
    const [host, setHost] = useState5(null);
    useEffect3(() => {
      setHost(box.current);
    }, []);
    useEffect3(() => {
      if (host && scroller.current) scroller.current.scrollTop = scrollTo;
    }, [host, scrollTo]);
    return /* @__PURE__ */ React5.createElement("div", { className: "cs-browser", ref: box, style: { width, height } }, /* @__PURE__ */ React5.createElement("div", { ref: scroller, style: { position: "absolute", inset: 0, overflow: "auto", "--cs-vh": height + "px" } }, host && /* @__PURE__ */ React5.createElement(PortalProvider, { value: host }, children)));
  }

  // screens.jsx
  var screens_exports = {};
  __export(screens_exports, {
    AuditoriasScreen: () => AuditoriasScreen,
    ConfiguracoesScreen: () => ConfiguracoesScreen,
    DashboardScreen: () => DashboardScreen,
    DoctorDrawer: () => DoctorDrawer,
    RelatorioScreen: () => RelatorioScreen,
    UsuariosScreen: () => UsuariosScreen
  });

  // demo-data.js
  var demo_data_exports = {};
  __export(demo_data_exports, {
    AI_STEPS: () => AI_STEPS,
    AUDITS: () => AUDITS,
    DIRECTION: () => DIRECTION,
    DOCTORS: () => DOCTORS,
    MONTHLY: () => MONTHLY,
    MONTHLY_SERIES: () => MONTHLY_SERIES,
    PATIENTS: () => PATIENTS,
    TOP_IMPACT: () => TOP_IMPACT,
    USERS: () => USERS
  });
  var MONTHLY = [
    { label: "Abr", values: [1, 2] },
    { label: "Mai", values: [2, 2] },
    { label: "Jun", values: [2, 3] },
    { label: "Jul", values: [1, 3] },
    { label: "Ago", values: [2, 3] },
    { label: "Set", values: [1, 2], partial: true }
  ];
  var MONTHLY_SERIES = [{ name: "Com divergência", color: "chart-1" }, { name: "Conformes", color: "chart-2" }];
  var DIRECTION = { rep: { count: 128, value: 24310.4 }, prod: { count: 84, value: 14210.76 } };
  var AUDITS = [
    { id: "a24", date: "26/09/2026", time: "14:32", ref: "Setembro/2026", scope: "Clínica inteira", files: ["producao_set-2026.xlsx", "repasse_set-2026.xlsx"], auditor: "ANA PAULA LIMA", divergences: 37, value: 13846.55, ia: false },
    { id: "a23", date: "12/09/2026", time: "09:10", ref: "Setembro/2026 — Plantões", scope: "Plantões", files: ["plantoes_set.xlsx", "repasse_plantoes_set.csv"], auditor: "BRUNO CARVALHO", divergences: 0, value: 0, ia: false },
    { id: "a22", date: "29/08/2026", time: "17:05", ref: "Agosto/2026", scope: "Clínica inteira", files: ["producao_ago-2026.xlsx", "repasse_ago-2026.xlsx"], auditor: "ANA PAULA LIMA", divergences: 28, value: 9402.1, ia: true },
    { id: "a21", date: "18/08/2026", time: "11:47", ref: "Agosto/2026 — Unidade Marco", scope: "Unidade Marco", files: ["prod_marco_ago.xlsx", "rep_marco_ago.xlsx"], auditor: "DIEGO MARTINS", divergences: 0, value: 0, ia: false },
    { id: "a20", date: "30/07/2026", time: "16:21", ref: "Julho/2026", scope: "Clínica inteira", files: ["producao_jul-2026.xlsx", "repasse_jul-2026.xlsx"], auditor: "ANA PAULA LIMA", divergences: 41, value: 8114.65, ia: true },
    { id: "a19", date: "15/07/2026", time: "10:02", ref: "Julho/2026 — Plantões", scope: "Plantões", files: ["plantoes_jul.xlsx", "repasse_plantoes_jul.csv"], auditor: "BRUNO CARVALHO", divergences: 6, value: 1220, ia: false },
    { id: "a18", date: "01/07/2026", time: "08:55", ref: "Junho/2026", scope: "Clínica inteira", files: ["producao_jun-2026.xlsx", "repasse_jun-2026.xlsx"], auditor: "ANA PAULA LIMA", divergences: 0, value: 0, ia: false },
    { id: "a17", date: "03/06/2026", time: "15:38", ref: "Maio/2026", scope: "Clínica inteira", files: ["producao_mai-2026.xlsx", "repasse_mai-2026.xlsx"], auditor: "FELIPE ARANTES", divergences: 19, value: 5937.86, ia: true }
  ];
  var DOCTORS = [
    { id: "d1", name: "RICARDO ALVES PEREIRA", patients: 8, prod: 18420, rep: 20152.4, items: 5, status: "pendente" },
    { id: "d2", name: "ANA BEATRIZ SOUZA LIMA", patients: 6, prod: 15310, rep: 13180, items: 4, status: "revisado" },
    { id: "d3", name: "MARCOS VINÍCIUS ROCHA", patients: 9, prod: 9870.5, rep: 11640.5, items: 6, status: "pendente" },
    { id: "d4", name: "JULIANA COSTA FERREIRA", patients: 5, prod: 12050, rep: 10986.25, items: 3, status: "corrigido" },
    { id: "d5", name: "PAULO HENRIQUE NUNES", patients: 7, prod: 7430, rep: 8912.8, items: 4, status: "pendente" },
    { id: "d6", name: "FERNANDA DIAS MOREIRA", patients: 3, prod: 6280, rep: 5390, items: 2, status: "revisado" },
    { id: "d7", name: "LUCAS GABRIEL TEIXEIRA", patients: 4, prod: 11200, rep: 12544.6, items: 3, status: "pendente" },
    { id: "d8", name: "CAMILA RIBEIRO ANDRADE", patients: 2, prod: 5025, rep: 4210, items: 2, status: "revisado" },
    { id: "d9", name: "RAFAEL MONTEIRO BARROS", patients: 5, prod: 8790, rep: 9555, items: 3, status: "corrigido" },
    { id: "d10", name: "PATRÍCIA GOMES CARDOSO", patients: 4, prod: 4420, rep: 3587, items: 3, status: "revisado" },
    { id: "d11", name: "THIAGO MARTINS DO CARMO", patients: 3, prod: 6110, rep: 7130, items: 2, status: "pendente" }
  ].map((d) => ({ ...d, diff: Math.round((d.rep - d.prod) * 100) / 100 }));
  var PATIENTS = [
    { id: "p1", name: "MARIA DE LOURDES SANTOS", date: "04/09/2026", proc: "Consulta + ECG", prod: 1250, rep: 1850, type: "Valor divergente" },
    { id: "p2", name: "JOSÉ CARLOS OLIVEIRA", date: "08/09/2026", proc: "Ecocardiograma", prod: 0, rep: 480, type: "Ausente na produção" },
    { id: "p3", name: "ANTÔNIA FERREIRA LIMA", date: "11/09/2026", proc: "Holter 24h", prod: 320, rep: 640, type: "Duplicado no repasse" },
    { id: "p4", name: "FRANCISCO ALVES NETO", date: "15/09/2026", proc: "Teste ergométrico", prod: 890, rep: 1312.4, type: "Valor divergente" },
    { id: "p5", name: "LUIZA HELENA PRADO", date: "22/09/2026", proc: "Consulta", prod: 410, rep: 320, type: "Valor divergente" }
  ].map((p) => ({ ...p, diff: Math.round((p.rep - p.prod) * 100) / 100 }));
  var TOP_IMPACT = [
    { id: "t1", name: "RICARDO ALVES PEREIRA", meta: "4 auditorias · 26 itens", value: 7842.1 },
    { id: "t2", name: "ANA BEATRIZ SOUZA LIMA", meta: "3 auditorias · 17 itens", value: 5316.4 },
    { id: "t3", name: "MARCOS VINÍCIUS ROCHA", meta: "3 auditorias · 21 itens", value: 4180 },
    { id: "t4", name: "JULIANA COSTA FERREIRA", meta: "2 auditorias · 9 itens", value: 3402.75 },
    { id: "t5", name: "PAULO HENRIQUE NUNES", meta: "2 auditorias · 11 itens", value: 2961.2 }
  ];
  var USERS = [
    { id: "u1", name: "ANA PAULA LIMA", email: "ana.lima@clinicasaolucas.com.br", role: "Coordenadora de faturamento", profile: "admin", status: "ativo", created: "12/01/2026", me: true },
    { id: "u2", name: "BRUNO CARVALHO", email: "bruno.carvalho@clinicasaolucas.com.br", role: "Auditor", profile: "auditor", status: "ativo", created: "03/02/2026" },
    { id: "u3", name: "CAMILA ROCHA", email: "camila.rocha@clinicasaolucas.com.br", role: "Analista financeira", profile: "auditor", status: "senha-pendente", created: "21/09/2026" },
    { id: "u4", name: "DIEGO MARTINS", email: "diego.martins@clinicasaolucas.com.br", role: "Gerente administrativo", profile: "admin", status: "ativo", created: "12/01/2026" },
    { id: "u5", name: "EDUARDA FONSECA", email: "eduarda.fonseca@clinicasaolucas.com.br", role: "Auditora", profile: "auditor", status: "desativado", created: "08/03/2026" },
    { id: "u6", name: "FELIPE ARANTES", email: "felipe.arantes@clinicasaolucas.com.br", role: "Auditor", profile: "auditor", status: "ativo", created: "17/04/2026" },
    { id: "u7", name: "GABRIELA MOURA", email: "gabriela.moura.faturamento@clinicasaolucas.com.br", role: "Diretora financeira", profile: "gestor", status: "ativo", created: "02/05/2026" }
  ];
  var AI_STEPS = [
    { label: "Consolidando divergências", state: "done", end: "37 itens" },
    { label: "Identificando riscos", state: "active" },
    { label: "Preparando plano de ação", state: "pending" }
  ];

  // screens.jsx
  var React6 = window.React;
  var { useState: useState6 } = React6;
  var auditActions = (a) => [
    { label: "Exportar Excel", icon: "file-spreadsheet", variant: "export" },
    { label: "Exportar PDF", icon: "file-text" },
    { label: a.ia ? "Ver relatório IA" : "Gerar relatório IA", icon: "sparkles", variant: "ia" },
    { separator: true },
    { label: "Excluir auditoria", icon: "trash-2", variant: "danger" }
  ];
  function DashboardScreen(props) {
    return /* @__PURE__ */ React6.createElement(AppShell, { active: "dashboard", crumbs: [{ label: "Início" }, { label: "Dashboard" }], title: "Dashboard", ...props }, /* @__PURE__ */ React6.createElement(DashboardBody, null));
  }
  function DashboardBody() {
    const { compact } = useViewport();
    const [chartView, setChartView] = useState6("chart");
    const recent = AUDITS.slice(0, 5);
    const totalDiv = DIRECTION.rep.count + DIRECTION.prod.count;
    return /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(
      PageHeader,
      {
        title: "Dashboard",
        subtitle: "Visão geral das auditorias da clínica · abril a setembro de 2026",
        extra: !compact && /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(SegmentedControl, { label: "Período", defaultValue: "6", options: [{ id: "3", label: "3 meses" }, { id: "6", label: "6 meses" }, { id: "12", label: "12 meses" }] }), /* @__PURE__ */ React6.createElement("div", { style: { width: 196 } }, /* @__PURE__ */ React6.createElement(Select, { "aria-label": "Auditorias", pill: true, prefixIcon: "building-2", options: [{ value: "all", label: "Clínica inteira" }, { value: "me", label: "Minhas auditorias" }, { value: "bruno", label: "Auditor: Bruno Carvalho" }] }))),
        primary: !compact && /* @__PURE__ */ React6.createElement(Button, { variant: "primary", icon: "plus" }, "Nova auditoria")
      }
    ), compact && /* @__PURE__ */ React6.createElement("div", { className: "cs-chips cs-chips--scroll", style: { "--_bleed": "16px", marginTop: -4 } }, /* @__PURE__ */ React6.createElement(SelectChip, { icon: "calendar", value: "6 meses", "aria-label": "Período: 6 meses" }), /* @__PURE__ */ React6.createElement(SelectChip, { icon: "building-2", value: "Clínica inteira", "aria-label": "Auditorias: clínica inteira" })), /* @__PURE__ */ React6.createElement("div", { className: "cs-grid cs-grid--stretch" }, /* @__PURE__ */ React6.createElement("div", { className: "cs-span-4 cs-md-6" }, /* @__PURE__ */ React6.createElement(
      HeroKpi,
      {
        label: "Valor divergente · 6 meses",
        icon: "banknote",
        value: formatBRL(38521.16),
        chip: /* @__PURE__ */ React6.createElement(HeroChip, { icon: "trending-up" }, "8,2%"),
        meta: /* @__PURE__ */ React6.createElement("span", null, "vs. 6 meses anteriores · 212 divergências"),
        topAction: /* @__PURE__ */ React6.createElement(IconButton, { icon: "arrow-up-right", label: "Ver auditorias com divergência" }),
        actions: /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(Button, { variant: "light", size: "sm", iconEnd: "arrow-right" }, "Abrir última"), /* @__PURE__ */ React6.createElement(Button, { variant: "deep", size: "sm" }, "Ver auditorias"))
      }
    )), /* @__PURE__ */ React6.createElement(Card, { className: "cs-span-5 cs-md-12", title: "Resumo do período", subtitle: "24 auditorias processadas" }, /* @__PURE__ */ React6.createElement(KpiGroup, { columns: compact ? 2 : 3 }, /* @__PURE__ */ React6.createElement(KpiCard, { label: "Concluídas", value: "24", icon: "clipboard-check", delta: { value: "+3", direction: "up", good: true, label: "vs. período anterior" }, hint: "vs. 21 no período anterior" }), /* @__PURE__ */ React6.createElement(KpiCard, { label: "Com divergência", value: "9", icon: "triangle-alert", tone: "danger", hint: "37,5% das auditorias" }), /* @__PURE__ */ React6.createElement(KpiCard, { label: "Divergências", value: "212", icon: "list-checks", hint: "média de 23,6 por auditoria" }), compact && /* @__PURE__ */ React6.createElement(KpiCard, { label: "Conformidade", value: "62,5%", icon: "scale", tone: "success", hint: "15 de 24 conformes" }))), !compact && /* @__PURE__ */ React6.createElement(Card, { className: "cs-span-3 cs-md-6" }, /* @__PURE__ */ React6.createElement(
      SegmentedMeter,
      {
        title: "Taxa de conformidade",
        value: 62.5,
        valueLabel: "62,5%",
        segments: 20,
        label: "Taxa de conformidade: 62,5% das auditorias sem divergência",
        legend: [{ label: "Conformes", swatch: "chart-1", value: 15 }, { label: "Com divergência", swatch: "track", value: 9 }]
      }
    )), /* @__PURE__ */ React6.createElement(
      Card,
      {
        className: "cs-span-8",
        title: "Auditorias por mês",
        subtitle: "Conformes e com divergência, por data de processamento",
        actions: /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(SegmentedControl, { label: "Visualização", value: chartView, onChange: setChartView, options: [{ id: "chart", label: "Gráfico", icon: "chart-column" }, { id: "table", label: "Tabela", icon: "list-checks" }] }))
      },
      /* @__PURE__ */ React6.createElement(Legend, { items: [{ label: "Com divergência", swatch: "chart-1" }, { label: "Conformes", swatch: "chart-2" }, { label: "Mês em andamento", swatch: "hatch" }] }),
      /* @__PURE__ */ React6.createElement(BarChart, { data: MONTHLY, series: MONTHLY_SERIES, height: compact ? 220 : 290, view: chartView, caption: "Auditorias por mês, abril a setembro de 2026", totalLabel: "Total" })
    ), /* @__PURE__ */ React6.createElement(Card, { className: "cs-span-4 cs-md-6", title: "Direção dos desvios", subtitle: `${formatNumber(totalDiv)} divergências · 6 meses` }, /* @__PURE__ */ React6.createElement(DonutChart, { centerLabel: "divergências", parts: [
      { label: "Repasse maior", icon: "arrow-up-right", value: DIRECTION.rep.count, color: "chart-3", sub: `${formatBRL(DIRECTION.rep.value)} pagos a mais · 60%` },
      { label: "Produção maior", icon: "arrow-down-left", value: DIRECTION.prod.count, color: "chart-1", sub: `${formatBRL(DIRECTION.prod.value)} pagos a menos · 40%` }
    ] }), /* @__PURE__ */ React6.createElement(Callout, { tone: "neutral", icon: "info" }, "Repasse maior indica pagamento acima do produzido — priorize na revisão.")), /* @__PURE__ */ React6.createElement(
      Card,
      {
        className: "cs-span-8",
        flush: true,
        title: "Últimas auditorias",
        subtitle: "5 mais recentes",
        actions: /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(Button, { variant: "ghost", size: "sm", iconEnd: "arrow-right" }, "Ver todas"))
      },
      /* @__PURE__ */ React6.createElement(
        DataTable,
        {
          caption: "Últimas auditorias",
          rows: recent,
          columns: [
            { key: "ref", header: "Referência", render: (a) => /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-main" }, /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-main__title" }, a.ref), /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-main__sub" }, titleCase(a.auditor))) },
            { key: "date", header: "Data", render: (a) => /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-main" }, /* @__PURE__ */ React6.createElement("span", { className: "cs-num" }, a.date), /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-main__sub cs-num" }, a.time)) },
            { key: "res", header: "Resultado", render: (a) => /* @__PURE__ */ React6.createElement(ResultBadge, { divergences: a.divergences }) },
            { key: "value", header: "Valor divergente", align: "right", render: (a) => a.value ? formatBRL(a.value) : /* @__PURE__ */ React6.createElement("span", { className: "cs-faint" }, "—") }
          ],
          primaryAction: (a) => ({ label: "Abrir", iconEnd: "chevron-right", ariaLabel: "Abrir " + a.ref }),
          onRowClick: () => {
          },
          mobile: { title: (a) => a.ref, value: (a) => a.value ? formatBRL(a.value) : "—", meta: (a) => /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement("span", null, a.date), /* @__PURE__ */ React6.createElement("span", null, titleCase(a.auditor))), tags: (a) => /* @__PURE__ */ React6.createElement(ResultBadge, { divergences: a.divergences, size: "sm" }) }
        }
      )
    ), /* @__PURE__ */ React6.createElement(Card, { className: "cs-span-4 cs-md-6", title: "Maiores impactos", subtitle: "Médicos com maior valor divergente", actions: /* @__PURE__ */ React6.createElement(IconButton, { icon: "arrow-up-right", label: "Ver ranking completo", size: "sm" }) }, /* @__PURE__ */ React6.createElement(RankingList, { items: TOP_IMPACT, onSelect: () => {
    } }))));
  }
  function AuditoriasScreen({ tab = "lista", openActionsFor, dragover, ...props }) {
    return /* @__PURE__ */ React6.createElement(AppShell, { active: "auditorias", crumbs: [{ label: "Início" }, { label: "Auditorias" }], title: "Auditorias", ...props }, /* @__PURE__ */ React6.createElement(AuditoriasBody, { tab, openActionsFor, dragover }));
  }
  function AuditoriasBody({ tab: initial, openActionsFor, dragover }) {
    const { compact } = useViewport();
    const [tab, setTab] = useState6(initial);
    return /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(
      PageHeader,
      {
        title: "Auditorias",
        subtitle: "Cruze Produção × Repasse e acompanhe cada auditoria salva",
        primary: !compact && tab === "lista" && /* @__PURE__ */ React6.createElement(Button, { variant: "primary", icon: "plus", onClick: () => setTab("nova") }, "Nova auditoria")
      }
    ), /* @__PURE__ */ React6.createElement(Tabs, { label: "Auditorias", value: tab, onChange: setTab, fill: compact, tabs: [{ id: "lista", label: "Minhas auditorias", count: 24 }, { id: "nova", label: "Nova auditoria", icon: "plus" }] }), tab === "lista" ? /* @__PURE__ */ React6.createElement(AuditList, { openActionsFor }) : /* @__PURE__ */ React6.createElement(NewAudit, { dragover }));
  }
  function AuditList({ openActionsFor }) {
    const { compact } = useViewport();
    return /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(StatStrip, { items: [
      { label: "Auditorias salvas", value: "24", icon: "clipboard-check" },
      { label: "Com divergências", value: "9", sub: "37,5%", icon: "triangle-alert", tone: "danger" },
      { label: "Divergências", value: "212", icon: "list-checks" },
      { label: "Relatórios IA", value: "6", icon: "sparkles", tone: "ia" }
    ] }), /* @__PURE__ */ React6.createElement(Card, { flush: true }, /* @__PURE__ */ React6.createElement("div", { style: { padding: compact ? "16px 16px 12px" : "20px 20px 16px", display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React6.createElement("div", { className: "cs-toolbar" }, /* @__PURE__ */ React6.createElement("div", { className: "cs-toolbar__grow", style: compact ? { maxWidth: "none", flexBasis: "100%" } : void 0 }, /* @__PURE__ */ React6.createElement(SearchField, { placeholder: "Buscar referência, arquivo ou auditor" })), !compact && /* @__PURE__ */ React6.createElement("div", { style: { width: 188 } }, /* @__PURE__ */ React6.createElement(Select, { "aria-label": "Escopo", options: [{ value: "minhas", label: "Minhas auditorias" }, { value: "todas", label: "Clínica inteira" }] })), !compact && /* @__PURE__ */ React6.createElement("div", { className: "cs-toolbar__end" }, /* @__PURE__ */ React6.createElement("span", { className: "cs-count-line" }, "Exibindo ", /* @__PURE__ */ React6.createElement("b", null, "8"), " de ", /* @__PURE__ */ React6.createElement("b", null, "24")))), /* @__PURE__ */ React6.createElement("div", { className: "cs-chips cs-chips--scroll", style: { "--_bleed": compact ? "16px" : "0px" } }, compact && /* @__PURE__ */ React6.createElement(SelectChip, { value: "Minhas", icon: "user", "aria-label": "Escopo: minhas auditorias" }), /* @__PURE__ */ React6.createElement(FilterChips, { label: "Filtrar auditorias", defaultValue: "todas", options: [{ id: "todas", label: "Todas", count: 24 }, { id: "div", label: "Com divergências", count: 9, icon: "triangle-alert" }, { id: "ok", label: "Conformes", count: 15, icon: "circle-check" }, { id: "ia", label: "Com relatório IA", count: 6, icon: "sparkles" }] })), compact && /* @__PURE__ */ React6.createElement("span", { className: "cs-count-line" }, "Exibindo ", /* @__PURE__ */ React6.createElement("b", null, "8"), " de ", /* @__PURE__ */ React6.createElement("b", null, "24"))), /* @__PURE__ */ React6.createElement(
      DataTable,
      {
        caption: "Minhas auditorias",
        rows: AUDITS,
        defaultSort: null,
        columns: [
          { key: "date", header: "Data", sortable: true, sortValue: (a) => a.id, render: (a) => /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-main" }, /* @__PURE__ */ React6.createElement("span", { className: "cs-num" }, a.date), /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-main__sub cs-num" }, a.time)) },
          { key: "ref", header: "Referência", sortable: true, render: (a) => /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-main" }, /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-main__title" }, a.ref), /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-main__sub" }, a.scope)) },
          { key: "files", header: "Arquivos", priority: 3, render: (a) => /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-main", style: { maxWidth: 220 } }, a.files.map((f) => /* @__PURE__ */ React6.createElement("span", { key: f, className: "cs-mono cs-truncate", title: f, style: { color: "var(--ink-2)" } }, f))) },
          { key: "auditor", header: "Auditor", priority: 2, render: (a) => /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-person" }, /* @__PURE__ */ React6.createElement(Avatar, { name: a.auditor, size: "sm" }), /* @__PURE__ */ React6.createElement("span", { className: "cs-truncate" }, titleCase(a.auditor))) },
          { key: "res", header: "Resultado", sortable: true, sortValue: (a) => a.divergences, render: (a) => /* @__PURE__ */ React6.createElement("span", { style: { display: "inline-flex", gap: 6, alignItems: "center", whiteSpace: "nowrap" } }, /* @__PURE__ */ React6.createElement(ResultBadge, { divergences: a.divergences }), a.ia && /* @__PURE__ */ React6.createElement(Badge, { tone: "ia", icon: "sparkles", size: "sm", title: "Relatório IA disponível" }, "IA")) },
          { key: "value", header: "Valor divergente", align: "right", sortable: true, render: (a) => a.value ? formatBRL(a.value) : /* @__PURE__ */ React6.createElement("span", { className: "cs-faint" }, "—") }
        ],
        primaryAction: (a) => ({ label: "Abrir", iconEnd: "chevron-right", ariaLabel: "Abrir " + a.ref }),
        rowActions: auditActions,
        onRowClick: () => {
        },
        mobile: {
          title: (a) => a.ref,
          value: (a) => a.value ? formatBRL(a.value) : "—",
          meta: (a) => /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement("span", { className: "cs-num" }, a.date), /* @__PURE__ */ React6.createElement("span", null, titleCase(a.auditor))),
          tags: (a) => /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(ResultBadge, { divergences: a.divergences, size: "sm" }), a.ia && /* @__PURE__ */ React6.createElement(Badge, { tone: "ia", icon: "sparkles", size: "sm" }, "IA"))
        },
        openActionsFor,
        footer: /* @__PURE__ */ React6.createElement(Pagination, { page: 1, pageSize: 8, total: 24, compact, onPageSize: () => {
        } })
      }
    )));
  }
  function NewAudit({ dragover }) {
    const { compact } = useViewport();
    return /* @__PURE__ */ React6.createElement("div", { className: "cs-grid" }, /* @__PURE__ */ React6.createElement("div", { className: "cs-span-8 cs-stack", style: { gap: compact ? 16 : 20 } }, /* @__PURE__ */ React6.createElement(UploadProgress, { done: 1, total: 2 }), /* @__PURE__ */ React6.createElement("div", { style: { display: "grid", gridTemplateColumns: compact ? "1fr" : "1fr 1fr", gap: compact ? 12 : 20 } }, /* @__PURE__ */ React6.createElement(Dropzone, { step: 1, title: "Relatório de Produção", subtitle: "O que cada médico produziu no período", file: { name: "producao_set-2026.xlsx", size: 184320, rows: 1284, columns: ["Médico", "Paciente", "Data", "Procedimento", "Valor"] } }), /* @__PURE__ */ React6.createElement(Dropzone, { step: 2, title: "Relatório de Repasse", subtitle: "O que foi pago a cada médico", state: dragover ? "dragover" : void 0 })), /* @__PURE__ */ React6.createElement(Card, null, /* @__PURE__ */ React6.createElement("div", { style: { display: "grid", gridTemplateColumns: compact ? "1fr" : "1fr 1fr", gap: 16 } }, /* @__PURE__ */ React6.createElement(TextField, { label: "Referência da auditoria", optional: true, placeholder: "Ex.: Setembro/2026", defaultValue: "Setembro/2026", help: "Período ou competência. Aparece nos relatórios e exportações.", prefixIcon: "calendar" }), /* @__PURE__ */ React6.createElement(SelectField, { label: "Escopo", options: [{ value: "all", label: "Clínica inteira" }, { value: "plantao", label: "Plantões" }, { value: "marco", label: "Unidade Marco" }], help: "Ajuda a filtrar auditorias depois." }))), /* @__PURE__ */ React6.createElement(Accordion, { items: [{
      id: "opt",
      icon: "sliders-horizontal",
      title: "Opções de comparação",
      subtitle: "Tolerância R$ 0,50 · por médico e paciente · ignora acentos",
      content: /* @__PURE__ */ React6.createElement("div", { style: { display: "grid", gridTemplateColumns: compact ? "1fr" : "1fr 1fr", gap: 16 } }, /* @__PURE__ */ React6.createElement(CurrencyField, { label: "Tolerância desta auditoria", defaultValue: 0.5, help: "Diferenças até este valor contam como conformes. Padrão da clínica: R$ 0,50." }), /* @__PURE__ */ React6.createElement(SelectField, { label: "Cruzar por", options: [{ value: "mp", label: "Médico + paciente + data" }, { value: "m", label: "Somente médico" }] }), /* @__PURE__ */ React6.createElement(Checkbox, { defaultChecked: true, label: "Ignorar acentos e maiúsculas nos nomes", description: "“JOSÉ” e “Jose” contam como a mesma pessoa." }), /* @__PURE__ */ React6.createElement(Checkbox, { label: "Considerar glosas do repasse", description: "Itens glosados entram como divergência." }))
    }] })), /* @__PURE__ */ React6.createElement(Card, { className: "cs-span-4", title: "Como funciona", icon: "circle-help" }, /* @__PURE__ */ React6.createElement("ol", { className: "cs-steps" }, /* @__PURE__ */ React6.createElement("li", { className: "cs-step cs-step--done" }, /* @__PURE__ */ React6.createElement("span", { className: "cs-step__mark" }, /* @__PURE__ */ React6.createElement(Icon, { name: "check", strokeWidth: 2.4 })), "Envie o relatório de Produção"), /* @__PURE__ */ React6.createElement("li", { className: "cs-step cs-step--active" }, /* @__PURE__ */ React6.createElement("span", { className: "cs-step__mark", style: { boxShadow: "inset 0 0 0 1.5px var(--accent)", color: "var(--accent-text)", fontWeight: 600, fontSize: 12 } }, "2"), "Envie o relatório de Repasse"), /* @__PURE__ */ React6.createElement("li", { className: "cs-step" }, /* @__PURE__ */ React6.createElement("span", { className: "cs-step__mark", style: { fontSize: 12 } }, "3"), "Processe e revise as divergências")), /* @__PURE__ */ React6.createElement(Callout, { tone: "info", title: "Formatos aceitos" }, ".xlsx, .xls ou .csv com colunas de médico, paciente, data e valor. A primeira linha deve ser o cabeçalho.")), /* @__PURE__ */ React6.createElement("div", { className: "cs-span-12" }, /* @__PURE__ */ React6.createElement(ActionBar, { icon: "info", message: /* @__PURE__ */ React6.createElement("span", null, "Falta o ", /* @__PURE__ */ React6.createElement("b", { style: { color: "var(--ink)" } }, "Relatório de Repasse"), " para processar.") }, !compact && /* @__PURE__ */ React6.createElement(Button, { variant: "ghost" }, "Cancelar"), /* @__PURE__ */ React6.createElement(Button, { variant: "primary", icon: "refresh-cw", disabled: true }, "Processar auditoria"))));
  }
  function RelatorioScreen({ drawer = false, ai = false, confirm = false, ...props }) {
    const [open, setOpen] = useState6(drawer);
    return /* @__PURE__ */ React6.createElement(AppShell, { active: "auditorias", crumbs: [{ label: "Auditorias" }, { label: "Setembro/2026" }], title: "Setembro/2026", back: { label: "Voltar para auditorias" }, ...props }, /* @__PURE__ */ React6.createElement(RelatorioBody, { openDoctor: () => setOpen(true), selected: open ? "d1" : null }), open && /* @__PURE__ */ React6.createElement(DoctorDrawer, { onClose: () => setOpen(false) }), ai && /* @__PURE__ */ React6.createElement(AiProgressModal, { steps: AI_STEPS, progress: 46, onBackground: () => {
    }, autoFocus: false }), confirm && /* @__PURE__ */ React6.createElement(ConfirmDialog, { autoFocus: false, onClose: () => {
    }, title: "Excluir a auditoria Setembro/2026?", description: "Os 37 itens divergentes, os status de revisão e o relatório IA desta auditoria serão apagados. Os arquivos originais não são afetados.", confirmLabel: "Excluir auditoria" }));
  }
  function RelatorioBody({ openDoctor, selected }) {
    const { compact } = useViewport();
    const total = DOCTORS.reduce((a, d) => a + Math.abs(d.diff), 0);
    const items = DOCTORS.reduce((a, d) => a + d.items, 0);
    const by = (s) => DOCTORS.filter((d) => d.status === s).length;
    const more = [
      ...compact ? [{ label: "Exportar Excel", icon: "file-spreadsheet", variant: "export" }, { label: "Exportar PDF", icon: "file-text" }] : [],
      { label: "Copiar resumo", icon: "copy" },
      { label: "Nova auditoria", icon: "plus" },
      { separator: true },
      { label: "Excluir auditoria", icon: "trash-2", variant: "danger" }
    ];
    return /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement("div", { className: "cs-pagehead" }, /* @__PURE__ */ React6.createElement("div", { className: "cs-pagehead__titles" }, /* @__PURE__ */ React6.createElement("span", { className: "cs-pagehead__eyebrow" }, /* @__PURE__ */ React6.createElement(Icon, { name: "file-search", size: 14 }), "Relatório de auditoria"), /* @__PURE__ */ React6.createElement("h1", { className: "cs-pagehead__title" }, "Setembro/2026 ", /* @__PURE__ */ React6.createElement(ResultBadge, { divergences: items })), /* @__PURE__ */ React6.createElement("div", { className: "cs-pagehead__meta" }, /* @__PURE__ */ React6.createElement("span", null, /* @__PURE__ */ React6.createElement(Icon, { name: "calendar" }), "Processada em 26/09/2026 às 14:32"), /* @__PURE__ */ React6.createElement("span", null, /* @__PURE__ */ React6.createElement(Icon, { name: "file-spreadsheet" }), /* @__PURE__ */ React6.createElement("span", { className: "cs-truncate" }, "producao_set-2026.xlsx · repasse_set-2026.xlsx")), /* @__PURE__ */ React6.createElement("span", null, /* @__PURE__ */ React6.createElement(Icon, { name: "user" }), "Ana Paula Lima"))), /* @__PURE__ */ React6.createElement("div", { className: "cs-pagehead__actions" }, !compact && /* @__PURE__ */ React6.createElement(
      ActionMenu,
      {
        label: "Exportar",
        items: [{ label: "Excel (.xlsx)", icon: "file-spreadsheet", variant: "export", hint: "padrão" }, { label: "PDF", icon: "file-text" }],
        trigger: (p) => /* @__PURE__ */ React6.createElement(Button, { variant: "secondary", icon: "download", iconEnd: "chevron-down", ...p }, "Exportar")
      }
    ), /* @__PURE__ */ React6.createElement(Button, { variant: "ia" }, "Relatório IA"), /* @__PURE__ */ React6.createElement(ActionMenu, { items: more, label: "Mais ações da auditoria", title: "Ações da auditoria", trigger: (p) => /* @__PURE__ */ React6.createElement(IconButton, { icon: "ellipsis", label: "Mais ações", variant: "secondary", round: true, ...p }) }))), /* @__PURE__ */ React6.createElement("div", { className: "cs-grid cs-grid--stretch" }, /* @__PURE__ */ React6.createElement("div", { className: "cs-span-4 cs-md-6" }, /* @__PURE__ */ React6.createElement(
      HeroKpi,
      {
        label: "Valor divergente total",
        icon: "banknote",
        value: formatBRL(total),
        chip: /* @__PURE__ */ React6.createElement(HeroChip, { icon: "triangle-alert" }, items, " divergências"),
        meta: /* @__PURE__ */ React6.createElement("span", null, "em 11 de 42 médicos analisados"),
        actions: /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(Button, { variant: "light", size: "sm", icon: "copy" }, "Copiar resumo"))
      }
    )), /* @__PURE__ */ React6.createElement(Card, { className: "cs-span-5 cs-md-12", title: "Resumo" }, /* @__PURE__ */ React6.createElement(KpiGroup, { columns: compact ? 2 : 3 }, /* @__PURE__ */ React6.createElement(KpiCard, { label: "Médicos analisados", value: "42", icon: "stethoscope" }), /* @__PURE__ */ React6.createElement(KpiCard, { label: "Com divergência", value: "11", icon: "triangle-alert", tone: "danger", hint: "26,2% dos médicos" }), /* @__PURE__ */ React6.createElement(KpiCard, { label: "Total de divergências", value: String(items), icon: "list-checks", hint: "itens a revisar" }), compact && /* @__PURE__ */ React6.createElement(KpiCard, { label: "Revisão", value: "6 de 11", icon: "circle-check", tone: "success", hint: "2 corrigidos" }))), !compact && /* @__PURE__ */ React6.createElement(Card, { className: "cs-span-3 cs-md-6" }, /* @__PURE__ */ React6.createElement(
      SegmentedMeter,
      {
        title: "Progresso da revisão",
        value: by("corrigido") / 11 * 100,
        secondary: (by("corrigido") + by("revisado")) / 11 * 100,
        segments: 22,
        valueLabel: `${by("corrigido") + by("revisado")} de 11`,
        label: "Progresso da revisão: 2 corrigidos, 4 revisados, 5 pendentes",
        legend: [{ label: "Corrigidos", swatch: "chart-1", value: by("corrigido") }, { label: "Revisados", swatch: "chart-2", value: by("revisado") }, { label: "Pendentes", swatch: "track", value: by("pendente") }]
      }
    ))), /* @__PURE__ */ React6.createElement(
      Card,
      {
        flush: true,
        title: /* @__PURE__ */ React6.createElement(React6.Fragment, null, "Médicos com divergências ", /* @__PURE__ */ React6.createElement(Count, null, DOCTORS.length)),
        subtitle: "Diferença = Repasse − Produção. Clique na linha para ver os pacientes.",
        actions: !compact && /* @__PURE__ */ React6.createElement("div", { style: { width: 208 } }, /* @__PURE__ */ React6.createElement(Select, { "aria-label": "Ordenar", size: "sm", prefixIcon: "arrow-up-down", options: [{ value: "diff", label: "Maior diferença" }, { value: "name", label: "Nome (A–Z)" }, { value: "items", label: "Mais itens" }] }))
      },
      /* @__PURE__ */ React6.createElement("div", { style: { padding: compact ? "0 16px 12px" : "0 20px 16px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" } }, /* @__PURE__ */ React6.createElement("div", { className: "cs-toolbar__grow", style: compact ? { flexBasis: "100%", maxWidth: "none" } : { maxWidth: 320 } }, /* @__PURE__ */ React6.createElement(SearchField, { placeholder: "Buscar médico" })), /* @__PURE__ */ React6.createElement("div", { className: "cs-chips cs-chips--scroll", style: { "--_bleed": compact ? "16px" : "0px", flex: compact ? "1 1 100%" : void 0, minWidth: 0 } }, /* @__PURE__ */ React6.createElement(FilterChips, { label: "Status de revisão", defaultValue: "todos", options: [{ id: "todos", label: "Todos", count: 11 }, { id: "pendente", label: "Pendentes", count: by("pendente"), icon: "clock" }, { id: "revisado", label: "Revisados", count: by("revisado"), icon: "eye" }, { id: "corrigido", label: "Corrigidos", count: by("corrigido"), icon: "circle-check" }] }))),
      /* @__PURE__ */ React6.createElement(
        DataTable,
        {
          caption: "Médicos com divergências",
          rows: [...DOCTORS].sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff)),
          selectedKey: selected,
          onRowClick: openDoctor,
          columns: [
            { key: "name", header: "Médico", sortable: true, render: (d) => /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-main" }, /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-main__title", title: d.name }, titleCase(d.name)), /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-main__sub" }, d.patients, " pacientes")) },
            { key: "prod", header: "Produção", align: "right", sortable: true, priority: 2, render: (d) => formatBRL(d.prod) },
            { key: "rep", header: "Repasse", align: "right", sortable: true, priority: 2, render: (d) => formatBRL(d.rep) },
            { key: "diff", header: "Diferença", align: "right", sortable: true, sortValue: (d) => Math.abs(d.diff), render: (d) => /* @__PURE__ */ React6.createElement(DiffValue, { value: d.diff }) },
            { key: "items", header: "Itens", align: "center", sortable: true, render: (d) => /* @__PURE__ */ React6.createElement(Count, null, d.items) },
            { key: "status", header: "Status", sortable: true, render: (d) => /* @__PURE__ */ React6.createElement(StatusBadge, { status: d.status }) }
          ],
          primaryAction: (d) => ({ label: "Detalhar", iconEnd: "chevron-right", ariaLabel: "Detalhar " + titleCase(d.name), onClick: openDoctor }),
          rowActions: (d) => [{ label: d.status === "corrigido" ? "Voltar para pendente" : "Avançar status", icon: "arrow-right" }, { label: "Copiar resumo do médico", icon: "copy" }],
          mobile: { title: (d) => titleCase(d.name), value: (d) => formatBRL(d.diff, { signed: true }), meta: (d) => /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement("span", null, d.patients, " pacientes"), /* @__PURE__ */ React6.createElement("span", null, d.items, " itens")), tags: (d) => /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(DirectionTag, { direction: d.diff >= 0 ? "rep" : "prod", short: true }), /* @__PURE__ */ React6.createElement(StatusBadge, { status: d.status, size: "sm" })) }
        }
      )
    ));
  }
  function DoctorDrawer({ onClose, doctor = DOCTORS[0] }) {
    const { compact } = useViewport();
    const rep = doctor.diff >= 0;
    const next = STATUS_FLOW[Math.min(STATUS_FLOW.indexOf(doctor.status) + 1, 2)];
    return /* @__PURE__ */ React6.createElement(
      Drawer,
      {
        onClose,
        autoFocus: false,
        eyebrow: "Detalhe do médico",
        title: titleCase(doctor.name),
        subtitle: `${doctor.patients} pacientes · ${doctor.items} itens divergentes`,
        footer: /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(Button, { variant: "secondary", icon: "copy" }, compact ? "Copiar" : "Copiar resumo"), /* @__PURE__ */ React6.createElement(Button, { variant: "primary", iconEnd: "arrow-right" }, compact ? "Marcar " : "Marcar como ", next === "revisado" ? "revisado" : "corrigido"))
      },
      /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" } }, /* @__PURE__ */ React6.createElement(StatusBadge, { status: doctor.status }), /* @__PURE__ */ React6.createElement("span", { className: "cs-faint", style: { fontSize: 12 } }, "Pendente → Revisado → Corrigido")),
      /* @__PURE__ */ React6.createElement("div", { className: "cs-sumgrid" }, /* @__PURE__ */ React6.createElement("div", { className: "cs-sum" }, /* @__PURE__ */ React6.createElement("span", { className: "cs-sum__label" }, "Produção"), /* @__PURE__ */ React6.createElement("span", { className: "cs-sum__value" }, formatBRL(doctor.prod))), /* @__PURE__ */ React6.createElement("div", { className: "cs-sum" }, /* @__PURE__ */ React6.createElement("span", { className: "cs-sum__label" }, "Repasse"), /* @__PURE__ */ React6.createElement("span", { className: "cs-sum__value" }, formatBRL(doctor.rep))), /* @__PURE__ */ React6.createElement("div", { className: cx("cs-sum", rep ? "cs-sum--emph" : "cs-sum--emph-prod") }, /* @__PURE__ */ React6.createElement("span", { className: "cs-sum__label" }, "Diferença"), /* @__PURE__ */ React6.createElement("span", { className: "cs-sum__value" }, formatBRL(doctor.diff, { signed: true })))),
      /* @__PURE__ */ React6.createElement(Callout, { tone: "neutral", icon: rep ? "arrow-up-right" : "arrow-down-left", title: rep ? "Repasse maior que a produção" : "Produção maior que o repasse" }, rep ? `${formatBRL(doctor.diff)} pagos a mais. Confirme com o faturamento antes de corrigir.` : `${formatBRL(-doctor.diff)} pagos a menos. Avalie complemento de repasse.`),
      /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12 } }, /* @__PURE__ */ React6.createElement("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } }, /* @__PURE__ */ React6.createElement("h3", { className: "cs-card__title", style: { fontSize: 14, lineHeight: "20px" } }, "Itens por paciente ", /* @__PURE__ */ React6.createElement(Count, null, PATIENTS.length)), /* @__PURE__ */ React6.createElement(Button, { variant: "ghost", size: "sm", icon: "copy" }, "Copiar todos")), /* @__PURE__ */ React6.createElement("ul", { className: "cs-plist" }, PATIENTS.map((p) => /* @__PURE__ */ React6.createElement("li", { className: "cs-prow", key: p.id }, /* @__PURE__ */ React6.createElement("span", { className: "cs-prow__name cs-truncate", title: p.name }, titleCase(p.name), /* @__PURE__ */ React6.createElement("span", { className: "cs-faint", style: { display: "block", fontSize: 12, lineHeight: "16px", fontWeight: 400 } }, p.date, " · ", p.proc)), /* @__PURE__ */ React6.createElement(IconButton, { icon: "copy", size: "sm", label: `Copiar item de ${titleCase(p.name)}` }), /* @__PURE__ */ React6.createElement("div", { className: "cs-prow__vals" }, /* @__PURE__ */ React6.createElement("span", null, "Produção", /* @__PURE__ */ React6.createElement("b", null, p.prod ? formatBRL(p.prod) : "—")), /* @__PURE__ */ React6.createElement("span", null, "Repasse", /* @__PURE__ */ React6.createElement("b", null, formatBRL(p.rep))), /* @__PURE__ */ React6.createElement("span", null, "Diferença", /* @__PURE__ */ React6.createElement("b", null, formatBRL(p.diff, { signed: true })))), /* @__PURE__ */ React6.createElement("div", { className: "cs-prow__tags" }, /* @__PURE__ */ React6.createElement(DirectionTag, { direction: p.diff >= 0 ? "rep" : "prod", short: true }), /* @__PURE__ */ React6.createElement(Badge, { tone: "outline", size: "sm" }, p.type))))))
    );
  }
  function UsuariosScreen({ openActionsFor, ...props }) {
    return /* @__PURE__ */ React6.createElement(AppShell, { active: "usuarios", crumbs: [{ label: "Administração" }, { label: "Usuários e acessos" }], title: "Usuários", ...props }, /* @__PURE__ */ React6.createElement(UsuariosBody, { openActionsFor }));
  }
  function UsuariosBody({ openActionsFor }) {
    const { compact } = useViewport();
    const userActions = (u) => [
      ...compact ? [{ label: "Editar", icon: "pencil" }] : [],
      u.status === "senha-pendente" ? { label: "Reenviar convite", icon: "mail" } : { label: "Redefinir senha", icon: "key-round" },
      { separator: true },
      u.status === "desativado" ? { label: "Reativar acesso", icon: "user-check" } : { label: "Desativar acesso", icon: "user-x", variant: "danger", disabled: u.me }
    ];
    return /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(PageHeader, { title: "Usuários e acessos", subtitle: "Quem acessa o ConSaúde e com qual perfil", primary: /* @__PURE__ */ React6.createElement(Button, { variant: "primary", icon: "user-plus" }, "Novo usuário") }), /* @__PURE__ */ React6.createElement(StatStrip, { items: [
      { label: "Contas cadastradas", value: "7", icon: "users" },
      { label: "Acessos ativos", value: "5", icon: "circle-check", tone: "success" },
      { label: "Administradores", value: "2", icon: "shield-check", tone: "accent" },
      { label: "Requer atenção", value: "1", sub: "senha pendente", icon: "triangle-alert", tone: "warning" }
    ] }), /* @__PURE__ */ React6.createElement(Card, { flush: true }, /* @__PURE__ */ React6.createElement("div", { style: { padding: compact ? "16px 16px 12px" : "20px 20px 16px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" } }, /* @__PURE__ */ React6.createElement("div", { className: "cs-toolbar__grow", style: compact ? { flexBasis: "100%", maxWidth: "none" } : { maxWidth: 320 } }, /* @__PURE__ */ React6.createElement(SearchField, { placeholder: "Buscar nome ou e-mail" })), /* @__PURE__ */ React6.createElement("div", { className: "cs-chips cs-chips--scroll", style: { "--_bleed": compact ? "16px" : "0px", flex: compact ? "1 1 100%" : void 0, minWidth: 0 } }, /* @__PURE__ */ React6.createElement(FilterChips, { label: "Filtrar usuários", defaultValue: "todos", options: [{ id: "todos", label: "Todos", count: 7 }, { id: "ativos", label: "Ativos", count: 5 }, { id: "admin", label: "Administradores", count: 2 }, { id: "senha", label: "Senha pendente", count: 1 }, { id: "off", label: "Desativados", count: 1 }] }))), /* @__PURE__ */ React6.createElement(
      DataTable,
      {
        caption: "Usuários",
        rows: USERS,
        openActionsFor,
        columns: [
          { key: "name", header: "Usuário", sortable: true, render: (u) => /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-person" }, /* @__PURE__ */ React6.createElement(Avatar, { name: u.name, off: u.status === "desativado" }), /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-main", style: { minWidth: 0, maxWidth: 300 } }, /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-main__title", style: { display: "flex", alignItems: "center", gap: 6 } }, titleCase(u.name), u.me && /* @__PURE__ */ React6.createElement(Badge, { tone: "accent", size: "sm" }, "Sua conta")), /* @__PURE__ */ React6.createElement("span", { className: "cs-cell-main__sub cs-truncate", title: u.email }, u.email))) },
          { key: "role", header: "Cargo", priority: 2, render: (u) => /* @__PURE__ */ React6.createElement("span", { className: "cs-muted" }, u.role) },
          { key: "profile", header: "Perfil", sortable: true, render: (u) => /* @__PURE__ */ React6.createElement(ProfileBadge, { profile: u.profile }) },
          { key: "status", header: "Status", sortable: true, render: (u) => /* @__PURE__ */ React6.createElement(StatusBadge, { status: u.status }) },
          { key: "created", header: "Criado em", priority: 3, render: (u) => /* @__PURE__ */ React6.createElement("span", { className: "cs-num cs-muted" }, u.created) }
        ],
        primaryAction: (u) => ({ label: "Editar", icon: "pencil", ariaLabel: "Editar " + titleCase(u.name) }),
        rowActions: userActions,
        mobile: { title: (u) => titleCase(u.name), meta: (u) => /* @__PURE__ */ React6.createElement("span", { className: "cs-truncate", style: { maxWidth: "100%" } }, u.email), tags: (u) => /* @__PURE__ */ React6.createElement(React6.Fragment, null, u.me && /* @__PURE__ */ React6.createElement(Badge, { tone: "accent", size: "sm" }, "Sua conta"), /* @__PURE__ */ React6.createElement(ProfileBadge, { profile: u.profile }), /* @__PURE__ */ React6.createElement(StatusBadge, { status: u.status, size: "sm" })) }
      }
    )));
  }
  function ConfiguracoesScreen({ cnpjError, ...props }) {
    return /* @__PURE__ */ React6.createElement(AppShell, { active: "configuracoes", crumbs: [{ label: "Administração" }, { label: "Configurações" }], title: "Configurações", ...props }, /* @__PURE__ */ React6.createElement(ConfigBody, { cnpjError }));
  }
  function ConfigBody({ cnpjError }) {
    const { compact } = useViewport();
    return /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(PageHeader, { title: "Configurações", subtitle: "Dados da clínica e padrões aplicados às novas auditorias" }), /* @__PURE__ */ React6.createElement(Card, null, /* @__PURE__ */ React6.createElement(SettingsSection, { title: "Identificação da clínica", description: "Aparece no cabeçalho dos relatórios exportados e do relatório IA." }, /* @__PURE__ */ React6.createElement(TextField, { className: "cs-full", label: "Nome da clínica", defaultValue: "Clínica Integrada São Lucas" }), /* @__PURE__ */ React6.createElement(MaskedField, { mask: "cnpj", label: "CNPJ", defaultValue: "12345678000190", error: cnpjError ? "CNPJ inválido. Confira os 14 dígitos." : void 0 }), /* @__PURE__ */ React6.createElement(TextField, { label: "E-mail de relatórios", type: "email", defaultValue: "auditoria@clinicasaolucas.com.br", help: "Recebe uma cópia de cada exportação.", prefixIcon: "mail" })), /* @__PURE__ */ React6.createElement(SettingsSection, { title: "Preferências de auditoria", description: "Valem para novas auditorias. As já processadas mantêm as regras usadas na época." }, /* @__PURE__ */ React6.createElement(CurrencyField, { label: "Tolerância de divergência", defaultValue: 0.5, help: "Diferenças até este valor contam como conformes." }), /* @__PURE__ */ React6.createElement(Field, { label: "Formato padrão de exportação", help: "Usado no botão Exportar e no envio por e-mail." }, /* @__PURE__ */ React6.createElement(SegmentedControl, { label: "Formato padrão de exportação", defaultValue: "xlsx", block: true, options: [{ id: "xlsx", label: "Excel", icon: "file-spreadsheet" }, { id: "pdf", label: "PDF", icon: "file-text" }] })), /* @__PURE__ */ React6.createElement("div", { className: "cs-full" }, /* @__PURE__ */ React6.createElement(Callout, { tone: "info", title: "Como a tolerância funciona" }, "Com R$ 0,50, uma diferença de R$ 0,30 entre Produção e Repasse não vira divergência. Use 0 para exigir valores idênticos.")))), /* @__PURE__ */ React6.createElement(ActionBar, { icon: "circle-alert", message: "Você tem alterações não salvas." }, !compact && /* @__PURE__ */ React6.createElement(Button, { variant: "ghost" }, "Descartar"), /* @__PURE__ */ React6.createElement(Button, { variant: "primary", icon: "check" }, "Salvar configurações")));
  }

  // index.jsx
  var api = Object.assign({}, core_exports, overlays_exports, forms_exports, data_exports, layout_exports, { screens: screens_exports, demo: demo_data_exports });
  window.ConSaude = Object.assign(window.ConSaude || {}, api);
})();
