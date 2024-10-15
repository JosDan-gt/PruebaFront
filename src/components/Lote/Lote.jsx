import React, { useState } from 'react';
import LotesActivos from './LotesActivos';
import LotesDadosDeBaja from './LotesDadosDeBaja';

const LotesManager = () => {
  const [reloadFlag, setReloadFlag] = useState(false);

  const triggerReload = () => {
    setReloadFlag(prev => !prev);
  };

  return (
    <div>
      <div>
        <LotesActivos reloadFlag={reloadFlag} triggerReload={triggerReload} />
      </div>
      <div className='mt-4'>
        <LotesDadosDeBaja reloadFlag={reloadFlag} triggerReload={triggerReload} />
      </div>
    </div>
  );
};

export default LotesManager;
