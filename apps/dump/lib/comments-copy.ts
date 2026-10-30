import type { LocaleId } from "../../../site/locales";

// The comments section's own text. It lives apart from lib/copy.ts because
// `Comments` is a client component: importing the whole page catalog there
// would ship every page's SEO copy, the 404 copy and both locales' prose to
// the browser. lib/copy.ts re-uses these objects for the server side.

export interface CommentsUiCopy {
  waiting: string;
  manual: string;
  loading: string;
  failed: string;
  load: string;
  retry: string;
}

export const commentsUiCopy = {
  en: {
    waiting:
      "Comments load from giscus (GitHub Discussions) when you scroll to this section.",
    manual:
      "Comments are provided by giscus (GitHub Discussions). Loading them connects to giscus.app and GitHub.",
    loading: "Loading comments…",
    failed: "Comments could not be loaded.",
    load: "Load comments",
    retry: "Try again",
  },
  "pt-BR": {
    waiting:
      "Os comentários carregam do giscus (GitHub Discussions) quando você chega a esta seção.",
    manual:
      "Os comentários são fornecidos pelo giscus (GitHub Discussions). Carregá-los conecta ao giscus.app e ao GitHub.",
    loading: "Carregando comentários…",
    failed: "Não foi possível carregar os comentários.",
    load: "Carregar comentários",
    retry: "Tentar novamente",
  },
} satisfies Record<LocaleId, CommentsUiCopy>;
