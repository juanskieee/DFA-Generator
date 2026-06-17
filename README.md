DFA-Generator
A rule-based Deterministic Finite Automaton (DFA) generator and simulator designed to help students and enthusiasts understand formal language theory with clean, interactive visuals.

Overview
The DFA Problem Solver allows users to generate DFAs for a wide variety of formal language problems without needing to manually construct the transition functions or state tables. It provides an intuitive builder interface and a simulator to test input strings against the generated automaton.

Features
Interactive Builder: Select from a wide range of predefined problem types (Pattern matching, Symbol counting, Position rules, and more).

Visual Representation: Automatically renders the DFA using an HTML5 Canvas, showing states, transitions, and start/accept states.

Transition Table: Provides a comprehensive tabular view of the generated state transitions.

Live Simulator: Test custom input strings against your generated DFA to see if they are accepted or rejected, complete with a step-by-step computation path.

Responsive Design: Clean, modern UI styled with Inter typography.

Supported DFA Types
The generator supports numerous common formal language problems, including:

Pattern Matching: Ends with, starts with, contains, not contains, and exact matches.

Counting Rules: Even/odd counts, at least/exactly N occurrences, and equal counts of patterns.

Positional & Special Rules: Odd/even position parity, divisibility, alternating characters, no consecutive symbols, and complex start/end constraints.

How to Use
Select Problem Type: Choose the desired DFA logic from the dropdown menu.

Configure Parameters: Enter the alphabet (no spaces) and any required parameters (patterns, counts, symbols) based on the selected problem type.

Generate: Click the "Generate DFA" button. The application will compute the DFA and display the visual diagram and transition table.

Test: Use the "Simulator" panel to enter a test string and verify the DFA's behavior.

Technologies Used
Frontend: HTML5, CSS3 (with CSS Grid/Flexbox), and Vanilla JavaScript.

Visualization: HTML5 Canvas API for rendering the state diagrams.

Deployment: GitHub Pages.

Credits
This project was developed by Juan Carlos Garcia.
