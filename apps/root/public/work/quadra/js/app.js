/* Quadra — portfolio prototype. Front-end only: no server, no real accounts, fictional data.
   Everything a visitor does is kept as a short list of actions in the open page and can be reset;
   reloading starts over. */
(function () {
  'use strict';
  const Q = window.QDATA, A = window.QART;
  const { D, PERIODS, TODAY, NOW, SPACES, CATEGORIES, GROUPS, USERS, ME } = Q;
  const $ = (s, el) => (el || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ic = (n, cls) => '<svg class="ico ' + (cls || '') + '" aria-hidden="true"><use href="#i-' + n + '"/></svg>';
  const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DOW = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const day = (s) => D.parse(s).getUTCDate();
  const mon = (s) => MON[D.parse(s).getUTCMonth()];
  const fShort = (s) => DOW[D.dow(s)].slice(0, 3) + ' ' + day(s) + ' ' + mon(s).slice(0, 3);
  const fLong = (s) => DOW[D.dow(s)] + ', ' + day(s) + ' ' + mon(s);
  const per = (id) => PERIODS.find((p) => p.id === id);
  const pIdx = (id) => PERIODS.findIndex((p) => p.id === id);
  const pRange = (ids) => { const s = ids.slice().sort((a, b) => pIdx(a) - pIdx(b)); const a = per(s[0]), b = per(s[s.length - 1]);
    return { label: s.length > 1 ? s[0] + '–' + s[s.length - 1] : s[0], time: a.from + '–' + b.to }; };
  const space = (id) => SPACES.find((s) => s.id === id);
  const cat = (id) => CATEGORIES.find((c) => c.id === id);
  const group = (id) => GROUPS.find((g) => g.id === id);
  const user = (id) => UU.find((u) => u.id === id);
  const initials = (name) => name.split(' ').filter((w) => /^[A-Z&]/.test(w)).map((w) => w[0]).join('').replace('&', '').slice(0, 2);
  const evVars = (c) => '--ev:' + c.color + ';--ev-soft:' + c.soft + ';--ev-ink:' + c.ink;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrowQ = matchMedia('(max-width: 640px)');
  const narrow = () => narrowQ.matches;

  // ── demo store: base data + this visitor's actions ─────────
  // Kept in this page's memory only: raioviajante.com stores nothing in the
  // browser (docs/privacy-storage.md), so reloading starts the demo over.
  let saved = { ops: [], authed: false, read: [], prefs: {} };
  const persist = () => {};

  let EV, RQ, NT, UU, CK, RSVP, slotIx;
  function build() {
    EV = Q.EVENTS.map((e) => Object.assign({}, e, { periods: e.periods.slice() }));
    UU = USERS.map((u) => Object.assign({}, u)); CK = {}; RSVP = {};
    RQ = Q.REQUESTS.map((r) => Object.assign({}, r));
    NT = Q.NOTES.map((n) => Object.assign({}, n));
    saved.ops.forEach(applyOp);
    NT.forEach((n) => { if (saved.read.includes(n.id)) n.unread = false; });
    index();
  }
  const stamp = () => TODAY + 'T' + NOW.time;
  const note = (kind, text, ref, unread) => NT.unshift({ id: 'n-' + Math.random().toString(36).slice(2, 9), kind, at: stamp(), text, ref: ref || null, unread: !!unread });
  function decide(id, ok, reason) {
    const e = EV.find((x) => x.id === id); if (!e) return;
    const mineRq = RQ.filter((r) => r.eventId === id && r.status === 'pending');
    if (ok) {
      e.status = 'published'; e.decidedBy = ME; e.decidedAt = stamp();
      mineRq.forEach((r) => { r.status = 'approved'; r.decidedAt = stamp(); });
      mineRq.forEach((r) => RQ.forEach((q) => { if (q.status === 'pending' && q.eventId !== id && q.space === r.space && q.date === r.date && q.period === r.period) {
        q.status = 'rejected'; q.reason = 'The period went to ' + e.organizer + '.'; q.decidedAt = stamp();
        const oe = EV.find((x) => x.id === q.eventId); if (oe && !RQ.some((z) => z.eventId === oe.id && z.status === 'pending')) { oe.status = 'rejected'; oe.rejectReason = q.reason; note('rejected', oe.title + ' was declined: the period went to ' + e.organizer, oe.id); }
      } }));
      note('approved', 'You approved ' + e.title + ' · ' + space(e.space).name + ', ' + fShort(e.date), e.id);
    } else {
      e.status = 'rejected'; e.rejectReason = reason; e.decidedBy = ME;
      mineRq.forEach((r) => { r.status = 'rejected'; r.reason = reason; r.decidedAt = stamp(); });
      note('rejected', 'You declined ' + e.title, e.id);
    }
  }
  function applyOp(o) {
    if (o.t === 'approve') decide(o.id, true);
    if (o.t === 'reject') decide(o.id, false, o.reason);
    if (o.t === 'create') {
      const g = group(o.group);
      EV.push({ id: o.id, title: o.title, cat: o.cat, group: o.group, organizer: g.name, owner: ME, space: o.space, date: o.date, periods: o.periods.slice(),
        status: o.confirmNow ? 'published' : 'pending', public: !!o.public, capacity: o.capacity, attendees: 0, checkedIn: 0, waitlist: 0, desc: o.desc, createdAt: TODAY, mine: true,
        signup: o.signup, allowWait: o.allowWait, notes: o.notes, decidedBy: o.confirmNow ? ME : null, decidedAt: o.confirmNow ? stamp() : null });
      o.periods.forEach((p, i) => RQ.push({ id: o.id + '-' + i, eventId: o.id, space: o.space, date: o.date, period: p, requester: ME, group: o.group, title: o.title,
        status: o.confirmNow ? 'approved' : 'pending', people: o.capacity, createdAt: TODAY, mine: true }));
      note(o.confirmNow ? 'approved' : 'request', (o.confirmNow ? 'You created and confirmed ' : 'You created ') + o.title + ' · ' + space(o.space).name + ', ' + fShort(o.date) + (o.confirmNow ? '' : ' (waiting for approval)'), o.id, true);
    }
    if (o.t === 'cancelEvent') { const e = EV.find((x) => x.id === o.id); if (e) { e.status = 'cancelled'; e.cancelReason = o.reason; RQ.forEach((r) => { if (r.eventId === o.id && r.status !== 'rejected') r.status = 'cancelled'; }); note('cancelled', e.title + ' was cancelled', e.id); } }
    if (o.t === 'editEvent') { const e = EV.find((x) => x.id === o.id); if (e) { Object.assign(e, o.patch); note('updated', e.title + ' was updated', e.id); } }
    if (o.t === 'checkin') { if (o.on) CK[o.ev + '|' + o.pid] = o.time || NOW.time; else CK[o.ev + '|' + o.pid] = null; }
    if (o.t === 'role') { const u = UU.find((x) => x.id === o.uid); if (u) { u.role = o.role; note('updated', u.name + ' is now ' + Q.ROLES.find((r) => r.id === o.role).name.toLowerCase(), null); } }
    if (o.t === 'ustatus') { const u = UU.find((x) => x.id === o.uid); if (u) u.status = o.status; }
    if (o.t === 'invite') { UU.push({ id: o.id, name: o.name, email: o.email, type: o.type, role: o.role, group: o.group, status: 'invited', initials: o.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() }); note('participant', 'You invited ' + o.name, null); }
    if (o.t === 'rsvp') { const e = EV.find((x) => x.id === o.ev); if (e && !RSVP[o.ev]) { RSVP[o.ev] = e.attendees >= e.capacity ? 'wait' : 'going'; if (RSVP[o.ev] === 'going') e.attendees++; else e.waitlist++; } }
    if (o.t === 'req') {
      const g = group(o.group);
      EV.push({ id: o.id, title: o.title, cat: o.cat || 'community', group: o.group, organizer: g.name, owner: ME, space: o.space, date: o.date,
        periods: o.periods.slice(), status: 'pending', public: !!o.public, capacity: o.people, attendees: 0, checkedIn: 0, waitlist: 0, desc: o.notes || '', createdAt: TODAY, mine: true });
      o.periods.forEach((p, i) => RQ.push({ id: o.id + '-' + i, eventId: o.id, space: o.space, date: o.date, period: p, requester: ME, group: o.group, title: o.title, status: 'pending', people: o.people, createdAt: TODAY, mine: true }));
      NT.unshift({ id: 'n-' + o.id, kind: 'request', at: TODAY + 'T' + NOW.time, text: 'You asked for ' + space(o.space).name + ' on ' + fShort(o.date) + ', ' + pRange(o.periods).label, ref: o.id, unread: true });
    }
    if (o.t === 'cancelReq') {
      const e = EV.find((x) => x.id === o.id); if (e) e.status = 'withdrawn';
      RQ.forEach((r) => { if (r.eventId === o.id) r.status = 'withdrawn'; });
      NT.unshift({ id: 'n-c-' + o.id, kind: 'cancelled', at: TODAY + 'T' + NOW.time, text: 'You withdrew your request for ' + (e ? e.title : 'a booking'), ref: null, unread: false });
    }
  }
  function index() {
    slotIx = new Map();
    const at = (k) => { if (!slotIx.has(k)) slotIx.set(k, { ev: null, pend: [] }); return slotIx.get(k); };
    EV.forEach((e) => { if (e.status === 'published') e.periods.forEach((p) => { at(e.space + '|' + e.date + '|' + p).ev = e; }); });
    RQ.forEach((r) => { if (r.status === 'pending') at(r.space + '|' + r.date + '|' + r.period).pend.push(r); });
  }
  const PFIRST = ['Ana', 'Bruno', 'Chloe', 'Diego', 'Elif', 'Farah', 'Gil', 'Hana', 'Ivo', 'Julia', 'Kofi', 'Luz', 'Mateo', 'Nora', 'Otto', 'Paula', 'Rui', 'Sofia', 'Tariq', 'Uma', 'Vera', 'Wen', 'Ximena', 'Yusuf', 'Zara', 'Leo', 'Mia', 'Joel', 'Ines', 'Amir'];
  const PLAST = ['Silva', 'Mendes', 'Okoro', 'Berg', 'Rocha', 'Ahmed', 'Lund', 'Pires', 'Castro', 'Ueda', 'Morales', 'Novak', 'Reis', 'Sousa', 'Kim', 'Barros', 'Holm', 'Vidal', 'Nunes', 'Farias'];
  const PTYPES = ['student', 'student', 'student', 'teacher', 'athletic', 'community'];
  const pcache = {};
  function participants(e) {
    if (!pcache[e.id] || pcache[e.id].n !== e.attendees + '|' + e.waitlist) {
      let h = 0; for (const c of e.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
      const r = () => { h = (h * 1103515245 + 12345) >>> 0; return (h >>> 8) / 16777216; };
      const n = Math.min(e.attendees, 180), list = [];
      for (let i = 0; i < n + Math.min(e.waitlist, 20); i++) {
        const name = PFIRST[Math.floor(r() * PFIRST.length)] + ' ' + PLAST[Math.floor(r() * PLAST.length)];
        const wait = i >= n;
        const past = e.date < TODAY;
        const st = wait ? 'waitlist' : r() < 0.78 ? 'confirmed' : 'registered';
        const checked = !wait && past && i < e.checkedIn;
        const p = per(e.periods[0]); const mm = Math.max(0, Number(p.from.slice(3)) - 10 + Math.floor(r() * 25));
        list.push({ id: 'p' + i, name, initials: name.split(' ').map((w) => w[0]).join(''), type: PTYPES[Math.floor(r() * PTYPES.length)], status: st,
          base: checked ? p.from.slice(0, 2) + ':' + String(mm % 60).padStart(2, '0') : null });
      }
      pcache[e.id] = { n: e.attendees + '|' + e.waitlist, list };
    }
    return pcache[e.id].list.map((p) => { const k = e.id + '|' + p.id; const ck = k in CK ? CK[k] : p.base; return Object.assign({}, p, { checkedAt: ck || null }); });
  }
  const isPast = (date, p) => date < TODAY || (date === TODAY && pIdx(p) <= NOW.period);
  function slot(sp, date, p) {
    const s = space(sp);
    if (s.closedDow.includes(D.dow(date))) return { st: 'closed' };
    const x = slotIx.get(sp + '|' + date + '|' + p) || { ev: null, pend: [] };
    const past = isPast(date, p);
    if (x.ev) return { st: 'booked', ev: x.ev, past };
    if (x.pend.length) return { st: x.pend.some((r) => r.requester === ME && r.mine) ? 'mine' : 'pending', pend: x.pend, past };
    return { st: 'free', past };
  }
  function dispatch(op) { op.id = op.id || ('x' + Date.now().toString(36)); saved.ops.push(op); persist(); applyOp(op); index(); return op; }
  function resetDemo() { saved = { ops: [], authed: true, read: [], prefs: saved.prefs || {} }; persist(); build(); Object.keys(pcache).forEach((k) => delete pcache[k]); }

  // ── view state ─────────────────────────────────────────────
  const S = {
    route: 'login', login: { email: '', pw: '', show: false, err: {}, busy: false }, otp: { code: ['', '', '', '', '', ''], err: false, busy: false }, forgot: { email: '', sent: false, err: '' },
    cal: { view: 'week', date: TODAY, cats: CATEGORIES.map((c) => c.id), sp: 'all', classes: false, open: null, monthOf: TODAY },
    res: { sp: 'court', week: D.weekStart(TODAY), mode: 'space', day: TODAY, sel: null, form: null, err: {}, sent: null },
    pop: null, q: '', toasts: [], nav: false, v: {}
  };
  const AUTH_FREE = ['login', 'forgot', 'verify', 'agenda'];
  const DYN = /^(event|space|agenda)-([A-Za-z0-9-]+)$/;
  const dynOk = (r) => { const m = r.match(DYN); if (!m) return false; return m[1] === 'space' ? !!space(m[2]) : !!EV.find((e) => e.id === m[2] && (m[1] !== 'agenda' || e.public)); };
  const ROUTES = ['login', 'forgot', 'verify', 'dashboard', 'calendar', 'events', 'new-event', 'reservations', 'requests', 'spaces', 'participants', 'analytics', 'users', 'notifications', 'agenda', 'account'];

  function go(r) { if (location.hash !== '#' + r) location.hash = r; else route(); }
  function route() {
    let r = (location.hash || '').slice(1) || (saved.authed ? 'dashboard' : 'login');
    if (!ROUTES.includes(r) && !dynOk(r)) r = saved.authed ? 'dashboard' : 'login';
    if (!saved.authed && !AUTH_FREE.includes(r) && !r.startsWith('agenda-')) r = 'login';
    if (S.route !== r) S.v = {};
    if (saved.authed && (r === 'login' || r === 'verify')) r = 'dashboard';
    S.route = r; S.pop = null; S.nav = false; S.cal.open = S.pendingOpen || null; S.pendingOpen = null;
    render(true);
    window.scrollTo(0, 0);
  }

  // ── toasts and tooltip ─────────────────────────────────────
  function toast(text, action) {
    const id = Math.random().toString(36).slice(2);
    S.toasts.push({ id, text, action });
    renderToasts();
    setTimeout(() => { S.toasts = S.toasts.filter((t) => t.id !== id); renderToasts(); }, 4200);
  }
  function renderToasts() {
    const el = $('#toasts'); if (!el) return;
    el.innerHTML = S.toasts.map((t) => '<div class="toast" role="status">' + ic('circle-check', 's') + '<span>' + esc(t.text) + '</span>' +
      (t.action ? '<a href="#' + t.action.to + '">' + esc(t.action.label) + '</a>' : '') + '</div>').join('');
  }
  let tipEl = null;
  function tip(e) {
    const t = e.target.closest && e.target.closest('[data-tip]');
    if (!t) { if (tipEl) tipEl.remove(), tipEl = null; return; }
    if (!tipEl) { tipEl = document.createElement('div'); tipEl.className = 'tip'; document.body.appendChild(tipEl); }
    const [a, b] = t.getAttribute('data-tip').split('|');
    tipEl.innerHTML = esc(a) + (b ? '<span>' + esc(b) + '</span>' : '');
    const r = t.getBoundingClientRect();
    tipEl.style.left = Math.min(innerWidth - 250, Math.max(8, r.left + r.width / 2 - 110)) + 'px';
    tipEl.style.top = (r.top - tipEl.offsetHeight - 8 < 8 ? r.bottom + 8 : r.top - tipEl.offsetHeight - 8) + 'px';
  }

  // ── shell ─────────────────────────────────────────────────
  const pendingGroups = () => [...new Set(RQ.filter((r) => r.status === 'pending').map((r) => r.eventId))];
  function shell(content) {
    const unread = NT.filter((n) => n.unread).length;
    const nav = [
      ['dashboard', 'layout-dashboard', 'Overview'], ['calendar', 'calendar', 'Calendar'], ['events', 'ticket', 'Events'],
      ['reservations', 'building-stadium', 'Reservations'], ['requests', 'inbox', 'Requests', pendingGroups().length], ['spaces', 'layout-grid', 'Spaces'],
      ['participants', 'user-check', 'Participants'], ['analytics', 'chart-bar', 'Analytics']
    ];
    const admin = [['users', 'user-shield', 'Users and roles'], ['notifications', 'bell', 'Notifications', unread || ''], ['account', 'settings', 'Settings']];
    const cur = S.route.startsWith('event-') || S.route === 'new-event' ? 'events' : S.route.startsWith('space-') ? 'spaces' : S.route;
    const li = ([r, i, l, b]) => '<a href="#' + r + '"' + (cur === r ? ' aria-current="page"' : '') + '>' + ic(i) + '<span>' + l + '</span>' + (b ? '<span class="badge">' + b + '</span>' : '') + '</a>';
    const me = user(ME);
    return '<div class="app">' +
      '<aside class="side' + (S.nav ? ' open' : '') + '" aria-label="Main">' +
        '<a class="wordmark" href="#dashboard"><span class="mark"><i></i><i></i><i></i><i></i></span>quadra</a>' +
        '<button class="ws" type="button" data-act="ws"><span class="wl">V</span><span><b>' + Q.WORKSPACE.name + '</b><span>5 spaces · 48 people</span></span>' + ic('chevron-down', 's') + '</button>' +
        '<nav class="nav" aria-label="Sections">' + nav.map(li).join('') + '<div class="grp">Admin</div>' + admin.map(li).join('') + '</nav>' +
        '<div class="bottom"><div class="pubcard"><b>Public agenda</b><span>What visitors see, no sign-in needed.</span><a class="btn lime" href="#agenda">Open agenda ' + ic('arrow-up-right', 's') + '</a></div>' +
        '<a class="me" href="#account"><span class="avatar">' + me.initials + '</span><span><b>' + me.name + '</b><span>Super administrator</span></span></a></div>' +
      '</aside>' +
      '<div class="main"><header class="top">' +
        '<button class="btn icon ghost mtop" type="button" data-act="nav" aria-label="Open menu">' + ic('menu-2') + '</button>' +
        '<div class="search"><label class="sr" for="q">Search events and spaces</label>' + ic('search') + '<input id="q" type="search" placeholder="Search events, spaces, people" autocomplete="off" value="' + esc(S.q) + '"><span class="kbd">/</span><div id="qres"></div></div>' +
        '<div class="today"><span class="dn">' + day(TODAY) + '</span><span><b>' + DOW[D.dow(TODAY)] + '</b><span>' + mon(TODAY) + ' · ' + NOW.time + '</span></span></div>' +
        '<button class="btn icon bell" type="button" data-act="bell" aria-label="Notifications' + (unread ? ', ' + unread + ' unread' : '') + '" aria-expanded="' + (S.pop === 'bell') + '">' + ic('bell') + (unread ? '<span class="pip"></span>' : '') + '</button>' +
        '<a class="btn dark nb" href="#new-event" aria-label="New event">' + ic('plus', 's') + '<span>New event</span></a>' +
      '</header>' + (S.pop === 'bell' ? bellPop() : '') + '<main class="view" id="main" tabindex="-1">' + content + '</main></div>' +
      (S.nav ? '<div class="scrim" data-act="nav"></div>' : '') + '</div>';
  }
  const noteIcon = { request: 'inbox', conflict: 'alert-triangle', participant: 'user-check', updated: 'refresh', approved: 'circle-check', cancelled: 'circle-x', rejected: 'circle-x' };
  const when = (at) => { const d = at.slice(0, 10), t = at.slice(11, 16); return (d === TODAY ? 'Today' : d === D.add(TODAY, -1) ? 'Yesterday' : fShort(d)) + ' · ' + t; };
  const noteRow = (n) => '<div class="note' + (n.unread ? ' unread' : '') + '"><span class="ni ' + n.kind + '">' + ic(noteIcon[n.kind] || 'info-circle', 's') + '</span><span><span class="t">' + esc(n.text) + '</span><span class="w">' + when(n.at) + '</span></span></div>';
  function bellPop() {
    return '<div class="pop" role="dialog" aria-label="Notifications"><header><b>Notifications</b><button class="btn sm ghost" type="button" data-act="readall">Mark all as read</button></header>' +
      NT.slice(0, 5).map(noteRow).join('') + '<footer><a class="btn sm ghost" href="#notifications">See all activity</a><button class="btn sm ghost" type="button" data-act="bell">Close</button></footer></div>';
  }
  function searchResults() {
    const el = $('#qres'); if (!el) return;
    const q = S.q.trim().toLowerCase();
    if (q.length < 2) { el.innerHTML = ''; return; }
    const evs = []; const seen = new Set();
    EV.filter((e) => e.status !== 'withdrawn' && e.date >= TODAY && e.title.toLowerCase().includes(q)).forEach((e) => { if (!seen.has(e.title) && evs.length < 5) { seen.add(e.title); evs.push(e); } });
    const sps = SPACES.filter((s) => (s.name + ' ' + s.kind).toLowerCase().includes(q)).slice(0, 3);
    el.innerHTML = '<div class="results" role="listbox">' + (evs.length + sps.length ? '' : '<div class="none">Nothing matches “' + esc(S.q) + '”. Try a space or an event name.</div>') +
      evs.map((e) => '<a href="#event-' + e.id + '">' + ic('calendar-event', 's') + esc(e.title) + '<span class="m">' + fShort(e.date) + ' · ' + pRange(e.periods).label + '</span></a>').join('') +
      sps.map((s) => '<a href="#reservations" data-act="pickspace" data-id="' + s.id + '">' + ic('building-stadium', 's') + esc(s.name) + '<span class="m">' + s.kind + '</span></a>').join('') + '</div>';
  }

  // ── auth screens ──────────────────────────────────────────
  function courtArt() {
    const cells = Array.from({ length: 42 }, (_, i) => { const d = i % 7, p = Math.floor(i / 7); const k = ['M1', 'M2', 'A1', 'A2', 'P1', 'P2'][p];
      const s = slot('court', D.add(D.weekStart(TODAY), d), k); return '<i class="cell ' + (s.st === 'mine' ? 'pending' : s.st) + '"></i>'; }).join('');
    const len = (l) => 'style="--len:' + l + '"';
    return '<div class="lart" aria-hidden="true">' +
      '<svg class="court" viewBox="0 0 600 760" preserveAspectRatio="xMidYMid slice">' +
        '<g fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="2.2" stroke-linecap="round">' +
          '<rect class="ln" ' + len(2200) + ' x="70" y="-40" width="460" height="840" rx="4"/>' +
          '<line class="ln" ' + len(500) + ' x1="70" y1="380" x2="530" y2="380"/>' +
          '<circle class="ln" ' + len(500) + ' cx="300" cy="380" r="72"/>' +
          '<path class="ln" ' + len(700) + ' d="M150 -40 A150 150 0 0 0 450 -40"/><path class="ln" ' + len(700) + ' d="M150 800 A150 150 0 0 1 450 800"/>' +
          '<rect class="ln" ' + len(600) + ' x="220" y="-40" width="160" height="150"/><rect class="ln" ' + len(600) + ' x="220" y="650" width="160" height="150"/>' +
        '</g><g fill="none" stroke="#fff" stroke-opacity=".16" stroke-width="1.2">' +
          [120, 190, 260, 330].map((r) => '<circle cx="300" cy="380" r="' + r + '"/>').join('') + '</g>' +
        '<circle cx="300" cy="380" r="5" fill="#C9F24B"/></svg>' +
      '<div class="cap1"><span class="wordmark"><span class="mark inv"><i></i><i></i><i></i><i></i></span>quadra</span><span class="chip">Portfolio demo</span></div>' +
      '<div class="live"><div class="lh"><b style="color:var(--ink)">Court A · this week</b><span>' + day(D.weekStart(TODAY)) + '–' + day(D.add(D.weekStart(TODAY), 6)) + ' Nov</span></div><div class="lg">' + cells + '</div>' +
      '<div class="lf"><span class="chip blue"><span class="d"></span>2 requests</span><span style="color:var(--muted)">for Thu, P2</span></div></div>' +
      '<div class="quote"><h2>Every space, every hour, in one place.</h2><p>Events, rooms and bookings for organizations that share their spaces.</p></div></div>';
  }
  function authShell(form) {
    return '<div class="auth"><div class="authbox in">' + courtArt() + '<div class="form"><div class="inner">' + form + '</div></div></div></div>';
  }
  function viewLogin() {
    const L = S.login, e = L.err;
    return authShell(
      '<div><h1>Welcome back</h1></div><p class="lead">Sign in to run events and spaces at ' + Q.WORKSPACE.name + '.</p>' +
      (e.form ? '<div class="alert bad" role="alert">' + ic('alert-triangle', 's') + '<span>' + e.form + '</span></div>' : '') +
      '<form class="inner" style="gap:16px;max-width:none" data-form="login" novalidate>' +
        '<div class="field"><label for="em">Email</label><input class="inp" id="em" name="email" type="email" autocomplete="username" placeholder="name@valemont.example" value="' + esc(L.email) + '"' + (e.email ? ' aria-invalid="true" aria-describedby="em-e"' : '') + '>' + (e.email ? '<span class="err" id="em-e">' + ic('alert-triangle', 's') + e.email + '</span>' : '') + '</div>' +
        '<div class="field"><label for="pw">Password</label><div class="pw"><input class="inp" id="pw" name="pw" type="' + (L.show ? 'text' : 'password') + '" autocomplete="current-password" value="' + esc(L.pw) + '"' + (e.pw ? ' aria-invalid="true" aria-describedby="pw-e"' : '') + '><button type="button" data-act="showpw" aria-label="' + (L.show ? 'Hide' : 'Show') + ' password">' + ic(L.show ? 'eye-off' : 'eye', 's') + '</button></div>' + (e.pw ? '<span class="err" id="pw-e">' + ic('alert-triangle', 's') + e.pw + '</span>' : '') + '</div>' +
        '<div class="row"><label class="chk"><input type="checkbox" checked> Keep me signed in</label><a class="link" href="#forgot">Forgot password?</a></div>' +
        '<button class="btn dark full" type="submit"' + (L.busy ? ' disabled' : '') + '>' + (L.busy ? '<span class="spin"></span>Signing in' : 'Sign in') + '</button>' +
      '</form>' +
      '<div class="or">or</div>' +
      '<button class="btn lime full" type="button" data-act="demo">' + ic('sparkles', 's') + 'Explore with the demo account</button>' +
      '<div class="demo-note">' + ic('info-circle', 's') + '<span>This is a portfolio demo. There are no real accounts: the demo account fills itself in, and nothing you do leaves this browser.</span></div>' +
      '<p class="legal">Looking for what’s on? <a class="link" href="#agenda">Open the public agenda</a></p>');
  }
  function viewVerify() {
    const O = S.otp;
    return authShell(
      '<a class="link" href="#login" data-act="logout" style="display:inline-flex;align-items:center;gap:6px;font-size:13px">' + ic('arrow-left', 's') + 'Back to sign in</a>' +
      '<div><h1>Two-step verification</h1></div><p class="lead">Enter the 6-digit code from your authenticator app for j••••@valemont.example.</p>' +
      '<form class="inner" style="gap:16px;max-width:none" data-form="otp" novalidate><div class="otp' + (O.err ? ' bad' : '') + '" role="group" aria-label="Verification code">' +
        O.code.map((c, i) => '<input inputmode="numeric" maxlength="1" aria-label="Digit ' + (i + 1) + '" data-otp="' + i + '" value="' + esc(c) + '"' + (O.err ? ' aria-invalid="true"' : '') + '>').join('') + '</div>' +
        (O.err ? '<span class="err" role="alert" style="display:flex;gap:6px;color:var(--danger);font-size:12.5px">' + ic('alert-triangle', 's') + 'That code didn’t work. Check the app and try again.</span>' : '') +
        '<button class="btn dark full" type="submit"' + (O.busy ? ' disabled' : '') + '>' + (O.busy ? '<span class="spin"></span>Verifying' : 'Verify and continue') + '</button></form>' +
      '<div class="demo-note">' + ic('info-circle', 's') + '<span>Demo code: <b class="mono">246810</b>. <button class="link" type="button" data-act="fillotp" style="color:var(--lime-ink);text-decoration:underline">Fill it in for me</button></span></div>' +
      '<p class="legal">Two-step verification was a requirement discussed in the original project. Here it is a simulation.</p>');
  }
  function viewForgot() {
    const F = S.forgot;
    return authShell(F.sent ?
      '<span class="chip ok" style="align-self:flex-start"><span class="d"></span>Link on its way</span><div><h1>Check your inbox</h1></div><p class="lead">If an account exists for <b>' + esc(F.email) + '</b>, a link to reset the password is on its way. It works for 30 minutes.</p>' +
      '<div class="demo-note">' + ic('info-circle', 's') + '<span>In this demo no email is sent.</span></div><a class="btn dark full" href="#login">Back to sign in</a>'
      :
      '<a class="link" href="#login" style="display:inline-flex;align-items:center;gap:6px;font-size:13px">' + ic('arrow-left', 's') + 'Back to sign in</a>' +
      '<div><h1>Reset your password</h1></div><p class="lead">Enter the email you sign in with and we’ll send you a link.</p>' +
      '<form class="inner" style="gap:16px;max-width:none" data-form="forgot" novalidate><div class="field"><label for="fe">Email</label><input class="inp" id="fe" name="email" type="email" value="' + esc(F.email) + '"' + (F.err ? ' aria-invalid="true"' : '') + '>' + (F.err ? '<span class="err">' + ic('alert-triangle', 's') + F.err + '</span>' : '') + '</div>' +
      '<button class="btn dark full" type="submit">Send reset link</button></form>');
  }

  // ── dashboard ─────────────────────────────────────────────
  const WEEK = () => Array.from({ length: 7 }, (_, i) => D.add(D.weekStart(TODAY), i));
  function occupancy(sp, days) {
    let b = 0, t = 0;
    days.forEach((d) => PERIODS.forEach((p) => { const s = slot(sp, d, p.id); if (s.st === 'closed') return; t++; if (s.st === 'booked') b++; }));
    return { b, t, pc: t ? Math.round(b / t * 100) : 0 };
  }
  function byPeriod(week) {
    const rows = PERIODS.map((p) => { let b = 0, t = 0; week.forEach((d) => SPACES.forEach((s) => { const x = slot(s.id, d, p.id); if (x.st === 'closed') return; t++; if (x.st === 'booked') b++; })); return { p, pc: Math.round(b / t * 100) }; });
    const top = rows.slice().sort((a, b) => b.pc - a.pc)[0];
    return '<div class="byp"><span class="bl">By period<b>' + top.p.id + ' is the busiest</b></span>' + rows.map((r) => '<div class="bp' + (r === top ? ' hot' : '') + '"><span class="mono">' + r.p.id + '</span><span class="bar"><i style="width:' + r.pc + '%"></i></span><b class="num">' + r.pc + '%</b></div>').join('') + '</div>';
  }
  function viewDashboard() {
    const week = WEEK(), last = week.map((d) => D.add(d, -7));
    const evWeek = EV.filter((e) => e.status === 'published' && e.date >= week[0] && e.date <= week[6]);
    const perDay = week.map((d) => evWeek.filter((e) => e.date === d).length);
    const pg = pendingGroups();
    const conflictSlots = [...slotIx.values()].filter((x) => x.pend.length > 1 || (x.pend.length && x.ev));
    let booked = 0, bookedLast = 0;
    SPACES.forEach((s) => { booked += occupancy(s.id, week).b; bookedLast += occupancy(s.id, last).b; });
    const nowP = PERIODS[NOW.period].id;
    const freeNow = SPACES.map((s) => slot(s.id, TODAY, nowP));
    const freeN = freeNow.filter((s) => s.st === 'free' || s.st === 'pending').length;
    const tot = SPACES.reduce((a, s) => { const o = occupancy(s.id, week); a.b += o.b; a.t += o.t; return a; }, { b: 0, t: 0 });
    const maxPD = Math.max.apply(null, perDay.concat([1]));
    const kpis = '<section class="card kpi c3"><div class="lab">Events this week' + ic('calendar-event', 's') + '</div><div class="val num">' + evWeek.length + '</div>' +
        '<div class="foot"><span>Busiest: ' + DOW[perDay.indexOf(Math.max.apply(null, perDay))] + '</span><div><div class="bars">' + perDay.map((n, i) => '<i class="' + (week[i] === TODAY ? 'today' : n ? 'on' : '') + '" style="height:' + Math.max(4, Math.round(n / maxPD * 38)) + 'px" data-tip="' + fShort(week[i]) + '|' + n + ' events"></i>').join('') + '</div><div class="bars lbl">' + 'MTWTFSS'.split('').map((l) => '<b>' + l + '</b>').join('') + '</div></div></div></section>' +
      '<a class="card kpi blue c3" href="#requests"><div class="lab">Waiting for a decision' + ic('inbox', 's') + '</div><div class="val num">' + pg.length + '<small>requests</small></div>' +
        '<div class="foot"><span>' + (conflictSlots.length ? conflictSlots.length + ' slot' + (conflictSlots.length > 1 ? 's have' : ' has') + ' more than one request' : 'No competing requests') + '</span>' + ic('arrow-up-right', 's') + '</div></a>' +
      '<section class="card kpi c3"><div class="lab">Bookings confirmed' + ic('circle-check', 's') + '</div><div class="val num">' + booked + '<small>of ' + tot.t + ' periods</small></div>' +
        '<div class="foot"><span>' + Math.round(booked / tot.t * 100) + '% of the week</span><span class="chip">Court A · ' + occupancy('court', week).pc + '%</span></div></section>' +
      '<section class="card kpi c3"><div class="lab">Free right now' + ic('door-enter', 's') + '</div><div class="val num">' + freeN + '<small>of ' + SPACES.length + ' spaces</small></div>' +
        '<div class="foot"><div class="spaces5">' + freeNow.map((s, i) => '<i class="cell ' + (s.st === 'free' || s.st === 'pending' ? 'free' : s.st) + '" data-tip="' + SPACES[i].name + '|' + (s.st === 'booked' ? s.ev.title : 'Free until ' + per(nowP).to) + '"></i>').join('') + '</div><span class="mono">now: ' + nowP + '</span></div></section>';

    let n = 0;
    const occ = '<section class="card c8" aria-labelledby="h-occ"><div class="ch"><h2 id="h-occ">Occupancy this week <span class="sub">' + day(week[0]) + '–' + day(week[6]) + ' ' + mon(week[0]) + ' · six periods a day</span></h2>' +
      '<div class="occtot"><b class="num">' + Math.round(tot.b / tot.t * 100) + '%</b><span class="sub" style="font-size:12px;color:var(--muted)">of open periods booked</span></div></div>' +
      '<div class="occ' + (reduce ? '' : ' anim') + '"><span class="lh"></span><div class="hd">' + week.map((d) => '<b class="' + (d === TODAY ? 'td' : '') + '">' + DOW[D.dow(d)].slice(0, 3) + ' ' + day(d) + '</b>').join('') + '</div><span class="lh"></span>' +
      SPACES.map((s) => { const o = occupancy(s.id, week);
        return '<div class="sp">' + s.name + '<small>' + s.kind + '</small></div><div class="row">' + week.map((d) => '<div class="day' + (d === TODAY ? ' td' : '') + '">' + PERIODS.map((p) => { const x = slot(s.id, d, p.id);
          const c = x.st === 'mine' ? 'mine' : x.st; const now = d === TODAY && pIdx(p.id) === NOW.period;
          const tipT = s.name + ' · ' + fShort(d) + ' · ' + p.id + '|' + (x.st === 'booked' ? x.ev.title : x.st === 'closed' ? 'Closed' : x.st === 'free' ? 'Free' : x.pend.length + ' pending request' + (x.pend.length > 1 ? 's' : ''));
          return '<i class="cell ' + c + (now ? ' now' : '') + '" style="--i:' + (n++) + '" data-tip="' + esc(tipT) + '" data-act="toslot" data-sp="' + s.id + '" data-d="' + d + '" data-p="' + p.id + '"></i>'; }).join('') + '</div>').join('') + '</div><div class="pc">' + o.pc + '%</div>'; }).join('') +
      '</div>' + byPeriod(week) + '<div class="legend" style="margin-top:16px"><span><i class="cell booked"></i>Booked</span><span><i class="cell pending"></i>Requested</span><span><i class="cell"></i>Free</span><span><i class="cell closed"></i>Closed</span><span style="margin-left:auto">Click a period to book it</span></div></section>';

    const pend = pg.map((id) => EV.find((e) => e.id === id)).filter(Boolean).sort((a, b) => (a.date + a.periods[0]).localeCompare(b.date + b.periods[0]));
    const att = '<section class="card c4" aria-labelledby="h-att"><div class="ch"><h2 id="h-att">Needs attention</h2><a class="btn sm ghost" href="#requests">All requests ' + ic('arrow-right', 's') + '</a></div><div class="att">' +
      pend.slice(0, 5).map((e) => { const c = cat(e.cat); const comp = e.periods.some((p) => { const x = slotIx.get(e.space + '|' + e.date + '|' + p); return x && (x.pend.length > 1 || x.ev); });
        return '<a href="#requests" data-act="openreq" data-id="' + e.id + '"><span class="gi" style="background:' + c.soft + ';color:' + c.ink + '">' + initials(e.organizer) + '</span><span><b>' + esc(e.title) + '</b><span class="m">' + space(e.space).name + ' · ' + fShort(e.date) + ' · ' + pRange(e.periods).label + '</span></span>' +
          (comp ? '<span class="chip warn">Conflict</span>' : e.mine ? '<span class="chip blue">Yours</span>' : '<span class="chip">' + D.diff(TODAY, e.date) + 'd</span>') + '</a>'; }).join('') +
      '<div class="it"><span class="gi" style="background:var(--lime-soft);color:var(--lime-ink)">' + ic('users', 's') + '</span><span><b>Futsal Cup is full</b><span class="m">9 people on the waitlist · Sat 21 Nov</span></span><span class="chip lime">Waitlist</span></div></div></section>';

    const tl = '<section class="card c8" aria-labelledby="h-tl"><div class="ch"><h2 id="h-tl">Today <span class="sub">' + fLong(TODAY) + '</span></h2><a class="btn sm ghost" href="#calendar">Open calendar ' + ic('arrow-right', 's') + '</a></div><div class="tl"><span></span>' +
      PERIODS.map((p, i) => '<div class="h' + (i === NOW.period ? ' now' : '') + '"><b>' + p.id + '</b>' + p.from + (i === NOW.period ? ' · now' : '') + '</div>').join('') +
      SPACES.map((s) => '<div class="sp">' + s.name + '</div>' + PERIODS.map((p, i) => { const x = slot(s.id, TODAY, p.id);
        if (x.st === 'booked') { const c = cat(x.ev.cat); return '<div class="ev" style="background:' + c.soft + ';color:' + c.ink + (i === NOW.period ? ';box-shadow:inset 0 0 0 1.5px ' + c.color : '') + '" data-act="openev" data-id="' + x.ev.id + '" data-tip="' + esc(x.ev.title) + '|' + esc(x.ev.organizer) + '"><b>' + esc(x.ev.title) + '</b><span>' + esc(x.ev.organizer) + '</span></div>'; }
        return '<div class="slot' + (i === NOW.period ? ' now' : '') + '"' + (x.st === 'closed' ? ' style="background:transparent;box-shadow:inset 0 0 0 1px var(--line)"' : '') + '></div>'; }).join('')).join('') + '</div></section>';

    const ups = EV.filter((e) => e.status === 'published' && e.public && !e.series && e.date > TODAY).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5);
    const up = '<section class="card c4" aria-labelledby="h-up"><div class="ch"><h2 id="h-up">Coming up</h2><a class="btn sm ghost" href="#agenda">Public agenda ' + ic('arrow-up-right', 's') + '</a></div><div class="up">' +
      ups.map((e) => '<a href="#calendar" data-act="openev" data-id="' + e.id + '"><span class="datet"><i>' + mon(e.date).slice(0, 3).toUpperCase() + '</i><b>' + day(e.date) + '</b></span><span><b class="t">' + esc(e.title) + '</b><span class="m">' + space(e.space).name + ' · ' + pRange(e.periods).time + ' · ' + e.attendees + ' going</span></span></a>').join('') + '</div></section>';

    const feed = '<section class="card c12" aria-labelledby="h-feed"><div class="ch"><h2 id="h-feed">Recent activity</h2><a class="btn sm ghost" href="#notifications">All activity ' + ic('arrow-right', 's') + '</a></div><div class="feed" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));column-gap:28px">' + NT.slice(0, 6).map(noteRow).join('') + '</div></section>';

    const h = new Date('2026-11-16T' + NOW.time).getHours();
    return '<div class="hello"><div><h1>Good ' + (h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening') + ', Jordan<em>.</em></h1><p>' + fLong(TODAY) + ' · week ' + 47 + '. ' + pg.length + ' requests are waiting, and Court A is the busiest space this week.</p></div>' +
      '<div class="acts" style="display:flex;gap:8px"><a class="btn" href="#reservations">' + ic('building-stadium', 's') + 'Book a space</a><a class="btn blue" href="#requests">' + ic('inbox', 's') + 'Review requests</a></div></div>' +
      '<div class="grid in">' + kpis + occ + att + tl + up + feed + '</div>';
  }

  // ── calendar ──────────────────────────────────────────────
  const isClass = (e) => e.series && !e.public;
  function calEvents() {
    const C = S.cal;
    return EV.filter((e) => e.status !== 'withdrawn' && C.cats.includes(e.cat) && (C.sp === 'all' || e.space === C.sp) && (C.classes || !isClass(e)));
  }
  function evChip(e, opts) {
    const c = cat(e.cat), cls = e.status === 'pending' ? ' pending' : e.status === 'cancelled' ? ' cancelled' : isClass(e) ? ' cls' : '';
    const sel = S.cal.open === e.id ? ' sel' : '';
    return '<button type="button" class="ev' + cls + sel + '" style="' + evVars(c) + '" data-act="openev" data-id="' + e.id + '" aria-label="' + esc(e.title + ', ' + fShort(e.date) + ', ' + pRange(e.periods).label + ', ' + space(e.space).name + (e.status !== 'published' ? ', ' + e.status : '')) + '">' +
      '<b>' + (e.status === 'pending' ? '◌ ' : '') + esc(e.title) + '</b>' + (opts && opts.short ? '' : '<span>' + space(e.space).name + (e.periods.length > 1 ? ' · ' + pRange(e.periods).label : '') + '</span>') + '</button>';
  }
  function miniMonth(of, selWeek) {
    const first = of.slice(0, 8) + '01', start = D.weekStart(first);
    const evDays = new Set(calEvents().filter((e) => e.status === 'published').map((e) => e.date));
    let rows = '';
    for (let w = 0; w < 6; w++) {
      rows += '<tr>' + Array.from({ length: 7 }, (_, i) => { const d = D.add(start, w * 7 + i);
        const cls = [D.month(d) !== D.month(of) ? 'out' : '', d === TODAY ? 'td' : '', selWeek && D.weekStart(d) === D.weekStart(S.cal.date) && d !== TODAY ? 'wk' : '', evDays.has(d) ? 'has' : ''].join(' ');
        return '<td><button type="button" class="' + cls + '" data-act="calday" data-d="' + d + '" aria-label="' + fLong(d) + '"' + (d === S.cal.date ? ' aria-current="date"' : '') + '>' + day(d) + '</button></td>'; }).join('') + '</tr>';
      if (D.month(D.add(start, w * 7 + 7)) !== D.month(of) && D.add(start, w * 7 + 7) > of) break;
    }
    return '<div class="mini"><div class="mh"><button class="btn sm icon ghost" type="button" data-act="minimon" data-n="-1" aria-label="Previous month">' + ic('chevron-left', 's') + '</button>' + mon(of) + ' ' + of.slice(0, 4) +
      '<button class="btn sm icon ghost" type="button" data-act="minimon" data-n="1" aria-label="Next month">' + ic('chevron-right', 's') + '</button></div><table><thead><tr>' + 'MTWTFSS'.split('').map((l) => '<th scope="col">' + l + '</th>').join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }
  function viewCalendar() {
    const C = S.cal, evs = calEvents();
    const ws = D.weekStart(C.date), days = Array.from({ length: 7 }, (_, i) => D.add(ws, i));
    const inWeek = EV.filter((e) => e.date >= ws && e.date <= days[6] && e.status !== 'withdrawn' && (C.sp === 'all' || e.space === C.sp) && (C.classes || !isClass(e)));
    const rail = '<aside class="rail"><section class="card">' + miniMonth(C.monthOf, C.view === 'week') + '</section>' +
      '<section class="card"><div class="ch" style="margin-bottom:8px"><h2>Categories</h2><span class="sub">this week</span></div><div class="flist">' +
        CATEGORIES.map((c) => { const on = C.cats.includes(c.id); return '<button type="button" aria-pressed="' + on + '" data-act="tcat" data-id="' + c.id + '"><span class="sw" style="background:' + c.color + '">' + ic('check') + '</span>' + c.name + '<span class="n">' + inWeek.filter((e) => e.cat === c.id).length + '</span></button>'; }).join('') +
      '</div><div class="ch" style="margin:14px 0 8px"><h2>Spaces</h2></div><div class="flist">' +
        [{ id: 'all', name: 'All spaces' }].concat(SPACES).map((s) => '<button type="button" aria-pressed="' + (C.sp === s.id) + '" data-act="tsp" data-id="' + s.id + '"><span class="sw" style="background:var(--ink);border-radius:50%">' + ic('check') + '</span>' + s.name + '</button>').join('') +
      '</div><label class="chk" style="margin-top:12px;font-size:13px"><input type="checkbox" data-act="tclasses"' + (C.classes ? ' checked' : '') + '> Show classes and courses</label></section></aside>';
    const label = C.view === 'week' ? (D.month(ws) === D.month(days[6]) ? day(ws) + '–' + day(days[6]) + ' ' + mon(ws) : day(ws) + ' ' + mon(ws).slice(0, 3) + ' – ' + day(days[6]) + ' ' + mon(days[6]).slice(0, 3)) + ' ' + ws.slice(0, 4) : mon(C.date) + ' ' + C.date.slice(0, 4);
    const bar = '<div class="calbar"><h2>' + label + '</h2><div class="seg" role="group" aria-label="View"><button type="button" aria-pressed="' + (C.view === 'month') + '" data-act="cview" data-v="month">Month</button><button type="button" aria-pressed="' + (C.view === 'week') + '" data-act="cview" data-v="week">Week</button></div><span class="sp"></span>' +
      '<button class="btn icon" type="button" data-act="cnav" data-n="-1" aria-label="Previous">' + ic('chevron-left', 's') + '</button><button class="btn" type="button" data-act="ctoday">Today</button><button class="btn icon" type="button" data-act="cnav" data-n="1" aria-label="Next">' + ic('chevron-right', 's') + '</button></div>';
    let grid;
    if (C.view === 'week' && narrow()) {
      grid = '<div class="agenda">' + days.map((d) => { const list = evs.filter((e) => e.date === d).sort((a, b) => pIdx(a.periods[0]) - pIdx(b.periods[0]));
        return '<section class="ad' + (d === TODAY ? ' td' : '') + '"><h3><b>' + day(d) + '</b>' + DOW[D.dow(d)] + (d === TODAY ? '<span class="chip lime">Today</span>' : '') + '</h3>' +
          (list.length ? list.map((e) => '<div class="ar"><span class="mono">' + pRange(e.periods).label + '<small>' + per(e.periods[0]).from + '</small></span>' + evChip(e) + '</div>').join('') : '<p class="empty">Nothing booked</p>') + '</section>'; }).join('') + '</div>';
    } else if (C.view === 'week') {
      grid = '<div class="week" role="grid" aria-label="Week of ' + fLong(ws) + '"><div class="corner"></div>' + days.map((d) => '<div class="dh' + (d === TODAY ? ' td' : '') + '" role="columnheader"><span>' + DOW[D.dow(d)].slice(0, 3) + '</span><b>' + day(d) + '</b></div>').join('') +
        PERIODS.map((p, pi) => '<div class="ph' + (ws === D.weekStart(TODAY) && pi === NOW.period ? ' now' : '') + (pi === PERIODS.length - 1 ? ' last' : '') + '" role="rowheader"><b>' + p.id + '</b>' + p.from + '<br>' + p.to + '</div>' +
          days.map((d) => { const list = evs.filter((e) => e.date === d && e.periods.includes(p.id)).sort((a, b) => (a.status === 'pending') - (b.status === 'pending'));
            const nowc = d === TODAY && pi === NOW.period;
            return '<div class="wc' + (d === TODAY ? ' td' : '') + (nowc ? ' nowc' : '') + (pi === PERIODS.length - 1 ? ' last' : '') + '" role="gridcell">' + list.slice(0, 3).map((e) => evChip(e)).join('') + (list.length > 3 ? '<button type="button" class="more" data-act="cday" data-d="' + d + '">+' + (list.length - 3) + ' more</button>' : '') + '</div>'; }).join('')).join('') + '</div>';
    } else {
      const first = C.date.slice(0, 8) + '01', start = D.weekStart(first);
      const dim = new Date(Date.UTC(+first.slice(0, 4), +first.slice(5, 7), 0)).getUTCDate();
      const weeks = Math.ceil((D.dow(first) + dim) / 7);
      grid = '<div class="month" role="grid">' + DOW.map((w) => '<div class="mh" role="columnheader">' + w.slice(0, 3) + '</div>').join('') +
        Array.from({ length: weeks * 7 }, (_, i) => { const d = D.add(start, i); const list = evs.filter((e) => e.date === d).sort((a, b) => pIdx(a.periods[0]) - pIdx(b.periods[0]));
          return '<div class="md' + (D.month(d) !== D.month(C.date) ? ' out' : '') + (d === TODAY ? ' td' : '') + '" role="gridcell" data-act="cday" data-d="' + d + '"><span class="n">' + day(d) + '</span>' + list.slice(0, 3).map((e) => evChip(e, { short: true })).join('') + (list.length > 3 ? '<span class="more">+' + (list.length - 3) + ' more</span>' : '') + '</div>'; }).join('') + '</div>';
    }
    return '<div class="vh"><div><h1>Calendar</h1><p>Everything booked across ' + SPACES.length + ' spaces. Dashed blocks are still waiting for approval.</p></div><div class="acts"><a class="btn" href="#reservations">' + ic('building-stadium', 's') + 'Check availability</a><a class="btn dark" href="#new-event">' + ic('plus', 's') + 'New event</a></div></div>' +
      '<div class="calw in">' + rail + '<div>' + bar + grid + '<div class="legend" style="margin-top:12px">' + CATEGORIES.map((c) => '<span><i class="cell" style="background:' + c.color + ';box-shadow:none"></i>' + c.name + '</span>').join('') + '<span><i class="cell pending"></i>Waiting for approval</span>' + (C.classes ? '<span><i class="cell closed"></i>Class or course</span>' : '') + '</div></div></div>' +
      (C.open ? drawer(EV.find((e) => e.id === C.open)) : '');
  }
  function drawer(e) {
    if (!e) return '';
    const c = cat(e.cat), sp = space(e.space), r = pRange(e.periods);
    const st = { published: ['ok', 'Confirmed'], pending: ['blue', 'Waiting for approval'], cancelled: ['bad', 'Cancelled'] }[e.status] || ['', e.status];
    const people = USERS.filter((u) => u.group === e.group).slice(0, 5);
    const goingPc = Math.min(100, Math.round(e.attendees / e.capacity * 100));
    return '<div class="scrim" data-act="closeev"></div><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="dr-t">' +
      '<div class="cover">' + A.cover(e.cat) + '<button class="btn icon x" type="button" data-act="closeev" aria-label="Close">' + ic('x') + '</button><span class="chip"><span class="d" style="color:' + c.color + '"></span>' + c.name + '</span></div>' +
      '<div class="body"><div><span class="chip ' + st[0] + '">' + st[1] + '</span><h2 id="dr-t" style="margin-top:10px">' + esc(e.title) + '</h2></div>' +
      '<div class="facts">' + ic('calendar') + '<div>' + fLong(e.date) + '<span>' + (e.status === 'cancelled' ? esc(e.cancelReason || '') : D.diff(TODAY, e.date) > 0 ? 'In ' + D.diff(TODAY, e.date) + ' days' : D.diff(TODAY, e.date) === 0 ? 'Today' : D.diff(e.date, TODAY) + ' days ago') + '</span></div>' +
        ic('clock') + '<div><span class="mono" style="font-size:13.5px;color:var(--ink)">' + r.label + ' · ' + r.time + '</span><span>' + e.periods.length + ' period' + (e.periods.length > 1 ? 's' : '') + '</span></div>' +
        ic('map-pin') + '<div>' + sp.name + '<span>' + sp.kind + ' · ' + sp.floor + '</span></div>' +
        ic('users') + '<div>' + esc(e.organizer) + '<span>Organizer · ' + (e.public ? 'on the public agenda' : 'members only') + '</span></div></div>' +
      (e.status === 'pending' ? '' : '<div class="cap"><div class="row"><b style="color:var(--ink);font-size:13.5px">' + e.attendees + ' going</b><span>' + e.capacity + ' places' + (e.waitlist ? ' · ' + e.waitlist + ' waiting' : '') + '</span></div><div class="bar"><i style="width:' + goingPc + '%"></i></div><div class="row"><div class="avatars">' + people.map((u) => '<span class="avatar">' + u.initials + '</span>').join('') + '</div><span>' + (e.date < TODAY && e.checkedIn ? e.checkedIn + ' checked in' : '') + '</span></div></div>') +
      '<p class="d">' + esc(e.desc) + '</p>' +
      (e.status === 'pending' ? '<div class="alert info">' + ic('info-circle', 's') + '<span>The Events Office hasn’t decided on this request yet. Requests are reviewed in the order they arrive.</span></div>' : '') +
      '</div><div class="foot"><a class="btn" href="#reservations" data-act="toslot" data-sp="' + e.space + '" data-d="' + e.date + '" data-p="' + e.periods[0] + '">' + ic('building-stadium', 's') + 'See the slot</a><a class="btn dark" href="#event-' + e.id + '">Open event ' + ic('arrow-right', 's') + '</a></div></aside>';
  }

  // ── reservations ──────────────────────────────────────────
  function slotLabel(x) {
    if (x.st === 'booked') return ['Booked', x.ev.title, x.ev.organizer];
    if (x.st === 'mine') return ['Yours', 'Waiting', ''];
    if (x.st === 'pending') return [x.pend.length + ' request' + (x.pend.length > 1 ? 's' : ''), group(x.pend[0].group).name, ''];
    if (x.st === 'closed') return ['Closed', '', ''];
    return ['Free', x.past ? 'Started' : '', ''];
  }
  function slotBtn(sp, d, p) {
    const x = slot(sp, d, p), [k, t, t2] = slotLabel(x), R = S.res;
    const sel = R.sel && R.sel.sp === sp && R.sel.d === d && R.sel.p === p;
    const aria = space(sp).name + ', ' + fShort(d) + ', ' + p + ' ' + per(p).from + ' to ' + per(p).to + ': ' + k + (t ? ', ' + t : '');
    return '<button type="button" class="sl ' + x.st + (x.past && x.st !== 'closed' ? ' past' : '') + (sel ? ' sel' : '') + '" data-act="pick" data-sp="' + sp + '" data-d="' + d + '" data-p="' + p + '" aria-label="' + esc(aria) + '"' + (sel ? ' aria-pressed="true"' : '') + '>' +
      (x.st === 'booked' ? '<span class="t">' + esc(t) + '</span><span class="t2">' + esc(t2) + '</span>' : '<span class="k">' + k + '</span>' + (t ? '<span class="t2">' + esc(t) + '</span>' : '')) + '</button>';
  }
  function nearestFree(sp, d, p) {
    const out = []; let dd = d, pi = pIdx(p);
    for (let k = 0; k < 60 && out.length < 3; k++) {
      pi++; if (pi >= PERIODS.length) { pi = 0; dd = D.add(dd, 1); }
      const pp = PERIODS[pi].id, x = slot(sp, dd, pp);
      if (x.st === 'free' && !x.past) out.push({ sp, d: dd, p: pp });
    }
    const other = SPACES.filter((s) => s.id !== sp).map((s) => ({ sp: s.id, d, p, x: slot(s.id, d, p) })).filter((o) => o.x.st === 'free' && !o.x.past).slice(0, 2);
    return out.concat(other);
  }
  function panel() {
    const R = S.res;
    if (R.sent) {
      const e = EV.find((x) => x.id === R.sent); const sp = space(e.space);
      return '<aside class="panel" aria-live="polite"><span class="chip blue" style="align-self:flex-start"><span class="d"></span>Waiting for approval</span><h3>Request sent</h3>' +
        '<div class="sum"><div class="w2"><span>What</span><b>' + esc(e.title) + '</b></div><div><span>Where</span><b>' + sp.name + '</b></div><div><span>When</span><b>' + fShort(e.date) + ' · ' + pRange(e.periods).label + '</b></div><div><span>People</span><b>' + e.capacity + '</b></div><div><span>Reference</span><b class="mono">' + e.id.toUpperCase().slice(0, 7) + '</b></div></div>' +
        '<ol class="steps" style="margin:0;padding:0"><li><span class="s done">' + ic('check') + '</span><span><b>Sent</b><span>Today at ' + NOW.time + '</span></span></li><li><span class="s now"></span><span><b>Under review</b><span>The Events Office usually answers within 2 working days.</span></span></li><li><span class="s"></span><span><b>Decision</b><span>You’ll get a notification either way.</span></span></li></ol>' +
        '<div style="display:flex;gap:8px"><button class="btn" type="button" data-act="another" style="flex:1">Book another</button><a class="btn dark" href="#calendar" data-act="calto" data-d="' + e.date + '" style="flex:1">See in calendar</a></div></aside>';
    }
    if (!R.sel) {
      const sp = space(R.sp);
      return '<aside class="panel"><div class="spc" style="padding:0;grid-template-columns:72px 1fr;pointer-events:none"><span class="art" style="width:72px;height:72px">' + A.space(sp.id) + '</span><span><b style="font-size:16px">' + sp.name + '</b><span>' + sp.kind + ' · up to ' + sp.capacity + ' people</span></span></div>' +
        '<ul style="margin:0;padding:0 0 0 18px;color:var(--ink-2);font-size:13px;line-height:1.7">' + sp.features.map((f) => '<li>' + f + '</li>').join('') + '</ul>' +
        '<div class="alert info">' + ic('info-circle', 's') + '<span><b>Pick a free period to request it.</b>Bookings follow fixed periods, so two groups can never overlap by a few minutes.</span></div>' +
        '<div class="legend"><span><i class="cell"></i>Free</span><span><i class="cell booked"></i>Booked</span><span><i class="cell pending"></i>Requested</span><span><i class="cell mine"></i>Yours</span></div></aside>';
    }
    const { sp, d, p } = R.sel, s = space(sp), x = slot(sp, d, p);
    const head = '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><h3>' + s.name + '</h3><p style="margin:4px 0 0;color:var(--muted);font-size:13px">' + fLong(d) + ' · <span class="mono">' + p + ' ' + per(p).from + '–' + per(p).to + '</span></p></div><button class="btn sm icon ghost" type="button" data-act="unpick" aria-label="Close">' + ic('x', 's') + '</button></div>';
    if (x.st === 'closed') return '<aside class="panel">' + head + '<div class="alert">' + ic('lock', 's') + '<span><b>Closed that day.</b>' + s.name + ' doesn’t open on ' + DOW[D.dow(d)] + 's.</span></div></aside>';
    if (x.past) return '<aside class="panel">' + head + '<div class="alert">' + ic('clock', 's') + '<span><b>This period has already started.</b>Pick one later today or another day.</span></div></aside>';
    if (x.st === 'booked') {
      const alts = nearestFree(sp, d, p);
      return '<aside class="panel">' + head + '<div class="alert bad" role="alert">' + ic('alert-triangle', 's') + '<span><b>This period is taken.</b>' + esc(x.ev.title) + ' · ' + esc(x.ev.organizer) + '. Quadra won’t accept a second booking for the same space and period.</span></div>' +
        '<div><div class="ch" style="margin-bottom:8px"><h2>Free nearby</h2></div><div class="alts">' + alts.map((a) => '<button type="button" data-act="pick" data-sp="' + a.sp + '" data-d="' + a.d + '" data-p="' + a.p + '"><b>' + (a.sp !== sp ? space(a.sp).name + ' · ' : '') + fShort(a.d) + ' · ' + a.p + '</b><span class="mono">' + per(a.p).from + '</span></button>').join('') + '</div></div></aside>';
    }
    if (x.st === 'mine') {
      const r = x.pend.find((q) => q.requester === ME); const e = EV.find((q) => q.id === r.eventId);
      return '<aside class="panel">' + head + '<span class="chip blue" style="align-self:flex-start"><span class="d"></span>Your request · waiting</span><div class="sum"><div class="w2"><span>What</span><b>' + esc(e.title) + '</b></div><div><span>Periods</span><b>' + pRange(e.periods).label + '</b></div><div><span>People</span><b>' + e.capacity + '</b></div></div>' +
        (x.pend.length > 1 ? '<div class="alert">' + ic('alert-triangle', 's') + '<span><b>Another group asked for this period too.</b>The Events Office will pick one; the other request can move to a free period.</span></div>' : '') +
        '<button class="btn danger" type="button" data-act="withdraw" data-id="' + e.id + '">Withdraw request</button></aside>';
    }
    // free or requested by others: the form
    const F = R.form, E = R.err;
    const others = x.st === 'pending' ? x.pend : [];
    const dayPeriods = PERIODS.map((pp) => ({ id: pp.id, x: slot(sp, d, pp.id) }));
    return '<aside class="panel">' + head +
      (others.length ? '<div class="alert" role="status">' + ic('alert-triangle', 's') + '<span><b>' + group(others[0].group).name + ' already asked for this period.</b>You can still send yours. The Events Office decides between them, and the other request can move to a free period.</span></div>' : '<div class="alert ok">' + ic('circle-check', 's') + '<span><b>Free.</b>Send a request and the Events Office will confirm it.</span></div>') +
      '<form data-form="req" novalidate style="display:flex;flex-direction:column;gap:14px">' +
      '<div class="field"><label for="rq-t">What is it for?</label><input class="inp" id="rq-t" name="title" value="' + esc(F.title) + '" placeholder="Futsal practice, book club, workshop…"' + (E.title ? ' aria-invalid="true" aria-describedby="rq-te"' : '') + '>' + (E.title ? '<span class="err" id="rq-te">' + ic('alert-triangle', 's') + E.title + '</span>' : '') + '</div>' +
      '<div class="field"><span class="lb" id="rq-pl">Periods on ' + fShort(d) + '</span><div class="pchips" role="group" aria-labelledby="rq-pl">' + dayPeriods.map((o) => { const busy = o.x.st === 'booked' || o.x.st === 'closed' || o.x.past;
        return '<button type="button" data-act="tper" data-p="' + o.id + '" aria-pressed="' + F.periods.includes(o.id) + '" class="' + (busy ? 'busy' : '') + '"' + (busy ? ' data-tip="' + o.id + '|' + (o.x.st === 'booked' ? 'Booked: ' + esc(o.x.ev.title) : o.x.past ? 'Already started' : 'Closed') + '"' : '') + '>' + o.id + '</button>'; }).join('') + '</div>' +
        (E.periods ? '<span class="err" role="alert">' + ic('alert-triangle', 's') + E.periods + '</span>' : '<span class="help">' + pRange(F.periods.length ? F.periods : [p]).time + '</span>') + '</div>' +
      '<div style="display:grid;grid-template-columns:1.4fr 1fr;gap:10px"><div class="field"><label for="rq-g">Organizing group</label><select class="inp" id="rq-g" name="group">' + GROUPS.map((g) => '<option value="' + g.id + '"' + (F.group === g.id ? ' selected' : '') + '>' + g.name + '</option>').join('') + '</select></div>' +
        '<div class="field"><label for="rq-n">People</label><input class="inp" id="rq-n" name="people" type="number" min="1" inputmode="numeric" value="' + esc(F.people) + '"' + (E.people ? ' aria-invalid="true" aria-describedby="rq-ne"' : '') + '></div></div>' + (E.people ? '<span class="err" id="rq-ne" style="margin-top:-8px">' + ic('alert-triangle', 's') + E.people + '</span>' : '') +
      '<label class="chk"><input type="checkbox" name="public"' + (F.public ? ' checked' : '') + '> Show it on the public agenda</label>' +
      '<button class="btn dark full" type="submit" style="min-height:46px">' + ic('send', 's') + 'Send request</button><p style="margin:-4px 0 0;font-size:12px;color:var(--muted);text-align:center">Nothing is sent anywhere: this is a demo.</p></form></aside>';
  }
  function viewReservations() {
    const R = S.res, days = Array.from({ length: 7 }, (_, i) => D.add(R.week, i));
    const list = R.mode === 'space' ? '<div class="splist" role="group" aria-label="Spaces">' + SPACES.map((s) => { const o = occupancy(s.id, days);
      return '<button type="button" class="spc" aria-pressed="' + (R.sp === s.id) + '" data-act="pickspace" data-id="' + s.id + '"><span class="art">' + A.space(s.id) + '</span><span><b>' + s.name + '</b><span>Up to ' + s.capacity + '</span><span class="ob"><span class="bar"><i style="width:' + o.pc + '%"></i></span><em>' + o.pc + '%</em></span></span></button>'; }).join('') + '</div>' : '';
    const wlabel = day(days[0]) + ' ' + mon(days[0]).slice(0, 3) + ' – ' + day(days[6]) + ' ' + mon(days[6]).slice(0, 3);
    const bar = '<div class="calbar"><div class="seg" role="group" aria-label="View"><button type="button" aria-pressed="' + (R.mode === 'space') + '" data-act="rmode" data-v="space">One space, whole week</button><button type="button" aria-pressed="' + (R.mode === 'day') + '" data-act="rmode" data-v="day">All spaces, one day</button></div><span class="sp"></span>' +
      '<button class="btn icon" type="button" data-act="rweek" data-n="-1" aria-label="Previous week">' + ic('chevron-left', 's') + '</button><span style="font-weight:600;min-width:120px;text-align:center">' + wlabel + '</span><button class="btn icon" type="button" data-act="rweek" data-n="1" aria-label="Next week">' + ic('chevron-right', 's') + '</button></div>';
    let grid;
    if (R.mode === 'space' && narrow()) {
      if (R.day < days[0] || R.day > days[6]) R.day = days[0];
      grid = '<div class="daystrip" role="group" aria-label="Day" style="margin-bottom:10px">' + days.map((d) => '<button type="button" aria-pressed="' + (R.day === d) + '" data-act="rday" data-d="' + d + '"><span>' + DOW[D.dow(d)].slice(0, 3) + '</span><b>' + day(d) + '</b></button>').join('') + '</div>' +
        '<div class="slotlist">' + PERIODS.map((p) => '<div class="ph"><b>' + p.id + '</b>' + p.from + '–' + p.to + '</div>' + slotBtn(R.sp, R.day, p.id)).join('') + '</div>';
    } else if (R.mode === 'space') {
      grid = '<div class="slots" role="grid" aria-label="' + space(R.sp).name + ', week of ' + fLong(days[0]) + '"><span></span>' + days.map((d) => '<div class="dh' + (d === TODAY ? ' td' : '') + '" role="columnheader">' + DOW[D.dow(d)].slice(0, 3) + '<b>' + day(d) + '</b></div>').join('') +
        PERIODS.map((p) => '<div class="ph" role="rowheader"><b>' + p.id + '</b>' + p.from + '–' + p.to + '</div>' + days.map((d) => slotBtn(R.sp, d, p.id)).join('')).join('') + '</div>';
    } else {
      grid = '<div class="daystrip" role="group" aria-label="Day" style="margin-bottom:10px">' + days.map((d) => '<button type="button" aria-pressed="' + (R.day === d) + '" data-act="rday" data-d="' + d + '"><span>' + DOW[D.dow(d)].slice(0, 3) + '</span><b>' + day(d) + '</b></button>').join('') + '</div>' +
        '<div class="daymx" role="grid" aria-label="All spaces on ' + fLong(R.day) + '"><span></span>' + PERIODS.map((p) => '<div class="ph" style="text-align:center;font-size:11px;color:var(--muted)"><b class="mono" style="display:block;font-size:12.5px;color:var(--ink)">' + p.id + '</b>' + p.from + '</div>').join('') +
        SPACES.map((s) => '<div class="ph" role="rowheader" style="font-size:13px;color:var(--ink);font-weight:600">' + s.name + '<span style="font-weight:400;color:var(--muted);font-size:11.5px">' + s.kind + '</span></div>' + PERIODS.map((p) => slotBtn(s.id, R.day, p.id)).join('')).join('') + '</div>';
    }
    const mine = EV.filter((e) => e.owner === ME && (e.mine || (!e.series && e.status === 'published')) && e.date >= D.add(TODAY, -14)).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
    const my = '<section class="card" style="margin-top:16px" aria-labelledby="h-my"><div class="ch"><h2 id="h-my">Your requests</h2><span class="sub">' + mine.length + '</span></div><div class="myreq">' +
      (mine.length ? mine.map((e) => '<div class="it"><b>' + esc(e.title) + '</b><span class="chip ' + (e.status === 'published' ? 'ok' : e.status === 'pending' ? 'blue' : '') + '"><span class="d"></span>' + (e.status === 'published' ? 'Approved' : e.status === 'pending' ? 'Waiting' : 'Withdrawn') + '</span><span class="m">' + space(e.space).name + ' · ' + fShort(e.date) + ' · ' + pRange(e.periods).label + '</span></div>').join('') : '<p style="margin:0;color:var(--muted)">No requests yet. Pick a free period above to make one.</p>') + '</div></section>';
    return '<div class="vh"><div><h1>Reservations</h1><p>See what’s free, request a period and follow the answer. Each space is booked by date and period.</p></div><div class="legend"><span><i class="cell"></i>Free</span><span><i class="cell booked"></i>Booked</span><span><i class="cell pending"></i>Requested</span><span><i class="cell mine"></i>Yours</span><span><i class="cell closed"></i>Closed</span></div></div>' +
      '<div class="resw in"><div style="min-width:0">' + bar + list + grid + '</div>' + panel() + '<div class="myw">' + my + '</div></div>';
  }

  function viewSoon(name, what) {
    return '<div class="soon"><div class="card in"><span class="mark" style="width:34px;height:34px;gap:3px"><i></i><i></i><i></i><i></i></span><h2>' + name + '</h2><p>' + what + '</p><a class="btn dark" href="#dashboard">Back to the overview</a></div></div>';
  }
  const SOON = {
    events: ['Events', 'The event list, with search, filters and status, comes in the next pass.'], 'new-event': ['New event', 'The six-step event creation flow comes in the next pass.'],
    requests: ['Requests', 'Approving and rejecting requests comes in the next pass.'], spaces: ['Spaces', 'The spaces and facilities page comes in the next pass.'],
    participants: ['Participants', 'Sign-ups, attendance and the QR check-in come in the next pass.'], analytics: ['Analytics', 'Reports and charts come in the next pass.'],
    users: ['Users and roles', 'User management and permissions come in the next pass.'], notifications: ['Notifications', 'The full activity page comes in the next pass.'],
    agenda: ['Public agenda', 'The public, editorial agenda comes in the next pass.'], settings: ['Profile and settings', 'Profile, preferences and security come in the next pass. You can already reset the demo here.']
  };

  // ── render ────────────────────────────────────────────────
  function render(fresh) {
    const root = $('#app');
    const r = S.route;
    let html;
    if (r === 'login') html = viewLogin();
    else if (r === 'verify') html = viewVerify();
    else if (r === 'forgot') html = viewForgot();
    else if (r === 'agenda' || r.startsWith('agenda-')) html = window.QV.view(r, CTX);
    else {
      const body = r === 'dashboard' ? viewDashboard() : r === 'calendar' ? viewCalendar() : r === 'reservations' ? viewReservations() : window.QV.view(r, CTX);
      html = shell(body);
    }
    const y = window.scrollY;
    root.innerHTML = html + '<div class="toasts" id="toasts"></div>';
    if (!fresh) { window.scrollTo(0, y); root.querySelectorAll('.in').forEach((el) => el.classList.remove('in')); root.querySelectorAll('.occ.anim').forEach((el) => el.classList.remove('anim')); }
    renderToasts();
    document.title = 'Quadra · ' + ({ login: 'Sign in', verify: 'Verification', forgot: 'Reset password', dashboard: 'Overview', calendar: 'Calendar', reservations: 'Reservations' }[r] || window.QV.title(r, CTX));
    document.documentElement.classList.toggle('compact', saved.prefs.density === 'compact');
    document.documentElement.classList.toggle('calm', !!saved.prefs.calm);
    if (S.focus) { const f = $(S.focus); if (f) { f.focus(); if (S.caret != null && f.setSelectionRange) try { f.setSelectionRange(S.caret, S.caret); } catch (e) {} } S.focus = null; S.caret = null; }
    if (window.QV.after) window.QV.after(r, CTX);
  }

  // ── actions ───────────────────────────────────────────────
  const ACT = {
    showpw: () => { S.login.show = !S.login.show; render(); },
    demo: () => { S.login.email = 'demo@quadra.app'; S.login.pw = 'quadra-demo'; S.login.err = {}; render(); setTimeout(() => submitLogin(), 350); },
    fillotp: () => { S.otp.code = '246810'.split(''); S.otp.err = false; render(); setTimeout(() => submitOtp(), 300); },
    logout: () => { saved.authed = false; persist(); },
    nav: () => { S.nav = !S.nav; render(); },
    ws: () => toast('This demo has one workspace: ' + Q.WORKSPACE.name),
    bell: () => { S.pop = S.pop === 'bell' ? null : 'bell'; render(); },
    readall: () => { NT.forEach((n) => { n.unread = false; if (!saved.read.includes(n.id)) saved.read.push(n.id); }); persist(); render(); toast('All notifications marked as read'); },
    reset: () => { resetDemo(); S.res = Object.assign(S.res, { sel: null, form: null, sent: null }); toast('Demo data is back to the start'); go('dashboard'); },
    openev: (el) => { const e = EV.find((x) => x.id === el.dataset.id); S.q = ''; if (e) { S.cal.date = e.date; S.cal.monthOf = e.date; if (!S.cal.cats.includes(e.cat)) S.cal.cats.push(e.cat); if (isClass(e)) S.cal.classes = true; if (S.cal.sp !== 'all' && S.cal.sp !== e.space) S.cal.sp = 'all'; }
      if (S.route !== 'calendar') { S.pendingOpen = el.dataset.id; go('calendar'); } else { S.cal.open = el.dataset.id; render(); } },
    closeev: () => { S.cal.open = null; render(); },
    calday: (el) => { S.cal.date = el.dataset.d; S.cal.monthOf = el.dataset.d; render(); },
    cday: (el) => { S.cal.date = el.dataset.d; S.cal.view = 'week'; render(); },
    minimon: (el) => { const d = D.parse(S.cal.monthOf.slice(0, 8) + '01'); d.setUTCMonth(d.getUTCMonth() + Number(el.dataset.n)); S.cal.monthOf = D.fmt(d); render(); },
    cview: (el) => { S.cal.view = el.dataset.v; render(); },
    cnav: (el) => { const n = Number(el.dataset.n); if (S.cal.view === 'week') S.cal.date = D.add(S.cal.date, 7 * n); else { const d = D.parse(S.cal.date.slice(0, 8) + '01'); d.setUTCMonth(d.getUTCMonth() + n); S.cal.date = D.fmt(d); } S.cal.monthOf = S.cal.date; render(); },
    ctoday: () => { S.cal.date = TODAY; S.cal.monthOf = TODAY; render(); },
    tcat: (el) => { const c = S.cal.cats; const i = c.indexOf(el.dataset.id); if (i >= 0) { if (c.length > 1) c.splice(i, 1); } else c.push(el.dataset.id); render(); },
    tsp: (el) => { S.cal.sp = el.dataset.id; render(); },
    tclasses: () => { S.cal.classes = !S.cal.classes; render(); },
    pickspace: (el) => { S.res.sp = el.dataset.id; S.res.mode = 'space'; S.res.sel = null; S.res.sent = null; S.q = ''; if (S.route !== 'reservations') go('reservations'); else render(); },
    rmode: (el) => { S.res.mode = el.dataset.v; if (S.res.mode === 'day' && (S.res.day < S.res.week || S.res.day > D.add(S.res.week, 6))) S.res.day = S.res.week; render(); },
    rweek: (el) => { S.res.week = D.add(S.res.week, 7 * Number(el.dataset.n)); S.res.day = D.add(S.res.day, 7 * Number(el.dataset.n)); render(); },
    rday: (el) => { S.res.day = el.dataset.d; render(); },
    pick: (el) => { const { sp, d, p } = el.dataset; pickSlot(sp, d, p); },
    toslot: (el) => { const { sp, d, p } = el.dataset; S.res.sp = sp; S.res.mode = 'space'; S.res.week = D.weekStart(d); S.res.day = d; S.cal.open = null; pickSlot(sp, d, p, true); if (S.route !== 'reservations') go('reservations'); },
    unpick: () => { S.res.sel = null; render(); },
    tper: (el) => { const F = S.res.form, p = el.dataset.p; const i = F.periods.indexOf(p); if (i >= 0) F.periods.splice(i, 1); else F.periods.push(p); S.res.err.periods = periodError(); render(); },
    another: () => { S.res.sent = null; S.res.sel = null; render(); },
    calto: (el) => { S.cal.date = el.dataset.d; S.cal.monthOf = el.dataset.d; S.cal.view = 'week'; },
    withdraw: (el) => { dispatch({ t: 'cancelReq', id: el.dataset.id }); S.res.sel = null; toast('Request withdrawn'); render(); }
  };
  function pickSlot(sp, d, p, quiet) {
    const R = S.res; R.sent = null; R.sel = { sp, d, p }; R.err = {};
    if (R.mode === 'space') R.sp = sp;
    R.form = { title: '', periods: [p], group: 'office', people: '', public: true };
    if (!quiet) { render(); if (narrow()) { const pn = $('.panel'); if (pn) pn.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); } }
  }
  function periodError() {
    const R = S.res, F = R.form; if (!F.periods.length) return 'Pick at least one period.';
    const sp = R.sel.sp, d = R.sel.d;
    for (const p of F.periods) { const x = slot(sp, d, p);
      if (x.st === 'booked') return p + ' is already booked by ' + x.ev.title + '. Pick another period.';
      if (x.st === 'closed') return space(sp).name + ' is closed that day.';
      if (x.past) return p + ' has already started.'; }
    const idx = F.periods.map(pIdx).sort((a, b) => a - b);
    for (let i = 1; i < idx.length; i++) if (idx[i] !== idx[i - 1] + 1) return 'Periods must be next to each other. Send two requests for separate times.';
    return '';
  }
  function submitLogin() {
    const L = S.login, e = {};
    if (!L.email.trim()) e.email = 'Enter your email.'; else if (!/^\S+@\S+\.\S+$/.test(L.email)) e.email = 'That doesn’t look like an email address.';
    if (!L.pw) e.pw = 'Enter your password.';
    if (!e.email && !e.pw && !(L.email === 'demo@quadra.app' && L.pw === 'quadra-demo')) e.form = 'That email and password don’t match. Try again, or use the demo account.';
    L.err = e; if (Object.keys(e).length) { S.focus = e.email ? '#em' : e.pw ? '#pw' : '#em'; render(); return; }
    L.busy = true; render();
    setTimeout(() => { L.busy = false; S.otp = { code: ['', '', '', '', '', ''], err: false, busy: false }; S.focus = '[data-otp="0"]'; go('verify'); }, reduce ? 50 : 750);
  }
  function submitOtp() {
    const O = S.otp;
    if (O.code.join('') !== '246810') { O.err = true; S.focus = '[data-otp="0"]'; render(); return; }
    O.busy = true; render();
    setTimeout(() => { saved.authed = true; persist(); O.busy = false; go('dashboard'); toast('Signed in as Jordan Reyes · demo account'); }, reduce ? 50 : 700);
  }
  function submitReq(form) {
    const R = S.res, F = R.form, s = space(R.sel.sp), e = {};
    F.title = form.title.value.trim(); F.group = form.group.value; F.people = form.people.value; F.public = form.public.checked;
    if (!F.title) e.title = 'Give the booking a name.';
    const n = Number(F.people);
    if (!F.people || !n || n < 1) e.people = 'How many people are coming?'; else if (n > s.capacity) e.people = s.name + ' holds ' + s.capacity + ' people.';
    const pe = periodError(); if (pe) e.periods = pe;
    R.err = e;
    if (Object.keys(e).length) { S.focus = e.title ? '#rq-t' : e.people ? '#rq-n' : null; render(); return; }
    const op = dispatch({ t: 'req', space: s.id, date: R.sel.d, periods: F.periods.slice(), title: F.title, group: F.group, people: n, public: F.public, cat: { falcons: 'sports', herons: 'sports', sport: 'sports', eng: 'academic', robotics: 'academic', arts: 'culture', chess: 'culture' }[F.group] || 'community' });
    R.sent = op.id; R.sel = null;
    render();
    toast('Request sent for ' + s.name + ' · ' + fShort(op.date) + ' · ' + pRange(op.periods).label, { to: 'calendar', label: 'View' });
    const b = document.querySelector('.sl.mine'); if (b) b.classList.add('flash');
  }

  // ── wiring ────────────────────────────────────────────────
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-act]');
    if (S.pop === 'bell' && !ev.target.closest('.pop') && !ev.target.closest('.bell')) { S.pop = null; if (!el) { render(); return; } }
    if (!el) { if (S.q && !ev.target.closest('.search')) { S.q = ''; const r = $('#qres'); if (r) r.innerHTML = ''; } return; }
    const a = el.dataset.act;
    if (a === 'tclasses') { ACT.tclasses(el); return; }
    if (el.tagName === 'A' && a !== 'logout') ev.preventDefault();
    if (ACT[a]) ACT[a](el, ev); else if (window.QV.ACT[a]) window.QV.ACT[a](el, CTX, ev);
    if (a === 'calto') go('calendar');
  });
  document.addEventListener('submit', (ev) => {
    const f = ev.target.closest('form[data-form]'); if (!f) return; ev.preventDefault();
    const k = f.dataset.form;
    if (k === 'login') { S.login.email = f.email.value; S.login.pw = f.pw.value; submitLogin(); }
    if (k === 'otp') submitOtp();
    if (k === 'forgot') { S.forgot.email = f.email.value.trim(); if (!/^\S+@\S+\.\S+$/.test(S.forgot.email)) { S.forgot.err = S.forgot.email ? 'That doesn’t look like an email address.' : 'Enter your email.'; render(); return; } S.forgot.err = ''; S.forgot.sent = true; render(); }
    if (k === 'req') submitReq(f);
    if (window.QV.SUBMIT[k]) window.QV.SUBMIT[k](f, CTX);
  });
  document.addEventListener('input', (ev) => {
    const t = ev.target;
    if (t.id === 'em') S.login.email = t.value;
    if (t.id === 'pw') S.login.pw = t.value;
    if (t.id === 'q') { S.q = t.value; searchResults(); }
    if (t.dataset && t.dataset.otp != null) {
      const i = Number(t.dataset.otp), v = t.value.replace(/\D/g, '');
      if (v.length > 1) { v.slice(0, 6).split('').forEach((c, k) => { S.otp.code[k] = c; }); render(); const nx = $('[data-otp="' + Math.min(5, v.length) + '"]'); if (nx) nx.focus(); return; }
      S.otp.code[i] = v; t.value = v; S.otp.err = false;
      if (v && i < 5) { const nx = $('[data-otp="' + (i + 1) + '"]'); if (nx) nx.focus(); }
      if (S.otp.code.join('').length === 6) submitOtp();
    }
    if (t.dataset && t.dataset.bind) { const path = t.dataset.bind.split('.'); let o = S.v; if (path[0] === 'prefs') { o = saved; setTimeout(persist); } path.slice(0, -1).forEach((k) => { o = o[k] = o[k] || {}; }); o[path[path.length - 1]] = t.type === 'checkbox' ? t.checked : t.value;
      if (t.dataset.live != null) { S.focus = '#' + t.id; S.caret = t.selectionStart; render(); } }
    if (S.res.form && t.form && t.form.dataset.form === 'req') { if (t.name === 'title') S.res.form.title = t.value; if (t.name === 'people') S.res.form.people = t.value; if (t.name === 'group') S.res.form.group = t.value; }
  });
  document.addEventListener('keydown', (ev) => {
    // A handled Esc is marked, so the case page's demo layer leaves it alone.
    if (ev.key === 'Escape') { if ($('.modal') || (S.v.us && S.v.us.sel)) { ev.preventDefault(); if (S.v.us) S.v.us.sel = null; window.QV.ACT.mclose(null, CTX); } else if (S.cal.open) { ev.preventDefault(); S.cal.open = null; render(); } else if (S.pop) { ev.preventDefault(); S.pop = null; render(); } else if (S.nav) { ev.preventDefault(); S.nav = false; render(); } }
    if (ev.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { const q = $('#q'); if (q) { ev.preventDefault(); q.focus(); } }
    if (ev.key === 'Backspace' && ev.target.dataset && ev.target.dataset.otp != null && !ev.target.value) { const i = Number(ev.target.dataset.otp); if (i > 0) { const p = $('[data-otp="' + (i - 1) + '"]'); if (p) p.focus(); } }
  });
  document.addEventListener('mouseover', tip);
  document.addEventListener('focusin', tip);
  window.addEventListener('scroll', () => { if (tipEl) { tipEl.remove(); tipEl = null; } }, { passive: true });
  window.addEventListener('hashchange', route);
  narrowQ.addEventListener('change', () => { if (saved.authed) render(); });

  const CTX = {
    Q, A, D, PERIODS, TODAY, NOW, SPACES, CATEGORIES, GROUPS, ME, DOW, MON,
    get EV() { return EV; }, get RQ() { return RQ; }, get NT() { return NT; }, get UU() { return UU; }, get RSVP() { return RSVP; }, get slotIx() { return slotIx; },
    get S() { return S; }, get saved() { return saved; },
    esc, ic, day, mon, fShort, fLong, per, pIdx, pRange, space, cat, group, user, initials, evVars, slot, isPast, occupancy, participants, pendingGroups, noteRow, evChip, isClass, miniMonth,
    narrow, reduce, render, go, toast, dispatch, persist, resetDemo, when,
    signOut: () => { saved.authed = false; persist(); go('login'); }
  };

  window.QV.init(CTX);
  document.body.insertAdjacentHTML('afterbegin', window.QICONS);
  build();
  route();
})();
