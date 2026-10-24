"use client";

import Image from "next/image";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { art } from "@raioviajante/design/art";
import { galleryBranding } from "@raioviajante/design/gallery";
import { AvatarCoin } from "@raioviajante/design/avatar-coin";
import { avatarFrames } from "@raioviajante/design/avatar";
import { SectionHeading } from "@raioviajante/design/components";
import {
  artworks,
  categories,
  categoryFiles,
  fill,
  localizeArtwork,
  peers,
  plural,
  stepArtwork,
  type Artwork,
  type Category,
  type GalleryCopy,
} from "../lib/gallery";

function Picture({
  artwork,
  viewing = false,
}: {
  artwork: Artwork;
  viewing?: boolean;
}) {
  if (artwork.cell !== undefined)
    return (
      <span
        data-testid="gallery-sprite"
        className="gallery-sprite"
        data-cell={artwork.cell}
        role="img"
        aria-label={artwork.alt}
      >
        <Image
          src={
            viewing
              ? galleryBranding.stickers.src
              : galleryBranding.stickerPreview.src
          }
          width={2160}
          height={1800}
          alt=""
          unoptimized
          loading={viewing ? "eager" : "lazy"}
        />
      </span>
    );
  if (!artwork.image) return null;
  return (
    <Image
      {...artwork.image}
      alt={artwork.alt}
      sizes={
        viewing
          ? "(max-width: 700px) 85vw, 900px"
          : artwork.category === "profiles"
            ? "112px"
            : "(max-width: 760px) 55vw, 420px"
      }
      loading={viewing ? "eager" : "lazy"}
    />
  );
}

function ProfileLinks({
  artwork,
  copy,
}: {
  artwork: Artwork;
  copy: GalleryCopy;
}) {
  if (!artwork.links) return null;
  return (
    <nav
      data-testid="gallery-profile-links"
      className="gallery-profile-links"
      aria-label={fill(copy.ui.profilesOf, { title: artwork.title })}
    >
      {artwork.links.map((link, index) => (
        <span key={link.href}>
          {index > 0 && <span aria-hidden="true"> · </span>}
          <a
            data-testid="gallery-profile-link"
            href={link.href}
            rel={link.rel}
            data-sound="nav"
          >
            {link.label}
          </a>
        </span>
      ))}
    </nav>
  );
}

function GalleryDialog({
  titleId,
  onDismiss,
  onKeyDown,
  children,
  compact = false,
  closeLabel,
}: {
  titleId: string;
  onDismiss: () => void;
  onKeyDown?: (event: KeyboardEvent<HTMLDialogElement>) => void;
  children: ReactNode;
  compact?: boolean;
  closeLabel: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [closing, setClosing] = useState(false);
  useEffect(() => {
    const dialog = ref.current!;
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(timer.current);
      dialog.close();
      document.body.style.overflow = overflow;
      previous?.focus({ preventScroll: true });
    };
  }, []);
  function close() {
    if (closing) return;
    setClosing(true);
    timer.current = setTimeout(
      onDismiss,
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 160,
    );
  }
  return (
    <dialog
      data-testid="gallery-dialog"
      ref={ref}
      className={`gallery-dialog${compact ? " gallery-dialog--download" : ""}`}
      aria-labelledby={titleId}
      data-closing={closing}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onKeyDown={(event) => {
        if (event.key === "Tab") {
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              "button:not(:disabled), a[href], input:not(:disabled)",
            ),
          );
          const first = controls[0];
          const last = controls.at(-1);
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
        onKeyDown?.(event);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            close();
        }
      }}
    >
      <button
        data-testid="gallery-close"
        className="gallery-control gallery-close"
        type="button"
        onClick={close}
        autoFocus
      >
        {closeLabel}
      </button>
      {children}
    </dialog>
  );
}

