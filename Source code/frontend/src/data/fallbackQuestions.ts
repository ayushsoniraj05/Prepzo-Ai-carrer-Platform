/**
 * Fallback Question Bank for Assessment
 * Used when AI service (Ollama) is unavailable.
 * Section names MUST match the backend STREAM_SECTIONS keys exactly.
 * Supports: CS, Electronics, Mechanical, Civil, Management, Commerce, IoT, Science, Arts
 */

export interface FallbackQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation: string;
}

export interface FallbackSection {
  id: string;
  name: string;
  icon: string;
  timeLimit: number; // minutes
  questions: FallbackQuestion[];
}

// ────────────────────────────────────────────────────
// SHARED: APTITUDE (used by all fields)
// ────────────────────────────────────────────────────
const APTITUDE_QUESTIONS: FallbackQuestion[] = [
  { id:"apt1", question:"If a train travels 120 km in 2 hours, what is its speed?", options:["50 km/h","60 km/h","80 km/h","100 km/h"], correct:1, difficulty:"easy", explanation:"Speed = Distance/Time = 120/2 = 60 km/h." },
  { id:"apt2", question:"What comes next: 2, 6, 12, 20, 30, ?", options:["40","42","44","36"], correct:1, difficulty:"medium", explanation:"Differences: 4,6,8,10 → next diff=12 → 30+12=42." },
  { id:"apt3", question:"A shopkeeper sells a product at 20% profit. If the cost price is ₹500, what is the selling price?", options:["₹550","₹600","₹650","₹700"], correct:1, difficulty:"easy", explanation:"SP = CP × 1.2 = 500 × 1.2 = ₹600." },
  { id:"apt4", question:"If 5 workers can build a wall in 10 days, how many days will 10 workers take?", options:["5","10","15","20"], correct:0, difficulty:"easy", explanation:"Workers × Days = constant. 5×10 = 10×D → D=5." },
  { id:"apt5", question:"The average of first 10 natural numbers is:", options:["5","5.5","6","6.5"], correct:1, difficulty:"easy", explanation:"Sum = 55, Avg = 55/10 = 5.5." },
];

/**
 * ────────────────────────────────────────────────────
 * NEW: UNIVERSAL TECHNICAL SKILL FALLBACK (For Stage 2)
 * ────────────────────────────────────────────────────
 */
const TECHNICAL_SKILL_QUESTIONS: FallbackQuestion[] = [
  // React
  { id:"skl1", question:"What is the purpose of React's useEffect hook?", options:["Manage state in components","Handle side effects like data fetching","Iterate over array elements","Style components dynamically"], correct:1, difficulty:"medium", explanation:"useEffect handles side effects (API calls, subscriptions, etc.) outside the render cycle." },
  { id:"skl2", question:"In React, what is the 'Virtual DOM'?", options:["A direct copy of the real DOM","A lightweight JavaScript representation of the DOM","A hardware acceleration for rendering","A cloud-based DOM service"], correct:1, difficulty:"easy", explanation:"Virtual DOM is a memory representation of the UI that React uses for efficient reconciliation." },
  // Node.js
  { id:"skl3", question:"What is the event loop in Node.js?", options:["A recursive function call","A mechanism that handles non-blocking I/O operations","A loop that iterates over a database","A way to handle multi-threading"], correct:1, difficulty:"medium", explanation:"The event loop allows Node.js to perform non-blocking I/O operations by offloading tasks." },
  // Docker
  { id:"skl4", question:"Which Docker command is used to build an image from a Dockerfile?", options:["docker run","docker pack","docker build","docker create"], correct:2, difficulty:"easy", explanation:"'docker build' builds an image from a Dockerfile in the current directory." },
  // Python
  { id:"skl5", question:"In Python, what is a List Comprehension?", options:["A comprehensive list of all variables","A concise way to create lists using expressions","A way to compress lists into ZIP files","A debugging tool for arrays"], correct:1, difficulty:"easy", explanation:"List comprehensions provide a short syntax to create a new list based on values of an existing list." },
  // Git
  { id:"skl6", question:"What does 'git merge' do?", options:["Deletes a branch","Combines changes from different branches","Uploads code to GitHub","Resets the working directory"], correct:1, difficulty:"easy", explanation:"Git merge combines the multiple sequences of commits into one unified history." },
  // General Web
  { id:"skl7", question:"What is the purpose of a RESTful API's 'PUT' method?", options:["Retrieve data","Delete data","Create or update a resource completely","Partial update of a resource"], correct:2, difficulty:"medium", explanation:"PUT is used to create a new resource or replace the target resource with the uploaded content." },
  // MongoDB
  { id:"skl8", question:"Which type of database is MongoDB?", options:["Relational","NoSQL / Document-oriented","Graph-based","Key-Value store"], correct:1, difficulty:"easy", explanation:"MongoDB is a document-oriented NoSQL database that stores data in JSON-like format." }
];

// ────────────────────────────────────────────────────
// 1. COMPUTER SCIENCE
// ────────────────────────────────────────────────────
const DSA_QUESTIONS: FallbackQuestion[] = [
  { id:"dsa1", question:"What is the time complexity of binary search on a sorted array?", options:["O(n)","O(n²)","O(log n)","O(1)"], correct:2, difficulty:"easy", explanation:"Binary search halves the space each step → O(log n)." },
  { id:"dsa2", question:"Which data structure follows LIFO (Last In First Out)?", options:["Queue","Linked List","Stack","Heap"], correct:2, difficulty:"easy", explanation:"Stack follows Last-In-First-Out ordering." },
  { id:"dsa3", question:"What is the worst-case time complexity of QuickSort?", options:["O(n log n)","O(n²)","O(n)","O(log n)"], correct:1, difficulty:"medium", explanation:"QuickSort degrades to O(n²) when pivot is always min/max." },
  { id:"dsa4", question:"Which traversal visits the root node first?", options:["Inorder","Preorder","Postorder","Level-order"], correct:1, difficulty:"easy", explanation:"Preorder traversal visits Root → Left → Right." },
  { id:"dsa5", question:"What data structure is used in BFS?", options:["Stack","Queue","Heap","Deque"], correct:1, difficulty:"easy", explanation:"BFS uses a Queue to explore nodes level by level." },
];

