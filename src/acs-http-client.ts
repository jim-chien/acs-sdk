import { JWTAuthorizer } from "./jwt-authorizer";
import HttpClient from "./http-client";

export interface ACSClientConfig {
  orgId: string;
  orgInstanceId: string;
}

export class ACSHttpClient {
  private httpClient: HttpClient;

  /**
   * https://www.adobe.io/authentication/auth-methods.html#!AdobeDocs/adobeio-auth/master/JWT/JWT.md
   *
   * @param config
   * @param httpClient
   */
  constructor(
    private config: ACSClientConfig,
    private authorizer: JWTAuthorizer,
    httpClient?: HttpClient
  ) {
    this.httpClient = httpClient || new HttpClient();
  }

  /**
   * https://docs.adobe.com/content/help/en/campaign-standard/using/working-with-apis/managing-transactional-messages.html
   *
   * @param eventId
   * @param data
   */
  async sendTransactionalEvent(eventId: string, data: Record<string, any>) {
    const headers = await this.getAuthHeaders();
    const { orgId, orgInstanceId } = this.config;

    const url = `https://mc.adobe.io/${orgInstanceId}/campaign/mc${orgId}/${eventId}`;
    const body = { ctx: data };
    return this.httpClient.post(url, { body, headers });
  }

  private async getAuthHeaders() {
    const { accessToken, clientId } = await this.authorizer.getAuthenticatedCredentials();
    return {
      Authorization: `Bearer ${accessToken}`,
      "X-Api-Key": clientId
    };
  }
}