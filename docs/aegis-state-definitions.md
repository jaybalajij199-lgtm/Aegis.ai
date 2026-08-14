# AEGIS Lifecycle State Definitions

This document defines the strict operational meaning of status enums used across the AEGIS system for `Emergency` incidents and `RescueMission` deployments. The AI must interpret these states precisely.

## Emergency Incident States

| State | Operational Meaning |
| :--- | :--- |
| `PENDING` | The incident has been reported but not yet assigned or actively handled by any response team. |
| `AI_PRIORITIZED` | The AI assessment and 100-point priority scoring have been performed, but no dispatch has been authorized yet. |
| `TEAM_ASSIGNED` | A response team or unit has been authorized and assigned to the incident. |
| `RESCUE_IN_PROGRESS` | Active field response is underway at the incident location. |
| `RESOLVED` | The incident has been completed, secured, and fully resolved. |
| `COMPLETED` | (Alternative/Alias for RESOLVED) The incident is fully handled. |
| `CANCELLED` | The incident report was deemed a false alarm or otherwise dismissed without resolution. |

## Rescue Mission States

| State | Operational Meaning |
| :--- | :--- |
| `DISPATCHED` | The mission has been authorized and the squad has been dispatched from their origin. |
| `EN_ROUTE` | The response team is actively travelling to the incident location. |
| `ON_SITE` | The response team has arrived at the incident location and is deploying. |
| `EVACUATING` | The response team is actively extracting or transporting casualties and civilians. |
| `MISSION_COMPLETE` | The tactical mission has concluded and assets are standing down or returning to base. |
