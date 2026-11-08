export const articles = [
  {
    slug: "better-hardware-project-brief",
    title: "Before you design a PCB, write a better brief.",
    category: "Planning",
    minutes: 4,
    excerpt:
      "A practical way to turn a product idea into requirements an engineer can quote, challenge and test.",
    body: `A useful hardware brief is a record of decisions, unknowns and constraints. It does not need to look like a finished engineering specification. It needs to explain what you are trying to achieve clearly enough that another person can ask useful questions.

## Start with the outcome

Describe the user, the task and the setting. “A battery-powered device for recording an outdoor training session” gives a designer more to work with than “an IoT tracker.” Add what a successful first prototype should demonstrate. A prototype that proves a sensor can capture useful data is a different project from a device intended for sale.

Separate the first build from the long-term ambition. Which single uncertainty would make the next investment worthwhile? It may be a sensing method, a power budget, a mechanical fit or an interaction with an existing system. A small, explicit first milestone makes it easier to understand the quote.

## List the constraints you actually know

- Power source and the operating time you hope to achieve.
- Approximate size, mounting points and any enclosure already chosen.
- Inputs, outputs and connections to other equipment.
- Environment: indoor or outdoor, temperature, moisture and handling.
- Software, wireless connectivity or external services involved.
- Prototype quantity, target manufacturing quantity and budget boundaries.
- Target dates, and whether they are fixed or preferences.

Mark estimates as estimates. A target battery life is not a verified result. If a requirement is still flexible, say so. The engineer can then propose a trade-off instead of making a hidden assumption.

## Describe the handover

Ask what you will receive. Depending on the scope, that might include editable design files, manufacturing exports, a bill of materials, a review report or a test plan. Specify the software and version you need, whether source libraries are included, and who will order or test the hardware.

The phrase “complete design” means different things to different people. Replace it with a list of deliverables and the questions each deliverable should answer. Agree on the number of revision rounds and how a change in requirements will be handled.

## Keep the first message non-confidential

You can usually explain the problem, broad constraints and intended outcome without sharing a proprietary circuit or customer data. Request an NDA before exchanging confidential files. Review the actual agreement and its parties; a label saying “confidential” is not a substitute for understanding what has been agreed.

## A brief you can copy

**We are building:** …

**For these users and conditions:** …

**The first prototype must demonstrate:** …

**Known constraints:** …

**Still uncertain:** …

**Files and work already available:** …

**Deliverables we expect:** …

**Budget range and timing:** …

Bring this to a consultation. The first useful result may be a sharper question, a smaller prototype or a decision to investigate before commissioning a full board.`,
  },
  {
    slug: "pcb-review-before-manufacturing",
    title: "What a pre-order PCB review can actually tell you.",
    category: "PCB design",
    minutes: 4,
    excerpt:
      "Understand the difference between a design check, an engineering review and evidence from a physical prototype.",
    body: `Sending a board to fabrication is a commitment. An independent review can help you examine the design before that commitment, but the value depends on the questions asked and the evidence available.

## Begin with the design intent

A schematic and a layout show the implementation. They do not always explain the intention. Include a short description of what the circuit should do, the power sources, expected loads, interfaces, physical constraints and the parts of the design you are least confident about.

The reviewer should know which files are current. Send the editable project and its required libraries where agreed, along with the relevant component datasheets. If manufacturing outputs have already been generated, identify which design revision produced them.

## Use automated checks as evidence

KiCad provides an electrical rules checker in its schematic editor and a design rules checker in its PCB editor. These checks depend on the configured rules and design data. Save their reports and explain intentional exceptions instead of hiding unexplained warnings. See the [KiCad Schematic Editor documentation](https://docs.kicad.org/master/en/eeschema/eeschema.html) and [PCB Editor documentation](https://docs.kicad.org/8.0/en/pcbnew/pcbnew.html).

A clean report is useful, but it does not establish that the circuit achieves your intended function. A review also needs the engineering assumptions behind the design.

## Agree on the review boundary

A small low-voltage board, a radio design and equipment connected to mains power require different expertise and different checks. Establish the board complexity, interfaces, operating conditions and deliverables before the review begins. The reviewer should identify what they are qualified and equipped to assess.

Ask for findings in a format you can act on: the location of the issue, why it matters, the supporting evidence, a proposed next action and the remaining uncertainty. Separate a confirmed mismatch from a concern that needs measurement. A review should help you decide what to do next, not merely produce a long list of opinions.

## Close the findings before ordering

Record which changes were made, which findings remain open and why. If the design changes materially, discuss whether another review is needed. Keep the reviewed source revision separate from later experiments so there is no ambiguity about which files the report describes.

Where fabrication outputs are part of the agreed review, check them as a release package. KiCad documents Gerber plotting and drill output generation in its [PCB Editor manual](https://docs.kicad.org/9.0/en/pcbnew/pcbnew.pdf). Ask the selected manufacturer which files and conventions it requires; do not assume every supplier accepts the same package.

## Plan the next piece of evidence

A desk review is not a physical test, safety certification or regulatory approval. Decide how the prototype will be brought up, what will be measured and what would count as success. If specialist safety, radio, EMC or compliance work is needed, scope it explicitly with an appropriate professional.

The useful outcome is a more informed fabrication decision, a documented list of remaining risks and a clearer plan for testing.`,
  },
  {
    slug: "buying-digital-engineering-files",
    title: "What to check before buying a design file.",
    category: "Digital products",
    minutes: 3,
    excerpt:
      "File formats, software versions, permitted uses and the difference between a starting point and a validated product.",
    body: `A digital design can save you a useful amount of work. The right purchase depends on what you expect to do with it. A printable model, an editable CAD assembly and a fabrication-ready board package are different deliverables, even if their preview images look equally polished.

## Read the file list

Look for named formats, the design software and version, the release version, and any required libraries or external dependencies. A rendered image is not an editable design. A mesh may be useful for printing but may not provide the editing flexibility you expected. Ask before buying if compatibility is essential to your workflow.

For PCB files, clarify whether the package includes editable source, component libraries, manufacturing exports and a bill of materials. Do not assume these are all included because the listing says “PCB design.”

## Understand the licence

Check what uses are permitted. Personal use, commercial use, manufacturing physical copies, modifying the design and distributing the original files are separate questions. A purchase does not automatically grant every possible right. Keep a copy of the exact licence attached to the release you purchased.

If a product combines third-party work, check whether additional licences or attribution requirements are described. Ask the seller about any term that does not fit your intended use before payment.

## Ask what has been validated

Was the object printed, the board assembled, or the design reviewed only in software? What material, manufacturing process or operating conditions were used? What is still untested? A listing should state the limits of its evidence plainly. A successful example under one set of conditions does not prove the design will work in every application.

Budget for adapting and testing a design in your own context. If the intended use involves safety-critical systems, obtain the appropriate engineering review rather than relying on a marketplace listing.

## Keep the release record

Save the version, licence and invoice. Preserve the original downloaded files separately from your modifications. A published checksum can help identify whether you have the same file that was released; it does not by itself prove the file is safe or technically correct.

Before buying, look for an answer to four questions: what do I get, can I open it, may I use it this way, and what evidence supports its suitability? If an answer is missing, start a conversation with the seller.`,
  },
];
