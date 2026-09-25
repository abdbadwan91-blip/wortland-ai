# Gameplay combo & reward upgrade

Implemented after reviewing live game screens:
- Shared escalating combo reward engine.
- Combo thresholds at 3, 5 and 7 correct answers.
- Quick Pick now tracks streaks and awards combo XP.
- Quick Pick wrong answer resets combo.
- Quick Pick gets animated combo chip.
- Master Challenge now tracks streaks and awards stronger combo XP from its 8 XP base.
- Master miss resets combo.
- Master gets animated combo chip.
- Speed Round migrated from hard-coded streak bonuses to the shared reward curve.
- Shared accuracy helper and performance badge model prepared for result-screen integration.

The implementation reuses existing game scoring callbacks and does not change saved-progress schema.
