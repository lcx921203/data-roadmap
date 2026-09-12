# Interview Follow-up Detail Repair V1.0.9.2

## Root cause

V1.0.9.1 made Curated Follow-up question text searchable.

However, `FollowUpDisclosure` still used this rendering contract:

```text
questions = parse Markdown "真实关联追问"
curated registry = answer lookup only
```

The Lakehouse answer Markdown contains 6 historical follow-up questions.
The new Iceberg registry adds 12 deeper follow-ups.

Because those 12 questions were not also duplicated into the Markdown list,
they could be found by search but were invisible in the detail page.

## Repair

The detail model is now:

```text
Markdown follow-ups
+
Curated registry follow-ups
→ normalize / deduplicate
→ render one merged follow-up list
```

The registry is therefore allowed to add first-class curated follow-up items
without requiring a second manual copy in the answer Markdown.

## Search-to-detail closure

When a search result is matched by a curated follow-up:

```text
Search
→ "命中追问"
→ /interview/<canonical-id>/followup/<encoded-question>
→ detail
→ 关联追问
→ matching item automatically expands and scrolls into view
```

The canonical question continues to own Evidence / Frequency metadata.
A curated follow-up remains preparation content, not a frequency claim.

## Baseline

Deployed main inspected before this repair:

```text
24ead0bbb2cb41de091e3b81195628af413d07ea
```
