const isAdmin = (userId) => {
    const adminIds = process.env.ADMIN_IDS.split(',');
    return adminIds.includes(userId);
};

module.exports = isAdmin;