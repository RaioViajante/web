// The Stucco. client case: every word on its page. Portuguese is
// `ptStuccoCopy` in pt.ts, typed by the same interface. The brand, contacts and
// testimonials in the demo are fictional; the real client is never named.
// This file imports types only, so a plain Node test can load it.

export type StuccoDevice = "desktop" | "mobile";
export type StuccoGroup = "home" | "menu" | "services" | "projects" | "contact";
export type StuccoPiece = "business" | "review" | "car" | "social";

interface StuccoStep {
  title: string;
  caption: string;
}

export interface StuccoCopy {
  kicker: string;
  title: string;
  intro: string;
  note: string;
  demo: {
    open: string;
    hint: string;
    label: string;
    newTab: string;
    close: string;
    loading: string;
  };
  facts: readonly { term: string; value: string; wide: boolean }[];
  tour: {
    heading: string;
    device: string;
    steps: string;
    desktop: string;
    mobile: string;
    previous: string;
    next: string;
    /** Alt text of a screenshot; takes {device} and {title}. */
    shotAlt: string;
    groups: Record<StuccoGroup, string>;
    captions: Record<StuccoDevice, Record<string, StuccoStep>>;
  };
  brief: {
    heading: string;
    lead: string;
    items: readonly string[];
    note: string;
  };
  goals: { heading: string; items: readonly string[] };
  done: {
    heading: string;
    groups: readonly { title: string; items: readonly string[] }[];
  };
  brand: {
    heading: string;
    lead: string;
    cover: string;
    coverAlt: string;
    mockup: string;
    art: string;
    front: string;
    back: string;
    icon: string;
    post: string;
    pieces: Record<StuccoPiece, { title: string; spec: string }>;
  };
  tech: {
    heading: string;
    rows: readonly { term: string; value: string }[];
  };
  result: { heading: string; lead: string; items: readonly string[] };
  cta: string;
  backAll: string;
}

