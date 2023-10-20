import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from Entities.entities import db, User, Lab, LabBooking, LabAvailability, Notification
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:DavidEbula1999@localhost:3306/LaboratoryManagement'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key'

db.init_app(app)

with app.app_context():
    db.create_all()

jwt = JWTManager(app)


@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data['email']
        password = data['password']
        user = User.query.filter_by(email=email, password=password).first()

        if user:
            access_token = create_access_token(identity=user.id)
            print(access_token)
            return jsonify({'message': 'Login successful.', 'access_token': access_token}), 200
        else:
            return jsonify({'message': 'Invalid username or password.'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/logout', methods=['GET'])
@jwt_required()
def logout():
    try:
        user_id = get_jwt_identity()
        return jsonify({'message': 'Logout successful.', 'user_id': user_id}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/book/<int:lab_id>', methods=['POST'])
@jwt_required()
def book_lab(lab_id):
    try:
        data = request.get_json()
        user_id = get_jwt_identity()
        user_id = get_jwt_identity()
        booking_date = data['booking_date']
        start_time = data['start_time']
        end_time = data['end_time']
        purpose = data['purpose']

        # Input validation (you can customize this based on your requirements)
        if not (booking_date and start_time and end_time and purpose):
            return jsonify({'message': 'Invalid input data'}), 400

        lab = Lab.query.get(lab_id)

        if not lab:
            return jsonify({'message': 'Lab not found'}), 404

        existing_booking = LabBooking.query.filter_by(lab_id=lab_id).first()

        if existing_booking and existing_booking.purpose == "full_booking":
            lab.current_capacity = lab.capacity
            return jsonify({'message': 'Lab is currently not available'}), 400

        if lab.current_capacity == lab.capacity:
            lab.status = "closed"
            return jsonify({'message': 'Lab is full'}), 400

        new_labBooking = LabBooking(
            lab_id=lab_id, user_id=user_id, booking_date=booking_date, start_time=start_time,
            end_time=end_time, purpose=purpose)

        if purpose == "full_booking":
            lab.status = "closed"
            lab.current_capacity = lab.capacity

        else:
            lab.current_capacity += 1
            lab.status = "opened"

        db.session.add(new_labBooking)
        db.session.commit()

        # User is of type "security," send a notification
        notification_content = f"Lab booking for {booking_date} at {start_time} - {end_time} is created."
        new_notification = Notification(user_id=user_id, content=notification_content)

        db.session.add(new_notification)
        db.session.commit()

        return jsonify({'message': 'Lab booking created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Define a function to save the uploaded profile picture
def save_profile_picture(file):
    if file:
        filename = secure_filename(file.filename)
        # Use forward slashes in the file path
        upload_folder = 'C:/Users/david/OneDrive/Documents/David/projects/lab-management-app/src/assets/images/profile'
        file.save(os.path.join(upload_folder, filename))
        return filename  # Return the saved filename


@app.route('/register', methods=['POST'])
def create_user():
    try:
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        first_name = request.form['firstname']
        last_name = request.form['lastname']
        role = request.form['role']
        profile_picture = request.files['profile_picture']

        if "@tut4life.ac.za" in email:
            # Check if the username already exists

            existing_user = User.query.filter_by(username=username).first()
            if existing_user:
                return jsonify({'message': 'Username already exists'}), 400

            # Save the profile picture and get the saved filename
            profile_picture_filename = save_profile_picture(profile_picture)
            print("--------------------------------------------")
            print("profile_picture ", profile_picture_filename)

            # Create a new user
            new_user = User(username=username, password=password, role=role, first_name=first_name, last_name=last_name,
                            email=email, profile_picture=profile_picture_filename)
            db.session.add(new_user)
            db.session.commit()
        else:
            return jsonify({'message': 'Incorrect Email Address. A TUT Email is required to Register'}), 400

        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/lab', methods=['POST'])
def create_lab():
    try:
        data = request.get_json()
        lab_name = data['lab_name']
        location = data['location']
        capacity = data['capacity']
        description = data['description']
        existing_lab = Lab.query.filter_by(lab_name=lab_name).first()

        if existing_lab:
            return jsonify({'message': 'Lab name already exists'}), 400

        new_lab = Lab(lab_name=lab_name, location=location, capacity=capacity, description=description,
                      current_capacity=0)

        db.session.add(new_lab)
        db.session.commit()

        return jsonify({'message': 'Lab created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/labs', methods=['GET'])
@jwt_required()
def get_all_labs():
    labs = Lab.query.all()
    lab_list = []

    for lab in labs:
        if lab.current_capacity == lab.capacity:
            lab.status = "closed"
            db.session.add(lab)
            db.session.commit()

        lab_data = {
            'id': lab.id,
            'lab_name': lab.lab_name,
            'location': lab.location,
            'capacity': lab.capacity,
            'description': lab.description,
            'status': lab.status,
            'user_id': get_jwt_identity()
        }
        lab_list.append(lab_data)

    return jsonify(lab_list)


@app.route('/getLab/<int:lab_id>', methods=['GET'])
def get_lab(lab_id):
    try:
        lab = Lab.query.filter_by(id=lab_id).first()
        if lab:
            lab_data = {
                'id': lab.id,
                'lab_name': lab.lab_name,
                'location': lab.location,
                'capacity': lab.capacity,
                'description': lab.description,
                'current_capacity': lab.current_capacity,
                'status': lab.status
            }
            return jsonify(lab_data)
        else:
            return jsonify({'message': 'Lab not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/storeAvailability', methods=['POST'])
def add_lab_availability():
    try:
        lab_id = request.json['lab_id']
        available_from = request.json['available_from']
        available_to = request.json['available_to']
        is_available = True
        notes = request.json['notes']

        existing_lab = Lab.query.filter_by(id=lab_id).first()

        if existing_lab and existing_lab.status == "opened":
            is_available = True
        else:
            is_available = False

        new_availability = LabAvailability(lab_id=lab_id, available_from=available_from, available_to=available_to,
                                           is_available=is_available, notes=notes)
        db.session.add(new_availability)
        db.session.commit()
        return jsonify({'message': 'Lab availability created successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# Get all LabAvailability records
@app.route('/getAvailability', methods=['GET'])
def get_lab_availabilities():
    availabilities = LabAvailability.query.all()
    lab_availabilities = []

    for availability in availabilities:
        existing_lab = Lab.query.filter_by(id=availability.lab_id).first()
        lab_availability = {
            'lab_id': availability.lab_id,
            'lab_name': existing_lab.lab_name,
            'available_from': availability.available_from,
            'available_to': availability.available_to,
            'is_available': availability.is_available,
            'notes': availability.notes
        }
        lab_availabilities.append(lab_availability)
    return jsonify(lab_availabilities)


@app.route('/getUser/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = User.query.get(user_id)

        if user is None:
            return jsonify({'message': 'User not found'}), 404

        # Convert the user object to a dictionary
        user_data = {
            'id': user.id,
            'username': user.username,
            'role': user.role,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'profile_picture': user.profile_picture
        }

        return jsonify(user_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/editUser', methods=['PUT'])
def edit_user():
    try:
        print("-------------------------------")
        print("Received form data:", request.form)

        # Retrieve form data using request.form
        user_id = request.form['user_id']
        user = User.query.get(user_id)

        username = request.form['username']

        print(username)
        password = request.form['password']
        first_name = request.form['firstname']
        last_name = request.form['lastname']
        email = request.form['email']
        profile_picture = request.form['profile_picture']

        # Perform the necessary updates to the user object
        user.username = username
        user.password = password
        user.first_name = first_name
        user.last_name = last_name
        user.email = email

        # Handle profile picture if needed
        if profile_picture:
            profile_picture_filename = save_profile_picture(profile_picture)
            user.profile_picture = profile_picture_filename

        # Commit the changes to the database
        db.session.commit()

        return jsonify({'message': 'User profile updated successfully'}), 200
    except Exception as e:
        print("Error:", str(e))  # Log the error for debugging
        return jsonify({'error': str(e)}), 500


@app.route('/bookingHistory/<int:user_id>', methods=['GET'])
def get_booking_history(user_id):
    lab_bookings = LabBooking.query.filter_by(user_id=user_id).all()

    bookings_list = []

    for lab_booking in lab_bookings:
        lab_id = lab_booking.lab_id  # Access the lab_id from the individual LabBooking object
        lab = Lab.query.filter_by(id=lab_id).first()  # Assuming lab_id is a foreign key to the Lab model
        lab_data = {
            'booking_id': lab_booking.id,
            'lab_name': lab.lab_name,
            'lab_id': lab.id,
            'booking_date': lab_booking.booking_date.strftime('%Y-%m-%d'),
            'start_time': lab_booking.start_time.strftime('%H:%M:%S'),
            'end_time': lab_booking.end_time.strftime('%H:%M:%S'),
            'purpose': lab_booking.purpose,
        }
        bookings_list.append(lab_data)

    return jsonify(bookings_list)


@app.route('/cancelReservation/<int:booking_id>', methods=['DELETE'])
def cancelReservation(booking_id):
    # Find the reservation by booking_id
    lab_booking = LabBooking.query.get(booking_id)

    if lab_booking:
        # Remove the reservation from the database
        db.session.delete(lab_booking)
        db.session.commit()

        return jsonify({"message": "Reservation canceled successfully"})
    else:
        return jsonify({"message": "Reservation not found"}, 404)


@app.route('/updateReservation/<int:booking_id>', methods=['PUT'])
def update_reservation(booking_id):
    try:
        # Retrieve the LabBooking by its ID
        lab_booking = LabBooking.query.get(booking_id)

        # Check if the LabBooking exists
        if lab_booking is None:
            return jsonify({'error': 'LabBooking not found'}), 404

        # Get the data to update from the request
        data = request.json

        # Update the LabBooking fields
        lab_booking.lab_id = data['lab_id']
        lab_booking.user_id = data['user_id']
        lab_booking.booking_date = data['booking_date']
        lab_booking.start_time = data['start_time']
        lab_booking.end_time = data['end_time']
        lab_booking.purpose = data['purpose']

        # Commit the changes to the database
        db.session.commit()

        return jsonify({'message': 'LabBooking updated successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/notifications', methods=['GET'])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    notifications = Notification.query.filter_by(user_id=user_id).all()
    # Convert notifications to a list of dictionaries
    notifications_data = [{'id': n.id, 'content': n.content, 'is_read': n.is_read, 'timestamp': n.timestamp} for n in
                          notifications]
    return jsonify(notifications_data)


if __name__ == '__main__':
    app.run()
