function validateRequiredFields(body, requiredFields) {
    const missingFields = [];

    for (const [key, value] of Object.entries(requiredFields)) {
        if (!body[key]) {
            missingFields.push(value);
        }
    }

    if (missingFields.length > 0) {
        return `Please provide the following fields: ${missingFields.join(', ')}`;
    }
    
    return null;
}

module.exports = validateRequiredFields