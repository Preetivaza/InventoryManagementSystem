import path from 'path';
import express from 'express';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'backend/uploads/'); // Ensure this path exists relative to root or handle absolute
        // Note: If running from root, 'backend/uploads/' is correct.
        // If running from backend folder, 'uploads/' is correct.
        // Since we use 'concurrently "npm run dev --prefix backend"', the process runs in backend dir.
        // So 'uploads/' is likely correct if CWD is backend.
        // Let's use absolute path or relative to CWD.
        // CWD is typically set by the script.
        // I'll try 'uploads/' first.
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

router.post('/', upload.single('image'), (req, res) => {
    res.send(`/${req.file.path}`);
});

export default router;
