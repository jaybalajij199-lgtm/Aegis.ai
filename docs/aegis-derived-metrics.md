# AEGIS Derived Operational Metrics

This document outlines the standard derived metrics used by the AEGIS AI to evaluate system pressure, resource availability, and operational health without relying on static snapshots. These derived metrics must be calculated at runtime.

## 1. Inventory Metrics

These metrics evaluate warehouse and depot stress.

- **Utilization**:
  `allocatedStock / totalStock`
  *Measures the proportion of the total depot capacity that is currently committed to active missions.*
- **Estimated days remaining**:
  `remainingStock / dailyBurnRate`
  *Projects the time until exhaustion assuming the current rate of demand remains stable.*
- **Critical stock**:
  `remainingStock <= criticalThreshold`
  *Boolean flag indicating whether immediate re-supply or inter-depot rebalancing is required.*

## 2. Shelter Metrics

These metrics evaluate evacuation capacity and safety limits.

- **Occupancy rate**:
  `currentOccupancy / capacity`
  *Measures how full a relief camp is. High occupancy (> 85%) requires pre-emptive routing to alternative locations.*
- **Capacity status**:
  `availableCapacity <= 0 → FULL`
  *Strict boolean state. When available capacity drops to zero or below, the shelter status must be marked as `FULL` and no further evacuees can be routed here.*

## 3. Hospital Metrics

These metrics evaluate medical grid saturation and trauma capability.

- **Bed utilization**:
  `(totalBeds - availableBeds) / totalBeds`
  *Measures the saturation of general inpatient wards.*
- **ICU utilization**:
  `(icuBedsTotal - icuBedsAvailable) / icuBedsTotal`
  *Measures the saturation of critical care and ventilator units. Used to determine if casualties must be airlifted or diverted to secondary districts.*

## 4. Emergency Metrics

These metrics evaluate incident severity relative to ground capacities.

- **Vulnerability count**:
  `childrenCount + seniorCount`
  *The total number of demographically vulnerable individuals in a given incident. Heavily weights the AI triage score.*
- **Critical medical pressure**:
  `injuredCount` relative to `available medical capacity`
  *Evaluates the ratio of trauma casualties at an incident site compared to the total available ICU and general beds within the reachable district grid. High pressure dictates immediate triage protocols.*
