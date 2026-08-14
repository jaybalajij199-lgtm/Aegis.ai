# AEGIS AI Data Dictionary & Knowledge Base Architecture

This document provides the complete, exhaustive operational data dictionary, entity schemas, relational architecture, machine learning feature matrix, and LLM fine-tuning structures for the AEGIS Disaster Management & AI Triage Engine.

---

## 1. Emergency

### Purpose:
Represents an active disaster incident, citizen emergency SOS distress event, or field casualty report submitted to the system.

### Primary Identifier:
`id` (e.g., `EMG-2026-8942`)

### Operational Meaning:
An `Emergency` represents a ground situation requiring immediate AI assessment, 100-point priority scoring, multi-agency team dispatch, and lifecycle monitoring until safe resolution.

### Field Definitions & Specifications:

| Field Name | Type | Constraints | Description & Operational Impact |
| :--- | :--- | :--- | :--- |
| `id` | `String` | Primary Key, Unique | Unique emergency ticket ID. |
| `createdAt` | `String (ISO 8601)` | Required | Creation timestamp used for queue latency calculation. |
| `updatedAt` | `String (ISO 8601)` | Required | Last modification timestamp. |
| `reporterName` | `String` | Required | Full name of the reporting citizen, officer, or controller. |
| `reporterPhone` | `String` | Required | Contact phone number for verification and field team callback. |
| `reporterRole` | `Enum` | `CITIZEN` \| `GOVERNMENT_OFFICER` \| `CONTROL_ROOM` \| `ADMIN` | Role of the reporter submitting the incident. |
| `disasterType` | `Enum` | `FLOOD` \| `CYCLONE` \| `LANDSLIDE` \| `URBAN_FIRE` \| `EARTHQUAKE` \| `HEATWAVE` \| `TSUNAMI` \| `OTHER` | Specific hazard classification influencing tactical vehicle requirements. |
| `description` | `String` | Required | Raw textual description or transcribed voice telemetry narrative. |
| `peopleAffected` | `Number` | Min: 1 | Estimated headcount of trapped individuals at immediate risk (Factor 1 in scoring). |
| `injuredCount` | `Number` | Min: 0 | Number of casualties requiring immediate trauma and hospital bed routing (Factor 2 in scoring). |
| `childrenCount` | `Number` | Min: 0 | Number of infants and children in the affected group (Demographic vulnerability). |
| `seniorCount` | `Number` | Min: 0 | Number of elderly citizens in the affected group (Demographic vulnerability). |
| `hasFoodShortage` | `Boolean` | Required | `true` indicates food rations are exhausted (Triggers ration allocation). |
| `hasWaterShortage` | `Boolean` | Required | `true` indicates clean drinking water is depleted (Triggers water packs allocation). |
| `roadAccessAvailable` | `Boolean` | Required | `false` indicates roads are submerged/severed, mandating motorized boat or amphibious craft. |
| `location` | `Object` | Required | Coordinates and administrative boundary for spatial queries. |
| `location.lat` | `Number` | Coordinate | Latitude coordinate of the incident. |
| `location.lng` | `Number` | Coordinate | Longitude coordinate of the incident. |
| `location.address` | `String` | Required | Street address, landmark, or village identifier. |
| `location.district` | `String` | Required | Administrative district (e.g., `Cuttack District`). |
| `location.state` | `String` | Required | State jurisdiction (e.g., `Odisha`). |
| `status` | `Enum` | `PENDING` \| `AI_PRIORITIZED` \| `TEAM_ASSIGNED` \| `RESCUE_IN_PROGRESS` \| `RESOLVED` \| `CANCELLED` | Operational lifecycle state. |
| `priorityScore` | `Number` | Range: `0` to `100` | Machine-computed composite urgency score. |
| `priorityClassification` | `Enum` | `CRITICAL` (≥75) \| `HIGH` (50–74) \| `MEDIUM` (25–49) \| `LOW` (<25) | Triage category for dispatch queue ordering. |
| `priorityAnalysis` | `Object` | Optional | Explainable AI (XAI) breakdown with factor-specific points and summary. |
| `voiceNoteUrl` | `String` | Optional | URL or base64 audio data URI of recorded voice distress telemetry. |
| `photoUrl` | `String` | Optional | URL or base64 data URI of attached ground situation photo. |
| `assignedMissionId` | `String` | Optional | Relational reference to the assigned `RescueMission.id`. |

