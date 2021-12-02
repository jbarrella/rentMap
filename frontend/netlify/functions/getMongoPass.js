exports.handler = async function (event, context) {
    return { pass: process.env.MONGO_PASS }
};
