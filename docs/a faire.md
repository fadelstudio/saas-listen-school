Donc pas FCM / push (pour l’instant)
FCM = push notifications mobile (Android/iOS) → pas intégré ici.
Si tu veux du push plus tard, tu gardes cette table comme source-of-truth, et tu ajoutes un “dispatcher” (worker) qui envoie via FCM/email/SMS selon channel, puis marque deliveredAt, etc.