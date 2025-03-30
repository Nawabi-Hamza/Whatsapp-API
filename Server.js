const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(), // Ensures you don't need to scan QR every time
    puppeteer: {
        headless: true, // Run without opening Chrome UI
        executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' // Update this if needed
    }
});

const fs = require('fs');

// Remove previous session
const sessionPath = './.wwebjs_auth';
if (fs.existsSync(sessionPath)) {
    fs.rmSync(sessionPath, { recursive: true, force: true });
    console.log('Old session deleted.');
}


// Generate QR Code
client.on('qr', (qr) => {
    console.log('Scan this QR code to connect:');
    qrcode.generate(qr, { small: true });
});

// WhatsApp client is ready
client.on('ready', async () => {
    console.log('WhatsApp Web is ready!');

    // Define your Eid message
    const eidMessage = `سلام و عیدتان مبارک! 🌙✨

امیدوارم این عید برایتان سرشار از خوشی، آرامش و برکت باشد. دعا می‌کنم که خداوند در این روزهای پربرکت، قلب‌هایتان را از محبت، زندگی‌هایتان را از آرامش و روزگارتان را از خوشبختی سرشار گرداند. باشد که همیشه در پناه رحمت الهی، سلامت و موفق باشید.

**عیدتان مبارک!** 💐🎉

**با احترام، حمزه نوابی**`;

    try {
        // Get all WhatsApp contacts
        const contacts = await client.getContacts();

        // Filter only valid WhatsApp contacts
        const whatsappContacts = contacts
            .filter(contact => contact.isWAContact && contact.id.server === 'c.us')
            .map(contact => contact.id._serialized); // Convert to WhatsApp ID format

        console.log(`Found ${whatsappContacts.length} WhatsApp contacts.`);

        // Send message to each contact
        for (const contact of whatsappContacts) {
            try {
                await client.sendMessage(contact, eidMessage);
                console.log(`Message sent to: ${contact}`);
            } catch (error) {
                console.error(`Failed to send message to ${contact}:`, error.message);
            }
        }
    } catch (error) {
        console.error("Error fetching contacts:", error.message);
    }
});

// Start Express server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});

// Initialize WhatsApp client
client.initialize();