#### Example JSON:
```json
{
  "id": "EMG-2026-8942",
  "createdAt": "2026-08-13T09:30:00.000Z",
  "updatedAt": "2026-08-13T09:35:12.000Z",
  "reporterName": "Manoj Das",
  "reporterPhone": "+91 94370 55678",
  "reporterRole": "CITIZEN",
  "disasterType": "FLOOD",
  "description": "Rooftop collapsed near Jobra embankment. 25 people trapped, water rising rapidly.",
  "peopleAffected": 25,
  "injuredCount": 4,
  "childrenCount": 7,
  "seniorCount": 3,
  "hasFoodShortage": true,
  "hasWaterShortage": true,
  "roadAccessAvailable": false,
  "location": {
    "lat": 20.4625,
    "lng": 85.8828,
    "address": "Jobra Embankment, Ward 12",
    "district": "Cuttack District",
    "state": "Odisha"
  },
  "status": "TEAM_ASSIGNED",
  "priorityScore": 92,
  "priorityClassification": "CRITICAL",
  "priorityAnalysis": {
    "score": 92,
    "classification": "CRITICAL",
    "factors": [
      { "factorName": "Casualty Trauma", "pointsEarned": 20, "maxPoints": 20, "description": "4 urgent injuries" },
      { "factorName": "Vulnerability Ratio", "pointsEarned": 15, "maxPoints": 15, "description": "10 children/elders" },
      { "factorName": "Total Headcount", "pointsEarned": 22, "maxPoints": 25, "description": "25 persons at risk" },
      { "factorName": "Life-Support Shortage", "pointsEarned": 15, "maxPoints": 15, "description": "No potable water/food" },
      { "factorName": "Physical Inaccessibility", "pointsEarned": 15, "maxPoints": 15, "description": "Road severed by flood" },
      { "factorName": "Queue Latency", "pointsEarned": 5, "maxPoints": 10, "description": "Waiting in queue for 12m" }
    ],
    "summary": "Immediate waterborne rescue required. High risk of hypothermia and structural washaway."
  },
  "voiceNoteUrl": "blob:http://localhost:3000/audio-telemetry.webm",
  "photoUrl": "data:image/jpeg;base64,...",
  "assignedMissionId": "MSN-2026-0041"
}
```

---

## 2. RescueMission

### Purpose:
Represents an active or completed field-response mission assigned to disaster response squads (NDRF, ODRAF, SDRF, Fire Services).

### Primary Identifier:
`id` (e.g., `MSN-2026-0041`)

### Operational Meaning:
A `RescueMission` represents the actual response capability assigned to an emergency, coordinating personnel, vehicles, real-time ETA, and field telemetry updates.

### Field Definitions & Specifications:

| Field Name | Type | Constraints | Description & Operational Impact |
| :--- | :--- | :--- | :--- |
| `id` | `String` | Primary Key, Unique | Unique rescue mission identifier. |
| `requestId` | `String` | Foreign Key | References `Emergency.id` for the target incident. |
| `teamId` | `String` | Required | Unique identifier of the assigned rescue battalion or squad. |
| `teamName` | `String` | Required | Official designation of the unit (e.g., `NDRF Battalion 03 • Rapid Squad Alpha`). |
| `leaderName` | `String` | Required | Commanding officer leading the squad. |
| `contactPhone` | `String` | Required | Primary field radio or satellite telephone number. |
| `assignedDistrict` | `String` | Required | Geographic sector assigned to the mission. |
| `personnelCount` | `Number` | Min: 1 | Total number of active field rescuers deployed. |
| `vehicleType` | `String` | Required | Deployed tactical assets (e.g., `2x Inflatable Zodiac Boats + 1x Amphibious 4x4`). |
| `status` | `Enum` | `DISPATCHED` \| `EN_ROUTE` \| `ON_SITE` \| `EVACUATING` \| `MISSION_COMPLETE` | Tactical stepper milestone tracking mission progress. |
| `estimatedArrivalMinutes` | `Number` | Min: 0 | Live estimated travel time in minutes to target coordinates. |
| `logs` | `Array<Object>` | Required | Chronological event logs and telemetry messages. |
| `logs[].timestamp` | `String` | Required | Time string of the log transmission (e.g., `09:35 AM`). |
| `logs[].author` | `String` | Required | Submitter (e.g., `Cmdr. Rajesh Verma` or `Control HQ`). |
| `logs[].message` | `String` | Required | Tactical message, telemetry update, or casualty extraction notes. |
| `logs[].statusUpdate` | `Enum` | Optional | Associated status change at this timestamp. |