const DBMS_QUESTIONS: FallbackQuestion[] = [
  { id:"dbms1", question:"What does SQL stand for?", options:["Structured Query Language","Simple Query Language","Sequential Query Language","Standard Query Language"], correct:0, difficulty:"easy", explanation:"SQL = Structured Query Language." },
  { id:"dbms2", question:"Which normal form eliminates partial dependencies?", options:["1NF","2NF","3NF","BCNF"], correct:1, difficulty:"medium", explanation:"2NF removes partial dependencies on composite keys." },
  { id:"dbms3", question:"Which SQL keyword is used to sort result-set?", options:["SORT BY","ORDER BY","ARRANGE BY","GROUP BY"], correct:1, difficulty:"easy", explanation:"ORDER BY sorts in ascending or descending order." },
  { id:"dbms4", question:"What does the 'A' in ACID stand for?", options:["Accessibility","Availability","Atomicity","Algorithms"], correct:2, difficulty:"medium", explanation:"ACID: Atomicity, Consistency, Isolation, Durability." },
  { id:"dbms5", question:"Which type of JOIN returns all rows from both tables?", options:["INNER JOIN","LEFT JOIN","RIGHT JOIN","FULL OUTER JOIN"], correct:3, difficulty:"medium", explanation:"FULL OUTER JOIN returns all rows from both tables." },
];

const OS_QUESTIONS: FallbackQuestion[] = [
  { id:"os1", question:"What is a deadlock in an operating system?", options:["Process waiting for I/O","Two or more processes waiting for each other","System crash due to memory leak","Unexpected termination"], correct:1, difficulty:"medium", explanation:"Deadlock: processes stuck waiting for resources held by each other." },
  { id:"os2", question:"Which scheduling algorithm is non-preemptive?", options:["Round Robin","SJF","Priority Scheduling","FCFS"], correct:3, difficulty:"easy", explanation:"FCFS always completes the process once it starts." },
  { id:"os3", question:"What is virtual memory?", options:["RAM extension using disk","Cache memory","ROM","Flash storage"], correct:0, difficulty:"easy", explanation:"Virtual memory uses disk space to extend available memory." },
  { id:"os4", question:"What is the role of a semaphore?", options:["Memory allocation","Process synchronization","Disk management","Network routing"], correct:1, difficulty:"medium", explanation:"Semaphores are used for process synchronization and mutual exclusion." },
  { id:"os5", question:"Which page replacement algorithm suffers from Belady's anomaly?", options:["LRU","Optimal","FIFO","LFU"], correct:2, difficulty:"hard", explanation:"FIFO can increase page faults when more frames are added." },
];

const CN_QUESTIONS: FallbackQuestion[] = [
  { id:"cn1", question:"Which layer of OSI model handles IP addressing?", options:["Transport","Data Link","Network","Physical"], correct:2, difficulty:"medium", explanation:"Network Layer (Layer 3) handles IP addressing and routing." },
  { id:"cn2", question:"What protocol does HTTP use at the transport layer?", options:["UDP","TCP","ICMP","ARP"], correct:1, difficulty:"easy", explanation:"HTTP uses TCP for reliable data transfer." },
  { id:"cn3", question:"What is the purpose of DNS?", options:["Encrypt data","Translate domain names to IPs","Manage bandwidth","Route packets"], correct:1, difficulty:"easy", explanation:"DNS resolves human-readable domain names to IP addresses." },
  { id:"cn4", question:"Which protocol is connectionless?", options:["TCP","HTTP","UDP","FTP"], correct:2, difficulty:"easy", explanation:"UDP is connectionless — no handshake before data transfer." },
  { id:"cn5", question:"What is the default port for HTTPS?", options:["80","8080","443","22"], correct:2, difficulty:"easy", explanation:"HTTPS runs on port 443 by default." },
];

const OOPS_QUESTIONS: FallbackQuestion[] = [
  { id:"oops1", question:"Which is NOT a pillar of OOP?", options:["Encapsulation","Polymorphism","Recursion","Inheritance"], correct:2, difficulty:"easy", explanation:"Four pillars: Encapsulation, Inheritance, Polymorphism, Abstraction. Recursion is a technique." },
  { id:"oops2", question:"Which principle refers to one interface representing different forms?", options:["Encapsulation","Inheritance","Polymorphism","Abstraction"], correct:2, difficulty:"easy", explanation:"Polymorphism: one interface, many implementations." },
  { id:"oops3", question:"What does the 'S' in SOLID stand for?", options:["Simple","Single Responsibility","Structured","Scalable"], correct:1, difficulty:"medium", explanation:"S = Single Responsibility Principle." },
  { id:"oops4", question:"What is method overloading?", options:["Redefining a method in child class","Multiple methods with same name but different params","Making a method private","Intercepting method calls"], correct:1, difficulty:"easy", explanation:"Overloading: same name, different signatures in the same class." },
  { id:"oops5", question:"Which design pattern ensures only one instance of a class?", options:["Factory","Observer","Singleton","Strategy"], correct:2, difficulty:"medium", explanation:"Singleton pattern restricts instantiation to one object." },
];

