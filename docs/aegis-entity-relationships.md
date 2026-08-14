# AEGIS Entity Relationships & Architecture

This document defines the formal entity relationships, cardinalities, foreign key references, and operational lifecycles governing the AEGIS Disaster Management & AI Orchestration System.

---

## 1. Core Entity Relationships

### 1.1 `Emergency` → `RescueMission`
- **Cardinality**: `1 : 0..1` (One-to-Zero-or-One) or `1 : N` (for complex multi-squad dispatches)
- **Foreign Key**: `RescueMission.requestId` $\rightarrow$ `Emergency.id` (also linked via `Emergency.assignedMissionId`)
- **Operational Rule**: 
  - An emergency distress event represents a situation requiring triage. When the AI or control room authorizes a response, a `RescueMission` is instantiated and dispatched.
  - The mission tracks on-ground rescue personnel, vehicle assets (motorboats, 4x4s), real-time ETA, and live radio telemetry logs.
  - When `RescueMission.status` advances (`DISPATCHED` $\rightarrow$ `EN_ROUTE` $\rightarrow$ `ON_SITE` $\rightarrow$ `EVACUATING` $\rightarrow$ `MISSION_COMPLETE`), the linked `Emergency.status` synchronizes in real time.

---

### 1.2 `Emergency` → `InventoryItem`
- **Cardinality**: `N : M` (Many-to-Many via Allocation Ledger)
- **Foreign Key Reference**: Linked via `IncidentAllocationPlan.allocatedInventory` (`itemId` $\rightarrow$ `InventoryItem.id`)
- **Operational Rule**:
  - An emergency may require life-saving physical supplies based on reported shortages and casualties (e.g., potable 5L water packs, meal rations, trauma kits, inflatable zodiac boats).
  - Allocation Engine deducts from `InventoryItem.remainingStock` and increments `InventoryItem.allocatedStock`.
  - Burn-rate tracking models predict warehouse depletion hours ($T_{\text{exhaustion}}$) to trigger inter-depot rebalancing before stockouts occur.

---

### 1.3 `Emergency` → `HospitalInfo`
- **Cardinality**: `N : 1` (Many-to-One per casualty batch)
- **Foreign Key Reference**: `Emergency.facilityRouting.casualtyHospital` (`hospitalId` $\rightarrow$ `HospitalInfo.id`)
- **Operational Rule**:
  - Casualties and trauma victims (`Emergency.injuredCount > 0`) require immediate hospital intake.
  - The Allocation Engine calculates Great-Circle Haversine distance and checks `HospitalInfo.availableBeds`, `HospitalInfo.icuBedsAvailable`, and `HospitalInfo.traumaLevel`.
  - Real-time admissions decrement hospital bed availability and alert the trauma emergency room prior to ambulance arrival.

---

### 1.4 `Emergency` → `ShelterInfo`
- **Cardinality**: `N : 1` (Many-to-One per civilian evacuee cohort)
- **Foreign Key Reference**: `Emergency.facilityRouting.evacueeShelter` (`shelterId` $\rightarrow$ `ShelterInfo.id`)
- **Operational Rule**:
  - Displaced and trapped non-casualty civilians (`peopleAffected - injuredCount`) require safe relocation.
  - The system matches evacuees with the nearest operational shelter having `availableCapacity > 0` and verified `foodStockDays` / `waterStockDays` reserves.
  - Shelter occupancy (`currentOccupancy`) increments upon evacuee intake confirmation.

---

### 1.5 `User` → `Emergency`
- **Cardinality**: `1 : N` (One-to-Many)
- **Foreign Key Reference**: `Emergency.reporterPhone` / `Emergency.reporterName` / `Emergency.reporterRole` $\rightarrow$ `User`
- **Operational Rule**:
  - Citizens, Government Field Officers, or Control Room Operators create and submit emergency distress reports.
  - The `User.role` dictates triage weighting, telemetry verification confidence, and whether direct dispatch authorization is granted.

---

### 1.6 `User` → `RescueMission`
- **Cardinality**: `1 : N` (One-to-Many)
- **Foreign Key Reference**: `RescueMission.teamId` / `RescueMission.leaderName` $\rightarrow$ `User.id` (or `User.agencyName`)
- **Operational Rule**:
  - Authorized responders (NDRF, SDRF, ODRAF, Fire & Emergency Services) lead, command, and transmit telemetry logs for rescue missions.
  - Responders update waypoint navigation, log extracted civilian counts, and submit ground situation audio/photo attachments.

---

## 2. Visual Entity-Relationship Diagram (ERD)

```
                              ┌──────────────────────────────────┐
                              │               User               │
                              │  (Citizens, Responders, Admins)  │
                              └────────┬─────────────────┬───────┘
                                       │                 │
              1:N (Reports Incident)   │                 │ 1:N (Commands / Operates)
                                       ▼                 ▼
 ┌──────────────────────────────────────────────┐       ┌──────────────────────────────────────────────┐
 │                  Emergency                   │ 1:1   │                RescueMission                 │
 │  • id                                        ├──────►│  • id                                        │
 │  • disasterType, peopleAffected, injuredCount│       │  • requestId (FK -> Emergency.id)            │
 │  • hasFoodShortage, hasWaterShortage         │       │  • teamId, teamName, personnelCount          │
 │  • roadAccessAvailable, location             │       │  • vehicleType, status, logs                 │
 │  • priorityScore (0-100), priorityClass      │       │  • estimatedArrivalMinutes                   │
 └──────────────┬────────────────┬──────────────┘       └──────────────────────┬───────────────────────┘
                │                │                                             │
   N:M Requires │   N:1 Evacuees │                                1:N Consumes │
     Supplies   │     Relocation │                                   Resources │
                ▼                ▼                                             ▼
 ┌──────────────────────┐ ┌──────────────────────┐              ┌──────────────────────────────────────┐
 │    InventoryItem     │ │     ShelterInfo      │              │             HospitalInfo             │
 │  • id                │ │  • id                │              │  • id                                │
 │  • name, category    │ │  • name, district    │              │  • name, district                    │
 │  • totalStock        │ │  • capacity          │              │  • totalBeds, availableBeds          │
 │  • allocatedStock    │ │  • currentOccupancy  │              │  • icuBedsTotal, icuBedsAvailable    │
 │  • remainingStock    │ │  • availableCapacity │              │  • traumaLevel, ambulancesAvailable  │
 │  • warehouseLocation │ │  • foodStockDays     │              │  • location, status                  │
 │  • criticalThreshold │ │  • waterStockDays    │              └──────────────────────────────────────┘
 └──────────────────────┘ └──────────────────────┘
```

---

## 3. Operational Workflow & State Transitions

```
[Citizen SOS / Officer Distress]
                │
                ▼
      Emergency Created
                │
                ├─────────────────────────────┐
                ▼                             ▼
   AI 100-pt Priority Scoring    Resource & Capacity Check
   (Injured, Vulnerability,      (Inventory Stocks, Hospital
    Shortages, Isolation)         ICUs, Shelter Capacities)
                │                             │
                └──────────────┬──────────────┘
                               ▼
                    Allocation Plan Created
                               │
                               ▼
                    RescueMission Dispatched
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
    Casualties Routed ➔ Hospital     Evacuees Routed ➔ Shelter
               │                               │
               └───────────────┬───────────────┘
                               ▼
                    Mission Complete & Resolved
```