#### Example JSON:
```json
{
  "id": "MSN-2026-0041",
  "requestId": "EMG-2026-8942",
  "teamId": "TEAM-NDRF-03",
  "teamName": "NDRF Battalion 03 • Rapid Squad Alpha",
  "leaderName": "Cmdr. Rajesh Verma",
  "contactPhone": "+91 98001 22334",
  "assignedDistrict": "Cuttack & Chaudwar",
  "personnelCount": 16,
  "vehicleType": "2x Inflatable Zodiac Boats + 1x Amphibious 4x4",
  "status": "ON_SITE",
  "estimatedArrivalMinutes": 0,
  "logs": [
    {
      "timestamp": "09:35 AM",
      "author": "Control HQ (AI Orchestrator)",
      "message": "Mission auto-generated and dispatched with 2 boats and 4 trauma kits.",
      "statusUpdate": "DISPATCHED"
    },
    {
      "timestamp": "09:42 AM",
      "author": "Cmdr. Rajesh Verma",
      "message": "Squad en-route via NH-55 bypass avoiding submerged underpass.",
      "statusUpdate": "EN_ROUTE"
    },
    {
      "timestamp": "09:50 AM",
      "author": "Cmdr. Rajesh Verma",
      "message": "[GROUND TELEMETRY] On-site. Extracted 12 citizens. Transferred 4 casualties to SCB Hospital.",
      "statusUpdate": "ON_SITE"
    }
  ]
}
```

---

## 3. InventoryItem

### Purpose:
Represents emergency supplies, food/water rations, medical kits, and rescue equipment located in regional supply depots.

### Primary Identifier:
`id` (e.g., `res_1`)

### Operational Meaning:
`InventoryItem` represents available physical resources that are allocated to active missions and tracked for supply depletion forecasting.

### Field Definitions & Specifications:

| Field Name | Type | Constraints | Description & Operational Impact |
| :--- | :--- | :--- | :--- |
| `id` | `String` | Primary Key, Unique | Unique inventory item identifier. |
| `name` | `String` | Required | Asset name (e.g., `Potable Water Packs (5L)`). |
| `category` | `Enum` | `WATER_FOOD` \| `MEDICAL_SUPPLIES` \| `RESCUE_EQUIPMENT` \| `VEHICLES_BOATS` \| `PERSONNEL_SQUADS` \| `SHELTER_KITS` | Classification category. |
| `totalStock` | `Number` | Min: 0 | Total baseline inventory count in the warehouse. |
| `allocatedStock` | `Number` | Min: 0 | Quantity committed or dispatched to active missions. |
| `remainingStock` | `Number` | Calculated | Uncommitted stock available for immediate dispatch (`totalStock - allocatedStock`). |
| `unit` | `String` | Required | Unit of measurement (e.g., `Packs`, `Kits`, `Boats`, `Units`). |
| `warehouseLocation` | `String` | Required | Depot or facility storing the inventory. |
| `criticalThreshold` | `Number` | Optional | Stock level that triggers automated replenishment alerts. |
| `dailyBurnRate` | `Number` | Optional | Units consumed per day for predictive scarcity modeling ($T_{\text{exhaustion}}$). |
| `lastUpdated` | `String (ISO 8601)` | Required | Timestamp of the last stock adjustment. |

#### Example JSON:
```json
{
  "id": "res_1",
  "name": "Potable Water Packs (5L)",
  "category": "WATER_FOOD",
  "totalStock": 10000,
  "allocatedStock": 5500,
  "remainingStock": 4500,
  "unit": "Packs",
  "warehouseLocation": "Cuttack Central Supply Depot 01",
  "criticalThreshold": 2000,
  "dailyBurnRate": 3200,
  "lastUpdated": "2026-08-13T09:40:00.000Z"
}
```

---

## 4. ShelterInfo

### Purpose:
Represents designated evacuation shelters, flood relief camps, and safe temporary relocation centers.

### Primary Identifier:
`id` (e.g., `SHL-01`)

### Operational Meaning:
`ShelterInfo` represents where displaced civilians can potentially be evacuated and provides real-time capacity and food/water day reserves.