export const stuccoCopy: StuccoCopy = {
  kicker: "CLIENT WORK · CASE 01",
  title: "Stucco.",
  intro:
    "Brand identity, website and marketing materials for a plaster and drywall studio in the interior of São Paulo state. The goal was to show the standard of finish on every job, show up in local searches and turn visits into quote requests on WhatsApp.",
  note: "In this demo the brand, contacts and testimonials are fictional; the photos are the studio's real work, used with permission.",
  demo: {
    open: "Open the demo",
    hint: "Opens over this page · 5 pages · Esc to close",
    label: "Stucco. demo",
    newTab: "New tab",
    close: "Close the demo",
    loading: "Loading the demo…",
  },
  facts: [
    {
      term: "Year",
      value: "2026",
      wide: false,
    },
    {
      term: "Status",
      value: "Live",
      wide: false,
    },
    {
      term: "My role",
      value: "Brand identity, UI design and front-end development",
      wide: true,
    },
    {
      term: "Client",
      value: "Plaster and drywall studio, name withheld",
      wide: true,
    },
    {
      term: "Demo",
      value:
        "5 pages in English, with a fictional brand. The live site is in Portuguese.",
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
    shotAlt: "Screenshot of the Stucco. demo, {device}: {title}",
    groups: {
      home: "Home",
      menu: "Menu",
      services: "Services",
      projects: "Projects",
      contact: "Contact",
    },
    captions: {
      desktop: {
        home: {
          title: "Home",
          caption:
            "The studio's own work opens the site in a slideshow, with a caption and counter for each photo.",
        },
        menu: {
          title: "Menu",
          caption:
            "A full-height menu slides over the page, with the main links and the studio's phone.",
        },
        featured: {
          title: "Featured projects",
          caption:
            "A carousel of featured spaces, each tagged with its service and linked to the full gallery.",
        },
        homeServices: {
          title: "Services on the home",
          caption:
            "The five services in a grid, each with its photo, number and one line.",
        },
        servicesPage: {
          title: "Services page",
          caption:
            "Each service gets a large photo with a white card over it: description, solutions and a quote link.",
        },
        service: {
          title: "Service page",
          caption:
            "One template for every service, opening on a full-width photo.",
        },
        serviceIntro: {
          title: "Service intro",
          caption:
            "A photo and a sand card overlap, with the quote button right there.",
        },
        serviceOthers: {
          title: "Other services",
          caption:
            "The other four services close the page, each with its number.",
        },
        projectsFilter: {
          title: "Filter and details",
          caption:
            "Filtered by exterior moldings. Hovering a photo shows its name and a short note.",
        },
        contact: {
          title: "Contact",
          caption: "A quote form next to the studio's phone, email and hours.",
        },
        contactSent: {
          title: "Request sent",
          caption:
            "After sending, the form thanks the visitor by name. In the demo nothing is sent or stored.",
        },
      },
      mobile: {
        home: {
          title: "Home",
          caption: "The same slideshow, sized for the phone.",
        },
        intro: {
          title: "Intro",
          caption:
            "On the phone the photo sits above the text, and the button stays in reach.",
        },
        featured: {
          title: "Featured projects",
          caption:
            "The carousel keeps its counter, progress bars and arrows on the phone.",
        },
        craft: {
          title: "Craft",
          caption: "The yellow statement card, stacked under its photo.",
        },
        signature: {
          title: "Signature",
          caption: "The animated wordmark: the yellow square drops into place.",
        },
        faq: {
          title: "FAQ",
          caption: "Questions open and close in place, one tap each.",
        },
        footer: {
          title: "Footer",
          caption:
            "Address, hours, services and the towns the studio covers, all fictional.",
        },
        menuSvc: {
          title: "Menu on a service page",
          caption: "The menu marks the section you are in.",
        },
        services: {
          title: "Services",
          caption:
            "Each service gets a photo, a short line and its main solutions.",
        },
        gallery: {
          title: "Service gallery",
          caption: "Each service page shows its own projects in a gallery.",
        },
        others: {
          title: "Other services",
          caption: "The other services close the page, two by two.",
        },
        projects: {
          title: "Projects",
          caption:
            "47 spaces in a single column, with the filters right above.",
        },
        contact: {
          title: "Contact",
          caption: "Phone, email and hours come first, over a full photo.",
        },
        chips: {
          title: "Quote form",
          caption:
            "Choices are large chips made for thumbs, so the form is quick to fill on the phone.",
        },
        sent: {
          title: "Request sent",
          caption:
            "After sending, the form thanks the visitor by name. In the demo nothing is sent or stored.",
        },
      },
    },
  },
  brief: {
    heading: "The brief",
    lead: "The studio lived on referrals and social media. There was no single place that gathered the work, explained each service or made clear which cities the company serves. The client asked for:",
    items: [
      "a site that feels like an architecture office, not a generic contractor;",
      "fast and easy to use on a phone, where most of the audience is;",
      "a short path to a quote, straight to WhatsApp;",
      "presence in Google searches across the cities served;",
      "a simple way to get more Google reviews.",
    ],
    note: "Midway through the project the brand changed its name to honor the founder. The whole visual system was adapted to the new name.",
  },
  goals: {
    heading: "Goals",
    items: [
      "Showcase the work with large photos and a gallery organized by service.",
      "Explain the five services clearly, each with its own page.",
      "Generate qualified quote requests that arrive with the job details already in.",
      "Gain visibility in local searches across the region.",
      "Keep the same identity across the site, print and social.",
    ],
  },
  done: {
    heading: "What I did",
    groups: [
      {
        title: "Brand identity",
        items: [
          "A logo built from typographic blocks with a yellow dot, working in positive, in negative and on yellow.",
          "An animated version of the logo, where the dot drops into place and the blocks rearrange. It became the site's signature.",
          "A palette of graphite, black, beige and yellow, Barlow type and a language of blocks and “pixels” repeated across the brand.",
          "A style guide with colors, type, components and usage rules.",
        ],
      },
      {
        title: "Website",
        items: [
          "25 pages: home, a services overview, one page for each of the five services, project gallery, about, service areas, eight city pages, contact, FAQ, review, privacy policy and a 404 page.",
          "A masonry gallery with more than 45 jobs, filters by service and project details on tap.",
          "A three-step quote form with tappable options for service, property type, project stage and area. On submit, WhatsApp opens with the message already written.",
          "A quote button always in view, a compact header that appears on scroll and a floating WhatsApp button.",
          "Scroll-linked reveal animations, like overlapping blocks and photos that open like a curtain. They respect the system's reduced-motion setting.",
        ],
      },
      {
        title: "Local SEO",
        items: [
          "A service page for each specialty, with its own content, FAQ and links to the other services.",
          "A service-area page with a map of the 165 municipalities within 150 km, built from official IBGE data, linking to the city pages.",
          "Eight city pages with their own text, distance and FAQ, linked to each other and to the services.",
          "Titles and heading structure organized per page, descriptive alt text on every photo and images optimized to load fast on phones.",
          "A Google review flow that strengthens the business profile in local search. The review page is kept out of Google's index.",
        ],
      },
      {
        title: "Reviews",
        items: [
          "A dedicated page that takes the client straight to reviewing the company on Google.",
          "A QR code printed on the review card and on a 20 × 28 cm sticker for the team's cars.",
        ],
      },
      {
        title: "Print and social",
        items: [
          "Business card and review card at 9 × 5 cm, with bleed and crop marks, ready for the printer.",
          "A QR code sticker for the cars, which are already wrapped with the brand.",
          "Profile icon, a first-post carousel and a suggested bio for social media.",
          "Favicon in every size.",
        ],
      },
      {
        title: "Handoff for development",
        items: [
          "A reference package in English with every page, color and type tokens, named images and the animated logo ready to use.",
        ],
      },
    ],
  },
  brand: {
    heading: "The brand",
    lead: "Printed and social pieces made for the studio, shown under the fictional Stucco. name. Every QR code points to a reserved example address.",
    cover:
      "Wordmark, monogram and the yellow square that runs through every piece.",
    coverAlt:
      "Stucco. identity: wordmark, monogram, business card, review card and the site on a phone",
    mockup: "mockup",
    art: "art",
    front: "front",
    back: "back",
    icon: "profile icon",
    post: "first post",
    pieces: {
      business: {
        title: "Business card",
        spec: "9 × 5 cm · print-ready, with bleed and crop marks",
      },
      review: {
        title: "Review card",
        spec: "9 × 5 cm · a QR straight to the Google review, in three steps",
      },
      car: {
        title: "Car QR sticker",
        spec: "20 × 28 cm · for the team's cars, already wrapped with the brand",
      },
      social: {
        title: "Social profile",
        spec: "Profile icon and the first post of the carousel",
      },
    },
  },
  tech: {
    heading: "Technology",
    rows: [
      {
        term: "Site",
        value: "Astro",
      },
      {
        term: "Portfolio demo",
        value:
          "Plain HTML, CSS and JavaScript, no build step and no dependencies",
      },
      {
        term: "Animations",
        value: "CSS, scroll-linked",
      },
      {
        term: "Font",
        value: "Barlow, self-hosted",
      },
      {
        term: "Map",
        value: "IBGE municipality data",
      },
      {
        term: "Repository",
        value: "GitHub",
      },
    ],
  },
  result: {
    heading: "Result",
    lead: "Brand, site and materials work as one system, from the logo to the quote form. The studio now has:",
    items: [
      "a portfolio organized by service;",
      "pages built to show up in searches for each city in the region;",
      "a two-tap path to a quote on WhatsApp;",
      "a review flow that starts on a card or the team's car and ends on Google.",
    ],
  },
  cta: "Have a project like this? Write to",
  backAll: "Back to projects",
};
