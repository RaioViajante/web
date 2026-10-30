import { LegalPage } from "@raioviajante/design/templates";

import { DumpShell } from "@/components/DumpShell";
import { routes } from "@/lib/routes";
import { staticMetadata } from "@/lib/seo";

const locale = "pt-BR" as const;
const path = routes.privacy[locale]!;

export const metadata = staticMetadata(path);

// Portuguese translation of app/privacy/page.tsx: same sections, same facts. It
// adds and removes no practice or clause and is not a new revision. It has not
// had a legal review, and which text controls is an open question for the
// owner (apps/dump/docs/i18n.md, "Legal pages").
export default function PrivacyPt() {
  return (
    <DumpShell current={path} locale={locale}>
      <LegalPage
        site="dump"
        locale={locale}
        title="Política de Privacidade"
        inShort={[
          { label: "contas", value: "nenhuma" },
          { label: "preferência de som", value: "salva em um cookie" },
          { label: "comentários", value: "GitHub, via giscus" },
        ]}
        sections={[
          {
            title: "No seu navegador",
            body: (
              <>
                <p>
                  Sua preferência de som é salva em um pequeno cookie em
                  .raioviajante.com, para que todos os sites raioviajante a
                  lembrem. O cookie só é criado quando você liga ou desliga o
                  som, guarda apenas essa escolha e dura um ano. Ele não é usado
                  para rastreamento.
                </p>
                <p>
                  Se você entrar com o GitHub para comentar, o script do giscus
                  que roda nesta página guarda um valor de login no
                  armazenamento local do seu navegador para
                  dump.raioviajante.com, com o nome giscus-session. O dump não o
                  lê nem o usa; o giscus e o GitHub decidem por quanto tempo ele
                  continua válido. Ele não é criado a menos que você entre.
                </p>
              </>
            ),
          },
          {
            title: "A caminho da página",
            body: (
              <p>
                Como qualquer site, o provedor de hospedagem (Vercel) recebe
                dados padrão da requisição — endereço IP, navegador e a página
                solicitada — para entregá-la.
              </p>
            ),
          },
          {
            title: "Comentários e feeds",
            body: (
              <p>
                Os comentários passam pelo giscus até o GitHub Discussions. Eles
                carregam quando a seção de comentários chega perto da tela
                enquanto você rola (em um texto curto, isso pode acontecer assim
                que a página abre), ou quando você aperta Carregar comentários
                em um navegador que não detecta a rolagem. Antes disso, esta
                página não contata o giscus nem o GitHub. Depois que eles
                carregam, seu navegador se conecta ao giscus.app e ao GitHub.
                Entrar e publicar acontecem no GitHub, sob a política de
                privacidade do GitHub; o dump nunca vê sua senha. O feed RSS é
                um arquivo simples — os leitores de feed o solicitam como
                qualquer página.
              </p>
            ),
          },
        ]}
      />
    </DumpShell>
  );
}
