"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailTemplates = void 0;
const env_1 = require("../config/env");
exports.mailTemplates = {
    /**
     * Layout de base professionnel et moderne
     */
    baseLayout(content, title) {
        const siteName = env_1.env.OTP_SITE_NAME || 'AFI-LISTEN';
        const year = new Date().getFullYear();
        const burgundy = '#800020'; // Couleur AFI
        return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8f9fa;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    .header {
      background: linear-gradient(135deg, ${burgundy} 0%, #a00028 100%);
      padding: 30px 20px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .content {
      padding: 40px 30px;
      color: #444444;
      line-height: 1.6;
    }
    .footer {
      background: #f1f1f1;
      padding: 20px;
      text-align: center;
      color: #888888;
      font-size: 12px;
    }
    .btn {
      display: inline-block;
      padding: 14px 28px;
      background-color: ${burgundy};
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
      transition: background 0.3s ease;
    }
    .otp-block {
      background: #fff8f8;
      border: 2px dashed ${burgundy};
      padding: 25px;
      text-align: center;
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 8px;
      color: #000000;
      border-radius: 8px;
      margin: 30px 0;
    }
    .divider {
      height: 1px;
      background: #eee;
      margin: 20px 0;
    }
    .help-text {
      font-size: 13px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${siteName}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Cet e-mail a été envoyé automatiquement, merci de ne pas y répondre.</p>
      <p>&copy; ${year} ${siteName}. Tous droits réservés.</p>
    </div>
  </div>
</body>
</html>
    `;
    },
    otpTemplate(otp, expiresMin) {
        const content = `
      <h2 style="color: #333; margin-top: 0;">Vérification de votre compte</h2>
      <p>Bonjour,</p>
      <p>Merci de nous avoir rejoint ! Pour finaliser votre inscription, veuillez utiliser le code de vérification sécurisé ci-dessous :</p>
      
      <div class="otp-block">
        ${otp}
      </div>
      
      <p>Ce code est valide pendant <strong>${expiresMin} minutes</strong>. Pour votre sécurité, ne partagez jamais ce code avec qui que ce soit.</p>
      
      <div class="divider"></div>
      
      <p class="help-text">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.</p>
    `;
        return this.baseLayout(content, "Code de vérification");
    },
    passwordResetTemplate(resetUrl) {
        const content = `
      <h2 style="color: #333; margin-top: 0;">Réinitialisation de mot de passe</h2>
      <p>Bonjour,</p>
      <p>Vous avez demandé la réinitialisation du mot de passe de votre compte <strong>AFI-LISTEN</strong>.</p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="btn">Réinitialiser mon mot de passe</a>
      </div>
      
      <p>Ce lien est valide pendant <strong>1 heure</strong>. Après ce délai, vous devrez effectuer une nouvelle demande.</p>
      
      <div class="divider"></div>
      
      <p class="help-text">Si le bouton ci-dessus ne fonctionne pas, copiez et collez l'URL suivante dans votre navigateur :</p>
      <p class="help-text" style="word-break: break-all;">${resetUrl}</p>
      
      <p class="help-text">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet e-mail.</p>
    `;
        return this.baseLayout(content, "Réinitialisation de mot de passe");
    },
    welcomeTemplate(userName) {
        const content = `
      <h2 style="color: #333; margin-top: 0;">Bienvenue sur AFI-LISTEN !</h2>
      <p>Bonjour ${userName},</p>
      <p>Votre compte a été créé avec succès. Vous pouvez désormais vous connecter à votre espace personnel pour suivre vos cours, vos évaluations et vos statistiques.</p>
      
      <div style="text-align: center;">
        <a href="${env_1.env.PUBLIC_APP_URL}" class="btn">Accéder à mon espace</a>
      </div>
      
      <p>Nous sommes ravis de vous compter parmi nous !</p>
    `;
        return this.baseLayout(content, "Bienvenue");
    }
};
//# sourceMappingURL=mail.templates.js.map