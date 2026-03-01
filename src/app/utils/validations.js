export const validateNIF = (nif) => {
  if (!nif) return { valid: false, error: "El NIF/CIF es obligatorio" };
  
  const cleanNIF = nif.trim().toUpperCase();
  
  if (cleanNIF.length < 8 || cleanNIF.length > 9) {
    return { valid: false, error: "El NIF/CIF debe tener entre 8 y 9 caracteres" };
  }
  
  if (cleanNIF.length > 20) {
    return { valid: false, error: "El NIF/CIF es demasiado largo (máximo 20 caracteres)" };
  }
  
  const patterns = {
    nif: /^[0-9]{8}[A-Z]$/,
    nie: /^[XYZ][0-9]{7}[A-Z]$/,
    cif: /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/
  };
  
  const isNIF = patterns.nif.test(cleanNIF);
  const isNIE = patterns.nie.test(cleanNIF);
  const isCIF = patterns.cif.test(cleanNIF);
  
  if (!isNIF && !isNIE && !isCIF) {
    return { 
      valid: false, 
      error: "Formato no válido. Debe ser: DNI (12345678A), NIE (X1234567A) o CIF (A12345678)" 
    };
  }
  
  if (isNIF) {
    const dni = cleanNIF.substring(0, 8);
    const letter = cleanNIF.substring(8, 9);
    const validLetters = "TRWAGMYFPDXBNJZSQVHLCKE";
    const expectedLetter = validLetters[parseInt(dni) % 23];
    
    if (letter !== expectedLetter) {
      return { valid: false, error: "La letra del DNI no es correcta" };
    }
  }
  
  if (isNIE) {
    let nieNumber = cleanNIF.substring(1, 8);
    const letter = cleanNIF.substring(8, 9);
    const firstChar = cleanNIF.substring(0, 1);
    
    if (firstChar === 'X') nieNumber = '0' + nieNumber.substring(1);
    else if (firstChar === 'Y') nieNumber = '1' + nieNumber.substring(1);
    else if (firstChar === 'Z') nieNumber = '2' + nieNumber.substring(1);
    
    const validLetters = "TRWAGMYFPDXBNJZSQVHLCKE";
    const expectedLetter = validLetters[parseInt(nieNumber) % 23];
    
    if (letter !== expectedLetter) {
      return { valid: false, error: "La letra del NIE no es correcta" };
    }
  }
  
  return { valid: true, formatted: cleanNIF };
};

export const validateEmail = (email) => {
  if (!email || email.trim().length === 0) {
    return { valid: true, formatted: '' };
  }
  
  const cleanEmail = email.trim().toLowerCase();
  
  if (cleanEmail.length > 255) {
    return { valid: false, error: "El email es demasiado largo (máximo 255 caracteres)" };
  }
  
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailPattern.test(cleanEmail)) {
    return { valid: false, error: "El formato del email no es válido (ejemplo: usuario@dominio.com)" };
  }
  
  const parts = cleanEmail.split('@');
  if (parts.length !== 2) {
    return { valid: false, error: "El email debe contener exactamente un símbolo @" };
  }
  
  const [localPart, domain] = parts;
  
  if (localPart.length === 0) {
    return { valid: false, error: "El email debe tener texto antes del símbolo @" };
  }
  
  if (localPart.length > 64) {
    return { valid: false, error: "La parte local del email es demasiado larga" };
  }
  
  if (domain.length === 0) {
    return { valid: false, error: "El email debe tener un dominio después del símbolo @" };
  }
  
  if (domain.length > 253) {
    return { valid: false, error: "El dominio del email es demasiado largo" };
  }
  
  if (!domain.includes('.')) {
    return { valid: false, error: "El dominio debe contener al menos un punto (ejemplo: gmail.com)" };
  }
  
  if (domain.startsWith('.') || domain.endsWith('.') || domain.startsWith('-') || domain.endsWith('-')) {
    return { valid: false, error: "El dominio no puede empezar o terminar con punto o guión" };
  }
  
  const domainParts = domain.split('.');
  const extension = domainParts[domainParts.length - 1];
  if (extension.length < 2) {
    return { valid: false, error: "La extensión del dominio debe tener al menos 2 caracteres" };
  }
  
  return { valid: true, formatted: cleanEmail };
};

export const validateProveedorForm = (formData, proveedoresList, editingId = null) => {
  const errors = {};

  if (!formData.nombre || formData.nombre.trim().length === 0) {
    errors.nombre = "El nombre es obligatorio";
  } else if (formData.nombre.trim().length > 100) {
    errors.nombre = "El nombre es demasiado largo (máximo 100 caracteres)";
  }

  if (!formData.nif || formData.nif.trim().length === 0) {
    errors.nif = "El NIF/CIF es obligatorio";
  } else {
    const nifValidation = validateNIF(formData.nif);
    if (!nifValidation.valid) {
      errors.nif = nifValidation.error;
    } else {
      const nifExists = proveedoresList.some(p => 
        p.NIF && p.NIF.toUpperCase() === nifValidation.formatted && 
        p.idProveedor !== editingId
      );
      if (nifExists) {
        errors.nif = "Ya existe un proveedor con este NIF/CIF";
      }
    }
  }

  if (formData.email && formData.email.trim().length > 0) {
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      errors.email = emailValidation.error;
    } else {
      const emailExists = proveedoresList.some(p => 
        p.Email && p.Email.toLowerCase() === emailValidation.formatted && 
        p.idProveedor !== editingId
      );
      if (emailExists) {
        errors.email = "Ya existe un proveedor con este email";
      }
    }
  }

  if (!formData.departamento || formData.departamento.trim().length === 0) {
    errors.departamento = "El departamento es obligatorio";
  }

  if (formData.direccion && formData.direccion.length > 200) {
    errors.direccion = "La dirección es demasiado larga (máximo 200 caracteres)";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
