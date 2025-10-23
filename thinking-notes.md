# Build Notes – Approach & Thinking Log

> Purpose: This doc captures my raw thinking and decisions while building the Flai Take‑Home (Service Re‑Engagement Email Agent). It’s a note‑taker for me, and a window for reviewers to see how I reasoned. I’ll add a more formal README later (trade‑offs, setup, UX tour).8

---

## 1) Data Shape Decisions

### 1.1 Service type: table or enum?

- **My take:** For a bigger/real project I’d use a **table** (dynamic, can hold metadata like price, duration, locale labels).
- For this take‑home, an **enum** is OK (fast, type‑safe). I understand the trade‑off: enums are static and need migrations to add values; tables let admins add types at runtime.

### 1.2 Email status lifecycle

- **Take‑home (simulado):** `QUEUED → SENT → DELIVERED` (fake transitions).
- **Real case:**
  - Set to **SENDING** while calling the provider (ESP).
  - Move to **SENT** on 200 OK.
  - Update via webhook to **DELIVERED / BOUNCED / FAILED**.
  - Keep an `email_events` audit trail.

### 1.3 Cohort: vehículo y usuario o sólo vehículo?

- Pensé: “Necesito agrupar _usuario + vehículo_ para el cohort.”
- **Revisión:** No necesariamente. Con el **vehículo** alcanza para elegibilidad (service type/cadence + appointments).
  - ¿Qué pasa si el **owner cambia** después? ¿Importa?
  - A favor de incluir user: ver **exactamente a quién** le envié el mail.
  - Pero, lo que importa para la regla es que el **vehículo** recibió el servicio (no la persona).
- **Conclusión práctica (take‑home):** mantengo el modelo **centrado en vehículo** para la elegibilidad. Para simplificar las lecturas, **incluyo en el email** tanto `customerId` como `vehicleId` (así evito joins extra en conversaciones).
- “Pense en guardar todo en cohort por vehiculo pero es messy, aunque nos sacaria una tabla, prefiero guardar una que guarde todos los vehiculos que participaron del cohort.” → Me quedo con una **tabla de cohort (RuleTarget)** por **vehículo** materializada en cada run.

### 1.4 Un vehículo puede tener más de un usuario?

- **Supuesto para el home challenge:** **No** (un `Vehicle` pertenece a un `Customer`). En mundo real, pasaría a relación **N:M** con `CustomerVehicle` y `primaryContact`.

---

## 2) Lecturas clave que deben ser eficientes (performance)

1. **Preview de cohorte (quién es elegible hoy para una regla):**
   - Por `serviceType` + “último servicio” ≥ `cadenceMonths`
   - Sin **cita próxima**
2. **Mandar / schedule:** igual que preview pero materializando el cohort (crea `RuleRun` + `RuleTarget`) y queue emails.
3. **Console/Dashboard:**
   - Not sure what to show here yet
4. **Conversations/Bookings:**
   - Últimos **emails/replies por customer**
   - Próximas **appointments**

---

## 3) Versión de modelo elegida (para el take‑home)

- **Version 2 – Vehicle‑Céntrica** (Customer 1:N Vehicle; `ServiceHistory`, `Appointment`, `RuleTarget` pasan por `Vehicle`).
- Razones:
  - Las reglas de re‑engagement se evalúan naturalmente **por vehículo**.
  - La **Consulta 1** (elegibilidad: “no service X desde N meses y sin appointment futuro”) tiene que pasar si o si por vehicle asi que no me cambia mucho.
  - En emails guardo `customerId` + `vehicleId` para que **conversations/dashboard** puedan resolverse sin joins pesados.

All schema versions considered in [database diagram](./docs/rally.database.png).

---

email simulation
why use workers?
use workers for emails so we don't block the main thread and simulates the sending of the email realictisc
add time between updates to simulates time

i first get all campaings and then only pulling for the ones that are not completed. hago pulling ahora por la simulacion, pero usaria https://resend.com/.

--- for scheduler, i'm just goint to build it here native so I don't use a external service, that implies checking once by minute if there are schedulers to run. 