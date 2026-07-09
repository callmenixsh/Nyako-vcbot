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

async function safeEditInteraction(interaction, data, onExpire = null) {
    try {
        await interaction.editReply(data);
        return true;
    } catch (err) {
        if (err.code === 10062 || err.code === 40060) {
            if (onExpire) onExpire();
            return false;
        }
        throw err;
    }
}

module.exports = { safeEdit, safeEditInteraction };