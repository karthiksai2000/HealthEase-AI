# test.py
import sqlite3
from datetime import datetime, timedelta
import json
from passlib.context import CryptContext

# Initialize bcrypt context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)

def populate_database():
    conn = sqlite3.connect('database/healthcare_db.db')
    cursor = conn.cursor()

    # Tables to populate
    tables = [
        'call_bookings', 'symptom_checks', 'doctor_documents', 'prescriptions', 
        'medical_records', 'appointments', 'doctors', 'hospitals', 'users', 'admins'
    ]

    # 1️⃣ Clear old data
    for table in tables:
        cursor.execute(f'DELETE FROM {table}')

    # 2️⃣ Reset auto-increment safely
    try:
        for table in tables:
            cursor.execute(f'DELETE FROM sqlite_sequence WHERE name="{table}"')
    except sqlite3.OperationalError:
        # sqlite_sequence may not exist if tables don't have AUTOINCREMENT
        pass

    now = datetime.now()

    # 3️⃣ Hospitals (20 records)
    hospitals = [
        (i+1, f'Hospital {i+1}', f'{i*10+1} MG Road, City{i+1}', 28.6+i, 77.2+i, 
         f'+91-98765{i:05d}', f'hospital{i+1}@india.com', f'https://hospital{i+1}.in', 
         'APPROVED', now, now)
        for i in range(20)
    ]
    cursor.executemany('''
        INSERT INTO hospitals (hospital_id, name, address, location_lat, location_long, contact_number, email, website, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', hospitals)

    # 4️⃣ Users / Patients (20 records)
    indian_names = [
        "Aarav Sharma", "Ananya Singh", "Rohan Mehta", "Sanya Kapoor", "Vivaan Patel",
        "Ishita Rao", "Kabir Gupta", "Meera Iyer", "Aditya Nair", "Tanya Desai",
        "Arjun Joshi", "Priya Chawla", "Kartik Rao", "Neha Malhotra", "Vikas Jain",
        "Simran Kaur", "Raghav Verma", "Diya Bhatt", "Shivansh Bhatia", "Aisha Khan"
    ]
    users = [
        (i+1, indian_names[i], f'user{i+1}@gmail.com', f'+91-90000{i:05d}', hash_password('password123'), 
         20+i*2, 'M' if i%2==0 else 'F', 'Delhi', f'{i+1} Health Lane, Delhi', True, 'USER', now, now)
        for i in range(20)
    ]
    cursor.executemany('''
        INSERT INTO users (user_id, name, email, phone, password_hash, age, gender, location, address, is_verified, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', users)

    # 5️⃣ Doctors (20 records)
    doctor_names = [
        "Dr. Neha Kapoor", "Dr. Raj Malhotra", "Dr. Priya Iyer", "Dr. Karan Singh",
        "Dr. Sneha Sharma", "Dr. Arjun Rao", "Dr. Meera Patel", "Dr. Rakesh Gupta",
        "Dr. Anjali Nair", "Dr. Varun Desai", "Dr. Karthik Sai", "Dr. Aditi Mehra",
        "Dr. Sameer Khanna", "Dr. Shreya Joshi", "Dr. Akash Reddy", "Dr. Anika Roy",
        "Dr. Dhruv Malhotra", "Dr. Tanya Kapoor", "Dr. Rajesh Singh", "Dr. Kavya Iyer"
    ]
    doctors = [
        (i+1, doctor_names[i], f'doctor{i+1}@hospital{i%20+1}.in', f'+91-88000{i:05d}', hash_password('doctor123'), 
         f'Specialty {i+1}', f'LIC{i+1:05d}', 5+i, 'MBBS, MD', 'Experienced doctor in specialty', 
         'APPROVED', i%20+1, 500+i*50, json.dumps({"monday": "9:00-17:00"}), True, 'DOCTOR', now, now)
        for i in range(20)
    ]
    cursor.executemany('''
        INSERT INTO doctors (doctor_id, name, email, phone, password_hash, specialization, license_number, experience_years, qualifications, bio, status, hospital_id, consultation_fee, availability, is_online, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', doctors)

    # 6️⃣ Appointments (20 records)
    appointments = [
        (i+1, i%20+1, i%20+1, i%20+1, 'IN_PERSON', None, now + timedelta(days=i), 30, f'General symptoms example {i+1}', 
         'MEDIUM', 'CONFIRMED', f'Appointment notes {i+1}', now, now)
        for i in range(20)
    ]
    cursor.executemany('''
        INSERT INTO appointments (appointment_id, user_id, doctor_id, hospital_id, appointment_type, video_link, appointment_time, duration, symptoms, urgency, status, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', appointments)

    # 7️⃣ Prescriptions (20 records)
    prescriptions = [
        (i+1, i+1, i%20+1, i%20+1, 'Diagnosis example', 
         json.dumps([{"name":f"Med{i+1}", "dosage":"10mg", "frequency":"Once daily", "duration":"7 days"}]), 
         'Follow instructions properly.', now + timedelta(days=30), now)
        for i in range(20)
    ]
    cursor.executemany('''
        INSERT INTO prescriptions (prescription_id, appointment_id, doctor_id, user_id, diagnosis, medications, instructions, follow_up_date, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', prescriptions)

    # 8️⃣ Medical Records (20 records)
    medical_records = [
        (i+1, i%20+1, f'/uploads/medical/record_{i+1}.pdf', f'Record {i+1}', 'LAB_REPORT', 'Sample medical report description', now)
        for i in range(20)
    ]
    cursor.executemany('''
        INSERT INTO medical_records (record_id, user_id, file_url, file_name, file_type, description, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', medical_records)

    # 9️⃣ Doctor Documents (20 records)
    doctor_documents = [
        (i+1, i%20+1, 'medical_license', f'/uploads/docs/doc_{i+1}_license.pdf', True, now)
        for i in range(20)
    ]
    cursor.executemany('''
        INSERT INTO doctor_documents (document_id, doctor_id, document_type, file_url, verified, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', doctor_documents)

    # 🔟 Symptom Checks (20 records)
    symptom_checks = [
        (i+1, i%20+1, f'Symptoms example {i+1}', f'Specialty {i+1}', 'MEDIUM', json.dumps([i%20+1]), now)
        for i in range(20)
    ]
    cursor.executemany('''
        INSERT INTO symptom_checks (check_id, user_id, symptoms, suggested_specialization, urgency, recommended_doctors, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', symptom_checks)

    # 1️⃣1️⃣ Admins (20 records)
    admin_names = [f"Admin {i+1}" for i in range(20)]
    admins = [
        (i+1, admin_names[i], f'admin{i+1}@healthcare.in', hash_password('admin123'), 'ADMIN', now)
        for i in range(20)
    ]
    cursor.executemany('''
        INSERT INTO admins (admin_id, name, email, password_hash, role, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', admins)

    # 1️⃣2️⃣ Call Bookings (20 records)
    call_bookings = [
        (i+1, f'+91-90000{i:05d}', i%20+1, f'Symptoms example {i+1}', f'Specialty {i+1}', 'MEDIUM', i%20+1, 
         now - timedelta(hours=i*2), 30+i*5, 'COMPLETED')
        for i in range(20)
    ]
    cursor.executemany('''
        INSERT INTO call_bookings (call_id, caller_number, user_id, symptoms, suggested_specialization, urgency, booked_appointment_id, call_timestamp, call_duration, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', call_bookings)

    conn.commit()
    conn.close()

    print("✅ Database populated successfully with 20 Indian records per table!")
    print("\nSample login credentials:")
    print("Patients: user1@gmail.com / password123")
    print("Doctors: doctor1@hospital1.in / doctor123")
    print("Admins: admin1@healthcare.in / admin123")

if __name__ == "__main__":
    populate_database()
