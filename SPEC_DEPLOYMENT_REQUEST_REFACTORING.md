# SPEC - Refactoring DeploymentRequest

## 📋 Contexte et Objectif

### Problématique
La table `DeploymentRequest` utilise actuellement une colonne `status` qui représente l'état du Hub concernant la demande de déploiement. Nous devons ajouter deux nouveaux concepts :
- **État cible** (`target_state`) : L'état dans lequel le déploiement devrait être
- **État réel** (`actual_state`) : L'état actuel du déploiement tel que connu par le système

### Objectifs
1. Renommer `status` en `hub_status` pour clarifier qu'il s'agit du statut Hub
2. Ajouter `target_state` (NOT NULL) : état attendu du déploiement
3. Ajouter `actual_state` (NULLABLE) : état réel du déploiement
4. Ajouter `ordering` (INT) : permettre un tri personnalisé des lignes
5. Modifier l'API GraphQL pour exposer ces nouveaux champs
6. Adapter la logique de filtrage par défaut : afficher les lignes où `actual_state != target_state`

---

## 🗄️ Schéma de Base de Données

### Changements de colonnes

| Action | Colonne | Type | Nullable | Description |
|--------|---------|------|----------|-------------|
| RENAME | `status` → `hub_status` | string | NOT NULL | Statut du Hub pour cette demande |
| ADD | `target_state` | string | NOT NULL | État cible attendu (ACTIVE/INACTIVE) |
| ADD | `actual_state` | string | NULLABLE | État réel du déploiement |
| ADD | `ordering` | integer | NOT NULL | Ordre de tri personnalisé |

### Règles métier pour `target_state`

La valeur de `target_state` est calculée automatiquement en fonction de `hub_status` :

```typescript
target_state = (hub_status IN ['PENDING', 'ACTIVE']) ? 'ACTIVE' : 'INACTIVE'
```

**Exemples :**
- `hub_status = 'PENDING'` → `target_state = 'ACTIVE'`
- `hub_status = 'ACTIVE'` → `target_state = 'ACTIVE'`
- `hub_status = 'QUEUED'` → `target_state = 'INACTIVE'`
- `hub_status = 'FAILED'` → `target_state = 'INACTIVE'`
- `hub_status = 'CANCELLED'` → `target_state = 'INACTIVE'`
- `hub_status = 'EXPIRED'` → `target_state = 'INACTIVE'`

### Migration des données existantes

```sql
-- Renommer la colonne
ALTER TABLE "DeploymentRequest" RENAME COLUMN "status" TO "hub_status";

-- Ajouter les nouvelles colonnes
ALTER TABLE "DeploymentRequest" ADD COLUMN "target_state" VARCHAR(255);
ALTER TABLE "DeploymentRequest" ADD COLUMN "actual_state" VARCHAR(255);
ALTER TABLE "DeploymentRequest" ADD COLUMN "ordering" INTEGER;

-- Remplir target_state selon la règle métier
UPDATE "DeploymentRequest" 
SET "target_state" = CASE 
  WHEN "hub_status" IN ('PENDING', 'ACTIVE') THEN 'ACTIVE'
  ELSE 'INACTIVE'
END;

-- Définir ordering avec la date de requête (timestamp)
UPDATE "DeploymentRequest" 
SET "ordering" = EXTRACT(EPOCH FROM "request_date")::INTEGER;

-- Rendre les colonnes NOT NULL
ALTER TABLE "DeploymentRequest" ALTER COLUMN "target_state" SET NOT NULL;
ALTER TABLE "DeploymentRequest" ALTER COLUMN "ordering" SET NOT NULL;
ALTER TABLE "DeploymentRequest" ALTER COLUMN "ordering" SET DEFAULT EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::INTEGER;
```

---

## 🎨 Schéma GraphQL

### Mapping Base de Données ↔ GraphQL

| Base de données | GraphQL | Type | Nullable |
|-----------------|---------|------|----------|
| `hub_status` | `hub_status` | DeploymentRequestStatus | NOT NULL |
| `target_state` | `expected_status` | String | NOT NULL |
| `actual_state` | `actual_status` | String | NULLABLE |
| `ordering` | `ordering` | Int | NOT NULL |

