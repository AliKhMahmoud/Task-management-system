const notFound = (req, res) => res.status(404).json({
    success: false,
    message: "not Found"
})

module.exports = notFound
