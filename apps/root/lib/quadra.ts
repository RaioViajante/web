// The Quadra case: every word on its page. Portuguese is `ptQuadraCopy` in
// pt.ts, typed by the same interface. Quadra and Valemont Institute are
// fictional; the real institution is never named, and every person, group and
// number in the demo is invented. This file imports types only, so a plain
// Node test can load it.

import type { CaseDemoCopy, CaseDevice, CaseTourCopy } from "./case.ts";

export type QuadraDevice = CaseDevice;
export type QuadraGroup =
  | "access"
  | "overview"
  | "calendar"
  | "reservations"
  | "requests"
  | "events"
  | "spaces"
  | "people"
  | "analytics"
  | "admin"
  | "public";
export type QuadraBoard = "slots" | "spaces" | "covers";

/** Rafael, who made the original system with Bryan. */
export const quadraPartner = {
  name: "Rafael",
  profile: "https://www.linkedin.com/in/diasgarcia/",
} as const;

export interface QuadraCopy {
  kicker: string;
  title: string;
  intro: string;
  /** "Made with" before Rafael's name, and the name of his profile's site. */
  credit: { with: string; profile: string };
  note: string;
  demo: CaseDemoCopy;
  facts: readonly { term: string; value: string; wide: boolean }[];
  tour: CaseTourCopy<QuadraGroup>;
  brief: {
    heading: string;
    lead: string;
    items: readonly string[];
    note: string;
  };
  goals: { heading: string; items: readonly string[] };
  done: {
    heading: string;
    lead: string;
    groups: readonly { title: string; items: readonly string[] }[];
  };
  brand: {
    heading: string;
    lead: string;
    cover: string;
    coverAlt: string;
    boards: Record<QuadraBoard, { title: string; spec: string }>;
  };
  tech: {
    heading: string;
    lead: string;
    rows: readonly { term: string; value: string }[];
  };
  reimagined: {
    heading: string;
    lead: string;
    original: { title: string; items: readonly string[] };
    concepts: { title: string; items: readonly string[] };
  };
  result: { heading: string; lead: string; items: readonly string[] };
  cta: string;
  backAll: string;
}