### Types à modifier

#### Type `DeploymentRequest`
```graphql
type DeploymentRequest implements Node {
  id: ID!
  platform_identifier: PlatformIdentifier!
  region: PlatformRegion!
  type: DeploymentType!
  job_title: String
  activity_sector: String
  use_case: String
  start_date: Date
  end_date: Date
  hub_status: DeploymentRequestStatus!      # ← RENOMMÉ (était status)
  expected_status: String!                   # ← NOUVEAU
  actual_status: String                      # ← NOUVEAU
  ordering: Int!                             # ← NOUVEAU
}
```

#### Type `PlatformDeploymentRequest`
```graphql
type PlatformDeploymentRequest {
  id: ID!
  platform_identifier: PlatformIdentifier!
  region: PlatformRegion!
  type: DeploymentType!
  platform_token: String!
  hub_status: DeploymentRequestStatus!      # ← RENOMMÉ (était status)
  expected_status: String!                   # ← NOUVEAU
  actual_status: String                      # ← NOUVEAU
  ordering: Int!                             # ← NOUVEAU
  start_date: Date
  end_date: Date
  job_title: String
  activity_sector: String
  use_case: String
  organization_name: String!
  organization_domains: [String!]
  requester_email: String!
  requester_first_name: String
  requester_last_name: String
  product_service_instance_id: String
  failure_reason: String
}
```

#### Input `CreateDeploymentRequestInput`
```graphql
input CreateDeploymentRequestInput {
  platform_identifier: PlatformIdentifier!
  region: PlatformRegion!
  type: DeploymentType!
  job_title: String
  activity_sector: String
  use_case: String
  hub_status: DeploymentRequestStatus       # ← RENOMMÉ (était status)
}
```

#### Input `UpdateDeploymentRequestInput`
```graphql
input UpdateDeploymentRequestInput {
  id: ID!
  hub_status: DeploymentRequestStatus       # ← RENOMMÉ (était status)
  actual_status: String                      # ← NOUVEAU
  ordering: Int                              # ← NOUVEAU
  start_date: Date
  end_date: Date
  product_service_instance_id: String
  failure_reason: String
}
```

**Note :** `expected_status` n'est PAS dans les inputs car il est calculé automatiquement.

#### Enum `DeploymentRequestFilterKey`
```graphql
enum DeploymentRequestFilterKey {
  region
  type
  hub_status      # ← RENOMMÉ (était status)
  platform_identifier
}
```

---

## 🔧 Backend - Plan d'implémentation

### 1. Migration (Knex)

**Fichier à créer :** `apps/portal-api/src/migrations/[TIMESTAMP]_alter_deploymentRequest_columns.js`

```javascript
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  // Renommer status en hub_status
  await knex.schema.alterTable('DeploymentRequest', function (table) {
    table.renameColumn('status', 'hub_status');
  });

  // Ajouter les nouvelles colonnes (temporairement nullable)
  await knex.schema.alterTable('DeploymentRequest', function (table) {
    table.string('target_state');
    table.string('actual_state');
    table.integer('ordering');
  });

  // Remplir target_state selon la règle métier
  await knex.raw(`
    UPDATE "DeploymentRequest" 
    SET "target_state" = CASE 
      WHEN "hub_status" IN ('PENDING', 'ACTIVE') THEN 'ACTIVE'
      ELSE 'INACTIVE'
    END
  `);

  // Remplir ordering avec le timestamp de request_date
  await knex.raw(`
    UPDATE "DeploymentRequest" 
    SET "ordering" = EXTRACT(EPOCH FROM "request_date")::INTEGER
  `);

  // Rendre les colonnes NOT NULL
  await knex.schema.alterTable('DeploymentRequest', function (table) {
    table.string('target_state').notNullable().alter();
    table.integer('ordering').notNullable().defaultTo(knex.raw('EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::INTEGER')).alter();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  // Supprimer les colonnes ajoutées
  await knex.schema.alterTable('DeploymentRequest', function (table) {
    table.dropColumn('target_state');
    table.dropColumn('actual_state');
    table.dropColumn('ordering');
  });

  // Renommer hub_status en status
  await knex.schema.alterTable('DeploymentRequest', function (table) {
    table.renameColumn('hub_status', 'status');
  });
}
```

