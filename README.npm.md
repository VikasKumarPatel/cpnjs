# cpnjs

**cpnjs** is a Node.js module that allows JavaScript applications to communicate with [CPN Tools](https://cpntools.org) over TCP using the same protocol as the `Comms/Java` interface. It enables direct interaction between a CPN model and a Node.js backend, allowing for event-driven simulation, automated control, real-time data logging, or integration with web interfaces.

---

## ✨ Features

- Compatible with CPN Tools' `acceptConnection`, `send`, and `receive` ML functions
- Uses the chunked socket protocol described in CPN Tools docs
- Supports both client (`connect`) and server (`accept`) roles
- Simple `send`/`receive` interface using async/await
- Built-in `encode()` and `decode()` methods for message transformation
- Lightweight and dependency-free

---

## 📦 Installation

```bash
npm install cpnjs
````

---

## 🛠️ Basic Usage

```js
const CPN = require('cpnjs');
const cpn = new CPN();

(async () => {
  await cpn.connect('127.0.0.1', 9000); // Connect to CPN Tools
  cpn.send('Hello from JavaScript!', true); // Send a string encoded as UTF-8
  const reply = await cpn.receive(true); // Receive and decode
  console.log('Received:', reply);
  cpn.disconnect();
})();
```

---

## 📚 API

### `connect(host: string, port: number): Promise<void>`

Connect to a CPN Tools model acting as a server (e.g., using `acceptConnection`).

---

### `accept(port: number): Promise<void>`

Wait for CPN Tools to connect to your JavaScript process. Useful when using `connect` in ML.

---

### `send(data: Buffer | string, encode = false): void`

Sends a message in chunks:

* Use `encode = true` to send a string as UTF-8
* Or pass a `Buffer` directly

---

### `receive(decode = false): Promise<Buffer | string>`

Receives chunked message data.

* Use `decode = true` to get a UTF-8 string.

---

### `encode(data: string): Buffer`

Manually encode a string into a UTF-8 buffer.

---

### `decode(buffer: Buffer): string`

Manually decode a buffer back into a string.

---

### `disconnect(): void`

Closes the socket connection.

---

## 💡 Advanced Example (Server Mode)

```js
const CPN = require('cpnjs');
const cpn = new CPN();

(async () => {
  await cpn.accept(9000); // Wait for CPN Tools to connect
  console.log('Connected to CPN Tools');

  const msg = await cpn.receive(true);
  console.log('Received from model:', msg);

  cpn.send('Thanks, CPN!', true);
  cpn.disconnect();
})();
```

---
## 🎥 Demo

A sample video `cpnjs.mp4` demonstrates real-time interaction between Node.js and a CPN Tools Dining Philosophers model.

👉 Check the full video in the [GitHub repository](https://github.com/VikasKumarPatel/cpnjs)

The video above shows a Colored Petri Net implementation of the **Dining Philosophers Problem** modeled in CPN Tools.

* The net uses `acceptConnection("Conn 1",9000)` to accept socket input from a client (like your Node.js app).
* Transitions like `send_to_applet(PH.mkstr(p),"think")` simulate messages sent to external programs.
* You can communicate with this net in real-time using the `cpnjs` library.

This net demonstrates:

* Fork acquisition and release (`GotLeft`, `GotRight`, `PutDown`)
* Philosopher states (`Think`, `Eat`)
* Deadlock detection (`Left Deadlock`, `Right Deadlock`)
* Message-based interaction with external software

## 🙋‍♂️ Author

Developed by **Vikas Kumar Patel**

- 🔗 [YouTube](https://www.youtube.com/@CyberGuardianl)
- 🧑‍🔬 [Google Scholar](https://scholar.google.com/citations?user=xANeHIkAAAAJ)
- 📷 [Instagram](https://instagram.com/haccrac)
- 💼 [LinkedIn](https://www.linkedin.com/in/vikaskumarpatel1080)
- 💬 [Stack Overflow](https://stackoverflow.com/users/19362963/vikas-kumar-patel)
- 🛠️ [GitHub](https://github.com/vikasKumarPatel)

If you find this project helpful, consider giving it a ⭐ on GitHub and subscribing on YouTube!