function CollectionDownload({
  onDismiss,
  copy,
}: {
  onDismiss: () => void;
  copy: GalleryCopy;
}) {
  const { ui } = copy;
  const [selected, setSelected] = useState<Category[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  const files = selected.flatMap((category) =>
    categoryFiles(category).map((file) => ({
      ...file,
      name: `${selected.length > 1 ? `${category}/` : ""}${file.filename}`,
    })),
  );
  const filename = `raioviajante-${selected.length === 1 ? selected[0] : "gallery"}.zip`;
  async function download() {
    setBusy(true);
    const controller = new AbortController();
    abort.current = controller;
    try {
      const { galleryZip, saveGalleryBlob } =
        await import("../lib/gallery-download");
      const entries = [];
      for (const [index, file] of files.entries()) {
        setStatus(fill(ui.packing, { i: index + 1, n: files.length }));
        const response = await fetch(file.src, { signal: controller.signal });
        if (!response.ok) throw new Error("Unavailable artwork");
        entries.push({
          name: file.name,
          data: new Uint8Array(await response.arrayBuffer()),
        });
      }
      if (controller.signal.aborted) return;
      saveGalleryBlob(galleryZip(entries), filename);
      setStatus(
        fill(ui.saved, { filename, files: plural(ui.files, files.length) }),
      );
    } catch {
      if (!controller.signal.aborted) setStatus(ui.failed);
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  return (
    <GalleryDialog
      titleId="gallery-download-title"
      onDismiss={onDismiss}
      closeLabel={ui.close}
      compact
    >
      <header
        data-testid="gallery-download-header"
        className="gallery-download-header"
      >
        <span className="rv-label">{ui.downloadLabel}</span>
        <h2 data-testid="gallery-download-title" id="gallery-download-title">
          {ui.downloadTitle}
        </h2>
        <p>{ui.downloadIntro}</p>
      </header>
      <fieldset
        data-testid="gallery-download-options"
        disabled={busy}
        className="gallery-download-options"
      >
        <legend className="rv-sr-only">{ui.legend}</legend>
        {categories.map((category) => (
          <label key={category.id}>
            <input
              data-testid="gallery-category-checkbox"
              type="checkbox"
              checked={selected.includes(category.id)}
              onChange={(event) => {
                setSelected(
                  event.target.checked
                    ? categories
                        .filter(
                          (item) =>
                            selected.includes(item.id) ||
                            item.id === category.id,
                        )
                        .map((item) => item.id)
                    : selected.filter((id) => id !== category.id),
                );
                setStatus("");
              }}
            />
            <span>
              {copy.categories[category.id].title}
              <small>{copy.categories[category.id].note}</small>
            </span>
            <small>{plural(ui.files, categoryFiles(category.id).length)}</small>
          </label>
        ))}
      </fieldset>
      <button
        data-testid="gallery-select-all"
        type="button"
        className="gallery-select-all"
        disabled={busy}
        onClick={() => {
          setSelected(
            selected.length === categories.length
              ? []
              : categories.map((item) => item.id),
          );
          setStatus("");
        }}
      >
        {selected.length === categories.length ? ui.clear : ui.selectAll}
      </button>
      <footer
        data-testid="gallery-download-footer"
        className="gallery-download-footer"
      >
        <p data-testid="gallery-download-status" role="status">
          {status ||
            (files.length
              ? fill(selected.length > 1 ? ui.savesFolders : ui.saves, {
                  filename,
                })
              : ui.nothing)}
        </p>
        <button
          data-testid="gallery-download-confirm"
          type="button"
          className="gallery-control gallery-primary"
          disabled={busy || !files.length}
          onClick={download}
        >
          {busy
            ? ui.busy
            : files.length
              ? fill(ui.zipCount, { files: plural(ui.files, files.length) })
              : ui.zip}
        </button>
      </footer>
    </GalleryDialog>
  );
}

export function GalleryBoard({ copy }: { copy: GalleryCopy }) {
  const { ui } = copy;
  const items = artworks.map((item) => localizeArtwork(item, copy));
  const step = (item: Artwork, direction: number) =>
    localizeArtwork(stepArtwork(item, direction), copy);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Artwork | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const cover = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    if (!open) return;
    // Keep the activated cover and the unfolding collection in view when the
    // section navigation returns above them, especially on narrow screens.
    cover.current?.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [open]);
  function go(id: string) {
    const target = document.getElementById(id);
    target?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    target?.focus({ preventScroll: true });
  }
  return (
    <div
      data-testid="gallery-redesign"
      className="gallery-redesign"
      data-open={open}
    >
      <nav
        data-testid="gallery-sections"
        className="gallery-jumps"
        aria-label={ui.sections}
        hidden={!open}
      >
        {categories.map((category, index) => (
          <a
            data-testid="gallery-section-link"
            key={category.id}
            href={`#gallery-${category.id}`}
            onClick={(event) => {
              event.preventDefault();
              go(`gallery-${category.id}`);
            }}
          >
            <span>04.{index + 1}</span>{" "}
            {copy.categories[category.id].title.toLowerCase()}
          </a>
        ))}
      </nav>
      <section
        data-testid="gallery-collection-intro"
        className="gallery-collection-intro"
      >
        <div
          data-testid="gallery-section-heading"
          className="gallery-section-heading"
          hidden={!open}
        >
          <SectionHeading number="04." title={ui.collection} />
          <button
            data-testid="gallery-download-open"
            type="button"
            className="gallery-control"
            aria-haspopup="dialog"
            onClick={() => setDownloadOpen(true)}
          >
            {ui.download}
          </button>
        </div>
        <div data-testid="gallery-cover-container" className="gallery-cover">
          <button
            data-testid="gallery-cover"
            type="button"
            ref={cover}
            aria-expanded={open}
            aria-controls="gallery-collection"
            aria-label={ui.reveal}
            data-sound="gallery"
            onClick={() => setOpen((value) => !value)}
          >
            <Image
              {...art.workOfArt}
              alt={ui.coverAlt}
              sizes="160px"
              priority
            />
          </button>
          <span data-testid="gallery-cover-hint" className="gallery-cover-hint">
            {open ? ui.hintOpen : ui.hintClosed}
          </span>
        </div>
      </section>
      <div
        data-testid="gallery-collection"
        id="gallery-collection"
        hidden={!open}
      >
        {categories.map((category, index) => (
          <section
            className={`gallery-section gallery-section--${category.id}`}
            key={category.id}
            aria-labelledby={`gallery-${category.id}`}
          >
            <SectionHeading
              number={`04.${index + 1}`}
              title={
                <span id={`gallery-${category.id}`} tabIndex={-1}>
                  {copy.categories[category.id].title}
                </span>
              }
            />
            <p>{copy.categories[category.id].description}</p>
            {category.id === "branding" ? (
              <div data-testid="gallery-branding" className="gallery-branding">
                <div data-testid="gallery-avatar" className="gallery-avatar">
                  <AvatarCoin
                    label={ui.avatarFlip}
                    reducedMotionLabel={ui.avatarStill}
                  />
                  <div
                    data-testid="gallery-avatar-sequence"
                    className="gallery-avatar-sequence"
                  >
                    <div data-testid="gallery-meta" className="gallery-meta">
                      <span>{ui.avatar}</span>
                      <span
                        data-testid="gallery-dots"
                        className="gallery-dots"
                      />
                      <span>{ui.avatarMeta}</span>
                    </div>
                    <div
                      data-testid="gallery-frames"
                      className="gallery-frames"
                      aria-label={ui.avatarFrames}
                    >
                      {avatarFrames.map((src, i) => (
                        <figure key={src}>
                          <Image
                            src={src}
                            width={44}
                            height={44}
                            alt={fill(ui.avatarFrame, { n: i + 1 })}
                            loading="lazy"
                            unoptimized
                          />
                          <figcaption>
                            {String(i + 1).padStart(2, "0")}
                          </figcaption>
                        </figure>
                      ))}
                    </div>
                  </div>
                </div>
                <div
                  data-testid="gallery-stickers"
                  className="gallery-stickers"
                >
                  {items
                    .filter((item) => item.category === "branding")
                    .map((item) => (
                      <button
                        data-testid="gallery-sticker"
                        key={item.id}
                        type="button"
                        className="gallery-sticker"
                        onClick={() => setView(item)}
                        data-sound="gallery"
                        aria-label={fill(ui.view, { title: item.title })}
                        aria-haspopup="dialog"
                      >
                        <Picture artwork={item} />
                        <span
                          data-testid="gallery-caption"
                          className="gallery-caption"
                        >
                          {item.title}
                          {item.use && <small>{item.use}</small>}
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            ) : (
              <div
                className={
                  category.id === "profiles"
                    ? "gallery-profiles"
                    : "gallery-collage"
                }
              >
                {items
                  .filter((item) => item.category === category.id)
                  .map((item) =>
                    category.id === "profiles" ? (
                      <div
                        data-testid="gallery-profile"
                        className="gallery-profile"
                        key={item.id}
                      >
                        <button
                          data-testid="gallery-profile-open"
                          type="button"
                          data-sound="gallery"
                          aria-label={fill(ui.view, { title: item.title })}
                          aria-haspopup="dialog"
                          onClick={() => setView(item)}
                        >
                          <Picture artwork={item} />
                        </button>
                        <div>
                          {item.title}
                          {item.use && <small>{item.use}</small>}
                          <ProfileLinks artwork={item} copy={copy} />
                        </div>
                      </div>
                    ) : (
                      <button
                        data-testid="gallery-piece"
                        key={item.id}
                        type="button"
                        className={`gallery-piece gallery-piece--${item.id}`}
                        data-sound="gallery"
                        aria-label={fill(ui.view, { title: item.title })}
                        aria-haspopup="dialog"
                        onClick={() => setView(item)}
                      >
                        <Picture artwork={item} />
                      </button>
                    ),
                  )}
              </div>
            )}
          </section>
        ))}
      </div>
      {view && (
        <GalleryDialog
          titleId="gallery-view-title"
          onDismiss={() => setView(null)}
          closeLabel={ui.close}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              setView(step(view, event.key === "ArrowLeft" ? -1 : 1));
            }
          }}
        >
          <header
            data-testid="gallery-view-header"
            className="gallery-view-header"
          >
            {copy.kinds[view.category].group} ·{" "}
            {peers(view).findIndex((item) => item.id === view.id) + 1} /{" "}
            {peers(view).length}
          </header>
          <div
            className={`gallery-view-stage gallery-view-stage--${view.category}`}
          >
            <div
              key={view.id}
              className={`gallery-view-art gallery-view-art--${view.category}`}
            >
              <Picture artwork={view} viewing />
            </div>
            <div
              data-testid="gallery-view-navigation"
              className="gallery-view-navigation"
            >
              <button
                data-testid="gallery-previous"
                type="button"
                className="gallery-control gallery-arrow"
                aria-label={ui.previous}
                onClick={() => setView(step(view, -1))}
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                data-testid="gallery-next"
                type="button"
                className="gallery-control gallery-arrow"
                aria-label={ui.next}
                onClick={() => setView(step(view, 1))}
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
          <footer
            data-testid="gallery-view-footer"
            className="gallery-view-footer"
          >
            <div
              data-testid="gallery-view-description"
              className="gallery-view-description"
              aria-live="polite"
              aria-atomic="true"
            >
              <div data-testid="gallery-meta" className="gallery-meta">
                <h2 data-testid="gallery-view-title" id="gallery-view-title">
                  {view.title}
                </h2>
                <span data-testid="gallery-dots" className="gallery-dots" />
                <span>{copy.kinds[view.category].type}</span>
              </div>
              {view.use && (
                <div data-testid="gallery-meta" className="gallery-meta">
                  <span>{ui.usedOn}</span>
                  <span data-testid="gallery-dots" className="gallery-dots" />
                  <span>{view.use}</span>
                </div>
              )}
              <ProfileLinks artwork={view} copy={copy} />
            </div>
            {view.download && (
              <a
                data-testid="gallery-download-link"
                className="gallery-control"
                href={view.download.src}
                download={view.download.filename}
              >
                {ui.download}
              </a>
            )}
          </footer>
        </GalleryDialog>
      )}
      {downloadOpen && (
        <CollectionDownload
          onDismiss={() => setDownloadOpen(false)}
          copy={copy}
        />
      )}
    </div>
  );
}