### 2. Régénération Kanel

Après la migration, lancer Kanel :
```bash
cd apps/portal-api
npm run kanel
```

Le fichier `apps/portal-api/src/model/kanel/public/DeploymentRequest.ts` sera automatiquement mis à jour avec :
- `hub_status: string`
- `target_state: string`
- `actual_state: string | null`
- `ordering: number`

### 3. GraphQL Schema

**Fichier :** `apps/portal-api/src/modules/services/deployments/deployments.graphql`

**Modifications à effectuer :**
1. Dans `DeploymentRequest` : remplacer `status` par `hub_status`, ajouter `expected_status`, `actual_status`, `ordering`
2. Dans `PlatformDeploymentRequest` : idem
3. Dans `CreateDeploymentRequestInput` : remplacer `status` par `hub_status`
4. Dans `UpdateDeploymentRequestInput` : remplacer `status` par `hub_status`, ajouter `actual_status`, `ordering`
5. Dans `DeploymentRequestFilterKey` : remplacer `status` par `hub_status`

### 4. Helper - Calcul de target_state

**Fichier :** `apps/portal-api/src/modules/services/deployments/deployments.helper.ts`

**Ajouter la fonction :**
```typescript
export const computeTargetState = (hubStatus: DeploymentRequestStatus): string => {
  return [DeploymentRequestStatus.Pending, DeploymentRequestStatus.Active].includes(hubStatus)
    ? 'ACTIVE'
    : 'INACTIVE';
};
```

### 5. Domain Layer

**Fichier :** `apps/portal-api/src/modules/services/deployments/deployments.domain.ts`

#### Modifications dans `loadDeploymentRequests`
```typescript
export const DeploymentRequestDomain = {
  loadDeploymentRequests: async (opts: QueryDeploymentRequestsArgs) => {
    const { first, after, filters } = opts;
    
    return paginate<DeploymentRequest, DeploymentRequestConnection>(
      'DeploymentRequest',
      {
        first,
        after,
        orderBy: 'ordering',        // ← CHANGÉ (était 'request_date')
        orderMode: 'asc',
        filters,
        // Filtre par défaut : afficher où actual_state != target_state
        additionalWhere: (query) => {
          query.where(function() {
            this.whereNull('actual_state')
                .orWhereRaw('"actual_state" != "target_state"');
          });
        },
      },
      undefined,
      getDeploymentRequestWithUserDataQuery()
    );
  },
  
  // Autres méthodes : remplacer tous les usages de .status par .hub_status
};
```

#### Modifications dans les mappings
Tous les retours qui exposent les données doivent mapper :
- `hub_status` reste `hub_status`
- `target_state` → `expected_status` (pour GraphQL)
- `actual_state` → `actual_status` (pour GraphQL)

```typescript
loadDeploymentRequestBy: async (conditions: DeploymentRequestMutator) => {
  const result = await dbUnsecure<DeploymentRequest>('DeploymentRequest')
    .where(conditions)
    .select('*')
    .first();

  if (!result) {
    return null;
  }

  return {
    ...result,
    platform_identifier: result.platform_identifier as PlatformIdentifier,
    region: result.region as PlatformRegion,
    type: result.type as DeploymentType,
    hub_status: result.hub_status as DeploymentRequestStatus,  // ← Adapter
  };
},
```

### 6. App Layer - Deployments

**Fichier :** `apps/portal-api/src/modules/services/deployments/deployments.app.ts`

