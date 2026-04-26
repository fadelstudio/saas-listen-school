export interface FcmPayload {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
}
export interface FcmBatchPayload {
    tokens: string[];
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
}
export declare const fcmService: {
    /**
     * Indique si Firebase est correctement configuré et actif.
     */
    isEnabled(): boolean;
    /**
     * Envoie un push à un seul appareil.
     * Retourne silencieusement false si FCM est désactivé ou si le token est invalide.
     */
    sendToDevice(payload: FcmPayload): Promise<boolean>;
    /**
     * Envoie un push à plusieurs appareils (max 500 par batch Firebase).
     * Retourne le nombre de succès.
     */
    sendToMultipleDevices(payload: FcmBatchPayload): Promise<number>;
    /**
     * Envoie un push à un topic Firebase (ex: "school_afi_all").
     * Utile pour des broadcasts ultra-larges sans lister les tokens.
     */
    sendToTopic(topic: string, payload: Omit<FcmPayload, "token">): Promise<boolean>;
};
//# sourceMappingURL=fcm.service.d.ts.map