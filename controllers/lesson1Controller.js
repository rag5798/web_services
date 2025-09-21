const RobertRoute = (req, res) => {
    res.send('Hello, Robert Goettman')
};

const MaddyRoute = (req, res) => {
    res.send('Hello, Madison Goettman')
};

module.exports = {
    RobertRoute,
    MaddyRoute
}