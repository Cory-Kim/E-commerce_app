export default function (req, res, next) {
    res.setHeader(
        "Access-Control-Allow-Origin",
        "https://ecommerce-admin-fawn.vercel.app"
    );
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );
    next();
}
