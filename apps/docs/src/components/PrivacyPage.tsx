import { LegalPage, type LegalSection } from "@raioviajante/design/templates";
import type { LocaleId } from "../../../../site/locales";

interface PrivacyText {
	title: string;
	inShort: { label: string; value: string }[];
	sections: LegalSection[];
}

/**
 * The Privacy Policy, one complete text per locale. English is the
 * authoritative text; the Portuguese one is a faithful translation of it that
 * adds and removes no clause (docs/i18n.md, "Legal pages").
 */
const text = {
	en: {
		title: "Privacy Policy",
		inShort: [
			{ label: "accounts", value: "none" },
			{ label: "comments", value: "none" },
			{ label: "sound preference", value: "saved in a cookie" },
		],
		sections: [
			{
				title: "In your browser",
				body: (
					<>
						<p>
							Your sound preference is saved in a small cookie on .raioviajante.com, so every raioviajante site remembers it. The cookie is created only when you switch sound on or off, holds just that choice, and lasts one year. It is
							not used for tracking.
						</p>
						<p>
							Older versions of this site had a theme switcher that stored a choice in your browser as starlight-theme. Nothing reads or
							writes it now, so a leftover value is inert and can be cleared.
						</p>
					</>
				),
			},
			{
				title: "On the way to the page",
				body: (
					<p>
						Like any website, the host (Vercel) receives standard request data — IP address, browser and the page asked for — to
						deliver it.
					</p>
				),
			},
			{
				title: "Search",
				body: (
					<p>
						Search runs in your browser over a static index. The “everywhere” scope also reads the search indexes of the other
						RaioViajante sites; nothing you type is sent anywhere.
					</p>
				),
			},
		],
	},
	"pt-BR": {
		title: "Política de Privacidade",
		inShort: [
			{ label: "contas", value: "nenhuma" },
			{ label: "comentários", value: "nenhum" },
			{ label: "preferência de som", value: "salva em um cookie" },
		],
		sections: [
			{
				title: "No seu navegador",
				body: (
					<>
						<p>
							Sua preferência de som é salva em um pequeno cookie em .raioviajante.com, para que todos os sites raioviajante a lembrem. O cookie só é criado quando você liga ou desliga o som, guarda apenas essa escolha e dura um ano. Ele não é
							usado para rastreamento.
						</p>
						<p>
							Versões anteriores deste site tinham um seletor de tema que guardava uma escolha no seu navegador como starlight-theme. Nada lê nem
							grava esse valor agora, então um valor remanescente é inerte e pode ser apagado.
						</p>
					</>
				),
			},
			{
				title: "No caminho até a página",
				body: (
					<p>
						Como qualquer site, o provedor de hospedagem (Vercel) recebe dados padrão da requisição — endereço IP, navegador e a
						página solicitada — para entregá-la.
					</p>
				),
			},
			{
				title: "Busca",
				body: (
					<p>
						A busca funciona no seu navegador, sobre um índice estático. O escopo “todos os sites” também lê os índices de busca dos
						outros sites do RaioViajante; nada do que você digita é enviado a lugar nenhum.
					</p>
				),
			},
		],
	},
} satisfies Record<LocaleId, PrivacyText>;

export function PrivacyPage({ locale }: { locale: LocaleId }) {
	const { title, inShort, sections } = text[locale];
	return <LegalPage site="docs" locale={locale} title={title} inShort={inShort} sections={sections} />;
}