#### Dans `createDeploymentRequest`
```typescript
import { computeTargetState } from './deployments.helper';

export const DeploymentsApp = {
  createDeploymentRequest: async (
    input: CreateDeploymentRequestInput
  ): Promise<DeploymentRequest> => {
    const { user } = requestContext.require();
    
    // ... validations existantes ...
    
    const hubStatus = input.hub_status ?? DeploymentRequestStatus.Pending;  // ← CHANGÉ
    const targetState = computeTargetState(hubStatus);                      // ← NOUVEAU
    const ordering = Date.now();                                             // ← NOUVEAU

    const createdDeploymentRequest = await databaseContext.withTransaction(
      async () => {
        const serviceInstanceId = await registrationDomain.registerNewPlatform({
          serviceDefinitionId: serviceDefinition.id,
          organizationId: user.selected_organization_id,
          platformIdentifier: input.platform_identifier,
          serviceInstanceCreationStatus:
            hubStatus === DeploymentRequestStatus.Queued           // ← CHANGÉ
              ? ServiceInstanceCreationStatus.Disabled
              : ServiceInstanceCreationStatus.Pending,
        });

        return await DeploymentRequestDomain.insertDeploymentRequest({
          id: uuidv4() as DeploymentRequestId,
          user_requester_id: user.id,
          organization_requester_id: user.selected_organization_id,
          service_instance_id: serviceInstanceId,
          hub_status: hubStatus,                                   // ← CHANGÉ
          target_state: targetState,                               // ← NOUVEAU
          actual_state: null,                                      // ← NOUVEAU
          ordering: ordering,                                      // ← NOUVEAU
          type: input.type,
          platform_identifier: input.platform_identifier,
          region: input.region,
          job_title: input.job_title,
          use_case: input.use_case,
          activity_sector: input.activity_sector,
          platform_token: uuidv4(),
        });
      }
    );

    // ... reste du code (télémétrie, email) ...
    // Remplacer tous les .status par .hub_status

    return {
      id: createdDeploymentRequest.id,
      platform_identifier: createdDeploymentRequest.platform_identifier as PlatformIdentifier,
      region: createdDeploymentRequest.region as PlatformRegion,
      type: createdDeploymentRequest.type as DeploymentType,
      job_title: createdDeploymentRequest.job_title,
      activity_sector: createdDeploymentRequest.activity_sector,
      use_case: createdDeploymentRequest.use_case,
      start_date: createdDeploymentRequest.start_date,
      end_date: createdDeploymentRequest.end_date,
      hub_status: createdDeploymentRequest.hub_status as DeploymentRequestStatus,  // ← CHANGÉ
      expected_status: createdDeploymentRequest.target_state,                      // ← NOUVEAU
      actual_status: createdDeploymentRequest.actual_state,                        // ← NOUVEAU
      ordering: createdDeploymentRequest.ordering,                                 // ← NOUVEAU
      __typename: 'DeploymentRequest',
    };
  },
};
```

#### Dans `updateDeploymentRequest`
```typescript
updateDeploymentRequest: async (
  input: UpdateDeploymentRequestInput
): Promise<PlatformDeploymentRequest> => {
  // ... validations existantes ...

  const updateData: DeploymentRequestMutator = {
    hub_status: input.hub_status,          // ← CHANGÉ
    start_date: input.start_date,
    end_date: input.end_date,
    product_service_instance_id: input.product_service_instance_id,
    failure_reason: input.failure_reason,
    actual_status: input.actual_status,    // ← NOUVEAU
    ordering: input.ordering,              // ← NOUVEAU
  };

  // Recalculer target_state si hub_status change
  if (input.hub_status) {
    updateData.target_state = computeTargetState(input.hub_status);  // ← NOUVEAU
  }

  await DeploymentRequestDomain.updateDeploymentRequestById(
    deploymentRequestId,
    updateData
  );

  // ... reste du code ...
},
```

