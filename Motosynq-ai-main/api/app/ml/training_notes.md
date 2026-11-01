# MOTOSYNQ AI — ML Training & Validation Protocol

## 1. Positioning & Ethical Boundary
MOTOSYNQ AI is strictly an **AI-assisted screening tool**. It does **NOT** replace a qualified mechanic, and no prediction or classification constitutes a mechanical diagnosis.

---

## 2. Data Collection Requirements
1. **Stationary Engine Operation**: Inspections must strictly occur in neutral on center-stand or side-stand at warm idle (~1,000–1,400 RPM). Never collect training data during active road riding, as wind noise and chassis heave drown out mechanical acoustics.
2. **Mounting Integrity**: Smartphones must be rigidly clamped (e.g., RAM mount, QuadLock) to the handlebar riser or frame cradle. Soft pouch mounting introduces random resonance that corrupts accelerometer features.
3. **Acoustic Integrity**: Minimum SNR must exceed 18 dB. Recordings with audible horn blasts, nearby traffic, or clipping markers must be rejected from the training corpus.
4. **Ground-Truth Labeling**: Labels must **never** be generated from unverified subjective user claims. Every positive anomaly label requires a signed physical workshop inspection card from a certified technician.

---

## 3. Data Leakage Prevention (Strict Partitioning)
1. **Vehicle-Level Holdout**: Splits (Train / Validation / Test) must be made strictly at the **vehicle level**, not the session or window level.
2. **Windowing Rule**: Overlapping windows (e.g., 1.0 s window with 0.5 s hop) from the same session must **never** cross train and test folds. Splitting adjacent audio windows causes artificial 99%+ accuracy that fails immediately on new motorcycles.

---

## 4. Evaluation Metrics & Honesty Discipline
1. **Measured, Never Assumed**: Accuracy and F1 scores must be empirically computed on the held-out test motorcycles. Fabricating accuracy percentages is strictly prohibited.
2. **Reported Metrics**:
   - Accuracy
   - Macro & Weighted F1-scores
   - False Positive Rate (FPR): Excessive false positives cause unnecessary repair costs.
   - False Negative Rate (FNR): False negatives risk engine breakdown; FNR must be explicitly highlighted in the model card.
   - Confusion Matrix with sample counts.
3. **Class Scope**: Sub-component faults (e.g., valves, wrist pin, transmission bearing) may only be enabled in production when individual per-class precision and recall meet validation thresholds in `model_card.json`. Otherwise, models are limited to binary `normal_pattern` vs `abnormal_pattern`.
