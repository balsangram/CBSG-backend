import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Invalid file type"));
  }

  cb(null, true);
};

const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const imageFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error("Photo must be a jpeg, png, or webp image");
    error.statusCode = 400;
    return cb(error);
  }

  cb(null, true);
};

const imageUpload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

const customerFileFilter = (req, file, cb) => {
  const imageTypes = ["image/jpeg", "image/png", "image/webp"];
  const documentTypes = [...imageTypes, "application/pdf"];
  const allowed = file.fieldname === "photo" ? imageTypes : documentTypes;

  if (!allowed.includes(file.mimetype)) {
    const error = new Error(
      file.fieldname === "photo"
        ? "Photo must be a jpeg, png, or webp image"
        : "Aadhaar and PAN must be a jpeg, png, webp, or pdf file"
    );
    error.statusCode = 400;
    return cb(error);
  }

  cb(null, true);
};

const customerUpload = multer({
  storage,
  fileFilter: customerFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export { customerUpload, imageUpload };
export default uploadMiddleware;