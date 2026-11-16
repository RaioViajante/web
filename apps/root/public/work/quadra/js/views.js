/* Quadra — the rest of the product: events, event pages, creation, requests, spaces, participants,
   analytics, users, notifications, settings and the public agenda. Reads the shared context from app.js. */
(function () {
  'use strict';
  let C;
  const QV = { ACT: {}, SUBMIT: {} };
  const V = {};
  const TITLES = { events: 'Events', 'new-event': 'New event', requests: 'Requests', spaces: 'Spaces', participants: 'Participants', analytics: 'Analytics',
    users: 'Users and roles', notifications: 'Notifications', agenda: 'What’s on', account: 'Settings' };
  const st = (k, d) => { const S = C.S; S.v[k] = S.v[k] || d; return S.v[k]; };
  const sel = (bind, opts, val, label, live) => '<select class="inp" id="f-' + bind.replace('.', '-') + '" data-bind="' + bind + '"' + (live ? ' data-live' : '') + ' aria-label="' + label + '">' +
    opts.map(([v, l]) => '<option value="' + v + '"' + (v === val ? ' selected' : '') + '>' + l + '</option>').join('') + '</select>';
  const seg = (act, items, cur, label) => '<div class="seg" role="group" aria-label="' + label + '">' + items.map(([v, l]) => '<button type="button" data-act="' + act + '" data-v="' + v + '" aria-pressed="' + (cur === v) + '">' + l + '</button>').join('') + '</div>';
  const tabs = (act, items, cur, label) => '<div class="tabs" role="tablist" aria-label="' + label + '">' + items.map(([v, l, n]) => '<button type="button" role="tab" data-act="' + act + '" data-v="' + v + '" aria-selected="' + (cur === v) + '">' + l + (n != null ? '<span>' + n + '</span>' : '') + '</button>').join('') + '</div>';
  const statusChip = (e) => ({ published: '<span class="chip ok"><span class="d"></span>Confirmed</span>', pending: '<span class="chip blue"><span class="d"></span>Waiting</span>',
    cancelled: '<span class="chip bad"><span class="d"></span>Cancelled</span>', rejected: '<span class="chip bad"><span class="d"></span>Declined</span>', withdrawn: '<span class="chip"><span class="d"></span>Withdrawn</span>' }[e.status] || '');
  const datet = (d) => '<span class="datet"><i>' + C.mon(d).slice(0, 3).toUpperCase() + '</i><b>' + C.day(d) + '</b></span>';
  const empty = (title, body, act) => '<div class="empty-st"><span class="mark"><i></i><i></i><i></i><i></i></span><b>' + title + '</b><p>' + body + '</p>' + (act || '') + '</div>';
  const modal = (title, body, foot, wide) => '<div class="mscrim" data-act="mclose"></div><div class="modal' + (wide ? ' wide' : '') + '" role="dialog" aria-modal="true" aria-labelledby="m-t"><header><h2 id="m-t">' + title + '</h2><button class="btn sm icon ghost" type="button" data-act="mclose" aria-label="Close">' + C.ic('x', 's') + '</button></header><div class="mb">' + body + '</div>' + (foot ? '<footer>' + foot + '</footer>' : '') + '</div>';
  const field = (id, label, input, err, help) => '<div class="field"><label for="' + id + '">' + label + '</label>' + input + (err ? '<span class="err" id="' + id + '-e">' + C.ic('alert-triangle', 's') + err + '</span>' : help ? '<span class="help">' + help + '</span>' : '') + '</div>';
  const inp = (id, bind, val, extra, err) => '<input class="inp" id="' + id + '" data-bind="' + bind + '" value="' + C.esc(val == null ? '' : val) + '"' + (err ? ' aria-invalid="true" aria-describedby="' + id + '-e"' : '') + ' ' + (extra || '') + '>';
  const toggle = (bind, on, label, desc) => '<label class="tg"><span><b>' + label + '</b>' + (desc ? '<span>' + desc + '</span>' : '') + '</span><input type="checkbox" role="switch" data-bind="' + bind + '" data-live' + (on ? ' checked' : '') + ' id="t-' + bind.replace(/\./g, '-') + '"><i aria-hidden="true"></i></label>';
  const isOneOff = (e) => !e.series;
  const evById = (id) => C.EV.find((e) => e.id === id);
  const typeName = (id) => (C.Q.USER_TYPES.find((t) => t.id === id) || {}).name || id;
  const roleName = (id) => (C.Q.ROLES.find((r) => r.id === id) || {}).name || id;

  // ════════════════════ EVENTS ════════════════════
  V.events = () => {
    const E = st('ev', { tab: 'upcoming', q: '', cat: 'all', sp: 'all', classes: false, view: 'list', n: 20 });
    const T = C.TODAY;
    const base = C.EV.filter((e) => (E.classes || !C.isClass(e)));
    const groups = {
      upcoming: base.filter((e) => e.status === 'published' && e.date >= T),
      pending: base.filter((e) => e.status === 'pending'),
      past: base.filter((e) => e.status === 'published' && e.date < T),
      cancelled: base.filter((e) => e.status === 'cancelled' || e.status === 'rejected')
    };
    let list = (groups[E.tab] || groups.upcoming).filter((e) => (E.cat === 'all' || e.cat === E.cat) && (E.sp === 'all' || e.space === E.sp) &&
      (!E.q || (e.title + ' ' + e.organizer).toLowerCase().includes(E.q.toLowerCase())));
    list.sort((a, b) => E.tab === 'past' || E.tab === 'cancelled' ? b.date.localeCompare(a.date) : (a.date + C.pIdx(a.periods[0])).localeCompare(b.date + C.pIdx(b.periods[0])));
    const total = list.length; list = list.slice(0, E.n);
    const row = (e) => { const c = C.cat(e.cat), sp = C.space(e.space), r = C.pRange(e.periods), pc = Math.min(100, Math.round(e.attendees / e.capacity * 100));
      return '<a class="erow" href="#event-' + e.id + '">' + datet(e.date) + '<span class="et"><b>' + C.esc(e.title) + '</b><span>' + C.esc(e.organizer) + '</span></span>' +
        '<span class="chip" style="background:' + c.soft + ';color:' + c.ink + '"><span class="d"></span>' + c.name + '</span>' +
        '<span class="ew"><b>' + sp.name + '</b><span class="mono">' + r.label + ' · ' + r.time + '</span></span>' +
        '<span class="ecap">' + (e.status === 'pending' ? '<span class="m">Not open yet</span>' : '<span class="m num">' + e.attendees + ' / ' + e.capacity + '</span><span class="bar"><i style="width:' + pc + '%"></i></span>') + '</span>' +
        statusChip(e) + '<span class="go">' + C.ic('chevron-right', 's') + '</span></a>'; };
    const card = (e) => { const c = C.cat(e.cat), r = C.pRange(e.periods);
      return '<a class="ecard" href="#event-' + e.id + '"><span class="cv">' + C.A.cover(e.cat) + '<span class="chip">' + c.name + '</span></span><span class="eb"><span class="mono">' + C.fShort(e.date) + ' · ' + r.time + '</span><b>' + C.esc(e.title) + '</b><span>' + C.space(e.space).name + ' · ' + C.esc(e.organizer) + '</span><span class="ef">' + statusChip(e) + (e.status !== 'pending' ? '<span class="m num">' + e.attendees + ' going</span>' : '') + '</span></span></a>'; };
    return '<div class="vh"><div><h1>Events</h1><p>Everything organized across Valemont, with who runs it, where and when.</p></div><div class="acts"><a class="btn" href="#calendar">' + C.ic('calendar', 's') + 'Open the calendar</a></div></div>' +
      tabs('evtab', [['upcoming', 'Upcoming', groups.upcoming.length], ['pending', 'Waiting for approval', groups.pending.length], ['past', 'Past', groups.past.length], ['cancelled', 'Cancelled or declined', groups.cancelled.length]], E.tab, 'Event status') +
      '<div class="toolbar"><div class="search sm"><label class="sr" for="f-ev-q">Search events</label>' + C.ic('search') + '<input id="f-ev-q" type="search" data-bind="ev.q" data-live placeholder="Search by title or organizer" value="' + C.esc(E.q) + '"></div>' +
        sel('ev.cat', [['all', 'All categories']].concat(C.CATEGORIES.map((c) => [c.id, c.name])), E.cat, 'Category', true) +
        sel('ev.sp', [['all', 'All spaces']].concat(C.SPACES.map((s) => [s.id, s.name])), E.sp, 'Space', true) +
        '<label class="chk"><input type="checkbox" data-bind="ev.classes" data-live id="f-ev-cl"' + (E.classes ? ' checked' : '') + '> Classes and courses</label><span class="sp"></span>' +
        seg('evview', [['list', C.ic('list', 's') + '<span class="sr">List</span>'], ['grid', C.ic('layout-grid', 's') + '<span class="sr">Grid</span>']], E.view, 'Layout') + '</div>' +
      (total ? (E.view === 'list' ? '<div class="elist in">' + list.map(row).join('') + '</div>' : '<div class="egrid in">' + list.map(card).join('') + '</div>') +
        '<div class="more-row"><span class="m">' + Math.min(E.n, total) + ' of ' + total + '</span>' + (total > E.n ? '<button class="btn" type="button" data-act="evmore">Show more</button>' : '') + '</div>'
        : empty('No events match these filters', 'Try another category or space, or clear the search.', '<button class="btn" type="button" data-act="evclear">Clear filters</button>'));
  };
  QV.ACT.evtab = (el) => { const E = C.S.v.ev; E.tab = el.dataset.v; E.n = 20; C.render(); };
  QV.ACT.evview = (el) => { C.S.v.ev.view = el.dataset.v; C.render(); };
  QV.ACT.evmore = () => { C.S.v.ev.n += 20; C.render(); };
  QV.ACT.evclear = () => { Object.assign(C.S.v.ev, { q: '', cat: 'all', sp: 'all' }); C.render(); };

  // ════════════════════ EVENT PAGE ════════════════════
  V.event = (id) => {
    const e = evById(id); const c = C.cat(e.cat), sp = C.space(e.space), r = C.pRange(e.periods);
    const M = st('ep', { modal: null });
    const reqs = C.RQ.filter((q) => q.eventId === e.id);
    const owner = C.user(e.owner);
    const ps = e.status === 'pending' ? [] : C.participants(e);
    const checked = ps.filter((p) => p.checkedAt).length;
    const future = e.date >= C.TODAY;
    const steps = [['Requested', (owner ? owner.name : e.organizer) + ' · ' + (e.createdAt ? C.fShort(e.createdAt) : C.fShort(C.D.add(e.date, -9))), 'done']];
    if (e.status === 'pending') steps.push(['Waiting for a decision', 'The Events Office reviews requests in the order they arrive.', 'now']);
    else if (e.status === 'rejected') steps.push(['Declined', e.rejectReason || '', 'bad']);
    else { steps.push(['Approved', (e.decidedBy ? C.user(e.decidedBy).name : 'Maya Okafor') + ' · ' + (e.decidedAt ? 'today' : C.fShort(C.D.add(e.date, -6))), 'done']);
      if (e.status === 'cancelled') steps.push(['Cancelled', e.cancelReason || '', 'bad']); else steps.push([future ? 'Happens' : 'Happened', C.fLong(e.date), future ? '' : 'done']); }
    const more = C.EV.filter((x) => x.organizer === e.organizer && x.id !== e.id && x.status === 'published' && x.date >= C.TODAY && !C.isClass(x)).slice(0, 4);
    const actions = (e.status === 'published' && future ? '<button class="btn" type="button" data-act="epedit">' + C.ic('settings', 's') + 'Edit</button><button class="btn danger" type="button" data-act="epcancel">' + C.ic('circle-x', 's') + 'Cancel event</button>' : '') +
      (e.status === 'pending' ? '<a class="btn blue" href="#requests" data-act="openreq" data-id="' + e.id + '">' + C.ic('inbox', 's') + 'Review the request</a>' : '') +
      '<button class="btn dark" type="button" data-act="eppub" data-id="' + e.id + '">' + C.ic('world', 's') + 'Participant view</button>';
    let mdl = '';
    if (M.modal === 'edit') { const F = M.f || (M.f = { title: e.title, desc: e.desc, capacity: e.capacity, err: {} });
      mdl = modal('Edit event', '<form id="epf" data-form="epedit" novalidate style="display:flex;flex-direction:column;gap:14px">' +
        field('f-ep-t', 'Title', inp('f-ep-t', 'ep.f.title', F.title, '', F.err.title), F.err.title) +
        '<div class="field"><label for="f-ep-d">Description</label><textarea class="inp" id="f-ep-d" data-bind="ep.f.desc">' + C.esc(F.desc) + '</textarea></div>' +
        field('f-ep-c', 'Places', inp('f-ep-c', 'ep.f.capacity', F.capacity, 'type="number" min="1" inputmode="numeric"', F.err.capacity), F.err.capacity, sp.name + ' holds up to ' + sp.capacity + '.') + '</form>',
        '<button class="btn" type="button" data-act="mclose">Cancel</button><button class="btn dark" type="submit" form="epf">Save changes</button>'); }
    if (M.modal === 'cancel') { const F = M.f || (M.f = { reason: '', err: '' });
      mdl = modal('Cancel “' + C.esc(e.title) + '”?', '<form id="epc" data-form="epcancel" novalidate style="display:flex;flex-direction:column;gap:14px"><p class="mtext">The ' + e.periods.length + ' period' + (e.periods.length > 1 ? 's' : '') + ' in ' + sp.name + ' become free again, and the ' + e.attendees + ' people who signed up get a notification.</p>' +
        '<div class="pchips">' + ['Not enough people signed up', 'The organizer can’t make it', 'The space needs maintenance'].map((t) => '<button type="button" data-act="epreason" data-v="' + t + '" aria-pressed="' + (F.reason === t) + '" style="font-family:var(--f)">' + t + '</button>').join('') + '</div>' +
        field('f-ep-r', 'Reason people will see', '<textarea class="inp" id="f-ep-r" data-bind="ep.f.reason"' + (F.err ? ' aria-invalid="true" aria-describedby="f-ep-r-e"' : '') + '>' + C.esc(F.reason) + '</textarea>', F.err) + '</form>',
        '<button class="btn" type="button" data-act="mclose">Keep the event</button><button class="btn dark danger-fill" type="submit" form="epc">Cancel event</button>'); }
    return '<div class="crumbs"><a href="#events">Events</a>' + C.ic('chevron-right', 's') + '<span>' + C.esc(e.title) + '</span></div>' +
      '<section class="ehero in" style="' + C.evVars(c) + '"><div class="cv">' + C.A.cover(e.cat) + '</div><div class="hb"><div class="hl"><span class="chip" style="background:' + c.soft + ';color:' + c.ink + '"><span class="d"></span>' + c.name + '</span>' + statusChip(e) + (e.public ? '<span class="chip">' + C.ic('world', 's') + 'Public agenda</span>' : '<span class="chip">' + C.ic('lock', 's') + 'Members only</span>') + '</div>' +
        '<h1>' + C.esc(e.title) + '</h1><div class="hm"><span>' + C.ic('calendar', 's') + C.fLong(e.date) + '</span><span class="mono">' + C.ic('clock', 's') + r.label + ' · ' + r.time + '</span><span>' + C.ic('map-pin', 's') + sp.name + '</span><span>' + C.ic('users', 's') + C.esc(e.organizer) + '</span></div><div class="acts">' + actions + '</div></div></section>' +
      '<div class="grid in" style="margin-top:16px">' +
        '<section class="card c8"><div class="ch"><h2>About</h2></div><p class="prose">' + C.esc(e.desc || 'No description yet.') + '</p>' +
          (e.status === 'cancelled' ? '<div class="alert bad" style="margin-top:14px">' + C.ic('circle-x', 's') + '<span><b>Cancelled.</b>' + C.esc(e.cancelReason || '') + '</span></div>' : '') +
          '<div class="ch" style="margin-top:22px"><h2>Reservation</h2><a class="btn sm ghost" href="#reservations" data-act="toslot" data-sp="' + e.space + '" data-d="' + e.date + '" data-p="' + e.periods[0] + '">See it in reservations ' + C.ic('arrow-right', 's') + '</a></div>' +
          '<div class="resbox"><span class="art">' + C.A.space(sp.id) + '</span><div class="rb"><b>' + sp.name + '</b><span>' + sp.kind + ' · ' + sp.floor + '</span><div class="rslots">' + C.PERIODS.map((p) => { const on = e.periods.includes(p.id); return '<span class="rs' + (on ? ' on' : '') + '"><b class="mono">' + p.id + '</b>' + p.from + '</span>'; }).join('') + '</div>' +
          '<span class="m">' + reqs.length + ' period' + (reqs.length !== 1 ? 's' : '') + ' requested · ref. <span class="mono">' + (e.id.toUpperCase()).slice(0, 7) + '</span></span></div></div>' +
          '<ol class="steps" style="margin:18px 0 0;padding:0">' + steps.map(([t, d, k]) => '<li><span class="s ' + (k === 'done' ? 'done' : k === 'now' ? 'now' : k === 'bad' ? 'bad' : '') + '">' + (k === 'done' ? C.ic('check') : k === 'bad' ? C.ic('x') : '') + '</span><span><b>' + t + '</b><span>' + C.esc(d) + '</span></span></li>').join('') + '</ol></section>' +
        '<div class="c4" style="display:flex;flex-direction:column;gap:16px">' +
          '<section class="card"><div class="ch"><h2>People</h2>' + (ps.length ? '<a class="btn sm ghost" href="#participants" data-act="openpt" data-id="' + e.id + '">Check-in ' + C.ic('arrow-right', 's') + '</a>' : '') + '</div>' +
            (e.status === 'pending' ? '<p class="m" style="margin:0">Sign-ups open once the request is approved.</p>' :
            '<div class="cap"><div class="row"><b style="color:var(--ink);font-size:24px;letter-spacing:-.03em">' + e.attendees + '<small style="font-size:13px;color:var(--muted);font-weight:500"> of ' + e.capacity + '</small></b><span>' + (e.waitlist ? e.waitlist + ' on the waitlist' : (e.capacity - e.attendees) + ' places left') + '</span></div><div class="bar"><i style="width:' + Math.min(100, e.attendees / e.capacity * 100) + '%"></i></div>' +
            '<div class="row"><div class="avatars">' + ps.slice(0, 6).map((p) => '<span class="avatar t-' + p.type + '">' + p.initials + '</span>').join('') + '</div><span>' + (future ? (ps.filter((p) => p.status === 'confirmed').length + ' confirmed') : checked + ' checked in') + '</span></div></div>') + '</section>' +
          '<section class="card"><div class="ch"><h2>Details</h2></div><dl class="kv">' +
            '<dt>Organizer</dt><dd>' + C.esc(e.organizer) + '</dd><dt>Contact</dt><dd>' + (owner ? owner.name : '—') + '</dd><dt>Category</dt><dd>' + c.name + (e.cat === 'sports' ? ' · sports event' : ' · non-sports event') + '</dd>' +
            '<dt>Audience</dt><dd>' + (e.public ? 'Anyone · on the public agenda' : 'Members only') + '</dd><dt>Sign-up</dt><dd>' + (e.signup === false ? 'Not needed' : 'Required') + (e.waitlist || e.allowWait ? ' · waitlist on' : '') + '</dd></dl></section>' +
          (more.length ? '<section class="card"><div class="ch"><h2>More from ' + C.esc(e.organizer) + '</h2></div><div class="up">' + more.map((x) => '<a href="#event-' + x.id + '">' + datet(x.date) + '<span><b class="t">' + C.esc(x.title) + '</b><span class="m">' + C.space(x.space).name + ' · ' + C.pRange(x.periods).time + '</span></span></a>').join('') + '</div></section>' : '') +
        '</div></div>' + mdl;
  };
  QV.ACT.epedit = () => { C.S.v.ep.modal = 'edit'; C.S.v.ep.f = null; C.render(); };
  QV.ACT.epcancel = () => { C.S.v.ep.modal = 'cancel'; C.S.v.ep.f = null; C.render(); };
  QV.ACT.epreason = (el) => { C.S.v.ep.f.reason = el.dataset.v; C.S.v.ep.f.err = ''; C.render(); };
  QV.ACT.mclose = () => { Object.keys(C.S.v).forEach((k) => { if (C.S.v[k] && C.S.v[k].modal) C.S.v[k].modal = null; }); C.S.v.modal = null; C.render(); };
  QV.ACT.eppub = (el) => { const e = evById(el.dataset.id); if (e.public && e.status === 'published') C.go('agenda-' + e.id); else C.toast(e.status !== 'published' ? 'Only confirmed events appear on the public agenda' : 'Members-only events don’t appear on the public agenda'); };
  QV.SUBMIT.epedit = () => { const id = C.S.route.slice(6), e = evById(id), F = C.S.v.ep.f, sp = C.space(e.space), err = {};
    if (!String(F.title).trim()) err.title = 'Give the event a title.';
    const n = Number(F.capacity); if (!n || n < 1) err.capacity = 'How many places are there?'; else if (n > sp.capacity) err.capacity = sp.name + ' holds up to ' + sp.capacity + '.'; else if (n < e.attendees) err.capacity = e.attendees + ' people already signed up. Keep at least that many places.';
    F.err = err; if (Object.keys(err).length) { C.render(); return; }
    C.dispatch({ t: 'editEvent', id, patch: { title: String(F.title).trim(), desc: F.desc, capacity: n } }); C.S.v.ep.modal = null; C.render(); C.toast('Changes saved'); };
  QV.SUBMIT.epcancel = () => { const id = C.S.route.slice(6), F = C.S.v.ep.f;
    if (!String(F.reason).trim()) { F.err = 'Tell people why. It shows on the event page.'; C.render(); return; }
    C.dispatch({ t: 'cancelEvent', id, reason: String(F.reason).trim() }); C.S.v.ep.modal = null; C.render(); C.toast('Event cancelled · the periods are free again'); };

  // ════════════════════ NEW EVENT (6 steps) ════════════════════
  const STEPS = [['General', 'Title and organizer'], ['Type', 'Category and audience'], ['Date and time', 'Day and periods'], ['Space', 'Where it happens'], ['People', 'Places and sign-up'], ['Review', 'Check and confirm']];
  V['new-event'] = () => {
    const N = st('ne', { step: 0, title: '', desc: '', group: 'office', cat: '', public: true, date: '2026-11-24', monthOf: '2026-11-24', periods: [], space: '', capacity: '', signup: true, allowWait: true, notes: '', confirmNow: true, err: {}, done: null });
    if (N.done) { const e = evById(N.done); const sp = C.space(e.space);
      return '<div class="nedone in"><span class="dico">' + C.ic('circle-check', 'l') + '</span><h1>' + (e.status === 'published' ? 'Event created and confirmed' : 'Event created') + '</h1><p>' + C.esc(e.title) + ' · ' + sp.name + ' · ' + C.fLong(e.date) + ' · ' + C.pRange(e.periods).label + '. ' +
        (e.status === 'published' ? 'The periods are booked and it’s ' + (e.public ? 'on the public agenda.' : 'visible to members.') : 'It’s waiting for the Events Office to approve the booking.') + '</p>' +
        '<div class="acts"><a class="btn dark" href="#event-' + e.id + '">Open the event</a><a class="btn" href="#calendar" data-act="calto" data-d="' + e.date + '">See it in the calendar</a><button class="btn ghost" type="button" data-act="neagain">Create another</button></div></div>';
    }
    const E = N.err, s = N.step;
    let body = '';
    if (s === 0) body = field('ne-t', 'Event title', inp('ne-t', 'ne.title', N.title, 'placeholder="Winter futsal clinic"', E.title), E.title) +
      '<div class="field"><label for="ne-d">Description</label><textarea class="inp" id="ne-d" data-bind="ne.desc" placeholder="What happens, who it’s for, what to bring."' + (E.desc ? ' aria-invalid="true" aria-describedby="ne-d-e"' : '') + '>' + C.esc(N.desc) + '</textarea>' + (E.desc ? '<span class="err" id="ne-d-e">' + C.ic('alert-triangle', 's') + E.desc + '</span>' : '<span class="help">Shown on the event page and the public agenda.</span>') + '</div>' +
      '<div class="field"><label for="f-ne-group">Organizing group</label>' + sel('ne.group', C.GROUPS.map((g) => [g.id, g.name]), N.group, 'Organizing group') + '</div>';
    if (s === 1) body = '<div class="field"><span class="lb">Category</span><div class="catpick" role="radiogroup" aria-label="Category">' + C.CATEGORIES.map((c) => '<button type="button" role="radio" aria-checked="' + (N.cat === c.id) + '" data-act="necat" data-v="' + c.id + '" style="' + C.evVars(c) + '"><span class="cv">' + C.A.cover(c.id) + '</span><b>' + c.name + '</b><span>' + { sports: 'Training, games and tournaments', academic: 'Talks, classes and workshops', culture: 'Arts, music and film', community: 'Meetings and open days' }[c.id] + '</span></button>').join('') + '</div>' + (E.cat ? '<span class="err">' + C.ic('alert-triangle', 's') + E.cat + '</span>' : '') + '</div>' +
      '<div class="field"><span class="lb">Who can see it</span><div class="radios">' + [[true, 'Anyone', 'Listed on the public agenda, no sign-in needed.'], [false, 'Members only', 'Visible to signed-in members of ' + C.Q.WORKSPACE.short + '.']].map(([v, l, d]) => '<button type="button" role="radio" aria-checked="' + (N.public === v) + '" data-act="nepub" data-v="' + v + '"><span class="rd"></span><span><b>' + l + '</b><span>' + d + '</span></span></button>').join('') + '</div></div>';
    if (s === 2) { const free = C.SPACES.length;
      body = '<div class="nedate"><div class="card flat">' + neMonth(N) + '</div><div><div class="field"><span class="lb">' + C.fLong(N.date) + '</span><div class="pchips big" role="group" aria-label="Periods">' + C.PERIODS.map((p) => { const past = C.isPast(N.date, p.id);
        return '<button type="button" data-act="neper" data-v="' + p.id + '" aria-pressed="' + N.periods.includes(p.id) + '"' + (past ? ' class="busy" data-tip="' + p.id + '|Already started"' : '') + '><b>' + p.id + '</b><span>' + p.from + '–' + p.to + '</span></button>'; }).join('') + '</div>' +
        (E.periods ? '<span class="err">' + C.ic('alert-triangle', 's') + E.periods + '</span>' : '<span class="help">Pick one or more periods next to each other. You choose the space next, and only spaces that are free then can be booked.</span>') + '</div>' +
        (N.periods.length ? '<div class="alert info" style="margin-top:14px">' + C.ic('info-circle', 's') + '<span><b>' + C.pRange(N.periods).label + ' · ' + C.pRange(N.periods).time + '</b>' + C.SPACES.filter((sp) => N.periods.every((p) => C.slot(sp.id, N.date, p).st === 'free')).length + ' of ' + free + ' spaces are free for all of it.</span></div>' : '') + '</div></div>'; }
    if (s === 3) body = '<div class="spick" role="radiogroup" aria-label="Space">' + C.SPACES.map((sp) => { const xs = N.periods.map((p) => C.slot(sp.id, N.date, p));
      const bad = xs.find((x) => x.st === 'booked' || x.st === 'closed'); const pend = xs.find((x) => x.st === 'pending' || x.st === 'mine');
      const why = bad ? (bad.st === 'closed' ? 'Closed on ' + C.DOW[C.D.dow(N.date)] + 's' : 'Booked: ' + bad.ev.title) : pend ? 'Free, but another group asked for it' : 'Free for ' + C.pRange(N.periods).label;
      return '<button type="button" role="radio" aria-checked="' + (N.space === sp.id) + '" data-act="nesp" data-v="' + sp.id + '"' + (bad ? ' aria-disabled="true" class="no"' : '') + '><span class="art">' + C.A.space(sp.id) + '</span><span class="sb"><b>' + sp.name + '</b><span>' + sp.kind + ' · up to ' + sp.capacity + '</span><span class="cells">' + C.PERIODS.map((p) => { const x = C.slot(sp.id, N.date, p.id); return '<i class="cell ' + (x.st === 'mine' ? 'pending' : x.st) + (N.periods.includes(p.id) ? ' pick' : '') + '"></i>'; }).join('') + '</span></span><span class="why ' + (bad ? 'bad' : pend ? 'warn' : 'ok') + '">' + C.esc(why) + '</span></button>'; }).join('') + '</div>' +
      (E.space ? '<span class="err" style="margin-top:8px">' + C.ic('alert-triangle', 's') + E.space + '</span>' : '');
    if (s === 4) { const sp = C.space(N.space);
      body = field('ne-c', 'Places', inp('ne-c', 'ne.capacity', N.capacity, 'type="number" min="1" inputmode="numeric" placeholder="' + Math.min(sp.capacity, 40) + '"', E.capacity), E.capacity, sp.name + ' holds up to ' + sp.capacity + ' people.') +
        toggle('ne.signup', N.signup, 'People sign up to come', 'Lets you count people and check them in at the door.') + toggle('ne.allowWait', N.allowWait, 'Keep a waitlist when it’s full', 'The first person waiting gets the place when someone cancels.') +
        '<div class="field"><label for="ne-n">Notes for the Events Office <span style="font-weight:400;color:var(--muted)">(optional)</span></label><textarea class="inp" id="ne-n" data-bind="ne.notes" placeholder="Set-up, equipment, access.">' + C.esc(N.notes) + '</textarea></div>'; }
    if (s === 5) { const sp = C.space(N.space), c = C.cat(N.cat), r = C.pRange(N.periods);
      const row = (k, l, v) => '<div class="rv"><span>' + l + '</span><b>' + v + '</b><button type="button" class="btn sm ghost" data-act="nego" data-v="' + k + '">Edit</button></div>';
      body = '<div class="rvw">' + row(0, 'Title', C.esc(N.title)) + row(0, 'Organizer', C.group(N.group).name) + row(1, 'Category', c.name + ' · ' + (N.public ? 'anyone' : 'members only')) + row(2, 'When', C.fLong(N.date) + ' · ' + r.label + ' · ' + r.time) + row(3, 'Where', sp.name) + row(4, 'Places', N.capacity + (N.signup ? ' · sign-up on' : '') + (N.allowWait ? ' · waitlist' : '')) + '</div>' +
        '<div class="field"><span class="lb">Booking</span><div class="radios">' + [[true, 'Confirm the booking now', 'You’re a super administrator, so you can approve your own booking.'], [false, 'Send it for approval', 'It waits in Requests like everyone else’s.']].map(([v, l, d]) => '<button type="button" role="radio" aria-checked="' + (N.confirmNow === v) + '" data-act="neconf" data-v="' + v + '"><span class="rd"></span><span><b>' + l + '</b><span>' + d + '</span></span></button>').join('') + '</div></div>'; }
    const pv = N.cat ? C.cat(N.cat) : C.CATEGORIES[0];
    const preview = '<aside class="neprev"><span class="lbl">Preview</span><div class="ecard static"><span class="cv">' + C.A.cover(pv.id) + (N.cat ? '<span class="chip">' + pv.name + '</span>' : '') + '</span><span class="eb"><span class="mono">' + (N.periods.length ? C.fShort(N.date) + ' · ' + C.pRange(N.periods).time : 'Date and time') + '</span><b>' + (C.esc(N.title) || 'Untitled event') + '</b><span>' + (N.space ? C.space(N.space).name : 'Space') + ' · ' + C.group(N.group).name + '</span></span></div></aside>';
    return '<div class="crumbs"><a href="#events">Events</a>' + C.ic('chevron-right', 's') + '<span>New event</span></div><div class="vh"><div><h1>New event</h1><p>Six short steps. Nothing is booked until you confirm on the last one.</p></div></div>' +
      '<div class="wiz"><ol class="wsteps">' + STEPS.map(([t, d], i) => '<li class="' + (i < s ? 'done' : i === s ? 'now' : '') + '"><button type="button" data-act="nego" data-v="' + i + '"' + (i > s ? ' disabled' : '') + '><span class="n">' + (i < s ? C.ic('check') : i + 1) + '</span><span><b>' + t + '</b><span>' + d + '</span></span></button></li>').join('') + '</ol>' +
      '<form class="card wform in" data-form="ne" novalidate><div class="wh"><span class="mono">Step ' + (s + 1) + ' of 6</span><h2>' + STEPS[s][0] + '</h2></div>' + body +
      '<div class="wf">' + (s ? '<button class="btn" type="button" data-act="nego" data-v="' + (s - 1) + '">' + C.ic('arrow-left', 's') + 'Back</button>' : '<a class="btn ghost" href="#events">Cancel</a>') +
      '<button class="btn dark" type="submit">' + (s === 5 ? (N.confirmNow ? 'Create and confirm' : 'Create and send') : 'Continue') + C.ic('arrow-right', 's') + '</button></div></form>' + preview + '</div>';
  };
  function neMonth(N) {
    const of = N.monthOf, first = of.slice(0, 8) + '01', start = C.D.weekStart(first);
    const dim = new Date(Date.UTC(+first.slice(0, 4), +first.slice(5, 7), 0)).getUTCDate(); const weeks = Math.ceil((C.D.dow(first) + dim) / 7);
    let rows = '';
    for (let w = 0; w < weeks; w++) rows += '<tr>' + Array.from({ length: 7 }, (_, i) => { const d = C.D.add(start, w * 7 + i); const past = d < C.TODAY;
      return '<td><button type="button" class="' + [C.D.month(d) !== C.D.month(of) ? 'out' : '', d === C.TODAY ? 'td' : '', d === N.date ? 'pk' : ''].join(' ') + '" data-act="nedate" data-d="' + d + '"' + (past ? ' disabled' : '') + ' aria-label="' + C.fLong(d) + '">' + C.day(d) + '</button></td>'; }).join('') + '</tr>';
    return '<div class="mini"><div class="mh"><button class="btn sm icon ghost" type="button" data-act="nemon" data-n="-1" aria-label="Previous month">' + C.ic('chevron-left', 's') + '</button>' + C.mon(of) + ' ' + of.slice(0, 4) + '<button class="btn sm icon ghost" type="button" data-act="nemon" data-n="1" aria-label="Next month">' + C.ic('chevron-right', 's') + '</button></div><table><thead><tr>' + 'MTWTFSS'.split('').map((l) => '<th scope="col">' + l + '</th>').join('') + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
  }
  const neCheck = (N) => {
    const e = {}, s = N.step;
    if (s === 0) { if (!N.title.trim()) e.title = 'Give the event a title.'; if (N.desc.trim().length < 12) e.desc = 'Add a sentence or two so people know what it is.'; }
    if (s === 1 && !N.cat) e.cat = 'Pick a category.';
    if (s === 2) { if (!N.periods.length) e.periods = 'Pick at least one period.'; else { const ix = N.periods.map(C.pIdx).sort((a, b) => a - b); for (let i = 1; i < ix.length; i++) if (ix[i] !== ix[i - 1] + 1) e.periods = 'Periods must be next to each other.'; } }
    if (s === 3) { if (!N.space) e.space = 'Pick a space.'; else if (N.periods.some((p) => ['booked', 'closed'].includes(C.slot(N.space, N.date, p).st))) e.space = 'That space isn’t free for all the periods you picked.'; }
    if (s === 4) { const n = Number(N.capacity), cap = C.space(N.space).capacity; if (!n || n < 1) e.capacity = 'How many places are there?'; else if (n > cap) e.capacity = C.space(N.space).name + ' holds up to ' + cap + '.'; }
    return e;
  };
  QV.SUBMIT.ne = () => { const N = C.S.v.ne; N.err = neCheck(N);
    if (Object.keys(N.err).length) { C.render(); return; }
    if (N.step < 5) { N.step++; C.render(); window.scrollTo(0, 0); return; }
    const op = C.dispatch({ t: 'create', title: N.title.trim(), desc: N.desc.trim(), cat: N.cat, group: N.group, space: N.space, date: N.date, periods: N.periods.slice().sort((a, b) => C.pIdx(a) - C.pIdx(b)), capacity: Number(N.capacity), public: N.public, signup: N.signup, allowWait: N.allowWait, notes: N.notes, confirmNow: N.confirmNow });
    N.done = op.id; C.render(); C.toast(N.confirmNow ? 'Event created and booked' : 'Event created · waiting for approval', { to: 'event-' + op.id, label: 'Open' }); };
  QV.ACT.nego = (el) => { const N = C.S.v.ne, v = Number(el.dataset.v); if (v <= N.step) { N.step = v; N.err = {}; C.render(); } };
  QV.ACT.necat = (el) => { const N = C.S.v.ne; N.cat = el.dataset.v; N.err = {}; C.render(); };
  QV.ACT.nepub = (el) => { C.S.v.ne.public = el.dataset.v === 'true'; C.render(); };
  QV.ACT.neconf = (el) => { C.S.v.ne.confirmNow = el.dataset.v === 'true'; C.render(); };
  QV.ACT.nedate = (el) => { const N = C.S.v.ne; N.date = el.dataset.d; N.periods = N.periods.filter((p) => !C.isPast(N.date, p)); N.space = ''; C.render(); };
  QV.ACT.nemon = (el) => { const N = C.S.v.ne; const d = C.D.parse(N.monthOf.slice(0, 8) + '01'); d.setUTCMonth(d.getUTCMonth() + Number(el.dataset.n)); N.monthOf = C.D.fmt(d); C.render(); };
  QV.ACT.neper = (el) => { const N = C.S.v.ne, p = el.dataset.v; if (C.isPast(N.date, p)) return; const i = N.periods.indexOf(p); if (i >= 0) N.periods.splice(i, 1); else N.periods.push(p); N.space = ''; N.err = {}; C.render(); };
  QV.ACT.nesp = (el) => { const N = C.S.v.ne; if (el.getAttribute('aria-disabled') === 'true') { N.err = { space: 'That space isn’t free for all the periods you picked.' }; C.render(); return; } N.space = el.dataset.v; N.err = {}; C.render(); };
  QV.ACT.neagain = () => { C.S.v.ne = null; C.render(); };

  // ════════════════════ REQUESTS ════════════════════
  const reqEvents = (tab) => {
    const ids = [...new Set(C.RQ.map((r) => r.eventId).filter(Boolean))];
    const evs = ids.map(evById).filter((e) => e && !e.series);
    const decided = C.RQ.filter((r) => !r.eventId && r.status === 'rejected');
    if (tab === 'pending') return evs.filter((e) => e.status === 'pending').sort((a, b) => (a.date + a.periods[0]).localeCompare(b.date + b.periods[0]));
    if (tab === 'approved') return evs.filter((e) => e.status === 'published' && e.date >= '2026-11-01').sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
    if (tab === 'declined') return evs.filter((e) => e.status === 'rejected').concat(decided.map((r) => ({ id: r.id, title: r.title, organizer: C.group(r.group).name, group: r.group, space: r.space, date: r.date, periods: [r.period], status: 'rejected', rejectReason: r.reason, cat: 'community', loose: true, owner: r.requester, capacity: r.people })));
    return [];
  };
  const competitors = (e) => { const out = new Map(); e.periods.forEach((p) => { const x = C.slotIx.get(e.space + '|' + e.date + '|' + p); if (!x) return;
    x.pend.forEach((r) => { if (r.eventId !== e.id) out.set(r.eventId, evById(r.eventId)); }); if (x.ev && x.ev.id !== e.id) out.set('booked', x.ev); }); return out; };
  V.requests = () => {
    const R = st('rq', { tab: 'pending', reason: '', err: '', deciding: false });
    if (C.S.reqSel) { const e = evById(C.S.reqSel); if (e) { R.tab = e.status === 'pending' ? 'pending' : e.status === 'rejected' ? 'declined' : 'approved'; R.sel = e.id; } C.S.reqSel = null; }
    const counts = { pending: reqEvents('pending').length, approved: reqEvents('approved').length, declined: reqEvents('declined').length };
    const list = reqEvents(R.tab);
    if (!list.find((e) => e.id === R.sel)) R.sel = list[0] ? list[0].id : null;
    const item = (e) => { const c = C.cat(e.cat), comp = e.status === 'pending' && competitors(e).size;
      return '<button type="button" class="rqi" aria-pressed="' + (R.sel === e.id) + '" data-act="rqsel" data-id="' + e.id + '"><span class="gi" style="background:' + c.soft + ';color:' + c.ink + '">' + C.initials(e.organizer) + '</span><span><b>' + C.esc(e.title) + '</b><span class="m">' + C.esc(e.organizer) + '</span><span class="m">' + C.space(e.space).name + ' · ' + C.fShort(e.date) + ' · ' + C.pRange(e.periods).label + '</span></span>' +
        (comp ? '<span class="chip warn">Conflict</span>' : e.mine && e.status === 'pending' ? '<span class="chip blue">Yours</span>' : e.status === 'pending' ? '<span class="chip">' + C.D.diff(C.TODAY, e.date) + 'd</span>' : '') + '</button>'; };
    let detail = empty('Nothing waiting', 'Every request has an answer. New ones show up here and in your notifications.');
    const e = R.sel ? (list.find((x) => x.id === R.sel)) : null;
    if (e) {
      const sp = C.space(e.space), c = C.cat(e.cat), u = C.user(e.owner) || C.UU[1];
      const comp = e.status === 'pending' ? competitors(e) : new Map();
      const booked = comp.get('booked'); comp.delete('booked');
      const req = C.RQ.find((r) => r.eventId === e.id) || {};
      detail = '<div class="rqd in"><div class="rqh"><div><div class="hl">' + statusChip(e) + '<span class="chip" style="background:' + c.soft + ';color:' + c.ink + '">' + c.name + '</span></div><h2>' + C.esc(e.title) + '</h2><p class="m">' + (e.loose ? 'Asked for a space, no event attached' : C.esc(e.desc)) + '</p></div>' + (e.loose ? '' : '<a class="btn sm" href="#event-' + e.id + '">Event page ' + C.ic('arrow-right', 's') + '</a>') + '</div>' +
        '<div class="rqg"><div class="who"><span class="avatar big">' + u.initials + '</span><span><b>' + u.name + '</b><span>' + typeName(u.type) + ' · ' + roleName(u.role) + '</span><span>' + C.esc(e.organizer) + '</span></span></div>' +
          '<div class="what"><span class="art">' + C.A.space(sp.id) + '</span><span><b>' + sp.name + '</b><span>' + C.fLong(e.date) + '</span><span class="mono">' + C.pRange(e.periods).label + ' · ' + C.pRange(e.periods).time + '</span></span></div>' +
          '<div class="fit"><span>People</span><b>' + (e.capacity || '—') + '<small> / ' + sp.capacity + '</small></b><span class="bar"><i style="width:' + Math.min(100, (e.capacity || 0) / sp.capacity * 100) + '%"></i></span></div></div>' +
        (booked ? '<div class="alert bad">' + C.ic('alert-triangle', 's') + '<span><b>Already booked.</b>' + C.esc(booked.title) + ' holds this period, so this request can’t be approved as it is. Decline it and suggest another period.</span></div>' : '') +
        (comp.size ? '<div class="vs"><div class="vh2"><b>' + (comp.size + 1) + ' requests want the same period</b><span>Approving one declines the other automatically, with a note saying why.</span></div><div class="vsg">' +
          [e].concat([...comp.values()]).map((x) => '<div class="vsc' + (x.id === e.id ? ' me' : '') + '"><span class="m">' + (x.id === e.id ? 'This request' : 'Competing request') + ' · sent ' + C.fShort(x.createdAt || C.TODAY) + '</span><b>' + C.esc(x.title) + '</b><span>' + C.esc(x.organizer) + ' · ' + x.capacity + ' people</span>' + (x.id !== e.id ? '<button class="btn sm" type="button" data-act="rqsel" data-id="' + x.id + '">Look at this one</button>' : '') + '</div>').join('') + '</div></div>' : '') +
        (e.status === 'pending' ? (R.deciding ? '<form class="decline" data-form="rqno" novalidate><div class="field"><label for="f-rq-reason">Why are you declining?</label><div class="pchips">' + ['The space is needed for maintenance', 'Too many people for the space', 'Please pick another period'].map((t) => '<button type="button" data-act="rqreason" data-v="' + t + '" aria-pressed="' + (R.reason === t) + '" style="font-family:var(--f)">' + t + '</button>').join('') + '</div>' +
            '<textarea class="inp" id="f-rq-reason" data-bind="rq.reason" placeholder="The requester sees this message."' + (R.err ? ' aria-invalid="true"' : '') + '>' + C.esc(R.reason) + '</textarea>' + (R.err ? '<span class="err">' + C.ic('alert-triangle', 's') + R.err + '</span>' : '') + '</div><div class="ra"><button class="btn" type="button" data-act="rqback">Back</button><button class="btn dark" type="submit">Decline request</button></div></form>'
          : '<div class="ra"><button class="btn" type="button" data-act="rqdecline">' + C.ic('x', 's') + 'Decline</button><button class="btn blue" type="button" data-act="rqapprove" data-id="' + e.id + '">' + C.ic('check', 's') + 'Approve' + (comp.size ? ' this one' : '') + '</button></div>')
          : e.status === 'rejected' ? '<div class="alert bad">' + C.ic('circle-x', 's') + '<span><b>Declined.</b>' + C.esc(e.rejectReason || req.reason || '') + '</span></div>'
          : '<div class="alert ok">' + C.ic('circle-check', 's') + '<span><b>Approved.</b>It’s on the calendar' + (e.public ? ' and the public agenda.' : '.') + '</span></div>') +
        '<ol class="steps" style="margin:6px 0 0;padding:0"><li><span class="s done">' + C.ic('check') + '</span><span><b>Sent</b><span>' + u.name + ' · ' + C.fShort(e.createdAt || req.createdAt || C.TODAY) + '</span></span></li>' +
          (e.status === 'pending' ? '<li><span class="s now"></span><span><b>Waiting for you</b><span>' + C.D.diff(C.TODAY, e.date) + ' days before the event</span></span></li>' : '<li><span class="s ' + (e.status === 'rejected' ? 'bad' : 'done') + '">' + C.ic(e.status === 'rejected' ? 'x' : 'check') + '</span><span><b>' + (e.status === 'rejected' ? 'Declined' : 'Approved') + '</b><span>' + (e.decidedAt ? 'Today' : C.fShort(req.decidedAt || C.D.add(e.date, -6))) + '</span></span></li>') + '</ol></div>';
    }
    return '<div class="vh"><div><h1>Requests</h1><p>Every booking goes through here. Approve it and it’s on the calendar; decline it and the requester sees why.</p></div></div>' +
      tabs('rqtab', [['pending', 'Waiting', counts.pending], ['approved', 'Approved', counts.approved], ['declined', 'Declined', counts.declined]], R.tab, 'Request status') +
      '<div class="rqw"><div class="rql">' + (list.length ? list.map(item).join('') : '<p class="m" style="padding:16px">Nothing here.</p>') + '</div><section class="card rqdw">' + detail + '</section></div>';
  };
  QV.ACT.rqtab = (el) => { const R = C.S.v.rq; R.tab = el.dataset.v; R.sel = null; R.deciding = false; C.render(); };
  QV.ACT.rqsel = (el) => { const R = C.S.v.rq; const e = evById(el.dataset.id); if (e && e.status === 'pending' && R.tab !== 'pending') R.tab = 'pending'; R.sel = el.dataset.id; R.deciding = false; R.err = ''; C.render(); if (C.narrow()) { const d = document.querySelector('.rqdw'); if (d) d.scrollIntoView({ behavior: 'smooth' }); } };
  QV.ACT.rqdecline = () => { C.S.v.rq.deciding = true; C.render(); };
  QV.ACT.rqback = () => { C.S.v.rq.deciding = false; C.render(); };
  QV.ACT.rqreason = (el) => { const R = C.S.v.rq; R.reason = el.dataset.v; R.err = ''; C.render(); };
  QV.ACT.rqapprove = (el) => { const e = evById(el.dataset.id); const comp = competitors(e);
    if (comp.has('booked')) { C.toast('That period is already booked. Decline this one instead.'); return; }
    const others = [...comp.values()];
    C.dispatch({ t: 'approve', id: e.id }); C.S.v.rq.deciding = false;
    C.toast('Approved · ' + e.title + ' is on the calendar' + (others.length ? '. ' + others.length + ' competing request declined.' : ''), { to: 'calendar', label: 'View' });
    C.S.cal.date = e.date; C.S.cal.monthOf = e.date; C.render(); };
  QV.ACT.openreq = (el) => { C.S.reqSel = el.dataset.id; if (C.S.route === 'requests') { C.S.v.rq = null; C.render(); } else C.go('requests'); };
  QV.SUBMIT.rqno = () => { const R = C.S.v.rq; if (!String(R.reason).trim()) { R.err = 'Write a short reason. The requester sees it.'; C.render(); return; }
    const e = evById(R.sel); C.dispatch({ t: 'reject', id: R.sel, reason: String(R.reason).trim() }); R.deciding = false; R.reason = ''; C.toast('Declined · ' + e.title); C.render(); };

  // ════════════════════ SPACES ════════════════════
  V.spaces = () => {
    const week = Array.from({ length: 7 }, (_, i) => C.D.add(C.D.weekStart(C.TODAY), i));
    const cardS = (sp) => { const o = C.occupancy(sp.id, week);
      const next = C.EV.filter((e) => e.space === sp.id && e.status === 'published' && (e.date > C.TODAY || (e.date === C.TODAY && C.pIdx(e.periods[0]) > C.NOW.period))).sort((a, b) => (a.date + C.pIdx(a.periods[0])).localeCompare(b.date + C.pIdx(b.periods[0])))[0];
      return '<article class="scard"><a class="cv" href="#space-' + sp.id + '" aria-label="' + sp.name + '">' + C.A.space(sp.id) + '<span class="chip">' + sp.kind + '</span></a><div class="sb"><div class="st"><a href="#space-' + sp.id + '"><h2>' + sp.name + '</h2></a><span class="m">' + sp.floor + '</span></div>' +
        '<div class="facts3"><span><b class="num">' + sp.capacity + '</b>people</span><span><b>' + sp.area + '</b>area</span><span><b class="num">' + o.pc + '%</b>booked this week</span></div>' +
        '<div class="todayc"><span class="m">Today</span><div class="cells">' + C.PERIODS.map((p) => { const x = C.slot(sp.id, C.TODAY, p.id); return '<i class="cell ' + (x.st === 'mine' ? 'pending' : x.st) + (C.isPast(C.TODAY, p.id) ? ' past' : '') + '" data-tip="' + p.id + ' · ' + p.from + '|' + (x.st === 'booked' ? C.esc(x.ev.title) : x.st === 'closed' ? 'Closed' : 'Free') + '"></i>'; }).join('') + '</div></div>' +
        '<p class="nx">' + (next ? '<span class="m">Next</span>' + C.esc(next.title) + ' · ' + (next.date === C.TODAY ? 'today' : C.fShort(next.date)) + ' · ' + next.periods[0] : 'Nothing booked yet') + '</p>' +
        '<div class="sa"><a class="btn sm" href="#space-' + sp.id + '">Details</a><button class="btn sm dark" type="button" data-act="pickspace" data-id="' + sp.id + '">Book</button></div></div></article>'; };
    const hours = '<section class="card" style="margin-top:16px"><div class="ch"><h2>Periods and opening days</h2><span class="sub">The same six periods everywhere, so bookings never overlap by a few minutes</span></div><div class="hours"><span></span>' + C.PERIODS.map((p) => '<span class="hh"><b class="mono">' + p.id + '</b>' + p.from + '–' + p.to + '</span>').join('') +
      C.SPACES.map((sp) => '<span class="hs">' + sp.name + '<small>' + (sp.closedDow.length ? 'Closed on Sundays' : 'Open every day') + '</small></span>' + C.PERIODS.map(() => '<span class="ho"></span>').join('')).join('') + '</div></section>';
    return '<div class="vh"><div><h1>Spaces</h1><p>' + C.SPACES.length + ' shared spaces, booked by date and period. Court A is the one everyone wants.</p></div><div class="acts"><a class="btn dark" href="#reservations">' + C.ic('building-stadium', 's') + 'Check availability</a></div></div>' +
      '<div class="sgrid in">' + C.SPACES.map(cardS).join('') + '</div>' + hours;
  };
  V.space = (id) => {
    const sp = C.space(id); const week = Array.from({ length: 7 }, (_, i) => C.D.add(C.D.weekStart(C.TODAY), i));
    const up = C.EV.filter((e) => e.space === id && e.status === 'published' && e.date >= C.TODAY && !C.isClass(e)).sort((a, b) => (a.date + C.pIdx(a.periods[0])).localeCompare(b.date + C.pIdx(b.periods[0]))).slice(0, 7);
    const term = C.EV.filter((e) => e.space === id && e.status === 'published' && e.date < C.TODAY && e.date >= '2026-09-01');
    const byOrg = {}; term.forEach((e) => { byOrg[e.organizer] = (byOrg[e.organizer] || 0) + e.periods.length; });
    const orgs = Object.entries(byOrg).sort((a, b) => b[1] - a[1]).slice(0, 5); const mx = orgs.length ? orgs[0][1] : 1;
    const o = C.occupancy(id, week);
    return '<div class="crumbs"><a href="#spaces">Spaces</a>' + C.ic('chevron-right', 's') + '<span>' + sp.name + '</span></div>' +
      '<section class="shero in"><div class="cv">' + C.A.space(id) + '</div><div class="hb"><span class="chip">' + sp.kind + '</span><h1>' + sp.name + '</h1><p class="m">' + sp.floor + '</p>' +
        '<div class="facts3"><span><b class="num">' + sp.capacity + '</b>people</span><span><b>' + sp.area + '</b>area</span><span><b class="num">' + o.pc + '%</b>booked this week</span></div>' +
        '<ul class="feat">' + sp.features.map((f) => '<li>' + C.ic('check', 's') + f + '</li>').join('') + '</ul><div class="alert info">' + C.ic('info-circle', 's') + '<span>' + sp.note + '</span></div>' +
        '<div class="acts"><button class="btn dark" type="button" data-act="pickspace" data-id="' + id + '">' + C.ic('calendar-plus', 's') + 'Book this space</button></div></div></section>' +
      '<div class="grid in" style="margin-top:16px"><section class="card c8"><div class="ch"><h2>This week</h2><span class="sub">Click a period to book it</span></div><div class="wk7"><span></span>' + week.map((d) => '<span class="hh' + (d === C.TODAY ? ' td' : '') + '">' + C.DOW[C.D.dow(d)].slice(0, 3) + '<b>' + C.day(d) + '</b></span>').join('') +
        C.PERIODS.map((p) => '<span class="hp"><b class="mono">' + p.id + '</b>' + p.from + '</span>' + week.map((d) => { const x = C.slot(id, d, p.id); return '<button type="button" class="wc7 ' + (x.st === 'mine' ? 'mine' : x.st) + (x.past ? ' past' : '') + '" data-act="toslot" data-sp="' + id + '" data-d="' + d + '" data-p="' + p.id + '" data-tip="' + C.fShort(d) + ' · ' + p.id + '|' + (x.st === 'booked' ? C.esc(x.ev.title) : x.st === 'closed' ? 'Closed' : x.st === 'free' ? 'Free' : 'Requested') + '" aria-label="' + C.fShort(d) + ' ' + p.id + ': ' + x.st + '"></button>'; }).join('')).join('') + '</div>' +
        '<div class="legend" style="margin-top:12px"><span><i class="cell"></i>Free</span><span><i class="cell booked"></i>Booked</span><span><i class="cell pending"></i>Requested</span><span><i class="cell closed"></i>Closed</span></div></section>' +
        '<section class="card c4"><div class="ch"><h2>Who uses it</h2><span class="sub">this term</span></div><div class="hbars">' + orgs.map(([n, v]) => '<div><span>' + C.esc(n) + '</span><span class="bar"><i style="width:' + Math.round(v / mx * 100) + '%"></i></span><b class="num">' + v + '</b></div>').join('') + '</div><p class="m" style="margin:12px 0 0;font-size:12px">Periods booked since 1 September.</p></section>' +
        '<section class="card c12"><div class="ch"><h2>Coming up here</h2></div><div class="elist">' + up.map((e) => { const c = C.cat(e.cat), r = C.pRange(e.periods);
          return '<a class="erow sm" href="#event-' + e.id + '">' + datet(e.date) + '<span class="et"><b>' + C.esc(e.title) + '</b><span>' + C.esc(e.organizer) + '</span></span><span class="chip" style="background:' + c.soft + ';color:' + c.ink + '"><span class="d"></span>' + c.name + '</span><span class="ew"><span class="mono">' + r.label + ' · ' + r.time + '</span></span><span class="go">' + C.ic('chevron-right', 's') + '</span></a>'; }).join('') + '</div></section></div>';
  };

  // ════════════════════ PARTICIPANTS ════════════════════
  const ptEvents = () => {
    const T = C.TODAY;
    const today = C.EV.filter((e) => e.date === T && e.status === 'published' && e.attendees > 0 && !C.isClass(e));
    const soon = C.EV.filter((e) => e.date > T && e.status === 'published' && !e.series && e.attendees > 0).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
    const past = C.EV.filter((e) => e.date < T && e.status === 'published' && !e.series && e.attendees > 0).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
    return { today, soon, past };
  };
  V.participants = () => {
    const P = st('pt', { ev: null, q: '', f: 'all', qr: false, last: null });
    if (C.S.ptSel) { P.ev = C.S.ptSel; C.S.ptSel = null; }
    const G = ptEvents();
    if (!P.ev) P.ev = (G.today.find((e) => C.pIdx(e.periods[0]) > C.NOW.period) || G.today[0] || G.soon[0]).id;
    const e = evById(P.ev); const ps = C.participants(e); const sp = C.space(e.space);
    const past = e.date < C.TODAY, open = e.date === C.TODAY;
    const n = { all: ps.filter((p) => p.status !== 'waitlist').length, conf: ps.filter((p) => p.status === 'confirmed').length, in: ps.filter((p) => p.checkedAt).length, wait: ps.filter((p) => p.status === 'waitlist').length };
    const missing = n.all - n.in;
    let list = ps.filter((p) => (P.f === 'all' ? p.status !== 'waitlist' : P.f === 'in' ? p.checkedAt : P.f === 'out' ? !p.checkedAt && p.status !== 'waitlist' : p.status === 'waitlist') && (!P.q || p.name.toLowerCase().includes(P.q.toLowerCase())));
    const pc = n.all ? Math.round(n.in / n.all * 100) : 0;
    const opt = (x) => '<option value="' + x.id + '"' + (x.id === e.id ? ' selected' : '') + '>' + C.esc(x.title) + ' · ' + (x.date === C.TODAY ? 'today' : C.fShort(x.date)) + ' ' + x.periods[0] + '</option>';
    const qr = P.qr ? modal('Check people in', '<div class="scan"><div class="vf" aria-hidden="true"><span class="cn q1"></span><span class="cn q2"></span><span class="cn q3"></span><span class="cn q4"></span>' + qrArt(P.last ? P.last.id : 'x') + '<span class="sline"></span></div>' +
      (P.last ? '<div class="scanned in"><span class="avatar t-' + P.last.type + '">' + P.last.initials + '</span><span><b>' + C.esc(P.last.name) + '</b><span>Checked in at ' + C.NOW.time + ' · ' + typeName(P.last.type) + '</span></span>' + C.ic('circle-check', 'l') + '</div>' : '<p class="mtext" style="text-align:center">Point the camera at the code on someone’s ticket.</p>') +
      '<div class="demo-note">' + C.ic('info-circle', 's') + '<span>Simulation: no camera is used. Each scan checks in the next person who hasn’t arrived yet.</span></div></div>',
      '<button class="btn" type="button" data-act="mclose">Done</button><button class="btn dark" type="button" data-act="ptscan"' + (missing ? '' : ' disabled') + '>' + C.ic('qrcode', 's') + (missing ? 'Simulate a scan' : 'Everyone is in') + '</button>') : '';
    return '<div class="vh"><div><h1>Participants</h1><p>Who signed up, who came, and who is waiting for a place.</p></div><div class="acts"><label class="sr" for="f-pt-ev">Event</label><select class="inp" id="f-pt-ev" data-bind="pt.ev" data-live style="min-width:280px">' +
        (G.today.length ? '<optgroup label="Today">' + G.today.map(opt).join('') + '</optgroup>' : '') + '<optgroup label="Coming up">' + G.soon.map(opt).join('') + '</optgroup><optgroup label="Recent">' + G.past.map(opt).join('') + '</optgroup></select></div></div>' +
      '<section class="pthead in" style="' + C.evVars(C.cat(e.cat)) + '"><div class="pi"><span class="gi" style="background:var(--ev-soft);color:var(--ev-ink)">' + C.ic('calendar-event') + '</span><div><b>' + C.esc(e.title) + '</b><span>' + (e.date === C.TODAY ? 'Today' : C.fLong(e.date)) + ' · ' + C.pRange(e.periods).time + ' · ' + sp.name + '</span></div></div>' +
        '<div class="pring"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="18" fill="none" stroke="var(--sand)" stroke-width="5"/><circle cx="22" cy="22" r="18" fill="none" stroke="var(--court)" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + (pc * 1.131).toFixed(1) + ' 200" transform="rotate(-90 22 22)"/></svg><span><b class="num">' + pc + '%</b>' + (past ? 'came' : 'arrived') + '</span></div>' +
        '<div class="pstats"><span><b class="num">' + n.all + '</b>signed up</span><span><b class="num">' + n.conf + '</b>confirmed</span><span><b class="num">' + n.in + '</b>checked in</span><span><b class="num">' + missing + '</b>' + (past ? 'didn’t come' : 'not yet') + '</span>' + (n.wait ? '<span><b class="num">' + n.wait + '</b>waitlist</span>' : '') + '</div>' +
        (past ? '' : '<button class="btn dark" type="button" data-act="ptqr">' + C.ic('qrcode', 's') + 'Scan tickets</button>') + '</section>' +
      (open ? '' : past ? '' : '<div class="alert info" style="margin-top:12px">' + C.ic('info-circle', 's') + '<span>Check-in normally opens 30 minutes before the event. In the demo it’s open so you can try it.</span></div>') +
      '<div class="toolbar" style="margin-top:16px"><div class="search sm"><label class="sr" for="f-pt-q">Search people</label>' + C.ic('search') + '<input id="f-pt-q" type="search" data-bind="pt.q" data-live placeholder="Search by name" value="' + C.esc(P.q) + '"></div>' +
        seg('ptf', [['all', 'Everyone · ' + n.all], ['in', 'Checked in · ' + n.in], ['out', (past ? 'Absent' : 'Not yet') + ' · ' + missing]].concat(n.wait ? [['wait', 'Waitlist · ' + n.wait]] : []), P.f, 'Filter') + '</div>' +
      '<section class="card ptable in" style="padding:6px 0"><div class="tr th"><span>Name</span><span>Type</span><span>Status</span><span>Arrived</span><span></span></div>' +
        (list.length ? list.slice(0, 60).map((p) => '<div class="tr' + (p.checkedAt ? ' in' : '') + '"><span class="nm"><span class="avatar t-' + p.type + '">' + p.initials + '</span><b>' + C.esc(p.name) + '</b></span><span class="m">' + typeName(p.type) + '</span><span>' + (p.status === 'waitlist' ? '<span class="chip lime">Waitlist</span>' : p.status === 'confirmed' ? '<span class="chip ok">Confirmed</span>' : '<span class="chip">Signed up</span>') + '</span>' +
          '<span class="mono">' + (p.checkedAt || '—') + '</span><span class="ta">' + (p.status === 'waitlist' || past ? '' : p.checkedAt ? '<button class="btn sm ghost" type="button" data-act="ptck" data-id="' + p.id + '" data-on="0">Undo</button>' : '<button class="btn sm" type="button" data-act="ptck" data-id="' + p.id + '" data-on="1">' + C.ic('check', 's') + 'Check in</button>') + '</span></div>').join('') + (list.length > 60 ? '<p class="m" style="padding:12px 20px;margin:0">Showing 60 of ' + list.length + '. Search to find someone.</p>' : '')
        : '<p class="m" style="padding:20px;margin:0">No one matches.</p>') + '</section>' + qr;
  };
  function qrArt(seed) { let h = 7; for (const c of String(seed)) h = (h * 31 + c.charCodeAt(0)) >>> 0; const r = () => { h = (h * 1103515245 + 12345) >>> 0; return (h >>> 9) % 2; };
    let cells = ''; for (let y = 0; y < 21; y++) for (let x = 0; x < 21; x++) { const f = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13); if (f) continue; if (r()) cells += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>'; }
    const finder = (x, y) => '<rect x="' + x + '" y="' + y + '" width="7" height="7" fill="none" stroke="#fff" stroke-width="1" transform="translate(.5 .5) scale(.857)" style="transform-box:fill-box"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3"/>';
    return '<svg class="qr" viewBox="-1 -1 23 23" aria-hidden="true"><g fill="#fff">' + cells + '<rect x="0" y="0" width="7" height="7" fill="none" stroke="#fff"/><rect x="14" y="0" width="7" height="7" fill="none" stroke="#fff"/><rect x="0" y="14" width="7" height="7" fill="none" stroke="#fff"/><rect x="2" y="2" width="3" height="3"/><rect x="16" y="2" width="3" height="3"/><rect x="2" y="16" width="3" height="3"/></g></svg>'; }
  QV.ACT.ptf = (el) => { C.S.v.pt.f = el.dataset.v; C.render(); };
  QV.ACT.ptqr = () => { C.S.v.pt.qr = true; C.S.v.pt.last = null; C.render(); };
  QV.ACT.ptck = (el) => { const P = C.S.v.pt; C.dispatch({ t: 'checkin', ev: P.ev, pid: el.dataset.id, on: el.dataset.on === '1', time: C.NOW.time }); C.render(); };
  QV.ACT.ptscan = () => { const P = C.S.v.pt, e = evById(P.ev); const next = C.participants(e).find((p) => p.status !== 'waitlist' && !p.checkedAt); if (!next) return;
    C.dispatch({ t: 'checkin', ev: P.ev, pid: next.id, on: true, time: C.NOW.time }); P.last = next; C.render(); };
  QV.ACT.openpt = (el) => { C.S.ptSel = el.dataset.id; C.go('participants'); };
  const _mclose = QV.ACT.mclose; QV.ACT.mclose = (el) => { if (C.S.v.pt) C.S.v.pt.qr = false; if (C.S.v.us) C.S.v.us.modal = null; if (C.S.v.se) C.S.v.se.modal = null; _mclose(el); };

  // ════════════════════ ANALYTICS ════════════════════
  V.analytics = () => {
    const Y = st('an', { range: 'term' });
    const from = Y.range === 'term' ? '2026-09-01' : C.D.add(C.TODAY, -28), to = C.D.add(C.TODAY, -1);
    const days = []; for (let d = from; d <= to; d = C.D.add(d, 1)) days.push(d);
    const held = C.EV.filter((e) => e.status === 'published' && e.date >= from && e.date <= to);
    const cancelled = C.EV.filter((e) => e.status === 'cancelled' && e.date >= from && e.date <= to).length;
    let open = 0, booked = 0; const bySp = {}, heat = {};
    C.SPACES.forEach((sp) => { let o = 0, b = 0; days.forEach((d) => C.PERIODS.forEach((p) => { const x = C.slot(sp.id, d, p.id); if (x.st === 'closed') return; o++; const k = C.D.dow(d) + '|' + p.id; heat[k] = heat[k] || [0, 0]; heat[k][1]++; if (x.st === 'booked') { b++; heat[k][0]++; } })); bySp[sp.id] = Math.round(b / o * 100); open += o; booked += b; });
    const signed = held.filter((e) => !e.series).reduce((a, e) => a + e.attendees, 0), came = held.filter((e) => !e.series).reduce((a, e) => a + e.checkedIn, 0);
    const reqs = C.RQ.filter((r) => r.createdAt >= from); const appr = reqs.filter((r) => r.status === 'approved').length, rej = reqs.filter((r) => r.status === 'rejected').length;
    const kpi = (l, v, sub) => '<section class="card kpi c3"><div class="lab">' + l + '</div><div class="val num">' + v + '</div><div class="foot"><span>' + sub + '</span></div></section>';
    // weekly events stacked by category, Sep → Dec
    const weeks = []; for (let w = C.D.weekStart('2026-08-31'); w <= '2026-12-14'; w = C.D.add(w, 7)) weeks.push(w);
    const wk = weeks.map((w) => { const evs = C.EV.filter((e) => e.status === 'published' && !e.series && e.date >= w && e.date <= C.D.add(w, 6)); return { w, by: C.CATEGORIES.map((c) => evs.filter((e) => e.cat === c.id).length), n: evs.length, fut: w > C.D.weekStart(C.TODAY) }; });
    const mx = Math.max.apply(null, wk.map((x) => x.n)) || 1; const H = 160, bw = 100 / weeks.length;
    const evChart = '<svg class="chart" viewBox="0 0 640 200" role="img" aria-label="One-off events per week, September to December"><g>' + [0, .5, 1].map((t) => '<line x1="30" x2="640" y1="' + (10 + H - t * H) + '" y2="' + (10 + H - t * H) + '" stroke="var(--line)"/><text x="24" y="' + (14 + H - t * H) + '" text-anchor="end" class="ax">' + Math.round(mx * t) + '</text>').join('') +
      wk.map((x, i) => { let y = 10 + H; const xx = 34 + i * (606 / weeks.length), w = 606 / weeks.length - 6;
        return x.by.map((v, ci) => { const h = v / mx * H; y -= h; return h ? '<rect x="' + xx + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="2" fill="' + C.CATEGORIES[ci].color + '"' + (x.fut ? ' fill-opacity=".28"' : '') + '><title>' + C.CATEGORIES[ci].name + ': ' + v + '</title></rect>' : ''; }).join('') +
          (i % 2 === 0 ? '<text x="' + (xx + w / 2) + '" y="192" text-anchor="middle" class="ax">' + C.day(x.w) + ' ' + C.mon(x.w).slice(0, 3) + '</text>' : ''); }).join('') +
      '<line x1="' + (34 + wk.findIndex((x) => x.fut) * (606 / weeks.length) - 3) + '" x2="' + (34 + wk.findIndex((x) => x.fut) * (606 / weeks.length) - 3) + '" y1="4" y2="' + (10 + H) + '" stroke="var(--ink)" stroke-dasharray="3 3"/><text x="' + (34 + wk.findIndex((x) => x.fut) * (606 / weeks.length)) + '" y="14" class="ax" style="fill:var(--ink)">scheduled →</text></g></svg>';
    const spBars = '<div class="hbars big">' + C.SPACES.slice().sort((a, b) => bySp[b.id] - bySp[a.id]).map((sp) => '<div><span>' + sp.name + '</span><span class="bar"><i style="width:' + bySp[sp.id] + '%"></i></span><b class="num">' + bySp[sp.id] + '%</b></div>').join('') + '</div>';
    const hmax = Math.max.apply(null, Object.values(heat).map(([b, o]) => (o ? b / o : 0)));
    const heatm = '<div class="heat"><span></span>' + C.DOW.map((d) => '<span class="hh">' + d.slice(0, 3) + '</span>').join('') + C.PERIODS.map((p) => '<span class="hp mono">' + p.id + '</span>' + C.DOW.map((_, di) => { const [b, o] = heat[di + '|' + p.id] || [0, 0]; const v = o ? b / o : 0;
      return '<span class="hc" style="--v:' + (v / (hmax || 1)).toFixed(2) + '" data-tip="' + C.DOW[di] + ' · ' + p.id + '|' + Math.round(v * 100) + '% booked">' + (o && v > 0.5 * hmax ? Math.round(v * 100) : '') + '</span>'; }).join('')).join('') + '</div>';
    const byCat = C.CATEGORIES.map((c) => ({ c, n: held.filter((e) => e.cat === c.id && !e.series).length })); const tc = byCat.reduce((a, x) => a + x.n, 0) || 1;
    const catBar = '<div class="stack">' + byCat.map((x) => '<i style="width:' + (x.n / tc * 100) + '%;background:' + x.c.color + '" data-tip="' + x.c.name + '|' + x.n + ' events"></i>').join('') + '</div><div class="slegend">' + byCat.map((x) => '<span><i style="background:' + x.c.color + '"></i>' + x.c.name + '<b class="num">' + Math.round(x.n / tc * 100) + '%</b><small>' + x.n + '</small></span>').join('') + '</div>';
    const months = [['2026-09', 'September'], ['2026-10', 'October'], ['2026-11', 'November so far']].map(([m, l]) => { const ev = C.EV.filter((e) => e.status === 'published' && !e.series && e.date.startsWith(m) && e.date < C.TODAY); return { l, s: ev.reduce((a, e) => a + e.attendees, 0), c: ev.reduce((a, e) => a + e.checkedIn, 0) }; });
    const mm = Math.max.apply(null, months.map((x) => x.s)) || 1;
    const att = '<div class="gbars">' + months.map((x) => '<div class="gb"><div class="cols"><i style="height:' + (x.s / mm * 140) + 'px" data-tip="Signed up|' + x.s + '"></i><i class="c" style="height:' + (x.c / mm * 140) + 'px" data-tip="Came|' + x.c + '"></i></div><b class="num">' + Math.round(x.c / (x.s || 1) * 100) + '%</b><span>' + x.l + '</span></div>').join('') + '</div><div class="legend"><span><i class="cell" style="background:var(--sand);box-shadow:none"></i>Signed up</span><span><i class="cell booked"></i>Came</span></div>';
    // who uses which space: groups → spaces
    const links = {}; held.forEach((e) => { const k = e.group + '|' + e.space; links[k] = (links[k] || 0) + e.periods.length; });
    const gs = C.GROUPS.filter((g) => Object.keys(links).some((k) => k.startsWith(g.id + '|'))); const lmax = Math.max.apply(null, Object.values(links)) || 1;
    const gy = (i) => 20 + i * (300 / Math.max(1, gs.length - 1)), sy = (i) => 40 + i * 65;
    const net = '<svg class="chart net" viewBox="0 0 640 340" role="img" aria-label="Which groups use which spaces"><g fill="none">' + Object.entries(links).map(([k, v]) => { const [g, s] = k.split('|'); const gi = gs.findIndex((x) => x.id === g), si = C.SPACES.findIndex((x) => x.id === s); if (gi < 0) return '';
      const c = C.cat({ falcons: 'sports', herons: 'sports', sport: 'sports', eng: 'academic', robotics: 'academic', arts: 'culture', chess: 'culture' }[g] || 'community').color;
      return '<path d="M190 ' + gy(gi) + ' C 330 ' + gy(gi) + ', 330 ' + sy(si) + ', 470 ' + sy(si) + '" stroke="' + c + '" stroke-opacity=".38" stroke-width="' + Math.max(1, v / lmax * 18).toFixed(1) + '"><title>' + C.group(g).name + ' → ' + C.space(s).name + ': ' + v + ' periods</title></path>'; }).join('') + '</g>' +
      gs.map((g, i) => '<circle cx="190" cy="' + gy(i) + '" r="5" fill="var(--ink)"/><text x="178" y="' + (gy(i) + 4) + '" text-anchor="end" class="lb">' + C.esc(g.name) + '</text>').join('') +
      C.SPACES.map((s, i) => '<rect x="470" y="' + (sy(i) - 14) + '" width="10" height="28" rx="3" fill="var(--court)"/><text x="490" y="' + (sy(i) + 4) + '" class="lb" style="font-weight:600">' + s.name + '</text>').join('') + '</svg>';
    const out = [['Approved', appr, 'var(--ok)'], ['Declined', rej, 'var(--danger)'], ['Cancelled events', cancelled, 'var(--faint)'], ['Waiting', new Set(C.RQ.filter((r) => r.status === 'pending').map((r) => r.eventId)).size, 'var(--court)']]; const om = Math.max.apply(null, out.map((x) => x[1])) || 1;
    const outBars = '<div class="hbars big">' + out.map(([l, v, c]) => '<div><span>' + l + '</span><span class="bar"><i style="width:' + Math.max(2, v / om * 100) + '%;background:' + c + '"></i></span><b class="num">' + v + '</b></div>').join('') + '</div>';
    return '<div class="vh"><div><h1>Analytics</h1><p>How spaces are used and how many people come. Built from this demo’s data.</p></div><div class="acts">' + seg('anrange', [['term', 'This term'], ['4w', 'Last 4 weeks']], Y.range, 'Period') + '</div></div>' +
      '<div class="alert" style="margin-bottom:16px">' + C.ic('info-circle', 's') + '<span>Every number here is generated for the prototype. None of it comes from the original institution.</span></div>' +
      '<div class="grid in">' + kpi('Events held', held.filter((e) => !e.series).length + '<small>+ ' + held.filter((e) => e.series).length + ' sessions</small>', C.fShort(from) + ' to ' + C.fShort(to)) +
        kpi('Spaces booked', Math.round(booked / open * 100) + '%<small>of open periods</small>', booked + ' of ' + open + ' periods') + kpi('People who came', Math.round(came / (signed || 1) * 100) + '%<small>of sign-ups</small>', came.toLocaleString('en') + ' of ' + signed.toLocaleString('en')) +
        kpi('Requests approved', Math.round(appr / ((appr + rej) || 1) * 100) + '%', appr + ' approved · ' + rej + ' declined') +
        '<section class="card c8"><div class="ch"><h2>Events per week</h2><span class="sub">one-off events, by category</span></div>' + evChart + '<div class="legend">' + C.CATEGORIES.map((c) => '<span><i class="cell" style="background:' + c.color + ';box-shadow:none"></i>' + c.name + '</span>').join('') + '</div></section>' +
        '<section class="card c4"><div class="ch"><h2>Most used spaces</h2><span class="sub">share of periods booked</span></div>' + spBars + '</section>' +
        '<section class="card c6"><div class="ch"><h2>When spaces are busiest</h2><span class="sub">all spaces, by day and period</span></div>' + heatm + '</section>' +
        '<section class="card c6"><div class="ch"><h2>Sign-ups and attendance</h2><span class="sub">one-off events</span></div>' + att + '</section>' +
        '<section class="card c8"><div class="ch"><h2>Who uses which space</h2><span class="sub">line width = periods booked</span></div>' + net + '</section>' +
        '<div class="c4" style="display:flex;flex-direction:column;gap:16px"><section class="card"><div class="ch"><h2>Events by category</h2></div>' + catBar + '</section><section class="card"><div class="ch"><h2>Requests</h2><span class="sub">since ' + C.fShort(from) + '</span></div>' + outBars + '</section></div>' +
      '</div>';
  };
  QV.ACT.anrange = (el) => { C.S.v.an.range = el.dataset.v; C.render(); };

  // ════════════════════ USERS AND ROLES ════════════════════
  const lastSeen = (u) => { if (u.id === C.ME) return 'Now'; let h = 0; for (const c of u.id) h = (h * 31 + c.charCodeAt(0)) >>> 0; const d = h % 12; return u.status === 'invited' ? 'Invite sent' : d === 0 ? 'Today' : d === 1 ? 'Yesterday' : d + ' days ago'; };
  V.users = () => {
    const U = st('us', { q: '', role: 'all', type: 'all', status: 'all', sel: null, modal: null });
    const all = C.UU;
    const list = all.filter((u) => (U.role === 'all' || u.role === U.role) && (U.type === 'all' || u.type === U.type) && (U.status === 'all' || u.status === U.status) && (!U.q || (u.name + ' ' + u.email).toLowerCase().includes(U.q.toLowerCase())))
      .sort((a, b) => ['superadmin', 'admin', 'user'].indexOf(a.role) - ['superadmin', 'admin', 'user'].indexOf(b.role) || a.name.localeCompare(b.name));
    const rc = (r) => all.filter((u) => u.role === r).length;
    const badge = (r) => '<span class="rbadge ' + r + '">' + (r === 'superadmin' ? C.ic('shield-check', 's') : r === 'admin' ? C.ic('user-shield', 's') : '') + roleName(r) + '</span>';
    const caps = [['See the agenda and sign up', 1, 1, 1], ['Request spaces', 1, 1, 1], ['Create events', 1, 1, 1], ['Approve and decline requests', 0, 1, 1], ['Manage spaces and check-in', 0, 1, 1], ['Manage users and roles', 0, 0, 1]];
    const u = U.sel ? C.user(U.sel) : null;
    let drawer = '';
    if (u) { const me = u.id === C.ME; const reqs = C.RQ.filter((r) => r.requester === u.id).length; const F = U.f || (U.f = { role: u.role, status: u.status });
      drawer = '<div class="scrim" data-act="usclose"></div><aside class="drawer" role="dialog" aria-modal="true" aria-labelledby="ud-t"><div class="uhead"><span class="avatar big t-' + u.type + '">' + u.initials + '</span><div><h2 id="ud-t">' + u.name + '</h2><span class="m">' + u.email + '</span></div><button class="btn icon sm ghost" type="button" data-act="usclose" aria-label="Close">' + C.ic('x', 's') + '</button></div><div class="body">' +
        '<div class="two"><div><span class="m">Type</span><b>' + typeName(u.type) + '</b><span class="m s">Who they are</span></div><div><span class="m">Group</span><b>' + C.group(u.group).name + '</b><span class="m s">' + reqs + ' requests sent</span></div></div>' +
        '<div class="field"><span class="lb">Role · what they can do</span><div class="radios">' + C.Q.ROLES.map((r) => '<button type="button" role="radio" aria-checked="' + (F.role === r.id) + '" data-act="usrole" data-v="' + r.id + '"' + (me ? ' disabled' : '') + '><span class="rd"></span><span><b>' + r.name + '</b><span>' + r.desc + '</span></span></button>').join('') + '</div>' + (me ? '<span class="help">You can’t change your own role. Another super administrator can.</span>' : '') + '</div>' +
        '<div class="field"><span class="lb">Account</span>' + (me ? '<span class="help">Active · this is you</span>' : seg('usstat', [['active', 'Active'], ['suspended', 'Suspended']].concat(u.status === 'invited' ? [['invited', 'Invited']] : []), F.status, 'Account status')) + '</div>' +
        '<div class="alert info">' + C.ic('info-circle', 's') + '<span>Type and role are separate on purpose: a student can be an administrator, and a teacher can be a regular user.</span></div></div>' +
        '<div class="foot"><button class="btn" type="button" data-act="usclose">Cancel</button><button class="btn dark" type="button" data-act="ussave"' + (me ? ' disabled' : '') + '>Save changes</button></div></aside>'; }
    let inv = '';
    if (U.modal === 'invite') { const F = U.inv || (U.inv = { name: '', email: '', type: 'student', role: 'user', group: 'council', err: {} });
      inv = modal('Invite someone', '<form id="usi" data-form="usinv" novalidate style="display:flex;flex-direction:column;gap:14px">' + field('f-in-n', 'Name', inp('f-in-n', 'us.inv.name', F.name, 'autocomplete="off"', F.err.name), F.err.name) + field('f-in-e', 'Email', inp('f-in-e', 'us.inv.email', F.email, 'type="email" autocomplete="off" placeholder="name@valemont.example"', F.err.email), F.err.email) +
        '<div class="two-f"><div class="field"><label for="f-us-inv-type">Type</label>' + sel('us.inv.type', C.Q.USER_TYPES.map((t) => [t.id, t.name]), F.type, 'Type') + '</div><div class="field"><label for="f-us-inv-role">Role</label>' + sel('us.inv.role', C.Q.ROLES.map((r) => [r.id, r.name]), F.role, 'Role') + '</div></div>' +
        '<div class="field"><label for="f-us-inv-group">Group</label>' + sel('us.inv.group', C.GROUPS.map((g) => [g.id, g.name]), F.group, 'Group') + '</div><p class="mtext">In the demo no email is sent. The person appears in the list as invited.</p></form>',
        '<button class="btn" type="button" data-act="mclose">Cancel</button><button class="btn dark" type="submit" form="usi">Send invite</button>'); }
    return '<div class="vh"><div><h1>Users and roles</h1><p>' + all.length + ' people. What someone is (student, teacher, club) and what they can do (their role) are kept apart.</p></div><div class="acts"><button class="btn dark" type="button" data-act="usinvite">' + C.ic('plus', 's') + 'Invite someone</button></div></div>' +
      '<div class="grid in"><div class="c8" style="display:flex;flex-direction:column;gap:16px"><div class="roles3">' + C.Q.ROLES.map((r) => '<button type="button" class="rcard' + (U.role === r.id ? ' on' : '') + '" data-act="usrolef" data-v="' + r.id + '">' + badge(r.id) + '<b class="num">' + rc(r.id) + '</b><span>' + r.desc + '</span></button>').join('') + '</div>' +
        '<div class="toolbar"><div class="search sm"><label class="sr" for="f-us-q">Search people</label>' + C.ic('search') + '<input id="f-us-q" type="search" data-bind="us.q" data-live placeholder="Search by name or email" value="' + C.esc(U.q) + '"></div>' +
          sel('us.type', [['all', 'Every type']].concat(C.Q.USER_TYPES.map((t) => [t.id, t.name])), U.type, 'Type', true) + sel('us.status', [['all', 'Any status'], ['active', 'Active'], ['invited', 'Invited'], ['suspended', 'Suspended']], U.status, 'Status', true) + (U.role !== 'all' ? '<button class="btn sm ghost" type="button" data-act="usrolef" data-v="all">Clear role ' + C.ic('x', 's') + '</button>' : '') + '</div>' +
        '<section class="card utable" style="padding:6px 0"><div class="tr th"><span>Person</span><span>Type</span><span>Role</span><span>Status</span><span>Last seen</span></div>' + (list.length ? list.map((x) => '<button type="button" class="tr" data-act="ussel" data-id="' + x.id + '"><span class="nm"><span class="avatar t-' + x.type + '">' + x.initials + '</span><span><b>' + x.name + (x.id === C.ME ? ' <small class="you">you</small>' : '') + '</b><span class="m">' + x.email + '</span></span></span><span class="m">' + typeName(x.type) + '</span><span>' + badge(x.role) + '</span><span>' +
          (x.status === 'active' ? '<span class="chip ok"><span class="d"></span>Active</span>' : x.status === 'invited' ? '<span class="chip blue"><span class="d"></span>Invited</span>' : '<span class="chip bad"><span class="d"></span>Suspended</span>') + '</span><span class="m">' + lastSeen(x) + '</span></button>').join('') : '<p class="m" style="padding:20px;margin:0">No one matches.</p>') + '</section></div>' +
      '<section class="card c4 caps"><div class="ch"><h2>What each role can do</h2></div><div class="cmx"><span></span><span class="m">User</span><span class="m">Admin</span><span class="m">Super</span>' + caps.map(([l, a, b, c]) => '<span>' + l + '</span>' + [a, b, c].map((v) => '<span class="cv">' + (v ? C.ic('check', 's') : '<i></i>') + '</span>').join('')).join('') + '</div></section></div>' + drawer + inv;
  };
  QV.ACT.ussel = (el) => { const U = C.S.v.us; U.sel = el.dataset.id; U.f = null; C.render(); };
  QV.ACT.usclose = () => { C.S.v.us.sel = null; C.render(); };
  QV.ACT.usrole = (el) => { C.S.v.us.f.role = el.dataset.v; C.render(); };
  QV.ACT.usstat = (el) => { C.S.v.us.f.status = el.dataset.v; C.render(); };
  QV.ACT.usrolef = (el) => { const U = C.S.v.us; U.role = U.role === el.dataset.v ? 'all' : el.dataset.v; C.render(); };
  QV.ACT.ussave = () => { const U = C.S.v.us, u = C.user(U.sel); if (U.f.role !== u.role) C.dispatch({ t: 'role', uid: u.id, role: U.f.role }); if (U.f.status !== u.status) C.dispatch({ t: 'ustatus', uid: u.id, status: U.f.status }); U.sel = null; C.render(); C.toast('Saved · ' + u.name); };
  QV.ACT.usinvite = () => { C.S.v.us.modal = 'invite'; C.S.v.us.inv = null; C.render(); };
  QV.SUBMIT.usinv = () => { const F = C.S.v.us.inv, err = {};
    if (!String(F.name).trim().includes(' ')) err.name = 'Enter a first and last name.';
    if (!/^\S+@\S+\.\S+$/.test(F.email)) err.email = 'That doesn’t look like an email address.'; else if (C.UU.some((u) => u.email === F.email)) err.email = 'Someone already uses that email.';
    F.err = err; if (Object.keys(err).length) { C.render(); return; }
    C.dispatch({ t: 'invite', name: String(F.name).trim(), email: F.email, type: F.type, role: F.role, group: F.group }); C.S.v.us.modal = null; C.S.v.us.status = 'all'; C.render(); C.toast('Invite ready for ' + String(F.name).trim() + ' · nothing is emailed in the demo'); };

  // ════════════════════ NOTIFICATIONS ════════════════════
  const KINDS = { request: 'requests', conflict: 'requests', approved: 'decisions', rejected: 'decisions', updated: 'events', cancelled: 'events', participant: 'people' };
  V.notifications = () => {
    const F = st('nt', { f: 'all' });
    const list = C.NT.filter((n) => F.f === 'all' || (F.f === 'unread' ? n.unread : KINDS[n.kind] === F.f));
    const byDay = {}; list.forEach((n) => { const d = n.at.slice(0, 10); (byDay[d] = byDay[d] || []).push(n); });
    const unread = C.NT.filter((n) => n.unread).length;
    return '<div class="vh"><div><h1>Notifications</h1><p>' + (unread ? unread + ' unread. ' : 'You’re up to date. ') + 'Requests, decisions, changes and sign-ups, newest first.</p></div><div class="acts"><button class="btn" type="button" data-act="readall">' + C.ic('check', 's') + 'Mark all as read</button></div></div>' +
      '<div class="toolbar">' + seg('ntf', [['all', 'All'], ['unread', 'Unread'], ['requests', 'Requests'], ['decisions', 'Decisions'], ['events', 'Event changes'], ['people', 'People']], F.f, 'Filter') + '</div>' +
      (list.length ? Object.keys(byDay).sort().reverse().map((d) => '<section class="nday in"><h2>' + (d === C.TODAY ? 'Today' : d === C.D.add(C.TODAY, -1) ? 'Yesterday' : C.fLong(d)) + '</h2><div class="card nlist">' + byDay[d].map((n) => '<button type="button" class="nrow' + (n.unread ? ' unread' : '') + '" data-act="ntopen" data-id="' + n.id + '"><span class="ni ' + n.kind + '">' + C.ic({ request: 'inbox', conflict: 'alert-triangle', participant: 'user-check', updated: 'refresh', approved: 'circle-check', cancelled: 'circle-x', rejected: 'circle-x' }[n.kind] || 'info-circle', 's') + '</span><span class="t">' + C.esc(n.text) + '</span><span class="w mono">' + n.at.slice(11, 16) + '</span>' + (n.ref ? C.ic('chevron-right', 's') : '<span></span>') + '</button>').join('') + '</div></section>').join('')
        : empty('Nothing here', 'No notifications match this filter.'));
  };
  QV.ACT.ntf = (el) => { C.S.v.nt.f = el.dataset.v; C.render(); };
  QV.ACT.ntopen = (el) => { const n = C.NT.find((x) => x.id === el.dataset.id); if (!n) return; n.unread = false; if (!C.saved.read.includes(n.id)) C.saved.read.push(n.id); C.persist();
    const e = n.ref && evById(n.ref); if (e) { if (e.status === 'pending') { C.S.reqSel = e.id; C.go('requests'); } else C.go('event-' + e.id); } else C.render(); };

  // ════════════════════ SETTINGS ════════════════════
  V.account = () => {
    const T = st('se', { tab: 'profile', modal: null, pw: { cur: '', nw: '', err: {} }, sessions: ['phone'], prof: { name: 'Jordan Reyes', phone: '' } });
    const P = C.saved.prefs; P.notif = P.notif || { request: true, conflict: true, decision: true, change: true, wait: false, digest: false };
    const me = C.user(C.ME);
    let body = '';
    if (T.tab === 'profile') body = '<div class="prof"><span class="avatar xl">' + me.initials + '</span><div><b>' + me.name + '</b><span class="m">' + typeName(me.type) + ' · ' + C.group(me.group).name + '</span><span class="rbadge superadmin" style="margin-top:6px">' + C.ic('shield-check', 's') + 'Super administrator</span></div></div>' +
      '<form data-form="seprof" novalidate style="display:flex;flex-direction:column;gap:14px;max-width:520px">' + field('f-se-n', 'Name', inp('f-se-n', 'se.prof.name', T.prof.name)) + field('f-se-e', 'Email', '<input class="inp" id="f-se-e" value="' + me.email + '" readonly>', null, 'Your email is managed by the institution.') +
      field('f-se-p', 'Phone <span style="font-weight:400;color:var(--muted)">(optional)</span>', inp('f-se-p', 'se.prof.phone', T.prof.phone, 'type="tel" placeholder="+1 555 0100"')) + '<div><button class="btn dark" type="submit">Save profile</button></div></form>';
    if (T.tab === 'notifications') body = '<div class="tgs">' + [['request', 'New requests', 'When someone asks for a space you manage.'], ['conflict', 'Conflicts', 'When two requests want the same period.'], ['decision', 'Decisions on your requests', 'Approved or declined.'], ['change', 'Event changes', 'Time, space or cancellation.'], ['wait', 'Waitlist movement', 'When someone gets a place from the waitlist.'], ['digest', 'Daily email digest', 'One email at 8:00 with everything from the day before.']].map(([k, l, d]) => toggle('prefs.notif.' + k, P.notif[k], l, d)).join('') + '</div>';
    if (T.tab === 'appearance') body = '<div class="field"><span class="lb">Density</span>' + seg('seden', [['comfortable', 'Comfortable'], ['compact', 'Compact']], P.density || 'comfortable', 'Density') + '<span class="help">Compact fits more rows on the calendar and lists.</span></div>' + toggle('prefs.calm', !!P.calm, 'Calm motion', 'Turns off entrance animations. Quadra also follows your system’s reduced-motion setting.');
    if (T.tab === 'security') body = '<div class="sec2"><div class="card flat"><div class="ch"><h2>' + C.ic('shield-check', 's') + 'Two-step verification</h2><span class="chip ok"><span class="d"></span>On</span></div><p class="mtext">Codes come from your authenticator app. Keep your backup codes somewhere safe.</p><button class="btn sm" type="button" data-act="secodes">Show backup codes</button></div>' +
      '<div class="card flat"><div class="ch"><h2>Where you’re signed in</h2></div><div class="sess"><div><b>This browser</b><span class="m">Active now · Harbor District</span><span class="chip lime">This device</span></div>' + (T.sessions.includes('phone') ? '<div><b>Phone · mobile browser</b><span class="m">2 days ago · Harbor District</span><button class="btn sm ghost" type="button" data-act="sesout">Sign out</button></div>' : '') + '</div></div></div>' +
      '<form data-form="sepw" novalidate style="display:flex;flex-direction:column;gap:14px;max-width:520px;margin-top:20px"><h3 style="margin:0;font-size:15px">Change password</h3>' + field('f-pw-c', 'Current password', inp('f-pw-c', 'se.pw.cur', T.pw.cur, 'type="password" autocomplete="current-password"', T.pw.err.cur), T.pw.err.cur) +
      field('f-pw-n', 'New password', inp('f-pw-n', 'se.pw.nw', T.pw.nw, 'type="password" autocomplete="new-password"', T.pw.err.nw), T.pw.err.nw, 'At least 12 characters.') + '<div><button class="btn dark" type="submit">Update password</button></div></form>';
    if (T.tab === 'demo') body = '<div class="sec2"><div class="card flat"><div class="ch"><h2>' + C.ic('refresh', 's') + 'Start the demo over</h2></div><p class="mtext">Puts every request, approval, check-in and new event back the way it was. Your appearance settings stay.</p><button class="btn dark" type="button" data-act="reset">Reset the demo data</button></div>' +
      '<div class="card flat"><div class="ch"><h2>' + C.ic('logout', 's') + 'Sign out</h2></div><p class="mtext">Back to the sign-in screen. Your changes stay in this page until you reset them or reload it.</p><button class="btn" type="button" data-act="signout">Sign out</button></div></div>' +
      '<p class="mtext" style="margin-top:18px">Quadra is a fictional product made for a portfolio. It reimagines an events and space-booking system built as a university project.</p>';
    const codes = T.modal === 'codes' ? modal('Backup codes', '<div class="codes mono">' + ['4KQ2-91LT', 'X7M3-0PZR', '2HD8-QW4N', 'B9TS-6YJ1', 'LP3C-8VXE', 'R5NA-2GUK'].map((c) => '<span>' + c + '</span>').join('') + '</div><p class="mtext">Demo codes. Each one works once in a real setup.</p>', '<button class="btn dark" type="button" data-act="mclose">Done</button>') : '';
    return '<div class="vh"><div><h1>Settings</h1><p>Your profile, notifications, appearance and security.</p></div></div>' +
      '<div class="setw">' + '<nav class="snav" aria-label="Settings">' + [['profile', 'user-check', 'Profile'], ['notifications', 'bell', 'Notifications'], ['appearance', 'adjustments-horizontal', 'Appearance'], ['security', 'lock', 'Security'], ['demo', 'refresh', 'Demo']].map(([k, i, l]) => '<button type="button" data-act="setab" data-v="' + k + '" aria-current="' + (T.tab === k ? 'page' : 'false') + '">' + C.ic(i, 's') + l + '</button>').join('') + '</nav>' +
      '<section class="card in sbody">' + body + '</section></div>' + codes;
  };
  QV.ACT.setab = (el) => { C.S.v.se.tab = el.dataset.v; C.render(); };
  QV.ACT.seden = (el) => { C.saved.prefs.density = el.dataset.v; C.persist(); C.render(); };
  QV.ACT.secodes = () => { C.S.v.se.modal = 'codes'; C.render(); };
  QV.ACT.sesout = () => { C.S.v.se.sessions = []; C.render(); C.toast('Signed out of the phone'); };
  QV.ACT.signout = () => C.signOut();
  QV.SUBMIT.seprof = () => { const n = String(C.S.v.se.prof.name).trim(); if (!n) { C.toast('Your name can’t be empty'); return; } C.toast('Profile saved'); };
  QV.SUBMIT.sepw = () => { const T = C.S.v.se, e = {}; if (!T.pw.cur) e.cur = 'Enter your current password.'; if (String(T.pw.nw).length < 12) e.nw = 'Use at least 12 characters.'; T.pw.err = e; if (Object.keys(e).length) { C.render(); return; } T.pw = { cur: '', nw: '', err: {} }; C.render(); C.toast('Password updated · demo only'); };

  // ════════════════════ PUBLIC AGENDA ════════════════════
  const pubEvents = () => C.EV.filter((e) => e.public && e.status === 'published' && e.date >= C.TODAY && !(e.date === C.TODAY && C.pIdx(e.periods[e.periods.length - 1]) <= C.NOW.period));
  const spotsChip = (e) => e.attendees >= e.capacity ? '<span class="chip lime">Full · waitlist</span>' : e.capacity - e.attendees <= 10 ? '<span class="chip warn">' + (e.capacity - e.attendees) + ' places left</span>' : '<span class="chip">' + (e.capacity - e.attendees) + ' places</span>';
  function pubShell(inner) {
    return '<div class="pub"><header class="ph2"><a class="pbrand" href="#agenda"><span class="ws1">V</span><span><b>Valemont Institute</b><span>What’s on</span></span></a><nav aria-label="Agenda"><a href="#agenda">Agenda</a><a href="#agenda" data-act="pubspaces">Spaces</a></nav>' +
      '<a class="btn ' + (C.saved.authed ? 'dark' : '') + '" href="#' + (C.saved.authed ? 'dashboard' : 'login') + '">' + (C.saved.authed ? C.ic('arrow-left', 's') + 'Back to Quadra' : 'Staff sign in') + '</a></header>' + inner +
      '<footer class="pf"><span class="wordmark" style="font-size:15px"><span class="mark" style="width:16px;height:16px;gap:1.5px"><i></i><i></i><i></i><i></i></span>quadra</span><span>Agenda powered by Quadra. A fictional product and institution, made for a portfolio.</span></footer></div>';
  }
  V.agenda = () => {
    const G = st('ag', { cat: 'all', when: 'month', q: '', view: 'list', monthOf: C.TODAY });
    const all = pubEvents();
    const feat = all.filter((e) => e.featured).sort((a, b) => a.date.localeCompare(b.date));
    const hero = feat[0] || all[0];
    const end = { week: C.D.add(C.D.weekStart(C.TODAY), 6), weekend: C.D.add(C.D.weekStart(C.TODAY), 6), month: C.TODAY.slice(0, 8) + '31', all: '2099-01-01' }[G.when];
    const startW = G.when === 'weekend' ? C.D.add(C.D.weekStart(C.TODAY), 5) : C.TODAY;
    const list = all.filter((e) => (G.cat === 'all' || e.cat === G.cat) && e.date >= startW && e.date <= end && (!G.q || (e.title + ' ' + e.organizer).toLowerCase().includes(G.q.toLowerCase()))).sort((a, b) => (a.date + C.pIdx(a.periods[0])).localeCompare(b.date + C.pIdx(b.periods[0])));
    const byDay = {}; list.forEach((e) => { (byDay[e.date] = byDay[e.date] || []).push(e); });
    const hc = C.cat(hero.cat);
    let main;
    if (G.view === 'list') main = list.length ? Object.keys(byDay).map((d) => '<section class="pday"><h3><b>' + C.day(d) + '</b><span>' + C.DOW[C.D.dow(d)] + '<small>' + C.mon(d) + (d === C.TODAY ? ' · today' : '') + '</small></span></h3><div class="plist">' + byDay[d].map((e) => { const c = C.cat(e.cat), r = C.pRange(e.periods);
        return '<a class="prow" href="#agenda-' + e.id + '"><span class="mono tm">' + C.per(e.periods[0]).from + '</span><span class="pt"><b>' + C.esc(e.title) + '</b><span><i style="background:' + c.color + '"></i>' + c.name + ' · ' + C.space(e.space).name + ' · ' + C.esc(e.organizer) + '</span></span>' + spotsChip(e) + '<span class="go">' + C.ic('arrow-right', 's') + '</span></a>'; }).join('') + '</div></section>').join('')
      : empty('Nothing on for this selection', 'Try another category or a longer period.', '<button class="btn" type="button" data-act="agclear">Show everything</button>');
    else {
      const of = G.monthOf, first = of.slice(0, 8) + '01', start = C.D.weekStart(first); const dim = new Date(Date.UTC(+first.slice(0, 4), +first.slice(5, 7), 0)).getUTCDate(); const weeks = Math.ceil((C.D.dow(first) + dim) / 7);
      const evs = all.filter((e) => G.cat === 'all' || e.cat === G.cat);
      main = '<div class="pcalh"><button class="btn icon" type="button" data-act="agmon" data-n="-1" aria-label="Previous month">' + C.ic('chevron-left', 's') + '</button><b>' + C.mon(of) + ' ' + of.slice(0, 4) + '</b><button class="btn icon" type="button" data-act="agmon" data-n="1" aria-label="Next month">' + C.ic('chevron-right', 's') + '</button></div><div class="month pcal">' + C.DOW.map((w) => '<div class="mh">' + w.slice(0, 3) + '</div>').join('') +
        Array.from({ length: weeks * 7 }, (_, i) => { const d = C.D.add(start, i); const l = evs.filter((e) => e.date === d);
          return '<div class="md' + (C.D.month(d) !== C.D.month(of) ? ' out' : '') + (d === C.TODAY ? ' td' : '') + '"><span class="n">' + C.day(d) + '</span>' + l.slice(0, 3).map((e) => { const c = C.cat(e.cat); return '<a class="ev" href="#agenda-' + e.id + '" style="' + C.evVars(c) + '"><b>' + C.esc(e.title) + '</b></a>'; }).join('') + (l.length > 3 ? '<span class="more">+' + (l.length - 3) + '</span>' : '') + '</div>'; }).join('') + '</div>';
    }
    return pubShell('<section class="phero in"><div class="pt1"><span class="kick">' + C.fLong(C.TODAY) + ' · ' + all.length + ' things coming up</span><h1>What’s on<br>at Valemont</h1><p>Games, talks, open studios and community mornings. Open to everyone unless it says otherwise.</p>' +
        '<div class="search big"><label class="sr" for="f-ag-q">Search the agenda</label>' + C.ic('search') + '<input id="f-ag-q" type="search" data-bind="ag.q" data-live placeholder="Search events or organizers" value="' + C.esc(G.q) + '"></div></div>' +
      '<a class="pfeat" href="#agenda-' + hero.id + '" style="' + C.evVars(hc) + '"><span class="cv">' + C.A.cover(hero.cat) + '<span class="chip">Featured · ' + hc.name + '</span></span><span class="fb"><span class="mono">' + C.fShort(hero.date) + ' · ' + C.pRange(hero.periods).time + '</span><b>' + C.esc(hero.title) + '</b><span>' + C.space(hero.space).name + ' · ' + C.esc(hero.organizer) + '</span><span class="fr">' + spotsChip(hero) + '<span class="btn sm dark">See details ' + C.ic('arrow-right', 's') + '</span></span></span></a></section>' +
      '<section class="pmain"><div class="pbar"><div class="pcats" role="group" aria-label="Category">' + [['all', 'Everything', 'var(--ink)']].concat(C.CATEGORIES.map((c) => [c.id, c.name, c.color])).map(([v, l, col]) => '<button type="button" data-act="agcat" data-v="' + v + '" aria-pressed="' + (G.cat === v) + '"><i style="background:' + col + '"></i>' + l + '</button>').join('') + '</div><span class="sp"></span>' +
        (G.view === 'list' ? seg('agwhen', [['week', 'This week'], ['weekend', 'Weekend'], ['month', 'This month'], ['all', 'All']], G.when, 'When') : '') + seg('agview', [['list', 'List'], ['cal', 'Calendar']], G.view, 'View') + '</div>' + '<div class="in">' + main + '</div></section>' +
      '<section class="pspaces" id="pub-spaces"><h2>Where things happen</h2><div class="psg">' + C.SPACES.map((s) => '<div class="psc"><span class="cv">' + C.A.space(s.id) + '</span><b>' + s.name + '</b><span>' + s.kind + ' · up to ' + s.capacity + '</span><span class="m">' + s.floor + '</span></div>').join('') + '</div></section>');
  };
  V.agendaEvent = (id) => {
    const e = evById(id); const c = C.cat(e.cat), sp = C.space(e.space), r = C.pRange(e.periods); const mine = C.RSVP[e.id];
    const full = e.attendees >= e.capacity; const pc = Math.min(100, Math.round(e.attendees / e.capacity * 100));
    const more = pubEvents().filter((x) => x.id !== e.id && x.date >= C.TODAY && x.date <= C.D.add(C.TODAY, 14)).slice(0, 4);
    return pubShell('<div class="pev in"><a class="back" href="#agenda">' + C.ic('arrow-left', 's') + 'All events</a><div class="pevc" style="' + C.evVars(c) + '"><div class="cv">' + C.A.cover(e.cat) + '</div>' +
      '<div class="pevg"><div><span class="chip" style="background:' + c.soft + ';color:' + c.ink + '"><span class="d"></span>' + c.name + '</span><h1>' + C.esc(e.title) + '</h1><p class="lead">' + C.esc(e.desc) + '</p>' +
        '<div class="pfacts"><div>' + C.ic('calendar') + '<span><b>' + C.fLong(e.date) + '</b><span>' + (e.date === C.TODAY ? 'Today' : 'In ' + C.D.diff(C.TODAY, e.date) + ' days') + '</span></span></div><div>' + C.ic('clock') + '<span><b class="mono">' + r.time + '</b><span>Doors open 15 minutes before</span></span></div>' +
        '<div>' + C.ic('map-pin') + '<span><b>' + sp.name + '</b><span>' + sp.floor + '</span></span></div><div>' + C.ic('users') + '<span><b>' + C.esc(e.organizer) + '</b><span>Organizer</span></span></div></div></div>' +
      '<aside class="pcta"><div class="cap"><div class="row"><b style="color:var(--ink);font-size:30px;letter-spacing:-.04em">' + (full ? 'Full' : (e.capacity - e.attendees) + '<small style="font-size:14px;color:var(--muted);font-weight:500"> places left</small>') + '</b></div><div class="bar"><i style="width:' + pc + '%"></i></div><div class="row"><span>' + e.attendees + ' going</span><span>' + (e.waitlist ? e.waitlist + ' waiting' : e.capacity + ' places') + '</span></div></div>' +
        (mine ? '<div class="alert ok">' + C.ic('circle-check', 's') + '<span><b>' + (mine === 'going' ? 'You’re on the list.' : 'You’re on the waitlist.') + '</b>' + (mine === 'going' ? 'Show your name at the door.' : 'We’ll let you know if a place opens.') + '</span></div>' :
          '<button class="btn dark full" type="button" data-act="rsvp" data-id="' + e.id + '">' + (full ? 'Join the waitlist' : 'Sign up') + '</button>') +
        '<p class="m" style="margin:0;font-size:12px;text-align:center">Demo: signing up only changes this page.</p>' +
        '<div class="pspace"><span class="cv">' + C.A.space(sp.id) + '</span><span><b>' + sp.name + '</b><span>' + sp.kind + ' · up to ' + sp.capacity + '</span></span></div></aside></div></div>' +
      (more.length ? '<section class="pmore"><h2>Also coming up</h2><div class="pmg">' + more.map((x) => { const cc = C.cat(x.cat); return '<a class="ecard" href="#agenda-' + x.id + '"><span class="cv">' + C.A.cover(x.cat) + '<span class="chip">' + cc.name + '</span></span><span class="eb"><span class="mono">' + C.fShort(x.date) + ' · ' + C.pRange(x.periods).time + '</span><b>' + C.esc(x.title) + '</b><span>' + C.space(x.space).name + '</span></span></a>'; }).join('') + '</div></section>' : '') + '</div>');
  };
  QV.ACT.agcat = (el) => { C.S.v.ag.cat = el.dataset.v; C.render(); };
  QV.ACT.agwhen = (el) => { C.S.v.ag.when = el.dataset.v; C.render(); };
  QV.ACT.agview = (el) => { C.S.v.ag.view = el.dataset.v; C.render(); };
  QV.ACT.agclear = () => { Object.assign(C.S.v.ag, { cat: 'all', when: 'all', q: '' }); C.render(); };
  QV.ACT.agmon = (el) => { const G = C.S.v.ag; const d = C.D.parse(G.monthOf.slice(0, 8) + '01'); d.setUTCMonth(d.getUTCMonth() + Number(el.dataset.n)); G.monthOf = C.D.fmt(d); C.render(); };
  QV.ACT.pubspaces = () => { const s = document.getElementById('pub-spaces'); if (s) s.scrollIntoView({ behavior: C.reduce ? 'auto' : 'smooth' }); else C.go('agenda'); };
  QV.ACT.rsvp = (el) => { const e = evById(el.dataset.id); const full = e.attendees >= e.capacity; C.dispatch({ t: 'rsvp', ev: e.id }); C.render(); C.toast(full ? 'You’re on the waitlist' : 'You’re signed up for ' + e.title); };

  // ════════════════════ dispatch ════════════════════
  QV.view = (r, ctx) => {
    C = ctx;
    const m = r.match(/^(event|space|agenda)-([A-Za-z0-9-]+)$/);
    if (m) return m[1] === 'event' ? V.event(m[2]) : m[1] === 'space' ? V.space(m[2]) : V.agendaEvent(m[2]);
    return (V[r] || V.events)();
  };
  QV.title = (r, ctx) => { C = ctx; const m = r.match(/^(event|space|agenda)-(.+)$/); if (m) { if (m[1] === 'space') return C.space(m[2]).name; const e = evById(m[2]); return e ? e.title : 'Event'; } return TITLES[r] || 'Quadra'; };
  const wrap = (o) => { Object.keys(o).forEach((k) => { const f = o[k]; o[k] = (a, ctx, ev) => { if (ctx) C = ctx; return f(a, C, ev); }; }); };
  window.QV = QV;
  QV.init = (ctx) => { C = ctx; wrap(QV.ACT); wrap(QV.SUBMIT); };
})();