// ────────────────────────────────────────────────────
// 2. ELECTRONICS / ELECTRICAL
// ────────────────────────────────────────────────────
const CIRCUITS_QUESTIONS: FallbackQuestion[] = [
  { id:"cir1", question:"What is the relation V, I, R in Ohm's Law?", options:["V = I/R","I = V*R","V = I*R","R = V*I"], correct:2, difficulty:"easy", explanation:"V = IR is Ohm's Law." },
  { id:"cir2", question:"What is the unit of capacitance?", options:["Henry","Farad","Ohm","Tesla"], correct:1, difficulty:"easy", explanation:"Capacitance is measured in Farads (F)." },
  { id:"cir3", question:"In a series circuit, what remains constant?", options:["Voltage","Current","Resistance","Power"], correct:1, difficulty:"easy", explanation:"Current is the same through all series components." },
  { id:"cir4", question:"What does Kirchhoff's Voltage Law state?", options:["Sum of currents = 0","Sum of voltages in a loop = 0","Power is conserved","Resistance is additive"], correct:1, difficulty:"medium", explanation:"KVL: Sum of voltage drops in any closed loop = 0." },
  { id:"cir5", question:"What is the power factor of a purely resistive circuit?", options:["0","0.5","0.707","1"], correct:3, difficulty:"medium", explanation:"In a purely resistive circuit, voltage and current are in phase, so PF = 1." },
];

const MACHINES_QUESTIONS: FallbackQuestion[] = [
  { id:"mac1", question:"What type of motor is used in ceiling fans?", options:["DC Shunt","Single-phase Induction","Synchronous","Stepper"], correct:1, difficulty:"easy", explanation:"Ceiling fans typically use single-phase induction motors." },
  { id:"mac2", question:"What is the function of a commutator in a DC machine?", options:["Speed control","Convert AC to DC at brushes","Reduce sparking","Increase torque"], correct:1, difficulty:"medium", explanation:"Commutator converts AC from armature to DC at the external circuit." },
  { id:"mac3", question:"A transformer works on the principle of:", options:["Electromagnetic induction","Coulomb's law","Ampere's law","Lenz's law"], correct:0, difficulty:"easy", explanation:"Transformers use Faraday's law of electromagnetic induction." },
  { id:"mac4", question:"What is the synchronous speed formula?", options:["Ns = 120f/P","Ns = P/120f","Ns = f/P","Ns = 60f/P"], correct:0, difficulty:"medium", explanation:"Synchronous Speed Ns = 120f/P where f is frequency and P is number of poles." },
  { id:"mac5", question:"Which motor has highest starting torque?", options:["Shunt","Series","Compound","Separately excited"], correct:1, difficulty:"medium", explanation:"DC Series motors have the highest starting torque." },
];

const ELECTRONICS_QUESTIONS: FallbackQuestion[] = [
  { id:"elec1", question:"Which logic gate is a Universal Gate?", options:["AND","OR","NAND","XOR"], correct:2, difficulty:"easy", explanation:"NAND and NOR are universal — any logic can be built from them." },
  { id:"elec2", question:"Which semiconductor material is most common in IC fabrication?", options:["Germanium","Silicon","Gallium Arsenide","Carbon"], correct:1, difficulty:"easy", explanation:"Silicon is the primary material for modern semiconductors." },
  { id:"elec3", question:"What is the purpose of a Schottky diode?", options:["High voltage rectification","Fast switching with low forward voltage","Constant voltage regulation","Light emission"], correct:1, difficulty:"medium", explanation:"Schottky diodes have low forward voltage and switch very fast." },
  { id:"elec4", question:"An op-amp in non-inverting configuration has gain:", options:["1 + Rf/R1","Rf/R1","-Rf/R1","1 - Rf/R1"], correct:0, difficulty:"medium", explanation:"Non-inverting gain = 1 + (Rf/R1)." },
  { id:"elec5", question:"In a BJT, which region has the highest doping?", options:["Base","Collector","Emitter","All equal"], correct:2, difficulty:"medium", explanation:"The emitter is the most heavily doped region in a BJT." },
];

const EMBEDDED_QUESTIONS: FallbackQuestion[] = [
  { id:"emb1", question:"Which register in 8051 points to the stack?", options:["DPTR","PC","SP","PSW"], correct:2, difficulty:"medium", explanation:"SP (Stack Pointer) tracks stack top in 8051." },
  { id:"emb2", question:"What does RTOS stand for?", options:["Real Time Operating System","Ready To Operate System","Robotic Technology OS","Reference Task OS"], correct:0, difficulty:"easy", explanation:"RTOS = Real Time Operating System for deterministic tasks." },
  { id:"emb3", question:"What is the word size of ARM Cortex M4?", options:["8-bit","16-bit","32-bit","64-bit"], correct:2, difficulty:"easy", explanation:"ARM Cortex-M4 is a 32-bit processor." },
  { id:"emb4", question:"Which communication protocol is half-duplex?", options:["SPI","I2C","UART","Ethernet"], correct:1, difficulty:"medium", explanation:"I2C uses a shared data line making it half-duplex." },
  { id:"emb5", question:"What is the main advantage of RTOS over general-purpose OS?", options:["Better graphics","Deterministic timing","More storage","Faster boot"], correct:1, difficulty:"medium", explanation:"RTOS guarantees deterministic response times for real-time tasks." },
];

const SIGNALS_QUESTIONS: FallbackQuestion[] = [
  { id:"sig1", question:"Fourier Transform converts a signal from:", options:["Analog to digital","Time domain to frequency domain","DC to AC","Continuous to discrete"], correct:1, difficulty:"easy", explanation:"Fourier Transform decomposes signals into frequency components." },
  { id:"sig2", question:"What is the Nyquist sampling rate for a 4 kHz signal?", options:["4 kHz","8 kHz","16 kHz","2 kHz"], correct:1, difficulty:"medium", explanation:"Nyquist rate = 2 × max frequency = 2 × 4 kHz = 8 kHz." },
  { id:"sig3", question:"An LTI system is characterized by its:", options:["Transfer function","Power supply","Clock speed","Bus width"], correct:0, difficulty:"easy", explanation:"LTI systems are fully characterized by their transfer function or impulse response." },
  { id:"sig4", question:"What type of modulation does FM represent?", options:["Amplitude","Frequency","Phase","Pulse"], correct:1, difficulty:"easy", explanation:"FM = Frequency Modulation." },
  { id:"sig5", question:"What is the Z-transform primarily used for?", options:["Analog signals","Discrete-time systems","Power analysis","Antenna design"], correct:1, difficulty:"medium", explanation:"Z-transform is the discrete-time equivalent of Laplace transform." },
];

