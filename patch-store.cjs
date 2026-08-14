const fs = require('fs');
let code = fs.readFileSync('src/store/useAegisStore.ts', 'utf8');

// 1. Make createEmergencyRequest async and fetch
code = code.replace(
  /const createEmergencyRequest = \([\s\S]*?\): EmergencyRequest => \{[\s\S]*?return fullReq;\n  \};/,
  `const createEmergencyRequest = async (
    req: Omit<EmergencyRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'waitingTimeMinutes' | 'priorityScore' | 'priorityClassification' | 'priorityAnalysis'>
  ): Promise<EmergencyRequest> => {
    const newId = \`EMG-\${Math.floor(1000 + Math.random() * 9000)}\`;
    const analysis = calculateAIPriorityScore({
      ...req,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'AI_PRIORITIZED',
      waitingTimeMinutes: 1,
      reporterRole: req.reporterRole || 'CITIZEN'
    });

    const fullReq: EmergencyRequest = {
      ...req,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'AI_PRIORITIZED',
      waitingTimeMinutes: 1,
      priorityScore: analysis.priorityScore,
      priorityClassification: analysis.priorityClassification,
      priorityAnalysis: analysis.priorityAnalysis
    };

    // Save to backend
    try {
      await fetch('/api/emergencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullReq)
      });
      await fetchAllDatabaseState();
    } catch (e) {
      console.error(e);
    }
    return fullReq;
  };`
);

// 2. Make allocateResources async and fetch
code = code.replace(
  /const allocateResources = \([\s\S]*?notify\(\);\n  \};/,
  `const allocateResources = async (
    requestId: string,
    allocatedList: ResourceRequirement[],
    officerName: string
  ) => {
    const targetReq = globalState.emergencies.find(e => e.id === requestId);
    if (targetReq) {
      const updatedReq = {
        ...targetReq,
        status: 'TEAM_ASSIGNED' as const,
        allocatedResources: allocatedList,
        updatedAt: new Date().toISOString()
      };
      await fetch(\`/api/emergencies/\${requestId}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReq)
      });
    }

    // Deduct stock from inventory sequentially
    for (const alloc of allocatedList) {
      const resItem = globalState.resources.find(r => r.id === alloc.resourceId);
      if (resItem) {
        const newAllocated = resItem.allocatedStock + alloc.quantityAllocated;
        const newRemaining = Math.max(0, resItem.totalStock - newAllocated);
        const updatedRes = {
          ...resItem,
          allocatedStock: newAllocated,
          remainingStock: newRemaining,
          lastUpdated: new Date().toISOString()
        };
        await fetch(\`/api/inventory/\${resItem.id}\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedRes)
        });
      }
    }
    await fetchAllDatabaseState();
  };`
);

// 3. Make assignRescueMission async and fetch
code = code.replace(
  /const assignRescueMission = \([\s\S]*?notify\(\);\n  \};/,
  `const assignRescueMission = async (
    requestId: string,
    teamName: string,
    leaderName: string,
    phone: string,
    vehicleType: string,
    personnelCount: number
  ) => {
    const req = globalState.emergencies.find((e) => e.id === requestId);
    if (!req) return;

    const newMissionId = \`MIS-\${Math.floor(100 + Math.random() * 900)}\`;

    const newMission: RescueMission = {
      id: newMissionId,
      requestId: req.id,
      teamId: \`TEAM-\${Math.floor(10 + Math.random() * 90)}\`,
      teamName,
      leaderName,
      contactPhone: phone,
      assignedDistrict: req.location.district,
      personnelCount,
      vehicleType,
      status: 'EN_ROUTE',
      assignedAt: new Date().toISOString(),
      estimatedArrivalMinutes: 12,
      location: req.location,
      allocatedResourcesSummary: req.allocatedResources
        ? req.allocatedResources.map((r) => \`\${r.quantityAllocated} \${r.unit} \${r.resourceName}\`).join(', ')
        : 'Emergency Relief Supply Pack',
      logs: [
        {
          id: \`log-\${Date.now()}\`,
          timestamp: new Date().toISOString(),
          author: globalState.currentUser?.name || 'System',
          message: \`Mission assigned to \${teamName}. Vehicle: \${vehicleType}.\`
        }
      ]
    };

    const updatedReq = {
      ...req,
      status: 'TEAM_ASSIGNED' as const,
      assignedTeamId: newMission.teamId,
      assignedTeamName: teamName,
      updatedAt: new Date().toISOString()
    };

    try {
      await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMission)
      });
      await fetch(\`/api/emergencies/\${requestId}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReq)
      });
      await fetchAllDatabaseState();
    } catch (e) {
      console.error(e);
    }
  };`
);

// 4. Make updateMissionStatus async and fetch
code = code.replace(
  /const updateMissionStatus = \([\s\S]*?notify\(\);\n  \};/,
  `const updateMissionStatus = async (missionId: string, newStatus: RescueMission['status'], logMessage: string) => {
    const m = globalState.missions.find((m) => m.id === missionId);
    if (!m) return;

    let reqStatus: EmergencyStatus = 'RESCUE_IN_PROGRESS';
    if (newStatus === 'MISSION_COMPLETE') reqStatus = 'RESOLVED';

    const updatedMission = {
      ...m,
      status: newStatus,
      logs: [
        ...m.logs,
        {
          id: \`log-\${Date.now()}\`,
          timestamp: new Date().toISOString(),
          author: globalState.currentUser?.name || 'System',
          message: logMessage,
          statusUpdate: newStatus
        }
      ]
    };

    const req = globalState.emergencies.find(e => e.id === m.requestId);
    
    try {
      await fetch(\`/api/missions/\${missionId}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMission)
      });

      if (req) {
        const updatedReq = { ...req, status: reqStatus, updatedAt: new Date().toISOString() };
        await fetch(\`/api/emergencies/\${m.requestId}\`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedReq)
        });
      }
      await fetchAllDatabaseState();
    } catch (e) {
      console.error(e);
    }
  };`
);

fs.writeFileSync('src/store/useAegisStore.ts', code);
console.log('Store updated');
