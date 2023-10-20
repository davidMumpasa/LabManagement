from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy import DateTime, Boolean

db = SQLAlchemy()


# Define the User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    first_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=True)
    profile_picture = db.Column(db.String(255), nullable=True)


class Lab(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lab_name = db.Column(db.String(100), unique=True, nullable=False)
    location = db.Column(db.String(100), nullable=True)
    current_capacity = db.Column(db.Integer, nullable=True)
    status = db.Column(db.String(10), nullable=True)  # Updated data type
    capacity = db.Column(db.Integer, nullable=True)
    description = db.Column(db.Text, nullable=True)


class LabBooking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lab_id = db.Column(db.Integer, db.ForeignKey('lab.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    booking_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    purpose = db.Column(db.String(200), nullable=True)


class LabAvailability(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lab_id = db.Column(db.Integer, db.ForeignKey('lab.id'), nullable=False)
    available_from = db.Column(DateTime, nullable=False)
    available_to = db.Column(DateTime, nullable=False)
    is_available = db.Column(Boolean, default=True, nullable=False)
    notes = db.Column(db.Text, nullable=True)  # Additional field for notes or comments

    def __init__(self, lab_id, available_from, available_to, is_available=True, notes=None):
        self.lab_id = lab_id
        self.available_from = available_from
        self.available_to = available_to
        self.is_available = is_available
        self.notes = notes


class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    content = db.Column(db.String(255), nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False)

    def __init__(self, user_id, content, is_read=False):
        self.user_id = user_id
        self.content = content
        self.is_read = is_read
