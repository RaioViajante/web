import { LegalPage, type LegalSection } from "@raioviajante/design/templates";
import { CONTACT } from "../../../../site/sites";
import type { LocaleId } from "../../../../site/locales";

interface TermsText {
	title: string;
	inShort: { label: string; value: string }[];
	sections: LegalSection[];
}

const mail = <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>;

/**
 * The Terms of Use, one complete text per locale. English is the authoritative
 * text; the Portuguese one is a faithful translation of it that adds and
 * removes no clause (docs/i18n.md, "Legal pages").
 */
const text = {
	en: {
		title: "Terms of Use",
		inShort: [
			{ label: "reading", value: "free" },
			{ label: "accounts", value: "none" },
			{ label: "warranty", value: "none — things may break" },
		],
		sections: [
			{
				title: "Who runs this",
				body: (
					<p>
						{`docs.raioviajante.com is run by RaioViajante, CNPJ ${CONTACT.cnpj}, as part of raioviajante.com. Questions go to`}{" "}
						{mail}.
					</p>
				),
			},
			{
				title: "What the documentation is",
				body: (
					<p>
						These pages describe projects and systems built under RaioViajante, as they work today. A page can be out of date;
						the source repository of each project is the authority.
					</p>
				),
			},
			{
				title: "Code",
				body: <p>Code shown here follows the license of the repository it comes from.</p>,
			},
		],
	},
	"pt-BR": {
		title: "Termos de Uso",
		inShort: [
			{ label: "leitura", value: "gratuita" },
			{ label: "contas", value: "nenhuma" },
			{ label: "garantia", value: "nenhuma — as coisas podem quebrar" },
		],
		sections: [
			{
				title: "Quem opera este site",
				body: (
					<p>
						{`docs.raioviajante.com é operado por RaioViajante, CNPJ ${CONTACT.cnpj}, como parte de raioviajante.com. Dúvidas podem ser enviadas para`}{" "}
						{mail}.
					</p>
				),
			},
			{
				title: "O que é a documentação",
				body: (
					<p>
						Estas páginas descrevem projetos e sistemas criados sob o RaioViajante, como funcionam hoje. Uma página pode estar
						desatualizada; o repositório de código-fonte de cada projeto é a autoridade.
					</p>
				),
			},
			{
				title: "Código",
				body: <p>O código mostrado aqui segue a licença do repositório de onde ele vem.</p>,
			},
		],
	},
} satisfies Record<LocaleId, TermsText>;

export function TermsPage({ locale }: { locale: LocaleId }) {
	const { title, inShort, sections } = text[locale];
	return <LegalPage site="docs" locale={locale} title={title} inShort={inShort} sections={sections} />;
}
