export const PHASE_ROLE_ASSIGNMENT = 3;
export const PHASE_NIGHT = 4;
export const PHASE_DAY = 5;

export const ROLE_UNASSIGNED = 0;
export const ROLE_VILLAGER = 1;
export const ROLE_MAFIA = 2;

export const getRoleName = (role: number) => {
  switch (role) {
    case ROLE_VILLAGER:
      return 'Villager';
    case ROLE_MAFIA:
      return 'Mafia';
    default:
      return 'Unassigned';
  }
};

export const getPhaseName = (phase: number) => {
  switch (phase) {
    case PHASE_ROLE_ASSIGNMENT:
      return 'Role Assignment';
    case PHASE_NIGHT:
      return 'Night';
    case PHASE_DAY:
      return 'Day';
    default:
      return 'Unknown';
  }
};
