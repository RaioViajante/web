import { headers } from "next/headers";
import { LegalPage } from "@raioviajante/design/components";
import { jsonLdScript } from "../../../../../seo/structured-data";
import { RootShell } from "../../../components/RootShell";
import { metadataFor } from "../../../lib/seo";
import { routes } from "../../../lib/routes";
import { webPageJsonLd } from "../../../lib/structured-data";

const path = routes.privacy["pt-BR"]!;
export const metadata = metadataFor(path);

// Portuguese rendering of app/privacy/page.tsx: same sections, same facts, same
// last-updated date. It adds and removes no practice, right or clause.
export default async function PrivacyPt() {
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
        title="Política de Privacidade"
        lastUpdated="6 de outubro de 2026"
        inShort={[
          { label: "cadastro", value: "nenhum" },
          { label: "e-mail", value: "só o que você enviar" },
          { label: "preferência de som", value: "salva em um cookie" },
        ]}
        sections={[
          {
            title: "Controlador e contato",
            body: (
              <p>
                Este site é operado sob o CNPJ 53.021.377/0001-93. Para dúvidas
                sobre seus dados, escreva para{" "}
                <a href="mailto:mail@raioviajante.com">mail@raioviajante.com</a>
                .
              </p>
            ),
          },
          {
            title: "Dados e preferências",
            body: (
              <>
                <p>
                  Este site não tem formulário de cadastro. Se você enviar um
                  e-mail para o endereço acima, recebemos as informações que
                  você escolher enviar, como seu nome, seu endereço de e-mail e
                  sua mensagem.
                </p>
                <p>
                  Sua preferência de som é salva em um pequeno cookie em
                  .raioviajante.com, para que todos os sites raioviajante a
                  lembrem. O cookie só é criado quando você liga ou desliga o
                  som, guarda apenas essa escolha e dura um ano. Ele não é usado
                  para rastreamento. A página inicial solicita o feed RSS
                  público de dump.raioviajante.com no servidor para exibir os
                  textos recentes.
                </p>
              </>
            ),
          },
          {
            title: "Outros sites",
            body: (
              <p>
                Links para Dump, Docs, Lab, GitHub e outros destinos abrem sites
                separados. Suas práticas de dados podem ser diferentes das deste
                site raiz.
              </p>
            ),
          },
          {
            title: "Seus direitos",
            body: (
              <p>
                Você pode entrar em contato para perguntar sobre dados pessoais
                fornecidos por e-mail ou para solicitar acesso, correção ou
                exclusão, quando aplicável. A autoridade brasileira de proteção
                de dados explica os direitos previstos na LGPD em seu{" "}
                <a href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares">
                  guia para titulares de dados
                </a>
                .
              </p>
            ),
          },
          {
            title: "Atualizações",
            body: (
              <>
                <p>
                  Esta página será atualizada quando as práticas de dados do
                  site mudarem.
                </p>
                <p>Última atualização: 6 de outubro de 2026.</p>
              </>
            ),
          },
        ]}
      />
    </RootShell>
  );
}