#### Dans `loadDeploymentRequests`
```typescript
loadDeploymentRequests: async (
  args: QueryDeploymentRequestsArgs
): Promise<DeploymentRequestConnection> => {
  args.filters = args.filters || [];
  
  // SUPPRIMER ce bloc (le filtre par défaut est maintenant dans le domain)
  // const hasStatusFilter = args.filters?.some(
  //   (filter) => filter?.key === DeploymentRequestFilterKey.Status
  // );
  // if (!hasStatusFilter) {
  //   args.filters.push({
  //     key: DeploymentRequestFilterKey.Status,
  //     value: [DeploymentRequestStatus.Pending],
  //   });
  // }
  
  return DeploymentRequestDomain.loadDeploymentRequests(args);
},
```

#### Remplacer tous les autres usages de `status`
- Dans les conditions : `.status` → `.hub_status`
- Dans les telemetry events
- Dans les comparaisons avec `DeploymentRequestStatus`

### 7. App Layer - Registration

**Fichier :** `apps/portal-api/src/modules/services/registration/registration.app.ts`

**Fonction `assertValidDeploymentRequest` (ligne 522-525) :**
```typescript
const assertValidDeploymentRequest = (
  deploymentRequest: DeploymentRequest,
  platformId: string
) => {
  if (!deploymentRequest) {
    throw new Error(NotFoundErrorCode.DeploymentRequestNotFound);
  }
  if (
    deploymentRequest.product_service_instance_id &&
    deploymentRequest.product_service_instance_id !== platformId
  ) {
    throw new Error(BadRequestErrorCode.InvalidPlatformId);
  }
  if (
    ![
      DeploymentRequestStatus.Provisioning,
      DeploymentRequestStatus.Active,
    ].includes(deploymentRequest.hub_status as DeploymentRequestStatus)  // ← CHANGÉ
  ) {
    throw new Error(ForbiddenErrorCode.NotAllowedByDeploymentStatus);
  }
};
```

### 8. Tests

**Fichier :** `apps/portal-api/src/modules/services/deployments/deployments.app.test.ts`

**Modifications dans les fixtures :**
```typescript
const defaultDeploymentRequestValues = {
  activity_sector: 'cybersecurity',
  id: uuidv4() as DeploymentRequestId,
  job_title: 'myJob',
  organization_requester_id: PLATFORM_ORGANIZATION_UUID,
  platform_identifier: PlatformIdentifier.Opencti,
  platform_token: uuidv4(),
  region: PlatformRegion.Us,
  request_date: new Date(Date.UTC(2025, 1, 3, 13, 12, 15)),
  hub_status: DeploymentRequestStatus.Pending,           // ← CHANGÉ
  target_state: 'ACTIVE',                                // ← NOUVEAU
  actual_state: null,                                    // ← NOUVEAU
  ordering: Date.now(),                                  // ← NOUVEAU
  type: DeploymentType.Trial,
  user_requester_id: PLATFORM_USER_UUID,
  service_instance_id: serviceInstanceId,
};
```

**Adapter toutes les assertions :**
```typescript
expect(dbDeploymentRequest).toMatchObject({
  // ...
  hub_status: DeploymentRequestStatus.Pending,      // ← CHANGÉ
  target_state: 'ACTIVE',                           // ← NOUVEAU
  // ...
});
```

### 9. Types générés

Après toutes les modifications GraphQL :
```bash
cd apps/portal-api
npm run codegen
```

---

## 🎨 Frontend - Plan d'implémentation

### 1. Fragments GraphQL - trial-instances

**Fichier :** `apps/portal-front/src/components/service/trial-instances/trial-instances.graphql.ts`

```typescript
export const CreateDeploymentRequestMutation = graphql`
  mutation trialInstancesCreateDeploymentRequestMutation(
    $input: CreateDeploymentRequestInput!
  ) {
    createDeploymentRequest(input: $input) {
      id
      region
      type
      platform_identifier
      hub_status          # ← CHANGÉ
      expected_status     # ← NOUVEAU
      actual_status       # ← NOUVEAU
      ordering            # ← NOUVEAU
    }
  }
`;
```

### 2. Fragments GraphQL - registration

**Fichier :** `apps/portal-front/src/components/registration/register/register.graphql.ts`

