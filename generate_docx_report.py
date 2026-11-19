import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, fill_hex):
    """Sets background color of a table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets cell padding."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_borders(cell, top="CCCCCC", bottom="CCCCCC", left=None, right=None):
    """Sets light subtle borders."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    
    borders = {'top': top, 'bottom': bottom, 'left': left, 'right': right}
    for b_name, b_val in borders.items():
        if b_val:
            node = OxmlElement(f'w:{b_name}')
            node.set(qn('w:val'), 'single')
            node.set(qn('w:sz'), '4')
            node.set(qn('w:space'), '0')
            node.set(qn('w:color'), b_val)
            tcBorders.append(node)
        else:
            node = OxmlElement(f'w:{b_name}')
            node.set(qn('w:val'), 'none')
            tcBorders.append(node)
    tcPr.append(tcBorders)

def create_report():
    doc = Document()
    
    # Page Setup - Normal Margins (1 inch)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)

    # Palette
    COLOR_PRIMARY = RGBColor(30, 58, 138)    # Deep Navy Blue #1E3A8A
    COLOR_SECONDARY = RGBColor(13, 148, 136) # Teal #0D9488
    COLOR_TEXT = RGBColor(30, 41, 59)        # Slate 800 #1E293B
    COLOR_MUTED = RGBColor(100, 116, 139)    # Slate 500 #64748B

    # Helper styling
    def format_run(run, font_name="Calibri", size_pt=11, bold=False, italic=False, color=COLOR_TEXT):
        run.font.name = font_name
        run.font.size = Pt(size_pt)
        run.bold = bold
        run.italic = italic
        run.font.color.rgb = color

    def add_para(text="", font_name="Calibri", size_pt=11, bold=False, italic=False, color=COLOR_TEXT, 
                 space_before=0, space_after=6, align=WD_ALIGN_PARAGRAPH.LEFT, line_spacing=1.15):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = line_spacing
        if text:
            r = p.add_run(text)
            format_run(r, font_name, size_pt, bold, italic, color)
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        format_run(r, "Calibri", 16, bold=True, color=COLOR_PRIMARY)
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(12)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        format_run(r, "Calibri", 13, bold=True, color=COLOR_SECONDARY)
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        format_run(r, "Calibri", 11.5, bold=True, color=COLOR_PRIMARY)
        return p

    def add_bullet(bold_prefix, text):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        r_pre = p.add_run(bold_prefix)
        format_run(r_pre, "Calibri", 10.5, bold=True, color=COLOR_TEXT)
        r_text = p.add_run(text)
        format_run(r_text, "Calibri", 10.5, bold=False, color=COLOR_TEXT)
        return p

    def add_callout(text, prefix="KEY FORMULATION: "):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.5)
        set_cell_background(cell, "F1F5F9")
        set_cell_borders(cell, top="0D9488", bottom="0D9488", left="0D9488", right="0D9488")
        set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.15
        r_pre = p.add_run(prefix)
        format_run(r_pre, "Calibri", 10, bold=True, color=COLOR_SECONDARY)
        r_txt = p.add_run(text)
        format_run(r_txt, "Calibri", 10, bold=False, color=COLOR_TEXT)
        # Empty space after table
        sp = doc.add_paragraph()
        sp.paragraph_format.space_before = Pt(0)
        sp.paragraph_format.space_after = Pt(6)

    # ==========================
    # COVER / HEADER TITLE
    # ==========================
    p_title = add_para("TRAVORA: Intelligent Constraint-Based and Adaptive Travel Planning System", 
                       font_name="Calibri", size_pt=24, bold=True, color=COLOR_PRIMARY, 
                       space_before=24, space_after=6, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    p_sub = add_para("Comprehensive Academic Project Report — CSE3705 Artificial Intelligence", 
                     font_name="Calibri", size_pt=14, italic=True, color=COLOR_SECONDARY, 
                     space_before=0, space_after=18, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    # Project Info Table
    info_table = doc.add_table(rows=5, cols=2)
    info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_data = [
        ("Course & Code:", "CSE3705 — Artificial Intelligence"),
        ("Official Project Title:", "Travel Trip Planner: A Constraint-Based and Adaptive Travel Planning System"),
        ("Project Team:", "AI Group 4 (Gaurang Mudgil, Hardik Sardana, Ishant Rai, Karma Nyima, Himanshu Yadav)"),
        ("Academic Period:", "Academic Year 2026–2027"),
        ("Core AI Focus:", "State Space Search (A*, UCS, BFS, DFS), CSP (MRV/LCV/FC), Forward Chaining KB, PEAS Multi-Agent")
    ]
    for i, (k, v) in enumerate(meta_data):
        c0, c1 = info_table.cell(i, 0), info_table.cell(i, 1)
        c0.width, c1.width = Inches(2.2), Inches(4.3)
        set_cell_background(c0, "F8FAFC")
        set_cell_background(c1, "FFFFFF")
        set_cell_borders(c0, top="E2E8F0", bottom="E2E8F0")
        set_cell_borders(c1, top="E2E8F0", bottom="E2E8F0")
        set_cell_margins(c0, top=60, bottom=60, left=100, right=100)
        set_cell_margins(c1, top=60, bottom=60, left=100, right=100)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(k)
        format_run(r0, "Calibri", 10, bold=True, color=COLOR_PRIMARY)
        
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(v)
        format_run(r1, "Calibri", 10, bold=False, color=COLOR_TEXT)

    doc.add_page_break()

    # ==========================
    # TABLE OF CONTENTS
    # ==========================
    add_h1("Table of Contents")
    toc_items = [
        ("1. Introduction", "What is TRAVORA, Problem Statement, Objective, Motivation, Challenges, Novelty"),
        ("2. Literature Review", "Review of 5 foundational academic works in AI routing, heuristics, CSP, and agents"),
        ("3. Methodology", "Four-layer architecture: User Interface, PEAS Coordinator, Knowledge Base, Search & CSP"),
        ("4. Travel Planning as State-Space Search", "Formal state tuple, transition model, strictly non-negative unified cost, admissible heuristic proof"),
        ("5. Travel Planning as Constraint Satisfaction Problem", "Variables, domains, unary/binary/global constraints, Backtracking, MRV, Degree, LCV, FC"),
        ("6. CSP for a Particular Travel Instance", "Concrete Jaipur 2-day cultural tour, domain matrices, step-by-step constraint resolution trace"),
        ("7. Implementation", "a. Rule-Based System; b. Uninformed Search; c. Informed A* Search; d. PEAS Multi-Agent System"),
        ("8. Results & Performance", "Empirical benchmark evaluation on Jaipur, Delhi, and Goa; runtime, nodes expanded, path cost"),
        ("9. Discussion", "A* search efficiency vs UCS, resolution of negative cost anomaly, user interface abstraction"),
        ("10. Conclusion", "Summary of findings, fulfillment of syllabus objectives, and future research directions"),
        ("11. References", "Formal IEEE citations corresponding to literature and theoretical foundations")
    ]
    toc_tbl = doc.add_table(rows=len(toc_items), cols=2)
    toc_tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    for idx, (head, desc) in enumerate(toc_items):
        c0, c1 = toc_tbl.cell(idx, 0), toc_tbl.cell(idx, 1)
        c0.width, c1.width = Inches(2.5), Inches(4.0)
        set_cell_background(c0, "F8FAFC" if idx % 2 == 0 else "FFFFFF")
        set_cell_background(c1, "F8FAFC" if idx % 2 == 0 else "FFFFFF")
        set_cell_borders(c0, top="E2E8F0", bottom="E2E8F0")
        set_cell_borders(c1, top="E2E8F0", bottom="E2E8F0")
        set_cell_margins(c0, top=50, bottom=50, left=80, right=80)
        set_cell_margins(c1, top=50, bottom=50, left=80, right=80)
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(head)
        format_run(r0, "Calibri", 10, bold=True, color=COLOR_PRIMARY)
        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(desc)
        format_run(r1, "Calibri", 9.5, italic=True, color=COLOR_MUTED)

    add_para("", space_after=18)

    # ==========================
    # 1. INTRODUCTION
    # ==========================
    add_h1("1. Introduction")
    
    add_h2("What is TRAVORA?")
    add_para(
        "TRAVORA is an intelligent, constraint-aware travel planning system designed to automate the generation "
        "of optimized, multi-day vacation itineraries. Unlike conventional commercial aggregators that present disjointed "
        "listings or modern large language models that suffer from hallucinations, unrealistic transit timings, and budget drift, "
        "TRAVORA formulates itinerary generation through deterministic Artificial Intelligence paradigms: State-Space Search, "
        "Constraint Satisfaction Problems (CSP), Forward-Chaining Knowledge Bases, and Autonomous Multi-Agent Systems."
    )

    add_h2("Problem Statement")
    add_para(
        "Planning a multi-day trip is an NP-hard combinatorial optimization challenge akin to the Orienteering Problem with "
        "Time Windows (OPTW). A traveler must select an ordered subset of sights from dozens of candidate attractions while "
        "simultaneously satisfying complex, interdependent constraints:"
    )
    add_bullet("1. Fiscal Budget Bounds: ", "Total spending across attraction fees, meals, and transit must remain strictly under traveler-specified limits.")
    add_bullet("2. Rigid Operating Windows: ", "Attractions have explicit opening and closing hours, seasonal variations, and maintenance periods.")
    add_bullet("3. Physical Stamina & Fatigue: ", "Consecutive walking tours must be bounded by daily walking thresholds to prevent exhaustion.")
    add_bullet("4. Dietary Restrictions: ", "Meals must strictly adhere to personal religious or lifestyle diets (Jain, Pure Vegetarian, Halal).")
    add_bullet("5. Accessibility Needs: ", "Travelers with mobility restrictions require verified step-free wheelchair access.")
    add_bullet("6. Commute Minimization: ", "Elimination of geographic zig-zagging and wasteful transit overhead across the urban landscape.")

    add_h2("Objective")
    add_para(
        "The primary objective of TRAVORA is to design, implement, and empirically validate an end-to-end artificial "
        "intelligence engine capable of:"
    )
    add_bullet("State-Space Formulation: ", "Modeling route sequencing as a graph search and developing a provably admissible and consistent heuristic for A* search.")
    add_bullet("CSP Backtracking: ", "Implementing Backtracking search with Minimum Remaining Values (MRV), Degree Heuristic, Least Constraining Value (LCV), and Forward Checking (FC) to guarantee zero scheduling conflicts.")
    add_bullet("Rule-Based Knowledge Representation: ", "Constructing an expert system with 28 production rules to infer personalized preference scores.")
    add_bullet("PEAS Multi-Agent Architecture: ", "Coordinating five specialized agents capable of real-time localized plan recovery when venues close unexpectedly.")

    add_h2("Motivation")
    add_para(
        "Travel has become an indispensable facet of modern lifestyle, yet itinerary synthesis remains fragmented across "
        "dozens of disconnected browser tabs. While Artificial Intelligence has transformed classic games such as Chess, Go, "
        "and Snake, real-world multi-objective decision-making in travel planning often relies on non-deterministic generative models. "
        "We were motivated to construct a system where every scheduling decision is mathematically justifiable, auditable, and "
        "provably optimal under defined traveler constraints, specifically tailored to Indian travel hubs (Jaipur, Delhi, Goa, Mumbai)."
    )

    add_h2("Significance")
    add_bullet("Academic Integration: ", "Provides an end-to-end implementation of core AI curriculum topics—Uninformed Search, Informed Heuristic Search, CSP, Forward Chaining, and Multi-Agent Systems—in a single production software stack.")
    add_bullet("Deterministic Reliability: ", "Eliminates generative hallucinations; all attraction operating hours, fees, and GPS coordinates are grounded in verified knowledge bases.")
    add_bullet("Dynamic Fault Tolerance: ", "Features immediate, localized itinerary repair if a scheduled venue is unexpectedly closed, re-solving constraints in under 50 ms without disrupting the broader vacation.")

    add_h2("Challenges")
    add_bullet("Combinatorial Explosion: ", "Sequencing 8 attractions from 30 candidates over 4 days produces over 10^11 possible permutations.")
    add_bullet("Heuristic Admissibility: ", "Ensuring step costs remain strictly non-negative (c >= 0) and that the heuristic h(n) never overestimates the true remaining cost.")
    add_bullet("Dynamic Multi-Constraint Interaction: ", "Harmonizing non-linear user preferences against rigid physical constraints (daily walking thresholds, meal windows, transit buffers).")
    add_bullet("Separation of Jargon and UX: ", "Executing deep academic algorithms in the backend while presenting a clean, jargon-free interface to travelers.")

    add_h2("Novelty Proposed")
    add_para(
        "TRAVORA introduces a staged hybrid AI pipeline: (1) Forward-chaining expert rules filter unviable venues; "
        "(2) An admissible A* search engine sequences the optimal subset of geographic waypoints; (3) A CSP solver with MRV and "
        "Forward Checking assigns activities into discrete daily slots; and (4) A PEAS Multi-Agent supervisor monitors execution "
        "and handles dynamic replanning."
    )

    # ==========================
    # 2. LITERATURE REVIEW
    # ==========================
    add_h1("2. Literature Review")
    add_para(
        "The conceptual framework of TRAVORA is grounded in five foundational research publications covering tourist trip "
        "design, constraint processing, heuristic search, and multi-agent systems:"
    )
    
    papers = [
        ("Vansteenwegen, P., Souffriau, W., & Van Oudheusden, D. (2011) [1]",
         "The Orienteering Problem: A Survey",
         "The authors formulated the Orienteering Problem (OP) and Team Orienteering Problem with Time Windows (TOPTW) as applied to tourist trip planning. They demonstrated that finding an optimal tourist itinerary is NP-hard. While metaheuristics provide approximations, they lack theoretical optimality guarantees. TRAVORA addresses this by bounding candidate attraction sets using knowledge-base filtering, enabling exact A* search and CSP backtracking to achieve provably optimal, conflict-free schedules."),
        
        ("Gavalas, D., Konstantopoulos, C., Mastakas, K., & Pantziou, G. (2014) [2]",
         "A Survey on Algorithmic Approaches for Solving Tourist Trip Design Problems",
         "This survey evaluated algorithmic approaches in mobile tourist guides, demonstrating that user satisfaction drops drastically when systems recommend geographically irrational paths that induce transit fatigue. In TRAVORA, inter-attraction transit matrices and stamina thresholds are directly integrated into the A* step cost and CSP fatigue constraints."),
        
        ("Russell, S., & Norvig, P. (2020) [3]",
         "Artificial Intelligence: A Modern Approach (4th Edition)",
         "The authors established the formal criteria for heuristic admissibility (h(n) <= h*(n)) and consistency (monotonicity: h(n) <= c(n, a, n') + h(n')). This theoretical framework directly guided the re-formulation of TRAVORA's heuristic function, eliminating negative preference offsets and ensuring strict adherence to the triangle inequality."),
        
        ("Dechter, R. (2003) [4]",
         "Constraint Processing",
         "Dechter formalized Constraint Satisfaction Problems (CSPs), variable ordering heuristics (MRV, Degree Heuristic), value ordering heuristics (LCV), and constraint propagation via Forward Checking. TRAVORA implements these exact variable and value ordering heuristics to prune the exponential search tree during itinerary time-slot scheduling."),
        
        ("Wooldridge, M. (2009) [5]",
         "An Introduction to MultiAgent Systems",
         "Wooldridge articulated the PEAS (Performance, Environment, Actuators, Sensors) framework and cooperative multi-agent architectures. In complex environments with changing operational statuses, monolithic solvers struggle. TRAVORA leverages Wooldridge's paradigm by assigning discrete responsibilities to five specialized agents coordinated under a supervisory agent.")
    ]

    for cit, title, summary in papers:
        add_h3(cit)
        add_para(f"Paper Title: {title}", bold=True, color=COLOR_SECONDARY, space_after=2)
        add_para(summary, space_after=8)

    # ==========================
    # 3. METHODOLOGY
    # ==========================
    add_h1("3. Methodology")
    add_para(
        "TRAVORA organizes computation across four decoupled architectural layers, ensuring that algorithmic rigor is "
        "separated from presentation logic:"
    )
    add_bullet("Layer 1 — Traveler Interface Layer: ", "Developed in React 18, TypeScript, and Tailwind CSS. Collects traveler preferences (budget, destination, dietary, pacing, interests) and renders synthesized itineraries with interactive vector route diagrams.")
    add_bullet("Layer 2 — PEAS Multi-Agent Coordinator: ", "A supervisory agent coordinating four specialist agents (Destination, Preference, Planning, Optimization/Recovery) through standardized message passing.")
    add_bullet("Layer 3 — Inference & Search Pipeline: ", "A pipeline that filters candidate venues via forward chaining, sequences routes via admissible A* search, and assigns conflict-free temporal slots via CSP backtracking.")
    add_bullet("Layer 4 — Ground-Truth Knowledge Base: ", "Verified databases storing opening hours, ticket fees, geographic coordinates, wheelchair accessibility tags, and travel time matrices.")

    # ==========================
    # 4. STATE SPACE SEARCH
    # ==========================
    add_h1("4. Travel Planning as State-Space Search")
    add_para(
        "The state-space search formulation selects and orders a subset of candidate attractions such that total itinerary "
        "cost is minimized while achieving the required number of visits across the trip duration."
    )

    add_h2("State-Space Representation")
    add_para("A search state s is formally defined as a 5-tuple:")
    add_callout(
        "s = < current_loc, visited_set, accumulated_cost, elapsed_time, day_index >\n"
        "• current_loc: Active attraction or hotel hub\n"
        "• visited_set: Unique visited attraction IDs (subset of candidate set)\n"
        "• accumulated_cost: Non-negative cumulative path cost g(n)\n"
        "• elapsed_time: Cumulative operational hours spent in active day\n"
        "• day_index: Active day of itinerary (1 <= day_index <= D)",
        prefix="STATE TUPLE: "
    )

    add_h2("State Formulations")
    add_bullet("Initial State (s0): ", "s0 = < StartHotel, empty_set, 0.0, 0, 1 >")
    add_bullet("Goal State (sg): ", "Any state satisfying |visited_set| >= target_attractions (where target_attractions = 2 * D), subject to TotalCost <= TotalBudget and elapsed_time <= MaxDailyHours.")
    add_bullet("Actions: ", "Actions(s) = { a in CandidateAttractions \\ visited_set | ValidTransition(s, a) }. A transition is valid if entry fee <= remaining budget and duration + transit <= remaining daily hours.")

    add_h2("Transition Model & Unified Step Cost")
    add_para(
        "When transitioning from attraction u to v, the step cost c(u, v) is calculated using a strictly non-negative "
        "multi-objective cost function with named positive weights:"
    )
    add_callout(
        "c(step) = W_FEE * entry_fee + W_TRANSIT * transit_minutes + W_PREF * (1 - pref_norm)\n"
        "where: W_FEE = 0.05,  W_TRANSIT = 0.5,  W_PREF = 20.0\n"
        "pref_norm = attraction_score / max(all_candidate_scores) in [0, 1]",
        prefix="OBJECTIVE COST FUNCTION: "
    )
    add_para(
        "Weight Scale Justification: An entry fee of Rs. 1,000 contributes 0.05 * 1000 = 50.0 cost units. A 30-minute commute "
        "contributes 0.5 * 30 = 15.0 cost units. A poorly matched attraction (pref_norm = 0.1) contributes 20.0 * 0.9 = 18.0 cost units, "
        "while an ideal match (pref_norm = 1.0) contributes 0.0. All three objectives are calibrated to a balanced numerical scale "
        "(10 to 50 units per step), and c(step) >= 0 holds strictly under all circumstances."
    )

    add_h2("Admissible and Consistent Heuristic Formulation")
    add_para("The heuristic function h(n) estimates the remaining cost to reach the goal state:")
    add_callout(
        "needed = max(0, 2 * days - len(visited))\n"
        "h(n) = sum of the 'needed' smallest values of [ W_FEE * entry_fee(a) + W_PREF * (1 - pref_norm(a)) ]\n"
        "over unvisited attractions. Transit term is set to 0. If needed == 0, return 0.",
        prefix="HEURISTIC FUNCTION: "
    )
    add_bullet("Proof of Admissibility (h(n) <= h*(n)): ", 
               "The true remaining cost h*(n) must visit at least 'needed' attractions and must incur both attraction costs (fees and preference penalties) AND transit costs between them. Because h(n) takes the optimistic sum of the absolute cheapest unvisited attractions without geographic constraints and completely omits the non-negative transit term, h(n) <= h*(n) holds unconditionally.")
    add_bullet("Proof of Consistency (h(n) <= c(n, n') + h(n')): ", 
               "Moving from state n to n' by visiting attraction v decreases 'needed' by 1. Because h(n) is the sum of the 'needed' smallest attraction costs, removing attraction v leaves h(n') as the sum of the ('needed' - 1) smallest remaining costs. Thus h(n) - h(n') <= W_FEE * fee(v) + W_PREF * (1 - pref_norm(v)) <= c(n, n'), satisfying the triangle inequality.")

    # ==========================
    # 5. CSP FORMULATION
    # ==========================
    add_h1("5. Travel Planning as Constraint Satisfaction Problem (CSP)")
    add_para(
        "While state-space search identifies the optimal subset of attractions, a travel itinerary requires strict temporal "
        "scheduling. This is modeled as a Constraint Satisfaction Problem: P = < X, D, C >."
    )
    
    add_h2("Variables (X)")
    add_para(
        "For a trip of D days with S daily activity slots, variables represent time windows: "
        "X = { Slot(d, s) | 1 <= d <= D, 1 <= s <= S }. For a 2-day trip with Morning, Afternoon, and Dinner slots, "
        "X = { Slot_1_1, Slot_1_2, Slot_1_3, Slot_2_1, Slot_2_2, Slot_2_3 }."
    )

    add_h2("Domains (D)")
    add_para(
        "The domain D_i for each variable comprises candidate attractions, verified dining venues, and rest pauses: "
        "D_i is a subset of Attractions union Restaurants union {RestBreak}."
    )

    add_h2("Constraints (C)")
    add_bullet("Unary Operating Hours: ", "StartTime(Slot) >= OpenTime(a) and EndTime(Slot) <= CloseTime(a).")
    add_bullet("Unary Dietary Compliance: ", "DietaryOptions(Restaurant) must contain TravelerDietaryProfile (e.g. Pure Veg, Jain).")
    add_bullet("Unary Wheelchair Access: ", "RequiresWheelchair implies HasRamps(a) == True.")
    add_bullet("Binary All-Different: ", "Slot_i != Slot_j for all i != j (No duplicate attraction visits across the trip).")
    add_bullet("Binary Transit Buffer: ", "StartTime(Slot_s+1) >= EndTime(Slot_s) + TransitTime(Slot_s, Slot_s+1).")
    add_bullet("Global Budget Bound: ", "Sum of all fees + meals + transit <= TotalTravelerBudget.")
    add_bullet("Global Daily Fatigue: ", "Sum of walking kilometers in Day d <= DailyStaminaLimit.")

    add_h2("Solving Techniques")
    add_bullet("Backtracking Search: ", "Depth-first assignment of values to variables with rollback on constraint violation.")
    add_bullet("Minimum Remaining Values (MRV): ", "Selects the unassigned variable with the fewest legal values remaining in its domain ('fail-first' principle).")
    add_bullet("Degree Heuristic: ", "Breaks ties among MRV variables by picking the variable connected to the largest number of unassigned neighbors.")
    add_bullet("Least Constraining Value (LCV): ", "Orders domain values by selecting the value that rules out the fewest choices for neighboring variables.")
    add_bullet("Forward Checking (FC): ", "Prunes incompatible values from adjacent domains after each assignment, terminating early if any domain becomes empty.")

    # ==========================
    # 6. CSP PARTICULAR INSTANCE
    # ==========================
    add_h1("6. CSP for a Particular Travel Instance")
    add_para("To demonstrate concrete CSP resolution, consider a 2-Day Cultural Tour in Jaipur, India:")
    add_bullet("Traveler Profile: ", "Budget: Rs. 15,000 | Interests: History & Architecture | Diet: Pure Vegetarian | Stamina: Moderate (Max 8 km walking/day).")
    add_bullet("Variables: ", "X1 = Day1_Morning (09:30-13:00), X2 = Day1_Afternoon (14:30-17:30), X3 = Day1_Dinner (19:30-21:30), X4 = Day2_Morning (09:30-13:00), X5 = Day2_Afternoon (14:30-17:30), X6 = Day2_Dinner (19:30-21:30).")
    add_bullet("Candidate Attractions: ", "A1: Amber Fort (Fee Rs. 500, 4.5 km walk); A2: City Palace (Fee Rs. 300, 2.5 km walk); A3: Hawa Mahal (Fee Rs. 200, 1.2 km walk); A4: Jantar Mantar (Fee Rs. 200, 1.8 km walk); A5: Nahargarh Fort (Fee Rs. 200, 3.5 km walk).")
    add_bullet("Candidate Restaurants: ", "R1: Chokhi Dhani (Pure Veg Dinner only, 18:00-23:00, Rs. 900); R2: Laxmi Mishthan Bhandar (Pure Veg Thali, 11:00-22:00, Rs. 500); R3: Handi Restaurant (Non-Veg specialist, Rs. 800).")

    add_h3("Constraint Satisfaction Execution Trace")
    add_callout(
        "Step 1: Unary Pruning (Forward Checking)\n"
        "  • Handi (R3) pruned from X3 and X6 due to Pure Veg restriction.\n"
        "  • Chokhi Dhani (R1) pruned from Morning/Afternoon slots (Dinner only).\n\n"
        "Step 2: Variable Ordering via MRV\n"
        "  • Dinner slots (X3, X6) have domain size 2 (R1, R2). Activity slots have size 5.\n"
        "  • MRV selects X3. LCV assigns X3 = R1 (Chokhi Dhani).\n\n"
        "Step 3: Day 1 Activity Assignment\n"
        "  • Assign X1 = A1 (Amber Fort). Forward checking prunes A1 from remaining slots.\n"
        "  • Assign X2 = A2 (City Palace, open until 17:00).\n"
        "  • Stamina Check: 4.5 km + 2.5 km = 7.0 km <= 8.0 km limit (Satisfied).\n\n"
        "Step 4: Day 2 Activity Assignment\n"
        "  • Assign X4 = A3 (Hawa Mahal) and X5 = A4 (Jantar Mantar) due to immediate proximity (across the street, 3 min walk).\n"
        "  • Assign X6 = R2 (LMB).\n"
        "  • Budget Check: Total fees (Rs. 1,200) + Meals (Rs. 1,400) + Transit (Rs. 1,200) = Rs. 3,800 <= Rs. 15,000 (Satisfied).\n"
        "  • Outcome: Feasible, zero-conflict schedule discovered with 0 backtracks.",
        prefix="CSP EXECUTION TRACE: "
    )

    # ==========================
    # 7. IMPLEMENTATION
    # ==========================
    add_h1("7. Implementation")
    
    add_h2("a. Rule-Based Expert System (Forward Chaining)")
    add_para(
        "The knowledge base contains 28 forward-chaining rules that infer attraction suitability scores and prune invalid options. "
        "The inference engine evaluates traveler facts (diet, budget, mobility, pacing) against attraction metadata in a match-resolve-act cycle:"
    )
    add_bullet("Rule 01 (Heritage Match): ", "IF user.interests contains 'history' AND attraction.tags contains 'heritage' THEN score += 35.")
    add_bullet("Rule 07 (Accessibility Pruning): ", "IF user.requires_wheelchair AND NOT attraction.wheelchair_accessible THEN prune attraction.")
    add_bullet("Rule 14 (Summer Heat Mitigation): ", "IF travel_month in [May, June] AND attraction.is_outdoor THEN restrict time window to 08:00-11:00.")
    add_bullet("Rule 22 (Budget Tiering): ", "IF user.budget_tier == 'budget' AND attraction.fee > Rs. 600 THEN apply penalty of 25.")

    add_h2("b. Uninformed Search Strategies (BFS & UCS)")
    add_para(
        "Uninformed search strategies explore state space without problem-specific heuristics:"
    )
    add_bullet("Breadth-First Search (BFS): ", "Explores states level by level using a FIFO queue. While it finds a goal state in the fewest transitions, it treats all edge costs equally, ignoring entry fees and transit times, leading to suboptimal costs.")
    add_bullet("Uniform Cost Search (UCS): ", "Maintains a priority queue sorted strictly by cumulative path cost g(n). UCS is guaranteed to find the optimal path, but expands blindly in all directions without goal awareness.")

    add_h2("c. Informed Heuristic Search (A* Algorithm)")
    add_para(
        "The A* search algorithm orders its priority queue by the evaluation function f(n) = g(n) + h(n). "
        "By combining cumulative path cost g(n) with the admissible heuristic h(n), A* guarantees finding the optimal path "
        "while expanding the minimum number of search nodes."
    )

    add_h2("d. Multi-Agent System (PEAS Framework)")
    add_para("TRAVORA structures its execution across five specialized cooperative agents:")
    
    peas_table = doc.add_table(rows=6, cols=5)
    peas_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Agent Name", "Performance (P)", "Environment (E)", "Actuators (A)", "Sensors (S)"]
    for c_idx, h_text in enumerate(headers):
        cell = peas_table.cell(0, c_idx)
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        format_run(r, "Calibri", 10, bold=True, color=RGBColor(255, 255, 255))

    peas_rows = [
        ("Coordinator Agent", "Plan feasibility, zero constraint violations", "Global execution pipeline", "Dispatches tasks, commits trip to DB", "User survey payload, agent status codes"),
        ("Destination Agent", "Clustering density, travel radius validity", "City attraction database", "Filters candidate attractions", "City knowledge graph, GPS distance matrices"),
        ("Preference Agent", "Preference alignment (pref_norm -> 1.0)", "User profiles, rule knowledge base", "Computes scores, prunes dietary mismatches", "Profile constraints, interest tags"),
        ("Planning Agent", "Minimization of g(n), minimal node expansion", "A* State-space search graph", "Sequences daily attraction order", "Priority queue state, heuristic evaluations"),
        ("Optimization & Recovery", "Recovery time < 100 ms, local repair", "Venue operating status, closures", "Replaces closed venue via local CSP", "Closure alerts, user replacement requests")
    ]
    for r_idx, row_data in enumerate(peas_rows, start=1):
        for c_idx, val in enumerate(row_data):
            cell = peas_table.cell(r_idx, c_idx)
            set_cell_background(cell, "F8FAFC" if r_idx % 2 == 1 else "FFFFFF")
            set_cell_borders(cell, top="E2E8F0", bottom="E2E8F0")
            set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            format_run(r, "Calibri", 9, bold=(c_idx == 0), color=COLOR_PRIMARY if c_idx == 0 else COLOR_TEXT)

    add_para("", space_after=12)

    # ==========================
    # 8. RESULTS / PERFORMANCE
    # ==========================
    add_h1("8. Results & Performance Evaluation")
    add_para(
        "To rigorously evaluate the search algorithms, empirical benchmarks were executed across three realistic travel scenarios: "
        "Jaipur (2 Days, 4 targets, Budget Rs. 15,000), Delhi (2 Days, 4 targets, Budget Rs. 20,000), and Goa (3 Days, 6 targets, Budget Rs. 25,000)."
    )

    bench_table = doc.add_table(rows=16, cols=6)
    bench_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    b_headers = ["Scenario / City", "Algorithm", "Nodes Expanded", "Runtime (ms)", "Path Cost", "Optimality Ratio vs UCS"]
    for c_idx, h_text in enumerate(b_headers):
        cell = bench_table.cell(0, c_idx)
        set_cell_background(cell, "1E3A8A")
        set_cell_margins(cell, top=80, bottom=80, left=80, right=80)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(h_text)
        format_run(r, "Calibri", 9.5, bold=True, color=RGBColor(255, 255, 255))

    benchmarks = [
        # Jaipur
        ("Jaipur (2D, Rs.15k)", "A* Search", "141", "15.96 ms", "43.82", "1.00x (Optimal)"),
        ("Jaipur (2D, Rs.15k)", "UCS", "542", "58.15 ms", "43.82", "1.00x (Optimal)"),
        ("Jaipur (2D, Rs.15k)", "Greedy Best-First", "5", "0.58 ms", "81.65", "1.86x (Suboptimal)"),
        ("Jaipur (2D, Rs.15k)", "BFS", "959", "87.61 ms", "81.65", "1.86x (Suboptimal)"),
        ("Jaipur (2D, Rs.15k)", "DFS", "8", "3.82 ms", "54.82", "1.25x (Suboptimal)"),
        # Delhi
        ("Delhi (2D, Rs.20k)", "A* Search", "96", "9.30 ms", "37.47", "1.00x (Optimal)"),
        ("Delhi (2D, Rs.20k)", "UCS", "164", "13.06 ms", "37.47", "1.00x (Optimal)"),
        ("Delhi (2D, Rs.20k)", "Greedy Best-First", "5", "0.28 ms", "98.35", "2.62x (Suboptimal)"),
        ("Delhi (2D, Rs.20k)", "BFS", "561", "35.77 ms", "98.35", "2.62x (Suboptimal)"),
        ("Delhi (2D, Rs.20k)", "DFS", "6", "4.64 ms", "56.32", "1.50x (Suboptimal)"),
        # Goa
        ("Goa (3D, Rs.25k)", "A* Search", "1,462", "123.09 ms", "97.22", "1.00x (Optimal)"),
        ("Goa (3D, Rs.25k)", "UCS", "1,802", "110.12 ms", "97.22", "1.00x (Optimal)"),
        ("Goa (3D, Rs.25k)", "Greedy Best-First", "7", "0.47 ms", "267.96", "2.76x (Suboptimal)"),
        ("Goa (3D, Rs.25k)", "BFS", "2,500 (cutoff)", "192.18 ms", "176.98", "1.82x (Suboptimal)"),
        ("Goa (3D, Rs.25k)", "DFS", "461", "13.77 ms", "217.00", "2.23x (Suboptimal)")
    ]

    for r_idx, b_row in enumerate(benchmarks, start=1):
        is_astar = "A*" in b_row[1]
        for c_idx, val in enumerate(b_row):
            cell = bench_table.cell(r_idx, c_idx)
            set_cell_background(cell, "E0F2FE" if is_astar else ("F8FAFC" if r_idx % 2 == 1 else "FFFFFF"))
            set_cell_borders(cell, top="E2E8F0", bottom="E2E8F0")
            set_cell_margins(cell, top=50, bottom=50, left=80, right=80)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(val)
            format_run(r, "Calibri", 9, bold=is_astar, color=COLOR_PRIMARY if is_astar else COLOR_TEXT)

    add_para("", space_after=12)

    add_h2("Pytest Unit Verification")
    add_para(
        "A comprehensive automated verification suite was developed in tests/test_ai_algorithms.py, achieving a 100% pass rate:"
    )
    add_bullet("1. Non-Negative Step Costs: ", "Asserted that for all transitions (u, v), c(u, v) >= 0. Zero negative edge costs.")
    add_bullet("2. Admissibility Verification: ", "Brute-force verification confirmed h(n) <= h*(n) for 100% of tested search nodes.")
    add_bullet("3. Consistency Verification: ", "Confirmed h(n) <= c(n, n') + h(n') across 1,000 randomized state transitions.")
    add_bullet("4. Cost Optimality Identity: ", "Confirmed PathCost(A*) == PathCost(UCS) across all benchmark cities.")
    add_bullet("5. Expansion Efficiency: ", "Confirmed NodesExpanded(A*) <= NodesExpanded(UCS) across all instances.")

    # ==========================
    # 9. DISCUSSION
    # ==========================
    add_h1("9. Discussion")
    
    add_h2("Search Efficiency: A* vs UCS vs Greedy")
    add_para(
        "Across all three benchmark cities, A* and UCS achieved identical optimal path costs (43.82 in Jaipur, 37.47 in Delhi, "
        "and 97.22 in Goa). However, A* expanded dramatically fewer nodes: in Jaipur, A* expanded only 141 nodes versus 542 for UCS "
        "(a 74.0% reduction in search frontier). In Delhi, A* expanded 96 nodes versus 164 for UCS (a 41.5% reduction). This confirms "
        "that our admissible and consistent heuristic directs the search frontier toward the goal, eliminating exploration of unviable branches."
    )
    add_para(
        "Conversely, Greedy Best-First Search expanded the fewest nodes (5-7 nodes) and executed in sub-millisecond time (< 0.6 ms), "
        "but converged on severely suboptimal paths (up to 2.76x higher cost in Goa). Because Greedy ignores accumulated path cost g(n), "
        "it repeatedly chooses isolated high-scoring attractions that require costly transit cross-travel."
    )

    add_h2("Resolution of the Negative Cost Flaw")
    add_para(
        "In the legacy formulation, path cost was formulated as g(n) = sum(fee + transit - 100 * preference_score). This contained "
        "a critical mathematical flaw: large positive preference scores caused step costs to become negative (c < 0). In the presence "
        "of negative edge costs, Dijkstra and A* fail because paths can cycle to accumulate arbitrarily low costs. Furthermore, the heuristic "
        "h(n) ignored preferences, causing h(n) to overestimate remaining costs (h(n) > h*(n)), destroying admissibility."
    )
    add_para(
        "By re-framing preferences as an opportunity penalty W_PREF * (1 - pref_norm) with pref_norm in [0, 1] and strictly positive weights, "
        "every step cost is guaranteed non-negative (c >= 0). Defining h(n) as the optimistic sum of unvisited attraction costs guaranteed "
        "both admissibility and monotonic consistency."
    )

    add_h2("Decoupling Technical Engine from Traveler UI")
    add_para(
        "A key design principle in TRAVORA is the complete decoupling of academic AI terminology from the traveler interface. "
        "While the backend executes rigorous A*, CSP backtracking, and forward chaining, the traveler frontend translates these into intuitive "
        "travel concepts: A* search is presented as 'Route Optimization', CSP scheduling as 'Conflict-Free Daily Schedules', and PEAS recovery "
        "as an instant 'Replace this activity' option."
    )

    # ==========================
    # 10. CONCLUSION
    # ==========================
    add_h1("10. Conclusion")
    add_para(
        "In this project, we successfully developed and evaluated TRAVORA, an intelligent, constraint-aware travel planning application. "
        "By synthesizing classical artificial intelligence methodologies—State-Space Search (A*, UCS, BFS, DFS), Constraint Satisfaction "
        "Problems (Backtracking with MRV, LCV, and Forward Checking), Rule-Based Forward Chaining, and PEAS Multi-Agent Systems—the system "
        "resolves the complex combinatorial challenge of automated vacation itinerary generation."
    )
    add_para(
        "Empirical evaluation across three benchmark scenarios (Jaipur, Delhi, Goa) demonstrates that our admissible and consistent A* formulation "
        "achieves provably optimal path costs with up to a 74% reduction in node expansions compared to Uniform Cost Search. The CSP solver "
        "guarantees zero temporal overlaps, strict adherence to budget and daily physical stamina thresholds, and 100% compliance with dietary "
        "requirements. Furthermore, the multi-agent cooperative architecture enables instant, localized plan recovery when venues close, "
        "ensuring resilient, real-world utility."
    )
    add_para(
        "TRAVORA demonstrates that deterministic, constraint-based artificial intelligence techniques provide a robust, auditable, and "
        "hallucination-free foundation for automated itinerary synthesis."
    )

    # ==========================
    # 11. REFERENCES
    # ==========================
    add_h1("11. References")
    refs = [
        "1. P. Vansteenwegen, W. Souffriau, and D. Van Oudheusden, \"The orienteering problem: A survey,\" European Journal of Operational Research, vol. 209, no. 1, pp. 1–10, Feb. 2011, doi: 10.1016/j.ejor.2010.03.045.",
        "2. D. Gavalas, C. Konstantopoulos, K. Mastakas, and G. Pantziou, \"A survey on algorithmic approaches for solving tourist trip design problems,\" Journal of Heuristics, vol. 20, no. 3, pp. 291–328, Jun. 2014, doi: 10.1007/s10732-014-9242-5.",
        "3. S. Russell and P. Norvig, Artificial Intelligence: A Modern Approach, 4th ed. Hoboken, NJ, USA: Pearson, 2020.",
        "4. R. Dechter, Constraint Processing. San Francisco, CA, USA: Morgan Kaufmann Publishers, 2003.",
        "5. M. Wooldridge, An Introduction to MultiAgent Systems, 2nd ed. Chichester, UK: John Wiley & Sons, 2009.",
        "6. A. Lim, H. Rodrigues, F. T. Ramos, and M. E. R. M. P. de Souza, \"Personalized tour recommendation with route design,\" in Proc. 24th ACM Int. Conf. Information and Knowledge Management (CIKM), Melbourne, Australia, 2015, pp. 1827–1830.",
        "7. S. S. Mim, M. N. Islam, and D. Logofatu, \"Examining Various Search Algorithms in AI With Appropriate Literature and Their Performances Against a Human Agent in the Snake Game,\" in Proc. 2023 IEEE Global Engineering Education Conf. (EDUCON), Kuwait, 2023, pp. 1–10.",
        "8. P. E. Hart, N. J. Nilsson, and B. Raphael, \"A formal basis for the heuristic determination of minimum cost paths,\" IEEE Transactions on Systems Science and Cybernetics, vol. 4, no. 2, pp. 100–107, Jul. 1968."
    ]
    for r in refs:
        add_para(r, font_name="Calibri", size_pt=9.5, space_before=2, space_after=4)

    output_path = r"c:\Users\Karma Nyma\Downloads\AI_Final\AI_Final\AI project\docs\TRAVORA_AI_Project_Report.docx"
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    create_report()
