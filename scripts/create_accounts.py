#!/usr/bin/env python3
"""
Script to create teacher and student accounts from CSV files
Run this script to bulk import all the real data
"""

import csv
import requests
import json
import os

# Configuration
BASE_URL = "http://localhost:3000"  # Change this to your actual URL
ADMIN_EMAIL = "teacher@demo.com"    # Use an existing admin account
ADMIN_PASSWORD = "demo123"

def login_admin():
    """Login as admin to get session"""
    login_data = {
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }
    
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    if response.status_code == 200:
        print("✅ Admin login successful")
        return response.cookies
    else:
        print("❌ Admin login failed")
        return None

def import_data(file_path, endpoint, cookies, data_type):
    """Import data from CSV file"""
    print(f"\n📁 Importing {data_type} from {file_path}")
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    try:
        with open(file_path, 'rb') as file:
            files = {'file': file}
            data = {'format': 'csv'}
            
            response = requests.post(
                f"{BASE_URL}{endpoint}",
                files=files,
                data=data,
                cookies=cookies
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ {data_type} import completed:")
                print(f"   - Imported: {result.get('imported', 0)}")
                print(f"   - Errors: {len(result.get('errors', []))}")
                print(f"   - Duplicates: {len(result.get('duplicates', []))}")
                
                if result.get('errors'):
                    print("   Errors:")
                    for error in result['errors'][:5]:  # Show first 5 errors
                        print(f"     • {error}")
                
                return True
            else:
                print(f"❌ {data_type} import failed: {response.status_code}")
                print(f"   Response: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Error importing {data_type}: {str(e)}")
        return False

def main():
    print("🚀 Starting bulk account creation...")
    print("=" * 50)
    
    # Login as admin
    cookies = login_admin()
    if not cookies:
        print("❌ Cannot proceed without admin access")
        return
    
    # Import teachers first
    teachers_success = import_data(
        "real-data/teachers.csv",
        "/api/admin/import/teachers",
        cookies,
        "Teachers"
    )
    
    # Import students
    students_success = import_data(
        "real-data/students.csv",
        "/api/admin/import/students",
        cookies,
        "Students"
    )
    
    # Import sample courses (optional)
    courses_success = import_data(
        "real-data/sample-courses.csv",
        "/api/admin/import/courses",
        cookies,
        "Sample Courses"
    )
    
    print("\n" + "=" * 50)
    print("📊 IMPORT SUMMARY:")
    print(f"Teachers: {'✅ Success' if teachers_success else '❌ Failed'}")
    print(f"Students: {'✅ Success' if students_success else '❌ Failed'}")
    print(f"Courses: {'✅ Success' if courses_success else '❌ Failed'}")
    
    if teachers_success and students_success:
        print("\n🎉 Account creation completed successfully!")
        print("\n📋 LOGIN CREDENTIALS:")
        print("Teachers: Use their email + password 'teacher123'")
        print("Students: Use their email + password 'student123'")
        print("\n📧 EMAIL FORMAT:")
        print("Teachers: firstname.lastname@university.edu")
        print("Students: studentid@university.edu")
    else:
        print("\n⚠️  Some imports failed. Check the errors above.")

if __name__ == "__main__":
    main()