```typescript
export const registeredPlatformByServiceInstanceIdFragment = graphql`
  fragment registeredPlatformByServiceInstanceId_fragment on RegisteredPlatform {
    id
    title
    contract
    url
    subscription {
      start_date
      end_date
    }
    deployment_request {
      hub_status          # ← CHANGÉ
      expected_status     # ← NOUVEAU
      actual_status       # ← NOUVEAU
      ordering            # ← NOUVEAU
    }
  }
`;

export const registerRegisteredPlatformFragment = graphql`
  fragment registerRegisteredPlatformFragment on RegisteredPlatform {
    id
    platform_id
    title
    url
    contract
    identifier
    illustration_document_id
    deployment_request {
      type
      activity_sector
      job_title
      hub_status          # ← CHANGÉ
      expected_status     # ← NOUVEAU
      actual_status       # ← NOUVEAU
      ordering            # ← NOUVEAU
    }
    subscription {
      status
      end_date
      start_date
      service_instance {
        id
        creation_status
        name
      }
    }
  }
`;
```

### 3. Composants React

#### create-free-trial.ts
**Fichier :** `apps/portal-front/app/redirect/[identifier]/create-free-trial.ts`

**Ligne 52-56 :**
```typescript
const isTrialStarted = [
  DeploymentRequestStatusEnum.QUEUED,
  DeploymentRequestStatusEnum.PENDING,
].includes(
  freeTrials[0]?.deployment_request?.hub_status as DeploymentRequestStatusEnum  // ← CHANGÉ
);
```

#### owned-services.tsx
**Fichier :** `apps/portal-front/src/components/service/home/owned-services.tsx`

**Ligne 56-59 :**
```typescript
const isTrialInstanceQueued = trialInstances.some(
  (service) =>
    service.deployment_request?.hub_status === DeploymentRequestStatusEnum.QUEUED  // ← CHANGÉ
);
```

#### try-opencti-callout.tsx
**Fichier :** `apps/portal-front/src/components/service/trial-instances/try-opencti-callout.tsx`

**Ligne 111-115 :**
```typescript
if (
  freeTrial?.deployment_request?.hub_status ===  // ← CHANGÉ
  DeploymentRequestStatusEnum.QUEUED
) {
  return 'queued';
}
```

#### platform.tsx
**Fichier :** `apps/portal-front/src/utils/platform.tsx`

**Ligne 32-34 :**
```typescript
{platform.deployment_request?.hub_status ===  // ← CHANGÉ
  DeploymentRequestStatusEnum.ACTIVE && (
  <Button>
    <Link
      target="_blank"
      href={platform.url}>
      {t('Service.RegisteredPlatforms.GoToMyPlatform')}
    </Link>
  </Button>
)}
```

#### try-opencti-form.tsx
**Fichier :** `apps/portal-front/src/components/service/trial-instances/try-opencti-form.tsx`

**Ligne 40-43 - Schema :**
```typescript
export const tryOpenCTIFormSchema = z.object({
  region: z.enum(REGIONS_VALUES),
  job_title: z.enum(JOB_TITLES),
  activity_sector: z.enum(ACTIVITIES_SECTOR),
  use_case: z.enum(USE_CASES),
  acceptTerms: z.boolean().refine((value) => value === true, {
    error: 'You must accept the MSSA',
  }),
  hub_status: z                                                      // ← CHANGÉ
    .enum([
      DeploymentRequestStatusEnum.QUEUED,
      DeploymentRequestStatusEnum.PENDING,
    ])
    .default(DeploymentRequestStatusEnum.PENDING),
});
```

**Ligne 100 - setPendingValues :**
```typescript
setPendingValues({
  ...values,
  hub_status: DeploymentRequestStatusEnum.QUEUED,  // ← CHANGÉ
});
```

**Ligne 171 - fieldConfig :**
```typescript
hub_status: {                                      // ← CHANGÉ
  fieldType: () => <FormItem hidden />,
},
```

### 4. Génération des types

```bash
cd apps/portal-front
npm run relay
```

---

## ✅ Plan d'implémentation - Ordre des étapes

