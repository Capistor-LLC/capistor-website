export const NDA_TEMPLATE = `MUTUAL NON-DISCLOSURE AGREEMENT

Effective date: {{effective_date}}
Order reference: {{reference}}
Service: {{project_title}}

PARTIES
(1) {{company_name}}, of {{company_address}} ("Capistor"); and
(2) {{client_name}}, {{client_company}}, of {{client_address}}, email {{client_email}} ("Client").

Each is a "Party" and together the "Parties". A Party disclosing Confidential Information is a "Discloser" and a Party receiving it is a "Recipient".

1. PURPOSE
The Parties may exchange information only to evaluate, quote, plan and perform the following project (the "Purpose"):
{{brief}}

2. CONFIDENTIAL INFORMATION
"Confidential Information" means non-public technical, commercial, financial or business information disclosed for the Purpose in any form, including ideas, specifications, schematics, PCB and CAD files, source code, firmware, prototypes, test results, product plans, supplier or customer information, pricing, credentials and the existence or content of project discussions. Information is protected whether or not it is marked confidential where a reasonable person would understand it to be confidential.

3. RECIPIENT DUTIES
The Recipient will: (a) use Confidential Information only for the Purpose; (b) protect it with at least reasonable care and no less care than it uses for its own similar information; (c) disclose it only to personnel, professional advisers and approved subcontractors who need it for the Purpose and are bound by confidentiality duties at least as protective as this Agreement; (d) remain responsible for those persons; and (e) promptly notify the Discloser of suspected unauthorised access, use or disclosure and cooperate in mitigation.

4. EXCLUSIONS
The duties do not apply to information the Recipient can document: was lawfully public without breach; was already lawfully known without restriction; was independently developed without use of the Confidential Information; or was lawfully received from a third party without a confidentiality duty.

5. REQUIRED DISCLOSURE
If law or a competent authority requires disclosure, the Recipient may disclose only the minimum required and, where lawful, will give prompt prior notice and reasonable assistance so the Discloser may seek protection.

6. OWNERSHIP AND NO LICENCE
The Discloser retains all rights in its Confidential Information. Disclosure does not grant an intellectual-property licence, transfer ownership, promise an order or create a partnership, agency or joint venture. Project deliverable rights are governed only by the applicable product licence or signed Engineering Services Agreement.

7. SECURITY, COPIES AND RETURN
The Recipient may make only copies reasonably needed for the Purpose. On written request or when the Purpose ends, it will return or securely delete Confidential Information and confirm completion, except for records required by law, a signed transaction record, or encrypted backups that expire through the ordinary backup cycle. Any retained copy remains protected and may not be used for another purpose.

8. PUBLICITY AND REVERSE ENGINEERING
Neither Party may identify the other, publish project material, use names or logos, or create a public case study without recorded permission. The Recipient will not reverse engineer a confidential prototype or sample except to the extent expressly authorised for the Purpose or required by non-excludable law.

9. TERM
This Agreement begins on the effective date. It covers disclosures made for three years. Confidentiality and restricted-use duties continue for five years after each disclosure; trade secrets remain protected while they qualify as trade secrets under applicable law.

10. REMEDIES
The Parties recognise that unauthorised use or disclosure may cause harm that is difficult to measure. The Discloser may seek urgent injunctive or protective relief in addition to other available remedies. This clause does not predetermine liability or remove a defence.

11. LAW AND DISPUTES
This Agreement is governed by the laws of the United Arab Emirates. The Parties will first attempt in good faith for 30 days to resolve a dispute through written notice. If unresolved, the courts of Dubai have jurisdiction, subject to any mandatory forum or right that applies.

12. GENERAL
This Agreement is the complete confidentiality agreement for the Purpose. An amendment must be recorded in a new version accepted by both Parties. A waiver must be explicit. If a provision is unenforceable, it will be adjusted only as far as necessary and the rest continues. Electronic signatures and counterparts form one agreement.

SIGNATURE RECORD
The Capistor workspace records each signer's verified account, legal name, party, timestamp, consent, document version and SHA-256 fingerprint. Each signer confirms authority to bind the named Party and signs only this exact version.`;

