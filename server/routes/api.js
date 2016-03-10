var express = require('express');

app.use('/api', mongo);
app.use('/file', gridFs);
app.use('/login', user);


module.exports = router;