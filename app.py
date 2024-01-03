import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from Entities.entities import AccessLog, db, User, Lab, LabBooking, LabAvailability, Notification
from werkzeug.utils import secure_filename
from datetime import datetime, time, timedelta

app = Flask(__name__)
CORS(app, supports_credentials=True)
# logging.basicConfig(filename='app.log', level=logging.DEBUG)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:DavidEbula1999@localhost:3306/LaboratoryManagement'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your-secret-key'

db.init_app(app)

with app.app_context():
    db.create_all()

jwt = JWTManager(app)


@app.route('/login', methods=['POST'])
def login():
    global logged_in_users
    try:
        data = request.get_json()
        email = data['email']
        password = data['password']
        user = User.query.filter_by(email=email, password=password).first()

        if user:
            access_token = create_access_token(identity=user.id)
            user_type = user.role
            user_email = user.email
            logged_in_users = [{'user_id': user.id ,'user_email': user_email}]
            return jsonify({'message': 'Login successful.', 'access_token': access_token,"user_type":user_type,"email":user_email}), 200
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

        # Input validation
        if not (booking_date and start_time and end_time and purpose):
            return jsonify({'message': 'Invalid input data'}), 400
         
        lab = db.session.query(Lab).get(lab_id)

        if not lab:
            return jsonify({'message': 'Lab not found'}), 404


        existing_booking = LabBooking.query.filter_by(lab_id=lab_id,user_id=user_id).first()
        user_bookings = LabBooking.query.filter(LabBooking.user_id == user_id).all()

        if existing_booking and existing_booking.purpose == "full_booking":
            lab.current_capacity = lab.capacity
            return jsonify({'message': 'Lab is currently not available'}), 400
        
        # Convert strings to datetime.time objects
        start_time_obj = datetime.strptime(start_time, '%H:%M').time()
        end_time_obj = datetime.strptime(end_time, '%H:%M').time()

        for booking in user_bookings:
            booking_start_time = booking.start_time
            booking_end_time = booking.end_time

            if (
                (start_time_obj >= booking_start_time and start_time_obj <= booking_end_time) or
                (end_time_obj >= booking_start_time and end_time_obj <= booking_end_time) or
                (start_time_obj <= booking_start_time and end_time_obj >= booking_end_time)
            ):
                return jsonify({'message': 'You have booked a lab in the same interval of time'})

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
        upload_folder = 'C:/Users/Lenovo/Documents/projects/lab-management-app/LabManagement/src/assets/images/profile'
        file.save(os.path.join(upload_folder, filename))
        return filename  # Return the saved filename