// ────────────────────────────────────────────────────
// 3. MECHANICAL ENGINEERING
// ────────────────────────────────────────────────────
const THERMO_QUESTIONS: FallbackQuestion[] = [
  { id:"thm1", question:"Which law states energy cannot be created or destroyed?", options:["First Law","Second Law","Third Law","Zeroth Law"], correct:0, difficulty:"easy", explanation:"First Law of Thermodynamics: conservation of energy." },
  { id:"thm2", question:"Which engine cycle is theoretically the most efficient?", options:["Diesel","Otto","Carnot","Rankine"], correct:2, difficulty:"medium", explanation:"Carnot cycle is the theoretical efficiency limit." },
  { id:"thm3", question:"What is the unit of entropy?", options:["J/K","kW","Pa","N/m"], correct:0, difficulty:"easy", explanation:"Entropy is measured in Joules per Kelvin (J/K)." },
  { id:"thm4", question:"In an isobaric process, what remains constant?", options:["Volume","Temperature","Pressure","Entropy"], correct:2, difficulty:"easy", explanation:"Isobaric = constant pressure." },
  { id:"thm5", question:"COP of a heat pump is always:", options:["Less than 1","Equal to 1","Greater than 1","Zero"], correct:2, difficulty:"medium", explanation:"COP of heat pump = 1 + COP of refrigerator, always > 1." },
];

const MECHANICS_QUESTIONS: FallbackQuestion[] = [
  { id:"mech1", question:"What is the unit of stress?", options:["N/m","Pascal (Pa)","Joule","Watt"], correct:1, difficulty:"easy", explanation:"Stress = Force/Area, measured in Pascals." },
  { id:"mech2", question:"Young's modulus measures:", options:["Hardness","Elasticity","Viscosity","Density"], correct:1, difficulty:"easy", explanation:"Young's modulus is a measure of material stiffness/elasticity." },
  { id:"mech3", question:"What is Poisson's ratio?", options:["Lateral strain to axial strain","Stress to strain","Force to area","Velocity to time"], correct:0, difficulty:"medium", explanation:"Poisson's ratio = lateral strain / axial strain." },
  { id:"mech4", question:"What type of gear is used for intersecting shafts?", options:["Spur","Helical","Bevel","Worm"], correct:2, difficulty:"medium", explanation:"Bevel gears connect shafts at an angle (usually 90°)." },
  { id:"mech5", question:"Reynolds number determines:", options:["Stress type","Flow regime (laminar/turbulent)","Heat transfer rate","Pressure drop"], correct:1, difficulty:"medium", explanation:"Reynolds number predicts laminar vs turbulent flow." },
];

const MANUFACTURING_QUESTIONS: FallbackQuestion[] = [
  { id:"mfg1", question:"Which process joins metals by melting and fusing?", options:["Casting","Welding","Forging","Rolling"], correct:1, difficulty:"easy", explanation:"Welding joins materials by melting and fusing them together." },
  { id:"mfg2", question:"CNC stands for:", options:["Computer Numerical Control","Central Network Computer","Core Numerical Calculator","Custom Number Code"], correct:0, difficulty:"easy", explanation:"CNC = Computer Numerical Control for automated machining." },
  { id:"mfg3", question:"Which casting process uses expendable patterns?", options:["Die casting","Sand casting","Investment casting","Centrifugal casting"], correct:2, difficulty:"medium", explanation:"Investment (lost-wax) casting uses expendable wax patterns." },
  { id:"mfg4", question:"What is the purpose of a jig in manufacturing?", options:["Measure dimensions","Guide the tool","Store raw material","Cool the workpiece"], correct:1, difficulty:"easy", explanation:"A jig holds and guides the tool to the workpiece." },
  { id:"mfg5", question:"Which metal forming process gives maximum strength?", options:["Casting","Forging","Welding","Machining"], correct:1, difficulty:"medium", explanation:"Forging produces parts with superior grain structure and strength." },
];

const DESIGN_QUESTIONS: FallbackQuestion[] = [
  { id:"des1", question:"What does CAD stand for?", options:["Computer Aided Design","Central Automatic Design","Custom Array Display","Core Algorithm Design"], correct:0, difficulty:"easy", explanation:"CAD = Computer Aided Design." },
  { id:"des2", question:"Factor of safety is the ratio of:", options:["Yield strength to working stress","Applied load to area","Strain to stress","Force to mass"], correct:0, difficulty:"medium", explanation:"FoS = Failure stress / Working stress." },
  { id:"des3", question:"Which material property resists deformation under load?", options:["Ductility","Hardness","Malleability","Brittleness"], correct:1, difficulty:"easy", explanation:"Hardness is resistance to plastic deformation or indentation." },
  { id:"des4", question:"What is fatigue failure?", options:["Sudden overload","Failure under repeated cyclic loading","Corrosion damage","Thermal expansion"], correct:1, difficulty:"medium", explanation:"Fatigue is progressive failure due to repeated stress cycles below yield strength." },
  { id:"des5", question:"Which type of fit allows relative motion between parts?", options:["Interference fit","Clearance fit","Transition fit","Press fit"], correct:1, difficulty:"easy", explanation:"Clearance fit has a gap between shaft and hole allowing movement." },
];

