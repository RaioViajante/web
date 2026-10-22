import type { LocaleId } from "../../../../site/locales";

/** Docs-owned interface text; shared shell text stays in the design catalog. */
const copy = {
	en: {
		index: "index",
		projects: "projects",
		previous: "← Previous",
		next: "Next →",
		updated: "updated",
		lastUpdated: "last updated",
		edit: "edit this page on GitHub",
		source: "source",
		avatar: "Flip RaioViajante avatar",
		reducedAvatar: "Illustrated RaioViajante character",
		description: "Public technical documentation for projects and systems built under RaioViajante.",
	},
	"pt-BR": {
		index: "início",
		projects: "projetos",
		previous: "← Anterior",
		next: "Próximo →",
		updated: "atualizado",
		lastUpdated: "última atualização",
		edit: "editar esta página no GitHub",
		source: "código-fonte",
		avatar: "Girar o avatar do RaioViajante",
		reducedAvatar: "Personagem ilustrado do RaioViajante",
		description: "Documentação técnica pública de projetos e sistemas do RaioViajante.",
	},
} satisfies Record<LocaleId, Record<string, string>>;

export const copyFor = (locale: LocaleId) => copy[locale];
