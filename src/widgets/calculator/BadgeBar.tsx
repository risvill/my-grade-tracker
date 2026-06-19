import React, { useEffect, useState } from 'react';
import { ACHIEVEMENTS } from '../../utils/achievments';
interface BadgeBarProps {
  unlocked: string[];
}

export const BadgeBar = ({ unlocked }: BadgeBarProps) => {
  return (
    <div className="badge-bar" style={{ display: 'flex', gap: '15px', padding: '20px', overflowX: 'auto', justifyContent: 'center' }}>
      {ACHIEVEMENTS.map((ach) => {
        const isUnlocked = unlocked.includes(ach.id);
        return (
          <div 
            key={ach.id} 
            title={`${ach.title}: ${ach.description}`}
            style={{ 
              filter: isUnlocked ? 'none' : 'grayscale(1) opacity(0.3)',
              fontSize: '24px',
              cursor: 'help',
              transition: 'transform 0.2s'
            }}
          >
            {ach.icon}
            
          </div>
          
        );
      })}
    </div>
  );
};