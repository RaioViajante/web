import { headers } from "next/headers";
import Link from "next/link";
import { LegalPage } from "@raioviajante/design/components";
import { jsonLdScript } from "../../../../../seo/structured-data";
import { RootShell } from "../../../components/RootShell";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";
import { webPageJsonLd } from "../../../lib/structured-data";

const path = routes.terms["pt-BR"]!;
export const metadata = metadataFor(path);

// Portuguese rendering of app/terms/page.tsx: same sections, same facts, same
// last-updated date. It adds and removes no clause.
export default async function TermsPt() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <RootShell current={path} locale="pt-BR">
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(webPageJsonLd(path, "pt-BR")),
        }}
      />
      <LegalPage
        site="root"
        locale="pt-BR"
        title="Termos de Uso"
        lastUpdated="4 de outubro de 2026"
        inShort={[
          { label: "contas", value: "nenhuma" },
          { label: "compras", value: "nenhuma" },
          { label: "código", value: "licença de cada repositório" },
        ]}
        sections={[
          {
            title: "Escopo",
            body: (
              <p>
                Estes termos descrevem o uso de raioviajante.com, um site
                pessoal que apresenta projetos, textos e links para outros
                destinos. O site não oferece contas nem compras.
              </p>
            ),
          },
          {
            title: "Uso do site",
            body: (
              <p>
                Você é bem-vindo para ler e compartilhar links das páginas
                públicas. Por favor, não interfira no funcionamento do site, não
                tente acessá-lo sem autorização nem o use de maneiras que
                prejudiquem outras pessoas.
              </p>
            ),
          },
          {
            title: "Conteúdo e código",
            body: (
              <p>
                As descrições dos projetos e outros conteúdos podem mudar
                conforme o trabalho evolui. Alguns projetos têm links para
                repositórios de código-fonte públicos. Confira a licença de cada
                repositório antes de reutilizar seu código; um link público, por
                si só, não descreve permissões de reutilização dos textos ou da
                arte do site.
              </p>
            ),
          },
          {
            title: "Destinos externos",
            body: (
              <p>
                Dump, Docs, Lab, GitHub e outros destinos com link são sites
                separados. Consulte as informações de cada um ao visitá-los.
                Nossa{" "}
                <Link href={routes.privacy["pt-BR"]!}>
                  Política de Privacidade
                </Link>{" "}
                descreve o tratamento de dados neste site raiz.
              </p>
            ),
          },
          {
            title: "Contato e atualizações",
            body: (
              <>
                <p>
                  Dúvidas sobre este site ou sobre estes termos podem ser
                  enviadas para{" "}
                  <a href="mailto:mail@raioviajante.com">
                    mail@raioviajante.com
                  </a>
                  . A versão atual destes termos continuará disponível nesta
                  página quando for atualizada.
                </p>
                <p>Última atualização: 4 de outubro de 2026.</p>
              </>
            ),
          },
        ]}
      />
    </RootShell>
  );
}