### Phase 1 : Backend - Base de données et types
1. ✅ Créer la migration Knex
2. ✅ Exécuter la migration : `npm run migrate:latest`
3. ✅ Régénérer Kanel : `npm run kanel`
4. ✅ Vérifier que les types TypeScript sont corrects

### Phase 2 : Backend - GraphQL
5. ✅ Modifier le schéma GraphQL (`deployments.graphql`)
6. ✅ Régénérer les types GraphQL : `npm run codegen`

### Phase 3 : Backend - Logique métier
7. ✅ Créer la fonction `computeTargetState` dans `deployments.helper.ts`
8. ✅ Modifier `deployments.domain.ts` (orderBy, filtres, mappings)
9. ✅ Modifier `deployments.app.ts` (create, update, load)
10. ✅ Modifier `registration.app.ts` (assertValidDeploymentRequest)

### Phase 4 : Backend - Tests
11. ✅ Adapter les fixtures de tests
12. ✅ Exécuter les tests : `npm test`
13. ✅ Corriger les erreurs éventuelles

### Phase 5 : Backend - Vérification
14. ✅ Vérifier les diagnostics : `npm run diagnostics`
15. ✅ Lancer le serveur : `npm run dev`
16. ✅ Tester les mutations/queries GraphQL

### Phase 6 : Frontend - GraphQL
17. ✅ Modifier les fragments GraphQL (`trial-instances.graphql.ts`, `register.graphql.ts`)
18. ✅ Régénérer les types Relay : `npm run relay`

### Phase 7 : Frontend - Composants
19. ✅ Modifier `create-free-trial.ts`
20. ✅ Modifier `owned-services.tsx`
21. ✅ Modifier `try-opencti-callout.tsx`
22. ✅ Modifier `platform.tsx`
23. ✅ Modifier `try-opencti-form.tsx`

### Phase 8 : Frontend - Vérification
24. ✅ Vérifier les diagnostics TypeScript
25. ✅ Lancer l'application : `npm run dev`
26. ✅ Tester l'interface utilisateur

---

## ⚠️ Points d'attention

### Breaking Changes
- **GraphQL API** : Le champ `status` devient `hub_status` (breaking change)
- **Clients externes** : Si des systèmes externes utilisent l'API GraphQL, ils devront être mis à jour
- **Nouveaux champs obligatoires** : `expected_status` et `ordering` sont maintenant exposés

### Logique métier
- `target_state` est **calculé automatiquement**, il ne doit jamais être saisi manuellement
- `actual_state` peut rester `NULL` (signifie que l'état réel n'est pas encore connu)
- Le filtre par défaut affiche les lignes où `actual_state IS NULL OR actual_state != target_state`

### Ordre de tri
- L'ordre par défaut change de `request_date ASC` à `ordering ASC`
- Pour les données existantes, `ordering` est initialisé avec le timestamp de `request_date`
- Pour les nouvelles lignes, `ordering` est défini avec `Date.now()`

### Migration de données
- Les données existantes doivent être migrées correctement
- Vérifier que tous les `target_state` sont remplis selon la règle métier
- Vérifier que tous les `ordering` ont une valeur

### Tests
- Mettre à jour tous les tests qui utilisent `status`
- Ajouter des tests pour la logique `computeTargetState`
- Tester le filtre par défaut (actual_state != target_state)

---

## 🧪 Tests de validation

### Tests backend à effectuer
```bash
# Migration
npm run migrate:latest
npm run kanel

# Tests unitaires
npm test

# Vérification des types
npm run diagnostics

# Test GraphQL (via Playground ou Postman)
# Query
query {
  deploymentRequests(first: 10) {
    edges {
      node {
        id
        hub_status
        expected_status
        actual_status
        ordering
      }
    }
  }
}

# Mutation
mutation {
  createDeploymentRequest(input: {
    platform_identifier: OPENCTI
    region: europe
    type: trial
    hub_status: PENDING
  }) {
    id
    hub_status
    expected_status
    actual_status
    ordering
  }
}
```

### Tests frontend à effectuer
```bash
# Génération des types
npm run relay

# Vérification TypeScript
npm run