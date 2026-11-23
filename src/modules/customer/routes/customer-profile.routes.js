    router.get("/", getProfile);
    router.post("/", createProfile);
    router.patch("/:id", updateProfile);
    router.delete("/:id", deleteProfile);

    export default customerProfileRoutes;