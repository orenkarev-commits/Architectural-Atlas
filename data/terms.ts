/**
 * A working dictionary for the Atlas — every term drawn from a building we actually
 * hold, so the definitions stay concrete. `seenAt` names the buildings that show it;
 * `category` groups the glossary (a construction method, a façade element, a style, or
 * a piece of history). Keep definitions plain and sourced to the collection.
 */
export type TermCategory = 'construction' | 'element' | 'style' | 'history';

export interface Term {
  term: string;
  category: TermCategory;
  definition: string;
  /** Buildings in the Atlas that demonstrate it. */
  seenAt: string[];
}

const curated: Term[] = [
  {
    term: 'International Style (where the term came from)',
    category: 'style',
    definition:
      'The name was coined in 1932 by Philip Johnson and Henry-Russell Hitchcock, curators of the Museum of Modern Art’s exhibition “Modern Architecture: International Exhibition” in New York. They defined it as an architecture of volume over mass, balance instead of symmetry, and the rejection of ornament — the characteristics that went on to shape the White City of Tel Aviv. (Source: Tel Aviv exhibition wall text, MoMA 1932.)',
    seenAt: ['Engel House', 'Max Liebling House', 'Beit HaTe\'omim'],
  },
  {
    term: 'Pilotis',
    category: 'construction',
    definition:
      'Slender columns that lift a building off the ground, freeing the ground floor as open, shaded public space — a Le Corbusier idea argued in Tel Aviv as climate sense, not just style.',
    seenAt: ['Engel House'],
  },
  {
    term: 'Silicate (sand-lime) brick',
    category: 'construction',
    definition:
      'Pale, machine-pressed sand-and-lime brick. Where most of the city rendered its walls, Joseph Berlin left it bare and let the coursing do the decorating.',
    seenAt: ["Beit HaTe'omim", 'Berlin House', 'Beit Mann', 'Guter House'],
  },
  {
    term: 'Reinforced concrete frame',
    category: 'construction',
    definition:
      'A skeleton of steel-reinforced concrete that carries the loads, so the outer wall no longer has to — the technical basis for the ribbon window, the cantilever and the free façade.',
    seenAt: ['Albrecht Aberle House', 'Brown–Rabinsky House'],
  },
  {
    term: 'Kurkar',
    category: 'construction',
    definition:
      'The local calcareous sandstone of the coast, the traditional building stone of Ottoman Jaffa and the colonies. A field observation at a building base, never assumed for a whole structure without a materials report.',
    seenAt: ['Turret Building / Pensionnat Saint Joseph', 'Templer Storage Reservoir'],
  },
  {
    term: 'Thermometer window',
    category: 'element',
    definition:
      'A tall, narrow strip of glazing running up a stairwell — it lights the stair the full height of the building and reads from the street like the column of a thermometer.',
    seenAt: ['Hemphel House'],
  },
  {
    term: 'Ribbon window',
    category: 'element',
    definition:
      'A window run horizontally in a continuous band across the façade, made possible once the frame — not the wall — carries the load. A signature of the International Style.',
    seenAt: ['Engel House', 'Mazeh 16'],
  },
  {
    term: 'Cantilevered balcony',
    category: 'element',
    definition:
      'A balcony slab projecting from the frame with no columns beneath it — structural confidence turned into deep, sun-shading shade on the street front.',
    seenAt: ['Brown–Rabinsky House'],
  },
  {
    term: 'Stairwell façade',
    category: 'element',
    definition:
      'Making the vertical circulation — not the rooms — the public face of the building, so the plan is legible from the street. A recurring Tel Aviv move.',
    seenAt: ['Brown–Rabinsky House', 'Berlin House', 'Hemphel House'],
  },
  {
    term: 'Pergola',
    category: 'element',
    definition:
      'An open roof-frame of beams over a balcony or roof terrace, casting striped shade — the Mediterranean adaptation that softened imported modernism to the sun.',
    seenAt: ['Engel House'],
  },
  {
    term: 'Rusticated base',
    category: 'element',
    definition:
      'A ground floor given deep, grooved, heavy-looking masonry (often in plaster) to make a building sit solidly on its corner before lighter storeys rise above.',
    seenAt: ['Beit Lifshitz'],
  },
  {
    term: 'Pagoda / decorative roof',
    category: 'element',
    definition:
      'A steep, ornamental roof — an Eclectic flourish in a city that would soon go flat-roofed. The Pagoda House wears a Japanese-inspired one over an orientalist envelope.',
    seenAt: ['Pagoda House'],
  },
  {
    term: 'Relief iconography',
    category: 'element',
    definition:
      "Carved or cast imagery worked into the façade to declare what a building is for — wheat-stalks on a bank for agriculture; pomegranates and heraldry on an Eclectic corner.",
    seenAt: ['Agricultural Bank of Israel — Head Office', 'Beit Lifshitz'],
  },
  {
    term: 'Ottoman Era',
    category: 'style',
    definition:
      "The late-Ottoman building of Jaffa and its colonies, before Tel Aviv (to 1917): thick load-bearing masonry, arched openings and imported European institutional forms, often in local kurkar sandstone — the layer the modern city grew out of.",
    seenAt: ['Turret Building / Pensionnat Saint Joseph'],
  },
  {
    term: 'Eclectic',
    category: 'style',
    definition:
      "The founding Tel Aviv manner of the 1920s: many historical languages worn at once — European, Moorish, Byzantine, Jewish-national — as a brand-new city improvised an identity, carried by the applied-arts crafts descended from Arts & Crafts, Jugendstil and the Vienna Secession.",
    seenAt: ['Pagoda House', "Beit Ha'ir", 'Beit Krol'],
  },
  {
    term: 'Arts & Crafts movement',
    category: 'style',
    definition:
      "The reform movement begun in 1880s Britain around William Morris (1834–96): a rejection of industrial mass production for handmade craft, honest materials and dignity in labour. It flowered internationally to about 1920 and shaped the Continental movements the city's founders knew — Art Nouveau/Jugendstil and the Vienna Secession — and, in time, the Bauhaus. In Tel Aviv it survives as the plaster, metal, wood and tile craft beneath the Eclectic façade.",
    seenAt: ['Beit Bialik', 'Beit Krol', 'Pagoda House'],
  },
  {
    term: 'Jugendstil (Art Nouveau)',
    category: 'style',
    definition:
      "The German and Austrian name for Art Nouveau (c. 1895–1910), after the Munich journal Jugend ('Youth', founded 1896). A revolt against academic historicism, it favoured flowing floral ornament fused with geometric line — one of the decorative languages the Eclectic city borrowed.",
    seenAt: ['Pagoda House', 'Beit Krol'],
  },
  {
    term: 'Vienna Secession',
    category: 'style',
    definition:
      "The group founded in Vienna on 3 April 1897 by Gustav Klimt, Joseph Olbrich, Josef Hoffmann, Koloman Moser and others, breaking from the official Academy to pursue a unified art across painting, architecture and the applied arts. Adjacent to Art Nouveau but closer to the Arts & Crafts reform agenda, it belongs to the ornamental lineage behind Tel Aviv's Eclectic.",
    seenAt: ['Beit Krol', 'Pagoda House'],
  },
  {
    term: 'Art Deco',
    category: 'style',
    definition:
      'The decorative modern that bridged Eclectic and International — prism pilasters, stepped massing and streamlined curves, ornament kept but made geometric. In Tel Aviv it dressed the first power station, corner blocks and speculative apartment houses through the mid-1920s.',
    seenAt: ['The First Power Station', 'Beit Awad', 'Nastissin House / “The Common House”'],
  },
  {
    term: 'Early Modernism',
    category: 'style',
    definition:
      "Our name for the ~1930–32 turn when the historicist façade falls away — plain rendered planes, horizontal slab lines, the stair made architecture — while the massing is still heavier and more domestic than the light White-City block to come. A transitional class.",
    seenAt: ['Balfour 57', 'Balfour 42'],
  },
  {
    term: 'Bauhaus',
    category: 'style',
    definition:
      "The German art-and-design school founded by Walter Gropius in Weimar in 1919 (Dessau 1925, Berlin 1932), seeking to unify art, craft and industry with function over ornament. Nazi pressure closed it in 1933; émigré architects carried its ideas into the International Style — thousands of them built Tel Aviv's White City, a UNESCO site since 2003.",
    seenAt: ['Dizengoff Square', 'Engel House', 'Liebling House'],
  },
  {
    term: 'International Style',
    category: 'style',
    definition:
      'Le Corbusier’s principles remade for the Mediterranean sun, strongly shaped by Bauhaus-trained émigrés — flat roofs, strip windows and rendered concrete, with pilotis for the sea breeze, smaller deep-set windows, deep balconies and brise-soleil for shade. The White City’s language.',
    seenAt: ['Engel House', 'Liebling House', 'Dizengoff Square'],
  },
  {
    term: 'Early Brutalist',
    category: 'style',
    definition:
      "Our name for the materially heavy 1950s modernism that leans toward Brutalism. Brutalism — from béton brut, 'raw concrete', tied to Le Corbusier and named by the critic Reyner Banham in 1955 — celebrates exposed unpainted concrete, blocky forms and expressed structure over decoration, growing out of postwar modernism.",
    seenAt: ['Agricultural Bank of Israel — Head Office'],
  },
  {
    term: 'Transitional building',
    category: 'style',
    definition:
      'A building caught between periods — modern massing still holding an Eclectic symmetry, or a colony house learning the 1930s. Proof that styles overlap rather than switch.',
    seenAt: ['Hemphel House', 'Roland Neef House', 'Nastissin House / “The Common House”'],
  },
  {
    term: 'Signal station',
    category: 'history',
    definition:
      "A rooftop or tower used by the pre-state Haganah to flash Morse and semaphore to outlying settlements. The Water Tower was Signal Station No. 1; the job later passed to the highest roofs.",
    seenAt: ['Haganah Water Tower', 'Guter House'],
  },
  {
    term: 'Adaptive reuse / conservation',
    category: 'history',
    definition:
      'Keeping a listed historic façade or structure while adding new building — the mechanism by which so much of the White City survives above altered, much-used ground floors.',
    seenAt: ['Beit Romanov', 'Hemphel House', 'Turret Building / Pensionnat Saint Joseph'],
  },
  {
    term: 'Templer colony',
    category: 'history',
    definition:
      'Sarona and its sister settlements, founded by German Templers from the 1870s as productive agricultural colonies — the pre-city landscape of wells, reservoirs and colony houses the modern city grew beside.',
    seenAt: ['Templer Storage Reservoir', 'Roland Neef House', 'Albrecht Aberle House'],
  },
  {
    term: 'Infrastructure',
    category: 'history',
    definition:
      "Not a style but a class we use for the city's working structures — water tower, power station, reservoir — where the engineering purpose, not an architectural manner, is the point.",
    seenAt: ['Haganah Water Tower', 'The First Power Station', 'Templer Storage Reservoir'],
  },
];

/** Grouped for display, in a stable category order. */
export const termCategoryOrder: TermCategory[] = ['style', 'construction', 'element', 'history'];

/**
 * The wider working vocabulary — the Architectural-Intelligence master glossary
 * (architectural-knowledge skill, database/master-glossary.jsonl). Definitions are the
 * skill's sourced editorial syntheses; `seenAt` is auto-matched against the collection,
 * so a term tied to no building we hold simply lists none. Curated building terms win on
 * any name clash. Regenerated by scratchpad/gen_dict.py — do not hand-edit this block.
 */
