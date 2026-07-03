# BICE Debug Session - Issue Analysis

## Problems Identified:

1. **Random code appearing**: JavaScript template literal error
   - `d.explanation.toUpperCase()` fails if explanation is null/undefined
   - Card template line: `${d.alert ? \`..${d.explanation.toUpperCase()}...\` : ''}`
   - Need: Safe optional chaining or fallback value

2. **Devices showing as quarantined when they shouldn't**:
   - DatasetDevice.state() has quarantine logic that may auto-quarantine
   - Need to verify quarantine thresholds aren't too aggressive

3. **Data not moving**:
   - DatasetDevice.tick() might reach end of CSV (this._finished = True)
   - Once finished, no more state updates
   - Sparklines don't update if device history isn't growing
   - Need: Reset mechanism or continuous cycling

4. **Features display inconsistency**:
   - DatasetDevice limits features to first 5: `dict(list(self.current.items())[:5])`
   - Then maps to readable names via FEATURE_NAMES
   - But main.py builds `recent` list using feature_names, which may mismatch

## Fixes needed:
- Sanitize explanation rendering in index.html
- Reset quarantine auto-flag logic in DatasetDevice
- Add data cycling/reset logic for streaming datasets
- Ensure feature keys align between device.current and UI rendering
