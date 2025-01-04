export type Player = {
  name: string;
  address: string;
  public_identity_key: string;
  is_moderator: boolean;
  is_active: boolean;
  revealed_role: number;
};

export type GameState = {
  created: boolean;
  started: boolean;
  ended: boolean;
  current_phase: number;
  player_count: number;
  current_day: number;
  moderator: string;
  is_moderator_chosen: boolean;
  mafia_count: number;
  villager_count: number;
  moderator_count: number;
  active_mafia_count: number;
  active_villager_count: number;
};

export type Message = {
  id: string;
  proposal_id: string;
  author: string;
  text: string;
  created_at: string;
};
