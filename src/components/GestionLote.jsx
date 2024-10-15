import React, { useState } from 'react';
import LoteSelector from './GestionLote/LoteSelector.jsx';
import GraficasLotes from './GestionLote/GraficasLote.jsx';

const GestionLote = () => {
  const [selectedLote, setSelectedLote] = useState(null);

  return (
    <div className="container mx-auto p-4">
      <LoteSelector onSelectLote={setSelectedLote} />
      {selectedLote && (
        <GraficasLotes idLote={selectedLote} />
      )}
    </div>
  );
};

export default GestionLote;
