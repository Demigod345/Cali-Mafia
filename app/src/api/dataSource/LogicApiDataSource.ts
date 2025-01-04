// @ts-nocheck

import {
  ApiResponse,
  JsonRpcClient,
  RequestConfig,
  WsSubscriptionsClient,
  RpcError,
  handleRpcError,
  RpcQueryParams,
} from '@calimero-is-near/calimero-p2p-sdk';
import {
  GetMessagesRequest,
  GetMessagesResponse,
  CreateMessageRequest,
  CreateMessageResponse,
  ApproveProposalRequest,
  ApproveProposalResponse,
  ClientApi,
  ClientMethod,
  CreateProposalRequest,
  CreateProposalResponse,
  GetProposalMessagesRequest,
  GetProposalMessagesResponse,
  SendProposalMessageRequest,
  SendProposalMessageResponse,
  StorePlayersRequest,
  StorePlayersResponse,
  GetPlayersRequest,
  GetPlayersResponse,
  AssignRoleRequest,
  AssignRoleResponse,
  GetPlayerNonceRequest,
  GetPlayerNonceResponse,
  SetGameStateRequest,
  SetGameStateResponse,
  GetGameStateRequest,
  GetGameStateResponse,
} from '../clientApi';
import { getContextId, getNodeUrl } from '../../utils/node';
import {
  getJWTObject,
  getStorageAppEndpointKey,
  JsonWebToken,
} from '../../utils/storage';
import { AxiosHeader, createJwtHeader } from '../../utils/jwtHeaders';
import { getRpcPath } from '../../utils/env';

export function getJsonRpcClient() {
  return new JsonRpcClient(getStorageAppEndpointKey() ?? '', getRpcPath());
}

export function getWsSubscriptionsClient() {
  return new WsSubscriptionsClient(getStorageAppEndpointKey() ?? '', '/ws');
}

export function getConfigAndJwt() {
  const jwtObject: JsonWebToken | null = getJWTObject();
  const headers: AxiosHeader | null = createJwtHeader();
  if (!headers) {
    return {
      error: { message: 'Failed to create auth headers', code: 500 },
    };
  }
  if (!jwtObject) {
    return {
      error: { message: 'Failed to get JWT token', code: 500 },
    };
  }
  if (jwtObject.executor_public_key === null) {
    return {
      error: { message: 'Failed to get executor public key', code: 500 },
    };
  }

  const config: RequestConfig = {
    headers: headers,
    timeout: 10000,
  };

  return { jwtObject, config };
}

export class LogicApiDataSource implements ClientApi {
  // async storePlayers(
  //   request: StorePlayersRequest,
  // ): ApiResponse<StorePlayersResponse> {
  //   const { jwtObject, config, error } = getConfigAndJwt();
  //   if (error) {
  //     return { error };
  //   }

  //   console.log('Creating action with request:', request);

  //   const params: RpcQueryParams<typeof request> = {
  //     contextId: jwtObject?.context_id ?? getContextId(),
  //     method: ClientMethod.STORE_PLAYERS,
  //     argsJson: request,
  //     executorPublicKey: jwtObject.executor_public_key,
  //   };

  //   console.log('RPC params:', params);

  //   const response = await getJsonRpcClient().execute<
  //     typeof request,
  //     StorePlayersResponse
  //   >(params, config);

  //   console.log('Raw response:', response);

  //   if (response?.error) {
  //     console.error('RPC error:', response.error);
  //     return await this.handleError(response.error, {}, this.createAction);
  //   }

  //   return {
  //     data: response.result.output as StorePlayersResponse,
  //     error: null,
  //   };
  // }

  // async getPlayers(
  //   request: GetPlayersRequest,
  // ): ApiResponse<GetPlayersResponse> {
  //   const { jwtObject, config, error } = getConfigAndJwt();
  //   if (error) {
  //     return { error };
  //   }

  //   const params: RpcQueryParams<typeof request> = {
  //     contextId: jwtObject?.context_id ?? getContextId(),
  //     method: ClientMethod.GET_PLAYERS,
  //     argsJson: request,
  //     executorPublicKey: jwtObject.executor_public_key,
  //   };

  //   console.log('RPC params:', params);

  //   const response = await getJsonRpcClient().execute<
  //     typeof request,
  //     GetPlayersResponse
  //   >(params, config);

  //   console.log('Raw response:', response);

  //   if (response?.error) {
  //     console.error('RPC error:', response.error);
  //     return await this.handleError(response.error, {}, this.createAction);
  //   }

  //   return {
  //     data: response.result.output as GetPlayersResponse,
  //     error: null,
  //   };
  // }

