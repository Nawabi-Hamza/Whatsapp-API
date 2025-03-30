const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json()); // Middleware to parse JSON

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(), // Ensures you don't need to scan QR every time
    puppeteer: {
        headless: true, // Run without opening Chrome UI
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' // Update this if needed
    }
});

// Generate QR Code
client.on('qr', (qr) => {
    console.log('Scan this QR code to connect:');
    qrcode.generate(qr, { small: true });
});

// WhatsApp client is ready
client.on('ready', async () => {
    console.log('WhatsApp Web is ready!');

    // Get all contacts
    const contacts = await client.getContacts();

    // Filter only valid WhatsApp contacts
    const whatsappContacts = contacts
        .filter(contact => contact.isWAContact && contact.id.server === 'c.us')
        .map(contact => ({
            name: contact.pushname || contact.name || 'Unknown', // Get name or 'Unknown' if not available
            number: contact.id.user // Get phone number
        }));

    console.log('WhatsApp Contacts:', whatsappContacts);
});


// API Route to Send Messages
app.post('/send-message', async (req, res) => {
    const { numbers, message } = req.body;

    if (!numbers || !message) {
        return res.status(400).json({ success: false, message: "Numbers and message are required" });
    }

    try {
        await Promise.all(
            numbers.map(number => client.sendMessage(`${number}@c.us`, message))
        );

        return res.status(200).json({ success: true, message: "Message sent to all numbers!" });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// Start the Server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

// Initialize WhatsApp client
client.initialize();
