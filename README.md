# HVAC Training

A single offline-capable training app for Ian, built up from the fundamentals.

**Live:** https://zackrhodes2014-dotcom.github.io/hvac-training/

Order: Refrigeration Fundamentals → Electrical → Boilers & Chillers. Every module is open at any time, in any order.

- **Refrigeration Fundamentals:** M1 Foundations of Refrigeration and Air Conditioning, M4 Energy and Matter, M5 Gases
- **Electrical:** M13 Basic Electricity, M14 Electrical Power, M15 Basic Electronics, M16 Electric Motors, M17 Electrical Control Systems, M18 Electrical Troubleshooting, M19 Servicing Electric Motors and Controls
- **Boilers & Chillers:** M20 Boiler Room Fundamentals, M21 Chiller Fundamentals, M22 West Mechanical Field Notes (Tyson RVAF steam and condensate loop; Part A item A6 teaches the Cleaver-Brooks Level Master + Siemens SKD62UA electronic level control with an animated level-to-mA-to-valve model; Tyson Feed Mill, Hills, U.S. Smokeless Leaf and U.S. Smokeless Eagle placeholders), M23 Fisher Pneumatic Valves (667/657 actuator cutaway, positioners, I/P, fail-safe, a close-up 2500-style level controller with a flip-the-flapper-base button, and a 12-step calibration exercise), M24 The MegaTron Blowdown Controller (theory plus an animated See It Run: timed vs sample-and-hold). M20 now has a Section 8, Conductivity and Automatic Surface Blowdown (tap-the-ion, cycles slider, condensate-return comparator); saved M20 section marks shift automatically once per profile. These were Modules 6, 7 and 8; `m6.html`, `m7.html` and `m8.html` now redirect to the new pages, and saved progress moves over automatically once per profile.
- **Flip Card Study:** shuffle cards from any mix of modules (`study.html`)

Plain HTML/CSS/JS, no external dependencies. Progress is stored on the device in `localStorage` (see Profiles). `sw.js` precaches every page so the app works offline once loaded; install it from the browser menu (or Share > Add to Home Screen on iPhone).

**Profiles:** Ian, Landon and Admin (content review) each keep fully separate progress. Active profile: `hvacTraining:activeProfile` (`ian` | `landon` | `admin`, default `ian`); state: `hvacTraining:v1:profile:<id>`.
