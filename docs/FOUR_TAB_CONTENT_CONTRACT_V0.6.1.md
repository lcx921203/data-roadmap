# Four-Tab Content Contract V0.6.1

## 1. Purpose

This contract freezes the product responsibilities of the four top-level tabs before the Iceberg vertical slice continues.

The four tabs share one knowledge graph, but they are not four views of the same content.

- Learn answers: **What should I understand, and what reusable production rules should I know?**
- Interview answers: **What has actually been asked, how should I explain it, and what evidence supports the question?**
- Scale answers: **What changes when scale, concurrency, latency, reliability, cost, or operational constraints become explicit?**
- Projects answers: **What did the real project actually do, where is the factual boundary, and which knowledge nodes help explain it?**

The product rule is:

> Same graph, different responsibility.

---

## 2. Learn Contract

### Responsibility

Learn is the reusable knowledge system.

It should teach:

1. Concept and mental model
2. Internal mechanism
3. Production Pattern（生产模式）
4. Failure / Performance behavior
5. Code or configuration when useful
6. Reusable production engineering principles
7. Links to related Project / Scale / Interview assets

### Must not become

- a project diary;
- a hypothetical large-scale scenario;
- a frequency claim about interviews;
- a copy of Interview answers.

### Stage 11 boundary

Stage 11 is renamed to:

- 中文：`生产工程基础`
- English: `Production Engineering`

It teaches reusable models such as:

- SLO / SLA
- capacity planning
- concurrency control
- rate limiting / backpressure
- tenant isolation
- observability
- recovery
- cost model

Concrete scenarios such as `10B backfill` or `100 concurrent writers` belong to Scale.

---

## 3. Interview Contract

### Responsibility

Interview is the evidence-backed question system.

Every published question should distinguish:

- canonical question;
- direct evidence;
- verified frequency;
- curated answer;
- related Knowledge;
- optional local scale follow-up.

### Evidence boundary

No question may gain an Iceberg-specific frequency label merely because Iceberg knowledge exists.

Frequency is calibrated only from interview evidence.

### Reading mode boundary

Interview detail may provide a deeper reading mode, but this is still the same curated answer asset.

The UI label should eventually prefer `深入理解` over `Learn` to avoid confusion with the top-level Learn tab.

This naming change is deferred until UI review unless it blocks content work.

---

## 4. Scale Contract

### Responsibility

Scale is a production-scenario training layer.

Each scenario should eventually contain:

1. Scenario
2. Scale Parameters
3. Constraints
4. Bottleneck / Failure
5. Design
6. Trade-offs
7. Observability
8. Cost
9. Recovery
10. Related Knowledge / Project / Interview

### Truth boundary

Scale scenarios are hypothetical unless explicitly proven otherwise.

A Scale scenario linked to a Project means:

> this scenario is relevant to the project domain.

It does **not** mean:

> this exact scenario happened in the project.

The field `hypothetical: true` remains a first-class truth boundary.

---

## 5. Projects Contract

### Responsibility

Projects is the real-project fact layer.

Project Case structure:

1. Actual
2. Boundary
3. Knowledge Mapping
4. Interview Mapping
5. Scale Extension

### Actual

Only facts explicitly verified as real project experience may appear in `Actual`.

### Boundary

Boundary records what cannot currently be claimed as actual implementation.

### Knowledge Mapping

Knowledge relevance explains the project; it does not prove implementation.

### Scale Extension

Scale Extension is hypothetical production training derived from project context.

It must never be rendered as real project experience.

---

## 6. Stable ID Contract

Canonical prefixes:

- Knowledge: `kb-*`
- Interview Question: `iq-*`
- Evidence: `ev-*`
- Scale Scenario: `sc-*`
- Project Case: `pj-*` for future project case assets

Canonical project slugs:

- `north-america`
- `ahu-medical-exam`
- `caishi-live`

These slugs are the only allowed project relationship values across Knowledge, Scale, Project Mapping, and future Project Case files.

UI aliases such as `ahu` or `caishi` must not be used as relationship IDs.

---

## 7. Source-of-Truth Contract

### Canonical content owns outgoing relationships

Examples:

- Knowledge front matter may own `project_relevance`, `interview_relevance`, `scale_scenarios`.
- Scale Scenario owns `knowledge`, `projects`, `interviews`.
- Project Case will own its verified fact content and explicit mappings.
- Interview evidence owns evidence-to-question mappings.

### UI registry is an index, not a second CMS

`src/content/registry.ts` may load and index content, but must not redefine project IDs, display names, or truth status already defined under `content/`.

Project metadata source of truth:

`content/project-mapping.yaml`

### Reverse links

Reverse links should be derived at runtime or build time from canonical outgoing relationships where possible.

Avoid maintaining two manually edited copies of the same relationship.

---

## 8. Iceberg Vertical Slice Definition of Done

Iceberg is considered a complete product vertical only when:

- Learn L5 spine is frozen;
- North America Project Case has verified Actual / Boundary;
- the three Iceberg Scale seeds have complete detail pages;
- evidence-backed Interview mappings are connected;
- cross-tab navigation is exposed;
- no mapping implies unverified project implementation;
- no hypothetical Scale scenario is presented as project fact.

UI visual refinement comes after this content loop is complete.

---

## 9. Current V0.6.1 Repository Changes

This contract introduces only foundation changes:

1. Rename Learn Stage 11 from `Production Architecture & Scale Lab` to `Production Engineering`.
2. Standardize project IDs to:
   - `north-america`
   - `ahu-medical-exam`
   - `caishi-live`
3. Make `content/project-mapping.yaml` the project metadata source of truth.
4. Remove duplicate project display metadata from `ProjectsPage`.
5. Keep all three projects in `fact-check-required` state.
6. Do not create Project Detail or Scale Detail prematurely in this change.

Next milestone:

`V0.6.2 Project Case Fact Boundary`
