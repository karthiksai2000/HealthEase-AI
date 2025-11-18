from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Hospital, Doctor, DoctorStatus, HospitalStatus, UserRole
from werkzeug.security import generate_password_hash

# 1. Database connection
# Replace with your actual DB URL
DATABASE_URL = "postgresql://username:password@localhost/healthcare"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()

# 2. Create all tables if not exist
Base.metadata.create_all(bind=engine)

# 3. Sample Hospitals
hospitals = [
    Hospital(
        name="Apollo Hospital Delhi",
        address="Mathura Road, New Delhi",
        location_lat=28.5672,
        location_long=77.2100,
        contact_number="+91-9810000001",
        email="info@apollo.in",
        website="https://apollohospdelhi.in",
        status=HospitalStatus.APPROVED
    ),
    Hospital(
        name="Fortis Hospital Hyderabad",
        address="Banjara Hills, Hyderabad",
        location_lat=17.4120,
        location_long=78.4575,
        contact_number="+91-9810000002",
        email="info@fortis.in",
        website="https://fortishyderabad.in",
        status=HospitalStatus.APPROVED
    ),
    Hospital(
        name="AIIMS Delhi",
        address="Ansari Nagar, New Delhi",
        location_lat=28.5672,
        location_long=77.2100,
        contact_number="+91-9810000003",
        email="info@aiims.in",
        website="https://aiimsdelhi.in",
        status=HospitalStatus.APPROVED
    ),
    Hospital(
        name="KIMS Bangalore",
        address="Malleshwaram, Bangalore",
        location_lat=12.9784,
        location_long=77.5912,
        contact_number="+91-9810000004",
        email="info@kims.in",
        website="https://kimsbangalore.in",
        status=HospitalStatus.APPROVED
    ),
    Hospital(
        name="Nanavati Hospital Mumbai",
        address="Vile Parle West, Mumbai",
        location_lat=19.1030,
        location_long=72.8330,
        contact_number="+91-9810000005",
        email="info@nanavati.in",
        website="https://nanavatimumbai.in",
        status=HospitalStatus.APPROVED
    ),
    Hospital(
        name="Sterling Hospital Ahmedabad",
        address="Gurukul Road, Ahmedabad",
        location_lat=23.0400,
        location_long=72.5500,
        contact_number="+91-9810000006",
        email="info@sterling.in",
        website="https://sterlingahmedabad.in",
        status=HospitalStatus.APPROVED
    ),
    Hospital(
        name="Medanta Hospital Gurugram",
        address="Sector 38, Gurugram",
        location_lat=28.4595,
        location_long=77.0266,
        contact_number="+91-9810000007",
        email="info@medanta.in",
        website="https://medantagurgaon.in",
        status=HospitalStatus.APPROVED
    ),
    Hospital(
        name="Aster Hospital Kochi",
        address="Kaloor, Kochi",
        location_lat=9.9816,
        location_long=76.2999,
        contact_number="+91-9810000008",
        email="info@aster.in",
        website="https://asterkochi.in",
        status=HospitalStatus.APPROVED
    ),
    Hospital(
        name="CMC Vellore",
        address="IDA Scudder Road, Vellore",
        location_lat=12.9165,
        location_long=79.1325,
        contact_number="+91-9810000009",
        email="info@cmc.in",
        website="https://cmcvellore.in",
        status=HospitalStatus.APPROVED
    ),
    Hospital(
        name="Ruby Hall Clinic Pune",
        address="Sassoon Road, Pune",
        location_lat=18.5300,
        location_long=73.8700,
        contact_number="+91-9810000010",
        email="info@rubyhall.in",
        website="https://rubyhallpune.in",
        status=HospitalStatus.APPROVED
    ),
]

