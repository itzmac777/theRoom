# theRoom

🔗 **Live Demo:** https://theroom-production.up.railway.app/

Secure, temporary file-sharing platform with ephemeral rooms.

## Features
- Password-protected rooms with custom expiration timers
- Real-time file sharing via WebSockets
- Late joiners can access previously shared files
- Automatic cleanup when rooms expire
- Mobile responsive

## Tech Stack
Node.js, Express, Socket.IO, EJS, SHA-256 hashing

## Use Case
Share files temporarily across devices without cloud storage or login.

## Things I learned
- How socket works
- How HTTP header is upgraded for seamless connection with server
- How to share small file directly using js-express

## Challenges I faced
- Worked on socket io for the first time, thus needed to read lots of docs
- Room id had to be deterministic so other people can join using same room id and password. Also i dont wanted to use DB for this simple task.
- Emitting timer was emitting time even after someone leaves particular room, soaked quite a lot time to find which turned out to be clousure bug:)

## My future plan
This was a problem i actually faced in real life, i am determined making v2 but later sometime

## V2(Goal)
- Encrypted data
- Better room expiry logic
- Room types
- User roles
- One time file share
