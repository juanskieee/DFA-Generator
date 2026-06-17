# DFA Generator

> A rule-based Deterministic Finite Automaton (DFA) generator and simulator designed to help students and enthusiasts understand formal language theory with clean, interactive visuals.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Canvas API](https://img.shields.io/badge/Canvas_API-00C853?style=flat)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-181717?style=flat&logo=github&logoColor=white)

---

## Overview

The DFA Problem Solver allows users to generate DFAs for a wide variety of formal language problems without needing to manually construct the transition functions or state tables. It provides an intuitive builder interface and a simulator to test input strings against the generated automaton.

---

## Features

- **Interactive Builder** — Select from a wide range of predefined problem types including pattern matching, symbol counting, position rules, and more.
- **Visual Representation** — Automatically renders the DFA using an HTML5 Canvas, showing states, transitions, and start/accept states.
- **Transition Table** — Provides a comprehensive tabular view of the generated state transitions.
- **Live Simulator** — Test custom input strings against your generated DFA to see if they are accepted or rejected, complete with a step-by-step computation path.
- **Responsive Design** — Clean, modern UI styled with Inter typography.

---

## Supported DFA Types

### Pattern Matching
Ends with, starts with, contains, not contains, and exact matches.

### Counting Rules
Even/odd counts, at least/exactly N occurrences, and equal counts of patterns.

### Positional and Special Rules
Odd/even position parity, divisibility, alternating characters, no consecutive symbols, and complex start/end constraints.

---

## How to Use

1. **Select Problem Type** — Choose the desired DFA logic from the dropdown menu.
2. **Configure Parameters** — Enter the alphabet (no spaces) and any required parameters such as patterns, counts, or symbols based on the selected problem type.
3. **Generate** — Click the "Generate DFA" button. The application will compute the DFA and display the visual diagram and transition table.
4. **Test** — Use the "Simulator" panel to enter a test string and verify the DFA's behavior.

---

## Technologies Used

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3 (Grid/Flexbox), Vanilla JavaScript |
| Visualization | HTML5 Canvas API |
| Deployment | GitHub Pages |

---

## Credits

Developed by **Juan Carlos Garcia**.
