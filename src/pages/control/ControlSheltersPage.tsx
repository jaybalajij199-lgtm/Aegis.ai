import React from 'react';
import { useAegisStore } from '../../store/useAegisStore';
import { CitizenShelters } from '../citizen/CitizenShelters';
import { CitizenHospitals } from '../citizen/CitizenHospitals';

export const ControlSheltersPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading text-slate-900">Relief Shelters & Medical Infrastructure</h1>
        <p className="text-xs text-slate-600 font-mono">
          Capacity tracking, bed availability, and emergency hospital networks
        </p>
      </div>

      <CitizenShelters />
      <CitizenHospitals />
    </div>
  );
};
