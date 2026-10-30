import Link from "next/link";
import { LegalPage } from "@raioviajante/design/templates";

import { DumpShell } from "@/components/DumpShell";
import { routes } from "@/lib/routes";
import { staticMetadata } from "@/lib/seo";

const locale = "pt-BR" as const;
const path = routes.terms[locale]!;

export const metadata = staticMetadata(path);

// Portuguese translation of app/terms/page.tsx: same sections, same facts. It
// adds and removes no clause and is not a new revision. It has not had a legal
// review, and which text controls is an open question for the owner
// (apps/dump/docs/i18n.md, "Legal pages").
export default function TermsPt() {
  return (
    <DumpShell current={path} locale={locale}>
      <LegalPage
        site="dump"
        locale={locale}
        title="Termos de Uso"
        inShort={[
          { label: "leitura", value: "gratuita" },
          { label: "textos e arte", value: "todos os direitos reservados" },
          { label: "código", value: "licença de cada repositório" },
          { label: "garantia", value: "nenhuma — as coisas podem quebrar" },
        ]}
        sections={[
          {
            title: "Quem opera este site",
            body: (
              <p>
                dump.raioviajante.com é operado por RaioViajante, CNPJ
                53.021.377/0001-93, como parte de raioviajante.com. Dúvidas
                podem ser enviadas para{" "}
                <a href="mailto:mail@raioviajante.com">mail@raioviajante.com</a>
                .
              </p>
            ),
          },
          {
            title: "Textos e arte",
            body: (
              <p>
                Textos e ilustrações pertencem a RaioViajante, salvo indicação
                em contrário em alguma página. Todos os direitos estão
                reservados e esses conteúdos não são cobertos pela licença MIT
                do repositório, que se aplica apenas ao código-fonte.
              </p>
            ),
          },
          {
            title: "Código",
            body: (
              <p>
                O código exibido aqui segue a licença do repositório de onde ele
                vem.
              </p>
            ),
          },
          {
            title: "Comentários",
            body: (
              <p>
                Os comentários são hospedados pelo GitHub Discussions por meio
                do giscus. Você precisa de uma conta do GitHub para comentar, os
                termos do próprio GitHub se aplicam e você é responsável pelo
                que publica. Spam, abuso e comentários fora do assunto podem ser
                ocultados ou removidos. Veja a{" "}
                <Link href={routes.privacy[locale]!}>
                  Política de Privacidade
                </Link>{" "}
                para saber o que é armazenado.
              </p>
            ),
          },
        ]}
      />
    </DumpShell>
  );
}
