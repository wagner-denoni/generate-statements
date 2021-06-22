const router = require('express').Router();
const auth = require('../auth');
const StatementsService = require('./../../services/StatementsService');

router.post("/", auth.optional, async (req, res) => {
    try {
        const { originalDocument, mutations } = req.body;
        const statementsService = new StatementsService();

        const statements = await statementsService.handle(originalDocument, mutations);

        res.json(statements);
    } catch (error) {
        res.status(500).json(error.message);
    }
});

module.exports = router;