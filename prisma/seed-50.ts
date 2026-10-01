import { PrismaClient, Role, IdeaStatus, VoteType, PaymentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting 50-Item Realistic EcoSpark Hub Database Seeding...");

  // 1. Ensure Categories Exist
  const categoryDefs = [
    { name: "Renewable Energy", description: "Solar, wind, hydro, and clean energy innovations." },
    { name: "Waste Reduction", description: "Zero-waste solutions, composting, and recycling projects." },
    { name: "Water Conservation", description: "Rainwater harvesting, clean water, and watershed protection." },
    { name: "Sustainable Transport", description: "EV solutions, cycling infrastructure, and shared mobility." },
    { name: "Smart Agro-Forestry", description: "Innovations merging agriculture with native tree canopy regeneration." },
    { name: "Eco Living", description: "Sustainable lifestyle, urban farming, and green products." },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoryDefs) {
    const record = await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description },
      create: cat,
    });
    categoryMap.set(record.name, record.id);
  }
  console.log("✅ Categories verified & mapped");

  // 2. Ensure Users Exist (Admin + 7 Diverse Members)
  const defaultPasswordHash = await bcrypt.hash("password123", 10);
  const adminPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 12);

  const usersData = [
    {
      name: "EcoSpark Admin",
      email: process.env.ADMIN_EMAIL || "admin@ecospark.com",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "EcoSpark Member",
      email: "member@ecospark.com",
      passwordHash: defaultPasswordHash,
      role: Role.MEMBER,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Sarah Green",
      email: "sarah@ecospark.com",
      passwordHash: defaultPasswordHash,
      role: Role.MEMBER,
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Rafiqul Islam",
      email: "rafiqul@ecospark.com",
      passwordHash: defaultPasswordHash,
      role: Role.MEMBER,
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Elena Rostova",
      email: "elena@ecospark.com",
      passwordHash: defaultPasswordHash,
      role: Role.MEMBER,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Kavita Patel",
      email: "kavita@ecospark.com",
      passwordHash: defaultPasswordHash,
      role: Role.MEMBER,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Liam Chen",
      email: "liam@ecospark.com",
      passwordHash: defaultPasswordHash,
      role: Role.MEMBER,
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Amina Al-Mansoor",
      email: "amina@ecospark.com",
      passwordHash: defaultPasswordHash,
      role: Role.MEMBER,
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    },
  ];

  const userIds: string[] = [];
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { image: u.image },
      create: {
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        role: u.role,
        isActive: true,
        image: u.image,
      },
    });
    userIds.push(user.id);
  }
  console.log(`✅ Seeded & mapped ${userIds.length} community users`);

  // 3. 50 Realistic Sustainability Ideas Dataset
  const ideasRaw = [
    // --- Renewable Energy (10 ideas) ---
    {
      title: "Community Solar Microgrid & Shared Storage",
      category: "Renewable Energy",
      problem: "High peak electricity costs and fossil-fuel grid dependency during summer brownouts.",
      solution: "Install decentralized rooftop solar arrays with localized lithium-iron phosphate battery storage shared across 40 residential households.",
      description: "A community-owned microgrid architecture allowing neighbors to trade clean kilowatt-hours with smart metering and real-time mobile tracking. Features open-source telemetry and peak-shaving automation.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Vertical Axis Micro-Wind Turbines for Urban Balconies",
      category: "Renewable Energy",
      problem: "City apartment residents lack roof space for solar panels while facing turbulent high-velocity wind drafts between skyscrapers.",
      solution: "Silent, omnidirectional helical vertical-axis wind turbines designed for balcony railings with integrated plug-in microinverters.",
      description: "Complete manufacturing schematics and wind tunnel performance charts for a 350W Savonius-Darrieus hybrid turbine fabricated with recycled aluminum and 3D printed aerodynamic fairings.",
      isPaid: true,
      price: 650.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Piezoelectric Kinetic Footstep Pavers for Public Transit Stations",
      category: "Renewable Energy",
      problem: "Heavy foot traffic in metro terminals and railway concourses dissipates vast amounts of kinetic energy as unharvested heat.",
      solution: "Modular interlocking floor tiles with encapsulated PZT piezoelectric ceramic transducers that convert mechanical pressure into stored DC voltage.",
      description: "A turnkey civic installation kit capable of harvesting up to 5 watt-seconds per step. Powers LED transit signage, ticket kiosk backlights, and emergency pathway lighting.",
      isPaid: true,
      price: 850.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Solar-Powered Agri-Voltaic Greenhouse Heating System",
      category: "Renewable Energy",
      problem: "Winter greenhouse agriculture requires high-cost propane or diesel heating, driving heavy carbon emissions and farmer financial strain.",
      solution: "Semi-transparent bifacial solar panels installed on greenhouse gables paired with thermal sand-battery heat banks for night radiation.",
      description: "Full CAD schematics, thermal insulation calculations, and automated vent microcontroller source code that keeps greenhouse interiors at 21°C using 100% solar capture.",
      isPaid: true,
      price: 1200.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Neighborhood EV Battery Second-Life Energy Storage Bank",
      category: "Renewable Energy",
      problem: "Retired electric vehicle battery packs retain 70-80% capacity but are discarded into hazardous storage before recycling channels exist.",
      solution: "Repurpose decommissioned Nissan Leaf and Chevy Bolt battery modules into 48V stationary energy banks for neighborhood solar backup.",
      description: "Detailed BMS (Battery Management System) wiring safety guidelines, active cell balancing circuits, fireproof containment blueprints, and safety certification checklists.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1558441719-8b489c63f7d1?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Solar Cooker with Vacuum Tube Thermal Storage for Rural Areas",
      category: "Renewable Energy",
      problem: "Over 2 billion people rely on firewood and kerosene for cooking, causing severe indoor air pollution and widespread deforestation.",
      solution: "Parabolic compound solar concentrator with evacuated glass tubes and phase-change paraffin wax storing cooking heat until after sunset.",
      description: "Step-by-step DIY construction manual using local recycled sheet metal and standard solar thermal collector tubes. Reaches 240°C cooking temperatures without fuel.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Ultra-Low-Head Micro Hydro Generator for Irrigation Canals",
      category: "Renewable Energy",
      problem: "Flat agricultural irrigation canals have continuous water flow under 1 meter of head that is completely ignored for electricity generation.",
      solution: "Submersible Archimedes screw turbine made from recycled HDPE plastic running low-RPM permanent magnet alternators.",
      description: "Generates 1.2 kW continuous off-grid electricity directly from agricultural ditches to power drip pumps and perimeter electric fences.",
      isPaid: true,
      price: 750.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Community Gravity-Energy Storage Tower Prototype",
      category: "Renewable Energy",
      problem: "Chemical battery storage relies on toxic lithium, cobalt, and rare earths that degrade over 5-10 years and create massive e-waste.",
      solution: "A 12-meter winch tower that lifts 2-ton recycled concrete blocks during peak solar hours and drops them through dynamos at dusk.",
      description: "Mechanical engineering blueprint for 40-year lifespan mechanical gravity energy storage. Zero toxic chemicals, 78% round-trip efficiency.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Bi-Directional Rooftop Thermal Radiative Cooling Panels",
      category: "Renewable Energy",
      problem: "Air conditioning consumption accounts for over 20% of global building electricity, creating massive urban heat island effects.",
      solution: "Reflective sub-ambient radiative cooling panels that beam heat directly into cold deep space via the atmospheric infrared transparency window.",
      description: "Passive daytime cooling panels that reduce roof skin temperatures by up to 6°C without any electricity input. Complete material formulation guide.",
      isPaid: false,
      price: null,
      status: IdeaStatus.UNDER_REVIEW,
      images: ["https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Perovskite-Silicon Tandem Solar Retrofit Coating",
      category: "Renewable Energy",
      problem: "Existing rooftop photovoltaic installations operate at legacy 16% efficiencies with high replacement costs for entire module arrays.",
      solution: "Solution-processed sprayable perovskite top-layer chemistry designed to boost legacy silicon module efficiency to 28%.",
      description: "Chemical composition specs and laboratory deposition protocols for laboratory researchers and clean-tech manufacturing cooperatives.",
      isPaid: false,
      price: null,
      status: IdeaStatus.DRAFT,
      images: ["https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80"],
    },

    // --- Waste Reduction (10 ideas) ---
    {
      title: "Zero-Waste Hyperlocal Composting Hubs",
      category: "Waste Reduction",
      problem: "Over 60% of municipal landfill waste consists of compostable organic matter generating methane emissions.",
      solution: "Establish neighborhood vermicomposting collection bins with an odor-free biofilter and reward tokens for households that divert kitchen scraps.",
      description: "An integrated urban organic waste diversion model connecting restaurants and families with community gardens needing nutrient-rich organic soil.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Precious Plastic Desktop Injection Molding Machine",
      category: "Waste Reduction",
      problem: "Shredded plastic bottle caps (HDPE/PP) cannot easily be reprocessed by individual makers and schools into valuable everyday goods.",
      solution: "Open-hardware temperature-regulated thermal injection molder capable of producing carabiners, tile coasters, and comb products from sorted waste.",
      description: "Full laser-cut DXF metal plates, PID temperature controller code, and step-by-step assembly instructions for building a sub-$200 plastic foundry.",
      isPaid: true,
      price: 550.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Automated AI Waste Sorting Trash Can with Edge Computer Vision",
      category: "Waste Reduction",
      problem: "Public contamination of recycling bins ruins 30% of otherwise recyclable paper and plastics, forcing entire batches to landfills.",
      solution: "Raspberry Pi equipped with a coral TPU running a lightweight YOLOv8 model that classifies waste and pivots an internal diverter plate.",
      description: "Python inference code, CAD 3D print files for the motorized dual-compartment flap, and training dataset of 5,000 localized beverage packaging images.",
      isPaid: true,
      price: 900.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Mycelium Packaging Growth Incubator Blueprint",
      category: "Waste Reduction",
      problem: "Expanded polystyrene (Styrofoam) takes over 500 years to degrade and breaks down into deadly microplastics in oceans and soils.",
      solution: "Grow 100% biodegradable shock-absorbent packaging cushions from agricultural hemp husks and oyster mushroom (Pleurotus ostreatus) mycelium.",
      description: "Complete incubation humidity schedules, custom vacuum-form negative mold blueprints, and baking recipes to render the fungal material water-resistant.",
      isPaid: true,
      price: 450.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Campus Reusable Container Deposit & Smart Return Lockers",
      category: "Waste Reduction",
      problem: "University and tech office cafeterias generate tens of thousands of single-use takeout containers every semester.",
      solution: "A closed-loop stainless steel container borrow network with QR-code smart lockers that refund deposits upon automated UV-disinfection return.",
      description: "System architecture, RFID tag embedding guide, washing and sanitation SOPs, and React Native mobile borrow-app open-source codebase.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1526951521990-620dc14c214b?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Black Soldier Fly Larvae (BSFL) Rapid Protein Waste Digester",
      category: "Waste Reduction",
      problem: "Meat, dairy, and oily food scraps decompose poorly in traditional worm bins and emit offensive odors that attract vermin.",
      solution: "Hermetia illucens automated bio-converter that devours tough food waste within 48 hours, producing rich frass fertilizer and chicken feed.",
      description: "Climate-controlled rearing chamber blueprints, auto-harvesting ramp designs, and odor-mitigating bio-filtration sponge specifications.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Textile Waste Upcycling to Acoustic Insulation Panels",
      category: "Waste Reduction",
      problem: "Fast fashion generates tons of unsellable synthetic blended clothing that incinerators and textile recyclers reject.",
      solution: "Low-pressure shredding and non-toxic starch-based binding process transforming discarded denim and fleece into studio soundproofing tiles.",
      description: "Laboratory acoustic absorption test reports (NRC 0.85), hydraulic press fabrication blueprints, and natural borax fire-retardant dip formulation.",
      isPaid: true,
      price: 600.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Community Tool Library & Repair Cafe Operations Guide",
      category: "Waste Reduction",
      problem: "Households purchase expensive power tools used for an average of 13 minutes in their lifetime before gathering dust and disposal.",
      solution: "An operational blueprint for community lending tool sheds, volunteer repair cafes, safety waivers, and open inventory management.",
      description: "Includes tool cataloging database schemas, volunteer liability release forms, recommended starter toolkits, and membership fee models.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Single-Stream Cigarette Butt Toxic Waste Recycling Process",
      category: "Waste Reduction",
      problem: "Cellulose acetate cigarette filters are the #1 most littered item worldwide, leaching toxic heavy metals into urban storm drains.",
      solution: "Community collection canisters and gamma-sterilized chemical bath separating toxic tar residues for asphalt binder and clean plastic pellets.",
      description: "Collection receptacle design drawings, municipal placement strategy, and chemical wash recycling documentation.",
      isPaid: false,
      price: null,
      status: IdeaStatus.UNDER_REVIEW,
      images: ["https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Direct Thermal Depolymerization of Unsorted Marine Plastics",
      category: "Waste Reduction",
      problem: "Mixed ocean trash contains salt and biofouling that prevents conventional mechanical recycling.",
      solution: "Small-scale continuous pyrolysis reactor turning beach plastics into heavy marine diesel fuel.",
      description: "Needs further validation on emissions scrubbers and chlorine release mitigation before public release.",
      isPaid: false,
      price: null,
      status: IdeaStatus.REJECTED,
      feedback: "Please provide third-party dioxin emission test results and an emergency scrubbing procedure before this can be approved for community builders.",
      images: ["https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=1200&q=80"],
    },

    // --- Water Conservation (9 ideas) ---
    {
      title: "IoT Smart Rainwater Harvesting & Filtration Blueprint",
      category: "Water Conservation",
      problem: "Urban groundwater depletion and seasonal stormwater flooding causing street runoff contamination.",
      solution: "Automated modular rainwater cisterns with ultrasonic depth sensors, pre-sediment leaf filters, and UV-sterilization for non-potable household reuse.",
      description: "Comprehensive step-by-step engineering blueprint and microcontroller code for building an autonomous 2000-liter rooftop rainwater catchment system.",
      isPaid: true,
      price: 450.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1519692933481-e162a57d6721?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Greywater Subsurface Reed Bed Wetland System for Rural Homes",
      category: "Water Conservation",
      problem: "Sink, shower, and laundry wastewater is dumped into open surface ditches, creating mosquito breeding grounds and pathogens.",
      solution: "Gravel and Phragmites australis biological reed bed filter that naturally purifies household greywater for orchard irrigation.",
      description: "Flow rate dimensioning calculator, liner installation guide, root-depth recommendations, and winter freeze-protection steps for a zero-chemical system.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Fog Netting Condensation Collector for Arid Coastal Mountains",
      category: "Water Conservation",
      problem: "Coastal mountain communities in arid regions have high humidity and dense fog banks but almost zero measurable rainfall.",
      solution: "Double-layer polyolefin mesh screens stretched between tension cables that condense windblown fog droplets into gravity supply pipes.",
      description: "Structural wind resistance formulas, mesh weave optimization specs, and 500-liter daily storage tank manifold layouts.",
      isPaid: true,
      price: 500.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1483389127117-b6a2102724ae?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Smart Solar-Powered Soil Moisture Drip Irrigation Controller",
      category: "Water Conservation",
      problem: "Overwatering in home agriculture and small farms wastes up to 50% of pumped well water through surface evaporation and deep percolation.",
      solution: "Capacitive soil moisture sensors linked via ESP32 LoRa nodes to solenoid latching valves that deliver water strictly at dawn and dusk.",
      description: "Full PCB Gerber files, Arduino firmware, 3D printed weatherproof electronics enclosure, and mobile Bluetooth calibration utility.",
      isPaid: true,
      price: 700.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Bioswale Urban Runoff Permeable Sidewalk Infiltration Trench",
      category: "Water Conservation",
      problem: "Impervious concrete and asphalt prevent rainwater infiltration, causing flash urban inundation and river siltation.",
      solution: "Layered sand, crushed volcanic rock, and deep-rooted native grasses that slow, cool, and filter stormwater runoff into underlying aquifers.",
      description: "Municipal civil engineering cross-sections, native sedge plant selection matrices for temperate and subtropical zones, and maintenance schedules.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Low-Cost Solar Still Desalination Array for Coastal Fishermen",
      category: "Water Conservation",
      problem: "Brackish groundwater intrusion and ocean contamination deprive remote coastal villages of potable drinking water during dry seasons.",
      solution: "Cascading glass-topped inclined basin solar still enhanced with activated biochar wick liners producing 4 liters of distilled water daily per square meter.",
      description: "Construction manual utilizing window glass, food-grade EPDM liner, and local bamboo frames. Disinfects 100% of biological waterborne pathogens.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "DIY Atmospheric Water Generator (AWG) with Peltier Dehumidifiers",
      category: "Water Conservation",
      problem: "Emergency disaster scenarios cut off municipal water mains while high ambient humidity remains accessible in tropical air.",
      solution: "A battery-powered portable condensation chamber with heat sinks and high-efficiency HEPA air filtration producing clean emergency water.",
      description: "Wiring schematic, thermoelectric module selection guide, and energy consumption optimization algorithms.",
      isPaid: true,
      price: 800.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Automated Residential Leak Detector with Water Shutoff Motor",
      category: "Water Conservation",
      problem: "Silent toilet flapper leaks and burst hidden pipes waste thousands of gallons of municipal treated water per home each year.",
      solution: "Non-invasive clamp-on ultrasonic pipe transducer that detects constant micro-flows and mechanically rotates the brass ball valve.",
      description: "3D printed motor bracket for standard 3/4-inch ball valves, acoustic pulse analysis code, and push notification alert integration.",
      isPaid: false,
      price: null,
      status: IdeaStatus.UNDER_REVIEW,
      images: ["https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Open Hydroponic Water Recycling Nutrient Closed-Loop",
      category: "Water Conservation",
      problem: "Commercial greenhouse runoff discharges concentrated nitrogen and phosphorus into streams, triggering eutrophication algal blooms.",
      solution: "Micro-algae photobioreactor that strips excess fertilizer salts from runoff water, allowing 100% recirculating irrigation.",
      description: "Drafting complete nutrient balancing sensor code and algae centrifuge separator blueprints.",
      isPaid: false,
      price: null,
      status: IdeaStatus.DRAFT,
      images: ["https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80"],
    },

    // --- Sustainable Transport (8 ideas) ---
    {
      title: "Open-Hardware Cargo E-Bike Conversion Frame Kit",
      category: "Sustainable Transport",
      problem: "Commercial electric cargo bikes cost over $4,000, creating an insurmountable economic barrier for independent couriers and families.",
      solution: "A weldable bolt-on chromoly extension frame that turns standard thrift-store 26-inch bicycles into heavy-duty longtail cargo haulers.",
      description: "Laser-cut tube notching templates, welding jig blueprints, 750W mid-drive motor wiring schematics, and 150 kg payload safety stress FEA reports.",
      isPaid: true,
      price: 950.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Solar-Powered Neighborhood E-Scooter Docking & Charging Hub",
      category: "Sustainable Transport",
      problem: "Dockless micromobility scooters clutter pedestrian sidewalks and depend on carbon-heavy diesel vans collecting them for overnight charging.",
      solution: "A compact curbside solar canopy with inductive charging pads and automatic cable locks powered by high-cycle lithium iron phosphate cells.",
      description: "Station electrical single-line diagrams, solar sizing calculations for 6-scooter bays, and open-source payment & unlocking Bluetooth firmware.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Community Bamboo Bicycle Frame Building Workshop Guide",
      category: "Sustainable Transport",
      problem: "Carbon-fiber and aluminum bike frames carry immense embodied mining footprints and cannot be recycled after structural stress cracks.",
      solution: "Locally grown treated bamboo culms joined with hemp fibers and epoxy lugs, creating vibration-dampening, resilient bicycle frames.",
      description: "Complete frame geometry jig layout, bamboo curing and borax smoking methods, dropouts alignment guide, and stress test documentation.",
      isPaid: true,
      price: 600.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Smart Neighborhood Carpooling Platform for Suburban Commuters",
      category: "Sustainable Transport",
      problem: "90% of suburban commute vehicles have single occupancy during morning rush hours, wasting fuel and choking highways.",
      solution: "A hyperlocal carpool matching platform that groups verified neighbors commuting along the exact same expressway corridors.",
      description: "Algorithm specs for dynamic routing, carbon-offset tracking leaderboards, and community trust verification guidelines.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Solar-Assisted Electric Commuter Boat for Waterway Cities",
      category: "Sustainable Transport",
      problem: "Diesel water taxis and river ferries emit particulate soot, sulfur dioxide, and deafening underwater acoustic noise.",
      solution: "Catamaran hull with 2.4 kW rooftop flexible solar cells and dual brushless electric pod motors for silent passenger transit.",
      description: "Naval architecture hull line offsets, hydrodynamic drag reduction simulations, battery compartment buoyancy calculations, and USCG safety specs.",
      isPaid: true,
      price: 1500.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Protected Pop-Up Bike Lane Quick-Build Tool & Policy Kit",
      category: "Sustainable Transport",
      problem: "Civic bureaucracy delays permanent bicycle infrastructure for years while pedestrian and cyclist injuries continue rising.",
      solution: "A civic action guide for deploying rapid-build planters, reflective flex-posts, and painted buffers to validate cycling demand in 30 days.",
      description: "Traffic safety warrant templates, municipal presentation slides, volunteer painting manuals, and low-cost barrier sourcing vendors.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1519583272095-6433be544606?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Electric School Bus Vehicle-to-Grid (V2G) Peak Shaving Protocol",
      category: "Sustainable Transport",
      problem: "School buses sit idle 80% of the day during the exact afternoon hours when municipal electrical grids experience highest peak demand.",
      solution: "Bidirectional CCS chargers allowing school districts to earn utility grid stabilization revenue by discharging stored bus energy.",
      description: "Telemetry integration specs, battery degradation mitigation algorithms, and utility interconnection contract templates.",
      isPaid: false,
      price: null,
      status: IdeaStatus.UNDER_REVIEW,
      images: ["https://images.unsplash.com/photo-1558441719-8b489c63f7d1?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Hydrogen Fuel Cell Retrofit for Classic Mopeds",
      category: "Sustainable Transport",
      problem: "Two-stroke legacy scooters produce 50x the hydrocarbon emissions of modern cars in developing mega-cities.",
      solution: "Direct replacement of two-stroke engines with high-pressure hydrogen canisters and proton exchange membrane stacks.",
      description: "Rejected due to high explosion risks and lack of certified pressure vessel inspection protocols for DIY home hobbyists.",
      isPaid: false,
      price: null,
      status: IdeaStatus.REJECTED,
      feedback: "High-pressure hydrogen canisters (300+ bar) pose critical home safety hazards. Please replace with low-voltage LFP battery electrification guidelines.",
      images: ["https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80"],
    },

    // --- Smart Agro-Forestry (7 ideas) ---
    {
      title: "Syntropic Agroforestry Multi-Stratum Planting Template",
      category: "Smart Agro-Forestry",
      problem: "Monoculture farming exhausts topsoils, requires massive synthetic pesticides, and decimates local wildlife biodiversity.",
      solution: "Successional multi-layer food forests combining pioneer trees, fruit canopies, and root crops that regenerate degraded land without fertilizer.",
      description: "Complete companion planting matrices, pruning schedules for bio-mass production, and sunlight strata guidelines for 1-acre and 5-acre plots.",
      isPaid: true,
      price: 800.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Autonomous Drone Seed-Bombing for Rapid Reforestation",
      category: "Smart Agro-Forestry",
      problem: "Manual tree planting on steep hillsides and burned forest tracts is prohibitively slow, expensive, and dangerous for field teams.",
      solution: "A payload mechanism for heavy-lift hexacopters that fires nutrient-encapsulated clay seed pellets into soil with pneumatic precision.",
      description: "3D printable seed carousel dispenser CAD files, flight path mission planning scripts, and seed ball recipe with natural chili pepper rodent repellent.",
      isPaid: true,
      price: 1100.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Solar Biochar Pyrolysis Kiln for Soil Carbon Sequestration",
      category: "Smart Agro-Forestry",
      problem: "Agricultural crop residues like rice husks and corn stalks are burned in open fields, creating seasonal respiratory smog crises.",
      solution: "A mobile oxygen-limited Top-Lit UpDraft (TLUD) kiln converting farm waste into porous biochar that stores carbon for millennia.",
      description: "Welding blueprints from recycled steel oil drums, temperature monitoring thermistor guide, and soil microbial inoculation protocols.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Mycorrhizal Fungi Inoculation Protocol for Community Orchards",
      category: "Smart Agro-Forestry",
      problem: "Transplanted fruit and nut saplings suffer high mortality rates from transplant shock and underdeveloped root capillary networks.",
      solution: "Native arbuscular mycorrhizal fungi propagation in sand-vermiculite beds to coat root balls before planting, boosting water uptake by 300%.",
      description: "Step-by-step spore trapping method using sorghum host plants, harvest timing guides, and microscopic spore density verification techniques.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Silvopasture Rotational Grazing Electric Fencing System",
      category: "Smart Agro-Forestry",
      problem: "Livestock overgrazing causes severe soil compaction and deforestation while animals suffer heat exhaustion without natural canopy shade.",
      solution: "Integrate cattle and sheep grazing beneath high-value timber walnut and oak trees with automated solar-powered GPS virtual collar fencing.",
      description: "Pasture rotation calculations per animal unit, tree protection bark guards, and forage grass mix recommendations for partial shade.",
      isPaid: true,
      price: 750.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Automated Forest Fire Early Detection Mesh Sensor Nodes",
      category: "Smart Agro-Forestry",
      problem: "Wildfires expand beyond control before satellite observation detects smoke plumes, destroying millions of acres of biodiversity.",
      solution: "Tree-mounted solar LoRaWAN sensor nodes measuring gas emissions (CO, VOCs) and micro-climatic heat bursts with instant coordinates.",
      description: "Low-power sleep state firmware, tree trunk mounting clamps that expand with growth, and open-source gateway dashboard map interface.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Wild Pollinator Hotel & Native Bee Habitat Blueprint",
      category: "Smart Agro-Forestry",
      problem: "Monoculture farming and habitat fragmentation have caused native solitary bee populations to collapse, threatening crop pollination.",
      solution: "Weatherproof nesting structures crafted from pesticide-free drilled hardwood, bamboo reeds, and clay blocks tailored to local solitary pollinators.",
      description: "Nesting tube diameter dimensions (4mm-10mm) for different bee species, parasite management cleaning protocols, and seasonal maintenance calendar.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1473081556163-2a17de81fc97?auto=format&fit=crop&w=1200&q=80"],
    },

    // --- Eco Living (6 ideas) ---
    {
      title: "Passive Solar Earth-Sheltered Tiny Home Architecture Blueprint",
      category: "Eco Living",
      problem: "Modern residential construction relies on carbon-intensive concrete and HVAC heating/cooling, leaving enormous lifelong utility footprints.",
      solution: "A bermed subterranean tiny home blueprint using earth tubes, thermal mass walls, and optimal south-facing glazed sunspaces for zero energy bills.",
      description: "Complete architectural floor plans, structural load calculations for earth roofs, moisture-barrier cross-sections, and bill of materials.",
      isPaid: true,
      price: 1800.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "DIY Vertical Hydroponic Tower with 3D-Printed Net Pots",
      category: "Eco Living",
      problem: "Urban apartment dwellers lack backyard soil to grow clean salads, herbs, and greens free of pesticide residues.",
      solution: "A modular food-grade PVC or PETG 3D-printed vertical aeroponic tower growing 48 plants in less than 2 square feet of floor space.",
      description: "STL files for interlocking modular stack cups, submersible pump timer wiring, and balanced organic liquid nutrient formula recipes.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Odorless Indoor Urine-Diverting Dry Toilet (UDDT)",
      category: "Eco Living",
      problem: "Conventional flush toilets squander 6 liters of clean drinking water per flush while mixing nitrogen-rich urine with pathogens.",
      solution: "A waterless composting toilet separator that routes urine to a bio-fertilizer tank and desiccates solid matter with sawdust and ventilation.",
      description: "Woodworking cabinet cutting dimensions, 12V 0.5W solar exhaust fan ducting layout, and safe hygiene handling procedures.",
      isPaid: true,
      price: 500.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Non-Toxic Herbal Cleaning Products Formulation Handbook",
      category: "Eco Living",
      problem: "Commercial household cleaners contain volatile organic compounds (VOCs), endocrine disruptors, and non-biodegradable synthetic fragrances.",
      solution: "Lab-tested antimicrobial cleaning recipes made from distilled vinegar, castile soap, citrus peel enzymes, and botanical essential oils.",
      description: "Standard operating procedures, pH testing safety benchmarks, shelf-life stabilization tips, and printable labels for zero-waste bulk refill stations.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Rooftop Micro-Apiary & Urban Beekeeping Starter Guide",
      category: "Eco Living",
      problem: "Urban gardens suffer poor fruit set due to sparse pollinator density, while beginners struggle with honeybee colony collapses.",
      solution: "A low-intervention horizontal Top Bar Hive blueprint built with reclaimed shipping pallet wood, ideal for calm urban rooftop beekeeping.",
      description: "Hive woodworking drawings, organic Varroa mite treatment protocols using oxalic acid vapor, and municipal rooftop safety guidelines.",
      isPaid: true,
      price: 650.0,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1473081556163-2a17de81fc97?auto=format&fit=crop&w=1200&q=80"],
    },
    {
      title: "Closed-Loop Aquaponics System for Balcony Tilapia & Basil",
      category: "Eco Living",
      problem: "Aquaculture produces polluted wastewater while traditional hydroponics relies entirely on synthetic petroleum-derived salts.",
      solution: "Symbiotic fish tank and bell-siphon gravel media bed where fish waste fertilizes organic vegetables and plants purify water for the fish.",
      description: "Auto-siphon physics calculations, stocking density formulas, nitrifying bacteria cycling guide, and backup aerator battery schematic.",
      isPaid: false,
      price: null,
      status: IdeaStatus.APPROVED,
      images: ["https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80"],
    },
  ];

  console.log(`📦 Prepared dataset of ${ideasRaw.length} unique ideas across 6 categories`);

  // 4. Clean up previous seed ideas (keep user accounts intact)
  console.log("🧹 Purging old ideas to ensure fresh, clean 50-item dataset...");
  await prisma.comment.deleteMany({});
  await prisma.vote.deleteMany({});
  await prisma.watchlist.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.idea.deleteMany({});

  // 5. Insert the 50 Ideas with realistic author assignment
  const insertedIdeas: Array<{ id: string; title: string; isPaid: boolean; price: number | null }> = [];

  for (let i = 0; i < ideasRaw.length; i++) {
    const raw = ideasRaw[i];
    const categoryId = categoryMap.get(raw.category);
    if (!categoryId) {
      console.warn(`Category "${raw.category}" not found, skipping.`);
      continue;
    }

    // Distribute authoring across diverse member users
    const authorId = userIds[(i % (userIds.length - 1)) + 1]; // avoid admin as author unless desired

    const idea = await prisma.idea.create({
      data: {
        title: raw.title,
        problemStatement: raw.problem,
        proposedSolution: raw.solution,
        description: raw.description,
        images: raw.images,
        status: raw.status,
        isPaid: raw.isPaid,
        price: raw.price ? raw.price : null,
        feedback: (raw as any).feedback || null,
        categoryId,
        authorId,
        createdAt: new Date(Date.now() - (ideasRaw.length - i) * 3600 * 1000 * 6), // staggered creation dates
      },
    });

    insertedIdeas.push({ id: idea.id, title: idea.title, isPaid: idea.isPaid, price: raw.price });
  }

  console.log(`🎉 Successfully inserted ${insertedIdeas.length} ideas!`);

  // 6. Seed Realistic Votes (Upvotes & Downvotes)
  console.log("🗳️ Seeding realistic community votes...");
  let voteCount = 0;
  for (let i = 0; i < insertedIdeas.length; i++) {
    const idea = insertedIdeas[i];
    // Cast votes from 2 to 6 different users on approved ideas
    const voterCount = (i % 5) + 2;
    for (let u = 0; u < voterCount; u++) {
      const voterId = userIds[u % userIds.length];
      const type = (i + u) % 8 === 0 ? VoteType.DOWN : VoteType.UP;
      try {
        await prisma.vote.create({
          data: {
            userId: voterId,
            ideaId: idea.id,
            type,
          },
        });
        voteCount++;
      } catch {
        // Ignore unique constraint collisions if any
      }
    }
  }
  console.log(`✅ Seeded ${voteCount} community votes`);

  // 7. Seed Realistic Comments (Top-level & Nested Replies)
  console.log("💬 Seeding realistic community discussions and nested comments...");
  const commentPool = [
    "This is truly inspiring! Has anyone tested this prototype in high humidity conditions?",
    "Brilliant initiative! I am sharing this with our neighborhood climate action committee.",
    "Very feasible solution. How do you plan to handle winter freeze protection?",
    "The engineering blueprint is exceptionally clear. Kudos to the author!",
    "We implemented something similar at our school garden and reduced waste by 40%!",
    "Are the CAD files compatible with FreeCAD or standard STEP viewers?",
    "Great work! If anyone wants to collaborate on building a local pilot, please connect with me.",
    "The paywall price is very fair for full schematics. Purchased and thoroughly impressed!",
  ];

  const replyPool = [
    "Yes, we ran tests at 85% relative humidity and the sensors performed accurately without drift.",
    "Thank you! Feel free to adapt the blueprints under open commons.",
    "For winterization, we recommend draining the auxiliary valve and using insulated heat tape.",
    "Yes! All DXF and STEP files import cleanly into FreeCAD and Fusion 360.",
  ];

  let commentCount = 0;
  for (let i = 0; i < insertedIdeas.length; i += 2) {
    const idea = insertedIdeas[i];
    const commenterId = userIds[(i + 1) % userIds.length];
    const commentText = commentPool[i % commentPool.length];

    const parentComment = await prisma.comment.create({
      data: {
        content: commentText,
        userId: commenterId,
        ideaId: idea.id,
        createdAt: new Date(Date.now() - (i + 1) * 3600 * 1000 * 2),
      },
    });
    commentCount++;

    // Add nested reply to every second comment
    if (i % 4 === 0) {
      const replierId = userIds[(i + 2) % userIds.length];
      const replyText = replyPool[i % replyPool.length];
      await prisma.comment.create({
        data: {
          content: replyText,
          userId: replierId,
          ideaId: idea.id,
          parentId: parentComment.id,
          createdAt: new Date(Date.now() - i * 3600 * 1000 * 2),
        },
      });
      commentCount++;
    }
  }
  console.log(`✅ Seeded ${commentCount} comments (including nested replies)`);

  // 8. Seed Verified Payments for Paid Ideas so Member can view purchased blueprints
  console.log("💳 Seeding verified purchase records for paid ideas...");
  const memberId = userIds[1]; // EcoSpark Member
  const paidIdeas = insertedIdeas.filter((idea) => idea.isPaid);

  let paymentCount = 0;
  for (let p = 0; p < Math.min(paidIdeas.length, 3); p++) {
    const paidIdea = paidIdeas[p];
    await prisma.payment.create({
      data: {
        userId: memberId,
        ideaId: paidIdea.id,
        amount: paidIdea.price || 450.0,
        status: PaymentStatus.PAID,
        transactionId: `TXN-SEED-${Date.now()}-${p}`,
        createdAt: new Date(Date.now() - (p + 1) * 86400 * 1000),
      },
    });
    paymentCount++;
  }
  console.log(`✅ Seeded ${paymentCount} verified payments for demo member`);

  console.log("🌟 Database seeding completed with 50 high-quality ideas, votes, comments & payments!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
