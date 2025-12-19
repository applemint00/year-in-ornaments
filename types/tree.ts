
export interface TreeOrnament {
  id: string;
  url: string;
  desc: string;
  owner: string;
  isMine: boolean;
  bandIndex: number;
  slotIndex: number;
  position: [number, number, number];
}

export interface DecorInstance {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  type: 'ribbon' | 'icicle' | 'fairy';
  color?: string;
}

export interface TreeDataState {
  ornaments: TreeOrnament[];
  overflowCount: number;
  isLoading: boolean;
}
