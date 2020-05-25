# serverPi
The project was presented for ICHack19, a 24 hours hacking competition. The largest student-run hackathon in the UK

Developed using NodeJs and React with:
* Alvaro Rausell Guiard
* Christine Husni
* Danilo Del Busso
* Mateusz Nowak

## REINVENTING CLOUD STORAGE AND COLLABORATION

The server is meant to run on a RaspberryPi, and allows the users running the client.js to share files between themselves without having to rely on external Cloud Storage services.
The server dynamically mounts and unmounts storage devices and shares them with authorised devices over LAN or, if in different networks, through HTTP tunnels.
A cheap way to have your own "Cloudless" Cloud Storage.

## HOW IT WORKS
to run server:
```
sudo node server.js
```
to run client:
```
sudo node client.js
```
### ⚠WARNING⚠
This build is highly unstable as it was developed in 24 hours.
Use at your own risk.

(Almost)
No front-end developers were hurt during the development process.
