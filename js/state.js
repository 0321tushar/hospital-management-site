/**
 * PulseAura Health OS - Centralized State & Data Layer
 * 100% Self-Contained. Zero External APIs. Persistent in LocalStorage.
 */

const STORAGE_KEY = 'PULSEAURA_HMS_DATABASE_V1';

// Default Seed Data
const DEFAULT_STATE = {
  hospital: {
    name: "PulseAura Super Specialty Hospital",
    tagline: "Center for Advanced Medicine & Compassionate Care",
    registrationNo: "NABH-HOSP-2024-9842",
    nabhStatus: "NABH Fully Accredited (5th Edition)",
    phone: "+91 (11) 4980-2200",
    emergencyPhone: "1066 / +91 98100-99911",
    email: "care@pulseaura-hospital.org",
    address: "Plot 14, Health City Boulevard, Medical District, New Delhi - 110029",
    currency: "₹",
    taxRate: 5, // 5% standard healthcare surcharge / GST where applicable
    theme: "light"
  },
  departments: [
    {
      id: "cardiology",
      name: "Cardiology & Cardiac Surgery",
      icon: "heart-pulse",
      head: "Dr. Arvind Mehta",
      description: "Comprehensive interventional cardiology, 24/7 cath lab, and bypass surgery.",
      opdRooms: ["Room 101", "Room 102"],
      bedCount: 8
    },
    {
      id: "neurology",
      name: "Neurology & Neurosurgery",
      icon: "brain",
      head: "Dr. Ananya Sen",
      description: "Advanced stroke unit, neuro-critical care, brain and spine surgery.",
      opdRooms: ["Room 201", "Room 202"],
      bedCount: 6
    },
    {
      id: "orthopedics",
      name: "Orthopedics & Joint Replacement",
      icon: "bone",
      head: "Dr. Rajesh Varma",
      description: "Robotic knee replacement, arthroscopy, trauma care, and sports medicine.",
      opdRooms: ["Room 105", "Room 106"],
      bedCount: 8
    },
    {
      id: "pediatrics",
      name: "Pediatrics & Neonatal Care",
      icon: "baby",
      head: "Dr. Priya Sharma",
      description: "Level III NICU, pediatric intensive care, growth and vaccination clinic.",
      opdRooms: ["Room 108", "Room 109"],
      bedCount: 6
    },
    {
      id: "medicine",
      name: "Internal Medicine & Diabetology",
      icon: "stethoscope",
      head: "Dr. Vikramaditya Rao",
      description: "Chronic illness management, infectious diseases, and executive health checks.",
      opdRooms: ["Room 103", "Room 104"],
      bedCount: 10
    },
    {
      id: "gynecology",
      name: "Obstetrics & Gynecology",
      icon: "female",
      head: "Dr. Sunita Kulkarni",
      description: "High-risk pregnancy, laparoscopic gynecology, and painless deliveries.",
      opdRooms: ["Room 205", "Room 206"],
      bedCount: 8
    },
    {
      id: "oncology",
      name: "Medical & Surgical Oncology",
      icon: "dna",
      head: "Dr. Kabir Malhotra",
      description: "Precision chemotherapy, tumor board consultations, and surgical oncology.",
      opdRooms: ["Room 209"],
      bedCount: 6
    },
    {
      id: "nephrology",
      name: "Nephrology & Dialysis",
      icon: "water-drop",
      head: "Dr. Sameer Chawla",
      description: "24-station dialysis unit, kidney transplant clinic, and acute renal care.",
      opdRooms: ["Room 211"],
      bedCount: 6
    }
  ],
  doctors: [
    {
      id: "DOC-101",
      name: "Dr. Arvind Mehta",
      qualifications: "MBBS, MD (Medicine), DM (Cardiology), FACC (USA)",
      departmentId: "cardiology",
      specialty: "Senior Interventional Cardiologist",
      experience: "18+ Years",
      opdRoom: "Room 102",
      fee: 1000,
      rating: 4.9,
      reviewsCount: 312,
      schedule: "Mon - Sat (09:00 AM - 02:00 PM)",
      availableSlots: ["09:30 AM", "10:00 AM", "10:30 AM", "11:15 AM", "12:00 PM", "01:00 PM"],
      imageBg: "linear-gradient(135deg, #0284c7, #0369a1)",
      avatarText: "AM"
    },
    {
      id: "DOC-102",
      name: "Dr. Priya Sharma",
      qualifications: "MBBS, MD (Pediatrics), Fellowship in Neonatology (UK)",
      departmentId: "pediatrics",
      specialty: "Chief Pediatrician & Neonatologist",
      experience: "12+ Years",
      opdRoom: "Room 108",
      fee: 800,
      rating: 4.95,
      reviewsCount: 420,
      schedule: "Mon - Fri (10:00 AM - 04:00 PM)",
      availableSlots: ["10:00 AM", "10:45 AM", "11:30 AM", "01:30 PM", "02:30 PM", "03:15 PM"],
      imageBg: "linear-gradient(135deg, #ec4899, #be185d)",
      avatarText: "PS"
    },
    {
      id: "DOC-103",
      name: "Dr. Rajesh Varma",
      qualifications: "MBBS, MS (Orthopedics), MCh (Ortho), Fellow Arthroscopy",
      departmentId: "orthopedics",
      specialty: "Joint Replacement & Spine Specialist",
      experience: "16+ Years",
      opdRoom: "Room 105",
      fee: 900,
      rating: 4.85,
      reviewsCount: 285,
      schedule: "Mon, Wed, Fri, Sat (10:00 AM - 03:00 PM)",
      availableSlots: ["10:15 AM", "11:00 AM", "11:45 AM", "01:15 PM", "02:00 PM"],
      imageBg: "linear-gradient(135deg, #0d9488, #0f766e)",
      avatarText: "RV"
    },
    {
      id: "DOC-104",
      name: "Dr. Ananya Sen",
      qualifications: "MBBS, MD (General Medicine), DM (Neurology), DNB",
      departmentId: "neurology",
      specialty: "Chief Neurologist & Stroke Specialist",
      experience: "14+ Years",
      opdRoom: "Room 201",
      fee: 1100,
      rating: 4.92,
      reviewsCount: 198,
      schedule: "Tue - Sat (11:00 AM - 05:00 PM)",
      availableSlots: ["11:30 AM", "12:15 PM", "02:00 PM", "03:30 PM", "04:15 PM"],
      imageBg: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
      avatarText: "AS"
    },
    {
      id: "DOC-105",
      name: "Dr. Vikramaditya Rao",
      qualifications: "MBBS, MD (Internal Medicine), PGD (Diabetology)",
      departmentId: "medicine",
      specialty: "Consultant Physician & Diabetologist",
      experience: "15+ Years",
      opdRoom: "Room 103",
      fee: 750,
      rating: 4.8,
      reviewsCount: 350,
      schedule: "Mon - Sat (08:30 AM - 01:30 PM)",
      availableSlots: ["09:00 AM", "09:40 AM", "10:20 AM", "11:00 AM", "12:20 PM"],
      imageBg: "linear-gradient(135deg, #f59e0b, #d97706)",
      avatarText: "VR"
    },
    {
      id: "DOC-106",
      name: "Dr. Sunita Kulkarni",
      qualifications: "MBBS, MS (OBG), FICOG, Fellow Fetal Medicine",
      departmentId: "gynecology",
      specialty: "High-Risk Pregnancy & Laparoscopic Surgeon",
      experience: "17+ Years",
      opdRoom: "Room 205",
      fee: 950,
      rating: 4.9,
      reviewsCount: 275,
      schedule: "Mon - Fri (09:00 AM - 02:00 PM)",
      availableSlots: ["09:15 AM", "10:00 AM", "10:45 AM", "11:30 AM", "12:30 PM"],
      imageBg: "linear-gradient(135deg, #10b981, #059669)",
      avatarText: "SK"
    }
  ],
  patients: [
    {
      uhid: "PA-2026-0012",
      name: "Ramesh Chandra Gupta",
      age: 58,
      gender: "Male",
      phone: "+91 98112-34501",
      email: "rc.gupta@example.com",
      bloodGroup: "B+",
      address: "B-42, Sector 18, Noida, UP",
      emergencyContact: "Sunita Gupta (Wife) - 98112-34502",
      allergies: "Penicillin, Sulfa drugs",
      chronicConditions: ["Hypertension (6 yrs)", "Type-2 Diabetes"],
      registrationDate: "2026-01-15"
    },
    {
      uhid: "PA-2026-0034",
      name: "Meera Nair",
      age: 34,
      gender: "Female",
      phone: "+91 98451-87290",
      email: "meera.nair@example.com",
      bloodGroup: "O+",
      address: "402, Lotus Orchid, Indiranagar, Bengaluru",
      emergencyContact: "Karthik Nair (Husband) - 98451-87291",
      allergies: "No known allergies",
      chronicConditions: ["Mild Asthma"],
      registrationDate: "2026-02-10"
    },
    {
      uhid: "PA-2026-0056",
      name: "Devendra Singh Rawat",
      age: 64,
      gender: "Male",
      phone: "+91 97180-22134",
      email: "devendra.rawat@example.com",
      bloodGroup: "A+",
      address: "C-12, Vasant Kunj, New Delhi",
      emergencyContact: "Aman Rawat (Son) - 97180-22135",
      allergies: "Aspirin (gastric sensitivity)",
      chronicConditions: ["Coronary Artery Disease (CAD)", "Dyslipidemia"],
      registrationDate: "2026-03-01"
    },
    {
      uhid: "PA-2026-0078",
      name: "Aarav Krishnan",
      age: 7,
      gender: "Male",
      phone: "+91 98200-44910",
      email: "krishnan.parent@example.com",
      bloodGroup: "AB+",
      address: "18, Green Park Extension, New Delhi",
      emergencyContact: "Lakshmi Krishnan (Mother) - 98200-44911",
      allergies: "Peanuts",
      chronicConditions: ["Seasonal Bronchitis"],
      registrationDate: "2026-03-12"
    },
    {
      uhid: "PA-2026-0091",
      name: "Kavita Singhania",
      age: 42,
      gender: "Female",
      phone: "+91 99103-55821",
      email: "kavita.s@example.com",
      bloodGroup: "O-",
      address: "Tower 3, Penthouse 2, DLF Phase 5, Gurugram",
      emergencyContact: "Rajiv Singhania (Brother) - 99103-55822",
      allergies: "Iodine contrast dye",
      chronicConditions: ["Hypothyroidism (Thyronorm 50mcg)"],
      registrationDate: "2026-04-05"
    }
  ],
  appointments: [
    {
      id: "APT-801",
      tokenNumber: "TK-01",
      uhid: "PA-2026-0056",
      patientName: "Devendra Singh Rawat",
      patientPhone: "+91 97180-22134",
      doctorId: "DOC-101",
      doctorName: "Dr. Arvind Mehta",
      department: "Cardiology",
      opdRoom: "Room 102",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "09:30 AM",
      type: "Follow-up",
      status: "In Consultation", // Waiting, In Consultation, Completed, Cancelled
      priority: "Urgent",
      chiefComplaint: "Mild chest heaviness post morning walk; palpitations.",
      fee: 1000,
      paymentStatus: "Paid"
    },
    {
      id: "APT-802",
      tokenNumber: "TK-02",
      uhid: "PA-2026-0012",
      patientName: "Ramesh Chandra Gupta",
      patientPhone: "+91 98112-34501",
      doctorId: "DOC-105",
      doctorName: "Dr. Vikramaditya Rao",
      department: "Internal Medicine",
      opdRoom: "Room 103",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "10:00 AM",
      type: "Routine",
      status: "Waiting",
      priority: "Normal",
      chiefComplaint: "Fasting blood sugar monitoring and diabetic neuropathy check.",
      fee: 750,
      paymentStatus: "Paid"
    },
    {
      id: "APT-803",
      tokenNumber: "TK-03",
      uhid: "PA-2026-0078",
      patientName: "Aarav Krishnan",
      patientPhone: "+91 98200-44910",
      doctorId: "DOC-102",
      doctorName: "Dr. Priya Sharma",
      department: "Pediatrics",
      opdRoom: "Room 108",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "10:45 AM",
      type: "Vaccination & Review",
      status: "Waiting",
      priority: "Normal",
      chiefComplaint: "Persistent dry cough for 4 days, low grade fever (99.8 F).",
      fee: 800,
      paymentStatus: "Paid"
    },
    {
      id: "APT-804",
      tokenNumber: "TK-04",
      uhid: "PA-2026-0034",
      patientName: "Meera Nair",
      patientPhone: "+91 98451-87290",
      doctorId: "DOC-103",
      doctorName: "Dr. Rajesh Varma",
      department: "Orthopedics",
      opdRoom: "Room 105",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "11:00 AM",
      type: "Consultation",
      status: "Completed",
      priority: "Normal",
      chiefComplaint: "Left knee pain while climbing stairs, suspected meniscus strain.",
      fee: 900,
      paymentStatus: "Paid"
    },
    {
      id: "APT-805",
      tokenNumber: "TK-05",
      uhid: "PA-2026-0091",
      patientName: "Kavita Singhania",
      patientPhone: "+91 99103-55821",
      doctorId: "DOC-104",
      doctorName: "Dr. Ananya Sen",
      department: "Neurology",
      opdRoom: "Room 201",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "11:30 AM",
      type: "Specialist",
      status: "Waiting",
      priority: "Normal",
      chiefComplaint: "Frequent migraines with visual aura, nausea since 2 weeks.",
      fee: 1100,
      paymentStatus: "Paid"
    }
  ],
  beds: [
    // General Ward Male (6 beds)
    { id: "BED-GW-M01", ward: "General Ward - Male", floor: "1st Floor, Wing A", type: "Standard", rate: 1500, status: "Occupied", patientUhid: "PA-2026-0012", patientName: "Ramesh Chandra Gupta", doctorName: "Dr. Vikramaditya Rao", admittedOn: "2026-10-21", diagnosis: "Diabetic Foot Cellulitis" },
    { id: "BED-GW-M02", ward: "General Ward - Male", floor: "1st Floor, Wing A", type: "Standard", rate: 1500, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },
    { id: "BED-GW-M03", ward: "General Ward - Male", floor: "1st Floor, Wing A", type: "Standard", rate: 1500, status: "Cleaning", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },
    { id: "BED-GW-M04", ward: "General Ward - Male", floor: "1st Floor, Wing A", type: "Standard", rate: 1500, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },
    { id: "BED-GW-M05", ward: "General Ward - Male", floor: "1st Floor, Wing A", type: "Standard", rate: 1500, status: "Occupied", patientUhid: "PA-2026-0056", patientName: "Devendra Singh Rawat", doctorName: "Dr. Arvind Mehta", admittedOn: "2026-10-22", diagnosis: "Unstable Angina Monitoring" },
    { id: "BED-GW-M06", ward: "General Ward - Male", floor: "1st Floor, Wing A", type: "Standard", rate: 1500, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },

    // General Ward Female (6 beds)
    { id: "BED-GW-F01", ward: "General Ward - Female", floor: "1st Floor, Wing B", type: "Standard", rate: 1500, status: "Occupied", patientUhid: "PA-2026-0034", patientName: "Meera Nair", doctorName: "Dr. Sunita Kulkarni", admittedOn: "2026-10-20", diagnosis: "Acute Pelvic Pain" },
    { id: "BED-GW-F02", ward: "General Ward - Female", floor: "1st Floor, Wing B", type: "Standard", rate: 1500, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },
    { id: "BED-GW-F03", ward: "General Ward - Female", floor: "1st Floor, Wing B", type: "Standard", rate: 1500, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },
    { id: "BED-GW-F04", ward: "General Ward - Female", floor: "1st Floor, Wing B", type: "Standard", rate: 1500, status: "Cleaning", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },
    { id: "BED-GW-F05", ward: "General Ward - Female", floor: "1st Floor, Wing B", type: "Standard", rate: 1500, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },
    { id: "BED-GW-F06", ward: "General Ward - Female", floor: "1st Floor, Wing B", type: "Standard", rate: 1500, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },

    // Semi-Private Rooms (4 beds)
    { id: "BED-SP-201", ward: "Semi-Private Ward", floor: "2nd Floor, Wing C", type: "Semi-Private", rate: 3200, status: "Occupied", patientUhid: "PA-2026-0091", patientName: "Kavita Singhania", doctorName: "Dr. Ananya Sen", admittedOn: "2026-10-22", diagnosis: "Intractable Migraine Protocol" },
    { id: "BED-SP-202", ward: "Semi-Private Ward", floor: "2nd Floor, Wing C", type: "Semi-Private", rate: 3200, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },
    { id: "BED-SP-203", ward: "Semi-Private Ward", floor: "2nd Floor, Wing C", type: "Semi-Private", rate: 3200, status: "Reserved", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },
    { id: "BED-SP-204", ward: "Semi-Private Ward", floor: "2nd Floor, Wing C", type: "Semi-Private", rate: 3200, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },

    // Intensive Care Unit (ICU / CCU) (4 beds)
    { id: "BED-ICU-01", ward: "Intensive Care Unit (ICU)", floor: "3rd Floor, Critical Wing", type: "Critical Care", rate: 7500, status: "Occupied", patientUhid: "PA-2026-0104", patientName: "Harishankar Trivedi", doctorName: "Dr. Arvind Mehta", admittedOn: "2026-10-21", diagnosis: "Acute STEMI / Post-PCI" },
    { id: "BED-ICU-02", ward: "Intensive Care Unit (ICU)", floor: "3rd Floor, Critical Wing", type: "Critical Care", rate: 7500, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },
    { id: "BED-ICU-03", ward: "Intensive Care Unit (ICU)", floor: "3rd Floor, Critical Wing", type: "Critical Care", rate: 7500, status: "Occupied", patientUhid: "PA-2026-0112", patientName: "Gurpreet Singh", doctorName: "Dr. Ananya Sen", admittedOn: "2026-10-23", diagnosis: "Severe Traumatic Brain Injury" },
    { id: "BED-ICU-04", ward: "Intensive Care Unit (ICU)", floor: "3rd Floor, Critical Wing", type: "Critical Care", rate: 7500, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },

    // Deluxe Private Suites (4 beds)
    { id: "BED-DLX-301", ward: "Deluxe Suite Wing", floor: "4th Floor, Executive", type: "Deluxe Suite", rate: 6500, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },
    { id: "BED-DLX-302", ward: "Deluxe Suite Wing", floor: "4th Floor, Executive", type: "Deluxe Suite", rate: 6500, status: "Occupied", patientUhid: "PA-2026-0128", patientName: "Shalini Mittal", doctorName: "Dr. Sunita Kulkarni", admittedOn: "2026-10-22", diagnosis: "Post-Elective C-Section" },
    { id: "BED-DLX-303", ward: "Deluxe Suite Wing", floor: "4th Floor, Executive", type: "Deluxe Suite", rate: 6500, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },
    { id: "BED-DLX-304", ward: "Deluxe Suite Wing", floor: "4th Floor, Executive", type: "Deluxe Suite", rate: 6500, status: "Cleaning", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null }
  ],
  prescriptions: [
    {
      id: "RX-2026-9041",
      uhid: "PA-2026-0056",
      patientName: "Devendra Singh Rawat",
      patientAge: 64,
      patientGender: "Male",
      doctorId: "DOC-101",
      doctorName: "Dr. Arvind Mehta",
      doctorSpecialty: "Senior Interventional Cardiologist",
      doctorRegNo: "MCI-48201-DL",
      date: "2026-10-23",
      vitals: {
        bp: "138/88 mmHg",
        pulse: "76 bpm",
        spo2: "98%",
        temp: "98.4 °F",
        weight: "74 kg",
        bmi: "25.2 (Normal)"
      },
      diagnosis: "Ischemic Heart Disease (IHD), Class II Angina, Mild Hypercholesterolemia (ICD-10: I25.9)",
      complaints: "Intermittent retrosternal discomfort on exertion, resolved with rest.",
      medicines: [
        { name: "Tab. Atorvastatin 20mg", dosage: "0 - 0 - 1 (Bedtime)", duration: "30 Days", instruction: "After dinner. Monitor lipid profile after 6 weeks." },
        { name: "Tab. Clopidogrel 75mg", dosage: "1 - 0 - 0 (Morning)", duration: "30 Days", instruction: "Post breakfast with a full glass of water." },
        { name: "Tab. Metoprolol Tartrate 25mg", dosage: "1 - 0 - 0 (Morning)", duration: "30 Days", instruction: "Check resting heart rate before taking." },
        { name: "Tab. Sorbitrate 5mg (Sublingual)", dosage: "SOS (As Needed)", duration: "10 Tabs", instruction: "Dissolve under tongue only if acute chest discomfort occurs." }
      ],
      investigationsOrdered: ["Lipid Profile Comprehensive", "Echocardiogram (2D Echo)", "Serum Creatinine"],
      advice: "Strict low salt & low saturated fat diet. 30 mins brisk morning walking. Avoid sudden heavy lifting. Review in OPD after 3 weeks with test reports."
    }
  ],
  pharmacy: [
    { id: "MED-01", name: "Paracetamol 650mg (Dolo)", category: "Analgesic & Antipyretic", batch: "BT-2401", expiry: "2027-08", stock: 1250, minStock: 200, unitPrice: 32.50, unit: "Strip of 15" },
    { id: "MED-02", name: "Amoxicillin + Clavulanic 625mg (Augmentin)", category: "Antibiotic", batch: "BT-2398", expiry: "2026-12", stock: 340, minStock: 100, unitPrice: 185.00, unit: "Strip of 10" },
    { id: "MED-03", name: "Atorvastatin 20mg (Atorva)", category: "Cardiovascular / Statin", batch: "BT-2415", expiry: "2027-04", stock: 520, minStock: 150, unitPrice: 145.00, unit: "Strip of 15" },
    { id: "MED-04", name: "Metformin 500mg SR (Glycomet)", category: "Antidiabetic", batch: "BT-2350", expiry: "2027-11", stock: 890, minStock: 200, unitPrice: 48.00, unit: "Strip of 20" },
    { id: "MED-05", name: "Pantoprazole 40mg (Pan 40)", category: "Gastrointestinal / PPI", batch: "BT-2462", expiry: "2028-01", stock: 740, minStock: 150, unitPrice: 98.00, unit: "Strip of 15" },
    { id: "MED-06", name: "Azithromycin 500mg (Azee)", category: "Antibiotic (Macrolide)", batch: "BT-2311", expiry: "2026-11", stock: 85, minStock: 100, unitPrice: 120.00, unit: "Strip of 5" }, // Low stock!
    { id: "MED-07", name: "Metoprolol Succinate 25mg (Betaloc)", category: "Cardiovascular / Beta Blocker", batch: "BT-2409", expiry: "2027-06", stock: 430, minStock: 120, unitPrice: 110.00, unit: "Strip of 15" },
    { id: "MED-08", name: "Cetirizine 10mg (Cetzine)", category: "Antihistamine / Allergy", batch: "BT-2420", expiry: "2027-09", stock: 960, minStock: 150, unitPrice: 38.00, unit: "Strip of 10" },
    { id: "MED-09", name: "Clopidogrel 75mg (Plavix)", category: "Antiplatelet / Cardiac", batch: "BT-2388", expiry: "2027-03", stock: 310, minStock: 80, unitPrice: 165.00, unit: "Strip of 15" },
    { id: "MED-10", name: "Insulin Glargine Pen 100 IU/ml (Lantus)", category: "Endocrine / Insulin", batch: "BT-2444", expiry: "2026-10", stock: 42, minStock: 50, unitPrice: 620.00, unit: "Prefilled Pen" }, // Low stock!
    { id: "MED-11", name: "IV Normal Saline 0.9% (500ml)", category: "IV Fluids & Infusions", batch: "BT-IV09", expiry: "2028-05", stock: 480, minStock: 100, unitPrice: 45.00, unit: "500ml Bottle" },
    { id: "MED-12", name: "Inj. Ceftriaxone 1g (Monocef)", category: "Injectable Antibiotic", batch: "BT-INJ12", expiry: "2027-02", stock: 260, minStock: 80, unitPrice: 85.00, unit: "Vial" }
  ],
  diagnostics: [
    {
      id: "LAB-CBC",
      code: "CBC-001",
      name: "Complete Blood Count (CBC) with ESR",
      department: "Hematology",
      sampleType: "Whole Blood (EDTA)",
      tatHours: 4,
      price: 450,
      parameters: [
        { name: "Hemoglobin (Hb)", unit: "g/dL", normalRange: "13.0 - 17.0" },
        { name: "Total Leucocyte Count (TLC)", unit: "/cumm", normalRange: "4,000 - 11,000" },
        { name: "Platelet Count", unit: "lakhs/cumm", normalRange: "1.50 - 4.50" },
        { name: "Packed Cell Volume (PCV)", unit: "%", normalRange: "40 - 50" },
        { name: "ESR (Westergren)", unit: "mm/1st hr", normalRange: "0 - 15" }
      ]
    },
    {
      id: "LAB-LIPID",
      code: "LIP-002",
      name: "Lipid Profile Comprehensive",
      department: "Biochemistry",
      sampleType: "Serum (12 hr Fasting)",
      tatHours: 6,
      price: 850,
      parameters: [
        { name: "Total Cholesterol", unit: "mg/dL", normalRange: "< 200 (Desirable)" },
        { name: "Triglycerides", unit: "mg/dL", normalRange: "< 150 (Normal)" },
        { name: "HDL Cholesterol (Good)", unit: "mg/dL", normalRange: "> 40 (Optimal)" },
        { name: "LDL Cholesterol (Bad)", unit: "mg/dL", normalRange: "< 100 (Optimal)" },
        { name: "VLDL Cholesterol", unit: "mg/dL", normalRange: "5 - 30" }
      ]
    },
    {
      id: "LAB-HBA1C",
      code: "DIA-003",
      name: "HbA1c (Glycated Hemoglobin) by HPLC",
      department: "Biochemistry",
      sampleType: "Whole Blood (EDTA)",
      tatHours: 4,
      price: 600,
      parameters: [
        { name: "Glycated Hemoglobin (HbA1c)", unit: "%", normalRange: "< 5.7 (Normal), 5.7-6.4 (Pre-diabetic)" },
        { name: "Estimated Average Glucose (eAG)", unit: "mg/dL", normalRange: "90 - 120" }
      ]
    },
    {
      id: "LAB-KFT",
      code: "REN-004",
      name: "Kidney Function Test (KFT / RFT)",
      department: "Biochemistry",
      sampleType: "Serum",
      tatHours: 5,
      price: 750,
      parameters: [
        { name: "Serum Creatinine", unit: "mg/dL", normalRange: "0.7 - 1.3" },
        { name: "Blood Urea Nitrogen (BUN)", unit: "mg/dL", normalRange: "7 - 20" },
        { name: "Serum Uric Acid", unit: "mg/dL", normalRange: "3.5 - 7.2" },
        { name: "Serum Sodium (Na+)", unit: "mEq/L", normalRange: "136 - 145" },
        { name: "Serum Potassium (K+)", unit: "mEq/L", normalRange: "3.5 - 5.1" }
      ]
    },
    {
      id: "RAD-XRAY-CHEST",
      code: "RAD-005",
      name: "Digital Chest X-Ray (PA View)",
      department: "Radiology",
      sampleType: "Imaging",
      tatHours: 2,
      price: 550,
      parameters: [
        { name: "Lung Fields", unit: "Finding", normalRange: "Clear, normal bronchovascular markings" },
        { name: "Cardiothoracic Ratio", unit: "Ratio", normalRange: "< 0.5 (Normal heart size)" },
        { name: "Costophrenic Angles", unit: "Finding", normalRange: "Sharp and clear bilaterally" }
      ]
    }
  ],
  labReports: [
    {
      id: "REP-2026-4401",
      testId: "LAB-LIPID",
      testName: "Lipid Profile Comprehensive",
      uhid: "PA-2026-0056",
      patientName: "Devendra Singh Rawat",
      patientAge: 64,
      patientGender: "Male",
      referredBy: "Dr. Arvind Mehta",
      collectedOn: "2026-10-23 08:30 AM",
      reportedOn: "2026-10-23 11:45 AM",
      status: "Verified & Released",
      results: [
        { name: "Total Cholesterol", value: "228.4", unit: "mg/dL", normalRange: "< 200", status: "HIGH" },
        { name: "Triglycerides", value: "186.0", unit: "mg/dL", normalRange: "< 150", status: "HIGH" },
        { name: "HDL Cholesterol (Good)", value: "38.2", unit: "mg/dL", normalRange: "> 40", status: "LOW" },
        { name: "LDL Cholesterol (Bad)", value: "153.0", unit: "mg/dL", normalRange: "< 100", status: "HIGH" },
        { name: "VLDL Cholesterol", value: "37.2", unit: "mg/dL", normalRange: "5 - 30", status: "HIGH" }
      ],
      pathologist: "Dr. Sandeep Oberoi, MD (Pathology)",
      remarks: "Moderate mixed dyslipidemia noted. Correlate clinically with cardiovascular risk profile."
    }
  ],
  invoices: [
    {
      id: "INV-2026-1092",
      uhid: "PA-2026-0056",
      patientName: "Devendra Singh Rawat",
      patientPhone: "+91 97180-22134",
      date: "2026-10-23",
      category: "OPD Consultation & Diagnostic",
      items: [
        { description: "Specialist Cardiology Consultation - Dr. Arvind Mehta", qty: 1, rate: 1000, amount: 1000 },
        { description: "Lipid Profile Comprehensive (Biochemistry)", qty: 1, rate: 850, amount: 850 },
        { description: "Digital ECG (12-Lead Rhythm Strip)", qty: 1, rate: 350, amount: 350 }
      ],
      subtotal: 2200,
      discount: 100,
      taxPercent: 5,
      taxAmount: 105,
      totalAmount: 2205,
      paidAmount: 2205,
      balanceDue: 0,
      paymentMode: "UPI / QR Code",
      status: "Settled",
      cashier: "Desk Staff #04 (R. Verma)"
    },
    {
      id: "INV-2026-1091",
      uhid: "PA-2026-0034",
      patientName: "Meera Nair",
      patientPhone: "+91 98451-87290",
      date: "2026-10-22",
      category: "Pharmacy Point of Sale",
      items: [
        { description: "Amoxicillin + Clavulanic 625mg (10 tabs)", qty: 2, rate: 185, amount: 370 },
        { description: "Pantoprazole 40mg (15 tabs)", qty: 1, rate: 98, amount: 98 },
        { description: "Paracetamol 650mg (15 tabs)", qty: 1, rate: 32.50, amount: 32.50 }
      ],
      subtotal: 500.50,
      discount: 0,
      taxPercent: 5,
      taxAmount: 25.03,
      totalAmount: 525.53,
      paidAmount: 525.53,
      balanceDue: 0,
      paymentMode: "Credit Card (Visa **8124)",
      status: "Settled",
      cashier: "Pharmacy Desk #01"
    }
  ]
};

