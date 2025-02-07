const { PrismaClient } = require('@prisma/logging-client');

const db = new PrismaClient();

module.exports = { db };