### Field Definitions & Specifications:

| Field Name | Type | Constraints | Description & Operational Impact |
| :--- | :--- | :--- | :--- |
| `id` | `String` | Primary Key, Unique | Unique shelter identifier. |
| `name` | `String` | Required | Official facility title (e.g., `BOSE Engineering School Relief Center`). |
| `district` | `String` | Required | Administrative district location. |
| `capacity` | `Number` | Min: 1 | Maximum civilian occupancy capacity. |
| `currentOccupancy` | `Number` | Min: 0 | Number of civilians currently sheltered. |
| `availableCapacity` | `Number` | Calculated | Remaining open space (`capacity - currentOccupancy`). |
| `foodStockDays` | `Number` | Min: 0 | Number of days of food rations remaining on-site. |
| `waterStockDays` | `Number` | Min: 0 | Number of days of potable drinking water remaining on-site. |
| `hasMedicalPost` | `Boolean` | Required | Indicates presence of on-site medical staff/first-aid post. |
| `contactPerson` | `String` | Required | Facility coordinator or nodal officer name. |
| `phone` | `String` | Required | Telephone contact for the shelter. |
| `location` | `Object` | Required | Coordinates `{ lat: Number, lng: Number }` for spatial proximity matching. |
| `status` | `Enum` | `OPERATIONAL` \| `NEAR_CAPACITY` \| `FULL` \| `INACCESSIBLE` | Operational capacity and access status. |

#### Example JSON:
```json
{
  "id": "SHL-01",
  "name": "BOSE Engineering School Relief Center",
  "district": "Cuttack",
  "capacity": 800,
  "currentOccupancy": 580,
  "availableCapacity": 220,
  "foodStockDays": 4.5,
  "waterStockDays": 3.0,
  "hasMedicalPost": true,
  "contactPerson": "Dr. A. K. Mohapatra",
  "phone": "+91 94371 99887",
  "location": {
    "lat": 20.4680,
    "lng": 85.8790
  },
  "status": "OPERATIONAL"
}
```

---

## 5. HospitalInfo

### Purpose:
Represents emergency medical facilities, trauma centers, and tertiary hospitals integrated into the emergency grid.

### Primary Identifier:
`id` (e.g., `HSP-01`)

### Operational Meaning:
`HospitalInfo` represents medical treatment capacity available during an emergency, including trauma capability, ICU beds, and ambulances.

### Field Definitions & Specifications:

| Field Name | Type | Constraints | Description & Operational Impact |
| :--- | :--- | :--- | :--- |
| `id` | `String` | Primary Key, Unique | Unique hospital identifier. |
| `name` | `String` | Required | Official hospital title (e.g., `SCB Medical College & Hospital`). |
| `district` | `String` | Required | Administrative district location. |
| `totalBeds` | `Number` | Min: 1 | Total general inpatient bed capacity. |
| `availableBeds` | `Number` | Min: 0 | Currently unoccupied general beds. |
| `icuBedsTotal` | `Number` | Min: 0 | Total Intensive Care Unit (ICU) beds. |
| `icuBedsAvailable` | `Number` | Min: 0 | Unoccupied ICU beds with ventilator support. |
| `ambulancesAvailable` | `Number` | Min: 0 | Active emergency transport vehicles ready for dispatch. |
| `traumaLevel` | `String` | Required | Trauma capability classification (e.g., `Level 1 Trauma Center`). |
| `hasOxygenPlant` | `Boolean` | Required | Indicates presence of an operational on-site PSA oxygen plant. |
| `contactPhone` | `String` | Required | Emergency casualty / trauma room hotline. |
| `location` | `Object` | Required | Coordinates `{ lat: Number, lng: Number }` for route calculation. |
| `status` | `Enum` | `OPERATIONAL` \| `NEAR_CAPACITY` \| `FULL` | Hospital intake capability status. |

#### Example JSON:
```json
{
  "id": "HSP-01",
  "name": "SCB Medical College & Hospital",
  "district": "Cuttack",
  "totalBeds": 600,
  "availableBeds": 85,
  "icuBedsTotal": 80,
  "icuBedsAvailable": 12,
  "ambulancesAvailable": 8,
  "traumaLevel": "Level 1 Trauma Center",
  "hasOxygenPlant": true,
  "contactPhone": "+91 671 2414004",
  "location": {
    "lat": 20.4789,
    "lng": 85.8912
  },
  "status": "OPERATIONAL"
}
```

