import type { ReactNode } from "react";
import { type LocaleId } from "../../../../site/locales";
import { CONTACT } from "../../../../site/sites";
import { LegalPage } from "@raioviajante/design/templates";
import { Pager } from "@raioviajante/design/parts";
import { textFor } from "../lib/copy";
import { routePath } from "../lib/routes";

// Terms and Privacy, one authored version per locale. The English text is
// authoritative; the Portuguese text is a faithful translation of it with the
// same sections, facts and (absent) update date. It adds and removes no clause.
// Legal facts come from `site/` in both languages.

interface LegalContent {
  inShort: { label: string; value: string }[];
  sections: { title: string; body: ReactNode }[];
}

const mail = <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>;

const terms = {
  en: {
    inShort: [
      { label: "reading", value: "free" },
      { label: "code", value: "license of each repository" },
      { label: "warranty", value: "none — things may break" },
    ],
    sections: [
      {
        title: "Who runs this",
        body: (
          <p>
            lab.raioviajante.com is run by RaioViajante, CNPJ {CONTACT.cnpj}, as
            part of raioviajante.com. Questions go to {mail}.
          </p>
        ),
      },
      {
        title: "Code",
        body: (
          <p>
            Code shown here follows the license of the repository it comes from.
            Source revisions are identified on each experiment.
          </p>
        ),
      },
      {
        title: "Experiments",
        body: (
          <p>
            Experiments are prototypes. They can be incomplete, wrong or broken,
            and each one states its fidelity: runs here, simulated, or source
            only. Do not rely on a lab result for anything that matters.
          </p>
        ),
      },
      {
        title: "No warranty",
        body: (
          <p>
            Everything is provided as is, without guarantees of accuracy,
            availability or fitness for a purpose. Links to other sites are not
            endorsements.
          </p>
        ),
      },
    ],
  },
  "pt-BR": {
    inShort: [
      { label: "leitura", value: "gratuita" },
      { label: "código", value: "licença de cada repositório" },
      { label: "garantia", value: "nenhuma — experimentos podem falhar" },
    ],
    sections: [
      {
        title: "Quem opera este site",
        body: (
          <p>
            O lab.raioviajante.com é operado por RaioViajante, CNPJ{" "}
            {CONTACT.cnpj}, como parte de raioviajante.com. Dúvidas podem ser
            enviadas para {mail}.
          </p>
        ),
      },
      {
        title: "Código",
        body: (
          <p>
            O código exibido aqui segue a licença do repositório de onde vem. As
            revisões de origem são identificadas em cada experimento.
          </p>
        ),
      },
      {
        title: "Experimentos",
        body: (
          <p>
            Experimentos são protótipos. Podem estar incompletos, errados ou
            quebrados, e cada um informa sua fidelidade: executa aqui, simulado
            ou apenas código-fonte. Não confie em um resultado do Lab para nada
            que seja importante.
          </p>
        ),
      },
      {
        title: "Sem garantia",
        body: (
          <p>
            Tudo é fornecido no estado em que se encontra, sem garantias de
            precisão, disponibilidade ou adequação a uma finalidade. Links para
            outros sites não significam endosso.
          </p>
        ),
      },
    ],
  },
} satisfies Record<LocaleId, LegalContent>;

const privacy = {
  en: {
    inShort: [
      { label: "accounts", value: "none" },
      { label: "stored in your browser", value: "sound preference" },
      { label: "experiment input", value: "stays in this page" },
    ],
    sections: [
      {
        title: "In your browser",
        body: (
          <>
            <p>
              Your sound preference is saved in a small cookie on
              .raioviajante.com so the sites share it. The cookie is created
              only when you switch sound on or off, holds just that choice, and
              lasts one year. Experiment inputs and results live in page memory
              and disappear when you reload. No experiment sends your input to a
              server.
            </p>
            <p>
              Older versions of lab had a theme switcher that stored a choice in
              your browser as lab-theme. Nothing reads or writes it now, so a
              leftover value is inert and can be cleared.
            </p>
          </>
        ),
      },
      {
        title: "On the way to the page",
        body: (
          <p>
            Vercel hosts this site and receives standard request data to deliver
            pages, including the IP address, browser and requested page. Fonts
            are served with the site.
          </p>
        ),
      },
      {
        title: "Search",
        body: (
          <p>
            Search runs in your browser. The everywhere scope downloads public
            search indexes from the other RaioViajante sites; your query is
            filtered locally.
          </p>
        ),
      },
      {
        title: "Contact",
        body: <p>Questions about data on this site can be sent to {mail}.</p>,
      },
    ],
  },
  "pt-BR": {
    inShort: [
      { label: "contas", value: "nenhuma" },
      { label: "guardado no seu navegador", value: "preferência de som" },
      { label: "entradas dos experimentos", value: "ficam nesta página" },
    ],
    sections: [
      {
        title: "No seu navegador",
        body: (
          <>
            <p>
              Sua preferência de som é salva em um pequeno cookie em
              .raioviajante.com, para que os sites a compartilhem. O cookie só é
              criado quando você liga ou desliga o som, guarda apenas essa
              escolha e dura um ano. As entradas e os resultados dos
              experimentos ficam na memória da página e desaparecem quando você
              recarrega. Nenhum experimento envia a sua entrada para um
              servidor.
            </p>
            <p>
              Versões antigas do lab tinham um seletor de tema que guardava uma
              escolha no seu navegador como lab-theme. Nada lê nem grava esse
              valor agora; portanto, um valor remanescente é inerte e pode ser
              apagado.
            </p>
          </>
        ),
      },
      {
        title: "No caminho até a página",
        body: (
          <p>
            A Vercel hospeda este site e recebe dados padrão de requisição para
            entregar as páginas, incluindo o endereço IP, o navegador e a página
            solicitada. As fontes são servidas junto com o site.
          </p>
        ),
      },
      {
        title: "Busca",
        body: (
          <p>
            A busca funciona no seu navegador. O escopo “todos os sites” baixa
            índices de busca públicos dos outros sites do RaioViajante; sua
            consulta é filtrada localmente.
          </p>
        ),
      },
      {
        title: "Contato",
        body: (
          <p>
            Dúvidas sobre os dados neste site podem ser enviadas para {mail}.
          </p>
        ),
      },
    ],
  },
} satisfies Record<LocaleId, LegalContent>;

function LegalDocument({
  locale,
  kind,
  content,
}: {
  locale: LocaleId;
  kind: "terms" | "privacy";
  content: LegalContent;
}) {
  const text = textFor(locale);
  const other = kind === "terms" ? "privacy" : "terms";
  return (
    <>
      <LegalPage
        site="lab"
        locale={locale}
        title={text.legal[kind].title}
        inShort={content.inShort}
        sections={content.sections}
      />
      <Pager
        locale={locale}
        prev={{
          label: text.legal.back,
          title: "lab",
          href: routePath("home", locale),
        }}
        next={{
          label: text.legal.also,
          title: text.legal[other].title,
          href: routePath(other, locale),
        }}
      />
    </>
  );
}

export function TermsPage({ locale }: { locale: LocaleId }) {
  return <LegalDocument locale={locale} kind="terms" content={terms[locale]} />;
}

export function PrivacyPage({ locale }: { locale: LocaleId }) {
  return (
    <LegalDocument locale={locale} kind="privacy" content={privacy[locale]} />
  );
}
