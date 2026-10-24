# Test IDs and selector contracts

This is the selector contract for Root, Dump, Docs, Lab and the shared design
package. The short rule is loaded through `AGENTS.md` and its `CLAUDE.md` mirror.
It applies to new features and maintenance of existing UI.

## Where a test ID is required

Add `data-testid` when implementing:

- A first-party interactive control: links, buttons, fields, native disclosures,
  dialog controls, filters, tabs and copy/download actions.
- Output observed by a UI test: status messages, empty states, search results,
  experiment output, captions and presentation-specific numbers.
- A region needed to scope those targets: navigation, search, comments, a gallery
  dialog/category, an experiment or a content section.
- A target created by client code. Set the attribute at creation time, alongside
  the existing behavior hooks, so a rerender preserves the contract.

Markdown links receive `content-link` in the shared renderer, including footnote
links. Server-rendered experiment output and its client updates use the same IDs.

Emit hooks in the real markup, including server-rendered and no-JavaScript
output. Do not inject missing product hooks from a test or add wrapper elements.
Ordinary prose and decorative spans do not each need a hook. Generic audits still
inspect the complete DOM, including uninstrumented and unexpectedly added nodes.

## Naming and scope

Use lowercase English `kebab-case` values describing the feature or purpose:
`search-input`, `comments-load`, `gallery-next`. Use `data-testid` consistently;
do not introduce `data-test-id`, `data-cy` or a custom runner attribute.

- Keep the same identity across EN/PT, viewport sizes and styling changes.
- Do not derive identity from translated text, array position, random values,
  timestamps or transient state. An existing stable internal key may distinguish
  instances. Existing section IDs are app-owned English keys.
- If a control changes purpose, use its documented action hook: the comments
  button exposes `comments-load` initially and `comments-retry` after a failure.
- A singleton hook is unique within its documented region. Collections may repeat
  a hook intentionally; scope the collection before selecting an instance.
- Prefer existing stable item identity when a test needs one particular item.
  Semantic constraints may retain the existing accessible-name expectation.
- Use `first()` or `nth()` only when order itself is part of the assertion, such
  as the first search result or an ordered heading/href mapping.
- Put shared hooks in `packages/design`. Apps own hooks for their unique content
  and interactions. Generic `ActionButton`, `ToggleButton` and `SiteLink` defaults
  can be overridden with a feature-specific `data-testid` at the call site.

Do not silently rename a hook during a visual refactor. Update its consumers and
this inventory together when an intentional contract change requires a rename.

## Selector order

For first-party interaction targets, use the following order:

1. `getByTestId`, or `[data-testid="..."]` inside an existing DOM/keyboard helper.
2. Role plus accessible name, when a test ID genuinely cannot be provided.
3. The associated label of a form control.
4. Exact text, alt text or title appropriate to the target.
5. An existing stable semantic ID or attribute.
6. A narrowly scoped CSS/DOM selector, with a reason.

This is an authoring order, not a runtime fallback chain. A missing required hook
must fail the test. Fix the owned markup instead of silently trying another
selector. For a new exception, document its reason near the test or in the
exceptions below. Do not create a selector helper, page-object layer or registry
just to hide this order.

The production scripts keep their existing `data-search-*`, `data-sound-*` and
other behavior attributes. Styles and application code must not query test IDs;
setting a test attribute while constructing a DOM node is expected.

## Preserve the test's existing meaning

Changing the locator must preserve its role, accessible-name, visibility, focus,
keyboard, state, count, ordering, geometry and integration guarantees.

```ts
const load = page.getByTestId("comments-load");
await expect(load).toHaveRole("button");
await expect(load).toHaveAccessibleName("Load comments");
await load.click();
```

An existing semantic selector can also be retained as an intersection:

```ts
const cover = page
  .getByTestId("gallery-cover")
  .and(page.getByRole("button", { name: "Reveal the artwork collection" }));
```

Both constraints must match the same element; this is not a fallback. This is
useful where the old role locator also excluded hidden content. Do not replace
that with an unrestricted count of hidden DOM nodes. Localized accessible names
remain localized even though test IDs stay in English.

In Testing Library, use the existing `getByTestId`/`queryByTestId` APIs for behavior
targets and keep explicit semantic assertions. Rendered-markup tests that inspect
the actual roles, tags or accessible names may retain semantic queries when that
contract itself is the subject of the test.

## Hook inventory

Repeated hooks below are intentional collections. A hook is a target inside the
listed scope, not an assertion that it is globally unique on every possible page.

