const net = require('net');
const { Buffer } = require('buffer');

/**
 * cpnjs provides a TCP socket interface for communicating with CPN Tools
 * using the Comms/Java chunked protocol, implemented in JavaScript.
 *
 * @package cpnjs
 */
class CPN {
    constructor() {
        /** @type {net.Socket|null} */
        this.socket = null;

        /** @type {Buffer} */
        this.inputBuffer = Buffer.alloc(0);
    }

    /**
     * Connects to CPN Tools as a client from JavaScript.
     * @param {string} host - Hostname or IP address
     * @param {number} port - Port number
     * @returns {Promise<void>}
     */
    connect(host, port) {
        return new Promise((resolve, reject) => {
            this.socket = new net.Socket();
            this.socket.connect(port, host, () => resolve());

            this.socket.on('data', (data) => {
                this.inputBuffer = Buffer.concat([this.inputBuffer, data]);
            });

            this.socket.on('error', reject);
        });
    }

    /**
     * Accepts an incoming connection from CPN Tools.
     * @param {number} port - Port to listen on
     * @returns {Promise<void>}
     */
    accept(port) {
        return new Promise((resolve, reject) => {
            const server = net.createServer((socket) => {
                this.socket = socket;
                this.socket.on('data', (data) => {
                    this.inputBuffer = Buffer.concat([this.inputBuffer, data]);
                });
                server.close();
                resolve();
            });

            server.listen(port, (err) => {
                if (err) reject(err);
            });
        });
    }

    /**
     * Sends a message to CPN Tools using chunked format.
     * @param {Buffer|string} data - Message to send
     * @param {boolean} [encode=false] - Whether to encode string to Buffer
     * @returns {void}
     */
    send(data, encode = false) {
        const buffer = encode ? this.encode(data) : data;
        const CHUNK_SIZE = 127;

        let offset = 0;
        while (offset + CHUNK_SIZE < buffer.length) {
            const chunk = Buffer.alloc(128);
            chunk[0] = 255;
            buffer.copy(chunk, 1, offset, offset + CHUNK_SIZE);
            this.socket.write(chunk);
            offset += CHUNK_SIZE;
        }

        const remaining = buffer.length - offset;
        const finalPacket = Buffer.alloc(remaining + 1);
        finalPacket[0] = remaining;
        buffer.copy(finalPacket, 1, offset);
        this.socket.write(finalPacket);
    }

    /**
     * Receives a message from the connected socket.
     * @param {boolean} [decode=false] - If true, returns decoded UTF-8 string
     * @returns {Promise<Buffer|string>}
     */
    receive(decode = false) {
        return new Promise((resolve) => {
            const waitData = () => {
                if (this.inputBuffer.length === 0) {
                    setImmediate(waitData);
                    return;
                }

                const result = [];
                let offset = 0;

                while (offset < this.inputBuffer.length) {
                    const header = this.inputBuffer[offset];
                    const payloadSize = header >= 127 ? 127 : header;

                    if (this.inputBuffer.length < offset + 1 + payloadSize) break;

                    const payload = this.inputBuffer.slice(offset + 1, offset + 1 + payloadSize);
                    result.push(payload);
                    offset += 1 + payloadSize;

                    if (header <= 127) break;
                }

                if (offset > 0) this.inputBuffer = this.inputBuffer.slice(offset);
                const buffer = Buffer.concat(result);
                resolve(decode ? this.decode(buffer) : buffer);
            };

            waitData();
        });
    }

    /**
     * Encodes a string into a UTF-8 Buffer.
     * @param {string} data - String to encode
     * @returns {Buffer}
     *
     * @example
     * const encoded = cpn.encode('setmark("P", 2`(3,"X",0.0));');
     */
    encode(data) {
        return Buffer.from(data, 'utf-8');
    }

    /**
     * Decodes a UTF-8 Buffer into a string.
     * @param {Buffer} buffer - Buffer to decode
     * @returns {string}
     *
     * @example
     * const str = cpn.decode(receivedBuffer);
     */
    decode(buffer) {
        return buffer.toString('utf-8');
    }

    /**
     * Closes the socket connection.
     * @returns {void}
     */
    disconnect() {
        this.socket.end();
        this.socket.destroy();
    }
}

module.exports = CPN;
