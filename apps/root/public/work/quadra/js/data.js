/* Quadra demo data. Everything here is fictional and generated the same way every time,
   so every screen (dashboard, calendar, reservations, analytics) reads one coherent set. */
(function () {
  'use strict';

  // ── time model ─────────────────────────────────────────────
  // The original system booked the court by date + period (P1 19:15–20:55, P2 21:10–22:50).
  // Quadra keeps that model and extends it to the whole day.
  const PERIODS = [
    { id: 'M1', from: '08:00', to: '09:40', part: 'morning' },
    { id: 'M2', from: '10:00', to: '11:40', part: 'morning' },
    { id: 'A1', from: '13:30', to: '15:10', part: 'afternoon' },
    { id: 'A2', from: '15:30', to: '17:10', part: 'afternoon' },
    { id: 'P1', from: '19:15', to: '20:55', part: 'evening' },
    { id: 'P2', from: '21:10', to: '22:50', part: 'evening' }
  ];
  const TODAY = '2026-11-16';          // Monday. The demo always lives in this week.
  const NOW = { period: 1, time: '10:24' };  // during M2

  // ── dates (UTC, no timezone surprises) ─────────────────────
  const D = {
    parse: (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); },
    fmt: (dt) => dt.toISOString().slice(0, 10),
    add: (s, n) => { const dt = D.parse(s); dt.setUTCDate(dt.getUTCDate() + n); return D.fmt(dt); },
    dow: (s) => (D.parse(s).getUTCDay() + 6) % 7,               // 0 = Monday
    weekStart: (s) => D.add(s, -D.dow(s)),
    diff: (a, b) => Math.round((D.parse(b) - D.parse(a)) / 864e5),
    month: (s) => s.slice(0, 7)
  };

  // ── seeded randomness ──────────────────────────────────────
  let seed = 20261116;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const between = (a, b) => a + Math.floor(rnd() * (b - a + 1));

  // ── workspace ──────────────────────────────────────────────
  const WORKSPACE = { name: 'Valemont Institute', short: 'Valemont', city: 'Harbor District' };

  const SPACES = [
    { id: 'court', name: 'Court A', kind: 'Multisport court', capacity: 120, area: '1,080 m²', floor: 'Ground floor · East wing',
      features: ['Futsal, basketball and volleyball lines', 'LED lighting for evening games', 'Bleachers for 120', 'Scoreboard'],
      note: 'Evening periods P1 and P2 are kept for athletic clubs during the season.', closedDow: [6] },
    { id: 'auditorium', name: 'Auditorium', kind: 'Lecture hall', capacity: 220, area: '410 m²', floor: 'Level 1 · Main building',
      features: ['Raked seating for 220', 'Projector and two screens', 'Stage with sound desk', 'Step-free access'],
      note: 'Technical setup needs one period before the event.', closedDow: [6] },
    { id: 'studio', name: 'Studio 2', kind: 'Multipurpose room', capacity: 40, area: '120 m²', floor: 'Level 2 · Arts building',
      features: ['Sprung floor and mirrors', 'Movable tables and chairs', 'Speaker system', 'Natural light'],
      note: 'Shoes off on the sprung floor.', closedDow: [6] },
    { id: 'commons', name: 'The Commons', kind: 'Shared lounge', capacity: 80, area: '300 m²', floor: 'Ground floor · Library side',
      features: ['Open plan with round tables', 'Power at every table', 'Small stage corner', 'Open late'],
      note: 'Open to everyone outside booked periods.', closedDow: [] },
    { id: 'activity', name: 'Activity Center', kind: 'Workshop hall', capacity: 60, area: '240 m²', floor: 'Ground floor · North wing',
      features: ['Workbenches and storage', 'Mats for group activities', 'Two breakout corners', 'Loading door'],
      note: 'Tools are signed out at the front desk.', closedDow: [6] }
  ];

  const CATEGORIES = [
    { id: 'sports', name: 'Sports', color: '#2F4FE0', soft: '#E4E9FD', ink: '#1A2C8F' },
    { id: 'academic', name: 'Academic', color: '#0E8C6B', soft: '#DDF2EB', ink: '#095640' },
    { id: 'culture', name: 'Culture', color: '#C9761A', soft: '#F8EBD9', ink: '#7A4206' },
    { id: 'community', name: 'Community', color: '#C2416C', soft: '#F8E1E9', ink: '#7C1F40' }
  ];

  // user category ≠ permission level (the original system kept the two apart)
  const USER_TYPES = [
    { id: 'student', name: 'Student' }, { id: 'teacher', name: 'Teacher' },
    { id: 'athletic', name: 'Athletic club' }, { id: 'community', name: 'Community' }, { id: 'staff', name: 'Staff' }
  ];
  const ROLES = [
    { id: 'user', name: 'User', desc: 'Sees the agenda, signs up for events and requests spaces.' },
    { id: 'admin', name: 'Administrator', desc: 'Approves requests, manages events and spaces.' },
    { id: 'superadmin', name: 'Super administrator', desc: 'Everything an administrator does, plus users and permissions.' }
  ];

  const GROUPS = [
    { id: 'falcons', name: 'Falcons Athletic', type: 'athletic' },
    { id: 'herons', name: 'Herons Athletic', type: 'athletic' },
    { id: 'council', name: 'Student Council', type: 'student' },
    { id: 'robotics', name: 'Robotics Club', type: 'student' },
    { id: 'chess', name: 'Chess & Go Society', type: 'student' },
    { id: 'eng', name: 'School of Engineering', type: 'teacher' },
    { id: 'sport', name: 'Sports Department', type: 'teacher' },
    { id: 'arts', name: 'Arts Collective', type: 'student' },
    { id: 'harbor', name: 'Harbor Neighbors', type: 'community' },
    { id: 'office', name: 'Events Office', type: 'staff' }
  ];

  const FIRST = ['Jordan', 'Maya', 'Theo', 'Inês', 'Rafa', 'Nina', 'Caio', 'Lena', 'Omar', 'Bea', 'Tomás', 'Iris', 'Kai', 'Lúcia', 'Pedro', 'Sana', 'Hugo', 'Alma', 'Davi', 'Yara', 'Felix', 'Marta', 'Noah', 'Clara', 'Enzo', 'Lia', 'Bruno', 'Zoe', 'Igor', 'Ana'];
  const LAST = ['Reyes', 'Okafor', 'Lindqvist', 'Tavares', 'Nakamura', 'Moreau', 'Brandão', 'Haddad', 'Kowalski', 'Ferraz', 'Duarte', 'Sato', 'Novak', 'Prado', 'Quinn', 'Varga', 'Costa', 'Ibarra'];
  const USERS = [];
  const mkUser = (id, name, type, role, group, status) => USERS.push({ id, name, type, role, group, status: status || 'active',
    email: name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]+/g, '.') + '@valemont.example',
    initials: name.split(' ').map((p) => p[0]).join('').slice(0, 2) });
  mkUser('u-jordan', 'Jordan Reyes', 'staff', 'superadmin', 'office');
  mkUser('u-maya', 'Maya Okafor', 'staff', 'admin', 'office');
  mkUser('u-theo', 'Theo Lindqvist', 'teacher', 'admin', 'eng');
  mkUser('u-ines', 'Inês Tavares', 'teacher', 'admin', 'arts');
  for (let i = 0; i < 44; i++) {
    const g = GROUPS[i % (GROUPS.length - 1)];
    const name = FIRST[(i * 7 + 3) % FIRST.length] + ' ' + LAST[(i * 5 + 1) % LAST.length];
    if (USERS.some((u) => u.name === name)) continue;
    mkUser('u-' + i, name, g.type === 'teacher' ? 'teacher' : g.type, 'user', g.id, i % 17 === 9 ? 'invited' : i % 23 === 11 ? 'suspended' : 'active');
  }
  const ME = 'u-jordan';
  const usersOf = (g) => USERS.filter((u) => u.group === g);

  // ── events ─────────────────────────────────────────────────
  const START = '2026-08-31', END = '2026-12-20';
  const EVENTS = [];
  let eid = 0;
  const ev = (o) => {
    const id = o.id || 'e' + (++eid);
    const g = GROUPS.find((x) => x.id === o.group);
    const owner = usersOf(o.group)[0] || USERS[1];
    EVENTS.push(Object.assign({ id, status: 'published', public: true, periods: [], attendees: 0, checkedIn: 0, waitlist: 0,
      organizer: g.name, owner: owner.id, desc: '' }, o));
    return EVENTS[EVENTS.length - 1];
  };

  // weekly series
  const series = [
    { title: 'Futsal training', cat: 'sports', group: 'falcons', space: 'court', dows: [1, 3], periods: ['P1'], cap: 24, public: false },
    { title: 'Basketball practice', cat: 'sports', group: 'herons', space: 'court', dows: [0, 2], periods: ['P2'], cap: 20, public: false },
    { title: 'Volleyball open session', cat: 'sports', group: 'falcons', space: 'court', dows: [4], periods: ['A2'], cap: 30 },
    { title: 'Morning yoga', cat: 'community', group: 'harbor', space: 'studio', dows: [2], periods: ['M1'], cap: 24 },
    { title: 'Chess & Go evening', cat: 'culture', group: 'chess', space: 'commons', dows: [4], periods: ['P1'], cap: 40 },
    { title: 'Robotics lab night', cat: 'academic', group: 'robotics', space: 'activity', dows: [3], periods: ['P1'], cap: 30, public: false },
    { title: 'Life drawing', cat: 'culture', group: 'arts', space: 'studio', dows: [1], periods: ['A2'], cap: 18 },
    { title: 'Student Council meeting', cat: 'community', group: 'council', space: 'commons', dows: [0], periods: ['A1'], cap: 30, everyOther: true },
    // classes and courses: booked like everything else, but not on the public agenda
    { title: 'Physical education', cat: 'sports', group: 'sport', space: 'court', dows: [0, 1, 2, 3, 4], periods: ['M1', 'M2'], cap: 32, public: false },
    { title: 'Kids’ futsal school', cat: 'community', group: 'sport', space: 'court', dows: [0, 2], periods: ['A1'], cap: 24, public: false },
    { title: 'Structures II', cat: 'academic', group: 'eng', space: 'auditorium', dows: [0, 2, 4], periods: ['M1'], cap: 160, public: false },
    { title: 'Calculus review', cat: 'academic', group: 'eng', space: 'auditorium', dows: [1, 3], periods: ['M2'], cap: 120, public: false },
    { title: 'Dance technique', cat: 'culture', group: 'arts', space: 'studio', dows: [0, 2, 4], periods: ['A1'], cap: 22, public: false },
    { title: 'Theatre rehearsal', cat: 'culture', group: 'arts', space: 'studio', dows: [1, 3], periods: ['P1'], cap: 18, public: false },
    { title: 'Prototyping course', cat: 'academic', group: 'eng', space: 'activity', dows: [0, 1, 2, 3, 4], periods: ['M2'], cap: 28, public: false },
    { title: 'Electronics bench hours', cat: 'academic', group: 'robotics', space: 'activity', dows: [1, 3], periods: ['A1'], cap: 20, public: false },
    { title: 'Study group: physics', cat: 'academic', group: 'council', space: 'commons', dows: [1, 3], periods: ['A1'], cap: 30, public: false },
    { title: 'Language exchange', cat: 'community', group: 'council', space: 'commons', dows: [2], periods: ['A2'], cap: 40 },
    { title: 'Handball training', cat: 'sports', group: 'herons', space: 'court', dows: [0, 2], periods: ['P1'], cap: 22, public: false },
    { title: 'Volleyball training', cat: 'sports', group: 'falcons', space: 'court', dows: [1], periods: ['P2'], cap: 18, public: false },
    { title: 'Open court', cat: 'sports', group: 'sport', space: 'court', dows: [0, 2], periods: ['A2'], cap: 40 },
    { title: 'Research seminar', cat: 'academic', group: 'eng', space: 'auditorium', dows: [1, 3], periods: ['A1'], cap: 90 },
    { title: 'Thesis defenses', cat: 'academic', group: 'eng', space: 'auditorium', dows: [2, 4], periods: ['A2'], cap: 60, public: false },
    { title: 'Makerspace open hours', cat: 'academic', group: 'robotics', space: 'activity', dows: [0, 2, 4], periods: ['A2'], cap: 30 },
    { title: 'Pilates', cat: 'community', group: 'harbor', space: 'studio', dows: [1, 3], periods: ['M2'], cap: 20 },
    { title: 'Ballet basics', cat: 'culture', group: 'arts', space: 'studio', dows: [0, 4], periods: ['M1'], cap: 16, public: false },
    { title: 'Coffee & careers', cat: 'community', group: 'office', space: 'commons', dows: [2], periods: ['M2'], cap: 40 }
  ];
  series.forEach((s) => {
    for (let d = START; d <= END; d = D.add(d, 1)) {
      if (!s.dows.includes(D.dow(d))) continue;
      if (s.everyOther && Math.floor(D.diff(START, d) / 7) % 2) continue;
      const past = d < TODAY;
      const reg = Math.min(s.cap, between(Math.round(s.cap * 0.55), s.cap));
      ev({ title: s.title, cat: s.cat, group: s.group, space: s.space, date: d, periods: s.periods.slice(), public: s.public !== false,
        capacity: s.cap, attendees: reg, checkedIn: past ? Math.round(reg * (0.72 + rnd() * 0.24)) : 0, series: true,
        desc: s.title + ' with ' + GROUPS.find((x) => x.id === s.group).name + '. Same time every week; sign up so the organizers know how many to expect.' });
    }
  });

  // one-off events: talks, culture, community, sports fixtures
  const talks = ['Bridges that move: kinetic structures', 'Data, cities and the night bus', 'Designing for one-handed use', 'Water under pressure: a field report', 'How a stadium roof is tested', 'Open source in the lab', 'Soil, roots and slopes', 'Sound in shared rooms', 'Small satellites, big lessons', 'Materials that heal'];
  const culture = ['Film night: city symphonies', 'Jazz in the Commons', 'Poetry open mic', 'Printmaking open studio', 'Choir rehearsal open day'];
  const community = ['Neighbors’ assembly', 'Repair café', 'Blood donation drive', 'Book swap morning'];
  const fixtures = ['Futsal league · Falcons vs. Gulls', 'Basketball league · Herons vs. Otters', 'Volleyball league · Falcons vs. Kites', 'Handball friendly · Herons vs. Wolves'];
  let ti = 0, ci = 0, mi = 0, fi = 0;
  for (let d = START; d <= END; d = D.add(d, 1)) {
    const w = D.dow(d);
    if ((w === 1 || w === 3) && rnd() < 0.62) {
      const p = pick(['A1', 'P1', 'M2']);
      ev({ title: talks[ti++ % talks.length], cat: 'academic', group: 'eng', space: 'auditorium', date: d, periods: [p], capacity: 220,
        attendees: between(70, 205), desc: 'An evening lecture from the School of Engineering, followed by questions. Open to everyone.' });
    }
    if (w === 4 && rnd() < 0.5) {
      ev({ title: culture[ci++ % culture.length], cat: 'culture', group: 'arts', space: pick(['commons', 'auditorium']), date: d, periods: ['P2'], capacity: 80,
        attendees: between(30, 80), desc: 'An evening put together by the Arts Collective. Come for one hour or stay for both.' });
    }
    if (w === 5 && rnd() < 0.72) {
      ev({ title: fixtures[fi++ % fixtures.length], cat: 'sports', group: fi % 2 ? 'falcons' : 'herons', space: 'court', date: d, periods: [pick(['A1', 'A2'])], capacity: 120,
        attendees: between(60, 118), desc: 'League fixture on Court A. Bleachers open 20 minutes before kick-off.' });
    }
    if (w === 5 && D.parse(d).getUTCDate() <= 7) {
      ev({ title: community[mi++ % community.length], cat: 'community', group: 'harbor', space: 'commons', date: d, periods: ['M1', 'M2'], capacity: 80,
        attendees: between(25, 70), desc: 'A monthly morning with the people who live around the campus. Coffee from 8:00.' });
    }
  }

  // featured events around the demo week
  ev({ id: 'cup', title: 'Inter-club Futsal Cup', cat: 'sports', group: 'falcons', space: 'court', date: '2026-11-21', periods: ['A1', 'A2'], capacity: 120, attendees: 112, waitlist: 9, featured: true,
    desc: 'Eight club teams, one afternoon. Group games run through A1 and the knockout rounds through A2. Bleachers are first come, first served; sign up to get a seat held.' });
  ev({ id: 'engweek', title: 'Engineering Week: opening talk', cat: 'academic', group: 'eng', space: 'auditorium', date: '2026-11-23', periods: ['P1'], capacity: 220, attendees: 187, featured: true,
    desc: 'The week opens with a conversation about the buildings we use every day: who books them, who maintains them and what the data says.' });
  ev({ id: 'careers', title: 'Career fair', cat: 'academic', group: 'office', space: 'commons', date: '2026-11-25', periods: ['M2', 'A1', 'A2'], capacity: 80, attendees: 64, featured: true,
    desc: 'Twenty-four organizations at round tables across the Commons. Bring a printed CV or just come and talk.' });
  ev({ id: 'openstudio', title: 'Open studio: winter prints', cat: 'culture', group: 'arts', space: 'studio', date: '2026-11-27', periods: ['A2', 'P1'], capacity: 40, attendees: 31,
    desc: 'The Arts Collective opens its doors. Prints on the walls, presses running, and a table to try one yourself.' });
  ev({ id: 'hack', title: 'Build night: campus tools', cat: 'academic', group: 'robotics', space: 'activity', date: '2026-11-28', periods: ['A1', 'A2', 'P1'], capacity: 60, attendees: 48, featured: true,
    desc: 'Teams of three build small tools for the campus in one long afternoon. Mentors from the Robotics Club on hand.' });

  // pending events (need a decision) — these feed the dashboard and the requests screen
  const pend = [
    { id: 'p-futsalx', title: 'Futsal extra session', cat: 'sports', group: 'falcons', space: 'court', date: '2026-11-19', periods: ['P2'], capacity: 24, attendees: 0, createdAt: '2026-11-13',
      desc: 'An extra session before the Cup on Saturday.' },
    { id: 'p-bball', title: 'Basketball scrimmage', cat: 'sports', group: 'herons', space: 'court', date: '2026-11-19', periods: ['P2'], capacity: 20, attendees: 0, createdAt: '2026-11-14',
      desc: 'Practice game against the alumni team.' },
    { id: 'p-debate', title: 'Debate night: who owns the city?', cat: 'academic', group: 'council', space: 'auditorium', date: '2026-11-24', periods: ['P1'], capacity: 220, attendees: 0, createdAt: '2026-11-12',
      desc: 'Two teams, one motion, the audience votes at the end.' },
    { id: 'p-swap', title: 'Winter clothes swap', cat: 'community', group: 'harbor', space: 'commons', date: '2026-11-28', periods: ['M1', 'M2'], capacity: 80, attendees: 0, createdAt: '2026-11-15',
      desc: 'Bring what you don’t wear, take what you need.' },
    { id: 'p-dance', title: 'Salsa beginners', cat: 'culture', group: 'arts', space: 'studio', date: '2026-11-26', periods: ['P2'], capacity: 40, attendees: 0, createdAt: '2026-11-15',
      desc: 'Four-week course, first session.' }
  ];
  pend.forEach((p) => ev(Object.assign({ status: 'pending', public: false }, p)));

  // one event per slot: featured and pending events win over generated ones
  (function dedupe() {
    const taken = new Map();
    const rank = (e) => (e.status === 'pending' ? 3 : e.featured ? 2 : e.series ? 0 : 1);
    const order = EVENTS.slice().sort((a, b) => rank(b) - rank(a));
    const drop = new Set();
    order.forEach((e) => {
      const keys = e.periods.map((p) => e.space + '|' + e.date + '|' + p);
      if (e.status !== 'pending' && keys.some((k) => taken.has(k))) { drop.add(e); return; }
      if (e.status !== 'pending') keys.forEach((k) => taken.set(k, e));
      else keys.forEach((k) => { if (!taken.has(k)) taken.set(k, null); });
    });
    for (let i = EVENTS.length - 1; i >= 0; i--) if (drop.has(EVENTS[i])) EVENTS.splice(i, 1);
  })();

  // ── requests: pending, rejected and cancelled ──────────────
  const REQUESTS = [];
  let rid = 0;
  const rq = (o) => REQUESTS.push(Object.assign({ id: 'r' + (++rid), createdAt: D.add(o.date, -between(4, 12)) }, o));
  // published events were all approved: each slot has an approved request behind it
  EVENTS.forEach((e) => e.periods.forEach((p) => {
    if (e.date >= '2026-10-15') rq({ eventId: e.id, space: e.space, date: e.date, period: p, requester: e.owner, group: e.group, title: e.title, status: 'approved', people: e.capacity });
  }));
  pend.forEach((p) => p.periods.forEach((per) => rq({ eventId: p.id, space: p.space, date: p.date, period: per, requester: usersOf(p.group)[0].id, group: p.group, title: p.title, status: 'pending', people: p.capacity, createdAt: p.createdAt })));
  // decided earlier this month
  [{ title: 'Paintball fundraiser', group: 'council', space: 'court', date: '2026-11-07', period: 'A1', reason: 'Paint can’t be used on the court surface.' },
   { title: 'Band rehearsal', group: 'arts', space: 'auditorium', date: '2026-11-12', period: 'P2', reason: 'The auditorium was already set for a lecture the next morning.' },
   { title: 'Overnight gaming', group: 'robotics', space: 'activity', date: '2026-11-20', period: 'P2', reason: 'Bookings end at 22:50.' }]
    .forEach((r) => rq({ title: r.title, group: r.group, requester: usersOf(r.group)[1] ? usersOf(r.group)[1].id : usersOf(r.group)[0].id, space: r.space, date: r.date, period: r.period, status: 'rejected', reason: r.reason, people: 30, decidedAt: D.add(r.date, -3) }));
  // cancelled events
  ['Volleyball open session', 'Film night: city symphonies'].forEach((t) => {
    const e = EVENTS.find((x) => x.title === t && x.date > '2026-11-01' && x.date < TODAY);
    if (e) { e.status = 'cancelled'; e.cancelReason = t.startsWith('Volley') ? 'The net posts were being serviced.' : 'The projector was out for repair.'; }
  });

  // ── notifications ─────────────────────────────────────────
  const NOTES = [
    { id: 'n1', kind: 'request', at: '2026-11-16T09:58', text: 'Herons Athletic asked for Court A on Thu 19 Nov, P2', ref: 'p-bball', unread: true },
    { id: 'n2', kind: 'conflict', at: '2026-11-16T09:58', text: 'Two requests now compete for Court A on Thu 19 Nov, P2', ref: 'p-bball', unread: true },
    { id: 'n3', kind: 'participant', at: '2026-11-16T08:40', text: '9 people joined the waitlist for the Inter-club Futsal Cup', ref: 'cup', unread: true },
    { id: 'n4', kind: 'request', at: '2026-11-15T19:12', text: 'Arts Collective asked for Studio 2 on Thu 26 Nov, P2', ref: 'p-dance', unread: false },
    { id: 'n5', kind: 'request', at: '2026-11-15T11:03', text: 'Harbor Neighbors asked for The Commons on Sat 28 Nov, M1–M2', ref: 'p-swap', unread: false },
    { id: 'n6', kind: 'updated', at: '2026-11-14T16:20', text: 'Career fair now runs M2 to A2 instead of M1 to A1', ref: 'careers', unread: false },
    { id: 'n7', kind: 'approved', at: '2026-11-14T10:05', text: 'Maya Okafor approved Build night: campus tools', ref: 'hack', unread: false },
    { id: 'n8', kind: 'cancelled', at: '2026-11-13T15:47', text: 'Film night: city symphonies was cancelled', ref: null, unread: false }
  ];

  // attendance for one-off events that already happened
  EVENTS.forEach((e) => { if (!e.series && e.date < TODAY && e.status === 'published' && e.attendees && !e.checkedIn) e.checkedIn = Math.round(e.attendees * (0.62 + rnd() * 0.3)); });
  window.QDATA = { PERIODS, TODAY, NOW, D, WORKSPACE, SPACES, CATEGORIES, USER_TYPES, ROLES, GROUPS, USERS, ME, EVENTS, REQUESTS, NOTES };
})();