---

## 6. User

### Purpose:
Represents authenticated personnel across the system and governs role-based access control (RBAC).

### Primary Identifier:
`id` (e.g., `USR-002`)

### Operational Meaning:
`User` determines who is interacting with the system, what operational portal they access, and their authority to create dispatches, logs, or audit records.

### Field Definitions & Specifications:

| Field Name | Type | Constraints | Description & Operational Impact |
| :--- | :--- | :--- | :--- |
| `id` | `String` | Primary Key, Unique | Unique user identifier. |
| `name` | `String` | Required | Full name of the user. |
| `email` | `String` | Unique, Valid Email | System authentication email. |
| `role` | `Enum` | `CITIZEN` \| `GOVERNMENT_OFFICER` \| `CONTROL_ROOM` \| `ADMIN` | Role governing portal permissions and AI Copilot behavior. |
| `phone` | `String` | Required | Contact telephone number. |
| `agencyName` | `String` | Optional | Affiliated department (e.g., `NDRF BATTALION 03 • RAPID SQUAD ALPHA`). |
| `assignedDistrict` | `String` | Optional | Designated operational district. |
| `badgeNumber` | `String` | Optional | Responder or official government identification badge number. |
| `isActive` | `Boolean` | Default: `true` | Indicates active operational duty status. |
| `createdAt` | `String (ISO 8601)` | Required | Account creation timestamp. |

#### Example JSON:
```json
{
  "id": "USR-002",
  "name": "Cmdr. Rajesh Verma",
  "email": "officer.verma@ndrf.gov.in",
  "role": "GOVERNMENT_OFFICER",
  "phone": "+91 98001 22334",
  "agencyName": "NDRF BATTALION 03 • RAPID SQUAD ALPHA",
  "assignedDistrict": "Cuttack & Chaudwar",
  "badgeNumber": "NDRF-OD-4091",
  "isActive": true,
  "createdAt": "2026-01-10T00:00:00.000Z"
}
```

---

## 7. Machine Learning Feature Matrix (100-Point Triage Model)

| Variable | Feature Name | Data Type | Value Range | Max Weight | Operational Objective |
| :--- | :--- | :--- | :--- | :--- | :--- |
| $X_1$ | `peopleAffected` | Integer | $0 \to 10,000+$ | 25 Points | Scaled population density at immediate risk. |
| $X_2$ | `injuredCount` | Integer | $0 \to 500+$ | 20 Points | Trauma triage weight requiring immediate paramedic intervention. |
| $X_3$ | `vulnerabilityRatio` | Float | $0.0 \to 1.0$ | 15 Points | Calculated as $(children + seniors) / totalPeople$. |
| $X_4$ | `shortageSeverity` | Integer | $\{0, 1, 2, 3\}$ | 15 Points | $0$: None, $1$: Food, $2$: Water, $3$: Both Food & Water exhausted. |
| $X_5$ | `isolationRisk` | Binary | $\{0, 1\}$ | 15 Points | $1$ if road access is severed (`roadAccessAvailable == false`). |
| $X_6$ | `queueLatencyMins` | Integer | $0 \to 720$ | 10 Points | Escalation penalty for unaddressed pending requests. |
| **$Y$** | **`priorityScore`** | **Integer** | **$0 \to 100$** | **100%** | **Composite Priority Ranking Index.** |

---

## 8. Relational Entity-Relationship Diagram (ERD)

```
       ┌────────────────────────┐
       │         User           │
       │  (Citizens / Rescuers) │
       └───────────┬────────────┘
                   │ 1:N (Creates reports & leads missions)
                   ▼
       ┌────────────────────────┐               ┌────────────────────────┐
       │   Emergency Incident   │ 1:1 Linked    │     RescueMission      │
       │  (Triage & Distress)   ├──────────────►│  (Tactical Execution)  │
       └───────────┬────────────┘               └───────────┬────────────┘
                   │                                        │
     1:N Allocated │ Supplies                  1:N Depleted │ In Field
                   ▼                                        ▼
       ┌────────────────────────┐               ┌────────────────────────┐
       │   InventoryItem        │               │  ShelterInfo & Hospital│
       │  (Depots & Warehouses) │               │   (Facility Capacity)  │
       └────────────────────────┘               └────────────────────────┘
```
