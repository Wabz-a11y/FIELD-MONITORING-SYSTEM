# SmartSeason — Mock Test Data

Use this data to manually test the platform. No seed script is provided — use the API or UI.

\---

## Test Accounts to Create

|Role|Name|Email|Password|
|-|-|-|-|
|Admin|Alice Keya|alicekeya@smartseason.app|Test1234!|
|Agent|Bob Kamau|bob@smartseason.app|Test1234!|
|Agent|Carol Smith|carolsmith@smartseason.app|Test1234!|
|Agent|James Kiondi|james@smartseason.app|Test1234!|

\---

## Fields to Create (as Admin)

|Name|Crop|Planting Date|Assign To|Size (ha)|Location|
|-|-|-|-|-|-|
|North Block A|Maize|45 days ago|Bob Kamau|3.2|GPS: -1.2830, 36.8225|
|South Ridge|Wheat|75 days ago|Bob Kamau|1.8|GPS: -1.3120, 36.8100|
|East Pasture|Soybean|20 days ago|Carol Wanjiku|2.5|Kiambu Road, near river|
|West Block|Maize|95 days ago|Carol Wanjiku|4.0|GPS: -1.2950, 36.7980|
|Valley Plot|Barley|55 days ago|Bob Kamau|1.2|Lower valley, irrigated|
|Hilltop Field|Cotton|32 days ago|James Otieno|5.0|GPS: -1.2500, 36.8450|
|Riverside Farm|Tomato|28 days ago|James Otieno|0.8|Along Athi River|
|Central Plot|Beans|60 days ago|Carol Wanjiku|1.5|Central farm block|

\---

## Updates to Log (as each Agent)

### North Block A — Bob Kamau

1. Notes: "Plants at knee height. Good canopy development. No pests." · Stage: growing · Health: 8
2. Notes: "Applied NPK fertiliser. Irrigation running well." · Health: 7
3. Notes: "Germination complete, \~85% establishment." · Stage: growing · Health: 7

### South Ridge — Bob Kamau

1. Notes: "Grain heads fully formed, golden colour. Ready for harvest in 1 week." · Stage: ready · Health: 9
2. Notes: "Minor fungal patches on 10%. Applied fungicide." · Health: 5
3. Notes: "Good tillering. Watering on track." · Stage: growing · Health: 8

### East Pasture — Carol Wanjiku

1. Notes: "Seeds sown evenly. Soil moisture good." · Stage: planted · Health: 7

### West Block — Carol Wanjiku

1. Notes: "Harvest complete. Yield: 4.2 t/ha, above target." · Stage: harvested · Health: 10
2. Notes: "Grain drying down nicely. Arrange harvesting." · Stage: ready · Health: 9

### Valley Plot — Bob Kamau (⚠️ SHOULD TRIGGER AT RISK)

1. Notes: "Aphid infestation in SE corner. Applied insecticide." · Stage: growing · Health: 7
2. Notes: "Growth below average. Soil pH test ordered." · Health: 5

### Hilltop Field — James Otieno (⚠️ SHOULD TRIGGER AT RISK — no update >14 days)

1. Notes: "Seeds planted. Awaiting first irrigation." · Stage: planted · Health: 6
*(Log this update 15+ days ago — field will show as At Risk due to no recent update)*

### Riverside Farm — James Otieno

1. Notes: "Seedlings establishing well. Drip irrigation on schedule." · Stage: growing · Health: 8
2. Notes: "Pruned lower leaves for airflow." · Health: 7

### Central Plot — Carol Wanjiku

1. Notes: "Pods fully developed, starting to dry. Harvest Monday." · Stage: ready · Health: 9

\---

## Expected Dashboard Results (Admin)

```
Total Fields:  8
Active:        5
At Risk:       2  (Valley Plot — health score ≤4, Hilltop Field — no update >14 days)
Completed:     1  (West Block — stage = harvested)

Stage Breakdown:
  planted:   1
  growing:   3
  ready:     2
  harvested: 1
  (+ 1 without recent update)

Total Agents: 3
```

\---

## Status Logic Verification

|Field|Expected Status|Trigger Reason|
|-|-|-|
|North Block A|🌱 Active|Growing, health 8, recent update|
|South Ridge|🌱 Active|Ready, health 9, updated within 7 days|
|East Pasture|🌱 Active|Recently planted, health 7|
|West Block|✅ Completed|Stage = harvested|
|Valley Plot|⚠️ At Risk|Latest health score = 4 (≤ 4 threshold)|
|Hilltop Field|⚠️ At Risk|No update in >14 days since planting|
|Riverside Farm|🌱 Active|Growing, recent updates, health ≥ 7|
|Central Plot|🌱 Active|Ready, health 9, updated within 7 days|

\---

## Email Testing Scenarios

1. **Welcome + Verify Email** — Register any new user → check inbox for both emails
2. **Password Reset** — Click "Forgot password" on login → check inbox for reset link (expires 2h)
3. **Field Alert Email** — Log an update with health score **≤ 4** → admin receives email alert (if notif\_pref includes email)
4. **Resend Verification** — Log in with unverified account → banner appears → click "Resend" → check inbox

\---

## Notification Scenarios

|Action|Who Gets Notified|Type|
|-|-|-|
|New agent registers|Agent|✅ success — "Welcome"|
|Admin assigns field to agent|Agent|ℹ️ info — "New field assigned"|
|Agent logs health ≤ 4|All admins|⚠️ warning — "Low health score"|
|Password reset completed|User|ℹ️ info — "Password changed"|


