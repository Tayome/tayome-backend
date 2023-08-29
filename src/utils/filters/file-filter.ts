export const fileFilter = (req: any, file: any, callback: any) => {
    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  
    if (allowedFileTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Invalid file type'), false);
    }
};
  
