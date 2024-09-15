import { OpenAPIV3_1 } from 'openapi-types';

import { computeOpenApiPath } from 'src/engine/core-modules/open-api/utils/path.utils';

export const API_Version = 'v0.1';

export const baseSchema = (
  schemaName: 'core' | 'metadata',
  serverUrl: string,
): OpenAPIV3_1.Document => {
  return {
    openapi: '3.0.3',
    info: {
      title: 'CRM - Digito Service Api',
      description: `This is a **CRM - Digito Service REST/API** playground based on the **OpenAPI 3.0 specification**.`,
      termsOfService: 'https://github.com/digitoservice/crm-digitoservice?tab=coc-ov-file',
      contact: {
        email: 'oi@digitoservice.com',
      },
      license: {
        name: 'AGPL-3.0',
        url: 'https://github.com/digitoservice/crm-digitoservice?tab=License-1-ov-file',
      },
      version: API_Version,
    },
    // Testing purposes
    servers: [
      {
        url: `${serverUrl}/rest/${schemaName !== 'core' ? schemaName : ''}`,
        description: 'Production Development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'Enter the token with the `Bearer: ` prefix, e.g. "Bearer abcde12345".',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    externalDocs: {
      description: 'Find out more about **CRM - Digito Service**',
      url: 'https://digitoservice.com',
    },
    paths: { [`/open-api/${schemaName}`]: computeOpenApiPath(serverUrl) },
  };
};