export const quadraCopy: QuadraCopy = {
  kicker: "ACADEMIC PROJECT · CASE 02",
  title: "Quadra",
  intro:
    "An events and space-booking system for a university, made by two people as an academic project and reimagined here as a fictional product. Groups ask for a space by date and period, the events team approves or declines, and everything lands in one calendar.",
  credit: { with: "Made with", profile: "LinkedIn" },
  note: "Quadra and Valemont Institute are fictional. The institution behind the original project is not named, and every person, group and number in the demo is invented. What goes beyond the original system is presented as a concept.",
  demo: {
    open: "Open the demo",
    hint: "Opens over this page · about 20 screens · Esc to close",
    label: "Quadra demo",
    newTab: "New tab",
    close: "Close the demo",
    loading: "Loading the demo…",
  },
  facts: [
    { term: "Year", value: "2025", wide: false },
    { term: "Type", value: "Academic project, two people", wide: false },
    {
      term: "My role",
      value: "UI/UX design, front-end and full-stack development",
      wide: true,
    },
    {
      term: "With",
      value: "Rafael: back end, quality assurance and continuous integration",
      wide: true,
    },
    {
      term: "Demo",
      value:
        "About 20 screens, front end only. The data is fictional and stays in your browser.",
      wide: true,
    },
  ],
  tour: {
    heading: "The tour",
    device: "Screen size",
    steps: "Tour steps",
    desktop: "desktop",
    mobile: "mobile",
    previous: "Previous",
    next: "Next",
    shotAlt: "Quadra · {title} · {device}",
    groups: {
      access: "Access",
      overview: "Overview",
      calendar: "Calendar",
      reservations: "Reservations",
      requests: "Requests",
      events: "Events",
      spaces: "Spaces",
      people: "People",
      analytics: "Analytics",
      admin: "Admin",
      public: "Public",
    },
    captions: {
      desktop: {
        login: {
          title: "Sign in",
          caption:
            "A demo account fills the form for you. The court lines beside it are the brand’s art, and the card shows this week on Court A.",
        },
        dashboard: {
          title: "Overview",
          caption:
            "What needs a decision, how full each space is this week and today’s periods, on one screen.",
        },
        calendar: {
          title: "Calendar",
          caption:
            "Every event in a grid of six periods a day. Requests still waiting are hatched, and classes can be hidden.",
        },
        drawer: {
          title: "Event details",
          caption:
            "An event opens beside the calendar, with time, space, organizer and places left.",
        },
        reserve: {
          title: "Asking for a space",
          caption:
            "Pick free periods in a space’s week and the request form opens next to the grid.",
        },
        sent: {
          title: "Request sent",
          caption:
            "The request shows its steps and stays marked as yours in the grid until someone decides.",
        },
        requests: {
          title: "Two requests, one period",
          caption:
            "When two groups ask for the same period they appear side by side. Approving one declines the other, with a note saying why.",
        },
        event: {
          title: "Event page",
          caption:
            "The reservation, the approval history, who signed up and the details, on one page.",
        },
        new: {
          title: "New event",
          caption:
            "Six short steps. Only spaces free for every chosen period can be picked.",
        },
        spaces: {
          title: "Spaces",
          caption:
            "Each space with its capacity, how booked it is this week and what comes next.",
        },
        space: {
          title: "One space’s week",
          caption: "Clicking a period goes straight to booking it.",
        },
        checkin: {
          title: "Check-in",
          caption:
            "People are checked in from the list or with a simulated ticket scan. No camera is used.",
        },
        analytics: {
          title: "Analytics",
          caption:
            "When spaces are busiest, sign-ups against attendance, and which groups use which space. Every number is demo data.",
        },
        users: {
          title: "Users and roles",
          caption:
            "What someone is and what they can do are kept apart. Nobody can change their own role.",
        },
        notes: {
          title: "Notifications",
          caption:
            "Requests, decisions and changes, grouped by day, each one linking to what it is about.",
        },
        agenda: {
          title: "Public agenda",
          caption:
            "What visitors see without signing in: a featured event, filters and a list by day.",
        },
        pubevent: {
          title: "Public event page",
          caption: "Signing up is simulated and only changes this page.",
        },
      },
      mobile: {
        login: {
          title: "Sign in",
          caption: "On the phone the court art becomes a short header.",
        },
        dashboard: {
          title: "Overview",
          caption: "The cards stack, and the two main actions stay at the top.",
        },
        calendar: {
          title: "Calendar",
          caption: "The week turns into a list by day.",
        },
        reserve: {
          title: "Reservations",
          caption: "One day at a time, with a strip of days to switch.",
        },
        requests: {
          title: "Requests",
          caption: "The competing request sits right below the one being read.",
        },
        checkin: {
          title: "Check-in",
          caption: "Large rows and one button per person.",
        },
        analytics: {
          title: "Analytics",
          caption: "Charts drop to a single column.",
        },
        agenda: {
          title: "Public agenda",
          caption: "The agenda keeps its large type on the phone.",
        },
        pubevent: {
          title: "Public event",
          caption:
            "Date, time, place and the sign-up button, in reading order.",
        },
      },
    },
  },
  brief: {
    heading: "The challenge",
    lead: "A university needed one place for its events and the shared spaces they happen in. Courses, groups and athletic clubs book the same courts and rooms, often for the same evening. The system had to:",
    items: [
      "let a group ask for a space on a given date and period;",
      "give the events team a clear way to approve or decline each request;",
      "show every booking in one calendar, without double bookings;",
      "tell apart who someone is from what they are allowed to do.",
    ],
    note: "The real institution is not named in this case. Names, groups, spaces and numbers in the demo were made up for it.",
  },
  goals: {
    heading: "Design decisions",
    items: [
      "One time grid everywhere: six fixed periods a day, the same in every space, so bookings never overlap by a few minutes.",
      "Every booking is a request, and every request ends in an answer the requester can read.",
      "Show the conflict before the decision, not after it.",
      "Keep type and role apart: a student can be an administrator and a teacher can be a regular user.",
      "Give visitors their own page. The public agenda needs no account.",
    ],
  },
  done: {
    heading: "My role",
    lead: "The project was built as a team, with front end, back end and quality shared between the two of us.",
    groups: [
      {
        title: "Me · UI/UX design and full-stack development",
        items: [
          "Gathering and interpreting the requirements.",
          "Prototyping and planning the interfaces.",
          "UI/UX design and the user experience.",
          "Main responsibility for building the front end.",
          "Back-end features and business rules.",
          "Database integration.",
          "Connecting the front end to the back end.",
          "Testing, debugging and fixing bugs.",
          "Working on the system’s architecture as it grew.",
        ],
      },
      {
        title: "Rafael · back-end development and quality assurance",
        items: [
          "Main responsibility for the back end.",
          "Features and business rules.",
          "Database integration.",
          "Writing and running tests, QA and validating features.",
          "Finding and fixing bugs.",
          "GitHub Actions workflows, test automation and continuous integration.",
          "Helping connect the front end to the back end.",
        ],
      },
      {
        title: "Together",
        items: [
          "We both took part in planning, technical decisions, features, business rules, the database and solving problems.",
          "The split shows where each of us carried the most responsibility, not who did something alone.",
        ],
      },
    ],
  },
  brand: {
    heading: "The identity",
    lead: "Quadra is a brand made for this case. In Portuguese a quadra is a sports court, so the identity comes from two things the system lives on: the court and the calendar grid.",
    cover:
      "The mark is a week in four cells: three booked, one free. Court blue, ink and lime on chalk, with Schibsted Grotesk and Geist Mono.",
    coverAlt:
      "Quadra identity: the 2×2 mark, the wordmark, four colors, the type and the five cell states",
    boards: {
      slots: {
        title: "The cell",
        spec: "One small cell carries the state of a period across every screen",
      },
      spaces: {
        title: "Space plans",
        spec: "Each space is drawn as a line plan instead of a photo",
      },
      covers: {
        title: "Category covers",
        spec: "One pattern for each kind of event",
      },
    },
  },
  tech: {
    heading: "Engineering",
    lead: "The first five rows are the original system. The demo in this case is a separate front-end build made for the portfolio, with no server and no real accounts.",
    rows: [
      {
        term: "Original system",
        value:
          "PHP 8.3, Laravel 11, TypeScript, React and Tailwind CSS · REST API · MVC",
      },
      {
        term: "Database",
        value: "MySQL 8.4, Eloquent ORM, migrations, seeders and transactions",
      },
      {
        term: "Tests and CI",
        value:
          "Pest, PHPUnit, Playwright, PHPStan, Laravel Pint, GitHub Actions and Docker",
      },
      {
        term: "Security and sign-in",
        value:
          "Laravel Sanctum, role-based access (RBAC), two-step verification, CSRF protection, rate limiting and password hashing",
      },
      {
        term: "Deploy and infrastructure",
        value:
          "Docker, Docker Compose, Nginx, GitHub Actions (CI/CD), AWS EC2, AWS RDS (MySQL), Amazon S3, Cloudflare (DNS/CDN) and HTTPS/TLS",
      },
      {
        term: "Demo",
        value: "HTML, CSS and JavaScript, no build step and no dependencies",
      },
      {
        term: "Demo data",
        value:
          "Generated from a fixed seed, so every visit opens on the same week",
      },
      {
        term: "Demo state",
        value:
          "Each action is kept as a short list in the open page and replayed on the fixed data. Reloading or one button starts over; nothing is stored in the browser.",
      },
      {
        term: "Type and icons",
        value: "Schibsted Grotesk, Geist Mono and Tabler Icons",
      },
    ],
  },
  reimagined: {
    heading: "Reimagining",
    lead: "Quadra keeps the core of the original system and adds ideas that would come next. In this case they are kept apart:",
    original: {
      title: "From the original",
      items: [
        "events and the spaces they use;",
        "booking by date and period, evening periods included;",
        "requests that wait for approval;",
        "user types and roles.",
      ],
    },
    concepts: {
      title: "Concepts for the portfolio",
      items: [
        "the Quadra identity and the design of every screen;",
        "the side-by-side view of competing requests;",
        "check-in with a simulated ticket scan;",
        "analytics built from demo data;",
        "sign-up and waitlist on the public agenda.",
      ],
    },
  },
  result: {
    heading: "What the demo shows",
    lead: "The case follows the system from both sides: the people who ask for a space and the people who decide. In the demo you can:",
    items: [
      "ask for a period and follow it until it is decided;",
      "approve one of two competing requests and watch the calendar update;",
      "create an event in six steps;",
      "browse the public agenda and sign up for an event.",
    ],
  },
  cta: "Have a project like this? Write to",
  backAll: "Back to projects",
};
