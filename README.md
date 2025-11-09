# Relatório - Implementação de Padrões de Teste

## Disciplina: Engenharia de Software
## Trabalho: Implementando Padrões de Teste (Test Patterns)
## Aluno: Pedro Henrique Braga de Castro
## Repositório: https://github.com/bragap/test-pattern

## 1. Padrões de Criação de Dados (Builders)

### Por que CarrinhoBuilder foi usado em vez de CarrinhoMother?

O padrão Object Mother é adequado para objetos simples com poucos estados possíveis. No caso da classe User, existem apenas dois tipos relevantes de usuários (PADRAO e PREMIUM), tornando o Object Mother ideal. Já o Carrinho é um objeto complexo que pode ter:

- Diferentes usuários (padrão ou premium)
- Quantidade variável de itens (zero, um, vários)
- Itens com preços diferentes
- Combinações diversas de estados

Utilizar Object Mother para o Carrinho resultaria em uma explosão combinatória de métodos, como:
- carrinhoVazioPadrao()
- carrinhoVazioPremium()
- carrinhoComUmItemPadrao()
- carrinhoComUmItemPremium()
- carrinhoComDoisItensPadrao()
- E assim por diante...

O padrão Data Builder resolve esse problema através de uma API fluente que permite compor o objeto de forma flexível, especificando apenas as características relevantes para cada teste.

### Exemplo de setup: Antes e Depois

Antes (Setup Manual Complexo):

```javascript
const usuarioPremium = new User(2, 'Maria Santos', 'premium@email.com', 'PREMIUM');
const item1 = new Item('Produto A', 100);
const item2 = new Item('Produto B', 100);
const itens = [item1, item2];
const carrinho = new Carrinho(usuarioPremium, itens);
```

Depois (Com Data Builder):

```javascript
const carrinho = new CarrinhoBuilder()
    .comUser(UserMother.umUsuarioPremium())
    .comItens([
        new Item('Produto A', 100),
        new Item('Produto B', 100)
    ])
    .build();
```

### Justificativa de melhoria

O Builder melhora a legibilidade ao:

1. Tornar explícito apenas o que é relevante para o teste: Se um teste precisa de um carrinho vazio, basta chamar .vazio(). Se precisa de um usuário específico, apenas .comUser() é necessário.

2. Reduzir o acoplamento: Os testes não precisam conhecer os detalhes do construtor do Carrinho. Se a classe mudar, apenas o Builder precisa ser atualizado.

3. Fornecer valores padrão sensatos: O Builder já fornece um carrinho válido por padrão, reduzindo o código de setup nos casos comuns.

4. Facilitar manutenção: Quando novos campos são adicionados ao Carrinho, o Builder pode fornecer valores padrão, sem quebrar testes existentes.

## 2. Padrões de Test Doubles (Mocks vs. Stubs)

### Análise do teste de sucesso Premium

No teste quando um cliente Premium finaliza a compra, foram utilizados três test doubles:

Stubs:
- GatewayPagamento: Configurado para retornar { success: true }
- PedidoRepository: Configurado para retornar um pedido salvo com ID

Mock:
- EmailService: Verificado se foi chamado com os parâmetros corretos

### Por que GatewayPagamento foi usado como Stub?

O GatewayPagamento é principalmente um Stub porque:

1. Seu papel é controlar o fluxo de execução: Retornar success: true permite que o teste prossiga para a criação do pedido. O teste foca em verificar o estado resultante (o pedido foi criado corretamente com desconto aplicado).

2. A verificação é sobre o valor cobrado, não sobre a chamada em si: Embora seja verificado que o método cobrar foi chamado com 180 (valor com desconto), o foco principal do teste é garantir que a lógica de negócio calculou o valor final correto. O GatewayPagamento fornece uma resposta pré-definida para permitir essa verificação.

3. Verificação de Estado prevalece: O teste verifica o estado final do sistema através do pedido retornado e do valor calculado.

### Por que EmailService foi usado como Mock?

O EmailService é um Mock porque:

1. O teste verifica o comportamento (interação): É crucial verificar que o email foi enviado exatamente uma vez e com os parâmetros corretos (email do usuário, assunto e corpo da mensagem).

2. Verificação de Comportamento é o objetivo: O método enviarEmail é um efeito colateral. O teste não se preocupa com o retorno, mas sim em garantir que a ação foi executada corretamente.

3. As asserções focam na chamada do método: toHaveBeenCalledTimes(1) e toHaveBeenCalledWith(...) são verificações típicas de Mocks, validando que a interação ocorreu conforme esperado.

4. Não há estado a verificar: O envio de email não altera o estado interno do sistema de forma verificável no teste, então a única forma de validar é através da interação.

## 3. Conclusão

A aplicação deliberada de Padrões de Teste demonstrou benefícios concretos:

Os Builders (Object Mother e Data Builder) eliminaram o Test Smell de Setup Obscuro ao tornar a criação de dados de teste expressiva e manutenível. O código de setup passou a comunicar claramente a intenção do teste, focando apenas no que é relevante para cada cenário.

Os Test Doubles (Stubs e Mocks) permitiram o isolamento completo das dependências externas, eliminando Testes Frágeis. Os testes executam rapidamente, sem chamadas reais a serviços externos, e a distinção clara entre Verificação de Estado e Verificação de Comportamento tornou os testes mais focados e fáceis de entender.

Juntos, esses padrões contribuem para uma suíte de testes sustentável que:
- É rápida de executar (sem dependências externas reais)
- É fácil de ler e entender (setup expressivo e asserções claras)
- É fácil de manter (mudanças isoladas nos Builders, sem impacto nos testes)
- É confiável (testes isolados e determinísticos)

A adoção desses padrões desde o início do desenvolvimento previne a acumulação de Test Smells e estabelece uma base sólida para a evolução contínua do código com confiança.
