const authenticateAdmin = async (req, res, next) => {
  const email = req.user.email;
  const userFound = await User.findOne({ email });
  if (!userFound) {
    return res.status(404).json({ message: "No admin found for that email" });
  }
  const isAdmin = userFound.role === "admin";
  if (!isAdmin) {
    return res
      .status(403)
      .json({ message: "You are not admin , you cant access this page" });
  }
  next();
};

module.exports = authenticateAdmin;
