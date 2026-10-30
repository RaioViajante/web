---
contentId: projects/ordelis/security
locale: pt-BR
originalLocale: en
path: /pt/projetos/ordelis/security/
title: Arquitetura de segurança do Ordelis
description: As fronteiras de confiança, o portão de segurança e o modelo de permissões do Ordelis, separando o que está implementado do que ainda está em desenho.
tagline: O que é protegido hoje e o que não é afirmado.
label: segurança
order: 1.41
sub: true
group: projects
status: início do desenvolvimento
meta:
  - modelo de segurança
source: https://github.com/RaioViajante/ordelis
summary: fronteiras de confiança, portão de segurança e o que ainda não foi construído
---

## Escopo

Esta página resume o modelo de segurança publicado no repositório do Ordelis, conferido no código no commit `a9cf7d5`. Descreve apenas arquitetura e decisões verificadas. Para relatar uma vulnerabilidade, use o canal privado da política de segurança do repositório, nunca uma issue pública.

## Princípios

- Local primeiro: não se exige conta do Ordelis nem backend na nuvem, e o aplicativo desktop não envia nada pela rede.
- Privilégio mínimo: cada capacidade é concedida individualmente e de forma restrita.
- Observação, planejamento e execução são modos diferentes, e passar de um a outro exige um passo explícito.
- Nenhuma confiança automática: um sucesso anterior, uma afirmação de um agente sobre si mesmo ou o conteúdo de uma nota nunca elevam permissões.
- Falhar fechado: evidência ausente, vencida ou não verificável significa não.
- Aprovação humana para operações destrutivas e para a integração em branches protegidos.
- As credenciais ficam com seus donos: a autenticação do provedor fica com a ferramenta de cada provedor.

## O que existe hoje

| Propriedade | Estado |
| --- | --- |
| A interface pode chamar exatamente seis comandos nativos revisados | implementado e testado |
| Uma política de segurança de conteúdo rígida, sem scripts, fontes ou imagens remotos | implementado e testado |
| A interface não tem permissão de sistema de arquivos, shell, rede nem plugins | implementado e testado |
| Um build de release não consegue iniciar o Python | implementado |
| O registro de projetos não recebe caminho da interface | implementado no backend, só macOS |
| Um Execution Safety Gate que falha fechado | implementado como biblioteca |
| Registros de autorização de uso único para sondas controladas | implementado como biblioteca, exercitado com executáveis falsos |
| Um sandbox ou confinamento imposto | inexistente |
| Evidência autenticada sobre um processo de provedor | inexistente |
| Um coordenador de execução confiável | inexistente |
| Execução a partir do desktop | inexistente |

## A fronteira nativa

O desktop declara um manifesto de acesso explícito que nomeia seis comandos, e um arquivo de capacidades concede à janela principal exatamente essas seis permissões. A análise do projeto sobre o Tauri 2.12.3 concluiu que a lista de permissões só é verificada para um comando local quando o aplicativo declara um manifesto desses, então é o manifesto que torna a lista efetiva.

| Comando | Finalidade |
| --- | --- |
| `ipc_boundary_status` | prova que uma chamada cruzou a fronteira; não lê nada |
| `get_runtime_status` | consulta de identidade ao runtime, só para desenvolvimento |
| `list_projects` | listar os projetos registrados |
| `add_project` | registrar um projeto a partir de uma pasta escolhida de forma nativa |
| `remove_project` | remover um registro pelo id |
| `reset_projects` | limpar o registro |

Nenhum comando recebe um caminho da interface. Registrar um projeto é um marcador: não concede acesso ao conteúdo da pasta e não autoriza nada. Adicionar um comando significa alterar o manifesto, o handler, o arquivo de capacidades e os testes juntos, e um teste em Rust falha se eles divergirem.

A política de segurança de conteúdo permite apenas os recursos do próprio aplicativo. A produção não permite nenhum host remoto, nenhum `unsafe-eval` e nenhum estilo inline. A ponte com o runtime só é compilada com a feature `dev-runtime`, e combinar essa feature com um build de release é um erro de compilação.

## O Execution Safety Gate

O portão é uma função pura em `runtime/execution_safety_gate.py`. Ele responde a uma única pergunta: a evidência fornecida bastaria para que um futuro coordenador confiável considerasse executar este comando exato contra este executável exato? No código atual, a resposta sobre poder executar é sempre não.

Ele lê dicionários, devolve um dicionário e não consegue iniciar um processo, aplicar um perfil de confinamento nem contatar um provedor. Toda decisão informa que execução, despacho e autenticação da evidência não estão autorizados, com dois motivos permanentes: a evidência não é autenticada e não há coordenador de execução confiável. Um resultado que diz que os requisitos foram satisfeitos descreve a consistência de afirmações fornecidas por quem chama, e nada mais.

:::note
O projeto afirma que o coordenador precisa ser projetado, implementado e revisado separadamente, e não deve ser construído acrescentando um ramo ao portão.
:::

## Aprovação e acesso à rede

Os portões de autorização humana, as permissões por etapa e a aprovação de rede fazem parte do desenho de execução pretendido, não do código. Nesse desenho, cada etapa traria uma política dizendo o que um agente pode ler e escrever, se pode usar a rede e por quanto tempo pode rodar, e um portão pausaria uma etapa em andamento para uma nova decisão humana quando as permissões se ampliassem. Nem o desktop nem o runtime implementam hoje uma aprovação de acesso à rede. O próprio desktop não tem permissão de rede.

## O que não é afirmado

- Nenhum sandbox nem confinamento. Nem o portão nem a opção de caminhos herdada confinam um processo; eles verificam, não impõem.
- Nenhuma evidência autenticada. A declaração de um processo sobre o próprio confinamento nunca é aceita como evidência.
- Nenhuma garantia equivalente entre sistemas operacionais. As proteções são voltadas ao macOS, e Windows e Linux não foram verificados.
- Nenhuma defesa contra código hostil rodando como o mesmo usuário.
- Uma confirmação na interface protege contra um clique errado, não contra quem chama.

## Referências

- [Arquitetura de segurança](https://github.com/RaioViajante/ordelis/blob/a9cf7d5/docs/architecture/security.md)
- [Execution Safety Gate](https://github.com/RaioViajante/ordelis/blob/a9cf7d5/docs/implementation/execution-safety-gate.md)
- [Arquitetura do desktop](https://github.com/RaioViajante/ordelis/blob/a9cf7d5/docs/implementation/desktop-architecture.md)
- [Política de segurança](https://github.com/RaioViajante/ordelis/blob/a9cf7d5/SECURITY.md)
