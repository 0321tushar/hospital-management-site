import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { Hospital } from './models/Hospital.js';
import { Doctor } from './models/Doctor.js';
import { Patient } from './models/Patient.js';
import { Appointment } from './models/Appointment.js';
import { Bed } from './models/Bed.js';
import { Prescription } from './models/Prescription.js';
import { Medicine } from './models/Medicine.js';
import { LabReport } from './models/Diagnostic.js';
import { Invoice } from './models/Invoice.js';
import { StaffUser } from './models/StaffUser.js';

dotenv.config();

export const seedHospitalData = {
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
    taxRate: 5,
    theme: "light"
  },
  doctors: [
    {
      id: "DOC-101",
      name: "Dr. Arvind Mehta",
      qualifications: "MBBS, MD (Medicine), DM (Cardiology), FACC (USA)",
      departmentId: "cardiology",
      departmentName: "Cardiology & Cardiac Surgery",
      specialty: "Senior Interventional Cardiologist",
      experience: "18+ Years",
      opdRoom: "Room 102",
      fee: 1000,
      rating: 4.9,
      reviewsCount: 312,
      schedule: "Mon - Sat (09:00 AM - 02:00 PM)",
      availableSlots: ["09:30 AM", "10:00 AM", "10:30 AM", "11:15 AM", "12:00 PM", "01:00 PM"],
      avatarText: "AM",
      imageBg: "linear-gradient(135deg, #0284c7, #0369a1)"
    },
    {
      id: "DOC-102",
      name: "Dr. Priya Sharma",
      qualifications: "MBBS, MD (Pediatrics), Fellowship in Neonatology (UK)",
      departmentId: "pediatrics",
      departmentName: "Pediatrics & Neonatal Care",
      specialty: "Chief Pediatrician & Neonatologist",
      experience: "12+ Years",
      opdRoom: "Room 108",
      fee: 800,
      rating: 4.95,
      reviewsCount: 420,
      schedule: "Mon - Fri (10:00 AM - 04:00 PM)",
      availableSlots: ["10:00 AM", "10:45 AM", "11:30 AM", "01:30 PM", "02:30 PM", "03:15 PM"],
      avatarText: "PS",
      imageBg: "linear-gradient(135deg, #ec4899, #be185d)"
    },
    {
      id: "DOC-103",
      name: "Dr. Rajesh Varma",
      qualifications: "MBBS, MS (Orthopedics), MCh (Ortho), Fellow Arthroscopy",
      departmentId: "orthopedics",
      departmentName: "Orthopedics & Joint Replacement",
      specialty: "Joint Replacement & Spine Specialist",
      experience: "16+ Years",
      opdRoom: "Room 105",
      fee: 900,
      rating: 4.85,
      reviewsCount: 285,
      schedule: "Mon, Wed, Fri, Sat (10:00 AM - 03:00 PM)",
      availableSlots: ["10:15 AM", "11:00 AM", "11:45 AM", "01:15 PM", "02:00 PM"],
      avatarText: "RV",
      imageBg: "linear-gradient(135deg, #0d9488, #0f766e)"
    },
    {
      id: "DOC-104",
      name: "Dr. Ananya Sen",
      qualifications: "MBBS, MD (General Medicine), DM (Neurology), DNB",
      departmentId: "neurology",
      departmentName: "Neurology & Neurosurgery",
      specialty: "Chief Neurologist & Stroke Specialist",
      experience: "14+ Years",
      opdRoom: "Room 201",
      fee: 1100,
      rating: 4.92,
      reviewsCount: 198,
      schedule: "Tue - Sat (11:00 AM - 05:00 PM)",
      availableSlots: ["11:30 AM", "12:15 PM", "02:00 PM", "03:30 PM", "04:15 PM"],
      avatarText: "AS",
      imageBg: "linear-gradient(135deg, #8b5cf6, #6d28d9)"
    },
    {
      id: "DOC-105",
      name: "Dr. Vikramaditya Rao",
      qualifications: "MBBS, MD (Internal Medicine), PGD (Diabetology)",
      departmentId: "medicine",
      departmentName: "Internal Medicine & Diabetology",
      specialty: "Consultant Physician & Diabetologist",
      experience: "15+ Years",
      opdRoom: "Room 103",
      fee: 750,
      rating: 4.8,
      reviewsCount: 350,
      schedule: "Mon - Sat (08:30 AM - 01:30 PM)",
      availableSlots: ["09:00 AM", "09:40 AM", "10:20 AM", "11:00 AM", "12:20 PM"],
      avatarText: "VR",
      imageBg: "linear-gradient(135deg, #f59e0b, #d97706)"
    },
    {
      id: "DOC-106",
      name: "Dr. Sunita Kulkarni",
      qualifications: "MBBS, MS (OBG), FICOG, Fellow Fetal Medicine",
      departmentId: "gynecology",
      departmentName: "Obstetrics & Gynecology",
      specialty: "High-Risk Pregnancy & Laparoscopic Surgeon",
      experience: "17+ Years",
      opdRoom: "Room 205",
      fee: 950,
      rating: 4.9,
      reviewsCount: 275,
      schedule: "Mon - Fri (09:00 AM - 02:00 PM)",
      availableSlots: ["09:15 AM", "10:00 AM", "10:45 AM", "11:30 AM", "12:30 PM"],
      avatarText: "SK",
      imageBg: "linear-gradient(135deg, #10b981, #059669)"
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
      uhid: "PA-2026-0104",
      name: "Harishankar Trivedi",
      age: 62,
      gender: "Male",
      phone: "+91 98104-55112",
      email: "hs.trivedi@example.com",
      bloodGroup: "O+",
      address: "Flat 302, Civil Lines, Delhi",
      emergencyContact: "Vandana Trivedi (Daughter) - 98104-55113",
      allergies: "None",
      chronicConditions: ["Post-PCI Stenting", "Hypertension"],
      registrationDate: "2026-03-05"
    },
    {
      uhid: "PA-2026-0044",
      name: "Suman Lata Joshi",
      age: 51,
      gender: "Female",
      phone: "+91 98711-22334",
      email: "suman.joshi@example.com",
      bloodGroup: "B+",
      address: "House 18, Block D, Saket, New Delhi",
      emergencyContact: "Mahesh Joshi (Husband) - 98711-22335",
      allergies: "Sulfa antibiotics",
      chronicConditions: ["Essential Hypertension"],
      registrationDate: "2026-03-10"
    },
    {
      uhid: "PA-2026-0088",
      name: "Master Aarav Singhania",
      age: 4,
      gender: "Male",
      phone: "+91 98223-11445",
      email: "singhania.care@example.com",
      bloodGroup: "A+",
      address: "B-10, Greater Kailash-I, New Delhi",
      emergencyContact: "Vikram Singhania (Father) - 98223-11446",
      allergies: "Dust, Egg Albumin",
      chronicConditions: ["None"],
      registrationDate: "2026-03-12"
    },
    {
      uhid: "PA-2026-0072",
      name: "Baby Anvi Malhotra",
      age: 1,
      gender: "Female",
      phone: "+91 98119-88776",
      email: "malhotra.family@example.com",
      bloodGroup: "O+",
      address: "Tower 4, DLF Phase 5, Gurugram",
      emergencyContact: "Ritika Malhotra (Mother) - 98119-88777",
      allergies: "None",
      chronicConditions: ["None"],
      registrationDate: "2026-03-15"
    },
    {
      uhid: "PA-2026-0063",
      name: "Rohan Saxena",
      age: 9,
      gender: "Male",
      phone: "+91 98990-33221",
      email: "saxena.rohan@example.com",
      bloodGroup: "B-",
      address: "C-44, Sector 50, Noida",
      emergencyContact: "Alok Saxena (Father) - 98990-33222",
      allergies: "None",
      chronicConditions: ["Recurrent Colic"],
      registrationDate: "2026-03-18"
    },
    {
      uhid: "PA-2026-0065",
      name: "Gurpreet Singh",
      age: 61,
      gender: "Male",
      phone: "+91 98140-77665",
      email: "gurpreet.singh@example.com",
      bloodGroup: "B+",
      address: "14-A, Model Town, Delhi",
      emergencyContact: "Harpreet Kaur (Wife) - 98140-77666",
      allergies: "Diclofenac (Gastric)",
      chronicConditions: ["Bilateral Knee Osteoarthritis"],
      registrationDate: "2026-03-20"
    },
    {
      uhid: "PA-2026-0051",
      name: "Shanti Devi",
      age: 68,
      gender: "Female",
      phone: "+91 97110-44332",
      email: "shanti.devi@example.com",
      bloodGroup: "AB+",
      address: "Plot 89, Rohini Sector 9, Delhi",
      emergencyContact: "Mukesh Kumar (Son) - 97110-44333",
      allergies: "None",
      chronicConditions: ["L4-L5 Lumbar Spondylosis", "Osteoporosis"],
      registrationDate: "2026-03-22"
    },
    {
      uhid: "PA-2026-0082",
      name: "Amit Mathur",
      age: 32,
      gender: "Male",
      phone: "+91 98188-66554",
      email: "amit.mathur@example.com",
      bloodGroup: "A+",
      address: "Pocket C, Mayur Vihar Phase 2, Delhi",
      emergencyContact: "Neha Mathur (Wife) - 98188-66555",
      allergies: "None",
      chronicConditions: ["None"],
      registrationDate: "2026-03-25"
    },
    {
      uhid: "PA-2026-0091",
      name: "Kavita Singhania",
      age: 39,
      gender: "Female",
      phone: "+91 98111-99221",
      email: "kavita.singhania@example.com",
      bloodGroup: "O+",
      address: "Flat 801, Prestige Heights, South City, Gurugram",
      emergencyContact: "Sanjay Singhania (Husband) - 98111-99222",
      allergies: "Paracetamol",
      chronicConditions: ["Chronic Intractable Migraine"],
      registrationDate: "2026-03-28"
    },
    {
      uhid: "PA-2026-0039",
      name: "Rajesh K. Bansal",
      age: 56,
      gender: "Male",
      phone: "+91 98210-44998",
      email: "rk.bansal@example.com",
      bloodGroup: "B+",
      address: "House 204, Sector 15, Faridabad",
      emergencyContact: "Poonam Bansal (Wife) - 98210-44999",
      allergies: "None",
      chronicConditions: ["Early Parkinsonism Tremor"],
      registrationDate: "2026-04-01"
    },
    {
      uhid: "PA-2026-0027",
      name: "Suresh P. Verma",
      age: 48,
      gender: "Male",
      phone: "+91 98114-77002",
      email: "suresh.verma@example.com",
      bloodGroup: "A-",
      address: "A-15, Green Park, New Delhi",
      emergencyContact: "Rekha Verma (Wife) - 98114-77003",
      allergies: "None",
      chronicConditions: ["Hyperuricemia / Gout"],
      registrationDate: "2026-04-05"
    },
    {
      uhid: "PA-2026-0079",
      name: "Pooja Aggarwal",
      age: 26,
      gender: "Female",
      phone: "+91 98109-33211",
      email: "pooja.aggarwal@example.com",
      bloodGroup: "O+",
      address: "D-60, Rajouri Garden, New Delhi",
      emergencyContact: "Deepak Aggarwal (Brother) - 98109-33212",
      allergies: "None",
      chronicConditions: ["PCOS / Polycystic Ovarian Syndrome"],
      registrationDate: "2026-04-08"
    }
  ],
  appointments: [
    // --- Dr. Arvind Mehta (DOC-101 - Cardiology) ---
    {
      id: "APT-101",
      tokenNumber: "TK-01",
      uhid: "PA-2026-0012",
      patientName: "Ramesh Chandra Gupta",
      patientPhone: "+91 98112-34501",
      doctorId: "DOC-101",
      doctorName: "Dr. Arvind Mehta",
      department: "Cardiology & Cardiac Surgery",
      opdRoom: "Room 102",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "09:30 AM",
      type: "Cardiac Follow-up",
      status: "In Consultation",
      priority: "Normal",
      chiefComplaint: "Chest heaviness on exertion & shortness of breath",
      fee: 1000,
      paymentStatus: "Paid"
    },
    {
      id: "APT-102",
      tokenNumber: "TK-02",
      uhid: "PA-2026-0104",
      patientName: "Harishankar Trivedi",
      patientPhone: "+91 98104-55112",
      doctorId: "DOC-101",
      doctorName: "Dr. Arvind Mehta",
      department: "Cardiology & Cardiac Surgery",
      opdRoom: "Room 102",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "10:00 AM",
      type: "Post-PCI Review",
      status: "Calling Next",
      priority: "Urgent",
      chiefComplaint: "Post-angioplasty 6-month stent checkup and ECG review",
      fee: 1000,
      paymentStatus: "Paid"
    },
    {
      id: "APT-103",
      tokenNumber: "TK-03",
      uhid: "PA-2026-0044",
      patientName: "Suman Lata Joshi",
      patientPhone: "+91 98711-22334",
      doctorId: "DOC-101",
      doctorName: "Dr. Arvind Mehta",
      department: "Cardiology & Cardiac Surgery",
      opdRoom: "Room 102",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "10:30 AM",
      type: "New Consultation",
      status: "Waiting",
      priority: "Normal",
      chiefComplaint: "Occasional palpitations and fluctuating blood pressure",
      fee: 1000,
      paymentStatus: "Paid"
    },

    // --- Dr. Priya Sharma (DOC-102 - Pediatrics) ---
    {
      id: "APT-104",
      tokenNumber: "TK-04",
      uhid: "PA-2026-0088",
      patientName: "Master Aarav Singhania",
      patientPhone: "+91 98223-11445",
      doctorId: "DOC-102",
      doctorName: "Dr. Priya Sharma",
      department: "Pediatrics & Neonatal Care",
      opdRoom: "Room 108",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "10:00 AM",
      type: "Pediatric Consultation",
      status: "In Consultation",
      priority: "Normal",
      chiefComplaint: "High persistent fever (102°F) and dry nocturnal cough for 3 days",
      fee: 800,
      paymentStatus: "Paid"
    },
    {
      id: "APT-105",
      tokenNumber: "TK-05",
      uhid: "PA-2026-0072",
      patientName: "Baby Anvi Malhotra",
      patientPhone: "+91 98119-88776",
      doctorId: "DOC-102",
      doctorName: "Dr. Priya Sharma",
      department: "Pediatrics & Neonatal Care",
      opdRoom: "Room 108",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "10:45 AM",
      type: "Vaccination & Milestone",
      status: "Calling Next",
      priority: "Normal",
      chiefComplaint: "6-month developmental milestone assessment & Hexaxim vaccine",
      fee: 800,
      paymentStatus: "Paid"
    },
    {
      id: "APT-106",
      tokenNumber: "TK-06",
      uhid: "PA-2026-0063",
      patientName: "Rohan Saxena",
      patientPhone: "+91 98990-33221",
      doctorId: "DOC-102",
      doctorName: "Dr. Priya Sharma",
      department: "Pediatrics & Neonatal Care",
      opdRoom: "Room 108",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "11:30 AM",
      type: "Pediatric Follow-up",
      status: "Waiting",
      priority: "Normal",
      chiefComplaint: "Loss of appetite & recurrent abdominal cramps after eating",
      fee: 800,
      paymentStatus: "Paid"
    },

    // --- Dr. Rajesh Varma (DOC-103 - Orthopedics) ---
    {
      id: "APT-107",
      tokenNumber: "TK-07",
      uhid: "PA-2026-0065",
      patientName: "Gurpreet Singh",
      patientPhone: "+91 98140-77665",
      doctorId: "DOC-103",
      doctorName: "Dr. Rajesh Varma",
      department: "Orthopedics & Joint Replacement",
      opdRoom: "Room 105",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "10:15 AM",
      type: "Joint Consultation",
      status: "In Consultation",
      priority: "Normal",
      chiefComplaint: "Severe bilateral knee pain (Grade-3 OA) during stair climbing",
      fee: 900,
      paymentStatus: "Paid"
    },
    {
      id: "APT-108",
      tokenNumber: "TK-08",
      uhid: "PA-2026-0051",
      patientName: "Shanti Devi",
      patientPhone: "+91 97110-44332",
      doctorId: "DOC-103",
      doctorName: "Dr. Rajesh Varma",
      department: "Orthopedics & Joint Replacement",
      opdRoom: "Room 105",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "11:00 AM",
      type: "Spine & Sciatica",
      status: "Completed",
      priority: "Normal",
      chiefComplaint: "L4-L5 disc herniation with numbness radiating to left foot",
      fee: 900,
      paymentStatus: "Paid"
    },
    {
      id: "APT-109",
      tokenNumber: "TK-09",
      uhid: "PA-2026-0082",
      patientName: "Amit Mathur",
      patientPhone: "+91 98188-66554",
      doctorId: "DOC-103",
      doctorName: "Dr. Rajesh Varma",
      department: "Orthopedics & Joint Replacement",
      opdRoom: "Room 105",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "11:45 AM",
      type: "Sports Injury",
      status: "Waiting",
      priority: "Normal",
      chiefComplaint: "Rotator cuff tendonitis and shoulder stiffness post badminton match",
      fee: 900,
      paymentStatus: "Paid"
    },

    // --- Dr. Ananya Sen (DOC-104 - Neurology) ---
    {
      id: "APT-110",
      tokenNumber: "TK-10",
      uhid: "PA-2026-0091",
      patientName: "Kavita Singhania",
      patientPhone: "+91 98111-99221",
      doctorId: "DOC-104",
      doctorName: "Dr. Ananya Sen",
      department: "Neurology & Neurosurgery",
      opdRoom: "Room 201",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "11:30 AM",
      type: "Neuro Follow-up",
      status: "In Consultation",
      priority: "Normal",
      chiefComplaint: "Severe intractable hemicephalic migraine with aura & photophobia",
      fee: 1100,
      paymentStatus: "Paid"
    },
    {
      id: "APT-111",
      tokenNumber: "TK-11",
      uhid: "PA-2026-0039",
      patientName: "Rajesh K. Bansal",
      patientPhone: "+91 98210-44998",
      doctorId: "DOC-104",
      doctorName: "Dr. Ananya Sen",
      department: "Neurology & Neurosurgery",
      opdRoom: "Room 201",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "12:15 PM",
      type: "Movement Disorder",
      status: "Waiting",
      priority: "Normal",
      chiefComplaint: "Resting tremor of right fingers and mild cogwheel rigidity",
      fee: 1100,
      paymentStatus: "Paid"
    },

    // --- Dr. Vikramaditya Rao (DOC-105 - Internal Medicine) ---
    {
      id: "APT-112",
      tokenNumber: "TK-12",
      uhid: "PA-2026-0056",
      patientName: "Devendra Singh Rawat",
      patientPhone: "+91 97180-22134",
      doctorId: "DOC-105",
      doctorName: "Dr. Vikramaditya Rao",
      department: "Internal Medicine & Diabetology",
      opdRoom: "Room 103",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "09:00 AM",
      type: "Diabetic Review",
      status: "In Consultation",
      priority: "Normal",
      chiefComplaint: "Uncontrolled blood glucose (FBS 210 mg/dL, HbA1c 8.8%) and peripheral tingling",
      fee: 750,
      paymentStatus: "Paid"
    },
    {
      id: "APT-113",
      tokenNumber: "TK-13",
      uhid: "PA-2026-0027",
      patientName: "Suresh P. Verma",
      patientPhone: "+91 98114-77002",
      doctorId: "DOC-105",
      doctorName: "Dr. Vikramaditya Rao",
      department: "Internal Medicine & Diabetology",
      opdRoom: "Room 103",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "09:40 AM",
      type: "General OPD",
      status: "Waiting",
      priority: "Normal",
      chiefComplaint: "Persistent daytime fatigue, elevated uric acid (8.4 mg/dL)",
      fee: 750,
      paymentStatus: "Paid"
    },

    // --- Dr. Sunita Kulkarni (DOC-106 - Obstetrics & Gynecology) ---
    {
      id: "APT-114",
      tokenNumber: "TK-14",
      uhid: "PA-2026-0034",
      patientName: "Meera Nair",
      patientPhone: "+91 98451-87290",
      doctorId: "DOC-106",
      doctorName: "Dr. Sunita Kulkarni",
      department: "Obstetrics & Gynecology",
      opdRoom: "Room 205",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "09:15 AM",
      type: "Antenatal OPD",
      status: "In Consultation",
      priority: "Normal",
      chiefComplaint: "24-week routine antenatal fetal scan & blood pressure check",
      fee: 950,
      paymentStatus: "Paid"
    },
    {
      id: "APT-115",
      tokenNumber: "TK-15",
      uhid: "PA-2026-0079",
      patientName: "Pooja Aggarwal",
      patientPhone: "+91 98109-33211",
      doctorId: "DOC-106",
      doctorName: "Dr. Sunita Kulkarni",
      department: "Obstetrics & Gynecology",
      opdRoom: "Room 205",
      date: new Date().toISOString().split('T')[0],
      timeSlot: "10:00 AM",
      type: "PCOS Evaluation",
      status: "Waiting",
      priority: "Normal",
      chiefComplaint: "Oligomenorrhea, hormonal acne & ultrasound pelvic review",
      fee: 950,
      paymentStatus: "Paid"
    }
  ],
  beds: [
    { id: "BED-GW-M01", ward: "General Ward - Male", floor: "1st Floor, Wing A", type: "Standard", rate: 1500, status: "Occupied", patientUhid: "PA-2026-0012", patientName: "Ramesh Chandra Gupta", doctorName: "Dr. Vikramaditya Rao", admittedOn: "2026-10-21", diagnosis: "Diabetic Foot Cellulitis" },
    { id: "BED-GW-M02", ward: "General Ward - Male", floor: "1st Floor, Wing A", type: "Standard", rate: 1500, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },
    { id: "BED-GW-M03", ward: "General Ward - Male", floor: "1st Floor, Wing A", type: "Standard", rate: 1500, status: "Cleaning", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },
    { id: "BED-GW-M04", ward: "General Ward - Male", floor: "1st Floor, Wing A", type: "Standard", rate: 1500, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },
    { id: "BED-GW-F01", ward: "General Ward - Female", floor: "1st Floor, Wing B", type: "Standard", rate: 1500, status: "Occupied", patientUhid: "PA-2026-0034", patientName: "Meera Nair", doctorName: "Dr. Sunita Kulkarni", admittedOn: "2026-10-20", diagnosis: "Acute Pelvic Pain" },
    { id: "BED-GW-F02", ward: "General Ward - Female", floor: "1st Floor, Wing B", type: "Standard", rate: 1500, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },
    { id: "BED-SP-201", ward: "Semi-Private Ward", floor: "2nd Floor, Wing C", type: "Semi-Private", rate: 3200, status: "Occupied", patientUhid: "PA-2026-0091", patientName: "Kavita Singhania", doctorName: "Dr. Ananya Sen", admittedOn: "2026-10-22", diagnosis: "Intractable Migraine Protocol" },
    { id: "BED-SP-202", ward: "Semi-Private Ward", floor: "2nd Floor, Wing C", type: "Semi-Private", rate: 3200, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },
    { id: "BED-ICU-01", ward: "Intensive Care Unit (ICU)", floor: "3rd Floor, Critical Wing", type: "Critical Care", rate: 7500, status: "Occupied", patientUhid: "PA-2026-0104", patientName: "Harishankar Trivedi", doctorName: "Dr. Arvind Mehta", admittedOn: "2026-10-21", diagnosis: "Acute STEMI / Post-PCI" },
    { id: "BED-ICU-02", ward: "Intensive Care Unit (ICU)", floor: "3rd Floor, Critical Wing", type: "Critical Care", rate: 7500, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null },
    { id: "BED-DLX-301", ward: "Deluxe Suite Wing", floor: "4th Floor, Executive", type: "Deluxe Suite", rate: 6500, status: "Available", patientUhid: null, patientName: null, doctorName: null, admittedOn: null, diagnosis: null }
  ],
  medicines: [
    { id: "MED-01", name: "Paracetamol 650mg (Dolo)", category: "Analgesic & Antipyretic", batch: "BT-2401", expiry: "2027-08", stock: 1250, minStock: 200, unitPrice: 32.50, unit: "Strip of 15" },
    { id: "MED-02", name: "Amoxicillin + Clavulanic 625mg (Augmentin)", category: "Antibiotic", batch: "BT-2398", expiry: "2026-12", stock: 340, minStock: 100, unitPrice: 185.00, unit: "Strip of 10" },
    { id: "MED-03", name: "Atorvastatin 20mg (Atorva)", category: "Cardiovascular / Statin", batch: "BT-2415", expiry: "2027-04", stock: 520, minStock: 150, unitPrice: 145.00, unit: "Strip of 15" },
    { id: "MED-04", name: "Metformin 500mg SR (Glycomet)", category: "Antidiabetic", batch: "BT-2350", expiry: "2027-11", stock: 890, minStock: 200, unitPrice: 48.00, unit: "Strip of 20" },
    { id: "MED-05", name: "Pantoprazole 40mg (Pan 40)", category: "Gastrointestinal / PPI", batch: "BT-2462", expiry: "2028-01", stock: 740, minStock: 150, unitPrice: 98.00, unit: "Strip of 15" }
  ],
  staffUsers: [
    {
      id: "ADM-001",
      name: "Hospital Super Administrator",
      username: "admin",
      role: "Admin",
      pin: "1234",
      doctorId: null,
      department: "Executive Management & Clinical Ops",
      opdRoom: "Admin Suite 101",
      phone: "+91 (11) 4980-2200",
      email: "admin@pulseaura.org",
      status: "Active"
    },
    {
      id: "DOC-101",
      name: "Dr. Arvind Mehta",
      username: "dr.arvind",
      role: "Doctor",
      pin: "1234",
      doctorId: "DOC-101",
      department: "Cardiology & Cardiac Surgery",
      opdRoom: "Room 102",
      phone: "+91 98111-22334",
      email: "dr.arvind@pulseaura.org",
      status: "Active"
    },
    {
      id: "DOC-102",
      name: "Dr. Priya Sharma",
      username: "dr.priya",
      role: "Doctor",
      pin: "1234",
      doctorId: "DOC-102",
      department: "Pediatrics & Neonatal Care",
      opdRoom: "Room 108",
      phone: "+91 98111-33445",
      email: "dr.priya@pulseaura.org",
      status: "Active"
    },
    {
      id: "DOC-103",
      name: "Dr. Rajesh Varma",
      username: "dr.rajesh",
      role: "Doctor",
      pin: "1234",
      doctorId: "DOC-103",
      department: "Orthopedics & Joint Replacement",
      opdRoom: "Room 105",
      phone: "+91 98111-44556",
      email: "dr.rajesh@pulseaura.org",
      status: "Active"
    },
    {
      id: "DOC-104",
      name: "Dr. Ananya Sen",
      username: "dr.ananya",
      role: "Doctor",
      pin: "1234",
      doctorId: "DOC-104",
      department: "Neurology & Neurosurgery",
      opdRoom: "Room 201",
      phone: "+91 98111-55667",
      email: "dr.ananya@pulseaura.org",
      status: "Active"
    },
    {
      id: "DOC-105",
      name: "Dr. Vikramaditya Rao",
      username: "dr.vikram",
      role: "Doctor",
      pin: "1234",
      doctorId: "DOC-105",
      department: "Internal Medicine & Diabetology",
      opdRoom: "Room 103",
      phone: "+91 98111-66778",
      email: "dr.vikram@pulseaura.org",
      status: "Active"
    },
    {
      id: "DOC-106",
      name: "Dr. Sunita Kulkarni",
      username: "dr.sunita",
      role: "Doctor",
      pin: "1234",
      doctorId: "DOC-106",
      department: "Obstetrics & Gynecology",
      opdRoom: "Room 205",
      phone: "+91 98111-77889",
      email: "dr.sunita@pulseaura.org",
      status: "Active"
    },
    {
      id: "STF-201",
      name: "Sister Sarita Joseph",
      username: "nurse.sarita",
      role: "Nurse",
      pin: "1234",
      doctorId: null,
      department: "ICU & Critical Care Nursing",
      opdRoom: "Nursing Station 3A",
      phone: "+91 98111-88990",
      email: "nurse.sarita@pulseaura.org",
      status: "Active"
    },
    {
      id: "STF-301",
      name: "Rohan Kapoor",
      username: "pharm.rohan",
      role: "Pharmacist",
      pin: "1234",
      doctorId: null,
      department: "Central Pharmacy & Dispensing",
      opdRoom: "Pharmacy Counter 1",
      phone: "+91 98111-99001",
      email: "pharm.rohan@pulseaura.org",
      status: "Active"
    }
  ]
};

export const runSeeder = async () => {
  const connected = await connectDB();
  if (!connected) return;

  try {
    console.log('[Seeder]: Populating initial healthcare records...');
    await Hospital.deleteMany({});
    await Hospital.create(seedHospitalData.hospital);

    await Doctor.deleteMany({});
    await Doctor.insertMany(seedHospitalData.doctors);

    await Patient.deleteMany({});
    await Patient.insertMany(seedHospitalData.patients);

    await Bed.deleteMany({});
    await Bed.insertMany(seedHospitalData.beds);

    await Medicine.deleteMany({});
    await Medicine.insertMany(seedHospitalData.medicines);

    await Appointment.deleteMany({});
    await Appointment.insertMany(seedHospitalData.appointments);

    await StaffUser.deleteMany({});
    await StaffUser.insertMany(seedHospitalData.staffUsers);

    console.log('[Seeder Complete]: Database successfully initialized with doctor-wise records and staff accounts!');
  } catch (err) {
    console.error('[Seeder Error]:', err);
  }
};

// If executed directly from command line
if (process.argv[1]?.endsWith('seeder.js')) {
  runSeeder().then(() => process.exit(0));
}