@app.route('/register', methods=['POST'])
def create_user():
    try:
        # Retrieve JSON data
        json_data = request.get_json()
        username = json_data.get('username')
        print("username",username)
        email = json_data.get('email')
        password = json_data.get('password')
        first_name = json_data.get('firstname')
        last_name = json_data.get('lastname')
        role = json_data.get('role')

        # Retrieve file (profile_picture)
        profile_picture = request.files.get('profile_picture')
        print("profile_picture",profile_picture)

        if "@tut4life.ac.za" in email:
            # Check if the username already exists
            # (Assuming you have a User model with SQLAlchemy)

            existing_user = User.query.filter_by(username=username).first()
            if existing_user:
                return jsonify({'message': 'Username already exists'}), 400

            # Save the profile picture and get the saved filename
            profile_picture_filename = save_profile_picture(profile_picture)
            print("Profile Picture Filename:", profile_picture_filename)

            # Create a new user
            new_user = User(
                username=username,
                password=password,
                role=role,
                first_name=first_name,
                last_name=last_name,
                email=email,
                profile_picture=profile_picture_filename
            )

            db.session.add(new_user)
            db.session.commit()

        else:
            return jsonify({'message': 'Incorrect Email Address. A TUT Email is required to Register'}), 400

        return jsonify({'message': 'User created successfully'}), 201

    except Exception as e:
        return jsonify({'error': 'An internal server error occurred'}), 500


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
def get_all_labs():
    labs = Lab.query.all()
    lab_list = []

    for user_info in logged_in_users:
        user_id = user_info['user_id']
        print(f"User ID {user_id} found in the list.")

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
                'current_capacity': lab.current_capacity,
                'description': lab.description,
                'status': lab.status,
                'user_id': user_id
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

 
@app.route('/getAvailability', methods=['GET'])
def get_lab_availabilities():
    availabilities = LabAvailability.query.all()
    lab_availabilities = []

    for availability in availabilities:
        existing_lab = Lab.query.filter_by(id=availability.lab_id).first()

        if existing_lab and existing_lab.status == "opened":
            is_available = 1
        else:
            is_available = 0

        lab_availability = {
            'lab_id': availability.lab_id,
            'lab_name': existing_lab.lab_name,
            'available_from': availability.available_from,
            'available_to': availability.available_to,
            'is_available': is_available, 
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
            'password': user.password,
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


@app.route('/bookingHistory/<int:user_id>/<string:user_email>', methods=['GET'])
def booking_history(user_id, user_email):

    for user_info in logged_in_users:
        user_id1 = user_info['user_id']
        user_email1 = user_info['user_email']

        if user_id == user_id1 and user_email == user_email1:
            lab_bookings = LabBooking.query.filter_by(user_id=user_id).all()

            bookings_list = []

            for lab_booking in lab_bookings:
                lab_id = lab_booking.lab_id
                lab = Lab.query.filter_by(id=lab_id).first()
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


@app.route('/notifications/<int:user_id>', methods=['GET'])
def get_notifications(user_id):
    notifications = Notification.query.filter_by(user_id=user_id).all()
    # Convert notifications to a list of dictionaries
    notifications_data = [{'id': n.id, 'content': n.content, 'is_read': n.is_read, 'timestamp': n.timestamp} for n in
                          notifications]
    return jsonify(notifications_data)


@app.route('/bookingConfirmation', methods=['POST'])
def booking_confirmation():
    data = request.json

    # Extract data from the request
    user_id = data.get('user_id')
    booking_id = data.get('booking_id')
    confirmation_status = data.get('confirmation_status')

    if user_id and booking_id and confirmation_status in ['yes', 'no']:
        # Log the confirmation or rejection in the AccessLog table
        action = f"Booking {confirmation_status.capitalize()} Confirmation"
        description = f"User {user_id} {confirmation_status} confirmed the booking with ID {booking_id}"
        access_log_entry = AccessLog(user_id=user_id, action=action, description=description)
        db.session.add(access_log_entry)

        db.session.commit()

        return jsonify({'message': f'Booking {confirmation_status.capitalize()} confirmed successfully'}), 200
    else:
        return jsonify({'error': 'Invalid request data'}), 400
    

@app.route('/access-logs', methods=['GET'])
def get_access_logs():
    try:
        # Query all access logs from the database
        access_logs = AccessLog.query.all()

        # Convert access logs to a list of dictionaries
        access_logs_data = [
            {'id': log.id, 'user_id': log.user_id, 'action': log.action, 'description': log.description, 'timestamp': log.timestamp}
            for log in access_logs
        ]

        return jsonify(access_logs_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/reservations', methods=['GET'])
def get_all_reservations():
    try:
        # Query all reservations from the LabBooking table
        reservations = LabBooking.query.all()

        # Convert reservations to a list of dictionaries
        reservations_data = [
            {
                'id': booking.id,
                'lab_id': booking.lab_id,
                'user_id': booking.user_id,
                'booking_date': booking.booking_date.strftime('%Y-%m-%d'),
                'start_time': booking.start_time.strftime('%H:%M:%S'),
                'end_time': booking.end_time.strftime('%H:%M:%S'),
                'purpose': booking.purpose
            }
            for booking in reservations
        ]

        return jsonify(reservations_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
