# Architecture

This application owns the root domain and three planned routes:

```text
raioviajante.com
├── /
├── /projects
└── /now
```

Related independent websites:

- dump.raioviajante.com
- lab.raioviajante.com
- docs.raioviajante.com

These websites share the RaioViajante visual identity but are independently
deployed applications. Link to their full external URLs; do not implement them
as routes in this application.

The intended application stack is Next.js, React, and TypeScript. All internal
pages will use the same global content container, header, and footer. Keep
changing content separate from presentation where useful, with components
extracted for actual reuse.

The application has not been initialized. Detailed source layout and content
storage choices remain undecided.