// ────────────────────────────────────────────────────
// 4. CIVIL ENGINEERING
// ────────────────────────────────────────────────────
const STRUCTURES_QUESTIONS: FallbackQuestion[] = [
  { id:"str1", question:"What is the bending moment at a free end of a cantilever beam?", options:["Maximum","Minimum","Zero","Constant"], correct:2, difficulty:"easy", explanation:"Bending moment is zero at the free end of a cantilever." },
  { id:"str2", question:"RCC stands for:", options:["Reinforced Cement Concrete","Raw Cement Composite","Rigid Core Concrete","Refined Clay Compound"], correct:0, difficulty:"easy", explanation:"RCC = Reinforced Cement Concrete." },
  { id:"str3", question:"Which material is weak in tension?", options:["Steel","Concrete","Aluminum","Timber"], correct:1, difficulty:"easy", explanation:"Concrete is strong in compression but weak in tension." },
  { id:"str4", question:"Moment of inertia is related to:", options:["Resistance to bending","Weight of structure","Temperature change","Chemical composition"], correct:0, difficulty:"medium", explanation:"Moment of inertia indicates a section's resistance to bending." },
  { id:"str5", question:"A truss member can carry:", options:["Only axial loads","Only bending","Only torsion","All types"], correct:0, difficulty:"medium", explanation:"Truss members carry only axial tension or compression." },
];

const GEOTECHNICAL_QUESTIONS: FallbackQuestion[] = [
  { id:"geo1", question:"What is the Atterberg limit that separates plastic and liquid states?", options:["Plastic Limit","Liquid Limit","Shrinkage Limit","Flow Limit"], correct:1, difficulty:"medium", explanation:"Liquid Limit is the water content boundary between plastic and liquid states." },
  { id:"geo2", question:"The bearing capacity of soil depends on:", options:["Color","Type and strength","Temperature","Humidity"], correct:1, difficulty:"easy", explanation:"Bearing capacity depends on soil type, cohesion, and angle of internal friction." },
  { id:"geo3", question:"What is the void ratio?", options:["Volume of voids / Volume of solids","Volume of water / Volume of voids","Mass of water / Mass of solids","Volume of air / Total volume"], correct:0, difficulty:"medium", explanation:"Void ratio e = Volume of voids / Volume of solids." },
  { id:"geo4", question:"Standard Penetration Test (SPT) measures:", options:["pH of soil","Relative density of soil","Temperature","Moisture content"], correct:1, difficulty:"easy", explanation:"SPT gives the relative density or consistency of soil." },
  { id:"geo5", question:"Clay soil has high:", options:["Permeability","Plasticity","Grain size","Porosity"], correct:1, difficulty:"easy", explanation:"Clay has very high plasticity due to fine particle size." },
];

const HYDRAULICS_QUESTIONS: FallbackQuestion[] = [
  { id:"hyd1", question:"Bernoulli's equation assumes:", options:["Viscous flow","Ideal incompressible flow","Turbulent flow","Supersonic flow"], correct:1, difficulty:"medium", explanation:"Bernoulli's equation applies to ideal, incompressible, irrotational flow." },
  { id:"hyd2", question:"Unit of discharge is:", options:["m/s","m²/s","m³/s","m³"], correct:2, difficulty:"easy", explanation:"Discharge Q = A × V, so unit is m³/s." },
  { id:"hyd3", question:"Manning's equation is used for:", options:["Pipe flow","Open channel flow","Groundwater flow","Tidal flow"], correct:1, difficulty:"medium", explanation:"Manning's equation estimates velocity in open channel flow." },
  { id:"hyd4", question:"What is a weir used for?", options:["Measuring flow rate","Storing water","Purifying water","Generating electricity"], correct:0, difficulty:"easy", explanation:"A weir is a barrier used to measure or control water flow." },
  { id:"hyd5", question:"Hydraulic gradient line represents:", options:["Total energy","Pressure head + Elevation head","Only velocity head","Ground slope"], correct:1, difficulty:"medium", explanation:"HGL = Pressure Head + Elevation Head (no velocity head)." },
];

const SURVEYING_QUESTIONS: FallbackQuestion[] = [
  { id:"sur1", question:"GPS stands for:", options:["Global Positioning System","General Place System","Geographic Point Standard","Ground Place Sensor"], correct:0, difficulty:"easy", explanation:"GPS = Global Positioning System." },
  { id:"sur2", question:"Leveling is done to:", options:["Measure horizontal angles","Find elevation differences","Determine soil type","Measure distances"], correct:1, difficulty:"easy", explanation:"Leveling determines elevation differences between points." },
  { id:"sur3", question:"A theodolite measures:", options:["Only horizontal angles","Both horizontal and vertical angles","Only distances","Only elevations"], correct:1, difficulty:"easy", explanation:"A theodolite measures both horizontal and vertical angles." },
  { id:"sur4", question:"Contour lines that are close together indicate:", options:["Flat terrain","Steep slope","Water body","Depression"], correct:1, difficulty:"easy", explanation:"Closely spaced contour lines indicate a steep slope." },
  { id:"sur5", question:"Chain surveying is suitable for:", options:["Mountainous terrain","Small flat areas","Urban areas","Under water"], correct:1, difficulty:"easy", explanation:"Chain surveying works best for small, relatively flat areas." },
];

// ────────────────────────────────────────────────────
// 5. MANAGEMENT / MBA
// ────────────────────────────────────────────────────
const MARKETING_QUESTIONS: FallbackQuestion[] = [
  { id:"mkt1", question:"The 4Ps of marketing are:", options:["Price, Place, Promotion, Product","People, Process, Plan, Profit","Power, Position, Pace, Purpose","Price, Plan, Product, Publicity"], correct:0, difficulty:"easy", explanation:"4Ps: Product, Price, Place, Promotion." },
  { id:"mkt2", question:"STP in marketing stands for:", options:["Sales, Trade, Profit","Segmentation, Targeting, Positioning","Strategy, Tactics, Planning","Supply, Transfer, Pricing"], correct:1, difficulty:"easy", explanation:"STP = Segmentation, Targeting, Positioning." },
  { id:"mkt3", question:"What is brand equity?", options:["Total revenue","Value derived from brand name","Manufacturing cost","Market share"], correct:1, difficulty:"medium", explanation:"Brand equity is the commercial value from consumer perception of the brand name." },
  { id:"mkt4", question:"Which pricing strategy sets initially high prices?", options:["Penetration","Skimming","Cost-plus","Competitive"], correct:1, difficulty:"medium", explanation:"Price skimming sets high initial prices to maximize revenue from early adopters." },
  { id:"mkt5", question:"AIDA model stands for:", options:["Attention Interest Desire Action","Awareness Information Decision Acceptance","Analysis Implementation Design Assessment","Attract Interest Decide Act"], correct:0, difficulty:"medium", explanation:"AIDA: Attention → Interest → Desire → Action in consumer purchase journey." },
];

