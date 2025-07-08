import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export const verifyIdentity = async (req, res) => {
  try {
    const { document_image, live_image } = req.files;

    
    if (!document_image || !live_image) {
      return res.status(400).json({
        success: false,
        message: 'Both document_image and live_image are required',
      });
    }

    
    const form = new FormData();
    form.append('document_image', fs.createReadStream(document_image[0].path));
    form.append('live_image', fs.createReadStream(live_image[0].path));

    
    const flaskResponse = await axios.post('http://localhost:5000/verify', form, {
      headers: {
        ...form.getHeaders(),
      },
      maxBodyLength: Infinity, 
    });

    
    fs.unlinkSync(document_image[0].path);
    fs.unlinkSync(live_image[0].path);
    res.json(flaskResponse.data);

  } catch (err) {
    console.error('Verification error:', err);
    
    
    try {
      if (req.files?.document_image?.[0]?.path) fs.unlinkSync(req.files.document_image[0].path);
      if (req.files?.live_image?.[0]?.path) fs.unlinkSync(req.files.live_image[0].path);
    } catch (_) {}

    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err?.response?.data || err.message
    });
  }
};
