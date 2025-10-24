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

i first get all campaings and then only pulling for the ones that are not completed. hago pulling ahora por la simulacion, pero usaria https://resend.com/. update: al final tengo que traer siempre todas por si una scheduleada se corre.

--- for scheduler, i'm just goint to build it here native so I don't use a external service, that implies checking once by minute if there are schedulers to run.

TODO: remove worker, overkill !

--- emails
adding thread so I can group them by campaign. is Reply so I can show them as conversation in the UI, quick way to do it.

---

cosas q no funcionan: despues de que se inicia el proceso scheduleado no se actualiza en real time

--- mostrar template !!!

cuando crei que estaba terminando me di cuenta que era recurring, no schdule, so I need to change the architecture to handle that.

--- database: RecurringSchedule table

**Decisión:** Nueva tabla `RecurringSchedule` separada de `ScheduledCampaign`.

¿Por qué no reusar ScheduledCampaign?

- ScheduledCampaign es para **one-off** campaigns (schedule once, run once).
- RecurringSchedule es un **template/config** que genera múltiples ScheduledCampaigns.
- Separar las concerns: RecurringSchedule tiene `frequency`, `timeOfDay`, `dayOfWeek/Month`, etc. ScheduledCampaign solo tiene `scheduledFor`.

**La relación:**

- `RecurringSchedule` 1:N `ScheduledCampaign` (un recurring crea muchos scheduled).
- Cada vez que el scheduler corre, crea un nuevo `ScheduledCampaign` con `recurringScheduleId` reference.
- Así puedo ver **historial completo** de ejecuciones (cada ScheduledCampaign es un run).

**Alternative considerada:** Un campo `isRecurring` boolean en ScheduledCampaign con JSON config. Descarté porque es messy, hard to query, y mezcla dos conceptos diferentes.

--- polling para recurring schedules

usando el mismo pattern que CampaignsDashboard: polling cada 2 segundos con server actions. super simple, no optimizations (no websockets, no server-sent events, no nada fancy).

- ¿Por qué cada 2 segundos? Para que se vea en real-time cuando cambia nextScheduledFor, lastExecutedAt, etc.
- **Trade-off:** hace más requests pero mantiene todo simple. Para un take-home está perfecto.
- **Real world:** usaría optimistic updates + revalidateTag o websockets si fuera mucho tráfico. Pero para un dashboard de campaigns admin, polling está bien (no hay cientos de usuarios mirando al mismo tiempo).
- Mantiene consistencia con el resto de la app (CampaignsDashboard ya hace lo mismo).