const FINANCE_QUESTIONS: FallbackQuestion[] = [
  { id:"fin1", question:"What is the formula for ROI?", options:["(Revenue - Cost) / Cost","Revenue / Assets","Profit / Equity","Sales / Capital"], correct:0, difficulty:"easy", explanation:"ROI = (Net Profit / Cost of Investment) × 100." },
  { id:"fin2", question:"NPV stands for:", options:["Net Present Value","National Profit Venture","Nominal Percentage Value","Net Product Value"], correct:0, difficulty:"easy", explanation:"NPV = Net Present Value, used in capital budgeting." },
  { id:"fin3", question:"Current Ratio measures:", options:["Profitability","Liquidity","Solvency","Efficiency"], correct:1, difficulty:"easy", explanation:"Current Ratio = Current Assets / Current Liabilities — measures short-term liquidity." },
  { id:"fin4", question:"Which financial statement shows a company's assets and liabilities?", options:["Income Statement","Balance Sheet","Cash Flow Statement","Profit & Loss"], correct:1, difficulty:"easy", explanation:"The Balance Sheet reports assets, liabilities, and equity at a point in time." },
  { id:"fin5", question:"Beta coefficient measures:", options:["Company size","Market risk/volatility","Debt ratio","Revenue growth"], correct:1, difficulty:"medium", explanation:"Beta measures a stock's volatility relative to the overall market." },
];

const HR_QUESTIONS: FallbackQuestion[] = [
  { id:"hr1", question:"What does KPI stand for?", options:["Key Performance Indicator","Knowledge Process Integration","Key Planning Index","Known Productivity Input"], correct:0, difficulty:"easy", explanation:"KPI = Key Performance Indicator." },
  { id:"hr2", question:"Maslow's hierarchy has how many levels?", options:["3","4","5","6"], correct:2, difficulty:"easy", explanation:"Maslow's hierarchy: Physiological, Safety, Social, Esteem, Self-Actualization." },
  { id:"hr3", question:"360-degree feedback involves:", options:["Only manager review","Feedback from all directions (peers, subordinates, managers)","Self-review only","Customer feedback only"], correct:1, difficulty:"medium", explanation:"360° feedback collects input from supervisors, peers, subordinates, and self." },
  { id:"hr4", question:"What is attrition rate?", options:["Speed of hiring","Rate of employee turnover","Production efficiency","Profit margin"], correct:1, difficulty:"easy", explanation:"Attrition rate = percentage of employees leaving the organization." },
  { id:"hr5", question:"HRIS stands for:", options:["Human Resource Information System","High Revenue Internal System","HR Integration Software","Human Relations Incentive Scheme"], correct:0, difficulty:"easy", explanation:"HRIS = Human Resource Information System." },
];

const OPS_QUESTIONS: FallbackQuestion[] = [
  { id:"ops1", question:"JIT in operations stands for:", options:["Just In Time","Job Information Technology","Joint Integration Testing","Junior Internal Transfer"], correct:0, difficulty:"easy", explanation:"JIT = Just In Time manufacturing to reduce waste." },
  { id:"ops2", question:"What does EOQ stand for?", options:["Economic Order Quantity","External Operations Quality","End of Quarter","Employee Output Quality"], correct:0, difficulty:"easy", explanation:"EOQ = Economic Order Quantity — optimal order size to minimize cost." },
  { id:"ops3", question:"Which tool is used for project scheduling?", options:["SWOT","Gantt Chart","BCG Matrix","PEST"], correct:1, difficulty:"easy", explanation:"Gantt Charts visually schedule project tasks over time." },
  { id:"ops4", question:"TQM stands for:", options:["Total Quality Management","Time Queue Model","Technical Quota Metrics","Transfer Quality Method"], correct:0, difficulty:"easy", explanation:"TQM = Total Quality Management." },
  { id:"ops5", question:"FIFO and LIFO are methods used in:", options:["File management","Inventory valuation","HR planning","Marketing"], correct:1, difficulty:"medium", explanation:"FIFO and LIFO are inventory valuation methods in accounting." },
];

const STRATEGY_QUESTIONS: FallbackQuestion[] = [
  { id:"stg1", question:"Porter's Five Forces does NOT include:", options:["Threat of new entrants","Bargaining power of suppliers","Government regulation","Rivalry among existing firms"], correct:2, difficulty:"medium", explanation:"Porter's 5: Rivalry, New Entrants, Substitutes, Buyer Power, Supplier Power." },
  { id:"stg2", question:"SWOT stands for:", options:["Strengths Weaknesses Opportunities Threats","Strategy Work Output Targets","System Workflow Optimization Technique","Standard Work Operations Template"], correct:0, difficulty:"easy", explanation:"SWOT = Strengths, Weaknesses, Opportunities, Threats." },
  { id:"stg3", question:"Blue Ocean Strategy means:", options:["Competing in existing markets","Creating uncontested market space","Reducing prices","Increasing advertising"], correct:1, difficulty:"medium", explanation:"Blue Ocean = creating new market space where competition is irrelevant." },
  { id:"stg4", question:"BCG Matrix classifies products as:", options:["Stars, Cash Cows, Question Marks, Dogs","Leaders, Followers, Challengers, Nichers","Growth, Mature, Decline, Introduction","High, Medium, Low, Zero"], correct:0, difficulty:"medium", explanation:"BCG Matrix: Stars, Cash Cows, Question Marks, Dogs based on growth and market share." },
  { id:"stg5", question:"First mover advantage refers to:", options:["Being the cheapest","Entering a market first","Having the most employees","Oldest company in the market"], correct:1, difficulty:"easy", explanation:"First mover advantage: benefits of being the first to enter a market." },
];

