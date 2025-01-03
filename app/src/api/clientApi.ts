import { ApiResponse } from '@calimero-is-near/calimero-p2p-sdk';

export interface Message {
  id: String;
  proposal_id: String;
  author: String;
  text: String;
  created_at: String;
}

export interface Player {
  name: String;
  is_active: Boolean;
  address: String;
  role: String;
  nonce: Number;
  is_moderator: Boolean;
}

export interface GameState {
  current_phase: number;
  player_count: number;
  current_day: number;
  moderator: String;
  is_moderator_chosen: Boolean;
  mafia_count: number;
  villager_count: number;
  moderator_count: number;
  active_mafia_count: number;
  active_villager_count: number;
}

export interface StorePlayersRequest {
  players: Player[];
}

export interface StorePlayersResponse {}

export interface GetPlayersRequest {}

export interface GetPlayersResponse {
  players: Player[];
}

export interface AssignRoleRequest {
  address: String;
  role: String;
  nonce: Number;
}

export interface AssignRoleResponse {}

export interface GetPlayerNonceRequest {
  address: String;
}

export interface GetPlayerNonceResponse {
  nonce: Number;
}

export interface SetGameStateRequest {
  game_state: GameState;
}

export interface SetGameStateResponse {}

export interface GetGameStateRequest {}

export interface GetGameStateResponse {
  game_state: GameState;
}

export interface GetMessagesRequest {}

export interface GetMessagesResponse {
  messages: Message[];
}

export interface CreateMessageRequest {
  message: Message;
}

export interface CreateMessageResponse {}

export interface GetProposalMessagesRequest {
  // proposalId: String;
  proposal_id: String;
}

export interface GetProposalMessagesResponse {
  messages: Message[];
}

export interface SendProposalMessageRequest {
  // proposalId: String;
  proposal_id: String;
  message: Message;
}

export interface SendProposalMessageResponse {}

export enum ProposalActionType {
  ExternalFunctionCall = 'ExternalFunctionCall',
  Transfer = 'Transfer',
  SetNumApprovals = 'SetNumApprovals',
  SetActiveProposalsLimit = 'SetActiveProposalsLimit',
  SetContextValue = 'SetContextValue',
  DeleteProposal = 'DeleteProposal',
}

export type FormActionType =
  | 'Cross contract call'
  | 'Transfer'
  | 'Set context variable'
  | 'Change number of approvals needed'
  | 'Change number of maximum active proposals';

export interface ExternalFunctionCallAction {
  type: ProposalActionType.ExternalFunctionCall;
  receiver_id: string;
  method_name: string;
  args: Record<string, any>;
  deposit: string;
  gas?: string;
}

export interface TransferAction {
  type: ProposalActionType.Transfer;
  amount: string;
}

export interface CreateProposalRequest {
  action_type: string;
  params: {
    receiver_id?: string;
    method_name?: string;
    args?: string;
    deposit?: string;
    gas?: string;
    amount?: string;
    num_approvals?: number;
    active_proposals_limit?: number;
    key?: string;
    value?: string;
    proposal_id?: string;
  };
}

export interface CreateProposalResponse {
  proposal_id: String;
}

export interface ApproveProposalRequest {
  proposal_id: string;
}

export interface ApproveProposalResponse {}

export enum ClientMethod {
  GET_PROPOSAL_MESSAGES = 'get_proposal_messages',
  SEND_PROPOSAL_MESSAGE = 'send_proposal_messages',
  CREATE_PROPOSAL = 'create_new_proposal',
  APPROVE_PROPOSAL = 'approve_proposal',
  GET_MESSAGES = 'get_messages',
  CREATE_MESSAGE = 'create_message',
  STORE_PLAYERS = 'store_players',
  GET_PLAYERS = 'get_players',
  ASSIGN_ROLE = 'assign_role_and_nonce',
  GET_PLAYER_NONCE = 'get_player_nonce',
  SET_GAME_STATE = 'set_game_state',
  GET_GAME_STATE = 'get_game_state',
}

export interface ClientApi {
  //Cali Storage
  getMessages(request: GetMessagesRequest): ApiResponse<GetMessagesResponse>;
  CreateMessage(
    request: CreateMessageRequest,
  ): ApiResponse<CreateMessageResponse>;
  getProposalMessages(
    proposalsRequest: GetProposalMessagesRequest,
  ): ApiResponse<GetProposalMessagesResponse>;
  sendProposalMessage(
    CreateMessageRequest: SendProposalMessageRequest,
  ): ApiResponse<SendProposalMessageResponse>;
  createProposal(
    request: CreateProposalRequest,
  ): ApiResponse<CreateProposalResponse>;
  approveProposal(
    request: ApproveProposalRequest,
  ): ApiResponse<ApproveProposalResponse>;
  deleteProposal(proposalId: string): ApiResponse<void>;
}