// Store Controller with Reactive Subscription
class HospitalStore {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure state schema integrity
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to parse localStorage state, resetting to defaults', e);
    }
    this.saveState(DEFAULT_STATE);
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState(stateToSave = this.state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      this.state = stateToSave;
      this.notify();
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this.state); } catch(err) { console.error('Store subscriber error', err); }
    });
  }

  resetToDefaults() {
    const clone = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.saveState(clone);
  }

  // --- Helpers & Mutations ---

  // Hospital Configuration
  updateHospitalInfo(info) {
    this.state.hospital = { ...this.state.hospital, ...info };
    this.saveState();
  }

  // Patient Registration & Lookups
  registerPatient(patientData) {
    const uhidNum = (this.state.patients.length + 1).toString().padStart(4, '0');
    const uhid = `PA-2026-${uhidNum}`;
    const newPatient = {
      uhid,
      ...patientData,
      registrationDate: new Date().toISOString().split('T')[0]
    };
    this.state.patients.unshift(newPatient);
    this.saveState();
    return newPatient;
  }

  findPatient(query) {
    if (!query) return null;
    const q = query.toLowerCase().trim();
    return this.state.patients.find(p => 
      p.uhid.toLowerCase() === q ||
      p.phone.includes(q) ||
      p.name.toLowerCase().includes(q)
    );
  }

  // Appointment & OPD Queue
  bookAppointment(data) {
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = this.state.appointments.filter(a => a.date === today);
    const tokenSeq = (todayAppointments.length + 1).toString().padStart(2, '0');
    const tokenNumber = `TK-${tokenSeq}`;
    const aptId = `APT-${Math.floor(100 + Math.random() * 900)}`;

    const newApt = {
      id: aptId,
      tokenNumber,
      date: data.date || today,
      timeSlot: data.timeSlot || "10:00 AM",
      status: "Waiting",
      priority: data.priority || "Normal",
      paymentStatus: "Paid",
      ...data
    };

    this.state.appointments.unshift(newApt);
    this.saveState();
    return newApt;
  }

  updateAppointmentStatus(aptId, status) {
    const apt = this.state.appointments.find(a => a.id === aptId);
    if (apt) {
      apt.status = status;
      this.saveState();
    }
  }

  // Inpatient (IPD) Beds
  updateBedStatus(bedId, updateData) {
    const bed = this.state.beds.find(b => b.id === bedId);
    if (bed) {
      Object.assign(bed, updateData);
      this.saveState();
    }
  }

  admitPatientToBed(bedId, { uhid, patientName, doctorName, diagnosis }) {
    this.updateBedStatus(bedId, {
      status: "Occupied",
      patientUhid: uhid,
      patientName,
      doctorName,
      diagnosis,
      admittedOn: new Date().toISOString().split('T')[0]
    });
  }

  dischargeBed(bedId) {
    this.updateBedStatus(bedId, {
      status: "Cleaning",
      patientUhid: null,
      patientName: null,
      doctorName: null,
      diagnosis: null,
      admittedOn: null
    });
  }

  // Doctor EMR & Prescriptions
  savePrescription(rxData) {
    const rxId = `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRx = {
      id: rxId,
      date: new Date().toISOString().split('T')[0],
      ...rxData
    };
    this.state.prescriptions.unshift(newRx);
    this.saveState();
    return newRx;
  }

  // Pharmacy Inventory
  updateMedicineStock(medId, deltaQty) {
    const med = this.state.pharmacy.find(m => m.id === medId);
    if (med) {
      med.stock = Math.max(0, med.stock + deltaQty);
      this.saveState();
      return med;
    }
  }

  addMedicine(medicineData) {
    const id = `MED-${(this.state.pharmacy.length + 1).toString().padStart(2, '0')}`;
    const newMed = { id, ...medicineData };
    this.state.pharmacy.unshift(newMed);
    this.saveState();
    return newMed;
  }

  // Diagnostics & Lab Reports
  createLabReport(reportData) {
    const repId = `REP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReport = {
      id: repId,
      reportedOn: new Date().toLocaleString(),
      status: "Verified & Released",
      ...reportData
    };
    this.state.labReports.unshift(newReport);
    this.saveState();
    return newReport;
  }

  // Billing & Invoicing
  generateInvoice(invoiceData) {
    const invId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newInvoice = {
      id: invId,
      date: new Date().toISOString().split('T')[0],
      status: "Settled",
      ...invoiceData
    };
    this.state.invoices.unshift(newInvoice);
    this.saveState();
    return newInvoice;
  }
}

// Global Singleton Instance
window.HospitalDB = new HospitalStore();
