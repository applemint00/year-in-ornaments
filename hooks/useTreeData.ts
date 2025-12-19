
import { useState, useEffect, useMemo } from 'react';
import { ArcService } from '../services/arcService';
import { TreeOrnament, TreeDataState } from '../types/tree';
import { assignSlot, TOTAL_CAPACITY } from '../utils/slotEngine';

export const useTreeData = (walletAddress: string | null): TreeDataState => {
  const [state, setState] = useState<TreeDataState>({
    ornaments: [],
    overflowCount: 0,
    isLoading: true
  });

  useEffect(() => {
    const fetchData = async () => {
      setState(prev => ({ ...prev, isLoading: true }));
      try {
        const cleanAddress = walletAddress?.toLowerCase().trim() || null;
        
        // Parallel fetch
        const [global, mine] = await Promise.all([
          ArcService.getGlobalOrnaments(150),
          cleanAddress ? ArcService.getMyOrnaments(cleanAddress) : Promise.resolve([])
        ]);

        // Merge and Deduplicate
        const mergedMap = new Map<string, any>();
        
        // Priority to 'Mine'
        mine.forEach(o => mergedMap.set(o.id, { ...o, isMine: true }));
        global.forEach(o => {
          if (!mergedMap.has(o.id)) {
            mergedMap.set(o.id, { 
              ...o, 
              isMine: cleanAddress ? (o.owner?.toLowerCase() === cleanAddress) : false 
            });
          }
        });

        const allItems = Array.from(mergedMap.values());
        
        // Sort: isMine first, then by date (implied by global order if we wanted)
        allItems.sort((a, b) => (b.isMine ? 1 : 0) - (a.isMine ? 1 : 0));

        // Capacity check
        const displayItems = allItems.slice(0, TOTAL_CAPACITY);
        const overflow = Math.max(0, allItems.length - TOTAL_CAPACITY);

        // Assign Slots
        const ornaments: TreeOrnament[] = displayItems.map((item, index) => {
          const { band, slot, position } = assignSlot(item.id, index, item.isMine);
          return {
            id: item.id,
            url: item.url,
            desc: item.desc,
            owner: item.owner,
            isMine: item.isMine,
            bandIndex: band,
            slotIndex: slot,
            position
          };
        });

        setState({ ornaments, overflowCount: overflow, isLoading: false });
      } catch (error) {
        console.error("Tree data loading failed:", error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchData();
  }, [walletAddress]);

  return state;
};
