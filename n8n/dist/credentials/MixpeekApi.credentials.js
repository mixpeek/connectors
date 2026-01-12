"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MixpeekApi = void 0;
class MixpeekApi {
    constructor() {
        this.name = 'mixpeekApi';
        this.displayName = 'Mixpeek API';
        this.documentationUrl = 'https://docs.mixpeek.com';
        this.properties = [
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                required: true,
                description: 'Your Mixpeek API key. Get it from https://app.mixpeek.com',
            },
            {
                displayName: 'Base URL',
                name: 'baseUrl',
                type: 'string',
                default: 'https://api.mixpeek.com',
                description: 'The base URL for the Mixpeek API',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    Authorization: '=Bearer {{$credentials.apiKey}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: '={{$credentials.baseUrl}}',
                url: '/v1/namespaces/list',
                method: 'POST',
                body: {},
            },
        };
    }
}
exports.MixpeekApi = MixpeekApi;
//# sourceMappingURL=MixpeekApi.credentials.js.map