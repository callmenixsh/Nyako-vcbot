async function safeEdit(message, data, onDelete = null) {
    try {
        await message.edit(data);
        return true;
    } catch (err) {
        if (err.code === 10008) {
            if (onDelete) onDelete();
            return false;
        }
        throw err;
    }
}

module.exports = { safeEdit };