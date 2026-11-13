# HVAC Training

A single offline-capable training app for Ian, built up from the fundamentals.

**Live:** https://zackrhodes2014-dotcom.github.io/hvac-training/

- **Refrigeration Fundamentals:** M1 Foundations of Refrigeration and Air Conditioning, M4 Energy and Matter, M5 Gases
- **Boilers & Chillers:** M6 Boiler Room Fundamentals, M7 Chiller Fundamentals
- **Electrical:** M13 Basic Electricity, M14 Electrical Power, M15 Basic Electronics, M16 Electric Motors, M17 Electrical Control Systems, M18 Electrical Troubleshooting, M19 Servicing Electric Motors and Controls
- **Flip Card Study:** shuffle cards from any mix of modules (`study.html`)

Plain HTML/CSS/JS, no external dependencies. Progress is stored on the device in `localStorage` (see Profiles). `sw.js` precaches every page so the app works offline once loaded; install it from the browser menu (or Share > Add to Home Screen on iPhone).

**Profiles:** Ian, Landon and Admin (content review) each keep fully separate progress. Active profile: `hvacTraining:activeProfile` (`ian` | `landon` | `admin`, default `ian`); state: `hvacTraining:v1:profile:<id>`.
