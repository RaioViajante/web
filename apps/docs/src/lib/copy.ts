import type { LocaleId } from "../../../../site/locales";

/** The projects on the home page that are not documented here (yet). */
export type ExternalProjectId = "hum" | "orbit" | "yanawa";

/** Docs-owned interface text; shared shell text stays in the design catalog. */
export interface DocsCopy {
	index: string;
	/** The folder names in a page's breadcrumb, by content group. */
	groupLabels: { projects: string; raioviajante: string };
	previous: string;
	next: string;
	updated: string;
	lastUpdated: string;
	edit: string;
	source: string;
	avatar: string;
	reducedAvatar: string;
	description: string;
	home: {
		/** The home page's own full-site title. */
		title: string;
		/** The line under "docs" in the index header. */
		line: string;
		/** Section titles of the two documentation folders. */
		groups: { projects: string; raioviajante: string };
		/** First word of the note under a guide that has pages listed under it. */
		guide: string;
		/** The projects that have no documentation here, in listing order. */
		external: Record<ExternalProjectId, { status: string; summary: string; note?: string }>;
	};
	search: {
		title: string;
		description: string;
		/** Searches that find something in this locale's published index (a test keeps that true). */
		suggestions: { site: readonly string[]; everywhere: readonly string[] };
	};
}

const copy = {
	en: {
		index: "index",
		groupLabels: { projects: "projects", raioviajante: "raioviajante" },
		previous: "← Previous",
		next: "Next →",
		updated: "updated",
		lastUpdated: "last updated",
		edit: "edit this page on GitHub",
		source: "source",
		avatar: "Flip RaioViajante avatar",
		reducedAvatar: "Illustrated RaioViajante character",
		description: "Public technical documentation for projects and systems built under RaioViajante.",
		home: {
			title: "docs — technical documentation for things built under raioviajante.",
			line: "technical documentation for things built under raioviajante.",
			groups: { projects: "projects/", raioviajante: "raioviajante/" },
			guide: "guide",
			external: {
				hum: { status: "exploring", summary: "terminal music player" },
				orbit: {
					status: "not documented yet",
					summary: "self-hosted job scheduler",
					note: "read about it on dump ↗",
				},
				yanawa: {
					status: "not documented yet",
					summary: "programming language in design",
					note: "read about it on dump ↗",
				},
			},
		},
		search: {
			title: "Search",
			description: "Search RaioViajante docs and sites.",
			suggestions: {
				site: ["sweep", "cli", "tokens", "commits"],
				everywhere: ["setup", "assembly", "classifier"],
			},
		},
	},
	"pt-BR": {
		index: "início",
		groupLabels: { projects: "projetos", raioviajante: "raioviajante" },
		previous: "← Anterior",
		next: "Próximo →",
		updated: "atualizado",
		lastUpdated: "última atualização",
		edit: "editar esta página no GitHub",
		source: "código-fonte",
		avatar: "Virar o avatar do RaioViajante",
		reducedAvatar: "Personagem ilustrado do RaioViajante",
		description: "Documentação técnica pública de projetos e sistemas do RaioViajante.",
		home: {
			title: "docs — documentação técnica do RaioViajante.",
			line: "documentação técnica de projetos e sistemas do RaioViajante.",
			groups: { projects: "projetos/", raioviajante: "raioviajante/" },
			guide: "guia",
			external: {
				hum: { status: "explorando", summary: "player de música para terminal" },
				orbit: {
					status: "ainda não documentado",
					summary: "agendador de tarefas auto-hospedado",
					note: "leia sobre ele no dump ↗",
				},
				yanawa: {
					status: "ainda não documentado",
					summary: "linguagem de programação em fase de projeto",
					note: "leia sobre ela no dump ↗",
				},
			},
		},
		search: {
			title: "Busca",
			description: "Busque na documentação e nos sites do RaioViajante.",
			suggestions: {
				site: ["sweep", "cli", "tipografia", "commits"],
				everywhere: ["arquivos", "classificação", "bancadas"],
			},
		},
	},
} satisfies Record<LocaleId, DocsCopy>;

export const copyFor = (locale: LocaleId): DocsCopy => copy[locale];