const glossaryTerms: Term[] = [
  {
    "term": "Abbey",
    "category": "element",
    "definition": "A monastic institution and its associated buildings governed by an abbot or abbess; the term may refer to the institution, church or complex.",
    "seenAt": []
  },
  {
    "term": "Absorption",
    "category": "construction",
    "definition": "Uptake of moisture by a material from its surroundings, including liquid water or water vapour depending on the process and context.",
    "seenAt": []
  },
  {
    "term": "Abutment",
    "category": "construction",
    "definition": "A support at the end of an arch or bridge that receives vertical reaction and horizontal thrust and transfers them to the ground or adjoining construction.",
    "seenAt": []
  },
  {
    "term": "Accessory dwelling unit",
    "category": "history",
    "definition": "A secondary, self-contained dwelling associated with a principal dwelling, often within or beside the main building. The term is primarily North American; legal definitions vary.",
    "seenAt": []
  },
  {
    "term": "Accessory structure",
    "category": "history",
    "definition": "A secondary structure on a site that is subordinate to the principal use or building, such as a detached garage or garden store; legal definitions vary.",
    "seenAt": []
  },
  {
    "term": "Adobe",
    "category": "construction",
    "definition": "Sun-dried earthen masonry units, commonly made from soil, water and fibre, laid in mortar or mud; the material and construction vary by region.",
    "seenAt": []
  },
  {
    "term": "Aftercare",
    "category": "history",
    "definition": "Post-handover support and review intended to help the client and occupants operate and understand the building, identify issues and assess performance.",
    "seenAt": []
  },
  {
    "term": "Aggregate",
    "category": "construction",
    "definition": "A granular material such as sand, gravel or crushed rock used as a constituent of concrete, mortar, roadstone or unbound fill. Its grading, particle shape, mineralogy and cleanliness affect the performance of the mix.",
    "seenAt": []
  },
  {
    "term": "Air barrier",
    "category": "construction",
    "definition": "A continuous layer or system intended to control uncontrolled air movement through the building envelope.",
    "seenAt": []
  },
  {
    "term": "Aisle",
    "category": "element",
    "definition": "A longitudinal passage or subsidiary space alongside the nave or choir, commonly separated by columns or piers.",
    "seenAt": []
  },
  {
    "term": "Alabaster",
    "category": "construction",
    "definition": "A fine-grained, pale, commonly translucent variety of gypsum used historically for carving and decorative work. It is relatively soft and must not be confused with calcitic marble.",
    "seenAt": []
  },
  {
    "term": "Almonry",
    "category": "element",
    "definition": "A room or building associated with distributing alms or charitable relief, often found within or near a medieval religious complex.",
    "seenAt": []
  },
  {
    "term": "Almshouse",
    "category": "history",
    "definition": "A charitable residential institution providing accommodation for people in need, often founded by a benefactor or religious organisation.",
    "seenAt": []
  },
  {
    "term": "Apse",
    "category": "element",
    "definition": "A semicircular or polygonal termination to a building or space, commonly vaulted or domed and frequently found at the liturgical east end of a church.",
    "seenAt": []
  },
  {
    "term": "Arcade",
    "category": "construction",
    "definition": "A succession of arches carried on piers or columns, forming a repeated architectural rhythm or covered passage.",
    "seenAt": [
      "Beit Dr. Alfes"
    ]
  },
  {
    "term": "Arch",
    "category": "construction",
    "definition": "A curved structural form spanning an opening and transferring loads primarily through compression towards its supports, which must resist the resulting reactions and thrust.",
    "seenAt": [
      "Beit Bialik",
      "Beit Awad",
      "The Great Synagogue",
      "Beit Dr. Alfes"
    ]
  },
  {
    "term": "Arch ring",
    "category": "construction",
    "definition": "The curved ring of masonry or other units forming the body of an arch, often composed of voussoirs.",
    "seenAt": []
  },
  {
    "term": "Architect",
    "category": "history",
    "definition": "A regulated or protected professional title in some jurisdictions, including the UK, where use of the title is legally protected. Roles and registration requirements vary internationally.",
    "seenAt": [
      "Brown–Rabinsky House",
      "Engel House",
      "Pagoda House",
      "Beit Bialik",
      "Haganah Water Tower",
      "Moshe Greidinger House / Pittman School"
    ]
  },
  {
    "term": "Architects Act 1997",
    "category": "history",
    "definition": "The UK legislation establishing the Architects Registration Board and the statutory framework for registration and protection of the title ‘architect’.",
    "seenAt": []
  },
  {
    "term": "Architects Code",
    "category": "history",
    "definition": "ARB’s statutory code setting the standards of conduct and practice expected of registered architects. The 2025 Code came into effect on 1 September 2025 and replaced the 2017 Code.",
    "seenAt": []
  },
  {
    "term": "Architects Register",
    "category": "history",
    "definition": "The statutory register maintained by ARB of individuals entitled to use the protected title ‘architect’ in the UK, subject to the statutory framework.",
    "seenAt": []
  },
  {
    "term": "Architects Registration Board (ARB)",
    "category": "history",
    "definition": "The UK statutory regulator for architects, responsible for maintaining the Architects Register, prescribing qualifications and setting standards of conduct and competence.",
    "seenAt": []
  },
  {
    "term": "Architectural Concept",
    "category": "history",
    "definition": "The design proposition developed in response to the Project Brief, expressing the principal architectural approach and forming the basis for subsequent design development and coordination.",
    "seenAt": []
  },
  {
    "term": "Architrave",
    "category": "element",
    "definition": "In classical architecture, the lowest horizontal member of an entablature above the columns; in common building usage, also a moulded surround to a door or window.",
    "seenAt": []
  },
  {
    "term": "Archivolt",
    "category": "construction",
    "definition": "A moulded or decorated band following the curve of an arch opening, often continuing the treatment of the arch ring.",
    "seenAt": []
  },
  {
    "term": "Art Nouveau",
    "category": "history",
    "definition": "An international late nineteenth- and early twentieth-century movement characterised in many contexts by flowing lines, organic motifs and integrated decorative arts.",
    "seenAt": []
  },
  {
    "term": "As-built drawing",
    "category": "history",
    "definition": "A drawing recording the constructed condition of a building or system after installation, ideally reflecting verified site changes rather than design intent alone.",
    "seenAt": []
  },
  {
    "term": "Ashlar",
    "category": "construction",
    "definition": "Masonry of carefully dressed blocks laid in regular courses with accurately worked beds and joints. Surface finishes may be smooth, tooled, rusticated or otherwise textured.",
    "seenAt": []
  },
  {
    "term": "Ashlar facing",
    "category": "construction",
    "definition": "A facing of dressed stone units applied or bonded to a backing construction; its structural role depends on the wall build-up and connections.",
    "seenAt": []
  },
  {
    "term": "Astragal",
    "category": "element",
    "definition": "A moulded or applied glazing profile or bar; in some Scottish building descriptions it is used for a timber glazing bar. Do not assume it is an exact synonym in every joinery context.",
    "seenAt": []
  },
  {
    "term": "Baluster",
    "category": "element",
    "definition": "An individual shaped upright support within a balustrade, commonly repeated at regular intervals.",
    "seenAt": []
  },
  {
    "term": "Balustrade",
    "category": "element",
    "definition": "A protective or decorative railing formed by a series of balusters supporting a handrail or coping.",
    "seenAt": [
      "Beit Oplatka"
    ]
  },
  {
    "term": "Bargeboard",
    "category": "element",
    "definition": "A board fixed along the projecting verge of a gable roof, often concealing rafter ends and sometimes elaborately carved or moulded.",
    "seenAt": []
  },
  {
    "term": "Baroque",
    "category": "history",
    "definition": "A broad early modern European artistic and architectural culture associated with dynamic spatial composition, movement, theatricality and integrated ornament.",
    "seenAt": []
  },
  {
    "term": "Barrel vault",
    "category": "construction",
    "definition": "A continuous vault formed by extending a single arch profile along a longitudinal axis.",
    "seenAt": []
  },
  {
    "term": "Basalt",
    "category": "construction",
    "definition": "A dark, fine-grained extrusive igneous rock, generally rich in iron- and magnesium-bearing minerals. It may occur as lava flows, dykes or other volcanic bodies and can be used as a building or paving stone.",
    "seenAt": []
  },
  {
    "term": "Base course",
    "category": "construction",
    "definition": "A lower course or band at the base of a wall or façade, sometimes differentiated in material, projection or finish.",
    "seenAt": []
  },
  {
    "term": "Baseboard / skirting board",
    "category": "element",
    "definition": "A finishing board or moulding at the junction of wall and floor, covering the edge of the floor finish and protecting the wall base. British term: skirting board.",
    "seenAt": []
  },
  {
    "term": "Basement",
    "category": "construction",
    "definition": "A storey or part-storey substantially below external ground level. Its relationship to grade varies around a sloping site.",
    "seenAt": [
      "Rubin Museum",
      "Beit Yerdani",
      "Hava Shapira House",
      "Beit Gross",
      "Beit Dr. Alfes"
    ]
  },
  {
    "term": "Batten",
    "category": "element",
    "definition": "A relatively small strip of timber or other material fixed to a supporting structure to receive roof tiles, slates, cladding or other components.",
    "seenAt": []
  },
  {
    "term": "Batter",
    "category": "construction",
    "definition": "A wall face that slopes inward as it rises, so the wall is thicker at the base than higher up.",
    "seenAt": []
  },
  {
    "term": "Battlement",
    "category": "element",
    "definition": "A defensive parapet with alternating raised sections (merlons) and gaps (crenels) from which defenders could observe or fire.",
    "seenAt": []
  },
  {
    "term": "Bay window",
    "category": "element",
    "definition": "A window assembly projecting from the main wall plane, creating an enlarged internal space and additional views. Its plan may be canted, curved or polygonal.",
    "seenAt": []
  },
  {
    "term": "Beam",
    "category": "construction",
    "definition": "A structural member designed primarily to span between supports and resist loads through bending, shear and associated actions.",
    "seenAt": []
  },
  {
    "term": "Beaux-Arts",
    "category": "history",
    "definition": "An academic architectural tradition associated with the École des Beaux-Arts, typically emphasising formal planning, axial composition, classical orders and rich sculptural ornament.",
    "seenAt": []
  },
  {
    "term": "Bedding plane",
    "category": "construction",
    "definition": "A surface separating successive beds or strata in sedimentary rock. In dimension stone, bedding orientation can influence splitting, block selection, durability and the direction in which a stone should be laid.",
    "seenAt": []
  },
  {
    "term": "Bedrock",
    "category": "construction",
    "definition": "The solid rock underlying soil, superficial deposits or other unconsolidated material. In site investigation it is distinguished from made ground, superficial deposits and weathered material.",
    "seenAt": []
  },
  {
    "term": "Bel étage",
    "category": "history",
    "definition": "A prestigious principal floor in certain European residential traditions, often raised above a service or ground floor; its exact level varies by country and period.",
    "seenAt": []
  },
  {
    "term": "Belt course",
    "category": "element",
    "definition": "A continuous horizontal band across a façade, usually projecting or differentiated in material or profile; often used to mark storeys or organise the elevation.",
    "seenAt": []
  },
  {
    "term": "Blind opening",
    "category": "construction",
    "definition": "A recessed or applied opening-like feature that is blocked or has no passage through the wall, used for composition or historical reference.",
    "seenAt": []
  },
  {
    "term": "Blocking",
    "category": "construction",
    "definition": "Short pieces of timber or other material inserted between structural members to provide restraint, support, fixing or load transfer.",
    "seenAt": []
  },
  {
    "term": "Blocking course",
    "category": "construction",
    "definition": "A plain course or low parapet above a cornice, often used to provide a finished top edge or conceal roof drainage.",
    "seenAt": []
  },
  {
    "term": "Board and batten",
    "category": "element",
    "definition": "A cladding arrangement using wide boards with narrower battens covering the joints between them; historically used in timber buildings and later revival styles.",
    "seenAt": []
  },
  {
    "term": "Bow window",
    "category": "element",
    "definition": "A curved projecting window or wall bay. Unlike a canted bay, its plan follows a smooth or segmented curve.",
    "seenAt": []
  },
  {
    "term": "Brace",
    "category": "construction",
    "definition": "A diagonal or otherwise inclined member used to stabilise a frame and resist lateral movement or deformation.",
    "seenAt": []
  },
  {
    "term": "Bracket",
    "category": "construction",
    "definition": "A projecting support fixed to a wall or other structure, carrying a shelf, canopy, beam or decorative element.",
    "seenAt": []
  },
  {
    "term": "Bridle joint",
    "category": "element",
    "definition": "A timber joint in which a slot or open mortise in one member receives the end of another, commonly used at frame corners or T-junctions.",
    "seenAt": []
  },
  {
    "term": "Brutalism",
    "category": "history",
    "definition": "A post-war architectural tendency associated with assertive massing, legible structure and material expression, often but not exclusively exposed concrete.",
    "seenAt": []
  },
  {
    "term": "Building Control",
    "category": "history",
    "definition": "The process of checking building work against applicable building regulations, through the relevant local authority or registered building control approver in England, or the relevant system elsewhere in the UK.",
    "seenAt": []
  },
  {
    "term": "Building designer",
    "category": "history",
    "definition": "A broad term for a person or organisation undertaking building design; it does not by itself establish professional registration or statutory competence.",
    "seenAt": []
  },
  {
    "term": "Building height",
    "category": "construction",
    "definition": "A measured vertical dimension of a building, defined from specified datum points to a specified roof or parapet point; planning rules determine the measurement method.",
    "seenAt": []
  },
  {
    "term": "Building inspector",
    "category": "history",
    "definition": "An officer or professional who inspects building work for compliance with relevant regulations or approvals; statutory roles vary by jurisdiction.",
    "seenAt": []
  },
  {
    "term": "Building permit",
    "category": "history",
    "definition": "A statutory approval authorising specified building work subject to applicable regulations; the process and terminology vary by jurisdiction.",
    "seenAt": [
      "Sheinkin 55"
    ]
  },
  {
    "term": "Building Regulations",
    "category": "history",
    "definition": "The statutory requirements governing building work in the relevant jurisdiction. In England, the Building Regulations 2010 (as amended) set functional requirements; other UK nations have their own regulatory regimes.",
    "seenAt": []
  },
  {
    "term": "Building section",
    "category": "history",
    "definition": "A drawing representing a vertical cut through a building to show spatial relationships, levels, construction and elements beyond the cut according to convention.",
    "seenAt": []
  },
  {
    "term": "Bulkhead",
    "category": "element",
    "definition": "A lowered or boxed enclosure beneath a ceiling, commonly concealing services, structure or changes in ceiling level; meaning varies by building type and region.",
    "seenAt": []
  },
  {
    "term": "Bungalow",
    "category": "element",
    "definition": "A dwelling type usually arranged predominantly on one storey, often with a low-pitched roof; regional meanings vary.",
    "seenAt": []
  },
  {
    "term": "Bungalow court",
    "category": "element",
    "definition": "A planned group of small dwellings arranged around a shared court or garden, especially associated with early twentieth-century western US housing.",
    "seenAt": []
  },
  {
    "term": "Buttress",
    "category": "construction",
    "definition": "A projecting mass or thickening built against a wall to stabilise it or resist lateral thrust from roofs, vaults or other structural elements.",
    "seenAt": []
  },
  {
    "term": "Caisson",
    "category": "construction",
    "definition": "A large-diameter foundation element or watertight chamber used in construction below water or in difficult ground conditions; exact meaning depends on foundation method.",
    "seenAt": []
  },
  {
    "term": "Canted bay",
    "category": "element",
    "definition": "A projecting bay with a flat front and angled returns, commonly forming a polygonal plan.",
    "seenAt": []
  },
  {
    "term": "Cantilever",
    "category": "construction",
    "definition": "A structural member or assembly projecting beyond its support, with the unsupported portion resisting loads through bending and shear.",
    "seenAt": []
  },
  {
    "term": "Capital",
    "category": "construction",
    "definition": "The crowning member of a column or pilaster, mediating between the shaft and the load or entablature above.",
    "seenAt": [
      "Beit Awad"
    ]
  },
  {
    "term": "Casement window",
    "category": "element",
    "definition": "A window with one or more opening leaves hinged to the frame, commonly side-hung in traditional British examples but also top-hung or bottom-hung.",
    "seenAt": []
  },
  {
    "term": "Casing",
    "category": "element",
    "definition": "The finished trim or lining around a door or window opening, often covering the joint between frame and wall finish; terminology varies regionally.",
    "seenAt": []
  },
  {
    "term": "Catch basin",
    "category": "construction",
    "definition": "A chamber or inlet that receives surface water runoff and may trap sediment or debris before water enters a drainage system; British terminology may use gully or catchpit depending on form.",
    "seenAt": []
  },
  {
    "term": "Cavity wall",
    "category": "construction",
    "definition": "A wall formed by two leaves separated by a cavity, often connected by wall ties and potentially containing insulation; actual build-ups vary by period and climate.",
    "seenAt": []
  },
  {
    "term": "CDM Regulations",
    "category": "history",
    "definition": "The Construction (Design and Management) Regulations 2015, applying in Great Britain, establish duties for clients, designers, principal designers, contractors and principal contractors to manage health and safety risks in construction projects.",
    "seenAt": []
  },
  {
    "term": "Cella",
    "category": "element",
    "definition": "The principal enclosed chamber of a classical temple, containing its cult image or principal sacred focus; often termed naos in Greek contexts.",
    "seenAt": []
  },
  {
    "term": "Chalk",
    "category": "construction",
    "definition": "A soft, fine-grained, usually white limestone composed predominantly of microscopic calcareous skeletal remains. It is a sedimentary building material in some regions but its softness and moisture behaviour constrain use.",
    "seenAt": []
  },
  {
    "term": "Chamfer",
    "category": "construction",
    "definition": "A bevelled surface formed by cutting off an arris or corner, commonly at an angle but sometimes with a shaped profile.",
    "seenAt": []
  },
  {
    "term": "Chancel",
    "category": "element",
    "definition": "The part of a church near the altar, typically east of the nave in traditional church planning; exact arrangement varies.",
    "seenAt": []
  },
  {
    "term": "Change order",
    "category": "history",
    "definition": "A formal instruction or agreement changing the scope, time, cost or other terms of a construction contract; legal effect depends on contract and jurisdiction.",
    "seenAt": []
  },
  {
    "term": "Chantry chapel",
    "category": "element",
    "definition": "A chapel endowed for the celebration of masses or prayers for a donor or family, commonly incorporated into a larger church.",
    "seenAt": []
  },
  {
    "term": "Chert",
    "category": "construction",
    "definition": "A very fine-grained, hard sedimentary rock composed mainly of silica. It occurs as nodules, bands or layers and is closely related to flint; its fracture is commonly conchoidal.",
    "seenAt": []
  },
  {
    "term": "Chimney pot",
    "category": "element",
    "definition": "A fitting placed at the top of a chimney flue, commonly ceramic or clay, to improve or protect the flue termination.",
    "seenAt": []
  },
  {
    "term": "Chimney stack",
    "category": "element",
    "definition": "The part of a chimney rising above a roof or wall and containing one or more flues.",
    "seenAt": []
  },
  {
    "term": "Choir",
    "category": "element",
    "definition": "The part of a church occupied by the choir, often within the eastern arm between nave and sanctuary; architectural arrangements vary.",
    "seenAt": []
  },
  {
    "term": "Cladding",
    "category": "element",
    "definition": "An external layer or system attached to a building to provide weather protection, appearance or other performance; it may or may not be load-bearing.",
    "seenAt": []
  },
  {
    "term": "Clerestory",
    "category": "element",
    "definition": "A high band of windows or openings above an adjoining roof or lower range, bringing light into the upper part of a space.",
    "seenAt": []
  },
  {
    "term": "Cloister",
    "category": "element",
    "definition": "A covered walkway, commonly arranged around a central courtyard, especially associated with monastic buildings.",
    "seenAt": []
  },
  {
    "term": "Close",
    "category": "element",
    "definition": "In Scottish urban terminology, a narrow shared passage or entrance route giving access to a common stair and dwellings within a tenement block.",
    "seenAt": []
  },
  {
    "term": "Closed-riser stair",
    "category": "element",
    "definition": "A stair with vertical riser boards closing the space between successive treads.",
    "seenAt": []
  },
  {
    "term": "Cob",
    "category": "construction",
    "definition": "A monolithic earthen walling material made from a workable mixture of clay-rich earth, aggregate and fibre such as straw, built in lifts or masses and allowed to dry.",
    "seenAt": []
  },
  {
    "term": "Coffered ceiling",
    "category": "element",
    "definition": "A ceiling articulated into a grid of recessed panels or coffers, often formed by intersecting beams or moulded members.",
    "seenAt": []
  },
  {
    "term": "Collegiate church",
    "category": "element",
    "definition": "A church served by a college or body of secular clergy, such as canons, rather than governed as a monastic house or cathedral seat.",
    "seenAt": []
  },
  {
    "term": "Colonial Revival",
    "category": "history",
    "definition": "A North American revival movement drawing on colonial-era domestic architecture, often reinterpreting symmetrical façades, classical details and traditional materials.",
    "seenAt": []
  },
  {
    "term": "Colonnade",
    "category": "history",
    "definition": "A row or sequence of columns, usually supporting an entablature or other horizontal structure, and often defining a covered route or edge to a space.",
    "seenAt": [
      "Beit HaTe'omim",
      "The Great Synagogue"
    ]
  },
  {
    "term": "Column",
    "category": "construction",
    "definition": "A generally vertical, freestanding support, commonly comprising base, shaft and capital in classical architecture.",
    "seenAt": [
      "Engel House",
      "Beit Bialik",
      "Beit Klein"
    ]
  },
  {
    "term": "Competence",
    "category": "history",
    "definition": "The knowledge, skill, experience and judgement needed to undertake a defined task or service to an appropriate standard. An architect should work within their competence and obtain suitable support where necessary.",
    "seenAt": []
  },
  {
    "term": "Composite order",
    "category": "element",
    "definition": "A Roman order combining features associated with Ionic volutes and Corinthian acanthus foliage in its capital.",
    "seenAt": []
  },
  {
    "term": "Conflict of Interest",
    "category": "history",
    "definition": "A situation in which personal, financial, professional or other interests could improperly influence, or appear to influence, professional judgement or duties to a client or the public.",
    "seenAt": []
  },
  {
    "term": "Conglomerate",
    "category": "construction",
    "definition": "A sedimentary rock composed of rounded rock fragments, generally larger than sand grains, held within a finer-grained matrix or cement. Some conglomerates have been used as building stone.",
    "seenAt": []
  },
  {
    "term": "Conservation Strategy",
    "category": "history",
    "definition": "A project approach identifying the significance of a place, the risks to its heritage values, and the principles and interventions that will guide its care, adaptation and change.",
    "seenAt": []
  },
  {
    "term": "Construction documents",
    "category": "history",
    "definition": "The coordinated drawings, schedules and specifications used to describe the work for pricing, approval and construction; the exact package varies by contract and jurisdiction.",
    "seenAt": []
  },
  {
    "term": "Contractor’s Proposals",
    "category": "history",
    "definition": "The contractor’s response to the Employer’s Requirements in a design-and-build procurement, setting out how the contractor proposes to meet them, subject to the contract.",
    "seenAt": []
  },
  {
    "term": "Control joint",
    "category": "element",
    "definition": "A planned discontinuity or groove intended to encourage movement or cracking to occur at a controlled location in a material or assembly.",
    "seenAt": []
  },
  {
    "term": "Coping",
    "category": "construction",
    "definition": "A protective capping to the top of a wall or parapet, shaped and jointed to shed water and protect the wall core.",
    "seenAt": []
  },
  {
    "term": "Coping stone",
    "category": "construction",
    "definition": "An individual stone forming part of a protective coping to a wall or parapet.",
    "seenAt": []
  },
  {
    "term": "Corbel",
    "category": "construction",
    "definition": "A projecting block or course built into or against a wall to support a load or projection above; it may be structural or decorative.",
    "seenAt": []
  },
  {
    "term": "Corinthian order",
    "category": "element",
    "definition": "A classical order whose capital is characteristically decorated with acanthus leaves and volutes.",
    "seenAt": []
  },
  {
    "term": "Cornice",
    "category": "element",
    "definition": "A projecting moulded element crowning a wall, façade, room or classical entablature; exact profile and position depend on context.",
    "seenAt": [
      "Beit HaKadim (House of Jugs)",
      "Beit Klein",
      "Beit Oplatka"
    ]
  },
  {
    "term": "Cour d’honneur",
    "category": "history",
    "definition": "A formal entrance forecourt framed by the principal building and often flanking wings or ranges, creating an ordered arrival sequence.",
    "seenAt": []
  },
  {
    "term": "Coursed rubble",
    "category": "construction",
    "definition": "Rubble masonry arranged in approximate horizontal courses, although individual stones may be irregular in size and shape.",
    "seenAt": []
  },
  {
    "term": "Craftsman style",
    "category": "history",
    "definition": "A North American design movement and domestic architectural style associated with Arts and Crafts ideals, visible timber construction, broad eaves and crafted detailing.",
    "seenAt": []
  },
  {
    "term": "Crawl space",
    "category": "construction",
    "definition": "A shallow accessible or semi-accessible void beneath a floor, commonly used for ventilation, inspection or service distribution.",
    "seenAt": []
  },
  {
    "term": "Crenellation",
    "category": "element",
    "definition": "The pattern of merlons and crenels forming a battlemented parapet; the term is also used more broadly for the provision of battlements.",
    "seenAt": []
  },
  {
    "term": "Cresting",
    "category": "element",
    "definition": "An ornamental ridge feature, often metal or terracotta, fixed along the top of a roof or wall.",
    "seenAt": []
  },
  {
    "term": "Crowstepped gable",
    "category": "construction",
    "definition": "A gable whose sloping edges are formed as a sequence of steps in the masonry, often finished with copes or skew stones.",
    "seenAt": []
  },
  {
    "term": "Curtain wall",
    "category": "element",
    "definition": "A non-load-bearing external wall system, typically supported by the building frame and carrying its own weight and environmental loads back to the structure.",
    "seenAt": []
  },
  {
    "term": "Cutwater",
    "category": "element",
    "definition": "A pointed or shaped projection at the upstream or downstream face of a bridge pier, intended to divide the flow and reduce hydraulic impact.",
    "seenAt": []
  },
  {
    "term": "Dado",
    "category": "element",
    "definition": "The lower portion of an interior wall, often distinguished by panelling, a dado rail or a change of finish; in joinery, also the groove or recess receiving another member.",
    "seenAt": []
  },
  {
    "term": "Damp-proof course",
    "category": "construction",
    "definition": "A horizontal barrier intended to resist moisture rising through a wall by capillary action; materials and placement depend on construction type.",
    "seenAt": []
  },
  {
    "term": "Dentil",
    "category": "element",
    "definition": "A small rectangular block repeated in a closely spaced series, commonly forming part of a classical cornice.",
    "seenAt": []
  },
  {
    "term": "Design development",
    "category": "history",
    "definition": "A design stage in which the selected scheme is coordinated and developed in greater detail, including materials, systems, dimensions and consultant input.",
    "seenAt": []
  },
  {
    "term": "Design Responsibility Matrix",
    "category": "history",
    "definition": "A matrix identifying which party is responsible for design of specified building elements or systems, including interfaces and design portions delegated to specialist subcontractors.",
    "seenAt": []
  },
  {
    "term": "Desorption",
    "category": "construction",
    "definition": "Release of previously absorbed moisture from a material to its surroundings as environmental conditions change.",
    "seenAt": []
  },
  {
    "term": "Diminishing courses",
    "category": "element",
    "definition": "Roofing courses, often of slate, that reduce in size towards the ridge, commonly reflecting traditional practice and material economy.",
    "seenAt": []
  },
  {
    "term": "Door jamb",
    "category": "element",
    "definition": "The vertical sides of a door frame or opening, supporting or receiving the door assembly.",
    "seenAt": []
  },
  {
    "term": "Door leaf",
    "category": "element",
    "definition": "The movable panel or panels of a door that open within a frame.",
    "seenAt": []
  },
  {
    "term": "Doric order",
    "category": "element",
    "definition": "A classical columnar order characterised in Greek examples by a relatively plain capital and typically fluted shaft, with regional and historical variations.",
    "seenAt": []
  },
  {
    "term": "Dormer",
    "category": "element",
    "definition": "A structure projecting from a sloping roof and containing a window or other opening, typically with cheeks and its own roof. It is distinct from a rooflight set in the roof plane.",
    "seenAt": []
  },
  {
    "term": "Dovetail joint",
    "category": "element",
    "definition": "A mechanical timber joint formed by interlocking wedge-shaped projections (tails) and recesses (pins), commonly used at corners of drawers and carcass work.",
    "seenAt": []
  },
  {
    "term": "Downpipe",
    "category": "element",
    "definition": "A vertical pipe conveying rainwater from a gutter or hopper to a drainage point; also called a rainwater pipe.",
    "seenAt": []
  },
  {
    "term": "Downspout",
    "category": "construction",
    "definition": "A vertical pipe carrying rainwater from a gutter or outlet to ground drainage. British English usually uses 'downpipe' or 'rainwater pipe'.",
    "seenAt": []
  },
  {
    "term": "Draftsperson",
    "category": "history",
    "definition": "A person who prepares technical drawings and documentation; the role and professional responsibilities vary by jurisdiction and practice.",
    "seenAt": []
  },
  {
    "term": "Dressings",
    "category": "construction",
    "definition": "Worked stone or other durable material used to finish or articulate edges, corners and openings, including surrounds, quoins and sills.",
    "seenAt": [
      "Beit Dr. Alfes"
    ]
  },
  {
    "term": "Drip mould",
    "category": "construction",
    "definition": "A projecting moulding or groove arranged to interrupt water flow and throw rainwater clear of the wall surface.",
    "seenAt": []
  },
  {
    "term": "Duplex",
    "category": "element",
    "definition": "A dwelling or building arrangement with two principal residential units, or a dwelling arranged over two storeys in some North American usage. Context must be stated.",
    "seenAt": []
  },
  {
    "term": "Duty of Care",
    "category": "history",
    "definition": "A legal or professional obligation to exercise reasonable care in defined circumstances. The existence and scope of a duty depend on the facts, appointment and applicable law.",
    "seenAt": []
  },
  {
    "term": "Easement",
    "category": "construction",
    "definition": "A legal right for one party to use or restrict the use of another party's land for a defined purpose, such as access or services; meaning varies by jurisdiction.",
    "seenAt": []
  },
  {
    "term": "Eaves",
    "category": "element",
    "definition": "The lower edge of a roof where it meets or projects beyond the external wall; associated details may include soffit, fascia, gutter and ventilation.",
    "seenAt": []
  },
  {
    "term": "Elevation",
    "category": "history",
    "definition": "An orthographic drawing showing one face of a building or interior, describing vertical arrangement, openings, levels and visible materials.",
    "seenAt": [
      "Beit Mintz",
      "Beit Dr. Alfes"
    ]
  },
  {
    "term": "Embrasure",
    "category": "element",
    "definition": "An opening or recess in a wall, especially one formed to allow a window, door or defensive firing position within a thick wall.",
    "seenAt": []
  },
  {
    "term": "Employer’s Requirements",
    "category": "history",
    "definition": "In a design-and-build procurement context, the client’s requirements against which the contractor develops its proposals. Contractual meaning and sufficiency depend on the specific contract.",
    "seenAt": []
  },
  {
    "term": "Enfilade",
    "category": "history",
    "definition": "A sequence of rooms with doorways aligned along a common axis, creating a continuous view and route through the suite.",
    "seenAt": []
  },
  {
    "term": "Entablature",
    "category": "element",
    "definition": "The horizontal superstructure carried by columns or pilasters in classical architecture, conventionally comprising architrave, frieze and cornice.",
    "seenAt": []
  },
  {
    "term": "Expansion joint",
    "category": "element",
    "definition": "A deliberate separation in a building assembly that accommodates movement caused by temperature, moisture, shrinkage, settlement or other effects.",
    "seenAt": []
  },
  {
    "term": "Exterior insulation",
    "category": "construction",
    "definition": "Insulation installed to the external side of a wall construction, commonly as part of an external wall insulation or façade system. Performance depends on continuity, fixings and weathering layers.",
    "seenAt": []
  },
  {
    "term": "Extrados",
    "category": "construction",
    "definition": "The outer surface or back of an arch or vault, opposite the intrados.",
    "seenAt": []
  },
  {
    "term": "Facade",
    "category": "element",
    "definition": "The principal exterior face or composition of a building. In British English, 'façade' is standard; 'frontage' may refer more specifically to the building's relationship to a street.",
    "seenAt": []
  },
  {
    "term": "Fan vault",
    "category": "construction",
    "definition": "A late Gothic vault in which ribs spread from springing points in a fan-like arrangement, often forming conoid surfaces.",
    "seenAt": []
  },
  {
    "term": "Fanlight",
    "category": "element",
    "definition": "A glazed opening above a door, commonly semicircular with radiating glazing bars but also used for rectangular over-door glazing.",
    "seenAt": [
      "Beit Dr. Alfes"
    ]
  },
  {
    "term": "Fascia",
    "category": "element",
    "definition": "A broad horizontal band or board; on a traditional shopfront it commonly forms the signage zone above the display window. Also used for a roof-edge board.",
    "seenAt": []
  },
  {
    "term": "Fascia board",
    "category": "element",
    "definition": "A board fixed at the edge of the roof, commonly supporting or finishing the ends of rafters and providing a fixing for gutter brackets.",
    "seenAt": []
  },
  {
    "term": "Finger joint",
    "category": "element",
    "definition": "A joint made from a series of interlocking rectangular projections, used to join timber lengths or panels.",
    "seenAt": []
  },
  {
    "term": "Finial",
    "category": "element",
    "definition": "A crowning ornament placed at the apex or termination of a roof, gable, pinnacle or other architectural feature.",
    "seenAt": []
  },
  {
    "term": "Fire Safety Strategy",
    "category": "history",
    "definition": "A coordinated project strategy addressing fire prevention, means of escape, compartmentation, structural fire precautions, fire-service access, detection, alarm and firefighting provisions as relevant to the building and regulatory context.",
    "seenAt": []
  },
  {
    "term": "Fixed light",
    "category": "element",
    "definition": "A glazed window unit that does not open. 'Light' here means a glazed subdivision or pane, not a source of illumination.",
    "seenAt": []
  },
  {
    "term": "Flashing",
    "category": "element",
    "definition": "A weathering component, usually metal or a flexible membrane, installed at junctions and penetrations to prevent water ingress.",
    "seenAt": [
      "Haganah Water Tower"
    ]
  },
  {
    "term": "Fleche",
    "category": "element",
    "definition": "A slender spirelet or roof turret rising from a roof ridge, often timber-framed and sometimes functioning as a ventilator or bell feature.",
    "seenAt": []
  },
  {
    "term": "Flight",
    "category": "element",
    "definition": "An uninterrupted series of steps between landings or floor levels.",
    "seenAt": []
  },
  {
    "term": "Flint",
    "category": "construction",
    "definition": "A hard, compact, fine-grained form of silica occurring commonly as nodules in chalk and other sedimentary deposits. It has been widely used in historic walling, often as whole or knapped pieces with distinctive jointing and bonding techniques.",
    "seenAt": []
  },
  {
    "term": "Floor area ratio (FAR)",
    "category": "construction",
    "definition": "A planning measure comparing a building's counted floor area with the area of its site; definitions and exclusions are jurisdiction-specific.",
    "seenAt": []
  },
  {
    "term": "Floor plan",
    "category": "history",
    "definition": "An orthographic drawing of a building or space, conventionally represented as a horizontal cut through the building with elements below or beyond shown according to drawing convention.",
    "seenAt": []
  },
  {
    "term": "Flying buttress",
    "category": "construction",
    "definition": "An external arched strut transmitting lateral thrust from a high wall or vault across an open space to an outer buttress pier.",
    "seenAt": []
  },
  {
    "term": "Folly",
    "category": "element",
    "definition": "A decorative or picturesque garden structure, often built to resemble a ruin, tower, temple or other architectural form and not primarily for practical use.",
    "seenAt": []
  },
  {
    "term": "Footing",
    "category": "construction",
    "definition": "The widened or otherwise shaped base of a foundation that spreads structural loads into the supporting ground.",
    "seenAt": []
  },
  {
    "term": "Forge",
    "category": "history",
    "definition": "A workshop or industrial space where metal is heated and shaped by hammering or pressing.",
    "seenAt": []
  },
  {
    "term": "Foundry",
    "category": "history",
    "definition": "An industrial building or facility where metal is melted and cast into moulds to produce components or objects.",
    "seenAt": []
  },
  {
    "term": "French drain",
    "category": "construction",
    "definition": "A trench filled with permeable aggregate, usually containing a perforated pipe, intended to collect and convey groundwater or surface water away from an area.",
    "seenAt": []
  },
  {
    "term": "Fresco",
    "category": "construction",
    "definition": "A wall-painting technique in which pigments are applied to fresh lime plaster so that colour becomes integrated with the plaster surface as it carbonates; distinguish true buon fresco from other wall-painting methods.",
    "seenAt": []
  },
  {
    "term": "Friary",
    "category": "element",
    "definition": "A religious house occupied by friars, commonly associated with mendicant orders and often located in towns.",
    "seenAt": []
  },
  {
    "term": "Frieze",
    "category": "element",
    "definition": "The middle horizontal zone of a classical entablature between architrave and cornice, sometimes plain, sculpted or ornamented.",
    "seenAt": []
  },
  {
    "term": "Gable",
    "category": "construction",
    "definition": "The upper part of an end wall beneath a pitched roof, commonly triangular but also found in stepped, curved or other shaped forms.",
    "seenAt": []
  },
  {
    "term": "Gable end",
    "category": "element",
    "definition": "The triangular or shaped upper portion of an end wall beneath a pitched roof, or the end wall itself where the roof profile is expressed.",
    "seenAt": []
  },
  {
    "term": "Gable roof",
    "category": "element",
    "definition": "A roof with two sloping planes meeting at a ridge and vertical gable ends at each end.",
    "seenAt": []
  },
  {
    "term": "General contractor",
    "category": "history",
    "definition": "A contractor responsible for managing and delivering construction work under a contract; British equivalents may include main contractor or principal contractor, depending on role and statutory context.",
    "seenAt": []
  },
  {
    "term": "Girder",
    "category": "construction",
    "definition": "A principal beam that supports other beams, joists or structural members and transfers their loads to columns, walls or other supports.",
    "seenAt": []
  },
  {
    "term": "Glazing bar",
    "category": "element",
    "definition": "A slender member dividing a sash or casement into smaller panes and, in traditional joinery, often supporting the glass edges.",
    "seenAt": []
  },
  {
    "term": "Gothic Revival",
    "category": "history",
    "definition": "A nineteenth-century revival of medieval Gothic forms and constructional language, ranging from scholarly historicism to eclectic reinterpretation.",
    "seenAt": []
  },
  {
    "term": "Grade beam",
    "category": "construction",
    "definition": "A reinforced concrete beam at or near ground level that spans between foundations or piles and supports walls or other loads.",
    "seenAt": []
  },
  {
    "term": "Grading",
    "category": "construction",
    "definition": "The shaping and levelling of land to establish falls, levels and drainage patterns around a building or site.",
    "seenAt": []
  },
  {
    "term": "Granary",
    "category": "element",
    "definition": "A building for storing grain, often raised or ventilated to reduce damp and pest damage; forms vary by region and period.",
    "seenAt": []
  },
  {
    "term": "Granite",
    "category": "construction",
    "definition": "A coarse-crystalline intrusive igneous rock composed chiefly of quartz and feldspar, commonly with mica or other dark minerals. Its mineral composition, grain size, jointing and weathering characteristics vary by source.",
    "seenAt": []
  },
  {
    "term": "Graving dock",
    "category": "element",
    "definition": "A dry dock that can be drained to expose a vessel's hull for construction, inspection or repair.",
    "seenAt": []
  },
  {
    "term": "Greensand",
    "category": "construction",
    "definition": "A sandstone containing the green mineral glauconite, which gives it a characteristic greenish to brown appearance. It has been used as a building stone in parts of southern England.",
    "seenAt": []
  },
  {
    "term": "Groin vault",
    "category": "construction",
    "definition": "A vault formed by the intersection of two barrel vaults, creating diagonal groins at their intersections.",
    "seenAt": []
  },
  {
    "term": "Grotto",
    "category": "element",
    "definition": "An artificial or natural cave-like garden feature, often decorated with shells, minerals or rustic materials and designed as a picturesque retreat.",
    "seenAt": []
  },
  {
    "term": "Guardrail",
    "category": "element",
    "definition": "A protective barrier at an open edge, intended to reduce the risk of falling. It may comprise posts, rails, infill panels or balusters.",
    "seenAt": []
  },
  {
    "term": "Gutter",
    "category": "element",
    "definition": "A channel at the roof edge or within the roof that collects rainwater and conveys it to an outlet or downpipe.",
    "seenAt": []
  },
  {
    "term": "Half-hipped roof",
    "category": "element",
    "definition": "A roof form in which the gable end is partly clipped by a small sloping hip near the ridge or upper part of the roof.",
    "seenAt": []
  },
  {
    "term": "Handrail",
    "category": "element",
    "definition": "A rail intended to be grasped for support or guidance, commonly fixed along a stair or ramp and sometimes integrated with a guardrail.",
    "seenAt": [
      "Beit Dr. Alfes"
    ]
  },
  {
    "term": "Harl / harling",
    "category": "construction",
    "definition": "A Scottish rough exterior coating applied to masonry, traditionally using lime and aggregate. Historic and contemporary mixes and application methods vary.",
    "seenAt": []
  },
  {
    "term": "Head",
    "category": "element",
    "definition": "The upper horizontal boundary or member of a door or window opening; may be formed by a lintel, arch or framed construction.",
    "seenAt": [
      "Beit Ha'ir",
      "Agricultural Bank of Israel — Head Office"
    ]
  },
  {
    "term": "Header",
    "category": "construction",
    "definition": "A horizontal structural member spanning an opening or supporting framing above it. In North American construction usage, the term often refers to a framed opening member; British usage more commonly specifies lintel.",
    "seenAt": []
  },
  {
    "term": "Hip",
    "category": "element",
    "definition": "The external angle or sloping junction formed where two roof planes meet, commonly running from ridge towards an eaves corner.",
    "seenAt": []
  },
  {
    "term": "Hipped roof",
    "category": "element",
    "definition": "A roof with sloping planes at the ends as well as the sides, so it has no vertical gable end at those ends.",
    "seenAt": []
  },
  {
    "term": "Historic overlay",
    "category": "history",
    "definition": "A planning designation or additional regulatory layer applying special controls to a defined historic area or property; terminology and legal effect vary by jurisdiction.",
    "seenAt": []
  },
  {
    "term": "Hood mould",
    "category": "construction",
    "definition": "A projecting moulding above an arch or lintel, intended to throw rainwater clear of the opening and often serving a decorative role.",
    "seenAt": []
  },
  {
    "term": "Hygrothermal behaviour",
    "category": "construction",
    "definition": "The coupled movement and storage of heat and moisture within building materials and assemblies, influenced by material properties and indoor and outdoor environmental conditions.",
    "seenAt": []
  },
  {
    "term": "Impervious surface",
    "category": "construction",
    "definition": "A surface that substantially prevents water infiltration into the ground, such as many roofs, paving and sealed hard landscape surfaces.",
    "seenAt": []
  },
  {
    "term": "Impost",
    "category": "construction",
    "definition": "A projecting or moulded block or course at the top of a pier or jamb from which an arch springs.",
    "seenAt": []
  },
  {
    "term": "Inclusive Design",
    "category": "history",
    "definition": "An approach to designing environments, buildings and services so that they can be accessed, understood and used by as many people as reasonably possible, considering diverse needs and abilities.",
    "seenAt": []
  },
  {
    "term": "Information Exchange",
    "category": "history",
    "definition": "A defined transfer of project information at an agreed point, with its purpose, content, format, responsibility and required level of information established for the project.",
    "seenAt": []
  },
  {
    "term": "Intrados",
    "category": "construction",
    "definition": "The inner surface or soffit of an arch or vault.",
    "seenAt": []
  },
  {
    "term": "Ionic order",
    "category": "element",
    "definition": "A classical order recognised by volute forms at the capital, with proportions and details varying between Greek and Roman traditions.",
    "seenAt": []
  },
  {
    "term": "Italianate",
    "category": "history",
    "definition": "A nineteenth-century revival style drawing on Italian Renaissance and vernacular forms, often using bracketed eaves, shallow hipped roofs and round-headed openings.",
    "seenAt": []
  },
  {
    "term": "Jamb",
    "category": "element",
    "definition": "The vertical side surface or member forming an opening in a wall, door or window assembly. It may be masonry, timber, metal or a combination.",
    "seenAt": []
  },
  {
    "term": "Joist",
    "category": "construction",
    "definition": "A repeated horizontal or near-horizontal member supporting a floor or ceiling deck and transferring loads to beams or walls.",
    "seenAt": []
  },
  {
    "term": "Keep",
    "category": "element",
    "definition": "The principal fortified tower or stronghold within a castle, often serving as a defensive and residential focus.",
    "seenAt": [
      "Moshe Greidinger House / Pittman School",
      "Shilman House"
    ]
  },
  {
    "term": "Keystone",
    "category": "construction",
    "definition": "The central voussoir at the crown of an arch, sometimes enlarged or ornamented but not necessarily visually distinct.",
    "seenAt": []
  },
  {
    "term": "Kneeler",
    "category": "construction",
    "definition": "A shaped stone at the lower end of a gable coping or skew, often projecting beyond the wall face and sometimes moulded or carved.",
    "seenAt": []
  },
  {
    "term": "Laminated veneer lumber (LVL)",
    "category": "construction",
    "definition": "An engineered timber product made by bonding thin wood veneers with their grain predominantly aligned, producing a structural member with relatively consistent properties.",
    "seenAt": []
  },
  {
    "term": "Lancet window",
    "category": "element",
    "definition": "A tall, narrow window with a pointed head, especially associated with Early English Gothic architecture.",
    "seenAt": []
  },
  {
    "term": "Lantern",
    "category": "element",
    "definition": "A raised roof structure with glazed or open sides that admits light or air to the space below; distinguish a roof lantern from a cupola or tower.",
    "seenAt": []
  },
  {
    "term": "Lantern roof",
    "category": "element",
    "definition": "A raised roof structure or glazed enclosure set above a roof or central space to admit daylight; related to but not identical with a cupola.",
    "seenAt": []
  },
  {
    "term": "Lap joint",
    "category": "element",
    "definition": "A joint in which two members overlap, with material sometimes removed from one or both to keep the faces flush.",
    "seenAt": []
  },
  {
    "term": "Lean-to roof",
    "category": "element",
    "definition": "A single-slope roof abutting a higher wall or structure.",
    "seenAt": []
  },
  {
    "term": "Limestone",
    "category": "construction",
    "definition": "A sedimentary carbonate rock composed predominantly of calcium carbonate, commonly derived from accumulated skeletal material or chemical precipitation. Its texture, fossil content, porosity and mineral composition vary widely.",
    "seenAt": []
  },
  {
    "term": "Lintel",
    "category": "construction",
    "definition": "A horizontal structural member spanning an opening and supporting construction above it; materials include stone, timber, steel and reinforced concrete.",
    "seenAt": []
  },
  {
    "term": "Load-bearing wall",
    "category": "construction",
    "definition": "A wall that carries loads from floors, roofs or other construction above and transfers them to supports or foundations.",
    "seenAt": []
  },
  {
    "term": "Loggia",
    "category": "history",
    "definition": "A covered external gallery or room-like space open to the exterior on one or more sides, often articulated by arches or columns.",
    "seenAt": [
      "Beit Dr. Alfes"
    ]
  },
  {
    "term": "Lot coverage",
    "category": "construction",
    "definition": "The proportion or area of a plot covered by building footprints, as defined by the relevant planning or zoning rules.",
    "seenAt": []
  },
  {
    "term": "Louvre",
    "category": "element",
    "definition": "An assembly of angled slats or blades that admits air or light while limiting direct rain, sun or views.",
    "seenAt": []
  },
  {
    "term": "Maisonette",
    "category": "element",
    "definition": "A dwelling arranged over more than one storey within a larger building, often with its own entrance; British usage differs from some continental meanings.",
    "seenAt": []
  },
  {
    "term": "Maltings",
    "category": "element",
    "definition": "Buildings used for malting grain, including steeping, germination and kilning spaces, often associated with breweries and distilleries.",
    "seenAt": []
  },
  {
    "term": "Manor house",
    "category": "element",
    "definition": "The principal residence associated with a manor or estate, historically linked to the landholding and administration of the manor.",
    "seenAt": []
  },
  {
    "term": "Mansard roof",
    "category": "element",
    "definition": "A roof with two pitches on each side, the lower slope steeper than the upper, often creating usable accommodation within the roof volume.",
    "seenAt": []
  },
  {
    "term": "Marble",
    "category": "construction",
    "definition": "A carbonate rock that has undergone metamorphism and recrystallisation, usually derived from limestone or dolostone. In commercial stone usage the term may be applied more loosely to decorative carbonate stones.",
    "seenAt": [
      "Turret Building / Pensionnat Saint Joseph"
    ]
  },
  {
    "term": "Margin",
    "category": "construction",
    "definition": "A dressed border or framing around an opening or masonry panel; in some British architectural descriptions the collective term may refer to the sill, jambs and lintel around an opening.",
    "seenAt": []
  },
  {
    "term": "Martello tower",
    "category": "element",
    "definition": "A squat, usually circular coastal defensive tower developed in the late eighteenth and early nineteenth centuries, often armed with artillery on its roof.",
    "seenAt": []
  },
  {
    "term": "Mashrabiya",
    "category": "element",
    "definition": "A projecting or recessed lattice screen, traditionally often timber, used in parts of the Arab world for privacy, filtered light and ventilation. Regional forms and terms vary.",
    "seenAt": []
  },
  {
    "term": "Masonry",
    "category": "construction",
    "definition": "Construction formed from individual units such as stone, brick or block, typically bonded with mortar or another bedding system.",
    "seenAt": [
      "Brown–Rabinsky House",
      "Beit Mann",
      "Berlin House",
      "Ohel Moed Synagogue",
      "Beit Awad",
      "The Great Synagogue"
    ]
  },
  {
    "term": "Mass timber",
    "category": "construction",
    "definition": "An umbrella term for engineered solid-wood structural products and systems, including cross-laminated timber and glue-laminated timber.",
    "seenAt": []
  },
  {
    "term": "Material compatibility",
    "category": "construction",
    "definition": "The degree to which a proposed repair or replacement material is physically, chemically and mechanically suitable for use with the existing building fabric over the intended service life.",
    "seenAt": []
  },
  {
    "term": "Mausoleum",
    "category": "element",
    "definition": "A monumental tomb building for an individual or family, often containing one or more burial chambers.",
    "seenAt": []
  },
  {
    "term": "Meeting rail",
    "category": "element",
    "definition": "The horizontal rail at which the upper and lower sashes of a vertically sliding sash window meet and close against one another.",
    "seenAt": []
  },
  {
    "term": "MEP engineer",
    "category": "history",
    "definition": "A building-services engineer working across mechanical, electrical and public-health systems; British practice often distinguishes building services engineering disciplines.",
    "seenAt": []
  },
  {
    "term": "Mews",
    "category": "element",
    "definition": "A British urban building type or street historically associated with stables and coach houses, often later converted to residential use.",
    "seenAt": []
  },
  {
    "term": "Minaret",
    "category": "element",
    "definition": "A tower associated with a mosque, traditionally used for the call to prayer and often articulated with one or more balconies.",
    "seenAt": []
  },
  {
    "term": "Minster",
    "category": "element",
    "definition": "A historical title applied to certain important churches in Britain, often associated with a large parish, collegiate or missionary role; it is not a precise architectural form.",
    "seenAt": []
  },
  {
    "term": "Modillion",
    "category": "element",
    "definition": "A projecting ornamental bracket or block, often repeated beneath the corona of a classical cornice.",
    "seenAt": []
  },
  {
    "term": "Moisture transport",
    "category": "construction",
    "definition": "Movement of moisture through building fabric in liquid and vapour forms, driven by mechanisms including capillary action, vapour-pressure differences and air movement. The dominant mechanism depends on material and boundary conditions.",
    "seenAt": []
  },
  {
    "term": "Monastery",
    "category": "element",
    "definition": "A complex of buildings occupied by a community of monks or nuns, typically including spaces for worship, accommodation, work, dining and communal life.",
    "seenAt": []
  },
  {
    "term": "Moorish arch",
    "category": "element",
    "definition": "A broad descriptive label for arch forms associated with western Islamic architecture, including horseshoe and related profiles; the term should be replaced by a more precise regional/formal name where possible.",
    "seenAt": []
  },
  {
    "term": "Mortar",
    "category": "construction",
    "definition": "A workable mix used to bed, bond or point masonry, commonly comprising binder, aggregate and water. Binder and aggregate selection should suit the masonry and exposure.",
    "seenAt": []
  },
  {
    "term": "Mortise and tenon joint",
    "category": "element",
    "definition": "A timber joint in which a projecting tenon on one member fits into a mortise cut in another; it may be wedged, pegged, glued or otherwise secured.",
    "seenAt": []
  },
  {
    "term": "Motte-and-bailey",
    "category": "element",
    "definition": "A medieval fortification comprising an elevated earthwork mound (motte) and an adjoining enclosed courtyard (bailey), often initially timber-built.",
    "seenAt": []
  },
  {
    "term": "Mullion",
    "category": "element",
    "definition": "A vertical member dividing a window opening into separate lights or bays. It may be stone, timber, metal or another material and is not inherently structural in every system.",
    "seenAt": []
  },
  {
    "term": "Muntin",
    "category": "element",
    "definition": "A slender vertical or horizontal member subdividing a framed panel or glazed assembly; usage varies by joinery tradition and should be distinguished from mullion.",
    "seenAt": []
  },
  {
    "term": "Narthex",
    "category": "element",
    "definition": "An entrance vestibule or transitional space at the west end of a church, preceding the nave; its form and use vary by tradition.",
    "seenAt": []
  },
  {
    "term": "Nave",
    "category": "element",
    "definition": "The principal longitudinal space of a church, generally used by the congregation and usually extending west of the crossing or chancel.",
    "seenAt": []
  },
  {
    "term": "Neoclassical",
    "category": "history",
    "definition": "A broad revival and reinterpretation of ancient Greek and Roman architecture, often emphasising symmetry, clear geometry, proportion and classical orders.",
    "seenAt": []
  },
  {
    "term": "Neoclassicism",
    "category": "history",
    "definition": "A movement reviving and reinterpreting classical Greek and Roman forms, often emphasising symmetry, proportion, restraint and archaeological reference.",
    "seenAt": []
  },
  {
    "term": "Newel post",
    "category": "element",
    "definition": "A substantial upright post at the top, bottom or turn of a stair, supporting or terminating the handrail and balustrade.",
    "seenAt": []
  },
  {
    "term": "Niche",
    "category": "construction",
    "definition": "A recess formed in a wall, commonly intended to contain a sculpture, object or display.",
    "seenAt": []
  },
  {
    "term": "Non-load-bearing wall",
    "category": "construction",
    "definition": "A wall that does not carry floor or roof loads from the structure above, although it may support its own weight and resist lateral actions.",
    "seenAt": []
  },
  {
    "term": "Oculus",
    "category": "element",
    "definition": "A circular opening, often in a wall, dome or roof; it may be glazed or open.",
    "seenAt": []
  },
  {
    "term": "Ogee",
    "category": "element",
    "definition": "A double-curved profile formed by a convex curve flowing into a concave curve, commonly used in mouldings and arches.",
    "seenAt": []
  },
  {
    "term": "Open-riser stair",
    "category": "element",
    "definition": "A stair in which the vertical space between successive treads is left open rather than closed by riser boards.",
    "seenAt": []
  },
  {
    "term": "Oriel",
    "category": "element",
    "definition": "A projecting upper-storey window or bay that does not extend to the ground, commonly supported by corbels, brackets or cantilevered construction.",
    "seenAt": []
  },
  {
    "term": "Outshot",
    "category": "element",
    "definition": "A subsidiary rear or side projection, often lower than the main building and sometimes containing service accommodation or circulation.",
    "seenAt": []
  },
  {
    "term": "Parapet",
    "category": "construction",
    "definition": "A low protective wall or barrier at the edge of a roof, terrace, bridge or balcony. It may be solid, open or balustraded.",
    "seenAt": [
      "Dizengoff Square",
      "Beit Yerdani",
      "Beit Shmuel David",
      "Beit Dr. Alfes"
    ]
  },
  {
    "term": "Parting bead",
    "category": "element",
    "definition": "A narrow bead within a sash case that separates the channels or tracks of the upper and lower sashes.",
    "seenAt": []
  },
  {
    "term": "Partition wall",
    "category": "element",
    "definition": "An internal wall dividing spaces; it may be non-load-bearing or, in some systems, contribute structurally.",
    "seenAt": []
  },
  {
    "term": "Pavilion roof",
    "category": "element",
    "definition": "A roof form hipped on all sides, commonly used over a square or near-square plan.",
    "seenAt": []
  },
  {
    "term": "Pediment",
    "category": "element",
    "definition": "A gable-like feature above a portico, façade, door or window, typically triangular but also segmental, broken or otherwise modified.",
    "seenAt": []
  },
  {
    "term": "Pele tower",
    "category": "element",
    "definition": "A small fortified tower house found particularly in the Anglo-Scottish border regions, built for defence and refuge.",
    "seenAt": []
  },
  {
    "term": "Peristyle",
    "category": "element",
    "definition": "A continuous colonnade surrounding a building, temple or courtyard; in classical temple terminology it can refer to the external colonnade around the cella.",
    "seenAt": []
  },
  {
    "term": "Permeability",
    "category": "construction",
    "definition": "A material property describing the ease with which a fluid or vapour can pass through a material under a defined driving force. The relevant form—water, water vapour or air—must be stated.",
    "seenAt": []
  },
  {
    "term": "Piano nobile",
    "category": "history",
    "definition": "The principal or ceremonially important floor of a palazzo or grand residence, commonly above the ground floor and often taller or more richly treated.",
    "seenAt": []
  },
  {
    "term": "Picture rail",
    "category": "element",
    "definition": "A moulding fixed high on an interior wall from which pictures may be hung, traditionally avoiding the need to drive fixings into the wall surface.",
    "seenAt": []
  },
  {
    "term": "Pier",
    "category": "construction",
    "definition": "A substantial vertical support, generally of masonry, concrete or another material, carrying arches, beams or other structural elements; distinguish bridge pier from wall pier and column.",
    "seenAt": []
  },
  {
    "term": "Pilaster",
    "category": "element",
    "definition": "A shallow, rectangular vertical projection from a wall, articulated like a column with base, shaft and capital in classical usage.",
    "seenAt": [
      "Beit Awad"
    ]
  },
  {
    "term": "Pile foundation",
    "category": "construction",
    "definition": "A deep foundation element transferring loads to deeper soil or rock through end bearing, shaft resistance or a combination of mechanisms.",
    "seenAt": []
  },
  {
    "term": "Pitched roof",
    "category": "element",
    "definition": "A roof formed by one or more sloping planes designed to shed water, with geometry described by pitch, span, ridge, hips and valleys.",
    "seenAt": []
  },
  {
    "term": "Plan for Use",
    "category": "history",
    "definition": "A project strategy concerned with preparing for the building’s operation, occupation, management and evaluation, connecting design decisions to performance in use.",
    "seenAt": []
  },
  {
    "term": "Plat band",
    "category": "construction",
    "definition": "A relatively shallow, flat projecting band or string, often used to articulate storeys or façade zones.",
    "seenAt": []
  },
  {
    "term": "Plinth",
    "category": "construction",
    "definition": "A projecting or visually differentiated base supporting a wall, column, pier or building, often protecting the lower wall from impact or splashback.",
    "seenAt": []
  },
  {
    "term": "Pointed arch",
    "category": "construction",
    "definition": "An arch formed by two curved arcs meeting at an apex, associated particularly with Gothic architecture but used in other periods and traditions.",
    "seenAt": []
  },
  {
    "term": "Pointing",
    "category": "construction",
    "definition": "The mortar placed and finished in the exposed joints of masonry; the term also describes the operation and profile of finishing those joints.",
    "seenAt": []
  },
  {
    "term": "Portico",
    "category": "element",
    "definition": "A porch or entrance structure formed as a colonnade, usually supporting an entablature and sometimes a pediment.",
    "seenAt": []
  },
  {
    "term": "Post",
    "category": "construction",
    "definition": "A vertical structural member carrying loads from beams, trusses or other elements to a support or foundation.",
    "seenAt": [
      "Roland Neef House",
      "Albrecht Aberle House"
    ]
  },
  {
    "term": "Post and beam",
    "category": "construction",
    "definition": "A structural arrangement in which vertical posts support horizontal beams, with loads transferred through the frame to foundations.",
    "seenAt": []
  },
  {
    "term": "Post-Occupancy Evaluation (POE)",
    "category": "history",
    "definition": "A structured evaluation of a building after occupation, examining how it performs for users and against intended outcomes, including operational, environmental and experiential aspects.",
    "seenAt": []
  },
  {
    "term": "Practical Completion",
    "category": "history",
    "definition": "A contractual milestone generally indicating that the works have reached the state defined by the building contract for handover, subject to any permitted outstanding items. It is not a universal statutory certificate.",
    "seenAt": []
  },
  {
    "term": "Principal Contractor (CDM)",
    "category": "history",
    "definition": "The contractor appointed by the client under CDM 2015 to plan, manage, monitor and coordinate the construction phase where more than one contractor is involved.",
    "seenAt": []
  },
  {
    "term": "Principal Designer (CDM)",
    "category": "history",
    "definition": "The designer appointed by the client under CDM 2015 to plan, manage, monitor and coordinate health and safety during the pre-construction phase. This statutory CDM role is not automatically identical to the lead designer or architect.",
    "seenAt": []
  },
  {
    "term": "Priory",
    "category": "element",
    "definition": "A religious house governed by a prior or prioress, sometimes subordinate to an abbey and sometimes independent.",
    "seenAt": []
  },
  {
    "term": "Procurement Strategy",
    "category": "history",
    "definition": "The project’s approach to selecting and appointing the parties who will design, manufacture, construct and deliver the building, and to allocating risk and responsibility.",
    "seenAt": []
  },
  {
    "term": "Professional Indemnity Insurance (PII)",
    "category": "history",
    "definition": "Insurance intended to respond to claims arising from professional services, subject to policy wording, exclusions, limits and notification requirements. It is not the same as public liability insurance.",
    "seenAt": []
  },
  {
    "term": "Project Brief",
    "category": "history",
    "definition": "The documented statement of client requirements, project outcomes, quality aspirations, spatial requirements, constraints and other criteria against which the design is developed.",
    "seenAt": []
  },
  {
    "term": "Project Strategies",
    "category": "history",
    "definition": "Coordinated approaches to matters such as conservation, cost, fire safety, health and safety, inclusive design, planning, procurement, sustainability and use, developed at appropriate project stages.",
    "seenAt": []
  },
  {
    "term": "Pronaos",
    "category": "element",
    "definition": "The porch or vestibule in front of the naos or cella of a classical temple, often defined by columns.",
    "seenAt": []
  },
  {
    "term": "Property line",
    "category": "construction",
    "definition": "The legally defined boundary of a parcel of land; it should not be assumed to coincide with fences, walls or visible occupation lines.",
    "seenAt": []
  },
  {
    "term": "Pulley stile",
    "category": "element",
    "definition": "The vertical side member of a sash box in which the sash pulleys are fitted.",
    "seenAt": []
  },
  {
    "term": "Punch list",
    "category": "history",
    "definition": "A list of incomplete, defective or outstanding items identified near completion for correction or close-out. British practice often uses snagging list.",
    "seenAt": []
  },
  {
    "term": "Purlin",
    "category": "element",
    "definition": "A longitudinal roof member running parallel to the ridge and supporting rafters or roof sheeting at intermediate positions.",
    "seenAt": []
  },
  {
    "term": "Quartzite",
    "category": "construction",
    "definition": "A hard metamorphic rock consisting predominantly of interlocking quartz grains, commonly formed by metamorphism of sandstone. It is generally more tightly recrystallised than a quartz-cemented sandstone.",
    "seenAt": []
  },
  {
    "term": "Quire",
    "category": "element",
    "definition": "An alternative spelling of choir, especially in historical church descriptions; may refer to the choir space or stalls.",
    "seenAt": []
  },
  {
    "term": "Quoin",
    "category": "construction",
    "definition": "A dressed or otherwise differentiated stone or masonry unit at the external corner of a building or wall, often emphasised by size, finish, colour or projection.",
    "seenAt": []
  },
  {
    "term": "Raft foundation",
    "category": "construction",
    "definition": "A continuous reinforced concrete foundation slab supporting a number of walls or columns and distributing loads over a broad area.",
    "seenAt": []
  },
  {
    "term": "Rafter",
    "category": "element",
    "definition": "An inclined structural member supporting a pitched roof covering or roof build-up, usually spanning from eaves towards ridge or purlin supports.",
    "seenAt": []
  },
  {
    "term": "Rail",
    "category": "element",
    "definition": "A horizontal member in a framed door, sash, shutter or panel assembly, connecting stiles or other vertical members.",
    "seenAt": [
      "Beit Dr. Alfes"
    ]
  },
  {
    "term": "Rainscreen",
    "category": "element",
    "definition": "An outer cladding layer separated from the backing wall by a cavity, designed as part of a system managing rainwater, drainage and ventilation.",
    "seenAt": []
  },
  {
    "term": "Rainwater goods",
    "category": "element",
    "definition": "The external components collecting and conveying roof water, including gutters, outlets, hoppers or rainwater heads, downpipes and fittings.",
    "seenAt": []
  },
  {
    "term": "Rainwater head",
    "category": "element",
    "definition": "A box-like fitting receiving water from a gutter or roof outlet and discharging it into a downpipe; may also be called a hopper head.",
    "seenAt": []
  },
  {
    "term": "Ramp",
    "category": "element",
    "definition": "An inclined surface providing a route between different levels; its gradient, landings, width and edge protection are governed by access and safety requirements.",
    "seenAt": []
  },
  {
    "term": "Random rubble",
    "category": "construction",
    "definition": "Rubble walling in which stones are laid without continuous horizontal courses, with joints and stone sizes varying across the face.",
    "seenAt": []
  },
  {
    "term": "Rebate",
    "category": "element",
    "definition": "A step-shaped recess formed along the edge of a frame or member, often receiving a door, sash, glass or another component.",
    "seenAt": []
  },
  {
    "term": "Refectory",
    "category": "element",
    "definition": "The communal dining hall of a monastery, convent or other religious institution.",
    "seenAt": []
  },
  {
    "term": "Reflected ceiling plan",
    "category": "history",
    "definition": "A plan view representing the ceiling as if reflected onto a horizontal plane, typically showing ceiling finishes, lighting and other overhead elements.",
    "seenAt": []
  },
  {
    "term": "Renaissance architecture",
    "category": "history",
    "definition": "Architectural culture beginning in Italy and spreading across Europe, characterised by renewed study of classical antiquity, proportion, geometry and orders.",
    "seenAt": []
  },
  {
    "term": "Render",
    "category": "construction",
    "definition": "A coating applied to a wall surface, commonly to protect or finish masonry or other substrates. Composition may include lime, cement, gypsum or modern proprietary materials.",
    "seenAt": [
      "Engel House",
      "Strauss Health Center"
    ]
  },
  {
    "term": "Repointing",
    "category": "construction",
    "definition": "The removal of defective or decayed joint mortar to an appropriate depth and its replacement with compatible new mortar.",
    "seenAt": []
  },
  {
    "term": "Reredorter",
    "category": "element",
    "definition": "A communal latrine block in a medieval monastery, commonly positioned in relation to the dormitory and drainage arrangements.",
    "seenAt": []
  },
  {
    "term": "Responsibility Matrix",
    "category": "history",
    "definition": "A project document assigning responsibility for producing, reviewing, approving or accepting defined information, tasks or design elements among project participants.",
    "seenAt": []
  },
  {
    "term": "Retaining wall",
    "category": "construction",
    "definition": "A wall designed to retain soil or other material where ground levels differ, resisting lateral earth and water pressures.",
    "seenAt": []
  },
  {
    "term": "Reveal",
    "category": "element",
    "definition": "The exposed side or head surface of a wall opening between the outer face of the wall and the set-back frame or inner face.",
    "seenAt": [
      "Brown–Rabinsky House"
    ]
  },
  {
    "term": "Rib vault",
    "category": "construction",
    "definition": "A vault in which ribs form a structural or visually articulated framework supporting or defining the vault surfaces.",
    "seenAt": []
  },
  {
    "term": "RIBA Code of Professional Conduct",
    "category": "history",
    "definition": "The professional conduct code applying to RIBA members. It is distinct from the statutory ARB Architects Code and membership of RIBA is distinct from registration with ARB.",
    "seenAt": []
  },
  {
    "term": "RIBA Plan of Work",
    "category": "history",
    "definition": "The Royal Institute of British Architects’ framework organising briefing, design, construction, handover and use into eight stages, numbered 0–7. It is guidance for structuring project processes and information exchanges, not a substitute for project-specific appointments or contracts.",
    "seenAt": []
  },
  {
    "term": "Ridge",
    "category": "element",
    "definition": "The upper line or junction where two opposing roof slopes meet; distinguish the geometric ridge from ridge boards, beams and ridge coverings.",
    "seenAt": []
  },
  {
    "term": "Ridge vent",
    "category": "element",
    "definition": "A ventilation component installed along or near a roof ridge to allow air to escape from a roof or attic ventilation space.",
    "seenAt": []
  },
  {
    "term": "Riser",
    "category": "element",
    "definition": "The vertical component or vertical distance between successive stair treads; distinguish the riser board from the riser height.",
    "seenAt": []
  },
  {
    "term": "Romanesque",
    "category": "history",
    "definition": "A broad medieval European architectural tradition commonly associated with round arches, substantial masonry piers and vaulting, with substantial regional variation.",
    "seenAt": []
  },
  {
    "term": "Roof deck",
    "category": "element",
    "definition": "The structural or substrate surface to which roof build-up components are fixed or applied; not to be confused with an occupiable roof terrace.",
    "seenAt": []
  },
  {
    "term": "Roof pitch",
    "category": "element",
    "definition": "The inclination of a roof slope, expressed as an angle, ratio or rise over run depending on convention.",
    "seenAt": []
  },
  {
    "term": "Roof plane",
    "category": "element",
    "definition": "A continuous sloping or flat surface forming one face of a roof geometry.",
    "seenAt": []
  },
  {
    "term": "Roof vent",
    "category": "element",
    "definition": "A generic roof-mounted ventilation component; its form and function depend on whether it ventilates a roof void, building interior or service system.",
    "seenAt": []
  },
  {
    "term": "Rooflight",
    "category": "element",
    "definition": "A glazed unit installed in the plane of a roof to admit daylight, generally without forming a projecting dormer structure.",
    "seenAt": []
  },
  {
    "term": "Ropewalk",
    "category": "element",
    "definition": "A long, straight covered or open space where fibres or yarns were laid out and twisted into rope.",
    "seenAt": []
  },
  {
    "term": "Roughcast",
    "category": "construction",
    "definition": "An external render finish in which aggregate is exposed at the surface, commonly by throwing or incorporating aggregate into the wet coating.",
    "seenAt": []
  },
  {
    "term": "Round arch",
    "category": "construction",
    "definition": "An arch with a semicircular or near-semicircular profile.",
    "seenAt": []
  },
  {
    "term": "Rubble masonry",
    "category": "construction",
    "definition": "Walling built from roughly shaped or irregular stones. It may be random, roughly coursed, squared or carefully arranged; the term does not imply poor workmanship.",
    "seenAt": []
  },
  {
    "term": "Rustication",
    "category": "construction",
    "definition": "A masonry treatment in which joints are emphasised and block faces are left rough, recessed or strongly modelled to create a robust surface effect.",
    "seenAt": []
  },
  {
    "term": "Sanctuary",
    "category": "element",
    "definition": "The area around the principal altar or sacred focus of a church, often distinct from the choir or chancel depending on the building and tradition.",
    "seenAt": []
  },
  {
    "term": "Sandstone",
    "category": "construction",
    "definition": "A sedimentary rock composed of sand-sized mineral or rock grains, commonly quartz, bound by a natural cement or matrix. Grain size, sorting, porosity, cement and bedding affect strength, weathering and carving behaviour.",
    "seenAt": []
  },
  {
    "term": "Sarcophagus",
    "category": "element",
    "definition": "A stone or other durable coffin, often elaborately carved or set within a tomb or mausoleum.",
    "seenAt": []
  },
  {
    "term": "Sash box",
    "category": "element",
    "definition": "The boxed frame of a traditional sliding sash window, accommodating the sash channels and, in counterweighted examples, pulleys, cords and weights.",
    "seenAt": []
  },
  {
    "term": "Sash cord",
    "category": "element",
    "definition": "The cord or chain connecting a sash to its counterweight through a pulley in a traditional weighted sash window.",
    "seenAt": []
  },
  {
    "term": "Sash horn",
    "category": "element",
    "definition": "A projecting extension at the lower end of a sash stile, often introduced to strengthen the joint in later timber sash windows.",
    "seenAt": []
  },
  {
    "term": "Sash weight",
    "category": "element",
    "definition": "A concealed counterweight, usually of iron or lead, connected to a sash by a cord or chain to balance its movement.",
    "seenAt": []
  },
  {
    "term": "Sash window",
    "category": "element",
    "definition": "A window in which one or more glazed sashes slide within a frame; in traditional double-hung examples the sashes move vertically and may be counterbalanced.",
    "seenAt": []
  },
  {
    "term": "Sash-and-case window",
    "category": "element",
    "definition": "A traditional window with sliding glazed sashes running within an outer case. The term is especially established in Scotland; many traditional examples use cords, pulleys and concealed weights.",
    "seenAt": []
  },
  {
    "term": "Scarf joint",
    "category": "element",
    "definition": "A joint joining two lengths of timber end-to-end, often shaped to transfer tension, compression or bending depending on its form and location.",
    "seenAt": []
  },
  {
    "term": "Schematic design",
    "category": "history",
    "definition": "An early design stage in which the brief, spatial organisation, massing and principal systems are developed and communicated at a broad level.",
    "seenAt": []
  },
  {
    "term": "Schist",
    "category": "construction",
    "definition": "A foliated metamorphic rock with visible mineral grains, commonly mica, aligned into a pronounced planar fabric. Its foliation can influence splitting, dressing and durability in building use.",
    "seenAt": []
  },
  {
    "term": "Scope of work",
    "category": "history",
    "definition": "A description of the work, services, deliverables, boundaries and exclusions included in a project or contract.",
    "seenAt": []
  },
  {
    "term": "Scupper",
    "category": "construction",
    "definition": "An opening or outlet through a parapet or wall allowing water to drain from a roof or terrace, often discharging to a downpipe or external face.",
    "seenAt": []
  },
  {
    "term": "Sedimentary rock",
    "category": "construction",
    "definition": "Rock formed through deposition and subsequent compaction, cementation or other lithification of sediment, including sandstone, siltstone, mudstone and limestone. Its layering and constituent particles may remain visible in the finished stone.",
    "seenAt": []
  },
  {
    "term": "Segmental arch",
    "category": "construction",
    "definition": "An arch whose curve is a segment of a circle and therefore flatter than a semicircular arch.",
    "seenAt": []
  },
  {
    "term": "Serliana",
    "category": "element",
    "definition": "A tripartite composition with a central arched opening flanked by two lower rectangular openings, popularised in Renaissance architectural treatises.",
    "seenAt": []
  },
  {
    "term": "Setback",
    "category": "construction",
    "definition": "A required or designed distance between a building or element and a boundary, street, neighbouring building or other reference line; planning definitions vary by jurisdiction.",
    "seenAt": []
  },
  {
    "term": "Shear wall",
    "category": "construction",
    "definition": "A wall designed to resist lateral actions such as wind or earthquake forces, transferring them through the structure to the foundations.",
    "seenAt": []
  },
  {
    "term": "Sheathing",
    "category": "construction",
    "definition": "Board, sheet or panel material fixed to the outside or inside of a frame to provide a substrate, bracing, air or weather control, depending on the assembly.",
    "seenAt": []
  },
  {
    "term": "Shed roof",
    "category": "element",
    "definition": "A single-plane roof, often with a single pitch, also known in British usage as a mono-pitched or lean-to roof depending on arrangement.",
    "seenAt": []
  },
  {
    "term": "Shopfront",
    "category": "element",
    "definition": "The ground-floor frontage of a shop, often composed of display glazing, entrance, stallriser, fascia and pilasters; components vary by period and region.",
    "seenAt": [
      "Beit Mann",
      "Beit Mintz"
    ]
  },
  {
    "term": "Shrine",
    "category": "element",
    "definition": "A structure, chamber or designated place associated with veneration of a sacred person, object or event; it may be integrated into a larger building.",
    "seenAt": []
  },
  {
    "term": "Siding",
    "category": "element",
    "definition": "An external wall cladding or boarding system, especially in North American usage. British equivalents depend on material and system, such as timber boarding or cladding.",
    "seenAt": []
  },
  {
    "term": "Sill / cill",
    "category": "element",
    "definition": "The bottom member or surface of a window opening. An external sill commonly projects and is shaped to shed water clear of the wall; 'cill' is a British spelling variant.",
    "seenAt": []
  },
  {
    "term": "Sill band",
    "category": "construction",
    "definition": "A continuous horizontal band connecting or aligning window sill levels across a façade.",
    "seenAt": []
  },
  {
    "term": "Site plan",
    "category": "history",
    "definition": "A drawing showing a building or development in relation to its site, boundaries, access, landscape, neighbouring context and relevant site information.",
    "seenAt": []
  },
  {
    "term": "Skew",
    "category": "construction",
    "definition": "In Scottish building terminology, the sloping stone tabling or coping along the rake of a gable that rises above the roof plane.",
    "seenAt": []
  },
  {
    "term": "Skewputt",
    "category": "construction",
    "definition": "The projecting terminal stone or block at the foot of a Scottish skew, often shaped or moulded.",
    "seenAt": []
  },
  {
    "term": "Slab-on-grade",
    "category": "construction",
    "definition": "A ground-supported concrete floor slab cast at or near finished ground level, with edge and sub-base details determined by ground and building conditions.",
    "seenAt": []
  },
  {
    "term": "Slate",
    "category": "construction",
    "definition": "A fine-grained metamorphic rock that splits into thin sheets; roofing slates are individual pieces laid in overlapping courses.",
    "seenAt": []
  },
  {
    "term": "Snagging",
    "category": "history",
    "definition": "The process of identifying and recording incomplete or defective work, usually before practical completion or handover.",
    "seenAt": []
  },
  {
    "term": "Snecked rubble",
    "category": "construction",
    "definition": "A form of coursed rubble in which smaller stones or snecks are used to fill irregular spaces and help maintain the course.",
    "seenAt": []
  },
  {
    "term": "Soffit",
    "category": "element",
    "definition": "The underside surface of an architectural element, such as an eaves overhang, arch, balcony or stair.",
    "seenAt": []
  },
  {
    "term": "Spandrel",
    "category": "construction",
    "definition": "The roughly triangular area between the curve of an arch and the enclosing rectangular frame, or between adjacent arches and their framing.",
    "seenAt": []
  },
  {
    "term": "Springer",
    "category": "construction",
    "definition": "The first voussoir or springing stone at the base of an arch, distinct from the springing level or line.",
    "seenAt": []
  },
  {
    "term": "Springing",
    "category": "construction",
    "definition": "The level, point or zone from which an arch or vault begins to rise from its support.",
    "seenAt": []
  },
  {
    "term": "Staff bead",
    "category": "element",
    "definition": "The bead fixed around the room-side edge of a traditional sash case, retaining the inner sash while allowing it to slide.",
    "seenAt": []
  },
  {
    "term": "Stage 0 — Strategic Definition",
    "category": "history",
    "definition": "The RIBA Plan of Work stage in which the client’s requirements and business case are examined and the best means of achieving them is considered before a project proceeds.",
    "seenAt": []
  },
  {
    "term": "Stage 1 — Preparation and Briefing",
    "category": "history",
    "definition": "The stage in which the project brief is developed, the site and project information are assembled, feasibility is tested, and the project budget and programme are established.",
    "seenAt": []
  },
  {
    "term": "Stage 2 — Concept Design",
    "category": "history",
    "definition": "The stage in which the architectural concept is developed and tested against the brief, strategic engineering requirements, cost plan and project strategies.",
    "seenAt": []
  },
  {
    "term": "Stage 3 — Spatial Coordination",
    "category": "history",
    "definition": "The stage in which architectural and engineering information is coordinated spatially and tested against the updated cost plan and project strategies.",
    "seenAt": []
  },
  {
    "term": "Stage 4 — Technical Design",
    "category": "history",
    "definition": "The stage in which the architectural and engineering technical design and coordinated building-systems information required for manufacture and construction are developed.",
    "seenAt": []
  },
  {
    "term": "Stage 5 — Manufacturing and Construction",
    "category": "history",
    "definition": "The stage covering manufacture of building systems, construction, quality inspection, commissioning and response to site queries. Design activity is generally limited to resolving queries and agreed changes.",
    "seenAt": []
  },
  {
    "term": "Stage 6 — Handover",
    "category": "history",
    "definition": "The stage in which the building is handed over, aftercare is initiated, the building contract is concluded and initial performance review and defects processes proceed.",
    "seenAt": []
  },
  {
    "term": "Stage 7 — Use",
    "category": "history",
    "definition": "The stage covering the ongoing operation, maintenance, asset management and evaluation of the building in use; it continues for the life of the building.",
    "seenAt": []
  },
  {
    "term": "Stair",
    "category": "element",
    "definition": "A sequence of steps providing a change in level. A stair assembly includes flights, landings, strings or supports, treads, risers and handrails as applicable.",
    "seenAt": [
      "Brown–Rabinsky House",
      "Moshe Greidinger House / Pittman School",
      "Hemphel House",
      "Balfour 57",
      "Beit Dr. Alfes"
    ]
  },
  {
    "term": "Stallriser",
    "category": "element",
    "definition": "The solid lower panel or wall of a traditional shopfront beneath the display glazing or sill.",
    "seenAt": []
  },
  {
    "term": "Stem wall",
    "category": "construction",
    "definition": "The short foundation wall rising from a footing or foundation system to support the building above or retain adjacent ground.",
    "seenAt": []
  },
  {
    "term": "Stile",
    "category": "element",
    "definition": "A principal upright member of a framed door, sash, shutter or panel assembly.",
    "seenAt": []
  },
  {
    "term": "Stop",
    "category": "element",
    "definition": "A projecting strip or moulded part that limits the movement of a door, sash or other moving joinery element, or provides a closing surface.",
    "seenAt": []
  },
  {
    "term": "String course",
    "category": "construction",
    "definition": "A horizontal band or course running across a façade, often projecting or differentiated by material or profile; it may mark a storey or sill level.",
    "seenAt": []
  },
  {
    "term": "Stringer / string",
    "category": "element",
    "definition": "An inclined structural member supporting the ends or sides of stair treads and risers. British joinery also uses 'string' for the sloping side member.",
    "seenAt": []
  },
  {
    "term": "Structural engineer",
    "category": "history",
    "definition": "A specialist engineer responsible for analysing and designing structural systems and assessing structural behaviour within an agreed scope.",
    "seenAt": []
  },
  {
    "term": "Stucco",
    "category": "construction",
    "definition": "A fine render or plaster finish, historically often lime-based and used externally or internally; in some contexts the term refers to ornamental plasterwork or cementitious render.",
    "seenAt": []
  },
  {
    "term": "Stud wall",
    "category": "construction",
    "definition": "A wall framed from regularly spaced vertical timber or metal studs, usually with sheathing, insulation and linings.",
    "seenAt": []
  },
  {
    "term": "Sustainability Strategy",
    "category": "history",
    "definition": "A coordinated approach to environmental, social and economic outcomes across a project, including relevant targets, design measures, assessment methods and responsibilities.",
    "seenAt": []
  },
  {
    "term": "Swale",
    "category": "construction",
    "definition": "A shallow, usually vegetated channel designed to convey, slow, filter or temporarily store surface water runoff.",
    "seenAt": []
  },
  {
    "term": "Switchback stair",
    "category": "element",
    "definition": "A stair arrangement in which successive flights reverse direction, commonly connected by an intermediate landing.",
    "seenAt": []
  },
  {
    "term": "Tenement",
    "category": "element",
    "definition": "A multi-occupancy residential building, particularly associated with Scottish urban housing; legal and social meanings vary by jurisdiction.",
    "seenAt": []
  },
  {
    "term": "Terms of Engagement",
    "category": "history",
    "definition": "The agreed written terms defining the professional services, scope, responsibilities, fees, programme, assumptions, exclusions and other conditions of an appointment.",
    "seenAt": []
  },
  {
    "term": "Thermal break",
    "category": "construction",
    "definition": "A low-conductivity component or separation introduced between otherwise conductive parts to reduce heat transfer, often at balcony connections, frames or façade brackets.",
    "seenAt": []
  },
  {
    "term": "Thermal bridge",
    "category": "construction",
    "definition": "A localised part of the building envelope where heat flows more readily than through adjacent construction, often due to geometry or conductive materials.",
    "seenAt": []
  },
  {
    "term": "Threshold",
    "category": "element",
    "definition": "The bottom member or transition at a doorway, often bridging floor finishes and providing a weathering or accessibility detail.",
    "seenAt": [
      "Howard's Hotel"
    ]
  },
  {
    "term": "Timber frame",
    "category": "construction",
    "definition": "A structural system in which timber posts, beams and braces form a load-bearing frame, with infill or cladding between or outside the frame.",
    "seenAt": []
  },
  {
    "term": "Townhouse",
    "category": "element",
    "definition": "A multi-storey urban dwelling forming part of a continuous or closely spaced street frontage; regional forms and tenure patterns vary.",
    "seenAt": [
      "Beit Gross"
    ]
  },
  {
    "term": "Tracery",
    "category": "construction",
    "definition": "The patterned stone framework subdividing the head of a Gothic window or screen. Plate tracery and bar tracery describe distinct constructional approaches.",
    "seenAt": []
  },
  {
    "term": "Transom",
    "category": "element",
    "definition": "A horizontal member dividing an opening into upper and lower portions, or a horizontal framing member across a window or door assembly.",
    "seenAt": []
  },
  {
    "term": "Tread",
    "category": "element",
    "definition": "The approximately horizontal surface of a stair step on which the foot is placed.",
    "seenAt": []
  },
  {
    "term": "Truss",
    "category": "construction",
    "definition": "A triangulated structural framework of members connected at nodes, arranged to carry loads primarily through axial tension and compression.",
    "seenAt": []
  },
  {
    "term": "Tudor arch",
    "category": "construction",
    "definition": "A broad, relatively low pointed arch associated with late medieval English architecture and later revival work.",
    "seenAt": []
  },
  {
    "term": "Tudor Revival",
    "category": "history",
    "definition": "A revival style drawing on late medieval and Tudor English forms, often using steep roofs, prominent gables, tall chimneys and decorative half-timbering.",
    "seenAt": []
  },
  {
    "term": "Tympanum",
    "category": "element",
    "definition": "The enclosed field within the mouldings of a pediment, often containing sculpture or relief decoration.",
    "seenAt": []
  },
  {
    "term": "Underlayment",
    "category": "element",
    "definition": "A secondary layer beneath roof coverings, often providing temporary weather protection or a drainage plane. British specifications may use underlay or roofing membrane depending on system.",
    "seenAt": []
  },
  {
    "term": "Underpinning",
    "category": "construction",
    "definition": "Work to strengthen, deepen or otherwise improve an existing foundation, often to address movement or accommodate adjacent works.",
    "seenAt": []
  },
  {
    "term": "Valley",
    "category": "element",
    "definition": "The internal angle formed where two roof slopes meet, directing rainwater towards the eaves or an outlet.",
    "seenAt": []
  },
  {
    "term": "Vapour barrier",
    "category": "construction",
    "definition": "A layer with high resistance to water vapour diffusion. It is not interchangeable with an air barrier; its location and resistance must be appropriate to the assembly and climate.",
    "seenAt": []
  },
  {
    "term": "Vapour control layer",
    "category": "construction",
    "definition": "A layer designed to regulate water vapour diffusion through an assembly; its position and vapour resistance must suit the climate and build-up.",
    "seenAt": []
  },
  {
    "term": "Vault",
    "category": "construction",
    "definition": "A curved masonry or other structural ceiling or roof form, often generated by extending or intersecting an arch profile through space.",
    "seenAt": [
      "Mazeh 16"
    ]
  },
  {
    "term": "Vaulted ceiling",
    "category": "element",
    "definition": "A ceiling formed to the underside of a vault or constructed to imitate a vaulted form; distinguish actual structural vaulting from lightweight decorative construction.",
    "seenAt": []
  },
  {
    "term": "Verge",
    "category": "element",
    "definition": "The exposed edge of a roof at a gable end, where the roof covering meets or projects beyond the gable wall.",
    "seenAt": []
  },
  {
    "term": "Vernacular architecture",
    "category": "history",
    "definition": "Architecture shaped by local materials, climate, building practices, social patterns and accumulated craft knowledge; it is not simply architecture without an architect.",
    "seenAt": []
  },
  {
    "term": "Voussoir",
    "category": "construction",
    "definition": "A wedge-shaped masonry unit forming part of an arch ring; its joints are arranged to transmit compressive forces through the arch.",
    "seenAt": []
  },
  {
    "term": "Wall panelling",
    "category": "element",
    "definition": "Timber or other panelled lining applied to an internal wall, either as a decorative finish or as part of a functional lining system.",
    "seenAt": []
  },
  {
    "term": "Wall tie",
    "category": "construction",
    "definition": "A connector linking two leaves of a cavity wall to provide restraint and transfer appropriate lateral forces between them.",
    "seenAt": []
  },
  {
    "term": "Water table",
    "category": "element",
    "definition": "A projecting or sloping course near the base of a wall, often intended to throw rainwater clear and sometimes to mark a change in wall treatment.",
    "seenAt": []
  },
  {
    "term": "Wattle and daub",
    "category": "construction",
    "definition": "A traditional infill system in which woven timber or branch panels (wattle) are coated with an earthen or lime-based daub.",
    "seenAt": []
  },
  {
    "term": "Window",
    "category": "element",
    "definition": "An opening in an external or internal wall, usually fitted with a frame and glazing to admit light, provide views and, where operable, ventilation.",
    "seenAt": [
      "Brown–Rabinsky House",
      "Liebling House",
      "Beit Tzemach Shkanovsky",
      "Hemphel House",
      "Balfour 42",
      "Israel Kimball House"
    ]
  },
  {
    "term": "Window light",
    "category": "element",
    "definition": "An individual glazed subdivision within a window, bounded by framing members or glazing bars. Usage can vary between traditional and contemporary specifications.",
    "seenAt": []
  },
  {
    "term": "X-bracing",
    "category": "construction",
    "definition": "A bracing arrangement in which diagonal members cross to form an X within a structural bay, providing resistance to lateral loads.",
    "seenAt": []
  },
  {
    "term": "Ziggurat",
    "category": "history",
    "definition": "A stepped monumental platform or temple tower of ancient Mesopotamia, formed from successively receding stages.",
    "seenAt": []
  }
];

export const terms: Term[] = [...curated, ...glossaryTerms];