// ────────────────────────────────────────────────────
// SECTION DEFINITIONS (names match backend STREAM_SECTIONS)
// ────────────────────────────────────────────────────

export const CS_FALLBACK_SECTIONS: FallbackSection[] = [
  { id: "aptitude", name: "Aptitude",  icon: "🧮", timeLimit: 25, questions: APTITUDE_QUESTIONS },
  { id: "dsa",     name: "DSA",       icon: "🌳", timeLimit: 25, questions: DSA_QUESTIONS },
  { id: "dbms",    name: "DBMS",      icon: "🗄️", timeLimit: 25, questions: DBMS_QUESTIONS },
  { id: "os",      name: "OS",        icon: "⚙️", timeLimit: 25, questions: OS_QUESTIONS },
  { id: "cn",      name: "CN",        icon: "🌐", timeLimit: 25, questions: CN_QUESTIONS },
  { id: "oops",    name: "OOPS",      icon: "🔷", timeLimit: 25, questions: OOPS_QUESTIONS },
];

export const ELECTRICAL_FALLBACK_SECTIONS: FallbackSection[] = [
  { id: "aptitude",   name: "Aptitude",    icon: "🧮", timeLimit: 25, questions: APTITUDE_QUESTIONS },
  { id: "circuits",   name: "Circuits",    icon: "⚡", timeLimit: 25, questions: CIRCUITS_QUESTIONS },
  { id: "machines",   name: "Machines",    icon: "📟", timeLimit: 25, questions: MACHINES_QUESTIONS },
  { id: "electronics",name: "Electronics", icon: "🔌", timeLimit: 25, questions: ELECTRONICS_QUESTIONS },
  { id: "embedded",   name: "Embedded",    icon: "💾", timeLimit: 25, questions: EMBEDDED_QUESTIONS },
  { id: "signals",    name: "Signals",     icon: "📉", timeLimit: 25, questions: SIGNALS_QUESTIONS },
];

export const MECHANICAL_FALLBACK_SECTIONS: FallbackSection[] = [
  { id: "aptitude",      name: "Aptitude",       icon: "🧮", timeLimit: 25, questions: APTITUDE_QUESTIONS },
  { id: "thermodynamics",name: "Thermodynamics", icon: "🔥", timeLimit: 25, questions: THERMO_QUESTIONS },
  { id: "mechanics",     name: "Mechanics",      icon: "⚙️", timeLimit: 25, questions: MECHANICS_QUESTIONS },
  { id: "manufacturing", name: "Manufacturing",  icon: "🏭", timeLimit: 25, questions: MANUFACTURING_QUESTIONS },
  { id: "design",        name: "Design",         icon: "🏗️", timeLimit: 25, questions: DESIGN_QUESTIONS },
];

export const CIVIL_FALLBACK_SECTIONS: FallbackSection[] = [
  { id: "aptitude",    name: "Aptitude",     icon: "🧮", timeLimit: 25, questions: APTITUDE_QUESTIONS },
  { id: "structures",  name: "Structures",   icon: "🏗️", timeLimit: 25, questions: STRUCTURES_QUESTIONS },
  { id: "geotechnical",name: "Geotechnical", icon: "🌍", timeLimit: 25, questions: GEOTECHNICAL_QUESTIONS },
  { id: "hydraulics",  name: "Hydraulics",   icon: "💧", timeLimit: 25, questions: HYDRAULICS_QUESTIONS },
  { id: "surveying",   name: "Surveying",    icon: "🗺️", timeLimit: 25, questions: SURVEYING_QUESTIONS },
];

export const MANAGEMENT_FALLBACK_SECTIONS: FallbackSection[] = [
  { id: "aptitude",  name: "Aptitude",  icon: "🧮", timeLimit: 25, questions: APTITUDE_QUESTIONS },
  { id: "marketing", name: "Marketing", icon: "🎨", timeLimit: 25, questions: MARKETING_QUESTIONS },
  { id: "finance",   name: "Finance",   icon: "💰", timeLimit: 25, questions: FINANCE_QUESTIONS },
  { id: "hr",        name: "HR",        icon: "👥", timeLimit: 25, questions: HR_QUESTIONS },
  { id: "ops",       name: "Ops",       icon: "📦", timeLimit: 25, questions: OPS_QUESTIONS },
  { id: "strategy",  name: "Strategy",  icon: "♟️", timeLimit: 25, questions: STRATEGY_QUESTIONS },
];

export const COMMERCE_FALLBACK_SECTIONS: FallbackSection[] = [
  { id: "aptitude",   name: "Aptitude",   icon: "🧮", timeLimit: 25, questions: APTITUDE_QUESTIONS },
  { id: "accounting", name: "Accounting", icon: "📊", timeLimit: 25, questions: FINANCE_QUESTIONS },
  { id: "taxation",   name: "Taxation",   icon: "💰", timeLimit: 25, questions: FINANCE_QUESTIONS },
  { id: "economics",  name: "Economics",  icon: "📈", timeLimit: 25, questions: OPS_QUESTIONS },
  { id: "law",        name: "Law",        icon: "⚖️", timeLimit: 25, questions: STRATEGY_QUESTIONS },
];

/**
 * Helper to scale a question list to exactly targetCount by repeating and shuffling.
 * This ensures the user gets the requested volume (e.g. 20 questions) even in fallback.
 */
