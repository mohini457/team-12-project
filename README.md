# WEB_TEST_EndTerm


--------------------------GROUP INFORMATION-----------------------------
Group-12

Members:
1. Mohini Bharti (2315001373)
2. Arya Pratap Singh (2315000454)
3. Akshat Kumar (2315000205)
4. Madhav (2315001277)
5. Pushkar Varshney(2315001732)

-------------------------------OUR PROJECT------------------------------
12. Parking Slot Availability Checker  
1. Background  
Urban areas face severe parking challenges due to high vehicle density and limited parking 
spaces. Drivers often spend a significant amount of time searching for vacant slots, causing 
traffic congestion, fuel wastage, and frustration. Current solutions are either static  
(signboards) or not integrated in real time, leaving drivers unaware of actual availability.  
Your challenge is to design a smart, real-time Parking Slot Availability Checker that helps 
drivers find parking spaces efficiently while enabling parking facility managers to monitor 
occupancy dynamically.  
2. Challenge  
Design and build a full-stack application that provides real-time parking slot availability 
information to drivers and enables parking facility managers to update and manage slots 
dynamically. The system must handle live updates, location-based searches, notifications, 
and integration with GPS navigation for seamless user experience.  
3. User Roles & Flow  
Driver  
● Opens the app to search for parking slots near a specific location.  
● Views a real-time map/list of available parking spaces.  
● Filters by type (covered, open-air, EV charging, handicap accessible).  
● Receives directions via GPS to the selected parking slot.  
● Books/reserves a slot if supported.  
● Receives notifications if a reserved slot becomes unavailable or time is expiring.  
Parking Facility Manager  
● Registers parking lot with total capacity and slot types.  
● Updates slot availability manually or via IoT sensors.  
● Sets pricing, time limits, and special offers.  
● Monitors real-time occupancy dashboards.  
● Generates reports on usage, peak hours, and revenue.  
Admin  
● Manages drivers and facility managers.  
● Handles platform-wide settings, verification, and dispute resolution.  
● Monitors system health and analytics.  
4. Core Requirements  
Functional  
● Real-Time Slot Availability: Instant updates when a slot is occupied or freed.  
● Search & Filter: By location, slot type, price, and distance.  
● Booking/Reservation System: Optional slot reservation with timers.  
● Map Integration: Display parking lots on Google Maps/Mapbox.  
● Notifications: Slot availability alerts, booking confirmations, time expiry reminders.  
● Occupancy Dashboard: Real-time visualization for managers.  
● Payment Integration: Optional online payment for reserved slots.  
Non-Functional  
● Scalability: Handle multiple locations, thousands of slots, and concurrent users.  
● Low Latency: Updates within 2–3 seconds.  
● Security & Privacy: Secure login, data encryption, and payment safety (PCI-DSS).  
● Cross-Platform: Mobile-responsive web app or native mobile apps. ● Reliability: 
Graceful handling of sensor failure or network issues.  
5. Technical Hints (Teams may choose their own 
stack)  
● Frontend: React, Vue, Angular, Flutter  
● Backend: Node.js/Express, Django, or Go with WebSocket support  
● Database: PostgreSQL/MySQL for user and booking data; Redis for caching real
time availability  
● Maps & Navigation: Google Maps API, Mapbox  
● IoT Integration: Optional sensor-based real-time slot updates  
● Notifications: Firebase Cloud Messaging (FCM) or Twilio  
● Cloud/Infra: AWS, GCP, or Firebase for hosting and scaling  
6. Hackathon Deliverables  
● Working Prototype:  
○ Driver app/interface showing real-time parking availability  
○ Parking manager dashboard to update and monitor slots ○ 
Booking/reservation workflow (optional)  
● Technical Documentation:  
○ Architecture diagram  
○ API documentation  
○ Database schema  
○ Real-time communication flow  
● Demo & Pitch: 5–7 minute live demonstration showing end-to-end experience  
7. Judging Criteria  
Category   
User Experience & Interface  
Real-Time Accuracy & Performance  
Scalability & Architecture  
Completeness of Features  
Innovation (smart filters, reservations, 
analytics)  
Weight  
25%  
25%  
20%  
20%  
10%  
8. Outcome  
A next-gen parking solution that reduces search time, eases urban traffic congestion, and 
provides facility managers with actionable insights. The platform improves driver experience 
and optimizes parking lot utilization through a real-time, full-stack system.


--------------------------------FLOW-------------------------------------

1. Requirement Analysis

Identify core features for MVP (Minimum Viable Product):

Real-time parking availability

Search & filter

Map display

Manager dashboard

Booking/reservation (optional)

Decide on optional features if time permits:

Payment integration

Notifications

Analytics reports

2. Technology & Stack Setup

Frontend: React (Web)

Backend: Node.js + Express

Database: PostgreSQL/MySQL for users and bookings, Redis for caching availability

Real-time updates: WebSocket (Socket.io)

Map & Navigation: Google Maps API or Mapbox

Notifications: Firebase Cloud Messaging or Twilio

Deployment/Cloud: Firebase Hosting, AWS, or Heroku

3. Database Design
Tables:

Users – Driver and Manager accounts

id, name, email, password, role, etc.

ParkingLots – Each parking facility

id, manager_id, name, location, total_slots, pricing, etc.

ParkingSlots – Individual slots in a lot

id, lot_id, type, status (occupied/free), reservation_id, etc.

Bookings – Driver reservations

id, user_id, slot_id, start_time, end_time, status, payment_status

Notifications (optional)

id, user_id, message, status, timestamp

Diagram: Create an ER diagram linking Users → ParkingLots → ParkingSlots → Bookings.

4. Backend Development

Setup Express server

Create REST APIs:

/auth/register → Register driver/manager

/auth/login → Login with JWT

/parking-lots → CRUD parking lots (manager)

/parking-slots → List slots, update availability

/bookings → Book/reserve slot, cancel booking

Integrate WebSocket (Socket.io) for real-time updates

Emit slot status changes to all connected drivers

Connect database and Redis cache for quick availability updates

Optional: Integrate payment gateway (Stripe/PayPal)

5. Frontend Development

Setup React project with routing

Create pages/components:

Login/Register page

Driver dashboard: Map + search/filter + booking

Manager dashboard: Slot management + occupancy visualization

Booking confirmation modal

Integrate Google Maps API / Mapbox for live parking visualization

Connect frontend with backend APIs

Implement real-time updates via WebSocket

Optional: Push notifications (FCM/Twilio)

6. Real-Time Slot Updates

Use WebSocket to notify connected clients whenever a slot is occupied or freed

If using IoT sensors: create an API endpoint to update slot status automatically

Update both Redis cache and database for persistence

7. Optional Features

Slot reservation timer with countdown

Payment integration for reservations

Email/SMS notifications for booking status

Analytics: peak hours, revenue reports, occupancy trends

8. Testing

Unit Testing for backend APIs (Jest or Mocha)

Integration Testing for full workflow (booking, search, notifications)

Frontend testing: React Testing Library / Cypress

Real-time tests: Simulate multiple users to check WebSocket updates

9. Deployment

Backend: Heroku, AWS, or GCP

Frontend: Firebase Hosting or Netlify

Ensure HTTPS and secure API endpoints

Use environment variables for sensitive info (API keys, DB credentials)

10. Documentation & README

Architecture diagram

Database schema

API endpoints

Frontend structure and components

Demo screenshots or GIFs