import admin from "firebase-admin";
import path from "node:path";
import { readFileSync } from "node:fs";

class FirebaseService {
  private _serviceAccount = readFileSync(
    path.resolve("./c45-social-media-firebase-adminsdk-fbsvc-104f54a67e.json"),
  );
  private _client;

  constructor() {
    this._client = admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(this._serviceAccount as unknown as string),
      ),
    });
  }

  async sendNotification({
    token,
    title,
    body,
  }: {
    token: string;
    title: string;
    body: string;
  }) {
    return await this._client
      .messaging()
      .send({ token, data: { title, body } });
  }
  async sendNotifications({
    tokens,
    title,
    body,
  }: {
    tokens: string[];
    title: string;
    body: string;
  }) {
    return await Promise.all(
      tokens.map((token) => {
        return this._client.messaging().send({ token, data: { title, body } });
      }),
    );
  }
}

export default new FirebaseService();