  async assignRole(
    request: AssignRoleRequest,
  ): ApiResponse<AssignRoleResponse> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) {
      return { error };
    }

    const params: RpcQueryParams<typeof request> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.ASSIGN_ROLE,
      argsJson: request,
      executorPublicKey: jwtObject.executor_public_key,
    };

    console.log('RPC params:', params);

    const response = await getJsonRpcClient().execute<
      typeof request,
      AssignRoleResponse
    >(params, config);

    console.log('Raw response:', response);

    if (response?.error) {
      console.error('RPC error:', response.error);
      return await this.handleError(response.error, {}, this.createAction);
    }

    return {
      data: response.result.output as AssignRoleResponse,
      error: null,
    };
  }

  async getPlayerNonce(
    request: GetPlayerNonceRequest,
  ): ApiResponse<GetPlayerNonceResponse> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) {
      return { error };
    }

    const params: RpcQueryParams<typeof request> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.GET_PLAYER_NONCE,
      argsJson: request,
      executorPublicKey: jwtObject.executor_public_key,
    };

    console.log('RPC params:', params);

    const response = await getJsonRpcClient().execute<
      typeof request,
      GetPlayerNonceResponse
    >(params, config);

    console.log('Raw response:', response);

    if (response?.error) {
      console.error('RPC error:', response.error);
      return await this.handleError(response.error, {}, this.createAction);
    }

    return {
      data: response.result.output as GetPlayerNonceResponse,
      error: null,
    };
  }

  // async getGameState(
  //   request: GetGameStateRequest,
  // ): ApiResponse<GetGameStateResponse> {
  //   const { jwtObject, config, error } = getConfigAndJwt();
  //   if (error) {
  //     return { error };
  //   }

  //   const params: RpcQueryParams<typeof request> = {
  //     contextId: jwtObject?.context_id ?? getContextId(),
  //     method: ClientMethod.GET_GAME_STATE,
  //     argsJson: request,
  //     executorPublicKey: jwtObject.executor_public_key,
  //   };

  //   console.log('RPC params:', params);

  //   const response = await getJsonRpcClient().execute<
  //     typeof request,
  //     GetGameStateResponse
  //   >(params, config);

  //   console.log('Raw response:', response);

  //   if (response?.error) {
  //     console.error('RPC error:', response.error);
  //     return await this.handleError(response.error, {}, this.createAction);
  //   }

  //   return {
  //     data: response.result.output as GetGameStateResponse,
  //     error: null,
  //   };
  // }

  // async setGameState(
  //   request: SetGameStateRequest,
  // ): ApiResponse<SetGameStateResponse> {
  //   const { jwtObject, config, error } = getConfigAndJwt();
  //   if (error) {
  //     return { error };
  //   }

  //   const params: RpcQueryParams<typeof request> = {
  //     contextId: jwtObject?.context_id ?? getContextId(),
  //     method: ClientMethod.SET_GAME_STATE,
  //     argsJson: request,
  //     executorPublicKey: jwtObject.executor_public_key,
  //   };

  //   console.log('RPC params:', params);

  //   const response = await getJsonRpcClient().execute<
  //     typeof request,
  //     SetGameStateResponse
  //   >(params, config);

  //   console.log('Raw response:', response);

  //   if (response?.error) {
  //     console.error('RPC error:', response.error);
  //     return await this.handleError(response.error, {}, this.createAction);
  //   }

  //   return {
  //     data: response.result.output as SetGameStateResponse,
  //     error: null,
  //   };
  // }

  async createProposal(
    request: CreateProposalRequest,
  ): ApiResponse<CreateProposalResponse> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) {
      return { error };
    }

    console.log('Creating proposal with request:', request);

    const params: RpcQueryParams<typeof request> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.CREATE_PROPOSAL,
      argsJson: {
        request: request,
      },
      executorPublicKey: jwtObject.executor_public_key,
    };

    console.log('RPC params:', params);

    try {
      const response = await getJsonRpcClient().execute<
        typeof request,
        CreateProposalResponse
      >(params, config);

      console.log('Raw response:', response);

      if (response?.error) {
        console.error('RPC error:', response.error);
        return await this.handleError(response.error, {}, this.createProposal);
      }

      if (!response?.result?.output) {
        console.error('Invalid response format:', response);
        return {
          error: { message: 'Invalid response format', code: 500 },
          data: null,
        };
      }

      return {
        data: response.result.output as CreateProposalResponse,
        error: null,
      };
    } catch (err) {
      console.error('Unexpected error:', err);
      return {
        error: { message: err.message || 'Unexpected error', code: 500 },
        data: null,
      };
    }
  }

  async approveProposal(
    request: ApproveProposalRequest,
  ): ApiResponse<ApproveProposalResponse> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) {
      return { error };
    }

    console.log('appoveProposal', request);

    const params: RpcQueryParams<ApproveProposalRequest> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.APPROVE_PROPOSAL,
      argsJson: request,
      executorPublicKey: jwtObject.executor_public_key,
    };

    const response = await getJsonRpcClient().execute<
      ApproveProposalRequest,
      ApproveProposalResponse
    >(params, config);

    console.log('appoveProposal response', response);

    if (response?.error) {
      return await this.handleError(response.error, {}, this.approveProposal);
    }

    return {
      data: {},
      error: null,
    };
  }

  // async getMessages(request: GetMessagesRequest): ApiResponse<GetMessagesResponse> {
  //   const { jwtObject, config, error } = getConfigAndJwt();
  //   if (error) {
  //     return { error };
  //   }

  //   console.log('getMessages', request);

  //   const params: RpcQueryParams<GetMessagesRequest> = {
  //     contextId: jwtObject?.context_id ?? getContextId(),
  //     method: ClientMethod.GET_MESSAGES,
  //     argsJson: request,
  //     executorPublicKey: jwtObject.executor_public_key,
  //   };

  //   const response = await getJsonRpcClient().query<
  //     GetMessagesRequest,
  //     GetMessagesResponse
  //   >(params, config);

  //   console.log('getMessages response', response);

  //   if (response?.error) {
  //     return await this.handleError(response.error, {}, this.getMessages);
  //   }

  //   let getMessagesResponse: GetMessagesResponse = {
  //     messages: response?.result?.output?.messages,
  //   } as GetMessagesResponse;

  //   return {
  //     data: getMessagesResponse,
  //     error: null,
  //   };

  // }

  // async getMessages(
  //   request: GetMessagesRequest,
  // ): ApiResponse<GetMessagesResponse> {
  //   const { jwtObject, config, error } = getConfigAndJwt();
  //   if (error) {
  //     return { error };
  //   }

  //   console.log('getMessages', request);

  //   const params: RpcQueryParams<GetMessagesRequest> = {
  //     contextId: jwtObject?.context_id ?? getContextId(),
  //     method: ClientMethod.GET_MESSAGES,
  //     argsJson: request,
  //     executorPublicKey: jwtObject.executor_public_key,
  //   };

  //   const response = await getJsonRpcClient().query<
  //     GetMessagesRequest,
  //     GetMessagesResponse
  //   >(params, config);

  //   console.log('getMessages response', response);

  //   if (response?.error) {
  //     return await this.handleError(
  //       response.error,
  //       {},
  //       this.getProposalMessages,
  //     );
  //   }

  //   let getMessagesResponse: GetMessagesResponse = {
  //     messages: response?.result?.output?.messages,
  //   } as GetProposalMessagesResponse;

  //   return {
  //     data: getMessagesResponse,
  //     error: null,
  //   };
  // }

  // async createMessage(
  //   request: CreateMessageRequest,
  // ): ApiResponse<CreateMessageResponse> {
  //   const { jwtObject, config, error } = getConfigAndJwt();
  //   if (error) {
  //     return { error };
  //   }

  //   const response = await getJsonRpcClient().execute<
  //     CreateMessageRequest,
  //     CreateMessageResponse
  //   >(
  //     {
  //       contextId: jwtObject?.context_id ?? getContextId(),
  //       method: ClientMethod.CREATE_MESSAGE,
  //       argsJson: request,
  //       executorPublicKey: jwtObject.executor_public_key,
  //     },
  //     config,
  //   );
  //   if (response?.error) {
  //     return await this.handleError(response.error, {}, this.createMessage);
  //   }

  //   return {
  //     data: {},
  //     error: null,
  //   };
  // }

  async getProposalMessages(
    request: GetProposalMessagesRequest,
  ): ApiResponse<GetProposalMessagesResponse> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) {
      return { error };
    }

    console.log('getProposalMessages', request);

    const params: RpcQueryParams<GetProposalMessagesRequest> = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.GET_PROPOSAL_MESSAGES,
      argsJson: request,
      executorPublicKey: jwtObject.executor_public_key,
    };

    const response = await getJsonRpcClient().query<
      GetProposalMessagesRequest,
      GetProposalMessagesResponse
    >(params, config);

    console.log('getProposalMessages response', response);

    if (response?.error) {
      return await this.handleError(
        response.error,
        {},
        this.getProposalMessages,
      );
    }

    // console.log("response: "+ response.result.output[0].text);
    // const respArry = response.result.output;
    // for (const obj of respArry) {
    //   console.log(obj.text);
    // }

    let getProposalsResponse: GetProposalMessagesResponse = {
      messages: response?.result?.output,
    } as GetProposalMessagesResponse;

    return {
      data: getProposalsResponse,
      error: null,
    };
  }
  async sendProposalMessage(
    request: SendProposalMessageRequest,
  ): ApiResponse<SendProposalMessageResponse> {
    const { jwtObject, config, error } = getConfigAndJwt();
    if (error) {
      return { error };
    }

    const response = await getJsonRpcClient().execute<
      SendProposalMessageRequest,
      SendProposalMessageResponse
    >(
      {
        contextId: jwtObject?.context_id ?? getContextId(),
        method: ClientMethod.SEND_PROPOSAL_MESSAGE,
        argsJson: request,
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );
    if (response?.error) {
      return await this.handleError(
        response.error,
        {},
        this.sendProposalMessage,
      );
    }

    return {
      data: {},
      error: null,
    };
  }

  private async handleError(
    error: RpcError,
    params: any,
    callbackFunction: any,
  ) {
    if (error && error.code) {
      const response = await handleRpcError(error, getNodeUrl);
      if (response.code === 403) {
        return await callbackFunction(params);
      }
      return {
        error: await handleRpcError(error, getNodeUrl),
      };
    }
  }
}
