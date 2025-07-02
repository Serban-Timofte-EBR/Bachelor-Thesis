const validateFiles = (uploadedFiles) => {
  const errors = [];
  const requiredFiles = ["protocol", "report", "rmn", "blood"];

  requiredFiles.forEach((fileType) => {
    if (!uploadedFiles[fileType]) {
      errors.push(
        `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} file is required`,
      );
    }

    // Optional: Add file type validation if needed
    if (uploadedFiles[fileType]) {
      const file = uploadedFiles[fileType];
      // Validate file type
      if (!file.type.match("application/pdf|image.*")) {
        errors.push(
          `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} must be a PDF or image file`,
        );
      }
      // Validate file size (e.g., max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        errors.push(
          `${fileType.charAt(0).toUpperCase() + fileType.slice(1)} must be less than 10MB`,
        );
      }
    }
  });

  return errors;
};

export default validateFiles;