const scaleToCount = (questions: FallbackQuestion[], targetCount: number): FallbackQuestion[] => {
  if (questions.length === 0) return [];
  
  const result: FallbackQuestion[] = [...questions];
  let index = 0;
  
  while (result.length < targetCount) {
    const q = questions[index % questions.length];
    // Append with a unique ID to avoid React key issues
    result.push({
      ...q,
      id: `${q.id}_v${Math.floor(result.length / questions.length)}` 
    });
    index++;
  }
  
  return result.slice(0, targetCount);
};

export const IOT_FALLBACK_SECTIONS: FallbackSection[] = [
  { id: "aptitude",     name: "Aptitude",     icon: "🧮", timeLimit: 25, questions: APTITUDE_QUESTIONS },
  { id: "sensors",      name: "Sensors",      icon: "🌡️", timeLimit: 25, questions: CIRCUITS_QUESTIONS },
  { id: "connectivity", name: "Connectivity", icon: "📶", timeLimit: 25, questions: CN_QUESTIONS },
  { id: "protocols",    name: "Protocols",    icon: "🔗", timeLimit: 25, questions: CN_QUESTIONS },
  { id: "robotics",     name: "Robotics",     icon: "🤖", timeLimit: 25, questions: EMBEDDED_QUESTIONS },
  { id: "security",     name: "Security",     icon: "🔒", timeLimit: 25, questions: ELECTRONICS_QUESTIONS },
];

export const SCIENCE_FALLBACK_SECTIONS: FallbackSection[] = [
  { id: "aptitude",      name: "Aptitude",       icon: "🧮", timeLimit: 25, questions: APTITUDE_QUESTIONS },
  { id: "corescience",   name: "CoreScience",    icon: "🔬", timeLimit: 25, questions: THERMO_QUESTIONS },
  { id: "appliedscience",name: "AppliedScience", icon: "🧪", timeLimit: 25, questions: MECHANICS_QUESTIONS },
  { id: "data",          name: "Data",           icon: "📊", timeLimit: 25, questions: APTITUDE_QUESTIONS },
];

export const ARTS_FALLBACK_SECTIONS: FallbackSection[] = [
  { id: "aptitude",   name: "Aptitude",   icon: "🧮", timeLimit: 25, questions: APTITUDE_QUESTIONS },
  { id: "humanities", name: "Humanities", icon: "📖", timeLimit: 25, questions: STRATEGY_QUESTIONS },
  { id: "expression", name: "Expression", icon: "✍️", timeLimit: 25, questions: APTITUDE_QUESTIONS },
  { id: "social",     name: "Social",     icon: "🌍", timeLimit: 25, questions: HR_QUESTIONS },
];

// ────────────────────────────────────────────────────
// FIELD RESOLVER
// ────────────────────────────────────────────────────
export const getFallbackByField = (field: string): FallbackSection[] => {
  const f = field.toLowerCase();
  let baseSections: FallbackSection[] = [];

  // Computer Science / IT / CSE
  if (f.includes('computer') || f.includes('software') || f.includes('cse') || f.includes('it') || f.includes('info') || f.includes('bca') || f.includes('mca') || f.includes('csc')) {
    baseSections = CS_FALLBACK_SECTIONS;
  }
  // Electronics / Electrical
  else if (f.includes('electronics') || f.includes('electrical') || f.includes('ece') || f.includes('eee')) {
    baseSections = ELECTRICAL_FALLBACK_SECTIONS;
  }
  // Mechanical
  else if (f.includes('mechanical') || f.includes('mech') || f.includes('automobile')) {
    baseSections = MECHANICAL_FALLBACK_SECTIONS;
  }
  // Civil
  else if (f.includes('civil')) {
    baseSections = CIVIL_FALLBACK_SECTIONS;
  }
  // Management / MBA
  else if (f.includes('manage') || f.includes('mba') || f.includes('bba') || f.includes('pgdm') || f.includes('business')) {
    baseSections = MANAGEMENT_FALLBACK_SECTIONS;
  }
  // Commerce
  else if (f.includes('commer') || f.includes('bcom') || f.includes('account') || f.includes('taxation') || f.includes('finan')) {
    baseSections = COMMERCE_FALLBACK_SECTIONS;
  }
  // IoT / Robotics
  else if (f.includes('iot') || f.includes('robotics') || f.includes('mechatronics')) {
    baseSections = IOT_FALLBACK_SECTIONS;
  }
  // Science
  else if (f.includes('bsc') || f.includes('msc') || f.includes('science') || f.includes('physics') || f.includes('chemistry') || f.includes('biology') || f.includes('math')) {
    baseSections = SCIENCE_FALLBACK_SECTIONS;
  }
  // Arts / Humanities
  else if (f.includes('ba') || f.includes('ma') || f.includes('arts') || f.includes('humanities') || f.includes('sociology') || f.includes('psychology') || f.includes('history')) {
    baseSections = ARTS_FALLBACK_SECTIONS;
  }
  else {
    baseSections = CS_FALLBACK_SECTIONS;
  }

  // SCALE ALL SECTIONS TO 20 QUESTIONS
  return baseSections.map(s => ({
    ...s,
    questions: scaleToCount(s.questions, 20)
  }));
};

/**
 * NEW: Skill-based resolver for Stage 2
 */
export const getFallbackBySkills = (_skills: string[]): FallbackSection[] => {
  // If user has specific skills, we should ideally map them, 
  // but for a universal fallback, we provide the Technical Depth mix.
  const technicalDepth: FallbackSection = {
    id: "tech-depth",
    name: "Technical Depth",
    icon: "⚙️",
    timeLimit: 25,
    questions: scaleToCount(TECHNICAL_SKILL_QUESTIONS, 20)
  };

  return [technicalDepth];
};

export default CS_FALLBACK_SECTIONS;
