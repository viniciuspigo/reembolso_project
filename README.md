💸 Sistema de Reembolso
Projeto completo de controle de reembolsos, inspirado no design da Rocketseat, com autenticação de usuários, upload de comprovantes em PDF e painel administrativo para gestão das solicitações.

🔗 Acesso Online
O projeto está disponível em: https://pirasdev.com(Apenas usuários cadastrados podem acessar. O painel administrativo é restrito e o acesso ao login de admin ainda está sob consideração.)

✨ Funcionalidades

👤 Área do Usuário

Formulário de Login e Registro
Opção "Esqueci minha senha" com envio de e-mail para recuperação
Após o login, o usuário pode:
Inserir uma nova solicitação de reembolso com:
Nome do Reembolso
Categoria do Reembolso
Valor do Reembolso
Comprovante/Documento em .pdf (opcional)
Receber uma mensagem de confirmação de sucesso após o envio da solicitação

🛠️ Área do Administrador

Acesso a todas as solicitações de reembolso realizadas
Visualização de detalhes individuais de cada solicitação
Inclui a opção de abrir e visualizar o comprovante em PDF anexado


Filtro por nome da solicitação para buscar solicitações específicas
Opção de deletar qualquer solicitação


🧰 Tecnologias Utilizadas
🚀 Backend (Node.js + Express)

Metodologia: Arquitetura MVC (Model - View - Controller)
Banco de Dados: Supabase
Storage de Arquivos: Supabase Buckets
Autenticação: JWT via jsonwebtoken
Hash de Senhas: bcrypt para segurança das senhas no banco de dados
Envio de Emails: resend para recuperação de senha
Upload de Arquivos: multer para gerenciamento de PDFs
Variáveis de Ambiente: dotenv para configuração via .env

📦 Dependências Principais
@supabase/supabase-js@2.49.5
bcrypt@5.1.1
cors@2.8.5
dotenv@16.5.0
express@5.1.0
jsonwebtoken@9.0.2
multer@2.0.0
pg@8.16.0
resend@4.5.1
uuid@11.1.0

🎨 Front-end

Tecnologias: HTML, CSS e JavaScript puro
Notificações: SweetAlert para alertas e mensagens interativas
