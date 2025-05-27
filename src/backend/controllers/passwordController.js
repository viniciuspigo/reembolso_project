const { pgPool } = require("../config/supabase");
const { resend } = require("../config/resend");
const { findUserByEmail } = require("../models/usuario");
const {
  createResetToken,
  findResetToken,
  deleteResetToken,
  updateUserPassword,
} = require("../models/password");
const bcrypt = require("bcrypt");

const passwordController = {
  async passwordRecovery(req, res) {
    const { email } = req.body;

    try {
      const existingUser = await findUserByEmail(pgPool, email);

      if (!existingUser) {
        return res.status(404).json({ message: "Email não encontrado." });
      }

      const { token, data_expiracao } = await createResetToken(
        pgPool,
        existingUser.id
      );
      const resetLink = `http://localhost:3000/reset-password?token=${token}`;

      const formatedDate = new Date(data_expiracao).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const { data, error: emailError } = await resend.emails.send({
        from: "Reembolso Project <onboarding@resend.dev>",
        to: [email],
        subject: "Redefinição de senha - Reembolso Project",
        html: `
         <div style="max-width: 600px; margin: 0 auto; padding: 32px; background-color: #f9fbfa; font-family: 'Work Sans', sans-serif; color: #1f2523; border-radius: 8px; border: 1px solid #cdd5d2;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #1f8459; font-weight: 700;">Redefinição de Senha</h2>
      </div>
      <p style="font-size: 16px; margin-bottom: 16px;">
        Olá,
      </p>
      <p style="font-size: 16px; margin-bottom: 16px;">
        Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Reembolso Project</strong>. Para continuar com o processo, clique no botão abaixo:
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="display: inline-block; padding: 14px 24px; background-color: #2cb178; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">
          Redefinir Senha
        </a>
      </div>
      <p style="font-size: 14px; margin-bottom: 16px;">
        Este link expira em <strong>${formatedDate}</strong>. Após esse período, será necessário solicitar uma nova redefinição.
      </p>
      <p style="font-size: 14px; margin-bottom: 32px;">
        Se você não solicitou essa alteração, nenhuma ação é necessária. Você pode ignorar este e-mail com segurança.
      </p>
      <hr style="border: none; border-top: 1px solid #cdd5d2; margin-bottom: 16px;">
      <p style="font-size: 14px; color: #4d5c57;">
        Atenciosamente,<br>
        <strong>Equipe Reembolso Project</strong>
      </p>
    </div>
  `,
      });

      if (emailError) {
        console.log(emailError.message)
        return res.status(500).json({ message: "Erro ao enviar email", error: emailError });
      }

      return res.status(200).json({
        message: "Email de recuperação de senha enviado com sucesso",
        data,
      });
    } catch (error) {
      res.status(500).json({
        error: "Erro ao processar a solicitação.",
        message: error.message,
      });
    }
  },

  async resetPassword(req, res) {
    const { token, newPassword } = req.body;

    try {
      const existingToken = await findResetToken(pgPool, token);

      if (!existingToken) {
        return res.status(400).json({
          message: "Token de recuperação de senha inválido ou expirado",
        });
      }

      if (new Date(existingToken.data_expiracao) < new Date()) {
        return res.status(400).json({ message: "Token expirado" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await updateUserPassword(
        pgPool,
        existingToken.usuario_id,
        hashedPassword
      );

      try {
        await deleteResetToken(pgPool, token);
      } catch (deleteError) {
        return res.status(500).json({
          message: "Senha atualizada, mas erro ao deletar token",
          error: deleteError.message,
        });
      }

      return res.status(200).json({ message: "Senha alterada com sucesso" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Erro ao atualiar senha", error: error.message });
    }
  },
};

module.exports = passwordController;