export const CONTRACT_TEMPLATE = `ENGINEERING SERVICES AGREEMENT

Effective date: {{effective_date}}
Order reference: {{reference}}

PROVIDER
{{company_name}}, of {{company_address}} ("Capistor")

CLIENT
{{client_name}}, {{client_company}}, of {{client_address}}, email {{client_email}} ("Client")

1. PROJECT
Service: {{project_title}}
Client brief:
{{brief}}

2. AGREED SCOPE AND DELIVERABLES
{{scope}}

3. EXCLUSIONS
{{exclusions}}

Anything not expressly included is outside scope. Capistor will not add work or charges without an accepted change proposal.

4. PRICE, TAX AND PAYMENT
Total order price: {{total}}. The checkout or invoice shows any applicable tax before payment. Full payment is due after both Parties sign this Agreement and before work begins, unless a recorded milestone schedule replaces that requirement. Cleared payment, not a receipt or screenshot, confirms payment. Authorised third-party costs are included only where expressly itemised.

5. START, SCHEDULE AND CLIENT DEPENDENCIES
The estimated delivery window is {{delivery_days}} business days after Capistor has cleared payment, complete accepted requirements, required files, signed agreements and required Client decisions. The Client will provide accurate information, lawful files, access and timely feedback. A dependency delay moves affected dates reasonably; Capistor records the cause, impact and revised date in the order history.

6. REVISIONS, REVIEW AND ACCEPTANCE
The price includes {{revisions}} revision round(s) within scope. The Client will review each submitted deliverable within five business days and identify any objective non-conformity against this Agreement. Capistor will correct a valid non-conformity without charge. A requested preference, new requirement or change to an accepted input is a scope change. A deliverable is accepted when the Client approves it, uses it in production, or does not report an objective non-conformity within the review period. Acceptance does not remove the Engineering Integrity Guarantee or mandatory rights.

7. CHANGE CONTROL AND NEGOTIATION RECORD
Either Party may propose a change. The workspace records the proposal text, version, author, date, objection or comment, decision and the difference from the previous version. A change affects scope, price or schedule only when authorised representatives of both Parties record acceptance. Superseded versions remain available for audit and conflict resolution. Silence is not acceptance.

8. TESTING AND ENGINEERING INTEGRITY GUARANTEE
Capistor performs only the reviews and tests stated in the agreed scope or an accepted change. Capistor guarantees that its paid design work will meet the expressly agreed engineering requirements. A reproducible engineering flaw introduced by Capistor will be corrected, reworked or replaced at no charge. If it cannot be corrected within a reasonable period, the affected design fee is refunded in full; if the flaw makes the complete integrated Capistor order substantially unusable for its agreed purpose, the complete Capistor order may be refunded in full.

Every physical PCB supplied by Capistor must pass the quality-control steps recorded for this order before dispatch. A confirmed Capistor design, assembly or manufacturing defect will be repaired, remade or replaced at no cost. If an effective remedy is not practical within a reasonable period, the Client may choose a refund for the affected PCB line or, where the defect makes the complete integrated order substantially unusable, the complete Capistor order.

The guarantee does not cover a failure caused solely by unauthorised changes, fabrication or assembly outside the approved files, use outside disclosed ratings, incorrect installation, accident, misuse, normal wear, counterfeit or substituted components not supplied or approved by Capistor, or a material requirement withheld before acceptance. Capistor must document an exclusion it relies on. Mandatory rights remain unaffected.

9. INTELLECTUAL PROPERTY
The Client retains ownership of Client material. Capistor retains its pre-existing and general-purpose tools, templates, libraries, methods, know-how and background intellectual property. After full payment, project deliverable rights are as stated in the accepted proposal or product licence. If the proposal is silent, the Client receives a perpetual, non-exclusive licence to use and modify the deliverables for its own personal or internal company use, but not to resell or redistribute the design files or provide them as a competing product. Identified third-party and open-source material remains subject to its own licence. Capistor will not publish the project or use it in a portfolio without recorded Client permission.

10. CONFIDENTIALITY, PRIVACY AND SECURITY
The project NDA applies. Each Party will protect the other's confidential information. Capistor will process personal and company data under its Privacy Policy, use private access controls for project files, and limit access to personnel and processors that need it to deliver the service. A verified deletion request is honoured subject to mandatory retention and live legal claims.

11. CUSTOMER WARRANTIES
The Client confirms it is authorised to enter this Agreement, owns or may lawfully provide Client material, and has disclosed intended use and material safety, regulatory, environmental and compatibility requirements. Unless expressly included, the work is not a patent opinion, regulatory certification, laboratory approval or approval for a safety-critical use.

12. CANCELLATION AND TERMINATION
Before work begins, a Client cancellation is refunded in full less only an authorised, non-cancellable third-party cost. After work begins, the Client pays for accepted work and authorised non-cancellable costs completed up to termination, and Capistor refunds the unused balance. Either Party may terminate a material breach not corrected within ten business days after written notice. Capistor may immediately suspend unlawful, unsafe, abusive or security-threatening activity. If Capistor cancels without Client breach, all undelivered prepaid amounts are refunded.

13. LIABILITY
Neither Party is liable for indirect or consequential loss, lost profit, lost opportunity or loss of data that was not reasonably foreseeable when this Agreement was made. Subject to mandatory law, each Party's aggregate contractual liability is limited to the amount paid under this order. The limit does not apply to fraud, wilful misconduct, gross negligence, breach of confidentiality, infringement for which that Party is responsible, death or personal injury caused by negligence, the Engineering Integrity Guarantee, or liability that cannot lawfully be limited.

14. FORCE MAJEURE
Neither Party is responsible for delay caused by an event outside reasonable control if it promptly informs the other and takes reasonable mitigation steps. If substantial performance is prevented for more than 30 days, either Party may terminate the affected undelivered work and settle the earned and unused balance.

15. SUPPORT, NOTICES AND DISPUTES
Project notices and decisions are recorded in the order workspace. Support and refund tickets may be opened from the account email at {{support_email}} with the order reference. This Agreement is governed by the laws of the United Arab Emirates. The Parties will first try in good faith for 30 days to resolve a dispute through the recorded process. If unresolved, the courts of Dubai have jurisdiction, subject to any mandatory consumer forum or right.

16. ENTIRE AGREEMENT
This Agreement, the accepted proposal and changes, the NDA, the saved Customer Terms and any identified licence form the complete agreement for the order. The priority stated in the Customer Terms applies. A waiver must be explicit. If a clause is unenforceable, it will be adjusted only as far as necessary and the rest continues. Electronic signatures and counterparts form one agreement. Website updates do not alter this signed version.

SIGNATURE RECORD
The Capistor workspace records each signer's verified account, legal name, party, timestamp, consent, version and SHA-256 fingerprint. Each signer confirms authority to bind the named Party and signs only this exact version.`;