# 4. Sample Doctors (linked to hospitals by hospital_id)
doctors = [
    Doctor(
        name="Dr. Arjun Mehta",
        email="arjun.mehta@apollo.in",
        phone="+91-9812345670",
        password_hash=generate_password_hash("password123"),
        specialization="Cardiologist",
        license_number="DL12345",
        experience_years=15,
        qualifications="MBBS, MD",
        bio="Senior cardiologist at Apollo Hospital Delhi.",
        status=DoctorStatus.APPROVED,
        hospital_id=1,
        consultation_fee=1000.0,
        availability='{"mon-fri":"10:00-16:00"}',
        is_online=True,
        role=UserRole.DOCTOR
    ),
    Doctor(
        name="Dr. Priya Reddy",
        email="priya.reddy@fortis.in",
        phone="+91-9876543210",
        password_hash=generate_password_hash("password123"),
        specialization="Neurologist",
        license_number="TS56789",
        experience_years=12,
        qualifications="MBBS, DM Neurology",
        bio="Specialist in neurological disorders at Fortis Hyderabad.",
        status=DoctorStatus.APPROVED,
        hospital_id=2,
        consultation_fee=1200.0,
        availability='{"mon-sat":"09:00-14:00"}',
        is_online=True,
        role=UserRole.DOCTOR
    ),
    Doctor(
        name="Dr. Rohan Sharma",
        email="rohan.sharma@aiims.in",
        phone="+91-9911223344",
        password_hash=generate_password_hash("password123"),
        specialization="Oncologist",
        license_number="DL98765",
        experience_years=10,
        qualifications="MBBS, DM Oncology",
        bio="Oncology expert at AIIMS Delhi.",
        status=DoctorStatus.APPROVED,
        hospital_id=3,
        consultation_fee=1500.0,
        availability='{"tue-fri":"11:00-17:00"}',
        is_online=False,
        role=UserRole.DOCTOR
    ),
    Doctor(
        name="Dr. Kavya Iyer",
        email="kavya.iyer@kims.in",
        phone="+91-9822114455",
        password_hash=generate_password_hash("password123"),
        specialization="Pediatrician",
        license_number="KA11223",
        experience_years=8,
        qualifications="MBBS, DCH",
        bio="Child specialist at KIMS Bangalore.",
        status=DoctorStatus.APPROVED,
        hospital_id=4,
        consultation_fee=800.0,
        availability='{"mon-fri":"10:00-15:00"}',
        is_online=True,
        role=UserRole.DOCTOR
    ),
    Doctor(
        name="Dr. Sameer Khan",
        email="sameer.khan@nanavati.in",
        phone="+91-9765432100",
        password_hash=generate_password_hash("password123"),
        specialization="Orthopedic Surgeon",
        license_number="MH22334",
        experience_years=20,
        qualifications="MBBS, MS Ortho",
        bio="Experienced orthopedic surgeon at Nanavati Mumbai.",
        status=DoctorStatus.APPROVED,
        hospital_id=5,
        consultation_fee=2000.0,
        availability='{"mon-sat":"09:00-13:00"}',
        is_online=False,
        role=UserRole.DOCTOR
    ),
    Doctor(
        name="Dr. Ananya Patel",
        email="ananya.patel@sterling.in",
        phone="+91-9687001234",
        password_hash=generate_password_hash("password123"),
        specialization="Dermatologist",
        license_number="GJ44556",
        experience_years=6,
        qualifications="MBBS, MD Dermatology",
        bio="Skin specialist at Sterling Hospital Ahmedabad.",
        status=DoctorStatus.APPROVED,
        hospital_id=6,
        consultation_fee=700.0,
        availability='{"mon-sat":"11:00-16:00"}',
        is_online=True,
        role=UserRole.DOCTOR
    ),
    Doctor(
        name="Dr. Manish Gupta",
        email="manish.gupta@medanta.in",
        phone="+91-9811100011",
        password_hash=generate_password_hash("password123"),
        specialization="Gastroenterologist",
        license_number="HR66778",
        experience_years=14,
        qualifications="MBBS, DM Gastroenterology",
        bio="Digestive health expert at Medanta Gurugram.",
        status=DoctorStatus.APPROVED,
        hospital_id=7,
        consultation_fee=1300.0,
        availability='{"mon-fri":"12:00-18:00"}',
        is_online=True,
        role=UserRole.DOCTOR
    ),
    Doctor(
        name="Dr. Sneha Nair",
        email="sneha.nair@aster.in",
        phone="+91-9900991122",
        password_hash=generate_password_hash("password123"),
        specialization="Gynecologist",
        license_number="KL77889",
        experience_years=11,
        qualifications="MBBS, MD Gynecology",
        bio="Women’s health specialist at Aster Kochi.",
        status=DoctorStatus.APPROVED,
        hospital_id=8,
        consultation_fee=1100.0,
        availability='{"mon-sat":"10:00-14:00"}',
        is_online=False,
        role=UserRole.DOCTOR
    ),
    Doctor(
        name="Dr. Rajesh Kumar",
        email="rajesh.kumar@cmc.in",
        phone="+91-9822233445",
        password_hash=generate_password_hash("password123"),
        specialization="General Physician",
        license_number="TN88990",
        experience_years=18,
        qualifications="MBBS, MD General Medicine",
        bio="General medicine consultant at CMC Vellore.",
        status=DoctorStatus.APPROVED,
        hospital_id=9,
        consultation_fee=900.0,
        availability='{"mon-fri":"09:00-17:00"}',
        is_online=True,
        role=UserRole.DOCTOR
    ),
    Doctor(
        name="Dr. Aditi Deshmukh",
        email="aditi.deshmukh@rubyhall.in",
        phone="+91-9797979797",
        password_hash=generate_password_hash("password123"),
        specialization="Psychiatrist",
        license_number="MH99112",
        experience_years=9,
        qualifications="MBBS, MD Psychiatry",
        bio="Mental health expert at Ruby Hall Pune.",
        status=DoctorStatus.APPROVED,
        hospital_id=10,
        consultation_fee=1000.0,
        availability='{"mon-fri":"10:00-16:00"}',
        is_online=True,
        role=UserRole.DOCTOR
    ),
]

# 5. Insert into DB
def seed():
    try:
        session.add_all(hospitals)
        session.commit()
        session.add_all(doctors)
        session.commit()
        print("✅ Seed data inserted successfully!")
    except Exception as e:
        session.rollback()
        print("❌ Error:", e)
    finally:
        session.close()

if __name__ == "__main__":
    seed()
