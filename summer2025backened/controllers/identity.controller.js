import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

export const verifyIdentity = async (req, res) => {
  try {
    const { document, live } = req.files;

    const form = new FormData();
    form.append('document_image', fs.createReadStream(document[0].path));
    form.append('live_image', fs.createReadStream(live[0].path));

    const flaskResponse = await axios.post('http://localhost:5000/verify', form, {
      headers: form.getHeaders()
    });

    // Clean temp uploads
    fs.unlinkSync(document[0].path);
    fs.unlinkSync(live[0].path);

    res.json(flaskResponse.data);
  } catch (err) {
    console.error('Verification error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