| Scope                       | Hooks                                                                                                                                                                                                                                                                            |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shell                       | `skip-link`, `shell-utilities`, `sidebar`, `main-content`, `sound-toggle`                                                                                                                                                                                                        |
| Navigation                  | `navigation-pages`, `navigation-toc`, `navigation-experiments`; scoped `navigation-link`, `navigation-label`, `navigation-disclosure`, `navigation-summary`                                                                                                                      |
| Footer                      | `footer-sites`, `footer-site-link`, `footer-email-link`, `footer-legal`, `footer-legal-link`                                                                                                                                                                                     |
| Language control            | `language-control`, `language-counterpart`, `language-disclosure`, `language-summary`, `language-message`, `language-home`, `language-status`                                                                                                                                    |
| Headers/content             | `page-title`, `page-label`, `page-description`, `section-<existing-id>` or repeated `section`, `section-heading`, `heading-number`, `prose`, repeated `leader-link`, ordinary `content-link`                                                                                     |
| Markdown headings           | Repeated `content-heading`, scoped `heading-title` and `heading-number`; heading IDs and fragments keep their existing meaning                                                                                                                                                   |
| Artwork/avatar              | `artwork-image`, `avatar-toggle`, `avatar-image`; gallery avatars are scoped to the gallery                                                                                                                                                                                      |
| Search                      | `search-nav-link`, `search-page`, `search-input`, `search-bubble`, `search-scope`, `search-scope-site`, `search-scope-everywhere`, `search-results`, `search-empty`, `search-note`                                                                                               |
| Search collections          | `search-result`, scoped `search-result-title`, `search-result-number`, `search-result-note`; `search-suggestions-site`, `search-suggestions-everywhere`, scoped `search-suggestion`                                                                                              |
| Comments                    | `comments`, `comments-status`, `comments-load`, `comments-retry`, `comments-widget`                                                                                                                                                                                              |
| Gallery                     | `gallery-redesign`, `gallery-cover`, `gallery-cover-container`, `gallery-cover-hint`, `gallery-collection`, `gallery-sections`, `gallery-section-link`                                                                                                                           |
| Gallery artwork             | Repeated `gallery-sticker`, `gallery-profile`, `gallery-profile-open`, `gallery-piece`, scoped `gallery-caption`, `gallery-sprite`, `gallery-profile-links`, `gallery-profile-link`                                                                                              |
| Gallery dialogs             | `gallery-dialog`, `gallery-close`, `gallery-view-title`, `gallery-previous`, `gallery-next`, `gallery-download-link`                                                                                                                                                             |
| Gallery collection download | `gallery-download-open`, `gallery-download-title`, repeated `gallery-category-checkbox`, `gallery-select-all`, `gallery-download-status`, `gallery-download-confirm`                                                                                                             |
| Lab index                   | `experiment-list`, repeated `lab-entry`, `filter-all`, `filter-active`, `filter-done`, `filter-result`                                                                                                                                                                           |
| Classifier                  | Scope `classifier`; `directory`, `filenames`, `reset`, `classify`, repeated `sample`, `summary`, `filename-help`; `classifier-results`, repeated `classifier-result` rows and scoped `classifier-filename`, `classifier-suffix`, `classifier-category`, `classifier-destination` |
| Execution                   | Scope `execution`; `new-example`, `exit-code`, `failure-message`, repeated `operation`, `feedback`, `availability`, repeated `field`, `history`, repeated `execution-history-entry`, repeated `rule`                                                                             |
| Boot explorer               | Scope `boot`; repeated `boot-section`, `progress`, repeated `panel`, `prev`, `boot-next`                                                                                                                                                                                         |
| Soft blocks                 | Scope `code-block`; `code-region`, `block-copy`, `block-tabs`, repeated `block-tab`, repeated `block-panel`, `block-expand`                                                                                                                                                      |
| Root content / Dump article | `project-entry`, `project-kind`, `setup-gear`, `setup-gear-source`, `setup-gear-link`, `affiliate-disclosure`, `post-article`, `reading-progress`; existing page-specific hooks stay in their owning app                                                                         |

Additional gallery subregions use their English feature names. Shared primitives
may render a repeated `action-button` or `leader-link`; feature controls should
supply their purposeful hook where the default does not distinguish the action.

## Deliberate structural and integration exceptions

- `e2e/audit.ts` and `harness.spec.ts`: count actual `h1` and `main` elements,
  traverse all elements for overflow and inspect all real images. Test-ID-only
  enumeration could miss an extra heading, unmarked image or unexpected defect.
- Generic Lab focus inventories and first-button smoke actions: preserve the
  actual eligible-control inventory. This migration does not change their
  traversal/counting algorithm.
- Font probes, animation inspection, pointer transitions, focus containment,
  native `summary`/disclosure structure and image loading: retain the actual DOM
  or browser API being measured, scoped by a test ID where applicable.
- SEO metadata and Giscus script/iframe boundaries: inspect exact native elements
  and attributes. Third-party frames do not belong to this markup contract.
- Fragment destinations, heading levels/IDs and ordered heading/href mappings:
  their semantic structure is part of the assertion. Keep those constraints.
- Negative localized-text and forbidden-link checks must still catch unexpected
  content anywhere in their original scope, including nodes without an expected
  hook. Route-link inventories likewise inspect every matching native anchor.
- Rendered HTML, accessibility and behavior-wiring unit tests may inspect native
  roles/tags or exact production attributes when those are the contract tested.
  Pure data/logic, HTTP and source-policy tests have no DOM hook requirement.

These exceptions do not permit using styling classes to locate an ordinary owned
button or field that can expose a purposeful test ID.

## Validation when changing hooks

Keep the existing spec files, grouping, fixtures, scenarios, worker/retry settings
and assertions. Migrate a feature's markup and consuming locators together.
Run affected component tests, then the repository's required shared validation
and the full browser suite described in [browser-checks.md](browser-checks.md).
Check EN/PT, desktop/mobile and no-JavaScript paths where the existing tests cover
them. Report actual results and explain each remaining non-test-ID selector.
