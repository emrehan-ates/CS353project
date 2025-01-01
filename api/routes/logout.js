let express = require('express');
let router = express.Router();

logout = (req, res) => {
    console.log(req.session);
    req.session.destroy();
    console.log(req.session);
    res.send("Logged out");
}

router.get('/logout', logout);
module.exports = router;